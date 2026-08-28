import React, { useState, useEffect } from 'react';
import { Medication, InventoryMovement } from '../../types';
import { X, Boxes, Save, Plus, Minus, RefreshCw } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  initialMedicationId?: string;
  onSaveMovement: (data: Omit<InventoryMovement, 'id' | 'date'>) => void;
  responsibleName: string;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  medications,
  initialMedicationId,
  onSaveMovement,
  responsibleName,
}) => {
  const [medicationId, setMedicationId] = useState('');
  const [type, setType] = useState<'entrada' | 'saida' | 'ajuste' | 'estorno'>('entrada');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('Reposição periódica de fornecedor');

  useEffect(() => {
    if (initialMedicationId) {
      setMedicationId(initialMedicationId);
    } else if (medications.length > 0 && !medicationId) {
      setMedicationId(medications[0].id);
    }
  }, [initialMedicationId, medications]);

  if (!isOpen) return null;

  const selectedMed = medications.find((m) => m.id === medicationId);
  const currentStock = selectedMed ? selectedMed.stockQuantity : 0;

  let calculatedNewQuantity = currentStock;
  if (type === 'entrada') calculatedNewQuantity = currentStock + (Number(quantity) || 0);
  else if (type === 'saida') calculatedNewQuantity = Math.max(0, currentStock - (Number(quantity) || 0));
  else if (type === 'ajuste') calculatedNewQuantity = Math.max(0, Number(quantity) || 0);
  else if (type === 'estorno') calculatedNewQuantity = currentStock + (Number(quantity) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    onSaveMovement({
      medicationId: selectedMed.id,
      medicationName: selectedMed.name,
      type,
      quantity: Number(quantity) || 0,
      previousQuantity: currentStock,
      newQuantity: calculatedNewQuantity,
      reason: reason.trim() || 'Movimentação manual de estoque',
      responsibleName,
      time: new Date().toTimeString().substring(0, 5),
    });

    onClose();
  };

  return (
    <div
      id="stock-movement-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
    >
      <div
        id="stock-movement-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-luxury">Lançar Movimentação de Estoque</h3>
              <p className="text-xs text-amber-100">Entrada, Saída, Ajuste Físico e Estorno</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-amber-200 hover:text-white hover:bg-amber-800/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Medicamento *</label>
            <select
              required
              value={medicationId}
              onChange={(e) => setMedicationId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-amber-500 transition"
            >
              <option value="">Selecione o medicamento...</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.presentation} - {m.dosage || ''}) — Saldo Atual: {m.stockQuantity} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Tipo de Movimento *</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setType(newType);
                  if (newType === 'entrada') setReason('Entrada por nota fiscal / reposição');
                  else if (newType === 'saida') setReason('Saída para descarte / avaria');
                  else if (newType === 'ajuste') setReason('Ajuste de inventário físico periódico');
                  else if (newType === 'estorno') setReason('Estorno de aplicação cancelada');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition"
              >
                <option value="entrada">Entrada (+)</option>
                <option value="saida">Saída (-)</option>
                <option value="ajuste">Ajuste de Balanço (=)</option>
                <option value="estorno">Estorno (+)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                {type === 'ajuste' ? 'Novo Saldo Total' : 'Quantidade Movimentada'} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Balance Preview Card */}
          {selectedMed && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Saldo Anterior</span>
                <span className="font-bold text-slate-700 text-sm">
                  {currentStock} {selectedMed.unit}
                </span>
              </div>

              <div className="text-center font-bold text-slate-400">➔</div>

              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Novo Saldo Calculado</span>
                <span className="font-bold text-amber-700 text-base">
                  {calculatedNewQuantity} {selectedMed.unit}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Motivo / Justificativa da Movimentação *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: NF 48192, contagem física mensal..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 transition"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-200 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lançar Movimentação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
