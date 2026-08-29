import { useState, useRef, useEffect, useMemo } from 'react';
import { PlotlyGraph } from '../../PlotlyGraph';
import { BlockMath, InlineMath } from '../../Math';
import { 
  Sparkles, 
  Info, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap,
  Plus 
} from 'lucide-react';
import { calculatePhotoelectricState, PhotoelectricParameters } from '../../../physics/photoelectricPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

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

  // Parameters
  const [metalId, setMetalId] = useState<string>('sodium');
  const [wavelength, setWavelength] = useState<number>(350); // nm
  const [intensity, setIntensity] = useState<number>(50); // %
  const [voltage, setVoltage] = useState<number>(1.5); // V
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeGraphTab, setActiveGraphTab] = useState<'iv' | 'vsf' | 'energy'>('iv');
  const [explainMode, setExplainMode] = useState<boolean>(true);

  // Lab Notes
  const [notes, setNotes] = useState<string>('');

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

  // Frequency in 10^14 Hz
  const frequency14 = useMemo(() => {
    const freq = (2.99792e17 / wavelength) / 1e14;
    return freq;
  }, [wavelength]);

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
    defaultGraphConfig: {
      xAxis: 'frequency',
      yAxis: 'stoppingPotential',
      title: "Einstein's Photoelectric Equation: Vs vs f (Slope = h/e, y-int = -Φ/e)",
      showRegression: true,
    },
    notes,
  });

  // Export logs to PDF
  const handleExportPDF = () => {
    const paramsMap = {
      'Target Cathode Metal': activeMetal.name,
      'Work Function (Φ)': `${activeMetal.workFunction.toFixed(2)} eV`,
      'Light Wavelength (λ)': `${wavelength} nm`,
      'Light Intensity': `${intensity}%`,
      'Applied Potential (V)': `${voltage.toFixed(2)} V`
    };

    downloadReportAsPDF(
      'Photoelectric Effect Laboratory Report',
      paramsMap,
      recorder.recordedRows,
      notes
    );
  };

  // Generate data for I-V graph curve
  const ivGraphData = useMemo(() => {
    const vVals: number[] = [];
    const iVals: number[] = [];
    const step = 0.1;
    const Vs = physicsState.stoppingPotential;

    for (let v = -4.0; v <= 4.0; v += step) {
      vVals.push(parseFloat(v.toFixed(2)));
      if (!physicsState.hasEmission) {
        iVals.push(0);
      } else {
        if (v < -Vs) {
          iVals.push(0);
        } else if (v >= 2.0) {
          iVals.push((intensity / 100) * 10);
        } else {
          const num = v + Vs;
          const den = 2.0 + Vs;
          iVals.push(parseFloat(((intensity / 100) * 10 * Math.pow(num / den, 1.5)).toFixed(3)));
        }
      }
    }

    return { x: vVals, y: iVals };
  }, [physicsState, intensity]);

  // Generate data for Vs-f graph curve
  const vsfGraphData = useMemo(() => {
    const fVals: number[] = [];
    const vsVals: number[] = [];
    
    // Frequency ranges from 3e14 Hz to 15e14 Hz (corresponding to ~1000nm to ~200nm)
    const thresholdFreq14 = (activeMetal.workFunction / 4.1356e-15) / 1e14;
    
    for (let f = 3.0; f <= 15.0; f += 0.25) {
      fVals.push(f);
      if (f < thresholdFreq14) {
        vsVals.push(0);
      } else {
        // Vs = (h/e) * f - WorkFunction/e
        const vs = 4.1356 * f * 1e14 * 1e-14 - activeMetal.workFunction;
        vsVals.push(parseFloat(vs.toFixed(2)));
      }
    }

    return { x: fVals, y: vsVals };
  }, [activeMetal]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
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
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-left flex flex-col justify-between ${
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
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.lightFrequency}:</span>
                  <span className="font-mono text-slate-850">{frequency14.toFixed(2)} x10¹⁴ Hz</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.thresholdFrequency}:</span>
                  <span className="font-mono text-slate-850">{(physicsState.thresholdFrequency / 1e14).toFixed(2)} x10¹⁴ Hz</span>
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

            {/* Graph tabs card (8 Cols) */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-72">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveGraphTab('iv')}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeGraphTab === 'iv' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    I - V Curve
                  </button>
                  <button
                    onClick={() => setActiveGraphTab('vsf')}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeGraphTab === 'vsf' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Vs - f Line
                  </button>
                  <button
                    onClick={() => setActiveGraphTab('energy')}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeGraphTab === 'energy' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Energy Partition
                  </button>
                </div>
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Live plot</span>
              </div>

              <div className="flex-1 min-h-0">
                {activeGraphTab === 'iv' && (
                  <PlotlyGraph
                    data={[
                      {
                        x: ivGraphData.x,
                        y: ivGraphData.y,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Theoretical I-V',
                        line: { color: '#3b82f6', width: 2 }
                      },
                      {
                        x: [voltage],
                        y: [physicsState.photocurrent],
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Current Operating State',
                        marker: { color: '#ef4444', size: 10, symbol: 'circle' }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 45, r: 15, t: 15, b: 40 },
                      xaxis: { title: { text: 'Voltage V (V)' } },
                      yaxis: { title: { text: 'Photocurrent I (mA)' } },
                      legend: { orientation: 'h', y: -0.25 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    className="w-full h-full"
                  />
                )}

                {activeGraphTab === 'vsf' && (
                  <PlotlyGraph
                    data={[
                      {
                        x: vsfGraphData.x,
                        y: vsfGraphData.y,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Vs vs f boundary',
                        line: { color: '#8b5cf6', width: 2 }
                      },
                      {
                        x: [frequency14],
                        y: [physicsState.stoppingPotential],
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Operating State',
                        marker: { color: '#ef4444', size: 10 }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 45, r: 15, t: 15, b: 40 },
                      xaxis: { title: { text: 'Frequency f (x10¹⁴ Hz)' } },
                      yaxis: { title: { text: 'Stopping Potential Vs (V)' } },
                      legend: { orientation: 'h', y: -0.25 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    className="w-full h-full"
                  />
                )}

                {activeGraphTab === 'energy' && (
                  <PlotlyGraph
                    data={[
                      {
                        x: ['Photon Energy (E)', 'Work Function (Φ)', 'Kinetic Energy (Kmax)'],
                        y: [physicsState.photonEnergy, activeMetal.workFunction, physicsState.maxKineticEnergy],
                        type: 'bar',
                        marker: {
                          color: ['#3b82f6', '#eab308', '#ef4444']
                        }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 45, r: 15, t: 15, b: 40 },
                      yaxis: { title: { text: 'Energy (eV)' } },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)'
                    }}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Experimental explanations / formulas */}
      {explainMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-sm border-b border-blue-150 pb-2">
            <Info className="w-4.5 h-4.5" />
            PHOTOELECTRIC EFFECT MATHEMATICAL FOUNDATION
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-blue-900 leading-relaxed font-medium">
            <div className="space-y-2">
              <p>
                <strong>Einstein's Photoelectric Equation:</strong> When a photon strikes the emitter plate, its energy is fully absorbed by an electron. This energy is split into escaping the metal and kinetic energy:
              </p>
              <BlockMath math="E = \Phi + K_{\max}" />
              <p>
                Where <span className="font-mono bg-blue-105/60 px-1 py-0.5 rounded"><InlineMath math="E = hf = \frac{hc}{\lambda}" /></span> is the incoming photon energy, <span className="font-mono bg-blue-105/60 px-1 py-0.5 rounded"><InlineMath math="\Phi" /></span> is the work function of the metal target, and <span className="font-mono bg-blue-105/60 px-1 py-0.5 rounded"><InlineMath math="K_{\max}" /></span> is the maximum kinetic energy of the ejected photoelectrons.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Stopping Potential (නැවැතුම් විභවය):</strong> The stopping potential <span className="font-mono bg-blue-105/60 px-1 py-0.5 rounded"><InlineMath math="V_s" /></span> is the negative voltage applied to the collector plate that retards the fastest ejected electrons, dropping the photocurrent to zero:
              </p>
              <BlockMath math="e V_s = K_{\max} = hf - \Phi" />
              <p>
                Increasing light intensity increases the <strong>saturation current</strong> (as more photons eject more electrons per second) but does not alter the stopping potential. Only shifting to shorter wavelengths (higher frequency) raises the stopping potential.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Notes & Trial Logger Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Lab Notes notepad (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t.labNotes}
            </h3>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Observational entries</span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write down your virtual experimental observations, measurements, work function computations, and stopping potential checks..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium placeholder-slate-400 bg-slate-50/20"
          />
        </div>

        {/* Trial logs history & Laboratory Transfer (7 Cols) */}
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
