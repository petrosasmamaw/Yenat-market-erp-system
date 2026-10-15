import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Product,
  ProductBatch,
  SaleRecord,
  SaleItem,
  CashTransaction,
  OxProductionRecord,
  InjeraProductionRecord,
  IntervalFilter,
  CurrencyMode,
  StoreInfo
} from '../types/erp';
import { canDebitBalance } from '../utils/financeLedger';

export interface CartItem {
  productId: string;
  batchId: string;
  productName: string;
  batchNumber: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  maxAvailable: number;
}

interface ERPState {
  storeInfo: StoreInfo;
  balance: number;
  products: Product[];
  batches: ProductBatch[];
  transactions: CashTransaction[];
  sales: SaleRecord[];
  oxProductions: OxProductionRecord[];
  injeraProductions: InjeraProductionRecord[];
  activeTab: 'dashboard' | 'pos' | 'inventory' | 'production' | 'purchases' | 'finance' | 'analytics' | 'settings';
  activeInterval: IntervalFilter;
  currency: CurrencyMode;
  usdToEtbRate: number;
  cart: CartItem[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  syncStatus: 'idle' | 'syncing' | 'saved' | 'error';
  lastSynced: string | null;
}

const initialStoreState: ERPState = {
  storeInfo: {
    name: 'Yenat Market Las Vegas',
    address: '4780 W Tropicana Ave, Las Vegas, NV 89103',
    phone: '(702) 873-1224',
    email: 'contact@yenatmarketvegas.com',
    currency: 'USD',
    taxRate: 0.08375
  },
  balance: 14850.00,
  products: [],
  batches: [],
  transactions: [],
  sales: [],
  oxProductions: [],
  injeraProductions: [],
  activeTab: 'dashboard',
  activeInterval: '1month',
  currency: 'USD',
  usdToEtbRate: 125, // Current market exchange reference for Ethiopian Birr
  cart: [],
  toast: null,
  syncStatus: 'idle',
  lastSynced: null
};

// Async thunk to fetch ERP state from backend Express server
export const fetchERPState = createAsyncThunk('erp/fetchERPState', async () => {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to load ERP state');
  return await res.json();
});

// Async thunk to sync changes back to backend
export const syncERPState = createAsyncThunk(
  'erp/syncERPState',
  async (_, { getState }) => {
    const state = (getState() as any).erp;
    const payload = {
      storeInfo: state.storeInfo,
      balance: state.balance,
      products: state.products,
      batches: state.batches,
      transactions: state.transactions,
      sales: state.sales,
      oxProductions: state.oxProductions,
      injeraProductions: state.injeraProductions
    };
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to sync data with server');
    return await res.json();
  }
);

export const erpSlice = createSlice({
  name: 'erp',
  initialState: initialStoreState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ERPState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setActiveInterval: (state, action: PayloadAction<IntervalFilter>) => {
      state.activeInterval = action.payload;
    },
    toggleCurrency: (state) => {
      state.currency = state.currency === 'USD' ? 'ETB' : 'USD';
    },
    setCurrencyRate: (state, action: PayloadAction<number>) => {
      if (action.payload > 0) {
        state.usdToEtbRate = action.payload;
      }
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },

    // 1. Products (Catalog)
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload);
      state.toast = {
        type: 'success',
        message: `Product "${action.payload.name}" created in catalog. You can now purchase or produce batches.`
      };
    },

    // 2. Batches (Inventory & Buying)
    addBatch: (state, action: PayloadAction<ProductBatch & { deductCash?: boolean; supplierName?: string }>) => {
      const { deductCash = true, supplierName = '', ...batch } = action.payload;
      const totalCost = Math.round(batch.initialQuantity * batch.costPrice * 100) / 100;

      if (deductCash && totalCost > 0) {
        if (!canDebitBalance(state.balance, totalCost)) {
          state.toast = {
            type: 'error',
            message: `Cannot purchase batch! Balance ($${state.balance.toFixed(2)}) is less than total cost ($${totalCost.toFixed(2)}).`
          };
          return;
        }
        state.balance = Math.round((state.balance - totalCost) * 100) / 100;

        state.transactions.unshift({
          id: 'tx_' + Date.now(),
          type: 'out',
          amount: totalCost,
          category: 'Stock Purchase',
          description: `Purchased Batch #${batch.batchNumber} of ${batch.productName} (${batch.initialQuantity} ${batch.unit} @ $${batch.costPrice.toFixed(2)}/${batch.unit}) ${supplierName ? 'from ' + supplierName : ''}`,
          timestamp: new Date().toISOString(),
          referenceId: batch.id
        });
      }

      state.batches.unshift(batch);
      state.toast = {
        type: 'success',
        message: `Batch #${batch.batchNumber} added with ${batch.initialQuantity} ${batch.unit}. Cost: $${batch.costPrice.toFixed(2)}/${batch.unit}.`
      };
    },

    // 3. Expiry Write-Off / Spoilage
    writeOffBatchQuantity: (
      state,
      action: PayloadAction<{ batchId: string; quantity: number; reason: string }>
    ) => {
      const { batchId, quantity, reason } = action.payload;
      const batch = state.batches.find(b => b.id === batchId);
      if (!batch || batch.remainingQuantity <= 0) return;

      const qtyToWriteOff = Math.min(batch.remainingQuantity, quantity);
      batch.remainingQuantity = Math.round((batch.remainingQuantity - qtyToWriteOff) * 100) / 100;
      const lossAmount = Math.round(qtyToWriteOff * batch.costPrice * 100) / 100;

      state.transactions.unshift({
        id: 'tx_loss_' + Date.now(),
        type: 'out',
        amount: lossAmount,
        category: 'Spoilage & Waste Loss',
        description: `Disposed ${qtyToWriteOff} ${batch.unit} of ${batch.productName} (Batch #${batch.batchNumber}) - Reason: ${reason}`,
        timestamp: new Date().toISOString(),
        referenceId: batch.id
      });

      state.toast = {
        type: 'info',
        message: `Logged waste of ${qtyToWriteOff} ${batch.unit}. Loss of $${lossAmount.toFixed(2)} recorded.`
      };
    },

    // 4. In-House Ox Butchery Breakdown
    recordOxBreakdownAction: (
      state,
      action: PayloadAction<{
        oxTagNumber: string;
        oxPurchaseCost: number;
        processingCost: number;
        cuts: { cutName: string; weightLbs: number; sellingPricePerLb: number; productId: string }[];
        butcherName: string;
        notes?: string;
      }>
    ) => {
      const { oxTagNumber, oxPurchaseCost, processingCost, cuts, butcherName, notes } = action.payload;
      const totalCost = Math.round((oxPurchaseCost + processingCost) * 100) / 100;

      if (!canDebitBalance(state.balance, totalCost)) {
        state.toast = {
          type: 'error',
          message: `Cannot process Ox breakdown! Balance is $${state.balance.toFixed(2)}, insufficient for $${totalCost.toFixed(2)}.`
        };
        return;
      }

      state.balance = Math.round((state.balance - totalCost) * 100) / 100;

      // Log cash outflow
      state.transactions.unshift({
        id: 'tx_ox_' + Date.now(),
        type: 'out',
        amount: totalCost,
        category: 'Live Stock / Carcass Purchase',
        description: `Purchased whole cattle (${oxTagNumber}) for fresh Siga butcher cuts. Total cost $${totalCost.toFixed(2)}.`,
        timestamp: new Date().toISOString()
      });

      const totalWeight = cuts.reduce((sum, c) => sum + (c.weightLbs || 0), 0);
      const avgCostPerLb = totalWeight > 0 ? Math.round((totalCost / totalWeight) * 100) / 100 : 0;
      const todayStr = new Date().toISOString().split('T')[0];

      // Expiry for fresh meat is 5 days from today
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 5);
      const expDateStr = expDate.toISOString().split('T')[0];

      const createdYields: any[] = [];

      for (const cut of cuts) {
        if (cut.weightLbs <= 0) continue;
        const batchId = 'b_ox_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const batchNumber = `OX-${oxTagNumber.toUpperCase()}-${cut.cutName.substring(0, 3).toUpperCase()}`;

        const newBatch: ProductBatch = {
          id: batchId,
          batchNumber,
          productId: cut.productId,
          productName: cut.cutName,
          inwardDate: todayStr,
          expiryDate: expDateStr,
          initialQuantity: cut.weightLbs,
          remainingQuantity: cut.weightLbs,
          unit: 'lb',
          costPrice: avgCostPerLb,
          sellingPrice: cut.sellingPricePerLb,
          source: 'In-House Butchery',
          notes: `Butchered from ${oxTagNumber} by ${butcherName}`
        };

        state.batches.unshift(newBatch);
        createdYields.push({
          cutName: cut.cutName,
          weightLbs: cut.weightLbs,
          costPerLb: avgCostPerLb,
          sellingPricePerLb: cut.sellingPricePerLb,
          batchId
        });
      }

      const oxRecord: OxProductionRecord = {
        id: 'ox_rec_' + Date.now(),
        date: todayStr,
        oxTagNumber,
        oxPurchaseCost,
        slaughterAndProcessingCost: processingCost,
        totalCost,
        totalYieldLbs: totalWeight,
        averageCostPerLb: avgCostPerLb,
        cuts: createdYields,
        butcherName,
        notes
      };

      state.oxProductions.unshift(oxRecord);
      state.toast = {
        type: 'success',
        message: `Successfully processed ${oxTagNumber}! ${totalWeight} lbs of fresh meat cuts stocked at $${avgCostPerLb.toFixed(2)}/lb cost basis.`
      };
    },

    // 5. In-House Injera Bakery Production
    recordInjeraProductionAction: (
      state,
      action: PayloadAction<{
        teffFlourCost: number;
        gasAndPowerCost: number;
        packagingCost: number;
        packsProduced: number;
        sellingPricePerPack: number;
        bakerName: string;
        notes?: string;
      }>
    ) => {
      const { teffFlourCost, gasAndPowerCost, packagingCost, packsProduced, sellingPricePerPack, bakerName, notes } =
        action.payload;
      const totalCost = Math.round((teffFlourCost + gasAndPowerCost + packagingCost) * 100) / 100;

      if (!canDebitBalance(state.balance, totalCost)) {
        state.toast = {
          type: 'error',
          message: `Cannot bake Injera batch! Balance is $${state.balance.toFixed(2)}, insufficient for $${totalCost.toFixed(2)} ingredient costs.`
        };
        return;
      }

      state.balance = Math.round((state.balance - totalCost) * 100) / 100;

      // Log cash outflow for baking ingredients & energy
      state.transactions.unshift({
        id: 'tx_bake_' + Date.now(),
        type: 'out',
        amount: totalCost,
        category: 'Bakery Raw Ingredients',
        description: `Injera baking run (${packsProduced} packs) - Teff flour $${teffFlourCost.toFixed(2)}, Energy $${gasAndPowerCost.toFixed(2)}, Packaging $${packagingCost.toFixed(2)}`,
        timestamp: new Date().toISOString()
      });

      const costPerPack = Math.round((totalCost / packsProduced) * 100) / 100;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fresh sourdough injera shelf life is 4 days
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 4);
      const expDateStr = expDate.toISOString().split('T')[0];

      const batchId = 'b_inj_' + Date.now();
      const batchNumber = `INJ-${todayStr.replace(/-/g, '')}-${today.getHours() >= 12 ? 'PM' : 'AM'}`;

      const newBatch: ProductBatch = {
        id: batchId,
        batchNumber,
        productId: 'prod_injera',
        productName: 'Fresh House-Baked Injera (5-Pack)',
        inwardDate: todayStr,
        expiryDate: expDateStr,
        initialQuantity: packsProduced,
        remainingQuantity: packsProduced,
        unit: 'pack',
        costPrice: costPerPack,
        sellingPrice: sellingPricePerPack,
        source: 'In-House Bakery',
        notes: `Baked by ${bakerName}. ${notes || ''}`
      };

      state.batches.unshift(newBatch);

      state.injeraProductions.unshift({
        id: 'inj_rec_' + Date.now(),
        date: todayStr,
        teffFlourCost,
        gasAndPowerCost,
        packagingCost,
        totalCost,
        packsProduced,
        costPerPack,
        sellingPricePerPack,
        batchId,
        bakerName,
        notes
      });

      state.toast = {
        type: 'success',
        message: `Bake complete! ${packsProduced} fresh Injera packs ready in store. Cost: $${costPerPack.toFixed(2)}/pack.`
      };
    },

    // 6. Manual Cash In / Out (Ledger)
    addCashIn: (
      state,
      action: PayloadAction<{ amount: number; category: string; description: string }>
    ) => {
      const { amount, category, description } = action.payload;
      if (amount <= 0) return;

      state.balance = Math.round((state.balance + amount) * 100) / 100;
      state.transactions.unshift({
        id: 'tx_in_' + Date.now(),
        type: 'in',
        amount: Math.round(amount * 100) / 100,
        category,
        description,
        timestamp: new Date().toISOString()
      });

      state.toast = {
        type: 'success',
        message: `Added $${amount.toFixed(2)} cash in. New balance: $${state.balance.toFixed(2)}.`
      };
    },

    recordCashOut: (
      state,
      action: PayloadAction<{ amount: number; category: string; description: string }>
    ) => {
      const { amount, category, description } = action.payload;
      if (amount <= 0) return;

      if (!canDebitBalance(state.balance, amount)) {
        state.toast = {
          type: 'error',
          message: `Cannot withdraw or pay $${amount.toFixed(2)}! Store balance cannot be negative (Current: $${state.balance.toFixed(2)}).`
        };
        return;
      }

      state.balance = Math.round((state.balance - amount) * 100) / 100;
      state.transactions.unshift({
        id: 'tx_out_' + Date.now(),
        type: 'out',
        amount: Math.round(amount * 100) / 100,
        category,
        description,
        timestamp: new Date().toISOString()
      });

      state.toast = {
        type: 'info',
        message: `Paid $${amount.toFixed(2)} (${description}). New balance: $${state.balance.toFixed(2)}.`
      };
    },

    // 7. POS Cart and Sale Completion
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; batch: ProductBatch; quantity: number }>
    ) => {
      const { product, batch, quantity } = action.payload;
      const existing = state.cart.find(item => item.batchId === batch.id);

      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > batch.remainingQuantity) {
          state.toast = {
            type: 'error',
            message: `Only ${batch.remainingQuantity} ${batch.unit} remaining in Batch #${batch.batchNumber}!`
          };
          return;
        }
        existing.quantity = nextQty;
      } else {
        if (quantity > batch.remainingQuantity) {
          state.toast = {
            type: 'error',
            message: `Only ${batch.remainingQuantity} ${batch.unit} remaining in Batch #${batch.batchNumber}!`
          };
          return;
        }
        state.cart.push({
          productId: product.id,
          batchId: batch.id,
          productName: product.name,
          batchNumber: batch.batchNumber,
          unit: batch.unit,
          costPrice: batch.costPrice,
          sellingPrice: batch.sellingPrice,
          quantity,
          maxAvailable: batch.remainingQuantity
        });
      }
    },

    updateCartQuantity: (
      state,
      action: PayloadAction<{ batchId: string; quantity: number }>
    ) => {
      const { batchId, quantity } = action.payload;
      const item = state.cart.find(i => i.batchId === batchId);
      if (!item) return;

      if (quantity <= 0) {
        state.cart = state.cart.filter(i => i.batchId !== batchId);
      } else {
        item.quantity = Math.min(quantity, item.maxAvailable);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.batchId !== action.payload);
    },

    clearCart: (state) => {
      state.cart = [];
    },

    completeSale: (
      state,
      action: PayloadAction<{
        cashierName: string;
        paymentMethod: SaleRecord['paymentMethod'];
        customerNote?: string;
      }>
    ) => {
      if (state.cart.length === 0) return;

      const { cashierName, paymentMethod, customerNote } = action.payload;
      let subtotal = 0;
      let totalCost = 0;
      const saleItems: SaleItem[] = [];

      for (const cartItem of state.cart) {
        const batch = state.batches.find(b => b.id === cartItem.batchId);
        if (!batch || batch.remainingQuantity < cartItem.quantity) {
          state.toast = {
            type: 'error',
            message: `Stock changed for ${cartItem.productName} (Batch #${cartItem.batchNumber}). Please refresh!`
          };
          return;
        }

        // Deduct from batch
        batch.remainingQuantity =
          Math.round((batch.remainingQuantity - cartItem.quantity) * 100) / 100;

        const itemTotal = Math.round(cartItem.sellingPrice * cartItem.quantity * 100) / 100;
        const itemCost = Math.round(cartItem.costPrice * cartItem.quantity * 100) / 100;
        const itemProfit = Math.round((itemTotal - itemCost) * 100) / 100;

        subtotal += itemTotal;
        totalCost += itemCost;

        saleItems.push({
          productId: cartItem.productId,
          productName: cartItem.productName,
          batchId: cartItem.batchId,
          batchNumber: cartItem.batchNumber,
          quantity: cartItem.quantity,
          unit: cartItem.unit,
          costPrice: cartItem.costPrice,
          sellingPrice: cartItem.sellingPrice,
          itemTotal,
          itemProfit
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;
      totalCost = Math.round(totalCost * 100) / 100;
      const tax = Math.round(subtotal * state.storeInfo.taxRate * 100) / 100;
      const grandTotal = Math.round((subtotal + tax) * 100) / 100;
      const totalProfit = Math.round((subtotal - totalCost) * 100) / 100;

      const receiptNumber = `YN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const saleRecord: SaleRecord = {
        id: 'sale_' + Date.now(),
        receiptNumber,
        timestamp: new Date().toISOString(),
        cashierName,
        items: saleItems,
        subtotal,
        tax,
        total: grandTotal,
        totalCost,
        totalProfit,
        paymentMethod,
        customerNote
      };

      state.sales.unshift(saleRecord);

      // Add to store cash balance (Cash and card receipts go into store funds)
      state.balance = Math.round((state.balance + grandTotal) * 100) / 100;

      // Log transaction in finance ledger
      state.transactions.unshift({
        id: 'tx_pos_' + Date.now(),
        type: 'in',
        amount: grandTotal,
        category: 'Retail Sales Revenue',
        description: `POS Sale Receipt #${receiptNumber} (${paymentMethod}) - Net Profit $${totalProfit.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        referenceId: saleRecord.id
      });

      state.cart = [];
      state.toast = {
        type: 'success',
        message: `Sale #${receiptNumber} completed! Total $${grandTotal.toFixed(2)}, Batch Profit earned: $${totalProfit.toFixed(2)}.`
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchERPState.fulfilled, (state, action) => {
        const d = action.payload;
        if (d.storeInfo) state.storeInfo = d.storeInfo;
        if (typeof d.balance === 'number') state.balance = d.balance;
        if (d.products) state.products = d.products;
        if (d.batches) state.batches = d.batches;
        if (d.transactions) state.transactions = d.transactions;
        if (d.sales) state.sales = d.sales;
        if (d.oxProductions) state.oxProductions = d.oxProductions;
        if (d.injeraProductions) state.injeraProductions = d.injeraProductions;
        state.lastSynced = new Date().toISOString();
      })
      .addCase(syncERPState.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(syncERPState.fulfilled, (state) => {
        state.syncStatus = 'saved';
        state.lastSynced = new Date().toISOString();
      })
      .addCase(syncERPState.rejected, (state) => {
        state.syncStatus = 'error';
      });
  }
});

export const {
  setActiveTab,
  setActiveInterval,
  toggleCurrency,
  setCurrencyRate,
  showToast,
  clearToast,
  addProduct,
  addBatch,
  writeOffBatchQuantity,
  recordOxBreakdownAction,
  recordInjeraProductionAction,
  addCashIn,
  recordCashOut,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  completeSale
} = erpSlice.actions;

export default erpSlice.reducer;
