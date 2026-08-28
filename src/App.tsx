import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { TabletConsentModal } from './components/pep/TabletConsentModal';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { AgendaView } from './components/agenda/AgendaView';
import { QueueView } from './components/queue/QueueView';
import { ConsultorioView } from './components/consultorio/ConsultorioView';
import { PEPView } from './components/pep/PEPView';
import { EnfermagemView } from './components/enfermagem/EnfermagemView';
import { ProtocolsView } from './components/protocols/ProtocolsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { FinancialView } from './components/financial/FinancialView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    isAuthenticated,
    activeView,
    toastMessage,
    tabletModalState,
    closeTabletConsentModal,
    consentTemplates,
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md ${
                toastMessage.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-800'
                  : toastMessage.type === 'info'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-emerald-900 text-white border-emerald-800'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : toastMessage.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <p className="text-xs font-medium leading-tight">{toastMessage.text}</p>
            </div>
          </div>
        )}
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pacientes':
        return <PatientsView />;
      case 'agenda':
        return <AgendaView />;
      case 'fila':
        return <QueueView />;
      case 'consultorio':
        return <ConsultorioView />;
      case 'pep':
      case 'exames':
      case 'prescricoes':
        return <PEPView />;
      case 'triagem':
      case 'aplicacoes':
      case 'estoque':
        return <EnfermagemView />;
      case 'protocolos':
        return <ProtocolsView />;
      case 'orcamentos':
      case 'pacotes':
        return <BudgetsView />;
      case 'financeiro':
        return <FinancialView />;
      case 'relatorios':
        return <ReportsView />;
      case 'configuracoes':
      case 'usuarios':
      case 'profissionais':
      case 'atendimentos':
      case 'tcle':
      case 'auditoria':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Navbar with Clinic Brand & Role Switcher */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <GlobalSearchModal />

      {/* Global TCLE Tablet Signing Modal */}
      {tabletModalState.isOpen && tabletModalState.patient && (
        (() => {
          const template =
            tabletModalState.template ||
            consentTemplates.find((t) => t.status === 'ativo') ||
            consentTemplates[0];

          if (!template) return null;

          return (
            <TabletConsentModal
              patient={tabletModalState.patient}
              template={template}
              consultationId={tabletModalState.consultationId}
              appointmentId={tabletModalState.appointmentId}
              procedureName={tabletModalState.procedureName}
              onClose={closeTabletConsentModal}
              onComplete={(doc) => {
                if (tabletModalState.onComplete) {
                  tabletModalState.onComplete(doc);
                }
              }}
            />
          );
        })()
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}

            <p className="text-xs font-medium leading-tight">{toastMessage.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
