import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProcedureTypeItem } from '../../types';
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

export const ProcedureTypesTab: React.FC = () => {
  const {
    procedureTypes,
    addProcedureType,
    updateProcedureType,
    deleteProcedureType,
    hasPermission,
    showToast,
  } = useApp();

  const canEdit = hasPermission('configuracoes', 'edit');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcedureTypeItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcedureTypeItem['category']>('Consulta');
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(30);
  const [defaultPrice, setDefaultPrice] = useState(250);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Consulta');
    setDefaultDurationMinutes(30);
    setDefaultPrice(250);
    setDescription('');
    setStatus('ativo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProcedureTypeItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setDefaultDurationMinutes(item.estimatedDurationMinutes || 30);
    setDefaultPrice(item.defaultPrice || 0);
    setDescription(item.description || '');
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome do atendimento/procedimento.', 'error');
      return;
    }

    if (editingItem) {
      updateProcedureType(editingItem.id, {
        name: name.trim(),
        category,
        estimatedDurationMinutes: Number(defaultDurationMinutes),
        defaultPrice: Number(defaultPrice),
        description: description.trim(),
        status,
      });
    } else {
      addProcedureType({
        name: name.trim(),
        category,
        estimatedDurationMinutes: Number(defaultDurationMinutes),
        defaultPrice: Number(defaultPrice),
        description: description.trim(),
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProcedureType(id);
    setDeleteConfirmId(null);
  };

  const filteredItems = procedureTypes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categoryBadges: Record<ProcedureTypeItem['category'], { bg: string; text: string }> = {
    Consulta: { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'Consulta Médica' },
    Procedimento: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'Procedimento' },
    Injetável: { bg: 'bg-teal-50 text-teal-800 border-teal-200', text: 'Injetável / Terapia' },
    Estético: { bg: 'bg-purple-50 text-purple-800 border-purple-200', text: 'Estética Avançada' },
    Protocolo: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'Protocolo Integrativo' },
    Exame: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', text: 'Exame Diagnóstico' },
    Outros: { bg: 'bg-slate-50 text-slate-800 border-slate-200', text: 'Outros' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Tipos de Atendimentos & Procedimentos Clínicos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre novos tipos de atendimentos, procedimentos, injetáveis, consultas e exames com duração padrão e precificação base.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Tipo de Atendimento
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tipo de atendimento por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Consulta">Consultas</option>
              <option value="Procedimento">Procedimentos</option>
              <option value="Injetável">Injetáveis / Soroterapia</option>
              <option value="Estético">Estéticos</option>
              <option value="Protocolo">Protocolos</option>
              <option value="Exame">Exames</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Procedures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const badge = categoryBadges[item.category] || categoryBadges.Outros;
          const isAtivo = item.status === 'ativo';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                isAtivo ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 bg-slate-50/60 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${badge.bg}`}>
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isAtivo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isAtivo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.estimatedDurationMinutes || 30} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold justify-end">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>R$ {(item.defaultPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar atendimento"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir tipo de atendimento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-sm text-slate-700">Nenhum atendimento encontrado</p>
          <p className="text-xs">Clique no botão "Novo Tipo de Atendimento" para cadastrar.</p>
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Editar Tipo de Atendimento' : 'Novo Tipo de Atendimento / Procedimento'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Atendimento / Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Consulta Integrativa, Aplicação de Ozonioterapia, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Procedimento">Procedimento</option>
                    <option value="Injetável">Injetável / Terapia</option>
                    <option value="Estético">Estético</option>
                    <option value="Protocolo">Protocolo</option>
                    <option value="Exame">Exame</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="ativo">Ativo (Habilitado)</option>
                    <option value="inativo">Inativo (Desabilitado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duração Padrão (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={defaultDurationMinutes}
                    onChange={(e) => setDefaultDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Base (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição / Orientações do Atendimento
                </label>
                <textarea
                  rows={3}
                  placeholder="Instruções de preparo, tempo de repouso ou detalhes clínicos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Excluir Tipo de Atendimento?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação removerá este tipo de procedimento dos cadastros do sistema. Deseja continuar?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
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
