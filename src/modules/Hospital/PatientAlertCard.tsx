import React from 'react';
import { Activity, Thermometer, Droplets, Zap, Brain } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface PatientAlertCardProps {
    emergency: EmergencyRequest;
}

export const PatientAlertCard: React.FC<PatientAlertCardProps> = ({ emergency }) => {
    const { vitals, aiPrediction } = emergency;

    if (!vitals || !aiPrediction) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm text-black">
            <div className="px-4 py-2.5 bg-black text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">Live Patient Telemetry & Vitals</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>STREAMING</span>
                </div>
            </div>

            <div className="p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border-b border-gray-200">
                <VitalBox icon={Activity} label="Heart Rate" value={vitals.hr} unit="BPM" />
                <VitalBox icon={Droplets} label="SpO2" value={vitals.spo2} unit="%" />
                <VitalBox icon={Zap} label="Blood Press." value={vitals.bp || '--'} unit="" />
                <VitalBox icon={Thermometer} label="Body Temp" value={vitals.temp || '--'} unit="°C" />
            </div>

            <div className="p-3.5 bg-white">
                <div className="flex items-center gap-2 mb-2 text-black">
                    <Brain size={16} />
                    <h4 className="text-xs font-black uppercase tracking-wider">AeroMed AI Clinical Assessment</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-gray-100 border border-gray-200">
                        <p className="text-[10px] text-gray-700 uppercase font-black mb-0.5">Predicted Condition</p>
                        <p className="text-black font-bold">{aiPrediction.condition}</p>
                    </div>
                    <div className="p-2.5 rounded bg-gray-100 border border-gray-200">
                        <p className="text-[10px] text-gray-700 uppercase font-black mb-1">Required Bay Prep</p>
                        <div className="flex flex-wrap gap-1.5">
                            {aiPrediction.requiredPrep.map((prep, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-bold">
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

const VitalBox = ({ icon: Icon, label, value, unit }: any) => (
    <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-white border border-gray-300 shadow-sm text-center">
        <Icon size={14} className="text-black mb-1" />
        <span className="text-[9px] text-gray-700 uppercase font-bold tracking-tight">{label}</span>
        <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-lg font-black text-black font-mono">{value}</span>
            <span className="text-[9px] text-gray-700 font-bold">{unit}</span>
        </div>
    </div>
);
