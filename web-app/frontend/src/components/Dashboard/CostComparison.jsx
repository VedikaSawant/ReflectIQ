import React, { useMemo } from 'react';
import { calculateSavings, formatINR } from '../../utils/costCalculator';

export default function CostComparison({ stats }) {
  const savingsData = useMemo(() => {
    if (!stats) return null;
    return calculateSavings(stats.total, stats.critical);
  }, [stats]);

  if (!savingsData) return null;

  return (
    <div className="cost-comparison">
      <div className="cost-column reactive">
        <div className="cost-label">Reactive Repair</div>
        <div className="cost-value">{formatINR(savingsData.reactiveCost)}</div>
        <div className="cost-desc">Cost if no action taken on {savingsData.criticalSigns} critical signs</div>
      </div>
      
      <div className="cost-column proactive">
        <div className="cost-label">Proactive Maintenance</div>
        <div className="cost-value">{formatINR(savingsData.proactiveCost)}</div>
        <div className="cost-desc">Targeted replacement based on AI alerts</div>
      </div>
      
      <div className="cost-savings">
        <div className="savings-value">{formatINR(savingsData.savings)} Saved</div>
        <div className="savings-label">A {savingsData.savingsPercent}% cost reduction by preventing failures</div>
      </div>
    </div>
  );
}
