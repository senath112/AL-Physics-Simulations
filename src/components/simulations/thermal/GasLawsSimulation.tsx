import { useState, useRef, useEffect, useMemo } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath, InlineMath } from '../../Math';
import { 
  Sparkles, 
  Info, 
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
  calculateGasState, 
  solveCalorimetry, 
  solveThermalExpansion,
  CalorimetryParameters,
  ExpansionParameters
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
      gasLawsTab: 'Gas Laws & Kinetic Theory',
      thermoTab: 'Thermodynamics (P-V Diagrams)',
      calorimetryTab: 'Calorimetry & Expansion',
      controls: 'Chamber Parameters',
      experimentMode: 'Experiment Mode',
      ideal: 'Ideal Gas Law',
      boyles: "Boyle's Law (T Const)",
      charles: "Charles' Law (P Const)",
      pressureLaw: "Pressure Law (V Const)",
      molecules: 'Number of Gas Molecules (N)',
      volume: 'Volume (V)',
      temperature: 'Temperature (T)',
      heatChamber: 'Heat Chamber',
      coolChamber: 'Cool Chamber',
      logTrial: 'Log Trial Snapshot',
      physicsCalculations: 'Physics Calculations',
      pressure: 'Pressure (P)',
      ratio: 'Constant Ratio (PV/T)',
      labNotes: 'Thermodynamic Observation Notes',
      trialHistory: 'Recorded Thermal Trial History',
      pdf: 'Export PDF'
    },
    si: {
      gasLawsTab: 'වායු නියම සහ චාලක වාදය',
      thermoTab: 'තාපගති විද්‍යාව (P-V ප්‍රස්ථාර)',
      calorimetryTab: 'කලෝරිමිතිය සහ ප්‍රසාරණය',
      controls: 'මැදිරි පරාමිතීන්',
      experimentMode: 'අත්හදා බැලීමේ ක්‍රමය',
      ideal: 'පරිපූර්ණ වායු නියමය',
      boyles: 'බොයිල්ගේ නියමය (T නියත)',
      charles: 'චාල්ස්ගේ නියමය (P නියත)',
      pressureLaw: 'පීඩන නියමය (V නියත)',
      molecules: 'වායු අණු සංඛ්‍යාව (N)',
      volume: 'පරිමාව (V)',
      temperature: 'උෂ්ණත්වය (T)',
      heatChamber: 'මැදිරිය රත් කරන්න',
      coolChamber: 'මැදිරිය සිසිල් කරන්න',
      logTrial: 'නිරීක්ෂණ සටහන් කරන්න',
      physicsCalculations: 'භෞතික විද්‍යාත්මක ගණනය කිරීම්',
      pressure: 'පීඩනය (P)',
      ratio: 'නියත අනුපාතය (PV/T)',
      labNotes: 'තාපගතික ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'පටිගත කළ තාපජ අත්හදා බැලීම්',
      pdf: 'PDF ලබාගන්න'
    },
    ta: {
      gasLawsTab: 'வாயு விதிகளும் இயக்கக் கொள்கையும்',
      thermoTab: 'வெப்ப இயக்கவியல் (P-V வரைபடங்கள்)',
      calorimetryTab: 'கலோரிமானி & வெப்ப விரிவு',
      controls: 'அறை அளவீடுகள்',
      experimentMode: 'சோதனை முறை',
      ideal: 'நல்லியல்பு வாயு விதி',
      boyles: 'போயிலின் விதி (T மாறிலி)',
      charles: 'சார்லசின் விதி (P மாறிலி)',
      pressureLaw: 'அழுத்த விதி (V மாறிலி)',
      molecules: 'வாயு மூலக்கூறுகளின் எண்ணிக்கை (N)',
      volume: 'கனவளவு (V)',
      temperature: 'வெப்பநிலை (T)',
      heatChamber: 'அறையை வெப்பப்படுத்து',
      coolChamber: 'அறையைக் குளிரூட்டு',
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

  // Navigation Tabs
  const [subTab, setSubTab] = useState<'gas' | 'thermo' | 'calorimetry'>('gas');
  const [explainMode, setExplainMode] = useState<boolean>(true);

  // Tab 1: Gas Laws State
  const [gasMode, setGasMode] = useState<'ideal' | 'boyle' | 'charles' | 'pressure'>('ideal');
  const [moleculesCount, setMoleculesCount] = useState<number>(60);
  const [volume, setVolume] = useState<number>(4.0); // Liters or scaled
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Tab 2: Thermodynamics State
  const [thermoProcess, setThermoProcess] = useState<'isothermal' | 'isobaric' | 'isochoric'>('isothermal');
  const [heatAdded, setHeatAdded] = useState<number>(200); // J
  const [thermoVolumeInitial, setThermoVolumeInitial] = useState<number>(2.0);
  const [thermoVolumeFinal, setThermoVolumeFinal] = useState<number>(4.0);
  const [thermoTempInitial] = useState<number>(300);

  // Tab 3: Calorimetry & Expansion State
  const [solidMaterial, setSolidMaterial] = useState<'copper' | 'steel' | 'aluminum'>('copper');
  const [solidMass, setSolidMass] = useState<number>(150); // g
  const [solidTemp, setSolidTemp] = useState<number>(100); // °C
  const [liquidMass] = useState<number>(200); // g
  const [liquidTemp] = useState<number>(25); // °C
  
  const [expansionMaterial, setExpansionMaterial] = useState<'copper' | 'steel' | 'aluminum' | 'glass'>('copper');
  const [initialLength] = useState<number>(1.0); // m
  const [expansionTempChange, setExpansionTempChange] = useState<number>(80); // °C

  // Shared Lab Logs
  const [notes, setNotes] = useState<string>('');
  const [logs, setLogs] = useState<TrialLog[]>([]);

  // Canvas details
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moleculesRef = useRef<Molecule[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // 1. Gas laws calculations
  const gasState = useMemo(() => {
    return calculateGasState(moleculesCount, volume, temperature);
  }, [moleculesCount, volume, temperature]);

  // Handle Gas Laws constraints depending on active law
  useEffect(() => {
    if (gasMode === 'boyle') {
      // T is constant
      setTemperature(300);
    } else if (gasMode === 'charles') {
      // P is constant => V is proportional to T
      // We lock V based on T: V = T * constant
      const nextV = (temperature / 300) * 4.0;
      setVolume(parseFloat(nextV.toFixed(2)));
    } else if (gasMode === 'pressure') {
      // V is constant
      setVolume(4.0);
    }
  }, [gasMode, temperature]);

  // Tab 2: Thermodynamics calculations
  const thermoResults = useMemo(() => {
    const n = 0.08; // moles
    const R = 8.314; // J/mol K
    const U_initial = 1.5 * n * R * thermoTempInitial;
    
    let work = 0;
    let deltaTemp = 0;
    let finalTemp = thermoTempInitial;
    
    if (thermoProcess === 'isothermal') {
      // T is constant => dU = 0 => Q = W
      work = n * R * thermoTempInitial * Math.log(thermoVolumeFinal / thermoVolumeInitial);
      deltaTemp = 0;
      finalTemp = thermoTempInitial;
    } else if (thermoProcess === 'isobaric') {
      // P is constant => W = P * dV
      const pressure = (n * R * thermoTempInitial) / thermoVolumeInitial;
      work = pressure * (thermoVolumeFinal - thermoVolumeInitial) * 100; // scaled
      finalTemp = thermoTempInitial * (thermoVolumeFinal / thermoVolumeInitial);
      deltaTemp = finalTemp - thermoTempInitial;
    } else if (thermoProcess === 'isochoric') {
      // V is constant => W = 0 => Q = dU
      work = 0;
      finalTemp = thermoTempInitial + (heatAdded / (1.5 * n * R));
      deltaTemp = finalTemp - thermoTempInitial;
    }

    const deltaU = 1.5 * n * R * deltaTemp;
    const finalU = U_initial + deltaU;
    const heat = thermoProcess === 'isochoric' ? heatAdded : (deltaU + work);

    return {
      work: parseFloat(work.toFixed(1)),
      deltaU: parseFloat(deltaU.toFixed(1)),
      heat: parseFloat(heat.toFixed(1)),
      finalTemp: parseFloat(finalTemp.toFixed(1)),
      finalU: parseFloat(finalU.toFixed(1))
    };
  }, [thermoProcess, thermoVolumeInitial, thermoVolumeFinal, thermoTempInitial, heatAdded]);

  // Tab 3: Calorimetry & Expansion calculations
  const specificHeats = {
    copper: 0.385,
    steel: 0.450,
    aluminum: 0.900,
    water: 4.184
  };

  const calorimetryResult = useMemo(() => {
    const params: CalorimetryParameters = {
      liquidMass,
      liquidTemp,
      liquidSpecificHeat: specificHeats.water,
      solidMass,
      solidTemp,
      solidSpecificHeat: specificHeats[solidMaterial]
    };
    return solveCalorimetry(params);
  }, [liquidMass, liquidTemp, solidMass, solidTemp, solidMaterial]);

  const expansionResult = useMemo(() => {
    const params: ExpansionParameters = {
      material: expansionMaterial,
      initialLength,
      tempChange: expansionTempChange
    };
    return solveThermalExpansion(params);
  }, [expansionMaterial, initialLength, expansionTempChange]);

  // Simulation loop for Molecule bouncing chamber (Kinetic Theory)
  useEffect(() => {
    if (subTab !== 'gas') return;

    // Reset or resize molecules list if count mismatch
    if (moleculesRef.current.length !== moleculesCount) {
      const diff = moleculesCount - moleculesRef.current.length;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          moleculesRef.current.push({
            x: 50 + Math.random() * 300,
            y: 50 + Math.random() * 150,
            vx: (Math.random() - 0.5) * 50,
            vy: (Math.random() - 0.5) * 50
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
          // Update positions
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
  }, [subTab, isPlaying, moleculesCount, volume, temperature, gasMode, gasState]);

  const handleReset = () => {
    setMoleculesCount(60);
    setVolume(4.0);
    setTemperature(300);
    setGasMode('ideal');
    setSolidMaterial('copper');
    setSolidMass(150);
    setSolidTemp(100);
    setExpansionMaterial('copper');
    setExpansionTempChange(80);
    setNotes('');
  };

  // Log trial data
  const logTrial = () => {
    const timestamp = new Date().toLocaleTimeString();
    let detail = '';
    let tabName = '';

    if (subTab === 'gas') {
      tabName = 'Gas Laws';
      detail = `Mode: ${gasMode.toUpperCase()} | N = ${moleculesCount} | V = ${volume} L | T = ${temperature} K => Pressure = ${gasState.pressure} atm`;
    } else if (subTab === 'thermo') {
      tabName = 'Thermodynamics';
      detail = `Process: ${thermoProcess.toUpperCase()} | Q = ${thermoResults.heat} J | W = ${thermoResults.work} J | ΔU = ${thermoResults.deltaU} J`;
    } else {
      tabName = 'Calorimetry';
      detail = `Mix: Liquid (${liquidMass}g, ${liquidTemp}°C) + Solid (${solidMass}g, ${solidTemp}°C) => Final Temp = ${calorimetryResult.finalTemp}°C`;
    }

    setLogs([{ id: Math.random().toString(36).substring(2, 9), timestamp, tab: tabName, detail }, ...logs]);
  };

  const handleExportPDF = () => {
    const content = [
      `A/L Physics Laboratory - Thermal Physics Report`,
      `Institution: Physics by Senath\n`,
      `Logged Parameters History:`,
      ...logs.map(log => `[${log.timestamp}] [${log.tab}] ${log.detail}`),
      `\nLab Journal Notes:\n${notes || 'No notes logged.'}`
    ].join('\n');
    downloadReportAsPDF('Thermal_Physics_Lab_Report', {}, [], content);
  };

  // Plotly chart coordinate calculations
  const gasPlotData = useMemo(() => {
    const xVals: number[] = [];
    const yVals: number[] = [];
    
    if (gasMode === 'boyle') {
      // Constant T => P vs V (Inverse curve)
      for (let v = 1.0; v <= 8.0; v += 0.2) {
        xVals.push(v);
        yVals.push(calculateGasState(moleculesCount, v, temperature).pressure);
      }
    } else if (gasMode === 'charles') {
      // Constant P => V vs T (Linear curve)
      for (let t = 100; t <= 500; t += 10) {
        xVals.push(t);
        yVals.push((t / 300) * 4.0);
      }
    } else {
      // Constant V => P vs T (Linear curve)
      for (let t = 100; t <= 500; t += 10) {
        xVals.push(t);
        yVals.push(calculateGasState(moleculesCount, volume, t).pressure);
      }
    }
    return { x: xVals, y: yVals };
  }, [gasMode, moleculesCount, volume, temperature]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      {/* Tab selection toolbar */}
      <div className="flex border-b border-slate-200 gap-1.5 shrink-0">
        <button
          onClick={() => setSubTab('gas')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            subTab === 'gas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.gasLawsTab}
        </button>
        <button
          onClick={() => setSubTab('thermo')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            subTab === 'thermo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.thermoTab}
        </button>
        <button
          onClick={() => setSubTab('calorimetry')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            subTab === 'calorimetry' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.calorimetryTab}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* TAB 1 CONTROLS: GAS LAWS */}
          {subTab === 'gas' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider">
                  {t.controls}
                </h3>
                <span className="text-[9px] text-slate-450 font-bold uppercase">Gas Labs</span>
              </div>

              {/* Mode Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-655 block">{t.experimentMode}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGasMode('ideal')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-lg border text-left transition-colors ${
                      gasMode === 'ideal' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.ideal}
                  </button>
                  <button
                    onClick={() => setGasMode('boyle')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-lg border text-left transition-colors ${
                      gasMode === 'boyle' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.boyles}
                  </button>
                  <button
                    onClick={() => setGasMode('charles')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-lg border text-left transition-colors ${
                      gasMode === 'charles' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.charles}
                  </button>
                  <button
                    onClick={() => setGasMode('pressure')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-lg border text-left transition-colors ${
                      gasMode === 'pressure' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.pressureLaw}
                  </button>
                </div>
              </div>

              {/* Molecule count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{t.molecules}</span>
                  <span className="text-slate-800 font-mono">{moleculesCount}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={moleculesCount}
                  onChange={(e) => setMoleculesCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Volume */}
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
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Temperature */}
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
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Quick Heat / Cool handles */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setTemperature(Math.min(500, temperature + 40))}
                  disabled={gasMode === 'boyle'}
                  className="flex-1 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  {t.heatChamber}
                </button>
                <button
                  onClick={() => setTemperature(Math.max(100, temperature - 40))}
                  disabled={gasMode === 'boyle'}
                  className="flex-1 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  {t.coolChamber}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 CONTROLS: THERMODYNAMICS */}
          {subTab === 'thermo' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider">
                  Thermodynamic Controls
                </h3>
                <span className="text-[9px] text-slate-450 font-bold uppercase">1st Law Labs</span>
              </div>

              {/* Process Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-655 block">Process Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setThermoProcess('isothermal')}
                    className={`py-1.5 text-[10px] font-black uppercase rounded-lg border text-center transition-colors ${
                      thermoProcess === 'isothermal' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Isothermal
                  </button>
                  <button
                    onClick={() => setThermoProcess('isobaric')}
                    className={`py-1.5 text-[10px] font-black uppercase rounded-lg border text-center transition-colors ${
                      thermoProcess === 'isobaric' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Isobaric
                  </button>
                  <button
                    onClick={() => setThermoProcess('isochoric')}
                    className={`py-1.5 text-[10px] font-black uppercase rounded-lg border text-center transition-colors ${
                      thermoProcess === 'isochoric' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Isochoric
                  </button>
                </div>
              </div>

              {/* Volume Initial / Final */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Initial Volume (V₁)</span>
                  <span className="text-slate-800 font-mono">{thermoVolumeInitial.toFixed(1)} L</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={thermoVolumeInitial}
                  disabled={thermoProcess === 'isochoric'}
                  onChange={(e) => setThermoVolumeInitial(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Final Volume (V₂)</span>
                  <span className="text-slate-800 font-mono">{thermoVolumeFinal.toFixed(1)} L</span>
                </div>
                <input
                  type="range"
                  min="3.1"
                  max="6.0"
                  step="0.1"
                  value={thermoVolumeFinal}
                  disabled={thermoProcess === 'isochoric'}
                  onChange={(e) => setThermoVolumeFinal(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Heat added slider for isochoric */}
              {thermoProcess === 'isochoric' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Heat Added (Q)</span>
                    <span className="text-slate-800 font-mono">{heatAdded} J</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="10"
                    value={heatAdded}
                    onChange={(e) => setHeatAdded(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3 CONTROLS: CALORIMETRY & EXPANSION */}
          {subTab === 'calorimetry' && (
            <div className="space-y-6">
              {/* Calorimetry parameters */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Calorimetry Mixer
                </h3>
                
                {/* Solid Preset Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Solid Block Material</label>
                  <select
                    value={solidMaterial}
                    onChange={(e) => setSolidMaterial(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="copper">Copper Block (c = 0.385 J/g°C)</option>
                    <option value="steel">Steel Block (c = 0.450 J/g°C)</option>
                    <option value="aluminum">Aluminum Block (c = 0.900 J/g°C)</option>
                  </select>
                </div>

                {/* Solid Mass */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Solid Mass</span>
                    <span className="text-slate-850 font-mono">{solidMass} g</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="10"
                    value={solidMass}
                    onChange={(e) => setSolidMass(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Solid Temp */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Solid Temp (T_s)</span>
                    <span className="text-slate-850 font-mono">{solidTemp} °C</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={solidTemp}
                    onChange={(e) => setSolidTemp(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Expansion parameters */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Thermal Expansion Rod
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Rod Material</label>
                  <select
                    value={expansionMaterial}
                    onChange={(e) => setExpansionMaterial(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="copper">Copper (α = 1.65e-5 /°C)</option>
                    <option value="steel">Steel (α = 1.20e-5 /°C)</option>
                    <option value="aluminum">Aluminum (α = 2.31e-5 /°C)</option>
                    <option value="glass">Glass (α = 8.50e-6 /°C)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Temperature Increase (ΔT)</span>
                    <span className="text-slate-850 font-mono">+{expansionTempChange} °C</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={expansionTempChange}
                    onChange={(e) => setExpansionTempChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Log button */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <button
              onClick={logTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.logTrial}
            </button>
          </div>

        </div>

        {/* Right Column: Visualizer Viewport / Graph */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* TAB 1 VIEWPORT: GAS MOLECULES CHAMBER */}
          {subTab === 'gas' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Molecular Motion Containment Chamber</h3>
                
                {/* Play Pause Controls */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                    title="Reset variables"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
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
          )}

          {/* TAB 2 & 3 VIEWPORTS / PLOTS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Math Readings (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              {subTab === 'gas' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{t.pressure}:</span>
                    <span className="font-mono text-blue-650 font-extrabold">{gasState.pressure.toFixed(2)} atm</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{t.volume}:</span>
                    <span className="font-mono text-slate-800 font-bold">{gasState.volume.toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{t.temperature}:</span>
                    <span className="font-mono text-red-650 font-bold">{gasState.temperature} K</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{t.ratio}:</span>
                    <span className="font-mono text-slate-850">
                      {((gasState.pressure * gasState.volume) / gasState.temperature).toFixed(4)}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] font-bold text-slate-450">
                    <span>Target Law:</span>
                    <span className="uppercase text-slate-600">{gasMode} law</span>
                  </div>
                </div>
              )}

              {subTab === 'thermo' && (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Heat Supplied (Q):</span>
                    <span className="font-mono text-blue-600 font-extrabold">{thermoResults.heat} J</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Work Done (W):</span>
                    <span className="font-mono text-slate-850 font-bold">{thermoResults.work} J</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Internal Energy (ΔU):</span>
                    <span className="font-mono text-red-600 font-bold">{thermoResults.deltaU} J</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Final Temp (T₂):</span>
                    <span className="font-mono text-slate-800 font-bold">{thermoResults.finalTemp} K</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold mt-2">
                    Matches 1st Law: Q = ΔU + W
                  </p>
                </div>
              )}

              {subTab === 'calorimetry' && (
                <div className="space-y-3.5 text-xs">
                  <div className="border-b border-slate-50 pb-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Final Liquid Temp:</span>
                      <span className="font-mono text-blue-600 font-extrabold">{calorimetryResult.finalTemp} °C</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>Heat Gained/Lost:</span>
                      <span className="font-mono">{calorimetryResult.liquidHeatChange} J</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Expansion (ΔL):</span>
                      <span className="font-mono text-emerald-600 font-bold">{expansionResult.deltaLength.toFixed(5)} m</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>Final Length:</span>
                      <span className="font-mono">{expansionResult.finalLength.toFixed(5)} m</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Graphs (8 Cols) */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-72">
              {subTab === 'gas' && (
                <PlotlyGraph
                  data={[
                    {
                      x: gasPlotData.x,
                      y: gasPlotData.y,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Gas Curve boundary',
                      line: { color: '#3b82f6', width: 2 }
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

              {subTab === 'thermo' && (
                <PlotlyGraph
                  data={[
                    {
                      x: [thermoVolumeInitial, thermoVolumeFinal],
                      y: [
                        (0.08 * 8.314 * thermoTempInitial) / thermoVolumeInitial,
                        (0.08 * 8.314 * thermoResults.finalTemp) / thermoVolumeFinal
                      ],
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'P-V Path',
                      line: { color: '#8b5cf6', width: 2.5 }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 45, r: 15, t: 15, b: 40 },
                    xaxis: { title: { text: 'Volume V (L)' } },
                    yaxis: { title: { text: 'Pressure P (atm)' } },
                    legend: { orientation: 'h', y: -0.25 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)'
                  }}
                  className="w-full h-full"
                />
              )}

              {subTab === 'calorimetry' && (
                <PlotlyGraph
                  data={[
                    {
                      x: [0, solidMass],
                      y: [solidTemp, calorimetryResult.finalTemp],
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Solid Temp drop',
                      line: { color: '#ea580c' }
                    },
                    {
                      x: [0, liquidMass],
                      y: [liquidTemp, calorimetryResult.finalTemp],
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Liquid Temp rise',
                      line: { color: '#3b82f6' }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 45, r: 15, t: 15, b: 40 },
                    xaxis: { title: { text: 'Mass (g)' } },
                    yaxis: { title: { text: 'Temperature (°C)' } },
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
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-sm border-b border-blue-150 pb-2">
            <Info className="w-4.5 h-4.5" />
            THERMODYNAMICS & GAS KINETICS SCIENTIFIC FOUNDATION
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-blue-900 leading-relaxed font-medium">
            <div className="space-y-2">
              <p>
                <strong>Ideal Gas Equations & Kinetic Theory:</strong> Gas particles collide elastically with the chamber walls. The momentum transfer per unit area creates the macroscopically measurable gas pressure:
              </p>
              <BlockMath math="P V = n R T" />
              <p>
                Where <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="P" /></span> is pressure, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="V" /></span> is volume, and <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="T" /></span> is temperature. In Boyle's Law ($T$ Const), $P \propto 1/V$. In Charles' Law ($P$ Const), $V \propto T$. In Pressure Law ($V$ Const), $P \propto T$.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>First Law of Thermodynamics (තාපගති විද්‍යාවේ පළමු නියමය):</strong> Energy is conserved. Heat supplied ($Q$) goes into doing external work ($W$) and altering internal energy ($\Delta U$):
              </p>
              <BlockMath math="Q = \Delta U + W" />
              <p>
                - Isothermal ($T$ Const): $\Delta U = 0 \implies Q = W$.<br/>
                - Isochoric ($V$ Const): $W = 0 \implies Q = \Delta U$.<br/>
                - Isobaric ($P$ Const): Heat increases both temperature ($\Delta U$) and drives external work ($W = P\Delta V$).
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
            
            {/* Show Theory Toggle */}
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
            placeholder="Document gas law pressure transitions, isothermal P-V curve observations, or calorimetry equilibrium temperature mixtures..."
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
                        <span className="font-extrabold text-slate-800">{log.tab}</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-medium text-slate-600">{log.detail}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                <Info className="w-8 h-8 text-slate-200 mb-2" />
                No logged records. Click "Log Trial Snapshot" above.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
