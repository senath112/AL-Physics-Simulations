// Photoelectric Effect Physics Solver

export interface PhotoelectricParameters {
  wavelength: number; // nm (e.g. 200 to 800)
  intensity: number;  // % (e.g. 0 to 100)
  metalWorkFunction: number; // eV
  voltage: number;    // V (e.g. -6.0 to +6.0)
}

export interface PhotoelectricState {
  photonEnergy: number;      // eV
  thresholdFrequency: number; // Hz
  thresholdWavelength: number; // nm
  maxKineticEnergy: number;   // eV (0 if no emission)
  stoppingPotential: number;  // V (0 if no emission)
  photocurrent: number;      // mA
  hasEmission: boolean;
  electronVelocity: number;   // m/s
}

// Physical Constants
const h_ev_s = 4.135667696e-15; // eV s
const hc_ev_nm = 1239.84193;   // eV nm
const m_e_kg = 9.10938356e-31; // kg
const e_coulomb = 1.602176634e-19; // C

export function calculatePhotoelectricState(params: PhotoelectricParameters): PhotoelectricState {
  const { wavelength, intensity, metalWorkFunction, voltage } = params;

  // 1. Photon energy: E = hc / lambda
  const photonEnergy = hc_ev_nm / wavelength;

  // 2. Threshold criteria
  const thresholdWavelength = hc_ev_nm / metalWorkFunction;
  const thresholdFrequency = (metalWorkFunction / h_ev_s);

  const hasEmission = photonEnergy > metalWorkFunction;

  // 3. Max kinetic energy: Kmax = E - WorkFunction
  const maxKineticEnergy = hasEmission ? (photonEnergy - metalWorkFunction) : 0;

  // 4. Stopping potential eV_s = Kmax => Vs = Kmax/e
  const stoppingPotential = maxKineticEnergy; // in Volts, numerically equal to eV

  // 5. Photocurrent model
  // Saturation current is proportional to light intensity
  const isat = (intensity / 100) * 10.0; // max 10mA saturation current
  let photocurrent = 0;

  if (hasEmission) {
    if (voltage < -stoppingPotential) {
      photocurrent = 0;
    } else if (voltage >= 2.0) {
      photocurrent = isat;
    } else {
      // Smooth curve from stopping potential to saturation voltage (e.g. 2V)
      // I(V) = Isat * ((V + Vs) / (2.0 + Vs))^1.5
      const num = voltage + stoppingPotential;
      const den = 2.0 + stoppingPotential;
      photocurrent = isat * Math.pow(num / den, 1.5);
    }
  }

  // 6. Max velocity of ejected electrons: v = sqrt(2 * Kmax / m)
  // Kmax in Joules = Kmax * 1.6e-19
  const kmaxJ = maxKineticEnergy * e_coulomb;
  const electronVelocity = maxKineticEnergy > 0 ? Math.sqrt((2 * kmaxJ) / m_e_kg) : 0;

  return {
    photonEnergy,
    thresholdFrequency,
    thresholdWavelength,
    maxKineticEnergy,
    stoppingPotential,
    photocurrent: parseFloat(photocurrent.toFixed(3)),
    hasEmission,
    electronVelocity
  };
}
