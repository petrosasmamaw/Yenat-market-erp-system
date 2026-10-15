import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab, setActiveInterval } from '../store/erpSlice';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { filterByInterval } from '../utils/financeLedger';
import { getExpiryStatus } from '../utils/expiryAlerts';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  ShoppingCart,
  Beef,
  Flame,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { IntervalFilter } from '../types/erp';

export const DashboardView: React.FC<{
  onOpenCashIn: () => void;
  onOpenCashOut: () => void;
}> = ({ onOpenCashIn, onOpenCashOut }) => {
  const dispatch = useAppDispatch();
  const {
    balance,
    sales,
    transactions,
    batches,
    activeInterval,
    currency,
    usdToEtbRate
  } = useAppSelector(state => state.erp);

  // Interval intervals: '1day' | '1week' | '2weeks' | '1month' | '3months' | 'all'
  const filteredSales = filterByInterval(sales, activeInterval);
  const filteredTransactions = filterByInterval(transactions, activeInterval);

  // Calculate metrics for current interval
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalGrossProfit = filteredSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const profitMarginPercent = totalSalesRevenue > 0
    ? Math.round((totalGrossProfit / totalSalesRevenue) * 1000) / 10
    : 0;

  const totalInflow = filteredTransactions
    .filter(t => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter(t => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashFlow = totalInflow - totalOutflow;

  // Expiry check
  const today = new Date();
  const batchesWithExpiry = batches
    .filter(b => b.remainingQuantity > 0)
    .map(b => ({
      batch: b,
      expiryStatus: getExpiryStatus(b.expiryDate, today)
    }))
    .sort((a, b) => a.expiryStatus.daysRemaining - b.expiryStatus.daysRemaining);

  const urgentBatches = batchesWithExpiry.filter(
    item => item.expiryStatus.severity === 'URGENT' || item.expiryStatus.severity === 'EXPIRED'
  );

  const intervalLabels: { id: IntervalFilter; label: string }[] = [
    { id: '1day', label: '1 Day (Today)' },
    { id: '1week', label: '1 Week' },
    { id: '2weeks', label: '2 Weeks' },
    { id: '1month', label: '1 Month' },
    { id: '3months', label: '3 Months' },
    { id: 'all', label: 'All History' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner: Welcome + Interval Segmented Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Yenat Market Las Vegas · Tropicana Ave
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
            Store Performance & Cash Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time batch costing, butchery & bakery yield, and cash flow balance.
          </p>
        </div>

        {/* Interval Filter Controls per user instructions */}
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

      {/* Expiry Warning Callout (If fresh meat, injera, etc. are expiring soon) */}
      {urgentBatches.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Fresh Inventory Expiry Attention ({urgentBatches.length} Batches)
              </h2>
              <div className="text-xs text-amber-900 mt-0.5">
                {urgentBatches.slice(0, 2).map((item, idx) => (
                  <span key={item.batch.id}>
                    {idx > 0 && ' · '}
                    <strong>{item.batch.productName}</strong> ({item.batch.remainingQuantity} {item.batch.unit} left — {item.expiryStatus.label})
                  </span>
                ))}
                {urgentBatches.length > 2 && ` · +${urgentBatches.length - 2} more`}
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch(setActiveTab('inventory'))}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            <span>Review Expiry Watchlist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main KPI Strip - High legibility, Tabular numbers, No nested cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Available Store Balance</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950 tabular-nums">
            {formatCurrency(balance, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between">
            <span>Guarded against negative</span>
            <button
              onClick={onOpenCashIn}
              className="font-semibold text-emerald-800 hover:underline"
            >
              + Inflow
            </button>
          </div>
        </div>

        {/* Sales Revenue in Interval */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Sales Revenue ({activeInterval})</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalSalesRevenue, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            <span className="font-semibold text-neutral-700">{filteredSales.length}</span> receipts completed
          </div>
        </div>

        {/* Gross Profit & Margin */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Gross Profit from Batches</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            {formatCurrency(totalGrossProfit, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">
            Margin: <span className="font-mono font-bold">{profitMarginPercent}%</span> calculated by batch costs
          </div>
        </div>

        {/* Net Operating Cash Flow */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Net Cash Flow ({activeInterval})</span>
            {netCashFlow >= 0 ? (
              <ArrowDownRight className="w-4 h-4 text-emerald-700" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-amber-700" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              netCashFlow >= 0 ? 'text-emerald-950' : 'text-amber-800'
            }`}
          >
            {formatCurrency(netCashFlow, currency, usdToEtbRate)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between">
            <span>In: {formatCurrency(totalInflow, currency, usdToEtbRate)}</span>
            <span>Out: {formatCurrency(totalOutflow, currency, usdToEtbRate)}</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => dispatch(setActiveTab('pos'))}
          className="p-3.5 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs"
        >
          <ShoppingCart className="w-4 h-4 text-amber-300" />
          <span>New POS Sale Register</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('production'))}
          className="p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs"
        >
          <Beef className="w-4 h-4 text-amber-700" />
          <span>Butchery Ox Breakdown</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('production'))}
          className="p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs"
        >
          <Flame className="w-4 h-4 text-amber-600" />
          <span>Bake Fresh Injera Batch</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('purchases'))}
          className="p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs"
        >
          <Clock className="w-4 h-4 text-emerald-800" />
          <span>Receive Inward Stock</span>
        </button>
      </div>

      {/* Two Column Section: Recent POS Sales & Recent Cash Flows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent POS Sales with Batch Profits */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Recent Customer Receipts</h2>
              <p className="text-xs text-neutral-500">Each sale links directly to batch cost</p>
            </div>
            <button
              onClick={() => dispatch(setActiveTab('analytics'))}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              All Sales
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {sales.slice(0, 5).map(sale => (
              <div
                key={sale.id}
                className="p-3.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-neutral-900">{sale.receiptNumber}</span>
                  <span className="font-mono font-bold text-emerald-950 tabular-nums">
                    {formatCurrency(sale.total, currency, usdToEtbRate)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                  <span>
                    {sale.items.length} item{sale.items.length === 1 ? '' : 's'} · {sale.paymentMethod} · {sale.cashierName}
                  </span>
                  <span className="text-emerald-700 font-semibold font-mono">
                    +${sale.totalProfit.toFixed(2)} profit
                  </span>
                </div>
                {/* List items briefly */}
                <div className="text-[11px] text-neutral-600 mt-1.5 truncate">
                  {sale.items.map(it => `${it.productName} (${it.quantity}${it.unit})`).join(', ')}
                </div>
              </div>
            ))}

            {sales.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400">
                No sales recorded yet. Click "New POS Sale Register" to start selling.
              </div>
            )}
          </div>
        </div>

        {/* Right: Cash In & Out Ledger Snapshot */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Cash Flow Operations</h2>
              <p className="text-xs text-neutral-500">All withdrawals and deposits require reasons</p>
            </div>
            <button
              onClick={() => dispatch(setActiveTab('finance'))}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Full Ledger
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {transactions.slice(0, 5).map(tx => (
              <div
                key={tx.id}
                className="p-3.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tx.type === 'in' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    />
                    <span className="font-semibold text-neutral-900">{tx.category}</span>
                  </div>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      tx.type === 'in' ? 'text-emerald-900' : 'text-neutral-900'
                    }`}
                  >
                    {tx.type === 'in' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency, usdToEtbRate)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 mt-1 line-clamp-1">
                  {tx.description}
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                  {formatDateTime(tx.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
