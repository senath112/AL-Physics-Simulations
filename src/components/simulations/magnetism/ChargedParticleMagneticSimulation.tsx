import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { chargedParticleGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function ChargedParticleMagneticSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Charged Particle in Magnetic Field',
      paramsTitle: 'Parameters',
      mode: 'Simulation Mode',
      modeOrbit: 'Cyclotron Orbit',
      modeProjected: 'Projected Atom Beam',
      charge: 'Charge (q)',
      mass: 'Mass (m)',
      velocity: 'Velocity (v)',
      bField: 'Magnetic Field (B)',
      bDirection: 'Field Direction',
      intoScreen: 'Into Screen (X)',
      outOfScreen: 'Out of Screen (•)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Force & Velocity Vectors',
      theoryOutput: 'Theoretical Analysis',
      radius: 'Orbit Radius (r)',
      freq: 'Cyclotron Frequency (f)',
      period: 'Orbit Period (T)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      launchAngle: 'Launch Angle (θ)'
    },
    si: {
      title: 'චුම්බක ක්ෂේත්‍රයක ආරෝපිත අංශුවක්',
      paramsTitle: 'පරාමිතීන්',
      mode: 'අනුකරණ ක්‍රමය',
      modeOrbit: 'සයික්ලොට්‍රෝන කක්ෂය',
      modeProjected: 'ප්‍රක්ෂේපිත පරමාණු කදම්බය',
      charge: 'ආරෝපණය (q)',
      mass: 'ස්කන්ධය (m)',
      velocity: 'ප්‍රවේගය (v)',
      bField: 'චුම්බක ක්ෂේත්‍රය (B)',
      bDirection: 'ක්ෂේත්‍ර දිශාව',
      intoScreen: 'තලයට ලම්බකව ඇතුළට (X)',
      outOfScreen: 'තලයට ලම්බකව පිටතට (•)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'බල සහ ප්‍රවේග දෛශික පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      radius: 'කක්ෂීය අරය (r)',
      freq: 'සයික්ලොට්‍රෝන සංඛ්‍යාතය (f)',
      period: 'කක්ෂීය ආවර්ත කාලය (T)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      launchAngle: 'ප්‍රක්ෂේපණ කෝණය (θ)'
    },
    ta: {
      title: 'காந்தப்புலத்தில் மின்னூட்டம் பெற்ற துகள்',
      paramsTitle: 'அளவுருக்கள்',
      mode: 'சிமுலேஷன் முறை',
      modeOrbit: 'சைக்ளோட்ரான் சுற்றுப்பாதை',
      modeProjected: 'ஊடுருவும் அணுக்கற்றை',
      charge: 'மின்னூட்டம் (q)',
      mass: 'திணிவு (m)',
      velocity: 'வேகம் (v)',
      bField: 'காந்தப்புலம் (B)',
      bDirection: 'காந்தப்புலத் திசை',
      intoScreen: 'உள்நோக்கி (X)',
      outOfScreen: 'வெளிநோக்கி (•)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'விசை & திசைவேக திசையன்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      radius: 'சுற்றுப்பாதை ஆரை (r)',
      freq: 'சைக்ளோட்ரான் அதிர்வெண் (f)',
      period: 'சுற்றுப்பாதை அலைவுகாலம் (T)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      launchAngle: 'ஏவுதல் கோணம் (θ)'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [mode, setMode] = useState<'orbit' | 'projected'>('orbit');
  const [fullField, setFullField] = useState(true);
  const [q, setQ] = useState(1.0); // charge multiplier (-2 to 2)
  const [m, setM] = useState(1.0); // mass multiplier (0.5 to 3)
  const [v, setV] = useState(4.0); // velocity (1 to 8)
  const [B, setB] = useState(1.5); // magnetic field strength (0.5 to 3)
  const [bDir, setBDir] = useState<'in' | 'out'>('in'); // direction of B
  const [showVectors, setShowVectors] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Animation values
  const [angle, setAngle] = useState(0);
  const [labNotes, setLabNotes] = useState('');

  // Projected Particle state variables
  const [launchAngle, setLaunchAngle] = useState(0); // launch angle in degrees (-45 to 45)
  const [projX, setProjX] = useState(-10);
  const [projY, setProjY] = useState(140);
  const [projVx, setProjVx] = useState(v * 25);
  const [projVy, setProjVy] = useState(0);

  // Physics calculations: r = (m * v) / (q * B)
  const absQ = Math.abs(q);
  const calculatedRadius = absQ > 0 && B > 0 ? (m * v) / (absQ * B) : 0;
  const frequency = absQ > 0 ? (absQ * B) / (2 * Math.PI * m) : 0;
  const period = frequency > 0 ? 1 / frequency : 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetProjected = () => {
    const angleRad = (launchAngle * Math.PI) / 180;
    const startX = fullField ? 60 : -10;
    setProjX(startX);
    setProjY(140);
    setProjVx(v * 25 * Math.cos(angleRad));
    setProjVy(v * 25 * Math.sin(angleRad));
  };

  // Loop update
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      if (mode === 'orbit') {
        const omega = m > 0 ? (q * B) / m : 0;
        const direction = bDir === 'in' ? 1 : -1;
        setAngle((prev) => (prev + omega * direction * dt) % (2 * Math.PI));
      } else {
        // Projected Mode Euler Integrator
        setProjX((prevX) => {
          setProjY((prevY) => {
            setProjVx((prevVx) => {
              setProjVy((prevVy) => {
                const inField = fullField || prevX >= 180;
                if (inField) {
                  const Bz = bDir === 'in' ? -B : B;
                  const scaleFactor = 35; // visual alignment multiplier
                  const ay = m > 0 ? -(q * Bz * prevVx) / m * scaleFactor : 0;

                  const newVy = prevVy + ay * dt;
                  return newVy;
                }
                const angleRad = (launchAngle * Math.PI) / 180;
                return v * 25 * Math.sin(angleRad);
              });

              const inField = fullField || prevX >= 180;
              if (inField) {
                const Bz = bDir === 'in' ? -B : B;
                const scaleFactor = 35;
                const ax = m > 0 ? (q * Bz * projVy) / m * scaleFactor : 0;
                return prevVx + ax * dt;
              }
              const angleRad = (launchAngle * Math.PI) / 180;
              return v * 25 * Math.cos(angleRad);
            });

            // update Y coordinate
            const newY = prevY + projVy * dt;
            return Math.max(10, Math.min(270, newY));
          });

          // update X coordinate
          const newX = prevX + projVx * dt;
          if (newX > 550 || newX < -20) {
            // Loop projectile back to start
            resetProjected();
            return fullField ? 60 : -10;
          }
          return newX;
        });
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, q, m, B, bDir, mode, projVx, projVy, v, launchAngle, fullField]);

  // Synchronize projectile parameters on launch speed sliders changes
  useEffect(() => {
    if (mode === 'projected') {
      resetProjected();
    }
  }, [v, mode, launchAngle, fullField]);

  // Render uniform field and orbiting particle
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

    const cX = width / 2;
    const cY = height / 2;
    const orbitRadiusPx = calculatedRadius * 35;

    // Boundary X for projected mode field coverage
    const boundaryX = 180;

    // 1. Draw Magnetic Field indicator background grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 20; x < width; x += gridSpacing) {
      // In projected mode, B-field only occupies X >= 180 if fullField is false
      if (mode === 'projected' && !fullField && x < boundaryX) continue;

      for (let y = 20; y < height; y += gridSpacing) {
        if (bDir === 'in') {
          // Draw X (Into screen)
          ctx.beginPath();
          ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3);
          ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3);
          ctx.stroke();
        } else {
          // Draw Dot (Out of screen)
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw boundary line in projected mode if not fullField
    if (mode === 'projected' && !fullField) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(boundaryX, 0);
      ctx.lineTo(boundaryX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label B-field boundary
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.font = 'bold 9px font-sans';
      ctx.fillText('B-Field Boundary (x = 180)', boundaryX + 8, 18);
    }

    if (q === 0) {
      // Neutral particle travels in straight horizontal line
      const lineY = cY;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, lineY);
      ctx.lineTo(width - 20, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      const px = mode === 'orbit' ? 40 + ((Math.sin(angle) + 1) / 2) * (width - 80) : projX;

      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, lineY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('0', px, lineY + 3.5);
      return;
    }

    if (mode === 'orbit') {
      // Draw circular orbit path trace
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cX, cY, orbitRadiusPx, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw radius line
      const px = cX + orbitRadiusPx * Math.cos(angle);
      const py = cY + orbitRadiusPx * Math.sin(angle);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(px, py);
      ctx.stroke();

      const labelX = (cX + px) / 2;
      const labelY = (cY + py) / 2 - 5;
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 9px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`r = ${calculatedRadius.toFixed(2)} m`, labelX, labelY);

      // Draw particle
      ctx.fillStyle = q > 0 ? '#ef4444' : '#3b82f6';
      ctx.strokeStyle = q > 0 ? '#b91c1c' : '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(q > 0 ? '+' : '-', px, py + 4);

      if (showVectors) {
        const omegaSign = Math.sign((q * B) * (bDir === 'in' ? 1 : -1));
        const tx = -Math.sin(angle) * omegaSign;
        const ty = Math.cos(angle) * omegaSign;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + tx * v * 7, py + ty * v * 7);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        const vxEnd = px + tx * v * 7;
        const vyEnd = py + ty * v * 7;
        ctx.moveTo(vxEnd, vyEnd);
        ctx.lineTo(vxEnd - 5 * tx - 3 * ty, vyEnd - 5 * ty + 3 * tx);
        ctx.lineTo(vxEnd - 5 * tx + 3 * ty, vyEnd - 5 * ty - 3 * tx);
        ctx.fill();
      }
    } else {
      // Draw Projected particle beam path
      ctx.fillStyle = q > 0 ? '#ef4444' : '#3b82f6';
      ctx.strokeStyle = q > 0 ? '#b91c1c' : '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(projX, projY, 11, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(q > 0 ? '+' : '-', projX, projY + 4);

      // Force and Velocity Vectors in projected mode
      if (showVectors && projX > 0) {
        // Velocity vector direction
        const speedVal = Math.sqrt(projVx * projVx + projVy * projVy);
        const tx = speedVal > 0 ? projVx / speedVal : 1;
        const ty = speedVal > 0 ? projVy / speedVal : 0;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(projX, projY);
        ctx.lineTo(projX + tx * 35, projY + ty * 35);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        const vxEnd = projX + tx * 35;
        const vyEnd = projY + ty * 35;
        ctx.moveTo(vxEnd, vyEnd);
        ctx.lineTo(vxEnd - 5 * tx - 3 * ty, vyEnd - 5 * ty + 3 * tx);
        ctx.lineTo(vxEnd - 5 * tx + 3 * ty, vyEnd - 5 * ty - 3 * tx);
        ctx.fill();

        // Lorentz force vector inside B-field
        if (projX >= boundaryX) {
          const Bz = bDir === 'in' ? -B : B;
          const forceX = q * projVy * Bz;
          const forceY = -q * projVx * Bz;
          const forceLen = Math.sqrt(forceX * forceX + forceY * forceY);
          const fx = forceLen > 0 ? forceX / forceLen : 0;
          const fy = forceLen > 0 ? forceY / forceLen : 0;

          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(projX, projY);
          ctx.lineTo(projX + fx * 35, projY + fy * 35);
          ctx.stroke();

          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          const fxEnd = projX + fx * 35;
          const fyEnd = projY + fy * 35;
          ctx.moveTo(fxEnd, fyEnd);
          ctx.lineTo(fxEnd - 5 * fx - 3 * fy, fyEnd - 5 * fy + 3 * fx);
          ctx.lineTo(fxEnd - 5 * fx + 3 * fy, fyEnd - 5 * fy - 3 * fx);
          ctx.fill();
        }
      }
    }
  }, [angle, q, m, v, B, bDir, calculatedRadius, showVectors, mode, projX, projY, projVx, projVy, fullField, launchAngle]);

  const handleReset = () => {
    setAngle(0);
    resetProjected();
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'charged_particle_sim',
    simulationTitle: 'Charged Particle in Magnetic Field',
    category: 'fields',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'velocity', label: 'Velocity (v)', unit: 'm/s' },
      { key: 'radius', label: 'Radius (r)', unit: 'm' },
      { key: 'charge', label: 'Charge (q)', unit: 'C' },
      { key: 'mass', label: 'Mass (m)', unit: 'kg' },
      { key: 'bField', label: 'Field (B)', unit: 'T' },
      { key: 'frequency', label: 'Frequency (f)', unit: 'Hz' },
      { key: 'period', label: 'Period (T)', unit: 's' },
    ],
    getCurrentRow: () => {
      const freq = (Math.abs(q) * B) / (2 * Math.PI * m);
      const period = freq > 0 ? 1 / freq : 0;
      return {
        velocity: v,
        radius: parseFloat(calculatedRadius.toFixed(2)),
        charge: q,
        mass: m,
        bField: B,
        frequency: parseFloat(freq.toFixed(2)),
        period: parseFloat(period.toFixed(4)),
      };
    },
    getSeriesData: () => {
      const vels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const cycFreq = (Math.abs(q) * B) / (2 * Math.PI * m);
      const cycPeriod = cycFreq > 0 ? 1 / cycFreq : 0;
      return vels.map((vel, idx) => {
        const rad = (m * vel) / (Math.abs(q) * B);
        return {
          trial: idx + 1,
          velocity: vel,
          radius: parseFloat(rad.toFixed(2)),
          charge: q,
          mass: m,
          bField: B,
          frequency: parseFloat(cycFreq.toFixed(2)),
          period: parseFloat(cycPeriod.toFixed(4)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Velocity v = 2.0 m/s', params: { v: 2.0 }, durationMs: 750 },
        { label: 'Velocity v = 3.0 m/s', params: { v: 3.0 }, durationMs: 750 },
        { label: 'Velocity v = 4.0 m/s', params: { v: 4.0 }, durationMs: 750 },
        { label: 'Velocity v = 5.0 m/s', params: { v: 5.0 }, durationMs: 750 },
        { label: 'Velocity v = 6.0 m/s', params: { v: 6.0 }, durationMs: 750 },
        { label: 'Velocity v = 7.0 m/s', params: { v: 7.0 }, durationMs: 750 },
        { label: 'Velocity v = 8.0 m/s', params: { v: 8.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.v !== undefined) setV(p.v);
      },
    },
    defaultGraphConfig: {
      xAxis: 'velocity',
      yAxis: 'radius',
      title: 'Cyclotron Orbit: r vs v (r = mv / qB, Slope = m / qB)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Simulation Mode': mode,
      'Charge (q)': `${q} C`,
      'Mass (m)': `${m} kg`,
      'Velocity (v)': `${v} m/s`,
      'Magnetic Field (B)': `${B} T`,
      'Calculated Radius (r)': `${calculatedRadius.toFixed(2)} m`
    };
    downloadReportAsPDF('Charged Particle in Magnetic Field Lab Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* Mode Selector */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">{t.mode}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('orbit')}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'orbit' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.modeOrbit}
              </button>
              <button
                onClick={() => setMode('projected')}
                disabled={recorder.isAutoRunning}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'projected' ? 'bg-purple-650 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.modeProjected}
              </button>
            </div>
          </div>

          {/* Field Boundary Coverage Toggle (only visible in projected mode) */}
          {mode === 'projected' && (
            <div className="space-y-1 pt-1.5 border-t border-slate-100">
              <label className="text-xs text-slate-500 font-bold block">
                {lang === 'en' ? 'Field Boundary' : lang === 'si' ? 'චුම්බක ක්ෂේත්‍රයේ සීමාව' : 'காந்தப்புல எல்லை'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFullField(true)}
                  disabled={recorder.isAutoRunning}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-40 ${
                    fullField
                      ? 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {lang === 'en' ? 'Full Canvas (Inside Field)' : lang === 'si' ? 'සම්පූර්ණ ක්ෂේත්‍රය' : 'முழு காந்தப்புலம்'}
                </button>
                <button
                  onClick={() => setFullField(false)}
                  disabled={recorder.isAutoRunning}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-40 ${
                    !fullField
                      ? 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {lang === 'en' ? 'Right-Half (Boundary entry)' : lang === 'si' ? 'දකුණු අර්ධය' : 'வலது பாதி மட்டும்'}
                </button>
              </div>
            </div>
          )}

          {/* Charge slider */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.charge}</span>
              <span className={`font-mono font-bold ${q > 0 ? 'text-red-500' : q < 0 ? 'text-blue-500' : 'text-slate-500'}`}>
                {q > 0 ? `+${q.toFixed(1)}` : q.toFixed(1)} C
              </span>
            </div>
            <input
              type="range" min="-2.0" max="2.0" step="0.5" value={q}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setQ(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Mass slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.mass}</span>
              <span className="text-slate-700 font-mono">{m.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="0.5" max="3.0" step="0.1" value={m}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setM(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Velocity slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.velocity}</span>
              <span className="text-emerald-600 font-mono">{v.toFixed(1)} m/s</span>
            </div>
            <input
              type="range" min="1.0" max="8.0" step="0.2" value={v}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setV(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Launch Angle slider (only visible in projected mode) */}
          {mode === 'projected' && (
            <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-650">{t.launchAngle}</span>
                <span className="text-indigo-600 font-mono">{launchAngle}°</span>
              </div>
              <input
                type="range" min="-45" max="45" step="5" value={launchAngle}
                onChange={(e) => setLaunchAngle(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Magnetic Field slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.bField}</span>
              <span className="text-purple-650 font-mono">{B.toFixed(2)} T</span>
            </div>
            <input
              type="range" min="0.5" max="3.0" step="0.1" value={B}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Magnetic Field Direction toggle */}
          <div className="space-y-1 pt-1">
            <label className="text-xs text-slate-500 font-bold block">{t.bDirection}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBDir('in')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  bDir === 'in' ? 'bg-slate-800 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.intoScreen}
              </button>
              <button
                onClick={() => setBDir('out')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  bDir === 'out' ? 'bg-slate-800 text-white shadow' : 'bg-slate-50 text-slate-650'
                }`}
              >
                {t.outOfScreen}
              </button>
            </div>
          </div>

          {/* Vector Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-cp" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-cp" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
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
              <span className="text-slate-500 block">{t.radius}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">
                {q === 0 ? 'Infinite (Straight Path)' : `${calculatedRadius.toFixed(2)} m`}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.freq}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{frequency.toFixed(2)} Hz</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.period}</span>
              <span className="font-extrabold text-purple-600 font-mono text-sm">
                {q === 0 ? 'N/A' : `${period.toFixed(2)} s`}
              </span>
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
            <canvas ref={canvasRef} className="border border-slate-100 rounded-lg bg-slate-50/20" />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset angle / beam position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={chargedParticleGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ charge: q, mass: m, velocity: v, bField: B }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={250}
        />

        {/* Observation log */}
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
