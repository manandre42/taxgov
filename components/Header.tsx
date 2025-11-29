import React from 'react';
import { ShieldCheck, CarTaxiFront, LogOut, User } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ role, setRole, onLogout, isLoggedIn }) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
            <CarTaxiFront size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TaxiGov</h1>
            <p className="text-xs text-slate-400">Controle Inteligente de Rotas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-full">
            <button
              onClick={() => setRole('passenger')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                role === 'passenger' ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <User size={16} />
              Passageiro
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                role === 'driver' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Motorista
            </button>
            <button
              onClick={() => setRole('authority')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                role === 'authority' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck size={16} />
              Fiscal
            </button>
            
            {role === 'driver' && isLoggedIn && (
              <button 
                onClick={onLogout}
                className="ml-1 p-1.5 rounded-full bg-slate-700 text-slate-300 hover:text-red-400 hover:bg-slate-600 transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}
        </div>
      </div>
    </header>
  );
};