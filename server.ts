import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'yenat_market_las_vegas_secret_key_2026';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'erp_store_state.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data for Yenat Market Las Vegas
const initialERPData = {
  storeInfo: {
    name: 'Yenat Market Las Vegas',
    address: '4780 W Tropicana Ave, Las Vegas, NV 89103',
    phone: '(702) 873-1224',
    email: 'contact@yenatmarketvegas.com',
    currency: 'USD',
    taxRate: 0.08375 // Nevada / Clark County sales tax
  },
  users: [
    { id: 'u1', username: 'admin', name: 'Almaz Tadesse', role: 'Store Owner / Manager', email: 'almaz@yenatmarketvegas.com', pin: '2026' },
    { id: 'u2', username: 'cashier', name: 'Dawit Bekele', role: 'Cashier & Sales', email: 'dawit@yenatmarketvegas.com', pin: '1234' },
    { id: 'u3', username: 'butcher', name: 'Haile Menelik', role: 'Master Butcher & Baker', email: 'haile@yenatmarketvegas.com', pin: '5678' }
  ],
  balance: 14850.00,
  products: [
    {
      id: 'prod_berbere',
      sku: 'SPICE-BER-01',
      name: 'Berbere (Authentic Ethiopian Red Pepper Blend)',
      category: 'Spices & Seasonings',
      unit: 'lb',
      isFresh: false,
      shelfLifeDays: 365,
      description: 'Hand-blended sundried red chilis with garlic, ginger, rue, and korarima.',
      minStockThreshold: 20
    },
    {
      id: 'prod_siga_tibs',
      sku: 'MEAT-TIB-01',
      name: 'Fresh Siga Tibs (Tender Beef Cubes)',
      category: 'Fresh Butchery',
      unit: 'lb',
      isFresh: true,
      shelfLifeDays: 5,
      description: 'Prime hand-cut beef tender for authentic Ethiopian tibs stir-fry.',
      minStockThreshold: 15
    },
    {
      id: 'prod_siga_kitfo',
      sku: 'MEAT-KTF-01',
      name: 'Fresh Kitfo Meat (Prime Lean Beef)',
      category: 'Fresh Butchery',
      unit: 'lb',
      isFresh: true,
      shelfLifeDays: 4,
      description: 'Finely minced or sliced extra-lean top round beef for kitfo.',
      minStockThreshold: 10
    },
    {
      id: 'prod_siga_kurt',
      sku: 'MEAT-KRT-01',
      name: 'Fresh Siga Kurt (Raw Beef Cut)',
      category: 'Fresh Butchery',
      unit: 'lb',
      isFresh: true,
      shelfLifeDays: 4,
      description: 'Tender prime raw beef cut for traditional Kurt feasts with awaze.',
      minStockThreshold: 10
    },
    {
      id: 'prod_siga_ribs',
      sku: 'MEAT-RIB-01',
      name: 'Beef Short Ribs & Soup Cuts',
      category: 'Fresh Butchery',
      unit: 'lb',
      isFresh: true,
      shelfLifeDays: 6,
      description: 'Marbled short ribs and soup cuts for rich wot stew and soups.',
      minStockThreshold: 15
    },
    {
      id: 'prod_injera',
      sku: 'BAKE-INJ-01',
      name: 'Fresh House-Baked Injera (5-Pack)',
      category: 'Artisan Bakery',
      unit: 'pack',
      isFresh: true,
      shelfLifeDays: 4,
      description: '100% natural fermented Teff sourdough injera flatbread, baked fresh daily.',
      minStockThreshold: 30
    },
    {
      id: 'prod_kibe',
      sku: 'DAIRY-KIB-01',
      name: 'Artisan Spiced Kibe (Niter Kibbeh Clarified Butter)',
      category: 'Dairy & Traditional Fats',
      unit: 'jar (16oz)',
      isFresh: false,
      shelfLifeDays: 90,
      description: 'Traditional slow-simmered clarified butter infused with besobila, kosseret, and garlic.',
      minStockThreshold: 15
    },
    {
      id: 'prod_teff_flour',
      sku: 'GRAIN-TEF-01',
      name: 'Brown & Ivory Teff Grain / Flour (25 lb)',
      category: 'Imported Grains & Flours',
      unit: 'bag',
      isFresh: false,
      shelfLifeDays: 300,
      description: 'Ancient Ethiopian gluten-free wholesome Teff grain milled for injera.',
      minStockThreshold: 10
    },
    {
      id: 'prod_coffee_yirga',
      sku: 'COF-YRG-01',
      name: 'Ethiopian Yirgacheffe Roasted Coffee Beans (1 lb)',
      category: 'Coffee & Tea',
      unit: 'bag',
      isFresh: false,
      shelfLifeDays: 180,
      description: 'Floral, jasmine, and citrus notes roasted fresh for Buna ceremonies.',
      minStockThreshold: 20
    },
    {
      id: 'prod_shiro',
      sku: 'SPICE-SHR-01',
      name: 'Traditional Shiro Powder (Chickpea Stew Blend)',
      category: 'Spices & Seasonings',
      unit: 'lb',
      isFresh: false,
      shelfLifeDays: 365,
      description: 'Roasted chickpea and broad bean powder seasoned with herbs and garlic.',
      minStockThreshold: 25
    },
    {
      id: 'prod_mitmita',
      sku: 'SPICE-MIT-01',
      name: 'Mitmita Hot Chili Seasoning Blend',
      category: 'Spices & Seasonings',
      unit: 'lb',
      isFresh: false,
      shelfLifeDays: 365,
      description: 'Fiery bird\'s eye chili powder with cloves and cardamom for Kitfo.',
      minStockThreshold: 15
    },
    {
      id: 'prod_mirinda',
      sku: 'BEV-MRN-01',
      name: 'Mirinda & Ethiopian Sodas (Case of 24)',
      category: 'Beverages & Soft Drinks',
      unit: 'case',
      isFresh: false,
      shelfLifeDays: 360,
      description: 'Popular citrus sodas and sparkling drinks enjoyed at Ethiopian tables.',
      minStockThreshold: 8
    }
  ],
  batches: [
    // Berbere batches showing changing prices over time
    {
      id: 'b_ber_001',
      batchNumber: 'BER-2026-B1',
      productId: 'prod_berbere',
      productName: 'Berbere (Authentic Ethiopian Red Pepper Blend)',
      inwardDate: '2026-10-01',
      expiryDate: '2027-10-01',
      initialQuantity: 100,
      remainingQuantity: 32,
      unit: 'lb',
      costPrice: 3.50, // Bought at 3.50
      sellingPrice: 7.99,
      source: 'Direct Purchase',
      notes: 'Imported Batch 1 direct from Addis Abeba'
    },
    {
      id: 'b_ber_002',
      batchNumber: 'BER-2026-B2',
      productId: 'prod_berbere',
      productName: 'Berbere (Authentic Ethiopian Red Pepper Blend)',
      inwardDate: '2026-10-10',
      expiryDate: '2027-10-10',
      initialQuantity: 120,
      remainingQuantity: 120,
      unit: 'lb',
      costPrice: 4.00, // Cost went up to 4.00
      sellingPrice: 8.49,
      source: 'Direct Purchase',
      notes: 'New supplier shipment with adjusted import freight'
    },
    // Fresh meat batches from Ox butchery
    {
      id: 'b_tibs_001',
      batchNumber: 'OX-2026-1014-TIB',
      productId: 'prod_siga_tibs',
      productName: 'Fresh Siga Tibs (Tender Beef Cubes)',
      inwardDate: '2026-10-14',
      expiryDate: '2026-10-19',
      initialQuantity: 85,
      remainingQuantity: 62,
      unit: 'lb',
      costPrice: 5.15,
      sellingPrice: 10.99,
      source: 'In-House Butchery',
      notes: 'Butchered from Angus Ox #104'
    },
    {
      id: 'b_ktf_001',
      batchNumber: 'OX-2026-1014-KTF',
      productId: 'prod_siga_kitfo',
      productName: 'Fresh Kitfo Meat (Prime Lean Beef)',
      inwardDate: '2026-10-14',
      expiryDate: '2026-10-18',
      initialQuantity: 50,
      remainingQuantity: 28,
      unit: 'lb',
      costPrice: 5.15,
      sellingPrice: 12.99,
      source: 'In-House Butchery',
      notes: 'Top round lean cuts butchered from Ox #104'
    },
    {
      id: 'b_krt_001',
      batchNumber: 'OX-2026-1014-KRT',
      productId: 'prod_siga_kurt',
      productName: 'Fresh Siga Kurt (Raw Beef Cut)',
      inwardDate: '2026-10-14',
      expiryDate: '2026-10-18',
      initialQuantity: 40,
      remainingQuantity: 18,
      unit: 'lb',
      costPrice: 5.15,
      sellingPrice: 11.49,
      source: 'In-House Butchery',
      notes: 'Chilled prime beef for Kurt'
    },
    {
      id: 'b_rib_001',
      batchNumber: 'OX-2026-1014-RIB',
      productId: 'prod_siga_ribs',
      productName: 'Beef Short Ribs & Soup Cuts',
      inwardDate: '2026-10-14',
      expiryDate: '2026-10-20',
      initialQuantity: 60,
      remainingQuantity: 45,
      unit: 'lb',
      costPrice: 5.15,
      sellingPrice: 7.99,
      source: 'In-House Butchery',
      notes: 'Rib bones and marrow broth meat'
    },
    // Fresh Injera baked in-house
    {
      id: 'b_inj_001',
      batchNumber: 'BAKE-2026-1015-AM',
      productId: 'prod_injera',
      productName: 'Fresh House-Baked Injera (5-Pack)',
      inwardDate: '2026-10-15',
      expiryDate: '2026-10-19',
      initialQuantity: 90,
      remainingQuantity: 74,
      unit: 'pack',
      costPrice: 1.85,
      sellingPrice: 4.99,
      source: 'In-House Bakery',
      notes: 'Morning Teff bake batch #1'
    },
    {
      id: 'b_inj_yesterday',
      batchNumber: 'BAKE-2026-1013-PM',
      productId: 'prod_injera',
      productName: 'Fresh House-Baked Injera (5-Pack)',
      inwardDate: '2026-10-13',
      expiryDate: '2026-10-16', // Expiring tomorrow -> alerts tab
      initialQuantity: 80,
      remainingQuantity: 9,
      unit: 'pack',
      costPrice: 1.85,
      sellingPrice: 4.99,
      source: 'In-House Bakery',
      notes: 'Remaining packs from Tuesday bake'
    },
    // Artisan Kibe
    {
      id: 'b_kib_001',
      batchNumber: 'KIB-2026-B3',
      productId: 'prod_kibe',
      productName: 'Artisan Spiced Kibe (Niter Kibbeh Clarified Butter)',
      inwardDate: '2026-09-28',
      expiryDate: '2026-12-28',
      initialQuantity: 60,
      remainingQuantity: 34,
      unit: 'jar (16oz)',
      costPrice: 7.20,
      sellingPrice: 14.50,
      source: 'In-House Production',
      notes: 'Clarified with traditional kosseret and cardamom'
    },
    // Teff grain & Coffee
    {
      id: 'b_tef_001',
      batchNumber: 'TEF-2026-B1',
      productId: 'prod_teff_flour',
      productName: 'Brown & Ivory Teff Grain / Flour (25 lb)',
      inwardDate: '2026-09-15',
      expiryDate: '2027-07-15',
      initialQuantity: 40,
      remainingQuantity: 22,
      unit: 'bag',
      costPrice: 32.00,
      sellingPrice: 49.99,
      source: 'Direct Purchase',
      notes: 'Premium grain from Idaho Teff co'
    },
    {
      id: 'b_cof_001',
      batchNumber: 'COF-YRG-2026',
      productId: 'prod_coffee_yirga',
      productName: 'Ethiopian Yirgacheffe Roasted Coffee Beans (1 lb)',
      inwardDate: '2026-10-02',
      expiryDate: '2027-04-02',
      initialQuantity: 50,
      remainingQuantity: 36,
      unit: 'bag',
      costPrice: 6.80,
      sellingPrice: 15.99,
      source: 'Direct Purchase',
      notes: 'Washed Yirgacheffe Grade 1'
    },
    {
      id: 'b_shr_001',
      batchNumber: 'SHR-2026-B1',
      productId: 'prod_shiro',
      productName: 'Traditional Shiro Powder (Chickpea Stew Blend)',
      inwardDate: '2026-09-20',
      expiryDate: '2027-09-20',
      initialQuantity: 80,
      remainingQuantity: 55,
      unit: 'lb',
      costPrice: 3.20,
      sellingPrice: 6.99,
      source: 'Direct Purchase',
      notes: 'Finely milled Shiro Tagamino blend'
    }
  ],
  transactions: [
    {
      id: 'tx_init',
      type: 'in',
      amount: 15000.00,
      category: 'Owner Equity & Starting Cash',
      description: 'Opening register & operating cash float for Yenat Market',
      timestamp: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'tx_ox_buy',
      type: 'out',
      amount: 1450.00,
      category: 'Live Stock / Carcass Purchase',
      description: 'Bought Angus Whole Ox for fresh Siga butcher cuts & processing fee',
      timestamp: '2026-10-14T07:30:00.000Z'
    },
    {
      id: 'tx_teff_buy',
      type: 'out',
      amount: 640.00,
      category: 'Bakery Raw Ingredients',
      description: 'Purchased 20 bags of premium Teff flour for daily Injera baking',
      timestamp: '2026-10-12T09:15:00.000Z'
    },
    {
      id: 'tx_rent',
      type: 'out',
      amount: 2800.00,
      category: 'Store Rent & Lease',
      description: 'Monthly store building rent for Tropicana Ave shop',
      timestamp: '2026-10-05T10:00:00.000Z'
    },
    {
      id: 'tx_wages',
      type: 'out',
      amount: 1600.00,
      category: 'Staff & Worker Wages',
      description: 'Bi-weekly worker wage payment for butcher and baking staff',
      timestamp: '2026-10-10T16:00:00.000Z'
    },
    {
      id: 'tx_utility',
      type: 'out',
      amount: 480.00,
      category: 'Utilities & Power',
      description: 'NV Energy electricity bill for commercial cold storage and walk-in meat cooler',
      timestamp: '2026-10-08T11:00:00.000Z'
    },
    {
      id: 'tx_sale_1',
      type: 'in',
      amount: 1245.50,
      category: 'Retail Sales Revenue',
      description: 'Cash and POS card receipts from weekend shoppers',
      timestamp: '2026-10-11T19:30:00.000Z'
    },
    {
      id: 'tx_sale_2',
      type: 'in',
      amount: 1574.50,
      category: 'Retail Sales Revenue',
      description: 'Butcher counter and fresh injera weekday sales volume',
      timestamp: '2026-10-14T20:00:00.000Z'
    },
    {
      id: 'tx_sale_today',
      type: 'in',
      amount: 400.00,
      category: 'Retail Sales Revenue',
      description: 'Morning POS register sales for Injera, Siga Tibs, and Berbere',
      timestamp: '2026-10-15T11:00:00.000Z'
    }
  ],
  sales: [
    {
      id: 'sale_001',
      receiptNumber: 'YN-2026-0891',
      timestamp: '2026-10-14T14:22:00.000Z',
      cashierName: 'Dawit Bekele',
      items: [
        {
          productId: 'prod_siga_tibs',
          productName: 'Fresh Siga Tibs (Tender Beef Cubes)',
          batchId: 'b_tibs_001',
          batchNumber: 'OX-2026-1014-TIB',
          quantity: 5,
          unit: 'lb',
          costPrice: 5.15,
          sellingPrice: 10.99,
          itemTotal: 54.95,
          itemProfit: 29.20
        },
        {
          productId: 'prod_injera',
          productName: 'Fresh House-Baked Injera (5-Pack)',
          batchId: 'b_inj_yesterday',
          batchNumber: 'BAKE-2026-1013-PM',
          quantity: 4,
          unit: 'pack',
          costPrice: 1.85,
          sellingPrice: 4.99,
          itemTotal: 19.96,
          itemProfit: 12.56
        },
        {
          productId: 'prod_berbere',
          productName: 'Berbere (Authentic Ethiopian Red Pepper Blend)',
          batchId: 'b_ber_001',
          batchNumber: 'BER-2026-B1',
          quantity: 2,
          unit: 'lb',
          costPrice: 3.50,
          sellingPrice: 7.99,
          itemTotal: 15.98,
          itemProfit: 8.98
        }
      ],
      subtotal: 90.89,
      tax: 7.61,
      total: 98.50,
      totalCost: 39.15,
      totalProfit: 51.74,
      paymentMethod: 'Cash',
      customerNote: 'Customer picked older Berbere batch #1'
    },
    {
      id: 'sale_002',
      receiptNumber: 'YN-2026-0892',
      timestamp: '2026-10-15T09:40:00.000Z',
      cashierName: 'Almaz Tadesse',
      items: [
        {
          productId: 'prod_siga_kitfo',
          productName: 'Fresh Kitfo Meat (Prime Lean Beef)',
          batchId: 'b_ktf_001',
          batchNumber: 'OX-2026-1014-KTF',
          quantity: 4,
          unit: 'lb',
          costPrice: 5.15,
          sellingPrice: 12.99,
          itemTotal: 51.96,
          itemProfit: 31.36
        },
        {
          productId: 'prod_kibe',
          productName: 'Artisan Spiced Kibe (Niter Kibbeh Clarified Butter)',
          batchId: 'b_kib_001',
          batchNumber: 'KIB-2026-B3',
          quantity: 1,
          unit: 'jar (16oz)',
          costPrice: 7.20,
          sellingPrice: 14.50,
          itemTotal: 14.50,
          itemProfit: 7.30
        },
        {
          productId: 'prod_injera',
          productName: 'Fresh House-Baked Injera (5-Pack)',
          batchId: 'b_inj_001',
          batchNumber: 'BAKE-2026-1015-AM',
          quantity: 3,
          unit: 'pack',
          costPrice: 1.85,
          sellingPrice: 4.99,
          itemTotal: 14.97,
          itemProfit: 9.42
        }
      ],
      subtotal: 81.43,
      tax: 6.82,
      total: 88.25,
      totalCost: 33.35,
      totalProfit: 48.08,
      paymentMethod: 'Credit Card',
      customerNote: ''
    }
  ],
  oxProductions: [
    {
      id: 'ox_prod_001',
      date: '2026-10-14',
      oxTagNumber: 'OX-ANGUS-104',
      oxPurchaseCost: 1350.00,
      slaughterAndProcessingCost: 100.00,
      totalCost: 1450.00,
      totalYieldLbs: 281.5,
      averageCostPerLb: 5.15,
      cuts: [
        { cutName: 'Siga Tibs', weightLbs: 85, costPerLb: 5.15, sellingPricePerLb: 10.99, batchId: 'b_tibs_001' },
        { cutName: 'Kitfo Cut', weightLbs: 50, costPerLb: 5.15, sellingPricePerLb: 12.99, batchId: 'b_ktf_001' },
        { cutName: 'Kurt Cut', weightLbs: 40, costPerLb: 5.15, sellingPricePerLb: 11.49, batchId: 'b_krt_001' },
        { cutName: 'Short Ribs & Stew Cuts', weightLbs: 60, costPerLb: 5.15, sellingPricePerLb: 7.99, batchId: 'b_rib_001' },
        { cutName: 'Marrow Bones & Suet', weightLbs: 46.5, costPerLb: 5.15, sellingPricePerLb: 3.50, batchId: '' }
      ],
      butcherName: 'Haile Menelik',
      notes: 'Prime Nevada cattle carcass broke down into clean cuts'
    }
  ],
  injeraProductions: [
    {
      id: 'inj_prod_001',
      date: '2026-10-15',
      teffFlourCost: 130.00,
      gasAndPowerCost: 18.00,
      packagingCost: 18.50,
      totalCost: 166.50,
      packsProduced: 90,
      costPerPack: 1.85,
      sellingPricePerPack: 4.99,
      batchId: 'b_inj_001',
      bakerName: 'Haile Menelik',
      notes: 'Morning fresh fermentation bake'
    }
  ],
  neonConfig: {
    connectionUrl: '',
    connected: false,
    lastSynced: null
  }
};

// Load saved data or initialize with seed
function getStoreData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return initialERPData;
    }
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialERPData, null, 2), 'utf-8');
  return initialERPData;
}

function saveStoreData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Authentication middleware
function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// API Routes

// 1. Auth Login
app.post('/api/auth/login', (req, res) => {
  const { username, pin } = req.body;
  const data = getStoreData();
  const user = data.users.find(
    (u: any) => u.username.toLowerCase() === (username || '').toLowerCase() && u.pin === pin
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or PIN' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email }
  });
});

// 2. Auth Profile
app.get('/api/auth/me', authenticateJWT, (req, res) => {
  return res.json({ user: (req as any).user });
});

// 3. Get Full Store ERP State
app.get('/api/data', (req, res) => {
  const data = getStoreData();
  return res.json(data);
});

// 4. Sync / Save Store State
app.post('/api/sync', (req, res) => {
  const incomingData = req.body;
  if (!incomingData || !incomingData.products || !incomingData.batches) {
    return res.status(400).json({ error: 'Invalid payload structure' });
  }
  saveStoreData(incomingData);
  return res.json({ success: true, timestamp: new Date().toISOString() });
});

// 5. Financial Ledger Transaction
app.post('/api/finance/transaction', (req, res) => {
  const { type, amount, category, description, referenceId } = req.body;
  if (!type || !amount || amount <= 0 || !category || !description) {
    return res.status(400).json({ error: 'Please provide valid type, amount, category and description' });
  }

  const data = getStoreData();

  if (type === 'out') {
    if (data.balance - amount < 0) {
      return res.status(400).json({
        error: `Insufficient store balance! Current balance is $${data.balance.toFixed(2)}, which cannot cover $${amount.toFixed(2)}.`
      });
    }
    data.balance = Math.round((data.balance - amount) * 100) / 100;
  } else if (type === 'in') {
    data.balance = Math.round((data.balance + amount) * 100) / 100;
  }

  const newTx = {
    id: 'tx_' + Date.now(),
    type,
    amount: Math.round(amount * 100) / 100,
    category,
    description,
    timestamp: new Date().toISOString(),
    referenceId
  };

  data.transactions.unshift(newTx);
  saveStoreData(data);

  return res.json({
    success: true,
    newBalance: data.balance,
    transaction: newTx
  });
});

// 6. Test Neon Database connection string
app.post('/api/neon/test', async (req, res) => {
  const { connectionUrl } = req.body;
  if (!connectionUrl || !connectionUrl.startsWith('postgres')) {
    return res.status(400).json({ error: 'Invalid PostgreSQL/Neon connection URL format' });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(connectionUrl);
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    const data = getStoreData();
    data.neonConfig = {
      connectionUrl,
      connected: true,
      lastSynced: new Date().toISOString()
    };
    saveStoreData(data);
    return res.json({ success: true, message: 'Connected to Neon database successfully!', result });
  } catch (err: any) {
    return res.status(500).json({
      error: `Could not connect to Neon database: ${err.message || 'Check connection string credentials and network'}`
    });
  }
});

async function startServer() {
  // Mount Vite middleware for SPA
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yenat Market Las Vegas ERP server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
