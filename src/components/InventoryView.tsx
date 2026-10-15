import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addProduct, writeOffBatchQuantity, setActiveTab } from '../store/erpSlice';
import { Product, ProductBatch } from '../types/erp';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getExpiryStatus } from '../utils/expiryAlerts';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  PackagePlus,
  Clock,
  Trash2,
  Calendar,
  Layers,
  X
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, batches, currency, usdToEtbRate } = useAppSelector(state => state.erp);

  const [activeSubTab, setActiveSubTab] = useState<'batches' | 'catalog' | 'expiry'>('batches');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [writeOffModalBatch, setWriteOffModalBatch] = useState<ProductBatch | null>(null);

  const today = new Date();

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const product = products.find(p => p.id === batch.productId);
    const matchesCat = categoryFilter === 'All' || product?.category === categoryFilter;
    const matchesSearch =
      batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeSubTab === 'expiry') {
      const exp = getExpiryStatus(batch.expiryDate, today);
      const isUrgentOrWarning =
        exp.severity === 'URGENT' || exp.severity === 'WARNING' || exp.severity === 'EXPIRED';
      return matchesCat && matchesSearch && isUrgentOrWarning && batch.remainingQuantity > 0;
    }

    return matchesCat && matchesSearch;
  });

  const categories = [
    'All',
    'Fresh Butchery',
    'Artisan Bakery',
    'Spices & Seasonings',
    'Dairy & Traditional Fats',
    'Imported Grains & Flours',
    'Coffee & Tea',
    'Beverages & Soft Drinks'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Inventory & Batch Expiry Control
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track individual batch cost bases, expiry dates, and manage product catalog definitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Catalog Product button */}
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Create Catalog Item</span>
          </button>

          {/* Buy Batch shortcut */}
          <button
            onClick={() => dispatch(setActiveTab('purchases'))}
            className="px-3.5 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Buy Inward Batch</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Batches in Stock vs Catalog Items vs Expiry Alerts */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('batches')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'batches'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Active Batches ({batches.length})
          </button>

          <button
            onClick={() => setActiveSubTab('expiry')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'expiry'
                ? 'bg-amber-700 text-white'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiry Watchlist</span>
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'catalog'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Catalog Definitions ({products.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search batch or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              categoryFilter === c
                ? 'bg-emerald-800 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Main Content: Batches View */}
      {activeSubTab !== 'catalog' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Source / Process</th>
                  <th className="py-3 px-4 text-right">In Stock</th>
                  <th className="py-3 px-4 text-right">Cost / Unit</th>
                  <th className="py-3 px-4 text-right">Sell / Unit</th>
                  <th className="py-3 px-4 text-right">Batch Margin</th>
                  <th className="py-3 px-4">Expiry Date & Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredBatches.map(b => {
                  const expStatus = getExpiryStatus(b.expiryDate, today);
                  const isDepleted = b.remainingQuantity <= 0;
                  const unitMargin = b.sellingPrice - b.costPrice;
                  const marginPct =
                    b.sellingPrice > 0 ? Math.round((unitMargin / b.sellingPrice) * 100) : 0;

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isDepleted ? 'opacity-40 bg-neutral-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        #{b.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-900">
                        {b.productName}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {b.source}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {b.remainingQuantity} <span className="text-[11px] font-normal text-neutral-500">{b.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                        ${b.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-950">
                        ${b.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] font-semibold text-emerald-800 tabular-nums">
                        +${unitMargin.toFixed(2)} ({marginPct}%)
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-neutral-700">
                          {formatDate(b.expiryDate)}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                            expStatus.severity === 'EXPIRED'
                              ? 'bg-rose-100 text-rose-800'
                              : expStatus.severity === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : expStatus.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {expStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {b.remainingQuantity > 0 && (
                          <button
                            onClick={() => setWriteOffModalBatch(b)}
                            title="Write off spoiled/damaged stock"
                            className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBatches.length === 0 && (
            <div className="p-12 text-center text-xs text-neutral-400">
              No batches found matching the selected filter.
            </div>
          )}
        </div>
      )}

      {/* Catalog Definitions Table */}
      {activeSubTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center text-xs">
            <span className="text-neutral-600">
              Products must be registered here in catalog before buying or producing batches.
            </span>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Catalog Definition</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Default Unit</th>
                  <th className="py-3 px-4">Perishability</th>
                  <th className="py-3 px-4">Shelf Life</th>
                  <th className="py-3 px-4">Active Batches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map(p => {
                  const itemBatches = batches.filter(b => b.productId === p.id && b.remainingQuantity > 0);
                  const totalInStore = itemBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{p.name}</td>
                      <td className="py-3 px-4 text-amber-800 font-medium">{p.category}</td>
                      <td className="py-3 px-4 font-mono">{p.unit}</td>
                      <td className="py-3 px-4">
                        {p.isFresh ? (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            Fresh Perishable
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Shelf Stable
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{p.shelfLifeDays} days</td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                        {totalInStore} {p.unit} ({itemBatches.length} batches)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Catalog Item Modal */}
      {isAddProductOpen && (
        <CreateProductModal
          onClose={() => setIsAddProductOpen(false)}
          onSave={newProd => {
            dispatch(addProduct(newProd));
            setIsAddProductOpen(false);
          }}
        />
      )}

      {/* Write-off Food Waste Modal */}
      {writeOffModalBatch && (
        <WriteOffModal
          batch={writeOffModalBatch}
          onClose={() => setWriteOffModalBatch(null)}
          onConfirm={(qty, reason) => {
            dispatch(
              writeOffBatchQuantity({
                batchId: writeOffModalBatch.id,
                quantity: qty,
                reason
              })
            );
            setWriteOffModalBatch(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for creating a new product catalog definition
const CreateProductModal: React.FC<{
  onClose: () => void;
  onSave: (prod: Product) => void;
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<Product['category']>('Fresh Butchery');
  const [unit, setUnit] = useState('lb');
  const [isFresh, setIsFresh] = useState(true);
  const [shelfLifeDays, setShelfLifeDays] = useState(5);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: Product = {
      id: 'prod_' + Date.now(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      unit,
      isFresh,
      shelfLifeDays: parseInt(shelfLifeDays.toString(), 10) || 7,
      description: description.trim(),
      minStockThreshold: 10
    };

    onSave(newProd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200">
        <div className="p-5 bg-emerald-950 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">New Catalog Product Definition</h3>
            <p className="text-xs text-neutral-300">
              Must be created before you can buy or produce batches in stock.
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Awaze Chili Paste or Brown Teff Flour"
              className="w-full px-3 py-2 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. SPICE-AWZ-01"
                className="w-full px-3 py-2 font-mono text-xs rounded border border-neutral-300"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="lb, pack, jar, bag"
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Product['category'])}
              className="w-full px-3 py-2 text-xs rounded border border-neutral-300 bg-white"
            >
              <option value="Fresh Butchery">Fresh Butchery (Siga cuts)</option>
              <option value="Artisan Bakery">Artisan Bakery (Injera)</option>
              <option value="Spices & Seasonings">Spices & Seasonings (Berbere, Mitmita, Shiro)</option>
              <option value="Dairy & Traditional Fats">Dairy & Traditional Fats (Kibe)</option>
              <option value="Imported Grains & Flours">Imported Grains & Flours (Teff)</option>
              <option value="Coffee & Tea">Coffee & Tea (Yirgacheffe, Sidama)</option>
              <option value="Beverages & Soft Drinks">Beverages & Soft Drinks</option>
              <option value="Pantry & Sundries">Pantry & Sundries</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Perishability</label>
              <select
                value={isFresh ? 'fresh' : 'shelf'}
                onChange={e => setIsFresh(e.target.value === 'fresh')}
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300 bg-white"
              >
                <option value="fresh">Fresh (Daily/Weekly expiry)</option>
                <option value="shelf">Shelf Stable (Long expiry)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Expected Shelf Life (Days)</label>
              <input
                type="number"
                min="1"
                value={shelfLifeDays}
                onChange={e => setShelfLifeDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 font-mono text-xs rounded border border-neutral-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description for cashier and receipt"
              className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-900 rounded hover:bg-emerald-800"
            >
              Save Catalog Definition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for writing off spoiled or expired food
const WriteOffModal: React.FC<{
  batch: ProductBatch;
  onClose: () => void;
  onConfirm: (quantity: number, reason: string) => void;
}> = ({ batch, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Expired past safe consumption date');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(quantity, reason);
  };

  const lossAmount = quantity * batch.costPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200">
        <div className="p-5 bg-rose-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold">Write-Off Spoiled / Damaged Food</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <div className="font-bold text-neutral-900">{batch.productName}</div>
            <div className="text-[11px] text-neutral-500 font-mono">
              Batch #{batch.batchNumber} · Available: {batch.remainingQuantity} {batch.unit} · Cost Basis: ${batch.costPrice.toFixed(2)}/{batch.unit}
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Quantity to Dispose ({batch.unit}):
            </label>
            <input
              type="number"
              min="0.1"
              max={batch.remainingQuantity}
              step="0.1"
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 font-mono font-bold text-sm rounded border border-neutral-300"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Reason for Loss:</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-300 bg-white"
            >
              <option value="Expired past safe consumption date">Expired past safe date (Perishable)</option>
              <option value="Damaged in transit / packaging broken">Damaged packaging / torn bag</option>
              <option value="Spoiled or dry injera flatbread">Spoiled or dry sourdough texture</option>
              <option value="Trimming waste / butcher shrinkage">Trimming shrinkage or butcher loss</option>
              <option value="Quality check failure">Failed quality standard</option>
            </select>
          </div>

          <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800">
            <span className="font-bold">Estimated Cost Loss: </span>
            <span className="font-mono font-bold">${lossAmount.toFixed(2)}</span>
            <div className="text-[10px] text-rose-700 mt-0.5">
              This amount will be deducted as an expense loss in the financial ledger.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={quantity <= 0 || quantity > batch.remainingQuantity}
              className="px-5 py-2 font-bold text-white bg-rose-800 rounded hover:bg-rose-900 disabled:opacity-50"
            >
              Confirm Disposal Loss
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
