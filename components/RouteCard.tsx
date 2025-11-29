
import React from 'react';
import { TaxiRoute } from '../types';
import { MapPin, Clock, Gauge, AlertCircle, ArrowRight } from 'lucide-react';

interface RouteCardProps {
  route: TaxiRoute;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const isPending = !route.analysis;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={14} />
            <span>
              {route.departureTime ? `Saída: ${route.departureTime}` : 'Horário a definir'}
            </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
          route.analysis?.isShortHaul 
            ? 'bg-green-100 text-green-700' 
            : 'bg-indigo-100 text-indigo-700'
        }`}>
          {route.analysis?.classification || 'Pendente'}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">Origem</p>
                <div className="flex items-start gap-2">
                    <MapPin className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <p className="font-semibold text-slate-800 leading-tight">{route.origin}</p>
                </div>
            </div>
            
            <div className="hidden sm:flex justify-center text-slate-300">
                <ArrowRight size={20} />
            </div>

            <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium uppercase mb-1">Destino</p>
                <div className="flex items-start gap-2">
                    <MapPin className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <p className="font-semibold text-slate-800 leading-tight">{route.destination}</p>
                </div>
            </div>
        </div>

        {/* AI Analysis Section */}
        {route.analysis && (
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Gauge size={14} /> Análise do Algoritmo
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <p className="text-xs text-slate-500">Distância Est.</p>
                        <p className="text-lg font-bold text-slate-700">{route.analysis.distanceKm.toFixed(1)} km</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Tempo Est.</p>
                        <p className="text-lg font-bold text-slate-700">{route.analysis.durationMinutes} min</p>
                    </div>
                </div>

                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600 mb-2">
                    <span className="font-medium text-slate-900">Rota sugerida: </span>
                    {route.analysis.suggestedPath}
                </div>
                
                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <AlertCircle size={14} className="mt-0.5 text-amber-500" />
                    <p>{route.analysis.riskAssessment}</p>
                </div>
            </div>
        )}
        
        {isPending && (
             <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center text-slate-400 text-sm italic gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                Calculando rota...
             </div>
        )}
      </div>
    </div>
  );
};