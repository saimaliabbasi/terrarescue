// OpenStreetMap Nominatim Sector & Landmark Search Service for Rawalpindi-Islamabad

export async function searchSectorOrLandmark(query) {
  if (!query || query.trim().length < 2) return [];

  const searchQuery = encodeURIComponent(`${query.trim()}, Rawalpindi Islamabad, Pakistan`);
  const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&polygon_geojson=1&addressdetails=1&limit=5&viewbox=72.8,33.5,73.3,33.8&bounded=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TerraRescue-Community-Intelligence/1.0'
      }
    });

    if (!response.ok) throw new Error('Nominatim search failed');
    const results = await response.json();

    return results.map(item => ({
      id: item.place_id,
      displayName: item.display_name,
      shortName: item.name || item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      boundingbox: item.boundingbox
    }));
  } catch (err) {
    console.warn('Nominatim GIS Search fallback:', err.message);
    
    // Local fallback matching popular sectors
    const localSectors = [
      { shortName: 'Sector I-8, Islamabad', lat: 33.6685, lng: 73.0760 },
      { shortName: 'Sector E-11, Islamabad', lat: 33.7020, lng: 73.0280 },
      { shortName: 'Commercial Market, Rawalpindi', lat: 33.6350, lng: 73.0780 },
      { shortName: 'Saddar, Rawalpindi', lat: 33.5910, lng: 73.0540 },
      { shortName: 'Gwalmandi, Rawalpindi', lat: 33.5938, lng: 73.0639 },
      { shortName: 'Faizabad Interchange', lat: 33.6600, lng: 73.0800 },
      { shortName: 'Bara Kahu, Islamabad', lat: 33.7450, lng: 73.1720 },
      { shortName: 'Pirwadhai, Rawalpindi', lat: 33.6210, lng: 73.0660 }
    ];

    const lower = query.toLowerCase();
    return localSectors
      .filter(s => s.shortName.toLowerCase().includes(lower))
      .map((s, idx) => ({
        id: `loc-${idx}`,
        displayName: s.shortName,
        shortName: s.shortName,
        lat: s.lat,
        lng: s.lng
      }));
  }
}
