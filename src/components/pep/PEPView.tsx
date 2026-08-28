import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  FileText,
  User,
  Activity,
  Pill,
  FlaskConical,
  Paperclip,
  Upload,
  Calendar,
  Sparkles,
  Search,
  Lock,
  Printer,
  ChevronRight,
  Shield,
  Eye,
} from 'lucide-react';
import { PrintableDocument } from '../common/PrintableDocument';
import { PatientConsentHistoryTab } from './PatientConsentHistoryTab';

export const PEPView: React.FC = () => {
  const {
    patients,
    consultations,
    prescriptions,
    medicalDocuments,
    examRequests,
    attachments,
    addAttachment,
    protocolAssignments,
    medicationApplications,
    patientConsents,
    selectedPatientForPEP,
    setSelectedPatientForPEP,
    hasPermission,
    currentUser,
  } = useApp();

  // SoD Security Check (Section 11, 43): Recepção and Financeiro are strictly forbidden from clinical records
  const isAllowed = hasPermission('pep', 'view');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'resumo' | 'consultas' | 'prescricoes' | 'exames' | 'documentos' | 'termos' | 'aplicacoes' | 'protocolos' | 'anexos'>('resumo');
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [attachmentDesc, setAttachmentDesc] = useState('');
  const [attachmentCategory, setAttachmentCategory] = useState<'Exame Laboratorial' | 'Imagem/Laudo' | 'Documento' | 'Fotografia Clínica'>('Exame Laboratorial');
  const [showPrintDoc, setShowPrintDoc] = useState<any>(null);

  // Filter patients
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cpf.includes(searchQuery)
  );

  const currentPatient = selectedPatientForPEP || patients[0];

  if (!isAllowed) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Acesso Restrito ao Prontuário Eletrônico (PEP)</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          O seu perfil de usuário (<strong>{currentUser.role.toUpperCase()}</strong> no setor <strong>{currentUser.sector}</strong>) não possui autorização para visualizar dados clínicos sensíveis, conforme a <strong>Matriz de Segregação de Funções (SoD)</strong> e as normas da <strong>LGPD</strong>.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200 text-left">
          <p className="font-semibold text-slate-700">Regra de Segurança:</p>
          <p>• Dados clínicos do PEP são restritos aos profissionais de saúde habilitados (Médicos, Enfermagem e Nutrição).</p>
        </div>
      </div>
    );
  }

  // Patient clinical data
  const patientConsultations = consultations.filter((c) => c.patientId === currentPatient?.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === currentPatient?.id);
  const patientDocuments = medicalDocuments.filter((d) => d.patientId === currentPatient?.id);
  const patientExams = examRequests.filter((e) => e.patientId === currentPatient?.id);
  const patientAttachments = attachments.filter((a) => a.patientId === currentPatient?.id);
  const patientApplications = medicationApplications.filter((a) => a.patientId === currentPatient?.id);
  const patientProtocols = protocolAssignments.filter((p) => p.patientId === currentPatient?.id);

  const handleUploadAttachment = () => {
    if (!currentPatient) return;
    const fileName = selectedFileForUpload ? selectedFileForUpload.name : 'Exame_Laboratorial_' + new Date().toLocaleDateString('pt-BR').replace(/\//g, '-') + '.pdf';
    
    addAttachment({
      patientId: currentPatient.id,
      name: fileName,
      type: selectedFileForUpload?.type || 'application/pdf',
      fileSizeFormatted: '1.4 MB',
      dataUrl: '#',
      category: attachmentCategory,
      description: attachmentDesc || 'Resultado de exame anexado ao prontuário.',
      uploadedBy: currentUser.name,
    });

    setSelectedFileForUpload(null);
    setAttachmentDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-luxury text-slate-900">
            PEP — Prontuário Eletrônico do Paciente
          </h1>
          <p className="text-xs text-slate-500">
            Histórico longitudinal, evoluções SOAP, laudos e documentos clínicos auditados.
          </p>
        </div>

        {/* Patient Quick Selector */}
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Trocar paciente por nome/CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-amber-500 outline-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Patient Selector & Right Patient PEP */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Patient List (1 col) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider px-2">
            Pacientes Cadastrados ({filteredPatients.length})
          </h3>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {filteredPatients.map((p) => {
              const isSelected = p.id === currentPatient?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientForPEP(p)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-normal">CPF: {p.cpf}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Complete PEP (3 cols) */}
        {currentPatient ? (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Patient Profile Header Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xl flex items-center justify-center font-serif-luxury shadow-md">
                    {currentPatient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold font-serif-luxury">{currentPatient.name}</h2>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        {currentPatient.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      CPF: {currentPatient.cpf} • Nasc: {currentPatient.birthDate} • Sexo: {currentPatient.gender} • Tipo Sang.: {currentPatient.bloodType || 'N/I'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Contato: {currentPatient.phone} • {currentPatient.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {currentPatient.allergies.length > 0 && (
                    <div className="bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl text-rose-300">
                      <span className="font-bold">Alergias: </span>
                      <span>{currentPatient.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-slate-50/80 overflow-x-auto">
              <button
                onClick={() => setActiveTab('resumo')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'resumo'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Resumo Clínico
              </button>

              <button
                onClick={() => setActiveTab('consultas')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'consultas'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Consultas SOAP ({patientConsultations.length})
              </button>

              <button
                onClick={() => setActiveTab('prescricoes')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'prescricoes'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Prescrições ({patientPrescriptions.length})
              </button>

              <button
                onClick={() => setActiveTab('exames')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'exames'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Exames ({patientExams.length})
              </button>

              <button
                onClick={() => setActiveTab('documentos')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'documentos'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Documentos ({patientDocuments.length})
              </button>

              <button
                onClick={() => setActiveTab('termos')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'termos'
                    ? 'border-indigo-600 text-indigo-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Termos TCLE ({patientConsents.filter((c) => c.patientId === currentPatient?.id).length})
              </button>

              <button
                onClick={() => setActiveTab('aplicacoes')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'aplicacoes'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Aplicações ({patientApplications.length})
              </button>

              <button
                onClick={() => setActiveTab('protocolos')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'protocolos'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Protocolos ({patientProtocols.length})
              </button>

              <button
                onClick={() => setActiveTab('anexos')}
                className={`px-3.5 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'anexos'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Anexos ({patientAttachments.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-6 flex-1 bg-white">
              {/* TAB: RESUMO */}
              {activeTab === 'resumo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider">Doenças Crônicas & Histórico</h4>
                      <p className="text-slate-600">
                        {currentPatient.chronicDiseases.length > 0
                          ? currentPatient.chronicDiseases.join(', ')
                          : 'Nenhuma condição crônica registrada.'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider">Medicações Contínuas</h4>
                      <p className="text-slate-600">
                        {currentPatient.continuousMedications.length > 0
                          ? currentPatient.continuousMedications.join(', ')
                          : 'Nenhuma medicação contínua relatada.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider">Observações Clínicas Gerais</h4>
                    <p className="text-slate-600">{currentPatient.notes || 'Sem observações adicionais.'}</p>
                  </div>

                  {/* Active Protocol Summary */}
                  {patientProtocols.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-700" /> Protocolo Ativo: {patientProtocols[0].protocolName}
                        </h4>
                        <span className="text-purple-800 font-bold">
                          {patientProtocols[0].completedSessions}/{patientProtocols[0].totalSessions} sessões
                        </span>
                      </div>
                      <p className="text-purple-800 text-[11px]">
                        Início: {patientProtocols[0].startDate} | Etapa atual: {patientProtocols[0].currentStep} de {patientProtocols[0].totalSteps}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CONSULTAS SOAP */}
              {activeTab === 'consultas' && (
                <div className="space-y-4">
                  {patientConsultations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Nenhuma consulta realizada para este paciente.</p>
                  ) : (
                    patientConsultations.map((cons) => (
                      <div key={cons.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{cons.date} às {cons.startedAt}</span>
                            <p className="text-[11px] text-slate-500">
                              Profissional: {cons.professionalName} ({cons.specialty})
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                            Consulta Finalizada
                          </span>
                        </div>

                        {/* SOAP Visual Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-amber-700 uppercase">S - Subjetivo</span>
                            <p className="font-semibold text-slate-800">QP: {cons.soap?.chiefComplaint}</p>
                            <p className="text-slate-600 text-[11px]">{cons.soap?.historyOfPresentIllness}</p>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-blue-700 uppercase">O - Objetivo</span>
                            <p className="text-slate-700 text-[11px]">
                              PA: {cons.soap?.vitals?.bloodPressure} | FC: {cons.soap?.vitals?.heartRate}bpm | Peso: {cons.soap?.vitals?.weight}kg | IMC: {cons.soap?.vitals?.imc}
                            </p>
                            <p className="text-slate-600 text-[11px]">{cons.soap?.physicalExam}</p>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-purple-700 uppercase">A - Avaliação</span>
                            <p className="font-semibold text-slate-800">{cons.soap?.clinicalAssessment}</p>
                            {cons.soap?.diagnoses?.map((d, i) => (
                              <span key={i} className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-mono">
                                {d.code} - {d.description}
                              </span>
                            ))}
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">P - Plano</span>
                            <p className="text-slate-700">{cons.soap?.conduct}</p>
                            <p className="text-slate-500 text-[10px] italic">Retorno em {cons.soap?.followUpDays || 30} dias</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: PRESCRICOES */}
              {activeTab === 'prescricoes' && (
                <div className="space-y-4">
                  {patientPrescriptions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Nenhuma prescrição emitida.</p>
                  ) : (
                    patientPrescriptions.map((presc) => (
                      <div key={presc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-900">Prescrição Médica - {presc.date}</span>
                          <span className="text-[11px] text-slate-500">{presc.professionalName} ({presc.professionalCouncil})</span>
                        </div>
                        <div className="space-y-2">
                          {presc.items.map((item, i) => (
                            <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                              <span className="font-bold text-amber-700">{i + 1}.</span>
                              <div>
                                <p className="font-bold text-slate-800">{item.medicationName} ({item.dosage}) - {item.route}</p>
                                <p className="text-slate-600 text-[11px]">Uso: {item.frequency} por {item.duration}</p>
                                {item.instructions && <p className="text-slate-400 text-[10px] italic">{item.instructions}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: DOCUMENTOS */}
              {activeTab === 'documentos' && (
                <div className="space-y-3">
                  {patientDocuments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Nenhum documento médico emitido.</p>
                  ) : (
                    patientDocuments.map((doc) => (
                      <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{doc.type} — {doc.date}</p>
                          <p className="text-[11px] text-slate-500">Emitido por: {doc.professionalName}</p>
                          {doc.daysOff && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                              {doc.daysOff} dias de afastamento
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowPrintDoc(doc)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" /> Ver / Imprimir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: ANEXOS */}
              {activeTab === 'anexos' && (
                <div className="space-y-6">
                  {/* Upload Box */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3 text-xs">
                    <h4 className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-700" /> Anexar Documento ou Exame ao Prontuário
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Categoria</label>
                        <select
                          value={attachmentCategory}
                          onChange={(e) => setAttachmentCategory(e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        >
                          <option value="Exame Laboratorial">Exame Laboratorial</option>
                          <option value="Imagem/Laudo">Imagem / Laudo</option>
                          <option value="Documento">Documento Externo</option>
                          <option value="Fotografia Clínica">Fotografia Clínica</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-600">Descrição do Arquivo</label>
                        <input
                          type="text"
                          placeholder="Ex: Hemograma completo 25/08/2026 - Laboratório Fleury"
                          value={attachmentDesc}
                          onChange={(e) => setAttachmentDesc(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg"
                        onChange={(e) => setSelectedFileForUpload(e.target.files?.[0] || null)}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                      />
                      <button
                        onClick={handleUploadAttachment}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Salvar no Prontuário
                      </button>
                    </div>
                  </div>

                  {/* Attachments List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Arquivos Vinculados Permanentemente ({patientAttachments.length})
                    </h4>
                    {patientAttachments.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Nenhum anexo registrado.</p>
                    ) : (
                      patientAttachments.map((att) => (
                        <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-4 h-4 text-amber-600" />
                            <div>
                              <p className="font-bold text-slate-800">{att.name}</p>
                              <p className="text-[10px] text-slate-500">{att.category} • {att.uploadedAt} por {att.uploadedBy}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">{att.fileSizeFormatted}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: TERMOS DE CONSENTIMENTO (TCLE) */}
              {activeTab === 'termos' && (
                <PatientConsentHistoryTab patient={currentPatient} />
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
            Selecione um paciente na lista para visualizar o prontuário eletrônico.
          </div>
        )}
      </div>

      {/* Printable Doc Viewer */}
      {showPrintDoc && (
        <PrintableDocument
          title={showPrintDoc.type}
          patientName={showPrintDoc.patientName}
          patientCpf={showPrintDoc.patientCpf}
          content={showPrintDoc.content}
          date={showPrintDoc.date}
          professionalName={showPrintDoc.professionalName}
          professionalCouncil={showPrintDoc.professionalCouncil}
          daysOff={showPrintDoc.daysOff}
          cidCode={showPrintDoc.cidCode}
          cidDescription={showPrintDoc.cidDescription}
          onClose={() => setShowPrintDoc(null)}
        />
      )}
    </div>
  );
};
