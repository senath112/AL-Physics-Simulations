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
    getExpectedSlope: (p) => p.mass || 1.0,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const m = p.mass || 1.0;
      const x = [minX, maxX];
      const y = [minX * m, maxX * m];
      return { points: [{ x: x[0], y: y[0] }, { x: x[1], y: y[1] }], label: `Theoretical F = ${m.toFixed(1)}a` };
    },
    deducePhysics: (reg, p) => {
      const theoMass = p.mass || 1.0;
      const err = calculatePercentageError(reg.slope, theoMass);
      return {
        label: 'Experimental Mass (m)',
        formula: 'm = ΔF / Δa',
        unit: 'kg',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoMass.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
    theoryDescription: 'According to Newton’s Second Law F = ma, the slope represents the inertial mass m.',
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
    getExpectedSlope: (p) => (p.mass ? 1 / p.mass : 1.0),
    deducePhysics: (reg, p) => {
      const expMass = reg.slope !== 0 ? 1 / reg.slope : 0;
      const theoMass = p.mass || 1.0;
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
  },
  {
    id: 'fric_vs_normal',
    title: 'Friction Force (f) vs Normal Force (R)',
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
    deducePhysics: (reg, p) => {
      const theoMu = p.muKinetic ?? 0.2;
      const err = calculatePercentageError(reg.slope, theoMu);
      return {
        label: 'Friction Coefficient (μ_k)',
        formula: 'μ_k = f / R',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoMu.toFixed(3)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
];

// ==========================================
// 2. Inclined Plane Presets
// ==========================================
export const inclinedPlaneGraphs: ScientificGraphDefinition[] = [
  {
    id: 'theta_vs_a',
    title: 'Acceleration (a) vs Incline Angle (θ)',
    xKey: 'angle',
    yKey: 'acceleration',
    xLabel: 'Angle θ',
    yLabel: 'Acceleration a',
    xUnit: 'deg',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const g = p.gravity || 9.8;
      const mu = p.frictionCoeff || 0.2;
      const pts = [];
      for (let th = minX; th <= maxX; th += (maxX - minX) / 30) {
        const rad = (th * Math.PI) / 180;
        const a = Math.max(0, g * (Math.sin(rad) - mu * Math.cos(rad)));
        pts.push({ x: th, y: a });
      }
      return { points: pts, label: 'Theory: a = g(sinθ - μ cosθ)' };
    },
  },
  {
    id: 'fric_vs_normal_incline',
    title: 'Friction Force vs Normal Reaction',
    xKey: 'normalForce',
    yKey: 'frictionForce',
    xLabel: 'Normal Force R = mg cos(θ)',
    yLabel: 'Friction Force f',
    xUnit: 'N',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Friction Coefficient μ',
    getExpectedSlope: (p) => p.frictionCoeff || 0.2,
  },
  {
    id: 'fnet_vs_disp',
    title: 'Net Force (F_net) vs Displacement (s)',
    xKey: 'displacement',
    yKey: 'netForce',
    xLabel: 'Displacement s',
    yLabel: 'Net Accelerating Force F_net',
    xUnit: 'm',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: false,
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
    getTheoreticalCurve: ([minX, maxX], p) => {
      const v0 = p.velocity || 20;
      const th = ((p.angle || 45) * Math.PI) / 180;
      const g = p.gravity || 9.8;
      const h0 = p.height || 0;
      const pts = [];
      const step = Math.max(0.1, (maxX - minX) / 40);
      for (let x = minX; x <= maxX; x += step) {
        const y = h0 + x * Math.tan(th) - (g * x * x) / (2 * v0 * v0 * Math.cos(th) * Math.cos(th));
        if (y >= 0) pts.push({ x, y });
      }
      return { points: pts, label: 'Parabolic Trajectory Theory' };
    },
  },
  {
    id: 'range_vs_angle',
    title: 'Range (R) vs Launch Angle (θ)',
    xKey: 'angle',
    yKey: 'range',
    xLabel: 'Launch Angle θ',
    yLabel: 'Total Range R',
    xUnit: 'deg',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: (_, p) => {
      const v0 = p.velocity || 20;
      const g = p.gravity || 9.8;
      const pts = [];
      for (let deg = 0; deg <= 90; deg += 2) {
        const rad = (deg * Math.PI) / 180;
        const R = (v0 * v0 * Math.sin(2 * rad)) / g;
        pts.push({ x: deg, y: R });
      }
      return { points: pts, label: 'R = (v₀² sin 2θ) / g' };
    },
  },
  {
    id: 'hmax_vs_angle',
    title: 'Maximum Height (H_max) vs Launch Angle (θ)',
    xKey: 'angle',
    yKey: 'maxHeight',
    xLabel: 'Launch Angle θ',
    yLabel: 'Peak Height H_max',
    xUnit: 'deg',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: false,
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
    expectedSlopeFormula: 'v_x = v₀ cos(θ)',
    getExpectedSlope: (p) => (p.velocity || 20) * Math.cos(((p.angle || 45) * Math.PI) / 180),
  },
];

// ==========================================
// 4. Connected Particles Presets
// ==========================================
export const connectedParticlesGraphs: ScientificGraphDefinition[] = [
  {
    id: 'v_vs_t',
    title: 'Velocity (v) vs Time (t)',
    xKey: 'time',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'System Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: true,
    expectedSlopeFormula: 'System Acceleration a = (m₂ - μm₁)g / (m₁ + m₂)',
    deducePhysics: (reg) => ({
      label: 'Experimental Acceleration',
      formula: 'a = dv / dt',
      unit: 'm/s²',
      experimentalValue: parseFloat(reg.slope.toFixed(3)),
    }),
  },
  {
    id: 'a_vs_m2',
    title: 'Acceleration (a) vs Hanging Mass (m₂)',
    xKey: 'm2',
    yKey: 'acceleration',
    xLabel: 'Hanging Mass m₂',
    yLabel: 'Acceleration a',
    xUnit: 'kg',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'tension_vs_a',
    title: 'Tension (T) vs Acceleration (a)',
    xKey: 'acceleration',
    yKey: 'tension',
    xLabel: 'Acceleration a',
    yLabel: 'String Tension T',
    xUnit: 'm/s²',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
  },
];

// ==========================================
// 5. Pulley Systems / Atwood Machine
// ==========================================
export const pulleySystemsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'a_vs_delta_m',
    title: 'Acceleration (a) vs Mass Difference (m₂ - m₁)',
    xKey: 'deltaM',
    yKey: 'acceleration',
    xLabel: 'Mass Difference (m₂ - m₁)',
    yLabel: 'Acceleration a',
    xUnit: 'kg',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'g / (m₁ + m₂)',
    transformPoint: (row) => {
      const m1 = Number(row.mass1 || row.m1 || 2);
      const m2 = Number(row.mass2 || row.m2 || 3);
      const a = Number(row.acceleration || 0);
      return { x: m2 - m1, y: a };
    },
    deducePhysics: (reg, p) => {
      const mTotal = (p.mass1 || 2) + (p.mass2 || 3);
      const expG = reg.slope * mTotal;
      const err = calculatePercentageError(expG, 9.8);
      return {
        label: 'Deduced Gravity g',
        formula: 'g = slope × (m₁ + m₂)',
        unit: 'm/s²',
        experimentalValue: parseFloat(expG.toFixed(2)),
        theoreticalValue: 9.8,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'tension_vs_m2',
    title: 'Tension (T) vs Mass 2 (m₂)',
    xKey: 'mass2',
    yKey: 'tension',
    xLabel: 'Mass 2',
    yLabel: 'String Tension T',
    xUnit: 'kg',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'v_vs_t_pulley',
    title: 'Velocity (v) vs Time (t)',
    xKey: 'time',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: true,
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
    xLabel: 'Initial Total Momentum p_initial',
    yLabel: 'Final Total Momentum p_final',
    xUnit: 'kg·m/s',
    yUnit: 'kg·m/s',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Conservation Slope = 1.0',
    getExpectedSlope: () => 1.0,
    deducePhysics: (reg) => {
      const err = calculatePercentageError(reg.slope, 1.0);
      return {
        label: 'Conservation Factor (p_f / p_i)',
        formula: 'Δp_f / Δp_i',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(4)),
        theoreticalValue: 1.0,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'p_vs_t',
    title: 'Momentum vs Time (Before, Collision, After)',
    xKey: 'time',
    yKey: 'totalMomentum',
    xLabel: 'Time t',
    yLabel: 'Total Momentum p',
    xUnit: 's',
    yUnit: 'kg·m/s',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'ke_loss_vs_u1',
    title: 'Kinetic Energy Loss vs Relative Velocity',
    xKey: 'vel1Initial',
    yKey: 'energyLoss',
    xLabel: 'Initial Velocity u₁',
    yLabel: 'Kinetic Energy Dissipation ΔE_k',
    xUnit: 'm/s',
    yUnit: 'J',
    graphType: 'scatter',
    isLinear: false,
  },
];

// ==========================================
// 7. Circular Motion Presets
// ==========================================
export const circularMotionGraphs: ScientificGraphDefinition[] = [
  {
    id: 'fc_vs_v2',
    title: 'Centripetal Force (F_c) vs Speed Squared (v²)',
    xKey: 'speed',
    yKey: 'centripetalForce',
    xLabel: 'Speed Squared v²',
    yLabel: 'Centripetal Force F_c',
    xUnit: 'm²/s²',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'm / r',
    transformPoint: (r) => {
      const v = Number(r.speed || r.velocity || 2);
      const fc = Number(r.centripetalForce || 0);
      return { x: v * v, y: fc };
    },
    getExpectedSlope: (p) => (p.mass && p.radius ? p.mass / p.radius : 1.0),
    deducePhysics: (reg, p) => {
      const theoRatio = (p.mass || 1) / (p.radius || 1);
      const err = calculatePercentageError(reg.slope, theoRatio);
      return {
        label: 'Slope (m / r)',
        formula: 'F_c / v²',
        unit: 'kg/m',
        experimentalValue: parseFloat(reg.slope.toFixed(3)),
        theoreticalValue: parseFloat(theoRatio.toFixed(3)),
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
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'fc_vs_m',
    title: 'Centripetal Force (F_c) vs Mass (m)',
    xKey: 'mass',
    yKey: 'centripetalForce',
    xLabel: 'Mass m',
    yLabel: 'Centripetal Force F_c',
    xUnit: 'kg',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'v² / r',
    getExpectedSlope: (p) => ((p.speed || 2) * (p.speed || 2)) / (p.radius || 1),
  },
];

// ==========================================
// 8. Work, Energy & Power Presets
// ==========================================
export const workEnergyGraphs: ScientificGraphDefinition[] = [
  {
    id: 'energy_vs_t',
    title: 'Total Mechanical Energy vs Time (Conservation)',
    xKey: 'time',
    yKey: 'totalEnergy',
    xLabel: 'Time t',
    yLabel: 'Total Mechanical Energy E',
    xUnit: 's',
    yUnit: 'J',
    graphType: 'realtime-series',
    isLinear: false,
    theoryDescription: 'In conservative systems, total energy E = E_k + E_p remains constant over time.',
  },
  {
    id: 'v2_vs_h',
    title: 'Velocity Squared (v²) vs Height (h)',
    xKey: 'height',
    yKey: 'velocitySq',
    xLabel: 'Height h',
    yLabel: 'Velocity Squared v²',
    xUnit: 'm',
    yUnit: 'm²/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '2g',
    getExpectedSlope: (p) => 2 * (p.gravity || 9.8),
    deducePhysics: (reg) => {
      const expG = reg.slope / 2;
      const err = calculatePercentageError(expG, 9.8);
      return {
        label: 'Deduced Gravity g',
        formula: 'g = slope / 2',
        unit: 'm/s²',
        experimentalValue: parseFloat(expG.toFixed(2)),
        theoreticalValue: 9.8,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'ke_pe_vs_x',
    title: 'Kinetic & Potential Energy vs Position',
    xKey: 'height',
    yKey: 'potentialEnergy',
    xLabel: 'Height h',
    yLabel: 'Potential Energy E_p',
    xUnit: 'm',
    yUnit: 'J',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'mg (Weight)',
    getExpectedSlope: (p) => (p.mass || 1) * (p.gravity || 9.8),
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
    xLabel: 'Total System Mass M',
    yLabel: 'Centre of Mass X_cm',
    xUnit: 'kg',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'xcm_vs_t',
    title: 'Centre of Mass Position vs Time',
    xKey: 'time',
    yKey: 'xCM',
    xLabel: 'Time t',
    yLabel: 'Center of Mass X_cm',
    xUnit: 's',
    yUnit: 'm',
    graphType: 'realtime-series',
    isLinear: true,
  },
];

// ==========================================
// 10. Gravitational Fields & Orbits Presets
// ==========================================
export const gravityOrbitsGraphs: ScientificGraphDefinition[] = [
  {
    id: 't2_vs_r3',
    title: "Kepler's Third Law: Period Squared (T²) vs Radius Cubed (r³)",
    xKey: 'radius',
    yKey: 'period',
    xLabel: 'Semi-Major Axis Cubed r³',
    yLabel: 'Orbital Period Squared T²',
    xUnit: 'AU³',
    yUnit: 'yr²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '1.0 (Solar Units)',
    transformPoint: (r) => {
      const rad = Number(r.radius || 1);
      const T = Number(r.period || 1);
      return { x: Math.pow(rad, 3), y: Math.pow(T, 2) };
    },
    getExpectedSlope: () => 1.0,
    deducePhysics: (reg) => {
      const err = calculatePercentageError(reg.slope, 1.0);
      return {
        label: "Kepler Constant (T²/r³)",
        formula: 'T² / r³',
        unit: 'yr²/AU³',
        experimentalValue: parseFloat(reg.slope.toFixed(4)),
        theoreticalValue: 1.0,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'vorb_vs_r',
    title: 'Orbital Velocity (v) vs Orbital Radius (r)',
    xKey: 'radius',
    yKey: 'velocity',
    xLabel: 'Radius r',
    yLabel: 'Orbital Velocity v',
    xUnit: 'AU',
    yUnit: 'km/s',
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: ([minX, maxX]) => {
      const pts = [];
      const step = (maxX - minX) / 30 || 0.1;
      for (let r = Math.max(0.1, minX); r <= maxX; r += step) {
        pts.push({ x: r, y: 29.78 / Math.sqrt(r) });
      }
      return { points: pts, label: 'Theory: v = √(GM/r)' };
    },
  },
  {
    id: 'fg_vs_r',
    title: 'Gravitational Force (F_g) vs Distance (r)',
    xKey: 'radius',
    yKey: 'gravitationalForce',
    xLabel: 'Distance r',
    yLabel: 'Gravitational Force F_g',
    xUnit: 'AU',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: false,
  },
];

// ==========================================
// 11. Hydrostatics & Buoyancy Presets
// ==========================================
export const hydrostaticsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'p_vs_h',
    title: 'Pressure (P) vs Depth (h)',
    xKey: 'probeDepth',
    yKey: 'gaugePressure',
    xLabel: 'Depth h',
    yLabel: 'Hydrostatic Gauge Pressure P',
    xUnit: 'm',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'ρg / 1000',
    getExpectedSlope: (p) => ((p.fluidDensity || 1000) * 9.8) / 1000,
    deducePhysics: (reg) => {
      const expRho = (reg.slope * 1000) / 9.8;
      return {
        label: 'Deduced Fluid Density (ρ)',
        formula: 'ρ = slope / g',
        unit: 'kg/m³',
        experimentalValue: parseFloat(expRho.toFixed(1)),
        theoreticalValue: 1000,
        percentageError: parseFloat(calculatePercentageError(expRho, 1000).toFixed(2)),
      };
    },
  },
  {
    id: 'fb_vs_vdisp',
    title: 'Archimedes Law: Buoyant Force (F_b) vs Displaced Volume (V_disp)',
    xKey: 'displacedVolume',
    yKey: 'buoyantForce',
    xLabel: 'Displaced Volume V',
    yLabel: 'Buoyant Force F_b',
    xUnit: 'm³',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'ρg',
    getExpectedSlope: (p) => (p.fluidDensity || 1000) * 9.8,
  },
  {
    id: 'wapp_vs_submerged',
    title: 'Apparent Weight (W_app) vs Submerged Volume',
    xKey: 'displacedVolume',
    yKey: 'apparentWeight',
    xLabel: 'Submerged Volume',
    yLabel: 'Apparent Weight W_app = W - F_b',
    xUnit: 'm³',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
  },
];

// ==========================================
// 12. Simple Harmonic Motion Presets
// ==========================================
export const shmGraphs: ScientificGraphDefinition[] = [
  {
    id: 'x_vs_t_shm',
    title: 'Displacement (x) vs Time (t)',
    xKey: 'time',
    yKey: 'displacement',
    xLabel: 'Time t',
    yLabel: 'Displacement x',
    xUnit: 's',
    yUnit: 'm',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'v_vs_t_shm',
    title: 'Velocity (v) vs Time (t)',
    xKey: 'time',
    yKey: 'velocity',
    xLabel: 'Time t',
    yLabel: 'Velocity v',
    xUnit: 's',
    yUnit: 'm/s',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'a_vs_x_shm',
    title: 'Acceleration (a) vs Displacement (x)',
    xKey: 'displacement',
    yKey: 'acceleration',
    xLabel: 'Displacement x',
    yLabel: 'Acceleration a',
    xUnit: 'm',
    yUnit: 'm/s²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '-ω²',
    deducePhysics: (reg) => {
      const omegaSq = Math.abs(reg.slope);
      const omega = Math.sqrt(omegaSq);
      return {
        label: 'Angular Frequency (ω)',
        formula: 'ω = √(-slope)',
        unit: 'rad/s',
        experimentalValue: parseFloat(omega.toFixed(3)),
      };
    },
  },
  {
    id: 't2_vs_l_pendulum',
    title: 'Pendulum: Period Squared (T²) vs Length (L)',
    xKey: 'length',
    yKey: 'periodSq',
    xLabel: 'Pendulum Length L',
    yLabel: 'Period Squared T²',
    xUnit: 'm',
    yUnit: 's²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '4π² / g',
    getExpectedSlope: (p) => (4 * Math.PI * Math.PI) / (p.gravity || 9.8),
    deducePhysics: (reg) => {
      const expG = (4 * Math.PI * Math.PI) / (reg.slope || 1);
      const err = calculatePercentageError(expG, 9.8);
      return {
        label: 'Deduced Gravity g',
        formula: 'g = 4π² / slope',
        unit: 'm/s²',
        experimentalValue: parseFloat(expG.toFixed(2)),
        theoreticalValue: 9.8,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 't2_vs_m_spring',
    title: 'Spring-Mass: Period Squared (T²) vs Mass (m)',
    xKey: 'mass',
    yKey: 'periodSq',
    xLabel: 'Mass m',
    yLabel: 'Period Squared T²',
    xUnit: 'kg',
    yUnit: 's²',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '4π² / k',
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
    xLabel: 'sin(r) [Refracted Angle]',
    yLabel: 'sin(i) [Incident Angle]',
    xUnit: '',
    yUnit: '',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Relative Refractive Index n₂ / n₁',
    getExpectedSlope: (p) => (p.n2 || 1.5) / (p.n1 || 1.0),
    deducePhysics: (reg, p) => {
      const theoRatio = (p.n2 || 1.5) / (p.n1 || 1.0);
      const err = calculatePercentageError(reg.slope, theoRatio);
      return {
        label: 'Refractive Index Ratio (n₂/n₁)',
        formula: 'n₂/n₁ = sin(i) / sin(r)',
        unit: '',
        experimentalValue: parseFloat(reg.slope.toFixed(4)),
        theoreticalValue: parseFloat(theoRatio.toFixed(4)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'i_vs_r_reflection',
    title: 'Law of Reflection: Angle of Reflection (r) vs Angle of Incidence (i)',
    xKey: 'incidentAngle',
    yKey: 'incidentAngle',
    xLabel: 'Incident Angle i',
    yLabel: 'Reflection Angle r',
    xUnit: 'deg',
    yUnit: 'deg',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '1.0 (r = i)',
    getExpectedSlope: () => 1.0,
  },
  {
    id: 'lens_formula',
    title: 'Lens Formula: 1/v vs 1/u',
    xKey: 'invU',
    yKey: 'invV',
    xLabel: '1 / u (1/Object Distance)',
    yLabel: '1 / v (1/Image Distance)',
    xUnit: '1/m',
    yUnit: '1/m',
    graphType: 'scatter',
    isLinear: true,
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
    yKey: 'observedFreqRight',
    xLabel: 'Source Speed v_s (Approaching)',
    yLabel: "Observed Frequency f'",
    xUnit: 'm/s',
    yUnit: 'Hz',
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const f0 = p.sourceFreq || 440;
      const v = p.speedOfSound || 340;
      const pts = [];
      const step = (maxX - minX) / 40 || 5;
      for (let vs = minX; vs <= Math.min(maxX, v - 5); vs += step) {
        pts.push({ x: vs, y: f0 * (v / (v - vs)) });
      }
      return { points: pts, label: "Theory: f' = f₀ · v/(v - vₛ)" };
    },
  },
  {
    id: 'f_vs_t_doppler',
    title: 'Frequency vs Time (Observer Position)',
    xKey: 'time',
    yKey: 'observedFreqRight',
    xLabel: 'Time t',
    yLabel: 'Observed Frequency f',
    xUnit: 's',
    yUnit: 'Hz',
    graphType: 'realtime-series',
    isLinear: false,
  },
];

// ==========================================
// 15. DC Circuits & Ohm's Law Presets
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
    getExpectedSlope: (p) => p.resistance || 10,
    deducePhysics: (reg, p) => {
      const theoR = p.resistance || 10;
      const err = calculatePercentageError(reg.slope, theoR);
      return {
        label: 'Circuit Resistance (R)',
        formula: 'R = ΔV / ΔI',
        unit: 'Ω',
        experimentalValue: parseFloat(reg.slope.toFixed(2)),
        theoreticalValue: parseFloat(theoR.toFixed(2)),
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
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
    expectedSlopeFormula: 'Conductance G = 1/R',
    getExpectedSlope: (p) => 1 / (p.resistance || 10),
  },
  {
    id: 'power_vs_i',
    title: 'Power Dissipation (P) vs Current (I)',
    xKey: 'current',
    yKey: 'power',
    xLabel: 'Current I',
    yLabel: 'Power P = I²R',
    xUnit: 'A',
    yUnit: 'W',
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'power_vs_v',
    title: 'Power Dissipation (P) vs Voltage (V)',
    xKey: 'voltage',
    yKey: 'power',
    xLabel: 'Voltage V',
    yLabel: 'Power P = V²/R',
    xUnit: 'V',
    yUnit: 'W',
    graphType: 'scatter',
    isLinear: false,
  },
];

// ==========================================
// 16. Lenz's Law & Faraday Induction Presets
// ==========================================
export const lenzsLawGraphs: ScientificGraphDefinition[] = [
  {
    id: 'emf_vs_t_lenz',
    title: 'Induced EMF (ℰ) vs Time (t)',
    xKey: 'time',
    yKey: 'emf',
    xLabel: 'Time t',
    yLabel: 'Induced EMF ℰ',
    xUnit: 's',
    yUnit: 'V',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'flux_vs_t_lenz',
    title: 'Magnetic Flux (Φ) vs Time (t)',
    xKey: 'time',
    yKey: 'flux',
    xLabel: 'Time t',
    yLabel: 'Magnetic Flux Φ',
    xUnit: 's',
    yUnit: 'Wb',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'braking_vs_v',
    title: 'Eddy Current Braking Force vs Magnet Velocity',
    xKey: 'velocity',
    yKey: 'dampingForce',
    xLabel: 'Velocity v',
    yLabel: 'Braking Force F_brake',
    xUnit: 'm/s',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'Damping Coefficient b',
  },
];

// ==========================================
// 17. Magnetic Field of Wire Presets
// ==========================================
export const magneticWireGraphs: ScientificGraphDefinition[] = [
  {
    id: 'b_vs_inv_r',
    title: 'Biot-Savart Law: Magnetic Field (B) vs 1/Distance (1/r)',
    xKey: 'probeDistance',
    yKey: 'magneticField',
    xLabel: '1 / Distance (1/r)',
    yLabel: 'Magnetic Field B',
    xUnit: '1/m',
    yUnit: 'μT',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '(μ₀ I) / (2π)',
    transformPoint: (r) => {
      const dMm = Number(r.probeDistance || r.distance || 20);
      const dMeters = dMm / 1000;
      const bMicro = Number(r.magneticField || 0);
      return { x: 1 / dMeters, y: bMicro };
    },
    deducePhysics: (reg, p) => {
      const I = p.current || 5;
      const expMu0 = (reg.slope * 1e-6 * 2 * Math.PI) / I;
      return {
        label: 'Permeability of Free Space (μ₀)',
        formula: 'μ₀ = 2π·slope / I',
        unit: 'T·m/A',
        experimentalValue: parseFloat(expMu0.toExponential(3)),
        theoreticalValue: parseFloat((4 * Math.PI * 1e-7).toExponential(3)),
      };
    },
  },
  {
    id: 'b_vs_r',
    title: 'Magnetic Field (B) vs Distance (r)',
    xKey: 'probeDistance',
    yKey: 'magneticField',
    xLabel: 'Distance r',
    yLabel: 'Magnetic Field B',
    xUnit: 'mm',
    yUnit: 'μT',
    graphType: 'scatter',
    isLinear: false,
  },
  {
    id: 'b_vs_i_wire',
    title: 'Magnetic Field (B) vs Current (I)',
    xKey: 'current',
    yKey: 'magneticField',
    xLabel: 'Current I',
    yLabel: 'Magnetic Field B',
    xUnit: 'A',
    yUnit: 'μT',
    graphType: 'scatter',
    isLinear: true,
  },
];

// ==========================================
// 18. Parallel Currents Presets
// ==========================================
export const parallelCurrentsGraphs: ScientificGraphDefinition[] = [
  {
    id: 'f_vs_i1i2',
    title: 'Force per Unit Length (F/L) vs Current Product (I₁ · I₂)',
    xKey: 'i1',
    yKey: 'forcePerLength',
    xLabel: 'Current Product I₁ · I₂',
    yLabel: 'Force per Length F/L',
    xUnit: 'A²',
    yUnit: 'μN/m',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: '(μ₀) / (2π d)',
    transformPoint: (r) => {
      const i1 = Number(r.i1 || 5);
      const i2 = Number(r.i2 || 5);
      const f = Number(r.forcePerLength || 0);
      return { x: i1 * i2, y: f };
    },
  },
  {
    id: 'f_vs_d',
    title: 'Force (F/L) vs Separation Distance (d)',
    xKey: 'distance',
    yKey: 'forcePerLength',
    xLabel: 'Separation d',
    yLabel: 'Force per Unit Length F/L',
    xUnit: 'cm',
    yUnit: 'μN/m',
    graphType: 'scatter',
    isLinear: false,
  },
];

// ==========================================
// 19. Charged Particle in Magnetic Field Presets
// ==========================================
export const chargedParticleGraphs: ScientificGraphDefinition[] = [
  {
    id: 'r_vs_v',
    title: 'Cyclotron Radius (r) vs Velocity (v)',
    xKey: 'velocity',
    yKey: 'radius',
    xLabel: 'Particle Speed v',
    yLabel: 'Orbit Radius r',
    xUnit: 'm/s',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'm / (qB)',
    getExpectedSlope: (p) => (p.mass || 1) / ((p.charge || 1) * (p.bField || 1)),
    deducePhysics: (reg, p) => {
      const qB = (p.charge || 1) * (p.bField || 1);
      const expMass = reg.slope * qB;
      return {
        label: 'Deduced Particle Mass m',
        formula: 'm = slope · qB',
        unit: 'kg',
        experimentalValue: parseFloat(expMass.toFixed(3)),
      };
    },
  },
  {
    id: 'r_vs_inv_b',
    title: 'Radius (r) vs 1/Magnetic Field (1/B)',
    xKey: 'bField',
    yKey: 'radius',
    xLabel: '1 / B',
    yLabel: 'Radius r',
    xUnit: '1/T',
    yUnit: 'm',
    graphType: 'scatter',
    isLinear: true,
    transformPoint: (r) => {
      const B = Number(r.bField || 1);
      const rad = Number(r.radius || 1);
      return { x: 1 / B, y: rad };
    },
  },
  {
    id: 'fmag_vs_v',
    title: 'Lorentz Force (F_B) vs Velocity (v)',
    xKey: 'velocity',
    yKey: 'force',
    xLabel: 'Speed v',
    yLabel: 'Magnetic Force F_B',
    xUnit: 'm/s',
    yUnit: 'N',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'qB',
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
    yKey: 'fieldCenter',
    xLabel: 'Current I',
    yLabel: 'Axial Magnetic Field B',
    xUnit: 'A',
    yUnit: 'mT',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'μ₀ n',
    deducePhysics: (reg, p) => {
      const n = (p.turns || 500) / (p.length || 0.5);
      const expMu0 = (reg.slope * 1e-3) / n;
      return {
        label: 'Deduced μ₀',
        formula: 'μ₀ = slope / n',
        unit: 'T·m/A',
        experimentalValue: parseFloat(expMu0.toExponential(3)),
      };
    },
  },
  {
    id: 'b_vs_n_turns',
    title: 'Magnetic Field (B) vs Turns per Length (n)',
    xKey: 'turnsPerMeter',
    yKey: 'fieldCenter',
    xLabel: 'Turns per Length n = N/L',
    yLabel: 'Magnetic Field B',
    xUnit: 'turns/m',
    yUnit: 'mT',
    graphType: 'scatter',
    isLinear: true,
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
    expectedSlopeFormula: 'Coil Turns N',
    getExpectedSlope: (p) => p.turns || 100,
    deducePhysics: (reg, p) => {
      const theoN = p.turns || 100;
      const err = calculatePercentageError(Math.abs(reg.slope), theoN);
      return {
        label: 'Deduced Coil Turns N',
        formula: 'N = |ℰ / (dΦ/dt)|',
        unit: 'turns',
        experimentalValue: parseFloat(Math.abs(reg.slope).toFixed(1)),
        theoreticalValue: theoN,
        percentageError: parseFloat(err.toFixed(2)),
      };
    },
  },
  {
    id: 'flux_vs_t_ind',
    title: 'Magnetic Flux (Φ) vs Time (t)',
    xKey: 'time',
    yKey: 'magneticFlux',
    xLabel: 'Time t',
    yLabel: 'Magnetic Flux Φ',
    xUnit: 's',
    yUnit: 'mWb',
    graphType: 'realtime-series',
    isLinear: false,
  },
  {
    id: 'emf_vs_t_ind',
    title: 'Induced EMF (ℰ) vs Time (t)',
    xKey: 'time',
    yKey: 'inducedEMF',
    xLabel: 'Time t',
    yLabel: 'Induced EMF ℰ',
    xUnit: 's',
    yUnit: 'V',
    graphType: 'realtime-series',
    isLinear: false,
  },
];

// ==========================================
// 22. Gas Laws & Thermal Physics Presets
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
    graphType: 'scatter',
    isLinear: false,
    getTheoreticalCurve: ([minX, maxX], p) => {
      const T = p.temperature || 300;
      const N = p.molecules || 100;
      const pts = [];
      const step = (maxX - minX) / 30 || 0.2;
      for (let v = Math.max(0.5, minX); v <= maxX; v += step) {
        pts.push({ x: v, y: (N * 0.08314 * T) / v });
      }
      return { points: pts, label: `Isotherm T = ${T} K (PV = const)` };
    },
  },
  {
    id: 'boyle_law',
    title: "Boyle's Law: Pressure (P) vs 1/Volume (1/V)",
    xKey: 'volume',
    yKey: 'pressure',
    xLabel: '1 / Volume (1/V)',
    yLabel: 'Pressure P',
    xUnit: '1/L',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nRT (Constant)',
    transformPoint: (r) => {
      const v = Number(r.volume || 1);
      const p = Number(r.pressure || 100);
      return { x: 1 / v, y: p };
    },
  },
  {
    id: 'charles_law',
    title: "Charles' Law: Volume (V) vs Temperature (T)",
    xKey: 'temperature',
    yKey: 'volume',
    xLabel: 'Absolute Temperature T',
    yLabel: 'Volume V',
    xUnit: 'K',
    yUnit: 'L',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nR / P',
  },
  {
    id: 'gay_lussac_law',
    title: "Pressure Law: Pressure (P) vs Temperature (T)",
    xKey: 'temperature',
    yKey: 'pressure',
    xLabel: 'Absolute Temperature T',
    yLabel: 'Pressure P',
    xUnit: 'K',
    yUnit: 'kPa',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'nR / V',
  },
];

// ==========================================
// 23. Photoelectric Effect Presets
// ==========================================
export const photoelectricGraphs: ScientificGraphDefinition[] = [
  {
    id: 'vs_vs_freq',
    title: 'Stopping Potential (V_s) vs Frequency (f)',
    xKey: 'frequency',
    yKey: 'stoppingPotential',
    xLabel: 'Frequency f',
    yLabel: 'Stopping Potential V_s',
    xUnit: '×10¹⁴ Hz',
    yUnit: 'V',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'h / e = 4.136 × 10⁻¹⁵ V·s',
    getExpectedSlope: () => 0.4136, // scaled for 10^14 Hz
    deducePhysics: (reg) => {
      // slope is in V / (10^14 Hz) -> h/e = slope * 10^-14 V·s
      const hOverE = reg.slope * 1e-14;
      const hExp = hOverE * 1.602e-19; // J·s
      const workFuncExp = Math.abs(reg.intercept); // eV
      const f0Exp = reg.slope !== 0 ? Math.abs(reg.intercept) / reg.slope : 0;
      const hTheo = 6.626e-34;
      const err = calculatePercentageError(hExp, hTheo);

      return {
        label: "Planck's Constant (h)",
        formula: 'h = e · slope',
        unit: 'J·s',
        experimentalValue: parseFloat(hExp.toExponential(3)),
        theoreticalValue: parseFloat(hTheo.toExponential(3)),
        percentageError: parseFloat(err.toFixed(2)),
        description: `Work Function Φ = ${workFuncExp.toFixed(2)} eV, Threshold f₀ = ${f0Exp.toFixed(2)} × 10¹⁴ Hz`,
      };
    },
  },
  {
    id: 'kemax_vs_freq',
    title: 'Max Kinetic Energy (K_max) vs Frequency (f)',
    xKey: 'frequency',
    yKey: 'maxKineticEnergy',
    xLabel: 'Frequency f',
    yLabel: 'Max Kinetic Energy K_max',
    xUnit: '×10¹⁴ Hz',
    yUnit: 'eV',
    graphType: 'scatter',
    isLinear: true,
    expectedSlopeFormula: 'h',
  },
  {
    id: 'current_vs_intensity',
    title: 'Photocurrent (I) vs Light Intensity',
    xKey: 'intensity',
    yKey: 'current',
    xLabel: 'Intensity',
    yLabel: 'Saturation Current I_sat',
    xUnit: '%',
    yUnit: 'μA',
    graphType: 'scatter',
    isLinear: true,
  },
  {
    id: 'current_vs_voltage',
    title: 'Photocurrent (I) vs Applied Voltage (V)',
    xKey: 'voltage',
    yKey: 'current',
    xLabel: 'Applied Voltage V',
    yLabel: 'Photocurrent I',
    xUnit: 'V',
    yUnit: 'μA',
    graphType: 'scatter',
    isLinear: false,
  },
];
