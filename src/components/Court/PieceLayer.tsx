import React from 'react';
import type { Piece, BallState, ActiveTool, Point } from '../../types/play';

interface PieceLayerProps {
  pieces: Piece[];
  ball?: BallState | null;
  activeTool: ActiveTool;
  selectedPieceId: string | null;
  onSelectPiece: (id: string | null) => void;
  onMovePiece: (id: string, point: Point) => void;
  onMoveBall: (point: Point) => void;
  onDeletePiece: (id: string) => void;
  isAnimating: boolean;
}

export const PieceLayer: React.FC<PieceLayerProps> = ({
  pieces,
  ball,
  activeTool,
  selectedPieceId,
  onSelectPiece,
  onMovePiece,
  onMoveBall,
  onDeletePiece,
  isAnimating,
}) => {
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const getPointFromEvent = (e: PointerEvent): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeTool === 'eraser') {
      if (id !== 'ball') {
        onDeletePiece(id);
      }
      return;
    }
    setDraggedItemId(id);
    onSelectPiece(id);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture fallback
    }
  };

  React.useEffect(() => {
    if (!draggedItemId) return;

    const handlePointerMove = (e: PointerEvent) => {
      const pt = getPointFromEvent(e);
      if (!pt) return;

      if (draggedItemId === 'ball') {
        onMoveBall(pt);
      } else {
        onMovePiece(draggedItemId, pt);
      }
    };

    const handlePointerUp = () => {
      setDraggedItemId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggedItemId, onMovePiece, onMoveBall]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none select-none">
      {/* 1. RENDER PLAYER PIECES */}
      {pieces.map(piece => {
        const isSelected = selectedPieceId === piece.id;
        const isOffense = piece.team === 'offense' || piece.style === 'circle-number' || piece.style === 'plain-number';
        const isDefense = piece.team === 'defense' || piece.style === 'defense-x';

        return (
          <div
            key={piece.id}
            onPointerDown={e => handlePointerDown(piece.id, e)}
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: isAnimating ? 'all 0.05s linear' : 'none',
            }}
            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group touch-none select-none z-10"
          >
            {/* OFFENSE TOKENS (Solid White Circle Badge with Bold Black Number) */}
            {isOffense && (
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-black text-xl sm:text-2xl shadow-2xl border-[2.5px] border-black transition-transform duration-100 group-hover:scale-110 ${
                  isSelected
                    ? 'ring-4 ring-black ring-offset-2 scale-110 shadow-2xl'
                    : ''
                }`}
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffffff, #e2e8f0)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
                }}
              >
                <span className="font-black leading-none">{piece.label}</span>
              </div>
            )}

            {/* DEFENSE TOKENS (Solid Dark Badge with Crisp White Border & Text) */}
            {isDefense && !isOffense && (
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-white text-base sm:text-lg shadow-2xl border-[2.5px] border-white transition-transform duration-100 group-hover:scale-110 ${
                  isSelected
                    ? 'ring-4 ring-white ring-offset-2 scale-110 shadow-2xl'
                    : ''
                }`}
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #262626, #0a0a0a)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
                }}
              >
                <span className="font-black tracking-tight leading-none">
                  {piece.label.startsWith('X') ? piece.label : `X${piece.label}`}
                </span>
              </div>
            )}

            {/* CONE PIECE */}
            {piece.role === 'CONE' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center drop-shadow-md">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <polygon points="18,4 32,32 4,32" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                  <rect x="2" y="30" width="32" height="4" rx="2" fill="#9a3412" />
                </svg>
              </div>
            )}

            {/* CHAIR PIECE */}
            {piece.role === 'CHAIR' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center drop-shadow-md">
                <svg viewBox="0 0 36 36" className="w-full h-full" fill="none" stroke="#000000" strokeWidth="3">
                  <rect x="8" y="14" width="20" height="14" rx="2" fill="#334155" />
                  <path d="M 10,14 L 10,4 L 26,4 L 26,14" fill="#0f172a" />
                  <line x1="10" y1="28" x2="8" y2="34" strokeWidth="3" />
                  <line x1="26" y1="28" x2="28" y2="34" strokeWidth="3" />
                </svg>
              </div>
            )}

            {/* SHAPES: Rect, Circle, Triangle, Diamond */}
            {piece.role === 'SHAPE_RECT' && (
              <div className="w-9 h-9 sm:w-11 sm:h-11 border-2 border-black bg-black/20 rounded-md" />
            )}
            {piece.role === 'SHAPE_CIRCLE' && (
              <div className="w-9 h-9 sm:w-11 sm:h-11 border-2 border-black bg-black/20 rounded-full" />
            )}
            {piece.role === 'SHAPE_TRIANGLE' && (
              <div className="w-9 h-9 sm:w-11 sm:h-11">
                <svg viewBox="0 0 36 36" className="w-full h-full fill-black/20 stroke-black stroke-2">
                  <polygon points="18,4 32,32 4,32" />
                </svg>
              </div>
            )}
            {piece.role === 'SHAPE_DIAMOND' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black bg-black/20 rotate-45" />
            )}
            {piece.role === 'TEXT' && (
              <div className="px-2.5 py-1 bg-black/90 border border-white/60 rounded text-xs font-bold text-white whitespace-nowrap shadow-md">
                {piece.customText || piece.label || 'Note'}
              </div>
            )}
          </div>
        );
      })}

      {/* 2. RENDER BASKETBALL */}
      {ball && (
        <div
          onPointerDown={e => handlePointerDown('ball', e)}
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            transform: `translate(-50%, -50%) scale(${1 + (ball.height || 0) * 0.35})`,
            transition: isAnimating ? 'all 0.05s linear' : 'none',
          }}
          className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group touch-none select-none z-20"
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${
              selectedPieceId === 'ball' ? 'ring-4 ring-orange-500 ring-offset-2 scale-125' : ''
            }`}
          >
            <img
              src="/basketball.png"
              alt="Basketball"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
