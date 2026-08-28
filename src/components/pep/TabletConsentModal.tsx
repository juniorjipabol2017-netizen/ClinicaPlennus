import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsentTermTemplate, Patient, PatientConsentDocument } from '../../types';
import {
  Tablet,
  FileCheck2,
  AlertTriangle,
  X,
  RotateCcw,
  CheckCircle2,
  Shield,
  Clock,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { PlennusLogo } from '../common/PlennusLogo';

interface TabletConsentModalProps {
  patient: Patient;
  template: ConsentTermTemplate;
  consultationId?: string;
  appointmentId?: string;
  procedureName?: string;
  onClose: () => void;
  onComplete?: (doc: PatientConsentDocument) => void;
}

export const TabletConsentModal: React.FC<TabletConsentModalProps> = ({
  patient,
  template,
  consultationId,
  appointmentId,
  procedureName,
  onClose,
  onComplete,
}) => {
  const {
    clinicConfig,
    currentUser,
    addPatientConsent,
    refusePatientConsent,
    showToast,
  } = useApp();

  // Declarations checkboxes state
  const [checkedDeclarations, setCheckedDeclarations] = useState<boolean[]>(() =>
    template.requiredDeclarations.map(() => false)
  );

  // Additional custom fields state
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    template.customFields?.forEach((f) => {
      initial[f.id] = f.defaultValue || '';
    });
    return initial;
  });

  // Text zoom level
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasPatientSignature, setHasPatientSignature] = useState(false);

  // Refusal modal state
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');

  // Confirmation screen
  const [isFinalized, setIsFinalized] = useState(false);
  const [createdDoc, setCreatedDoc] = useState<PatientConsentDocument | null>(null);

  // Initialize canvas with clear background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasPatientSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasPatientSignature(false);
  };

  const handleToggleDeclaration = (index: number) => {
    setCheckedDeclarations((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const allDeclarationsChecked = checkedDeclarations.every(Boolean);

  // Validation: are required custom fields filled?
  const areCustomFieldsValid = (template.customFields || []).every((f) => {
    if (!f.required) return true;
    const val = customFieldValues[f.id];
    return val !== undefined && val !== '';
  });

  const canSignAndFinalize = allDeclarationsChecked && hasPatientSignature && areCustomFieldsValid;

  const handleFinalizeSigning = () => {
    if (!canSignAndFinalize) return;

    const canvas = canvasRef.current;
    const patientSignatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    const signedDoc = addPatientConsent({
      templateId: template.id,
      templateName: template.name,
      treatmentCategory: template.treatmentCategory,
      version: template.version,
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      patientBirthDate: patient.birthDate,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      professionalId: currentUser.id,
      professionalName: currentUser.name,
      professionalCouncil: currentUser.councilNumber || 'CRM/SP',
      professionalSpecialty: currentUser.specialty,
      consultationId,
      appointmentId,
      procedureName: procedureName || template.treatmentCategory,
      fullText: template.fullText,
      checkedDeclarations: template.requiredDeclarations.map((text, idx) => ({
        text,
        checked: checkedDeclarations[idx],
        checkedAt: new Date().toISOString(),
      })),
      additionalFieldValues: customFieldValues,
      patientSignatureDataUrl,
      professionalSignatureDataUrl: '',
      signedAt: new Date().toISOString(),
      deviceInfo: `Tablet da Clínica Plennus (Navegador Touch / ${window.navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvel' : 'Estação Touch'})`,
      status: 'assinado',
      initiatedByUserName: currentUser.name,
      finalizedByUserName: patient.name,
    });

    setCreatedDoc(signedDoc);
    setIsFinalized(true);

    if (onComplete) {
      onComplete(signedDoc);
    }
  };

  const handleConfirmRefusal = () => {
    if (!refusalReason.trim()) {
      showToast('Por favor, informe o motivo da não assinatura/recusa.', 'error');
      return;
    }
    const refusedDoc = refusePatientConsent(
      patient.id,
      template.id,
      refusalReason,
      procedureName || template.treatmentCategory
    );
    setShowRefusalModal(false);
    onClose();
    if (onComplete) {
      onComplete(refusedDoc);
    }
  };

  if (isFinalized && createdDoc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Termo Assinado com Sucesso
            </span>
            <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
              Consentimento Registrado no PEP
            </h2>
            <p className="text-xs text-slate-500">
              O documento foi validado, assinado pelo paciente e armazenado permanentemente no prontuário eletrônico.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Identificador:</span>
              <span className="font-mono font-bold text-slate-800">{createdDoc.documentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Paciente:</span>
              <span className="font-semibold text-slate-800">{createdDoc.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Versão do Termo:</span>
              <span className="font-bold text-indigo-700">v{createdDoc.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Data / Hora:</span>
              <span className="text-slate-700">{new Date(createdDoc.signedAt || '').toLocaleString('pt-BR')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono break-all">
              Hash de Integridade: {createdDoc.immutableHash}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Concluir e Devolver Tablet ao Profissional
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-900 overflow-hidden select-none">
      {/* Tablet Safe Header */}
      <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Tablet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Modo Tablet — Assinatura do Paciente
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Ambiente Protegido
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold font-serif-luxury text-slate-100">
              {template.name}
            </h1>
          </div>
        </div>

        {/* Font Zoom Controls & Close Safe Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                fontSize === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Texto Normal"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                fontSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Texto Grande"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('xlarge')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                fontSize === 'xlarge' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Texto Extra Grande"
            >
              A++
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Cancelar e Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Patient Reading & Signing Canvas Split View */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="max-w-4xl w-full space-y-6">
          {/* Institutional Document Header Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <PlennusLogo size="md" textColor="dark" customLogoUrl={clinicConfig.logoUrl} />
              <div className="text-right text-xs text-slate-500">
                <p className="font-bold text-slate-800">{clinicConfig.clinicName}</p>
                <p className="text-[11px]">{clinicConfig.tagline}</p>
                <p className="text-[11px]">CNPJ: {clinicConfig.cnpj}</p>
              </div>
            </div>

            {/* Patient Auto-filled Data Banner */}
            <div className="bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/40 rounded-2xl p-4 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Paciente
                </span>
                <span className="font-bold text-slate-900">{patient.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  CPF
                </span>
                <span className="font-semibold text-slate-800">{patient.cpf}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Data de Nascimento
                </span>
                <span className="text-slate-800">{patient.birthDate || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Procedimento / Categoria
                </span>
                <span className="font-bold text-indigo-700">{procedureName || template.treatmentCategory}</span>
              </div>
            </div>

            {/* Document Full Text Body with dynamic font size */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold font-serif-luxury text-slate-900">
                  {template.name} (Versão {template.version})
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">
                  Documento Auditado
                </span>
              </div>

              <div
                className={`p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line ${
                  fontSize === 'normal'
                    ? 'text-sm'
                    : fontSize === 'large'
                    ? 'text-base leading-8'
                    : 'text-lg leading-9'
                }`}
              >
                {template.fullText}
              </div>
            </div>

            {/* Custom Extra Fields if configured */}
            {template.customFields && template.customFields.length > 0 && (
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Informações Complementares do Paciente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {template.customFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={customFieldValues[field.id] || ''}
                          onChange={(e) =>
                            setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={customFieldValues[field.id] || ''}
                          onChange={(e) =>
                            setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                          placeholder="Digite aqui..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Declarations Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" /> Declarações Obrigatórias do Paciente
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {checkedDeclarations.filter(Boolean).length} de {template.requiredDeclarations.length} marcadas
                </span>
              </div>

              <div className="space-y-2">
                {template.requiredDeclarations.map((decText, idx) => {
                  const isChecked = checkedDeclarations[idx];
                  return (
                    <label
                      key={idx}
                      onClick={() => handleToggleDeclaration(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                      />
                      <span className="text-xs leading-relaxed">{decText}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Digital Signature Canvas Section */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    ✍️ Assinatura Digital do Paciente na Tela
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Utilize o dedo ou a caneta stylus no espaço abaixo para assinar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpar / Refazer
                </button>
              </div>

              <div className="relative border-2 border-dashed border-indigo-200 rounded-3xl bg-slate-50/80 p-2 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 bg-white rounded-2xl touch-none cursor-crosshair shadow-inner"
                />

                {!hasPatientSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                    Toque e assine aqui com o dedo ou caneta stylus
                  </div>
                )}
              </div>

              {/* Responsible Professional Stamp */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div>
                  <span className="font-semibold text-slate-800">Profissional Responsável: </span>
                  <span>{currentUser.name} ({currentUser.councilNumber || 'CRM/SP'})</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Bottom Finalize Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowRefusalModal(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold underline transition"
              >
                Não concordo / Não desejo assinar este termo
              </button>

              <button
                type="button"
                disabled={!canSignAndFinalize}
                onClick={handleFinalizeSigning}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  canSignAndFinalize
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white cursor-pointer shadow-indigo-200 scale-100 hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Finalizar e Registrar Consentimento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refusal Modal */}
      {showRefusalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registrar Não Concordância / Recusa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conforme exigência do Conselho e auditoria do PEP, informe o motivo pelo qual o termo não foi assinado.
              </p>
            </div>

            <textarea
              rows={3}
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="Ex: Paciente optou por não realizar o procedimento nesta data por motivos pessoais..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRefusalModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmRefusal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Confirmar Recusa no PEP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
