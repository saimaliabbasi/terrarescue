import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Waves, 
  AlertTriangle, 
  Accessibility, 
  Navigation, 
  Droplets,
  Sparkles,
  Zap,
  Crosshair,
  Check
} from 'lucide-react';
import { SAMPLE_EVIDENCE_PHOTOS } from '../services/mockData';
import { t } from '../services/i18n';
import { playSoftClick, playSoftPop, playSuccessChime } from '../services/uiSounds';
import { useToast } from './ToastNotification';

export default function ReportModal({ isOpen, onClose, onSubmitReport, initialCoords, lang = 'en' }) {
  if (!isOpen) return null;

  const { addToast } = useToast();

  const categories = [
    { id: 'water', label: t('catWater', lang), icon: Waves, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' },
    { id: 'drainage', label: t('catDrainage', lang), icon: Droplets, color: 'text-blue-400 bg-blue-950/60 border-blue-800' },
    { id: 'obstruction', label: t('catObstruction', lang), icon: Navigation, color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
    { id: 'hazard', label: t('catHazard', lang), icon: AlertTriangle, color: 'text-rose-400 bg-rose-950/60 border-rose-800' },
    { id: 'accessibility', label: t('catAccessibility', lang), icon: Accessibility, color: 'text-purple-400 bg-purple-950/60 border-purple-800' },
    { id: 'other', label: t('catOther', lang), icon: MapPin, color: 'text-slate-400 bg-slate-900 border-slate-700' }
  ];

  const quickPresets = [
    { label: '🌊 Flooded Intersection', cat: 'water', title: 'Water Accumulation on Main Intersection' },
    { label: '⚠️ Open Manhole Drain', cat: 'hazard', title: 'Missing Manhole Cover Submerged' },
    { label: '🚧 Blocked Storm Drain', cat: 'drainage', title: 'Trash Debris Blocking Storm Drainage' },
    { label: '♿ Ramp Inaccessible', cat: 'accessibility', title: 'Pedestrian Accessibility Ramp Flooded' }
  ];

  const [category, setCategory] = useState('water');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('Rawalpindi–Islamabad Local Area');
  const [lat, setLat] = useState(initialCoords?.lat ? initialCoords.lat.toFixed(4) : '33.6450');
  const [lng, setLng] = useState(initialCoords?.lng ? initialCoords.lng.toFixed(4) : '73.0600');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('Resident Observer');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_EVIDENCE_PHOTOS[0].url);
  const [compressedPhotoBase64, setCompressedPhotoBase64] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) return;
    playSoftClick();
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
        setLocationName('Current GPS Device Position');
        addToast({
          title: 'GPS Acquired',
          message: `Coordinates filled: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          type: 'success'
        });
      },
      () => {
        setIsLocating(false);
        addToast({
          title: 'Location Notice',
          message: 'Could not access GPS. Please ensure permissions are enabled.',
          type: 'warning'
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleApplyPreset = (preset) => {
    playSoftPop();
    setCategory(preset.cat);
    setTitle(preset.title);
  };

  // Client-Side Image Resizer & Canvas Compressor (<200KB for low bandwidth)
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    playSoftClick();
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress JPEG to 0.65 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        setCompressedPhotoBase64(dataUrl);
        setIsCompressing(false);
        addToast({
          title: 'Photo Optimized',
          message: 'Image automatically compressed (<200KB) for fast cellular sync.',
          type: 'success'
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = categories.find(c => c.id === category);

    const newReport = {
      id: `rep-${Date.now()}`,
      category,
      categoryLabel: catObj?.label || 'Water Accumulation',
      title: title.trim(),
      locationName: locationName.trim() || 'Rawalpindi–Islamabad',
      coordinates: [parseFloat(lat), parseFloat(lng)],
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      description: description.trim() || 'Community report submitted by resident.',
      photoUrl: compressedPhotoBase64 || selectedPhoto,
      verificationCount: 1,
      confirmedByUsers: false,
      trustLevel: compressedPhotoBase64 ? 'GROUND_EVIDENCE' : 'COMMUNITY_VERIFIED',
      reporter: reporter.trim() || 'Resident',
      severity: category === 'hazard' || category === 'water' ? 'HIGH' : 'MEDIUM',
      status: 'ACTIVE'
    };

    playSuccessChime();
    onSubmitReport(newReport);
    addToast({
      title: 'Report Published',
      message: `Your observation for ${newReport.locationName} is now live on the map.`,
      type: 'success'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel border border-slate-700/80 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">{t('reportModalTitle', lang)}</h3>
              <p className="text-xs text-slate-400">{t('reportModalSub', lang)}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              playSoftClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quick 1-Tap Presets:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pt-1.5 pb-1">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-all active:scale-95 cursor-pointer font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t('selectCategory', lang)}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playSoftClick();
                      setCategory(cat.id);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left text-xs font-medium transition-all cursor-pointer active:scale-98 ${
                      isSelected
                        ? `${cat.color} font-bold shadow-lg ring-2 ring-emerald-500/40 border-emerald-500`
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {t('titleLabel', lang)}
            </label>
            <input
              type="text"
              required
              placeholder={t('titlePlaceholder', lang)}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Location with 1-Tap GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400">
                Location Coordinates
              </label>
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring GPS...' : 'Use Current GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Area / Sector"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {t('descLabel', lang)}
            </label>
            <textarea
              rows="3"
              placeholder={t('descPlaceholder', lang)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Photo Shutter & Compression */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Camera Ground Evidence Capture</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all active:scale-95">
                <Camera className="w-4 h-4" />
                <span>{t('cameraBtn', lang)}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
              </label>

              <label className="cursor-pointer flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all active:scale-95">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{t('uploadBtn', lang)}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
              </label>
            </div>

            {isCompressing && (
              <p className="text-[11px] text-cyan-400 animate-pulse font-mono">
                ⚡ Resizing & compressing image for low bandwidth...
              </p>
            )}

            {compressedPhotoBase64 && (
              <div className="relative rounded-2xl overflow-hidden h-32 border-2 border-emerald-500 my-2 shadow-xl">
                <img src={compressedPhotoBase64} alt="Compressed Photo" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 bg-slate-950/90 text-emerald-300 text-[10px] px-2.5 py-1 rounded-xl font-mono border border-emerald-800 backdrop-blur-md">
                  ✓ {t('compressNotice', lang)}
                </span>
              </div>
            )}
          </div>

          {/* Reporter Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {t('reporterLabel', lang)}
            </label>
            <input
              type="text"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('publishBtn', lang)}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
