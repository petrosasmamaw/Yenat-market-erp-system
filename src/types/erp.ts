export type IntervalFilter = '1day' | '1week' | '2weeks' | '1month' | '3months' | 'all';
export type CurrencyMode = 'USD' | 'ETB';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Fresh Butchery' | 'Artisan Bakery' | 'Spices & Seasonings' | 'Dairy & Traditional Fats' | 'Imported Grains & Flours' | 'Coffee & Tea' | 'Beverages & Soft Drinks' | 'Pantry & Sundries';
  unit: string; // 'lb', 'pack', 'jar (16oz)', 'bag', 'case'
  isFresh: boolean;
  shelfLifeDays: number;
  description: string;
  minStockThreshold: number;
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  inwardDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  initialQuantity: number;
  remainingQuantity: number;
  unit: string;
  costPrice: number; // Cost paid for this specific batch
  sellingPrice: number;
  source: 'Direct Purchase' | 'In-House Butchery' | 'In-House Bakery' | 'In-House Production';
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  itemTotal: number;
  itemProfit: number;
}

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Mobile / Zelle';
  customerNote?: string;
}

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  description: string;
  timestamp: string;
  referenceId?: string;
}

export interface OxMeatCutYield {
  cutName: string;
  weightLbs: number;
  costPerLb: number;
  sellingPricePerLb: number;
  batchId?: string;
}

export interface OxProductionRecord {
  id: string;
  date: string;
  oxTagNumber: string;
  oxPurchaseCost: number;
  slaughterAndProcessingCost: number;
  totalCost: number;
  totalYieldLbs: number;
  averageCostPerLb: number;
  cuts: OxMeatCutYield[];
  butcherName: string;
  notes?: string;
}

export interface InjeraProductionRecord {
  id: string;
  date: string;
  teffFlourCost: number;
  gasAndPowerCost: number;
  packagingCost: number;
  totalCost: number;
  packsProduced: number;
  costPerPack: number;
  sellingPricePerPack: number;
  batchId: string;
  bakerName: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
}
