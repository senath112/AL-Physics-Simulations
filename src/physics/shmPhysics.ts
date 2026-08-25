// Scientific physics calculations for Simple Harmonic Motion (SHM)
// Using g = 10 ms-2 globally

export interface SHMState {
  displacement: number;     // meters
  velocity: number;         // m/s
  acceleration: number;     // m/s^2
  kineticEnergy: number;    // Joules
  potentialEnergy: number;  // Joules
  totalEnergy: number;      // Joules
  isOverdamped: boolean;
  isCriticallyDamped: boolean;
}

export interface SHMParameters {
  mode: 'spring' | 'pendulum';
  mass: number;             // kg
  springK: number;          // N/m
  length: number;           // meters
  gravity: number;          // m/s^2 (always 10)
  damping: number;          // b (damping coefficient N s/m)
  amplitude: number;        // initial amplitude (m or rad)
}

// Calculate the state at time t
export function calculateSHMState(t: number, params: SHMParameters): SHMState {
  const { mode, mass, springK, length, gravity, damping, amplitude } = params;

  // 1. Calculate natural angular frequency omega_0
  const omega0 = mode === 'spring' ? Math.sqrt(springK / mass) : Math.sqrt(gravity / length);
  const mEff = mode === 'spring' ? mass : mass * length * length; // Effective mass/rotational inertia for energy
  const kEff = mode === 'spring' ? springK : mass * gravity * length; // Effective spring constant

  // Damping terms
  // b_crit = 2 * sqrt(m * k)
  const gamma = damping / (mode === 'spring' ? mass : mass * length); // damping rate
  const beta = gamma / 2;

  let displacement = 0;
  let velocity = 0;
  let acceleration = 0;
  let isOverdamped = false;
  let isCriticallyDamped = false;

  if (damping === 0) {
    // Undamped SHM: x(t) = A * cos(omega0 * t)
    displacement = amplitude * Math.cos(omega0 * t);
    velocity = -amplitude * omega0 * Math.sin(omega0 * t);
    acceleration = -omega0 * omega0 * displacement;
  } else {
    const discriminant = beta * beta - omega0 * omega0;

    if (discriminant < -1e-6) {
      // Underdamped: x(t) = A * e^(-beta * t) * cos(omega_d * t)
      const omegaD = Math.sqrt(omega0 * omega0 - beta * beta);
      const expTerm = Math.exp(-beta * t);
      // Phase constant phi so that x(0) = amplitude, v(0) = 0
      // A_d = amplitude / cos(phi) where tan(phi) = -beta / omegaD
      const phi = Math.atan(-beta / omegaD);
      const adjAmplitude = amplitude / Math.cos(phi);

      displacement = adjAmplitude * expTerm * Math.cos(omegaD * t + phi);
      // Derivative of x(t)
      velocity = adjAmplitude * expTerm * (-beta * Math.cos(omegaD * t + phi) - omegaD * Math.sin(omegaD * t + phi));
      acceleration = -2 * beta * velocity - omega0 * omega0 * displacement;
    } else if (discriminant > 1e-6) {
      // Overdamped
      isOverdamped = true;
      const r = Math.sqrt(discriminant);
      const l1 = -beta + r;
      const l2 = -beta - r;
      // Coefficients for x(0) = amplitude, v(0) = 0
      const C1 = (amplitude * l2) / (l2 - l1);
      const C2 = amplitude - C1;

      displacement = C1 * Math.exp(l1 * t) + C2 * Math.exp(l2 * t);
      velocity = C1 * l1 * Math.exp(l1 * t) + C2 * l2 * Math.exp(l2 * t);
      acceleration = -2 * beta * velocity - omega0 * omega0 * displacement;
    } else {
      // Critically Damped
      isCriticallyDamped = true;
      const C1 = amplitude;
      const C2 = beta * amplitude;

      displacement = (C1 + C2 * t) * Math.exp(-beta * t);
      velocity = (C2 - beta * (C1 + C2 * t)) * Math.exp(-beta * t);
      acceleration = -2 * beta * velocity - omega0 * omega0 * displacement;
    }
  }

  // Energy Calculations
  let kineticEnergy = 0;
  let potentialEnergy = 0;

  if (mode === 'spring') {
    kineticEnergy = 0.5 * mass * velocity * velocity;
    potentialEnergy = 0.5 * springK * displacement * displacement;
  } else {
    // Pendulum (rotational or simple height-based energy)
    // height h = L * (1 - cos(theta))
    // using approximation h = L * theta^2 / 2 for consistency with linear SHM potential energy
    kineticEnergy = 0.5 * mEff * velocity * velocity; // 0.5 * I * omega^2
    potentialEnergy = 0.5 * kEff * displacement * displacement;
  }

  const totalEnergy = kineticEnergy + potentialEnergy;

  return {
    displacement,
    velocity,
    acceleration,
    kineticEnergy,
    potentialEnergy,
    totalEnergy,
    isOverdamped,
    isCriticallyDamped
  };
}
