import { useState, useCallback, useRef, useEffect } from 'react';
import { useLaboratory } from '../context/LaboratoryContext';
import { DataColumn, DataRow, GraphConfig, PracticalCategory } from '../types/laboratory';

interface UseSimulationRecorderOptions {
  simulationId: string;
  simulationTitle: string;
  category?: PracticalCategory;
  columns: DataColumn[];
  getCurrentRow: () => DataRow;
  getSeriesData?: () => DataRow[];
  defaultGraphConfig?: Partial<GraphConfig>;
  notes?: string;
}

export function useSimulationRecorder({
  simulationId,
  simulationTitle,
  category = 'mechanics',
  columns,
  getCurrentRow,
  getSeriesData,
  defaultGraphConfig,
  notes = '',
}: UseSimulationRecorderOptions) {
  const { savePractical, quota } = useLaboratory();

  const [recordedRows, setRecordedRows] = useState<DataRow[]>([]);
  const [isAutoRecording, setIsAutoRecording] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const autoRecordIntervalRef = useRef<number | null>(null);
  const getCurrentRowRef = useRef(getCurrentRow);
  getCurrentRowRef.current = getCurrentRow;

  // 1. Record single current snapshot trial
  const recordTrial = useCallback(() => {
    const currentData = getCurrentRowRef.current();
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
    setRecordedRows((prev) => {
      const startIndex = prev.length;
      const formattedRows = rows.map((r, i) => ({
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

  // 4. Live Auto-Recording toggle (records live continuous data stream as simulation plays/moves)
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
      text: 'Live auto-recording active. Data points will be captured continuously.',
    });

    // Record initial immediate point
    const initial = getCurrentRowRef.current();
    setRecordedRows((prev) => [...prev, { trial: prev.length + 1, ...initial }]);

    autoRecordIntervalRef.current = window.setInterval(() => {
      setRecordedRows((prev) => {
        if (prev.length >= 150) {
          // Cap to prevent memory/performance degradation
          stopAutoRecord();
          return prev;
        }
        const data = getCurrentRowRef.current();
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

  // Cleanup auto-record interval on unmount
  useEffect(() => {
    return () => {
      if (autoRecordIntervalRef.current !== null) {
        window.clearInterval(autoRecordIntervalRef.current);
      }
    };
  }, []);

  // 5. Clear recorded trials
  const clearTrials = useCallback(() => {
    stopAutoRecord();
    setRecordedRows([]);
    setStatusMessage(null);
  }, [stopAutoRecord]);

  // 6. Send all recorded trials / multi-point run data to Laboratory Workspace
  const sendToLaboratory = useCallback(async (customTitle?: string) => {
    stopAutoRecord();
    let rowsToExport = recordedRows;

    // If no trials recorded yet, capture current state or series as first trial set
    if (rowsToExport.length === 0) {
      if (getSeriesData) {
        const series = getSeriesData();
        if (series && series.length > 0) {
          rowsToExport = series.map((r, i) => ({ trial: i + 1, ...r }));
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

    try {
      setIsSaving(true);
      setStatusMessage(null);

      // Ensure trial column exists
      const fullColumns: DataColumn[] = columns.some((c) => c.key === 'trial')
        ? columns
        : [{ key: 'trial', label: 'Trial #' }, ...columns];

      const xCol = defaultGraphConfig?.xAxis || fullColumns[1]?.key || 'trial';
      const yCol = defaultGraphConfig?.yAxis || fullColumns[2]?.key || fullColumns[1]?.key || 'value';

      await savePractical({
        title: customTitle || `${simulationTitle} Experimental Data`,
        simulationId,
        simulationTitle,
        category,
        columns: fullColumns,
        data: rowsToExport,
        notes,
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
        text: `Transferred ${rowsToExport.length} data points to Laboratory Workspace! Redirecting...`,
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
    clearTrials,
    sendToLaboratory,
    isSaving,
    statusMessage,
    quota,
  };
}
