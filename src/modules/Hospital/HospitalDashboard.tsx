import React, { useEffect } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { IncomingAlerts } from './IncomingAlerts';
import { HospitalStatus } from './HospitalStatus';
import { PatientAlertCard } from './PatientAlertCard';
import { AmbulanceTracker } from './AmbulanceTracker';
import { EmergencyTimeline } from './EmergencyTimeline';
import { TeamPreparation } from './TeamPreparation';
import { HospitalMap } from './HospitalMap';
import { ShieldCheck, Activity, Zap } from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
    const { subscribeAll, emergencies, selectedRequestId } = useHospitalStore();

    useEffect(() => {
        const unsub = subscribeAll();
        return () => unsub();
    }, [subscribeAll]);

    const selectedEmergency = emergencies.find(e => e.id === selectedRequestId) || emergencies[0];

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white p-4 gap-4 overflow-hidden">
            {/* Header / Top Banner */}
            <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-pulse">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                            AeroMed <span className="text-indigo-400">SafePass</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 not-italic tracking-widest font-black ml-2">V2.0 COMMAND</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Emergency Response Management System</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <HeaderStat icon={Activity} label="System Pulse" value="NOMINAL" color="text-emerald-400" />
                    <HeaderStat icon={Zap} label="Response Latency" value="14ms" color="text-indigo-400" />
                    <div className="pl-6 border-l border-white/10">
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Live Clock</p>
                        <p className="text-lg font-black tracking-widest tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                
                {/* LEFT: EMERGENCY QUEUE */}
                <section className="lg:col-span-3 flex flex-col min-h-0">
                    <IncomingAlerts />
                </section>

                {/* CENTER: COORDINATION HUB */}
                <section className="lg:col-span-6 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar">
                    {selectedEmergency ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AmbulanceTracker emergency={selectedEmergency} />
                                <TeamPreparation emergency={selectedEmergency} />
                            </div>
                            
                            <PatientAlertCard emergency={selectedEmergency} />
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[350px]">
                                <EmergencyTimeline emergency={selectedEmergency} />
                                <div className="flex flex-col gap-4">
                                    <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                        <HospitalMap />
                                        <div className="absolute top-4 right-4 z-[400] px-3 py-1 bg-black/80 backdrop-blur rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                            Tactical Map View
                                        </div>
                                    </div>
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Hospital Entry Code</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black tracking-[0.5em] text-white">SP-0922</span>
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-black">BAY READY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 border-dashed">
                            <Activity size={64} className="text-gray-800 animate-pulse mb-4" />
                            <p className="text-gray-500 font-black uppercase tracking-widest">Select an Active Emergency to view Intel</p>
                        </div>
                    )}
                </section>

                {/* RIGHT: READINESS & LOGS */}
                <section className="lg:col-span-3 flex flex-col min-h-0">
                    <HospitalStatus />
                </section>

            </main>
        </div>
    );
};

const HeaderStat = ({ icon: Icon, label, value, color }: any) => (
    <div className="text-right">
        <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</span>
            <Icon size={12} className={color} />
        </div>
        <p className={`text-sm font-black tracking-widest ${color}`}>{value}</p>
    </div>
);
