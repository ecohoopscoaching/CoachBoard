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
  Download,
  Save,
  Check,
  Eye,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { PlayCardDetailView } from './PlayCardDetailView';
import { CourtThumbnail } from '../Court/CourtThumbnail';

interface PlaybookSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlays: Play[];
  currentPlay: Play;
  onSaveCurrentPlay: () => void;
  onLoadPlay: (play: Play) => void;
  onDeletePlay: (id: string) => void;
  onImportPlays: (importedPlays: Play[]) => void;
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
  currentPlay,
  onSaveCurrentPlay,
  onLoadPlay,
  onDeletePlay,
  onImportPlays,
}) => {
  const [activeTab, setActiveTab] = React.useState<'presets' | 'saved'>(
    PRESET_PLAYS.length > 0 ? 'presets' : 'saved'
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedPlay, setSelectedPlay] = React.useState<Play | null>(null);
  const [saveToast, setSaveToast] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlayList = activeTab === 'presets' ? PRESET_PLAYS : savedPlays;

  const showFeedback = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

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

  // Export full playbook backup (.json)
  const handleExportPlaybook = () => {
    if (savedPlays.length === 0) {
      showFeedback('No plays to export! Save a play first.');
      return;
    }
    const dataStr = JSON.stringify(savedPlays, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `CoachBoard_Playbook_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundEffects.playWhistle();
    showFeedback(`Exported ${savedPlays.length} plays to JSON file!`);
  };

  // Export a single play (.json)
  const handleExportSinglePlay = (play: Play, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const dataStr = JSON.stringify(play, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = play.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Play';
    link.href = url;
    link.download = `${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundEffects.playClick();
    showFeedback(`Downloaded "${play.title}" JSON!`);
  };

  // Import JSON file (handles both single play and full playbook array)
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Array of plays
          const validPlays = parsed.filter(p => p && p.id && Array.isArray(p.keyframes));
          if (validPlays.length > 0) {
            onImportPlays(validPlays);
            soundEffects.playWhistle();
            showFeedback(`Imported ${validPlays.length} plays into playbook!`);
          } else {
            showFeedback('No valid plays found in JSON array.');
          }
        } else if (parsed && parsed.id && Array.isArray(parsed.keyframes)) {
          // Single play
          onImportPlays([parsed]);
          soundEffects.playWhistle();
          showFeedback(`Imported "${parsed.title || 'Play'}"!`);
        } else {
          showFeedback('Invalid CoachBoard play format.');
        }
      } catch {
        showFeedback('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 1. DEDICATED CARD VIEW (When a user clicks on a card)
  if (selectedPlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-0 sm:p-4">
        <div className="w-full max-w-6xl h-full sm:h-[94vh] bg-[#0c0d10] border border-zinc-800 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <PlayCardDetailView
            play={selectedPlay}
            onBack={() => setSelectedPlay(null)}
            onLoadPlay={play => {
              onLoadPlay(play);
              setSelectedPlay(null);
              onClose();
            }}
            onDeletePlay={id => {
              if (onDeletePlay) onDeletePlay(id);
              setSelectedPlay(null);
              showFeedback('Play deleted from library');
            }}
            onExportPlay={play => handleExportSinglePlay(play)}
            isSavedPlay={activeTab === 'saved'}
          />
        </div>
      </div>
    );
  }

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

        {/* Save Current Board Banner */}
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Active Board
            </span>
            <p className="text-xs font-black text-zinc-100 truncate">
              {currentPlay.title || 'Untitled Play'}
            </p>
          </div>
          <button
            onClick={() => {
              onSaveCurrentPlay();
              showFeedback(`Saved "${currentPlay.title}" to Playbook!`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs shadow-md border border-white transition-all shrink-0 active:scale-95"
          >
            <Save className="w-3.5 h-3.5 fill-current" />
            <span>Save to Playbook</span>
          </button>
        </div>

        {/* Notification Toast */}
        {saveToast && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-zinc-800 border border-zinc-600 text-zinc-100 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{saveToast}</span>
          </div>
        )}

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
              <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed mb-3">
                {selectedCategory === 'all'
                  ? 'Your playbook is currently empty. Design and save custom plays on the board to build your library.'
                  : `No plays currently saved under the "${CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            filteredPlays.map(play => {
              const firstFrame = play.keyframes?.[0] || { pieces: [], ball: null, drawings: [] };
              return (
                <div
                  key={play.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedPlay(play);
                  }}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 hover:border-[#c4ced4]/70 rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all hover:shadow-2xl cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block bg-zinc-800 text-[#c4ced4] border border-zinc-700/80 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-1 tracking-wider">
                        {play.category} • {play.courtType} court
                      </span>
                      <h3 className="text-sm font-black text-white group-hover:text-zinc-100 transition-colors truncate">
                        {play.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => handleExportSinglePlay(play, e)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        title="Download Play JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {activeTab === 'saved' && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            soundEffects.playClick();
                            onDeletePlay(play.id);
                            showFeedback(`Deleted "${play.title}"`);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Play"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Court Thumbnail Preview on Card */}
                  <div className="w-full rounded-xl overflow-hidden border border-zinc-800 group-hover:border-zinc-700 bg-black transition-colors pointer-events-none">
                    <CourtThumbnail
                      pieces={firstFrame.pieces}
                      ball={firstFrame.ball}
                      drawings={firstFrame.drawings}
                      courtType={play.courtType}
                      className="w-full max-h-36 object-contain"
                    />
                  </div>

                  {play.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {play.description}
                    </p>
                  )}

                  {/* Tags */}
                  {play.tags && play.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
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

                  {/* Actions Row: Open Page & Load */}
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        setSelectedPlay(play);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-xs text-zinc-200 border border-zinc-700 transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#c4ced4]" />
                      <span>View & Notes</span>
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        onLoadPlay(play);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-zinc-200 font-black text-xs text-zinc-950 border border-white transition-all shadow-sm"
                    >
                      <PlayIcon className="w-3.5 h-3.5 fill-current text-zinc-950" />
                      <span>Load to Board</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Backup & Restore Actions */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950 flex items-center gap-2.5">
          <button
            onClick={handleExportPlaybook}
            disabled={savedPlays.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-600 font-bold text-xs transition-all shadow-sm"
            title="Download full playbook backup JSON"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Export Playbook ({savedPlays.length})</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-600 font-bold text-xs cursor-pointer transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5 text-zinc-300" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
