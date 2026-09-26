import React from 'react';
import { Satellite, Users, Camera, AlertCircle, ShieldCheck } from 'lucide-react';

export default function DataTrustBadge({ trustLevel = 'COMMUNITY_VERIFIED', compact = false }) {
  switch (trustLevel) {
    case 'SATELLITE_DATA':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>🛰️ Verified Satellite Dataset</span>
        </span>
      );

    case 'GROUND_EVIDENCE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>📸 Confirmed Ground Evidence</span>
        </span>
      );

    case 'COMMUNITY_VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-950 text-blue-300 border border-blue-800 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>👥 Community Verified</span>
        </span>
      );

    case 'UNVERIFIED':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-950 text-amber-300 border border-amber-800 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>⚠️ Single User Observation (Unverified)</span>
        </span>
      );
  }
}
