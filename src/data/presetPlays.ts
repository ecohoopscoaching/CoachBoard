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
    id: 'traditional',
    name: 'Traditional',
    category: 'offense',
    description: 'Classic 2-guard, 2-forward, 1-center setup (1 top, 2 wings, 4 & 5 posts).',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 72 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 22, y: 55 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 78, y: 55 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 32, y: 28 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 68, y: 28 },
    ],
    ball: null,
  },
  {
    id: '5-out',
    name: '5 Out',
    category: 'offense',
    description: 'Modern 5-Out perimeter spacing creating open driving lanes and cutting opportunities.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 74 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 20, y: 58 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 80, y: 58 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 12, y: 25 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 88, y: 25 },
    ],
    ball: null,
  },
  {
    id: 'princeton',
    name: 'Princeton Offense',
    category: 'offense',
    description: 'High-post spacing emphasizing backdoor cuts, dribble handoffs, and screening.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 56, y: 70 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 44, y: 70 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 18, y: 46 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 82, y: 46 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 50, y: 35 },
    ],
    ball: null,
  },
  {
    id: 'box',
    name: 'Box',
    category: 'offense',
    description: 'Box set with two players at the elbows and two on the low blocks.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 74 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 38, y: 48 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 62, y: 48 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 38, y: 22 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 62, y: 22 },
    ],
    ball: null,
  },
  {
    id: '1-4-low',
    name: '1-4 Low',
    category: 'offense',
    description: 'Point guard up top with four offensive teammates lined up across the baseline/low wing.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 75 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 12, y: 22 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 36, y: 22 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 64, y: 22 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 88, y: 22 },
    ],
    ball: null,
  },
  {
    id: 'horns',
    name: 'Horns',
    category: 'offense',
    description: 'High double-elbow ball screen look with shooters in both deep corners.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 74 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 38, y: 50 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 62, y: 50 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 12, y: 22 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 88, y: 22 },
    ],
    ball: null,
  },
  {
    id: '1-4-high',
    name: '1-4 High',
    category: 'offense',
    description: 'Point guard initiating with wings at the free-throw line extended and bigs at the elbows.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 75 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 14, y: 50 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 38, y: 50 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 62, y: 50 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 86, y: 50 },
    ],
    ball: null,
  },
  {
    id: 'flex',
    name: 'Flex',
    category: 'offense',
    description: '2-3 Flex alignment for cross screens, down screens, and baseline cutters.',
    pieces: [
      { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 58, y: 72 },
      { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 42, y: 72 },
      { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 16, y: 24 },
      { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 50, y: 24 },
      { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 84, y: 24 },
    ],
    ball: null,
  },
  {
    id: '2-3-zone',
    name: '2-3 Zone Defense',
    category: 'defense',
    description: 'Two guards patrolling the top perimeter and three defenders guarding the backline.',
    pieces: [
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 40, y: 56 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 60, y: 56 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 20, y: 26 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 26 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 80, y: 26 },
    ],
    ball: null,
  },
  {
    id: '3-2-zone',
    name: '3-2 Zone Defense',
    category: 'defense',
    description: 'Three perimeter chasers outside and two active bigs covering the low posts.',
    pieces: [
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 64 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 22, y: 48 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 78, y: 48 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 34, y: 24 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 66, y: 24 },
    ],
    ball: null,
  },
  {
    id: '1-3-1-zone',
    name: '1-3-1 Zone Defense',
    category: 'defense',
    description: 'Top point chaser, two sideline wings, center in the middle, and baseline warrior runner.',
    pieces: [
      { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 66 },
      { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 20, y: 44 },
      { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 44 },
      { id: 'def-3', label: 'X3', role: 'D3', team: 'defense', style: 'defense-x', x: 80, y: 44 },
      { id: 'def-4', label: 'X4', role: 'D4', team: 'defense', style: 'defense-x', x: 50, y: 22 },
    ],
    ball: null,
  },
];

export const PRESET_PLAYS: Play[] = [
  {
    id: 'horns-flare-roll',
    title: 'Horns Flare & Roll',
    category: 'offense',
    courtType: 'half',
    courtTheme: 'spurs-hardwood',
    description: 'Modern NBA Horns set opening with a high ball screen from 5, followed by an off-ball flare screen from 4 for shooter 2.',
    coachingPoints: [
      'Point Guard (1) attacks middle off the 5 pick to pull the rim protector.',
      'Shooter (2) sets up their defender before flaring over the 4 backscreen.',
      'Big (5) rolls hard to the basket for a lob or pocket pass finish.'
    ],
    tags: ['Horns', 'Pick & Roll', 'Flare Screen', '3-Pointer'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    keyframes: [
      {
        id: 'kf-1',
        title: 'Phase 1: Initial Horns Setup',
        duration: 1.5,
        pieces: [
          { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 50, y: 74 },
          { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 38, y: 50 },
          { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 62, y: 50 },
          { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 12, y: 22 },
          { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 88, y: 22 },
          { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 50, y: 67 },
          { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 62, y: 44 },
          { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 15, y: 26 },
        ],
        ball: null,
        drawings: [
          { id: 'd-1', type: 'screen', points: [{ x: 62, y: 50 }, { x: 52, y: 67 }], color: '#0a0a0a' },
          { id: 'd-2', type: 'dribble', points: [{ x: 50, y: 74 }, { x: 70, y: 60 }], color: '#0a0a0a' },
        ],
      },
      {
        id: 'kf-2',
        title: 'Phase 2: Flare Screen & Cut',
        duration: 1.5,
        pieces: [
          { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 70, y: 60 },
          { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 30, y: 40 },
          { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 52, y: 35 },
          { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 22, y: 56 },
          { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 88, y: 22 },
          { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 64, y: 54 },
          { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 30 },
          { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 30, y: 44 },
        ],
        ball: null,
        drawings: [
          { id: 'd-3', type: 'pass', points: [{ x: 70, y: 60 }, { x: 22, y: 56 }], color: '#0a0a0a' },
          { id: 'd-4', type: 'cut', points: [{ x: 52, y: 35 }, { x: 50, y: 15 }], color: '#0a0a0a' },
        ],
      },
      {
        id: 'kf-3',
        title: 'Phase 3: Catch & Open Shot',
        duration: 1.5,
        pieces: [
          { id: 'off-1', label: '1', role: 'PG', team: 'offense', style: 'circle-number', x: 70, y: 60 },
          { id: 'off-4', label: '4', role: 'PF', team: 'offense', style: 'circle-number', x: 30, y: 40 },
          { id: 'off-5', label: '5', role: 'C', team: 'offense', style: 'circle-number', x: 50, y: 15 },
          { id: 'off-2', label: '2', role: 'SG', team: 'offense', style: 'circle-number', x: 22, y: 56 },
          { id: 'off-3', label: '3', role: 'SF', team: 'offense', style: 'circle-number', x: 88, y: 22 },
          { id: 'def-1', label: 'X1', role: 'D1', team: 'defense', style: 'defense-x', x: 64, y: 54 },
          { id: 'def-5', label: 'X5', role: 'D5', team: 'defense', style: 'defense-x', x: 50, y: 20 },
          { id: 'def-2', label: 'X2', role: 'D2', team: 'defense', style: 'defense-x', x: 26, y: 46 },
        ],
        ball: null,
        drawings: [
          { id: 'd-5', type: 'shot', points: [{ x: 22, y: 56 }, { x: 50, y: 11 }], color: '#0a0a0a' },
        ],
      },
    ],
  },
];
