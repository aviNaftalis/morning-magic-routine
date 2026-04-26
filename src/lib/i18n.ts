export type Lang = "en" | "he";

export type Dictionary = {
  appTitle: string; morning: string; evening: string; addItem: string;
  addItemPlaceholder: string; pickIcon: string; save: string; cancel: string;
  delete: string; edit: string; notDone: string; withHelp: string; alone: string;
  score: string; today: string; best: string; streak: string; bonus: string;
  allDoneBonus: string; allAloneBonus: string; resetDay: string; confirmReset: string;
  confirmDelete: string; yes: string; no: string; settings: string; language: string;
  points: string; progress: string; goodMorning: string; goodEvening: string;
  keepGoing: string; almostThere: string; youDidIt: string; addFirst: string;
};

export const translations: Record<Lang, Dictionary> = {
  en: {
    appTitle: "Get Ready!",
    morning: "Morning",
    evening: "Evening",
    addItem: "Add task",
    addItemPlaceholder: "What to do?",
    pickIcon: "Pick an icon",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    notDone: "Not yet",
    withHelp: "With help",
    alone: "By myself",
    score: "Score",
    today: "Today",
    best: "Best",
    streak: "Streak",
    bonus: "Bonus!",
    allDoneBonus: "All done!",
    allAloneBonus: "Champion! All by yourself!",
    resetDay: "Reset day",
    confirmReset: "Reset all today's progress?",
    confirmDelete: "Delete this task?",
    yes: "Yes",
    no: "No",
    settings: "Settings",
    language: "Language",
    points: "pts",
    progress: "Progress",
    goodMorning: "Good morning!",
    goodEvening: "Good evening!",
    keepGoing: "You can do it!",
    almostThere: "Almost there!",
    youDidIt: "You did it!",
    addFirst: "Add your first task to get started",
  },
  he: {
    appTitle: "מתכוננים!",
    morning: "בוקר",
    evening: "ערב",
    addItem: "הוסף משימה",
    addItemPlaceholder: "מה צריך לעשות?",
    pickIcon: "בחר אייקון",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    notDone: "עדיין לא",
    withHelp: "עם עזרה",
    alone: "לבד",
    score: "ניקוד",
    today: "היום",
    best: "שיא",
    streak: "רצף",
    bonus: "בונוס!",
    allDoneBonus: "סיימת הכול!",
    allAloneBonus: "אלוף! הכול לבד!",
    resetDay: "אפס יום",
    confirmReset: "לאפס את כל ההתקדמות של היום?",
    confirmDelete: "למחוק את המשימה?",
    yes: "כן",
    no: "לא",
    settings: "הגדרות",
    language: "שפה",
    points: "נק׳",
    progress: "התקדמות",
    goodMorning: "בוקר טוב!",
    goodEvening: "ערב טוב!",
    keepGoing: "אתם יכולים!",
    almostThere: "כמעט שם!",
    youDidIt: "כל הכבוד!",
    addFirst: "הוסיפו משימה ראשונה כדי להתחיל",
  },
};

export type TranslationKey = keyof Dictionary;
