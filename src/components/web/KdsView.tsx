import React from 'react';
import { 
  Flame, 
  Wine, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft,
  ChefHat,
  Bell
} from 'lucide-react';
import { TableOrSpot, OrderItem } from '../../types';

interface KdsViewProps {
  tables: TableOrSpot[];
  onUpdateOrderStatus: (tableId: string, orderId: string, newStatus: OrderItem['status']) => void;
}

export const KdsView: React.FC<KdsViewProps> = ({ tables, onUpdateOrderStatus }) => {
  // Aggregate all active orders from occupied tables
  const activeOrdersWithTable = tables.flatMap((t) =>
    t.orders
      .filter((o) => o.status !== 'entregue' && o.status !== 'cancelado')
      .map((o) => ({
        ...o,
        tableId: t.id,
        tableCode: t.code,
        tableName: t.name,
        sector: t.sector,
        waiterName: t.waiterName || 'Garçom de Areia',
      }))
  );

  const kitchenOrders = activeOrdersWithTable.filter((o) => o.prepStation === 'cozinha');
  const barOrders = activeOrdersWithTable.filter((o) => o.prepStation === 'bar');
  const supportOrders = activeOrdersWithTable.filter((o) => o.prepStation === 'apoio');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              KDS da Praia (Kitchen & Bar Display System)
            </h3>
            <p className="text-xs text-slate-500">
              Separação automática de comandas de Bar, Cozinha e Apoio de Praia em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200">
            {activeOrdersWithTable.length} pedidos pendentes na fila
          </span>
        </div>
      </div>

      {/* KDS Columns: Bar vs Kitchen vs Apoio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* BAR & DRINKS COLUMN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[640px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wine className="w-5 h-5 text-sky-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                Bar & Drinks da Praia ({barOrders.length})
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md font-bold border border-sky-200">
              Agilidade & Chopp
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {barOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                <p className="text-xs font-semibold text-slate-600">Tudo pronto no Bar!</p>
                <p className="text-[10px]">Nenhuma bebida pendente de preparo.</p>
              </div>
            ) : (
              barOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    order.status === 'pronto'
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                      {order.tableCode}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-sky-600" /> {order.timestamp}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900">
                    {order.quantity}x {order.name}
                  </h5>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Cliente: <span className="text-sky-700 font-semibold">{order.assignedToCustomer}</span>
                    {order.notes && <span className="text-amber-600 block font-semibold mt-0.5">Obs: {order.notes}</span>}
                  </p>

                  <div className="pt-2.5 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Garçom: {order.waiterName}
                    </span>

                    {order.status === 'enviado' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.tableId, order.id, 'pronto')}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-xl transition-colors shadow-sm"
                      >
                        Marcar Pronto
                      </button>
                    )}

                    {order.status === 'pronto' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.tableId, order.id, 'entregue')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Entregue na Areia
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KITCHEN & FRY COLUMN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[640px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Cozinha & Frutos do Mar ({kitchenOrders.length})
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold border border-amber-200">
              Fritura & Pratos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {kitchenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                <p className="text-xs font-semibold text-slate-600">Cozinha limpa!</p>
                <p className="text-[10px]">Sem porções aguardando preparo.</p>
              </div>
            ) : (
              kitchenOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    order.status === 'pronto'
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                      {order.tableCode} • {order.tableName}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-amber-500" /> {order.timestamp}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900">
                    {order.quantity}x {order.name}
                  </h5>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Cliente: <span className="text-amber-700 font-semibold">{order.assignedToCustomer}</span>
                    {order.notes && <span className="text-amber-600 block font-semibold mt-0.5">⚠️ Obs: {order.notes}</span>}
                  </p>

                  <div className="pt-2.5 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Garçom: {order.waiterName}
                    </span>

                    {order.status === 'enviado' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.tableId, order.id, 'pronto')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[10px] rounded-xl transition-colors shadow-sm"
                      >
                        Pronto p/ Levar
                      </button>
                    )}

                    {order.status === 'pronto' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.tableId, order.id, 'entregue')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Entregue
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BEACH SUPPORT / CADEIRAS & GUARDA-SOL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[640px] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Apoio & Montagem de Areia ({supportOrders.length})
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold border border-emerald-200">
              Estrutura
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {supportOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                <p className="text-xs font-semibold text-slate-600">Tudo montado na praia</p>
                <p className="text-[10px]">Sem solicitações de cadeiras ou guarda-sol pendentes.</p>
              </div>
            ) : (
              supportOrders.map((order) => (
                <div key={order.id} className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                      {order.tableCode}
                    </span>
                    <span className="text-[10px] text-slate-500">{order.timestamp}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">{order.quantity}x {order.name}</h5>
                  <div className="pt-2 mt-2 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.tableId, order.id, 'entregue')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl shadow-sm"
                    >
                      Montado & Entregue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
