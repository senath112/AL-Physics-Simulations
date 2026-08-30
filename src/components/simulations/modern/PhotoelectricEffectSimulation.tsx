import { useState, useRef, useEffect, useMemo } from 'react';
import { BlockMath } from '../../Math';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap,
  BookOpen,
  Maximize2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Activity,
  Plus 
} from 'lucide-react';
import { calculatePhotoelectricState, PhotoelectricParameters } from '../../../physics/photoelectricPhysics';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { photoelectricGraphs } from '../../graphing/presets';

const PHOTOELECTRIC_THEORY_NOTES = {
  en: {
    badge: 'Modern Physics • Interactive Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Physical Laws',
    tabFormulas: 'Equations & SI Units',
    tabTips: 'A/L Exam Insights',

    photoDefTitle: "1. Einstein's Photoelectric Theory & Quantum Postulate",
    photoDefBody: "Light energy travels in discrete, localized energy packets called photons. When a photon with frequency f and energy E = h f hits a cathode metal, its entire energy is transferred instantaneously to a single bound electron.",

    workFuncTitle: '2. Work Function (Φ) & Threshold Frequency (f₀)',
    workFuncBody: 'The Work Function (Φ) is the minimum energy required to liberate an electron from the metal surface. Photoelectric emission occurs ONLY if incident photon energy exceeds the work function (E > Φ), corresponding to a minimum Threshold Frequency (f₀):',

    stoppingTitle: '3. Stopping Potential (V_s) & Photocurrent (I)',
    stoppingBody: 'The Stopping Potential (V_s) is the retarding reverse voltage required to halt even the fastest photoelectrons (K_max):',
    stoppingList: [
      'Kinetic Energy: K_max = e V_s = ½ m v_max².',
      'Intensity Effect: Increasing light intensity increases photon flux and photocurrent (I), but does NOT alter Stopping Potential (V_s).',
      'Frequency Effect: Increasing light frequency (f) increases photon energy and Stopping Potential (V_s).'
    ],

    eqTitle: 'Essential Photoelectric Equations',

    tipsTitle: 'G.C.E. A/L Exam Key Insights',
    tips: [
      'Universal Slope in V_s vs f Graph: The slope of the Stopping Voltage vs Frequency line is always h/e (a universal constant for ALL metals!).',
      'Instantaneous Emission: Emission occurs without measurable time delay (~10⁻⁹ s) once f ≥ f₀, contradicting wave theory.',
      'Intensity vs Frequency Separation: Intensity controls QUANTITY of electrons (current I); Frequency controls QUALITY of electrons (energy K_max).'
    ]
  },
  si: {
    badge: 'නූතන භෞතික විද්‍යාව • අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ නියම',
    tabFormulas: 'සමීකරණ සහ ඒකක',
    tabTips: 'උසස් පෙළ විභාග සටහන්',

    photoDefTitle: '1. අයින්ස්ටයින්ගේ ප්‍රකාශ විද්‍යුත් සිද්ධාන්තය',
    photoDefBody: 'ආලෝක ශක්තිය ෆෝටෝන ලෙස හඳුන්වන ශක්ති ක්වොන්ටම් ආකාරයෙන් ගමන් කරයි (E = h f). ෆෝටෝනයක් ලෝහ පෘෂ්ඨයක ගැටෙන විට එහි මුළු ශක්තියම එකම ඉලෙක්ට්‍රෝනයකට ක්ෂණිකව ලබා දේ.',

    workFuncTitle: '2. කාර්ය ශ්‍රිතය (Φ) සහ සීමාකාරී සංඛ්‍යාතය (f₀)',
    workFuncBody: 'ලෝහ පෘෂ්ඨයකින් ඉලෙක්ට්‍රෝනයක් නිදහස් කර ගැනීමට අවශ්‍ය අවම ශක්තිය කාර්ය ශ්‍රිතය (Φ) ලෙස හැඳින්වේ. ප්‍රකාශ විද්‍යුත් විමෝචනය සිදුවීමට පතන සංඛ්‍යාතය සීමාකාරී සංඛ්‍යාතයට (f₀) වඩා වැඩි විය යුතුය:',

    stoppingTitle: '3. නැවැත්වීමේ විභවය (V_s) සහ ප්‍රකාශ විද්‍යුත් ධාරාව (I)',
    stoppingBody: 'උපරිම ගති ශක්තියක් සහිත ඉලෙක්ට්‍රෝන පවා නැවැත්වීමට යොදන ඍණ විභවය නැවැත්වීමේ විභවය (V_s) ලෙස හැඳින්වේ:',
    stoppingList: [
      'ගති ශක්තිය: K_max = e V_s = ½ m v_max².',
      'තීව්‍රතාවයේ බලපෑම: ආලෝක තීව්‍රතාව වැඩි කරන විට ධාරාව (I) වැඩි වන නමුත් නැවැත්වීමේ විභවය (V_s) වෙනස් නොවේ.',
      'සංඛ්‍යාතයේ බලපෑම: ආලෝකයේ සංඛ්‍යාතය (f) වැඩි කරන විට නැවැත්වීමේ විභවය (V_s) වැඩි වේ.'
    ],

    eqTitle: 'විෂය නිර්දේශයේ ප්‍රධාන සමීකරණ',

    tipsTitle: 'උසස් පෙළ විභාගයට වැදගත් කරුණු',
    tips: [
      'V_s එදිරිව f ප්‍රස්ථාරයේ අනුක්‍රමණය: නැවැත්වීමේ විභවය එදිරිව සංඛ්‍යාත ප්‍රස්ථාරයේ අනුක්‍රමණය සැමවිටම h/e වේ (සියලුම ලෝහ සඳහා නියතයකි).',
      'ක්ෂණික විමෝචනය: f ≥ f₀ වන විට කාල පමා වී යාමකින් තොරව ඉලෙක්ට්‍රෝන විමෝචනය වේ.',
      'තීව්‍රතාව සහ සංඛ්‍යාතය: තීව්‍රතාවයෙන් පිටවන ඉලෙක්ට්‍රෝන ගණන (ධාරාව) පාලනය වේ; සංඛ්‍යාතයෙන් ඉලෙක්ට්‍රෝනවල ශක්තිය (K_max) පාලනය වේ.'
    ]
  },
  ta: {
    badge: 'நவீன இயற்பியல் • குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் விதிகள்',
    tabFormulas: 'சமன்பாடுகள் மற்றும் அலகுகள்',
    tabTips: 'தேர்வுக்கான முக்கிய குறிப்புகள்',

    photoDefTitle: "1. ஐன்ஸ்டீனின் ஒளிமின் கோட்பாடு",
    photoDefBody: "ஒளி ஆற்றல் போட்டான்கள் எனப்படும் ஆற்றல் பாக்கெட்டுகளாக பயணிக்கிறது (E = h f). ஒரு போட்டான் உலோகத்தின் மீது மோதும்போது அதன் முழு ஆற்றலும் ஒரு எலக்ட்ரானுக்கு மாற்றப்படுகிறது.",

    workFuncTitle: '2. வேலைச் சார்பு (Φ) மற்றும் தொடக்க அதிர்வெண் (f₀)',
    workFuncBody: 'உலோகப் பரப்பிலிருந்து ஒரு எலக்ட்ரானை விடுவிக்கத் தேவையான குறைந்தபட்ச ஆற்றல் வேலைச் சார்பு (Φ) எனப்படும். படு அதிர்வெண் தொடக்க அதிர்வெண்ணை விட (f₀) அதிகமாக இருக்கும்போது மட்டுமே ஒளிமின் உமிழ்வு நிகழும்:',

    stoppingTitle: '3. நிறுத்த மின்னழுத்தம் (V_s) மற்றும் ஒளிமின் மின்னோட்டம் (I)',
    stoppingBody: 'மிக வேகமான எலக்ட்ரான்களையும் நிறுத்துவதற்குத் தேவையான எதிர் மின்னழுத்தம் நிறுத்த மின்னழுத்தம் (V_s) எனப்படும்:',
    stoppingList: [
      'இயக்க ஆற்றல்: K_max = e V_s = ½ m v_max².',
      'செறிவின் விளைவு: ஒளிச் செறிவை அதிகரிக்கும் போது மின்னோட்டம் (I) அதிகரிக்கும், ஆனால் நிறுத்த மின்னழுத்தம் (V_s) மாறாது.',
      'அதிர்வெண்ணின் விளைவு: அதிர்வெண்ணை (f) அதிகரிக்கும் போது நிறுத்த மின்னழுத்தம் (V_s) அதிகரிக்கும்.'
    ],

    eqTitle: 'முக்கிய ஒளிமின் சமன்பாடுகள்',

    tipsTitle: 'உயர்தர தேர்வுக்கான முக்கிய தகவல்கள்',
    tips: [
      'V_s மற்றும் f வரைபடத்தின் சாய்வு: நிறுத்த மின்னழுத்தம் மற்றும் அதிர்வெண் வரைபடத்தின் சாய்வு எப்போதும் h/e ஆகும் (அனைத்து உலோகங்களுக்கும் மாறிலி).',
      'உடனடி உமிழ்வு: f ≥ f₀ இருக்கும் போது எவ்வித கால தாமதமும் இன்றி எலக்ட்ரான்கள் உமிழப்படும்.',
      'செறிவு மற்றும் அதிர்வெண்: செறிவு எலக்ட்ரான்களின் எண்ணிக்கையைக் (மின்னோட்டம்) கட்டுப்படுத்துகிறது; அதிர்வெண் ஆற்றலைக் (K_max) கட்டுப்படுத்துகிறது.'
    ]
  }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  initialK: number;
}

const METAL_PRESETS = [
  { id: 'sodium', name: 'Sodium (Na)', workFunction: 2.28, color: '#f59e0b' },
  { id: 'zinc', name: 'Zinc (Zn)', workFunction: 4.30, color: '#94a3b8' },
  { id: 'copper', name: 'Copper (Cu)', workFunction: 4.70, color: '#ea580c' },
  { id: 'platinum', name: 'Platinum (Pt)', workFunction: 5.63, color: '#cbd5e1' },
];

// Helper to map wavelength to RGB color
function wavelengthToColor(wavelength: number): string {
  if (wavelength >= 200 && wavelength < 380) {
    // Ultraviolet
    return 'rgba(167, 139, 250, 0.5)';
  } else if (wavelength >= 380 && wavelength < 440) {
    return '#8b5cf6'; // Violet
  } else if (wavelength >= 440 && wavelength < 490) {
    return '#3b82f6'; // Blue
  } else if (wavelength >= 490 && wavelength < 510) {
    return '#06b6d4'; // Cyan
  } else if (wavelength >= 510 && wavelength < 580) {
    return '#10b981'; // Green
  } else if (wavelength >= 580 && wavelength < 640) {
    return '#eab308'; // Yellow/Orange
  } else if (wavelength >= 640 && wavelength <= 750) {
    return '#ef4444'; // Red
  } else {
    // Infrared
    return 'rgba(239, 68, 68, 0.2)';
  }
}

export function PhotoelectricEffectSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      controls: 'Parameters Control Board',
      metal: 'Emitter Target Metal',
      wavelength: 'Light Wavelength (λ)',
      intensity: 'Light Intensity',
      voltage: 'Tube Voltage (V)',
      thresholdWavelength: 'Threshold Wavelength',
      logTrial: 'Log Trial Snapshot',
      physicsCalculations: 'Physics Calculations',
      photonEnergy: 'Photon Energy (E)',
      workFunction: 'Work Function (Φ)',
      maxKE: 'Max Electron K.E.',
      stoppingPotential: 'Stopping Potential (Vs)',
      lightFrequency: 'Light Frequency',
      thresholdFrequency: 'Threshold Frequency',
      emissionStatus: 'Emission Status',
      theoryFormulas: 'Show Theory & Formulas',
      labNotes: 'Interactive Lab Journal',
      trialHistory: 'Recorded Trial Parameters History',
      clear: 'Clear',
      pdf: 'Export PDF',
    },
    si: {
      controls: 'පරාමිති පාලන පුවරුව',
      metal: 'විමෝචක ඉලක්ක ලෝහය',
      wavelength: 'ආලෝක තරංග ආයාමය (λ)',
      intensity: 'ආලෝක තීව්‍රතාවය',
      voltage: 'නල වෝල්ටීයතාවය (V)',
      thresholdWavelength: 'කඩඉම් තරංග ආයාමය',
      logTrial: 'නිරීක්ෂණ සටහන් කරන්න',
      physicsCalculations: 'භෞතික විද්‍යාත්මක ගණනය කිරීම්',
      photonEnergy: 'ෆෝටෝන ශක්තිය (E)',
      workFunction: 'කාර්ය ශ්‍රිතය (Φ)',
      maxKE: 'උපරිම චාලක ශක්තිය (Kmax)',
      stoppingPotential: 'නැවැතුම් විභවය (Vs)',
      lightFrequency: 'ආලෝක සංඛ්‍යාතය',
      thresholdFrequency: 'කඩඉම් සංඛ්‍යාතය',
      emissionStatus: 'විමෝචන තත්ත්වය',
      theoryFormulas: 'න්‍යාය සහ සමීකරණ පෙන්වන්න',
      labNotes: 'ලැබ් සටහන් පොත',
      trialHistory: 'පටිගත කරන ලද අත්හදා බැලීම් ඉතිහාසය',
      clear: 'මකන්න',
      pdf: 'PDF ලබාගන්න',
    },
    ta: {
      controls: 'அளவீட்டு கட்டுப்பாட்டு பலகை',
      metal: 'உமிழ்ப்பான் இலக்கு உலோகம்',
      wavelength: 'ஒளி அலைநீளம் (λ)',
      intensity: 'ஒளிச் செறிவு',
      voltage: 'குழாய் மின்னழுத்தம் (V)',
      thresholdWavelength: 'அலைநீள எல்லை',
      logTrial: 'சோதனைப் பதிவைச் சேமி',
      physicsCalculations: 'பௌதிகவியல் கணிப்புகள்',
      photonEnergy: 'போட்டோன் சக்தி (E)',
      workFunction: 'வேலைச் சார்பு (Φ)',
      maxKE: 'அதிகபட்ச இயக்கச் சக்தி (Kmax)',
      stoppingPotential: 'நிறுத்து மின்னழுத்தம் (Vs)',
      lightFrequency: 'ஒளி அதிர்வெண்',
      thresholdFrequency: 'அதிர்வெண் எல்லை',
      emissionStatus: 'உமிழ்வு நிலை',
      theoryFormulas: 'கோட்பாடு & சூத்திரங்களைக் காட்டு',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'பதிவு செய்யப்பட்ட சோதனை வரலாறு',
      clear: 'அழி',
      pdf: 'PDF ஏற்றுமதி செய்',
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const tn = PHOTOELECTRIC_THEORY_NOTES[lang] || PHOTOELECTRIC_THEORY_NOTES.en;
  const [viewMode, setViewMode] = useState<'notebook' | 'sim_only'>('notebook');
  const [activeTheoryTab, setActiveTheoryTab] = useState<'theory' | 'formulas' | 'tips'>('theory');

  // Parameters
  const [metalId, setMetalId] = useState<string>('sodium');
  const [wavelength, setWavelength] = useState<number>(350); // nm
  const [intensity, setIntensity] = useState<number>(50); // %
  const [voltage, setVoltage] = useState<number>(1.5); // V
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [explainMode, setExplainMode] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Find active metal preset
  const activeMetal = useMemo(() => {
    return METAL_PRESETS.find(m => m.id === metalId) || METAL_PRESETS[0];
  }, [metalId]);

  // Compute current physics state
  const currentParams: PhotoelectricParameters = {
    wavelength,
    intensity,
    metalWorkFunction: activeMetal.workFunction,
    voltage
  };
  const physicsState = useMemo(() => {
    return calculatePhotoelectricState(currentParams);
  }, [wavelength, intensity, metalId, voltage]);

  // Particle emission loop
  useEffect(() => {
    let lastSpawn = 0;

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rectWidth = 720;
      const rectHeight = 360;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      canvas.style.width = `${rectWidth}px`;
      canvas.style.height = `${rectHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw background grids
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      // Tube dimensions
      const tubeLeft = 180;
      const tubeRight = 540;
      const tubeTop = 80;
      const tubeBottom = 220;
      const tubeWidth = tubeRight - tubeLeft;
      const emitterX = tubeLeft + 30;
      const collectorX = tubeRight - 30;

      // 1. Draw Vacuum Tube Envelope
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(248, 250, 252, 0.3)';
      ctx.beginPath();
      ctx.roundRect(tubeLeft, tubeTop, tubeWidth, tubeBottom - tubeTop, 20);
      ctx.fill();
      ctx.stroke();

      // Glass shine highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tubeLeft + 15, tubeTop + 6);
      ctx.lineTo(tubeRight - 15, tubeTop + 6);
      ctx.stroke();

      // 2. Draw Light Source Beam
      if (intensity > 0) {
        ctx.fillStyle = wavelengthToColor(wavelength);
        ctx.save();
        ctx.globalAlpha = 0.2 + (intensity / 100) * 0.45;
        ctx.beginPath();
        ctx.moveTo(80, 20);
        ctx.lineTo(140, 20);
        ctx.lineTo(emitterX + 15, tubeTop + 50);
        ctx.lineTo(emitterX - 15, tubeTop + 80);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Light bulb shape at top left
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(100, 20, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(85, 0, 30, 8);

        // Filament glow
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(95, 22);
        ctx.lineTo(100, 12);
        ctx.lineTo(105, 22);
        ctx.stroke();
      }

      // 3. Draw Plates
      // Emitter (left plate)
      ctx.fillStyle = activeMetal.color;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.fillRect(emitterX - 8, tubeTop + 20, 8, tubeBottom - tubeTop - 40);
      ctx.strokeRect(emitterX - 8, tubeTop + 20, 8, tubeBottom - tubeTop - 40);

      // Collector (right plate)
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(collectorX, tubeTop + 20, 6, tubeBottom - tubeTop - 40);
      ctx.strokeRect(collectorX, tubeTop + 20, 6, tubeBottom - tubeTop - 40);

      // Labeled Plate names
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 8px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText('EMITTER (' + activeMetal.name.split(' ')[0] + ')', emitterX - 15, tubeBottom - 8);
      ctx.fillText('COLLECTOR', collectorX + 15, tubeBottom - 8);

      // 4. Circuit Wire Connections
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Emitter to bottom circuit
      ctx.moveTo(emitterX - 4, tubeBottom - 40);
      ctx.lineTo(emitterX - 4, 290);
      ctx.lineTo(310, 290);

      // Collector to bottom circuit
      ctx.moveTo(collectorX + 3, tubeBottom - 40);
      ctx.lineTo(collectorX + 3, 290);
      ctx.lineTo(410, 290);
      ctx.stroke();

      // Battery / Variable Voltage Source symbol at bottom center
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(310, 275, 100, 30);
      ctx.strokeRect(310, 275, 100, 30);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px font-mono';
      ctx.textAlign = 'center';
      ctx.fillText(voltage >= 0 ? `+${voltage.toFixed(2)} V` : `${voltage.toFixed(2)} V`, 360, 294);

      // Ammeter box representation on right wire
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(collectorX + 3, 220, 18, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.font = 'black 9px font-mono';
      ctx.fillText(`${physicsState.photocurrent.toFixed(2)} mA`, collectorX + 3, 223);

      // 5. Electron Particles Simulation
      if (isPlaying) {
        // Spawn rate based on intensity & emission status
        if (physicsState.hasEmission && intensity > 0) {
          const spawnInterval = 300 / (intensity * 0.5); // lower interval for more intensity
          if (time - lastSpawn > spawnInterval) {
            // Initial velocity based on photoelectric Kmax
            // Max speed is around 120 pixels/sec, scaled from velocity
            const maxPixelSpeed = 80 + Math.sqrt(physicsState.maxKineticEnergy) * 110;
            
            // Electron particles spawn at emitter
            particlesRef.current.push({
              x: emitterX + 2,
              y: tubeTop + 30 + Math.random() * (tubeBottom - tubeTop - 60),
              vx: 40 + Math.random() * (maxPixelSpeed - 40),
              vy: (Math.random() - 0.5) * 12,
              life: 0,
              maxLife: 6,
              initialK: physicsState.maxKineticEnergy
            });
            lastSpawn = time;
          }
        }

        // Update particles
        const electricFieldStrength = -voltage * 30; // Scale factor for visual deceleration/acceleration
        particlesRef.current = particlesRef.current.filter(p => {
          // Force from voltage accelerates/decelerates electrons horizontally
          p.vx += electricFieldStrength * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          // Remove if bounds reached
          if (p.x >= collectorX) {
            // Reached collector plate!
            return false;
          }
          if (p.x <= emitterX) {
            // Turned back and hit emitter plate
            return false;
          }
          return p.life < p.maxLife;
        });
      }

      // Draw active particles
      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = '#60a5fa';
      particlesRef.current.forEach(p => {
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Emitter electron cloud (very subtle glow on emission)
      if (physicsState.hasEmission && intensity > 0) {
        ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
        ctx.beginPath();
        ctx.ellipse(emitterX + 6, tubeTop + (tubeBottom-tubeTop)/2, 10, (tubeBottom-tubeTop)/2 - 15, 0, 0, 2*Math.PI);
        ctx.fill();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, metalId, wavelength, intensity, voltage, physicsState]);

  // Reset parameters to safety
  const handleReset = () => {
    setWavelength(350);
    setIntensity(50);
    setVoltage(1.5);
    particlesRef.current = [];
  };



  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'photoelectric_sim',
    simulationTitle: 'Photoelectric Effect & Quantum Physics',
    category: 'modern',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'metal', label: 'Target Metal', unit: '' },
      { key: 'frequency', label: 'Frequency (f)', unit: '×10¹⁴ Hz' },
      { key: 'wavelength', label: 'Wavelength (λ)', unit: 'nm' },
      { key: 'stoppingPotential', label: 'Stopping Potential (Vs)', unit: 'V' },
      { key: 'workFunction', label: 'Work Function (Φ)', unit: 'eV' },
      { key: 'photocurrent', label: 'Photocurrent (I)', unit: 'mA' },
      { key: 'emission', label: 'Emission Status', unit: '' },
    ],
    getCurrentRow: () => {
      const f14 = (3e8 / (wavelength * 1e-9)) / 1e14;
      return {
        metal: activeMetal.name,
        frequency: parseFloat(f14.toFixed(2)),
        wavelength,
        stoppingPotential: parseFloat(physicsState.stoppingPotential.toFixed(2)),
        workFunction: activeMetal.workFunction,
        photocurrent: parseFloat(physicsState.photocurrent.toFixed(3)),
        emission: physicsState.hasEmission ? 'Ejected' : 'No Emission',
      };
    },
    getSeriesData: () => {
      const wavelengths = [200, 240, 280, 320, 360, 400, 450, 500, 550, 600];
      return wavelengths.map((wl, idx) => {
        const state = calculatePhotoelectricState({
          wavelength: wl,
          intensity: 50,
          metalWorkFunction: activeMetal.workFunction,
          voltage: 0,
        });
        const f14 = (3e8 / (wl * 1e-9)) / 1e14;
        return {
          trial: idx + 1,
          metal: activeMetal.name,
          frequency: parseFloat(f14.toFixed(2)),
          wavelength: wl,
          stoppingPotential: parseFloat(state.stoppingPotential.toFixed(2)),
          workFunction: activeMetal.workFunction,
          photocurrent: parseFloat(state.photocurrent.toFixed(3)),
          emission: state.hasEmission ? 'Ejected' : 'No Emission',
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Wavelength λ = 200 nm (UV)', params: { wavelength: 200 }, durationMs: 700 },
        { label: 'Wavelength λ = 240 nm (UV)', params: { wavelength: 240 }, durationMs: 700 },
        { label: 'Wavelength λ = 280 nm (UV)', params: { wavelength: 280 }, durationMs: 700 },
        { label: 'Wavelength λ = 320 nm (UV)', params: { wavelength: 320 }, durationMs: 700 },
        { label: 'Wavelength λ = 360 nm (UV-Violet)', params: { wavelength: 360 }, durationMs: 700 },
        { label: 'Wavelength λ = 400 nm (Violet)', params: { wavelength: 400 }, durationMs: 700 },
        { label: 'Wavelength λ = 450 nm (Blue)', params: { wavelength: 450 }, durationMs: 700 },
        { label: 'Wavelength λ = 500 nm (Cyan)', params: { wavelength: 500 }, durationMs: 700 },
      ],
      applyParams: (p) => {
        if (p.wavelength !== undefined) setWavelength(p.wavelength);
      },
    },
    defaultGraphConfig: {
      xAxis: 'frequency',
      yAxis: 'stoppingPotential',
      title: "Einstein's Photoelectric Equation: Vs vs f (Slope = h/e, y-int = -Φ/e)",
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
            Photoelectric Effect & Quantum Physics
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
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.photoDefTitle}</h3>
                <p>{tn.photoDefBody}</p>
                <div className="pt-1 text-center font-bold text-blue-700">
                  <BlockMath math="E = h f = \frac{h c}{\lambda}" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {tn.workFuncTitle}
                </h4>
                <p>{tn.workFuncBody}</p>
                <BlockMath math="\Phi = h f_0 = \frac{h c}{\lambda_0}" />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">{tn.stoppingTitle}</h4>
                <p>{tn.stoppingBody}</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                  {tn.stoppingList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Equations & SI Units */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.eqTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-xs">Einstein Photoelectric Equations</h4>
                  <BlockMath math="h f = \Phi + K_{max} = h f_0 + \frac{1}{2} m v_{max}^2" />
                  <BlockMath math="e V_s = K_{max} = h f - \Phi" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-indigo-700 text-xs">Stopping Voltage vs Frequency Line</h4>
                  <BlockMath math="V_s = \left(\frac{h}{e}\right) f - \frac{\Phi}{e}" />
                  <p className="text-[11px] text-slate-500">Slope = h/e, X-intercept = f₀, Y-intercept = -Φ/e.</p>
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
      
      {/* Simulation Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Control Board (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">A/L physics</span>
            </div>

            {/* Target Metal Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">{t.metal}</label>
              <div className="grid grid-cols-2 gap-2">
                {METAL_PRESETS.map((metal) => (
                  <button
                    key={metal.id}
                    onClick={() => setMetalId(metal.id)}
                    disabled={recorder.isAutoRunning}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-left flex flex-col justify-between disabled:opacity-40 ${
                      metalId === metal.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span>{metal.name}</span>
                    <span className={`text-[9px] mt-1 font-mono font-bold ${metalId === metal.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      Φ = {metal.workFunction.toFixed(2)} eV
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Light Wavelength */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.wavelength}</span>
                <span className="text-slate-800 font-mono">{wavelength} nm</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="5"
                value={wavelength}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>200nm (UV)</span>
                <span>400nm (Visible)</span>
                <span>800nm (IR)</span>
              </div>
            </div>

            {/* Light Intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.intensity}</span>
                <span className="text-slate-800 font-mono">{intensity} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={intensity}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Tube Voltage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.voltage}</span>
                <span className="text-slate-800 font-mono">{voltage >= 0 ? `+${voltage.toFixed(2)}` : `${voltage.toFixed(2)}`} V</span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="6.0"
                step="0.05"
                value={voltage}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Simulated environmental parameters info */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>{t.thresholdWavelength}</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {physicsState.thresholdWavelength.toFixed(1)} nm
              </span>
            </div>

            {/* Theory Explanation Checkbox */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="checkbox"
                id="explainMode"
                checked={explainMode}
                onChange={(e) => setExplainMode(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="explainMode" className="text-xs font-bold text-slate-655 select-none cursor-pointer">
                {t.theoryFormulas}
              </label>
            </div>
          </div>

          {/* Action trigger button */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <button
              onClick={recorder.recordTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.logTrial}
            </button>
          </div>

        </div>

        {/* Right Column: Canvas Viewport & Graphing Panel (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Visual Vacuum Tube Canvas Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Photoelectric Discharge Chamber</h3>
              
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
                className="border border-slate-100 rounded-lg bg-white select-none shadow-sm"
              />
            </div>
          </div>

          {/* Real-time Diagnostics, Math & Plotting Charts */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Real-time parameters reading panel (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.physicsCalculations}
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.photonEnergy}:</span>
                  <span className="font-mono text-slate-850 font-bold">{physicsState.photonEnergy.toFixed(3)} eV</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.workFunction}:</span>
                  <span className="font-mono text-slate-850 font-bold">{activeMetal.workFunction.toFixed(2)} eV</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.maxKE}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">
                    {physicsState.maxKineticEnergy.toFixed(3)} eV
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.stoppingPotential}:</span>
                  <span className="font-mono text-red-650 font-bold">
                    {physicsState.stoppingPotential > 0 ? `-${physicsState.stoppingPotential.toFixed(2)} V` : '0.00 V'}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between font-extrabold">
                  <span className="text-slate-600">{t.emissionStatus}:</span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                    physicsState.hasEmission ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {physicsState.hasEmission ? 'Emission' : 'No Emission'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scientific Graph Laboratory */}
            <div className="w-full">
              <ScientificGraphLab
                graphs={photoelectricGraphs}
                trials={recorder.recordedRows}
                simulationParams={{ wavelength, intensity, workFunction: activeMetal.workFunction, voltage }}
                onRecordTrial={recorder.recordTrial}
                onClearTrials={recorder.clearTrials}
                columns={recorder.columns}
                height={300}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
