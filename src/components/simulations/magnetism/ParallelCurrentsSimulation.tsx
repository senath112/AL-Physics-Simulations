import { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw, Sparkles, Rotate3d, Plus } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { BlockMath, InlineMath } from '../../Math';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { parallelCurrentsGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function ParallelCurrentsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: '3D Force Between Parallel Currents',
      controls: 'Conductor Parameters',
      current1: 'Current in Wire 1 (I₁)',
      current2: 'Current in Wire 2 (I₂)',
      distance: 'Separation Distance (d)',
      calculations: 'Force Computations',
      formula: 'F/L = μ₀I₁I₂ / (2πd)',
      forcePerLength: 'Force/Length (F/L)',
      nature: 'Interaction Nature',
      attraction: 'Attractive Force (ඇදීම / ஈர்ப்பு)',
      repulsion: 'Repulsive Force (තල්ලුව / விலக்கல்)',
      noForce: 'No Interaction',
      interactive3D: 'Click & Drag to Rotate in 3D Space',
      logTrial: 'Record Reading',
      trialHistory: 'Parallel Conductors Observations',
      labNotes: 'Observation Journal',
      pdf: 'Export PDF',
      electrons: 'Show Electron Flow'
    },
    si: {
      title: 'සමාන්තර ධාරා අතර 3D බලය',
      controls: 'සන්නායක පරාමිතීන්',
      current1: '1 වන කම්බියේ ධාරාව (I₁)',
      current2: '2 වන කම්බියේ ධාරාව (I₂)',
      distance: 'සන්නායක අතර දුර (d)',
      calculations: 'බල ගණනය කිරීම්',
      formula: 'F/L = μ₀I₁I₂ / (2πd)',
      forcePerLength: 'බලය/දිග (F/L)',
      nature: 'අන්තර්ක්‍රියා ස්වභාවය',
      attraction: 'ආකර්ෂණ බලය (ඇදීම)',
      repulsion: 'විකර්ෂණ බලය (තල්ලුව)',
      noForce: 'බලයක් නැත',
      interactive3D: '3D අවකාශයේ කරකැවීමට ක්ලික් කර අදින්න',
      logTrial: 'නිරීක්ෂණය සටහන් කරන්න',
      trialHistory: 'සමාන්තර සන්නායක නිරීක්ෂණ ලොගය',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      pdf: 'PDF ලබාගන්න',
      electrons: 'ඉලෙක්ට්‍රෝන ප්‍රවාහය පෙන්වන්න'
    },
    ta: {
      title: 'இணை மின்னோட்டங்களுக்கு இடையேயான 3D விசை',
      controls: 'கடத்தி அளவுருக்கள்',
      current1: 'கம்பி 1 இன் மின்னோட்டம் (I₁)',
      current2: 'கம்பி 2 இன் மின்னோட்டம் (I₂)',
      distance: 'இடைவெளி தூரம் (d)',
      calculations: 'விசை கணிப்புகள்',
      formula: 'F/L = μ₀I₁I₂ / (2πd)',
      forcePerLength: 'விசை/நீளம் (F/L)',
      nature: 'விசை வகை',
      attraction: 'ஈர்ப்பு விசை',
      repulsion: 'விலக்கு விசை',
      noForce: 'விசை இல்லை',
      interactive3D: '3D இடத்தை சுழற்ற கிளிக் செய்து இழுக்கவும்',
      logTrial: 'பதிவைச் சேமிக்கவும்',
      trialHistory: 'இணை கடத்திகளின் சோதனைப் பதிவுகள்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      pdf: 'PDF ஏற்றுமதி செய்',
      electrons: 'மின்னணு ஓட்டத்தைக் காட்டு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [i1, setI1] = useState<number>(5.0); // Amperes
  const [i2, setI2] = useState<number>(5.0); // Amperes
  const [distance, setDistance] = useState<number>(40); // mm
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // 3D rotations
  const [yaw, setYaw] = useState<number>(-0.4);
  const [pitch, setPitch] = useState<number>(0.2);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const electron1Offset = useRef<number>(0);
  const electron2Offset = useRef<number>(0);

  const MU_0 = 4 * Math.PI * 1e-7;

  // Calculated Force per Unit Length (F/L)
  const forcePerLength = useMemo(() => {
    if (distance === 0) return 0;
    const dMeters = distance / 1000;
    return (MU_0 * Math.abs(i1) * Math.abs(i2)) / (2 * Math.PI * dMeters);
  }, [i1, i2, distance]);

  // Interaction type
  const interactionType = useMemo(() => {
    if (i1 === 0 || i2 === 0) return 'none';
    return (i1 * i2 > 0) ? 'attract' : 'repel';
  }, [i1, i2]);

  const handleReset = () => {
    setI1(5.0);
    setI2(5.0);
    setDistance(40);
    setYaw(-0.4);
    setPitch(0.2);
    setNotes('');
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'parallel_currents_sim',
    simulationTitle: 'Force Between Parallel Conductors',
    category: 'fields',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'i1', label: 'Current 1 (I₁)', unit: 'A' },
      { key: 'i2', label: 'Current 2 (I₂)', unit: 'A' },
      { key: 'currentProduct', label: 'Product (I₁·I₂)', unit: 'A²' },
      { key: 'distance_mm', label: 'Distance (d)', unit: 'mm' },
      { key: 'forcePerLength_uN_m', label: 'Force/Length (F/L)', unit: 'μN/m' },
      { key: 'interactionType', label: 'Interaction Type', unit: '' },
    ],
    getCurrentRow: () => {
      const typeLabel = interactionType === 'attract' ? 'Attractive' : interactionType === 'repel' ? 'Repulsive' : 'None';
      return {
        i1,
        i2,
        currentProduct: parseFloat((i1 * i2).toFixed(2)),
        distance_mm: distance,
        forcePerLength_uN_m: parseFloat((forcePerLength * 1e6).toFixed(3)),
        interactionType: typeLabel,
      };
    },
    getSeriesData: () => {
      const distances = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const mu0 = 4 * Math.PI * 1e-7;
      return distances.map((dist, idx) => {
        const dM = dist / 1000;
        const fL = (mu0 * Math.abs(i1 * i2)) / (2 * Math.PI * dM);
        return {
          trial: idx + 1,
          i1,
          i2,
          currentProduct: parseFloat((i1 * i2).toFixed(2)),
          distance_mm: dist,
          forcePerLength_uN_m: parseFloat((fL * 1e6).toFixed(3)),
          interactionType: interactionType.toUpperCase(),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Current I₁ = 2.0 A', params: { i1: 2.0 }, durationMs: 700 },
        { label: 'Current I₁ = 4.0 A', params: { i1: 4.0 }, durationMs: 700 },
        { label: 'Current I₁ = 6.0 A', params: { i1: 6.0 }, durationMs: 700 },
        { label: 'Current I₁ = 8.0 A', params: { i1: 8.0 }, durationMs: 700 },
        { label: 'Current I₁ = 10.0 A', params: { i1: 10.0 }, durationMs: 700 },
      ],
      applyParams: (p) => {
        if (p.i1 !== undefined) setI1(p.i1);
        if (p.i2 !== undefined) setI2(p.i2);
        if (p.distance !== undefined) setDistance(p.distance);
      },
    },
    defaultGraphConfig: {
      xAxis: 'distance_mm',
      yAxis: 'forcePerLength_uN_m',
      title: 'F/L vs d (Parallel Conductors Interaction Force)',
      showRegression: true,
    },
    notes,
  });

  const handleExportPDF = () => {
    const reportParams = {
      'Current Wire 1 (I₁)': `${i1} A`,
      'Current Wire 2 (I₂)': `${i2} A`,
      'Separation Distance (d)': `${distance} mm`,
      'Force per Unit Length (F/L)': `${(forcePerLength * 1e6).toFixed(3)} μN/m`,
      'Interaction Nature': interactionType.toUpperCase()
    };
    downloadReportAsPDF('Parallel Conductors Lab Report', reportParams, recorder.recordedRows, notes);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setYaw(prev => prev + dx * 0.007);
    setPitch(prev => Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, prev - dy * 0.007)));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // 3D projections
  const project = (pt: Point3D, centerX: number, centerY: number): { x: number; y: number; z: number } => {
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = pt.x * cosY - pt.z * sinY;
    const z1 = pt.x * sinY + pt.z * cosY;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = pt.y * cosP - z1 * sinP;
    const z2 = pt.y * sinP + z1 * cosP;

    const scale = 320 / (320 + z2);
    return {
      x: centerX + x1 * scale * 1.4,
      y: centerY + y2 * scale * 1.4,
      z: z2
    };
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 540;
    const rectHeight = 360;

    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    const centerX = rectWidth / 2;
    const centerY = rectHeight / 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Grid background
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px font-sans';
      ctx.fillText('3D VIEWPORT AXES', 15, 20);

      // Sorted rendering objects queue
      const drawQueue: { depth: number; draw: () => void }[] = [];

      // Separation coordinate conversion
      const visualSeparation = distance * 1.5; // separation scale
      const wire1X = -visualSeparation / 2;
      const wire2X = visualSeparation / 2;

      // Amplitude of wire bending (displacement is proportional to force)
      const maxBending = Math.min(30, forcePerLength * 2.5e6); // cap visual bending
      const bendDir = interactionType === 'attract' ? 1 : interactionType === 'repel' ? -1 : 0;

      // Generate wire segment points showing 3D bending curvature
      const wire1Points: Point3D[] = [];
      const wire2Points: Point3D[] = [];
      const segmentCount = 20;

      for (let i = 0; i <= segmentCount; i++) {
        const yVal = -120 + (i * 240) / segmentCount;
        // Parabolic bend: zero at ends (y = -120 and +120), peak at center (y = 0)
        const bendFactor = (1 - Math.pow(yVal / 120, 2)); 
        const offset = maxBending * bendFactor * bendDir;

        wire1Points.push({ x: wire1X + offset, y: yVal, z: 0 });
        wire2Points.push({ x: wire2X - offset, y: yVal, z: 0 });
      }

      // Draw Wire 1
      drawQueue.push({
        depth: 10,
        draw: () => {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          wire1Points.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Core
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 3;
          ctx.beginPath();
          wire1Points.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Current direction arrow on Wire 1
          if (i1 !== 0) {
            const dir = i1 > 0 ? -1 : 1;
            const midIndex = Math.floor(segmentCount / 2);
            const pt = wire1Points[midIndex + dir];
            const proj = project(pt, centerX, centerY);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 4, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 9px font-sans';
            ctx.fillText('I₁', proj.x - 12, proj.y + 3);
          }
        }
      });

      // Draw Wire 2
      drawQueue.push({
        depth: -10,
        draw: () => {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          wire2Points.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Core
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 3;
          ctx.beginPath();
          wire2Points.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Current direction arrow on Wire 2
          if (i2 !== 0) {
            const dir = i2 > 0 ? -1 : 1;
            const midIndex = Math.floor(segmentCount / 2);
            const pt = wire2Points[midIndex + dir];
            const proj = project(pt, centerX, centerY);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 4, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 9px font-sans';
            ctx.fillText('I₂', proj.x + 8, proj.y + 3);
          }
        }
      });

      // Drift electrons Wire 1
      if (showElectrons && i1 !== 0) {
        electron1Offset.current += i1 * 0.25;
        if (electron1Offset.current > 60) electron1Offset.current = 0;
        if (electron1Offset.current < -60) electron1Offset.current = 0;

        for (let i = 2; i < segmentCount - 2; i += 3) {
          const pt = wire1Points[i];
          const proj = project({ x: pt.x, y: pt.y + electron1Offset.current * 0.5, z: pt.z }, centerX, centerY);
          drawQueue.push({
            depth: 5,
            draw: () => {
              ctx.fillStyle = '#3b82f6';
              ctx.shadowColor = '#60a5fa';
              ctx.shadowBlur = 3;
              ctx.beginPath(); ctx.arc(proj.x, proj.y, 2, 0, 2*Math.PI); ctx.fill();
              ctx.shadowBlur = 0;
            }
          });
        }
      }

      // Drift electrons Wire 2
      if (showElectrons && i2 !== 0) {
        electron2Offset.current += i2 * 0.25;
        if (electron2Offset.current > 60) electron2Offset.current = 0;
        if (electron2Offset.current < -60) electron2Offset.current = 0;

        for (let i = 2; i < segmentCount - 2; i += 3) {
          const pt = wire2Points[i];
          const proj = project({ x: pt.x, y: pt.y + electron2Offset.current * 0.5, z: pt.z }, centerX, centerY);
          drawQueue.push({
            depth: -5,
            draw: () => {
              ctx.fillStyle = '#a855f7';
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 3;
              ctx.beginPath(); ctx.arc(proj.x, proj.y, 2, 0, 2*Math.PI); ctx.fill();
              ctx.shadowBlur = 0;
            }
          });
        }
      }

      // Draw Force Vector Arrows at center lines if interaction occurs
      if (interactionType !== 'none' && forcePerLength > 0.05e-6) {
        const midIndex = Math.floor(segmentCount / 2);
        const w1Center = wire1Points[midIndex];
        const w2Center = wire2Points[midIndex];

        drawQueue.push({
          depth: 100,
          draw: () => {
            const p1 = project(w1Center, centerX, centerY);
            const p2 = project(w2Center, centerX, centerY);

            // Compute vector direction
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / length;
            const uy = dy / length;

            const forceArrowLen = Math.min(45, 15 + forcePerLength * 1.5e6);
            const forceDir = interactionType === 'attract' ? 1 : -1;

            // Arrow on Wire 1
            const a1End = { x: p1.x + ux * forceArrowLen * forceDir, y: p1.y + uy * forceArrowLen * forceDir };
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(a1End.x, a1End.y);
            ctx.stroke();

            // Arrowhead on Wire 1
            const headAngle1 = Math.atan2(uy * forceDir, ux * forceDir);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(a1End.x, a1End.y);
            ctx.lineTo(a1End.x - 6 * Math.cos(headAngle1 - Math.PI/6), a1End.y - 6 * Math.sin(headAngle1 - Math.PI/6));
            ctx.lineTo(a1End.x - 6 * Math.cos(headAngle1 + Math.PI/6), a1End.y - 6 * Math.sin(headAngle1 + Math.PI/6));
            ctx.fill();

            // Arrow on Wire 2
            const a2End = { x: p2.x - ux * forceArrowLen * forceDir, y: p2.y - uy * forceArrowLen * forceDir };
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(a2End.x, a2End.y);
            ctx.stroke();

            // Arrowhead on Wire 2
            const headAngle2 = Math.atan2(-uy * forceDir, -ux * forceDir);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(a2End.x, a2End.y);
            ctx.lineTo(a2End.x - 6 * Math.cos(headAngle2 - Math.PI/6), a2End.y - 6 * Math.sin(headAngle2 - Math.PI/6));
            ctx.lineTo(a2End.x - 6 * Math.cos(headAngle2 + Math.PI/6), a2End.y - 6 * Math.sin(headAngle2 + Math.PI/6));
            ctx.fill();

            // Labels F and -F
            ctx.fillStyle = '#b91c1c';
            ctx.font = 'black 9px font-sans';
            ctx.fillText('F', a1End.x + (forceDir === 1 ? -12 : 6), a1End.y - 4);
            ctx.fillText('-F', a2End.x + (forceDir === 1 ? 6 : -16), a2End.y - 4);
          }
        });
      }

      // Sort and render depth
      drawQueue.sort((a, b) => b.depth - a.depth);
      drawQueue.forEach(item => item.draw());

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [yaw, pitch, i1, i2, distance, showElectrons, interactionType, forcePerLength]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Control Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Rotate3d className="w-4 h-4 text-blue-600 animate-spin" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Parallel Lab</span>
            </div>

            {/* Wire 1 Current */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.current1}</span>
                <span className="text-slate-850 font-mono">{i1.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="10.0"
                step="0.5"
                value={i1}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setI1(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Wire 2 Current */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.current2}</span>
                <span className="text-slate-850 font-mono">{i2.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="10.0"
                step="0.5"
                value={i2}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setI2(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Separation distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.distance}</span>
                <span className="text-slate-850 font-mono">{distance} mm</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={distance}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Electrons check */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="showElectrons"
                checked={showElectrons}
                onChange={(e) => setShowElectrons(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="showElectrons" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                {t.electrons}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={recorder.recordTrial}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {t.logTrial}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition-colors cursor-pointer"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: 3D Viewport & Graphs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center relative">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t.title}
              </h3>
              <span className="text-[9px] text-blue-500 font-extrabold uppercase bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {t.interactive3D}
              </span>
            </div>

            <div className="w-full flex justify-center py-2 relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-slate-100 rounded-xl bg-white select-none shadow-sm cursor-grab active:cursor-grabbing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Readings Box */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.calculations}
              </h4>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Conductor Separation (d):</span>
                  <span className="font-mono text-slate-850 font-bold">{distance} mm</span>
                </div>
                <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                  <span className="text-slate-500">{t.forcePerLength}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">
                    {(forcePerLength * 1e6).toFixed(3)} μN/m
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.nature}:</span>
                  <span className={`font-bold ${interactionType === 'attract' ? 'text-emerald-600' : interactionType === 'repel' ? 'text-orange-600' : 'text-slate-400'}`}>
                    {interactionType === 'attract' ? t.attraction : interactionType === 'repel' ? t.repulsion : t.noForce}
                  </span>
                </div>
              </div>
            </div>

            {/* Theory Box */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2.5 text-xs text-slate-650 font-medium">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Mathematical Theory
              </h4>
              <p>
                Two straight parallel conductors carry currents <InlineMath math="I_1" /> and <InlineMath math="I_2" />. The magnetic force per unit length is:
              </p>
              <BlockMath math="\frac{F}{L} = \frac{\mu_0 I_1 I_2}{2\pi d}" />
              <p>
                Parallel currents in the <strong>same direction attract</strong>. Currents in <strong>opposite directions repel</strong>.
              </p>
            </div>
          </div>

          {/* Scientific Graph Laboratory */}
          <ScientificGraphLab
            graphs={parallelCurrentsGraphs}
            trials={recorder.recordedRows}
            simulationParams={{ current1: i1, current2: i2, distance: distance / 1000 }}
            onRecordTrial={recorder.recordTrial}
            onClearTrials={recorder.clearTrials}
            columns={recorder.columns}
            height={260}
          />
        </div>

      </div>

      {/* Observation Logs & Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Lab Notepad */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.labNotes}
            </h3>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record the magnetic force dependency on current directions and conductor separation distances..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium bg-slate-50/20"
          />
        </div>

        {/* Observation Log Table & Laboratory Transfer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              {t.trialHistory}
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {recorder.trialCount} Trials Recorded
            </span>
          </div>

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
            onDownloadPDF={handleExportPDF}
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
