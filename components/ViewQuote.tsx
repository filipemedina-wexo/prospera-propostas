import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Printer, Pencil, Building2, Calendar, Clock, CheckCircle2, Copy, ThumbsUp, X } from 'lucide-react';
import { Quote, ItemType, PaymentMethod } from '../types';
import { getQuote, updateQuoteStatus } from '../services/quoteService';
import { getAllPaymentMethods } from '../services/paymentService';
import { useAuth } from './AuthProvider';
import { formatCurrency } from './Formatters';
import PasswordGate from './PasswordGate';
import { format, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';

// Legacy methods for backward compatibility
const LEGACY_METHODS: PaymentMethod[] = [
  { id: 'pix', name: 'PIX (5% de desconto)', discountPercent: 5 },
  { id: 'credit_card', name: 'Cartão de Crédito (Sem desconto)', discountPercent: 0 },
  { id: 'boleto', name: 'Boleto Bancário (Sem desconto)', discountPercent: 0 },
];

const ViewQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isGateOpen, setIsGateOpen] = useState(false); // Renamed to avoid confusion
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const { user } = useAuth();
  const isAdmin = !!user;
  const [loading, setLoading] = useState(true);

  // Auto-open gate for logged in users
  useEffect(() => {
    if (user) {
      setIsGateOpen(true);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      // Load methods
      const methods = await getAllPaymentMethods();
      setPaymentMethods(methods);

      if (id) {
        const foundQuote = await getQuote(id);
        setQuote(foundQuote);
        if (foundQuote?.selectedPaymentOptionId) {
          setSelectedOptionId(foundQuote.selectedPaymentOptionId);
        } else if (foundQuote?.paymentOptions?.length) {
          setSelectedOptionId(foundQuote.paymentOptions[0].id);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Carregando seu orçamento. Aguarde...</p>
      </div>
    );
  }

  if (!quote) {
    return <div className="text-center py-20 text-slate-500">Orçamento não encontrado.</div>;
  }

  // Gate check
  if (!isGateOpen) {
    return <PasswordGate onSuccess={() => setIsGateOpen(true)} />;
  }

  // Calculations
  const subtotalOneTime = quote.items
    .filter(i => i.type === ItemType.ONE_TIME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const subtotalRecurring = quote.items
    .filter(i => i.type === ItemType.RECURRING)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Find method in DB or Legacy
  const paymentMethod =
    paymentMethods.find(p => p.id === quote.paymentMethodId) ||
    LEGACY_METHODS.find(p => p.id === quote.paymentMethodId) ||
    { id: 'unknown', name: 'Método não identificado', discountPercent: 0 };

  const discountAmount = (subtotalOneTime * paymentMethod.discountPercent) / 100;
  const totalOneTime = subtotalOneTime - discountAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };


  const handleAcceptClick = () => {
    setShowModal(true);
  };

  const handleConfirmAccept = async () => {
    setIsAccepting(true);

    // Trigger Confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24']
    });

    if (quote) {
      const updated = await updateQuoteStatus(quote.id, 'APPROVED', selectedOptionId || undefined);
      if (updated) setQuote(updated);
    }

    setIsAccepting(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${quote.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {quote.status === 'APPROVED' ? 'Aprovado' : 'Aguardando Aceite'}
            </span>
            <span className="text-slate-400 text-sm font-medium">#{quote.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Detalhes do Orçamento</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {isAdmin && (
            <Link to="/" className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Pencil size={16} />
              Voltar ao Painel
            </Link>
          )}
          <button
            onClick={handleShare}
            className="flex-1 md:flex-none justify-center bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 relative"
          >
            {copyFeedback ? <CheckCircle2 size={16} className="text-green-500" /> : <Share2 size={16} />}
            {copyFeedback ? 'Link Copiado!' : 'Compartilhar'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none justify-center bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer size={16} />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-white">

        {/* Blue Line Top */}
        <div className={`h-2 w-full ${quote.status === 'APPROVED' ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-brand-400'}`}></div>

        <div className="p-5 md:p-12">

          {/* Success Banner if Approved */}
          {quote.status === 'APPROVED' && (
            <div className="mb-8 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4 text-green-800 animate-fade-in">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                <ThumbsUp size={20} />
              </div>
              <div>
                <p className="font-bold">Proposta Aprovada!</p>
                <p className="text-sm opacity-80">Obrigado pela confiança. Nossa equipe entrará em contato em breve para iniciar o projeto.</p>
              </div>
            </div>
          )}

          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Orçamento Para</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{quote.clientName}</h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="w-4 h-4 flex items-center justify-center bg-slate-100 rounded text-[10px]">✉</span>
                {quote.clientEmail || 'Email não informado'}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Data</p>
                <p className="font-semibold text-slate-700">{format(parseISO(quote.createdAt), 'dd/MM/yyyy')}</p>
                {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                  <p className="text-[10px] text-slate-400 mt-1">Atualizado: {format(parseISO(quote.updatedAt), 'dd/MM HH:mm')}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Validade</p>
                <p className="font-semibold text-slate-700">{format(parseISO(quote.validUntil), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Prazo</p>
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Clock size={14} className="text-brand-500" />
                  {quote.productionDays} dias úteis
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className={`font-semibold ${quote.status === 'APPROVED' ? 'text-green-600' : 'text-brand-600'}`}>
                  {quote.status === 'APPROVED' ? 'Aprovado' : 'Aguardando'}
                </p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
              <div className="w-8 h-8 rounded bg-brand-100 text-brand-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              Itens do Projeto
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-medium">
                    <th className="p-4 font-semibold">Descrição</th>
                    <th className="p-4 font-semibold text-center">Tipo</th>
                    <th className="p-4 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {quote.items.map(item => (
                    <tr key={item.id} className="group hover:bg-slate-50/50">
                      <td className="p-5">
                        <p className="font-medium text-slate-800 text-lg">{item.description}</p>
                        <p className="text-slate-400 text-sm mt-1">Implementação completa conforme requisitos.</p>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.type === ItemType.ONE_TIME ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.type === ItemType.ONE_TIME ? 'Pagamento Único' : 'Mensal'}
                        </span>
                      </td>
                      <td className="p-5 text-right font-medium text-slate-700">
                        {formatCurrency(item.amount)}
                        {item.type === ItemType.RECURRING && <span className="text-slate-400 text-xs ml-1">/mês</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {quote.items.map(item => (
                  <div key={item.id} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.type === ItemType.ONE_TIME ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type === ItemType.ONE_TIME ? 'Único' : 'Mensal'}
                      </span>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                        {item.type === ItemType.RECURRING && <span className="text-slate-400 text-[10px] ml-0.5">/mês</span>}
                      </p>
                    </div>
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-slate-400 text-xs mt-1">Implementação completa conforme requisitos.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Section: Payment & Totals */}
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Payment Methods */}
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Formas de Pagamento</h3>

              <div className="space-y-4">
                {quote.paymentOptions && quote.paymentOptions.length > 0 ? (
                  quote.paymentOptions.map((option, index) => {
                    const method = paymentMethods.find(m => m.id === option.paymentMethodId) || LEGACY_METHODS.find(m => m.id === option.paymentMethodId);
                    const optionTotal = subtotalOneTime * (1 - option.discountPercent / 100);

                    const optionLetter = String.fromCharCode(65 + index); // A, B, C...
                    const optionSuffix = option.discountPercent > 0
                      ? `À Vista com ${option.discountPercent}% de Desconto`
                      : option.installments > 1
                        ? 'Parcelado'
                        : 'À Vista';

                    const isSelected = selectedOptionId === option.id;
                    const isReadOnly = quote.status === 'APPROVED';

                    return (
                      <div
                        key={option.id}
                        onClick={() => !isReadOnly && setSelectedOptionId(option.id)}
                        className={`bg-slate-50 border rounded-2xl p-5 transition-all group relative cursor-pointer ${isSelected
                            ? 'border-brand-500 ring-2 ring-brand-500/10 bg-white'
                            : 'border-slate-100 hover:border-brand-200'
                          } ${isReadOnly ? 'cursor-default' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-brand-600">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">Opção {optionLetter} - {optionSuffix}</p>
                              <p className="text-brand-600 text-xs font-medium">
                                {method?.name || 'Forma de Pagamento'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(optionTotal)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-t border-slate-100 border-dashed">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Parcelamento</p>
                            <p className="text-sm font-semibold text-slate-700">{option.installments === 1 ? 'À vista' : `${option.installments}x`}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Valor Parcela</p>
                            <p className="text-sm font-semibold text-slate-700">
                              {formatCurrency(optionTotal / option.installments)}
                            </p>
                          </div>
                        </div>

                        {option.installments > 1 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-50">
                            <Clock size={12} className="text-slate-400" />
                            {option.hasDownPayment
                              ? `Entrada de ${formatCurrency(optionTotal / option.installments)} + ${option.installments - 1} parcelas.`
                              : `Total dividido em ${option.installments} parcelas mensais.`
                            }
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-brand-600">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{paymentMethod.name.split('(')[0]}</p>
                      <p className="text-brand-600 text-sm font-medium">
                        {paymentMethod.discountPercent > 0 ? `${paymentMethod.discountPercent}% de desconto aplicado` : 'Sem desconto adicional'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  O início do projeto se dá após a confirmação do pagamento da primeira parcela (ou valor integral).
                  Valores de recorrência serão cobrados via boleto bancário mensalmente.
                </p>
              </div>
            </div>

            {/* Totals Box */}
            <div className="w-full lg:w-96">
              <div className="bg-slate-50 rounded-2xl p-6 mb-4">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal (Itens Únicos)</span>
                    <span>{formatCurrency(subtotalOneTime)}</span>
                  </div>
                  {subtotalRecurring > 0 && (
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>Mensalidade</span>
                      <span>{formatCurrency(subtotalRecurring)}</span>
                    </div>
                  )}
                  {quote.paymentOptions && quote.paymentOptions.length > 1 ? (
                    <div className="flex justify-between text-slate-500 text-sm italic">
                      <span>Múltiplas opções disponíveis</span>
                    </div>
                  ) : (
                    discountAmount > 0 && (
                      <div className="flex justify-between text-brand-600 text-sm font-medium">
                        <span>Desconto</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-slate-900 text-lg">
                      {quote.paymentOptions && quote.paymentOptions.length > 1 ? 'Total (Base)' : 'Total do Pedido'}
                    </span>
                    <span className="font-bold text-slate-900 text-3xl">
                      {quote.paymentOptions && quote.paymentOptions.length > 1 ? formatCurrency(subtotalOneTime) : formatCurrency(totalOneTime)}
                    </span>
                  </div>
                  {subtotalRecurring > 0 && (
                    <p className="text-right text-slate-500 text-sm">+ {formatCurrency(subtotalRecurring)} /mês</p>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON FOR CLIENT */}
              {quote.status !== 'APPROVED' && (
                <button
                  onClick={handleAcceptClick}
                  disabled={isAccepting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 no-print"
                >
                  <ThumbsUp size={20} /> Aprovar Orçamento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verify Footer */}
      <div className="text-center mt-8 text-slate-400 text-sm flex items-center justify-center gap-2 print-break">
        <CheckCircle2 size={16} className="text-slate-300" />
        Documento gerado digitalmente pela plataforma Prospera.
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Confirmar Aprovação</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-lg font-medium text-slate-700">Você deseja confirmar esse trabalho?</p>

              {selectedOptionId && quote.paymentOptions && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Forma de Pagamento Selecionada</p>
                  <p className="font-bold text-brand-600">
                    {(() => {
                      const opt = quote.paymentOptions?.find(o => o.id === selectedOptionId);
                      if (!opt) return 'Não selecionada';
                      const index = quote.paymentOptions?.indexOf(opt);
                      const optionLetter = String.fromCharCode(65 + index);
                      const optionSuffix = opt.discountPercent > 0
                        ? `À Vista com ${opt.discountPercent}% de Desconto`
                        : opt.installments > 1
                          ? 'Parcelado'
                          : 'À Vista';
                      return `Opção ${optionLetter} - ${optionSuffix}`;
                    })()}
                  </p>
                </div>
              )}

              <p className="text-sm text-slate-500 mt-4">Ao confirmar, a equipe da Prospera será notificada para iniciar o projeto.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={isAccepting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all flex justify-center items-center gap-2"
              >
                {isAccepting ? 'Confirmando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewQuote;
