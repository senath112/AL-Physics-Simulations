import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function PulleySystemsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Atwood Pulley System Simulator',
      paramsTitle: 'Parameters',
      mass1: 'Left Mass (m₁)',
      mass2: 'Right Mass (m₂)',
      gravity: 'Gravity (g)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Tension & Weight Vectors',
      theoryOutput: 'Theoretical Analysis',
      accel: 'System Acceleration (a)',
      tension: 'String Tension (T)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'ඇට්වුඩ් කප්පි පද්ධති සිමියුලේටරය',
      paramsTitle: 'පරාමිතීන්',
      mass1: 'වම් ස්කන්ධය (m₁)',
      mass2: 'දකුණු ස්කන්ධය (m₂)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'ආතති සහ බර දෛශික පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක අගයන්',
      accel: 'පද්ධතියේ ත්වරණය (a)',
      tension: 'තන්තුවේ ආතතිය (T)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'அட்வுட் கப்ப்பி தொகுதி சிமுலேட்டர்',
      paramsTitle: 'அளவுருக்கள்',
      mass1: 'இடது நிறை (m₁)',
      mass2: 'வலது நிறை (m₂)',
      gravity: 'ஈர்ப்பு முடுக்கம் (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'இழுவிசை & விசை திசையன்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      accel: 'அமைப்பின் முடுக்கம் (a)',
      tension: 'இழை இழுவிசை (T)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // State parameters
  const [m1, setM1] = useState(6.0); // kg
  const [m2, setM2] = useState(4.0); // kg
  const [g, setG] = useState(9.8); // m/s²
  const [showVectors, setShowVectors] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Kinematic states
  const [heightDiff, setHeightDiff] = useState(0); // visual offset of left mass (px)
  const [vel, setVel] = useState(0);

  const [labNotes, setLabNotes] = useState('');

  // Calculations
  const totalMass = m1 + m2;
  const netPull = Math.abs(m1 - m2) * g;
  const acceleration = totalMass > 0 ? netPull / totalMass : 0;
  const tension = totalMass > 0 ? (2 * m1 * m2 * g) / totalMass : 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      setHeightDiff((prev) => {
        // acceleration direction: if m1 > m2, m1 moves down (heightDiff increases), m2 moves up
        const direction = m1 >= m2 ? 1 : -1;
        const newVel = vel + acceleration * direction * dt;
        setVel(newVel);
        const newDiff = prev + newVel * dt * 40;

        // Visual limit limits: +/- 80 px
        if (Math.abs(newDiff) >= 80) {
          setIsPlaying(false);
          return newDiff > 0 ? 80 : -80;
        }
        return newDiff;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vel, acceleration, m1, m2]);

  // Render Atwood Machine
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

    // Center pulley mount
    const pX = width / 2;
    const pY = 60;
    const pRadius = 24;

    // Draw pulley support beam
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pX, 0);
    ctx.lineTo(pX, pY);
    ctx.stroke();

    // Draw Pulley wheel
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pX, pY, pRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // inner dot/cross lines to show rotation
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pX - pRadius, pY);
    ctx.lineTo(pX + pRadius, pY);
    ctx.moveTo(pX, pY - pRadius);
    ctx.lineTo(pX, pY + pRadius);
    ctx.stroke();

    // Left block position (m1)
    const m1X = pX - pRadius;
    const m1Y = pY + 100 + heightDiff; // default hanging depth = 100
    const m1Size = Math.max(16, 12 + m1 * 2);

    // Right block position (m2)
    const m2X = pX + pRadius;
    const m2Y = pY + 100 - heightDiff;
    const m2Size = Math.max(16, 12 + m2 * 2);

    // Strings
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // left string
    ctx.moveTo(m1X, pY);
    ctx.lineTo(m1X, m1Y);
    // right string
    ctx.moveTo(m2X, pY);
    ctx.lineTo(m2X, m2Y);
    ctx.stroke();

    // Draw Left block m1
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(m1X - m1Size / 2, m1Y, m1Size, m1Size, 4);
    ctx.fill();
    ctx.stroke();

    // Draw Right block m2
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(m2X - m2Size / 2, m2Y, m2Size, m2Size, 4);
    ctx.fill();
    ctx.stroke();

    // Mass labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('m₁', m1X, m1Y + m1Size / 2 + 3);
    ctx.fillText('m₂', m2X, m2Y + m2Size / 2 + 3);

    // Draw vectors
    if (showVectors) {
      const vScale = 2.0;

      // Tension left (upwards)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m1X, m1Y);
      ctx.lineTo(m1X, m1Y - tension * vScale);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(m1X, m1Y - tension * vScale);
      ctx.lineTo(m1X - 3, m1Y - tension * vScale + 4);
      ctx.lineTo(m1X + 3, m1Y - tension * vScale + 4);
      ctx.fill();

      // Tension right (upwards)
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y);
      ctx.lineTo(m2X, m2Y - tension * vScale);
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y - tension * vScale);
      ctx.lineTo(m2X - 3, m2Y - tension * vScale + 4);
      ctx.lineTo(m2X + 3, m2Y - tension * vScale + 4);
      ctx.fill();

      // Gravity left (downwards)
      const w1 = m1 * g;
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(m1X, m1Y + m1Size);
      ctx.lineTo(m1X, m1Y + m1Size + w1 * vScale);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(m1X, m1Y + m1Size + w1 * vScale);
      ctx.lineTo(m1X - 3, m1Y + m1Size + w1 * vScale - 4);
      ctx.lineTo(m1X + 3, m1Y + m1Size + w1 * vScale - 4);
      ctx.fill();

      // Gravity right (downwards)
      const w2 = m2 * g;
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y + m2Size);
      ctx.lineTo(m2X, m2Y + m2Size + w2 * vScale);
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y + m2Size + w2 * vScale);
      ctx.lineTo(m2X - 3, m2Y + m2Size + w2 * vScale - 4);
      ctx.lineTo(m2X + 3, m2Y + m2Size + w2 * vScale - 4);
      ctx.fill();
    }

  }, [heightDiff, m1, m2, g, showVectors, tension]);

  const handleReset = () => {
    setIsPlaying(false);
    setHeightDiff(0);
    setVel(0);
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'pulleys_sim',
    simulationTitle: 'Atwood Machine Pulley Systems',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'massDifferenceRatio', label: '(m2 - m1) / (m1 + m2)', unit: '' },
      { key: 'mass1', label: 'Left Mass m₁', unit: 'kg' },
      { key: 'mass2', label: 'Right Mass m₂', unit: 'kg' },
      { key: 'acceleration', label: 'Acceleration a', unit: 'm/s²' },
      { key: 'tension', label: 'String Tension T', unit: 'N' },
      { key: 'gravity', label: 'Gravity g', unit: 'm/s²' },
    ],
    getCurrentRow: () => {
      const diffRatio = (m2 - m1) / (m1 + m2);
      return {
        massDifferenceRatio: parseFloat(diffRatio.toFixed(3)),
        mass1: m1,
        mass2: m2,
        acceleration: parseFloat(acceleration.toFixed(2)),
        tension: parseFloat(tension.toFixed(2)),
        gravity: g,
      };
    },
    defaultGraphConfig: {
      xAxis: 'massDifferenceRatio',
      yAxis: 'acceleration',
      title: 'Atwood Machine: a vs (m2-m1)/(m1+m2) (Slope = g)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Left Mass (m1)': `${m1} kg`,
      'Right Mass (m2)': `${m2} kg`,
      'System Acceleration': `${acceleration.toFixed(2)} m/s²`,
      'String Tension': `${tension.toFixed(2)} N`
    };
    downloadReportAsPDF('Atwood Pulley System Report', reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Params Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          {/* Left Mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass1}</span>
              <span className="text-blue-600 font-mono">{m1.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={m1}
              onChange={(e) => { setM1(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Right Mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass2}</span>
              <span className="text-emerald-600 font-mono">{m2.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={m2}
              onChange={(e) => { setM2(parseFloat(e.target.value)); handleReset(); }}
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
              type="range" min="1" max="25" step="0.1" value={g}
              onChange={(e) => { setG(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-pulley" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-pulley" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
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
              <span className="text-slate-500 block">{t.accel}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{acceleration.toFixed(2)} m/s²</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.tension}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{tension.toFixed(2)} N</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas Card */}
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
