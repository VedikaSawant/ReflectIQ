/**
 * Cost Calculator Utilities
 * Compare reactive vs proactive maintenance costs for road signs
 */

// Average costs in INR (Indian Rupees)
const COSTS = {
  // Reactive: emergency replacement after sign failure
  reactive: {
    signReplacement: 15000,       // avg cost per sign
    laborEmergency: 5000,         // emergency labor crew
    trafficManagement: 8000,      // lane closures, warnings
    accidentLiability: 250000,    // estimated avg liability per incident
    accidentProbability: 0.02,    // 2% chance of an accident per failed sign
    downtime: 3000,               // cost of sign being down (safety risk)
  },
  // Proactive: planned replacement before failure
  proactive: {
    signReplacement: 12000,       // bulk purchase discount
    laborPlanned: 2500,           // planned maintenance crew
    trafficManagement: 3000,      // scheduled off-peak work
    inspectionPerSign: 200,       // cost of periodic inspection
    systemMonitoring: 50,         // AI monitoring per sign/year
  },
};

/**
 * Calculate reactive cost per sign
 */
export function reactivePerSign() {
  const r = COSTS.reactive;
  return r.signReplacement + r.laborEmergency + r.trafficManagement + r.downtime +
    (r.accidentLiability * r.accidentProbability);
}

/**
 * Calculate proactive cost per sign
 */
export function proactivePerSign() {
  const p = COSTS.proactive;
  return p.signReplacement + p.laborPlanned + p.trafficManagement + p.inspectionPerSign + p.systemMonitoring;
}

/**
 * Calculate total savings for a fleet of signs
 */
export function calculateSavings(totalSigns, criticalSigns) {
  const reactive = reactivePerSign() * criticalSigns;
  const proactive = proactivePerSign() * criticalSigns;
  const savings = reactive - proactive;
  const savingsPercent = reactive > 0 ? Math.round((savings / reactive) * 100) : 0;

  return {
    reactiveCost: reactive,
    proactiveCost: proactive,
    savings,
    savingsPercent,
    totalSigns,
    criticalSigns,
  };
}

/**
 * Format INR currency
 */
export function formatINR(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default {
  reactivePerSign,
  proactivePerSign,
  calculateSavings,
  formatINR,
};
