import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  HeartPulse,
  Syringe,
  FlaskConical,
  ScrollText,
  Sparkles,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  ShieldAlert,
  Lock,
  Boxes,
} from 'lucide-react';
import { SystemModule } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: SystemModule;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  category: 'Clínica & Atendimento' | 'Assistencial & Procedimentos' | 'Gestão & Financeiro' | 'Administração';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const {
    activeView,
    setActiveView,
    hasPermission,
    currentUser,
    waitingQueue,
    medications,
    showToast,
  } = useApp();

  const activeQueueCount = waitingQueue.filter((q) => q.status !== 'Finalizado' && q.status !== 'Cancelado').length;
  const lowStockCount = medications.filter((m) => m.stockQuantity <= m.minStock).length;

  const navItems: NavItem[] = [
    // Clínica & Atendimento
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Clínica & Atendimento' },
    { id: 'agenda', label: 'Agenda Médica', icon: Calendar, category: 'Clínica & Atendimento' },
    { id: 'fila', label: 'Fila de Espera', icon: Clock, badge: activeQueueCount > 0 ? activeQueueCount : undefined, category: 'Clínica & Atendimento' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, category: 'Clínica & Atendimento' },
    { id: 'consultorio', label: 'Consultório Médico', icon: Stethoscope, category: 'Clínica & Atendimento' },
    { id: 'pep', label: 'Prontuário (PEP)', icon: FileText, category: 'Clínica & Atendimento' },

    // Assistencial & Procedimentos
    { id: 'triagem', label: 'Enfermagem & Triagem', icon: HeartPulse, category: 'Assistencial & Procedimentos' },
    { id: 'aplicacoes', label: 'Aplicações & Injetáveis', icon: Syringe, category: 'Assistencial & Procedimentos' },
    { id: 'estoque', label: 'Estoque de Medicações', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} alertas` : undefined, category: 'Assistencial & Procedimentos' },
    { id: 'exames', label: 'Exames & Laudos', icon: FlaskConical, category: 'Assistencial & Procedimentos' },
    { id: 'protocolos', label: 'Protocolos Inteligentes', icon: Sparkles, category: 'Assistencial & Procedimentos' },

    // Gestão & Financeiro
    { id: 'orcamentos', label: 'Orçamentos & Propostas', icon: ScrollText, category: 'Gestão & Financeiro' },
    { id: 'pacotes', label: 'Pacotes de Tratamento', icon: Package, category: 'Gestão & Financeiro' },
    { id: 'financeiro', label: 'Financeiro & Caixa', icon: DollarSign, category: 'Gestão & Financeiro' },
    { id: 'relatorios', label: 'Relatórios & KPIs', icon: BarChart3, category: 'Gestão & Financeiro' },

    // Administração
    { id: 'configuracoes', label: 'Configurações & SoD', icon: Settings, category: 'Administração' },
  ];

  const categories: ('Clínica & Atendimento' | 'Assistencial & Procedimentos' | 'Gestão & Financeiro' | 'Administração')[] = [
    'Clínica & Atendimento',
    'Assistencial & Procedimentos',
    'Gestão & Financeiro',
    'Administração',
  ];

  const handleNavClick = (module: SystemModule) => {
    const isAllowed = hasPermission(module, 'view');
    if (!isAllowed) {
      showToast(
        `Acesso restrito: O perfil ${currentUser.role.toUpperCase()} não possui permissão para acessar o módulo ${module.toUpperCase()} (Segregação de Funções - SoD).`,
        'error'
      );
      return;
    }
    setActiveView(module);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-18 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {categories.map((cat) => {
            const items = navItems.filter((item) => item.category === cat);
            return (
              <div key={cat} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  {cat}
                </p>
                <div className="space-y-1 pt-1">
                  {items.map((item) => {
                    const isAllowed = hasPermission(item.id, 'view');
                    const isActive = activeView === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-950/50'
                            : isAllowed
                            ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-800/30 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          !isAllowed
                            ? `Bloqueado para perfil ${currentUser.role.toUpperCase()} (SoD)`
                            : item.label
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-white'
                                : isAllowed
                                ? 'text-slate-400 group-hover:text-[#38BDF8]'
                                : 'text-slate-600'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isAllowed && (
                            <Lock className="w-3 h-3 text-slate-600" />
                          )}
                          {item.badge && isAllowed && (
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                                typeof item.badge === 'string'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-[#38BDF8] text-slate-950'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Security Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 text-[11px] space-y-2.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
              SoD & LGPD Ativos
            </span>
            <span className="text-[9px] text-slate-500 font-mono">v3.4-PROD</span>
          </div>
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-tight">
            <p className="font-bold text-slate-300 uppercase tracking-wider text-[9px]">Sessão Operacional:</p>
            <p className="text-[#38BDF8] font-bold truncate mt-0.5">{currentUser.name}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
