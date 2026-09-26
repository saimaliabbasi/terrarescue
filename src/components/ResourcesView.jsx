import React from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Zap, 
  Droplets, 
  Wifi, 
  Home, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { COMMUNITY_RESOURCES } from '../services/mockData';
import { playSoftClick } from '../services/uiSounds';

export default function ResourcesView({ onSelectResourceOnMap }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex items-start gap-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/60 shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <Home className="w-3.5 h-3.5" />
            <span>Module 8 — Community Resilient Resources</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Rawalpindi–Islamabad Shared Community Resources
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            Voluntarily mapped flood shelters, 24/7 medical response hubs, solar phone charging stations, and clean drinking water points.
          </p>
        </div>
      </div>

      {/* Resource Cards Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COMMUNITY_RESOURCES.map((res) => (
          <div
            key={res.id}
            className="glass-panel border border-slate-800/80 hover:border-slate-700 p-6 rounded-3xl shadow-xl space-y-4 transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full uppercase">
                  {res.type}
                </span>
                <h3 className="font-black text-base text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                  {res.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{res.address}</span>
                </p>
              </div>

              <span className="flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-emerald-800/60 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{res.status}</span>
              </span>
            </div>

            {/* Facilities Chips */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">
                Available Facilities & Equipment:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {res.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-950/80 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl font-medium"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact & Map Action */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <a 
                href={`tel:${res.contact.split(' ')[0]}`}
                className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{res.contact}</span>
              </a>

              <button
                onClick={() => {
                  playSoftClick();
                  onSelectResourceOnMap(res.coordinates);
                }}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Focus on Map</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
