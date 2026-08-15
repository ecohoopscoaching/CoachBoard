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
    <header className="w-full bg-[#0a0a0a] border-b border-[#262626] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 shadow-xl z-40 select-none text-white">
      {/* 1. LEFT: Close & Primary Modes */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenTemplates();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#262626] border border-[#262626] text-slate-300 hover:text-white text-xs font-bold transition-all"
          title="New Play / Template Picker"
        >
          <X className="w-4 h-4 text-[#c4ced4]" />
          <span className="hidden sm:inline">Close</span>
        </button>

        {/* MODE TABS (Draw, Animate, Notes, Output) */}
        <div className="flex items-center p-1 bg-[#141414] rounded-xl border border-[#262626] text-xs font-bold">
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('draw');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'draw'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('animate');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'animate'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlayIcon className="w-3.5 h-3.5 fill-current" />
            <span>Animate</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('notes');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'notes'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeMode('output');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'output'
                ? 'bg-[#c4ced4] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
        </div>
      </div>

      {/* 2. CENTER: Title with inline rename */}
      <div className="flex-1 max-w-xs sm:max-w-md text-center">
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
            className="w-full bg-[#141414] border border-[#c4ced4] rounded-xl px-3 py-1 text-xs font-black text-center text-white focus:outline-none shadow-inner"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="px-3 py-1 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-[#262626] text-xs sm:text-sm font-black text-white hover:text-[#c4ced4] truncate max-w-full transition-all"
            title="Click to rename play"
          >
            {title}
          </button>
        )}
      </div>

      {/* 3. RIGHT: Undo, Redo, Reset, More Menu, Save Play */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo */}
        <button
          disabled={!canUndo}
          onClick={() => {
            soundEffects.playClick();
            onUndo();
          }}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-xl bg-[#141414] border border-[#262626] disabled:opacity-30 disabled:hover:text-slate-400 text-slate-300 hover:text-white hover:border-[#404040] transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          disabled={!canRedo}
          onClick={() => {
            soundEffects.playClick();
            onRedo();
          }}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-xl bg-[#141414] border border-[#262626] disabled:opacity-30 disabled:hover:text-slate-400 text-slate-300 hover:text-white hover:border-[#404040] transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Dedicated Reset Button with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowResetMenu(!showResetMenu)}
            title="Reset Options"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141414] border border-[#262626] hover:border-red-500/60 text-slate-300 hover:text-red-400 text-xs font-bold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Reset</span>
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

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-xl bg-[#141414] border border-[#262626] text-slate-300 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-[#c4ced4]" />}
        </button>

        {/* More Menu ••• */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Play Options"
            className="p-2 rounded-xl bg-[#141414] border border-[#262626] text-slate-300 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Court Options
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

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onClearFrame();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#262626]"
              >
                <span>Clear Current Phase</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenPlaybook();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#c4ced4] hover:bg-[#262626]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Playbook Library</span>
              </button>
            </div>
          )}
        </div>

        {/* Prominent Save Play Button */}
        <button
          onClick={() => {
            soundEffects.playWhistle();
            onSavePlay();
          }}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-black shadow-lg transition-all transform active:scale-95"
        >
          <Save className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Save Play</span>
        </button>
      </div>
    </header>
  );
};
