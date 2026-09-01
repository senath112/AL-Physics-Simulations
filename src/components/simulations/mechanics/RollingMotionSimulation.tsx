import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Sparkles, Trophy, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { rollingMotionGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export interface RollingObjectConfig {
  id: string;
  name: string;
  k: number; // I / (m R^2)
  color: string;
  stroke: string;
  formula: string;
}

export function RollingMotionSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Rolling Motion & Moment of Inertia Lab',
      paramsTitle: 'Simulation Parameters',
      modeLabel: 'Experiment Mode',
      singleMode: 'Single Body Analysis',
      raceMode: 'Multi-Body Incline Race',
      selectedBody: 'Rolling Object',
      solidSphere: 'Solid Sphere (I = 2/5 mR²)',
      solidCylinder: 'Solid Cylinder / Disk (I = 1/2 mR²)',
      hollowSphere: 'Hollow Sphere (I = 2/3 mR²)',
      hollowCylinder: 'Hollow Cylinder / Ring (I = mR²)',
      slidingBlock: 'Frictionless Sliding Box (I = 0)',
      angle: 'Incline Angle (θ)',
      rampLength: 'Ramp Length (L)',
      mass: 'Object Mass (m)',
      radius: 'Object Radius (R)',
      gravity: 'Gravitational Acceleration (g)',
      play: 'Start Roll',
      pause: 'Pause',
      reset: 'Reset Incline',
      theoryOutput: 'Kinematics & Energy Partitioning',
      linearAccel: 'Linear Acceleration (a)',
      finalSpeed: 'Velocity at Base (v)',
      rollTime: 'Time of Descent (t)',
      reqFriction: 'Min Static Friction Coeff (μ_s)',
      keTrans: 'Translational KE (½ m v²)',
      keRot: 'Rotational KE (½ I ω²)',
      totEnergy: 'Total Mechanical Energy (mgh)',
      energyRatio: 'KE_rot / KE_trans Ratio',
      raceResults: 'Race Finish Leaderboard',
      raceDesc: 'Objects with lower inertia constants (k = I/mR²) accelerate faster down the slope!',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'පෙරළෙන චලිතය සහ අවස්ථිති ඝූර්ණය විද්‍යාගාරය',
      paramsTitle: 'අනුකරණ පරාමිතීන්',
      modeLabel: 'අත්හදා බැලීමේ ක්‍රමය',
      singleMode: 'තනි වස්තු විශ්ලේෂණය',
      raceMode: 'බහු-වස්තු ආනත තල තරඟය',
      selectedBody: 'පෙරළෙන වස්තුව',
      solidSphere: 'ඝන ගෝලය (I = 2/5 mR²)',
      solidCylinder: 'ඝන සිලින්ඩරය / තැටිය (I = 1/2 mR²)',
      hollowSphere: 'හිස් ගෝලය (I = 2/3 mR²)',
      hollowCylinder: 'හිස් සිලින්ඩරය / වළල්ල (I = mR²)',
      slidingBlock: 'ඝර්ෂණ රහිත ලිස්සන කුට්ටිය (I = 0)',
      angle: 'ආනත කෝණය (θ)',
      rampLength: 'තලයේ දිග (L)',
      mass: 'ස්කන්ධය (m)',
      radius: 'අරය (R)',
      gravity: 'ගුරුත්වජ ත්වරණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      theoryOutput: 'චලිත විද්‍යාව සහ ශක්ති බෙදීම',
      linearAccel: 'රේඛීය ත්වරණය (a)',
      finalSpeed: 'පාදයේදී ප්‍රවේගය (v)',
      rollTime: 'ගතවන කාලය (t)',
      reqFriction: 'අවශ්‍ය අවම ස්ථිතික ඝර්ෂණ සංගුණකය (μ_s)',
      keTrans: 'සංක්‍රාන්ති චාලක ශක්තිය (½ m v²)',
      keRot: 'භ්‍රමණ චාලක ශක්තිය (½ I ω²)',
      totEnergy: 'මුළු යාන්ත්‍රික ශක්තිය (mgh)',
      energyRatio: 'KE_rot / KE_trans අනුපාතය',
      raceResults: 'තරඟ ජයග්‍රහණ පුවරුව',
      raceDesc: 'අවම අවස්ථිති නියතයක් (k = I/mR²) සහිත වස්තූන් වඩා වේගයෙන් ආනත තලයෙන් පහළට ත්වරණය වේ!',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'உருளும் இயக்கம் & சடத்துவத்திருப்பம் ஆய்வகம்',
      paramsTitle: 'அளவுருக்கள்',
      modeLabel: 'சோதனை முறைமை',
      singleMode: 'தனிப்பொருள் பகுப்பாய்வு',
      raceMode: 'பல பொருள்கள் சாய்வுப் போட்டி',
      selectedBody: 'உருளும் பொருள்',
      solidSphere: 'திண்மக் கோளம் (I = 2/5 mR²)',
      solidCylinder: 'திண்ம உருளை / வட்டு (I = 1/2 mR²)',
      hollowSphere: 'உள்ளீடற்ற கோளம் (I = 2/3 mR²)',
      hollowCylinder: 'உள்ளீடற்ற உருளை / வளையம் (I = mR²)',
      slidingBlock: 'உராய்வற்ற வழுக்கும் பெட்டி (I = 0)',
      angle: 'சாய்வுக் கோணம் (θ)',
      rampLength: 'சாய்வு நீளம் (L)',
      mass: 'திணிவு (m)',
      radius: 'ஆரை (R)',
      gravity: 'ஈர்ப்பு முடுக்கம் (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      theoryOutput: 'இயக்கவியல் & ஆற்றல் பகிர்வு',
      linearAccel: 'நேரியல் முடுக்கம் (a)',
      finalSpeed: 'அடிவாரத்தில் வேகம் (v)',
      rollTime: 'இறங்கும் நேரம் (t)',
      reqFriction: 'தேவையான குறைந்தபட்ச உராய்வுக் குணகம் (μ_s)',
      keTrans: 'இடப்பெயர்வு இயக்க ஆற்றல் (½ m v²)',
      keRot: 'சுழற்சி இயக்க ஆற்றல் (½ I ω²)',
      totEnergy: 'மொத்த இயந்திர ஆற்றல் (mgh)',
      energyRatio: 'KE_rot / KE_trans விகிதம்',
      raceResults: 'போட்டி முடிவுகள்',
      raceDesc: 'குறைந்த சடத்துவக் குணகம் (k = I/mR²) கொண்ட பொருள்கள் சாய்வில் வேகமாக முடுக்கமடைகின்றன!',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const OBJECT_TYPES: RollingObjectConfig[] = [
    { id: 'solidSphere', name: t.solidSphere, k: 0.4, color: '#3b82f6', stroke: '#1d4ed8', formula: 'I = 2/5 mR² (k = 0.40)' },
    { id: 'solidCylinder', name: t.solidCylinder, k: 0.5, color: '#10b981', stroke: '#047857', formula: 'I = 1/2 mR² (k = 0.50)' },
    { id: 'hollowSphere', name: t.hollowSphere, k: 0.6667, color: '#f59e0b', stroke: '#b45309', formula: 'I = 2/3 mR² (k = 0.67)' },
    { id: 'hollowCylinder', name: t.hollowCylinder, k: 1.0, color: '#ef4444', stroke: '#b91c1c', formula: 'I = mR² (k = 1.00)' },
    { id: 'slidingBlock', name: t.slidingBlock, k: 0.0, color: '#8b5cf6', stroke: '#6d28d9', formula: 'I = 0 (Pure Slide, k = 0)' }
  ];

  const [mode, setMode] = useState<'single' | 'race'>('race');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('solidSphere');

  const [thetaDeg, setThetaDeg] = useState<number>(30);
  const [rampLength, setRampLength] = useState<number>(5.0);
  const m = 2.0; // kg
  const R = 0.2; // m
  const g = 9.8; // m/s^2

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [labNotes, setLabNotes] = useState<string>('');

  const currentObj = OBJECT_TYPES.find(o => o.id === selectedObjectId) || OBJECT_TYPES[0];
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);
  const height = rampLength * sinTheta;

  const kFactor = currentObj.k;
  const linearAccel = (g * sinTheta) / (1 + kFactor);
  const finalSpeed = Math.sqrt((2 * g * height) / (1 + kFactor));
  const timeOfDescent = Math.sqrt((2 * rampLength) / (linearAccel || 0.001));
  const minMuStatic = (kFactor / (1 + kFactor)) * Math.tan(thetaRad);

  const totalEnergy = m * g * height;
  const keTransFinal = 0.5 * m * finalSpeed * finalSpeed;
  const keRotFinal = 0.5 * (kFactor * m * R * R) * Math.pow(finalSpeed / R, 2);

  const simState = useRef<Record<string, { s: number; v: number; angle: number; finished: boolean; finishTime: number | null }>>({
    solidSphere: { s: 0, v: 0, angle: 0, finished: false, finishTime: null },
    solidCylinder: { s: 0, v: 0, angle: 0, finished: false, finishTime: null },
    hollowSphere: { s: 0, v: 0, angle: 0, finished: false, finishTime: null },
    hollowCylinder: { s: 0, v: 0, angle: 0, finished: false, finishTime: null },
    slidingBlock: { s: 0, v: 0, angle: 0, finished: false, finishTime: null }
  });

  const elapsedTimeRef = useRef<number>(0);
  const [renderTrigger, setRenderTrigger] = useState<number>(0);

  const handleReset = () => {
    setIsPlaying(false);
    elapsedTimeRef.current = 0;
    OBJECT_TYPES.forEach(obj => {
      simState.current[obj.id] = { s: 0, v: 0, angle: 0, finished: false, finishTime: null };
    });
    setRenderTrigger(prev => prev + 1);
  };

  useEffect(() => {
    handleReset();
  }, [thetaDeg, rampLength, mode]);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;
      elapsedTimeRef.current += dt;

      let allFinished = true;
      const objectsToUpdate = mode === 'race' ? OBJECT_TYPES : [currentObj];

      objectsToUpdate.forEach(obj => {
        const state = simState.current[obj.id];
        if (!state.finished) {
          const a = (g * sinTheta) / (1 + obj.k);
          state.v += a * dt;
          state.s += state.v * dt;
          state.angle += (state.v / R) * dt;

          if (state.s >= rampLength) {
            state.s = rampLength;
            state.v = Math.sqrt((2 * g * height) / (1 + obj.k));
            state.finished = true;
            state.finishTime = elapsedTimeRef.current;
          } else {
            allFinished = false;
          }
        }
      });

      setRenderTrigger(prev => prev + 1);

      if (allFinished) {
        setIsPlaying(false);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, thetaDeg, rampLength, mode, R, sinTheta, height, currentObj]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Isometric Front-Perspective Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const heightPx = 280;

    canvas.width = width * dpr;
    canvas.height = heightPx * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${heightPx}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, heightPx);

    // Pure Clean White Background with Light Grid Floor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, heightPx);

    // Floor perspective grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    for (let gy = 230; gy <= heightPx; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(width - 10, gy);
      ctx.stroke();
    }
    ctx.restore();

    // 3D Wedge Incline Geometry (Viewing Incline from Front Angle)
    // Front face coordinates
    const fStartX = 70;
    const fBaseY = 240;
    const rampPixels = 380;
    const fTopX = fStartX;
    const fTopY = fBaseY - rampPixels * sinTheta * 0.65;
    const fEndX = fStartX + rampPixels * cosTheta * 0.95;
    const fEndY = fBaseY;

    // Extrusion 3D Depth Offset (into the screen to the right-up)
    const depthX = 45;
    const depthY = -25;

    // 1. Incline Back / Top Slope Surface (3D Ramp Face)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fTopX, fTopY);
    ctx.lineTo(fEndX, fEndY);
    ctx.lineTo(fEndX + depthX, fEndY + depthY);
    ctx.lineTo(fTopX + depthX, fTopY + depthY);
    ctx.closePath();

    const rampGrad = ctx.createLinearGradient(fTopX, fTopY, fEndX, fEndY);
    rampGrad.addColorStop(0, '#f1f5f9');
    rampGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = rampGrad;
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Incline Front Triangular Face (Direct Front View of Angle θ)
    ctx.beginPath();
    ctx.moveTo(fTopX, fTopY);
    ctx.lineTo(fEndX, fEndY);
    ctx.lineTo(fStartX, fBaseY);
    ctx.closePath();

    const frontFaceGrad = ctx.createLinearGradient(fStartX, fTopY, fStartX, fBaseY);
    frontFaceGrad.addColorStop(0, '#cbd5e1');
    frontFaceGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = frontFaceGrad;
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Side Height Support Line & Base Ground Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, fBaseY);
    ctx.lineTo(width - 20, fBaseY);
    ctx.stroke();

    // Height Dimension Marker h
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(fStartX - 15, fTopY);
    ctx.lineTo(fStartX - 15, fBaseY);
    ctx.moveTo(fStartX - 20, fTopY); ctx.lineTo(fStartX - 10, fTopY);
    ctx.moveTo(fStartX - 20, fBaseY); ctx.lineTo(fStartX - 10, fBaseY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`h = ${height.toFixed(2)}m`, fStartX - 22, (fTopY + fBaseY) / 2 + 3);

    // Front Angle Protractor Arc θ (exact, no distortion)
    const arcRadius = 45;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fEndX, fEndY, arcRadius, Math.PI, Math.PI + thetaRad, false);
    ctx.stroke();

    // Angle label positioned at arc midpoint
    const arcMidAngle = Math.PI + thetaRad / 2;
    const labelR = arcRadius + 16;
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`θ=${thetaDeg}°`, fEndX + Math.cos(arcMidAngle) * labelR, fEndY + Math.sin(arcMidAngle) * labelR);
    ctx.restore();

    // 4. Render Beautiful 3D Rolling Bodies along the Slope
    const activeList = mode === 'race' ? OBJECT_TYPES : [currentObj];
    const trackRadius = 15;

    activeList.forEach((obj, idx) => {
      const state = simState.current[obj.id];
      const normDist = rampLength > 0 ? state.s / rampLength : 0;

      // 3D lane offset across the depth width of ramp
      const numTracks = activeList.length;
      const laneFraction = numTracks > 1 ? (idx + 0.5) / numTracks : 0.5;
      const laneDepthX = depthX * laneFraction;
      const laneDepthY = depthY * laneFraction;

      const trackTopX = fTopX + laneDepthX;
      const trackTopY = fTopY + laneDepthY;
      const trackEndX = fEndX + laneDepthX;
      const trackEndY = fEndY + laneDepthY;

      // Position on the slope
      const bodyX = trackTopX + normDist * (trackEndX - trackTopX);
      const bodyY = trackTopY + normDist * (trackEndY - trackTopY);

      // Normal perpendicular offset upwards from the slope surface
      const slopeAngleVisual = Math.atan2(trackEndY - trackTopY, trackEndX - trackTopX);
      const normalX = Math.sin(slopeAngleVisual);
      const normalY = -Math.cos(slopeAngleVisual);

      const centerX = bodyX + normalX * trackRadius;
      const centerY = bodyY + normalY * trackRadius;

      // Draw realistic contact shadow
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(bodyX, bodyY, trackRadius * 0.8, trackRadius * 0.25, slopeAngleVisual, 0, 2 * Math.PI);
      ctx.fill();

      ctx.translate(centerX, centerY);

      if (obj.id === 'slidingBlock') {
        // --- 3D Isometric Sliding Box ---
        ctx.rotate(slopeAngleVisual);
        const bw = trackRadius * 1.8;
        const bh = trackRadius * 1.4;

        // Front Face
        ctx.fillStyle = '#8b5cf6';
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
        ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

        // Top 3D Bevel
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.moveTo(-bw / 2, -bh / 2);
        ctx.lineTo(-bw / 2 + 6, -bh / 2 - 6);
        ctx.lineTo(bw / 2 + 6, -bh / 2 - 6);
        ctx.lineTo(bw / 2, -bh / 2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOX', 0, 3);

      } else if (obj.id === 'solidSphere') {
        // --- 3D Solid Sphere with Radial Highlight & Rotational Meridian Dots ---
        ctx.rotate(state.angle);

        // 3D Sphere Spherical Gradient
        const sGrad = ctx.createRadialGradient(-trackRadius * 0.35, -trackRadius * 0.35, trackRadius * 0.1, 0, 0, trackRadius);
        sGrad.addColorStop(0, '#ffffff');
        sGrad.addColorStop(0.3, '#60a5fa');
        sGrad.addColorStop(0.85, '#2563eb');
        sGrad.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Rotational Equator Ring & Meridian Dots
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, trackRadius, trackRadius * 0.4, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(trackRadius * 0.65, 0, 2.5, 0, 2 * Math.PI);
        ctx.arc(-trackRadius * 0.65, 0, 2.5, 0, 2 * Math.PI);
        ctx.fill();

      } else if (obj.id === 'solidCylinder') {
        // --- 3D Solid Cylinder / Disk with Extruded Metallic Body ---
        ctx.rotate(state.angle);

        // Circular Face Gradient
        const cGrad = ctx.createRadialGradient(-trackRadius * 0.3, -trackRadius * 0.3, trackRadius * 0.1, 0, 0, trackRadius);
        cGrad.addColorStop(0, '#ffffff');
        cGrad.addColorStop(0.35, '#34d399');
        cGrad.addColorStop(0.85, '#059669');
        cGrad.addColorStop(1, '#064e3b');

        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radial Spokes showing rotation
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-trackRadius, 0); ctx.lineTo(trackRadius, 0);
        ctx.moveTo(0, -trackRadius); ctx.lineTo(0, trackRadius);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, 2 * Math.PI);
        ctx.fill();

      } else if (obj.id === 'hollowSphere') {
        // --- 3D Hollow Sphere with Viewport Rim ---
        ctx.rotate(state.angle);

        const hsGrad = ctx.createRadialGradient(-trackRadius * 0.35, -trackRadius * 0.35, trackRadius * 0.1, 0, 0, trackRadius);
        hsGrad.addColorStop(0, '#ffffff');
        hsGrad.addColorStop(0.3, '#fbbf24');
        hsGrad.addColorStop(0.85, '#d97706');
        hsGrad.addColorStop(1, '#78350f');

        ctx.fillStyle = hsGrad;
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hollow inner cavity
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius * 0.55, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(trackRadius * 0.75, 0, 2.5, 0, 2 * Math.PI);
        ctx.fill();

      } else if (obj.id === 'hollowCylinder') {
        // --- 3D Hollow Cylinder / Ring with Core Aperture ---
        ctx.rotate(state.angle);

        const rGrad = ctx.createRadialGradient(-trackRadius * 0.35, -trackRadius * 0.35, trackRadius * 0.1, 0, 0, trackRadius);
        rGrad.addColorStop(0, '#ffffff');
        rGrad.addColorStop(0.35, '#f87171');
        rGrad.addColorStop(0.85, '#dc2626');
        rGrad.addColorStop(1, '#7f1d1d');

        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hollow center hole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, trackRadius * 0.65, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-trackRadius, 0); ctx.lineTo(-trackRadius * 0.65, 0);
        ctx.moveTo(trackRadius * 0.65, 0); ctx.lineTo(trackRadius, 0);
        ctx.stroke();
      }

      ctx.restore();

      // Race mode tag
      if (mode === 'race') {
        ctx.save();
        ctx.fillStyle = obj.color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${obj.id.slice(0, 7)}: ${state.s.toFixed(1)}m`, 20, 25 + idx * 16);
        ctx.restore();
      }
    });

  }, [thetaDeg, rampLength, mode, selectedObjectId, renderTrigger]);

  const recorder = useSimulationRecorder({
    simulationId: 'rolling_motion_sim',
    simulationTitle: 'Rolling Motion & Moment of Inertia',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'thetaDeg', label: 'Angle (θ)', unit: '°' },
      { key: 'sinTheta', label: 'sin(θ)' },
      { key: 'acceleration', label: 'Acceleration (a)', unit: 'm/s²' },
      { key: 'velocity', label: 'Final Speed (v)', unit: 'm/s' },
      { key: 'vSquared', label: 'v²', unit: 'm²/s²' },
      { key: 'h', label: 'Height (h)', unit: 'm' },
      { key: 'keTrans', label: 'KE_trans', unit: 'J' },
      { key: 'keRot', label: 'KE_rot', unit: 'J' },
    ],
    getCurrentRow: () => ({
      thetaDeg,
      sinTheta: parseFloat(sinTheta.toFixed(4)),
      acceleration: parseFloat(linearAccel.toFixed(3)),
      velocity: parseFloat(finalSpeed.toFixed(3)),
      vSquared: parseFloat((finalSpeed * finalSpeed).toFixed(3)),
      h: parseFloat(height.toFixed(2)),
      keTrans: parseFloat(keTransFinal.toFixed(2)),
      keRot: parseFloat(keRotFinal.toFixed(2)),
    }),
    getSeriesData: () => {
      const angles = [10, 20, 30, 40, 50, 60];
      return angles.map((ang, idx) => {
        const rad = (ang * Math.PI) / 180;
        const st = Math.sin(rad);
        const a = (g * st) / (1 + kFactor);
        const ht = rampLength * st;
        const v = Math.sqrt((2 * g * ht) / (1 + kFactor));
        const keT = 0.5 * m * v * v;
        const keR = 0.5 * (kFactor * m * R * R) * Math.pow(v / R, 2);
        return {
          trial: idx + 1,
          thetaDeg: ang,
          sinTheta: parseFloat(st.toFixed(4)),
          acceleration: parseFloat(a.toFixed(3)),
          velocity: parseFloat(v.toFixed(3)),
          vSquared: parseFloat((v * v).toFixed(3)),
          h: parseFloat(ht.toFixed(2)),
          keTrans: parseFloat(keT.toFixed(2)),
          keRot: parseFloat(keR.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'θ = 15° (Low Incline)', params: { thetaDeg: 15 }, durationMs: 700 },
        { label: 'θ = 25° (Moderate)', params: { thetaDeg: 25 }, durationMs: 700 },
        { label: 'θ = 35° (Standard)', params: { thetaDeg: 35 }, durationMs: 700 },
        { label: 'θ = 45° (Steep)', params: { thetaDeg: 45 }, durationMs: 700 },
        { label: 'θ = 55° (High Acceleration)', params: { thetaDeg: 55 }, durationMs: 700 },
      ],
      applyParams: (p: Record<string, number>) => {
        if (p.thetaDeg !== undefined) setThetaDeg(p.thetaDeg);
      },
    },
    defaultGraphConfig: {
      xAxis: 'sinTheta',
      yAxis: 'acceleration',
      title: 'Linear Acceleration a vs sin(θ) [Slope = g / (1 + k)]',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Rolling Body': currentObj.name,
      'Inertia Constant (k = I/mR²)': `${kFactor}`,
      'Incline Angle (θ)': `${thetaDeg}°`,
      'Ramp Length (L)': `${rampLength} m`,
      'Release Height (h)': `${height.toFixed(2)} m`,
      'Linear Acceleration (a)': `${linearAccel.toFixed(3)} m/s²`,
      'Final Velocity (v)': `${finalSpeed.toFixed(3)} m/s`,
      'Descent Time (t)': `${timeOfDescent.toFixed(3)} s`,
      'Translational KE': `${keTransFinal.toFixed(2)} J`,
      'Rotational KE': `${keRotFinal.toFixed(2)} J`,
      'Total Mechanical Energy': `${totalEnergy.toFixed(2)} J`
    };
    downloadReportAsPDF('Rolling Motion and Moment of Inertia Lab Report', reportParams, recorder.recordedRows, labNotes);
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
            <span className="text-xs font-semibold text-slate-600">{t.modeLabel}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('race')}
                disabled={recorder.isAutoRunning}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'race'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                {t.raceMode}
              </button>
              <button
                onClick={() => setMode('single')}
                disabled={recorder.isAutoRunning}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  mode === 'single'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.singleMode}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-600">{t.selectedBody}</span>
            <select
              value={selectedObjectId}
              onChange={(e) => setSelectedObjectId(e.target.value)}
              disabled={recorder.isAutoRunning}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {OBJECT_TYPES.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.angle}</span>
              <span className="text-blue-600 font-mono font-bold">{thetaDeg}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={thetaDeg}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setThetaDeg(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.rampLength}</span>
              <span className="text-indigo-600 font-mono font-bold">{rampLength.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={rampLength}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setRampLength(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={recorder.isAutoRunning}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? t.pause : t.play}
            </button>
            <button
              onClick={handleReset}
              disabled={recorder.isAutoRunning}
              className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/70 border border-blue-100/60">
              <span className="font-medium text-slate-700">{t.linearAccel}:</span>
              <span className="font-mono font-bold text-blue-700">{linearAccel.toFixed(3)} m/s²</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.finalSpeed}:</span>
              <span className="font-mono font-bold text-slate-800">{finalSpeed.toFixed(3)} m/s</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.rollTime}:</span>
              <span className="font-mono font-bold text-indigo-600">{timeOfDescent.toFixed(3)} s</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.reqFriction}:</span>
              <span className="font-mono font-semibold text-slate-800">μ_s ≥ {minMuStatic.toFixed(3)}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600">{t.keTrans}:</span>
                <span className="font-mono font-bold text-slate-800">{keTransFinal.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600">{t.keRot}:</span>
                <span className="font-mono font-bold text-amber-700">{keRotFinal.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold border-t border-slate-200/60 pt-1 text-slate-900">
                <span>{t.totEnergy}:</span>
                <span className="font-mono text-emerald-700">{totalEnergy.toFixed(2)} J</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {t.title}
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              a = g·sin(θ) / (1 + I/mR²)
            </span>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/280] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-2.5 font-medium">
            🏆 {t.raceDesc}
          </p>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={rollingMotionGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ thetaDeg, sinTheta, rampLength, height, kFactor, g }}
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
