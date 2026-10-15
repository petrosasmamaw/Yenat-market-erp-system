import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab } from '../store/erpSlice';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Beef,
  PackagePlus,
  Wallet,
  TrendingUp,
  Settings,
  Store,
  LogOut,
} from 'lucide-react';

export function Sidebar({ isMobileOpen, onCloseMobile }) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.erp.activeTab);
  const currentUser = useAppSelector((state) => state.auth.user);
  const batches = useAppSelector((state) => state.erp.batches);

  const today = new Date().toISOString().split('T')[0];
  const threeDaysOut = new Date();
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);
  const threeDaysStr = threeDaysOut.toISOString().split('T')[0];
  const urgentBatchesCount = batches.filter(
    (b) => b.remainingQuantity > 0 && b.expiryDate <= threeDaysStr
  ).length;

  const handleNavClick = (tabId) => {
    dispatch(setActiveTab(tabId));
    onCloseMobile?.();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: urgentBatchesCount > 0 ? urgentBatchesCount : undefined,
    },
    { id: 'production', label: 'Production', icon: Beef },
    { id: 'purchases', label: 'Purchases', icon: PackagePlus },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const mobileTransform = isMobileOpen
    ? 'translate-x-0'
    : '-translate-x-full lg:translate-x-0';

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside className={`erp-sidebar ${mobileTransform}`}>
        <div className="erp-sidebar-brand">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-800 ring-1 ring-brand-100">
            <Store className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-900">Yenat Market</p>
            <p className="truncate text-[11px] font-medium text-neutral-500">Las Vegas ERP</p>
          </div>
        </div>

        <nav className="erp-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`erp-nav-item ${isActive ? 'erp-nav-item-active' : ''}`}
              >
                <Icon
                  className={`erp-nav-icon ${isActive ? 'erp-nav-icon-active' : ''}`}
                  strokeWidth={2}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && (
                  <span className="erp-badge-warning tabular-nums">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="erp-sidebar-footer">
          <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800 ring-1 ring-brand-100"
              aria-hidden="true"
            >
              {currentUser?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-800">
                {currentUser?.name || 'Staff'}
              </p>
              <p className="truncate text-[11px] text-neutral-500">
                {currentUser?.role || 'User'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="erp-btn-ghost shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
