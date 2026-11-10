import React from 'react';
import { Volume2, VolumeX, RotateCcw, Award, ChevronLeft } from 'lucide-react';
import { UserProgress } from './types';
import { getOverallProgressStats } from './storage';

interface NavbarProps {
  progress: UserProgress;
  onToggleSound: () => void;
  onRequestReset: () => void;
  onGoHome?: () => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onToggleSound,
  onRequestReset,
  onGoHome,
  showBackButton = false,
  backButtonLabel = 'Temas',
}) => {
  const { completed, total, percentage } = getOverallProgressStats(progress);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-3">
          {showBackButton && onGoHome ? (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm sm:text-base font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-2xl transition-colors cursor-pointer"
              title="Volver"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">{backButtonLabel}</span>
            </button>
          ) : null}

          <div
            onClick={onGoHome}
            className={`flex flex-col cursor-pointer ${showBackButton ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#0284C7] flex items-center justify-center text-white font-black text-lg shadow-sm">
                🇪🇸
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight flex items-center gap-2">
                  Habla español
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-[#FF7A00] font-black hidden sm:inline-block border border-amber-300">
                    A1–B1
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-armenian font-bold">
                  Խոսիր իսպաներեն · {total} երկխոսություն
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Overall Progress */}
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#FFF5E6] to-[#FFECCE] border-2 border-amber-300 px-3.5 py-2 rounded-full shadow-xs">
          <Award className="w-5 h-5 text-[#FF7A00]" />
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
            <span>{completed} / {total}</span>
            <span className="hidden sm:inline text-slate-600">completados</span>
            <div className="w-20 h-2.5 bg-amber-200/90 rounded-full overflow-hidden ml-1 hidden xs:block">
              <div
                className="h-full bg-gradient-to-r from-[#FF7A00] to-[#1D4ED8] transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm text-[#1D4ED8] font-black">({percentage}%)</span>
          </div>
        </div>

        {/* Right: Sound & Reset controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer shadow-2xs ${
              progress.soundEnabled
                ? 'bg-sky-100 text-[#1D4ED8] hover:bg-sky-200 border-2 border-sky-300'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-2 border-slate-300'
            }`}
            title={progress.soundEnabled ? 'Sonido activado (clic para silenciar)' : 'Sonido silenciado (clic para activar)'}
            aria-label="Alternar sonido"
          >
            {progress.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={onRequestReset}
            className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-2xl transition-colors cursor-pointer border-2 border-transparent hover:border-rose-300"
            title="Reiniciar progreso"
            aria-label="Reiniciar progreso"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
