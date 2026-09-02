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
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-black space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                    <Users size={15} className="text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">Emergency Medical Team</h3>
                </div>
                <span className="text-[9px] text-gray-700 font-bold uppercase tracking-wider">AI ALLOCATED</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {teamReadiness.suggested.map((role, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${teamReadiness.confirmed ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                            <UserCheck size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-black uppercase tracking-tight truncate">{role}</span>
                    </div>
                ))}
            </div>

            <button
                disabled={teamReadiness.confirmed}
                onClick={() => confirmTeamReadiness(emergency.id)}
                className={`w-full py-2.5 rounded-lg border font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                    teamReadiness.confirmed 
                    ? 'bg-gray-200 border-gray-400 text-black cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800 border-black text-white cursor-pointer shadow-sm'
                }`}
            >
                <ShieldCheck size={15} />
                {teamReadiness.confirmed ? 'TEAM READY & ON STANDBY' : 'CONFIRM TEAM READINESS'}
            </button>
        </div>
    );
};
