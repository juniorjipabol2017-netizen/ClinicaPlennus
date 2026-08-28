import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WaitingQueueItem } from '../../types';
import {
  Clock,
  UserCheck,
  BellRing,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Plus,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

export const QueueView: React.FC = () => {
  const {
    waitingQueue,
    patients,
    users,
    procedureTypes,
    addToWaitingQueue,
    updateQueueStatus,
    deleteQueueItem,
    callQueuePatient,
    currentUser,
    hasPermission,
    setActiveView,
    setSelectedPatientForPEP,
    showToast,
  } = useApp();

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedProfId, setSelectedProfId] = useState(users.find((u) => u.role === 'medico')?.id || '');
  const [appointmentType, setAppointmentType] = useState<WaitingQueueItem['appointmentType']>('Consulta Médica');
  const [isSpontaneous, setIsSpontaneous] = useState(false);
  const [queueNotes, setQueueNotes] = useState('');
  const [itemToDelete, setItemToDelete] = useState<WaitingQueueItem | null>(null);

  const canManage = hasPermission('fila', 'edit');

  const activeQueue = waitingQueue.filter((q) => q.status !== 'Finalizado' && q.status !== 'Cancelado');
  const finishedQueue = waitingQueue.filter((q) => q.status === 'Finalizado');

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteQueueItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    const prof = users.find((u) => u.id === selectedProfId);

    if (!patient || !prof) {
      showToast('Selecione o paciente e o profissional.', 'error');
      return;
    }

    addToWaitingQueue({
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      professionalId: prof.id,
      professionalName: prof.name,
      appointmentType,
      status: 'Aguardando',
      priority: isSpontaneous ? 'Urgência' : 'Normal',
      isSpontaneousDemand: isSpontaneous,
      notes: queueNotes,
    });

    setIsCheckInModalOpen(false);
    setSelectedPatientId('');
    setQueueNotes('');
    showToast(`${patient.name} adicionado(a) à fila de espera em tempo real!`);
  };

  const getStatusColor = (status: WaitingQueueItem['status']) => {
    switch (status) {
      case 'Aguardando':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Em triagem':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Aguardando médico':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Em atendimento':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse';
      case 'Finalizado':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Vermelho':
        return 'bg-red-500 text-white';
      case 'Amarelo':
        return 'bg-amber-500 text-white';
      case 'Verde':
        return 'bg-emerald-500 text-white';
      case 'Azul':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Fila de Espera & Recepção em Tempo Real
          </h1>
          <p className="text-xs text-slate-500">
            Fluxo contínuo: Recepção ➔ Triagem Enfermagem ➔ Chamada Médica ➔ Finalização.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Check-in de Paciente / Demanda Espontânea
          </button>
        )}
      </div>

      {/* Real-time Queue Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1: Aguardando Triagem / Recepção */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              1. Recepção / Espera
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold border border-slate-200">
              {activeQueue.filter((q) => q.status === 'Aguardando').length}
            </span>
          </div>

          <div className="space-y-2">
            {activeQueue.filter((q) => q.status === 'Aguardando').map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">{item.patientName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">{item.arrivalTime}</span>
                    {canManage && (
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Excluir da fila de espera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">{item.appointmentType}</p>

                {item.isSpontaneousDemand && (
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded inline-block">
                    Demanda Espontânea
                  </span>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => callQueuePatient(item.id)}
                    className="text-[10px] text-slate-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                  >
                    <BellRing className="w-3 h-3" /> Chamar
                  </button>

                  <button
                    onClick={() => updateQueueStatus(item.id, 'Em triagem')}
                    className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-1 rounded hover:bg-teal-100 transition"
                  >
                    Enviar Triagem ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Em Triagem (Enfermagem) */}
        <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-teal-200">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              2. Em Triagem
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold border border-teal-200">
              {activeQueue.filter((q) => q.status === 'Em triagem').length}
            </span>
          </div>

          <div className="space-y-2">
            {activeQueue.filter((q) => q.status === 'Em triagem').map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-teal-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">{item.patientName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-teal-700 font-mono">{item.arrivalTime}</span>
                    {canManage && (
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Excluir da fila de espera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600">Enfermagem aferindo vitais...</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setActiveView('triagem')}
                    className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-1 rounded transition"
                  >
                    Abrir Triagem
                  </button>

                  <button
                    onClick={() => updateQueueStatus(item.id, 'Aguardando médico')}
                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold"
                  >
                    Liberar Médico ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Aguardando Médico */}
        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              3. Aguardando Médico
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold border border-amber-200">
              {activeQueue.filter((q) => q.status === 'Aguardando médico').length}
            </span>
          </div>

          <div className="space-y-2">
            {activeQueue.filter((q) => q.status === 'Aguardando médico').map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">{item.patientName}</span>
                  <div className="flex items-center gap-1.5">
                    {item.priority && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    )}
                    {canManage && (
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Excluir da fila de espera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600">Médico: {item.professionalName}</p>

                {item.notes && (
                  <p className="text-[10px] text-amber-900 italic font-medium bg-amber-50 p-1.5 rounded">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => callQueuePatient(item.id)}
                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                  >
                    <BellRing className="w-3 h-3" /> Painel de Voz
                  </button>

                  <button
                    onClick={() => {
                      const p = patients.find((pat) => pat.id === item.patientId);
                      if (p) setSelectedPatientForPEP(p);
                      setActiveView('consultorio');
                    }}
                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded transition"
                  >
                    Atender ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Em Atendimento Médico */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              4. No Consultório
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              {activeQueue.filter((q) => q.status === 'Em atendimento').length}
            </span>
          </div>

          <div className="space-y-2">
            {activeQueue.filter((q) => q.status === 'Em atendimento').map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">{item.patientName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Em Consulta
                    </span>
                    {canManage && (
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Excluir da fila de espera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600">Com: {item.professionalName}</p>

                <div className="flex justify-end pt-1 border-t border-slate-100">
                  <button
                    onClick={() => updateQueueStatus(item.id, 'Finalizado', 'Atendimento concluído.')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-900 text-white font-semibold px-2 py-1 rounded transition"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury">Check-in de Paciente na Recepção</h3>
              <button onClick={() => setIsCheckInModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddToQueue} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profissional Solicitado *</label>
                <select
                  required
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                >
                  {users.filter((u) => u.role === 'medico' || u.role === 'nutricionista').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Entrada</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                >
                  <option value="Consulta Médica">Consulta Médica</option>
                  <option value="Demanda Espontânea">Demanda Espontânea (Sem agendamento)</option>
                  <option value="Aplicação / Injetável">Aplicação / Injetável (Soroterapia)</option>
                  <option value="Sessão de Protocolo">Sessão de Protocolo Clínico</option>
                  <option value="Retorno">Retorno</option>
                  {procedureTypes.filter((pt) => pt.status === 'ativo').map((pt) => (
                    <option key={pt.id} value={pt.name}>{pt.name} ({pt.category})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spontaneousCheck"
                  checked={isSpontaneous}
                  onChange={(e) => setIsSpontaneous(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="spontaneousCheck" className="text-slate-700 font-medium cursor-pointer">
                  Marcar como Demanda Espontânea (Encaixe de Urgência / Emergência)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações da Recepção</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Paciente com dor de cabeça súbita, solicitou atendimento rápido..."
                  value={queueNotes}
                  onChange={(e) => setQueueNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  Inserir na Fila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Queue Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excluir Paciente da Fila?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Deseja remover <strong>{itemToDelete.patientName}</strong> ({itemToDelete.appointmentType}) da fila de espera em tempo real?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-200"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
