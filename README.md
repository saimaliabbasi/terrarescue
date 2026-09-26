# 🌍 TerraRescue

**Crowdsourced hazard reporting and civic resilience platform for Rawalpindi–Islamabad**

Built for Imaginathon 2026 — Team Islamabad

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/638628f4-6c29-4650-b4f6-0b7df7d68b33" />


## 🚨 The Problem

Official sensors and satellite feeds can't monitor every street corner. Flash floods, open manholes, blocked storm drains, and unsafe situations for women and children go unreported until it's too late for residents or rescue teams to react. During monsoons and disasters, cellular networks degrade — and most emergency apps assume constant, high-bandwidth connectivity that simply isn't there.

## 💡 The Solution

TerraRescue turns every resident into a sensor. Citizens report hazards in seconds directly from an interactive live map, verified through a multi-tier trust system, synced in real time to nearby responders and rescue teams — all while working smoothly on weak or intermittent connections.

---

## ✨ Core Features

### 🗺️ Live City Map
- Real-time interactive map of Rawalpindi–Islamabad with hazard pins, severity rings, and quick-jump shortcuts to key landmarks (I-8 Markaz, Gwalmandi Bridge, E-11 Nullah, Saddar Metro, Faizabad).
- Multiple map themes: **Dark Stealth, Satellite, Night Arterials, Terrain, Streets, OSM** — switchable based on lighting/visibility needs.
- **8 active map layers** including flood zones, safe evacuation corridors, and hazard density overlays.
- **Safe Evacuation Corridors** highlighted directly on the map, filterable by severity (Critical / High / Medium).

### 🌊 Nullah Lai Gauge Monitoring
- Live water gauge level tracking (e.g. "9.8 ft — Normal Level") with a defined danger threshold (e.g. "20 ft at Gwalmandi Bridge"), giving early flood warnings before water reaches critical points.

### 📝 Community Incident & Hazard Reporting
- One-tap reporting via map click or "Report Hazard" button.
- Quick presets for common emergencies (flooded intersection, open manhole, blocked drain, inaccessible ramp).
- GPS auto-fill using the browser's Geolocation API.
- Client-side image compression (canvas-based, scaled to 800px width, 65% JPEG quality) — shrinks photos to under 200KB for fast uploads even on 2G/3G.
- **Trust hierarchy**: Unverified → Community Verified → Ground Evidence → Satellite-Verified (cross-referenced with NASA EONET data).

### 🆘 BLE Emergency / SOS System
- One-tap emergency trigger designed for women and children in unsafe situations.
- Locks in live GPS and silently alerts trusted contacts and nearby verified responders.
- Bluetooth Low Energy (BLE) support for offline-adjacent emergency signaling in low-connectivity zones.
- Decoy "fake call" screen to help safely exit dangerous face-to-face situations.

### 🧭 Safe Routes / Route Risk Planner
- Factors in active flood and obstruction reports to reroute people away from hazardous roads in real time.

### 🤖 TerraAI
- AI-powered summaries and insights combining incident reports, weather, and gauge data into a digestible disaster-resilience briefing.

### 🏆 Resilience Dashboard & Gamification
- Tracks community-wide resilience points (e.g. "85 Resilience Pts") from reporting, confirming, and resolving hazards.
- Leaderboard rankings to encourage sustained civic participation.

### 📡 Community Feed & Resources
- Searchable, filterable feed of active/resolved reports.
- "Focus on Map" linking between feed entries and their live map location.
- Community Resources tab for shared safety information.

### 🌦️ Live Environmental Context
- Real-time weather (temperature, rainfall, sky conditions) layered directly into the dashboard header.
- Multilingual support (e.g. Urdu toggle) for broader accessibility across Rawalpindi–Islamabad residents.

### 📴 Offline-First Architecture
- Reports stored locally first (`localStorage`) so the app works even without connectivity.
- Syncs automatically via **Supabase Realtime** (Postgres + WebSockets) once back online — no data loss, no manual refresh needed.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Mapping | Leaflet, Mapbox/Satellite tile layers |
| Realtime Backend | Supabase (Postgres + Realtime WebSockets) |
| Image Processing | HTML5 Canvas (client-side compression) |
| Geolocation | Browser Geolocation API |
| Offline Storage | localStorage |
| Emergency Signaling | Bluetooth Low Energy (BLE) |
| External Data | NASA EONET satellite feed |

---

## 🏙️ Domain

**Safety & Resilience**

## 🚫 Constraint Compliance

TerraRescue relies entirely on citizen-generated data, community verification, and open satellite feeds (NASA EONET) — no dependency on government infrastructure or data sources, per Imaginathon submission rules.

## 👥 Team

Team Islamabad — Imaginathon 2026

## 📄 License

MIT (or update as applicable)
