import React from 'react';
import { Users, ShieldCheck, UserCheck } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';
import type { EmergencyRequest } from '../../types';

interface TeamPreparationProps {
    emergency: EmergencyRequest;
}

export const TeamPreparation: React.FC<TeamPreparationProps> = ({ emergency }) => {
    const { confirmTeamReadiness } = useHospitalStore();
    const { teamReadiness } = emergency;

    if (!teamReadiness) return null;

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Emergency Team Prep</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">AI SUGGESTED</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {teamReadiness.suggested.map((role, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${teamReadiness.confirmed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            <UserCheck size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{role}</span>
                    </div>
                ))}
            </div>

            <button
                disabled={teamReadiness.confirmed}
                onClick={() => confirmTeamReadiness(emergency.id)}
                className={`w-full py-3 rounded-xl border font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                    teamReadiness.confirmed 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600/40 to-blue-600/40 border-indigo-500/40 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20'
                }`}
            >
                <ShieldCheck size={18} />
                {teamReadiness.confirmed ? 'TEAM READY & STANDBY' : 'CONFIRM TEAM READINESS'}
            </button>
        </div>
    );
};
