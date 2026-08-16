import React from 'react';
import type { AppMode, CourtType, CourtTheme } from '../../types/play';
import {
  X,
  Pencil,
  Play as PlayIcon,
  FileText,
  Share2,
  Undo2,
  Redo2,
  RotateCcw,
  MoreHorizontal,
  Save,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface PlayCreatorHeaderProps {
  title: string;
  onChangeTitle: (title: string) => void;
  currentMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSavePlay: () => void;
  onOpenTemplates: () => void;
  onOpenPlaybook: () => void;
  courtType: CourtType;
  onChangeCourtType: (type: CourtType) => void;
  courtTheme: CourtTheme;
  onChangeCourtTheme: (theme: CourtTheme) => void;
  onClearFrame: () => void;
  onResetBoard: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const PlayCreatorHeader: React.FC<PlayCreatorHeaderProps> = ({
  title,
  onChangeTitle,
  currentMode,
  onChangeMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSavePlay,
  onOpenTemplates,
  onOpenPlaybook,
  courtType,
  onChangeCourtType,
  courtTheme,
  onChangeCourtTheme,
  onClearFrame,
  onResetBoard,
  isMuted,
  onToggleSound,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [showResetMenu, setShowResetMenu] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(title);

  React.useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onChangeTitle(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  return (
    <header className="w-full bg-[#0a0a0a] border-b border-[#262626] px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 shadow-xl z-40 select-none text-white shrink-0">
      {/* 1. LEFT: Close & Segmented Mode Control */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenTemplates();
          }}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#141414] hover:bg-[#262626] border border-[#262626] text-slate-300 hover:text-white text-xs font-bold transition-all shrink-0"
          title="New Play / Template Picker"
        >
          <X className="w-4 h-4 text-[#c4ced4]" />
          <span className="hidden md:inline ml-1">New</span>
        </button>

        {/* MODE TABS (Draw, Animate, Notes, Output) */}
        <div className="flex items-center p-0.5 bg-[#141414] rounded-xl border border-[#262626] text-xs font-bold shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('draw');
            }}
            title="Draw Mode"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentMode === 'draw'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Draw</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('animate');
            }}
            title="Animate Mode"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentMode === 'animate'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlayIcon className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Animate</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('notes');
            }}
            title="Coaching Notes"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentMode === 'notes'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notes</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('output');
            }}
            title="Output & Export"
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentMode === 'output'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Output</span>
          </button>
        </div>
      </div>

      {/* 2. CENTER: Title with inline rename */}
      <div className="flex-1 min-w-0 px-1 text-center max-w-[140px] sm:max-w-xs md:max-w-md">
        {isEditingTitle ? (
          <input
            type="text"
            autoFocus
            value={tempTitle}
            onChange={e => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTempTitle(title);
                setIsEditingTitle(false);
              }
            }}
            className="w-full bg-[#141414] border border-[#c4ced4] rounded-xl px-2 py-1 text-xs font-black text-center text-white focus:outline-none shadow-inner"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="px-2 py-1 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-[#262626] text-xs sm:text-sm font-black text-white hover:text-[#c4ced4] truncate max-w-full block mx-auto transition-all"
            title="Click to rename play"
          >
            {title}
          </button>
        )}
      </div>

      {/* 3. RIGHT: Actions (Undo, Redo, Reset, Sound, More, Save) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Undo */}
        <button
          disabled={!canUndo}
          onClick={() => {
            soundEffects.playClick();
            onUndo();
          }}
          title="Undo (Ctrl+Z)"
          className="p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] disabled:opacity-25 disabled:hover:text-slate-400 text-slate-300 hover:text-white hover:border-[#404040] transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Redo */}
        <button
          disabled={!canRedo}
          onClick={() => {
            soundEffects.playClick();
            onRedo();
          }}
          title="Redo (Ctrl+Y)"
          className="p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] disabled:opacity-25 disabled:hover:text-slate-400 text-slate-300 hover:text-white hover:border-[#404040] transition-colors"
        >
          <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Desktop-Only Reset Button */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowResetMenu(!showResetMenu)}
            title="Reset Options"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141414] border border-[#262626] hover:border-red-500/60 text-slate-300 hover:text-red-400 text-xs font-bold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Reset</span>
          </button>

          {showResetMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
              <button
                onClick={() => {
                  setShowResetMenu(false);
                  soundEffects.playClick();
                  onClearFrame();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-[#262626] hover:text-white text-left transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#c4ced4]" />
                <span>Reset Current Phase</span>
              </button>

              <button
                onClick={() => {
                  setShowResetMenu(false);
                  soundEffects.playClick();
                  onResetBoard();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-[#262626] text-left transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset Entire Board</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop-Only Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="hidden md:flex p-2 rounded-xl bg-[#141414] border border-[#262626] text-slate-300 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-[#c4ced4]" />}
        </button>

        {/* Unified More Menu (•••) */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className="p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] text-slate-300 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-fade-in">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenPlaybook();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#c4ced4] hover:bg-[#262626] text-left"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Tactical Playbook</span>
              </button>

              <div className="w-full h-px bg-[#262626] my-1" />

              <div className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Court Settings
              </div>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  const courtTypes: CourtType[] = ['half', 'full-vertical', 'full-horizontal'];
                  const nextType = courtTypes[(courtTypes.indexOf(courtType) + 1) % courtTypes.length];
                  onChangeCourtType(nextType);
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#262626] hover:text-white"
              >
                <span>Court View</span>
                <span className="text-[10px] text-[#c4ced4] font-bold uppercase">{courtType}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  const themes: CourtTheme[] = ['spurs-hardwood', 'spurs-midnight', 'classic-hardwood', 'cyber-neon', 'clean-whiteboard'];
                  const nextTheme = themes[(themes.indexOf(courtTheme) + 1) % themes.length];
                  onChangeCourtTheme(nextTheme);
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#262626] hover:text-white"
              >
                <span>Theme</span>
                <span className="text-[10px] text-[#c4ced4] font-bold uppercase">{courtTheme.split('-')[0]}</span>
              </button>

              <div className="w-full h-px bg-[#262626] my-1" />

              {/* Mobile-Only Sound Toggle Item */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onToggleSound();
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#262626] md:hidden"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#c4ced4]" />}
                  <span>Sound Effects</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{isMuted ? 'Muted' : 'On'}</span>
              </button>

              {/* Mobile Reset Options */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onClearFrame();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#262626]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Current Phase</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onResetBoard();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-[#262626]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Entire Board</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Play Button */}
        <button
          onClick={() => {
            soundEffects.playWhistle();
            onSavePlay();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-black shadow-lg transition-all transform active:scale-95 shrink-0"
          title="Save Play to Library"
        >
          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </header>
  );
};
