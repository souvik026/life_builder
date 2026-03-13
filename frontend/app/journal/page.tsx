"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { submitJournal } from "@/lib/api";
import { BookOpen, Leaf, Sparkles, Sun, CloudRain, Compass } from "lucide-react";

const TEXTAREA_CLS =
  "w-full rounded-xl border border-sand bg-warm-white px-4 py-3 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all leading-relaxed";

export default function JournalPage() {
  const [wentWell, setWentWell] = useState("");
  const [wentBad, setWentBad] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitJournal({ went_well: wentWell, went_bad: wentBad, reflection });
    if (result?.ai_insight) {
      setAiInsight(result.ai_insight);
    }
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 py-14">
          <Card className="text-center py-10 animate-scale-in">
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
              onClick={() => {
                setSubmitted(false);
                setWentWell("");
                setWentBad("");
                setReflection("");
                setAiInsight(null);
              }}
              className="mt-8 rounded-xl bg-cream-dark px-6 py-2.5 text-sm font-medium text-bark-light hover:bg-sand transition-colors"
            >
              Write Another Entry
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/10">
              <BookOpen className="h-5 w-5 text-clay" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-bark">
                Daily Journal
              </h1>
              <p className="text-sm text-stone">{today}</p>
            </div>
          </div>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sun className="h-4 w-4 text-clay" />
                <label className="text-sm font-medium text-bark">What went well today?</label>
              </div>
              <textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                rows={4}
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
                rows={4}
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
                rows={3}
                placeholder="Any thoughts, insights, or plans for tomorrow..."
                className={TEXTAREA_CLS}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!wentWell.trim() || !wentBad.trim() || isSubmitting}
              className="w-full rounded-xl bg-bark px-4 py-3.5 text-sm font-semibold text-warm-white hover:bg-bark-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bark/15"
            >
              {isSubmitting ? "Saving..." : "Save Journal Entry"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
