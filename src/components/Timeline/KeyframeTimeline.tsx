import React from 'react';
import type { Keyframe } from '../../types/play';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Gauge,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface KeyframeTimelineProps {
  keyframes: Keyframe[];
  activeFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  playbackProgress: number;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
}

export const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
  keyframes,
  activeFrameIndex,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  isPlaying,
  onTogglePlay,
  onResetPlayback,
  playbackProgress,
  playbackSpeed,
  onChangeSpeed,
  isLooping,
  onToggleLoop,
}) => {
  return (
    <div className="w-full bg-black/95 backdrop-blur-md border-t border-sky-950/60 p-3 sm:p-4 text-white flex flex-col gap-3 shadow-2xl">
      {/* 1. TOP PLAYBACK CONTROLS & TIMELINE SCRUBBER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-sky-950">
        {/* Play / Pause & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              onResetPlayback();
            }}
            title="Reset to Frame 1"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={() => {
              if (!isPlaying) soundEffects.playWhistle();
              else soundEffects.playClick();
              onTogglePlay();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm shadow-lg transition-all transform active:scale-95 ${
              isPlaying
                ? 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/20'
                : 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-sky-400/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Animation</span>
              </>
            )}
          </button>

          <button
            disabled={activeFrameIndex <= 0}
            onClick={() => onSelectFrame(activeFrameIndex - 1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
            title="Previous Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-sky-300 px-1">
            Frame {activeFrameIndex + 1} of {keyframes.length}
          </span>

          <button
            disabled={activeFrameIndex >= keyframes.length - 1}
            onClick={() => onSelectFrame(activeFrameIndex + 1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
            title="Next Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Playback Scrubber Bar */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 px-2">
          <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-sky-950">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 to-white transition-all duration-75 rounded-full"
              style={{ width: `${playbackProgress * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-sky-300 w-12 text-right font-black">
            {Math.round(playbackProgress * 100)}%
          </span>
        </div>

        {/* Speed & Loop toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleLoop();
            }}
            title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isLooping
                ? 'bg-sky-500/20 border border-sky-400 text-sky-300'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Loop</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626]">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  soundEffects.playClick();
                  onChangeSpeed(speed);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  playbackSpeed === speed
                    ? 'bg-white text-black font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM KEYFRAME CARDS LIST */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        {keyframes.map((frame, index) => {
          const isActive = activeFrameIndex === index;
          return (
            <div
              key={frame.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectFrame(index);
              }}
              className={`flex-none group relative w-36 sm:w-44 p-2.5 rounded-xl cursor-pointer border transition-all duration-200 ${
                isActive
                  ? 'bg-slate-950 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-400/20'
                  : 'bg-black/60 border-slate-900 hover:bg-slate-950 hover:border-sky-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isActive ? 'text-sky-300' : 'text-slate-500'
                  }`}
                >
                  Step {index + 1}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      soundEffects.playClick();
                      onDuplicateFrame(index);
                    }}
                    title="Duplicate Frame"
                    className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {keyframes.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        onDeleteFrame(index);
                      }}
                      title="Delete Frame"
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-200 truncate">
                {frame.title || `Frame ${index + 1}`}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                <span>{frame.pieces.length} Pieces</span>
                <span>•</span>
                <span>{frame.drawings.length} Paths</span>
              </div>
            </div>
          );
        })}

        {/* Add Frame Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onAddFrame();
          }}
          className="flex-none flex flex-col items-center justify-center gap-1 w-24 sm:w-28 h-[74px] rounded-xl border-2 border-dashed border-sky-950 hover:border-sky-400 bg-slate-950/40 hover:bg-sky-500/10 text-slate-400 hover:text-sky-300 transition-all group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          <span className="text-[11px] font-extrabold uppercase tracking-wide">Add Step</span>
        </button>
      </div>
    </div>
  );
};
