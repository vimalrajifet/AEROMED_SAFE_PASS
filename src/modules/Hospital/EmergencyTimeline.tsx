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
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-amber-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Emergency Timeline</h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Arrival Countdown</p>
                    <p className="text-xl font-black text-amber-400 animate-pulse">{eta || '00:00'}</p>
                </div>
            </div>

            <div className="relative space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-white/5" />

                {timeline.map((event, i) => (
                    <div key={i} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className={`mt-1.5 z-10 flex-shrink-0 rounded-full transition-all duration-500 ${
                            event.status === 'completed' 
                                ? 'text-emerald-500 bg-black scale-110 shadow-[0_0_10px_#10b981]' 
                                : event.status === 'current'
                                    ? 'text-amber-500 bg-black animate-pulse scale-125 shadow-[0_0_10px_#f59e0b]'
                                    : 'text-gray-700 bg-black'
                        }`}>
                            {event.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-0.5">
                                <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${
                                    event.status === 'completed' ? 'text-emerald-400' : event.status === 'current' ? 'text-amber-400' : 'text-gray-500'
                                }`}>
                                    {event.event}
                                </h4>
                                <span className="text-[9px] font-black text-gray-600 whitespace-nowrap">
                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        event.status === 'completed' ? 'bg-emerald-500 w-full' : event.status === 'current' ? 'bg-amber-500 w-1/2' : 'bg-transparent w-0'
                                    }`} 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Arrival Checklist</h4>
                <div className="space-y-2">
                    <CheckItem label="Prepare ICU Bay" completed={true} />
                    <CheckItem label="Confirm Cardiology Team" completed={emergency.teamReadiness?.confirmed || false} />
                    <CheckItem label="Clear Path to ER" completed={true} />
                    <CheckItem label="Prepare Portable Ventilator" completed={false} />
                </div>
            </div>
        </div>
    );
};

const CheckItem = ({ label, completed }: { label: string, completed: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
            completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
        }`}>
            {completed && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
        </div>
        <span className={`text-[10px] font-bold ${completed ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
    </div>
);
