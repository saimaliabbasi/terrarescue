import React, { useState } from 'react';
import { 
  Radio, 
  Battery, 
  Wifi, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Activity,
  Volume2
} from 'lucide-react';
import { bleManager } from '../services/bluetoothService';

export default function BleHardwareSimulator({ onTriggerPanic, onTriggerTest, isConnected }) {
  const [rssi, setRssi] = useState(-55);
  const [battery, setBattery] = useState(94);
  const [isPressing, setIsPressing] = useState(false);

  const handlePanicClick = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 600);
    bleManager.triggerEmergency('VIRTUAL_HARDWARE_BUTTON');
    if (onTriggerPanic) onTriggerPanic();
  };

  const handleTestClick = () => {
    bleManager.triggerTest('VIRTUAL_HARDWARE_BUTTON');
    if (onTriggerTest) onTriggerTest();
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>TerraRescue BLE Hardware Device</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                {isConnected ? 'BLE Connected' : 'Simulated BLE'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              UUID: 00001802-0000-1000-8000-00805F9B34FB
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{battery}%</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>{rssi} dBm</span>
          </div>
        </div>
      </div>

      {/* Interactive Physical Button Simulation Widget */}
      <div className="flex flex-col items-center justify-center py-6">
        
        {/* Outer Ring */}
        <div className="relative group p-4 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl">
          
          {/* Pulsing ring during press */}
          {isPressing && (
            <div className="absolute inset-0 rounded-full border-4 border-rose-500 animate-ping"></div>
          )}

          {/* Physical Button Surface */}
          <button
            onClick={handlePanicClick}
            className={`w-36 h-36 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 hover:from-rose-600 hover:to-red-400 active:scale-95 transition-all duration-150 flex flex-col items-center justify-center text-white shadow-2xl shadow-rose-900/60 border-4 border-rose-400/40 relative overflow-hidden ${
              isPressing ? 'ring-8 ring-rose-500/50 scale-95' : ''
            }`}
          >
            <div className="absolute top-2 w-16 h-4 bg-white/20 rounded-full blur-sm"></div>
            <ShieldAlert className="w-12 h-12 text-white mb-1 drop-shadow-md" />
            <span className="font-extrabold tracking-widest text-xs uppercase text-rose-100">
              EMERGENCY
            </span>
            <span className="text-[9px] font-mono text-rose-200/80">PRESS TO PANIC</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
          Physical BLE Button linked via Bluetooth Low Energy. Single press initiates immediate emergency notification workflow.
        </p>
      </div>

      {/* Simulator Controls & Diagnostic Test Mode */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* RSSI Range Adjuster */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-slate-400">
          <span>Signal (RSSI):</span>
          <input
            type="range"
            min="-90"
            max="-35"
            value={rssi}
            onChange={(e) => setRssi(e.target.value)}
            className="w-20 accent-cyan-400"
          />
          <span className="font-mono text-white">{rssi}</span>
        </div>

        {/* Diagnostic Test Mode Button */}
        <button
          onClick={handleTestClick}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-semibold transition-all"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Run Hardware Test Mode</span>
        </button>
      </div>

    </div>
  );
}
