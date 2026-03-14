import React from 'react';
import { Activity, Thermometer, Droplets, Zap, Brain } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface PatientAlertCardProps {
    emergency: EmergencyRequest;
}

export const PatientAlertCard: React.FC<PatientAlertCardProps> = ({ emergency }) => {
    const { vitals, aiPrediction, priority } = emergency;

    if (!vitals || !aiPrediction) return null;

    const priorityColors = {
        critical: 'text-red-500 border-red-500/50 bg-red-500/10',
        high: 'text-orange-500 border-orange-500/50 bg-orange-500/10',
        stable: 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10',
    };

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`px-4 py-2 border-b flex items-center justify-between ${priorityColors[priority]}`}>
                <div className="flex items-center gap-2">
                    <Activity size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Live Patient Vitals</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span className="text-[10px] font-bold">STREAMING</span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <VitalBox icon={Activity} label="Heart Rate" value={vitals.hr} unit="BPM" color="text-red-400" />
                <VitalBox icon={Droplets} label="SpO2" value={vitals.spo2} unit="%" color="text-blue-400" />
                <VitalBox icon={Zap} label="Blood Press." value={vitals.bp || '--'} unit="" color="text-purple-400" />
                <VitalBox icon={Thermometer} label="Temp" value={vitals.temp || '--'} unit="°C" color="text-amber-400" />
            </div>

            <div className="mx-4 mb-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-3 text-indigo-300">
                    <Brain size={20} className="animate-pulse" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">AeroMed AI Diagnosis</h4>
                </div>
                <div className="space-y-3">
                    <div>
                        <p className="text-[10px] text-indigo-400/70 uppercase font-bold">Predicted Condition</p>
                        <p className="text-white font-medium">{aiPrediction.condition}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-indigo-400/70 uppercase font-bold mb-1.5">Required Preparation</p>
                        <div className="flex flex-wrap gap-2">
                            {aiPrediction.requiredPrep.map((prep, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-200">
                                    {prep}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VitalBox = ({ icon: Icon, label, value, unit, color }: any) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5">
        <Icon size={16} className={`${color} mb-1`} />
        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{label}</span>
        <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-white">{value}</span>
            <span className="text-[9px] text-gray-500 font-bold">{unit}</span>
        </div>
    </div>
);
