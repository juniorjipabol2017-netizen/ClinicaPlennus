import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NfseInvoice } from '../../types';
import {
  FileSpreadsheet,
  Receipt,
  Search,
  Filter,
  Plus,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Calendar,
  DollarSign,
  Ban,
  MessageCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { NfseEmissionModal } from './NfseEmissionModal';
import { NfseDanfseModal } from './NfseDanfseModal';

export const NfseListTab: React.FC = () => {
  const { nfseInvoices, cancelNfse, deleteNfseInvoice, currentUser, hasPermission } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'autorizada' | 'cancelada'>('all');

  const [isEmissionModalOpen, setIsEmissionModalOpen] = useState(false);
  const [selectedInvoiceForDanfse, setSelectedInvoiceForDanfse] = useState<NfseInvoice | null>(null);

  // Cancel / Delete modals
  const [invoiceToCancel, setInvoiceToCancel] = useState<NfseInvoice | null>(null);
  const [cancelReason, setCancelReason] = useState('Emissão em duplicidade / Erro no preenchimento de dados do tomador');

  const [invoiceToDelete, setInvoiceToDelete] = useState<NfseInvoice | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const canEdit = hasPermission('financeiro', 'edit');

  const filteredInvoices = nfseInvoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.takerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.takerCpfCnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalBilled = nfseInvoices
    .filter((inv) => inv.status === 'autorizada')
    .reduce((sum, inv) => sum + inv.serviceValue, 0);

  const totalIss = nfseInvoices
    .filter((inv) => inv.status === 'autorizada')
    .reduce((sum, inv) => sum + inv.issValue, 0);

  const totalAuthorizedCount = nfseInvoices.filter((inv) => inv.status === 'autorizada').length;
  const totalCancelledCount = nfseInvoices.filter((inv) => inv.status === 'cancelada').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Billed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Faturado em NFS-e
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            {totalAuthorizedCount} notas fiscais válidas
          </span>
        </div>

        {/* KPI 2: Total ISS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ISS Municipal Apurado
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-amber-900 mt-2">
            R$ {totalIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Alíquota média municipal 2,0%
          </span>
        </div>

        {/* KPI 3: Authorized count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Notas Autorizadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{totalAuthorizedCount}</p>
          <span className="text-[10px] text-blue-700 font-bold mt-1 block">
            Transmissão 100% regularizada
          </span>
        </div>

        {/* KPI 4: Cancelled count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Notas Canceladas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{totalCancelledCount}</p>
          <span className="text-[10px] text-rose-600 mt-1 block">
            Cancelamentos com protocolo
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 sm:px-6 bg-slate-50/70 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Notas Fiscais de Serviços Eletrônicas (NFS-e)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Emissão, cancelamento, visualização de DANFSe e exportação de XML integradas à Prefeitura.
              </p>
            </div>

            {canEdit && (
              <button
                id="btn-open-issue-nfse-modal"
                onClick={() => setIsEmissionModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Emitir Nova NFS-e
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por tomador, CPF/CNPJ, número da nota ou código de verificação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-amber-500"
              >
                <option value="all">Todos os Status (Autorizadas & Canceladas)</option>
                <option value="autorizada">Apenas Autorizadas</option>
                <option value="cancelada">Apenas Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700">Nenhuma Nota Fiscal encontrada</p>
            <p className="text-xs">
              Clique em "Emitir Nova NFS-e" para transmitir sua primeira nota de serviços médicos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Nº / RPS</th>
                  <th className="py-3 px-4">Data Emissão</th>
                  <th className="py-3 px-4">Tomador (Paciente)</th>
                  <th className="py-3 px-4">Discriminação</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">ISS</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isAut = inv.status === 'autorizada';
                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !isAut ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Número da Nota / RPS */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {inv.number}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inv.rpsNumber}
                        </span>
                      </td>

                      {/* Data & Hora */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium">{inv.issueDate}</div>
                        <span className="text-[10px] text-slate-400">{inv.issueTime}</span>
                      </td>

                      {/* Tomador */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.takerName}</div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          CPF/CNPJ: {inv.takerCpfCnpj}
                        </span>
                      </td>

                      {/* Discriminação resumida */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={inv.serviceDescription}>
                        {inv.serviceDescription}
                      </td>

                      {/* Valor Bruto */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        R$ {inv.serviceValue.toFixed(2)}
                      </td>

                      {/* ISS */}
                      <td className="py-3.5 px-4 text-right font-mono text-amber-800">
                        R$ {inv.issValue.toFixed(2)} ({inv.issRate}%)
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isAut
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isAut ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Autorizada
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" /> Cancelada
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-danfse-${inv.id}`}
                            onClick={() => setSelectedInvoiceForDanfse(inv)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                            title="Visualizar DANFSe oficial"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>DANFSe</span>
                          </button>

                          {canEdit && isAut && (
                            <button
                              id={`btn-cancel-nfse-${inv.id}`}
                              onClick={() => {
                                setInvoiceToCancel(inv);
                                setCancelReason('Emissão em duplicidade / Erro no preenchimento de dados');
                              }}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                              title="Cancelar NFS-e junto à Prefeitura"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canEdit && (
                            <button
                              id={`btn-delete-nfse-${inv.id}`}
                              onClick={() => {
                                setInvoiceToDelete(inv);
                                setDeleteReason('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Excluir Registro de NFS-e do Sistema"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emission Modal */}
      <NfseEmissionModal
        isOpen={isEmissionModalOpen}
        onClose={() => setIsEmissionModalOpen(false)}
        onSuccess={(issued) => {
          setSelectedInvoiceForDanfse(issued);
        }}
      />

      {/* DANFSe Document Modal */}
      <NfseDanfseModal
        isOpen={Boolean(selectedInvoiceForDanfse)}
        onClose={() => setSelectedInvoiceForDanfse(null)}
        invoice={selectedInvoiceForDanfse}
      />

      {/* Modal: Cancel NFS-e (Fiscal Action) */}
      {invoiceToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-300 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Ban className="w-5 h-5" /> Cancelamento Fiscal de NFS-e
              </h3>
              <button
                type="button"
                onClick={() => setInvoiceToCancel(null)}
                className="text-white/80 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">Processo Fiscal de Cancelamento Municipal</p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Esta ação transmitirá o pedido de cancelamento da NFS-e Nº <strong>{invoiceToCancel.number}</strong> ao webservice da Prefeitura/SEFAZ. O status mudará para CANCELADA.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Tomador:</span>
                  <strong className="text-slate-900">{invoiceToCancel.takerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor dos Serviços:</span>
                  <strong className="text-slate-900 font-mono">R$ {invoiceToCancel.serviceValue.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Data de Emissão:</span>
                  <span className="font-mono">{invoiceToCancel.issueDate}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Justificativa do Cancelamento *
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInvoiceToCancel(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelNfseInvoice(invoiceToCancel.id, cancelReason);
                    setInvoiceToCancel(null);
                  }}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
                >
                  Transmitir Cancelamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete NFS-e Record (System Exclusion) */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-300 animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Excluir Registro de NFS-e
              </h3>
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="text-white/80 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold">Atenção: Exclusão do Registro do Sistema</p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  Esta ação removerá o registro da NFS-e Nº <strong>{invoiceToDelete.number}</strong> do banco de dados local. A exclusão afetará <strong>SOMENTE esta NFS-e</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>NFS-e Nº / RPS:</span>
                  <strong className="text-slate-900 font-mono">{invoiceToDelete.number} ({invoiceToDelete.rpsNumber})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tomador:</span>
                  <strong className="text-slate-900">{invoiceToDelete.takerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <strong className="text-slate-900 font-mono">R$ {invoiceToDelete.serviceValue.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status Atual:</span>
                  <span className="font-bold uppercase">{invoiceToDelete.status}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo da Exclusão do Registro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Registro gerado em homologação/teste, exclusão manual autorizada..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInvoiceToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteNfseInvoice(invoiceToDelete.id, deleteReason || 'Exclusão manual autorizada');
                    setInvoiceToDelete(null);
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
    </div>
  );
};
