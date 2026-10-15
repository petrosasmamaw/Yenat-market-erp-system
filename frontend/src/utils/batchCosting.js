function calculateBatchProfit(input) {
  const { salePrice, batchCostPrice, quantity } = input;
  const revenue = Math.round(salePrice * quantity * 100) / 100;
  const cost = Math.round(batchCostPrice * quantity * 100) / 100;
  const profit = Math.round((revenue - cost) * 100) / 100;
  const profitMarginPercent = revenue > 0 ? Math.round(profit / revenue * 1e3) / 10 : 0;
  return {
    revenue,
    cost,
    profit,
    profitMarginPercent
  };
}
function calculateOxBreakdown(input) {
  const totalCost = (input.oxPurchaseCost || 0) + (input.processingCost || 0);
  const totalWeightLbs = input.cuts.reduce((sum, cut) => sum + (cut.weightLbs || 0), 0);
  if (totalWeightLbs <= 0) {
    throw new Error("Total weight of meat cuts must be greater than zero");
  }
  const averageCostPerLb = Math.round(totalCost / totalWeightLbs * 100) / 100;
  let projectedTotalRevenue = 0;
  const cuts = input.cuts.map((cut) => {
    const totalCutCost = Math.round(cut.weightLbs * averageCostPerLb * 100) / 100;
    const projectedRevenue = Math.round(cut.weightLbs * cut.targetSellingPricePerLb * 100) / 100;
    const projectedProfit = Math.round((projectedRevenue - totalCutCost) * 100) / 100;
    projectedTotalRevenue += projectedRevenue;
    return {
      name: cut.name,
      weightLbs: cut.weightLbs,
      costPerLb: averageCostPerLb,
      totalCutCost,
      targetSellingPricePerLb: cut.targetSellingPricePerLb,
      projectedRevenue,
      projectedProfit
    };
  });
  const projectedTotalProfit = Math.round((projectedTotalRevenue - totalCost) * 100) / 100;
  return {
    totalCost,
    totalWeightLbs,
    averageCostPerLb,
    cuts,
    projectedTotalRevenue: Math.round(projectedTotalRevenue * 100) / 100,
    projectedTotalProfit
  };
}
function calculateInjeraProductionCost(input) {
  const totalProductionCost = Math.round((input.teffFlourCost + input.waterAndGasCost + input.packagingLaborCost) * 100) / 100;
  if (input.packsProduced <= 0) {
    throw new Error("Number of injera packs produced must be greater than zero");
  }
  const costPerPack = Math.round(totalProductionCost / input.packsProduced * 100) / 100;
  const totalProjectedRevenue = Math.round(input.packsProduced * input.sellingPricePerPack * 100) / 100;
  const projectedProfit = Math.round((totalProjectedRevenue - totalProductionCost) * 100) / 100;
  return {
    totalProductionCost,
    costPerPack,
    totalProjectedRevenue,
    projectedProfit,
    marginPercent: totalProjectedRevenue > 0 ? Math.round(projectedProfit / totalProjectedRevenue * 1e3) / 10 : 0
  };
}
export {
  calculateBatchProfit,
  calculateInjeraProductionCost,
  calculateOxBreakdown
};
