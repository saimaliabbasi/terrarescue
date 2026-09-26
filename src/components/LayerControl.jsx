import React, { useState } from 'react';
import { 
  Layers, 
  Satellite, 
  CloudRain, 
  Waves, 
  Users, 
  Accessibility, 
  Navigation, 
  Home, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { playSoftClick, playSoftPop } from '../services/uiSounds';

export default function LayerControl({ activeLayers, toggleLayer }) {
  const [isOpen, setIsOpen] = useState(false);

  const layerDefinitions = [
    {
      id: 'environmental',
      label: 'Layer 1 — Environmental',
      sublabel: '🛰️ NASA EONET & Satellites',
      icon: Satellite,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40 border-cyan-800/60'
    },
    {
      id: 'rainfall',
      label: 'Layer 2 — Rainfall & Weather',
      sublabel: '🌧️ Real-time precipitation',
      icon: CloudRain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-800/60'
    },
    {
      id: 'flood',
      label: 'Layer 3 — Flood Risk Zones',
      sublabel: '🌊 Nullah Lai Catchments',
      icon: Waves,
      color: 'text-teal-400',
      bgColor: 'bg-teal-950/40 border-teal-800/60'
    },
    {
      id: 'community',
      label: 'Layer 4 — Community Reports',
      sublabel: '👥 Verified Crowdsource alerts',
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/60'
    },
    {
      id: 'accessibility',
      label: 'Layer 5 — Accessibility',
      sublabel: '♿ Ramps, barriers, walkways',
      icon: Accessibility,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800/60'
    },
    {
      id: 'mobility',
      label: 'Layer 6 — Road Obstructions',
      sublabel: '🚶 Flooded roads & hazards',
      icon: Navigation,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/60'
    },
    {
      id: 'resources',
      label: 'Layer 7 — Resilient Resources',
      sublabel: '🏠 Charging, water, shelters',
      icon: Home,
      color: 'text-green-400',
      bgColor: 'bg-green-950/40 border-green-800/60'
    },
    {
      id: 'safety',
      label: 'Layer 8 — Personal Safety',
      sublabel: '🆘 Emergency hotspots & BLE',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40 border-rose-800/60'
    }
  ];

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="absolute top-16 left-4 z-[400] w-72 max-w-[calc(100vw-2rem)] select-none">
      <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Toggle Header */}
        <button
          onClick={() => {
            playSoftPop();
            setIsOpen(!isOpen);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/60 hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-xs text-white">Map Layers</span>
            <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-800/60 font-bold">
              {activeCount}/8 Active
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Layer Selector Content */}
        {isOpen && (
          <div className="p-2.5 space-y-1.5 max-h-[60vh] overflow-y-auto animate-fade-up">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1 font-mono">
              Toggle Twin-Cities Data Layers
            </div>
            {layerDefinitions.map((layer) => {
              const Icon = layer.icon;
              const isEnabled = activeLayers[layer.id];
              return (
                <div
                  key={layer.id}
                  onClick={() => {
                    playSoftClick();
                    toggleLayer(layer.id);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all active:scale-98 ${
                    isEnabled
                      ? `${layer.bgColor} shadow-sm font-semibold`
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-slate-900/80' : 'bg-slate-900/40'}`}>
                      <Icon className={`w-3.5 h-3.5 ${isEnabled ? layer.color : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className={`text-[11px] font-bold ${isEnabled ? 'text-white' : 'text-slate-300'}`}>
                        {layer.label}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {layer.sublabel}
                      </div>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    isEnabled 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-600/40' 
                      : 'border-slate-700 bg-slate-900'
                  }`}>
                    {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
