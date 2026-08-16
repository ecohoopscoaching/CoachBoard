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
  Plus,
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validPlays = parsed.filter(p => p && p.id && Array.isArray(p.keyframes));
          if (validPlays.length > 0) {
            onImportPlays(validPlays);
            soundEffects.playWhistle();
            showFeedback(`Imported ${validPlays.length} plays into playbook!`);
          } else {
            showFeedback('No valid plays found in JSON array.');
          }
        } else if (parsed && parsed.id && Array.isArray(parsed.keyframes)) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-6xl h-[94vh] bg-[#0c0d10] border border-zinc-800 rounded-2xl sm:rounded-3xl text-zinc-100 flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-inner">
              <BookOpen className="w-5 h-5 text-[#c4ced4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Tactical Playbook
                </h2>
                <span className="bg-zinc-800 border border-zinc-700 text-[#c4ced4] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  {currentPlayList.length} {currentPlayList.length === 1 ? 'Play' : 'Plays'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                San Antonio Spurs Style Coaching & Tactical Diagram Library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSaveCurrentPlay();
                showFeedback(`Saved "${currentPlay.title}" to Playbook!`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs shadow-md border border-white transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5 fill-current" />
              <span>Save Current Board</span>
            </button>

            <button
              onClick={handleExportPlaybook}
              disabled={savedPlays.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all disabled:opacity-40"
              title="Export all saved plays as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <label className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
            </label>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all ml-1"
              title="Close Playbook"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {saveToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-bold flex items-center gap-2.5 shadow-xl animate-fade-in shrink-0">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{saveToast}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#0a0a0c] flex flex-col gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plays, actions, tactical concepts, tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.id);
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-white text-zinc-950 border-white shadow-md ring-1 ring-zinc-300'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-[#c4ced4]'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-zinc-200 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#08080a]">
          {filteredPlays.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500 shadow-xl">
                <FolderHeart className="w-7 h-7 text-[#c4ced4]" />
              </div>
              <h4 className="text-sm font-black uppercase text-zinc-200 tracking-wider mb-1">
                No Plays Found
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-4">
                {selectedCategory === 'all'
                  ? 'Your playbook is currently empty. Design plays on the board and click "Save Current Board" to build your custom coaching library.'
                  : `No plays found under "${CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}".`}
              </p>
              <button
                onClick={() => {
                  onSaveCurrentPlay();
                  showFeedback(`Saved "${currentPlay.title}" to Playbook!`);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Active Board Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlays.map(play => {
                const firstFrame = play.keyframes?.[0] || { pieces: [], ball: null, drawings: [] };
                return (
                  <div
                    key={play.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedPlay(play);
                    }}
                    className="bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/90 hover:border-[#c4ced4] rounded-2xl p-4 flex flex-col justify-between gap-3.5 transition-all hover:shadow-2xl cursor-pointer group hover:-translate-y-0.5 duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-zinc-800 text-[#c4ced4] border border-zinc-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md mb-1 tracking-wider">
                            {play.category} • {play.courtType} court
                          </span>
                          <h3 className="text-base font-black text-white group-hover:text-zinc-100 transition-colors truncate">
                            {play.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => handleExportSinglePlay(play, e)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            title="Download Play JSON"
                          >
                            <Download className="w-4 h-4" />
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
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="w-full max-w-[280px] mx-auto rounded-xl overflow-hidden border border-zinc-800 group-hover:border-zinc-700 bg-black transition-colors pointer-events-none my-1 shadow-inner">
                        <CourtThumbnail
                          pieces={firstFrame.pieces}
                          ball={firstFrame.ball}
                          drawings={firstFrame.drawings}
                          courtType={play.courtType}
                          className="w-full"
                        />
                      </div>

                      {play.description ? (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-2">
                          {play.description}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-600 italic mt-2">
                          {play.keyframes?.length || 1} phase{(play.keyframes?.length || 1) > 1 ? 's' : ''} diagrammed
                        </p>
                      )}

                      {play.tags && play.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2">
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
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          soundEffects.playClick();
                          setSelectedPlay(play);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-xs text-zinc-200 border border-zinc-700 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c4ced4]" />
                        <span>Inspect & Notes</span>
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          soundEffects.playWhistle();
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
              })}
            </div>
          )}
        </div>

        <div className="sm:hidden p-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center gap-2">
          <button
            onClick={handleExportPlaybook}
            disabled={savedPlays.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <label className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
          </label>
        </div>

      </div>
    </div>
  );
};
