import React, { useState } from 'react';
import { 
  DollarSign, 
  X, 
  Users, 
  QrCode, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Receipt, 
  Percent, 
  ArrowRight,
  Share2,
  Copy,
  Printer
} from 'lucide-react';
import { TableOrSpot, PaymentRecord, EstablishmentProfile } from '../../types';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';

interface BillSplitModalProps {
  table: TableOrSpot;
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: Omit<PaymentRecord, 'id' | 'timestamp'>) => void;
  onCloseTableBill: () => void;
  activeProfile?: EstablishmentProfile;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({
  table,
  isOpen,
  onClose,
  onAddPayment,
  onCloseTableBill,
  activeProfile,
}) => {
  const [splitMode, setSplitMode] = useState<'individual' | 'igual' | 'avulso'>('individual');
  const [equalSplitPersons, setEqualSplitPersons] = useState<number>(
    table.customers.length > 0 ? table.customers.length : 2
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    table.customers[0]?.id || ''
  );
  
  // Payment Form States
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'>('pix');
  const [payerName, setPayerName] = useState<string>(table.customers[0]?.name || 'Cliente 1');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [pixCopied, setPixCopied] = useState<boolean>(false);
  const [receiptSent, setReceiptSent] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate Base Consumption
  const subtotal = table.orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
  const serviceFee = (subtotal * table.serviceFeePercent) / 100;
  const totalAmount = subtotal + serviceFee;
  const remainingAmount = Math.max(0, totalAmount - table.paidAmount);
  const isFullyPaid = remainingAmount <= 0.05 && table.orders.length > 0;

  // Calculation per Customer for Individual Split
  const individualBreakdown = table.customers.map(cust => {
    // 1. Direct items
    const directItems = table.orders.filter(
      o => o.assignedToCustomer.toLowerCase() === cust.name.toLowerCase()
    );
    const directTotal = directItems.reduce((acc, o) => acc + (o.price * o.quantity), 0);

    // 2. Shared items (assigned to "Mesa Toda" or similar)
    const sharedItems = table.orders.filter(
      o => o.assignedToCustomer.toLowerCase().includes('mesa') || 
           o.assignedToCustomer.toLowerCase().includes('todos') ||
           o.assignedToCustomer.toLowerCase().includes('compartilhado')
    );
    const sharedTotal = sharedItems.reduce((acc, o) => acc + (o.price * o.quantity), 0);
    const sharedPerPerson = table.customers.length > 0 ? sharedTotal / table.customers.length : 0;

    const custSubtotal = directTotal + sharedPerPerson;
    const custService = (custSubtotal * table.serviceFeePercent) / 100;
    const custTotal = custSubtotal + custService;

    // Payments already made by this customer
    const paidByCust = table.payments
      .filter(p => p.customerName.toLowerCase() === cust.name.toLowerCase())
      .reduce((acc, p) => acc + p.amount, 0);

    return {
      customer: cust,
      directItems,
      directTotal,
      sharedPerPerson,
      custSubtotal,
      custService,
      custTotal,
      paidByCust,
      remaining: Math.max(0, custTotal - paidByCust),
    };
  });

  const selectedCustomerData = individualBreakdown.find(b => b.customer.id === selectedCustomerId);

  const handleApplyPresetAmount = (amt: number) => {
    setPaymentAmount(amt.toFixed(2));
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paymentAmount);
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de pagamento válido!');
      return;
    }

    if (val > remainingAmount + 0.5) {
      alert(`O valor informado (R$ ${val.toFixed(2)}) é maior que o saldo restante da mesa (R$ ${remainingAmount.toFixed(2)}).`);
      return;
    }

    onAddPayment({
      customerName: payerName || 'Cliente',
      amount: val,
      method: paymentMethod,
    });

    setPaymentAmount('');
    setCashTendered('');
  };

  const handleCopyPix = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl text-slate-800 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Fechamento & Rateio Inteligente
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  {table.code} • {table.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Atendente: {table.waiterName || 'Equipe de Areia'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consumo Bruto</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">R$ {subtotal.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Taxa Serviço ({table.serviceFeePercent}%)</span>
            <p className="text-sm font-bold text-amber-600 mt-0.5">R$ {serviceFee.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Pago</span>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">R$ {table.paidAmount.toFixed(2)}</p>
          </div>
          <div className={`p-3 rounded-2xl border shadow-sm ${
            isFullyPaid 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {isFullyPaid ? 'Conta Liquidada' : 'Saldo Restante'}
            </span>
            <p className="text-base font-extrabold mt-0.5">
              R$ {remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Split Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Modalidade de Rateio da Mesa
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitMode('individual')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  splitMode === 'individual'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-sm shadow-emerald-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-semibold">Por Consumo Individual</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Cada um paga o que pediu + rateio de porção</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('igual')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  splitMode === 'igual'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm shadow-sky-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Percent className="w-5 h-5 mb-1 text-sky-600" />
                <span className="text-xs font-semibold">Divisão Igualitária</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Rachadinha em partes iguais</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('avulso')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  splitMode === 'avulso'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold shadow-sm shadow-purple-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-5 h-5 mb-1 text-purple-600" />
                <span className="text-xs font-semibold">Valor Livre / Avulso</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Abater pagamentos parciais</span>
              </button>
            </div>
          </div>

          {/* MODE 1: INDIVIDUAL BREAKDOWN */}
          {splitMode === 'individual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Extrato por Cliente na Mesa
                </span>
                <span className="text-xs text-sky-700 font-medium">
                  💡 Porções compartilhadas foram rateadas igualmente entre os clientes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {individualBreakdown.map((item) => (
                  <div
                    key={item.customer.id}
                    onClick={() => {
                      setSelectedCustomerId(item.customer.id);
                      setPayerName(item.customer.name);
                      setPaymentAmount(item.remaining.toFixed(2));
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedCustomerId === item.customer.id
                        ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.customer.color }} 
                        />
                        <span className="font-bold text-sm text-slate-900">{item.customer.name}</span>
                      </div>
                      {item.remaining <= 0.05 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Pago
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-sky-700">
                          Resta: R$ {item.remaining.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Consumo individual direto:</span>
                        <span className="text-slate-800 font-medium">R$ {item.directTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rateio porções mesa:</span>
                        <span className="text-slate-800 font-medium">R$ {item.sharedPerPerson.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa serviço ({table.serviceFeePercent}%):</span>
                        <span className="text-slate-800 font-medium">R$ {item.custService.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-xs text-slate-900">
                        <span>Total devido:</span>
                        <span className="text-emerald-600 font-extrabold">R$ {item.custTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: EQUAL SPLIT */}
          {splitMode === 'igual' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Número de Pessoas Dividindo
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setEqualSplitPersons(num);
                          const perPerson = totalAmount / num;
                          setPaymentAmount(perPerson.toFixed(2));
                        }}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                          equalSplitPersons === num
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                    Valor por Pessoa ({equalSplitPersons} cotas)
                  </span>
                  <p className="text-xl font-black text-sky-700">
                    R$ {(totalAmount / equalSplitPersons).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Com serviço incluso</span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT DISPATCH & PROCESSING SECTION */}
          {!isFullyPaid && (
            <form onSubmit={handleRegisterPayment} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  Registrar Pagamento Parcial / Total
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetAmount(remainingAmount)}
                    className="text-[11px] font-semibold px-2 py-0.5 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-lg transition-colors"
                  >
                    Pagar Restante (R$ {remainingAmount.toFixed(2)})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nome do Pagador
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Ex: Carlos, Juliana..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valor a Pagar (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Pix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_credito')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cartao_credito'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_debito')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cartao_debito'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Débito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'dinheiro'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Dinheiro</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Helper based on method */}
              {paymentMethod === 'pix' && paymentAmount && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-emerald-800">
                    <QrCode className="w-8 h-8 p-1 bg-white text-slate-900 border border-emerald-200 rounded-xl shrink-0" />
                    <div>
                      <p className="font-bold">QR Code Pix Dinâmico de R$ {paymentAmount}</p>
                      <p className="text-[10px] text-emerald-600">Chave: quiosque.praia@softham.com.br</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {pixCopied ? 'Copiado!' : 'Copiar Chave'}
                  </button>
                </div>
              )}

              {paymentMethod === 'dinheiro' && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-600 mb-1">Valor Entregue pelo Cliente (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="Ex: 100.00"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 shadow-sm"
                    />
                  </div>
                  {cashTendered && parseFloat(cashTendered) >= parseFloat(paymentAmount || '0') && (
                    <div className="text-right pt-4">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Troco a Devolver</span>
                      <span className="text-base font-bold text-slate-900">
                        R$ {(parseFloat(cashTendered) - parseFloat(paymentAmount || '0')).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Recebimento de R$ {paymentAmount || '0.00'}
              </button>
            </form>
          )}

          {/* History of Payments for this Table */}
          {table.payments.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pagamentos Efetuados nesta Mesa ({table.payments.length})
              </h5>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {table.payments.map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md uppercase font-bold bg-white border border-slate-200 text-slate-700">
                        {p.method.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-slate-900">{p.customerName}</span>
                      <span className="text-[10px] text-slate-400">{p.timestamp}</span>
                    </div>
                    <span className="font-bold text-emerald-600">+ R$ {p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setReceiptSent(true);
                setTimeout(() => setReceiptSent(false), 3000);
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              {receiptSent ? 'Enviado por WhatsApp!' : 'Enviar Comprovante (WhatsApp)'}
            </button>
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-sky-600" />
              <span>Imprimir Pré-Conta</span>
            </button>
          </div>

          {isFullyPaid ? (
            <button
              type="button"
              onClick={() => {
                onCloseTableBill();
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalizar & Liberar Mesa
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Continuar Atendimento
            </button>
          )}
        </div>
      </div>

      {isReceiptModalOpen && (
        <ThermalReceiptModal
          table={table}
          activeProfile={activeProfile || {
            id: 'default',
            name: 'Softham OpenDesk',
            tradeName: 'Softham OpenDesk',
            type: 'restaurante_bar',
            tagline: 'PDV & Mesas Multi-Ambiente',
            location: 'Matriz Principal',
            currency: 'BRL',
            defaultServiceFee: 10,
            sectors: [],
          }}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          type="pre_conta"
        />
      )}
    </div>
  );
};
