import { useState, useRef, useEffect, useMemo } from 'react';
import { BlockMath, InlineMath } from '../../Math';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Snowflake,
  Plus 
} from 'lucide-react';
import { calculateGasState } from '../../../physics/thermalPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { gasLawsGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

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



  // Reset simulation variables
  const handleReset = () => {
    setGasMode('ideal');
    setMoleculesCount(60);
    setVolume(4.0);
    setTemperature(300);
    setNotes('');
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'gas_sim',
    simulationTitle: 'Gas Laws & Kinetic Theory',
    category: 'thermal',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'gasMode', label: 'Law Investigated', unit: '' },
      { key: 'volume', label: 'Volume (V)', unit: 'L' },
      { key: 'invVolume', label: 'Inverse Volume (1/V)', unit: '1/L' },
      { key: 'temperature', label: 'Temperature (T)', unit: 'K' },
      { key: 'pressure', label: 'Pressure (P)', unit: 'atm' },
      { key: 'moleculesCount', label: 'Molecules (N)', unit: '' },
      { key: 'pvOverT', label: 'PV/T Ratio', unit: 'atm·L/K' },
    ],
    getCurrentRow: () => {
      const p = gasState.pressure;
      const invV = volume > 0 ? 1 / volume : 0;
      const ratio = temperature > 0 ? (p * volume) / temperature : 0;
      return {
        gasMode: gasMode.toUpperCase(),
        volume: parseFloat(volume.toFixed(2)),
        invVolume: parseFloat(invV.toFixed(3)),
        temperature,
        pressure: parseFloat(p.toFixed(3)),
        moleculesCount,
        pvOverT: parseFloat(ratio.toFixed(4)),
      };
    },
    getSeriesData: () => {
      const volumes = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];
      const k = (moleculesCount * 0.05 * temperature) / 300;
      return volumes.map((v, idx) => {
        const p = k / v;
        return {
          trial: idx + 1,
          gasMode: "BOYLE'S LAW",
          volume: v,
          invVolume: parseFloat((1 / v).toFixed(3)),
          temperature,
          pressure: parseFloat(p.toFixed(3)),
          moleculesCount,
          pvOverT: parseFloat(((p * v) / temperature).toFixed(4)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Volume V = 1.0 L', params: { volume: 1.0 }, durationMs: 750 },
        { label: 'Volume V = 2.0 L', params: { volume: 2.0 }, durationMs: 750 },
        { label: 'Volume V = 3.0 L', params: { volume: 3.0 }, durationMs: 750 },
        { label: 'Volume V = 4.0 L', params: { volume: 4.0 }, durationMs: 750 },
        { label: 'Volume V = 5.0 L', params: { volume: 5.0 }, durationMs: 750 },
        { label: 'Volume V = 6.0 L', params: { volume: 6.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.volume !== undefined) setVolume(p.volume);
      },
    },
    defaultGraphConfig: {
      xAxis: 'invVolume',
      yAxis: 'pressure',
      title: "Boyle's Law: P vs 1/V (Linear Fit, Slope = nRT)",
      showRegression: true,
    },
    notes,
  });

  const handleExportPDF = () => {
    const reportParams = {
      'Investigated Mode': gasMode.toUpperCase(),
      'Molecules Count (N)': `${moleculesCount}`,
      'Volume (V)': `${volume.toFixed(2)} L`,
      'Temperature (T)': `${temperature} K`,
      'Calculated Pressure (P)': `${gasState.pressure.toFixed(3)} atm`,
    };
    downloadReportAsPDF('Gas Laws Laboratory Report', reportParams, recorder.recordedRows, notes);
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
                  disabled={recorder.isAutoRunning}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center disabled:opacity-40 ${
                    gasMode === 'ideal' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Ideal Gas Law
                </button>
                <button
                  onClick={() => { setGasMode('boyle'); }}
                  disabled={recorder.isAutoRunning}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center disabled:opacity-40 ${
                    gasMode === 'boyle' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Boyle's Law (T Const)
                </button>
                <button
                  onClick={() => { setGasMode('charles'); }}
                  disabled={recorder.isAutoRunning}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center disabled:opacity-40 ${
                    gasMode === 'charles' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Charles' Law (P Const)
                </button>
                <button
                  onClick={() => { setGasMode('pressure'); }}
                  disabled={recorder.isAutoRunning}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center disabled:opacity-40 ${
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
                disabled={recorder.isAutoRunning}
                onChange={(e) => setMoleculesCount(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                disabled={gasMode === 'charles' || gasMode === 'pressure' || recorder.isAutoRunning}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                onClick={recorder.recordTrial}
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

            <div className="w-full min-h-[320px] overflow-x-auto flex items-center justify-center py-4 bg-slate-50/20 rounded-xl">
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

            {/* Scientific Graph Laboratory (8 Cols) */}
            <div className="md:col-span-8">
              <ScientificGraphLab
                graphs={gasLawsGraphs}
                trials={recorder.recordedRows}
                simulationParams={{ pressure: gasState.pressure, volume, temperature, moles: moleculesCount }}
                onRecordTrial={recorder.recordTrial}
                onClearTrials={recorder.clearTrials}
                columns={recorder.columns}
                height={260}
              />
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

        {/* Logs list & Laboratory Transfer (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              {t.trialHistory}
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {recorder.trialCount} Trials Recorded
            </span>
          </div>

          <SimulationLabBar
            trialCount={recorder.trialCount}
            onRecordTrial={recorder.recordTrial}
            onRecordFullRun={recorder.recordFullRun}
            isAutoRecording={recorder.isAutoRecording}
            onToggleAutoRecord={recorder.toggleAutoRecord}
            isAutoRunning={recorder.isAutoRunning}
            autoRunProgress={recorder.autoRunProgress}
            onStartAutoRun={recorder.startAutoRun}
            onCancelAutoRun={recorder.cancelAutoRun}
            onSendToLaboratory={recorder.sendToLaboratory}
            onDownloadPDF={handleExportPDF}
            onClearTrials={recorder.clearTrials}
            isSaving={recorder.isSaving}
            statusMessage={recorder.statusMessage}
            quota={recorder.quota}
          />
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
