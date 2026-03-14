import React from 'react';
import { HospitalCapacity } from './HospitalCapacity';
import { SystemStatus } from './SystemStatus';
import { useHospitalStore } from '../../store/useHospitalStore';

export const HospitalStatus: React.FC = () => {
    const { logs } = useHospitalStore();

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1 custom-scrollbar">
            <HospitalCapacity />
            
            {/* Activity Log - Integrated into Status Panel */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl flex-1 flex flex-col min-h-[300px]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Real-time Command Logs</h3>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {logs.length === 0 ? (
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center mt-10 italic">Initializing Secure Link...</p>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 animate-in fade-in slide-in-from-right-2"
                            >
                                <span
                                    className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 animate-pulse shadow-[0_0_5px_currentColor] ${log.level === 'critical'
                                        ? 'text-red-500 bg-red-500'
                                        : log.level === 'warning'
                                            ? 'text-amber-500 bg-amber-500'
                                            : 'text-emerald-500 bg-emerald-500'
                                        }`}
                                />
                                <div className="flex-1">
                                    <p className="text-[11px] text-gray-300 font-medium leading-relaxed">{log.message}</p>
                                    <span className="text-[9px] text-gray-600 font-black uppercase mt-1 block">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <SystemStatus />
        </div>
    );
};
