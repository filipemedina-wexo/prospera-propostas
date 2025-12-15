import React, { useState } from 'react';
import { Plus, Calendar, Save, Trash2 } from 'lucide-react';
import { formatCurrency } from './Formatters';
import { ItemType, QuoteItem, PAYMENT_METHODS, Quote } from '../types';
import { generateShortId, saveQuote } from '../services/quoteService';
import { useNavigate } from 'react-router-dom';

const CreateQuote: React.FC = () => {
  const navigate = useNavigate();
  
  // Client State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [productionDays, setProductionDays] = useState<number>(15);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Items State
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState<ItemType>(ItemType.ONE_TIME);
  
  // Payment State
  const [paymentMethodId, setPaymentMethodId] = useState(PAYMENT_METHODS[0].id);

  // Computed
  const subtotalOneTime = items
    .filter(i => i.type === ItemType.ONE_TIME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const subtotalRecurring = items
    .filter(i => i.type === ItemType.RECURRING)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const selectedPayment = PAYMENT_METHODS.find(p => p.id === paymentMethodId);
  const discountAmount = selectedPayment ? (subtotalOneTime * selectedPayment.discountPercent) / 100 : 0;
  const totalOneTime = subtotalOneTime - discountAmount;

  const addItem = () => {
    if (!newItemDesc || !newItemAmount) return;
    const amount = parseFloat(newItemAmount.replace(',', '.')); // Simple handling for comma
    if (isNaN(amount)) return;

    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItemDesc,
      amount: amount,
      type: newItemType
    };

    setItems([...items, newItem]);
    setNewItemDesc('');
    setNewItemAmount('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (!clientName) {
      alert('Por favor, insira o nome do cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um item ao orçamento.');
      return;
    }

    const newQuote: Quote = {
      id: generateShortId(),
      clientName,
      clientEmail,
      createdAt: new Date().toISOString(),
      validUntil,
      productionDays,
      items,
      paymentMethodId,
      status: 'DRAFT'
    };

    saveQuote(newQuote);
    navigate(`/view/${newQuote.id}`);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Novo Orçamento</h1>
        <p className="text-slate-500 mt-1">Crie propostas profissionais para seus clientes em minutos.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Inputs */}
        <div className="flex-1 space-y-6">
          
          {/* Client Data Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <UserCircleIcon className="w-5 h-5 text-brand-500" />
              <h2>Dados do Cliente</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Cliente / Empresa</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tech Solutions Ltda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email (Opcional)</label>
                <input 
                  type="email" 
                  placeholder="contato@empresa.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Validade da Proposta</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-2.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Prazo de Produção</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="15"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      value={productionDays}
                      onChange={e => setProductionDays(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-4 top-2.5 text-slate-400 text-sm">dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Item Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <Plus className="w-5 h-5 text-brand-500" />
              <h2>Adicionar Item</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Descrição do Item</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Desenvolvimento Landing Page"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    value={newItemDesc}
                    onChange={e => setNewItemDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0,00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    value={newItemAmount}
                    onChange={e => setNewItemAmount(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${newItemType === ItemType.ONE_TIME ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setNewItemType(ItemType.ONE_TIME)}
                  >
                    Pagamento Único
                  </button>
                  <button 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${newItemType === ItemType.RECURRING ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setNewItemType(ItemType.RECURRING)}
                  >
                    Mensalidade
                  </button>
                </div>
                
                <button 
                  onClick={addItem}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar ao Orçamento
                </button>
              </div>
            </div>
          </div>

          {/* Payment Conditions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <span className="text-brand-500">💳</span>
              <h2>Condições de Pagamento</h2>
            </div>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
              value={paymentMethodId}
              onChange={e => setPaymentMethodId(e.target.value)}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Column: Summary */}
        <div className="w-full lg:w-96 space-y-6">
          
          {/* Total Card */}
          <div className="bg-brand-500 text-white p-6 rounded-2xl shadow-lg shadow-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            </div>
            <p className="text-brand-100 text-xs font-semibold tracking-wider uppercase mb-1">Total Estimado</p>
            <h2 className="text-4xl font-bold">{formatCurrency(totalOneTime + subtotalRecurring)}</h2>
            {subtotalRecurring > 0 && (
               <p className="text-brand-50 text-sm mt-2 opacity-90">+ {formatCurrency(subtotalRecurring)} mensais</p>
            )}
          </div>

          {/* Item Summary List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumo dos Itens</h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Nenhum item adicionado ainda.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-700">{item.description}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === ItemType.RECURRING ? 'bg-blue-100 text-blue-600' : 'bg-brand-100 text-brand-600'}`}>
                        {item.type === ItemType.RECURRING ? 'Mensal' : 'Pagamento Único'}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                 <span>Itens Totais:</span>
                 <span>{items.length}</span>
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:translate-y-[-1px] flex justify-center items-center gap-2"
              >
                Gerar Proposta PDF <span className="text-lg">→</span>
              </button>
              <button className="w-full text-center text-slate-500 text-sm mt-3 hover:text-slate-800 transition-colors">
                Salvar como Rascunho
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper icon
const UserCircleIcon = ({className}: {className: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default CreateQuote;