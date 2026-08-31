import React from 'react';
import { 
  PlusCircle, 
  FlaskConical, 
  FileDown, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Sparkles,
  Bot,
  Square,
  Lock
} from 'lucide-react';
import { PracticalQuota } from '../../types/laboratory';
import { ENABLE_LABORATORY_UI, ENABLE_SIMULATION_LAB_BAR } from '../../config/features';

interface SimulationLabBarProps {
  trialCount: number;
  onRecordTrial: () => void;
  onRecordFullRun?: () => void;
  isAutoRecording?: boolean;
  onToggleAutoRecord?: () => void;
  isAutoRunning?: boolean;
  autoRunProgress?: { current: number; total: number; label: string } | null;
  onStartAutoRun?: () => void;
  onCancelAutoRun?: () => void;
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
  isAutoRunning = false,
  autoRunProgress = null,
  onStartAutoRun,
  onCancelAutoRun,
  onSendToLaboratory,
  onDownloadPDF,
  onClearTrials,
  isSaving = false,
  statusMessage = null,
  quota,
  className = '',
}) => {
  if (!ENABLE_SIMULATION_LAB_BAR) return null;

  const percentComplete = autoRunProgress 
    ? Math.round((autoRunProgress.current / autoRunProgress.total) * 100) 
    : 0;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Active Autonomous Run Progress Banner */}
      {isAutoRunning && autoRunProgress && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-300/80 rounded-xl p-3 space-y-2 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-600 text-white rounded-md animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>Auto-Running Experiment</span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Step {autoRunProgress.current} / {autoRunProgress.total}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Active Target: <span className="font-bold text-indigo-800">{autoRunProgress.label}</span>
                </div>
              </div>
            </div>

            {onCancelAutoRun && (
              <button
                onClick={() => onCancelAutoRun()}
                className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Square className="w-3 h-3 fill-red-600 text-red-600" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <Lock className="w-2.5 h-2.5" /> Controls Locked
              </span>
              <span>{percentComplete}% Complete</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert Banner */}
      {!isAutoRunning && statusMessage && (
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
        {/* 1. Autonomous Self-Run Button */}
        {onStartAutoRun && (
          <button
            onClick={() => onStartAutoRun()}
            disabled={isAutoRunning}
            className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            title="Start autonomous experiment with parameter stepping and auto-logging"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>Auto-Run</span>
          </button>
        )}

        {/* 2. Single Snapshot Trial Button */}
        <button
          onClick={() => onRecordTrial()}
          disabled={isAutoRunning}
          className="flex-1 min-w-[100px] py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-850 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs disabled:opacity-40"
          title="Record a single snapshot data point at current parameters"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Snapshot</span>
        </button>

        {/* 3. Live Auto-Record Continuous Run Toggle */}
        {onToggleAutoRecord && (
          <button
            onClick={() => onToggleAutoRecord()}
            disabled={isAutoRunning}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs disabled:opacity-40 ${
              isAutoRecording
                ? 'bg-red-600 border-red-700 text-white animate-pulse'
                : 'bg-white hover:bg-red-50 border-red-200 text-red-650'
            }`}
            title={isAutoRecording ? 'Stop continuous run recording' : 'Record parameters continuously across the run'}
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoRecording ? 'text-white' : 'text-red-500'}`} />
            <span>{isAutoRecording ? 'Stop Rec' : 'Auto-Rec'}</span>
          </button>
        )}

        {/* 4. Record Full Run / Multi-Point Sweep (if simulation has a generator) */}
        {onRecordFullRun && (
          <button
            onClick={() => onRecordFullRun()}
            disabled={isAutoRunning}
            className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Record complete multi-point parameter run instantly"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">1-Click Run</span>
          </button>
        )}

        {/* 5. PDF Download */}
        {onDownloadPDF && (
          <button
            onClick={() => onDownloadPDF()}
            disabled={isAutoRunning}
            className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Download PDF report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}

        {/* 6. Clear Records */}
        {onClearTrials && (
          <button
            onClick={() => onClearTrials()}
            disabled={trialCount === 0 || isAutoRunning}
            className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Clear all recorded data points"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dataset status & Send to Laboratory Button (Preserved for feature flag) */}
      <div className="space-y-1.5">
        {ENABLE_LABORATORY_UI && (
          <button
            onClick={() => onSendToLaboratory()}
            disabled={isSaving || isAutoRunning}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>
              {isSaving
                ? 'Transferring Dataset...'
                : `Send to Laboratory Workspace ${trialCount > 0 ? `(${trialCount} Points)` : ''} ${quota ? `[${quota.used}/${quota.max}]` : ''}`}
            </span>
          </button>
        )}

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
