import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalStore } from '../../store/useHospitalStore';
import { IncomingAlerts } from './IncomingAlerts';
import { HospitalStatus } from './HospitalStatus';
import { PatientAlertCard } from './PatientAlertCard';
import { AmbulanceTracker } from './AmbulanceTracker';
import { EmergencyTimeline } from './EmergencyTimeline';
import { TeamPreparation } from './TeamPreparation';
import { HospitalMap } from './HospitalMap';
import { ShieldCheck, Activity, Zap, ArrowLeft } from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
    const { subscribeAll, emergencies, selectedRequestId } = useHospitalStore();
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = subscribeAll();
        return () => unsub();
    }, [subscribeAll]);

    const selectedEmergency = emergencies.find(e => e.id === selectedRequestId) || emergencies[0];

    return (
        <div className="flex flex-col h-full bg-gray-50 text-black p-3 sm:p-4 gap-3 overflow-hidden font-sans">
            {/* Header / Top Banner */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 bg-white border border-gray-300 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Return to CAD Ambulance Dashboard */}
                    <button
                        onClick={() => navigate('/')}
                        title="Back to CAD Ambulance Dashboard"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                        <ArrowLeft size={14} />
                        <span>Ambulance CAD</span>
                    </button>

                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
                        <ShieldCheck size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight uppercase flex items-center gap-2 text-black leading-none">
                            AeroMed SafePass
                            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                Hospital Unit (HU)
                            </span>
                        </h1>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider mt-1">Emergency Department & Trauma Reception</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-6">
                    <HeaderStat icon={Activity} label="System Status" value="ONLINE" color="text-black" />
                    <HeaderStat icon={Zap} label="Network Link" value="ACTIVE" color="text-black" />
                    <div className="pl-6 border-l border-gray-300">
                        <p className="text-[10px] text-gray-700 font-black uppercase mb-0.5">Live Clock</p>
                        <p className="text-base font-black tracking-widest tabular-nums text-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                
                {/* LEFT: EMERGENCY QUEUE */}
                <section className="lg:col-span-3 flex flex-col min-h-0">
                    <IncomingAlerts />
                </section>

                {/* CENTER: COORDINATION HUB */}
                <section className="lg:col-span-6 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
                    {selectedEmergency ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <AmbulanceTracker emergency={selectedEmergency} />
                                <TeamPreparation emergency={selectedEmergency} />
                            </div>
                            
                            <PatientAlertCard emergency={selectedEmergency} />
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[320px]">
                                <EmergencyTimeline emergency={selectedEmergency} />
                                <div className="flex flex-col gap-3">
                                    <div className="flex-1 rounded-xl overflow-hidden border border-gray-300 shadow-sm relative group bg-white">
                                        <HospitalMap />
                                        <div className="absolute top-3 right-3 z-[400] px-2.5 py-1 bg-white/95 border border-black/30 rounded-md text-[9px] font-black uppercase tracking-wider text-black shadow-sm">
                                            Tactical Map View
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-300 p-3.5 rounded-xl shadow-sm">
                                        <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-wider mb-1">Hospital Emergency Bay Code</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-mono font-black tracking-widest text-black">BAY-01 / ER</span>
                                            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">RECEPTION READY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 p-8 shadow-sm">
                            <Activity size={48} className="text-gray-400 animate-pulse mb-3" />
                            <p className="text-black font-black uppercase text-xs tracking-wider">Select an Active Emergency from the Queue</p>
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

const HeaderStat = ({ icon: Icon, label, value }: any) => (
    <div className="text-right">
        <div className="flex items-center justify-end gap-1.5 mb-0.5">
            <span className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{label}</span>
            <Icon size={12} className="text-black" />
        </div>
        <p className="text-xs font-black tracking-wider text-black">{value}</p>
    </div>
);
