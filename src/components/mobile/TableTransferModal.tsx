import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Merge, 
  MoveRight,
  Sparkles,
  Info
} from 'lucide-react';
import { TableOrSpot, TableTransferLog } from '../../types';

interface TableTransferModalProps {
  sourceTable: TableOrSpot;
  allTables: TableOrSpot[];
  isOpen: boolean;
  onClose: () => void;
  onExecuteTransfer: (
    transferType: 'troca_completa' | 'fusao' | 'transferencia_itens',
    targetTableId: string,
    selectedItemIds: string[],
    selectedCustomerIds: string[],
    reason: string
  ) => void;
}

export const TableTransferModal: React.FC<TableTransferModalProps> = ({
  sourceTable,
  allTables,
  isOpen,
  onClose,
  onExecuteTransfer,
}) => {
  const [transferType, setTransferType] = useState<'troca_completa' | 'fusao' | 'transferencia_itens'>('troca_completa');
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [reason, setReason] = useState<string>('Mudança por sol / maré na areia');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen) return null;

  // Filter available targets
  const candidateTables = allTables.filter(t => t.id !== sourceTable.id);
  const freeTables = candidateTables.filter(t => t.status === 'livre');
  const occupiedTables = candidateTables.filter(t => t.status === 'ocupada' || t.status === 'conta_solicitada');

  const targetOptions = transferType === 'fusao' 
    ? occupiedTables 
    : (transferType === 'troca_completa' ? freeTables : candidateTables);

  const handleToggleItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleToggleCustomer = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(c => c !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  const handleSelectAllItems = () => {
    if (selectedItemIds.length === sourceTable.orders.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(sourceTable.orders.map(o => o.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTableId) {
      alert('Selecione a mesa ou guarda-sol de destino!');
      return;
    }

    if (transferType === 'transferencia_itens' && selectedItemIds.length === 0) {
      alert('Selecione ao menos um item para transferir!');
      return;
    }

    const finalReason = reason === 'Outro' ? customReason : reason;
    onExecuteTransfer(
      transferType,
      targetTableId,
      selectedItemIds,
      selectedCustomerIds,
      finalReason || 'Transferência solicitada pelo cliente'
    );
    onClose();
  };

  const targetTable = allTables.find(t => t.id === targetTableId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-sm">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Troca & Transferência de Mesa
                <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
                  Origem: {sourceTable.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {sourceTable.name} • {sourceTable.orders.length} itens lançados
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operation Type Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tipo de Operação de Praia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransferType('troca_completa');
                  setTargetTableId('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  transferType === 'troca_completa'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm shadow-sky-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MoveRight className="w-5 h-5 mb-1 text-sky-600" />
                <span className="text-xs font-semibold leading-tight">Troca Total</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Move 100% da comanda</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferType('fusao');
                  setTargetTableId('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  transferType === 'fusao'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm shadow-sky-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Merge className="w-5 h-5 mb-1 text-sky-600" />
                <span className="text-xs font-semibold leading-tight">Juntar / Fusão</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Unifica 2 mesas ativas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferType('transferencia_itens');
                  setTargetTableId('');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  transferType === 'transferencia_itens'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm shadow-sky-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-sky-600" />
                <span className="text-xs font-semibold leading-tight">Parcial / Itens</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Move itens selecionados</span>
              </button>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              {transferType === 'troca_completa' && (
                <span>
                  <strong>Troca Completa:</strong> Toda a comanda do <strong>{sourceTable.code}</strong> será transferida para o novo ponto. A mesa de origem será desocupada e a cozinha/KDS receberá um alerta automático de redirecionamento de entrega.
                </span>
              )}
              {transferType === 'fusao' && (
                <span>
                  <strong>Fusão de Grupos:</strong> As comandas de <strong>{sourceTable.code}</strong> serão mescladas na mesa de destino. Os consumos individuais dos clientes de cada mesa continuarão separados para o rateio.
                </span>
              )}
              {transferType === 'transferencia_itens' && (
                <span>
                  <strong>Transferência Parcial:</strong> Permite mover clientes específicos ou itens consumidos para outro guarda-sol/mesa sem cancelar a mesa atual.
                </span>
              )}
            </div>
          </div>

          {/* Target Table Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Selecione o Ponto de Destino ({targetOptions.length} opções disponíveis)
            </label>
            {targetOptions.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Nenhuma mesa disponível para esta modalidade no momento.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {targetOptions.map((tbl) => {
                  const isSelected = targetTableId === tbl.id;
                  return (
                    <button
                      key={tbl.id}
                      type="button"
                      onClick={() => setTargetTableId(tbl.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-400/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{tbl.code}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase font-bold ${
                          tbl.status === 'livre' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {tbl.status === 'livre' ? 'Livre' : 'Ocupada'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 truncate">{tbl.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Partial Items Selection (if partial transfer) */}
          {transferType === 'transferencia_itens' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Selecione os Itens para Transferir
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllItems}
                  className="text-xs text-sky-600 hover:text-sky-800 underline font-semibold"
                >
                  {selectedItemIds.length === sourceTable.orders.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sourceTable.orders.map((item) => {
                  const isChecked = selectedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-sky-50 border-sky-300 text-slate-900' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{item.quantity}x {item.name}</p>
                          <p className="text-[10px] text-slate-500">Atribuído a: <span className="text-sky-700 font-bold">{item.assignedToCustomer}</span></p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfer Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Motivo da Mudança (Auditoria do Quiosque)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                'Mudança por sol / maré na areia',
                'Cliente pediu sombra no deck',
                'Junção de mesas / amigos',
                'Vento forte na primeira linha',
                'Outro motivo...',
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r === 'Outro motivo...' ? 'Outro' : r)}
                  className={`p-2 rounded-xl border text-xs text-left transition-colors ${
                    (reason === r || (reason === 'Outro' && r === 'Outro motivo...'))
                      ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason === 'Outro' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Descreva o motivo da troca..."
                className="w-full mt-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!targetTableId}
              className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl shadow-lg shadow-sky-200 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Confirmar Operação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
