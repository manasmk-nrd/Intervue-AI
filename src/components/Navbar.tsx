import React from 'react';
import { Sparkles, History, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'setup' | 'history' | 'room' | 'results';
  onNavigate: (tab: 'landing' | 'dashboard' | 'setup' | 'history') => void;
  isSessionActive: boolean;
  onReturnToRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  isSessionActive,
  onReturnToRoom,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Intervue <span className="text-indigo-400">AI</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single-line, clean text hover underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'landing' ? 'text-white font-semibold underline underline-offset-8 decoration-indigo-500 decoration-2' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'dashboard' ? 'text-white font-semibold underline underline-offset-8 decoration-indigo-500 decoration-2' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'setup' ? 'text-white font-semibold underline underline-offset-8 decoration-indigo-500 decoration-2' : ''
            }`}
          >
            Configure
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'history' ? 'text-white font-semibold underline underline-offset-8 decoration-indigo-500 decoration-2' : ''
            }`}
          >
            Past Sessions
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isSessionActive && onReturnToRoom && activeTab !== 'room' ? (
            <button
              onClick={onReturnToRoom}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-neutral-750 transition-colors whitespace-nowrap shrink-0"
            >
              Resume Active Room
            </button>
          ) : null}
          <button
            onClick={() => onNavigate('setup')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Start Mock Interview</span>
          </button>
        </div>
      </div>
    </header>
  );
};
