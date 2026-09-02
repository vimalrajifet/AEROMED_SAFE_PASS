import React from 'react';
import { Network, Cpu, Wifi, Radio, Zap } from 'lucide-react';

export const SystemStatus: React.FC = () => {
    const stats = [
        { icon: Network, label: 'Active Fleet', value: '4 Units' },
        { icon: Cpu, label: 'AeroMed AI', value: 'Neural-V9' },
        { icon: Wifi, label: 'Comms Link', value: '5G Hyper' },
        { icon: Radio, label: 'Drone Network', value: 'Connected' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-black">
            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-gray-200 flex items-center gap-1.5">
                <Zap size={15} className="text-black" />
                System Status
            </h3>
            <div className="space-y-2">
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <stat.icon size={15} className="text-black" />
                            <div>
                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">{stat.label}</p>
                                <p className="text-xs font-black text-black font-mono">{stat.value}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5 rounded uppercase">
                            ONLINE
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
