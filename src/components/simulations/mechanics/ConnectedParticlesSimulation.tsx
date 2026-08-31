import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { connectedParticlesGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function ConnectedParticlesSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Connected Particles Simulator',
      paramsTitle: 'Parameters',
      mass1: 'Table Mass (m₁)',
      mass2: 'Hanging Mass (m₂)',
      friction: 'Friction Coeff (μ)',
      gravity: 'Gravity (g)',
      play: 'Play',
      pause: 'Pause',
      step: 'Step Forward',
      reset: 'Reset',
      vectors: 'Show Force Vectors (T, friction, gravity)',
      theoryOutput: 'Theoretical Analysis',
      accel: 'System Acceleration',
      tension: 'String Tension (T)',
      fricForce: 'Table Friction Force',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'සම්බන්ධිත අංශු සිමියුලේටරය',
      paramsTitle: 'පරාමිතීන්',
      mass1: 'මේසය මත ස්කන්ධය (m₁)',
      mass2: 'එල්ලෙන ස්කන්ධය (m₂)',
      friction: 'ඝර්ෂණ සංගුණකය (μ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      step: 'ඉදිරියට පියවරක්',
      reset: 'නැවත මුලට',
      vectors: 'බල දෛශික පෙන්වන්න (T, ඝර්ෂණය, ගුරුත්වාකර්ෂණය)',
      theoryOutput: 'න්‍යායාත්මක අගයන්',
      accel: 'පද්ධතියේ ත්වරණය',
      tension: 'තන්තුවේ ආතතිය (T)',
      fricForce: 'මේසයේ ඝර්ෂණ බලය',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'இணைக்கப்பட்ட துகள்கள் சிமுலேட்டர்',
      paramsTitle: 'அளவுருக்கள்',
      mass1: 'மேசை நிறை (m₁)',
      mass2: 'தொங்கும் நிறை (m₂)',
      friction: 'உராய்வு குணகம் (μ)',
      gravity: 'ஈர்ப்பு (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      step: 'முன்னோக்கிச் செல்',
      reset: 'மீட்டமை',
      vectors: 'விசை திசையன்களைக் காட்டு (T, உராய்வு, ஈர்ப்பு)',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      accel: 'அமைப்பின் முடுக்கம்',
      tension: 'இழை இழுவிசை (T)',
      fricForce: 'உராய்வு விசை',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters state
  const [m1, setM1] = useState(5.0); // kg
  const [m2, setM2] = useState(3.0); // kg
  const [mu, setMu] = useState(0.2); // friction coefficient
  const [g, setG] = useState(9.8); // m/s2
  const [showVectors, setShowVectors] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Kinematic states
  const [pos, setPos] = useState(40); // displacement along table (pixels / meters)
  const [vel, setVel] = useState(0);

  // History & Notes
  const [labNotes, setLabNotes] = useState('');

  // Calculate dynamics values
  const maxFriction = mu * m1 * g;
  const pullingForce = m2 * g;
  const netForce = Math.max(0, pullingForce - maxFriction);
  const acceleration = netForce > 0 ? netForce / (m1 + m2) : 0;
  const tension = acceleration > 0 ? m1 * acceleration + maxFriction : pullingForce;
  const actualFriction = netForce > 0 ? maxFriction : pullingForce;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation ticks
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      setPos((prevPos) => {
        // limit movement: block reaches pulley at pos = 240
        if (prevPos >= 240) {
          setIsPlaying(false);
          return 240;
        }
        const newVel = vel + acceleration * dt;
        setVel(newVel);
        const newPos = prevPos + newVel * dt * 35; // scale factor
        return Math.min(240, newPos);
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vel, acceleration]);

  // Render simulation view
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

    // Draw table top line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 160);
    ctx.lineTo(340, 160);
    ctx.lineTo(340, 260); // table leg
    ctx.stroke();

    // Draw pulley circle
    const pulleyX = 340;
    const pulleyY = 160;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(pulleyX, pulleyY, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Table Block (m1) coordinates
    const m1X = pos;
    const m1Y = 160 - 24; // block height = 24
    const m1W = 36;
    const m1H = 24;

    // Draw Block 1
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(m1X - m1W / 2, m1Y, m1W, m1H, 4);
    ctx.fill();
    ctx.stroke();

    // Text m1 inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('m₁', m1X, m1Y + 15);

    // Hanging Block (m2) coordinates
    const hangingLength = pos - 40; // animates downwards as m1 moves right
    const m2X = pulleyX + 10; // offset right of pulley edge
    const m2Y = pulleyY + 30 + hangingLength * 0.7; // scaled hanging movement
    const m2W = 24;
    const m2H = 30;

    // Draw string connecting m1 -> pulley -> m2
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m1X + m1W / 2, 160 - 12);
    ctx.lineTo(pulleyX, 160 - 10);
    ctx.quadraticCurveTo(pulleyX + 10, 160 - 10, m2X, pulleyY + 10);
    ctx.lineTo(m2X, m2Y);
    ctx.stroke();

    // Draw Block 2
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(m2X - m2W / 2, m2Y, m2W, m2H, 4);
    ctx.fill();
    ctx.stroke();

    // Text m2 inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px font-sans';
    ctx.fillText('m₂', m2X, m2Y + 18);

    // Draw Force Vectors
    if (showVectors) {
      const vScale = 1.5;

      // Friction on m1 (pointing left)
      if (mu > 0 && acceleration >= 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(m1X - m1W / 2, m1Y + m1H / 2);
        ctx.lineTo(m1X - m1W / 2 - actualFriction * vScale, m1Y + m1H / 2);
        ctx.stroke();
        // arrowhead
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(m1X - m1W / 2 - actualFriction * vScale, m1Y + m1H / 2);
        ctx.lineTo(m1X - m1W / 2 - actualFriction * vScale + 5, m1Y + m1H / 2 - 4);
        ctx.lineTo(m1X - m1W / 2 - actualFriction * vScale + 5, m1Y + m1H / 2 + 4);
        ctx.fill();
      }

      // Tension on m1 (pointing right)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(m1X + m1W / 2, m1Y + m1H / 2);
      ctx.lineTo(m1X + m1W / 2 + tension * vScale, m1Y + m1H / 2);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(m1X + m1W / 2 + tension * vScale, m1Y + m1H / 2);
      ctx.lineTo(m1X + m1W / 2 + tension * vScale - 5, m1Y + m1H / 2 - 4);
      ctx.lineTo(m1X + m1W / 2 + tension * vScale - 5, m1Y + m1H / 2 + 4);
      ctx.fill();

      // Gravity on m2 (pointing down)
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y + m2H);
      ctx.lineTo(m2X, m2Y + m2H + pullingForce * vScale);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(m2X, m2Y + m2H + pullingForce * vScale);
      ctx.lineTo(m2X - 4, m2Y + m2H + pullingForce * vScale - 5);
      ctx.lineTo(m2X + 4, m2Y + m2H + pullingForce * vScale - 5);
      ctx.fill();
    }
  }, [pos, m1, m2, mu, showVectors, actualFriction, tension, pullingForce]);

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'connected_particles_sim',
    simulationTitle: 'Connected Particles Dynamics',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'mass2', label: 'Hanging Mass m₂', unit: 'kg' },
      { key: 'mass1', label: 'Table Mass m₁', unit: 'kg' },
      { key: 'acceleration', label: 'System Acceleration a', unit: 'm/s²' },
      { key: 'tension', label: 'String Tension T', unit: 'N' },
      { key: 'frictionCoeff', label: 'Friction Coefficient μ', unit: '' },
      { key: 'frictionForce', label: 'Friction Force f', unit: 'N' },
    ],
    getCurrentRow: () => ({
      mass2: m2,
      mass1: m1,
      acceleration: parseFloat(acceleration.toFixed(2)),
      tension: parseFloat(tension.toFixed(2)),
      frictionCoeff: mu,
      frictionForce: parseFloat(actualFriction.toFixed(2)),
    }),
    getSeriesData: () => {
      const m2Vals = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
      const g = 9.8;
      return m2Vals.map((massHanging, idx) => {
        const pull = massHanging * g;
        const maxFric = mu * m1 * g;
        const netF = Math.max(0, pull - maxFric);
        const a = netF / (m1 + massHanging);
        const t = massHanging * (g - a);
        return {
          trial: idx + 1,
          mass2: massHanging,
          mass1: m1,
          acceleration: parseFloat(a.toFixed(2)),
          tension: parseFloat(t.toFixed(2)),
          frictionCoeff: mu,
          frictionForce: parseFloat(maxFric.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Hanging Mass m₂ = 1.0 kg', params: { m2: 1.0 }, durationMs: 750 },
        { label: 'Hanging Mass m₂ = 2.0 kg', params: { m2: 2.0 }, durationMs: 750 },
        { label: 'Hanging Mass m₂ = 3.0 kg', params: { m2: 3.0 }, durationMs: 750 },
        { label: 'Hanging Mass m₂ = 4.0 kg', params: { m2: 4.0 }, durationMs: 750 },
        { label: 'Hanging Mass m₂ = 5.0 kg', params: { m2: 5.0 }, durationMs: 750 },
        { label: 'Hanging Mass m₂ = 6.0 kg', params: { m2: 6.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.m2 !== undefined) {
          setM2(p.m2);
          handleReset();
        }
      },
    },
    defaultGraphConfig: {
      xAxis: 'mass2',
      yAxis: 'acceleration',
      title: 'Acceleration vs Hanging Mass (m₂)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Table Mass (m1)': `${m1} kg`,
      'Hanging Mass (m2)': `${m2} kg`,
      'Friction Coefficient (mu)': `${mu}`,
      'System Acceleration': `${acceleration.toFixed(2)} m/s²`,
      'String Tension': `${tension.toFixed(2)} N`
    };
    downloadReportAsPDF('Connected Particles Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPos(40);
    setVel(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters & Analytics Sidebar */}
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

          {/* Mass 1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass1}</span>
              <span className="text-blue-600 font-mono">{m1.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={m1}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM1(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Mass 2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass2}</span>
              <span className="text-emerald-600 font-mono">{m2.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={m2}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM2(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Friction Coefficient */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.friction}</span>
              <span className="text-slate-700 font-mono">{mu.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0" max="0.9" step="0.05" value={mu}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setMu(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Gravity */}
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

          {/* Vector Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-cp" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-cp" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
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
        {/* Canvas viewports */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
          </div>

          <div className="w-full min-h-[420px] flex-1 flex items-center justify-center p-4 bg-slate-50/20 rounded-xl">
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
          graphs={connectedParticlesGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ mass1: m1, mass2: m2, mu, gravity: g }}
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
