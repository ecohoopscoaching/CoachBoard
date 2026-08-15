import type { Point, Piece, BallState, Keyframe } from '../types/play';

/**
 * Linear interpolation between two 2D points
 */
export function interpolatePoint(p1: Point, p2: Point, progress: number): Point {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return {
    x: p1.x + (p2.x - p1.x) * clampedProgress,
    y: p1.y + (p2.y - p1.y) * clampedProgress,
  };
}

/**
 * Easing function for smooth acceleration & deceleration (Cubic Ease In/Out)
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolates a point along a multi-point polyline / curve path
 */
export function interpolateAlongPath(points: Point[], progress: number): Point {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  if (progress <= 0) return points[0];
  if (progress >= 1) return points[points.length - 1];

  const cumLengths: number[] = [0];
  let totalLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    totalLength += d;
    cumLengths.push(totalLength);
  }

  if (totalLength === 0) return points[0];

  const targetDist = Math.max(0, Math.min(totalLength, progress * totalLength));

  for (let i = 0; i < cumLengths.length - 1; i++) {
    if (targetDist <= cumLengths[i + 1]) {
      const segLength = cumLengths[i + 1] - cumLengths[i];
      const segProgress = segLength === 0 ? 0 : (targetDist - cumLengths[i]) / segLength;
      return interpolatePoint(points[i], points[i + 1], segProgress);
    }
  }

  return points[points.length - 1];
}

/**
 * Interpolates pieces state between two keyframes based on progress (0 to 1).
 * If a cut or movement line was drawn for the piece, the player follows the exact curve/path!
 */
export function interpolateKeyframePieces(
  fromFrame: Keyframe,
  toFrame: Keyframe,
  rawProgress: number
): Piece[] {
  const easedProgress = easeInOutCubic(rawProgress);

  // Map piece positions from starting frame to target frame by ID
  const toPieceMap = new Map(toFrame.pieces.map(p => [p.id, p]));
  const allDrawings = [...(fromFrame.drawings || []), ...(toFrame.drawings || [])];

  return fromFrame.pieces.map(fromPiece => {
    const toPiece = toPieceMap.get(fromPiece.id);
    if (!toPiece) return fromPiece;

    // Find any cut, dribble, or movement drawing associated with this player
    const movementDrawing = allDrawings.find(d => {
      if (!d.points || d.points.length < 2) return false;
      if (d.type !== 'cut' && d.type !== 'dribble' && d.type !== 'screen') return false;

      if (d.fromPieceId === fromPiece.id) return true;
      const startDist = Math.hypot(d.points[0].x - fromPiece.x, d.points[0].y - fromPiece.y);
      return startDist < 8;
    });

    let currentPos: Point;

    if (movementDrawing && movementDrawing.points.length >= 2) {
      // Piece follows the exact straight or curved trajectory of the drawn cut!
      const pathPos = interpolateAlongPath(movementDrawing.points, easedProgress);

      // If target piece location differs from end of drawing, blend them smoothly
      const pathEnd = movementDrawing.points[movementDrawing.points.length - 1];
      const endOffset = { x: toPiece.x - pathEnd.x, y: toPiece.y - pathEnd.y };

      currentPos = {
        x: pathPos.x + endOffset.x * easedProgress,
        y: pathPos.y + endOffset.y * easedProgress,
      };
    } else {
      // Direct linear interpolation
      currentPos = interpolatePoint(
        { x: fromPiece.x, y: fromPiece.y },
        { x: toPiece.x, y: toPiece.y },
        easedProgress
      );
    }

    return {
      ...fromPiece,
      x: currentPos.x,
      y: currentPos.y,
    };
  });
}

/**
 * Interpolates ball position and visual arc elevation height between keyframes
 */
export function interpolateKeyframeBall(
  fromFrame: Keyframe,
  toFrame: Keyframe,
  rawProgress: number,
  currentPieces: Piece[]
): BallState | null {
  if (!fromFrame.ball && !toFrame.ball) return null;
  const fromBall = fromFrame.ball || toFrame.ball!;
  const toBall = toFrame.ball || fromFrame.ball!;

  const easedProgress = easeInOutCubic(rawProgress);

  // If ball is held by a player in the target state, stick to that player's current interpolated position
  const targetHeldPlayerId = toBall.heldByPlayerId || fromBall.heldByPlayerId;

  if (targetHeldPlayerId) {
    const player = currentPieces.find(p => p.id === targetHeldPlayerId);
    if (player) {
      return {
        x: player.x,
        y: player.y,
        heldByPlayerId: targetHeldPlayerId,
        height: 0,
      };
    }
  }

  // Check if there is a pass drawing
  const passDrawing = fromFrame.drawings?.find(
    d => d.type === 'pass' && d.points && d.points.length >= 2
  );

  let pos: Point;
  if (passDrawing) {
    pos = interpolateAlongPath(passDrawing.points, easedProgress);
  } else {
    const startPos = { x: fromBall.x, y: fromBall.y };
    const endPos = { x: toBall.x, y: toBall.y };
    pos = interpolatePoint(startPos, endPos, easedProgress);
  }

  // Calculate parabolic arc height for air pass / shot (peak at center 0.5 progress)
  const isMoving = Math.hypot(toBall.x - fromBall.x, toBall.y - fromBall.y) > 1;
  const arcHeight = isMoving ? Math.sin(easedProgress * Math.PI) * 1.5 : 0;

  return {
    x: pos.x,
    y: pos.y,
    heldByPlayerId: null,
    height: arcHeight,
  };
}
