import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface EmergencyTimelineProps {
    emergency: EmergencyRequest;
}

export const EmergencyTimeline: React.FC<EmergencyTimelineProps> = ({ emergency }) => {
    const { timeline, eta } = emergency;

    if (!timeline) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm flex flex-col h-full text-black">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">Emergency Timeline</h3>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-700 uppercase font-black">Arrival Countdown</p>
                    <p className="text-base font-black text-black font-mono">{eta || '00:00'}</p>
                </div>
            </div>

            <div className="relative space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-gray-200" />

                {timeline.map((event, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                        <div className={`mt-0.5 z-10 flex-shrink-0 rounded-full transition-all ${
                            event.status === 'completed' 
                                ? 'text-black bg-white' 
                                : event.status === 'current'
                                    ? 'text-black bg-gray-200'
                                    : 'text-gray-400 bg-white'
                        }`}>
                            {event.status === 'completed' ? <CheckCircle2 size={18} className="text-black" /> : <Circle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-0.5">
                                <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${
                                    event.status === 'completed' || event.status === 'current' ? 'text-black font-black' : 'text-gray-600'
                                }`}>
                                    {event.event}
                                </h4>
                                <span className="text-[9px] font-bold text-gray-700 font-mono whitespace-nowrap">
                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                <h4 className="text-[10px] text-gray-700 uppercase font-black tracking-wider">Arrival Checklist</h4>
                <div className="space-y-1.5">
                    <CheckItem label="Prepare ICU Trauma Bay" completed={true} />
                    <CheckItem label="Confirm Cardiology Medical Team" completed={emergency.teamReadiness?.confirmed || false} />
                    <CheckItem label="Clear Dedicated Corridor to ER" completed={true} />
                    <CheckItem label="Standby Portable Ventilator" completed={false} />
                </div>
            </div>
        </div>
    );
};

const CheckItem = ({ label, completed }: { label: string, completed: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
            completed ? 'bg-black border-black text-white' : 'border-gray-400 bg-white'
        }`}>
            {completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
        </div>
        <span className={`text-[10px] font-bold ${completed ? 'text-black' : 'text-gray-600'}`}>{label}</span>
    </div>
);
