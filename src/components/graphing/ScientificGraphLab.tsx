import React, { useState, useMemo, useCallback } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import { PlotlyGraph } from '../PlotlyGraph';
import { ScientificGraphDefinition, PhysicalDeduction, RealtimeDataPoint } from './types';
import { calculateLinearRegression, calculatePercentageError, downloadCSV } from './regressionUtils';
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
  PlusCircle,
  LineChart 
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
  onRecordTrial,
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

  // 1. Extract (x, y) data points for the active graph (Automatic plotting enabled)
  const rawPoints = useMemo(() => {
    if (!activeGraph) return [];

    // A. Use realtimePoints automatically if present
    if (realtimePoints.length > 0 && trials.length === 0) {
      const pts = realtimePoints
        .map((p) => ({
          x: p[activeGraph.xKey] !== undefined ? Number(p[activeGraph.xKey]) : p.x,
          y: p[activeGraph.yKey] !== undefined ? Number(p[activeGraph.yKey]) : p.y,
        }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));
      if (pts.length > 0) return pts;
    }

    // B. Use trials if logged
    if (trials.length > 0) {
      const pts = trials
        .map((row) => {
          if (activeGraph.transformPoint) {
            return activeGraph.transformPoint(row);
          }
          const xVal = Number(row[activeGraph.xKey]);
          const yVal = Number(row[activeGraph.yKey]);
          return { x: xVal, y: yVal };
        })
        .filter((p): p is { x: number; y: number } => p !== null && !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));
      if (pts.length > 0) return pts;
    }

    // C. Fallback: Use livePoint if provided
    if (livePoint && activeGraph.xKey in livePoint && activeGraph.yKey in livePoint) {
      const xVal = Number(livePoint[activeGraph.xKey]);
      const yVal = Number(livePoint[activeGraph.yKey]);
      if (!isNaN(xVal) && !isNaN(yVal) && isFinite(xVal) && isFinite(yVal)) {
        return [{ x: xVal, y: yVal }];
      }
    }

    // D. Automatic Theory Plot Curve generation from simulationParams
    if (activeGraph.getTheoreticalCurve) {
      const tc = activeGraph.getTheoreticalCurve([0, 10], simulationParams);
      if (tc && tc.points && tc.points.length > 0) {
        return tc.points.map((p: { x: number; y: number }) => ({ x: p.x, y: p.y }));
      }
    }

    return [];
  }, [activeGraph, trials, realtimePoints, livePoint, simulationParams]);

  // 2. Compute Linear Regression
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

  // 5. Construct Plotly traces
  const plotTraces = useMemo(() => {
    if (!activeGraph) return [];
    const traces: Plotly.Data[] = [];

    const xVals = rawPoints.map((p: { x: number; y: number }) => p.x);
    const yVals = rawPoints.map((p: { x: number; y: number }) => p.y);

    // Primary experimental scatter / line trace
    if (rawPoints.length > 0) {
      const isRealtime = activeGraph.graphType === 'realtime-series' || activeGraph.graphType === 'trajectory';
      traces.push({
        x: xVals,
        y: yVals,
        mode: isRealtime ? 'lines' : 'markers',
        type: 'scatter',
        name: 'Experimental Data',
        marker: {
          color: '#2563eb', // Blue-600
          size: isRealtime ? 4 : 8,
          symbol: 'circle',
          line: { color: '#1e40af', width: 1.5 },
        },
        line: isRealtime
          ? { color: '#2563eb', width: 2.5, shape: 'spline' }
          : undefined,
        hovertemplate: `<b>%{yaxis.title.text}</b>: %{y:.3f} ${activeGraph.yUnit || ''}<br><b>%{xaxis.title.text}</b>: %{x:.3f} ${activeGraph.xUnit || ''}<extra>Experimental</extra>`,
      });
    }

    // Linear Regression fit line
    if (showRegression && regression && activeGraph.isLinear && rawPoints.length >= 2) {
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

    // Theoretical Relationship Curve
    if (showTheoryCurve && theoryCurve && theoryCurve.points.length > 0) {
      traces.push({
        x: theoryCurve.points.map((p) => p.x),
        y: theoryCurve.points.map((p) => p.y),
        mode: 'lines',
        type: 'scatter',
        name: theoryCurve.label || 'Theoretical Model',
        line: { color: '#10b981', width: 2.5 }, // Emerald-500
        hovertemplate: `<b>Theoretical %{yaxis.title.text}</b>: %{y:.3f}<extra></extra>`,
      });
    }

    return traces;
  }, [activeGraph, rawPoints, showRegression, regression, showTheoryCurve, theoryCurve]);

  // 6. Plotly layout
  const plotLayout = useMemo((): Partial<Plotly.Layout> => {
    if (!activeGraph) return {};

    return {
      autosize: true,
      margin: { l: 60, r: 25, t: 40, b: 50 },
      title: {
        text: `<b>${activeGraph.title}</b>`,
        font: { size: 13, color: '#1e293b', family: 'system-ui, sans-serif' },
        x: 0.03,
        xanchor: 'left',
      },
      xaxis: {
        title: {
          text: `${activeGraph.xLabel}${activeGraph.xUnit ? ` (${activeGraph.xUnit})` : ''}`,
          font: { size: 11, color: '#475569', family: 'system-ui, sans-serif' },
        },
        gridcolor: '#f1f5f9',
        zerolinecolor: '#cbd5e1',
        tickfont: { size: 10, color: '#64748b' },
      },
      yaxis: {
        title: {
          text: `${activeGraph.yLabel}${activeGraph.yUnit ? ` (${activeGraph.yUnit})` : ''}`,
          font: { size: 11, color: '#475569', family: 'system-ui, sans-serif' },
        },
        gridcolor: '#f1f5f9',
        zerolinecolor: '#cbd5e1',
        tickfont: { size: 10, color: '#64748b' },
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.02,
        y: 1.15,
        font: { size: 10, color: '#475569' },
        bgcolor: 'rgba(255, 255, 255, 0.85)',
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
    };
  }, [activeGraph]);

  // Export CSV Handler
  const handleExportCSV = useCallback(() => {
    if (!activeGraph || rawPoints.length === 0) return;
    const exportHeaders = columns && columns.length > 0
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
    Plotly.toImage(el, { format: 'png', width: 900, height: 500 }).then((url) => {
      const link = document.createElement('a');
      link.download = `${activeGraph.id}_graph.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [graphContainerId, activeGraph]);

  if (!activeGraph) return null;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col ${className}`}>
      {/* Header Toolbar */}
      {showToolbar && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          {/* Graph Selector */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100/80 text-blue-600 rounded-lg shrink-0">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Graph:</span>
              <div className="relative">
                <select
                  value={activeGraphId}
                  onChange={(e) => handleGraphChange(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-2.5 pr-7 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs appearance-none"
                >
                  {graphs.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Trial count badge */}
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {rawPoints.length} {rawPoints.length === 1 ? 'Point' : 'Points'}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-1.5 ml-auto">
            {/* Record Trial */}
            {onRecordTrial && (
              <button
                onClick={onRecordTrial}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                title="Record Current Simulation State as a Trial Point"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Trial</span>
              </button>
            )}

            {/* Linear Fit toggle */}
            {activeGraph.isLinear && (
              <button
                onClick={() => setShowRegression(!showRegression)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  showRegression
                    ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title="Toggle Best-fit Linear Regression Line"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Fit Line</span>
              </button>
            )}

            {/* Theoretical Curve toggle */}
            {activeGraph.getTheoreticalCurve && (
              <button
                onClick={() => setShowTheoryCurve(!showTheoryCurve)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  showTheoryCurve
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title="Toggle Theoretical Physics Relationship Curve"
              >
                {showTheoryCurve ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Theory</span>
              </button>
            )}

            {/* Data Table Toggle */}
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                showDataTable
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Toggle Experimental Data Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={rawPoints.length === 0}
              className="p-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Download Data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Export PNG */}
            <button
              onClick={handleExportPNG}
              disabled={rawPoints.length === 0}
              className="p-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Export Graph Image (PNG)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Clear Trials */}
            {onClearTrials && (
              <button
                onClick={onClearTrials}
                disabled={rawPoints.length === 0}
                className="p-1 bg-white border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Clear experimental points"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statistical Regression & Physical Deduction Bar */}
      {showRegression && activeGraph.isLinear && regression && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50/70 via-slate-50/50 to-indigo-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Regression Metrics */}
          <div className="flex flex-wrap items-center gap-2 font-mono font-bold">
            <span className="bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              Slope m: {regression.slope.toFixed(4)} {activeGraph.yUnit && activeGraph.xUnit ? `${activeGraph.yUnit}/${activeGraph.xUnit}` : ''}
            </span>
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              Intercept c: {regression.intercept.toFixed(4)}
            </span>
            <span className="bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              R²: {regression.r2.toFixed(4)}
            </span>
          </div>

          {/* Physics Deduction Card */}
          {deduction && (
            <div className="flex items-center gap-2 text-[11px] font-sans">
              <span className="font-bold text-slate-700">
                {deduction.label}: <strong className="font-mono text-indigo-700">{deduction.experimentalValue} {deduction.unit}</strong>
              </span>
              {deduction.theoreticalValue !== undefined && (
                <span className="text-slate-500 font-mono">
                  (Theo: {deduction.theoreticalValue} {deduction.unit})
                </span>
              )}
              {deduction.percentageError !== undefined && (
                <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                  deduction.percentageError < 5
                    ? 'bg-emerald-100 text-emerald-800'
                    : deduction.percentageError < 15
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Error: {deduction.percentageError}%
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Plotly Viewport */}
      <div id={graphContainerId} className="w-full flex-1 p-2 bg-white relative min-h-[220px]" style={{ height }}>
        {rawPoints.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/40">
            <LineChart className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-bold text-xs text-slate-600">No experimental data recorded yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Run the simulation or click <strong>Record Trial</strong> / <strong>Auto-Run</strong> to capture data points and verify <em>{activeGraph.title}</em>.
            </p>
          </div>
        ) : (
          <PlotlyGraph
            data={plotTraces}
            layout={plotLayout}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Collapsible Experimental Data Table */}
      {showDataTable && (
        <div className="border-t border-slate-200 p-3 bg-slate-50/60 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              Experimental Measurements ({rawPoints.length} Trials)
            </span>
            <button
              onClick={handleExportCSV}
              disabled={rawPoints.length === 0}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
          </div>

          {rawPoints.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No trials recorded.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs bg-white rounded-lg border border-slate-200 shadow-2xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-1.5 px-3 border-r border-slate-200 w-12 text-center">#</th>
                  <th className="py-1.5 px-3 border-r border-slate-200">
                    {activeGraph.xLabel} {activeGraph.xUnit ? `(${activeGraph.xUnit})` : ''}
                  </th>
                  <th className="py-1.5 px-3">
                    {activeGraph.yLabel} {activeGraph.yUnit ? `(${activeGraph.yUnit})` : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {rawPoints.map((p: { x: number; y: number }, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-1 px-3 border-r border-slate-100 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-1 px-3 border-r border-slate-100 text-slate-800">
                      {p.x.toFixed(3)}
                    </td>
                    <td className="py-1 px-3 text-slate-800">
                      {p.y.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
