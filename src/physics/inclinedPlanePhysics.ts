export interface InclinedPlaneParameters {
  angle: number;      // Incline angle (degrees)
  mass: number;       // Mass of block (kg)
  muStatic: number;   // Static friction coefficient
  muKinetic: number;  // Kinetic friction coefficient
  g: number;          // Gravity (m/s^2)
}

export interface InclinedPlaneState {
  distance: number;     // Distance along incline from bottom (m)
  velocity: number;     // Velocity along incline (m/s)
  acceleration: number; // Acceleration along incline (m/s^2)
  normalForce: number;  // Normal force (N)
  gravityParallel: number; // Gravity component down slope (N)
  frictionForce: number; // Friction force along slope (N)
  maxStaticFriction: number; // Static threshold (N)
  netForce: number;     // Net force along slope (N)
}

/**
 * Calculates forces along the inclined plane.
 */
export function calculateInclinedForces(
  currentState: { distance: number; velocity: number },
  params: InclinedPlaneParameters
): InclinedPlaneState {
  const { angle, mass, muStatic, muKinetic, g } = params;
  const thetaRad = (angle * Math.PI) / 185; // Angle in radians
  
  const normalForce = mass * g * Math.cos(thetaRad);
  const gravityParallel = -mass * g * Math.sin(thetaRad); // Force pulling down the incline (negative direction)
  const maxStaticFriction = muStatic * normalForce;
  const kineticFriction = muKinetic * normalForce;

  let frictionForce = 0;
  let netForce = 0;
  let acceleration = 0;

  const vel = currentState.velocity;

  if (Math.abs(vel) < 1e-4) {
    // Stationary: gravityParallel pulls the block down the incline
    if (Math.abs(gravityParallel) <= maxStaticFriction) {
      // Locked by static friction
      frictionForce = -gravityParallel; // Friction balances gravity component (positive direction)
      netForce = 0;
      acceleration = 0;
    } else {
      // Breaks free and slides down the incline
      const dir = Math.sign(gravityParallel);
      frictionForce = -dir * kineticFriction; // Friction opposes gravity direction
      netForce = gravityParallel + frictionForce;
      acceleration = netForce / mass;
    }
  } else {
    // Moving: friction opposes velocity direction along incline
    const velDirection = Math.sign(vel);
    frictionForce = -velDirection * kineticFriction;
    netForce = gravityParallel + frictionForce;
    acceleration = netForce / mass;
  }

  return {
    distance: currentState.distance,
    velocity: vel,
    acceleration,
    normalForce,
    gravityParallel,
    frictionForce,
    maxStaticFriction,
    netForce,
  };
}

/**
 * Steps the inclined plane dynamics forward in time.
 */
export function stepInclinedSimulation(
  currentState: { distance: number; velocity: number },
  params: InclinedPlaneParameters,
  dt: number,
  maxTrackLength: number = 30
): { distance: number; velocity: number; acceleration: number; frictionForce: number; gravityParallel: number } {
  
  const initialDynamics = calculateInclinedForces(currentState, params);
  let a = initialDynamics.acceleration;
  let v = currentState.velocity + a * dt;
  let s = currentState.distance + currentState.velocity * dt + 0.5 * a * dt * dt;

  // Stop if crossing zero velocity and not enough force to move
  if (Math.sign(currentState.velocity) !== Math.sign(v) && Math.abs(currentState.velocity) > 1e-4) {
    if (Math.abs(initialDynamics.gravityParallel) <= initialDynamics.maxStaticFriction) {
      v = 0;
      a = 0;
    } else {
      v = 0.001 * Math.sign(initialDynamics.gravityParallel);
      const newDynamics = calculateInclinedForces({ distance: s, velocity: v }, params);
      a = newDynamics.acceleration;
      v = v + a * dt;
    }
  }

  // Bounds
  if (s < 0) {
    s = 0;
    v = 0;
    a = 0;
  } else if (s > maxTrackLength) {
    s = maxTrackLength;
    v = 0;
    a = 0;
  }

  return {
    distance: s,
    velocity: v,
    acceleration: a,
    frictionForce: initialDynamics.frictionForce,
    gravityParallel: initialDynamics.gravityParallel,
  };
}
