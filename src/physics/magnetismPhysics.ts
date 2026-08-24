// Magnetism and Electromagnetic Induction (Lenz's Law) Solver

export interface LenzParameters {
  magnetMass: number;      // kg (e.g. 0.1 to 0.5)
  magnetStrength: number;  // Tesla/dipole moment (e.g. 0.5 to 2.5)
  coilTurns: number;       // N (e.g. 50 to 500)
  coilResistance: number;  // Ohms (e.g. 0.5 to 10.0, or Infinity for open circuit)
  gravity: number;         // m/s^2 (e.g. 10)
}

export interface LenzState {
  magnetY: number;         // visual Y coordinate (pixels or meters)
  velocity: number;        // m/s
  acceleration: number;    // m/s^2
  inducedEMF: number;      // V
  inducedCurrent: number;  // A
  magneticForce: number;   // N (directed upwards, opposing motion)
  flux: number;            // Wb
}

// Dipole flux model along axial coordinate z
// Flux Phib = C * strength * cos(theta) = C * strength * z / sqrt(R^2 + z^2)
const COIL_RADIUS = 30; // pixels
const COIL_Y = 220;     // Y center coordinate in visual space

export function calculateLenzStep(
  y: number, 
  vy: number, 
  params: LenzParameters, 
  dt: number
): LenzState {
  const { magnetMass, magnetStrength, coilTurns, coilResistance, gravity } = params;

  // Relative coordinate z from magnet center to coil center (in visual scale meters)
  const z_scale = 0.05; // convert pixels to meters
  const z = (y - COIL_Y) * z_scale;
  const R = COIL_RADIUS * z_scale;

  // 1. Magnetic flux: Phi_B = C * strength / sqrt(R^2 + z^2)
  const C_flux = 0.01;
  const dist = Math.sqrt(R * R + z * z);
  const flux = (C_flux * magnetStrength) / dist;

  // 2. Rate of change of flux with respect to position z
  // dPhi/dz = -C * strength * z / (R^2 + z^2)^1.5
  const dPhi_dz = -(C_flux * magnetStrength * z) / Math.pow(dist, 3);

  // 3. Induced EMF: V_induced = -N * dPhi/dt = -N * dPhi/dz * dz/dt
  // dz/dt = velocity (vy)
  const inducedEMF = -coilTurns * dPhi_dz * vy;

  // 4. Induced Current: I = V_induced / Resistance (0 if open loop/resistance is infinity)
  const inducedCurrent = coilResistance === Infinity ? 0 : (inducedEMF / coilResistance);

  // 5. Retarding magnetic force: F_mag = N * I * dPhi/dz
  // Opposes the velocity direction
  const magneticForce = coilTurns * inducedCurrent * dPhi_dz; // Force matches sign from current and flux rate

  // 6. Equations of motion: F_net = m*g - F_mag - damping*v
  const damping = 0.02; // air resistance damping
  const f_grav = magnetMass * gravity;
  const f_net = f_grav + magneticForce - (damping * vy); // magneticForce is negative when vy is positive
  const acceleration = f_net / magnetMass;

  // Update Euler step
  let nextVelocity = vy + acceleration * dt;
  let nextY = y + nextVelocity * dt * 100; // convert meters back to visual pixels/sec

  // Prevent magnet from falling indefinitely (reset loop outside)
  return {
    magnetY: nextY,
    velocity: nextVelocity,
    acceleration,
    inducedEMF: parseFloat(inducedEMF.toFixed(4)),
    inducedCurrent: parseFloat(inducedCurrent.toFixed(4)),
    magneticForce: parseFloat(magneticForce.toFixed(4)),
    flux: parseFloat(flux.toFixed(5))
  };
}
