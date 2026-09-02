import { RegressionResult } from './types';
import { DataRow } from '../../types/laboratory';

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Calculates high-precision Ordinary Least Squares linear regression
 * y = mx + c with R² coefficient of determination and standard error
 */
export function calculateLinearRegression(points: Point2D[]): RegressionResult | null {
  const validPoints = points.filter(
    (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  );

  if (validPoints.length < 2) return null;

  const n = validPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of validPoints) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R² correlation calculation
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denR !== 0 ? numR / denR : 0;
  const r2 = Math.min(1.0, Math.max(0.0, r * r));

  // Residual sum of squares & standard error of slope
  let ssRes = 0;
  for (const p of validPoints) {
    const yPred = slope * p.x + intercept;
    ssRes += Math.pow(p.y - yPred, 2);
  }
  const sxx = sumX2 - (sumX * sumX) / n;
  const stdError = n > 2 && sxx > 0 ? Math.sqrt(ssRes / (n - 2) / sxx) : undefined;

  const sign = intercept >= 0 ? '+' : '-';
  const absC = Math.abs(intercept).toFixed(3);
  const equation = `y = ${slope.toFixed(3)}x ${sign} ${absC}`;

  return {
    slope,
    intercept,
    r2,
    count: n,
    stdError,
    equation,
  };
}

/**
 * Calculates percentage error between experimental and theoretical values
 */
export function calculatePercentageError(experimental: number, theoretical: number): number {
  if (Math.abs(theoretical) < 1e-9) return 0;
  return (Math.abs(experimental - theoretical) / Math.abs(theoretical)) * 100;
}

/**
 * Exports data rows to CSV file and triggers browser download
 */
export function downloadCSV(filename: string, headers: { key: string; label: string; unit?: string }[], data: DataRow[]): void {
  const headerLine = headers
    .map((h) => `"${h.label}${h.unit ? ` (${h.unit})` : ''}"`)
    .join(',');

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key];
        return val !== undefined && val !== null ? `"${val}"` : '""';
      })
      .join(',')
  );

  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(`${headerLine}\n${rows.join('\n')}`)}`;
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface GraphFormInfo {
  form: string;            // e.g. "y = mx", "y = mx + c", "y = A sin(x)", "y = k / x"
  equation: string;        // e.g. "F = ma", "ℰ(t) = NABω·sin(ωt)", "V = IR"
  description: string;     // e.g. "Direct Proportion (Through Origin)", "Sinusoidal Wave"
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * Accurately determines the mathematical graph type (e.g. y = mx, y = sin x, y = mx + c)
 * and the governing physics equation for any scientific graph definition.
 */
export function getGraphFormInfo(
  graph: any,
  theoreticalCurve?: any
): GraphFormInfo {
  let form: string = graph.mathematicalForm || '';
  let description: string = graph.graphTypeDescription || '';
  let equation: string = graph.governingEquation || theoreticalCurve?.equation || '';

  const id = (graph.id || '').toLowerCase();
  const yKey = (graph.yKey || '').toLowerCase();
  const xKey = (graph.xKey || '').toLowerCase();
  const yLabel = (graph.yLabel || '').toLowerCase();
  const title = (graph.title || '').toLowerCase();

  // 1. Infer Form if not explicitly provided
  if (!form) {
    if (
      id.includes('sin') ||
      yLabel.includes('sin') ||
      yKey.includes('sin') ||
      title.includes('sin') ||
      (equation && equation.includes('sin') && !equation.includes('sinθ') && !equation.includes('sin('))
    ) {
      if (id.includes('sin2') || id.includes('2theta') || id.includes('sin_2')) {
        form = 'y = A sin(2x)';
        description = description || 'Sinusoidal Harmonic (Peak at 45°)';
      } else if (id.includes('sin_sq') || id.includes('sin2') || equation.includes('sin²')) {
        form = 'y = A sin²(x)';
        description = description || 'Quadratic Sine (Peak at 90°)';
      } else if (id.includes('v_vs_t_shm')) {
        form = 'y = -A sin(x)';
        description = description || 'Sinusoidal Oscillation (-sin)';
      } else {
        form = 'y = A sin(x)';
        description = description || 'Sinusoidal Wave / Periodic';
      }
    } else if (
      id.includes('cos') ||
      yLabel.includes('cos') ||
      yKey.includes('cos') ||
      title.includes('cos') ||
      (equation && equation.includes('cos'))
    ) {
      if (id.includes('a_vs_t_shm')) {
        form = 'y = -A cos(x)';
        description = description || 'Cosinusoidal Oscillation (-cos)';
      } else {
        form = 'y = A cos(x)';
        description = description || 'Cosinusoidal Oscillation';
      }
    } else if (id.includes('shm') && (xKey === 't' || id.includes('_vs_t'))) {
      if (id.includes('v_vs_t')) {
        form = 'y = -A sin(ωt)';
        description = description || 'Sinusoidal Velocity Oscillation';
      } else if (id.includes('a_vs_t')) {
        form = 'y = -A cos(ωt)';
        description = description || 'Cosinusoidal Acceleration Oscillation';
      } else {
        form = 'y = A cos(ωt)';
        description = description || 'Cosinusoidal Displacement Oscillation';
      }
    } else if (graph.graphType === 'trajectory' || id.includes('trajectory') || (id === 'y_vs_x' && title.includes('height'))) {
      form = 'y = ax - bx²';
      description = description || 'Inverted Parabola (Trajectory)';
    } else if (
      id.includes('inv_r2') ||
      id.includes('1_r2') ||
      xKey.includes('inv_r2') ||
      title.includes('1/r²')
    ) {
      form = 'y = mx';
      description = description || 'Linearised Inverse-Square [y = m(1/r²)]';
    } else if (
      id.includes('inv_') ||
      id.includes('1_') ||
      xKey.includes('inv') ||
      title.includes('1/')
    ) {
      form = 'y = mx';
      description = description || 'Linearised Inverse [y = m(1/x)]';
    } else if (
      !graph.isLinear &&
      (id.includes('inv') || yKey.includes('inv') || id.includes('p_vs_v') || id.includes('a_vs_m'))
    ) {
      form = 'y = k / x';
      description = description || 'Inverse Proportion (Rectangular Hyperbola)';
    } else if (
      !graph.isLinear &&
      (id.includes('grav') || id.includes('f_vs_r') || id.includes('inverse_square'))
    ) {
      form = 'y = k / x²';
      description = description || 'Inverse Square Relationship';
    } else if (
      !graph.isLinear &&
      (id.includes('energy') || id.includes('p_vs_i') || id.includes('quad') || id.includes('parabol'))
    ) {
      form = 'y = k x²';
      description = description || 'Quadratic / Parabolic';
    } else if (graph.isLinear) {
      if (
        graph.expectedInterceptFormula ||
        graph.getExpectedIntercept ||
        id.includes('photoelectric') ||
        id.includes('intercept') ||
        id.includes('optics') ||
        id.includes('vy_vs_t')
      ) {
        form = 'y = mx + c';
        description = description || 'Linear (with Non-Zero Intercept)';
      } else {
        form = 'y = mx';
        description = description || 'Direct Proportion (Passes Through Origin)';
      }
    } else {
      form = 'y = f(x)';
      description = description || 'Non-Linear Characteristic';
    }
  }

  // 2. Infer Description if still missing
  if (!description) {
    if (form === 'y = mx') description = 'Direct Proportion (Passes Through Origin)';
    else if (form === 'y = mx + c') description = 'Linear (with Non-Zero Intercept)';
    else if (form.includes('sin')) description = 'Sinusoidal Wave / Periodic';
    else if (form.includes('cos')) description = 'Cosinusoidal Wave';
    else if (form.includes('k / x²')) description = 'Inverse-Square Relationship';
    else if (form.includes('k / x')) description = 'Inverse Proportion (Hyperbola)';
    else if (form.includes('x²')) description = 'Quadratic / Parabolic';
    else description = 'Functional Relation';
  }

  // 3. Infer Equation if still missing
  if (!equation) {
    if (id === 'f_vs_a' || (xKey === 'acceleration' && yKey === 'force')) equation = 'F = ma';
    else if (id === 'v_vs_i' || (xKey === 'current' && yKey === 'voltage')) equation = 'V = I·R';
    else if (id === 'i_vs_v' || (xKey === 'voltage' && yKey === 'current')) equation = 'I = (1/R)·V';
    else if (id === 'a_vs_x_shm') equation = 'a = -ω²x';
    else if (id === 'x_vs_t_shm') equation = 'x(t) = A cos(ωt)';
    else if (id === 'v_vs_t_shm') equation = 'v(t) = -Aω sin(ωt)';
    else if (id === 'a_vs_t_shm') equation = 'a(t) = -Aω² cos(ωt)';
    else if (id.includes('pendulum') || (xKey === 'length' && yKey.includes('period'))) equation = 'T² = (4π²/g)·L';
    else if (id.includes('spring') && yKey.includes('period')) equation = 'T² = (4π²/k)·m';
    else if (id === 'vs_vs_f' || id.includes('photoelectric')) equation = 'V_s = (h/e)·f - (Φ/e)';
    else if (id.includes('f_vs_inv_r2')) equation = 'F = (G m₁ m₂)·(1/r²)';
    else if (id.includes('f_vs_r')) equation = 'F = (G m₁ m₂)/r²';
    else if (id.includes('emf_vs_omega')) equation = 'ℰ₀ = (NAB)·ω';
    else if (id.includes('tau_vs_i')) equation = 'τ = (NAB)·I';
    else if (id.includes('vs_vs_ns')) equation = 'V_s = (V_p/N_p)·N_s';
    else if (id.includes('sin_i_vs_sin_r')) equation = 'sin(i) = n·sin(r)';
    else if (id.includes('inv_v_vs_inv_u')) equation = '1/v = -1/u + 1/f';
    else if (id.includes('p_vs_v')) equation = 'P = nRT / V';
    else if (id.includes('p_vs_inv_v')) equation = 'P = (nRT)·(1/V)';
    else if (id.includes('v_vs_t_incline')) equation = 'v = at';
    else if (id.includes('a_vs_sin')) equation = 'a = (g)·sinθ - μ_k g cosθ';
    else if (id.includes('y_vs_x')) equation = 'y = x tanθ - (gx²)/(2u²cos²θ)';
    else if (graph.isLinear && graph.expectedSlopeFormula) equation = `${graph.yKey} = (${graph.expectedSlopeFormula})·${graph.xKey}`;
    else if (graph.isLinear) equation = `${graph.yKey} = m·${graph.xKey}`;
    else equation = `${graph.yKey} = f(${graph.xKey})`;
  }

  // 4. Color Palette
  let badgeColor = {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  };

  if (form.includes('sin') || form.includes('cos')) {
    badgeColor = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    };
  } else if (form === 'y = mx + c' || form.includes('- c') || form.includes('+ c') || form.includes('y = -mx')) {
    badgeColor = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    };
  } else if (form.includes('k / x') || form.includes('x²')) {
    badgeColor = {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    };
  } else if (form.includes('ax - bx²')) {
    badgeColor = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    };
  }

  return {
    form,
    equation,
    description,
    badgeColor,
  };
}
