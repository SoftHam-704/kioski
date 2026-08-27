import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  ArrowRightLeft, 
  DollarSign, 
  Settings, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle,
  Percent,
  Layers,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Download,
  AlertTriangle
} from 'lucide-react';
import { TableOrSpot, BeachItem, TableTransferLog, OrderItem, EstablishmentProfile } from '../../types';
import { KdsView } from './KdsView';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';
import { ExportReportsModal } from '../common/ExportReportsModal';

interface WebBackofficeProps {
  tables: TableOrSpot[];
  menu: BeachItem[];
  transferLogs: TableTransferLog[];
  onUpdateOrderStatus: (tableId: string, orderId: string, newStatus: OrderItem['status']) => void;
  onUpdateMenu: (newMenu: BeachItem[]) => void;
  activeProfile?: EstablishmentProfile;
}

export const WebBackoffice: React.FC<WebBackofficeProps> = ({
  tables,
  menu,
  transferLogs,
  onUpdateOrderStatus,
  onUpdateMenu,
  activeProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'kds' | 'auditoria' | 'caixa' | 'cardapio' | 'fechamento'>('kds');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Modal receipt state
  const [receiptTable, setReceiptTable] = useState<TableOrSpot | null>(null);

  // New Item State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'bebidas' | 'porcoes' | 'pratos' | 'aluguel' | 'sobremesas' | 'drinks'>('bebidas');
  const [newItemStation, setNewItemStation] = useState<'bar' | 'cozinha' | 'apoio'>('bar');
  const [newItemPrepTime, setNewItemPrepTime] = useState('10');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Editing price state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  // Shift & Cash Control State
  const [openingBalance, setOpeningBalance] = useState<number>(300.00); // Fundo de caixa
  const [cashWithdrawals, setCashWithdrawals] = useState<Array<{ id: string; desc: string; amount: number; time: string }>>([
    { id: '1', desc: 'Compra de gelo emergencial', amount: 50.00, time: '12:30' },
  ]);
  const [cashSupplies, setCashSupplies] = useState<Array<{ id: string; desc: string; amount: number; time: string }>>([
    { id: '1', desc: 'Troco inicial moedas', amount: 100.00, time: '09:00' },
  ]);
  const [newWithdrawalDesc, setNewWithdrawalDesc] = useState('');
  const [newWithdrawalAmount, setNewWithdrawalAmount] = useState('');
  const [isShiftClosed, setIsShiftClosed] = useState(false);

  // Financial Metrics Calculation
  const totalBilled = tables.reduce((acc, t) => {
    const subtotal = t.orders.reduce((s, o) => s + (o.price * o.quantity), 0);
    const service = (subtotal * (t.serviceFeePercent || 10)) / 100;
    return acc + subtotal + service;
  }, 0);

  const totalCollected = tables.reduce((acc, t) => acc + (t.paidAmount || 0), 0);
  const occupiedTables = tables.filter((t) => t.status === 'ocupada' || t.status === 'conta_solicitada');
  const ticketMedio = occupiedTables.length > 0 ? totalBilled / occupiedTables.length : 0;

  // Breakdown by payment methods from actual payments
  const allPayments = tables.flatMap((t) => t.payments || []);
  const pixTotal = allPayments.filter((p) => p.method === 'pix').reduce((s, p) => s + p.amount, 0);
  const creditTotal = allPayments.filter((p) => p.method === 'cartao_credito').reduce((s, p) => s + p.amount, 0);
  const debitTotal = allPayments.filter((p) => p.method === 'cartao_debito').reduce((s, p) => s + p.amount, 0);
  const moneyTotal = allPayments.filter((p) => p.method === 'dinheiro').reduce((s, p) => s + p.amount, 0);

  const totalWithdrawals = cashWithdrawals.reduce((s, w) => s + w.amount, 0);
  const totalSupplies = cashSupplies.reduce((s, sup) => s + sup.amount, 0);
  const calculatedCashInDrawer = openingBalance + totalSupplies + moneyTotal - totalWithdrawals;

  // Toggle product availability (out of stock quick-pause)
  const handleToggleItemAvailability = (itemId: string) => {
    onUpdateMenu(
      menu.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Save edited price
  const handleSavePrice = (itemId: string) => {
    const numPrice = parseFloat(editingPriceValue);
    if (!isNaN(numPrice) && numPrice > 0) {
      onUpdateMenu(
        menu.map((item) =>
          item.id === itemId ? { ...item, price: numPrice } : item
        )
      );
    }
    setEditingItemId(null);
  };

  // Add new menu item
  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItem: BeachItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      price: parseFloat(newItemPrice) || 10,
      category: newItemCategory,
      prepStation: newItemStation,
      prepTimeMinutes: parseInt(newItemPrepTime) || 10,
      description: newItemDesc || 'Item preparado no padrão de qualidade da casa.',
      isAvailable: true,
    };

    onUpdateMenu([...menu, newItem]);
    setIsAddingItem(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
  };

  // Add cash withdrawal (sangria)
  const handleAddWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWithdrawalAmount);
    if (!val || !newWithdrawalDesc) return;

    setCashWithdrawals((prev) => [
      ...prev,
      {
        id: `sangria-${Date.now()}`,
        desc: newWithdrawalDesc,
        amount: val,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewWithdrawalDesc('');
    setNewWithdrawalAmount('');
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCat = categoryFilter === 'todos' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const defaultProfile: EstablishmentProfile = activeProfile || {
    id: 'default',
    name: 'Softham OpenDesk',
    tradeName: 'Softham OpenDesk',
    type: 'restaurante_bar',
    tagline: 'PDV & Mesas Multi-Ambiente',
    location: 'Matriz Principal',
    currency: 'BRL',
    defaultServiceFee: 10,
    sectors: [],
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
              Retaguarda & Operação
            </span>
            <span className="text-xs text-slate-500">• {defaultProfile.name}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Painel Central de Gerência, KDS e Caixa
          </h2>
        </div>

        {/* Sub-Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'kds'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>KDS Bar & Cozinha</span>
          </button>

          <button
            onClick={() => setActiveTab('auditoria')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'auditoria'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Auditoria ({transferLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('caixa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'caixa'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Caixa & Setores</span>
          </button>

          <button
            onClick={() => setActiveTab('fechamento')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'fechamento'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>DRE & Fechamento</span>
          </button>

          <button
            onClick={() => setActiveTab('cardapio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'cardapio'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cardápio & Estoque</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all shadow-xs"
            title="Exportar Planilhas e Relatórios em PDF/CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatórios</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Total Faturado no Turno
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">R$ {totalBilled.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-600 font-bold">
            R$ {totalCollected.toFixed(2)} já recebidos
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            Mesas Ativas
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {occupiedTables.length} <span className="text-xs text-slate-400 font-normal">/ {tables.length}</span>
          </p>
          <span className="text-[10px] text-sky-700 font-semibold">
            {Math.round((occupiedTables.length / tables.length) * 100)}% de ocupação do espaço
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Ticket Médio por Mesa
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">R$ {ticketMedio.toFixed(2)}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Consumo consistente</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
            Trocas Registradas Hoje
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">{transferLogs.length}</p>
          <span className="text-[10px] text-purple-600 font-semibold">
            100% auditadas com motivo
          </span>
        </div>
      </div>

      {/* TAB CONTENT: KDS */}
      {activeTab === 'kds' && (
        <KdsView tables={tables} onUpdateOrderStatus={onUpdateOrderStatus} />
      )}

      {/* TAB CONTENT: AUDITORIA DE TROCAS */}
      {activeTab === 'auditoria' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-600" />
                Histórico e Auditoria de Trocas de Mesa e Fusões
              </h3>
              <p className="text-xs text-slate-500">
                Evita fraudes, perdas de comandas e confusão na entrega de pedidos quando clientes mudam de lugar.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
              {transferLogs.length} eventos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Horário</th>
                  <th className="p-3">Tipo de Operação</th>
                  <th className="p-3">Origem ➔ Destino</th>
                  <th className="p-3">Garçom</th>
                  <th className="p-3">Itens Movidos</th>
                  <th className="p-3">Motivo Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-900">{log.timestamp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        log.transferType === 'troca_completa'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : log.transferType === 'fusao'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {log.transferType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <span className="text-sky-700">{log.sourceTableCode}</span> ➔{' '}
                      <span className="text-emerald-700">{log.targetTableCode}</span>
                    </td>
                    <td className="p-3 text-slate-700">{log.waiterName}</td>
                    <td className="p-3 font-semibold text-slate-900">{log.itemsTransferredCount} itens</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAIXA E SETORES */}
      {activeTab === 'caixa' && (
        <div className="space-y-6">
          {/* Active Tables Overview with Quick Receipt Print */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  Mesas em Aberto & Pré-Contas
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhe comandas ativas e gere cupom de conferência ou pré-conta térmica instantaneamente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tables.map((t) => {
                const sub = t.orders.reduce((s, o) => s + (o.price * o.quantity), 0);
                const srv = (sub * (t.serviceFeePercent || 10)) / 100;
                const tot = sub + srv;
                const paid = t.paidAmount || 0;
                const isOccupied = t.status === 'ocupada' || t.status === 'conta_solicitada';

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      t.status === 'conta_solicitada'
                        ? 'bg-amber-50/70 border-amber-300'
                        : isOccupied
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{t.code}</span>
                          <span className="text-xs text-slate-600 font-medium">{t.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Atendente: {t.waiterName || '—'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          t.status === 'conta_solicitada'
                            ? 'bg-amber-100 text-amber-800'
                            : isOccupied
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Consumido:</span>
                        <span className="font-extrabold text-slate-900">R$ {tot.toFixed(2)}</span>
                      </div>
                      {isOccupied && (
                        <button
                          onClick={() => setReceiptTable(t)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl border border-sky-200 flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Pré-Conta</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector & Waiter Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Consolidado de Vendas por Setor
              </h3>

              <div className="space-y-3">
                {(defaultProfile.sectors?.length ? defaultProfile.sectors : [
                  { id: 'areia_frente', label: '1ª Linha (Frente Mar)' },
                  { id: 'areia_meio', label: '2ª Linha (Areia Meio)' },
                  { id: 'deck_coberto', label: 'Deck Coberto' },
                  { id: 'lounge_bangalo', label: 'Lounge VIP' },
                ]).map((sec) => {
                  const sectorTables = tables.filter((t) => t.sector === sec.id);
                  const sectorTotal = sectorTables.reduce((acc, t) => {
                    const sub = t.orders.reduce((s, o) => s + (o.price * o.quantity), 0);
                    return acc + sub;
                  }, 0);

                  return (
                    <div key={sec.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-900">{sec.label}</span>
                        <span className="font-extrabold text-xs text-emerald-600">
                          R$ {sectorTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-full rounded-full" style={{ width: `${Math.min(100, (sectorTotal / (totalBilled || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-sky-600" />
                Comissões e Taxa de Serviço da Equipe
              </h3>

              <div className="space-y-3">
                {['Rodrigo (Areia)', 'Camila (Deck)', 'Thiago (Lounge)'].map((waiter) => {
                  const waiterTables = tables.filter((t) => t.waiterName === waiter);
                  const waiterBilled = waiterTables.reduce((acc, t) => {
                    return acc + t.orders.reduce((s, o) => s + (o.price * o.quantity), 0);
                  }, 0);
                  const comissao10 = waiterBilled * 0.10;

                  return (
                    <div key={waiter} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{waiter}</h4>
                        <span className="text-[10px] text-slate-500">
                          {waiterTables.length} mesas atendidas • Total R$ {waiterBilled.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Comissão (10%):</span>
                        <span className="font-bold text-xs text-sky-700">+ R$ {comissao10.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DRE & FECHAMENTO DE TURNO */}
      {activeTab === 'fechamento' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                  Fechamento de Caixa & DRE Operacional do Turno
                </h3>
                <p className="text-xs text-slate-500">
                  Demonstrativo em tempo real de entradas por meio de pagamento, sangrias de gaveta e conciliação financeira.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exportar Planilha / PDF</span>
                </button>

                <button
                  onClick={() => setIsShiftClosed(!isShiftClosed)}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                    isShiftClosed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isShiftClosed ? 'Turno Finalizado & Bloqueado' : 'Encerrar e Fechar Caixa'}</span>
                </button>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Pix Instantâneo</span>
                  <QrCode className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-lg font-black text-emerald-950 mt-1">R$ {pixTotal.toFixed(2)}</p>
                <span className="text-[10px] text-emerald-700">Zero taxa de antecipação</span>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">Cartão de Crédito</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-lg font-black text-blue-950 mt-1">R$ {creditTotal.toFixed(2)}</p>
                <span className="text-[10px] text-blue-700">Maquininhas Smart POS</span>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">Cartão de Débito</span>
                  <CreditCard className="w-4 h-4 text-sky-600" />
                </div>
                <p className="text-lg font-black text-sky-950 mt-1">R$ {debitTotal.toFixed(2)}</p>
                <span className="text-[10px] text-sky-700">Recebimento D+1</span>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Dinheiro em Espécie</span>
                  <Banknote className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-lg font-black text-amber-950 mt-1">R$ {moneyTotal.toFixed(2)}</p>
                <span className="text-[10px] text-amber-700">Físico na gaveta</span>
              </div>
            </div>

            {/* Cash Drawer Flow (Suprimentos e Sangrias) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Sangrias / Retiradas */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Sangrias & Retiradas de Dinheiro ({cashWithdrawals.length})
                  </h4>
                  <span className="font-black text-xs text-rose-700">- R$ {totalWithdrawals.toFixed(2)}</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {cashWithdrawals.map((w) => (
                    <div key={w.id} className="p-2 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{w.desc}</span>
                        <span className="text-[10px] text-slate-400 block">{w.time}</span>
                      </div>
                      <span className="font-bold text-rose-600">- R$ {w.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Add Withdrawal Form */}
                <form onSubmit={handleAddWithdrawal} className="flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Motivo (ex: Compra carvão)"
                    value={newWithdrawalDesc}
                    onChange={(e) => setNewWithdrawalDesc(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor R$"
                    value={newWithdrawalAmount}
                    onChange={(e) => setNewWithdrawalAmount(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
                  >
                    Registrar
                  </button>
                </form>
              </div>

              {/* Conciliação Física da Gaveta */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Saldo Final Esperado na Gaveta Física
                </h4>

                <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fundo de Abertura:</span>
                    <span className="font-bold text-slate-900">R$ {openingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">(+) Suprimentos de Troco:</span>
                    <span className="font-bold text-emerald-600">+ R$ {totalSupplies.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">(+) Vendas em Dinheiro:</span>
                    <span className="font-bold text-emerald-600">+ R$ {moneyTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">(-) Sangrias Realizadas:</span>
                    <span className="font-bold text-rose-600">- R$ {totalWithdrawals.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
                    <span>Saldo a Conferir na Gaveta:</span>
                    <span className="text-sky-700">R$ {calculatedCashInDrawer.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CARDAPIO & ESTOQUE */}
      {activeTab === 'cardapio' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Gestão de Cardápio, Preços & Pausa Rápida de Estoque
              </h3>
              <p className="text-xs text-slate-500">
                Pause itens que esgotaram no bar/cozinha em 1 clique para não receber mais pedidos no tablet ou app do garçom.
              </p>
            </div>

            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingItem ? 'Cancelar' : 'Adicionar Novo Item'}</span>
            </button>
          </div>

          {/* New Item Form Drawer */}
          {isAddingItem && (
            <form onSubmit={handleCreateMenuItem} className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-bold text-xs text-sky-900">Cadastrar Novo Produto no Cardápio</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Porção de Camarão Empanado"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    placeholder="Ex: 89.90"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="bebidas">Bebidas & Não-Alcoólicos</option>
                    <option value="drinks">Drinks & Coquetéis</option>
                    <option value="porcoes">Porções & Petiscos</option>
                    <option value="pratos">Pratos Principais</option>
                    <option value="sobremesas">Sobremesas</option>
                    <option value="aluguel">Aluguel & Lazer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estação de Preparo (KDS)</label>
                  <select
                    value={newItemStation}
                    onChange={(e) => setNewItemStation(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="bar">Bar & Bebidas</option>
                    <option value="cozinha">Cozinha Quente / Fritadeira</option>
                    <option value="apoio">Apoio & Salão / Praia</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tempo Estimado (min)</label>
                  <input
                    type="number"
                    value={newItemPrepTime}
                    onChange={(e) => setNewItemPrepTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ingredientes e porção"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por nome ou ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['todos', 'bebidas', 'drinks', 'porcoes', 'pratos', 'aluguel'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMenu.map((item) => {
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.isAvailable
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-100/80 border-slate-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.description}</p>
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        item.prepStation === 'bar'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : item.prepStation === 'cozinha'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {item.prepStation}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    {/* Price and Edit */}
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          value={editingPriceValue}
                          onChange={(e) => setEditingPriceValue(e.target.value)}
                          className="w-16 bg-white border border-sky-400 rounded-lg px-1.5 py-0.5 text-xs font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-500"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-1 bg-slate-300 text-slate-700 rounded-md hover:bg-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900">
                          R$ {item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingPriceValue(item.price.toString());
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                          title="Editar Preço"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Stock Pause Button */}
                    <button
                      onClick={() => handleToggleItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Disponível</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Pausado (Sem Estoque)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal Viewer */}
      {receiptTable && (
        <ThermalReceiptModal
          table={receiptTable}
          activeProfile={defaultProfile}
          isOpen={Boolean(receiptTable)}
          onClose={() => setReceiptTable(null)}
          type="pre_conta"
        />
      )}

      {/* Central Export Modal */}
      {isExportModalOpen && (
        <ExportReportsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          tables={tables}
          transferLogs={transferLogs}
          menu={menu}
          activeProfile={defaultProfile}
        />
      )}
    </div>
  );
};
