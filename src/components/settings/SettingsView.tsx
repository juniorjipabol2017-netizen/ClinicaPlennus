import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicIdentityConfig, User, Role } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  FileCheck2,
  Save,
  CheckCircle2,
  UserPlus,
  Lock,
  KeyRound,
  Sparkles,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Palette,
} from 'lucide-react';
import { ClinicLogo } from '../common/PlennusLogo';
import { ConsentTemplatesSettingsTab } from './ConsentTemplatesSettingsTab';
import { StaffManagementTab } from './StaffManagementTab';
import { ProcedureTypesTab } from './ProcedureTypesTab';
import { VisualBrandingSection } from './VisualBrandingSection';

export const SettingsView: React.FC = () => {
  const {
    clinicConfig,
    updateClinicConfig,
    users,
    procedureTypes,
    currentUser,
    auditLogs,
    hasPermission,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'clinica' | 'personalizacao' | 'usuarios' | 'procedimentos' | 'termos' | 'sod' | 'auditoria'
  >('clinica');

  // Clinic config form
  const [clinicName, setClinicName] = useState(clinicConfig.clinicName);
  const [tagline, setTagline] = useState(clinicConfig.tagline);
  const [cnpj, setCnpj] = useState(clinicConfig.cnpj);
  const [technicalDirector, setTechnicalDirector] = useState(clinicConfig.technicalDirector);
  const [technicalDirectorCrm, setTechnicalDirectorCrm] = useState(clinicConfig.technicalDirectorCrm);
  const [phone, setPhone] = useState(clinicConfig.phone);
  const [whatsapp, setWhatsapp] = useState(clinicConfig.whatsapp);
  const [email, setEmail] = useState(clinicConfig.email);
  const [instagram, setInstagram] = useState(clinicConfig.instagram);
  const [address, setAddress] = useState(clinicConfig.address);
  const [footerMessage, setFooterMessage] = useState(clinicConfig.footerMessage || '');
  const [logoUrl, setLogoUrl] = useState<string>(clinicConfig.logoUrl || '');

  // File upload state & drag/drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = hasPermission('configuracoes', 'edit');

  const handleFileChange = (file: File) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Formato inválido. Por favor, envie uma imagem PNG, JPG, JPEG ou WEBP.', 'error');
      return;
    }

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogoUrl(result);
        showToast('Logo carregada com sucesso! Clique em "SALVAR ALTERAÇÕES" para persistir.');
      }
    };
    reader.onerror = () => {
      showToast('Erro ao ler arquivo da logo.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logotipo personalizado removido. A identidade visual padrão da clínica será utilizada.');
  };

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicConfig({
      clinicName,
      tagline,
      cnpj,
      technicalDirector,
      technicalDirectorCrm,
      phone,
      whatsapp,
      email,
      instagram,
      address,
      footerMessage,
      logoUrl,
    });
    showToast('✓ Configurações salvas com sucesso.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Configurações & Governança da Clínica
          </h1>
          <p className="text-xs text-slate-500">
            Identidade visual, logotipo institucional, usuários, matriz de segregação de funções (SoD) e auditoria.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="settings-tab-clinica"
          onClick={() => setActiveTab('clinica')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'clinica' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Identificação da Clínica
        </button>

        <button
          id="settings-tab-personalizacao"
          onClick={() => setActiveTab('personalizacao')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'personalizacao' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Personalização Visual
        </button>

        <button
          id="settings-tab-usuarios"
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'usuarios' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Corpo Clínico & Colaboradores ({users.length})
        </button>

        <button
          id="settings-tab-procedimentos"
          onClick={() => setActiveTab('procedimentos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'procedimentos' ? 'bg-indigo-100 text-indigo-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Tipos de Atendimentos / Procedimentos ({procedureTypes.length})
        </button>

        <button
          id="settings-tab-termos"
          onClick={() => setActiveTab('termos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'termos' ? 'bg-indigo-100 text-indigo-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Termos de Consentimento (TCLE)
        </button>

        <button
          id="settings-tab-sod"
          onClick={() => setActiveTab('sod')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'sod' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Matriz de Perfis & SoD
        </button>

        <button
          id="settings-tab-auditoria"
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'auditoria' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Trilha de Auditoria LGPD ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: CLINIC IDENTITY */}
      {activeTab === 'clinica' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Upload & Realtime Preview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Upload da Logo Institucional
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Formatos aceitos: PNG, JPG, JPEG e WEBP (Máx. 5MB).
              </p>
            </div>

            {/* Drag and drop upload box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>

              <p className="text-xs font-bold text-slate-800">
                Clique para selecionar ou arraste a imagem
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                PNG, JPG ou WEBP de alta resolução
              </p>
            </div>

            {/* Realtime Previews */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                Pré-visualização da Logo
              </span>

              {/* Light Background Preview */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClinicLogo size="md" textColor="dark" customLogoUrl={logoUrl} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Fundo Claro</span>
              </div>

              {/* Dark Header / Document Preview */}
              <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClinicLogo size="md" textColor="light" customLogoUrl={logoUrl} />
                </div>
                <span className="text-[10px] text-amber-200/70 font-mono">Cabeçalho</span>
              </div>

              {/* Action buttons for logo */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Alterar Logo
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                    title="Restaurar logotipo padrão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-700" /> Integração Automática
              </p>
              <p className="text-amber-800 text-[10px] leading-relaxed">
                A logo selecionada será impressa automaticamente no cabeçalho de Receitas, Atestados Médicos, Termos de Consentimento (TCLE) e Propostas de Tratamento.
              </p>
            </div>
          </div>

          {/* Institutional Information Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" /> Identificação & Dados Institucionais
            </h3>

            <form onSubmit={handleSaveClinic} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome da Instituição / Razão Social</label>
                  <input
                    id="input-clinic-name"
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slogan / Subtítulo Institucional</label>
                  <input
                    id="input-clinic-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ</label>
                  <input
                    id="input-clinic-cnpj"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diretor Técnico Médico</label>
                  <input
                    id="input-clinic-director"
                    type="text"
                    value={technicalDirector}
                    onChange={(e) => setTechnicalDirector(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CRM do Diretor Técnico</label>
                  <input
                    id="input-clinic-crm"
                    type="text"
                    value={technicalDirectorCrm}
                    onChange={(e) => setTechnicalDirectorCrm(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone Principal</label>
                  <input
                    id="input-clinic-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp de Atendimento</label>
                  <input
                    id="input-clinic-whatsapp"
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Institucional</label>
                  <input
                    id="input-clinic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instagram Oficial</label>
                  <input
                    id="input-clinic-instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
                  <input
                    id="input-clinic-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Texto do Rodapé dos Documentos (Receitas, Atestados, TCLE)
                </label>
                <textarea
                  id="input-clinic-footer-message"
                  rows={3}
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                  placeholder="Ex: Centro Médico Plennus — Excelência em Saúde Integrada e Longevidade. Documento auditado conforme LGPD e resoluções do CFM."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition resize-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Esta mensagem aparecerá centralizada na base de todos os documentos gerados e impressos pelo sistema.
                </span>
              </div>

              {canEdit && (
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    id="btn-save-clinic-identity"
                    type="submit"
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-200 transition flex items-center gap-2 text-xs"
                  >
                    <Save className="w-4 h-4" /> SALVAR ALTERAÇÕES
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB: PERSONALIZAÇÃO VISUAL */}
      {activeTab === 'personalizacao' && (
        <VisualBrandingSection />
      )}

      {/* TAB 2: CORPO CLÍNICO & COLABORADORES */}
      {activeTab === 'usuarios' && (
        <StaffManagementTab />
      )}

      {/* TAB: TIPOS DE ATENDIMENTOS / PROCEDIMENTOS */}
      {activeTab === 'procedimentos' && (
        <ProcedureTypesTab />
      )}

      {/* TAB: TERMOS DE CONSENTIMENTO (TCLE) */}
      {activeTab === 'termos' && (
        <ConsentTemplatesSettingsTab />
      )}

      {/* TAB 3: SOD MATRIX */}
      {activeTab === 'sod' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Matriz de Segregação de Funções (SoD & LGPD)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Garantia de que dados clínicos (PEP, receitas, evolução) são acessados exclusivamente por profissionais de saúde habilitados, enquanto dados de caixa e faturamento são restritos à administração e financeiro.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Médico</th>
                  <th className="p-3">Nutricionista</th>
                  <th className="p-3">Enfermeiro</th>
                  <th className="p-3">Recepção</th>
                  <th className="p-3">Financeiro</th>
                  <th className="p-3">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-bold text-slate-900">PEP / Prontuário Médico</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-amber-600 font-bold">Visualização</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Agenda & Fila de Espera</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-amber-600 font-bold">Visualização</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Enfermagem & Triagem</td>
                  <td className="p-3 text-amber-600 font-bold">Visualização</td>
                  <td className="p-3 text-amber-600 font-bold">Visualização</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Caixa & Financeiro</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-rose-500 font-bold">Bloqueado</td>
                  <td className="p-3 text-emerald-600 font-bold">Lançamentos</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                  <td className="p-3 text-emerald-600 font-bold">Total</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Registro Imutável de Eventos & Auditoria ({auditLogs.length})
            </h3>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">LGPD Compliance</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-mono">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-400">Usuário: {log.userName} ({log.role})</p>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
