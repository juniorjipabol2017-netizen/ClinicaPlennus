import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ClinicIdentityConfig,
  ClinicBrandingConfig,
  Professional,
  User,
  Role,
  SystemModule,
  PermissionAction,
  RolePermissions,
  Patient,
  Appointment,
  WaitingQueueItem,
  Consultation,
  ConsultationDraft,
  Prescription,
  MedicalDocument,
  ExamRequest,
  Attachment,
  Medication,
  MedicationApplication,
  InventoryMovement,
  IntelligentProtocol,
  ProtocolAssignment,
  TreatmentPackage,
  PackageAssignment,
  Budget,
  FinancialTransaction,
  CashRegister,
  AuditLog,
  NotificationItem,
  NursingTriage,
  ConsentTermTemplate,
  PatientConsentDocument,
  ConsentStatus,
  NfseInvoice,
  ProcedureTypeItem,
} from '../types';
import {
  INITIAL_CLINIC_CONFIG,
  DEFAULT_CLINIC_BRANDING,
  DEFAULT_SOD_PERMISSIONS,
  INITIAL_PROFESSIONALS,
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_WAITING_QUEUE,
  INITIAL_MEDICATIONS,
  INITIAL_INTELLIGENT_PROTOCOLS,
  INITIAL_PROTOCOL_ASSIGNMENTS,
  INITIAL_TREATMENT_PACKAGES,
  INITIAL_PACKAGE_ASSIGNMENTS,
  INITIAL_BUDGETS,
  INITIAL_FINANCIAL_TRANSACTIONS,
  INITIAL_CASH_REGISTER,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONSULTATIONS,
  INITIAL_CONSENT_TEMPLATES,
  INITIAL_PATIENT_CONSENTS,
  INITIAL_NFSE_INVOICES,
  INITIAL_PROCEDURE_TYPES,
} from '../data/initialData';

interface AppContextType {
  // Config & Auth
  clinicConfig: ClinicIdentityConfig;
  updateClinicConfig: (config: Partial<ClinicIdentityConfig>) => void;
  updateClinicBranding: (branding: ClinicBrandingConfig) => void;
  resetClinicBranding: () => void;
  isAuthenticated: boolean;
  rememberMe: boolean;
  savedEmail: string;
  login: (email: string, password?: string, remember?: boolean) => boolean;
  logout: () => void;
  currentUser: User;
  switchUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  professionals: Professional[];
  addProfessional: (prof: Omit<Professional, 'id' | 'createdAt'> & { role?: Role; customPermissions?: RolePermissions; createLoginUser?: boolean }) => void;
  updateProfessional: (id: string, updates: Partial<Professional> & { role?: Role; customPermissions?: RolePermissions }) => void;
  toggleProfessionalStatus: (id: string) => void;
  deleteProfessional: (id: string) => { success: boolean; message: string };
  sendProfessionalInvite: (id: string) => void;
  sodPermissions: Record<string, RolePermissions>;
  updateSodPermissions: (role: string, permissions: RolePermissions) => void;
  hasPermission: (module: SystemModule, action?: PermissionAction) => boolean;
  checkSoDConflictWarning: (targetRole: Role, module: SystemModule) => string | null;

  // Procedures & Attendances Types CRUD
  procedureTypes: ProcedureTypeItem[];
  addProcedureType: (item: Omit<ProcedureTypeItem, 'id' | 'createdAt'>) => ProcedureTypeItem;
  updateProcedureType: (id: string, updates: Partial<ProcedureTypeItem>) => void;
  deleteProcedureType: (id: string) => void;

  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  togglePatientStatus: (id: string) => void;
  deletePatient: (id: string) => { success: boolean; message: string };
  getPatientById: (id: string) => Patient | undefined;

  // Appointments & Queue
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  waitingQueue: WaitingQueueItem[];
  addToWaitingQueue: (item: Omit<WaitingQueueItem, 'id' | 'arrivalTime'>) => WaitingQueueItem;
  updateQueueStatus: (id: string, status: WaitingQueueItem['status'], notes?: string) => void;
  deleteQueueItem: (id: string) => void;
  callQueuePatient: (id: string) => void;

  // Consultations, SOAP & AutoSave
  consultations: Consultation[];
  activeConsultationDraft: ConsultationDraft | null;
  saveConsultationDraft: (draft: ConsultationDraft) => void;
  clearConsultationDraft: () => void;
  finishConsultation: (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => Consultation;
  simultaneousEditUser: string | null;
  setSimultaneousEditUser: (name: string | null) => void;

  // Prescriptions, Documents, Exams & Attachments
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => Prescription;
  medicalDocuments: MedicalDocument[];
  addMedicalDocument: (doc: Omit<MedicalDocument, 'id' | 'createdAt'>) => MedicalDocument;
  examRequests: ExamRequest[];
  addExamRequest: (req: Omit<ExamRequest, 'id' | 'createdAt'>) => ExamRequest;
  updateExamStatus: (id: string, status: ExamRequest['status'], resultReport?: string) => void;
  attachments: Attachment[];
  addAttachment: (att: Omit<Attachment, 'id' | 'uploadedAt'>) => Attachment;

  // Nursing & Triage
  triages: NursingTriage[];
  saveTriage: (triage: Omit<NursingTriage, 'id' | 'timestamp'>) => NursingTriage;
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => { success: boolean; softDeleted: boolean; message: string };
  medicationApplications: MedicationApplication[];
  recordMedicationApplication: (app: Omit<MedicationApplication, 'id'>) => void;
  deleteMedicationApplication: (id: string, restoreStock?: boolean) => void;
  inventoryMovements: InventoryMovement[];
  recordInventoryMovement: (movement: Omit<InventoryMovement, 'id' | 'date'>) => void;

  // Protocols & Packages
  intelligentProtocols: IntelligentProtocol[];
  addIntelligentProtocol: (proto: Omit<IntelligentProtocol, 'id'>) => IntelligentProtocol;
  updateIntelligentProtocol: (id: string, updates: Partial<IntelligentProtocol>) => void;
  duplicateIntelligentProtocol: (id: string) => IntelligentProtocol;
  deleteIntelligentProtocol: (id: string) => { success: boolean; message: string };
  protocolAssignments: ProtocolAssignment[];
  assignProtocolToPatient: (assignment: Omit<ProtocolAssignment, 'id'>) => void;
  updateProtocolAssignment: (id: string, updates: Partial<ProtocolAssignment>) => void;
  deleteProtocolAssignment: (id: string) => void;
  addProtocolEvolutionNote: (id: string, note: string) => void;
  treatmentPackages: TreatmentPackage[];
  addTreatmentPackage: (pkg: Omit<TreatmentPackage, 'id'>) => TreatmentPackage;
  updateTreatmentPackage: (id: string, updates: Partial<TreatmentPackage>) => void;
  duplicateTreatmentPackage: (id: string) => TreatmentPackage;
  deleteTreatmentPackage: (id: string) => { success: boolean; message: string };
  packageAssignments: PackageAssignment[];
  assignPackageToPatient: (assignment: Omit<PackageAssignment, 'id'>) => void;
  usePackageSession: (assignmentId: string, note: string) => void;

  // Budgets & Financial
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => Budget;
  updateBudgetStatus: (id: string, status: Budget['status']) => void;
  deleteBudget: (id: string) => { success: boolean; message: string };
  financialTransactions: FinancialTransaction[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id' | 'date' | 'time'>) => FinancialTransaction;
  deleteFinancialTransaction: (id: string) => { success: boolean; message: string };
  cashRegister: CashRegister;
  closeCashRegister: (closingNotes?: string) => void;
  openCashRegister: (openingBalance: number) => void;

  // NFS-e (Notas Fiscais de Serviços Eletrônicas)
  nfseInvoices: NfseInvoice[];
  issueNfse: (data: Omit<NfseInvoice, 'id' | 'number' | 'rpsNumber' | 'rpsSeries' | 'status' | 'issueDate' | 'issueTime' | 'verificationCode' | 'accessKey' | 'protocolNumber' | 'issuedByUserName'>) => NfseInvoice;
  cancelNfse: (id: string, cancellationReason: string) => void;
  deleteNfseInvoice: (id: string) => { success: boolean; message: string };
  getNfseByTransactionId: (txId: string) => NfseInvoice | undefined;

  // Consent Terms (TCLE)
  consentTemplates: ConsentTermTemplate[];
  addConsentTemplate: (tpl: Omit<ConsentTermTemplate, 'id' | 'createdAt' | 'updatedAt'>) => ConsentTermTemplate;
  updateConsentTemplate: (id: string, updates: Partial<ConsentTermTemplate>) => void;
  duplicateConsentTemplate: (id: string) => ConsentTermTemplate;
  createNewTemplateVersion: (id: string, newText: string, updatedDeclarations?: string[]) => ConsentTermTemplate;
  toggleConsentTemplateStatus: (id: string) => void;
  patientConsents: PatientConsentDocument[];
  addPatientConsent: (doc: Omit<PatientConsentDocument, 'id' | 'documentCode' | 'createdAt' | 'immutableHash'>) => PatientConsentDocument;
  refusePatientConsent: (patientId: string, templateId: string, reason: string, procedureName?: string) => PatientConsentDocument;
  checkProcedureConsentStatus: (patientId: string, procedureOrCategory: string) => { hasValidConsent: boolean; pendingConsentTemplate?: ConsentTermTemplate; lastSignedConsent?: PatientConsentDocument };
  tabletModalState: {
    isOpen: boolean;
    patient: Patient | null;
    template: ConsentTermTemplate | null;
    consultationId?: string;
    appointmentId?: string;
    procedureName?: string;
    onComplete?: (doc: PatientConsentDocument) => void;
  };
  openTabletConsentModal: (data: {
    patient: Patient;
    templateId: string;
    consultationId?: string;
    appointmentId?: string;
    procedureName?: string;
    onComplete?: (doc: PatientConsentDocument) => void;
  }) => void;
  closeTabletConsentModal: () => void;

  // Audit, Notifications & Navigation state
  auditLogs: AuditLog[];
  addAuditLog: (entry: { action: string; module: SystemModule | string; recordAffected?: string; details: string; result?: 'sucesso' | 'bloqueado' | 'aviso' }) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  activeView: SystemModule;
  setActiveView: (view: SystemModule) => void;
  selectedPatientForPEP: Patient | null;
  setSelectedPatientForPEP: (patient: Patient | null) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'plennus_med_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage key', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global App States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStored('is_authenticated', true)
  );
  const [rememberMe, setRememberMe] = useState<boolean>(() =>
    getStored('remember_me', true)
  );
  const [savedEmail, setSavedEmail] = useState<string>(() =>
    getStored('saved_email', 'admin@plennusmed.com.br')
  );

  const [clinicConfig, setClinicConfig] = useState<ClinicIdentityConfig>(() =>
    getStored('clinic_config', INITIAL_CLINIC_CONFIG)
  );
  const [professionals, setProfessionals] = useState<Professional[]>(() =>
    getStored('professionals', INITIAL_PROFESSIONALS)
  );
  const [users, setUsers] = useState<User[]>(() =>
    getStored('users', INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = getStored<User | null>('current_user', null);
    return saved || INITIAL_USERS[0];
  });
  const [sodPermissions, setSodPermissions] = useState<Record<string, RolePermissions>>(() =>
    getStored('sod_permissions', DEFAULT_SOD_PERMISSIONS)
  );
  const [procedureTypes, setProcedureTypes] = useState<ProcedureTypeItem[]>(() =>
    getStored('procedure_types', INITIAL_PROCEDURE_TYPES)
  );
  const [patients, setPatients] = useState<Patient[]>(() =>
    getStored('patients', INITIAL_PATIENTS)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getStored('appointments', INITIAL_APPOINTMENTS)
  );
  const [waitingQueue, setWaitingQueue] = useState<WaitingQueueItem[]>(() =>
    getStored('waiting_queue', INITIAL_WAITING_QUEUE)
  );
  const [consultations, setConsultations] = useState<Consultation[]>(() =>
    getStored('consultations', INITIAL_CONSULTATIONS)
  );
  const [activeConsultationDraft, setActiveConsultationDraft] = useState<ConsultationDraft | null>(() =>
    getStored('consultation_draft', null)
  );
  const [simultaneousEditUser, setSimultaneousEditUser] = useState<string | null>(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() =>
    getStored('prescriptions', [])
  );
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>(() =>
    getStored('medical_documents', [])
  );
  const [examRequests, setExamRequests] = useState<ExamRequest[]>(() =>
    getStored('exam_requests', [])
  );
  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    getStored('attachments', [])
  );
  const [triages, setTriages] = useState<NursingTriage[]>(() =>
    getStored('triages', [])
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    getStored('medications', INITIAL_MEDICATIONS)
  );
  const [medicationApplications, setMedicationApplications] = useState<MedicationApplication[]>(() =>
    getStored('med_applications', [])
  );
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() =>
    getStored('inventory_movements', [])
  );
  const [intelligentProtocols, setIntelligentProtocols] = useState<IntelligentProtocol[]>(() =>
    getStored('protocols', INITIAL_INTELLIGENT_PROTOCOLS)
  );
  const [protocolAssignments, setProtocolAssignments] = useState<ProtocolAssignment[]>(() =>
    getStored('protocol_assignments', INITIAL_PROTOCOL_ASSIGNMENTS)
  );
  const [treatmentPackages, setTreatmentPackages] = useState<TreatmentPackage[]>(() =>
    getStored('treatment_packages', INITIAL_TREATMENT_PACKAGES)
  );
  const [packageAssignments, setPackageAssignments] = useState<PackageAssignment[]>(() =>
    getStored('package_assignments', INITIAL_PACKAGE_ASSIGNMENTS)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    getStored('budgets', INITIAL_BUDGETS)
  );
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() =>
    getStored('financial_txs', INITIAL_FINANCIAL_TRANSACTIONS)
  );
  const [cashRegister, setCashRegister] = useState<CashRegister>(() =>
    getStored('cash_register', INITIAL_CASH_REGISTER)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStored('audit_logs', INITIAL_AUDIT_LOGS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStored('notifications', INITIAL_NOTIFICATIONS)
  );

  // Consent Terms State (TCLE)
  const [consentTemplates, setConsentTemplates] = useState<ConsentTermTemplate[]>(() =>
    getStored('consent_templates', INITIAL_CONSENT_TEMPLATES)
  );
  const [patientConsents, setPatientConsents] = useState<PatientConsentDocument[]>(() =>
    getStored('patient_consents', INITIAL_PATIENT_CONSENTS)
  );

  // NFS-e State (Notas Fiscais de Serviços)
  const [nfseInvoices, setNfseInvoices] = useState<NfseInvoice[]>(() =>
    getStored('nfse_invoices', INITIAL_NFSE_INVOICES)
  );
  const [tabletModalState, setTabletModalState] = useState<{
    isOpen: boolean;
    patient: Patient | null;
    template: ConsentTermTemplate | null;
    consultationId?: string;
    appointmentId?: string;
    procedureName?: string;
    onComplete?: (doc: PatientConsentDocument) => void;
  }>({
    isOpen: false,
    patient: null,
    template: null,
  });

  // UI state
  const [activeView, setActiveView] = useState<SystemModule>('dashboard');
  const [selectedPatientForPEP, setSelectedPatientForPEP] = useState<Patient | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  }, []);

  // Sync state to LocalStorage
  useEffect(() => { setStored('is_authenticated', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { setStored('remember_me', rememberMe); }, [rememberMe]);
  useEffect(() => { setStored('saved_email', savedEmail); }, [savedEmail]);
  useEffect(() => { setStored('clinic_config', clinicConfig); }, [clinicConfig]);
  useEffect(() => { setStored('professionals', professionals); }, [professionals]);
  useEffect(() => { setStored('users', users); }, [users]);
  useEffect(() => { setStored('current_user', currentUser); }, [currentUser]);
  useEffect(() => { setStored('sod_permissions', sodPermissions); }, [sodPermissions]);
  useEffect(() => { setStored('procedure_types', procedureTypes); }, [procedureTypes]);
  useEffect(() => { setStored('patients', patients); }, [patients]);
  useEffect(() => { setStored('appointments', appointments); }, [appointments]);
  useEffect(() => { setStored('waiting_queue', waitingQueue); }, [waitingQueue]);
  useEffect(() => { setStored('consultations', consultations); }, [consultations]);
  useEffect(() => { setStored('consultation_draft', activeConsultationDraft); }, [activeConsultationDraft]);
  useEffect(() => { setStored('prescriptions', prescriptions); }, [prescriptions]);
  useEffect(() => { setStored('medical_documents', medicalDocuments); }, [medicalDocuments]);
  useEffect(() => { setStored('exam_requests', examRequests); }, [examRequests]);
  useEffect(() => { setStored('attachments', attachments); }, [attachments]);
  useEffect(() => { setStored('triages', triages); }, [triages]);
  useEffect(() => { setStored('medications', medications); }, [medications]);
  useEffect(() => { setStored('med_applications', medicationApplications); }, [medicationApplications]);
  useEffect(() => { setStored('inventory_movements', inventoryMovements); }, [inventoryMovements]);
  useEffect(() => { setStored('protocols', intelligentProtocols); }, [intelligentProtocols]);
  useEffect(() => { setStored('protocol_assignments', protocolAssignments); }, [protocolAssignments]);
  useEffect(() => { setStored('treatment_packages', treatmentPackages); }, [treatmentPackages]);
  useEffect(() => { setStored('package_assignments', packageAssignments); }, [packageAssignments]);
  useEffect(() => { setStored('budgets', budgets); }, [budgets]);
  useEffect(() => { setStored('financial_txs', financialTransactions); }, [financialTransactions]);
  useEffect(() => { setStored('cash_register', cashRegister); }, [cashRegister]);
  useEffect(() => { setStored('audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { setStored('notifications', notifications); }, [notifications]);
  useEffect(() => { setStored('consent_templates', consentTemplates); }, [consentTemplates]);
  useEffect(() => { setStored('patient_consents', patientConsents); }, [patientConsents]);
  useEffect(() => { setStored('nfse_invoices', nfseInvoices); }, [nfseInvoices]);

  // Audit Log Adder
  const addAuditLog = useCallback(
    (entry: {
      action: string;
      module: SystemModule | string;
      recordAffected?: string;
      details: string;
      result?: 'sucesso' | 'bloqueado' | 'aviso';
    }) => {
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
      const newLog: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp,
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistema',
        role: currentUser?.role || 'admin',
        action: entry.action,
        module: entry.module,
        recordAffected: entry.recordAffected,
        details: entry.details,
        ipAddress: '189.45.12.88',
        result: entry.result || 'sucesso',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Permission Check Engine with SoD Enforcement
  const hasPermission = useCallback(
    (module: SystemModule, action: PermissionAction = 'view'): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;

      // Check custom overrides if present
      if (currentUser.customPermissions && currentUser.customPermissions[module]) {
        const customPerm = currentUser.customPermissions[module];
        if (action === 'view') return !!customPerm.view;
        if (action === 'create') return !!customPerm.create;
        if (action === 'edit') return !!customPerm.edit;
        if (action === 'delete') return !!customPerm.delete;
        if (action === 'approve') return !!customPerm.approve;
        if (action === 'print') return !!customPerm.print;
        if (action === 'export') return !!customPerm.export;
      }

      // Check role default matrix
      const roleMatrix = sodPermissions[currentUser.role];
      if (!roleMatrix || !roleMatrix[module]) return false;

      const modPerm = roleMatrix[module];
      if (action === 'view') return !!modPerm.view;
      if (action === 'create') return !!modPerm.create;
      if (action === 'edit') return !!modPerm.edit;
      if (action === 'delete') return !!modPerm.delete;
      if (action === 'approve') return !!modPerm.approve;
      if (action === 'print') return !!modPerm.print;
      if (action === 'export') return !!modPerm.export;

      return !!modPerm.view;
    },
    [currentUser, sodPermissions]
  );

  const checkSoDConflictWarning = useCallback((targetRole: Role, module: SystemModule): string | null => {
    if (targetRole === 'recepcao' && (module === 'pep' || module === 'triagem' || module === 'financeiro')) {
      return 'Atenção: A função de Recepção não deve acessar Prontuário Clínico (PEP), Triagem ou Caixa Financeiro. Essa combinação viola a matriz de Segregação de Funções (SoD).';
    }
    if (targetRole === 'financeiro' && (module === 'pep' || module === 'consultorio' || module === 'triagem')) {
      return 'Atenção: A função Financeira não deve ter acesso a Prontuários Médicos e dados clínicos sensíveis (LGPD e SoD).';
    }
    if (targetRole === 'medico' && (module === 'financeiro' || module === 'usuarios')) {
      return 'Atenção: Conceder acesso financeiro ou de administração de usuários ao perfil Médico pode gerar sobreposição de funções administrativas.';
    }
    return null;
  }, []);

  const updateClinicConfig = useCallback((config: Partial<ClinicIdentityConfig>) => {
    setClinicConfig((prev) => {
      const updated = { ...prev, ...config };
      addAuditLog({
        action: 'Atualização de Identidade da Clínica',
        module: 'configuracoes',
        details: `Dados institucionais e identidade visual alterados por ${currentUser.name}.`,
      });
      return updated;
    });
    showToast('Identidade da clínica atualizada com sucesso!');
  }, [addAuditLog, currentUser, showToast]);

  const switchUser = useCallback((user: User) => {
    setCurrentUser(user);
    addAuditLog({
      action: 'Troca de Sessão / Login',
      module: 'dashboard',
      details: `Usuário ativo alterado para ${user.name} (${user.role.toUpperCase()}).`,
    });
    showToast(`Conectado como: ${user.name} (${user.role.toUpperCase()})`, 'info');
  }, [addAuditLog, showToast]);

  const login = useCallback((email: string, password?: string, remember: boolean = true): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      showToast('Usuário ou e-mail não encontrado no sistema.', 'error');
      return false;
    }

    if (matchedUser.status === 'inativo' || matchedUser.status === 'bloqueado') {
      showToast('Este usuário está inativo ou bloqueado. Consulte o Administrador.', 'error');
      return false;
    }

    // Authenticate user
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    setRememberMe(remember);
    setStored('is_authenticated', true);
    setStored('remember_me', remember);
    if (remember) {
      setSavedEmail(cleanEmail);
      setStored('saved_email', cleanEmail);
    }

    addAuditLog({
      action: 'Autenticação de Usuário (Login)',
      module: 'dashboard',
      recordAffected: matchedUser.name,
      details: `Login efetuado por ${matchedUser.name} (${matchedUser.role.toUpperCase()}). Setor: ${matchedUser.sector}.`,
      result: 'sucesso',
    });

    showToast(`Bem-vindo(a), ${matchedUser.name}!`, 'success');
    return true;
  }, [users, addAuditLog, showToast]);

  const logout = useCallback(() => {
    addAuditLog({
      action: 'Encerramento de Sessão (Logout)',
      module: 'dashboard',
      recordAffected: currentUser.name,
      details: `Sessão do usuário ${currentUser.name} finalizada com segurança.`,
      result: 'sucesso',
    });
    setIsAuthenticated(false);
    setStored('is_authenticated', false);
    showToast('Sessão encerrada com sucesso.', 'info');
  }, [currentUser.name, addAuditLog, showToast]);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'user-' + Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog({
      action: 'Criação de Usuário',
      module: 'usuarios',
      recordAffected: newUser.name,
      details: `Novo usuário criado com perfil ${newUser.role} no setor ${newUser.sector}.`,
    });
    showToast('Usuário cadastrado com sucesso!');
  }, [addAuditLog, showToast]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          addAuditLog({
            action: 'Alteração de Usuário',
            module: 'usuarios',
            recordAffected: updated.name,
            details: `Dados/Permissões atualizadas para ${updated.name}.`,
          });
          return updated;
        }
        return u;
      })
    );
    showToast('Usuário atualizado com sucesso!');
  }, [addAuditLog, showToast]);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'ativo' ? 'inativo' : 'ativo';
          addAuditLog({
            action: newStatus === 'inativo' ? 'Inativação de Usuário' : 'Reativação de Usuário',
            module: 'usuarios',
            recordAffected: u.name,
            details: `Status do usuário alterado para ${newStatus}. Histórico preservado.`,
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    showToast('Status do usuário alterado!');
  }, [addAuditLog, showToast]);

  const addProfessional = useCallback(
    (profData: Omit<Professional, 'id' | 'createdAt'> & { role?: Role; customPermissions?: RolePermissions; createLoginUser?: boolean }) => {
      const profId = 'prof-' + Date.now();
      const newProf: Professional = {
        ...profData,
        id: profId,
        createdAt: new Date().toISOString().substring(0, 10),
      };
      setProfessionals((prev) => [...prev, newProf]);

      // Automatically create or sync associated User account so the professional can log in and exercise assigned functions
      const assignedRole = profData.role || (profData.council === 'CRM' ? 'medico' : profData.council === 'COREN' ? 'enfermagem' : profData.council === 'CRN' ? 'recepcao' : 'recepcao');
      const newUser: User = {
        id: 'user-' + Date.now(),
        name: newProf.name,
        email: newProf.email,
        phone: newProf.phone,
        role: assignedRole,
        professionalId: profId,
        professionalName: newProf.name,
        councilNumber: `${newProf.council} ${newProf.registrationNumber}`,
        specialty: newProf.specialty,
        sector: newProf.sector,
        status: newProf.status,
        customPermissions: newProf.customPermissions,
      };
      setUsers((prev) => [...prev, newUser]);

      addAuditLog({
        action: 'Cadastro de Profissional & Atribuição de Funções',
        module: 'configuracoes',
        recordAffected: newProf.name,
        details: `Profissional cadastrado com credencial ${newProf.council} ${newProf.registrationNumber}, função/perfil ${assignedRole.toUpperCase()}, WhatsApp ${newProf.phone || 'N/I'} no setor ${newProf.sector}. Permissões e conta de usuário configuradas.`,
      });
      showToast('Profissional cadastrado com sucesso!');
    },
    [addAuditLog, showToast]
  );

  const updateProfessional = useCallback(
    (id: string, updates: Partial<Professional> & { role?: Role; customPermissions?: RolePermissions }) => {
      setProfessionals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      // Sync the associated User login and permissions
      setUsers((prev) =>
        prev.map((u) => {
          if (u.professionalId === id) {
            return {
              ...u,
              name: updates.name ?? u.name,
              email: updates.email ?? u.email,
              phone: updates.phone ?? u.phone,
              sector: updates.sector ?? u.sector,
              specialty: updates.specialty ?? u.specialty,
              councilNumber: updates.registrationNumber ? `${updates.council || 'CRM'} ${updates.registrationNumber}` : u.councilNumber,
              role: updates.role ?? u.role,
              status: updates.status ?? u.status,
              customPermissions: updates.customPermissions ?? u.customPermissions,
            };
          }
          return u;
        })
      );

      addAuditLog({
        action: 'Alteração de Cadastro e Funções do Profissional',
        module: 'configuracoes',
        recordAffected: updates.name || id,
        details: `Dados cadastrais, credenciais, WhatsApp, status ou funções/permissões atualizadas pelo Administrador.`,
      });
      showToast('Profissional e funções atualizadas com sucesso!');
    },
    [addAuditLog, showToast]
  );

  const toggleProfessionalStatus = useCallback(
    (id: string) => {
      let changedName = '';
      let newStatus: 'ativo' | 'inativo' = 'ativo';
      setProfessionals((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            newStatus = p.status === 'ativo' ? 'inativo' : 'ativo';
            changedName = p.name;
            return { ...p, status: newStatus };
          }
          return p;
        })
      );

      // Sync status with associated User
      setUsers((prev) =>
        prev.map((u) => {
          if (u.professionalId === id) {
            return { ...u, status: newStatus };
          }
          return u;
        })
      );

      addAuditLog({
        action: newStatus === 'ativo' ? 'Habilitação de Profissional' : 'Desabilitação de Profissional',
        module: 'configuracoes',
        recordAffected: changedName,
        details: `Profissional ${changedName} foi ${newStatus === 'ativo' ? 'HABILITADO (Ativo)' : 'DESABILITADO (Inativo)'} pelo Administrador.`,
      });
      showToast(
        `Profissional ${newStatus === 'ativo' ? 'HABILITADO' : 'DESABILITADO'} com sucesso!`,
        newStatus === 'ativo' ? 'success' : 'info'
      );
    },
    [addAuditLog, showToast]
  );

  const deleteProfessional = useCallback((id: string): { success: boolean; message: string } => {
    const prof = professionals.find((p) => p.id === id);
    if (!prof) {
      return { success: false, message: 'Profissional não encontrado.' };
    }

    const isDoctor = prof.council === 'CRM' || prof.role === 'medico' || prof.specialty?.toLowerCase().includes('médic');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateFormatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // 1. Audit log before/during deletion (audit history persists independently)
    addAuditLog({
      action: isDoctor ? 'Exclusão Definitiva de Médico' : 'Exclusão Definitiva de Profissional',
      module: 'configuracoes',
      recordAffected: `${prof.name} (${prof.council} ${prof.registrationNumber})`,
      details: `${isDoctor ? 'Médico' : 'Profissional'} ${prof.name} (${prof.council} ${prof.registrationNumber}, ID: ${prof.id}) excluído definitivamente pelo administrador ${currentUser.name} em ${dateFormatted}. Registros exclusivos do profissional (usuário vinculado, agendamentos, atendimentos e fila) foram removidos cirurgicamente. Pacientes e demais profissionais continuam intactos.`,
      result: 'sucesso',
    });

    // 2. Remove ONLY this professional from professionals registry by unique ID
    setProfessionals((prev) => prev.filter((p) => p.id !== id));

    // 3. Remove ONLY the user account strictly linked to this professional ID (never remove admins or other staff)
    setUsers((prev) => prev.filter((u) => u.professionalId !== id && u.id !== id));

    // 4. Remove exclusively linked appointments
    setAppointments((prev) => prev.filter((a) => a.professionalId !== id && a.doctorName !== prof.name));

    // 5. Remove exclusively linked consultations
    setConsultations((prev) => prev.filter((c) => c.professionalId !== id && c.doctorName !== prof.name));

    // 6. Remove exclusively linked queue items
    setWaitingQueue((prev) => prev.filter((q) => q.professionalId !== id && q.professionalName !== prof.name));

    // 7. If the deleted user happened to be the currently active session, safely reset to admin user
    if (currentUser.professionalId === id || currentUser.id === id) {
      const fallbackAdmin = users.find((u) => u.role === 'admin' && u.professionalId !== id) || users[0];
      if (fallbackAdmin) {
        setCurrentUser(fallbackAdmin);
      }
    }

    const successMessage = isDoctor ? `✓ Médico ${prof.name} excluído com sucesso.` : `✓ Profissional ${prof.name} excluído com sucesso.`;
    showToast(successMessage, 'success');
    return { success: true, message: successMessage };
  }, [professionals, users, currentUser, addAuditLog, showToast]);

  const sendProfessionalInvite = useCallback((id: string) => {
    const prof = professionals.find((p) => p.id === id);
    if (!prof) return;

    addAuditLog({
      action: 'Envio de Convite por E-mail',
      module: 'configuracoes',
      recordAffected: prof.name,
      details: `Convite de ativação e dados de acesso enviados para o e-mail ${prof.email}.`,
      result: 'sucesso',
    });

    showToast(`Convite de acesso enviado com sucesso para ${prof.email}!`, 'success');
  }, [professionals, addAuditLog, showToast]);

  // Tipos de Atendimentos / Procedimentos CRUD
  const addProcedureType = useCallback((itemData: Omit<ProcedureTypeItem, 'id' | 'createdAt'>): ProcedureTypeItem => {
    const newItem: ProcedureTypeItem = {
      ...itemData,
      id: 'proc-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setProcedureTypes((prev) => [newItem, ...prev]);
    addAuditLog({
      action: 'Cadastro de Tipo de Atendimento / Procedimento',
      module: 'configuracoes',
      recordAffected: newItem.name,
      details: `Novo tipo de atendimento cadastrado: ${newItem.name} (Categoria: ${newItem.category}, Duração: ${newItem.estimatedDurationMinutes} min, Preço padrão: R$ ${newItem.defaultPrice || 0}).`,
      result: 'sucesso',
    });
    showToast(`Tipo de atendimento "${newItem.name}" cadastrado com sucesso!`);
    return newItem;
  }, [addAuditLog, showToast]);

  const updateProcedureType = useCallback((id: string, updates: Partial<ProcedureTypeItem>) => {
    setProcedureTypes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addAuditLog({
      action: 'Alteração de Tipo de Atendimento / Procedimento',
      module: 'configuracoes',
      recordAffected: updates.name || id,
      details: `Parâmetros do tipo de atendimento atualizados.`,
    });
    showToast('Tipo de atendimento atualizado com sucesso!');
  }, [addAuditLog, showToast]);

  const deleteProcedureType = useCallback((id: string) => {
    const proc = procedureTypes.find((p) => p.id === id);
    if (!proc) return;
    setProcedureTypes((prev) => prev.filter((p) => p.id !== id));
    addAuditLog({
      action: 'Exclusão de Tipo de Atendimento / Procedimento',
      module: 'configuracoes',
      recordAffected: proc.name,
      details: `Tipo de atendimento "${proc.name}" excluído pelo Administrador.`,
    });
    showToast(`Tipo de atendimento "${proc.name}" excluído!`, 'info');
  }, [procedureTypes, addAuditLog, showToast]);

  const updateSodPermissions = useCallback((role: string, permissions: RolePermissions) => {
    setSodPermissions((prev) => ({
      ...prev,
      [role]: permissions,
    }));
    addAuditLog({
      action: 'Alteração da Matriz SoD',
      module: 'configuracoes',
      details: `Matriz de segregação de funções atualizada para o perfil ${role.toUpperCase()}.`,
    });
    showToast('Matriz de permissões atualizada!');
  }, [addAuditLog, showToast]);

  // Patients
  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setPatients((prev) => [newPatient, ...prev]);
    addAuditLog({
      action: 'Cadastro de Paciente',
      module: 'pacientes',
      recordAffected: `${newPatient.name} (CPF: ${newPatient.cpf})`,
      details: `Prontuário criado para ${newPatient.name}.`,
    });
    showToast('Paciente cadastrado com sucesso!');
    return newPatient;
  }, [addAuditLog, showToast]);

  const deletePatient = useCallback((id: string): { success: boolean; message: string } => {
    const pat = patients.find((p) => p.id === id);
    if (!pat) {
      return { success: false, message: 'Paciente não encontrado.' };
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateFormatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // 1. Audit log with specific details before/during cascade
    addAuditLog({
      action: 'Exclusão Definitiva de Paciente',
      module: 'pacientes',
      recordAffected: `${pat.name} (CPF: ${pat.cpf})`,
      details: `[EXCLUSÃO DEFINITIVA] Paciente ${pat.name} (ID: ${id}, CPF: ${pat.cpf}) excluído(a) definitivamente pelo Administrador (${currentUser.name}) em ${dateFormatted}. Histórico de prontuário, agendamentos, documentos e orçamentos vinculados foram removidos do sistema.`,
      result: 'sucesso',
    });

    // 2. Cascade delete only records belonging to this specific patient
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setConsultations((prev) => prev.filter((c) => c.patientId !== id));
    setAppointments((prev) => prev.filter((a) => a.patientId !== id));
    setWaitingQueue((prev) => prev.filter((q) => q.patientId !== id));
    setPrescriptions((prev) => prev.filter((pr) => pr.patientId !== id));
    setMedicalDocuments((prev) => prev.filter((md) => md.patientId !== id));
    setExamRequests((prev) => prev.filter((ex) => ex.patientId !== id));
    setAttachments((prev) => prev.filter((att) => att.patientId !== id));
    setTriages((prev) => prev.filter((tr) => tr.patientId !== id));
    setMedicationApplications((prev) => prev.filter((ma) => ma.patientId !== id));
    setProtocolAssignments((prev) => prev.filter((pa) => pa.patientId !== id));
    setPackageAssignments((prev) => prev.filter((pka) => pka.patientId !== id));
    setBudgets((prev) => prev.filter((b) => b.patientId !== id));
    setPatientConsents((prev) => prev.filter((pc) => pc.patientId !== id));

    if (selectedPatientForPEP?.id === id) {
      setSelectedPatientForPEP(null);
    }

    showToast(`Paciente ${pat.name} e registros associados foram excluídos com sucesso!`, 'info');
    return { success: true, message: 'Paciente excluído com sucesso.' };
  }, [patients, currentUser.name, selectedPatientForPEP?.id, addAuditLog, showToast]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    addAuditLog({
      action: 'Atualização Cadastral de Paciente',
      module: 'pacientes',
      details: `Dados cadastrais do paciente atualizados.`,
    });
    showToast('Cadastro do paciente atualizado!');
  }, [addAuditLog, showToast]);

  const togglePatientStatus = useCallback((id: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'ativo' ? 'inativo' : 'ativo';
          addAuditLog({
            action: newStatus === 'inativo' ? 'Inativação de Paciente' : 'Reativação de Paciente',
            module: 'pacientes',
            recordAffected: p.name,
            details: `Paciente marcado como ${newStatus}. Preservação histórica mantida.`,
          });
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
    showToast('Status do paciente atualizado!');
  }, [addAuditLog, showToast]);

  const getPatientById = useCallback((id: string) => {
    return patients.find((p) => p.id === id);
  }, [patients]);

  // Appointments & Queue
  const addAppointment = useCallback((aptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: 'apt-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setAppointments((prev) => [...prev, newApt]);
    addAuditLog({
      action: 'Novo Agendamento',
      module: 'agenda',
      recordAffected: `${newApt.patientName} com ${newApt.professionalName}`,
      details: `Consulta agendada para ${newApt.date} às ${newApt.time} (${newApt.type}).`,
    });
    showToast('Agendamento realizado com sucesso!');
    return newApt;
  }, [addAuditLog, showToast]);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
    );
    showToast('Agendamento atualizado!');
  }, [showToast]);

  const addToWaitingQueue = useCallback((itemData: Omit<WaitingQueueItem, 'id' | 'arrivalTime'>): WaitingQueueItem => {
    const now = new Date();
    const arrivalTime = now.toTimeString().substring(0, 5);
    const newItem: WaitingQueueItem = {
      ...itemData,
      id: 'queue-' + Date.now(),
      arrivalTime,
    };
    setWaitingQueue((prev) => [...prev, newItem]);
    addAuditLog({
      action: itemData.isSpontaneousDemand ? 'Entrada Demanda Espontânea na Fila' : 'Check-in de Paciente na Fila',
      module: 'fila',
      recordAffected: itemData.patientName,
      details: `Paciente adicionado à fila com status ${itemData.status}. Prioridade: ${itemData.priority}.`,
    });
    showToast(`${itemData.patientName} adicionado(a) à fila de espera!`);
    return newItem;
  }, [addAuditLog, showToast]);

  const updateQueueStatus = useCallback((id: string, status: WaitingQueueItem['status'], notes?: string) => {
    setWaitingQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            status,
            notes: notes !== undefined ? notes : item.notes,
            finishedAt: status === 'Finalizado' ? new Date().toTimeString().substring(0, 5) : item.finishedAt,
          };
          addAuditLog({
            action: `Mudança de Status na Fila -> ${status}`,
            module: 'fila',
            recordAffected: item.patientName,
            details: `Status da fila atualizado para ${status}.`,
          });
          return updated;
        }
        return item;
      })
    );
  }, [addAuditLog]);

  const deleteQueueItem = useCallback((id: string) => {
    const item = waitingQueue.find((q) => q.id === id);
    if (!item) return;
    setWaitingQueue((prev) => prev.filter((q) => q.id !== id));
    addAuditLog({
      action: 'Exclusão de Paciente da Fila de Espera',
      module: 'fila',
      recordAffected: item.patientName,
      details: `Paciente ${item.patientName} (${item.appointmentType}) removido da fila de espera por ${currentUser.name}.`,
    });
    showToast(`${item.patientName} removido(a) da fila de espera!`, 'info');
  }, [waitingQueue, currentUser.name, addAuditLog, showToast]);

  const callQueuePatient = useCallback((id: string) => {
    const nowTime = new Date().toTimeString().substring(0, 5);
    setWaitingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, calledAt: nowTime } : item))
    );
    const target = waitingQueue.find((i) => i.id === id);
    if (target) {
      showToast(`Chamando paciente: ${target.patientName}!`, 'info');
      addAuditLog({
        action: 'Chamada de Paciente',
        module: 'fila',
        recordAffected: target.patientName,
        details: `Painel de chamada acionado às ${nowTime}.`,
      });
    }
  }, [addAuditLog, showToast, waitingQueue]);

  // AutoSave & Consultations
  const saveConsultationDraft = useCallback((draft: ConsultationDraft) => {
    setActiveConsultationDraft(draft);
  }, []);

  const clearConsultationDraft = useCallback(() => {
    setActiveConsultationDraft(null);
    localStorage.removeItem(STORAGE_PREFIX + 'consultation_draft');
  }, []);

  const finishConsultation = useCallback((consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Consultation => {
    const now = new Date();
    const newConsultation: Consultation = {
      ...consultationData,
      id: 'cons-' + Date.now(),
      finishedAt: now.toTimeString().substring(0, 5),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'finalizada',
    };
    setConsultations((prev) => [newConsultation, ...prev]);

    // If there was a queue item, finish it
    if (consultationData.queueItemId) {
      updateQueueStatus(consultationData.queueItemId, 'Finalizado', 'Consulta finalizada pelo médico.');
    }

    // Clear active draft
    clearConsultationDraft();

    addAuditLog({
      action: 'Finalização de Consulta Médica (SOAP)',
      module: 'consultorio',
      recordAffected: consultationData.patientName,
      details: `Atendimento médico concluído por ${consultationData.professionalName}. Registro SOAP persistido no PEP.`,
    });

    showToast(`Consulta de ${consultationData.patientName} finalizada com sucesso!`);
    return newConsultation;
  }, [addAuditLog, clearConsultationDraft, showToast, updateQueueStatus]);

  // Prescriptions
  const addPrescription = useCallback((data: Omit<Prescription, 'id' | 'createdAt'>): Prescription => {
    const newPrescription: Prescription = {
      ...data,
      id: 'presc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPrescriptions((prev) => [newPrescription, ...prev]);
    addAuditLog({
      action: 'Emissão de Prescrição Médica',
      module: 'pep',
      recordAffected: data.patientName,
      details: `Receituário emitido com ${data.items.length} itens pelo ${data.professionalName}.`,
    });
    showToast('Prescrição médica salva no prontuário!');
    return newPrescription;
  }, [addAuditLog, showToast]);

  // Documents
  const addMedicalDocument = useCallback((data: Omit<MedicalDocument, 'id' | 'createdAt'>): MedicalDocument => {
    const newDoc: MedicalDocument = {
      ...data,
      id: 'doc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setMedicalDocuments((prev) => [newDoc, ...prev]);
    addAuditLog({
      action: `Emissão de Documento Médico (${data.type})`,
      module: 'pep',
      recordAffected: data.patientName,
      details: `${data.type} gerado por ${data.professionalName}.`,
    });
    showToast(`${data.type} emitido com sucesso!`);
    return newDoc;
  }, [addAuditLog, showToast]);

  // Exams
  const addExamRequest = useCallback((data: Omit<ExamRequest, 'id' | 'createdAt'>): ExamRequest => {
    const newReq: ExamRequest = {
      ...data,
      id: 'exam-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExamRequests((prev) => [newReq, ...prev]);
    addAuditLog({
      action: 'Solicitação de Exames Complementares',
      module: 'exames',
      recordAffected: data.patientName,
      details: `${data.examsList.length} exames solicitados por ${data.professionalName}.`,
    });
    showToast('Solicitação de exames registrada!');
    return newReq;
  }, [addAuditLog, showToast]);

  const updateExamStatus = useCallback((id: string, status: ExamRequest['status'], resultReport?: string) => {
    setExamRequests((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              resultReport: resultReport || e.resultReport,
              resultDate: status === 'realizado' || status === 'laudado' ? new Date().toISOString().substring(0, 10) : e.resultDate,
            }
          : e
      )
    );
    showToast('Status do exame atualizado!');
  }, [showToast]);

  // Attachments
  const addAttachment = useCallback((data: Omit<Attachment, 'id' | 'uploadedAt'>): Attachment => {
    const newAtt: Attachment = {
      ...data,
      id: 'att-' + Date.now(),
      uploadedAt: new Date().toISOString().substring(0, 19).replace('T', ' '),
    };
    setAttachments((prev) => [newAtt, ...prev]);
    addAuditLog({
      action: 'Upload de Anexo no Prontuário',
      module: 'pep',
      details: `Arquivo ${newAtt.name} (${newAtt.category}) anexado ao prontuário.`,
    });
    showToast('Anexo salvo no prontuário com sucesso!');
    return newAtt;
  }, [addAuditLog, showToast]);

  // Nursing & Triage
  const saveTriage = useCallback((data: Omit<NursingTriage, 'id' | 'timestamp'>): NursingTriage => {
    const newTriage: NursingTriage = {
      ...data,
      id: 'triage-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setTriages((prev) => [newTriage, ...prev]);

    // Update Queue Item
    setWaitingQueue((prev) =>
      prev.map((item) =>
        item.id === data.waitingQueueId
          ? {
              ...item,
              status: 'Aguardando médico',
              triageId: newTriage.id,
              notes: `Triagem ${data.riskClassification.toUpperCase()} (${data.priorityDescription}). PA: ${data.vitals.bloodPressure}, FC: ${data.vitals.heartRate}bpm.`,
            }
          : item
      )
    );

    addAuditLog({
      action: 'Triagem de Enfermagem Concluída',
      module: 'triagem',
      recordAffected: data.patientName,
      details: `Classificação de Risco: ${data.priorityDescription} (${data.riskClassification.toUpperCase()}) por ${data.nurseName}.`,
    });

    showToast(`Triagem de ${data.patientName} salva! Encaminhado para o consultório.`);
    return newTriage;
  }, [addAuditLog, showToast]);

  const addMedication = useCallback((data: Omit<Medication, 'id'>): Medication => {
    const newMed: Medication = {
      ...data,
      id: 'med-' + Date.now(),
      createdAt: data.createdAt || new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString(),
    };
    setMedications((prev) => [newMed, ...prev]);
    addAuditLog({
      action: 'Cadastro de Medicamento',
      module: 'estoque',
      recordAffected: newMed.name,
      details: `Medicamento ${newMed.name} (${newMed.presentation || ''} - ${newMed.dosage || ''}) cadastrado no estoque com saldo inicial de ${newMed.stockQuantity} ${newMed.unit}.`,
    });
    showToast('Medicamento cadastrado com sucesso!');
    return newMed;
  }, [addAuditLog, showToast]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates, updatedAt: new Date().toISOString() };
          addAuditLog({
            action: 'Atualização de Medicamento',
            module: 'estoque',
            recordAffected: updated.name,
            details: `Dados do medicamento ${updated.name} atualizados no estoque.`,
          });
          return updated;
        }
        return m;
      })
    );
    showToast('Medicamento atualizado com sucesso!');
  }, [addAuditLog, showToast]);

  const deleteMedication = useCallback((id: string): { success: boolean; softDeleted: boolean; message: string } => {
    const med = medications.find((m) => m.id === id);
    if (!med) {
      return { success: false, softDeleted: false, message: 'Medicamento não encontrado.' };
    }

    const hasApplications = medicationApplications.some((a) => a.medicationId === id);
    const hasMovements = inventoryMovements.some((mov) => mov.medicationId === id);
    const hasPrescriptions = prescriptions.some((p) =>
      p.items.some((item) => item.medicationName?.toLowerCase().includes(med.name.toLowerCase()))
    );

    const hasHistoricalData = hasApplications || hasMovements || hasPrescriptions;

    if (hasHistoricalData) {
      // Logical delete / inactivation: preserves clinical, pharmaceutical, and audit records
      setMedications((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status: 'inativo', isDeleted: true, updatedAt: new Date().toISOString() }
            : m
        )
      );
      addAuditLog({
        action: 'Inativação de Medicamento (Histórico Preservado)',
        module: 'estoque',
        recordAffected: med.name,
        details: `Medicamento ${med.name} inativado. Histórico de aplicações/movimentações preservado para conformidade clínica e fiscal.`,
      });
      showToast('Medicamento inativado com sucesso! O histórico foi preservado para auditoria.', 'info');
      return {
        success: true,
        softDeleted: true,
        message: 'Medicamento inativado para manter a integridade dos registros históricos.',
      };
    } else {
      // Hard delete if never used in any historical record
      setMedications((prev) => prev.filter((m) => m.id !== id));
      addAuditLog({
        action: 'Exclusão de Medicamento',
        module: 'estoque',
        recordAffected: med.name,
        details: `Medicamento ${med.name} sem histórico foi removido do catálogo de estoque.`,
      });
      showToast('Medicamento excluído com sucesso!');
      return {
        success: true,
        softDeleted: false,
        message: 'Medicamento removido do catálogo com sucesso.',
      };
    }
  }, [medications, medicationApplications, inventoryMovements, prescriptions, addAuditLog, showToast]);

  const recordMedicationApplication = useCallback((appData: Omit<MedicationApplication, 'id'>) => {
    const newApp: MedicationApplication = {
      ...appData,
      id: 'app-' + Date.now(),
    };
    setMedicationApplications((prev) => [newApp, ...prev]);

    const qtyUsed = appData.quantityUsed && appData.quantityUsed > 0 ? appData.quantityUsed : 1;

    // If application is marked as 'realizada', automatically deduct stock and record stock movement
    if (appData.status === 'realizada') {
      const targetMed = medications.find((m) => m.id === appData.medicationId);
      const prevQty = targetMed ? targetMed.stockQuantity : 0;
      const newQty = Math.max(0, prevQty - qtyUsed);

      // 1. Update stock
      setMedications((prev) =>
        prev.map((med) => {
          if (med.id === appData.medicationId) {
            return { ...med, stockQuantity: newQty, updatedAt: new Date().toISOString() };
          }
          return med;
        })
      );

      // 2. Register automatic inventory movement (type: 'aplicacao')
      const newMovement: InventoryMovement = {
        id: 'mov-' + Date.now(),
        medicationId: appData.medicationId,
        medicationName: appData.medicationName,
        type: 'aplicacao',
        quantity: qtyUsed,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason: `Aplicação administrada ao paciente ${appData.patientName} (${appData.dosage || ''} via ${appData.route})`,
        responsibleName: appData.nurseName,
        userId: currentUser.id,
        patientId: appData.patientId,
        patientName: appData.patientName,
        date: appData.date || new Date().toISOString().substring(0, 10),
        time: appData.time || new Date().toTimeString().substring(0, 5),
        notes: appData.observations || '',
      };
      setInventoryMovements((prev) => [newMovement, ...prev]);

      addAuditLog({
        action: 'Aplicação de Medicação & Baixa Automática de Estoque',
        module: 'aplicacoes',
        recordAffected: `${appData.patientName} - ${appData.medicationName}`,
        details: `Aplicação (${appData.dosage} via ${appData.route}) realizada por ${appData.nurseName}. Baixa automática de ${qtyUsed} un. no estoque (${prevQty} -> ${newQty}).`,
      });

      showToast(`Aplicação realizada! Baixa de ${qtyUsed} un. registrada no estoque com sucesso.`);
    } else {
      addAuditLog({
        action: 'Agendamento de Aplicação de Medicação',
        module: 'aplicacoes',
        recordAffected: `${appData.patientName} - ${appData.medicationName}`,
        details: `Aplicação agendada para ${appData.date} às ${appData.time}.`,
      });
      showToast(`Aplicação registrada.`);
    }
  }, [currentUser.id, medications, addAuditLog, showToast]);

  const deleteMedicationApplication = useCallback((id: string, restoreStock: boolean = false) => {
    const app = medicationApplications.find((a) => a.id === id);
    if (!app) return;

    if (restoreStock && app.status === 'realizada' && app.medicationId) {
      const qtyToRestore = app.quantityUsed && app.quantityUsed > 0 ? app.quantityUsed : 1;
      const targetMed = medications.find((m) => m.id === app.medicationId);
      const prevQty = targetMed ? targetMed.stockQuantity : 0;
      const restoredQty = prevQty + qtyToRestore;

      // Restore stock
      setMedications((prev) =>
        prev.map((med) => (med.id === app.medicationId ? { ...med, stockQuantity: restoredQty, updatedAt: new Date().toISOString() } : med))
      );

      // Register estorno movement
      const estornoMovement: InventoryMovement = {
        id: 'mov-' + Date.now(),
        medicationId: app.medicationId,
        medicationName: app.medicationName,
        type: 'estorno',
        quantity: qtyToRestore,
        previousQuantity: prevQty,
        newQuantity: restoredQty,
        reason: `Estorno de aplicação excluída (Paciente: ${app.patientName})`,
        responsibleName: currentUser.name,
        userId: currentUser.id,
        patientId: app.patientId,
        patientName: app.patientName,
        date: new Date().toISOString().substring(0, 10),
        time: new Date().toTimeString().substring(0, 5),
        notes: `Estorno automático devido à exclusão da aplicação ${app.id}.`,
      };
      setInventoryMovements((prev) => [estornoMovement, ...prev]);
    }

    setMedicationApplications((prev) => prev.filter((a) => a.id !== id));

    addAuditLog({
      action: 'Exclusão de Registro de Aplicação de Medicação',
      module: 'aplicacoes',
      recordAffected: `${app.patientName} - ${app.medicationName}`,
      details: `Registro de aplicação de ${app.medicationName} para ${app.patientName} excluído por ${currentUser.name}.${restoreStock ? ' Estoque estornado com sucesso.' : ''}`,
    });

    showToast(`Registro de aplicação excluído com sucesso!${restoreStock ? ' (Estoque estornado)' : ''}`, 'info');
  }, [medicationApplications, medications, currentUser.name, currentUser.id, addAuditLog, showToast]);

  const recordInventoryMovement = useCallback((data: Omit<InventoryMovement, 'id' | 'date'>) => {
    const now = new Date();
    const newMovement: InventoryMovement = {
      ...data,
      id: 'mov-' + Date.now(),
      date: now.toISOString().substring(0, 10),
      time: data.time || now.toTimeString().substring(0, 5),
    };
    setInventoryMovements((prev) => [newMovement, ...prev]);
    setMedications((prev) =>
      prev.map((med) => (med.id === data.medicationId ? { ...med, stockQuantity: data.newQuantity, updatedAt: new Date().toISOString() } : med))
    );
    addAuditLog({
      action: `Movimentação de Estoque (${data.type.toUpperCase()})`,
      module: 'estoque',
      recordAffected: data.medicationName,
      details: `${data.reason}: ${data.previousQuantity} -> ${data.newQuantity} (${data.responsibleName}).`,
    });
    showToast('Movimentação de estoque registrada com sucesso!');
  }, [addAuditLog, showToast]);

  // Protocols & Packages
  const addIntelligentProtocol = useCallback((data: Omit<IntelligentProtocol, 'id'>): IntelligentProtocol => {
    const newProto: IntelligentProtocol = {
      ...data,
      id: 'proto-' + Date.now(),
    };
    setIntelligentProtocols((prev) => [newProto, ...prev]);
    addAuditLog({
      action: 'Criação de Modelo de Protocolo Clínico',
      module: 'protocolos',
      recordAffected: newProto.name,
      details: `Novo modelo de protocolo criado com ${newProto.steps.length} etapas (${newProto.objective || newProto.category}).`,
      result: 'sucesso',
    });
    showToast(`Modelo de protocolo "${newProto.name}" cadastrado com sucesso!`);
    return newProto;
  }, [addAuditLog, showToast]);

  const updateIntelligentProtocol = useCallback((id: string, updates: Partial<IntelligentProtocol>) => {
    setIntelligentProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog({
      action: 'Atualização de Modelo de Protocolo',
      module: 'protocolos',
      recordAffected: updates.name || id,
      details: `Modelo de protocolo atualizado por ${currentUser.name}.`,
      result: 'sucesso',
    });
    showToast('Protocolo atualizado com sucesso!');
  }, [currentUser.name, addAuditLog, showToast]);

  const duplicateIntelligentProtocol = useCallback((id: string): IntelligentProtocol => {
    const original = intelligentProtocols.find((p) => p.id === id);
    if (!original) throw new Error('Protocolo não encontrado');
    const newProto: IntelligentProtocol = {
      ...original,
      id: 'proto-' + Date.now(),
      name: `${original.name} (Cópia)`,
    };
    setIntelligentProtocols((prev) => [newProto, ...prev]);
    addAuditLog({
      action: 'Duplicação de Modelo de Protocolo',
      module: 'protocolos',
      recordAffected: newProto.name,
      details: `Modelo duplicado a partir de "${original.name}".`,
      result: 'sucesso',
    });
    showToast(`Modelo "${newProto.name}" duplicado com sucesso!`);
    return newProto;
  }, [intelligentProtocols, addAuditLog, showToast]);

  const deleteIntelligentProtocol = useCallback((id: string): { success: boolean; message: string } => {
    const proto = intelligentProtocols.find((p) => p.id === id);
    if (!proto) return { success: false, message: 'Modelo de protocolo não encontrado.' };

    setIntelligentProtocols((prev) => prev.filter((p) => p.id !== id));
    addAuditLog({
      action: 'Exclusão de Modelo de Protocolo',
      module: 'protocolos',
      recordAffected: proto.name,
      details: `Modelo de protocolo "${proto.name}" (ID: ${id}) excluído por ${currentUser.name}. Protocolos de pacientes já em andamento foram preservados.`,
      result: 'sucesso',
    });
    showToast(`Modelo de protocolo "${proto.name}" excluído com sucesso!`, 'info');
    return { success: true, message: 'Modelo de protocolo excluído com sucesso.' };
  }, [intelligentProtocols, currentUser.name, addAuditLog, showToast]);

  const assignProtocolToPatient = useCallback((assignmentData: Omit<ProtocolAssignment, 'id'>) => {
    const newAssign: ProtocolAssignment = {
      ...assignmentData,
      id: 'passign-' + Date.now(),
    };
    setProtocolAssignments((prev) => [newAssign, ...prev]);
    addAuditLog({
      action: 'Vinculação de Protocolo Inteligente',
      module: 'protocolos',
      recordAffected: `${assignmentData.patientName} - ${assignmentData.protocolName}`,
      details: `Protocolo iniciado com ${assignmentData.totalSessions} sessões programadas.`,
    });
    showToast(`Protocolo vinculado a ${assignmentData.patientName}!`);
  }, [addAuditLog, showToast]);

  const updateProtocolAssignment = useCallback((id: string, updates: Partial<ProtocolAssignment>) => {
    setProtocolAssignments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Acompanhamento do protocolo atualizado!');
  }, [showToast]);

  const deleteProtocolAssignment = useCallback((id: string) => {
    const assign = protocolAssignments.find((p) => p.id === id);
    if (!assign) return;
    setProtocolAssignments((prev) => prev.filter((p) => p.id !== id));
    addAuditLog({
      action: 'Exclusão de Protocolo em Andamento',
      module: 'protocolos',
      recordAffected: `${assign.patientName} - ${assign.protocolName}`,
      details: `Protocolo em andamento do paciente ${assign.patientName} excluído por ${currentUser.name}.`,
      result: 'sucesso',
    });
    showToast(`Protocolo de ${assign.patientName} excluído!`, 'info');
  }, [protocolAssignments, currentUser.name, addAuditLog, showToast]);

  const addProtocolEvolutionNote = useCallback((id: string, note: string) => {
    const nowStr = new Date().toISOString().substring(0, 10);
    setProtocolAssignments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newEvolutions = [
            ...(p.evolutionNotes || []),
            { date: nowStr, note, author: currentUser.name },
          ];
          return {
            ...p,
            completedSessions: Math.min(p.totalSessions, p.completedSessions + 1),
            evolutionNotes: newEvolutions,
          };
        }
        return p;
      })
    );
    showToast('Evolução do protocolo salva!');
  }, [currentUser.name, showToast]);

  // Treatment Packages CRUD
  const addTreatmentPackage = useCallback((data: Omit<TreatmentPackage, 'id'>): TreatmentPackage => {
    const newPkg: TreatmentPackage = {
      ...data,
      id: 'pkg-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setTreatmentPackages((prev) => [newPkg, ...prev]);
    addAuditLog({
      action: 'Criação de Pacote de Tratamento',
      module: 'pacotes',
      recordAffected: newPkg.name,
      details: `Novo pacote pronto criado: ${newPkg.name} (R$ ${newPkg.price.toFixed(2)}, ${newPkg.totalSessions} sessões).`,
      result: 'sucesso',
    });
    showToast(`Pacote "${newPkg.name}" cadastrado com sucesso!`);
    return newPkg;
  }, [addAuditLog, showToast]);

  const updateTreatmentPackage = useCallback((id: string, updates: Partial<TreatmentPackage>) => {
    setTreatmentPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addAuditLog({
      action: 'Atualização de Pacote de Tratamento',
      module: 'pacotes',
      recordAffected: updates.name || id,
      details: `Pacote de tratamento atualizado por ${currentUser.name}. Histórico de orçamentos anteriores preservado.`,
      result: 'sucesso',
    });
    showToast('Pacote atualizado com sucesso!');
  }, [currentUser.name, addAuditLog, showToast]);

  const duplicateTreatmentPackage = useCallback((id: string): TreatmentPackage => {
    const original = treatmentPackages.find((p) => p.id === id);
    if (!original) throw new Error('Pacote não encontrado');
    const newPkg: TreatmentPackage = {
      ...original,
      id: 'pkg-' + Date.now(),
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setTreatmentPackages((prev) => [newPkg, ...prev]);
    addAuditLog({
      action: 'Duplicação de Pacote de Tratamento',
      module: 'pacotes',
      recordAffected: newPkg.name,
      details: `Pacote duplicado a partir de "${original.name}".`,
      result: 'sucesso',
    });
    showToast(`Pacote "${newPkg.name}" duplicado com sucesso!`);
    return newPkg;
  }, [treatmentPackages, addAuditLog, showToast]);

  const deleteTreatmentPackage = useCallback((id: string): { success: boolean; message: string } => {
    const pkg = treatmentPackages.find((p) => p.id === id);
    if (!pkg) return { success: false, message: 'Pacote não encontrado.' };
    setTreatmentPackages((prev) => prev.filter((p) => p.id !== id));
    addAuditLog({
      action: 'Exclusão de Pacote de Tratamento',
      module: 'pacotes',
      recordAffected: pkg.name,
      details: `Pacote "${pkg.name}" (ID: ${id}) excluído por ${currentUser.name}. Histórico de orçamentos e sessões de pacientes já atribuídas permanecem intactos.`,
      result: 'sucesso',
    });
    showToast(`Pacote "${pkg.name}" excluído com sucesso!`, 'info');
    return { success: true, message: 'Pacote excluído com sucesso.' };
  }, [treatmentPackages, currentUser.name, addAuditLog, showToast]);

  const assignPackageToPatient = useCallback((data: Omit<PackageAssignment, 'id'>) => {
    const newPackageAssignment: PackageAssignment = {
      ...data,
      id: 'pkga-' + Date.now(),
    };
    setPackageAssignments((prev) => [newPackageAssignment, ...prev]);
    showToast(`Pacote de tratamento vinculado a ${data.patientName}!`);
  }, [showToast]);

  const usePackageSession = useCallback((assignmentId: string, note: string) => {
    const nowStr = new Date().toISOString().substring(0, 10);
    setPackageAssignments((prev) =>
      prev.map((p) => {
        if (p.id === assignmentId && p.remainingSessions > 0) {
          const used = p.usedSessions + 1;
          const remaining = p.remainingSessions - 1;
          const newStatus = remaining === 0 ? 'Concluído' : 'Ativo';
          return {
            ...p,
            usedSessions: used,
            remainingSessions: remaining,
            status: newStatus,
            usageHistory: [
              ...(p.usageHistory || []),
              { date: nowStr, professionalName: currentUser.name, note },
            ],
          };
        }
        return p;
      })
    );
    showToast('Sessão do pacote debitada com sucesso!');
  }, [currentUser.name, showToast]);

  // Budgets & Finance
  const addBudget = useCallback((data: Omit<Budget, 'id' | 'createdAt'>): Budget => {
    const newBudget: Budget = {
      ...data,
      id: 'bud-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setBudgets((prev) => [newBudget, ...prev]);
    addAuditLog({
      action: 'Criação de Orçamento Clínico',
      module: 'orcamentos',
      recordAffected: `${newBudget.patientName} (R$ ${newBudget.finalValue.toFixed(2)})`,
      details: `Orçamento criado com ${newBudget.items.length} itens.`,
    });
    showToast('Orçamento salvo com sucesso!');
    return newBudget;
  }, [addAuditLog, showToast]);

  const updateBudgetStatus = useCallback((id: string, status: Budget['status']) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, status };
          addAuditLog({
            action: `Mudança de Status do Orçamento -> ${status}`,
            module: 'orcamentos',
            recordAffected: `${b.patientName} (#${b.id})`,
            details: `Orçamento de R$ ${b.finalValue.toFixed(2)} atualizado para ${status}.`,
          });
          return updated;
        }
        return b;
      })
    );
    showToast(`Status do orçamento atualizado para: ${status}!`);
  }, [addAuditLog, showToast]);

  const deleteBudget = useCallback((id: string): { success: boolean; message: string } => {
    const bud = budgets.find((b) => b.id === id);
    if (!bud) return { success: false, message: 'Orçamento não encontrado.' };
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    addAuditLog({
      action: 'Exclusão de Orçamento',
      module: 'orcamentos',
      recordAffected: `${bud.patientName} (R$ ${bud.finalValue.toFixed(2)})`,
      details: `Orçamento #${id} de ${bud.patientName} excluído por ${currentUser.name}. Cadastro do paciente e outros dados permanecem intactos.`,
      result: 'sucesso',
    });
    showToast(`Orçamento de ${bud.patientName} excluído com sucesso!`, 'info');
    return { success: true, message: 'Orçamento excluído com sucesso.' };
  }, [budgets, currentUser.name, addAuditLog, showToast]);

  const addFinancialTransaction = useCallback((txData: Omit<FinancialTransaction, 'id' | 'date' | 'time'>): FinancialTransaction => {
    const now = new Date();
    const date = now.toISOString().substring(0, 10);
    const time = now.toTimeString().substring(0, 5);
    const newTx: FinancialTransaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      date,
      time,
    };
    setFinancialTransactions((prev) => [newTx, ...prev]);

    // Update Cash register balance
    setCashRegister((curr) => {
      const isInflow = newTx.type === 'entrada';
      const newInflows = isInflow ? curr.totalInflows + newTx.value : curr.totalInflows;
      const newOutflows = !isInflow ? curr.totalOutflows + newTx.value : curr.totalOutflows;
      const newBalance = isInflow ? curr.currentBalance + newTx.value : curr.currentBalance - newTx.value;
      return {
        ...curr,
        totalInflows: newInflows,
        totalOutflows: newOutflows,
        currentBalance: newBalance,
      };
    });

    addAuditLog({
      action: `Lançamento Financeiro (${newTx.type.toUpperCase()})`,
      module: 'financeiro',
      recordAffected: `R$ ${newTx.value.toFixed(2)} - ${newTx.category}`,
      details: `${newTx.description} (${newTx.paymentMethod}). Responsável: ${newTx.responsibleName}.`,
    });

    showToast(`Lançamento de R$ ${newTx.value.toFixed(2)} registrado no caixa!`);
    return newTx;
  }, [addAuditLog, showToast]);

  const deleteFinancialTransaction = useCallback((id: string): { success: boolean; message: string } => {
    const tx = financialTransactions.find((t) => t.id === id);
    if (!tx) {
      return { success: false, message: 'Lançamento financeiro não encontrado.' };
    }

    setFinancialTransactions((prev) => prev.filter((t) => t.id !== id));

    // Rebalance cash register
    setCashRegister((curr) => {
      const isInflow = tx.type === 'entrada';
      const newInflows = isInflow ? Math.max(0, curr.totalInflows - tx.value) : curr.totalInflows;
      const newOutflows = !isInflow ? Math.max(0, curr.totalOutflows - tx.value) : curr.totalOutflows;
      const newBalance = isInflow ? curr.currentBalance - tx.value : curr.currentBalance + tx.value;
      return {
        ...curr,
        totalInflows: newInflows,
        totalOutflows: newOutflows,
        currentBalance: newBalance,
      };
    });

    addAuditLog({
      action: 'Exclusão de Lançamento Financeiro',
      module: 'financeiro',
      recordAffected: `ID: ${id} | ${tx.description} (R$ ${tx.value.toFixed(2)})`,
      details: `Lançamento de ${tx.type.toUpperCase()} no valor de R$ ${tx.value.toFixed(2)} (${tx.category} / ${tx.paymentMethod}) excluído pelo Administrador (${currentUser.name}).`,
      result: 'sucesso',
    });

    showToast(`Lançamento financeiro de R$ ${tx.value.toFixed(2)} excluído com sucesso!`, 'info');
    return { success: true, message: 'Lançamento financeiro excluído com sucesso.' };
  }, [financialTransactions, currentUser.name, addAuditLog, showToast]);

  const closeCashRegister = useCallback((closingNotes?: string) => {
    const nowTime = new Date().toTimeString().substring(0, 5);
    setCashRegister((curr) => ({
      ...curr,
      status: 'fechado',
      closedAt: nowTime,
      closedBy: currentUser.name,
      closingNotes,
    }));
    addAuditLog({
      action: 'Fechamento de Caixa Diário',
      module: 'financeiro',
      details: `Caixa do dia fechado com saldo final de R$ ${cashRegister.currentBalance.toFixed(2)} por ${currentUser.name}.`,
    });
    showToast('Caixa do dia fechado com sucesso!', 'info');
  }, [addAuditLog, cashRegister.currentBalance, currentUser.name, showToast]);

  const openCashRegister = useCallback((openingBalance: number) => {
    const nowTime = new Date().toTimeString().substring(0, 5);
    const todayStr = new Date().toISOString().substring(0, 10);
    const newRegister: CashRegister = {
      id: 'cash-' + Date.now(),
      date: todayStr,
      status: 'aberto',
      openingBalance,
      currentBalance: openingBalance,
      totalInflows: 0,
      totalOutflows: 0,
      openedAt: nowTime,
      openedBy: currentUser.name,
    };
    setCashRegister(newRegister);
    addAuditLog({
      action: 'Abertura de Caixa Diário',
      module: 'financeiro',
      details: `Caixa aberto com saldo inicial de R$ ${openingBalance.toFixed(2)} por ${currentUser.name}.`,
    });
    showToast('Caixa aberto para movimentações!');
  }, [addAuditLog, currentUser.name, showToast]);

  // NFS-e Actions (Emissão Integrada de Nota Fiscal de Serviços)
  const issueNfse = useCallback(
    (data: Omit<NfseInvoice, 'id' | 'number' | 'rpsNumber' | 'rpsSeries' | 'status' | 'issueDate' | 'issueTime' | 'verificationCode' | 'accessKey' | 'protocolNumber' | 'issuedByUserName'>): NfseInvoice => {
      const now = new Date();
      const issueDate = now.toISOString().substring(0, 10);
      const issueTime = now.toTimeString().substring(0, 8);
      const year = now.getFullYear();
      const seqNum = nfseInvoices.length + 413;
      const numberStr = `${year}/${String(seqNum).padStart(6, '0')}`;
      const rpsNum = `RPS-${seqNum + 480}`;
      const rpsSeries = '1';

      const hex = () => Math.random().toString(16).substring(2, 6).toUpperCase();
      const verificationCode = `${hex()}-${hex()}-${hex()}`;
      const accessKey = `35${String(year).substring(2)}${String(now.getMonth() + 1).padStart(2, '0')}48912345000189560010000${String(seqNum).padStart(6, '0')}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const protocolNumber = `SP${year}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newNfse: NfseInvoice = {
        ...data,
        id: 'nfse-' + Date.now(),
        number: numberStr,
        rpsNumber: rpsNum,
        rpsSeries,
        status: 'autorizada',
        issueDate,
        issueTime,
        verificationCode,
        accessKey,
        protocolNumber,
        issuedByUserName: currentUser.name,
      };

      setNfseInvoices((prev) => [newNfse, ...prev]);

      addAuditLog({
        action: 'Emissão de NFS-e (Autorizada pela Prefeitura)',
        module: 'financeiro',
        recordAffected: `NFS-e Nº ${newNfse.number} (${newNfse.takerName})`,
        details: `Nota Fiscal de Serviços Eletrônica emitida no valor de R$ ${newNfse.serviceValue.toFixed(2)}. Protocolo: ${protocolNumber}. Chave de Acesso: ${accessKey}.`,
      });

      showToast(`NFS-e Nº ${newNfse.number} transmitida e autorizada com sucesso!`);
      return newNfse;
    },
    [currentUser.name, nfseInvoices.length, addAuditLog, showToast]
  );

  const cancelNfse = useCallback(
    (id: string, cancellationReason: string) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      let cancelledDoc: NfseInvoice | undefined;

      setNfseInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === id) {
            cancelledDoc = {
              ...inv,
              status: 'cancelada',
              cancellationReason,
              cancelledAt: nowStr,
              cancelledBy: currentUser.name,
            };
            return cancelledDoc;
          }
          return inv;
        })
      );

      if (cancelledDoc) {
        addAuditLog({
          action: 'Cancelamento de NFS-e',
          module: 'financeiro',
          recordAffected: `NFS-e Nº ${cancelledDoc.number}`,
          details: `NFS-e cancelada por ${currentUser.name}. Motivo: ${cancellationReason}. Protocolo de cancelamento registrado na Prefeitura.`,
        });
        showToast(`NFS-e Nº ${cancelledDoc.number} cancelada com sucesso!`, 'info');
      }
    },
    [currentUser.name, addAuditLog, showToast]
  );

  const deleteNfseInvoice = useCallback((id: string): { success: boolean; message: string } => {
    const inv = nfseInvoices.find((n) => n.id === id);
    if (!inv) {
      return { success: false, message: 'NFS-e não encontrada.' };
    }

    setNfseInvoices((prev) => prev.filter((n) => n.id !== id));

    addAuditLog({
      action: 'Exclusão de Registro de NFS-e',
      module: 'financeiro',
      recordAffected: `NFS-e Nº ${inv.number} (${inv.takerName})`,
      details: `Registro da NFS-e Nº ${inv.number} (Status: ${inv.status}, R$ ${inv.serviceValue.toFixed(2)}) excluído do sistema por ${currentUser.name}.`,
      result: 'sucesso',
    });

    showToast(`NFS-e Nº ${inv.number} excluída do sistema com sucesso!`, 'info');
    return { success: true, message: 'NFS-e excluída com sucesso.' };
  }, [nfseInvoices, currentUser.name, addAuditLog, showToast]);

  const updateClinicBranding = useCallback((branding: ClinicBrandingConfig) => {
    setClinicConfig((prev) => ({
      ...prev,
      branding,
    }));
    addAuditLog({
      action: 'Atualização de Identidade Visual da Clínica',
      module: 'configuracoes',
      details: `Paleta de cores e tipografia de cabeçalhos de documentos atualizada. Fonte: ${branding.fontFamily}, Preset: ${branding.presetName || 'Personalizado'}.`,
      result: 'sucesso',
    });
    showToast('Identidade visual e cabeçalhos atualizados com sucesso!');
  }, [addAuditLog, showToast]);

  const resetClinicBranding = useCallback(() => {
    setClinicConfig((prev) => ({
      ...prev,
      branding: DEFAULT_CLINIC_BRANDING,
    }));
    addAuditLog({
      action: 'Restauração da Identidade Visual Padrão',
      module: 'configuracoes',
      details: `Identidade visual da clínica restaurada para os padrões originais Plennus.`,
      result: 'sucesso',
    });
    showToast('Identidade visual restaurada para o padrão!');
  }, [addAuditLog, showToast]);

  const getNfseByTransactionId = useCallback(
    (txId: string): NfseInvoice | undefined => {
      return nfseInvoices.find((n) => n.transactionId === txId && n.status === 'autorizada');
    },
    [nfseInvoices]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Consent Templates (TCLE) Actions
  const addConsentTemplate = useCallback(
    (tplData: Omit<ConsentTermTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTpl: ConsentTermTemplate = {
        ...tplData,
        id: 'tcle-tpl-' + Date.now(),
        createdAt: now,
        updatedAt: now,
        previousVersions: [],
      };
      setConsentTemplates((prev) => [newTpl, ...prev]);
      addAuditLog({
        action: 'Criação de Modelo de Termo (TCLE)',
        module: 'pep',
        recordAffected: newTpl.name,
        details: `Criado modelo de termo ${newTpl.name} (Versão ${newTpl.version}) na categoria ${newTpl.treatmentCategory}.`,
        result: 'sucesso',
      });
      showToast(`Modelo de termo "${newTpl.name}" criado com sucesso!`);
      return newTpl;
    },
    [addAuditLog, showToast]
  );

  const updateConsentTemplate = useCallback(
    (id: string, updates: Partial<ConsentTermTemplate>) => {
      const now = new Date().toISOString();
      setConsentTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
      );
      addAuditLog({
        action: 'Atualização de Modelo de Termo (TCLE)',
        module: 'pep',
        recordAffected: id,
        details: `Configurações do modelo de termo atualizadas.`,
        result: 'sucesso',
      });
      showToast('Modelo de termo atualizado com sucesso!');
    },
    [addAuditLog, showToast]
  );

  const duplicateConsentTemplate = useCallback(
    (id: string) => {
      const original = consentTemplates.find((t) => t.id === id);
      if (!original) throw new Error('Template not found');
      const now = new Date().toISOString();
      const duplicated: ConsentTermTemplate = {
        ...original,
        id: 'tcle-tpl-' + Date.now(),
        name: `${original.name} (Cópia)`,
        version: '1.0',
        createdAt: now,
        updatedAt: now,
        previousVersions: [],
      };
      setConsentTemplates((prev) => [duplicated, ...prev]);
      addAuditLog({
        action: 'Duplicação de Modelo de Termo (TCLE)',
        module: 'pep',
        recordAffected: duplicated.name,
        details: `Duplicado a partir de ${original.name}.`,
        result: 'sucesso',
      });
      showToast(`Termo "${original.name}" duplicado com sucesso!`);
      return duplicated;
    },
    [consentTemplates, addAuditLog, showToast]
  );

  const createNewTemplateVersion = useCallback(
    (id: string, newText: string, updatedDeclarations?: string[]) => {
      const original = consentTemplates.find((t) => t.id === id);
      if (!original) throw new Error('Template not found');
      const now = new Date().toISOString();
      const currentVerNumber = parseFloat(original.version) || 1.0;
      const nextVerString = (currentVerNumber + 1.0).toFixed(1);

      const oldVersionRecord = {
        version: original.version,
        fullText: original.fullText,
        updatedAt: now,
        updatedBy: currentUser.name,
      };

      const updatedTpl: ConsentTermTemplate = {
        ...original,
        version: nextVerString,
        fullText: newText,
        requiredDeclarations: updatedDeclarations || original.requiredDeclarations,
        updatedAt: now,
        previousVersions: [...(original.previousVersions || []), oldVersionRecord],
      };

      setConsentTemplates((prev) => prev.map((t) => (t.id === id ? updatedTpl : t)));

      addAuditLog({
        action: 'Nova Versão de Termo de Consentimento',
        module: 'pep',
        recordAffected: original.name,
        details: `Criada versão ${nextVerString} do termo (versão anterior ${original.version} arquivada imutavelmente).`,
        result: 'sucesso',
      });
      showToast(`Nova versão ${nextVerString} do termo criada! Histórico anterior preservado.`);
      return updatedTpl;
    },
    [consentTemplates, currentUser, addAuditLog, showToast]
  );

  const toggleConsentTemplateStatus = useCallback(
    (id: string) => {
      setConsentTemplates((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextStatus = t.status === 'ativo' ? 'inativo' : 'ativo';
            return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
          }
          return t;
        })
      );
    },
    []
  );

  // Patient Consent Documents (TCLE Assinados / Recusados)
  const addPatientConsent = useCallback(
    (docData: Omit<PatientConsentDocument, 'id' | 'documentCode' | 'createdAt' | 'immutableHash'>) => {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[-:T]/g, '').substring(0, 8);
      const randomSequence = String(Math.floor(Math.random() * 900000) + 100000);
      const documentCode = `TCLE-${dateStr}-${randomSequence}`;
      
      // Compute cryptographic-style tamper hash for auditability
      const hashContent = `${documentCode}|${docData.patientCpf}|${docData.templateId}|${docData.version}|${docData.signedAt || now.toISOString()}`;
      const fakeSha = Array.from(hashContent)
        .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
        .toString(16);
      const immutableHash = `sha256-${fakeSha.replace('-', '')}e8a49c71f92b4501d3`;

      const newDoc: PatientConsentDocument = {
        ...docData,
        id: 'tcle-doc-' + Date.now(),
        documentCode,
        createdAt: now.toISOString(),
        immutableHash,
      };

      setPatientConsents((prev) => [newDoc, ...prev]);

      addAuditLog({
        action: 'Assinatura de TCLE pelo Paciente',
        module: 'pep',
        recordAffected: documentCode,
        details: `Termo "${newDoc.templateName}" (v${newDoc.version}) assinado digitalmente pelo paciente ${newDoc.patientName} no tablet (${newDoc.deviceInfo || 'Tablet da Clínica'}).`,
        result: 'sucesso',
      });

      showToast(`Termo ${documentCode} assinado e anexado com sucesso ao prontuário!`, 'success');
      return newDoc;
    },
    [addAuditLog, showToast]
  );

  const refusePatientConsent = useCallback(
    (patientId: string, templateId: string, reason: string, procedureName?: string) => {
      const patient = patients.find((p) => p.id === patientId);
      const template = consentTemplates.find((t) => t.id === templateId);
      if (!patient || !template) throw new Error('Patient or Template not found');

      const now = new Date();
      const dateStr = now.toISOString().replace(/[-:T]/g, '').substring(0, 8);
      const randomSequence = String(Math.floor(Math.random() * 900000) + 100000);
      const documentCode = `TCLE-REC-${dateStr}-${randomSequence}`;

      const refusedDoc: PatientConsentDocument = {
        id: 'tcle-doc-' + Date.now(),
        documentCode,
        templateId: template.id,
        templateName: template.name,
        treatmentCategory: template.treatmentCategory,
        version: template.version,
        patientId: patient.id,
        patientName: patient.name,
        patientCpf: patient.cpf,
        patientBirthDate: patient.birthDate,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        professionalId: currentUser.id,
        professionalName: currentUser.name,
        professionalCouncil: currentUser.councilNumber || 'CRM/SP',
        professionalSpecialty: currentUser.specialty,
        procedureName: procedureName || template.treatmentCategory,
        fullText: template.fullText,
        checkedDeclarations: template.requiredDeclarations.map((d) => ({ text: d, checked: false })),
        patientSignatureDataUrl: '',
        signedAt: undefined,
        status: 'recusado',
        refusalReason: reason,
        refusedAt: now.toISOString(),
        initiatedByUserName: currentUser.name,
        finalizedByUserName: currentUser.name,
        createdAt: now.toISOString(),
        immutableHash: `sha256-refused-${Date.now().toString(16)}`,
      };

      setPatientConsents((prev) => [refusedDoc, ...prev]);

      addAuditLog({
        action: 'Recusa de Assinatura de Termo (TCLE)',
        module: 'pep',
        recordAffected: documentCode,
        details: `Paciente ${patient.name} recusou a assinatura do termo "${template.name}". Motivo: ${reason}`,
        result: 'aviso',
      });

      showToast(`Registro de não concordância/recusa do termo gravado no prontuário.`, 'info');
      return refusedDoc;
    },
    [patients, consentTemplates, currentUser, addAuditLog, showToast]
  );

  const checkProcedureConsentStatus = useCallback(
    (patientId: string, procedureOrCategory: string) => {
      // Find matching template
      const matchingTemplate = consentTemplates.find(
        (t) =>
          t.status === 'ativo' &&
          (t.treatmentCategory.toLowerCase() === procedureOrCategory.toLowerCase() ||
            procedureOrCategory.toLowerCase().includes(t.treatmentCategory.toLowerCase()) ||
            t.name.toLowerCase().includes(procedureOrCategory.toLowerCase()))
      );

      if (!matchingTemplate) {
        return { hasValidConsent: true };
      }

      // Check if patient has a signed consent
      const patientDocs = patientConsents.filter(
        (d) => d.patientId === patientId && d.templateId === matchingTemplate.id && d.status === 'assinado'
      );

      if (patientDocs.length === 0) {
        return {
          hasValidConsent: !matchingTemplate.mandatoryForProcedure,
          pendingConsentTemplate: matchingTemplate,
        };
      }

      const latestSigned = patientDocs[0];

      // Check recurrence rules
      if (matchingTemplate.recurrence === 'every_procedure') {
        // Must be signed today or within last 24h
        const signedDate = new Date(latestSigned.signedAt || latestSigned.createdAt);
        const diffHours = (Date.now() - signedDate.getTime()) / (1000 * 60 * 60);
        if (diffHours > 24) {
          return {
            hasValidConsent: false,
            pendingConsentTemplate: matchingTemplate,
            lastSignedConsent: latestSigned,
          };
        }
      } else if (matchingTemplate.recurrence === 'annual') {
        const signedDate = new Date(latestSigned.signedAt || latestSigned.createdAt);
        const diffDays = (Date.now() - signedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
          return {
            hasValidConsent: false,
            pendingConsentTemplate: matchingTemplate,
            lastSignedConsent: latestSigned,
          };
        }
      } else if (matchingTemplate.recurrence === 'version_change') {
        if (latestSigned.version !== matchingTemplate.version) {
          return {
            hasValidConsent: false,
            pendingConsentTemplate: matchingTemplate,
            lastSignedConsent: latestSigned,
          };
        }
      }

      return {
        hasValidConsent: true,
        pendingConsentTemplate: undefined,
        lastSignedConsent: latestSigned,
      };
    },
    [consentTemplates, patientConsents]
  );

  const openTabletConsentModal = useCallback(
    (data: {
      patient: Patient;
      templateId: string;
      consultationId?: string;
      appointmentId?: string;
      procedureName?: string;
      onComplete?: (doc: PatientConsentDocument) => void;
    }) => {
      const tpl = consentTemplates.find((t) => t.id === data.templateId);
      if (!tpl) {
        showToast('Modelo de termo não encontrado.', 'error');
        return;
      }
      setTabletModalState({
        isOpen: true,
        patient: data.patient,
        template: tpl,
        consultationId: data.consultationId,
        appointmentId: data.appointmentId,
        procedureName: data.procedureName,
        onComplete: data.onComplete,
      });
    },
    [consentTemplates, showToast]
  );

  const closeTabletConsentModal = useCallback(() => {
    setTabletModalState({
      isOpen: false,
      patient: null,
      template: null,
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        clinicConfig,
        updateClinicConfig,
        updateClinicBranding,
        resetClinicBranding,
        isAuthenticated,
        rememberMe,
        savedEmail,
        login,
        logout,
        currentUser,
        switchUser,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        professionals,
        addProfessional,
        updateProfessional,
        toggleProfessionalStatus,
        deleteProfessional,
        sendProfessionalInvite,
        sodPermissions,
        updateSodPermissions,
        hasPermission,
        checkSoDConflictWarning,

        // Procedures & Attendances Types CRUD
        procedureTypes,
        addProcedureType,
        updateProcedureType,
        deleteProcedureType,

        patients,
        addPatient,
        updatePatient,
        togglePatientStatus,
        deletePatient,
        getPatientById,

        appointments,
        addAppointment,
        updateAppointment,
        waitingQueue,
        addToWaitingQueue,
        updateQueueStatus,
        deleteQueueItem,
        callQueuePatient,

        consultations,
        activeConsultationDraft,
        saveConsultationDraft,
        clearConsultationDraft,
        finishConsultation,
        simultaneousEditUser,
        setSimultaneousEditUser,

        prescriptions,
        addPrescription,
        medicalDocuments,
        addMedicalDocument,
        examRequests,
        addExamRequest,
        updateExamStatus,
        attachments,
        addAttachment,

        triages,
        saveTriage,
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        medicationApplications,
        recordMedicationApplication,
        deleteMedicationApplication,
        inventoryMovements,
        recordInventoryMovement,

        intelligentProtocols,
        addIntelligentProtocol,
        updateIntelligentProtocol,
        duplicateIntelligentProtocol,
        deleteIntelligentProtocol,
        protocolAssignments,
        assignProtocolToPatient,
        updateProtocolAssignment,
        deleteProtocolAssignment,
        addProtocolEvolutionNote,
        treatmentPackages,
        addTreatmentPackage,
        updateTreatmentPackage,
        duplicateTreatmentPackage,
        deleteTreatmentPackage,
        packageAssignments,
        assignPackageToPatient,
        usePackageSession,

        budgets,
        addBudget,
        updateBudgetStatus,
        deleteBudget,
        financialTransactions,
        addFinancialTransaction,
        deleteFinancialTransaction,
        cashRegister,
        closeCashRegister,
        openCashRegister,

        // NFS-e
        nfseInvoices,
        issueNfse,
        cancelNfse,
        deleteNfseInvoice,
        getNfseByTransactionId,

        auditLogs,
        addAuditLog,
        notifications,
        markNotificationAsRead,

        // Consent Terms (TCLE)
        consentTemplates,
        addConsentTemplate,
        updateConsentTemplate,
        duplicateConsentTemplate,
        createNewTemplateVersion,
        toggleConsentTemplateStatus,
        patientConsents,
        addPatientConsent,
        refusePatientConsent,
        checkProcedureConsentStatus,
        tabletModalState,
        openTabletConsentModal,
        closeTabletConsentModal,

        activeView,
        setActiveView,
        selectedPatientForPEP,
        setSelectedPatientForPEP,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
