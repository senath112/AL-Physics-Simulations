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
  Zap
} from 'lucide-react';
import { calculateLenzStep, LenzParameters } from '../../../physics/magnetismPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

interface TrialLog {
  id: string;
  timestamp: string;
  turns: number;
  resistance: string;
  strength: number;
  maxEMF: number;
  maxCurrent: number;
}

export function LenzsLawSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      controls: 'Induction Controls',
      circuitState: 'Coil Circuit State',
      closed: 'Closed Circuit (Load)',
      open: 'Open Circuit (Infinite R)',
      strength: 'Magnet Strength (B₀)',
      mass: 'Magnet Mass (m)',
      turns: 'Coil Turns (N)',
      resistance: 'Coil Resistance (R)',
      logTrial: 'Log Trial Snapshot',
      physicsCalculations: 'Physics Calculations',
      emf: 'Induced EMF',
      current: 'Induced Current (I)',
      braking: 'Magnetic Braking Force',
      velocity: 'Magnet Velocity',
      labNotes: 'Observational Lab Journal',
      trialHistory: 'Recorded Induction Trial History',
      pdf: 'Export PDF'
    },
    si: {
      controls: 'ප්‍රේරණ පාලන පුවරුව',
      circuitState: 'දඟරයේ පරිපථ තත්ත්වය',
      closed: 'සංවෘත පරිපථය (භාරය)',
      open: 'විවෘත පරිපථය (නිරන්ත R)',
      strength: 'චුම්බක ප්‍රබලතාවය (B₀)',
      mass: 'චුම්බක ස්කන්ධය (m)',
      turns: 'දඟර වට සංඛ්‍යාව (N)',
      resistance: 'දඟර ප්‍රතිරෝධය (R)',
      logTrial: 'නිරීක්ෂණ සටහන් කරන්න',
      physicsCalculations: 'භෞතික විද්‍යාත්මක ගණනය කිරීම්',
      emf: 'ප්‍රේරිත වි.ගා.බ. (EMF)',
      current: 'ප්‍රේරිත ධාරාව (I)',
      braking: 'චුම්බක තිරිංග බලය',
      velocity: 'චුම්බකයේ ප්‍රවේගය',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'පටිගත කළ ප්‍රේරණ අත්හදා බැලීම්',
      pdf: 'PDF ලබාගන්න'
    },
    ta: {
      controls: 'மின்தூண்டல் கட்டுப்பாடு',
      circuitState: 'சுருள் சுற்று நிலை',
      closed: 'மூடிய சுற்று (பளு)',
      open: 'திறந்த சுற்று (அளவிலா R)',
      strength: 'காந்த வலிமை (B₀)',
      mass: 'காந்த நிறை (m)',
      turns: 'சுருள் சுற்றுகள் (N)',
      resistance: 'சுருள் மின்தடை (R)',
      logTrial: 'சோதனைப் பதிவைச் சேமி',
      physicsCalculations: 'பௌதிகவியல் கணிப்புகள்',
      emf: 'தூண்டப்பட்ட மின்னியக்க விசை',
      current: 'தூண்டப்பட்ட மின்னோட்டம் (I)',
      braking: 'காந்த பிரேக்கிங் விசை',
      velocity: 'காந்த வேகம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'பதிவு செய்யப்பட்ட சோதனை வரலாறு',
      pdf: 'PDF ஏற்றுமதி செய்'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [magnetMass, setMagnetMass] = useState<number>(0.2); // kg
  const [magnetStrength, setMagnetStrength] = useState<number>(1.5); // Tesla scale
  const [coilTurns, setCoilTurns] = useState<number>(200);
  const [isClosedCircuit, setIsClosedCircuit] = useState<boolean>(true);
  const [coilResistance, setCoilResistance] = useState<number>(2.0); // Ohms
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [explainMode, setExplainMode] = useState<boolean>(true);

  // Live state
  const [magnetY, setMagnetY] = useState<number>(40); // Initial Y
  const [velocity, setVelocity] = useState<number>(0);
  const [inducedCurrent, setInducedCurrent] = useState<number>(0);
  const [inducedEMF, setInducedEMF] = useState<number>(0);
  const [magneticForce, setMagneticForce] = useState<number>(0);

  // History buffers for plotting (max 150 entries)
  const [history, setHistory] = useState<{ t: number[]; emf: number[]; current: number[]; force: number[] }>({
    t: [],
    emf: [],
    current: [],
    force: []
  });

  // Lab Notes & logs
  const [notes, setNotes] = useState<string>('');
  const [logs, setLogs] = useState<TrialLog[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timeAccumulatorRef = useRef<number>(0);

  // Resistance value based on open/closed toggle
  const actualResistance = useMemo(() => {
    return isClosedCircuit ? coilResistance : Infinity;
  }, [isClosedCircuit, coilResistance]);

  // Parameters block
  const currentParams = useMemo((): LenzParameters => {
    return {
      magnetMass,
      magnetStrength,
      coilTurns,
      coilResistance: actualResistance,
      gravity: 10
    };
  }, [magnetMass, magnetStrength, coilTurns, actualResistance]);

  // Reset magnet drop
  const handleReset = () => {
    setMagnetY(40);
    setVelocity(0);
    setInducedCurrent(0);
    setInducedEMF(0);
    setMagneticForce(0);
    setHistory({ t: [], emf: [], current: [], force: [] });
    timeAccumulatorRef.current = 0;
  };

  // Falling Magnet Simulation Loop
  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min(0.03, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rectWidth = 540;
      const rectHeight = 320;

      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      canvas.style.width = `${rectWidth}px`;
      canvas.style.height = `${rectHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw background grid lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      // Physics integration step
      let currentY = magnetY;
      let currentV = velocity;
      let state = { magnetY: currentY, velocity: currentV, acceleration: 10, inducedEMF: 0, inducedCurrent: 0, magneticForce: 0, flux: 0 };

      if (isPlaying) {
        state = calculateLenzStep(currentY, currentV, currentParams, dt);
        
        // Loop magnet drop when it falls past screen
        if (state.magnetY > rectHeight + 50) {
          currentY = 40;
          currentV = 0;
          setHistory({ t: [], emf: [], current: [], force: [] });
          timeAccumulatorRef.current = 0;
        } else {
          currentY = state.magnetY;
          currentV = state.velocity;
        }

        setMagnetY(currentY);
        setVelocity(currentV);
        setInducedCurrent(state.inducedCurrent);
        setInducedEMF(state.inducedEMF);
        setMagneticForce(state.magneticForce);

        // Update charts history trail
        timeAccumulatorRef.current += dt;
        setHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextEmf = [...prev.emf, state.inducedEMF];
          const nextI = [...prev.current, state.inducedCurrent];
          const nextF = [...prev.force, state.magneticForce];

          if (nextT.length > 150) {
            nextT.shift(); nextEmf.shift(); nextI.shift(); nextF.shift();
          }
          return { t: nextT, emf: nextEmf, current: nextI, force: nextF };
        });
      }

      const centerX = rectWidth / 2;

      // 1. Draw Cylindrical Copper Coil
      const coilY = 220;
      const coilRadius = 35;
      const coilHeight = 50;

      // Back of coil loops
      ctx.strokeStyle = '#b45309'; // Dark bronze/copper
      ctx.lineWidth = 3.5;
      for (let h = -coilHeight/2; h <= coilHeight/2; h += 8) {
        ctx.beginPath();
        ctx.arc(centerX, coilY + h, coilRadius, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // 2. Draw falling Bar Magnet (Red North, Blue South)
      const magnetWidth = 20;
      const magnetHeight = 60;
      const magY = currentY;

      // Magnetic field lines loops around the magnet (curved visual arcs)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      for (let w = 35; w <= 75; w += 20) {
        ctx.beginPath();
        ctx.ellipse(centerX, magY, w, w * 0.4, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw magnet body
      ctx.fillStyle = '#ef4444'; // North (Red)
      ctx.fillRect(centerX - magnetWidth/2, magY - magnetHeight/2, magnetWidth, magnetHeight/2);
      ctx.fillStyle = '#3b82f6'; // South (Blue)
      ctx.fillRect(centerX - magnetWidth/2, magY, magnetWidth, magnetHeight/2);

      // Label N and S on magnet
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX, magY - 14);
      ctx.fillText('S', centerX, magY + 18);

      // 3. Front of coil loops (overlays magnet if inside!)
      ctx.strokeStyle = '#d97706'; // Bright copper
      for (let h = -coilHeight/2; h <= coilHeight/2; h += 8) {
        ctx.beginPath();
        ctx.arc(centerX, coilY + h, coilRadius, 0, Math.PI);
        ctx.stroke();
      }

      // 4. LED bulb representation
      const ledX = centerX - 120;
      const ledY = coilY;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Wire from coil to LED
      ctx.moveTo(centerX - coilRadius, coilY - 15);
      ctx.lineTo(ledX, coilY - 15);
      ctx.lineTo(ledX, ledY - 10);
      ctx.moveTo(centerX - coilRadius, coilY + 15);
      ctx.lineTo(ledX, coilY + 15);
      ctx.lineTo(ledX, ledY + 10);
      ctx.stroke();

      // Draw LED bulb glowing depending on induced current square
      const currentPower = state.inducedCurrent * state.inducedCurrent;
      const glowOpacity = Math.min(1.0, currentPower * 4.0);

      if (glowOpacity > 0.05) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = glowOpacity * 16;
        ctx.fillStyle = `rgba(251, 191, 36, ${glowOpacity})`;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Current direction arrows on wires if current is flowing
      if (Math.abs(state.inducedCurrent) > 0.005) {
        ctx.fillStyle = '#fbbf24';
        
        ctx.beginPath();
        ctx.arc(centerX - coilRadius - 40, coilY - 15, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, magnetMass, magnetStrength, coilTurns, isClosedCircuit, coilResistance, magnetY, velocity, currentParams]);

  // Log trial log
  const logTrial = () => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Find peaks of EMF and current in history
    const maxEMF = history.emf.length > 0 ? Math.max(...history.emf.map(Math.abs)) : 0;
    const maxCurrent = history.current.length > 0 ? Math.max(...history.current.map(Math.abs)) : 0;

    const newLog: TrialLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      turns: coilTurns,
      resistance: isClosedCircuit ? `${coilResistance.toFixed(1)} Ω` : 'Open Circuit',
      strength: magnetStrength,
      maxEMF: parseFloat(maxEMF.toFixed(3)),
      maxCurrent: parseFloat(maxCurrent.toFixed(3))
    };
    setLogs([newLog, ...logs]);
  };

  const handleExportPDF = () => {
    const content = [
      `A/L Physics Laboratory - Lenz's Law Induction Report`,
      `Institution: Physics by Senath\n`,
      `Logged Parameters History:`,
      ...logs.map(log => 
        `[${log.timestamp}] Turns (N): ${log.turns} | Resistance: ${log.resistance} | Strength: ${log.strength} T => Max EMF: ${log.maxEMF} V | Max Current: ${log.maxCurrent} A`
      ),
      `\nLab Instructor Journal Notes:\n${notes || 'No observations logged.'}`
    ].join('\n');
    downloadReportAsPDF('Lenzs_Law_Report', {}, [], content);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Lenz lab</span>
            </div>

            {/* Coil open / closed loop circuit breaker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">{t.circuitState}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsClosedCircuit(true)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                    isClosedCircuit 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.closed}
                </button>
                <button
                  onClick={() => setIsClosedCircuit(false)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                    !isClosedCircuit 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.open}
                </button>
              </div>
            </div>

            {/* Magnet strength */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.strength}</span>
                <span className="text-slate-800 font-mono">{magnetStrength.toFixed(1)} T</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={magnetStrength}
                onChange={(e) => setMagnetStrength(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Magnet mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.mass}</span>
                <span className="text-slate-800 font-mono">{magnetMass.toFixed(2)} kg</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.02"
                value={magnetMass}
                onChange={(e) => setMagnetMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Coil turns */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.turns}</span>
                <span className="text-slate-800 font-mono">{coilTurns} turns</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="25"
                value={coilTurns}
                onChange={(e) => setCoilTurns(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Coil resistance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.resistance}</span>
                <span className="text-slate-800 font-mono">{isClosedCircuit ? `${coilResistance.toFixed(1)} Ω` : '∞ (Open)'}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={coilResistance}
                disabled={!isClosedCircuit}
                onChange={(e) => setCoilResistance(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

          </div>

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

        {/* Right Column: Visualizer Viewport & Real-Time Plots */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Falling magnet animation tube */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Electromagnetic Induction Falling Magnet Chamber</h3>
              
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Calculation readings (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.emf}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">{inducedEMF.toFixed(3)} V</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.current}:</span>
                  <span className="font-mono text-emerald-600 font-bold">{inducedCurrent.toFixed(3)} A</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.braking}:</span>
                  <span className="font-mono text-red-650 font-bold">
                    {magneticForce !== 0 ? `${Math.abs(magneticForce).toFixed(3)} N (Up)` : '0.000 N'}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                  <span className="text-slate-500">{t.velocity}:</span>
                  <span className="font-mono text-slate-850 font-bold">{velocity.toFixed(2)} m/s</span>
                </div>
              </div>
            </div>

            {/* Plotly line chart (8 Cols) */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-72">
              <PlotlyGraph
                data={[
                  {
                    x: history.t,
                    y: history.emf,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Induced EMF (V)',
                    line: { color: '#3b82f6', width: 2 }
                  },
                  {
                    x: history.t,
                    y: history.current,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Induced Current (A)',
                    line: { color: '#10b981', width: 2 }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 45, r: 15, t: 15, b: 40 },
                  xaxis: { title: { text: 'Time t (s)' } },
                  yaxis: { title: { text: 'Amplitude' } },
                  legend: { orientation: 'h', y: -0.25 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                className="w-full h-full"
              />
            </div>

          </div>

        </div>

      </div>

      {/* Explainer Block */}
      {explainMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-sm border-b border-blue-150 pb-2">
            <Info className="w-4.5 h-4.5" />
            LENZ'S LAW & FARADAY INDUCTION SCIENTIFIC FOUNDATION
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-blue-900 leading-relaxed font-medium">
            <div className="space-y-2">
              <p>
                <strong>Faraday's Law of Electromagnetic Induction:</strong> The magnitude of the induced electromotive force (EMF) in a coil is directly proportional to the rate of change of magnetic flux linked with the coil:
              </p>
              <BlockMath math="\mathcal{E} = -N \frac{d\Phi_B}{dt}" />
              <p>
                Where <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="\mathcal{E}" /></span> is the induced EMF, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="N" /></span> is the number of turns, and <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="\Phi_B" /></span> is the magnetic flux.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Lenz's Law (ලෙන්ස්ගේ නියමය):</strong> The direction of the induced current is always such that it opposes the change in magnetic flux that created it:
              </p>
              <BlockMath math="F_{\text{magnetic}} = N I \frac{d\Phi_B}{dz}" />
              <p>
                As the North pole of the magnet falls towards the top of the coil, the coil sets up a North pole at its top to repel the approaching magnet, doing work against the magnetic repelling force. As the magnet exits, the coil sets up a South pole at its top to attract the retreating magnet. This creates a retarding mechanical force.
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
            placeholder="Record the induced EMF peaks, terminal velocity limits under load, or open circuit versus closed circuit fall times..."
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
                        <span className="font-extrabold text-slate-800">Trial Snapshot</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-medium text-slate-650">{log.resistance} ({log.turns} turns)</span>
                      </div>
                      <div className="flex gap-3 text-slate-500 font-medium">
                        <span>Max EMF: {log.maxEMF} V</span>
                        <span>Max Current: {log.maxCurrent} A</span>
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
