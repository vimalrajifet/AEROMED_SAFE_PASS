import React from 'react';
import { Network, Cpu, Wifi, Radio, Zap } from 'lucide-react';

export const SystemStatus: React.FC = () => {
    const stats = [
        { icon: Network, label: 'Active Fleet', value: '4 Units', status: 'online' },
        { icon: Cpu, label: 'AeroMed AI', value: 'Neural-V9', status: 'online' },
        { icon: Wifi, label: 'Comms Link', value: '5G Hyper', status: 'online' },
        { icon: Radio, label: 'Drone Network', value: 'Connected', status: 'online' },
    ];

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" />
                System Core Metrics
            </h3>
            <div className="space-y-4">
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xs font-bold text-gray-200">{stat.value}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
