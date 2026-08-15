import React from 'react';
import type { ActiveTool, CourtType, CourtTheme } from '../../types/play';
import {
  MousePointer,
  UserPlus,
  Shield,
  CircleDot,
  ArrowUpRight,
  Split,
  Sparkles,
  Target,
  Eraser,
  Volume2,
  VolumeX,
  BookOpen,
  Save,
  Download,
  Share2,
  Trash2,
  Flame,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface TacticalToolbarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  courtType: CourtType;
  onChangeCourtType: (type: CourtType) => void;
  courtTheme: CourtTheme;
  onChangeCourtTheme: (theme: CourtTheme) => void;
  onClearFrame: () => void;
  onOpenPlaybook: () => void;
  onSavePlay: () => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({
  activeTool,
  onSelectTool,
  courtType,
  onChangeCourtType,
  courtTheme,
  onChangeCourtTheme,
  onClearFrame,
  onOpenPlaybook,
  onSavePlay,
  onExportPNG,
  onExportJSON,
  isMuted,
  onToggleSound,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const tools = [
    { id: 'select', label: 'Select / Move', icon: MousePointer, group: 'mode' },
    { id: 'add_offense', label: 'Add Offense Player', icon: UserPlus, color: 'text-sky-300', group: 'piece' },
    { id: 'add_defense', label: 'Add Defense Player', icon: Shield, color: 'text-white', group: 'piece' },
    { id: 'add_ball', label: 'Add Basketball', icon: CircleDot, color: 'text-sky-400', group: 'piece' },
    { id: 'add_cone', label: 'Add Cone', icon: Flame, color: 'text-sky-300', group: 'piece' },
    
    { id: 'pass', label: 'Pass Path', icon: ArrowUpRight, color: 'text-sky-400', group: 'drawing' },
    { id: 'cut', label: 'Cut Run', icon: ArrowUpRight, color: 'text-white', group: 'drawing' },
    { id: 'dribble', label: 'Dribble Path', icon: Sparkles, color: 'text-sky-300', group: 'drawing' },
    { id: 'screen', label: 'Screen / Pick', icon: Split, color: 'text-white', group: 'drawing' },
    { id: 'shot', label: 'Shot Arc', icon: Target, color: 'text-sky-400', group: 'drawing' },
    { id: 'eraser', label: 'Eraser', icon: Eraser, color: 'text-red-400', group: 'mode' },
  ];

  return (
    <header className="w-full bg-black/95 backdrop-blur-md border-b border-sky-950/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-30">
      {/* Brand Logo & Court Switchers */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <CircleDot className="w-5 h-5 text-slate-950 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
              COACHBOARD
            </h1>
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest -mt-0.5">
              Black & Baby Blue Edition
            </p>
          </div>
        </div>

        {/* Court View Switcher Toggle */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-sky-900/40 text-xs font-bold">
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeCourtType('half');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              courtType === 'half'
                ? 'bg-sky-400 text-slate-950 font-black shadow-md shadow-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Half Court
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeCourtType('full-horizontal');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              courtType === 'full-horizontal' || courtType === 'full-vertical'
                ? 'bg-sky-400 text-slate-950 font-black shadow-md shadow-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Court
          </button>
        </div>

        {/* Theme Dropdown */}
        <select
          value={courtTheme}
          onChange={e => {
            soundEffects.playClick();
            onChangeCourtTheme(e.target.value as CourtTheme);
          }}
          className="bg-slate-950 text-sky-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-900/40 focus:outline-none focus:border-sky-400 cursor-pointer"
        >
          <option value="dark-tactical">🖤 Midnight Black & Baby Blue</option>
          <option value="cyber-neon">🌐 Cyber Neon</option>
          <option value="classic-hardwood">🪵 Classic Hardwood</option>
          <option value="clean-whiteboard">📋 Whiteboard</option>
        </select>
      </div>

      {/* Main Tactical Tools Group */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-sky-900/40 shadow-inner">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectTool(tool.id as ActiveTool);
              }}
              title={tool.label}
              className={`relative p-2 rounded-xl transition-all duration-150 flex items-center justify-center ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : tool.color || ''}`} />
            </button>
          );
        })}

        <div className="w-px h-6 bg-slate-800 mx-1" />

        <button
          onClick={() => {
            soundEffects.playClick();
            onClearFrame();
          }}
          title="Clear Current Step"
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Actions & Library */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-xl bg-slate-950 border border-sky-900/40 text-slate-300 hover:text-sky-400 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenPlaybook();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-sky-900/40 hover:border-sky-400 text-slate-200 text-xs font-bold shadow transition-all hover:text-sky-300"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Playbook Library</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            onSavePlay();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/25 transition-all transform active:scale-95"
        >
          <Save className="w-4 h-4 fill-current" />
          <span>Save Play</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 rounded-xl bg-slate-950 border border-sky-900/40 text-slate-300 hover:text-sky-400 transition-colors"
            title="Export Play"
          >
            <Download className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-950 border border-sky-900/60 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPNG();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-sky-400 transition-colors text-left"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Diagram PNG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportJSON();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-sky-400 transition-colors text-left"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Play JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
