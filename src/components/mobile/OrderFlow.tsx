import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Search, 
  Flame, 
  Wine, 
  Coffee, 
  Umbrella, 
  Users, 
  Sparkles,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { BeachItem, TableOrSpot, OrderItem } from '../../types';

interface OrderFlowProps {
  table: TableOrSpot;
  menu: BeachItem[];
  onAddOrders: (newOrders: Omit<OrderItem, 'id' | 'timestamp' | 'status'>[]) => void;
  onBackToMap: () => void;
}

export const OrderFlow: React.FC<OrderFlowProps> = ({
  table,
  menu,
  onAddOrders,
  onBackToMap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{
    item: BeachItem;
    quantity: number;
    assignedCustomer: string;
    notes: string;
  }[]>([]);

  const [activeCustomer, setActiveCustomer] = useState<string>(
    table.customers[0]?.name || 'Mesa Toda'
  );
  const [quickNote, setQuickNote] = useState<string>('');

  const categories = [
    { id: 'todos', label: 'Todos os Itens', icon: Sparkles },
    { id: 'bebidas', label: 'Bebidas & Coco', icon: Coffee },
    { id: 'drinks', label: 'Drinks & Caipiras', icon: Wine },
    { id: 'porcoes', label: 'Porções da Praia', icon: Flame },
    { id: 'aluguel', label: 'Cadeiras & Guarda-Sol', icon: Umbrella },
  ];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: BeachItem) => {
    const existingIndex = cart.findIndex(
      (c) => c.item.id === item.id && c.assignedCustomer === activeCustomer && c.notes === quickNote
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          item,
          quantity: 1,
          assignedCustomer: activeCustomer,
          notes: quickNote,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleDispatchOrder = () => {
    if (cart.length === 0) return;

    const formattedOrders = cart.map((c) => ({
      itemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      assignedToCustomer: c.assignedCustomer,
      notes: c.notes,
      prepStation: c.item.prepStation,
    }));

    onAddOrders(formattedOrders);
    setCart([]);
    onBackToMap();
  };

  const cartTotal = cart.reduce((acc, c) => acc + (c.item.price * c.quantity), 0);  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Mapa</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100">
            {table.code} • {table.name}
          </span>
        </div>
      </div>

      {/* Target Customer Selector Bar (Crucial for bill splitting) */}
      <div className="p-2 bg-white/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap pl-1 shrink-0">
          <Users className="w-3.5 h-3.5 text-sky-600" />
          Para:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveCustomer('Mesa Toda')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCustomer === 'Mesa Toda'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mesa Toda
          </button>

          {table.customers
            .filter((c) => c.name !== 'Mesa Toda')
            .map((cust) => (
              <button
                key={cust.id}
                type="button"
                onClick={() => setActiveCustomer(cust.name)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCustomer === cust.name
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cust.color }} />
                <span>{cust.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Search & Categories */}
      <div className="p-2.5 space-y-2 bg-white/40 border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar porção, caipirinha, camarão..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Notes Selector */}
      <div className="px-2.5 py-1.5 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap shrink-0">Obs:</span>
        {['Sem gelo', 'Gelo e limão', 'Molho à parte', 'Bem frito', 'Copo extra'].map((note) => (
          <button
            key={note}
            type="button"
            onClick={() => setQuickNote(quickNote === note ? '' : note)}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-semibold whitespace-nowrap transition-colors shrink-0 ${
              quickNote === note
                ? 'bg-sky-100 text-sky-800 border border-sky-300 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {note}
          </button>
        ))}
      </div>

      {/* Menu Item Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                  item.prepStation === 'bar' 
                    ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                    : item.prepStation === 'cozinha' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {item.prepStation}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px]">
                <span className="font-extrabold text-slate-900">R$ {item.price.toFixed(2)}</span>
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" /> ~{item.prepTimeMinutes} min
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddToCart(item)}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-200 flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active Cart & Dispatch Bar */}
      {cart.length > 0 && (
        <div className="p-3 bg-white border-t border-slate-200 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1">
              🛒 Itens para Enviar ({cart.reduce((a, b) => a + b.quantity, 0)})
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              Total: <span className="text-emerald-600">R$ {cartTotal.toFixed(2)}</span>
            </span>
          </div>

          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {cart.map((cartItem, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-slate-900 truncate">{cartItem.item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    Cliente: <span className="text-sky-700 font-bold">{cartItem.assignedCustomer}</span>
                    {cartItem.notes && ` • (${cartItem.notes})`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(idx, -1)}
                    className="p-1 bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg shadow-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-xs text-slate-900 px-1">{cartItem.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(idx, 1)}
                    className="p-1 bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromCart(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDispatchOrder}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            Enviar Pedido para Bar / Cozinha (KDS)
          </button>
        </div>
      )}
    </div>
  );
};
