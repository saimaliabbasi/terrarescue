import { createClient } from '@supabase/supabase-js';
import { INITIAL_REPORTS, COMMUNITY_RESOURCES, getFreshTodayReports } from './mockData';

const SUPABASE_URL = 'https://xyzkmnqwerty.supabase.co'; // Standard placeholder domain for Supabase client
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Hl0uxnboi8fROr68OaMJ1g_lRmogF7T';

let supabase = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
} catch (e) {
  console.warn('Supabase client initialized with local offline fallback mode:', e.message);
}

// LocalStorage Persistence Keys
const LOCAL_REPORTS_KEY = 'terrarescue_community_reports_today_v2';
const LOCAL_CONTACTS_KEY = 'terrarescue_trusted_contacts_v1';

export function getLocalReports() {
  const stored = localStorage.getItem(LOCAL_REPORTS_KEY);
  if (!stored) {
    const fresh = getFreshTodayReports();
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fresh = getFreshTodayReports();
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch (err) {
    return getFreshTodayReports();
  }
}

export function saveLocalReport(newReport) {
  const current = getLocalReports();
  const updated = [newReport, ...current];
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
  return updated;
}

export function confirmLocalReport(reportId) {
  const current = getLocalReports();
  const updated = current.map(rep => {
    if (rep.id === reportId) {
      return {
        ...rep,
        verificationCount: (rep.verificationCount || 0) + 1,
        confirmedByUsers: true,
        trustLevel: (rep.verificationCount + 1 >= 5) ? 'GROUND_EVIDENCE' : rep.trustLevel
      };
    }
    return rep;
  });
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
  return updated;
}

export function resolveLocalReport(reportId) {
  const current = getLocalReports();
  const updated = current.map(rep => {
    if (rep.id === reportId) {
      return {
        ...rep,
        status: 'resolved',
        resolvedAt: Date.now()
      };
    }
    return rep;
  });
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
  return updated;
}

export function getTrustedContacts() {
  const stored = localStorage.getItem(LOCAL_CONTACTS_KEY);
  if (!stored) {
    const defaultContacts = [
      { id: 'c1', name: 'Zainab Bibi (Sister)', phone: '+92 300 1234567', isWhatsApp: true },
      { id: 'c2', name: 'Ali Ahmed (Brother)', phone: '+92 333 9876543', isWhatsApp: true },
      { id: 'c3', name: 'Rescue 1122 Rawalpindi', phone: '1122', isEmergencyService: true }
    ];
    localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(defaultContacts));
    return defaultContacts;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    return [];
  }
}

export function saveTrustedContacts(contacts) {
  localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(contacts));
}

export { supabase };
