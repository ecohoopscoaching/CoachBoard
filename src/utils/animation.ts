import type { Point, Piece, BallState, Keyframe, DrawingElement } from '../types/play';

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
 * High quality smooth easing function (Cubic Ease In/Out)
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolates a point along a multi-point polyline or curve path with continuous distance parametrization
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
 * Helper to identify which offensive player a defender is assigned to / guarding.
 * Matches by jersey label (e.g. X1 -> 1) or by closest court proximity within guarding distance.
 */
export function findGuardedOffensivePlayer(defender: Piece, pieces: Piece[]): Piece | null {
  const isDefense = defender.team === 'defense' || defender.style === 'defense-x' || defender.label.startsWith('X');
  if (!isDefense) return null;

  const offensePieces = pieces.filter(
    p => (p.team === 'offense' || p.style === 'circle-number' || p.style === 'plain-number') && p.id !== defender.id
  );
  if (offensePieces.length === 0) return null;

  // 1. Try label match (e.g. X1 -> 1, X2 -> 2)
  const cleanDefLabel = defender.label.replace(/^X/i, '').trim();
  const labelMatch = offensePieces.find(p => p.label.trim() === cleanDefLabel);
  if (labelMatch) {
    const dist = Math.hypot(defender.x - labelMatch.x, defender.y - labelMatch.y);
    // If within reasonable court matchup distance (25%), they are matched
    if (dist < 25) {
      return labelMatch;
    }
  }

  // 2. Otherwise find closest offensive player within guarding proximity (16%)
  let closest: Piece | null = null;
  let minDist = 16;
  for (const off of offensePieces) {
    const d = Math.hypot(defender.x - off.x, defender.y - off.y);
    if (d < minDist) {
      minDist = d;
      closest = off;
    }
  }

  return closest;
}

/**
 * Computes the defensive help-side adjustment for a defender relative to their guarded offensive player.
 * Off-ball defenders always inch slightly closer to the ball to form an authentic defensive help shell.
 */
export function calculateDefensiveHelpOffset(
  defender: Piece,
  guardedOff: Piece,
  ball: BallState | null | Point
): { x: number; y: number } {
  if (!ball) return { x: 0, y: 0 };

  const distOffToBall = Math.hypot(ball.x - guardedOff.x, ball.y - guardedOff.y);

  // If this offensive player has the ball (on-ball), defender stays directly on-ball without help-side pinch
  const isOnBall = distOffToBall < 6 || (ball as BallState).heldByPlayerId === guardedOff.id;
  if (isOnBall) {
    return { x: 0, y: 0 };
  }

  // Off-ball defender: inch towards the ball (help-side / gap positioning)
  const dx = ball.x - guardedOff.x;
  const dy = ball.y - guardedOff.y;

  if (distOffToBall < 1) return { x: 0, y: 0 };

  // Scale pinch distance based on distance to ball (3 to 6 units towards ball)
  const pinchDistance = Math.min(5.5, Math.max(2.5, distOffToBall * 0.18));
  const dirX = dx / distOffToBall;
  const dirY = dy / distOffToBall;

  return {
    x: Math.round(dirX * pinchDistance * 10) / 10,
    y: Math.round(dirY * pinchDistance * 10) / 10,
  };
}

/**
 * Calculates next frame pieces and ball state by automatically advancing players and the ball
 * to the exact finish positions of cuts, dribbles, screens, passes, and handoffs from the source frame.
 * Defenders automatically follow their guarded offensive player AND off-ball defenders inch towards the ball!
 */
export function applyDrawingsToNextFrame(
  sourceFrame: Keyframe,
  existingTargetFrame?: Keyframe | null
): { pieces: Piece[]; ball: BallState | null } {
  // Start from existing target frame pieces (if any) or clone source pieces
  const sourcePieces = sourceFrame.pieces || [];
  const basePieces: Piece[] = existingTargetFrame && existingTargetFrame.pieces.length > 0
    ? JSON.parse(JSON.stringify(existingTargetFrame.pieces))
    : JSON.parse(JSON.stringify(sourcePieces));

  const pieceMap = new Map<string, Piece>();
  basePieces.forEach(p => pieceMap.set(p.id, p));

  // Ensure all pieces from source exist in target
  sourcePieces.forEach(sp => {
    if (!pieceMap.has(sp.id)) {
      const cloned = { ...sp };
      basePieces.push(cloned);
      pieceMap.set(cloned.id, cloned);
    }
  });

  let nextBall: BallState | null = sourceFrame.ball
    ? { ...sourceFrame.ball }
    : existingTargetFrame?.ball
    ? { ...existingTargetFrame.ball }
    : null;

  const drawings: DrawingElement[] = sourceFrame.drawings || [];
  const piecesWithExplicitDrawings = new Set<string>();

  drawings.forEach(drawing => {
    if (!drawing.points || drawing.points.length < 2) return;
    const startPt = drawing.points[0];
    const endPt = drawing.points[drawing.points.length - 1];

    // Find the starting piece associated with this action
    let piece: Piece | undefined;
    if (drawing.fromPieceId) {
      piece = pieceMap.get(drawing.fromPieceId);
    }
    if (!piece) {
      let closestDist = 12;
      sourcePieces.forEach(sp => {
        const d = Math.hypot(sp.x - startPt.x, sp.y - startPt.y);
        if (d < closestDist) {
          closestDist = d;
          piece = pieceMap.get(sp.id);
        }
      });
    }

    if (piece) {
      piecesWithExplicitDrawings.add(piece.id);
    }

    // 1. CUTS & SCREENS: Player moves to endPoint of action
    if (drawing.type === 'cut' || drawing.type === 'screen') {
      if (piece) {
        piece.x = Math.round(endPt.x * 10) / 10;
        piece.y = Math.round(endPt.y * 10) / 10;
      }
    }

    // 2. DRIBBLES: Player moves to endPoint and carries ball
    if (drawing.type === 'dribble') {
      if (piece) {
        piece.x = Math.round(endPt.x * 10) / 10;
        piece.y = Math.round(endPt.y * 10) / 10;
        nextBall = {
          x: piece.x,
          y: piece.y,
          heldByPlayerId: piece.id,
          height: 0,
        };
      }
    }

    // 3. PASSES: Ball travels to receiver / endPoint
    if (drawing.type === 'pass') {
      let receiver: Piece | undefined;
      if (drawing.toPieceId) {
        receiver = pieceMap.get(drawing.toPieceId);
      }
      if (!receiver) {
        let closestDist = 12;
        basePieces.forEach(p => {
          if (piece && p.id === piece.id) return;
          const d = Math.hypot(p.x - endPt.x, p.y - endPt.y);
          if (d < closestDist) {
            closestDist = d;
            receiver = p;
          }
        });
      }

      nextBall = {
        x: receiver ? receiver.x : Math.round(endPt.x * 10) / 10,
        y: receiver ? receiver.y : Math.round(endPt.y * 10) / 10,
        heldByPlayerId: receiver ? receiver.id : null,
        height: 0,
      };
    }

    // 4. HANDOFFS: Receiver receives the ball at the handoff point
    if (drawing.type === 'handoff') {
      let receiver: Piece | undefined;
      if (drawing.toPieceId) {
        receiver = pieceMap.get(drawing.toPieceId);
      }
      if (!receiver) {
        let closestDist = 14;
        basePieces.forEach(p => {
          if (piece && p.id === piece.id) return;
          const d = Math.hypot(p.x - endPt.x, p.y - endPt.y);
          if (d < closestDist) {
            closestDist = d;
            receiver = p;
          }
        });
      }

      if (piece) {
        piece.x = Math.round(endPt.x * 10) / 10;
        piece.y = Math.round(endPt.y * 10) / 10;
      }

      if (receiver) {
        nextBall = {
          x: receiver.x,
          y: receiver.y,
          heldByPlayerId: receiver.id,
          height: 0,
        };
      } else {
        nextBall = {
          x: Math.round(endPt.x * 10) / 10,
          y: Math.round(endPt.y * 10) / 10,
          heldByPlayerId: null,
          height: 0,
        };
      }
    }

    // 5. SHOTS: Ball travels to basket
    if (drawing.type === 'shot') {
      nextBall = {
        x: Math.round(endPt.x * 10) / 10,
        y: Math.round(endPt.y * 10) / 10,
        heldByPlayerId: null,
        height: 0,
      };
    }
  });

  // 6. DEFENDER AUTOMATIC PATH FOLLOWING & OFF-BALL HELP POSITIONING:
  // For any defender that does NOT have its own custom drawing:
  basePieces.forEach(defPiece => {
    const isDefense = defPiece.team === 'defense' || defPiece.style === 'defense-x' || defPiece.label.startsWith('X');
    if (!isDefense || piecesWithExplicitDrawings.has(defPiece.id)) return;

    const sourceDef = sourcePieces.find(p => p.id === defPiece.id);
    if (!sourceDef) return;

    const guardedOff = findGuardedOffensivePlayer(sourceDef, sourcePieces);
    if (!guardedOff) return;

    const targetOff = pieceMap.get(guardedOff.id);
    if (!targetOff) return;

    // Base offset from source frame
    const baseOffsetX = sourceDef.x - guardedOff.x;
    const baseOffsetY = sourceDef.y - guardedOff.y;

    // Off-ball help-side positioning inched towards the ball
    const helpOffset = calculateDefensiveHelpOffset(defPiece, targetOff, nextBall);

    defPiece.x = Math.max(2, Math.min(98, Math.round((targetOff.x + baseOffsetX + helpOffset.x) * 10) / 10));
    defPiece.y = Math.max(2, Math.min(98, Math.round((targetOff.y + baseOffsetY + helpOffset.y) * 10) / 10));
  });

  return {
    pieces: basePieces,
    ball: nextBall,
  };
}

/**
 * Interpolates pieces smoothly between two keyframes.
 * If movement lines (cuts, dribbles, screens, handoffs) exist on fromFrame, the piece follows that curve!
 * Defenders automatically follow and mirror the path of their assigned offensive player!
 */
export function interpolateKeyframePieces(
  fromFrame: Keyframe,
  toFrame: Keyframe,
  rawProgress: number
): Piece[] {
  const easedProgress = easeInOutCubic(rawProgress);
  const toPieceMap = new Map(toFrame.pieces.map(p => [p.id, p]));
  const drawings = fromFrame.drawings || [];

  return fromFrame.pieces.map(fromPiece => {
    const toPiece = toPieceMap.get(fromPiece.id);
    if (!toPiece) return fromPiece;

    // 1. Check if this piece has its own direct movement drawing in fromFrame
    let movementDrawing = drawings.find(d => {
      if (!d.points || d.points.length < 2) return false;
      if (d.type !== 'cut' && d.type !== 'dribble' && d.type !== 'screen' && d.type !== 'handoff') return false;

      if (d.fromPieceId === fromPiece.id) return true;
      const startDist = Math.hypot(d.points[0].x - fromPiece.x, d.points[0].y - fromPiece.y);
      return startDist < 10;
    });

    // 2. If this is a DEFENDER without its own drawing, find and follow its guarded offensive player's path!
    const isDefense = fromPiece.team === 'defense' || fromPiece.style === 'defense-x' || fromPiece.label.startsWith('X');
    if (!movementDrawing && isDefense) {
      const guardedOff = findGuardedOffensivePlayer(fromPiece, fromFrame.pieces);
      if (guardedOff) {
        movementDrawing = drawings.find(d => {
          if (!d.points || d.points.length < 2) return false;
          if (d.type !== 'cut' && d.type !== 'dribble' && d.type !== 'screen' && d.type !== 'handoff') return false;

          if (d.fromPieceId === guardedOff.id) return true;
          const startDist = Math.hypot(d.points[0].x - guardedOff.x, d.points[0].y - guardedOff.y);
          return startDist < 10;
        });
      }
    }

    let currentPos: Point;

    if (movementDrawing && movementDrawing.points.length >= 2) {
      // Piece travels along the exact path of the drawn cut/dribble
      const pathPos = interpolateAlongPath(movementDrawing.points, easedProgress);

      const pathStart = movementDrawing.points[0];
      const pathEnd = movementDrawing.points[movementDrawing.points.length - 1];

      // Smooth delta offsets ensuring 100% mathematical match at start & end
      const startOffset = { x: fromPiece.x - pathStart.x, y: fromPiece.y - pathStart.y };
      const endOffset = { x: toPiece.x - pathEnd.x, y: toPiece.y - pathEnd.y };

      const curOffsetX = startOffset.x + (endOffset.x - startOffset.x) * easedProgress;
      const curOffsetY = startOffset.y + (endOffset.y - startOffset.y) * easedProgress;

      currentPos = {
        x: pathPos.x + curOffsetX,
        y: pathPos.y + curOffsetY,
      };
    } else {
      // Direct smooth linear/cubic interpolation
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
 * Interpolates ball position, dribble bounce, and flight elevation height between keyframes
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
  const drawings = fromFrame.drawings || [];

  // 1. Check for flat pass trajectory along the floor (height: 0)
  const passDrawing = drawings.find(d => d.type === 'pass' && d.points && d.points.length >= 2);
  if (passDrawing) {
    const pos = interpolateAlongPath(passDrawing.points, easedProgress);
    return {
      x: pos.x,
      y: pos.y,
      heldByPlayerId: null,
      height: 0, // Flat pass trajectory, zero lob
    };
  }

  // 2. Check for shot arc (only shots arc high into the basket)
  const shotDrawing = drawings.find(d => d.type === 'shot' && d.points && d.points.length >= 2);
  if (shotDrawing) {
    const pos = interpolateAlongPath(shotDrawing.points, easedProgress);
    const arcHeight = Math.sin(rawProgress * Math.PI) * 3.0; // High shooting arc
    return {
      x: pos.x,
      y: pos.y,
      heldByPlayerId: null,
      height: arcHeight,
    };
  }

  // 3. Check for live dribble by a player
  const dribblerDrawing = drawings.find(d => d.type === 'dribble' && d.points && d.points.length >= 2);
  if (dribblerDrawing) {
    const dribbler = currentPieces.find(p => {
      if (dribblerDrawing.fromPieceId === p.id) return true;
      const startDist = Math.hypot(dribblerDrawing.points[0].x - p.x, dribblerDrawing.points[0].y - p.y);
      return startDist < 8;
    });

    if (dribbler) {
      // Ball stays with dribbler with subtle rhythmic bounce
      const bounceOffset = Math.sin(rawProgress * Math.PI * 6) * 0.8;
      return {
        x: dribbler.x + 1.0,
        y: dribbler.y + bounceOffset,
        heldByPlayerId: dribbler.id,
        height: 0,
      };
    }
  }

  // 4. If ball is held by a player in target frame, track that player's position
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

  // 5. Default flat linear interpolation for free ball
  const startPos = { x: fromBall.x, y: fromBall.y };
  const endPos = { x: toBall.x, y: toBall.y };
  const pos = interpolatePoint(startPos, endPos, easedProgress);

  return {
    x: pos.x,
    y: pos.y,
    heldByPlayerId: null,
    height: 0,
  };
}

