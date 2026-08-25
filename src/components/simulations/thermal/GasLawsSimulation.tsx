import { useState, useRef, useEffect, useMemo } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath, InlineMath } from '../../Math';
import { 
  Sparkles, 
  Download,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Snowflake
} from 'lucide-react';
import { 
  calculateGasState
} from '../../../physics/thermalPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

interface TrialLog {
  id: string;
  timestamp: string;
  tab: string;
  detail: string;
}

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function GasLawsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Gas Laws & Molecular Motion Explainer',
      controls: 'Simulation Parameters',
      gasMode: 'Target Gas Law',
      moleculesCount: 'Molecules Count (N)',
      volume: 'Volume (V)',
      temperature: 'Temperature (T)',
      heatChamber: 'Heat Chamber (+50K)',
      coolChamber: 'Cool Chamber (-50K)',
      logTrial: 'Record Parameters Log',
      physicsCalculations: 'Physics Calculations',
      pressure: 'Pressure (P)',
      ratio: 'Ratio (PV/T)',
      labNotes: 'Observation Journal',
      trialHistory: 'Logged Observations History',
      pdf: 'Export PDF'
    },
    si: {
      title: 'වායු නියම සහ අණුක චලිතය පැහැදිලි කිරීම',
      controls: 'සිමියුලේෂන් පරාමිතීන්',
      gasMode: 'අදාල වායු නියමය',
      moleculesCount: 'අණු ගණන (N)',
      volume: 'පරිමාව (V)',
      temperature: 'උෂ්ණත්වය (T)',
      heatChamber: 'කුටීරය රත් කරන්න (+50K)',
      coolChamber: 'කුටීරය සිසිල් කරන්න (-50K)',
      logTrial: 'නිරීක්ෂණ අගය සටහන් කරන්න',
      physicsCalculations: 'භෞතික විද්‍යාත්මක ගණනය කිරීම්',
      pressure: 'පීඩනය (P)',
      ratio: 'අනුපාතය (PV/T)',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      pdf: 'PDF ලබාගන්න'
    },
    ta: {
      title: 'வாயு விதிகள் மற்றும் மூலக்கூறு இயக்க விளக்கம்',
      controls: 'சிமுலேஷன் அளவுருக்கள்',
      gasMode: 'வாயு விதி இலக்கு',
      moleculesCount: 'மூலக்கூறுகளின் எண்ணிக்கை (N)',
      volume: 'கனஅளவு (V)',
      temperature: 'வெப்பநிலை (T)',
      heatChamber: 'அறையை வெப்பப்படுத்து (+50K)',
      coolChamber: 'அறையைக் குளிரூட்டு (-50K)',
      logTrial: 'சோதனைப் பதிவைச் சேமி',
      physicsCalculations: 'பௌதிகவியல் கணிப்புகள்',
      pressure: 'அழுத்தம் (P)',
      ratio: 'மாறிலி விகிதம் (PV/T)',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'பதிவு செய்யப்பட்ட சோதனை வரலாறு',
      pdf: 'PDF ஏற்றுமதி செய்'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [explainMode, setExplainMode] = useState<boolean>(true);
  const [gasMode, setGasMode] = useState<'ideal' | 'boyle' | 'charles' | 'pressure'>('ideal');
  const [moleculesCount, setMoleculesCount] = useState<number>(60);
  const [volume, setVolume] = useState<number>(4.0); // Liters
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const [notes, setNotes] = useState<string>('');
  const [logs, setLogs] = useState<TrialLog[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moleculesRef = useRef<Molecule[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Gas laws calculations
  const gasState = useMemo(() => {
    return calculateGasState(moleculesCount, volume, temperature);
  }, [moleculesCount, volume, temperature]);

  // Handle Gas Laws constraints depending on active law
  useEffect(() => {
    if (gasMode === 'boyle') {
      setTemperature(300);
    } else if (gasMode === 'charles') {
      const nextV = (temperature / 300) * 4.0;
      setVolume(parseFloat(nextV.toFixed(2)));
    } else if (gasMode === 'pressure') {
      setVolume(4.0);
    }
  }, [gasMode, temperature]);

  // Generate curves for Plotly visualization
  const plotData = useMemo(() => {
    const xData: number[] = [];
    const yData: number[] = [];

    if (gasMode === 'boyle') {
      // P vs V curve (hyperbola: P = constant / V)
      const k = moleculesCount * temperature * 0.05; // Matching calculateGasState scaling
      for (let vVal = 1.0; vVal <= 7.0; vVal += 0.25) {
        xData.push(vVal);
        yData.push(k / vVal);
      }
    } else if (gasMode === 'charles') {
      // V vs T straight line
      for (let tVal = 100; tVal <= 500; tVal += 20) {
        xData.push(tVal);
        yData.push((tVal / 300) * 4.0);
      }
    } else if (gasMode === 'pressure') {
      // P vs T straight line (Gay-Lussac)
      const vConst = 4.0;
      const slope = (moleculesCount * 0.05) / vConst;
      for (let tVal = 100; tVal <= 500; tVal += 20) {
        xData.push(tVal);
        yData.push(slope * tVal);
      }
    }
    return { x: xData, y: yData };
  }, [gasMode, moleculesCount, temperature]);

  // Reset simulation variables
  const handleReset = () => {
    setGasMode('ideal');
    setMoleculesCount(60);
    setVolume(4.0);
    setTemperature(300);
    setLogs([]);
    setNotes('');
  };

  // Add Log Entry
  const logReading = () => {
    const timestamp = new Date().toLocaleTimeString();
    const detail = `Law: ${gasMode.toUpperCase()} | N = ${moleculesCount} | V = ${volume.toFixed(2)} L | T = ${temperature} K => P = ${gasState.pressure.toFixed(3)} atm`;
    const newLog: TrialLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      tab: 'Gas Laws',
      detail
    };
    setLogs([newLog, ...logs]);
  };

  const handleExportPDF = () => {
    const content = [
      `A/L Physics Laboratory - Gas Laws Scientific Report`,
      `Institution: Physics by Senath\n`,
      `Logged Parameters History:`,
      ...logs.map(log => `[${log.timestamp}] ${log.detail}`),
      `\nLab Instructor Journal Notes:\n${notes || 'No observations logged.'}`
    ].join('\n');
    downloadReportAsPDF('Gas_Laws_Report', {}, [], content);
  };

  // Chamber Visualizer rendering loop
  useEffect(() => {
    // Generate initial molecules
    if (moleculesRef.current.length === 0) {
      const initialMolecules: Molecule[] = [];
      for (let i = 0; i < 200; i++) {
        initialMolecules.push({
          x: 40 + Math.random() * 200,
          y: 30 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160
        });
      }
      moleculesRef.current = initialMolecules;
    }

    // Sync molecule array size with moleculesCount slider
    if (moleculesRef.current.length !== moleculesCount) {
      if (moleculesRef.current.length < moleculesCount) {
        const diff = moleculesCount - moleculesRef.current.length;
        for (let i = 0; i < diff; i++) {
          moleculesRef.current.push({
            x: 40 + Math.random() * 120,
            y: 30 + Math.random() * 120,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 160
          });
        }
      } else {
        moleculesRef.current.splice(moleculesCount);
      }
    }

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rectWidth = 600;
      const rectHeight = 280;

      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      canvas.style.width = `${rectWidth}px`;
      canvas.style.height = `${rectHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Box coordinates based on Volume slider (varies the width of the box)
      const borderLeft = 35;
      const borderWidth = 100 + volume * 55; // box width scales with Volume
      const borderRight = borderLeft + borderWidth;
      const borderTop = 25;
      const borderBottom = 255;

      // Draw Chamber boundary (piston cylinder representation)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(borderLeft, borderTop, borderWidth, borderBottom - borderTop);

      // Piston block line on the right side
      ctx.fillStyle = '#64748b';
      ctx.fillRect(borderRight - 6, borderTop, 8, borderBottom - borderTop);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(borderLeft, borderTop);
      ctx.lineTo(borderLeft, borderBottom);
      ctx.lineTo(borderRight, borderBottom);
      ctx.lineTo(borderRight, borderTop);
      ctx.stroke();

      // Piston handle
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(borderRight + 2, borderTop + (borderBottom - borderTop)/2 - 8, 30, 16);

      // Update molecule positions based on Temperature (speed = sqrt(T))
      if (isPlaying) {
        const speedMultiplier = Math.sqrt(temperature / 100) * 1.6;

        moleculesRef.current.forEach(m => {
          m.x += m.vx * speedMultiplier * dt;
          m.y += m.vy * speedMultiplier * dt;

          // Wall collisions (elastic)
          if (m.x <= borderLeft + 4) {
            m.x = borderLeft + 4; m.vx = -m.vx;
          }
          if (m.x >= borderRight - 10) {
            m.x = borderRight - 10; m.vx = -m.vx;
          }
          if (m.y <= borderTop + 4) {
            m.y = borderTop + 4; m.vy = -m.vy;
          }
          if (m.y >= borderBottom - 10) {
            m.y = borderBottom - 10; m.vy = -m.vy;
          }
        });
      }

      // Draw molecules
      ctx.fillStyle = '#3b82f6';
      moleculesRef.current.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Labeled parameters indicators in chamber
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 9px font-sans';
      ctx.textAlign = 'left';
      ctx.fillText(`V = ${volume.toFixed(1)} L`, borderLeft + 15, borderTop + 20);
      ctx.fillText(`T = ${temperature} K`, borderLeft + 15, borderTop + 35);
      ctx.fillText(`P = ${gasState.pressure.toFixed(2)} atm`, borderLeft + 15, borderTop + 50);

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, moleculesCount, volume, temperature, gasMode, gasState]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column Controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Gas Lab</span>
            </div>

            {/* Target Gas Law Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 block">{t.gasMode}</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setGasMode('ideal'); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    gasMode === 'ideal' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Ideal Gas Law
                </button>
                <button
                  onClick={() => { setGasMode('boyle'); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    gasMode === 'boyle' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Boyle's Law (T Const)
                </button>
                <button
                  onClick={() => { setGasMode('charles'); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    gasMode === 'charles' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Charles' Law (P Const)
                </button>
                <button
                  onClick={() => { setGasMode('pressure'); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    gasMode === 'pressure' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Pressure Law (V Const)
                </button>
              </div>
            </div>

            {/* Molecule Count slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.moleculesCount}</span>
                <span className="text-slate-800 font-mono">{moleculesCount}</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                value={moleculesCount}
                onChange={(e) => setMoleculesCount(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volume slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.volume}</span>
                <span className="text-slate-800 font-mono">{volume.toFixed(1)} L</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="7.0"
                step="0.1"
                value={volume}
                disabled={gasMode === 'charles' || gasMode === 'pressure'}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Temperature slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.temperature}</span>
                <span className="text-slate-800 font-mono">{temperature} K</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={temperature}
                disabled={gasMode === 'boyle'}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Chamber heating cooling triggers */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setTemperature(prev => Math.min(500, prev + 50))}
                disabled={gasMode === 'boyle'}
                className="py-1.5 px-2 bg-orange-50 border border-orange-100 hover:bg-orange-100/60 text-orange-700 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Flame className="w-3.5 h-3.5" />
                {t.heatChamber}
              </button>
              <button
                onClick={() => setTemperature(prev => Math.max(100, prev - 50))}
                disabled={gasMode === 'boyle'}
                className="py-1.5 px-2 bg-blue-50 border border-blue-100 hover:bg-blue-100/60 text-blue-700 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Snowflake className="w-3.5 h-3.5" />
                {t.coolChamber}
              </button>
            </div>

            {/* Logging and resets */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={logReading}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {t.logTrial}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column visualizer and plot (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Molecular Motion Containment Chamber</h3>
              
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto flex justify-center py-2">
              <canvas
                ref={canvasRef}
                className="border border-slate-100 rounded-lg bg-white select-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Readings */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.pressure}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">{gasState.pressure.toFixed(3)} atm</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.ratio}:</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {((gasState.pressure * gasState.volume) / gasState.temperature).toFixed(5)}
                  </span>
                </div>
              </div>
            </div>

            {/* Plotly Chart (8 Cols) */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-72">
              {gasMode === 'ideal' ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Select a specific Gas Law to view curves
                </div>
              ) : (
                <PlotlyGraph
                  data={[
                    {
                      x: plotData.x,
                      y: plotData.y,
                      type: 'scatter',
                      mode: 'lines',
                      name: gasMode === 'boyle' ? "Boyle's Curve" : gasMode === 'charles' ? "Charles' Line" : "Gay-Lussac Line",
                      line: { color: '#3b82f6', width: 2.5 }
                    },
                    {
                      x: [gasMode === 'boyle' ? volume : temperature],
                      y: [gasMode === 'charles' ? volume : gasState.pressure],
                      type: 'scatter',
                      mode: 'markers',
                      name: 'Current State',
                      marker: { color: '#ef4444', size: 10 }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 45, r: 15, t: 15, b: 40 },
                    xaxis: { title: { text: gasMode === 'boyle' ? 'Volume V (L)' : 'Temperature T (K)' } },
                    yaxis: { title: { text: gasMode === 'charles' ? 'Volume V (L)' : 'Pressure P (atm)' } },
                    legend: { orientation: 'h', y: -0.25 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)'
                  }}
                  className="w-full h-full"
                />
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Explainer Block */}
      {explainMode && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Gas Laws Equations & Theory
            </h3>
            <button
              onClick={() => setExplainMode(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Hide Theory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-650 leading-relaxed font-medium">
            <div className="space-y-2">
              <p>
                <strong>Ideal Gas Law (පරිපූර්ණ වායු සමීකරණය):</strong> Combines Boyle's, Charles's, and Avogadro's laws to define the thermodynamic state of an ideal gas:
              </p>
              <BlockMath math="PV = nRT" />
              <p>
                Where <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="P" /></span> is pressure, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="V" /></span> is volume, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="n" /></span> is moles, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="R" /></span> is the universal gas constant, and <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="T" /></span> is temperature.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Boyle's Law (බොයිල්ගේ නියමය):</strong> The volume of a fixed mass of gas is inversely proportional to its pressure at constant temperature:
              </p>
              <BlockMath math="P_1 V_1 = P_2 V_2 \quad (\text{Const } T)" />
              <p>
                Decreasing container volume forces molecules into a smaller area, increasing collisions with the walls and multiplying pressure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Notes and history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Lab Notes (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.labNotes}
            </h3>
            
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="explainMode"
                checked={explainMode}
                onChange={(e) => setExplainMode(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="explainMode" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                Show Theory
              </label>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record observations for PV relationships, temperature proportionality, or constant ratios..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium bg-slate-50/20"
          />
        </div>

        {/* Logs list (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              {t.trialHistory}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                disabled={logs.length === 0}
                className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={logs.length === 0}
                className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                {t.pdf}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-400">{log.tab}</span>
                        <span className="text-slate-350">•</span>
                        <span className="text-slate-800 font-extrabold">{log.detail}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                No trial observations logged
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Dummy Info Icon placeholder for inline visual header safety
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
