import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { validateSession } from './store/authSlice';
import { fetchERPState } from './store/erpSlice';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { CashTransactionModal } from './components/CashTransactionModal';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { ProductionView } from './components/ProductionView';
import { PurchasesView } from './components/PurchasesView';
import { FinanceView } from './components/FinanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const activeTab = useAppSelector((state) => state.erp.activeTab);
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    dispatch(validateSession()).then((result) => {
      if (validateSession.fulfilled.match(result)) {
        dispatch(fetchERPState());
      }
    });
  }, [dispatch]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-surface)]">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="erp-shell-main">
        <Header
          onOpenCashIn={() => setIsCashInOpen(true)}
          onOpenCashOut={() => setIsCashOutOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen((open) => !open)}
        />

        <main className="erp-page">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenCashIn={() => setIsCashInOpen(true)}
              onOpenCashOut={() => setIsCashOutOpen(true)}
            />
          )}
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'production' && <ProductionView />}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'finance' && (
            <FinanceView
              onOpenCashIn={() => setIsCashInOpen(true)}
              onOpenCashOut={() => setIsCashOutOpen(true)}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <CashTransactionModal type="in" isOpen={isCashInOpen} onClose={() => setIsCashInOpen(false)} />
      <CashTransactionModal type="out" isOpen={isCashOutOpen} onClose={() => setIsCashOutOpen(false)} />
      <Toast />
    </div>
  );
}
