import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Languages, Plus, RotateCcw, Settings2, Sun, Moon, Trophy, Flame, Star, Users, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loadState, saveState, computeRoutineScore, getActiveUser, updateActiveUser, newUser,
  type AppState, type ChecklistItem, type ItemStatus, type RoutineKey, type UserProfile,
} from "@/lib/storage";
import { translations, type Lang, type Dictionary } from "@/lib/i18n";
import { iconKeys, getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = ["👧", "👦", "🧒", "👶", "🦄", "🐯", "🦊", "🐼", "🐰", "🐶", "🐸", "⭐", "🌈", "🚀"];

const triggerConfetti = (kind: "all" | "champion") => {
  const colors = kind === "champion"
    ? ["#FFD700", "#FF6B9D", "#A78BFA", "#34D399", "#60A5FA"]
    : ["#A78BFA", "#FBBF24", "#F472B6"];
  const burst = (origin: { x: number; y: number }) =>
    confetti({ particleCount: kind === "champion" ? 120 : 70, spread: 80, startVelocity: 45, origin, colors, scalar: 1.1 });
  burst({ x: 0.2, y: 0.6 });
  burst({ x: 0.8, y: 0.6 });
  if (kind === "champion") setTimeout(() => burst({ x: 0.5, y: 0.5 }), 200);
};

export default function GetReadyApp() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<RoutineKey>(() => new Date().getHours() < 16 ? "morning" : "evening");
  const t = translations[state.lang];
  const isRtl = state.lang === "he";
  const activeUser = getActiveUser(state);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.title = `${t.appTitle} • ${activeUser.name}`;
  }, [state.lang, isRtl, t, activeUser.name]);

  // Bonus celebration + totals tracking — runs per active user
  useEffect(() => {
    (["morning", "evening"] as RoutineKey[]).forEach((k) => {
      const r = activeUser[k];
      const { allDone, allAlone } = computeRoutineScore(r);
      const newBonus = allAlone ? "champion" : allDone ? "all" : "none";
      if (newBonus !== r.bonusAwarded) {
        if (newBonus === "all" || newBonus === "champion") {
          triggerConfetti(newBonus);
        }
        setState((prev) => updateActiveUser(prev, (u) => {
          const updated: UserProfile = { ...u, [k]: { ...u[k], bonusAwarded: newBonus } } as UserProfile;
          const mScore = computeRoutineScore(updated.morning);
          const eScore = computeRoutineScore(updated.evening);
          const today = mScore.score + mScore.bonus + eScore.score + eScore.bonus;
          const best = Math.max(u.totals.best, today);
          let streak = u.totals.streak;
          let lastDate = u.totals.lastDate;
          if ((mScore.allDone || eScore.allDone) && lastDate !== updated.morning.date) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            streak = lastDate === yesterday ? streak + 1 : 1;
            lastDate = updated.morning.date;
          }
          return { ...updated, totals: { today, best, streak, lastDate } };
        }));
      }
    });
  }, [activeUser.morning.items, activeUser.evening.items, activeUser.id]);

  // Recompute today's running score
  useEffect(() => {
    const mScore = computeRoutineScore(activeUser.morning);
    const eScore = computeRoutineScore(activeUser.evening);
    const today = mScore.score + mScore.bonus + eScore.score + eScore.bonus;
    if (today !== activeUser.totals.today || today > activeUser.totals.best) {
      setState((p) => updateActiveUser(p, (u) => ({
        ...u,
        totals: { ...u.totals, today, best: Math.max(u.totals.best, today) },
      })));
    }
  }, [activeUser.morning.items, activeUser.evening.items, activeUser.id]);

  const setStatus = (routine: RoutineKey, id: string, status: ItemStatus) => {
    setState((p) => updateActiveUser(p, (u) => ({
      ...u,
      [routine]: { ...u[routine], items: u[routine].items.map((i) => (i.id === id ? { ...i, status } : i)) },
    })));
  };

  const addItem = (routine: RoutineKey, item: ChecklistItem) => {
    setState((p) => updateActiveUser(p, (u) => ({
      ...u,
      [routine]: { ...u[routine], items: [...u[routine].items, item] },
    })));
  };

  const updateItem = (routine: RoutineKey, item: ChecklistItem) => {
    setState((p) => updateActiveUser(p, (u) => ({
      ...u,
      [routine]: { ...u[routine], items: u[routine].items.map((i) => (i.id === item.id ? item : i)) },
    })));
  };

  const deleteItem = (routine: RoutineKey, id: string) => {
    setState((p) => updateActiveUser(p, (u) => ({
      ...u,
      [routine]: { ...u[routine], items: u[routine].items.filter((i) => i.id !== id) },
    })));
  };

  const resetDay = () => {
    setState((p) => updateActiveUser(p, (u) => ({
      ...u,
      morning: { ...u.morning, items: u.morning.items.map((i) => ({ ...i, status: "none" })), bonusAwarded: "none" },
      evening: { ...u.evening, items: u.evening.items.map((i) => ({ ...i, status: "none" })), bonusAwarded: "none" },
      totals: { ...u.totals, today: 0 },
    })));
  };

  const toggleLang = () => setState((p) => ({ ...p, lang: p.lang === "en" ? "he" : "en" }));

  const switchUser = (id: string) => setState((p) => ({ ...p, activeUserId: id }));

  const addUser = (name: string, emoji: string) => {
    const u = newUser(name.trim() || "Kid", emoji);
    setState((p) => ({ ...p, users: [...p.users, u], activeUserId: u.id }));
  };

  const updateUser = (id: string, name: string, emoji: string) => {
    setState((p) => ({
      ...p,
      users: p.users.map((u) => (u.id === id ? { ...u, name: name.trim() || u.name, emoji } : u)),
    }));
  };

  const removeUser = (id: string) => {
    setState((p) => {
      if (p.users.length <= 1) return p;
      const users = p.users.filter((u) => u.id !== id);
      const activeUserId = p.activeUserId === id ? users[0].id : p.activeUserId;
      return { ...p, users, activeUserId };
    });
  };

  const headerGradient = tab === "morning" ? "bg-gradient-morning" : "bg-gradient-evening";
  const greeting = tab === "morning" ? t.goodMorning : t.goodEvening;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className={cn("relative overflow-hidden text-white transition-colors duration-500", headerGradient)}>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 25}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
            >
              {tab === "morning" ? <Sun className="w-8 h-8" /> : <Star className="w-6 h-6" />}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-2xl mx-auto px-5 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <motion.div
                className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {tab === "morning" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight truncate">{t.appTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm" variant="ghost"
                onClick={toggleLang}
                className="bg-white/15 hover:bg-white/25 text-white rounded-full h-9 px-3 gap-1"
                aria-label={t.language}
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-bold">{state.lang === "en" ? "עב" : "EN"}</span>
              </Button>
              <ResetButton t={t} onReset={resetDay} />
            </div>
          </div>

          <UserSwitcher
            t={t}
            users={state.users}
            activeId={state.activeUserId}
            onSwitch={switchUser}
            onAdd={addUser}
            onUpdate={updateUser}
            onRemove={removeUser}
          />

          <p className="text-white/90 text-lg font-medium mt-4 mb-3">
            {greeting} <span className="font-bold">{activeUser.name}!</span>
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Stat icon={<Star className="w-4 h-4" />} label={t.today} value={activeUser.totals.today} />
            <Stat icon={<Trophy className="w-4 h-4" />} label={t.best} value={activeUser.totals.best} />
            <Stat icon={<Flame className="w-4 h-4" />} label={t.streak} value={activeUser.totals.streak} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as RoutineKey)} dir={isRtl ? "rtl" : "ltr"}>
          <TabsList className="grid grid-cols-2 w-full h-14 bg-card shadow-pop rounded-2xl p-1.5 border border-border/50">
            <TabsTrigger value="morning" className="rounded-xl data-[state=active]:bg-gradient-morning data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-base font-semibold">
              <Sun className="w-5 h-5" /> {t.morning}
            </TabsTrigger>
            <TabsTrigger value="evening" className="rounded-xl data-[state=active]:bg-gradient-evening data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-base font-semibold">
              <Moon className="w-5 h-5" /> {t.evening}
            </TabsTrigger>
          </TabsList>

          {(["morning", "evening"] as RoutineKey[]).map((k) => (
            <TabsContent key={`${activeUser.id}-${k}`} value={k} className="mt-5 space-y-3">
              <RoutineView
                routineKey={k}
                user={activeUser}
                lang={state.lang}
                t={t}
                isRtl={isRtl}
                onStatus={(id, s) => setStatus(k, id, s)}
                onAdd={(item) => addItem(k, item)}
                onUpdate={(item) => updateItem(k, item)}
                onDelete={(id) => deleteItem(k, id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function UserSwitcher({
  t, users, activeId, onSwitch, onAdd, onUpdate, onRemove,
}: {
  t: Dictionary;
  users: UserProfile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string, emoji: string) => void;
  onUpdate: (id: string, name: string, emoji: string) => void;
  onRemove: (id: string) => void;
}) {
  const [manageOpen, setManageOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1">
      {users.map((u) => {
        const active = u.id === activeId;
        return (
          <button
            key={u.id}
            onClick={() => onSwitch(u.id)}
            className={cn(
              "shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
              active
                ? "bg-white text-foreground shadow-md scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            <span className="text-lg leading-none">{u.emoji}</span>
            <span className="max-w-[100px] truncate">{u.name}</span>
          </button>
        );
      })}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogTrigger asChild>
          <button
            className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold bg-white/15 text-white hover:bg-white/25"
            aria-label={t.manageUsers}
          >
            <Users className="w-4 h-4" />
            <Plus className="w-3.5 h-3.5" />
          </button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t.manageUsers}</DialogTitle>
          </DialogHeader>
          <ManageUsersBody
            t={t}
            users={users}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManageUsersBody({
  t, users, onAdd, onUpdate, onRemove,
}: {
  t: Dictionary;
  users: UserProfile[];
  onAdd: (name: string, emoji: string) => void;
  onUpdate: (id: string, name: string, emoji: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [adding, setAdding] = useState(false);

  const startAdd = () => { setAdding(true); setEditingId(null); setName(""); setEmoji("⭐"); };
  const startEdit = (u: UserProfile) => { setEditingId(u.id); setAdding(false); setName(u.name); setEmoji(u.emoji); };
  const cancel = () => { setEditingId(null); setAdding(false); };
  const submit = () => {
    if (adding) onAdd(name, emoji);
    else if (editingId) onUpdate(editingId, name, emoji);
    cancel();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-2 rounded-2xl bg-muted/50 p-2">
            <span className="text-2xl w-10 h-10 flex items-center justify-center bg-card rounded-xl shrink-0">{u.emoji}</span>
            <span className="font-semibold flex-1 truncate">{u.name}</span>
            <Button size="icon" variant="ghost" className="rounded-full h-9 w-9" onClick={() => startEdit(u)} aria-label={t.editUser}>
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-9 w-9 text-destructive"
                  disabled={users.length <= 1}
                  aria-label={t.deleteUser}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.deleteUser}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {users.length <= 1 ? t.cantDeleteLast : t.confirmDeleteUser}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.no}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(u.id)} disabled={users.length <= 1}>
                    {t.yes}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {(adding || editingId) ? (
        <div className="space-y-3 rounded-2xl border-2 border-dashed border-border p-3">
          <div className="space-y-2">
            <Label htmlFor="user-name">{t.userName}</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.userName} />
          </div>
          <div className="space-y-2">
            <Label>{t.userEmoji}</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {AVATAR_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "aspect-square rounded-xl text-2xl flex items-center justify-center transition-all",
                    emoji === e ? "bg-gradient-fun shadow-md scale-110" : "bg-muted hover:bg-muted/70"
                  )}
                  aria-label={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={cancel} className="rounded-2xl">{t.cancel}</Button>
            <Button onClick={submit} className="rounded-2xl bg-gradient-fun text-white gap-1">
              <Check className="w-4 h-4" /> {t.save}
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={startAdd} className="w-full rounded-2xl bg-gradient-fun text-white gap-2 h-12">
          <Plus className="w-4 h-4" /> {t.addUser}
        </Button>
      )}
    </div>
  );
}


function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl px-3 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-white/80 text-xs font-medium">
        {icon}<span>{label}</span>
      </div>
      <div className="text-xl font-bold leading-tight">{value}</div>
    </div>
  );
}

function ResetButton({ t, onReset }: { t: Dictionary; onReset: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="bg-white/15 hover:bg-white/25 text-white rounded-full h-9 w-9 p-0" aria-label={t.resetDay}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.resetDay}</AlertDialogTitle>
          <AlertDialogDescription>{t.confirmReset}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.no}</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>{t.yes}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RoutineView({
  routineKey, state, t, isRtl, onStatus, onAdd, onUpdate, onDelete,
}: {
  routineKey: RoutineKey;
  state: AppState;
  t: Dictionary;
  isRtl: boolean;
  onStatus: (id: string, s: ItemStatus) => void;
  onAdd: (i: ChecklistItem) => void;
  onUpdate: (i: ChecklistItem) => void;
  onDelete: (id: string) => void;
}) {
  const r = state[routineKey];
  const { score, bonus, allDone, allAlone } = computeRoutineScore(r);
  const total = r.items.length;
  const completed = r.items.filter((i) => i.status !== "none").length;
  const pct = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-3xl p-4 shadow-soft border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-muted-foreground">{t.progress}</span>
          <span className="text-sm font-bold">{completed}/{total} • {score + bonus} {t.points}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", routineKey === "morning" ? "bg-gradient-morning" : "bg-gradient-evening")}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <AnimatePresence>
          {(allDone || allAlone) && (
            <motion.div
              key={allAlone ? "champ" : "all"}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "mt-3 rounded-2xl px-4 py-3 text-white font-bold flex items-center gap-2",
                allAlone ? "bg-gradient-success" : "bg-gradient-fun"
              )}
            >
              <Trophy className="w-5 h-5" />
              <span className="flex-1">{allAlone ? t.allAloneBonus : t.allDoneBonus}</span>
              <span className="bg-white/25 rounded-full px-3 py-1 text-sm">+{bonus}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {r.items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <ItemCard
              item={item} t={t} lang={state.lang}
              onStatus={(s) => onStatus(item.id, s)}
              onUpdate={onUpdate}
              onDelete={() => onDelete(item.id)}
              isRtl={isRtl}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {r.items.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">{t.addFirst}</div>
      )}

      <AddOrEditDialog t={t} lang={state.lang} onSave={onAdd} mode="add" />
    </div>
  );
}

function ItemCard({
  item, t, lang, onStatus, onUpdate, onDelete, isRtl,
}: {
  item: ChecklistItem;
  t: Dictionary;
  lang: Lang;
  onStatus: (s: ItemStatus) => void;
  onUpdate: (i: ChecklistItem) => void;
  onDelete: () => void;
  isRtl: boolean;
}) {
  const Icon = getIcon(item.icon);
  const label = lang === "he" ? item.labelHe : item.labelEn;
  const done = item.status !== "none";

  return (
    <div
      className={cn(
        "bg-card rounded-3xl p-3 shadow-soft border-2 transition-all",
        item.status === "alone" && "border-success/60 bg-success/5",
        item.status === "help" && "border-warning/60 bg-warning/5",
        item.status === "none" && "border-border/50",
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
            done ? "bg-gradient-fun text-white shadow-md" : "bg-muted text-muted-foreground"
          )}
          animate={done ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-7 h-7" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base leading-tight truncate">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {item.status === "alone" && `+2 ${t.points} • ${t.alone}`}
            {item.status === "help" && `+1 ${t.points} • ${t.withHelp}`}
            {item.status === "none" && t.notDone}
          </div>
        </div>
        <AddOrEditDialog t={t} lang={lang} onSave={onUpdate} onDelete={onDelete} mode="edit" existing={item} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <StatusButton active={item.status === "none"} onClick={() => onStatus("none")} variant="none">
          {t.notDone}
        </StatusButton>
        <StatusButton active={item.status === "help"} onClick={() => onStatus("help")} variant="help">
          {t.withHelp}
          <span className="text-[10px] opacity-80">+1</span>
        </StatusButton>
        <StatusButton active={item.status === "alone"} onClick={() => onStatus("alone")} variant="alone">
          {t.alone}
          <span className="text-[10px] opacity-80">+2</span>
        </StatusButton>
      </div>
    </div>
  );
}

function StatusButton({
  active, onClick, variant, children,
}: {
  active: boolean;
  onClick: () => void;
  variant: "none" | "help" | "alone";
  children: React.ReactNode;
}) {
  const styles = {
    none: active ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70",
    help: active ? "bg-warning text-warning-foreground shadow-md scale-105" : "bg-warning/15 text-warning-foreground hover:bg-warning/25",
    alone: active ? "bg-success text-success-foreground shadow-md scale-105" : "bg-success/15 text-success hover:bg-success/25",
  } as const;
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "rounded-2xl py-2.5 px-2 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all min-h-[52px]",
        styles[variant]
      )}
    >
      {children}
    </motion.button>
  );
}

function AddOrEditDialog({
  t, lang, onSave, onDelete, mode, existing,
}: {
  t: Dictionary;
  lang: Lang;
  onSave: (i: ChecklistItem) => void;
  onDelete?: () => void;
  mode: "add" | "edit";
  existing?: ChecklistItem;
}) {
  const [open, setOpen] = useState(false);
  const [labelEn, setLabelEn] = useState(existing?.labelEn ?? "");
  const [labelHe, setLabelHe] = useState(existing?.labelHe ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "star");

  useEffect(() => {
    if (open && existing) {
      setLabelEn(existing.labelEn);
      setLabelHe(existing.labelHe);
      setIcon(existing.icon);
    } else if (open && mode === "add") {
      setLabelEn(""); setLabelHe(""); setIcon("star");
    }
  }, [open, existing, mode]);

  const submit = () => {
    const en = labelEn.trim() || labelHe.trim() || "Task";
    const he = labelHe.trim() || labelEn.trim() || "משימה";
    onSave({
      id: existing?.id ?? `c${Date.now()}`,
      labelEn: en,
      labelHe: he,
      icon,
      status: existing?.status ?? "none",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button className="w-full h-14 rounded-3xl bg-gradient-fun hover:opacity-90 text-white font-bold text-base shadow-pop gap-2 mt-2">
            <Plus className="w-5 h-5" /> {t.addItem}
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="rounded-full shrink-0" aria-label={t.edit}>
            <Settings2 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? t.addItem : t.edit}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="en">English</Label>
            <Input id="en" value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder={t.addItemPlaceholder} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="he">עברית</Label>
            <Input id="he" value={labelHe} onChange={(e) => setLabelHe(e.target.value)} placeholder={translations.he.addItemPlaceholder} dir="rtl" />
          </div>
          <div className="space-y-2">
            <Label>{t.pickIcon}</Label>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
              {iconKeys.map((key) => {
                const I = getIcon(key);
                const active = icon === key;
                return (
                  <button
                    key={key}
                    onClick={() => setIcon(key)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center transition-all",
                      active ? "bg-gradient-fun text-white shadow-md scale-110" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                    aria-label={key}
                  >
                    <I className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2 flex-row">
          {mode === "edit" && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-2xl">{t.delete}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.no}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onDelete(); setOpen(false); }}>{t.yes}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl">{t.cancel}</Button>
          <Button onClick={submit} className="rounded-2xl bg-gradient-fun text-white">{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
