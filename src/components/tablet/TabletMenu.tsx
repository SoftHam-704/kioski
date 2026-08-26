import React, { useState } from 'react';
import {
  Tablet,
  Search,
  ShoppingBag,
  BellRing,
  CheckCircle2,
  Clock,
  Flame,
  Wine,
  Sparkles,
  Plus,
  Minus,
  X,
  Receipt,
  QrCode,
  Users,
  Check,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Umbrella,
  HeartHandshake,
  Layers
} from 'lucide-react';
import { TableOrSpot, BeachItem, OrderItem, EstablishmentProfile } from '../../types';

interface TabletMenuProps {
  tables: TableOrSpot[];
  menu: BeachItem[];
  onUpdateTables: React.Dispatch<React.SetStateAction<TableOrSpot[]>>;
  sunlightMode: boolean;
  activeProfile?: EstablishmentProfile;
}

interface CartItem {
  item: BeachItem;
  quantity: number;
  assignedToCustomer: string;
  notes: string;
}

export const TabletMenu: React.FC<TabletMenuProps> = ({
  tables,
  menu,
  onUpdateTables,
  sunlightMode,
  activeProfile,
}) => {
  // Select active table for the tablet simulator
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 'table-1');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Drawers
  const [selectedItemForModal, setSelectedItemForModal] = useState<BeachItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalCustomer, setModalCustomer] = useState<string>('Mesa Toda');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isBillOpen, setIsBillOpen] = useState<boolean>(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);
  const [callAlertMessage, setCallAlertMessage] = useState<string | null>(null);
  const [showOrderSuccessToast, setShowOrderSuccessToast] = useState<boolean>(false);
  const [showPixModal, setShowPixModal] = useState<boolean>(false);
  const [pixPaidSuccess, setPixPaidSuccess] = useState<boolean>(false);

  // Cart State for the tablet
  const [cart, setCart] = useState<CartItem[]>([]);

  // Current active table object
  const currentTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  // Customers in this table
  const tableCustomers = currentTable?.customers || [];

  // Filtered Menu Items
  const filteredMenu = menu.filter((item) => {
    const matchesCategory =
      activeCategory === 'todos' ||
      (activeCategory === 'bebidas' && (item.category === 'bebidas' || item.category === 'drinks')) ||
      item.category === activeCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'todos', label: 'Todos os Itens', icon: Sparkles },
    { id: 'porcoes', label: 'Frutos do Mar & Porções', icon: Flame },
    { id: 'bebidas', label: 'Bebidas & Drinks', icon: Wine },
    { id: 'pratos', label: 'Pratos Principais', icon: UtensilsIcon },
    { id: 'aluguel', label: 'Aluguel de Praia', icon: Umbrella },
  ];

  function UtensilsIcon(props: any) {
    return <Sparkles {...props} />;
  }

  // Add Item to Cart from Modal
  const handleAddToCart = () => {
    if (!selectedItemForModal) return;

    setCart((prev) => [
      ...prev,
      {
        item: selectedItemForModal,
        quantity: modalQuantity,
        assignedToCustomer: modalCustomer,
        notes: modalNotes,
      },
    ]);

    setSelectedItemForModal(null);
    setModalQuantity(1);
    setModalNotes('');
  };

  // Submit Entire Cart as Live Orders to Table
  const handleConfirmCartOrder = () => {
    if (cart.length === 0 || !currentTable) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newOrders: OrderItem[] = cart.map((ci, idx) => ({
      id: `ord-tab-${Date.now()}-${idx}`,
      itemId: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
      assignedToCustomer: ci.assignedToCustomer,
      notes: ci.notes || undefined,
      status: 'enviado',
      prepStation: ci.item.prepStation,
      timestamp: timeStr,
    }));

    onUpdateTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== currentTable.id) return tbl;

        // If table was free, mark as occupied
        return {
          ...tbl,
          status: tbl.status === 'livre' ? 'ocupada' : tbl.status,
          openedAt: tbl.openedAt || timeStr,
          waiterName: tbl.waiterName || 'Tablet Autoatendimento',
          orders: [...tbl.orders, ...newOrders],
        };
      })
    );

    setCart([]);
    setIsCartOpen(false);
    setShowOrderSuccessToast(true);
    setTimeout(() => setShowOrderSuccessToast(false), 4000);
  };

  // Call Waiter handler
  const handleCallWaiter = (reason: string) => {
    setCallAlertMessage(`Chamado enviado para a equipe: "${reason}". Um garçom está a caminho do ${currentTable.code}!`);
    setIsCallWaiterOpen(false);
    setTimeout(() => setCallAlertMessage(null), 5000);
  };

  // Financial calculations for the active table
  const subtotal = currentTable?.orders?.reduce((acc, o) => acc + o.price * o.quantity, 0) || 0;
  const serviceFee = (subtotal * (currentTable?.serviceFeePercent || 10)) / 100;
  const totalWithService = subtotal + serviceFee;
  const remainingBill = Math.max(0, totalWithService - (currentTable?.paidAmount || 0));
  const minConsumptionProgress = currentTable?.minimumConsumption
    ? Math.min(100, Math.round((subtotal / currentTable.minimumConsumption) * 100))
    : 100;

  // Simulate PIX payment
  const handleConfirmPixPayment = () => {
    if (!currentTable) return;

    onUpdateTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== currentTable.id) return tbl;
        return {
          ...tbl,
          paidAmount: totalWithService,
          status: 'conta_solicitada',
          payments: [
            ...tbl.payments,
            {
              id: `pay-pix-${Date.now()}`,
              customerName: 'Tablet Autoatendimento',
              amount: remainingBill,
              method: 'pix',
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              txId: `PIX-TAB-${Math.floor(100000 + Math.random() * 900000)}`,
            },
          ],
        };
      })
    );

    setPixPaidSuccess(true);
    setTimeout(() => {
      setPixPaidSuccess(false);
      setShowPixModal(false);
      setIsBillOpen(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Simulation Controls Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 shadow-sm">
            <Tablet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Cardápio Eletrônico de Mesa (Tablet Autoatendimento)
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Cliente na Mesa
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Terminal touchscreen fixado na mesa ou bangalô. Pedidos vão direto para a cozinha/bar sem esperar garçom.
            </p>
          </div>
        </div>

        {/* Table Selector & Display Options */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-600 pl-2">Tablet da Mesa:</span>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                setCart([]);
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {tables.map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  {tbl.code} - {tbl.name} ({tbl.status === 'livre' ? 'Livre' : 'Ocupada'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Alternar tamanho do Tablet"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Ver Moldura' : 'Expandir'}</span>
          </button>
        </div>
      </div>

      {/* Call Waiter Alert Banner */}
      {callAlertMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-xs font-bold animate-bounce shadow-sm">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{callAlertMessage}</span>
          </div>
          <button
            onClick={() => setCallAlertMessage(null)}
            className="text-amber-600 hover:text-amber-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order Sent Success Banner */}
      {showOrderSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Pedido enviado com sucesso! A cozinha e o bar já iniciaram a preparação dos seus itens para o{' '}
            <strong>{currentTable?.code}</strong>.
          </span>
        </div>
      )}

      {/* TABLET CONTAINER FRAME */}
      <div
        className={`mx-auto transition-all ${
          isFullscreen
            ? 'w-full'
            : 'max-w-5xl rounded-[40px] p-3 sm:p-5 bg-slate-900 shadow-2xl border-4 border-slate-800'
        }`}
      >
        {/* Tablet Screen Surface */}
        <div className="bg-slate-50 text-slate-900 rounded-[28px] overflow-hidden border border-slate-200 flex flex-col min-h-[640px] relative shadow-inner">
          {/* Tablet Top Status & Brand Bar */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
            {/* Brand & Table Location */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
                  {activeProfile ? activeProfile.name : 'SOFTHAM OPENDESK'}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    {currentTable?.code} • {currentTable?.name}
                  </span>
                  <span className="hidden sm:inline">• Toque nos itens para pedir</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Chamar Garçom / Minha Comanda / Carrinho) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCallWaiterOpen(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <BellRing className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">Chamar Garçom</span>
              </button>

              <button
                onClick={() => setIsBillOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Receipt className="w-4 h-4 text-sky-600" />
                <span>Minha Comanda ({currentTable?.orders?.length || 0})</span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors relative"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Carrinho</span>
                {cart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center -ml-1">
                    {cart.reduce((acc, c) => acc + c.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Minimum Consumption & Banner Progress */}
          {currentTable?.minimumConsumption > 0 && (
            <div className="bg-sky-50/80 border-b border-sky-100 px-5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-sky-600" />
                <span className="font-medium text-slate-700">
                  Consumação Mínima desta Mesa/Bangalô:{' '}
                  <strong>R$ {currentTable.minimumConsumption.toFixed(2)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-64">
                <div className="flex-1 bg-white rounded-full h-2 border border-sky-200 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${minConsumptionProgress}%` }}
                  />
                </div>
                <span className="font-bold text-sky-800 text-[11px] whitespace-nowrap">
                  R$ {subtotal.toFixed(2)} ({minConsumptionProgress}%)
                </span>
              </div>
            </div>
          )}

          {/* Main Menu Body */}
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            {/* Search & Categories Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar porção, caipirinha, camarão, cerveja..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => {
                const isFood = item.prepStation === 'cozinha';
                const isDrink = item.prepStation === 'bar';
                const isAvailable = item.isAvailable !== false;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedItemForModal(item);
                      setModalQuantity(1);
                      setModalNotes('');
                      setModalCustomer(tableCustomers[0]?.name || 'Mesa Toda');
                    }}
                    className={`rounded-3xl p-4 transition-all flex flex-col justify-between group shadow-xs relative ${
                      isAvailable
                        ? 'bg-white border border-slate-200 hover:border-sky-300 cursor-pointer hover:shadow-md'
                        : 'bg-slate-100/80 border border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isDrink
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : isFood
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.category}
                        </span>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>~{item.prepTimeMinutes} min</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className={`text-sm font-bold transition-colors ${isAvailable ? 'text-slate-900 group-hover:text-sky-700' : 'text-slate-500'}`}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Price & Add Action */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Preço:</span>
                        <span className="text-sm font-black text-slate-900">
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>

                      {isAvailable ? (
                        <button
                          type="button"
                          className="p-2 bg-sky-50 group-hover:bg-sky-600 text-sky-700 group-hover:text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all border border-sky-100 group-hover:border-sky-600 shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[11px]">Adicionar</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-xl border border-rose-200">
                          Esgotado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Cart Button at bottom if cart has items */}
          {cart.length > 0 && !isCartOpen && (
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                  {cart.reduce((acc, c) => acc + c.quantity, 0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {cart.length} {cart.length === 1 ? 'item pronto' : 'itens prontos'} no carrinho
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Total: R$ {cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Revisar e Enviar Pedido</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ITEM DETAIL & CUSTOMIZATION */}
      {selectedItemForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedItemForModal(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                {selectedItemForModal.category} • Preparo em ~{selectedItemForModal.prepTimeMinutes} min
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {selectedItemForModal.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedItemForModal.description}
              </p>
            </div>

            {/* Who is ordering? (Auto-rates to customer) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                Quem vai consumir? (Para rateio automático na comanda)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setModalCustomer('Mesa Toda')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    modalCustomer === 'Mesa Toda'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Mesa Toda (Dividir)
                </button>
                {tableCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setModalCustomer(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      modalCustomer === c.name
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Observações para a cozinha / bar:
              </label>
              <input
                type="text"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Ex: Sem gelo, limão à parte, molho tártaro extra..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {['Sem gelo', 'Gelo e limão', 'Molho à parte', 'Bem frito', 'Copo extra'].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setModalNotes(quick)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    +{quick}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Total Price */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-900">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Valor Total:</span>
                <span className="text-base font-black text-slate-900">
                  R$ {(selectedItemForModal.price * modalQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Colocar no Carrinho da Mesa</span>
            </button>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: CART REVIEW & DIRECT SUBMISSION */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Carrinho de Pedidos ({currentTable?.code})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Seu carrinho está vazio.</p>
                  <p className="text-[11px] text-slate-400">
                    Toque nos itens do cardápio para adicionar pedidos.
                  </p>
                </div>
              ) : (
                cart.map((ci, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {ci.quantity}x {ci.item.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-md shrink-0">
                          {ci.assignedToCustomer}
                        </span>
                      </div>
                      {ci.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Obs: {ci.notes}</p>
                      )}
                      <span className="text-xs font-black text-slate-800 mt-1 block">
                        R$ {(ci.item.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total & Confirm Button */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">Total a Enviar:</span>
                  <span className="font-black text-base text-slate-900">
                    R$ {cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmCartOrder}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Enviar Pedido para Produção no Bar/Cozinha</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: MINHA COMANDA & PAGAMENTO PIX */}
      {isBillOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Extrato da Comanda ({currentTable?.code})
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Atendimento aberto às {currentTable?.openedAt || '10:00'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsBillOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders Breakdown */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {currentTable?.orders?.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-600">Nenhum item consumido ainda.</p>
                </div>
              ) : (
                currentTable?.orders?.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {ord.quantity}x {ord.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 rounded text-slate-700">
                          {ord.assignedToCustomer}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Status: <strong className="text-sky-700">{ord.status}</strong> • às {ord.timestamp}
                      </span>
                    </div>
                    <span className="font-black text-slate-900">
                      R$ {(ord.price * ord.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal dos Itens:</span>
                <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Taxa de Serviço ({currentTable?.serviceFeePercent || 10}% opcional):</span>
                <span className="font-bold text-slate-900">R$ {serviceFee.toFixed(2)}</span>
              </div>
              {currentTable?.paidAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>Valores já pagos via PIX/Cartão:</span>
                  <span>- R$ {currentTable.paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Saldo Devedor / Restante:</span>
                <span className="text-base text-sky-700">R$ {remainingBill.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay with PIX button */}
            {remainingBill > 0 ? (
              <button
                type="button"
                onClick={() => setShowPixModal(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Pagar Agora com PIX Instantâneo no Tablet</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-center rounded-2xl text-xs font-bold border border-emerald-200">
                ✨ Conta 100% quitada! Obrigado pela preferência.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CALL WAITER / SERVICE REQUEST */}
      {isCallWaiterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Chamar Equipe de Praia ({currentTable?.code})
                </h3>
              </div>
              <button
                onClick={() => setIsCallWaiterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Selecione o motivo para direcionarmos o atendente correto até o seu guarda-sol:
            </p>

            <div className="space-y-2">
              {[
                { label: 'Garçom na mesa (Atendimento geral)', icon: Users, reason: 'Atendimento presencial do garçom' },
                { label: 'Trazer balde de gelo & copos extras', icon: Wine, reason: 'Gelo e copos adicionais' },
                { label: 'Ajustar guarda-sol / vento / areia', icon: Umbrella, reason: 'Ajuste de guarda-sol e estrutura' },
                { label: 'Trazer máquina de cartão de crédito', icon: Receipt, reason: 'Máquina de cartão para fechamento' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCallWaiter(item.reason)}
                    className="w-full p-3 bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-sky-800 border border-slate-200 hover:border-sky-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 text-left transition-all"
                  >
                    <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PIX PAYMENT AT TABLET */}
      {showPixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center relative">
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>

            {pixPaidSuccess ? (
              <div className="py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pagamento Confirmado!</h3>
                <p className="text-xs text-slate-500">
                  Identificamos a transação PIX de R$ {remainingBill.toFixed(2)}. Comanda atualizada!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                  <QrCode className="w-5 h-5" />
                  <span>Pagar com PIX no Tablet</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                  <div className="w-40 h-40 bg-white border border-slate-300 rounded-xl p-2 flex items-center justify-center shadow-xs">
                    {/* Visual QR Code Representation */}
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                              ? 'bg-slate-900'
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    Valor: R$ {remainingBill.toFixed(2)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Abra o aplicativo do seu banco e aponte a câmera para o QR Code acima.
                </p>

                <button
                  type="button"
                  onClick={handleConfirmPixPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simular Confirmação do Banco (PIX OK)</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
