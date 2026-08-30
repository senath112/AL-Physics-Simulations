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
