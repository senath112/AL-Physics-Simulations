import { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw, Sparkles, Rotate3d, Plus } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { BlockMath, InlineMath } from '../../Math';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function MagneticFieldWireSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: '3D Magnetic Field Around a Current Wire',
      controls: 'Electromagnetic Parameters',
      current: 'Current (I)',
      direction: 'Current Direction',
      probe: 'Magnetic Probe Distance (r)',
      fieldCalculations: 'Field Computations',
      formula: 'B = μ₀I / (2πr)',
      fieldStrength: 'Field Strength (B)',
      rightHandRule: 'Right-Hand Grip Rule Direction',
      clockwise: 'Clockwise (looking down)',
      counterClockwise: 'Counter-Clockwise (looking down)',
      interactive3D: 'Click & Drag to Rotate in 3D Space',
      logTrial: 'Record Probe Reading',
      trialHistory: 'Probe Observations Log',
      labNotes: 'Observation Journal',
      pdf: 'Export PDF',
      electrons: 'Show Electron Flow',
      compasses: 'Show Compasses'
    },
    si: {
      title: 'ධාරාවක් ගෙන යන කම්බියක් අවට 3D චුම්බක ක්ෂේත්‍රය',
      controls: 'විද්‍යුත් චුම්බක පරාමිතීන්',
      current: 'ධාරාව (I)',
      direction: 'ධාරාවේ දිශාව',
      probe: 'ක්ෂේත්‍ර ගවේෂණ දුර (r)',
      fieldCalculations: 'ක්ෂේත්‍ර ගණනය කිරීම්',
      formula: 'B = μ₀I / (2πr)',
      fieldStrength: 'චුම්බක ක්ෂේත්‍ර තීව්‍රතාවය (B)',
      rightHandRule: 'දකුණත් නියමයේ දිශාව',
      clockwise: 'දක්ෂිණාවර්තව (ඉහළ සිට)',
      counterClockwise: 'වාමාවර්තව (ඉහළ සිට)',
      interactive3D: '3D අවකාශයේ කරකැවීමට ක්ලික් කර අදින්න',
      logTrial: 'ගවේෂණ අගය සටහන් කරන්න',
      trialHistory: 'ගවේෂණ නිරීක්ෂණ සටහන්',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      pdf: 'PDF ලබාගන්න',
      electrons: 'ඉලෙක්ට්‍රෝන ප්‍රවාහය පෙන්වන්න',
      compasses: 'මාලිමා යන්ත්‍ර පෙන්වන්න'
    },
    ta: {
      title: 'மின்னோட்டம் பாயும் கம்பியைச் சுற்றியுள்ள 3D காந்தப்புலம்',
      controls: 'மின்காந்த அளவுருக்கள்',
      current: 'மின்னோட்டம் (I)',
      direction: 'மின்னோட்ட திசை',
      probe: 'காந்த ஆய்வு தூரம் (r)',
      fieldCalculations: 'புலக் கணிப்புகள்',
      formula: 'B = μ₀I / (2πr)',
      fieldStrength: 'காந்தப்புல வலிமை (B)',
      rightHandRule: 'வலக்கை விதி திசை',
      clockwise: 'வலஞ்சுழியாக (மேலிருந்து பார்க்க)',
      counterClockwise: 'இடஞ்சுழியாக (மேலிருந்து பார்க்க)',
      interactive3D: '3D இடத்தை சுழற்ற கிளிக் செய்து இழுக்கவும்',
      logTrial: 'பதிவைச் சேமிக்கவும்',
      trialHistory: 'சோதனைப் பதிவுகள்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      pdf: 'PDF ஏற்றுமதி செய்',
      electrons: 'மின்னணு ஓட்டத்தைக் காட்டு',
      compasses: 'திசைகாட்டிகளைக் காட்டு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // State Variables
  const [current, setCurrent] = useState<number>(5.0); // Amperes
  const [probeDistance, setProbeDistance] = useState<number>(30); // mm
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showCompasses, setShowCompasses] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // 3D Rotations (Angles in Radians)
  const [yaw, setYaw] = useState<number>(-0.6);   // Left/Right rotation
  const [pitch, setPitch] = useState<number>(0.4); // Up/Down rotation

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const electronOffsetRef = useRef<number>(0);

  // Constants
  const MU_0 = 4 * Math.PI * 1e-7; // permeability of free space

  // Calculated Field Strength: B = mu_0 * I / (2 * pi * r)
  const fieldStrengthTesla = useMemo(() => {
    if (probeDistance === 0) return 0;
    const rMeters = probeDistance / 1000;
    return (MU_0 * Math.abs(current)) / (2 * Math.PI * rMeters);
  }, [current, probeDistance]);

  const handleReset = () => {
    setCurrent(5.0);
    setProbeDistance(30);
    setYaw(-0.6);
    setPitch(0.4);
    setNotes('');
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'wire_field_sim',
    simulationTitle: 'Magnetic Field of Current-Carrying Wire',
    category: 'fields',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'current', label: 'Current (I)', unit: 'A' },
      { key: 'probeDist_mm', label: 'Distance (r)', unit: 'mm' },
      { key: 'invDist_inv_m', label: 'Inverse Distance (1/r)', unit: '1/m' },
      { key: 'fieldStrength_uT', label: 'Field (B)', unit: 'μT' },
      { key: 'fieldStrength_T', label: 'Field (B)', unit: 'T' },
    ],
    getCurrentRow: () => {
      const rMeters = probeDistance / 1000;
      const invR = rMeters > 0 ? 1 / rMeters : 0;
      return {
        current,
        probeDist_mm: probeDistance,
        invDist_inv_m: parseFloat(invR.toFixed(2)),
        fieldStrength_uT: parseFloat((fieldStrengthTesla * 1e6).toFixed(3)),
        fieldStrength_T: parseFloat(fieldStrengthTesla.toExponential(4)),
      };
    },
    defaultGraphConfig: {
      xAxis: 'current',
      yAxis: 'fieldStrength_uT',
      title: 'B vs Current I (B = μ₀I / 2πr, Slope = μ₀ / 2πr)',
      showRegression: true,
    },
    notes,
  });

  const handleExportPDF = () => {
    const reportParams = {
      'Current (I)': `${current} A`,
      'Probe Distance (r)': `${probeDistance} mm`,
      'Calculated Field (B)': `${(fieldStrengthTesla * 1e6).toFixed(3)} μT`
    };
    downloadReportAsPDF('Magnetic Field Wire Lab Report', reportParams, recorder.recordedRows, notes);
  };

  // Drag handlers for rotating the 3D wire model
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setYaw(prev => prev + dx * 0.007);
    setPitch(prev => Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, prev - dy * 0.007)));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    setYaw(prev => prev + dx * 0.007);
    setPitch(prev => Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, prev - dy * 0.007)));

    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // 3D coordinate transformation pipeline
  const project = (pt: Point3D, centerX: number, centerY: number): { x: number; y: number; z: number } => {
    // 1. Rotate around Y axis (Yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = pt.x * cosY - pt.z * sinY;
    const z1 = pt.x * sinY + pt.z * cosY;

    // 2. Rotate around X axis (Pitch)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = pt.y * cosP - z1 * sinP;
    const z2 = pt.y * sinP + z1 * cosP;

    // Isometric or perspective scaling
    const scale = 320 / (320 + z2); // perspective depth
    return {
      x: centerX + x1 * scale * 1.5,
      y: centerY + y2 * scale * 1.5,
      z: z2
    };
  };

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 540;
    const rectHeight = 360;

    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    const centerX = rectWidth / 2;
    const centerY = rectHeight / 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw background grid lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      // Draw coordinate compass indicator in top corner
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px font-sans';
      ctx.fillText('3D VIEWPORT AXES', 15, 20);

      // Z-Buffer sorting array to draw objects correctly from back-to-front
      const drawQueue: { depth: number; draw: () => void }[] = [];

      // 1. Current wire cylinder representation
      // We represent the wire as segment nodes along the vertical Y axis (y from -120 to +120)
      const wirePoints: Point3D[] = [];
      for (let yVal = -120; yVal <= 120; yVal += 10) {
        wirePoints.push({ x: 0, y: yVal, z: 0 });
      }

      drawQueue.push({
        depth: 0, // center wire spans across the scene
        draw: () => {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          wirePoints.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Copper wire interior line
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 4;
          ctx.beginPath();
          wirePoints.forEach((pt, index) => {
            const proj = project(pt, centerX, centerY);
            if (index === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });
          ctx.stroke();

          // Current direction arrows on wire
          if (current !== 0) {
            const arrowDir = current > 0 ? -1 : 1; // current flows up (-Y) or down (+Y)
            const arrowY = arrowDir === -1 ? centerY - 50 : centerY + 50;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(centerX, arrowY - 6 * arrowDir);
            ctx.lineTo(centerX - 4, arrowY + 4 * arrowDir);
            ctx.lineTo(centerX + 4, arrowY + 4 * arrowDir);
            ctx.fill();
            
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'black 9px font-sans';
            ctx.textAlign = 'center';
            ctx.fillText('I', centerX + 10, arrowY + 3);

            // Draw end-cap cross-section indicators based on view direction
            const drawEndcapSymbol = (proj: { x: number; y: number }, isDot: boolean) => {
              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, 7, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();

              if (isDot) {
                // (.) Dot (Current pointing out of the plane)
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2, 0, 2 * Math.PI);
                ctx.fill();
              } else {
                // (X) Cross (Current pointing into the plane)
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(proj.x - 2.5, proj.y - 2.5);
                ctx.lineTo(proj.x + 2.5, proj.y + 2.5);
                ctx.moveTo(proj.x + 2.5, proj.y - 2.5);
                ctx.lineTo(proj.x - 2.5, proj.y + 2.5);
                ctx.stroke();
              }
              ctx.restore();
            };

            const projTop = project({ x: 0, y: -120, z: 0 }, centerX, centerY);
            const projBottom = project({ x: 0, y: 120, z: 0 }, centerX, centerY);

            // If current > 0 (flows up/towards -Y), it emerges at top (.) and enters at bottom (X)
            // If current < 0 (flows down/towards +Y), it enters at top (X) and emerges at bottom (.)
            if (current > 0) {
              drawEndcapSymbol(projTop, true); // emerging top
              drawEndcapSymbol(projBottom, false); // entering bottom
            } else {
              drawEndcapSymbol(projTop, false); // entering top
              drawEndcapSymbol(projBottom, true); // emerging bottom
            }
          }
        }
      });

      // 2. Drift electrons inside wire
      if (showElectrons && current !== 0) {
        electronOffsetRef.current += current * 0.2;
        if (electronOffsetRef.current > 40) electronOffsetRef.current = 0;
        if (electronOffsetRef.current < -40) electronOffsetRef.current = 0;

        const electronStep = 20;
        for (let yVal = -120; yVal <= 120; yVal += electronStep) {
          const adjustedY = yVal + electronOffsetRef.current;
          if (adjustedY >= -120 && adjustedY <= 120) {
            drawQueue.push({
              depth: 5,
              draw: () => {
                const proj = project({ x: 0, y: adjustedY, z: 0 }, centerX, centerY);
                ctx.fillStyle = '#3b82f6';
                ctx.shadowColor = '#60a5fa';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            });
          }
        }
      }

      // 3. Concentric magnetic field loops at different radii
      const loopRadii = [30, 60, 95];
      // Flow animation offset based on current
      const flowOffset = (Date.now() / 1000) * (current > 0 ? 1 : -1) * 1.5;

      loopRadii.forEach(radius => {
        // Draw circles in the horizontal X-Z plane
        const circlePoints: Point3D[] = [];
        const numSegments = 64;
        for (let i = 0; i <= numSegments; i++) {
          const angle = (i * 2 * Math.PI) / numSegments;
          circlePoints.push({
            x: radius * Math.cos(angle),
            y: 0,
            z: radius * Math.sin(angle)
          });
        }

        drawQueue.push({
          depth: 10 + radius,
          draw: () => {
            // Draw circle path with dash animation flow
            ctx.strokeStyle = radius === probeDistance ? 'rgba(59, 130, 246, 0.95)' : 'rgba(16, 185, 129, 0.45)';
            ctx.lineWidth = radius === probeDistance ? 2.5 : 1.5;
            
            if (current !== 0) {
              ctx.setLineDash([5, 4]);
              ctx.lineDashOffset = -flowOffset * 8;
            } else {
              ctx.setLineDash([]);
            }

            ctx.beginPath();
            circlePoints.forEach((pt, index) => {
              const proj = project(pt, centerX, centerY);
              if (index === 0) ctx.moveTo(proj.x, proj.y);
              else ctx.lineTo(proj.x, proj.y);
            });
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw field direction arrows moving along circle segments
            if (current !== 0) {
              const dir = current > 0 ? 1 : -1; // Grip direction
              const baseAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
              // Slide the arrowheads around the loop dynamically
              const arrowAngles = baseAngles.map(ang => ang + (flowOffset * 0.15 * dir) % (2 * Math.PI));
              
              arrowAngles.forEach(ang => {
                const pt = {
                  x: radius * Math.cos(ang),
                  y: 0,
                  z: radius * Math.sin(ang)
                };
                
                const tangent = {
                  x: -Math.sin(ang) * dir,
                  y: 0,
                  z: Math.cos(ang) * dir
                };

                const projPt = project(pt, centerX, centerY);
                const ptAhead = {
                  x: pt.x + tangent.x * 6,
                  y: pt.y + tangent.y * 6,
                  z: pt.z + tangent.z * 6
                };
                const projAhead = project(ptAhead, centerX, centerY);

                const dx = projAhead.x - projPt.x;
                const dy = projAhead.y - projPt.y;
                const headAngle = Math.atan2(dy, dx);

                ctx.fillStyle = radius === probeDistance ? '#2563eb' : '#10b981';
                ctx.beginPath();
                ctx.moveTo(projPt.x, projPt.y);
                ctx.lineTo(projPt.x - 6 * Math.cos(headAngle - Math.PI/6), projPt.y - 6 * Math.sin(headAngle - Math.PI/6));
                ctx.lineTo(projPt.x - 6 * Math.cos(headAngle + Math.PI/6), projPt.y - 6 * Math.sin(headAngle + Math.PI/6));
                ctx.fill();
              });
            }
          }
        });

        // 4. Compasses mapping on loops
        if (showCompasses && current !== 0) {
          const compassAngle = -yaw; // auto face viewers
          const pt = {
            x: radius * Math.cos(compassAngle),
            y: 0,
            z: radius * Math.sin(compassAngle)
          };

          drawQueue.push({
            depth: 20 + radius,
            draw: () => {
              const proj = project(pt, centerX, centerY);
              
              // Draw compass face circle
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, 8, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();

              // Draw needle pointing in tangent direction of Grip Rule
              const dir = current > 0 ? 1 : -1;
              const tangentX = -Math.sin(compassAngle) * dir;
              const tangentZ = Math.cos(compassAngle) * dir;
              
              // Project needle tips
              const needleNorth = {
                x: pt.x + tangentX * 6,
                y: pt.y,
                z: pt.z + tangentZ * 6
              };
              const needleSouth = {
                x: pt.x - tangentX * 6,
                y: pt.y,
                z: pt.z - tangentZ * 6
              };

              const projNorth = project(needleNorth, centerX, centerY);
              const projSouth = project(needleSouth, centerX, centerY);

              // Red North tip
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(proj.x, proj.y);
              ctx.lineTo(projNorth.x, projNorth.y);
              ctx.stroke();

              // Blue South tip
              ctx.strokeStyle = '#3b82f6';
              ctx.beginPath();
              ctx.moveTo(proj.x, proj.y);
              ctx.lineTo(projSouth.x, projSouth.y);
              ctx.stroke();
            }
          });
        }
      });

      // 5. Active Probe Circle Marker at probe distance
      const probeAngle = Math.PI / 4;
      const probePt = {
        x: probeDistance * Math.cos(probeAngle),
        y: 0,
        z: probeDistance * Math.sin(probeAngle)
      };

      drawQueue.push({
        depth: 200,
        draw: () => {
          const proj = project(probePt, centerX, centerY);
          
          // Draw probe detector tip
          ctx.fillStyle = '#3b82f6';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Label Probe name
          ctx.fillStyle = '#1e3a8a';
          ctx.font = 'bold 8px font-sans';
          ctx.fillText(`Probe (${probeDistance}mm)`, proj.x + 8, proj.y + 3);
        }
      });

      // Sort and execute draw queue
      drawQueue.sort((a, b) => b.depth - a.depth);
      drawQueue.forEach(item => item.draw());

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [yaw, pitch, current, probeDistance, showElectrons, showCompasses]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Parameter Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Rotate3d className="w-4 h-4 text-blue-600 animate-spin" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Field Lab</span>
            </div>

            {/* Current Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.current}</span>
                <span className="text-slate-800 font-mono">{current.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="10.0"
                step="0.5"
                value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Probe distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.probe}</span>
                <span className="text-slate-800 font-mono">{probeDistance} mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={probeDistance}
                onChange={(e) => setProbeDistance(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showElectrons"
                  checked={showElectrons}
                  onChange={(e) => setShowElectrons(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="showElectrons" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                  {t.electrons}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showCompasses"
                  checked={showCompasses}
                  onChange={(e) => setShowCompasses(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="showCompasses" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                  {t.compasses}
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={recorder.recordTrial}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {t.logTrial}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition-colors cursor-pointer"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Right 3D Visualizer (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center relative">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t.title}
              </h3>
              <span className="text-[9px] text-blue-500 font-extrabold uppercase bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {t.interactive3D}
              </span>
            </div>

            <div className="w-full flex justify-center py-2 relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="border border-slate-100 rounded-xl bg-white select-none shadow-sm cursor-grab active:cursor-grabbing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calculation Readings */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.fieldCalculations}
              </h4>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Magnetic Probe Distance:</span>
                  <span className="font-mono text-slate-800 font-bold">{probeDistance} mm</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Electric Current (I):</span>
                  <span className="font-mono text-slate-800 font-bold">{current.toFixed(1)} A</span>
                </div>
                <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                  <span className="text-slate-500">{t.fieldStrength}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">
                    {(fieldStrengthTesla * 1e6).toFixed(3)} μT
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.rightHandRule}:</span>
                  <span className={`font-bold ${current > 0 ? 'text-emerald-600' : current < 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                    {current > 0 ? t.counterClockwise : current < 0 ? t.clockwise : 'No field'}
                  </span>
                </div>
              </div>
            </div>

            {/* Equations Box */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2.5 text-xs text-slate-650 font-medium">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Mathematical Theory
              </h4>
              <p>
                The magnetic field intensity <InlineMath math="B" /> produced by a long straight wire is governed by Ampere's Law:
              </p>
              <BlockMath math="B = \frac{\mu_0 I}{2\pi r}" />
              <p>
                Where <InlineMath math="\mu_0 = 4\pi \times 10^{-7} \text{ T}\cdot\text{m/A}" /> is the permeability of free space.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Lab Notes and History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Lab Notes */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.labNotes}
            </h3>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record the magnetic field dependency on current variations and distance relationships..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium bg-slate-50/20"
          />
        </div>

        {/* Logs List & Laboratory Transfer */}
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
