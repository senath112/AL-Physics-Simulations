import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList, Trash2, FileDown } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

export function GravityOrbitsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Orbital Motion & Gravitation',
      paramsTitle: 'Parameters',
      starMass: 'Central Mass (M)',
      distance: 'Orbital Radius (r)',
      launchVel: 'Launch Speed (v)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Gravitational Vector (Fg)',
      theoryOutput: 'Theoretical Analysis',
      orbitalSpeed: 'Circular Orbit Speed',
      escapeSpeed: 'Escape Velocity (v_esc)',
      currentSpeed: 'Current Velocity',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'කක්ෂීය චලිතය සහ ගුරුත්වාකර්ෂණය',
      paramsTitle: 'පරාමිතීන්',
      starMass: 'මධ්‍ය ස්කන්ධය (M)',
      distance: 'කක්ෂීය අරය (r)',
      launchVel: 'ආරම්භක වේගය (v)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'ගුරුත්වාකර්ෂණ බල දෛශිකය පෙන්වන්න (Fg)',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      orbitalSpeed: 'වෘත්තාකාර කක්ෂීය වේගය',
      escapeSpeed: 'මුද්‍රණ ප්‍රවේගය (v_esc)',
      currentSpeed: 'වත්මන් ප්‍රවේගය',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'சுற்றுப்பாதை இயக்கம் & ஈர்ப்பு',
      paramsTitle: 'அளவுருக்கள்',
      starMass: 'மையத் திணிவு (M)',
      distance: 'சுற்றுப்பாதை ஆரை (r)',
      launchVel: 'ஆரம்ப வேகம் (v)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'ஈர்ப்பு விசை திசையனைக் காட்டு (Fg)',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      orbitalSpeed: 'வட்ட சுற்றுப்பாதை வேகம்',
      escapeSpeed: 'விடுபடு வேகம் (v_esc)',
      currentSpeed: 'தற்போதைய வேகம்',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters State
  const [M, setM] = useState(5.0); // central mass factor (arbitrary scaling)
  const [r0, setR0] = useState(1.2); // orbital radius (arbitrary scaling)
  const [vLaunch, setVLaunch] = useState(2.0); // launch velocity factor

  const [isPlaying, setIsPlaying] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  // Orbit coordinates
  const [angle, setAngle] = useState(0); // orbit angle in radians

  const [labNotes, setLabNotes] = useState('');
  const [loggedData, setLoggedData] = useState<any[]>([]);

  // Keplerian orbit geometry: r(theta) = a * (1 - e^2) / (1 + e * cos(theta))
  // For simplicity, we model a stable elliptical trajectory with semi-major axis determined by launch distance
  const a = r0;
  const eVal = Math.max(0, Math.min(0.9, Math.abs(1 - (vLaunch * vLaunch * r0) / M)));

  // Speed calculations based on Kepler's second law / Vis-Viva Equation: v^2 = G*M*(2/r - 1/a)
  const currentRadius = a * (1 - eVal * eVal) / (1 + eVal * Math.cos(angle));
  const currentSpeed = Math.sqrt(Math.max(0.1, M * (2 / currentRadius - 1 / a)));

  const circularSpeed = Math.sqrt(M / r0);
  const escapeSpeed = Math.sqrt((2 * M) / r0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation frame loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      // Kepler's Second Law: dTheta/dt = L / r^2 where angular momentum L is constant
      const L = r0 * vLaunch;
      const dTheta = (L / (currentRadius * currentRadius)) * dt * 2.5; // speed scale

      setAngle((prev) => (prev + dTheta) % (2 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, currentRadius, vLaunch, r0]);

  // Render orbit
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
    const scalePx = 70; // scale factor

    // Draw central star/planet (M)
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cX, cY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Draw elliptical orbit path line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let th = 0; th <= 360; th++) {
      const thRad = (th * Math.PI) / 180;
      const radius = a * (1 - eVal * eVal) / (1 + eVal * Math.cos(thRad));
      const px = cX + radius * scalePx * Math.cos(thRad);
      const py = cY + radius * scalePx * Math.sin(thRad);
      if (th === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Orbiting Satellite position
    const pX = cX + currentRadius * scalePx * Math.cos(angle);
    const pY = cY + currentRadius * scalePx * Math.sin(angle);

    // Draw Satellite (m)
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pX, pY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw vectors
    if (showVectors) {
      // Gravity force arrow (pointing towards central star cX, cY)
      const gravityForce = (M * 2) / (currentRadius * currentRadius); // visual scale force
      const dx = cX - pX;
      const dy = cY - pY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dirX = dx / dist;
      const dirY = dy / dist;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + dirX * gravityForce * 20, pY + dirY * gravityForce * 20);
      ctx.stroke();

      // arrowhead
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(pX + dirX * gravityForce * 20, pY + dirY * gravityForce * 20);
      ctx.lineTo(
        pX + dirX * gravityForce * 20 - 5 * dirX - 3 * dirY,
        pY + dirY * gravityForce * 20 - 5 * dirY + 3 * dirX
      );
      ctx.lineTo(
        pX + dirX * gravityForce * 20 - 5 * dirX + 3 * dirY,
        pY + dirY * gravityForce * 20 - 5 * dirY - 3 * dirX
      );
      ctx.fill();
    }
  }, [angle, a, eVal, currentRadius, M, showVectors]);

  const handleReset = () => {
    setAngle(0);
  };

  const handleLogDataPoint = () => {
    const newPoint = {
      trial: loggedData.length + 1,
      starMass: M,
      distance: `${currentRadius.toFixed(2)} r`,
      speed: `${currentSpeed.toFixed(2)} v`
    };
    setLoggedData((prev) => [...prev, newPoint]);
  };

  const handleDownloadPDF = () => {
    const reportParams = {
      'Central Star Mass (M)': `${M}`,
      'Initial Launch radius (r0)': `${r0}`,
      'Initial Launch speed (vLaunch)': `${vLaunch}`,
      'Final Eccentricity (e)': eVal.toFixed(3)
    };
    downloadReportAsPDF('Gravitational Orbital Motion Lab Report', reportParams, loggedData, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          {/* Central star mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.starMass}</span>
              <span className="text-slate-700 font-mono">{M.toFixed(1)}</span>
            </div>
            <input
              type="range" min="1.0" max="10.0" step="0.2" value={M}
              onChange={(e) => { setM(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Launch Radius slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.distance}</span>
              <span className="text-slate-700 font-mono">{r0.toFixed(2)} AU</span>
            </div>
            <input
              type="range" min="0.6" max="1.8" step="0.05" value={r0}
              onChange={(e) => { setR0(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Launch Speed slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.launchVel}</span>
              <span className="text-slate-700 font-mono">{vLaunch.toFixed(2)} km/s</span>
            </div>
            <input
              type="range" min="0.5" max="3.5" step="0.05" value={vLaunch}
              onChange={(e) => { setVLaunch(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Gravity Vector Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-gravity" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-gravity" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.orbitalSpeed}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{circularSpeed.toFixed(2)} km/s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.escapeSpeed}</span>
              <span className="font-extrabold text-purple-650 font-mono text-sm">{escapeSpeed.toFixed(2)} km/s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.currentSpeed}</span>
              <span className="font-extrabold text-amber-600 font-mono text-sm">{currentSpeed.toFixed(2)} km/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas box */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
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
                title="Reset angle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

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

          <div className="flex gap-2">
            <button
              onClick={handleLogDataPoint}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              {t.logData}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              {t.downloadPDF}
            </button>
            <button
              onClick={() => setLoggedData([])}
              disabled={loggedData.length === 0}
              className="p-2 border border-slate-200 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Clear logged trials"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
