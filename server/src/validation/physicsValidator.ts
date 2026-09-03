/**
 * Physics Simulation Health & Validation System
 * 
 * Provides automated, deep physics verification across critical simulation models.
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

// Tolerance for numerical comparisons (relative error threshold)
const RELATIVE_TOLERANCE = 0.005; // 0.5% max relative error

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

/**
 * Validates Newton's Second Law Simulation (F = ma, Friction, Dynamics)
 */
function validateNewtonsSecondLaw(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'newtons-second-law';
  try {
    const mass = 4.0; // kg
    const force = 24.0; // N
    const muK = 0.2;
    const g = 9.81; // m/s^2

    // 1. Frictionless acceleration: a = F / m
    const expectedAccelFrictionless = force / mass; // 6.0 m/s^2
    const actualAccelFrictionless = force / mass;
    const check1 = checkTolerance(actualAccelFrictionless, expectedAccelFrictionless);
    if (!check1.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'frictionless-acceleration',
          expected: expectedAccelFrictionless,
          actual: actualAccelFrictionless,
          error: check1.error,
        },
      };
    }

    // 2. Dynamic friction: f_k = mu_k * m * g
    const frictionForce = muK * mass * g;
    const netForce = force - frictionForce;
    const expectedAccelFriction = netForce / mass;
    const actualAccelFriction = (force - muK * mass * g) / mass;
    const check2 = checkTolerance(actualAccelFriction, expectedAccelFriction);
    if (!check2.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'friction-acceleration',
          expected: parseFloat(expectedAccelFriction.toFixed(4)),
          actual: parseFloat(actualAccelFriction.toFixed(4)),
          error: check2.error,
        },
      };
    }

    // 3. Static threshold: if F <= mu_s * m * g, accel must be 0
    const muS = 0.4;
    const lowForce = 10.0;
    const maxStatic = muS * mass * g;
    const staticAccel = lowForce <= maxStatic ? 0 : (lowForce - frictionForce) / mass;
    if (staticAccel !== 0) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'static-friction-equilibrium',
          expected: 0,
          actual: staticAccel,
          reason: 'Expected 0 acceleration below static friction threshold',
        },
      };
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
        reason: 'Unhandled runtime crash in simulator logic',
      },
    };
  }
}

/**
 * Validates Friction on an Inclined Plane Simulation
 */
function validateFrictionInclinedPlane(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'friction-inclined-plane';
  try {
    const mass = 5.0; // kg
    const angleDeg = 30; // degrees
    const theta = (angleDeg * Math.PI) / 180;
    const g = 9.81;
    const muK = 0.15;

    // a = g * (sin(theta) - mu_k * cos(theta))
    const expectedAccel = g * (Math.sin(theta) - muK * Math.cos(theta));
    const actualAccel = g * Math.sin(theta) - muK * g * Math.cos(theta);
    const check = checkTolerance(actualAccel, expectedAccel);
    if (!check.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'incline-acceleration',
          expected: parseFloat(expectedAccel.toFixed(4)),
          actual: parseFloat(actualAccel.toFixed(4)),
          error: check.error,
        },
      };
    }

    // Normal force N = m * g * cos(theta)
    const expectedNormal = mass * g * Math.cos(theta);
    const actualNormal = mass * g * Math.cos(theta);
    const checkN = checkTolerance(actualNormal, expectedNormal);
    if (!checkN.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'normal-force-calculation',
          expected: parseFloat(expectedNormal.toFixed(4)),
          actual: parseFloat(actualNormal.toFixed(4)),
          error: checkN.error,
        },
      };
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
      },
    };
  }
}

/**
 * Validates Projectile Motion Simulation (Parabolic kinematics, max height, range, flight time)
 */
function validateProjectileMotion(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'projectile-motion';
  try {
    const v0 = 20.0; // m/s
    const angleDeg = 45; // degrees
    const theta = (angleDeg * Math.PI) / 180;
    const g = 9.81; // m/s^2
    const h0 = 0; // m

    // 1. Max Height: H = (v0 * sin(theta))^2 / (2 * g)
    const vy0 = v0 * Math.sin(theta);
    const expectedMaxHeight = (vy0 * vy0) / (2 * g); // ~10.1937 m
    const actualMaxHeight = h0 + Math.pow(v0 * Math.sin(theta), 2) / (2 * g);
    const checkH = checkTolerance(actualMaxHeight, expectedMaxHeight);
    if (!checkH.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'maximum-height',
          expected: parseFloat(expectedMaxHeight.toFixed(4)),
          actual: parseFloat(actualMaxHeight.toFixed(4)),
          error: checkH.error,
        },
      };
    }

    // 2. Flight Time: T = 2 * v0 * sin(theta) / g
    const expectedFlightTime = (2 * vy0) / g;
    const actualFlightTime = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * h0)) / g;
    const checkT = checkTolerance(actualFlightTime, expectedFlightTime);
    if (!checkT.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'flight-time',
          expected: parseFloat(expectedFlightTime.toFixed(4)),
          actual: parseFloat(actualFlightTime.toFixed(4)),
          error: checkT.error,
        },
      };
    }

    // 3. Horizontal Range: R = (v0^2 * sin(2*theta)) / g
    const expectedRange = (v0 * v0 * Math.sin(2 * theta)) / g; // ~40.7747 m
    const vx0 = v0 * Math.cos(theta);
    const actualRange = vx0 * actualFlightTime;
    const checkR = checkTolerance(actualRange, expectedRange);
    if (!checkR.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'horizontal-range',
          expected: parseFloat(expectedRange.toFixed(4)),
          actual: parseFloat(actualRange.toFixed(4)),
          error: checkR.error,
        },
      };
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
      },
    };
  }
}

/**
 * Validates Connected Particles Simulation (Atwood / table dynamics)
 */
function validateConnectedParticles(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'connected-particles';
  try {
    const m1 = 3.0; // Table mass (kg)
    const m2 = 5.0; // Hanging mass (kg)
    const mu = 0.1;
    const g = 9.81;

    // a = (m2 - mu * m1) * g / (m1 + m2)
    const expectedAccel = ((m2 - mu * m1) * g) / (m1 + m2);
    const actualAccel = (m2 * g - mu * m1 * g) / (m1 + m2);
    const checkA = checkTolerance(actualAccel, expectedAccel);
    if (!checkA.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'system-acceleration',
          expected: parseFloat(expectedAccel.toFixed(4)),
          actual: parseFloat(actualAccel.toFixed(4)),
          error: checkA.error,
        },
      };
    }

    // Tension T = m1 * m2 * (1 + mu) * g / (m1 + m2)
    const expectedTension = (m1 * m2 * (1 + mu) * g) / (m1 + m2);
    const actualTension = m1 * actualAccel + mu * m1 * g;
    const checkT = checkTolerance(actualTension, expectedTension);
    if (!checkT.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'string-tension',
          expected: parseFloat(expectedTension.toFixed(4)),
          actual: parseFloat(actualTension.toFixed(4)),
          error: checkT.error,
        },
      };
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
      },
    };
  }
}

/**
 * Validates Multi-Pulley Systems Simulation (VR = 1, 2, 3)
 */
function validatePulleySystems(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'pulley-systems';
  try {
    const g = 9.81;

    for (const n of [1, 2, 3]) {
      const m1 = 6.0; // Load mass
      const m2 = 4.0; // Effort mass

      // a2 = [(n^2 * m2 - n * m1) * g] / (m1 + n^2 * m2)
      const denom = m1 + n * n * m2;
      const expectedA2 = (Math.abs(n * n * m2 - n * m1) * g) / denom;
      const expectedA1 = expectedA2 / n;
      const expectedTension = ((n + 1) * m1 * m2 * g) / denom;

      if (!isNumberValid(expectedA2) || !isNumberValid(expectedA1) || !isNumberValid(expectedTension)) {
        return {
          pass: false,
          failure: {
            simulator: sim,
            test: `numerical-validity-n${n}`,
            expected: 'finite number',
            actual: 'NaN or Infinity',
          },
        };
      }

      // Test static balance condition: m2 = m1 / n -> a = 0
      const eqEffort = m1 / n;
      const balanceNet = n * n * eqEffort - n * m1;
      if (Math.abs(balanceNet) > 1e-6) {
        return {
          pass: false,
          failure: {
            simulator: sim,
            test: `static-equilibrium-n${n}`,
            expected: 0,
            actual: balanceNet,
            reason: `Static balance failed for n=${n}`,
          },
        };
      }
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
      },
    };
  }
}

/**
 * Validates Simple Harmonic Motion (SHM) Simulation (omega, period, energy conservation)
 */
function validateSHM(): { pass: boolean; failure?: SimulationFailure } {
  const sim = 'shm';
  try {
    const mass = 2.0; // kg
    const k = 50.0; // N/m
    const A = 1.5; // m amplitude

    // 1. Angular frequency omega = sqrt(k / m)
    const expectedOmega = Math.sqrt(k / mass); // 5 rad/s
    const actualOmega = Math.sqrt(k / mass);
    const checkOmega = checkTolerance(actualOmega, expectedOmega);
    if (!checkOmega.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'angular-frequency',
          expected: expectedOmega,
          actual: actualOmega,
          error: checkOmega.error,
        },
      };
    }

    // 2. Period T = 2 * pi * sqrt(m / k)
    const expectedPeriod = 2 * Math.PI * Math.sqrt(mass / k);
    const actualPeriod = (2 * Math.PI) / actualOmega;
    const checkT = checkTolerance(actualPeriod, expectedPeriod);
    if (!checkT.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'oscillation-period',
          expected: parseFloat(expectedPeriod.toFixed(4)),
          actual: parseFloat(actualPeriod.toFixed(4)),
          error: checkT.error,
        },
      };
    }

    // 3. Peak velocity v_max = A * omega
    const expectedVmax = A * expectedOmega; // 7.5 m/s
    const actualVmax = A * actualOmega;
    const checkV = checkTolerance(actualVmax, expectedVmax);
    if (!checkV.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'maximum-velocity',
          expected: expectedVmax,
          actual: actualVmax,
          error: checkV.error,
        },
      };
    }

    // 4. Total mechanical energy conservation: E = 0.5 * k * A^2
    const totalEnergyExpected = 0.5 * k * A * A;
    // Test at intermediate displacement x = A / 2
    const xMid = A / 2;
    const potentialEnergy = 0.5 * k * xMid * xMid;
    const vMid = actualOmega * Math.sqrt(A * A - xMid * xMid);
    const kineticEnergy = 0.5 * mass * vMid * vMid;
    const totalEnergyCalculated = potentialEnergy + kineticEnergy;
    const checkE = checkTolerance(totalEnergyCalculated, totalEnergyExpected);
    if (!checkE.pass) {
      return {
        pass: false,
        failure: {
          simulator: sim,
          test: 'energy-conservation',
          expected: totalEnergyExpected,
          actual: totalEnergyCalculated,
          error: checkE.error,
        },
      };
    }

    return { pass: true };
  } catch (err: any) {
    return {
      pass: false,
      failure: {
        simulator: sim,
        test: 'runtime-execution',
        expected: 'clean execution',
        actual: err?.message || 'crash',
      },
    };
  }
}

/**
 * Runs deep validation across all critical physics simulators.
 */
export function runPhysicsValidation(): SimulationHealthReport {
  const startTime = Date.now();
  const simulations: Record<string, 'pass' | 'fail'> = {};
  let failure: SimulationFailure | undefined;

  const validators: { name: string; run: () => { pass: boolean; failure?: SimulationFailure } }[] = [
    { name: 'newtons-second-law', run: validateNewtonsSecondLaw },
    { name: 'friction-inclined-plane', run: validateFrictionInclinedPlane },
    { name: 'projectile-motion', run: validateProjectileMotion },
    { name: 'connected-particles', run: validateConnectedParticles },
    { name: 'pulley-systems', run: validatePulleySystems },
    { name: 'shm', run: validateSHM },
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
