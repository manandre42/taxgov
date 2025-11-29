import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DriverView } from './components/DriverView';
import { AuthorityView } from './components/AuthorityView';
import { PassengerView } from './components/PassengerView';
import { UserRole, Driver } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('driver');
  const [currentDriver, setCurrentDriver] = useState<Driver | undefined>(undefined);

  useEffect(() => {
    // Check for logged in driver on mount
    const saved = storageService.getCurrentDriver();
    if (saved) {
      setCurrentDriver(saved);
    }
  }, []);

  const handleLogout = () => {
    storageService.logoutDriver();
    setCurrentDriver(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <Header 
        role={role} 
        setRole={setRole} 
        isLoggedIn={!!currentDriver} 
        onLogout={handleLogout} 
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {role === 'driver' && (
          <DriverView 
            currentDriver={currentDriver} 
            onLoginSuccess={setCurrentDriver} 
          />
        )}
        
        {role === 'authority' && (
          <AuthorityView />
        )}

        {role === 'passenger' && (
          <PassengerView />
        )}
      </main>

      <footer className="text-center py-6 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} TaxiGov. Segurança e eficiência no transporte.</p>
      </footer>
    </div>
  );
};

export default App;