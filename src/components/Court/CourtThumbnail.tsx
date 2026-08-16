import React from 'react';
import type { Piece, CourtType, DrawingElement } from '../../types/play';

interface CourtThumbnailProps {
  pieces?: Piece[];
  ball?: { x: number; y: number; heldByPlayerId: string | null } | null;
  drawings?: DrawingElement[];
  courtType?: CourtType;
  className?: string;
}

export const CourtThumbnail: React.FC<CourtThumbnailProps> = ({
  pieces = [],
  ball,
  drawings = [],
  courtType = 'half',
  className = '',
}) => {
  const isHorizontal = courtType === 'full-horizontal';
  const isVertical = courtType === 'full-vertical';

  const viewBox = isVertical
    ? '0 0 500 940'
    : isHorizontal
    ? '0 0 940 500'
    : '0 0 500 470';

  const aspectClass = isVertical
    ? 'aspect-[50/94]'
    : isHorizontal
    ? 'aspect-[94/50]'
    : 'aspect-[50/47]';

  // SVG coordinate transformation helpers
  const viewBoxWidth = isVertical ? 500 : isHorizontal ? 940 : 500;
  const viewBoxHeight = isVertical ? 940 : isHorizontal ? 500 : 470;
  const toSvgX = (x: number) => (x / 100) * viewBoxWidth;
  const toSvgY = (y: number) => (y / 100) * viewBoxHeight;

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (!pts || pts.length < 2) return '';
    let d = `M ${toSvgX(pts[0].x)},${toSvgY(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${toSvgX(pts[i].x)},${toSvgY(pts[i].y)}`;
    }
    return d;
  };

  const getEndAngle = (pts: { x: number; y: number }[]) => {
    if (!pts || pts.length < 2) return 0;
    const pEnd = pts[pts.length - 1];
    const pPrev = pts[Math.max(0, pts.length - 2)];
    return Math.atan2(toSvgY(pEnd.y) - toSvgY(pPrev.y), toSvgX(pEnd.x) - toSvgX(pPrev.x)) * (180 / Math.PI);
  };

  return (
    <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-[#e8cfb0] border border-[#262626] select-none ${className}`}>
      {/* 1. SCALED COURT SVG */}
      <svg
        viewBox={viewBox}
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Hardwood Pattern without black stroke inheritance */}
          <pattern id="thumb-hardwood-v" width="120" height="300" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="24" height="300" fill="#eed8ba" />
            <line x1="0" y1="120" x2="24" y2="120" stroke="#b58752" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="24" y="0" width="24" height="300" fill="#dfbe95" />
            <line x1="24" y1="240" x2="48" y2="240" stroke="#b58752" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="48" y="0" width="24" height="300" fill="#e7cbab" />
            <line x1="48" y1="60" x2="72" y2="60" stroke="#b58752" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="72" y="0" width="24" height="300" fill="#d9b486" />
            <line x1="72" y1="180" x2="96" y2="180" stroke="#b58752" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="96" y="0" width="24" height="300" fill="#e9d0b0" />
            <line x1="96" y1="280" x2="120" y2="280" stroke="#b58752" strokeWidth="1" strokeOpacity="0.4" />

            <line x1="24" y1="0" x2="24" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="48" y1="0" x2="48" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="72" y1="0" x2="72" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="96" y1="0" x2="96" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.4" />
          </pattern>

          <marker
            id="thumb-arrow-black"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          </marker>

          <marker
            id="thumb-arrow-orange"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Hardwood floor fill */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#thumb-hardwood-v)" />

        {/* ================= HALF COURT ================= */}
        {courtType === 'half' && (
          <g stroke="#0a0a0a" strokeWidth="3.5" fill="none">
            {/* Outer Boundary */}
            <rect x="15" y="15" width="470" height="440" strokeWidth="4" />

            {/* Half Court Center Arc */}
            <path d="M 190,455 A 60,60 0 0,1 310,455" strokeWidth="4" />

            {/* Solid Spurs Black Key */}
            <rect x="170" y="15" width="160" height="190" fill="#000000" stroke="#c4ced4" strokeWidth="3" />

            {/* Free Throw Circle */}
            <path d="M 190,205 A 60,60 0 0,1 310,205" stroke="#ffffff" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 190,205 A 60,60 0 0,0 310,205" stroke="#0a0a0a" strokeWidth="3.5" />

            {/* Key Lane Hash Marks */}
            <line x1="158" y1="75" x2="170" y2="75" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="158" y1="110" x2="170" y2="110" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="158" y1="145" x2="170" y2="145" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="158" y1="180" x2="170" y2="180" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="330" y1="75" x2="342" y2="75" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="330" y1="110" x2="342" y2="110" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="330" y1="145" x2="342" y2="145" stroke="#0a0a0a" strokeWidth="3.5" />
            <line x1="330" y1="180" x2="342" y2="180" stroke="#0a0a0a" strokeWidth="3.5" />

            {/* 3-Point Line */}
            <path d="M 30,15 L 30,135 A 238,238 0 0,0 470,135 L 470,15" stroke="#0a0a0a" strokeWidth="4" />

            {/* Minimalist White Basket */}
            <line x1="210" y1="35" x2="290" y2="35" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="250" cy="53" r="13" stroke="#ffffff" strokeWidth="4" />
            <path d="M 205,53 A 45,45 0 0,0 295,53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* ================= VERTICAL FULL COURT ================= */}
        {courtType === 'full-vertical' && (
          <g stroke="#0a0a0a" strokeWidth="3.5" fill="none">
            <rect x="15" y="15" width="470" height="910" strokeWidth="4" />
            <line x1="15" y1="470" x2="485" y2="470" strokeWidth="4" />
            <circle cx="250" cy="470" r="60" strokeWidth="4" />

            {/* Top Basket */}
            <rect x="170" y="15" width="160" height="190" fill="#000000" stroke="#c4ced4" strokeWidth="3" />
            <path d="M 190,205 A 60,60 0 0,1 310,205" stroke="#ffffff" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 190,205 A 60,60 0 0,0 310,205" stroke="#0a0a0a" strokeWidth="3.5" />
            <path d="M 30,15 L 30,135 A 238,238 0 0,0 470,135 L 470,15" stroke="#0a0a0a" strokeWidth="4" />
            <line x1="210" y1="35" x2="290" y2="35" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="250" cy="53" r="13" stroke="#ffffff" strokeWidth="4" />
            <path d="M 205,53 A 45,45 0 0,0 295,53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

            {/* Bottom Basket */}
            <rect x="170" y="735" width="160" height="190" fill="#000000" stroke="#c4ced4" strokeWidth="3" />
            <path d="M 190,735 A 60,60 0 0,0 310,735" stroke="#ffffff" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 190,735 A 60,60 0 0,1 310,735" stroke="#0a0a0a" strokeWidth="3.5" />
            <path d="M 30,925 L 30,805 A 238,238 0 0,1 470,805 L 470,925" stroke="#0a0a0a" strokeWidth="4" />
            <line x1="210" y1="905" x2="290" y2="905" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="250" cy="887" r="13" stroke="#ffffff" strokeWidth="4" />
            <path d="M 205,887 A 45,45 0 0,1 295,887" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* ================= HORIZONTAL FULL COURT ================= */}
        {courtType === 'full-horizontal' && (
          <g stroke="#0a0a0a" strokeWidth="3.5" fill="none">
            <rect x="15" y="15" width="910" height="470" strokeWidth="4" />
            <line x1="470" y1="15" x2="470" y2="485" strokeWidth="4" />
            <circle cx="470" cy="250" r="60" strokeWidth="4" />

            {/* Left Basket */}
            <rect x="15" y="170" width="190" height="160" fill="#000000" stroke="#c4ced4" strokeWidth="3" />
            <path d="M 205,190 A 60,60 0 0,0 205,310" stroke="#ffffff" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 205,190 A 60,60 0 0,1 205,310" stroke="#0a0a0a" strokeWidth="3.5" />
            <path d="M 15,30 L 135,30 A 238,238 0 0,1 135,470 L 15,470" stroke="#0a0a0a" strokeWidth="4" />
            <line x1="35" y1="210" x2="35" y2="290" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="53" cy="250" r="13" stroke="#ffffff" strokeWidth="4" />
            <path d="M 53,205 A 45,45 0 0,1 53,295" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

            {/* Right Basket */}
            <rect x="735" y="170" width="190" height="160" fill="#000000" stroke="#c4ced4" strokeWidth="3" />
            <path d="M 735,190 A 60,60 0 0,1 735,310" stroke="#ffffff" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 735,190 A 60,60 0 0,0 735,310" stroke="#0a0a0a" strokeWidth="3.5" />
            <path d="M 925,30 L 805,30 A 238,238 0 0,0 805,470 L 925,470" stroke="#0a0a0a" strokeWidth="4" />
            <line x1="905" y1="210" x2="905" y2="290" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="887" cy="250" r="13" stroke="#ffffff" strokeWidth="4" />
            <path d="M 887,205 A 45,45 0 0,0 887,295" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* ================= TACTICAL DRAWING ELEMENTS ================= */}
        {drawings && drawings.map(drw => {
          const pathData = buildPath(drw.points);
          if (!pathData) return null;
          const endPt = drw.points[drw.points.length - 1];
          const endX = toSvgX(endPt.x);
          const endY = toSvgY(endPt.y);
          const endAngle = getEndAngle(drw.points);

          return (
            <g key={drw.id}>
              {/* CUT: Solid Line with Arrow */}
              {drw.type === 'cut' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" markerEnd="url(#thumb-arrow-black)" />
                </>
              )}

              {/* PASS: Dashed Line with Arrow */}
              {drw.type === 'pass' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="6,4" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeDasharray="6,4" markerEnd="url(#thumb-arrow-black)" />
                </>
              )}

              {/* DRIBBLE: Wavy / Dashed with Arrow */}
              {drw.type === 'dribble' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="4,3" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeDasharray="4,3" markerEnd="url(#thumb-arrow-black)" />
                </>
              )}

              {/* SCREEN: Solid Line with T-Bar */}
              {drw.type === 'screen' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
                  <g transform={`translate(${endX}, ${endY}) rotate(${endAngle + 90})`}>
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                </>
              )}

              {/* SHOT: Orange Arc with Arrow */}
              {drw.type === 'shot' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="6,4" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray="6,4" markerEnd="url(#thumb-arrow-orange)" />
                </>
              )}

              {/* HANDOFF: Solid Line with Double Bar */}
              {drw.type === 'handoff' && (
                <>
                  <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
                  <path d={pathData} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
                  <g transform={`translate(${endX}, ${endY}) rotate(${endAngle + 90})`}>
                    <line x1="-7" y1="-2" x2="7" y2="-2" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="-7" y1="2" x2="7" y2="2" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* 2. PIECES RENDERED WITH CRISP TOKENS */}
      {pieces.map(p => {
        const isOffense = p.team === 'offense' || p.style === 'circle-number' || p.style === 'plain-number';
        const isDefense = p.team === 'defense' || p.style === 'defense-x';

        return (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-10 pointer-events-none"
          >
            {isOffense && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] sm:text-xs font-black text-black shadow-md">
                {p.label}
              </div>
            )}
            {isDefense && !isOffense && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1c1c1c] border-2 border-white flex items-center justify-center text-[8px] sm:text-[9px] font-black text-white shadow-md">
                {p.label.startsWith('X') ? p.label : `X${p.label}`}
              </div>
            )}
          </div>
        );
      })}

      {/* 3. BASKETBALL (Only render if ball is defined and not coincident with player) */}
      {ball && ball.x > 0 && ball.y > 0 && !pieces.some(p => Math.hypot(p.x - ball.x, p.y - ball.y) < 4) && (
        <img
          src="/basketball.png"
          alt="Basketball"
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-3.5 h-3.5 object-contain z-20 pointer-events-none shadow"
        />
      )}
    </div>
  );
};
