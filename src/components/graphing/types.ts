import { DataRow } from '../../types/laboratory';

export type GraphType = 'scatter' | 'line' | 'realtime-series' | 'trajectory';

export interface TheoreticalCurvePoint {
  x: number;
  y: number;
}

export interface TheoreticalCurveData {
  points: TheoreticalCurvePoint[];
  label: string;
  equation?: string;
}

export interface PhysicalDeduction {
  label: string;
  formula: string;
  unit: string;
  experimentalValue: number;
  theoreticalValue?: number;
  percentageError?: number;
  description?: string;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  count: number;
  stdError?: number;
  equation: string;
  deduction?: PhysicalDeduction;
}

export interface ScientificGraphDefinition {
  id: string;
  title: string;
  shortTitle?: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  graphType: GraphType;
  isLinear: boolean;
  expectedSlopeFormula?: string;
  expectedInterceptFormula?: string;
  /** Function to calculate expected theoretical gradient from current parameters */
  getExpectedSlope?: (params: any) => number;
  /** Function to calculate expected theoretical y-intercept from current parameters */
  getExpectedIntercept?: (params: any) => number;
  /** Function to generate the full theoretical curve/line for comparison */
  getTheoreticalCurve?: (xRange: [number, number], params: any) => TheoreticalCurveData;
  /** Function to perform physics deductions from regression results */
  deducePhysics?: (regression: { slope: number; intercept: number; r2: number }, params: any) => PhysicalDeduction | null;
  /** Custom point transformer if x or y needs mathematical transformation (e.g. 1/r, v^2, sin(i)) */
  transformPoint?: (row: DataRow) => { x: number; y: number } | null;
  /** Description or guidance for the physics student */
  theoryDescription?: string;
}

export interface RealtimeDataPoint {
  t: number;
  x: number;
  y: number;
  [key: string]: number;
}
