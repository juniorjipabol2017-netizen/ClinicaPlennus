import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, User, Calendar, FileText, Activity, DollarSign, X } from 'lucide-react';
import { SystemModule } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    patients,
    appointments,
    consultations,
    budgets,
    intelligentProtocols,
    hasPermission,
    setActiveView,
    setSelectedPatientForPEP,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd/Ctrl + K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const filteredPatients = hasPermission('pacientes', 'view')
      ? patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.cpf.includes(q) ||
            p.phone.includes(q) ||
            p.email.toLowerCase().includes(q)
        ).slice(0, 4)
      : [];

    const filteredAppointments = hasPermission('agenda', 'view')
      ? appointments.filter(
          (a) =>
            a.patientName.toLowerCase().includes(q) ||
            a.professionalName.toLowerCase().includes(q) ||
            a.type.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    const filteredConsultations = hasPermission('pep', 'view')
      ? consultations.filter(
          (c) =>
            c.patientName.toLowerCase().includes(q) ||
            c.soap?.chiefComplaint?.toLowerCase().includes(q) ||
            c.professionalName.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    const filteredBudgets = hasPermission('orcamentos', 'view')
      ? budgets.filter(
          (b) =>
            b.patientName.toLowerCase().includes(q) ||
            b.id.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    const filteredProtocols = hasPermission('protocolos', 'view')
      ? intelligentProtocols.filter(
          (proto) =>
            proto.name.toLowerCase().includes(q) ||
            proto.category.toLowerCase().includes(q)
        ).slice(0, 3)
      : [];

    return {
      patients: filteredPatients,
      appointments: filteredAppointments,
      consultations: filteredConsultations,
      budgets: filteredBudgets,
      protocols: filteredProtocols,
    };
  }, [query, patients, appointments, consultations, budgets, intelligentProtocols, hasPermission]);

  if (!isGlobalSearchOpen) return null;

  const navigateTo = (view: SystemModule, patientId?: string) => {
    setActiveView(view);
    if (patientId) {
      const p = patients.find((pat) => pat.id === patientId);
      if (p) setSelectedPatientForPEP(p);
    }
    setIsGlobalSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            type="text"
            placeholder="Buscar pacientes, CPF, agendamentos, PEP, orçamentos ou protocolos..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Digite para buscar pacientes, agendamentos ou registros clínicos autorizados.
            </div>
          )}

          {query.trim() && results && (
            <>
              {/* Patients */}
              {results.patients.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Pacientes
                  </h4>
                  <div className="space-y-1">
                    {results.patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigateTo('pacientes', p.id)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/80 transition-colors flex items-center justify-between group border border-transparent hover:border-amber-200"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500">CPF: {p.cpf} | Tel: {p.phone}</p>
                        </div>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                          Ver Cadastro / PEP
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments */}
              {results.appointments.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Agendamentos
                  </h4>
                  <div className="space-y-1">
                    {results.appointments.map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => navigateTo('agenda')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors flex items-center justify-between group border border-transparent hover:border-blue-200"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{apt.patientName}</p>
                          <p className="text-[10px] text-slate-500">{apt.date} às {apt.time} - {apt.type} ({apt.professionalName})</p>
                        </div>
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {apt.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultations */}
              {results.consultations.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Prontuário / Consultas (PEP)
                  </h4>
                  <div className="space-y-1">
                    {results.consultations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigateTo('pep', c.patientId)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-emerald-50/80 transition-colors flex items-center justify-between group border border-transparent hover:border-emerald-200"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{c.patientName}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{c.soap?.chiefComplaint || 'Consulta médica'}</p>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {c.date}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Protocols */}
              {results.protocols.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Protocolos Inteligentes
                  </h4>
                  <div className="space-y-1">
                    {results.protocols.map((proto) => (
                      <button
                        key={proto.id}
                        onClick={() => navigateTo('protocolos')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-purple-50/80 transition-colors flex items-center justify-between group border border-transparent hover:border-purple-200"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{proto.name}</p>
                          <p className="text-[10px] text-slate-500">{proto.category} | {proto.totalSessions} sessões</p>
                        </div>
                        <span className="text-[10px] text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                          R$ {proto.suggestedPrice.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Budgets */}
              {results.budgets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Orçamentos
                  </h4>
                  <div className="space-y-1">
                    {results.budgets.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => navigateTo('orcamentos')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/80 transition-colors flex items-center justify-between group border border-transparent hover:border-amber-200"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{b.patientName} - #{b.id}</p>
                          <p className="text-[10px] text-slate-500">Status: {b.status} | {b.items.length} itens</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-800">
                          R$ {b.finalValue.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.patients.length === 0 &&
                results.appointments.length === 0 &&
                results.consultations.length === 0 &&
                results.budgets.length === 0 &&
                results.protocols.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Nenhum resultado encontrado para &quot;{query}&quot; nas suas permissões de acesso.
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
