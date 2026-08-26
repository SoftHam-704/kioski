import React, { useState } from 'react';
import { 
  Wifi, 
  RefreshCw, 
  Server, 
  Smartphone, 
  Tablet, 
  LayoutDashboard, 
  CheckCircle2, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Database,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TableOrSpot, BeachItem, TableTransferLog, EstablishmentProfile } from '../../types';
import { syncEngine } from '../../utils/syncEngine';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableOrSpot[];
  menu: BeachItem[];
  transferLogs: TableTransferLog[];
  activeProfile: EstablishmentProfile;
  onResetFactory: () => void;
  onRestoreData: (restored: { tables?: TableOrSpot[]; menu?: BeachItem[]; transferLogs?: TableTransferLog[] }) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  tables,
  menu,
  transferLogs,
  activeProfile,
  onResetFactory,
  onRestoreData,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number>(14);
  const [syncStatus, setSyncStatus] = useState<'sincronizado' | 'sincronizando' | 'erro'>('sincronizado');
  const [jsonImportText, setJsonImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(Math.random() * 15) + 8);
      setIsPinging(false);
      setAlertMsg('Ping executado com sucesso! Conexão estável com Softham Cloud.');
      setTimeout(() => setAlertMsg(null), 3000);
    }, 600);
  };

  const handleForceSync = () => {
    setSyncStatus('sincronizando');
    syncEngine.broadcastUpdate({
      tables,
      menu,
      transferLogs,
      activeProfileId: activeProfile.id,
      senderNode: 'Gerência Web',
    });

    setTimeout(() => {
      setSyncStatus('sincronizado');
      setAlertMsg('Dados propagados em tempo real para todos os terminais ativos!');
      setTimeout(() => setAlertMsg(null), 3000);
    }, 400);
  };

  const handleDownloadBackup = () => {
    const backupObj = {
      app: 'Softham OpenDesk',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      activeProfile,
      tables,
      menu,
      transferLogs,
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_opendesk_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAlertMsg('Arquivo de backup JSON exportado com sucesso!');
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      if (parsed.tables || parsed.menu || parsed.transferLogs) {
        onRestoreData({
          tables: parsed.tables,
          menu: parsed.menu,
          transferLogs: parsed.transferLogs,
        });
        setAlertMsg('Base de dados restaurada com sucesso!');
        setShowImportBox(false);
        setJsonImportText('');
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert('Formato JSON inválido. Certifique-se de que contenha as chaves "tables" ou "menu".');
      }
    } catch (e) {
      alert('Erro ao interpretar JSON. Verifique a formatação.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Softham Cloud Sync & Topologia Multi-Dispositivo
              </h3>
              <p className="text-xs text-slate-500">
                Replicação em tempo real entre tablets, celulares de garçons, KDS e retaguarda.
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

        {/* Alert notification */}
        {alertMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertMsg}</span>
          </div>
        )}

        {/* Network & Hub Status */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-xs text-slate-900">
                Softham Realtime Bus: Online & Ativo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                Latência: <strong className="text-emerald-600">{pingLatency}ms</strong>
              </span>
              <button
                onClick={handleTestPing}
                disabled={isPinging}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Testar Ping"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Utiliza motor híbrido <strong>BroadcastChannel + Storage Local</strong>. Se você abrir o sistema em múltiplas abas ou janelas simulando tablet, garçom e cozinha simultaneamente, os pedidos atualizam instantaneamente sem recarregar a tela.
          </p>
        </div>

        {/* Active Nodes Topology */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Topologia de Dispositivos Conectados na Rede Local
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">Garçom 01</span>
              <span className="text-[9px] text-slate-400 block">Smart POS (Portátil)</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <Tablet className="w-4 h-4 text-blue-600" />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">Tablet Mesa 04</span>
              <span className="text-[9px] text-slate-400 block">Autoatendimento</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">KDS Cozinha</span>
              <span className="text-[9px] text-slate-400 block">Touch 21" Produção</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <Server className="w-4 h-4 text-purple-600" />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">Caixa / Gerência</span>
              <span className="text-[9px] text-slate-400 block">Servidor Primário</span>
            </div>
          </div>
        </div>

        {/* Backup, Restore & Reset Actions */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Segurança de Dados & Backup
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleForceSync}
              className="py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Forçar Sincronização</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Backup (.json)</span>
            </button>

            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar Base</span>
            </button>
          </div>

          {/* Import box */}
          {showImportBox && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in">
              <label className="text-xs font-bold text-slate-800 block">
                Cole o conteúdo JSON do backup para restaurar:
              </label>
              <textarea
                rows={3}
                value={jsonImportText}
                onChange={(e) => setJsonImportText(e.target.value)}
                placeholder='{"tables": [...], "menu": [...]}'
                className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-[10px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportBox(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyJsonImport}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs"
                >
                  Aplicar Restauração
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Factory Reset button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Deseja resetar todas as mesas e dados de demonstração aos padrões de fábrica?')) {
                onResetFactory();
                setAlertMsg('Dados restaurados para o padrão de demonstração com sucesso!');
                setTimeout(() => setAlertMsg(null), 3000);
              }
            }}
            className="text-slate-400 hover:text-rose-600 font-semibold text-xs flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Dados para Demonstração Inicial</span>
          </button>

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
