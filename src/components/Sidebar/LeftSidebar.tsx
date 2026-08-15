import React from 'react';
import type { Keyframe, Piece, DrawingElement } from '../../types/play';
import {
  ArrowRight,
  Copy,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  Trash,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { CourtThumbnail } from '../Court/CourtThumbnail';

interface LeftSidebarProps {
  keyframes: Keyframe[];
  activeFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddNextFrame: () => void;
  onCloneFrame: (index: number) => void;
  onAddEmptyFrame: () => void;
  onResetFrame?: () => void;
  onDeleteFrame: (index: number) => void;
  currentPieces: Piece[];
  currentDrawings: DrawingElement[];
  onDeletePiece: (id: string) => void;
  onDeleteDrawing: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  keyframes,
  activeFrameIndex,
  onSelectFrame,
  onAddNextFrame,
  onCloneFrame,
  onAddEmptyFrame,
  onResetFrame,
  onDeleteFrame,
  currentPieces,
  currentDrawings,
  onDeletePiece,
  onDeleteDrawing,
}) => {
  const [activeTab, setActiveTab] = React.useState<'phases' | 'objects'>('phases');

  return (
    <aside className="w-48 sm:w-56 bg-[#0a0a0a] border-r border-[#262626] flex flex-col h-full z-30 select-none text-white">
      {/* 1. TOP TABS: Phases / Objects */}
      <div className="flex items-center border-b border-[#262626] p-2 gap-1 bg-[#121212]">
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('phases');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'phases'
              ? 'bg-[#262626] text-white border border-[#404040] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phases</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('objects');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'objects'
              ? 'bg-[#262626] text-white border border-[#404040] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Objects</span>
        </button>
      </div>

      {/* 2. TAB CONTENT: PHASES */}
      {activeTab === 'phases' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          {/* Phase Header Info */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
              PHASE {activeFrameIndex + 1}/{keyframes.length}
            </span>
          </div>

          {/* Quick Actions Bar: Next, Clone, Empty, Reset */}
          <div className="grid grid-cols-4 gap-1 bg-[#141414] p-1.5 rounded-xl border border-[#262626]">
            <button
              onClick={() => {
                soundEffects.playClick();
                onAddNextFrame();
              }}
              title="Next Phase (connect positions)"
              className="flex flex-col items-center justify-center py-1.5 rounded-lg hover:bg-[#262626] text-slate-300 hover:text-white transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#c4ced4]" />
              <span className="text-[9px] font-bold mt-0.5">Next</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onCloneFrame(activeFrameIndex);
              }}
              title="Clone Current Phase"
              className="flex flex-col items-center justify-center py-1.5 rounded-lg hover:bg-[#262626] text-slate-300 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[#c4ced4]" />
              <span className="text-[9px] font-bold mt-0.5">Clone</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onAddEmptyFrame();
              }}
              title="Empty Phase"
              className="flex flex-col items-center justify-center py-1.5 rounded-lg hover:bg-[#262626] text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#c4ced4]" />
              <span className="text-[9px] font-bold mt-0.5">Empty</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                if (onResetFrame) onResetFrame();
              }}
              title="Reset Current Phase"
              className="flex flex-col items-center justify-center py-1.5 rounded-lg hover:bg-[#262626] text-slate-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[9px] font-bold mt-0.5">Reset</span>
            </button>
          </div>

          {/* Phase Thumbnails Vertical List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
            {keyframes.map((frame, index) => {
              const isActive = activeFrameIndex === index;
              return (
                <div
                  key={frame.id}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectFrame(index);
                  }}
                  className={`group relative rounded-2xl cursor-pointer border-2 p-2 flex flex-col gap-1.5 transition-all duration-200 bg-[#141414] ${
                    isActive
                      ? 'border-[#c4ced4] ring-2 ring-white/20 shadow-lg'
                      : 'border-[#262626] hover:border-[#404040] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {/* Phase Label & Delete */}
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      Phase {index + 1}
                    </span>
                    {keyframes.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          soundEffects.playClick();
                          onDeleteFrame(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Delete Phase"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Visual Full Court Thumbnail Preview */}
                  <CourtThumbnail
                    pieces={frame.pieces}
                    ball={frame.ball}
                    drawings={frame.drawings}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: OBJECTS */}
      {activeTab === 'objects' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
            Court Items ({currentPieces.length + currentDrawings.length})
          </span>

          <div className="flex flex-col gap-1.5">
            {/* Players list */}
            {currentPieces.map(piece => (
              <div
                key={piece.id}
                className="flex items-center justify-between bg-[#141414] p-2 rounded-xl border border-[#262626] text-xs text-slate-300 hover:border-[#404040]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      piece.style === 'defense-x'
                        ? 'text-white font-extrabold'
                        : piece.style === 'circle-number'
                        ? 'bg-white text-black'
                        : 'text-white'
                    }`}
                  >
                    {piece.label}
                  </div>
                  <span className="font-semibold">{piece.role || piece.label}</span>
                </div>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onDeletePiece(piece.id);
                  }}
                  className="text-slate-600 hover:text-red-400 p-1"
                >
                  <Trash className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Drawings list */}
            {currentDrawings.map((drawing, i) => (
              <div
                key={drawing.id}
                className="flex items-center justify-between bg-[#141414] p-2 rounded-xl border border-[#262626] text-xs text-slate-300 hover:border-[#404040]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: drawing.color || '#ffffff' }} />
                  <span className="font-semibold capitalize">{drawing.type} Line #{i + 1}</span>
                </div>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onDeleteDrawing(drawing.id);
                  }}
                  className="text-slate-600 hover:text-red-400 p-1"
                >
                  <Trash className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
