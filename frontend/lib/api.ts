import type { DashboardSummary, SetupStatus, HabitPreview, JournalEntry } from "./types";

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
};

const MOCK_SETUP_STATUS: SetupStatus = {
  is_locked: true,
  start_date: "2026-01-30",
  day_number: 42,
  end_date: "2026-04-30",
};

// ── Whether to use mock data (true when backend is unavailable) ─────────

let useMock = true;

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
  try {
    return await fetchApi<DashboardSummary>("/dashboard/summary");
  } catch {
    return MOCK_DASHBOARD;
  }
}

export async function getSetupStatus(): Promise<SetupStatus> {
  try {
    return await fetchApi<SetupStatus>("/setup/status");
  } catch {
    return MOCK_SETUP_STATUS;
  }
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
    let currentCategory: "morning" | "life" = "morning";
    for (const line of markdown.split("\n")) {
      if (line.toLowerCase().includes("morning")) currentCategory = "morning";
      if (line.toLowerCase().includes("life")) currentCategory = "life";
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

export async function submitJournal(data: {
  went_well: string;
  went_bad: string;
  reflection?: string;
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

export function setUseMock(mock: boolean): void {
  useMock = mock;
}
