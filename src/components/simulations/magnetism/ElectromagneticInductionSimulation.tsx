import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { inductionGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function ElectromagneticInductionSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Electromagnetic Induction Lab',
      paramsTitle: 'Parameters',
      magnetStrength: 'Magnet Strength (B₀)',
      coilTurns: 'Coil Turns (N)',
      coilArea: 'Coil Area (A)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Magnetic Flux Lines',
      theoryOutput: 'Theoretical Analysis',
      flux: 'Magnetic Flux (Φ)',
      inducedEMF: 'Induced EMF (V)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'විද්‍යුත් චුම්බක ප්‍රේරණ විද්‍යාගාරය',
      paramsTitle: 'පරාමිතීන්',
      magnetStrength: 'චුම්බක ප්‍රබලතාවය (B₀)',
      coilTurns: 'දඟර වට ගණන (N)',
      coilArea: 'දඟර වර්ගඵලය (A)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'චුම්බක ස්‍රාව රේඛා පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      flux: 'චුම්බක ස්‍රාවය (Φ)',
      inducedEMF: 'ප්‍රේරිත වි.ගා.බ. (V)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'மின்காந்தத் தூண்டல் ஆய்வகம்',
      paramsTitle: 'அளவுருக்கள்',
      magnetStrength: 'காந்த வலிமை (B₀)',
      coilTurns: 'சுருள் சுற்றுகள் (N)',
      coilArea: 'சுருள் பரப்பளவு (A)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'காந்தப் பாயக் கோடுகளைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      flux: 'காந்தப் பாயம் (Φ)',
      inducedEMF: 'தூண்டப்பட்ட மின்னியக்க விசை (V)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [B0, setB0] = useState(1.5); // Magnet strength (0.5 to 3.0)
  const [N, setN] = useState(3); // turns (1 to 4)
  const [area, setArea] = useState(1.0); // coil area multiplier (0.5 to 1.5)
  const [showVectors, setShowVectors] = useState(true);

  // Live simulation coordinates
  const [magnetX, setMagnetX] = useState(100); // draggable magnet center X
  const magnetY = 140;
  const [isDragging, setIsDragging] = useState(false);

  // Kinematic state for dPhi/dt calculations
  const [velocity, setVelocity] = useState(0);
  const [fluxVal, setFluxVal] = useState(0);
  const [inducedEMF, setInducedEMF] = useState(0);

  const [labNotes, setLabNotes] = useState('');

  // History tracking for graph plots
  const [history, setHistory] = useState<{ t: number[]; flux: number[]; emf: number[] }>({
    t: [],
    flux: [],
    emf: []
  });
  const lastHistoryUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastXRef = useRef(100);
  const lastTimeRef = useRef(performance.now());

  // Dragging event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check click hit inside Bar Magnet (width 80, height 30)
    if (Math.abs(clickX - magnetX) <= 45 && Math.abs(clickY - magnetY) <= 20) {
      setIsDragging(true);
      lastXRef.current = clickX;
      lastTimeRef.current = performance.now();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const moveX = Math.max(45, Math.min(rect.width - 45, e.clientX - rect.left));

    const now = performance.now();
    const dt = (now - lastTimeRef.current) / 1000; // seconds

    if (dt > 0.005) {
      const dx = moveX - lastXRef.current;
      const vInst = dx / dt; // velocity in pixels/sec

      setVelocity(vInst * 0.05); // scale velocity factor
      setMagnetX(moveX);
      lastXRef.current = moveX;
      lastTimeRef.current = now;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setVelocity(0);
    setInducedEMF(0);
  };

  // Perform electromagnetic calculations on parameter or position updates
  useEffect(() => {
    const coilCenterX = 360;

    // Calculate magnetic flux: Phi = B * A * cos(theta).
    // B-field drops off with distance from magnet poles: B(x) = B0 / (1 + (x - x_magnet)^2 / 4000)
    const dist = Math.abs(magnetX - coilCenterX);
    const calculatedFlux = (B0 * area * 100) / (1 + (dist * dist) / 4000);
    setFluxVal(calculatedFlux);

    // Calculate dPhi/dx analytically:
    // dPhi/dx = -200 * B0 * area * (magnetX - coilCenterX) / (4000 * (1 + dist^2 / 4000)^2)
    const dPhi_dx = (-200 * B0 * area * (magnetX - coilCenterX)) / Math.pow(4000 * (1 + (dist * dist) / 4000), 2);
    // Induced EMF: V = -N * dPhi/dt = -N * dPhi/dx * dx/dt
    // velocity is dx/dt
    const emf = -N * dPhi_dx * velocity * 8000;
    setInducedEMF(Math.max(-10, Math.min(10, emf)));

  }, [magnetX, B0, N, area, velocity]);

  // Periodically update graph history and decay values if not dragging
  useEffect(() => {
    const timer = setInterval(() => {
      const now = performance.now();
      const timeSec = parseFloat(((now - startTimeRef.current) / 1000).toFixed(1));
      
      setHistory(prev => {
        const nextT = [...prev.t, timeSec];
        const nextFlux = [...prev.flux, fluxVal];
        const nextEMF = [...prev.emf, inducedEMF];
        if (nextT.length > 50) {
          nextT.shift();
          nextFlux.shift();
          nextEMF.shift();
        }
        return { t: nextT, flux: nextFlux, emf: nextEMF };
      });

      // If user isn't dragging, decay velocity and EMF to zero
      if (!isDragging) {
        setVelocity(v => (Math.abs(v) < 0.05 ? 0 : v * 0.75));
        setInducedEMF(e => (Math.abs(e) < 0.05 ? 0 : e * 0.75));
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fluxVal, inducedEMF, isDragging]);

  // Render animation canvas
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

    const coilX = 360;
    const coilY = 140;
    const coilRadius = 36 * area;

    // 1. Draw Magnetic Flux lines from the Magnet
    if (showVectors) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1.5;
      const numLines = 6;
      for (let i = 0; i < numLines; i++) {
        const offset = (i - (numLines - 1) / 2) * 12;
        ctx.beginPath();
        ctx.moveTo(magnetX - 40, magnetY + offset);
        // curve out to loop around
        ctx.bezierCurveTo(
          magnetX - 100, magnetY + offset * 3,
          magnetX + 100, magnetY + offset * 3,
          magnetX + 40, magnetY + offset
        );
        ctx.stroke();
      }
    }

    // 2. Draw Coil turns (back side of loops)
    ctx.strokeStyle = '#b45309'; // Copper color
    ctx.lineWidth = 3.5;
    for (let i = 0; i < N; i++) {
      const xOffset = (i - (N - 1) / 2) * 8;
      ctx.beginPath();
      ctx.arc(coilX + xOffset, coilY, coilRadius, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.stroke();
    }

    // 3. Draw Bar Magnet (Red North on Right, Blue South on Left)
    const mWidth = 80;
    const mHeight = 32;
    ctx.fillStyle = '#3b82f6'; // South (Blue)
    ctx.fillRect(magnetX - mWidth / 2, magnetY - mHeight / 2, mWidth / 2, mHeight);
    ctx.fillStyle = '#ef4444'; // North (Red)
    ctx.fillRect(magnetX, magnetY - mHeight / 2, mWidth / 2, mHeight);

    // Label N and S
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('S', magnetX - mWidth / 4, magnetY + 4);
    ctx.fillText('N', magnetX + mWidth / 4, magnetY + 4);

    // 4. Draw Coil turns (front side of loops, overlaying magnet if inside)
    ctx.strokeStyle = '#d97706'; // Bright copper front
    for (let i = 0; i < N; i++) {
      const xOffset = (i - (N - 1) / 2) * 8;
      ctx.beginPath();
      ctx.arc(coilX + xOffset, coilY, coilRadius, (3 * Math.PI) / 2, Math.PI / 2);
      ctx.stroke();
    }

    // 5. Draw Galvanometer Voltmeter (Center-Zero Dial)
    const dialX = 230;
    const dialY = 60;
    const dialRadius = 25;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Scale ticks
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY - dialRadius); ctx.lineTo(dialX, dialY - dialRadius + 4); // zero
    ctx.moveTo(dialX - dialRadius * 0.7, dialY - dialRadius * 0.7); ctx.lineTo(dialX - dialRadius * 0.6, dialY - dialRadius * 0.6); // left peak
    ctx.moveTo(dialX + dialRadius * 0.7, dialY - dialRadius * 0.7); ctx.lineTo(dialX + dialRadius * 0.6, dialY - dialRadius * 0.6); // right peak
    ctx.stroke();

    // Voltmeter needle deflection
    // inducedEMF ranges from -10 to 10. Map this to angle -45 to 45 deg
    const maxDeflection = Math.PI / 4;
    const deflectionAngle = (inducedEMF / 10) * maxDeflection;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + (dialRadius - 4) * Math.sin(deflectionAngle), dialY - (dialRadius - 4) * Math.cos(deflectionAngle));
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(dialX, dialY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // 6. Draw LED bulb connected to wires
    const ledX = 360;
    const ledY = 60;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(coilX - coilRadius, coilY);
    ctx.lineTo(ledX - 10, ledY);
    ctx.moveTo(coilX + coilRadius, coilY);
    ctx.lineTo(ledX + 10, ledY);
    ctx.stroke();

    const power = inducedEMF * inducedEMF;
    const glowOpacity = Math.min(1.0, power * 0.12);

    if (glowOpacity > 0.05) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = glowOpacity * 15;
      ctx.fillStyle = `rgba(251, 191, 36, ${glowOpacity})`;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ledX, ledY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

  }, [magnetX, N, area, inducedEMF, showVectors]);

  const handleReset = () => {
    setMagnetX(100);
    setVelocity(0);
    setFluxVal(0);
    setInducedEMF(0);
    setHistory({ t: [], flux: [], emf: [] });
    startTimeRef.current = performance.now();
    lastHistoryUpdateRef.current = 0;
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'induction_sim',
    simulationTitle: 'Electromagnetic Induction & Faraday Law',
    category: 'fields',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'turns_N', label: 'Coil Turns (N)', unit: '' },
      { key: 'magnetStrength_T', label: 'Magnet Strength (B₀)', unit: 'T' },
      { key: 'coilArea', label: 'Coil Area (A)', unit: 'm²' },
      { key: 'magneticFlux_Wb', label: 'Magnetic Flux (Φ)', unit: 'Wb' },
      { key: 'inducedEMF_V', label: 'Induced EMF (ℰ)', unit: 'V' },
    ],
    getCurrentRow: () => ({
      turns_N: N,
      magnetStrength_T: B0,
      coilArea: area,
      magneticFlux_Wb: parseFloat(fluxVal.toFixed(3)),
      inducedEMF_V: parseFloat(inducedEMF.toFixed(3)),
    }),
    getSeriesData: () => {
      const turns = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
      const dPhi_dt = Math.abs(inducedEMF) / (N || 1);
      return turns.map((turnCount, idx) => ({
        trial: idx + 1,
        turns_N: turnCount,
        magnetStrength_T: B0,
        coilArea: area,
        magneticFlux_Wb: parseFloat(fluxVal.toFixed(3)),
        inducedEMF_V: parseFloat((turnCount * dPhi_dt).toFixed(3)),
      }));
    },
    autoRunConfig: {
      steps: [
        { label: 'Magnet Strength B₀ = 0.5 T', params: { b0: 0.5 }, durationMs: 750 },
        { label: 'Magnet Strength B₀ = 1.0 T', params: { b0: 1.0 }, durationMs: 750 },
        { label: 'Magnet Strength B₀ = 1.5 T', params: { b0: 1.5 }, durationMs: 750 },
        { label: 'Magnet Strength B₀ = 2.0 T', params: { b0: 2.0 }, durationMs: 750 },
        { label: 'Magnet Strength B₀ = 2.5 T', params: { b0: 2.5 }, durationMs: 750 },
        { label: 'Magnet Strength B₀ = 3.0 T', params: { b0: 3.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.b0 !== undefined) setB0(p.b0);
        if (p.n !== undefined) setN(p.n);
      },
    },
    defaultGraphConfig: {
      xAxis: 'turns_N',
      yAxis: 'inducedEMF_V',
      title: "Faraday's Law: Induced EMF ℰ vs Coil Turns N (ℰ = -N dΦ/dt)",
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Magnet Strength (B0)': `${B0} T`,
      'Coil Turns (N)': `${N}`,
      'Coil Area (A)': `${area}`,
      'Induced EMF (V)': `${inducedEMF.toFixed(3)} V`
    };
    downloadReportAsPDF('Electromagnetic Induction Lab Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* Magnet Strength slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.magnetStrength}</span>
              <span className="text-slate-700 font-mono">{B0.toFixed(1)} T</span>
            </div>
            <input
              type="range" min="0.5" max="3.0" step="0.1" value={B0}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setB0(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Coil turns N */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.coilTurns}</span>
              <span className="text-slate-700 font-mono">{N} turns</span>
            </div>
            <input
              type="range" min="1" max="4" step="1" value={N}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Coil area A */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.coilArea}</span>
              <span className="text-slate-700 font-mono">{area.toFixed(1)} A₀</span>
            </div>
            <input
              type="range" min="0.5" max="1.5" step="0.1" value={area}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setArea(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Vector Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-induction" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-induction" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
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
              <span className="text-slate-500 block">{t.flux}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{fluxVal.toFixed(2)} Wb</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.inducedEMF}</span>
              <span className={`font-extrabold font-mono text-sm ${inducedEMF > 0.01 ? 'text-red-500' : inducedEMF < -0.01 ? 'text-blue-500' : 'text-slate-800'}`}>
                {inducedEMF.toFixed(3)} V
              </span>
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
            <span className="text-[10px] text-slate-400 font-semibold italic">Drag the magnet horizontally to induce EMF!</span>
          </div>

          <div className="w-full min-h-[320px] flex-1 flex items-center justify-center p-4 bg-slate-50/20 rounded-xl">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`border border-slate-100 rounded-lg bg-slate-50/20 shadow-inner transition-all ${
                isDragging ? 'cursor-grabbing border-blue-500' : 'cursor-grab hover:border-slate-350'
              }`}
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.reset}
            </button>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={inductionGraphs}
          trials={recorder.recordedRows}
          realtimePoints={history.t.map((tVal, i) => ({ t: tVal, x: tVal, y: history.emf[i], flux: history.flux[i], emf: history.emf[i] }))}
          simulationParams={{ magnetStrength: B0, coilTurns: N, coilArea: area }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={260}
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
