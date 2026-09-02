import React from 'react';
import { LayoutGrid, Bed, Wind, Activity } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';

export const HospitalCapacity: React.FC = () => {
    const { capacity } = useHospitalStore();

    const items = [
        { icon: Bed, label: 'ICU Beds', ...capacity.icuBeds },
        { icon: LayoutGrid, label: 'ER Beds', ...capacity.emergencyBeds },
        { icon: Wind, label: 'Ventilators', ...capacity.ventilators },
        { icon: Activity, label: 'Op. Theatres', ...capacity.operationTheatres },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-black">
            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-gray-200">
                Hospital Readiness Capacity
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
                {items.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{item.label}</span>
                            <item.icon size={15} className="text-black" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-black text-black font-mono">{item.available}</span>
                            <span className="text-[10px] text-gray-700 font-bold font-mono">/ {item.total}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div 
                                className="h-full bg-black rounded-full transition-all duration-500"
                                style={{ width: `${(item.available / item.total) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
