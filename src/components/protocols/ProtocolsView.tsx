import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IntelligentProtocol, ProtocolAssignment } from '../../types';
import {
  Sparkles,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  Edit2,
  Copy,
  Trash2,
  AlertTriangle,
  FileText,
  Syringe,
  Home,
  Check,
} from 'lucide-react';

export const ProtocolsView: React.FC = () => {
  const {
    intelligentProtocols,
    protocolAssignments,
    patients,
    users,
    assignProtocolToPatient,
    addProtocolEvolutionNote,
    updateProtocolAssignment,
    deleteProtocolAssignment,
    addIntelligentProtocol,
    updateIntelligentProtocol,
    duplicateIntelligentProtocol,
    deleteIntelligentProtocol,
    currentUser,
    showToast,
    hasPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ativos' | 'modelos'>('ativos');

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedProtocolId, setSelectedProtocolId] = useState(intelligentProtocols[0]?.id || '');
  const [customGoal, setCustomGoal] = useState('');

  // Protocol Template Modal (Create / Edit)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IntelligentProtocol | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState<'Emagrecimento' | 'Longevidade' | 'Performance' | 'Injetáveis' | 'Personalizado'>('Emagrecimento');
  const [tplDescription, setTplDescription] = useState('');
  const [tplObjective, setTplObjective] = useState('');
  const [tplTotalSessions, setTplTotalSessions] = useState(6);
  const [tplSteps, setTplSteps] = useState<Array<{ stepNumber: number; title: string; description: string; durationWeeks: number }>>([
    { stepNumber: 1, title: 'Fase de Indução', description: 'Desintoxicação metabólica e aplicação semanal.', durationWeeks: 2 },
    { stepNumber: 2, title: 'Fase de Otimização', description: 'Ajuste posológico e aceleração metabólica.', durationWeeks: 4 },
  ]);
  const [tplHomeCare, setTplHomeCare] = useState<string[]>(['Ingestão hídrica de 35ml/kg/dia', 'Sono regular de 7-8h']);
  const [tplInjectablePrescription, setTplInjectablePrescription] = useState('');

  // Deletion Modals
  const [templateToDelete, setTemplateToDelete] = useState<IntelligentProtocol | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ProtocolAssignment | null>(null);

  const canEdit = hasPermission('protocolos', 'edit');

  const handleAssignProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    const protocol = intelligentProtocols.find((t) => t.id === selectedProtocolId);

    if (!patient || !protocol) {
      showToast('Selecione o paciente e o protocolo.', 'error');
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);

    assignProtocolToPatient({
      protocolId: protocol.id,
      protocolName: protocol.name,
      patientId: patient.id,
      patientName: patient.name,
      startDate: todayStr,
      currentStep: 1,
      totalSteps: protocol.steps.length,
      completedSessions: 0,
      totalSessions: protocol.totalSessions,
      nextSessionDate: '2026-09-03',
      status: 'Em andamento',
      prescribedBy: currentUser.name,
      evolutionNotes: [
        {
          date: todayStr,
          note: `Início do protocolo clínico. Meta: ${customGoal || protocol.objective}`,
          author: currentUser.name,
        },
      ],
    });

    setIsAssignModalOpen(false);
    showToast(`Protocolo ${protocol.name} iniciado para ${patient.name}!`);
  };

  const openCreateTemplateModal = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplCategory('Emagrecimento');
    setTplDescription('');
    setTplObjective('');
    setTplTotalSessions(6);
    setTplSteps([
      { stepNumber: 1, title: 'Fase Inicial / Desintoxicação', description: 'Adequação metabólica e primeira sessão.', durationWeeks: 2 },
      { stepNumber: 2, title: 'Fase Ativa / Consolidação', description: 'Sessões semanais e monitoramento de resposta.', durationWeeks: 4 },
    ]);
    setTplHomeCare(['Ingestão de 2 a 3 litros de água por dia', 'Prática orientada de atividade física']);
    setTplInjectablePrescription('');
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (tpl: IntelligentProtocol) => {
    setEditingTemplate(tpl);
    setTplName(tpl.name);
    setTplCategory(tpl.category);
    setTplDescription(tpl.description);
    setTplObjective(tpl.objective);
    setTplTotalSessions(tpl.totalSessions);
    setTplSteps(tpl.steps ? [...tpl.steps] : []);
    setTplHomeCare(tpl.homeCareRecommendations ? [...tpl.homeCareRecommendations] : []);
    setTplInjectablePrescription(tpl.injectablePrescription || '');
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      showToast('Informe o nome do protocolo.', 'error');
      return;
    }

    if (editingTemplate) {
      updateIntelligentProtocol(editingTemplate.id, {
        name: tplName,
        category: tplCategory,
        description: tplDescription,
        objective: tplObjective,
        totalSessions: Number(tplTotalSessions),
        steps: tplSteps,
        homeCareRecommendations: tplHomeCare.filter((h) => h.trim() !== ''),
        injectablePrescription: tplInjectablePrescription,
      });
      showToast('Modelo de protocolo atualizado com sucesso!');
    } else {
      addIntelligentProtocol({
        name: tplName,
        category: tplCategory,
        description: tplDescription,
        objective: tplObjective,
        totalSessions: Number(tplTotalSessions),
        steps: tplSteps,
        homeCareRecommendations: tplHomeCare.filter((h) => h.trim() !== ''),
        injectablePrescription: tplInjectablePrescription,
      });
      showToast('Novo modelo de protocolo criado!');
    }

    setIsTemplateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Protocolos Clínicos Inteligentes
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhamento estruturado: Emagrecimento, Longevidade, Performance e Terapia Injetável.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {activeTab === 'modelos' ? (
              <button
                id="btn-new-protocol-template"
                onClick={openCreateTemplateModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Novo Modelo de Protocolo
              </button>
            ) : (
              <button
                id="btn-start-patient-protocol"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Iniciar Protocolo para Paciente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-protocols-active"
          onClick={() => setActiveTab('ativos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'ativos'
              ? 'bg-purple-100 text-purple-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Pacientes em Acompanhamento ({protocolAssignments.length})
        </button>

        <button
          id="tab-protocols-templates"
          onClick={() => setActiveTab('modelos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'modelos'
              ? 'bg-purple-100 text-purple-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Modelos de Protocolos Clínicos ({intelligentProtocols.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE PATIENTS */}
      {activeTab === 'ativos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocolAssignments.map((assign) => {
            const progressPct = Math.round((assign.completedSessions / Math.max(1, assign.totalSessions)) * 100);
            return (
              <div
                key={assign.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {assign.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{assign.patientName}</h3>
                      <p className="text-xs font-bold text-purple-800">{assign.protocolName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-900 font-mono">{progressPct}%</span>
                      <p className="text-[10px] text-slate-400">Progresso total</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Goals stats */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sessões</span>
                      <span className="font-bold text-slate-800">{assign.completedSessions} de {assign.totalSessions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Início</span>
                      <span className="font-bold text-slate-800">{assign.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Próxima Sessão</span>
                      <span className="font-bold text-purple-700">{assign.nextSessionDate}</span>
                    </div>
                  </div>

                  {assign.evolutionNotes.length > 0 && (
                    <p className="text-[11px] text-slate-600 italic bg-purple-50/50 p-2 rounded-lg">
                      Última evolução: {assign.evolutionNotes[assign.evolutionNotes.length - 1].note}
                    </p>
                  )}
                </div>

                {/* Session Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Etapa {assign.currentStep} de {assign.totalSteps}</span>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => setAssignmentToDelete(assign)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remover acompanhamento deste paciente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {canEdit && assign.completedSessions < assign.totalSessions && (
                      <button
                        onClick={() => {
                          const nextCompleted = assign.completedSessions + 1;
                          updateProtocolAssignment(assign.id, {
                            completedSessions: nextCompleted,
                            currentStep: Math.min(assign.totalSteps, assign.currentStep + 1),
                          });
                          addProtocolEvolutionNote(assign.id, `Sessão ${nextCompleted} realizada com sucesso.`);
                          showToast('Sessão registrada e progresso atualizado!');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registrar Sessão
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'modelos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {intelligentProtocols.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {template.category}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{template.totalSessions} sessões</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                </div>

                {template.objective && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Objetivo Clínico:</span>
                    <p className="text-slate-700 font-medium">{template.objective}</p>
                  </div>
                )}

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Etapas Clínicas ({template.steps.length}):</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {template.steps.map((step) => (
                      <div key={step.stepNumber} className="p-2 bg-slate-50 rounded-lg text-xs">
                        <p className="font-bold text-slate-800">
                          {step.stepNumber}. {step.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template Action Buttons */}
              {canEdit && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                  <button
                    onClick={() => openEditTemplateModal(template)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-semibold"
                    title="Editar modelo"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateIntelligentProtocol(template.id)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title="Duplicar modelo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTemplateToDelete(template)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir modelo de protocolo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Prescrever Protocolo Clínico
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAssignProtocol} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Modelo de Protocolo *</label>
                <select
                  required
                  value={selectedProtocolId}
                  onChange={(e) => setSelectedProtocolId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {intelligentProtocols.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.totalSessions} sessões)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Objetivos Específicos & Recomendações</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Redução de 8kg de massa gorda, melhora da disposição e perfil lipídico..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
                >
                  Iniciar Protocolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Protocol Template Create / Edit Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {editingTemplate ? 'Editar Modelo de Protocolo' : 'Novo Modelo de Protocolo Clínico'}
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nome do Protocolo *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Protocolo Plennus Slim 60D"
                    value={tplName}
                    onChange={(e) => setTplName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={tplCategory}
                    onChange={(e) => setTplCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Longevidade">Longevidade</option>
                    <option value="Performance">Performance</option>
                    <option value="Injetáveis">Injetáveis</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Comercial & Resumo</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Programa integrativo com reposição de nutrientes e foco em perda ponderal segura..."
                  value={tplDescription}
                  onChange={(e) => setTplDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Objetivo Clínico Padrão</label>
                  <input
                    type="text"
                    placeholder="Ex: Redução de gordura visceral e melhora da sensibilidade à insulina"
                    value={tplObjective}
                    onChange={(e) => setTplObjective(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total de Sessões</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tplTotalSessions}
                    onChange={(e) => setTplTotalSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Etapas / Steps Editor */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Fases e Etapas Clínicas:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = tplSteps.length + 1;
                      setTplSteps([...tplSteps, { stepNumber: nextNum, title: `Fase ${nextNum}`, description: '', durationWeeks: 2 }]);
                    }}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] transition"
                  >
                    + Adicionar Fase
                  </button>
                </div>

                <div className="space-y-2">
                  {tplSteps.map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700">Fase #{step.stepNumber}</span>
                        {tplSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTplSteps(tplSteps.filter((_, i) => i !== idx).map((s, n) => ({ ...s, stepNumber: n + 1 })))}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                          >
                            ✕ Remover
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Título da Fase (Ex: Indução)"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...tplSteps];
                            updated[idx].title = e.target.value;
                            setTplSteps(updated);
                          }}
                          className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Semanas"
                          value={step.durationWeeks}
                          onChange={(e) => {
                            const updated = [...tplSteps];
                            updated[idx].durationWeeks = Number(e.target.value);
                            setTplSteps(updated);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Descrição da conduta nesta fase..."
                        value={step.description}
                        onChange={(e) => {
                          const updated = [...tplSteps];
                          updated[idx].description = e.target.value;
                          setTplSteps(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recomendações Home Care (separadas por linha)</label>
                <textarea
                  rows={2}
                  value={tplHomeCare.join('\n')}
                  onChange={(e) => setTplHomeCare(e.target.value.split('\n'))}
                  placeholder="Ex: Hidratação 35ml/kg&#10;Evitar açúcares refinados"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
                >
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Protocol Template */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Excluir Modelo de Protocolo
              </h3>
              <button onClick={() => setTemplateToDelete(null)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1 text-rose-900">
                <p className="font-bold">Aviso sobre protocolos já em andamento:</p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  A exclusão removerá <strong>SOMENTE o modelo</strong> selecionado (<strong>{templateToDelete.name}</strong>). Os protocolos que já foram iniciados para pacientes anteriormente permanecerão intactos em seus prontuários.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTemplateToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteIntelligentProtocol(templateToDelete.id);
                    setTemplateToDelete(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Protocol Assignment */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Cancelar Acompanhamento do Paciente
              </h3>
              <button onClick={() => setAssignmentToDelete(null)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                <p className="text-[11px] leading-relaxed">
                  Deseja remover o acompanhamento do protocolo <strong>{assignmentToDelete.protocolName}</strong> para o paciente <strong>{assignmentToDelete.patientName}</strong>?
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignmentToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProtocolAssignment(assignmentToDelete.id);
                    setAssignmentToDelete(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Remover Acompanhamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
