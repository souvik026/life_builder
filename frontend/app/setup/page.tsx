"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { previewHabits, lockSetup } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Lock, User, ListChecks, Target, Leaf, Clock } from "lucide-react";
import type { HabitPreview, TimedTaskPreview } from "@/lib/types";

const STEPS = [
  { label: "Profile", icon: User },
  { label: "Habits", icon: ListChecks },
  { label: "Tasks", icon: Clock },
  { label: "Goals", icon: Target },
  { label: "Lock", icon: Lock },
];

const INPUT_CLS =
  "w-full rounded-xl border border-sand bg-warm-white px-4 py-3 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all";

const DEFAULT_HABITS_MD = `## Morning Routine
- Wake up at 5:30 AM
- Meditation (10 min)
- Cold shower
- Journaling
- Exercise (30 min)
- Healthy breakfast

## Life Habits
- No sugar
- Read 30 min
- No social media before noon
- 8 glasses of water
- Sleep by 10:30 PM`;

const DEFAULT_TASKS_MD = `Deep work - 60
Side project - 60
Language learning - 60`;

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLocking, setIsLocking] = useState(false);
  const [configHash, setConfigHash] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [userName, setUserName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [habitsMd, setHabitsMd] = useState(DEFAULT_HABITS_MD);
  const [habitPreview, setHabitPreview] = useState<HabitPreview[]>([]);
  const [timedTasksMd, setTimedTasksMd] = useState(DEFAULT_TASKS_MD);
  const [taskPreview, setTaskPreview] = useState<TimedTaskPreview[]>([]);
  const [startWeight, setStartWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetCalories, setTargetCalories] = useState("500");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const handlePreview = async () => {
    const previewed = await previewHabits(habitsMd);
    setHabitPreview(previewed);
  };

  const handleTaskPreview = () => {
    const tasks: TimedTaskPreview[] = [];
    for (const line of timedTasksMd.split("\n")) {
      const trimmed = line.trim().replace(/^[-*]\s+/, "");
      if (!trimmed) continue;
      if (trimmed.includes(" - ")) {
        const parts = trimmed.split(" - ");
        const name = parts.slice(0, -1).join(" - ").trim();
        const mins = Math.max(parseInt(parts[parts.length - 1]) || 60, 60);
        if (name) tasks.push({ name, target_minutes: mins });
      } else {
        tasks.push({ name: trimmed, target_minutes: 60 });
      }
    }
    setTaskPreview(tasks);
  };

  const handleLock = async () => {
    setIsLocking(true);
    const result = await lockSetup({
      user_name: userName,
      start_date: startDate,
      start_weight: parseFloat(startWeight) || 0,
      target_weight: parseFloat(targetWeight) || 0,
      target_calories: parseInt(targetCalories) || 500,
      whatsapp_number: whatsappNumber,
      habits_md_raw: habitsMd,
      timed_tasks_raw: timedTasksMd,
    });
    setConfigHash(result.config_hash);
    setIsLocking(false);
    setTimeout(() => router.push("/dashboard"), 3000);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return userName.trim().length > 0 && startDate.length > 0;
      case 1: return habitsMd.trim().length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return confirmed;
      default: return false;
    }
  };

  const endDate = (() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 89);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-14">
        {/* Title */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
            <Leaf className="h-6 w-6 text-sage" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-bark">
            Begin Your Journey
          </h1>
          <p className="mt-2 text-sm text-stone">
            Configure your 90-day challenge. Once locked, habits are permanent.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                    isDone
                      ? "bg-sage text-warm-white"
                      : isActive
                      ? "bg-bark text-warm-white shadow-lg shadow-bark/20"
                      : "bg-sand/60 text-stone-light"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`hidden text-xs sm:block transition-colors ${isActive ? "font-medium text-bark" : "text-stone-light"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-sand" />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <Card>
            {/* Step 0: Profile */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">Your Profile</h2>
                <div>
                  <label className="block text-sm font-medium text-bark-light mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-light mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <p className="text-sm text-stone">
                  Your 90-day journey will end on{" "}
                  <span className="font-[family-name:var(--font-display)] font-semibold text-bark">{endDate}</span>
                </p>
              </div>
            )}

            {/* Step 1: Habits */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">Define Your Habits</h2>
                <p className="text-sm text-stone">
                  Use markdown format: &quot;## Morning Routine&quot;, &quot;## Evening Routine&quot;, or &quot;## Life Habits&quot;.
                </p>
                <textarea
                  value={habitsMd}
                  onChange={(e) => setHabitsMd(e.target.value)}
                  rows={14}
                  className={`${INPUT_CLS} font-mono text-xs leading-relaxed`}
                />
                <button
                  onClick={handlePreview}
                  className="rounded-xl bg-cream-dark px-5 py-2.5 text-sm font-medium text-bark-light hover:bg-sand transition-colors"
                >
                  Preview Habits
                </button>
                {habitPreview.length > 0 && (
                  <div className="rounded-xl border border-sand/60 bg-cream p-4">
                    <h3 className="mb-3 text-xs font-semibold text-stone uppercase tracking-wide">Parsed Habits</h3>
                    <div className="space-y-1.5">
                      {habitPreview.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className={`inline-block w-16 rounded-full px-2.5 py-0.5 text-xs font-medium text-center ${
                            h.category === "morning" ? "bg-clay/15 text-terracotta-dark" : h.category === "evening" ? "bg-amber-100 text-amber-800" : "bg-sage/10 text-sage-dark"
                          }`}>
                            {h.category}
                          </span>
                          <span className="text-bark">{h.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Timed Tasks */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">90-Day Timed Tasks</h2>
                <p className="text-sm text-stone">
                  Define tasks you commit to doing for at least <strong>1 hour daily</strong>.
                  Format: &quot;Task name - minutes&quot; (minimum 60 min).
                </p>
                <textarea
                  value={timedTasksMd}
                  onChange={(e) => setTimedTasksMd(e.target.value)}
                  rows={6}
                  placeholder={"Deep work - 60\nSide project - 60\nLanguage learning - 60"}
                  className={`${INPUT_CLS} font-mono text-xs leading-relaxed`}
                />
                <button
                  onClick={handleTaskPreview}
                  className="rounded-xl bg-cream-dark px-5 py-2.5 text-sm font-medium text-bark-light hover:bg-sand transition-colors"
                >
                  Preview Tasks
                </button>
                {taskPreview.length > 0 && (
                  <div className="rounded-xl border border-sand/60 bg-cream p-4">
                    <h3 className="mb-3 text-xs font-semibold text-stone uppercase tracking-wide">Parsed Tasks</h3>
                    <div className="space-y-1.5">
                      {taskPreview.map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-sage" />
                            <span className="text-bark">{t.name}</span>
                          </div>
                          <span className="text-xs text-stone font-medium">{t.target_minutes} min/day</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-stone-light">
                  Leave empty to skip. You can also add tasks later from the journal page.
                </p>
              </div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">Set Your Goals</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark-light mb-2">Starting Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={startWeight}
                      onChange={(e) => setStartWeight(e.target.value)}
                      placeholder="e.g. 82.5"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-light mb-2">Target Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder="e.g. 72.0"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-light mb-2">Daily Calorie Burn Target</label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder="500"
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-light mb-2">WhatsApp Number (optional)</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1234567890"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Lock */}
            {step === 4 && !configHash && (
              <div className="space-y-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">Review & Lock</h2>
                <div className="rounded-xl bg-terracotta/5 border border-terracotta/20 p-4">
                  <p className="text-sm text-terracotta-dark">
                    Once locked, your habits <strong>cannot be changed</strong> for the entire 90 days.
                    This is enforced at the database level.
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ["Name", userName],
                    ["Period", `${startDate} → ${endDate}`],
                    ["Weight Goal", `${startWeight || "—"} → ${targetWeight || "—"} kg`],
                    ["Calorie Target", `${targetCalories} kcal/day`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-sand/40 pb-2.5">
                      <span className="text-stone">{label}</span>
                      <span className="font-medium text-bark">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-sand/60 bg-cream p-4">
                  <h4 className="mb-2 text-xs font-semibold text-stone uppercase tracking-wide">Habits</h4>
                  <pre className="text-xs text-bark-light whitespace-pre-wrap leading-relaxed">{habitsMd}</pre>
                </div>
                {timedTasksMd.trim() && (
                  <div className="rounded-xl border border-sand/60 bg-cream p-4">
                    <h4 className="mb-2 text-xs font-semibold text-stone uppercase tracking-wide">Timed Tasks</h4>
                    <pre className="text-xs text-bark-light whitespace-pre-wrap leading-relaxed">{timedTasksMd}</pre>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-sand accent-sage"
                  />
                  <span className="text-sm text-stone group-hover:text-bark transition-colors">
                    I understand that habits are immutable after locking.
                  </span>
                </label>
                <button
                  onClick={handleLock}
                  disabled={!confirmed || isLocking}
                  className="w-full rounded-xl bg-terracotta px-4 py-3.5 text-sm font-semibold text-warm-white hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-terracotta/20"
                >
                  {isLocking ? "Locking..." : "Lock & Begin 90 Days"}
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && configHash && (
              <div className="space-y-5 text-center py-8 animate-scale-in">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                  <Leaf className="h-8 w-8 text-sage" />
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">Your Journey Begins</h2>
                <p className="text-sm text-stone">90 days of intentional growth starts now.</p>
                <div className="rounded-xl bg-cream p-4">
                  <p className="text-xs text-stone-light mb-1">Config Hash</p>
                  <p className="font-mono text-xs text-bark-light break-all">{configHash}</p>
                </div>
                <p className="text-xs text-stone-light">Redirecting to dashboard...</p>
              </div>
            )}
          </Card>
        </div>

        {/* Navigation buttons */}
        {!configHash && (
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm text-stone hover:bg-cream-dark disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 rounded-xl bg-bark px-6 py-2.5 text-sm font-medium text-warm-white hover:bg-bark-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bark/15"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
