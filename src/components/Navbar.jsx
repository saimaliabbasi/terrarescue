import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Bot, 
  BarChart3, 
  PlusCircle, 
  Search, 
  Globe, 
  Building2, 
  Waves, 
  ChevronRight, 
  MessageSquarePlus,
  Volume2,
  VolumeX,
  Sparkles,
  Route,
  Award,
  Eye
} from 'lucide-react';
import { t } from '../services/i18n';
import { searchSectorOrLandmark } from '../services/nominatimApi';
import { NULLAH_LAI_GAUGE } from '../services/mockData';
import { isSoundEnabled, toggleSoundEnabled, playSoftClick, playSoftPop } from '../services/uiSounds';
import { getPoints } from '../services/pointsService';
import { useToast } from './ToastNotification';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenReportModal, 
  onOpenEmergencyModal,
  bleConnected,
  lang,
  setLang,
  onSearchResultSelect,
  gaugeData = NULLAH_LAI_GAUGE
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [userPoints, setUserPoints] = useState(getPoints());
  const { addToast } = useToast();

  useEffect(() => {
    const handlePointsUpdate = (e) => {
      if (e.detail?.points) setUserPoints(e.detail.points);
    };
    window.addEventListener('terrarescue:points_updated', handlePointsUpdate);
    return () => window.removeEventListener('terrarescue:points_updated', handlePointsUpdate);
  }, []);

  const tabs = [
    { id: 'map', label: t('navMap', lang), icon: MapPin },
    { id: 'feed', label: t('navFeed', lang), icon: MessageSquarePlus },
    { id: 'routes', label: t('navRoutes', lang), icon: Route },
    { id: 'godseye', label: t('navGodsEye', lang), icon: Eye },
    { id: 'emergency', label: t('navEmergency', lang), icon: Radio, highlight: true },
    { id: 'terraai', label: t('navTerraAi', lang), icon: Bot },
    { id: 'dashboard', label: t('navDashboard', lang), icon: BarChart3 },
    { id: 'resources', label: t('navResources', lang), icon: Building2 }
  ];

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    playSoftPop();
    const results = await searchSectorOrLandmark(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectLocation = (result) => {
    playSoftClick();
    setSearchResults([]);
    setSearchQuery('');
    if (onSearchResultSelect) {
      onSearchResultSelect(result.lat, result.lng, result.shortName);
    }
  };

  const handleToggleSound = () => {
    const newState = toggleSoundEnabled();
    setSoundOn(newState);
    addToast({
      title: newState ? 'Audio Feedback Enabled' : 'Audio Feedback Muted',
      message: newState ? 'Tactile sound chimes active.' : 'UI sound effects turned off.',
      type: 'info'
    });
  };

  const handleTabChange = (tabId) => {
    playSoftClick();
    setActiveTab(tabId);
  };

  return (
    <header className="glass-panel border-b border-slate-800 sticky top-0 z-40 shadow-2xl">
      
      {/* Top Telemetry & Nullah Lai Gauge Ticker Bar */}
      <div className="bg-slate-950/90 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 overflow-x-auto text-slate-300">
          <span className="flex items-center gap-1 text-cyan-400 font-extrabold">
            <Waves className="w-3.5 h-3.5" />
            <span>{t('laiGaugeTitle', lang)}:</span>
          </span>
          
          <span className={`px-2 py-0.5 rounded-md font-bold border transition-colors ${
            gaugeData.currentLevelFeet >= 20
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse'
              : gaugeData.currentLevelFeet >= 15
              ? 'bg-orange-950/80 text-orange-300 border-orange-800/80'
              : gaugeData.currentLevelFeet >= 11
              ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
          }`}>
            {gaugeData.currentLevelFeet.toFixed(1)} ft — {
              gaugeData.currentLevelFeet >= 20 ? t('evacuationStage', lang)
              : gaugeData.currentLevelFeet >= 15 ? t('warningStage', lang)
              : gaugeData.currentLevelFeet >= 11 ? t('alertStage', lang)
              : t('normalStage', lang)
            }
          </span>

          <span className="text-slate-400 hidden sm:inline text-[10px]">
            (Danger mark: {gaugeData.dangerMarkFeet || 20.0} ft at Gwalmandi Bridge)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User Resilience Points Badge */}
          <div 
            title="Your Community Resilience Points"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/70 px-2.5 py-1 rounded-lg font-bold"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{userPoints} {t('pointsLabel', lang)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              playSoftPop();
              const nextLang = lang === 'en' ? 'ur' : 'en';
              setLang(nextLang);
              addToast({
                title: nextLang === 'ur' ? 'اردو زبان فعال' : 'English Mode Activated',
                type: 'info'
              });
            }}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-lg text-emerald-400 font-bold transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو (Urdu)' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Location */}
          <div 
            className="flex items-center gap-3 cursor-pointer shrink-0 transition-transform active:scale-98" 
            onClick={() => handleTabChange('map')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">
                  {t('brandTitle', lang)}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-md">
                  {t('brandSubtitle', lang)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('tagline', lang)}
              </p>
            </div>
          </div>

          {/* Real-time Sector Search Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder', lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {isSearching && (
                <div className="absolute right-3 top-3 w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              )}
            </form>

            {/* Nominatim Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelectLocation(res)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs border-b border-slate-800/60 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{res.shortName}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 glass-pill p-1.5 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                      : tab.highlight
                      ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playSoftPop();
                onOpenReportModal();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportBtn', lang)}</span>
            </button>

            <button
              onClick={() => {
                playSoftPop();
                onOpenEmergencyModal();
              }}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-xl shadow-rose-950/80 transition-all border border-rose-400/40 animate-pulse cursor-pointer active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="font-mono">{t('sosBtn', lang)}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/60 text-xs gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
