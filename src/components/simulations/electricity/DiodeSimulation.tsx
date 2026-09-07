import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Activity } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { diodeGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_SIMULATION_LAB_BAR, ENABLE_DIODE_AC_RECTIFIER } from '../../../config/features';

type DiodeType = 'silicon' | 'germanium' | 'led_red' | 'led_green' | 'led_blue' | 'zener';
type CircuitMode = 'dc_characterization' | 'ac_rectifier' | 'pn_microscopic';

interface DiodeSpec {
  name: string;
  kneeVoltage: number;
  reverseBreakdown: number;
  leakageCurrentUA: number;
  color: string;
  glowColor?: string;
  wavelengthNm?: number;
  description: string;
}

const DIODE_SPECS: Record<DiodeType, DiodeSpec> = {
  silicon: {
    name: 'Silicon (Si) Diode',
    kneeVoltage: 0.7,
    reverseBreakdown: 50.0,
    leakageCurrentUA: 0.01,
    color: '#3b82f6', // Blue
    description: 'Standard Silicon P-N junction with 0.7V threshold barrier potential.',
  },
  germanium: {
    name: 'Germanium (Ge) Diode',
    kneeVoltage: 0.3,
    reverseBreakdown: 30.0,
    leakageCurrentUA: 15.0,
    color: '#f59e0b', // Amber
    description: 'Lower 0.3V barrier threshold, higher reverse leakage saturation.',
  },
  led_red: {
    name: 'Red LED (GaP/GaAsP)',
    kneeVoltage: 1.8,
    reverseBreakdown: 5.0,
    leakageCurrentUA: 0.05,
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.85)',
    wavelengthNm: 660,
    description: 'Emits 660 nm red photons upon electron-hole radiative recombination.',
  },
  led_green: {
    name: 'Green LED (GaP)',
    kneeVoltage: 2.2,
    reverseBreakdown: 5.0,
    leakageCurrentUA: 0.05,
    color: '#10b981', // Green
    glowColor: 'rgba(16, 185, 129, 0.85)',
    wavelengthNm: 525,
    description: 'Bandgap ~2.35 eV emitting 525 nm green photon radiation.',
  },
  led_blue: {
    name: 'Blue LED (InGaN)',
    kneeVoltage: 3.0,
    reverseBreakdown: 5.0,
    leakageCurrentUA: 0.05,
    color: '#06b6d4', // Cyan/Blue
    glowColor: 'rgba(6, 182, 212, 0.85)',
    wavelengthNm: 470,
    description: 'Wide bandgap InGaN emitter with 3.0V forward conduction.',
  },
  zener: {
    name: 'Zener Diode (5.6V)',
    kneeVoltage: 0.7,
    reverseBreakdown: 5.6,
    leakageCurrentUA: 0.1,
    color: '#8b5cf6', // Purple
    description: 'Heavily doped junction exhibiting stable reverse Zener breakdown at 5.6V.',
  },
};

export function DiodeSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: ENABLE_DIODE_AC_RECTIFIER ? 'Semiconductor P-N Diode & Rectifier Lab' : 'Semiconductor P-N Diode Lab',
      subtitle: ENABLE_DIODE_AC_RECTIFIER
        ? 'I-V Characteristics, Forward/Reverse Bias, LEDs, and Rectification'
        : 'I-V Characteristics, Forward/Reverse Bias, LEDs, and Zener Breakdown',
      paramsTitle: 'Diode & Circuit Parameters',
      modeTitle: 'Simulation Mode',
      modeDC: 'DC Circuit (I-V Curve)',
      modeAC: 'AC Rectifier (Oscilloscope)',
      modePN: 'Microscopic P-N Junction',
      diodeSelect: 'Diode Semiconductor Material',
      voltageDC: 'DC Supply Voltage (Vs)',
      voltageAC: 'AC Peak Voltage (Vm)',
      frequency: 'AC Frequency (f)',
      resistance: 'Current-Limiting Resistor (Rs)',
      filterCapacitor: 'Smoothing Filter Capacitor (C)',
      capNone: 'None (Raw Rectification)',
      cap10uF: '10 µF (Light Filter)',
      cap100uF: '100 µF (Heavy Smoothing)',
      reversePolarity: 'Reverse DC Source Polarity',
      showLabels: 'Show Multimeter Measurements',
      play: 'Animate Flow',
      pause: 'Pause',
      reset: 'Reset Default',
      meterReadings: 'Digital Multimeter Readings',
      diodeVoltage: 'Diode Voltage (VD)',
      diodeCurrent: 'Circuit Current (ID)',
      resistorVoltage: 'Resistor Voltage (VR)',
      dynamicRes: 'Dynamic Resistance (rd)',
      powerDissipated: 'Power Dissipation (PD)',
      conductionState: 'Conduction State',
      forwardConducting: 'Forward Conducting (ON)',
      forwardSubThreshold: 'Forward Sub-Threshold',
      reverseBlocked: 'Reverse Biased (OFF)',
      zenerBreakdown: 'Zener Breakdown Active',
      labNotes: 'Laboratory Observations Notebook',
      downloadPDF: 'Download Practical Report (PDF)',
    },
    si: {
      title: ENABLE_DIODE_AC_RECTIFIER ? 'අර්ධසන්නායක P-N ඩයෝඩ සහ සෘජුකාරක පරීක්ෂණාගාරය' : 'අර්ධසන්නායක P-N ඩයෝඩ පරීක්ෂණාගාරය',
      subtitle: ENABLE_DIODE_AC_RECTIFIER
        ? 'I-V ලාක්ෂණික වක්‍ර, පෙර/පසු නැඹුරුව, ආලෝක විමෝචක ඩයෝඩ සහ සෘජුකරණය'
        : 'I-V ලාක්ෂණික වක්‍ර, පෙර/පසු නැඹුරුව, ආලෝක විමෝචක ඩයෝඩ සහ සීනර් බිඳවැටීම',
      paramsTitle: 'ඩයෝඩ හා පරිපථ පරාමිතීන්',
      modeTitle: 'අනුකරණ ආකාරය',
      modeDC: 'DC පරිපථය (I-V වක්‍රය)',
      modeAC: 'AC සෘජුකාරකය (ඔසිලෝස්කෝප්)',
      modePN: 'P-N සන්ධි අන්වීක්ෂීය දසුන',
      diodeSelect: 'අර්ධසන්නායක ද්‍රව්‍ය වර්ගය',
      voltageDC: 'DC ප්‍රභව විභවය (Vs)',
      voltageAC: 'AC උපරිම විභවය (Vm)',
      frequency: 'AC සංඛ්‍යාතය (f)',
      resistance: 'ධාරා සීමාකාරී ප්‍රතිරෝධය (Rs)',
      filterCapacitor: 'සුමටන ධාරිත්‍රකය (C)',
      capNone: 'නැත (අර්ධ තරංග සෘජුකරණය)',
      cap10uF: '10 µF (මධ්‍යම සුමටනය)',
      cap100uF: '100 µF (උසස් සුමටනය)',
      reversePolarity: 'ප්‍රභව ධ්‍රැවීයතාව ආපසු හරවන්න',
      showLabels: 'ඩිජිටල් මීටර් අගයන් පෙන්වන්න',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      meterReadings: 'ඩිජිටල් බහුමීටර් මිනුම්',
      diodeVoltage: 'ඩයෝඩ හරහා විභවය (VD)',
      diodeCurrent: 'පරිපථ ධාරාව (ID)',
      resistorVoltage: 'ප්‍රතිරෝධකය හරහා විභවය (VR)',
      dynamicRes: 'ගතික ප්‍රතිරෝධය (rd)',
      powerDissipated: 'වියයවන ජවය (PD)',
      conductionState: 'සන්නායක තත්ත්වය',
      forwardConducting: 'පෙර නැඹුරු සන්නායක (ON)',
      forwardSubThreshold: 'පෙර නැඹුරු සීමාවට පෙර',
      reverseBlocked: 'පසු නැඹුරු අවහිර (OFF)',
      zenerBreakdown: 'සීනර් බිඳවැටීම සක්‍රීයයි',
      labNotes: 'පරීක්ෂණාගාර නිරීක්ෂණ සටහන්',
      downloadPDF: 'වාර්තාව බාගත කරන්න (PDF)',
    },
    ta: {
      title: ENABLE_DIODE_AC_RECTIFIER ? 'குறைக்கடத்தி P-N இருமுனையம் & திருத்தி ஆய்வகம்' : 'குறைக்கடத்தி P-N இருமுனைய ஆய்வகம்',
      subtitle: ENABLE_DIODE_AC_RECTIFIER
        ? 'I-V சிறப்பியல்பு வரைபடம், முன்னோக்கு/பின்னோக்குக் கோடல் மற்றும் திருத்தம்'
        : 'I-V சிறப்பியல்பு வரைபடம், முன்னோக்கு/பின்னோக்குக் கோடல் மற்றும் ஜெனர் முறிவு',
      paramsTitle: 'இருமுனைய & சுற்று அளவுருக்கள்',
      modeTitle: 'உருவகப்படுத்துதல் முறை',
      modeDC: 'DC சுற்று (I-V சிறப்பியல்பு)',
      modeAC: 'AC திருத்தி (அலைக்காட்டி)',
      modePN: 'P-N சந்தி நுண்நோக்குக் காட்சி',
      diodeSelect: 'குறைக்கடத்திப் பொருள் வகை',
      voltageDC: 'DC மூல மின்னழுத்தம் (Vs)',
      voltageAC: 'AC உச்ச மின்னழுத்தம் (Vm)',
      frequency: 'AC அதிர்வெண் (f)',
      resistance: 'மின்னோட்டக் கட்டுப்படுத்து மின்தடை (Rs)',
      filterCapacitor: 'மின்தேக்கி வடிப்பான் (C)',
      capNone: 'இல்லை (நேரடி திருத்தம்)',
      cap10uF: '10 µF (மெல்லிய வடிப்பான்)',
      cap100uF: '100 µF (முழுமையான வடிப்பான்)',
      reversePolarity: 'முனைவை மாற்றுக',
      showLabels: 'அளவீட்டு லேபிள்களைக் காட்டு',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      meterReadings: 'டிஜிட்டல் அளவீடுகள்',
      diodeVoltage: 'இருமுனைய மின்னழுத்தம் (VD)',
      diodeCurrent: 'சுற்று மின்னோட்டம் (ID)',
      resistorVoltage: 'மின்தடை மின்னழுத்தம் (VR)',
      dynamicRes: 'இயங்கு மின்தடை (rd)',
      powerDissipated: 'ஆற்றல் விரயம் (PD)',
      conductionState: 'கடத்துகை நிலை',
      forwardConducting: 'முன்னோக்கு கடத்துகை (ON)',
      forwardSubThreshold: 'தொடக்க நிலைக்கு கீழ்',
      reverseBlocked: 'பின்னோக்குத் தடை (OFF)',
      zenerBreakdown: 'சீனர் முறிவு நிலை',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      downloadPDF: 'PDF அறிக்கையைப் பதிவிறக்கு',
    },
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Interactive State
  const [diodeType, setDiodeType] = useState<DiodeType>('silicon');
  const [circuitMode, setCircuitMode] = useState<CircuitMode>('dc_characterization');
  const [sourceV, setSourceV] = useState<number>(3.0); // 0V to 10V DC
  const [acPeakV, setAcPeakV] = useState<number>(6.0); // 1V to 15V AC
  const [acFreq, setAcFreq] = useState<number>(2.0); // 0.5Hz to 5Hz for visualization
  const [seriesR, setSeriesR] = useState<number>(220); // 50 to 1000 ohms
  const [filterCap, setFilterCap] = useState<'none' | '10uF' | '100uF'>('none');
  const [reversePolarity, setReversePolarity] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [labNotes, setLabNotes] = useState<string>('');

  const [chargeOffset, setChargeOffset] = useState<number>(0);
  const [acTime, setAcTime] = useState<number>(0);

  useEffect(() => {
    if (!ENABLE_DIODE_AC_RECTIFIER && circuitMode === 'ac_rectifier') {
      setCircuitMode('dc_characterization');
    }
  }, [circuitMode]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spec = DIODE_SPECS[diodeType];

  // Effective DC input voltage taking polarity toggle into account
  const effectiveVs = reversePolarity ? -Math.abs(sourceV) : sourceV;

  // Exact Electrical Physics Calculations
  const knee = spec.kneeVoltage;
  const isZener = diodeType === 'zener';
  const zenerV = spec.reverseBreakdown;

  // Diode I-V Solver
  let calculatedID_mA = 0;
  let calculatedVD = 0;
  let conductionState: 'forward_on' | 'forward_sub' | 'reverse_off' | 'zener_breakdown' = 'reverse_off';

  if (effectiveVs >= knee) {
    // Forward bias above knee: current limited primarily by external series resistor Rs + internal diode bulk resistance
    const rBulk = 1.5; // Small internal bulk ohmic resistance (Ohms)
    calculatedID_mA = ((effectiveVs - knee) / (seriesR + rBulk)) * 1000;
    calculatedVD = knee + (calculatedID_mA / 1000) * rBulk;
    conductionState = 'forward_on';
  } else if (effectiveVs > 0) {
    // Forward bias below knee: exponential Shockley diode curve
    const expFactor = (effectiveVs / knee) * 4.5;
    calculatedID_mA = 0.02 * (Math.exp(expFactor) - 1);
    calculatedVD = effectiveVs - (calculatedID_mA / 1000) * seriesR;
    conductionState = 'forward_sub';
  } else if (isZener && effectiveVs <= -zenerV) {
    // Reverse Zener breakdown
    const zenerOver = -effectiveVs - zenerV;
    calculatedID_mA = -(zenerOver / (seriesR + 2.0)) * 1000;
    calculatedVD = -zenerV;
    conductionState = 'zener_breakdown';
  } else {
    // Reverse bias (OFF)
    calculatedID_mA = -spec.leakageCurrentUA / 1000;
    calculatedVD = effectiveVs;
    conductionState = 'reverse_off';
  }

  const calculatedVR = effectiveVs - calculatedVD;
  const powerDissipated_mW = Math.abs(calculatedVD * calculatedID_mA);
  const dynamicResistance_ohms =
    conductionState === 'forward_on' ? (26 / Math.max(0.1, calculatedID_mA)) + 1.5 : 999999;

  // Animation Loop for charge flow and AC oscillations
  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    let lastT = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;

      // Charge speed proportional to current magnitude
      const speed = Math.min(60, Math.abs(calculatedID_mA) * 2.5);
      setChargeOffset((prev) => (prev + speed * dt * 8) % 60);

      // AC time progression
      setAcTime((prev) => prev + dt);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, calculatedID_mA]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 560;
    const height = 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (circuitMode === 'dc_characterization') {
      renderDCCircuit(ctx, width, height);
    } else if (ENABLE_DIODE_AC_RECTIFIER && circuitMode === 'ac_rectifier') {
      renderACRectifier(ctx, width, height);
    } else {
      renderMicroscopicPN(ctx, width, height);
    }
  }, [
    circuitMode,
    diodeType,
    effectiveVs,
    calculatedID_mA,
    calculatedVD,
    calculatedVR,
    seriesR,
    showLabels,
    chargeOffset,
    acTime,
    acPeakV,
    acFreq,
    filterCap,
  ]);

  // Mode 1: DC Circuit Renderer
  const renderDCCircuit = (ctx: CanvasRenderingContext2D, _width: number, _height: number) => {
    const leftX = 80;
    const rightX = 480;
    const topY = 60;
    const bottomY = 240;

    // 1. Wires loop
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(leftX, topY, rightX - leftX, bottomY - topY, 12);
    ctx.stroke();

    // 2. Battery DC Source on left
    const batX = leftX;
    const batY = (topY + bottomY) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(batX - 16, batY - 24, 32, 48);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    const isForward = effectiveVs >= 0;
    // Upper and lower plates
    ctx.beginPath();
    if (isForward) {
      // Long plate (+) on top
      ctx.moveTo(batX - 14, batY - 10); ctx.lineTo(batX + 14, batY - 10);
      // Short plate (-) on bottom
      ctx.moveTo(batX - 7, batY + 10); ctx.lineTo(batX + 7, batY + 10);
    } else {
      // Reversed
      ctx.moveTo(batX - 7, batY - 10); ctx.lineTo(batX + 7, batY - 10);
      ctx.moveTo(batX - 14, batY + 10); ctx.lineTo(batX + 14, batY + 10);
    }
    ctx.stroke();

    // Battery Polarity Marks
    ctx.font = 'bold 11px font-sans';
    ctx.fillStyle = isForward ? '#ef4444' : '#3b82f6';
    ctx.fillText(isForward ? '+' : '−', batX + 18, batY - 8);
    ctx.fillStyle = isForward ? '#3b82f6' : '#ef4444';
    ctx.fillText(isForward ? '−' : '+', batX + 18, batY + 14);

    if (showLabels) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px font-mono';
      ctx.textAlign = 'right';
      ctx.fillText(`Vs = ${effectiveVs.toFixed(1)} V`, batX - 22, batY + 4);
    }

    // 3. Series Resistor on top wire
    const resX = (leftX + rightX) / 2 - 60;
    const resY = topY;
    const resW = 44;
    const resH = 20;

    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(resX - resW / 2, resY - resH / 2, resW, resH);
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px font-mono';
      ctx.textAlign = 'center';
      ctx.fillText(`R = ${seriesR} Ω`, resX, resY - 15);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`VR: ${calculatedVR.toFixed(2)} V`, resX, resY + 24);
    }

    // 4. Diode Symbol on bottom wire
    const diodeX = (leftX + rightX) / 2 + 50;
    const diodeY = bottomY;

    // Clear background for diode
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(diodeX - 35, diodeY - 25, 70, 50);

    // Diode triangle & bar
    const dSize = 16;
    ctx.fillStyle = spec.color;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;

    // Triangle pointing right (Anode to Cathode)
    ctx.beginPath();
    ctx.moveTo(diodeX - dSize, diodeY - dSize);
    ctx.lineTo(diodeX + dSize, diodeY);
    ctx.lineTo(diodeX - dSize, diodeY + dSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cathode vertical bar
    ctx.beginPath();
    ctx.moveTo(diodeX + dSize, diodeY - dSize - 2);
    ctx.lineTo(diodeX + dSize, diodeY + dSize + 2);
    if (isZener) {
      // Zener bent wings
      ctx.moveTo(diodeX + dSize, diodeY - dSize - 2);
      ctx.lineTo(diodeX + dSize - 5, diodeY - dSize - 2);
      ctx.moveTo(diodeX + dSize, diodeY + dSize + 2);
      ctx.lineTo(diodeX + dSize + 5, diodeY + dSize + 2);
    }
    ctx.stroke();

    // LED Glow and photon emission arrows if forward conducting
    if (spec.glowColor && conductionState === 'forward_on') {
      // Halo Glow
      const glowGrad = ctx.createRadialGradient(diodeX, diodeY, 5, diodeX, diodeY, 45);
      glowGrad.addColorStop(0, spec.glowColor);
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(diodeX, diodeY, 45, 0, 2 * Math.PI);
      ctx.fill();

      // Radiating light arrows
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = 2;
      for (let a = 0; a < 2; a++) {
        const ax = diodeX + (a * 10) - 2;
        const ay = diodeY - dSize - 6 - (a * 6);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 10, ay - 10);
        ctx.lineTo(ax + 5, ay - 10);
        ctx.moveTo(ax + 10, ay - 10);
        ctx.lineTo(ax + 10, ay - 5);
        ctx.stroke();
      }
    }

    if (showLabels) {
      ctx.fillStyle = spec.color;
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(spec.name, diodeX, diodeY + 32);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 9px font-mono';
      ctx.fillText(`VD: ${calculatedVD.toFixed(3)} V`, diodeX, diodeY - 26);
    }

    // 5. Digital Ammeter on right wire
    const amX = rightX;
    const amY = (topY + bottomY) / 2;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(amX, amY, 17, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px font-sans';
    ctx.textAlign = 'center';
    ctx.fillText('A', amX, amY + 4);

    if (showLabels) {
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 10px font-mono';
      ctx.textAlign = 'left';
      ctx.fillText(`I = ${calculatedID_mA.toFixed(2)} mA`, amX + 24, amY + 4);
    }

    // 6. Charge Flow Particles
    if (Math.abs(calculatedID_mA) > 0.05) {
      ctx.fillStyle = effectiveVs >= 0 ? '#3b82f6' : '#ef4444';
      const perimeter = 2 * (rightX - leftX) + 2 * (bottomY - topY);
      const dotCount = 18;

      for (let i = 0; i < dotCount; i++) {
        const dist = ((i / dotCount) * perimeter + chargeOffset) % perimeter;
        let px = leftX;
        let py = topY;

        const segTop = rightX - leftX;
        const segRight = bottomY - topY;
        const segBottom = rightX - leftX;

        if (dist < segTop) {
          px = leftX + dist;
          py = topY;
        } else if (dist < segTop + segRight) {
          px = rightX;
          py = topY + (dist - segTop);
        } else if (dist < segTop + segRight + segBottom) {
          px = rightX - (dist - segTop - segRight);
          py = bottomY;
        } else {
          px = leftX;
          py = bottomY - (dist - segTop - segRight - segBottom);
        }

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // Mode 2: AC Rectifier & Oscilloscope Dual Trace
  const renderACRectifier = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Oscilloscope Screen Backdrop
    ctx.fillStyle = '#0f172a'; // Slate-900
    ctx.fillRect(10, 10, width - 20, height - 20);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const midY1 = 80;
    const midY2 = 210;

    for (let x = 20; x < width - 20; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 20); ctx.lineTo(x, height - 20);
      ctx.stroke();
    }
    for (let y = 20; y < height - 20; y += 30) {
      ctx.beginPath();
      ctx.moveTo(20, y); ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Zero-axis references
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, midY1); ctx.lineTo(width - 20, midY1);
    ctx.moveTo(20, midY2); ctx.lineTo(width - 20, midY2);
    ctx.stroke();

    // Trace 1: Input Sinusoidal AC Voltage (Cyan)
    ctx.strokeStyle = '#06b6d4'; // Cyan-500
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const scaleY = 3.5;
    const numPoints = width - 60;

    for (let i = 0; i < numPoints; i++) {
      const x = 30 + i;
      const tSec = (i / 100) - acTime * (acFreq * 0.8);
      const vIn = acPeakV * Math.sin(2 * Math.PI * acFreq * tSec);
      const y = midY1 - vIn * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Trace 2: Rectified Output Voltage across Load (Amber / Emerald)
    ctx.strokeStyle = filterCap === 'none' ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    // Capacitor time constant
    const tau = filterCap === '100uF' ? 0.35 : filterCap === '10uF' ? 0.08 : 0.0001;
    let vCap = 0;

    for (let i = 0; i < numPoints; i++) {
      const x = 30 + i;
      const tSec = (i / 100) - acTime * (acFreq * 0.8);
      const vIn = acPeakV * Math.sin(2 * Math.PI * acFreq * tSec);
      const vHalf = Math.max(0, vIn - knee);

      if (filterCap === 'none') {
        const y = midY2 - vHalf * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      } else {
        // Discrete diode peak detector with RC exponential discharge
        if (vHalf > vCap) {
          vCap = vHalf;
        } else {
          vCap = vCap * Math.exp(-0.01 / tau);
        }
        const y = midY2 - vCap * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Legend & Diagnostics on Scope
    ctx.font = 'bold 11px font-mono';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`CH1: AC Input Vin (Peak: ${acPeakV.toFixed(1)}V, ${acFreq}Hz)`, 30, 35);

    ctx.fillStyle = filterCap === 'none' ? '#f59e0b' : '#10b981';
    ctx.fillText(
      `CH2: Rectified Vout (Knee Drop: -${knee}V, Filter: ${filterCap})`,
      30,
      165
    );
  };

  // Mode 3: Microscopic P-N Junction Carrier Dynamics
  const renderMicroscopicPN = (ctx: CanvasRenderingContext2D, width: number, _height: number) => {
    const pWidth = (width - 60) / 2;
    const nWidth = pWidth;
    const startX = 30;
    const boxY = 45;
    const boxH = 150;
    const junctionX = startX + pWidth;

    // Depletion layer width dynamically varies with voltage
    let depletionWidth = 35;
    if (effectiveVs >= knee) {
      depletionWidth = Math.max(4, 35 - ((effectiveVs - knee) / 2) * 25);
    } else if (effectiveVs > 0) {
      depletionWidth = 35 - (effectiveVs / knee) * 20;
    } else {
      depletionWidth = Math.min(85, 35 + Math.abs(effectiveVs) * 5);
    }

    // P-Region Backdrop (Pinkish)
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(startX, boxY, pWidth, boxH);

    // N-Region Backdrop (Light Blue)
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(junctionX, boxY, nWidth, boxH);

    // Depletion Region Backdrop (Light Slate Gray)
    const depLeft = junctionX - depletionWidth;
    const depRight = junctionX + depletionWidth;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(depLeft, boxY, depRight - depLeft, boxH);

    // Borders
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(startX, boxY, width - 60, boxH);

    // Junction center dividing line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(junctionX, boxY); ctx.lineTo(junctionX, boxY + boxH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Fixed Ions in Depletion Layer
    // In P-side of depletion: fixed negative acceptor ions (-)
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px font-mono';
    ctx.textAlign = 'center';
    for (let y = boxY + 25; y < boxY + boxH - 10; y += 30) {
      for (let x = depLeft + 10; x < junctionX - 4; x += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#fca5a5';
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#b91c1c';
        ctx.fillText('−', x, y + 4);
      }
    }

    // In N-side of depletion: fixed positive donor ions (+)
    for (let y = boxY + 25; y < boxY + boxH - 10; y += 30) {
      for (let x = junctionX + 12; x < depRight - 4; x += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#bae6fd';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#0369a1';
        ctx.fillText('+', x, y + 4);
      }
    }

    // P-Region Mobile Holes (Circles)
    ctx.fillStyle = '#dc2626';
    for (let x = startX + 15; x < depLeft - 10; x += 24) {
      for (let y = boxY + 20; y < boxY + boxH - 15; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px font-mono';
        ctx.fillText('h+', x, y + 3);
      }
    }

    // N-Region Mobile Electrons (Solid Dots)
    for (let x = depRight + 15; x < startX + 2 * pWidth - 15; x += 24) {
      for (let y = boxY + 20; y < boxY + boxH - 15; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px font-mono';
        ctx.fillText('e−', x, y + 3);
      }
    }

    // Barrier Potential Energy Hill Diagram (Bottom curve)
    const hillY = boxY + boxH + 60;
    ctx.font = 'bold 10px font-mono';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Internal Barrier Potential Energy Hill (eV0)', startX + 120, hillY - 35);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, hillY);
    ctx.lineTo(depLeft, hillY);
    // Sigmoid potential barrier transition across depletion layer
    const hDiff = effectiveVs >= knee ? 5 : Math.max(10, 40 - (effectiveVs / knee) * 25);
    ctx.bezierCurveTo(junctionX - 5, hillY, junctionX + 5, hillY - hDiff, depRight, hillY - hDiff);
    ctx.lineTo(startX + 2 * pWidth, hillY - hDiff);
    ctx.stroke();

    // Labels
    ctx.font = 'bold 12px font-sans';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('P-Type (Anode)', startX + 50, boxY - 10);
    ctx.fillStyle = '#0369a1';
    ctx.fillText('N-Type (Cathode)', startX + 2 * pWidth - 50, boxY - 10);
    ctx.fillStyle = '#475569';
    ctx.fillText(`Depletion Width: ~${depletionWidth.toFixed(0)} nm`, junctionX, boxY + boxH + 18);
  };

  // Universal Simulation Recorder Configuration
  const recorder = useSimulationRecorder({
    simulationId: 'diode_sim',
    simulationTitle: 'Semiconductor P-N Diode & Rectifier',
    category: 'electricity',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'sourceVoltage', label: 'Supply Voltage (Vs)', unit: 'V' },
      { key: 'diodeVoltage', label: 'Diode Voltage (VD)', unit: 'V' },
      { key: 'current_mA', label: 'Diode Current (ID)', unit: 'mA' },
      { key: 'current_A', label: 'Current (A)', unit: 'A' },
      { key: 'resistorVoltage', label: 'Resistor Voltage (VR)', unit: 'V' },
      { key: 'dynamicResistance', label: 'Dynamic Res (rd)', unit: 'Ω' },
    ],
    getCurrentRow: () => ({
      sourceVoltage: parseFloat(effectiveVs.toFixed(2)),
      diodeVoltage: parseFloat(calculatedVD.toFixed(3)),
      current_mA: parseFloat(calculatedID_mA.toFixed(3)),
      current_A: parseFloat((calculatedID_mA / 1000).toFixed(6)),
      resistorVoltage: parseFloat(calculatedVR.toFixed(2)),
      dynamicResistance: parseFloat(dynamicResistance_ohms.toFixed(1)),
    }),
    getSeriesData: () => {
      const vSteps = [-4.0, -2.0, -1.0, 0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0];
      return vSteps.map((vs, idx) => {
        let id_mA = 0;
        let vd = 0;
        if (vs >= knee) {
          id_mA = ((vs - knee) / (seriesR + 1.5)) * 1000;
          vd = knee + (id_mA / 1000) * 1.5;
        } else if (vs > 0) {
          id_mA = 0.02 * (Math.exp((vs / knee) * 4.5) - 1);
          vd = vs;
        } else if (isZener && vs <= -zenerV) {
          id_mA = -((-vs - zenerV) / (seriesR + 2.0)) * 1000;
          vd = -zenerV;
        } else {
          id_mA = -spec.leakageCurrentUA / 1000;
          vd = vs;
        }
        return {
          trial: idx + 1,
          sourceVoltage: vs,
          diodeVoltage: parseFloat(vd.toFixed(3)),
          current_mA: parseFloat(id_mA.toFixed(3)),
          current_A: parseFloat((id_mA / 1000).toFixed(6)),
          resistorVoltage: parseFloat((vs - vd).toFixed(2)),
          dynamicResistance: parseFloat(
            (id_mA > 0.1 ? (26 / id_mA) + 1.5 : 9999).toFixed(1)
          ),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Vs = 0.0 V (Zero Bias)', params: { vs: 0.0 }, durationMs: 600 },
        { label: 'Vs = 0.4 V (Sub-threshold)', params: { vs: 0.4 }, durationMs: 600 },
        { label: 'Vs = 0.7 V (Knee Threshold)', params: { vs: 0.7 }, durationMs: 600 },
        { label: 'Vs = 1.0 V (Conduction Starts)', params: { vs: 1.0 }, durationMs: 600 },
        { label: 'Vs = 2.0 V (Active Conduction)', params: { vs: 2.0 }, durationMs: 600 },
        { label: 'Vs = 3.5 V (High Current)', params: { vs: 3.5 }, durationMs: 600 },
        { label: 'Vs = 5.0 V (Full Conduction)', params: { vs: 5.0 }, durationMs: 600 },
      ],
      applyParams: (p) => {
        if (p.vs !== undefined) setSourceV(p.vs);
      },
    },
    defaultGraphConfig: {
      xAxis: 'diodeVoltage',
      yAxis: 'current_mA',
      title: 'P-N Diode I-V Characteristic Curve',
      showRegression: false,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Semiconductor Material': spec.name,
      'Barrier Potential (Vk)': `${spec.kneeVoltage} V`,
      'Supply Voltage (Vs)': `${effectiveVs.toFixed(2)} V`,
      'Diode Voltage (VD)': `${calculatedVD.toFixed(3)} V`,
      'Circuit Current (ID)': `${calculatedID_mA.toFixed(2)} mA`,
      'Series Resistor (Rs)': `${seriesR} Ω`,
    };
    downloadReportAsPDF('Semiconductor Diode Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters & Configuration Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.paramsTitle}</span>
            {recorder.isAutoRunning && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                🔒 Auto-Running
              </span>
            )}
          </h3>

          {/* Simulation Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">{t.modeTitle}</label>
            <div className={`grid ${ENABLE_DIODE_AC_RECTIFIER ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 bg-slate-100 p-1 rounded-xl`}>
              <button
                onClick={() => setCircuitMode('dc_characterization')}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  circuitMode === 'dc_characterization' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                DC I-V
              </button>
              {ENABLE_DIODE_AC_RECTIFIER && (
                <button
                  onClick={() => setCircuitMode('ac_rectifier')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    circuitMode === 'ac_rectifier' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AC Rectifier
                </button>
              )}
              <button
                onClick={() => setCircuitMode('pn_microscopic')}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  circuitMode === 'pn_microscopic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                P-N Junction
              </button>
            </div>
          </div>

          {/* Diode Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">{t.diodeSelect}</label>
            <select
              value={diodeType}
              onChange={(e) => setDiodeType(e.target.value as DiodeType)}
              disabled={recorder.isAutoRunning}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="silicon">Silicon (Si) Diode — Vk ≈ 0.7V</option>
              <option value="germanium">Germanium (Ge) Diode — Vk ≈ 0.3V</option>
              <option value="led_red">Red LED (GaP) — Vk ≈ 1.8V (λ = 660nm)</option>
              <option value="led_green">Green LED (GaP) — Vk ≈ 2.2V (λ = 525nm)</option>
              <option value="led_blue">Blue LED (InGaN) — Vk ≈ 3.0V (λ = 470nm)</option>
              <option value="zener">Zener Diode — Vk ≈ 0.7V / Vz = 5.6V</option>
            </select>
          </div>

          {/* Mode Specific Controls */}
          {(!ENABLE_DIODE_AC_RECTIFIER || circuitMode !== 'ac_rectifier') ? (
            <>
              {/* DC Voltage Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-650">{t.voltageDC}</span>
                  <span className="text-blue-650 font-mono font-bold">{effectiveVs.toFixed(1)} V</span>
                </div>
                <input
                  type="range" min="0.0" max="10.0" step="0.1" value={sourceV}
                  disabled={recorder.isAutoRunning}
                  onChange={(e) => setSourceV(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
                />
              </div>

              {/* Reverse Polarity Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-700 font-medium">{t.reversePolarity}</span>
                <input
                  type="checkbox"
                  checked={reversePolarity}
                  disabled={recorder.isAutoRunning}
                  onChange={(e) => setReversePolarity(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </div>
            </>
          ) : (
            <>
              {/* AC Peak Voltage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-650">{t.voltageAC}</span>
                  <span className="text-cyan-600 font-mono font-bold">{acPeakV.toFixed(1)} V</span>
                </div>
                <input
                  type="range" min="2.0" max="12.0" step="0.5" value={acPeakV}
                  onChange={(e) => setAcPeakV(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* AC Frequency */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-650">{t.frequency}</span>
                  <span className="text-cyan-600 font-mono font-bold">{acFreq.toFixed(1)} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="5.0" step="0.5" value={acFreq}
                  onChange={(e) => setAcFreq(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Smoothing Filter Capacitor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">{t.filterCapacitor}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', '10uF', '100uF'] as const).map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setFilterCap(cap)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        filterCap === cap
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cap === 'none' ? 'None' : cap}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Series Resistance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.resistance}</span>
              <span className="text-slate-700 font-mono font-bold">{seriesR} Ω</span>
            </div>
            <input
              type="range" min="50" max="1000" step="10" value={seriesR}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setSeriesR(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700 disabled:opacity-40"
            />
          </div>

          {/* Multimeter Labels Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="show-diode-labels"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-diode-labels" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.showLabels}
            </label>
          </div>
        </div>

        {/* Digital Multimeter Readings Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.meterReadings}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              conductionState === 'forward_on'
                ? 'bg-emerald-100 text-emerald-800'
                : conductionState === 'zener_breakdown'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {conductionState === 'forward_on'
                ? t.forwardConducting
                : conductionState === 'zener_breakdown'
                ? t.zenerBreakdown
                : t.reverseBlocked}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
              <span className="text-[10px] text-blue-600 font-sans font-bold block">{t.diodeVoltage}</span>
              <span className="text-sm font-black text-blue-900">{calculatedVD.toFixed(3)} V</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-sans font-bold block">{t.diodeCurrent}</span>
              <span className="text-sm font-black text-emerald-900">{calculatedID_mA.toFixed(2)} mA</span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] text-amber-600 font-sans font-bold block">{t.resistorVoltage}</span>
              <span className="text-sm font-black text-amber-900">{calculatedVR.toFixed(2)} V</span>
            </div>

            <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-100">
              <span className="text-[10px] text-purple-600 font-sans font-bold block">{t.powerDissipated}</span>
              <span className="text-sm font-black text-purple-900">{powerDissipated_mW.toFixed(1)} mW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Viewport & Graph Area */}
      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
        {/* Canvas Visualizer Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>
                {circuitMode === 'dc_characterization'
                  ? t.modeDC
                  : ENABLE_DIODE_AC_RECTIFIER && circuitMode === 'ac_rectifier'
                  ? t.modeAC
                  : t.modePN}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={() => {
                  setSourceV(3.0);
                  setSeriesR(220);
                  setReversePolarity(false);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                title={t.reset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-2 w-full flex justify-center overflow-x-auto">
            <canvas ref={canvasRef} className="rounded-xl border border-slate-100 shadow-inner bg-slate-50/50" />
          </div>
        </div>

        {/* Universal Simulation Recorder Lab Bar */}
        {ENABLE_SIMULATION_LAB_BAR && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {lang === 'si' ? 'විද්‍යාගාර නිරීක්ෂණ සහ සටහන්' : lang === 'ta' ? 'ஆய்வக அவதானிப்புகள் மற்றும் குறிப்புகள்' : 'Laboratory Observations & Notes'}
            </h4>
            <textarea
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              placeholder="Type your laboratory observations, findings, and notes here..."
              className="w-full border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans min-h-[70px]"
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
        )}

        {/* Scientific Graph Lab Integration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-1 min-h-[360px]">
          <ScientificGraphLab
            graphs={diodeGraphs}
            defaultGraphId="i_vs_vd"
            trials={recorder.recordedRows}
            livePoint={{
              sourceVoltage: effectiveVs,
              diodeVoltage: calculatedVD,
              current_mA: calculatedID_mA,
            }}
            simulationParams={{
              kneeVoltage: spec.kneeVoltage,
              diodeType: diodeType,
              seriesResistance: seriesR,
              zenerVoltage: spec.reverseBreakdown,
            }}
            columns={recorder.columns}
            height={320}
          />
        </div>
      </div>
    </div>
  );
}
