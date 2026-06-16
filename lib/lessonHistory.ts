import { Slide } from "@/components/SlideViewer";

export interface SavedLesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  sols: string[];
  disabilityTypes: string[];
  className?: string;
  lessonContent: string;
  slides: Slide[];
  createdAt: number; // timestamp
  daysGenerated?: number; // how many day-sessions in this plan
}

const STORAGE_KEY = "ieprep_lesson_history";
const MAX_LESSONS = 20;

export function saveLessonToHistory(lesson: Omit<SavedLesson, "id" | "createdAt">): SavedLesson {
  const savedLesson: SavedLesson = {
    ...lesson,
    id: `lesson_${Date.now()}`,
    createdAt: Date.now(),
  };

  const history = getLessonHistory();
  history.unshift(savedLesson);

  // Keep only the most recent MAX_LESSONS
  if (history.length > MAX_LESSONS) {
    history.splice(MAX_LESSONS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save lesson to history (localStorage full?):", e);
  }

  return savedLesson;
}

export function getLessonHistory(): SavedLesson[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Failed to read lesson history:", e);
    return [];
  }
}

export function getLessonById(id: string): SavedLesson | null {
  const history = getLessonHistory();
  return history.find(l => l.id === id) || null;
}

export function deleteLessonFromHistory(id: string): void {
  const history = getLessonHistory();
  const filtered = history.filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to delete lesson:", e);
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
