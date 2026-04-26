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

export interface UserProfile {
  id: string;
  name: string;
  emoji: string; // visual avatar
  morning: RoutineState;
  evening: RoutineState;
  totals: { today: number; best: number; streak: number; lastDate: string | null };
}

export interface AppState {
  lang: Lang;
  activeUserId: string;
  users: UserProfile[];
}

const KEY = "getready.state.v1";

const today = () => new Date().toISOString().slice(0, 10);

export const POINTS = { help: 1, alone: 2 };
export const BONUS = { all: 3, champion: 10 };

const defaultMorning = (): ChecklistItem[] => [
  { id: "m1", labelEn: "Get out of bed", labelHe: "לקום מהמיטה", icon: "bed", status: "none" },
  { id: "m2", labelEn: "Use the toilet", labelHe: "ללכת לשירותים", icon: "toilet", status: "none" },
  { id: "m3", labelEn: "Wash face", labelHe: "לשטוף פנים", icon: "water", status: "none" },
  { id: "m4", labelEn: "Put on face cream", labelHe: "למרוח קרם פנים", icon: "cream", status: "none" },
  { id: "m5", labelEn: "Brush teeth", labelHe: "לצחצח שיניים", icon: "toothbrush", status: "none" },
  { id: "m6", labelEn: "Do hair", labelHe: "לסדר את השיער", icon: "hairbrush", status: "none" },
  { id: "m7", labelEn: "Put on shirt", labelHe: "ללבוש חולצה", icon: "shirt", status: "none" },
  { id: "m8", labelEn: "Put on skirt", labelHe: "ללבוש חצאית", icon: "skirt", status: "none" },
  { id: "m9", labelEn: "Put on sandals", labelHe: "לנעול סנדלים", icon: "sandals", status: "none" },
  { id: "m10", labelEn: "Put lunch box in backpack", labelHe: "להכניס קופסת אוכל לתיק", icon: "lunchbox", status: "none" },
  { id: "m11", labelEn: "Pack backpack", labelHe: "להכין תיק", icon: "backpack", status: "none" },
];

const defaultEvening = (): ChecklistItem[] => [
  { id: "e1", labelEn: "Tidy up toys", labelHe: "לסדר את הצעצועים", icon: "sparkles", status: "none" },
  { id: "e2", labelEn: "Take a bath", labelHe: "להתקלח", icon: "bath", status: "none" },
  { id: "e3", labelEn: "Put on pajamas", labelHe: "ללבוש פיג׳מה", icon: "shirt", status: "none" },
  { id: "e4", labelEn: "Brush teeth", labelHe: "לצחצח שיניים", icon: "toothbrush", status: "none" },
  { id: "e5", labelEn: "Read a story", labelHe: "לקרוא סיפור", icon: "book", status: "none" },
  { id: "e6", labelEn: "Go to bed", labelHe: "ללכת לישון", icon: "moon", status: "none" },
];

export const newUser = (name: string, emoji = "⭐"): UserProfile => ({
  id: `u${Date.now()}${Math.floor(Math.random() * 1000)}`,
  name,
  emoji,
  morning: { items: defaultMorning(), bonusAwarded: "none", date: today() },
  evening: { items: defaultEvening(), bonusAwarded: "none", date: today() },
  totals: { today: 0, best: 0, streak: 0, lastDate: null },
});

const initialState = (): AppState => {
  const avigail = newUser("Avigail", "👧");
  return {
    lang: "en",
    activeUserId: avigail.id,
    users: [avigail],
  };
};

// Migrate from previous single-user shape
function migrate(raw: unknown): AppState {
  const data = raw as Record<string, unknown>;
  if (data && Array.isArray((data as { users?: unknown }).users)) {
    return data as unknown as AppState;
  }
  // Old shape: { lang, morning, evening, totals }
  if (data && (data as { morning?: unknown }).morning) {
    const old = data as unknown as {
      lang: Lang;
      morning: RoutineState;
      evening: RoutineState;
      totals: UserProfile["totals"];
    };
    const avigail: UserProfile = {
      id: `u${Date.now()}`,
      name: "Avigail",
      emoji: "👧",
      morning: { ...old.morning, items: defaultMorning() },
      evening: { ...old.evening, items: defaultEvening() },
      totals: old.totals ?? { today: 0, best: 0, streak: 0, lastDate: null },
    };
    return { lang: old.lang ?? "en", activeUserId: avigail.id, users: [avigail] };
  }
  return initialState();
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = migrate(JSON.parse(raw));
    return rolloverIfNewDay(parsed);
  } catch {
    return initialState();
  }
}

export function saveState(s: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {
    // ignore quota errors
  }
}

function rolloverIfNewDay(s: AppState): AppState {
  const t = today();
  const resetRoutine = (r: RoutineState): RoutineState =>
    r.date === t ? r : { items: r.items.map(i => ({ ...i, status: "none" })), bonusAwarded: "none", date: t };
  const users = s.users.map((u) => {
    const morning = resetRoutine(u.morning);
    const evening = resetRoutine(u.evening);
    let totals = u.totals;
    if (totals.lastDate && totals.lastDate !== t) {
      totals = { ...totals, today: 0 };
    }
    return { ...u, morning, evening, totals };
  });
  return { ...s, users };
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

export function getActiveUser(s: AppState): UserProfile {
  return s.users.find((u) => u.id === s.activeUserId) ?? s.users[0];
}

export function updateActiveUser(s: AppState, updater: (u: UserProfile) => UserProfile): AppState {
  return {
    ...s,
    users: s.users.map((u) => (u.id === s.activeUserId ? updater(u) : u)),
  };
}

export { initialState, today };
