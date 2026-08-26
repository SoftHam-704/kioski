import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  HelpCircle,
  Sun,
  Wifi,
  WifiOff,
  Layers,
  Store,
  Database
} from 'lucide-react';
import { ActiveTab, EstablishmentProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  sunlightMode: boolean;
  setSunlightMode: (val: boolean) => void;
  activeProfile: EstablishmentProfile;
  profiles: EstablishmentProfile[];
  onSelectProfile: (profile: EstablishmentProfile) => void;
  onOpenCloudSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOffline,
  setIsOffline,
  sunlightMode,
  setSunlightMode,
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenCloudSync,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Generic Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
                  SOFTHAM <span className="font-extrabold text-sky-600">OPENDESK</span>
                </h1>
                <span className="hidden lg:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                  PDV & Mesas Multi-Ambiente
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[220px] sm:max-w-xs">
                {activeProfile.name} • {activeProfile.tagline}
              </p>
            </div>
          </div>

          {/* Establishment Profile Switcher (Generic Multi-segment) */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <Store className="w-3.5 h-3.5 text-sky-600 ml-1 shrink-0" />
            <span className="font-bold text-slate-600 text-[11px]">Ambiente:</span>
            <select
              value={activeProfile.id}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type === 'quiosque_praia' ? 'Quiosque/Praia' : p.type === 'restaurante_bar' ? 'Restaurante/Bar' : p.type === 'rooftop_lounge' ? 'Rooftop/VIP' : 'Food Park'})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('simulador_mobile')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulador_mobile'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Garçom</span>
            </button>

            <button
              onClick={() => setActiveTab('tablet_cardapio')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tablet_cardapio'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Cardápio Tablet</span>
            </button>

            <button
              onClick={() => setActiveTab('retaguarda_kds')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'retaguarda_kds'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Retaguarda & KDS</span>
            </button>

            <button
              onClick={() => setActiveTab('estudo_viabilidade')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'estudo_viabilidade'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Estudo & Escala</span>
            </button>

            <button
              onClick={() => setActiveTab('calculadora_roi')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calculadora_roi'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculadora & ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('consultor_ai')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'consultor_ai'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-white/80'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Consultor IA</span>
            </button>
          </nav>

          {/* Environmental Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                title="Softham Cloud Realtime Sync & Topologia Multi-Dispositivo"
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">Cloud Sync</span>
              </button>
            )}

            <button
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? 'Modo Offline Ativo (Testando resiliência sem rede)' : 'Conectado à Internet (Online)'}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                isOffline
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOffline ? 'Simular Offline' : 'Online'}</span>
            </button>

            <button
              onClick={() => setSunlightMode(!sunlightMode)}
              title="Modo Alto Contraste para ambientes abertos e luz solar"
              className={`p-1.5 rounded-lg border transition-all ${
                sunlightMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 space-x-2 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('simulador_mobile')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'simulador_mobile' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📱 App Garçom
          </button>
          <button
            onClick={() => setActiveTab('tablet_cardapio')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'tablet_cardapio' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📟 Tablet Mesa
          </button>
          <button
            onClick={() => setActiveTab('retaguarda_kds')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'retaguarda_kds' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💻 Retaguarda
          </button>
          <button
            onClick={() => setActiveTab('estudo_viabilidade')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'estudo_viabilidade' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 Estudo & Escala
          </button>
          <button
            onClick={() => setActiveTab('calculadora_roi')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'calculadora_roi' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 ROI
          </button>
          <button
            onClick={() => setActiveTab('consultor_ai')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'consultor_ai' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💬 Dúvidas
          </button>
        </div>
      </div>
    </header>
  );
};
