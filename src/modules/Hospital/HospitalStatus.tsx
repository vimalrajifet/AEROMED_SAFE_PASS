import React from 'react';
import { HospitalCapacity } from './HospitalCapacity';
import { SystemStatus } from './SystemStatus';
import { useHospitalStore } from '../../store/useHospitalStore';

export const HospitalStatus: React.FC = () => {
    const { logs } = useHospitalStore();

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-0.5 custom-scrollbar text-black">
            <HospitalCapacity />
            
            {/* Activity Log - Integrated into Status Panel */}
            <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm flex-1 flex flex-col min-h-[220px]">
                <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-gray-200">
                    Hospital Event Logs
                </h3>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {logs.length === 0 ? (
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center mt-6 italic">No recent log entries</p>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-200"
                            >
                                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-black flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-black font-semibold leading-snug">{log.message}</p>
                                    <span className="text-[9px] text-gray-700 font-bold uppercase font-mono mt-0.5 block">
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
