let map;
let guessMarker = null;
let actualMarker = null;
let selectedLatLng = null;
let currentRound = null;

const WALLINGFORD_CENTER = [41.457, -72.8232];
const WALLINGFORD_BOUNDS = L.latLngBounds(
  [41.41, -72.9],
  [41.5, -72.75],
);

const resultNode = document.getElementById("result");
const submitButton = document.getElementById("submit-guess");
const nextRoundButton = document.getElementById("next-round");
const roundPhoto = document.getElementById("round-photo");
const mapNode = document.getElementById("map");
const openMapButton = document.getElementById("open-map");
const photoZoomInput = document.getElementById("photo-zoom");
const photoPanXInput = document.getElementById("photo-pan-x");
const photoPanYInput = document.getElementById("photo-pan-y");

function updatePhotoFraming() {
  const zoom = Number(photoZoomInput.value);
  const panX = Number(photoPanXInput.value);
  const panY = Number(photoPanYInput.value);

  roundPhoto.style.transform = `scale(${zoom})`;
  roundPhoto.style.objectPosition = `${panX}% ${panY}%`;
}

function hideMapUntilOpened() {
  mapNode.classList.add("hidden");
  openMapButton.hidden = false;
}

function showMap() {
  mapNode.classList.remove("hidden");
  openMapButton.hidden = true;
  map.invalidateSize();
}

function initMap() {
  map = L.map("map", {
    minZoom: 13,
    maxBounds: WALLINGFORD_BOUNDS,
    maxBoundsViscosity: 1,
  }).setView(WALLINGFORD_CENTER, 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 22,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.on("click", (event) => {
    selectedLatLng = event.latlng;
    submitButton.disabled = false;

    if (guessMarker) {
      guessMarker.setLatLng(event.latlng);
    } else {
      guessMarker = L.marker(event.latlng).addTo(map).bindPopup("Your guess");
    }
  });
}

async function loadRound() {
  const response = await fetch("/api/round");
  currentRound = await response.json();

  roundPhoto.src = currentRound.photo;
  resultNode.textContent = "";
  submitButton.disabled = true;
  selectedLatLng = null;
  hideMapUntilOpened();

  photoZoomInput.value = "2.4";
  photoPanXInput.value = "50";
  photoPanYInput.value = "50";
  updatePhotoFraming();

  if (guessMarker) {
    map.removeLayer(guessMarker);
    guessMarker = null;
  }
  if (actualMarker) {
    map.removeLayer(actualMarker);
    actualMarker = null;
  }

  map.fitBounds(WALLINGFORD_BOUNDS, { animate: false });
}

async function submitGuess() {
  if (!selectedLatLng || !currentRound) {
    return;
  }

  const response = await fetch("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location_id: currentRound.id,
      lat: selectedLatLng.lat,
      lng: selectedLatLng.lng,
    }),
  });

  const result = await response.json();
  resultNode.textContent = `Score: ${result.score} | Distance: ${result.distance_m} m | Actual: ${result.actual.name}`;

  actualMarker = L.marker([result.actual.lat, result.actual.lng], {
    icon: L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    }),
  })
    .addTo(map)
    .bindPopup("Actual location")
    .openPopup();
}

submitButton.addEventListener("click", submitGuess);
nextRoundButton.addEventListener("click", loadRound);
openMapButton.addEventListener("click", showMap);
photoZoomInput.addEventListener("input", updatePhotoFraming);
photoPanXInput.addEventListener("input", updatePhotoFraming);
photoPanYInput.addEventListener("input", updatePhotoFraming);

initMap();
loadRound();
