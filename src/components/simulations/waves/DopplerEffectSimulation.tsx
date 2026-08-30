import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, Plus } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { BlockMath, InlineMath } from '../../Math';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { dopplerEffectGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

interface Wavefront {
  id: number;
  x: number;
  y: number;
  radius: number;
  timeElapsed: number;
}

export function DopplerEffectSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Doppler Effect & Sonic Boom Simulator',
      controls: 'Wave Parameters',
      sourceSpeed: 'Source Speed (vₛ)',
      observerSpeed: 'Observer Speed (vₒ)',
      sourceFreq: 'Source Frequency (fₛ)',
      speedOfSound: 'Speed of Sound (v)',
      soundToggle: 'Audio Synthesizer Pitch Tone',
      audioListener: 'Audio Focus / Listener',
      listenerA: 'Observer 1 (Left)',
      listenerB: 'Observer 2 (Right)',
      listenerSource: 'Source',
      calculations: 'Doppler Frequency Computations',
      formula: "f' = fₛ (v ± vₒ) / (v ∓ vₛ)",
      observedLeft: 'Observed Frequency Left (fₗ)',
      observedRight: 'Observed Frequency Right (fᵣ)',
      sonicBoomAlert: 'SONIC BOOM! (vₛ ≥ v)',
      logTrial: 'Record Frequencies',
      trialHistory: 'Doppler Observations Log',
      labNotes: 'Observation Journal',
      pdf: 'Export PDF',
      audioOn: 'Enable Audio Pitch',
      audioOff: 'Mute Audio',
      machNumber: 'Mach Number (M)'
    },
    si: {
      title: 'ඩොප්ලර් ආචරණය සහ සුපිරිධ්වනි කම්පන තරංග සිමියුලේටරය',
      controls: 'තරංග පරාමිතීන්',
      sourceSpeed: 'ප්‍රභවයේ ප්‍රවේගය (vₛ)',
      observerSpeed: 'නිරීක්ෂකයාගේ ප්‍රවේගය (vₒ)',
      sourceFreq: 'ප්‍රභවයේ සංඛ්‍යාතය (fₛ)',
      speedOfSound: 'ධ්වනි ප්‍රවේගය (v)',
      soundToggle: 'ශ්‍රව්‍ය සංඛ්‍යාත ස්වරය',
      audioListener: 'ශ්‍රව්‍ය අවධානය / නිරීක්ෂකයා',
      listenerA: 'නිරීක්ෂක 1 (වම)',
      listenerB: 'නිරීක්ෂක 2 (දකුණ)',
      listenerSource: 'ප්‍රභවය',
      calculations: 'ඩොප්ලර් සංඛ්‍යාත ගණනය කිරීම්',
      formula: "f' = fₛ (v ± vₒ) / (v ∓ vₛ)",
      observedLeft: 'වම් නිරීක්ෂකයාට ඇසෙන සංඛ්‍යාතය (fₗ)',
      observedRight: 'දකුණු නිරීක්ෂකයාට ඇසෙන සංඛ්‍යාතය (fᵣ)',
      sonicBoomAlert: 'සුපිරිධ්වනි කම්පනය! (vₛ ≥ v)',
      logTrial: 'සංඛ්‍යාත සටහන් කරන්න',
      trialHistory: 'ඩොප්ලර් නිරීක්ෂණ සටහන්',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      pdf: 'PDF ලබාගන්න',
      audioOn: 'ශබ්දය සක්‍රිය කරන්න',
      audioOff: 'ශබ්දය අක්‍රිය කරන්න',
      machNumber: 'මාක් අංකය (M)'
    },
    ta: {
      title: 'டாப்ளர் விளைவு & ஒலி அதிர்வு சிமுலேட்டர்',
      controls: 'அலை அளவுருக்கள்',
      sourceSpeed: 'ஒலி மூல வேகம் (vₛ)',
      observerSpeed: 'அவதானிப்பாளர் வேகம் (vₒ)',
      sourceFreq: 'மூல அதிர்வெண் (fₛ)',
      speedOfSound: 'ஒலியின் வேகம் (v)',
      soundToggle: 'ஒலி அதிர்வெண் தொனி',
      audioListener: 'ஒலி அமைவு / அவதானிப்பாளர்',
      listenerA: 'அவதானிப்பாளர் 1 (இடது)',
      listenerB: 'அவதானிப்பாளர் 2 (வலது)',
      listenerSource: 'மூலம்',
      calculations: 'டாப்ளர் அதிர்வெண் கணிப்புகள்',
      formula: "f' = fₛ (v ± vₒ) / (v ∓ vₛ)",
      observedLeft: 'இடது அவதானிப்பாளர் அதிர்வெண் (fₗ)',
      observedRight: 'வலது அவதானிப்பாளர் அதிர்வெண் (fᵣ)',
      sonicBoomAlert: 'ஒலி அதிர்வு அலறல்! (vₛ ≥ v)',
      logTrial: 'அதிர்வெண்களைப் பதிவுசெய்க',
      trialHistory: 'டாப்ளர் சோதனைப் பதிவுகள்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      pdf: 'PDF ஏற்றுமதி செய்',
      audioOn: 'ஒலியை இயக்கு',
      audioOff: 'ஒலியை முடக்கு',
      machNumber: 'மேக் எண் (M)'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [sourceSpeed, setSourceSpeed] = useState<number>(120); // m/s
  const [observerSpeedA, setObserverSpeedA] = useState<number>(0); // m/s (Left observer)
  const [observerSpeedB, setObserverSpeedB] = useState<number>(0); // m/s (Right observer)
  const [sourceFreq, setSourceFreq] = useState<number>(400); // Hz
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [audioListener, setAudioListener] = useState<'a' | 'b' | 'source'>('b');
  const [notes, setNotes] = useState<string>('');

  // History tracking for frequency vs time plots
  const [history, setHistory] = useState<{ t: number[]; freqA: number[]; freqB: number[] }>({
    t: [],
    freqA: [],
    freqB: []
  });
  const lastHistoryUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio Context references for real-time synthesizer pitch tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const speedOfSound = 340; // m/s (fixed reference)

  // Wavefront parameters
  const wavefrontsRef = useRef<Wavefront[]>([]);
  const lastEmissionTimeRef = useRef<number>(0);
  const sourceXRef = useRef<number>(270); // starts in center
  const nextWavefrontIdRef = useRef<number>(0);

  // Mach Number: M = v_s / v
  const machNumber = useMemo(() => {
    return sourceSpeed / speedOfSound;
  }, [sourceSpeed]);

  // Doppler Calculations
  const observedFreqLeft = useMemo(() => {
    if (sourceSpeed >= speedOfSound) return 0;
    // For Observer A (Left): sound travels left (negative direction).
    // If observer A moves right (towards source, positive velocity): relative speed of waves meeting observer increases.
    // So observed frequency f_A = f_s * (c + v_oA) / (c + v_s)
    return sourceFreq * ((speedOfSound + observerSpeedA) / (speedOfSound + sourceSpeed));
  }, [sourceFreq, sourceSpeed, observerSpeedA]);

  const observedFreqRight = useMemo(() => {
    if (sourceSpeed >= speedOfSound) return Infinity;
    // For Observer B (Right): sound travels right (positive direction).
    // If observer B moves right (away from source, positive velocity): relative speed of waves meeting observer decreases.
    // So observed frequency f_B = f_s * (c - v_oB) / (c - v_s)
    return sourceFreq * ((speedOfSound - observerSpeedB) / (speedOfSound - sourceSpeed));
  }, [sourceFreq, sourceSpeed, observerSpeedB]);

  // Audio effects handling
  useEffect(() => {
    if (isAudioEnabled) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (!oscillatorRef.current) {
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(sourceFreq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime); // keep volume low

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          oscillatorRef.current = osc;
          gainNodeRef.current = gain;
        }
      } catch (e) {
        console.warn('Web Audio Context initialization blocked/failed', e);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch(e){}
        oscillatorRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().then(() => {
          audioCtxRef.current = null;
        });
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e){}
      }
    };
  }, [isAudioEnabled]);

  // Update sound synthesizer pitch real-time following active observer focus selection
  useEffect(() => {
    if (isAudioEnabled && oscillatorRef.current && audioCtxRef.current) {
      let displayPitch = sourceFreq;
      if (audioListener === 'a') {
        displayPitch = observedFreqLeft;
      } else if (audioListener === 'b') {
        displayPitch = sourceSpeed >= speedOfSound ? 0 : observedFreqRight;
      }
      if (isFinite(displayPitch) && displayPitch > 0) {
        oscillatorRef.current.frequency.setValueAtTime(displayPitch, audioCtxRef.current.currentTime);
      }
    }
  }, [observedFreqLeft, observedFreqRight, sourceFreq, sourceSpeed, isAudioEnabled, audioListener]);

  const handleReset = () => {
    setSourceSpeed(120);
    setObserverSpeedA(0);
    setObserverSpeedB(0);
    setSourceFreq(400);
    setIsPlaying(true);
    setAudioListener('b');
    setNotes('');
    sourceXRef.current = 270;
    wavefrontsRef.current = [];
    setHistory({ t: [], freqA: [], freqB: [] });
    startTimeRef.current = performance.now();
    lastHistoryUpdateRef.current = 0;
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'doppler_sim',
    simulationTitle: 'Doppler Effect & Wavefront Analysis',
    category: 'waves',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'sourceSpeed', label: 'Source Speed (vₛ)', unit: 'm/s' },
      { key: 'sourceFreq', label: 'Source Frequency (fₛ)', unit: 'Hz' },
      { key: 'speedOfSound', label: 'Speed of Sound (v)', unit: 'm/s' },
      { key: 'observedFreqRight', label: 'Observed Freq Right (fᵣ)', unit: 'Hz' },
      { key: 'observedFreqLeft', label: 'Observed Freq Left (fₗ)', unit: 'Hz' },
      { key: 'machNumber', label: 'Mach Number (M)', unit: '' },
    ],
    getCurrentRow: () => {
      const fRight = sourceSpeed >= speedOfSound ? 9999 : parseFloat(observedFreqRight.toFixed(1));
      const fLeft = parseFloat(observedFreqLeft.toFixed(1));
      const mach = parseFloat((sourceSpeed / speedOfSound).toFixed(2));
      return {
        sourceSpeed,
        sourceFreq,
        speedOfSound,
        observedFreqRight: fRight,
        observedFreqLeft: fLeft,
        machNumber: mach,
      };
    },
    getSeriesData: () => {
      const speeds = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
      return speeds.map((spd, idx) => {
        const fR = spd >= speedOfSound ? 9999 : sourceFreq * ((speedOfSound - observerSpeedB) / (speedOfSound - spd));
        const fL = sourceFreq * ((speedOfSound + observerSpeedA) / (speedOfSound + spd));
        return {
          trial: idx + 1,
          sourceSpeed: spd,
          sourceFreq,
          speedOfSound,
          observedFreqRight: parseFloat(fR.toFixed(1)),
          observedFreqLeft: parseFloat(fL.toFixed(1)),
          machNumber: parseFloat((spd / speedOfSound).toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Source Speed vₛ = 0 m/s', params: { sourceSpeed: 0 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 50 m/s', params: { sourceSpeed: 50 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 100 m/s', params: { sourceSpeed: 100 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 150 m/s', params: { sourceSpeed: 150 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 200 m/s', params: { sourceSpeed: 200 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 250 m/s', params: { sourceSpeed: 250 }, durationMs: 750 },
        { label: 'Source Speed vₛ = 300 m/s', params: { sourceSpeed: 300 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.sourceSpeed !== undefined) setSourceSpeed(p.sourceSpeed);
      },
    },
    defaultGraphConfig: {
      xAxis: 'sourceSpeed',
      yAxis: 'observedFreqRight',
      title: "Doppler Effect: Observed Frequency f' vs Source Speed vₛ",
      showRegression: false,
    },
    notes,
  });

  const handleExportPDF = () => {
    const reportParams = {
      'Source Speed (vₛ)': `${sourceSpeed} m/s`,
      'Observer Speed A': `${observerSpeedA} m/s`,
      'Observer Speed B': `${observerSpeedB} m/s`,
      'Source Frequency (fₛ)': `${sourceFreq} Hz`,
      'Speed of Sound (v)': `${speedOfSound} m/s`,
      'Mach Number (M)': `${(sourceSpeed / speedOfSound).toFixed(2)}`
    };
    downloadReportAsPDF('Doppler Effect Laboratory Report', reportParams, recorder.recordedRows, notes);
  };

  // Rendering wavefront propagation loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 540;
    const rectHeight = 240;

    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.04, (time - lastTime) / 1000);
      lastTime = time;

      // Update graph history periodically
      if (isPlaying) {
        const nowMs = time;
        if (nowMs - lastHistoryUpdateRef.current >= 120) {
          setHistory(prev => {
            const nextT = [...prev.t, parseFloat(((nowMs - startTimeRef.current) / 1000).toFixed(1))];
            const nextA = [...prev.freqA, observedFreqLeft];
            const nextB = [...prev.freqB, sourceSpeed >= speedOfSound ? 0 : observedFreqRight];
            if (nextT.length > 50) {
              nextT.shift();
              nextA.shift();
              nextB.shift();
            }
            return { t: nextT, freqA: nextA, freqB: nextB };
          });
          lastHistoryUpdateRef.current = nowMs;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw background grid lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      for (let x = 0; x < rectWidth; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectHeight); ctx.stroke();
      }
      for (let y = 0; y < rectHeight; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectWidth, y); ctx.stroke();
      }

      // Draw Observers
      // Left Observer (Observer A) at x = 40
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(40, rectHeight / 2, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px font-sans';
      ctx.fillText('Obs A (Left)', 20, rectHeight / 2 - 15);

      // Right Observer (Observer B) at x = 500
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(500, rectHeight / 2, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.fillText('Obs B (Right)', 460, rectHeight / 2 - 15);

      // Draw observer velocity arrows
      // Draw Observer A velocity arrow
      if (observerSpeedA !== 0) {
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 2;
        const arrowLength = observerSpeedA * 0.45;
        ctx.beginPath();
        ctx.moveTo(40, rectHeight / 2 + 15);
        ctx.lineTo(40 + arrowLength, rectHeight / 2 + 15);
        ctx.stroke();

        ctx.beginPath();
        const dirA = Math.sign(observerSpeedA);
        ctx.moveTo(40 + arrowLength, rectHeight / 2 + 15);
        ctx.lineTo(40 + arrowLength - 4 * dirA, rectHeight / 2 + 12);
        ctx.lineTo(40 + arrowLength - 4 * dirA, rectHeight / 2 + 18);
        ctx.fill();
      }

      // Draw Observer B velocity arrow
      if (observerSpeedB !== 0) {
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 2;
        const arrowLength = observerSpeedB * 0.45;
        ctx.beginPath();
        ctx.moveTo(500, rectHeight / 2 + 15);
        ctx.lineTo(500 + arrowLength, rectHeight / 2 + 15);
        ctx.stroke();

        ctx.beginPath();
        const dirB = Math.sign(observerSpeedB);
        ctx.moveTo(500 + arrowLength, rectHeight / 2 + 15);
        ctx.lineTo(500 + arrowLength - 4 * dirB, rectHeight / 2 + 12);
        ctx.lineTo(500 + arrowLength - 4 * dirB, rectHeight / 2 + 18);
        ctx.fill();
      }

      if (isPlaying) {
        // Move source to the right
        const scalePixelsPerMeter = 0.55; // visual mapping scale
        sourceXRef.current += sourceSpeed * scalePixelsPerMeter * dt;

        // Wrap source when exiting canvas bounds
        if (sourceXRef.current > 510) {
          sourceXRef.current = 30;
          wavefrontsRef.current = []; // flush loops on wrap
        }

        // Periodic emission of wavefronts
        const emissionInterval = 1 / (sourceFreq / 100); // scaled frequency spacing
        if (time - lastEmissionTimeRef.current >= emissionInterval * 1000) {
          wavefrontsRef.current.push({
            id: nextWavefrontIdRef.current++,
            x: sourceXRef.current,
            y: rectHeight / 2,
            radius: 0,
            timeElapsed: 0
          });
          lastEmissionTimeRef.current = time;
        }

        // Propagate wavefront radius at speed of sound (v)
        wavefrontsRef.current.forEach(w => {
          w.radius += speedOfSound * scalePixelsPerMeter * dt;
          w.timeElapsed += dt;
        });

        // Filter out very large wavefronts off-screen
        wavefrontsRef.current = wavefrontsRef.current.filter(w => w.radius < 450);
      }

      // Draw wavefront circles
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      wavefrontsRef.current.forEach(w => {
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Highlight Mach shock wave cone (tangents) if supersonic
        if (machNumber >= 1.0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Draw Mach Shockwave Cone line overlays if supersonic
      if (machNumber > 1.0 && wavefrontsRef.current.length > 5) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        const alpha = Math.asin(1 / machNumber); // Mach angle
        
        ctx.beginPath();
        ctx.moveTo(sourceXRef.current, rectHeight / 2);
        ctx.lineTo(sourceXRef.current - 180 * Math.cos(alpha), rectHeight / 2 - 180 * Math.sin(alpha));
        ctx.moveTo(sourceXRef.current, rectHeight / 2);
        ctx.lineTo(sourceXRef.current - 180 * Math.cos(alpha), rectHeight / 2 + 180 * Math.sin(alpha));
        ctx.stroke();
      }

      // Draw Sound Source (Siren Vehicle)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(sourceXRef.current, rectHeight / 2, 7, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px font-sans';
      ctx.fillText(`Source (vₛ)`, sourceXRef.current - 22, rectHeight / 2 + 20);

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, sourceSpeed, sourceFreq, machNumber, observerSpeedA, observerSpeedB, observedFreqLeft, observedFreqRight]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0 bg-slate-50">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Parameters controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {t.controls}
              </h3>
              <span className="text-[9px] text-slate-450 font-bold uppercase">Acoustic Lab</span>
            </div>

            {/* Source speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.sourceSpeed}</span>
                <span className="text-slate-850 font-mono">{sourceSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={sourceSpeed}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setSourceSpeed(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Observer A speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-650">{lang === 'en' ? 'Obs A Speed (Left)' : lang === 'si' ? 'නිරීක්ෂක A ප්‍රවේගය' : 'அவதானிப்பாளர் A வேகம்'}</span>
                <span className="text-slate-850 font-mono">{observerSpeedA} m/s</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={observerSpeedA}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setObserverSpeedA(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Observer B speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-650">{lang === 'en' ? 'Obs B Speed (Right)' : lang === 'si' ? 'නිරීක්ෂක B ප්‍රවේගය' : 'அவதானிப்பாளர் B வேகம்'}</span>
                <span className="text-slate-850 font-mono">{observerSpeedB} m/s</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={observerSpeedB}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setObserverSpeedB(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Source frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.sourceFreq}</span>
                <span className="text-slate-850 font-mono">{sourceFreq} Hz</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="25"
                value={sourceFreq}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setSourceFreq(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Audio Listener Focus Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">
                {t.audioListener}
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAudioListener('a')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    audioListener === 'a'
                      ? 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.listenerA}
                </button>
                <button
                  onClick={() => setAudioListener('b')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    audioListener === 'b'
                      ? 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.listenerB}
                </button>
                <button
                  onClick={() => setAudioListener('source')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    audioListener === 'source'
                      ? 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {t.listenerSource}
                </button>
              </div>
            </div>

            {/* Synthesizer Pitch Audio button */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.soundToggle}</label>
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAudioEnabled 
                    ? 'bg-blue-600 border-blue-650 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                }`}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isAudioEnabled ? t.audioOff : t.audioOn}
              </button>
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

        {/* Right visualizer viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center relative">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t.title}
              </h3>
              
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="w-full flex justify-center py-2 relative">
              <canvas
                ref={canvasRef}
                className="border border-slate-100 rounded-xl bg-white select-none shadow-sm"
              />

              {/* Mach shock wave warning banner */}
              {machNumber >= 1.0 && (
                <div className="absolute top-4 left-4 bg-red-600 border border-red-700 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded shadow-md animate-pulse">
                  {t.sonicBoomAlert}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Doppler values */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t.calculations}
              </h4>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.speedOfSound}:</span>
                  <span className="font-mono text-slate-800 font-bold">{speedOfSound} m/s</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.machNumber}:</span>
                  <span className="font-mono text-slate-800 font-bold">{machNumber.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-slate-100 pt-2">
                  <span className="text-slate-500">{t.observedLeft}:</span>
                  <span className="font-mono text-emerald-600 font-extrabold">
                    {observedFreqLeft.toFixed(1)} Hz
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">{t.observedRight}:</span>
                  <span className="font-mono text-blue-600 font-extrabold">
                    {sourceSpeed >= speedOfSound ? '∞ (Sonic Boom)' : `${observedFreqRight.toFixed(1)} Hz`}
                  </span>
                </div>
              </div>
            </div>

            {/* Doppler equations */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2.5 text-xs text-slate-650 font-medium">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Doppler Wave Theory
              </h4>
              <p>
                The observed frequency <InlineMath math="f'" /> changes because the source motion alters the wavelength of sound waves in the transmission medium:
              </p>
              <BlockMath math="f' = f_s \left( \frac{v \pm v_o}{v \mp v_s} \right)" />
              <p>
                When the source speed reaches the speed of sound (<InlineMath math="v_s = v" />), wave crests merge on top of one another to produce a high-amplitude shock cone.
              </p>
            </div>
          </div>

          {/* Scientific Graph Laboratory */}
          <ScientificGraphLab
            graphs={dopplerEffectGraphs}
            trials={recorder.recordedRows}
            realtimePoints={history.t.map((tVal, i) => ({ t: tVal, x: tVal, y: history.freqB[i], observedFreqA: history.freqA[i], observedFreqB: history.freqB[i] }))}
            simulationParams={{ sourceSpeed, observerSpeed: observerSpeedB, sourceFreq, speedOfSound: 340 }}
            onRecordTrial={recorder.recordTrial}
            onClearTrials={recorder.clearTrials}
            columns={recorder.columns}
            height={260}
          />
        </div>

      </div>

      {/* Observation logs list and Notepad */}
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
            placeholder="Record the frequency changes relative to source speed ratios, or describe the wavefront patterns..."
            className="w-full h-36 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors custom-scrollbar font-medium bg-slate-50/20"
          />
        </div>

        {/* History Log List & Laboratory Transfer */}
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
            onRecordFullRun={recorder.recordFullRun}
            isAutoRecording={recorder.isAutoRecording}
            onToggleAutoRecord={recorder.toggleAutoRecord}
            isAutoRunning={recorder.isAutoRunning}
            autoRunProgress={recorder.autoRunProgress}
            onStartAutoRun={recorder.startAutoRun}
            onCancelAutoRun={recorder.cancelAutoRun}
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
