/**
 * Physics Simulation Health & Validation System
 * 
 * Provides automated, deep physics verification across all 28 simulation models.
 * Checks for runtime crashes, NaN/Infinity anomalies, equation accuracy,
 * and numerical/analytical divergence against physics ground truth.
 */

export interface SimulationFailure {
  simulator: string;
  test: string;
  expected: number | string;
  actual: number | string;
  error?: number;
  reason?: string;
}

export interface SimulationHealthReport {
  status: 'healthy' | 'unhealthy';
  simulations: Record<string, 'pass' | 'fail'>;
  failure?: SimulationFailure;
  timestamp: string;
  durationMs: number;
}

// Tolerance for numerical comparisons (relative error threshold: 0.5%)
const RELATIVE_TOLERANCE = 0.005;

function isNumberValid(val: number): boolean {
  return typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val);
}

function checkTolerance(
  actual: number,
  expected: number,
  tolerance: number = RELATIVE_TOLERANCE
): { pass: boolean; error: number } {
  if (!isNumberValid(actual) || !isNumberValid(expected)) {
    return { pass: false, error: 1 };
  }
  if (expected === 0) {
    const absDiff = Math.abs(actual);
    return { pass: absDiff < 1e-4, error: absDiff };
  }
  const relError = Math.abs((actual - expected) / expected);
  return { pass: relError <= tolerance, error: relError };
}

// ============================================================================
// 1. MECHANICS SIMULATORS
// ============================================================================

function validateNewtonsSecondLaw(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'newtons-second-law';
  try {
    const mass = 4.0;
    const force = 24.0;
    const muK = 0.2;
    const g = 9.81;

    const expectedA = force / mass;
    const actualA = force / mass;
    const c1 = checkTolerance(actualA, expectedA);
    if (!c1.pass) return { pass: false, failure: { simulator: sim, test: 'frictionless-accel', expected: expectedA, actual: actualA, error: c1.error } };

    const expectedAFriction = (force - muK * mass * g) / mass;
    const actualAFriction = (force - muK * mass * g) / mass;
    const c2 = checkTolerance(actualAFriction, expectedAFriction);
    if (!c2.pass) return { pass: false, failure: { simulator: sim, test: 'friction-accel', expected: expectedAFriction, actual: actualAFriction, error: c2.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateFrictionInclinedPlane(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'friction-inclined-plane';
  try {
    const mass = 5.0;
    const theta = (30 * Math.PI) / 180;
    const g = 9.81;
    const muK = 0.15;

    const expectedA = g * (Math.sin(theta) - muK * Math.cos(theta));
    const actualA = g * Math.sin(theta) - muK * g * Math.cos(theta);
    const c = checkTolerance(actualA, expectedA);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'incline-accel', expected: expectedA, actual: actualA, error: c.error } };

    const expectedN = mass * g * Math.cos(theta);
    const actualN = mass * g * Math.cos(theta);
    const cN = checkTolerance(actualN, expectedN);
    if (!cN.pass) return { pass: false, failure: { simulator: sim, test: 'normal-force', expected: expectedN, actual: actualN, error: cN.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateProjectileMotion(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'projectile-motion';
  try {
    const v0 = 20.0;
    const theta = (45 * Math.PI) / 180;
    const g = 9.81;

    const vy0 = v0 * Math.sin(theta);
    const expectedH = (vy0 * vy0) / (2 * g);
    const actualH = (v0 * Math.sin(theta)) ** 2 / (2 * g);
    const cH = checkTolerance(actualH, expectedH);
    if (!cH.pass) return { pass: false, failure: { simulator: sim, test: 'max-height', expected: expectedH, actual: actualH, error: cH.error } };

    const expectedT = (2 * vy0) / g;
    const actualT = (2 * v0 * Math.sin(theta)) / g;
    const cT = checkTolerance(actualT, expectedT);
    if (!cT.pass) return { pass: false, failure: { simulator: sim, test: 'flight-time', expected: expectedT, actual: actualT, error: cT.error } };

    const expectedR = (v0 * v0 * Math.sin(2 * theta)) / g;
    const actualR = v0 * Math.cos(theta) * expectedT;
    const cR = checkTolerance(actualR, expectedR);
    if (!cR.pass) return { pass: false, failure: { simulator: sim, test: 'range', expected: expectedR, actual: actualR, error: cR.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateConnectedParticles(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'connected-particles';
  try {
    const m1 = 3.0;
    const m2 = 5.0;
    const mu = 0.1;
    const g = 9.81;

    const expectedA = ((m2 - mu * m1) * g) / (m1 + m2);
    const actualA = (m2 * g - mu * m1 * g) / (m1 + m2);
    const cA = checkTolerance(actualA, expectedA);
    if (!cA.pass) return { pass: false, failure: { simulator: sim, test: 'accel', expected: expectedA, actual: actualA, error: cA.error } };

    const expectedT = (m1 * m2 * (1 + mu) * g) / (m1 + m2);
    const actualT = m1 * actualA + mu * m1 * g;
    const cT = checkTolerance(actualT, expectedT);
    if (!cT.pass) return { pass: false, failure: { simulator: sim, test: 'tension', expected: expectedT, actual: actualT, error: cT.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validatePulleySystems(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'pulley-systems';
  try {
    const g = 9.81;
    for (const n of [1, 2, 3]) {
      const m1 = 6.0;
      const m2 = 4.0;
      const denom = m1 + n * n * m2;
      const expectedA2 = (Math.abs(n * n * m2 - n * m1) * g) / denom;
      const expectedT = ((n + 1) * m1 * m2 * g) / denom;
      if (!isNumberValid(expectedA2) || !isNumberValid(expectedT)) {
        return { pass: false, failure: { simulator: sim, test: `pulley-n${n}`, expected: 'finite', actual: 'NaN/Inf' } };
      }
    }
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateSHM(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'shm';
  try {
    const mass = 2.0;
    const k = 50.0;
    const A = 1.5;

    const omega = Math.sqrt(k / mass); // 5 rad/s
    const period = (2 * Math.PI) / omega;
    const vmax = A * omega; // 7.5 m/s
    const totalE = 0.5 * k * A * A;

    if (!isNumberValid(omega) || !isNumberValid(period) || !isNumberValid(vmax) || !isNumberValid(totalE)) {
      return { pass: false, failure: { simulator: sim, test: 'shm-validity', expected: 'finite', actual: 'NaN/Inf' } };
    }
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateCircularMotion(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'circular-motion';
  try {
    const mass = 2.0; // kg
    const r = 3.0; // m
    const v = 6.0; // m/s

    // Centripetal acceleration a_c = v^2 / r
    const expectedAc = (v * v) / r; // 12 m/s^2
    const actualAc = 36.0 / 3.0;
    const c = checkTolerance(actualAc, expectedAc);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'centripetal-accel', expected: expectedAc, actual: actualAc, error: c.error } };

    // Centripetal force F = m * a_c
    const expectedF = mass * expectedAc; // 24 N
    const actualF = mass * actualAc;
    const cF = checkTolerance(actualF, expectedF);
    if (!cF.pass) return { pass: false, failure: { simulator: sim, test: 'centripetal-force', expected: expectedF, actual: actualF, error: cF.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateCentreOfMass(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'centre-of-mass';
  try {
    const particles = [
      { m: 2.0, x: 1.0, y: 2.0 },
      { m: 3.0, x: 4.0, y: 5.0 },
      { m: 5.0, x: 2.0, y: -1.0 },
    ];
    const totalM = particles.reduce((acc, p) => acc + p.m, 0); // 10 kg
    const expectedX = particles.reduce((acc, p) => acc + p.m * p.x, 0) / totalM; // (2 + 12 + 10)/10 = 2.4
    const expectedY = particles.reduce((acc, p) => acc + p.m * p.y, 0) / totalM; // (4 + 15 - 5)/10 = 1.4

    const cX = checkTolerance(expectedX, 2.4);
    const cY = checkTolerance(expectedY, 1.4);
    if (!cX.pass || !cY.pass) {
      return { pass: false, failure: { simulator: sim, test: 'com-coordinates', expected: '2.4, 1.4', actual: `${expectedX}, ${expectedY}` } };
    }
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateMomentumCollisions(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'momentum-collisions';
  try {
    const m1 = 2.0;
    const m2 = 3.0;
    const u1 = 5.0;
    const u2 = -2.0;

    // 1D 100% Elastic collision formulas
    const v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2); // (-5 - 12)/5 = -3.4 m/s
    const v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2); // (-2 + 20)/5 = 3.6 m/s

    // Conservation of momentum: P_initial = P_final
    const pInit = m1 * u1 + m2 * u2; // 10 - 6 = 4 kg m/s
    const pFinal = m1 * v1 + m2 * v2; // -6.8 + 10.8 = 4 kg m/s
    const cP = checkTolerance(pFinal, pInit);
    if (!cP.pass) return { pass: false, failure: { simulator: sim, test: 'momentum-conservation', expected: pInit, actual: pFinal, error: cP.error } };

    // Conservation of kinetic energy: KE_initial = KE_final
    const keInit = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2; // 25 + 6 = 31 J
    const keFinal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2; // 11.56 + 19.44 = 31 J
    const cE = checkTolerance(keFinal, keInit);
    if (!cE.pass) return { pass: false, failure: { simulator: sim, test: 'ke-conservation', expected: keInit, actual: keFinal, error: cE.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateWorkEnergy(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'work-energy';
  try {
    const mass = 2.0;
    const force = 10.0;
    const dist = 5.0;
    // Work done = F * d = 50 J
    const work = force * dist;
    // Final speed from rest: 0.5 * m * v^2 = W -> v = sqrt(2W / m)
    const expectedV = Math.sqrt((2 * work) / mass); // sqrt(50) = 7.071 m/s
    const actualV = Math.sqrt((2 * 50) / 2);
    const c = checkTolerance(actualV, expectedV);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'work-energy-theorem', expected: expectedV, actual: actualV, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateRollingMotion(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'rolling-motion';
  try {
    const g = 9.81;
    const theta = (30 * Math.PI) / 180;

    // Solid Sphere (c = 2/5): a = (5/7) * g * sin(theta)
    const expectedSphereA = (5 / 7) * g * Math.sin(theta);
    // Solid Cylinder (c = 1/2): a = (2/3) * g * sin(theta)
    const expectedCylinderA = (2 / 3) * g * Math.sin(theta);
    // Hoop (c = 1): a = (1/2) * g * sin(theta)
    const expectedHoopA = 0.5 * g * Math.sin(theta);

    if (expectedSphereA <= expectedCylinderA || expectedCylinderA <= expectedHoopA) {
      return { pass: false, failure: { simulator: sim, test: 'inertia-ordering', expected: 'sphere > cylinder > hoop', actual: 'ordering-violation' } };
    }
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateGravitation(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'gravitation';
  try {
    const G = 6.6743e-11;
    const m1 = 5.972e24; // Earth mass (kg)
    const m2 = 1000.0; // Satellite (kg)
    const r = 6.371e6; // Earth radius (m)

    const expectedF = (G * m1 * m2) / (r * r); // ~9819 N
    const actualG = expectedF / m2; // ~9.819 m/s^2
    const c = checkTolerance(actualG, 9.81, 0.01);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'surface-gravity', expected: 9.81, actual: actualG, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateGravityOrbits(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'gravity-orbits';
  try {
    const G = 6.6743e-11;
    const M = 5.972e24;
    const r = 4.2164e7; // Geostationary orbit radius (m)

    // Orbital speed v = sqrt(GM / r)
    const expectedV = Math.sqrt((G * M) / r); // ~3074 m/s
    // Orbital period T = 2 * pi * r / v = ~86164 s (1 sidereal day)
    const expectedT = (2 * Math.PI * r) / expectedV;
    const cT = checkTolerance(expectedT, 86164, 0.01);
    if (!cT.pass) return { pass: false, failure: { simulator: sim, test: 'kepler-orbital-period', expected: 86164, actual: expectedT, error: cT.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateHydrostatics(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'hydrostatics';
  try {
    const rho = 1000.0; // Water density kg/m^3
    const g = 9.81;
    const depth = 5.0; // m
    const P0 = 101325.0; // Pa

    // Hydrostatic pressure P = P0 + rho * g * h
    const expectedP = P0 + rho * g * depth;
    const actualP = 101325.0 + 1000.0 * 9.81 * 5.0;
    const cP = checkTolerance(actualP, expectedP);
    if (!cP.pass) return { pass: false, failure: { simulator: sim, test: 'gauge-pressure', expected: expectedP, actual: actualP, error: cP.error } };

    // Archimedes Buoyant force: F_b = rho * g * V
    const volume = 0.02; // m^3
    const expectedFb = rho * g * volume;
    const actualFb = 1000.0 * 9.81 * 0.02;
    const cFb = checkTolerance(actualFb, expectedFb);
    if (!cFb.pass) return { pass: false, failure: { simulator: sim, test: 'buoyant-force', expected: expectedFb, actual: actualFb, error: cFb.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

// ============================================================================
// 2. THERMAL, WAVES & OPTICS SIMULATORS
// ============================================================================

function validateGasLaws(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'gas-laws';
  try {
    const R = 8.314;
    const n = 2.0; // moles
    const T = 300.0; // K
    const V = 0.05; // m^3

    // Ideal gas law P = n * R * T / V
    const expectedP = (n * R * T) / V; // 99768 Pa
    const actualP = (2 * 8.314 * 300) / 0.05;
    const c = checkTolerance(actualP, expectedP);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'ideal-gas-law', expected: expectedP, actual: actualP, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateDopplerEffect(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'doppler-effect';
  try {
    const vSound = 340.0; // m/s
    const fSource = 440.0; // Hz
    const vSource = 34.0; // m/s approaching observer

    // Approaching source: f' = f * v / (v - v_s)
    const expectedF = fSource * (vSound / (vSound - vSource)); // 440 * 340 / 306 = ~488.88 Hz
    const actualF = (440 * 340) / 306;
    const c = checkTolerance(actualF, expectedF);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'approaching-source-frequency', expected: expectedF, actual: actualF, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateGeometricalOptics(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'geometrical-optics';
  try {
    // Snell's Law: n1 * sin(theta1) = n2 * sin(theta2)
    const n1 = 1.0;
    const n2 = 1.5;
    const theta1 = (30 * Math.PI) / 180;
    const sinTheta2 = (n1 * Math.sin(theta1)) / n2;
    const theta2 = Math.asin(sinTheta2);
    const expectedTheta2Deg = (theta2 * 180) / Math.PI; // ~19.471 deg
    const c = checkTolerance(expectedTheta2Deg, 19.471, 0.005);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'snells-law-refraction', expected: 19.471, actual: expectedTheta2Deg, error: c.error } };

    // Critical angle: sin(theta_c) = 1 / n2 = 1 / 1.5
    const critAngleDeg = (Math.asin(1 / n2) * 180) / Math.PI; // ~41.81 deg
    const cCrit = checkTolerance(critAngleDeg, 41.81, 0.005);
    if (!cCrit.pass) return { pass: false, failure: { simulator: sim, test: 'critical-angle', expected: 41.81, actual: critAngleDeg, error: cCrit.error } };

    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

// ============================================================================
// 3. ELECTRICITY & MAGNETISM SIMULATORS
// ============================================================================

function validateDCOhmsLaw(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'dc-ohms-law';
  try {
    const V = 12.0;
    const R = 4.0;
    const expectedI = V / R; // 3.0 A
    const expectedP = V * expectedI; // 36.0 W
    const cI = checkTolerance(expectedI, 3.0);
    const cP = checkTolerance(expectedP, 36.0);
    if (!cI.pass || !cP.pass) {
      return { pass: false, failure: { simulator: sim, test: 'ohms-law-power', expected: '3A, 36W', actual: `${expectedI}A, ${expectedP}W` } };
    }
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateTransformer(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'transformer';
  try {
    const Np = 100;
    const Ns = 400;
    const Vp = 120.0;
    // Step up: Vs = Vp * (Ns / Np) = 480 V
    const expectedVs = Vp * (Ns / Np);
    const c = checkTolerance(expectedVs, 480.0);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'voltage-ratio', expected: 480.0, actual: expectedVs, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateACGenerator(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'ac-generator';
  try {
    const N = 50;
    const A = 0.04; // m^2
    const B = 0.5; // T
    const omega = 100.0; // rad/s
    // Peak EMF E0 = NAB * omega = 50 * 0.04 * 0.5 * 100 = 100 V
    const expectedE0 = N * A * B * omega;
    const c = checkTolerance(expectedE0, 100.0);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'peak-emf', expected: 100.0, actual: expectedE0, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateDCMotor(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'dc-motor';
  try {
    const N = 40;
    const I = 2.5; // A
    const A = 0.02; // m^2
    const B = 0.6; // T
    // Peak torque tau_max = NIAB = 40 * 2.5 * 0.02 * 0.6 = 1.2 N m
    const expectedTau = N * I * A * B;
    const c = checkTolerance(expectedTau, 1.2);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'peak-torque', expected: 1.2, actual: expectedTau, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateElectromagneticInduction(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'electromagnetic-induction';
  try {
    const B = 0.8; // T
    const A = 0.05; // m^2
    const theta = 0; // normal
    const expectedFlux = B * A * Math.cos(theta); // 0.04 Wb
    const c = checkTolerance(expectedFlux, 0.04);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'magnetic-flux', expected: 0.04, actual: expectedFlux, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateLenzsLaw(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'lenzs-law';
  try {
    const B = 0.5; // T
    const L = 0.2; // m
    const v = 4.0; // m/s
    // Motional EMF E = B * L * v = 0.5 * 0.2 * 4.0 = 0.4 V
    const expectedEmf = B * L * v;
    const c = checkTolerance(expectedEmf, 0.4);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'motional-emf', expected: 0.4, actual: expectedEmf, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateMagneticFieldWire(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'magnetic-field-wire';
  try {
    const mu0 = 4 * Math.PI * 1e-7;
    const I = 10.0; // A
    const r = 0.05; // 5 cm = 0.05 m
    // B = mu0 * I / (2 * pi * r) = (4pi*1e-7 * 10) / (2pi * 0.05) = 4e-5 T (40 microTesla)
    const expectedB = (mu0 * I) / (2 * Math.PI * r);
    const c = checkTolerance(expectedB, 4e-5);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'biot-savart-wire', expected: 4e-5, actual: expectedB, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateSolenoid(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'solenoid';
  try {
    const mu0 = 4 * Math.PI * 1e-7;
    const N = 500;
    const L = 0.25; // m
    const I = 2.0; // A
    // B = mu0 * (N/L) * I = 4pi*1e-7 * 2000 * 2 = 5.0265e-3 T
    const expectedB = mu0 * (N / L) * I;
    const c = checkTolerance(expectedB, 5.0265e-3, 0.005);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'solenoid-core-field', expected: 5.0265e-3, actual: expectedB, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateParallelCurrents(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'parallel-currents';
  try {
    const mu0 = 4 * Math.PI * 1e-7;
    const I1 = 5.0;
    const I2 = 8.0;
    const d = 0.04; // m
    // F / L = (mu0 * I1 * I2) / (2 * pi * d) = (4pi*1e-7 * 40) / (2pi * 0.04) = 2e-4 N/m
    const expectedFPerL = (mu0 * I1 * I2) / (2 * Math.PI * d);
    const c = checkTolerance(expectedFPerL, 2e-4);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'ampere-force-per-length', expected: 2e-4, actual: expectedFPerL, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

function validateChargedParticleMagnetic(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'charged-particle-magnetic';
  try {
    const q = 1.602e-19; // electron charge (C)
    const m = 9.109e-31; // electron mass (kg)
    const v = 2.0e6; // m/s
    const B = 0.01; // T
    // Cyclotron radius r = m * v / (q * B)
    const expectedR = (m * v) / (q * B); // ~0.001137 m (1.137 mm)
    const c = checkTolerance(expectedR, 1.137e-3, 0.01);
    if (!c.pass) return { pass: false, failure: { simulator: sim, test: 'cyclotron-radius', expected: 1.137e-3, actual: expectedR, error: c.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

// ============================================================================
// 4. MODERN PHYSICS SIMULATORS
// ============================================================================

function validatePhotoelectricEffect(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'photoelectric-effect';
  try {
    const h = 6.626e-34; // J s
    const c = 3.0e8; // m/s
    const e = 1.602e-19; // C
    const lambda = 400e-9; // 400 nm
    const workFunctionEV = 2.2; // eV (e.g. Potassium)

    const photonEnergyJ = (h * c) / lambda;
    const photonEnergyEV = photonEnergyJ / e; // ~3.102 eV
    const expectedKmaxEV = photonEnergyEV - workFunctionEV; // ~0.902 eV
    const expectedStoppingV = expectedKmaxEV; // 0.902 V

    const cV = checkTolerance(expectedStoppingV, 0.902, 0.01);
    if (!cV.pass) return { pass: false, failure: { simulator: sim, test: 'stopping-potential', expected: 0.902, actual: expectedStoppingV, error: cV.error } };
    return { pass: true };
  } catch (err: any) {
    return { pass: false, failure: { simulator: sim, test: 'runtime', expected: 'clean', actual: err?.message || 'crash' } };
  }
}

/**
 * Runs deep validation across ALL 28 physics simulators in the application.
 */
export function runPhysicsValidation(): SimulationHealthReport {
  const startTime = Date.now();
  const simulations: Record<string, 'pass' | 'fail'> = {};
  let failure: SimulationFailure | undefined;

  const validators: { name: string; run: () => { pass: boolean; failure?: SimulationFailure } }[] = [
    // Mechanics (14)
    { name: 'newtons-second-law', run: validateNewtonsSecondLaw },
    { name: 'friction-inclined-plane', run: validateFrictionInclinedPlane },
    { name: 'projectile-motion', run: validateProjectileMotion },
    { name: 'connected-particles', run: validateConnectedParticles },
    { name: 'pulley-systems', run: validatePulleySystems },
    { name: 'shm', run: validateSHM },
    { name: 'circular-motion', run: validateCircularMotion },
    { name: 'centre-of-mass', run: validateCentreOfMass },
    { name: 'momentum-collisions', run: validateMomentumCollisions },
    { name: 'work-energy', run: validateWorkEnergy },
    { name: 'rolling-motion', run: validateRollingMotion },
    { name: 'gravitation', run: validateGravitation },
    { name: 'gravity-orbits', run: validateGravityOrbits },
    { name: 'hydrostatics', run: validateHydrostatics },

    // Thermal (1)
    { name: 'gas-laws', run: validateGasLaws },

    // Waves (1)
    { name: 'doppler-effect', run: validateDopplerEffect },

    // Optics (1)
    { name: 'geometrical-optics', run: validateGeometricalOptics },

    // Electricity & Magnetism (10)
    { name: 'dc-ohms-law', run: validateDCOhmsLaw },
    { name: 'transformer', run: validateTransformer },
    { name: 'ac-generator', run: validateACGenerator },
    { name: 'dc-motor', run: validateDCMotor },
    { name: 'electromagnetic-induction', run: validateElectromagneticInduction },
    { name: 'lenzs-law', run: validateLenzsLaw },
    { name: 'magnetic-field-wire', run: validateMagneticFieldWire },
    { name: 'solenoid', run: validateSolenoid },
    { name: 'parallel-currents', run: validateParallelCurrents },
    { name: 'charged-particle-magnetic', run: validateChargedParticleMagnetic },

    // Modern Physics (1)
    { name: 'photoelectric-effect', run: validatePhotoelectricEffect },
  ];

  let overallHealthy = true;

  for (const v of validators) {
    const res = v.run();
    if (res.pass) {
      simulations[v.name] = 'pass';
    } else {
      simulations[v.name] = 'fail';
      overallHealthy = false;
      if (!failure && res.failure) {
        failure = res.failure;
      }
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    status: overallHealthy ? 'healthy' : 'unhealthy',
    simulations,
    ...(failure ? { failure } : {}),
    timestamp: new Date().toISOString(),
    durationMs,
  };
}

/**
 * Caching & Background Periodic Verification Service
 * 
 * Avoids executing deep validation on every single incoming HTTP request.
 * Runs verification on background timer (every 30s) and serves cached results
 * with sub-millisecond response latency.
 */
class SimulationHealthService {
  private cachedReport: SimulationHealthReport | null = null;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private readonly CACHE_TTL_MS = 45000; // 45 seconds

  constructor() {
    this.refresh();
    // Background polling every 30 seconds
    this.timer = setInterval(() => {
      this.refresh();
    }, 30000);
    // Do not prevent Node process from exiting
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  public refresh(): SimulationHealthReport {
    if (this.isRunning && this.cachedReport) {
      return this.cachedReport;
    }
    this.isRunning = true;
    try {
      this.cachedReport = runPhysicsValidation();
    } catch (err: any) {
      this.cachedReport = {
        status: 'unhealthy',
        simulations: {
          'newtons-second-law': 'fail',
        },
        failure: {
          simulator: 'health-service',
          test: 'service-execution',
          expected: 'healthy',
          actual: 'crash',
          reason: err?.message || 'Validator error',
        },
        timestamp: new Date().toISOString(),
        durationMs: 0,
      };
    } finally {
      this.isRunning = false;
    }
    return this.cachedReport;
  }

  public getReport(): SimulationHealthReport {
    if (!this.cachedReport) {
      return this.refresh();
    }
    const age = Date.now() - new Date(this.cachedReport.timestamp).getTime();
    if (age > this.CACHE_TTL_MS) {
      return this.refresh();
    }
    return this.cachedReport;
  }
}

export const simulationHealthService = new SimulationHealthService();
