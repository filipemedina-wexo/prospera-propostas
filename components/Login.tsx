import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Lock } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      navigate('/');
    } else {
      setError('Credenciais inválidas. Verifique e tente novamente.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-serif italic text-2xl mx-auto mb-4 shadow-lg shadow-brand-500/30">
            P
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h1>
          <p className="text-slate-500 text-sm mt-1">Acesse o painel administrativo da Prospera</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
              <Lock size={12} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-4"
          >
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
