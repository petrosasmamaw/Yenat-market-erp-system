import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveInterval } from '../store/erpSlice';
import { formatCurrency } from '../utils/formatters';
import { filterByInterval } from '../utils/financeLedger';
import { IntervalFilter } from '../types/erp';
import {
  TrendingUp,
  Award,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sales, transactions, activeInterval, currency, usdToEtbRate } = useAppSelector(
    state => state.erp
  );

  const filteredSales = filterByInterval(sales, activeInterval);
  const filteredTransactions = filterByInterval(transactions, activeInterval);

  // Interval labels
  const intervalLabels: { id: IntervalFilter; label: string }[] = [
    { id: '1day', label: '1 Day (Today)' },
    { id: '1week', label: '1 Week' },
    { id: '2weeks', label: '2 Weeks' },
    { id: '1month', label: '1 Month' },
    { id: '3months', label: '3 Months' },
    { id: 'all', label: 'All Time' }
  ];

  // Totals
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalBatchCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const totalGrossProfit = filteredSales.reduce((sum, s) => sum + s.totalProfit, 0);
  const overallMargin =
    totalSalesRevenue > 0
      ? Math.round((totalGrossProfit / totalSalesRevenue) * 1000) / 10
      : 0;

  // Best selling products ranking
  interface ProductAgg {
    productId: string;
    productName: string;
    totalQuantity: number;
    unit: string;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  }

  const productMap = new Map<string, ProductAgg>();

  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.itemTotal;
        existing.totalCost += item.costPrice * item.quantity;
        existing.totalProfit += item.itemProfit;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.quantity,
          unit: item.unit,
          totalRevenue: item.itemTotal,
          totalCost: item.costPrice * item.quantity,
          totalProfit: item.itemProfit
        });
      }
    }
  }

  const topProducts = Array.from(productMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  // Inflow vs Outflow
  const totalInflow = filteredTransactions
    .filter(t => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner with Interval Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Sales & Batch Profit Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Analyze gross margins, top revenue drivers (Berbere, Siga, Kibe, Injera), and cash flows.
          </p>
        </div>

        {/* Interval Filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/80 rounded-lg shrink-0">
          {intervalLabels.map(item => (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveInterval(item.id))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeInterval === item.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-medium text-neutral-500 mb-2">Total Sales Revenue</div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalSalesRevenue, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Across {filteredSales.length} customer sales
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-medium text-neutral-500 mb-2">Batch Cost Basis (COGS)</div>
          <div className="text-2xl font-bold font-mono text-neutral-700 tabular-nums">
            {formatCurrency(totalBatchCost, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Calculated from specific batch purchase prices
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-medium text-neutral-500 mb-2">Gross Profit Earned</div>
          <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            {formatCurrency(totalGrossProfit, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">
            Overall Margin: <span className="font-mono font-bold">{overallMargin}%</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="text-xs font-medium text-neutral-500 mb-2">Cash Inflow vs Outflow</div>
          <div className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
            +{formatCurrency(totalInflow, currency, usdToEtbRate)}
          </div>
          <div className="text-xs font-mono text-neutral-500 mt-1">
            -{formatCurrency(totalOutflow, currency, usdToEtbRate)}
          </div>
        </div>
      </div>

      {/* Visual Charts Comparison: Revenue & Margin Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Revenue vs Cost Visual Bar Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-800" />
              <span>Revenue vs Batch Cost Comparison</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visual breakdown of gross profit retained by top products in this interval
            </p>
          </div>

          <div className="space-y-4">
            {topProducts.slice(0, 5).map(item => {
              const profitPct = item.totalRevenue > 0
                ? Math.round((item.totalProfit / item.totalRevenue) * 100)
                : 0;

              return (
                <div key={item.productId} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900">{item.productName}</span>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      ${item.totalRevenue.toFixed(2)}
                    </span>
                  </div>

                  {/* Stacked bar: Cost (Amber) vs Profit (Emerald) */}
                  <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - profitPct}%` }}
                      className="bg-neutral-400 h-full"
                      title={`Cost: $${item.totalCost.toFixed(2)}`}
                    />
                    <div
                      style={{ width: `${profitPct}%` }}
                      className="bg-emerald-700 h-full"
                      title={`Profit: $${item.totalProfit.toFixed(2)}`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span>
                      Cost: ${item.totalCost.toFixed(2)} ({100 - profitPct}%)
                    </span>
                    <span className="text-emerald-800 font-semibold font-mono">
                      Profit: +${item.totalProfit.toFixed(2)} ({profitPct}% margin)
                    </span>
                  </div>
                </div>
              );
            })}

            {topProducts.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400">
                No sales recorded in this interval to graph.
              </div>
            )}
          </div>
        </div>

        {/* Right: Cash Inflow vs Outflow Balance Meter */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <span>Cash Flow Inflow & Outflow Ratio</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comparison of operating deposits vs inventory & operating expenses
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-900 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Total Inflow (Sales & Deposits)</span>
                </span>
                <span className="font-mono font-bold text-emerald-950">
                  {formatCurrency(totalInflow, currency, usdToEtbRate)}
                </span>
              </div>
              <div className="h-4 w-full bg-neutral-100 rounded-lg overflow-hidden">
                <div
                  style={{
                    width: `${
                      totalInflow + totalOutflow > 0
                        ? Math.min(100, Math.round((totalInflow / (totalInflow + totalOutflow)) * 100))
                        : 50
                    }%`
                  }}
                  className="bg-emerald-800 h-full rounded-lg"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-900 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                  <span>Total Outflow (Cattle, Teff, Rent, Wages)</span>
                </span>
                <span className="font-mono font-bold text-neutral-900">
                  {formatCurrency(totalOutflow, currency, usdToEtbRate)}
                </span>
              </div>
              <div className="h-4 w-full bg-neutral-100 rounded-lg overflow-hidden">
                <div
                  style={{
                    width: `${
                      totalInflow + totalOutflow > 0
                        ? Math.min(100, Math.round((totalOutflow / (totalInflow + totalOutflow)) * 100))
                        : 50
                    }%`
                  }}
                  className="bg-amber-700 h-full rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
            <strong>Operating Ratio:</strong> For every $1.00 spent on inventory and operations, the store generated{' '}
            <span className="font-mono font-bold text-emerald-900">
              ${totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : '1.00'}
            </span>{' '}
            in retail receipts.
          </div>
        </div>
      </div>

      {/* Detailed Top Selling Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Top Performing Items (Berbere, Siga, Kibe, Injera & Market Goods)</span>
          </h2>
          <span className="text-xs text-neutral-500">
            Ranked by total sales revenue in selected interval
          </span>
        </div>

        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Batch Cost Basis</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {topProducts.map((item, idx) => {
                const marginPct =
                  item.totalRevenue > 0
                    ? Math.round((item.totalProfit / item.totalRevenue) * 1000) / 10
                    : 0;

                return (
                  <tr key={item.productId} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-500">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">
                      {item.productName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {item.totalQuantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      ${item.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-600 tabular-nums">
                      ${item.totalCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900 tabular-nums">
                      +${item.totalProfit.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {marginPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {topProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-400">
            No sales data available in this time interval.
          </div>
        )}
      </div>
    </div>
  );
};
