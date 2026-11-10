import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Languages,
  Sparkles,
  Award,
} from 'lucide-react';
import { Topic, DifficultyLevel, UserProgress } from './types';
import { getDialoguesByTopic } from './dialoguesData';
import { getTopicStats } from './storage';

interface TopicViewProps {
  topic: Topic;
  progress: UserProgress;
  onBackToTopics: () => void;
  onSelectDialogue: (dialogueId: string) => void;
}

export const TopicView: React.FC<TopicViewProps> = ({
  topic,
  progress,
  onBackToTopics,
  onSelectDialogue,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | 'todos'>('todos');
  const [showTopicTranslation, setShowTopicTranslation] = useState(false);
  const [revealedDialogueTranslations, setRevealedDialogueTranslations] = useState<Record<string, boolean>>({});

  const allTopicDialogues = getDialoguesByTopic(topic.id);
  const topicStats = getTopicStats(topic.id, progress);

  const facilCount = allTopicDialogues.filter((d) => d.level === 'facil').length;
  const medioCount = allTopicDialogues.filter((d) => d.level === 'medio').length;
  const dificilCount = allTopicDialogues.filter((d) => d.level === 'dificil').length;

  const filteredDialogues = selectedLevel === 'todos'
    ? allTopicDialogues
    : allTopicDialogues.filter((d) => d.level === selectedLevel);

  const toggleDialogueTranslation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedDialogueTranslations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToTopics}
          className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-2xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
          <span>Volver a los temas</span>
        </button>

        <div className="flex items-center gap-2.5">
          {topicStats.isComplete && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-emerald-200 text-emerald-950 border border-emerald-400 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tema completado</span>
            </span>
          )}
          <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-full border-2 border-slate-300 shadow-xs">
            {topicStats.completed} de {topicStats.total} listos
          </span>
        </div>
      </div>

      {/* Topic Hero Card */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${topic.colorTheme.cardBg} bg-[#FFF8EF] border-2 border-amber-300 shadow-md relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white text-slate-800 border-2 border-amber-300 shadow-xs">
                Tema {topic.number}
              </span>
              <button
                type="button"
                onClick={() => setShowTopicTranslation((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-white hover:bg-sky-50 text-[#1D4ED8] border-2 border-sky-300 shadow-xs cursor-pointer transition-colors"
              >
                <Languages className="w-4 h-4" />
                <span className="font-armenian font-black">ՀԱՅ թարգմանություն</span>
              </button>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {topic.titleEs}
            </h2>

            {showTopicTranslation && (
              <div className="p-4 bg-white rounded-2xl border-2 border-sky-300 shadow-sm animate-in fade-in duration-150">
                <p className="text-xl font-black text-[#1D4ED8] font-armenian">
                  {topic.titleHy}
                </p>
                <p className="text-sm text-slate-700 font-armenian font-medium mt-1 leading-relaxed">
                  {topic.descriptionHy}
                </p>
              </div>
            )}

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              {topic.descriptionEs}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3.5 sm:pt-0 border-amber-300/80">
            <span className="text-xs sm:text-sm font-bold text-slate-600">Progreso del tema</span>
            <span className="text-3xl sm:text-4xl font-black text-[#1D4ED8]">
              {topicStats.percentage}%
            </span>
            <div className="w-32 h-2.5 bg-amber-200/90 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-[#FF7A00] to-[#1D4ED8] rounded-full transition-all duration-500"
                style={{ width: `${topicStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Level Filters with Actual Counts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-800">
            Niveles de dificultad
          </h3>
          <span className="text-xs sm:text-sm text-slate-600 font-medium">
            Elige un nivel o explora todos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedLevel('todos')}
            className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
              selectedLevel === 'todos'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-4 ring-slate-400/40'
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300 shadow-xs'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-wide opacity-80">Todos</div>
            <div className="text-lg font-black mt-0.5">5 diálogos</div>
            <div className="text-xs opacity-75 mt-0.5">A1, A2 y B1</div>
          </button>

          <button
            onClick={() => setSelectedLevel('facil')}
            className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
              selectedLevel === 'facil'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-4 ring-emerald-300'
                : 'bg-white text-slate-800 hover:bg-emerald-50/50 border-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide">Fácil · A1</span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${selectedLevel === 'facil' ? 'bg-white/25' : 'bg-emerald-200 text-emerald-950'}`}>
                {facilCount} tareas
              </span>
            </div>
            <div className="text-xs font-semibold mt-1 opacity-95">4–6 frases, 2–3 huecos</div>
          </button>

          <button
            onClick={() => setSelectedLevel('medio')}
            className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
              selectedLevel === 'medio'
                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md ring-4 ring-blue-300'
                : 'bg-white text-slate-800 hover:bg-blue-50/50 border-blue-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide">Medio · A2</span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${selectedLevel === 'medio' ? 'bg-white/25' : 'bg-blue-200 text-[#1D4ED8]'}`}>
                {medioCount} tareas
              </span>
            </div>
            <div className="text-xs font-semibold mt-1 opacity-95">6–8 frases, 4–5 huecos</div>
          </button>

          <button
            onClick={() => setSelectedLevel('dificil')}
            className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
              selectedLevel === 'dificil'
                ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md ring-4 ring-amber-300'
                : 'bg-white text-slate-800 hover:bg-amber-50/50 border-amber-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide">Difícil · B1</span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${selectedLevel === 'dificil' ? 'bg-white/25' : 'bg-amber-200 text-amber-950'}`}>
                {dificilCount} tarea
              </span>
            </div>
            <div className="text-xs font-semibold mt-1 opacity-95">8–10 frases, 5–7 huecos</div>
          </button>
        </div>
      </div>

      {/* Dialogues List */}
      <div className="space-y-3.5">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-800">
          Diálogos disponibles ({filteredDialogues.length})
        </h3>

        <div className="space-y-3">
          {filteredDialogues.map((dialogue, idx) => {
            const isCompleted = progress.completedDialogues[dialogue.id]?.completed;
            const result = progress.completedDialogues[dialogue.id];
            const isHyRevealed = !!revealedDialogueTranslations[dialogue.id];

            return (
              <div
                key={dialogue.id}
                onClick={() => onSelectDialogue(dialogue.id)}
                className={`p-5 sm:p-6 rounded-3xl border-2 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-lg ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400'
                    : 'bg-white border-amber-300 hover:border-[#FF7A00]'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-200 text-[#FF7A00]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 stroke-[2.5]" /> : idx + 1}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 hover:text-[#1D4ED8] transition-colors">
                        {dialogue.titleEs}
                      </h4>

                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                          dialogue.level === 'facil'
                            ? 'bg-emerald-200 text-emerald-950'
                            : dialogue.level === 'medio'
                            ? 'bg-blue-200 text-[#1D4ED8]'
                            : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        {dialogue.levelLabel} · {dialogue.level}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => toggleDialogueTranslation(dialogue.id, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 text-xs font-black transition-colors cursor-pointer ${
                          isHyRevealed
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                        title="Ver traducción armenia"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span className="font-armenian">ՀԱՅ</span>
                      </button>
                    </div>

                    {isHyRevealed && (
                      <div className="p-3.5 rounded-2xl bg-[#FFF8EF] border-2 border-amber-300 font-armenian animate-in fade-in duration-150">
                        <p className="text-base font-black text-[#1D4ED8]">
                          {dialogue.titleHy}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                          {dialogue.situationHy}
                        </p>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {dialogue.situationEs}
                    </p>

                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium pt-1">
                      <span>{dialogue.lines.length} réplicas</span>
                      <span>·</span>
                      <span className="text-[#FF7A00] font-black">{dialogue.blanks.length} huecos para rellenar</span>
                      {isCompleted && result && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-800 font-black inline-flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {result.firstAttemptScore}/{result.totalBlanks} aciertos
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDialogue(dialogue.id);
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-[#FF7A00] hover:bg-[#ea580c] text-white shadow-md'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isCompleted ? 'Repasar' : 'Comenzar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
