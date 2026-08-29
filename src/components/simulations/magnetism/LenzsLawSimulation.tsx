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
      goesChart: 'Induced Current: Magnet Leaving (Goes)'
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
      goesChart: 'ප්‍රේරිත ධාරාව: පිටවන විට (නික්මීම)'
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
      goesChart: 'மின்னோட்டம்: வெளியேறும் போது'
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

  // History buffers for plotting (max 150 entries)
  const [history, setHistory] = useState<{ t: number[]; emf: number[]; current: number[]; force: number[] }>({
    t: [],
    emf: [],
    current: [],
    force: []
  });

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
    setHistory({ t: [], emf: [], current: [], force: [] });
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
        setHistory(prev => {
          const nextT = [...prev.t, timeAccumulatorRef.current];
          const nextEmf = [...prev.emf, state.inducedEMF];
          const nextI = [...prev.current, state.inducedCurrent];
          const nextF = [...prev.force, state.magneticForce];

          if (nextT.length > 250) {
            nextT.shift(); nextEmf.shift(); nextI.shift(); nextF.shift();
          }
          return { t: nextT, emf: nextEmf, current: nextI, force: nextF };
        });

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

      // 4. LED bulb representation
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

      // Current direction arrows on wires if current is flowing
      if (Math.abs(state.inducedCurrent) > 0.005) {
        ctx.fillStyle = '#fbbf24';
        
        ctx.beginPath();
        ctx.arc(centerX - coilRadius - 40, coilY - 15, 3, 0, 2 * Math.PI);
        ctx.fill();
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
      { key: 'trial', label: 'Trial #' },
      { key: 'coilTurns', label: 'Turns (N)', unit: '' },
      { key: 'circuitState', label: 'Circuit State', unit: '' },
      { key: 'resistance_ohm', label: 'Resistance (R)', unit: 'Ω' },
      { key: 'magnetStrength_T', label: 'Magnet Strength (B₀)', unit: 'T' },
      { key: 'magnetMass_kg', label: 'Magnet Mass (m)', unit: 'kg' },
      { key: 'peakEMF_V', label: 'Peak EMF (ℰ)', unit: 'V' },
      { key: 'peakCurrent_A', label: 'Peak Current (I)', unit: 'A' },
      { key: 'brakingForce_N', label: 'Braking Force', unit: 'N' },
    ],
    getCurrentRow: () => {
      const maxEMF = history.emf.length > 0 ? Math.max(...history.emf.map(Math.abs)) : Math.abs(inducedEMF);
      const maxCurrent = history.current.length > 0 ? Math.max(...history.current.map(Math.abs)) : Math.abs(inducedCurrent);
      const maxForce = history.force.length > 0 ? Math.max(...history.force.map(Math.abs)) : Math.abs(magneticForce);
      return {
        coilTurns,
        circuitState: isClosedCircuit ? 'Closed Circuit' : 'Open Circuit',
        resistance_ohm: isClosedCircuit ? coilResistance : 999999,
        magnetStrength_T: magnetStrength,
        magnetMass_kg: magnetMass,
        peakEMF_V: parseFloat(maxEMF.toFixed(3)),
        peakCurrent_A: parseFloat(maxCurrent.toFixed(3)),
        brakingForce_N: parseFloat(maxForce.toFixed(3)),
      };
    },
    defaultGraphConfig: {
      xAxis: 'coilTurns',
      yAxis: 'peakEMF_V',
      title: "Lenz's Law: Peak Induced EMF vs Coil Turns N (ℰ ∝ N)",
      showRegression: true,
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
      setHistory(prev => {
        const nextT = [...prev.t, timeAccumulatorRef.current];
        const nextEmf = [...prev.emf, inducedEMF];
        const nextI = [...prev.current, inducedCurrent];
        const nextF = [...prev.force, magneticForce];
        if (nextT.length > 250) {
          nextT.shift(); nextEmf.shift(); nextI.shift(); nextF.shift();
        }
        return { t: nextT, emf: nextEmf, current: nextI, force: nextF };
      });

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
      setHistory(prev => {
        const nextT = [...prev.t, timeAccumulatorRef.current];
        const nextEmf = [...prev.emf, inducedEMF];
        const nextI = [...prev.current, inducedCurrent];
        const nextF = [...prev.force, magneticForce];
        if (nextT.length > 250) {
          nextT.shift(); nextEmf.shift(); nextI.shift(); nextF.shift();
        }
        return { t: nextT, emf: nextEmf, current: nextI, force: nextF };
      });

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
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.emf}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">{inducedEMF.toFixed(3)} V</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.current}:</span>
                  <span className="font-mono text-emerald-600 font-bold">{inducedCurrent.toFixed(3)} A</span>
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

            {/* Two separate Plotly line charts (8 Cols) */}
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
                        name: 'I_in (A)',
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
                        name: 'I_out (A)',
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
              <BlockMath math="F_{\text{magnetic}} = N I \frac{d\Phi_B}{dz}" />
              <p>
                As the North pole of the magnet falls towards the top of the coil, the coil sets up a North pole at its top to repel the approaching magnet, doing work against the magnetic repelling force. As the magnet exits, the coil sets up a South pole at its top to attract the retreating magnet. This creates a retarding mechanical force.
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
              {recorder.trialCount} Trials Recorded
            </span>
          </div>

          <SimulationLabBar
            trialCount={recorder.trialCount}
            onRecordTrial={recorder.recordTrial}
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
