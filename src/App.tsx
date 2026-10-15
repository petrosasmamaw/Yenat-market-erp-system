import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchERPState } from './store/erpSlice';
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
  const activeTab = useAppSelector(state => state.erp.activeTab);

  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch initial synchronized state on application mount
  useEffect(() => {
    dispatch(fetchERPState());
  }, [dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900">
      {/* Left Navigation Bar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Store Balance & Quick Actions */}
        <Header
          onOpenCashIn={() => setIsCashInOpen(true)}
          onOpenCashOut={() => setIsCashOutOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Tab Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100">
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

      {/* Cash In Modal */}
      <CashTransactionModal
        type="in"
        isOpen={isCashInOpen}
        onClose={() => setIsCashInOpen(false)}
      />

      {/* Cash Out Modal with negative balance guard */}
      <CashTransactionModal
        type="out"
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
      />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}
