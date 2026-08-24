import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import { PlotlyGraph } from '../../PlotlyGraph';
import { EducationalPanel } from '../../EducationalPanel';
import {
  calculateInclinedForces,
  stepInclinedSimulation,
  InclinedPlaneParameters,
} from '../../../physics/inclinedPlanePhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft, ChevronRight, BookOpen, Maximize2, ClipboardList, Trash2, FileDown } from 'lucide-react';

export function InclinedPlaneSimulation({ lang: _lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const maxTrackLength = 30; // meters

  // 1. Parameters & State
  const [params, setParams] = useState<InclinedPlaneParameters>({
    angle: 30,
    mass: 5,
    muStatic: 0.5,
    muKinetic: 0.35,
    g: 10,
  });

  const [dynamics, setDynamics] = useState<{ distance: number; velocity: number }>({
    distance: 15, // start in the middle (meters)
    velocity: 0,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [isLearnExpanded, setIsLearnExpanded] = useState(true);
  const [expandedGraph, setExpandedGraph] = useState<'pvt' | 'vvt' | 'avt' | null>(null);

  // Lab Notes State
  const [labNotes, setLabNotes] = useState('');
  const [loggedData, setLoggedData] = useState<any[]>([]);

  // Simulation time-series tracking for graphs
  const [history, setHistory] = useState<{ t: number; pos: number; vel: number; acc: number; gravityParallel: number; friction: number }[]>([]);

  // Clamp kinetic friction to be <= static friction
  const handleStaticFrictionChange = (val: number) => {
    setParams((prev) => {
      const nextK = Math.min(prev.muKinetic, val);
      return { ...prev, muStatic: val, muKinetic: nextK };
    });
  };

  const handleKineticFrictionChange = (val: number) => {
    setParams((prev) => {
      const nextS = Math.max(prev.muStatic, val);
      return { ...prev, muKinetic: val, muStatic: nextS };
    });
  };

  // Compute current forces
  const currentDynamics = calculateInclinedForces(dynamics, params);

  // 2. Simulation Engine Hook
  const {
    time,
    setTime,
    isPlaying,
    setIsPlaying,
    togglePlay,
    reset: resetEngine,
    stepForward,
    timeScale,
    setTimeScale,
  } = useSimulation({
    initialTime: 0,
    onStep: (newTime, dt) => {
      let hitEnd = false;
      // Step physics model forward
      setDynamics((prev) => {
        const next = stepInclinedSimulation(prev, params, dt, maxTrackLength);
        if (next.distance <= 0 || next.distance >= maxTrackLength) {
          if (prev.distance > 0 && prev.distance < maxTrackLength) {
            hitEnd = true;
          }
        }
        
        // Record history
        setHistory((h) => [
          ...h,
          {
            t: newTime,
            pos: next.distance,
            vel: next.velocity,
            acc: next.acceleration,
            gravityParallel: next.gravityParallel,
            friction: next.frictionForce,
          },
        ]);

        return next;
      });

      if (hitEnd) {
        setIsPlaying(false);
      }
    },
  });

  const handleReset = () => {
    resetEngine();
    setTime(0);
    setDynamics({ distance: 15, velocity: 0 });
    setHistory([]);
  };

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getDistanceFromEvent = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const margin = { left: 50, right: 50, bottom: 50, top: 50 };
    const wWidth = width - margin.left - margin.right;
    const wHeight = height - margin.top - margin.bottom;

    const wedgeLeftX = margin.left;
    const wedgeTopY = margin.top + wHeight - wWidth * Math.tan((params.angle * Math.PI) / 185);

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Calculate slope vector direction
    const dx = clickX - wedgeLeftX;
    const dy = clickY - wedgeTopY;

    const slopeAngle = Math.atan2(wHeight - (wedgeTopY - margin.top), wWidth);
    const pixelsPerMeter = Math.sqrt(Math.pow(wWidth, 2) + Math.pow(wHeight - (wedgeTopY - margin.top), 2)) / maxTrackLength;

    // Project click relative coordinates along the slope line
    const pxAlongSlope = dx * Math.cos(slopeAngle) + dy * Math.sin(slopeAngle);
    const distMeters = maxTrackLength - (pxAlongSlope / pixelsPerMeter);
    return Math.max(0, Math.min(maxTrackLength, distMeters));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isPlaying) return;
    const distanceVal = getDistanceFromEvent(clientX, clientY);
    if (distanceVal === null) return;

    // Check if clicked close to block (distanceVal +/- 4.0 meters)
    if (Math.abs(distanceVal - dynamics.distance) <= 4.0) {
      setIsDragging(true);
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isPlaying) return;
    const distanceVal = getDistanceFromEvent(clientX, clientY);
    if (distanceVal === null) return;
    setDynamics({ distance: distanceVal, velocity: 0 });
    setHistory([]);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  // 3. Canvas Rendering (Inclined Wedge)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Drawing margins
    const margin = { left: 50, right: 50, bottom: 50, top: 50 };
    const wWidth = width - margin.left - margin.right;
    const wHeight = height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, width, height);

    // Coordinate points for the inclined wedge
    const wedgeLeftX = margin.left;
    const wedgeRightX = margin.left + wWidth;
    const wedgeBottomY = margin.top + wHeight;

    const thetaRad = (params.angle * Math.PI) / 185;
    // Calculate wedge height based on angle
    const wedgeTopY = wedgeBottomY - wWidth * Math.tan(Math.min(thetaRad, 1.2)); // clamp wedge height visually

    // Draw wedge triangle (light slate gray fill)
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wedgeLeftX, wedgeBottomY);
    ctx.lineTo(wedgeRightX, wedgeBottomY);
    ctx.lineTo(wedgeLeftX, wedgeTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scale of track length
    const totalPxLength = Math.sqrt(Math.pow(wWidth, 2) + Math.pow(wedgeBottomY - wedgeTopY, 2));
    const pixelsPerMeter = totalPxLength / maxTrackLength;

    // Angle of incline along which block slides
    const slopeAngle = Math.atan2(wedgeBottomY - wedgeTopY, wedgeRightX - wedgeLeftX);

    // Compute center position of block along the slope
    // Block moves from top-left (distance = maxTrackLength) to bottom-right (distance = 0)
    // Wait, let's make it standard: distance = 0 is bottom-left, distance = 30 is top-right?
    // In our wedge: Left-X is wedgeLeftX, Top-Y is wedgeTopY. Right-X is wedgeRightX, Bottom-Y is wedgeBottomY.
    // So the incline goes down from (LeftX, TopY) to (RightX, BottomY).
    // Let's define distance = 0 at the bottom-right (wedgeRightX, wedgeBottomY)
    // and distance = 30 at the top-left (wedgeLeftX, wedgeTopY).
    const blockDistPx = (maxTrackLength - dynamics.distance) * pixelsPerMeter;

    const blockCenterX = wedgeLeftX + blockDistPx * Math.cos(slopeAngle);
    const blockCenterY = wedgeTopY + blockDistPx * Math.sin(slopeAngle);

    // Draw block aligned with slope
    const blockWidthM = 4.5;
    const blockHeightM = 3.0;
    const blockW = blockWidthM * pixelsPerMeter;
    const blockH = blockHeightM * pixelsPerMeter;

    ctx.save();
    ctx.translate(blockCenterX, blockCenterY);
    ctx.rotate(slopeAngle);

    // Draw block body
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-blockW / 2, -blockH, blockW, blockH, 3);
    ctx.fill();
    ctx.stroke();

    // Label Mass inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.mass} kg`, 0, -blockH / 2 + 4);

    // Draw Force Vector Arrows relative to slope coordinates
    if (showVectors) {
      const vectorScale = 1.8;

      // 1. Normal Force (pointing UP perpendicular to slope: angle -PI/2)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -blockH / 2);
      ctx.lineTo(0, -blockH / 2 - currentDynamics.normalForce * vectorScale);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, -blockH / 2 - currentDynamics.normalForce * vectorScale);
      ctx.lineTo(-4, -blockH / 2 - currentDynamics.normalForce * vectorScale + 6);
      ctx.lineTo(4, -blockH / 2 - currentDynamics.normalForce * vectorScale + 6);
      ctx.fill();

      // 2. Parallel Gravity components pulling block down slope (towards +X in rotated frame)
      if (Math.abs(currentDynamics.gravityParallel) > 0.1) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -blockH / 2);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale, -blockH / 2);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(currentDynamics.gravityParallel * vectorScale, -blockH / 2);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale - 6, -blockH / 2 - 4);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale - 6, -blockH / 2 + 4);
        ctx.fill();
      }

      // 3. Friction opposing motion/forces (pointing towards -X in rotated frame)
      if (Math.abs(currentDynamics.frictionForce) > 0.1) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -blockH / 2);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale, -blockH / 2);
        ctx.stroke();
        // Arrowhead
        const dir = Math.sign(currentDynamics.frictionForce);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(currentDynamics.frictionForce * vectorScale, -blockH / 2);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale - dir * 6, -blockH / 2 - 4);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale - dir * 6, -blockH / 2 + 4);
        ctx.fill();
      }
    }

    ctx.restore();

    // Draw straight downward Gravitational force Fg (Unrotated global coords)
    if (showVectors) {
      const vectorScale = 1.8;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(blockCenterX, blockCenterY - blockH / 2);
      ctx.lineTo(blockCenterX, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(blockCenterX, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale);
      ctx.lineTo(blockCenterX - 4, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale - 6);
      ctx.lineTo(blockCenterX + 4, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale - 6);
      ctx.fill();
    }
  }, [dynamics, params, showVectors, currentDynamics]);

  // 4. Lab Logger Handlers
  const handleLogDataPoint = () => {
    const newPoint = {
      trial: loggedData.length + 1,
      time: `${time.toFixed(2)}s`,
      angle: `${params.angle}°`,
      mass: `${params.mass}kg`,
      gravity_parallel: `${currentDynamics.gravityParallel.toFixed(2)}N`,
      friction: `${currentDynamics.frictionForce.toFixed(2)}N`,
      accel: `${currentDynamics.acceleration.toFixed(3)}m/s²`,
      velocity: `${dynamics.velocity.toFixed(2)}m/s`,
    };
    setLoggedData((prev) => [...prev, newPoint]);
  };

  const handleClearLogs = () => {
    if (confirm('Clear all logged inclined plane trials?')) {
      setLoggedData([]);
    }
  };

  const handleDownloadPDF = () => {
    const reportParams = {
      'Incline Angle (theta)': `${params.angle}°`,
      'Block Mass (m)': `${params.mass} kg`,
      'Static Friction (μs)': `${params.muStatic}`,
      'Kinetic Friction (μk)': `${params.muKinetic}`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF("Friction on an Inclined Plane", reportParams, loggedData, labNotes);
  };

  // 5. Graphs Data
  const timeAxis = history.map(h => h.t);
  const distVals = history.map(h => h.pos);
  const velVals = history.map(h => h.vel);
  const accVals = history.map(h => h.acc);

  const distPlotData = [
    { x: timeAxis, y: distVals, mode: 'lines' as const, name: 'Distance s (m)', line: { color: '#ef4444', width: 2.5 } },
  ];

  const velocityPlotData = [
    { x: timeAxis, y: velVals, mode: 'lines' as const, name: 'Velocity (m/s)', line: { color: '#3b82f6', width: 2.5 } },
  ];

  const accelPlotData = [
    { x: timeAxis, y: accVals, mode: 'lines' as const, name: 'Accel (m/s²)', line: { color: '#f59e0b', width: 2.5 } },
  ];

  const graphLayoutTemplate = (title: string, xaxis: string, yaxis: string): Partial<Plotly.Layout> => ({
    title: { text: title, font: { size: 12, family: 'Outfit, sans-serif' } },
    margin: { l: 45, r: 15, t: 35, b: 35 },
    xaxis: { title: { text: xaxis }, gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1' },
    yaxis: { title: { text: yaxis }, gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1' },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, font: { size: 10 } },
    hovermode: 'closest',
  });

  // 6. Educational Notes
  const conceptText = (
    <div className="space-y-3">
      <p>
        An <strong>Inclined Plane</strong> reduces the force required to lift a load by expanding the travel distance. When a block is placed on an incline, gravity is resolved into two perpendicular components:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Perpendicular Component:</strong> F_perp = m * g * cos(θ). This balances the normal force: Fn = m * g * cos(θ).
        </li>
        <li>
          <strong>Parallel Component:</strong> F_para = m * g * sin(θ). This acts along the slope, pulling the block down.
        </li>
      </ul>
      <p>
        The block will slide down the slope only if the parallel gravity component exceeds the maximum static friction limit: m * g * sin(θ) &gt; μs * (m * g * cos(θ)), which simplifies to: tan(θ) &gt; μs.
      </p>
    </div>
  );

  const equations = [
    { latex: 'F_N = m g \\cos(\\theta)', description: 'Normal force perpendicular to incline' },
    { latex: 'F_{\\parallel} = m g \\sin(\\theta)', description: 'Gravity force component down incline' },
    { latex: 'f_{s,\\text{max}} = \\mu_s F_N', description: 'Static friction limit' },
    { latex: '\\tan(\\theta_{\\text{slide}}) = \\mu_s', description: 'Critical angle where block breaks free' },
  ];

  const variables = [
    { symbol: '\\theta', name: 'Incline slope angle', unit: 'degrees' },
    { symbol: 'm', name: 'Mass of the sliding block', unit: 'kg' },
    { symbol: 's', name: 'Distance traveled along slope', unit: 'm' },
    { symbol: 'F_{\\parallel}', name: 'Parallel force down incline', unit: 'N' },
  ];

  const observations = [
    'Set Static Friction (μs) to 0.5. Slowly increase the incline angle. Note that the block starts sliding exactly when tan(θ) exceeds μs (approx 26.5°).',
    'Increase the mass. Notice that the critical angle required to start sliding does not change, as mass cancels out in the equation tan(θ) > μs.',
    'Observe the normal force (blue vector arrow) shrink and gravity parallel (orange arrow) grow as the incline angle increases.',
  ];

  const challenges = [
    {
      question: 'A block rests on an inclined plane. If the static friction coefficient is 0.577, what is the critical angle of inclination at which the block will just begin to slide?',
      options: ['15°', '30°', '45°', '60°'],
      correctAnswer: '30°',
      solution: `1. Condition to slide: tan(θ) > μs
2. Substitute the values: tan(θ) = 0.577
3. θ = arctan(0.577) ≈ 30°
Hence, the critical angle is 30°.`,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-10.5rem)] lg:overflow-hidden">
      
      {/* Parameters & Lab Notebook Sidebar (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar h-full pr-1">
        
        {/* Controls Container */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4 shrink-0">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            Parameters
          </h3>

          {/* Incline Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Slope Angle (θ)</span>
              <span className="text-blue-600 font-mono">{params.angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="0.5"
              value={params.angle}
              onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Block Mass */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Block Mass (m)</span>
              <span className="text-blue-600 font-mono">{params.mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={params.mass}
              onChange={(e) => setParams({ ...params, mass: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Static Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Static Friction (μs)</span>
              <span className="text-blue-600 font-mono">{params.muStatic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.02"
              value={params.muStatic}
              onChange={(e) => handleStaticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Kinetic Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Kinetic Friction (μk)</span>
              <span className="text-blue-600 font-mono">{params.muKinetic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.02"
              value={params.muKinetic}
              onChange={(e) => handleKineticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Vector Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="inclined-vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="inclined-vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Show Force Vectors (Fn, Fg, Fp, f)
            </label>
          </div>
        </div>

        {/* Lab Notebook */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 flex-1 min-h-[220px] flex flex-col">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            Lab Notebook
          </h3>

          <textarea
            value={labNotes}
            onChange={(e) => setLabNotes(e.target.value)}
            placeholder="Type your laboratory observations, findings, and notes here..."
            className="w-full flex-1 border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans"
          />

          <div className="flex gap-2">
            <button
              onClick={handleLogDataPoint}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              Log State
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Download PDF Lab Report"
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF Report
            </button>
            <button
              onClick={handleClearLogs}
              disabled={loggedData.length === 0}
              className="p-2 border border-slate-200 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Clear logged trials"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {loggedData.length > 0 && (
            <div className="text-[10px] text-slate-400 font-mono text-center">
              {loggedData.length} trial(s) logged in report
            </div>
          )}
        </div>
      </div>

      {/* Interactive Simulation Viewport + Graphs (6/8 cols) */}
      <div className={`flex flex-col gap-3 h-full min-h-0 ${isLearnExpanded ? 'lg:col-span-6' : 'lg:col-span-8'}`}>
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inclined Plane Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                Fn (Normal)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
                Friction
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 relative bg-slate-50/20 canvas-grid-bg min-h-0">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />
            {/* Live indicators */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 px-3 py-2 rounded text-[11px] font-mono space-y-1 border border-slate-800 pointer-events-none">
              <div>DISTANCE (s): <span className="text-white font-bold">{dynamics.distance.toFixed(2)} m</span></div>
              <div>VELOCITY (v): <span className="text-blue-400 font-bold">{dynamics.velocity.toFixed(2)} m/s</span></div>
              <div>ACCEL (a): <span className="text-amber-400 font-bold">{currentDynamics.acceleration.toFixed(3)} m/s²</span></div>
              <div>
                STATE: {Math.abs(dynamics.velocity) < 1e-4 ? (
                  <span className="text-red-400 font-bold uppercase">Locked (Static)</span>
                ) : (
                  <span className="text-emerald-400 font-bold uppercase">Sliding (Kinetic)</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-lg shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={() => stepForward(0.02)}
                disabled={isPlaying}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Step Forward (dt = 20ms)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed select */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Speed:</span>
              <select
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="border border-slate-200 bg-white rounded p-1 text-slate-700 font-mono font-medium outline-none cursor-pointer text-xs"
              >
                <option value="0.1">0.1x</option>
                <option value="0.5">0.5x</option>
                <option value="1.0">1.0x (Real)</option>
                <option value="2.0">2.0x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scientific Graphs */}
        <div className="h-[210px] shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0">
          
          {/* Position vs Time */}
          <div 
            onClick={() => setExpandedGraph('pvt')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Position graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={distPlotData}
                layout={graphLayoutTemplate('Distance along Slope vs Time', 'Time t (s)', 'Distance s (m)')}
              />
            </div>
          </div>

          {/* Velocity vs Time */}
          <div 
            onClick={() => setExpandedGraph('vvt')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Velocity graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={velocityPlotData}
                layout={graphLayoutTemplate('Velocity vs Time', 'Time t (s)', 'Velocity (m/s)')}
              />
            </div>
          </div>

          {/* Acceleration vs Time */}
          <div 
            onClick={() => setExpandedGraph('avt')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Acceleration graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={accelPlotData}
                layout={graphLayoutTemplate('Acceleration vs Time', 'Time t (s)', 'Acceleration (m/s²)')}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Learn Panel (Right) */}
      <div className={`${isLearnExpanded ? 'lg:col-span-3' : 'lg:col-span-1'} h-full min-h-0 transition-all duration-300 flex flex-col`}>
        {isLearnExpanded ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">Learn</span>
              </div>
              <button 
                onClick={() => setIsLearnExpanded(false)}
                className="p-1 hover:bg-slate-200 text-slate-500 rounded cursor-pointer transition-colors"
                title="Collapse Learn panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <EducationalPanel
                conceptText={conceptText}
                equations={equations}
                variables={variables}
                observations={observations}
                challenges={challenges}
              />
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsLearnExpanded(true)}
            className="flex-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg shadow-sm flex flex-col items-center py-4 cursor-pointer hover:bg-slate-50 transition-all select-none"
            title="Expand Learn panel"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500 mb-2" />
            <BookOpen className="w-5 h-5 text-blue-600 mb-6" />
            <span 
              className="text-xs font-bold text-slate-500 uppercase tracking-widest"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Learn
            </span>
          </button>
        )}
      </div>

      {/* Expanded Graph Overlay Modal */}
      {expandedGraph && (
        <div 
          onClick={() => setExpandedGraph(null)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-4xl w-full p-6 relative flex flex-col h-[75vh]"
          >
            <button 
              onClick={() => setExpandedGraph(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-semibold font-mono text-lg cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              title="Close expanded graph"
            >
              ✕
            </button>
            <div className="flex-1 min-h-0">
              {expandedGraph === 'pvt' && (
                <PlotlyGraph
                  data={distPlotData}
                  layout={{
                    ...graphLayoutTemplate('Distance along Slope vs Time [EXPANDED]', 'Time t (s)', 'Distance s (m)'),
                    margin: { l: 60, r: 20, t: 50, b: 50 },
                  }}
                  style={{ height: '100%' }}
                />
              )}
              {expandedGraph === 'vvt' && (
                <PlotlyGraph
                  data={velocityPlotData}
                  layout={{
                    ...graphLayoutTemplate('Velocity vs Time [EXPANDED]', 'Time t (s)', 'Velocity (m/s)'),
                    margin: { l: 60, r: 20, t: 50, b: 50 },
                  }}
                  style={{ height: '100%' }}
                />
              )}
              {expandedGraph === 'avt' && (
                <PlotlyGraph
                  data={accelPlotData}
                  layout={{
                    ...graphLayoutTemplate('Acceleration vs Time [EXPANDED]', 'Time t (s)', 'Acceleration (m/s²)'),
                    margin: { l: 60, r: 20, t: 50, b: 50 },
                  }}
                  style={{ height: '100%' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
