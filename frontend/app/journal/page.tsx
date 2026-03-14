"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { submitJournal, submitNote, logTaskSession, logBodyStats } from "@/lib/api";
import { useJournal } from "@/hooks/useJournal";
import { JournalSidebar } from "@/components/journal/JournalSidebar";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { TaskSessionInput } from "@/components/journal/TaskSessionInput";
import { BodyStatsInput } from "@/components/journal/BodyStatsInput";
import { BookOpen, Sun, CloudRain, Compass, Sparkles, Leaf, Menu, X, PenLine } from "lucide-react";

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
  const { entries, selectedDate, selectedEntry, timedTasks, selectEntry, clearSelection, refreshEntries } = useJournal();

  const [activeTab, setActiveTab] = useState<"journal" | "note">("journal");
  
  // Journal Form State
  const [mood, setMood] = useState<string | null>(null);
  const [wentWell, setWentWell] = useState("");
  const [wentBad, setWentBad] = useState("");
  const [reflection, setReflection] = useState("");
  const [taskMinutes, setTaskMinutes] = useState<Record<string, number>>({});
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  
  // Note Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isViewingPast = selectedEntry !== null;

  const resetForm = () => {
    setMood(null);
    setWentWell("");
    setWentBad("");
    setReflection("");
    setTaskMinutes({});
    setWeight("");
    setCalories("");
    setNoteTitle("");
    setNoteContent("");
    setSubmitted(false);
    setAiInsight(null);
  };

  const handleNewEntry = () => {
    clearSelection();
    resetForm();
  };

  const handleJournalSubmit = async () => {
    setIsSubmitting(true);
    const promises: Promise<unknown>[] = [];

    promises.push(
      submitJournal({ went_well: wentWell, went_bad: wentBad, reflection, mood }).then((result) => {
        if (result?.ai_insight) setAiInsight(result.ai_insight);
      })
    );

    for (const [taskId, minutes] of Object.entries(taskMinutes)) {
      if (minutes > 0) promises.push(logTaskSession(taskId, minutes));
    }

    const w = parseFloat(weight);
    const c = parseInt(calories);
    if (w > 0 || c > 0) promises.push(logBodyStats({ weight_kg: w || 0, calories_burnt: c || 0, target_calories: 500 }));

    try {
      await Promise.all(promises);
      setSubmitted(true);
      refreshEntries();
    } catch {
      alert("Error saving journal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoteSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitNote({ title: noteTitle, content: noteContent });
      setSubmitted(true);
      refreshEntries();
    } catch {
      alert("Error saving note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReadOnly = () => {
    if (!selectedEntry) return null;
    
    const isNote = selectedEntry.entry_type === "note";
    
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isNote ? <PenLine className="h-5 w-5 text-clay" /> : <BookOpen className="h-5 w-5 text-clay" />}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
                  {selectedDate === today ? "Today" : new Date(selectedDate! + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${isNote ? 'bg-sand/30 text-stone-dark' : 'bg-sage/10 text-sage-dark'}`}>
                  {isNote ? 'Note' : 'Journal'}
                </span>
              </div>
            </div>
          </div>
          {!isNote && selectedEntry.mood && (
            <span className="text-2xl">{MOOD_EMOJI[selectedEntry.mood] || ""}</span>
          )}
        </div>

        {isNote ? (
          <div className="space-y-4">
            {selectedEntry.title && (
              <h3 className="text-lg font-medium text-bark">{selectedEntry.title}</h3>
            )}
            <div className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4 whitespace-pre-wrap">
              {selectedEntry.went_bad /* Content is stored in went_bad for notes */}
            </div>
          </div>
        ) : (
          <>
            {selectedEntry.went_well && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-clay" />
                  <span className="text-sm font-medium text-bark">What went well</span>
                </div>
                <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4 whitespace-pre-wrap">{selectedEntry.went_well}</p>
              </div>
            )}

            {selectedEntry.went_bad && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="h-4 w-4 text-stone" />
                  <span className="text-sm font-medium text-bark">What could have been better</span>
                </div>
                <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4 whitespace-pre-wrap">{selectedEntry.went_bad}</p>
              </div>
            )}

            {selectedEntry.reflection && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="h-4 w-4 text-sage" />
                  <span className="text-sm font-medium text-bark">Reflection</span>
                </div>
                <p className="text-sm text-bark-light leading-relaxed bg-cream rounded-xl p-4 whitespace-pre-wrap">{selectedEntry.reflection}</p>
              </div>
            )}

            {selectedEntry.ai_insight && (
              <div className="rounded-xl bg-sage/5 border border-sage/15 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-sage" />
                  <span className="text-sm font-medium text-sage-dark">AI Insight</span>
                </div>
                <p className="text-sm text-bark-light leading-relaxed whitespace-pre-wrap">{selectedEntry.ai_insight}</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="text-center py-10 animate-scale-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 mb-5">
        <Leaf className="h-8 w-8 text-sage" />
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
        {activeTab === "journal" ? "Journal Saved" : "Note Saved"}
      </h2>
      <p className="mt-1 text-sm text-stone">{today}</p>
      {aiInsight && (
        <div className="mt-6 mx-auto max-w-md rounded-xl bg-sage/5 border border-sage/15 p-5 text-left animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-sage" />
            <span className="text-sm font-medium text-sage-dark">AI Insight</span>
          </div>
          <p className="text-sm text-bark-light leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
        </div>
      )}
      <button
        onClick={handleNewEntry}
        className="mt-8 rounded-xl bg-cream-dark px-6 py-2.5 text-sm font-medium text-bark-light hover:bg-sand transition-colors"
      >
        Write Another {activeTab === "journal" ? "Entry" : "Note"}
      </button>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-7 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-clay" />
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-bark">
            New Entry
          </h2>
          <p className="text-sm text-stone">{today}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sand">
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "journal" ? "border-sage text-sage-dark" : "border-transparent text-stone hover:text-bark"
          }`}
        >
          Daily Journal
        </button>
        <button
          onClick={() => setActiveTab("note")}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "note" ? "border-sage text-sage-dark" : "border-transparent text-stone hover:text-bark"
          }`}
        >
          Simple Note
        </button>
      </div>

      {activeTab === "note" ? (
        <div className="space-y-5 animate-fade-in-up">
          <div>
            <label className="block text-sm font-medium text-bark mb-2">Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="E.g., Ideas for next project"
              className={TEXTAREA_CLS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-2">Content</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              placeholder="What's on your mind?"
              className={TEXTAREA_CLS}
            />
          </div>
          <button
            onClick={handleNoteSubmit}
            disabled={!noteContent.trim() || !noteTitle.trim() || isSubmitting}
            className="w-full rounded-xl bg-bark px-4 py-3.5 text-sm font-semibold text-warm-white hover:bg-bark-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bark/15"
          >
            {isSubmitting ? "Saving..." : "Save Note"}
          </button>
        </div>
      ) : (
        <div className="space-y-7 animate-fade-in-up">
          <MoodPicker value={mood} onChange={setMood} />

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

          <TaskSessionInput
            tasks={timedTasks.map((t) => ({ id: t.id, name: t.name, target_minutes: t.target_minutes }))}
            values={taskMinutes}
            onChange={(taskId, minutes) => setTaskMinutes((prev) => ({ ...prev, [taskId]: minutes }))}
          />

          <BodyStatsInput
            weight={weight}
            calories={calories}
            onWeightChange={setWeight}
            onCaloriesChange={setCalories}
          />

          <button
            onClick={handleJournalSubmit}
            disabled={!wentWell.trim() || !wentBad.trim() || isSubmitting}
            className="w-full rounded-xl bg-bark px-4 py-3.5 text-sm font-semibold text-warm-white hover:bg-bark-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bark/15"
          >
            {isSubmitting ? "Saving..." : "Save Everything"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 rounded-xl bg-warm-white border border-sand/60 px-4 py-2 text-sm text-bark-light hover:bg-cream-dark transition-colors"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {sidebarOpen ? "Close" : "Past Entries"}
        </button>

        <div className="flex gap-6">
          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="lg:sticky lg:top-10">
              <Card className="h-[calc(100vh-8rem)] overflow-hidden">
                <JournalSidebar
                  entries={entries}
                  selectedId={selectedEntry?.id || null}
                  onSelect={(id, date) => { selectEntry(id, date); setSidebarOpen(false); }}
                  onNewEntry={() => { handleNewEntry(); setSidebarOpen(false); }}
                />
              </Card>
            </div>
          </div>

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
