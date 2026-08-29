import { useState, useRef, useEffect, useMemo } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath, InlineMath } from '../../Math';
import { 
  Sparkles, 
  Info, 
  Play,
  Pause,
  RotateCcw,
  Zap
} from 'lucide-react';
import { calculateLenzStep, LenzParameters } from '../../../physics/magnetismPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function LenzsLawSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      controls: 'Induction Controls',
      circuitState: 'Coil Circuit State',
      closed: 'Closed Circuit (Load)',
      open: 'Open Circuit (Infinite R)',
      strength: 'Magnet Strength (B₀)',
      mass: 'Magnet Mass (m)',
      turns: 'Coil Turns (N)',
      resistance: 'Coil Resistance (R)',
      logTrial: 'Log Trial Snapshot',
      physicsCalculations: 'Physics Calculations',
      emf: 'Induced EMF',
      current: 'Induced Current (I)',
      braking: 'Magnetic Braking Force',
      velocity: 'Magnet Velocity',
      labNotes: 'Observational Lab Journal',
      trialHistory: 'Recorded Induction Trial History',
      pdf: 'Export PDF',
      simMode: 'Simulation Mode',
      autoDrop: 'Gravity Auto-Drop',
      manualDrag: 'Interactive Manual Drag',
      comesChart: 'Induced Current: Magnet Approaching (Comes)',
      goesChart: 'Induced Current: Magnet Leaving (Goes)',
      resultantCurrent: 'Resultant Induced Current (I_res)',
      circulationDir: 'Circulation Direction',
      combinedChart: 'Resultant Induced Current vs Time (Full Waveform)'
    },
    si: {
      controls: 'ප්‍රේරණ පාලන පුවරුව',
      circuitState: 'දඟරයේ පරිපථ තත්ත්වය',
      closed: 'සංවෘත පරිපථය (භාරය)',
      open: 'විවෘත පරිපථය (නිරන්ත R)',
      strength: 'චුම්බක ප්‍රබලතාවය (B₀)',
      mass: 'චුම්බක ස්කන්ධය (m)',
      turns: 'දඟර වට සංඛ්‍යාව (N)',
      resistance: 'දඟර ප්‍රතිරෝධය (R)',
      logTrial: 'නිරීක්ෂණ සටහන් කරන්න',
      physicsCalculations: 'භෞතික විද්‍යාත්මක ගණනය කිරීම්',
      emf: 'ප්‍රේරිත වි.ගා.බ. (EMF)',
      current: 'ප්‍රේරිත ධාරාව (I)',
      braking: 'චුම්බක තිරිංග බලය',
      velocity: 'චුම්බකයේ ප්‍රවේගය',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'පටිගත කළ ප්‍රේරණ අත්හදා බැලීම්',
      pdf: 'PDF ලබාගන්න',
      simMode: 'සිමියුලේෂන් ක්‍රමය',
      autoDrop: 'ගුරුත්වාකර්ෂණ වැටීම',
      manualDrag: 'අන්තර්ක්‍රියාකාරී ඇදීම',
      comesChart: 'ප්‍රේරිත ධාරාව: ඇතුල් වන විට (ප්‍රවේශය)',
      goesChart: 'ප්‍රේරිත ධාරාව: පිටවන විට (නික්මීම)',
      resultantCurrent: 'ප්‍රතිඵල ප්‍රේරිත ධාරාව (I_res)',
      circulationDir: 'ධාරා සංසරණ දිශාව',
      combinedChart: 'ප්‍රතිඵල ධාරාව කාලය සමග තරංගය'
    },
    ta: {
      controls: 'மின்தூண்டல் கட்டுப்பாடு',
      circuitState: 'சுருள் சுற்று நிலை',
      closed: 'மூடிய சுற்று (பளு)',
      open: 'திறந்த சுற்று (அளவிலா R)',
      strength: 'காந்த வலிமை (B₀)',
      mass: 'காந்த நிறை (m)',
      turns: 'சுருள் சுற்றுகள் (N)',
      resistance: 'சுருள் மின்தடை (R)',
      logTrial: 'சோதனைப் பதிவைச் சேமி',
      physicsCalculations: 'பௌதிகவியல் கணிப்புகள்',
      emf: 'தூண்டப்பட்ட மின்னியக்க விசை',
      current: 'தூண்டப்பட்ட மின்னோட்டம் (I)',
      braking: 'காந்த பிரேக்கிங் விசை',
      velocity: 'காந்த வேகம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'பதிவு செய்யப்பட்ட சோதனை வரலாறு',
      pdf: 'PDF ஏற்றுமதி செய்',
      simMode: 'சிமுலேஷன் முறை',
      autoDrop: 'ஈர்ப்பு வீழ்ச்சி (தானியங்கி)',
      manualDrag: 'ஊடாடும் இழுவை (கையால்)',
      comesChart: 'மின்னோட்டம்: நுழையும் போது',
      goesChart: 'மின்னோட்டம்: வெளியேறும் போது',
      resultantCurrent: 'விளைவு தூண்டப்பட்ட மின்னோட்டம் (I_res)',
      circulationDir: 'சுழற்சி திசை',
      combinedChart: 'விளைவு மின்னோட்டம் vs நேரம்'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [magnetMass, setMagnetMass] = useState<number>(0.2); // kg
  const [magnetStrength, setMagnetStrength] = useState<number>(1.5); // Tesla scale
  const [coilTurns, setCoilTurns] = useState<number>(200);
  const [isClosedCircuit, setIsClosedCircuit] = useState<boolean>(true);
  const [coilResistance, setCoilResistance] = useState<number>(2.0); // Ohms
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [explainMode, setExplainMode] = useState<boolean>(true);

  // Live state
  const [magnetY, setMagnetY] = useState<number>(40); // Initial Y
  const [velocity, setVelocity] = useState<number>(0);
  const [inducedCurrent, setInducedCurrent] = useState<number>(0);
  const [inducedEMF, setInducedEMF] = useState<number>(0);
  const [magneticForce, setMagneticForce] = useState<number>(0);


  // Separate comes and goes histories
  const [comesHistory, setComesHistory] = useState<{ t: number[]; current: number[] }>({ t: [], current: [] });
  const [goesHistory, setGoesHistory] = useState<{ t: number[]; current: number[] }>({ t: [], current: [] });
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Dragging interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const prevDragYRef = useRef<number>(40);
  const prevDragTimeRef = useRef<number>(performance.now());

  // Lab Notes
  const [notes, setNotes] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timeAccumulatorRef = useRef<number>(0);

  // Resistance value based on open/closed toggle
  const actualResistance = useMemo(() => {
    return isClosedCircuit ? coilResistance : Infinity;
  }, [isClosedCircuit, coilResistance]);

  // Parameters block
  const currentParams = useMemo((): LenzParameters => {
    return {
      magnetMass,
      magnetStrength,
      coilTurns,
      coilResistance: actualResistance,
      gravity: 10
    };
  }, [magnetMass, magnetStrength, coilTurns, actualResistance]);

  // Reset magnet drop
  const handleReset = () => {
    setMagnetY(40);
    setVelocity(0);
    setInducedCurrent(0);
    setInducedEMF(0);
    setMagneticForce(0);
    setComesHistory({ t: [], current: [] });
    setGoesHistory({ t: [], current: [] });
    timeAccumulatorRef.current = 0;
  };

  // Falling Magnet Simulation Loop
  useEffect(() => {
    const loop = (time: number) => {
      const actualDt = Math.min(0.03, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rectWidth = 540;
      const rectHeight = 320;

      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      canvas.style.width = `${rectWidth}px`;
      canvas.style.height = `${rectHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw background grid lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      // Physics integration step
      let currentY = magnetY;
      let currentV = velocity;
      let state = { magnetY: currentY, velocity: currentV, acceleration: 10, inducedEMF: inducedEMF, inducedCurrent: inducedCurrent, magneticForce: magneticForce, flux: 0 };

      if (!isManualMode && isPlaying) {
        // Slow down physics speed to 0.25x
        const dt = actualDt * 0.25;
        state = calculateLenzStep(currentY, currentV, currentParams, dt);
        
        // Loop magnet drop when it falls past screen
        if (state.magnetY > rectHeight + 50) {
          currentY = 40;
          currentV = 0;
          setIsPlaying(false); // Stop dropping automatically (don't update again and again)
        } else {
          currentY = state.magnetY;
          currentV = state.velocity;
        }

        setMagnetY(currentY);
        setVelocity(currentV);
        setInducedCurrent(state.inducedCurrent);
        setInducedEMF(state.inducedEMF);
        setMagneticForce(state.magneticForce);

        // Update charts history trail
        timeAccumulatorRef.current += dt;

        if (currentY <= 220) {
          setComesHistory(prev => {
            const nextT = [...prev.t, timeAccumulatorRef.current];
            const nextI = [...prev.current, state.inducedCurrent];
            if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
            return { t: nextT, current: nextI };
          });
        } else {
          setGoesHistory(prev => {
            const nextT = [...prev.t, timeAccumulatorRef.current];
            const nextI = [...prev.current, state.inducedCurrent];
            if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
            return { t: nextT, current: nextI };
          });
        }
      }

      const centerX = rectWidth / 2;

      // 1. Draw Cylindrical Copper Coil
      const coilY = 220;
      const coilRadius = 35;
      const coilHeight = 50;

      // Back of coil loops
      ctx.strokeStyle = '#b45309'; // Dark bronze/copper
      ctx.lineWidth = 3.5;
      for (let h = -coilHeight/2; h <= coilHeight/2; h += 8) {
        ctx.beginPath();
        ctx.arc(centerX, coilY + h, coilRadius, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // 2. Draw falling Bar Magnet (Red North, Blue South)
      const magnetWidth = 20;
      const magnetHeight = 60;
      const magY = currentY;

      // Magnetic field lines loops around the magnet (curved visual arcs)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      for (let w = 35; w <= 75; w += 20) {
        ctx.beginPath();
        ctx.ellipse(centerX, magY, w, w * 0.4, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw magnet body
      ctx.fillStyle = '#ef4444'; // North (Red)
      ctx.fillRect(centerX - magnetWidth/2, magY - magnetHeight/2, magnetWidth, magnetHeight/2);
      ctx.fillStyle = '#3b82f6'; // South (Blue)
      ctx.fillRect(centerX - magnetWidth/2, magY, magnetWidth, magnetHeight/2);

      // Label N and S on magnet
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX, magY - 14);
      ctx.fillText('S', centerX, magY + 18);

      // 3. Front of coil loops (overlays magnet if inside!)
      ctx.strokeStyle = '#d97706'; // Bright copper
      for (let h = -coilHeight/2; h <= coilHeight/2; h += 8) {
        ctx.beginPath();
        ctx.arc(centerX, coilY + h, coilRadius, 0, Math.PI);
        ctx.stroke();
      }

      // 4. LED bulb representation (Left Side)
      const ledX = centerX - 120;
      const ledY = coilY;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Wire from coil to LED
      ctx.moveTo(centerX - coilRadius, coilY - 15);
      ctx.lineTo(ledX, coilY - 15);
      ctx.lineTo(ledX, ledY - 10);
      ctx.moveTo(centerX - coilRadius, coilY + 15);
      ctx.lineTo(ledX, coilY + 15);
      ctx.lineTo(ledX, ledY + 10);
      ctx.stroke();

      // Draw LED bulb glowing depending on induced current square
      const currentPower = state.inducedCurrent * state.inducedCurrent;
      const glowOpacity = Math.min(1.0, currentPower * 4.0);

      if (glowOpacity > 0.05) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = glowOpacity * 16;
        ctx.fillStyle = `rgba(251, 191, 36, ${glowOpacity})`;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // LED label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('LOAD (LED)', ledX, ledY + 20);

      // 5. Galvanometer Meter (Right Side) - Visualizes Resultant Induced Current
      const galvX = centerX + 120;
      const galvY = coilY;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Wire from coil to Galvanometer
      ctx.moveTo(centerX + coilRadius, coilY - 15);
      ctx.lineTo(galvX, coilY - 15);
      ctx.lineTo(galvX, galvY - 22);
      ctx.moveTo(centerX + coilRadius, coilY + 15);
      ctx.lineTo(galvX, coilY + 15);
      ctx.lineTo(galvX, galvY + 22);
      ctx.stroke();

      // Galvanometer Body Dial
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(galvX - 28, galvY - 26, 56, 52, [6]);
      ctx.fill();
      ctx.stroke();

      // Dial scale arc
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(galvX, galvY + 10, 22, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Scale markings: -G, 0, +G
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 7px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('-I', galvX - 16, galvY - 10);
      ctx.fillText('0', galvX, galvY - 14);
      ctx.fillText('+I', galvX + 16, galvY - 10);
      ctx.fillText('GALVANOMETER', galvX, galvY + 20);

      // Needle Deflection based on Resultant Induced Current
      const maxCurrentRef = 1.5;
      const normalizedCurrent = Math.max(-1, Math.min(1, state.inducedCurrent / maxCurrentRef));
      const needleAngle = -Math.PI / 2 + normalizedCurrent * (Math.PI / 3.5);
      const needleLength = 18;

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(galvX, galvY + 10);
      ctx.lineTo(galvX + Math.cos(needleAngle) * needleLength, (galvY + 10) + Math.sin(needleAngle) * needleLength);
      ctx.stroke();

      // Needle center pivot
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(galvX, galvY + 10, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      // 6. Dynamic Lenz Polarity Badge & Current Circulation Indicator
      if (Math.abs(state.inducedCurrent) > 0.005) {
        // Circulating arrows & flow particles
        const flowTime = performance.now() * 0.005;
        const isCCW = state.inducedCurrent < 0;
        const particleOffset = isCCW ? -flowTime : flowTime;
        const pAngle = (particleOffset % (2 * Math.PI));
        const px = centerX + Math.cos(pAngle) * coilRadius;
        const py = coilY + Math.sin(pAngle) * 12;

        ctx.fillStyle = isCCW ? '#38bdf8' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
        ctx.fill();

        // Lenz Polarity Indicator on Top / Bottom of Coil
        ctx.font = 'bold 9px font-sans';
        ctx.textAlign = 'center';
        if (magY < coilY) {
          // Approaching: Induced North pole on top (Repelling North)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.fillText('⚡ INDUCED N-POLE (REPELLING)', centerX, coilY - coilHeight / 2 - 8);
        } else {
          // Leaving: Induced South pole on top (Attracting North)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
          ctx.fillText('⚡ INDUCED S-POLE (ATTRACTING)', centerX, coilY + coilHeight / 2 + 16);
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, magnetMass, magnetStrength, coilTurns, isClosedCircuit, coilResistance, magnetY, velocity, currentParams, isManualMode, inducedEMF, inducedCurrent, magneticForce]);

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'lenz_sim',
    simulationTitle: "Lenz's Law & Eddy Current Damping",
    category: 'fields',
    columns: [
      { key: 'trial', label: 'Point #' },
      { key: 'time_s', label: 'Time (t)', unit: 's' },
      { key: 'magnetY_cm', label: 'Position (z)', unit: 'cm' },
      { key: 'velocity_m_s', label: 'Velocity (v)', unit: 'm/s' },
      { key: 'inducedEMF_V', label: 'Induced EMF (ℰ)', unit: 'V' },
      { key: 'resultantCurrent_A', label: 'Resultant Current (I_res)', unit: 'A' },
      { key: 'currentDirection', label: 'Circulation Direction', unit: '' },
      { key: 'brakingForce_N', label: 'Braking Force (F_mag)', unit: 'N' },
    ],
    getCurrentRow: () => {
      const z_cm = parseFloat(((magnetY - 220) * 0.05 * 100).toFixed(1));
      const dirText = Math.abs(inducedCurrent) < 0.002
        ? 'Zero (Neutral)'
        : inducedCurrent < 0
        ? 'CCW ↺ (Opposing North)'
        : 'CW ↻ (Attracting South)';

      return {
        time_s: parseFloat((timeAccumulatorRef.current).toFixed(2)),
        magnetY_cm: z_cm,
        velocity_m_s: parseFloat(velocity.toFixed(2)),
        inducedEMF_V: parseFloat(inducedEMF.toFixed(3)),
        resultantCurrent_A: parseFloat(inducedCurrent.toFixed(3)),
        currentDirection: dirText,
        brakingForce_N: parseFloat(Math.abs(magneticForce).toFixed(3)),
      };
    },
    // Multi-point full run generator: samples 30 points across a complete descent cycle
    getSeriesData: () => {
      const seriesRows = [];
      let simY = 30;
      let simVy = 0;
      const dt = 0.015;
      for (let step = 0; step < 40; step++) {
        const stepState = calculateLenzStep(simY, simVy, currentParams, dt);
        simY = stepState.magnetY;
        simVy = stepState.velocity;
        const z_cm = parseFloat(((simY - 220) * 0.05 * 100).toFixed(1));
        const dir = Math.abs(stepState.inducedCurrent) < 0.002
          ? 'Zero (Neutral)'
          : stepState.inducedCurrent < 0
          ? 'CCW ↺ (Opposing North)'
          : 'CW ↻ (Attracting South)';

        seriesRows.push({
          trial: step + 1,
          time_s: parseFloat((step * dt).toFixed(3)),
          magnetY_cm: z_cm,
          velocity_m_s: parseFloat(stepState.velocity.toFixed(2)),
          inducedEMF_V: parseFloat(stepState.inducedEMF.toFixed(3)),
          resultantCurrent_A: parseFloat(stepState.inducedCurrent.toFixed(3)),
          currentDirection: dir,
          brakingForce_N: parseFloat(Math.abs(stepState.magneticForce).toFixed(3)),
        });
      }
      return seriesRows;
    },
    defaultGraphConfig: {
      xAxis: 'time_s',
      yAxis: 'resultantCurrent_A',
      title: "Lenz's Law: Resultant Induced Current vs Time (I_res vs t)",
      showRegression: false,
    },
    notes,
  });

  const handleExportPDF = () => {
    const reportParams = {
      'Turns (N)': `${coilTurns}`,
      'Circuit State': isClosedCircuit ? `Closed (${coilResistance} Ω)` : 'Open Circuit',
      'Magnet Strength': `${magnetStrength} T`,
      'Magnet Mass': `${magnetMass} kg`
    };
    downloadReportAsPDF('Lenzs Law Induction Lab Report', reportParams, recorder.recordedRows, notes);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isManualMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = 270;
    if (Math.abs(clickX - centerX) < 40 && Math.abs(clickY - magnetY) < 50) {
      isDraggingRef.current = true;
      setIsDragging(true);
      prevDragYRef.current = clickY;
      prevDragTimeRef.current = performance.now();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isManualMode || !isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const newY = Math.max(30, Math.min(300, clickY));
    const now = performance.now();
    const dt = (now - prevDragTimeRef.current) / 1000;

    if (dt > 0.005) {
      const dy = newY - prevDragYRef.current;
      const scaleMetersPerPixel = 0.05;
      const vy = (dy * scaleMetersPerPixel) / dt;

      setVelocity(vy);
      setMagnetY(newY);

      // Perform induction physics calculation based on manual speed vy
      const z_scale = 0.05;
      const z = (newY - 220) * z_scale;
      const R = 35 * z_scale;
      const C_flux = 0.01;
      const dist = Math.sqrt(R * R + z * z);
      const dPhi_dz = -(C_flux * magnetStrength * z) / Math.pow(dist, 3);
      const inducedEMF = -coilTurns * dPhi_dz * vy;
      const inducedCurrent = actualResistance === Infinity ? 0 : (inducedEMF / actualResistance);
      const magneticForce = coilTurns * inducedCurrent * dPhi_dz;

      setInducedEMF(inducedEMF);
      setInducedCurrent(inducedCurrent);
      setMagneticForce(magneticForce);

      // Record histories
      timeAccumulatorRef.current += dt;

      if (newY <= 220) {
        setComesHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextI = [...prev.current, inducedCurrent];
          if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
          return { t: nextT, current: nextI };
        });
      } else {
        setGoesHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextI = [...prev.current, inducedCurrent];
          if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
          return { t: nextT, current: nextI };
        });
      }

      prevDragYRef.current = newY;
      prevDragTimeRef.current = now;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setVelocity(0);
    setInducedCurrent(0);
    setInducedEMF(0);
    setMagneticForce(0);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isManualMode || e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;

    const centerX = 270;
    if (Math.abs(clickX - centerX) < 45 && Math.abs(clickY - magnetY) < 65) {
      isDraggingRef.current = true;
      setIsDragging(true);
      prevDragYRef.current = clickY;
      prevDragTimeRef.current = performance.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isManualMode || !isDraggingRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = touch.clientY - rect.top;

    const newY = Math.max(30, Math.min(300, clickY));
    const now = performance.now();
    const dt = (now - prevDragTimeRef.current) / 1000;

    if (dt > 0.005) {
      const dy = newY - prevDragYRef.current;
      const scaleMetersPerPixel = 0.05;
      const vy = (dy * scaleMetersPerPixel) / dt;

      setVelocity(vy);
      setMagnetY(newY);

      // Perform induction physics calculation based on manual speed vy
      const z_scale = 0.05;
      const z = (newY - 220) * z_scale;
      const R = 35 * z_scale;
      const C_flux = 0.01;
      const dist = Math.sqrt(R * R + z * z);
      const dPhi_dz = -(C_flux * magnetStrength * z) / Math.pow(dist, 3);
      const inducedEMF = -coilTurns * dPhi_dz * vy;
      const inducedCurrent = actualResistance === Infinity ? 0 : (inducedEMF / actualResistance);
      const magneticForce = coilTurns * inducedCurrent * dPhi_dz;

      setInducedEMF(inducedEMF);
      setInducedCurrent(inducedCurrent);
      setMagneticForce(magneticForce);

      // Record histories
      timeAccumulatorRef.current += dt;

      if (newY <= 220) {
        setComesHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextI = [...prev.current, inducedCurrent];
          if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
          return { t: nextT, current: nextI };
        });
      } else {
        setGoesHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextI = [...prev.current, inducedCurrent];
          if (nextT.length > 250) { nextT.shift(); nextI.shift(); }
          return { t: nextT, current: nextI };
        });
      }

      prevDragYRef.current = newY;
      prevDragTimeRef.current = now;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Lenz lab</span>
            </div>

            {/* Mode selection toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">{t.simMode}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setIsManualMode(false); handleReset(); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    !isManualMode 
                      ? 'bg-blue-600 border-blue-650 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.autoDrop}
                </button>
                <button
                  onClick={() => { setIsManualMode(true); handleReset(); }}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    isManualMode 
                      ? 'bg-blue-600 border-blue-650 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.manualDrag}
                </button>
              </div>
            </div>

            {/* Coil open / closed loop circuit breaker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">{t.circuitState}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsClosedCircuit(true)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                    isClosedCircuit 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.closed}
                </button>
                <button
                  onClick={() => setIsClosedCircuit(false)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                    !isClosedCircuit 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.open}
                </button>
              </div>
            </div>

            {/* Magnet strength */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.strength}</span>
                <span className="text-slate-800 font-mono">{magnetStrength.toFixed(1)} T</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={magnetStrength}
                onChange={(e) => setMagnetStrength(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Magnet mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.mass}</span>
                <span className="text-slate-800 font-mono">{magnetMass.toFixed(2)} kg</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.02"
                value={magnetMass}
                onChange={(e) => setMagnetMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Coil turns */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.turns}</span>
                <span className="text-slate-800 font-mono">{coilTurns} turns</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="25"
                value={coilTurns}
                onChange={(e) => setCoilTurns(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Coil resistance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.resistance}</span>
                <span className="text-slate-800 font-mono">{isClosedCircuit ? `${coilResistance.toFixed(1)} Ω` : '∞ (Open)'}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={coilResistance}
                disabled={!isClosedCircuit}
                onChange={(e) => setCoilResistance(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer Viewport & Real-Time Plots */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Falling magnet animation tube */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Electromagnetic Induction Falling Magnet Chamber</h3>
              
              {/* Play Pause Controls */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                  title="Reset variables"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto flex justify-center py-2">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className={`border border-slate-100 rounded-lg bg-white select-none shadow-sm transition-all ${
                  isManualMode ? (isDragging ? 'cursor-grabbing border-blue-500 ring-2 ring-blue-500/10' : 'cursor-grab hover:border-slate-300') : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Calculation readings (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              <div className="space-y-2.5 text-xs">
                {/* Resultant Induced Current */}
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-150 space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{t.resultantCurrent}:</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-sm">
                      {inducedCurrent > 0 ? `+${inducedCurrent.toFixed(3)}` : inducedCurrent.toFixed(3)} A
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium flex items-center justify-between">
                    <span>{t.circulationDir}:</span>
                    <span className="font-bold">
                      {Math.abs(inducedCurrent) < 0.002
                        ? '0.00 A (Neutral)'
                        : inducedCurrent < 0
                        ? '↺ CCW (Opposing N-Top)'
                        : '↻ CW (Attracting S-Top)'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.emf}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">{inducedEMF.toFixed(3)} V</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.braking}:</span>
                  <span className="font-mono text-red-650 font-bold">
                    {magneticForce !== 0 ? `${Math.abs(magneticForce).toFixed(3)} N (Up)` : '0.000 N'}
                  </span>
                </div>

                <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                  <span className="text-slate-500">{t.velocity}:</span>
                  <span className="font-mono text-slate-850 font-bold">{velocity.toFixed(2)} m/s</span>
                </div>
              </div>
            </div>

            {/* Plotly line charts (8 Cols) */}
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Approaching (Comes) Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm h-72 flex flex-col">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 text-center">
                  {t.comesChart}
                </h5>
                <div className="flex-1 min-h-0">
                  <PlotlyGraph
                    data={[
                      {
                        x: comesHistory.t,
                        y: comesHistory.current,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'I_res (A)',
                        line: { color: '#3b82f6', width: 2.5 }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 40, r: 10, t: 10, b: 30 },
                      xaxis: { title: { text: 'Time (s)', font: { size: 9 } } },
                      yaxis: { title: { text: 'Current (A)', font: { size: 9 } } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Receding (Goes) Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm h-72 flex flex-col">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 text-center">
                  {t.goesChart}
                </h5>
                <div className="flex-1 min-h-0">
                  <PlotlyGraph
                    data={[
                      {
                        x: goesHistory.t,
                        y: goesHistory.current,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'I_res (A)',
                        line: { color: '#ef4444', width: 2.5 }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 40, r: 10, t: 10, b: 30 },
                      xaxis: { title: { text: 'Time (s)', font: { size: 9 } } },
                      yaxis: { title: { text: 'Current (A)', font: { size: 9 } } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    className="w-full h-full"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Explainer Block */}
      {explainMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-sm border-b border-blue-150 pb-2">
            <Info className="w-4.5 h-4.5" />
            LENZ'S LAW & FARADAY INDUCTION SCIENTIFIC FOUNDATION
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-blue-900 leading-relaxed font-medium">
            <div className="space-y-2">
              <p>
                <strong>Faraday's Law of Electromagnetic Induction:</strong> The magnitude of the induced electromotive force (EMF) in a coil is directly proportional to the rate of change of magnetic flux linked with the coil:
              </p>
              <BlockMath math="\mathcal{E} = -N \frac{d\Phi_B}{dt}" />
              <p>
                Where <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="\mathcal{E}" /></span> is the induced EMF, <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="N" /></span> is the number of turns, and <span className="font-mono bg-blue-100/60 px-1 py-0.5 rounded"><InlineMath math="\Phi_B" /></span> is the magnetic flux.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Lenz's Law (ලෙන්ස්ගේ නියමය):</strong> The direction of the induced current is always such that it opposes the change in magnetic flux that created it:
              </p>
              <BlockMath math="I_{\text{resultant}} = \frac{\mathcal{E}}{R} = -\frac{N}{R}\frac{d\Phi_B}{dt}, \quad F_{\text{oppose}} = N I \frac{d\Phi_B}{dz}" />
              <p>
                As the North pole of the magnet falls towards the top of the coil, the coil sets up a North pole at its top (Counter-Clockwise current) to repel the approaching magnet. As the magnet exits, the coil reverses its current to Clockwise, setting up a South pole to attract the retreating magnet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Notes and history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Lab Notes (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.labNotes}
            </h3>
            
            {/* Show Theory Toggle */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="explainMode"
                checked={explainMode}
                onChange={(e) => setExplainMode(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="explainMode" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                Show Theory
              </label>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record the induced EMF peaks, terminal velocity limits under load, or open circuit versus closed circuit fall times..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium bg-slate-50/20"
          />
        </div>

        {/* Logs list & Laboratory Transfer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              {t.trialHistory}
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {recorder.trialCount} Data Points
            </span>
          </div>

          <SimulationLabBar
            trialCount={recorder.trialCount}
            onRecordTrial={recorder.recordTrial}
            onRecordFullRun={recorder.recordFullRun}
            isAutoRecording={recorder.isAutoRecording}
            onToggleAutoRecord={recorder.toggleAutoRecord}
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
