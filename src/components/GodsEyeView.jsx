import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Crosshair, Eye, Radio, Satellite, Compass, 
  Maximize2, Activity, Layers, Volume2, VolumeX, 
  ShieldAlert, Navigation, RefreshCw, Target, Flame, 
  Moon, Sun, AlertTriangle, ShieldCheck, MapPin
} from 'lucide-react';
import { MAPBOX_TILE_STYLES } from '../services/mapboxService';
import { playTacticalPing, playTargetLockSound, isSoundEnabled, toggleSoundEnabled } from '../services/uiSounds';

// High-Value Tactical Recon Targets in Rawalpindi-Islamabad
const TACTICAL_TARGETS = [
  {
    id: 'gwalmandi',
    name: 'Gwalmandi Choke Point',
    sub: 'Nullah Lai Critical Gauge',
    coords: [33.5940, 73.0640],
    zoom: 17,
    status: 'ALERT',
    alertLevel: '18.4 ft (Danger 20 ft)',
    desc: 'Dense population corridor. Major river choke point prone to catastrophic backflow.',
    riskColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10'
  },
  {
    id: 'kattarian',
    name: 'New Kattarian Bridge',
    sub: 'Nullah Lai Entry Gateway',
    coords: [33.6450, 73.0620],
    zoom: 16,
    status: 'WATCH',
    alertLevel: '14.1 ft (Normal 9 ft)',
    desc: 'Upstream confluence measuring flow surge entering Rawalpindi municipal boundary.',
    riskColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
  },
  {
    id: 'e11',
    name: 'Sector E-11 Low Basin',
    sub: 'Margalla Hill Runoff Zone',
    coords: [33.7050, 73.0450],
    zoom: 16,
    status: 'CRITICAL',
    alertLevel: 'High Runoff Velocity',
    desc: 'Urban basin vulnerable to flash torrents from Margalla National Park ravines.',
    riskColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10'
  },
  {
    id: 'faizabad',
    name: 'Faizabad Interchange',
    sub: 'Transit Arterial Depression',
    coords: [33.6450, 73.0850],
    zoom: 16,
    status: 'NORMAL',
    alertLevel: 'Subways Clear',
    desc: 'Primary transit junction connecting twin cities; underpasses equipped with pump stations.',
    riskColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
  },
  {
    id: 'chaklala',
    name: 'Chaklala Low-Lying Basin',
    sub: 'Airport & Rail Inundation Zone',
    coords: [33.6120, 73.0980],
    zoom: 16,
    status: 'WATCH',
    alertLevel: 'Ground Saturated',
    desc: 'Railway track and drainage depressions susceptible to slow water evacuation.',
    riskColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10'
  }
];

// Earth Observation Satellites
const SATELLITE_CONSTELLATION = [
  {
    id: 'prss1',
    name: 'PRSS-1 (SUPARCO)',
    type: 'Panchromatic/Multispectral Earth Recon',
    altitude: '640 km SSO',
    resolution: '0.98m PAN / 2.98m MS',
    swath: '60 km',
    velocity: '7.54 km/s',
    nextPassSecs: 342,
    sensor: 'High-Res Optical CCD'
  },
  {
    id: 'paktes1a',
    name: 'PakTES-1A (Pakistan)',
    type: 'Remote Sensing Technology Satellite',
    altitude: '610 km LEO',
    resolution: '10m Optical',
    swath: '75 km',
    velocity: '7.58 km/s',
    nextPassSecs: 1120,
    sensor: 'Optical Imager'
  },
  {
    id: 'sentinel2a',
    name: 'Sentinel-2A (Copernicus ESA)',
    type: '13-Band Multispectral Flood Monitor',
    altitude: '786 km SSO',
    resolution: '10m SWIR/NIR',
    swath: '290 km',
    velocity: '7.45 km/s',
    nextPassSecs: 2450,
    sensor: 'MSI (MultiSpectral Instrument)'
  },
  {
    id: 'landsat9',
    name: 'Landsat 9 (NASA/USGS)',
    type: 'Thermal Infrared & Surface Reflectance',
    altitude: '705 km Polar',
    resolution: '15m PAN / 100m TIRS-2',
    swath: '185 km',
    velocity: '7.50 km/s',
    nextPassSecs: 4190,
    sensor: 'TIRS-2 Thermal Infrared'
  }
];

export default function GodsEyeView({ waterLevel = 14.8, rainData = null }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeTileLayerRef = useRef(null);

  // States
  const [visionMode, setVisionMode] = useState('optical'); // 'optical' | 'nvg' | 'thermal'
  const [scanlinesActive, setScanlinesActive] = useState(true);
  const [hudActive, setHudActive] = useState(true);
  const [radarScanning, setRadarScanning] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState(TACTICAL_TARGETS[0]);
  const [activeSatellite, setActiveSatellite] = useState(SATELLITE_CONSTELLATION[0]);
  const [countdown, setCountdown] = useState(activeSatellite.nextPassSecs);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [centerCoords, setCenterCoords] = useState({ lat: 33.5940, lng: 73.0640 });
  const [currentZoom, setCurrentZoom] = useState(16);
  const [radarAngle, setRadarAngle] = useState(0);

  // UTC + PKT Clocks
  const [timeStrings, setTimeStrings] = useState({ utc: '', pkt: '' });

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStrings({
        utc: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        pkt: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: false }) + ' PKT'
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Satellite Pass Countdown Ticker
  useEffect(() => {
    setCountdown(activeSatellite.nextPassSecs);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : activeSatellite.nextPassSecs));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSatellite]);

  // Radar Sweep Rotation
  useEffect(() => {
    if (!radarScanning) return;
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [radarScanning]);

  // Sound toggle
  const handleToggleSound = () => {
    const next = toggleSoundEnabled();
    setSoundOn(next);
    if (next) playTacticalPing();
  };

  // Switch vision mode
  const handleVisionModeChange = (mode) => {
    setVisionMode(mode);
    playTacticalPing();
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCoords = [selectedTarget.coords[0], selectedTarget.coords[1]];
    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: selectedTarget.zoom,
      zoomControl: false,
      attributionControl: false,
      inertia: true,
      maxZoom: 20,
      minZoom: 11
    });

    mapInstanceRef.current = map;

    // Use Mapbox Satellite 512px Tiles
    const satCfg = MAPBOX_TILE_STYLES.satellite;
    const satLayer = L.tileLayer(satCfg.url, {
      attribution: satCfg.attribution,
      tileSize: satCfg.tileSize,
      zoomOffset: satCfg.zoomOffset,
      maxZoom: satCfg.maxZoom
    }).addTo(map);

    activeTileLayerRef.current = satLayer;

    // Add target markers with tactical pulses
    TACTICAL_TARGETS.forEach((target) => {
      const isCritical = target.status === 'CRITICAL' || target.status === 'ALERT';
      const color = isCritical ? '#f43f5e' : '#06b6d4';

      const customIcon = L.divIcon({
        className: 'tactical-target-icon',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border: 1.5px dashed ${color}; border-radius: 50%; animation: spin 8s linear infinite;"></div>
            <div style="position: absolute; width: 14px; height: 14px; border: 2px solid ${color}; border-radius: 2px; transform: rotate(45deg);"></div>
            <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(target.coords, { icon: customIcon }).addTo(map);
      marker.bindTooltip(`
        <div style="background: rgba(10, 15, 29, 0.95); border: 1px solid rgba(6, 182, 212, 0.4); color: #ecfeff; padding: 6px 10px; font-family: monospace; font-size: 11px; border-radius: 4px;">
          <div style="font-weight: bold; color: #38bdf8;">[LOCK] ${target.name}</div>
          <div style="color: #94a3b8;">${target.alertLevel}</div>
        </div>
      `, { permanent: false, direction: 'top', className: 'tactical-tooltip' });

      marker.on('click', () => {
        handleTargetSelect(target);
      });
    });

    // Update center coordinates on move
    map.on('move', () => {
      const c = map.getCenter();
      setCenterCoords({ lat: c.lat, lng: c.lng });
      setCurrentZoom(map.getZoom());
    });

    const initTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Target Lock Action
  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    playTargetLockSound();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.coords, target.zoom, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }
  };

  // Convert coords to simple simulated MGRS grid for military HUD aesthetic
  const formatMGRS = (lat, lng) => {
    const latInt = Math.floor(lat * 1000) % 1000;
    const lngInt = Math.floor(lng * 1000) % 1000;
    return `42S TD ${String(lngInt).padStart(3, '0')} ${String(latInt).padStart(3, '0')}`;
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Dynamic CSS filter class for vision modes
  const getVisionFilterStyle = () => {
    switch (visionMode) {
      case 'nvg':
        return {
          filter: 'sepia(100%) hue-rotate(80deg) saturate(380%) brightness(1.2) contrast(1.4)',
          transition: 'filter 0.4s ease'
        };
      case 'thermal':
        return {
          filter: 'invert(92%) hue-rotate(185deg) saturate(240%) contrast(1.5)',
          transition: 'filter 0.4s ease'
        };
      case 'optical':
      default:
        return {
          filter: 'none',
          transition: 'filter 0.4s ease'
        };
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[640px] bg-slate-950 overflow-hidden font-mono select-none">
      
      {/* 1. Leaflet Satellite Map Layer with Hardware Acceleration and Vision Shaders */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0 cursor-crosshair"
        style={getVisionFilterStyle()}
      />

      {/* 2. Optional CRT Scanline & Phosphor Overlay */}
      {scanlinesActive && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
      )}

      {/* 3. Screen Vignette / Tactical CRT Glow */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-500 ${
        visionMode === 'nvg' 
          ? 'shadow-[inset_0_0_120px_rgba(34,197,94,0.35)]' 
          : visionMode === 'thermal' 
          ? 'shadow-[inset_0_0_120px_rgba(56,189,248,0.35)]' 
          : 'shadow-[inset_0_0_90px_rgba(0,0,0,0.7)]'
      }`} />

      {/* 4. Top Tactical HUD Bar */}
      {hudActive && (
        <header className="absolute top-0 left-0 right-0 z-20 px-3 sm:px-6 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left: Mission Classification */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              CLASSIFIED // OSINT RECON
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">{activeSatellite.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{activeSatellite.altitude}</span>
            </div>
          </div>

          {/* Center: Live Center Reticle Telemetry */}
          <div className="hidden lg:flex items-center gap-4 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-cyan-400 transform rotate-45" />
              <span className="text-slate-400">LAT:</span>
              <span className="text-cyan-300 font-bold">{centerCoords.lat.toFixed(4)}°N</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LON:</span>
              <span className="text-cyan-300 font-bold">{centerCoords.lng.toFixed(4)}°E</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">MGRS:</span>
              <span className="text-emerald-300 font-semibold">{formatMGRS(centerCoords.lat, centerCoords.lng)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">MAG:</span>
              <span className="text-cyan-300 font-bold">x{currentZoom}</span>
            </div>
          </div>

          {/* Right: Telemetry Clocks & Audio Toggle */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="hidden sm:flex flex-col text-right text-[10px] leading-tight text-slate-400">
              <span className="text-slate-300 font-mono font-medium">{timeStrings.utc}</span>
              <span className="text-cyan-400 font-mono font-bold">{timeStrings.pkt}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Tactical Audio Enabled' : 'Tactical Audio Muted'}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Scanlines Toggle */}
            <button
              onClick={() => setScanlinesActive(!scanlinesActive)}
              title="Toggle CRT Scanline Shader"
              className={`p-1.5 rounded border text-[11px] font-bold transition-colors ${
                scanlinesActive 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              CRT
            </button>
          </div>
        </header>
      )}

      {/* 5. Center Tactical Crosshairs & Targeting Bracket */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center">
          
          {/* Outer Rotating Compass Reticle */}
          <div 
            className="absolute inset-0 border border-cyan-500/20 rounded-full transition-transform"
            style={{ transform: `rotate(${radarAngle}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-0.5 bg-cyan-400" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-0.5 bg-cyan-400" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0.5 h-2 bg-cyan-400" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0.5 h-2 bg-cyan-400" />
          </div>

          {/* Inner Target Crosshair Corner Brackets */}
          <div className="absolute inset-4 sm:inset-6">
            {/* Top-Left */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            {/* Top-Right */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            {/* Bottom-Left */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            {/* Bottom-Right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
          </div>

          {/* Center Target Dot & Ticks */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />

          {/* Active Target Locked Badge under Crosshair */}
          {selectedTarget && (
            <div className="absolute -bottom-8 px-2.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 tracking-wider whitespace-nowrap shadow-lg">
              TARGET LOCK: {selectedTarget.name}
            </div>
          )}
        </div>
      </div>

      {/* 6. Upper Left: Active Satellite Orbital Telemetry Panel */}
      <div className="absolute top-14 left-3 sm:left-4 z-20 w-72 sm:w-80 p-3 sm:p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl text-xs space-y-2.5">
        
        {/* Constellation Switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
            <Satellite className="w-4 h-4" />
            Satellite Pass Tracker
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            LEO / SSO
          </span>
        </div>

        {/* Satellite Selection Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {SATELLITE_CONSTELLATION.map((sat) => (
            <button
              key={sat.id}
              onClick={() => {
                setActiveSatellite(sat);
                playTacticalPing();
              }}
              className={`px-2 py-1.5 rounded text-left text-[10px] transition-all border ${
                activeSatellite.id === sat.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="truncate font-bold">{sat.name.split(' ')[0]}</div>
              <div className="text-[9px] text-slate-500">{sat.altitude}</div>
            </button>
          ))}
        </div>

        {/* Selected Satellite Specs */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Target Overhead Nadir:</span>
            <span className="text-rose-400 font-mono font-bold tracking-wider animate-pulse">
              T-{formatTime(countdown)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ground Velocity:</span>
            <span className="text-cyan-300 font-mono font-semibold">{activeSatellite.velocity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Spatial Resolution:</span>
            <span className="text-emerald-300 font-mono font-semibold">{activeSatellite.resolution}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ground Swath:</span>
            <span className="text-slate-300 font-mono">{activeSatellite.swath}</span>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800/80">
            Sensor: <span className="text-slate-200">{activeSatellite.sensor}</span>
          </div>
        </div>

        {/* Twin Cities Water Risk Quick Status */}
        <div className="p-2 rounded bg-slate-900/50 border border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Nullah Lai Current:</span>
          <span className={`font-bold font-mono ${
            waterLevel >= 20 ? 'text-rose-400' :
            waterLevel >= 15 ? 'text-orange-400' :
            waterLevel >= 11 ? 'text-amber-400' :
            'text-emerald-400'
          }`}>
            {waterLevel} ft ({
              waterLevel >= 20 ? 'Evacuation Danger' :
              waterLevel >= 15 ? 'Warning Stage' :
              waterLevel >= 11 ? 'Alert Stage' :
              'Normal / Clear'
            })
          </span>
        </div>
      </div>

      {/* 7. Upper Right: Flood Risk Sonar Radar Display */}
      <div className="hidden md:flex flex-col items-center absolute top-14 right-4 z-20 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl text-xs">
        <div className="flex items-center justify-between w-full pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Lai Radar Sweep
          </div>
          <button 
            onClick={() => setRadarScanning(!radarScanning)}
            className="text-[9px] text-slate-400 hover:text-cyan-300 px-1 py-0.5 rounded bg-slate-900"
          >
            {radarScanning ? 'PAUSE' : 'SCAN'}
          </button>
        </div>

        {/* Circular Radar Screen */}
        <div className="relative w-32 h-32 rounded-full border border-cyan-500/30 bg-slate-950/90 overflow-hidden flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20" />
          <div className="absolute w-16 h-16 rounded-full border border-cyan-500/20" />
          <div className="absolute w-8 h-8 rounded-full border border-cyan-500/20" />

          {/* Cross lines */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />

          {/* Radar Sweeping Beam */}
          <div 
            className="absolute inset-0 origin-center pointer-events-none"
            style={{
              transform: `rotate(${radarAngle}deg)`,
              background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.4) 0deg, transparent 60deg, transparent 360deg)'
            }}
          />

          {/* Blips for Targets */}
          <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" title="Gwalmandi" />
          <div className="absolute bottom-10 right-8 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_#fbbf24]" title="Chaklala" />
          <div className="absolute top-10 right-10 w-1.5 h-1.5 rounded-full bg-cyan-400" title="Faizabad" />
        </div>

        <div className="mt-2 text-[9px] text-slate-400 text-center">
          RADAR AZIMUTH: <span className="text-cyan-400 font-mono font-bold">{radarAngle}°</span>
        </div>
      </div>

      {/* 8. Bottom Tactical Deck: Vision Modes + Target Locks */}
      <footer className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 space-y-2">
        
        {/* Selected Target Ground Intel Card */}
        {selectedTarget && (
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Target className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">{selectedTarget.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedTarget.riskColor}`}>
                    {selectedTarget.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {selectedTarget.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Alert Water Height</div>
                <div className="text-cyan-300 font-bold font-mono">{selectedTarget.alertLevel}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Target Coordinates</div>
                <div className="text-slate-300 font-mono">{selectedTarget.coords[0].toFixed(4)}, {selectedTarget.coords[1].toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Spectral Vision Selector + Quick Choke Point Locks */}
        <div className="p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Vision Modes */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => handleVisionModeChange('optical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                visionMode === 'optical'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              OPTICAL RECON
            </button>

            <button
              onClick={() => handleVisionModeChange('nvg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                visionMode === 'nvg'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              NVG PHOSPHOR
            </button>

            <button
              onClick={() => handleVisionModeChange('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                visionMode === 'thermal'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              FLIR THERMAL
            </button>
          </div>

          {/* Quick Target Locks Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">LOCKS:</span>
            {TACTICAL_TARGETS.map((target) => (
              <button
                key={target.id}
                onClick={() => handleTargetSelect(target)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-all border ${
                  selectedTarget?.id === target.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {target.name.split(' ')[0]}
              </button>
            ))}
          </div>

        </div>
      </footer>
    </div>
  );
}
