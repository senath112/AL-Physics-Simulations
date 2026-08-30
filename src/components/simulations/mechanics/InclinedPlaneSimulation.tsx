import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import { EducationalPanel } from '../../EducationalPanel';
import {
  calculateInclinedForces,
  stepInclinedSimulation,
  InclinedPlaneParameters,
} from '../../../physics/inclinedPlanePhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft, ChevronRight, BookOpen, ClipboardList } from 'lucide-react';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { inclinedPlaneGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_OBSERVATION_NOTEBOOKS } from '../../../config/features';

export function InclinedPlaneSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      inclineAngle: 'Incline Angle (θ)',
      mass: 'Block Mass (m)',
      staticFriction: 'Static Friction (μₛ)',
      kineticFriction: 'Kinetic Friction (μₖ)',
      gravity: 'Gravity (g)',
      vectors: 'Show Vector Force Arrows',
      theoryOutput: 'Theoretical Kinematics',
      acceleration: 'Acceleration (a)',
      fricForce: 'Friction Force (f)',
      normalForce: 'Normal Force (R)',
      staticThreshold: 'Friction Threshold',
      play: 'Play',
      pause: 'Pause',
      step: 'Step Forward',
      reset: 'Reset',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Logged Trials History',
      clearLogs: 'Clear Logs'
    },
    si: {
      paramsTitle: 'පරාමිතීන්',
      inclineAngle: 'ඇලවීම් කෝණය (θ)',
      mass: 'ස්කන්ධය (m)',
      staticFriction: 'ස්ථිතික ඝර්ෂණ සංගුණකය (μₛ)',
      kineticFriction: 'ගතික ඝර්ෂණ සංගුණකය (μₖ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'බල දෛශික ඊතල පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක චලිතය',
      acceleration: 'ත්වරණය (a)',
      fricForce: 'ඝර්ෂණ බලය (f)',
      normalForce: 'අභิලම්භ ප්‍රතික්‍රියාව (R)',
      staticThreshold: 'සීමාකාරී ඝර්ෂණය',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      step: 'ඉදිරියට පියවරක්',
      reset: 'නැවත මුලට',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      paramsTitle: 'அளவுருக்கள்',
      inclineAngle: 'சாய்வுக் கோணம் (θ)',
      mass: 'நிறை (m)',
      staticFriction: 'நிலை உராய்வு குணகம் (μₛ)',
      kineticFriction: 'இயக்க உராய்வு குணகம் (μₖ)',
      gravity: 'ஈர்ப்பு முடுக்கம் (g)',
      vectors: 'விசை திசையன்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு இயக்கவியல்',
      acceleration: 'முடுக்கம் (a)',
      fricForce: 'உராய்வு விசை (f)',
      normalForce: 'செங்குத்து விசை (R)',
      staticThreshold: 'உராய்வு வரம்பு',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      step: 'முன்னோக்கிச் செல்',
      reset: 'மீட்டமை',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const maxTrackLength = 15; // meters

  // 1. Parameters & State
  const [params, setParams] = useState<InclinedPlaneParameters>({
    angle: 30,
    mass: 5,
    muStatic: 0.5,
    muKinetic: 0.35,
    g: 10,
  });

  const [dynamics, setDynamics] = useState<{ distance: number; velocity: number }>({
    distance: 7.5, // start in the middle (meters)
    velocity: 0,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [isLearnExpanded, setIsLearnExpanded] = useState(true);

  // Lab Notes State
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'inclined_sim',
    simulationTitle: 'Inclined Plane Dynamics',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'angle', label: 'Incline Angle θ', unit: '°' },
      { key: 'sinAngle', label: 'sin(θ)', unit: '' },
      { key: 'mass', label: 'Mass m', unit: 'kg' },
      { key: 'acceleration', label: 'Acceleration a', unit: 'm/s²' },
      { key: 'normalForce', label: 'Normal Force R', unit: 'N' },
      { key: 'frictionForce', label: 'Friction Force f', unit: 'N' },
    ],
    getCurrentRow: () => {
      const angleRad = (params.angle * Math.PI) / 180;
      return {
        angle: params.angle,
        sinAngle: parseFloat(Math.sin(angleRad).toFixed(3)),
        mass: params.mass,
        acceleration: parseFloat(currentDynamics.acceleration.toFixed(2)),
        normalForce: parseFloat(currentDynamics.normalForce.toFixed(2)),
        frictionForce: parseFloat(currentDynamics.frictionForce.toFixed(2)),
      };
    },
    getSeriesData: () => {
      const angles = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
      return angles.map((ang, idx) => {
        const rad = (ang * Math.PI) / 180;
        const gVal = params.g || 10;
        const netA = Math.max(0, gVal * (Math.sin(rad) - params.muKinetic * Math.cos(rad)));
        const rNorm = params.mass * gVal * Math.cos(rad);
        const fFric = params.muKinetic * rNorm;
        return {
          trial: idx + 1,
          angle: ang,
          sinAngle: parseFloat(Math.sin(rad).toFixed(3)),
          mass: params.mass,
          acceleration: parseFloat(netA.toFixed(2)),
          normalForce: parseFloat(rNorm.toFixed(2)),
          frictionForce: parseFloat(fFric.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Incline Angle θ = 15°', params: { angle: 15 }, durationMs: 750 },
        { label: 'Incline Angle θ = 25°', params: { angle: 25 }, durationMs: 750 },
        { label: 'Incline Angle θ = 35°', params: { angle: 35 }, durationMs: 750 },
        { label: 'Incline Angle θ = 45°', params: { angle: 45 }, durationMs: 750 },
        { label: 'Incline Angle θ = 55°', params: { angle: 55 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        setParams((prev) => ({ ...prev, ...p }));
      },
    },
    defaultGraphConfig: {
      xAxis: 'sinAngle',
      yAxis: 'acceleration',
      title: 'Acceleration vs sin(θ) (Slope = g)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Incline Angle (θ)': `${params.angle}°`,
      'Block Mass (m)': `${params.mass} kg`,
      'Static Friction (μs)': `${params.muStatic}`,
      'Kinetic Friction (μk)': `${params.muKinetic}`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF('Inclined Plane Laboratory', reportParams, recorder.recordedRows, labNotes);
  };

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

    const thetaRad = (params.angle * Math.PI) / 180;
    const maxHeightAvailable = wHeight - 60; // leave safety padding for vectors

    let drawnWedgeHeight = maxHeightAvailable;
    let drawnWedgeWidth = drawnWedgeHeight / Math.max(0.08, Math.tan(thetaRad));

    if (drawnWedgeWidth > wWidth) {
      drawnWedgeWidth = wWidth;
      drawnWedgeHeight = drawnWedgeWidth * Math.tan(thetaRad);
    }

    if (drawnWedgeWidth < 185) {
      drawnWedgeWidth = 185;
      drawnWedgeHeight = maxHeightAvailable;
    }

    const wedgeLeftX = margin.left + (wWidth - drawnWedgeWidth) / 2;
    const wedgeTopY = margin.top + wHeight - drawnWedgeHeight;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Calculate slope vector direction
    const dx = clickX - wedgeLeftX;
    const dy = clickY - wedgeTopY;

    const slopeAngle = Math.atan2(drawnWedgeHeight, drawnWedgeWidth);
    const pixelsPerMeter = Math.sqrt(Math.pow(drawnWedgeWidth, 2) + Math.pow(drawnWedgeHeight, 2)) / maxTrackLength;

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

    const thetaRad = (params.angle * Math.PI) / 180;
    const maxHeightAvailable = wHeight - 60;
    
    let drawnWedgeHeight = maxHeightAvailable;
    let drawnWedgeWidth = drawnWedgeHeight / Math.max(0.08, Math.tan(thetaRad));

    if (drawnWedgeWidth > wWidth) {
      drawnWedgeWidth = wWidth;
      drawnWedgeHeight = drawnWedgeWidth * Math.tan(thetaRad);
    }

    if (drawnWedgeWidth < 185) {
      drawnWedgeWidth = 185;
      drawnWedgeHeight = maxHeightAvailable;
    }

    // Coordinate points for the inclined wedge
    const wedgeLeftX = margin.left + (wWidth - drawnWedgeWidth) / 2;
    const wedgeRightX = wedgeLeftX + drawnWedgeWidth;
    const wedgeBottomY = margin.top + wHeight;
    const wedgeTopY = wedgeBottomY - drawnWedgeHeight;

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
    const totalPxLength = Math.sqrt(Math.pow(drawnWedgeWidth, 2) + Math.pow(drawnWedgeHeight, 2));
    const pixelsPerMeter = totalPxLength / maxTrackLength;

    // Angle of incline along which block slides
    const slopeAngle = Math.atan2(drawnWedgeHeight, drawnWedgeWidth);

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
    const blockWidthM = 3.0;
    const blockHeightM = 2.2;
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
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.paramsTitle}</span>
            {recorder.isAutoRunning && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                🔒 Auto-Running
              </span>
            )}
          </h3>

          {/* Incline Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.inclineAngle}</span>
              <span className="text-blue-600 font-mono">{params.angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="0.5"
              value={params.angle}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Block Mass */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.mass}</span>
              <span className="text-blue-600 font-mono">{params.mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={params.mass}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, mass: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Static Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.staticFriction}</span>
              <span className="text-blue-600 font-mono">{params.muStatic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.02"
              value={params.muStatic}
              disabled={recorder.isAutoRunning}
              onChange={(e) => handleStaticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Kinetic Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.kineticFriction}</span>
              <span className="text-blue-600 font-mono">{params.muKinetic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.02"
              value={params.muKinetic}
              disabled={recorder.isAutoRunning}
              onChange={(e) => handleKineticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Lab Notebook */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 flex-1 flex flex-col">
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
                className="w-full flex-1 min-h-[120px] border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans"
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

        {/* Scientific Graph Laboratory */}
        <div className="shrink-0 min-h-[300px]">
          <ScientificGraphLab
            graphs={inclinedPlaneGraphs}
            trials={recorder.recordedRows}
            realtimePoints={history.map(h => ({ t: h.t, x: h.pos, y: h.vel, position: h.pos, velocity: h.vel, acceleration: h.acc }))}
            simulationParams={params}
            onRecordTrial={recorder.recordTrial}
            onClearTrials={recorder.clearTrials}
            columns={recorder.columns}
            height={260}
          />
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

    </div>
  );
}
