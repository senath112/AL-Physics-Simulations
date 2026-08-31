import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, Compass, Waves, Atom, Zap } from 'lucide-react';

interface HeroPracticalVisualizerProps {
  onSelectSim: (simId: string) => void;
}

export function HeroPracticalVisualizer({ onSelectSim }: HeroPracticalVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'projectile' | 'shm' | 'orbits' | 'optics'>('projectile');
  const [isPlaying, setIsPlaying] = useState(true);
  const [gravity, setGravity] = useState<number>(9.81); // Earth by default
  const [preset, setPreset] = useState<'earth' | 'moon' | 'jupiter'>('earth');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live telemetry state for display HUD
  const [telemetry, setTelemetry] = useState({
    speed: 25.0,
    height: 15.9,
    range: 63.7,
    ke: 312.5,
    pe: 156.0,
  });

  const handlePresetChange = (p: 'earth' | 'moon' | 'jupiter') => {
    setPreset(p);
    if (p === 'earth') setGravity(9.81);
    if (p === 'moon') setGravity(1.62);
    if (p === 'jupiter') setGravity(24.79);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

        let simTime = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle tech grid background
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        simTime += 0.025;
      }

      if (activeTab === 'projectile') {
        // --- MODE 1: PROJECTILE MOTION ANIMATION ---
        const v0 = 35;
        const angleRad = (45 * Math.PI) / 180;
        const vx = v0 * Math.cos(angleRad);
        const vy0 = v0 * Math.sin(angleRad);

        const flightTime = (2 * vy0) / gravity;
        const maxH = (vy0 * vy0) / (2 * gravity);
        const totalR = (v0 * v0 * Math.sin(2 * angleRad)) / gravity;

        const loopT = simTime % (flightTime + 0.8);
        const currentT = Math.min(loopT, flightTime);

        // Scale meters to screen coordinates
        const originX = 40;
        const originY = height - 40;
        const scaleX = (width - 80) / (totalR * 1.1);
        const scaleY = (height - 80) / (maxH * 1.3);

        // Draw parabolic trajectory arc
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let t = 0; t <= flightTime; t += 0.05) {
          const px = originX + vx * t * scaleX;
          const py = originY - (vy0 * t - 0.5 * gravity * t * t) * scaleY;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Current particle position
        const posX = vx * currentT;
        const posY = Math.max(0, vy0 * currentT - 0.5 * gravity * currentT * currentT);
        const vyCurrent = vy0 - gravity * currentT;
        const currentSpeed = Math.sqrt(vx * vx + vyCurrent * vyCurrent);

        const screenX = originX + posX * scaleX;
        const screenY = originY - posY * scaleY;

        // Draw particle trail glow
        const trailGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 18);
        trailGradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        trailGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
        trailGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Draw projectile orb
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Velocity vector arrow (Resultant)
        const vecScale = 0.8;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + vx * vecScale, screenY - vyCurrent * vecScale);
        ctx.stroke();

        // Horizontal velocity vector (vx - Emerald)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + vx * vecScale, screenY);
        ctx.stroke();

        // Ground reference line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX - 15, originY);
        ctx.lineTo(width - 20, originY);
        ctx.stroke();

        // Ground cannon launcher
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(originX, originY, 10, Math.PI, 0);
        ctx.fill();

        // Update HUD metrics
        setTelemetry({
          speed: parseFloat(currentSpeed.toFixed(1)),
          height: parseFloat(posY.toFixed(1)),
          range: parseFloat(posX.toFixed(1)),
          ke: parseFloat((0.5 * 1 * currentSpeed * currentSpeed).toFixed(1)),
          pe: parseFloat((1 * gravity * posY).toFixed(1)),
        });

      } else if (activeTab === 'shm') {
        // --- MODE 2: SPRING MASS SHM OSCILLATION ---
        const amplitude = 50;
        const omega = Math.sqrt(gravity / 0.5);
        const offsetY = Math.sin(simTime * omega) * amplitude;
        const centerX = width / 2 - 40;
        const topY = 40;
        const massY = topY + 100 + offsetY;

        // Draw Ceiling support
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 40, topY);
        ctx.lineTo(centerX + 40, topY);
        ctx.stroke();

        // Draw Spring Coils
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        const coils = 12;
        const springLen = massY - topY - 15;
        for (let i = 0; i <= coils; i++) {
          const coilY = topY + (springLen / coils) * i;
          const coilX = centerX + (i % 2 === 0 ? 12 : -12);
          ctx.lineTo(coilX, coilY);
        }
        ctx.lineTo(centerX, massY - 15);
        ctx.stroke();

        // Draw Mass Bob
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(centerX - 18, massY - 15, 36, 30, 6);
        ctx.fill();
        ctx.stroke();

        // Draw Sine Wave Oscilloscope Trace to the right
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const waveStartX = centerX + 40;
        for (let x = waveStartX; x < width - 20; x += 2) {
          const tAhead = (x - waveStartX) * 0.02;
          const wy = topY + 100 + Math.sin((simTime - tAhead) * omega) * amplitude;
          if (x === waveStartX) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();

        // Connecting indicator line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX + 18, massY);
        ctx.lineTo(waveStartX, massY);
        ctx.stroke();
        ctx.setLineDash([]);

        setTelemetry({
          speed: parseFloat((Math.abs(Math.cos(simTime * omega) * amplitude * omega * 0.1)).toFixed(1)),
          height: parseFloat(((offsetY + amplitude) / 10).toFixed(1)),
          range: parseFloat((amplitude / 10).toFixed(1)),
          ke: parseFloat((0.5 * Math.pow(Math.cos(simTime * omega) * amplitude * 0.1, 2)).toFixed(1)),
          pe: parseFloat((0.5 * Math.pow(offsetY / 10, 2)).toFixed(1)),
        });

      } else if (activeTab === 'orbits') {
        // --- MODE 3: GRAVITATIONAL ORBIT ANIMATION ---
        const cx = width / 2;
        const cy = height / 2;
        const rx = 100;
        const ry = 60;

        // Central Planet/Star
        const starGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        starGradient.addColorStop(0, '#f59e0b');
        starGradient.addColorStop(0.7, '#d97706');
        starGradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = starGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Elliptical Orbit Line
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Satellite position
        const orbAngle = simTime * 0.8;
        const satX = cx + rx * Math.cos(orbAngle);
        const satY = cy + ry * Math.sin(orbAngle);

        // Centripetal force vector arrow to center
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(satX + (cx - satX) * 0.3, satY + (cy - satY) * 0.3);
        ctx.stroke();

        // Satellite body
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(satX, satY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const orbitalV = Math.sqrt(gravity * 1000 / Math.sqrt(Math.pow(satX - cx, 2) + Math.pow(satY - cy, 2)));

        setTelemetry({
          speed: parseFloat((orbitalV * 0.8).toFixed(1)),
          height: parseFloat((Math.sqrt(Math.pow(satX - cx, 2) + Math.pow(satY - cy, 2)) / 5).toFixed(1)),
          range: parseFloat((rx / 5).toFixed(1)),
          ke: parseFloat((0.5 * orbitalV * orbitalV).toFixed(1)),
          pe: parseFloat((gravity * 20).toFixed(1)),
        });

      } else if (activeTab === 'optics') {
        // --- MODE 4: REFRACTION & TOTAL INTERNAL REFLECTION ---
        const cx = width / 2;
        const cy = height / 2;

        // Interface surface line
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, cy);
        ctx.lineTo(width - 30, cy);
        ctx.stroke();

        // Medium 1 (air) & Medium 2 (glass) tint
        ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
        ctx.fillRect(30, cy, width - 60, height - cy - 20);

        // Normal dashed line
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.lineTo(cx, cy + 80);
        ctx.stroke();
        ctx.setLineDash([]);

        // Incident Ray (sweeping angle)
        const incAngle = Math.sin(simTime * 0.5) * 0.6 + 0.7; // angle in rad
        const rayLen = 110;
        const inX = cx - rayLen * Math.sin(incAngle);
        const inY = cy - rayLen * Math.cos(incAngle);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(inX, inY);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Refracted Ray (Snell's Law: n1 sin i = n2 sin r)
        const n1 = 1.0;
        const n2 = 1.5;
        const sinR = (n1 * Math.sin(incAngle)) / n2;
        const refrAngle = Math.asin(sinR);

        const outX = cx + rayLen * Math.sin(refrAngle);
        const outY = cy + rayLen * Math.cos(refrAngle);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outX, outY);
        ctx.stroke();

        // Weak reflected ray
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + rayLen * Math.sin(incAngle), cy - rayLen * Math.cos(incAngle));
        ctx.stroke();

        setTelemetry({
          speed: 3.0,
          height: parseFloat(((incAngle * 180) / Math.PI).toFixed(1)),
          range: parseFloat(((refrAngle * 180) / Math.PI).toFixed(1)),
          ke: 1.5,
          pe: 1.0,
        });
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeTab, isPlaying, gravity]);

  return (
    <div className="relative w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xl shadow-blue-500/5 space-y-4">
      {/* Top Banner Control Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block leading-none">
              Interactive Physics Lab Engine
            </span>
            <h3 className="text-xs font-black text-slate-800 leading-tight">Live Practical Visualizer</h3>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('projectile')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'projectile' ? 'bg-white text-blue-600 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Projectile</span>
          </button>
          <button
            onClick={() => setActiveTab('shm')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'shm' ? 'bg-white text-blue-600 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>SHM</span>
          </button>
          <button
            onClick={() => setActiveTab('orbits')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'orbits' ? 'bg-white text-blue-600 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Orbits</span>
          </button>
          <button
            onClick={() => setActiveTab('optics')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'optics' ? 'bg-white text-blue-600 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Optics</span>
          </button>
        </div>
      </div>

      {/* Main Practical Animation Viewport */}
      <div className="relative w-full h-[260px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

        {/* Floating Telemetry HUD */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono space-y-1 text-slate-300 pointer-events-none shadow-lg">
          <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>LIVE TELEMETRY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          </div>
          <div>SPEED (v): <span className="text-white font-bold">{telemetry.speed} m/s</span></div>
          <div>HEIGHT (y): <span className="text-emerald-400 font-bold">{telemetry.height} m</span></div>
          <div>RANGE / ANGLE: <span className="text-amber-400 font-bold">{telemetry.range}</span></div>
          <div className="pt-0.5 text-[10px] text-slate-400 flex items-center gap-2">
            <span>KE: {telemetry.ke} J</span>
            <span>•</span>
            <span>PE: {telemetry.pe} J</span>
          </div>
        </div>

        {/* Interactive Gravity Control Pills */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[10px]">
          <span className="text-slate-400 px-1 font-bold font-sans">Gravity (g):</span>
          <button
            onClick={() => handlePresetChange('earth')}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              preset === 'earth' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Earth (9.8m/s²)
          </button>
          <button
            onClick={() => handlePresetChange('moon')}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              preset === 'moon' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Moon (1.6m/s²)
          </button>
          <button
            onClick={() => handlePresetChange('jupiter')}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              preset === 'jupiter' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Jupiter (24.8m/s²)
          </button>
        </div>

        {/* Play/Pause & Reset Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Launch Interactive Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div
          onClick={() => onSelectSim('projectile_sim')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-150 hover:border-emerald-300 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700">🚀 Projectile</span>
            <span className="text-[9px] bg-emerald-200/60 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full">
              60 FPS
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Launch vectors & trajectory paths</p>
        </div>

        <div
          onClick={() => onSelectSim('newtons_sim')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-150 hover:border-blue-300 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-800 group-hover:text-blue-700">⚖️ Newton's Laws</span>
            <span className="text-[9px] bg-blue-200/60 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-full">
              F = ma
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Friction bounds & net force vectors</p>
        </div>

        <div
          onClick={() => onSelectSim('optics_sim')}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-150 hover:border-purple-300 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-800 group-hover:text-purple-700">🌈 Optics & TIR</span>
            <span className="text-[9px] bg-purple-200/60 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-full">
              Snell
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Critical angles & optical fibres</p>
        </div>
      </div>
    </div>
  );
}
