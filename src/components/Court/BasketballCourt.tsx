import React from 'react';
import type { CourtType, CourtTheme, Point } from '../../types/play';

interface BasketballCourtProps {
  courtType: CourtType;
  courtTheme: CourtTheme;
  children?: React.ReactNode;
  onCourtClick?: (point: Point) => void;
  onCourtDrop?: (payload: any, point: Point) => void;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export const BasketballCourt: React.FC<BasketballCourtProps> = ({
  courtType,
  courtTheme = 'spurs-hardwood',
  children,
  onCourtClick,
  onCourtDrop,
  innerRef,
}) => {
  const localRef = React.useRef<HTMLDivElement>(null);
  const containerRef = innerRef || localRef;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onCourtClick) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    onCourtClick({ x, y });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current || !onCourtDrop) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    try {
      const raw = e.dataTransfer.getData('application/coachboard-item');
      if (raw) {
        const payload = JSON.parse(raw);
        onCourtDrop(payload, { x, y });
      }
    } catch (err) {
      console.error('Error in court drop:', err);
    }
  };

  const getThemeStyles = () => {
    switch (courtTheme) {
      case 'spurs-midnight':
        return {
          isHardwoodSvg: false,
          frameBg: 'p-3 sm:p-4 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] bg-[#0a0a0a] border-2 border-[#c4ced4]/40',
          courtBorder: 'border-2 border-[#c4ced4]/60',
          courtBg: 'bg-[#000000]',
          lineColor: '#ffffff',
          lineOpacity: 1.0,
          keyColor: '#121212',
          paintBorder: '#c4ced4',
          accentColor: '#c4ced4',
          rimColor: '#ff6b00',
          textColor: '#ffffff',
        };
      case 'classic-hardwood':
        return {
          isHardwoodSvg: true,
          frameBg: 'p-3 rounded-2xl border-4 border-[#a8743e] shadow-2xl bg-[#5c3a1d]',
          courtBorder: 'border-2 border-white/60',
          courtBg: 'bg-[#d8a46b]',
          lineColor: '#ffffff',
          lineOpacity: 0.95,
          keyColor: 'rgba(180, 120, 60, 0.45)',
          paintBorder: '#fde047',
          accentColor: '#f59e0b',
          rimColor: '#ff6b00',
          textColor: '#ffffff',
        };
      case 'cyber-neon':
        return {
          isHardwoodSvg: false,
          frameBg: 'p-2 rounded-2xl border-4 border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.3)] bg-black',
          courtBorder: 'border border-sky-400/40',
          courtBg: 'bg-black',
          lineColor: '#ffffff',
          lineOpacity: 0.95,
          keyColor: 'rgba(56, 189, 248, 0.25)',
          paintBorder: '#38bdf8',
          accentColor: '#38bdf8',
          rimColor: '#38bdf8',
          textColor: '#ffffff',
        };
      case 'clean-whiteboard':
        return {
          isHardwoodSvg: false,
          frameBg: 'p-2 rounded-2xl border-4 border-slate-300 shadow-xl bg-white',
          courtBorder: 'border border-slate-300',
          courtBg: 'bg-white',
          lineColor: '#0f172a',
          lineOpacity: 0.9,
          keyColor: 'rgba(56, 189, 248, 0.15)',
          paintBorder: '#38bdf8',
          accentColor: '#f59e0b',
          rimColor: '#ff6b00',
          textColor: '#0f172a',
        };
      case 'spurs-hardwood':
      default:
        // SAN ANTONIO SPURS HARDWOOD PALETTE: Metallic Silver & Black Frame + Vertical Hardwood + Spurs Black Paint + Silver Markings
        return {
          isHardwoodSvg: true,
          frameBg: 'p-3 sm:p-4 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.7)] bg-gradient-to-b from-[#1c1c1c] via-[#0f0f0f] to-[#000000] border-2 border-[#c4ced4]/50',
          courtBorder: 'border-2 border-[#000000]',
          courtBg: 'bg-[#e8cfb0]',
          lineColor: '#ffffff',
          lineOpacity: 1.0,
          keyColor: '#000000', // Spurs Solid Black Paint
          paintBorder: '#c4ced4', // Metallic Silver Key Border
          accentColor: '#c4ced4',
          rimColor: '#ffffff',
          textColor: '#ffffff',
        };
    }
  };

  const theme = getThemeStyles();

  // Determine Aspect Ratio based on court type (Regulation 94x50 ratio)
  const getAspectRatioClass = () => {
    switch (courtType) {
      case 'full-horizontal':
        return 'aspect-[94/50] max-w-5xl max-h-[82vh]';
      case 'full-vertical':
        return 'aspect-[50/94] max-w-[460px] max-h-[85vh]';
      case 'half':
      default:
        return 'aspect-[50/47] max-w-[560px] max-h-[82vh]';
    }
  };

  // SVG viewBox proportional to regulation dimensions
  const viewBox =
    courtType === 'full-vertical'
      ? '0 0 500 940'
      : courtType === 'full-horizontal'
      ? '0 0 940 500'
      : '0 0 500 470';

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      id="basketball-court-canvas"
      className={`relative w-full ${getAspectRatioClass()} select-none overflow-hidden transition-all duration-300 mx-auto ${theme.frameBg}`}
    >
      <div className={`relative w-full h-full rounded-2xl overflow-hidden ${theme.courtBg} ${theme.courtBorder}`}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={viewBox}
          preserveAspectRatio="none"
        >
          <defs>
            {/* VERTICAL HARDWOOD PLANKS PATTERN (Runs baseline to baseline vertically) */}
            <pattern id="hardwood-planks-vertical" width="120" height="300" patternUnits="userSpaceOnUse">
              {/* Column 1 */}
              <rect x="0" y="0" width="24" height="300" fill="#eed8ba" />
              <line x1="6" y1="0" x2="6" y2="300" stroke="#e2c59f" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="35,10,60,15,40" />
              <line x1="14" y1="0" x2="14" y2="300" stroke="#f6e7d0" strokeWidth="1.2" strokeOpacity="0.7" strokeDasharray="50,20,80,10" />
              <line x1="0" y1="120" x2="24" y2="120" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              {/* Column 2 */}
              <rect x="24" y="0" width="24" height="300" fill="#dfbe95" />
              <line x1="30" y1="0" x2="30" y2="300" stroke="#cd9d68" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="20,15,70,25" />
              <line x1="38" y1="0" x2="38" y2="300" stroke="#ebd2af" strokeWidth="1.0" strokeOpacity="0.6" strokeDasharray="60,30,40" />
              <line x1="24" y1="240" x2="48" y2="240" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              {/* Column 3 */}
              <rect x="48" y="0" width="24" height="300" fill="#e7cbab" />
              <line x1="56" y1="0" x2="56" y2="300" stroke="#d5b084" strokeWidth="0.9" strokeOpacity="0.6" strokeDasharray="80,25,45" />
              <line x1="62" y1="0" x2="62" y2="300" stroke="#f4e3cd" strokeWidth="1.1" strokeOpacity="0.7" strokeDasharray="30,10,90" />
              <line x1="48" y1="60" x2="72" y2="60" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              {/* Column 4 */}
              <rect x="72" y="0" width="24" height="300" fill="#d9b486" />
              <line x1="80" y1="0" x2="80" y2="300" stroke="#c49a62" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="40,20,50,30" />
              <line x1="88" y1="0" x2="88" y2="300" stroke="#ecd4b6" strokeWidth="1.0" strokeOpacity="0.6" strokeDasharray="70,15,65" />
              <line x1="72" y1="180" x2="96" y2="180" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              {/* Column 5 */}
              <rect x="96" y="0" width="24" height="300" fill="#e9d0b0" />
              <line x1="104" y1="0" x2="104" y2="300" stroke="#dcb78b" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="55,35,40" />
              <line x1="112" y1="0" x2="112" y2="300" stroke="#f6e8d4" strokeWidth="1.1" strokeOpacity="0.7" strokeDasharray="25,15,80" />
              <line x1="96" y1="280" x2="120" y2="280" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              {/* Vertical Grooves between planks */}
              <line x1="24" y1="0" x2="24" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="48" y1="0" x2="48" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="72" y1="0" x2="72" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="96" y1="0" x2="96" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="120" y1="0" x2="120" y2="300" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
            </pattern>

            {/* HORIZONTAL HARDWOOD PLANKS PATTERN (For horizontal court) */}
            <pattern id="hardwood-planks-horizontal" width="300" height="120" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="300" height="24" fill="#eed8ba" />
              <line x1="0" y1="6" x2="300" y2="6" stroke="#e2c59f" strokeWidth="0.8" strokeOpacity="0.6" />
              <line x1="120" y1="0" x2="120" y2="24" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              <rect x="0" y="24" width="300" height="24" fill="#dfbe95" />
              <line x1="0" y1="30" x2="300" y2="30" stroke="#cd9d68" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="240" y1="24" x2="240" y2="48" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              <rect x="0" y="48" width="300" height="24" fill="#e7cbab" />
              <line x1="0" y1="56" x2="300" y2="56" stroke="#d5b084" strokeWidth="0.9" strokeOpacity="0.6" />
              <line x1="60" y1="48" x2="60" y2="72" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              <rect x="0" y="72" width="300" height="24" fill="#d9b486" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#c49a62" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="180" y1="72" x2="180" y2="96" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              <rect x="0" y="96" width="300" height="24" fill="#e9d0b0" />
              <line x1="0" y1="104" x2="300" y2="104" stroke="#dcb78b" strokeWidth="0.8" strokeOpacity="0.6" />
              <line x1="280" y1="96" x2="280" y2="120" stroke="#b58752" strokeWidth="1.2" strokeOpacity="0.7" />

              <line x1="0" y1="24" x2="300" y2="24" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="0" y1="48" x2="300" y2="48" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="0" y1="72" x2="300" y2="72" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="0" y1="96" x2="300" y2="96" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="#ba8c57" strokeWidth="0.8" strokeOpacity="0.65" />
            </pattern>
          </defs>

          {/* Hardwood Background Fill */}
          {theme.isHardwoodSvg && (
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={courtType === 'full-horizontal' ? 'url(#hardwood-planks-horizontal)' : 'url(#hardwood-planks-vertical)'}
            />
          )}

          {/* ================= 1. HALF COURT (500 wide x 470 deep) ================= */}
          {courtType === 'half' && (
            <>
              {/* Outer Boundary */}
              <rect x="15" y="15" width="470" height="440" fill="none" stroke="#0a0a0a" strokeWidth="4" />

              {/* Half Court Center Arc (Bottom) */}
              <path d="M 190,455 A 60,60 0 0,1 310,455" fill="none" stroke="#0a0a0a" strokeWidth="4" />

              {/* Solid Spurs Black Key / Paint Area */}
              <rect x="170" y="15" width="160" height="190" fill={theme.keyColor} stroke={theme.paintBorder} strokeWidth="4" />

              {/* Free Throw Circle: Top half dashed inside key, bottom half solid outside key */}
              <path d="M 190,205 A 60,60 0 0,1 310,205" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="8,6" />
              <path d="M 190,205 A 60,60 0 0,0 310,205" fill="none" stroke="#0a0a0a" strokeWidth="4" />

              {/* Key Lane Hash Marks */}
              <line x1="158" y1="75" x2="170" y2="75" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="158" y1="110" x2="170" y2="110" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="158" y1="145" x2="170" y2="145" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="158" y1="180" x2="170" y2="180" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="330" y1="75" x2="342" y2="75" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="330" y1="110" x2="342" y2="110" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="330" y1="145" x2="342" y2="145" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="330" y1="180" x2="342" y2="180" stroke="#0a0a0a" strokeWidth="4" />

              {/* 3-Point Line (Correct Geometry: Corners from baseline + Arc completely outside key) */}
              <path
                d="M 30,15 L 30,135 A 238,238 0 0,0 470,135 L 470,15"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="4"
              />

              {/* CLEAN MINIMALIST WHITE BASKET */}
              <line x1="210" y1="35" x2="290" y2="35" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="250" cy="53" r="13" fill="none" stroke="#ffffff" strokeWidth="4" />
              <path d="M 205,53 A 45,45 0 0,0 295,53" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* ================= 2. VERTICAL FULL COURT (500 wide x 940 deep) ================= */}
          {courtType === 'full-vertical' && (
            <>
              {/* Outer Boundary */}
              <rect x="15" y="15" width="470" height="910" fill="none" stroke="#0a0a0a" strokeWidth="4" />

              {/* Center Line & Circles */}
              <line x1="15" y1="470" x2="485" y2="470" stroke="#0a0a0a" strokeWidth="4" />
              <circle cx="250" cy="470" r="60" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <circle cx="250" cy="470" r="20" fill="none" stroke="#c4ced4" strokeWidth="3" />

              {/* TOP BASKET */}
              <rect x="170" y="15" width="160" height="190" fill={theme.keyColor} stroke={theme.paintBorder} strokeWidth="4" />
              <path d="M 190,205 A 60,60 0 0,1 310,205" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="8,6" />
              <path d="M 190,205 A 60,60 0 0,0 310,205" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <path d="M 30,15 L 30,135 A 238,238 0 0,0 470,135 L 470,15" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="210" y1="35" x2="290" y2="35" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="250" cy="53" r="13" fill="none" stroke="#ffffff" strokeWidth="4" />
              <path d="M 205,53 A 45,45 0 0,0 295,53" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

              {/* BOTTOM BASKET */}
              <rect x="170" y="735" width="160" height="190" fill={theme.keyColor} stroke={theme.paintBorder} strokeWidth="4" />
              <path d="M 190,735 A 60,60 0 0,0 310,735" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="8,6" />
              <path d="M 190,735 A 60,60 0 0,1 310,735" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <path d="M 30,925 L 30,805 A 238,238 0 0,1 470,805 L 470,925" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="210" y1="905" x2="290" y2="905" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="250" cy="887" r="13" fill="none" stroke="#ffffff" strokeWidth="4" />
              <path d="M 205,887 A 45,45 0 0,1 295,887" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* ================= 3. HORIZONTAL FULL COURT (940 wide x 500 deep) ================= */}
          {courtType === 'full-horizontal' && (
            <>
              {/* Outer Boundary */}
              <rect x="15" y="15" width="910" height="470" fill="none" stroke="#0a0a0a" strokeWidth="4" />

              {/* Center Line & Circles */}
              <line x1="470" y1="15" x2="470" y2="485" stroke="#0a0a0a" strokeWidth="4" />
              <circle cx="470" cy="250" r="60" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <circle cx="470" cy="250" r="20" fill="none" stroke="#c4ced4" strokeWidth="3" />

              {/* LEFT BASKET */}
              <rect x="15" y="170" width="190" height="160" fill={theme.keyColor} stroke={theme.paintBorder} strokeWidth="4" />
              <path d="M 205,190 A 60,60 0 0,0 205,310" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="8,6" />
              <path d="M 205,190 A 60,60 0 0,1 205,310" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <path d="M 15,30 L 135,30 A 238,238 0 0,1 135,470 L 15,470" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="35" y1="210" x2="35" y2="290" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="53" cy="250" r="13" fill="none" stroke="#ffffff" strokeWidth="4" />
              <path d="M 53,205 A 45,45 0 0,1 53,295" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

              {/* RIGHT BASKET */}
              <rect x="735" y="170" width="190" height="160" fill={theme.keyColor} stroke={theme.paintBorder} strokeWidth="4" />
              <path d="M 735,190 A 60,60 0 0,1 735,310" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="8,6" />
              <path d="M 735,190 A 60,60 0 0,0 735,310" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <path d="M 925,30 L 805,30 A 238,238 0 0,0 805,470 L 925,470" fill="none" stroke="#0a0a0a" strokeWidth="4" />
              <line x1="905" y1="210" x2="905" y2="290" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="887" cy="250" r="13" fill="none" stroke="#ffffff" strokeWidth="4" />
              <path d="M 887,205 A 45,45 0 0,0 887,295" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            </>
          )}
        </svg>

        {/* Layer for Pieces, Drawings, Animations */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
