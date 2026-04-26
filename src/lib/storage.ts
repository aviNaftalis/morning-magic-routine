import type { Lang } from "./i18n";

export type ItemStatus = "none" | "help" | "alone";
export type RoutineKey = "morning" | "evening";

export interface ChecklistItem {
  id: string;
  labelEn: string;
  labelHe: string;
  icon: string;
  status: ItemStatus;
}

export interface RoutineState {
  items: ChecklistItem[];
  bonusAwarded: "none" | "all" | "champion";
  date: string; // YYYY-MM-DD
}

export interface AppState {
  lang: Lang;
  morning: RoutineState;
  evening: RoutineState;
  totals: { today: number; best: number; streak: number; lastDate: string | null };
}

const KEY = "getready.state.v1";

const today = () => new Date().toISOString().slice(0, 10);

export const POINTS = { help: 1, alone: 2 };
export const BONUS = { all: 3, champion: 10 };

const defaultMorning: ChecklistItem[] = [
  { id: "m1", labelEn: "Get out of bed", labelHe: "לקום מהמיטה", icon: "bed", status: "none" },
  { id: "m2", labelEn: "Use the toilet", labelHe: "ללכת לשירותים", icon: "toilet", status: "none" },
  { id: "m3", labelEn: "Brush teeth", labelHe: "לצחצח שיניים", icon: "brush", status: "none" },
  { id: "m4", labelEn: "Wash face", labelHe: "לשטוף פנים", icon: "water", status: "none" },
  { id: "m5", labelEn: "Get dressed", labelHe: "להתלבש", icon: "shirt", status: "none" },
  { id: "m6", labelEn: "Eat breakfast", labelHe: "לאכול ארוחת בוקר", icon: "apple", status: "none" },
  { id: "m7", labelEn: "Pack backpack", labelHe: "להכין תיק", icon: "backpack", status: "none" },
];

const defaultEvening: ChecklistItem[] = [
  { id: "e1", labelEn: "Tidy up toys", labelHe: "לסדר את הצעצועים", icon: "sparkles", status: "none" },
  { id: "e2", labelEn: "Take a bath", labelHe: "להתקלח", icon: "bath", status: "none" },
  { id: "e3", labelEn: "Put on pajamas", labelHe: "ללבוש פיג׳מה", icon: "shirt", status: "none" },
  { id: "e4", labelEn: "Brush teeth", labelHe: "לצחצח שיניים", icon: "brush", status: "none" },
  { id: "e5", labelEn: "Read a story", labelHe: "לקרוא סיפור", icon: "book", status: "none" },
  { id: "e6", labelEn: "Go to bed", labelHe: "ללכת לישון", icon: "moon", status: "none" },
];

const initialState = (): AppState => ({
  lang: "en",
  morning: { items: defaultMorning, bonusAwarded: "none", date: today() },
  evening: { items: defaultEvening, bonusAwarded: "none", date: today() },
  totals: { today: 0, best: 0, streak: 0, lastDate: null },
});

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    return rolloverIfNewDay(parsed);
  } catch {
    return initialState();
  }
}

export function saveState(s: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

function rolloverIfNewDay(s: AppState): AppState {
  const t = today();
  const resetRoutine = (r: RoutineState): RoutineState =>
    r.date === t ? r : { items: r.items.map(i => ({ ...i, status: "none" })), bonusAwarded: "none", date: t };
  const morning = resetRoutine(s.morning);
  const evening = resetRoutine(s.evening);
  let totals = s.totals;
  if (totals.lastDate && totals.lastDate !== t) {
    totals = { ...totals, today: 0 };
  }
  return { ...s, morning, evening, totals };
}

export function computeRoutineScore(r: RoutineState): { score: number; bonus: number; allDone: boolean; allAlone: boolean } {
  const score = r.items.reduce((sum, i) => sum + (i.status === "alone" ? POINTS.alone : i.status === "help" ? POINTS.help : 0), 0);
  const allDone = r.items.length > 0 && r.items.every(i => i.status !== "none");
  const allAlone = r.items.length > 0 && r.items.every(i => i.status === "alone");
  let bonus = 0;
  if (allAlone) bonus = BONUS.all + BONUS.champion;
  else if (allDone) bonus = BONUS.all;
  return { score, bonus, allDone, allAlone };
}

export { initialState, today };
