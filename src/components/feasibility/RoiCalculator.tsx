import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Building,
  CreditCard
} from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  // Configurable Parameters for Softham & Kiosk Client
  const [numberOfKiosks, setNumberOfKiosks] = useState<number>(1);
  const [tablesPerKiosk, setTablesPerKiosk] = useState<number>(25);
  const [waitersPerKiosk, setWaitersPerKiosk] = useState<number>(4);
  const [monthlySaaSFee, setMonthlySaaSFee] = useState<number>(490);
  const [setupFeePerKiosk, setSetupFeePerKiosk] = useState<number>(2500);
  const [avgTicketPerTable, setAvgTicketPerTable] = useState<number>(180);
  const [dailyTablesServed, setDailyTablesServed] = useState<number>(45);

  // Estimates for Dev Cost (Softham)
  const devCostEstimate = 32000; // Custo estimado para construir o MVP (2 devs por 8 semanas)

  // Calculations
  const monthlyRevenuePerKiosk = dailyTablesServed * avgTicketPerTable * 30;
  const lostRevenueFromTableErrorsWithoutSystem = monthlyRevenuePerKiosk * 0.04; // 4% perdas por comandas de papel perdidas / erros de rateio
  const annualLossSaved = lostRevenueFromTableErrorsWithoutSystem * 12;

  const softhamYearlyRevenueFromClient = (numberOfKiosks * monthlySaaSFee * 12) + (numberOfKiosks * setupFeePerKiosk);
  const paybackMonthsForSoftham = (devCostEstimate / (monthlySaaSFee * Math.max(1, numberOfKiosks))).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-900">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Simulador Comercial & Calculadora de Viabilidade Financeira (Softham)
            </h2>
            <p className="text-xs text-slate-500">
              Projeção de custos de desenvolvimento, modelo de cobrança SaaS e retorno financeiro para o quiosque cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUTS COLUMN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4" /> Parâmetros da Operação
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Número de Quiosques / Unidades
              </label>
              <input
                type="number"
                min="1"
                value={numberOfKiosks}
                onChange={(e) => setNumberOfKiosks(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Mesas e Guarda-sóis por Quiosque
              </label>
              <input
                type="number"
                min="5"
                value={tablesPerKiosk}
                onChange={(e) => setTablesPerKiosk(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Garçons / Terminais de Areia
              </label>
              <input
                type="number"
                min="1"
                value={waitersPerKiosk}
                onChange={(e) => setWaitersPerKiosk(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Mensalidade SaaS Sugerida (R$/mês por quiosque)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={monthlySaaSFee}
                onChange={(e) => setMonthlySaaSFee(Math.max(100, parseFloat(e.target.value) || 100))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Taxa de Setup / Implantação e Treinamento (R$)
              </label>
              <input
                type="number"
                min="0"
                step="200"
                value={setupFeePerKiosk}
                onChange={(e) => setSetupFeePerKiosk(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-700 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL PROJECTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Projeção para o Quiosque Cliente */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Impacto no Faturamento do Quiosque Cliente
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                ROI do Cliente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Faturamento Mensal Estimado</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  R$ {monthlyRevenuePerKiosk.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Perdas Evitadas c/ Papel</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">
                  + R$ {lostRevenueFromTableErrorsWithoutSystem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Economia Anual do Quiosque</span>
                <p className="text-base font-black text-amber-600 mt-0.5">
                  R$ {annualLossSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /ano
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              💡 <strong>Argumento de Venda para a Softham:</strong> Em média, quiosques perdem entre 3% e 6% do faturamento em dias de praia cheia com comandas perdidas no mar, pedidos entregues na mesa errada após trocas e erros no cálculo de divisão de conta. O sistema se paga em <strong>menos de 15 dias de operação</strong> apenas evitando essas perdas!
            </p>
          </div>

          {/* Card: Projeção de Receita para a Softham */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-sky-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Retorno Financeiro para a Softham
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Receita Anual Recorrente (ARR)</span>
                <p className="text-base font-black text-sky-700 mt-0.5">
                  R$ {(numberOfKiosks * monthlySaaSFee * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Receita de Setup Inicial</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  R$ {(numberOfKiosks * setupFeePerKiosk).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Faturamento Ano 1 (Softham)</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">
                  R$ {softhamYearlyRevenueFromClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Potencial de expansão para outros quiosques da orla:
              </span>
              <span className="text-emerald-700 font-bold">
                Produto 100% replicável no formato SaaS (White-label)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
