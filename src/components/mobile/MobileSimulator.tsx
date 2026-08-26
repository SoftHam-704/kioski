import React, { useState } from 'react';
import { 
  BeachMap 
} from './BeachMap';
import { OrderFlow } from './OrderFlow';
import { TableTransferModal } from './TableTransferModal';
import { BillSplitModal } from './BillSplitModal';
import { BeachItem, TableOrSpot, TableTransferLog, OrderItem, PaymentRecord } from '../../types';
import { 
  Wifi, 
  WifiOff, 
  Sun, 
  Battery, 
  Smartphone, 
  RotateCcw,
  Clock,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface MobileSimulatorProps {
  tables: TableOrSpot[];
  menu: BeachItem[];
  transferLogs: TableTransferLog[];
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  sunlightMode: boolean;
  setSunlightMode: (val: boolean) => void;
  onUpdateTables: (newTables: TableOrSpot[]) => void;
  onAddTransferLog: (log: TableTransferLog) => void;
  activeProfile?: any;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  tables,
  menu,
  transferLogs,
  isOffline,
  setIsOffline,
  sunlightMode,
  setSunlightMode,
  onUpdateTables,
  onAddTransferLog,
  activeProfile,
}) => {
  const [selectedTable, setSelectedTable] = useState<TableOrSpot | null>(null);
  const [activeScreen, setActiveScreen] = useState<'map' | 'order'>('map');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [activeWaiter, setActiveWaiter] = useState('Rodrigo (Areia)');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleOpenNewOrder = (table: TableOrSpot) => {
    // If table was free, initialize it with a customer
    if (table.status === 'livre') {
      const updatedTable: TableOrSpot = {
        ...table,
        status: 'ocupada',
        openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        waiterName: activeWaiter,
        customers: [
          { id: `c-${Date.now()}-1`, name: 'Cliente 1', color: '#3b82f6' },
          { id: `c-${Date.now()}-2`, name: 'Cliente 2', color: '#ec4899' },
          { id: `c-${Date.now()}-3`, name: 'Mesa Toda', color: '#10b981' },
        ],
      };
      const updatedTables = tables.map((t) => (t.id === table.id ? updatedTable : t));
      onUpdateTables(updatedTables);
      setSelectedTable(updatedTable);
    } else {
      setSelectedTable(table);
    }
    setActiveScreen('order');
  };

  const handleAddOrders = (newOrders: Omit<OrderItem, 'id' | 'timestamp' | 'status'>[]) => {
    if (!selectedTable) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatted: OrderItem[] = newOrders.map((no, idx) => ({
      ...no,
      id: `ord-${Date.now()}-${idx}`,
      timestamp: timeString,
      status: 'enviado',
    }));

    const updatedTable: TableOrSpot = {
      ...selectedTable,
      status: 'ocupada',
      orders: [...selectedTable.orders, ...formatted],
    };

    const updatedTables = tables.map((t) => (t.id === selectedTable.id ? updatedTable : t));
    onUpdateTables(updatedTables);
    setSelectedTable(updatedTable);

    if (isOffline) {
      setPendingSyncCount((prev) => prev + formatted.length);
      setSyncNotice(`⚡ ${formatted.length} itens salvos no banco local da areia (offline). Serão sincronizados ao reconectar.`);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // EXECUTE TRANSFER / SWAP / MERGE
  const handleExecuteTransfer = (
    transferType: 'troca_completa' | 'fusao' | 'transferencia_itens',
    targetTableId: string,
    selectedItemIds: string[],
    selectedCustomerIds: string[],
    reason: string
  ) => {
    if (!selectedTable) return;
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!targetTable) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedTables = [...tables];

    if (transferType === 'troca_completa') {
      // 1. Move all orders & customers to target table
      const newTarget: TableOrSpot = {
        ...targetTable,
        status: 'ocupada',
        openedAt: selectedTable.openedAt || timeString,
        waiterName: activeWaiter,
        customers: [...selectedTable.customers],
        orders: [...selectedTable.orders],
        paidAmount: selectedTable.paidAmount,
        payments: [...selectedTable.payments],
        notes: `Transferido de ${selectedTable.code}. Motivo: ${reason}`,
      };

      // 2. Free up source table
      const newSource: TableOrSpot = {
        ...selectedTable,
        status: 'livre',
        openedAt: undefined,
        customers: [],
        orders: [],
        paidAmount: 0,
        payments: [],
        notes: undefined,
      };

      updatedTables = updatedTables.map((t) => {
        if (t.id === newTarget.id) return newTarget;
        if (t.id === newSource.id) return newSource;
        return t;
      });

      onAddTransferLog({
        id: `log-${Date.now()}`,
        timestamp: timeString,
        sourceTableCode: selectedTable.code,
        targetTableCode: targetTable.code,
        transferType: 'troca_completa',
        waiterName: activeWaiter,
        itemsTransferredCount: selectedTable.orders.length,
        customersTransferredCount: selectedTable.customers.length,
        reason,
      });

      setSelectedTable(newTarget);
    } else if (transferType === 'fusao') {
      // Unify both tables
      const newTarget: TableOrSpot = {
        ...targetTable,
        status: 'ocupada',
        customers: [
          ...targetTable.customers,
          ...selectedTable.customers.filter((sc) => !targetTable.customers.some((tc) => tc.name === sc.name)),
        ],
        orders: [...targetTable.orders, ...selectedTable.orders],
        paidAmount: targetTable.paidAmount + selectedTable.paidAmount,
        payments: [...targetTable.payments, ...selectedTable.payments],
        notes: `Fusão com ${selectedTable.code}. Motivo: ${reason}`,
      };

      const newSource: TableOrSpot = {
        ...selectedTable,
        status: 'livre',
        openedAt: undefined,
        customers: [],
        orders: [],
        paidAmount: 0,
        payments: [],
        notes: undefined,
      };

      updatedTables = updatedTables.map((t) => {
        if (t.id === newTarget.id) return newTarget;
        if (t.id === newSource.id) return newSource;
        return t;
      });

      onAddTransferLog({
        id: `log-${Date.now()}`,
        timestamp: timeString,
        sourceTableCode: selectedTable.code,
        targetTableCode: targetTable.code,
        transferType: 'fusao',
        waiterName: activeWaiter,
        itemsTransferredCount: selectedTable.orders.length,
        customersTransferredCount: selectedTable.customers.length,
        reason,
      });

      setSelectedTable(newTarget);
    } else if (transferType === 'transferencia_itens') {
      // Partial items transfer
      const itemsToMove = selectedTable.orders.filter((o) => selectedItemIds.includes(o.id));
      const remainingOrders = selectedTable.orders.filter((o) => !selectedItemIds.includes(o.id));

      const newTarget: TableOrSpot = {
        ...targetTable,
        status: 'ocupada',
        orders: [...targetTable.orders, ...itemsToMove],
      };

      const newSource: TableOrSpot = {
        ...selectedTable,
        orders: remainingOrders,
        status: remainingOrders.length === 0 ? 'livre' : selectedTable.status,
      };

      updatedTables = updatedTables.map((t) => {
        if (t.id === newTarget.id) return newTarget;
        if (t.id === newSource.id) return newSource;
        return t;
      });

      onAddTransferLog({
        id: `log-${Date.now()}`,
        timestamp: timeString,
        sourceTableCode: selectedTable.code,
        targetTableCode: targetTable.code,
        transferType: 'transferencia_itens',
        waiterName: activeWaiter,
        itemsTransferredCount: itemsToMove.length,
        customersTransferredCount: 0,
        reason,
      });

      setSelectedTable(newSource);
    }

    onUpdateTables(updatedTables);
  };

  // ADD PAYMENT RECORD TO TABLE
  const handleAddPayment = (paymentData: Omit<PaymentRecord, 'id' | 'timestamp'>) => {
    if (!selectedTable) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      timestamp: timeString,
      txId: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const updatedTable: TableOrSpot = {
      ...selectedTable,
      paidAmount: selectedTable.paidAmount + newPayment.amount,
      payments: [...selectedTable.payments, newPayment],
    };

    const updatedTables = tables.map((t) => (t.id === selectedTable.id ? updatedTable : t));
    onUpdateTables(updatedTables);
    setSelectedTable(updatedTable);
  };

  // CLOSE BILL & FREE SPOT
  const handleCloseTableBill = () => {
    if (!selectedTable) return;
    const updatedTable: TableOrSpot = {
      ...selectedTable,
      status: 'livre',
      openedAt: undefined,
      customers: [],
      orders: [],
      paidAmount: 0,
      payments: [],
      notes: undefined,
    };
    const updatedTables = tables.map((t) => (t.id === selectedTable.id ? updatedTable : t));
    onUpdateTables(updatedTables);
    setSelectedTable(null);
    setActiveScreen('map');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Banner Guide for Softham */}
      <div className="mb-6 p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0 mt-0.5 border border-sky-100 shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Terminal Móvel Smart POS (Garçom / Atendente de Areia)
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                Resiliente & Offline-First
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl font-normal">
              Teste interativamente as operações do quiosque: <strong>1) Troca e fusão de mesas/guarda-sóis</strong> em tempo real e <strong>2) Rateio inteligente de comanda</strong> (por pessoa, igualitária ou avulsa) com baixa em Pix/Cartão.
            </p>
          </div>
        </div>

        {/* Quick Simulator Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Operador:</span>
            <select
              value={activeWaiter}
              onChange={(e) => setActiveWaiter(e.target.value)}
              className="bg-transparent text-sky-700 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="Rodrigo (Areia)">Rodrigo (Areia)</option>
              <option value="Camila (Deck)">Camila (Deck)</option>
              <option value="Thiago (Lounge)">Thiago (Lounge)</option>
            </select>
          </div>

          <button
            onClick={() => setSunlightMode(!sunlightMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              sunlightMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{sunlightMode ? 'Modo Sol: ATIVO' : 'Modo Sol'}</span>
          </button>
        </div>
      </div>

      {/* Synchronisation Notice if offline */}
      {syncNotice && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 shadow-sm animate-in fade-in">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">{syncNotice}</span>
        </div>
      )}

      {/* Interactive Mobile Device Viewport */}
      <div className="flex justify-center">
        <div
          className={`w-full max-w-[430px] rounded-[44px] border-[10px] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
            sunlightMode
              ? 'border-slate-400 bg-white text-slate-950 ring-4 ring-amber-400'
              : 'border-slate-800 bg-white text-slate-900 shadow-slate-300'
          }`}
          style={{ minHeight: '740px', height: '780px' }}
        >
          {/* Phone Top Notch & Status Bar */}
          <div
            className={`px-6 py-2 flex items-center justify-between text-[11px] font-bold border-b ${
              sunlightMode
                ? 'bg-slate-100 text-slate-900 border-slate-200'
                : 'bg-slate-900 text-slate-200 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>11:42</span>
            </div>

            {/* Speaker Notch */}
            <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>

            <div className="flex items-center gap-2">
              {isOffline ? (
                <span className="flex items-center gap-1 text-rose-400 font-extrabold text-[10px]">
                  <WifiOff className="w-3 h-3" /> OFF
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-[10px]">
                  <Wifi className="w-3 h-3" /> 4G
                </span>
              )}
              <Battery className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Active Waiter Banner inside Phone */}
          <div
            className={`px-4 py-2 text-[11px] font-bold flex items-center justify-between border-b ${
              sunlightMode
                ? 'bg-amber-300 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-sky-400 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="uppercase tracking-wider font-extrabold">Operador: {activeWaiter}</span>
            </div>
            {pendingSyncCount > 0 && isOffline && (
              <span className="text-[10px] px-2 py-0.5 bg-rose-500 text-white rounded-full font-bold shadow-sm">
                {pendingSyncCount} offline
              </span>
            )}
          </div>

          {/* Phone Screen Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
            {activeScreen === 'map' && (
              <BeachMap
                tables={tables}
                activeProfile={activeProfile}
                onSelectTable={(tbl) => {
                  setSelectedTable(tbl);
                }}
                onOpenTransferModal={(tbl) => {
                  setSelectedTable(tbl);
                  setIsTransferModalOpen(true);
                }}
                onOpenSplitModal={(tbl) => {
                  setSelectedTable(tbl);
                  setIsSplitModalOpen(true);
                }}
                onOpenNewOrder={(tbl) => {
                  handleOpenNewOrder(tbl);
                }}
              />
            )}

            {activeScreen === 'order' && selectedTable && (
              <OrderFlow
                table={selectedTable}
                menu={menu}
                onAddOrders={handleAddOrders}
                onBackToMap={() => setActiveScreen('map')}
              />
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div
            className={`py-2 flex items-center justify-center border-t ${
              sunlightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Modals for Swap and Bill Split */}
      {selectedTable && isTransferModalOpen && (
        <TableTransferModal
          sourceTable={selectedTable}
          allTables={tables}
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onExecuteTransfer={handleExecuteTransfer}
        />
      )}

      {selectedTable && isSplitModalOpen && (
        <BillSplitModal
          table={selectedTable}
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          onAddPayment={handleAddPayment}
          onCloseTableBill={handleCloseTableBill}
          activeProfile={activeProfile}
        />
      )}
    </div>
  );
};
