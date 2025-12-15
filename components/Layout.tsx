import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, LogOut } from 'lucide-react';
import { isAuthenticated, getCurrentUser, logout } from '../services/authService';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-emerald-50 to-cyan-100 text-slate-800">
      <header className="p-6 flex justify-between items-center no-print">
        <div 
          onClick={() => loggedIn && navigate('/')}
          className={`w-10 h-10 bg-[#8FA866] rounded flex items-center justify-center text-white font-serif italic text-xs shadow-md ${loggedIn ? 'cursor-pointer hover:bg-[#7d9458]' : ''} transition-colors`}
        >
          Prospera
        </div>
        
        {loggedIn && user ? (
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-slate-700">{user.name}</p>
               <p className="text-[10px] text-slate-500">Administrador</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white">
                {getInitials(user.name)}
             </div>
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
