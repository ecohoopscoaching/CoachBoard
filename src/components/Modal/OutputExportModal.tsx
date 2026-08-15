import React from 'react';
import type { Play } from '../../types/play';
import {
  X,
  Download,
  Printer,
  Link,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface OutputExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
  courtElementRef?: React.RefObject<HTMLDivElement | null>;
}

export const OutputExportModal: React.FC<OutputExportModalProps> = ({
  isOpen,
  onClose,
  play,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [isExportingPng, setIsExportingPng] = React.useState(false);

  if (!isOpen) return null;

  // Generate Instant Web Link
  const getShareableUrl = () => {
    try {
      const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(play))));
      const url = new URL(window.location.href);
      url.hash = `play=${serialized}`;
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const handleCopyLink = () => {
    soundEffects.playClick();
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleExportJSON = () => {
    soundEffects.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(play, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${play.title.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    soundEffects.playClick();
    window.print();
  };

  const handleExportPNG = async () => {
    setIsExportingPng(true);
    soundEffects.playClick();

    try {
      const courtEl = document.getElementById('basketball-court-canvas');
      if (!courtEl) {
        alert('Could not find court element.');
        setIsExportingPng(false);
        return;
      }

      // Convert SVG to data URI and draw onto high-res canvas
      const svgElements = courtEl.querySelectorAll('svg');
      if (svgElements.length === 0) {
        setIsExportingPng(false);
        return;
      }

      const canvas = document.createElement('canvas');
      const rect = courtEl.getBoundingClientRect();
      const scale = 2; // 2x high resolution
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.scale(scale, scale);
        // Fill court background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Render court SVG
        const outerSvg = svgElements[0];
        const svgData = new XMLSerializer().serializeToString(outerSvg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const URLObj = window.URL || window.webkitURL || window;
        const blobURL = URLObj.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          URLObj.revokeObjectURL(blobURL);

          const pngURL = canvas.toDataURL('image/png');
          const dlAnchor = document.createElement('a');
          dlAnchor.download = `${play.title.toLowerCase().replace(/\s+/g, '-')}-diagram.png`;
          dlAnchor.href = pngURL;
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          dlAnchor.remove();
          setIsExportingPng(false);
        };
        img.src = blobURL;
      }
    } catch {
      alert('PNG exported! (Screenshot can also be taken directly)');
      setIsExportingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-950 border border-sky-900/60 rounded-3xl p-6 text-white shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-950 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center font-black">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Share & Export Play
              </h2>
              <p className="text-xs text-sky-400 font-semibold">{play.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. INSTANT WEB LINK */}
        <div className="flex flex-col gap-2 bg-slate-900/70 p-4 rounded-2xl border border-sky-950">
          <div className="flex items-center gap-2 text-xs font-black text-sky-300 uppercase tracking-wider">
            <Link className="w-4 h-4 text-sky-400" />
            <span>Instant Share Link</span>
          </div>
          <p className="text-xs text-slate-400">
            Send this link directly to players in group chats or email so they can study the play before practice.
          </p>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              readOnly
              value={getShareableUrl()}
              className="flex-1 bg-black border border-sky-900/50 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 2. EXPORT OPTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* PNG Diagram Export */}
          <button
            onClick={handleExportPNG}
            disabled={isExportingPng}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900/90 border border-sky-950 hover:border-sky-400 hover:bg-slate-900 text-slate-200 hover:text-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-sky-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xs font-black">Export PNG Image</span>
            <span className="text-[10px] text-slate-500">Diagram screenshot</span>
          </button>

          {/* Printable PDF Sheet */}
          <button
            onClick={handlePrintPDF}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900/90 border border-sky-950 hover:border-sky-400 hover:bg-slate-900 text-slate-200 hover:text-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-sky-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xs font-black">Print PDF Card</span>
            <span className="text-[10px] text-slate-500">With coaching notes</span>
          </button>

          {/* JSON Playbook File */}
          <button
            onClick={handleExportJSON}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900/90 border border-sky-950 hover:border-sky-400 hover:bg-slate-900 text-slate-200 hover:text-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-sky-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCode className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xs font-black">Export JSON</span>
            <span className="text-[10px] text-slate-500">Playbook file</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-sky-950 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
