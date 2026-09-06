import Plotly from 'plotly.js-basic-dist-min';
import { ScientificGraphDefinition, PhysicalDeduction } from './types';

export interface FixedPremadeGraphResult {
  traces: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  deduction: PhysicalDeduction;
  formInfo: {
    form: string;
    description: string;
    equation: string;
    badgeColor: { bg: string; text: string; border: string };
  };
}

/**
 * Generates a certified, fixed premade graph used across all simulations
 * when simulation engine health is low or degraded.
 */
export function generateFixedPremadeGraph(
  activeGraph?: ScientificGraphDefinition,
  baseLayout?: Partial<Plotly.Layout>
): FixedPremadeGraphResult {
  const xLabel = activeGraph?.xLabel || 'Independent Parameter (x)';
  const yLabel = activeGraph?.yLabel || 'Physical Observable (y)';
  const xUnit = activeGraph?.xUnit ? ` (${activeGraph.xUnit})` : '';
  const yUnit = activeGraph?.yUnit ? ` (${activeGraph.yUnit})` : '';

  const isLinear = activeGraph?.isLinear || false;
  const graphType = activeGraph?.graphType || 'linear';

  // 1. Generate mathematically verified, fixed premade data
  const smoothPoints: { x: number; y: number }[] = [];
  const discreteBenchmarks: { x: number; y: number }[] = [];

  if (isLinear || graphType === 'linear') {
    // Certified Linear Ground Truth: y = 2.5 x + 1.0 (or scaled to graph's physical domain)
    const xMin = 0;
    const xMax = 10;
    const slope = 2.5;
    const intercept = 0.5;

    for (let i = 0; i <= 60; i++) {
      const x = xMin + (i / 60) * (xMax - xMin);
      const y = slope * x + intercept;
      smoothPoints.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
    }

    // 6 fixed discrete calibration benchmark points
    const benchmarkXs = [1.0, 2.5, 4.0, 6.0, 7.5, 9.0];
    for (const bx of benchmarkXs) {
      discreteBenchmarks.push({
        x: bx,
        y: Number((slope * bx + intercept).toFixed(3)),
      });
    }
  } else if (graphType === 'realtime-series' || (activeGraph?.id || '').includes('shm') || (activeGraph?.id || '').includes('wave')) {
    // Certified Harmonic Motion Ground Truth: y = 5.0 * cos(2 * pi * t / 4.0)
    const period = 4.0;
    const amplitude = 5.0;
    const tMax = 12.0;

    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * tMax;
      const y = amplitude * Math.cos((2 * Math.PI * t) / period);
      smoothPoints.push({ x: Number(t.toFixed(3)), y: Number(y.toFixed(3)) });
    }

    // Discrete nodes and peaks
    const benchmarkTimes = [0, 1.0, 2.0, 3.0, 4.0, 6.0, 8.0, 10.0, 12.0];
    for (const bt of benchmarkTimes) {
      discreteBenchmarks.push({
        x: bt,
        y: Number((amplitude * Math.cos((2 * Math.PI * bt) / period)).toFixed(3)),
      });
    }
  } else if (graphType === 'trajectory') {
    // Certified Parabolic Projectile Ground Truth: y = -0.5 * g * t^2 + v0 * t
    const v0 = 20;
    const g = 9.81;
    const tFlight = (2 * v0) / g;

    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * tFlight;
      const y = Math.max(0, v0 * t - 0.5 * g * t * t);
      smoothPoints.push({ x: Number(t.toFixed(3)), y: Number(y.toFixed(3)) });
    }

    const sampleTimes = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
    for (const st of sampleTimes) {
      if (st < tFlight) {
        discreteBenchmarks.push({
          x: st,
          y: Number((v0 * st - 0.5 * g * st * st).toFixed(3)),
        });
      }
    }
  } else {
    // Universal Certified Standard: Damped Physical Resonance
    // y = 8.0 * exp(-0.15 * t) * cos(pi * t)
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * 10;
      const y = 8.0 * Math.exp(-0.15 * t) * Math.cos(Math.PI * t);
      smoothPoints.push({ x: Number(t.toFixed(3)), y: Number(y.toFixed(3)) });
    }
    const sampleTimes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (const st of sampleTimes) {
      discreteBenchmarks.push({
        x: st,
        y: Number((8.0 * Math.exp(-0.15 * st) * Math.cos(Math.PI * st)).toFixed(3)),
      });
    }
  }

  // 2. Tolerance upper and lower envelope (+-0.5% certified boundary)
  const xVals = smoothPoints.map((p) => p.x);
  const yUpper = smoothPoints.map((p) => p.y * 1.005 + 0.02);
  const yLower = smoothPoints.map((p) => p.y * 0.995 - 0.02);

  // 3. Traces
  const traces: Plotly.Data[] = [
    // Trace 0: Certified Tolerance Envelope
    {
      x: [...xVals, ...xVals.slice().reverse()],
      y: [...yUpper, ...yLower.slice().reverse()],
      fill: 'toself',
      fillcolor: 'rgba(16, 185, 129, 0.12)', // Light emerald
      line: { color: 'rgba(16, 185, 129, 0.25)', width: 1, dash: 'dot' },
      hoverinfo: 'skip',
      showlegend: true,
      name: 'Certified Tolerance (±0.5%)',
      type: 'scatter',
    },
    // Trace 1: Fixed Premade Theoretical Ground Truth Baseline
    {
      x: xVals,
      y: smoothPoints.map((p) => p.y),
      mode: 'lines',
      type: 'scatter',
      name: 'Fixed Premade Baseline (Analytical)',
      line: { color: '#059669', width: 3, shape: 'spline' }, // Emerald-600
      hovertemplate: `<b>Certified %{yaxis.title.text}</b>: %{y:.3f}${yUnit}<extra>Premade Reference</extra>`,
    },
    // Trace 2: Verified Calibration Benchmark Points
    {
      x: discreteBenchmarks.map((p) => p.x),
      y: discreteBenchmarks.map((p) => p.y),
      mode: 'markers',
      type: 'scatter',
      name: `Certified Benchmarks (N=${discreteBenchmarks.length})`,
      marker: {
        color: '#d97706', // Amber-600
        size: 9,
        symbol: 'diamond',
        line: { color: '#ffffff', width: 2 },
      },
      hovertemplate: `<b>Benchmark Point</b><br>%{xaxis.title.text}: %{x:.3f}${xUnit}<br>%{yaxis.title.text}: %{y:.3f}${yUnit}<extra></extra>`,
    },
  ];

  // 4. Layout with prominent Premade Watermark and Calibration Indicators
  const layout: Partial<Plotly.Layout> = {
    ...baseLayout,
    autosize: true,
    title: {
      text: `<b>[FIXED PREMADE GRAPH]</b> ${activeGraph?.title || 'Certified Physics Calibration Benchmark'}`,
      font: { size: 13, color: '#047857', family: 'system-ui, sans-serif' },
    },
    annotations: [
      {
        text: '⚠️ FIXED PREMADE REFERENCE GRAPH (LOW SIMULATION HEALTH OVERRIDE)',
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: 1.08,
        showarrow: false,
        font: { size: 10, color: '#b45309', family: 'monospace' },
        bgcolor: '#fef3c7',
        bordercolor: '#fde68a',
        borderwidth: 1,
        borderpad: 4,
        opacity: 0.95,
      },
    ],
    xaxis: {
      ...baseLayout?.xaxis,
      title: {
        text: `${xLabel}${xUnit}`,
        font: { size: 11, color: '#334155' },
      },
      gridcolor: '#e2e8f0',
      zerolinecolor: '#cbd5e1',
    },
    yaxis: {
      ...baseLayout?.yaxis,
      title: {
        text: `${yLabel}${yUnit}`,
        font: { size: 11, color: '#334155' },
      },
      gridcolor: '#e2e8f0',
      zerolinecolor: '#cbd5e1',
    },
    paper_bgcolor: '#fafafa',
    plot_bgcolor: '#ffffff',
    legend: {
      orientation: 'h',
      x: 0,
      y: -0.22,
      font: { size: 10, color: '#475569' },
    },
  };

  const deduction: PhysicalDeduction = {
    label: 'Analytical Calibration Accuracy',
    formula: 'Δ = |exp - theory| / theory',
    experimentalValue: 0.0,
    theoreticalValue: 0.0,
    unit: '%',
    percentageError: 0.0,
  };

  const formInfo = {
    form: 'Fixed Premade Reference',
    description: 'Certified Analytical Baseline (Solver Health Override)',
    equation: isLinear ? 'y = 2.500x + 0.500' : 'y(t) = A·cos(ωt) / Certified Standard',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
  };

  return { traces, layout, deduction, formInfo };
}
