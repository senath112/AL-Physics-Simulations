import React from 'react';
import { PlusCircle, FlaskConical, FileDown, Trash2, CheckCircle2, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { PracticalQuota } from '../../types/laboratory';

interface SimulationLabBarProps {
  trialCount: number;
  onRecordTrial: () => void;
  onRecordFullRun?: () => void;
  isAutoRecording?: boolean;
  onToggleAutoRecord?: () => void;
  onSendToLaboratory: () => void;
  onDownloadPDF?: () => void;
  onClearTrials?: () => void;
  isSaving?: boolean;
  statusMessage?: { type: 'success' | 'error'; text: string } | null;
  quota?: PracticalQuota;
  className?: string;
}

export const SimulationLabBar: React.FC<SimulationLabBarProps> = ({
  trialCount,
  onRecordTrial,
  onRecordFullRun,
  isAutoRecording = false,
  onToggleAutoRecord,
  onSendToLaboratory,
  onDownloadPDF,
  onClearTrials,
  isSaving = false,
  statusMessage = null,
  quota,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Recording Actions Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Single Snapshot Trial Button */}
        <button
          onClick={onRecordTrial}
          className="flex-1 min-w-[110px] py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-850 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          title="Record a single snapshot data point at current parameters"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Record Snapshot</span>
        </button>

        {/* 2. Live Auto-Record Continuous Run Toggle */}
        {onToggleAutoRecord && (
          <button
            onClick={onToggleAutoRecord}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
              isAutoRecording
                ? 'bg-red-600 border-red-700 text-white animate-pulse'
                : 'bg-white hover:bg-red-50 border-red-200 text-red-650'
            }`}
            title={isAutoRecording ? 'Stop continuous run recording' : 'Record parameters continuously across the run'}
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoRecording ? 'text-white' : 'text-red-500'}`} />
            <span>{isAutoRecording ? 'Stop Rec' : 'Auto-Rec Run'}</span>
          </button>
        )}

        {/* 3. Record Full Run / Multi-Point Sweep (if simulation has a generator) */}
        {onRecordFullRun && (
          <button
            onClick={onRecordFullRun}
            className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Record complete multi-point parameter run"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Record Run</span>
          </button>
        )}

        {/* 4. PDF Download */}
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Download PDF report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}

        {/* 5. Clear Records */}
        {onClearTrials && (
          <button
            onClick={onClearTrials}
            disabled={trialCount === 0}
            className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Clear all recorded data points"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dataset status & Send to Laboratory Button */}
      <div className="space-y-1.5">
        <button
          onClick={onSendToLaboratory}
          disabled={isSaving}
          className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>
            {isSaving
              ? 'Transferring Dataset...'
              : `Send to Laboratory Workspace ${trialCount > 0 ? `(${trialCount} Points)` : ''} ${quota ? `[${quota.used}/${quota.max}]` : ''}`}
          </span>
        </button>

        {trialCount > 0 && (
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
            <span>{trialCount} data points logged in active set</span>
            <span className="text-emerald-600 font-bold">Ready for Graph Analysis ✓</span>
          </div>
        )}
      </div>
    </div>
  );
};
