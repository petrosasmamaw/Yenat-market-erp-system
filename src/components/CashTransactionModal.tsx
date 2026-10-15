import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addCashIn, recordCashOut } from '../store/erpSlice';
import { formatCurrency } from '../utils/formatters';
import { canDebitBalance } from '../utils/financeLedger';
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface CashModalProps {
  type: 'in' | 'out';
  isOpen: boolean;
  onClose: () => void;
}

export const CashTransactionModal: React.FC<CashModalProps> = ({ type, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(state => state.erp.balance);
  const currency = useAppSelector(state => state.erp.currency);
  const rate = useAppSelector(state => state.erp.usdToEtbRate);

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(
    type === 'in' ? 'Retail Cash Deposit' : 'Worker Wages & Staff'
  );
  const [description, setDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isDebit = type === 'out';
  const wouldBeNegative = isDebit && !canDebitBalance(balance, numAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a clear description explaining why money is moving (e.g. "Monthly worker wage" or "Teff purchase").');
      return;
    }

    if (isDebit && wouldBeNegative) {
      setErrorMsg(`Cannot debit! Balance cannot be negative. Current available is ${formatCurrency(balance, currency, rate)}.`);
      return;
    }

    if (type === 'in') {
      dispatch(addCashIn({ amount: numAmount, category, description: description.trim() }));
    } else {
      dispatch(recordCashOut({ amount: numAmount, category, description: description.trim() }));
    }

    onClose();
  };

  const inCategories = [
    'Retail Cash Deposit',
    'Owner Working Capital Inflow',
    'Customer Prepayment',
    'Supplier Rebate / Refund',
    'Other Store Income'
  ];

  const outCategories = [
    'Live Cattle / Ox Carcass Purchase',
    'Teff Flour & Bakery Raw Goods',
    'Spices & Imported Stock Purchase',
    'Worker Wages & Staff',
    'Store Rent (Tropicana Ave)',
    'Utilities (NV Energy & Water)',
    'Packaging & Store Bags',
    'Equipment Maintenance (Slicers & Oven)',
    'Other Operating Expense'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${type === 'in' ? 'bg-emerald-900' : 'bg-neutral-900'}`}>
          <div className="flex items-center gap-2.5">
            {type === 'in' ? (
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <h3 className="text-base font-bold">
                {type === 'in' ? 'Add Money In (Cash Inflow)' : 'Pay Money Out (Cash Outflow)'}
              </h3>
              <p className="text-xs text-neutral-300">
                Current Balance: <span className="font-mono font-bold text-white">{formatCurrency(balance, currency, rate)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Amount (USD $) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-neutral-500 font-mono text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                autoFocus
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-base font-mono font-semibold rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            >
              {(type === 'in' ? inCategories : outCategories).map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Description / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                type === 'in'
                  ? 'e.g. Added weekend cash float or owner deposit'
                  : 'e.g. Paid monthly worker wage or NV energy electricity for meat cooler'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Every balance movement must have an audit reason for store records.
            </p>
          </div>

          {/* Balance Preview */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs flex justify-between items-center">
            <span className="text-neutral-600">Balance after this record:</span>
            <span
              className={`font-mono font-bold text-sm ${
                wouldBeNegative ? 'text-rose-600' : 'text-neutral-900'
              }`}
            >
              {formatCurrency(
                type === 'in' ? balance + numAmount : Math.max(0, balance - numAmount),
                currency,
                rate
              )}
            </span>
          </div>

          {wouldBeNegative && (
            <p className="text-[11px] text-rose-600 font-medium">
              Action blocked: Store balance cannot be negative per financial policy.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={wouldBeNegative || numAmount <= 0}
              className={`px-5 py-2 text-xs font-bold rounded-lg text-white shadow-sm transition-all ${
                type === 'in'
                  ? 'bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50'
                  : 'bg-amber-700 hover:bg-amber-800 disabled:opacity-50'
              }`}
            >
              {type === 'in' ? 'Confirm Cash In' : 'Confirm Cash Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
