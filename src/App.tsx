import React from 'react';
import confetti from 'canvas-confetti';
import type { Play, ActiveTool, Point, Piece, Keyframe, AppMode, CourtType, BallState } from './types/play';
import { PRESET_PLAYS, DEFAULT_INITIAL_PLAY } from './data/presetPlays';
import type { TemplateDefinition } from './data/presetPlays';
import { BasketballCourt } from './components/Court/BasketballCourt';
import { PieceLayer } from './components/Court/PieceLayer';
import { DrawingLayer } from './components/Court/DrawingLayer';
import { PlayCreatorHeader } from './components/Header/PlayCreatorHeader';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { ActionToolbox } from './components/Sidebar/ActionToolbox';
import { CourtTemplateModal } from './components/Modal/CourtTemplateModal';
import { PlayDetailsModal } from './components/Modal/PlayDetailsModal';
import { OutputExportModal } from './components/Modal/OutputExportModal';
import { PlaybookSidebar } from './components/Playbook/PlaybookSidebar';
import { soundEffects } from './services/soundEffects';
import {
  interpolateKeyframePieces,
  interpolateKeyframeBall,
  applyDrawingsToNextFrame,
} from './utils/animation';
import {
  Play as PlayIcon,
  Pause,
  RotateCcw,
  Repeat,
  Wrench,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';

const STORAGE_KEY = 'coachboard_saved_plays_v2';

export function App() {
  const [savedPlays, setSavedPlays] = React.useState<Play[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [currentPlay, setCurrentPlay] = React.useState<Play>(() => {
    // Check URL hash for shared play state
    try {
      if (window.location.hash.startsWith('#play=')) {
        const raw = window.location.hash.replace('#play=', '');
        const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (decoded && decoded.keyframes) {
          return decoded;
        }
      }
    } catch {
      // fallback to initial default
    }
    return PRESET_PLAYS[0] || DEFAULT_INITIAL_PLAY;
  });

  const [activeFrameIndex, setActiveFrameIndex] = React.useState<number>(0);
  const [currentMode, setCurrentMode] = React.useState<AppMode>('draw');
  const [activeTool, setActiveTool] = React.useState<ActiveTool>('select');
  const [selectedPlayerLabel, setSelectedPlayerLabel] = React.useState<string | null>(null);
  const [selectedPieceId, setSelectedPieceId] = React.useState<string | null>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = React.useState<Play[]>([PRESET_PLAYS[0] || DEFAULT_INITIAL_PLAY]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(0);

  // Animation Playback Engine States
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0);
  const [isLooping, setIsLooping] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);

  // Modals (Landing page opens template modal by default)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState<boolean>(() => {
    return typeof window !== 'undefined' && !window.location.hash.startsWith('#play=');
  });
  const [isPlaybookOpen, setIsPlaybookOpen] = React.useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = React.useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = React.useState(false);
  const [isMobilePhasesOpen, setIsMobilePhasesOpen] = React.useState(false);
  const [isMobileToolboxOpen, setIsMobileToolboxOpen] = React.useState(false);

  // Interpolated animation piece positions
  const [animatedPieces, setAnimatedPieces] = React.useState<Piece[]>([]);
  const [animatedBall, setAnimatedBall] = React.useState<BallState | null | undefined>(currentPlay.keyframes[0]?.ball);

  const courtContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlays));
    } catch {
      // LocalStorage fallback
    }
  }, [savedPlays]);

  const currentFrame: Keyframe =
    (currentPlay?.keyframes && currentPlay.keyframes[activeFrameIndex]) ||
    (currentPlay?.keyframes && currentPlay.keyframes[0]) ||
    DEFAULT_INITIAL_PLAY.keyframes[0];

  React.useEffect(() => {
    if (!isPlaying && currentFrame) {
      setAnimatedPieces(currentFrame.pieces || []);
      setAnimatedBall(currentFrame.ball || null);
    }
  }, [activeFrameIndex, currentFrame, isPlaying]);

  // Mode Change Handler
  const handleChangeMode = (mode: AppMode) => {
    setCurrentMode(mode);
    if (mode === 'notes') {
      setIsNotesModalOpen(true);
    } else if (mode === 'output') {
      setIsOutputModalOpen(true);
    } else if (mode === 'animate') {
      setIsPlaying(true);
    } else if (mode === 'draw') {
      setIsPlaying(false);
    }
  };

  // Push new state to undo/redo history
  const pushState = (newPlay: Play) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newPlay);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setCurrentPlay(newPlay);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCurrentPlay(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentPlay(history[nextIndex]);
    }
  };

  // ================= ANIMATION TICK LOOP ENGINE =================
  React.useEffect(() => {
    if (!isPlaying) return;

    let animFrameId: number;
    let startTime: number | null = null;
    const totalKeyframes = currentPlay.keyframes.length;

    if (totalKeyframes < 2) {
      setIsPlaying(false);
      return;
    }

    const stepDuration = 3.2 / playbackSpeed;
    const totalDurationSeconds = stepDuration * (totalKeyframes - 1);

    const stepTick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedSeconds = (timestamp - startTime) / 1000;
      const rawProgress = elapsedSeconds / totalDurationSeconds;

      if (rawProgress >= 1.0) {
        setPlaybackProgress(1.0);

        const finalFrame = currentPlay.keyframes[totalKeyframes - 1];
        if (finalFrame.drawings.some(d => d.type === 'shot')) {
          soundEffects.playSwish();
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.4 }, colors: ['#38bdf8', '#ffffff', '#7dd3fc'] });
        }

        if (isLooping) {
          startTime = timestamp;
          requestAnimationFrame(stepTick);
        } else {
          setIsPlaying(false);
          setAnimatedPieces(currentFrame.pieces);
          setAnimatedBall(currentFrame.ball);
        }
        return;
      }

      setPlaybackProgress(rawProgress);

      const currentSegmentFloat = rawProgress * (totalKeyframes - 1);
      const fromIdx = Math.floor(currentSegmentFloat);
      const toIdx = Math.min(totalKeyframes - 1, fromIdx + 1);
      const segmentProgress = currentSegmentFloat - fromIdx;

      const fromFrame = currentPlay.keyframes[fromIdx];
      const toFrame = currentPlay.keyframes[toIdx];

      if (fromFrame && toFrame) {
        const interpPieces = interpolateKeyframePieces(fromFrame, toFrame, segmentProgress);
        const interpBall = interpolateKeyframeBall(fromFrame, toFrame, segmentProgress, interpPieces);

        setAnimatedPieces(interpPieces);
        setAnimatedBall(interpBall);

        if (toFrame.drawings.some(d => d.type === 'dribble') && Math.random() < 0.05) {
          soundEffects.playBounce();
        }
      }

      animFrameId = requestAnimationFrame(stepTick);
    };

    animFrameId = requestAnimationFrame(stepTick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isPlaying, currentPlay, playbackSpeed, isLooping, currentFrame]);

  // ================= COURT INTERACTION & PIECE ADDITION =================
  const handleCourtDrop = (payload: any, point: Point) => {
    if (isPlaying) return;
    const newPieces = [...currentFrame.pieces];

    if (payload.type === 'offense' || payload.tool === 'add_offense_circled' || payload.tool === 'add_offense_plain') {
      const label = payload.label || `${newPieces.filter(p => p.team === 'offense').length + 1}`;
      const existingIdx = newPieces.findIndex(p => p.team === 'offense' && p.label === label);

      if (existingIdx >= 0) {
        newPieces[existingIdx] = {
          ...newPieces[existingIdx],
          x: point.x,
          y: point.y,
          style: 'circle-number',
        };
        setSelectedPieceId(newPieces[existingIdx].id);
      } else {
        const newId = `off-${label}-${Date.now()}`;
        newPieces.push({
          id: newId,
          label,
          role: 'PG',
          team: 'offense',
          style: 'circle-number',
          x: point.x,
          y: point.y,
        });
        setSelectedPieceId(newId);
      }
      soundEffects.playClick();
    } else if (payload.type === 'defense' || payload.tool === 'add_defense_x') {
      const rawLabel = payload.label || `${newPieces.filter(p => p.team === 'defense').length + 1}`;
      const label = rawLabel.startsWith('X') ? rawLabel : `X${rawLabel}`;
      const existingIdx = newPieces.findIndex(p => p.team === 'defense' && p.label === label);

      if (existingIdx >= 0) {
        newPieces[existingIdx] = {
          ...newPieces[existingIdx],
          x: point.x,
          y: point.y,
          style: 'defense-x',
        };
        setSelectedPieceId(newPieces[existingIdx].id);
      } else {
        const newId = `def-${label}-${Date.now()}`;
        newPieces.push({
          id: newId,
          label,
          role: 'D1',
          team: 'defense',
          style: 'defense-x',
          x: point.x,
          y: point.y,
        });
        setSelectedPieceId(newId);
      }
      soundEffects.playClick();
    } else if (payload.tool === 'add_ball') {
      const nearbyPlayer = newPieces.find(p => Math.hypot(p.x - point.x, p.y - point.y) < 6);
      updateCurrentFrame({
        ball: {
          x: point.x,
          y: point.y,
          heldByPlayerId: nearbyPlayer ? nearbyPlayer.id : null,
          height: 0,
        },
      });
      soundEffects.playClick();
      return;
    } else if (payload.tool === 'add_cone') {
      const newId = `cone-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: 'C',
        role: 'CONE',
        team: 'equipment',
        style: 'equipment',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_chair') {
      const newId = `chair-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: 'CH',
        role: 'CHAIR',
        team: 'equipment',
        style: 'equipment',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_text') {
      const text = prompt('Enter tactical note label:') || 'Note';
      const newId = `text-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: text,
        role: 'TEXT',
        team: 'annotation',
        style: 'text',
        customText: text,
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_rect') {
      const newId = `rect-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '▢',
        role: 'SHAPE_RECT',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_circle') {
      const newId = `cir-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '◯',
        role: 'SHAPE_CIRCLE',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_triangle') {
      const newId = `tri-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '△',
        role: 'SHAPE_TRIANGLE',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_diamond') {
      const newId = `dia-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '◇',
        role: 'SHAPE_DIAMOND',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    } else if (payload.tool === 'add_line') {
      const newId = `line-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '—',
        role: 'SHAPE_RECT',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      soundEffects.playClick();
    }

    updateCurrentFrame({ pieces: newPieces });
  };

  const handleCourtClick = (point: Point) => {
    if (activeTool === 'select' || isPlaying) return;

    const newPieces = [...currentFrame.pieces];

    if (activeTool === 'add_offense_circled' || activeTool === 'add_offense_plain') {
      const label = selectedPlayerLabel || `${newPieces.filter(p => p.team === 'offense').length + 1}`;
      const existingIdx = newPieces.findIndex(p => p.team === 'offense' && p.label === label);

      if (existingIdx >= 0) {
        // Reposition existing player
        newPieces[existingIdx] = {
          ...newPieces[existingIdx],
          x: point.x,
          y: point.y,
          style: 'circle-number',
        };
        setSelectedPieceId(newPieces[existingIdx].id);
      } else {
        // Add new player with circular badge
        const newId = `off-${label}-${Date.now()}`;
        newPieces.push({
          id: newId,
          label,
          role: 'PG',
          team: 'offense',
          style: 'circle-number',
          x: point.x,
          y: point.y,
        });
        setSelectedPieceId(newId);
      }

      // Single placement: immediately switch back to Select/Move mode and clear selection
      setActiveTool('select');
      setSelectedPlayerLabel(null);
      soundEffects.playClick();
    } else if (activeTool === 'add_defense_x') {
      const rawLabel = selectedPlayerLabel || `${newPieces.filter(p => p.team === 'defense').length + 1}`;
      const label = rawLabel.startsWith('X') ? rawLabel : `X${rawLabel}`;
      const existingIdx = newPieces.findIndex(p => p.team === 'defense' && p.label === label);

      if (existingIdx >= 0) {
        // Reposition existing defender
        newPieces[existingIdx] = {
          ...newPieces[existingIdx],
          x: point.x,
          y: point.y,
          style: 'defense-x',
        };
        setSelectedPieceId(newPieces[existingIdx].id);
      } else {
        // Add new defender
        const newId = `def-${label}-${Date.now()}`;
        newPieces.push({
          id: newId,
          label,
          role: 'D1',
          team: 'defense',
          style: 'defense-x',
          x: point.x,
          y: point.y,
        });
        setSelectedPieceId(newId);
      }

      // Single placement: immediately switch back to Select/Move mode and clear selection
      setActiveTool('select');
      setSelectedPlayerLabel(null);
      soundEffects.playClick();
    } else if (activeTool === 'add_cone') {
      const newId = `cone-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: 'C',
        role: 'CONE',
        team: 'equipment',
        style: 'equipment',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_chair') {
      const newId = `chair-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: 'CH',
        role: 'CHAIR',
        team: 'equipment',
        style: 'equipment',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_ball') {
      const nearbyPlayer = newPieces.find(p => Math.hypot(p.x - point.x, p.y - point.y) < 6);
      updateCurrentFrame({
        ball: {
          x: point.x,
          y: point.y,
          heldByPlayerId: nearbyPlayer ? nearbyPlayer.id : null,
          height: 0,
        },
      });
      setActiveTool('select');
      soundEffects.playClick();
      return;
    } else if (activeTool === 'add_text') {
      const text = prompt('Enter tactical note label:') || 'Note';
      const newId = `text-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: text,
        role: 'TEXT',
        team: 'annotation',
        style: 'text',
        customText: text,
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_rect') {
      const newId = `rect-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '▢',
        role: 'SHAPE_RECT',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_circle') {
      const newId = `cir-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '◯',
        role: 'SHAPE_CIRCLE',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_triangle') {
      const newId = `tri-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '△',
        role: 'SHAPE_TRIANGLE',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_diamond') {
      const newId = `dia-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '◇',
        role: 'SHAPE_DIAMOND',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    } else if (activeTool === 'add_line') {
      const newId = `line-${Date.now()}`;
      newPieces.push({
        id: newId,
        label: '—',
        role: 'SHAPE_RECT',
        team: 'annotation',
        style: 'shape',
        x: point.x,
        y: point.y,
      });
      setSelectedPieceId(newId);
      setActiveTool('select');
      soundEffects.playClick();
    }

    updateCurrentFrame({ pieces: newPieces });
  };

  const handleMovePiece = (id: string, point: Point) => {
    if (isPlaying) return;
    const updatedPieces = currentFrame.pieces.map(p =>
      p.id === id ? { ...p, x: point.x, y: point.y } : p
    );

    // If this piece is holding the basketball, move the ball with the player!
    let updatedBall = currentFrame.ball;
    if (currentFrame.ball && currentFrame.ball.heldByPlayerId === id) {
      updatedBall = {
        ...currentFrame.ball,
        x: point.x,
        y: point.y,
      };
    }

    updateCurrentFrame({ pieces: updatedPieces, ball: updatedBall });
  };

  const handleMoveBall = (point: Point) => {
    if (isPlaying) return;
    const nearbyPlayer = currentFrame.pieces.find(
      p => Math.hypot(p.x - point.x, p.y - point.y) < 5
    );
    updateCurrentFrame({
      ball: {
        x: point.x,
        y: point.y,
        heldByPlayerId: nearbyPlayer ? nearbyPlayer.id : null,
      },
    });
  };

  const handleDeletePiece = (id: string) => {
    const updatedPieces = currentFrame.pieces.filter(p => p.id !== id);
    updateCurrentFrame({ pieces: updatedPieces });
  };

  const handleAddDrawing = (drawing: any) => {
    const currentDrawings = [...currentFrame.drawings, drawing];
    const updatedKeyframes = [...currentPlay.keyframes];

    // 1. Update current frame drawings
    updatedKeyframes[activeFrameIndex] = {
      ...updatedKeyframes[activeFrameIndex],
      drawings: currentDrawings,
    };

    // 2. Automatically advance players and the ball in the next frame if it exists!
    if (activeFrameIndex < updatedKeyframes.length - 1) {
      const nextFrameIdx = activeFrameIndex + 1;
      const nextState = applyDrawingsToNextFrame(
        updatedKeyframes[activeFrameIndex],
        updatedKeyframes[nextFrameIdx]
      );

      updatedKeyframes[nextFrameIdx] = {
        ...updatedKeyframes[nextFrameIdx],
        pieces: nextState.pieces,
        ball: nextState.ball !== null ? nextState.ball : updatedKeyframes[nextFrameIdx].ball,
      };
    }

    const newPlay = { ...currentPlay, keyframes: updatedKeyframes };
    pushState(newPlay);
  };

  const handleDeleteDrawing = (id: string) => {
    updateCurrentFrame({
      drawings: currentFrame.drawings.filter(d => d.id !== id),
    });
  };

  const updateCurrentFrame = (partialFrame: Partial<Keyframe>) => {
    const updatedKeyframes = [...currentPlay.keyframes];
    updatedKeyframes[activeFrameIndex] = {
      ...updatedKeyframes[activeFrameIndex],
      ...partialFrame,
    };
    const newPlay = { ...currentPlay, keyframes: updatedKeyframes };
    pushState(newPlay);
  };

  // ================= PHASE TIMELINE MANAGEMENT =================
  const handleAddNextFrame = () => {
    const lastFrame = currentPlay.keyframes[currentPlay.keyframes.length - 1];
    // Automatically advance players to the exact end positions of all cuts, dribbles, screens, passes, and handoffs
    const nextFrameState = applyDrawingsToNextFrame(lastFrame);

    const newFrame: Keyframe = {
      id: `kf-${Date.now()}`,
      title: `Phase ${currentPlay.keyframes.length + 1}`,
      duration: 1.5,
      pieces: nextFrameState.pieces,
      ball: nextFrameState.ball,
      drawings: [],
    };

    const newPlay = {
      ...currentPlay,
      keyframes: [...currentPlay.keyframes, newFrame],
    };
    pushState(newPlay);
    setActiveFrameIndex(currentPlay.keyframes.length);
    soundEffects.playClick();
  };

  const handleCloneFrame = (index: number) => {
    const targetFrame = currentPlay.keyframes[index];
    const nextFrameState = applyDrawingsToNextFrame(targetFrame);

    const dupFrame: Keyframe = {
      ...JSON.parse(JSON.stringify(targetFrame)),
      id: `kf-${Date.now()}`,
      title: `Phase ${index + 2}`,
      pieces: nextFrameState.pieces,
      ball: nextFrameState.ball,
      drawings: [],
    };

    const updatedKeyframes = [...currentPlay.keyframes];
    updatedKeyframes.splice(index + 1, 0, dupFrame);

    const newPlay = { ...currentPlay, keyframes: updatedKeyframes };
    pushState(newPlay);
    setActiveFrameIndex(index + 1);
    soundEffects.playClick();
  };

  const handleAddEmptyFrame = () => {
    const newFrame: Keyframe = {
      id: `kf-${Date.now()}`,
      title: `Phase ${currentPlay.keyframes.length + 1}`,
      duration: 1.5,
      pieces: [],
      ball: null,
      drawings: [],
    };

    const newPlay = {
      ...currentPlay,
      keyframes: [...currentPlay.keyframes, newFrame],
    };
    pushState(newPlay);
    setActiveFrameIndex(currentPlay.keyframes.length);
  };

  const handleDeleteFrame = (index: number) => {
    if (currentPlay.keyframes.length <= 1) return;
    const updatedKeyframes = currentPlay.keyframes.filter((_, i) => i !== index);
    const newPlay = { ...currentPlay, keyframes: updatedKeyframes };
    pushState(newPlay);
    setActiveFrameIndex(Math.max(0, index - 1));
  };

  const handleClearFrame = () => {
    // Clear drawings on current frame
    updateCurrentFrame({ drawings: [] });
    soundEffects.playClick();
  };

  const handleResetPhase = () => {
    // Clear drawings & pieces on current frame
    updateCurrentFrame({ drawings: [], pieces: [] });
    soundEffects.playClick();
  };

  const handleResetBoard = () => {
    // Reset entire play back to a fresh initial phase with no ghost ball
    const freshPlay: Play = {
      ...currentPlay,
      title: 'Untitled',
      keyframes: [
        {
          id: `kf-${Date.now()}`,
          title: 'Phase 1',
          duration: 1.5,
          pieces: [],
          ball: null,
          drawings: [],
        },
      ],
    };
    pushState(freshPlay);
    setActiveFrameIndex(0);
    setIsPlaying(false);
    soundEffects.playWhistle();
  };

  const handleSavePlay = () => {
    const existingIndex = savedPlays.findIndex(p => p.id === currentPlay.id);
    if (existingIndex >= 0) {
      const updated = [...savedPlays];
      updated[existingIndex] = { ...currentPlay, updatedAt: Date.now() };
      setSavedPlays(updated);
    } else {
      setSavedPlays([{ ...currentPlay, updatedAt: Date.now() }, ...savedPlays]);
    }
    soundEffects.playWhistle();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#c4ced4', '#ffffff', '#71717a'],
    });
  };

  const handleSelectPlayerTemplate = (
    type: 'circle-number' | 'plain-number' | 'defense-x',
    label: string
  ) => {
    setSelectedPlayerLabel(label);
    if (type === 'circle-number' || type === 'plain-number') {
      setActiveTool('add_offense_circled');
    } else if (type === 'defense-x') {
      setActiveTool('add_defense_x');
    }
  };

  const handleSelectSetupFromModal = (courtType: CourtType, template: TemplateDefinition) => {
    setIsTemplateModalOpen(false);
    const newPlay: Play = {
      id: `play-${Date.now()}`,
      title: 'Untitled',
      category: template.category === 'defense' ? 'defense' : 'offense',
      courtType,
      courtTheme: currentPlay.courtTheme,
      description: template.description,
      coachingPoints: [],
      tags: [template.name],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      keyframes: [
        {
          id: `kf-${Date.now()}`,
          title: 'Phase 1',
          duration: 1.5,
          pieces: JSON.parse(JSON.stringify(template.pieces)),
          ball: template.ball ? JSON.parse(JSON.stringify(template.ball)) : null,
          drawings: [],
        },
      ],
    };

    pushState(newPlay);
    setActiveFrameIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-screen h-screen bg-[#000000] flex flex-col overflow-hidden font-sans select-none text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <PlayCreatorHeader
        title={currentPlay.title}
        onChangeTitle={title => {
          const updated = { ...currentPlay, title };
          pushState(updated);
        }}
        currentMode={currentMode}
        onChangeMode={handleChangeMode}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSavePlay={handleSavePlay}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenPlaybook={() => setIsPlaybookOpen(true)}
        courtType={currentPlay.courtType}
        onChangeCourtType={type => {
          const updated = { ...currentPlay, courtType: type };
          pushState(updated);
        }}
        courtTheme={currentPlay.courtTheme}
        onChangeCourtTheme={theme => {
          const updated = { ...currentPlay, courtTheme: theme };
          pushState(updated);
        }}
        onClearFrame={handleClearFrame}
        onResetBoard={handleResetBoard}
        isMuted={isMuted}
        onToggleSound={() => setIsMuted(soundEffects.toggleMute())}
      />

      {/* 2. MAIN 3-PANEL BODY: Desktop Sidebars + Center Court Stage + Mobile Drawers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar (Phases & Objects) */}
        <div className="hidden lg:flex w-52 xl:w-56 border-r border-[#262626] h-full flex-col shrink-0 bg-[#0a0a0a]">
          <LeftSidebar
            keyframes={currentPlay.keyframes}
            activeFrameIndex={activeFrameIndex}
            onSelectFrame={idx => {
              setIsPlaying(false);
              setActiveFrameIndex(idx);
            }}
            onAddNextFrame={handleAddNextFrame}
            onCloneFrame={handleCloneFrame}
            onAddEmptyFrame={handleAddEmptyFrame}
            onResetFrame={handleResetPhase}
            onDeleteFrame={handleDeleteFrame}
            currentPieces={currentFrame.pieces}
            currentDrawings={currentFrame.drawings}
            onDeletePiece={handleDeletePiece}
            onDeleteDrawing={handleDeleteDrawing}
          />
        </div>

        {/* Center Court Stage - Takes up 100% available viewport on mobile */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-1 sm:p-2 md:p-3 overflow-hidden bg-[#000000] w-full h-full">
          {/* Mobile Top Floating Quick-Pills */}
          <div className="absolute top-2 left-2 right-2 z-30 lg:hidden flex items-center justify-between pointer-events-none">
            {/* Mobile Phases Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsMobilePhasesOpen(true);
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0d10]/90 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-xs font-black shadow-2xl active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c4ced4]" />
              <span>Phase {activeFrameIndex + 1}/{currentPlay.keyframes.length}</span>
            </button>

            {/* Mobile Tools Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsMobileToolboxOpen(true);
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-black shadow-2xl active:scale-95 transition-all border border-white"
            >
              <Wrench className="w-3.5 h-3.5 fill-current text-zinc-950" />
              <span className="capitalize">{activeTool} {selectedPlayerLabel ? `(#${selectedPlayerLabel})` : ''}</span>
            </button>
          </div>

          {/* Main Court Canvas Container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <BasketballCourt
              courtType={currentPlay.courtType}
              courtTheme={currentPlay.courtTheme}
              onCourtClick={handleCourtClick}
              onCourtDrop={handleCourtDrop}
              innerRef={courtContainerRef}
            >
              {/* Drawing Layer */}
              <DrawingLayer
                drawings={currentFrame.drawings}
                activeTool={activeTool}
                pieces={currentFrame.pieces}
                courtType={currentPlay.courtType}
                onAddDrawing={handleAddDrawing}
                onDeleteDrawing={handleDeleteDrawing}
              />

              {/* Player Pieces Layer */}
              <PieceLayer
                pieces={isPlaying ? animatedPieces : currentFrame.pieces}
                ball={isPlaying ? animatedBall : currentFrame.ball}
                activeTool={activeTool}
                selectedPieceId={selectedPieceId}
                onSelectPiece={setSelectedPieceId}
                onMovePiece={handleMovePiece}
                onMoveBall={handleMoveBall}
                onDeletePiece={handleDeletePiece}
                isAnimating={isPlaying}
              />
            </BasketballCourt>
          </div>

          {/* Floating Bottom Animation Controller (when in Animate mode or Playing) */}
          {(currentMode === 'animate' || isPlaying) && (
            <div className="absolute bottom-2 sm:bottom-4 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border border-[#262626] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 shadow-2xl animate-slide-up max-w-[95vw]">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsPlaying(false);
                  setActiveFrameIndex(0);
                  setPlaybackProgress(0);
                }}
                title="Reset Animation"
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#262626] text-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[#c4ced4]" />
              </button>

              <button
                onClick={() => {
                  if (!isPlaying) soundEffects.playWhistle();
                  else soundEffects.playClick();
                  setIsPlaying(!isPlaying);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs shadow-lg transition-all ${
                  isPlaying
                    ? 'bg-white text-black'
                    : 'bg-[#c4ced4] text-black shadow-md'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <PlayIcon className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Progress bar */}
              <div className="w-20 sm:w-48 h-2 bg-[#141414] rounded-full overflow-hidden border border-[#262626]">
                <div
                  className="h-full bg-gradient-to-r from-[#c4ced4] to-white transition-all duration-75"
                  style={{ width: `${playbackProgress * 100}%` }}
                />
              </div>

              {/* Loop toggle */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsLooping(!isLooping);
                }}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isLooping
                    ? 'bg-white/20 border border-white text-white'
                    : 'bg-[#141414] text-slate-400'
                }`}
                title={isLooping ? 'Looping On' : 'Looping Off'}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              {/* Speed selector */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#141414] p-0.5 sm:p-1 rounded-lg border border-[#262626]">
                {[0.5, 1, 1.5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => {
                      soundEffects.playClick();
                      setPlaybackSpeed(speed);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      playbackSpeed === speed ? 'bg-white text-black font-black' : 'text-slate-400'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Desktop Right Sidebar (Toolbox Panel) */}
        <div className="hidden lg:flex w-60 xl:w-64 border-l border-[#262626] h-full flex-col shrink-0 bg-[#0a0a0a]">
          <ActionToolbox
            activeTool={activeTool}
            onSelectTool={(tool) => {
              setActiveTool(tool);
              if (tool === 'select' || tool === 'eraser') {
                setSelectedPlayerLabel(null);
              }
            }}
            selectedPlayerLabel={selectedPlayerLabel}
            onSelectPlayerTemplate={handleSelectPlayerTemplate}
            onResetFrame={handleClearFrame}
          />
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER: PHASES & OBJECTS */}
      {isMobilePhasesOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-72 max-w-[85vw] bg-[#0c0d10] h-full shadow-2xl flex flex-col animate-slide-right border-r border-zinc-800">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-300" />
                <span>Phases & Setup</span>
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsMobilePhasesOpen(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LeftSidebar
                keyframes={currentPlay.keyframes}
                activeFrameIndex={activeFrameIndex}
                onSelectFrame={idx => {
                  setIsPlaying(false);
                  setActiveFrameIndex(idx);
                  setIsMobilePhasesOpen(false);
                }}
                onAddNextFrame={() => {
                  handleAddNextFrame();
                  setIsMobilePhasesOpen(false);
                }}
                onCloneFrame={idx => {
                  handleCloneFrame(idx);
                  setIsMobilePhasesOpen(false);
                }}
                onAddEmptyFrame={() => {
                  handleAddEmptyFrame();
                  setIsMobilePhasesOpen(false);
                }}
                onResetFrame={handleResetPhase}
                onDeleteFrame={handleDeleteFrame}
                currentPieces={currentFrame.pieces}
                currentDrawings={currentFrame.drawings}
                onDeletePiece={handleDeletePiece}
                onDeleteDrawing={handleDeleteDrawing}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobilePhasesOpen(false)} />
        </div>
      )}

      {/* MOBILE SLIDE-OVER DRAWER: TOOLS & PLAYERS */}
      {isMobileToolboxOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="flex-1" onClick={() => setIsMobileToolboxOpen(false)} />
          <div className="w-80 max-w-[90vw] bg-[#0c0d10] h-full shadow-2xl flex flex-col animate-slide-left border-l border-zinc-800">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-zinc-300" />
                <span>Tools & Actions</span>
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsMobileToolboxOpen(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ActionToolbox
                activeTool={activeTool}
                onSelectTool={(tool) => {
                  setActiveTool(tool);
                  if (tool === 'select' || tool === 'eraser') {
                    setSelectedPlayerLabel(null);
                  }
                  setIsMobileToolboxOpen(false);
                }}
                selectedPlayerLabel={selectedPlayerLabel}
                onSelectPlayerTemplate={(type, label) => {
                  handleSelectPlayerTemplate(type, label);
                  setIsMobileToolboxOpen(false);
                }}
                onResetFrame={handleClearFrame}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MODALS */}
      {/* Pick Court & Template Modal */}
      <CourtTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectSetup={handleSelectSetupFromModal}
        onOpenPlaybook={() => setIsPlaybookOpen(true)}
        savedPlaysCount={savedPlays.length}
      />

      {/* Play Details & Coaching Notes Modal */}
      <PlayDetailsModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          if (currentMode === 'notes') setCurrentMode('draw');
        }}
        play={currentPlay}
        onSaveDetails={updated => {
          const newPlay = { ...currentPlay, ...updated };
          pushState(newPlay);
        }}
      />

      {/* Output / Export & Share Modal */}
      <OutputExportModal
        isOpen={isOutputModalOpen}
        onClose={() => {
          setIsOutputModalOpen(false);
          if (currentMode === 'output') setCurrentMode('draw');
        }}
        play={currentPlay}
        courtElementRef={courtContainerRef}
      />

      {/* Playbook Sidebar Library */}
      <PlaybookSidebar
        isOpen={isPlaybookOpen}
        onClose={() => setIsPlaybookOpen(false)}
        savedPlays={savedPlays}
        currentPlay={currentPlay}
        onSaveCurrentPlay={handleSavePlay}
        onLoadPlay={play => {
          pushState(play);
          setActiveFrameIndex(0);
          setIsPlaying(false);
        }}
        onDeletePlay={id => setSavedPlays(savedPlays.filter(p => p.id !== id))}
        onImportPlays={importedPlays => {
          const newMap = new Map<string, Play>();
          savedPlays.forEach(p => newMap.set(p.id, p));
          importedPlays.forEach(p => newMap.set(p.id, p));
          const merged = Array.from(newMap.values());
          setSavedPlays(merged);
          if (importedPlays[0]) {
            pushState(importedPlays[0]);
            setActiveFrameIndex(0);
          }
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#c4ced4', '#ffffff', '#71717a'],
          });
        }}
      />
    </div>
  );
}

export default App;
