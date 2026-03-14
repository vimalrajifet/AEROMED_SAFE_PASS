import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface AmbulanceTrackerProps {
    emergency: EmergencyRequest;
}

export const AmbulanceTracker: React.FC<AmbulanceTrackerProps> = ({ emergency }) => {
    const { eta, distance, assignedAmbulance } = emergency;

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Navigation size={18} className="text-blue-400 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Ambulance Real-time Tracking</h3>
                </div>
                {assignedAmbulance && (
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                        Unit: {assignedAmbulance}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <MapPin size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Distance</span>
                    </div>
                    <p className="text-2xl font-black text-white">{distance || '--'}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-white/5">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                        <Clock size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Estimated Arrival</span>
                    </div>
                    <p className="text-2xl font-black text-white">{eta || '--'}</p>
                </div>
            </div>
        </div>
    );
};
