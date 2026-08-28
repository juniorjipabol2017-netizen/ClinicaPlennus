import React from 'react';
import { Medication } from '../../types';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface DeleteMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  medication: Medication | null;
  hasHistoricalUsage: boolean;
}

export const DeleteMedicationModal: React.FC<DeleteMedicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  medication,
  hasHistoricalUsage,
}) => {
  if (!isOpen || !medication) return null;

  return (
    <div
      id="delete-medication-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
    >
      <div
        id="delete-medication-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-rose-50 border-b border-rose-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950 font-serif-luxury">
              {hasHistoricalUsage ? 'Inativar Medicamento' : 'Excluir Medicamento'}
            </h3>
            <p className="text-xs text-rose-700">Controle e Preservação de Estoque</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <p>
            Tem certeza de que deseja {hasHistoricalUsage ? 'inativar' : 'excluir'} o medicamento{' '}
            <strong className="text-slate-900 font-bold">{medication.name}</strong> ({medication.presentation} - {medication.dosage || ''})?
          </p>

          {hasHistoricalUsage ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11px]">
                <p className="font-bold">Preservação Histórica Ativa</p>
                <p className="text-amber-800 leading-relaxed">
                  Este medicamento possui histórico de aplicações, movimentações ou prescrições registradas. Ele será <strong>inativado do catálogo</strong> para que nenhum dado histórico ou auditoria clínica seja perdido.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              Como este item ainda não possui histórico de movimentação ou aplicação registrado no sistema, ele será removido do catálogo de estoque.
            </p>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="cancel-delete-medication-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              id="confirm-delete-medication-btn"
              type="button"
              onClick={() => {
                onConfirm(medication.id);
                onClose();
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {hasHistoricalUsage ? 'Confirmar Inativação' : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
