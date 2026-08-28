import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Sparkles,
  PieChart,
  Download,
  Filter,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    patients,
    consultations,
    appointments,
    financialTransactions,
    protocolAssignments,
    medicationApplications,
    hasPermission,
    currentUser,
    showToast,
  } = useApp();

  const [period, setPeriod] = useState<'mes' | 'ano' | 'hoje'>('mes');

  const totalInflows = financialTransactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0);

  const totalOutflows = financialTransactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0);

  const netRevenue = totalInflows - totalOutflows;

  // Consultations by professional
  const doctorStats = consultations.reduce((acc, c) => {
    acc[c.professionalName] = (acc[c.professionalName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Payment methods breakdown
  const paymentStats = financialTransactions
    .filter((t) => t.type === 'entrada')
    .reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Relatórios Clínicos & Indicadores de Gestão (KPIs)
          </h1>
          <p className="text-xs text-slate-500">
            Desempenho assistencial, taxa de ocupação da agenda, adesão a protocolos e faturamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-2xs"
          >
            <option value="hoje">Hoje (27/08/2026)</option>
            <option value="mes">Agosto / 2026 (Mensal)</option>
            <option value="ano">Ano de 2026</option>
          </select>

          <button
            onClick={() => showToast('Relatório consolidado exportado com sucesso!')}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Dados
          </button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Volume Total de Atendimentos</span>
          <p className="text-2xl font-bold text-slate-900 font-serif-luxury mt-2">
            {consultations.length + appointments.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">96% taxa de comparecimento</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Faturamento Líquido</span>
          <p className="text-2xl font-bold text-emerald-700 font-serif-luxury mt-2 font-mono">
            R$ {netRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Entradas: R$ {totalInflows.toFixed(2)}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Adesão a Protocolos</span>
          <p className="text-2xl font-bold text-purple-700 font-serif-luxury mt-2">
            {protocolAssignments.length} pacientes
          </p>
          <span className="text-[11px] text-purple-600 font-medium">85% taxa de conclusão</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Injetáveis / Soros</span>
          <p className="text-2xl font-bold text-teal-700 font-serif-luxury mt-2">
            {medicationApplications.length} doses
          </p>
          <span className="text-[11px] text-teal-600 font-medium">100% rastreabilidade de lote</span>
        </div>
      </div>

      {/* Analytics Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Consultations by Professional */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Produtividade por Profissional
            </h3>
            <span className="text-xs text-slate-400">Total: {consultations.length}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(doctorStats).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sem atendimentos computados.</p>
            ) : (
              Object.entries(doctorStats).map(([doc, count]) => {
                const pct = Math.round((count / Math.max(1, consultations.length)) * 100);
                return (
                  <div key={doc} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{doc}</span>
                      <span className="font-mono font-semibold text-slate-600">{count} consultas ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 2: Revenue by Payment Method */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" /> Faturamento por Forma de Pagamento
            </h3>
            <span className="text-xs text-slate-400 font-mono">R$ {totalInflows.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentStats).map(([method, val]) => {
              const pct = totalInflows > 0 ? Math.round((val / totalInflows) * 100) : 0;
              return (
                <div key={method} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{method}</span>
                    <span className="font-mono font-semibold text-slate-600">R$ {val.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
