import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList, Trash2, FileDown } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

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
      reset: 'Reset',
      theoryOutput: 'Real-time Energy Spectrum',
      pe: 'Potential Energy (Ep)',
      ke: 'Kinetic Energy (Ek)',
      thermal: 'Thermal Energy (Eth)',
      total: 'Total Energy (E)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
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
      reset: 'නැවත මුලට',
      theoryOutput: 'තත්කාලීන ශක්ති ව්‍යාප්තිය',
      pe: 'විභව ශක්තිය (Ep)',
      ke: 'චාලක ශක්තිය (Ek)',
      thermal: 'තාප ශක්තිය (Eth)',
      total: 'මුළු ශක්තිය (E)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
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
      theoryOutput: 'ஆற்றல் பரவல் பகுப்பாய்வு',
      pe: 'அழுத்த ஆற்றல் (Ep)',
      ke: 'இயக்க ஆற்றல் (Ek)',
      thermal: 'வெப்ப ஆற்றல் (Eth)',
      total: 'மொத்த ஆற்றல் (E)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters state
  const [m, setM] = useState(2.0); // kg
  const [h0, setH0] = useState(3.0); // meters
  const [mu, setMu] = useState(0.05); // friction coefficient
  const [g, setG] = useState(9.8); // m/s2
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulation physical coordinates along track
  // Parabolic track shape: y(x) = h0 * (1 - x / L)^2
  const trackLength = 10; // meters
  const [xPos, setXPos] = useState(0); // horizontal displacement (meters)
  const [vel, setVel] = useState(0); // tangential velocity (m/s)
  const [thermalE, setThermalE] = useState(0); // lost mechanical energy (J)

  const [labNotes, setLabNotes] = useState('');
  const [loggedData, setLoggedData] = useState<any[]>([]);

  // Physics loop values
  const currentHeight = h0 * Math.pow(1 - xPos / trackLength, 2);
  const potentialE = m * g * currentHeight;
  const totalE = m * g * h0; // initial energy

  const kineticE = Math.max(0, totalE - potentialE - thermalE);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physics animation tick
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      setXPos((prevX) => {
        if (prevX >= trackLength - 0.1) {
          setIsPlaying(false);
          return trackLength;
        }

        // slope dy/dx = -2 * h0 / L * (1 - x / L)
        const slope = (-2 * h0 / trackLength) * (1 - prevX / trackLength);
        const theta = Math.atan(slope);

        // forces along slope
        const gravityComponent = -g * Math.sin(theta);
        const normalForce = m * g * Math.cos(theta);
        const frictionForce = mu * normalForce;

        // net acceleration
        const netForceAlongSlope = m * gravityComponent - frictionForce;
        const acceleration = netForceAlongSlope / m;

        const newVel = vel + acceleration * dt;
        setVel(newVel);

        // update position
        const ds = newVel * dt;
        const dx = ds * Math.cos(theta);

        // energy loss due to friction work: W = f * ds
        setThermalE((prevLoss) => prevLoss + frictionForce * Math.abs(ds));

        return Math.min(trackLength, prevX + dx);
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vel, m, h0, mu, g]);

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

    // Draw Parabolic Track shape
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let px = 0; px <= chartW; px++) {
      const xMeters = (px / chartW) * trackLength;
      const yMeters = h0 * Math.pow(1 - xMeters / trackLength, 2);
      // coordinate map
      const screenX = margin.left + px;
      const screenY = margin.top + chartH - (yMeters / 4) * chartH; // max height scale = 4m
      if (px === 0) ctx.moveTo(screenX, screenY);
      else ctx.lineTo(screenX, screenY);
    }
    ctx.stroke();

    // Draw sliding Block
    const blockX = (xPos / trackLength) * chartW;
    const blockY = currentHeight;
    const screenBlockX = margin.left + blockX;
    const screenBlockY = margin.top + chartH - (blockY / 4) * chartH;

    // slope angle for rotation
    const slope = (-2 * h0 / trackLength) * (1 - xPos / trackLength);
    const theta = Math.atan(slope);

    ctx.save();
    ctx.translate(screenBlockX, screenBlockY);
    ctx.rotate(theta);

    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 12, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [xPos, currentHeight, h0]);

  const handleReset = () => {
    setIsPlaying(false);
    setXPos(0);
    setVel(0);
    setThermalE(0);
  };

  const handleLogDataPoint = () => {
    const newPoint = {
      trial: loggedData.length + 1,
      x: `${xPos.toFixed(2)} m`,
      pe: `${potentialE.toFixed(2)} J`,
      ke: `${kineticE.toFixed(2)} J`,
      loss: `${thermalE.toFixed(2)} J`
    };
    setLoggedData((prev) => [...prev, newPoint]);
  };

  const handleDownloadPDF = () => {
    const reportParams = {
      'Mass (m)': `${m} kg`,
      'Initial Height (h0)': `${h0} m`,
      'Friction Coefficient (mu)': `${mu}`,
      'Final Kinetic Energy': `${kineticE.toFixed(2)} J`,
      'Thermal Energy Dissipation': `${thermalE.toFixed(2)} J`
    };
    downloadReportAsPDF('Work and Energy Lab Report', reportParams, loggedData, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          {/* Mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass}</span>
              <span className="text-slate-700 font-mono">{m.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="0.5" max="5.0" step="0.1" value={m}
              onChange={(e) => { setM(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Initial height slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.height}</span>
              <span className="text-slate-700 font-mono">{h0.toFixed(2)} m</span>
            </div>
            <input
              type="range" min="1.0" max="4.0" step="0.1" value={h0}
              onChange={(e) => { setH0(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Friction coefficient slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.friction}</span>
              <span className="text-slate-700 font-mono">{mu.toFixed(3)}</span>
            </div>
            <input
              type="range" min="0" max="0.3" step="0.01" value={mu}
              onChange={(e) => { setMu(parseFloat(e.target.value)); handleReset(); }}
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
              type="range" min="1" max="20" step="0.1" value={g}
              onChange={(e) => { setG(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(potentialE / totalE) * 100}%` }} />
              </div>
            </div>

            {/* Kinetic Energy */}
            <div>
              <div className="flex justify-between font-bold text-emerald-600 mb-1">
                <span>{t.ke}</span>
                <span>{kineticE.toFixed(1)} J</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(kineticE / totalE) * 100}%` }} />
              </div>
            </div>

            {/* Thermal Energy */}
            <div>
              <div className="flex justify-between font-bold text-red-600 mb-1">
                <span>{t.thermal}</span>
                <span>{thermalE.toFixed(1)} J</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(thermalE / totalE) * 100}%` }} />
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
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

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
