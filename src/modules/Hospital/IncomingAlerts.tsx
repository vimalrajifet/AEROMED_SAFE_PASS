import React from 'react';
import { AlertTriangle, MapPin, ShieldCheck, Timer } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';

export const IncomingAlerts: React.FC = () => {
    const { emergencies, acceptedIds, acceptEmergency, selectedRequestId, setSelectedRequestId } = useHospitalStore();

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const priorityStyles = {
        critical: 'border-red-500/50 bg-red-500/10 text-red-500 shadow-red-500/20',
        high: 'border-orange-500/50 bg-orange-500/10 text-orange-500 shadow-orange-500/20',
        stable: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20',
    };

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Emergency Dispatch Queue</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/5 border border-white/10 text-gray-400 tracking-widest">
                    {emergencies.length} ACTIVE
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {emergencies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <ShieldCheck size={48} className="mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No Active Alerts</p>
                    </div>
                ) : (
                    emergencies.map((em) => {
                        const isSelected = selectedRequestId === em.id;
                        const isAccepted = em.hospitalAccepted || acceptedIds.has(em.id);
                        const style = priorityStyles[em.priority];

                        return (
                            <div
                                key={em.id}
                                onClick={() => setSelectedRequestId(em.id)}
                                className={`relative p-4 rounded-xl border transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                    isSelected ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 shadow-2xl bg-indigo-500/5' : 'bg-white/5 border-white/5'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${style}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {em.priority}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold">
                                            <Timer size={10} />
                                            {em.eta}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-bold">{formatTime(em.timestamp)}</div>
                                    </div>
                                </div>

                                <h4 className="text-sm font-black text-white mb-1 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                    {em.type}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-medium mb-3 flex items-center gap-1">
                                    <MapPin size={10} />
                                    Current Distance: <span className="text-gray-300">{em.distance}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={isAccepted}
                                        onClick={(e) => { e.stopPropagation(); acceptEmergency(em.id); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                                            isAccepted 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/40'
                                        }`}
                                    >
                                        {isAccepted ? '✓ Patient Accepted' : 'Accept Dispatch'}
                                    </button>
                                    {!isAccepted && (
                                        <button className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black hover:bg-red-500/20 transition-all uppercase tracking-widest">
                                            Reject
                                        </button>
                                    )}
                                </div>

                                {isSelected && (
                                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
