"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Target,
  Heart,
  Briefcase,
  User,
  DollarSign,
  Users,
  BookOpen,
  MoreHorizontal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { GoalSummary } from "@/lib/types";

const CATEGORIES = [
  { value: "all", label: "All", icon: Target },
  { value: "health", label: "Health", icon: Heart },
  { value: "career", label: "Career", icon: Briefcase },
  { value: "personal", label: "Personal", icon: User },
  { value: "financial", label: "Financial", icon: DollarSign },
  { value: "social", label: "Social", icon: Users },
  { value: "learning", label: "Learning", icon: BookOpen },
  { value: "other", label: "Other", icon: MoreHorizontal },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  health: "bg-sage/10 text-sage-dark",
  career: "bg-terracotta/10 text-terracotta-dark",
  personal: "bg-clay/10 text-clay",
  financial: "bg-sage-light/20 text-sage-dark",
  social: "bg-terracotta-light/20 text-terracotta-dark",
  learning: "bg-sand/60 text-bark-light",
  other: "bg-stone-light/20 text-stone",
};

export default function GoalsPage() {
  const { goals, isLoading, addGoal, logProgress } = useGoals();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [newDescription, setNewDescription] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");

  // Progress log state
  const [progressValue, setProgressValue] = useState("");
  const [progressNote, setProgressNote] = useState("");

  // LLM generation state
  const [visionText, setVisionText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const { generateFromVision } = useGoals();

  const filteredGoals = activeFilter === "all"
    ? goals
    : goals.filter((g) => g.category === activeFilter);

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;
    await addGoal({
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim(),
      target_value: newTarget ? parseFloat(newTarget) : undefined,
      unit: newUnit.trim(),
      target_date: newTargetDate || undefined,
    });
    setNewTitle("");
    setNewCategory("personal");
    setNewDescription("");
    setNewTarget("");
    setNewUnit("");
    setNewTargetDate("");
    setShowAddForm(false);
  };

  const handleLogProgress = async (goalId: string) => {
    if (!progressValue) return;
    await logProgress(goalId, parseFloat(progressValue), progressNote.trim());
    setProgressValue("");
    setProgressNote("");
    setExpandedGoal(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Target className="h-8 w-8 text-sage animate-pulse" />
          <span className="text-sm text-stone">Loading goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-bark">
                My Goals
              </h1>
              <p className="mt-2 text-sm text-stone">
                {goals.length} goals &middot; {goals.filter((g) => g.status === "active").length} active
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{showAddForm ? "Cancel" : "Add Goal"}</span>
            </button>
          </div>
        </div>

        {/* LLM Generation Form */}
        <div className="mb-8 rounded-2xl border border-sand/60 bg-sage/5 px-6 py-5 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10">
              <Sparkles className="h-4 w-4 text-sage" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-bark">AI-Powered Goal Setting</p>
              <p className="mt-1 text-xs text-stone mb-3">
                Describe your vision for the future, and AI will extract specific, trackable goals for you.
              </p>
              
              <textarea
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                placeholder="E.g., I want to run a marathon this year and save $5000 for a vacation..."
                rows={3}
                className="w-full rounded-xl border border-sand bg-warm-white px-4 py-3 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none transition-all"
                disabled={isGenerating}
              />
              
              {generationError && (
                <p className="mt-2 text-xs text-red-500">{generationError}</p>
              )}
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={async () => {
                    if (!visionText.trim()) return;
                    setIsGenerating(true);
                    setGenerationError("");
                    try {
                      await generateFromVision(visionText);
                      setVisionText("");
                    } catch (err) {
                      setGenerationError("Failed to generate goals. Check your OpenAI API key in backend/.env");
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={!visionText.trim() || isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-sage-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? "Generating..." : "Generate Goals"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <Card className="mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle>New Goal</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-bark-light">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Reach 72kg"
                    className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-bark-light">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-bark-light">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What does achieving this goal look like?"
                  rows={2}
                  className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-bark-light">Target Value</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="e.g., 72"
                    className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-bark-light">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g., kg, books, $"
                    className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-bark-light">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-sand bg-warm-white px-4 py-2.5 text-sm text-bark focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddGoal}
                  disabled={!newTitle.trim()}
                  className="rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter Pills */}
        <div className="mb-8 flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeFilter === cat.value;
            const count = cat.value === "all" ? goals.length : goals.filter((g) => g.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sage text-white"
                    : "bg-warm-white border border-sand/60 text-stone hover:bg-cream-dark hover:text-bark-light"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                {count > 0 && (
                  <span className={`ml-1 ${isActive ? "text-white/70" : "text-stone-light"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Goals Grid */}
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <div className="rounded-2xl border border-sand/40 bg-warm-white py-16 text-center animate-fade-in">
              <Target className="mx-auto h-10 w-10 text-stone-light" />
              <p className="mt-3 text-sm text-stone">No goals yet. Add your first goal to get started.</p>
            </div>
          ) : (
            filteredGoals.map((goal, i) => (
              <GoalCardItem
                key={goal.id}
                goal={goal}
                index={i}
                isExpanded={expandedGoal === goal.id}
                onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                progressValue={progressValue}
                progressNote={progressNote}
                onProgressValueChange={setProgressValue}
                onProgressNoteChange={setProgressNote}
                onLogProgress={() => handleLogProgress(goal.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function GoalCardItem({
  goal,
  index,
  isExpanded,
  onToggleExpand,
  progressValue,
  progressNote,
  onProgressValueChange,
  onProgressNoteChange,
  onLogProgress,
}: {
  goal: GoalSummary;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  progressValue: string;
  progressNote: string;
  onProgressValueChange: (v: string) => void;
  onProgressNoteChange: (v: string) => void;
  onLogProgress: () => void;
}) {
  const catColor = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.other;

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${0.15 + index * 0.06}s` }}
    >
      <Card className="transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${catColor}`}>
                {goal.category}
              </span>
              {goal.status !== "active" && (
                <Badge variant={goal.status === "completed" ? "success" : "default"}>
                  {goal.status}
                </Badge>
              )}
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-bark">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="mt-1 text-sm text-stone line-clamp-2">{goal.description}</p>
            )}
          </div>
          {goal.target_value !== null && (
            <div className="shrink-0 text-right">
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-bark">
                {Math.round(goal.progress_pct)}%
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {goal.target_value !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-stone mb-2">
              <span>
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
              {goal.days_remaining !== null && (
                <span>{goal.days_remaining} days left</span>
              )}
            </div>
            <div className="h-2.5 w-full rounded-full bg-sand/50">
              <div
                className="h-2.5 rounded-full bg-sage transition-all duration-700 ease-out"
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Expand/collapse for progress logging */}
        <div className="mt-4 border-t border-sand/40 pt-3">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 text-xs font-medium text-sage hover:text-sage-dark transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Log Progress
          </button>

          {isExpanded && (
            <div className="mt-3 flex items-end gap-3 animate-fade-in">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-bark-light">
                  New value {goal.unit && `(${goal.unit})`}
                </label>
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => onProgressValueChange(e.target.value)}
                  placeholder="e.g., 76.5"
                  className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-bark-light">Note (optional)</label>
                <input
                  type="text"
                  value={progressNote}
                  onChange={(e) => onProgressNoteChange(e.target.value)}
                  placeholder="Quick note"
                  className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2 text-sm text-bark placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
                />
              </div>
              <button
                onClick={onLogProgress}
                disabled={!progressValue}
                className="shrink-0 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Log
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
