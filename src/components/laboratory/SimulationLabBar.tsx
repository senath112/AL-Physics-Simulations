import React from 'react';
import { PlusCircle, FlaskConical, FileDown, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PracticalQuota } from '../../types/laboratory';

interface SimulationLabBarProps {
  trialCount: number;
  onRecordTrial: () => void;
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
  onSendToLaboratory,
  onDownloadPDF,
  onClearTrials,
  isSaving = false,
  statusMessage = null,
  quota,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
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

      {/* Main Buttons Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onRecordTrial}
          className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          title="Record current simulation trial readings"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Record Trial</span>
          {trialCount > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-extrabold">
              {trialCount}
            </span>
          )}
        </button>

        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Download PDF observation log"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}

        {onClearTrials && (
          <button
            onClick={onClearTrials}
            disabled={trialCount === 0}
            className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Clear recorded trials"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Direct Send to Laboratory Button */}
      <button
        onClick={onSendToLaboratory}
        disabled={isSaving}
        className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        <span>
          {isSaving ? 'Uploading...' : `Send to Laboratory Workspace ${quota ? `(${quota.used}/${quota.max})` : ''}`}
        </span>
      </button>
    </div>
  );
};
