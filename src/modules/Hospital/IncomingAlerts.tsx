import React from 'react';
import { AlertTriangle, MapPin, ShieldCheck, Timer } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';

export const IncomingAlerts: React.FC = () => {
    const { emergencies, acceptedIds, acceptEmergency, selectedRequestId, setSelectedRequestId } = useHospitalStore();

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-4 h-full flex flex-col shadow-sm text-black">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">Emergency Queue</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black text-white tracking-wider">
                    {emergencies.length} ACTIVE
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {emergencies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <ShieldCheck size={40} className="mb-2 text-gray-300" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-600">No Active Alerts</p>
                    </div>
                ) : (
                    emergencies.map((em) => {
                        const isSelected = selectedRequestId === em.id;
                        const isAccepted = em.hospitalAccepted || acceptedIds.has(em.id);

                        return (
                            <div
                                key={em.id}
                                onClick={() => setSelectedRequestId(em.id)}
                                className={`relative p-3.5 rounded-lg border transition-all cursor-pointer ${
                                    isSelected 
                                    ? 'border-black bg-gray-100 shadow-sm ring-1 ring-black' 
                                    : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black text-white">
                                        {em.priority} PRIORITY
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 font-mono">
                                        <span className="flex items-center gap-1">
                                            <Timer size={11} />
                                            {em.eta}
                                        </span>
                                        <span>•</span>
                                        <span>{formatTime(em.timestamp)}</span>
                                    </div>
                                </div>

                                <h4 className="text-sm font-black text-black mb-1 uppercase tracking-tight">
                                    {em.type}
                                </h4>
                                <p className="text-[11px] text-gray-700 font-medium mb-3 flex items-center gap-1">
                                    <MapPin size={12} className="text-gray-600" />
                                    Distance: <span className="font-bold text-black font-mono">{em.distance}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={isAccepted}
                                        onClick={(e) => { e.stopPropagation(); acceptEmergency(em.id); }}
                                        className={`flex-1 py-1.5 rounded text-[10px] font-black tracking-wider uppercase transition-all ${
                                            isAccepted 
                                            ? 'bg-gray-200 text-black border border-gray-400 cursor-default' 
                                            : 'bg-black hover:bg-gray-800 text-white border border-black cursor-pointer'
                                        }`}
                                    >
                                        {isAccepted ? '✓ PATIENT ACCEPTED' : 'ACCEPT DISPATCH'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
