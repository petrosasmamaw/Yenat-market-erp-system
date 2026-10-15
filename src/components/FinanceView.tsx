import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveInterval } from '../store/erpSlice';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { filterByInterval } from '../utils/financeLedger';
import { IntervalFilter } from '../types/erp';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Minus,
  Search,
  Filter,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';

interface FinanceViewProps {
  onOpenCashIn: () => void;
  onOpenCashOut: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onOpenCashIn, onOpenCashOut }) => {
  const dispatch = useAppDispatch();
  const {
    balance,
    transactions,
    activeInterval,
    currency,
    usdToEtbRate
  } = useAppSelector(state => state.erp);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');

  // Filter transactions by interval
  const intervalTransactions = filterByInterval(transactions, activeInterval);

  // Search & type filter
  const filteredTransactions = intervalTransactions.filter(tx => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate totals
  const totalInflow = intervalTransactions
    .filter(t => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = intervalTransactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalInflow - totalOutflow;

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
      {/* Top Banner & Interval Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Financial Ledger & Cash Flow Tracker
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time balance control, cash in/out entries with mandatory audit descriptions, and zero-overdraft enforcement.
          </p>
        </div>

        {/* Interval Selector */}
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

      {/* Main Cash Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Available Balance (Non-negative) */}
        <div className="p-5 rounded-xl bg-emerald-950 text-white border border-emerald-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-300/80 text-xs font-medium mb-2">
              <span>Current Store Balance</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-white">
              {formatCurrency(balance, currency, usdToEtbRate)}
            </div>
          </div>
          <div className="text-[11px] text-amber-300/90 font-medium mt-4 pt-3 border-t border-emerald-900">
            Protected: Balance cannot drop below zero.
          </div>
        </div>

        {/* Total Inflow */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
              <span>Total Cash In ({activeInterval})</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
              +{formatCurrency(totalInflow, currency, usdToEtbRate)}
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100">
            From POS retail sales, deposits, and income
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
              <span>Total Cash Out ({activeInterval})</span>
              <ArrowUpRight className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              -{formatCurrency(totalOutflow, currency, usdToEtbRate)}
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100">
            For ox cattle, teff flour, rent, staff & utilities
          </div>
        </div>

        {/* Net Operating Flow */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
              <span>Net Operating Cash Flow</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                netFlow >= 0 ? 'text-emerald-950' : 'text-amber-800'
              }`}
            >
              {netFlow >= 0 ? '+' : ''}
              {formatCurrency(netFlow, currency, usdToEtbRate)}
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100">
            Net liquidity position over selected interval
          </div>
        </div>
      </div>

      {/* Action Strip: Add In / Pay Out Buttons */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <div className="text-xs text-neutral-600">
          <strong>Cash Flow Actions:</strong> Every deposit or payout must include a mandatory audit note.
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCashIn}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Money In (Deposit)</span>
          </button>

          <button
            onClick={onOpenCashOut}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Pay Money Out (Expense)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar for Ledger Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">Ledger Entries ({filteredTransactions.length})</span>
            <div className="flex items-center gap-1 ml-3">
              {(['all', 'in', 'out'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                    typeFilter === f
                      ? 'bg-emerald-900 text-white'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {f === 'all' ? 'All Transactions' : f === 'in' ? 'Money In' : 'Money Out'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by reason, category, ox, worker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600 font-semibold border-b border-neutral-200">
                <th className="py-3 px-4 font-mono">Date & Time</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Reason</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-neutral-500 text-[11px] whitespace-nowrap">
                    {formatDateTime(tx.timestamp)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {tx.type === 'in' ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <ArrowDownRight className="w-3 h-3 text-emerald-700" />
                        <span>Money In</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <ArrowUpRight className="w-3 h-3 text-amber-700" />
                        <span>Money Out</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-900 whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td className="py-3 px-4 text-neutral-700 max-w-md">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums whitespace-nowrap">
                    <span className={tx.type === 'in' ? 'text-emerald-950' : 'text-neutral-900'}>
                      {tx.type === 'in' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency, usdToEtbRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center text-xs text-neutral-400">
            No transactions found for the selected interval and filter.
          </div>
        )}
      </div>
    </div>
  );
};
