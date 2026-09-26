import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Waves, 
  Compass, 
  X,
  Volume2
} from 'lucide-react';
import { playSoftClick, playSoftPop, playSuccessChime } from '../services/uiSounds';

const ONBOARDING_KEY = 'terrarescue_onboarded_v1';

export default function OnboardingSplash({ lang = 'en', onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    try {
      const alreadySeen = localStorage.getItem(ONBOARDING_KEY);
      if (!alreadySeen) {
        setIsVisible(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    playSuccessChime();
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {}
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleNext = () => {
    playSoftClick();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    playSoftClick();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (!isVisible) return null;

  const slides = lang === 'ur' ? [
    {
      badge: 'مرحلہ ۱ — لائیو نقشہ اور سیلاب الرٹ',
      icon: Waves,
      iconColor: 'from-cyan-500 to-blue-600',
      title: 'راولپنڈی اور اسلام آباد کا لائیو ریسکیو میپ',
      description: 'نالہ لئی کی سطح، ممکنہ سیلابی راستے اور 8 تہوں پر مشتمل انٹیلیجنس ڈیٹا براہِ راست دیکھیں۔ نشیبی علاقوں میں پھنسنے سے بچیں۔',
      highlight: 'نالہ لئی وارننگ، کٹاریاں اور گوالمنڈی پل کی لائیو مانیٹرنگ'
    },
    {
      badge: 'مرحلہ ۲ — شہری مشاہدات اور فوری رپورٹ',
      icon: MapPin,
      iconColor: 'from-emerald-500 to-teal-600',
      title: 'ایک کلک میں مسئلہ یا خطرہ رپورٹ کریں',
      description: 'کہیں پانی کھڑا ہے یا سڑک بند ہے؟ تصویر لیں، خودکار کیمرہ کمپریشن اور جی پی ایس کی مدد سے فوراً دوسرے شہریوں کو باخبر کریں۔',
      highlight: 'آف لائن سپورٹ اور کمیونٹی پوائنٹس کا نظام'
    },
    {
      badge: 'مرحلہ ۳ — ایمرجنسی پینک بٹن اور ایس او ایس',
      icon: Radio,
      iconColor: 'from-rose-500 to-red-600',
      title: 'بلوٹوتھ پینک بٹن اور ون ٹیپ ایمرجنسی',
      description: 'کسی بھی ہنگامی صورتحال میں پولیس، ریسکیو 1122 اور اپنے پیاروں کو واٹس ایپ اور ایس ایم ایس پر لائیو لوکیشن اور کیو آر کوڈ بھیجیں۔',
      highlight: 'طاقتور سائرن اور ہنگامی فون کالز کی سہولت'
    }
  ] : [
    {
      badge: 'Step 1 of 3 — Situational Awareness',
      icon: Waves,
      iconColor: 'from-cyan-500 to-blue-600',
      title: 'Live Geospatial Intelligence & Flood Tracking',
      description: 'Monitor real-time Nullah Lai water gauge telemetry, 8 environmental GIS layers, and elevated bypass corridors across Rawalpindi and Islamabad.',
      highlight: 'Real-time telemetry for Gwalmandi, Kattarian, and low-lying sectors.'
    },
    {
      badge: 'Step 2 of 3 — Citizen Crowdsourcing',
      icon: MapPin,
      iconColor: 'from-emerald-500 to-teal-600',
      title: 'Hyper-Local Ground Observations',
      description: 'Report waterlogging, broken drainage, or road blockages in seconds with automatic camera compression, GPS pinning, and community verification.',
      highlight: 'Full offline queuing + community resilience points system.'
    },
    {
      badge: 'Step 3 of 3 — Personal & Community Safety',
      icon: Radio,
      iconColor: 'from-rose-500 to-red-600',
      title: 'BLE Hardware Panic Button & Quick SOS',
      description: 'Connect wearable Bluetooth physical buttons or trigger instant SOS with loud siren synthesizer, WhatsApp live dispatch, and printable emergency QR codes.',
      highlight: 'Rescue 1122, Fire 16, Police 15 integrated 1-tap dispatch.'
    }
  ];

  const current = slides[currentSlide];
  const IconComponent = current.icon;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-up"
    >
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-slate-700/80 p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col space-y-6">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{current.badge}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 px-2 py-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {lang === 'ur' ? 'براہِ راست نقشہ دیکھیں ✕' : 'Skip to Map ✕'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Skip Onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Icon */}
        <div className="flex justify-center py-2">
          <div className={`p-5 rounded-3xl bg-gradient-to-tr ${current.iconColor} text-white shadow-2xl shadow-emerald-950/60 transition-transform duration-300 transform hover:scale-105`}>
            <IconComponent className="w-10 h-10" />
          </div>
        </div>

        {/* Slide Content */}
        <div className="text-center space-y-3">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
            {current.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {current.description}
          </p>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-emerald-300 font-semibold inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{current.highlight}</span>
          </div>
        </div>

        {/* Slide Dots Indicator */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                playSoftClick();
                setCurrentSlide(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentSlide === 0 
                ? 'opacity-30 cursor-not-allowed text-slate-500' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer active:scale-95'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ur' ? 'پیچھے' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
          >
            <span>
              {currentSlide === slides.length - 1 
                ? (lang === 'ur' ? 'شروع کریں →' : 'Get Started →') 
                : (lang === 'ur' ? 'آگے بڑھیں' : 'Next Step')}
            </span>
            {currentSlide < slides.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
