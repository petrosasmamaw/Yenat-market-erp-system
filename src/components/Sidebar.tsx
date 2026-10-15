import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab } from '../store/erpSlice';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Beef,
  PackagePlus,
  Wallet,
  TrendingUp,
  Settings,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.erp.activeTab);
  const currentUser = useAppSelector(state => state.auth.user);
  const batches = useAppSelector(state => state.erp.batches);

  // Check how many batches are expiring soon (<= 3 days)
  const today = new Date().toISOString().split('T')[0];
  const threeDaysOut = new Date();
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);
  const threeDaysStr = threeDaysOut.toISOString().split('T')[0];

  const urgentBatchesCount = batches.filter(
    b => b.remainingQuantity > 0 && b.expiryDate <= threeDaysStr
  ).length;

  const handleNavClick = (tabId: any) => {
    dispatch(setActiveTab(tabId));
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      subtitle: 'Overview & daily totals',
      icon: LayoutDashboard
    },
    {
      id: 'pos' as const,
      label: 'Point of Sale (POS)',
      subtitle: 'Cash register & batch sell',
      icon: ShoppingCart
    },
    {
      id: 'inventory' as const,
      label: 'Inventory & Batches',
      subtitle: 'Stock catalog & expiry',
      icon: Boxes,
      badge: urgentBatchesCount > 0 ? `${urgentBatchesCount} expiring` : undefined
    },
    {
      id: 'production' as const,
      label: 'In-House Production',
      subtitle: 'Ox butchery & Injera bakery',
      icon: Beef
    },
    {
      id: 'purchases' as const,
      label: 'Purchases & Inward',
      subtitle: 'Buy stock for store',
      icon: PackagePlus
    },
    {
      id: 'finance' as const,
      label: 'Financial Ledger',
      subtitle: 'Balance, in & out cash flow',
      icon: Wallet
    },
    {
      id: 'analytics' as const,
      label: 'Sales & Profit Analytics',
      subtitle: 'Interval trends & margins',
      icon: TrendingUp
    },
    {
      id: 'settings' as const,
      label: 'Store & Database',
      subtitle: 'Users, Neon DB & currency',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-neutral-200 flex flex-col border-r border-emerald-900/60 shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-inner shrink-0">
              የ
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-bold tracking-tight text-white truncate">
                Yenat Market
              </h1>
              <p className="text-xs text-amber-300/90 font-medium truncate">
                Las Vegas · Store ERP
              </p>
            </div>
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-600 text-white font-medium shadow-sm'
                    : 'text-neutral-300 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[11px] font-semibold text-amber-200 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs truncate ${isActive ? 'text-amber-100' : 'text-emerald-400/80'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

      {/* Live Fresh Bakery & Butchery Alert Box */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-emerald-900/40 border border-emerald-800/60 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
          <Flame className="w-3.5 h-3.5" />
          <span>Fresh Production Active</span>
        </div>
        <p className="text-emerald-200/80 leading-relaxed text-[11px]">
          Injera sourdough and Prime Siga cuts tracked by specific animal & bake batches.
        </p>
      </div>

      {/* User Status Bar */}
      <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser?.name || 'Store Cashier'}
            </div>
            <div className="text-[11px] text-emerald-400 truncate">
              {currentUser?.role || 'Staff'}
            </div>
          </div>
        </div>
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>
      </aside>
    </>
  );
};
