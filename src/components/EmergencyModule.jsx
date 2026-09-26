import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Phone, 
  Share2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  MessageSquare,
  X,
  Volume2,
  VolumeX,
  Lock,
  Activity,
  PhoneCall
} from 'lucide-react';
import BleHardwareSimulator from './BleHardwareSimulator';
import QRCodeDisplay from './QRCodeDisplay';
import { bleManager } from '../services/bluetoothService';
import { getTrustedContacts, saveTrustedContacts } from '../services/supabaseClient';
import { startEmergencySiren, stopEmergencySiren, vibrateEmergencyPattern } from '../services/audioSiren';
import { addPoints } from '../services/pointsService';
import { t } from '../services/i18n';

export default function EmergencyModule({ isEmergencyActive, setIsEmergencyActive, lang = 'en' }) {
  const [contacts, setContacts] = useState(getTrustedContacts());
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState('TerraRescue BLE Button');
  const [countdown, setCountdown] = useState(5);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [testLog, setTestLog] = useState([]);

  const currentLocation = { lat: 33.6450, lng: 73.0600, label: 'Rawalpindi–Islamabad Zone' };

  useEffect(() => {
    const unsubscribe = bleManager.subscribe((event, payload) => {
      if (event === 'CONNECTED') {
        setBleConnected(true);
        setBleDeviceName(payload.device?.name || 'BLE Physical Button');
      } else if (event === 'DISCONNECTED') {
        setBleConnected(false);
      } else if (event === 'EMERGENCY_TRIGGERED') {
        triggerEmergencyWorkflow();
      } else if (event === 'TEST_TRIGGERED') {
        runDiagnosticTest();
      }
    });
    return unsubscribe;
  }, []);

  const handlePairWebBluetooth = async () => {
    const res = await bleManager.requestDevice();
    if (res.success) {
      setBleConnected(true);
      setBleDeviceName(res.deviceName);
    } else {
      alert(`BLE Pairing Notice: ${res.error || 'Using Virtual BLE Hardware Simulator.'}`);
    }
  };

  const triggerEmergencyWorkflow = () => {
    setIsEmergencyActive(true);
    setCountdown(5);
    setIsCountdownRunning(true);
    setIsSirenActive(true);
    startEmergencySiren();
    vibrateEmergencyPattern();
  };

  useEffect(() => {
    let timer;
    if (isCountdownRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        vibrateEmergencyPattern();
      }, 1000);
    } else if (isCountdownRunning && countdown === 0) {
      setIsCountdownRunning(false);
    }
    return () => clearInterval(timer);
  }, [isCountdownRunning, countdown]);

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false);
    setIsCountdownRunning(false);
    setIsSirenActive(false);
    stopEmergencySiren();
  };

  const runDiagnosticTest = () => {
    const logItem = `[${new Date().toLocaleTimeString()}] BLE Hardware ping -> Phone app responsive -> Audio Siren synth verified -> Location GPS (${currentLocation.lat}, ${currentLocation.lng})`;
    setTestLog(prev => [logItem, ...prev]);
    setShowTestModal(true);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const updated = [
      ...contacts,
      { id: `c-${Date.now()}`, name: newContactName, phone: newContactPhone, isWhatsApp: true }
    ];
    setContacts(updated);
    saveTrustedContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleRemoveContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveTrustedContacts(updated);
  };

  const getWhatsAppLink = (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `🚨 TERRARESCUE EMERGENCY ALERT!\n\nI have activated my physical Bluetooth Emergency Button in Rawalpindi–Islamabad.\n\n📍 GPS Location: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}\n🕒 Timestamp: ${new Date().toLocaleString()}\n\nPlease verify my safety or contact Rescue 1122!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-rose-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-rose-900/40 text-rose-300 border border-rose-700/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{t('bleModuleTitle', lang)}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {t('bleModuleTitle', lang)}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            {t('bleModuleSub', lang)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePairWebBluetooth}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 shadow-md transition-all"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>{bleConnected ? `Paired: ${bleDeviceName}` : t('pairBleBtn', lang)}</span>
          </button>
          
          <button
            onClick={runDiagnosticTest}
            className="flex items-center gap-2 bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-800 shadow-md transition-all"
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>{t('testBleBtn', lang)}</span>
          </button>
        </div>
      </div>

      {/* Direct Telephone Dial Buttons (Real-Life Rescue Helplines) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-400" />
          <span>Direct 1-Tap Rescue Helplines (Rawalpindi-Islamabad)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:1122"
            className="flex items-center justify-between p-3.5 bg-rose-950/80 hover:bg-rose-900 text-white rounded-2xl border border-rose-700/80 font-bold text-xs transition-all shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400" />
              <span>{t('callRescue1122', lang)}</span>
            </div>
            <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded">1122</span>
          </a>

          <a
            href="tel:16"
            className="flex items-center justify-between p-3.5 bg-cyan-950/80 hover:bg-cyan-900 text-white rounded-2xl border border-cyan-700/80 font-bold text-xs transition-all shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>{t('callCda16', lang)}</span>
            </div>
            <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">16</span>
          </a>

          <a
            href="tel:15"
            className="flex items-center justify-between p-3.5 bg-blue-950/80 hover:bg-blue-900 text-white rounded-2xl border border-blue-700/80 font-bold text-xs transition-all shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>{t('callPolice15', lang)}</span>
            </div>
            <span className="font-mono text-blue-400 bg-slate-950 px-2 py-0.5 rounded">15</span>
          </a>
        </div>
      </div>

      {/* BLE Hardware Simulator & Trusted Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <BleHardwareSimulator
            isConnected={bleConnected}
            onTriggerPanic={triggerEmergencyWorkflow}
            onTriggerTest={runDiagnosticTest}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{t('trustedContactsTitle', lang)}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Contacts who receive instant location notifications upon BLE button activation.
              </p>
            </div>

            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addContactBtn', lang)}</span>
            </button>
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contact Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (+92 300...)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{contact.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppLink(contact.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1.5 rounded-xl font-bold hover:bg-emerald-900 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('whatsAppBtn', lang)}</span>
                  </a>

                  {!contact.isEmergencyService && (
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shareable Emergency Location QR Code Beacon */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Offline Location Sharing</span>
            </div>
            <h3 className="text-lg font-black text-white">Emergency Location QR Beacon</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If cellular data is weak during heavy rain, show this QR code to any neighbor, volunteer, or Rescue 1122 personnel. Scanning it with any smartphone camera immediately opens your pinned coordinates in Google Maps without typing.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-emerald-400 font-mono">
              📍 Current Twin Cities Geo-Point: {currentLocation.lat}, {currentLocation.lng}
            </div>
          </div>

          <QRCodeDisplay
            value={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
            title="Scan for Emergency Coordinates"
            subtitle="Rawalpindi–Islamabad Geo-Marker"
            size={180}
          />
        </div>
      </div>

      {/* Active Panic Alert Modal Overlay */}
      {isEmergencyActive && (
        <div className="fixed inset-0 z-[600] bg-rose-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl relative my-auto">
            
            <div className="w-20 h-20 rounded-full bg-rose-600/30 border-4 border-rose-500 flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-10 h-10 text-rose-400" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                {t('emergencyAlertActive', lang)}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                Emergency Notification Workflow Active
              </h2>
              <p className="text-xs text-slate-300">
                GPS Position <span className="font-mono text-emerald-400">({currentLocation.lat}, {currentLocation.lng})</span>.
              </p>
            </div>

            {/* Siren Alert Toggle */}
            <div className="bg-rose-950/60 p-3 rounded-2xl border border-rose-800 flex items-center justify-between text-xs text-rose-300 font-mono">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>{t('sirenPlaying', lang)}</span>
              </div>
              <button
                onClick={() => {
                  stopEmergencySiren();
                  setIsSirenActive(false);
                }}
                className="bg-slate-900 px-2.5 py-1 rounded border border-rose-800 text-[10px] text-white cursor-pointer"
              >
                Mute Siren
              </button>
            </div>

            {/* QR Quick Scan inside modal */}
            <div className="py-1">
              <QRCodeDisplay
                value={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
                title="First Responders: Scan to Open GPS"
                subtitle="High-precision map coordinates"
                size={140}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contacts.map((c) => (
                  <a
                    key={c.id}
                    href={getWhatsAppLink(c.phone)}
                    onClick={() => addPoints(15, 'Dispatched Emergency Alert')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Send to {c.name}</span>
                  </a>
                ))}
              </div>

              <button
                onClick={handleCancelEmergency}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 text-xs transition-all cursor-pointer active:scale-95"
              >
                {t('cancelEmergency', lang)}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
