import React from 'react';
import { Plane, AlertTriangle, Video, Power } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const DronePanel: React.FC = () => {
  const { drone, updateDroneState } = useAppStore();
  const { t } = useLanguageStore();

  const toggleState = () => {
    const newState = drone.state === 'idle' ? 'launched' : 'idle';
    updateDroneState({ state: newState });
  };

  const toggleObstacle = () => {
    updateDroneState({ isObstacleDetected: !drone.isObstacleDetected });
  };

  return (
    <div className="bg-dashboard-card rounded-xl border border-white/10 p-4 flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 flex items-center">
            <Plane size={16} className="mr-2 text-blue-400" />
            {t('dronePanel.title')}
          </h3>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${drone.state === 'launched' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-700 text-gray-400 border-gray-600'
              }`}>
              {drone.state}
            </span>
            {drone.isObstacleDetected && (
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse flex items-center">
                <AlertTriangle size={10} className="mr-1" /> {t('dronePanel.obstacle')}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleState}
            className={`p-2 rounded-lg border transition-all ${drone.state === 'launched'
                ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                : 'bg-blue-500/10 border-blue-500/50 text-blue-500 hover:bg-blue-500/20'
              }`}
            title={drone.state === 'launched' ? t('dronePanel.returnToBase') : t('dronePanel.launchDrone')}
          >
            <Power size={18} />
          </button>
          <button
            onClick={toggleObstacle}
            className={`p-2 rounded-lg border transition-all ${drone.isObstacleDetected
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            title={t('dronePanel.simulateObstacle')}
          >
            <AlertTriangle size={18} />
          </button>
        </div>
      </div>

      {/* Video Placeholder */}
      <div className="mt-2 flex-1 bg-black rounded border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 z-10 space-x-2">
          <Video size={14} />
          <span>{t('dronePanel.liveFeed')}</span>
        </div>
        {drone.state === 'launched' && (
          <div className="absolute inset-0 bg-noise opacity-20 animate-pulse"></div>
        )}
        {/* Static lines overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>
    </div>
  );
};