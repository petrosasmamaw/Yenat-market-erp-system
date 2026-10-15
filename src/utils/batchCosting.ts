export interface BatchCostInput {
  salePrice: number;
  batchCostPrice: number;
  quantity: number;
}

export interface BatchProfitResult {
  revenue: number;
  cost: number;
  profit: number;
  profitMarginPercent: number;
}

/**
 * Calculates revenue, cost, profit, and margin for a sold batch.
 */
export function calculateBatchProfit(input: BatchCostInput): BatchProfitResult {
  const { salePrice, batchCostPrice, quantity } = input;
  const revenue = Math.round(salePrice * quantity * 100) / 100;
  const cost = Math.round(batchCostPrice * quantity * 100) / 100;
  const profit = Math.round((revenue - cost) * 100) / 100;
  const profitMarginPercent = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

  return {
    revenue,
    cost,
    profit,
    profitMarginPercent
  };
}

export interface OxYieldCut {
  name: string;
  weightLbs: number;
  targetSellingPricePerLb: number;
}

export interface OxBreakdownInput {
  oxPurchaseCost: number;
  processingCost?: number;
  cuts: OxYieldCut[];
}

export interface OxCutResult {
  name: string;
  weightLbs: number;
  costPerLb: number;
  totalCutCost: number;
  targetSellingPricePerLb: number;
  projectedRevenue: number;
  projectedProfit: number;
}

/**
 * Breakdown an Ox / Whole primal into individual meat cuts.
 * Distributes total animal purchase and butchery fee proportionally by weight.
 */
export function calculateOxBreakdown(input: OxBreakdownInput): {
  totalCost: number;
  totalWeightLbs: number;
  averageCostPerLb: number;
  cuts: OxCutResult[];
  projectedTotalRevenue: number;
  projectedTotalProfit: number;
} {
  const totalCost = (input.oxPurchaseCost || 0) + (input.processingCost || 0);
  const totalWeightLbs = input.cuts.reduce((sum, cut) => sum + (cut.weightLbs || 0), 0);

  if (totalWeightLbs <= 0) {
    throw new Error('Total weight of meat cuts must be greater than zero');
  }

  const averageCostPerLb = Math.round((totalCost / totalWeightLbs) * 100) / 100;

  let projectedTotalRevenue = 0;
  const cuts: OxCutResult[] = input.cuts.map(cut => {
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

export interface InjeraBakingInput {
  teffFlourCost: number;
  waterAndGasCost: number;
  packagingLaborCost: number;
  packsProduced: number;
  sellingPricePerPack: number;
}

/**
 * Calculates in-house injera bakery production cost per pack.
 */
export function calculateInjeraProductionCost(input: InjeraBakingInput) {
  const totalProductionCost =
    Math.round((input.teffFlourCost + input.waterAndGasCost + input.packagingLaborCost) * 100) / 100;

  if (input.packsProduced <= 0) {
    throw new Error('Number of injera packs produced must be greater than zero');
  }

  const costPerPack = Math.round((totalProductionCost / input.packsProduced) * 100) / 100;
  const totalProjectedRevenue = Math.round(input.packsProduced * input.sellingPricePerPack * 100) / 100;
  const projectedProfit = Math.round((totalProjectedRevenue - totalProductionCost) * 100) / 100;

  return {
    totalProductionCost,
    costPerPack,
    totalProjectedRevenue,
    projectedProfit,
    marginPercent:
      totalProjectedRevenue > 0
        ? Math.round((projectedProfit / totalProjectedRevenue) * 1000) / 10
        : 0
  };
}
