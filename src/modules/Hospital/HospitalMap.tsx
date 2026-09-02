import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useHospitalStore } from '../../store/useHospitalStore';

// ── COORDINATES ──────────────────────────────────────────────────
const AMBULANCE_BASE = { lat: 13.168736, lng: 80.068330 };
const HOSPITAL_LOC = { lat: 13.182033, lng: 80.118029 };

// ── HIGH-CONTRAST CLEAN ICONS ──────────────────────────────────
const createMarkerIcon = (bg: string, fg: string, label: string, size = 26) => divIcon({
  className: 'custom-icon',
  html: `
    <div style="
      background-color: ${bg};
      width: ${size}px;
      height: ${size}px;
      border-radius: 6px;
      border: 2px solid #000000;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: ${fg};
      font-family: sans-serif;
      font-size: ${Math.round(size * 0.45)}px;
    ">
      ${label}
    </div>
  `,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
  popupAnchor: [0, -size / 2]
});

const ambulanceIcon = createMarkerIcon('#000000', '#ffffff', 'AMB', 28);
const patientIcon = createMarkerIcon('#ffffff', '#000000', 'PAT', 28);
const hospitalIcon = createMarkerIcon('#000000', '#ffffff', 'HOSP', 32);

// ── MAP CONTROLLER ───────────────────────────────────────────────
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// ── ROUTE FETCHER ────────────────────────────────────────────────
interface RouteResult {
  coords: [number, number][];
  distKm: string;
  durMin: string;
}

const fetchOSRMRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coords: route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]),
        distKm: (route.distance / 1000).toFixed(1) + ' km',
        durMin: Math.ceil(route.duration / 60) + ' min',
      };
    }
  } catch (e) {
    console.error('OSRM fetch failed:', e);
  }
  return null;
};

// ── HOSPITAL MAP ─────────────────────────────────────────────────
export const HospitalMap: React.FC = () => {
  const { fleet, emergencies, selectedRequestId } = useHospitalStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]);

  const [legAmbToPatient, setLegAmbToPatient] = useState<RouteResult | null>(null);
  const [legPatientToHosp, setLegPatientToHosp] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (!selectedRequestId) {
      setLegAmbToPatient(null);
      setLegPatientToHosp(null);
      return;
    }

    const req = emergencies.find((r) => r.id === selectedRequestId);
    if (!req) return;

    setMapCenter([req.location.lat, req.location.lng]);

    const assignedAmb = fleet.find((a) => a.assignedEmergencyId === req.id);
    const ambLoc = assignedAmb ? assignedAmb.location : AMBULANCE_BASE;

    const loadRoutes = async () => {
      const [leg1, leg2] = await Promise.all([
        fetchOSRMRoute(ambLoc, req.location),
        fetchOSRMRoute(req.location, HOSPITAL_LOC),
      ]);
      setLegAmbToPatient(leg1);
      setLegPatientToHosp(leg2);
    };

    loadRoutes();
  }, [selectedRequestId, emergencies, fleet]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white">
      <MapContainer
        center={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0 bg-gray-100"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} />

        {/* Hospital Marker */}
        <Marker position={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]} icon={hospitalIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="font-black text-black">Hospital Emergency Center</strong>
              <div className="text-gray-700">Trauma Bay 1 Ready</div>
            </div>
          </Popup>
        </Marker>

        {/* Ambulances */}
        {fleet.map((amb) => (
          <Marker key={amb.id} position={[amb.location.lat, amb.location.lng]} icon={ambulanceIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <strong className="font-black text-black">{amb.id}</strong>
                <div className="text-gray-700">Status: {amb.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergencies */}
        {emergencies.map((req) => (
          <Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={patientIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <strong className="font-black text-black">{req.type}</strong>
                <div className="text-gray-700">Priority: {req.priority}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Leg 1 */}
        {legAmbToPatient && (
          <Polyline
            positions={legAmbToPatient.coords}
            pathOptions={{ color: '#000000', weight: 4, dashArray: '6, 6', opacity: 0.8 }}
          />
        )}

        {/* Route Leg 2 */}
        {legPatientToHosp && (
          <Polyline
            positions={legPatientToHosp.coords}
            pathOptions={{ color: '#000000', weight: 4, opacity: 0.9 }}
          />
        )}
      </MapContainer>

      {selectedRequestId && (legAmbToPatient || legPatientToHosp) && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-gray-300 z-[500] text-xs shadow-sm font-mono">
          <div className="flex gap-4">
            {legAmbToPatient && (
              <div>
                <p className="text-gray-700 font-bold uppercase text-[9px]">To Patient</p>
                <p className="text-black font-black text-xs">{legAmbToPatient.durMin} ({legAmbToPatient.distKm})</p>
              </div>
            )}
            {legPatientToHosp && (
              <div className="border-l border-gray-300 pl-4">
                <p className="text-gray-700 font-bold uppercase text-[9px]">To Hospital</p>
                <p className="text-black font-black text-xs">{legPatientToHosp.durMin} ({legPatientToHosp.distKm})</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
