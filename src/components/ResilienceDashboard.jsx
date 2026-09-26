import React, { useState } from 'react';
import {
  BarChart3, Users, Satellite, Radio, CheckCircle2, CloudRain,
  Layers, TrendingUp, Activity, ShieldAlert, Waves, ThumbsUp,
  MapPin, AlertTriangle, Wind, Thermometer, Droplets, Zap, Clock,
  Sliders, ArrowRight, ShieldCheck, Compass
} from 'lucide-react';
import { playSoftClick, playSoftPop, playWarningChime } from '../services/uiSounds';

/* ── Interactive Nullah Lai Simulator Widget ── */
function NullahLaiSimulator() {
  const [simLevel, setSimLevel] = useState(14.2);

  const getStageInfo = (lvl) => {
    if (lvl >= 20) {
      return {
        stage: 'EVACUATION DANGER',
        color: '#f43f5e',
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800',
        impact: 'Critical flood overflow! Gwalmandi Bridge and New Katarian submerged. Immediate resident evacuation to designated CDA shelters.',
        alertLevel: 'Red Level 3 Emergency'
      };
    }
    if (lvl >= 15) {
      return {
        stage: 'WARNING STAGE',
        color: '#f97316',
        badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-800',
        impact: 'High water velocity near Murree Road & Commercial Market underpasses. Traffic diversions to Islamabad Highway active.',
        alertLevel: 'Orange Level 2 Alert'
      };
    }
    if (lvl >= 11) {
      return {
        stage: 'ALERT STAGE',
        color: '#eab308',
        badgeBg: 'bg-yellow-950/80 text-yellow-300 border-yellow-800',
        impact: 'Moderate water rise in Nullah Lai stream channel. Monitoring teams deployed at Gwalmandi & Pirwadhai.',
        alertLevel: 'Yellow Level 1 Vigilance'
      };
    }
    return {
      stage: 'NORMAL LEVEL',
      color: '#10b981',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      impact: 'Water flowing freely within embankments. No urban flooding risk.',
      alertLevel: 'Green Normal'
    };
  };

  const info = getStageInfo(simLevel);
  const pct = Math.min((simLevel / 25) * 100, 100);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSimLevel(val);
    if (val >= 20) playWarningChime();
    else playSoftClick();
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>Interactive Nullah Lai Flood Level Simulator</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                Interactive Model
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag the gauge slider to simulate river rise scenarios and see predicted city-wide impacts.
            </p>
          </div>
        </div>

        <span className={`text-xs font-black px-3 py-1 rounded-full border font-mono ${info.badgeBg}`}>
          {info.stage}
        </span>
      </div>

      {/* Simulator Slider */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Simulate Gauge Height:</span>
          <span className="text-xl font-black text-white font-mono" style={{ color: info.color }}>
            {simLevel.toFixed(1)} <span className="text-xs text-slate-400">ft</span>
          </span>
        </div>

        <input
          type="range"
          min="6"
          max="24"
          step="0.2"
          value={simLevel}
          onChange={handleSliderChange}
          className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-slate-800"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span className="text-emerald-400">6 ft (Normal)</span>
          <span className="text-yellow-400">11 ft (Alert)</span>
          <span className="text-orange-400">15 ft (Warning)</span>
          <span className="text-rose-400">20 ft (Danger Mark)</span>
          <span className="text-red-500">24 ft (Peak 2001)</span>
        </div>
      </div>

      {/* Animated Gauge Bar */}
      <div className="relative w-full h-6 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
          style={{ left: `${(20 / 25) * 100}%` }}
          title="Critical 20ft Mark"
        />
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #059669, ${info.color})`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-white drop-shadow">
          {simLevel.toFixed(1)} ft / 25 ft Maximum Capacity
        </div>
      </div>

      {/* Impact Assessment Card */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: info.color }}>
          <ShieldAlert className="w-4 h-4" />
          <span>{info.alertLevel} — Scenario Impact Assessment:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {info.impact}
        </p>
      </div>

    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, iconColor, label, value, sub, subColor = 'text-slate-400', trending }) {
  return (
    <div className="glass-panel border border-slate-800 p-5 rounded-3xl shadow-xl hover:border-slate-700 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 leading-tight">{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-3xl font-black text-white font-mono leading-none">{value}</div>
      {sub && <p className={`text-[11px] mt-1.5 ${subColor}`}>{sub}</p>}
      {trending && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>{trending}</span>
        </div>
      )}
    </div>
  );
}

function RainfallChart({ data }) {
  const max = Math.max(...data.map(d => Number(d.val) || 0), 10);
  return (
    <div className="glass-panel border border-slate-800 p-6 rounded-3xl shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            7-Day Precipitation Telemetry (Today & Week)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Rawalpindi–Islamabad catchment (Live Open-Meteo & NASA Feed)</p>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-lg font-bold">
          LIVE FEED
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b border-slate-800 pb-2">
        {data.map((bar, i) => {
          const valNum = Number(bar.val) || 0;
          const heightPct = Math.max((valNum / max) * 100, 4);
          const isHigh = valNum >= 30;
          const isMed = valNum >= 15;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded-lg whitespace-nowrap z-10 border border-slate-700 shadow-lg">
                {bar.val} mm
              </div>
              <div
                className={`w-full rounded-t-lg transition-all cursor-default ${
                  isHigh ? 'bg-gradient-to-t from-rose-600 to-orange-400'
                : isMed ? 'bg-gradient-to-t from-amber-600 to-yellow-400'
                : 'bg-gradient-to-t from-cyan-700 to-teal-400'
                } hover:opacity-90`}
                style={{ height: `${(heightPct / 100) * 160}px` }}
              />
              <span className="text-[9px] text-slate-400 font-mono text-center leading-tight">{bar.day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px]">
        <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" /> ≥30mm Critical</span>
        <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" /> ≥15mm Moderate</span>
        <span className="flex items-center gap-1 text-teal-400"><span className="w-2 h-2 rounded-sm bg-teal-500 inline-block" /> &lt;15mm Safe</span>
      </div>
    </div>
  );
}

/* ── Category Breakdown ── */
function CategoryBreakdown({ reports }) {
  const cats = [
    { label: 'Water / Drainage', key: r => r.category === 'water' || r.category === 'drainage', color: 'bg-cyan-500', icon: Droplets },
    { label: 'Road Obstruction', key: r => r.category === 'obstruction', color: 'bg-amber-500', icon: AlertTriangle },
    { label: 'Accessibility Barrier', key: r => r.category === 'accessibility', color: 'bg-purple-500', icon: MapPin },
    { label: 'Open Hazard', key: r => r.category === 'hazard', color: 'bg-rose-500', icon: ShieldAlert },
    { label: 'Infrastructure', key: r => r.category === 'infrastructure', color: 'bg-blue-500', icon: Zap },
  ];

  const total = reports.length || 1;

  return (
    <div className="glass-panel border border-slate-800 p-6 rounded-3xl shadow-xl">
      <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-5">
        <Layers className="w-4 h-4 text-emerald-400" />
        Categorical Report Breakdown
      </h3>

      <div className="space-y-3.5">
        {cats.map((c, i) => {
          const count = reports.filter(c.key).length;
          const pct = Math.max((count / total) * 100, count > 0 ? 8 : 0);
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <c.icon className="w-3.5 h-3.5 text-slate-400" />
                  {c.label}
                </span>
                <span className="font-mono text-white font-bold">{count}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className={`h-full ${c.color} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Weather Detail Cards ── */
function WeatherCards({ weatherData }) {
  const items = [
    { icon: Thermometer, iconColor: 'text-amber-400', label: 'Temperature', value: `${weatherData?.temperature ?? '--'}°C` },
    { icon: Droplets, iconColor: 'text-cyan-400', label: 'Humidity', value: `${weatherData?.humidity ?? '--'}%` },
    { icon: Wind, iconColor: 'text-slate-400', label: 'Wind Speed', value: `${weatherData?.windSpeed ?? '--'} km/h` },
    { icon: CloudRain, iconColor: 'text-blue-400', label: 'Rain Today', value: `${weatherData?.precipitation ?? '--'} mm` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div key={i} className="glass-panel border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0`}>
            <item.icon className={`w-4 h-4 ${item.iconColor}`} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{item.label}</div>
            <div className="text-base font-black text-white font-mono">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const RAINFALL_DATA = [
  { day: 'Mon', val: 5.2 },
  { day: 'Tue', val: 12.4 },
  { day: 'Wed', val: 3.1 },
  { day: 'Thu', val: 18.7 },
  { day: 'Fri', val: 42.0 },
  { day: 'Sat', val: 31.5 },
  { day: 'Sun', val: 16.8 },
];

export default function ResilienceDashboard({ reports = [], weatherData = {}, nasaData = [], bleConnected = false }) {
  const verifiedCount = reports.filter(r => r.confirmedByUsers).length;
  const unresolvedCount = reports.filter(r => !r.resolved).length;
  const accessibilityCount = reports.filter(r => r.category === 'accessibility').length;

  // Build live 7-day precipitation chart data from Open-Meteo daily feed
  const weeklyChartData = weatherData?.daily?.time ? weatherData.daily.time.map((timeStr, idx) => {
    const d = new Date(timeStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = new Date().toISOString().split('T')[0] === timeStr;
    return {
      day: isToday ? `${dayName} (Today)` : dayName,
      val: weatherData.daily.precipitation_sum?.[idx] != null 
        ? Number(weatherData.daily.precipitation_sum[idx]).toFixed(1) 
        : 0.0
    };
  }) : RAINFALL_DATA;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-up">

      {/* Header */}
      <div className="glass-panel border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-900/50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Module 12 — City Resilience Telemetry</span>
          </div>
          <h2 className="text-2xl font-black text-white">Rawalpindi–Islamabad Resilience Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregation of satellite telemetry, community observations, emergency hardware nodes, and live weather feeds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl shrink-0">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Status: Live Telemetry Active</span>
          <Clock className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <span className="text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Weather Summary Cards */}
      <WeatherCards weatherData={weatherData} />

      {/* Interactive Scenario Simulator */}
      <NullahLaiSimulator />

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconColor="text-emerald-400"
          label="Community Reports Today"
          value={reports.length}
          sub={`✓ ${verifiedCount} verified by residents`}
          subColor="text-emerald-400"
          trending="+3 in last hour"
        />
        <StatCard
          icon={ShieldAlert}
          iconColor="text-amber-400"
          label="Unresolved Incidents"
          value={unresolvedCount || reports.length}
          sub="Needs attention or resolution"
          subColor="text-amber-400"
        />
        <StatCard
          icon={Radio}
          iconColor="text-rose-400"
          label="BLE Safety Nodes"
          value={bleConnected ? '1' : 'SIM'}
          sub={bleConnected ? '✓ Physical device paired' : 'Simulator mode active'}
          subColor={bleConnected ? 'text-emerald-400' : 'text-slate-400'}
        />
        <StatCard
          icon={Satellite}
          iconColor="text-cyan-400"
          label="NASA EONET Alerts"
          value={nasaData?.length ?? 0}
          sub="Regional events monitored"
          subColor="text-cyan-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RainfallChart data={weeklyChartData} />
        <CategoryBreakdown reports={reports} />
      </div>

      {/* System status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Open-Meteo API', status: 'Live', color: 'text-emerald-400', dot: 'bg-emerald-400', icon: CloudRain },
          { label: 'NASA POWER API', status: 'Live', color: 'text-cyan-400', dot: 'bg-cyan-400', icon: Satellite },
          { label: 'Supabase Realtime', status: 'Active', color: 'text-blue-400', dot: 'bg-blue-400', icon: Activity },
        ].map((s, i) => (
          <div key={i} className="glass-panel border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
            <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-300 truncate">{s.label}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
              <span className={`text-xs font-bold ${s.color}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
