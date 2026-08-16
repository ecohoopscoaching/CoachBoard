import React from 'react';
import type { CourtType } from '../../types/play';
import { COURT_TEMPLATES } from '../../data/presetPlays';
import type { TemplateDefinition } from '../../data/presetPlays';
import {
  X,
  Check,
  LayoutGrid,
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { CourtThumbnail } from '../Court/CourtThumbnail';

interface CourtTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSetup: (courtType: CourtType, template: TemplateDefinition) => void;
  onOpenPlaybook?: () => void;
  savedPlaysCount?: number;
}

export const CourtTemplateModal: React.FC<CourtTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectSetup,
  onOpenPlaybook,
  savedPlaysCount = 0,
}) => {
  const [selectedCourtType, setSelectedCourtType] = React.useState<CourtType>('half');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('5-out');

  if (!isOpen) return null;

  const courtTypes: { id: CourtType; title: string; desc: string; icon: string }[] = [
    { id: 'half', title: 'Half Court', desc: 'Standard tactical half court for offensive/defensive sets', icon: '🏀' },
    { id: 'full-horizontal', title: 'Full Court (Horizontal)', desc: 'Transition, press breaks, and full court schemes', icon: '⚡' },
    { id: 'full-vertical', title: 'Full Court (Vertical)', desc: 'End-to-end full court tactical alignment', icon: '📐' },
  ];

  const handleStart = () => {
    soundEffects.playWhistle();
    const template = COURT_TEMPLATES.find(t => t.id === selectedTemplateId) || COURT_TEMPLATES[0];
    onSelectSetup(selectedCourtType, template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0c0d10] border border-zinc-800 rounded-3xl p-5 sm:p-8 text-white shadow-2xl flex flex-col gap-6 max-h-[94vh] overflow-y-auto">
        
        {/* BRAND HERO HEADER */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-black text-white shadow-xl">
              <LayoutGrid className="w-6 h-6 text-[#c4ced4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                  CoachBoard Studio
                </h1>
                <span className="bg-zinc-800 border border-zinc-700 text-[#c4ced4] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  San Antonio Spurs Edition
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
                Select your court format & starting tactical formation to begin designing
              </p>
            </div>
          </div>

          {/* Quick Playbook Access Card on Landing Page */}
          <div className="flex items-center gap-2">
            {onOpenPlaybook && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                  onOpenPlaybook();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-black transition-all shadow-lg group active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-[#c4ced4] group-hover:scale-110 transition-transform" />
                <span>Browse Playbook ({savedPlaysCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
              title="Close template picker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. STEP 1: COURT FORMAT */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#c4ced4] border border-zinc-700 flex items-center justify-center text-[10px] font-black">
              1
            </span>
            <label className="text-xs font-black uppercase tracking-wider text-zinc-200">
              Select Court Layout
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {courtTypes.map(c => {
              const isSelected = selectedCourtType === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCourtType(c.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-white shadow-xl ring-2 ring-zinc-400/30'
                      : 'bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{c.icon}</span>
                      <span className="font-black text-sm text-white">{c.title}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 leading-relaxed">{c.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. STEP 2: TACTICAL FORMATION & SPACING */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#c4ced4] border border-zinc-700 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-200">
                Choose Starting Formation & Spacing
              </label>
            </div>
            <span className="text-[11px] font-bold text-zinc-500">
              {COURT_TEMPLATES.length} tactical alignments ready
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COURT_TEMPLATES.map(tmpl => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedTemplateId(tmpl.id);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-zinc-900 border-white shadow-xl ring-2 ring-zinc-400/30'
                      : 'bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Scaled Court Thumbnail Preview with True Basketball Aspect Ratio */}
                  <div className="w-full rounded-xl overflow-hidden border border-zinc-800 group-hover:border-zinc-700 bg-black transition-colors pointer-events-none shadow-inner">
                    <CourtThumbnail
                      pieces={tmpl.pieces}
                      ball={tmpl.ball}
                      courtType={selectedCourtType}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs text-white truncate">{tmpl.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">
              Ready to draw tactical lines, cuts, screens, passes, and animations.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Skip / Blank Canvas
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black shadow-xl transition-all transform active:scale-95 group"
            >
              <span>Launch Whiteboard with Setup</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
