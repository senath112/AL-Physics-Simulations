import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList, Trash2, FileDown } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';

export function SolenoidSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Magnetic Field of a Solenoid',
      paramsTitle: 'Parameters',
      current: 'Current (I)',
      turns: 'Number of Turns (N)',
      length: 'Solenoid Length (L)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      vectors: 'Show Magnetic Field Lines',
      theoryOutput: 'Theoretical Analysis',
      bField: 'Magnetic Field inside (B)',
      fieldDirection: 'Polarity Direction',
      north: 'North Pole',
      south: 'South Pole',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'සොලෙනොයිඩයක චුම්බක ක්ෂේත්‍රය',
      paramsTitle: 'පරාමිතීන්',
      current: 'ධාරාව (I)',
      turns: 'පොටවල් ගණන (N)',
      length: 'සොලෙනොයිඩයේ දිග (L)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      vectors: 'චුම්බක ක්ෂේත්‍ර රේඛා පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක විශ්ලේෂණය',
      bField: 'ඇතුළත චුම්බක ක්ෂේත්‍රය (B)',
      fieldDirection: 'ධ්‍රැවීයතා දිශාව',
      north: 'උත්තර ධ්‍රැවය',
      south: 'දක්ෂිණ ධ්‍රැවය',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'வரிச்சுருளின் காந்தப்புலம்',
      paramsTitle: 'அளவுருக்கள்',
      current: 'மின்னோட்டம் (I)',
      turns: 'சுற்றுகளின் எண்ணிக்கை (N)',
      length: 'வரிச்சுருளின் நீளம் (L)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      vectors: 'காந்தப்புலக் கோடுகளைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு பகுப்பாய்வு',
      bField: 'உள்ளே காந்தப்புலம் (B)',
      fieldDirection: 'துருவமுனைவு திசை',
      north: 'வட துருவம்',
      south: 'தென் துருவம்',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Parameters
  const [I, setI] = useState(2.0); // current in Amperes (-5 to 5)
  const [N, setN] = useState(10); // turns (5 to 20)
  const [L, setL] = useState(200); // length in pixels (100 to 300)
  const [showVectors, setShowVectors] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Drag and drop compass position
  const [compassPos, setCompassPos] = useState({ x: 270, y: 60 });
  const [isDragging, setIsDragging] = useState(false);

  const [dashOffset, setDashOffset] = useState(0);
  const [labNotes, setLabNotes] = useState('');
  const [loggedData, setLoggedData] = useState<any[]>([]);

  // B = mu0 * n * I where n = N / L
  // We use scaled arbitrary units for UI visualization
  const mu0 = 4 * Math.PI * 1e-7;
  const n = N / (L / 100);
  const BFieldVal = mu0 * n * Math.abs(I) * 1e5; // scaled values

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Time ticker for flow animation
  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    const tick = () => {
      // Flow speed is proportional to Current magnitude
      setDashOffset((prev) => (prev - I * 1.5) % 100);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, I]);

  // Render Solenoid and Field lines
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

    const cX = width / 2;
    const cY = height / 2;
    const coilRadius = 40;

    // Draw Magnetic Field Lines (superset of loop structures)
    if (showVectors && Math.abs(I) > 0.05) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = dashOffset;

      // Inside Solenoid (horizontal straight lines)
      const numLines = 5;
      for (let i = 0; i < numLines; i++) {
        const offset = (i - (numLines - 1) / 2) * 16;
        ctx.beginPath();
        ctx.moveTo(cX - L / 2 - 40, cY + offset);
        ctx.lineTo(cX + L / 2 + 40, cY + offset);
        ctx.stroke();
      }

      // Outside loops (elliptical orbits returning)
      const numLoops = 3;
      for (let i = 1; i <= numLoops; i++) {
        const wLoop = L + i * 80;
        const hLoop = coilRadius * 2 + i * 40;
        ctx.beginPath();
        ctx.ellipse(cX, cY, wLoop / 2, hLoop / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw Solenoid Cylindrical Coil turns
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    const step = L / (N - 1);
    const startX = cX - L / 2;

    // Draw winding loops behind cylinder (top to bottom arcs)
    ctx.beginPath();
    for (let i = 0; i < N - 1; i++) {
      const x1 = startX + i * step;
      const x2 = startX + (i + 1) * step;
      ctx.moveTo(x1, cY - coilRadius);
      ctx.quadraticCurveTo((x1 + x2) / 2 - step / 3, cY, x2, cY + coilRadius);
    }
    ctx.stroke();

    // Draw Solenoid body central cylinder backdrop
    ctx.fillStyle = 'rgba(241, 245, 249, 0.55)';
    ctx.fillRect(startX, cY - coilRadius, L, coilRadius * 2);

    // Draw current-carrying top and bottom wire cross-sections
    // Top row is entering/exiting, bottom is opposite
    const currentDirection = I > 0 ? 'in' : 'out';

    for (let i = 0; i < N; i++) {
      const x = startX + i * step;

      // Top row wire endcaps
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, cY - coilRadius, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Sign symbol on top row
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      if (I !== 0) {
        if (currentDirection === 'in') {
          // Draw Cross (Entering)
          ctx.beginPath();
          ctx.moveTo(x - 2, cY - coilRadius - 2); ctx.lineTo(x + 2, cY - coilRadius + 2);
          ctx.moveTo(x + 2, cY - coilRadius - 2); ctx.lineTo(x - 2, cY - coilRadius + 2);
          ctx.stroke();
        } else {
          // Draw Dot (Exiting)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, cY - coilRadius, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Bottom row wire endcaps
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(x, cY + coilRadius, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Sign symbol on bottom row (opposite to top row)
      if (I !== 0) {
        if (currentDirection === 'out') {
          // Draw Cross (Entering)
          ctx.beginPath();
          ctx.moveTo(x - 2, cY + coilRadius - 2); ctx.lineTo(x + 2, cY + coilRadius + 2);
          ctx.moveTo(x + 2, cY + coilRadius - 2); ctx.lineTo(x - 2, cY + coilRadius + 2);
          ctx.stroke();
        } else {
          // Draw Dot (Exiting)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, cY + coilRadius, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw active polarity labels (North and South poles at the edges)
    if (Math.abs(I) > 0.05) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px font-sans';
      ctx.textAlign = 'center';
      if (I > 0) {
        // N on Left, S on Right
        ctx.fillText('S', startX - 25, cY + 4);
        ctx.fillText('N', startX + L + 25, cY + 4);
      } else {
        // N on Right, S on Left
        ctx.fillText('N', startX - 25, cY + 4);
        ctx.fillText('S', startX + L + 25, cY + 4);
      }
    }

    // Render Draggable Compass
    // Calculate local magnetic field tangent direction at compassPos
    // Inside solenoid: field is purely horizontal: vector is (I > 0 ? 1 : -1, 0)
    // Outside solenoid: loop field lines curve back
    let angleRad = 0;
    if (I !== 0) {
      const dx = compassPos.x - cX;
      const dy = compassPos.y - cY;

      if (Math.abs(dx) <= L / 2 && Math.abs(dy) <= coilRadius) {
        // Inside
        angleRad = I > 0 ? 0 : Math.PI;
      } else {
        // Outside field dipole loop approximation
        // field line angle points tangent to dipole loops
        // theta_field = atan2(3*x*y, 2*y^2 - x^2) + offset
        const sign = I > 0 ? 1 : -1;
        angleRad = Math.atan2(3 * dx * dy, 2 * dy * dy - dx * dx) + (sign > 0 ? 0 : Math.PI);
      }
    }

    ctx.save();
    ctx.translate(compassPos.x, compassPos.y);
    ctx.rotate(angleRad);

    // Compass circle rim
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // North Pointer (Red pointing right relative to rotation)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    // South Pointer (Blue pointing left)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

  }, [I, N, L, showVectors, dashOffset, compassPos]);

  // Handle Dragging of the compass pointer
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (Math.hypot(clickX - compassPos.x, clickY - compassPos.y) <= 22) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const moveX = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const moveY = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));
    setCompassPos({ x: moveX, y: moveY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleLogDataPoint = () => {
    const newPoint = {
      trial: loggedData.length + 1,
      current: `${I} A`,
      turns: N,
      length: `${L} px`,
      bField: `${BFieldVal.toFixed(2)} mT`
    };
    setLoggedData((prev) => [...prev, newPoint]);
  };

  const handleDownloadPDF = () => {
    const reportParams = {
      'Current (I)': `${I} A`,
      'Number of Turns (N)': `${N}`,
      'Coil Length (L)': `${L} mm`,
      'Magnetic Field inside (B)': `${BFieldVal.toFixed(2)} mT`
    };
    downloadReportAsPDF('Magnetic Field of a Solenoid Lab Report', reportParams, loggedData, labNotes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          {/* Current Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.current}</span>
              <span className={`font-mono font-bold ${I > 0 ? 'text-red-500' : I < 0 ? 'text-blue-500' : 'text-slate-500'}`}>
                {I.toFixed(1)} A
              </span>
            </div>
            <input
              type="range" min="-5.0" max="5.0" step="0.2" value={I}
              onChange={(e) => setI(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Turns Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.turns}</span>
              <span className="text-slate-700 font-mono">{N} turns</span>
            </div>
            <input
              type="range" min="6" max="18" step="1" value={N}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Length Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-650">{t.length}</span>
              <span className="text-slate-700 font-mono">{L} px</span>
            </div>
            <input
              type="range" min="120" max="300" step="10" value={L}
              onChange={(e) => setL(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Vector Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox" id="show-vectors-solenoid" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="show-vectors-solenoid" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Theoretical Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.bField}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{BFieldVal.toFixed(2)} mT</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.fieldDirection}</span>
              <span className="font-extrabold text-blue-600 font-mono text-sm">
                {I === 0 ? 'None' : I > 0 ? `${t.north} → Right` : `${t.north} → Left`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas viewports */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
            <span className="text-[10px] text-slate-400 font-semibold italic">Drag the compass to explore the field!</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border border-slate-100 rounded-lg bg-slate-50/20 shadow-inner"
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isPlaying ? t.pause : t.play}
              </button>
              <button
                onClick={() => { setI(2.0); setN(10); setL(200); setCompassPos({ x: 270, y: 60 }); }}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-full cursor-pointer shadow-sm transition-all"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Observation log */}
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

          <div className="flex gap-2">
            <button
              onClick={handleLogDataPoint}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              {t.logData}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              {t.downloadPDF}
            </button>
            <button
              onClick={() => setLoggedData([])}
              disabled={loggedData.length === 0}
              className="p-2 border border-slate-200 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Clear logged trials"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
