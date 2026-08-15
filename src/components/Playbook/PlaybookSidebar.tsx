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

export const PlaybookSidebar: React.FC<PlaybookSidebarProps> = ({
  isOpen,
  onClose,
  savedPlays,
  onLoadPlay,
  onDeletePlay,
  onImportJSON,
}) => {
  const [activeTab, setActiveTab] = React.useState<'presets' | 'saved'>('presets');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  if (!isOpen) return null;

  const currentPlayList = activeTab === 'presets' ? PRESET_PLAYS : savedPlays;

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-black border-l border-sky-950 text-white h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sky-950 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              Tactical Playbook
            </h2>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset vs Saved Tabs */}
        <div className="flex items-center p-3 border-b border-sky-950 gap-2 bg-slate-950/60">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('presets');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'presets'
                ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Preset Plays ({PRESET_PLAYS.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('saved');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'saved'
                ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>My Plays ({savedPlays.length})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-sky-950 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plays, tags, sets..."
              className="w-full bg-slate-950 border border-sky-900/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'offense', 'defense', 'slob', 'blob', 'drill'].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-sky-300 border border-sky-400/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Play Cards List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-black">
          {filteredPlays.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
              No plays found in this library.
            </div>
          ) : (
            filteredPlays.map(play => (
              <div
                key={play.id}
                className="bg-slate-950 border border-sky-950 hover:border-sky-400/60 rounded-2xl p-4 flex flex-col gap-2.5 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block bg-sky-500/10 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
                      {play.category} • {play.courtType} court
                    </span>
                    <h3 className="text-sm font-black text-white group-hover:text-sky-300 transition-colors">
                      {play.title}
                    </h3>
                  </div>

                  {activeTab === 'saved' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onDeletePlay(play.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Play"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {play.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {play.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] font-semibold text-sky-200 bg-slate-900 px-2 py-0.5 rounded border border-sky-950"
                    >
                      <Tag className="w-2.5 h-2.5 text-sky-400" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Load Button */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onLoadPlay(play);
                    onClose();
                  }}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-sky-400 hover:text-slate-950 font-black text-xs text-white shadow transition-all"
                >
                  <PlayIcon className="w-3.5 h-3.5 fill-current text-sky-400 group-hover:text-slate-950" />
                  <span>Load Play Diagram</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Import JSON Button */}
        <div className="p-4 border-t border-sky-950 bg-slate-950">
          <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-sky-900 hover:border-sky-400 text-slate-400 hover:text-sky-300 font-bold text-xs cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import Playbook JSON</span>
            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
