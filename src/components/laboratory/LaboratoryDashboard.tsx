import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLaboratory } from '../../context/LaboratoryContext';
import { LaboratoryPractical, DataRow } from '../../types/laboratory';
import { PlotlyGraph } from '../PlotlyGraph';
import { BlockMath } from '../Math';
import { 
  FileText, 
  TableProperties, 
  Cloud, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  HardDrive, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  BarChart2, 
  FileDown, 
  AlertCircle,
  Variable
} from 'lucide-react';

interface LaboratoryDashboardProps {
  onBackToSimulations: () => void;
  lang?: 'en' | 'si' | 'ta';
}

export const LaboratoryDashboard: React.FC<LaboratoryDashboardProps> = ({ 
  onBackToSimulations, 
  lang: _lang = 'en' 
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { practicals, quota, deletePractical, updatePractical, uploadDiagramToR2 } = useLaboratory();

  const [selectedPracticalId, setSelectedPracticalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'analyzer' | 'report'>('library');
  const [isUploadingDiagram, setIsUploadingDiagram] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedPractical = practicals.find(p => p.id === selectedPracticalId) || practicals[0] || null;

  // 1. GUEST GATE
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full space-y-6">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sign in to Access the Laboratory Workspace
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              All physics simulations remain free for guests. To record, edit, analyze, and save formal practical reports to your account, please sign in with Google.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal('Sign in with your Google account to unlock the Laboratory Workspace.')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
            <button
              onClick={onBackToSimulations}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Simulations</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quota percentage
  const quotaPercent = Math.min(100, (quota.used / quota.max) * 100);

  const [xTransform, setXTransform] = useState<'none' | 'reciprocal' | 'sq' | 'cube' | 'sqrt'>('none');
  const [yTransform, setYTransform] = useState<'none' | 'reciprocal' | 'sq' | 'sqrt'>('none');

  // Helper to apply math transformations
  const transformValue = (val: number, trans: string): number => {
    if (isNaN(val)) return NaN;
    if (trans === 'reciprocal') return val !== 0 ? 1 / val : NaN;
    if (trans === 'sq') return val * val;
    if (trans === 'cube') return val * val * val;
    if (trans === 'sqrt') return val >= 0 ? Math.sqrt(val) : NaN;
    return val;
  };

  const getTransformLabel = (label: string, trans: string): string => {
    if (trans === 'reciprocal') return `1 / (${label})`;
    if (trans === 'sq') return `(${label})²`;
    if (trans === 'cube') return `(${label})³`;
    if (trans === 'sqrt') return `√(${label})`;
    return label;
  };

  // Helper to calculate linear regression
  const calculateRegression = (rows: DataRow[], xKey: string, yKey: string, xTrans = 'none', yTrans = 'none') => {
    const validPairs = rows
      .map(r => ({
        x: transformValue(Number(r[xKey]), xTrans),
        y: transformValue(Number(r[yKey]), yTrans)
      }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));

    if (validPairs.length < 2) return null;

    const n = validPairs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (const p of validPairs) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R2 correlation calculation
    const numR = n * sumXY - sumX * sumY;
    const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denR !== 0 ? numR / denR : 0;
    const r2 = r * r;

    return { slope, intercept, r2, count: n };
  };

  // Diagram Upload Handler
  const handleDiagramUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPractical || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploadingDiagram(true);
      setUploadError(null);
      await uploadDiagramToR2(file, selectedPractical.id);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload apparatus diagram to Cloudflare R2.');
    } finally {
      setIsUploadingDiagram(false);
    }
  };

  // CSV Export Handler
  const handleExportCSV = (practical: LaboratoryPractical) => {
    const headers = practical.columns.map(c => `"${c.label} (${c.unit || ''})"`).join(',');
    const rows = practical.data.map(r => 
      practical.columns.map(c => `"${r[c.key] ?? ''}"`).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(`${headers}\n${rows}`)}`;
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${practical.title.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.picture}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-md"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}'s Laboratory</h1>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  Active Workspace
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Perform regression analytics on recorded simulation trials, write formal reports, and sync diagrams to Cloudflare R2.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-blue-200">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                  <span>☁️ Cloud Sync: Synced</span>
                  <span className="text-emerald-300 font-black">✓</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToSimulations}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Simulations Catalog</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync & Quota Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Cloudflare R2 Cloud Sync Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shadow-inner shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>☁️ Cloud Sync</span>
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Your laboratory work is securely synced to your account.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-extrabold shrink-0 shadow-xs">
            <span>Synced</span>
            <span className="text-sm font-black leading-none">✓</span>
          </div>
        </div>

        {/* Card 2: Account Storage Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Storage Quota</h3>
            </div>
            <span className={`font-mono text-xs font-bold ${quota.isFull ? 'text-red-600' : 'text-purple-600'}`}>
              {quota.used} / {quota.max} Practicals
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${quota.isFull ? 'bg-red-500' : 'bg-purple-600'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'library'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Practicals Library ({practicals.length})</span>
        </button>

        {selectedPractical && (
          <>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'analyzer'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Data Analyzer & Regression</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'report'
                  ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Formal Practical Report</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: PRACTICALS LIBRARY */}
      {activeTab === 'library' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Saved Physics Experiments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your recorded simulation trials or launch the spreadsheet analyzer.
              </p>
            </div>

            <button
              onClick={onBackToSimulations}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Simulation Data</span>
            </button>
          </div>

          {practicals.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <TableProperties className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-700">No recorded practicals yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Open any simulation (e.g. Hydrostatics, Pendulum, or Ohm's Law), click <strong>"Record Trial"</strong> in the Data Recorder, and choose <strong>"Send to Laboratory"</strong>.
              </p>
              <button
                onClick={onBackToSimulations}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse Simulations Catalog</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {practicals.map((prac) => (
                <div
                  key={prac.id}
                  className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                    selectedPracticalId === prac.id ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        {prac.simulationTitle}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(prac.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-black text-sm text-slate-900 line-clamp-1">{prac.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {prac.notes || `${prac.data.length} recorded data trial points ready for regression analysis.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedPracticalId(prac.id);
                          setActiveTab('analyzer');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Open in Data Analyzer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Analyze</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPracticalId(prac.id);
                          setActiveTab('report');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Open Report Editor"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </div>

                    <button
                      onClick={() => deletePractical(prac.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete practical"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATA ANALYZER & REGRESSION */}
      {activeTab === 'analyzer' && selectedPractical && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Spreadsheet Analytics
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedPractical.id}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">{selectedPractical.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(selectedPractical)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Switch to Report</span>
              </button>
            </div>
          </div>

          {/* Regression Slope Stats & Controls */}
          {(() => {
            const xKey = selectedPractical.graphConfig?.xAxis || selectedPractical.columns[0]?.key || 'trial';
            const yKey = selectedPractical.graphConfig?.yAxis || selectedPractical.columns[1]?.key || 'value';
            const reg = calculateRegression(selectedPractical.data, xKey, yKey, xTransform, yTransform);

            const xColObj = selectedPractical.columns.find((c) => c.key === xKey);
            const yColObj = selectedPractical.columns.find((c) => c.key === yKey);

            const rawXLabel = xColObj?.label || xKey;
            const rawYLabel = yColObj?.label || yKey;
            const displayXLabel = getTransformLabel(rawXLabel, xTransform);
            const displayYLabel = getTransformLabel(rawYLabel, yTransform);

            // Deduce physical constants based on simulation context and linear slope
            let deducedConstant: { label: string; value: string; unit: string; formula: string } | null = null;
            if (reg && reg.slope !== 0) {
              const simId = selectedPractical.simulationId;
              if (simId === 'shm_sim' && (xKey === 'length' || displayXLabel.includes('Length')) && (yKey === 'periodSq' || yTransform === 'sq')) {
                // T^2 = (4pi^2 / g) * L  =>  g = 4pi^2 / slope
                const gVal = (4 * Math.PI * Math.PI) / reg.slope;
                deducedConstant = {
                  label: 'Gravitational Acceleration (g)',
                  value: gVal.toFixed(2),
                  unit: 'm/s²',
                  formula: 'g = 4π² / slope',
                };
              } else if (simId === 'ohms_sim' && xKey === 'voltage' && yKey === 'current') {
                // I = (1/R) * V  =>  R = 1 / slope
                const rVal = 1 / reg.slope;
                deducedConstant = {
                  label: 'Resistance (R)',
                  value: rVal.toFixed(2),
                  unit: 'Ω',
                  formula: 'R = 1 / slope',
                };
              } else if (simId === 'ohms_sim' && xKey === 'current' && yKey === 'voltage') {
                // V = R * I  =>  R = slope
                deducedConstant = {
                  label: 'Resistance (R)',
                  value: reg.slope.toFixed(2),
                  unit: 'Ω',
                  formula: 'R = slope',
                };
              } else if (simId === 'photoelectric_sim' && xKey === 'frequency' && yKey === 'stoppingPotential') {
                // eV_s = hf - Phi => slope = h/e => h = slope * e
                const eCharge = 1.602e-19;
                const hVal = reg.slope * eCharge;
                deducedConstant = {
                  label: "Planck's Constant (h)",
                  value: hVal.toExponential(3),
                  unit: 'J·s',
                  formula: 'h = slope · e',
                };
              } else if (simId === 'optics_sim' && xTransform === 'reciprocal' && yTransform === 'reciprocal') {
                // 1/v = -1/u + 1/f => f = 1 / intercept
                if (reg.intercept !== 0) {
                  const fVal = 1 / reg.intercept;
                  deducedConstant = {
                    label: 'Focal Length (f)',
                    value: (fVal * 100).toFixed(1),
                    unit: 'cm',
                    formula: 'f = 1 / intercept',
                  };
                }
              } else if (simId === 'newtons_sim' && xKey === 'acceleration' && yKey === 'force') {
                // F = m * a  =>  m = slope
                deducedConstant = {
                  label: 'Total Accelerated Mass (M)',
                  value: reg.slope.toFixed(2),
                  unit: 'kg',
                  formula: 'M = slope',
                };
              }
            }

            return (
              <div className="space-y-6">
                {/* Axis Selectors and Math Transformations */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs">
                  {/* X-Axis Controls */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">X-Axis:</span>
                    <select
                      value={xKey}
                      onChange={(e) => {
                        updatePractical(selectedPractical.id, {
                          graphConfig: {
                            ...selectedPractical.graphConfig,
                            xAxis: e.target.value,
                            yAxis: yKey,
                            title: selectedPractical.graphConfig?.title || 'Experiment Graph',
                            showRegression: selectedPractical.graphConfig?.showRegression ?? true,
                          },
                        });
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none"
                    >
                      {selectedPractical.columns.map((c) => (
                        <option key={c.key} value={c.key}>{c.label} {c.unit ? `(${c.unit})` : ''}</option>
                      ))}
                    </select>

                    <select
                      value={xTransform}
                      onChange={(e: any) => setXTransform(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-700 outline-none"
                      title="Transform X-axis mathematically"
                    >
                      <option value="none">f(X) = X</option>
                      <option value="reciprocal">1 / X</option>
                      <option value="sq">X²</option>
                      <option value="cube">X³</option>
                      <option value="sqrt">√X</option>
                    </select>
                  </div>

                  {/* Y-Axis Controls */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Y-Axis:</span>
                    <select
                      value={yKey}
                      onChange={(e) => {
                        updatePractical(selectedPractical.id, {
                          graphConfig: {
                            ...selectedPractical.graphConfig,
                            xAxis: xKey,
                            yAxis: e.target.value,
                            title: selectedPractical.graphConfig?.title || 'Experiment Graph',
                            showRegression: selectedPractical.graphConfig?.showRegression ?? true,
                          },
                        });
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none"
                    >
                      {selectedPractical.columns.map((c) => (
                        <option key={c.key} value={c.key}>{c.label} {c.unit ? `(${c.unit})` : ''}</option>
                      ))}
                    </select>

                    <select
                      value={yTransform}
                      onChange={(e: any) => setYTransform(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-700 outline-none"
                      title="Transform Y-axis mathematically"
                    >
                      <option value="none">f(Y) = Y</option>
                      <option value="reciprocal">1 / Y</option>
                      <option value="sq">Y²</option>
                      <option value="sqrt">√Y</option>
                    </select>
                  </div>

                  {reg && (
                    <div className="flex flex-wrap items-center gap-2.5 ml-auto text-xs font-mono font-bold">
                      <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                        Slope m: {reg.slope.toFixed(4)}
                      </span>
                      <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg">
                        Intercept c: {reg.intercept.toFixed(4)}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                        R²: {reg.r2.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Deduced Physical Constant Banner */}
                {deducedConstant && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">
                        ⚡ Physical Constant
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-emerald-950">
                          {deducedConstant.label}: <span className="font-mono text-sm text-emerald-700 font-black">{deducedConstant.value} {deducedConstant.unit}</span>
                        </h4>
                        <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                          Evaluated via: {deducedConstant.formula}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
                      High-Precision Linear Regression
                    </span>
                  </div>
                )}

                {/* Mathematical Graph Type & Governing Physics Equation Bar */}
                {(() => {
                  const yValsRaw = selectedPractical.data
                    .map((r) => transformValue(Number(r[yKey]), yTransform))
                    .filter((v) => !isNaN(v) && isFinite(v));
                  const ySpan = yValsRaw.length > 0 ? Math.max(...yValsRaw) - Math.min(...yValsRaw) : 1;
                  const isDirectProportion = reg ? Math.abs(reg.intercept) < Math.max(0.04, 0.04 * ySpan) : true;
                  const graphForm = isDirectProportion ? 'y = mx' : 'y = mx + c';
                  const graphFormDesc = isDirectProportion ? 'Direct Proportion (Passes Through Origin)' : 'Linear (with Intercept)';

                  let governingFormula = '';
                  const simId = selectedPractical.simulationId;
                  if (simId === 'shm_sim') {
                    if (xKey.includes('length') || displayXLabel.includes('Length')) governingFormula = 'T² = (4π²/g)·L';
                    else if (xKey.includes('displacement') || displayXLabel.includes('Displacement')) governingFormula = 'a = -ω²x';
                    else if (yKey.includes('velocity') || displayYLabel.includes('Velocity')) governingFormula = 'v = Aω cos(ωt)';
                    else governingFormula = 'x(t) = A sin(ωt)';
                  } else if (simId === 'ohms_sim') {
                    if (xKey === 'voltage' && yKey === 'current') governingFormula = 'I = (1/R)·V';
                    else governingFormula = 'V = I·R';
                  } else if (simId === 'photoelectric_sim') {
                    governingFormula = 'V_s = (h/e)·f - (Φ/e)';
                  } else if (simId === 'newtons_sim') {
                    governingFormula = 'F = ma';
                  } else if (simId === 'optics_sim') {
                    governingFormula = '1/v = -1/u + 1/f';
                  } else if (simId === 'gas_sim') {
                    governingFormula = 'P = nRT·(1/V)';
                  } else if (simId === 'gravitation_sim') {
                    governingFormula = 'F = (G m₁ m₂)·(1/r²)';
                  } else if (simId === 'ac_generator_sim') {
                    governingFormula = 'ℰ₀ = (NAB)·ω';
                  } else if (simId === 'rolling_motion_sim') {
                    governingFormula = 'a = [g / (1 + k)]·sinθ';
                  } else if (simId === 'transformer_sim') {
                    governingFormula = 'V_s = (V_p / N_p)·N_s';
                  } else if (simId === 'dc_motor_sim') {
                    governingFormula = 'τ = (NAB)·I';
                  }

                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Variable className="w-3.5 h-3.5 text-indigo-600" />
                          Graph Type:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-mono font-black text-xs border shadow-2xs ${
                          isDirectProportion
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {graphForm}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          ({graphFormDesc})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        {governingFormula && (
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 shadow-2xs">
                            <span className="text-[10px] text-slate-500 font-sans font-bold">Equation:</span>
                            <span className="font-bold text-blue-700">{governingFormula}</span>
                          </div>
                        )}
                        {reg && (
                          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-indigo-900 shadow-2xs">
                            <span className="text-[10px] text-indigo-600 font-sans font-bold">Fit:</span>
                            <span className="font-bold">
                              y = {reg.slope.toFixed(3)}x {reg.intercept >= 0 ? `+ ${reg.intercept.toFixed(3)}` : `- ${Math.abs(reg.intercept).toFixed(3)}`}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-normal">(R² = {reg.r2.toFixed(3)})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Graph View */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-inner">
                  {(() => {
                    const xVals = selectedPractical.data
                      .map((r) => transformValue(Number(r[xKey]), xTransform))
                      .filter((v) => !isNaN(v) && isFinite(v));
                    const yVals = selectedPractical.data
                      .map((r) => transformValue(Number(r[yKey]), yTransform))
                      .filter((v) => !isNaN(v) && isFinite(v));

                    const traces: any[] = [
                      {
                        x: xVals,
                        y: yVals,
                        mode: 'markers',
                        type: 'scatter',
                        name: 'Transformed Data',
                        marker: { color: '#4f46e5', size: 9 },
                      },
                    ];

                    if (reg && xVals.length > 1) {
                      const minX = Math.min(...xVals);
                      const maxX = Math.max(...xVals);
                      const fitEq = `Fit: y = ${reg.slope.toFixed(3)}x ${reg.intercept >= 0 ? '+' : '-'} ${Math.abs(reg.intercept).toFixed(3)}`;
                      traces.push({
                        x: [minX, maxX],
                        y: [reg.slope * minX + reg.intercept, reg.slope * maxX + reg.intercept],
                        mode: 'lines',
                        type: 'scatter',
                        name: fitEq,
                        line: { color: '#ef4444', dash: 'dot', width: 2 },
                      });
                    }

                    const ySpan = yVals.length > 0 ? Math.max(...yVals) - Math.min(...yVals) : 1;
                    const isDirect = reg ? Math.abs(reg.intercept) < Math.max(0.04, 0.04 * ySpan) : true;
                    const formLabel = isDirect ? 'y = mx' : 'y = mx + c';

                    return (
                      <PlotlyGraph
                        data={traces}
                        layout={{
                          title: { text: `<b>${displayYLabel} vs ${displayXLabel}</b> <span style="font-size: 11px; color: #64748b; font-weight: normal;">[${formLabel}]</span>`, font: { size: 14 } },
                          xaxis: { title: { text: displayXLabel } },
                          yaxis: { title: { text: displayYLabel } },
                          margin: { l: 60, r: 25, t: 40, b: 45 },
                          height: 380,
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Spreadsheet Editable Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                      Observation Data Matrix ({selectedPractical.data.length} Rows)
                    </h3>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">#</th>
                          {selectedPractical.columns.map((col) => (
                            <th key={col.key} className="py-2.5 px-3 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                              {col.label} {col.unit ? `(${col.unit})` : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPractical.data.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 border-r border-slate-100 text-center font-mono font-bold text-slate-400">
                              {rIdx + 1}
                            </td>
                            {selectedPractical.columns.map((col) => {
                              const val = row[col.key];
                              return (
                                <td key={col.key} className="py-2 px-3 border-r border-slate-100 last:border-r-0 font-mono text-slate-800">
                                  {typeof val === 'number' ? val.toFixed(3) : String(val ?? '')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: FORMAL PRACTICAL REPORT */}
      {activeTab === 'report' && selectedPractical && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 sm:p-10 shadow-xs space-y-8 max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              Department of Advanced Level Physics • Formal Laboratory Report
            </span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              {selectedPractical.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-mono pt-1">
              <span>Author: {user.name}</span>
              <span>•</span>
              <span>Student ID: {user.id}</span>
              <span>•</span>
              <span>Date: {new Date(selectedPractical.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Section 1: Objective */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Objective & Aim
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-serif">
              {selectedPractical.report?.objective || 'Investigate experimental physical parameters and verify theoretical governing laws.'}
            </p>
          </div>

          {/* Section 2: Mathematical Theory & Formula */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Theoretical Principles & Governing Equations
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-xs text-slate-600 font-serif">
                Linear relationships can be verified by plotting dependent vs independent variables and evaluating the gradient $m$:
              </p>
              <div className="py-1">
                <BlockMath math="y = m x + c \implies m = \frac{\Delta y}{\Delta x}" />
              </div>
            </div>
          </div>

          {/* Section 3: Apparatus & Setup Diagram (with Cloudflare R2 Sync) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                3. Apparatus & Setup Diagram (Cloudflare R2 Sync)
              </h3>
              <label className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingDiagram ? 'Uploading to R2...' : 'Upload Diagram to R2'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleDiagramUpload}
                  className="hidden"
                  disabled={isUploadingDiagram}
                />
              </label>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {selectedPractical.diagramUrl ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                <img
                  src={selectedPractical.diagramUrl}
                  alt="Apparatus Diagram"
                  className="max-h-64 rounded-xl mx-auto border border-slate-200 shadow-sm object-contain"
                />
                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-700 font-mono">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloudflare R2 Synchronized ({selectedPractical.diagramKey || 'physicsbysenath-lab'})</span>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-1">
                <p>No apparatus diagram attached.</p>
                <p className="text-[11px]">Click "Upload Diagram to R2" to sync screenshots or apparatus drawings to your private bucket.</p>
              </div>
            )}
          </div>

          {/* Section 4: Observation Results */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              4. Tabulated Observation Readings
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-serif">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold">
                    <th className="py-2 px-3 border-r border-slate-200 text-center w-12">Trial</th>
                    {selectedPractical.columns.map((c) => (
                      <th key={c.key} className="py-2 px-3 border-r border-slate-200 last:border-r-0">
                        {c.label} {c.unit ? `(${c.unit})` : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedPractical.data.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-3 border-r border-slate-100 text-center text-slate-500 font-bold">{i + 1}</td>
                      {selectedPractical.columns.map((c) => (
                        <td key={c.key} className="py-1.5 px-3 border-r border-slate-100 last:border-r-0 text-slate-800">
                          {typeof r[c.key] === 'number' ? Number(r[c.key]).toFixed(2) : String(r[c.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Conclusion & Discussion */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              5. Discussion & Conclusion
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-serif">
              {selectedPractical.notes || 'The recorded observations exhibit consistent linear trend alignment in accordance with physical theory.'}
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('library')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              ← Back to Practicals Library
            </button>

            <button
              onClick={() => handleExportCSV(selectedPractical)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Export CSV Observations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
