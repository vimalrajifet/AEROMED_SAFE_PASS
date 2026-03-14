export interface SimulationResult {
    normal: {
        eta_seconds: number;
        traffic_level: string;
        avg_speed: string;
    };
    safepass: {
        eta_seconds: number;
        drone_status: string;
        traffic_level: string;
        avg_speed: string;
    };
    comparison: {
        time_saved_seconds: number;
        improvement_percentage: number;
    };
}

export const simulateTraffic = async (
    ambulanceLocation: { lat: number; lng: number },
    patientLocation: { lat: number; lng: number },
    routeDistanceKm: number
): Promise<SimulationResult> => {
    try {
        const response = await fetch('http://localhost:5000/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ambulance_location: ambulanceLocation,
                patient_location: patientLocation,
                route_distance: routeDistanceKm,
            }),
        });

        if (!response.ok) {
            throw new Error('Simulation failed');
        }

        const data = await response.json();
        return data.data; // Backend returns { status: "success", data: ... }
    } catch (error) {
        console.error("Simulation API Error:", error);
        // Return mock data for demo purposes if backend is offline
        return {
            normal: { eta_seconds: 900, traffic_level: "High", avg_speed: "25 km/h" },
            safepass: { eta_seconds: 300, drone_status: "Active", traffic_level: "Corridor", avg_speed: "60 km/h" },
            comparison: { time_saved_seconds: 600, improvement_percentage: 66.7 }
        };
    }
};
