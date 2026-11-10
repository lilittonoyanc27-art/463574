import { Dialogue, DifficultyLevel } from './types';
import { DIALOGUES_PART_1 } from './dialoguesData1';
import { DIALOGUES_PART_2 } from './dialoguesData2';
import { DIALOGUES_PART_3 } from './dialoguesData3';

export const ALL_DIALOGUES: Dialogue[] = [
  ...DIALOGUES_PART_1,
  ...DIALOGUES_PART_2,
  ...DIALOGUES_PART_3,
];

export function getDialoguesByTopic(topicId: string): Dialogue[] {
  return ALL_DIALOGUES.filter((d) => d.topicId === topicId);
}

export function getDialogueById(dialogueId: string): Dialogue | undefined {
  return ALL_DIALOGUES.find((d) => d.id === dialogueId);
}

export function getNextDialogue(currentId: string): Dialogue | undefined {
  const currentIndex = ALL_DIALOGUES.findIndex((d) => d.id === currentId);
  if (currentIndex === -1 || currentIndex === ALL_DIALOGUES.length - 1) {
    return undefined;
  }
  return ALL_DIALOGUES[currentIndex + 1];
}

export function getDialoguesByTopicAndLevel(topicId: string, level: DifficultyLevel): Dialogue[] {
  return ALL_DIALOGUES.filter((d) => d.topicId === topicId && d.level === level);
}
