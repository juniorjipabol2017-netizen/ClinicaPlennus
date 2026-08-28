import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  HeartPulse,
  Syringe,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    patients,
    appointments,
    waitingQueue,
    consultations,
    medications,
    medicationApplications,
    protocolAssignments,
    financialTransactions,
    cashRegister,
    budgets,
    auditLogs,
    setActiveView,
    setSelectedPatientForPEP,
  } = useApp();

  const todayStr = '2026-08-27'; // Fixed applet date or current day
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const activeQueue = waitingQueue.filter((q) => q.status !== 'Finalizado' && q.status !== 'Cancelado');
  const lowStock = medications.filter((m) => m.stockQuantity <= m.minStock);
  const activeProtocols = protocolAssignments.filter((p) => p.status === 'Em andamento');

  const todayInflows = financialTransactions
    .filter((t) => t.date === todayStr && t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0);

  const todayOutflows = financialTransactions
    .filter((t) => t.date === todayStr && t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="space-y-8">
      {/* Top Hero Section with Geometric Balance Motif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left column: Typography & Action Buttons */}
        <div className="lg:w-7/12 space-y-5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-[#4F46E5] text-[10px] font-bold rounded-md uppercase tracking-widest border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full"></span>
            Centro Médico Integrado Plennus • Unidade Jardins
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Saúde integrada com precisão e <span className="text-[#4F46E5]">equilíbrio.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
            Olá, <strong className="text-slate-800">{currentUser.name}</strong>. Painel clínico unificado para o perfil{' '}
            <strong className="text-[#4F46E5] uppercase">{currentUser.role}</strong> no setor{' '}
            <strong className="text-slate-800">{currentUser.sector}</strong>. Governança LGPD e Segregação de Funções (SoD) ativas.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentUser.role === 'medico' && (
              <button
                onClick={() => setActiveView('consultorio')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Abrir Consultório
              </button>
            )}

            {currentUser.role === 'enfermagem' && (
              <button
                onClick={() => setActiveView('triagem')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <HeartPulse className="w-4 h-4" />
                Realizar Triagem
              </button>
            )}

            {currentUser.role === 'recepcao' && (
              <button
                onClick={() => setActiveView('fila')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Gerenciar Fila
              </button>
            )}

            {currentUser.role === 'financeiro' && (
              <button
                onClick={() => setActiveView('financeiro')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Ver Caixa Diário
              </button>
            )}

            <button
              onClick={() => setActiveView('agenda')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#38BDF8]" />
              Agenda Hoje ({todayAppointments.length})
            </button>

            <button
              onClick={() => setActiveView('pacientes')}
              className="px-5 py-3 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              Pacientes
            </button>
          </div>
        </div>

        {/* Right column: Geometric Balance visual composition */}
        <div className="lg:w-5/12 flex justify-center relative py-4">
          <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border border-slate-200 flex items-center justify-center relative shrink-0">
            {/* Concentric subtle rings */}
            <div className="absolute w-[220px] h-[220px] border border-slate-100 rounded-full"></div>
            <div className="absolute w-[160px] h-[160px] border border-indigo-100/60 rounded-full"></div>

            {/* Central geometric balance card */}
            <div className="w-48 h-48 bg-white shadow-xl rounded-3xl flex items-center justify-center z-10 overflow-hidden relative border border-slate-100">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#4F46E5]"></div>
              
              {/* Overlapping blend geometric circles */}
              <div className="relative w-24 h-24">
                <div className="absolute top-1 left-1 w-16 h-16 bg-[#4F46E5] rounded-full mix-blend-multiply opacity-90 shadow-inner"></div>
                <div className="absolute bottom-1 right-1 w-16 h-16 bg-[#38BDF8] rounded-full mix-blend-multiply opacity-90 shadow-inner"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-xs"></div>
                </div>
              </div>
            </div>

            {/* Ambient geometric blur accents */}
            <div className="absolute top-2 right-2 w-10 h-10 bg-[#38BDF8] rounded-full opacity-25 blur-lg"></div>
            <div className="absolute bottom-4 left-2 w-14 h-14 bg-[#4F46E5] rounded-full opacity-15 blur-lg"></div>
          </div>
        </div>
      </div>

      {/* 4-Column Metric Grid in Geometric Balance Style */}
      <section className="bg-white border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 shadow-2xs overflow-hidden">
        {/* Col 1 */}
        <div className="p-6 flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pacientes Ativos</div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {patients.filter((p) => p.status === 'ativo').length}
          </div>
          <div className="text-[13px] text-slate-500 mt-1">Prontuários e PEP digitalizados</div>
        </div>

        {/* Col 2 */}
        <div className="p-6 flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fila em Andamento</div>
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            {activeQueue.length}
            <span className="text-xs font-bold text-[#4F46E5]">~14 min</span>
          </div>
          <div className="text-[13px] text-slate-500 mt-1">
            {waitingQueue.filter((q) => q.status === 'Em triagem').length} em triagem • {waitingQueue.filter((q) => q.status === 'Aguardando médico').length} aguardando
          </div>
        </div>

        {/* Col 3 */}
        <div className="p-6 flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Protocolos Ativos</div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {activeProtocols.length}
          </div>
          <div className="text-[13px] text-slate-500 mt-1">Longevidade e Terapia Injetável</div>
        </div>

        {/* Col 4 - Geometric Highlight Block */}
        <div
          onClick={() => setActiveView(currentUser.role === 'financeiro' ? 'financeiro' : 'agenda')}
          className="p-6 flex flex-col justify-center bg-[#4F46E5] hover:bg-[#4338CA] transition-colors cursor-pointer text-white group"
        >
          <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>{currentUser.role === 'financeiro' ? 'Caixa Diário' : 'Próximo Atendimento'}</span>
            <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {currentUser.role === 'financeiro'
              ? `R$ ${cashRegister.currentBalance.toFixed(2)}`
              : todayAppointments[0]
              ? `Hoje, ${todayAppointments[0].time}`
              : 'Sem fila pendente'}
          </div>
          <div className="text-[13px] text-indigo-100 mt-0.5">
            {currentUser.role === 'financeiro'
              ? `Status: ${cashRegister.status} • Entradas: R$ ${todayInflows.toFixed(2)}`
              : todayAppointments[0]
              ? `${todayAppointments[0].patientName} • ${todayAppointments[0].type}`
              : 'Todos os pacientes atendidos'}
          </div>
        </div>
      </section>

      {/* Main Content Split: Waiting Queue & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Waiting Queue and Doctor/Nurse actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Waiting Queue Interactive Widget */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Fila de Espera & Demanda Espontânea</h3>
                  <p className="text-[11px] text-slate-400">Classificação em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('fila')}
                className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                Ver Fila Completa <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeQueue.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  Nenhum paciente aguardando na recepção no momento.
                </div>
              ) : (
                activeQueue.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {item.patientName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{item.patientName}</p>
                          {item.isSpontaneousDemand && (
                            <span className="text-[9px] bg-indigo-50 text-[#4F46E5] border border-indigo-100 px-2 py-0.2 rounded font-bold uppercase tracking-wider">
                              Demanda Espontânea
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Chegada: {item.arrivalTime} | Profissional: {item.professionalName.split(' ')[0]} {item.professionalName.split(' ')[1]} ({item.appointmentType})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          item.status === 'Aguardando'
                            ? 'bg-slate-50 text-slate-700 border-slate-200'
                            : item.status === 'Em triagem'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : item.status === 'Aguardando médico'
                            ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>

                      {currentUser.role === 'medico' && item.status === 'Aguardando médico' && (
                        <button
                          onClick={() => {
                            const p = patients.find((pat) => pat.id === item.patientId);
                            if (p) setSelectedPatientForPEP(p);
                            setActiveView('consultorio');
                          }}
                          className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs"
                        >
                          Atender
                        </button>
                      )}

                      {currentUser.role === 'enfermagem' && item.status === 'Em triagem' && (
                        <button
                          onClick={() => setActiveView('triagem')}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs"
                        >
                          Triar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Protocols Highlight */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Protocolos Clínicos em Acompanhamento</h3>
                  <p className="text-[11px] text-slate-400">Emagrecimento, Longevidade e Terapia Injetável</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('protocolos')}
                className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                Ver Protocolos <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeProtocols.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">Nenhum protocolo ativo no momento.</p>
              ) : (
                activeProtocols.map((assign) => {
                  const progressPct = Math.round((assign.completedSessions / assign.totalSessions) * 100);
                  return (
                    <div key={assign.id} className="py-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{assign.patientName}</p>
                          <p className="text-[11px] text-[#4F46E5] font-semibold">{assign.protocolName}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {assign.completedSessions}/{assign.totalSessions} sessões ({progressPct}%)
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#38BDF8] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Etapa: {assign.currentStep} de {assign.totalSteps}</span>
                        <span>Próxima sessão: {assign.nextSessionDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Agenda of the Day & System Alerts */}
        <div className="space-y-8">
          {/* Today's Appointments Mini Calendar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Agenda de Hoje (27/08)
                </h3>
              </div>
              <button
                onClick={() => setActiveView('agenda')}
                className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-bold uppercase tracking-wider"
              >
                Ver agenda
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {todayAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sem agendamentos para hoje.</p>
              ) : (
                todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{apt.time}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          apt.status === 'Confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'Em Espera'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{apt.patientName}</p>
                    <p className="text-[10px] text-slate-500">{apt.type} • {apt.professionalName.split(' ')[0]} {apt.professionalName.split(' ')[1]}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="uppercase tracking-wider text-[11px]">Alerta de Estoque Crítico ({lowStock.length})</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Medicamentos abaixo do estoque mínimo:
              </p>
              <div className="space-y-1.5 pt-1">
                {lowStock.map((med) => (
                  <div key={med.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="font-bold text-slate-800">{med.name}</span>
                    <span className="text-rose-600 font-bold text-[11px]">
                      {med.stockQuantity} {med.unit} (mín: {med.minStock})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Audit Pulse Widget */}
          <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 text-xs space-y-3 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-[#38BDF8] uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-4 h-4" />
                Segurança SoD & Auditoria
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LGPD Ativo</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Últimas operações com rastreabilidade criptográfica:
            </p>
            <div className="space-y-2">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-[10px] bg-slate-800/90 p-2 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-indigo-300 uppercase tracking-wider">{log.action}</span>
                    <span className="text-slate-400 font-mono">{log.timestamp.substring(11, 19)}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5 truncate">{log.userName} • {log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
