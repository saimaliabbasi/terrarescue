// Mapbox Integration Service for TerraRescue
// Access Token provided for Saim Ali Abbasi

export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export const MAPBOX_TILE_STYLES = {
  dark: {
    id: 'dark',
    name: 'Mapbox Dark Stealth (Official High-Def)',
    url: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; Mapbox &copy; OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Streets (Earth Observation)',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; Mapbox &copy; OpenStreetMap &copy; Maxar',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation Night (High Contrast Arterials)',
    url: `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; Mapbox &copy; OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22
  },
  outdoors: {
    id: 'outdoors',
    name: 'Terrain & Topography (Contours)',
    url: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; Mapbox &copy; OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22
  },
  streets: {
    id: 'streets',
    name: 'Mapbox Streets (Urban Detail)',
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; Mapbox &copy; OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22
  },
  carto: {
    id: 'carto',
    name: 'CartoDB Dark (Fastly CDN)',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    tileSize: 256,
    zoomOffset: 0,
    maxZoom: 19
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (Standard Global)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    tileSize: 256,
    zoomOffset: 0,
    maxZoom: 19
  }
};

/**
 * Fetch real driving route from Mapbox Directions API
 * @param {[number, number]} origin - [lat, lng]
 * @param {[number, number]} destination - [lat, lng]
 */
export async function fetchMapboxRoute(origin, destination) {
  try {
    // Mapbox takes [lng, lat]
    const start = `${origin[1]},${origin[0]}`;
    const end = `${destination[1]},${destination[0]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox API error: ${res.status}`);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const primary = data.routes[0];
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const leafletCoords = primary.geometry.coordinates.map(pt => [pt[1], pt[0]]);
      return {
        success: true,
        coordinates: leafletCoords,
        distanceKm: (primary.distance / 1000).toFixed(1),
        durationMin: Math.round(primary.duration / 60),
        summary: primary.legs?.[0]?.summary || 'Direct Corridor'
      };
    }
    return null;
  } catch (err) {
    console.warn('Mapbox directions error:', err);
    return null;
  }
}
