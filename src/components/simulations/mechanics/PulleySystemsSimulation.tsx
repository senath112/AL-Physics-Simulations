import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ClipboardList, Scale, Layers } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { pulleySystemsGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function PulleySystemsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Pulley Systems & Mechanical Advantage Simulator',
      paramsTitle: 'System Parameters',
      pulleyCount: 'Number of Pulleys (n)',
      pulley1: '1 Pulley',
      pulley1Sub: 'Single Fixed (Atwood) • VR = 1',
      pulley2: '2 Pulleys',
      pulley2Sub: '1 Fixed + 1 Movable • VR = 2',
      pulley3: '3 Pulleys',
      pulley3Sub: 'Block & Tackle System • VR = 3',
      mass1: 'Load Mass (m₁)',
      mass2: 'Effort Mass (m₂)',
      gravity: 'Gravity (g)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Tension & Weight Vectors',
      theoryOutput: 'Theoretical Mechanics Analysis',
      vr: 'Velocity Ratio (VR)',
      ima: 'Ideal Mechanical Advantage (IMA)',
      eqEffort: 'Equilibrium Effort (m₁/n)',
      accelLoad: 'Load Acceleration (a₁)',
      accelEffort: 'Effort Acceleration (a₂)',
      tension: 'String Tension (T)',
      supportForce: 'Total Upward Force on Load (n·T)',
      setEquilibrium: 'Balance Mass',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs',
      loadBadge: 'LOAD',
      effortBadge: 'EFFORT',
      stateEquilibrium: 'Static Equilibrium (Balanced)',
      stateEffortLifting: 'Effort Descending • Lifting Load',
      stateLoadDropping: 'Load Overpowering • Dropping Down'
    },
    si: {
      title: 'කප්පි පද්ධති සහ යාන්ත්‍රික වාසිය සිමියුලේටරය',
      paramsTitle: 'පද්ධති පරාමිතීන්',
      pulleyCount: 'කප්පි ගණන (n)',
      pulley1: 'කප්පි 1',
      pulley1Sub: 'තනි ස්ථාවර (ඇට්වුඩ්) • VR = 1',
      pulley2: 'කප්පි 2',
      pulley2Sub: 'ස්ථාවර 1 + චලන 1 • VR = 2',
      pulley3: 'කප්පි 3',
      pulley3Sub: 'බ්ලොක් ඇන්ඩ් ටැකල් • VR = 3',
      mass1: 'භාරයේ ස්කන්ධය (m₁)',
      mass2: 'උත්සාහයේ ස්කන්ධය (m₂)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      play: 'ධාවනය කරන්න',
      pause: 'නවතන්න',
      reset: 'නැවත මුලට',
      vectors: 'ආතති සහ බර දෛශික පෙන්වන්න',
      theoryOutput: 'යාන්ත්‍රික න්‍යායාත්මක විශ්ලේෂණය',
      vr: 'ප්‍රවේග අනුපාතය (VR)',
      ima: 'පරමාදර්ශී යාන්ත්‍රික වාසිය (IMA)',
      eqEffort: 'සමතුලිත උත්සාහය (m₁/n)',
      accelLoad: 'භාරයේ ත්වරණය (a₁)',
      accelEffort: 'උත්සාහයේ ත්වරණය (a₂)',
      tension: 'තන්තුවේ ආතතිය (T)',
      supportForce: 'භාරය මත මුළු ඉහළ බලය (n·T)',
      setEquilibrium: 'සමබර කරන්න',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න',
      loadBadge: 'භාරය',
      effortBadge: 'උත්සාහය',
      stateEquilibrium: 'ස්ථිතික සමතුලිතතාවය (සමබරයි)',
      stateEffortLifting: 'උත්සාහය පහළට • භාරය එසවෙයි',
      stateLoadDropping: 'භාරය වැඩිවීමෙන් පහත වැටෙයි'
    },
    ta: {
      title: 'கப்பி தொகுதிகள் & இயந்திர நன்மை சிமுலேட்டர்',
      paramsTitle: 'அமைப்பு அளவுருக்கள்',
      pulleyCount: 'கப்பிகளின் எண்ணிக்கை (n)',
      pulley1: '1 கப்பி',
      pulley1Sub: 'நிலையான அட்வுட் • VR = 1',
      pulley2: '2 கப்பிகள்',
      pulley2Sub: '1 நிலையான + 1 அசையும் • VR = 2',
      pulley3: '3 கப்பிகள்',
      pulley3Sub: 'தொகுதி அமைப்பு • VR = 3',
      mass1: 'சுமை நிறை (m₁)',
      mass2: 'முயற்சி நிறை (m₂)',
      gravity: 'ஈர்ப்பு முடுக்கம் (g)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'இழுவிசை & விசை திசையன்களைக் காட்டு',
      theoryOutput: 'இயக்கவியல் கோட்பாட்டு பகுப்பாய்வு',
      vr: 'திசைவேக விகிதம் (VR)',
      ima: 'இயந்திர நன்மை (IMA)',
      eqEffort: 'சமநிலை முயற்சி (m₁/n)',
      accelLoad: 'சுமை முடுக்கம் (a₁)',
      accelEffort: 'முயற்சி முடுக்கம் (a₂)',
      tension: 'இழை இழுவிசை (T)',
      supportForce: 'சுமை மீதான மொத்த விசை (n·T)',
      setEquilibrium: 'சமநிலைப்படுத்து',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு',
      loadBadge: 'சுமை',
      effortBadge: 'முயற்சி',
      stateEquilibrium: 'நிலை சமநிலை (சமமானது)',
      stateEffortLifting: 'முயற்சி கீழே செல்கிறது • சுமை உயருகிறது',
      stateLoadDropping: 'சுமை அதிகமாகி கீழே செல்கிறது'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // State parameters
  const [pulleyCount, setPulleyCount] = useState<1 | 2 | 3>(1);
  const [m1, setM1] = useState<number>(6.0); // Load mass (kg)
  const [m2, setM2] = useState<number>(4.0); // Effort mass (kg)
  const [g, setG] = useState<number>(9.8); // m/s²
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Kinematic states
  const [effortOffset, setEffortOffset] = useState<number>(0); // Visual offset of effort mass in px
  const [vel, setVel] = useState<number>(0);
  const [pulleyRotation, setPulleyRotation] = useState<number>(0);

  const [labNotes, setLabNotes] = useState<string>('');

  // Physics Calculations
  const n = pulleyCount; // 1, 2, or 3
  const velocityRatio = n;
  const idealMechanicalAdvantage = n;
  const equilibriumEffort = m1 / n;

  // Equation of motion for system with Velocity Ratio n:
  // Downward displacement of effort = y2
  // Upward displacement of load = y1 = y2 / n
  // Tension T acts on effort downwards: m2*g - T = m2*a2
  // Upward tension on load = n*T: n*T - m1*g = m1*a1 = m1*(a2/n)
  // Solving for a2 and T:
  // a2 = [(n^2 * m2 - n * m1) * g] / (m1 + n^2 * m2)
  // a1 = a2 / n
  // T = [(n + 1) * m1 * m2 * g] / (m1 + n^2 * m2)
  const denom = m1 + n * n * m2;
  const netDriving = n * n * m2 - n * m1;
  const accelEffortSigned = denom > 0 ? (netDriving * g) / denom : 0;
  const accelEffort = Math.abs(accelEffortSigned);
  const accelLoad = accelEffort / n;
  const tension = denom > 0 ? ((n + 1) * m1 * m2 * g) / denom : 0;
  const totalUpwardForce = n * tension;
  const isEquilibrium = Math.abs(netDriving) < 0.001;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset simulation position
  const handleReset = () => {
    setIsPlaying(false);
    setEffortOffset(0);
    setVel(0);
    setPulleyRotation(0);
  };

  // Switch pulley count and automatically recalculate
  const handlePulleyCountChange = (count: 1 | 2 | 3) => {
    setPulleyCount(count);
    handleReset();
  };

  // Helper to set equilibrium mass
  const handleSetEquilibrium = () => {
    const eq = parseFloat((m1 / n).toFixed(2));
    setM2(eq);
    handleReset();
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      if (!isEquilibrium) {
        const direction = accelEffortSigned >= 0 ? 1 : -1;
        const newVel = vel + accelEffort * direction * dt;
        setVel(newVel);

        setEffortOffset((prev) => {
          const nextOffset = prev + newVel * dt * 45;

          // Limits based on geometry
          const maxDown = 95;
          const maxUp = -75;
          if (nextOffset >= maxDown) {
            setIsPlaying(false);
            return maxDown;
          }
          if (nextOffset <= maxUp) {
            setIsPlaying(false);
            return maxUp;
          }
          return nextOffset;
        });

        setPulleyRotation((prev) => prev + newVel * dt * 3.5);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vel, accelEffort, accelEffortSigned, isEquilibrium]);

  // Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 320;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clean white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate reference grid
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    for (let x = 30; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ceiling Support Fixture (Steel Beam at top)
    const ceilingY = 22;
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, ceilingY - 6, width - 80, 8);

    // Ceiling cross-hatch marks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    for (let hx = 50; hx < width - 50; hx += 16) {
      ctx.beginPath();
      ctx.moveTo(hx, ceilingY - 6);
      ctx.lineTo(hx - 8, ceilingY - 14);
      ctx.stroke();
    }

    // Helper: Draw metallic pulley wheel with rotating spokes
    const drawPulleyWheel = (
      px: number,
      py: number,
      radius: number,
      rotAngle: number,
      hasCeilingBracket: boolean = true
    ) => {
      // Bracket to ceiling if fixed
      if (hasCeilingBracket) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px, ceilingY + 2);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Outer pulley rim shadow
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Inner pulley wheel
      const grad = ctx.createLinearGradient(px - radius, py - radius, px + radius, py + radius);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.5, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, radius - 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Rotating spokes
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = rotAngle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (radius - 3) * Math.cos(a), py + (radius - 3) * Math.sin(a));
        ctx.stroke();
      }

      // Center Hub & Brass Axle Pin
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
    };

    // Helper: Draw Load Block m1 (Blue) or Effort Block m2 (Emerald)
    const drawBlock = (
      bx: number,
      by: number,
      massVal: number,
      role: 'load' | 'effort'
    ) => {
      const size = Math.max(26, Math.min(46, 20 + massVal * 1.8));
      const half = size / 2;

      // Top suspension ring/hook
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bx, by - 5, 5, 0, 2 * Math.PI);
      ctx.stroke();

      // Main Block Body
      const isLoad = role === 'load';
      const grad = ctx.createLinearGradient(bx - half, by, bx + half, by + size);
      if (isLoad) {
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#1d4ed8');
      } else {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#047857');
      }

      ctx.fillStyle = grad;
      ctx.strokeStyle = isLoad ? '#1e40af' : '#065f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - half, by, size, size, 6);
      ctx.fill();
      ctx.stroke();

      // Block Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLoad ? t.loadBadge : t.effortBadge, bx, by + 12);

      ctx.font = 'black 11px monospace';
      ctx.fillText(`${massVal.toFixed(1)}kg`, bx, by + size - 8);

      return { x: bx, y: by, size, half };
    };

    // Helper: Draw Vector Arrow with label
    const drawVectorArrow = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      color: string,
      labelStr: string
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrow head
      const headLen = 6;
      const angle = Math.atan2(endY - startY, endX - startX);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Label text
      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(labelStr, endX + 5, endY + (endY >= startY ? 4 : -2));
    };

    // Kinematic positions:
    // When effortOffset > 0, effort mass m2 descends (+y), load mass m1 ascends (-y) by effortOffset / n
    const effortY = 145 + effortOffset;
    const loadDisplacement = effortOffset / n;
    const loadBaseY = 160 - loadDisplacement;

    // Rope styling
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.2;

    // =========================================================================
    // CONFIGURATION 1: SINGLE FIXED PULLEY (ATWOOD MACHINE, VR = 1)
    // =========================================================================
    if (pulleyCount === 1) {
      const fixedX = width / 2;
      const fixedY = 60;
      const R = 24;

      const m1X = fixedX - R; // Left tangent: 246
      const m2X = fixedX + R; // Right tangent: 294

      // Draw Ropes
      ctx.beginPath();
      ctx.moveTo(m1X, loadBaseY);
      ctx.lineTo(m1X, fixedY);
      ctx.arc(fixedX, fixedY, R, Math.PI, 0, false);
      ctx.lineTo(m2X, effortY);
      ctx.stroke();

      // Draw Pulley Wheel
      drawPulleyWheel(fixedX, fixedY, R, pulleyRotation, true);

      // Draw Masses
      const b1 = drawBlock(m1X, loadBaseY, m1, 'load');
      const b2 = drawBlock(m2X, effortY, m2, 'effort');

      // Force Vectors
      if (showVectors) {
        const vScale = 1.4;
        // Tension on Load (Upward)
        drawVectorArrow(m1X, b1.y, m1X, b1.y - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);
        // Tension on Effort (Upward)
        drawVectorArrow(m2X, b2.y, m2X, b2.y - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);
        // Weight on Load (Downward)
        const w1 = m1 * g;
        drawVectorArrow(m1X, b1.y + b1.size, m1X, b1.y + b1.size + w1 * vScale, '#ef4444', `W₁=${w1.toFixed(1)}N`);
        // Weight on Effort (Downward)
        const w2 = m2 * g;
        drawVectorArrow(m2X, b2.y + b2.size, m2X, b2.y + b2.size + w2 * vScale, '#ef4444', `W₂=${w2.toFixed(1)}N`);
      }
    }

    // =========================================================================
    // CONFIGURATION 2: 1 FIXED + 1 MOVABLE PULLEY (VR = 2)
    // =========================================================================
    else if (pulleyCount === 2) {
      const anchorX = 210;
      const fixedX = 270;
      const fixedY = 60;
      const R = 20;

      const movableX = 230;
      const movableY = 115 - loadDisplacement;
      const effortX = fixedX + R; // 290

      // Ceiling anchor eyelet
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(anchorX, ceilingY + 3, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Continuous Rope
      ctx.beginPath();
      ctx.moveTo(anchorX, ceilingY + 3);
      ctx.lineTo(anchorX, movableY);
      ctx.arc(movableX, movableY, R, Math.PI, 0, true); // loops under
      ctx.lineTo(fixedX - R, fixedY);
      ctx.arc(fixedX, fixedY, R, Math.PI, 0, false); // loops over
      ctx.lineTo(effortX, effortY);
      ctx.stroke();

      // Movable pulley frame & hanger to Load
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(movableX, movableY);
      ctx.lineTo(movableX, movableY + R + 8);
      ctx.stroke();

      // Draw Pulleys
      drawPulleyWheel(fixedX, fixedY, R, pulleyRotation, true);
      drawPulleyWheel(movableX, movableY, R, -pulleyRotation / 2, false);

      // Draw Masses
      const b1 = drawBlock(movableX, movableY + R + 12, m1, 'load');
      const b2 = drawBlock(effortX, effortY, m2, 'effort');

      // Vectors
      if (showVectors) {
        const vScale = 1.3;
        drawVectorArrow(anchorX, movableY, anchorX, movableY - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);
        drawVectorArrow(movableX + R, movableY, movableX + R, movableY - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);
        drawVectorArrow(effortX, b2.y, effortX, b2.y - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);

        const w1 = m1 * g;
        drawVectorArrow(movableX, b1.y + b1.size, movableX, b1.y + b1.size + w1 * vScale, '#ef4444', `W₁=${w1.toFixed(1)}N`);
        const w2 = m2 * g;
        drawVectorArrow(effortX, b2.y + b2.size, effortX, b2.y + b2.size + w2 * vScale, '#ef4444', `W₂=${w2.toFixed(1)}N`);
      }
    }

    // =========================================================================
    // CONFIGURATION 3: 2 FIXED + 1 MOVABLE PULLEY BLOCK & TACKLE (VR = 3)
    // =========================================================================
    else if (pulleyCount === 3) {
      const R = 18;
      const fixed1X = 195; // Tangents: 177, 213
      const fixed2X = 267; // Tangents: 249, 285
      const fixedY = 60;

      const movableX = 231; // Tangents: 213, 249
      const movableY = 115 - loadDisplacement;
      const anchorLugX = fixed1X - R; // 177 on movable block frame
      const effortX = fixed2X + R; // 285

      // Rigid movable pulley bracket spanning from 177 to 249
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(anchorLugX - 4, movableY - 14, 28, 6, 2);
      ctx.fill();

      // Bracket arm connecting to axle and lower hook
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(anchorLugX, movableY - 10);
      ctx.lineTo(movableX, movableY);
      ctx.lineTo(movableX, movableY + R + 8);
      ctx.stroke();

      // Continuous 3-Strand Rope
      ctx.beginPath();
      ctx.moveTo(anchorLugX, movableY - 14);
      ctx.lineTo(anchorLugX, fixedY);
      ctx.arc(fixed1X, fixedY, R, Math.PI, 0, false); // over Pulley 1
      ctx.lineTo(movableX - R, movableY);
      ctx.arc(movableX, movableY, R, Math.PI, 0, true); // under Movable Pulley
      ctx.lineTo(fixed2X - R, fixedY);
      ctx.arc(fixed2X, fixedY, R, Math.PI, 0, false); // over Pulley 2
      ctx.lineTo(effortX, effortY);
      ctx.stroke();

      // Draw Pulley Wheels
      drawPulleyWheel(fixed1X, fixedY, R, pulleyRotation, true);
      drawPulleyWheel(fixed2X, fixedY, R, pulleyRotation, true);
      drawPulleyWheel(movableX, movableY, R, -pulleyRotation / 3, false);

      // Draw Masses
      const b1 = drawBlock(movableX, movableY + R + 12, m1, 'load');
      const b2 = drawBlock(effortX, effortY, m2, 'effort');

      // Vectors
      if (showVectors) {
        const vScale = 1.3;
        drawVectorArrow(anchorLugX, movableY - 14, anchorLugX, movableY - 14 - tension * vScale, '#f59e0b', `T`);
        drawVectorArrow(movableX - R, movableY, movableX - R, movableY - tension * vScale, '#f59e0b', `T`);
        drawVectorArrow(movableX + R, movableY, movableX + R, movableY - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);
        drawVectorArrow(effortX, b2.y, effortX, b2.y - tension * vScale, '#f59e0b', `T=${tension.toFixed(1)}N`);

        const w1 = m1 * g;
        drawVectorArrow(movableX, b1.y + b1.size, movableX, b1.y + b1.size + w1 * vScale, '#ef4444', `W₁=${w1.toFixed(1)}N`);
        const w2 = m2 * g;
        drawVectorArrow(effortX, b2.y + b2.size, effortX, b2.y + b2.size + w2 * vScale, '#ef4444', `W₂=${w2.toFixed(1)}N`);
      }
    }

    // System Status Badge overlay on Canvas
    ctx.fillStyle = isEquilibrium ? '#10b981' : (accelEffortSigned > 0 ? '#3b82f6' : '#f59e0b');
    ctx.beginPath();
    ctx.arc(24, 296, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    const statusText = isEquilibrium 
      ? t.stateEquilibrium 
      : (accelEffortSigned > 0 ? t.stateEffortLifting : t.stateLoadDropping);
    ctx.fillText(statusText, 36, 300);

  }, [pulleyCount, effortOffset, m1, m2, g, showVectors, tension, pulleyRotation, isEquilibrium, accelEffortSigned, t]);

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'pulleys_sim',
    simulationTitle: 'Pulley Systems & Mechanical Advantage',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'pulleyCount', label: 'Pulleys (n)', unit: '' },
      { key: 'velocityRatio', label: 'Velocity Ratio (VR)', unit: '' },
      { key: 'mass1', label: 'Load Mass m₁', unit: 'kg' },
      { key: 'mass2', label: 'Effort Mass m₂', unit: 'kg' },
      { key: 'massDiff', label: 'Net Driving (nm₂ - m₁)', unit: 'kg' },
      { key: 'acceleration', label: 'Effort Accel a₂', unit: 'm/s²' },
      { key: 'accelLoad', label: 'Load Accel a₁', unit: 'm/s²' },
      { key: 'tension', label: 'String Tension T', unit: 'N' },
      { key: 'gravity', label: 'Gravity g', unit: 'm/s²' },
    ],
    getCurrentRow: () => {
      return {
        pulleyCount,
        velocityRatio: n,
        mass1: m1,
        mass2: m2,
        massDiff: parseFloat((n * m2 - m1).toFixed(2)),
        acceleration: parseFloat(accelEffort.toFixed(2)),
        accelLoad: parseFloat(accelLoad.toFixed(2)),
        tension: parseFloat(tension.toFixed(2)),
        gravity: g,
      };
    },
    getSeriesData: () => {
      const m2Vals = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 7.0];
      return m2Vals.map((effortMass, idx) => {
        const d = m1 + n * n * effortMass;
        const net = n * n * effortMass - n * m1;
        const aEffort = d > 0 ? (Math.abs(net) * g) / d : 0;
        const aLoad = aEffort / n;
        const tVal = d > 0 ? ((n + 1) * m1 * effortMass * g) / d : 0;
        return {
          trial: idx + 1,
          pulleyCount,
          velocityRatio: n,
          mass1: m1,
          mass2: effortMass,
          massDiff: parseFloat((n * effortMass - m1).toFixed(2)),
          acceleration: parseFloat(aEffort.toFixed(2)),
          accelLoad: parseFloat(aLoad.toFixed(2)),
          tension: parseFloat(tVal.toFixed(2)),
          gravity: g,
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Effort m₂ = 2.0 kg', params: { m2: 2.0 }, durationMs: 700 },
        { label: 'Effort m₂ = 3.0 kg', params: { m2: 3.0 }, durationMs: 700 },
        { label: 'Effort m₂ = 4.0 kg', params: { m2: 4.0 }, durationMs: 700 },
        { label: 'Effort m₂ = 5.0 kg', params: { m2: 5.0 }, durationMs: 700 },
        { label: 'Effort m₂ = 6.0 kg', params: { m2: 6.0 }, durationMs: 700 },
      ],
      applyParams: (p) => {
        if (p.m2 !== undefined) {
          setM2(p.m2);
          handleReset();
        }
      },
    },
    defaultGraphConfig: {
      xAxis: 'massDiff',
      yAxis: 'acceleration',
      title: 'Pulley Dynamics: a vs (nm₂ - m₁)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Number of Pulleys': `${pulleyCount}`,
      'Velocity Ratio (VR)': `${velocityRatio}`,
      'Ideal Mechanical Advantage (IMA)': `${idealMechanicalAdvantage}`,
      'Load Mass (m₁)': `${m1} kg`,
      'Effort Mass (m₂)': `${m2} kg`,
      'Equilibrium Effort': `${equilibriumEffort.toFixed(2)} kg`,
      'Effort Acceleration (a₂)': `${accelEffort.toFixed(2)} m/s²`,
      'Load Acceleration (a₁)': `${accelLoad.toFixed(2)} m/s²`,
      'String Tension (T)': `${tension.toFixed(2)} N`,
      'Total Support Force (n·T)': `${totalUpwardForce.toFixed(2)} N`
    };
    downloadReportAsPDF('Pulley Systems Mechanical Advantage Report', reportParams, recorder.recordedRows, labNotes);
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

          {/* 1. Pulley Count Selector (Up to 3 Pulleys) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.pulleyCount}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([1, 2, 3] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handlePulleyCountChange(cnt)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                    pulleyCount === cnt
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 font-medium'
                  }`}
                >
                  <div className="text-xs font-black">
                    {cnt === 1 ? t.pulley1 : cnt === 2 ? t.pulley2 : t.pulley3}
                  </div>
                  <div className="text-[10px] opacity-75 font-mono">VR = {cnt}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {pulleyCount === 1 ? t.pulley1Sub : pulleyCount === 2 ? t.pulley2Sub : t.pulley3Sub}
            </p>
          </div>

          {/* Load Mass m1 */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.mass1}</span>
              <span className="text-blue-600 font-mono font-bold">{m1.toFixed(1)} kg</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={m1}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM1(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
            />
          </div>

          {/* Effort Mass m2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold items-center">
              <span className="text-slate-600">{t.mass2}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetEquilibrium}
                  className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 transition-all font-mono font-bold cursor-pointer"
                  title="Auto-set m2 to balance the load in equilibrium"
                >
                  Balance ({equilibriumEffort.toFixed(1)}kg)
                </button>
                <span className="text-emerald-600 font-mono font-bold">{m2.toFixed(1)} kg</span>
              </div>
            </div>
            <input
              type="range" min="0.5" max="15" step="0.5" value={m2}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setM2(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-40"
            />
          </div>

          {/* Gravity slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-slate-700 font-mono font-bold">{g.toFixed(1)} m/s²</span>
            </div>
            <input
              type="range" min="1" max="25" step="0.1" value={g}
              disabled={recorder.isAutoRunning}
              onChange={(e) => { setG(parseFloat(e.target.value)); handleReset(); }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600 disabled:opacity-40"
            />
          </div>

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-pulley" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-pulley" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.vr}</span>
              <span className="font-extrabold text-blue-700 text-sm">{velocityRatio}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.ima}</span>
              <span className="font-extrabold text-indigo-700 text-sm">{idealMechanicalAdvantage}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 col-span-2">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.eqEffort}</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {equilibriumEffort.toFixed(2)} kg <span className="text-[10px] text-slate-400 font-normal">({(equilibriumEffort * g).toFixed(1)} N)</span>
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.accelEffort}</span>
              <span className="font-extrabold text-slate-800 text-sm">{accelEffort.toFixed(2)} m/s²</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.accelLoad}</span>
              <span className="font-extrabold text-slate-800 text-sm">{accelLoad.toFixed(2)} m/s²</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.tension}</span>
              <span className="font-extrabold text-amber-700 text-sm">{tension.toFixed(2)} N</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">{t.supportForce}</span>
              <span className="font-extrabold text-blue-800 text-sm">{totalUpwardForce.toFixed(2)} N</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.title}</span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {pulleyCount === 1 ? 'n = 1 (Atwood)' : pulleyCount === 2 ? 'n = 2 (Movable)' : 'n = 3 (Block & Tackle)'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              VR: <strong className="text-blue-700">{velocityRatio}</strong> • IMA: <strong className="text-indigo-700">{idealMechanicalAdvantage}</strong>
            </span>
          </div>

          <div className="w-full min-h-[340px] flex-1 flex items-center justify-center p-3 bg-white rounded-xl">
            <canvas ref={canvasRef} className="border border-slate-200/80 rounded-xl bg-white shadow-2xs" />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-3.5 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-white ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t.pause : t.play}</span>
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset simulation positions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">
                a₂: <strong className="text-slate-800">{accelEffort.toFixed(2)} m/s²</strong>
              </span>
              <span className="text-slate-500">
                T: <strong className="text-amber-700">{tension.toFixed(2)} N</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={pulleySystemsGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ mass1: m1, mass2: m2, gravity: g, pulleyCount }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={260}
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
            placeholder="Record your observations on mechanical advantage, velocity ratio, and dynamic tensions across 1, 2, and 3 pulleys..."
            className="w-full flex-1 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 resize-none font-sans min-h-[80px]"
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
