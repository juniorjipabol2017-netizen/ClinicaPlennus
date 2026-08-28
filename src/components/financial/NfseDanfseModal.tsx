import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NfseInvoice } from '../../types';
import {
  Printer,
  Download,
  Share2,
  Mail,
  MessageCircle,
  X,
  Building2,
  QrCode,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
} from 'lucide-react';
import { ClinicLogo } from '../common/PlennusLogo';

interface NfseDanfseModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: NfseInvoice | null;
}

export const NfseDanfseModal: React.FC<NfseDanfseModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { clinicConfig, cancelNfse, showToast } = useApp();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  if (!isOpen || !invoice) return null;

  const isAuthorized = invoice.status === 'autorizada';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAccessKey = () => {
    navigator.clipboard.writeText(invoice.accessKey);
    showToast('Chave de Acesso copiada para a área de transferência!');
  };

  const handleDownloadXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse>
    <InfNfse Id="NFSE${invoice.number.replace('/', '')}">
      <Numero>${invoice.number}</Numero>
      <CodigoVerificacao>${invoice.verificationCode}</CodigoVerificacao>
      <DataEmissao>${invoice.issueDate}T${invoice.issueTime}</DataEmissao>
      <IdentificacaoRps>
        <Numero>${invoice.rpsNumber}</Numero>
        <Serie>${invoice.rpsSeries}</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj><Cnpj>${clinicConfig.cnpj.replace(/\D/g, '')}</Cnpj></CpfCnpj>
          <InscricaoMunicipal>${(clinicConfig.municipalRegistration || '84521903').replace(/\D/g, '')}</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>${clinicConfig.clinicName}</RazaoSocial>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj><Cpf>${invoice.takerCpfCnpj.replace(/\D/g, '')}</Cpf></CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${invoice.takerName}</RazaoSocial>
        <Contato>
          <Telefone>${invoice.takerPhone || ''}</Telefone>
          <Email>${invoice.takerEmail || ''}</Email>
        </Contato>
      </TomadorServico>
      <Servico>
        <Valores>
          <ValorServicos>${invoice.serviceValue.toFixed(2)}</ValorServicos>
          <ValorDeducoes>${invoice.deductionsValue.toFixed(2)}</ValorDeducoes>
          <ValorPis>${invoice.pisValue.toFixed(2)}</ValorPis>
          <ValorCofins>${invoice.cofinsValue.toFixed(2)}</ValorCofins>
          <ValorInss>0.00</ValorInss>
          <ValorIr>${invoice.irrfValue.toFixed(2)}</ValorIr>
          <ValorCsll>${invoice.csllValue.toFixed(2)}</ValorCsll>
          <IssRetido>${invoice.issRetained ? 1 : 2}</IssRetido>
          <ValorIss>${invoice.issValue.toFixed(2)}</ValorIss>
          <Aliquota>${(invoice.issRate / 100).toFixed(4)}</Aliquota>
          <DescontoIncondicionado>${invoice.discountValue.toFixed(2)}</DescontoIncondicionado>
          <ValorLiquidoNfse>${invoice.netValue.toFixed(2)}</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>${invoice.itemServiceCode}</ItemListaServico>
        <CodigoCnae>${invoice.cnaeCode}</CodigoCnae>
        <Discriminacao>${invoice.serviceDescription}</Discriminacao>
        <CodigoMunicipio>3550308</CodigoMunicipio>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFSe_${invoice.number.replace('/', '_')}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('XML da NFS-e baixado com sucesso!');
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = (invoice.takerPhone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá, ${invoice.takerName}! Segue sua Nota Fiscal de Serviços Eletrônica (NFS-e Nº ${invoice.number}) emitida por ${clinicConfig.clinicName}. Código de Verificação: ${invoice.verificationCode}. Valor: R$ ${invoice.serviceValue.toFixed(2)}.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`NFS-e Nº ${invoice.number} - ${clinicConfig.clinicName}`);
    const body = encodeURIComponent(
      `Prezado(a) ${invoice.takerName},\n\nSegue anexa a sua Nota Fiscal de Serviços Eletrônica emitida em ${invoice.issueDate}.\n\nNúmero da Nota: ${invoice.number}\nCódigo de Verificação: ${invoice.verificationCode}\nValor Total: R$ ${invoice.serviceValue.toFixed(2)}\n\nAtenciosamente,\n${clinicConfig.clinicName}`
    );
    window.open(`mailto:${invoice.takerEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleConfirmCancel = () => {
    if (!cancellationReason.trim()) {
      showToast('Por favor, descreva a justificativa do cancelamento.', 'error');
      return;
    }
    cancelNfse(invoice.id, cancellationReason);
    setIsCancelModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-4 overflow-hidden print:border-none print:shadow-none">
        {/* Action Header - Hidden on Print */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-bold rounded-lg font-mono">
              NFS-e Nº {invoice.number}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isAuthorized
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}
            >
              {isAuthorized ? '✓ AUTORIZADA' : '✕ CANCELADA'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
            </button>

            <button
              onClick={handleDownloadXml}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> XML
            </button>

            {invoice.takerPhone && (
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            )}

            {invoice.takerEmail && (
              <button
                onClick={handleSendEmail}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" /> E-mail
              </button>
            )}

            {isAuthorized && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-rose-500/30"
              >
                <Ban className="w-3.5 h-3.5" /> Cancelar
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cancellation Notice Banner (if cancelled) */}
        {!isAuthorized && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-xs text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">ESTA NOTA FISCAL FOI CANCELADA</p>
              <p className="mt-0.5">
                Cancelada em: <strong>{invoice.cancelledAt}</strong> por <strong>{invoice.cancelledBy}</strong>.
              </p>
              <p className="italic text-rose-700 mt-1">
                Motivo: "{invoice.cancellationReason}"
              </p>
            </div>
          </div>
        )}

        {/* DANFSe DOCUMENT CANVAS (Official Brazilian Municipal Layout) */}
        <div className="p-6 sm:p-8 space-y-4 text-slate-900 font-sans text-xs bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header 1: PREFEITURA & DANFSE BADGE */}
          <div className="border border-slate-300 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-3 flex items-center justify-center sm:justify-start">
              <ClinicLogo size="md" textColor="dark" customLogoUrl={clinicConfig.logoUrl} />
            </div>

            <div className="sm:col-span-6 text-center space-y-1">
              <h2 className="font-bold text-sm tracking-wide uppercase text-slate-800">
                PREFEITURA MUNICIPAL DE SÃO PAULO
              </h2>
              <p className="text-[10px] text-slate-600 uppercase font-semibold">
                SECRETARIA MUNICIPAL DA FAZENDA
              </p>
              <p className="text-xs font-bold text-slate-900 uppercase">
                NOTA FISCAL ELETRÔNICA DE SERVIÇOS — NFS-e
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                RPS Nº {invoice.rpsNumber} Série {invoice.rpsSeries}, emitido em {invoice.issueDate}
              </p>
            </div>

            <div className="sm:col-span-3 text-right sm:border-l sm:border-slate-200 sm:pl-3 space-y-1">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Número da Nota</span>
                <span className="text-sm font-bold font-mono text-slate-900">{invoice.number}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Data e Hora de Emissão</span>
                <span className="text-[11px] font-bold font-mono text-slate-800">
                  {invoice.issueDate} às {invoice.issueTime}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Código de Verificação</span>
                <span className="text-[11px] font-bold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  {invoice.verificationCode}
                </span>
              </div>
            </div>
          </div>

          {/* Access Key and Protocol Bar */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase font-bold">Chave de Acesso:</span>
              <span className="font-bold text-slate-800">{invoice.accessKey}</span>
              <button
                onClick={handleCopyAccessKey}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Copiar Chave"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold">Protocolo de Autorização:</span>{' '}
              <span className="font-bold text-emerald-800">{invoice.protocolNumber}</span>
            </div>
          </div>

          {/* PRESTADOR DE SERVIÇOS */}
          <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              PRESTADOR DE SERVIÇOS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{clinicConfig.clinicName}</p>
                <p className="text-slate-600 mt-0.5">CNPJ: <strong>{clinicConfig.cnpj}</strong></p>
                <p className="text-slate-600">Inscrição Municipal: <strong>{clinicConfig.municipalRegistration || '8.452.190-3'}</strong></p>
                <p className="text-slate-600">Diretor Técnico: <strong>{clinicConfig.technicalDirector} ({clinicConfig.technicalDirectorCrm})</strong></p>
              </div>
              <div className="text-slate-600 sm:text-right">
                <p>Endereço: {clinicConfig.address}</p>
                <p>Telefone: {clinicConfig.phone} • WhatsApp: {clinicConfig.whatsapp}</p>
                <p>E-mail: {clinicConfig.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">Município: São Paulo - SP</p>
              </div>
            </div>
          </div>

          {/* TOMADOR DE SERVIÇOS */}
          <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              TOMADOR DE SERVIÇOS (PACIENTE / CONTRATANTE)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{invoice.takerName}</p>
                <p className="text-slate-600 mt-0.5">CPF / CNPJ: <strong>{invoice.takerCpfCnpj}</strong></p>
                <p className="text-slate-600">Endereço: {invoice.takerAddress || 'Não informado'}</p>
              </div>
              <div className="text-slate-600 sm:text-right">
                <p>E-mail: {invoice.takerEmail || 'Não informado'}</p>
                <p>Telefone / WhatsApp: {invoice.takerPhone || 'Não informado'}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Emitido por: {invoice.issuedByUserName || 'Administração'}
                </p>
              </div>
            </div>
          </div>

          {/* DISCRIMINAÇÃO DOS SERVIÇOS */}
          <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              DISCRIMINAÇÃO DOS SERVIÇOS MÉDICOS / CLÍNICOS
            </span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-line">
              {invoice.serviceDescription}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div>
                <span className="font-bold">Item da Lista de Serviços:</span> {invoice.itemServiceCode} (Serviços de medicina e assistência à saúde)
              </div>
              <div className="sm:text-right">
                <span className="font-bold">CNAE:</span> {invoice.cnaeCode}
              </div>
            </div>
          </div>

          {/* RETENÇÕES FEDERAIS */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              RETENÇÕES DE TRIBUTOS FEDERAIS
            </span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">PIS ({invoice.pisRate}%)</span>
                <span className="font-mono font-bold">R$ {invoice.pisValue.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">COFINS ({invoice.cofinsRate}%)</span>
                <span className="font-mono font-bold">R$ {invoice.cofinsValue.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">INSS</span>
                <span className="font-mono font-bold">R$ 0,00</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">IRRF ({invoice.irrfRate}%)</span>
                <span className="font-mono font-bold">R$ {invoice.irrfValue.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">CSLL ({invoice.csllRate}%)</span>
                <span className="font-mono font-bold">R$ {invoice.csllValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* CÁLCULO DO ISS E VALOR LÍQUIDO */}
          <div className="border-2 border-slate-800 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center bg-slate-50">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Valor dos Serviços</span>
              <span className="font-bold text-sm font-mono text-slate-900">R$ {invoice.serviceValue.toFixed(2)}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Deduções / Descontos</span>
              <span className="font-bold text-xs font-mono text-slate-700">
                R$ {(invoice.deductionsValue + invoice.discountValue).toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Base de Cálculo</span>
              <span className="font-bold text-xs font-mono text-slate-800">R$ {invoice.baseCalculation.toFixed(2)}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Alíquota ISS</span>
              <span className="font-bold text-xs font-mono text-slate-800">{invoice.issRate.toFixed(2)}%</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Valor do ISS</span>
              <span className="font-bold text-xs font-mono text-amber-800">R$ {invoice.issValue.toFixed(2)}</span>
            </div>

            <div className="bg-emerald-100/70 p-2 rounded-md border border-emerald-300">
              <span className="text-[9px] text-emerald-900 uppercase font-bold block">VALOR LÍQUIDO</span>
              <span className="font-bold text-base font-mono text-emerald-950">R$ {invoice.netValue.toFixed(2)}</span>
            </div>
          </div>

          {/* INFORMAÇÕES COMPLEMENTARES */}
          <div className="border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 space-y-1">
            <span className="font-bold uppercase text-slate-700 block">Outras Informações & Tributação:</span>
            <p>
              (I) Documento emitido por ME ou EPP optante pelo Simples Nacional ou Sociedade Uniprofissional. Não gera direito a crédito fiscal de IPI.
            </p>
            <p>
              (II) Os serviços médicos prestados são isentos de PIS/COFINS na modalidade de pessoas físicas atendidas no âmbito clínico ambulatorial.
            </p>
            <p>
              (III) {invoice.municipalTaxDetails || 'Tributação no Município de São Paulo/SP. Código de Tributação 04.01.'}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4" /> Integrado ao Sistema Financeiro & LGPD
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600">
              <Ban className="w-5 h-5" />
              <h3 className="font-bold text-sm">Confirmar Cancelamento de NFS-e</h3>
            </div>

            <p className="text-xs text-slate-600">
              Você está prestes a cancelar a <strong>NFS-e Nº {invoice.number}</strong> emitida para <strong>{invoice.takerName}</strong> no valor de <strong>R$ {invoice.serviceValue.toFixed(2)}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justificativa Obrigatória do Cancelamento *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Erro no valor lançado / Consulta remarcada e estornada / Duplicidade..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:bg-white focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
