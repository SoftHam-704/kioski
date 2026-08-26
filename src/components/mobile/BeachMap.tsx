import React, { useState } from 'react';
import { 
  Umbrella, 
  Users, 
  Receipt, 
  ArrowRightLeft, 
  Plus, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Waves,
  Sun,
  ShieldAlert,
  Sparkles,
  Coffee,
  Building,
  Trees,
  Layers
} from 'lucide-react';
import { TableOrSpot, TableSector, EstablishmentProfile } from '../../types';

interface BeachMapProps {
  tables: TableOrSpot[];
  activeProfile?: EstablishmentProfile;
  onSelectTable: (table: TableOrSpot) => void;
  onOpenTransferModal: (table: TableOrSpot) => void;
  onOpenSplitModal: (table: TableOrSpot) => void;
  onOpenNewOrder: (table: TableOrSpot) => void;
}

export const BeachMap: React.FC<BeachMapProps> = ({
  tables,
  activeProfile,
  onSelectTable,
  onOpenTransferModal,
  onOpenSplitModal,
  onOpenNewOrder,
}) => {
  const [selectedSector, setSelectedSector] = useState<TableSector | 'todos'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ocupadas' | 'livres'>('todos');

  // Dynamic sectors from profile or default fallback
  const sectors = activeProfile?.sectors?.length
    ? [{ id: 'todos', label: 'Todos os Setores', iconName: 'layers' as const, description: 'Visão geral do salão' }, ...activeProfile.sectors]
    : [
        { id: 'todos', label: 'Todos os Setores', iconName: 'layers' as const, description: 'Visão geral' },
        { id: 'areia_frente', label: '1ª Linha', iconName: 'sun' as const, description: 'Frente Mar' },
        { id: 'areia_meio', label: '2ª Linha', iconName: 'umbrella' as const, description: 'Areia Meio' },
        { id: 'deck_coberto', label: 'Deck Coberto', iconName: 'coffee' as const, description: 'Deck' },
        { id: 'lounge_bangalo', label: 'Lounge VIP', iconName: 'flame' as const, description: 'Bangalôs' },
      ];

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return Sun;
      case 'umbrella': return Umbrella;
      case 'coffee': return Coffee;
      case 'flame': return Flame;
      case 'sparkles': return Sparkles;
      case 'users': return Users;
      case 'building': return Building;
      case 'trees': return Trees;
      default: return Layers;
    }
  };

  const filteredTables = tables.filter((t) => {
    const matchesSector = selectedSector === 'todos' || t.sector === selectedSector;
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ocupadas' && (t.status === 'ocupada' || t.status === 'conta_solicitada')) ||
      (statusFilter === 'livres' && t.status === 'livre');
    return matchesSector && matchesStatus;
  });

  const occupiedCount = tables.filter((t) => t.status === 'ocupada' || t.status === 'conta_solicitada').length;
  const freeCount = tables.filter((t) => t.status === 'livre').length;


  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      {/* Top Banner Stats */}
      <div className="p-3 bg-white border-b border-slate-200 space-y-2.5 shadow-sm shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              <Umbrella className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">Mapa de Mesas & Areia</h3>
              <p className="text-[10px] text-slate-500">
                {occupiedCount} ocupadas • {freeCount} livres
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 shrink-0">
            Total: {tables.length}
          </span>
        </div>

        {/* Status Segmented Filter */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all text-center ${
              statusFilter === 'todos'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({tables.length})
          </button>
          <button
            onClick={() => setStatusFilter('ocupadas')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all text-center ${
              statusFilter === 'ocupadas'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ocupadas ({occupiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('livres')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all text-center ${
              statusFilter === 'livres'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Livres ({freeCount})
          </button>
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {sectors.map((sec) => {
            const Icon = getSectorIcon((sec as any).iconName || 'layers');
            const isSelected = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id as any)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tables List / Single Column for Mobile POS Display */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {filteredTables.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
            <Umbrella className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-bold text-slate-700">Nenhuma mesa encontrada neste filtro.</p>
            <button
              onClick={() => {
                setSelectedSector('todos');
                setStatusFilter('todos');
              }}
              className="text-xs text-sky-600 font-bold underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          filteredTables.map((table) => {
            const isOccupied = table.status === 'ocupada' || table.status === 'conta_solicitada';
            const subtotal = table.orders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
            const service = (subtotal * table.serviceFeePercent) / 100;
            const totalWithService = subtotal + service;
            const remaining = Math.max(0, totalWithService - table.paidAmount);

            const minConsMet = subtotal >= table.minimumConsumption;

            return (
              <div
                key={table.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  table.status === 'conta_solicitada'
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                    : isOccupied
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-white/80 border-dashed border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-sky-700 px-2 py-0.5 bg-sky-50 rounded-lg border border-sky-100 shrink-0">
                        {table.code}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{table.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {table.sector === 'areia_frente' && '🌊 1ª Linha Frente Mar'}
                          {table.sector === 'areia_meio' && '🏖️ 2ª Linha Areia Meio'}
                          {table.sector === 'deck_coberto' && '🏠 Deck Coberto'}
                          {table.sector === 'lounge_bangalo' && '👑 Lounge VIP Bangalô'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                        table.status === 'conta_solicitada'
                          ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                          : isOccupied
                          ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                      }`}
                    >
                      {table.status === 'conta_solicitada'
                        ? 'Conta Solicitada'
                        : isOccupied
                        ? 'Em Consumo'
                        : 'Disponível'}
                    </span>
                  </div>

                  {/* Occupied State Info */}
                  {isOccupied && (
                    <div className="space-y-2 my-2.5 text-xs">
                      {/* Customers Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {table.customers.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="truncate max-w-[100px]">{c.name}</span>
                          </span>
                        ))}
                      </div>

                      {/* Financial Summary */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            Consumo ({table.orders.length} {table.orders.length === 1 ? 'item' : 'itens'}):
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            R$ {totalWithService.toFixed(2)}
                          </span>
                        </div>

                        {table.paidAmount > 0 ? (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              Pago: R$ {table.paidAmount.toFixed(2)}
                            </span>
                            <span className="text-xs font-black text-amber-600">
                              Resta: R$ {remaining.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Aberto às {table.openedAt || '11:00'}</span>
                            <span className="text-[11px] font-bold text-sky-700">{table.waiterName || 'Rodrigo'}</span>
                          </div>
                        )}
                      </div>

                      {/* Minimum Consumption Badge */}
                      {table.minimumConsumption > 0 && (
                        <div className="flex items-center justify-between text-[10px] px-1">
                          <span className="text-slate-500">
                            Mínimo: R$ {table.minimumConsumption.toFixed(2)}
                          </span>
                          {minConsMet ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Atingida
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">
                              Falta R$ {(table.minimumConsumption - subtotal).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons for this Table */}
                <div className="pt-2 border-t border-slate-100 mt-2">
                  {isOccupied ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenNewOrder(table)}
                        className="py-2 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>Pedir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenTransferModal(table)}
                        title="Trocar de Mesa / Guarda-Sol ou Juntar Grupos"
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Trocar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenSplitModal(table)}
                        title="Fechar e Ratear Conta entre Clientes"
                        className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        <span>Ratear</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenNewOrder(table)}
                      className="w-full py-2.5 px-3 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>Abrir Atendimento no {table.code}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
