import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  X, 
  Check, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign, 
  ArrowRightLeft,
  Receipt
} from 'lucide-react';
import { TableOrSpot, TableTransferLog, BeachItem, EstablishmentProfile } from '../../types';

interface ExportReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableOrSpot[];
  transferLogs: TableTransferLog[];
  menu: BeachItem[];
  activeProfile: EstablishmentProfile;
}

export const ExportReportsModal: React.FC<ExportReportsModalProps> = ({
  isOpen,
  onClose,
  tables,
  transferLogs,
  menu,
  activeProfile,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Summary figures
  const totalBilled = tables.reduce((acc, t) => {
    const subtotal = t.orders.reduce((s, o) => s + (o.price * o.quantity), 0);
    const service = (subtotal * (t.serviceFeePercent || 10)) / 100;
    return acc + subtotal + service;
  }, 0);

  const totalCollected = tables.reduce((acc, t) => acc + (t.paidAmount || 0), 0);
  const totalOrders = tables.reduce((acc, t) => acc + t.orders.reduce((s, o) => s + o.quantity, 0), 0);

  // CSV Generator Helpers
  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${now.toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 1. Export Tables & Billing CSV
  const handleExportBillingCsv = () => {
    let csv = 'Codigo Mesa;Nome Local;Setor;Status;Garcom;Itens Pedidos;Subtotal (R$);Taxa Servico (R$);Total (R$);Valor Pago (R$);Saldo (R$)\n';
    
    tables.forEach((t) => {
      const subtotal = t.orders.reduce((s, o) => s + o.price * o.quantity, 0);
      const service = (subtotal * (t.serviceFeePercent || 10)) / 100;
      const total = subtotal + service;
      const paid = t.paidAmount || 0;
      const balance = Math.max(0, total - paid);
      const itemsCount = t.orders.reduce((s, o) => s + o.quantity, 0);

      csv += `"${t.code}";"${t.name}";"${t.sector}";"${t.status}";"${t.waiterName || 'Sem garcom'}";${itemsCount};${subtotal.toFixed(2)};${service.toFixed(2)};${total.toFixed(2)};${paid.toFixed(2)};${balance.toFixed(2)}\n`;
    });

    downloadCsv('softham_faturamento_mesas', csv);
  };

  // 2. Export Audit Logs CSV
  const handleExportAuditCsv = () => {
    let csv = 'Data/Hora;Mesa Origem;Mesa Destino;Tipo Acao;Garcom Solicitante;Motivo;Itens Transferidos;Clientes Transferidos\n';

    transferLogs.forEach((log) => {
      csv += `"${log.timestamp}";"${log.sourceTableCode}";"${log.targetTableCode}";"${log.transferType}";"${log.waiterName}";"${log.reason}";${log.itemsTransferredCount};${log.customersTransferredCount}\n`;
    });

    downloadCsv('softham_auditoria_trocas', csv);
  };

  // 3. Export Menu & Pricing CSV
  const handleExportMenuCsv = () => {
    let csv = 'ID Produto;Nome;Categoria;Estacao KDS;Preco (R$);Tempo Preparo (min);Disponivel\n';

    menu.forEach((item) => {
      csv += `"${item.id}";"${item.name}";"${item.category}";"${item.prepStation}";${item.price.toFixed(2)};${item.prepTimeMinutes};"${item.isAvailable !== false ? 'Sim' : 'Nao'}"\n`;
    });

    downloadCsv('softham_cardapio_precos', csv);
  };

  const handlePrintPdfReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Central de Exportação de Relatórios & DRE
              </h3>
              <p className="text-xs text-slate-500">
                Gere planilhas em Excel/CSV e relatórios gerenciais em PDF prontos para a contabilidade.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Planilha <strong>{downloadSuccess}.csv</strong> gerada e baixada com sucesso!</span>
          </div>
        )}

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Faturado</span>
            <span className="text-sm font-black text-slate-900">R$ {totalBilled.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Recebido / Caixa</span>
            <span className="text-sm font-black text-emerald-600">R$ {totalCollected.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Itens Vendidos</span>
            <span className="text-sm font-black text-sky-600">{totalOrders} itens</span>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto">
          {/* Card 1: Faturamento e Mesas */}
          <div className="p-4 bg-white border border-slate-200 hover:border-sky-300 rounded-2xl shadow-xs space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-bold text-slate-900">Extrato de Mesas & Vendas</h4>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">.CSV / Excel</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Consolidado de todas as comandas, faturamento por setor, taxa de serviço e garçons.
            </p>
            <button
              onClick={handleExportBillingCsv}
              className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Planilha de Vendas</span>
            </button>
          </div>

          {/* Card 2: Auditoria de Trocas e Fusões */}
          <div className="p-4 bg-white border border-slate-200 hover:border-sky-300 rounded-2xl shadow-xs space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900">Auditoria de Trocas & Motivos</h4>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">.CSV / Excel</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Histórico com horários, garçom responsável e justificativas de trocas para prevenção de fraudes.
            </p>
            <button
              onClick={handleExportAuditCsv}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Planilha de Auditoria</span>
            </button>
          </div>

          {/* Card 3: Cardápio e Preços */}
          <div className="p-4 bg-white border border-slate-200 hover:border-sky-300 rounded-2xl shadow-xs space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Tabela de Cardápio & Preços</h4>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">.CSV / Excel</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Exportação completa de itens cadastrados, preços de venda, estações KDS e tempos de preparo.
            </p>
            <button
              onClick={handleExportMenuCsv}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Cardápio Atual</span>
            </button>
          </div>

          {/* Card 4: Relatório Executivo PDF */}
          <div className="p-4 bg-white border border-slate-200 hover:border-sky-300 rounded-2xl shadow-xs space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">Relatório Executivo PDF</h4>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">PDF / Impressão</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Layout formatado para impressão ou exportação em PDF com resumo gerencial do dia e gráficos.
            </p>
            <button
              onClick={handlePrintPdfReport}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Estabelecimento: {activeProfile.name} • {dateFormatted} {timeFormatted}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
