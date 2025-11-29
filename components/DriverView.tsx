
import React, { useState, useEffect } from 'react';
import { Driver, TaxiRoute } from '../types';
import { storageService } from '../services/storageService';
import { RouteCard } from './RouteCard';
import { User, FileText, Truck, MapPin, ArrowRight, Clock } from 'lucide-react';

interface DriverViewProps {
  onLoginSuccess: (driver: Driver) => void;
  currentDriver: Driver | undefined;
}

export const DriverView: React.FC<DriverViewProps> = ({ onLoginSuccess, currentDriver }) => {
  // Registration State
  const [regForm, setRegForm] = useState({
    fullName: '',
    licensePlate: '',
    badgeNumber: '',
    vehicleModel: ''
  });

  const [myRoutes, setMyRoutes] = useState<TaxiRoute[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<TaxiRoute[]>([]);
  // Store temp departure times for available routes
  const [departureTimes, setDepartureTimes] = useState<Record<string, string>>({});

  // Refresh data helper
  const refreshData = () => {
    if (currentDriver) {
      setMyRoutes(storageService.getRoutesByDriver(currentDriver.id));
      setAvailableRoutes(storageService.getAvailableRoutesForDriver());
    }
  };

  useEffect(() => {
    refreshData();
    // Simple poll to keep list fresh
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [currentDriver]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.licensePlate) return;

    const newDriver: Driver = {
      id: crypto.randomUUID(),
      ...regForm,
      licensePlate: regForm.licensePlate.toUpperCase(),
      registeredAt: new Date().toISOString()
    };

    storageService.registerDriver(newDriver);
    onLoginSuccess(newDriver);
  };

  const handleAcceptRoute = (routeId: string) => {
    if (!currentDriver) return;
    const time = departureTimes[routeId];
    if (!time) {
        alert("Por favor, defina um horário de saída antes de aceitar.");
        return;
    }
    
    storageService.acceptRoute(routeId, currentDriver.id, time);
    
    // Clear temp state
    const newTimes = {...departureTimes};
    delete newTimes[routeId];
    setDepartureTimes(newTimes);
    
    refreshData();
  };

  if (!currentDriver) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Cadastro de Motorista</h2>
            <p className="text-slate-500 mt-2">Identifique-se para acessar o quadro de rotas.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                    value={regForm.fullName}
                    onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="ABC-1234"
                        value={regForm.licensePlate}
                        onChange={e => setRegForm({...regForm, licensePlate: e.target.value})}
                    />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alvará</label>
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Nº 00123"
                    value={regForm.badgeNumber}
                    onChange={e => setRegForm({...regForm, badgeNumber: e.target.value})}
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Modelo do Veículo</label>
             <div className="relative">
                <Truck className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Ex: Toyota Corolla"
                    value={regForm.vehicleModel}
                    onChange={e => setRegForm({...regForm, vehicleModel: e.target.value})}
                />
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-md active:transform active:scale-95"
          >
            Entrar no Sistema
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-800">Olá, {currentDriver.fullName.split(' ')[0]}</h2>
         <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase">{currentDriver.vehicleModel}</span>
      </div>

      {/* Available Routes Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            Rotas Disponíveis
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{availableRoutes.length}</span>
        </h3>

        {availableRoutes.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                <p>Nenhuma rota nova disponibilizada pela central no momento.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {availableRoutes.map(route => (
                    <div key={route.id} className="relative group">
                         <div className="absolute inset-0 bg-amber-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                         <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600">SEM HORÁRIO</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{route.analysis?.classification}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-amber-500" />
                                        <span className="font-semibold text-slate-900">{route.origin}</span>
                                    </div>
                                    <ArrowRight size={16} className="hidden sm:block text-slate-300" />
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span className="font-semibold text-slate-900">{route.destination}</span>
                                    </div>
                                </div>
                                {route.analysis && (
                                    <p className="text-xs text-slate-500 line-clamp-1">{route.analysis.suggestedPath}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                    <Clock size={16} className="text-slate-400 ml-1" />
                                    <input 
                                        type="time" 
                                        className="bg-transparent text-sm font-semibold text-slate-700 outline-none w-24"
                                        value={departureTimes[route.id] || ''}
                                        onChange={(e) => setDepartureTimes({...departureTimes, [route.id]: e.target.value})}
                                    />
                                </div>
                                <button 
                                    onClick={() => handleAcceptRoute(route.id)}
                                    className="whitespace-nowrap bg-amber-500 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-md text-sm"
                                >
                                    Aceitar
                                </button>
                            </div>
                         </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="h-px bg-slate-200 my-8"></div>

      {/* Accepted Routes History */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 px-1">Minhas Rotas Aceitas</h3>
        {myRoutes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic">
                Você ainda não aceitou nenhuma rota.
            </div>
        ) : (
            myRoutes.map(route => (
                <div key={route.id} className="relative">
                    {route.status === 'booked' && (
                        <div className="absolute -top-3 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-bounce">
                            Passageiro Confirmado: {route.passengerName}
                        </div>
                    )}
                    <RouteCard route={route} />
                </div>
            ))
        )}
      </div>
    </div>
  );
};