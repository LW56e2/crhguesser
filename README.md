# Campus Guesser (Flask + Vanilla JS)

This is a simple GeoGuessr-style web app for school campuses:
- Backend: Flask API serves random rounds and scores guesses.
- Frontend: Vanilla JavaScript + Leaflet map.
- Data model: list of `{id, name, photo, lat, lng}` entries in `data/locations.json`.

## Why this stack
- You are comfortable with Flask, so keep backend simple and Pythonic.
- Frontend logic is small; vanilla JS avoids framework overhead.
- Leaflet + OpenStreetMap gives free map interactivity.

## MVP flow
1. Frontend requests `GET /api/round`.
2. Backend returns one random location photo.
3. Player clicks map to place guess marker.
4. Frontend sends `POST /api/guess` with guess coords and location id.
5. Backend computes distance + score and returns result.
6. Frontend shows score and actual marker.

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## Next steps
- Replace sample photos with your real school photos in `/static/photos`.
- Add admin upload page to create location/photo pairs.
- Add session-based 5-round game mode and leaderboard.
- Restrict map view to your campus bounds.
- Add anti-cheat checks (strip EXIF from uploaded images).
