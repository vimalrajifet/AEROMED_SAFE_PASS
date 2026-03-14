import { create } from 'zustand';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Coordinates, EmergencyRequest, Ambulance, Drone, SystemLog } from '../types';

interface AppState {
  // Data
  requests: EmergencyRequest[];
  fleet: Ambulance[];
  drone: Drone;
  logs: SystemLog[];
  traffic: { greenCorridor: boolean; junctions: any[] };

  // UI State
  currentView: 'dashboard' | 'map' | 'dispatch';

  // Selection / Active State
  selectedRequestId: string | null;
  activeRoute: Coordinates[] | null;

  // Actions
  setView: (view: 'dashboard' | 'map' | 'dispatch') => void;
  subscribeToRequests: () => () => void;
  selectRequest: (id: string | null) => void;
  dispatchAmbulance: (reqId: string, ambId: string) => Promise<void>;
  resolveRequest: (reqId: string) => Promise<void>; // NEW: Delete request
  setRoute: (route: Coordinates[] | null) => void;
  toggleGreenCorridor: () => void;
  updateDroneState: (updates: Partial<Drone>) => void;
  addLog: (msg: string, level: SystemLog['level']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  requests: [],
  fleet: [],
  drone: {
    id: 'D-001',
    location: { lat: 13.168736, lng: 80.068330 },
    state: 'idle',
    batteryLevel: 85,
    isObstacleDetected: false
  },
  logs: [],
  traffic: {
    greenCorridor: false,
    junctions: [
      { id: 'J-1', status: 'normal', location: 'MG Road' },
      { id: 'J-4', status: 'normal', location: 'Indiranagar' },
    ]
  },

  currentView: 'dashboard',
  selectedRequestId: null,
  activeRoute: null,

  setView: (view) => set({ currentView: view }),

  // --- FIRESTORE SUBSCRIPTIONS ---
  subscribeToRequests: () => {
    // 1. Subscribe to Emergencies
    const qReq = query(collection(db, 'emergencies'), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snapshot) => {
      const newRequests: EmergencyRequest[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          location: { lat: data.lat, lng: data.lng },
          status: data.status,
          type: data.type || 'Medical Emergency',
          priority: 'high',
          timestamp: data.createdAt?.toMillis() || Date.now(),
          hospitalAccepted: data.hospitalAccepted || false,
          assignedAmbulance: data.assignedAmbulance,
          eta: data.eta
        };
      });
      set({ requests: newRequests });
    });

    // 2. Subscribe to Fleet
    const unsubFleet = onSnapshot(collection(db, 'fleet'), (snapshot) => {
      const newFleet: Ambulance[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          driverName: data.driverName || 'Automated Unit',
          location: { lat: data.lat || 12.97, lng: data.lng || 77.59 },
          status: data.status || 'offline',
          assignedEmergencyId: data.assignedEmergencyId,
          eta: data.eta,
          lastUpdate: Date.now() // Timestamp whenever data arrives
        };
      });
      set({ fleet: newFleet });
    });

    return () => {
      unsubReq();
      unsubFleet();
    };
  },

  selectRequest: (id) => set({ selectedRequestId: id }),

  // NEW: Resolve/Delete Request
  resolveRequest: async (reqId) => {
    try {
      // 1. Find the request to see if an ambulance is assigned
      const reqDoc = get().requests.find(r => r.id === reqId);

      // 2. If an ambulance was assigned, free it
      if (reqDoc) {
        const assignedAmb = get().fleet.find(a => a.assignedEmergencyId === reqId);

        if (assignedAmb) {
          const fleetRef = doc(db, 'fleet', assignedAmb.id);
          await updateDoc(fleetRef, {
            status: 'available',
            assignedEmergencyId: null
          });
          get().addLog(`Unit ${assignedAmb.id} is now available.`, 'success');
        }
      }

      // 3. Return Drone to Base (Auto-return)
      const droneRef = doc(db, 'fleet', 'D-001');
      await setDoc(droneRef, { status: 'idle' }, { merge: true });
      get().updateDroneState({ state: 'idle' });

      // 4. Delete the request
      await deleteDoc(doc(db, 'emergencies', reqId));

      set((state) => ({
        selectedRequestId: state.selectedRequestId === reqId ? null : state.selectedRequestId,
        logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Request ${reqId} Resolved`, level: 'success', module: 'System' }, ...state.logs]
      }));
    } catch (e) {
      console.error("Error deleting request:", e);
    }
  },

  dispatchAmbulance: async (reqId, ambId) => {
    // Optimistic Update
    set((state) => ({
      logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Dispatched ${ambId} to Request ${reqId}`, level: 'info', module: 'Dispatch' }, ...state.logs]
    }));

    try {
      const reqRef = doc(db, 'emergencies', reqId);
      await updateDoc(reqRef, {
        status: 'dispatched',
        assignedAmbulance: ambId,
        hospitalAccepted: false,
        eta: '8 mins'
      });

      // Update Ambulance Status
      const fleetRef = doc(db, 'fleet', ambId);
      await updateDoc(fleetRef, {
        status: 'busy',
        assignedEmergencyId: reqId
      });

      // Auto-Launch Drone
      const droneRef = doc(db, 'fleet', 'D-001');
      await setDoc(droneRef, {
        status: 'launched',
        type: 'drone',
        lat: 13.168736,
        lng: 80.068330
      }, { merge: true });
      get().updateDroneState({ state: 'launched' });
      get().addLog("Drone D-001 Auto-Launched for support", 'info');

    } catch (error) {
      console.error("Failed to update Firestore:", error);
      get().addLog(`Failed to dispatch: ${error}`, 'critical');
    }
  },

  setRoute: (route) => set({ activeRoute: route }),

  toggleGreenCorridor: () => set((state) => ({
    traffic: {
      ...state.traffic,
      greenCorridor: !state.traffic.greenCorridor,
      junctions: state.traffic.junctions.map(j => ({ ...j, status: !state.traffic.greenCorridor ? 'cleared' : 'normal' }))
    },
    logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Green Corridor ${!state.traffic.greenCorridor ? 'ACTIVATED' : 'DEACTIVATED'}`, level: 'critical', module: 'System' }, ...state.logs]
  })),

  updateDroneState: async (updates) => {
    // 1. Local Optimistic Update
    set((state) => {
      const logs = updates.state ? [{ id: Date.now().toString(), timestamp: Date.now(), message: `Drone D-001 status: ${updates.state}`, level: 'info', module: 'Drone' } as SystemLog, ...state.logs] : state.logs;
      return {
        drone: { ...state.drone, ...updates },
        logs
      };
    });

    // 2. Persist to Firestore
    try {
      const droneRef = doc(db, 'fleet', 'D-001');
      // Use setDoc with merge to ensure document exists even if deleted
      await setDoc(droneRef, {
        status: updates.state || 'idle', // Map 'state' to 'status' for consistency
        lat: 13.168736, // Static base location for now
        lng: 80.068330,
        type: 'drone'
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync drone:", e);
    }
  },

  addLog: (msg, level) => set((state) => ({
    logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: msg, level: level, module: 'System' }, ...state.logs]
  }))

}));
