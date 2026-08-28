import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Medication, MedicationApplication, InventoryMovement } from '../../types';
import {
  HeartPulse,
  Syringe,
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Package,
  Activity,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  ArrowDownUp,
  Filter,
  DollarSign,
  Calendar,
  History,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { MedicationFormModal } from './MedicationFormModal';
import { DeleteMedicationModal } from './DeleteMedicationModal';
import { StockMovementModal } from './StockMovementModal';

export const EnfermagemView: React.FC = () => {
  const {
    waitingQueue,
    patients,
    medications,
    medicationApplications,
    inventoryMovements,
    prescriptions,
    addMedication,
    updateMedication,
    deleteMedication,
    recordMedicationApplication,
    recordInventoryMovement,
    updateQueueStatus,
    saveTriage,
    currentUser,
    activeView,
    hasPermission,
    showToast,
  } = useApp();

  // Tab State: sync with activeView if it maps to 'estoque' or 'aplicacoes'
  const [activeTab, setActiveTab] = useState<'triagem' | 'aplicacoes' | 'estoque'>(() => {
    if (activeView === 'estoque') return 'estoque';
    if (activeView === 'aplicacoes') return 'aplicacoes';
    return 'triagem';
  });

  useEffect(() => {
    if (activeView === 'estoque') setActiveTab('estoque');
    else if (activeView === 'aplicacoes') setActiveTab('aplicacoes');
    else if (activeView === 'triagem') setActiveTab('triagem');
  }, [activeView]);

  // Estoque Sub-tab (Tabela de Estoque vs Histórico de Movimentações)
  const [estoqueSubTab, setEstoqueSubTab] = useState<'inventario' | 'historico'>('inventario');

  // Estoque Filters
  const [stockSearch, setStockSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | 'ativo' | 'inativo' | 'baixo_estoque'>('todos');

  // Modals state
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementInitialMedId, setMovementInitialMedId] = useState<string | undefined>(undefined);

  // Triage state
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [riskClassification, setRiskClassification] = useState<'verde' | 'amarelo' | 'vermelho' | 'azul'>('verde');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState(74);
  const [temperature, setTemperature] = useState(36.6);
  const [oxygenSaturation, setOxygenSaturation] = useState(99);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [bloodGlucose, setBloodGlucose] = useState(92);
  const [painScore, setPainScore] = useState(0);
  const [triageNotes, setTriageNotes] = useState('');

  // Application state
  const [appPatientId, setAppPatientId] = useState('');
  const [appMedicationId, setAppMedicationId] = useState('');
  const [appDosage, setAppDosage] = useState('1 ampola');
  const [appQuantityUsed, setAppQuantityUsed] = useState<number>(1);
  const [appRoute, setAppRoute] = useState<'Intramuscular' | 'Subcutânea' | 'Intravenosa' | 'Infiltração' | 'Oral'>('Intramuscular');
  const [appNotes, setAppNotes] = useState('Procedimento asséptico realizado sem intercorrências.');

  // Permissions
  const canEditStock = hasPermission('estoque', 'edit') || hasPermission('estoque', 'create');
  const canDeleteStock = hasPermission('estoque', 'delete');

  const pendingTriage = waitingQueue.filter((q) => q.status === 'Em triagem' || q.status === 'Aguardando');
  const lowStockMedications = medications.filter((m) => m.stockQuantity <= m.minStock && m.status === 'ativo');

  // Filtered Medications List
  const filteredMedications = useMemo(() => {
    return medications.filter((m) => {
      // Search term
      const query = stockSearch.toLowerCase().trim();
      const matchQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        (m.activeIngredient && m.activeIngredient.toLowerCase().includes(query)) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(query)) ||
        (m.supplier && m.supplier.toLowerCase().includes(query));

      // Category filter
      const matchCategory =
        selectedCategoryFilter === 'todas' || m.category === selectedCategoryFilter;

      // Status filter
      let matchStatus = true;
      if (selectedStatusFilter === 'ativo') matchStatus = m.status === 'ativo';
      else if (selectedStatusFilter === 'inativo') matchStatus = m.status === 'inativo';
      else if (selectedStatusFilter === 'baixo_estoque') matchStatus = m.stockQuantity <= m.minStock;

      return matchQuery && matchCategory && matchStatus;
    });
  }, [medications, stockSearch, selectedCategoryFilter, selectedStatusFilter]);

  // Total stock value
  const totalStockValue = useMemo(() => {
    return medications.reduce((sum, m) => sum + (m.price * m.stockQuantity), 0);
  }, [medications]);

  // Handlers for Medication Add / Edit / Delete
  const handleOpenAddMedication = () => {
    setMedicationToEdit(null);
    setIsMedicationModalOpen(true);
  };

  const handleOpenEditMedication = (med: Medication) => {
    setMedicationToEdit(med);
    setIsMedicationModalOpen(true);
  };

  const handleOpenDeleteMedication = (med: Medication) => {
    setMedicationToDelete(med);
    setIsDeleteModalOpen(true);
  };

  const handleSaveMedicationData = (data: Omit<Medication, 'id'>) => {
    if (medicationToEdit) {
      updateMedication(medicationToEdit.id, data);
    } else {
      addMedication(data);
    }
  };

  const handleConfirmDelete = (id: string) => {
    deleteMedication(id);
  };

  const handleOpenMovementModal = (medId?: string) => {
    setMovementInitialMedId(medId);
    setIsMovementModalOpen(true);
  };

  // Submit Triage
  const handleSaveTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId) {
      showToast('Selecione um paciente da fila de triagem.', 'error');
      return;
    }

    const queueItem = waitingQueue.find((q) => q.id === selectedQueueId);
    if (!queueItem) return;

    const vitalsSummary = `PA: ${bloodPressure} | FC: ${heartRate}bpm | Temp: ${temperature}°C | SpO2: ${oxygenSaturation}% | Glic: ${bloodGlucose}mg/dL | Dor: ${painScore}/10. ${triageNotes}`;

    saveTriage({
      patientId: queueItem.patientId,
      patientName: queueItem.patientName,
      waitingQueueId: queueItem.id,
      vitals: {
        bloodPressure,
        heartRate,
        respRate: 16,
        temperature,
        oxygenSaturation,
        weight,
        height,
        bloodGlucose,
        painScore,
      },
      chiefComplaint: triageNotes || 'Acolhimento de rotina',
      riskClassification,
      priorityDescription:
        riskClassification === 'vermelho'
          ? 'Emergência'
          : riskClassification === 'amarelo'
          ? 'Urgente'
          : 'Pouco Urgente',
      observations: triageNotes,
      nurseId: currentUser.id,
      nurseName: currentUser.name,
      forwardToProfessionalId: queueItem.professionalId,
    });

    updateQueueStatus(selectedQueueId, 'Aguardando médico', vitalsSummary);
    setSelectedQueueId('');
    setTriageNotes('');
  };

  // Submit Application
  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === appPatientId);
    const med = medications.find((m) => m.id === appMedicationId);

    if (!patient || !med) {
      showToast('Selecione o paciente e a medicação.', 'error');
      return;
    }

    const qtyToDeduct = Number(appQuantityUsed) > 0 ? Number(appQuantityUsed) : 1;

    if (med.stockQuantity < qtyToDeduct) {
      showToast(
        `Estoque insuficiente para ${med.name}. Saldo atual: ${med.stockQuantity}, Requisitado: ${qtyToDeduct}.`,
        'error'
      );
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const timeStr = new Date().toTimeString().substring(0, 5);

    recordMedicationApplication({
      patientId: patient.id,
      patientName: patient.name,
      medicationId: med.id,
      medicationName: med.name,
      dosage: appDosage,
      quantityUsed: qtyToDeduct,
      route: appRoute,
      date: todayStr,
      time: timeStr,
      nurseId: currentUser.id,
      nurseName: currentUser.name,
      vitalSignsBefore: { bp: '120/80', hr: 75 },
      observations: appNotes,
      status: 'realizada',
    });

    setAppPatientId('');
    setAppMedicationId('');
    setAppDosage('1 ampola');
    setAppQuantityUsed(1);
  };

  // Check if medication has history for soft delete modal display
  const checkMedicationHistory = (med: Medication | null): boolean => {
    if (!med) return false;
    const hasApps = medicationApplications.some((a) => a.medicationId === med.id);
    const hasMovs = inventoryMovements.some((m) => m.medicationId === med.id);
    const hasPresc = prescriptions.some((p) =>
      p.items.some((it) => it.medicationName?.toLowerCase().includes(med.name.toLowerCase()))
    );
    return hasApps || hasMovs || hasPresc;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Enfermagem, Triagem & Gestão de Estoque
          </h1>
          <p className="text-xs text-slate-500">
            Acolhimento clínico, protocolo de Manchester, administração de injetáveis e controle farmacêutico.
          </p>
        </div>

        {/* Global Action on Estoque Tab: + Adicionar Medicamento */}
        {activeTab === 'estoque' && (
          <div className="flex items-center gap-3">
            <button
              id="open-stock-movement-btn"
              onClick={() => handleOpenMovementModal()}
              className="px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <ArrowDownUp className="w-4 h-4 text-amber-700" />
              Lançar Movimentação
            </button>

            <button
              id="add-medication-header-btn"
              onClick={handleOpenAddMedication}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Adicionar Medicamento
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-triagem-btn"
          onClick={() => setActiveTab('triagem')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'triagem'
              ? 'bg-teal-100 text-teal-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          Triagem de Risco ({pendingTriage.length})
        </button>

        <button
          id="tab-aplicacoes-btn"
          onClick={() => setActiveTab('aplicacoes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'aplicacoes'
              ? 'bg-teal-100 text-teal-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Syringe className="w-3.5 h-3.5" />
          Aplicações & Injetáveis ({medicationApplications.length})
        </button>

        <button
          id="tab-estoque-btn"
          onClick={() => setActiveTab('estoque')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'estoque'
              ? 'bg-indigo-100 text-indigo-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          Estoque de Medicamentos ({medications.length})
          {lowStockMedications.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {lowStockMedications.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TRIAGEM DE RISCO */}
      {activeTab === 'triagem' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Queue List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" /> Pacientes Aguardando Triagem ({pendingTriage.length})
            </h3>

            {pendingTriage.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                Nenhum paciente aguardando triagem neste momento.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTriage.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedQueueId(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                      selectedQueueId === item.id
                        ? 'border-teal-500 bg-teal-50/50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{item.patientName}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {item.arrivalTime}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">
                      {item.appointmentType} • {item.isSpontaneousDemand ? 'Demanda Espontânea' : 'Agendado'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manchester Triage Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" /> Acolhimento & Classificação de Risco (Manchester)
            </h3>

            <form onSubmit={handleSaveTriage} className="space-y-4 text-xs">
              {/* Risk Level Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Classificação de Risco *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRiskClassification('vermelho')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition ${
                      riskClassification === 'vermelho'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <span>🔴 Vermelho</span>
                    <span className="text-[10px] font-normal">Emergência (Imediato)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskClassification('amarelo')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition ${
                      riskClassification === 'amarelo'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span>🟡 Amarelo</span>
                    <span className="text-[10px] font-normal">Urgente (Até 60m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskClassification('verde')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition ${
                      riskClassification === 'verde'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span>🟢 Verde</span>
                    <span className="text-[10px] font-normal">Pouco Urgente (120m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskClassification('azul')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition ${
                      riskClassification === 'azul'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span>🔵 Azul</span>
                    <span className="text-[10px] font-normal">Não Urgente (240m)</span>
                  </button>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pressão Arterial</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Freq. Cardíaca (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sat. O2 (%)</label>
                  <input
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Glicemia Capilar (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Escala de Dor (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Queixa Principal / Observações de Enfermagem</label>
                <textarea
                  rows={2}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Descreva sintomas, histórico imediato, alergias relatadas e motivo do acolhimento..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
                >
                  Concluir Triagem & Encaminhar ao Consultório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: APLICAÇÕES & INJETÁVEIS */}
      {activeTab === 'aplicacoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Application Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Syringe className="w-4 h-4 text-teal-600" /> Registrar Administração de Injetável
            </h3>
            <p className="text-[11px] text-slate-500">
              Ao registrar a aplicação como realizada, a baixa física no estoque é executada automaticamente.
            </p>

            <form onSubmit={handleSaveApplication} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={appPatientId}
                  onChange={(e) => setAppPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicação / Produto do Estoque *</label>
                <select
                  required
                  value={appMedicationId}
                  onChange={(e) => {
                    setAppMedicationId(e.target.value);
                    const selected = medications.find((m) => m.id === e.target.value);
                    if (selected && selected.dosage) {
                      setAppDosage(selected.dosage);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Selecione o item do estoque...</option>
                  {medications.filter((m) => m.status === 'ativo').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.stockQuantity} {m.unit} em estoque (R$ {m.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosagem Administrada</label>
                  <input
                    type="text"
                    value={appDosage}
                    onChange={(e) => setAppDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qtd. a Baixar (Unidades)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={appQuantityUsed}
                    onChange={(e) => setAppQuantityUsed(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Via de Administração</label>
                <select
                  value={appRoute}
                  onChange={(e) => setAppRoute(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Intramuscular">Intramuscular (IM)</option>
                  <option value="Subcutânea">Subcutânea (SC)</option>
                  <option value="Intravenosa">Intravenosa (IV / Soroterapia)</option>
                  <option value="Infiltração">Infiltração / Estético</option>
                  <option value="Oral">Oral</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações Pós-Aplicação</label>
                <textarea
                  rows={2}
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition mt-2 flex items-center justify-center gap-2"
              >
                <Syringe className="w-4 h-4" />
                Registrar Aplicação & Baixar Estoque
              </button>
            </form>
          </div>

          {/* Applications History Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Histórico de Injetáveis & Soroterapia Realizados ({medicationApplications.length})
            </h3>

            {medicationApplications.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                Nenhuma aplicação registrada até o momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {medicationApplications.map((app) => (
                  <div key={app.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{app.patientName}</p>
                      <p className="text-teal-800 font-semibold">
                        {app.medicationName} ({app.dosage}) • {app.route}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Responsável: {app.nurseName} • Baixa: {app.quantityUsed || 1} un.
                      </p>
                      {app.observations && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">{app.observations}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase block mb-1">
                        {app.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {app.date} às {app.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESTOQUE DE MEDICAMENTOS */}
      {activeTab === 'estoque' && (
        <div className="space-y-6">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total de Itens</span>
                <Boxes className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold font-serif-luxury text-slate-900">{medications.length}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {medications.filter((m) => m.status === 'ativo').length} ativos no catálogo
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Estoque Baixo</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <p className={`text-2xl font-bold font-serif-luxury ${lowStockMedications.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {lowStockMedications.length}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Abaixo do nível de segurança</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Valor em Estoque</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-serif-luxury text-emerald-700">
                R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Avaliação pelo preço de venda</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Movimentações</span>
                <History className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold font-serif-luxury text-slate-900">{inventoryMovements.length}</p>
              <p className="text-[10px] text-slate-400 mt-1">Auditoria de entradas e saídas</p>
            </div>
          </div>

          {/* Urgent Low Stock Alert Banner */}
          {lowStockMedications.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-900">Alerta de Reposição Urgente</p>
                  <p className="text-[11px] text-rose-700">
                    Os seguintes itens estão no limite ou abaixo do estoque mínimo:{' '}
                    <strong>{lowStockMedications.map((m) => `${m.name} (${m.stockQuantity} ${m.unit})`).join(', ')}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStatusFilter('baixo_estoque')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shrink-0 transition"
              >
                Ver Itens Críticos
              </button>
            </div>
          )}

          {/* Sub-Tabs: Inventário vs Histórico de Movimentações */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  id="subtab-inventario-btn"
                  onClick={() => setEstoqueSubTab('inventario')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                    estoqueSubTab === 'inventario'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  Catálogo & Inventário Físico ({filteredMedications.length})
                </button>

                <button
                  id="subtab-historico-btn"
                  onClick={() => setEstoqueSubTab('historico')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    estoqueSubTab === 'historico'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Histórico de Movimentações ({inventoryMovements.length})
                </button>
              </div>

              {estoqueSubTab === 'inventario' && (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-adicionar-medicamento-subtab"
                    onClick={handleOpenAddMedication}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Adicionar Medicamento
                  </button>
                </div>
              )}
            </div>

            {/* SUB-TAB 1: INVENTÁRIO TABLE */}
            {estoqueSubTab === 'inventario' && (
              <div className="p-6 space-y-4">
                {/* Search & Filters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id="search-medication-input"
                      type="text"
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      placeholder="Buscar por nome, princípio ativo, lote..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <select
                      id="filter-category-select"
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-indigo-500 transition"
                    >
                      <option value="todas">Todas as Categorias</option>
                      <option value="Medicamento">Medicamento</option>
                      <option value="Vitamina">Vitamina</option>
                      <option value="Hormônio">Hormônio</option>
                      <option value="Injetável">Injetável</option>
                      <option value="Suplemento">Suplemento</option>
                      <option value="Material assistencial">Material assistencial</option>
                      <option value="Estético">Estético</option>
                      <option value="Analgésico/Anti-inflamatório">Analgésico/Anti-inflamatório</option>
                      <option value="Antibiótico">Antibiótico</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <select
                      id="filter-status-select"
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-indigo-500 transition"
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="ativo">Somente Ativos</option>
                      <option value="inativo">Somente Inativos</option>
                      <option value="baixo_estoque">Somente Estoque Baixo (Crítico)</option>
                    </select>
                  </div>
                </div>

                {/* Table of Medications */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Medicamento</th>
                        <th className="p-3.5">Princípio Ativo</th>
                        <th className="p-3.5">Apresentação</th>
                        <th className="p-3.5">Dosagem</th>
                        <th className="p-3.5 text-center">Quantidade</th>
                        <th className="p-3.5 text-right">Valor Venda</th>
                        <th className="p-3.5">Lote</th>
                        <th className="p-3.5">Validade</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMedications.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                            Nenhum medicamento encontrado para os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredMedications.map((med) => {
                          const isLow = med.stockQuantity <= med.minStock;
                          return (
                            <tr key={med.id} className="hover:bg-slate-50/80 transition">
                              {/* Name + Category */}
                              <td className="p-3.5">
                                <p className="font-bold text-slate-900">{med.name}</p>
                                <span className="text-[10px] text-indigo-600 font-medium">{med.category}</span>
                              </td>

                              {/* Active Ingredient */}
                              <td className="p-3.5 text-slate-600">
                                {med.activeIngredient || '—'}
                              </td>

                              {/* Presentation */}
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                                  {med.presentation}
                                </span>
                              </td>

                              {/* Dosage */}
                              <td className="p-3.5 font-medium text-slate-800">
                                {med.dosage || '—'}
                              </td>

                              {/* Quantity */}
                              <td className="p-3.5 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                                      isLow
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    }`}
                                  >
                                    {med.stockQuantity} {med.unit}
                                  </span>
                                  {isLow && (
                                    <span className="text-[9px] text-rose-600 font-semibold mt-0.5">
                                      Mín: {med.minStock}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Price */}
                              <td className="p-3.5 text-right font-bold text-emerald-800 font-mono">
                                R$ {med.price.toFixed(2)}
                              </td>

                              {/* Batch */}
                              <td className="p-3.5 font-mono text-[11px] text-slate-600">
                                {med.batchNumber || 'LT-2026-X'}
                              </td>

                              {/* Expiration */}
                              <td className="p-3.5 text-[11px] text-slate-600">
                                {med.expirationDate ? (
                                  <span className="font-mono">
                                    {new Date(med.expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-3.5 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    med.status === 'ativo'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {med.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    title="Lançar Movimentação"
                                    onClick={() => handleOpenMovementModal(med.id)}
                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                                  >
                                    <ArrowDownUp className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    title="Editar Medicamento"
                                    onClick={() => handleOpenEditMedication(med)}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    title="Excluir / Inativar Medicamento"
                                    onClick={() => handleOpenDeleteMedication(med)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: MOVIMENTAÇÕES HISTORY AUDIT */}
            {estoqueSubTab === 'historico' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <p>Registro auditado de todas as entradas, saídas, aplicações clínicas e ajustes manuais.</p>
                  <button
                    onClick={() => handleOpenMovementModal()}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Lançar Nova Movimentação
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Data / Hora</th>
                        <th className="p-3">Medicamento</th>
                        <th className="p-3 text-center">Tipo</th>
                        <th className="p-3 text-center">Qtd.</th>
                        <th className="p-3 text-center">Saldo Anterior ➔ Novo</th>
                        <th className="p-3">Responsável</th>
                        <th className="p-3">Motivo / Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {inventoryMovements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Nenhuma movimentação de estoque registrada.
                          </td>
                        </tr>
                      ) : (
                        inventoryMovements.map((mov) => {
                          const typeStyles = {
                            entrada: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                            saida: 'bg-rose-100 text-rose-900 border-rose-300',
                            aplicacao: 'bg-teal-100 text-teal-900 border-teal-300',
                            ajuste: 'bg-amber-100 text-amber-900 border-amber-300',
                            estorno: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                          }[mov.type] || 'bg-slate-100 text-slate-800 border-slate-300';

                          return (
                            <tr key={mov.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                {mov.date} {mov.time ? `às ${mov.time}` : ''}
                              </td>

                              <td className="p-3 font-bold text-slate-900">
                                {mov.medicationName}
                              </td>

                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeStyles}`}>
                                  {mov.type}
                                </span>
                              </td>

                              <td className="p-3 text-center font-bold text-slate-800">
                                {mov.quantity}
                              </td>

                              <td className="p-3 text-center font-mono text-[11px]">
                                <span className="text-slate-500">{mov.previousQuantity}</span>
                                <span className="mx-1 text-slate-400">➔</span>
                                <span className="font-bold text-indigo-900">{mov.newQuantity}</span>
                              </td>

                              <td className="p-3 font-medium text-slate-700">
                                {mov.responsibleName}
                              </td>

                              <td className="p-3 text-[11px] text-slate-600">
                                {mov.reason}
                                {mov.patientName && (
                                  <span className="block text-[10px] text-teal-700 font-semibold mt-0.5">
                                    Paciente: {mov.patientName}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT MEDICATION */}
      <MedicationFormModal
        isOpen={isMedicationModalOpen}
        onClose={() => {
          setIsMedicationModalOpen(false);
          setMedicationToEdit(null);
        }}
        onSave={handleSaveMedicationData}
        medicationToEdit={medicationToEdit}
      />

      {/* MODAL 2: DELETE / INACTIVATE CONFIRMATION */}
      <DeleteMedicationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMedicationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        medication={medicationToDelete}
        hasHistoricalUsage={checkMedicationHistory(medicationToDelete)}
      />

      {/* MODAL 3: STOCK MOVEMENT MODAL */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementInitialMedId(undefined);
        }}
        medications={medications.filter((m) => m.status === 'ativo')}
        initialMedicationId={movementInitialMedId}
        onSaveMovement={recordInventoryMovement}
        responsibleName={currentUser.name}
      />
    </div>
  );
};
