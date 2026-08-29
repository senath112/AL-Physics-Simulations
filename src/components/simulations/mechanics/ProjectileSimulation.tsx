import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import { PlotlyGraph } from '../../PlotlyGraph';
import { EducationalPanel } from '../../EducationalPanel';
import {
  calculateFlightTime,
  calculateMaxHeight,
  calculateRange,
  getProjectileStateAtTime,
  runValidationTests,
  ProjectileParameters,
} from '../../../physics/projectilePhysics';
import { Play, Pause, RotateCcw, SkipForward, Info, Maximize2, ChevronLeft, ChevronRight, BookOpen, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function ProjectileSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      velocity: 'Velocity (v₀)',
      angle: 'Angle (θ)',
      height: 'Height (h₀)',
      gravity: 'Gravity (g)',
      vectors: 'Show Vector Arrows (v, vx, vy)',
      theoryOutput: 'Theoretical Output',
      flightTime: 'Flight Time',
      maxHeight: 'Max Height',
      range: 'Horizontal Range',
      play: 'Play',
      pause: 'Pause',
      step: 'Step Forward',
      reset: 'Reset',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      paramsTitle: 'පරාමිතීන්',
      velocity: 'ප්‍රවේගය (v₀)',
      angle: 'කෝණය (θ)',
      height: 'උස (h₀)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'වේග දෛශික පෙන්වන්න (v, vx, vy)',
      theoryOutput: 'න්‍යායාත්මක අගයන්',
      flightTime: 'පියාසර කාලය',
      maxHeight: 'උපරිම උස',
      range: 'තිරස් පරාසය',
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
      velocity: 'வேகம் (v₀)',
      angle: 'கோணம் (θ)',
      height: 'உயரம் (h₀)',
      gravity: 'ஈர்ப்பு (g)',
      vectors: 'திசையன் அம்புகளைக் காட்டு (v, vx, vy)',
      theoryOutput: 'கோட்பாட்டு கணிப்புகள்',
      flightTime: 'பறக்கும் நேரம்',
      maxHeight: 'அதிகபட்ச உயரம்',
      range: 'கிடை வீச்சு',
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

  // 1. Simulation Parameters
  const [params, setParams] = useState<ProjectileParameters>({
    v0: 20,
    angle: 45,
    h0: 5,
    g: 10,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [validationMsg, setValidationMsg] = useState('');
  const [expandedGraph, setExpandedGraph] = useState<'trajectory' | 'displacement' | 'velocity' | null>(null);
  const [isLearnExpanded, setIsLearnExpanded] = useState(true);
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'projectile_sim',
    simulationTitle: 'Projectile Motion',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'angle', label: 'Launch Angle θ', unit: '°' },
      { key: 'velocity', label: 'Initial Velocity v₀', unit: 'm/s' },
      { key: 'range', label: 'Horizontal Range R', unit: 'm' },
      { key: 'maxHeight', label: 'Max Height H', unit: 'm' },
      { key: 'flightTime', label: 'Flight Time T', unit: 's' },
      { key: 'gravity', label: 'Gravity g', unit: 'm/s²' },
    ],
    getCurrentRow: () => ({
      angle: params.angle,
      velocity: params.v0,
      range: parseFloat(range.toFixed(2)),
      maxHeight: parseFloat(maxH.toFixed(2)),
      flightTime: parseFloat(tFlight.toFixed(2)),
      gravity: params.g,
    }),
    getSeriesData: () => {
      const angles = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
      return angles.map((ang, i) => {
        const p = { ...params, angle: ang };
        return {
          trial: i + 1,
          angle: ang,
          velocity: p.v0,
          range: parseFloat(calculateRange(p).toFixed(2)),
          maxHeight: parseFloat(calculateMaxHeight(p).toFixed(2)),
          flightTime: parseFloat(calculateFlightTime(p).toFixed(2)),
          gravity: p.g,
        };
      });
    },
    defaultGraphConfig: {
      xAxis: 'angle',
      yAxis: 'range',
      title: 'Range vs Launch Angle (R vs θ)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Initial Velocity (v0)': `${params.v0} m/s`,
      'Launch Angle (theta)': `${params.angle}°`,
      'Initial Height (h0)': `${params.h0} m`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF("Projectile Motion Laboratory", reportParams, recorder.recordedRows, labNotes);
  };

  // Run validation tests on mount
  useEffect(() => {
    const testResult = runValidationTests();
    if (testResult.passed) {
      setValidationMsg(testResult.message);
    } else {
      console.error(testResult.message);
    }
  }, []);

  // Compute key derived values
  const tFlight = calculateFlightTime(params);
  const maxH = calculateMaxHeight(params);
  const range = calculateRange(params);

  // 2. Simulation Engine Hook
  const {
    time,
    isPlaying,
    togglePlay,
    reset,
    stepForward,
    timeScale,
    setTimeScale,
  } = useSimulation({
    initialTime: 0,
    maxTime: tFlight,
  });

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getH0FromEvent = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const margin = { left: 45, right: 45, bottom: 40, top: 40 };
    const plotHeight = rect.height - margin.top - margin.bottom;
    const yMax = Math.max(maxH * 1.25, params.h0 * 1.5, 10);
    const metersToPixelsY = plotHeight / yMax;

    const clickY = clientY - rect.top;
    const yMeters = yMax - (clickY - margin.top) / metersToPixelsY;
    return Math.max(0, Math.min(25, yMeters));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;

    // Stand is horizontally near x = 0 (left-most grid region)
    if (clickX >= 25 && clickX <= 75) {
      const yMeters = getH0FromEvent(clientY);
      if (yMeters === null) return;
      if (yMeters <= params.h0 + 2.5) {
        setIsDragging(true);
      }
    }
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging || isPlaying) return;
    const yMeters = getH0FromEvent(clientY);
    if (yMeters === null) return;
    setParams((prev) => ({ ...prev, h0: Math.round(yMeters * 10) / 10 }));
    reset(); // reset time to 0 to trace new projectile start height
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  const currentState = getProjectileStateAtTime(time, params);

  // 3. Canvas Rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and match device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Drawing margins
    const margin = { top: 40, right: 40, bottom: 50, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, width, height);

    // Auto-scaling based on max range and height
    const xMax = Math.max(range * 1.15, 20); // physical meters
    const yMax = Math.max(maxH * 1.25, params.h0 * 1.5, 10); // physical meters

    const metersToPixelsX = plotWidth / xMax;
    const metersToPixelsY = plotHeight / yMax;

    // Coordinate conversion functions
    const toScreenX = (xMeters: number) => margin.left + xMeters * metersToPixelsX;
    const toScreenY = (yMeters: number) => margin.top + plotHeight - yMeters * metersToPixelsY;

    // Draw Grid Lines (SI Units: every 5 or 10m depending on size)
    const gridSpacing = xMax > 100 ? 20 : (xMax > 50 ? 10 : 5);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px font-mono, Courier';
    ctx.textAlign = 'center';

    // X Grid
    for (let x = 0; x <= xMax; x += gridSpacing) {
      const screenX = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(screenX, margin.top);
      ctx.lineTo(screenX, margin.top + plotHeight);
      ctx.stroke();
      ctx.fillText(`${x}m`, screenX, margin.top + plotHeight + 15);
    }

    // Y Grid
    ctx.textAlign = 'right';
    for (let y = 0; y <= yMax; y += gridSpacing) {
      const screenY = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(margin.left, screenY);
      ctx.lineTo(margin.left + plotWidth, screenY);
      ctx.stroke();
      ctx.fillText(`${y}m`, margin.left - 8, screenY + 3);
    }

    // Draw Ground
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();

    // Draw Launch Stand (initial height)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(0), toScreenY(params.h0));
    ctx.stroke();

    // Draw entire trajectory curve (faded background line)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= tFlight; t += tFlight / 100) {
      const state = getProjectileStateAtTime(t, params);
      if (t === 0) {
        ctx.moveTo(toScreenX(state.x), toScreenY(state.y));
      } else {
        ctx.lineTo(toScreenX(state.x), toScreenY(state.y));
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw past path up to current time
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t <= time; t += Math.max(0.01, time / 100)) {
      const state = getProjectileStateAtTime(t, params);
      if (t === 0) {
        ctx.moveTo(toScreenX(state.x), toScreenY(state.y));
      } else {
        ctx.lineTo(toScreenX(state.x), toScreenY(state.y));
      }
    }
    // ensure it reaches current exact x, y
    ctx.lineTo(toScreenX(currentState.x), toScreenY(currentState.y));
    ctx.stroke();

    // Draw Projectile Ball
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toScreenX(currentState.x), toScreenY(currentState.y), 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw Vector Arrows (Velocity decomposition)
    if (showVectors && time < tFlight) {
      const startX = toScreenX(currentState.x);
      const startY = toScreenY(currentState.y);

      // Scale vectors so they look reasonable on screen
      const vectorScale = 1.5;

      // Net Velocity Vector (Blue)
      const endX = startX + currentState.vx * vectorScale;
      const endY = startY - currentState.vy * vectorScale; // Invert Y for canvas

      // Draw Net Velocity Vector
      ctx.strokeStyle = '#10b981'; // Emerald/Green for velocity
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Net velocity arrowhead
      const angleRad = Math.atan2(endY - startY, endX - startX);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 8 * Math.cos(angleRad - Math.PI / 6), endY - 8 * Math.sin(angleRad - Math.PI / 6));
      ctx.lineTo(endX - 8 * Math.cos(angleRad + Math.PI / 6), endY - 8 * Math.sin(angleRad + Math.PI / 6));
      ctx.fill();

      // vx component vector (Red)
      const vxEndX = startX + currentState.vx * vectorScale;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(vxEndX, startY);
      ctx.stroke();

      // vy component vector (Orange/Amber)
      const vyEndY = startY - currentState.vy * vectorScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, vyEndY);
      ctx.stroke();
    }
  }, [time, params, range, maxH, currentState, tFlight, showVectors]);

  // 4. Plotly Graphs Data Preparation
  // Generate data points for trajectory, x-t, y-t, v-t
  const steps = 100;
  const tVals: number[] = [];
  const xVals: number[] = [];
  const yVals: number[] = [];
  const vxVals: number[] = [];
  const vyVals: number[] = [];
  const vVals: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (tFlight * i) / steps;
    const st = getProjectileStateAtTime(t, params);
    tVals.push(t);
    xVals.push(st.x);
    yVals.push(st.y);
    vxVals.push(st.vx);
    vyVals.push(st.vy);
    vVals.push(st.speed);
  }

  // Find index corresponding to current time to draw live cursor
  const currentIndex = Math.min(
    Math.floor((time / tFlight) * steps),
    steps
  );

  const currentX = currentState.x;
  const currentY = currentState.y;
  const currentT = time;
  const currentSpeed = currentState.speed;

  // Trajectory graph (y vs x)
  const trajectoryPlotData = [
    {
      x: xVals,
      y: yVals,
      mode: 'lines' as const,
      name: 'Full Trajectory',
      line: { color: '#94a3b8', width: 2 },
    },
    {
      x: xVals.slice(0, currentIndex + 1),
      y: yVals.slice(0, currentIndex + 1),
      mode: 'lines' as const,
      name: 'Elapsed Path',
      line: { color: '#2563eb', width: 3.5 },
    },
    {
      x: [currentX],
      y: [currentY],
      mode: 'markers' as const,
      name: 'Current Position',
      marker: { color: '#1d4ed8', size: 10, symbol: 'circle' },
    },
  ];

  // displacement vs time (x-t and y-t)
  const displacementPlotData = [
    {
      x: tVals,
      y: xVals,
      mode: 'lines' as const,
      name: 'Horizontal (x)',
      line: { color: '#ef4444', width: 2 },
    },
    {
      x: tVals,
      y: yVals,
      mode: 'lines' as const,
      name: 'Vertical (y)',
      line: { color: '#3b82f6', width: 2 },
    },
    {
      x: [currentT, currentT],
      y: [currentX, currentY],
      mode: 'markers' as const,
      name: 'Now',
      marker: { color: '#0f172a', size: 8 },
    },
  ];

  // velocity vs time
  const velocityPlotData = [
    {
      x: tVals,
      y: vxVals,
      mode: 'lines' as const,
      name: 'v_x',
      line: { color: '#ef4444', width: 2 },
    },
    {
      x: tVals,
      y: vyVals,
      mode: 'lines' as const,
      name: 'v_y',
      line: { color: '#f59e0b', width: 2 },
    },
    {
      x: tVals,
      y: vVals,
      mode: 'lines' as const,
      name: 'Net Speed',
      line: { color: '#10b981', width: 2 },
    },
    {
      x: [currentT, currentT, currentT],
      y: [currentState.vx, currentState.vy, currentSpeed],
      mode: 'markers' as const,
      name: 'Now',
      marker: { color: '#0f172a', size: 8 },
    },
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

  // 5. Educational Data
  const conceptText = (
    <div className="space-y-3">
      <p>
        <strong>Projectile Motion</strong> is a form of motion experienced by an object or particle that is projected near the Earth's surface and moves along a curved path under the action of gravity only (neglecting air resistance).
      </p>
      <p>
        The key principle of projectile motion is that <strong>horizontal and vertical motions are independent</strong>:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Horizontal Motion:</strong> Since there is no force acting horizontally (neglecting air resistance), the horizontal acceleration is zero (\(a_x = 0\)). Thus, horizontal velocity (\(v_x\)) remains constant throughout the flight.
        </li>
        <li>
          <strong>Vertical Motion:</strong> Under the influence of constant downward gravity (\(g\)), the object accelerates downward at a constant rate (\(a_y = -g\)).
        </li>
      </ul>
      <p>
        This independence produces a symmetrical <strong>parabolic trajectory</strong>.
      </p>
    </div>
  );

  const equations = [
    {
      latex: 'x(t) = v_0 \\cos(\\theta) \\cdot t',
      description: 'Horizontal position at time t',
    },
    {
      latex: 'y(t) = h_0 + v_0 \\sin(\\theta) \\cdot t - \\frac{1}{2}gt^2',
      description: 'Vertical position at time t',
    },
    {
      latex: 'v_x = v_0 \\cos(\\theta)',
      description: 'Constant horizontal velocity component',
    },
    {
      latex: 'v_y(t) = v_0 \\sin(\\theta) - gt',
      description: 'Time-varying vertical velocity component',
    },
    {
      latex: 'T_{\\text{flight}} = \\frac{v_0 \\sin(\\theta) + \\sqrt{(v_0 \\sin(\\theta))^2 + 2gh_0}}{g}',
      description: 'Total flight duration until hitting the ground (y = 0)',
    },
  ];

  const variables = [
    { symbol: 'v_0', name: 'Initial launch speed', unit: 'm/s' },
    { symbol: '\\theta', name: 'Launch angle', unit: 'degrees' },
    { symbol: 'h_0', name: 'Initial launch height', unit: 'm' },
    { symbol: 'g', name: 'Acceleration due to gravity', unit: 'm/s²' },
    { symbol: 't', name: 'Elapsed time', unit: 's' },
    { symbol: 'x', name: 'Horizontal displacement', unit: 'm' },
    { symbol: 'y', name: 'Vertical height', unit: 'm' },
    { symbol: 'v_x, v_y', name: 'Velocity components', unit: 'm/s' },
  ];

  const observations = [
    'Change the launch angle to 45° (from ground h0 = 0m). Notice that this angle maximizes the horizontal range.',
    'Increase the initial height (h0). Observe that the maximum range angle shifts below 45°.',
    'Notice that horizontal velocity component (vx, red arrow) remains perfectly constant, while vertical velocity (vy, orange arrow) decreases linearly, becomes zero at the peak, and increases negatively downward.',
    'Set the launch angle to 90°. Watch the projectile travel straight up and down, returning along the same axis.',
  ];

  const challenges = [
    {
      question: 'A projectile is launched from ground level (h0 = 0 m) with an initial velocity of 20 m/s at an angle of 30° to the horizontal. Assuming g = 10 m/s², calculate the horizontal range of the projectile.',
      options: ['17.3 m', '20.0 m', '34.6 m', '40.0 m'],
      correctAnswer: '34.6 m',
      solution: `1. Identify parameters:
   v0 = 20 m/s, θ = 30°, h0 = 0 m, g = 10 m/s²
   
2. Use horizontal range equation for ground launch:
   R = (v0² * sin(2θ)) / g
   
3. Substitute the values:
   R = (20² * sin(2 * 30°)) / 10
   R = (400 * sin(60°)) / 10
   R = 40 * (√3 / 2)
   R = 20 * √3 ≈ 20 * 1.732 = 34.64 m
   
Hence, the range is approximately 34.6 m.`,
    },
    {
      question: 'For the same launch conditions (v0 = 20 m/s, θ = 30°, h0 = 0 m, g = 10 m/s²), find the maximum height reached above the ground.',
      options: ['5.0 m', '10.0 m', '15.0 m', '20.0 m'],
      correctAnswer: '5.0 m',
      solution: `1. Calculate the initial vertical velocity:
   vy0 = v0 * sin(θ) = 20 * sin(30°) = 20 * 0.5 = 10 m/s
   
2. Use the peak height equation:
   H = vy0² / (2g)
   
3. Substitute values:
   H = 10² / (2 * 10) = 100 / 20 = 5.0 m
   
Hence, the maximum height reached is 5.0 m.`,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-10.5rem)] lg:overflow-hidden">
      
      {/* Parameters & Live Measurements Sidebar (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar h-full pr-1">
        
        {/* Controls Container */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4 shrink-0">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          {/* Initial Velocity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.velocity}</span>
              <span className="text-blue-600 font-mono">{params.v0.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={params.v0}
              onChange={(e) => setParams({ ...params, v0: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Launch Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.angle}</span>
              <span className="text-blue-600 font-mono">{params.angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={params.angle}
              onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Initial Height */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.height}</span>
              <span className="text-blue-600 font-mono">{params.h0.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={params.h0}
              onChange={(e) => setParams({ ...params, h0: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Gravity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-blue-600 font-mono">{params.g.toFixed(2)} m/s²</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="25.0"
              step="0.1"
              value={params.g}
              onChange={(e) => setParams({ ...params, g: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Global analytical values / calculations */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 shrink-0">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.flightTime}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{tFlight.toFixed(3)} s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.maxHeight}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{maxH.toFixed(2)} m</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 col-span-2">
              <span className="text-slate-500 block">{t.range}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{range.toFixed(2)} m</span>
            </div>
          </div>
        </div>

        {/* Live measurements at time t */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm text-slate-100 space-y-3 shrink-0">
          <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            Live Lab Indicators
          </h3>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">TIME (t)</span>
              <span className="font-bold text-blue-400">{time.toFixed(3)} s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SPEED (v)</span>
              <span className="font-bold text-emerald-400">{currentSpeed.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DISPLACEMENT (x)</span>
              <span className="font-bold text-slate-200">{currentState.x.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">HEIGHT (y)</span>
              <span className="font-bold text-slate-200">{currentState.y.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">vx (const)</span>
              <span className="font-bold text-red-400">{currentState.vx.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">vy (dynamic)</span>
              <span className="font-bold text-amber-400">{currentState.vy.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>

        {/* Lab Notebook Container */}
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
            onSendToLaboratory={recorder.sendToLaboratory}
            onDownloadPDF={handleDownloadPDF}
            onClearTrials={recorder.clearTrials}
            isSaving={recorder.isSaving}
            statusMessage={recorder.statusMessage}
            quota={recorder.quota}
          />
        </div>

        {validationMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded p-2.5 flex items-start gap-1.5 leading-normal shrink-0">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{validationMsg}</span>
          </div>
        )}
      </div>


      {/* Interactive Simulation Viewport + Graphs (Dynamic columns based on Learn panel state) */}
      <div className={`flex flex-col gap-3 h-full min-h-0 ${isLearnExpanded ? 'lg:col-span-6' : 'lg:col-span-8'}`}>
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header indicator */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulation Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                v
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
                v<sub>x</sub>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                v<sub>y</sub>
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 relative bg-slate-50/20 canvas-grid-bg min-h-0">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Play/Pause/Time Control Bar */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-lg shrink-0">
            {/* Play/Pause controls */}
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
                disabled={isPlaying || time >= tFlight}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Step Forward (dt = 20ms)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={reset}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Time Slider */}
            <div className="flex-1 min-w-[150px] flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">0s</span>
              <input
                type="range"
                min="0"
                max={tFlight}
                step={tFlight / 200 || 0.01}
                value={time}
                onChange={(e) => {
                  if (isPlaying) togglePlay();
                  const t = parseFloat(e.target.value);
                  // Manually step the time
                  stepForward(t - time);
                }}
                className="flex-1 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-500 font-mono">{tFlight.toFixed(2)}s</span>
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
          {/* Trajectory Plot */}
          <div 
            onClick={() => setExpandedGraph('trajectory')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Trajectory graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={trajectoryPlotData}
                layout={graphLayoutTemplate('Trajectory (y vs x)', 'Distance x (m)', 'Height y (m)')}
              />
            </div>
          </div>

          {/* Displacement-Time Plot */}
          <div 
            onClick={() => setExpandedGraph('displacement')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Displacement-Time graph"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-50 border border-slate-200 rounded p-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="w-full h-full pointer-events-none">
              <PlotlyGraph
                data={displacementPlotData}
                layout={graphLayoutTemplate('Displacement vs Time', 'Time t (s)', 'Displacement (m)')}
              />
            </div>
          </div>

          {/* Velocity-Time Plot */}
          <div 
            onClick={() => setExpandedGraph('velocity')}
            className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm h-full min-h-0 hover:border-blue-400 hover:shadow transition-all cursor-pointer relative group"
            title="Click to expand Velocity-Time graph"
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
        </div>

      </div>

      {/* Learn Panel (Right) */}
      <div className={`${isLearnExpanded ? 'lg:col-span-3' : 'lg:col-span-1'} h-full min-h-0 transition-all duration-300 flex flex-col`}>
        {isLearnExpanded ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {/* Learn Title Bar with Collapse Button */}
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
              {expandedGraph === 'trajectory' && (
                <PlotlyGraph
                  data={trajectoryPlotData}
                  layout={{
                    ...graphLayoutTemplate('Trajectory (y vs x) [EXPANDED]', 'Distance x (m)', 'Height y (m)'),
                    margin: { l: 60, r: 20, t: 50, b: 50 },
                  }}
                  style={{ height: '100%' }}
                />
              )}
              {expandedGraph === 'displacement' && (
                <PlotlyGraph
                  data={displacementPlotData}
                  layout={{
                    ...graphLayoutTemplate('Displacement vs Time [EXPANDED]', 'Time t (s)', 'Displacement (m)'),
                    margin: { l: 60, r: 20, t: 50, b: 50 },
                  }}
                  style={{ height: '100%' }}
                />
              )}
              {expandedGraph === 'velocity' && (
                <PlotlyGraph
                  data={velocityPlotData}
                  layout={{
                    ...graphLayoutTemplate('Velocity vs Time [EXPANDED]', 'Time t (s)', 'Velocity (m/s)'),
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
