import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Professional, Role, Sector, RolePermissions, SystemModule } from '../../types';
import {
  UserPlus,
  UserCheck,
  Shield,
  Stethoscope,
  Phone,
  Mail,
  Building2,
  FileCheck2,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react';

interface StaffProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalToEdit?: Professional | null;
}

const ALL_MODULES: { id: SystemModule; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard & Indicadores', description: 'Visão geral e métricas clínicas' },
  { id: 'agenda', label: 'Agenda & Consultas', description: 'Marcação e controle de horários' },
  { id: 'fila', label: 'Recepção & Fila de Espera', description: 'Check-in e triagem de pacientes' },
  { id: 'pacientes', label: 'Cadastro de Pacientes', description: 'Dados cadastrais e histórico' },
  { id: 'pep', label: 'Prontuário Eletrônico (PEP)', description: 'Evolução clínica, SOAP e anamnese' },
  { id: 'prescricoes', label: 'Prescrições & Documentos', description: 'Receitas, atestados e relatórios' },
  { id: 'exames', label: 'Pedidos de Exames', description: 'Solicitações e laudos laboratoriais' },
  { id: 'triagem', label: 'Triagem & Sinais Vitais', description: 'Aferição de enfermagem e triagem' },
  { id: 'aplicacoes', label: 'Enfermagem & Injetáveis', description: 'Aplicação de medicamentos e soros' },
  { id: 'estoque', label: 'Estoque de Medicamentos', description: 'Controle de lotes e insumos' },
  { id: 'protocolos', label: 'Protocolos & Pacotes', description: 'Planos de tratamento e bioimpedância' },
  { id: 'orcamentos', label: 'Orçamentos Clínicos', description: 'Elaboração de propostas e valores' },
  { id: 'financeiro', label: 'Financeiro, Caixa & NFS-e', description: 'Fluxo de caixa e emissão de notas' },
  { id: 'tcle', label: 'Termos de Consentimento (TCLE)', description: 'Emissão e assinatura digital de termos' },
  { id: 'configuracoes', label: 'Configurações & Governança', description: 'Identidade, SoD e colaboradores' },
];

export const StaffProfessionalModal: React.FC<StaffProfessionalModalProps> = ({
  isOpen,
  onClose,
  professionalToEdit,
}) => {
  const {
    addProfessional,
    updateProfessional,
    sodPermissions,
    users,
    currentUser,
    showToast,
  } = useApp();

  const isEditing = Boolean(professionalToEdit);

  // Form states
  const [name, setName] = useState('');
  const [council, setCouncil] = useState<Professional['council']>('CRM');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('medico');
  const [specialty, setSpecialty] = useState('');
  const [sector, setSector] = useState<Sector>('Consultório');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [notes, setNotes] = useState('');

  // Fine-grained permissions state
  const [customPermissions, setCustomPermissions] = useState<RolePermissions>({});
  const [isCustomizingPermissions, setIsCustomizingPermissions] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (professionalToEdit) {
      setName(professionalToEdit.name || '');
      setCouncil(professionalToEdit.council || 'CRM');
      setRegistrationNumber(professionalToEdit.registrationNumber || '');
      setPhone(professionalToEdit.phone || '');
      setEmail(professionalToEdit.email || '');
      setSpecialty(professionalToEdit.specialty || '');
      setSector(professionalToEdit.sector || 'Consultório');
      setStatus(professionalToEdit.status || 'ativo');
      setNotes(professionalToEdit.notes || '');

      // Find user role if associated
      const associatedUser = users.find((u) => u.professionalId === professionalToEdit.id);
      const userRole = professionalToEdit.role || associatedUser?.role || (professionalToEdit.council === 'CRM' ? 'medico' : professionalToEdit.council === 'COREN' ? 'enfermagem' : 'recepcao');
      setRole(userRole);

      if (professionalToEdit.customPermissions || associatedUser?.customPermissions) {
        setCustomPermissions(professionalToEdit.customPermissions || associatedUser?.customPermissions || {});
        setIsCustomizingPermissions(true);
      } else {
        setCustomPermissions(sodPermissions[userRole] || {});
        setIsCustomizingPermissions(false);
      }
    } else {
      setName('');
      setCouncil('CRM');
      setRegistrationNumber('');
      setPhone('');
      setEmail('');
      setRole('medico');
      setSpecialty('Clínica Geral & Integrativa');
      setSector('Consultório');
      setStatus('ativo');
      setNotes('');
      setCustomPermissions(sodPermissions['medico'] || {});
      setIsCustomizingPermissions(false);
    }
  }, [professionalToEdit, sodPermissions, users, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    // Set appropriate default sector and council if not edited
    if (newRole === 'medico') {
      setCouncil('CRM');
      setSector('Consultório');
    } else if (newRole === 'enfermagem') {
      setCouncil('COREN');
      setSector('Enfermagem');
    } else if (newRole === 'recepcao') {
      setCouncil('OUTRO');
      setSector('Recepção');
    } else if (newRole === 'financeiro') {
      setCouncil('OUTRO');
      setSector('Financeiro');
    } else if (newRole === 'admin') {
      setCouncil('CRM');
      setSector('Diretoria');
    }

    if (!isCustomizingPermissions) {
      setCustomPermissions(sodPermissions[newRole] || {});
    }
  };

  const handleToggleModulePermission = (modId: string, type: 'view' | 'edit' = 'view') => {
    setCustomPermissions((prev) => {
      const current = prev[modId] || { view: false, edit: false };
      const updated = { ...current };
      if (type === 'view') {
        updated.view = !current.view;
        if (!updated.view) {
          updated.edit = false;
        }
      } else if (type === 'edit') {
        updated.edit = !current.edit;
        if (updated.edit) {
          updated.view = true;
        }
      }
      return {
        ...prev,
        [modId]: updated,
      };
    });
  };

  const handleApplyRoleDefaults = () => {
    setCustomPermissions(sodPermissions[role] || {});
    setIsCustomizingPermissions(false);
    showToast(`Permissões restauradas para o padrão do perfil ${role.toUpperCase()}`);
  };

  const handleGrantFullAccess = () => {
    const full: RolePermissions = {};
    ALL_MODULES.forEach((m) => {
      full[m.id] = { view: true, create: true, edit: true, delete: true, export: true };
    });
    setCustomPermissions(full);
    setIsCustomizingPermissions(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Por favor, informe o nome do profissional.', 'error');
      return;
    }

    if (!email.trim()) {
      showToast('Por favor, informe o e-mail do profissional.', 'error');
      return;
    }

    if (isEditing && professionalToEdit) {
      updateProfessional(professionalToEdit.id, {
        name,
        council,
        registrationNumber,
        phone,
        email,
        specialty,
        sector,
        status,
        role,
        notes,
        customPermissions: isCustomizingPermissions ? customPermissions : undefined,
      });
    } else {
      addProfessional({
        name,
        council,
        registrationNumber,
        phone,
        email,
        specialty,
        sector,
        status,
        role,
        notes,
        customPermissions: isCustomizingPermissions ? customPermissions : undefined,
        createLoginUser: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm font-serif-luxury">
                {isEditing ? 'Editar Profissional & Atribuição de Funções' : 'Adicionar Novo Profissional ao Corpo Clínico'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Cadastro, credenciais profissionais, dados de contato e permissões de acesso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Status & Quick Toggle Header */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status === 'ativo' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-400'}`} />
              <div>
                <span className="font-bold text-slate-800">
                  Status do Profissional no Sistema:{' '}
                  <strong className={status === 'ativo' ? 'text-emerald-700' : 'text-slate-600'}>
                    {status === 'ativo' ? 'HABILITADO (Ativo)' : 'DESABILITADO (Inativo)'}
                  </strong>
                </span>
                <p className="text-[10px] text-slate-500">
                  {status === 'ativo'
                    ? 'Profissional com acesso liberado às funções permitidas e disponível para agendamentos.'
                    : 'Profissional desativado. Não poderá realizar atendimentos ou acessar módulos restritos.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-toggle-professional-status"
              onClick={() => setStatus((prev) => (prev === 'ativo' ? 'inativo' : 'ativo'))}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                status === 'ativo'
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status === 'ativo' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
              {status === 'ativo' ? 'Habilitado' : 'Desabilitado'}
            </button>
          </div>

          {/* Section 1: Dados Pessoais & Contato */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Stethoscope className="w-3.5 h-3.5 text-amber-600" /> Identificação & Contato
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nome Completo do Profissional *</label>
                <input
                  id="prof-input-name"
                  type="text"
                  required
                  placeholder="Ex: Dr. Roberto Guimarães Alencar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp / Celular *
                </label>
                <input
                  id="prof-input-whatsapp"
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-600" /> E-mail Institucional *
                </label>
                <input
                  id="prof-input-email"
                  type="email"
                  required
                  placeholder="Ex: roberto.med@plennusmed.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Credenciais & Conselho Profissional */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-600" /> Credencial & Conselho de Classe
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Conselho de Classe *</label>
                <select
                  id="prof-select-council"
                  value={council}
                  onChange={(e) => setCouncil(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-bold"
                >
                  <option value="CRM">CRM (Medicina)</option>
                  <option value="COREN">COREN (Enfermagem)</option>
                  <option value="CRN">CRN (Nutrição)</option>
                  <option value="CRO">CRO (Odontologia)</option>
                  <option value="CRF">CRF (Farmácia)</option>
                  <option value="CREFITO">CREFITO (Fisioterapia)</option>
                  <option value="OUTRO">OUTRO / Administrativo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número do Registro / UF *</label>
                <input
                  id="prof-input-registration"
                  type="text"
                  required
                  placeholder="Ex: 142.890/SP ou 512.980-SP"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Especialidade / Título</label>
                <input
                  id="prof-input-specialty"
                  type="text"
                  placeholder="Ex: Cardiologia, Estomaterapia..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Função & Setor de Atuação */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" /> Função (Perfil) & Setor de Atuação
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Função / Perfil no Sistema *</label>
                <select
                  id="prof-select-role"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-amber-950 font-bold outline-none focus:bg-white focus:border-amber-500"
                >
                  <option value="medico">Médico / Especialista Clínico</option>
                  <option value="enfermagem">Enfermagem / Estomaterapia / Cuidados</option>
                  <option value="recepcao">Recepção / Atendimento ao Paciente</option>
                  <option value="financeiro">Financeiro / Faturamento & Caixa</option>
                  <option value="admin">Administrador Geral / Diretoria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Setor / Departamento</label>
                <select
                  id="prof-select-sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sector)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                >
                  <option value="Consultório">Consultório</option>
                  <option value="Enfermagem">Enfermagem</option>
                  <option value="Recepção">Recepção</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Nutrição">Nutrição</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Definir Funções & Permissões que ele pode exercer */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" /> Funções & Escopo de Acesso Autorizado
                </h4>
                <p className="text-[10px] text-slate-500">
                  Defina exatamente quais módulos e ações o profissional está habilitado a exercer
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyRoleDefaults}
                  className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  Padrão do Perfil
                </button>
                <button
                  type="button"
                  onClick={handleGrantFullAccess}
                  className="px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                >
                  Liberar Todos
                </button>
              </div>
            </div>

            {/* Matrix of permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              {ALL_MODULES.map((m) => {
                const modPerm = customPermissions[m.id];
                const canView = Boolean(modPerm?.view);
                const canEdit = Boolean(modPerm?.edit);

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-lg border transition flex items-center justify-between ${
                      canView ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-100/60 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="pr-2">
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">{m.label}</p>
                      <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomizingPermissions(true);
                          handleToggleModulePermission(m.id, 'view');
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          canView ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Permissão para Acessar / Visualizar"
                      >
                        {canView ? 'Acesso' : 'Bloqueado'}
                      </button>

                      {canView && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomizingPermissions(true);
                            handleToggleModulePermission(m.id, 'edit');
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold transition ${
                            canEdit ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Permissão para Criar / Editar registros"
                        >
                          {canEdit ? 'Editar' : 'Leitura'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações Internas / Escopo</label>
            <textarea
              rows={2}
              placeholder="Ex: Responsável pelos atendimentos de endocrinologia e protocolos de emagrecimento nas terças e quintas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancelar
            </button>

            <button
              id="btn-save-professional"
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-200 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
