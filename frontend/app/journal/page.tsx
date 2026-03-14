"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { submitJournal, logTaskSession, logBodyStats } from "@/lib/api";
import { useJournal } from "@/hooks/useJournal";
import { JournalSidebar } from "@/components/journal/JournalSidebar";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { TaskSessionInput } from "@/components/journal/TaskSessionInput";
import { BodyStatsInput } from "@/components/journal/BodyStatsInput";
import { BookOpen, Sun, CloudRain, Compass, Sparkles, Leaf, Menu, X } from "lucide-react";

const TEXTAREA_CLS =
  "w-full rounded-xl border border-sand bg-warm-white px-4 py-3 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all leading-relaxed";

const MOOD_EMOJI: Record<string, string> = {
  great: "\u{1F60A}",
  good: "\u{1F642}",
  okay: "\u{1F610}",
  bad: "\u{1F641}",
  terrible: "\u{1F62D}",
};

export default function JournalPage() {
  const { entries, selectedDate, selectedEntry, timedTasks, selectDate, clearSelection, refreshEntries } = useJournal();

  const [mood, setMood] = useState<string | null>(null);
  const [wentWell, setWentWell] = useState("");
  const [wentBad, setWentBad] = useState("");
  const [reflection, setReflection] = useState("");
  const [taskMinutes, setTaskMinutes] = useState<Record<string, number>>({});
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isViewingPast = selectedDate !== null;

  const resetForm = () => {
    setMood(null);
    setWentWell("");
    setWentBad("");
    setReflection("");
    setTaskMinutes({});
    setWeight("");
    setCalories("");
    setSubmitted(false);
    setAiInsight(null);
  };

  const handleNewEntry = () => {
    clearSelection();
    resetForm();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const promises: Promise<unknown>[] = [];

    // Save journal
    promises.push(
      submitJournal({ went_well: wentWell, went_bad: wentBad, reflection, mood }).then((result) => {
        if (result?.ai_insight) setAiInsight(result.ai_insight);
      })
    );

    // Save task sessions
    for (const [taskId, minutes] of Object.entries(taskMinutes)) {
      if (minutes > 0) {
        promises.push(logTaskSession(taskId, minutes));
      }
    }

    // Save body stats
    const w = parseFloat(weight);
    const c = parseInt(calories);
    if (w > 0 || c > 0) {
      promises.push(logBodyStats({ weight_kg: w || 0, calories_burnt: c || 0, target_calories: 500 }));
    }

    await Promise.all(promises);
    setSubmitted(true);
    setIsSubmitting(false);
    refreshEntries();
  };

  // Read-only view for past entries
  const renderReadOnly = () => {
    if (!selectedEntry) return null;
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-clay" />
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
                {selectedDate === today ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
            </div>
          </div>
          {selectedEntry.mood && (
            <span className="text-2xl">{MOOD_EMOJI[selectedEntry.mood] || ""}</span>
          )}
        </div>

        {selectedEntry.went_well && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-clay" />
              <span className="text-sm font-medium text-bark">What went well</span>
            </div>
            <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4">{selectedEntry.went_well}</p>
          </div>
        )}

        {selectedEntry.went_bad && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-4 w-4 text-stone" />
              <span className="text-sm font-medium text-bark">What could have been better</span>
            </div>
            <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4">{selectedEntry.went_bad}</p>
          </div>
        )}

        {selectedEntry.reflection && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="h-4 w-4 text-sage" />
              <span className="text-sm font-medium text-bark">Reflection</span>
            </div>
            <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4">{selectedEntry.reflection}</p>
          </div>
        )}

        {selectedEntry.ai_insight && (
          <div className="rounded-xl bg-sage/5 border border-sage/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-sage" />
              <span className="text-sm font-medium text-sage-dark">AI Insight</span>
            </div>
            <p className="text-sm text-bark-light leading-relaxed">{selectedEntry.ai_insight}</p>
          </div>
        )}
      </div>
    );
  };

  // Success screen after submit
  const renderSuccess = () => (
    <div className="text-center py-10 animate-scale-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 mb-5">
        <Leaf className="h-8 w-8 text-sage" />
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
        Journal Saved
      </h2>
      <p className="mt-1 text-sm text-stone">{today}</p>
      {aiInsight && (
        <div className="mt-6 mx-auto max-w-md rounded-xl bg-sage/5 border border-sage/15 p-5 text-left animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-sage" />
            <span className="text-sm font-medium text-sage-dark">AI Insight</span>
          </div>
          <p className="text-sm text-bark-light leading-relaxed">{aiInsight}</p>
        </div>
      )}
      <button
        onClick={handleNewEntry}
        className="mt-8 rounded-xl bg-cream-dark px-6 py-2.5 text-sm font-medium text-bark-light hover:bg-sand transition-colors"
      >
        Write Another Entry
      </button>
    </div>
  );

  // New entry form
  const renderForm = () => (
    <div className="space-y-7 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-clay" />
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
            Daily Journal
          </h2>
          <p className="text-sm text-stone">{today}</p>
        </div>
      </div>

      {/* Mood Picker */}
      <MoodPicker value={mood} onChange={setMood} />

      {/* Journal text fields */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-4 w-4 text-clay" />
          <label className="text-sm font-medium text-bark">What went well today?</label>
        </div>
        <textarea
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          rows={3}
          placeholder="Celebrate your wins, no matter how small..."
          className={TEXTAREA_CLS}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CloudRain className="h-4 w-4 text-stone" />
          <label className="text-sm font-medium text-bark">What could have been better?</label>
        </div>
        <textarea
          value={wentBad}
          onChange={(e) => setWentBad(e.target.value)}
          rows={3}
          placeholder="Be honest but kind to yourself..."
          className={TEXTAREA_CLS}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-4 w-4 text-sage" />
          <label className="text-sm font-medium text-bark">Reflection (optional)</label>
        </div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={2}
          placeholder="Any thoughts, insights, or plans for tomorrow..."
          className={TEXTAREA_CLS}
        />
      </div>

      {/* Timed Task Sessions */}
      <TaskSessionInput
        tasks={timedTasks.map((t) => ({ id: t.id, name: t.name, target_minutes: t.target_minutes }))}
        values={taskMinutes}
        onChange={(taskId, minutes) => setTaskMinutes((prev) => ({ ...prev, [taskId]: minutes }))}
      />

      {/* Body Stats */}
      <BodyStatsInput
        weight={weight}
        calories={calories}
        onWeightChange={setWeight}
        onCaloriesChange={setCalories}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!wentWell.trim() || !wentBad.trim() || isSubmitting}
        className="w-full rounded-xl bg-bark px-4 py-3.5 text-sm font-semibold text-warm-white hover:bg-bark-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bark/15"
      >
        {isSubmitting ? "Saving..." : "Save Everything"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 rounded-xl bg-warm-white border border-sand/60 px-4 py-2 text-sm text-bark-light hover:bg-cream-dark transition-colors"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {sidebarOpen ? "Close" : "Past Entries"}
        </button>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="lg:sticky lg:top-10">
              <Card className="h-[calc(100vh-8rem)] overflow-hidden">
                <JournalSidebar
                  entries={entries}
                  selectedDate={selectedDate}
                  onSelect={(date) => { selectDate(date); setSidebarOpen(false); }}
                  onNewEntry={() => { handleNewEntry(); setSidebarOpen(false); }}
                />
              </Card>
            </div>
          </div>

          {/* Main content */}
          <div className={`flex-1 min-w-0 ${sidebarOpen ? "hidden lg:block" : "block"}`}>
            <Card>
              {submitted ? renderSuccess() : isViewingPast ? renderReadOnly() : renderForm()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
