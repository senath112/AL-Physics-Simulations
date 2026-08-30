import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGoogleClientId } from '../../types/auth';
import { ENABLE_LABORATORY_UI } from '../../config/features';
import { X, Sparkles, ShieldCheck, FileSpreadsheet, Lock, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    renderGoogleButton,
    loading,
    error,
    clearError,
    modalPromptReason,
  } = useAuth();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

  useEffect(() => {
    if (isAuthModalOpen && googleButtonRef.current && clientId) {
      renderGoogleButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
      });
    }
  }, [isAuthModalOpen, renderGoogleButton, clientId]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex p-3 bg-white/15 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {modalPromptReason ? 'Authentication Required' : 'Sign in to Physics by Senath'}
          </h2>
          <p className="text-blue-100 text-xs mt-1 max-w-xs mx-auto">
            {modalPromptReason || (ENABLE_LABORATORY_UI ? 'Sign in with your Google account to access all research laboratory features.' : 'Sign in with your Google account to access all advanced features.')}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Features / Benefits list */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
            {ENABLE_LABORATORY_UI ? (
              <>
                <div className="flex items-center gap-2.5 font-medium">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Full access to the <strong>Laboratory Workspace</strong></span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Save & transform simulation data into editable reports</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 font-medium">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Full access to <strong>Physics by Senath</strong> features</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Secure Google Identity login (no extra passwords required)</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Authentication Error: </span>
                <span>{error}</span>
              </div>
              <button onClick={clearError} className="text-red-500 hover:text-red-800 font-bold ml-1">
                ×
              </button>
            </div>
          )}

          {/* Missing Client ID Notice (for Developer onboarding) */}
          {!clientId && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold">⚠️ Google Client ID not configured</p>
              <p className="text-[11px]">
                Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">VITE_GOOGLE_CLIENT_ID</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">.env</code> file.
              </p>
            </div>
          )}

          {/* Google Sign-in Button Container */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div ref={googleButtonRef} className="min-h-[44px] flex items-center justify-center" />

            {loading && (
              <div className="flex items-center gap-2 mt-3 text-xs text-blue-600 font-semibold">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials with server...</span>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-[10px] text-center text-slate-400 leading-relaxed">
            By continuing, you agree to our Terms of Service. All public physics simulations remain free for guests.
          </p>
        </div>
      </div>
    </div>
  );
};
