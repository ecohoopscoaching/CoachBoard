import React from 'react';
import type { ActiveTool } from '../../types/play';
import {
  Flame,
  Type,
  Square,
  Circle,
  Triangle,
  Diamond,
  Minus,
  MousePointer,
  Eraser,
  RotateCcw,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface ActionToolboxProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool, meta?: any) => void;
  selectedPlayerLabel: string | null;
  onSelectPlayerTemplate: (type: 'circle-number' | 'plain-number' | 'defense-x', label: string) => void;
  onResetFrame?: () => void;
}

export const ActionToolbox: React.FC<ActionToolboxProps> = ({
  activeTool,
  onSelectTool,
  selectedPlayerLabel,
  onSelectPlayerTemplate,
  onResetFrame,
}) => {
  const actions = [
    { id: 'dribble', label: 'Dribble', desc: 'Wavy arrow' },
    { id: 'pass', label: 'Pass', desc: 'Dashed line' },
    { id: 'cut', label: 'Cut', desc: 'Solid line' },
    { id: 'screen', label: 'Screen', desc: 'T-bar pick' },
    { id: 'shot', label: 'Shot', desc: 'Arc to rim' },
    { id: 'handoff', label: 'Handoff', desc: 'Handoff bar' },
  ];

  const offenseNumbers = ['1', '2', '3', '4', '5', '6', '7', '?'];
  const defenseNumbers = ['1', '2', '3', '4', '5', '6', '7', '?'];

  const handleDragStart = (e: React.DragEvent, payload: Record<string, any>) => {
    e.dataTransfer.setData('application/coachboard-item', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-56 sm:w-64 bg-[#0a0a0a] border-l border-[#262626] flex flex-col h-full z-30 select-none overflow-y-auto p-3 sm:p-4 gap-4 text-white">
      {/* 1. SELECT / MOVE, ERASER, & RESET TOOLS */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectTool('select');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
            activeTool === 'select'
              ? 'bg-[#c4ced4] text-black shadow-md'
              : 'bg-[#141414] border border-[#262626] text-slate-300 hover:text-white hover:border-[#404040]'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectTool('eraser');
          }}
          title="Eraser (click items to delete)"
          className={`p-2 rounded-xl text-xs font-black transition-all ${
            activeTool === 'eraser'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[#141414] border border-[#262626] text-slate-400 hover:text-red-400'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>

        {onResetFrame && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onResetFrame();
            }}
            title="Reset Current Phase"
            className="p-2 rounded-xl text-xs font-black bg-[#141414] border border-[#262626] text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. SECTION: ADD ACTIONS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
            Add Actions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {actions.map(act => {
            const isActive = activeTool === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectTool(act.id as ActiveTool);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  isActive
                    ? 'bg-[#262626] text-white border-[#c4ced4] shadow-md'
                    : 'bg-[#141414] border-[#262626] text-slate-300 hover:text-white hover:border-[#404040]'
                }`}
              >
                {act.id === 'dribble' && (
                  <svg className="w-4 h-4 text-[#c4ced4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M 2 12 Q 6 6, 10 12 T 18 12 L 22 12" strokeDasharray="3,3" />
                  </svg>
                )}
                {act.id === 'pass' && (
                  <svg className="w-4 h-4 text-[#c4ced4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="2" y1="12" x2="18" y2="12" strokeDasharray="4,3" />
                    <polyline points="14 7 20 12 14 17" />
                  </svg>
                )}
                {act.id === 'cut' && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="2" y1="12" x2="18" y2="12" />
                    <polyline points="14 7 20 12 14 17" />
                  </svg>
                )}
                {act.id === 'screen' && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="2" y1="12" x2="18" y2="12" />
                    <line x1="18" y1="5" x2="18" y2="19" strokeWidth="3" />
                  </svg>
                )}
                {act.id === 'shot' && (
                  <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M 2 18 Q 10 4, 18 10" strokeDasharray="3,3" />
                    <circle cx="20" cy="11" r="3" />
                  </svg>
                )}
                {act.id === 'handoff' && (
                  <svg className="w-4 h-4 text-[#c4ced4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="2" y1="12" x2="16" y2="12" />
                    <line x1="16" y1="6" x2="16" y2="18" strokeWidth="2.5" />
                    <line x1="20" y1="6" x2="20" y2="18" strokeWidth="2.5" />
                  </svg>
                )}
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: ADD PLAYERS (1-7 & X1-X7 with Drag-and-Drop) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
            Add Players (Click or Drag)
          </span>
        </div>

        <div className="flex flex-col gap-3 bg-[#141414] p-3 rounded-2xl border border-[#262626]">
          {/* Offense Row: Circled Numbers (1) - (7) + (?) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offense 1–7</span>
            <div className="grid grid-cols-4 gap-1.5">
              {offenseNumbers.map(num => {
                const isSelected = activeTool === 'add_offense_circled' && selectedPlayerLabel === num;
                return (
                  <button
                    key={`c-${num}`}
                    draggable={true}
                    onDragStart={(e) =>
                      handleDragStart(e, {
                        type: 'offense',
                        tool: 'add_offense_circled',
                        label: num,
                        style: 'circle-number',
                      })
                    }
                    onClick={() => {
                      soundEffects.playClick();
                      onSelectPlayerTemplate('circle-number', num);
                    }}
                    title={`Click or Drag Offense Player (${num})`}
                    className={`h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all border-2 cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? 'bg-white text-black border-white ring-2 ring-[#c4ced4] scale-105 shadow-lg'
                        : 'bg-white/10 text-white border-white/60 hover:bg-white hover:text-black'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Defense Row: Defenders X1 - X7 + X? */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Defense X1–X7</span>
            <div className="grid grid-cols-4 gap-1.5">
              {defenseNumbers.map(num => {
                const label = num === '?' ? 'X?' : `X${num}`;
                const isSelected = activeTool === 'add_defense_x' && selectedPlayerLabel === label;
                return (
                  <button
                    key={`d-${num}`}
                    draggable={true}
                    onDragStart={(e) =>
                      handleDragStart(e, {
                        type: 'defense',
                        tool: 'add_defense_x',
                        label,
                        style: 'defense-x',
                      })
                    }
                    onClick={() => {
                      soundEffects.playClick();
                      onSelectPlayerTemplate('defense-x', label);
                    }}
                    title={`Click or Drag Defender ${label}`}
                    className={`h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? 'bg-white text-black border-white ring-2 ring-[#c4ced4] scale-105 shadow-lg'
                        : 'bg-[#1e1e1e] text-[#c4ced4] border-[#404040] hover:bg-white hover:text-black hover:border-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION: ADD MISC (Basketball, Cones, Shapes, Notes) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
            Add Misc (Click or Drag)
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-[#141414] p-2.5 rounded-2xl border border-[#262626]">
          {/* Basketball */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_ball' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_ball');
            }}
            title="Basketball"
            className={`p-1.5 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_ball'
                ? 'bg-white/20 border border-white ring-2 ring-[#c4ced4] scale-105'
                : 'hover:bg-[#262626]'
            }`}
          >
            <img src="/basketball.png" alt="Basketball" className="w-5 h-5 object-contain select-none pointer-events-none" draggable={false} />
          </button>

          {/* Cone */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_cone' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_cone');
            }}
            title="Training Cone"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_cone'
                ? 'bg-orange-500 text-white ring-2 ring-white scale-105'
                : 'text-orange-400 hover:bg-[#262626]'
            }`}
          >
            <Flame className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Text Annotation */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_text' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_text');
            }}
            title="Text Note"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_text'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Type className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Rectangle Shape */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_rect' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_rect');
            }}
            title="Rectangle"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_rect'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Square className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Circle Shape */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_circle' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_circle');
            }}
            title="Circle"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_circle'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Circle className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Triangle Shape */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_triangle' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_triangle');
            }}
            title="Triangle"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_triangle'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Triangle className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Diamond Shape */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_diamond' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_diamond');
            }}
            title="Diamond"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_diamond'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Diamond className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Line Marker */}
          <button
            draggable={true}
            onDragStart={(e) => handleDragStart(e, { tool: 'add_line' })}
            onClick={() => {
              soundEffects.playClick();
              onSelectTool('add_line');
            }}
            title="Boundary Line"
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
              activeTool === 'add_line'
                ? 'bg-[#c4ced4] text-black ring-2 ring-white scale-105'
                : 'text-slate-300 hover:bg-[#262626]'
            }`}
          >
            <Minus className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      </div>
    </aside>
  );
};
