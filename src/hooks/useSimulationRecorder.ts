import { useState, useCallback, useRef, useEffect } from 'react';
import { useLaboratory } from '../context/LaboratoryContext';
import { DataColumn, DataRow, GraphConfig, PracticalCategory } from '../types/laboratory';

export interface AutoRunStep<TParams = any> {
  label: string;
  params: TParams;
  durationMs?: number; // Delay before capturing reading (default: 800ms)
}

export interface AutoRunConfig {
  steps: AutoRunStep<any>[];
  applyParams: (params: any) => void;
  onStart?: () => void;
  onStepComplete?: (stepIndex: number, total: number) => void;
  onComplete?: () => void;
}

interface UseSimulationRecorderOptions {
  simulationId: string;
  simulationTitle: string;
  category?: PracticalCategory;
  columns: DataColumn[];
  getCurrentRow: () => DataRow;
  getSeriesData?: () => DataRow[];
  autoRunConfig?: AutoRunConfig;
  defaultGraphConfig?: Partial<GraphConfig>;
  notes?: string;
}

// Helper to sanitize a DataRow to guarantee no circular/DOM/function references exist
function cleanDataRow(row: Record<string, any>): DataRow {
  if (!row || typeof row !== 'object') return {};
  const cleaned: DataRow = {};
  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      cleaned[key] = val;
    } else if (typeof val === 'number') {
      cleaned[key] = isFinite(val) ? val : 0;
    } else if (typeof val === 'string') {
      cleaned[key] = val;
    } else if (typeof val === 'boolean') {
      cleaned[key] = val ? 'true' : 'false';
    } else if (typeof val === 'object') {
      // If it's a plain primitive or date, convert to string
      if (val instanceof Date) {
        cleaned[key] = val.toISOString();
      } else {
        // Exclude complex nested or DOM objects
        cleaned[key] = String(val);
      }
    }
  }
  return cleaned;
}

// Helper to determine if two data rows are identical or nearly identical (deduplication)
function isDuplicateOrNearRow(rowA: DataRow, rowB: DataRow, epsilon: number = 1e-4): boolean {
  if (!rowA || !rowB) return false;
  const keysA = Object.keys(rowA).filter((k) => k !== 'trial');
  const keysB = Object.keys(rowB).filter((k) => k !== 'trial');
  if (keysA.length === 0 || keysB.length === 0) return false;

  for (const key of keysA) {
    const valA = rowA[key];
    const valB = rowB[key];

    if (valA === undefined && valB === undefined) continue;

    if (typeof valA === 'number' && typeof valB === 'number') {
      if (Math.abs(valA - valB) > epsilon) {
        return false; // Meaningful numerical difference
      }
    } else if (valA !== valB) {
      return false; // String/boolean difference
    }
  }
  return true; // Duplicate or near-identical
}

export function useSimulationRecorder({
  simulationId,
  simulationTitle,
  category = 'mechanics',
  columns,
  getCurrentRow,
  getSeriesData,
  autoRunConfig,
  defaultGraphConfig,
  notes = '',
}: UseSimulationRecorderOptions) {
  const { savePractical, quota } = useLaboratory();

  const [recordedRows, setRecordedRows] = useState<DataRow[]>([]);
  const [isAutoRecording, setIsAutoRecording] = useState<boolean>(false);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoRunProgress, setAutoRunProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const autoRecordIntervalRef = useRef<number | null>(null);
  const autoRunAbortControllerRef = useRef<boolean>(false);
  const autoRunTimeoutRef = useRef<number | null>(null);
  const getCurrentRowRef = useRef(getCurrentRow);
  getCurrentRowRef.current = getCurrentRow;

  const autoRunConfigRef = useRef(autoRunConfig);
  autoRunConfigRef.current = autoRunConfig;

  // 1. Record single current snapshot trial
  const recordTrial = useCallback(() => {
    const rawData = getCurrentRowRef.current();
    const currentData = cleanDataRow(rawData);
    let newRow: DataRow;
    setRecordedRows((prev) => {
      newRow = {
        trial: prev.length + 1,
        ...currentData,
      };
      return [...prev, newRow];
    });
    setStatusMessage(null);
    return {
      trial: recordedRows.length + 1,
      ...currentData,
    };
  }, [recordedRows.length]);

  // 2. Record multi-point data series (e.g. trajectory, time-series, or parameter sweep)
  const recordMultipleTrials = useCallback((rows: DataRow[]) => {
    if (!rows || rows.length === 0) return;
    const sanitizedRows = rows.map((r) => cleanDataRow(r));
    setRecordedRows((prev) => {
      const startIndex = prev.length;
      const formattedRows = sanitizedRows.map((r, i) => ({
        trial: r.trial !== undefined ? r.trial : startIndex + i + 1,
        ...r,
      }));
      return [...prev, ...formattedRows];
    });
    setStatusMessage({
      type: 'success',
      text: `Recorded ${rows.length} continuous data points into dataset.`,
    });
  }, []);

  // 3. Record full run / sweep if getSeriesData is provided, or sample across current run
  const recordFullRun = useCallback(() => {
    if (getSeriesData) {
      const series = getSeriesData();
      if (series && series.length > 0) {
        recordMultipleTrials(series);
        return series;
      }
    }
    // Fallback: capture current snapshot
    const single = recordTrial();
    return [single];
  }, [getSeriesData, recordMultipleTrials, recordTrial]);

  // 4. Live Auto-Recording toggle with deduplication / anti-repetition protection
  const stopAutoRecord = useCallback(() => {
    if (autoRecordIntervalRef.current !== null) {
      window.clearInterval(autoRecordIntervalRef.current);
      autoRecordIntervalRef.current = null;
    }
    setIsAutoRecording(false);
  }, []);

  const startAutoRecord = useCallback((intervalMs: number = 250) => {
    stopAutoRecord();
    setIsAutoRecording(true);
    setStatusMessage({
      type: 'success',
      text: 'Live auto-recording active. Data points will be captured continuously without duplicate points.',
    });

    // Record initial immediate point if distinct
    const initial = cleanDataRow(getCurrentRowRef.current());
    setRecordedRows((prev) => {
      const lastRow = prev[prev.length - 1];
      if (lastRow && isDuplicateOrNearRow(initial, lastRow)) {
        return prev;
      }
      return [...prev, { trial: prev.length + 1, ...initial }];
    });

    autoRecordIntervalRef.current = window.setInterval(() => {
      setRecordedRows((prev) => {
        if (prev.length >= 150) {
          // Cap to prevent memory degradation
          stopAutoRecord();
          return prev;
        }
        const rawData = getCurrentRowRef.current();
        const data = cleanDataRow(rawData);
        const lastRow = prev[prev.length - 1];

        // Deduplication: Ignore identical or near-identical stationary states
        if (lastRow && isDuplicateOrNearRow(data, lastRow)) {
          return prev;
        }

        return [...prev, { trial: prev.length + 1, ...data }];
      });
    }, intervalMs);
  }, [stopAutoRecord]);

  const toggleAutoRecord = useCallback((intervalMs: number = 250) => {
    if (isAutoRecording) {
      stopAutoRecord();
    } else {
      startAutoRecord(intervalMs);
    }
  }, [isAutoRecording, startAutoRecord, stopAutoRecord]);

  // 5. Autonomous Auto-Run Execution (Sequentially changes parameters and captures points)
  const cancelAutoRun = useCallback(() => {
    autoRunAbortControllerRef.current = true;
    if (autoRunTimeoutRef.current !== null) {
      window.clearTimeout(autoRunTimeoutRef.current);
      autoRunTimeoutRef.current = null;
    }
    setIsAutoRunning(false);
    setAutoRunProgress(null);
    setStatusMessage({
      type: 'error',
      text: 'Auto-run experiment cancelled by user.',
    });
  }, []);

  const startAutoRun = useCallback(async () => {
    const config = autoRunConfigRef.current;
    if (!config || !config.steps || config.steps.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No Auto-Run experiment configuration defined for this simulation.',
      });
      return;
    }

    stopAutoRecord();
    autoRunAbortControllerRef.current = false;
    setIsAutoRunning(true);
    setAutoRunProgress({
      current: 1,
      total: config.steps.length,
      label: config.steps[0].label || 'Starting Step 1',
    });
    setStatusMessage({
      type: 'success',
      text: `Auto-run started: Autonomous testing across ${config.steps.length} configurations...`,
    });

    if (config.onStart) {
      config.onStart();
    }

    const runNextStep = async (stepIdx: number) => {
      if (autoRunAbortControllerRef.current) return;

      if (stepIdx >= config.steps.length) {
        setIsAutoRunning(false);
        setAutoRunProgress(null);
        setStatusMessage({
          type: 'success',
          text: `Auto-run complete! ${config.steps.length} experimental configurations evaluated & logged.`,
        });
        if (config.onComplete) {
          config.onComplete();
        }
        return;
      }

      const step = config.steps[stepIdx];
      setAutoRunProgress({
        current: stepIdx + 1,
        total: config.steps.length,
        label: step.label || `Step ${stepIdx + 1}`,
      });

      // 1. Apply simulation parameter changes
      config.applyParams(step.params);

      // 2. Wait for physical motion & settling duration
      const delay = step.durationMs || 900;
      await new Promise<void>((resolve) => {
        autoRunTimeoutRef.current = window.setTimeout(() => {
          resolve();
        }, delay);
      });

      if (autoRunAbortControllerRef.current) return;

      // 3. Capture observation data point
      const captured = cleanDataRow(getCurrentRowRef.current());
      setRecordedRows((prev) => {
        const lastRow = prev[prev.length - 1];
        if (lastRow && isDuplicateOrNearRow(captured, lastRow)) {
          return prev;
        }
        return [...prev, { trial: prev.length + 1, ...captured }];
      });

      if (config.onStepComplete) {
        config.onStepComplete(stepIdx + 1, config.steps.length);
      }

      // 4. Advance to next step
      runNextStep(stepIdx + 1);
    };

    runNextStep(0);
  }, [stopAutoRecord]);

  // Cleanup auto-run timeout on unmount
  useEffect(() => {
    return () => {
      autoRunAbortControllerRef.current = true;
      if (autoRunTimeoutRef.current !== null) {
        window.clearTimeout(autoRunTimeoutRef.current);
      }
    };
  }, []);

  // 6. Clear recorded trials
  const clearTrials = useCallback(() => {
    stopAutoRecord();
    cancelAutoRun();
    setRecordedRows([]);
    setStatusMessage(null);
  }, [stopAutoRecord, cancelAutoRun]);

  // 7. Send all recorded trials / multi-point run data to Laboratory Workspace
  const sendToLaboratory = useCallback(async (customTitle?: any) => {
    stopAutoRecord();
    cancelAutoRun();
    let rowsToExport = recordedRows;

    // If no trials recorded yet, capture current state or series as first trial set
    if (rowsToExport.length === 0) {
      if (getSeriesData) {
        const series = getSeriesData();
        if (series && series.length > 0) {
          rowsToExport = series.map((r: DataRow, i: number) => ({ trial: i + 1, ...cleanDataRow(r) }));
        } else {
          const captured = recordTrial();
          rowsToExport = [captured];
        }
      } else {
        const captured = recordTrial();
        rowsToExport = [captured];
      }
    }

    if (quota.isFull) {
      setStatusMessage({
        type: 'error',
        text: `Storage quota reached (${quota.max}/${quota.max} practicals). Please delete an older practical in the Laboratory.`,
      });
      return;
    }

    // Sanitize title to prevent accidental SyntheticEvent / MouseEvent object insertion
    const safeTitle = typeof customTitle === 'string' && customTitle.trim().length > 0
      ? customTitle.trim()
      : `${simulationTitle} Experimental Data`;

    try {
      setIsSaving(true);
      setStatusMessage(null);

      // Ensure trial column exists and all column keys are safe
      const fullColumns: DataColumn[] = columns.some((c: DataColumn) => c.key === 'trial')
        ? columns
        : [{ key: 'trial', label: 'Trial #' }, ...columns];

      const xCol = defaultGraphConfig?.xAxis || fullColumns[1]?.key || 'trial';
      const yCol = defaultGraphConfig?.yAxis || fullColumns[2]?.key || fullColumns[1]?.key || 'value';

      const sanitizedRows = rowsToExport.map((r) => cleanDataRow(r));

      await savePractical({
        title: safeTitle,
        simulationId,
        simulationTitle,
        category,
        columns: fullColumns,
        data: sanitizedRows,
        notes: typeof notes === 'string' ? notes : '',
        graphConfig: {
          xAxis: xCol,
          yAxis: yCol,
          title: defaultGraphConfig?.title || `${simulationTitle} Graph Analysis`,
          showRegression: defaultGraphConfig?.showRegression ?? true,
          ...defaultGraphConfig,
        },
      });

      setStatusMessage({
        type: 'success',
        text: `Transferred ${sanitizedRows.length} data points to Laboratory Workspace! Redirecting...`,
      });

      setTimeout(() => {
        window.history.pushState(null, '', '/laboratory');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 600);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save practical to Laboratory.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [stopAutoRecord, recordedRows, getSeriesData, quota, columns, defaultGraphConfig, savePractical, simulationId, simulationTitle, category, notes, recordTrial]);

  return {
    recordedRows,
    trialCount: recordedRows.length,
    recordTrial,
    recordMultipleTrials,
    recordFullRun,
    isAutoRecording,
    startAutoRecord,
    stopAutoRecord,
    toggleAutoRecord,
    hasAutoRun: Boolean(autoRunConfig?.steps && autoRunConfig.steps.length > 0),
    isAutoRunning,
    autoRunProgress,
    startAutoRun,
    cancelAutoRun,
    clearTrials,
    sendToLaboratory,
    isSaving,
    statusMessage,
    quota,
  };
}
