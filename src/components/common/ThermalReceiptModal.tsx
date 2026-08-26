import React from 'react';
import { Printer, X, Check, QrCode, Receipt, Building, Clock, Users, ArrowRight } from 'lucide-react';
import { TableOrSpot, EstablishmentProfile } from '../../types';

interface ThermalReceiptModalProps {
  table: TableOrSpot;
  activeProfile: EstablishmentProfile;
  isOpen: boolean;
  onClose: () => void;
  type?: 'pre_conta' | 'producao_kds' | 'fechamento_caixa';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  table,
  activeProfile,
  isOpen,
  onClose,
  type = 'pre_conta',
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const subtotal = table.orders.reduce((acc, o) => acc + o.price * o.quantity, 0);
  const serviceFee = (subtotal * (table.serviceFeePercent || 10)) / 100;
  const total = subtotal + serviceFee;
  const paid = table.paidAmount || 0;
  const remaining = Math.max(0, total - paid);

  // Group items by customer or all
  const customerBreakdown = table.customers?.map((cust) => {
    const custOrders = table.orders.filter(
      (o) => o.assignedToCustomer === cust.name || o.assignedToCustomer === 'Mesa Toda'
    );
    const directTotal = table.orders
      .filter((o) => o.assignedToCustomer === cust.name)
      .reduce((s, o) => s + o.price * o.quantity, 0);
    const sharedTotal = table.orders
      .filter((o) => o.assignedToCustomer === 'Mesa Toda')
      .reduce((s, o) => s + o.price * o.quantity, 0) / (table.customers.length || 1);
    
    const custSubtotal = directTotal + sharedTotal;
    const custService = (custSubtotal * (table.serviceFeePercent || 10)) / 100;
    const custTotal = custSubtotal + custService;

    return {
      name: cust.name,
      subtotal: custSubtotal,
      service: custService,
      total: custTotal,
    };
  }) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {type === 'pre_conta' ? 'Pré-Conta (Cupom Não-Fiscal)' : type === 'producao_kds' ? 'Ticket de Produção' : 'Cupom de Fechamento'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper (80mm Monospaced Style) */}
        <div className="flex-1 overflow-y-auto bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 font-mono text-[11px] text-slate-800 space-y-3 shadow-inner">
          {/* Header of Receipt */}
          <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              {activeProfile.tradeName || 'SOFTHAM OPENDESK'}
            </h4>
            <p className="text-[10px] text-slate-600">{activeProfile.name}</p>
            <p className="text-[9px] text-slate-500">{activeProfile.location}</p>
            <p className="text-[9px] text-slate-500">CNPJ: 00.000.000/0001-99</p>
            <p className="text-[9px] font-bold text-slate-700 mt-1">
              *** DOCUMENTO NÃO FISCAL - PRÉ-CONTA ***
            </p>
          </div>

          {/* Table & Operator Details */}
          <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span>LOCAL: <strong>{table.code} ({table.name})</strong></span>
              <span>SETOR: {table.sector}</span>
            </div>
            <div className="flex justify-between">
              <span>ATENDENTE: {table.waiterName || 'Atendimento Geral'}</span>
              <span>{dateStr} {timeStr}</span>
            </div>
            {table.openedAt && (
              <div className="flex justify-between text-slate-500">
                <span>ABERTO ÀS: {table.openedAt}</span>
                <span>CMD: #{table.id.replace('table-', '100')}</span>
              </div>
            )}
          </div>

          {/* Order Items Table */}
          <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-700">
              <span>QTD ITEM</span>
              <span>VL.TOTAL</span>
            </div>
            {table.orders.map((ord, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {ord.quantity}x {ord.name}
                  </span>
                  <span>R$ {(ord.price * ord.quantity).toFixed(2)}</span>
                </div>
                {ord.assignedToCustomer && (
                  <div className="text-[9px] text-slate-500 pl-2">
                    ➔ Consumidor: {ord.assignedToCustomer} {ord.notes ? `(${ord.notes})` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rateio por Pessoa (Se houver múltiplos clientes) */}
          {customerBreakdown.length > 1 && (
            <div className="space-y-1 pb-2 border-b border-dashed border-slate-400">
              <span className="font-bold text-[10px] uppercase block">
                DIVISÃO SUGERIDA POR PESSOA:
              </span>
              {customerBreakdown.map((cust, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span>• {cust.name}:</span>
                  <span className="font-bold">R$ {cust.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Financial Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between">
              <span>SUBTOTAL DOS ITENS:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TAXA SERVIÇO ({table.serviceFeePercent || 10}%):</span>
              <span>R$ {serviceFee.toFixed(2)}</span>
            </div>
            {table.minimumConsumption > 0 && (
              <div className="flex justify-between text-sky-700 text-[10px]">
                <span>CONSUMAÇÃO MÍNIMA:</span>
                <span>R$ {table.minimumConsumption.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-400 text-slate-900">
              <span>TOTAL A PAGAR:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {paid > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>VALORES RECEBIDOS:</span>
                <span>- R$ {paid.toFixed(2)}</span>
              </div>
            )}
            {paid > 0 && (
              <div className="flex justify-between text-slate-900 font-black">
                <span>SALDO RESTANTE:</span>
                <span>R$ {remaining.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer & QR Code PIX */}
          <div className="text-center pt-2 space-y-1 text-[9px] text-slate-500 border-t border-dashed border-slate-400">
            <p className="font-bold text-slate-700">PAGAMENTO RÁPIDO VIA PIX</p>
            <div className="w-20 h-20 mx-auto bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
            <p>CHAVE PIX: financeiro@softham.com.br</p>
            <p className="font-semibold mt-1">Obrigado pela preferência!</p>
            <p className="text-[8px]">Sistema Softham OpenDesk • Homologado</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
