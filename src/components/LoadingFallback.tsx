export function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white/40 border border-slate-100 rounded-2xl shadow-inner min-h-[400px] w-full text-center space-y-4">
      <div className="relative w-12 h-12">
        {/* Animated spin rings */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-650 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800 tracking-tight">Loading Simulation...</h4>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Physics by Senath</p>
      </div>
    </div>
  );
}
