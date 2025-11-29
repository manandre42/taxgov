
import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, Car, Map, Plus, Send, Gauge } from 'lucide-react';
import { storageService } from '../services/storageService';
import { analyzeRoute } from '../services/geminiService';
import { Driver, TaxiRoute } from '../types';
import { RouteCard } from './RouteCard';

export const AuthorityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'inspect'>('create');
  
  // Search State
  const [searchPlate, setSearchPlate] = useState('');
  const [foundDriver, setFoundDriver] = useState<Driver | null>(null);
  const [driverRoutes, setDriverRoutes] = useState<TaxiRoute[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Creation State
  const [routeForm, setRouteForm] = useState({
    origin: '',
    destination: ''
  });
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);
  const [createdRoutes, setCreatedRoutes] = useState<TaxiRoute[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate.trim()) return;

    setHasSearched(true);
    const driver = storageService.getDriverByPlate(searchPlate);
    
    if (driver) {
      setFoundDriver(driver);
      setDriverRoutes(storageService.getRoutesByDriver(driver.id));
    } else {
      setFoundDriver(null);
      setDriverRoutes([]);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.origin || !routeForm.destination) return;

    setIsSubmittingRoute(true);

    try {
      const partialRoute: TaxiRoute = {
        id: crypto.randomUUID(),
        driverId: null, // No driver yet
        origin: routeForm.origin,
        destination: routeForm.destination,
        // departureTime is undefined until driver accepts
        status: 'created',
        createdAt: Date.now()
      };

      const analysis = await analyzeRoute(partialRoute.origin, partialRoute.destination);
      const fullRoute = { ...partialRoute, analysis };

      storageService.addRoute(fullRoute);
      setCreatedRoutes([fullRoute, ...createdRoutes]);
      setRouteForm({ origin: '', destination: '' });
      alert("Rota criada e disponibilizada para motoristas! (Aguardando definição de horário pelo motorista)");

    } catch (error) {
      console.error(error);
      alert("Erro ao calcular rota. Tente novamente.");
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'create' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          Criar Rotas Oficiais
        </button>
        <button
          onClick={() => setActiveTab('inspect')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'inspect' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          Fiscalizar Veículos
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-slate-900 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Map size={150} />
                </div>
                
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="text-blue-500" />
                    Nova Rota Oficial
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    Defina rotas que serão disponibilizadas para os motoristas. O horário será definido pelo condutor ao aceitar a rota.
                </p>
                
                <form onSubmit={handleCreateRoute} className="relative z-10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Ponto de Partida</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="Rua, Bairro ou Referência"
                                value={routeForm.origin}
                                onChange={e => setRouteForm({...routeForm, origin: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Destino Final</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="Destino do passageiro"
                                value={routeForm.destination}
                                onChange={e => setRouteForm({...routeForm, destination: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmittingRoute}
                        className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                            isSubmittingRoute 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                    >
                        {isSubmittingRoute ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Analisando Logística...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Publicar Rota
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            {createdRoutes.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3 px-1">Rotas Criadas Recentemente</h3>
                    {createdRoutes.map(route => <RouteCard key={route.id} route={route} />)}
                </div>
            )}
        </div>
      )}

      {activeTab === 'inspect' && (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Search Section */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center border-t-4 border-blue-600">
                <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-full mb-4">
                    <Search size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Consulta de Fiscalização</h2>
                <p className="text-slate-500 mb-6 max-w-lg mx-auto">
                Digite a matrícula (placa) do veículo para verificar o cadastro do taxista e o histórico de rotas.
                </p>

                <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
                <input
                    type="text"
                    className="w-full pl-6 pr-14 py-4 text-lg border-2 border-slate-200 rounded-full focus:border-blue-500 focus:ring-0 outline-none uppercase tracking-widest text-center font-mono placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
                    placeholder="ABC-1234"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                />
                <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white aspect-square rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                    <Search size={20} />
                </button>
                </form>
            </div>

            {/* Results Section */}
            {hasSearched && !foundDriver && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center gap-4 text-red-700">
                    <ShieldAlert size={32} className="shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg">Veículo não encontrado</h3>
                        <p>Nenhum motorista cadastrado com a placa <strong>{searchPlate.toUpperCase()}</strong>.</p>
                    </div>
                </div>
            )}

            {foundDriver && (
                <div className="space-y-6">
                    {/* Driver Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CheckCircle className="text-green-400" />
                                Cadastro Regular
                            </h3>
                            <span className="text-slate-400 text-sm">Registrado em: {new Date(foundDriver.registeredAt).toLocaleDateString()}</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-bold">Motorista</p>
                                <p className="text-xl text-slate-900 font-semibold">{foundDriver.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-bold">Veículo</p>
                                <p className="text-xl text-slate-900 font-semibold flex items-center gap-2">
                                    <Car size={20} className="text-slate-400" />
                                    {foundDriver.vehicleModel}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-bold">Placa</p>
                                <p className="text-2xl text-slate-900 font-mono tracking-wider">{foundDriver.licensePlate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-bold">Alvará</p>
                                <p className="text-xl text-slate-900 font-semibold">{foundDriver.badgeNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Routes History */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Histórico de Rotas
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{driverRoutes.length}</span>
                        </h3>
                        
                        {driverRoutes.length > 0 ? (
                            driverRoutes.map(route => <RouteCard key={route.id} route={route} />)
                        ) : (
                            <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg border border-slate-100">
                                Nenhuma rota registrada para este veículo.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};