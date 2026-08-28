import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Stethoscope,
  Clock,
  UserCheck,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Play,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { MedicalConsultationModal } from './MedicalConsultationModal';

export const ConsultorioView: React.FC = () => {
  const {
    currentUser,
    waitingQueue,
    patients,
    consultations,
    callQueuePatient,
    updateQueueStatus,
    activeConsultationDraft,
    setSelectedPatientForPEP,
    setActiveView,
  } = useApp();

  const [activeConsultationPatient, setActiveConsultationPatient] = useState<Patient | null>(null);
  const [activeQueueItemId, setActiveQueueItemId] = useState<string | undefined>(undefined);

  // Filter patients in queue for doctor
  const doctorQueue = waitingQueue.filter(
    (q) =>
      q.status !== 'Finalizado' &&
      q.status !== 'Cancelado'
  );

  const nextPatientInLine = doctorQueue.find((q) => q.status === 'Aguardando médico' || q.status === 'Aguardando');

  const startConsultation = (patientId: string, queueItemId?: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    if (p) {
      if (queueItemId) {
        updateQueueStatus(queueItemId, 'Em atendimento', 'Atendimento iniciado pelo médico no consultório.');
      }
      setActiveConsultationPatient(p);
      setActiveQueueItemId(queueItemId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Área Médica Exclusiva
            </span>
            <span className="text-slate-400 text-xs">Consultório 1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-luxury tracking-wide">
            Consultório do {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Prontuário Eletrônico do Paciente (PEP), registro SOAP, prescrições e laudos integrados.
          </p>
        </div>

        {/* Draft quick launcher if available */}
        {activeConsultationDraft && (
          <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl flex items-center gap-3">
            <div>
              <p className="text-xs font-bold text-amber-300">Rascunho Ativo Detectado</p>
              <p className="text-[10px] text-slate-300">{activeConsultationDraft.patientName} ({activeConsultationDraft.lastSavedAt})</p>
            </div>
            <button
              onClick={() => startConsultation(activeConsultationDraft.patientId)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              Retomar
            </button>
          </div>
        )}
      </div>

      {/* Next Patient Call Box */}
      {nextPatientInLine && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Próximo Paciente da Fila
                </span>
                {nextPatientInLine.isSpontaneousDemand && (
                  <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                    Demanda Espontânea
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{nextPatientInLine.patientName}</h3>
              <p className="text-xs text-slate-600">
                Chegada: {nextPatientInLine.arrivalTime} | Atendimento: {nextPatientInLine.appointmentType} | CPF: {nextPatientInLine.patientCpf}
              </p>
              {nextPatientInLine.notes && (
                <p className="text-[11px] text-amber-900 font-medium mt-1">
                  Nota da Triagem: {nextPatientInLine.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => callQueuePatient(nextPatientInLine.id)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              Chamar Paciente
            </button>

            <button
              onClick={() => startConsultation(nextPatientInLine.patientId, nextPatientInLine.id)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Iniciar Atendimento
            </button>
          </div>
        </div>
      )}

      {/* Grid: Current Queue for Doctor & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm">Fila de Atendimento do Consultório</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {doctorQueue.length} paciente(s) no fluxo
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {doctorQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Nenhum paciente aguardando no momento.
              </div>
            ) : (
              doctorQueue.map((item, index) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{item.patientName}</p>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                            item.status === 'Aguardando médico'
                              ? 'bg-amber-100 text-amber-900'
                              : item.status === 'Em triagem'
                              ? 'bg-teal-100 text-teal-900'
                              : item.status === 'Em atendimento'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {item.appointmentType} • Chegada: {item.arrivalTime} • CPF: {item.patientCpf}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-slate-500 italic">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        const p = patients.find((pat) => pat.id === item.patientId);
                        if (p) {
                          setSelectedPatientForPEP(p);
                          setActiveView('pep');
                        }
                      }}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-[11px] font-medium rounded-lg transition"
                      title="Consultar Histórico PEP"
                    >
                      Histórico PEP
                    </button>

                    <button
                      onClick={() => startConsultation(item.patientId, item.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Atender
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Consultations (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Consultas Finalizadas Hoje</h3>
            </div>
            <span className="text-xs text-emerald-700 font-bold">{consultations.length}</span>
          </div>

          <div className="space-y-3">
            {consultations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhuma consulta finalizada hoje.</p>
            ) : (
              consultations.slice(0, 5).map((cons) => (
                <div
                  key={cons.id}
                  onClick={() => {
                    const p = patients.find((pat) => pat.id === cons.patientId);
                    if (p) {
                      setSelectedPatientForPEP(p);
                      setActiveView('pep');
                    }
                  }}
                  className="p-3 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">{cons.patientName}</p>
                    <span className="text-[10px] text-slate-400">{cons.finishedAt || cons.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    QP: {cons.soap?.chiefComplaint || 'Atendimento de rotina'}
                  </p>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    PEP Gravado com Sucesso
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Consultation Modal */}
      {activeConsultationPatient && (
        <MedicalConsultationModal
          patient={activeConsultationPatient}
          queueItemId={activeQueueItemId}
          onClose={() => setActiveConsultationPatient(null)}
          onFinished={() => setActiveConsultationPatient(null)}
        />
      )}
    </div>
  );
};
