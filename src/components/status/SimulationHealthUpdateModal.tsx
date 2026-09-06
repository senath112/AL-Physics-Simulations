import React from 'react';
import { useSimulationHealth } from '../../context/SimulationHealthContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  LineChart, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  Sliders
} from 'lucide-react';

export interface SimulationHealthUpdateModalProps {
  currentPage: string;
  onNavigateToStatus: () => void;
}

export const SimulationHealthUpdateModal: React.FC<SimulationHealthUpdateModalProps> = ({
  currentPage,
  onNavigateToStatus,
}) => {
  const { 
    isHealthLow, 
    isUpdateNoteOpen, 
    closeUpdateNote, 
    overallStatus,
    simResults
  } = useSimulationHealth();

  const isHomePage = currentPage === 'home' || currentPage === 'sims';
  const shouldShowModal = isHealthLow && isUpdateNoteOpen && isHomePage;

  if (!shouldShowModal) {
    return null;
  }

  const failedCount = Object.values(simResults).filter(v => v === 'fail').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeUpdateNote}
      />

      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-update-title"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  System Health Advisory
                </span>
                <span className="text-xs font-medium text-amber-100">
                  {overallStatus === 'degraded' ? 'Degraded Performance' : 'Engine Calibration'}
                </span>
              </div>
              <h3 id="modal-update-title" className="text-lg sm:text-xl font-black tracking-tight text-white">
                Physics Simulation Engine Update Note
              </h3>
            </div>
          </div>

          <button
            onClick={closeUpdateNote}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Close update note"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Main Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Automated Health & Numerical Validation Notice</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-850 leading-relaxed">
              Our automated physics validation engine detected that one or more simulation solvers are currently undergoing numerical calibration or experiencing calculation divergence.
              {failedCount > 0 && ` (${failedCount} component${failedCount > 1 ? 's' : ''} currently undergoing verification).`}
            </p>
          </div>

          {/* Key Advisory Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
              Protective Actions & System Status
            </h4>

            <div className="grid gap-3">
              {/* Point 1: Fixed Premade Graphs */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900">
                    Certified Fixed Premade Graphs Active
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    To preserve scientific accuracy and prevent numerical errors in student practical records, dynamic calculation plotting has been locked across <strong>all simulations</strong>. Practicals are displaying <strong>certified fixed premade calibration reference graphs</strong>.
                  </p>
                </div>
              </div>

              {/* Point 2: Full Interactivity */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900">
                    Simulators Remain Fully Interactive
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Virtual apparatus, friction wedges, optical lasers, and electric circuits remain interactive for testing physical concepts, adjusting variables, and visual study.
                  </p>
                </div>
              </div>

              {/* Point 3: Data Logging & Export */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <LineChart className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900">
                    Syllabus Compliance Guaranteed
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All reference curves and data points displayed adhere strictly to certified Sri Lankan G.C.E. A/L theoretical physics ground truth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              closeUpdateNote();
              onNavigateToStatus();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>View Simulation Status Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={closeUpdateNote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Got It, Continue to Simulations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
