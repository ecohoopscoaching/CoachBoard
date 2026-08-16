export type CourtType = 'half' | 'full-horizontal' | 'full-vertical';

export type CourtTheme = 
  | 'spurs-hardwood'
  | 'spurs-midnight'
  | 'classic-hardwood' 
  | 'cyber-neon' 
  | 'clean-whiteboard';

export type Team = 'offense' | 'defense' | 'equipment' | 'ball' | 'annotation';

export type PieceStyle = 'circle-number' | 'plain-number' | 'defense-x' | 'custom-icon' | 'equipment' | 'shape' | 'text';

export type PieceRole = 
  | 'PG' | 'SG' | 'SF' | 'PF' | 'C'
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5'
  | 'CONE' | 'CHAIR' | 'DEFENDER_DUMMY' | 'BALL'
  | 'CUSTOM' | 'SHAPE_RECT' | 'SHAPE_CIRCLE' | 'SHAPE_TRIANGLE' | 'SHAPE_DIAMOND' | 'LINE' | 'TEXT';

export interface Point {
  x: number; // 0 - 100 percentage of court width
  y: number; // 0 - 100 percentage of court height
}

export interface Piece {
  id: string;
  label: string; // e.g. "1", "2", "3", "4", "5", "X1", "C", "Text"
  role: PieceRole;
  team: Team;
  x: number; // 0 - 100
  y: number; // 0 - 100
  style?: PieceStyle;
  color?: string;
  rotation?: number; // degrees
  customText?: string;
  hasBall?: boolean;
}

export interface BallState {
  x: number; // 0 - 100
  y: number; // 0 - 100
  heldByPlayerId: string | null;
  height?: number; // 0 to 1 for visual elevation during pass/shot
}

export type DrawingType = 
  | 'pass'      // Dashed line with animated flow & arrow
  | 'dribble'   // Zigzag / wavy line with arrow
  | 'cut'       // Solid line with directional arrow
  | 'screen'    // Solid line with T-bar perpendicular head
  | 'shot'      // High arc dashed line pointing to basket
  | 'handoff'   // Solid line with handoff double bar
  | 'freehand'; // Freehand path points

export interface DrawingElement {
  id: string;
  type: DrawingType;
  points: Point[]; // Array of points defining the line or curve
  fromPieceId?: string;
  toPieceId?: string;
  color: string;
  thickness?: number;
  label?: string;
}

export interface Keyframe {
  id: string;
  title: string;
  duration: number; // Duration to animate transition to this frame in seconds (default: 1.5)
  pieces: Piece[];
  ball?: BallState | null;
  drawings: DrawingElement[];
  notes?: string;
}

export interface Play {
  id: string;
  title: string;
  category: 'actions' | 'offense' | 'defense' | 'quick-hitter' | 'slob' | 'blob' | 'drill';
  courtType: CourtType;
  courtTheme: CourtTheme;
  keyframes: Keyframe[];
  description: string;
  coachingPoints: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type AppMode = 'draw' | 'animate' | 'notes' | 'output';

export type SelectedTool = {
  type: 'action' | 'player' | 'misc' | 'select' | 'eraser';
  id: string;
  meta?: any;
};

export type ActiveTool = 
  | 'select'
  | 'add_offense_circled'
  | 'add_offense_plain'
  | 'add_defense_x'
  | 'add_defense_custom'
  | 'add_ball'
  | 'add_cone'
  | 'add_chair'
  | 'add_text'
  | 'add_rect'
  | 'add_circle'
  | 'add_triangle'
  | 'add_diamond'
  | 'add_line'
  | 'pass'
  | 'dribble'
  | 'cut'
  | 'screen'
  | 'shot'
  | 'handoff'
  | 'freehand'
  | 'eraser';
