// Thermal Physics and Thermodynamics Solver

export interface GasState {
  pressure: number;
  volume: number;
  temperature: number;
  molecules: number;
}

export interface CalorimetryParameters {
  liquidMass: number;      // g
  liquidTemp: number;      // °C
  liquidSpecificHeat: number; // J/g°C (e.g. Water = 4.18)
  solidMass: number;       // g
  solidTemp: number;       // °C
  solidSpecificHeat: number;  // J/g°C (e.g. Copper = 0.385)
}

export interface CalorimetryResult {
  finalTemp: number;
  liquidHeatChange: number; // J
  solidHeatChange: number;  // J
}

export interface ExpansionParameters {
  material: 'copper' | 'steel' | 'glass' | 'aluminum';
  initialLength: number;   // m
  tempChange: number;      // °C
}

export interface ExpansionResult {
  coefficient: number;     // /°C
  deltaLength: number;     // m
  finalLength: number;     // m
}

// 1. Gas Laws solver: P = N * T / V (using arbitrary scaling for clean visuals)
export function calculateGasState(N: number, V: number, T: number): GasState {
  const scaling = 0.05; // arbitrary scaling factor
  const pressure = (N * T * scaling) / V;
  return {
    pressure: parseFloat(pressure.toFixed(2)),
    volume: V,
    temperature: T,
    molecules: N
  };
}

// 2. Calorimetry solver: m1 * c1 * (T_f - T1) + m2 * c2 * (T_f - T2) = 0
export function solveCalorimetry(params: CalorimetryParameters): CalorimetryResult {
  const { liquidMass, liquidTemp, liquidSpecificHeat, solidMass, solidTemp, solidSpecificHeat } = params;

  // T_f = (m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)
  const num = (liquidMass * liquidSpecificHeat * liquidTemp) + (solidMass * solidSpecificHeat * solidTemp);
  const den = (liquidMass * liquidSpecificHeat) + (solidMass * solidSpecificHeat);
  const finalTemp = num / den;

  const liquidHeatChange = liquidMass * liquidSpecificHeat * (finalTemp - liquidTemp);
  const solidHeatChange = solidMass * solidSpecificHeat * (finalTemp - solidTemp);

  return {
    finalTemp: parseFloat(finalTemp.toFixed(2)),
    liquidHeatChange: parseFloat(liquidHeatChange.toFixed(1)),
    solidHeatChange: parseFloat(solidHeatChange.toFixed(1))
  };
}

// 3. Thermal Expansion solver: dL = L * alpha * dT
const EXPANSION_COEFFICIENTS = {
  copper: 16.5e-6,
  steel: 12.0e-6,
  glass: 8.5e-6,
  aluminum: 23.1e-6
};

export function solveThermalExpansion(params: ExpansionParameters): ExpansionResult {
  const { material, initialLength, tempChange } = params;
  const coefficient = EXPANSION_COEFFICIENTS[material];
  const deltaLength = initialLength * coefficient * tempChange;
  const finalLength = initialLength + deltaLength;

  return {
    coefficient,
    deltaLength: parseFloat(deltaLength.toFixed(6)),
    finalLength: parseFloat(finalLength.toFixed(6))
  };
}
