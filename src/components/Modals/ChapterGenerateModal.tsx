import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

interface ChapterGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextChapterNumber: number;
  onGenerateChapter: (chapterNumber: number, title: string, events: string, length: string) => void;
  isLoading: boolean;
}

export const ChapterGenerateModal: React.FC<ChapterGenerateModalProps> = ({
  isOpen,
  onClose,
  nextChapterNumber,
  onGenerateChapter,
  isLoading,
}) => {
  const [chapterNumber, setChapterNumber] = useState(nextChapterNumber);
  const [chapterTitle, setChapterTitle] = useState(`Chapter ${nextChapterNumber}: The Hidden Truth`);
  const [whatShouldHappen, setWhatShouldHappen] = useState('');
  const [desiredLength, setDesiredLength] = useState('Medium');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Generate Next Chapter
              </h3>
              <p className="text-xs text-slate-400">
                Advances the ongoing narrative with unbroken continuity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Chapter #:
              </label>
              <input
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Chapter Title:
              </label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="e.g. The Second Key"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              What should happen in this chapter? *
            </label>
            <textarea
              rows={3}
              value={whatShouldHappen}
              onChange={(e) => setWhatShouldHappen(e.target.value)}
              placeholder="e.g., The protagonist deciphers the clockwork mechanism and discovers a second entrance leading beneath the river..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Desired Chapter Length:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Short (~500 words)', 'Medium (~1000 words)', 'Long (~2000 words)'].map((l) => {
                const val = l.split(' ')[0];
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDesiredLength(val)}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                      desiredLength === val
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || !whatShouldHappen.trim()}
            onClick={() => onGenerateChapter(chapterNumber, chapterTitle, whatShouldHappen, desiredLength)}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isLoading ? 'Writing Chapter...' : 'Generate Chapter'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
