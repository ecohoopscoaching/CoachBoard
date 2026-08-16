import React from 'react';
import type { DrawingElement, ActiveTool, Point, Piece, CourtType } from '../../types/play';

interface DrawingLayerProps {
  drawings: DrawingElement[];
  activeTool: ActiveTool;
  pieces: Piece[];
  courtType?: CourtType;
  onAddDrawing: (drawing: DrawingElement) => void;
  onDeleteDrawing: (id: string) => void;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = ({
  drawings,
  activeTool,
  pieces,
  courtType = 'half',
  onAddDrawing,
  onDeleteDrawing,
}) => {
  const [currentPathPoints, setCurrentPathPoints] = React.useState<Point[]>([]);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const isDrawingTool = ['pass', 'dribble', 'cut', 'screen', 'shot', 'handoff'].includes(activeTool);

  const getRelativePoint = (e: React.PointerEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingTool) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    const pt = getRelativePoint(e);
    if (!pt) return;

    // Snap to nearby piece if within 8%
    const nearbyPiece = pieces.find(p => Math.hypot(p.x - pt.x, p.y - pt.y) < 8);
    const startPt = nearbyPiece ? { x: nearbyPiece.x, y: nearbyPiece.y } : pt;

    setCurrentPathPoints([startPt]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (currentPathPoints.length === 0) return;
    const pt = getRelativePoint(e);
    if (!pt) return;

    const lastPt = currentPathPoints[currentPathPoints.length - 1];
    const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);

    // Sample points every ~2 units to capture smooth curves
    if (dist > 2.0) {
      setCurrentPathPoints([...currentPathPoints, pt]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (currentPathPoints.length === 0) return;
    const rawEndPt = getRelativePoint(e) || currentPathPoints[currentPathPoints.length - 1];

    // Snap end point to nearby piece if pass or handoff
    const nearbyEnd = pieces.find(p => Math.hypot(p.x - rawEndPt.x, p.y - rawEndPt.y) < 8);
    const endPt = (nearbyEnd && (activeTool === 'pass' || activeTool === 'handoff'))
      ? { x: nearbyEnd.x, y: nearbyEnd.y }
      : rawEndPt;

    const finalPoints = [...currentPathPoints];
    if (Math.hypot(endPt.x - finalPoints[finalPoints.length - 1].x, endPt.y - finalPoints[finalPoints.length - 1].y) > 0.5) {
      finalPoints.push(endPt);
    }

    if (finalPoints.length >= 2) {
      const startPt = finalPoints[0];
      const finishPt = finalPoints[finalPoints.length - 1];

      const nearbyStart = pieces.find(p => Math.hypot(p.x - startPt.x, p.y - startPt.y) < 8);
      const targetEnd = pieces.find(p => Math.hypot(p.x - finishPt.x, p.y - finishPt.y) < 8);

      const colorMap: Record<string, string> = {
        pass: '#0a0a0a',
        cut: '#0a0a0a',
        dribble: '#0a0a0a',
        screen: '#0a0a0a',
        shot: '#ea580c',
        handoff: '#0a0a0a',
      };

      const newDrawing: DrawingElement = {
        id: `drw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: activeTool as DrawingElement['type'],
        points: finalPoints,
        fromPieceId: nearbyStart?.id,
        toPieceId: targetEnd?.id,
        color: colorMap[activeTool] || '#0a0a0a',
      };

      onAddDrawing(newDrawing);
    }

    setCurrentPathPoints([]);
  };

  const viewBoxWidth = courtType === 'full-vertical' ? 500 : courtType === 'full-horizontal' ? 940 : 500;
  const viewBoxHeight = courtType === 'full-vertical' ? 940 : courtType === 'full-horizontal' ? 500 : 470;

  const toSvgX = (x: number) => (x / 100) * viewBoxWidth;
  const toSvgY = (y: number) => (y / 100) * viewBoxHeight;

  // Helper to build smooth SVG path string from point array
  const buildSmoothPath = (pts: Point[]) => {
    if (pts.length < 2) return '';
    if (pts.length === 2) {
      return `M ${toSvgX(pts[0].x)},${toSvgY(pts[0].y)} L ${toSvgX(pts[1].x)},${toSvgY(pts[1].y)}`;
    }

    let d = `M ${toSvgX(pts[0].x)},${toSvgY(pts[0].y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (toSvgX(pts[i].x) + toSvgX(pts[i + 1].x)) / 2;
      const yc = (toSvgY(pts[i].y) + toSvgY(pts[i + 1].y)) / 2;
      d += ` Q ${toSvgX(pts[i].x)},${toSvgY(pts[i].y)} ${xc},${yc}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${toSvgX(last.x)},${toSvgY(last.y)}`;
    return d;
  };

  // Calculate tangent angle at end of line
  const getEndAngle = (pts: Point[]) => {
    if (pts.length < 2) return 0;
    const pEnd = pts[pts.length - 1];
    const pPrev = pts[Math.max(0, pts.length - 2)];
    const dx = toSvgX(pEnd.x) - toSvgX(pPrev.x);
    const dy = toSvgY(pEnd.y) - toSvgY(pPrev.y);
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  return (
    <svg
      ref={svgRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
      className={`absolute inset-0 w-full h-full select-none ${
        isDrawingTool ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      }`}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* HIGH-CONTRAST DUAL-TONE ARROW MARKERS (Pops vividly on black paint & wood) */}
        <marker
          id="arrow-tactical"
          viewBox="0 0 12 12"
          refX="8"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 10 6 L 1 10 z" fill="#ffffff" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
        </marker>

        <marker
          id="arrow-shot"
          viewBox="0 0 12 12"
          refX="8"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 10 6 L 1 10 z" fill="#ea580c" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* RENDER EXISTING DRAWINGS */}
      {drawings.map(drw => {
        if (!drw.points || drw.points.length < 2) return null;
        const pathData = buildSmoothPath(drw.points);
        const lastPt = drw.points[drw.points.length - 1];
        const endX = toSvgX(lastPt.x);
        const endY = toSvgY(lastPt.y);
        const endAngle = getEndAngle(drw.points);

        return (
          <g
            key={drw.id}
            onClick={e => {
              if (activeTool === 'eraser') {
                e.stopPropagation();
                onDeleteDrawing(drw.id);
              }
            }}
            className={activeTool === 'eraser' ? 'pointer-events-auto cursor-pointer hover:opacity-40' : 'pointer-events-none'}
          >
            {/* PASS: High-Contrast Dashed Path */}
            {drw.type === 'pass' && (
              <>
                {/* White casing for contrast against black key */}
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" strokeDasharray="10,6" opacity="0.9" />
                <path
                  d={pathData}
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="3.5"
                  strokeDasharray="10,6"
                  markerEnd="url(#arrow-tactical)"
                />
              </>
            )}

            {/* CUT: Smooth Solid Path with High-Contrast Arrow */}
            {drw.type === 'cut' && (
              <>
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
                <path
                  d={pathData}
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrow-tactical)"
                />
              </>
            )}

            {/* DRIBBLE: Wavy / Zigzag Pattern */}
            {drw.type === 'dribble' && (
              <>
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
                <path
                  d={pathData}
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="3.5"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  markerEnd="url(#arrow-tactical)"
                />
              </>
            )}

            {/* SCREEN: Solid Path with Perpendicular T-Bar Head */}
            {drw.type === 'screen' && (
              <>
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
                <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />
                <g transform={`translate(${endX}, ${endY}) rotate(${endAngle + 90})`}>
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#0a0a0a" strokeWidth="4.5" strokeLinecap="round" />
                </g>
              </>
            )}

            {/* SHOT: Orange High Arc with Shot Arrow */}
            {drw.type === 'shot' && (
              <>
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.9" strokeDasharray="8,5" />
                <path
                  d={pathData}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeDasharray="8,5"
                  markerEnd="url(#arrow-shot)"
                />
              </>
            )}

            {/* HANDOFF: Solid Line with Double Bar */}
            {drw.type === 'handoff' && (
              <>
                <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
                <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />
                <g transform={`translate(${endX}, ${endY}) rotate(${endAngle + 90})`}>
                  <line x1="-10" y1="-3" x2="10" y2="-3" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                  <line x1="-10" y1="-3" x2="10" y2="-3" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
                  <line x1="-10" y1="3" x2="10" y2="3" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                  <line x1="-10" y1="3" x2="10" y2="3" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
                </g>
              </>
            )}
          </g>
        );
      })}

      {/* LIVE INTERACTIVE DRAWING PREVIEW WHILE DRAGGING */}
      {currentPathPoints.length >= 2 && (
        <path
          d={buildSmoothPath(currentPathPoints)}
          fill="none"
          stroke={activeTool === 'shot' ? '#ea580c' : '#ffffff'}
          strokeWidth="4"
          strokeDasharray={activeTool === 'pass' || activeTool === 'dribble' ? '8,5' : undefined}
          markerEnd={activeTool === 'shot' ? 'url(#arrow-shot)' : 'url(#arrow-tactical)'}
          opacity="0.85"
        />
      )}
    </svg>
  );
};
