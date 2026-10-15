import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleCurrency, setActiveTab, syncERPState } from '../store/erpSlice';
import { formatCurrency } from '../utils/formatters';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Coins,
  ShoppingCart
} from 'lucide-react';

interface HeaderProps {
  onOpenCashIn: () => void;
  onOpenCashOut: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCashIn, onOpenCashOut, onToggleMobileMenu }) => {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(state => state.erp.balance);
  const currency = useAppSelector(state => state.erp.currency);
  const rate = useAppSelector(state => state.erp.usdToEtbRate);
  const activeTab = useAppSelector(state => state.erp.activeTab);
  const syncStatus = useAppSelector(state => state.erp.syncStatus);
  const cart = useAppSelector(state => state.erp.cart);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabTitles: Record<string, string> = {
    dashboard: 'Store Overview & Real-Time Pulse',
    pos: 'Point of Sale Register',
    inventory: 'Stock Catalog & Batch Control',
    production: 'In-House Butchery & Bakery Breakdown',
    purchases: 'Inward Purchases & Goods Receipt',
    finance: 'Financial Ledger & Cash Flow Manager',
    analytics: 'Sales & Profit Margin Analytics',
    settings: 'Shop Configuration & Neon Database'
  };

  return (
    <header className="min-h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 py-2 sm:py-0 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
      {/* Title & Context + Mobile Menu button */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open Navigation Menu"
            className="p-1.5 rounded-lg border border-neutral-200 lg:hidden text-neutral-700 hover:bg-neutral-100"
          >
            <span className="block w-4 h-0.5 bg-neutral-800 mb-1"></span>
            <span className="block w-4 h-0.5 bg-neutral-800 mb-1"></span>
            <span className="block w-4 h-0.5 bg-neutral-800"></span>
          </button>
        )}
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Yenat Market Las Vegas
          </span>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
            {tabTitles[activeTab] || 'Dashboard'}
          </h2>
        </div>
      </div>

      {/* Middle & Right Actions */}
      <div className="flex items-center gap-4">
        {/* Store Balance Indicator (Crucial feature per user brief) */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <Wallet className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <div className="text-[11px] font-medium text-emerald-800">Available Store Balance</div>
            <div className="text-sm font-bold text-emerald-950 tabular-nums">
              {formatCurrency(balance, currency, rate)}
            </div>
          </div>

          {/* Currency Toggle (USD <-> ETB Birr) */}
          <button
            onClick={() => dispatch(toggleCurrency())}
            title="Toggle between US Dollars and Ethiopian Birr"
            className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/60 transition-colors flex items-center gap-1"
          >
            <Coins className="w-3 h-3 text-amber-600" />
            <span>{currency === 'USD' ? 'USD $' : 'ETB ብር'}</span>
          </button>
        </div>

        {/* Cash In / Out Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCashIn}
            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Money In</span>
          </button>

          <button
            onClick={onOpenCashOut}
            className="px-2.5 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
            <span>Pay Money Out</span>
          </button>
        </div>

        {/* POS Cart shortcut */}
        <button
          onClick={() => dispatch(setActiveTab('pos'))}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-colors ${
            activeTab === 'pos'
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-800 text-white hover:bg-emerald-900'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>POS Register</span>
          {cartTotalItems > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-emerald-900 text-[11px] font-bold flex items-center justify-center tabular-nums">
              {cartTotalItems}
            </span>
          )}
        </button>

        {/* Sync Status Button */}
        <button
          onClick={() => dispatch(syncERPState())}
          title="Save all changes to server persistence"
          className="p-1.5 rounded text-neutral-500 hover:text-emerald-800 hover:bg-neutral-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
