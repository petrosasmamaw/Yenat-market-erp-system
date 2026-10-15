import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  completeSale
} from '../store/erpSlice';
import { Product, ProductBatch, SaleRecord } from '../types/erp';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getExpiryStatus } from '../utils/expiryAlerts';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Receipt,
  Layers,
  Calendar,
  AlertTriangle,
  Printer,
  X
} from 'lucide-react';

export const POSView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, batches, cart, storeInfo, currency, usdToEtbRate } = useAppSelector(
    state => state.erp
  );
  const currentUser = useAppSelector(state => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBatchModalProduct, setSelectedBatchModalProduct] = useState<Product | null>(null);
  const [completedSaleRecord, setCompletedSaleRecord] = useState<SaleRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SaleRecord['paymentMethod']>('Cash');
  const [customerNote, setCustomerNote] = useState('');

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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCat = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Helper to find all available active batches for a product
  const getProductBatches = (productId: string) => {
    return batches.filter(b => b.productId === productId && b.remainingQuantity > 0);
  };

  // Cart calculations
  let cartSubtotal = 0;
  let cartCost = 0;
  for (const item of cart) {
    cartSubtotal += item.sellingPrice * item.quantity;
    cartCost += item.costPrice * item.quantity;
  }
  const cartTax = Math.round(cartSubtotal * storeInfo.taxRate * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;
  const cartProjectedProfit = Math.round((cartSubtotal - cartCost) * 100) / 100;
  const profitMarginPercent = cartSubtotal > 0
    ? Math.round((cartProjectedProfit / cartSubtotal) * 1000) / 10
    : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    dispatch(
      completeSale({
        cashierName: currentUser?.name || 'Cashier',
        paymentMethod,
        customerNote: customerNote.trim()
      })
    );
  };

  // When completing sale, watch for receipt
  const lastSale = useAppSelector(state => state.erp.sales[0]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-neutral-100">
      {/* Left 65%: Product & Batch Catalog Browser */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 bg-neutral-50">
        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-white border-b border-neutral-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products (Berbere, Siga Tibs, Injera, Kibe, Coffee...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-neutral-50"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const activeBatches = getProductBatches(product.id);
              const totalRemaining = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
              const isOutOfStock = totalRemaining <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between shadow-xs hover:border-emerald-700/50 transition-all"
                >
                  <div>
                    {/* Header: Title + Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          {product.category}
                        </span>
                        <h3 className="text-xs font-bold text-neutral-900 leading-snug mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {product.sku}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Stock & Batch Summary */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-500 text-[11px]">In Stock: </span>
                        <span
                          className={`font-mono font-bold ${
                            isOutOfStock ? 'text-rose-600' : 'text-neutral-900'
                          }`}
                        >
                          {totalRemaining} {product.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-semibold">
                        {activeBatches.length} active batch{activeBatches.length === 1 ? '' : 'es'}
                      </div>
                    </div>
                  </div>

                  {/* Action: Select Batch & Add to Sale */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    {isOutOfStock ? (
                      <div className="w-full py-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg">
                        Out of Stock
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedBatchModalProduct(product)}
                        className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-300" />
                        <span>Select Batch & Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-xs text-neutral-400">
              No products found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Right 35%: Register Cart & Batch Profit Summary */}
      <div className="w-full lg:w-96 bg-white flex flex-col justify-between shrink-0 shadow-sm border-l border-neutral-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
              Sale Register ({cart.length} item{cart.length === 1 ? '' : 's'})
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-xs text-rose-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.map(item => (
            <div
              key={item.batchId}
              className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/60 text-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 truncate">
                    {item.productName}
                  </div>
                  {/* Distinct batch note per user request */}
                  <div className="text-[11px] text-amber-800 font-medium">
                    Batch: <span className="font-mono">{item.batchNumber}</span> (Cost: ${item.costPrice.toFixed(2)}/{item.unit})
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item.batchId))}
                  className="text-neutral-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity controls & Price */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      dispatch(
                        updateCartQuantity({
                          batchId: item.batchId,
                          quantity: item.quantity - 1
                        })
                      )
                    }
                    className="w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Minus className="w-3 h-3 text-neutral-600" />
                  </button>
                  <span className="font-mono font-bold text-xs w-6 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateCartQuantity({
                          batchId: item.batchId,
                          quantity: item.quantity + 1
                        })
                      )
                    }
                    className="w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Plus className="w-3 h-3 text-neutral-600" />
                  </button>
                  <span className="text-[11px] text-neutral-500">{item.unit}</span>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(item.sellingPrice * item.quantity, currency, usdToEtbRate)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold font-mono">
                    +${((item.sellingPrice - item.costPrice) * item.quantity).toFixed(2)} profit
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-20 text-center text-xs text-neutral-400">
              <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <span>Register is empty.</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Select items from catalog and choose which batch to sell.
              </p>
            </div>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/80 space-y-3">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {(['Cash', 'Credit Card', 'Mobile / Zelle'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 px-2 text-center rounded border font-semibold text-[11px] transition-colors ${
                      paymentMethod === method
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtotal, Tax & Profit */}
            <div className="space-y-1 text-xs pt-1 border-t border-neutral-200">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(cartSubtotal, currency, usdToEtbRate)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Nevada Sales Tax (8.38%):</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(cartTax, currency, usdToEtbRate)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-sm pt-1 border-t border-neutral-200">
                <span>Total Due:</span>
                <span className="font-mono text-emerald-950 tabular-nums">
                  {formatCurrency(cartTotal, currency, usdToEtbRate)}
                </span>
              </div>
              {/* Batch profit insight */}
              <div className="flex justify-between text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                <span>Calculated Batch Profit:</span>
                <span className="font-mono">
                  +${cartProjectedProfit.toFixed(2)} ({profitMarginPercent}%)
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sale & Print Receipt</span>
            </button>
          </div>
        )}
      </div>

      {/* Batch Selection Modal (Crucial requirement from prompt) */}
      {selectedBatchModalProduct && (
        <BatchSelectionModal
          product={selectedBatchModalProduct}
          batches={getProductBatches(selectedBatchModalProduct.id)}
          onClose={() => setSelectedBatchModalProduct(null)}
          onSelectBatch={(batch, qty) => {
            dispatch(
              addToCart({
                product: selectedBatchModalProduct,
                batch,
                quantity: qty
              })
            );
            setSelectedBatchModalProduct(null);
          }}
        />
      )}

      {/* Receipt Modal when last sale completed */}
      {lastSale && (
        <ReceiptModal
          sale={lastSale}
          storeInfo={storeInfo}
          currency={currency}
          rate={usdToEtbRate}
        />
      )}
    </div>
  );
};

interface BatchSelectionModalProps {
  product: Product;
  batches: ProductBatch[];
  onClose: () => void;
  onSelectBatch: (batch: ProductBatch, quantity: number) => void;
}

const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({
  product,
  batches,
  onClose,
  onSelectBatch
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const maxAvailable = selectedBatch?.remainingQuantity || 0;

  const today = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">
              Select Specific Batch for Costing
            </span>
            <h3 className="text-base font-bold text-white">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Choose the exact batch being sold. The system computes exact profit from the
            batch's actual purchase or production cost.
          </p>

          {/* List of Batches */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {batches.map(b => {
              const expStatus = getExpiryStatus(b.expiryDate, today);
              const isSelected = selectedBatchId === b.id;
              const unitProfit = b.sellingPrice - b.costPrice;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/60 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">
                        #{b.batchNumber}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        ({b.source})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        expStatus.severity === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : expStatus.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {expStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                    <div>
                      <span className="text-neutral-500">Remaining:</span>{' '}
                      <span className="font-mono font-bold text-neutral-900">
                        {b.remainingQuantity} {b.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Cost:</span>{' '}
                      <span className="font-mono font-bold text-neutral-700">
                        ${b.costPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Sell Price:</span>{' '}
                      <span className="font-mono font-bold text-emerald-900">
                        ${b.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Batch Profit: +${unitProfit.toFixed(2)} / {b.unit}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Selector */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700">
                Quantity to Sell ({product.unit}):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded border border-neutral-300 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  value={quantity}
                  onChange={e =>
                    setQuantity(
                      Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-16 py-1 text-center font-mono font-bold border border-neutral-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                  className="w-8 h-8 rounded border border-neutral-300 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right text-[11px] text-neutral-500 mt-1">
              Max available in this batch: {maxAvailable} {product.unit}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={!selectedBatch || maxAvailable <= 0}
              onClick={() => selectedBatch && onSelectBatch(selectedBatch, quantity)}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-900 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
            >
              Add {quantity} {product.unit} to Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Receipt Viewer Modal
const ReceiptModal: React.FC<{
  sale: SaleRecord;
  storeInfo: any;
  currency: any;
  rate: any;
}> = ({ sale, storeInfo, currency, rate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Small floating button when sale is done */}
      <div className="fixed bottom-6 left-80 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 bg-emerald-900 text-white rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold hover:bg-emerald-800"
        >
          <Receipt className="w-4 h-4 text-amber-300" />
          <span>View Last Receipt ({sale.receiptNumber})</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-neutral-200 p-6 text-neutral-900 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200">
              <div className="text-center w-full">
                <div className="font-bold text-base text-emerald-950">YENAT MARKET</div>
                <div className="text-[11px] text-neutral-600">{storeInfo.address}</div>
                <div className="text-[11px] text-neutral-600">{storeInfo.phone}</div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Receipt: {sale.receiptNumber} · {new Date(sale.timestamp).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Line items */}
            <div className="py-4 space-y-2 border-b border-neutral-200 font-mono">
              {sale.items.map(it => (
                <div key={it.batchId} className="flex justify-between items-start text-[11px]">
                  <div>
                    <div className="font-bold text-neutral-900">{it.productName}</div>
                    <div className="text-[10px] text-neutral-500">
                      {it.quantity} {it.unit} @ ${it.sellingPrice.toFixed(2)} (Batch #{it.batchNumber})
                    </div>
                  </div>
                  <div className="font-bold tabular-nums">
                    ${it.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal, tax, total */}
            <div className="py-3 space-y-1 font-mono text-xs border-b border-neutral-200">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${sale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-950 pt-1">
                <span>TOTAL:</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Payment:</span>
                <span>{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                <span>Batch Gross Profit:</span>
                <span>+${sale.totalProfit.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-400 pt-3">
              Thank you for shopping at Yenat Market Las Vegas!
              <br />
              Authentic Ethiopian Spices, Siga & Fresh Daily Injera.
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-neutral-900 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
