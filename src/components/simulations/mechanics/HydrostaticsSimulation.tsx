import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList, Layers, Gauge, Pipette } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

export function HydrostaticsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Hydrostatics & Buoyancy Laboratory',
      paramsTitle: 'Experiment Controls',
      tabArchimedes: "Archimedes' Principle",
      tabPressure: 'Pressure vs Depth',
      tabUTube: 'U-Tube Manometer',
      
      // Common
      gravity: 'Gravity (g)',
      liquidDensity: 'Liquid Density (ρ_liq)',
      reset: 'Reset',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      clearLogs: 'Clear Logs',
      theoryOutput: 'Live Measurements & Calculations',
      vectors: 'Show Force Vectors',

      // Mode 1: Archimedes
      objectMass: 'Object Mass (m)',
      objectVolume: 'Object Volume (V)',
      submergeDepth: 'Suspension Height / Depth',
      weightAir: 'Weight in Air (W = mg)',
      buoyantForce: 'Buoyant Force (F_b = ρVg)',
      apparentWeight: 'Scale Reading / Tension (T)',
      displacedVol: 'Displaced Volume (V_sub)',
      objectDensity: 'Object Density (ρ_obj)',
      stateFloating: 'Floating (T = 0 N)',
      stateSuspended: 'Suspended by Spring Scale',
      stateSubmerged: 'Fully Submerged',

      // Mode 2: Pressure
      probeDepth: 'Probe Depth (h)',
      includeAtm: 'Include Atmospheric Pressure (P_atm)',
      hydroPressure: 'Hydrostatic Gauge Pressure (ρgh)',
      totalPressure: 'Total Absolute Pressure (P_tot)',

      // Mode 3: U-Tube
      refDensity: 'Reference Liquid ρ₁ (Water)',
      testDensity: 'Test Liquid Density (ρ₂)',
      testHeight: 'Test Liquid Column (h₂)',
      refHeight: 'Balancing Water Column (h₁)',
      calcDensity: 'Calculated ρ₂ (ρ₁ · h₁ / h₂)',
      presets: 'Liquid Presets'
    },
    si: {
      title: 'ද්‍රවස්ථිති විද්‍යාව සහ උත්ප්ලාවකතා විද්‍යාගාරය',
      paramsTitle: 'ප්‍රායෝගික පාලක',
      tabArchimedes: 'ආකිමිඩීස් මූලධර්මය',
      tabPressure: 'පීඩනය සහ ගැඹුර',
      tabUTube: 'U-නළ මනෝමීටරය',

      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      liquidDensity: 'ද්‍රව ඝනත්වය (ρ_liq)',
      reset: 'නැවත මුලට',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      clearLogs: 'සියල්ල මකන්න',
      theoryOutput: 'තත්කාලීන මිනුම් සහ ගණනය කිරීම්',
      vectors: 'බල දෛශික පෙන්වන්න',

      objectMass: 'වස්තුවේ ස්කන්ධය (m)',
      objectVolume: 'වස්තුවේ පරිමාව (V)',
      submergeDepth: 'එල්ලුම් උස / ගැඹුර',
      weightAir: 'වාතයේදී බර (W = mg)',
      buoyantForce: 'උඩුකුරු තෙරපුම (F_b = ρVg)',
      apparentWeight: 'දුනු තරාදි පාඨාංකය / ආතතිය (T)',
      displacedVol: 'විස්ථාපිත පරිමාව (V_sub)',
      objectDensity: 'වස්තුවේ ඝනත්වය (ρ_obj)',
      stateFloating: 'පා වෙමින් පවතී (T = 0 N)',
      stateSuspended: 'තරාදියෙන් එල්ලා ඇත',
      stateSubmerged: 'සම්පූර්ණයෙන්ම ගිලී ඇත',

      probeDepth: 'මානක ගැඹුර (h)',
      includeAtm: 'වායුගෝල පීඩනය ඇතුළත් කරන්න (P_atm)',
      hydroPressure: 'ද්‍රවස්ථිති මානක පීඩනය (ρgh)',
      totalPressure: 'මුළු නිරපේක්ෂ පීඩනය (P_tot)',

      refDensity: 'සම්මත ද්‍රවය ρ₁ (ජලය)',
      testDensity: 'පරීක්ෂණ ද්‍රව ඝනත්වය (ρ₂)',
      testHeight: 'පරීක්ෂණ ද්‍රව කඳේ උස (h₂)',
      refHeight: 'තුලනය වන ජල කඳේ උස (h₁)',
      calcDensity: 'ගණනය කළ ρ₂ (ρ₁ · h₁ / h₂)',
      presets: 'ද්‍රව වර්ග'
    },
    ta: {
      title: 'பாய்மநிலையியல் மற்றும் மிதத்தல் ஆய்வகம்',
      paramsTitle: 'சோதனை கட்டுப்பாடுகள்',
      tabArchimedes: 'ஆர்க்கிமிடீசின் தத்துவம்',
      tabPressure: 'அமுக்கம் மற்றும் ஆழம்',
      tabUTube: 'U-குழாய் மானோமீட்டர்',

      gravity: 'ஈர்ப்பு (g)',
      liquidDensity: 'திரவ அடர்த்தி (ρ_liq)',
      reset: 'மீட்டமை',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      clearLogs: 'அனைத்தையும் நீக்கு',
      theoryOutput: 'நேரடி அளவீடுகள் & கணிப்புகள்',
      vectors: 'விசைத் திசையன்களைக் காட்டு',

      objectMass: 'பொருளின் திணிவு (m)',
      objectVolume: 'பொருளின் கனவளவு (V)',
      submergeDepth: 'தொங்கும் உயரம் / ஆழம்',
      weightAir: 'வளியில் நிறை (W = mg)',
      buoyantForce: 'மேலுதைப்பு விசை (F_b = ρVg)',
      apparentWeight: 'வில் தராசு வாசிப்பு / இழுவிசை (T)',
      displacedVol: 'இடம்பெயர்ந்த கனவளவு (V_sub)',
      objectDensity: 'பொருளின் அடர்த்தி (ρ_obj)',
      stateFloating: 'மிதக்கிறது (T = 0 N)',
      stateSuspended: 'தராசில் தொங்குகிறது',
      stateSubmerged: 'முழுமையாக மூழ்கியுள்ளது',

      probeDepth: 'ஆழம் (h)',
      includeAtm: 'வளிமண்டல அமுக்கத்தை சேர்க்க (P_atm)',
      hydroPressure: 'பாய்மநிலையியல் அமுக்கம் (ρgh)',
      totalPressure: 'மொத்த அமுக்கம் (P_tot)',

      refDensity: 'குறிப்பு திரவம் ρ₁ (நீர்)',
      testDensity: 'சோதனை திரவ அடர்த்தி (ρ₂)',
      testHeight: 'சோதனை திரவ நிரல் (h₂)',
      refHeight: 'சமநிலை நீர் நிரல் (h₁)',
      calcDensity: 'கணிக்கப்பட்ட ρ₂ (ρ₁ · h₁ / h₂)',
      presets: 'திரவ முன்னமைவுகள்'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Active Practical Mode
  const [activeTab, setActiveTab] = useState<'archimedes' | 'pressure' | 'utube'>('archimedes');
  const [g, setG] = useState(9.8); // m/s²
  const [showVectors, setShowVectors] = useState(true);

  // Mode 1: Archimedes Parameters
  const [objMass, setObjMass] = useState(1.5); // kg
  const [objVolume, setObjVolume] = useState(0.001); // m³ (1 Litre = 0.001 m³)
  const [liquidDensity, setLiquidDensity] = useState(1000); // kg/m³ (Water = 1000)
  const [immersionPercent, setImmersionPercent] = useState(50); // 0% to 100% submerged

  // Mode 2: Pressure vs Depth
  const [probeDepth, setProbeDepth] = useState(1.0); // meters (0 to 2m)
  const [includeAtm, setIncludeAtm] = useState(true);
  const [pressureLiquidDensity, setPressureLiquidDensity] = useState(1000);

  // Mode 3: U-Tube Manometer
  const [refDensity] = useState(1000); // Water (kg/m³)
  const [testDensity, setTestDensity] = useState(800); // e.g. Oil (kg/m³)
  const [testHeight, setTestHeight] = useState(0.20); // 20 cm = 0.20 m

  const [labNotes, setLabNotes] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // MODE 1 CALCULATIONS
  const weightAir = objMass * g; // Newtons
  const objDensity = objVolume > 0 ? objMass / objVolume : 0; // kg/m³
  const submergedVolume = (immersionPercent / 100) * objVolume; // m³
  const buoyantForce = liquidDensity * submergedVolume * g; // Newtons
  const apparentWeight = Math.max(0, weightAir - buoyantForce); // Tension reading in Newtons

  // MODE 2 CALCULATIONS
  const pAtm = includeAtm ? 101325 : 0; // Pa
  const hydroGaugePressure = pressureLiquidDensity * g * probeDepth; // Pa
  const totalPressure = pAtm + hydroGaugePressure; // Pa

  // MODE 3 CALCULATIONS
  // Balance: rho1 * h1 = rho2 * h2 => h1 = (rho2 / rho1) * h2
  const refHeight = refDensity > 0 ? (testDensity / refDensity) * testHeight : 0; // meters
  const calculatedTestDensity = refHeight > 0 && testHeight > 0 ? refDensity * (refHeight / testHeight) : 0;

  // Render Visual Canvas
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

    // ==========================================
    // RENDER MODE 1: ARCHIMEDES PRINCIPLE
    // ==========================================
    if (activeTab === 'archimedes') {
      const beakerX = 180;
      const beakerY = 80;
      const beakerW = 180;
      const beakerH = 170;

      // Draw Beaker Background Liquid
      const initialLiquidH = 100;
      const displacedRise = (immersionPercent / 100) * 15; // visual rise in liquid level
      const currentLiquidH = initialLiquidH + displacedRise;
      const liquidTop = beakerY + beakerH - currentLiquidH;

      ctx.fillStyle = liquidDensity > 1100 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(beakerX + 6, liquidTop, beakerW - 12, currentLiquidH - 6);

      // Draw Beaker Glass Contour
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY);
      ctx.stroke();

      // Beaker Graduations
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let mark = 1; mark <= 5; mark++) {
        const markY = beakerY + beakerH - mark * 30;
        ctx.beginPath();
        ctx.moveTo(beakerX + 6, markY);
        ctx.lineTo(beakerX + 18, markY);
        ctx.stroke();
      }

      // Draw Spring Scale at the top
      const scaleX = beakerX + beakerW / 2;
      const scaleY = 15;
      const scaleW = 40;
      const scaleH = 50;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(scaleX - scaleW / 2, scaleY, scaleW, scaleH, 4);
      ctx.fill();
      ctx.stroke();

      // Scale Reading display on device
      ctx.fillStyle = apparentWeight <= 0.05 ? '#10b981' : '#1e293b';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${apparentWeight.toFixed(1)} N`, scaleX, scaleY + 28);
      ctx.font = '7px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('SPRING SCALE', scaleX, scaleY + 12);

      // Calculate Object Position
      const objW = 50;
      const objH = 60;
      // When immersionPercent = 0, bottom of object is at liquidTop.
      // When immersionPercent = 100, object is fully submerged.
      const blockBottomY = liquidTop + (immersionPercent / 100) * objH;
      const blockTopY = blockBottomY - objH;
      const blockLeftX = scaleX - objW / 2;

      // Connecting Spring / Wire
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY + scaleH);
      ctx.lineTo(scaleX, blockTopY);
      ctx.stroke();

      // Draw Block
      ctx.fillStyle = objDensity > liquidDensity ? '#d97706' : '#f59e0b';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(blockLeftX, blockTopY, objW, objH, 3);
      ctx.fill();
      ctx.stroke();

      // Block text
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${objMass.toFixed(1)} kg`, scaleX, blockTopY + objH / 2 + 3);

      // Force Vectors
      if (showVectors) {
        const arrowScale = 4.0;
        const cX = scaleX;
        const cY = blockTopY + objH / 2;

        // 1. Gravity Force (Downward - Red)
        const wLen = weightAir * arrowScale;
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(cX, cY + wLen);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(cX, cY + wLen);
        ctx.lineTo(cX - 4, cY + wLen - 6);
        ctx.lineTo(cX + 4, cY + wLen - 6);
        ctx.fill();
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`W = ${weightAir.toFixed(1)}N`, cX + 28, cY + wLen / 2);

        // 2. Buoyant Force (Upward - Blue)
        if (buoyantForce > 0) {
          const fbLen = buoyantForce * arrowScale;
          ctx.strokeStyle = '#3b82f6';
          ctx.fillStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cX - 10, cY);
          ctx.lineTo(cX - 10, cY - fbLen);
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(cX - 10, cY - fbLen);
          ctx.lineTo(cX - 14, cY - fbLen + 6);
          ctx.lineTo(cX - 6, cY - fbLen + 6);
          ctx.fill();
          ctx.fillText(`Fb = ${buoyantForce.toFixed(1)}N`, cX - 35, cY - fbLen / 2);
        }

        // 3. Scale Tension (Upward - Amber)
        if (apparentWeight > 0.05) {
          const tLen = apparentWeight * arrowScale;
          ctx.strokeStyle = '#f59e0b';
          ctx.fillStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cX + 10, cY);
          ctx.lineTo(cX + 10, cY - tLen);
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(cX + 10, cY - tLen);
          ctx.lineTo(cX + 6, cY - tLen + 6);
          ctx.lineTo(cX + 14, cY - tLen + 6);
          ctx.fill();
          ctx.fillText(`T = ${apparentWeight.toFixed(1)}N`, cX + 35, cY - tLen / 2);
        }
      }
    }

    // ==========================================
    // RENDER MODE 2: PRESSURE VS DEPTH
    // ==========================================
    if (activeTab === 'pressure') {
      const tankX = 140;
      const tankY = 50;
      const tankW = 260;
      const tankH = 200;

      // Draw Liquid Fill
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(tankX + 4, tankY + 4, tankW - 8, tankH - 8);

      // Draw Tank Glass
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY);
      ctx.lineTo(tankX, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY);
      ctx.stroke();

      // Depth Ruler along the left of tank
      ctx.strokeStyle = '#64748b';
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      for (let d = 0; d <= 2.0; d += 0.5) {
        const yPos = tankY + (d / 2.0) * tankH;
        ctx.beginPath();
        ctx.moveTo(tankX - 8, yPos);
        ctx.lineTo(tankX, yPos);
        ctx.stroke();
        ctx.fillText(`${d.toFixed(1)} m`, tankX - 12, yPos + 3);
      }

      // Pressure distribution gradient arrows (isobars)
      for (let d = 0.4; d <= 2.0; d += 0.4) {
        const yPos = tankY + (d / 2.0) * tankH;
        const arrowLen = (d / 2.0) * 45;

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1.5;

        // Left pushing arrow
        ctx.beginPath();
        ctx.moveTo(tankX + 15, yPos);
        ctx.lineTo(tankX + 15 + arrowLen, yPos);
        ctx.stroke();

        // Right pushing arrow
        ctx.beginPath();
        ctx.moveTo(tankX + tankW - 15, yPos);
        ctx.lineTo(tankX + tankW - 15 - arrowLen, yPos);
        ctx.stroke();
      }

      // Probe Sensor Position
      const probeY = tankY + (probeDepth / 2.0) * tankH;
      const probeX = tankX + tankW / 2;

      // Cable from top to probe
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(probeX, 10);
      ctx.lineTo(probeX, probeY);
      ctx.stroke();

      // Sensor Body
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(probeX - 18, probeY - 8, 36, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Sensor indicator light
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(probeX, probeY, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Pressure readout box right next to probe
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(probeX + 25, probeY - 18, 105, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${(totalPressure / 1000).toFixed(2)} kPa`, probeX + 32, probeY - 3);
      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Depth: ${probeDepth.toFixed(2)} m`, probeX + 32, probeY + 10);
    }

    // ==========================================
    // RENDER MODE 3: U-TUBE MANOMETER
    // ==========================================
    if (activeTab === 'utube') {
      const cX = width / 2;
      const tubeY = 40;
      const tubeH = 200;
      const tubeR = 18; // inner radius of tube
      const tubeSpacing = 120; // distance between arms

      const leftArmX = cX - tubeSpacing / 2;
      const rightArmX = cX + tubeSpacing / 2;

      // Scale: 0.30 m height maps to 150px
      const pxPerMeter = 500;

      // Base reference datum level inside U-tube bottom
      const datumY = tubeY + tubeH - 40;

      // Right column contains Test Liquid of height `testHeight`
      const testLiquidTopY = datumY - testHeight * pxPerMeter;

      // Left column contains Reference Liquid (Water) of height `refHeight`
      const refLiquidTopY = datumY - refHeight * pxPerMeter;

      // 1. Draw Water (Reference Liquid) at bottom and in left arm
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.beginPath();
      // Left arm liquid
      ctx.rect(leftArmX - tubeR, refLiquidTopY, tubeR * 2, datumY - refLiquidTopY + 30);
      // Right arm liquid base below datum
      ctx.rect(rightArmX - tubeR, datumY, tubeR * 2, 30);
      // Bottom connector
      ctx.rect(leftArmX - tubeR, datumY + 10, tubeSpacing + tubeR * 2, 20);
      ctx.fill();

      // 2. Draw Test Liquid in Right Arm
      ctx.fillStyle = 'rgba(245, 158, 11, 0.65)'; // Amber/oil
      ctx.beginPath();
      ctx.rect(rightArmX - tubeR, testLiquidTopY, tubeR * 2, datumY - testLiquidTopY);
      ctx.fill();

      // 3. Draw Glass U-Tube Outer & Inner Outlines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      // Left outer & inner
      ctx.beginPath();
      ctx.moveTo(leftArmX - tubeR, tubeY);
      ctx.lineTo(leftArmX - tubeR, tubeY + tubeH);
      ctx.lineTo(rightArmX + tubeR, tubeY + tubeH);
      ctx.lineTo(rightArmX + tubeR, tubeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftArmX + tubeR, tubeY);
      ctx.lineTo(leftArmX + tubeR, tubeY + tubeH - tubeR * 2);
      ctx.lineTo(rightArmX - tubeR, tubeY + tubeH - tubeR * 2);
      ctx.lineTo(rightArmX - tubeR, tubeY);
      ctx.stroke();

      // 4. Interface Datum Line (Equal Pressure Level)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(leftArmX - tubeR - 25, datumY);
      ctx.lineTo(rightArmX + tubeR + 25, datumY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('P₁ = P₂ (Datum)', rightArmX + tubeR + 30, datumY + 3);

      // Height Dimension Markers
      // h1 (Water)
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = '#2563eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftArmX - tubeR - 15, datumY);
      ctx.lineTo(leftArmX - tubeR - 15, refLiquidTopY);
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`h₁=${(refHeight * 100).toFixed(1)}cm`, leftArmX - tubeR - 20, (datumY + refLiquidTopY) / 2 + 3);

      // h2 (Test Liquid)
      ctx.strokeStyle = '#d97706';
      ctx.fillStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightArmX + tubeR + 15, datumY);
      ctx.lineTo(rightArmX + tubeR + 15, testLiquidTopY);
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`h₂=${(testHeight * 100).toFixed(1)}cm`, rightArmX + tubeR + 20, (datumY + testLiquidTopY) / 2 + 3);
    }
  }, [
    activeTab,
    objMass,
    objVolume,
    liquidDensity,
    immersionPercent,
    apparentWeight,
    weightAir,
    buoyantForce,
    showVectors,
    probeDepth,
    totalPressure,
    testHeight,
    refHeight
  ]);

  const handleReset = () => {
    if (activeTab === 'archimedes') {
      setImmersionPercent(50);
      setObjMass(1.5);
      setObjVolume(0.001);
      setLiquidDensity(1000);
    } else if (activeTab === 'pressure') {
      setProbeDepth(1.0);
      setPressureLiquidDensity(1000);
    } else {
      setTestDensity(800);
      setTestHeight(0.20);
    }
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'hydrostatics_sim',
    simulationTitle: 'Hydrostatics & Buoyancy',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'mode', label: 'Experiment Mode', unit: '' },
      { key: 'depth_m', label: 'Depth (h)', unit: 'm' },
      { key: 'fluidDensity_kg_m3', label: 'Liquid Density', unit: 'kg/m³' },
      { key: 'submergedFraction', label: 'Submerged %', unit: '%' },
      { key: 'buoyantForce_N', label: 'Buoyant Force (Fb)', unit: 'N' },
      { key: 'apparentWeight_N', label: 'Scale Reading (T)', unit: 'N' },
      { key: 'gaugePressure_kPa', label: 'Gauge Pressure', unit: 'kPa' },
      { key: 'totalPressure_kPa', label: 'Total Pressure', unit: 'kPa' },
    ],
    getCurrentRow: () => {
      if (activeTab === 'archimedes') {
        return {
          mode: 'Archimedes',
          depth_m: parseFloat(((immersionPercent / 100) * 0.2).toFixed(2)),
          fluidDensity_kg_m3: liquidDensity,
          submergedFraction: immersionPercent,
          buoyantForce_N: parseFloat(buoyantForce.toFixed(2)),
          apparentWeight_N: parseFloat(apparentWeight.toFixed(2)),
          gaugePressure_kPa: parseFloat((hydroGaugePressure / 1000).toFixed(2)),
          totalPressure_kPa: parseFloat((totalPressure / 1000).toFixed(2)),
        };
      } else if (activeTab === 'pressure') {
        return {
          mode: 'Pressure-Depth',
          depth_m: probeDepth,
          fluidDensity_kg_m3: pressureLiquidDensity,
          submergedFraction: 100,
          buoyantForce_N: 0,
          apparentWeight_N: 0,
          gaugePressure_kPa: parseFloat((hydroGaugePressure / 1000).toFixed(2)),
          totalPressure_kPa: parseFloat((totalPressure / 1000).toFixed(2)),
        };
      } else {
        return {
          mode: 'U-Tube',
          depth_m: testHeight,
          fluidDensity_kg_m3: parseFloat(calculatedTestDensity.toFixed(0)),
          submergedFraction: 100,
          buoyantForce_N: 0,
          apparentWeight_N: 0,
          gaugePressure_kPa: parseFloat(((calculatedTestDensity * g * testHeight) / 1000).toFixed(2)),
          totalPressure_kPa: parseFloat(((pAtm + calculatedTestDensity * g * testHeight) / 1000).toFixed(2)),
        };
      }
    },
    getSeriesData: () => {
      if (activeTab === 'pressure') {
        const depths = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
        return depths.map((d, idx) => {
          const pGauge = (pressureLiquidDensity * g * d) / 1000;
          return {
            trial: idx + 1,
            mode: 'Pressure-Depth',
            depth_m: d,
            fluidDensity_kg_m3: pressureLiquidDensity,
            submergedFraction: 100,
            buoyantForce_N: 0,
            apparentWeight_N: 0,
            gaugePressure_kPa: parseFloat(pGauge.toFixed(2)),
            totalPressure_kPa: parseFloat(((pAtm / 1000) + pGauge).toFixed(2)),
          };
        });
      } else {
        const fractions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        return fractions.map((pct, idx) => {
          const subV = (pct / 100) * objVolume;
          const fb = liquidDensity * subV * g;
          const appW = Math.max(0, weightAir - fb);
          return {
            trial: idx + 1,
            mode: 'Archimedes',
            depth_m: parseFloat(((pct / 100) * 0.2).toFixed(2)),
            fluidDensity_kg_m3: liquidDensity,
            submergedFraction: pct,
            buoyantForce_N: parseFloat(fb.toFixed(2)),
            apparentWeight_N: parseFloat(appW.toFixed(2)),
            gaugePressure_kPa: 0,
            totalPressure_kPa: 0,
          };
        });
      }
    },
    defaultGraphConfig: {
      xAxis: activeTab === 'archimedes' ? 'submergedFraction' : 'depth_m',
      yAxis: activeTab === 'archimedes' ? 'buoyantForce_N' : 'gaugePressure_kPa',
      title: activeTab === 'archimedes' ? 'Buoyancy vs Submerged % (Fb ∝ V_sub)' : 'Gauge Pressure vs Depth (P = ρgh)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams: Record<string, string> = {
      'Experiment Mode': activeTab.toUpperCase(),
      'Gravity (g)': `${g.toFixed(2)} m/s²`
    };

    if (activeTab === 'archimedes') {
      reportParams['Object Mass'] = `${objMass} kg`;
      reportParams['Object Volume'] = `${(objVolume * 1000).toFixed(2)} L`;
      reportParams['Liquid Density'] = `${liquidDensity} kg/m³`;
      reportParams['Weight in Air'] = `${weightAir.toFixed(2)} N`;
      reportParams['Buoyant Force'] = `${buoyantForce.toFixed(2)} N`;
      reportParams['Apparent Scale Tension'] = `${apparentWeight.toFixed(2)} N`;
    } else if (activeTab === 'pressure') {
      reportParams['Liquid Density'] = `${pressureLiquidDensity} kg/m³`;
      reportParams['Selected Depth'] = `${probeDepth.toFixed(2)} m`;
      reportParams['Gauge Pressure'] = `${(hydroGaugePressure / 1000).toFixed(2)} kPa`;
      reportParams['Total Absolute Pressure'] = `${(totalPressure / 1000).toFixed(2)} kPa`;
    } else {
      reportParams['Reference Fluid (Water)'] = `${refDensity} kg/m³`;
      reportParams['Test Fluid Column (h2)'] = `${(testHeight * 100).toFixed(1)} cm`;
      reportParams['Water Column (h1)'] = `${(refHeight * 100).toFixed(1)} cm`;
      reportParams['Determined Density'] = `${calculatedTestDensity.toFixed(0)} kg/m³`;
    }

    downloadReportAsPDF('Hydrostatics & Buoyancy Laboratory Report', reportParams, recorder.recordedRows, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.paramsTitle}</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">g = {g.toFixed(1)} m/s²</span>
          </h3>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('archimedes')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'archimedes' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              {t.tabArchimedes}
            </button>
            <button
              onClick={() => setActiveTab('pressure')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'pressure' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gauge className="w-3 h-3" />
              {t.tabPressure}
            </button>
            <button
              onClick={() => setActiveTab('utube')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'utube' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pipette className="w-3 h-3" />
              {t.tabUTube}
            </button>
          </div>

          {/* MODE 1: ARCHIMEDES CONTROLS */}
          {activeTab === 'archimedes' && (
            <div className="space-y-3 pt-1">
              {/* Immersion depth slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.submergeDepth}</span>
                  <span className="text-blue-600 font-mono font-bold">{immersionPercent}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1" value={immersionPercent}
                  onChange={(e) => setImmersionPercent(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Object mass slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.objectMass}</span>
                  <span className="text-slate-700 font-mono">{objMass.toFixed(2)} kg</span>
                </div>
                <input
                  type="range" min="0.2" max="5.0" step="0.1" value={objMass}
                  onChange={(e) => setObjMass(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Object Volume slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.objectVolume}</span>
                  <span className="text-slate-700 font-mono">{(objVolume * 1000).toFixed(1)} L</span>
                </div>
                <input
                  type="range" min="0.0002" max="0.003" step="0.0001" value={objVolume}
                  onChange={(e) => setObjVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Liquid Density slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.liquidDensity}</span>
                  <span className="text-slate-700 font-mono">{liquidDensity} kg/m³</span>
                </div>
                <input
                  type="range" min="600" max="1400" step="20" value={liquidDensity}
                  onChange={(e) => setLiquidDensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => setLiquidDensity(800)}
                    className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    Oil (800)
                  </button>
                  <button
                    onClick={() => setLiquidDensity(1000)}
                    className="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded text-blue-700 font-bold cursor-pointer"
                  >
                    Water (1000)
                  </button>
                  <button
                    onClick={() => setLiquidDensity(1260)}
                    className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    Glycerin (1260)
                  </button>
                </div>
              </div>

              {/* Force Vectors toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox" id="show-vectors-buoy" checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="show-vectors-buoy" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                  {t.vectors}
                </label>
              </div>
            </div>
          )}

          {/* MODE 2: PRESSURE CONTROLS */}
          {activeTab === 'pressure' && (
            <div className="space-y-3 pt-1">
              {/* Probe Depth slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.probeDepth}</span>
                  <span className="text-blue-600 font-mono font-bold">{probeDepth.toFixed(2)} m</span>
                </div>
                <input
                  type="range" min="0" max="2.0" step="0.05" value={probeDepth}
                  onChange={(e) => setProbeDepth(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Liquid Density slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.liquidDensity}</span>
                  <span className="text-slate-700 font-mono">{pressureLiquidDensity} kg/m³</span>
                </div>
                <input
                  type="range" min="500" max="2000" step="50" value={pressureLiquidDensity}
                  onChange={(e) => setPressureLiquidDensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Include Atmospheric pressure toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox" id="include-atm" checked={includeAtm}
                  onChange={(e) => setIncludeAtm(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="include-atm" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                  {t.includeAtm}
                </label>
              </div>
            </div>
          )}

          {/* MODE 3: U-TUBE MANOMETER CONTROLS */}
          {activeTab === 'utube' && (
            <div className="space-y-3 pt-1">
              {/* Test column height slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.testHeight}</span>
                  <span className="text-amber-600 font-mono font-bold">{(testHeight * 100).toFixed(1)} cm</span>
                </div>
                <input
                  type="range" min="0.05" max="0.30" step="0.01" value={testHeight}
                  onChange={(e) => setTestHeight(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Test liquid density slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{t.testDensity}</span>
                  <span className="text-slate-700 font-mono">{testDensity} kg/m³</span>
                </div>
                <input
                  type="range" min="600" max="1500" step="25" value={testDensity}
                  onChange={(e) => setTestDensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => setTestDensity(720)}
                    className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    Petrol (720)
                  </button>
                  <button
                    onClick={() => setTestDensity(800)}
                    className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded text-amber-700 font-bold cursor-pointer"
                  >
                    Oil (800)
                  </button>
                  <button
                    onClick={() => setTestDensity(1260)}
                    className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  >
                    Glycerin (1260)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gravity global slider */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-slate-700 font-mono">{g.toFixed(1)} m/s²</span>
            </div>
            <input
              type="range" min="1.0" max="20.0" step="0.1" value={g}
              onChange={(e) => setG(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Theoretical Outputs Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>

          {/* MODE 1 OUTPUTS */}
          {activeTab === 'archimedes' && (
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">{t.apparentWeight}</span>
                <span className={`font-extrabold font-mono text-sm ${apparentWeight <= 0.05 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {apparentWeight <= 0.05 ? t.stateFloating : `${apparentWeight.toFixed(2)} N`}
                </span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100 flex justify-between items-center">
                <span className="text-blue-700 font-medium">{t.buoyantForce}</span>
                <span className="font-extrabold text-blue-700 font-mono text-sm">{buoyantForce.toFixed(2)} N</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">{t.weightAir}</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">{weightAir.toFixed(2)} N</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">{t.objectDensity}</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">{objDensity.toFixed(0)} kg/m³</span>
              </div>
            </div>
          )}

          {/* MODE 2 OUTPUTS */}
          {activeTab === 'pressure' && (
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100 flex justify-between items-center">
                <span className="text-blue-700 font-medium">{t.totalPressure}</span>
                <span className="font-extrabold text-blue-700 font-mono text-sm">{(totalPressure / 1000).toFixed(2)} kPa</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">{t.hydroPressure}</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">{(hydroGaugePressure / 1000).toFixed(2)} kPa</span>
              </div>
            </div>
          )}

          {/* MODE 3 OUTPUTS */}
          {activeTab === 'utube' && (
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-amber-50/50 p-2.5 rounded border border-amber-200 flex justify-between items-center">
                <span className="text-amber-800 font-medium">{t.refHeight}</span>
                <span className="font-extrabold text-amber-900 font-mono text-sm">{(refHeight * 100).toFixed(1)} cm</span>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-medium">{t.calcDensity}</span>
                <span className="font-extrabold text-emerald-900 font-mono text-sm">{calculatedTestDensity.toFixed(0)} kg/m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Canvas and Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {activeTab === 'archimedes' ? t.tabArchimedes : activeTab === 'pressure' ? t.tabPressure : t.tabUTube}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <canvas ref={canvasRef} className="border border-slate-100 rounded-lg bg-slate-50/20" />
          </div>

          {/* Reset button bar */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
              title="Reset parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.reset}
            </button>
          </div>
        </div>

        {/* Observation notebook and data logger */}
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
