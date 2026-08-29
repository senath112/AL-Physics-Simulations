import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';

interface PointMass {
  id: number;
  x: number; // grid units (-5 to 5)
  y: number; // grid units (-5 to 5)
  m: number; // mass in kg
}

export function CentreOfMassSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      title: 'Centre of Mass Coordinator',
      paramsTitle: 'Configure Selected Mass',
      instructions: 'Click on the grid board to place up to 5 point masses. Drag the slider to adjust their weights.',
      massVal: 'Weight (m)',
      reset: 'Clear Grid',
      theoryOutput: 'System Center of Mass',
      totalMass: 'Total Mass (M)',
      centerCoord: 'Center Coordinate (X_cm, Y_cm)',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      title: 'ගුරුත්ව කේන්ද්‍ර සම්බන්ධීකාරකය',
      paramsTitle: 'තෝරාගත් ස්කන්ධය සැකසීම',
      instructions: 'ඛණ්ඩාංක තලයට ක්ලික් කර ලක්ෂ්‍ය ස්කන්ධ 5ක් දක්වා තබන්න. ඒවායේ බර වෙනස් කිරීමට ස්ලයිඩරය අදින්න.',
      massVal: 'ස්කන්ධය (m)',
      reset: 'තලය හිස් කරන්න',
      theoryOutput: 'පද්ධතියේ ගුරුත්ව කේන්ද්‍රය',
      totalMass: 'මුළු ස්කන්ධය (M)',
      centerCoord: 'කේන්ද්‍ර ඛණ්ඩාංකය (X_cm, Y_cm)',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      title: 'திணிவு மைய ஒருங்கிணைப்பாளர்',
      paramsTitle: 'தேர்ந்தெடுக்கப்பட்ட நிறை அமைப்புகள்',
      instructions: 'திணிவுகளை நிலைநிறுத்த வரைபடத்தில் கிளிக் செய்யவும். அவற்றின் எடையை மாற்ற ஸ்லைடரை பயன்படுத்தவும்.',
      massVal: 'திணிவு (m)',
      reset: 'வரைபடத்தை நீக்கு',
      theoryOutput: 'அமைப்பின் திணிவு மையம்',
      totalMass: 'மொத்தத் திணிவு (M)',
      centerCoord: 'மைய ඛණ්ඩාංகம் (X_cm, Y_cm)',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [points, setPoints] = useState<PointMass[]>([
    { id: 1, x: -2.0, y: 1.5, m: 2.0 },
    { id: 2, x: 3.0, y: -2.0, m: 4.5 }
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(1);

  const [labNotes, setLabNotes] = useState('');

  // Compute Center of Mass
  const sumMass = points.reduce((acc, p) => acc + p.m, 0);
  const sumMX = points.reduce((acc, p) => acc + p.m * p.x, 0);
  const sumMY = points.reduce((acc, p) => acc + p.m * p.y, 0);

  const xCM = sumMass > 0 ? sumMX / sumMass : 0;
  const yCM = sumMass > 0 ? sumMY / sumMass : 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Grid and Coordinate points
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
    const gridScale = 22; // px per grid unit

    // Draw Grid gridlines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      // vertical lines
      ctx.beginPath();
      ctx.moveTo(cX + i * gridScale, 0);
      ctx.lineTo(cX + i * gridScale, height);
      ctx.stroke();

      // horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, cY + i * gridScale);
      ctx.lineTo(width, cY + i * gridScale);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cX, 0); ctx.lineTo(cX, height); // Y
    ctx.moveTo(0, cY); ctx.lineTo(width, cY); // X
    ctx.stroke();

    // Draw placed Masses
    points.forEach((p) => {
      const scrX = cX + p.x * gridScale;
      const scrY = cY - p.y * gridScale; // invert Y coordinate for standard Cartesian plane

      const size = Math.max(8, 5 + p.m * 2);

      ctx.fillStyle = p.id === selectedId ? '#ef4444' : '#3b82f6';
      ctx.strokeStyle = p.id === selectedId ? '#b91c1c' : '#1d4ed8';
      ctx.lineWidth = p.id === selectedId ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.arc(scrX, scrY, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Mass text label
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8px font-sans';
      ctx.fillText(`${p.m.toFixed(1)}kg`, scrX + size + 3, scrY + 3);
    });

    // Draw Center of Mass crosshair (Red/Gold target symbol)
    if (points.length > 0) {
      const cmScrX = cX + xCM * gridScale;
      const cmScrY = cY - yCM * gridScale;

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cmScrX, cmScrY, 8, 0, 2 * Math.PI);
      ctx.stroke();

      // crosshair lines
      ctx.beginPath();
      ctx.moveTo(cmScrX - 12, cmScrY);
      ctx.lineTo(cmScrX + 12, cmScrY);
      ctx.moveTo(cmScrX, cmScrY - 12);
      ctx.lineTo(cmScrX, cmScrY + 12);
      ctx.stroke();

      ctx.fillStyle = '#d97706';
      ctx.font = 'black 9px font-sans';
      ctx.fillText('CM', cmScrX + 11, cmScrY - 6);
    }

  }, [points, selectedId, xCM, yCM]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cX = rect.width / 2;
    const cY = rect.height / 2;
    const gridScale = 22;

    const gridX = Math.round((clickX - cX) / gridScale * 2) / 2; // snap to 0.5 units
    const gridY = Math.round((cY - clickY) / gridScale * 2) / 2;

    // Check if clicked close to an existing mass
    const existing = points.find((p) => Math.hypot(p.x - gridX, p.y - gridY) <= 0.6);
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    if (points.length >= 5) return; // limit to 5 points

    const newPoint: PointMass = {
      id: Date.now(),
      x: Math.max(-10, Math.min(10, gridX)),
      y: Math.max(-5, Math.min(5, gridY)),
      m: 2.0
    };

    setPoints((prev) => [...prev, newPoint]);
    setSelectedId(newPoint.id);
  };

  const handleReset = () => {
    setPoints([]);
    setSelectedId(null);
  };

  const handleWeightChange = (val: number) => {
    if (selectedId === null) return;
    setPoints((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, m: val } : p))
    );
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'centre_mass_sim',
    simulationTitle: 'Centre of Mass Coordinates',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'pointCount', label: 'Point Count', unit: '' },
      { key: 'totalMass', label: 'Total Mass M', unit: 'kg' },
      { key: 'xCM', label: 'Centre X_cm', unit: 'm' },
      { key: 'yCM', label: 'Centre Y_cm', unit: 'm' },
    ],
    getCurrentRow: () => ({
      pointCount: points.length,
      totalMass: parseFloat(sumMass.toFixed(2)),
      xCM: parseFloat(xCM.toFixed(2)),
      yCM: parseFloat(yCM.toFixed(2)),
    }),
    defaultGraphConfig: {
      xAxis: 'totalMass',
      yAxis: 'xCM',
      title: 'Centre of Mass X_cm vs Total Mass',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Total Mass (M)': `${sumMass.toFixed(2)} kg`,
      'Centre of Mass (X_cm, Y_cm)': `(${xCM.toFixed(2)}, ${yCM.toFixed(2)})`
    };
    downloadReportAsPDF('Centre of Mass Lab Report', reportParams, recorder.recordedRows, labNotes);
  };

  const selectedPoint = points.find((p) => p.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.paramsTitle}
          </h3>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            {t.instructions}
          </p>

          {/* Active mass slider */}
          {selectedPoint ? (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-650">{t.massVal} (x={selectedPoint.x}, y={selectedPoint.y})</span>
                <span className="text-red-500 font-mono">{selectedPoint.m.toFixed(1)} kg</span>
              </div>
              <input
                type="range" min="0.5" max="10.0" step="0.1" value={selectedPoint.m}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">Click a point on grid to configure</div>
          )}
        </div>

        {/* Theoretical Coordinate Results */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.totalMass}</span>
              <span className="font-extrabold text-slate-800 font-mono text-sm">{sumMass.toFixed(2)} kg</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.centerCoord}</span>
              <span className="font-extrabold text-amber-600 font-mono text-sm">({xCM.toFixed(2)}, {yCM.toFixed(2)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Canvas Board and Lab Notes */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Canvas box */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.title}</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <canvas
              ref={canvasRef} onClick={handleCanvasClick}
              className="border border-slate-100 rounded-lg cursor-crosshair bg-slate-50/20 shadow-inner"
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.reset}
            </button>
          </div>
        </div>

        {/* Observation notebook */}
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
