import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Hotel,
  Plane,
  Palmtree,
  Compass,
  ShoppingCart,
  Coffee,
  Train,
  Car,
  ShoppingBag,
  PlusCircle,
  Users,
  CheckCircle2,
  Languages,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Topic, UserProgress } from './types';
import { getTopicStats } from './storage';

interface TopicCardProps {
  topic: Topic;
  progress: UserProgress;
  onSelectTopic: (topicId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Hotel,
  Plane,
  Palmtree,
  Compass,
  ShoppingCart,
  Coffee,
  Train,
  Car,
  ShoppingBag,
  Cross: PlusCircle,
  Users,
};

export const TopicCard: React.FC<TopicCardProps> = ({ topic, progress, onSelectTopic }) => {
  const [showArmenian, setShowArmenian] = useState(false);
  const stats = getTopicStats(topic.id, progress);
  const IconComponent = ICON_MAP[topic.iconName] || Compass;

  const handleToggleTranslation = (e: React.MouseEvent) => {
    e.stopPropagation(); // Do not trigger topic navigation!
    setShowArmenian((prev) => !prev);
  };

  return (
    <div
      onClick={() => onSelectTopic(topic.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelectTopic(topic.id);
        }
      }}
      className={`group relative text-left bg-gradient-to-br ${topic.colorTheme.cardBg} bg-[#FFF8EF] rounded-3xl p-6 border-2 ${
        stats.isComplete ? 'border-emerald-400 ring-4 ring-emerald-200/60' : 'border-amber-300 hover:border-[#FF7A00]'
      } shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between`}
    >
      <div>
        {/* Top bar: Number badge, Icon, Translation toggle & Completion pill */}
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex items-center gap-3">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: topic.colorTheme.accent }}
            >
              <IconComponent className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                Tema {topic.number}
              </span>
              <div className="text-sm font-bold text-slate-800">
                5 diálogos (A1–B1)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stats.isComplete && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-200 text-emerald-950 border border-emerald-400 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completado</span>
              </span>
            )}

            {/* Translation Button: Isolated from card click */}
            <button
              type="button"
              onClick={handleToggleTranslation}
              className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-black flex items-center gap-1 transition-colors cursor-pointer shadow-xs ${
                showArmenian
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                  : 'bg-white hover:bg-sky-50 text-[#1D4ED8] border-sky-300'
              }`}
              title={showArmenian ? 'Ocultar traducción armenia' : 'Ver traducción en armenio'}
              aria-label="Ver traducción armenia"
            >
              <Languages className="w-4 h-4" />
              <span className="font-armenian font-black text-xs">ՀԱՅ</span>
            </button>
          </div>
        </div>

        {/* Title in Spanish */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#1D4ED8] transition-colors mb-1.5 leading-snug">
          {topic.titleEs}
        </h3>

        {/* Translation Drawer (Revealed smoothly on demand) */}
        {showArmenian && (
          <div className="mt-2.5 mb-2.5 p-3.5 rounded-2xl bg-white border-2 border-sky-300 shadow-sm animate-in fade-in duration-150">
            <p className="text-base sm:text-lg font-black text-[#1D4ED8] font-armenian leading-relaxed">
              {topic.titleHy}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 font-armenian font-semibold mt-1 leading-relaxed">
              {topic.descriptionHy}
            </p>
          </div>
        )}

        {/* Description in Spanish */}
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mt-1">
          {topic.descriptionEs}
        </p>
      </div>

      {/* Footer: Progress bar and action button */}
      <div className="mt-5 pt-3.5 border-t border-amber-300/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-24 h-2 bg-amber-200/80 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                stats.isComplete ? 'bg-emerald-600' : 'bg-[#FF7A00]'
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            {stats.completed}/{stats.total}
          </span>
        </div>

        <span className="inline-flex items-center text-xs sm:text-sm font-black text-[#1D4ED8] group-hover:translate-x-1 transition-transform">
          <span>{stats.completed > 0 && stats.completed < stats.total ? 'Continuar' : 'Empezar'}</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </span>
      </div>
    </div>
  );
};
