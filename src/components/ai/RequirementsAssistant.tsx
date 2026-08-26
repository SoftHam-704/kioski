import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Lightbulb, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal,
  Zap
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  category: 'negocio' | 'tecnica' | 'juridica';
  answer: string;
}

const FAQ_DATABASE: FaqItem[] = [
  {
    id: 'f-1',
    question: 'Como resolver conflitos quando 2 garçons lançam pedidos offline na mesma mesa?',
    category: 'tecnica',
    answer: 'Utilize IDs únicos UUIDv4 para cada item de pedido e uma estratégia de Merge Idempotente no servidor. Ao sincronizar, o backend anexa os novos itens à comanda da mesa ordenados pelo timestamp de lançamento do dispositivo, sem sobrescrever o array anterior.',
  },
  {
    id: 'f-2',
    question: 'É melhor usar celular do garçom ou maquininha Smart POS Android (Stone/Cielo/Rede)?',
    category: 'tecnica',
    answer: 'Para quiosques de praia, o Smart POS Android (como Sunmi V2s, Gertec GPOS ou Stone Smart) é infinitamente superior. Ele unifica o lançamento do pedido, leitura de cartões, geração de Pix na tela e impressão térmica do comprovante em um único aparelho blindado contra areia e com alta autonomia de bateria.',
  },
  {
    id: 'f-3',
    question: 'Como lidar com o Código de Defesa do Consumidor sobre "Consumação Mínima" na praia?',
    category: 'juridica',
    answer: 'Cobrar consumação mínima pura é considerado prática abusiva (Art. 39, I do CDC). No entanto, o quiosque PODE cobrar legalmente pelo serviço de locação da estrutura (aluguel de guarda-sol, mesas e cadeiras) e conceder um DESCONTO promocional ou isenção na locação caso o cliente atinja determinado valor de consumo em alimentos e bebidas.',
  },
  {
    id: 'f-4',
    question: 'Como garantir que a cozinha saiba onde entregar o prato quando o cliente muda de mesa?',
    category: 'negocio',
    answer: 'Quando ocorre a Troca de Mesa no app do garçom, o KDS (painel da cozinha/bar) atualiza instantaneamente o crachá da mesa de destino (ex: pisca "G-01 ➔ M-02"). Se o prato já estiver pronto para entrega, o sistema emite um alerta sonoro para o cumim/garçom de areia redirecionar os passos.',
  },
  {
    id: 'f-5',
    question: 'Como calcular e exibir a taxa de serviço (10% a 13%) de forma transparente no rateio?',
    category: 'negocio',
    answer: 'O sistema deve calcular a taxa proporcional por cliente sobre o valor dos itens que ele consumiu mais a sua fatia das porções compartilhadas. O app deve permitir que o cliente opte por pagar ou não a taxa de serviço com 1 clique (já que por lei no Brasil é facultativa).',
  },
  {
    id: 'f-6',
    question: 'Qual a estratégia recomendada para emissão fiscal (NFC-e / SAT) na praia?',
    category: 'tecnica',
    answer: 'Emita a NFC-e no fechamento da comanda comunicando via API com a SEFAZ em contingência offline caso o sinal caia na hora, e envie a nota fiscal em PDF diretamente para o WhatsApp ou e-mail do cliente, dispensando bobinas de papel que voam com o vento da praia.',
  },
];

export const RequirementsAssistant: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'negocio' | 'tecnica' | 'juridica'>('todos');
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Olá! Sou o Assistente Especialista em Sistemas para Quiosques de Praia da Softham. Como posso te apoiar no levantamento de requisitos, arquitetura offline ou regras de rateio e troca de mesas?',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const filteredFaq = FAQ_DATABASE.filter(
    (f) => selectedCategory === 'todos' || f.category === selectedCategory
  );

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg = { sender: 'user' as const, text: questionText };
    setChatHistory((prev) => [...prev, userMsg]);
    setCustomQuestion('');
    setIsThinking(true);

    // Provide intelligent contextual answer
    setTimeout(() => {
      let botResponse = '';
      const lower = questionText.toLowerCase();

      if (lower.includes('troca') || lower.includes('mesa') || lower.includes('guarda-sol')) {
        botResponse = 'Para a troca de mesas na praia, a melhor arquitetura prevê 3 operações: 1) Troca Completa (move 100% da comanda e avisa KDS), 2) Fusão de Grupos (unifica mesas mantendo os nomes dos pagantes separados) e 3) Transferência Seletiva de itens. É fundamental gravar o log de auditoria com o motivo da troca para evitar desvios.';
      } else if (lower.includes('rateio') || lower.includes('dividir') || lower.includes('rachar') || lower.includes('pix')) {
        botResponse = 'O rateio deve ser híbrido: cada cliente tem seus itens próprios marcados no app (ex: Caipirinha de limão para a Renata) e os pratos compartilhados (ex: Camarão à milanesa) são divididos automaticamente pela quantidade de participantes. O garçom pode receber parciais com Pix Dinâmico na maquininha ou múltiplos cartões até zerar a conta.';
      } else if (lower.includes('offline') || lower.includes('sinal') || lower.includes('internet') || lower.includes('wifi') || lower.includes('4g')) {
        botResponse = 'A faixa de areia exige arquitetura Offline-First absoluta. No app mobile, utilize um banco local leve como SQLite / WatermelonDB. As requisições de pedidos são enfileiradas localmente com UUIDs e sincronizadas automaticamente via WebSockets/REST quando a conexão 4G/Wi-Fi oscilar de volta.';
      } else if (lower.includes('hardware') || lower.includes('maquininha') || lower.includes('equipamento') || lower.includes('impressora')) {
        botResponse = 'Recomendo padronizar a operação de praia em terminais Smart POS Android (ex: Sunmi V2s, Cielo LIO ou Stone Smart). Eles já possuem tela touch, leitor de cartão, câmera para QR Code e impressora térmica embutida, evitando que o garçom tenha que carregar celular + maquininha na areia.';
      } else {
        botResponse = `Com base na experiência em quiosques de praia, a Softham deve priorizar uma experiência ágil de 1 a 2 toques para o garçom, suporte a pagamentos fragmentados na areia e trilha de auditoria completa na retaguarda. Essa abordagem garante a aprovação do projeto e alta satisfação dos garçons e clientes.`;
      }

      setChatHistory((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-900">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Consultor de Requisitos & Regras de Negócio de Quiosques
            </h2>
            <p className="text-xs text-slate-500">
              Tire dúvidas técnicas, jurídicas e operacionais para fechar a proposta com segurança.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: FAQ Cards + Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ CARDS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Perguntas & Respostas Frequentes do Nicho
            </h3>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px]">
              <button
                onClick={() => setSelectedCategory('todos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedCategory === 'todos' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedCategory('negocio')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedCategory === 'negocio' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Negócio
              </button>
              <button
                onClick={() => setSelectedCategory('tecnica')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedCategory === 'tecnica' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Técnica
              </button>
              <button
                onClick={() => setSelectedCategory('juridica')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedCategory === 'juridica' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jurídica
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredFaq.map((faq) => (
              <div
                key={faq.id}
                onClick={() => handleAskQuestion(faq.question)}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm hover:border-sky-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {faq.question}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    faq.category === 'tecnica'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : faq.category === 'negocio'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {faq.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE AI ADVISOR CHAT */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[600px] shadow-sm">
          <div className="pb-3 mb-3 border-b border-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Chat Consultivo Softham AI
              </h3>
              <p className="text-[10px] text-slate-500">
                Simule perguntas do seu cliente ou esclareça dúvidas de engenharia de software
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                <span>Analisando regras de quiosque de praia...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(customQuestion);
            }}
            className="pt-3 border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Digite sua dúvida sobre o projeto de quiosque..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim()}
              className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl transition-all font-bold shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
