import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  Play,
  RotateCcw,
  Compass,
  CheckCircle2,
  ChevronRight,
  Languages,
} from 'lucide-react';
import { TOPICS } from './topicsData';
import { ALL_DIALOGUES, getDialogueById, getNextDialogue } from './dialoguesData';
import {
  loadProgress,
  saveProgress,
  resetAllProgress,
  getOverallProgressStats,
} from './storage';
import { UserProgress, Topic, Dialogue } from './types';
import { Navbar } from './Navbar';
import { TopicCard } from './TopicCard';
import { TopicView } from './TopicView';
import { DialogueScreen } from './DialogueScreen';
import { ResetConfirmModal } from './ResetConfirmModal';

type AppView = 'topics' | 'topic-detail' | 'dialogue';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [view, setView] = useState<AppView>('topics');
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [currentDialogueId, setCurrentDialogueId] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Synchronize progress
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleToggleSound = () => {
    const updated: UserProgress = {
      ...progress,
      soundEnabled: !progress.soundEnabled,
    };
    setProgress(updated);
    saveProgress(updated);
  };

  const handleConfirmReset = () => {
    const fresh = resetAllProgress();
    setProgress(fresh);
    setIsResetModalOpen(false);
    setView('topics');
  };

  const handleSelectTopic = (topicId: string) => {
    setCurrentTopicId(topicId);
    setView('topic-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDialogue = (dialogueId: string) => {
    const dialogue = getDialogueById(dialogueId);
    if (dialogue) {
      setCurrentDialogueId(dialogueId);
      setCurrentTopicId(dialogue.topicId);
      setView('dialogue');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoHome = () => {
    setView('topics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextDialogue = () => {
    if (!currentDialogueId) return;
    const next = getNextDialogue(currentDialogueId);
    if (next) {
      setCurrentDialogueId(next.id);
      setCurrentTopicId(next.topicId);
      setView('dialogue');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('topics');
    }
  };

  // Find next uncompleted dialogue for quick "Continuar" button
  const nextUncompletedDialogue = ALL_DIALOGUES.find(
    (d) => !progress.completedDialogues[d.id]?.completed
  );

  const currentTopic = TOPICS.find((t) => t.id === currentTopicId);
  const currentDialogue = currentDialogueId ? getDialogueById(currentDialogueId) : undefined;
  const hasNext = currentDialogueId ? !!getNextDialogue(currentDialogueId) : false;
  const stats = getOverallProgressStats(progress);

  return (
    <div className="min-h-screen bg-travel-pattern flex flex-col selection:bg-[#ff922b]/25 selection:text-[#185adb]">
      {/* Top Navigation */}
      <Navbar
        progress={progress}
        onToggleSound={handleToggleSound}
        onRequestReset={() => setIsResetModalOpen(true)}
        onGoHome={handleGoHome}
        showBackButton={view !== 'topics'}
        backButtonLabel={view === 'dialogue' ? 'Tema' : 'Temas'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: TOPICS LIST (Home) */}
        {view === 'topics' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-10">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden p-7 sm:p-11 bg-gradient-to-br from-[#FFF5E6] via-[#FFF3DC] to-amber-200/60 border-2 border-amber-300 shadow-md">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-300 shadow-xs text-xs sm:text-sm font-black text-[#FF7A00]">
                  <Sparkles className="w-4 h-4" />
                  <span>Método interactivo de inmersión en diálogos cotidianos</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  Habla español <br />
                  <span className="text-[#1D4ED8] font-armenian font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                    Խոսիր իսպաներեն
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
                  Aprende español real a través de diálogos cotidianos de España con traducción natural al armenio. Completa los huecos con el banco de palabras y domina 11 temas esenciales de viajes y convivencia.
                </p>

                <p className="font-armenian text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                  Կարդա իրական խոսակցական երկխոսությունները, լրացրու բաց թողնված բառերը և ուսումնասիրիր հայերեն թարգմանությունները մեկ հպումով։
                </p>

                {/* Quick Start / Continue CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  {nextUncompletedDialogue ? (
                    <button
                      onClick={() => handleSelectDialogue(nextUncompletedDialogue.id)}
                      className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#1D4ED8] hover:opacity-95 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{stats.completed > 0 ? 'Continuar aprendiendo' : 'Empezar primer diálogo'}</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-black text-base">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
                      <span>¡Felicidades! Has completado todos los 55 diálogos.</span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-amber-300 text-sm font-black text-slate-800 shadow-2xs">
                    <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
                    <span>55 diálogos · 11 temas · Niveles A1–B1</span>
                  </div>
                </div>
              </div>

              {/* Decorative background accent */}
              <div className="absolute -right-8 -bottom-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#38BDF8]/30 to-[#FF7A00]/30 blur-3xl pointer-events-none" />
            </div>

            {/* Topics Section */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Temas de conversación
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 font-semibold mt-0.5">
                    11 situaciones esenciales para viajar y comunicarte con fluidez
                  </p>
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-800 bg-white px-4 py-2 rounded-full border-2 border-amber-300 self-start sm:self-auto shadow-xs">
                  {stats.completed} de {stats.total} diálogos completados ({stats.percentage}%)
                </div>
              </div>

              {/* Grid of 11 Topics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {TOPICS.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    progress={progress}
                    onSelectTopic={handleSelectTopic}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TOPIC LEVEL SELECTION & DIALOGUES */}
        {view === 'topic-detail' && currentTopic && (
          <TopicView
            topic={currentTopic}
            progress={progress}
            onBackToTopics={handleGoHome}
            onSelectDialogue={handleSelectDialogue}
          />
        )}

        {/* VIEW 3: INTERACTIVE DIALOGUE EXERCISE */}
        {view === 'dialogue' && currentDialogue && (
          <DialogueScreen
            dialogue={currentDialogue}
            progress={progress}
            onBackToTopic={() => setView('topic-detail')}
            onNextDialogue={handleNextDialogue}
            hasNextDialogue={hasNext}
            onDialogueCompleted={(updated) => setProgress(updated)}
          />
        )}
      </main>

      {/* Confirmation Modal for Resetting Progress */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Footer */}
      <footer className="border-t-2 border-amber-200 bg-white/80 py-8 text-center text-sm text-slate-600 font-semibold space-y-1.5">
        <p>Habla español — Խոսիր իսպաներեն · Curso práctico interactivo</p>
        <p className="font-armenian text-slate-500">
          Իսպաներենի ուսուցում հայերեն թարգմանությամբ · 55 երկխոսություն · 11 թեմա
        </p>
      </footer>
    </div>
  );
}
