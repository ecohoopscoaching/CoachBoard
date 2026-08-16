import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CoachBoard Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-4 text-[#c4ced4] shadow-2xl">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white mb-2">
            CoachBoard Loaded
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
            Click below to refresh the whiteboard canvas and restore active tactical session.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black transition-all shadow-xl"
            >
              Reload Whiteboard
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('coachboard_saved_plays_v2');
                } catch {
                  // ignore
                }
                window.location.hash = '';
                window.location.reload();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition-all"
            >
              Reset Session Cache
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
