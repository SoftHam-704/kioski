import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  Users, 
  WifiOff, 
  Cpu, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Download, 
  Copy, 
  Printer, 
  Layers,
  Sparkles,
  ChevronRight,
  Sun,
  Flame,
  Zap,
  HardDrive
} from 'lucide-react';

export const FeasibilityStudy: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('todos');

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(STUDY_MARKDOWN_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-100">
      {/* Executive Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                Documento de Engenharia & Negócios
              </span>
              <span className="text-xs text-slate-400">Softham Software Solutions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Estudo de Viabilidade & Especificação de Requisitos: Quiosque de Praia
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Levantamento completo para sistema Mobile (Areia) e Web (Retaguarda/KDS), com ênfase em <strong>Troca Dinâmica de Mesas</strong> e <strong>Rateio Inteligente entre Clientes</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyMarkdown}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              {copied ? 'Copiado em Markdown!' : 'Copiar Markdown'}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Quick Highlights Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Viabilidade Geral</span>
            <p className="text-base font-extrabold text-emerald-400 mt-0.5">Altamente Viável (94%)</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prazo MVP Estimado</span>
            <p className="text-base font-extrabold text-amber-400 mt-0.5">6 a 8 Semanas</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Complexidade Chave</span>
            <p className="text-base font-extrabold text-cyan-400 mt-0.5">Offline-first & Rateio</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hardware Alvo</span>
            <p className="text-base font-extrabold text-purple-400 mt-0.5">Smart POS Android</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONTEXTO E DORES DA PRAIA */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              1. Diagnóstico do Nicho & Dores Específicas de Quiosques de Praia
            </h2>
            <p className="text-xs text-slate-400">
              O que torna um restaurante/quiosque de praia drasticamente diferente de um restaurante tradicional fechado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ArrowRightLeft className="w-4 h-4" />
              <span>1.1. Mobilidade Constante de Mesas e Guarda-sóis</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Na praia, os clientes <strong>mudam de lugar frequentemente</strong> por fatores naturais incontroláveis: subida da maré, virada da sombra do sol, vento excessivo na beira da água ou junção com amigos que chegaram depois. Se o sistema não permitir troca rápida e fusão sem travar a comanda, o garçom abandona o app e volta para o papel.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Users className="w-4 h-4" />
              <span>1.2. Rateio Caótico em Grupos Grandes</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Grupos na praia consomem por 4 a 6 horas seguidas. No momento de pagar, cada pessoa quer pagar o seu consumo exato (quem bebeu álcool vs quem só tomou água/coco) e dividir as porções de frutos do mar. Cada um quer pagar com um método diferente (Pix, múltiplos cartões, dinheiro).
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <WifiOff className="w-4 h-4" />
              <span>1.3. Instabilidade Severa de 4G e Wi-Fi na Areia</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              A faixa de areia costuma ter "zonas de sombra" de sinal de celular ou congestionamento de rede em dias de sol e feriados. O app móvel <strong>DEVE ser Offline-First</strong>: gravar tudo no banco local do dispositivo (SQLite/IndexedDB) e sincronizar em background quando o sinal voltar.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <Zap className="w-4 h-4" />
              <span>1.4. Reflexo Solar, Areia e Maresia</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Telas comuns ficam ilegíveis sob luz solar direta forte (necessário <strong>Modo Sol de Alto Contraste</strong>). Além disso, operar com smartphone comum + maquininha separada faz o garçom ter 2 aparelhos na mão na areia. A melhor prática é rodar o app <strong>direto em maquininhas Smart POS Android</strong> (Stone, PagSeguro, Cielo LIO).
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: ESPECIFICAÇÃO DETALHADA DAS DUAS DORES CENTRAIS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              2. Regras de Negócio Críticas: Troca de Mesa & Rateio
            </h2>
            <p className="text-xs text-slate-400">
              Como a Softham deve implementar os dois pilares mais solicitados pelo cliente.
            </p>
          </div>
        </div>

        {/* 2.1 TROCA DE MESAS */}
        <div className="p-5 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Módulo A: Troca, Transferência e Fusão de Mesas
          </h3>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              O sistema deve oferecer <strong>3 fluxos distintos</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2">
              <li>
                <strong>Troca Total de Ponto (Ex: G-01 ➔ M-02 Deck):</strong> Move 100% dos pedidos, clientes e histórico para uma mesa livre. A mesa de origem é liberada automaticamente e o KDS recebe uma notificação visual (com tag sonora) para o garçom não entregar pratos no local antigo.
              </li>
              <li>
                <strong>Fusão de Grupos (Junção de Mesas):</strong> Quando a mesa G-05 se une à G-06, as comandas se unificam na mesa de destino, mas o sistema preserva os nomes dos clientes originais para que o rateio no final continue individualizado.
              </li>
              <li>
                <strong>Transferência Parcial de Itens/Pessoas:</strong> Permite selecionar itens específicos ou um cliente específico (ex: "Beatriz vai para a mesa da amiga") e migrar apenas a sua parte do consumo para uma nova comanda sem cancelar a mesa atual.
              </li>
            </ol>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-amber-300">
              🔒 <strong>Auditoria Obrigatória:</strong> Cada troca registra timestamp, garçom responsável e motivo (ex: maré, sol, vento, junção) para impedir que itens sejam "esquecidos" ou extraviados.
            </div>
          </div>
        </div>

        {/* 2.2 RATEIO INTELIGENTE */}
        <div className="p-5 bg-slate-950/90 border border-emerald-500/30 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Módulo B: Rateio Flexível & Baixa de Múltiplos Pagamentos
          </h3>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              O sistema deve suportar <strong>3 modos de fechamento</strong> na mesma mesa:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2">
              <li>
                <strong>Por Consumo Individual (Quem bebeu o que):</strong> Itens associados ao cliente (ex: "Carlos: 2 caipirinhas") são cobrados dele + itens compartilhados (ex: "Porção de Camarão R$ 115") são rateados igualmente entre os pagantes ativos.
              </li>
              <li>
                <strong>Divisão Igualitária (Rachadinha):</strong> Divide o total bruto + taxa de serviço por N cotas escolhidas na tela (ex: 4 pessoas = R$ X cada).
              </li>
              <li>
                <strong>Pagamento Parcial / Valor Avulso:</strong> Um cliente pode pagar R$ 50 no Pix agora, outro R$ 100 no cartão e o sistema mantém o saldo restante atualizado em tempo real até zerar a comanda.
              </li>
            </ol>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-emerald-300">
              ⚡ <strong>Geração de Pix Dinâmico na Tela:</strong> O garçom pode exibir o QR Code Pix com o valor exato da cota daquele cliente na tela da maquininha POS ou celular, confirmando o recebimento em segundos.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARQUITETURA TÉCNICA RECOMENDADA */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              3. Arquitetura Técnica & Hardware Recomendados
            </h2>
            <p className="text-xs text-slate-400">
              Stack de tecnologia moderna, estável e com custo de infraestrutura acessível.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              📱 Frontend Areia (Mobile)
            </h4>
            <p className="text-slate-300">
              <strong>React Native / Expo</strong> ou <strong>PWA Offline-First</strong>.
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Banco local: WatermelonDB / SQLite</li>
              <li>Sincronização via fila local</li>
              <li>Compilação para Smart POS Android (Stone/Cielo)</li>
              <li>Interface de alto contraste com botões grandes</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              💻 Web Retaguarda & KDS
            </h4>
            <p className="text-slate-300">
              <strong>React / Vite + Tailwind CSS</strong>
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>KDS com WebSockets (Socket.io) / SSE</li>
              <li>Controle de estoque de frutos do mar</li>
              <li>Gestão de comissões e caixas</li>
              <li>Relatórios analíticos de consumo</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              ⚙️ Backend & Nuvem
            </h4>
            <p className="text-slate-300">
              <strong>Node.js (NestJS/Express) + PostgreSQL</strong>
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>PostgreSQL (Drizzle ORM ou Prisma)</li>
              <li>Redis para filas de mensagens e KDS</li>
              <li>Módulo Fiscal (Emissão de NFC-e / SAT)</li>
              <li>Integração com Gateway Pix (OpenPix/MercadoPago/Stone)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4: MATRIZ DE REQUISITOS FUNCIONAIS & NÃO-FUNCIONAIS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              4. Matriz de Requisitos para o Contrato / Escopo do Projeto
            </h2>
            <p className="text-xs text-slate-400">
              Checklist completo de entrega do sistema.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              Requisitos Funcionais Principais (RF)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF01:</strong> Mapa de mesas/guarda-sóis interativo por setores da praia.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF02:</strong> Lançamento ágil com atribuição de item por pessoa na mesa.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF03:</strong> Troca total de mesa com migração automática de pedidos.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF04:</strong> Fusão de duas ou mais mesas em uma única conta.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF05:</strong> Transferência parcial seletiva de itens ou clientes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF06:</strong> Rateio por consumo individual + divisão de porções.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF07:</strong> Rateio igualitário automático (rachadinha em N cotas).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF08:</strong> Pagamentos múltiplos em tempo real (Pix, Cartão, Dinheiro).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF09:</strong> KDS com divisão automática de Bar vs Cozinha vs Apoio de Praia.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF10:</strong> Controle de consumação mínima e aluguel de cadeiras de praia.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF11:</strong> Histórico de auditoria de trocas e cancelamentos.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RF12:</strong> Envio de comprovante de pagamento via WhatsApp/SMS.</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              Requisitos Não-Funcionais Críticos (RNF)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>RNF01:</strong> Arquitetura Offline-First (continua operando sem 4G/Wi-Fi).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>RNF02:</strong> Modo de Alto Contraste para legibilidade sob sol forte de praia.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>RNF03:</strong> Tempo de resposta de lançamento de pedido inferior a 1,5 segundos.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>RNF04:</strong> Sincronização automática e resolução idempotente de conflitos.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CRONOGRAMA DE MVP EM 4 SPRINTS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              5. Cronograma Recomendado de Desenvolvimento (MVP em 8 Semanas)
            </h2>
            <p className="text-xs text-slate-400">
              Planejamento ágil para a Softham entregar o produto antes da alta temporada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
              Sprint 1 (Sem 1-2)
            </span>
            <h4 className="font-bold text-white">Fundação & Banco Offline</h4>
            <p className="text-slate-400 text-[11px]">
              Setup do banco local, autenticação, cadastro de setores e mapa visual de mesas/guarda-sóis.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
              Sprint 2 (Sem 3-4)
            </span>
            <h4 className="font-bold text-white">Troca de Mesas & KDS</h4>
            <p className="text-slate-400 text-[11px]">
              Fluxos de troca total, fusão e transferência parcial. Telas de KDS de Bar e Cozinha com WebSockets.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
              Sprint 3 (Sem 5-6)
            </span>
            <h4 className="font-bold text-white">Rateio & Pagamentos</h4>
            <p className="text-slate-400 text-[11px]">
              Módulo de divisão por pessoa, integração de Pix dinâmico e integração com Smart POS Android.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
              Sprint 4 (Sem 7-8)
            </span>
            <h4 className="font-bold text-white">Retaguarda & Testes na Praia</h4>
            <p className="text-slate-400 text-[11px]">
              Fechamento de caixa, relatórios fiscais (NFC-e), testes de estresse sob sol e sinal fraco na areia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const STUDY_MARKDOWN_TEXT = `# ESTUDO DE VIABILIDADE E ESPECIFICAÇÃO TÉCNICA: SISTEMA PARA QUIOSQUES E RESTAURANTES DE PRAIA (BEACH POS & RETAGUARDA)
**Autor:** Softham Software Solutions
**Status:** Aprovado para Orçamento & Desenvolvimento
**Público-Alvo:** Quiosques de Praia, Restaurantes Beira-Mar, Barracas de Praia e Beach Clubs

---

## 1. DIAGNÓSTICO DO NICHO & DESAFIOS DA OPERAÇÃO DE PRAIA
Operações de praia possuem peculiaridades físicas e comportamentais distintas de restaurantes tradicionais:
1. **Mobilidade Contínua de Clientes:** Mudança frequente de guarda-sóis e mesas em virtude da subida da maré, posição do sol/sombra ou encontro com outros grupos.
2. **Rateio Complexo de Longa Permanência:** Grupos grandes passam horas consumindo e exigem divisão por consumo estrito (quem bebeu álcool vs quem não bebeu) + divisão de porções compartilhadas.
3. **Instabilidade Severa de 4G/Wi-Fi:** A faixa de areia tem frequentes quedas de sinal. O sistema DEVE ser Offline-First.
4. **Condições Ambientais Extremas:** Reflexo da luz solar direta exige UI de Alto Contraste ("Modo Sol").

---

## 2. ESPECIFICAÇÃO DOS MÓDULOS CENTRAIS

### MÓDULO A: TROCA DINÂMICA DE MESAS & FUSÃO
1. **Troca Completa:** Migra 100% dos pedidos e clientes para uma nova mesa livre, liberando o ponto anterior e notificando o KDS da cozinha.
2. **Fusão de Grupos:** Mescla duas comandas ativas mantendo o histórico de quem pediu cada item para permitir rateio individual posterior.
3. **Transferência Parcial:** Permite mover apenas itens selecionados ou clientes específicos para outro guarda-sol.
4. **Trilha de Auditoria:** Registro obrigatório de quem transferiu, data/hora e motivo (ex: maré, sol, vento).

### MÓDULO B: RATEIO INTELIGENTE DE CONTA
1. **Por Consumo Individual:** Atribuição de itens no momento do pedido + rateio automático de porções compartilhadas entre todos os clientes da mesa.
2. **Divisão Igualitária (Rachadinha):** Divisão matemática por N pessoas com ajuste automático de centavos.
3. **Múltiplos Pagamentos Parciais:** Baixa em tempo real com QR Code Pix Dinâmico, Cartão de Crédito/Débito em Smart POS Android e Dinheiro.

---

## 3. ARQUITETURA TECNOLÓGICA RECOMENDADA
- **Mobile Areia:** React Native / PWA Offline-First com SQLite/WatermelonDB compilado para Smart POS Android (Stone / Cielo LIO).
- **Web Retaguarda / KDS:** React / Vite + Tailwind CSS + WebSockets para comunicação em tempo real com bar e cozinha.
- **Backend:** Node.js (NestJS) + PostgreSQL + Redis + Módulo Fiscal NFC-e.

---

## 4. CRONOGRAMA DE IMPLANTAÇÃO MVP (8 SEMANAS)
- **Semanas 1-2:** Arquitetura Base & Banco Local Offline
- **Semanas 3-4:** Módulo de Troca de Mesas & KDS Bar/Cozinha
- **Semanas 5-6:** Rateio Inteligente & Pagamentos Pix/POS
- **Semanas 7-8:** Retaguarda, Emissão Fiscal e Testes em Campo na Praia
`;
