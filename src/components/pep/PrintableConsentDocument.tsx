import React from 'react';
import { useApp } from '../../context/AppContext';
import { PatientConsentDocument } from '../../types';
import { PlennusLogo } from '../common/PlennusLogo';
import { Printer, X, ShieldCheck, Check, Clock } from 'lucide-react';

interface PrintableConsentDocumentProps {
  document: PatientConsentDocument;
  onClose: () => void;
}

export const PrintableConsentDocument: React.FC<PrintableConsentDocumentProps> = ({
  document,
  onClose,
}) => {
  const { clinicConfig } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = document.signedAt
    ? new Date(document.signedAt).toLocaleDateString('pt-BR')
    : new Date(document.createdAt).toLocaleDateString('pt-BR');

  const formattedTime = document.signedAt
    ? new Date(document.signedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : new Date(document.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div>
              <h3 className="font-bold text-sm">
                Documento Oficial TCLE — {document.documentCode}
              </h3>
              <p className="text-[10px] text-slate-400">
                Imutável • Armazenado no Prontuário Eletrônico
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div
          id="printable-tcle-document"
          className="p-10 sm:p-14 bg-white text-slate-900 font-sans min-h-[900px] flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-6 mb-8">
              <PlennusLogo size="md" textColor="dark" customLogoUrl={clinicConfig.logoUrl} />
              <div className="text-right text-xs text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900">{clinicConfig.clinicName}</p>
                <p className="text-[11px] text-slate-500">{clinicConfig.address}</p>
                <p className="text-[11px] text-slate-500">
                  Tel: {clinicConfig.phone} • CNPJ: {clinicConfig.cnpj}
                </p>
                <p className="text-[11px] text-slate-500">
                  Dir. Técnico: {clinicConfig.technicalDirector} ({clinicConfig.technicalDirectorCrm})
                </p>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="text-center my-6 space-y-1">
              <h1 className="text-xl font-bold font-serif-luxury text-slate-900 uppercase tracking-wide">
                {document.templateName}
              </h1>
              <p className="text-xs font-semibold text-indigo-700">
                Categoria: {document.treatmentCategory} • Versão {document.version}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Código de Autenticação: {document.documentCode}
              </p>
            </div>

            {/* Patient Identification Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block text-[10px] uppercase">
                  Paciente
                </span>
                <span className="text-slate-900 font-bold">{document.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block text-[10px] uppercase">
                  CPF
                </span>
                <span className="text-slate-900 font-semibold">{document.patientCpf}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block text-[10px] uppercase">
                  Data de Emissão
                </span>
                <span className="text-slate-900 font-medium">
                  {formattedDate} às {formattedTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block text-[10px] uppercase">
                  Status
                </span>
                <span
                  className={`font-bold capitalize ${
                    document.status === 'assinado'
                      ? 'text-emerald-700'
                      : document.status === 'recusado'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}
                >
                  {document.status}
                </span>
              </div>
            </div>

            {/* Legal Terms Text */}
            <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line px-2 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
              {document.fullText}
            </div>

            {/* Additional Field Values if any */}
            {document.additionalFieldValues && Object.keys(document.additionalFieldValues).length > 0 && (
              <div className="mb-6 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs space-y-1.5">
                <h4 className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
                  Informações Adicionais Registradas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  {Object.entries(document.additionalFieldValues).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-semibold text-slate-900 capitalize">
                        {k.replace(/_/g, ' ')}:{' '}
                      </span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Declarations Checklist Verified */}
            <div className="mb-6 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Declarações de Consentimento e Ciência:
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {document.checkedDeclarations.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{d.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refusal Notice if applicable */}
            {document.status === 'recusado' && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 mb-6 space-y-1">
                <p className="font-bold">⚠️ Registro Formal de Recusa / Não Concordância</p>
                <p>
                  Motivo: <em>{document.refusalReason}</em>
                </p>
                <p className="text-[10px] text-rose-700">
                  Registrado em: {new Date(document.refusedAt || '').toLocaleString('pt-BR')} por {document.initiatedByUserName}.
                </p>
              </div>
            )}
          </div>

          {/* Signatures & Footer Box */}
          <div className="pt-8 mt-6 border-t-2 border-slate-200 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Patient Signature Stamp */}
              <div className="text-center space-y-2">
                <div className="h-20 flex items-center justify-center">
                  {document.patientSignatureDataUrl ? (
                    <img
                      src={document.patientSignatureDataUrl}
                      alt="Assinatura do Paciente"
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      {document.status === 'recusado' ? 'Não assinado (Recusado)' : 'Assinatura Pendente'}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-xs text-slate-900">{document.patientName}</p>
                  <p className="text-[10px] text-slate-500">Paciente — CPF {document.patientCpf}</p>
                </div>
              </div>

              {/* Professional Signature & Seal */}
              <div className="text-center space-y-2">
                <div className="h-20 flex items-center justify-center">
                  <div className="p-2 border border-indigo-200 rounded-xl bg-indigo-50/50 text-indigo-950 text-center">
                    <p className="text-[11px] font-bold font-serif-luxury">{document.professionalName}</p>
                    <p className="text-[10px] text-indigo-700">{document.professionalCouncil}</p>
                    <p className="text-[9px] text-slate-500">{document.professionalSpecialty || 'Responsável Clínico'}</p>
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-xs text-slate-900">{document.professionalName}</p>
                  <p className="text-[10px] text-slate-500">Profissional Responsável — {document.professionalCouncil}</p>
                </div>
              </div>
            </div>

            {/* Audit Trail & Hash Bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Documento assinado digitalmente no tablet. Registro auditado e imutável.</span>
              </div>
              <div className="font-mono text-slate-400 text-[9px] truncate">
                Hash: {document.immutableHash}
              </div>
            </div>

            {/* Institutional Footer Message (Configured in Settings & SoD) */}
            {clinicConfig.footerMessage && (
              <p className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 italic">
                {clinicConfig.footerMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
