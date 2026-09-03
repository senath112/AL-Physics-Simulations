import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Scale, MoveHorizontal, Sparkles, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { gravitationGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function GravitationSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: "Newton's Law of Gravitation",
      paramsTitle: 'Simulation Parameters',
      presetLabel: 'Experiment Preset',
      presetCavendish: 'Cavendish Lab Spheres',
      presetCustom: 'Custom Masses',
      presetAsymmetric: 'Asymmetric Masses (1:4)',
      presetExtreme: 'Heavy Dense Masses',
      mass1: 'Mass 1 (m₁)',
      mass2: 'Mass 2 (m₂)',
      distance: 'Separation Distance (r)',
      showVectors: 'Show Force Vectors (F₁₂, F₂₁)',
      showFieldLines: 'Show Field Lines',
      showGrid: 'Show Spacetime Grid',
      reset: 'Reset Defaults',
      theoryOutput: 'Gravitational Dynamics & Metrics',
      forceVal: 'Gravitational Force (F)',
      accel1: 'Acceleration of m₁ (a₁)',
      accel2: 'Acceleration of m₂ (a₂)',
      potEnergy: 'Gravitational Potential Energy (U)',
      invSquareCheck: 'Inverse-Square Product (F · r²)',
      newton3rdLaw: "Newton's 3rd Law: Action & Reaction Pair (|F₁₂| = |F₂₁|)",
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      dragHint: '💡 Tip: Click and drag either sphere to adjust separation distance r interactively.'
    },
    si: {
      title: 'නිව්ටන්ගේ සර්වත්‍ර ගුරුත්වාකර්ෂණ නියමය',
      paramsTitle: 'අනුකරණ පරාමිතීන්',
      presetLabel: 'පූර්ව සැකසුම',
      presetCavendish: 'කැවෙන්ඩිෂ් විද්‍යාගාර ගෝල',
      presetCustom: 'අභිරුචි ස්කන්ධ',
      presetAsymmetric: 'අසමමිතික ස්කන්ධ (1:4)',
      presetExtreme: 'අධික ඝනත්ව ස්කන්ධ',
      mass1: 'ස්කන්ධය 1 (m₁)',
      mass2: 'ස්කන්ධය 2 (m₂)',
      distance: 'කේන්ද්‍ර අතර දුර (r)',
      showVectors: 'බල දෛශික පෙන්වන්න (F₁₂, F₂₁)',
      showFieldLines: 'ක්ෂේත්‍ර රේඛා පෙන්වන්න',
      showGrid: 'අවකාශ-කාල ජාලය පෙන්වන්න',
      reset: 'යළි පිහිටුවන්න',
      theoryOutput: 'ගුරුත්වාකර්ෂණ ගණනය කිරීම්',
      forceVal: 'ගුරුත්වාකර්ෂණ බලය (F)',
      accel1: 'm₁ හි ත්වරණය (a₁)',
      accel2: 'm₂ හි ත්වරණය (a₂)',
      potEnergy: 'ගුරුත්වාකර්ෂණ විභව ශක්තිය (U)',
      invSquareCheck: 'ප්‍රතිලෝම වර්ග ගුණිතය (F · r²)',
      newton3rdLaw: 'නිව්ටන්ගේ 3 වන නියමය: ක්‍රියා-ප්‍රතික්‍රියා බල යුගලය (|F₁₂| = |F₂₁|)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF වාර්තාව ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      dragHint: '💡 උපදෙස: කේන්ද්‍ර අතර දුර (r) වෙනස් කිරීමට ඕනෑම ගෝලයක් මත ක්ලික් කර අදින්න.'
    },
    ta: {
      title: 'நியூட்டனின் அகில ஈர்ப்பு விதி',
      paramsTitle: 'உருவகப்படுத்துதல் அளவுருக்கள்',
      presetLabel: 'சோதனை முன்னமைவு',
      presetCavendish: 'கேவென்டிஷ் ஆய்வகக் கோளங்கள்',
      presetCustom: 'தனிப்பயன் நிறைகள்',
      presetAsymmetric: 'சமச்சீரற்ற நிறைகள் (1:4)',
      presetExtreme: 'அடர்த்தியான கனமான நிறைகள்',
      mass1: 'நிறை 1 (m₁)',
      mass2: 'நிறை 2 (m₂)',
      distance: 'மையங்களுக்கு இடையேயான தூரம் (r)',
      showVectors: 'விசை திசையன்களைக் காட்டு (F₁₂, F₂₁)',
      showFieldLines: 'புலக் கோடுகளைக் காட்டு',
      showGrid: 'வெளி-நேர வலையமைப்பைக் காட்டு',
      reset: 'மீட்டமை',
      theoryOutput: 'ஈர்ப்பு விசை கணிப்புகள்',
      forceVal: 'ஈர்ப்பு விசை (F)',
      accel1: 'm₁ இன் முடுக்கம் (a₁)',
      accel2: 'm₂ இன் முடுக்கம் (a₂)',
      potEnergy: 'ஈர்ப்பு அழுத்த ஆற்றல் (U)',
      invSquareCheck: 'நேர்மாறு வர்க்க பெருக்கம் (F · r²)',
      newton3rdLaw: 'நியூட்டனின் 3ஆம் விதி: செயல்-எதிர்ச்செயல் ஜோடி (|F₁₂| = |F₂₁|)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      dragHint: '💡 குறிப்பு: தூரத்தை (r) மாற்ற கோளத்தை கிளிக் செய்து இழுக்கவும்.'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const G = 6.6743e-11;

  const [m1, setM1] = useState<number>(100);
  const [m2, setM2] = useState<number>(100);
  const [r, setR] = useState<number>(2.0);

  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showFieldLines, setShowFieldLines] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const [labNotes, setLabNotes] = useState<string>('');

  const rSquared = r * r;
  const force = (G * m1 * m2) / rSquared;
  const a1 = force / m1;
  const a2 = force / m2;
  const potentialEnergy = -(G * m1 * m2) / r;
  const forceTimesRSquared = force * rSquared;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<'m1' | 'm2' | null>(null);

  const applyPreset = (type: string) => {
    if (type === 'cavendish') {
      setM1(100);
      setM2(100);
      setR(2.0);
    } else if (type === 'asymmetric') {
      setM1(50);
      setM2(200);
      setR(2.5);
    } else if (type === 'extreme') {
      setM1(800);
      setM2(1000);
      setR(1.2);
    } else {
      setM1(150);
      setM2(150);
      setR(3.0);
    }
  };

  const handleReset = () => {
    setM1(100);
    setM2(100);
    setR(2.0);
    setShowVectors(true);
    setShowFieldLines(true);
    setShowGrid(true);
  };

  const recorder = useSimulationRecorder({
    simulationId: 'gravitation_sim',
    simulationTitle: "Newton's Law of Gravitation",
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'r', label: 'Separation (r)', unit: 'm' },
      { key: 'inv_r2', label: '1 / r²', unit: '1/m²' },
      { key: 'force', label: 'Force (F)', unit: 'N' },
      { key: 'm1', label: 'Mass 1 (m₁)', unit: 'kg' },
      { key: 'm2', label: 'Mass 2 (m₂)', unit: 'kg' },
    ],
    getCurrentRow: () => ({
      r: parseFloat(r.toFixed(2)),
      inv_r2: parseFloat((1 / rSquared).toFixed(4)),
      force: parseFloat(force.toExponential(4)),
      m1,
      m2,
    }),
    getSeriesData: () => {
      const rVals = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];
      return rVals.map((rVal, idx) => {
        const f = (G * m1 * m2) / (rVal * rVal);
        return {
          trial: idx + 1,
          r: rVal,
          inv_r2: parseFloat((1 / (rVal * rVal)).toFixed(4)),
          force: parseFloat(f.toExponential(4)),
          m1,
          m2,
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'r = 1.0 m (Base)', params: { r: 1.0 }, durationMs: 700 },
        { label: 'r = 1.5 m (1.5x)', params: { r: 1.5 }, durationMs: 700 },
        { label: 'r = 2.0 m (2x -> 0.25 F)', params: { r: 2.0 }, durationMs: 700 },
        { label: 'r = 3.0 m (3x -> 0.11 F)', params: { r: 3.0 }, durationMs: 700 },
        { label: 'r = 4.0 m (4x -> 0.0625 F)', params: { r: 4.0 }, durationMs: 700 },
        { label: 'r = 5.0 m (5x -> 0.04 F)', params: { r: 5.0 }, durationMs: 700 },
      ],
      applyParams: (p: Record<string, number>) => {
        if (p.r !== undefined) setR(p.r);
        if (p.m1 !== undefined) setM1(p.m1);
        if (p.m2 !== undefined) setM2(p.m2);
      },
    },
    defaultGraphConfig: {
      xAxis: 'inv_r2',
      yAxis: 'force',
      title: 'Verification of Inverse-Square Law: F vs 1/r²',
      showRegression: true,
    },
    notes: labNotes,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
      const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      if (recorder.isAutoRunning) return;
      const { x } = getCanvasPos(e);
      const width = 540;
      const cx = width / 2;
      const pxPerMeter = 38;
      const halfSepPx = (r * pxPerMeter) / 2;
      const x1 = cx - halfSepPx;
      const x2 = cx + halfSepPx;

      if (Math.abs(x - x1) < 40) {
        isDraggingRef.current = 'm1';
      } else if (Math.abs(x - x2) < 40) {
        isDraggingRef.current = 'm2';
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const { x } = getCanvasPos(e);
      const width = 540;
      const cx = width / 2;
      const pxPerMeter = 38;

      let newR = r;
      if (isDraggingRef.current === 'm1') {
        const distFromCenter = Math.max(10, cx - x);
        newR = Math.max(0.5, Math.min(10.0, (distFromCenter * 2) / pxPerMeter));
      } else if (isDraggingRef.current === 'm2') {
        const distFromCenter = Math.max(10, x - cx);
        newR = Math.max(0.5, Math.min(10.0, (distFromCenter * 2) / pxPerMeter));
      }
      setR(parseFloat(newR.toFixed(2)));
    };

    const handleUp = () => {
      isDraggingRef.current = null;
    };

    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    canvas.addEventListener('touchstart', handleDown, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);

    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);

      canvas.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [r, recorder.isAutoRunning]);

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

    const cx = width / 2;
    const cy = height / 2 + 10;
    const pxPerMeter = 38;
    const halfSepPx = (r * pxPerMeter) / 2;
    const x1 = cx - halfSepPx;
    const x2 = cx + halfSepPx;

    // 1. Spacetime Grid (Clean Light Style)
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.lineWidth = 1;

      for (let gy = 30; gy <= height - 20; gy += 24) {
        ctx.beginPath();
        for (let gx = 0; gx <= width; gx += 8) {
          const d1 = Math.hypot(gx - x1, gy - cy);
          const d2 = Math.hypot(gx - x2, gy - cy);
          const warp1 = Math.min(20, (m1 * 35) / Math.max(400, d1 * d1));
          const warp2 = Math.min(20, (m2 * 35) / Math.max(400, d2 * d2));
          const warpedY = gy + warp1 + warp2;
          if (gx === 0) ctx.moveTo(gx, warpedY);
          else ctx.lineTo(gx, warpedY);
        }
        ctx.stroke();
      }

      for (let gx = 25; gx <= width - 20; gx += 30) {
        ctx.beginPath();
        ctx.moveTo(gx, 15);
        ctx.lineTo(gx, height - 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Gravitational Field Lines (Light Cyan / Gray dashes)
    if (showFieldLines) {
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);

      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const theta = (i / numLines) * 2 * Math.PI;
        const rRad = 70;
        ctx.beginPath();
        ctx.moveTo(x1 + Math.cos(theta) * 26, cy + Math.sin(theta) * 26);
        ctx.lineTo(x1 + Math.cos(theta) * rRad, cy + Math.sin(theta) * rRad);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 + Math.cos(theta) * 26, cy + Math.sin(theta) * 26);
        ctx.lineTo(x2 + Math.cos(theta) * rRad, cy + Math.sin(theta) * rRad);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 3. Central Line & Distance Ruler
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, cy);
    ctx.lineTo(width - 30, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    const rulerY = cy - 70;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, rulerY);
    ctx.lineTo(x2, rulerY);
    ctx.moveTo(x1, rulerY - 6); ctx.lineTo(x1, rulerY + 6);
    ctx.moveTo(x2, rulerY - 6); ctx.lineTo(x2, rulerY + 6);
    ctx.stroke();

    const distMidX = (x1 + x2) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(distMidX - 45, rulerY - 14, 90, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`r = ${r.toFixed(2)} m`, distMidX, rulerY);
    ctx.restore();

    const radius1 = Math.max(14, Math.min(36, 12 + Math.cbrt(m1) * 2.4));
    const radius2 = Math.max(14, Math.min(36, 12 + Math.cbrt(m2) * 2.4));

    // 4. Action-Reaction Vectors
    if (showVectors) {
      ctx.save();
      const maxForceRef = (G * 1000 * 1000) / (0.5 * 0.5);
      const normF = Math.min(1, Math.max(0.05, Math.sqrt(force / maxForceRef) * 2.8));
      const arrowLen = Math.max(22, Math.min(85, normF * 85));

      const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, label: string) => {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.fillText(label, (fromX + toX) / 2, fromY + 22);
      };

      drawArrow(x1, cy, Math.min(x1 + arrowLen, x2 - radius2 - 5), cy, '#dc2626', 'F₁₂');
      drawArrow(x2, cy, Math.max(x2 - arrowLen, x1 + radius1 + 5), cy, '#2563eb', 'F₂₁');
      ctx.restore();
    }

    // 5. 3D Celestial Spheres (Light Radial Shading & Specular Gloss)
    const drawMassSphere3D = (cx: number, cy: number, radius: number, baseColor: string, edgeColor: string, label: string, massVal: number) => {
      ctx.save();
      // Drop shadow on floor
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius + 4, radius * 0.9, radius * 0.25, 0, 0, 2 * Math.PI);
      ctx.fill();

      // 3D Sphere Radial Gradient
      const grad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.08,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, baseColor);
      grad.addColorStop(0.85, edgeColor);
      grad.addColorStop(1, '#0f172a');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + radius + 18);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${massVal.toFixed(0)} kg`, cx, cy + radius + 32);
    };

    drawMassSphere3D(x1, cy, radius1, '#f87171', '#dc2626', 'Mass 1 (m₁)', m1);
    drawMassSphere3D(x2, cy, radius2, '#60a5fa', '#2563eb', 'Mass 2 (m₂)', m2);

    // Center Crosshairs (dark slate, visible on white bg)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x1 - 3, cy - 1, 6, 2);
    ctx.fillRect(x1 - 1, cy - 3, 2, 6);
    ctx.fillRect(x2 - 3, cy - 1, 6, 2);
    ctx.fillRect(x2 - 1, cy - 3, 2, 6);

  }, [m1, m2, r, showVectors, showFieldLines, showGrid]);

  const handleDownloadPDF = () => {
    const reportParams = {
      'Mass 1 (m1)': `${m1} kg`,
      'Mass 2 (m2)': `${m2} kg`,
      'Separation Distance (r)': `${r.toFixed(2)} m`,
      'Inverse Square Distance (1/r²)': `${(1 / rSquared).toFixed(4)} m⁻²`,
      'Gravitational Force (F)': `${force.toExponential(4)} N`,
      'Acceleration of m1 (a1)': `${a1.toExponential(4)} m/s²`,
      'Acceleration of m2 (a2)': `${a2.toExponential(4)} m/s²`,
      'Gravitational Constant (G)': '6.6743 × 10⁻¹¹ N·m²/kg²'
    };
    downloadReportAsPDF("Newton's Law of Gravitation Lab Report", reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
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

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">{t.presetLabel}</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => applyPreset('cavendish')}
                disabled={recorder.isAutoRunning}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors text-left truncate cursor-pointer"
              >
                {t.presetCavendish}
              </button>
              <button
                onClick={() => applyPreset('asymmetric')}
                disabled={recorder.isAutoRunning}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors text-left truncate cursor-pointer"
              >
                {t.presetAsymmetric}
              </button>
              <button
                onClick={() => applyPreset('extreme')}
                disabled={recorder.isAutoRunning}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors text-left truncate cursor-pointer"
              >
                {t.presetExtreme}
              </button>
              <button
                onClick={() => applyPreset('custom')}
                disabled={recorder.isAutoRunning}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors text-left truncate cursor-pointer"
              >
                {t.presetCustom}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-600 font-bold">{t.mass1}</span>
              <span className="text-red-700 font-mono font-bold">{m1.toFixed(0)} kg</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={m1}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setM1(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 disabled:opacity-40"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-600 font-bold">{t.mass2}</span>
              <span className="text-blue-700 font-mono font-bold">{m2.toFixed(0)} kg</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={m2}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setM2(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-700 font-bold">{t.distance}</span>
              <span className="text-cyan-700 font-mono font-bold">{r.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={r}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setR(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-40"
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              {t.showVectors}
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showFieldLines}
                onChange={(e) => setShowFieldLines(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              {t.showFieldLines}
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              {t.showGrid}
            </label>
          </div>

          <div className="pt-2">
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

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-50/70 border border-indigo-100/60">
              <span className="font-medium text-slate-700">{t.forceVal}:</span>
              <span className="font-mono font-bold text-indigo-700">{force.toExponential(4)} N</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.accel1}:</span>
              <span className="font-mono font-bold text-red-600">{a1.toExponential(4)} m/s²</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.accel2}:</span>
              <span className="font-mono font-bold text-blue-600">{a2.toExponential(4)} m/s²</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.potEnergy}:</span>
              <span className="font-mono font-semibold text-slate-800">{potentialEnergy.toExponential(4)} J</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/70 border border-emerald-100/60">
              <span className="font-medium text-emerald-900">{t.invSquareCheck}:</span>
              <span className="font-mono font-bold text-emerald-700">{forceTimesRSquared.toExponential(4)} N·m²</span>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg text-[11px] text-blue-800 leading-snug font-medium">
            ⚖️ {t.newton3rdLaw}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.title}
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3 text-blue-600" />
              F = G·(m₁·m₂)/r²
            </span>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/280] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-2.5 font-medium">
            {t.dragHint}
          </p>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={gravitationGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ m1, m2, r }}
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
