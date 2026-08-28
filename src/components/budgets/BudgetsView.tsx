import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, TreatmentPackage, BudgetItem } from '../../types';
import {
  ScrollText,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  DollarSign,
  User,
  Sparkles,
  Edit2,
  Copy,
  AlertTriangle,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { PrintableDocument } from '../common/PrintableDocument';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    treatmentPackages,
    patients,
    currentUser,
    addBudget,
    updateBudgetStatus,
    deleteBudget,
    addTreatmentPackage,
    updateTreatmentPackage,
    duplicateTreatmentPackage,
    deleteTreatmentPackage,
    hasPermission,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orcamentos' | 'pacotes'>('orcamentos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printBudgetData, setPrintBudgetData] = useState<Budget | null>(null);

  // Budget Deletion state
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetDeleteReason, setBudgetDeleteReason] = useState('');

  // Package Modal (Create / Edit) state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TreatmentPackage | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgCategory, setPkgCategory] = useState<'Emagrecimento' | 'Longevidade' | 'Estética' | 'Performance' | 'Injetáveis'>('Emagrecimento');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgPrice, setPkgPrice] = useState(1500);
  const [pkgTotalSessions, setPkgTotalSessions] = useState(4);
  const [pkgValidityDays, setPkgValidityDays] = useState(60);
  const [pkgIncludedItems, setPkgIncludedItems] = useState<string[]>([
    '4x Aplicações Intramusculares',
    '1x Bioimpedância InBody 770',
    '1x Consulta de Retorno',
  ]);

  // Package Deletion state
  const [packageToDelete, setPackageToDelete] = useState<TreatmentPackage | null>(null);

  // Budget form state
  const [patientId, setPatientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<Budget['paymentMethod']>('Cartão de Crédito');
  const [validDays, setValidDays] = useState(15);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([
    {
      id: 'it-1',
      type: 'Procedimento',
      description: 'Consulta Médica Integrativa + Bioimpedância InBody',
      unitPrice: 550,
      quantity: 1,
      totalPrice: 550,
    },
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(300);
  const [newItemQty, setNewItemQty] = useState(1);

  const canEdit = hasPermission('orcamentos', 'edit');

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const handleAddItem = () => {
    if (!newItemDesc.trim() || newItemPrice <= 0) return;
    const newItem: BudgetItem = {
      id: 'it-' + Date.now(),
      type: 'Procedimento',
      description: newItemDesc,
      unitPrice: newItemPrice,
      quantity: newItemQty,
      totalPrice: newItemPrice * newItemQty,
    };
    setItems([...items, newItem]);
    setNewItemDesc('');
    setNewItemPrice(300);
    setNewItemQty(1);
  };

  const handleAddPackageToBudget = (pkg: TreatmentPackage) => {
    const pkgItem: BudgetItem = {
      id: 'pkg-it-' + Date.now(),
      type: 'Pacote',
      description: `PACOTE: ${pkg.name} (${pkg.totalSessions} sessões)`,
      unitPrice: pkg.price,
      quantity: 1,
      totalPrice: pkg.price,
    };
    setItems([...items, pkgItem]);
    showToast(`Pacote "${pkg.name}" adicionado à proposta!`);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast('Selecione um paciente.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Adicione pelo menos um item à proposta.', 'error');
      return;
    }

    const today = new Date();
    const validUntilDate = new Date(today);
    validUntilDate.setDate(today.getDate() + validDays);

    addBudget({
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      patientPhone: patient.phone,
      items,
      subtotal,
      discount,
      finalValue: finalTotal,
      paymentMethod,
      validUntil: validUntilDate.toISOString().substring(0, 10),
      notes,
    });

    setIsModalOpen(false);
    showToast(`Orçamento criado para ${patient.name}!`);
  };

  // Package Create / Edit Handlers
  const openCreatePackageModal = () => {
    setEditingPackage(null);
    setPkgName('');
    setPkgCategory('Emagrecimento');
    setPkgDescription('');
    setPkgPrice(1500);
    setPkgTotalSessions(4);
    setPkgValidityDays(60);
    setPkgIncludedItems(['4x Sessões do Tratamento', '1x Avaliação de Bioimpedância']);
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg: TreatmentPackage) => {
    setEditingPackage(pkg);
    setPkgName(pkg.name);
    setPkgCategory(pkg.category as any || 'Emagrecimento');
    setPkgDescription(pkg.description);
    setPkgPrice(pkg.price);
    setPkgTotalSessions(pkg.totalSessions);
    setPkgValidityDays(pkg.validityDays);
    setPkgIncludedItems(pkg.procedures ? [...pkg.procedures] : ['Sessões clínicas inclusas']);
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      showToast('Informe o nome do pacote.', 'error');
      return;
    }

    if (editingPackage) {
      updateTreatmentPackage(editingPackage.id, {
        name: pkgName,
        category: pkgCategory,
        description: pkgDescription,
        price: Number(pkgPrice),
        totalSessions: Number(pkgTotalSessions),
        validityDays: Number(pkgValidityDays),
        procedures: pkgIncludedItems.filter((i) => i.trim() !== ''),
      });
      showToast('Pacote de tratamento atualizado!');
    } else {
      addTreatmentPackage({
        name: pkgName,
        category: pkgCategory,
        description: pkgDescription,
        price: Number(pkgPrice),
        totalSessions: Number(pkgTotalSessions),
        validityDays: Number(pkgValidityDays),
        procedures: pkgIncludedItems.filter((i) => i.trim() !== ''),
        status: 'ativo',
      });
      showToast('Novo pacote de tratamento cadastrado!');
    }

    setIsPackageModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Orçamentos & Pacientes Prontos
          </h1>
          <p className="text-xs text-slate-500">
            Propostas de tratamentos de alto padrão e pacotes pré-formatados.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {activeTab === 'pacotes' ? (
              <button
                id="btn-new-treatment-package"
                onClick={openCreatePackageModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Novo Pacote de Tratamento
              </button>
            ) : (
              <button
                id="btn-new-budget"
                onClick={() => {
                  setItems([
                    {
                      id: 'it-1',
                      type: 'Procedimento',
                      description: 'Consulta Médica Integrativa + Bioimpedância',
                      unitPrice: 550,
                      quantity: 1,
                      totalPrice: 550,
                    },
                  ]);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Elaborar Nova Proposta
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-budgets-list"
          onClick={() => setActiveTab('orcamentos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'orcamentos'
              ? 'bg-amber-100 text-amber-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Propostas & Orçamentos Emitidos ({budgets.length})
        </button>

        <button
          id="tab-budgets-packages"
          onClick={() => setActiveTab('pacotes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'pacotes'
              ? 'bg-amber-100 text-amber-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Catálogo de Pacotes Prontos ({treatmentPackages.length})
        </button>
      </div>

      {/* TAB 1: BUDGETS */}
      {activeTab === 'orcamentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        b.status === 'Aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Recusado'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{b.patientName}</h3>
                    <p className="text-xs text-slate-400">CPF: {b.patientCpf} • Emitido em {b.createdAt}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-700 font-mono">
                      R$ {b.finalValue.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400">Válido até {b.validUntil}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50/50 text-xs">
                  {b.items.map((it) => (
                    <div key={it.id} className="py-1.5 flex justify-between">
                      <span className="text-slate-700">
                        {it.quantity}x {it.description}
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">R$ {it.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500">
                  Forma de Pagamento: <strong>{b.paymentMethod}</strong>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setPrintBudgetData(b)}
                  className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Proposta
                </button>

                <div className="flex items-center gap-2">
                  {b.status === 'Aguardando aprovação' && canEdit && (
                    <button
                      onClick={() => {
                        updateBudgetStatus(b.id, 'Aprovado');
                        showToast('Orçamento aprovado pelo paciente!');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition"
                    >
                      Aprovar Proposta
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => {
                        setBudgetToDelete(b);
                        setBudgetDeleteReason('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === 'pacotes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {treatmentPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {pkg.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{pkg.totalSessions} Sessões</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                </div>

                {pkg.procedures && pkg.procedures.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itens Inclusos:</p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {pkg.procedures.map((proc, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{proc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-emerald-700 font-mono">
                      R$ {pkg.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">Validade: {pkg.validityDays} dias</span>
                  </div>
                </div>
              </div>

              {/* Package Card Actions */}
              {canEdit && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                  <button
                    onClick={() => openEditPackageModal(pkg)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-semibold"
                    title="Editar pacote"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateTreatmentPackage(pkg.id)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title="Duplicar pacote"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPackageToDelete(pkg)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir pacote"
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

      {/* Modal New Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-amber-400" /> Elaborar Orçamento & Proposta de Tratamento
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBudget} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              {/* Quick Packages Import */}
              {treatmentPackages.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> Adicionar Pacote Pronto à Proposta:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {treatmentPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handleAddPackageToBudget(pkg)}
                        className="px-2.5 py-1 bg-white border border-amber-300 hover:border-amber-500 rounded-lg text-amber-900 font-semibold text-[11px] shadow-2xs transition flex items-center gap-1"
                      >
                        <span>+ {pkg.name}</span>
                        <span className="font-mono font-bold text-emerald-700">R$ {pkg.price.toFixed(0)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Addition Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">Adicionar Procedimento ou Item Avulso</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição do serviço / ampola / sessão..."
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Preço (R$)"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                    >
                      + Incluir Item
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 pt-2">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                      <span>{it.quantity}x {it.description}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono">R$ {it.totalPrice.toFixed(2)}</span>
                        <button type="button" onClick={() => handleRemoveItem(it.id)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desconto Especial (R$)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Parcelado">Parcelado</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800">Subtotal: R$ {subtotal.toFixed(2)} | Desconto: R$ {discount.toFixed(2)}</span>
                  <p className="font-bold text-emerald-950 text-base">Total da Proposta:</p>
                </div>
                <span className="text-2xl font-bold text-emerald-700 font-mono">
                  R$ {finalTotal.toFixed(2)}
                </span>
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
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Create / Edit Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-6 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                {editingPackage ? 'Editar Pacote de Tratamento' : 'Novo Pacote de Tratamento'}
              </h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nome do Pacote *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Pacote Imunidade & Vitalidade 4S"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={pkgCategory}
                    onChange={(e) => setPkgCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Longevidade">Longevidade</option>
                    <option value="Estética">Estética</option>
                    <option value="Performance">Performance</option>
                    <option value="Injetáveis">Injetáveis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Conjunto de 4 sessões com reposição de aminoácidos e polivitamínicos..."
                  value={pkgDescription}
                  onChange={(e) => setPkgDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço Pacote (R$) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total de Sessões</label>
                  <input
                    type="number"
                    min="1"
                    value={pkgTotalSessions}
                    onChange={(e) => setPkgTotalSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validade (dias)</label>
                  <input
                    type="number"
                    min="1"
                    value={pkgValidityDays}
                    onChange={(e) => setPkgValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Itens / Procedimentos Inclusos (1 por linha)</label>
                <textarea
                  rows={3}
                  value={pkgIncludedItems.join('\n')}
                  onChange={(e) => setPkgIncludedItems(e.target.value.split('\n'))}
                  placeholder="Ex: 4x Sessões Injetáveis&#10;1x Avaliação Médica"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  {editingPackage ? 'Salvar Alterações' : 'Criar Pacote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Budget Confirmation */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Excluir Orçamento / Proposta
              </h3>
              <button onClick={() => setBudgetToDelete(null)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold">Atenção: Exclusão Isolada</p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  Deseja excluir a proposta comercial do paciente <strong>{budgetToDelete.patientName}</strong> no valor de <strong>R$ {budgetToDelete.finalValue.toFixed(2)}</strong>?
                </p>
                <p className="text-[11px] font-semibold text-rose-950">
                  A exclusão afetará SOMENTE esta proposta.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo da Exclusão</label>
                <input
                  type="text"
                  placeholder="Ex: Proposta reformulada, cancelamento a pedido do paciente..."
                  value={budgetDeleteReason}
                  onChange={(e) => setBudgetDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBudgetToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteBudget(budgetToDelete.id, budgetDeleteReason);
                    setBudgetToDelete(null);
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

      {/* Modal: Delete Package Confirmation */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Excluir Pacote de Tratamento
              </h3>
              <button onClick={() => setPackageToDelete(null)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold">Aviso sobre orçamentos históricos:</p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  A exclusão removerá <strong>SOMENTE o modelo de pacote "{packageToDelete.name}"</strong> do catálogo comercial. Os orçamentos já criados anteriormente que utilizaram este pacote manterão seus itens e valores intactos.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPackageToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTreatmentPackage(packageToDelete.id);
                    setPackageToDelete(null);
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

      {/* Printable Budget */}
      {printBudgetData && (
        <PrintableDocument
          title="Orçamento e Proposta de Tratamento"
          patientName={printBudgetData.patientName}
          patientCpf={printBudgetData.patientCpf}
          date={printBudgetData.createdAt}
          professionalName={currentUser.name}
          professionalCouncil="Centro Médico Plennus"
          content={`PROPOSTA DE TRATAMENTO INTEGRADO:\n\n` +
            printBudgetData.items.map((it, idx) => `${idx + 1}. ${it.description} - R$ ${it.totalPrice.toFixed(2)}`).join('\n') +
            `\n\nSubtotal: R$ ${printBudgetData.subtotal.toFixed(2)}\nDesconto Especial: R$ ${printBudgetData.discount.toFixed(2)}\nVALOR TOTAL: R$ ${printBudgetData.finalValue.toFixed(2)}\n\nForma de Pagamento: ${printBudgetData.paymentMethod}\nValidade da Proposta: ${printBudgetData.validUntil}`}
          onClose={() => setPrintBudgetData(null)}
        />
      )}
    </div>
  );
};
