import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, AlertTriangle, Satellite, CloudRain,
  Waves, Users, ShieldAlert, RefreshCw, Globe, Copy, Check,
  Thermometer, Wind, Droplets, MapPin, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { speakText, stopSpeaking, isSpeaking, createSpeechRecognizer } from '../services/speechService';
import { playSoftClick, playSoftPop, playSuccessChime } from '../services/uiSounds';
import { useToast } from './ToastNotification';

/* ── Typing-dots indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none w-fit">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ── Individual chat bubble ── */
function ChatBubble({ msg, onCopy, onSpeak, isSpeakingThis }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.text.replace(/<[^>]+>/g, ''));
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-end gap-2.5 animate-fade-up ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black ${
        msg.sender === 'user'
          ? 'bg-emerald-600 text-white'
          : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white'
      }`}>
        {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
      </div>

      <div className={`relative group max-w-[78%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
          msg.sender === 'user'
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-sm'
        }`}>
          {msg.sender === 'ai'
            ? <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            : <span>{msg.text}</span>
          }
        </div>

        <div className={`flex items-center gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
          {msg.sender === 'ai' && (
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSpeak(msg)}
                title={isSpeakingThis ? "Stop speaking" : "Listen aloud"}
                className={`p-1 rounded-md transition-colors ${
                  isSpeakingThis 
                    ? 'text-rose-400 bg-rose-950/60 animate-pulse' 
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleCopy}
                title="Copy response"
                className="text-slate-400 hover:text-emerald-400 p-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Live weather summary bar at top of chat ── */
function WeatherContextBar({ weatherData }) {
  if (!weatherData?.temperature) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/60 overflow-x-auto text-[11px] font-mono text-slate-400">
      <span className="text-slate-300 font-semibold shrink-0">📡 Live Context (Today):</span>
      <span className="flex items-center gap-1 shrink-0"><Thermometer className="w-3.5 h-3.5 text-amber-400" />{weatherData?.temperature != null ? weatherData.temperature : 31.2}°C</span>
      <span className="flex items-center gap-1 shrink-0"><Droplets className="w-3.5 h-3.5 text-cyan-400" />{weatherData?.humidity != null ? weatherData.humidity : 36}% humidity</span>
      <span className="flex items-center gap-1 shrink-0"><CloudRain className="w-3.5 h-3.5 text-blue-400" />{weatherData?.precipitation != null ? Number(weatherData.precipitation).toFixed(1) : '0.0'} mm rain</span>
      <span className="flex items-center gap-1 shrink-0"><Wind className="w-3.5 h-3.5 text-slate-400" />{weatherData?.windSpeed != null ? weatherData.windSpeed : 12.6} km/h</span>
      <span className="flex items-center gap-1 shrink-0 text-emerald-400">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
        {weatherData?.weatherCondition || 'Clear Sky'}
      </span>
    </div>
  );
}

export default function TerraAI({ weatherData = {}, nasaData = [], reportsCount = 0, lang = 'en' }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `<b>Assalam-o-Alaikum! I'm TerraAI</b> 🌍<br/><br/>
I'm your environmental intelligence assistant for <b>Rawalpindi–Islamabad</b>. I help you understand:<br/><br/>
• 🌧️ <b>Live rainfall & weather patterns</b> from Open-Meteo & NASA POWER<br/>
• 🌊 <b>Nullah Lai flood risk</b> indicators and danger thresholds<br/>
• 👥 <b>Community observation quality</b> and data trust levels<br/>
• 🆘 <b>Emergency preparedness</b> guidance in English & اردو<br/><br/>
<span style="color:#34d399">What would you like to understand about conditions today?</span>`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleSpeak = (msg) => {
    if (speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
      playSoftClick();
    } else {
      playSoftClick();
      setSpeakingMsgId(msg.id);
      speakText(msg.text, lang, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      playSoftClick();
    } else {
      playSoftPop();
      const rec = createSpeechRecognizer(
        lang,
        (transcript) => {
          playSuccessChime();
          setInput(transcript);
          setIsListening(false);
          addToast({
            title: lang === 'ur' ? 'آواز ریکارڈ ہو گئی' : 'Voice Input Transcribed',
            message: `"${transcript}"`,
            type: 'info'
          });
        },
        (err) => {
          setIsListening(false);
          addToast({
            title: lang === 'ur' ? 'مائیکروفون میں مسئلہ' : 'Microphone Notice',
            message: 'Web Speech recognition ended or permission needed.',
            type: 'warning'
          });
        },
        () => {
          setIsListening(false);
        }
      );

      if (!rec) {
        addToast({
          title: 'Speech Recognition Unavailable',
          message: 'Voice input is supported in Google Chrome, Edge, and Safari.',
          type: 'info'
        });
        return;
      }

      recognizerRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const presetGroups = [
    {
      label: '🌧️ Weather',
      queries: [
        "What does today's rainfall mean for Nullah Lai?",
        "Is 42mm of rain in a day dangerous for Rawalpindi?",
        "How does humidity affect flash flooding risk?"
      ]
    },
    {
      label: '🌊 Flood',
      queries: [
        "What happens when Nullah Lai exceeds 20 feet?",
        "Which sectors flood first in Rawalpindi?",
        "What is the Gwalmandi Bridge danger threshold?"
      ]
    },
    {
      label: '👥 Community',
      queries: [
        "How reliable are community flood reports?",
        "What is the difference between satellite and community data?",
        "How does TerraRescue verify reports?"
      ]
    },
    {
      label: '🆘 Safety',
      queries: [
        "What should I do if I see rising water near my home?",
        "Explain flood preparedness steps in Urdu.",
        "How does the BLE emergency button work?"
      ]
    }
  ];

  const [activeGroup, setActiveGroup] = useState(0);

  const handleSend = (text) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateResponse(query, weatherData, nasaData, reportsCount);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, Math.random() * 400 + 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fade-up">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-900/50 shadow-2xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Module 11 — AI Explanation Layer</span>
          </div>
          <h2 className="text-xl font-black text-white">TerraAI Environmental Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Translates satellite datasets, rainfall telemetry, and community observations into plain language for Rawalpindi–Islamabad residents.
          </p>
        </div>
      </div>

      {/* Main Chat Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '62vh', minHeight: 480 }}>

        {/* Live Weather Context Bar */}
        <WeatherContextBar weatherData={weatherData} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map(msg => (
            <ChatBubble 
              key={msg.id} 
              msg={msg} 
              onSpeak={handleSpeak}
              isSpeakingThis={speakingMsgId === msg.id}
            />
          ))}
          {isTyping && (
            <div className="flex items-end gap-2.5 animate-fade-up">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Query Tabs */}
        <div className="border-t border-slate-800/60 bg-slate-900/60">
          <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
            {presetGroups.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveGroup(i)}
                className={`text-[11px] px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-all ${
                  activeGroup === i
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto">
            {presetGroups[activeGroup].queries.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isListening
                ? (lang === 'ur' ? "بولیں... سن رہے ہیں 🎙️" : "Listening... Speak your query 🎙️")
                : (lang === 'ur' ? "سوال پوچھیں یا مائیک دبائیں..." : "Ask TerraAI about rainfall, flood risk, or press mic to speak...")
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            className={`flex-1 bg-slate-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
              isListening ? 'border-rose-500 ring-2 ring-rose-500/20 placeholder-rose-400' : 'border-slate-800 focus:border-emerald-600'
            }`}
          />

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            title={isListening ? "Stop listening" : "Speak your question"}
            className={`p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-950/80'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Guardrail Notice */}
      <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-900/40 flex items-start gap-3 text-xs text-amber-300/80">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <b className="text-amber-300">TerraAI Safety Guardrail:</b> TerraAI provides data explanations and educational context only. It does NOT issue official flood warnings, medical advice, or claims to replace Rescue 1122, CDA, NDMA, or any emergency authority. Always verify critical safety decisions with official sources.
        </p>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   Intelligent TerraAI Response Engine
   Deep rule-based matching with live context
   ───────────────────────────────────────── */
function generateResponse(query, weather, nasaData, reportsCount) {
  const q = query.toLowerCase();
  const rain = weather?.precipitation != null ? Number(weather.precipitation) : 0.0;
  const temp = weather?.temperature != null ? Number(weather.temperature) : 31.2;
  const humid = weather?.humidity != null ? Number(weather.humidity) : 36;
  const cond = weather?.weatherCondition || 'Clear Sky';

  /* ── Nullah Lai & Flood Questions ── */
  if (q.includes('nullah') || q.includes('lai') || q.includes('gwalmandi') || q.includes('kattarian') || q.includes('20 feet') || q.includes('exceed')) {
    return `<b>🌊 Nullah Lai Water Level Analysis</b><br/><br/>
Nullah Lai is the primary urban drainage channel running through Rawalpindi from the Margalla foothills to the Soan River confluence. It has a <b>history of severe flash flooding</b> during monsoon events.<br/><br/>
<b>Critical Thresholds (Gwalmandi Bridge):</b><br/>
• 🟢 <b>0–11 ft</b> — Normal, free flow<br/>
• 🟡 <b>11–15 ft</b> — Alert Stage: Monitor closely<br/>
• 🟠 <b>15–20 ft</b> — Warning Stage: Avoid low-lying areas<br/>
• 🔴 <b>&gt;20 ft</b> — Evacuation Danger: Immediate action required<br/><br/>
<b>At the current rainfall rate of ${rain} mm</b>, watch Gwalmandi, New Katarian, and Pirwadhai bridges. Communities in the <b>lower catchment (Saddar, Commercial Market, 6th Road underpasses)</b> face highest inundation risk within 2–4 hours of peak rainfall.<br/><br/>
<span style="color:#34d399">Source: CDA / PMD historical gauge data + community observation network</span>`;
  }

  /* ── Rainfall & What It Means ── */
  if (q.includes('rainfall') || q.includes('rain') || q.includes('precipitation') || q.includes('42mm') || q.includes('millimeter')) {
    const risk = rain > 40 ? '🔴 <b>VERY HIGH</b> — Major flooding probable. Avoid all low-lying areas.'
                : rain > 25 ? '🟠 <b>HIGH</b> — Significant flash flooding possible.'
                : rain > 15 ? '🟡 <b>MODERATE</b> — Urban waterlogging likely in low-lying sectors.'
                : '🟢 <b>LOW</b> — Minor surface runoff only.';

    return `<b>🌧️ Rainfall Context for Rawalpindi–Islamabad</b><br/><br/>
<b>Current 24-hour rainfall:</b> ${rain} mm (Open-Meteo live feed)<br/>
<b>Flood risk level:</b> ${risk}<br/><br/>
<b>Reference Thresholds:</b><br/>
• <b>&lt;5 mm</b> — Light drizzle, negligible urban impact<br/>
• <b>5–15 mm</b> — Light rain, minor runoff<br/>
• <b>15–30 mm</b> — Moderate rain, urban waterlogging in Saddar, I-8, E-11<br/>
• <b>30–50 mm</b> — Heavy rain, Nullah Lai rises, underpass flooding<br/>
• <b>&gt;50 mm</b> — Extreme event, full Nullah Lai overflow risk<br/><br/>
<b>Humidity is ${humid}%</b> — high humidity slows evaporation and prolongs standing water accumulation in areas like 6th Road underpass and Faizabad interchange.<br/><br/>
<span style="color:#94a3b8;font-size:11px">⚠️ This is satellite and model data — always cross-check with community reports on the map.</span>`;
  }

  /* ── Temperature & Heat ── */
  if (q.includes('temperature') || q.includes('heat') || q.includes('hot')) {
    return `<b>🌡️ Temperature Context — Rawalpindi–Islamabad</b><br/><br/>
<b>Current temperature:</b> ${temp}°C<br/><br/>
During <b>post-rain conditions</b>, elevated humidity (currently ${humid}%) combined with temperatures around ${temp}°C creates a <b>heat-index</b> sensation significantly above the thermometer reading. This is especially hazardous for outdoor rescue workers and people without shade or water.<br/><br/>
<b>Important for TerraRescue context:</b><br/>
• Pre-monsoon heat (May–June) softens soils, increasing landslide risk in Margalla slopes<br/>
• Post-rain temperature drops in Islamabad can trigger fog and reduce visibility near Motorway/Murree Road<br/>
• Prolonged heat before a heavy rain event accelerates storm drain blockage from dust accumulation<br/><br/>
<span style="color:#34d399">Stay hydrated and seek shade. Check community resources map for water distribution points.</span>`;
  }

  /* ── Which areas flood first ── */
  if (q.includes('sector') || q.includes('which area') || q.includes('where') || q.includes('flood first') || q.includes('i-8') || q.includes('e-11') || q.includes('saddar')) {
    return `<b>🗺️ High-Risk Flood Sectors — Rawalpindi–Islamabad</b><br/><br/>
Based on historical data and current drainage topology:<br/><br/>
<b>🔴 Critical Risk (floods within 1–2 hours of heavy rain):</b><br/>
• <b>Nullah Lai Corridor</b> — Gwalmandi, New Katarian, Pirwadhai, Saddar<br/>
• <b>6th Road & Commercial Market underpasses</b> — regular submergence<br/>
• <b>Murree Road low points</b> — Committee Chowk to Faizabad<br/><br/>
<b>🟠 Moderate Risk:</b><br/>
• <b>I-8/1 to I-8/4</b> — storm drains overflow with &gt;25 mm rain<br/>
• <b>G-10/4 & G-11 channels</b> — natural drains encroached<br/><br/>
<b>🟡 Lower Risk:</b><br/>
• <b>E-7, F-7, F-8</b> — better planned drainage<br/>
• <b>DHA Phase 2</b> — recent construction with improved stormwater<br/><br/>
<span style="color:#94a3b8;font-size:11px">Cross-reference with community reports on the live map for real-time ground conditions.</span>`;
  }

  /* ── How the BLE button works ── */
  if (q.includes('ble') || q.includes('bluetooth') || q.includes('button') || q.includes('emergency button') || q.includes('panic')) {
    return `<b>🔘 Bluetooth Emergency Button — How It Works</b><br/><br/>
<b>Architecture:</b><br/>
<code style="background:#0f172a;padding:2px 6px;border-radius:4px">Physical BLE Button → Bluetooth Low Energy → Phone App → Internet → Trusted Contacts</code><br/><br/>
<b>Workflow:</b><br/>
1. User carries a small BLE device (ESP32-based or compatible hardware)<br/>
2. Single press → TerraRescue app detects activation within milliseconds<br/>
3. 5-second cancellation countdown activates (prevents accidental sends)<br/>
4. If not cancelled: police siren sounds, haptic vibration, GPS location is packaged<br/>
5. Pre-filled WhatsApp & SMS links generated for all trusted contacts<br/><br/>
<b>Important Limitations:</b><br/>
• Range: ~10 metres (standard BLE range)<br/>
• Requires phone with active internet connection for remote alerts<br/>
• Test Mode available to verify the chain without triggering real alerts<br/><br/>
<span style="color:#f87171">TerraRescue is a supplementary tool. Always call <b>1122</b> in a life-threatening emergency.</span>`;
  }

  /* ── Data reliability / community vs satellite ── */
  if (q.includes('reliable') || q.includes('difference') || q.includes('satellite') || q.includes('community') || q.includes('verify') || q.includes('trust')) {
    return `<b>📊 Data Source Reliability in TerraRescue</b><br/><br/>
TerraRescue uses a transparent <b>Data Trust System</b> with four levels:<br/><br/>
🛰️ <b>Verified Satellite Dataset</b><br/>
— Source: NASA EONET, NASA POWER, Open-Meteo<br/>
— Coverage: Regional (10–25 km grid), updated every 1–6 hours<br/>
— Limitation: Cannot detect a single flooded street<br/><br/>
📸 <b>Confirmed Ground Evidence</b><br/>
— Source: Photos + descriptions from community members<br/>
— Coverage: Hyper-local (exact street/intersection)<br/>
— Limitation: Subject to human error; photos can misrepresent timing<br/><br/>
👥 <b>Community Verified</b><br/>
— Elevated trust when 3+ users confirm the same observation<br/>
— Higher confidence than a single report<br/><br/>
⚠️ <b>Unverified Observation</b><br/>
— Single-user report, not yet confirmed<br/>
— Treat as a tip rather than confirmed fact<br/><br/>
<span style="color:#34d399">Always look at both satellite context AND community reports together for the best picture.</span>`;
  }

  /* ── Urdu / Preparedness ── */
  if (q.includes('urdu') || q.includes('preparedness') || q.includes('سیلاب') || q.includes('بچاؤ') || q.includes('تیاری')) {
    return `<b>بارش اور سیلاب سے بچاؤ کی تدابیر (Rawalpindi–Islamabad)</b><br/><br/>
🔴 <b>فوری اقدامات:</b><br/>
• نالہ لئی یا کسی بھی نالے کے قریب نہ جائیں<br/>
• پانی بھرے انڈرپاسز اور گوالمنڈی پل سے دور رہیں<br/>
• اپنے گھر کی نچلی منزل خالی کریں اگر پانی آنے کا خطرہ ہو<br/><br/>
🟡 <b>ایمرجنسی نمبرز:</b><br/>
• <b>ریسکیو 1122</b> (راولپنڈی پنجاب)<br/>
• <b>سی ڈی اے ہیلپ لائن 16</b> (اسلام آباد)<br/>
• <b>پولیس 15</b><br/><br/>
🟢 <b>احتیاطی تدابیر:</b><br/>
• موبائل چارج رکھیں، TerraRescue BLE بٹن استعمال کریں<br/>
• پڑوسیوں کو خبردار کریں<br/>
• ضروری دستاویزات اور دوائیں اونچی جگہ رکھیں<br/><br/>
<span style="color:#34d399">TerraRescue صرف معلومات فراہم کرتا ہے — حتمی فیصلے کیلئے سرکاری اداروں سے رابطہ کریں۔</span>`;
  }

  /* ── General / fallback ── */
  return `<b>🌍 Current TerraRescue Environmental Status</b><br/><br/>
<table style="width:100%;border-collapse:collapse;font-size:12px">
  <tr><td style="color:#94a3b8;padding:3px 0">🌡️ Temperature</td><td style="color:#fff;font-weight:600;text-align:right">${temp}°C</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">🌧️ 24h Rainfall</td><td style="color:#fff;font-weight:600;text-align:right">${rain} mm</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">💧 Humidity</td><td style="color:#fff;font-weight:600;text-align:right">${humid}%</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">🌬️ Wind</td><td style="color:#fff;font-weight:600;text-align:right">${weather?.windSpeed ?? 14} km/h</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">🌤️ Condition</td><td style="color:#34d399;font-weight:600;text-align:right">${cond}</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">👥 Community Reports</td><td style="color:#fff;font-weight:600;text-align:right">${reportsCount} active</td></tr>
  <tr><td style="color:#94a3b8;padding:3px 0">🛰️ NASA EONET Events</td><td style="color:#fff;font-weight:600;text-align:right">${nasaData?.length ?? 0} regional alerts</td></tr>
</table><br/>
<b>Ask me about specific topics:</b><br/>
• Nullah Lai levels & danger thresholds<br/>
• Which sectors flood first in Rawalpindi<br/>
• How community reports are verified<br/>
• Flood preparedness in Urdu (اردو میں)<br/>
• BLE emergency button operation<br/>
• NASA satellite data explained`;
}
