import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Tablet, 
  Smartphone, 
  LayoutDashboard, 
  Receipt, 
  FileSpreadsheet, 
  Store,
  Play,
  RotateCcw,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ActiveTab, EstablishmentProfile } from '../../types';

interface InteractiveDemoTourProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProfile: EstablishmentProfile;
  onSelectProfile: (profile: EstablishmentProfile) => void;
  profiles: EstablishmentProfile[];
}

interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  tabTarget: ActiveTab;
  badge: string;
  icon: any;
  bullets: string[];
  clientPitch: string;
  actionText: string;
}

export const InteractiveDemoTour: React.FC<InteractiveDemoTourProps> = ({
  activeTab,
  setActiveTab,
  activeProfile,
  onSelectProfile,
  profiles,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: TourStep[] = [
    {
      id: 1,
      title: 'Flexibilidade Multi-Ambiente & Nichos',
      subtitle: 'Adaptação imediata ao perfil do seu estabelecimento',
      tabTarget: 'simulador_mobile',
      badge: 'Passo 1/6 • Configuração',
      icon: Store,
      bullets: [
        'Troca dinâmica entre Quiosques de Praia, Restaurantes, Bares, Rooftops e Food Parks.',
        'Setores e regras de consumo mínimo configurados sob medida.',
        'Identidade visual e taxas de serviço ajustáveis por unidade.'
      ],
      clientPitch: '“O sistema não engessa o seu negócio: ele se molda ao seu layout de mesas, setores VIP e fluxo de atendimento.”',
      actionText: 'Ir para o App do Garçom',
    },
    {
      id: 2,
      title: 'Autoatendimento no Tablet da Mesa',
      subtitle: 'Mais vendas por impulso e menos filas de espera',
      tabTarget: 'tablet_cardapio',
      badge: 'Passo 2/6 • Tablet na Mesa',
      icon: Tablet,
      bullets: [
        'Cliente escolhe fotos em alta resolução, personaliza pedidos e adiciona observações.',
        'Botão direto de "Chamar Garçom" ou "Pedir a Conta" sem acenar ou esperar.',
        'Aumento comprovado de até 28% no ticket médio em bebidas e sobremesas.'
      ],
      clientPitch: '“Seu cliente pede a segunda cerveja ou petisco no segundo em que desejar, sem depender do garçom passar pela mesa.”',
      actionText: 'Experimentar Cardápio no Tablet',
    },
    {
      id: 3,
      title: 'Agilidade do Garçom & Operação Móvel',
      subtitle: 'Lançamento em segundos, offline-first e alta visibilidade',
      tabTarget: 'simulador_mobile',
      badge: 'Passo 3/6 • App do Garçom',
      icon: Smartphone,
      bullets: [
        'Modo Alto Contraste para leitura nítida sob sol forte ou baixa luz.',
        'Troca de mesa e fusão de comandas com auditoria obrigatória de motivo.',
        'Funciona mesmo se o Wi-Fi oscilar temporariamente (modo offline seguro).'
      ],
      clientPitch: '“O garçom atende mais mesas em menos tempo, sem carregar blocos de papel e sem esquecer pedidos.”',
      actionText: 'Ver Mapa de Mesas do Garçom',
    },
    {
      id: 4,
      title: 'KDS Cozinha & Bar Sem Papel',
      subtitle: 'Zero atrasos e separação inteligente por estações',
      tabTarget: 'retaguarda_kds',
      badge: 'Passo 4/6 • Retaguarda & KDS',
      icon: LayoutDashboard,
      bullets: [
        'Bebidas caem instantaneamente no Bar; pratos quentes vão para a Cozinha.',
        'Alertas visuais de tempo decorrido com cronômetro em tempo real.',
        'Fim das impressoras travadas e comandas perdidas no balcão.'
      ],
      clientPitch: '“O cozinheiro e o bartender sabem exatamente o que produzir na ordem certa, sem gritaria ou confusão.”',
      actionText: 'Acessar KDS & Backoffice',
    },
    {
      id: 5,
      title: 'Rateio Inteligente & Cupom Térmico',
      subtitle: 'Fim do estresse na hora de dividir a conta',
      tabTarget: 'simulador_mobile',
      badge: 'Passo 5/6 • Fechamento de Conta',
      icon: Receipt,
      bullets: [
        'Divisão automática por consumo individual ou partes iguais.',
        'Cupom de pré-conta formatado em 80mm com QR Code Pix dinâmico.',
        'Recebimento fracionado com múltiplos cartões, Pix e dinheiro.'
      ],
      clientPitch: '“Grupos de 10 pessoas pagam em menos de 2 minutos, liberando a mesa muito mais rápido para o próximo cliente.”',
      actionText: 'Ver Modal de Rateio e Cupom',
    },
    {
      id: 6,
      title: 'Fechamento de Caixa, DRE & ROI',
      subtitle: 'Controle financeiro total e retorno garantido',
      tabTarget: 'calculadora_roi',
      badge: 'Passo 6/6 • Gestão & Rentabilidade',
      icon: FileSpreadsheet,
      bullets: [
        'Demonstrativo de entradas por Pix, Crédito, Débito e Dinheiro.',
        'Auditoria de sangrias e suprimentos de gaveta em tempo real.',
        'Calculadora de ROI provando payback entre 1,5 a 3 meses.'
      ],
      clientPitch: '“O sistema se paga rapidamente com o aumento de giros de mesa e a eliminação de perdas operacionais.”',
      actionText: 'Simular Retorno do Investimento',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    setActiveTab(steps[index].tabTarget);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      handleGoToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleGoToStep(currentStepIndex - 1);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-bounce">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              handleGoToStep(currentStepIndex);
            }}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/30 border border-sky-300/40 text-xs transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="font-extrabold tracking-wide uppercase">Roteiro de Demonstração</span>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-black">
              Passo {currentStepIndex + 1}/6
            </span>
          </button>
        </div>
      )}

      {/* Guided Tour Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-bottom-5">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/90 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col transition-all">
            {/* Tour Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-200 block">
                    {currentStep.badge}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black leading-tight">
                    Roteiro Comercial Guiado
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={isMinimized ? 'Expandir' : 'Minimizar'}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tour Body (If not minimized) */}
            {!isMinimized && (
              <div className="p-4 space-y-3.5">
                {/* Step Title & Subtitle */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2.5 bg-sky-50 rounded-2xl border border-sky-100 text-sky-600 shrink-0 mt-0.5">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {currentStep.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {currentStep.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bullets */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  {currentStep.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Pitch Quote */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 italic leading-relaxed">
                  <span className="font-bold not-italic block text-[10px] text-amber-700 uppercase tracking-wider mb-0.5">
                    💡 Argumento para o Cliente:
                  </span>
                  {currentStep.clientPitch}
                </div>

                {/* Action shortcut to jump to corresponding tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab(currentStep.tabTarget)}
                  className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{currentStep.actionText}</span>
                </button>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                      currentStepIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex gap-1">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGoToStep(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentStepIndex === idx
                            ? 'w-5 bg-sky-600'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Ir para passo ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStepIndex === steps.length - 1}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                      currentStepIndex === steps.length - 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'bg-sky-600 text-white hover:bg-sky-500 shadow-xs'
                    }`}
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
