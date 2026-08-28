import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  User,
  Zap,
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    patients,
    users,
    hasPermission,
    showToast,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-08-27');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New appointment form state
  const [patientId, setPatientId] = useState('');
  const [professionalId, setProfessionalId] = useState(users.find((u) => u.role === 'medico')?.id || '');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<Appointment['type']>('Consulta Médica');
  const [notes, setNotes] = useState('');
  const [isSpontaneous, setIsSpontaneous] = useState(false);

  const canEdit = hasPermission('agenda', 'edit');

  const doctorsList = users.filter((u) => u.role === 'medico' || u.role === 'nutricionista');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.date === selectedDate;
    const matchesDoctor = selectedDoctorId === 'all' ? true : apt.professionalId === selectedDoctorId;
    return matchesDate && matchesDoctor;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = users.find((u) => u.id === professionalId);

    if (!patient || !doctor) {
      showToast('Selecione um paciente e um profissional.', 'error');
      return;
    }

    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      professionalId: doctor.id,
      professionalName: doctor.name,
      specialty: 'Medicina Integrativa',
      durationMinutes: 45,
      date: selectedDate,
      time,
      type: type as any,
      status: isSpontaneous ? 'Em Espera' : 'Agendado',
      notes: notes + (isSpontaneous ? ' (Encaixe / Demanda Espontânea)' : ''),
      isSpontaneousDemand: isSpontaneous,
    });

    setIsModalOpen(false);
    showToast(isSpontaneous ? 'Paciente encaixado e enviado para a Fila de Espera!' : 'Agendamento cadastrado com sucesso!');
  };

  const handleCheckIn = (apt: Appointment) => {
    updateAppointment(apt.id, { status: 'Em Espera' });
    showToast(`${apt.patientName} realizou check-in e entrou na Fila de Espera.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Agenda Médica & Atendimentos
          </h1>
          <p className="text-xs text-slate-500">
            Agendamentos programados, confirmações e recepção de demanda espontânea.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSpontaneous(true);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Encaixe Rápido
            </button>

            <button
              onClick={() => {
                setIsSpontaneous(false);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Agendamento
            </button>
          </div>
        )}
      </div>

      {/* Date and Doctor Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
            />
          </div>

          <button
            onClick={() => setSelectedDate('2026-08-27')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">Todos os Profissionais</option>
            {doctorsList.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Appointments Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Horários Agendados ({filteredAppointments.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Data: {selectedDate}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhum agendamento para este filtro de data e profissional.
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 text-center">
                    <span className="text-sm font-bold text-slate-900 font-mono block">{apt.time}</span>
                    <span className="text-[10px] text-slate-400">45 min</span>
                  </div>

                  <div className="border-l-2 border-amber-500 pl-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                      {apt.isSpontaneousDemand && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                          Demanda Espontânea
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {apt.type} • Profissional: <strong>{apt.professionalName}</strong>
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-slate-500 italic">{apt.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      apt.status === 'Confirmado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'Em Espera'
                        ? 'bg-amber-100 text-amber-900'
                        : apt.status === 'Em Atendimento'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'Finalizado'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {apt.status}
                  </span>

                  {apt.status === 'Confirmado' && canEdit && (
                    <button
                      onClick={() => handleCheckIn(apt)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Check-in
                    </button>
                  )}

                  {apt.status === 'Agendado' && canEdit && (
                    <button
                      onClick={() => updateAppointment(apt.id, { status: 'Confirmado' })}
                      className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-lg"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal New Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury">
                {isSpontaneous ? 'Encaixe / Demanda Espontânea' : 'Novo Agendamento na Agenda'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (CPF: {p.cpf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profissional de Saúde *</label>
                <select
                  required
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                >
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Atendimento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  >
                    <option value="Consulta Médica">Consulta Médica</option>
                    <option value="Retorno">Retorno</option>
                    <option value="Aplicação / Injetável">Aplicação / Injetável</option>
                    <option value="Sessão de Protocolo">Sessão de Protocolo</option>
                    <option value="Consulta Nutricional">Consulta Nutricional</option>
                    <option value="Exame">Exame</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / Motivo</label>
                <textarea
                  rows={2}
                  placeholder="Queixa relatada na marcação..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
