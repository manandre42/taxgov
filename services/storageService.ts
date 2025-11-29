
import { Driver, TaxiRoute } from '../types';

const DRIVERS_KEY = 'taxigov_drivers';
const ROUTES_KEY = 'taxigov_routes';
const CURRENT_USER_KEY = 'taxigov_current_driver_id';

export const storageService = {
  // Driver Management
  registerDriver: (driver: Driver): void => {
    const drivers = storageService.getDrivers();
    const filtered = drivers.filter(d => d.licensePlate !== driver.licensePlate);
    filtered.push(driver);
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(filtered));
    localStorage.setItem(CURRENT_USER_KEY, driver.id);
  },

  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(DRIVERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getDriverByPlate: (plate: string): Driver | undefined => {
    const drivers = storageService.getDrivers();
    return drivers.find(d => d.licensePlate.replace(/\s/g, '').toUpperCase() === plate.replace(/\s/g, '').toUpperCase());
  },

  getCurrentDriver: (): Driver | undefined => {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return undefined;
    return storageService.getDrivers().find(d => d.id === id);
  },

  logoutDriver: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getDriverById: (id: string): Driver | undefined => {
    return storageService.getDrivers().find(d => d.id === id);
  },

  // Route Management
  addRoute: (route: TaxiRoute): void => {
    const routes = storageService.getRoutes();
    routes.push(route);
    localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
  },

  getRoutes: (): TaxiRoute[] => {
    const data = localStorage.getItem(ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Update a route (generic)
  updateRoute: (updatedRoute: TaxiRoute): void => {
    const routes = storageService.getRoutes();
    const index = routes.findIndex(r => r.id === updatedRoute.id);
    if (index !== -1) {
      routes[index] = updatedRoute;
      localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
    }
  },

  // Driver accepts a route created by authority and Sets the Time
  acceptRoute: (routeId: string, driverId: string, departureTime: string): void => {
    const routes = storageService.getRoutes();
    const route = routes.find(r => r.id === routeId);
    if (route && route.status === 'created') {
      route.driverId = driverId;
      route.status = 'accepted';
      route.departureTime = departureTime; // Driver sets the time here
      storageService.updateRoute(route);
    }
  },

  // Passenger books a route
  bookRoute: (routeId: string, passengerName: string): void => {
    const routes = storageService.getRoutes();
    const route = routes.find(r => r.id === routeId);
    if (route && route.status === 'accepted') {
      route.passengerName = passengerName;
      route.status = 'booked';
      storageService.updateRoute(route);
    }
  },

  // Filters
  getRoutesByDriver: (driverId: string): TaxiRoute[] => {
    return storageService.getRoutes()
      .filter(r => r.driverId === driverId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getAvailableRoutesForDriver: (): TaxiRoute[] => {
    return storageService.getRoutes()
      .filter(r => r.status === 'created')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getBookableRoutesForPassenger: (): TaxiRoute[] => {
    return storageService.getRoutes()
      .filter(r => r.status === 'accepted')
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};