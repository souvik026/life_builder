import type { DashboardSummary, SetupStatus, HabitPreview, JournalEntry, JournalListItem, TimedTask, GoalSummary, GoalCreate, GoalLog } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://life-planner-backend-0q41.onrender.com";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "No error details available");
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return res.json();
}

// ── Dashboard ───────────────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return await fetchApi<DashboardSummary>("/dashboard/summary");
}

// ── Setup ───────────────────────────────────────────────────────────────

export async function getSetupStatus(): Promise<SetupStatus> {
  return await fetchApi<SetupStatus>("/setup/status");
}

export async function previewHabits(markdown: string): Promise<HabitPreview[]> {
  return await fetchApi<HabitPreview[]>("/setup/preview", {
    method: "POST",
    body: JSON.stringify({ markdown }),
  });
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
  return await fetchApi<{ config_hash: string }>("/setup/lock", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

// ── Habits / Logs ───────────────────────────────────────────────────────

export async function logHabit(habit_id: string, completed: boolean, note?: string): Promise<void> {
  await fetchApi("/logs", {
    method: "POST",
    body: JSON.stringify({ habit_id, completed, note }),
  });
}

// ── Body Stats ──────────────────────────────────────────────────────────

export async function logBodyStats(data: {
  weight_kg: number;
  calories_burnt: number;
  target_calories: number;
}): Promise<void> {
  await fetchApi("/body-stats", { method: "POST", body: JSON.stringify(data) });
}

// ── Timed Tasks ─────────────────────────────────────────────────────────

export async function logTaskSession(task_id: string, minutes_done: number, note?: string): Promise<void> {
  await fetchApi("/task-sessions", {
    method: "POST",
    body: JSON.stringify({ task_id, minutes_done, note }),
  });
}

export async function getTimedTasks(): Promise<TimedTask[]> {
  return await fetchApi<TimedTask[]>("/timed-tasks");
}

// ── Journals ────────────────────────────────────────────────────────────

export async function getJournalList(): Promise<JournalListItem[]> {
  return await fetchApi<JournalListItem[]>("/journals");
}

export async function getJournalByDate(date: string): Promise<JournalEntry | null> {
  try {
    return await fetchApi<JournalEntry>(`/journals/${date}`);
  } catch {
    return null;
  }
}

export async function getJournalById(id: string): Promise<JournalEntry | null> {
  try {
    return await fetchApi<JournalEntry>(`/journals/entry/${id}`);
  } catch {
    return null;
  }
}

export async function submitJournal(data: {
  went_well: string;
  went_bad: string;
  reflection?: string;
  mood?: string | null;
}): Promise<JournalEntry | null> {
  return await fetchApi<JournalEntry>("/journals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitNote(data: {
  title: string;
  content: string;
}): Promise<JournalEntry | null> {
  return await fetchApi<JournalEntry>("/journals/note", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Goals ───────────────────────────────────────────────────────────────

export async function getGoals(status?: string): Promise<GoalSummary[]> {
  const query = status ? `?status=${status}` : "";
  return await fetchApi<GoalSummary[]>(`/goals${query}`);
}

export async function createGoal(data: GoalCreate): Promise<GoalSummary> {
  return await fetchApi<GoalSummary>("/goals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGoal(goalId: string, data: Partial<GoalSummary>): Promise<GoalSummary> {
  return await fetchApi<GoalSummary>(`/goals/${goalId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function logGoalProgress(goalId: string, value: number, note?: string): Promise<GoalLog | null> {
  return await fetchApi<GoalLog>(`/goals/${goalId}/progress`, {
    method: "POST",
    body: JSON.stringify({ value, note }),
  });
}

export async function createGoalsFromLLM(rawText: string): Promise<GoalSummary[]> {
  const goals = await fetchApi<GoalSummary[]>("/goals/from-llm", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText }),
  });
  return goals;
}
