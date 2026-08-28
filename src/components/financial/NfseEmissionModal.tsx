import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialTransaction, Patient, NfseInvoice } from '../../types';
import {
  FileSpreadsheet,
  Receipt,
  Building2,
  User,
  Calculator,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface NfseEmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEmit?: FinancialTransaction | null;
  patientPreselected?: Patient | null;
  onSuccess?: (issuedInvoice: NfseInvoice) => void;
}

export const NfseEmissionModal: React.FC<NfseEmissionModalProps> = ({
  isOpen,
  onClose,
  transactionToEmit,
  patientPreselected,
  onSuccess,
}) => {
  const {
    clinicConfig,
    patients,
    currentUser,
    issueNfse,
    showToast,
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [takerName, setTakerName] = useState('');
  const [takerCpfCnpj, setTakerCpfCnpj] = useState('');
  const [takerEmail, setTakerEmail] = useState('');
  const [takerPhone, setTakerPhone] = useState('');
  const [takerAddress, setTakerAddress] = useState('');

  // Service details
  const [serviceDescription, setServiceDescription] = useState(
    'Consulta médica especializada, anamnese clínica estruturada, avaliação integrativa, elaboração de conduta terapêutica e plano de cuidados individualizado.'
  );
  const [cnaeCode, setCnaeCode] = useState(clinicConfig.cnae || '8630-5/03');
  const [itemServiceCode, setItemServiceCode] = useState('04.01'); // Serviços médicos
  const [serviceValue, setServiceValue] = useState<number>(350);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [deductionsValue, setDeductionsValue] = useState<number>(0);

  // Tax rates
  const [issRate, setIssRate] = useState<number>(2.0); // 2% a 5%
  const [issRetained, setIssRetained] = useState<boolean>(false);
  const [irrfRate, setIrrfRate] = useState<number>(0);
  const [pisRate, setPisRate] = useState<number>(0);
  const [cofinsRate, setCofinsRate] = useState<number>(0);
  const [csllRate, setCsllRate] = useState<number>(0);

  const [isTransmitting, setIsTransmitting] = useState(false);

  // Auto-fill from transaction or patient
  useEffect(() => {
    if (transactionToEmit) {
      setServiceValue(transactionToEmit.amount || 0);
      setServiceDescription(
        `Serviço médico / clínico: ${transactionToEmit.description}. Atendimento em conformidade com as diretrizes do CFM e normas sanitárias vigentes.`
      );
      if (transactionToEmit.patientId) {
        const found = patients.find((p) => p.id === transactionToEmit.patientId);
        if (found) {
          setSelectedPatientId(found.id);
          setTakerName(found.name);
          setTakerCpfCnpj(found.cpf);
          setTakerEmail(found.email);
          setTakerPhone(found.phone);
          setTakerAddress(`${found.address.street}, ${found.address.number || 'S/N'} - ${found.address.neighborhood || ''}, ${found.address.city}/${found.address.state}`);
        }
      }
    } else if (patientPreselected) {
      setSelectedPatientId(patientPreselected.id);
      setTakerName(patientPreselected.name);
      setTakerCpfCnpj(patientPreselected.cpf);
      setTakerEmail(patientPreselected.email);
      setTakerPhone(patientPreselected.phone);
      setTakerAddress(`${patientPreselected.address.street}, ${patientPreselected.address.number || 'S/N'} - ${patientPreselected.address.neighborhood || ''}, ${patientPreselected.address.city}/${patientPreselected.address.state}`);
    } else {
      // Default to first patient if available
      if (patients.length > 0) {
        const p = patients[0];
        setSelectedPatientId(p.id);
        setTakerName(p.name);
        setTakerCpfCnpj(p.cpf);
        setTakerEmail(p.email);
        setTakerPhone(p.phone);
        setTakerAddress(`${p.address.street}, ${p.address.number || 'S/N'} - ${p.address.neighborhood || ''}, ${p.address.city}/${p.address.state}`);
      }
    }
  }, [transactionToEmit, patientPreselected, patients, isOpen]);

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setTakerName(pat.name);
      setTakerCpfCnpj(pat.cpf);
      setTakerEmail(pat.email);
      setTakerPhone(pat.phone);
      setTakerAddress(`${pat.address.street}, ${pat.address.number || 'S/N'} - ${pat.address.neighborhood || ''}, ${pat.address.city}/${pat.address.state}`);
    }
  };

  // Tax calculations
  const baseCalc = Math.max(0, serviceValue - deductionsValue - discountValue);
  const issValue = (baseCalc * issRate) / 100;
  const irrfValue = (serviceValue * irrfRate) / 100;
  const pisValue = (serviceValue * pisRate) / 100;
  const cofinsValue = (serviceValue * cofinsRate) / 100;
  const csllValue = (serviceValue * csllRate) / 100;

  const totalRetentions = (issRetained ? issValue : 0) + irrfValue + pisValue + cofinsValue + csllValue;
  const netValue = serviceValue - totalRetentions - discountValue;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!takerName.trim() || !takerCpfCnpj.trim()) {
      showToast('Por favor, informe os dados do Tomador (Nome e CPF/CNPJ).', 'error');
      return;
    }

    if (serviceValue <= 0) {
      showToast('O valor do serviço deve ser maior que zero.', 'error');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      const issued = issueNfse({
        transactionId: transactionToEmit?.id,
        patientId: selectedPatientId || undefined,
        providerName: clinicConfig.clinicName || 'Plennus Med Clínica Integrada',
        providerCnpj: clinicConfig.cnpj || '48.912.345/0001-89',
        providerMunicipalRegistration: clinicConfig.municipalRegistration || '3.849.201-9',
        providerAddress: clinicConfig.address || 'Av. Paulista, 1578 - Bela Vista, São Paulo/SP',
        providerPhone: clinicConfig.phone,
        providerEmail: clinicConfig.email,
        takerName,
        takerCpfCnpj,
        takerEmail,
        takerPhone,
        takerAddress,
        serviceDescription,
        cnaeCode,
        municipalServiceCode: itemServiceCode || '04.03',
        itemServiceCode,
        serviceValue,
        deductions: deductionsValue,
        unconditionalDiscount: discountValue,
        calculationBase: baseCalc,
        issRate,
        issValue,
        issRetained,
        irrfRate,
        irrfValue,
        pisRate,
        pisValue,
        cofinsRate,
        cofinsValue,
        csllRate,
        csllValue,
        totalTaxes: issValue + (irrfValue || 0) + (pisValue || 0) + (cofinsValue || 0) + (csllValue || 0),
        netValue,
        observations: 'Tributação no município de São Paulo/SP. Regime Especial: Sociedade Uniprofissional / Simples Nacional.',
      });

      setIsTransmitting(false);
      if (onSuccess) onSuccess(issued);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-serif-luxury">
                  Emissão de Nota Fiscal de Serviços (NFS-e)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full">
                  Módulo Integrado
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transmissão eletrônica autorizada da Prefeitura Municipal ({clinicConfig.clinicName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isTransmitting}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          {/* Prestador Info Bar */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div>
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-700" /> Prestador do Serviço:
              </span>
              <p className="text-amber-900 font-medium">
                {clinicConfig.clinicName} • CNPJ: {clinicConfig.cnpj}
              </p>
            </div>
            <div className="text-right text-amber-800">
              <p>Inscrição Municipal: <strong>{clinicConfig.municipalRegistration || '8.452.190-3'}</strong></p>
              <p>CNAE: <strong>{cnaeCode}</strong> (Atividades de Atendimento Médico)</p>
            </div>
          </div>

          {/* Section 1: Dados do Tomador / Paciente */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Tomador do Serviço (Paciente / Contratante)
              </h4>
              <span className="text-[10px] text-slate-400">Vínculo direto com prontuário</span>
            </div>

            {/* Quick patient selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selecionar Paciente Cadastrado</label>
              <select
                id="nfse-select-patient"
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-medium"
              >
                <option value="">-- Selecione ou preencha manualmente abaixo --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (CPF: {p.cpf} • {p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo / Razão Social *</label>
                <input
                  id="nfse-input-taker-name"
                  type="text"
                  required
                  value={takerName}
                  onChange={(e) => setTakerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CPF ou CNPJ do Tomador *</label>
                <input
                  id="nfse-input-taker-cpf"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={takerCpfCnpj}
                  onChange={(e) => setTakerCpfCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail para Envio Automático da Nota</label>
                <input
                  id="nfse-input-taker-email"
                  type="email"
                  value={takerEmail}
                  onChange={(e) => setTakerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                <input
                  id="nfse-input-taker-phone"
                  type="text"
                  value={takerPhone}
                  onChange={(e) => setTakerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Endereço do Tomador</label>
                <input
                  id="nfse-input-taker-address"
                  type="text"
                  value={takerAddress}
                  onChange={(e) => setTakerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Discriminação dos Serviços Médicos */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Receipt className="w-3.5 h-3.5 text-amber-600" /> Discriminação e Classificação do Serviço
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código de Tributação Municipal</label>
                <select
                  value={itemServiceCode}
                  onChange={(e) => setItemServiceCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-mono"
                >
                  <option value="04.01">04.01 - Medicina e biomedicina (Consultas e Procedimentos)</option>
                  <option value="04.02">04.02 - Análises clínicas, patologia, eletricidade médica</option>
                  <option value="04.06">04.06 - Enfermagem, inclusive serviços auxiliares</option>
                  <option value="04.08">04.08 - Terapia ocupacional, fisioterapia e fonoaudiologia</option>
                  <option value="04.14">04.14 - Nutrição e dietética</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Código CNAE da Atividade</label>
                <input
                  type="text"
                  value={cnaeCode}
                  onChange={(e) => setCnaeCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Discriminação Detalhada dos Serviços (Texto da Nota) *
                </label>
                <textarea
                  id="nfse-input-description"
                  rows={3}
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Valores & Apuração de Tributos */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Valores do Serviço & Retenções Fiscais
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor Bruto do Serviço (R$) *</label>
                <input
                  id="nfse-input-value"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={serviceValue}
                  onChange={(e) => setServiceValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Desconto Incondicionado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alíquota ISS (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={issRate}
                    onChange={(e) => setIssRate(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-500 text-xs font-mono">
                    = R$ {issValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Base de Cálculo</span>
                <p className="font-mono font-bold text-slate-900 text-xs">R$ {baseCalc.toFixed(2)}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">ISS Calculado ({issRate}%)</span>
                <p className="font-mono font-bold text-amber-700 text-xs">R$ {issValue.toFixed(2)}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Retenções</span>
                <p className="font-mono font-bold text-slate-700 text-xs">R$ {totalRetentions.toFixed(2)}</p>
              </div>

              <div className="bg-emerald-50 rounded p-1 border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-bold">Valor Líquido</span>
                <p className="font-mono font-bold text-emerald-900 text-sm">R$ {netValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={isTransmitting}
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancelar
            </button>

            <button
              id="btn-confirm-issue-nfse"
              type="submit"
              disabled={isTransmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition flex items-center gap-2"
            >
              {isTransmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmitindo à Prefeitura...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Emitir & Autorizar NFS-e</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
