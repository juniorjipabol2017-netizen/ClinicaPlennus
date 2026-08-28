import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialTransaction, NfseInvoice } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Plus,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  Eye,
  FileText,
  Building2,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { NfseListTab } from './NfseListTab';
import { NfseEmissionModal } from './NfseEmissionModal';
import { NfseDanfseModal } from './NfseDanfseModal';

export const FinancialView: React.FC = () => {
  const {
    cashRegister,
    financialTransactions,
    addFinancialTransaction,
    deleteFinancialTransaction,
    openCashRegister,
    closeCashRegister,
    nfseInvoices,
    getNfseByTransactionId,
    hasPermission,
    currentUser,
    patients,
    showToast,
  } = useApp();

  const isAllowed = hasPermission('financeiro', 'view');
  const canEdit = hasPermission('financeiro', 'edit');

  const [activeTab, setActiveTab] = useState<'caixa' | 'nfse'>('caixa');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<FinancialTransaction | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // NFS-e modals
  const [isNfseEmissionModalOpen, setIsNfseEmissionModalOpen] = useState(false);
  const [selectedTxForNfse, setSelectedTxForNfse] = useState<FinancialTransaction | null>(null);
  const [selectedInvoiceForDanfse, setSelectedInvoiceForDanfse] = useState<NfseInvoice | null>(null);

  // New Transaction state
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [txCategory, setTxCategory] = useState<FinancialTransaction['category']>('Consulta Médica');
  const [txDescription, setTxDescription] = useState('');
  const [txValue, setTxValue] = useState(350);
  const [txPaymentMethod, setTxPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('Pix');
  const [txPatientId, setTxPatientId] = useState('');

  // Open register state
  const [initialCash, setInitialCash] = useState(250);

  // Close register state
  const [closeNotes, setCloseNotes] = useState('');

  if (!isAllowed) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Acesso Restrito ao Módulo Financeiro</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          O seu perfil (<strong>{currentUser.role.toUpperCase()}</strong>) não possui permissão para acessar o fluxo de caixa, transações e dados financeiros do Centro Médico Plennus, de acordo com as diretrizes de <strong>Segregação de Funções (SoD)</strong>.
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayInflows = financialTransactions
    .filter((t) => t.date === todayStr && t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0);

  const todayOutflows = financialTransactions
    .filter((t) => t.date === todayStr && t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0);

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === txPatientId);

    addFinancialTransaction({
      type: txType,
      category: txCategory,
      description: txDescription,
      value: txValue,
      paymentMethod: txPaymentMethod,
      patientId: patient?.id,
      patientName: patient?.name,
      responsibleUserId: currentUser.id,
      responsibleName: currentUser.name,
    });

    setIsTxModalOpen(false);
    setTxDescription('');
    showToast('Lançamento financeiro registrado com sucesso!');
  };

  const handleOpenRegister = () => {
    openCashRegister(initialCash);
    setIsOpenRegisterModalOpen(false);
    showToast('Caixa diário aberto com sucesso!');
  };

  const handleCloseRegister = () => {
    closeCashRegister(closeNotes);
    setIsCloseRegisterModalOpen(false);
    showToast('Caixa diário fechado e auditado!');
  };

  const handleEmitNfseFromTx = (tx: FinancialTransaction) => {
    setSelectedTxForNfse(tx);
    setIsNfseEmissionModalOpen(true);
  };

  const authorizedInvoicesCount = nfseInvoices.filter((n) => n.status === 'autorizada').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            Financeiro, Caixa & Faturamento
          </h1>
          <p className="text-xs text-slate-500">
            Fluxo de caixa diário, conferência de recebimentos e emissão integrada de Nota Fiscal de Serviços (NFS-e).
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick NFS-e Button */}
            <button
              id="btn-quick-emit-nfse"
              onClick={() => {
                setSelectedTxForNfse(null);
                setIsNfseEmissionModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Emitir Nota Fiscal (NFS-e)
            </button>

            {cashRegister.status === 'aberto' ? (
              <>
                <button
                  id="btn-new-transaction"
                  onClick={() => setIsTxModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Novo Lançamento
                </button>

                <button
                  id="btn-close-cash-register"
                  onClick={() => setIsCloseRegisterModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" /> Fechar Caixa
                </button>
              </>
            ) : (
              <button
                id="btn-open-cash-register"
                onClick={() => setIsOpenRegisterModalOpen(true)}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" /> Abrir Caixa Diário
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="financial-tab-caixa"
          onClick={() => setActiveTab('caixa')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'caixa'
              ? 'bg-amber-100 text-amber-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Fluxo de Caixa & Lançamentos ({financialTransactions.length})
        </button>

        <button
          id="financial-tab-nfse"
          onClick={() => setActiveTab('nfse')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'nfse'
              ? 'bg-emerald-100 text-emerald-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Notas Fiscais de Serviços (NFS-e) ({authorizedInvoicesCount})
        </button>
      </div>

      {/* TAB 1: FLUXO DE CAIXA */}
      {activeTab === 'caixa' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Balance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Saldo Atual em Caixa</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cashRegister.status === 'aberto'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Caixa {cashRegister.status.toUpperCase()}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                R$ {cashRegister.currentBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Abertura: R$ {cashRegister.openingBalance.toFixed(2)}</p>
            </div>

            {/* Card 2: Inflows */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Entradas de Hoje</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-700 font-mono">
                + R$ {todayInflows.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Consultas, injetáveis e protocolos</p>
            </div>

            {/* Card 3: Outflows */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Saídas do Dia</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-700 font-mono">
                - R$ {todayOutflows.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Despesas e suprimentos imediatos</p>
            </div>

            {/* Card 4: Net Total */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Resultado Líquido</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                R$ {(todayInflows - todayOutflows).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Líquido gerado em {todayStr}</p>
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Movimentações Financeiras ({financialTransactions.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">Operador: {currentUser.name}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {financialTransactions.map((tx) => {
                const linkedNfse = tx.type === 'entrada' ? getNfseByTransactionId(tx.id) : undefined;

                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          tx.type === 'entrada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type === 'entrada' ? '+' : '-'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs">{tx.description}</p>
                          {linkedNfse ? (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForDanfse(linkedNfse)}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold font-mono hover:bg-emerald-100 transition flex items-center gap-1"
                              title="Clique para abrir a Nota Fiscal emitida"
                            >
                              <FileCheck2Icon className="w-3 h-3 text-emerald-600" />
                              NFS-e Nº {linkedNfse.number}
                            </button>
                          ) : tx.type === 'entrada' && canEdit ? (
                            <button
                              type="button"
                              onClick={() => handleEmitNfseFromTx(tx)}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded text-[10px] font-bold transition flex items-center gap-1"
                              title="Emitir Nota Fiscal para este recebimento"
                            >
                              <Receipt className="w-3 h-3 text-emerald-600" />
                              + Emitir NFS-e
                            </button>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {tx.category} • {tx.paymentMethod} • Resp: {tx.responsibleName}
                          {tx.patientName && ` • Paciente: ${tx.patientName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold font-mono block ${
                            tx.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'entrada' ? '+' : '-'} R$ {tx.value.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.date} às {tx.time}
                        </span>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                          <button
                            type="button"
                            onClick={() => {
                              setTxToDelete(tx);
                              setDeleteReason('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Excluir lançamento de pagamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTAS FISCAIS ELETRÔNICAS (NFS-e) */}
      {activeTab === 'nfse' && (
        <NfseListTab />
      )}

      {/* Modal: Open Cash Register */}
      {isOpenRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm font-serif-luxury">Abertura de Caixa Diário</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fundo de Troco Inicial (R$)</label>
              <input
                type="number"
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpenRegisterModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenRegister}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
              >
                Confirmar Abertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Close Cash Register */}
      {isCloseRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm font-serif-luxury">Fechamento do Caixa Diário</h3>
            <p className="text-slate-600">
              O saldo final apurado é de <strong>R$ {cashRegister.currentBalance.toFixed(2)}</strong>.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Observações do Fechamento</label>
              <textarea
                rows={3}
                placeholder="Conferência de comprovantes de cartão, PIX e dinheiro físico..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCloseRegisterModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseRegister}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow transition"
              >
                Encerrar Caixa & Gravar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Transaction */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-serif-luxury">Novo Lançamento no Caixa</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTx} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('entrada')}
                  className={`py-2 rounded-lg font-bold border ${
                    txType === 'entrada'
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Entrada (+)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('saida')}
                  className={`py-2 rounded-lg font-bold border ${
                    txType === 'saida'
                      ? 'bg-rose-600 text-white border-transparent'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Saída (-)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta Dr. Leonardo, Compra de álcool 70%..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={txValue}
                    onChange={(e) => setTxValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vincular a Paciente (Opcional)</label>
                <select
                  value={txPatientId}
                  onChange={(e) => setTxPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="">Nenhum / Despesa Geral</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  Gravar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Transaction Confirmation */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Excluir Lançamento Financeiro
              </h3>
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="text-white/80 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1.5">
                <p className="text-rose-900 font-bold text-xs">
                  Atenção: A exclusão afetará SOMENTE este lançamento selecionado!
                </p>
                <p className="text-rose-800 text-[11px] leading-relaxed">
                  O saldo em caixa será recalculado automaticamente e uma entrada de auditoria será gravada com o responsável e o motivo.
                </p>
              </div>

              {/* Transaction details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ID do Lançamento:</span>
                  <span className="font-mono font-bold text-slate-800">{txToDelete.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Descrição:</span>
                  <span className="font-bold text-slate-900">{txToDelete.description}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tipo / Categoria:</span>
                  <span className="font-semibold">
                    {txToDelete.type === 'entrada' ? 'Entrada (+)' : 'Saída (-)'} • {txToDelete.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Valor:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      txToDelete.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    R$ {txToDelete.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Forma de Pagamento:</span>
                  <span className="font-medium">{txToDelete.paymentMethod}</span>
                </div>
                {txToDelete.patientName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Paciente:</span>
                    <span className="font-medium">{txToDelete.patientName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Data / Hora:</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {txToDelete.date} às {txToDelete.time}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo / Justificativa da Exclusão *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lançamento duplicado pelo operador, estorno de cartão..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTxToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteFinancialTransaction(txToDelete.id, deleteReason || 'Exclusão manual autorizada');
                    setTxToDelete(null);
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

      {/* NFS-e Emission Modal */}
      <NfseEmissionModal
        isOpen={isNfseEmissionModalOpen}
        onClose={() => {
          setIsNfseEmissionModalOpen(false);
          setSelectedTxForNfse(null);
        }}
        transactionToEmit={selectedTxForNfse}
        onSuccess={(issued) => {
          setSelectedInvoiceForDanfse(issued);
        }}
      />

      {/* NFS-e DANFSe Viewer Modal */}
      <NfseDanfseModal
        isOpen={Boolean(selectedInvoiceForDanfse)}
        onClose={() => setSelectedInvoiceForDanfse(null)}
        invoice={selectedInvoiceForDanfse}
      />
    </div>
  );
};

// Sub-component helper for check icon
const FileCheck2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m3 15 2 2 4-4" />
  </svg>
);
