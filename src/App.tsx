import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileSimulator } from './components/mobile/MobileSimulator';
import { WebBackoffice } from './components/web/WebBackoffice';
import { FeasibilityStudy } from './components/feasibility/FeasibilityStudy';
import { RoiCalculator } from './components/feasibility/RoiCalculator';
import { RequirementsAssistant } from './components/ai/RequirementsAssistant';
import { TabletMenu } from './components/tablet/TabletMenu';
import { InteractiveDemoTour } from './components/common/InteractiveDemoTour';
import { CloudSyncModal } from './components/common/CloudSyncModal';
import { syncEngine, SyncPayload } from './utils/syncEngine';
import { 
  INITIAL_MENU, 
  INITIAL_TABLES, 
  INITIAL_TRANSFER_LOGS,
  ESTABLISHMENT_PROFILES
} from './data/mockData';
import { 
  ActiveTab, 
  TableOrSpot, 
  BeachItem, 
  TableTransferLog, 
  OrderItem,
  EstablishmentProfile
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulador_mobile');
  const [profiles] = useState<EstablishmentProfile[]>(ESTABLISHMENT_PROFILES);
  const [activeProfile, setActiveProfile] = useState<EstablishmentProfile>(ESTABLISHMENT_PROFILES[0]);
  const [tables, setTables] = useState<TableOrSpot[]>(() => {
    const saved = syncEngine.getSavedState();
    return saved?.tables && saved.tables.length > 0 ? saved.tables : INITIAL_TABLES;
  });
  const [menu, setMenu] = useState<BeachItem[]>(() => {
    const saved = syncEngine.getSavedState();
    return saved?.menu && saved.menu.length > 0 ? saved.menu : INITIAL_MENU;
  });
  const [transferLogs, setTransferLogs] = useState<TableTransferLog[]>(() => {
    const saved = syncEngine.getSavedState();
    return saved?.transferLogs && saved.transferLogs.length > 0 ? saved.transferLogs : INITIAL_TRANSFER_LOGS;
  });
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);

  // Sync to local storage & broadcast changes to other tabs
  useEffect(() => {
    syncEngine.broadcastUpdate({
      tables,
      menu,
      transferLogs,
      activeProfileId: activeProfile.id,
      senderNode: 'App-Primary',
    });
  }, [tables, menu, transferLogs, activeProfile.id]);

  // Subscribe to updates from other open browser tabs
  useEffect(() => {
    syncEngine.subscribe((payload: SyncPayload) => {
      if (payload.tables) setTables(payload.tables);
      if (payload.menu) setMenu(payload.menu);
      if (payload.transferLogs) setTransferLogs(payload.transferLogs);
      if (payload.activeProfileId) {
        const p = profiles.find((prof) => prof.id === payload.activeProfileId);
        if (p) setActiveProfile(p);
      }
    });
  }, [profiles]);

  const handleUpdateOrderStatus = (
    tableId: string,
    orderId: string,
    newStatus: OrderItem['status']
  ) => {
    setTables((prevTables) =>
      prevTables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          orders: tbl.orders.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord)),
        };
      })
    );
  };

  const handleAddTransferLog = (newLog: TableTransferLog) => {
    setTransferLogs((prev) => [newLog, ...prev]);
  };

  const handleResetFactory = () => {
    syncEngine.clearStorage();
    setTables(INITIAL_TABLES);
    setMenu(INITIAL_MENU);
    setTransferLogs(INITIAL_TRANSFER_LOGS);
    setActiveProfile(ESTABLISHMENT_PROFILES[0]);
  };

  const handleRestoreData = (restored: {
    tables?: TableOrSpot[];
    menu?: BeachItem[];
    transferLogs?: TableTransferLog[];
  }) => {
    if (restored.tables) setTables(restored.tables);
    if (restored.menu) setMenu(restored.menu);
    if (restored.transferLogs) setTransferLogs(restored.transferLogs);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-600 selection:text-white relative">
      {/* Universal Softham OpenDesk POS Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        sunlightMode={sunlightMode}
        setSunlightMode={setSunlightMode}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={setActiveProfile}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
      />

      {/* Main App Workspaces */}
      <main className="flex-1">
        {activeTab === 'simulador_mobile' && (
          <MobileSimulator
            tables={tables}
            menu={menu}
            transferLogs={transferLogs}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            sunlightMode={sunlightMode}
            setSunlightMode={setSunlightMode}
            onUpdateTables={setTables}
            onAddTransferLog={handleAddTransferLog}
            activeProfile={activeProfile}
          />
        )}

        {activeTab === 'tablet_cardapio' && (
          <TabletMenu
            tables={tables}
            menu={menu}
            onUpdateTables={setTables}
            sunlightMode={sunlightMode}
            activeProfile={activeProfile}
          />
        )}

        {activeTab === 'retaguarda_kds' && (
          <WebBackoffice
            tables={tables}
            menu={menu}
            transferLogs={transferLogs}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateMenu={setMenu}
            activeProfile={activeProfile}
          />
        )}

        {activeTab === 'estudo_viabilidade' && <FeasibilityStudy />}

        {activeTab === 'calculadora_roi' && <RoiCalculator />}

        {activeTab === 'consultor_ai' && <RequirementsAssistant />}
      </main>

      {/* Interactive Pitch & Guided Tour for Customer Presentations */}
      <InteractiveDemoTour
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfile={activeProfile}
        onSelectProfile={setActiveProfile}
        profiles={profiles}
      />

      {/* Cloud Sync & Node Topology Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        tables={tables}
        menu={menu}
        transferLogs={transferLogs}
        activeProfile={activeProfile}
        onResetFactory={handleResetFactory}
        onRestoreData={handleRestoreData}
      />

      {/* Sleek Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className="flex items-center gap-1.5 hover:text-sky-600 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Softham Cloud Sync: OK</span>
            </button>
            <span>Ambiente: {activeProfile.name}</span>
          </div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Desenvolvido por Softham Sistemas • OpenDesk PDV & Mesas Multi-Ambiente
          </p>
        </div>
      </footer>
    </div>
  );
}

