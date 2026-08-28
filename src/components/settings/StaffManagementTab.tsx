import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Professional, Role } from '../../types';
import {
  UserPlus,
  Stethoscope,
  Phone,
  Mail,
  Building2,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  BadgeCheck,
} from 'lucide-react';
import { StaffProfessionalModal } from './StaffProfessionalModal';
import { DoctorDeleteModal } from './DoctorDeleteModal';

export const StaffManagementTab: React.FC = () => {
  const {
    professionals,
    users,
    toggleProfessionalStatus,
    deleteProfessional,
    currentUser,
    hasPermission,
    showToast,
  } = useApp();

  const canEdit = hasPermission('configuracoes', 'edit');
  const canDelete = currentUser.role === 'admin' || hasPermission('configuracoes', 'delete') || canEdit;

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);

  const handleOpenAdd = () => {
    setSelectedProfessional(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prof: Professional) => {
    setSelectedProfessional(prof);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (prof: Professional) => {
    setProfessionalToDelete(prof);
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const associatedUser = users.find((u) => u.professionalId === prof.id);
    const profRole = prof.role || associatedUser?.role || (prof.council === 'CRM' ? 'medico' : prof.council === 'COREN' ? 'enfermagem' : 'recepcao');

    const matchesRole = roleFilter === 'all' || profRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || prof.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (prof: Professional) => {
    const associatedUser = users.find((u) => u.professionalId === prof.id);
    const role = prof.role || associatedUser?.role || (prof.council === 'CRM' ? 'medico' : prof.council === 'COREN' ? 'enfermagem' : 'recepcao');

    switch (role) {
      case 'medico':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-[10px]">Médico Especialista</span>;
      case 'enfermagem':
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-900 font-bold rounded-lg text-[10px]">Enfermagem & Cuidados</span>;
      case 'recepcao':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">Recepção & Atendimento</span>;
      case 'financeiro':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-[10px]">Financeiro & Faturamento</span>;
      case 'admin':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-bold rounded-lg text-[10px]">Diretoria & Admin</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px]">Colaborador</span>;
    }
  };

  const getCleanPhone = (phoneStr: string) => {
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Tab Top Banner & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-amber-600" />
              Corpo Clínico & Colaboradores Autorizados
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão de médicos, corpo de enfermagem e equipe administrativa com habilitação de status e controle de permissões.
            </p>
          </div>

          {canEdit && (
            <button
              id="btn-add-professional"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-200 transition flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Profissional
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CRM, COREN, WhatsApp ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:border-amber-500"
            >
              <option value="all">Todas as Funções</option>
              <option value="medico">Médicos</option>
              <option value="enfermagem">Enfermagem</option>
              <option value="recepcao">Recepção</option>
              <option value="financeiro">Financeiro</option>
              <option value="admin">Diretoria / Admin</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:border-amber-500"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Apenas Habilitados (Ativos)</option>
              <option value="inativo">Apenas Desabilitados (Inativos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professionals List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Profissionais Cadastrados ({filteredProfessionals.length} de {professionals.length})
          </span>
          <span className="text-xs text-slate-500">
            Administrador Logado: <strong>{currentUser.name}</strong>
          </span>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-bold text-sm text-slate-700">Nenhum profissional encontrado</p>
            <p className="text-xs">Tente ajustar os filtros de busca ou cadastre um novo profissional.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProfessionals.map((prof) => {
              const isAtivo = prof.status === 'ativo';
              const cleanPhone = getCleanPhone(prof.phone);

              return (
                <div
                  key={prof.id}
                  className={`p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    isAtivo ? 'hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-75'
                  }`}
                >
                  {/* Left: Professional Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm font-serif-luxury shrink-0 shadow-2xs ${
                        isAtivo
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {prof.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{prof.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold rounded-md text-[10px]">
                          {prof.council} {prof.registrationNumber}
                        </span>
                        {getRoleBadge(prof)}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            isAtivo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          {isAtivo ? 'Habilitado' : 'Desabilitado'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong>{prof.specialty || 'Clínica Geral'}</strong> • Setor: {prof.sector}
                      </p>

                      {/* Contact Info: WhatsApp & Email */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                        {prof.phone && (
                          <a
                            href={`https://wa.me/55${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{prof.phone}</span>
                          </a>
                        )}

                        {prof.email && (
                          <a
                            href={`mailto:${prof.email}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            <span>{prof.email}</span>
                          </a>
                        )}
                      </div>

                      {prof.notes && (
                        <p className="text-[10px] text-slate-400 italic pt-0.5">{prof.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Admin Action Controls */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {/* Toggle Status Button */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => toggleProfessionalStatus(prof.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          isAtivo
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title={isAtivo ? 'Desabilitar acesso do profissional' : 'Habilitar acesso do profissional'}
                      >
                        {isAtivo ? (
                          <>
                            <ToggleLeft className="w-4 h-4" /> Desabilitar
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4" /> Habilitar
                          </>
                        )}
                      </button>
                    )}

                    {/* Edit / Configure Functions Button */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prof)}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Definir Funções & Editar
                      </button>
                    )}

                    {/* Definitive Delete Button (Admin Only) */}
                    {canDelete && (
                      <button
                        type="button"
                        id={`btn-delete-prof-${prof.id}`}
                        onClick={() => handleOpenDelete(prof)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5"
                        title={prof.council === 'CRM' ? 'Excluir Médico Definitivamente' : 'Excluir Profissional Definitivamente'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{prof.council === 'CRM' ? 'Excluir Médico' : 'Excluir'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      <StaffProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professionalToEdit={selectedProfessional}
      />

      {/* Modal for Definitive Deletion with Double Confirmation */}
      <DoctorDeleteModal
        isOpen={!!professionalToDelete}
        onClose={() => setProfessionalToDelete(null)}
        professional={professionalToDelete}
        onConfirmDelete={(id) => {
          deleteProfessional(id);
          setProfessionalToDelete(null);
        }}
        adminName={currentUser.name}
      />
    </div>
  );
};
