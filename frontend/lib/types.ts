// TypeScript interfaces matching the backend Pydantic models

export interface BodyStats {
  current_weight_kg: number;
  target_weight_kg: number;
  calories_burnt_today: number;
  target_calories: number;
  weight_history: WeightEntry[];
}

export interface WeightEntry {
  date: string;
  weight_kg: number;
}

export interface HabitStatus {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

export interface TimedTask {
  id: string;
  name: string;
  minutes_today: number;
  target_minutes: number;
  streak_days: number;
  prompt_add_task: boolean;
}

export interface DashboardSummary {
  today: string;
  day_number: number;
  body: BodyStats;
  morning_habits: HabitStatus[];
  life_habits: HabitStatus[];
  timed_tasks: TimedTask[];
  overall_completion_pct: number;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  went_well: string;
  went_bad: string;
  reflection: string;
  ai_insight: string;
  created_at: string;
}

export interface SetupStatus {
  is_locked: boolean;
  start_date: string | null;
  day_number: number;
  end_date: string | null;
}

export interface SetupConfig {
  user_name: string;
  start_date: string;
  end_date: string;
  start_weight: number;
  target_weight: number;
  target_calories: number;
  whatsapp_number: string;
  habits_md_raw: string;
  config_hash: string;
  is_locked: boolean;
}

export interface HabitPreview {
  name: string;
  category: "morning" | "life";
  description: string;
}

export interface ReportSummary {
  overall_pct: number;
  weight_start: number;
  weight_end: number;
  best_streak_habit: string;
  best_streak_days: number;
  habit_stats: Record<string, number>;
  task_stats: Record<string, number>;
  dow_stats: Record<string, number>;
  ai_strengths: string;
  ai_improvements: string;
  ai_next_session: string;
  generated_at: string;
}
