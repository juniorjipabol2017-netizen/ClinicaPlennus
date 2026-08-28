import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlennusLogo } from './PlennusLogo';

interface PrintableDocumentProps {
  title: string;
  patientName: string;
  patientCpf: string;
  patientBirthDate?: string;
  content: string;
  date: string;
  professionalName: string;
  professionalCouncil: string;
  professionalSpecialty?: string;
  cidCode?: string;
  cidDescription?: string;
  daysOff?: number;
  destination?: string;
  onClose?: () => void;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  title,
  patientName,
  patientCpf,
  patientBirthDate,
  content,
  date,
  professionalName,
  professionalCouncil,
  professionalSpecialty,
  cidCode,
  cidDescription,
  daysOff,
  destination,
  onClose,
}) => {
  const { clinicConfig } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h3 className="font-semibold text-sm">Visualização de Impressão Oficial - {title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir / Salvar PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 text-slate-300 hover:text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>

        {/* Printable Document Paper Canvas */}
        <div
          id="printable-document"
          className="p-10 bg-white text-slate-800 min-h-[700px] flex flex-col justify-between"
          style={{ fontFamily: clinicConfig.branding?.fontFamily || 'Montserrat, sans-serif' }}
        >
          {/* Header */}
          <div>
            <div
              className="flex items-center justify-between border-b-2 pb-6 mb-8"
              style={{ borderColor: clinicConfig.branding?.secondaryColor || '#ca8a04' }}
            >
              <PlennusLogo size="md" textColor="dark" customLogoUrl={clinicConfig.logoUrl} />
              <div className="text-right text-xs space-y-0.5">
                <p
                  style={{
                    color: clinicConfig.branding?.clinicNameColor || '#0f172a',
                    fontWeight: clinicConfig.branding?.clinicNameWeight === 'bold' ? 700 : 600,
                    fontSize:
                      clinicConfig.branding?.clinicNameSize === 'xl'
                        ? '1.25rem'
                        : clinicConfig.branding?.clinicNameSize === 'lg'
                        ? '1.1rem'
                        : '0.95rem',
                  }}
                >
                  {clinicConfig.clinicName}
                </p>
                <p style={{ color: clinicConfig.branding?.infoColor || '#64748b' }}>
                  {clinicConfig.tagline} • Resp: {clinicConfig.technicalDirector} ({clinicConfig.technicalDirectorCrm})
                </p>
                <p style={{ color: clinicConfig.branding?.addressColor || '#64748b' }}>{clinicConfig.address}</p>
                <p style={{ color: clinicConfig.branding?.contactColor || '#ca8a04', fontWeight: 500 }}>
                  Tel: {clinicConfig.phone} | Instagram: {clinicConfig.instagram}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">CNPJ: {clinicConfig.cnpj}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-8">
              <h1
                className="text-2xl font-serif-luxury font-bold uppercase tracking-wider underline underline-offset-8"
                style={{
                  color: clinicConfig.branding?.primaryColor || '#0f172a',
                  textDecorationColor: clinicConfig.branding?.accentColor || '#ca8a04',
                }}
              >
                {title}
              </h1>
              {destination && (
                <p className="text-xs text-slate-500 mt-2 italic">A/C: {destination}</p>
              )}
            </div>

            {/* Patient Identification Bar */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-8 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Paciente: </span>
                <span className="text-slate-900 font-bold">{patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">CPF: </span>
                <span className="text-slate-900 font-semibold">{patientCpf}</span>
              </div>
              {patientBirthDate && (
                <div>
                  <span className="text-slate-500 font-medium">Data de Nascimento: </span>
                  <span className="text-slate-900">{patientBirthDate}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 font-medium">Data de Emissão: </span>
                <span className="text-slate-900">{date}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line px-2 space-y-4">
              <p>{content}</p>

              {daysOff && daysOff > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs font-semibold rounded-r">
                  Necessita de repouso e afastamento de suas atividades por um período de {daysOff} ({daysOff === 1 ? 'um dia' : `${daysOff} dias`}) a contar desta data.
                </div>
              )}

              {cidCode && (
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold">CID-10: </span>
                  <span>{cidCode} {cidDescription ? `- ${cidDescription}` : ''}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">(Divulgação autorizada pelo paciente conforme Resolução CFM)</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-64 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-900 text-sm">{professionalName}</p>
              <p className="text-xs text-slate-600">{professionalCouncil}</p>
              {professionalSpecialty && (
                <p className="text-xs text-slate-500">{professionalSpecialty}</p>
              )}
              <div className="mt-6 space-y-1 text-center w-full text-[10px] text-slate-500 border-t border-slate-100 pt-3">
                {clinicConfig.footerMessage && (
                  <p className="italic font-medium text-slate-600">{clinicConfig.footerMessage}</p>
                )}
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>Responsável Técnico: {clinicConfig.technicalDirector} ({clinicConfig.technicalDirectorCrm})</span>
                  <span>Documento emitido eletronicamente via Sistema Plennus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
