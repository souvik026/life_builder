import type { DashboardSummary, SetupStatus, HabitPreview, JournalEntry, JournalListItem, TimedTask, GoalSummary, GoalCreate, GoalLog } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Mock data for local UI development (no backend needed) ──────────────

const MOCK_DASHBOARD: DashboardSummary = {
  today: new Date().toISOString().slice(0, 10),
  day_number: 42,
  body: {
    current_weight_kg: 78.5,
    target_weight_kg: 72.0,
    calories_burnt_today: 320,
    target_calories: 500,
    weight_history: [
      { date: "2026-01-30", weight_kg: 83.0 },
      { date: "2026-02-06", weight_kg: 82.2 },
      { date: "2026-02-13", weight_kg: 81.5 },
      { date: "2026-02-20", weight_kg: 80.8 },
      { date: "2026-02-27", weight_kg: 80.0 },
      { date: "2026-03-06", weight_kg: 79.2 },
      { date: "2026-03-13", weight_kg: 78.5 },
    ],
  },
  morning_habits: [
    { id: "1", name: "Wake up at 5:30 AM", completed: true, streak: 38 },
    { id: "2", name: "Meditation (10 min)", completed: true, streak: 42 },
    { id: "3", name: "Cold shower", completed: false, streak: 0 },
    { id: "4", name: "Journaling", completed: true, streak: 15 },
    { id: "5", name: "Exercise (30 min)", completed: false, streak: 0 },
    { id: "6", name: "Healthy breakfast", completed: true, streak: 30 },
  ],
  evening_habits: [
    { id: "12", name: "Review today's habits", completed: false, streak: 0 },
    { id: "13", name: "Prepare tomorrow's plan", completed: false, streak: 0 },
  ],
  life_habits: [
    { id: "7", name: "No sugar", completed: true, streak: 20 },
    { id: "8", name: "Read 30 min", completed: false, streak: 0 },
    { id: "9", name: "No social media before noon", completed: true, streak: 35 },
    { id: "10", name: "8 glasses of water", completed: true, streak: 12 },
    { id: "11", name: "Sleep by 10:30 PM", completed: false, streak: 0 },
  ],
  timed_tasks: [
    { id: "t1", name: "Deep work", minutes_today: 45, target_minutes: 60, streak_days: 31, prompt_add_task: true },
    { id: "t2", name: "Side project", minutes_today: 20, target_minutes: 45, streak_days: 18, prompt_add_task: false },
    { id: "t3", name: "Language learning", minutes_today: 0, target_minutes: 30, streak_days: 7, prompt_add_task: false },
  ],
  overall_completion_pct: 73,
  completion_trend: [
    { date: "2026-03-08", pct: 60 },
    { date: "2026-03-09", pct: 72 },
    { date: "2026-03-10", pct: 80 },
    { date: "2026-03-11", pct: 65 },
    { date: "2026-03-12", pct: 90 },
    { date: "2026-03-13", pct: 73 },
  ],
  mood_trend: [
    { date: "2026-03-08", mood: "good" },
    { date: "2026-03-09", mood: "great" },
    { date: "2026-03-10", mood: "okay" },
    { date: "2026-03-11", mood: "bad" },
    { date: "2026-03-12", mood: "good" },
    { date: "2026-03-13", mood: "great" },
  ],
  task_time_distribution: [
    { name: "Deep work", total_minutes: 1350 },
    { name: "Side project", total_minutes: 720 },
    { name: "Language learning", total_minutes: 420 },
  ],
};

const MOCK_SETUP_STATUS: SetupStatus = {
  is_locked: true,
  start_date: "2026-01-30",
  day_number: 42,
  end_date: "2026-04-30",
};

// ── Whether to use mock data (true when backend is unavailable) ─────────

let useMock = !process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (useMock) {
    throw new Error("Using mock data");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Public API functions ────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (useMock) return MOCK_DASHBOARD;
  return await fetchApi<DashboardSummary>("/dashboard/summary");
}

export async function getSetupStatus(): Promise<SetupStatus> {
  if (useMock) return MOCK_SETUP_STATUS;
  return await fetchApi<SetupStatus>("/setup/status");
}

export async function previewHabits(markdown: string): Promise<HabitPreview[]> {
  try {
    return await fetchApi<HabitPreview[]>("/setup/preview", {
      method: "POST",
      body: JSON.stringify({ markdown }),
    });
  } catch {
    // Parse markdown locally as fallback
    const habits: HabitPreview[] = [];
    let currentCategory: "morning" | "evening" | "life" = "morning";
    for (const line of markdown.split("\n")) {
      const lower = line.toLowerCase();
      if (lower.includes("morning")) currentCategory = "morning";
      else if (lower.includes("evening") || lower.includes("night") || lower.includes("afternoon")) currentCategory = "evening";
      else if (lower.includes("life") || lower.includes("daily") || lower.includes("general")) currentCategory = "life";
      const match = line.match(/^[-*]\s+(.+)/);
      if (match) {
        habits.push({ name: match[1].trim(), category: currentCategory, description: "" });
      }
    }
    return habits;
  }
}

export async function lockSetup(config: {
  user_name: string;
  start_date: string;
  start_weight: number;
  target_weight: number;
  target_calories: number;
  whatsapp_number: string;
  habits_md_raw: string;
  timed_tasks_raw: string;
}): Promise<{ config_hash: string }> {
  try {
    return await fetchApi<{ config_hash: string }>("/setup/lock", {
      method: "POST",
      body: JSON.stringify(config),
    });
  } catch {
    // Mock: generate a fake hash
    return { config_hash: "mock_" + Math.random().toString(36).slice(2, 10) };
  }
}

export async function logHabit(habit_id: string, completed: boolean, note?: string): Promise<void> {
  try {
    await fetchApi("/logs", {
      method: "POST",
      body: JSON.stringify({ habit_id, completed, note }),
    });
  } catch {
    // Mock: no-op
  }
}

export async function logBodyStats(data: {
  weight_kg: number;
  calories_burnt: number;
  target_calories: number;
}): Promise<void> {
  try {
    await fetchApi("/body-stats", { method: "POST", body: JSON.stringify(data) });
  } catch {
    // Mock: no-op
  }
}

export async function logTaskSession(task_id: string, minutes_done: number, note?: string): Promise<void> {
  try {
    await fetchApi("/task-sessions", {
      method: "POST",
      body: JSON.stringify({ task_id, minutes_done, note }),
    });
  } catch {
    // Mock: no-op
  }
}

export async function getJournalList(): Promise<JournalListItem[]> {
  try {
    return await fetchApi<JournalListItem[]>("/journals");
  } catch {
    return [];
  }
}

export async function getJournalByDate(date: string): Promise<JournalEntry | null> {
  try {
    return await fetchApi<JournalEntry>(`/journals/${date}`);
  } catch {
    return null;
  }
}

export async function getTimedTasks(): Promise<TimedTask[]> {
  try {
    return await fetchApi<TimedTask[]>("/timed-tasks");
  } catch {
    return [];
  }
}

export async function submitJournal(data: {
  went_well: string;
  went_bad: string;
  reflection?: string;
  mood?: string | null;
}): Promise<JournalEntry | null> {
  try {
    return await fetchApi<JournalEntry>("/journals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

// ── Goals ──────────────────────────────────────────────────────────────

const MOCK_GOALS: GoalSummary[] = [
  { id: "g1", category: "health", title: "Reach 72kg", description: "Lose weight through consistent exercise and diet", current_value: 78.5, target_value: 72, unit: "kg", progress_pct: 69, days_remaining: 48, status: "active", source: "manual" },
  { id: "g2", category: "career", title: "Complete AWS certification", description: "Study and pass the AWS Solutions Architect exam", current_value: 6, target_value: 12, unit: "modules", progress_pct: 50, days_remaining: 30, status: "active", source: "manual" },
  { id: "g3", category: "personal", title: "Read 12 books", description: "Read one book per month", current_value: 4, target_value: 12, unit: "books", progress_pct: 33, days_remaining: 270, status: "active", source: "manual" },
  { id: "g4", category: "financial", title: "Save emergency fund", description: "Build 3-month emergency savings", current_value: 2000, target_value: 5000, unit: "$", progress_pct: 40, days_remaining: 90, status: "active", source: "manual" },
  { id: "g5", category: "learning", title: "Learn Spanish basics", description: "Complete Duolingo A1 course", current_value: 30, target_value: 90, unit: "lessons", progress_pct: 33, days_remaining: 60, status: "active", source: "manual" },
];

export async function getGoals(status?: string): Promise<GoalSummary[]> {
  if (useMock) return MOCK_GOALS.filter(g => !status || g.status === status);
  const query = status ? `?status=${status}` : "";
  return await fetchApi<GoalSummary[]>(`/goals${query}`);
}

export async function createGoal(data: GoalCreate): Promise<GoalSummary> {
  try {
    return await fetchApi<GoalSummary>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    // Mock: create a fake goal
    const mock: GoalSummary = {
      id: "g_" + Math.random().toString(36).slice(2, 8),
      category: data.category as GoalSummary["category"],
      title: data.title,
      description: data.description || "",
      current_value: 0,
      target_value: data.target_value || null,
      unit: data.unit || "",
      progress_pct: 0,
      days_remaining: null,
      status: "active",
      source: "manual",
    };
    MOCK_GOALS.push(mock);
    return mock;
  }
}

export async function updateGoal(goalId: string, data: Partial<GoalSummary>): Promise<GoalSummary> {
  try {
    return await fetchApi<GoalSummary>(`/goals/${goalId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    const idx = MOCK_GOALS.findIndex(g => g.id === goalId);
    if (idx >= 0) Object.assign(MOCK_GOALS[idx], data);
    return MOCK_GOALS[idx];
  }
}

export async function logGoalProgress(goalId: string, value: number, note?: string): Promise<GoalLog | null> {
  try {
    return await fetchApi<GoalLog>(`/goals/${goalId}/progress`, {
      method: "POST",
      body: JSON.stringify({ value, note }),
    });
  } catch {
    return null;
  }
}

export function setUseMock(mock: boolean): void {
  useMock = mock;
}
