import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Navigation, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Car, 
  Compass, 
  Clock, 
  Waves, 
  Sparkles,
  ExternalLink,
  Zap,
  Globe2
} from 'lucide-react';
import { playSoftClick, playSoftPop, playWarningChime, playSuccessChime } from '../services/uiSounds';
import { fetchMapboxRoute } from '../services/mapboxService';
import { useToast } from './ToastNotification';

const PRESET_ORIGINS = [
  { id: 'saddar', name: 'Saddar Rawalpindi', coords: [33.5910, 73.0540], elevation: 'Low (Flood Zone)' },
  { id: 'commercial', name: 'Commercial Market / Satellite Town', coords: [33.6350, 73.0780], elevation: 'Moderate (Underpass Risk)' },
  { id: 'faizabad', name: 'Faizabad Interchange', coords: [33.6450, 73.0850], elevation: 'Elevated Hub' },
  { id: 'i8', name: 'I-8 Markaz', coords: [33.6685, 73.0760], elevation: 'Drain Overflow Risk' },
  { id: 'e11', name: 'Sector E-11 Islamabad', coords: [33.7020, 73.0280], elevation: 'Flash Stream Risk' }
];

const PRESET_DESTINATIONS = [
  { id: 'bluearea', name: 'Blue Area / Sector G-7 Islamabad', coords: [33.7050, 73.0550], safe: true },
  { id: 'f6', name: 'Super Market / Sector F-6', coords: [33.7250, 73.0750], safe: true },
  { id: 'airport', name: 'Islamabad International Airport', coords: [33.5650, 72.8450], safe: true },
  { id: 'koral', name: 'Koral Chowk / Highway', coords: [33.5650, 73.1250], safe: true },
  { id: 'centaurus', name: 'Centaurus Mall (F-8/G-8)', coords: [33.7080, 73.0520], safe: true }
];

export default function RouteRiskPlanner({ onSelectRouteOnMap, lang = 'en' }) {
  const [origin, setOrigin] = useState(PRESET_ORIGINS[0]);
  const [destination, setDestination] = useState(PRESET_DESTINATIONS[0]);
  const [mapboxRoute, setMapboxRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadRoute() {
      setIsCalculating(true);
      const data = await fetchMapboxRoute(origin.coords, destination.coords);
      if (isMounted) {
        setMapboxRoute(data);
        setIsCalculating(false);
      }
    }
    loadRoute();
    return () => { isMounted = false; };
  }, [origin, destination]);

  const handleCalculateRoute = () => {
    playSuccessChime();
    addToast({
      title: 'Journey Risk Assessed',
      message: `Comparing routes between ${origin.name} and ${destination.name}.`,
      type: 'info'
    });
  };

  const handlePreviewSafeRoute = () => {
    playSoftClick();
    if (onSelectRouteOnMap) {
      onSelectRouteOnMap({
        origin: origin.coords,
        destination: destination.coords,
        originName: origin.name,
        destName: destination.name,
        type: 'SAFE',
        geometry: mapboxRoute?.coordinates
      });
    }
    addToast({
      title: 'Safe Corridor Focused on Map',
      message: `Map centered on elevated expressway bypass corridor (${mapboxRoute?.distanceKm || '14.2'} km).`,
      type: 'success'
    });
  };

  const handlePreviewRiskRoute = () => {
    playWarningChime();
    if (onSelectRouteOnMap) {
      onSelectRouteOnMap({
        origin: origin.coords,
        destination: destination.coords,
        originName: origin.name,
        destName: destination.name,
        type: 'RISK'
      });
    }
    addToast({
      title: 'Warning: Flood Risk Route Focused',
      message: 'Highlighting submerged Nullah Lai choke points along Murree Road.',
      type: 'warning'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-up">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-950/60 shrink-0">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Module 9 — Journey Risk & Evacuation Navigator</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Twin Cities Route Risk & Safe Corridor Planner
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Plan your travel between Rawalpindi and Islamabad. Identifies submerged underpasses, Nullah Lai spillover choke points, and calculates elevated flood-free highway bypasses.
            </p>
          </div>
        </div>
      </div>

      {/* Origin / Destination Selector Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Origin Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Starting Point (Origin):</span>
            </label>
            <div className="space-y-2">
              {PRESET_ORIGINS.map(orig => (
                <div
                  key={orig.id}
                  onClick={() => {
                    playSoftClick();
                    setOrigin(orig);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    origin.id === orig.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{orig.name}</div>
                    <div className="text-[10px] text-slate-400">{orig.elevation}</div>
                  </div>
                  {origin.id === orig.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Destination Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Destination Point:</span>
            </label>
            <div className="space-y-2">
              {PRESET_DESTINATIONS.map(dest => (
                <div
                  key={dest.id}
                  onClick={() => {
                    playSoftClick();
                    setDestination(dest);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    destination.id === dest.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{dest.name}</div>
                    <div className="text-[10px] text-emerald-400">✓ High Elevation Safe Zone</div>
                  </div>
                  {destination.id === dest.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Calculation Output Card */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="font-extrabold text-sm text-white mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>Route Assessment Comparison:</span>
            <span className="text-xs text-slate-400 font-normal">
              ({origin.name} <ArrowRight className="inline w-3 h-3 text-emerald-400" /> {destination.name})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Route 1: Safe Route */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  RECOMMENDED SAFE ROUTE
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">0 Choke Points</span>
              </div>

              <h4 className="font-black text-base text-white">Via Islamabad Expressway & Srinagar Highway</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elevated multi-lane corridor bypasses Nullah Lai low-lying bridges completely. Grade-separated flyovers ensure uninterrupted passage even during heavy monsoon rainfall (&gt;35 mm/h).
              </p>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-900/40 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mapbox Driving Distance:</span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {isCalculating ? 'Calculating...' : `${mapboxRoute?.distanceKm || '14.2'} km`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimated Driving Time:</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {isCalculating ? 'Calculating...' : `${mapboxRoute?.durationMin || 24} mins`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Routing Highway:</span>
                  </span>
                  <span className="text-emerald-300 font-semibold truncate max-w-[180px]">
                    {mapboxRoute?.summary || 'Islamabad Expressway'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Flood Risk Factor:</span>
                  <span className="text-emerald-400 font-bold font-mono">0% (Elevated Bypass)</span>
                </div>
              </div>

              <button
                onClick={handlePreviewSafeRoute}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Preview Safe Corridor on Map</span>
              </button>
            </div>

            {/* Route 2: High Risk Route */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/40 space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  HAZARDOUS FLOOD ROUTE
                </div>
                <span className="text-[11px] font-mono text-rose-400 font-bold">3 Choke Points</span>
              </div>

              <h4 className="font-black text-base text-white">Via Murree Road & 6th Road Underpass</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passes through severe flash flood catchment areas. Water accumulation up to 2.5 feet recorded at Gwalmandi, Committee Chowk, and 6th Road Metro underpass during sudden storms.
              </p>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-rose-900/40 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Travel Time:</span>
                  <span className="font-mono text-rose-400 font-bold">45 - 65 mins (Heavy Traffic)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Flood Hazard Level:</span>
                  <span className="text-rose-400 font-bold font-mono">HIGH RISK</span>
                </div>
              </div>

              <button
                onClick={handlePreviewRiskRoute}
                className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Inspect Hazardous Choke Points</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
