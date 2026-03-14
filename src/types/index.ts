export type Coordinates = {
  lat: number;
  lng: number;
};

export type EmergencyStatus = 'new' | 'dispatched' | 'en-route' | 'arrived' | 'resolved';

export type EmergencyPriority = 'critical' | 'high' | 'stable';

export interface EmergencyRequest {
  id: string;
  location: Coordinates;
  timestamp: number;
  status: EmergencyStatus;
  type: string;
  priority: EmergencyPriority;
  hospitalAccepted?: boolean;
  hospitalId?: string;
  assignedAmbulance?: string;
  eta?: string;
  distance?: string;
  patientCondition?: string;
  vitals?: {
    hr: number;
    spo2: number;
    bp?: string;
    temp?: number;
  };
  aiPrediction?: {
    condition: string;
    requiredPrep: string[];
  };
  teamReadiness?: {
    suggested: string[];
    confirmed: boolean;
  };
  timeline?: {
    event: string;
    timestamp: number;
    status: 'completed' | 'current' | 'upcoming';
  }[];
  routeStatus?: string;
}

export interface HospitalCapacity {
  icuBeds: { total: number; available: number };
  emergencyBeds: { total: number; available: number };
  ventilators: { total: number; available: number };
  operationTheatres: { total: number; available: number };
}

export type VehicleStatus = 'available' | 'busy' | 'maintenance' | 'offline';

export interface Ambulance {
  id: string;
  driverName: string;
  location: Coordinates;
  status: VehicleStatus;
  assignedEmergencyId?: string;
  eta?: string; // e.g. "5 mins"
  lastUpdate?: number; // Timestamp of last heartbeat
}

export type DroneState = 'idle' | 'launched' | 'returning' | 'charging';

export interface Drone {
  id: string;
  location: Coordinates;
  state: DroneState;
  batteryLevel: number;
  isObstacleDetected: boolean;
  assignedEmergencyId?: string;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  message: string;
  level: 'info' | 'warning' | 'critical' | 'success';
  module: 'Dispatch' | 'Drone' | 'Fleet' | 'System';
}
