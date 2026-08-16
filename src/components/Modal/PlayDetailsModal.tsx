import React from 'react';
import type { Play } from '../../types/play';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface PlayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
  onSaveDetails: (updatedPlay: Partial<Play>) => void;
}

export const PlayDetailsModal: React.FC<PlayDetailsModalProps> = ({
  isOpen,
  onClose,
  play,
  onSaveDetails,
}) => {
  const [title, setTitle] = React.useState(play.title);
  const [category, setCategory] = React.useState(play.category);
  const [description, setDescription] = React.useState(play.description);
  const [coachingPoints, setCoachingPoints] = React.useState<string[]>(
    play.coachingPoints || []
  );
  const [newPoint, setNewPoint] = React.useState('');
  const [tags, setTags] = React.useState<string[]>(play.tags || []);
  const [newTag, setNewTag] = React.useState('');

  if (!isOpen) return null;

  const handleAddCoachingPoint = () => {
    if (!newPoint.trim()) return;
    setCoachingPoints([...coachingPoints, newPoint.trim()]);
    setNewPoint('');
  };

  const handleRemoveCoachingPoint = (index: number) => {
    setCoachingPoints(coachingPoints.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();
    onSaveDetails({
      title,
      category,
      description,
      coachingPoints,
      tags,
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0c0d10] border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-black tracking-wider uppercase text-white">
            Play Details & Coaching Notes
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Play Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Tactical Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Play['category'])}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-zinc-400"
            >
              <option value="actions">Actions (Trigger / Concept)</option>
              <option value="offense">Offense Play</option>
              <option value="quick-hitter">Quick Hitter</option>
              <option value="defense">Defense Scheme</option>
              <option value="slob">Sideline Out of Bounds (SLOB)</option>
              <option value="blob">Baseline Out of Bounds (BLOB)</option>
              <option value="drill">Coaching Drill</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Description / Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe execution timing, key reads, and objectives..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Key Coaching Points List */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Key Coaching Points
            </label>
            <div className="flex flex-col gap-1.5 mb-2">
              {coachingPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-200"
                >
                  <span>• {point}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoachingPoint(index)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPoint}
                onChange={e => setNewPoint(e.target.value)}
                placeholder="Add coaching point..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={handleAddCoachingPoint}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] text-zinc-300"
                >
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag (e.g. Horns, PnR)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 text-xs font-black shadow-md border border-white"
            >
              <Save className="w-4 h-4 fill-current text-zinc-950" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
