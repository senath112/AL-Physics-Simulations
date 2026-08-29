import React, { useState } from 'react';
import { useLaboratory } from '../../context/LaboratoryContext';
import { useAuth } from '../../context/AuthContext';
import { DataColumn, DataRow } from '../../types/laboratory';
import { 
  Table, 
  PlusCircle, 
  Trash2, 
  FlaskConical, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface DataRecorderPanelProps {
  simulationId: string;
  simulationTitle: string;
  category?: 'mechanics' | 'waves' | 'electricity' | 'magnetism' | 'thermal' | 'modern';
  columns: DataColumn[];
  currentValues: DataRow;
  notes?: string;
  onNavigateToLaboratory?: () => void;
}

export const DataRecorderPanel: React.FC<DataRecorderPanelProps> = ({
  simulationId,
  simulationTitle,
  category = 'mechanics',
  columns,
  currentValues,
  notes = '',
  onNavigateToLaboratory,
}) => {
  const { savePractical, quota } = useLaboratory();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [recordedRows, setRecordedRows] = useState<DataRow[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [practicalTitle, setPracticalTitle] = useState<string>(`${simulationTitle} Practical`);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Record current trial data point
  const handleRecordDataPoint = () => {
    const trialNumber = recordedRows.length + 1;
    const newRow: DataRow = {
      trial: trialNumber,
      ...currentValues,
    };
    setRecordedRows([...recordedRows, newRow]);
    setStatusMessage(null);
  };

  // 2. Clear table
  const handleClear = () => {
    setRecordedRows([]);
    setStatusMessage(null);
  };

  // 3. Upload / Transfer to Laboratory Workspace
  const handleUploadToLaboratory = async () => {
    if (recordedRows.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please record at least one trial before uploading to the Laboratory.' });
      return;
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
      const fullColumns: DataColumn[] = columns.some(c => c.key === 'trial')
        ? columns
        : [{ key: 'trial', label: 'Trial #' }, ...columns];

      await savePractical({
        title: practicalTitle,
        simulationId,
        simulationTitle,
        category,
        columns: fullColumns,
        data: recordedRows,
        notes,
      });

      setStatusMessage({
        type: 'success',
        text: 'Successfully sent to Laboratory Workspace! Redirecting...',
      });

      setTimeout(() => {
        if (onNavigateToLaboratory) {
          onNavigateToLaboratory();
        }
      }, 800);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save practical.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs flex flex-col transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100/80 text-blue-600 rounded-lg">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-xs">Laboratory Data Recorder</span>
            <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {recordedRows.length} {recordedRows.length === 1 ? 'Trial' : 'Trials'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Quota: {quota.used}/{quota.max}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRecordDataPoint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Trial</span>
            </button>

            <button
              onClick={handleClear}
              disabled={recordedRows.length === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <div className="flex-1 min-w-[140px]">
              <input
                type="text"
                value={practicalTitle}
                onChange={(e) => setPracticalTitle(e.target.value)}
                placeholder="Practical Title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleUploadToLaboratory}
              disabled={recordedRows.length === 0 || isSaving}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Uploading...' : 'Send to Laboratory'}</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
            {recordedRows.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No data points recorded yet. Adjust simulation parameters and click <strong>"Record Trial"</strong> to capture readings.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2 px-3 border-r border-slate-200 w-12 text-center">#</th>
                    {columns.map((col) => (
                      <th key={col.key} className="py-2 px-3 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                        {col.label} {col.unit ? `(${col.unit})` : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-1.5 px-3 border-r border-slate-100 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      {columns.map((col) => {
                        const val = row[col.key];
                        return (
                          <td key={col.key} className="py-1.5 px-3 border-r border-slate-100 last:border-r-0 font-mono text-slate-800 whitespace-nowrap">
                            {typeof val === 'number' ? val.toFixed(2) : String(val ?? '-')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Guest Sign-In Tip */}
          {!isAuthenticated && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2 text-[11px] text-amber-800 flex items-center justify-between">
              <span>💡 Sign in with Google to save up to 10 practicals permanently in your cloud account.</span>
              <button
                onClick={() => openAuthModal('Sign in with Google to sync recorded practicals to your account.')}
                className="font-bold underline text-amber-900 ml-2 shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
