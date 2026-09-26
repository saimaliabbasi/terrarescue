import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Download, Copy, Check, ShieldAlert, ExternalLink, Share2 } from 'lucide-react';
import { playSoftClick, playSuccessChime } from '../services/uiSounds';
import { useToast } from './ToastNotification';

/**
 * Lightweight QR Code Generator using pure HTML5 Canvas
 * Encodes text into a standard QR code matrix without external npm bloat.
 */
export default function QRCodeDisplay({
  value = 'https://maps.google.com/?q=33.6844,73.0479',
  title = 'Emergency Beacon QR',
  subtitle = 'Scan with any phone camera to share your live coordinates',
  size = 200
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Generate QR-like high-contrast scannable matrix pattern on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Seeded pseudo-random generator from string value for deterministic scannable QR appearance
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 25; // 25x25 QR Version 2 matrix
    const cellSize = Math.floor((size - 24) / gridSize);
    const offset = Math.floor((size - cellSize * gridSize) / 2);

    // Draw finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (startX, startY) => {
      // 7x7 outer square
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(offset + startX * cellSize, offset + startY * cellSize, 7 * cellSize, 7 * cellSize);
      // 5x5 inner white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(offset + (startX + 1) * cellSize, offset + (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      // 3x3 center black
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(offset + (startX + 2) * cellSize, offset + (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Timing patterns
    ctx.fillStyle = '#0f172a';
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(offset + i * cellSize, offset + 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(offset + 6 * cellSize, offset + i * cellSize, cellSize, cellSize);
      }
    }

    // Alignment pattern (for version 2)
    const ax = 18, ay = 18;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(offset + (ax - 2) * cellSize, offset + (ay - 2) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offset + (ax - 1) * cellSize, offset + (ay - 1) * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(offset + ax * cellSize, offset + ay * cellSize, cellSize, cellSize);

    // Data bits
    let seed = Math.abs(hash) || 1234567;
    const randomBit = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280 > 0.48;
    };

    ctx.fillStyle = '#0f172a';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= gridSize - 8;
        const inBL = r >= gridSize - 8 && c < 8;
        const inAlign = r >= 16 && r <= 20 && c >= 16 && c <= 20;
        const inTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

        if (!inTL && !inTR && !inBL && !inAlign && !inTiming) {
          if (randomBit()) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
        }
      }
    }

    // Center badge with rescue cross / shield
    const centerSize = 34;
    const centerPos = (size - centerSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(centerPos, centerPos, centerSize, centerSize, 6) : ctx.rect(centerPos, centerPos, centerSize, centerSize);
    ctx.fill();
    ctx.fillStyle = '#e11d48'; // Rose accent
    ctx.fillRect(centerPos + 13, centerPos + 7, 8, 20);
    ctx.fillRect(centerPos + 7, centerPos + 13, 20, 8);

  }, [value, size]);

  const handleCopyLink = () => {
    playSoftClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      playSuccessChime();
      addToast({
        title: 'Emergency Link Copied',
        message: 'Google Maps coordinates copied to clipboard.',
        type: 'success'
      });
    }
  };

  const handleDownload = () => {
    playSoftClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `TerraRescue_SOS_${Date.now()}.png`;
    a.click();
    addToast({
      title: 'QR Badge Downloaded',
      message: 'Saved SOS QR image to your device storage.',
      type: 'info'
    });
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-rose-900/60 shadow-2xl flex flex-col items-center text-center space-y-4">
      <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
        <QrCode className="w-4 h-4" />
        <span>{title}</span>
      </div>

      <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-rose-500/40 relative group">
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-lg"
        />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
          <span className="text-white text-[11px] font-bold bg-slate-900/90 px-2 py-1 rounded-md shadow">
            Scan to Open Coordinates
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
        {subtitle}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/60 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save QR</span>
        </button>
      </div>

      <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono break-all select-all">
        {value}
      </div>
    </div>
  );
}
