import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicBrandingConfig } from '../../types';
import { DEFAULT_CLINIC_BRANDING } from '../../data/initialData';
import {
  Palette,
  Type,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  FileText,
  Layers,
} from 'lucide-react';
import { ClinicLogo } from '../common/PlennusLogo';

const BRANDING_PRESETS: {
  name: string;
  badge: string;
  config: ClinicBrandingConfig;
}[] = [
  {
    name: 'Plennus Dourado & Slate (Padrão Oficial)',
    badge: 'Oficial',
    config: {
      ...DEFAULT_CLINIC_BRANDING,
      presetName: 'Plennus Dourado & Slate',
    },
  },
  {
    name: 'Esmeralda Integrativo & Saúde',
    badge: 'Integrativa',
    config: {
      primaryColor: '#064e3b',
      secondaryColor: '#059669',
      textColor: '#334155',
      accentColor: '#10b981',
      fontFamily: 'Montserrat',
      clinicNameSize: 'lg',
      clinicNameWeight: 'bold',
      clinicNameColor: '#064e3b',
      infoSize: 'xs',
      infoWeight: 'normal',
      infoColor: '#475569',
      addressSize: 'xs',
      addressColor: '#64748b',
      contactSize: 'xs',
      contactColor: '#059669',
      presetName: 'Esmeralda Integrativo',
    },
  },
  {
    name: 'Royal Sapphire & Navy',
    badge: 'Corporativo',
    config: {
      primaryColor: '#1e1b4b',
      secondaryColor: '#3b82f6',
      textColor: '#1e293b',
      accentColor: '#2563eb',
      fontFamily: 'Montserrat',
      clinicNameSize: 'xl',
      clinicNameWeight: 'bold',
      clinicNameColor: '#1e1b4b',
      infoSize: 'xs',
      infoWeight: 'normal',
      infoColor: '#475569',
      addressSize: 'xs',
      addressColor: '#64748b',
      contactSize: 'xs',
      contactColor: '#2563eb',
      presetName: 'Royal Sapphire & Navy',
    },
  },
  {
    name: 'Rosé & Gold Estética Premium',
    badge: 'Dermatologia & Estética',
    config: {
      primaryColor: '#4c0519',
      secondaryColor: '#e11d48',
      textColor: '#3f3f46',
      accentColor: '#fb7185',
      fontFamily: 'Cormorant Garamond',
      clinicNameSize: 'xl',
      clinicNameWeight: 'bold',
      clinicNameColor: '#4c0519',
      infoSize: 'xs',
      infoWeight: 'normal',
      infoColor: '#52525b',
      addressSize: 'xs',
      addressColor: '#71717a',
      contactSize: 'xs',
      contactColor: '#e11d48',
      presetName: 'Rosé & Gold Estética',
    },
  },
  {
    name: 'Minimalist Black & White',
    badge: 'Clean Moderno',
    config: {
      primaryColor: '#09090b',
      secondaryColor: '#27272a',
      textColor: '#18181b',
      accentColor: '#71717a',
      fontFamily: 'Inter',
      clinicNameSize: 'lg',
      clinicNameWeight: 'bold',
      clinicNameColor: '#09090b',
      infoSize: 'xs',
      infoWeight: 'normal',
      infoColor: '#52525b',
      addressSize: 'xs',
      addressColor: '#71717a',
      contactSize: 'xs',
      contactColor: '#27272a',
      presetName: 'Minimalist Modern',
    },
  },
];

const FONT_OPTIONS = [
  { id: 'Montserrat', label: 'Montserrat (Moderno & Profissional)' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond (Elegante & Premium)' },
  { id: 'Inter', label: 'Inter (Clean & Contemporâneo)' },
  { id: 'Playfair Display', label: 'Playfair Display (Clássico & Editorial)' },
  { id: 'Poppins', label: 'Poppins (Geométrico & Acolhedor)' },
  { id: 'Roboto', label: 'Roboto (Neutro & Técnico)' },
];

export const VisualBrandingSection: React.FC = () => {
  const { clinicConfig, updateClinicBranding, resetClinicBranding, showToast } = useApp();

  const currentBranding: ClinicBrandingConfig = clinicConfig.branding || DEFAULT_CLINIC_BRANDING;

  // Working state
  const [branding, setBranding] = useState<ClinicBrandingConfig>(currentBranding);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setBranding(clinicConfig.branding || DEFAULT_CLINIC_BRANDING);
    setHasChanges(false);
  }, [clinicConfig.branding]);

  const handleChange = <K extends keyof ClinicBrandingConfig>(key: K, value: ClinicBrandingConfig[K]) => {
    setBranding((prev) => ({
      ...prev,
      [key]: value,
      presetName: 'Personalizado',
    }));
    setHasChanges(true);
  };

  const handleApplyPreset = (preset: typeof BRANDING_PRESETS[0]) => {
    setBranding(preset.config);
    setHasChanges(true);
    showToast(`Preset "${preset.name}" carregado. Clique em "Salvar Personalização" para aplicar.`);
  };

  const handleSave = () => {
    updateClinicBranding(branding);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar as cores e fontes para o padrão oficial da Clínica?')) {
      resetClinicBranding();
      setBranding(DEFAULT_CLINIC_BRANDING);
      setHasChanges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 font-serif-luxury">
              Personalização Visual & Identidade de Documentos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Defina a paleta cromática, tipografia e estilos dos cabeçalhos oficiais impressos (Receitas, Atestados, Propostas e TCLE).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            title="Restaurar padrão Plennus"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition flex items-center gap-2 ${
              hasChanges
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white animate-pulse'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Salvar Personalização
          </button>
        </div>
      </div>

      {/* Preset Selection Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Paletas & Temas Pré-definidos
          </span>
          <span className="text-[11px] text-slate-400">
            Atual: <strong className="text-white">{branding.presetName || 'Personalizado'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {BRANDING_PRESETS.map((preset) => {
            const isSelected = branding.presetName === preset.config.presetName;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 rounded-xl text-left border transition relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                    : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-amber-300">
                      {preset.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{preset.name}</p>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-1 mt-3">
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.config.primaryColor }}
                    title="Primária"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.config.secondaryColor }}
                    title="Secundária"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.config.accentColor }}
                    title="Destaque"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Controls + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Colors Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-600" /> Paleta de Cores Principais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Primary Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">Cor Primária (Destaques)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">Cor Secundária (Bordas / Detalhes)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">Cor de Destaque (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">Cor Geral do Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Header Details Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" /> Tipografia & Estilos do Cabeçalho
            </h3>

            {/* Font Family Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Família Tipográfica Principal
              </label>
              <select
                value={branding.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Granular styling rows */}
            <div className="space-y-3 pt-2 text-xs">
              {/* Row 1: Clinic Name Styling */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Nome da Clínica no Cabeçalho</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Tamanho</label>
                    <select
                      value={branding.clinicNameSize}
                      onChange={(e) => handleChange('clinicNameSize', e.target.value as any)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="md">Médio (md)</option>
                      <option value="lg">Grande (lg)</option>
                      <option value="xl">Extra Grande (xl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Peso</label>
                    <select
                      value={branding.clinicNameWeight}
                      onChange={(e) => handleChange('clinicNameWeight', e.target.value as any)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="medium">Médio</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Cor</label>
                    <input
                      type="color"
                      value={branding.clinicNameColor}
                      onChange={(e) => handleChange('clinicNameColor', e.target.value)}
                      className="w-full h-7 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Subtitle / Information Styling */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Informações Institucionais / Direção</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Tamanho</label>
                    <select
                      value={branding.infoSize}
                      onChange={(e) => handleChange('infoSize', e.target.value as any)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="xs">Pequeno (xs)</option>
                      <option value="sm">Normal (sm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Peso</label>
                    <select
                      value={branding.infoWeight}
                      onChange={(e) => handleChange('infoWeight', e.target.value as any)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Médio</option>
                      <option value="semibold">Semibold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Cor</label>
                    <input
                      type="color"
                      value={branding.infoColor}
                      onChange={(e) => handleChange('infoColor', e.target.value)}
                      className="w-full h-7 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Address & Contact Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">Cor do Endereço</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.addressColor}
                      onChange={(e) => handleChange('addressColor', e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-white border border-slate-200"
                    />
                    <span className="text-[11px] font-mono text-slate-600 uppercase">{branding.addressColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">Cor do Contato</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.contactColor}
                      onChange={(e) => handleChange('contactColor', e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-white border border-slate-200"
                    />
                    <span className="text-[11px] font-mono text-slate-600 uppercase">{branding.contactColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" /> Pré-visualização do Cabeçalho Oficial
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Tempo Real
              </span>
            </div>

            {/* Document Paper Preview Card */}
            <div
              className="p-8 bg-white rounded-2xl border-2 border-slate-300 shadow-md space-y-6 text-slate-800"
              style={{ fontFamily: branding.fontFamily }}
            >
              {/* Header section with selected styles */}
              <div
                className="flex items-center justify-between pb-5 border-b-2"
                style={{ borderColor: branding.secondaryColor }}
              >
                <div className="flex items-center gap-3">
                  <ClinicLogo size="md" textColor="dark" customLogoUrl={clinicConfig.logoUrl} />
                </div>

                <div className="text-right space-y-0.5">
                  <p
                    style={{
                      color: branding.clinicNameColor,
                      fontSize:
                        branding.clinicNameSize === 'xl'
                          ? '1.25rem'
                          : branding.clinicNameSize === 'lg'
                          ? '1.1rem'
                          : '0.95rem',
                      fontWeight:
                        branding.clinicNameWeight === 'bold'
                          ? 700
                          : branding.clinicNameWeight === 'semibold'
                          ? 600
                          : 500,
                    }}
                  >
                    {clinicConfig.clinicName}
                  </p>
                  <p
                    style={{
                      color: branding.infoColor,
                      fontSize: branding.infoSize === 'sm' ? '0.85rem' : '0.75rem',
                      fontWeight: branding.infoWeight === 'semibold' ? 600 : branding.infoWeight === 'medium' ? 500 : 400,
                    }}
                  >
                    {clinicConfig.tagline} • Resp: {clinicConfig.technicalDirector} ({clinicConfig.technicalDirectorCrm})
                  </p>
                  <p
                    style={{
                      color: branding.addressColor,
                      fontSize: branding.addressSize === 'sm' ? '0.8rem' : '0.7rem',
                    }}
                  >
                    {clinicConfig.address}
                  </p>
                  <p
                    style={{
                      color: branding.contactColor,
                      fontSize: branding.contactSize === 'sm' ? '0.8rem' : '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    Tel: {clinicConfig.phone} • {clinicConfig.email} • {clinicConfig.instagram}
                  </p>
                </div>
              </div>

              {/* Sample Document Body mockup */}
              <div className="space-y-4 pt-2">
                <div className="text-center">
                  <h4
                    className="text-base font-bold uppercase tracking-wider"
                    style={{ color: branding.primaryColor }}
                  >
                    RECEITUÁRIO MÉDICO INTEGRATIVO
                  </h4>
                  <div
                    className="w-16 h-0.5 mx-auto mt-1 rounded-full"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[9px]">PACIENTE:</span>
                    <strong className="text-slate-800">Mariana Costa Silva</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px]">DATA DA EMISSÃO:</span>
                    <strong className="text-slate-800">{new Date().toLocaleDateString('pt-BR')}</strong>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs space-y-2">
                  <p className="font-bold text-slate-800">
                    1) Coenzima Q10 (Ubiquinol) 100mg ...................... 60 cápsulas
                  </p>
                  <p className="text-[11px] text-slate-600 pl-3">
                    Tomar 1 cápsula via oral pela manhã, junto ao desjejum com gordura boa.
                  </p>
                </div>

                {/* Footer seal mockup */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-[10px] text-slate-400">
                  <span>Plennus Medical Suite • Documento Válido em Todo Território Nacional</span>
                  <span
                    className="font-bold font-mono px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    ASSINATURA DIGITAL CFM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
