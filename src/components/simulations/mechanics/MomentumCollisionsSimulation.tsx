import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { momentumCollisionsGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function MomentumCollisionsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Momentum & Collisions Lab',
      paramsTitle: 'Parameters',
      mass1: 'Cart 1 Mass (m₁)',
      vel1: 'Cart 1 Velocity (u₁)',
      mass2: 'Cart 2 Mass (m₂)',
      vel2: 'Cart 2 Velocity (u₂)',
      restitution: 'Restitution Coeff (e)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      theoryOutput: 'Theoretical Analysis',
      vel1Final: 'Cart 1 Post-Collision (v₁)',
      vel2Final: 'Cart 2 Post-Collision (v₂)',
      totalMomentum: 'Total Momentum (P)',
      energyLoss: 'Kinetic Energy Loss',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'ගම්‍යතාවය සහ ගැටුම් විද්‍යාගාරය',
      paramsTitle: 'පරාමිතීන්',
      mass1: 'කරත්තය 1 ස්කන්ධය (m₁)',
      vel1: 'කරත්තය 1 ප්‍රවේගය (u₁)',
      mass2: 'කරත්තය 2 ස්කන්ධය (m₂)',
      vel2: 'කරත්තය 2 ප්‍රවේගය (u₂)',
      restitution: 'ප්‍රත්‍යානක සංගුණකය (e)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      vel1Final: 'කරත්තය 1 පසු-ප්‍රවේගය (v₁)',
      vel2Final: 'කරත්තය 2 පසු-ප්‍රවේගය (v₂)',
      totalMomentum: 'මුළු ගම්‍යතාවය (P)',
      energyLoss: 'චාලක ශක්ති හානිය',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'உந்தம் & மோதல் ஆய்வகம்',
      paramsTitle: 'அளவுருக்கள்',
      mass1: 'வண்டி 1 நிறை (m₁)',
      vel1: 'வண்டி 1 ஆரம்ப வேகம் (u₁)',
      mass2: 'வண்டி 2 நிறை (m₂)',
      vel2: 'வண்டி 2 ஆரம்ப வேகம் (u₂)',
      restitution: 'மீட்சிக்குணகம் (e)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      vel1Final: 'வண்டி 1 இறுதி வேகம் (v₁)',
      vel2Final: 'வண்டி 2 இறுதி வேகம் (v₂)',
      totalMomentum: 'மொத்த உந்தம் (P)',
      energyLoss: 'இயக்க ஆற்றல் இழப்பு',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters State
  const [m1, setM1] = useState(3.0); // kg
  const [u1, setU1] = useState(3.0); // m/s
  const [m2, setM2] = useState(2.0); // kg
  const [u2, setU2] = useState(-1.5); // m/s
  const [e, setE] = useState(1.0); // elastic coefficient

  const [isPlaying, setIsPlaying] = useState(false);

  // Animation cart positions
  const [x1, setX1] = useState(100);
  const [x2, setX2] = useState(380);
  const [v1, setV1] = useState(u1);
  const [v2, setV2] = useState(u2);
  const [hasCollided, setHasCollided] = useState(false);

  const [labNotes, setLabNotes] = useState('');

  // Theoretical final velocities calculations
  // v1 = ((m1 - e*m2)*u1 + (1+e)*m2*u2) / (m1 + m2)
  // v2 = ((1+e)*m1*u1 + (m2 - e*m1)*u2) / (m1 + m2)
  const calcV1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
  const calcV2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / (m1 + m2);

  const initialMomentum = m1 * u1 + m2 * u2;
  const initialKE = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const finalKE = 0.5 * m1 * calcV1 * calcV1 + 0.5 * m2 * calcV2 * calcV2;
  const keLoss = Math.max(0, initialKE - finalKE);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All mutable physics state lives here – never stale inside rAF
  const phys = useRef({ x1: 120, x2: 400, v1: u1, v2: u2, hasCollided: false });

  // Keep phys in sync when parameters change (only while paused / reset)
  useEffect(() => {
    if (!isPlaying) {
      phys.current.v1 = u1;
      phys.current.v2 = u2;
    }
  }, [u1, u2, isPlaying]);

  // Helper to paint a frame from phys.current
  const drawFrame = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 240;

    if (canvas.width !== width * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, width, height);

    // Track
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(520, 180);
    ctx.stroke();

    // Walls
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, 120, 10, 60);
    ctx.fillRect(520, 120, 10, 60);

    const R = 22;
    const cy = 180 - R;

    const drawSphere = (cx: number, fillColor: string, strokeColor: string, label: string) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      grad.addColorStop(0, 'rgba(255,255,255,0.55)');
      grad.addColorStop(0.4, fillColor);
      grad.addColorStop(1, strokeColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.28, cy - R * 0.28, R * 0.28, R * 0.18, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy + 1);
    };

    drawSphere(phys.current.x1, '#ef4444', '#b91c1c', 'm₁');
    drawSphere(phys.current.x2, '#10b981', '#047857', 'm₂');

    // Velocity arrows
    const drawVelArrow = (xPos: number, velocity: number, color: string) => {
      if (Math.abs(velocity) < 0.1) return;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.textBaseline = 'alphabetic';
      const arrowLen = velocity * 15;
      const arrowY = cy - R - 10;
      ctx.beginPath();
      ctx.moveTo(xPos, arrowY);
      ctx.lineTo(xPos + arrowLen, arrowY);
      ctx.stroke();
      ctx.beginPath();
      const d = velocity > 0 ? 1 : -1;
      ctx.moveTo(xPos + arrowLen, arrowY);
      ctx.lineTo(xPos + arrowLen - 4 * d, arrowY - 3);
      ctx.lineTo(xPos + arrowLen - 4 * d, arrowY + 3);
      ctx.fill();
    };

    drawVelArrow(phys.current.x1, phys.current.v1, '#2563eb');
    drawVelArrow(phys.current.x2, phys.current.v2, '#059669');
  };

  // Draw initial static frame whenever parameters or isPlaying changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFrame(canvas);
  }, [x1, x2, v1, v2, hasCollided, u1, u2]);

  // Single rAF loop – all physics + drawing inside, no stale closures
  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      const p = phys.current;
      const newX1 = p.x1 + p.v1 * dt * 20;
      const newX2 = p.x2 + p.v2 * dt * 20;

      if (!p.hasCollided && newX1 >= newX2 - 44) {
        // Collision: snap to contact and apply post-collision velocities
        p.hasCollided = true;
        p.x1 = newX2 - 44;
        p.x2 = newX2;
        // calcV1/calcV2 based on current params (captured once at effect start, stable)
        p.v1 = calcV1;
        p.v2 = calcV2;
        // Sync React display state
        setHasCollided(true);
        setV1(calcV1);
        setV2(calcV2);
        setX1(p.x1);
        setX2(p.x2);
      } else {
        p.x1 = newX1;
        p.x2 = newX2;
        setX1(newX1);
        setX2(newX2);
      }

      // Stop when a sphere goes out of bounds
      if (p.x1 < 20 || p.x2 > 520) {
        setIsPlaying(false);
        return;
      }

      const canvas = canvasRef.current;
      if (canvas) drawFrame(canvas);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, calcV1, calcV2]);

  const handleReset = () => {
    setIsPlaying(false);
    phys.current = { x1: 120, x2: 400, v1: u1, v2: u2, hasCollided: false };
    setX1(120);
    setX2(400);
    setV1(u1);
    setV2(u2);
    setHasCollided(false);
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'collisions_sim',
    simulationTitle: 'Momentum & Collisions Conservation',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'initialMomentum', label: 'Initial Momentum (p_i)', unit: 'kg·m/s' },
      { key: 'finalMomentum', label: 'Final Momentum (p_f)', unit: 'kg·m/s' },
      { key: 'mass1', label: 'Mass 1', unit: 'kg' },
      { key: 'vel1Initial', label: 'u1', unit: 'm/s' },
      { key: 'vel1Final', label: 'v1', unit: 'm/s' },
      { key: 'mass2', label: 'Mass 2', unit: 'kg' },
      { key: 'vel2Initial', label: 'u2', unit: 'm/s' },
      { key: 'vel2Final', label: 'v2', unit: 'm/s' },
      { key: 'restitution', label: 'Restitution (e)', unit: '' },
      { key: 'energyLoss', label: 'Kinetic Energy Loss', unit: 'J' },
    ],
    getCurrentRow: () => {
      const pInitial = m1 * u1 + m2 * u2;
      const pFinal = m1 * calcV1 + m2 * calcV2;
      return {
        initialMomentum: parseFloat(pInitial.toFixed(2)),
        finalMomentum: parseFloat(pFinal.toFixed(2)),
        mass1: m1,
        vel1Initial: u1,
        vel1Final: parseFloat(calcV1.toFixed(2)),
        mass2: m2,
        vel2Initial: u2,
        vel2Final: parseFloat(calcV2.toFixed(2)),
        restitution: e,
        energyLoss: parseFloat(keLoss.toFixed(2)),
      };
    },
    getSeriesData: () => {
      const u1Vals = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
      return u1Vals.map((vel1, idx) => {
        const pInit = m1 * vel1 + m2 * u2;
        const v1 = ((m1 - e * m2) * vel1 + (1 + e) * m2 * u2) / (m1 + m2);
        const v2 = ((1 + e) * m1 * vel1 + (m2 - e * m1) * u2) / (m1 + m2);
        const pFin = m1 * v1 + m2 * v2;
        const initialKE = 0.5 * m1 * vel1 * vel1 + 0.5 * m2 * u2 * u2;
        const finalKE = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
        return {
          trial: idx + 1,
          initialMomentum: parseFloat(pInit.toFixed(2)),
          finalMomentum: parseFloat(pFin.toFixed(2)),
          mass1: m1,
          vel1Initial: vel1,
          vel1Final: parseFloat(v1.toFixed(2)),
          mass2: m2,
          vel2Initial: u2,
          vel2Final: parseFloat(v2.toFixed(2)),
          restitution: e,
          energyLoss: parseFloat(Math.max(0, initialKE - finalKE).toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Cart 1 Vel u₁ = 1.0 m/s', params: { u1: 1.0 }, durationMs: 750 },
        { label: 'Cart 1 Vel u₁ = 2.0 m/s', params: { u1: 2.0 }, durationMs: 750 },
        { label: 'Cart 1 Vel u₁ = 3.0 m/s', params: { u1: 3.0 }, durationMs: 750 },
        { label: 'Cart 1 Vel u₁ = 4.0 m/s', params: { u1: 4.0 }, durationMs: 750 },
        { label: 'Cart 1 Vel u₁ = 5.0 m/s', params: { u1: 5.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.u1 !== undefined) {
          setU1(p.u1);
          handleReset();
        }
      },
    },
    defaultGraphConfig: {
      xAxis: 'initialMomentum',
      yAxis: 'finalMomentum',
      title: 'Conservation of Momentum: p_f vs p_i (Slope = 1.0)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Cart 1 Mass (m1)': `${m1} kg`,
      'Cart 1 Initial Velocity (u1)': `${u1} m/s`,
      'Cart 2 Mass (m2)': `${m2} kg`,
      'Cart 2 Initial Velocity (u2)': `${u2} m/s`,
      'Restitution Coefficient (e)': `${e}`,
      'Cart 1 Final Velocity (v1)': `${calcV1.toFixed(2)} m/s`,
      'Cart 2 Final Velocity (v2)': `${calcV2.toFixed(2)} m/s`,
      'Kinetic Energy Loss': `${keLoss.toFixed(2)} J`
    };
    downloadReportAsPDF('Momentum and Collisions Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Sidebar Controls */}
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

          {/* Cart 1 Mass */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass1}</span>
              <span className="text-blue-600 font-mono">{m1.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="10" step="0.2" value={m1}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM1(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Cart 1 Velocity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.vel1}</span>
              <span className="text-blue-600 font-mono">{u1.toFixed(1)} m/s</span>
            </div>
            <input
              type="range" min="0" max="5" step="0.2" value={u1}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setU1(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Cart 2 Mass */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass2}</span>
              <span className="text-emerald-600 font-mono">{m2.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="10" step="0.2" value={m2}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM2(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Cart 2 Velocity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.vel2}</span>
              <span className="text-emerald-600 font-mono">{u2.toFixed(1)} m/s</span>
            </div>
            <input
              type="range" min="-5" max="0" step="0.2" value={u2}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setU2(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Restitution coefficient slider */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.restitution}</span>
              <span className="text-slate-800 font-mono">{e.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05" value={e}
              onChange={(e) => { setE(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Sticky (0.00)</span>
              <span>Elastic (1.00)</span>
            </div>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.vel1Final}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{calcV1.toFixed(2)} m/s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.vel2Final}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{calcV2.toFixed(2)} m/s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.totalMomentum}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{initialMomentum.toFixed(2)} kg·m/s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.energyLoss}</span>
              <span className="font-extrabold text-red-600 font-mono text-sm">{keLoss.toFixed(2)} J</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas viewports */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
          </div>

          <div className="w-full min-h-[320px] flex-1 flex items-center justify-center p-4 bg-slate-50/20 rounded-xl">
            <canvas ref={canvasRef} className="border border-slate-100 rounded-lg bg-slate-50/20" />
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
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={momentumCollisionsGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ mass1: m1, vel1: u1, mass2: m2, vel2: u2, restitution: e }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={250}
        />

        {/* Observation log */}
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
