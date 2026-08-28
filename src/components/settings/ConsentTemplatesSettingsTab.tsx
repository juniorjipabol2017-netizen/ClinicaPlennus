import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsentTermTemplate, ConsentTreatmentCategory } from '../../types';
import {
  FileText,
  Plus,
  Edit,
  Copy,
  History,
  CheckCircle2,
  XCircle,
  Search,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
  Trash2,
  Layers,
} from 'lucide-react';

export const ConsentTemplatesSettingsTab: React.FC = () => {
  const {
    consentTemplates,
    addConsentTemplate,
    updateConsentTemplate,
    duplicateConsentTemplate,
    createNewTemplateVersion,
    toggleConsentTemplateStatus,
    hasPermission,
    showToast,
  } = useApp();

  const canEdit = hasPermission('configuracoes', 'edit');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [currentTemplate, setCurrentTemplate] = useState<ConsentTermTemplate | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ConsentTreatmentCategory | string>('Aplicação de medicação');
  const [formText, setFormText] = useState('');
  const [formDeclarations, setFormDeclarations] = useState<string[]>([
    'Declaro que li e compreendi as informações apresentadas.',
    'Declaro que tive a oportunidade de esclarecer dúvidas com o profissional.',
    'Declaro que autorizo a realização do procedimento descrito.',
  ]);
  const [newDeclarationInput, setNewDeclarationInput] = useState('');
  const [formMandatory, setFormMandatory] = useState(true);
  const [formRecurrence, setFormRecurrence] = useState<ConsentTermTemplate['recurrence']>('once');

  // Form state for New Version
  const [newVersionText, setNewVersionText] = useState('');

  const categories: ConsentTreatmentCategory[] = [
    'Aplicação de medicação',
    'Tratamento de emagrecimento',
    'Reposição hormonal',
    'Procedimentos estéticos',
    'Aplicações intramusculares',
    'Procedimentos médicos',
    'Exames/procedimentos',
    'Outros tratamentos',
  ];

  const filteredTemplates = consentTemplates.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.treatmentCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.treatmentCategory === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const openCreateModal = () => {
    setFormName('');
    setFormCategory('Aplicação de medicação');
    setFormText('');
    setFormDeclarations([
      'Declaro que li e compreendi integralmente as informações apresentadas neste termo.',
      'Declaro que tive oportunidade de esclarecer todas as dúvidas com o profissional de saúde.',
      'Declaro que fui informado(a) sobre riscos, benefícios e cuidados recomendados.',
      'Declaro que autorizo expressamente a realização do procedimento.',
    ]);
    setFormMandatory(true);
    setFormRecurrence('once');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (tpl: ConsentTermTemplate) => {
    setCurrentTemplate(tpl);
    setFormName(tpl.name);
    setFormCategory(tpl.treatmentCategory);
    setFormText(tpl.fullText);
    setFormDeclarations([...tpl.requiredDeclarations]);
    setFormMandatory(tpl.mandatoryForProcedure);
    setFormRecurrence(tpl.recurrence);
    setIsEditModalOpen(true);
  };

  const openNewVersionModal = (tpl: ConsentTermTemplate) => {
    setCurrentTemplate(tpl);
    setNewVersionText(tpl.fullText);
    setIsNewVersionModalOpen(true);
  };

  const openHistoryModal = (tpl: ConsentTermTemplate) => {
    setCurrentTemplate(tpl);
    setIsHistoryModalOpen(true);
  };

  const handleAddDeclaration = () => {
    if (!newDeclarationInput.trim()) return;
    setFormDeclarations((prev) => [...prev, newDeclarationInput.trim()]);
    setNewDeclarationInput('');
  };

  const handleRemoveDeclaration = (index: number) => {
    setFormDeclarations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      showToast('Preencha o nome e o texto do termo.', 'error');
      return;
    }

    addConsentTemplate({
      name: formName.trim(),
      treatmentCategory: formCategory,
      fullText: formText.trim(),
      requiredDeclarations: formDeclarations,
      requiresDoctorSignature: true,
      mandatoryForProcedure: formMandatory,
      recurrence: formRecurrence,
      version: '1.0',
      status: 'ativo',
    });

    setIsCreateModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    updateConsentTemplate(currentTemplate.id, {
      name: formName.trim(),
      treatmentCategory: formCategory,
      requiredDeclarations: formDeclarations,
      mandatoryForProcedure: formMandatory,
      recurrence: formRecurrence,
    });

    setIsEditModalOpen(false);
  };

  const handleSaveNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate || !newVersionText.trim()) return;

    createNewTemplateVersion(currentTemplate.id, newVersionText.trim());
    setIsNewVersionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
              Biblioteca de TCLE
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Regra de Imutabilidade Ativa</span>
          </div>
          <h2 className="text-lg font-bold font-serif-luxury text-slate-900">
            Modelos de Termos de Consentimento Livre e Esclarecido
          </h2>
          <p className="text-xs text-slate-500">
            Crie, versione e gerencie os termos de consentimento utilizados na assinatura pelo tablet.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Modelo de Termo
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar modelo de termo por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => {
          const hasHistory = (tpl.previousVersions && tpl.previousVersions.length > 0);

          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-2xs space-y-4 flex flex-col justify-between ${
                tpl.status === 'ativo' ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-lg border border-indigo-100">
                        {tpl.treatmentCategory}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        v{tpl.version}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                      {tpl.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tpl.status === 'ativo'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-serif-luxury">
                  {tpl.fullText}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>
                    <span className="font-medium text-slate-700">Declarações: </span>
                    <span>{tpl.requiredDeclarations.length} obrigatórias</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Exige Termo: </span>
                    <span className={tpl.mandatoryForProcedure ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                      {tpl.mandatoryForProcedure ? 'Sim (Bloqueante)' : 'Opcional'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Recorrência: </span>
                    <span>
                      {tpl.recurrence === 'once'
                        ? 'Assinatura Única'
                        : tpl.recurrence === 'annual'
                        ? 'Anual'
                        : 'A cada procedimento'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Versões Anteriores: </span>
                    <span>{tpl.previousVersions?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => openNewVersionModal(tpl)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        title="Criar nova versão com texto atualizado (arquiva a versão anterior imutavelmente)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Nova Versão
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(tpl)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Editar Detalhes"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => duplicateConsentTemplate(tpl.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Duplicar Termo"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {hasHistory && (
                    <button
                      type="button"
                      onClick={() => openHistoryModal(tpl)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                      title="Ver Histórico de Versões"
                    >
                      <History className="w-3.5 h-3.5" />
                      Versões ({tpl.previousVersions?.length})
                    </button>
                  )}
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => toggleConsentTemplateStatus(tpl.id)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      tpl.status === 'ativo'
                        ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {tpl.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Template */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold font-serif-luxury text-slate-900">
                Criar Novo Modelo de Termo de Consentimento
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Termo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Termo de Consentimento Livre e Esclarecido — Terapia Injetável"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tratamento / Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recorrência da Assinatura</label>
                  <select
                    value={formRecurrence}
                    onChange={(e) => setFormRecurrence(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="once">Assinatura Única (Válida para sempre)</option>
                    <option value="annual">Anual (Renovar a cada 365 dias)</option>
                    <option value="every_procedure">A cada procedimento</option>
                    <option value="version_change">Sempre que houver nova versão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texto Completo do Termo</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Insira o texto legal completo, esclarecendo os objetivos, riscos, benefícios e diretrizes do procedimento..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed font-serif-luxury"
                />
              </div>

              {/* Declarations list */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Declarações Obrigatórias de Ciência (Checkboxes)</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {formDeclarations.map((dec, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-700">{dec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeclaration(i)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar nova declaração obrigatória..."
                    value={newDeclarationInput}
                    onChange={(e) => setNewDeclarationInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeclaration}
                    className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="mandatoryCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Exigir obrigatoriamente este termo antes da execução do procedimento (Bloqueio se pendente)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  Salvar Modelo de Termo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Template Metadata */}
      {isEditModalOpen && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-slate-900">
                  Editar Detalhes do Modelo
                </h3>
                <p className="text-[11px] text-amber-700 font-medium">
                  Para alterar o texto do termo, utilize a função "Nova Versão" para preservar a integridade jurídica.
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Termo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tratamento / Categoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recorrência</label>
                <select
                  value={formRecurrence}
                  onChange={(e) => setFormRecurrence(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  <option value="once">Assinatura Única</option>
                  <option value="annual">Anual</option>
                  <option value="every_procedure">A cada procedimento</option>
                  <option value="version_change">Sempre que houver nova versão</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mandatoryCheckEdit"
                  checked={formMandatory}
                  onChange={(e) => setFormMandatory(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="mandatoryCheckEdit" className="font-semibold text-slate-700 cursor-pointer">
                  Exigir obrigatoriamente este termo antes do procedimento
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Immutable Version */}
      {isNewVersionModalOpen && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">
                    Regra de Imutabilidade
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Versão Atual: v{currentTemplate.version} → Nova: v{(parseFloat(currentTemplate.version) + 1.0).toFixed(1)}
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif-luxury text-slate-900 mt-1">
                  Criar Nova Versão de "{currentTemplate.name}"
                </h3>
              </div>
              <button onClick={() => setIsNewVersionModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Garantia de Não Retroatividade:</strong> A versão anterior (v{currentTemplate.version}) será arquivada permanentemente. Os termos já assinados por pacientes no passado permanecerão inalterados vinculados à versão em que foram assinados.
              </div>
            </div>

            <form onSubmit={handleSaveNewVersion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Novo Texto do Termo (Versão {(parseFloat(currentTemplate.version) + 1.0).toFixed(1)}):
                </label>
                <textarea
                  rows={8}
                  required
                  value={newVersionText}
                  onChange={(e) => setNewVersionText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed font-serif-luxury"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewVersionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Publicar Nova Versão v{(parseFloat(currentTemplate.version) + 1.0).toFixed(1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Version History Drawer */}
      {isHistoryModalOpen && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-slate-900">
                  Histórico de Versões do Termo
                </h3>
                <p className="text-xs text-slate-500">{currentTemplate.name}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">Versão Atual: v{currentTemplate.version}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Ativa
                  </span>
                </div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-serif-luxury text-[11px]">
                  {currentTemplate.fullText}
                </p>
              </div>

              {currentTemplate.previousVersions?.map((pv, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Versão Arquivada: v{pv.version}</span>
                    <span className="text-[10px] text-slate-500">
                      Arquivada em {new Date(pv.updatedAt).toLocaleDateString('pt-BR')} por {pv.updatedBy}
                    </span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-serif-luxury text-[11px]">
                    {pv.fullText}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
