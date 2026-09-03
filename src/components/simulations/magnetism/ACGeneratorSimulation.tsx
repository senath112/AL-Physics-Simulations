import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Zap, Activity, Waves, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { acGeneratorGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function ACGeneratorSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'AC Generator & Alternator Lab',
      paramsTitle: 'Generator Parameters',
      omegaLabel: 'Angular Speed (ω)',
      rpmLabel: 'RPM',
      bFieldLabel: 'Magnetic Flux Density (B)',
      turnsLabel: 'Armature Turns (N)',
      areaLabel: 'Coil Area (A)',
      showFlux: 'Show Magnetic Flux (Φ)',
      showEMF: 'Show Induced EMF (ℰ)',
      showCurrent: 'Show Induced Current Vectors (I)',
      play: 'Rotate Generator',
      pause: 'Pause',
      reset: 'Reset Angle',
      theoryOutput: 'Electromagnetic Output',
      instantEMF: 'Instantaneous EMF (ℰ)',
      peakEMF: 'Peak Output Voltage (ℰ₀)',
      rmsVoltage: 'RMS Output Voltage (V_rms)',
      frequency: 'AC Frequency (f)',
      instantFlux: 'Instantaneous Flux (Φ)',
      maxFlux: 'Peak Flux (Φ₀)',
      phaseShiftNotice: 'Notice: EMF peaks when flux rate of change is maximum (90° phase shift).',
      oscilloscopeTitle: 'Real-Time Sinusoidal Oscilloscope (EMF & Magnetic Flux)',
      oscilloscopeSubtitle: 'Live waveform comparison demonstrating the 90° (π/2 rad) phase difference',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notes',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'ප්‍රත්‍යාවර්ත ධාරා (AC) ජනක විද්‍යාගාරය',
      paramsTitle: 'ජනක පරාමිතීන්',
      omegaLabel: 'කෝණික ප්‍රවේගය (ω)',
      rpmLabel: 'මිනිත්තුවට වට (RPM)',
      bFieldLabel: 'චුම්බක ස්‍රාව ඝනත්වය (B)',
      turnsLabel: 'දඟරයේ පොටවල් ගණන (N)',
      areaLabel: 'දඟර වර්ගඵලය (A)',
      showFlux: 'චුම්බක ස්‍රාවය (Φ) පෙන්වන්න',
      showEMF: 'ප්‍රේරිත වි.ගා.බ. (ℰ) පෙන්වන්න',
      showCurrent: 'ප්‍රේරිත ධාරා දෛශික පෙන්වන්න (I)',
      play: 'ක්‍රියාත්මක කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'කෝණය නැවත මුලට',
      theoryOutput: 'විද්‍යුත් චුම්බක ප්‍රතිදානය',
      instantEMF: 'ක්ෂණික වි.ගා.බ. (ℰ)',
      peakEMF: 'උච්ච වෝල්ටීයතාවය (ℰ₀)',
      rmsVoltage: 'වර්ග මධ්‍යන මූල වෝල්ටීයතාව (V_rms)',
      frequency: 'AC සංඛ්‍යාතය (f)',
      instantFlux: 'ක්ෂණික ස්‍රාවය (Φ)',
      maxFlux: 'උච්ච ස්‍රාවය (Φ₀)',
      phaseShiftNotice: 'සටහන: ස්‍රාවයේ වෙනස්වීමේ සීඝ්‍රතාව උපරිම වන විට වි.ගා.බ. උපරිම වේ (90° කලා වෙනස).',
      oscilloscopeTitle: 'තථ්‍ය කාලීන සයිනාකාර තරංග ඔසිලෝස්කෝපය (වි.ගා.බ. සහ චුම්බක ස්‍රාවය)',
      oscilloscopeSubtitle: 'වි.ගා.බ. සහ ස්‍රාවය අතර 90° (π/2 rad) කලා වෙනස පෙන්වන සජීවී තරංග සටහන',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන්',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'மாறுதிசை மின்னோட்ட (AC) பிறப்பாக்கி ஆய்வகம்',
      paramsTitle: 'பிறப்பாக்கி அளவுருக்கள்',
      omegaLabel: 'கோண வேகம் (ω)',
      rpmLabel: 'நிமிடத்திற்கு சுற்றுகள் (RPM)',
      bFieldLabel: 'காந்தப் பாய அடர்த்தி (B)',
      turnsLabel: 'சுருள் சுற்றுகள் (N)',
      areaLabel: 'சுருள் பரப்பளவு (A)',
      showFlux: 'காந்தப் பாயத்தைக் காட்டு (Φ)',
      showEMF: 'தூண்டப்பட்ட மின்னியக்க விசையைக் காட்டு (ℰ)',
      showCurrent: 'மின்னோட்ட திசையன்களைக் காட்டு (I)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      theoryOutput: 'மின்காந்த வெளியீடு',
      instantEMF: 'உடனடி மின்னியக்க விசை (ℰ)',
      peakEMF: 'உச்ச மின்னழுத்தம் (ℰ₀)',
      rmsVoltage: 'வர்க்க சராசரி மூல மின்னழுத்தம் (V_rms)',
      frequency: 'AC அதிர்வெண் (f)',
      instantFlux: 'உடனடி காந்தப் பாயம் (Φ)',
      maxFlux: 'உச்ச காந்தப் பாயம் (Φ₀)',
      phaseShiftNotice: 'குறிப்பு: பாய மாற்ற வீதம் உச்சமாக இருக்கும்போது மின்னியக்க விசை உச்சமடைகிறது (90° கட்ட வேறுபாடு).',
      oscilloscopeTitle: 'நிகழ்நேர சைன் அலை அலைக்காட்டி (மி.இ.வி & காந்தப் பாயம்)',
      oscilloscopeSubtitle: '90° (π/2 rad) கட்ட வேறுபாட்டைக் காட்டும் நேரடி அலைவடிவம்',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்புகள்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Generator Parameters
  const [omega, setOmega] = useState<number>(20); // rad/s (5 to 60)
  const [B, setB] = useState<number>(0.5); // Tesla (0.1 to 1.5)
  const [N, setN] = useState<number>(50); // turns (10 to 200)
  const [area, setArea] = useState<number>(0.04); // m^2 (0.01 to 0.10)

  const [showFlux, setShowFlux] = useState<boolean>(true);
  const [showEMF, setShowEMF] = useState<boolean>(true);
  const [showCurrent, setShowCurrent] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [labNotes, setLabNotes] = useState<string>('');

  const [theta, setTheta] = useState<number>(0); // radians

  // Physics Calculations
  const peakEMF = N * B * area * omega; // E0 = NABw
  const rmsVoltage = peakEMF / Math.SQRT2;
  const frequency = omega / (2 * Math.PI);
  const rpm = (omega * 60) / (2 * Math.PI);
  const peakFlux = B * area;
  const instantFlux = peakFlux * Math.cos(theta);
  const instantEMF = peakEMF * Math.sin(theta);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;
      setTheta(prev => (prev + omega * dt) % (4 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, omega]);

  const handleReset = () => {
    setTheta(0);
  };

  // Canvas 1: Full-Width 3D AC Generator Model with Current Vectors (Pure White BG)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 290;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Pure Clean White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle Perspective Floor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.lineWidth = 1;
    for (let gy = 240; gy <= height; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(width - 10, gy);
      ctx.stroke();
    }
    ctx.restore();

    // 3D Magnetic Pole Blocks on Left and Right
    const poleY = 35;
    const poleH = 160;
    const poleDepth = 20;

    // North Pole (Red, Left) in 3D
    ctx.save();
    // Top bevel
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(20, poleY);
    ctx.lineTo(20 + poleDepth, poleY - 12);
    ctx.lineTo(80 + poleDepth, poleY - 12);
    ctx.lineTo(80, poleY);
    ctx.closePath();
    ctx.fill();

    // Side bevel
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(80, poleY);
    ctx.lineTo(80 + poleDepth, poleY - 12);
    ctx.lineTo(80 + poleDepth, poleY + poleH - 12);
    ctx.lineTo(80, poleY + poleH);
    ctx.closePath();
    ctx.fill();

    // Front Face
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(20, poleY, 60, poleH, [8, 0, 0, 8]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', 50, poleY + poleH / 2 + 9);
    ctx.restore();

    // South Pole (Blue, Right) in 3D
    ctx.save();
    // Top bevel
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(width - 80, poleY);
    ctx.lineTo(width - 80 + poleDepth, poleY - 12);
    ctx.lineTo(width - 20 + poleDepth, poleY - 12);
    ctx.lineTo(width - 20, poleY);
    ctx.closePath();
    ctx.fill();

    // Side bevel
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(width - 20, poleY);
    ctx.lineTo(width - 20 + poleDepth, poleY - 12);
    ctx.lineTo(width - 20 + poleDepth, poleY + poleH - 12);
    ctx.lineTo(width - 20, poleY + poleH);
    ctx.closePath();
    ctx.fill();

    // Front Face
    ctx.fillStyle = '#2563eb';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width - 80, poleY, 60, poleH, [0, 8, 8, 0]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', width - 50, poleY + poleH / 2 + 9);
    ctx.restore();

    // Magnetic Field Lines (North to South across the gap)
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.fillStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    for (let fy = poleY + 20; fy <= poleY + poleH - 20; fy += 28) {
      ctx.beginPath();
      ctx.moveTo(80, fy);
      ctx.lineTo(width - 80, fy);
      ctx.stroke();

      // Field direction arrows
      ctx.beginPath();
      ctx.moveTo(width / 2 + 10, fy);
      ctx.lineTo(width / 2 + 3, fy - 3);
      ctx.lineTo(width / 2 + 3, fy + 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Rotating Armature Coil in 3D Perspective
    const cX = width / 2;
    const cY = poleY + poleH / 2 - 10;
    const coilW = 95;
    const coilH = 115;

    ctx.save();
    ctx.translate(cX, cY);

    // 3D Axle Shaft (Stainless Steel Cylinder)
    const axleGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    axleGrad.addColorStop(0, '#64748b');
    axleGrad.addColorStop(0.5, '#e2e8f0');
    axleGrad.addColorStop(1, '#475569');
    ctx.fillStyle = axleGrad;
    ctx.fillRect(-4, -coilH / 2 - 30, 8, coilH + 85);

    // 3D Perspective projected width & vertical tilt
    const projW = coilW * Math.cos(theta);
    const tilt = 22 * Math.sin(theta);

    const tlX = -projW, tlY = -coilH / 2 + tilt;
    const trX = projW, trY = -coilH / 2 - tilt;
    const brX = projW, brY = coilH / 2 - tilt;
    const blX = -projW, blY = coilH / 2 + tilt;

    // Coil Copper Outline with depth
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.beginPath();
    ctx.moveTo(tlX, tlY);
    ctx.lineTo(trX, trY);
    ctx.lineTo(brX, brY);
    ctx.lineTo(blX, blY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Normal Area Vector A (Cyan arrow)
    const normLen = 45;
    const normX = normLen * Math.sin(theta);
    const normY = normLen * Math.cos(theta) * 0.35;
    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(normX, normY);
    ctx.stroke();

    // Arrowhead on normal vector
    const normAngle = Math.atan2(normY, normX);
    ctx.beginPath();
    ctx.moveTo(normX, normY);
    ctx.lineTo(normX - 8 * Math.cos(normAngle - Math.PI / 6), normY - 8 * Math.sin(normAngle - Math.PI / 6));
    ctx.lineTo(normX - 8 * Math.cos(normAngle + Math.PI / 6), normY - 8 * Math.sin(normAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('A⃗', normX + 10, normY + 3);

    // 3. SHOW INDUCED CURRENT VECTORS (I) ALONG COIL PERIMETER
    if (showCurrent) {
      const sinVal = Math.sin(theta);
      const currentIntensity = Math.abs(sinVal);

      if (currentIntensity > 0.08) {
        const isForward = sinVal > 0;
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 3;

        // Helper to draw animated current arrow along a segment
        const drawCurrentVector = (fromX: number, fromY: number, toX: number, toY: number, forward: boolean) => {
          const startX = forward ? fromX : toX;
          const startY = forward ? fromY : toY;
          const endX = forward ? toX : fromX;
          const endY = forward ? toY : fromY;

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const segAngle = Math.atan2(endY - startY, endX - startX);
          const headlen = Math.max(7, Math.min(12, currentIntensity * 12));

          ctx.beginPath();
          ctx.moveTo(midX + headlen * Math.cos(segAngle), midY + headlen * Math.sin(segAngle));
          ctx.lineTo(
            midX - headlen * Math.cos(segAngle - Math.PI / 6),
            midY - headlen * Math.sin(segAngle - Math.PI / 6)
          );
          ctx.lineTo(
            midX - headlen * Math.cos(segAngle + Math.PI / 6),
            midY - headlen * Math.sin(segAngle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        };

        // 4 Arms of rectangular loop: Left, Top, Right, Bottom
        drawCurrentVector(blX, blY, tlX, tlY, isForward); // Left leg
        drawCurrentVector(tlX, tlY, trX, trY, isForward); // Top leg
        drawCurrentVector(trX, trY, brX, brY, isForward); // Right leg
        drawCurrentVector(brX, brY, blX, blY, isForward); // Bottom leg

        // Current vector label badge
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText(`I⃗ (${(Math.abs(instantEMF)).toFixed(1)}V)`, trX + (isForward ? 14 : -35), (trY + brY) / 2);
        ctx.restore();
      }
    }

    // 3D Brass Slip Rings on the axle
    const ringY1 = coilH / 2 + 20;
    const ringY2 = coilH / 2 + 36;

    const drawSlipRing = (ry: number) => {
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, ry, 12, 5, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Carbon Brush Block
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, ry - 3, 8, 6);
    };

    drawSlipRing(ringY1);
    drawSlipRing(ringY2);

    ctx.restore();

    // Bottom Status Badge on Canvas
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const deg = Math.round(((theta % (2 * Math.PI)) * 180) / Math.PI);
    ctx.fillText(`θ = ${deg}° • ℰ(t) = ${instantEMF.toFixed(2)} V • Φ(t) = ${(instantFlux * 1000).toFixed(2)} mWb`, width / 2, height - 12);

  }, [theta, omega, B, N, area, showFlux, showEMF, showCurrent, instantEMF, instantFlux]);

  // Canvas 2: Dedicated Real-Time Sinusoidal Oscilloscope (Outside Canvas)
  useEffect(() => {
    const oscCanvas = oscCanvasRef.current;
    if (!oscCanvas) return;
    const ctx = oscCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 540;
    const height = 150;

    oscCanvas.width = width * dpr;
    oscCanvas.height = height * dpr;
    oscCanvas.style.width = `${width}px`;
    oscCanvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Light-theme Oscilloscope Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    const padLeft = 40;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 25;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const midY = padTop + plotH / 2;

    // Graticule Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;

    // Horizontal division lines
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop); ctx.lineTo(padLeft + plotW, padTop);
    ctx.moveTo(padLeft, midY); ctx.lineTo(padLeft + plotW, midY);
    ctx.moveTo(padLeft, padTop + plotH); ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Vertical time division lines (0, pi, 2pi, 3pi, 4pi)
    const timeLabels = ['0', 'π', '2π', '3π', '4π'];
    for (let i = 0; i <= 4; i++) {
      const gx = padLeft + (i / 4) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, padTop);
      ctx.lineTo(gx, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeLabels[i], gx, padTop + plotH + 14);
    }
    ctx.restore();

    // Central Axis Zero Line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, midY);
    ctx.lineTo(padLeft + plotW, midY);
    ctx.stroke();

    const maxPlotAmp = plotH * 0.42;

    // 1. Magnetic Flux Curve Φ(t) = Φ0 cos(ωt) (Cyan/Blue Trace)
    if (showFlux) {
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const phiAngle = (i / plotW) * 4 * Math.PI;
        const yVal = midY - Math.cos(phiAngle) * maxPlotAmp * 0.75;
        if (i === 0) ctx.moveTo(padLeft + i, yVal);
        else ctx.lineTo(padLeft + i, yVal);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Induced EMF Curve ℰ(t) = ℰ0 sin(ωt) (Emerald Green Trace)
    if (showEMF) {
      ctx.save();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const emfAngle = (i / plotW) * 4 * Math.PI;
        const yVal = midY - Math.sin(emfAngle) * maxPlotAmp;
        if (i === 0) ctx.moveTo(padLeft + i, yVal);
        else ctx.lineTo(padLeft + i, yVal);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Synchronized Live Cursor Dot and Indicator Line
    const curCycleTheta = theta % (4 * Math.PI);
    const curX = padLeft + (curCycleTheta / (4 * Math.PI)) * plotW;

    ctx.save();
    // Vertical sweep cursor line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curX, padTop);
    ctx.lineTo(curX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Flux cursor dot
    if (showFlux) {
      const curFluxY = midY - Math.cos(curCycleTheta) * maxPlotAmp * 0.75;
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curX, curFluxY, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // EMF cursor dot
    if (showEMF) {
      const curEmfY = midY - Math.sin(curCycleTheta) * maxPlotAmp;
      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curX, curEmfY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

  }, [theta, showFlux, showEMF]);

  const recorder = useSimulationRecorder({
    simulationId: 'ac_generator_sim',
    simulationTitle: 'AC Generator & Alternator',
    category: 'magnetism',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'omega', label: 'Angular Speed (ω)', unit: 'rad/s' },
      { key: 'peakEMF', label: 'Peak EMF (ℰ₀)', unit: 'V' },
      { key: 'rmsVoltage', label: 'V_rms', unit: 'V' },
      { key: 'magneticField', label: 'Field (B)', unit: 'T' },
      { key: 'turns', label: 'Turns (N)' },
      { key: 'area', label: 'Area (A)', unit: 'm²' },
      { key: 'frequency', label: 'Freq (f)', unit: 'Hz' },
    ],
    getCurrentRow: () => ({
      omega,
      peakEMF: parseFloat(peakEMF.toFixed(2)),
      rmsVoltage: parseFloat(rmsVoltage.toFixed(2)),
      magneticField: B,
      turns: N,
      area,
      frequency: parseFloat(frequency.toFixed(2)),
    }),
    getSeriesData: () => {
      const omegas = [10, 20, 30, 40, 50, 60];
      return omegas.map((w, idx) => {
        const peak = N * B * area * w;
        return {
          trial: idx + 1,
          omega: w,
          peakEMF: parseFloat(peak.toFixed(2)),
          rmsVoltage: parseFloat((peak / Math.SQRT2).toFixed(2)),
          magneticField: B,
          turns: N,
          area,
          frequency: parseFloat((w / (2 * Math.PI)).toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'ω = 10 rad/s', params: { omega: 10 }, durationMs: 700 },
        { label: 'ω = 20 rad/s', params: { omega: 20 }, durationMs: 700 },
        { label: 'ω = 30 rad/s', params: { omega: 30 }, durationMs: 700 },
        { label: 'ω = 40 rad/s', params: { omega: 40 }, durationMs: 700 },
        { label: 'ω = 50 rad/s', params: { omega: 50 }, durationMs: 700 },
        { label: 'ω = 60 rad/s', params: { omega: 60 }, durationMs: 700 },
      ],
      applyParams: (p: Record<string, number>) => {
        if (p.omega !== undefined) setOmega(p.omega);
        if (p.B !== undefined) setB(p.B);
        if (p.N !== undefined) setN(p.N);
      },
    },
    defaultGraphConfig: {
      xAxis: 'omega',
      yAxis: 'peakEMF',
      title: 'Peak EMF (ℰ₀) vs Angular Velocity (ω) [Slope = NAB]',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Angular Speed (ω)': `${omega} rad/s (${rpm.toFixed(0)} RPM)`,
      'Magnetic Field (B)': `${B} T`,
      'Armature Turns (N)': `${N}`,
      'Coil Area (A)': `${area} m²`,
      'Peak Output Voltage (ℰ₀)': `${peakEMF.toFixed(2)} V`,
      'RMS Output Voltage (V_rms)': `${rmsVoltage.toFixed(2)} V`,
      'AC Frequency (f)': `${frequency.toFixed(2)} Hz`,
      'Peak Magnetic Flux (Φ₀)': `${(peakFlux * 1000).toFixed(2)} mWb`
    };
    downloadReportAsPDF('AC Generator & Alternator Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Sidebar Controls */}
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

          {/* Omega Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.omegaLabel}</span>
              <span className="text-blue-600 font-mono font-bold">{omega} rad/s ({rpm.toFixed(0)} RPM)</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="2"
              value={omega}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setOmega(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Magnetic Field B */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.bFieldLabel}</span>
              <span className="text-indigo-600 font-mono font-bold">{B.toFixed(2)} T</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={B}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Turns N */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-600 font-bold">{t.turnsLabel}</span>
              <span className="text-amber-600 font-mono font-bold">{N}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={N}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Area A */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.areaLabel}</span>
              <span className="text-slate-700 font-mono font-bold">{(area * 10000).toFixed(0)} cm² ({area.toFixed(2)} m²)</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.01"
              value={area}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setArea(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showCurrent}
                onChange={(e) => setShowCurrent(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              {t.showCurrent}
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showEMF}
                onChange={(e) => setShowEMF(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              {t.showEMF}
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showFlux}
                onChange={(e) => setShowFlux(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              {t.showFlux}
            </label>
          </div>

          {/* Play/Pause/Reset */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={recorder.isAutoRunning}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
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

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{t.theoryOutput}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/70 border border-emerald-100/60">
              <span className="font-medium text-slate-700">{t.peakEMF}:</span>
              <span className="font-mono font-bold text-emerald-700">{peakEMF.toFixed(2)} V</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.rmsVoltage}:</span>
              <span className="font-mono font-bold text-slate-800">{rmsVoltage.toFixed(2)} V</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.instantEMF}:</span>
              <span className="font-mono font-bold text-emerald-600">{instantEMF.toFixed(2)} V</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/70 border border-blue-100/60">
              <span className="font-medium text-slate-700">{t.instantFlux}:</span>
              <span className="font-mono font-bold text-blue-700">{(instantFlux * 1000).toFixed(2)} mWb</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-600">{t.frequency}:</span>
              <span className="font-mono font-bold text-indigo-600">{frequency.toFixed(2)} Hz</span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 leading-snug font-medium">
            💡 {t.phaseShiftNotice}
          </div>
        </div>
      </div>

      {/* Main Viewport & Oscilloscope & Graphs */}
      <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* 1. 3D AC Generator Model Canvas */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {t.title}
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              ℰ(t) = NABω·sin(ωt)
            </span>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/290] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* 2. DEDICATED REAL-TIME SINUSOIDAL OSCILLOSCOPE (BROUGHT OUT OF CANVAS) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-slate-800">{t.oscilloscopeTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                ℰ = {instantEMF.toFixed(2)} V
              </span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Φ = {(instantFlux * 1000).toFixed(2)} mWb
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-[540px] aspect-[540/150] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mx-auto">
            <canvas ref={oscCanvasRef} className="w-full h-full block" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Waves className="w-3 h-3 text-indigo-500" />
              {t.oscilloscopeSubtitle}
            </span>
            <span className="font-mono text-slate-600 font-semibold">
              Phase Difference: Δφ = π/2 (90°)
            </span>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <ScientificGraphLab
          graphs={acGeneratorGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ omega, magneticField: B, turns: N, area }}
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
