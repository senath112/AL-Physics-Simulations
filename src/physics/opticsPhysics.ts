export interface OpticsParameters {
  mode: 'reflection' | 'refraction' | 'tir' | 'fibre';
  n1: number; // Refractive index of medium 1
  n2: number; // Refractive index of medium 2
  incidentAngle: number; // Incident angle in degrees (0 to 90)
  nCore?: number; // Core index for fibre
  nCladding?: number; // Cladding index for fibre
}

export interface RayState {
  incidentAngleRad: number;
  refractedAngleRad: number | null; // null if TIR occurs
  criticalAngleRad: number | null; // null if n1 <= n2
  isTIR: boolean;
  snellsEquationText: string;
  explanation: string;
}

/**
 * Calculates ray angles and states for reflection, refraction, and TIR.
 */
export function calculateRayState(params: OpticsParameters): RayState {
  const { mode, n1, n2, incidentAngle } = params;
  const incidentAngleRad = (incidentAngle * Math.PI) / 180;
  
  let refractedAngleRad: number | null = null;
  let criticalAngleRad: number | null = null;
  let isTIR = false;
  let snellsEquationText = '';
  let explanation = '';

  // Calculate critical angle if traveling from denser to rarer medium
  if (n1 > n2) {
    criticalAngleRad = Math.asin(n2 / n1);
  }

  if (mode === 'reflection') {
    explanation = `For reflection, the angle of incidence equals the angle of reflection: θi = θr = ${incidentAngle.toFixed(1)}°. The medium index does not change.`;
    snellsEquationText = `\\theta_i = \\theta_r = ${incidentAngle.toFixed(1)}^\\circ`;
  } else if (mode === 'refraction' || mode === 'tir') {
    const sinRefracted = (n1 * Math.sin(incidentAngleRad)) / n2;

    if (sinRefracted > 1) {
      isTIR = true;
      refractedAngleRad = null;
      const criticalAngleDeg = criticalAngleRad ? (criticalAngleRad * 180) / Math.PI : 0;
      explanation = `Total Internal Reflection (TIR) occurs because the angle of incidence (${incidentAngle.toFixed(1)}°) exceeds the critical angle (${criticalAngleDeg.toFixed(1)}°) while moving from a denser medium (n₁=${n1.toFixed(2)}) to a rarer medium (n₂=${n2.toFixed(2)}).`;
      snellsEquationText = `\\text{TIR Active: } \\theta_i \\ge \\theta_c \\quad (${incidentAngle.toFixed(1)}^\\circ \\ge ${criticalAngleDeg.toFixed(1)}^\\circ)`;
    } else {
      isTIR = false;
      refractedAngleRad = Math.asin(sinRefracted);
      const refractedAngleDeg = (refractedAngleRad * 180) / Math.PI;
      
      const relationship = n1 > n2 ? 'away from' : 'towards';
      explanation = `Light refracts at the boundary. Since n₁=${n1.toFixed(2)} and n₂=${n2.toFixed(2)}, the ray bends ${relationship} the normal, changing from ${incidentAngle.toFixed(1)}° to ${refractedAngleDeg.toFixed(1)}°.`;
      snellsEquationText = `${n1.toFixed(2)} \\cdot \\sin(${incidentAngle.toFixed(1)}^\\circ) = ${n2.toFixed(2)} \\cdot \\sin(${refractedAngleDeg.toFixed(1)}^\\circ)`;
    }
  }

  return {
    incidentAngleRad,
    refractedAngleRad,
    criticalAngleRad,
    isTIR,
    snellsEquationText,
    explanation,
  };
}

/**
 * Traces multiple reflection points inside an optical fibre.
 */
export interface FibrePoint {
  x: number;
  y: number;
}

export function traceFibreRay(
  nAir: number,
  nCore: number,
  nCladding: number,
  entryAngleDeg: number,
  coreHalfHeight: number,
  fibreLength: number
): { points: FibrePoint[]; isGuided: boolean; explanation: string } {
  const entryAngleRad = (entryAngleDeg * Math.PI) / 180;
  
  // Refraction at the entry face
  const sinRefracted = (nAir * Math.sin(entryAngleRad)) / nCore;
  if (sinRefracted > 1) {
    return { points: [], isGuided: false, explanation: 'The ray reflects off the entry face and does not enter the fibre.' };
  }

  const alpha = Math.asin(sinRefracted); // angle inside core relative to normal of the face
  const theta = Math.PI / 2 - alpha;     // angle relative to core-cladding boundary normal

  if (nCore <= nCladding) {
    const points: FibrePoint[] = [{ x: 0, y: 0 }];
    const slope = Math.tan(alpha);
    const targetY = slope > 0 ? coreHalfHeight : -coreHalfHeight;
    const dx = targetY / slope;
    points.push({ x: dx, y: targetY });
    points.push({ x: dx + 50, y: targetY + (slope > 0 ? 30 : -30) });

    return {
      points,
      isGuided: false,
      explanation: `The optical fibre is NOT working. Since the core refractive index (n_core=${nCore.toFixed(2)}) is less than or equal to the cladding index (n_cladding=${nCladding.toFixed(2)}), Total Internal Reflection cannot occur. Light immediately escapes into the cladding.`
    };
  }

  const criticalAngle = Math.asin(nCladding / nCore);
  const isGuided = theta >= criticalAngle;

  const points: FibrePoint[] = [];
  // Starting point at the center of the entry face (x = 0, y = 0)
  points.push({ x: 0, y: 0 });

  let currentX = 0;
  let currentY = 0;
  let slope = Math.tan(alpha); // dy/dx = tan(alpha)

  // Trace bounces down the fibre length
  const maxBounces = 12;
  let bounce = 0;

  while (currentX < fibreLength && bounce < maxBounces) {
    // Find next intersection with y = coreHalfHeight or y = -coreHalfHeight
    const targetY = slope > 0 ? coreHalfHeight : -coreHalfHeight;
    const dx = (targetY - currentY) / slope;
    const nextX = currentX + dx;

    if (nextX > fibreLength) {
      // Ray exits the end of the fibre
      const finalY = currentY + slope * (fibreLength - currentX);
      points.push({ x: fibreLength, y: finalY });
      break;
    }

    currentX = nextX;
    currentY = targetY;
    points.push({ x: currentX, y: currentY });

    if (!isGuided) {
      // Escapes into cladding at the first bounce
      // Draw escaping ray
      const exitX = currentX + 50;
      const exitY = currentY + (slope > 0 ? 30 : -30);
      points.push({ x: exitX, y: exitY });
      break;
    }

    // Reflect inside core
    slope = -slope;
    bounce++;
  }

  const critAngleDeg = (criticalAngle * 180) / Math.PI;
  const thetaDeg = (theta * 180) / Math.PI;
  const acceptanceAngleMax = (Math.asin(Math.sqrt(nCore * nCore - nCladding * nCladding)) * 180) / Math.PI;

  const explanation = isGuided
    ? `The ray is guided because the angle of incidence at the cladding boundary (${thetaDeg.toFixed(1)}°) is greater than the critical angle (${critAngleDeg.toFixed(1)}°). Continuous Total Internal Reflection occurs inside the core. Maximum acceptance angle is ${acceptanceAngleMax.toFixed(1)}°.`
    : `The ray escapes into the cladding because the angle of incidence at the boundary (${thetaDeg.toFixed(1)}°) is less than the critical angle (${critAngleDeg.toFixed(1)}°). The entry angle exceeds the fibre's acceptance angle (${acceptanceAngleMax.toFixed(1)}°).`;

  return { points, isGuided, explanation };
}
