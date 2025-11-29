
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRight, Clock, User, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { TaxiRoute } from '../types';

export const PassengerView: React.FC = () => {
  const [rides, setRides] = useState<TaxiRoute[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [hasBooked, setHasBooked] = useState(false);

  // Helper to get driver details
  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Aguardando Motorista';
    const driver = storageService.getDriverById(driverId);
    return driver ? `${driver.fullName} (${driver.vehicleModel})` : 'Motorista Desconhecido';
  };

  const refreshRides = () => {
    setRides(storageService.getBookableRoutesForPassenger());
  };

  useEffect(() => {
    refreshRides();
    const interval = setInterval(refreshRides, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBookRide = (routeId: string) => {
    if (!passengerName.trim()) {
        alert("Por favor, digite seu nome antes de escolher.");
        return;
    }
    storageService.bookRoute(routeId, passengerName);
    setHasBooked(true);
    refreshRides();
  };

  if (hasBooked) {
    return (
        <div className="max-w-md mx-auto text-center pt-10 px-6">
            <div className="bg-green-100 text-green-600 rounded-full p-6 inline-block mb-6">
                <CheckCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Reserva Confirmada!</h2>
            <p className="text-slate-600 mb-8">O motorista já foi notificado. Aguarde no local de partida.</p>
            <button 
                onClick={() => setHasBooked(false)}
                className="text-blue-600 font-medium hover:underline"
            >
                Buscar outra corrida
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Escolha sua viagem</h2>
        <p className="text-slate-500 mt-2">Rotas oficiais com motoristas confirmados.</p>
      </div>

      <div className="max-w-md mx-auto mb-8">
         <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none shadow-sm"
                placeholder="Seu nome para reserva..."
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
            />
         </div>
      </div>

      <div className="grid gap-4">
        {rides.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <Navigation size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma corrida disponível no momento.</p>
                <p className="text-sm text-slate-400">Aguarde novas rotas serem aceitas pelos motoristas.</p>
            </div>
        ) : (
            rides.map(route => (
                <div key={route.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Clock size={12} />
                                Saída: {route.departureTime}
                            </div>
                            <span className="text-xs text-slate-400">{route.analysis?.classification}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Origem</p>
                                <p className="text-slate-900 font-semibold">{route.origin}</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <ArrowRight className="text-slate-300" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Destino</p>
                                <p className="text-slate-900 font-semibold">{route.destination}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg mb-4">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                <User size={16} />
                             </div>
                             <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Motorista</p>
                                <p className="text-sm font-medium text-slate-700">{getDriverName(route.driverId)}</p>
                             </div>
                        </div>

                        <button
                            onClick={() => handleBookRide(route.id)}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Confirmar Reserva
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
