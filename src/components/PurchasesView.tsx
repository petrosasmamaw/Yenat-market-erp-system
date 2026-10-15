import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addBatch, setActiveTab } from '../store/erpSlice';
import { Product, ProductBatch } from '../types/erp';
import { formatCurrency, formatDate } from '../utils/formatters';
import { canDebitBalance } from '../utils/financeLedger';
import {
  PackagePlus,
  Plus,
  AlertTriangle,
  Receipt,
  Layers,
  Calendar,
  CheckCircle2,
  Building2,
  Coins
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, batches, balance, currency, usdToEtbRate } = useAppSelector(
    state => state.erp
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [supplierName, setSupplierName] = useState('Addis Direct Imports LLC');
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Date.now().toString().slice(-5)}`);
  const [quantity, setQuantity] = useState('50');
  const [costPrice, setCostPrice] = useState('3.80');
  const [sellingPrice, setSellingPrice] = useState('7.99');
  const [inwardDate, setInwardDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Standard shipment received into stock');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Recalculate expiry suggestion when product changes
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      const d = new Date();
      d.setDate(d.getDate() + prod.shelfLifeDays);
      setExpiryDate(d.toISOString().split('T')[0]);
    }
  };

  const numQty = parseFloat(quantity) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const numSell = parseFloat(sellingPrice) || 0;
  const totalCost = Math.round(numQty * numCost * 100) / 100;
  const projectedRevenue = Math.round(numQty * numSell * 100) / 100;
  const projectedProfit = Math.round((projectedRevenue - totalCost) * 100) / 100;

  const canAfford = canDebitBalance(balance, totalCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !canAfford || numQty <= 0 || numCost <= 0) return;

    const newBatch: ProductBatch = {
      id: 'b_pur_' + Date.now(),
      batchNumber: batchNumber.trim(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      inwardDate,
      expiryDate,
      initialQuantity: numQty,
      remainingQuantity: numQty,
      unit: selectedProduct.unit,
      costPrice: numCost,
      sellingPrice: numSell,
      source: 'Direct Purchase',
      notes: `${notes.trim()} (Supplier: ${supplierName.trim()})`
    };

    dispatch(
      addBatch({
        ...newBatch,
        deductCash: true,
        supplierName: supplierName.trim()
      })
    );

    // Refresh batch number
    setBatchNumber(`BATCH-${Date.now().toString().slice(-5)}`);
  };

  const purchasedBatches = batches.filter(b => b.source === 'Direct Purchase');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Purchases & Inward Stock Batches
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Receive inventory from suppliers, assign unique batch numbers and costs, and automatically debit store balance.
          </p>
        </div>

        <button
          onClick={() => dispatch(setActiveTab('inventory'))}
          className="px-3.5 py-2 rounded-lg bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>New Catalog Definition</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Inward Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Receive New Stock Batch</h2>
              <p className="text-xs text-neutral-500">
                Product must exist in catalog. Each batch records its specific cost basis.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Cost-by-Batch Tracking
            </span>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Select Catalog Product <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedProductId}
              onChange={e => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) — Unit: {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Supplier */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Supplier / Vendor Name
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                placeholder="e.g. Addis Direct Imports LLC or Idaho Teff Co"
                className="w-full px-3 py-2 rounded border border-neutral-300"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Batch Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300"
              />
            </div>
          </div>

          {/* Quantity, Cost, Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Quantity Received ({selectedProduct?.unit || 'unit'}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Cost Price Paid / Unit ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Store Selling Price / Unit ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white text-emerald-900"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Inward Arrival Date</label>
              <input
                type="date"
                required
                value={inwardDate}
                onChange={e => setInwardDate(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded border border-neutral-300"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Product Expiry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded border border-neutral-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Invoice / Batch Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
            />
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-neutral-200 flex justify-end">
            <button
              type="submit"
              disabled={!canAfford || numQty <= 0 || numCost <= 0}
              className="px-6 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Confirm Purchase & Debit Store Balance</span>
            </button>
          </div>
        </form>

        {/* Right 1 Col: Financial Impact Summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              Batch Financial Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Total Inward Cost:</span>
                <span className="font-mono font-bold text-neutral-900">
                  ${totalCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Unit Margin:</span>
                <span className="font-mono font-bold text-emerald-800">
                  +${(numSell - numCost).toFixed(2)} / {selectedProduct?.unit || 'unit'}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Projected Revenue:</span>
                <span className="font-mono font-bold text-neutral-900">
                  ${projectedRevenue.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm">
                <span>Projected Gross Profit:</span>
                <span className="font-mono tabular-nums">
                  +${projectedProfit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Cash Flow Balance Impact */}
            <div className="mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-700">
                <span>Available Store Balance:</span>
                <span className="font-mono font-bold">
                  {formatCurrency(balance, currency, usdToEtbRate)}
                </span>
              </div>

              <div className="flex items-center justify-between text-rose-700">
                <span>Deduction for Purchase:</span>
                <span className="font-mono font-bold">-${totalCost.toFixed(2)}</span>
              </div>

              <div className="pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900">
                <span>Balance After Purchase:</span>
                <span className="font-mono">
                  {formatCurrency(Math.max(0, balance - totalCost), currency, usdToEtbRate)}
                </span>
              </div>
            </div>

            {!canAfford && (
              <div className="mt-3 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance! Cannot allow overdraft.</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
            <strong>Batch Separation Note:</strong> If Berbere costs $3.50 this week and $4.00 next week, both batches will exist simultaneously and calculate margins accurately when sold.
          </div>
        </div>
      </div>

      {/* Historical Purchases Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-800" />
          <span>Recent Direct Inward Stock Batches</span>
        </h2>

        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Batch #</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 font-mono">Inward Date</th>
                <th className="py-2.5 px-3 font-mono">Expiry Date</th>
                <th className="py-2.5 px-3 text-right">Qty Received</th>
                <th className="py-2.5 px-3 text-right">Cost Paid</th>
                <th className="py-2.5 px-3 text-right">Sell Price</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {purchasedBatches.map(b => (
                <tr key={b.id} className="hover:bg-neutral-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">#{b.batchNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-neutral-900">{b.productName}</td>
                  <td className="py-2.5 px-3 font-mono text-neutral-600">{formatDate(b.inwardDate)}</td>
                  <td className="py-2.5 px-3 font-mono text-neutral-600">{formatDate(b.expiryDate)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">{b.initialQuantity} {b.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-700">${b.costPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">${b.sellingPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-neutral-500 truncate max-w-xs">{b.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
