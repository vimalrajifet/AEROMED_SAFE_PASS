"""
AeroMed SafePass - Flask API
Endpoint:  POST /simulate
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from simulation_core import TrafficSimulation

app = Flask(__name__)
CORS(app)


@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json or {}

    dist_km = float(data.get('route_distance', 5.0))

    sim = TrafficSimulation()
    results = sim.run_full_demo(dist_km)

    normal_eta = results["normal_eta"]
    safe_eta   = results["safepass_eta"]
    saved      = normal_eta - safe_eta
    pct        = round((saved / normal_eta) * 100, 1) if normal_eta else 0

    return jsonify({
        "status": "success",
        "data": {
            "normal": {
                "eta_seconds": normal_eta,
                "traffic_level": "High",
                "avg_speed": "30 km/h",
            },
            "safepass": {
                "eta_seconds": safe_eta,
                "drone_status": "Active - Clearing Route",
                "traffic_level": "Clear (Green Corridor)",
                "avg_speed": "50 km/h",
            },
            "comparison": {
                "time_saved_seconds": saved,
                "improvement_percentage": pct,
            },
        },
    })


if __name__ == '__main__':
    print("AeroMed Simulation Server -> http://localhost:5000")
    app.run(port=5000, debug=True)
