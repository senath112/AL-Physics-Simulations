import { useState, useRef, useEffect } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath } from '../../Math';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Info, 
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { calculateSHMState, SHMParameters } from '../../../physics/shmPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

interface TrialLog {
  id: string;
  timestamp: string;
  mode: string;
  mass: number;
  springK: number;
  length: number;
  damping: number;
  amplitude: number;
  period: number;
  maxEnergy: number;
}

export function SimpleHarmonicMotionSimulation() {
  // Parameters
  const [mode, setMode] = useState<'spring' | 'pendulum'>('spring');
  const [explainMode, setExplainMode] = useState<boolean>(true);
  
  // Controls
  const [mass, setMass] = useState<number>(1.0);        // kg
  const [springK, setSpringK] = useState<number>(15);     // N/m
  const [length, setLength] = useState<number>(2.0);      // meters
  const [damping, setDamping] = useState<number>(0.0);    // b coefficient
  const [amplitude, setAmplitude] = useState<number>(1.2); // meters or radians initial displacement

  // Simulation Time state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const timeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Lab Notes & trial logs
  const [notes, setNotes] = useState<string>('');
  const [logs, setLogs] = useState<TrialLog[]>([]);

  // Canvas interaction
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef<boolean>(false);

  // Chart data history
  const [history, setHistory] = useState<{ t: number[]; x: number[]; v: number[] }>({
    t: [],
    x: [],
    v: []
  });

  // DOM element refs for 60fps energy bar fluctuations
  const ekValRef = useRef<HTMLSpanElement>(null);
  const epValRef = useRef<HTMLSpanElement>(null);
  const eTotalValRef = useRef<HTMLSpanElement>(null);
  const ekBarRef = useRef<HTMLDivElement>(null);
  const epBarRef = useRef<HTMLDivElement>(null);

  // Derived variables
  const omega0 = mode === 'spring' ? Math.sqrt(springK / mass) : Math.sqrt(10 / length);
  const period = 2 * Math.PI / omega0;

  // Calculate current SHM physics state
  const currentParams: SHMParameters = {
    mode,
    mass,
    springK,
    length,
    gravity: 10,
    damping,
    amplitude: mode === 'pendulum' ? (amplitude * Math.PI) / 180 : amplitude
  };
  const shmState = calculateSHMState(timeRef.current, currentParams);

  // Handle Damping presets
  const applyPreset = (preset: 'none' | 'under' | 'critical' | 'over') => {
    if (preset === 'none') {
      setDamping(0.0);
    } else if (preset === 'under') {
      setDamping(mode === 'spring' ? 0.3 : 0.4);
    } else if (preset === 'critical') {
      // b_crit = 2 * sqrt(m * k)
      const bCrit = mode === 'spring' 
        ? 2 * Math.sqrt(mass * springK) 
        : 2 * (mass * length) * Math.sqrt(10 / length);
      setDamping(parseFloat(bCrit.toFixed(2)));
    } else if (preset === 'over') {
      const bCrit = mode === 'spring' 
        ? 2 * Math.sqrt(mass * springK) 
        : 2 * (mass * length) * Math.sqrt(10 / length);
      setDamping(parseFloat((bCrit * 1.8).toFixed(2)));
    }
  };

  // Reset simulation timer
  const handleReset = () => {
    timeRef.current = 0;
    setHistory({ t: [], x: [], v: [] });
    // Force re-draw by checking current params
  };

  // Animation cycle
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const deltaSeconds = Math.min(0.03, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      if (isPlaying && !isDragging.current) {
        timeRef.current += deltaSeconds;

        // Compute new state
        const state = calculateSHMState(timeRef.current, currentParams);

        // Update charts history trail
        setHistory(prev => {
          const nextT = [...prev.t, timeRef.current];
          const nextX = [...prev.x, state.displacement];
          const nextV = [...prev.v, state.velocity];

          // Keep last 150 points for smooth scrolling
          if (nextT.length > 150) {
            nextT.shift();
            nextX.shift();
            nextV.shift();
          }
          return { t: nextT, x: nextX, v: nextV };
        });
      }

      // Compute latest state (even if paused!)
      const latestState = calculateSHMState(timeRef.current, currentParams);
      
      // Update DOM elements directly at 60fps
      if (ekValRef.current) ekValRef.current.innerText = `${latestState.kineticEnergy.toFixed(3)} J`;
      if (epValRef.current) epValRef.current.innerText = `${latestState.potentialEnergy.toFixed(3)} J`;
      if (eTotalValRef.current) eTotalValRef.current.innerText = `${latestState.totalEnergy.toFixed(3)} J`;
      
      const totalE = latestState.totalEnergy || 1;
      const ekPct = Math.min(100, (latestState.kineticEnergy / totalE) * 100);
      const epPct = Math.min(100, (latestState.potentialEnergy / totalE) * 100);
      
      if (ekBarRef.current) ekBarRef.current.style.width = `${ekPct}%`;
      if (epBarRef.current) epBarRef.current.style.width = `${epPct}%`;

      drawSimulation();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, mode, mass, springK, length, damping, amplitude]);

  // Canvas Drawer
  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 720;
    const rectHeight = 340;

    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw background grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < rectWidth; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rectHeight);
      ctx.stroke();
    }
    for (let y = 0; y < rectHeight; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rectWidth, y);
      ctx.stroke();
    }

    const state = calculateSHMState(timeRef.current, currentParams);
    const centerX = rectWidth / 2;

    if (mode === 'spring') {
      // 1. Draw Mass-Spring System
      const ceilingY = 40;
      const restLength = 120;
      
      // Calculate spring stretching scaling
      const extension = state.displacement * 50; // Scale meters to pixels
      const currentLength = restLength + extension;

      // Draw Ceiling support
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(centerX - 80, ceilingY - 10, 160, 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let x = centerX - 75; x < centerX + 80; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, ceilingY - 10);
        ctx.lineTo(x - 5, ceilingY);
        ctx.stroke();
      }

      // Draw spring (helical spring coil logic)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, ceilingY);

      const coils = 18;
      const springWidth = 16;
      for (let i = 0; i <= coils; i++) {
        const fraction = i / coils;
        const currY = ceilingY + fraction * currentLength;
        let currX = centerX;
        if (i > 0 && i < coils) {
          currX += (i % 2 === 0 ? 1 : -1) * springWidth;
        }
        ctx.lineTo(currX, currY);
      }
      ctx.stroke();

      // Draw Mass block
      const blockWidth = 50;
      const blockHeight = 40;
      const blockY = ceilingY + currentLength;

      ctx.fillStyle = '#3b82f6'; // Blue mass block
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - blockWidth / 2, blockY, blockWidth, blockHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Label mass inside block
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)} kg`, centerX, blockY + 24);

      // Draw equilibrium reference line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - 120, ceilingY + restLength + blockHeight/2);
      ctx.lineTo(centerX + 120, ceilingY + restLength + blockHeight/2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px font-sans';
      ctx.fillText('Equilibrium', centerX + 155, ceilingY + restLength + blockHeight/2 + 3);

    } else {
      // 2. Draw Simple Pendulum System
      const pivotX = centerX;
      const pivotY = 50;

      // Draw pivot support
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(pivotX - 40, pivotY - 8, 80, 8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let x = pivotX - 35; x < pivotX + 40; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, pivotY - 8);
        ctx.lineTo(x - 4, pivotY);
        ctx.stroke();
      }

      // Angular displacement theta
      // We scale amplitude to visual swing radians
      const theta = state.displacement; 

      // Length scaling: 1 meter = 80 pixels
      const visualL = length * 85;
      const bobX = pivotX + visualL * Math.sin(theta);
      const bobY = pivotY + visualL * Math.cos(theta);

      // Draw pendulum rod
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw bob
      const bobRadius = 16 + mass * 3;
      ctx.fillStyle = '#ef4444'; // Red bob
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw equilibrium vertical normal (dashed)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + visualL + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label mass inside bob
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)}kg`, bobX, bobY + 3);
    }

    // Overlay physics indicators
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px font-sans';
    ctx.textAlign = 'left';
    ctx.fillText(`Displacement (x): ${state.displacement.toFixed(2)} m`, 20, 30);
    ctx.fillText(`Velocity (v): ${state.velocity.toFixed(2)} m/s`, 20, 48);
    ctx.fillText(`Acceleration (a): ${state.acceleration.toFixed(2)} m/s²`, 20, 66);

    ctx.restore();
  };

  // Click & Drag event listeners for setting amplitude directly
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;

    if (mode === 'spring') {
      // Spring mode dragging block vertical displacement
      // Rest center block Y is around restLength = 120 + ceilingY (40) = 160 px
      const currentBlockY = 40 + 120 + shmState.displacement * 50;
      if (Math.abs(x - centerX) < 40 && Math.abs(y - currentBlockY) < 40) {
        isDragging.current = true;
        setIsPlaying(false);
      }
    } else {
      // Pendulum bob dragging
      const visualL = length * 85;
      const bobX = centerX + visualL * Math.sin(shmState.displacement);
      const bobY = 50 + visualL * Math.cos(shmState.displacement);

      const dx = x - bobX;
      const dy = y - bobY;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        isDragging.current = true;
        setIsPlaying(false);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;

    if (mode === 'spring') {
      // Map vertical coordinate offset relative to equilibrium Y = 160
      const deltaY = y - 160;
      const newAmp = Math.max(-2.0, Math.min(2.0, deltaY / 50));
      setAmplitude(newAmp);
      timeRef.current = 0; // reset phase
      setHistory({ t: [], x: [], v: [] });
    } else {
      // Map angle relative to pivot (centerX, 50)
      const dx = x - centerX;
      const dy = y - 50;
      const angle = Math.atan2(dx, dy); // angle relative to vertical normal
      const newAmpDeg = angle * (180 / Math.PI);
      const clampedAmpDeg = Math.max(-75, Math.min(75, newAmpDeg));
      setAmplitude(clampedAmpDeg);
      timeRef.current = 0;
      setHistory({ t: [], x: [], v: [] });
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setIsPlaying(true);
    }
  };

  // Log trial log
  const logTrial = () => {
    const newLog: TrialLog = {
      id: Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      mode,
      mass,
      springK,
      length,
      damping,
      amplitude,
      period,
      maxEnergy: shmState.totalEnergy
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => setLogs([]);

  // Generate PDF report
  const downloadPDFReport = () => {
    const parameterMap = {
      'Simulation Mode': mode === 'spring' ? 'Mass-Spring System' : 'Simple Pendulum',
      'Mass (m)': `${mass.toFixed(2)} kg`,
      'Damping Coefficient (b)': `${damping.toFixed(2)} N s/m`,
      'Initial Amplitude (A)': `${amplitude.toFixed(2)} ${mode === 'spring' ? 'm' : 'rad'}`,
      'Calculated Period (T)': `${period.toFixed(3)} s`,
      'Total Energy (E)': `${shmState.totalEnergy.toFixed(3)} J`
    };

    const printableLogs = logs.map(log => ({
      Timestamp: log.timestamp,
      Mode: log.mode === 'spring' ? 'Spring' : 'Pendulum',
      Mass: `${log.mass.toFixed(1)}kg`,
      'K / Length': log.mode === 'spring' ? `${log.springK}N/m` : `${log.length}m`,
      Damping: `${log.damping}`,
      Amp: `${log.amplitude.toFixed(2)}`,
      Period: `${log.period.toFixed(2)}s`,
      'Max E': `${log.maxEnergy.toFixed(2)}J`
    }));

    downloadReportAsPDF(
      'Simple Harmonic Motion Lab Report',
      parameterMap,
      printableLogs,
      notes
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Simple Harmonic Motion (SHM) Explainer
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Core Theory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Study mass-spring oscillators, simple pendulums, phase orbits, and damping envelopes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Explain Mode Toggle */}
          <button
            onClick={() => setExplainMode(!explainMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              explainMode 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 hover:border-slate-350 text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explain Mode {explainMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters Column (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* System Mode Select */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select SHM System</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('spring'); setAmplitude(1.2); handleReset(); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'spring' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mass-Spring
              </button>
              <button
                onClick={() => { setMode('pendulum'); setAmplitude(45); handleReset(); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'pendulum' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Simple Pendulum
              </button>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Oscillator Parameters</h3>

            {/* Mass parameter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Mass (m)</span>
                <span className="text-slate-800 font-mono">{mass.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Spring constant or Length depending on mode */}
            {mode === 'spring' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Spring Constant (k)</span>
                  <span className="text-slate-800 font-mono">{springK} N/m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={springK}
                  onChange={(e) => setSpringK(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">String Length (L)</span>
                  <span className="text-slate-800 font-mono">{length.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Damping Coefficient */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Damping Factor (b)</span>
                <span className="text-slate-800 font-mono">{damping.toFixed(2)} N s/m</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />

              {/* Damping Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                <button onClick={() => applyPreset('none')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Undamped</button>
                <button onClick={() => applyPreset('under')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Underdamped</button>
                <button onClick={() => applyPreset('critical')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Crit. Damped</button>
                <button onClick={() => applyPreset('over')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Overdamped</button>
              </div>
            </div>

            {/* Amplitude / Initial Angle slider */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">
                  {mode === 'spring' ? 'Initial Displacement (x₀)' : 'Initial Angle (θ₀)'}
                </span>
                <span className="text-slate-800 font-mono">
                  {amplitude.toFixed(1)} {mode === 'spring' ? 'm' : '°'}
                </span>
              </div>
              <input
                type="range"
                min={mode === 'spring' ? '-2.0' : '-75'}
                max={mode === 'spring' ? '2.0' : '75'}
                step={mode === 'spring' ? '0.05' : '1'}
                value={amplitude}
                onChange={(e) => { setAmplitude(parseFloat(e.target.value)); handleReset(); }}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 font-medium block">Tip: Click & Drag the mass directly inside the viewport!</span>
            </div>

            {/* Simulated environment constraints */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>Gravity Constant (g)</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">10 m/s²</span>
            </div>
          </div>

          {/* Action trigger button */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <button
              onClick={logTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Trial Snapshot
            </button>
          </div>

        </div>

        {/* Right Side: Visual Viewport Column (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Visual Canvas Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Oscillator Viewport</h3>
              
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
                className="border border-slate-100 rounded-lg bg-white cursor-grab active:cursor-grabbing select-none shadow-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Energy conversion bar chart */}
            <div className="w-full mt-4 space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time Energy Spectrum</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Kinetic Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                    <span>Kinetic Energy (Ek)</span>
                    <span ref={ekValRef} className="font-mono">{shmState.kineticEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      ref={ekBarRef}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, (shmState.kineticEnergy / (shmState.totalEnergy || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Potential Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-indigo-600">
                    <span>Potential Energy (Ep)</span>
                    <span ref={epValRef} className="font-mono">{shmState.potentialEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      ref={epBarRef}
                      className="h-full bg-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, (shmState.potentialEnergy / (shmState.totalEnergy || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Total Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-violet-600">
                    <span>Total Energy (E)</span>
                    <span ref={eTotalValRef} className="font-mono">{shmState.totalEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Explain Mode Real-time Card overlay */}
          {explainMode && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Info className="w-4 h-4" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Concept Explainer Overlay</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {damping === 0 ? (
                  `The oscillator displays simple harmonic motion with periodic oscillation of period T = ${period.toFixed(2)} seconds. The energy converts continuously between kinetic energy (maximum at equilibrium) and potential energy (maximum at maximum amplitude), conserving total mechanical energy.`
                ) : shmState.isOverdamped ? (
                  `The system is Overdamped. Since the damping coefficient exceeds the critical value, the oscillator returns to its equilibrium position slowly without crossing it.`
                ) : shmState.isCriticallyDamped ? (
                  `The system is Critically Damped. It returns to equilibrium in the fastest possible time without oscillating.`
                ) : (
                  `The system displays Damped Harmonic Motion. Air resistance gradually dissipates energy, showing an exponential decay envelope on amplitude.`
                )}
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/70 rounded-lg p-3 border border-indigo-200/50">
                <div className="text-xs font-bold text-slate-500 font-mono">Mathematical Formula:</div>
                <div className="text-xs font-bold text-slate-800">
                  {mode === 'spring' ? (
                    <BlockMath math={`T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{${mass.toFixed(1)}}{${springK}}} = ${period.toFixed(2)}s`} />
                  ) : (
                    <BlockMath math={`T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{${length.toFixed(1)}}{10}} = ${period.toFixed(2)}s`} />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Numerical Data Graph & Lab Book Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plotly Graph Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Oscillation Curves & Phase Orbit</h3>
          <div className="flex-1 min-h-[300px] grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Waveform displacement vs time */}
            <div className="h-full">
              <PlotlyGraph
                data={[
                  {
                    x: history.t,
                    y: history.x,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Displacement (m)',
                    line: { color: '#3b82f6', width: 2 }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 35, r: 10, t: 10, b: 35 },
                  xaxis: { title: { text: 'Time (t)' } },
                  yaxis: { title: { text: 'Displacement (x)' } },
                  legend: { orientation: 'h', y: -0.25 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                className="w-full h-full"
              />
            </div>

            {/* Phase Orbit Velocity vs Displacement */}
            <div className="h-full">
              <PlotlyGraph
                data={[
                  {
                    x: history.x,
                    y: history.v,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Phase space orbit',
                    line: { color: '#ef4444', width: 2 }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 35, r: 10, t: 10, b: 35 },
                  xaxis: { title: { text: 'Position (x)' } },
                  yaxis: { title: { text: 'Velocity (v)' } },
                  legend: { orientation: 'h', y: -0.25 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                className="w-full h-full"
              />
            </div>

          </div>
        </div>

        {/* Lab Notes Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Notebook Notes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="text-slate-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear notebook logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
              <button
                onClick={downloadPDFReport}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                PDF Report
              </button>
            </div>
          </div>

          <textarea
            placeholder="Log experimental observations, write deductions here. (e.g. Damping factor reduces total mechanical energy exponentially...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
          />

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Logged Trials ({logs.length})</h4>
            <div className="border border-slate-100 rounded-lg max-h-36 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="p-2.5 flex items-center justify-between text-[10px] text-slate-600 hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-bold text-indigo-600">#{log.id}</span>
                      <span className="text-slate-400 ml-1.5">({log.timestamp})</span>
                      <div className="mt-0.5">
                        Mode: <span className="font-semibold text-slate-800">{log.mode}</span> | 
                        Mass: <span className="font-semibold text-slate-800">{log.mass.toFixed(1)}kg</span> | 
                        T: <span className="font-semibold text-slate-800">{log.period.toFixed(2)}s</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>Max E: <span className="font-bold text-slate-800">{log.maxEnergy.toFixed(2)} J</span></div>
                      <div className="text-[9px] text-slate-400">Damping: {log.damping}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No snapshots logged yet. Adjust variables and click "Log Trial Snapshot" above.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
