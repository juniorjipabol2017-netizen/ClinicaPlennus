import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, PatientConsentDocument, ConsentTermTemplate } from '../../types';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Tablet,
  Printer,
  Eye,
  ShieldCheck,
  Clock,
  Filter,
  Calendar,
  Lock,
  ChevronRight,
  Download,
} from 'lucide-react';
import { PrintableConsentDocument } from './PrintableConsentDocument';

interface PatientConsentHistoryTabProps {
  patient: Patient;
}

export const PatientConsentHistoryTab: React.FC<PatientConsentHistoryTabProps> = ({ patient }) => {
  const {
    patientConsents,
    consentTemplates,
    openTabletConsentModal,
    currentUser,
    hasPermission,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocForPrint, setSelectedDocForPrint] = useState<PatientConsentDocument | null>(null);
  const [showNewTermModal, setShowNewTermModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [procedureNotes, setProcedureNotes] = useState<string>('');

  const patientDocs = patientConsents.filter((d) => d.patientId === patient.id);

  // Active templates available
  const activeTemplates = consentTemplates.filter((t) => t.status === 'ativo');

  // Filtered docs
  const filteredDocs = patientDocs.filter((d) => {
    const matchesQuery =
      d.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.documentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.treatmentCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || d.treatmentCategory === categoryFilter;

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const handleStartTabletSigning = (templateId: string, customProcedureName?: string) => {
    setShowNewTermModal(false);
    openTabletConsentModal({
      patient,
      templateId,
      procedureName: customProcedureName,
    });
  };

  const signedCount = patientDocs.filter((d) => d.status === 'assinado').length;
  const refusedCount = patientDocs.filter((d) => d.status === 'recusado').length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Termos Assinados
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{signedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total no Histórico
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{patientDocs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Recusas / Não Concordâncias
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{refusedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Header & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Histórico de Termos de Consentimento (TCLE)
            </h3>
            <p className="text-xs text-slate-500">
              Documentos de consentimento livre e esclarecido assinados digitalmente pelo paciente no tablet.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeTemplates.length > 0) {
                setSelectedTemplateId(activeTemplates[0].id);
              }
              setShowNewTermModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Termo de Consentimento
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por termo, código ou procedimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="all">Todas as Categorias / Tratamentos</option>
            <option value="Aplicação de medicação">Aplicação de medicação</option>
            <option value="Tratamento de emagrecimento">Tratamento de emagrecimento</option>
            <option value="Reposição hormonal">Reposição hormonal</option>
            <option value="Procedimentos estéticos">Procedimentos estéticos</option>
            <option value="Aplicações intramusculares">Aplicações intramusculares</option>
            <option value="Procedimentos médicos">Procedimentos médicos</option>
            <option value="Exames/procedimentos">Exames/procedimentos</option>
            <option value="Outros tratamentos">Outros tratamentos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="all">Todos os Status</option>
            <option value="assinado">Assinados</option>
            <option value="recusado">Recusados / Não Concordados</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Nenhum termo de consentimento encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">Data / Hora</th>
                  <th className="pb-3 px-3">Identificador</th>
                  <th className="pb-3 px-3">Termo / Tratamento</th>
                  <th className="pb-3 px-3">Versão</th>
                  <th className="pb-3 px-3">Profissional</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const dateStr = doc.signedAt
                    ? new Date(doc.signedAt).toLocaleDateString('pt-BR') + ' ' + new Date(doc.signedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : new Date(doc.createdAt).toLocaleDateString('pt-BR');

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {doc.documentCode}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{doc.templateName}</p>
                        <p className="text-[10px] text-slate-500">{doc.procedureName || doc.treatmentCategory}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-600">
                        v{doc.version}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {doc.professionalName}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            doc.status === 'assinado'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : doc.status === 'recusado'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDocForPrint(doc)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                            title="Visualizar / Imprimir Documento"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Visualizar / PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: New Consent Term Launcher */}
      {showNewTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Tablet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-serif-luxury">
                    Iniciar Assinatura de Termo no Tablet
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Paciente: <strong>{patient.name}</strong> ({patient.cpf})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTermModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Selecione o Modelo de Termo de Consentimento:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Cat: {t.treatmentCategory} • v{t.version})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplateId && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                  {(() => {
                    const tpl = consentTemplates.find((t) => t.id === selectedTemplateId);
                    if (!tpl) return null;
                    return (
                      <>
                        <div className="flex items-center justify-between text-indigo-900 font-bold">
                          <span>Categoria: {tpl.treatmentCategory}</span>
                          <span className="text-[10px] bg-indigo-200/60 px-2 py-0.5 rounded-full">
                            Versão {tpl.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                          {tpl.fullText}
                        </p>
                        <div className="pt-2 border-t border-indigo-100/60 flex items-center gap-4 text-[10px] text-slate-500">
                          <span>• {tpl.requiredDeclarations.length} declarações obrigatórias</span>
                          <span>• Recorrência: {tpl.recurrence === 'once' ? 'Única' : tpl.recurrence === 'annual' ? 'Anual' : 'A cada procedimento'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Especificação do Procedimento / Observação (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aplicação de Soroterapia Energética + Complexo B"
                  value={procedureNotes}
                  onChange={(e) => setProcedureNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewTermModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleStartTabletSigning(selectedTemplateId, procedureNotes)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Tablet className="w-4 h-4" />
                Abrir no Tablet para o Paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      {selectedDocForPrint && (
        <PrintableConsentDocument
          document={selectedDocForPrint}
          onClose={() => setSelectedDocForPrint(null)}
        />
      )}
    </div>
  );
};
