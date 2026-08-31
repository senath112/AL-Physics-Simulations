import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList, Undo } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { workEnergyGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function WorkEnergySimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Energy Conservation Laboratory',
      paramsTitle: 'Parameters',
      mass: 'Block Mass (m)',
      height: 'Initial Height (h₀)',
      friction: 'Friction Coefficient (μ)',
      gravity: 'Gravity (g)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset Block',
      resetTrack: 'Default Track',
      theoryOutput: 'Real-time Energy Spectrum',
      pe: 'Potential Energy (Ep)',
      ke: 'Kinetic Energy (Ek)',
      thermal: 'Thermal Energy (Eth)',
      total: 'Total Energy (E)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      drawInstruction: 'Click & Drag on the canvas to draw a custom track shape!'
    },
    si: {
      title: 'ශක්ති සංරක්ෂණ විද්‍යාගාරය',
      paramsTitle: 'පරාමිතීන්',
      mass: 'ස්කන්ධය (m)',
      height: 'ආරම්භක උස (h₀)',
      friction: 'ඝර්ෂණ සංගුණකය (μ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'මුලට (අංශුව)',
      resetTrack: 'පෙරනිමි මඟ',
      theoryOutput: 'තත්කාලීන ශක්ති ව්‍යාප්තිය',
      pe: 'විභව ශක්තිය (Ep)',
      ke: 'චාලක ශක්තිය (Ek)',
      thermal: 'තාප ශක්තිය (Eth)',
      total: 'මුළු ශක්තිය (E)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      drawInstruction: 'කැන්වසය මත ක්ලික් කර ඇදීමෙන් රිසි පරිදි මඟක් අඳින්න!'
    },
    ta: {
      title: 'ஆற்றல் காப்பு விதிகளின் ஆய்வகம்',
      paramsTitle: 'அளவுருக்கள்',
      mass: 'திணிவு (m)',
      height: 'ஆரம்ப உயரம் (h₀)',
      friction: 'உராய்வு குணகம் (μ)',
      gravity: 'ஈர்ப்பு (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      resetTrack: 'இயல்புப் பாதை',
      theoryOutput: 'ஆற்றல் பரவல் பகுப்பாய்வு',
      pe: 'அழுத்த ஆற்றல் (Ep)',
      ke: 'இயக்க ஆற்றல் (Ek)',
      thermal: 'வெப்ப ஆற்றல் (Eth)',
      total: 'மொத்த ஆற்றல் (E)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      drawInstruction: 'வரைவிடத்தில் கிளிக் செய்து இழுப்பதன் மூலம் தனிப்பயன் பாதையை வரையவும்!'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters state
  const [m, setM] = useState(2.0); // kg
  const [mu, setMu] = useState(0.05); // friction coefficient
  const [g, setG] = useState(9.8); // m/s2
  const [isPlaying, setIsPlaying] = useState(false);

  // Track heights (101 points from x=0 to x=10)
  const trackLength = 10; // meters
  const getDefaultTrack = () => {
    const arr = [];
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * trackLength;
      arr.push(3.0 * Math.pow(1 - x / trackLength, 2)); // default parabola starting at y=3m
    }
    return arr;
  };

  const [heights, setHeights] = useState<number[]>(getDefaultTrack);

  // Precompute segment lengths and cumulative arc lengths for coordinate mapping
  const computeArcLengths = (trackHeights: number[]) => {
    const s = [0];
    let total = 0;
    for (let i = 1; i <= 100; i++) {
      const dx = trackLength / 100;
      const dy = trackHeights[i] - trackHeights[i - 1];
      const ds = Math.sqrt(dx * dx + dy * dy);
      total += ds;
      s.push(total);
    }
    return { s, total };
  };

  const { s: sCoords, total: sMax } = computeArcLengths(heights);

  // Simulation physical coordinates along track
  const [sPos, setSPos] = useState(0); // displacement along cumulative arc length (meters)
  const [vel, setVel] = useState(0); // tangential velocity (m/s)
  const [thermalE, setThermalE] = useState(0); // lost energy due to friction work (J)

  const [labNotes, setLabNotes] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnIndexRef = useRef<number | null>(null);

  // Helper to map s (arc length) to (x, y) coordinates and slope angle (theta)
  const getCoordinatesAtArcLength = (s: number) => {
    const targetS = Math.max(0, Math.min(sMax, s));
    let i = 0;
    while (i < 100 && sCoords[i + 1] < targetS) {
      i++;
    }
    const sStart = sCoords[i];
    const sEnd = sCoords[i + 1];
    const segmentDs = sEnd - sStart;
    const fraction = segmentDs > 0 ? (targetS - sStart) / segmentDs : 0;

    const x = (i + fraction) * (trackLength / 100);
    const y = heights[i] * (1 - fraction) + heights[i + 1] * fraction;

    const dx = trackLength / 100;
    const dy = heights[i + 1] - heights[i];
    const theta = Math.atan2(dy, dx);

    return { x, y, theta };
  };

  // Derived initial height
  const h0 = heights[0];

  // Derived coordinates
  const { x: currentX, y: currentHeight, theta: currentTheta } = getCoordinatesAtArcLength(sPos);

  // Energy terms (Perfect energy conservation solver)
  const potentialE = m * g * currentHeight;
  const totalE = m * g * h0; // initial total energy at x=0
  const kineticE = Math.max(0, totalE - potentialE - thermalE);

  // Physics animation tick using symplectic-like energy correction
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.016, (now - lastTime) / 1000);
      lastTime = now;

      setSPos((prevS) => {
        const { theta } = getCoordinatesAtArcLength(prevS);

        // Forces along track
        const gravityComponent = -g * Math.sin(theta);
        const normalForce = m * g * Math.cos(theta);
        const frictionForce = mu * normalForce;

        // Friction opposes current velocity direction
        const frictionDirection = vel > 0.01 ? 1 : (vel < -0.01 ? -1 : 0);
        const netForce = m * gravityComponent - frictionDirection * frictionForce;
        const acceleration = netForce / m;

        // Forward integration candidate
        let newVel = vel + acceleration * dt;
        const ds = newVel * dt;
        const nextS = prevS + ds;

        // Compute potential and thermal losses at candidate position
        const { y: nextY } = getCoordinatesAtArcLength(nextS);
        const nextPE = m * g * nextY;
        const nextThermal = thermalE + frictionForce * Math.abs(ds);
        
        const remainingEnergy = totalE - nextPE - nextThermal;

        if (remainingEnergy <= 0) {
          // Insufficient energy to proceed up the slope/hill
          if (Math.abs(gravityComponent) > frictionForce / m) {
            // Gravity exceeds friction: turn around
            newVel = -newVel * 0.1; // minor bounce, direction switches
            setVel(newVel);
          } else {
            // Trapped by friction: stop
            newVel = 0;
            setVel(0);
            setIsPlaying(false);
          }
        } else {
          // Clamp magnitude based on exact energy conservation (resolves drift completely)
          const speed = Math.sqrt((2 * remainingEnergy) / m);
          newVel = newVel >= 0 ? speed : -speed;
          setVel(newVel);
        }

        // Apply friction dissipation
        setThermalE((prevLoss) => prevLoss + frictionForce * Math.abs(ds));

        // Limit block position to path limits
        if (nextS <= 0) {
          setVel(0);
          return 0;
        }
        if (nextS >= sMax) {
          setVel(0);
          setIsPlaying(false);
          return sMax;
        }
        return nextS;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vel, m, heights, mu, g, sMax, thermalE]);

  // Render track & block
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { left: 40, right: 40, bottom: 40, top: 40 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    // Draw grid/background area
    ctx.fillStyle = 'rgba(241, 245, 249, 0.2)';
    ctx.fillRect(margin.left, margin.top, chartW, chartH);

    // Draw custom track
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const yMeters = heights[i];
      const screenX = margin.left + (i / 100) * chartW;
      const screenY = margin.top + chartH - (yMeters / 4) * chartH;
      if (i === 0) ctx.moveTo(screenX, screenY);
      else ctx.lineTo(screenX, screenY);
    }
    ctx.stroke();

    // Draw sliding Block
    const blockX = (currentX / trackLength) * chartW;
    const screenBlockX = margin.left + blockX;
    const screenBlockY = margin.top + chartH - (currentHeight / 4) * chartH;

    ctx.save();
    ctx.translate(screenBlockX, screenBlockY);
    ctx.rotate(currentTheta);

    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 12, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw start and end flags
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('0m', margin.left - 10, margin.top + chartH + 15);
    ctx.fillText('10m', margin.left + chartW - 10, margin.top + chartH + 15);
  }, [heights, currentX, currentHeight, currentTheta]);

  const handleReset = () => {
    setIsPlaying(false);
    setSPos(0);
    setVel(0);
    setThermalE(0);
  };

  const handleResetTrack = () => {
    handleReset();
    setHeights(getDefaultTrack());
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'energy_sim',
    simulationTitle: 'Work, Energy & Power',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'height', label: 'Height h', unit: 'm' },
      { key: 'velocity', label: 'Velocity v', unit: 'm/s' },
      { key: 'velocitySq', label: 'Velocity Squared v²', unit: 'm²/s²' },
      { key: 'potentialEnergy', label: 'Potential Energy Ep', unit: 'J' },
      { key: 'kineticEnergy', label: 'Kinetic Energy Ek', unit: 'J' },
      { key: 'thermalEnergy', label: 'Thermal Dissipation Eth', unit: 'J' },
      { key: 'totalEnergy', label: 'Total Energy E', unit: 'J' },
    ],
    getCurrentRow: () => {
      const v = vel;
      return {
        height: parseFloat(currentHeight.toFixed(2)),
        velocity: parseFloat(v.toFixed(2)),
        velocitySq: parseFloat((v * v).toFixed(2)),
        potentialEnergy: parseFloat(potentialE.toFixed(2)),
        kineticEnergy: parseFloat(kineticE.toFixed(2)),
        thermalEnergy: parseFloat(thermalE.toFixed(2)),
        totalEnergy: parseFloat(totalE.toFixed(2)),
      };
    },
    getSeriesData: () => {
      const hVals = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
      return hVals.map((h, idx) => {
        const pe = m * g * h;
        const ke = pe;
        const spd = Math.sqrt((2 * ke) / m);
        return {
          trial: idx + 1,
          height: h,
          velocity: parseFloat(spd.toFixed(2)),
          velocitySq: parseFloat((spd * spd).toFixed(2)),
          potentialEnergy: parseFloat(pe.toFixed(2)),
          kineticEnergy: parseFloat(ke.toFixed(2)),
          thermalEnergy: 0,
          totalEnergy: parseFloat(pe.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Cart Mass m = 1.0 kg', params: { m: 1.0 }, durationMs: 750 },
        { label: 'Cart Mass m = 2.0 kg', params: { m: 2.0 }, durationMs: 750 },
        { label: 'Cart Mass m = 3.0 kg', params: { m: 3.0 }, durationMs: 750 },
        { label: 'Cart Mass m = 4.0 kg', params: { m: 4.0 }, durationMs: 750 },
        { label: 'Cart Mass m = 5.0 kg', params: { m: 5.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.m !== undefined) {
          setM(p.m);
          handleReset();
        }
      },
    },
    defaultGraphConfig: {
      xAxis: 'height',
      yAxis: 'velocitySq',
      title: 'v² vs Height h (v² = 2gh, Slope = 2g)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Mass (m)': `${m} kg`,
      'Initial Height (h0)': `${h0.toFixed(2)} m`,
      'Friction Coefficient (mu)': `${mu}`,
      'Final Kinetic Energy': `${kineticE.toFixed(2)} J`,
      'Thermal Energy Dissipation': `${thermalE.toFixed(2)} J`
    };
    downloadReportAsPDF('Work and Energy Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  // Canvas drawing path handlers
  const handleDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const margin = { left: 40, right: 40, bottom: 40, top: 40 };
    const chartW = 540 - margin.left - margin.right;
    const chartH = 240 - margin.top - margin.bottom;

    const chartX = x - margin.left;
    const chartY = chartH + margin.top - y;

    const idx = Math.round((chartX / chartW) * 100);
    const h = Math.max(0, Math.min(4.0, (chartY / chartH) * 4));

    if (idx >= 0 && idx <= 100) {
      setHeights((prev) => {
        const next = [...prev];
        if (lastDrawnIndexRef.current !== null) {
          const start = Math.min(lastDrawnIndexRef.current, idx);
          const end = Math.max(lastDrawnIndexRef.current, idx);
          const startH = prev[lastDrawnIndexRef.current];
          const endH = h;
          for (let k = start; k <= end; k++) {
            const frac = start === end ? 0.5 : (k - start) / (end - start);
            next[k] = startH + (endH - startH) * frac;
          }
        } else {
          next[idx] = h;
        }
        return next;
      });
      lastDrawnIndexRef.current = idx;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPlaying(false);
    setIsDrawing(true);
    lastDrawnIndexRef.current = null;
    handleDrawing(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleDrawing(e.clientX, e.clientY);
  };

  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
    lastDrawnIndexRef.current = null;
    handleReset();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsPlaying(false);
    setIsDrawing(true);
    lastDrawnIndexRef.current = null;
    if (e.touches[0]) {
      handleDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.touches[0]) {
      handleDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.paramsTitle}</span>
            {recorder.isAutoRunning && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                🔒 Auto-Running
              </span>
            )}
          </h3>

          {/* Mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass}</span>
              <span className="text-slate-700 font-mono">{m.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="0.5" max="5.0" step="0.1" value={m}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Initial height display (calculated from heights[0]) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.height}</span>
              <span className="text-slate-700 font-mono">{h0.toFixed(2)} m</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium italic">
              * Set by drawing starting point
            </div>
          </div>

          {/* Friction coefficient slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.friction}</span>
              <span className="text-slate-700 font-mono">{mu.toFixed(3)}</span>
            </div>
            <input
              type="range" min="0" max="0.3" step="0.01" value={mu}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setMu(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Gravity slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-slate-700 font-mono">{g.toFixed(1)} m/s²</span>
            </div>
            <input
              type="range" min="1" max="20" step="0.1" value={g}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setG(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Energy breakdown bars */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="space-y-2 text-xs">
            {/* Potential Energy */}
            <div>
              <div className="flex justify-between font-bold text-blue-600 mb-1">
                <span>{t.pe}</span>
                <span>{potentialE.toFixed(1)} J</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalE > 0 ? (potentialE / totalE) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Kinetic Energy */}
            <div>
              <div className="flex justify-between font-bold text-emerald-600 mb-1">
                <span>{t.ke}</span>
                <span>{kineticE.toFixed(1)} J</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalE > 0 ? (kineticE / totalE) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Thermal Energy */}
            <div>
              <div className="flex justify-between font-bold text-red-600 mb-1">
                <span>{t.thermal}</span>
                <span>{thermalE.toFixed(1)} J</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${totalE > 0 ? (thermalE / totalE) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
            <span className="text-[10px] font-semibold text-blue-650 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              {t.drawInstruction}
            </span>
          </div>

          <div className="w-full min-h-[320px] flex-1 flex items-center justify-center p-4 bg-slate-50/20 rounded-xl">
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              className="border border-slate-100 rounded-lg bg-slate-50/20 cursor-crosshair touch-none" 
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all flex items-center gap-1"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.reset}
              </button>
              <button
                onClick={handleResetTrack}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all flex items-center gap-1"
                title="Reset track shape"
              >
                <Undo className="w-3.5 h-3.5" />
                {t.resetTrack}
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={workEnergyGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ mass: m, initialHeight: h0, mu, gravity: g }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={250}
        />

        {/* Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            {t.labNotes}
          </h3>

          <textarea
            value={labNotes}
            onChange={(e) => setLabNotes(e.target.value)}
            placeholder="Type your laboratory observations, findings, and notes here..."
            className="w-full flex-1 border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans min-h-[80px]"
          />

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
            onDownloadPDF={handleDownloadPDF}
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
