import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AlertCircle, Loader2, Navigation, CheckCircle2, Siren } from 'lucide-react';

export const MobileApp: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'locating' | 'tracking'>('idle');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // --- LOGIC: CREATE EMERGENCY ---
  const handleSOS = async () => {
    setStatus('locating');
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setStatus('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const docRef = await addDoc(collection(db, 'emergencies'), {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            status: 'new',
            createdAt: serverTimestamp(),
            type: 'Medical Emergency',
            source: 'web-mobile'
          });
          
          setRequestId(docRef.id);
          setStatus('tracking');
        } catch (e) {
          setError("Failed to send request. Check connection.");
          setStatus('idle');
        }
      },
      () => {
        setError("Location access denied. Please enable GPS.");
        setStatus('idle');
      },
      { enableHighAccuracy: true }
    );
  };

  // --- LOGIC: TRACK STATUS ---
  useEffect(() => {
    if (!requestId) return;

    const unsub = onSnapshot(doc(db, 'emergencies', requestId), (doc) => {
      if (doc.exists()) {
        setRequestData(doc.data());
      }
    });

    return () => unsub();
  }, [requestId]);

  // --- UI: STATUS TRACKER ---
  if (status === 'tracking' && requestData) {
    const reqStatus = requestData.status || 'new';
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col font-sans">
        <div className="flex justify-center mb-8 pt-4">
           <div className="flex items-center text-red-500 font-bold text-xl tracking-wider">
             <Siren className="mr-2" /> AEROMED
           </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl flex-1 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          {/* Background Pulse for Dispatched */}
          {reqStatus === 'dispatched' && (
             <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
          )}
          
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
             reqStatus === 'new' ? 'border-red-500 bg-red-500/20 text-red-500' :
             reqStatus === 'dispatched' ? 'border-blue-500 bg-blue-500/20 text-blue-500' :
             'border-green-500 bg-green-500/20 text-green-500'
          }`}>
             {reqStatus === 'new' ? <Loader2 className="animate-spin" size={40}/> :
              reqStatus === 'dispatched' ? <Navigation size={40} /> :
              <CheckCircle2 size={40} />
             }
          </div>

          <h2 className="text-2xl font-bold uppercase tracking-widest text-center">
            {reqStatus === 'new' ? 'Searching...' :
             reqStatus === 'dispatched' ? 'Help On The Way' :
             reqStatus}
          </h2>

          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-1000 ${
                reqStatus === 'new' ? 'w-1/3 bg-red-500' :
                reqStatus === 'dispatched' ? 'w-2/3 bg-blue-500' :
                'w-full bg-green-500'
             }`} />
          </div>

          {requestData.assignedAmbulance && (
            <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-700 mt-4">
               <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Assigned Unit</div>
               <div className="flex justify-between items-end">
                  <div className="text-2xl font-mono font-bold text-white">{requestData.assignedAmbulance}</div>
                  <div className="text-green-400 font-bold">{requestData.eta || 'Calculating...'}</div>
               </div>
            </div>
          )}
          
          <div className="text-center text-gray-500 text-xs mt-auto pt-8">
            Request ID: {requestId}<br/>
            Do not close this window.
          </div>
        </div>
      </div>
    );
  }

  // --- UI: SOS BUTTON ---
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none"></div>

      <div className="z-10 text-center mb-12">
        <AlertCircle size={48} className="text-white/20 mx-auto mb-4" />
        <h1 className="text-white text-lg tracking-[0.3em] font-bold opacity-50">EMERGENCY SOS</h1>
      </div>

      <button
        onClick={handleSOS}
        disabled={status === 'locating'}
        className={`
          relative group w-64 h-64 rounded-full flex items-center justify-center
          transition-all duration-300
          ${status === 'locating' ? 'scale-95 opacity-80' : 'hover:scale-105 active:scale-95'}
        `}
      >
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-red-600 rounded-full opacity-20 blur-xl animate-pulse group-hover:opacity-40"></div>
        <div className="absolute inset-4 bg-red-600 rounded-full opacity-20 blur-md"></div>
        
        {/* The Button */}
        <div className="absolute inset-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl border-4 border-red-400/30 flex flex-col items-center justify-center">
           {status === 'locating' ? (
             <Loader2 size={64} className="text-white animate-spin" />
           ) : (
             <>
               <span className="text-5xl font-black text-white tracking-widest drop-shadow-lg">SOS</span>
               <span className="text-xs text-red-200 mt-2 uppercase tracking-wider font-semibold">Tap to Send</span>
             </>
           )}
        </div>
      </button>

      {error && (
        <div className="absolute bottom-10 mx-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="absolute bottom-8 text-white/20 text-xs uppercase tracking-widest">
        Aeromed Response System
      </div>
    </div>
  );
};
