import React from 'react';
import type { CourtType } from '../../types/play';
import { COURT_TEMPLATES } from '../../data/presetPlays';
import type { TemplateDefinition } from '../../data/presetPlays';
import { X, Check, LayoutGrid, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { CourtThumbnail } from '../Court/CourtThumbnail';

interface CourtTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSetup: (courtType: CourtType, template: TemplateDefinition) => void;
}

export const CourtTemplateModal: React.FC<CourtTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectSetup,
}) => {
  const [selectedCourtType, setSelectedCourtType] = React.useState<CourtType>('half');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('5-out');

  if (!isOpen) return null;

  const courtTypes: { id: CourtType; title: string; desc: string }[] = [
    { id: 'half', title: 'Half Court', desc: 'Standard tactical half court' },
    { id: 'full-horizontal', title: 'Horizontal Full Court', desc: 'Full length horizontal view' },
    { id: 'full-vertical', title: 'Vertical Full Court', desc: 'Full length vertical view' },
  ];

  const handleStart = () => {
    soundEffects.playWhistle();
    const template = COURT_TEMPLATES.find(t => t.id === selectedTemplateId) || COURT_TEMPLATES[0];
    onSelectSetup(selectedCourtType, template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#262626] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white">
                Create New Play
              </h2>
              <p className="text-xs text-[#c4ced4] font-semibold">
                Pick your court layout and starting tactical formation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Step 1: Court Type Picker */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#c4ced4]">
            1. Select Court Type
          </label>
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
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#181818] border-[#c4ced4] shadow-lg ring-2 ring-white/20'
                      : 'bg-[#121212] border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">{c.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400">{c.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Step 2: Tactical Starting Formations */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#c4ced4]">
            2. Choose Starting Formation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COURT_TEMPLATES.map(tmpl => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedTemplateId(tmpl.id);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#181818] border-[#c4ced4] shadow-lg ring-2 ring-white/20'
                      : 'bg-[#121212] border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  {/* Full Scaled Court Thumbnail Preview */}
                  <CourtThumbnail
                    pieces={tmpl.pieces}
                    ball={tmpl.ball}
                    courtType={selectedCourtType}
                    className="shadow-sm"
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{tmpl.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-black shadow-lg transition-all transform active:scale-95"
          >
            <span>Open Play Creator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
