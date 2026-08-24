import { useState, useRef, useEffect } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath } from '../../Math';
import { 
  Sparkles, 
  Info, 
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { calculateRayState, traceFibreRay, OpticsParameters } from '../../../physics/opticsPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

interface TrialLog {
  id: string;
  timestamp: string;
  mode: string;
  n1: number;
  n2: number;
  incidentAngle: number;
  resultAngle: string;
  status: string;
}

export function GeometricalOpticsSimulation() {
  // Parameters
  // parameters
  const [mode, setMode] = useState<'reflection' | 'refraction' | 'tir' | 'fibre'>('refraction');
  const [explainMode, setExplainMode] = useState<boolean>(true);
  const [removeReflection, setRemoveReflection] = useState<boolean>(true);
  const [n1, setN1] = useState<number>(1.00); // Rare or Dense depending on state
  const [n2, setN2] = useState<number>(1.50); // Rare or Dense
  const [incidentAngle, setIncidentAngle] = useState<number>(30); // degrees
  
  // Fibre specifics
  const [nCore, setNCore] = useState<number>(1.50);
  const [nCladding, setNCladding] = useState<number>(1.35);
  const [entryAngle, setEntryAngle] = useState<number>(20);

  // Lab Notes
  const [notes, setNotes] = useState<string>('');
  const [logs, setLogs] = useState<TrialLog[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRay = useRef(false);

  // Synchronize initial indices depending on mode
  useEffect(() => {
    if (mode === 'tir') {
      setN1(1.50);
      setN2(1.00);
      setIncidentAngle(45);
    } else if (mode === 'refraction') {
      setN1(1.00);
      setN2(1.50);
      setIncidentAngle(30);
    } else if (mode === 'reflection') {
      setN1(1.00);
      setN2(1.00);
      setIncidentAngle(30);
    }
  }, [mode]);

  // Ray parameters
  const params: OpticsParameters = {
    mode,
    n1: mode === 'fibre' ? 1.00 : n1,
    n2: mode === 'fibre' ? nCore : n2,
    incidentAngle: mode === 'fibre' ? entryAngle : incidentAngle,
  };

  const rayState = calculateRayState(params);
  const fibreRay = traceFibreRay(1.00, nCore, nCladding, entryAngle, 50, 480);

  // Draw simulation viewport with high-DPI Retina scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 720;
    const rectHeight = 380;

    // Set canvas buffer size matching device pixel ratio
    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;

    // Set CSS display dimensions
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Draw background grid lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    for (let x = 0; x < rectWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rectHeight);
      ctx.stroke();
    }
    for (let y = 0; y < rectHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rectWidth, y);
      ctx.stroke();
    }

    const centerX = rectWidth / 2;
    const centerY = rectHeight / 2;
    const radius = 160;

    const drawRayWithArrow = (
      c: CanvasRenderingContext2D,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      color: string
    ) => {
      c.save();
      c.strokeStyle = color;
      c.fillStyle = color;
      c.lineWidth = 3.5;

      // Draw path line
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();

      // Find arrow placement at midpoint
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const headLen = 11;

      c.beginPath();
      c.moveTo(mx, my);
      c.lineTo(mx - headLen * Math.cos(angle - Math.PI / 7), my - headLen * Math.sin(angle - Math.PI / 7));
      c.lineTo(mx - headLen * Math.cos(angle + Math.PI / 7), my - headLen * Math.sin(angle + Math.PI / 7));
      c.closePath();
      c.fill();
      c.restore();
    };

    if (mode !== 'fibre') {
      // 1. Draw boundary and media blocks
      if (mode === 'reflection') {
        // Uniform medium for reflection (no second medium)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, rectWidth, rectHeight);

        // Draw mirror backing slanted hashes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        for (let x = 5; x < rectWidth; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, centerY);
          ctx.lineTo(x - 5, centerY + 6);
          ctx.stroke();
        }
      } else {
        // Refraction / TIR: Draw dual media blocks
        // Top Medium (n1)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, rectWidth, centerY);

        // Bottom Medium (n2)
        const blueAlpha = Math.min(0.2, (n2 - 1) * 0.15);
        ctx.fillStyle = `rgba(37, 99, 235, ${blueAlpha})`;
        ctx.fillRect(0, centerY, rectWidth, centerY);
      }

      // Boundary interface Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(rectWidth, centerY);
      ctx.stroke();

      // Normal Line (dashed)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX, rectHeight - 20);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // 2. Incident Ray (incoming from top-left quadrant)
      const rad = (incidentAngle * Math.PI) / 180;
      const startX = centerX - radius * Math.sin(rad);
      const startY = centerY - radius * Math.cos(rad);

      // Always pointed inward (from start to center)
      drawRayWithArrow(ctx, startX, startY, centerX, centerY, '#ef4444');

      // Laser source head (drag handle)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Reflected Ray
      // Reflection always exists in reflection mode, or when TIR happens, or if refraction mode has reflection enabled
      const drawReflection = mode === 'reflection' || rayState.isTIR || (mode === 'refraction' && !removeReflection);
      const refX = centerX + radius * Math.sin(rad);
      const refY = centerY - radius * Math.cos(rad);

      if (drawReflection) {
        // Pointed outward (from center to refX, refY)
        drawRayWithArrow(ctx, centerX, centerY, refX, refY, '#f59e0b');

        // Draw letter 'r' reflected normal angle arc (top-right) with value
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 32, -Math.PI / 2, -Math.PI / 2 + rad);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px font-sans';
        ctx.fillText(`r = ${incidentAngle.toFixed(1)}°`, centerX + 8, centerY - 38);
      }

      // 4. Refracted Ray (going into bottom quadrant)
      if (mode !== 'reflection' && !rayState.isTIR && rayState.refractedAngleRad !== null) {
        const refrRad = rayState.refractedAngleRad;
        const refrX = centerX + radius * Math.sin(refrRad);
        const refrY = centerY + radius * Math.cos(refrRad);

        // Pointed outward (from center to refracted end)
        drawRayWithArrow(ctx, centerX, centerY, refrX, refrY, '#3b82f6');

        // Draw letter 'r' refracted normal angle arc (bottom-right) with value
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 32, Math.PI / 2 - refrRad, Math.PI / 2);
        ctx.stroke();
        
        const refrAngleDeg = (refrRad * 180) / Math.PI;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 11px font-sans';
        ctx.fillText(`r = ${refrAngleDeg.toFixed(1)}°`, centerX + 8, centerY + 42);
      }

      // Draw letter 'i' incident normal angle arc (top-left) with value
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, -Math.PI / 2 - rad, -Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px font-sans';
      ctx.fillText(`i = ${incidentAngle.toFixed(1)}°`, centerX - 60, centerY - 38);

      // Medium labels
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px font-sans';
      ctx.fillText(`Medium 1: Refractive Index n₁ = ${n1.toFixed(2)}`, 25, 30);
      if (mode !== 'reflection') {
        ctx.fillText(`Medium 2: Refractive Index n₂ = ${n2.toFixed(2)}`, 25, rectHeight - 25);
      }

      // Critical Angle Text overlay if active
      if (mode === 'tir' && rayState.criticalAngleRad !== null) {
        const critAngleDeg = (rayState.criticalAngleRad * 180) / Math.PI;
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 12px font-sans';
        ctx.fillText(`Critical Angle θc = ${critAngleDeg.toFixed(1)}°`, rectWidth - 190, 30);
      }

      // Explain Mode Text overlay bubbles inside viewport
      if (explainMode) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(20, centerY - 45, 240, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px font-mono';
        ctx.fillText(
          rayState.isTIR ? 'State: Total Internal Reflection' : `Refraction: bends ${n1 > n2 ? 'away' : 'toward'} normal`,
          30,
          centerY - 25
        );
      }

    } else {
      // 5. Optical Fibre layout rendering
      const fibreHeight = 120;
      const startX = 80;
      const startY = centerY - fibreHeight / 2;
      const coreHalfHeight = fibreHeight / 2;

      // Draw Cladding Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(startX, startY - 30, 560, fibreHeight + 60);

      // Cladding label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px font-sans';
      ctx.fillText(`Cladding (n = ${nCladding.toFixed(2)})`, startX + 15, startY - 15);
      ctx.fillText(`Cladding (n = ${nCladding.toFixed(2)})`, startX + 15, startY + fibreHeight + 25);

      // Draw Core Block
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.fillRect(startX, startY, 560, fibreHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, 560, fibreHeight);

      // Core label
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 11px font-sans';
      ctx.fillText(`Core (n = ${nCore.toFixed(2)})`, startX + 20, centerY - 5);

      // Draw ray entering from outside
      const entryRad = (entryAngle * Math.PI) / 180;
      const laserStartX = startX - 60;
      const laserStartY = centerY - 60 * Math.tan(entryRad);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laserStartX, laserStartY);
      ctx.lineTo(startX, centerY);
      ctx.stroke();

      // Laser base handle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(laserStartX, laserStartY, 7, 0, 2 * Math.PI);
      ctx.fill();

      // Normal dashed line at face
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX - 30, centerY);
      ctx.lineTo(startX + 30, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw trace points inside Core
      const fibreTrace = traceFibreRay(1.00, nCore, nCladding, entryAngle, coreHalfHeight, 560);
      if (fibreTrace.points.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, centerY);

        fibreTrace.points.forEach((pt, idx) => {
          if (idx === 0) return;
          ctx.lineTo(startX + pt.x, centerY + pt.y);
        });
        ctx.stroke();

        // Trace intersections as yellow glowing points
        ctx.fillStyle = '#eab308';
        fibreTrace.points.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(startX + pt.x, centerY + pt.y, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      if (explainMode) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(15, centerY - 95, 260, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px font-mono';
        ctx.fillText(
          fibreTrace.isGuided ? 'State: Ray is GUIDED (TIR Active)' : 'State: Ray ESCAPES cladding',
          25,
          centerY - 75
        );
      }
    }

    ctx.restore();
  }, [mode, n1, n2, incidentAngle, nCore, nCladding, entryAngle, explainMode, rayState, fibreRay]);

  // Handle Dragging Ray source to rotate incident angle
  const handleMouseDown = () => {
    if (mode === 'fibre') return; 
    isDraggingRay.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRay.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    // Calculate angle in degrees from mouse relative position to normal vector
    const dx = centerX - x;
    const dy = centerY - y;

    if (dy > 0 && dx > 0) {
      let angle = Math.atan(dx / dy) * (180 / Math.PI);
      if (angle >= 0 && angle <= 89.9) {
        setIncidentAngle(angle);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRay.current = false;
  };

  // Add notes to logs
  const logTrial = () => {
    const newLog: TrialLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      mode: mode.toUpperCase(),
      n1: mode === 'fibre' ? 1.00 : n1,
      n2: mode === 'fibre' ? nCore : n2,
      incidentAngle: mode === 'fibre' ? entryAngle : incidentAngle,
      resultAngle: mode === 'fibre' 
        ? (fibreRay.isGuided ? 'GUIDED' : 'ESCAPED') 
        : (rayState.isTIR ? 'TIR' : `${((rayState.refractedAngleRad || 0) * 180 / Math.PI).toFixed(1)}°`),
      status: mode === 'fibre' 
        ? (fibreRay.isGuided ? 'GUIDED' : 'CLADDING LOSS') 
        : (rayState.isTIR ? 'TIR' : 'REFRACTED')
    };
    setLogs([newLog, ...logs]);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Download Lab Notes PDF
  const downloadPDFReport = () => {
    const parameterMap = {
      'Mode': mode.toUpperCase(),
      'n1': mode === 'fibre' ? '1.00' : n1.toFixed(2),
      'n2': mode === 'fibre' ? nCore.toFixed(2) : n2.toFixed(2),
      'Incident Angle': mode === 'fibre' ? `${entryAngle.toFixed(1)}°` : `${incidentAngle.toFixed(1)}°`
    };

    const printableLogs = logs.map(l => ({
      'timestamp': l.timestamp,
      'mode': l.mode,
      'n1': l.n1,
      'n2': l.n2,
      'incident': l.incidentAngle,
      'result': l.resultAngle,
      'status': l.status
    }));

    downloadReportAsPDF(
      'Geometrical Optics Lab Report',
      parameterMap,
      printableLogs,
      notes
    );
  };

  // Plotly chart series generator for Snell's Law Curve (grazing angles relative to horizontal)
  const generateChartData = () => {
    const theta1Vals: number[] = [];
    const theta2Vals: number[] = [];

    for (let theta1Horiz = 0; theta1Horiz <= 90; theta1Horiz += 2) {
      const theta1Normal = 90 - theta1Horiz;
      const theta1Rad = (theta1Normal * Math.PI) / 180;
      const sinTheta2Normal = (n1 * Math.sin(theta1Rad)) / n2;
      if (sinTheta2Normal <= 1) {
        const theta2Normal = Math.asin(sinTheta2Normal) * (180 / Math.PI);
        const theta2Horiz = 90 - theta2Normal;
        theta1Vals.push(theta1Horiz);
        theta2Vals.push(theta2Horiz);
      }
    }

    return { theta1Vals, theta2Vals };
  };

  const chartData = generateChartData();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Geometrical Optics Explainer
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Syllabus Core</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Study Reflection, Refraction, Snell's Law, Critical Angle transitions, and waveguidance core dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Explain Mode Toggle */}
          <button
            onClick={() => setExplainMode(!explainMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              explainMode 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {explainMode ? 'Explain Mode ON' : 'Explain Mode OFF'}
          </button>
        </div>
      </div>

      {/* Main Grid: Control Panel + Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Mode Selector Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Experiment Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('reflection')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'reflection' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Reflection
              </button>
              <button
                onClick={() => setMode('refraction')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'refraction' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Refraction
              </button>
              <button
                onClick={() => setMode('tir')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'tir' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                TIR & Critical Angle
              </button>
              <button
                onClick={() => setMode('fibre')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'fibre' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Optical Fibre
              </button>
            </div>

            {/* Reflection toggle checkbox for refraction mode */}
            {mode === 'refraction' && (
              <div className="pt-2.5 flex items-center gap-2 border-t border-slate-100 mt-2">
                <input
                  type="checkbox"
                  id="removeReflection"
                  checked={removeReflection}
                  onChange={(e) => setRemoveReflection(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-350 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="removeReflection" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Remove reflection ray in refraction
                </label>
              </div>
            )}
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adjust Wave Parameters</h3>

            {mode !== 'fibre' ? (
              <div className="space-y-4">
                {/* n1 parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Medium 1 Index (n₁)</span>
                    <span className="text-slate-800 font-mono">{n1.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="2.00"
                    step="0.01"
                    value={n1}
                    onChange={(e) => setN1(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                    <span>1.00 (Air)</span>
                    <span>2.00 (Glass Dense)</span>
                  </div>
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => setN1(1.00)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.00 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Air (1.00)
                    </button>
                    <button
                      onClick={() => setN1(1.33)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.33 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Water (1.33)
                    </button>
                    <button
                      onClick={() => setN1(1.50)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Glass (1.50)
                    </button>
                  </div>
                </div>

                {/* n2 parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Medium 2 Index (n₂)</span>
                    <span className="text-slate-800 font-mono">{n2.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="2.00"
                    step="0.01"
                    value={n2}
                    onChange={(e) => setN2(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                    <span>1.00 (Air)</span>
                    <span>2.00 (Glass Dense)</span>
                  </div>
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => setN2(1.00)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.00 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Air (1.00)
                    </button>
                    <button
                      onClick={() => setN2(1.33)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.33 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Water (1.33)
                    </button>
                    <button
                      onClick={() => setN2(1.50)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Glass (1.50)
                    </button>
                  </div>
                </div>

                {/* Incident Angle parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Angle of Incidence (i)</span>
                    <span className="text-slate-800 font-mono">{incidentAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="89.5"
                    step="0.5"
                    value={incidentAngle}
                    onChange={(e) => setIncidentAngle(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-medium block">Tip: Drag the red laser handle directly on the viewport!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Core Index */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Core Refractive Index (n_core)</span>
                    <span className="text-slate-800 font-mono">{nCore.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="1.80"
                    step="0.02"
                    value={nCore}
                    onChange={(e) => setNCore(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Cladding Index */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Cladding Index (n_cladding)</span>
                    <span className="text-slate-800 font-mono">{nCladding.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="1.80"
                    step="0.02"
                    value={nCladding}
                    onChange={(e) => setNCladding(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Entry Angle */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Fibre Entry Angle</span>
                    <span className="text-slate-800 font-mono">{entryAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="70"
                    step="1"
                    value={entryAngle}
                    onChange={(e) => setEntryAngle(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={logTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Trial Snapshot
            </button>
          </div>

        </div>

        {/* Viewport + Math/Explanation Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Visual Canvas Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-start">Visual Ray Viewport</h3>
            <div className="w-full overflow-x-auto flex justify-center py-2">
              <canvas
                ref={canvasRef}
                className="border border-slate-100 rounded-lg bg-white cursor-crosshair select-none shadow-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          {/* Explain Mode Real-time Card overlay */}
          {explainMode && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="w-4 h-4" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Concept Explainer Overlay</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {mode === 'fibre' ? fibreRay.explanation : rayState.explanation}
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/70 rounded-lg p-3 border border-blue-200/50">
                <div className="text-xs font-bold text-slate-500 font-mono">Mathematical Formula:</div>
                <div className="text-xs font-bold text-slate-800">
                  {mode === 'reflection' && <BlockMath math="\theta_i = \theta_r" />}
                  {(mode === 'refraction' || mode === 'tir') && (
                    <BlockMath math={rayState.snellsEquationText} />
                  )}
                  {mode === 'fibre' && (
                    <BlockMath math={`\\sin \\theta_{max} = \\sqrt{n_{core}^2 - n_{cladding}^2}`} />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Numerical Data Graph & Lab Book Section */}
      <div className={`grid grid-cols-1 gap-6 ${mode !== 'fibre' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        
        {/* Plotly Graph Card */}
        {mode !== 'fibre' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Snell's Law Angle Curve</h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <PlotlyGraph
                data={[
                  {
                    x: chartData.theta1Vals,
                    y: chartData.theta2Vals,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Refracted Angle',
                    line: { color: '#3b82f6', width: 3 }
                  },
                  // Current point indicator
                  {
                    x: [90 - incidentAngle],
                    y: [rayState.isTIR ? null : 90 - (rayState.refractedAngleRad || 0) * (180 / Math.PI)],
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Current State',
                    marker: { color: '#ef4444', size: 10 }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 45, r: 15, t: 15, b: 40 },
                  xaxis: { title: { text: 'Incident Angle i (°)' }, range: [0, 90] },
                  yaxis: { title: { text: 'Refracted Angle r (°)' }, range: [0, 90] },
                  legend: { orientation: 'h', y: -0.2 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Lab Notes Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Notebook Notes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="text-slate-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear notebook logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
              <button
                onClick={downloadPDFReport}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                PDF Report
              </button>
            </div>
          </div>

          <textarea
            placeholder="Log experimental observations, write deductions here. (e.g. As n2 increases, the refracted angle r decreases for the same angle of incidence...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar"
          />

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Logged Trials ({logs.length})</h4>
            <div className="border border-slate-100 rounded-lg max-h-36 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="p-2.5 text-[11px] flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 font-mono">[{log.timestamp}]</span>{' '}
                      <span className="text-slate-500 font-semibold">{log.mode}</span>: i = {log.incidentAngle.toFixed(1)}°, n₁ = {log.n1.toFixed(2)}, n₂ = {log.n2.toFixed(2)}
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                      log.status === 'TIR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      log.status === 'GUIDED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {log.resultAngle}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  No active logs recorded. Adjust parameters and click "Log Trial Snapshot" above.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
