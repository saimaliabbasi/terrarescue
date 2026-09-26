import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
   RAWALPINDI_ISLAMABAD_BOUNDS, 
   NULLAH_LAI_STREAM, 
   FLOOD_RISK_ZONES,
   SAFE_EVACUATION_ROUTES,
   QUICK_LOCATIONS
 } from '../services/mockData';
import { t } from '../services/i18n';
import { 
   Crosshair, 
   MapPin, 
   Search, 
   CheckCircle2, 
   Waves, 
   Navigation, 
   ShieldAlert, 
   Thermometer, 
   CloudRain, 
   Sparkles, 
   Route, 
   Compass, 
   CheckCheck, 
   Radio,
   Layers,
   Globe2
 } from 'lucide-react';
import { playSoftClick, playSoftPop, playSuccessChime } from '../services/uiSounds';
import { MAPBOX_TILE_STYLES } from '../services/mapboxService';
import { useToast } from './ToastNotification';

export default function MapView({ 
  activeLayers, 
  reports, 
  resources, 
  nasaEvents,
  weatherInfo,
  onConfirmReport,
  onMapClickForReport,
  searchTargetLocation,
  lang = 'en'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef({});
  const [isLocating, setIsLocating] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [baseStyle, setBaseStyle] = useState('dark');
  const userLocationMarkerRef = useRef(null);
  const { addToast } = useToast();

  const handleChangeBaseMap = (styleKey) => {
    playSoftClick();
    setBaseStyle(styleKey);
    const map = mapInstanceRef.current;
    const cfg = MAPBOX_TILE_STYLES[styleKey] || MAPBOX_TILE_STYLES.dark;
    if (map && cfg) {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      const newLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || 'abc',
        tileSize: cfg.tileSize,
        zoomOffset: cfg.zoomOffset,
        maxZoom: cfg.maxZoom || 20
      }).addTo(map);
      
      if (newLayer.bringToBack) {
        newLayer.bringToBack();
      }
      tileLayerRef.current = newLayer;

      // Invalidate size to ensure clean tile rendering
      map.invalidateSize();

      addToast({
        title: 'Map Theme Active',
        message: `${cfg.name}`,
        type: 'info'
      });
    }
  };

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: RAWALPINDI_ISLAMABAD_BOUNDS.center,
      zoom: RAWALPINDI_ISLAMABAD_BOUNDS.zoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Base Layer: Ultra-sharp Official Mapbox Dark Stealth v11
    const cfg = MAPBOX_TILE_STYLES.dark;
    const baseLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      tileSize: cfg.tileSize,
      zoomOffset: cfg.zoomOffset,
      maxZoom: cfg.maxZoom || 22
    }).addTo(map);
    tileLayerRef.current = baseLayer;

    mapInstanceRef.current = map;

    // Immediately schedule size invalidations to ensure zero blank map issues
    const initTimer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const initTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // ResizeObserver ensures map never gets squished or invisible on container resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Layer groups
    layersGroupRef.current = {
      environmental: L.layerGroup().addTo(map),
      rainfall: L.layerGroup().addTo(map),
      flood: L.layerGroup().addTo(map),
      safeRoutes: L.layerGroup().addTo(map),
      community: L.layerGroup().addTo(map),
      accessibility: L.layerGroup().addTo(map),
      mobility: L.layerGroup().addTo(map),
      resources: L.layerGroup().addTo(map),
      safety: L.layerGroup().addTo(map)
    };

    map.on('click', (e) => {
      playSoftPop();
      if (onMapClickForReport) {
        onMapClickForReport(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      clearTimeout(initTimer1);
      clearTimeout(initTimer2);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Sector Search Pan
  useEffect(() => {
    if (!mapInstanceRef.current || !searchTargetLocation) return;
    const { lat, lng, name } = searchTargetLocation;
    const map = mapInstanceRef.current;
    
    playSoftPop();
    map.flyTo([lat, lng], 15, { duration: 1.4, easeLinearity: 0.25 });

    const searchIcon = L.divIcon({
      html: `
        <div className="relative animate-halo">
          <div className="w-11 h-11 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <span className="text-xl">📍</span>
          </div>
        </div>
      `,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const searchMarker = L.marker([lat, lng], { icon: searchIcon }).addTo(map);
    searchMarker.bindPopup(`
      <div class="p-2 space-y-1">
        <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Focused Location</div>
        <h4 class="font-black text-sm text-white">${name || 'Selected Sector'}</h4>
        <p class="text-xs text-slate-300">Targeted on live intelligence map.</p>
      </div>
    `).openPopup();

    setTimeout(() => {
      map.removeLayer(searchMarker);
    }, 7000);
  }, [searchTargetLocation]);

  // Find My Location GPS Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    playSoftClick();
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;

        map.flyTo([latitude, longitude], 15, { duration: 1.4 });

        if (userLocationMarkerRef.current) {
          map.removeLayer(userLocationMarkerRef.current);
        }

        const userIcon = L.divIcon({
          html: `
            <div className="relative animate-halo">
              <div className="w-10 h-10 rounded-full bg-cyan-500/40 border-2 border-cyan-400 flex items-center justify-center text-white shadow-2xl backdrop-blur-md font-black text-xs font-mono">
                YOU
              </div>
            </div>
          `,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        userLocationMarkerRef.current.bindPopup(`
          <div class="p-2 space-y-1">
            <div class="text-[10px] text-cyan-400 font-bold font-mono">GPS POSITION ACQUIRED</div>
            <h4 class="font-bold text-sm text-white">${t('findMyLocation', lang)}</h4>
            <div class="text-[11px] text-slate-300 font-mono">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
          </div>
        `).openPopup();

        addToast({
          title: 'GPS Location Located',
          message: `Position centered at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          type: 'info'
        });
      },
      (err) => {
        setIsLocating(false);
        addToast({
          title: 'Location Notice',
          message: 'Could not retrieve GPS coordinates. Please ensure browser location permissions are granted.',
          type: 'warning'
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFlyToQuickLocation = (loc) => {
    if (!mapInstanceRef.current) return;
    playSoftClick();
    mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
  };

  // Update Map Layer Contents
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layersGroupRef.current;
    Object.values(groups).forEach(g => g.clearLayers());

    // Nullah Lai Stream & Risk Polygons
    if (activeLayers.flood) {
      const streamLine = L.polyline(NULLAH_LAI_STREAM, {
        color: '#38bdf8',
        weight: 5,
        dashArray: '10, 8',
        opacity: 0.95
      });
      streamLine.bindTooltip('<b>🌊 Nullah Lai Main Flood Channel</b><br/>Monsoon flood risk waterway', { sticky: true });
      groups.flood.addLayer(streamLine);

      FLOOD_RISK_ZONES.forEach(zone => {
        const polygon = L.polygon(zone.coordinates, {
          color: zone.severity === 'HIGH' ? '#f43f5e' : '#f59e0b',
          fillColor: zone.severity === 'HIGH' ? '#f43f5e' : '#f59e0b',
          fillOpacity: 0.22,
          weight: 2
        });

        const popupContent = `
          <div className="p-2 space-y-2 font-sans">
            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              High Flood Risk Catchment
            </div>
            <h4 className="font-extrabold text-sm text-white">${zone.name}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">${zone.description}</p>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div><b>Historical Peak:</b> <span class="text-rose-300">${zone.historicalMaxWaterLevel}</span></div>
              <div><b>Vigilance Status:</b> <span class="text-amber-400 font-bold">${zone.status}</span></div>
            </div>
          </div>
        `;
        polygon.bindPopup(popupContent);
        groups.flood.addLayer(polygon);
      });
    }

    // Safe Evacuation Corridors
    if (showSafeRoutes) {
      SAFE_EVACUATION_ROUTES.forEach(route => {
        const safePolyline = L.polyline(route.coordinates, {
          color: '#10b981',
          weight: 5,
          opacity: 0.85
        });

        safePolyline.bindPopup(`
          <div class="p-2 space-y-2 font-sans">
            <div class="flex items-center gap-1 text-emerald-400 font-bold text-xs">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              SAFE ELEVATED CORRIDOR
            </div>
            <h4 class="font-extrabold text-sm text-white">${route.name}</h4>
            <p class="text-xs text-slate-300">${route.description}</p>
            <div class="bg-emerald-950/50 border border-emerald-900/40 p-2 rounded-xl text-[11px] text-emerald-300 font-semibold">
              ✓ ${route.status}
            </div>
          </div>
        `);
        groups.safeRoutes.addLayer(safePolyline);
      });
    }

    // Community Resources
    if (activeLayers.resources && resources) {
      resources.forEach(res => {
        const resIcon = L.divIcon({
          html: `
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/40 flex items-center justify-center text-sm shadow-xl hover:scale-110 transition-transform">
              🏛️
            </div>
          `,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const resMarker = L.marker(res.coordinates, { icon: resIcon });
        resMarker.bindPopup(`
          <div class="p-2 space-y-2 font-sans">
            <div class="flex items-center gap-1 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span>🏠 Community Resilience Resource</span>
            </div>
            <h4 class="font-extrabold text-sm text-white">${res.name}</h4>
            <p class="text-xs text-slate-300">${res.address}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${res.facilities.map(f => `<span class="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">${f}</span>`).join('')}
            </div>
            <div class="text-[11px] text-emerald-400 font-mono pt-1 border-t border-slate-800 font-semibold">
              📞 ${res.contact}
            </div>
          </div>
        `);
        groups.resources.addLayer(resMarker);
      });
    }

    // Community Reports
    reports.forEach(rep => {
      const isAccessibility = rep.category === 'accessibility';
      const isMobility = rep.category === 'obstruction' || rep.category === 'hazard';
      const isCommunity = rep.category === 'water' || rep.category === 'drainage';

      if (isAccessibility && !activeLayers.accessibility) return;
      if (isMobility && !activeLayers.mobility) return;
      if (isCommunity && !activeLayers.community) return;

      if (selectedSeverity !== 'ALL' && rep.severity !== selectedSeverity) return;

      const isResolved = rep.status === 'resolved' || rep.resolved;

      const markerColor = isResolved 
        ? 'bg-slate-700/80 border-slate-500 text-slate-300 opacity-60'
        : rep.category === 'water' ? 'bg-cyan-500 border-cyan-300 text-white' :
        rep.category === 'drainage' ? 'bg-blue-600 border-blue-300 text-white' :
        rep.category === 'obstruction' ? 'bg-amber-500 border-amber-300 text-white' :
        rep.category === 'accessibility' ? 'bg-purple-600 border-purple-300 text-white' :
        'bg-rose-600 border-rose-300 text-white';

      const iconEmoji = isResolved ? '✓' :
        rep.category === 'water' ? '🌊' :
        rep.category === 'drainage' ? '💧' :
        rep.category === 'obstruction' ? '🚧' :
        rep.category === 'accessibility' ? '♿' : '⚠️';

      const coords = rep.coordinates || [rep.location?.lat, rep.location?.lng];
      if (!coords || !coords[0]) return;

      const customIcon = L.divIcon({
        html: `
          <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-125">
            <div class="w-10 h-10 rounded-2xl ${markerColor} border-2 flex items-center justify-center text-sm shadow-2xl backdrop-blur-md">
              ${iconEmoji}
            </div>
            ${rep.confirmedByUsers ? `
              <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-900 flex items-center justify-center text-[9px] text-white font-black shadow-md">
                ✓
              </span>
            ` : ''}
          </div>
        `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker(coords, { icon: customIcon });
      const targetGroup = isAccessibility ? groups.accessibility : isMobility ? groups.mobility : groups.community;
      
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 font-sans w-64 space-y-2.5';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            ${rep.categoryLabel || rep.category}
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${rep.timeAgo || 'Just now'}</span>
        </div>
        
        <h4 class="font-bold text-sm text-white leading-snug ${isResolved ? 'line-through text-slate-400' : ''}">${rep.title}</h4>
        <div class="text-xs text-slate-300 leading-relaxed">${rep.description}</div>

        ${rep.photoUrl ? `
          <div class="relative rounded-xl overflow-hidden h-28 border border-slate-800 my-1.5 shadow-md">
            <img src="${rep.photoUrl}" alt="Evidence Photo" class="w-full h-full object-cover" />
            <span class="absolute bottom-1 right-1 bg-slate-950/80 text-[10px] text-slate-200 px-2 py-0.5 rounded backdrop-blur font-mono">
              📸 Evidence Photo
            </span>
          </div>
        ` : ''}

        <div class="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800 text-slate-400">
          <span>By: <b>${rep.reporter || 'Resident'}</b></span>
          <span class="text-emerald-400 font-bold">✓ ${rep.verificationCount || 1} Verified</span>
        </div>
      `;

      if (isResolved) {
        const resolvedTag = document.createElement('div');
        resolvedTag.className = 'w-full mt-2 py-2 px-3 bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5';
        resolvedTag.innerHTML = '<span>✓ Hazard Resolved & Cleared</span>';
        popupDiv.appendChild(resolvedTag);
      } else {
        const btn = document.createElement('button');
        btn.className = 'w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95';
        btn.innerHTML = `<span>${t('confirmReport', lang)} (${rep.verificationCount || 1})</span>`;
        btn.onclick = () => {
          playSuccessChime();
          if (onConfirmReport) onConfirmReport(rep.id);
          btn.innerHTML = '<span>✓ Confirmed!</span>';
          btn.disabled = true;
        };
        popupDiv.appendChild(btn);
      }

      marker.bindPopup(popupDiv);
      targetGroup.addLayer(marker);
    });

  }, [activeLayers, reports, resources, nasaEvents, showSafeRoutes, selectedSeverity, lang]);

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex-1 select-none overflow-hidden">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-10" 
        style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 4rem)' }}
      />

      {/* Top Floating Live Weather Telemetry Badge */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
        <div className="glass-panel px-3.5 py-2 rounded-2xl flex items-center gap-3 text-xs text-slate-200 shadow-2xl">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
            <CloudRain className="w-4 h-4" />
            <span>{weatherInfo?.precipitation != null ? Number(weatherInfo.precipitation).toFixed(1) : '0.0'} mm</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-amber-400 font-mono">
            <Thermometer className="w-3.5 h-3.5" />
            <span>{weatherInfo?.temperature != null ? Number(weatherInfo.temperature).toFixed(1) : '31.2'}°C</span>
          </div>
          <div className="h-3 w-px bg-slate-700 hidden sm:block" />
          <div className="items-center gap-1.5 text-emerald-400 hidden sm:flex font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{weatherInfo?.weatherCondition || 'Clear Sky'}</span>
          </div>
        </div>
      </div>

      {/* Floating Quick Landmark Presets Bar */}
      <div className="absolute top-4 right-4 z-[400] hidden md:flex items-center gap-1.5 glass-panel p-1.5 rounded-2xl shadow-2xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          Jump:
        </span>
        {QUICK_LOCATIONS.map(loc => (
          <button
            key={loc.id}
            onClick={() => handleFlyToQuickLocation(loc)}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all font-medium active:scale-95"
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Floating Bottom Left Controls: Safe Route Toggle & Severity Filters & Mapbox Tiles */}
      <div className="absolute bottom-6 left-4 z-[400] flex flex-col gap-2">
        {/* Mapbox Basemap Switcher */}
        <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 shadow-2xl flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 px-2 font-mono flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            Theme:
          </span>
          <button
            onClick={() => handleChangeBaseMap('dark')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'dark' 
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-950/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🖤 Dark Stealth
          </button>
          <button
            onClick={() => handleChangeBaseMap('satellite')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'satellite' 
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-950/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => handleChangeBaseMap('navigation')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'navigation' 
                ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/60 shadow-lg shadow-indigo-950/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌙 Night Arterials
          </button>
          <button
            onClick={() => handleChangeBaseMap('outdoors')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'outdoors' 
                ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-950/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⛰️ Terrain
          </button>
          <button
            onClick={() => handleChangeBaseMap('streets')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'streets' 
                ? 'bg-sky-950/90 text-sky-300 border border-sky-500/60 shadow-lg shadow-sky-950/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏙️ Streets
          </button>
          <button
            onClick={() => handleChangeBaseMap('osm')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
              baseStyle === 'osm' 
                ? 'bg-slate-800 text-teal-300 border border-teal-500/60 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 OSM
          </button>
        </div>

        {/* Safe Routes Toggle Button */}
        <button
          onClick={() => {
            playSoftPop();
            setShowSafeRoutes(v => !v);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xl backdrop-blur-md active:scale-95 cursor-pointer ${
            showSafeRoutes
              ? 'bg-emerald-600 text-white border border-emerald-400/40 shadow-emerald-950/60'
              : 'glass-panel text-slate-300 border border-slate-700/60 hover:text-white'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>{showSafeRoutes ? '✓ Safe Evacuation Corridors' : 'Show Safe Corridors'}</span>
        </button>

        {/* Severity Filter Pills */}
        <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
            <button
              key={sev}
              onClick={() => {
                playSoftClick();
                setSelectedSeverity(sev);
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                selectedSeverity === sev
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* GPS Find My Location Button */}
      <div className="absolute bottom-6 right-4 z-[400]">
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="flex items-center gap-2 glass-panel hover:bg-slate-800/90 text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-2xl border border-emerald-500/30 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isLocating ? t('locating', lang) : t('findMyLocation', lang)}</span>
        </button>
      </div>

    </div>
  );
}
