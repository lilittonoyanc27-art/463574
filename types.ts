export type DifficultyLevel = 'facil' | 'medio' | 'dificil';

export interface Topic {
  id: string;
  number: number;
  titleEs: string;
  titleHy: string;
  descriptionEs: string;
  descriptionHy: string;
  iconName: string; // Lucide icon identifier
  colorTheme: {
    badgeBg: string;
    badgeText: string;
    accent: string;
    border: string;
    cardBg: string;
  };
}

export interface BlankDefinition {
  id: string; // e.g., 'b1', 'b2'
  correctWord: string; // The exact expected word
  hintHy: string; // Armenian hint shown when user requests hint
  grammarTipEs?: string; // Optional Spanish hint
}

export interface DialogueLine {
  id: string;
  speaker: string; // e.g. "Camarero", "Cliente"
  speakerHy?: string; // e.g. "Մատուցող", "Հաճախորդ"
  role: 'A' | 'B'; // 'A' left, 'B' right
  avatarEmoji: string;
  textEs: string; // Contains placeholders like {{b1}}, {{b2}}
  textHy: string; // Full Armenian translation of this sentence
}

export interface WordBankItem {
  id: string; // Unique instance id e.g. 'w1', 'w2'
  word: string;
  translationHy: string; // Armenian translation of the word
  isDistractor?: boolean;
}

export interface Dialogue {
  id: string;
  topicId: string;
  numberInTopic: number; // 1 to 5
  level: DifficultyLevel;
  levelLabel: 'A1' | 'A2' | 'B1';
  titleEs: string;
  titleHy: string;
  situationEs: string;
  situationHy: string;
  lines: DialogueLine[];
  blanks: BlankDefinition[];
  wordBank: WordBankItem[];
}

export interface DialogueResult {
  completed: boolean;
  firstAttemptScore: number; // Number of correct blanks on first check
  totalBlanks: number;
  hintsUsed: number;
  timestamp: number;
}

export interface UserProgress {
  completedDialogues: Record<string, DialogueResult>; // key: dialogueId
  lastTopicId?: string;
  lastLevel?: DifficultyLevel;
  lastDialogueId?: string;
  draftAnswers: Record<string, Record<string, string>>; // dialogueId -> { blankId: wordBankItemId }
  soundEnabled: boolean;
}
