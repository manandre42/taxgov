
export interface Driver {
  id: string;
  fullName: string;
  licensePlate: string;
  badgeNumber: string; // Alvará
  vehicleModel: string;
  registeredAt: string;
}

export interface RouteAnalysis {
  distanceKm: number;
  durationMinutes: number;
  isShortHaul: boolean;
  classification: 'Urbana' | 'Intermunicipal' | 'Longo Curso';
  riskAssessment: string;
  suggestedPath: string;
}

export interface TaxiRoute {
  id: string;
  driverId: string | null; // Nullable until driver accepts
  passengerName?: string;  // Filled when passenger chooses
  origin: string;
  destination: string;
  departureTime?: string; // Optional, set by driver upon acceptance
  status: 'created' | 'accepted' | 'booked' | 'completed';
  analysis?: RouteAnalysis;
  createdAt: number;
}

export type UserRole = 'driver' | 'authority' | 'passenger';