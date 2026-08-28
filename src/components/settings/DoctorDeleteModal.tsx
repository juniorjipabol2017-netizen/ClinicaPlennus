import React, { useState, useEffect } from 'react';
import { Professional } from '../../types';
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserX,
  Stethoscope,
  Info,
  Lock,
} from 'lucide-react';

interface DoctorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  onConfirmDelete: (id: string) => void;
  adminName: string;
}

export const DoctorDeleteModal: React.FC<DoctorDeleteModalProps> = ({
  isOpen,
  onClose,
  professional,
  onConfirmDelete,
  adminName,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedName, setTypedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTypedName('');
      setIsDeleting(false);
    }
  }, [isOpen, professional]);

  if (!isOpen || !professional) return null;

  const isDoctor =
    professional.council === 'CRM' ||
    professional.role === 'medico' ||
    professional.specialty?.toLowerCase().includes('médic');

  const targetTitle = isDoctor ? 'Médico' : 'Profissional';
  const isNameExactMatch = typedName.trim() === professional.name.trim();

  const handleExecuteDelete = () => {
    if (!isNameExactMatch) return;
    setIsDeleting(true);
    try {
      onConfirmDelete(professional.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header (Red / Caution banner) */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded font-bold">
                Ação Crítica de Governança
              </span>
              <h3 className="text-lg font-bold font-serif-luxury mt-0.5">
                Excluir Definitivamente {targetTitle}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Professional Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 font-serif-luxury border border-amber-200 text-sm">
                {professional.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{professional.name}</h4>
                <p className="text-xs text-slate-600">
                  {professional.council} {professional.registrationNumber} • {professional.specialty || 'Clínica Geral'}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-lg shrink-0">
              Alvo da Exclusão
            </span>
          </div>

          {/* STEP 1: WARNING & SCOPE CLARIFICATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>⚠️ ATENÇÃO</span>
                </div>
                <p className="leading-relaxed">
                  Você está prestes a excluir definitivamente este {targetTitle.toLowerCase()}.
                </p>
                <p className="leading-relaxed">
                  Essa ação poderá remover os dados relacionados exclusivamente a este profissional, incluindo consultas e atendimentos realizados por ele.
                </p>
                <p className="font-semibold text-amber-900 leading-relaxed">
                  Essa ação não deverá afetar pacientes, outros profissionais ou informações não relacionadas a este {targetTitle.toLowerCase()}.
                </p>
                <p className="font-bold text-slate-900 pt-1">Deseja continuar?</p>
              </div>

              {/* Guarantees Box */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 space-y-1.5">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Isolamento Cirúrgico e Salvaguardas:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-900/90 pl-1">
                  <li><strong>Pacientes:</strong> Permanecem 100% cadastrados e intactos.</li>
                  <li><strong>Outros Profissionais:</strong> Nenhuma alteração em médicos, enfermeiros ou recepção.</li>
                  <li><strong>Estoque e Medicamentos:</strong> Sem impacto em lotes ou inventário.</li>
                  <li><strong>Financeiro & Documentos:</strong> Registros da clínica e notas fiscais preservados.</li>
                  <li><strong>Auditoria:</strong> Ação imutavelmente registrada pelo Administrador <strong>{adminName}</strong>.</li>
                </ul>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirm-step1-delete-doctor"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-200 flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MANDATORY EXACT NAME CONFIRMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Para confirmar a exclusão definitiva, digite o nome completo do {targetTitle.toLowerCase()}:
                </label>
                <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 select-all border border-slate-200 font-bold">
                  {professional.name}
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder={`Digite exatamente: ${professional.name}`}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                    isNameExactMatch
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Real-time Match Feedback */}
              {typedName.length > 0 && (
                <div className="text-[11px] flex items-center gap-1.5">
                  {isNameExactMatch ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nome conferido com sucesso. Exclusão definitiva liberada.
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      O nome digitado deve ser exatamente igual a "{professional.name}".
                    </span>
                  )}
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Esta operação é irreversível. Após a confirmação, o {targetTitle.toLowerCase()} será excluído do sistema e um registro permanente de auditoria será gerado.
                </span>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="btn-execute-delete-doctor-definitivo"
                    disabled={!isNameExactMatch || isDeleting}
                    onClick={handleExecuteDelete}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md ${
                      isNameExactMatch && !isDeleting
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer animate-pulse'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Excluindo...' : 'Excluir definitivamente'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
