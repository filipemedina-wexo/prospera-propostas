import React, { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, LogOut } from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Safe helper to get a display name
  const getUserName = () => {
    if (!user) return '';
    // Check if there is 'name' or 'full_name' in metadata, otherwise fallback to email
    return user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'Usuário';
  };

  const displayName = getUserName();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return (name || 'U').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-emerald-50 to-cyan-100 text-slate-800">
      <header className="p-6 flex justify-between items-center no-print">
        <div
          onClick={() => user && navigate('/')}
          className={`cursor-pointer ${user ? 'hover:opacity-80' : ''} transition-opacity`}
        >
          <img src="/logo.png" alt="Prospera Logo" className="h-12 w-auto" />
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-700">{displayName}</p>
              <p className="text-[10px] text-slate-500">Administrador</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white">
              {getInitials(displayName)}
            </div>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <Link
              to="/services"
              className="text-slate-600 hover:text-brand-600 text-sm font-medium transition-colors"
              title="Meus Serviços"
            >
              Serviços
            </Link>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-black/5 transition-colors text-slate-600"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Área Segura</span>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 pb-12 max-w-6xl">
        {children}
      </main>
      <footer className="text-center py-6 text-slate-400 text-sm no-print">
        © {new Date().getFullYear()} PROSPERA. PLATAFORMA SEGURA.
      </footer>
    </div>
  );
};

export default Layout;
