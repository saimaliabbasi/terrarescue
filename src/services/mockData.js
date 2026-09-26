// Rawalpindi–Islamabad Geography & Environmental Datasets

export const RAWALPINDI_ISLAMABAD_BOUNDS = {
  center: [33.6450, 73.0600], // Centered between Islamabad & Rawalpindi
  zoom: 12,
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5973, 73.0479]
};

// Nullah Lai Live Water Level Telemetry Gauge (Present Reading)
export const NULLAH_LAI_GAUGE = {
  currentLevelFeet: 9.8,
  stage: 'NORMAL', // NORMAL (<11ft) | ALERT (11-15ft) | WARNING (15-20ft) | EVACUATION (>20ft)
  stageLabel: 'NORMAL LEVEL',
  dangerMarkFeet: 20.0,
  gwalmandiLevel: 9.8,
  kattarianLevel: 9.2,
  lastUpdated: 'Live telemetry synced today',
  trend: 'STABLE_CLEAR'
};

// Nullah Lai Catchment Stream Coordinates & High Risk Polygons
export const NULLAH_LAI_STREAM = [
  [33.7220, 73.0330], // Margalla hills stream origin
  [33.7050, 73.0450], // Sector E-11/F-11 junction
  [33.6780, 73.0550], // Sector I-9 stream
  [33.6450, 73.0620], // Katarian Bridge
  [33.6210, 73.0660], // New Katarian / Pirwadhai
  [33.6050, 73.0650], // Khayaban-e-Sir Syed
  [33.5940, 73.0640], // Gwalmandi Bridge
  [33.5850, 73.0680], // Saddar / Murree Road
  [33.5650, 73.0800]  // Soan River Confluence
];

export const FLOOD_RISK_ZONES = [
  {
    id: 'zone-1',
    name: 'Nullah Lai Main Channel (Gwalmandi to New Katarian)',
    severity: 'HIGH',
    coordinates: [
      [33.6480, 73.0580],
      [33.6450, 73.0680],
      [33.5900, 73.0700],
      [33.5900, 73.0580]
    ],
    description: 'Historical severe flooding zone during monsoon downpours. Critical monitoring point at Gwalmandi Bridge.',
    historicalMaxWaterLevel: '22.5 ft (Danger level: 20 ft)',
    status: 'High Vigilance'
  },
  {
    id: 'zone-2',
    name: 'Sector E-11 & Nullah Streams (Islamabad)',
    severity: 'MEDIUM_HIGH',
    coordinates: [
      [33.7150, 73.0200],
      [33.7150, 73.0450],
      [33.6950, 73.0450],
      [33.6950, 73.0200]
    ],
    description: 'Encroached natural drains subject to flash flooding during heavy rainfall events.',
    historicalMaxWaterLevel: 'Urban inundation recorded in July 2021',
    status: 'Moderate Risk'
  },
  {
    id: 'zone-3',
    name: 'Commercial Market & 6th Road Underpass',
    severity: 'MEDIUM',
    coordinates: [
      [33.6380, 73.0720],
      [33.6380, 73.0850],
      [33.6250, 73.0850],
      [33.6250, 73.0720]
    ],
    description: 'Underpass waterlogging and storm drain overflow bottleneck during sudden thunderstorms.',
    historicalMaxWaterLevel: 'Underpass submergence 3-4 ft',
    status: 'Normal Monitoring'
  }
];

// Dynamically generate present reports for Today
export function getFreshTodayReports() {
  const now = Date.now();
  return [
    {
      id: 'rep-001',
      category: 'water',
      categoryLabel: 'Drainage Clearance',
      title: 'Post-Rain Drain Clearance at I-8 Markaz Signal',
      locationName: 'I-8 Markaz, Islamabad',
      coordinates: [33.6685, 73.0760],
      timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
      timeAgo: '25 mins ago',
      description: 'Municipal suction team cleared residual silt from storm drain. Traffic flowing smoothly.',
      photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      verificationCount: 9,
      confirmedByUsers: true,
      trustLevel: 'COMMUNITY_VERIFIED',
      reporter: 'Saim A. (Local Resident)',
      severity: 'LOW',
      status: 'ACTIVE'
    },
    {
      id: 'rep-002',
      category: 'drainage',
      categoryLabel: 'Stream Gauge Check',
      title: 'Nullah Lai Flow Inspection at Gwalmandi Bridge',
      locationName: 'Gwalmandi, Rawalpindi',
      coordinates: [33.5938, 73.0639],
      timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
      timeAgo: '55 mins ago',
      description: 'Stream water depth measured at 9.8 ft (safe green threshold). Channel clear of debris.',
      photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      verificationCount: 14,
      confirmedByUsers: true,
      trustLevel: 'GROUND_EVIDENCE',
      reporter: 'Tariq M. (Shopkeeper)',
      severity: 'LOW',
      status: 'ACTIVE'
    },
    {
      id: 'rep-003',
      category: 'obstruction',
      categoryLabel: 'Road Notice',
      title: 'Pruning & Maintenance on Murree Road',
      locationName: 'Committee Chowk, Rawalpindi',
      coordinates: [33.6085, 73.0690],
      timestamp: new Date(now - 110 * 60 * 1000).toISOString(),
      timeAgo: '1 hr 50 mins ago',
      description: 'Tree branches pruned back along north-bound Metro corridor. All lanes open.',
      photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      verificationCount: 6,
      confirmedByUsers: true,
      trustLevel: 'COMMUNITY_VERIFIED',
      reporter: 'Fatima Z.',
      severity: 'LOW',
      status: 'ACTIVE'
    },
    {
      id: 'rep-004',
      category: 'accessibility',
      categoryLabel: 'Accessibility Audit',
      title: 'Metro Station Ramp Clear & Open',
      locationName: 'Saddar Metro Bus Station Entrance',
      coordinates: [33.5910, 73.0540],
      timestamp: new Date(now - 160 * 60 * 1000).toISOString(),
      timeAgo: '2 hrs 40 mins ago',
      description: 'Wheelchair access ramp inspected and dry. Tactile pavement clear of obstacles.',
      photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      verificationCount: 8,
      confirmedByUsers: true,
      trustLevel: 'COMMUNITY_VERIFIED',
      reporter: 'Usman K. (Accessibility Advocate)',
      severity: 'LOW',
      status: 'ACTIVE'
    },
    {
      id: 'rep-005',
      category: 'hazard',
      categoryLabel: 'Road Hazard Cleared',
      title: 'Drain Cover Replaced at Sector E-11/3',
      locationName: 'Sector E-11/3 Main Blvd, Islamabad',
      coordinates: [33.7020, 73.0280],
      timestamp: new Date(now - 210 * 60 * 1000).toISOString(),
      timeAgo: '3 hrs 30 mins ago',
      description: 'New heavy-duty iron manhole cover installed by municipal engineering team.',
      photoUrl: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?auto=format&fit=crop&w=800&q=80',
      verificationCount: 11,
      confirmedByUsers: true,
      trustLevel: 'GROUND_EVIDENCE',
      reporter: 'Hamza N.',
      severity: 'LOW',
      status: 'resolved',
      resolved: true
    }
  ];
}

// Initial Community Reports (Rawalpindi-Islamabad for Today)
export const INITIAL_REPORTS = getFreshTodayReports();

// Community Resilient Resources
export const COMMUNITY_RESOURCES = [
  {
    id: 'res-1',
    name: 'CDA Flood Response Centre & Safe Haven',
    type: 'SHELTER',
    address: 'Fire Brigade Station, Sector G-7/1, Islamabad',
    coordinates: [33.7050, 73.0620],
    contact: '16 (CDA Emergency) / 051-9252840',
    facilities: ['Emergency Shelter', 'Clean Drinking Water', 'First Aid', 'Backup Generator Power'],
    status: 'OPERATIONAL'
  },
  {
    id: 'res-2',
    name: 'Rescue 1122 Central Station Rawalpindi',
    type: 'EMERGENCY_BASE',
    address: 'Near Chandni Chowk, Murree Road, Rawalpindi',
    coordinates: [33.6260, 73.0720],
    contact: '1122 (Direct Helpline)',
    facilities: ['Ambulance Base', 'Water Rescue Boats', 'Medical Response', 'Power Charging Station'],
    status: 'OPERATIONAL'
  },
  {
    id: 'res-3',
    name: 'Holy Family Hospital Emergency Cell',
    type: 'MEDICAL',
    address: 'F-Block, Satellite Town, Rawalpindi',
    coordinates: [33.6330, 73.0640],
    contact: '051-9290321',
    facilities: ['24/7 Emergency Care', 'Clean Water', 'Mobile Charging Hub'],
    status: 'OPERATIONAL'
  },
  {
    id: 'res-4',
    name: 'Community Solar Charging & Wi-Fi Station',
    type: 'CHARGING_WIFI',
    address: 'Commercial Market Civic Park, Rawalpindi',
    coordinates: [33.6350, 73.0780],
    contact: 'Volunteers Managed',
    facilities: ['Solar Phone Charging', 'Free Community Mesh Wi-Fi', 'Filtered Drinking Water'],
    status: 'OPERATIONAL'
  }
];

export const SAMPLE_EVIDENCE_PHOTOS = [
  {
    id: 'img-1',
    name: 'Urban Waterlog Street',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-2',
    name: 'Drain Overflow',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-3',
    name: 'Submerged Road Intersection',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-4',
    name: 'Flooded Sidewalk & Obstruction',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'
  }
];

// Twin Cities Safe Evacuation Corridors (Elevated Expressways avoiding Nullah Lai)
export const SAFE_EVACUATION_ROUTES = [
  {
    id: 'safe-route-1',
    name: 'Islamabad Expressway Elevated Safe Corridor',
    description: 'Elevated transit artery avoiding Nullah Lai stream overflow zones. Recommended for emergency travel.',
    status: 'CLEAR / RECOMMENDED',
    coordinates: [
      [33.5650, 73.1250], // Koral Chowk
      [33.6050, 73.1050], // Khanna Pul
      [33.6420, 73.0850], // Faizabad Interchange Elevated Flyover
      [33.6750, 73.0720], // Zero Point
      [33.7050, 73.0550]  // Blue Area Islamabad
    ]
  },
  {
    id: 'safe-route-2',
    name: 'Srinagar Highway to Margalla Safe Bypass',
    description: 'High elevation western corridor with modern stormwater drainage channels.',
    status: 'CLEAR / OPEN',
    coordinates: [
      [33.6400, 72.9800], // Golra Mor
      [33.6650, 73.0200], // G-11 / G-10 Bypass
      [33.6820, 73.0450], // Sector G-9 / G-8
      [33.7050, 73.0750]  // Constitution Avenue
    ]
  }
];

// Quick Landmark Presets for Instant Camera Fly-to
export const QUICK_LOCATIONS = [
  { id: 'i8', name: 'I-8 Markaz', lat: 33.6685, lng: 73.0760, risk: 'Moderate' },
  { id: 'gwalmandi', name: 'Gwalmandi Bridge', lat: 33.5938, lng: 73.0639, risk: 'Critical' },
  { id: 'e11', name: 'E-11 Nullah', lat: 33.7020, lng: 73.0280, risk: 'High' },
  { id: 'saddar', name: 'Saddar Metro', lat: 33.5910, lng: 73.0540, risk: 'Moderate' },
  { id: 'faizabad', name: 'Faizabad', lat: 33.6450, lng: 73.0850, risk: 'Low' }
];

