import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Languages,
  Sparkles,
  Info,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Dialogue, UserProgress, WordBankItem } from './types';
import {
  recordDialogueCompletion,
  saveDraftAnswers,
  getDraftAnswers,
} from './storage';
import {
  playTapSound,
  playSuccessSound,
  playErrorSound,
  playFanfare,
} from './soundEffects';

interface DialogueScreenProps {
  dialogue: Dialogue;
  progress: UserProgress;
  onBackToTopic: () => void;
  onNextDialogue?: () => void;
  hasNextDialogue: boolean;
  onDialogueCompleted: (updatedProgress: UserProgress) => void;
}

type ValidationStatus = 'idle' | 'correct' | 'incorrect' | 'empty';

export const DialogueScreen: React.FC<DialogueScreenProps> = ({
  dialogue,
  progress,
  onBackToTopic,
  onNextDialogue,
  hasNextDialogue,
  onDialogueCompleted,
}) => {
  // Mapping: blankId -> wordBankItemId
  const [placedWords, setPlacedWords] = useState<Record<string, string>>(() => {
    return getDraftAnswers(dialogue.id);
  });

  // Active blank currently focused for filling
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);

  // Line translations expanded: lineId -> boolean
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});

  // Word translation tooltips: wordId -> boolean
  const [wordTranslationVisible, setWordTranslationVisible] = useState<Record<string, boolean>>({});

  // Validation results after clicking "Comprobar": blankId -> ValidationStatus
  const [validation, setValidation] = useState<Record<string, ValidationStatus>>({});

  // Has user completed the exercise
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Hint message state
  const [activeHint, setActiveHint] = useState<{ blankId: string; hintHy: string } | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  // First attempt tracking
  const [hasCheckedBefore, setHasCheckedBefore] = useState<boolean>(false);
  const [firstAttemptCorrectCount, setFirstAttemptCorrectCount] = useState<number>(0);

  // Tooltip notice if user taps a word before selecting a blank
  const [showSelectBlankNotice, setShowSelectBlankNotice] = useState<boolean>(false);

  // Word bank shuffled stable order per dialogue session
  const shuffledWordBank = useMemo(() => {
    const list = [...dialogue.wordBank];
    // Fisher-Yates shuffle with fixed pseudo-randomness or standard shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [dialogue.id]);

  // Set initial active blank to the first unfilled blank
  useEffect(() => {
    const saved = getDraftAnswers(dialogue.id);
    setPlacedWords(saved);
    setValidation({});
    setIsCompleted(false);
    setActiveHint(null);
    setHintsUsedCount(0);
    setHasCheckedBefore(false);
    setFirstAttemptCorrectCount(0);
    setExpandedLines({});
    setWordTranslationVisible({});

    // Find first unfilled blank
    const firstUnfilled = dialogue.blanks.find((b) => !saved[b.id]);
    if (firstUnfilled) {
      setActiveBlankId(firstUnfilled.id);
    } else if (dialogue.blanks.length > 0) {
      setActiveBlankId(dialogue.blanks[0].id);
    }
  }, [dialogue.id]);

  // Save drafts when placedWords changes
  useEffect(() => {
    if (!isCompleted) {
      saveDraftAnswers(dialogue.id, placedWords, dialogue.topicId, dialogue.level);
    }
  }, [placedWords, dialogue.id, dialogue.topicId, dialogue.level, isCompleted]);

  // Helper map from wordBankItemId to WordBankItem
  const wordItemById = useMemo(() => {
    const map = new Map<string, WordBankItem>();
    dialogue.wordBank.forEach((w) => map.set(w.id, w));
    return map;
  }, [dialogue.wordBank]);

  // Set of word ids currently in use on the board
  const usedWordIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(placedWords).forEach((wId) => {
      if (wId) set.add(wId);
    });
    return set;
  }, [placedWords]);

  // Handle clicking a blank
  const handleBlankClick = (blankId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Do NOT toggle speech bubble Armenian translation!
    playTapSound(progress.soundEnabled);

    // If already filled, remove word and return to bank, making this blank active
    if (placedWords[blankId]) {
      setPlacedWords((prev) => {
        const next = { ...prev };
        delete next[blankId];
        return next;
      });
      // Clear validation state for this blank
      setValidation((prev) => ({ ...prev, [blankId]: 'idle' }));
    }

    setActiveBlankId(blankId);
    setShowSelectBlankNotice(false);
    setActiveHint(null);
  };

  // Handle clicking a word in the word bank
  const handleWordSelect = (wordItem: WordBankItem) => {
    // If word is already placed, ignore
    if (usedWordIds.has(wordItem.id)) return;

    playTapSound(progress.soundEnabled);

    // Determine target blank: activeBlankId or next unfilled blank
    let targetBlankId = activeBlankId;
    if (!targetBlankId || placedWords[targetBlankId]) {
      const nextEmpty = dialogue.blanks.find((b) => !placedWords[b.id]);
      if (nextEmpty) {
        targetBlankId = nextEmpty.id;
      }
    }

    if (!targetBlankId) {
      setShowSelectBlankNotice(true);
      setTimeout(() => setShowSelectBlankNotice(false), 2500);
      return;
    }

    // Insert word into target blank
    setPlacedWords((prev) => ({
      ...prev,
      [targetBlankId!]: wordItem.id,
    }));

    // Reset validation for this blank
    setValidation((prev) => ({ ...prev, [targetBlankId!]: 'idle' }));
    setActiveHint(null);

    // Auto-advance active blank to the next empty blank!
    const remainingEmpty = dialogue.blanks.find(
      (b) => b.id !== targetBlankId && !placedWords[b.id]
    );
    if (remainingEmpty) {
      setActiveBlankId(remainingEmpty.id);
    } else {
      setActiveBlankId(null);
    }
  };

  // Toggle speech bubble Armenian translation
  const handleLineClick = (lineId: string) => {
    playTapSound(progress.soundEnabled);
    setExpandedLines((prev) => ({
      ...prev,
      [lineId]: !prev[lineId],
    }));
  };

  // Toggle individual word translation tooltip without inserting it
  const handleToggleWordTranslation = (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound(progress.soundEnabled);
    setWordTranslationVisible((prev) => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
  };

  // Check answers
  const handleCheckAnswers = () => {
    let allFilled = true;
    let correctCount = 0;
    const newValidation: Record<string, ValidationStatus> = {};

    dialogue.blanks.forEach((blank) => {
      const placedWordId = placedWords[blank.id];
      if (!placedWordId) {
        allFilled = false;
        newValidation[blank.id] = 'empty';
      } else {
        const item = wordItemById.get(placedWordId);
        const isMatch = item && item.word.trim().toLowerCase() === blank.correctWord.trim().toLowerCase();
        if (isMatch) {
          newValidation[blank.id] = 'correct';
          correctCount++;
        } else {
          newValidation[blank.id] = 'incorrect';
        }
      }
    });

    setValidation(newValidation);

    // Track first attempt stats
    if (!hasCheckedBefore) {
      setHasCheckedBefore(true);
      setFirstAttemptCorrectCount(correctCount);
    }

    const isAllCorrect = correctCount === dialogue.blanks.length;

    if (isAllCorrect) {
      setIsCompleted(true);
      playSuccessSound(progress.soundEnabled);
      setTimeout(() => playFanfare(progress.soundEnabled), 200);

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF922B', '#59C9F5', '#185ADB', '#10B981'],
        });
      } catch (e) {}

      // Record progress in storage
      const updated = recordDialogueCompletion(
        dialogue.id,
        {
          completed: true,
          firstAttemptScore: hasCheckedBefore ? firstAttemptCorrectCount : correctCount,
          totalBlanks: dialogue.blanks.length,
          hintsUsed: hintsUsedCount,
          timestamp: Date.now(),
        },
        dialogue.topicId,
        dialogue.level
      );
      onDialogueCompleted(updated);
    } else {
      playErrorSound(progress.soundEnabled);
      // If there are unfilled or incorrect blanks, activate the first one
      const firstFixable = dialogue.blanks.find(
        (b) => newValidation[b.id] === 'empty' || newValidation[b.id] === 'incorrect'
      );
      if (firstFixable) {
        setActiveBlankId(firstFixable.id);
      }
    }
  };

  // Provide a hint for active blank
  const handleRequestHint = () => {
    playTapSound(progress.soundEnabled);
    let targetId = activeBlankId;

    if (!targetId) {
      // Pick first unfilled or incorrect blank
      const firstTarget = dialogue.blanks.find(
        (b) => !placedWords[b.id] || validation[b.id] === 'incorrect'
      );
      targetId = firstTarget ? firstTarget.id : dialogue.blanks[0].id;
      setActiveBlankId(targetId);
    }

    const blankDef = dialogue.blanks.find((b) => b.id === targetId);
    if (blankDef) {
      setActiveHint({
        blankId: targetId,
        hintHy: blankDef.hintHy,
      });
      setHintsUsedCount((prev) => prev + 1);
    }
  };

  // Reset dialogue exercise
  const handleRetry = () => {
    playTapSound(progress.soundEnabled);
    setPlacedWords({});
    setValidation({});
    setIsCompleted(false);
    setActiveHint(null);
    setExpandedLines({});
    if (dialogue.blanks.length > 0) {
      setActiveBlankId(dialogue.blanks[0].id);
    }
  };

  // Helper to render text with interactive blanks
  const renderLineWithBlanks = (textEs: string) => {
    // Splits by {{b1}}, {{b2}}, etc.
    const parts = textEs.split(/(\{\{b\d+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{(b\d+)\}\}/);
      if (!match) {
        return <span key={index}>{part}</span>;
      }

      const blankId = match[1];
      const isSelected = activeBlankId === blankId;
      const placedWordId = placedWords[blankId];
      const wordItem = placedWordId ? wordItemById.get(placedWordId) : null;
      const status = validation[blankId] || 'idle';

      // Determine styling according to state
      let styleClasses = 'inline-flex items-center justify-center transition-all duration-150 rounded-2xl px-4 py-1.5 mx-1.5 my-1 text-base sm:text-lg font-black min-w-[105px] h-11 align-middle cursor-pointer ';

      if (status === 'correct') {
        styleClasses += 'bg-emerald-100 text-emerald-950 border-2 border-emerald-600 shadow-sm ring-2 ring-emerald-300';
      } else if (status === 'incorrect') {
        styleClasses += 'bg-rose-100 text-rose-950 border-2 border-rose-600 shadow-sm ring-2 ring-rose-300 animate-shake';
      } else if (status === 'empty') {
        styleClasses += 'bg-amber-100 text-amber-950 border-2 border-dashed border-amber-600 shadow-sm ring-2 ring-amber-300';
      } else if (isSelected) {
        styleClasses += 'bg-sky-100 text-[#1D4ED8] border-3 border-[#1D4ED8] shadow-md ring-4 ring-sky-300/80 scale-105';
      } else if (placedWordId) {
        styleClasses += 'bg-[#FFF3DC] text-slate-900 border-2 border-amber-400 shadow-xs hover:border-[#1D4ED8]';
      } else {
        styleClasses += 'bg-white text-slate-500 border-2 border-dashed border-slate-300 hover:border-slate-500 shadow-xs';
      }

      return (
        <button
          key={blankId}
          type="button"
          onClick={(e) => handleBlankClick(blankId, e)}
          className={styleClasses}
          title={placedWordId ? 'Haz clic para devolver la palabra al banco' : 'Haz clic para seleccionar este hueco'}
          aria-label={`Hueco ${blankId}`}
        >
          {wordItem ? (
            <span className="flex items-center gap-1.5">
              <span>{wordItem.word}</span>
              {status === 'correct' && <Check className="w-5 h-5 text-emerald-600 stroke-[3.5]" />}
              {status === 'incorrect' && <X className="w-5 h-5 text-rose-600 stroke-[3.5]" />}
              {status === 'idle' && (
                <span className="text-xs text-slate-500 hover:text-slate-800 font-bold">✕</span>
              )}
            </span>
          ) : (
            <span className="text-sm font-black tracking-widest text-slate-400">
              {status === 'empty' ? '¡Rellena!' : '______'}
            </span>
          )}
        </button>
      );
    });
  };

  const totalBlanks = dialogue.blanks.length;
  const filledCount = Object.keys(placedWords).filter((k) => placedWords[k]).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToTopic}
          className="inline-flex items-center gap-2 px-4 py-2 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
          <span>Volver al tema</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs ${
              dialogue.level === 'facil'
                ? 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                : dialogue.level === 'medio'
                ? 'bg-blue-200 text-[#1D4ED8] border border-blue-400'
                : 'bg-amber-200 text-amber-950 border border-amber-400'
            }`}
          >
            {dialogue.levelLabel} · {dialogue.level}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 bg-white px-3.5 py-1.5 rounded-full border border-slate-300 shadow-xs">
            {filledCount} de {totalBlanks} huecos
          </span>
        </div>
      </div>

      {/* Situation & Instruction card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{dialogue.titleEs}</span>
              <span className="text-base font-bold text-slate-400">#{dialogue.numberInTopic}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium mt-1">
              {dialogue.situationEs}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-xs sm:text-sm font-black text-amber-950 self-start sm:self-center shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            <span>Completa el diálogo con las palabras del banco</span>
          </div>
        </div>

        {/* Dual-language tip banner as required */}
        <div className="mt-2 pt-3 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm sm:text-base text-slate-700">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-6 h-6 rounded-full bg-sky-200 text-[#1D4ED8] flex items-center justify-center font-black text-xs">
              ℹ
            </span>
            <span>Toca una frase para ver la traducción.</span>
          </div>
          <p className="font-armenian font-bold text-[#1D4ED8] sm:text-right">
            Սեղմիր նախադասության վրա՝ հայերեն թարգմանությունը տեսնելու համար։
          </p>
        </div>
      </div>

      {/* Main dialogue & Word bank layout (responsive 2-col on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Conversation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-4">
            {dialogue.lines.map((line) => {
              const isSpeakerA = line.role === 'A';
              const isExpanded = !!expandedLines[line.id];

              return (
                <div
                  key={line.id}
                  className={`flex flex-col ${isSpeakerA ? 'items-start' : 'items-end'} w-full`}
                >
                  {/* Speaker Label */}
                  <div
                    className={`flex items-center gap-2 text-xs sm:text-sm font-black text-slate-700 mb-1.5 px-1.5 ${
                      isSpeakerA ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <span className="text-base">{line.avatarEmoji}</span>
                    <span>{line.speaker}</span>
                    {line.speakerHy && (
                      <span className="text-xs text-slate-500 font-armenian font-semibold">
                        ({line.speakerHy})
                      </span>
                    )}
                  </div>

                  {/* Speech Bubble */}
                  <div
                    onClick={() => handleLineClick(line.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleLineClick(line.id);
                      }
                    }}
                    className={`relative max-w-[94%] sm:max-w-[88%] rounded-3xl p-5 sm:p-6 shadow-md transition-all cursor-pointer border-2 ${
                      isSpeakerA
                        ? 'bg-gradient-to-br from-[#FFF5E6] to-[#FFE7C4] border-amber-300 text-slate-900 rounded-tl-sm hover:border-[#FF7A00]'
                        : 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] border-sky-300 text-slate-900 rounded-tr-sm hover:border-[#1D4ED8]'
                    }`}
                    title="Haz clic para ver/ocultar traducción armenia"
                  >
                    {/* Spanish text with blanks */}
                    <div className="text-lg sm:text-xl md:text-[21px] leading-relaxed text-slate-900 font-normal">
                      {renderLineWithBlanks(line.textEs)}
                    </div>

                    {/* Armenian Translation Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-300/70 font-armenian text-base sm:text-lg font-semibold text-[#1D4ED8] bg-white/90 p-3.5 rounded-2xl border-2 border-sky-300 shadow-sm animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-500 font-sans mb-1 font-bold">
                          <span>Հայերեն թարգմանություն</span>
                          <span className="text-[11px] text-slate-400">կտտացրեք փակելու համար</span>
                        </div>
                        <p className="leading-relaxed text-slate-900">
                          {line.textHy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Word Bank & Controls (Sticky on Desktop) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          {/* Active Blank Prompt Notice */}
          {showSelectBlankNotice && (
            <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 text-sm font-black flex items-center gap-2.5 animate-bounce shadow-sm">
              <Info className="w-5 h-5 text-[#FF7A00] shrink-0" />
              <span>Selecciona un hueco en el diálogo antes de pulsar la palabra.</span>
            </div>
          )}

          {/* Hint Card (When requested) */}
          {activeHint && (
            <div className="p-4 rounded-2xl bg-indigo-100 border-2 border-indigo-300 text-indigo-950 text-sm shadow-sm space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-black text-[#1D4ED8]">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600 fill-amber-500" />
                  <span>Pista para el hueco</span>
                </span>
                <button
                  onClick={() => setActiveHint(null)}
                  className="text-slate-500 hover:text-slate-800 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="font-armenian font-black text-base sm:text-lg text-slate-900 pt-1">
                Իմաստը հայերեն՝ «{activeHint.hintHy}»
              </p>
              <p className="text-xs text-slate-700 font-medium">
                Busca en el banco de palabras el término que coincida con este significado.
              </p>
            </div>
          )}

          {/* Word Bank Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFF5E6] to-[#FFECCE] border-2 border-amber-300 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF7A00]" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  Banco de palabras
                </h3>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                {dialogue.wordBank.length - usedWordIds.size} libres
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Pulsa un hueco y luego toca una palabra para colocarla. Toca <span className="font-armenian font-black text-[#1D4ED8]">ՀԱՅ</span> para ver el significado.
            </p>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {shuffledWordBank.map((item) => {
                const isUsed = usedWordIds.has(item.id);
                const isTranslationOpen = !!wordTranslationVisible[item.id];

                return (
                  <div key={item.id} className="relative inline-flex items-center">
                    <button
                      type="button"
                      disabled={isUsed || isCompleted}
                      onClick={() => handleWordSelect(item)}
                      className={`group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-base sm:text-lg font-black transition-all shadow-xs cursor-pointer ${
                        isUsed
                          ? 'bg-slate-200 text-slate-400 line-through cursor-not-allowed border-2 border-slate-300'
                          : 'bg-white hover:bg-[#FF7A00] text-slate-900 hover:text-white border-2 border-amber-400 hover:border-[#FF7A00] active:scale-95 shadow-sm'
                      }`}
                      title={isUsed ? 'Palabra ya colocada en el diálogo' : `Colocar "${item.word}"`}
                    >
                      <span>{item.word}</span>
                    </button>

                    {/* Word Translation Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWordTranslation(item.id, e)}
                      className={`ml-1 px-2 py-2 rounded-xl border-2 text-xs font-black transition-colors cursor-pointer ${
                        isTranslationOpen
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                          : 'bg-white hover:bg-sky-50 text-[#1D4ED8] border-sky-300'
                      }`}
                      title="Ver traducción armenia de esta palabra"
                    >
                      <span className="font-armenian text-xs">ՀԱՅ</span>
                    </button>

                    {/* Floating Armenian Word Definition Popover */}
                    {isTranslationOpen && (
                      <div className="absolute bottom-full left-0 mb-2 z-20 w-48 p-3 rounded-2xl bg-slate-950 text-white text-sm shadow-xl font-armenian animate-in fade-in duration-150 border border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                          <span className="font-sans font-black">{item.word}</span>
                          <button
                            onClick={(e) => handleToggleWordTranslation(item.id, e)}
                            className="text-slate-400 hover:text-white text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="font-bold text-[#38BDF8] text-sm">
                          {item.translationHy}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-300 shadow-md space-y-3.5">
            {!isCompleted ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckAnswers}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#1D4ED8] hover:opacity-95 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  <span>Comprobar</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="py-3 px-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm border-2 border-amber-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-5 h-5 text-[#FF7A00]" />
                    <span>Pista</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-2 border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5 text-slate-600" />
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Success Celebration Banner */
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center shadow-lg space-y-1.5">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-1">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                    ¡Muy bien! Has completado el diálogo
                  </h4>
                  <p className="font-armenian text-sm text-emerald-100 font-bold">
                    Հիանալի է։ Դուք հաջողությամբ ավարտեցիք երկխոսությունը։
                  </p>
                  <div className="pt-2.5 mt-2 border-t border-white/25 text-sm flex justify-around font-bold text-emerald-50">
                    <div>
                      <span>Aciertos primer intento: </span>
                      <strong className="text-white text-base">{firstAttemptCorrectCount} / {dialogue.blanks.length}</strong>
                    </div>
                    <div>
                      <span>Pistas usadas: </span>
                      <strong className="text-white text-base">{hintsUsedCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {hasNextDialogue && onNextDialogue && (
                    <button
                      type="button"
                      onClick={onNextDialogue}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-black text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Siguiente diálogo</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-2 border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-5 h-5 text-slate-600" />
                      <span>Repetir diálogo</span>
                    </button>

                    <button
                      type="button"
                      onClick={onBackToTopic}
                      className="py-3 px-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm border-2 border-amber-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Volver a los temas</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
