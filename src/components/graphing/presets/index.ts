import { ScientificGraphDefinition } from '../types';
import { calculatePercentageError } from '../regressionUtils';

// ==========================================
// 1. Newton's Second Law Presets
// ==========================================
export const newtonsSecondLawGraphs: ScientificGraphDefinition[] = [
  {
    id: 'f_vs_a',
    title: 'Force (F) vs Acceleration (a)',
    xKey: 'acceleration',
    yKey: 'force',
    xLabel: 'Acceleration a',
    yLabel: 'Net Force F',
    xUnit: 'm/s²',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Mass m (kg)',
    getExpectedSlope: (p) => p.mass || 5.0,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m = p.mass || 5.0;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      const pts = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const a = x0 + (i / steps) * (x1 - x0);
        pts.push({ x: parseFloat(a.toFixed(2)), y: parseFloat((m * a).toFixed(2)) });
      }
      return { points: pts, label: `Theoretical F = ${m.toFixed(1)}a`, equation: `F = ${m.toFixed(1)}a` };
    },
    deducePhysics: (reg, p) => {
      const theoMass = p.mass || 5.0;
      const err = calculatePercentageError(reg.slope, theoMass);
      return {
        label: 'Deduced Mass (m)',
        formula: 'm = ΔF / Δa',
        unit: 'kg',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoMass.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'According to Newton’s Second Law (F_net = ma), the slope of F vs a equals the mass m of the object.',
  },
  {
    id: 'a_vs_f',
    title: 'Acceleration (a) vs Force (F)',
    xKey: 'force',
    yKey: 'acceleration',
    xLabel: 'Applied Force F',
    yLabel: 'Acceleration a',
    xUnit: 'N',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '1 / Mass (1/m)',
    getExpectedSlope: (p) => (p.mass ? 1 / p.mass : 0.2),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m = p.mass || 5.0;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 50, 50);
      const pts = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const F = x0 + (i / steps) * (x1 - x0);
        pts.push({ x: parseFloat(F.toFixed(2)), y: parseFloat((F / m).toFixed(2)) });
      }
      return { points: pts, label: `Theoretical a = F / ${m.toFixed(1)}`, equation: `a = F / ${m.toFixed(1)}` };
    },
    deducePhysics: (reg, p) => {
      const expMass = reg.slope !== 0 ? 1 / reg.slope : 0;
      const theoMass = p.mass || 5.0;
      const err = calculatePercentageError(expMass, theoMass);
      return {
        label: 'Deduced Mass from 1/Slope',
        formula: 'm = 1 / slope',
        unit: 'kg',
        experimentalValue: parseFloat(expMass.toFixed(3)),
        theoreticalValue: parseFloat(theoMass.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Acceleration is directly proportional to net force and inversely proportional to mass (a = F / m).',
  },
  {
    id: 'fric_vs_normal',
    title: 'Kinetic Friction (f_k) vs Normal Reaction (R)',
    xKey: 'normalForce',
    yKey: 'friction',
    xLabel: 'Normal Reaction R',
    yLabel: 'Kinetic Friction f_k',
    xUnit: 'N',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Kinetic Friction Coefficient μ_k',
    getExpectedSlope: (p) => p.muKinetic ?? 0.2,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const mu = p.muKinetic ?? 0.2;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 100, 100);
      const pts = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const R = x0 + (i / steps) * (x1 - x0);
        pts.push({ x: parseFloat(R.toFixed(2)), y: parseFloat((mu * R).toFixed(2)) });
      }
      return { points: pts, label: `Theoretical f_k = ${mu.toFixed(2)}R`, equation: `f_k = ${mu.toFixed(2)}R` };
    },
    deducePhysics: (reg, p) => {
      const theoMu = p.muKinetic ?? 0.2;
      const err = calculatePercentageError(reg.slope, theoMu);
      return {
        label: 'Friction Coefficient (μ_k)',
        formula: 'μ_k = f_k / R',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoMu.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Kinetic friction is directly proportional to the normal reaction (f_k = μ_k · R).',
  },
];

// ==========================================
// 2. Inclined Plane Presets
// ==========================================
export const inclinedPlaneGraphs: ScientificGraphDefinition[] = [
  {
    id: 'theta_vs_a',
    title: 'Acceleration (a) vs Incline Angle (θ)',
    xKey: 'theta',
    yKey: 'acceleration',
    xLabel: 'Incline Angle θ',
    yLabel: 'Acceleration a',
    xUnit: '°',
    yUnit: 'm/s²',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const g = p.gravity || 9.81;
      const mu_k = p.muKinetic ?? 0.2;
      const mu_s = p.muStatic ?? 0.3;
      const pts = [];
      for (let deg = 0; deg <= 90; deg += 2) {
        const rad = (deg * Math.PI) / 180;
        const tanVal = Math.tan(rad);
        let a = 0;
        if (tanVal > mu_s || deg === 90) {
          a = Math.max(0, g * (Math.sin(rad) - mu_k * Math.cos(rad)));
        }
        pts.push({ x: deg, y: parseFloat(a.toFixed(2)) });
      }
      return { points: pts, label: `Theoretical a = g(sinθ - μ_k cosθ)`, equation: `a = g(sinθ - μ_k cosθ)` };
    },
    theoryDescription: 'Block accelerates down slope once θ exceeds angle of repose (tanθ > μ_s). Acceleration is a = g(sinθ - μ_k cosθ).',
  },
  {
    id: 'fric_vs_normal_incline',
    title: 'Friction Force vs Normal Reaction (R)',
    xKey: 'normalForce',
    yKey: 'friction',
    xLabel: 'Normal Reaction R = mg cosθ',
    yLabel: 'Limiting Friction f_max',
    xUnit: 'N',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Coefficient of Friction μ',
    getExpectedSlope: (p) => p.muStatic ?? 0.3,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const mu = p.muStatic ?? 0.3;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 100, 100);
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const R = x0 + (i / 20) * (x1 - x0);
        pts.push({ x: parseFloat(R.toFixed(2)), y: parseFloat((mu * R).toFixed(2)) });
      }
      return { points: pts, label: `Theoretical f_max = ${mu.toFixed(2)}R`, equation: `f_max = ${mu.toFixed(2)}R` };
    },
    deducePhysics: (reg, p) => {
      const theoMu = p.muStatic ?? 0.3;
      const err = calculatePercentageError(reg.slope, theoMu);
      return {
        label: 'Deduced Friction Coefficient (μ)',
        formula: 'μ = f_max / R',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoMu.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'fnet_vs_disp',
    title: 'Net Force (F_net) vs Displacement (s)',
    xKey: 'position',
    yKey: 'force',
    xLabel: 'Displacement along plane s',
    yLabel: 'Net Force F_net',
    xUnit: 'm',
    yUnit: 'N',
    graphType: 'realtime-series',
    isLinear: true,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m = p.mass || 2.0;
      const g = p.gravity || 9.81;
      const rad = ((p.angle || 30) * Math.PI) / 180;
      const mu_k = p.muKinetic ?? 0.2;
      const fnet = Math.max(0, m * g * (Math.sin(rad) - mu_k * Math.cos(rad)));
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      return {
        points: [{ x: x0, y: parseFloat(fnet.toFixed(2)) }, { x: x1, y: parseFloat(fnet.toFixed(2)) }],
        label: `Constant Net Force F_net = ${fnet.toFixed(2)} N`,
      };
    },
  },
];

// ==========================================
// 3. Projectile Motion Presets
// ==========================================
export const projectileGraphs: ScientificGraphDefinition[] = [
  {
    id: 'y_vs_x',
    title: 'Trajectory: Height (y) vs Distance (x)',
    xKey: 'x',
    yKey: 'y',
    xLabel: 'Horizontal Distance x',
    yLabel: 'Vertical Height y',
    xUnit: 'm',
    yUnit: 'm',
    graphType: 'trajectory',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 25;
      const th = ((p.angle || 45) * Math.PI) / 180;
      const g = p.gravity || 9.81;
      const h0 = p.initialHeight || 0;
      const vx = v0 * Math.cos(th);
      const vy0 = v0 * Math.sin(th);
      const flightTime = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * h0)) / g;
      const totalR = vx * flightTime;
      const pts = [];
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * totalR;
        const t = x / (vx || 1);
        const y = Math.max(0, h0 + vy0 * t - 0.5 * g * t * t);
        pts.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
      }
      return { points: pts, label: 'Parabolic Path y(x)', equation: 'y = x tanθ - (g x²)/(2 u² cos²θ)' };
    },
    theoryDescription: 'Ideal trajectory in a vacuum is a parabola given by y = x tanθ - (g x²)/(2 u² cos²θ).',
  },
  {
    id: 'range_vs_angle',
    title: 'Horizontal Range (R) vs Launch Angle (θ)',
    xKey: 'angle',
    yKey: 'range',
    xLabel: 'Launch Angle θ',
    yLabel: 'Horizontal Range R',
    xUnit: '°',
    yUnit: 'm',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 25;
      const g = p.gravity || 9.81;
      const pts = [];
      for (let deg = 0; deg <= 90; deg += 2) {
        const rad = (deg * Math.PI) / 180;
        const R = (v0 * v0 * Math.sin(2 * rad)) / g;
        pts.push({ x: deg, y: parseFloat(R.toFixed(2)) });
      }
      return { points: pts, label: `Theoretical R(θ) [Max at 45° = ${((v0 * v0) / g).toFixed(1)}m]`, equation: 'R = (u² sin 2θ) / g' };
    },
    theoryDescription: 'For a projectile launched from ground level, horizontal range is R = (u² sin 2θ)/g. It achieves its maximum at θ = 45°.',
  },
  {
    id: 'hmax_vs_angle',
    title: 'Maximum Height (H_max) vs Launch Angle (θ)',
    xKey: 'angle',
    yKey: 'height',
    xLabel: 'Launch Angle θ',
    yLabel: 'Maximum Height H_max',
    xUnit: '°',
    yUnit: 'm',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 25;
      const g = p.gravity || 9.81;
      const pts = [];
      for (let deg = 0; deg <= 90; deg += 2) {
        const rad = (deg * Math.PI) / 180;
        const H = (v0 * v0 * Math.sin(rad) * Math.sin(rad)) / (2 * g);
        pts.push({ x: deg, y: parseFloat(H.toFixed(2)) });
      }
      return { points: pts, label: `Theoretical H_max(θ) [Max at 90° = ${((v0 * v0) / (2 * g)).toFixed(1)}m]`, equation: 'H = (u² sin²θ) / (2g)' };
    },
    theoryDescription: 'Maximum height reached is H_max = (u² sin²θ)/(2g). It peaks at vertical launch θ = 90°.',
  },
  {
    id: 'y_vs_t',
    title: 'Vertical Height (y) vs Time (t)',
    xKey: 't',
    yKey: 'y',
    xLabel: 'Time t',
    yLabel: 'Vertical Position y',
    xUnit: 's',
    yUnit: 'm',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 25;
      const th = ((p.angle || 45) * Math.PI) / 180;
      const g = p.gravity || 9.81;
      const vy0 = v0 * Math.sin(th);
      const totalT = (2 * vy0) / g;
      const pts = [];
      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * totalT;
        const y = Math.max(0, vy0 * t - 0.5 * g * t * t);
        pts.push({ x: parseFloat(t.toFixed(2)), y: parseFloat(y.toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical y(t)', equation: 'y = (u sinθ)t - 1/2 g t²' };
    },
  },
  {
    id: 'x_vs_t',
    title: 'Horizontal Distance (x) vs Time (t)',
    xKey: 't',
    yKey: 'x',
    xLabel: 'Time t',
    yLabel: 'Horizontal Position x',
    xUnit: 's',
    yUnit: 'm',
    graphType: 'realtime-series',
    isLinear: true,
    expectedSlopeFormula: 'Horizontal Velocity u_x = u cosθ',
    getExpectedSlope: (p) => (p.velocity || 25) * Math.cos(((p.angle || 45) * Math.PI) / 180),
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 25;
      const th = ((p.angle || 45) * Math.PI) / 180;
      const g = p.gravity || 9.81;
      const vx = v0 * Math.cos(th);
      const totalT = (2 * v0 * Math.sin(th)) / g;
      return {
        points: [{ x: 0, y: 0 }, { x: parseFloat(totalT.toFixed(2)), y: parseFloat((vx * totalT).toFixed(2)) }],
        label: `Uniform Horizontal Velocity v_x = ${vx.toFixed(1)} m/s`,
        equation: 'x = (u cosθ)t',
      };
    },
  },
];

// ==========================================
// 4. Connected Particles Presets
// ==========================================
export const connectedParticlesGraphs: ScientificGraphDefinition[] = [
  {
    id: 'v_vs_t',
    title: 'Velocity (v) vs Time (t)',
    xKey: 't',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: true,
    expectedSlopeFormula: 'System Acceleration a = (m₂ - μm₁)g / (m₁ + m₂)',
    getExpectedSlope: (p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const mu = p.mu ?? 0.1;
      const g = p.gravity || 9.81;
      return Math.max(0, ((m2 - mu * m1) / (m1 + m2)) * g);
    },
    getTheoreticalCurve: ([, maxX], p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const mu = p.mu ?? 0.1;
      const g = p.gravity || 9.81;
      const a = Math.max(0, ((m2 - mu * m1) / (m1 + m2)) * g);
      const tMax = Math.max(maxX ?? 5, 5);
      return {
        points: [{ x: 0, y: 0 }, { x: tMax, y: parseFloat((a * tMax).toFixed(2)) }],
        label: `Uniform Acceleration a = ${a.toFixed(2)} m/s²`,
        equation: 'v = at',
      };
    },
  },
  {
    id: 'a_vs_m2',
    title: 'Acceleration (a) vs Hanging Mass (m₂)',
    xKey: 'mass2',
    yKey: 'acceleration',
    xLabel: 'Hanging Mass m₂',
    yLabel: 'Acceleration a',
    xUnit: 'kg',
    yUnit: 'm/s²',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const m1 = p.mass1 || 2;
      const mu = p.mu ?? 0.1;
      const g = p.gravity || 9.81;
      const pts = [];
      for (let m2 = 0.5; m2 <= 10; m2 += 0.5) {
        const a = Math.max(0, ((m2 - mu * m1) / (m1 + m2)) * g);
        pts.push({ x: m2, y: parseFloat(a.toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical a(m₂)', equation: 'a = (m₂ - μm₁)g / (m₁ + m₂)' };
    },
  },
];

// ==========================================
// 5. Pulley Systems Presets (Atwood Machine)
// ==========================================
export const pulleySystemsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'a_vs_delta_m',
    title: 'Acceleration (a) vs Mass Difference (m₂ - m₁)',
    xKey: 'massDiff',
    yKey: 'acceleration',
    xLabel: 'Mass Difference (m₂ - m₁)',
    yLabel: 'Acceleration a',
    xUnit: 'kg',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'g / (m₁ + m₂)',
    getExpectedSlope: (p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const g = p.gravity || 9.81;
      return g / (m1 + m2);
    },
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const g = p.gravity || 9.81;
      const slope = g / (m1 + m2);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 5, 5);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: 'Theoretical a = [g / (m₁ + m₂)] · Δm',
        equation: 'a = (m₂ - m₁)g / (m₁ + m₂)',
      };
    },
  },
  {
    id: 'v_vs_t_pulley',
    title: 'Velocity (v) vs Time (t)',
    xKey: 't',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: true,
    expectedSlopeFormula: 'Atwood Acceleration a = (m₂ - m₁)g / (m₁ + m₂)',
    getExpectedSlope: (p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const g = p.gravity || 9.81;
      return (Math.abs(m2 - m1) / (m1 + m2)) * g;
    },
    getTheoreticalCurve: (_, p) => {
      const m1 = p.mass1 || 2;
      const m2 = p.mass2 || 4;
      const g = p.gravity || 9.81;
      const a = (Math.abs(m2 - m1) / (m1 + m2)) * g;
      return {
        points: [{ x: 0, y: 0 }, { x: 5, y: parseFloat((a * 5).toFixed(2)) }],
        label: `Theoretical v(t) [a = ${a.toFixed(2)} m/s²]`,
      };
    },
  },
];

// ==========================================
// 6. Momentum & Collisions Presets
// ==========================================
export const momentumCollisionsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'pf_vs_pi',
    title: 'Final Momentum (p_f) vs Initial Momentum (p_i)',
    xKey: 'initialMomentum',
    yKey: 'finalMomentum',
    xLabel: 'Initial Momentum p_i',
    yLabel: 'Final Momentum p_f',
    xUnit: 'kg·m/s',
    yUnit: 'kg·m/s',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Conservation Slope = 1.0',
    getExpectedSlope: () => 1.0,
    getTheoreticalCurve: ([minX, maxX]) => {
      const x0 = minX ?? -20;
      const x1 = maxX ?? 20;
      return {
        points: [{ x: x0, y: x0 }, { x: x1, y: x1 }],
        label: 'Conservation of Linear Momentum (p_f = p_i)',
        equation: 'p_f = p_i',
      };
    },
    deducePhysics: (reg) => {
      const err = calculatePercentageError(reg.slope, 1.0);
      return {
        label: 'Conservation Verification',
        formula: 'Slope = p_f / p_i',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: 1.0,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'In an isolated system, total momentum before collision equals total momentum after (p_initial = p_final).',
  },
];

// ==========================================
// 7. Circular Motion Presets
// ==========================================
export const circularMotionGraphs: ScientificGraphDefinition[] = [
  {
    id: 'fc_vs_v2',
    title: 'Centripetal Force (F_c) vs Speed Squared (v²)',
    xKey: 'vSquared',
    yKey: 'centripetalForce',
    xLabel: 'Speed Squared v²',
    yLabel: 'Centripetal Force F_c',
    xUnit: 'm²/s²',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'm / r',
    getExpectedSlope: (p) => (p.mass || 1.0) / (p.radius || 2.0),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = (p.mass || 1.0) / (p.radius || 2.0);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 100, 100);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Theoretical F_c = ${(slope).toFixed(2)} v²`,
        equation: 'F_c = (m/r) v²',
      };
    },
    deducePhysics: (reg, p) => {
      const theoSlope = (p.mass || 1.0) / (p.radius || 2.0);
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Deduced (m/r) Ratio',
        formula: 'Slope = m / r',
        unit: 'kg/m',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoSlope.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'fc_vs_r',
    title: 'Centripetal Force (F_c) vs Radius (r)',
    xKey: 'radius',
    yKey: 'centripetalForce',
    xLabel: 'Radius r',
    yLabel: 'Centripetal Force F_c',
    xUnit: 'm',
    yUnit: 'N',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const m = p.mass || 1.0;
      const v = p.velocity || 10;
      const pts = [];
      for (let r = 0.5; r <= 10; r += 0.5) {
        pts.push({ x: r, y: parseFloat(((m * v * v) / r).toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical F_c = m v² / r', equation: 'F_c = m v² / r' };
    },
  },
];

// ==========================================
// 8. Work, Energy & Power Presets
// ==========================================
export const workEnergyGraphs: ScientificGraphDefinition[] = [
  {
    id: 'v2_vs_h',
    title: 'Velocity Squared (v²) vs Fall Height (h)',
    xKey: 'height',
    yKey: 'vSquared',
    xLabel: 'Fall Height h',
    yLabel: 'Speed Squared v²',
    xUnit: 'm',
    yUnit: 'm²/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '2g (Gravitational Acceleration Multiplier)',
    getExpectedSlope: (p) => 2 * (p.gravity || 9.81),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const g = p.gravity || 9.81;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 20, 20);
      return {
        points: [{ x: x0, y: parseFloat((2 * g * x0).toFixed(2)) }, { x: x1, y: parseFloat((2 * g * x1).toFixed(2)) }],
        label: `Theoretical v² = 2gh [2g = ${(2 * g).toFixed(2)} m/s²]`,
        equation: 'v² = 2gh',
      };
    },
    deducePhysics: (reg, p) => {
      const expG = reg.slope / 2;
      const theoG = p.gravity || 9.81;
      const err = calculatePercentageError(expG, theoG);
      return {
        label: 'Deduced Gravity (g)',
        formula: 'g = Slope / 2',
        unit: 'm/s²',
        experimentalValue: parseFloat(expG.toFixed(3)),
        theoreticalValue: parseFloat(theoG.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'energy_vs_t',
    title: 'Total Mechanical Energy vs Time (Conservation)',
    xKey: 't',
    yKey: 'totalEnergy',
    xLabel: 'Time t',
    yLabel: 'Total Mechanical Energy E',
    xUnit: 's',
    yUnit: 'J',
    graphType: 'realtime-series',
    isLinear: true,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m = p.mass || 2;
      const g = p.gravity || 9.81;
      const h0 = p.initialHeight || 10;
      const eTot = m * g * h0;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 5, 5);
      return {
        points: [{ x: x0, y: parseFloat(eTot.toFixed(2)) }, { x: x1, y: parseFloat(eTot.toFixed(2)) }],
        label: `Constant Total Energy E = ${eTot.toFixed(1)} J`,
      };
    },
  },
];

// ==========================================
// 9. Centre of Mass Presets
// ==========================================
export const centreOfMassGraphs: ScientificGraphDefinition[] = [
  {
    id: 'xcm_vs_total_m',
    title: 'Centre of Mass X_cm vs Total Mass M',
    xKey: 'totalMass',
    yKey: 'xCM',
    xLabel: 'Total Mass M',
    yLabel: 'X-Centre of Mass X_cm',
    xUnit: 'kg',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const xVal = p.xCM ?? 5.0;
      const x0 = minX ?? 1;
      const x1 = Math.max(maxX ?? 20, 20);
      return {
        points: [{ x: x0, y: xVal }, { x: x1, y: xVal }],
        label: `Center of Mass Position X_cm = ${xVal.toFixed(2)} m`,
      };
    },
  },
];

// ==========================================
// 10. Gravitational Fields & Orbits Presets
// ==========================================
export const gravityOrbitsGraphs: ScientificGraphDefinition[] = [
  {
    id: 't2_vs_r3',
    title: "Kepler's Third Law: Period Squared (T²) vs Radius Cubed (r³)",
    xKey: 'rCubed',
    yKey: 'tSquared',
    xLabel: 'Orbital Radius Cubed r³ (× 10²⁴ m³)',
    yLabel: 'Period Squared T² (× 10¹² s²)',
    xUnit: '10²⁴ m³',
    yUnit: '10¹² s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '4π² / GM',
    getExpectedSlope: () => 1.0,
    getTheoreticalCurve: ([minX, maxX]) => {
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 100, 100);
      return {
        points: [{ x: x0, y: x0 }, { x: x1, y: x1 }],
        label: "Kepler's 3rd Law T² ∝ r³",
        equation: 'T² = (4π²/GM) r³',
      };
    },
    theoryDescription: 'Kepler’s Third Law states that the square of orbital period T is directly proportional to the cube of semi-major axis r (T² ∝ r³).',
  },
  {
    id: 'vorb_vs_r',
    title: 'Orbital Velocity (v) vs Orbital Radius (r)',
    xKey: 'radius',
    yKey: 'velocity',
    xLabel: 'Orbital Radius r',
    yLabel: 'Orbital Velocity v',
    xUnit: 'AU / m',
    yUnit: 'km/s',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const k = Math.sqrt((p.starMass || 1.0) * 887);
      const pts = [];
      for (let r = 0.5; r <= 10; r += 0.5) {
        pts.push({ x: r, y: parseFloat((k / Math.sqrt(r)).toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical v = √(GM/r)', equation: 'v = √(GM/r)' };
    },
  },
];

// ==========================================
// 11. Hydrostatics Presets
// ==========================================
export const hydrostaticsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'p_vs_h',
    title: 'Hydrostatic Pressure (P) vs Depth (h)',
    xKey: 'depth',
    yKey: 'pressure',
    xLabel: 'Liquid Depth h',
    yLabel: 'Total Pressure P',
    xUnit: 'm',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'ρg (Liquid Density × Gravity)',
    getExpectedSlope: (p) => ((p.liquidDensity || 1000) * (p.gravity || 9.81)) / 1000,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const rho = p.liquidDensity || 1000;
      const g = p.gravity || 9.81;
      const p0 = 101.325; // Atmospheric pressure in kPa
      const slope = (rho * g) / 1000;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const h = x0 + (i / 20) * (x1 - x0);
        pts.push({ x: parseFloat(h.toFixed(2)), y: parseFloat((p0 + slope * h).toFixed(2)) });
      }
      return { points: pts, label: `Theoretical P = P₀ + ρgh`, equation: 'P = P₀ + ρgh' };
    },
    deducePhysics: (reg, p) => {
      const g = p.gravity || 9.81;
      const expRho = (reg.slope * 1000) / g;
      const theoRho = p.liquidDensity || 1000;
      const err = calculatePercentageError(expRho, theoRho);
      return {
        label: 'Deduced Liquid Density (ρ)',
        formula: 'ρ = Slope / g',
        unit: 'kg/m³',
        experimentalValue: parseFloat(expRho.toFixed(1)),
        theoreticalValue: parseFloat(theoRho.toFixed(1)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Hydrostatic pressure increases linearly with liquid depth: P = P_atm + ρgh. Slope gives ρg and intercept is P_atm.',
  },
  {
    id: 'fb_vs_vdisp',
    title: 'Archimedes Law: Buoyant Force (F_b) vs Displaced Volume (V_disp)',
    xKey: 'displacedVolume',
    yKey: 'buoyantForce',
    xLabel: 'Displaced Volume V_disp',
    yLabel: 'Upthrust F_b',
    xUnit: 'L',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'ρg / 1000',
    getExpectedSlope: (p) => ((p.liquidDensity || 1000) * (p.gravity || 9.81)) / 1000,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = ((p.liquidDensity || 1000) * (p.gravity || 9.81)) / 1000;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: 'Archimedes Upthrust F_b = ρg V_disp',
        equation: 'F_b = ρ g V_disp',
      };
    },
  },
];

// ==========================================
// 12. Simple Harmonic Motion (SHM) Presets
// ==========================================
export const shmGraphs: ScientificGraphDefinition[] = [
  {
    id: 'a_vs_x_shm',
    title: 'Defining Relation: Acceleration (a) vs Displacement (x)',
    xKey: 'displacement',
    yKey: 'acceleration',
    xLabel: 'Displacement from Equilibrium x',
    yLabel: 'Acceleration a',
    xUnit: 'm',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '-ω² (Negative Angular Frequency Squared)',
    getExpectedSlope: (p) => {
      if (p.mode === 'pendulum') {
        const g = 9.81;
        const L = p.length || 1.0;
        return -(g / L);
      } else {
        const k = p.springK || 20;
        const m = p.mass || 1.0;
        return -(k / m);
      }
    },
    getTheoreticalCurve: (_, p) => {
      const A = p.amplitude || 1.5;
      const omegaSq = p.mode === 'pendulum' ? 9.81 / (p.length || 1.0) : (p.springK || 20) / (p.mass || 1.0);
      return {
        points: [
          { x: -A, y: parseFloat((omegaSq * A).toFixed(2)) },
          { x: A, y: parseFloat((-omegaSq * A).toFixed(2)) },
        ],
        label: `Defining SHM Condition a = -ω²x [ω² = ${omegaSq.toFixed(2)} s⁻²]`,
        equation: 'a = -ω²x',
      };
    },
    deducePhysics: (reg, p) => {
      const expOmegaSq = -reg.slope;
      const theoOmegaSq = p.mode === 'pendulum' ? 9.81 / (p.length || 1.0) : (p.springK || 20) / (p.mass || 1.0);
      const err = calculatePercentageError(expOmegaSq, theoOmegaSq);
      return {
        label: 'Angular Frequency Squared (ω²)',
        formula: 'ω² = -Slope',
        unit: 'rad²/s²',
        experimentalValue: parseFloat(expOmegaSq.toFixed(3)),
        theoreticalValue: parseFloat(theoOmegaSq.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'The defining characteristic of Simple Harmonic Motion is a = -ω²x. The straight line passes through origin with negative slope -ω².',
  },
  {
    id: 'x_vs_t_shm',
    title: 'Displacement (x) vs Time (t)',
    xKey: 't',
    yKey: 'displacement',
    xLabel: 'Time t',
    yLabel: 'Displacement x',
    xUnit: 's',
    yUnit: 'm',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const A = p.amplitude || 1.5;
      const omega = Math.sqrt(p.mode === 'pendulum' ? 9.81 / (p.length || 1.0) : (p.springK || 20) / (p.mass || 1.0));
      const T = (2 * Math.PI) / omega;
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * (2 * T);
        pts.push({ x: parseFloat(t.toFixed(2)), y: parseFloat((A * Math.cos(omega * t)).toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical x(t) = A cos(ωt)', equation: 'x = A cos(ωt)' };
    },
  },
  {
    id: 'v_vs_t_shm',
    title: 'Velocity (v) vs Time (t)',
    xKey: 't',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const A = p.amplitude || 1.5;
      const omega = Math.sqrt(p.mode === 'pendulum' ? 9.81 / (p.length || 1.0) : (p.springK || 20) / (p.mass || 1.0));
      const vmax = A * omega;
      const T = (2 * Math.PI) / omega;
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * (2 * T);
        pts.push({ x: parseFloat(t.toFixed(2)), y: parseFloat((-vmax * Math.sin(omega * t)).toFixed(2)) });
      }
      return { points: pts, label: 'Theoretical v(t) = -Aω sin(ωt)', equation: 'v = -Aω sin(ωt)' };
    },
  },
  {
    id: 't2_vs_l_pendulum',
    title: 'Pendulum: Period Squared (T²) vs Length (L)',
    xKey: 'length',
    yKey: 'tSquared',
    xLabel: 'Pendulum Length L',
    yLabel: 'Period Squared T²',
    xUnit: 'm',
    yUnit: 's²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '4π² / g ≈ 4.02 s²/m',
    getExpectedSlope: () => (4 * Math.PI * Math.PI) / 9.81,
    getTheoreticalCurve: ([minX, maxX]) => {
      const slope = (4 * Math.PI * Math.PI) / 9.81;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 3, 3);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Theoretical T² = (4π²/g)L [Slope = ${slope.toFixed(2)}]`,
        equation: 'T² = (4π²/g)L',
      };
    },
    deducePhysics: (reg) => {
      const expG = (4 * Math.PI * Math.PI) / reg.slope;
      const err = calculatePercentageError(expG, 9.81);
      return {
        label: 'Deduced Gravity (g)',
        formula: 'g = 4π² / Slope',
        unit: 'm/s²',
        experimentalValue: parseFloat(expG.toFixed(3)),
        theoreticalValue: 9.81,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'For a simple pendulum, T = 2π√(L/g) → T² = (4π²/g)L. Slope gives 4π²/g to determine local gravitational acceleration.',
  },
  {
    id: 't2_vs_m_spring',
    title: 'Spring-Mass: Period Squared (T²) vs Mass (m)',
    xKey: 'mass',
    yKey: 'tSquared',
    xLabel: 'Oscillating Mass m',
    yLabel: 'Period Squared T²',
    xUnit: 'kg',
    yUnit: 's²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '4π² / k',
    getExpectedSlope: (p) => (4 * Math.PI * Math.PI) / (p.springK || 20),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const k = p.springK || 20;
      const slope = (4 * Math.PI * Math.PI) / k;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 5, 5);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Theoretical T² = (4π²/k)m`,
        equation: 'T² = (4π²/k)m',
      };
    },
    deducePhysics: (reg, p) => {
      const expK = (4 * Math.PI * Math.PI) / reg.slope;
      const theoK = p.springK || 20;
      const err = calculatePercentageError(expK, theoK);
      return {
        label: 'Deduced Spring Constant (k)',
        formula: 'k = 4π² / Slope',
        unit: 'N/m',
        experimentalValue: parseFloat(expK.toFixed(2)),
        theoreticalValue: parseFloat(theoK.toFixed(2)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
];

// ==========================================
// 13. Geometrical Optics Presets
// ==========================================
export const geometricalOpticsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'snell_law',
    title: "Snell's Law: sin(i) vs sin(r)",
    xKey: 'sinR',
    yKey: 'sinI',
    xLabel: 'sin(r) [Refracted Sine]',
    yLabel: 'sin(i) [Incident Sine]',
    xUnit: '',
    yUnit: '',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Relative Refractive Index n₂ / n₁',
    getExpectedSlope: (p) => (p.n2 || 1.5) / (p.n1 || 1.0),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = (p.n2 || 1.5) / (p.n1 || 1.0);
      const x0 = minX ?? 0;
      const x1 = Math.min(Math.max(maxX ?? 0.8, 0.8), 1.0);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(3)) }, { x: x1, y: parseFloat(Math.min(1.0, slope * x1).toFixed(3)) }],
        label: `Snell's Law sin(i) = ${(slope).toFixed(3)} sin(r)`,
        equation: 'sin(i) = (n₂/n₁) sin(r)',
      };
    },
    deducePhysics: (reg, p) => {
      const theoSlope = (p.n2 || 1.5) / (p.n1 || 1.0);
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Relative Refractive Index (₁n₂)',
        formula: '₁n₂ = sin(i) / sin(r)',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoSlope.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Snell’s Law states that n₁ sin(i) = n₂ sin(r). Plotting sin(i) vs sin(r) yields a straight line through origin with slope n₂/n₁.',
  },
  {
    id: 'i_vs_r_reflection',
    title: 'Law of Reflection: Angle of Reflection (r) vs Angle of Incidence (i)',
    xKey: 'incidentAngle',
    yKey: 'reflectedAngle',
    xLabel: 'Incident Angle i',
    yLabel: 'Reflected Angle r',
    xUnit: '°',
    yUnit: '°',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '1.0 (Angle of Incidence = Angle of Reflection)',
    getExpectedSlope: () => 1.0,
    getTheoreticalCurve: () => ({
      points: [{ x: 0, y: 0 }, { x: 90, y: 90 }],
      label: 'Law of Reflection (i = r)',
      equation: 'r = i',
    }),
  },
  {
    id: 'lens_formula',
    title: 'Lens Formula: 1/v vs 1/u',
    xKey: 'invU',
    yKey: 'invV',
    xLabel: '1/u (Reciprocal Object Distance)',
    yLabel: '1/v (Reciprocal Image Distance)',
    xUnit: 'm⁻¹',
    yUnit: 'm⁻¹',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '-1.0 (Slope) | Intercept = 1/f (Lens Power)',
    getExpectedSlope: () => -1.0,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const f = p.focalLength || 0.2;
      const power = 1 / f;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      return {
        points: [{ x: x0, y: parseFloat((power - x0).toFixed(2)) }, { x: x1, y: parseFloat((power - x1).toFixed(2)) }],
        label: `Lens Formula 1/v = 1/f - 1/u [Power = ${power.toFixed(1)} D]`,
        equation: '1/v + 1/u = 1/f',
      };
    },
  },
];

// ==========================================
// 14. Doppler Effect Presets
// ==========================================
export const dopplerEffectGraphs: ScientificGraphDefinition[] = [
  {
    id: 'f_vs_vs',
    title: 'Observed Frequency (f\') vs Source Velocity (v_s)',
    xKey: 'sourceSpeed',
    yKey: 'observedFreq',
    xLabel: 'Source Speed v_s',
    yLabel: 'Observed Frequency f\'',
    xUnit: 'm/s',
    yUnit: 'Hz',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const f0 = p.sourceFreq || 440;
      const v = p.speedOfSound || 340;
      const pts = [];
      for (let vs = 0; vs <= Math.min(250, v - 20); vs += 5) {
        const fObs = f0 * (v / (v - vs));
        pts.push({ x: vs, y: parseFloat(fObs.toFixed(1)) });
      }
      return { points: pts, label: 'Approaching Source f\' = f₀ [v / (v - v_s)]', equation: 'f\' = f₀ [v / (v - v_s)]' };
    },
    theoryDescription: 'As a sound source moves towards an observer, waves are compressed and observed frequency rises: f\' = f₀ · v / (v - v_s).',
  },
  {
    id: 'f_vs_t_doppler',
    title: 'Frequency vs Time (Observer Position)',
    xKey: 't',
    yKey: 'observedFreqB',
    xLabel: 'Time t',
    yLabel: 'Observed Frequency f\'',
    xUnit: 's',
    yUnit: 'Hz',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const f0 = p.sourceFreq || 440;
      const vs = p.sourceSpeed || 50;
      const v = p.speedOfSound || 340;
      const fAppr = f0 * (v / (v - vs));
      const fRec = f0 * (v / (v + vs));
      return {
        points: [
          { x: 0, y: parseFloat(fAppr.toFixed(1)) },
          { x: 4.9, y: parseFloat(fAppr.toFixed(1)) },
          { x: 5.1, y: parseFloat(fRec.toFixed(1)) },
          { x: 10, y: parseFloat(fRec.toFixed(1)) },
        ],
        label: 'Doppler Frequency Step at Pass-By',
      };
    },
  },
];

// ==========================================
// 15. DC Ohm's Law Presets
// ==========================================
export const dcOhmsLawGraphs: ScientificGraphDefinition[] = [
  {
    id: 'v_vs_i',
    title: "Ohm's Law: Voltage (V) vs Current (I)",
    xKey: 'current',
    yKey: 'voltage',
    xLabel: 'Current I',
    yLabel: 'Voltage V',
    xUnit: 'A',
    yUnit: 'V',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Resistance R (Ω)',
    getExpectedSlope: (p) => p.resistance || 10.0,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const R = p.resistance || 10.0;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 2.0, 2.0);
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const current = x0 + (i / 20) * (x1 - x0);
        pts.push({ x: parseFloat(current.toFixed(3)), y: parseFloat((R * current).toFixed(2)) });
      }
      return { points: pts, label: `Ohmic V = ${R.toFixed(1)} I`, equation: 'V = I · R' };
    },
    deducePhysics: (reg, p) => {
      const theoR = p.resistance || 10.0;
      const err = calculatePercentageError(reg.slope, theoR);
      return {
        label: 'Deduced Resistance (R)',
        formula: 'R = ΔV / ΔI',
        unit: 'Ω',
        experimentalValue: parseFloat(reg.slope.toFixed(2)),
        theoreticalValue: parseFloat(theoR.toFixed(2)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Ohm’s Law V = IR states that for an ohmic conductor at constant temperature, voltage is directly proportional to current. Slope is resistance R.',
  },
  {
    id: 'i_vs_v',
    title: 'Current (I) vs Voltage (V)',
    xKey: 'voltage',
    yKey: 'current',
    xLabel: 'Voltage V',
    yLabel: 'Current I',
    xUnit: 'V',
    yUnit: 'A',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Conductance G = 1/R (S)',
    getExpectedSlope: (p) => 1 / (p.resistance || 10.0),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const R = p.resistance || 10.0;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 20.0, 20.0);
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const v = x0 + (i / 20) * (x1 - x0);
        pts.push({ x: parseFloat(v.toFixed(2)), y: parseFloat((v / R).toFixed(3)) });
      }
      return { points: pts, label: `I = V / ${R.toFixed(1)} Ω`, equation: 'I = V / R' };
    },
  },
  {
    id: 'power_vs_i',
    title: 'Power Dissipation (P) vs Current (I)',
    xKey: 'current',
    yKey: 'power',
    xLabel: 'Current I',
    yLabel: 'Joule Power P',
    xUnit: 'A',
    yUnit: 'W',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const R = p.resistance || 10.0;
      const pts = [];
      for (let I = 0; I <= 2.0; I += 0.1) {
        pts.push({ x: parseFloat(I.toFixed(2)), y: parseFloat((I * I * R).toFixed(2)) });
      }
      return { points: pts, label: 'Joule Heating P = I²R', equation: 'P = I²R' };
    },
  },
];

// ==========================================
// 16. Lenz's Law Presets
// ==========================================
export const lenzsLawGraphs: ScientificGraphDefinition[] = [
  {
    id: 'emf_vs_t_lenz',
    title: 'Induced EMF (ℰ) vs Time (t)',
    xKey: 't',
    yKey: 'inducedEMF',
    xLabel: 'Time t',
    yLabel: 'Induced EMF ℰ',
    xUnit: 's',
    yUnit: 'V',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: () => {
      const pts = [];
      for (let t = -3; t <= 3; t += 0.2) {
        const emf = -t * Math.exp(-t * t);
        pts.push({ x: parseFloat((t + 3).toFixed(2)), y: parseFloat(emf.toFixed(3)) });
      }
      return { points: pts, label: 'Faraday-Lenz EMF ℰ = -dΦ/dt', equation: 'ℰ = -dΦ/dt' };
    },
  },
  {
    id: 'flux_vs_t_lenz',
    title: 'Magnetic Flux (Φ) vs Time (t)',
    xKey: 't',
    yKey: 'flux',
    xLabel: 'Time t',
    yLabel: 'Magnetic Flux Φ',
    xUnit: 's',
    yUnit: 'Wb',
    graphType: 'realtime-series',
    isLinear: false,
    getTheoreticalCurve: () => {
      const pts = [];
      for (let t = -3; t <= 3; t += 0.2) {
        const flux = Math.exp(-t * t);
        pts.push({ x: parseFloat((t + 3).toFixed(2)), y: parseFloat(flux.toFixed(3)) });
      }
      return { points: pts, label: 'Gaussian Flux Profile Φ(t)' };
    },
  },
];

// ==========================================
// 17. Magnetic Field of Straight Wire Presets
// ==========================================
export const magneticWireGraphs: ScientificGraphDefinition[] = [
  {
    id: 'b_vs_inv_r',
    title: 'Biot-Savart Law: Magnetic Field (B) vs 1/Distance (1/r)',
    xKey: 'invR',
    yKey: 'bField',
    xLabel: '1 / Distance (1/r)',
    yLabel: 'Magnetic Field B',
    xUnit: 'm⁻¹',
    yUnit: 'μT',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'μ₀ I / (2π)',
    getExpectedSlope: (p) => 0.2 * (p.current || 5.0),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = 0.2 * (p.current || 5.0);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 50, 50);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Theoretical B = (μ₀I/2π) · (1/r)`,
        equation: 'B = (μ₀ I) / (2π r)',
      };
    },
    deducePhysics: (reg, p) => {
      const expI = reg.slope / 0.2;
      const theoI = p.current || 5.0;
      const err = calculatePercentageError(expI, theoI);
      return {
        label: 'Deduced Current (I)',
        formula: 'I = Slope / (μ₀/2π)',
        unit: 'A',
        experimentalValue: parseFloat(expI.toFixed(2)),
        theoreticalValue: parseFloat(theoI.toFixed(2)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Magnetic flux density near a long straight conductor is B = (μ₀I)/(2πr). Plotting B vs 1/r gives a straight line with slope μ₀I/2π.',
  },
  {
    id: 'b_vs_r',
    title: 'Magnetic Field (B) vs Distance (r)',
    xKey: 'distance',
    yKey: 'bField',
    xLabel: 'Radial Distance r',
    yLabel: 'Magnetic Field B',
    xUnit: 'cm',
    yUnit: 'μT',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const I = p.current || 5.0;
      const pts = [];
      for (let r = 1; r <= 20; r += 0.5) {
        const B = (0.2 * I) / (r / 100);
        pts.push({ x: r, y: parseFloat(B.toFixed(1)) });
      }
      return { points: pts, label: 'Hyperbolic Decay B ∝ 1/r', equation: 'B = (μ₀I)/(2πr)' };
    },
  },
];

// ==========================================
// 18. Parallel Currents Presets
// ==========================================
export const parallelCurrentsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'f_vs_i1i2',
    title: 'Force per Unit Length (F/L) vs Current Product (I₁ · I₂)',
    xKey: 'currentProduct',
    yKey: 'forcePerLength',
    xLabel: 'Current Product I₁ · I₂',
    yLabel: 'Magnetic Force per Length F/L',
    xUnit: 'A²',
    yUnit: 'μN/m',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'μ₀ / (2πd)',
    getExpectedSlope: (p) => (0.2 / (p.distance || 0.05)),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = 0.2 / (p.distance || 0.05);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 50, 50);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: 'Ampère Force Law F/L = (μ₀/2πd) · (I₁I₂)',
        equation: 'F/L = (μ₀ I₁ I₂) / (2π d)',
      };
    },
    deducePhysics: (reg, p) => {
      const theoSlope = 0.2 / (p.distance || 0.05);
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Force Constant',
        formula: 'Slope = μ₀ / (2πd)',
        unit: 'μN/(m·A²)',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoSlope.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Magnetic force per unit length between parallel current wires is F/L = (μ₀ I₁ I₂)/(2πd). Defines the SI unit of electric current (Ampere).',
  },
];

// ==========================================
// 19. Charged Particle in Magnetic Field Presets
// ==========================================
export const chargedParticleGraphs: ScientificGraphDefinition[] = [
  {
    id: 'r_vs_v',
    title: 'Cyclotron Orbit Radius (r) vs Velocity (v)',
    xKey: 'velocity',
    yKey: 'radius',
    xLabel: 'Particle Speed v (× 10⁶ m/s)',
    yLabel: 'Orbit Radius r',
    xUnit: '10⁶ m/s',
    yUnit: 'cm',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'm / (qB)',
    getExpectedSlope: (p) => 5.68 / (p.bField || 1.0),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = 5.68 / (p.bField || 1.0);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 10, 10);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(2)) }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: 'Cyclotron Orbit Radius r = (mv)/(qB)',
        equation: 'r = (m v) / (q B)',
      };
    },
    deducePhysics: (reg, p) => {
      const theoSlope = 5.68 / (p.bField || 1.0);
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Charge-to-Mass Slope (m/qB)',
        formula: 'Slope = m / (qB)',
        unit: 'cm/(10⁶ m/s)',
        experimentalValue: parseFloat(reg.slope.toFixed(2)),
        theoreticalValue: parseFloat(theoSlope.toFixed(2)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'A charged particle entering perpendicularly into a magnetic field undergoes uniform circular motion with radius r = mv / (qB).',
  },
];

// ==========================================
// 20. Solenoid Presets
// ==========================================
export const solenoidGraphs: ScientificGraphDefinition[] = [
  {
    id: 'b_vs_i_solenoid',
    title: 'Magnetic Field (B) vs Current (I)',
    xKey: 'current',
    yKey: 'bField',
    xLabel: 'Current I',
    yLabel: 'Axial Magnetic Field B',
    xUnit: 'A',
    yUnit: 'mT',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'μ₀ n = μ₀ (N / L)',
    getExpectedSlope: (p) => {
      const n = (p.turns || 500) / (p.length || 0.5);
      return (4 * Math.PI * 1e-7 * n * 1000); // in mT/A
    },
    getTheoreticalCurve: ([minX, maxX], p) => {
      const n = (p.turns || 500) / (p.length || 0.5);
      const slope = 4 * Math.PI * 1e-7 * n * 1000;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 5, 5);
      return {
        points: [{ x: x0, y: parseFloat((slope * x0).toFixed(3)) }, { x: x1, y: parseFloat((slope * x1).toFixed(3)) }],
        label: `Solenoid Field B = μ₀ n I [n = ${n.toFixed(0)} turns/m]`,
        equation: 'B = μ₀ n I',
      };
    },
    deducePhysics: (reg, p) => {
      const n = (p.turns || 500) / (p.length || 0.5);
      const theoSlope = 4 * Math.PI * 1e-7 * n * 1000;
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Permeability Constant Product',
        formula: 'Slope = μ₀ · n',
        unit: 'mT/A',
        experimentalValue: parseFloat(reg.slope.toFixed(4)),
        theoreticalValue: parseFloat(theoSlope.toFixed(4)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
];

// ==========================================
// 21. Electromagnetic Induction Presets
// ==========================================
export const inductionGraphs: ScientificGraphDefinition[] = [
  {
    id: 'emf_vs_dflux',
    title: "Faraday's Law: Induced EMF (ℰ) vs Rate of Change of Flux (dΦ/dt)",
    xKey: 'dFluxDt',
    yKey: 'inducedEMF',
    xLabel: 'Rate of Flux Change dΦ/dt',
    yLabel: 'Induced EMF ℰ',
    xUnit: 'Wb/s',
    yUnit: 'V',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '-N (Number of Turns)',
    getExpectedSlope: (p) => -(p.turns || 100),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const N = p.turns || 100;
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 0.1, 0.1);
      return {
        points: [{ x: x0, y: 0 }, { x: x1, y: parseFloat((-N * x1).toFixed(2)) }],
        label: `Faraday's Law ℰ = -N (dΦ/dt) [N = ${N}]`,
        equation: 'ℰ = -N (dΦ/dt)',
      };
    },
  },
];

// ==========================================
// 22. Thermal Physics & Gas Laws Presets
// ==========================================
export const gasLawsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'p_vs_v_pv',
    title: "P-V Diagram (Isotherm): Pressure (P) vs Volume (V)",
    xKey: 'volume',
    yKey: 'pressure',
    xLabel: 'Volume V',
    yLabel: 'Pressure P',
    xUnit: 'L',
    yUnit: 'kPa',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const T = p.temperature || 300;
      const k = (p.moles || 1.0) * 8.314 * T;
      const pts = [];
      for (let v = 1; v <= 20; v += 0.5) {
        pts.push({ x: v, y: parseFloat((k / v).toFixed(1)) });
      }
      return { points: pts, label: `Isotherm PV = nRT [T = ${T} K]`, equation: 'P = (nRT) / V' };
    },
    theoryDescription: 'At constant temperature, Boyle’s law states that PV = constant. The isothermal P-V graph is a rectangular hyperbola.',
  },
  {
    id: 'boyle_law',
    title: "Boyle's Law: Pressure (P) vs Reciprocal Volume (1/V)",
    xKey: 'invVolume',
    yKey: 'pressure',
    xLabel: '1 / Volume (1/V)',
    yLabel: 'Pressure P',
    xUnit: 'L⁻¹',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nRT (Isothermal Product)',
    getExpectedSlope: (p) => (p.moles || 1.0) * 8.314 * (p.temperature || 300),
    getTheoreticalCurve: ([minX, maxX], p) => {
      const slope = (p.moles || 1.0) * 8.314 * (p.temperature || 300);
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 1.0, 1.0);
      return {
        points: [{ x: x0, y: 0 }, { x: x1, y: parseFloat((slope * x1).toFixed(1)) }],
        label: `Boyle's Law P = (nRT) · (1/V)`,
        equation: 'P = nRT (1/V)',
      };
    },
    deducePhysics: (reg, p) => {
      const theoSlope = (p.moles || 1.0) * 8.314 * (p.temperature || 300);
      const err = calculatePercentageError(reg.slope, theoSlope);
      return {
        label: 'Deduced nRT Constant',
        formula: 'Slope = nRT',
        unit: 'kPa·L',
        experimentalValue: parseFloat(reg.slope.toFixed(1)),
        theoreticalValue: parseFloat(theoSlope.toFixed(1)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'charles_law',
    title: "Charles' Law: Volume (V) vs Temperature (T)",
    xKey: 'temperature',
    yKey: 'volume',
    xLabel: 'Temperature T',
    yLabel: 'Volume V',
    xUnit: 'K',
    yUnit: 'L',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nR / P (Isobaric Expansion Constant)',
    getExpectedSlope: (p) => ((p.moles || 1.0) * 8.314) / (p.pressure || 101.3),
    getTheoreticalCurve: ([, maxX], p) => {
      const slope = ((p.moles || 1.0) * 8.314) / (p.pressure || 101.3);
      const x1 = Math.max(maxX ?? 500, 500);
      return {
        points: [{ x: 0, y: 0 }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Charles' Law V = (nR/P) T`,
        equation: 'V ∝ T',
      };
    },
    theoryDescription: 'At constant pressure, gas volume is directly proportional to absolute temperature in Kelvin: V ∝ T. Extrapolates to absolute zero (0 K = -273.15 °C).',
  },
  {
    id: 'gay_lussac_law',
    title: "Pressure Law: Pressure (P) vs Temperature (T)",
    xKey: 'temperature',
    yKey: 'pressure',
    xLabel: 'Temperature T',
    yLabel: 'Pressure P',
    xUnit: 'K',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nR / V (Isochoric Pressure Constant)',
    getExpectedSlope: (p) => ((p.moles || 1.0) * 8.314) / (p.volume || 10.0),
    getTheoreticalCurve: ([, maxX], p) => {
      const slope = ((p.moles || 1.0) * 8.314) / (p.volume || 10.0);
      const x1 = Math.max(maxX ?? 500, 500);
      return {
        points: [{ x: 0, y: 0 }, { x: x1, y: parseFloat((slope * x1).toFixed(2)) }],
        label: `Pressure Law P = (nR/V) T`,
        equation: 'P ∝ T',
      };
    },
  },
];

// ==========================================
// 23. Modern Physics & Photoelectric Effect Presets
// ==========================================
export const photoelectricGraphs: ScientificGraphDefinition[] = [
  {
    id: 'kemax_vs_freq',
    title: 'Max Kinetic Energy (K_max) vs Frequency (f)',
    xKey: 'frequency',
    yKey: 'keMax',
    xLabel: 'Photon Frequency f (× 10¹⁴ Hz)',
    yLabel: 'Max Kinetic Energy K_max',
    xUnit: '10¹⁴ Hz',
    yUnit: 'eV',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: "Planck's Constant h = 0.4136 eV / (10¹⁴ Hz)",
    expectedInterceptFormula: '-Φ (Negative Work Function)',
    getExpectedSlope: () => 0.41357, // h in eV / (10^14 Hz)
    getExpectedIntercept: (p) => -(p.workFunction || 2.2),
    getTheoreticalCurve: (_, p) => {
      const h = 0.41357;
      const phi = p.workFunction || 2.2;
      const f0 = phi / h;
      const pts = [];
      for (let f = 0; f <= 15; f += 0.5) {
        const k = f >= f0 ? h * f - phi : 0;
        pts.push({ x: parseFloat(f.toFixed(1)), y: parseFloat(k.toFixed(2)) });
      }
      return {
        points: pts,
        label: `Einstein's Photoelectric Equation K_max = hf - Φ [Φ = ${phi.toFixed(2)} eV]`,
        equation: 'K_max = hf - Φ',
      };
    },
    deducePhysics: (reg, p) => {
      const expH = reg.slope;
      const theoH = 0.41357;
      const errH = calculatePercentageError(expH, theoH);
      const expPhi = -reg.intercept;
      const theoPhi = p.workFunction || 2.2;
      return {
        label: "Planck's Constant (h)",
        formula: 'h = ΔK_max / Δf',
        unit: '× 10⁻¹⁵ eV·s',
        experimentalValue: parseFloat((expH * 10).toFixed(3)),
        theoreticalValue: 4.136,
        percentageError: parseFloat(errH.toFixed(2)),
        description: `Deduced Work Function Φ = ${expPhi.toFixed(2)} eV (Theory: ${theoPhi.toFixed(2)} eV)`,
      };
    },
    theoryDescription: 'Einstein’s Photoelectric Equation: K_max = hf - Φ. The slope is Planck’s constant h, the x-intercept is threshold frequency f₀ = Φ/h, and y-intercept is -Φ.',
  },
  {
    id: 'vs_vs_freq',
    title: 'Stopping Potential (V_s) vs Frequency (f)',
    xKey: 'frequency',
    yKey: 'stoppingVoltage',
    xLabel: 'Photon Frequency f (× 10¹⁴ Hz)',
    yLabel: 'Stopping Potential V_s',
    xUnit: '10¹⁴ Hz',
    yUnit: 'V',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'h / e = 0.4136 V / (10¹⁴ Hz)',
    expectedInterceptFormula: '-Φ / e',
    getExpectedSlope: () => 0.41357,
    getExpectedIntercept: (p) => -(p.workFunction || 2.2),
    getTheoreticalCurve: (_, p) => {
      const h_e = 0.41357;
      const phi = p.workFunction || 2.2;
      const f0 = phi / h_e;
      const pts = [];
      for (let f = 0; f <= 15; f += 0.5) {
        const vs = f >= f0 ? h_e * f - phi : 0;
        pts.push({ x: parseFloat(f.toFixed(1)), y: parseFloat(vs.toFixed(2)) });
      }
      return { points: pts, label: `Stopping Potential V_s = (h/e)f - (Φ/e)`, equation: 'e V_s = hf - Φ' };
    },
    deducePhysics: (reg) => {
      const expHe = reg.slope;
      const theoHe = 0.41357;
      const err = calculatePercentageError(expHe, theoHe);
      return {
        label: 'Slope (h/e)',
        formula: 'h/e = ΔV_s / Δf',
        unit: 'V/(10¹⁴ Hz)',
        experimentalValue: parseFloat(expHe.toFixed(4)),
        theoreticalValue: parseFloat(theoHe.toFixed(4)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'Stopping potential is related to max kinetic energy by e·V_s = K_max = hf - Φ → V_s = (h/e)f - Φ/e.',
  },
  {
    id: 'current_vs_intensity',
    title: 'Saturation Photocurrent (I) vs Light Intensity',
    xKey: 'intensity',
    yKey: 'photocurrent',
    xLabel: 'Light Intensity',
    yLabel: 'Photocurrent I',
    xUnit: '%',
    yUnit: 'μA',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Emission Rate Multiplier',
    getExpectedSlope: () => 0.5,
    getTheoreticalCurve: ([minX, maxX]) => {
      const x0 = minX ?? 0;
      const x1 = Math.max(maxX ?? 100, 100);
      return {
        points: [{ x: x0, y: parseFloat((0.5 * x0).toFixed(1)) }, { x: x1, y: parseFloat((0.5 * x1).toFixed(1)) }],
        label: 'Photocurrent ∝ Intensity (Above Threshold)',
        equation: 'I ∝ Intensity',
      };
    },
    theoryDescription: 'Number of emitted photoelectrons per second (and hence saturation photocurrent) is directly proportional to the incident light intensity.',
  },
  {
    id: 'current_vs_voltage',
    title: 'Photocurrent (I) vs Collector Voltage (V)',
    xKey: 'voltage',
    yKey: 'photocurrent',
    xLabel: 'Applied Voltage V',
    yLabel: 'Photocurrent I',
    xUnit: 'V',
    yUnit: 'μA',
    graphType: 'line',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const I_sat = (p.intensity || 50) * 0.5;
      const h_e = 0.41357;
      const phi = p.workFunction || 2.2;
      const f = (3e8 / ((p.wavelength || 400) * 1e-9)) / 1e14;
      const Vs = Math.max(0, h_e * f - phi);
      const pts = [];
      for (let v = -4; v <= 6; v += 0.25) {
        let current = 0;
        if (v < -Vs) {
          current = 0;
        } else if (v < 0) {
          current = I_sat * Math.pow((v + Vs) / (Vs || 0.1), 1.5);
        } else {
          current = I_sat * (1 - 0.08 * Math.exp(-v * 1.5));
        }
        pts.push({ x: parseFloat(v.toFixed(2)), y: parseFloat(Math.min(I_sat, Math.max(0, current)).toFixed(2)) });
      }
      return { points: pts, label: `I-V Characteristic [Stopping Potential -V_s = -${Vs.toFixed(2)} V]`, equation: 'I(V)' };
    },
    theoryDescription: 'Photocurrent drops to zero at the stopping potential V = -V_s and saturates at positive collector voltages.',
  },
];
