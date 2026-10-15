import { useAppDispatch, useAppSelector } from '../store';
import { toggleCurrency, setActiveTab, syncERPState } from '../store/erpSlice';
import { formatCurrency } from '../utils/formatters';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Coins,
  ShoppingCart,
  Menu,
} from 'lucide-react';

const tabTitles = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  inventory: 'Inventory & batches',
  production: 'Production',
  purchases: 'Purchases',
  finance: 'Finance ledger',
  analytics: 'Analytics',
  settings: 'Settings',
};

export function Header({ onOpenCashIn, onOpenCashOut, onToggleMobileMenu }) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state) => state.erp.balance);
  const currency = useAppSelector((state) => state.erp.currency);
  const rate = useAppSelector((state) => state.erp.usdToEtbRate);
  const activeTab = useAppSelector((state) => state.erp.activeTab);
  const syncStatus = useAppSelector((state) => state.erp.syncStatus);
  const cart = useAppSelector((state) => state.erp.cart);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="erp-topbar">
      <div className="flex min-w-0 items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="erp-btn-ghost lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Yenat Market Las Vegas
          </p>
          <h1 className="truncate text-base font-semibold text-brand-900">
            {tabTitles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-neutral-50 px-3 py-1.5">
          <Wallet className="h-4 w-4 shrink-0 text-brand-800" />
          <div>
            <p className="text-[10px] font-medium text-neutral-500">Store balance</p>
            <p className="text-sm font-semibold tabular-nums text-brand-900">
              {formatCurrency(balance, currency, rate)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleCurrency())}
            title="Toggle USD / ETB"
            className="erp-btn-secondary ml-1 !px-2 !py-1 text-[11px]"
          >
            <Coins className="h-3.5 w-3.5 text-brand-700" />
            {currency === 'USD' ? 'USD' : 'ETB'}
          </button>
        </div>

        <button type="button" onClick={onOpenCashIn} className="erp-btn-secondary hidden sm:inline-flex">
          <ArrowDownRight className="h-3.5 w-3.5 text-brand-700" />
          Cash in
        </button>
        <button type="button" onClick={onOpenCashOut} className="erp-btn-secondary hidden sm:inline-flex">
          <ArrowUpRight className="h-3.5 w-3.5 text-neutral-600" />
          Cash out
        </button>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('pos'))}
          className={`erp-btn-primary ${activeTab === 'pos' ? 'ring-2 ring-brand-200' : ''}`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          POS
          {cartTotalItems > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-900 tabular-nums">
              {cartTotalItems}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => dispatch(syncERPState())}
          title="Sync to server"
          className="erp-btn-ghost"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin text-brand-700' : ''}`}
          />
        </button>
      </div>
    </header>
  );
}
