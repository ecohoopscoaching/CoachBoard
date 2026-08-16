import React from 'react';
import type { Play } from '../../types/play';
import { PRESET_PLAYS } from '../../data/presetPlays';
import {
  X,
  Search,
  BookOpen,
  FolderHeart,
  Upload,
  Play as PlayIcon,
  Trash2,
  Tag,
  Layers,
  Zap,
  Timer,
  Target,
  Shield,
  CornerDownRight,
  ArrowDownToLine,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface PlaybookSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlays: Play[];
  onLoadPlay: (play: Play) => void;
  onDeletePlay: (id: string) => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface CategoryOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Plays', icon: Layers, description: 'View full playbook' },
  { id: 'actions', label: 'Actions', icon: Zap, description: 'Triggers & entries' },
  { id: 'quick-hitter', label: 'Quick Hitters', icon: Timer, description: 'Fast scoring sets' },
  { id: 'offense', label: 'Offense', icon: Target, description: 'Full half-court sets' },
  { id: 'defense', label: 'Defense', icon: Shield, description: 'Shells & schemes' },
  { id: 'slob', label: 'SLOB', icon: CornerDownRight, description: 'Sideline out-of-bounds' },
  { id: 'blob', label: 'BLOB', icon: ArrowDownToLine, description: 'Baseline out-of-bounds' },
  { id: 'drill', label: 'Drills', icon: Dumbbell, description: 'Practice & skills' },
];

export const PlaybookSidebar: React.FC<PlaybookSidebarProps> = ({
  isOpen,
  onClose,
  savedPlays,
  onLoadPlay,
  onDeletePlay,
  onImportJSON,
}) => {
  const [activeTab, setActiveTab] = React.useState<'presets' | 'saved'>(
    PRESET_PLAYS.length > 0 ? 'presets' : 'saved'
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  if (!isOpen) return null;

  const currentPlayList = activeTab === 'presets' ? PRESET_PLAYS : savedPlays;

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return currentPlayList.length;
    return currentPlayList.filter(p => p.category === catId).length;
  };

  const filteredPlays = currentPlayList.filter(play => {
    const matchesSearch =
      play.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      play.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      play.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || play.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0c0d10] border-l border-zinc-800 text-zinc-100 h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Spurs Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-inner">
              <BookOpen className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Tactical Playbook
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                San Antonio Spurs Style Coaching Library
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
            title="Close Playbook"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch only if presets exist */}
        {PRESET_PLAYS.length > 0 && (
          <div className="flex items-center p-3 border-b border-zinc-800/80 gap-2 bg-zinc-950/40">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('presets');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'presets'
                  ? 'bg-zinc-200 text-zinc-950 shadow-md border border-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preset Plays ({PRESET_PLAYS.length})</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('saved');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'saved'
                  ? 'bg-zinc-200 text-zinc-950 shadow-md border border-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>My Plays ({savedPlays.length})</span>
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plays, actions, tags, sets..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
            />
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Categories
            </span>
            <span className="text-[10px] font-semibold text-zinc-500">
              {filteredPlays.length} {filteredPlays.length === 1 ? 'play' : 'plays'} found
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-zinc-100 to-zinc-300 text-zinc-950 font-black border-white shadow-lg shadow-white/10 ring-1 ring-zinc-300'
                      : 'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span className="text-[10.5px] leading-tight font-bold tracking-tight">
                    {cat.label}
                  </span>
                  <span
                    className={`mt-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-zinc-950 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Play Cards List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0a0a0c]">
          {filteredPlays.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black uppercase text-zinc-300 tracking-wider mb-1">
                No Plays Found
              </h4>
              <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                {selectedCategory === 'all'
                  ? 'Your playbook is currently empty. Design and save custom plays on the board to build your collection.'
                  : `No plays currently saved under the "${CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            filteredPlays.map(play => (
              <div
                key={play.id}
                className="bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-500 rounded-2xl p-4 flex flex-col gap-2.5 transition-all hover:shadow-xl group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-1.5 tracking-wider">
                      {play.category} • {play.courtType} court
                    </span>
                    <h3 className="text-sm font-black text-white group-hover:text-zinc-200 transition-colors">
                      {play.title}
                    </h3>
                  </div>

                  {activeTab === 'saved' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onDeletePlay(play.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Delete Play"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {play.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {play.description}
                  </p>
                )}

                {/* Tags */}
                {play.tags && play.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {play.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-[10px] font-medium text-zinc-300 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800"
                      >
                        <Tag className="w-2.5 h-2.5 text-zinc-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Load Button */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onLoadPlay(play);
                    onClose();
                  }}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-200 hover:text-zinc-950 font-black text-xs text-zinc-200 border border-zinc-700/80 transition-all shadow-sm group/btn"
                >
                  <PlayIcon className="w-3.5 h-3.5 fill-current text-zinc-400 group-hover/btn:text-zinc-950" />
                  <span>Load Play Diagram</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Import JSON Button */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
          <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-zinc-700/80 hover:border-zinc-400 text-zinc-400 hover:text-zinc-100 font-bold text-xs cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900">
            <Upload className="w-3.5 h-3.5 text-zinc-300" />
            <span>Import Playbook JSON</span>
            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
