import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Users,
  Plus,
  Search,
  Edit2,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  Shield,
  X,
  Stethoscope,
  UserX,
  UserCheck,
} from 'lucide-react';

export const PatientsView: React.FC = () => {
  const {
    patients,
    addPatient,
    updatePatient,
    togglePatientStatus,
    deletePatient,
    hasPermission,
    setSelectedPatientForPEP,
    setActiveView,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Deletion modal state
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressStreet, setAddressStreet] = useState('Av. Paulista, 1000');
  const [bloodType, setBloodType] = useState('O+');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [chronicInput, setChronicInput] = useState('');
  const [continuousMedInput, setContinuousMedInput] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  const canEdit = hasPermission('pacientes', 'edit');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search) ||
      p.phone.includes(search);
    const matchesStatus = statusFilter === 'todos' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingPatient(null);
    setName('');
    setCpf('');
    setBirthDate('1990-01-01');
    setGender('Feminino');
    setPhone('');
    setEmail('');
    setAddressStreet('Av. Paulista, 1000');
    setBloodType('O+');
    setAllergiesInput('');
    setChronicInput('');
    setContinuousMedInput('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setCpf(p.cpf);
    setBirthDate(p.birthDate);
    setGender(p.gender);
    setPhone(p.phone);
    setEmail(p.email);
    setAddressStreet(p.address?.street ? `${p.address.street}, ${p.address.number}` : 'Av. Paulista, 1000');
    setBloodType(p.bloodType || 'O+');
    setAllergiesInput(p.allergies.join(', '));
    setChronicInput(p.chronicDiseases.join(', '));
    setContinuousMedInput(p.continuousMedications.join(', '));
    setEmergencyContactName(p.emergencyContact?.name || '');
    setEmergencyContactPhone(p.emergencyContact?.phone || '');
    setNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim() || !phone.trim()) {
      showToast('Preencha os campos obrigatórios: Nome, CPF e Telefone.', 'error');
      return;
    }

    const allergies = allergiesInput ? allergiesInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const chronicDiseases = chronicInput ? chronicInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const continuousMedications = continuousMedInput ? continuousMedInput.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const addressObj = {
      street: addressStreet || 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    };

    const emergencyObj = {
      name: emergencyContactName || 'Contato Familiar',
      phone: emergencyContactPhone || phone,
      relationship: 'Familiar',
    };

    if (editingPatient) {
      updatePatient(editingPatient.id, {
        name,
        cpf,
        birthDate,
        gender,
        phone,
        email,
        address: addressObj,
        bloodType,
        allergies,
        chronicDiseases,
        continuousMedications,
        emergencyContact: emergencyObj,
        notes,
      });
      showToast('Cadastro do paciente atualizado com sucesso!');
    } else {
      addPatient({
        name,
        cpf,
        birthDate,
        gender,
        phone,
        email,
        address: addressObj,
        bloodType,
        allergies,
        chronicDiseases,
        continuousMedications,
        emergencyContact: emergencyObj,
        notes,
        status: 'ativo',
      });
      showToast('Novo paciente cadastrado no Centro Médico Plennus!');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Gestão de Pacientes
          </h1>
          <p className="text-xs text-slate-500">
            Cadastros completos, contatos, dados de saúde e consentimento LGPD.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Paciente
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="todos">Todos ({patients.length})</option>
            <option value="ativo">Ativos ({patients.filter((p) => p.status === 'ativo').length})</option>
            <option value="inativo">Inativos ({patients.filter((p) => p.status === 'inativo').length})</option>
          </select>
        </div>
      </div>

      {/* Patients Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className={`bg-white rounded-2xl p-5 border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
              patient.status === 'ativo' ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 font-bold text-sm flex items-center justify-center font-serif-luxury shadow-2xs">
                    {patient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{patient.name}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">CPF: {patient.cpf}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    patient.status === 'ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {patient.status.toUpperCase()}
                </span>
              </div>

              {/* Patient details */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nasc: {patient.birthDate} ({patient.gender})</span>
                </div>
              </div>

              {/* Health Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {patient.allergies.length > 0 && (
                  <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                    Alergia: {patient.allergies.join(', ')}
                  </span>
                )}
                {patient.chronicDiseases.length > 0 && (
                  <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium">
                    {patient.chronicDiseases[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
              <button
                onClick={() => {
                  setSelectedPatientForPEP(patient);
                  setActiveView('pep');
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Ver Prontuário (PEP)
              </button>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(patient)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Editar Cadastro"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {patient.status === 'ativo' ? (
                    <button
                      onClick={() => {
                        togglePatientStatus(patient.id);
                        showToast('Paciente inativado.');
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title="Inativar Paciente"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updatePatient(patient.id, { status: 'ativo' });
                        showToast('Paciente reativado.');
                      }}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Reativar Paciente"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setPatientToDelete(patient);
                      setDeleteConfirmName('');
                      setDeleteReason('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Excluir Paciente Definitivamente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm font-serif-luxury">
                  {editingPatient ? 'Editar Cadastro do Paciente' : 'Novo Cadastro de Paciente — Plennus'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sexo Biológico</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Endereço Residencial</label>
                  <input
                    type="text"
                    placeholder="Rua, número, complemento, bairro, cidade - UF"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo Sanguíneo</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contato de Emergência (Nome)</label>
                  <input
                    type="text"
                    placeholder="Nome do contato familiar"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Alergias Conhecidas (separar por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Dipirona, Penicilina, Frutos do mar..."
                    value={allergiesInput}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Doenças Crônicas / Histórico Familiar</label>
                  <input
                    type="text"
                    placeholder="Ex: Hipertensão, Diabetes Tipo 2, Hipotireoidismo..."
                    value={chronicInput}
                    onChange={(e) => setChronicInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Medicações de Uso Contínuo</label>
                  <input
                    type="text"
                    placeholder="Ex: Losartana 50mg, Metformina 850mg..."
                    value={continuousMedInput}
                    onChange={(e) => setContinuousMedInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* LGPD Consent Banner */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 leading-tight">
                  <strong>Consentimento LGPD:</strong> O paciente concorda com o tratamento de seus dados de saúde para fins exclusivos de assistência médica e registros do prontuário no Centro Médico Integrado Plennus.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Delete Patient Double Confirmation */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-rose-300 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Exclusão Definitiva de Paciente
              </h3>
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="text-white/80 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-1.5">
                <p className="font-bold text-xs text-rose-900">
                  ⚠️ ATENÇÃO: AÇÃO IRREVERSÍVEL — AFETA APENAS ESTE PACIENTE
                </p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  A exclusão definitiva removerá o cadastro de <strong>{patientToDelete.name}</strong> e todos os seus registros vinculados (consultas, prontuários PEP, prescrições, documentos, solicitações de exames, termos de consentimento e orçamentos deste paciente).
                </p>
                <p className="text-[11px] font-semibold text-rose-900">
                  Nenhum outro paciente ou dado do sistema será alterado ou excluído.
                </p>
              </div>

              {/* Patient details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Nome Completo:</span>
                  <strong className="text-slate-900">{patientToDelete.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>CPF:</span>
                  <span className="font-mono">{patientToDelete.cpf}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data de Nascimento:</span>
                  <span>{patientToDelete.birthDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Telefone:</span>
                  <span>{patientToDelete.phone}</span>
                </div>
              </div>

              {/* Typed confirmation */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Digite exatamente o nome do paciente <span className="text-rose-600">"{patientToDelete.name}"</span> para confirmar:
                </label>
                <input
                  type="text"
                  placeholder={patientToDelete.name}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo / Justificativa da Exclusão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Solicitação do titular via LGPD / Cadastro duplicado..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPatientToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmName.trim() !== patientToDelete.name.trim()}
                  onClick={() => {
                    deletePatient(patientToDelete.id);
                    setPatientToDelete(null);
                  }}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 ${
                    deleteConfirmName.trim() === patientToDelete.name.trim()
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" /> Excluir Paciente Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
