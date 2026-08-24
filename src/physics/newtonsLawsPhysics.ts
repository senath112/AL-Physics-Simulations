export interface NewtonsLawsParameters {
  force: number;      // Applied force (N)
  mass: number;       // Mass of block (kg)
  muStatic: number;   // Static friction coefficient
  muKinetic: number;  // Kinetic friction coefficient
  g: number;          // Gravity (m/s^2)
}

export interface NewtonsLawsState {
  position: number;     // Position x (m)
  velocity: number;     // Velocity v (m/s)
  acceleration: number; // Acceleration a (m/s^2)
  normalForce: number;  // Normal force Fn (N)
  frictionForce: number; // Current friction force f (N)
  maxStaticFriction: number; // Maximum static friction limit (N)
  kineticFriction: number; // Kinetic friction (N)
  netForce: number;     // Net horizontal force (N)
}

/**
 * Calculates forces and kinematic derivatives for the sliding block.
 */
export function calculateForcesAndKinematics(
  currentState: { position: number; velocity: number },
  params: NewtonsLawsParameters
): NewtonsLawsState {
  const { force, mass, muStatic, muKinetic, g } = params;
  const normalForce = mass * g;
  const maxStaticFriction = muStatic * normalForce;
  const kineticFriction = muKinetic * normalForce;

  let frictionForce = 0;
  let netForce = 0;
  let acceleration = 0;

  const vel = currentState.velocity;

  if (Math.abs(vel) < 1e-4) {
    // Stationary case: check static friction threshold
    if (Math.abs(force) <= maxStaticFriction) {
      // Force is too weak to move the block
      frictionForce = -force;
      netForce = 0;
      acceleration = 0;
    } else {
      // Force exceeds static friction, block begins to slide
      const forceDirection = Math.sign(force);
      frictionForce = -forceDirection * kineticFriction;
      netForce = force + frictionForce;
      acceleration = netForce / mass;
    }
  } else {
    // Sliding case: kinetic friction opposes velocity direction
    const velDirection = Math.sign(vel);
    frictionForce = -velDirection * kineticFriction;
    netForce = force + frictionForce;
    
    // Check if applied force is opposing motion and kinetic friction stops the block
    acceleration = netForce / mass;
  }

  return {
    position: currentState.position,
    velocity: vel,
    acceleration,
    normalForce,
    frictionForce,
    maxStaticFriction,
    kineticFriction,
    netForce,
  };
}

/**
 * Steps the physics simulation state forward in time by dt using simple kinematic integration.
 */
export function stepNewtonsSimulation(
  currentState: { position: number; velocity: number },
  params: NewtonsLawsParameters,
  dt: number
): { position: number; velocity: number; acceleration: number; frictionForce: number; netForce: number } {
  
  const initialDynamics = calculateForcesAndKinematics(currentState, params);
  let a = initialDynamics.acceleration;
  let v = currentState.velocity + a * dt;
  let x = currentState.position + currentState.velocity * dt + 0.5 * a * dt * dt;

  // Friction stopping mechanism: if velocity crossed zero, check if it stops
  if (Math.sign(currentState.velocity) !== Math.sign(v) && Math.abs(currentState.velocity) > 1e-4) {
    // It crossed zero. In physical friction, it will stop unless applied force > static friction limit.
    if (Math.abs(params.force) <= initialDynamics.maxStaticFriction) {
      v = 0;
      a = 0;
    } else {
      // It keeps moving in the direction of the force
      v = 0.001 * Math.sign(params.force); // Give it a tiny velocity kick to restart motion
      const newDynamics = calculateForcesAndKinematics({ position: x, velocity: v }, params);
      a = newDynamics.acceleration;
      v = v + a * dt;
    }
  }

  // Bound the block within a track (e.g. 0m to 50m)
  if (x < 0) {
    x = 0;
    v = 0;
    a = 0;
  } else if (x > 50) {
    x = 50;
    v = 0;
    a = 0;
  }

  return {
    position: x,
    velocity: v,
    acceleration: a,
    frictionForce: initialDynamics.frictionForce,
    netForce: initialDynamics.netForce,
  };
}
