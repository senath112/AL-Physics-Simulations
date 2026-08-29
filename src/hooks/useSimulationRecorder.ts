import { useState, useCallback } from 'react';
import { useLaboratory } from '../context/LaboratoryContext';
import { DataColumn, DataRow, GraphConfig } from '../types/laboratory';

interface UseSimulationRecorderOptions {
  simulationId: string;
  simulationTitle: string;
  category?: 'mechanics' | 'waves' | 'electricity' | 'magnetism' | 'thermal' | 'modern' | 'optics' | 'fields';
  columns: DataColumn[];
  getCurrentRow: () => DataRow;
  defaultGraphConfig?: Partial<GraphConfig>;
  notes?: string;
}

export function useSimulationRecorder({
  simulationId,
  simulationTitle,
  category = 'mechanics',
  columns,
  getCurrentRow,
  defaultGraphConfig,
  notes = '',
}: UseSimulationRecorderOptions) {
  const { savePractical, quota } = useLaboratory();

  const [recordedRows, setRecordedRows] = useState<DataRow[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Record current trial
  const recordTrial = useCallback(() => {
    const trialIndex = recordedRows.length + 1;
    const currentData = getCurrentRow();
    const newRow: DataRow = {
      trial: trialIndex,
      ...currentData,
    };
    setRecordedRows((prev) => [...prev, newRow]);
    setStatusMessage(null);
    return newRow;
  }, [recordedRows.length, getCurrentRow]);

  // 2. Clear recorded trials
  const clearTrials = useCallback(() => {
    setRecordedRows([]);
    setStatusMessage(null);
  }, []);

  // 3. Send all trials to Laboratory Workspace
  const sendToLaboratory = useCallback(async (customTitle?: string) => {
    let rowsToExport = recordedRows;

    // If no trials recorded yet, capture current state as first trial
    if (rowsToExport.length === 0) {
      const captured = recordTrial();
      rowsToExport = [captured];
    }

    if (quota.isFull) {
      setStatusMessage({
        type: 'error',
        text: `Quota reached (${quota.max}/${quota.max} practicals). Please delete an older practical in the Laboratory.`,
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
        title: customTitle || `${simulationTitle} Practical Trial`,
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
        text: 'Saved to Laboratory Workspace! Redirecting...',
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
  }, [recordedRows, recordTrial, quota, columns, defaultGraphConfig, savePractical, simulationId, simulationTitle, category, notes]);

  return {
    recordedRows,
    trialCount: recordedRows.length,
    recordTrial,
    clearTrials,
    sendToLaboratory,
    isSaving,
    statusMessage,
    quota,
  };
}
