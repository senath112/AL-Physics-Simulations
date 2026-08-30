import { useState, useRef, useEffect } from 'react';
import { BlockMath } from '../../Math';
import { Sparkles, Info, BookOpen, Maximize2, FileText, Lightbulb, CheckCircle2, Activity, Plus } from 'lucide-react';
import { calculateRayState, traceFibreRay, OpticsParameters } from '../../../physics/opticsPhysics';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { geometricalOpticsGraphs } from '../../graphing/presets';

const OPTICS_THEORY_NOTES = {
  en: {
    badge: 'Geometrical Optics • Interactive Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Physical Laws',
    tabFormulas: 'Equations & SI Units',
    tabTips: 'A/L Exam Insights',

    snellDefTitle: "1. Reflection & Snell's Law of Refraction",
    snellDefBody: "When light encounters a boundary between two transparent media with refractive indices n₁ and n₂, a portion reflects while the remainder refracts. The angle of refraction θ₂ follows Snell's Law:",

    tirTitle: '2. Total Internal Reflection (TIR) & Critical Angle',
    tirBody: 'When light travels from an optically denser medium (n₁) to a rarer medium (n₂ < n₁), the refracted ray bends away from the normal. At the Critical Angle (θ_c), the refracted angle reaches 90°:',
    tirCondTitle: 'Two Necessary Conditions for TIR:',
    tirConds: [
      'Light must travel from an optically denser medium to a rarer medium (n₁ > n₂).',
      'The angle of incidence must exceed the critical angle (θ₁ > θ_c).'
    ],

    fibreTitle: '3. Optical Fibre Guidance',
    fibreBody: 'Optical fibres transmit light signals over long distances via repeated total internal reflections inside a high-index core (n_core) surrounded by lower-index cladding (n_cladding < n_core). The maximum entry angle into the fibre core is the Acceptance Angle (θ_a):',

    eqTitle: 'Essential Optics Equations',

    tipsTitle: 'G.C.E. A/L Exam Key Insights',
    tips: [
      'Frequency Invariance: Light frequency f remains unchanged across refraction interfaces; only speed v and wavelength λ change (v = f λ).',
      'Dense vs Rarer Medium: Optically denser media have higher refractive index n, lower speed of light v = c/n, and smaller critical angles.',
      'Real vs Apparent Depth: Apparent depth shift Δx = t(1 - 1/n) where t is glass slab thickness.'
    ]
  },
  si: {
    badge: 'ජ්‍යාමිතික ආලෝකය • අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ නියම',
    tabFormulas: 'සමීකරණ සහ ඒකක',
    tabTips: 'උසස් පෙළ විභාග සටහන්',

    snellDefTitle: '1. පරාවර්තනය සහ ස්නෙල්ගේ වර්තන නියමය',
    snellDefBody: 'වර්තනාංක n₁ සහ n₂ වන විනිවිද පෙනෙන මාධ්‍ය දෙකක මායිමකට ආලෝකය පතනය වන විට, ස්නෙල්ගේ නියමයට අනුව වර්තන කෝණය θ₂ ගණනය කෙරේ:',

    tirTitle: '2. පූර්ණ අභ්‍යන්තර පරාවර්තනය (TIR) සහ ඡේදක කෝණය',
    tirBody: 'වර්තනාංකය වැඩි ප්‍රකාශ ඝන මාධ්‍යයක සිට (n₁) වර්තනාංකය අඩු මාධ්‍යයකට (n₂ < n₁) ආලෝකය ගමන් කරන විට, වර්තිත කිරණය අභිලම්බයෙන් ඈතට නැමේ. වර්තන කෝණය 90° වන පතන කෝණය ඡේදක කෝණය (θ_c) ලෙස හැඳින්වේ:',
    tirCondTitle: 'පූර්ණ අභ්‍යන්තර පරාවර්තනයට අත්‍යවශ්‍ය කොන්දේසි 2:',
    tirConds: [
      'ආලෝකය ප්‍රකාශ ඝන මාධ්‍යයක සිට විරල මාධ්‍යයකට ගමන් කළ යුතුය (n₁ > n₂).',
      'පතන කෝණය ඡේදක කෝණයට වඩා වැඩි විය යුතුය (θ₁ > θ_c).'
    ],

    fibreTitle: '3. ප්‍රකාශ තන්තු (Optical Fibre) තාක්ෂණය',
    fibreBody: 'ප්‍රකාශ තන්තු මගින් ආලෝක සංඥා පූර්ණ අභ්‍යන්තර පරාවර්තනය මගින් ගමන් කරවයි. මෙහිදී අභ්‍යන්තර මාධ්‍යයේ වර්තනාංකය (n_core) පිටත මාධ්‍යයේ වර්තනාංකයට (n_cladding) වඩා වැඩිවේ:',

    eqTitle: 'විෂය නිර්දේශයේ ප්‍රධාන සමීකරණ',

    tipsTitle: 'උසස් පෙළ විභාගයට වැදගත් කරුණු',
    tips: [
      'සංඛ්‍යාතයේ නියතතාව: වර්තනයේදී ආලෝකයේ සංඛ්‍යාතය f වෙනස් නොවේ. වෙනස් වන්නේ ප්‍රවේගය v සහ තරංග ආයාමය λ පමණි (v = f λ).',
      'ප්‍රකාශ ඝන මාධ්‍ය: ප්‍රකාශ ඝන මාධ්‍යයන්හි වර්තනාංකය n වැඩි වන අතර ආලෝකයේ ප්‍රවේගය v = c/n අඩුවේ.',
      'සත්‍ය සහ අතථ්‍ය ගැඹුර: අතථ්‍ය විස්ථාපනය Δx = t(1 - 1/n) (මෙහි t යනු වීදුරු පුවරුවේ ඝනකමයි).'
    ]
  },
  ta: {
    badge: 'வடிவவியல் ஒளியியல் • குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் விதிகள்',
    tabFormulas: 'சமன்பாடுகள் மற்றும் அலகுகள்',
    tabTips: 'தேர்வுக்கான முக்கிய குறிப்புகள்',

    snellDefTitle: '1. எதிரொளிப்பு மற்றும் ஸ்நெல்லின் முறிவு விதி',
    snellDefBody: 'ஒளி முறிவு எண்கள் n₁ மற்றும் n₂ கொண்ட இரு ஊடகங்களின் எல்லையை அடையும் போது, ஸ்நெல்லின் விதிப்படி முறிவுக் கோணம் θ₂ அமையும்:',

    tirTitle: '2. முழு அக எதிரொளிப்பு (TIR) மற்றும் மாறுநிலைக் கோணம்',
    tirBody: 'ஒளி அடர்வு கூடிய ஊடகத்திலிருந்து (n₁) அடர்வு குறைந்த ஊடகத்திற்கு (n₂ < n₁) செல்லும்போது, முறிவுக் கோணம் 90° ஆகும் படுகோணம் மாறுநிலைக் கோணம் (θ_c) எனப்படும்:',
    tirCondTitle: 'முழு அக எதிரொளிப்பிற்குத் தேவையான 2 நிபந்தனைகள்:',
    tirConds: [
      'ஒளி அடர்வு கூடிய ஊடகத்திலிருந்து அடர்வு குறைந்த ஊடகத்திற்குச் செல்ல வேண்டும் (n₁ > n₂).',
      'படுகோணம் மாறுநிலைக் கோணத்தை விட அதிகமாக இருக்க வேண்டும் (θ₁ > θ_c).'
    ],

    fibreTitle: '3. ஒளி இழையியல் (Optical Fibre)',
    fibreBody: 'ஒளி இழைகள் முழு அக எதிரொளிப்பு மூலம் ஒளி சிக்னல்களை கடத்துகின்றன. இதில் உள்ளக முறிவு எண் (n_core) வெளிப்பூச்சின் முறிவு எண்ணை (n_cladding) விட அதிகமாகும்:',

    eqTitle: 'முக்கிய ஒளியியல் சமன்பாடுகள்',

    tipsTitle: 'உயர்தர தேர்வுக்கான முக்கிய தகவல்கள்',
    tips: [
      'அதிர்வெண்ணின் மாறாத்தன்மை: ஒளியின் அதிர்வெண் f மாறாது; வேகம் v மற்றும் அலைநீளம் λ மட்டுமே மாறுகின்றன.',
      'அடர்வு கூடிய ஊடகம்: உயர் முறிவு எண் n கொண்ட ஊடகத்தில் ஒளியின் வேகம் v = c/n குறைவாகும்.',
      'உண்மை மற்றும் தோற்ற ஆழம்: தோற்ற இடப்பெயர்ச்சி Δx = t(1 - 1/n).'
    ]
  }
};

export function GeometricalOpticsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const tn = OPTICS_THEORY_NOTES[lang] || OPTICS_THEORY_NOTES.en;
  const [viewMode, setViewMode] = useState<'notebook' | 'sim_only'>('notebook');
  const [activeTheoryTab, setActiveTheoryTab] = useState<'theory' | 'formulas' | 'tips'>('theory');

  // Parameters
  const [mode, setMode] = useState<'reflection' | 'refraction' | 'tir' | 'fibre'>('refraction');
  const [explainMode] = useState<boolean>(true);
  const [removeReflection, setRemoveReflection] = useState<boolean>(true);
  const [n1, setN1] = useState<number>(1.00); // Rare or Dense depending on state
  const [n2, setN2] = useState<number>(1.50); // Rare or Dense
  const [incidentAngle, setIncidentAngle] = useState<number>(30); // degrees
  
  // Fibre specifics
  const [nCore, setNCore] = useState<number>(1.50);
  const [nCladding, setNCladding] = useState<number>(1.35);
  const [entryAngle, setEntryAngle] = useState<number>(20);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRay = useRef(false);

  // Synchronize initial indices depending on mode
  useEffect(() => {
    if (mode === 'tir') {
      setN1(1.50);
      setN2(1.00);
      setIncidentAngle(45);
    } else if (mode === 'refraction') {
      setN1(1.00);
      setN2(1.50);
      setIncidentAngle(30);
    } else if (mode === 'reflection') {
      setN1(1.00);
      setN2(1.00);
      setIncidentAngle(30);
    }
  }, [mode]);

  // Ray parameters
  const params: OpticsParameters = {
    mode,
    n1: mode === 'fibre' ? 1.00 : n1,
    n2: mode === 'fibre' ? nCore : n2,
    incidentAngle: mode === 'fibre' ? entryAngle : incidentAngle,
  };

  const rayState = calculateRayState(params);
  const fibreRay = traceFibreRay(1.00, nCore, nCladding, entryAngle, 50, 480);

  // Draw simulation viewport with high-DPI Retina scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 720;
    const rectHeight = 380;

    // Set canvas buffer size matching device pixel ratio
    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;

    // Set CSS display dimensions
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Draw background grid lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    for (let x = 0; x < rectWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rectHeight);
      ctx.stroke();
    }
    for (let y = 0; y < rectHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rectWidth, y);
      ctx.stroke();
    }

    const centerX = rectWidth / 2;
    const centerY = rectHeight / 2;
    const radius = 160;

    const drawRayWithArrow = (
      c: CanvasRenderingContext2D,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      color: string
    ) => {
      c.save();
      c.strokeStyle = color;
      c.fillStyle = color;
      c.lineWidth = 3.5;

      // Draw path line
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();

      // Find arrow placement at midpoint
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const headLen = 11;

      c.beginPath();
      c.moveTo(mx, my);
      c.lineTo(mx - headLen * Math.cos(angle - Math.PI / 7), my - headLen * Math.sin(angle - Math.PI / 7));
      c.lineTo(mx - headLen * Math.cos(angle + Math.PI / 7), my - headLen * Math.sin(angle + Math.PI / 7));
      c.closePath();
      c.fill();
      c.restore();
    };

    if (mode !== 'fibre') {
      // 1. Draw boundary and media blocks
      if (mode === 'reflection') {
        // Uniform medium for reflection (no second medium)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, rectWidth, rectHeight);

        // Draw mirror backing slanted hashes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        for (let x = 5; x < rectWidth; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, centerY);
          ctx.lineTo(x - 5, centerY + 6);
          ctx.stroke();
        }
      } else {
        // Refraction / TIR: Draw dual media blocks
        // Top Medium (n1)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, rectWidth, centerY);

        // Bottom Medium (n2)
        const blueAlpha = Math.min(0.2, (n2 - 1) * 0.15);
        ctx.fillStyle = `rgba(37, 99, 235, ${blueAlpha})`;
        ctx.fillRect(0, centerY, rectWidth, centerY);
      }

      // Boundary interface Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(rectWidth, centerY);
      ctx.stroke();

      // Normal Line (dashed)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX, rectHeight - 20);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // 2. Incident Ray (incoming from top-left quadrant)
      const rad = (incidentAngle * Math.PI) / 180;
      const startX = centerX - radius * Math.sin(rad);
      const startY = centerY - radius * Math.cos(rad);

      // Always pointed inward (from start to center)
      drawRayWithArrow(ctx, startX, startY, centerX, centerY, '#ef4444');

      // Laser source head (drag handle)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Reflected Ray
      // Reflection always exists in reflection mode, or when TIR happens, or if refraction mode has reflection enabled
      const drawReflection = mode === 'reflection' || rayState.isTIR || (mode === 'refraction' && !removeReflection);
      const refX = centerX + radius * Math.sin(rad);
      const refY = centerY - radius * Math.cos(rad);

      if (drawReflection) {
        // Pointed outward (from center to refX, refY)
        drawRayWithArrow(ctx, centerX, centerY, refX, refY, '#f59e0b');

        // Draw letter 'r' reflected normal angle arc (top-right) with value
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 32, -Math.PI / 2, -Math.PI / 2 + rad);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px font-sans';
        ctx.fillText(`r = ${incidentAngle.toFixed(1)}°`, centerX + 8, centerY - 38);
      }

      // 4. Refracted Ray (going into bottom quadrant)
      if (mode !== 'reflection' && !rayState.isTIR && rayState.refractedAngleRad !== null) {
        const refrRad = rayState.refractedAngleRad;
        const refrX = centerX + radius * Math.sin(refrRad);
        const refrY = centerY + radius * Math.cos(refrRad);

        // Pointed outward (from center to refracted end)
        drawRayWithArrow(ctx, centerX, centerY, refrX, refrY, '#3b82f6');

        // Draw letter 'r' refracted normal angle arc (bottom-right) with value
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 32, Math.PI / 2 - refrRad, Math.PI / 2);
        ctx.stroke();
        
        const refrAngleDeg = (refrRad * 180) / Math.PI;
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 11px font-sans';
        ctx.fillText(`r = ${refrAngleDeg.toFixed(1)}°`, centerX + 8, centerY + 42);
      }

      // Draw letter 'i' incident normal angle arc (top-left) with value
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, -Math.PI / 2 - rad, -Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px font-sans';
      ctx.fillText(`i = ${incidentAngle.toFixed(1)}°`, centerX - 60, centerY - 38);

      // Medium labels
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px font-sans';
      ctx.fillText(`Medium 1: Refractive Index n₁ = ${n1.toFixed(2)}`, 25, 30);
      if (mode !== 'reflection') {
        ctx.fillText(`Medium 2: Refractive Index n₂ = ${n2.toFixed(2)}`, 25, rectHeight - 25);
      }

      // Critical Angle Text overlay if active
      if (mode === 'tir' && rayState.criticalAngleRad !== null) {
        const critAngleDeg = (rayState.criticalAngleRad * 180) / Math.PI;
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 12px font-sans';
        ctx.fillText(`Critical Angle θc = ${critAngleDeg.toFixed(1)}°`, rectWidth - 190, 30);
      }

      // Explain Mode Text overlay bubbles inside viewport
      if (explainMode) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(20, centerY - 45, 240, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px font-mono';
        ctx.fillText(
          rayState.isTIR ? 'State: Total Internal Reflection' : `Refraction: bends ${n1 > n2 ? 'away' : 'toward'} normal`,
          30,
          centerY - 25
        );
      }

    } else {
      // 5. Optical Fibre layout rendering
      const fibreHeight = 120;
      const startX = 80;
      const startY = centerY - fibreHeight / 2;
      const coreHalfHeight = fibreHeight / 2;

      // Draw Cladding Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(startX, startY - 30, 560, fibreHeight + 60);

      // Cladding label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px font-sans';
      ctx.fillText(`Cladding (n = ${nCladding.toFixed(2)})`, startX + 15, startY - 15);
      ctx.fillText(`Cladding (n = ${nCladding.toFixed(2)})`, startX + 15, startY + fibreHeight + 25);

      // Draw Core Block
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.fillRect(startX, startY, 560, fibreHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, 560, fibreHeight);

      // Core label
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 11px font-sans';
      ctx.fillText(`Core (n = ${nCore.toFixed(2)})`, startX + 20, centerY - 5);

      // Draw ray entering from outside
      const entryRad = (entryAngle * Math.PI) / 180;
      const laserStartX = startX - 60;
      const laserStartY = centerY - 60 * Math.tan(entryRad);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laserStartX, laserStartY);
      ctx.lineTo(startX, centerY);
      ctx.stroke();

      // Laser base handle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(laserStartX, laserStartY, 7, 0, 2 * Math.PI);
      ctx.fill();

      // Normal dashed line at face
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX - 30, centerY);
      ctx.lineTo(startX + 30, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw trace points inside Core
      const fibreTrace = traceFibreRay(1.00, nCore, nCladding, entryAngle, coreHalfHeight, 560);
      if (fibreTrace.points.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, centerY);

        fibreTrace.points.forEach((pt, idx) => {
          if (idx === 0) return;
          ctx.lineTo(startX + pt.x, centerY + pt.y);
        });
        ctx.stroke();

        // Trace intersections as yellow glowing points
        ctx.fillStyle = '#eab308';
        fibreTrace.points.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(startX + pt.x, centerY + pt.y, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      if (explainMode) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(15, centerY - 95, 260, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px font-mono';
        ctx.fillText(
          fibreTrace.isGuided ? 'State: Ray is GUIDED (TIR Active)' : 'State: Ray ESCAPES cladding',
          25,
          centerY - 75
        );
      }
    }

    ctx.restore();
  }, [mode, n1, n2, incidentAngle, nCore, nCladding, entryAngle, explainMode, rayState, fibreRay]);

  // Handle Dragging Ray source to rotate incident angle
  const handleMouseDown = () => {
    if (mode === 'fibre') return; 
    isDraggingRay.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRay.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    // Calculate angle in degrees from mouse relative position to normal vector
    const dx = centerX - x;
    const dy = centerY - y;

    if (dy > 0 && dx > 0) {
      let angle = Math.atan(dx / dy) * (180 / Math.PI);
      if (angle >= 0 && angle <= 89.9) {
        setIncidentAngle(angle);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRay.current = false;
  };



  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'optics_sim',
    simulationTitle: 'Geometrical Optics & Refraction',
    category: 'optics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'incidentAngleDeg', label: 'Incident Angle i', unit: '°' },
      { key: 'sinI', label: 'sin(i)', unit: '' },
      { key: 'refractedAngleDeg', label: 'Refracted Angle r', unit: '°' },
      { key: 'sinR', label: 'sin(r)', unit: '' },
      { key: 'n1', label: 'Medium 1 Index (n₁)', unit: '' },
      { key: 'n2', label: 'Medium 2 Index (n₂)', unit: '' },
      { key: 'status', label: 'State / Phenomenon', unit: '' },
    ],
    getCurrentRow: () => {
      const iRad = (incidentAngle * Math.PI) / 180;
      const sinIVal = Math.sin(iRad);
      const rDeg = rayState.isTIR ? null : (rayState.refractedAngleRad !== null ? (rayState.refractedAngleRad * 180) / Math.PI : null);
      const sinRVal = rayState.isTIR || rayState.refractedAngleRad === null ? 0 : Math.sin(rayState.refractedAngleRad);
      return {
        incidentAngleDeg: incidentAngle,
        sinI: parseFloat(sinIVal.toFixed(4)),
        refractedAngleDeg: rDeg !== null ? parseFloat(rDeg.toFixed(2)) : 'TIR',
        sinR: parseFloat(sinRVal.toFixed(4)),
        n1: mode === 'fibre' ? 1.0 : n1,
        n2: mode === 'fibre' ? nCore : n2,
        status: mode === 'fibre' ? (fibreRay.isGuided ? 'GUIDED' : 'LOSS') : (rayState.isTIR ? 'TIR' : 'REFRACTED'),
      };
    },
    getSeriesData: () => {
      const angles = [10, 20, 30, 40, 50, 60, 70, 80];
      return angles.map((ang, idx) => {
        const iRad = (ang * Math.PI) / 180;
        const sinI = Math.sin(iRad);
        const ratio = (n1 * sinI) / n2;
        const isTir = ratio > 1;
        const rRad = isTir ? null : Math.asin(ratio);
        const rDeg = rRad !== null ? (rRad * 180) / Math.PI : null;
        return {
          trial: idx + 1,
          incidentAngleDeg: ang,
          sinI: parseFloat(sinI.toFixed(4)),
          refractedAngleDeg: rDeg !== null ? parseFloat(rDeg.toFixed(2)) : 'TIR',
          sinR: rRad !== null ? parseFloat(Math.sin(rRad).toFixed(4)) : 0,
          n1,
          n2,
          status: isTir ? 'TIR' : 'REFRACTED',
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Incident Angle i = 15°', params: { incidentAngle: 15 }, durationMs: 750 },
        { label: 'Incident Angle i = 30°', params: { incidentAngle: 30 }, durationMs: 750 },
        { label: 'Incident Angle i = 45°', params: { incidentAngle: 45 }, durationMs: 750 },
        { label: 'Incident Angle i = 60°', params: { incidentAngle: 60 }, durationMs: 750 },
        { label: 'Incident Angle i = 75°', params: { incidentAngle: 75 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.incidentAngle !== undefined) setIncidentAngle(p.incidentAngle);
      },
    },
    defaultGraphConfig: {
      xAxis: 'sinI',
      yAxis: 'sinR',
      title: "Snell's Law: sin(r) vs sin(i) (Slope = n₁/n₂)",
      showRegression: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-700 mb-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            {tn.badge}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Geometrical Optics & Refraction
          </h2>
        </div>

        {/* View Mode Toggle Pill Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('notebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'notebook'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{tn.notebookMode}</span>
          </button>
          <button
            onClick={() => setViewMode('sim_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'sim_only'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{tn.simOnlyMode}</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE THEORY NOTEBOOK CARD (Visible in Notebook Mode) */}
      {viewMode === 'notebook' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Notebook Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTheoryTab('theory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'theory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tn.tabTheory}</span>
            </button>
            <button
              onClick={() => setActiveTheoryTab('formulas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'formulas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{tn.tabFormulas}</span>
            </button>
            <button
              onClick={() => setActiveTheoryTab('tips')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'tips'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>{tn.tabTips}</span>
            </button>
          </div>

          {/* Tab 1: Theory & Physical Laws */}
          {activeTheoryTab === 'theory' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.snellDefTitle}</h3>
                <p>{tn.snellDefBody}</p>
                <div className="pt-1 text-center font-bold text-blue-700">
                  <BlockMath math="n_1 \sin\theta_1 = n_2 \sin\theta_2" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {tn.tirTitle}
                </h4>
                <p>{tn.tirBody}</p>
                <BlockMath math="\sin\theta_c = \frac{n_2}{n_1} \quad (n_1 > n_2)" />
                
                <div className="bg-amber-50/70 border border-amber-200/70 p-3 rounded-lg text-amber-900 font-medium space-y-1">
                  <span className="font-bold">{tn.tirCondTitle}</span>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {tn.tirConds.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">{tn.fibreTitle}</h4>
                <p>{tn.fibreBody}</p>
                <BlockMath math="\sin\theta_a = \sqrt{n_{core}^2 - n_{cladding}^2}" />
              </div>
            </div>
          )}

          {/* Tab 2: Equations & SI Units */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.eqTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-xs">Refraction & Critical Angle</h4>
                  <BlockMath math="n_1 \sin\theta_1 = n_2 \sin\theta_2" />
                  <BlockMath math="\sin\theta_c = \frac{n_2}{n_1} = \frac{1}{n}" />
                  <BlockMath math="{}_1 n_2 = \frac{n_2}{n_1} = \frac{v_1}{v_2} = \frac{\lambda_1}{\lambda_2}" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-indigo-700 text-xs">Depth & Fibre Equations</h4>
                  <BlockMath math="n = \frac{\text{Real Depth}}{\text{Apparent Depth}}" />
                  <BlockMath math="\Delta x = t \left(1 - \frac{1}{n}\right)" />
                  <BlockMath math="\sin\theta_{acceptance} = \sqrt{n_1^2 - n_2^2}" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Exam Insights */}
          {activeTheoryTab === 'tips' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {tn.tipsTitle}
              </h3>
              <div className="space-y-2.5">
                {tn.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl text-xs text-amber-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Control Panel + Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Mode Selector Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Experiment Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('reflection')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'reflection' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Reflection
              </button>
              <button
                onClick={() => setMode('refraction')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'refraction' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Refraction
              </button>
              <button
                onClick={() => setMode('tir')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'tir' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                TIR & Critical Angle
              </button>
              <button
                onClick={() => setMode('fibre')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'fibre' ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Optical Fibre
              </button>
            </div>

            {/* Reflection toggle checkbox for refraction mode */}
            {mode === 'refraction' && (
              <div className="pt-2.5 flex items-center gap-2 border-t border-slate-100 mt-2">
                <input
                  type="checkbox"
                  id="removeReflection"
                  checked={removeReflection}
                  onChange={(e) => setRemoveReflection(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-350 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="removeReflection" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Remove reflection ray in refraction
                </label>
              </div>
            )}
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adjust Wave Parameters</h3>

            {mode !== 'fibre' ? (
              <div className="space-y-4">
                {/* n1 parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Medium 1 Index (n₁)</span>
                    <span className="text-slate-800 font-mono">{n1.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="2.00"
                    step="0.01"
                    value={n1}
                    onChange={(e) => setN1(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                    <span>1.00 (Air)</span>
                    <span>2.00 (Glass Dense)</span>
                  </div>
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => setN1(1.00)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.00 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Air (1.00)
                    </button>
                    <button
                      onClick={() => setN1(1.33)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.33 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Water (1.33)
                    </button>
                    <button
                      onClick={() => setN1(1.50)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n1 === 1.50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Glass (1.50)
                    </button>
                  </div>
                </div>

                {/* n2 parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Medium 2 Index (n₂)</span>
                    <span className="text-slate-800 font-mono">{n2.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="2.00"
                    step="0.01"
                    value={n2}
                    onChange={(e) => setN2(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                    <span>1.00 (Air)</span>
                    <span>2.00 (Glass Dense)</span>
                  </div>
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => setN2(1.00)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.00 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Air (1.00)
                    </button>
                    <button
                      onClick={() => setN2(1.33)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.33 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Water (1.33)
                    </button>
                    <button
                      onClick={() => setN2(1.50)}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer ${
                        n2 === 1.50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Glass (1.50)
                    </button>
                  </div>
                </div>

                {/* Incident Angle parameter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Angle of Incidence (i)</span>
                    <span className="text-slate-800 font-mono">{incidentAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="89.5"
                    step="0.5"
                    value={incidentAngle}
                    disabled={recorder.isAutoRunning}
                    onChange={(e) => setIncidentAngle(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 font-medium block">Tip: Drag the red laser handle directly on the viewport!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Core Index */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Core Refractive Index (n_core)</span>
                    <span className="text-slate-800 font-mono">{nCore.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="1.80"
                    step="0.02"
                    value={nCore}
                    onChange={(e) => setNCore(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Cladding Index */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Cladding Index (n_cladding)</span>
                    <span className="text-slate-800 font-mono">{nCladding.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="1.80"
                    step="0.02"
                    value={nCladding}
                    onChange={(e) => setNCladding(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Entry Angle */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Fibre Entry Angle</span>
                    <span className="text-slate-800 font-mono">{entryAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="70"
                    step="1"
                    value={entryAngle}
                    onChange={(e) => setEntryAngle(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={recorder.recordTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Trial Snapshot
            </button>
          </div>

        </div>

        {/* Viewport + Math/Explanation Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Visual Canvas Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-start">Visual Ray Viewport</h3>
            <div className="w-full overflow-x-auto flex justify-center py-2">
              <canvas
                ref={canvasRef}
                className="border border-slate-100 rounded-lg bg-white cursor-crosshair select-none shadow-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          {/* Explain Mode Real-time Card overlay */}
          {explainMode && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="w-4 h-4" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Concept Explainer Overlay</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {mode === 'fibre' ? fibreRay.explanation : rayState.explanation}
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/70 rounded-lg p-3 border border-blue-200/50">
                <div className="text-xs font-bold text-slate-500 font-mono">Mathematical Formula:</div>
                <div className="text-xs font-bold text-slate-800">
                  {mode === 'reflection' && <BlockMath math="\theta_i = \theta_r" />}
                  {(mode === 'refraction' || mode === 'tir') && (
                    <BlockMath math={rayState.snellsEquationText} />
                  )}
                  {mode === 'fibre' && (
                    <BlockMath math={`\\sin \\theta_{max} = \\sqrt{n_{core}^2 - n_{cladding}^2}`} />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Automatic Real-time Graph Section */}
      <div className="w-full">
        <ScientificGraphLab
          graphs={geometricalOpticsGraphs}
          trials={recorder.recordedRows}
          simulationParams={{ n1, n2, incidentAngle }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={300}
        />
      </div>

    </div>
  );
}
