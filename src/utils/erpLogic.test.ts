import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBatchProfit,
  calculateOxBreakdown,
  calculateInjeraProductionCost
} from './batchCosting.ts';
import {
  canDebitBalance,
  calculateCashFlowSummary,
  filterByInterval
} from './financeLedger.ts';
import { getExpiryStatus } from './expiryAlerts.ts';

test('calculateBatchProfit: handles different batch cost prices accurately', () => {
  // Batch 1: Berbere bought at $3.50/lb, sold 10 lbs at $7.00/lb
  const batch1 = calculateBatchProfit({
    salePrice: 7.0,
    batchCostPrice: 3.5,
    quantity: 10
  });
  assert.equal(batch1.revenue, 70);
  assert.equal(batch1.cost, 35);
  assert.equal(batch1.profit, 35);
  assert.equal(batch1.profitMarginPercent, 50);

  // Batch 2: Berbere bought at $4.00/lb next week, sold 10 lbs at $7.00/lb
  const batch2 = calculateBatchProfit({
    salePrice: 7.0,
    batchCostPrice: 4.0,
    quantity: 10
  });
  assert.equal(batch2.revenue, 70);
  assert.equal(batch2.cost, 40);
  assert.equal(batch2.profit, 30);
  assert.equal(batch2.profitMarginPercent, 42.9);
});

test('calculateOxBreakdown: properly distributes animal cost over butchered meat cuts', () => {
  const result = calculateOxBreakdown({
    oxPurchaseCost: 1500,
    processingCost: 100, // Total $1600
    cuts: [
      { name: 'Siga Tibs', weightLbs: 100, targetSellingPricePerLb: 9.99 },
      { name: 'Kitfo Cut', weightLbs: 60, targetSellingPricePerLb: 11.50 },
      { name: 'Kurt Cut', weightLbs: 40, targetSellingPricePerLb: 10.00 },
      { name: 'Short Ribs', weightLbs: 50, targetSellingPricePerLb: 7.50 },
      { name: 'Soup Bone', weightLbs: 70, targetSellingPricePerLb: 3.50 }
    ]
  });

  assert.equal(result.totalCost, 1600);
  assert.equal(result.totalWeightLbs, 320);
  assert.equal(result.averageCostPerLb, 5.00); // 1600 / 320 = 5.00
  assert.equal(result.cuts.length, 5);
  // Tibs cut cost: 100 lbs * $5.00 = $500
  assert.equal(result.cuts[0].totalCutCost, 500);
  assert.equal(result.cuts[0].projectedRevenue, 999);
  assert.equal(result.cuts[0].projectedProfit, 499);
});

test('calculateInjeraProductionCost: calculates unit cost per baked pack', () => {
  const result = calculateInjeraProductionCost({
    teffFlourCost: 120, // 50kg bag
    waterAndGasCost: 15,
    packagingLaborCost: 25,
    packsProduced: 80, // 80 packs of 5 injeras
    sellingPricePerPack: 4.50
  });

  assert.equal(result.totalProductionCost, 160);
  assert.equal(result.costPerPack, 2.00); // $160 / 80 packs = $2.00/pack
  assert.equal(result.totalProjectedRevenue, 360);
  assert.equal(result.projectedProfit, 200);
});

test('canDebitBalance: enforces non-negative balance requirement', () => {
  const currentBalance = 500;
  assert.equal(canDebitBalance(currentBalance, 300), true); // Leaves $200
  assert.equal(canDebitBalance(currentBalance, 500), true); // Leaves $0
  assert.equal(canDebitBalance(currentBalance, 501), false); // Would be negative
  assert.equal(canDebitBalance(currentBalance, -50), false); // Invalid negative debit
});

test('calculateCashFlowSummary: sums inflows, outflows, and net flow', () => {
  const transactions = [
    { id: '1', type: 'in' as const, amount: 450, category: 'Sales', description: 'POS cash deposit', timestamp: '2026-10-15T10:00:00Z' },
    { id: '2', type: 'out' as const, amount: 200, category: 'Stock Purchase', description: 'Bought Teff flour', timestamp: '2026-10-15T11:00:00Z' },
    { id: '3', type: 'out' as const, amount: 100, category: 'Utility', description: 'Power bill payment', timestamp: '2026-10-15T11:30:00Z' }
  ];

  const summary = calculateCashFlowSummary(transactions);
  assert.equal(summary.totalInflow, 450);
  assert.equal(summary.totalOutflow, 300);
  assert.equal(summary.netFlow, 150);
});

test('filterByInterval: filters items accurately for 1day, 1week, 2weeks, 1month, 3months', () => {
  const refDate = new Date('2026-10-15T12:00:00Z');
  const items = [
    { id: 'today', timestamp: '2026-10-15T10:00:00Z' },
    { id: '3daysAgo', timestamp: '2026-10-12T10:00:00Z' },
    { id: '10daysAgo', timestamp: '2026-10-05T10:00:00Z' },
    { id: '25daysAgo', timestamp: '2026-09-20T10:00:00Z' },
    { id: '60daysAgo', timestamp: '2026-08-16T10:00:00Z' },
    { id: '120daysAgo', timestamp: '2026-06-17T10:00:00Z' }
  ];

  const oneDay = filterByInterval(items, '1day', refDate);
  assert.equal(oneDay.length, 1);
  assert.equal(oneDay[0].id, 'today');

  const oneWeek = filterByInterval(items, '1week', refDate);
  assert.equal(oneWeek.length, 2);

  const twoWeeks = filterByInterval(items, '2weeks', refDate);
  assert.equal(twoWeeks.length, 3);

  const oneMonth = filterByInterval(items, '1month', refDate);
  assert.equal(oneMonth.length, 4);

  const threeMonths = filterByInterval(items, '3months', refDate);
  assert.equal(threeMonths.length, 5);
});

test('getExpiryStatus: flags URGENT, WARNING, EXPIRED and HEALTHY correctly', () => {
  const today = new Date('2026-10-15T12:00:00Z');

  // Expired 2 days ago
  const expStatus1 = getExpiryStatus('2026-10-13', today);
  assert.equal(expStatus1.severity, 'EXPIRED');

  // Expires tomorrow (1 day) -> URGENT
  const expStatus2 = getExpiryStatus('2026-10-16', today);
  assert.equal(expStatus2.severity, 'URGENT');

  // Expires in 5 days -> WARNING
  const expStatus3 = getExpiryStatus('2026-10-20', today);
  assert.equal(expStatus3.severity, 'WARNING');

  // Expires in 30 days -> HEALTHY
  const expStatus4 = getExpiryStatus('2026-11-14', today);
  assert.equal(expStatus4.severity, 'HEALTHY');
});
