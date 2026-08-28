import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Patient,
  SoapRecord,
  PrescriptionItem,
  VitalsData,
  ConsultationDraft,
} from '../../types';
import {
  Stethoscope,
  Save,
  CheckCircle,
  AlertTriangle,
  FileText,
  Pill,
  FlaskConical,
  Plus,
  Trash2,
  Clock,
  Printer,
  X,
  History,
  Sparkles,
  ShieldAlert,
  Shield,
  Tablet,
} from 'lucide-react';
import { PrintableDocument } from '../common/PrintableDocument';
import { PatientConsentHistoryTab } from '../pep/PatientConsentHistoryTab';

interface MedicalConsultationModalProps {
  patient: Patient;
  appointmentId?: string;
  queueItemId?: string;
  onClose: () => void;
  onFinished: () => void;
}

export const MedicalConsultationModal: React.FC<MedicalConsultationModalProps> = ({
  patient,
  appointmentId,
  queueItemId,
  onClose,
  onFinished,
}) => {
  const {
    currentUser,
    finishConsultation,
    saveConsultationDraft,
    activeConsultationDraft,
    clearConsultationDraft,
    addPrescription,
    addMedicalDocument,
    addExamRequest,
    simultaneousEditUser,
    setSimultaneousEditUser,
    showToast,
    consultations,
    patientConsents,
    consentTemplates,
    openTabletConsentModal,
  } = useApp();

  // Consultation SOAP state
  const [activeTab, setActiveTab] = useState<'soap' | 'prescricao' | 'exames' | 'documentos' | 'termos' | 'historico'>('soap');
  const [autoSavedTime, setAutoSavedTime] = useState<string>('');
  const [hasDraftNotice, setHasDraftNotice] = useState<boolean>(false);

  // SOAP Fields
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [patientReport, setPatientReport] = useState('');

  // Vitals & IMC
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState<number>(72);
  const [respRate, setRespRate] = useState<number>(16);
  const [temperature, setTemperature] = useState<number>(36.5);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(99);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [bloodGlucose, setBloodGlucose] = useState<number>(90);
  const [physicalExam, setPhysicalExam] = useState('BEG, corado(a), hidratado(a), eupneico(a). RCR 2T BNF sem sopros. MVF sem ruídos adventícios.');
  const [otherObservations, setOtherObservations] = useState('');

  // Calculated IMC
  const calculatedImc = useMemo(() => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return 0;
  }, [weight, height]);

  // Assessment & Diagnoses
  const [clinicalAssessment, setClinicalAssessment] = useState('');
  const [hypotheses, setHypotheses] = useState<string>('');
  const [cidCode, setCidCode] = useState('Z00.0');
  const [cidDescription, setCidDescription] = useState('Exame médico geral');

  // Plan
  const [conduct, setConduct] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number>(30);
  const [therapeuticPlan, setTherapeuticPlan] = useState('');

  // Prescriptions List
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicationName: 'Complexo B + Coenzima Q10',
      dosage: '1 ampola IM',
      route: 'Intramuscular',
      frequency: 'Semanalmente',
      duration: '4 semanas',
      instructions: 'Aplicação na clínica pela equipe de enfermagem.',
    },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedRoute, setNewMedRoute] = useState<PrescriptionItem['route']>('Oral');
  const [newMedFreq, setNewMedFreq] = useState('1x ao dia');
  const [newMedDur, setNewMedDur] = useState('30 dias');
  const [newMedInst, setNewMedInst] = useState('Tomar pela manhã com água.');

  // Exam requests
  const [examsList, setExamsList] = useState<string[]>([
    'Hemograma completo',
    'Glicemia de jejum e Insulina basal',
    'Perfil Lipídico Completo',
    'TSH e T4 Livre',
  ]);
  const [newExamInput, setNewExamInput] = useState('');
  const [examIndication, setExamIndication] = useState('Avaliação metabólica e cardiovascular de rotina.');

  // Document creation state
  const [docType, setDocType] = useState<'Atestado Médico' | 'Declaração de Comparecimento' | 'Declaração de Saúde' | 'Encaminhamento'>('Atestado Médico');
  const [docDaysOff, setDocDaysOff] = useState<number>(1);
  const [docContent, setDocContent] = useState(`Atesto para os devidos fins que o(a) paciente ${patient.name}, portador(a) do CPF ${patient.cpf}, foi atendido(a) nesta data sob meus cuidados profissionais.`);
  const [docDestination, setDocDestination] = useState('');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printedDocData, setPrintedDocData] = useState<any>(null);

  // Check for saved draft on mount
  useEffect(() => {
    if (activeConsultationDraft && activeConsultationDraft.patientId === patient.id) {
      setHasDraftNotice(true);
    }
  }, [activeConsultationDraft, patient.id]);

  const loadDraft = () => {
    if (activeConsultationDraft) {
      const d = activeConsultationDraft.soap;
      setChiefComplaint(d.chiefComplaint || '');
      setHistoryOfPresentIllness(d.historyOfPresentIllness || '');
      setSymptoms(d.symptoms || '');
      setPatientReport(d.patientReport || '');
      if (d.vitals) {
        setBloodPressure(d.vitals.bloodPressure || '120/80');
        setHeartRate(d.vitals.heartRate || 72);
        setRespRate(d.vitals.respRate || 16);
        setTemperature(d.vitals.temperature || 36.5);
        setOxygenSaturation(d.vitals.oxygenSaturation || 99);
        setWeight(d.vitals.weight || 70);
        setHeight(d.vitals.height || 170);
        setBloodGlucose(d.vitals.bloodGlucose || 90);
      }
      setPhysicalExam(d.physicalExam || '');
      setClinicalAssessment(d.clinicalAssessment || '');
      setConduct(d.conduct || '');
      setGuidelines(d.guidelines || '');
      setTherapeuticPlan(d.therapeuticPlan || '');
      if (activeConsultationDraft.prescriptions?.length) {
        setPrescriptionItems(activeConsultationDraft.prescriptions);
      }
      if (activeConsultationDraft.examsList?.length) {
        setExamsList(activeConsultationDraft.examsList);
      }
      setHasDraftNotice(false);
      showToast('Rascunho recuperado com sucesso!', 'info');
    }
  };

  const discardDraft = () => {
    clearConsultationDraft();
    setHasDraftNotice(false);
    showToast('Rascunho descartado.', 'info');
  };

  // Periodic AutoSave (Every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const draftData: ConsultationDraft = {
        patientId: patient.id,
        patientName: patient.name,
        professionalId: currentUser.id,
        lastSavedAt: new Date().toLocaleTimeString(),
        soap: {
          chiefComplaint,
          historyOfPresentIllness,
          symptoms,
          patientReport,
          vitals: {
            bloodPressure,
            heartRate,
            respRate,
            temperature,
            oxygenSaturation,
            weight,
            height,
            imc: calculatedImc,
            bloodGlucose,
          },
          physicalExam,
          otherObservations,
          clinicalAssessment,
          hypotheses: hypotheses ? hypotheses.split('\n') : [],
          diagnoses: [{ code: cidCode, description: cidDescription }],
          conduct,
          guidelines,
          followUpDays,
          therapeuticPlan,
        },
        prescriptions: prescriptionItems,
        examsList,
      };

      saveConsultationDraft(draftData);
      setAutoSavedTime(new Date().toLocaleTimeString());
    }, 10000);

    return () => clearInterval(timer);
  }, [
    patient,
    currentUser,
    chiefComplaint,
    historyOfPresentIllness,
    symptoms,
    patientReport,
    bloodPressure,
    heartRate,
    respRate,
    temperature,
    oxygenSaturation,
    weight,
    height,
    calculatedImc,
    bloodGlucose,
    physicalExam,
    otherObservations,
    clinicalAssessment,
    hypotheses,
    cidCode,
    cidDescription,
    conduct,
    guidelines,
    followUpDays,
    therapeuticPlan,
    prescriptionItems,
    examsList,
    saveConsultationDraft,
  ]);

  // Add prescription item
  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      showToast('Informe o nome do medicamento.', 'error');
      return;
    }
    const newItem: PrescriptionItem = {
      id: 'med-' + Date.now(),
      medicationName: newMedName,
      dosage: newMedDosage || 'Conforme prescrição',
      route: newMedRoute,
      frequency: newMedFreq,
      duration: newMedDur,
      instructions: newMedInst,
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInst('');
    showToast('Medicamento adicionado à prescrição!');
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionItems(prescriptionItems.filter((m) => m.id !== id));
  };

  // Add exam
  const handleAddExam = () => {
    if (!newExamInput.trim()) return;
    setExamsList([...examsList, newExamInput.trim()]);
    setNewExamInput('');
  };

  const handleRemoveExam = (index: number) => {
    setExamsList(examsList.filter((_, i) => i !== index));
  };

  // Save Document and open print
  const handleGenerateDocument = () => {
    const docData = {
      type: docType,
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      professionalId: currentUser.id,
      professionalName: currentUser.name,
      professionalCouncil: currentUser.professionalName ? 'CRM/SP 142.890' : 'CRM/SP',
      date: new Date().toLocaleDateString('pt-BR'),
      title: docType,
      content: docContent,
      daysOff: docType === 'Atestado Médico' ? docDaysOff : undefined,
      cidCode: docType === 'Atestado Médico' ? cidCode : undefined,
      cidDescription: docType === 'Atestado Médico' ? cidDescription : undefined,
      destination: docDestination,
    };

    addMedicalDocument(docData);
    setPrintedDocData(docData);
    setShowPrintModal(true);
  };

  // Finalize consultation
  const handleFinalize = () => {
    if (!chiefComplaint.trim()) {
      showToast('Por favor, preencha a Queixa Principal no Subjetivo.', 'error');
      setActiveTab('soap');
      return;
    }
    if (!clinicalAssessment.trim()) {
      showToast('Por favor, preencha a Avaliação Clínica do paciente.', 'error');
      setActiveTab('soap');
      return;
    }
    if (!conduct.trim()) {
      showToast('Por favor, defina a Conduta / Plano terapêutico.', 'error');
      setActiveTab('soap');
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().substring(0, 5);

    // Save prescription if items exist
    let prescId: string | undefined = undefined;
    if (prescriptionItems.length > 0) {
      const presc = addPrescription({
        patientId: patient.id,
        patientName: patient.name,
        professionalId: currentUser.id,
        professionalName: currentUser.name,
        professionalCouncil: 'CRM/SP 142.890',
        items: prescriptionItems,
        generalObservations: guidelines,
        date: todayStr,
      });
      prescId = presc.id;
    }

    // Save exams request if exams exist
    let examId: string | undefined = undefined;
    if (examsList.length > 0) {
      const req = addExamRequest({
        patientId: patient.id,
        patientName: patient.name,
        professionalId: currentUser.id,
        professionalName: currentUser.name,
        examsList,
        clinicalIndication: examIndication,
        status: 'solicitado',
      });
      examId = req.id;
    }

    const soapData: SoapRecord = {
      chiefComplaint,
      historyOfPresentIllness,
      symptoms,
      patientReport,
      vitals: {
        bloodPressure,
        heartRate,
        respRate,
        temperature,
        oxygenSaturation,
        weight,
        height,
        imc: calculatedImc,
        bloodGlucose,
      },
      physicalExam,
      otherObservations,
      clinicalAssessment,
      hypotheses: hypotheses ? hypotheses.split('\n') : [],
      diagnoses: [{ code: cidCode, description: cidDescription }],
      conduct,
      prescriptionsText: prescriptionItems.map((p) => `${p.medicationName} (${p.dosage}) - ${p.frequency}`).join('\n'),
      labRequestsText: examsList.join(', '),
      guidelines,
      followUpDays,
      therapeuticPlan,
    };

    finishConsultation({
      patientId: patient.id,
      patientName: patient.name,
      professionalId: currentUser.id,
      professionalName: currentUser.name,
      specialty: 'Medicina Integrativa e Longevidade',
      appointmentId,
      queueItemId,
      date: todayStr,
      startedAt: nowTime,
      status: 'finalizada',
      soap: soapData,
      prescriptionId: prescId,
      examIds: examId ? [examId] : [],
    });

    onFinished();
  };

  // Patient previous consultations
  const patientPreviousConsultations = consultations.filter((c) => c.patientId === patient.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-4 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif-luxury text-white">
                  Atendimento Clínico & Prontuário (SOAP)
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  Plennus Care
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Paciente: <strong className="text-white">{patient.name}</strong> • CPF: {patient.cpf} • Idade: {new Date().getFullYear() - parseInt(patient.birthDate.substring(0, 4))} anos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AutoSave Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{autoSavedTime ? `Salvo às ${autoSavedTime}` : 'Salvando rascunho...'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Fechar (Rascunho mantido)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simultaneous Editing Alert (Section 22) */}
        {simultaneousEditUser && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 flex items-center gap-2 text-rose-800 text-xs font-semibold shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
            <span>Atenção: Este prontuário está sendo visualizado ou editado simultaneamente por {simultaneousEditUser}.</span>
          </div>
        )}

        {/* Draft Recovery Alert (Section 20) */}
        {hasDraftNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Encontramos um atendimento não finalizado para este paciente salvo às {activeConsultationDraft?.lastSavedAt}. Deseja continuar de onde parou?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadDraft}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition"
              >
                Continuar
              </button>
              <button
                onClick={discardDraft}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs font-medium"
              >
                Descartar rascunho
              </button>
            </div>
          </div>
        )}

        {/* Patient Top Health Banner (Allergies & Chronic Alert) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-500">Alergias: </span>
              {patient.allergies.length > 0 ? (
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {patient.allergies.join(', ')}
                </span>
              ) : (
                <span className="text-slate-700 font-medium">Nenhuma relatada</span>
              )}
            </div>

            <div>
              <span className="text-slate-500">Condições Crônicas: </span>
              <span className="text-slate-800 font-semibold">
                {patient.chronicDiseases.length > 0 ? patient.chronicDiseases.join(', ') : 'Nenhuma'}
              </span>
            </div>

            <div>
              <span className="text-slate-500">Medicações em uso: </span>
              <span className="text-slate-800">
                {patient.continuousMedications.length > 0 ? patient.continuousMedications.join(', ') : 'Nenhuma'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Médico Resp: </span>
            <strong className="text-slate-800">{currentUser.name}</strong>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('soap')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'soap'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Atendimento SOAP
          </button>

          <button
            onClick={() => setActiveTab('prescricao')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'prescricao'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Prescrição Médica ({prescriptionItems.length})
          </button>

          <button
            onClick={() => setActiveTab('exames')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'exames'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Solicitar Exames ({examsList.length})
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documentos'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documentos & Atestados
          </button>

          <button
            onClick={() => setActiveTab('termos')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'termos'
                ? 'border-indigo-600 text-indigo-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5 text-indigo-600" />
            Termos TCLE ({patientConsents.filter((c) => c.patientId === patient.id).length})
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'historico'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico Anterior ({patientPreviousConsultations.length})
          </button>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* TAB 1: SOAP Form */}
          {activeTab === 'soap' && (
            <div className="space-y-6">
              {/* S - SUBJETIVO */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                    S
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Subjetivo (Relato do Paciente & Sintomas)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Queixa Principal (QP) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cansaço excessivo, ganho de peso, palpitações..."
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      História da Doença Atual (HDA)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Início dos sintomas, evolução, fatores de melhora/piora..."
                      value={historyOfPresentIllness}
                      onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relato do Paciente / Sintomas Associados
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Fadiga, qualidade do sono, disposição, hábitos..."
                      value={patientReport}
                      onChange={(e) => setPatientReport(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* O - OBJETIVO */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                    O
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Objetivo (Sinais Vitais, Exame Físico & IMC)</h3>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">PA (mmHg)</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">FC (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">SpO2 (%)</label>
                    <input
                      type="number"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Altura (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">IMC (Calc)</label>
                    <div className="w-full px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-bold text-amber-900 text-center">
                      {calculatedImc || '--'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Glicemia</label>
                    <input
                      type="number"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exame Físico / Segmentar
                  </label>
                  <textarea
                    rows={2}
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* A - AVALIAÇÃO */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                    A
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Avaliação Clínica & Diagnóstico (CID-10)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Avaliação Clínica e Raciocínio Diagnóstico *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Impressão diagnóstica, hipóteses clínicas..."
                      value={clinicalAssessment}
                      onChange={(e) => setClinicalAssessment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CID-10 Principal
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cidCode}
                          onChange={(e) => setCidCode(e.target.value)}
                          className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold uppercase"
                        />
                        <input
                          type="text"
                          value={cidDescription}
                          onChange={(e) => setCidDescription(e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* P - PLANO */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                    P
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Plano Terapêutico & Conduta</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Conduta Médica *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Medicação instituída, início de protocolo, solicitações..."
                      value={conduct}
                      onChange={(e) => setConduct(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Orientações Gerais ao Paciente & Dieta
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ingestão de água, repouso, cuidados com horários..."
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Retorno Agendado (em dias)
                    </label>
                    <input
                      type="number"
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(Number(e.target.value))}
                      className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Prescriptions */}
          {activeTab === 'prescricao' && (
            <div className="space-y-6">
              {/* Add Item Form */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-600" /> Adicionar Medicamento à Receita
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Medicamento / Substância *</label>
                    <input
                      type="text"
                      placeholder="Ex: Tirzepatida, CoQ10, Levotiroxina..."
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Dosagem</label>
                    <input
                      type="text"
                      placeholder="Ex: 5mg / 1 ampola / 500mg"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Via de Administração</label>
                    <select
                      value={newMedRoute}
                      onChange={(e) => setNewMedRoute(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Subcutânea">Subcutânea</option>
                      <option value="Intravenosa">Intravenosa</option>
                      <option value="Tópica">Tópica</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Frequência</label>
                    <input
                      type="text"
                      placeholder="Ex: 1x ao dia / a cada 8h"
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Duração</label>
                    <input
                      type="text"
                      placeholder="Ex: 30 dias / Uso contínuo"
                      value={newMedDur}
                      onChange={(e) => setNewMedDur(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Instruções adicionais</label>
                    <input
                      type="text"
                      placeholder="Ex: Tomar após o café da manhã"
                      value={newMedInst}
                      onChange={(e) => setNewMedInst(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddMedication}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar à Prescrição
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itens Prescritos para esta Consulta ({prescriptionItems.length})
                </h4>

                {prescriptionItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum medicamento adicionado ainda.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {prescriptionItems.map((item, idx) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {item.medicationName} — <span className="text-amber-800">{item.dosage}</span> ({item.route})
                            </p>
                            <p className="text-[11px] text-slate-600">
                              Posologia: {item.frequency} por {item.duration}.
                            </p>
                            {item.instructions && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">Obs: {item.instructions}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMedication(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Exams */}
          {activeTab === 'exames' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> Solicitação de Exames Complementares
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Indicação Clínica</label>
                  <input
                    type="text"
                    value={examIndication}
                    onChange={(e) => setExamIndication(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar exame (ex: Eletrocardiograma, Cortisol salivar, Ecocardiograma...)"
                    value={newExamInput}
                    onChange={(e) => setNewExamInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExam()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    onClick={handleAddExam}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Exames Solicitados ({examsList.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {examsList.map((exam, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
                      >
                        <span>• {exam}</span>
                        <button
                          onClick={() => handleRemoveExam(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Documents (Atestados / Comparecimento) */}
          {activeTab === 'documentos' && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" /> Emissão de Documentos Clínicos Oficiais
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                  >
                    <option value="Atestado Médico">Atestado Médico (com afastamento)</option>
                    <option value="Declaração de Comparecimento">Declaração de Comparecimento</option>
                    <option value="Declaração de Saúde">Declaração de Aptidão / Saúde</option>
                    <option value="Encaminhamento">Encaminhamento Especializado</option>
                  </select>
                </div>

                {docType === 'Atestado Médico' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Dias de Afastamento</label>
                    <input
                      type="number"
                      value={docDaysOff}
                      onChange={(e) => setDocDaysOff(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Destinatário / Empresa (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Empresa contratante, Escola..."
                    value={docDestination}
                    onChange={(e) => setDocDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Texto do Documento</label>
                <textarea
                  rows={4}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateDocument}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Gerar & Imprimir Documento Oficial
                </button>
              </div>
            </div>
          )}

          {/* TAB: TERMOS TCLE */}
          {activeTab === 'termos' && (
            <PatientConsentHistoryTab patient={patient} />
          )}

          {/* TAB 5: History */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Consultas Anteriores no PEP ({patientPreviousConsultations.length})
              </h4>
              {patientPreviousConsultations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Primeiro atendimento deste paciente na clínica.</p>
              ) : (
                patientPreviousConsultations.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">{c.date} às {c.startedAt}</span>
                      <span className="text-[10px] text-amber-700 font-semibold">{c.professionalName} ({c.specialty})</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">QP: {c.soap?.chiefComplaint}</p>
                    <p className="text-[11px] text-slate-500">Avaliação: {c.soap?.clinicalAssessment}</p>
                    <p className="text-[11px] text-slate-500">Conduta: {c.soap?.conduct}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Todos os campos serão auditados e persistidos no prontuário definitivo.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Manter em Rascunho
            </button>
            <button
              onClick={handleFinalize}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Finalizar Consulta Médica
            </button>
          </div>
        </div>
      </div>

      {/* Print Document Modal */}
      {showPrintModal && printedDocData && (
        <PrintableDocument
          title={printedDocData.title}
          patientName={printedDocData.patientName}
          patientCpf={printedDocData.patientCpf}
          content={printedDocData.content}
          date={printedDocData.date}
          professionalName={printedDocData.professionalName}
          professionalCouncil={printedDocData.professionalCouncil}
          daysOff={printedDocData.daysOff}
          cidCode={printedDocData.cidCode}
          cidDescription={printedDocData.cidDescription}
          destination={printedDocData.destination}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
