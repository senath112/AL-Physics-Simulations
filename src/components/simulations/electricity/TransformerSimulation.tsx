import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Sparkles, Zap, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { transformerGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function TransformerSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'AC Transformer & Mutual Induction Lab',
      paramsTitle: 'Transformer Parameters',
      primaryTurns: 'Primary Turns (N_p)',
      secondaryTurns: 'Secondary Turns (N_s)',
      primaryVoltage: 'Primary Voltage (V_p)',
      loadResistance: 'Load Resistance (R_L)',
      efficiency: 'Core Efficiency (η)',
      stepUpBadge: '⚡ STEP-UP TRANSFORMER (V_s > V_p)',
      stepDownBadge: '🔋 STEP-DOWN TRANSFORMER (V_s < V_p)',
      oneToOneBadge: '⚖️ 1:1 ISOLATION TRANSFORMER',
      reset: 'Reset Defaults',
      theoryOutput: 'Transformation & Power Metrics',
      turnsRatio: 'Turns Ratio (N_s / N_p)',
      secVoltage: 'Secondary Voltage (V_s)',
      secCurrent: 'Secondary Current (I_s)',
      priCurrent: 'Primary Current (I_p)',
      powerIn: 'Input Power (P_in)',
      powerOut: 'Output Power (P_out)',
      powerLoss: 'Power Dissipated (P_loss)',
      coreFluxDesc: 'Magnetic flux Φ(t) links both coils through the laminated soft-iron core.',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'ප්‍රත්‍යාවර්ත (AC) පරිණාමක විද්‍යාගාරය',
      paramsTitle: 'පරිණාමක පරාමිතීන්',
      primaryTurns: 'ප්‍රාථමික පොටවල් (N_p)',
      secondaryTurns: 'ද්විතීයික පොටවල් (N_s)',
      primaryVoltage: 'ප්‍රාථමික වෝල්ටීයතාවය (V_p)',
      loadResistance: 'භාර ප්‍රතිරෝධය (R_L)',
      efficiency: 'කාර්යක්ෂමතාව (η)',
      stepUpBadge: '⚡ අධි-පියවර පරිණාමකය (V_s > V_p)',
      stepDownBadge: '🔋 අව-පියවර පරිණාමකය (V_s < V_p)',
      oneToOneBadge: '⚖️ 1:1 හුදකලා පරිණාමකය',
      reset: 'යළි පිහිටුවන්න',
      theoryOutput: 'පරිණාමන සහ ජව ගණනය කිරීම්',
      turnsRatio: 'පොට අනුපාතය (N_s / N_p)',
      secVoltage: 'ද්විතීයික වෝල්ටීයතාවය (V_s)',
      secCurrent: 'ද්විතීයික ධාරාව (I_s)',
      priCurrent: 'ප්‍රාථමික ධාරාව (I_p)',
      powerIn: 'ආදාන ජවය (P_in)',
      powerOut: 'ප්‍රතිදාන ජවය (P_out)',
      powerLoss: 'ජව හානිය (P_loss)',
      coreFluxDesc: 'මෘදු යකඩ හරය හරහා ප්‍රාථමික සහ ද්විතීයික දඟර චුම්බක ස්‍රාවයෙන් සම්බන්ධ වේ.',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'மாறுதிசை (AC) மின்மாற்றி ஆய்வகம்',
      paramsTitle: 'மின்மாற்றி அளவுருக்கள்',
      primaryTurns: 'முதன்மை சுற்றுகள் (N_p)',
      secondaryTurns: 'துணை சுற்றுகள் (N_s)',
      primaryVoltage: 'முதன்மை மின்னழுத்தம் (V_p)',
      loadResistance: 'சுமை மின்தடை (R_L)',
      efficiency: 'திறன் (η)',
      stepUpBadge: '⚡ ஏற்று மின்மாற்றி (V_s > V_p)',
      stepDownBadge: '🔋 இறக்கு மின்மாற்றி (V_s < V_p)',
      oneToOneBadge: '⚖️ 1:1 தனிமைப்படுத்தல் மின்மாற்றி',
      reset: 'மீட்டமை',
      theoryOutput: 'மாற்றகம் மற்றும் திறன் அளவீடுகள்',
      turnsRatio: 'சுற்று விகிதம் (N_s / N_p)',
      secVoltage: 'துணை மின்னழுத்தம் (V_s)',
      secCurrent: 'துணை மின்னோட்டம் (I_s)',
      priCurrent: 'முதன்மை மின்னோட்டம் (I_p)',
      powerIn: 'உள்ளீட்டுத் திறன் (P_in)',
      powerOut: 'வெளியீட்டுத் திறன் (P_out)',
      powerLoss: 'திறன் இழப்பு (P_loss)',
      coreFluxDesc: 'மென்மையான இரும்பு மையத்தின் மூலம் இரு சுருள்களும் காந்தப் பாயத்தால் இணைக்கப்படுகின்றன.',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Transformer Parameters
  const [Np, setNp] = useState<number>(500); // 100 to 2000
  const [Ns, setNs] = useState<number>(1000); // 100 to 2000
  const [Vp, setVp] = useState<number>(230); // Volts RMS (10 to 400)
  const [RLoad, setRLoad] = useState<number>(50); // Ohms (5 to 500)
  const [efficiency, setEfficiency] = useState<number>(95); // percentage (70 to 100)

  const [labNotes, setLabNotes] = useState<string>('');
  const [animTime, setAnimTime] = useState<number>(0);

  // Physics Calculations
  const turnsRatio = Ns / (Np || 1);
  const Vs = Vp * turnsRatio;
  const Is = RLoad > 0 ? Vs / RLoad : 0;
  const Pout = Vs * Is;
  const effFraction = efficiency / 100;
  const Pin = effFraction > 0 ? Pout / effFraction : Pout;
  const Ip = Vp > 0 ? Pin / Vp : 0;
  const Ploss = Math.max(0, Pin - Pout);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Loop for Core Flux Pulsing and Waveforms
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setAnimTime(prev => (prev + dt * 4) % (2 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleReset = () => {
    setNp(500);
    setNs(1000);
    setVp(230);
    setRLoad(50);
    setEfficiency(95);
  };

  // Canvas Drawing: 3D Isometric Laminated Core & Oscilloscope (Pure White BG)
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

    // Left Core Region: 270px, Right Oscilloscope: 270px
    const coreX = 30;
    const coreY = 40;
    const coreOuterW = 210;
    const coreOuterH = 180;
    const coreThick = 36;
    const coreDepth = 16;

    // 1. Draw 3D Isometric Laminated Soft-Iron Core
    ctx.save();

    // Top 3D Extrusion Bevel
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.lineTo(coreX + coreDepth, coreY - 10);
    ctx.lineTo(coreX + coreOuterW + coreDepth, coreY - 10);
    ctx.lineTo(coreX + coreOuterW, coreY);
    ctx.closePath();
    ctx.fill();

    // Side 3D Extrusion Bevel
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(coreX + coreOuterW, coreY);
    ctx.lineTo(coreX + coreOuterW + coreDepth, coreY - 10);
    ctx.lineTo(coreX + coreOuterW + coreDepth, coreY + coreOuterH - 10);
    ctx.lineTo(coreX + coreOuterW, coreY + coreOuterH);
    ctx.closePath();
    ctx.fill();

    // Front Core Frame
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;

    // Outer rect
    ctx.beginPath();
    ctx.roundRect(coreX, coreY, coreOuterW, coreOuterH, 6);
    ctx.fill(); ctx.stroke();

    // Inner hollow cut (White aperture)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(coreX + coreThick, coreY + coreThick, coreOuterW - 2 * coreThick, coreOuterH - 2 * coreThick, 4);
    ctx.fill(); ctx.stroke();

    // Laminations lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let lx = coreX + 6; lx < coreX + coreOuterW; lx += 12) {
      ctx.beginPath();
      ctx.moveTo(lx, coreY);
      ctx.lineTo(lx, coreY + coreOuterH);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Animated 3D Magnetic Flux circulating in Core (Cyan Pulse)
    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -animTime * 15;

    const midFluxX = coreX + coreThick / 2;
    const midFluxY = coreY + coreThick / 2;
    const midFluxW = coreOuterW - coreThick;
    const midFluxH = coreOuterH - coreThick;

    ctx.beginPath();
    ctx.roundRect(midFluxX, midFluxY, midFluxW, midFluxH, 4);
    ctx.stroke();
    ctx.restore();

    // 3. 3D Primary Coil Winding (Left Limb, Red/Amber)
    const priX = coreX;
    const priY = coreY + coreThick + 6;
    const priH = coreOuterH - 2 * coreThick - 12;
    const numPriTurnsVisual = Math.max(6, Math.min(16, Math.round(Np / 80)));

    ctx.save();
    const priStep = priH / numPriTurnsVisual;
    for (let i = 0; i < numPriTurnsVisual; i++) {
      const wy = priY + i * priStep;
      // 3D Copper Wire Ring
      const wireGrad = ctx.createLinearGradient(priX - 5, wy, priX + coreThick + 5, wy);
      wireGrad.addColorStop(0, '#dc2626');
      wireGrad.addColorStop(0.5, '#f87171');
      wireGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = wireGrad;
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(priX - 6, wy + 2, coreThick + 12, priStep - 3, 3);
      ctx.fill(); ctx.stroke();
    }

    // Primary Labels
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Primary: N_p = ${Np}`, priX + coreThick / 2, coreY + coreOuterH + 18);
    ctx.fillText(`${Vp}V AC • ${Ip.toFixed(2)}A`, priX + coreThick / 2, coreY + coreOuterH + 32);
    ctx.restore();

    // 4. 3D Secondary Coil Winding (Right Limb, Cyan/Blue)
    const secX = coreX + coreOuterW - coreThick;
    const secY = priY;
    const numSecTurnsVisual = Math.max(6, Math.min(22, Math.round(Ns / 80)));

    ctx.save();
    const secStep = priH / numSecTurnsVisual;
    for (let i = 0; i < numSecTurnsVisual; i++) {
      const wy = secY + i * secStep;
      const wireGrad = ctx.createLinearGradient(secX - 5, wy, secX + coreThick + 5, wy);
      wireGrad.addColorStop(0, '#0284c7');
      wireGrad.addColorStop(0.5, '#38bdf8');
      wireGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = wireGrad;
      ctx.strokeStyle = '#075985';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(secX - 6, wy + 2, coreThick + 12, secStep - 3, 3);
      ctx.fill(); ctx.stroke();
    }

    // Secondary Labels
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Secondary: N_s = ${Ns}`, secX + coreThick / 2, coreY + coreOuterH + 18);
    ctx.fillText(`${Vs.toFixed(1)}V AC • ${Is.toFixed(2)}A`, secX + coreThick / 2, coreY + coreOuterH + 32);
    ctx.restore();

    // 5. Right Side: Clean Real-time Waveform Oscilloscope
    const oscX = 275;
    const oscY = 20;
    const oscW = 250;
    const oscH = height - 40;
    const oscMidY = oscY + oscH / 2;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(oscX, oscY, oscW, oscH, 8);
    ctx.fill(); ctx.stroke();

    // Grid
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(oscX + 10, oscMidY);
    ctx.lineTo(oscX + oscW - 10, oscMidY);
    ctx.stroke();

    for (let gx = oscX + 20; gx < oscX + oscW; gx += 35) {
      ctx.beginPath();
      ctx.moveTo(gx, oscY + 10);
      ctx.lineTo(gx, oscY + oscH - 10);
      ctx.stroke();
    }

    // Plot Waves
    const plotW = oscW - 20;
    const maxScaleV = Math.max(Vp, Vs, 100);
    const priAmp = Math.min(55, (Vp / maxScaleV) * 55);
    const secAmp = Math.min(55, (Vs / maxScaleV) * 55);

    // Primary Input Wave (Red)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const angle = (i / plotW) * 4 * Math.PI + animTime;
      const y = oscMidY - Math.sin(angle) * priAmp;
      if (i === 0) ctx.moveTo(oscX + 10 + i, y);
      else ctx.lineTo(oscX + 10 + i, y);
    }
    ctx.stroke();

    // Secondary Output Wave (Cyan/Blue)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const angle = (i / plotW) * 4 * Math.PI + animTime;
      const y = oscMidY - Math.sin(angle) * secAmp;
      if (i === 0) ctx.moveTo(oscX + 10 + i, y);
      else ctx.lineTo(oscX + 10 + i, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(`● V_p = ${Vp} V`, oscX + 15, oscY + 18);
    ctx.fillStyle = '#0284c7';
    ctx.fillText(`● V_s = ${Vs.toFixed(1)} V`, oscX + 135, oscY + 18);

  }, [Np, Ns, Vp, RLoad, efficiency, animTime, Vs, Is, Ip]);

  const recorder = useSimulationRecorder({
    simulationId: 'transformer_sim',
    simulationTitle: 'AC Transformer & Mutual Induction',
    category: 'electricity',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'primaryTurns', label: 'N_p' },
      { key: 'secondaryTurns', label: 'N_s' },
      { key: 'primaryVoltage', label: 'V_p', unit: 'V' },
      { key: 'secondaryVoltage', label: 'V_s', unit: 'V' },
      { key: 'primaryCurrent', label: 'I_p', unit: 'A' },
      { key: 'secondaryCurrent', label: 'I_s', unit: 'A' },
      { key: 'efficiency', label: 'η', unit: '%' },
      { key: 'powerOut', label: 'P_out', unit: 'W' },
    ],
    getCurrentRow: () => ({
      primaryTurns: Np,
      secondaryTurns: Ns,
      primaryVoltage: Vp,
      secondaryVoltage: parseFloat(Vs.toFixed(2)),
      primaryCurrent: parseFloat(Ip.toFixed(2)),
      secondaryCurrent: parseFloat(Is.toFixed(2)),
      efficiency,
      powerOut: parseFloat(Pout.toFixed(2)),
    }),
    getSeriesData: () => {
      const secondaryTurnsList = [200, 400, 600, 800, 1000, 1200];
      return secondaryTurnsList.map((secN, idx) => {
        const secV = Vp * (secN / (Np || 1));
        const secI = RLoad > 0 ? secV / RLoad : 0;
        const pO = secV * secI;
        const pI = pO / (effFraction || 1);
        const priI = Vp > 0 ? pI / Vp : 0;
        return {
          trial: idx + 1,
          primaryTurns: Np,
          secondaryTurns: secN,
          primaryVoltage: Vp,
          secondaryVoltage: parseFloat(secV.toFixed(2)),
          primaryCurrent: parseFloat(priI.toFixed(2)),
          secondaryCurrent: parseFloat(secI.toFixed(2)),
          efficiency,
          powerOut: parseFloat(pO.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'N_s = 200 turns (Step-Down)', params: { Ns: 200 }, durationMs: 700 },
        { label: 'N_s = 500 turns (1:1 Ratio)', params: { Ns: 500 }, durationMs: 700 },
        { label: 'N_s = 750 turns', params: { Ns: 750 }, durationMs: 700 },
        { label: 'N_s = 1000 turns (Step-Up 2x)', params: { Ns: 1000 }, durationMs: 700 },
        { label: 'N_s = 1500 turns (Step-Up 3x)', params: { Ns: 1500 }, durationMs: 700 },
      ],
      applyParams: (p: Record<string, number>) => {
        if (p.Ns !== undefined) setNs(p.Ns);
        if (p.Np !== undefined) setNp(p.Np);
        if (p.Vp !== undefined) setVp(p.Vp);
      },
    },
    defaultGraphConfig: {
      xAxis: 'secondaryTurns',
      yAxis: 'secondaryVoltage',
      title: 'Secondary Voltage (V_s) vs Secondary Turns (N_s) [Slope = V_p / N_p]',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Primary Turns (Np)': `${Np}`,
      'Secondary Turns (Ns)': `${Ns}`,
      'Primary Voltage (Vp)': `${Vp} V`,
      'Secondary Voltage (Vs)': `${Vs.toFixed(2)} V`,
      'Turns Ratio (Ns / Np)': `${turnsRatio.toFixed(2)}`,
      'Primary Current (Ip)': `${Ip.toFixed(2)} A`,
      'Secondary Current (Is)': `${Is.toFixed(2)} A`,
      'Load Resistance (RL)': `${RLoad} Ω`,
      'Efficiency (η)': `${efficiency}%`,
      'Input Power (Pin)': `${Pin.toFixed(2)} W`,
      'Output Power (Pout)': `${Pout.toFixed(2)} W`,
      'Power Loss (Ploss)': `${Ploss.toFixed(2)} W`
    };
    downloadReportAsPDF('AC Transformer and Mutual Induction Lab Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* Status Badge */}
          <div className={`p-2.5 rounded-lg text-xs font-bold border text-center ${
            turnsRatio > 1.05
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : turnsRatio < 0.95
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            {turnsRatio > 1.05 ? t.stepUpBadge : turnsRatio < 0.95 ? t.stepDownBadge : t.oneToOneBadge}
          </div>

          {/* Primary Turns Np */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-600">{t.primaryTurns}</span>
              <span className="text-red-700 font-mono font-bold">{Np}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={Np}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setNp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Secondary Turns Ns */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-600">{t.secondaryTurns}</span>
              <span className="text-cyan-700 font-mono font-bold">{Ns}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={Ns}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setNs(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          {/* Primary Voltage Vp */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.primaryVoltage}</span>
              <span className="text-slate-800 font-mono font-bold">{Vp} V RMS</span>
            </div>
            <input
              type="range"
              min="10"
              max="400"
              step="10"
              value={Vp}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setVp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>

          {/* Load Resistance */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.loadResistance}</span>
              <span className="text-indigo-600 font-mono font-bold">{RLoad} Ω</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={RLoad}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setRLoad(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Efficiency */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.efficiency}</span>
              <span className="text-emerald-600 font-mono font-bold">{efficiency}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              step="1"
              value={efficiency}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setEfficiency(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleReset}
              disabled={recorder.isAutoRunning}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.reset}
            </button>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/70 border border-blue-100/60">
              <span className="font-medium text-slate-700">{t.turnsRatio}:</span>
              <span className="font-mono font-bold text-blue-700">{turnsRatio.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-cyan-50/70 border border-cyan-100/60">
              <span className="font-medium text-cyan-900">{t.secVoltage}:</span>
              <span className="font-mono font-bold text-cyan-700">{Vs.toFixed(2)} V</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.secCurrent}:</span>
              <span className="font-mono font-bold text-cyan-700">{Is.toFixed(2)} A</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.priCurrent}:</span>
              <span className="font-mono font-bold text-red-600">{Ip.toFixed(2)} A</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600">{t.powerIn}:</span>
                <span className="font-mono font-bold text-slate-800">{Pin.toFixed(1)} W</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600">{t.powerOut}:</span>
                <span className="font-mono font-bold text-emerald-700">{Pout.toFixed(1)} W</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold border-t border-slate-200/60 pt-1 text-slate-900">
                <span>{t.powerLoss}:</span>
                <span className="font-mono text-amber-700">{Ploss.toFixed(1)} W</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewport & Graphs */}
      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              {t.title}
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              V_s / V_p = N_s / N_p
            </span>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/280] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
            🧲 {t.coreFluxDesc}
          </p>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={transformerGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ primaryVoltage: Vp, primaryTurns: Np, secondaryTurns: Ns, efficiency }}
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
