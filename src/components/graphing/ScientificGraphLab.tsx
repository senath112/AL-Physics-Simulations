import React, { useState, useMemo, useCallback } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import { PlotlyGraph } from '../PlotlyGraph';
import { ScientificGraphDefinition, PhysicalDeduction, RealtimeDataPoint } from './types';
import { calculateLinearRegression, calculatePercentageError, downloadCSV, getGraphFormInfo } from './regressionUtils';
import { DataRow } from '../../types/laboratory';
import { 
  TrendingUp, 
  Table as TableIcon, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Camera, 
  Sparkles,
  LineChart,
  Variable
} from 'lucide-react';

export interface ScientificGraphLabProps {
  graphs: ScientificGraphDefinition[];
  defaultGraphId?: string;
  selectedGraphId?: string;
  onSelectGraphId?: (id: string) => void;
  trials?: DataRow[];
  realtimePoints?: RealtimeDataPoint[];
  livePoint?: DataRow;
  simulationParams?: Record<string, any>;
  onRecordTrial?: () => void;
  onClearTrials?: () => void;
  columns?: { key: string; label: string; unit?: string }[];
  className?: string;
  height?: number | string;
  showToolbar?: boolean;
  showTableDefault?: boolean;
}

export const ScientificGraphLab: React.FC<ScientificGraphLabProps> = ({
  graphs,
  defaultGraphId,
  selectedGraphId: controlledGraphId,
  onSelectGraphId,
  trials = [],
  realtimePoints = [],
  livePoint,
  simulationParams = {},
  onRecordTrial: _onRecordTrial,
  onClearTrials,
  columns = [],
  className = '',
  height = 320,
  showToolbar = true,
  showTableDefault = false,
}) => {
  const [internalGraphId, setInternalGraphId] = useState<string>(
    defaultGraphId || graphs[0]?.id || ''
  );

  const activeGraphId = controlledGraphId || internalGraphId;
  const activeGraph = useMemo(() => {
    return graphs.find((g) => g.id === activeGraphId) || graphs[0];
  }, [graphs, activeGraphId]);

  const [showRegression, setShowRegression] = useState<boolean>(true);
  const [showTheoryCurve, setShowTheoryCurve] = useState<boolean>(true);
  const [showDataTable, setShowDataTable] = useState<boolean>(showTableDefault);
  const [graphContainerId] = useState<string>(() => `sci-plot-${Math.random().toString(36).substring(2, 9)}`);

  const handleGraphChange = (id: string) => {
    if (onSelectGraphId) {
      onSelectGraphId(id);
    } else {
      setInternalGraphId(id);
    }
  };

  // 1. Extract (x, y) experimental data points for the active graph
  const rawPoints = useMemo(() => {
    if (!activeGraph) return [];

    // A. For real-time series or trajectories, use realtimePoints
    const isRealtime = activeGraph.graphType === 'realtime-series' || activeGraph.graphType === 'trajectory';
    if (isRealtime && realtimePoints.length > 0) {
      return realtimePoints
        .map((p) => ({
          x: p[activeGraph.xKey] !== undefined ? Number(p[activeGraph.xKey]) : p.x,
          y: p[activeGraph.yKey] !== undefined ? Number(p[activeGraph.yKey]) : p.y,
        }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));
    }

    // B. For logged trials, extract experimental data points
    if (trials.length > 0) {
      return trials
        .map((row) => {
          if (activeGraph.transformPoint) {
            return activeGraph.transformPoint(row);
          }
          const xVal = Number(row[activeGraph.xKey]);
          const yVal = Number(row[activeGraph.yKey]);
          return { x: xVal, y: yVal };
        })
        .filter((p): p is { x: number; y: number } => p !== null && !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));
    }

    return [];
  }, [activeGraph, trials, realtimePoints]);

  // 2. Compute Linear Regression on experimental data
  const regression = useMemo(() => {
    if (!activeGraph || !activeGraph.isLinear || rawPoints.length < 2) return null;
    return calculateLinearRegression(rawPoints);
  }, [activeGraph, rawPoints]);

  // 3. Physical Deduction & Comparison with Theory
  const deduction = useMemo((): PhysicalDeduction | null => {
    if (!activeGraph) return null;

    if (regression && activeGraph.deducePhysics) {
      return activeGraph.deducePhysics(regression, simulationParams);
    }

    if (regression && activeGraph.getExpectedSlope) {
      const theoSlope = activeGraph.getExpectedSlope(simulationParams);
      const errPct = calculatePercentageError(regression.slope, theoSlope);
      return {
        label: 'Slope (Gradient)',
        formula: activeGraph.expectedSlopeFormula || 'm',
        unit: activeGraph.yUnit && activeGraph.xUnit ? `${activeGraph.yUnit}/${activeGraph.xUnit}` : '',
        experimentalValue: parseFloat(regression.slope.toFixed(4)),
        theoreticalValue: parseFloat(theoSlope.toFixed(4)),
        percentageError: parseFloat(errPct.toFixed(2)),
      };
    }

    return null;
  }, [activeGraph, regression, simulationParams]);

  // 4. Compute Theoretical Curve
  const theoryCurve = useMemo(() => {
    if (!activeGraph || !activeGraph.getTheoreticalCurve) return null;

    let minX = 0;
    let maxX = 10;
    if (rawPoints.length > 0) {
      const xVals = rawPoints.map((p: { x: number; y: number }) => p.x);
      minX = Math.min(...xVals);
      maxX = Math.max(...xVals);
      if (minX === maxX) {
        minX = Math.max(0, minX * 0.5);
        maxX = maxX * 1.5 || 10;
      }
    }

    return activeGraph.getTheoreticalCurve([minX, maxX], simulationParams);
  }, [activeGraph, rawPoints, simulationParams]);

  // 4b. Mathematical Graph Form & Governing Physics Equation
  const formInfo = useMemo(() => {
    if (!activeGraph) return null;
    return getGraphFormInfo(activeGraph, theoryCurve);
  }, [activeGraph, theoryCurve]);

  // 5. Construct Plotly traces
  const plotTraces = useMemo(() => {
    if (!activeGraph) return [];
    const traces: Plotly.Data[] = [];

    const isRealtime = activeGraph.graphType === 'realtime-series' || activeGraph.graphType === 'trajectory';

    // A. Real-time Simulation Trajectory or Time Series Trace (Simulation Run Only)
    if (isRealtime && rawPoints.length > 0) {
      const xVals = rawPoints.map((p: { x: number; y: number }) => p.x);
      const yVals = rawPoints.map((p: { x: number; y: number }) => p.y);
      traces.push({
        x: xVals,
        y: yVals,
        mode: 'lines',
        type: 'scatter',
        name: 'Simulation Run',
        line: { color: '#2563eb', width: 2.5, shape: 'spline' }, // Clean Blue-600
        hovertemplate: `<b>Simulation %{yaxis.title.text}</b>: %{y:.3f} ${activeGraph.yUnit || ''}<extra>Simulation Run</extra>`,
      });
    } else if (showTheoryCurve && theoryCurve && theoryCurve.points.length > 0) {
      // Theoretical curve displayed when no live simulation points are being streamed
      traces.push({
        x: theoryCurve.points.map((p) => p.x),
        y: theoryCurve.points.map((p) => p.y),
        mode: 'lines',
        type: 'scatter',
        name: theoryCurve.label || 'Simulation Model',
        line: { color: '#2563eb', width: 2.5, shape: 'spline' }, // Blue-600
        hovertemplate: `<b>%{yaxis.title.text}</b>: %{y:.3f} ${activeGraph.yUnit || ''}<extra></extra>`,
      });
    }

    // C. Experimental Logged Trials (Markers)
    if (!isRealtime && rawPoints.length > 0) {
      const xVals = rawPoints.map((p: { x: number; y: number }) => p.x);
      const yVals = rawPoints.map((p: { x: number; y: number }) => p.y);
      traces.push({
        x: xVals,
        y: yVals,
        mode: 'markers',
        type: 'scatter',
        name: `Logged Trials (N=${rawPoints.length})`,
        marker: {
          color: '#ef4444', // Red-500
          size: 9,
          symbol: 'circle',
          line: { color: '#ffffff', width: 2 },
        },
        hovertemplate: `<b>Trial %{yaxis.title.text}</b>: %{y:.3f} ${activeGraph.yUnit || ''}<br><b>%{xaxis.title.text}</b>: %{x:.3f} ${activeGraph.xUnit || ''}<extra></extra>`,
      });
    }

    // D. Linear Regression fit line for experimental trials
    if (showRegression && regression && activeGraph.isLinear && rawPoints.length >= 2) {
      const xVals = rawPoints.map((p: { x: number; y: number }) => p.x);
      const minX = Math.min(...xVals);
      const maxX = Math.max(...xVals);
      const span = maxX - minX || 1;
      const xFit = [Math.max(0, minX - span * 0.05), maxX + span * 0.05];
      const yFit = xFit.map((x) => regression.slope * x + regression.intercept);

      traces.push({
        x: xFit,
        y: yFit,
        mode: 'lines',
        type: 'scatter',
        name: `Best Fit (${regression.equation})`,
        line: { color: '#f59e0b', width: 2, dash: 'dash' }, // Amber-500
        hoverinfo: 'skip',
      });
    }

    // E. Live Current Operating Point Marker (if livePoint provided)
    if (livePoint && activeGraph.xKey in livePoint && activeGraph.yKey in livePoint) {
      const lx = Number(livePoint[activeGraph.xKey]);
      const ly = Number(livePoint[activeGraph.yKey]);
      if (!isNaN(lx) && !isNaN(ly) && isFinite(lx) && isFinite(ly)) {
        traces.push({
          x: [lx],
          y: [ly],
          mode: 'markers',
          type: 'scatter',
          name: 'Current State',
          marker: {
            color: '#8b5cf6', // Violet-500
            size: 11,
            symbol: 'diamond',
            line: { color: '#ffffff', width: 2 },
          },
          hovertemplate: `<b>Current State</b><br>%{xaxis.title.text}: %{x:.2f}<br>%{yaxis.title.text}: %{y:.2f}<extra></extra>`,
        });
      }
    }

    return traces;
  }, [activeGraph, rawPoints, showRegression, regression, showTheoryCurve, theoryCurve, livePoint]);

  // Layout configuration for Plotly
  const plotLayout = useMemo(() => {
    if (!activeGraph) return {};

    return {
      autosize: true,
      height: typeof height === 'number' ? height : undefined,
      margin: { l: 60, r: 25, t: 40, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(248, 250, 252, 0.6)',
      font: { family: 'Outfit, Inter, sans-serif', size: 11, color: '#334155' },
      title: {
        text: `<b>${activeGraph.title}</b> <span style="font-size: 11px; color: #64748b; font-weight: normal;">[${formInfo?.form || 'y = mx'}]</span>`,
        font: { size: 12, color: '#1e293b' },
        x: 0.02,
        y: 0.98,
      },
      xaxis: {
        title: {
          text: activeGraph.xUnit ? `${activeGraph.xLabel} (${activeGraph.xUnit})` : activeGraph.xLabel,
          font: { size: 11, color: '#475569', weight: 600 },
        },
        gridcolor: '#e2e8f0',
        zerolinecolor: '#94a3b8',
        zerolinewidth: 1.5,
      },
      yaxis: {
        title: {
          text: activeGraph.yUnit ? `${activeGraph.yLabel} (${activeGraph.yUnit})` : activeGraph.yLabel,
          font: { size: 11, color: '#475569', weight: 600 },
        },
        gridcolor: '#e2e8f0',
        zerolinecolor: '#94a3b8',
        zerolinewidth: 1.5,
      },
      legend: {
        orientation: 'h' as const,
        x: 0,
        y: 1.15,
        font: { size: 10, color: '#475569' },
      },
      hovermode: 'closest' as const,
    };
  }, [activeGraph, height]);

  // Export CSV Data Handler
  const handleExportCSV = useCallback(() => {
    if (!activeGraph) return;

    const exportHeaders = (columns && columns.length > 0)
      ? columns
      : [
          { key: 'trial', label: 'Trial #' },
          { key: 'x', label: activeGraph.xLabel, unit: activeGraph.xUnit },
          { key: 'y', label: activeGraph.yLabel, unit: activeGraph.yUnit },
        ];

    const exportData: DataRow[] = (trials && trials.length > 0 && columns && columns.length > 0)
      ? trials
      : rawPoints.map((p: { x: number; y: number }, idx: number) => ({
          trial: idx + 1,
          x: p.x,
          y: p.y,
        }));

    downloadCSV(`${activeGraph.id}_data`, exportHeaders, exportData);
  }, [activeGraph, rawPoints, columns, trials]);

  // Export PNG Image Handler
  const handleExportPNG = useCallback(() => {
    const el = document.getElementById(graphContainerId);
    if (!el || !activeGraph) return;

    Plotly.downloadImage(el, {
      format: 'png',
      width: 900,
      height: 550,
      filename: `${activeGraph.id}_scientific_plot`,
    });
  }, [graphContainerId, activeGraph]);

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* 1. Header Toolbar */}
      {showToolbar && (
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Graph Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="relative">
              <select
                value={activeGraphId}
                onChange={(e) => handleGraphChange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 shadow-xs cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {graphs.map((g) => {
                  const gInfo = getGraphFormInfo(g);
                  return (
                    <option key={g.id} value={g.id}>
                      {g.title} • [{gInfo.form}]
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right: Graph Controls (Toggles & Exports) */}
          <div className="flex items-center gap-1.5">
            {/* Theory Curve Toggle */}
            {theoryCurve && (
              <button
                onClick={() => setShowTheoryCurve(!showTheoryCurve)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  showTheoryCurve
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle Theoretical Model Curve"
              >
                {showTheoryCurve ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Theory</span>
              </button>
            )}

            {/* Regression Toggle */}
            {activeGraph?.isLinear && rawPoints.length >= 2 && (
              <button
                onClick={() => setShowRegression(!showRegression)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  showRegression
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/80 font-bold'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle Linear Regression Best-Fit Line"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Regression</span>
              </button>
            )}

            {/* Data Table Toggle */}
            {trials.length > 0 && (
              <button
                onClick={() => setShowDataTable(!showDataTable)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  showDataTable
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle Recorded Trials Data Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table ({trials.length})</span>
              </button>
            )}

            {/* Export PNG */}
            <button
              onClick={handleExportPNG}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              title="Download Graph Image (PNG)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV */}
            {rawPoints.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                title="Download CSV Data"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Mathematical Graph Form & Governing Physics Equation Bar */}
      {formInfo && (
        <div className="border-b border-slate-100 px-4 py-2 bg-gradient-to-r from-slate-50 via-slate-50/80 to-white flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Left: Graph Type Badge (e.g. y = mx, y = sin x, y = mx + c) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Variable className="w-3.5 h-3.5 text-indigo-600" />
              Graph Type:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-mono font-black text-xs border shadow-2xs ${formInfo.badgeColor.bg} ${formInfo.badgeColor.text} ${formInfo.badgeColor.border}`}>
              {formInfo.form}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
              ({formInfo.description})
            </span>
          </div>

          {/* Right: Governing Physics Equation & Experimental Regression */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {formInfo.equation && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 px-2.5 py-0.5 rounded-lg text-slate-800 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-sans font-bold">Equation:</span>
                <span className="font-bold text-blue-700">{formInfo.equation}</span>
              </div>
            )}

            {/* Experimental regression equation if active */}
            {showRegression && regression && activeGraph.isLinear && rawPoints.length >= 2 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-lg text-amber-900 shadow-2xs">
                <span className="text-[10px] text-amber-700 font-sans font-bold">Fit:</span>
                <span className="font-bold">{regression.equation}</span>
                <span className="text-[10px] text-amber-600 font-normal">(R² = {regression.r2.toFixed(3)})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Plot Canvas Viewport */}
      <div id={graphContainerId} className="flex-1 w-full min-h-[260px] relative p-1 bg-white">
        <PlotlyGraph
          data={plotTraces}
          layout={plotLayout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
        />
      </div>

      {/* 3. Physical Deduction & Theory Banner */}
      {deduction ? (
        <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent border-t border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-slate-800">{deduction.label}:</span>
            <span className="font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
              {deduction.experimentalValue} {deduction.unit}
            </span>
            {deduction.theoreticalValue !== undefined && (
              <span className="text-slate-500 text-[11px]">
                (Theory: <span className="font-semibold text-slate-700">{deduction.theoreticalValue} {deduction.unit}</span>)
              </span>
            )}
          </div>

          {deduction.percentageError !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Error:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                  deduction.percentageError < 5
                    ? 'bg-emerald-100 text-emerald-800'
                    : deduction.percentageError < 15
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {deduction.percentageError}%
              </span>
            </div>
          )}
        </div>
      ) : activeGraph?.theoryDescription ? (
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{activeGraph.theoryDescription}</span>
        </div>
      ) : null}

      {/* 4. Optional Collapsible Data Table */}
      {showDataTable && trials.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-3 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Recorded Trials ({trials.length})</span>
            {onClearTrials && (
              <button
                onClick={onClearTrials}
                className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-1 px-2">#</th>
                {columns.map((c) => (
                  <th key={c.key} className="py-1 px-2">
                    {c.label} {c.unit ? `(${c.unit})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {trials.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50">
                  <td className="py-1 px-2 font-bold text-slate-400">{idx + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-1 px-2 text-slate-700">
                      {typeof row[c.key] === 'number' ? Number(row[c.key]).toFixed(3) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
