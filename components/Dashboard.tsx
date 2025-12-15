import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { getAllQuotes } from '../services/quoteService';
import { Quote, ItemType } from '../types';
import { formatCurrency } from './Formatters';
import { format, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyId, setCopyId] = useState<string | null>(null);

  useEffect(() => {
    setQuotes(getAllQuotes());
  }, []);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/#/view/${id}`;
    navigator.clipboard.writeText(url);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  };

  const filteredQuotes = quotes.filter(q => 
    q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SENT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EXPIRED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
     switch (status) {
      case 'APPROVED': return 'Aprovado';
      case 'SENT': return 'Enviado'; // Usually we treat DRAFT as SENT in this simple flow
      case 'DRAFT': return 'Aguardando';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  const calculateTotal = (quote: Quote) => {
    return quote.items.reduce((acc, item) => acc + item.amount, 0);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Propostas Comerciais</h1>
          <p className="text-slate-500 mt-1">Gerencie todos os orçamentos enviados.</p>
        </div>
        <Link 
          to="/new" 
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-500/20 font-medium flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Nova Proposta
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{quote.clientName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {quote.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">
                        {formatCurrency(calculateTotal(quote))}
                      </div>
                      {quote.items.some(i => i.type === ItemType.RECURRING) && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                          Recorrente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(parseISO(quote.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${getStatusColor(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyLink(quote.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors relative group/tooltip"
                          title="Copiar Link"
                        >
                          {copyId === quote.id ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                        </button>
                        <Link 
                          to={`/view/${quote.id}`}
                          className="p-2 hover:bg-slate-100 rounded-lg text-brand-600 transition-colors"
                          title="Visualizar"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
