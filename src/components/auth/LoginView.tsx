import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlennusLogo } from '../common/PlennusLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
  HeartPulse,
  Receipt,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Role } from '../../types';

export const LoginView: React.FC = () => {
  const { clinicConfig, users, login, savedEmail, rememberMe: initialRemember } = useApp();

  const [email, setEmail] = useState<string>(savedEmail || 'admin@plennusmed.com.br');
  const [password, setPassword] = useState<string>('plennus123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(initialRemember);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      login(email, password, rememberMe);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickSelect = (userEmail: string, defaultPass: string = 'plennus123') => {
    setEmail(userEmail);
    setPassword(defaultPass);
  };

  const roleBadges: Record<Role, { label: string; color: string; icon: React.ElementType }> = {
    admin: { label: 'Diretoria / Admin', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Building2 },
    medico: { label: 'Médico', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Stethoscope },
    enfermagem: { label: 'Enfermagem', color: 'bg-teal-50 text-teal-800 border-teal-200', icon: HeartPulse },
    recepcao: { label: 'Recepção', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: UserCheck },
    financeiro: { label: 'Financeiro', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Receipt },
    nutricionista: { label: 'Nutrição', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: Sparkles },
    outros: { label: 'Outros', color: 'bg-slate-50 text-slate-800 border-slate-200', icon: UserCheck },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <PlennusLogo size="lg" customLogoUrl={clinicConfig.logoUrl} />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Acesso ao Sistema de Gestão
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          {clinicConfig.clinicName} • Plataforma Clínica Integrada
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuário ou E-mail
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: admin@plennusmed.com.br"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Protegida por criptografia</span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4F46E5] border-slate-300 focus:ring-[#4F46E5]"
                />
                <span className="text-xs text-slate-600 font-medium">Lembrar-me neste dispositivo</span>
              </label>

              <span className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium">
                Esqueceu a senha?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar for seamless testing */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center mb-3">
              Perfis de Acesso Rápido para Testes
            </p>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 6).map((u) => {
                const badge = roleBadges[u.role] || roleBadges.outros;
                const IconComponent = badge.icon;
                const isSelected = email.toLowerCase() === u.email.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u.email, u.password || 'plennus123')}
                    className={`p-2 rounded-xl text-left border transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${badge.color} border`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate leading-tight">{u.name.split(' ')[0]}</p>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">{badge.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ambiente Seguro • Em conformidade com CFM, LGPD e Matriz SoD</span>
        </div>
      </div>
    </div>
  );
};
