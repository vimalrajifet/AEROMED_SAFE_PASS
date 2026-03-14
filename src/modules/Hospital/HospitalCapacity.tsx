import React from 'react';
import { LayoutGrid, Bed, Wind, Activity } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';

export const HospitalCapacity: React.FC = () => {
    const { capacity } = useHospitalStore();

    const items = [
        { icon: Bed, label: 'ICU Beds', ...capacity.icuBeds, color: 'text-blue-400' },
        { icon: LayoutGrid, label: 'Emergency Beds', ...capacity.emergencyBeds, color: 'text-emerald-400' },
        { icon: Wind, label: 'Ventilators', ...capacity.ventilators, color: 'text-amber-400' },
        { icon: Activity, label: 'Op. Theatres', ...capacity.operationTheatres, color: 'text-purple-400' },
    ];

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Hospital Readiness Status</h3>
            <div className="grid grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <item.icon size={32} className={item.color} />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">{item.label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${item.available > 0 ? 'text-white' : 'text-red-500'}`}>{item.available}</span>
                                <span className="text-xs text-gray-600 font-bold">/ {item.total}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full mt-3">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        (item.available / item.total) > 0.5 ? 'bg-emerald-500' : (item.available / item.total) > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${(item.available / item.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
