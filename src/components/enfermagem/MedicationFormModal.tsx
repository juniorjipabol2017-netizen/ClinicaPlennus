import React, { useState, useEffect } from 'react';
import { Medication } from '../../types';
import { X, Pill, Save, AlertCircle, Sparkles } from 'lucide-react';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Medication, 'id'>) => void;
  medicationToEdit?: Medication | null;
}

export const PRESENTATION_OPTIONS = [
  'Ampola',
  'Frasco',
  'Frasco-ampola',
  'Caneta Injetável',
  'Comprimido',
  'Cápsula',
  'Sachê',
  'Bisnaga',
  'Tubo',
  'Gotas',
  'Solução',
  'Suspensão',
  'Creme',
  'Pomada',
  'Spray',
  'Bolsa Infusional',
  'Outros',
];

export const UNIT_OPTIONS = [
  'Unidade',
  'Ampola',
  'Frasco',
  'Caixa',
  'Comprimido',
  'Cápsula',
  'mL',
  'mg',
  'g',
  'Outros',
];

export const CATEGORY_OPTIONS = [
  'Medicamento',
  'Vitamina',
  'Hormônio',
  'Injetável',
  'Suplemento',
  'Material assistencial',
  'Estético',
  'Analgésico/Anti-inflamatório',
  'Antibiótico',
  'Outros',
];

export const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicationToEdit,
}) => {
  const [name, setName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [presentation, setPresentation] = useState('Ampola');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('Ampola');
  const [category, setCategory] = useState('Medicamento');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [price, setPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name || '');
      setActiveIngredient(medicationToEdit.activeIngredient || '');
      setPresentation(medicationToEdit.presentation || 'Ampola');
      setDosage(medicationToEdit.dosage || '');
      setUnit(medicationToEdit.unit || 'Ampola');
      setCategory(medicationToEdit.category || 'Medicamento');
      setStockQuantity(medicationToEdit.stockQuantity ?? 0);
      setMinStock(medicationToEdit.minStock ?? 5);
      setPrice(medicationToEdit.price ?? 0);
      setSupplier(medicationToEdit.supplier || '');
      setBatchNumber(medicationToEdit.batchNumber || '');
      setExpirationDate(medicationToEdit.expirationDate || '');
      setStatus(medicationToEdit.status || 'ativo');
      setNotes(medicationToEdit.notes || '');
    } else {
      setName('');
      setActiveIngredient('');
      setPresentation('Ampola');
      setDosage('');
      setUnit('Ampola');
      setCategory('Medicamento');
      setStockQuantity(10);
      setMinStock(5);
      setPrice(0);
      setSupplier('');
      setBatchNumber('');
      // Default expiration date to 1 year ahead
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpirationDate(nextYear.toISOString().substring(0, 10));
      setStatus('ativo');
      setNotes('');
    }
  }, [medicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      activeIngredient: activeIngredient.trim(),
      presentation,
      dosage: dosage.trim(),
      unit,
      category,
      stockQuantity: Number(stockQuantity) || 0,
      minStock: Number(minStock) || 0,
      price: Number(price) || 0,
      supplier: supplier.trim(),
      batchNumber: batchNumber.trim() || 'LT-' + new Date().getFullYear(),
      expirationDate: expirationDate || undefined,
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      id="medication-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="medication-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-luxury tracking-wide">
                {medicationToEdit ? 'Editar Medicamento no Estoque' : 'Adicionar Novo Medicamento'}
              </h2>
              <p className="text-xs text-slate-300">
                {medicationToEdit
                  ? `Atualização cadastral de: ${medicationToEdit.name}`
                  : 'Cadastro de produto farmacêutico e controle de estoque'}
              </p>
            </div>
          </div>
          <button
            id="close-medication-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
          {/* Row 1: Name & Active Ingredient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nome do Medicamento / Comercial <span className="text-rose-500">*</span>
              </label>
              <input
                id="medication-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tirzepatida (Mounjaro), Complexo B..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Princípio Ativo / Composição Química
              </label>
              <input
                id="medication-active-ingredient-input"
                type="text"
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                placeholder="Ex: Cianocobalamina, Ácido Poli-L-Lático..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {/* Row 2: Presentation, Dosage, Unit, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Apresentação <span className="text-rose-500">*</span>
              </label>
              <select
                id="medication-presentation-select"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              >
                {PRESENTATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Dosagem / Concentração</label>
              <input
                id="medication-dosage-input"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 1.000 mcg, 500 mg, 5 mg/0,5 mL"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Unidade de Medida <span className="text-rose-500">*</span>
              </label>
              <select
                id="medication-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                id="medication-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Stock Quantity, Min Stock, Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Quantidade em Estoque <span className="text-rose-500">*</span>
              </label>
              <input
                id="medication-stock-quantity-input"
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:border-indigo-500 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Saldo inicial físico disponível</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Estoque Mínimo (Alerta) <span className="text-rose-500">*</span>
              </label>
              <input
                id="medication-min-stock-input"
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-amber-700 focus:border-indigo-500 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Gera notificação de reposição</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Valor de Venda (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">R$</span>
                <input
                  id="medication-price-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-emerald-700 focus:border-indigo-500 transition"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Preço unitário em orçamentos</span>
            </div>
          </div>

          {/* Row 4: Supplier, Batch Number, Expiration Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Fornecedor / Fabricante</label>
              <input
                id="medication-supplier-input"
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Eurofarma, Eli Lilly..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Número do Lote</label>
              <input
                id="medication-batch-input"
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Ex: LT-2026A"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Data de Validade</label>
              <input
                id="medication-expiration-input"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Status Cadastral</label>
              <select
                id="medication-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition"
              >
                <option value="ativo">Ativo (Liberado)</option>
                <option value="inativo">Inativo (Bloqueado)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Observações Clínicas / Instruções de Conservação
            </label>
            <textarea
              id="medication-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Armazenar sob refrigeração de 2°C a 8°C. Proteger da luz solar."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Aplicações realizadas baixarão este estoque automaticamente.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="cancel-medication-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                id="save-medication-btn"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {medicationToEdit ? 'Salvar Alterações' : 'Salvar Medicamento'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
