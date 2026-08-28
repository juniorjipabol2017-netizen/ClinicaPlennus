import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlennusLogo } from '../common/PlennusLogo';
import {
  Search,
  Bell,
  UserCheck,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut,
  Stethoscope,
  HeartPulse,
  Receipt,
  User,
  ExternalLink,
} from 'lucide-react';
import { Role } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    clinicConfig,
    currentUser,
    users,
    switchUser,
    logout,
    waitingQueue,
    notifications,
    markNotificationAsRead,
    setIsGlobalSearchOpen,
    setActiveView,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const activeQueueCount = waitingQueue.filter((q) => q.status !== 'Finalizado' && q.status !== 'Cancelado').length;

  const roleBadgeStyles: Record<Role, { bg: string; text: string; label: string }> = {
    admin: { bg: 'bg-amber-100 text-amber-900 border-amber-300', text: 'text-amber-800', label: 'Administrador Geral' },
    medico: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', text: 'text-emerald-800', label: 'Médico' },
    enfermagem: { bg: 'bg-teal-100 text-teal-900 border-teal-300', text: 'text-teal-800', label: 'Enfermagem' },
    recepcao: { bg: 'bg-blue-100 text-blue-900 border-blue-300', text: 'text-blue-800', label: 'Recepção' },
    financeiro: { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', text: 'text-indigo-800', label: 'Financeiro' },
    nutricionista: { bg: 'bg-purple-100 text-purple-900 border-purple-300', text: 'text-purple-800', label: 'Nutricionista' },
    outros: { bg: 'bg-slate-100 text-slate-800 border-slate-300', text: 'text-slate-700', label: 'Outro' },
  };

  const currentBadge = roleBadgeStyles[currentUser.role] || roleBadgeStyles.outros;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className="text-left focus:outline-none flex items-center gap-3 cursor-pointer group"
          >
            <PlennusLogo size="sm" textColor="indigo" customLogoUrl={clinicConfig.logoUrl} />
          </button>
        </div>

        {/* Middle: Global Search bar */}
        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 text-xs transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
              <span className="font-medium">Buscar pacientes, CPF, prontuário, agendamentos...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions, Live Queue badge, Notifications, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Waiting queue live quick badge with Geometric Balance style */}
          <button
            onClick={() => setActiveView('fila')}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-[11px] font-bold rounded-lg uppercase tracking-wider border border-indigo-100 transition-all shadow-2xs"
            title="Fila de Espera em Tempo Real"
          >
            <span className="w-2 h-2 bg-[#4F46E5] rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">Fila:</span>
            <span className="bg-[#4F46E5] text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
              {activeQueueCount}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifMenuOpen(!isNotifMenuOpen);
                setIsProfileMenuOpen(false);
              }}
              className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-all"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
              {unreadNotifs.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#4F46E5] rounded-full"></span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                    Notificações ({notifications.length})
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[10px] bg-indigo-50 text-[#4F46E5] border border-indigo-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {unreadNotifs.length} não lidas
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center">Nenhuma notificação.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          setActiveView(notif.module);
                          setIsNotifMenuOpen(false);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                          {notif.type === 'warning' && <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {notif.type === 'info' && <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block uppercase tracking-wider">{notif.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Switcher (Crucial for testing SoD & Multi-Role requirements) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotifMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all bg-white"
            >
              <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block leading-none">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}
                </p>
                <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
                  {currentBadge.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown & Quick Role Switcher */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-indigo-50 text-[#4F46E5] border-indigo-100 uppercase tracking-wider">
                      {currentBadge.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Setor: {currentUser.sector}</span>
                  </div>
                </div>

                {/* Instant Role Testing Switcher */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Alternar Perfil SoD:
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-400'}`}></span>
                            <span className="truncate">{u.name}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isCurrent ? 'bg-indigo-700 text-white' : 'bg-slate-200/70 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveView('configuracoes');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
                    Gerenciar Permissões e Segurança
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Sair do Sistema (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            title="Sair do Sistema"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors hidden sm:flex items-center justify-center border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
