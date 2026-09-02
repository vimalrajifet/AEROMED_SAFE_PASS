import { create } from 'zustand';
import {
    collection, onSnapshot, doc, updateDoc, setDoc,
    orderBy, query, Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EmergencyRequest, Ambulance, SystemLog, HospitalCapacity, EmergencyPriority } from '../types';

// ── Config ────────────────────────────────────────────────────────
const AMBULANCE_ID = 'AMB-01';
const AMBULANCE_LAT = 13.168736;
const AMBULANCE_LNG = 80.068330;
const HOSPITAL_LAT = 13.182033;
const HOSPITAL_LNG = 80.118029;

interface HospitalState {
    emergencies: EmergencyRequest[];
    fleet: Ambulance[];
    logs: SystemLog[];
    acceptedIds: Set<string>;
    selectedRequestId: string | null;
    capacity: HospitalCapacity;

    subscribeAll: () => () => void;
    seedAmbulance: () => Promise<void>;
    acceptEmergency: (id: string) => Promise<void>;
    addLog: (msg: string, level: SystemLog['level']) => void;
    setSelectedRequestId: (id: string | null) => void;
    updateCapacity: (newCap: Partial<HospitalCapacity>) => void;
    confirmTeamReadiness: (id: string) => void;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
    emergencies: [],
    fleet: [],
    logs: [],
    acceptedIds: new Set(),
    selectedRequestId: null,
    capacity: {
        icuBeds: { total: 20, available: 4 },
        emergencyBeds: { total: 15, available: 2 },
        ventilators: { total: 10, available: 3 },
        operationTheatres: { total: 5, available: 1 },
    },

    subscribeAll: () => {
        // Seed the single ambulance on first load
        get().seedAmbulance();

        // 1. Emergencies
        const qEmergencies = query(
            collection(db, 'emergencies'),
            orderBy('createdAt', 'desc')
        );
        const unsubEmergencies = onSnapshot(qEmergencies, (snap) => {
            const items: EmergencyRequest[] = snap.docs.map((d) => {
                const data = d.data();
                const type = data.type || 'Medical Emergency';
                
                // Enhanced priority logic
                let priority: EmergencyPriority = 'stable';
                if (type.toLowerCase().includes('cardiac') || type.toLowerCase().includes('respiratory') || type.toLowerCase().includes('arrest')) {
                    priority = 'critical';
                } else if (type.toLowerCase().includes('accident') || type.toLowerCase().includes('trauma')) {
                    priority = 'high';
                }

                return {
                    id: d.id,
                    location: { lat: data.lat, lng: data.lng },
                    status: data.status,
                    type,
                    priority,
                    timestamp: data.createdAt?.toMillis?.() || Date.now(),
                    assignedAmbulance: data.assignedAmbulance,
                    eta: data.eta || '8 mins',
                    distance: data.distance || '2.4 km',
                    patientCondition: data.patientCondition || (priority === 'critical' ? 'Unstable - Immediate Intervention Required' : 'Guarded Stability'),
                    hospitalAccepted: data.hospitalAccepted || false,
                    vitals: data.vitals || {
                        hr: priority === 'critical' ? 128 : 94,
                        spo2: priority === 'critical' ? 89 : 96,
                        bp: priority === 'critical' ? '155/105' : '120/80',
                        temp: 37.5
                    },
                    aiPrediction: data.aiPrediction || {
                        condition: priority === 'critical' ? 'Potential STEMI / Acute Cardiac Failure' : 'Multiple Soft Tissue Injuries',
                        requiredPrep: priority === 'critical' 
                            ? ['Activate Cath Lab', 'Cardiology Team Standby', 'Ventilator Prep']
                            : ['Trauma Bay 1 Ready', 'Orthopedic Consult', 'X-Ray Standby']
                    },
                    teamReadiness: data.teamReadiness || {
                        suggested: priority === 'critical' 
                            ? ['Cardiologist', 'Anesthesiologist', 'Senior RN', 'ICU Specialist']
                            : ['Trauma Surgeon', 'Emergency Physician', 'Triage Nurse'],
                        confirmed: data.hospitalAccepted || false
                    },
                    timeline: data.timeline || [
                        { event: 'Emergency Call Received', timestamp: Date.now() - 900000, status: 'completed' },
                        { event: 'Ambulance Dispatched', timestamp: Date.now() - 720000, status: 'completed' },
                        { event: 'Drone Scout Launched', timestamp: Date.now() - 600000, status: 'completed' },
                        { event: 'Hospital Alerted', timestamp: Date.now() - 120000, status: 'completed' },
                        { event: 'Estimated Arrival', timestamp: Date.now() + 480000, status: 'upcoming' },
                    ],
                    routeStatus: 'Optimal - Traffic Cleared'
                };
            });

            // Auto-log new emergencies
            const prev = get().emergencies;
            const prevIds = new Set(prev.map((e) => e.id));
            items.forEach((e) => {
                if (!prevIds.has(e.id)) {
                    get().addLog(`🚨 EMERGENCY ALERT: ${e.type} (${e.priority.toUpperCase()})`, e.priority === 'critical' ? 'critical' : 'warning');
                    if (!get().selectedRequestId) {
                        set({ selectedRequestId: e.id });
                    }
                }
            });

            set({ emergencies: items });
        });

        // 2. Fleet
        const unsubFleet = onSnapshot(collection(db, 'fleet'), (snap) => {
            const items: Ambulance[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    driverName: data.driverName || 'Unit',
                    location: { lat: data.lat || AMBULANCE_LAT, lng: data.lng || AMBULANCE_LNG },
                    status: data.status || 'offline',
                    assignedEmergencyId: data.assignedEmergencyId,
                    eta: data.eta,
                    lastUpdate: Date.now(),
                };
            });
            set({ fleet: items });
        });

        return () => {
            unsubEmergencies();
            unsubFleet();
        };
    },

    seedAmbulance: async () => {
        try {
            await setDoc(
                doc(db, 'fleet', AMBULANCE_ID),
                {
                    driverName: 'AeroMed SafePass Unit 1',
                    lat: AMBULANCE_LAT,
                    lng: AMBULANCE_LNG,
                    status: 'available',
                    type: 'ambulance',
                },
                { merge: true }
            );
        } catch (e) {
            console.error('Seed ambulance failed:', e);
        }
    },

    acceptEmergency: async (id) => {
        // Immediate local state update
        set((s) => {
            const next = new Set(s.acceptedIds);
            next.add(id);
            const updatedEmergencies = s.emergencies.map(e => 
                e.id === id ? { ...e, hospitalAccepted: true, status: 'dispatched' as const } : e
            );
            return { acceptedIds: next, emergencies: updatedEmergencies };
        });

        const em = get().emergencies.find(e => e.id === id);
        get().addLog(`✓ Hospital Readiness Confirmed for ${em?.type || id}`, 'success');

        try {
            const ambId = em?.assignedAmbulance || AMBULANCE_ID;

            await updateDoc(doc(db, 'emergencies', id), {
                status: 'dispatched',
                assignedAmbulance: ambId,
                hospitalAccepted: true,
                hospitalAcceptTime: Timestamp.now(),
                hospitalLat: HOSPITAL_LAT,
                hospitalLng: HOSPITAL_LNG,
            });

            await updateDoc(doc(db, 'fleet', ambId), {
                status: 'busy',
                assignedEmergencyId: id,
            });
        } catch (e) {
            console.warn('Firebase sync note (running locally):', e);
        }
    },

    addLog: (msg, level) =>
        set((s) => ({
            logs: [
                {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    message: msg,
                    level,
                    module: 'System' as const,
                },
                ...s.logs,
            ].slice(0, 50),
        })),

    setSelectedRequestId: (id) => set({ selectedRequestId: id }),

    updateCapacity: (newCap) => set((s) => ({ capacity: { ...s.capacity, ...newCap } })),

    confirmTeamReadiness: (id) => set((s) => ({
        emergencies: s.emergencies.map(e => e.id === id ? {
            ...e, teamReadiness: e.teamReadiness ? { ...e.teamReadiness, confirmed: true } : undefined
        } : e)
    })),
}));
