import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import LayerControl from './components/LayerControl';
import ReportModal from './components/ReportModal';
import EmergencyModule from './components/EmergencyModule';
import TerraAI from './components/TerraAI';
import ResilienceDashboard from './components/ResilienceDashboard';
import ResourcesView from './components/ResourcesView';
import CommunityFeed from './components/CommunityFeed';
import RouteRiskPlanner from './components/RouteRiskPlanner';
import GodsEyeView from './components/GodsEyeView';
import OnboardingSplash from './components/OnboardingSplash';
import { ToastProvider, useToast } from './components/ToastNotification';

import { getLocalReports, saveLocalReport, confirmLocalReport, resolveLocalReport, supabase } from './services/supabaseClient';
import { fetchLiveWeather } from './services/weatherApi';
import { fetchNasaEonetEvents } from './services/nasaApi';
import { COMMUNITY_RESOURCES, NULLAH_LAI_GAUGE } from './services/mockData';
import { bleManager } from './services/bluetoothService';
import { addPoints } from './services/pointsService';
import { playSuccessChime, playWarningChime } from './services/uiSounds';

function MainApp() {
  const [activeTab, setActiveTab] = useState('map');
  const [lang, setLang] = useState('en');

  // 8 Map Layers State
  const [activeLayers, setActiveLayers] = useState({
    environmental: true,
    rainfall: true,
    flood: true,
    community: true,
    accessibility: true,
    mobility: true,
    resources: true,
    safety: true
  });

  // Data & Realtime Sync State
  const [reports, setReports] = useState(getLocalReports());
  const [resources, setResources] = useState(COMMUNITY_RESOURCES);
  const [nasaEvents, setNasaEvents] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);
  const [selectedCoordsForReport, setSelectedCoordsForReport] = useState(null);
  const [searchTargetLocation, setSearchTargetLocation] = useState(null);
  const [nullahLaiGauge, setNullahLaiGauge] = useState(NULLAH_LAI_GAUGE);
  const { addToast } = useToast();

  // Nullah Lai Water Gauge Live Tick Telemetry Simulation aligned with today's weather
  useEffect(() => {
    const timer = setInterval(() => {
      setNullahLaiGauge(prev => {
        // Gauge responds realistically to today's live rainfall conditions
        const isRainy = (weatherData?.precipitation ?? 0) > 10;
        const targetMin = isRainy ? 14.0 : 9.0;
        const targetMax = isRainy ? 22.0 : 10.6;
        const delta = (Math.random() * 0.2) - 0.1;
        const newLvl = Math.max(targetMin, Math.min(targetMax, +(prev.currentLevelFeet + delta).toFixed(1)));
        
        if (prev.currentLevelFeet < 15.0 && newLvl >= 15.0) {
          playWarningChime();
          addToast({
            title: 'Nullah Lai: Warning Stage Reached',
            message: `Water level measured at ${newLvl} ft. Elevated water velocity at Kattarian Bridge.`,
            type: 'warning'
          });
        } else if (prev.currentLevelFeet < 20.0 && newLvl >= 20.0) {
          playWarningChime();
          addToast({
            title: 'CRITICAL: Nullah Lai 20ft Evacuation Mark',
            message: `Water level at ${newLvl} ft! Severe overflow risk at Gwalmandi Bridge.`,
            type: 'error',
            duration: 8000
          });
        }

        let stage = 'NORMAL';
        if (newLvl >= 20.0) stage = 'EVACUATION';
        else if (newLvl >= 15.0) stage = 'WARNING';
        else if (newLvl >= 11.0) stage = 'ALERT';

        return {
          ...prev,
          currentLevelFeet: newLvl,
          gwalmandiLevel: newLvl,
          kattarianLevel: +(newLvl - 0.6).toFixed(1),
          stage,
          lastUpdated: 'Live telemetry synced today'
        };
      });
    }, 25000);
    return () => clearInterval(timer);
  }, [addToast, weatherData?.precipitation]);

  // Load telemetry & Setup Supabase Realtime WebSocket Listener
  useEffect(() => {
    async function loadData() {
      const weather = await fetchLiveWeather();
      setWeatherData(weather);

      const nasa = await fetchNasaEonetEvents();
      if (nasa.events) setNasaEvents(nasa.events);
    }
    loadData();

    // Subscribe to BLE connection state
    const unsub = bleManager.subscribe((event) => {
      if (event === 'CONNECTED') setBleConnected(true);
      if (event === 'DISCONNECTED') setBleConnected(false);
    });

    // Supabase Realtime WebSockets Channel listener
    if (supabase) {
      const channel = supabase.channel('terrarescue_realtime_reports')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
          setReports(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        unsub();
      };
    }

    return unsub;
  }, []);

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleAddReport = (newReport) => {
    const updated = saveLocalReport(newReport);
    setReports(updated);
    addPoints(10, 'Submitted community report');
  };

  const handleConfirmReport = (reportId) => {
    const updated = confirmLocalReport(reportId);
    setReports(updated);
  };

  const handleResolveReport = (reportId) => {
    const updated = resolveLocalReport(reportId);
    setReports(updated);
    addPoints(15, 'Resolved hazard report');
    playSuccessChime();
    addToast({
      title: 'Report Marked as Resolved',
      message: 'Great civic work! You earned +15 community resilience points.',
      type: 'success'
    });
  };

  const handleMapClickForReport = (lat, lng) => {
    setSelectedCoordsForReport({ lat, lng });
    setIsReportModalOpen(true);
  };

  const handleSearchResultSelect = (lat, lng, name) => {
    setActiveTab('map');
    setSearchTargetLocation({ lat, lng, name, timestamp: Date.now() });
  };

  const handleSelectResourceOnMap = (coords) => {
    setActiveTab('map');
    setActiveLayers(prev => ({ ...prev, resources: true }));
  };

  const handleFocusReportOnMap = (report) => {
    setActiveTab('map');
    setActiveLayers(prev => ({ ...prev, community: true }));
    const lat = report.coordinates ? report.coordinates[0] : report.location?.lat;
    const lng = report.coordinates ? report.coordinates[1] : report.location?.lng;
    if (lat && lng) {
      setSearchTargetLocation({
        lat,
        lng,
        name: report.title || report.locationName || report.sector || 'Report Location',
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white ${
      lang === 'ur' ? 'lang-ur' : ''
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          setSelectedCoordsForReport(null);
          setIsReportModalOpen(true);
        }}
        onOpenEmergencyModal={() => {
          setActiveTab('emergency');
          setIsEmergencyActive(true);
        }}
        bleConnected={bleConnected}
        lang={lang}
        setLang={setLang}
        onSearchResultSelect={handleSearchResultSelect}
        gaugeData={nullahLaiGauge}
      />

      {/* Main Viewport */}
      <main className="flex-1 relative flex flex-col">
        {activeTab === 'map' && (
          <div className="relative w-full h-[calc(100vh-4rem)] flex-1 overflow-hidden">
            <LayerControl
              activeLayers={activeLayers}
              toggleLayer={toggleLayer}
            />

            <MapView
              activeLayers={activeLayers}
              reports={reports}
              resources={resources}
              nasaEvents={nasaEvents}
              weatherInfo={weatherData}
              onConfirmReport={handleConfirmReport}
              onMapClickForReport={handleMapClickForReport}
              searchTargetLocation={searchTargetLocation}
              lang={lang}
            />
          </div>
        )}

        {activeTab === 'feed' && (
          <CommunityFeed
            reports={reports}
            onConfirm={handleConfirmReport}
            onResolve={handleResolveReport}
            onFocusReport={handleFocusReportOnMap}
            onOpenReportModal={() => {
              setSelectedCoordsForReport(null);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'routes' && (
          <RouteRiskPlanner
            lang={lang}
            onSelectRouteOnMap={(routeInfo) => {
              setActiveTab('map');
              if (routeInfo.origin) {
                setSearchTargetLocation({
                  lat: routeInfo.origin[0],
                  lng: routeInfo.origin[1],
                  name: `${routeInfo.type === 'SAFE' ? 'Safe Route' : 'Risk Route'}: ${routeInfo.originName} to ${routeInfo.destName}`,
                  timestamp: Date.now()
                });
              }
            }}
          />
        )}

        {activeTab === 'godseye' && (
          <GodsEyeView
            waterLevel={nullahLaiGauge.currentLevelFeet}
            rainData={weatherData}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyModule
            isEmergencyActive={isEmergencyActive}
            setIsEmergencyActive={setIsEmergencyActive}
            lang={lang}
          />
        )}

        {activeTab === 'terraai' && (
          <TerraAI
            weatherData={weatherData}
            nasaData={nasaEvents}
            reportsCount={reports.length}
            lang={lang}
          />
        )}

        {activeTab === 'dashboard' && (
          <ResilienceDashboard
            reports={reports}
            weatherData={weatherData}
            nasaData={nasaEvents}
            bleConnected={bleConnected}
            lang={lang}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            onSelectResourceOnMap={handleSelectResourceOnMap}
            lang={lang}
          />
        )}
      </main>

      {/* Report Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddReport}
        initialCoords={selectedCoordsForReport}
        lang={lang}
      />

      {/* Welcome Onboarding Walkthrough */}
      <OnboardingSplash lang={lang} />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
