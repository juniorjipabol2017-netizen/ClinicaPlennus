export type Role = 'admin' | 'medico' | 'enfermagem' | 'recepcao' | 'financeiro' | 'nutricionista' | 'outros';

export type Sector = 
  | 'Diretoria'
  | 'Recepção'
  | 'Ambulatório'
  | 'Consultório'
  | 'Enfermagem'
  | 'Financeiro'
  | 'Nutrição'
  | 'Geral';

export type SystemModule = 
  | 'dashboard'
  | 'agenda'
  | 'fila'
  | 'pacientes'
  | 'triagem'
  | 'consultorio'
  | 'pep'
  | 'prescricoes'
  | 'exames'
  | 'aplicacoes'
  | 'estoque'
  | 'orcamentos'
  | 'pacotes'
  | 'financeiro'
  | 'relatorios'
  | 'usuarios'
  | 'profissionais'
  | 'protocolos'
  | 'tcle'
  | 'atendimentos'
  | 'auditoria'
  | 'configuracoes';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'print' | 'export';

export interface RolePermissions {
  [module: string]: {
    view: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    approve?: boolean;
    print?: boolean;
    export?: boolean;
  };
}

export interface Professional {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email: string;
  password?: string;
  council: 'CRM' | 'COREN' | 'CRN' | 'CRO' | 'CRF' | 'CREFITO' | 'OUTRO';
  registrationNumber: string;
  specialty: string;
  sector: Sector;
  status: 'ativo' | 'inativo';
  role?: Role;
  customPermissions?: RolePermissions;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  professionalId?: string;
  professionalName?: string;
  councilNumber?: string;
  specialty?: string;
  sector: Sector;
  status: 'ativo' | 'inativo' | 'bloqueado';
  phone?: string;
  lastLogin?: string;
  customPermissions?: RolePermissions;
  avatarUrl?: string;
}

export interface ProcedureTypeItem {
  id: string;
  name: string;
  category: 'Consulta' | 'Procedimento' | 'Injetável' | 'Estético' | 'Protocolo' | 'Exame' | 'Outros';
  estimatedDurationMinutes: number;
  defaultPrice?: number;
  description?: string;
  requiresConsent?: boolean;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  gender: 'Feminino' | 'Masculino' | 'Outro';
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType?: string;
  allergies: string[];
  chronicDiseases: string[];
  continuousMedications: string[];
  status: 'ativo' | 'inativo';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentType = 
  | 'Consulta Clínica'
  | 'Psiquiatria'
  | 'Dermatologia'
  | 'Endocrinologia'
  | 'Cardiologia'
  | 'Urologia'
  | 'Nutricionista'
  | 'Procedimento estético'
  | 'Protocolo de Emagrecimento'
  | 'Reposição Hormonal'
  | 'Demanda Espontânea'
  | 'Retorno';

export type AppointmentStatus = 
  | 'Agendado'
  | 'Confirmado'
  | 'Em Espera'
  | 'Em Atendimento'
  | 'Finalizado'
  | 'Cancelado'
  | 'Não Compareceu';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  isSpontaneousDemand?: boolean;
  createdAt: string;
}

export type QueueStatus = 
  | 'Aguardando'
  | 'Em triagem'
  | 'Aguardando médico'
  | 'Em atendimento'
  | 'Finalizado'
  | 'Cancelado';

export interface WaitingQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  professionalId: string;
  professionalName: string;
  appointmentType: AppointmentType;
  arrivalTime: string;
  status: QueueStatus;
  isSpontaneousDemand: boolean;
  priority: 'Normal' | 'Preferencial' | 'Urgência' | 'Emergência';
  triageId?: string;
  calledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
}

export interface VitalsData {
  bloodPressure: string; // e.g. 120/80
  heartRate: number; // bpm
  respRate: number; // rpm
  temperature: number; // °C
  oxygenSaturation: number; // %
  weight: number; // kg
  height: number; // cm
  imc?: number;
  bloodGlucose?: number; // mg/dL
  painScore?: number; // 0-10
}

export interface SoapRecord {
  // S - Subjetivo
  chiefComplaint: string;
  historyOfPresentIllness: string;
  symptoms: string;
  patientReport: string;

  // O - Objetivo
  vitals: VitalsData;
  physicalExam: string;
  otherObservations?: string;

  // A - Avaliação
  clinicalAssessment: string;
  hypotheses: string[];
  diagnoses: { code: string; description: string }[];

  // P - Plano
  conduct: string;
  prescriptionsText?: string;
  labRequestsText?: string;
  guidelines: string;
  referrals?: string;
  followUpDays?: number;
  therapeuticPlan?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  route: 'Oral' | 'Sublingual' | 'Intramuscular' | 'Subcutânea' | 'Intravenosa' | 'Tópica' | 'Inalatória';
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  consultationId?: string;
  items: PrescriptionItem[];
  generalObservations?: string;
  date: string;
  createdAt: string;
}

export type DocumentType = 
  | 'Atestado Médico'
  | 'Declaração de Comparecimento'
  | 'Declaração de Saúde'
  | 'Declaração de Acompanhante'
  | 'Encaminhamento'
  | 'Laudo Médico'
  | 'Relatório Clínico';

export interface MedicalDocument {
  id: string;
  type: DocumentType;
  patientId: string;
  patientName: string;
  patientCpf: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  date: string;
  title: string;
  content: string;
  daysOff?: number;
  cidCode?: string;
  cidDescription?: string;
  destination?: string;
  createdAt: string;
}

export interface ExamRequest {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  consultationId?: string;
  examsList: string[];
  clinicalIndication: string;
  status: 'solicitado' | 'realizado' | 'laudado';
  resultReport?: string;
  resultDate?: string;
  attachmentId?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  patientId: string;
  consultationId?: string;
  name: string;
  type: string;
  fileSizeFormatted: string;
  dataUrl: string;
  category: 'Exame Laboratorial' | 'Imagem/Laudo' | 'Documento' | 'Fotografia Clínica' | 'Outro';
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  appointmentId?: string;
  queueItemId?: string;
  date: string;
  startedAt: string;
  finishedAt?: string;
  status: 'em_andamento' | 'finalizada' | 'cancelada';
  soap: SoapRecord;
  prescriptionId?: string;
  documentIds?: string[];
  examIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationDraft {
  consultationId?: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  soap: SoapRecord;
  prescriptions: PrescriptionItem[];
  examsList: string[];
  lastSavedAt: string;
}

export interface NursingTriage {
  id: string;
  patientId: string;
  patientName: string;
  waitingQueueId: string;
  vitals: VitalsData;
  chiefComplaint: string;
  riskClassification: 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul';
  priorityDescription: 'Emergência' | 'Muito Urgente' | 'Urgente' | 'Pouco Urgente' | 'Não Urgente';
  observations: string;
  nurseId: string;
  nurseName: string;
  timestamp: string;
  forwardToProfessionalId: string;
}

export interface Medication {
  id: string;
  name: string;
  activeIngredient?: string; // Princípio Ativo
  presentation: string; // Apresentação (Ampola, Frasco, Comprimido, etc.)
  dosage?: string; // Dosagem (ex: 1.000 mcg, 500 mg, 10 mg/mL)
  unit: string; // Unidade de Medida (Ampola, Unidade, Frasco, mL, etc.)
  category: string; // Categoria (Medicamento, Vitamina, Hormônio, Injetável, Suplemento, Material assistencial, Outros)
  price: number; // Valor de Venda (R$)
  stockQuantity: number; // Quantidade em Estoque
  minStock: number;
  supplier?: string; // Fornecedor
  batchNumber?: string; // Lote
  expirationDate?: string; // Validade (YYYY-MM-DD)
  status: 'ativo' | 'inativo';
  isDeleted?: boolean; // Exclusão lógica para preservação de histórico
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationApplication {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  quantityUsed?: number; // Quantidade física utilizada para baixa
  route: 'Intramuscular' | 'Subcutânea' | 'Intravenosa' | 'Infiltração' | 'Oral';
  date: string;
  time: string;
  nurseId: string;
  nurseName: string;
  vitalSignsBefore?: { bp: string; hr: number };
  observations?: string;
  status: 'realizada' | 'agendada' | 'cancelada';
}

export interface InventoryMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type: 'entrada' | 'saida' | 'aplicacao' | 'ajuste' | 'estorno';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  responsibleName: string;
  userId?: string;
  patientId?: string;
  patientName?: string;
  date: string;
  time?: string;
  notes?: string;
}

export interface ProtocolStep {
  stepNumber: number;
  title: string;
  description: string;
  intervalDays: number;
  medications: string[];
  procedures: string[];
  examsRequired?: string[];
}

export interface IntelligentProtocol {
  id: string;
  name: string;
  category: 'Emagrecimento' | 'Reposição Hormonal' | 'Vitaminas e Imunidade' | 'Estética Avançada' | 'Longevidade' | 'Personalizado';
  description: string;
  objective: string;
  steps: ProtocolStep[];
  totalSessions: number;
  recommendedIntervalDays: number;
  suggestedPrice: number;
  guidelines: string;
  status: 'ativo' | 'inativo';
}

export interface ProtocolAssignment {
  id: string;
  protocolId: string;
  protocolName: string;
  patientId: string;
  patientName: string;
  startDate: string;
  currentStep: number;
  totalSteps: number;
  completedSessions: number;
  totalSessions: number;
  nextSessionDate: string;
  status: 'Planejado' | 'Em andamento' | 'Pausado' | 'Concluído' | 'Cancelado';
  prescribedBy: string;
  evolutionNotes: { date: string; note: string; author: string }[];
}

export interface PackageItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  proceduresIncluded: string[];
  items?: PackageItem[];
  totalSessions: number;
  individualTotal?: number;
  discount?: number;
  price: number;
  validityDays: number;
  notes?: string;
  status: 'ativo' | 'inativo';
  createdAt?: string;
}

export interface PackageAssignment {
  id: string;
  packageId: string;
  packageName: string;
  patientId: string;
  patientName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  purchaseDate: string;
  status: 'Ativo' | 'Concluído' | 'Expirado' | 'Cancelado';
  usageHistory: { date: string; professionalName: string; note: string }[];
}

export interface BudgetItem {
  id: string;
  type: 'Procedimento' | 'Consulta' | 'Protocolo' | 'Pacote' | 'Medicação';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientPhone: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  finalValue: number;
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto' | 'Parcelado';
  installments?: number;
  status: 'Rascunho' | 'Enviado' | 'Aguardando aprovação' | 'Aprovado' | 'Recusado' | 'Expirado';
  createdAt: string;
  validUntil: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  time: string;
  type: 'entrada' | 'saida';
  category: 
    | 'Consulta Médica'
    | 'Procedimento Clínico'
    | 'Protocolo de Tratamento'
    | 'Pacote de Sessões'
    | 'Aplicação de Medicação'
    | 'Compra de Medicamentos/Insumos'
    | 'Aluguel'
    | 'Energia/Água/Internet'
    | 'Salários/Honorários'
    | 'Equipamentos e Manutenção'
    | 'Impostos/Taxas'
    | 'Outros';
  description: string;
  value: number;
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto' | 'Transferência';
  responsibleUserId: string;
  responsibleName: string;
  patientId?: string;
  patientName?: string;
  observation?: string;
}

export interface CashRegister {
  id: string;
  date: string;
  status: 'aberto' | 'fechado';
  openingBalance: number;
  currentBalance: number;
  totalInflows: number;
  totalOutflows: number;
  openedAt: string;
  openedBy: string;
  closedAt?: string;
  closedBy?: string;
  closingNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  module: SystemModule | string;
  recordAffected?: string;
  details: string;
  ipAddress: string;
  result: 'sucesso' | 'bloqueado' | 'aviso';
}

export interface ClinicBrandingConfig {
  primaryColor: string; // Cor principal (e.g. '#0f172a')
  secondaryColor: string; // Cor secundária (e.g. '#C9A227' ou '#ca8a04')
  textColor: string; // Cor do texto (e.g. '#1e293b' ou '#334155')
  accentColor: string; // Cor de destaque / ênfase (e.g. '#C9A227' ou '#0284c7')
  fontFamily: string; // 'Arial' | 'Helvetica' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat' | 'Poppins' | 'Georgia' | 'Times New Roman'
  clinicNameSize: 'sm' | 'md' | 'lg' | 'xl';
  clinicNameWeight: 'normal' | 'bold';
  clinicNameColor?: string;
  infoSize: 'xs' | 'sm' | 'md';
  infoWeight?: 'normal' | 'bold';
  infoColor?: string;
  addressSize?: 'xs' | 'sm' | 'md';
  addressColor?: string;
  contactSize?: 'xs' | 'sm' | 'md';
  contactColor?: string;
  presetName?: string;
  showBorderDivider?: boolean;
}

export interface ClinicIdentityConfig {
  clinicName: string;
  tagline: string;
  instagram: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cnpj: string;
  municipalRegistration?: string;
  cnae?: string;
  technicalDirector: string;
  technicalDirectorCrm: string;
  logoUrl?: string;
  footerMessage?: string;
  branding?: ClinicBrandingConfig;
}

export interface NfseInvoice {
  id: string;
  number: string; // e.g. "2026/000412"
  rpsNumber: string; // e.g. "RPS-892"
  rpsSeries: string; // e.g. "1"
  status: 'autorizada' | 'cancelada' | 'processando';
  issueDate: string; // "2026-08-27"
  issueTime: string; // "14:35:10"
  verificationCode: string; // "A7F9-82BC-4D1E"
  accessKey: string;
  protocolNumber: string;
  transactionId?: string;
  budgetId?: string;

  // Prestador de Serviços
  providerName: string;
  providerCnpj: string;
  providerMunicipalRegistration: string;
  providerAddress: string;
  providerPhone: string;
  providerEmail: string;

  // Tomador de Serviços (Paciente)
  patientId?: string;
  takerName: string;
  takerCpfCnpj: string;
  takerEmail: string;
  takerPhone: string;
  takerAddress: string;

  // Serviços e Tributos
  serviceDescription: string;
  cnaeCode: string;
  municipalServiceCode: string;
  itemServiceCode?: string;
  itemDescription?: string;

  // Valores (R$)
  serviceValue: number;
  deductions: number;
  unconditionalDiscount: number;
  calculationBase: number;
  issRate: number; // e.g. 2.0 (%)
  issValue: number;
  issRetained: boolean;
  pisRate?: number;
  pisValue?: number;
  cofinsRate?: number;
  cofinsValue?: number;
  inssValue?: number;
  irrfRate?: number;
  irrfValue?: number;
  csllRate?: number;
  csllValue?: number;
  totalTaxes: number;
  netValue: number;

  observations?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  issuedByUserName: string;
  pdfPrintedAt?: string;
}

export type ConsentTreatmentCategory = 
  | 'Aplicação de medicação'
  | 'Tratamento de emagrecimento'
  | 'Reposição hormonal'
  | 'Procedimentos estéticos'
  | 'Aplicações intramusculares'
  | 'Procedimentos médicos'
  | 'Exames/procedimentos'
  | 'Outros tratamentos';

export type ConsentStatus = 'assinado' | 'pendente' | 'cancelado' | 'expirado' | 'recusado';

export interface ConsentFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'select' | 'number';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface ConsentTermTemplate {
  id: string;
  name: string;
  treatmentCategory: ConsentTreatmentCategory | string;
  fullText: string;
  requiredDeclarations: string[];
  customFields?: ConsentFieldConfig[];
  requiresDoctorSignature: boolean;
  mandatoryForProcedure: boolean;
  recurrence: 'once' | 'every_procedure' | 'annual' | 'version_change';
  version: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt: string;
  previousVersions?: {
    version: string;
    fullText: string;
    updatedAt: string;
    updatedBy: string;
  }[];
}

export interface PatientConsentDocument {
  id: string;
  documentCode: string; // e.g. "TCLE-20260827-000001"
  templateId: string;
  templateName: string;
  treatmentCategory: string;
  version: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientBirthDate?: string;
  patientPhone?: string;
  patientEmail?: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  professionalSpecialty?: string;
  consultationId?: string;
  appointmentId?: string;
  procedureName?: string;
  fullText: string;
  checkedDeclarations: { text: string; checked: boolean; checkedAt?: string }[];
  additionalFieldValues?: Record<string, any>;
  patientSignatureDataUrl: string;
  professionalSignatureDataUrl?: string;
  signedAt?: string;
  deviceInfo?: string;
  status: ConsentStatus;
  refusalReason?: string;
  refusedAt?: string;
  initiatedByUserName: string;
  finalizedByUserName?: string;
  createdAt: string;
  immutableHash: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  module: SystemModule;
  targetRole?: Role;
  timestamp: string;
  read: boolean;
}
