import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { circularMotionGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function CircularMotionSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Circular Motion Simulator',
      paramsTitle: 'Parameters',
      mode: 'Motion Plane',
      modeHorizontal: 'Horizontal Circle',
      modeVertical: 'Vertical Circle',
      mass: 'Mass (m)',
      radius: 'Radius (r)',
      speed: 'Tangential Speed (v)',
      gravity: 'Gravity (g)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Centripetal & Gravity Vectors',
      theoryOutput: 'Theoretical Analysis',
      centripetalForce: 'Centripetal Force (Fc)',
      topTension: 'Tension at Top (T_top)',
      bottomTension: 'Tension at Bottom (T_bottom)',
      minSpeedTop: 'Min Speed at Top (v_crit)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      slackWarning: 'String Slack! Simulation stopped.'
    },
    si: {
      title: 'වෘත්ත චලිත සිමියුලේටරය',
      paramsTitle: 'පරාමිතීන්',
      mode: 'චලිත තලය',
      modeHorizontal: 'තිරස් වෘත්තය',
      modeVertical: 'සිරස් වෘත්තය',
      mass: 'ස්කන්ධය (m)',
      radius: 'අරය (r)',
      speed: 'ස්පර්ශීය වේගය (v)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'අභිකේන්ද්‍ර සහ බර දෛශික පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      centripetalForce: 'අභිකේන්ද්‍ර බලය (Fc)',
      topTension: 'ඉහළම ලක්ෂ්‍යයේ ආතතිය',
      bottomTension: 'පහළම ලක්ෂ්‍යයේ ආතතිය',
      minSpeedTop: 'ඉහළම ලක්ෂ්‍යයේ අවම වේගය',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      slackWarning: 'තන්තුව බුරුල් විය! සිමියුලේෂනය නතර කරන ලදී.'
    },
    ta: {
      title: 'வட்ட இயக்கம் சிமுலேட்டர்',
      paramsTitle: 'அளவுருக்கள்',
      mode: 'இயக்கத் தளம்',
      modeHorizontal: 'கிடைவட்ட இயக்கம்',
      modeVertical: 'செங்குத்து வட்ட இயக்கம்',
      mass: 'திணிவு (m)',
      radius: 'ஆரை (r)',
      speed: 'வேகம் (v)',
      gravity: 'ஈர்ப்பு (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'மையநோக்கு விசை திசையன்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      centripetalForce: 'மையநோக்கு விசை (Fc)',
      topTension: 'உச்சி இழுவிசை (T_top)',
      bottomTension: 'அடி இழுவிசை (T_bottom)',
      minSpeedTop: 'உச்சியில் குறைந்தபட்ச வேகம்',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      slackWarning: 'கயிறு தளர்ந்தது! உருவகப்படுத்துதல் நிறுத்தப்பட்டது.'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [mode, setMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [m, setM] = useState(2.0); // kg
  const [r, setR] = useState(1.5); // meters
  const [v, setV] = useState(4.0); // m/s
  const [g, setG] = useState(9.8); // m/s2
  const [showVectors, setShowVectors] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const [angle, setAngle] = useState(0); // rotation angle in radians
  const [isSlack, setIsSlack] = useState(false);
  const [labNotes, setLabNotes] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physics Calculations
  const omega = r > 0 ? v / r : 0;
  const fc = r > 0 ? (m * v * v) / r : 0;
  const minSpeedTop = Math.sqrt(g * r);

  // Vertical tensions
  const tensionTop = r > 0 ? (m * v * v) / r - m * g : 0;
  const tensionBottom = r > 0 ? (m * v * v) / r + m * g : 0;

  // Animation frame loop with slack string checking
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      setAngle((prev) => {
        const nextAngle = (prev + omega * dt) % (2 * Math.PI);
        if (mode === 'vertical') {
          const currentTension = (m * v * v) / r + m * g * Math.cos(nextAngle);
          if (currentTension <= 0) {
            setIsPlaying(false);
            setIsSlack(true);
            return nextAngle;
          }
        }
        return nextAngle;
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, omega, mode, m, v, r, g]);

  // Render circular path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 280;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const cX = width / 2;
    const cY = height / 2;
    const radiusPx = r * 60; // visual scale

    // Draw coordinate center hub
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(cX, cY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw circular orbit line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cX, cY, radiusPx, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Particle coordinates
    // We offset angle by -PI/2 so angle=0 is bottom in vertical circular motion (standard convention)
    const renderAngle = angle - Math.PI / 2;
    const pX = cX + radiusPx * Math.cos(renderAngle);
    const pY = cY + radiusPx * Math.sin(renderAngle);

    // Draw connecting string line (loose if slack)
    if (isSlack) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      // Quadratic curve downwards to simulate sag
      const controlX = (cX + pX) / 2;
      const controlY = Math.max(cY, pY) + 20;
      ctx.quadraticCurveTo(controlX, controlY, pX, pY);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(pX, pY);
      ctx.stroke();
    }

    // Draw Whirling Mass
    ctx.fillStyle = mode === 'horizontal' ? '#3b82f6' : (isSlack ? '#f43f5e' : '#a855f7');
    ctx.strokeStyle = mode === 'horizontal' ? '#1d4ed8' : (isSlack ? '#be123c' : '#7e22ce');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pX, pY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw slack warning overlay
    if (isSlack) {
      ctx.fillStyle = 'rgba(254, 226, 226, 0.9)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cX - 130, 20, 260, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.slackWarning, cX, 37);
    }

    // Draw vector arrows
    if (showVectors && !isSlack) {
      const vScale = 1.2;

      // 1. Centripetal Force or String Tension (pointing towards center cX, cY)
      const currentTension = mode === 'horizontal' ? fc : (m * v * v) / r + m * g * Math.cos(angle);
      const tensionVectorLen = Math.max(10, currentTension * vScale);
      const dxCenter = cX - pX;
      const dyCenter = cY - pY;
      const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
      const tDirX = dxCenter / distCenter;
      const tDirY = dyCenter / distCenter;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + tDirX * tensionVectorLen, pY + tDirY * tensionVectorLen);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(pX + tDirX * tensionVectorLen, pY + tDirY * tensionVectorLen);
      ctx.lineTo(
        pX + tDirX * tensionVectorLen - 5 * tDirX - 3 * tDirY,
        pY + tDirY * tensionVectorLen - 5 * tDirY + 3 * tDirX
      );
      ctx.lineTo(
        pX + tDirX * tensionVectorLen - 5 * tDirX + 3 * tDirY,
        pY + tDirY * tensionVectorLen - 5 * tDirY - 3 * tDirX
      );
      ctx.fill();

      // 2. Gravity vector (downwards, only relevant/changing relative direction in vertical plane)
      if (mode === 'vertical' || g > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        const gLen = m * g * vScale;
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX, pY + gLen);
        ctx.stroke();
        // arrowhead
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(pX, pY + gLen);
        ctx.lineTo(pX - 3, pY + gLen - 4);
        ctx.lineTo(pX + 3, pY + gLen - 4);
        ctx.fill();
      }
    }
  }, [angle, r, mode, m, v, g, showVectors, fc, isSlack]);

  const handleReset = () => {
    setAngle(0);
    setIsSlack(false);
  };

  const handleParamChange = () => {
    setIsSlack(false);
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'circular_motion_sim',
    simulationTitle: 'Circular Motion Dynamics',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'speed', label: 'Speed v', unit: 'm/s' },
      { key: 'speedSq', label: 'Speed Squared v²', unit: 'm²/s²' },
      { key: 'radius', label: 'Radius r', unit: 'm' },
      { key: 'mass', label: 'Mass m', unit: 'kg' },
      { key: 'centripetalForce', label: 'Centripetal Force Fc', unit: 'N' },
      { key: 'topTension', label: 'Tension at Top', unit: 'N' },
      { key: 'bottomTension', label: 'Tension at Bottom', unit: 'N' },
    ],
    autoRunConfig: {
      steps: [
        { label: 'Speed v = 2.0 m/s', params: { v: 2.0 }, durationMs: 750 },
        { label: 'Speed v = 3.0 m/s', params: { v: 3.0 }, durationMs: 750 },
        { label: 'Speed v = 4.0 m/s', params: { v: 4.0 }, durationMs: 750 },
        { label: 'Speed v = 5.0 m/s', params: { v: 5.0 }, durationMs: 750 },
        { label: 'Speed v = 6.0 m/s', params: { v: 6.0 }, durationMs: 750 },
        { label: 'Speed v = 7.0 m/s', params: { v: 7.0 }, durationMs: 750 },
        { label: 'Speed v = 8.0 m/s', params: { v: 8.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.v !== undefined) {
          setV(p.v);
          handleParamChange();
        }
      },
    },
    getCurrentRow: () => ({
      speed: v,
      speedSq: parseFloat((v * v).toFixed(2)),
      radius: r,
      mass: m,
      centripetalForce: parseFloat(fc.toFixed(2)),
      topTension: parseFloat(tensionTop.toFixed(2)),
      bottomTension: parseFloat(tensionBottom.toFixed(2)),
    }),
    getSeriesData: () => {
      const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      return speeds.map((spd, idx) => {
        const f_c = (m * spd * spd) / r;
        return {
          trial: idx + 1,
          speed: spd,
          speedSq: parseFloat((spd * spd).toFixed(2)),
          radius: r,
          mass: m,
          centripetalForce: parseFloat(f_c.toFixed(2)),
          topTension: parseFloat(Math.max(0, f_c - m * 9.8).toFixed(2)),
          bottomTension: parseFloat((f_c + m * 9.8).toFixed(2)),
        };
      });
    },
    defaultGraphConfig: {
      xAxis: 'speedSq',
      yAxis: 'centripetalForce',
      title: 'Fc vs v² (Fc = (m/r)v², Slope = m/r)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Motion Plane': mode,
      'Mass (m)': `${m} kg`,
      'Radius (r)': `${r} m`,
      'Tangential Velocity (v)': `${v} m/s`,
      'Centripetal Force (Fc)': `${fc.toFixed(2)} N`
    };
    downloadReportAsPDF('Circular Motion Lab Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* Mode Selector */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">{t.mode}</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('horizontal'); handleParamChange(); }}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'horizontal' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.modeHorizontal}
              </button>
              <button
                onClick={() => { setMode('vertical'); handleParamChange(); }}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'vertical' ? 'bg-purple-600 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.modeVertical}
              </button>
            </div>
          </div>

          {/* Mass slider */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.mass}</span>
              <span className="text-slate-700 font-mono">{m.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="0.5" max="8.0" step="0.1" value={m}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM(parseFloat(e.target.value)); handleParamChange(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Radius slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.radius}</span>
              <span className="text-slate-700 font-mono">{r.toFixed(2)} m</span>
            </div>
            <input
              type="range" min="0.5" max="2.0" step="0.05" value={r}
              onChange={(e) => { setR(parseFloat(e.target.value)); handleReset(); handleParamChange(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Tangential velocity slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.speed}</span>
              <span className="text-slate-700 font-mono">{v.toFixed(1)} m/s</span>
            </div>
            <input
              type="range" min="1.0" max="10.0" step="0.1" value={v}
              onChange={(e) => { setV(parseFloat(e.target.value)); handleParamChange(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Gravity slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-slate-700 font-mono">{g.toFixed(1)} m/s²</span>
            </div>
            <input
              type="range" min="0" max="20" step="0.1" value={g}
              onChange={(e) => { setG(parseFloat(e.target.value)); handleParamChange(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Vector checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-cm" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-cm" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Theoretical outputs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.centripetalForce}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{fc.toFixed(2)} N</span>
            </div>
            {mode === 'vertical' && (
              <>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-500 block">{t.topTension}</span>
                  <span className={`font-extrabold font-mono text-sm ${tensionTop < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                    {tensionTop < 0 ? 'Slack String (v < v_crit)' : `${tensionTop.toFixed(2)} N`}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-500 block">{t.bottomTension}</span>
                  <span className="font-extrabold text-slate-800 font-mono text-sm">{tensionBottom.toFixed(2)} N</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-500 block">{t.minSpeedTop}</span>
                  <span className="font-extrabold text-purple-600 font-mono text-sm">{minSpeedTop.toFixed(2)} m/s</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Canvas viewports */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
          </div>

          <div className="flex items-center justify-center p-4 min-h-[380px]">
            <canvas ref={canvasRef} className="border border-slate-100 rounded-lg bg-slate-50/20" />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isSlack) handleReset();
                  setIsPlaying(!isPlaying);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset rotation angle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={circularMotionGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ mass: m, radius: r, velocity: v, gravity: g }}
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
