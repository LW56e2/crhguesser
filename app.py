from __future__ import annotations

import json
import random
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
DATA_PATH = Path(__file__).parent / "data" / "locations.json"


def load_locations() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/round")
def get_round():
    locations = load_locations()
    location = random.choice(locations)
    payload = {
        "id": location["id"],
        "name": location["name"],
        "photo": location["photo"],
    }
    return jsonify(payload)


@app.post("/api/guess")
def score_guess():
    body = request.get_json(force=True)
    guess_lat = float(body["lat"])
    guess_lng = float(body["lng"])
    location_id = body["location_id"]

    locations = load_locations()
    actual = next((x for x in locations if x["id"] == location_id), None)
    if actual is None:
        return jsonify({"error": "Location not found"}), 404

    distance_m = haversine_meters(
        guess_lat,
        guess_lng,
        float(actual["lat"]),
        float(actual["lng"]),
    )
    max_points = 5000
    score = max(0, int(max_points - (distance_m / 3)))

    return jsonify(
        {
            "score": score,
            "distance_m": round(distance_m, 1),
            "actual": {
                "lat": actual["lat"],
                "lng": actual["lng"],
                "name": actual["name"],
            },
        }
    )


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    earth_radius_m = 6371000
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    )
    c = 2 * asin(sqrt(a))
    return earth_radius_m * c


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
