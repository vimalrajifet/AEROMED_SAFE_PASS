import React, { useState } from 'react';
import { AlertCircle, Plus, MapPin, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const RequestPanel: React.FC = () => {
  const { requests, selectRequest, selectedRequestId, resolveRequest } = useAppStore();
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(false);

  const handleCreateRequest = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'emergencies'), {
        type: 'Medical Emergency',
        status: 'new',
        createdAt: serverTimestamp(),
        lat: 12.9716 + (Math.random() - 0.5) * 0.05,
        lng: 77.5946 + (Math.random() - 0.5) * 0.05,
        userId: 'DASHBOARD_TEST'
      });
    } catch (e) {
      console.error("Error creating request:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dashboard-card rounded-xl border border-white/10 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-900/20 to-transparent">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <AlertCircle size={20} className="mr-2 text-red-500" />
          {t('requestPanel.activeEmergencies')}
        </h3>
      </div>

      <div className="p-4 border-b border-white/10">
        <button
          onClick={handleCreateRequest}
          disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg font-bold text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center justify-center"
        >
          {loading ? <span className="animate-pulse">{t('requestPanel.locating')}</span> : (
            <>
              <Plus size={18} className="mr-2" />
              {t('requestPanel.createEmergency')}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-2 scrollbar-thin">
        {requests.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic">{t('requestPanel.noActiveRequests')}</div>
        )}
        {requests.map(req => (
          <div
            key={req.id}
            onClick={() => selectRequest(req.id)}
            className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${selectedRequestId === req.id
                ? 'bg-red-500/10 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
          >
            {req.status === 'new' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>
            )}

            <div className="flex justify-between items-start mb-1 pl-2">
              <span className="font-bold text-white group-hover:text-red-400 transition-colors truncate max-w-[120px]">{req.id}</span>
              <div className="flex space-x-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${req.status === 'new' ? 'bg-red-500 text-white border-red-400' :
                    req.status === 'dispatched' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                  {req.status}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); resolveRequest(req.id); }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title={t('requestPanel.removeRequest')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="pl-2 space-y-1">
              <div className="flex items-center text-xs text-gray-400">
                <MapPin size={12} className="mr-1.5" />
                {req.location.lat.toFixed(4)}, {req.location.lng.toFixed(4)}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1.5" />
                {new Date(req.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};