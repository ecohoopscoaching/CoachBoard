import type { Play, Piece } from '../types/play';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'offense' | 'defense' | 'custom';
  description: string;
  pieces: Piece[];
  ball?: { x: number; y: number; heldByPlayerId: string | null } | null;
}

export const COURT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'empty',
    name: 'Empty',
    category: 'custom',
    description: 'A completely blank canvas ready for your custom set.',
    pieces: [],
    ball: null,
  },
  {
    id: '2-3-high',
    name: '2-3 High (2-Guard)',
    category: 'offense',
    description: 'Randy Sherman 2-Guard base 2-3 High alignment (2 guards at slots, 3 players at free-throw line extended).',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 38, y: 70 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 62, y: 70 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 16, y: 46 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 50, y: 46 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 84, y: 46 },
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 38, y: 64 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 62, y: 64 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 19, y: 44 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 40 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 81, y: 44 },
    ],
    ball: { x: 38, y: 70, heldByPlayerId: 'off-1' },
  },
  {
    id: '5-out',
    name: '5 Out',
    category: 'offense',
    description: 'Modern 5-Out perimeter spacing creating open driving lanes and cutting opportunities.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 72 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 20, y: 56 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 80, y: 56 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 10, y: 22 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 90, y: 22 },
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 66 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 24, y: 52 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 76, y: 52 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 14, y: 22 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 86, y: 22 },
    ],
    ball: { x: 50, y: 72, heldByPlayerId: 'off-1' },
  },
  {
    id: 'horns',
    name: 'Horns',
    category: 'offense',
    description: 'High double-elbow ball screen look with shooters in both deep corners.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 72 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 38, y: 46 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 62, y: 46 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 10, y: 18 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 90, y: 18 },
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 66 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 38, y: 40 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 62, y: 40 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 14, y: 18 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 86, y: 18 },
    ],
    ball: { x: 50, y: 72, heldByPlayerId: 'off-1' },
  },
  {
    id: 'princeton',
    name: 'Princeton Offense',
    category: 'offense',
    description: 'High-post spacing emphasizing backdoor cuts, dribble handoffs, and screening.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 58, y: 68 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 42, y: 68 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 16, y: 46 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 84, y: 46 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 50, y: 38 },
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 58, y: 62 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 42, y: 62 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 20, y: 44 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 80, y: 44 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 32 },
    ],
    ball: { x: 58, y: 68, heldByPlayerId: 'off-1' },
  },
  {
    id: 'traditional',
    name: 'Traditional (3 Out, 2 In)',
    category: 'offense',
    description: 'Standard 3 perimeter players with 2 low/high post bigs.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 72 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 18, y: 48 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 82, y: 48 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 34, y: 22 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 66, y: 22 },
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 66 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 22, y: 44 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 78, y: 44 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 38, y: 24 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 62, y: 24 },
    ],
    ball: { x: 50, y: 72, heldByPlayerId: 'off-1' },
  },
  {
    id: 'defense-2-3-zone',
    name: '2-3 Zone Defense',
    category: 'defense',
    description: 'Traditional 2-3 matchup zone defense shell.',
    pieces: [
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 38, y: 55 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 62, y: 55 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 18, y: 24 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 20 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 82, y: 24 },
    ],
    ball: null,
  },
  {
    id: 'defense-man-shell',
    name: 'Man-to-Man Shell',
    category: 'defense',
    description: 'Standard 4-out defensive shell with ball denial and help-side positioning.',
    pieces: [
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 64 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 26, y: 46 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 74, y: 46 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 38, y: 26 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 56, y: 26 },
    ],
    ball: null,
  },
];

export const DEFAULT_INITIAL_PLAY: Play = {
  id: 'play-initial',
  title: 'Untitled Play',
  category: 'offense',
  courtType: 'half',
  courtTheme: 'spurs-hardwood',
  description: '',
  coachingPoints: [],
  tags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  keyframes: [
    {
      id: 'kf-1',
      title: 'Frame 1',
      duration: 3.0,
      pieces: [
        { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 72 },
        { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 20, y: 56 },
        { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 80, y: 56 },
        { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 10, y: 22 },
        { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 90, y: 22 },
        { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 66 },
        { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 24, y: 52 },
        { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 76, y: 52 },
        { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 14, y: 22 },
        { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 86, y: 22 },
      ],
      ball: { x: 50, y: 72, heldByPlayerId: 'off-1' },
      drawings: [],
    },
  ],
};

// Preset plays in the playbook (cleared per user request)
export const PRESET_PLAYS: Play[] = [];
