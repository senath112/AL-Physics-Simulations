import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Sparkles, ArrowLeftRight, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { dcMotorGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function DCMotorSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'DC Motor & Split-Ring Commutator Lab',
      paramsTitle: 'Motor Parameters',
      currentLabel: 'Armature Current (I)',
      bFieldLabel: 'Magnetic Flux Density (B)',
      turnsLabel: 'Armature Turns (N)',
      areaLabel: 'Coil Area (A)',
      reverseCurrent: 'Reverse Battery Polarity (Current Flow)',
      reverseField: 'Reverse Magnet Poles (Field Direction)',
      showForces: 'Show Lorentz Force Vectors (F = ILB)',
      play: 'Run Motor',
      pause: 'Pause',
      reset: 'Reset Angle',
      theoryOutput: 'Mechanical Dynamics',
      peakTorque: 'Peak Torque (τ₀)',
      instantTorque: 'Instantaneous Torque (τ)',
      rotationDir: 'Rotation Direction',
      clockwise: 'Clockwise (CW ↷)',
      counterClockwise: 'Counter-Clockwise (CCW ↶)',
      commutatorStatus: 'Commutator Action',
      commutatorActive: 'Continuous Unidirectional Torque via Commutator Inversion',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'සරල ධාරා (DC) මෝටර් සහ ද්විඛණ්ඩිත මුදු විද්‍යාගාරය',
      paramsTitle: 'මෝටර් පරාමිතීන්',
      currentLabel: 'ආමේචර ධාරාව (I)',
      bFieldLabel: 'චුම්බක ස්‍රාව ඝනත්වය (B)',
      turnsLabel: 'දඟර පොටවල් ගණන (N)',
      areaLabel: 'දඟර වර්ගඵලය (A)',
      reverseCurrent: 'බැටරි අග්‍ර මාරු කරන්න (ධාරා දිශාව)',
      reverseField: 'චුම්බක ධ්‍රැව මාරු කරන්න (ක්ෂේත්‍ර දිශාව)',
      showForces: 'ලොරෙන්ට්ස් බල දෛශික පෙන්වන්න (F = ILB)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'කෝණය නැවත මුලට',
      theoryOutput: 'යාන්ත්‍රික ගතිකතාව',
      peakTorque: 'උච්ච ව්‍යාවර්තය (τ₀)',
      instantTorque: 'ක්ෂණික ව්‍යාවර්තය (τ)',
      rotationDir: 'භ්‍රමණ දිශාව',
      clockwise: 'දක්ෂිණාවර්තව (CW ↷)',
      counterClockwise: 'වාමාවර්තව (CCW ↶)',
      commutatorStatus: 'ද්විඛණ්ඩිත මුදුවේ ක්‍රියාවලිය',
      commutatorActive: 'ධාරාව ප්‍රතිවර්තනය කරමින් අඛණ්ඩ තනි දිශානුගත ව්‍යාවර්තයක් සපයයි',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'நேரோட்ட (DC) மோட்டார் & பிளவு-வளைய மாற்றக ஆய்வகம்',
      paramsTitle: 'மோட்டார் அளவுருக்கள்',
      currentLabel: 'மின்னோட்டம் (I)',
      bFieldLabel: 'காந்தப் பாய அடர்த்தி (B)',
      turnsLabel: 'சுருள் சுற்றுகள் (N)',
      areaLabel: 'சுருள் பரப்பளவு (A)',
      reverseCurrent: 'மின்னோட்ட திசையை மாற்று',
      reverseField: 'காந்த துருவங்களை மாற்று',
      showForces: 'லாரன்ட்ஸ் விசை திசையன்களைக் காட்டு (F = ILB)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      theoryOutput: 'இயக்கவியல் இயக்கவியல்',
      peakTorque: 'உச்ச முறுக்குவிசை (τ₀)',
      instantTorque: 'உடனடி முறுக்குவிசை (τ)',
      rotationDir: 'சுழற்சி திசை',
      clockwise: 'வலஞ்சுழி (CW ↷)',
      counterClockwise: 'இடஞ்சுழி (CCW ↶)',
      commutatorStatus: 'மாற்றகத்தின் செயல்பாடு',
      commutatorActive: 'தொடர்ச்சியான ஒரே திசை முறுக்குவிசைக்காக மின்னோட்டத்தை மாற்றுகிறது',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [I, setI] = useState<number>(2.0); // Amps (0.5 to 10.0)
  const [B, setB] = useState<number>(0.5); // Tesla (0.1 to 1.5)
  const [N, setN] = useState<number>(50); // turns (10 to 200)
  const [area, setArea] = useState<number>(0.04); // m^2

  const [currentReversed, setCurrentReversed] = useState<boolean>(false);
  const [fieldReversed, setFieldReversed] = useState<boolean>(false);
  const [showForces, setShowForces] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [theta, setTheta] = useState<number>(0);
  const [labNotes, setLabNotes] = useState<string>('');

  // Direction: +1 = CW, -1 = CCW
  const directionMultiplier = (currentReversed ? -1 : 1) * (fieldReversed ? -1 : 1);

  // Physics Calculations
  const peakTorque = N * I * area * B;
  const sinFactor = Math.abs(Math.sin(theta));
  const instantTorque = peakTorque * sinFactor;
  const angularSpeed = Math.max(2, Math.sqrt((peakTorque * 12) + 4));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;
      setTheta(prev => (prev + directionMultiplier * angularSpeed * dt + 2 * Math.PI) % (2 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, directionMultiplier, angularSpeed]);

  const handleReset = () => {
    setTheta(0);
  };

  // Canvas Drawing: 3D Commutator & Armature Loop (Pure White BG)
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

    // Pure Clean White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Left and Right 3D Magnet Pole Blocks
    const poleY = 45;
    const poleH = 150;
    const poleDepth = 18;

    const leftColor = fieldReversed ? '#2563eb' : '#dc2626';
    const leftTopColor = fieldReversed ? '#60a5fa' : '#f87171';
    const leftSideColor = fieldReversed ? '#1d4ed8' : '#b91c1c';
    const leftText = fieldReversed ? 'S' : 'N';

    const rightColor = fieldReversed ? '#dc2626' : '#2563eb';
    const rightTopColor = fieldReversed ? '#f87171' : '#60a5fa';
    const rightSideColor = fieldReversed ? '#b91c1c' : '#1d4ed8';
    const rightText = fieldReversed ? 'N' : 'S';

    // Left Pole 3D
    ctx.save();
    ctx.fillStyle = leftTopColor;
    ctx.beginPath();
    ctx.moveTo(25, poleY);
    ctx.lineTo(25 + poleDepth, poleY - 10);
    ctx.lineTo(75 + poleDepth, poleY - 10);
    ctx.lineTo(75, poleY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = leftSideColor;
    ctx.beginPath();
    ctx.moveTo(75, poleY);
    ctx.lineTo(75 + poleDepth, poleY - 10);
    ctx.lineTo(75 + poleDepth, poleY + poleH - 10);
    ctx.lineTo(75, poleY + poleH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = leftColor;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(25, poleY, 50, poleH, [6, 0, 0, 6]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(leftText, 50, poleY + poleH / 2 + 7);
    ctx.restore();

    // Right Pole 3D
    ctx.save();
    ctx.fillStyle = rightTopColor;
    ctx.beginPath();
    ctx.moveTo(width - 75, poleY);
    ctx.lineTo(width - 75 + poleDepth, poleY - 10);
    ctx.lineTo(width - 25 + poleDepth, poleY - 10);
    ctx.lineTo(width - 25, poleY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = rightSideColor;
    ctx.beginPath();
    ctx.moveTo(width - 25, poleY);
    ctx.lineTo(width - 25 + poleDepth, poleY - 10);
    ctx.lineTo(width - 25 + poleDepth, poleY + poleH - 10);
    ctx.lineTo(width - 25, poleY + poleH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = rightColor;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width - 75, poleY, 50, poleH, [0, 6, 6, 0]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rightText, width - 50, poleY + poleH / 2 + 7);
    ctx.restore();

    // Magnetic Field Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    for (let fy = poleY + 20; fy <= poleY + poleH - 20; fy += 26) {
      ctx.beginPath();
      ctx.moveTo(75, fy);
      ctx.lineTo(width - 75, fy);
      ctx.stroke();
    }
    ctx.restore();

    // Armature Center
    const cX = width / 2;
    const cY = poleY + poleH / 2 - 10;
    const coilW = 85;
    const coilH = 100;

    ctx.save();
    ctx.translate(cX, cY);

    // 3D Stainless Steel Axle
    const axleGrad = ctx.createLinearGradient(-3, 0, 3, 0);
    axleGrad.addColorStop(0, '#64748b');
    axleGrad.addColorStop(0.5, '#cbd5e1');
    axleGrad.addColorStop(1, '#475569');
    ctx.fillStyle = axleGrad;
    ctx.fillRect(-3, -coilH / 2 - 25, 6, coilH + 80);

    // 3D projected coil rectangle
    const projW = coilW * Math.cos(theta);
    const tilt = 20 * Math.sin(theta);

    // Draw Copper Coil Loop
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4.5;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.beginPath();
    ctx.moveTo(-projW, -coilH / 2 + tilt);
    ctx.lineTo(projW, -coilH / 2 - tilt);
    ctx.lineTo(projW, coilH / 2 - tilt);
    ctx.lineTo(-projW, coilH / 2 + tilt);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lorentz Force Vectors (F = ILB) on top and bottom vertical arms
    if (showForces) {
      const forceLen = Math.max(16, Math.min(45, (instantTorque / (peakTorque || 1)) * 45));

      const drawForce = (xPos: number, yPos: number, isUp: boolean) => {
        ctx.save();
        ctx.strokeStyle = '#059669';
        ctx.fillStyle = '#059669';
        ctx.lineWidth = 3;
        const dy = isUp ? -forceLen : forceLen;

        ctx.beginPath();
        ctx.moveTo(xPos, yPos);
        ctx.lineTo(xPos, yPos + dy);
        ctx.stroke();

        // Arrowhead
        const arrowDir = isUp ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(xPos, yPos + dy);
        ctx.lineTo(xPos - 5, yPos + dy - arrowDir * 8);
        ctx.lineTo(xPos + 5, yPos + dy - arrowDir * 8);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText('F', xPos + 10, yPos + dy / 2);
        ctx.restore();
      };

      if (Math.abs(projW) > 10) {
        const leftUp = directionMultiplier > 0 ? (projW > 0) : (projW < 0);
        drawForce(-projW, tilt, leftUp);
        drawForce(projW, -tilt, !leftUp);
      }
    }

    // 3D Split-Ring Commutator
    const commY = coilH / 2 + 30;
    const commR = 14;

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.5;
    // Left half
    ctx.beginPath();
    ctx.arc(0, commY, commR, Math.PI / 2 + 0.25, (3 * Math.PI) / 2 - 0.25);
    ctx.stroke();
    // Right half
    ctx.beginPath();
    ctx.arc(0, commY, commR, -Math.PI / 2 + 0.25, Math.PI / 2 - 0.25);
    ctx.stroke();

    // 3D Carbon Brushes pressing on sides
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-commR - 8, commY - 4, 8, 8);
    ctx.strokeRect(-commR - 8, commY - 4, 8, 8);

    ctx.fillRect(commR, commY - 4, 8, 8);
    ctx.strokeRect(commR, commY - 4, 8, 8);

    ctx.restore();

    // Dynamic Direction Badge
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const dirText = directionMultiplier > 0 ? t.clockwise : t.counterClockwise;
    ctx.fillText(`⟳ ${dirText} • τ = ${instantTorque.toFixed(3)} N·m`, cX, height - 15);

  }, [theta, I, B, N, area, currentReversed, fieldReversed, showForces, directionMultiplier, instantTorque, peakTorque]);

  const recorder = useSimulationRecorder({
    simulationId: 'dc_motor_sim',
    simulationTitle: 'DC Motor & Commutator',
    category: 'magnetism',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'current', label: 'Current (I)', unit: 'A' },
      { key: 'peakTorque', label: 'Peak Torque (τ₀)', unit: 'N·m' },
      { key: 'magneticField', label: 'Field (B)', unit: 'T' },
      { key: 'turns', label: 'Turns (N)' },
      { key: 'area', label: 'Area (A)', unit: 'm²' },
      { key: 'sinTheta', label: 'sin(θ)' },
      { key: 'torque', label: 'Instantaneous τ', unit: 'N·m' },
    ],
    getCurrentRow: () => ({
      current: I,
      peakTorque: parseFloat(peakTorque.toFixed(3)),
      magneticField: B,
      turns: N,
      area,
      sinTheta: parseFloat(sinFactor.toFixed(3)),
      torque: parseFloat(instantTorque.toFixed(3)),
    }),
    getSeriesData: () => {
      const currents = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
      return currents.map((curr, idx) => {
        const peakT = N * curr * area * B;
        return {
          trial: idx + 1,
          current: curr,
          peakTorque: parseFloat(peakT.toFixed(3)),
          magneticField: B,
          turns: N,
          area,
          sinTheta: 1.0,
          torque: parseFloat(peakT.toFixed(3)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'I = 1.0 A', params: { I: 1.0 }, durationMs: 700 },
        { label: 'I = 2.0 A', params: { I: 2.0 }, durationMs: 700 },
        { label: 'I = 3.0 A', params: { I: 3.0 }, durationMs: 700 },
        { label: 'I = 4.0 A', params: { I: 4.0 }, durationMs: 700 },
        { label: 'I = 5.0 A', params: { I: 5.0 }, durationMs: 700 },
      ],
      applyParams: (p: Record<string, number>) => {
        if (p.I !== undefined) setI(p.I);
        if (p.B !== undefined) setB(p.B);
        if (p.N !== undefined) setN(p.N);
      },
    },
    defaultGraphConfig: {
      xAxis: 'current',
      yAxis: 'peakTorque',
      title: 'Peak Torque (τ₀) vs Current (I) [Slope = NAB]',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Armature Current (I)': `${I.toFixed(2)} A`,
      'Magnetic Field (B)': `${B} T`,
      'Armature Turns (N)': `${N}`,
      'Coil Area (A)': `${area} m²`,
      'Peak Torque (τ₀)': `${peakTorque.toFixed(3)} N·m`,
      'Instantaneous Torque (τ)': `${instantTorque.toFixed(3)} N·m`,
      'Rotation Direction': directionMultiplier > 0 ? 'Clockwise (CW)' : 'Counter-Clockwise (CCW)'
    };
    downloadReportAsPDF('DC Motor & Commutator Lab Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* Current Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.currentLabel}</span>
              <span className="text-blue-600 font-mono font-bold">{I.toFixed(1)} A</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={I}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setI(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Magnetic Field B */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.bFieldLabel}</span>
              <span className="text-indigo-600 font-mono font-bold">{B.toFixed(2)} T</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={B}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Turns N */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-600 font-bold">{t.turnsLabel}</span>
              <span className="text-amber-600 font-mono font-bold">{N}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={N}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Area A */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.areaLabel}</span>
              <span className="text-slate-700 font-mono font-bold">{(area * 10000).toFixed(0)} cm² ({area.toFixed(2)} m²)</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.01"
              value={area}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setArea(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>

          {/* Direction Controls & Polarity Inverters */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => setCurrentReversed(!currentReversed)}
              disabled={recorder.isAutoRunning}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentReversed
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {t.reverseCurrent}
            </button>

            <button
              onClick={() => setFieldReversed(!fieldReversed)}
              disabled={recorder.isAutoRunning}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                fieldReversed
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {t.reverseField}
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-2 border-t border-slate-100 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showForces}
                onChange={(e) => setShowForces(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              {t.showForces}
            </label>
          </div>

          {/* Play/Pause/Reset */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={recorder.isAutoRunning}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? t.pause : t.play}
            </button>
            <button
              onClick={handleReset}
              disabled={recorder.isAutoRunning}
              className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/70 border border-blue-100/60">
              <span className="font-medium text-slate-700">{t.peakTorque}:</span>
              <span className="font-mono font-bold text-blue-700">{peakTorque.toFixed(3)} N·m</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.instantTorque}:</span>
              <span className="font-mono font-bold text-slate-800">{instantTorque.toFixed(3)} N·m</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.rotationDir}:</span>
              <span className="font-bold text-slate-900">{directionMultiplier > 0 ? t.clockwise : t.counterClockwise}</span>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-[11px] text-emerald-900 leading-snug font-medium">
            ⚡ {t.commutatorActive}
          </div>
        </div>
      </div>

      {/* Main Viewport & Graphs */}
      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {t.title}
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              τ = NIAB·sin(θ)
            </span>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/280] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={dcMotorGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ current: I, magneticField: B, turns: N, area }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={250}
        />

        {/* Observation Notebook & Laboratory Controls */}
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
