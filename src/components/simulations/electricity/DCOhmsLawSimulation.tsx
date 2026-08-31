import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { dcOhmsLawGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_OBSERVATION_NOTEBOOKS, ENABLE_SIMULATION_LAB_BAR } from '../../../config/features';

export function DCOhmsLawSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: "DC Circuits & Ohm's Law Lab",
      paramsTitle: 'Parameters',
      voltage: 'Source Voltage (V)',
      resistance: 'Resistance (R)',
      flowType: 'Current Flow Type',
      conventional: 'Conventional Current (+ to -)',
      electrons: 'Electron Flow (- to +)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      showLabels: 'Show Digital Multimeter Labels',
      theoryOutput: 'Theoretical Readings',
      current: 'Measured Current (I)',
      resistanceCalculated: 'Calculated Resistance (R)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      vGraph: 'Voltage (V) vs. Current (I) Plot'
    },
    si: {
      title: "සරල ධාරා පරිපථ සහ ඕම්ගේ නියමය",
      paramsTitle: 'පරාමිතීන්',
      voltage: 'ප්‍රභව වෝල්ටීයතාවය (V)',
      resistance: 'ප්‍රතිරෝධය (R)',
      flowType: 'ධාරා ගලායන ආකාරය',
      conventional: 'සම්මත ධාරාව (+ සිට -)',
      electrons: 'ඉලෙක්ට්‍රෝන ප්‍රවාහය (- සිට +)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      showLabels: 'ඩිජිටල් මීටර් ලේබල් පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක කියවීම්',
      current: 'මනින ලද ධාරාව (I)',
      resistanceCalculated: 'ගණනය කළ ප්‍රතිරෝධය (R)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      vGraph: 'වෝල්ටීයතාවය (V) සහ ධාරාව (I) ප්‍රස්ථාරය'
    },
    ta: {
      title: "நேரடி மின்னோட்டச் சுற்றுகளும் ஓமின் விதியும்",
      paramsTitle: 'அளவுருக்கள்',
      voltage: 'மின்னழுத்தம் (V)',
      resistance: 'மின்தடை (R)',
      flowType: 'மின்னோட்டப் பாய்வு முறை',
      conventional: 'மரபு மின்னோட்டம் (+ இலிருந்து -)',
      electrons: 'மின்னணு பாய்வு (- இலிருந்து +)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      showLabels: 'டிஜிட்டல் அளவீட்டு லேபிள்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு அளவீடுகள்',
      current: 'அளவிடப்பட்ட மின்னோட்டம் (I)',
      resistanceCalculated: 'கணக்கிடப்பட்ட மின்தடை (R)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      vGraph: 'மின்னழுத்தம் (V) vs மின்னோட்டம் (I) வரைபடம்'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [V, setV] = useState(6.0); // Voltage: 0V to 12V
  const [R, setR] = useState(100); // Resistance: 20 to 500 ohms
  const [flowMode, setFlowMode] = useState<'conventional' | 'electrons'>('conventional');
  const [showLabels, setShowLabels] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Live state values
  const [labNotes, setLabNotes] = useState('');
  const [chargeOffset, setChargeOffset] = useState(0);

  // Calculations
  const I_amps = R > 0 ? V / R : 0;
  const I_mA = I_amps * 1000;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animate electron/charge flow particles
  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    const tick = () => {
      // Flow speed is proportional to Current magnitude
      const speedScale = I_amps * 22;
      setChargeOffset((prev) => (prev + (flowMode === 'conventional' ? speedScale : -speedScale)) % 80);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, I_amps, flowMode]);

  // Render circuit layout
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Circuit Coordinates (Closed rectangular loop)
    const leftX = 80;
    const rightX = 440;
    const topY = 50;
    const bottomY = 210;

    // 1. Draw loop wires
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(leftX, topY, rightX - leftX, bottomY - topY, 8);
    ctx.stroke();

    // 2. Draw Battery DC Source (left vertical wire segment)
    const batX = leftX;
    const batY = (topY + bottomY) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(batX - 15, batY - 15, 30, 30);

    // Battery plates (long/thin +, short/thick -)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Long plate (+)
    ctx.moveTo(batX - 12, batY - 10); ctx.lineTo(batX + 12, batY - 10);
    // Short plate (-)
    ctx.moveTo(batX - 6, batY + 10); ctx.lineTo(batX + 6, batY + 10);
    ctx.stroke();

    // Labels +/-
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px font-sans';
    ctx.fillText('+', batX + 15, batY - 8);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('-', batX + 10, batY + 14);

    // 3. Draw Resistor (right vertical wire segment)
    const resX = rightX;
    const resY = (topY + bottomY) / 2;
    const resW = 24;
    const resH = 50;

    ctx.fillStyle = '#fef08a'; // Yellow resistor body backdrop
    ctx.strokeStyle = '#cabf45';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(resX - resW / 2, resY - resH / 2, resW, resH);
    ctx.fill();
    ctx.stroke();

    // Draw resistor impurity dots inside to physically show resistance collisions
    ctx.fillStyle = 'rgba(71, 85, 105, 0.8)';
    const numImpurityDots = Math.floor(R / 15);
    // Deterministic random dots based on index to avoid jumping frames
    for (let i = 0; i < numImpurityDots; i++) {
      const rx = resX - resW / 2 + 3 + ((i * 17) % (resW - 6));
      const ry = resY - resH / 2 + 4 + ((i * 29) % (resH - 8));
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Label R value on resistor
    if (showLabels) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`${R} Ω`, resX, resY + 3);
    }

    // 4. Draw Ammeter (top wire segment)
    const amX = (leftX + rightX) / 2;
    const amY = topY;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(amX, amY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('A', amX, amY + 4);

    if (showLabels && V > 0.01) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 9px font-mono';
      ctx.fillText(`${I_mA.toFixed(1)} mA`, amX, amY - 18);
    }

    // 5. Draw Voltmeter (connected in parallel across resistor)
    const voltX = rightX + 50;
    const voltY = resY;

    // Draw voltmeter connection leads
    ctx.strokeStyle = '#ef4444'; // Red lead
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(resX, resY - resH / 2 - 5);
    ctx.lineTo(voltX - 15, voltY - 10);
    ctx.stroke();

    ctx.strokeStyle = '#000000'; // Black lead
    ctx.beginPath();
    ctx.moveTo(resX, resY + resH / 2 + 5);
    ctx.lineTo(voltX - 15, voltY + 10);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(voltX, voltY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('V', voltX, voltY + 4);

    if (showLabels && V > 0.01) {
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 9px font-mono';
      ctx.fillText(`${V.toFixed(1)} V`, voltX + 28, voltY + 3);
    }

    // 6. Draw flowing current charges (blue dots) along the wires
    if (V > 0.05) {
      ctx.fillStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      // Define coordinates around the loop rectangular path
      const points: { x: number; y: number }[] = [];

      // Top line (left to right)
      for (let x = leftX; x <= rightX; x += 10) points.push({ x, y: topY });
      // Right line (top to bottom)
      for (let y = topY + 10; y <= bottomY; y += 10) points.push({ x: rightX, y });
      // Bottom line (right to left)
      for (let x = rightX - 10; x >= leftX; x -= 10) points.push({ x, y: bottomY });
      // Left line (bottom to top)
      for (let y = bottomY - 10; y >= topY + 10; y -= 10) points.push({ x: leftX, y });

      const pathLen = points.length;

      // Render offset dot charges
      for (let i = 0; i < pathLen; i += 4) {
        // Apply offset index
        const idx = Math.floor((i + chargeOffset) + pathLen) % pathLen;
        const p = points[idx];
        if (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

  }, [V, R, chargeOffset, showLabels, flowMode, I_amps, I_mA]);

  const handleReset = () => {
    setV(6.0);
    setR(100);
    setFlowMode('conventional');
    setLabNotes('');
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'circuits_sim',
    simulationTitle: "DC Circuits & Ohm's Law",
    category: 'electricity',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'voltage', label: 'Voltage (V)', unit: 'V' },
      { key: 'current_mA', label: 'Current (I)', unit: 'mA' },
      { key: 'current_A', label: 'Current (I)', unit: 'A' },
      { key: 'resistance', label: 'Set Resistance (R)', unit: 'Ω' },
      { key: 'calculatedR', label: 'Calculated R (V/I)', unit: 'Ω' },
    ],
    getCurrentRow: () => ({
      voltage: parseFloat(V.toFixed(2)),
      current_mA: parseFloat(I_mA.toFixed(2)),
      current_A: parseFloat(I_amps.toFixed(4)),
      resistance: R,
      calculatedR: I_amps > 0 ? parseFloat((V / I_amps).toFixed(2)) : R,
    }),
    getSeriesData: () => {
      const voltages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      return voltages.map((volt, idx) => {
        const i_a = R > 0 ? volt / R : 0;
        return {
          trial: idx + 1,
          voltage: volt,
          current_mA: parseFloat((i_a * 1000).toFixed(2)),
          current_A: parseFloat(i_a.toFixed(4)),
          resistance: R,
          calculatedR: R,
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Voltage V = 1.0 V', params: { v: 1.0 }, durationMs: 700 },
        { label: 'Voltage V = 2.0 V', params: { v: 2.0 }, durationMs: 700 },
        { label: 'Voltage V = 4.0 V', params: { v: 4.0 }, durationMs: 700 },
        { label: 'Voltage V = 6.0 V', params: { v: 6.0 }, durationMs: 700 },
        { label: 'Voltage V = 8.0 V', params: { v: 8.0 }, durationMs: 700 },
        { label: 'Voltage V = 10.0 V', params: { v: 10.0 }, durationMs: 700 },
        { label: 'Voltage V = 12.0 V', params: { v: 12.0 }, durationMs: 700 },
      ],
      applyParams: (p) => {
        if (p.v !== undefined) setV(p.v);
      },
    },
    defaultGraphConfig: {
      xAxis: 'voltage',
      yAxis: 'current_A',
      title: "Ohm's Law: I vs V (Linear Fit, Slope = 1/R = Conductance G)",
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Source Voltage (V)': `${V.toFixed(1)} V`,
      'Resistor Value (R)': `${R} Ω`,
      'Calculated Current (I)': `${I_mA.toFixed(1)} mA`
    };
    downloadReportAsPDF("DC Circuits & Ohm's Law Lab Report", reportParams, recorder.recordedRows, labNotes);
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

          {/* Voltage slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.voltage}</span>
              <span className="text-red-650 font-mono font-bold">{V.toFixed(1)} V</span>
            </div>
            <input
              type="range" min="0.0" max="12.0" step="0.5" value={V}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setV(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Resistance slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.resistance}</span>
              <span className="text-slate-700 font-mono font-bold">{R} Ω</span>
            </div>
            <input
              type="range" min="20" max="500" step="10" value={R}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setR(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Current Flow Type Toggle */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
            <label className="text-xs text-slate-500 font-bold block">{t.flowType}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFlowMode('conventional')}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  flowMode === 'conventional' ? 'bg-slate-800 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.conventional}
              </button>
              <button
                onClick={() => setFlowMode('electrons')}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  flowMode === 'electrons' ? 'bg-slate-800 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.electrons}
              </button>
            </div>
          </div>

          {/* Value Labels Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-labels-ohms" checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-labels-ohms" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.showLabels}
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
              <span className="text-slate-500 block">{t.current}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">
                {I_mA.toFixed(2)} mA
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.resistanceCalculated}</span>
              <span className="font-extrabold text-purple-650 font-mono text-sm">{R} Ω</span>
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
            <canvas ref={canvasRef} className="border border-slate-100 rounded-lg bg-slate-50/20 shadow-inner" />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-3 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={dcOhmsLawGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ voltage: V, resistance: R }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={250}
        />

        {/* Observation log */}
        {(ENABLE_OBSERVATION_NOTEBOOKS || ENABLE_SIMULATION_LAB_BAR) && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col">
          {ENABLE_OBSERVATION_NOTEBOOKS && (
            <>
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
            </>
          )}

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
        )}
      </div>
    </div>
  );
}
