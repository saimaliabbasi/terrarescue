// TerraRescue Community Resilience Points & Leaderboard Service

const POINTS_KEY = 'terrarescue_community_points_v1';
const HISTORY_KEY = 'terrarescue_points_history_v1';

export function getPoints() {
  if (typeof window === 'undefined') return 85;
  try {
    const stored = localStorage.getItem(POINTS_KEY);
    return stored ? parseInt(stored, 10) : 85; // Starting balance for active citizen
  } catch (e) {
    return 85;
  }
}

export function addPoints(amount, reason = 'Community Action') {
  if (typeof window === 'undefined') return 85;
  try {
    const current = getPoints();
    const updated = current + amount;
    localStorage.setItem(POINTS_KEY, updated.toString());

    // Save history log
    const history = getPointsHistory();
    history.unshift({
      id: 'pt_' + Date.now(),
      amount,
      reason,
      timestamp: Date.now()
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));

    // Dispatch custom event for real-time reactivity
    window.dispatchEvent(new CustomEvent('terrarescue:points_updated', { detail: { points: updated, added: amount, reason } }));
    return updated;
  } catch (e) {
    console.error('Error adding points:', e);
    return getPoints();
  }
}

export function getPointsHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [
      { id: '1', amount: 35, reason: 'Neighborhood Watch Enrollment', timestamp: Date.now() - 86400000 * 2 },
      { id: '2', amount: 50, reason: 'Verified Safe Route Observation', timestamp: Date.now() - 86400000 }
    ];
  } catch (e) {
    return [];
  }
}

export function getCommunityLeaderboard() {
  const userPts = getPoints();
  const baseLeaderboard = [
    { rank: 1, name: 'Hamza Khan', sector: 'Sector I-8/4', points: 340, badge: 'Civic Champion 🏆', isUser: false },
    { rank: 2, name: 'Fatima Rizvi', sector: 'Gwalmandi Choke', points: 285, badge: 'Flood Watcher 🌊', isUser: false },
    { rank: 3, name: 'You (Active Citizen)', sector: 'Rawalpindi-ISB', points: userPts, badge: userPts >= 200 ? 'Guardian 🛡️' : 'Resilience Scout 🎖️', isUser: true },
    { rank: 4, name: 'Usman Ali', sector: 'Saddar Cantonment', points: 190, badge: 'First Responder 🚨', isUser: false },
    { rank: 5, name: 'Ayesha Malik', sector: 'Sector E-11', points: 165, badge: 'Drainage Sentinel 🔍', isUser: false }
  ];

  // Sort by points descending and re-rank
  return baseLeaderboard
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
