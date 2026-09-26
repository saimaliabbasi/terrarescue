import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus, MapPin, Clock, ThumbsUp, Eye, Camera,
  Filter, Search, SortDesc, CheckCircle2, AlertTriangle,
  Droplets, ShieldAlert, Accessibility, Layers, BarChart3,
  CheckCheck, XCircle, Loader2, Award, Trophy, Check, Sparkles
} from 'lucide-react';
import { getCommunityLeaderboard, addPoints, getPoints } from '../services/pointsService';
import { playSoftClick, playSoftPop, playSuccessChime } from '../services/uiSounds';

const CATEGORY_META = {
  water:         { label: 'Water / Flood',       color: 'bg-cyan-500/15 text-cyan-300 border-cyan-800/50',     icon: Droplets,      dot: 'bg-cyan-400' },
  drainage:      { label: 'Drainage',             color: 'bg-teal-500/15 text-teal-300 border-teal-800/50',     icon: Droplets,      dot: 'bg-teal-400' },
  obstruction:   { label: 'Road Obstruction',     color: 'bg-amber-500/15 text-amber-300 border-amber-800/50', icon: AlertTriangle,  dot: 'bg-amber-400' },
  hazard:        { label: 'Open Hazard',          color: 'bg-rose-500/15 text-rose-300 border-rose-800/50',    icon: ShieldAlert,   dot: 'bg-rose-400' },
  accessibility: { label: 'Accessibility',        color: 'bg-purple-500/15 text-purple-300 border-purple-800/50', icon: Accessibility, dot: 'bg-purple-400' },
  infrastructure:{ label: 'Infrastructure',       color: 'bg-blue-500/15 text-blue-300 border-blue-800/50',    icon: Layers,        dot: 'bg-blue-400' },
  default:       { label: 'General Report',       color: 'bg-slate-700/40 text-slate-300 border-slate-700',    icon: MessageSquarePlus, dot: 'bg-slate-400' },
};

function getCat(cat) {
  return CATEGORY_META[cat] || CATEGORY_META.default;
}

function timeAgo(ts) {
  if (!ts) return 'just now';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Verify button with loading state ── */
function VerifyButton({ report, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    playSoftPop();
    await new Promise(r => setTimeout(r, 500)); // simulated async
    onConfirm(report.id);
    addPoints(5, 'Verified community report');
    playSuccessChime();
    setLoading(false);
    setDone(true);
  };

  if (done || report.confirmedByUsers) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
        <CheckCheck className="w-3.5 h-3.5" /> Verified (+5 pts)
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-700 bg-slate-900 hover:bg-emerald-950/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
    >
      {loading
        ? <><Loader2 className="w-3 h-3 animate-spin" /> Confirming...</>
        : <><ThumbsUp className="w-3 h-3" /> Confirm (+5 pts)</>
      }
    </button>
  );
}

/* ── Individual Report Card ── */
function ReportCard({ report, onConfirm, onFocus, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCat(report.category);
  const CatIcon = meta.icon;
  const isResolved = report.resolved || report.status === 'resolved';

  return (
    <div
      className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-700 ${
        isResolved ? 'border-slate-800/40 opacity-70 bg-slate-950/60' : 'border-slate-800'
      }`}
    >
      <div className="p-4">
        {/* Top row: category badge + time + resolved tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.color}`}>
            <CatIcon className="w-3 h-3" />
            {meta.label}
          </div>
          <div className="flex items-center gap-2">
            {isResolved && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-bold">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              {timeAgo(report.timestamp)}
            </span>
          </div>
        </div>

        {/* Title and description */}
        <h3 className={`font-bold text-sm mb-1 leading-tight ${isResolved ? 'line-through text-slate-400' : 'text-white'}`}>
          {report.title || report.description}
        </h3>
        {report.description && report.title && (
          <p className={`text-xs text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {report.description}
          </p>
        )}
        {report.description && report.title && report.description.length > 80 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[11px] text-emerald-400 hover:underline mt-0.5 cursor-pointer"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
          <MapPin className="w-3 h-3 text-emerald-500" />
          <span>
            {report.locationName || report.sector || (report.coordinates ? `${report.coordinates[0]?.toFixed(4)}, ${report.coordinates[1]?.toFixed(4)}` : report.location?.lat ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}` : 'Rawalpindi–Islamabad')}
          </span>
        </div>

        {/* Photo thumbnail if any */}
        {report.photoUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 cursor-pointer" onClick={() => setExpanded(v => !v)}>
            <img
              src={report.photoUrl}
              alt="Report evidence"
              className="w-full h-28 object-cover hover:opacity-90 transition-opacity"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <VerifyButton report={report} onConfirm={onConfirm} />
            
            {onResolve && !isResolved && (
              <button
                onClick={() => onResolve(report.id)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-800 bg-slate-900 hover:bg-emerald-950/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Resolve (+15 pts)</span>
              </button>
            )}

            <button
              onClick={() => onFocus(report)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-800 bg-slate-900 hover:bg-cyan-950/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
            >
              <MapPin className="w-3 h-3" /> Map
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            {report.confirmedByUsers && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Verified</span>
              </span>
            )}
            {report.photoUrl && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-slate-400" />
                Evidence
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'All Reports' },
  { key: 'unresolved', label: '⚠️ Unresolved Only' },
  { key: 'resolved', label: '✓ Resolved Only' },
  { key: 'water', label: 'Water / Flood' },
  { key: 'obstruction', label: 'Obstruction' },
  { key: 'hazard', label: 'Hazard' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'verified', label: '👥 Verified Only' },
];

const POPULAR_SECTORS = ['All Sectors', 'Sector I-8', 'Gwalmandi', 'Commercial Market', 'Faizabad', 'Sector E-11', 'Saddar'];

export default function CommunityFeed({ reports = [], onConfirm, onResolve, onFocusReport, onOpenReportModal }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [sortNewest, setSortNewest] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getCommunityLeaderboard());

  useEffect(() => {
    const handleUpdate = () => setLeaderboard(getCommunityLeaderboard());
    window.addEventListener('terrarescue:points_updated', handleUpdate);
    return () => window.removeEventListener('terrarescue:points_updated', handleUpdate);
  }, []);

  const getSectorCount = (sec) => {
    if (sec === 'All Sectors') return reports.length;
    const q = sec.toLowerCase();
    return reports.filter(r => 
      (r.sector || '').toLowerCase().includes(q) || 
      (r.locationName || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q)
    ).length;
  };

  const filtered = reports
    .filter(r => {
      const isResolved = r.resolved || r.status === 'resolved';
      if (filter === 'verified') return r.confirmedByUsers;
      if (filter === 'unresolved') return !isResolved;
      if (filter === 'resolved') return isResolved;
      if (filter !== 'all') return r.category === filter;
      return true;
    })
    .filter(r => {
      if (selectedSector === 'All Sectors') return true;
      const sec = selectedSector.toLowerCase();
      return (
        (r.sector || '').toLowerCase().includes(sec) ||
        (r.locationName || '').toLowerCase().includes(sec) ||
        (r.title || '').toLowerCase().includes(sec)
      );
    })
    .filter(r => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (r.title || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s) ||
        (r.sector || '').toLowerCase().includes(s) ||
        (r.category || '').toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });

  const verifiedCount = reports.filter(r => r.confirmedByUsers).length;
  const unresolvedCount = reports.filter(r => !(r.resolved || r.status === 'resolved')).length;
  const resolvedCount = reports.filter(r => r.resolved || r.status === 'resolved').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-fade-up">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-900/50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2">
              <MessageSquarePlus className="w-3 h-3" />
              <span>Community Intelligence Feed</span>
            </div>
            <h2 className="text-xl font-black text-white">Live Ground Observations</h2>
            <p className="text-xs text-slate-400 mt-1">Crowdsourced flood & safety reports from Rawalpindi–Islamabad citizens.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSoftClick();
                setShowLeaderboard(prev => !prev);
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-amber-500/30 transition-all cursor-pointer active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{showLeaderboard ? 'Hide Heroes' : 'Resilience Heroes'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Total', value: reports.length, color: 'text-white' },
            { label: 'Active', value: unresolvedCount, color: 'text-amber-400' },
            { label: 'Resolved', value: resolvedCount, color: 'text-emerald-400' },
            { label: 'Verified', value: verifiedCount, color: 'text-cyan-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-2.5 py-2 text-center">
              <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toggleable Leaderboard Card */}
        {showLeaderboard && (
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-500/20 space-y-3 animate-fade-up">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Rawalpindi-ISB Resilience Leaderboard
              </span>
              <span className="text-[10px] text-slate-400">Earn +10 report · +5 verify · +15 resolve</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {leaderboard.slice(0, 4).map((hero) => (
                <div
                  key={hero.rank}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    hero.isUser 
                      ? 'bg-emerald-950/50 border-emerald-600/60 text-white font-bold' 
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-amber-400 font-black">
                      #{hero.rank}
                    </span>
                    <div>
                      <div className="font-bold">{hero.name}</div>
                      <div className="text-[10px] text-slate-400">{hero.sector}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-amber-400 font-bold">{hero.points} pts</span>
                    <div className="text-[9px] text-slate-500">{hero.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Neighborhood Sector Pills Filter */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 px-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>Twin Cities Neighborhood / Sector Filter:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_SECTORS.map(sec => {
            const count = getSectorCount(sec);
            const isSelected = selectedSector === sec;
            return (
              <button
                key={sec}
                onClick={() => {
                  playSoftClick();
                  setSelectedSector(sec);
                }}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{sec}</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-slate-950/60 text-emerald-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Sort bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search reports by keyword, sector, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
        <button
          onClick={() => {
            playSoftClick();
            setSortNewest(v => !v);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-xl whitespace-nowrap transition-all hover:border-slate-600 cursor-pointer active:scale-95"
        >
          <SortDesc className="w-3.5 h-3.5" />
          {sortNewest ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Filter Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => {
              playSoftClick();
              setFilter(f.key);
            }}
            className={`text-[11px] px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              filter === f.key
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing <b className="text-slate-300">{filtered.length}</b> of {reports.length} reports
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live Community Feed
        </span>
      </div>

      {/* Feed list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 space-y-3">
          <MessageSquarePlus className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm">No reports match your filters.</p>
          <button
            onClick={() => { 
              playSoftClick();
              setFilter('all'); 
              setSearch(''); 
              setSelectedSector('All Sectors');
            }}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <ReportCard
              key={r.id}
              report={r}
              onConfirm={onConfirm}
              onResolve={onResolve}
              onFocus={onFocusReport}
            />
          ))}
        </div>
      )}

    </div>
  );
}
