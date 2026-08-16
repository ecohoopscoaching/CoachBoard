import React from 'react';
import type { Play, Piece, BallState } from '../../types/play';
import {
  ArrowLeft,
  Play as PlayIcon,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Tag,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CourtThumbnail } from '../Court/CourtThumbnail';
import { soundEffects } from '../../services/soundEffects';
import { interpolateKeyframePieces, interpolateKeyframeBall } from '../../utils/animation';

interface PlayCardDetailViewProps {
  play: Play;
  onBack: () => void;
  onLoadPlay: (play: Play) => void;
  onDeletePlay?: (id: string) => void;
  onExportPlay?: (play: Play) => void;
  isSavedPlay?: boolean;
}

export const PlayCardDetailView: React.FC<PlayCardDetailViewProps> = ({
  play,
  onBack,
  onLoadPlay,
  onDeletePlay,
  onExportPlay,
  isSavedPlay = true,
}) => {
  const [selectedPhaseIndex, setSelectedPhaseIndex] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [animProgress, setAnimProgress] = React.useState<number>(0);

  const keyframes = play.keyframes || [];
  const currentKeyframe = keyframes[selectedPhaseIndex] || keyframes[0] || {
    pieces: [],
    ball: null,
    drawings: [],
  };

  // Live animation playback loop inside the preview
  React.useEffect(() => {
    if (!isPlaying || keyframes.length <= 1) {
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;
    const totalDuration = keyframes.reduce((sum, kf) => sum + (kf.duration || 1.5), 0) * 1000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      setAnimProgress(progress);

      // Determine active keyframe segment
      let accumulatedTime = 0;
      let targetPhase = 0;
      for (let i = 0; i < keyframes.length; i++) {
        const frameTime = (keyframes[i].duration || 1.5) * 1000;
        if (elapsed >= accumulatedTime && elapsed <= accumulatedTime + frameTime) {
          targetPhase = i;
          break;
        }
        accumulatedTime += frameTime;
      }
      setSelectedPhaseIndex(targetPhase);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setAnimProgress(0);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, keyframes]);

  // Compute interpolated pieces and ball when animation is playing
  const getAnimatedState = (): { pieces: Piece[]; ball: BallState | null } => {
    if (!isPlaying || keyframes.length <= 1) {
      return {
        pieces: currentKeyframe.pieces || [],
        ball: currentKeyframe.ball || null,
      };
    }

    const totalKeyframes = keyframes.length;
    const segmentSize = 1 / (totalKeyframes - 1);
    const segmentIndex = Math.min(
      Math.floor(animProgress / segmentSize),
      totalKeyframes - 2
    );
    const segmentProgress = Math.max(
      0,
      Math.min(1, (animProgress - segmentIndex * segmentSize) / segmentSize)
    );

    const fromFrame = keyframes[segmentIndex];
    const toFrame = keyframes[segmentIndex + 1];

    if (!fromFrame || !toFrame) {
      return { pieces: currentKeyframe.pieces || [], ball: currentKeyframe.ball || null };
    }

    const interpPieces = interpolateKeyframePieces(fromFrame, toFrame, segmentProgress);
    const interpBall = interpolateKeyframeBall(fromFrame, toFrame, segmentProgress, interpPieces);

    return { pieces: interpPieces, ball: interpBall };
  };

  const animatedState = getAnimatedState();

  const handleTogglePlay = () => {
    soundEffects.playClick();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleResetPreview = () => {
    soundEffects.playClick();
    setIsPlaying(false);
    setAnimProgress(0);
    setSelectedPhaseIndex(0);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#0a0a0c] text-zinc-100 overflow-y-auto select-none animate-fade-in">
      {/* 1. TOP NAV BAR */}
      <div className="sticky top-0 z-30 p-3.5 sm:p-4 bg-[#0c0d10]/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-black transition-all group shrink-0 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Playbook</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
            {play.category} • {play.courtType} court
          </span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DESKTOP SPLIT LAYOUT / RESPONSIVE STACK */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* ================= LEFT COLUMN: PLAY DETAILS & STRATEGY (7 cols on lg) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-black uppercase tracking-wider text-[#c4ced4]">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tactical Concept</span>
              </span>
              <span className="text-xs text-zinc-500 font-bold">
                {keyframes.length} {keyframes.length === 1 ? 'Phase' : 'Phases'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              {play.title}
            </h1>

            {play.description ? (
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                {play.description}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 italic bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                No description provided for this play.
              </p>
            )}
          </div>

          {/* Coaching Execution Points */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Key Coaching Points & Execution Keys</span>
              </h3>
            </div>

            {play.coachingPoints && play.coachingPoints.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {play.coachingPoints.map((pt, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 leading-snug"
                  >
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-zinc-700">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                No specific coaching points recorded for this play.
              </div>
            )}
          </div>

          {/* Keyframe Timeline Breakdown */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c4ced4]" />
              <span>Phases & Action Sequence ({keyframes.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {keyframes.map((kf, idx) => {
                const isSelected = selectedPhaseIndex === idx;
                const cutsCount = (kf.drawings || []).filter(d => d.type === 'cut').length;
                const passesCount = (kf.drawings || []).filter(d => d.type === 'pass').length;
                const screensCount = (kf.drawings || []).filter(d => d.type === 'screen').length;
                const dribblesCount = (kf.drawings || []).filter(d => d.type === 'dribble').length;

                return (
                  <button
                    key={kf.id || idx}
                    onClick={() => {
                      soundEffects.playClick();
                      setIsPlaying(false);
                      setSelectedPhaseIndex(idx);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'bg-zinc-200 text-zinc-950 border-white font-black shadow-md ring-1 ring-zinc-300'
                        : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">
                        Phase {idx + 1}: {kf.title || `Movement ${idx + 1}`}
                      </span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-zinc-800' : 'text-zinc-500'}`}>
                        {kf.duration || 1.5}s
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] opacity-80 mt-1">
                      {cutsCount > 0 && <span>{cutsCount} cut{cutsCount > 1 ? 's' : ''}</span>}
                      {passesCount > 0 && <span>{passesCount} pass{passesCount > 1 ? 'es' : ''}</span>}
                      {screensCount > 0 && <span>{screensCount} screen{screensCount > 1 ? 's' : ''}</span>}
                      {dribblesCount > 0 && <span>{dribblesCount} dribble</span>}
                      {cutsCount === 0 && passesCount === 0 && screensCount === 0 && dribblesCount === 0 && (
                        <span>Initial positioning</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {play.tags && play.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {play.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-300 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800"
                >
                  <Tag className="w-3 h-3 text-zinc-500" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-zinc-800/80">
            {/* Load Diagram Button */}
            <button
              onClick={() => {
                soundEffects.playWhistle();
                onLoadPlay(play);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm shadow-xl border border-white transition-all transform active:scale-95 group"
            >
              <PlayIcon className="w-4 h-4 fill-current text-zinc-950 group-hover:scale-110 transition-transform" />
              <span>Load Diagram to Board</span>
            </button>

            {/* Export JSON Button */}
            {onExportPlay && (
              <button
                onClick={() => onExportPlay(play)}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all shadow-sm"
                title="Download Play JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Delete Play Button */}
            {isSavedPlay && onDeletePlay && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onDeletePlay(play.id);
                  onBack();
                }}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 hover:border-red-500/60 text-zinc-500 hover:text-red-400 font-bold text-xs transition-all shadow-sm"
                title="Delete Play from Playbook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE COURT PREVIEW (5 cols on lg) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="sticky top-20 flex flex-col gap-3 bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                  Live Court Diagram Preview
                </span>
              </div>
              <span className="text-[11px] font-black text-zinc-400">
                Phase {selectedPhaseIndex + 1} of {keyframes.length}
              </span>
            </div>

            {/* Interactive Court Thumbnail with Full Tactical Lines & Pieces */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/80 bg-black">
              <CourtThumbnail
                pieces={animatedState.pieces}
                ball={animatedState.ball}
                drawings={isPlaying ? [] : currentKeyframe.drawings}
                courtType={play.courtType}
                className="w-full shadow-inner"
              />
            </div>

            {/* Phase Selector Pills on Preview */}
            {keyframes.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 overflow-x-auto">
                {keyframes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEffects.playClick();
                      setIsPlaying(false);
                      setSelectedPhaseIndex(idx);
                    }}
                    className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-black transition-all text-center ${
                      selectedPhaseIndex === idx && !isPlaying
                        ? 'bg-zinc-200 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Phase {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Preview Animation Controls */}
            {keyframes.length > 1 && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                    isPlaying
                      ? 'bg-zinc-800 text-white border border-zinc-600'
                      : 'bg-zinc-100 hover:bg-white text-zinc-950 border border-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-3.5 h-3.5 fill-current" />
                      <span>Play Animation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetPreview}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Reset Preview"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Load Prompt on Preview */}
            <button
              onClick={() => {
                soundEffects.playWhistle();
                onLoadPlay(play);
              }}
              className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors border border-zinc-700/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c4ced4]" />
              <span>Edit Play on Full Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};