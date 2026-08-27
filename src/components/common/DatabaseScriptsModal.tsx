import React, { useState } from 'react';
import {
  Database,
  Copy,
  Download,
  Check,
  X,
  Server,
  Code2,
  Layers,
  Smartphone,
  Key,
  Sparkles,
  TableProperties,
  ArrowRight,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import {
  POSTGRESQL_DDL,
  MYSQL_DDL,
  SQLITE_OFFLINE_DDL,
  PRISMA_SCHEMA,
  SEED_DATA_SQL
} from '../../data/dbScripts';

interface DatabaseScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'postgres' | 'mysql' | 'sqlite' | 'prisma' | 'seed' | 'diagram';

export const DatabaseScriptsModal: React.FC<DatabaseScriptsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('postgres');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'postgres':
        return POSTGRESQL_DDL;
      case 'mysql':
        return MYSQL_DDL;
      case 'sqlite':
        return SQLITE_OFFLINE_DDL;
      case 'prisma':
        return PRISMA_SCHEMA;
      case 'seed':
        return SEED_DATA_SQL;
      default:
        return POSTGRESQL_DDL;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const ext = activeTab === 'prisma' ? 'prisma' : 'sql';
    const filename = `softham_opendesk_${activeTab}.${ext}`;
    const blob = new Blob([getActiveContent()], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tablesSummary = [
    { name: 'tenants', desc: 'Multi-inquilino com CNPJ, taxa padrão e segmento de atuação', pks: 'id', fks: '-' },
    { name: 'users', desc: 'Garçons, gerentes, cozinheiros, bar e caixas com PIN rápido', pks: 'id', fks: 'tenant_id' },
    { name: 'sectors', desc: 'Setores físicos (Areia/Beira-Mar, Deck, Lounge VIP)', pks: 'id', fks: 'tenant_id' },
    { name: 'tables_spots', desc: 'Mesas, guarda-sóis e bangalôs com consumação mínima e taxa por mesa', pks: 'id', fks: 'tenant_id, sector_id' },
    { name: 'menu_items', desc: 'Produtos, ficha de custo, estação KDS (bar/cozinha/apoio) e preparo', pks: 'id', fks: 'tenant_id' },
    { name: 'orders_bills', desc: 'Comandas de mesa com suporte offline-first sync (client_uuid, device_id)', pks: 'id', fks: 'tenant_id, table_id' },
    { name: 'bill_customers', desc: 'Clientes individuais da mesa para rateio colorido e divisão de conta', pks: 'id', fks: 'tenant_id, order_id' },
    { name: 'order_items', desc: 'Itens pedidos vinculados ao cliente (customer_id) e status no KDS', pks: 'id', fks: 'tenant_id, order_id, item_id, customer_id' },
    { name: 'table_transfer_logs', desc: 'Auditoria antifraude de trocas de mesa, fusões e transferências', pks: 'id', fks: 'tenant_id' },
    { name: 'cash_shifts', desc: 'Fechamento de turno de caixa, DRE diário e fundo de troco', pks: 'id', fks: 'tenant_id, operator_user_id' },
    { name: 'cash_transactions', desc: 'Pagamentos (pix, cartao_credito, cartao_debito, dinheiro) e sangrias', pks: 'id', fks: 'tenant_id, cash_shift_id, order_id' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden text-slate-100">

        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Scripts de Banco de Dados & Arquitetura SQL
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  11 Tabelas • DDL Pronto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scripts prontos para execução em PostgreSQL, MySQL, SQLite (Android POS) e Prisma ORM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Engine Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('postgres')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'postgres'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-sky-300" />
            <span>PostgreSQL 14+ (Nuvem)</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'mysql'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>MySQL 8.0+</span>
          </button>

          <button
            onClick={() => setActiveTab('sqlite')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'sqlite'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite 3 (Smart POS Offline)</span>
          </button>

          <button
            onClick={() => setActiveTab('prisma')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'prisma'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Prisma Schema (`schema.prisma`)</span>
          </button>

          <button
            onClick={() => setActiveTab('seed')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'seed'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Carga Inicial (Seed Data)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'diagram'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dicionário & DER (11 Tabelas)</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300">
          {activeTab === 'diagram' ? (
            <div className="space-y-6 font-sans">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Arquitetura de Dados & Integridade Referencial
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O modelo foi projetado com isolamento <strong>Multi-Tenant</strong> através de <code>tenant_id</code> em todas as entidades. Possui integridade referencial com <code>ON DELETE CASCADE</code> para comandas e histórico detalhado para <strong>auditoria antifraude de trocas de mesa</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tablesSummary.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-400 text-xs">
                        📦 {t.name}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                        PK: {t.pks}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {t.desc}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-1 border-t border-slate-800">
                      <Key className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>FKs: {t.fks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap select-all leading-relaxed font-mono text-[11.5px] text-slate-200 selection:bg-sky-600 selection:text-white">
              {getActiveContent()}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DDL Schema v1.2.0 • Índices de Alta Concorrência Criados</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
