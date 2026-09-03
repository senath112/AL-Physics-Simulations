#!/usr/bin/env node
/**
 * Physics Simulation Validation CLI Test Runner
 * 
 * Runs deep physics validation tests across all critical physics simulators.
 * Exit Code 0: All simulation validations passed successfully.
 * Exit Code 1: One or more physics simulation validations failed.
 */

import { runPhysicsValidation } from '../server/src/validation/physicsValidator';

console.log('\n=============================================================');
console.log('🔬 Physics Simulation Health & Validation System');
console.log('=============================================================\n');

const report = runPhysicsValidation();

console.log(`Execution Time: ${report.durationMs}ms`);
console.log(`Timestamp: ${report.timestamp}\n`);
console.log('Simulations Validation Results:');

let allPassed = report.status === 'healthy';

for (const [simName, result] of Object.entries(report.simulations)) {
  const symbol = result === 'pass' ? '✅' : '❌';
  const label = result === 'pass' ? 'PASS' : 'FAIL';
  console.log(`  ${symbol} [${label}] ${simName}`);
}

console.log('\n-------------------------------------------------------------');

if (report.status === 'healthy') {
  console.log('🟢 OVERALL STATUS: HEALTHY (Exit Code 0)');
  console.log('All physics simulations validated successfully within tolerance.');
  console.log('=============================================================\n');
  process.exit(0);
} else {
  console.error('🔴 OVERALL STATUS: UNHEALTHY (Exit Code 1)');
  if (report.failure) {
    console.error(`\nFailure Diagnostics:`);
    console.error(`  Simulator: ${report.failure.simulator}`);
    console.error(`  Test:      ${report.failure.test}`);
    console.error(`  Expected:  ${report.failure.expected}`);
    console.error(`  Actual:    ${report.failure.actual}`);
    if (report.failure.error !== undefined) {
      console.error(`  Error:     ${(report.failure.error * 100).toFixed(3)}%`);
    }
    if (report.failure.reason) {
      console.error(`  Reason:    ${report.failure.reason}`);
    }
  }
  console.log('=============================================================\n');
  process.exit(1);
}
