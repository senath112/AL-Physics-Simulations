import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import { PlotlyGraph } from '../../PlotlyGraph';
import { EducationalPanel } from '../../EducationalPanel';
import {
  calculateForcesAndKinematics,
  stepNewtonsSimulation,
  NewtonsLawsParameters,
} from '../../../physics/newtonsLawsPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft, ChevronRight, BookOpen, Maximize2, ClipboardList } from 'lucide-react';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function NewtonsLawsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      appliedForce: 'Applied Force (F)',
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
      appliedForce: 'යොදනු ලබන බලය (F)',
      mass: 'ස්කන්ධය (m)',
      staticFriction: 'ස්ථිතික ඝර්ෂණ සංගුණකය (μₛ)',
      kineticFriction: 'ගතික ඝර්ෂණ සංගුණකය (μₖ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'බල දෛශික ඊතල පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක චලිතය',
      acceleration: 'ත්වරණය (a)',
      fricForce: 'ඝර්ෂණ බලය (f)',
      normalForce: 'අභිලම්භ ප්‍රතික්‍රියාව (R)',
      staticThreshold: 'උපරිම සීමාකාරී ඝර්ෂණය',
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
      appliedForce: 'செலுத்தப்படும் விசை (F)',
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
  // 1. Parameters & State
  const [params, setParams] = useState<NewtonsLawsParameters>({
    force: 20,
    mass: 5,
    muStatic: 0.4,
    muKinetic: 0.25,
    g: 10,
  });

  const [dynamics, setDynamics] = useState<{ position: number; velocity: number }>({
    position: 10,
    velocity: 0,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [isLearnExpanded, setIsLearnExpanded] = useState(true);
  const [expandedGraph, setExpandedGraph] = useState<'fvst' | 'vvt' | 'avt' | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  const activeForce = isPushing ? params.force : 0;
  const activeParams = { ...params, force: activeForce };

  // Lab Notes State
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'newtons_sim',
    simulationTitle: "Newton's Second Law of Motion",
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'force', label: 'Applied Force F', unit: 'N' },
      { key: 'mass', label: 'Mass m', unit: 'kg' },
      { key: 'acceleration', label: 'Acceleration a', unit: 'm/s²' },
      { key: 'friction', label: 'Friction Force f', unit: 'N' },
      { key: 'normalForce', label: 'Normal Force R', unit: 'N' },
    ],
    getCurrentRow: () => ({
      force: params.force,
      mass: params.mass,
      acceleration: parseFloat(currentDynamics.acceleration.toFixed(2)),
      friction: parseFloat(currentDynamics.frictionForce.toFixed(2)),
      normalForce: parseFloat(currentDynamics.normalForce.toFixed(2)),
    }),
    getSeriesData: () => {
      const forces = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
      return forces.map((f, idx) => {
        const dyn = calculateForcesAndKinematics({ position: 0, velocity: 1 }, { ...params, force: f });
        return {
          trial: idx + 1,
          force: f,
          mass: params.mass,
          acceleration: parseFloat(dyn.acceleration.toFixed(2)),
          friction: parseFloat(dyn.frictionForce.toFixed(2)),
          normalForce: parseFloat(dyn.normalForce.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Force F = 5 N', params: { force: 5 }, durationMs: 750 },
        { label: 'Force F = 10 N', params: { force: 10 }, durationMs: 750 },
        { label: 'Force F = 20 N', params: { force: 20 }, durationMs: 750 },
        { label: 'Force F = 30 N', params: { force: 30 }, durationMs: 750 },
        { label: 'Force F = 40 N', params: { force: 40 }, durationMs: 750 },
        { label: 'Force F = 50 N', params: { force: 50 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        setParams((prev) => ({ ...prev, ...p }));
      },
    },
    defaultGraphConfig: {
      xAxis: 'acceleration',
      yAxis: 'force',
      title: "Newton's Law: F vs a (F = ma, Slope = Mass M)",
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Applied Force (F)': `${params.force} N`,
      'Block Mass (m)': `${params.mass} kg`,
      'Static Friction Coeff (μs)': `${params.muStatic}`,
      'Kinetic Friction Coeff (μk)': `${params.muKinetic}`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF("Newton's Laws of Motion Laboratory", reportParams, recorder.recordedRows, labNotes);
  };

  // Simulation time-series tracking for graphs
  const [history, setHistory] = useState<{ t: number; pos: number; vel: number; acc: number; force: number; friction: number }[]>([]);

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
  const currentDynamics = calculateForcesAndKinematics(dynamics, activeParams);

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
        const next = stepNewtonsSimulation(prev, activeParams, dt);
        if (next.position <= 0 || next.position >= 50) {
          if (prev.position > 0 && prev.position < 50) {
            hitEnd = true;
          }
        }
        
        // Record history
        setHistory((h) => [
          ...h,
          {
            t: newTime,
            pos: next.position,
            vel: next.velocity,
            acc: next.acceleration,
            force: activeForce,
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
    setDynamics({ position: 10, velocity: 0 });
    setHistory([]);
  };

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getPosFromEvent = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const margin = { left: 45, right: 45 };
    const trackWidth = rect.width - margin.left - margin.right;
    const metersToPixels = trackWidth / 50;
    const clickX = clientX - rect.left;
    const meterX = (clickX - margin.left) / metersToPixels;
    return Math.max(0, Math.min(50, meterX));
  };

  const handleDragStart = (clientX: number) => {
    if (isPlaying) return; // Only drag when paused
    const meterX = getPosFromEvent(clientX);
    if (meterX === null) return;

    // Check if clicked close to block (dynamics.position +/- 3.5 meters)
    if (Math.abs(meterX - dynamics.position) <= 4.0) {
      setIsDragging(true);
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isPlaying) return;
    const meterX = getPosFromEvent(clientX);
    if (meterX === null) return;
    setDynamics({ position: meterX, velocity: 0 });
    setHistory([]);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  // 3. Canvas Rendering
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

    // Margins and Scaling (Track is 0m to 50m)
    const margin = { left: 45, right: 45, bottom: 40, top: 40 };
    const trackWidth = width - margin.left - margin.right;
    const trackY = height - margin.bottom - 20;

    const metersToPixels = trackWidth / 50;

    const toScreenX = (xMeters: number) => margin.left + xMeters * metersToPixels;

    ctx.clearRect(0, 0, width, height);

    // Draw grid track lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px font-mono, Courier';
    ctx.textAlign = 'center';
    for (let x = 0; x <= 50; x += 5) {
      const screenX = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(screenX, trackY - 5);
      ctx.lineTo(screenX, trackY + 5);
      ctx.stroke();
      ctx.fillText(`${x}m`, screenX, trackY + 18);
    }

    // Draw Track Surface
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(margin.left, trackY);
    ctx.lineTo(margin.left + trackWidth, trackY);
    ctx.stroke();

    // Draw Box Block
    const blockMetersWidth = 5;
    const blockMetersHeight = 3.5;
    const blockPxWidth = blockMetersWidth * metersToPixels;
    const blockPxHeight = blockMetersHeight * metersToPixels;

    const blockX = toScreenX(dynamics.position) - blockPxWidth / 2;
    const blockY = trackY - blockPxHeight;

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, blockPxWidth, blockPxHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Label Mass inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.mass} kg`, blockX + blockPxWidth / 2, blockY + blockPxHeight / 2 + 4);

    // Draw Force Vector Arrows (Centered on the block)
    if (showVectors) {
      const centerX = blockX + blockPxWidth / 2;
      const centerY = blockY + blockPxHeight / 2;

      // Scaling: 1 Newton = 1.2 pixels
      const forceScale = 1.5;

      // 1. Applied Force (Green Arrow)
      if (Math.abs(activeForce) > 0.1) {
        const forceEndX = centerX + activeForce * forceScale;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(forceEndX, centerY);
        ctx.stroke();

        // Arrowhead
        const dir = Math.sign(activeForce);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(forceEndX, centerY);
        ctx.lineTo(forceEndX - dir * 8, centerY - 5);
        ctx.lineTo(forceEndX - dir * 8, centerY + 5);
        ctx.fill();
      }


      // 2. Friction Force (Red Arrow)
      if (Math.abs(currentDynamics.frictionForce) > 0.1) {
        const frictionEndX = centerX + currentDynamics.frictionForce * forceScale;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(frictionEndX, centerY);
        ctx.stroke();

        // Arrowhead
        const dir = Math.sign(currentDynamics.frictionForce);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(frictionEndX, centerY);
        ctx.lineTo(frictionEndX - dir * 6, centerY - 4);
        ctx.lineTo(frictionEndX - dir * 6, centerY + 4);
        ctx.fill();
      }

      // 3. Normal Force (Blue Arrow pointing UP)
      const normalEndY = centerY - currentDynamics.normalForce * forceScale;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, normalEndY);
      ctx.stroke();
      
      // Arrowhead
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(centerX, normalEndY);
      ctx.lineTo(centerX - 4, normalEndY + 6);
      ctx.lineTo(centerX + 4, normalEndY + 6);
      ctx.fill();

      // 4. Gravitational Force (Orange arrow pointing DOWN)
      const gravityEndY = centerY + currentDynamics.normalForce * forceScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, gravityEndY);
      ctx.stroke();
      
      // Arrowhead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(centerX, gravityEndY);
      ctx.lineTo(centerX - 4, gravityEndY - 6);
      ctx.lineTo(centerX + 4, gravityEndY - 6);
      ctx.fill();
    }
  }, [dynamics, params, showVectors, currentDynamics]);



  // 5. Graphs Data Preparation
  const timeAxis = history.map(h => h.t);
  const forceVals = history.map(h => h.force);
  const frictionVals = history.map(h => h.friction);
  const velVals = history.map(h => h.vel);
  const accVals = history.map(h => h.acc);

  const forcePlotData = [
    { x: timeAxis, y: forceVals, mode: 'lines' as const, name: 'Applied F (N)', line: { color: '#10b981', width: 2 } },
    { x: timeAxis, y: frictionVals, mode: 'lines' as const, name: 'Friction f (N)', line: { color: '#ef4444', width: 2 } },
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

  // 6. Educational Data
  const conceptText = (
    <div className="space-y-3">
      <p>
        <strong>Newton’s Second Law of Motion</strong> states that the acceleration (a) of an object is directly proportional to the net force (F_net) acting on it, and inversely proportional to its mass (m).
      </p>
      <p className="font-semibold text-slate-800">
        Friction Forces:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Static Friction (fs):</strong> Opposes the start of relative motion. Its value balances the applied force up to a maximum limit: fs,max = μs * Fn.
        </li>
        <li>
          <strong>Kinetic Friction (fk):</strong> Opposes active relative motion. It has a constant value once the object is sliding: fk = μk * Fn.
        </li>
      </ul>
      <p>
        Notice that static friction is always greater than or equal to kinetic friction (μs ≥ μk), causing the block to accelerate suddenly once it breaks free.
      </p>
    </div>
  );

  const equations = [
    { latex: 'F_{\\text{net}} = m \\cdot a', description: "Newton's Second Law" },
    { latex: 'F_N = m \\cdot g', description: 'Normal Force on a flat surface' },
    { latex: 'f_{s,\\text{max}} = \\mu_s F_N', description: 'Maximum static friction threshold' },
    { latex: 'f_k = \\mu_k F_N', description: 'Sliding kinetic friction force' },
  ];

  const variables = [
    { symbol: 'F', name: 'Applied horizontal force', unit: 'N' },
    { symbol: 'm', name: 'Mass of the sliding block', unit: 'kg' },
    { symbol: 'a', name: 'Horizontal acceleration', unit: 'm/s²' },
    { symbol: '\\mu_s, \\mu_k', name: 'Friction coefficients', unit: 'dimensionless' },
    { symbol: 'F_N', name: 'Normal force acting upwards', unit: 'N' },
  ];

  const observations = [
    'Set Applied Force to 10N and Mass to 5kg. If static friction limit is above 10N, the block remains locked (a = 0m/s²).',
    'Increase the force gradually. Watch the block break free exactly when the applied force exceeds the static friction threshold.',
    'Notice that once the block moves, the friction drops to the kinetic value, which increases acceleration instantly.',
    'Apply a force in the opposite direction of motion. Note how the block decelerates, comes to a stop, and stays locked if force is small.',
  ];

  const challenges = [
    {
      question: 'A 5 kg block rests on a horizontal table. The static friction coefficient is 0.4 and gravity is 10 m/s². What is the minimum horizontal force required to make the block start sliding?',
      options: ['10 N', '20 N', '40 N', '50 N'],
      correctAnswer: '20 N',
      solution: `1. Normal Force: Fn = m * g = 5 * 10 = 50 N
2. Maximum Static Friction Limit: fs_max = μs * Fn = 0.4 * 50 = 20 N
3. Minimum force to initiate slide must exceed 20 N.`,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-10.5rem)] lg:overflow-hidden">
      
      {/* Parameters Sidebar & Lab Notebook (3 cols) */}
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

          {/* Applied Force */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.appliedForce}</span>
              <span className="text-blue-600 font-mono">{params.force.toFixed(1)} N</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={params.force}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, force: parseFloat(e.target.value) })}
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

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="newtons-vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="newtons-vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>


        {/* Lab Notebook Container (Rich Log notes feature) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 flex-1 min-h-[220px] flex flex-col">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            {t.labNotes}
          </h3>

          <textarea
            value={labNotes}
            onChange={(e) => setLabNotes(e.target.value)}
            placeholder="Type your laboratory observations, findings, and notes here..."
            className="w-full flex-1 border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans"
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

      {/* Interactive Simulation Viewport + Graphs (6/8 cols) */}
      <div className={`flex flex-col gap-3 h-full min-h-0 ${isLearnExpanded ? 'lg:col-span-6' : 'lg:col-span-8'}`}>
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Newton's Second Law Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                Force (Applied)
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
              onMouseDown={(e) => handleDragStart(e.clientX)}
              onMouseMove={(e) => handleDragMove(e.clientX)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientX)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Live indicator overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 px-3 py-2 rounded text-[11px] font-mono space-y-1 border border-slate-800 pointer-events-none">
              <div>POSITION: <span className="text-white font-bold">{dynamics.position.toFixed(2)} m</span></div>
              <div>VELOCITY: <span className="text-blue-400 font-bold">{dynamics.velocity.toFixed(2)} m/s</span></div>
              <div>ACCEL: <span className="text-amber-400 font-bold">{currentDynamics.acceleration.toFixed(3)} m/s²</span></div>
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
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors mr-2"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onMouseDown={() => setIsPushing(true)}
                onMouseUp={() => setIsPushing(false)}
                onMouseLeave={() => setIsPushing(false)}
                onTouchStart={() => setIsPushing(true)}
                onTouchEnd={() => setIsPushing(false)}
                className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-semibold rounded transition-all select-none shadow-sm cursor-pointer ${
                  isPushing 
                    ? 'bg-emerald-600 border-emerald-600 text-white translate-y-0.5' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Hold down to push the block with the set Applied Force (F). Release to remove force."
              >
                Push Block
              </button>
            </div>


            {/* Simulation speed selection */}
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

        {/* Scientific Graphs Row */}
        <div className="h-[210px] shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0">
          
          {/* Forces plot */}
          <div 
            onClick={() => setExpandedGraph('fvst')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Forces graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={forcePlotData}
                layout={graphLayoutTemplate('Force vs Time', 'Time t (s)', 'Force (N)')}
              />
            </div>
          </div>

          {/* Velocity plot */}
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

          {/* Acceleration plot */}
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
              {expandedGraph === 'fvst' && (
                <PlotlyGraph
                  data={forcePlotData}
                  layout={{
                    ...graphLayoutTemplate('Force vs Time [EXPANDED]', 'Time t (s)', 'Force (N)'),
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
