export interface ProjectileParameters {
  v0: number;       // Initial velocity (m/s)
  angle: number;    // Launch angle (degrees)
  h0: number;       // Initial height (m)
  g: number;        // Gravity (m/s^2)
}

export interface ProjectileState {
  x: number;        // Horizontal displacement (m)
  y: number;        // Vertical displacement (m)
  vx: number;       // Horizontal velocity component (m/s)
  vy: number;       // Vertical velocity component (m/s)
  speed: number;    // Net speed (m/s)
}

/**
 * Calculates the total flight time for a projectile.
 */
export function calculateFlightTime(params: ProjectileParameters): number {
  const { v0, angle, h0, g } = params;
  if (g <= 0) return Infinity; // No gravity means it flies indefinitely if moving upward

  const thetaRad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(thetaRad);

  // Solving: -0.5 * g * t^2 + vy0 * t + h0 = 0
  // Using quadratic formula: t = (vy0 + sqrt(vy0^2 + 2 * g * h0)) / g
  const discriminant = vy0 * vy0 + 2 * g * h0;
  if (discriminant < 0) return 0;

  return (vy0 + Math.sqrt(discriminant)) / g;
}

/**
 * Calculates the peak time when vertical velocity becomes zero.
 */
export function calculatePeakTime(params: ProjectileParameters): number {
  const { v0, angle, g } = params;
  if (g <= 0) return Infinity;
  const thetaRad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(thetaRad);
  return Math.max(0, vy0 / g);
}

/**
 * Calculates the maximum height reached by the projectile.
 */
export function calculateMaxHeight(params: ProjectileParameters): number {
  const { v0, angle, h0, g } = params;
  const tPeak = calculatePeakTime(params);
  if (tPeak <= 0) return h0;
  
  const thetaRad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(thetaRad);
  return h0 + (vy0 * vy0) / (2 * g);
}

/**
 * Calculates the horizontal range of the projectile.
 */
export function calculateRange(params: ProjectileParameters): number {
  const { v0, angle } = params;
  const tFlight = calculateFlightTime(params);
  const thetaRad = (angle * Math.PI) / 180;
  const vx0 = v0 * Math.cos(thetaRad);
  return vx0 * tFlight;
}

/**
 * Calculates the exact state of the projectile at a given time t.
 */
export function getProjectileStateAtTime(
  t: number,
  params: ProjectileParameters
): ProjectileState {
  const { v0, angle, h0, g } = params;
  const tFlight = calculateFlightTime(params);
  
  // Clamp time to flight time (stops when hitting the ground)
  const actualTime = Math.min(t, tFlight);
  
  const thetaRad = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(thetaRad);
  
  // If time exceeds flight time, projectile lies on the ground
  if (t >= tFlight) {
    return {
      x: vx * tFlight,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
    };
  }

  const vy = v0 * Math.sin(thetaRad) - g * actualTime;
  const x = vx * actualTime;
  const y = h0 + v0 * Math.sin(thetaRad) * actualTime - 0.5 * g * actualTime * actualTime;

  return {
    x,
    y: Math.max(0, y), // Cannot go below ground
    vx,
    vy,
    speed: Math.sqrt(vx * vx + vy * vy),
  };
}

/**
 * Validates analytical equations against known boundary conditions.
 * Returns true if the equations pass basic checks.
 */
export function runValidationTests(): { passed: boolean; message: string } {
  // Test case: launch from ground (h0 = 0), angle = 45 deg, v0 = 10 m/s, g = 10 m/s^2
  const params: ProjectileParameters = { v0: 10, angle: 45, h0: 0, g: 10 };
  
  const flightTime = calculateFlightTime(params);
  const maxH = calculateMaxHeight(params);
  const range = calculateRange(params);

  // Expected values from standard equations:
  // t_flight = 2 * v0 * sin(45) / g = 20 * 0.7071 / 10 = 1.414s
  // max_height = (v0 * sin(45))^2 / 2g = 50 / 20 = 2.500m
  // range = v0^2 * sin(90) / g = 100 / 10 = 10.000m

  const expectedT = (2 * 10 * Math.sin(Math.PI / 4)) / 10;
  const expectedH = Math.pow(10 * Math.sin(Math.PI / 4), 2) / (2 * 10);
  const expectedR = 100 / 10;

  const tDiff = Math.abs(flightTime - expectedT);
  const hDiff = Math.abs(maxH - expectedH);
  const rDiff = Math.abs(range - expectedR);

  const threshold = 1e-5;

  if (tDiff > threshold || hDiff > threshold || rDiff > threshold) {
    return {
      passed: false,
      message: `Validation failed: T diff = ${tDiff}, H diff = ${hDiff}, R diff = ${rDiff}`,
    };
  }

  return {
    passed: true,
    message: "Analytical projectile motion equations validated successfully.",
  };
}
