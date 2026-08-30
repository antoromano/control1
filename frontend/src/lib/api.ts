const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type MediaType = "BOOK" | "MOVIE" | "SERIES";
export type HabitType = "GOOD" | "BAD";
export type HabitTrackingType = "CHECKBOX" | "COUNT";
export type PeriodType = "WEEK" | "MONTH";

export interface DailyLog {
  id: string;
  date: string;
  kcal: number | null;
  carbsG: number | null;
  proteinG: number | null;
  fatG: number | null;
  sleepHours: number | null;
}

export interface MediaLog {
  id: string;
  date: string;
  type: MediaType;
  title: string;
  rating: number | null;
  notes: string | null;
}

export interface ExerciseMuscle {
  muscleGroup: string;
  factor: number;
}

export interface Exercise {
  id: string;
  name: string;
  parentId: string | null;
  muscles: ExerciseMuscle[];
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  date: string;
  time: string | null;
  reps: number;
  weight: number;
  rir: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise?: Exercise;
}

export interface ExerciseHistory {
  daysSinceLastTrained: number | null;
  lastDate: string | null;
  recentLogs: ExerciseLog[];
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  trackingType: HabitTrackingType;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  habit?: Habit;
}

export interface MuscleVolume {
  muscleGroup: string;
  volume: number;
}

export interface NutritionAvg {
  kcal: number | null;
  carbsG: number | null;
  proteinG: number | null;
  fatG: number | null;
  sleepHours: number | null;
}

export interface PeriodNote {
  id: string;
  periodType: PeriodType;
  periodStart: string;
  category: string;
  decision: string;
  createdAt: string;
}

export const api = {
  health: () => request<{ status: string }>("GET", "/health"),

  dailyLogs: (from?: string, to?: string) =>
    request<DailyLog[]>("GET", `/api/daily-logs?${qs({ from, to })}`),
  upsertDailyLog: (data: Partial<DailyLog> & { date: string }) =>
    request<DailyLog>("POST", "/api/daily-logs", data),
  deleteDailyLog: (id: string) => request<void>("DELETE", `/api/daily-logs/${id}`),

  mediaLogs: () => request<MediaLog[]>("GET", "/api/media-logs"),
  createMediaLog: (data: Omit<MediaLog, "id">) =>
    request<MediaLog>("POST", "/api/media-logs", data),
  deleteMediaLog: (id: string) => request<void>("DELETE", `/api/media-logs/${id}`),

  exercises: () => request<Exercise[]>("GET", "/api/exercises"),
  createExercise: (data: { name: string; parentId?: string | null; muscles: ExerciseMuscle[] }) =>
    request<Exercise>("POST", "/api/exercises", data),
  exerciseHistory: (id: string) =>
    request<ExerciseHistory>("GET", `/api/exercises/${id}/history`),
  createExerciseLog: (
    exerciseId: string,
    data: {
      date: string;
      reps: number;
      weight: number;
      rir?: number;
      restSeconds?: number;
      notes?: string;
    }
  ) => request<ExerciseLog>("POST", `/api/exercises/${exerciseId}/logs`, data),

  exerciseLogsByDate: (date: string) =>
    request<ExerciseLog[]>("GET", `/api/exercise-logs?${qs({ date })}`),
  deleteExerciseLog: (id: string) => request<void>("DELETE", `/api/exercise-logs/${id}`),

  habits: () => request<Habit[]>("GET", "/api/habits"),
  createHabit: (data: Omit<Habit, "id">) => request<Habit>("POST", "/api/habits", data),
  habitLogsByDate: (date: string) =>
    request<HabitLog[]>("GET", `/api/habits/logs?${qs({ date })}`),
  upsertHabitLog: (habitId: string, date: string, value: number) =>
    request<HabitLog>("POST", `/api/habits/${habitId}/logs`, { date, value }),
  deleteHabitLog: (id: string) => request<void>("DELETE", `/api/habits/logs/${id}`),

  muscleVolume: (from: string, to: string) =>
    request<MuscleVolume[]>("GET", `/api/stats/muscle-volume?${qs({ from, to })}`),
  nutritionAvg: (from: string, to: string) =>
    request<NutritionAvg>("GET", `/api/stats/nutrition?${qs({ from, to })}`),

  periodNotes: () => request<PeriodNote[]>("GET", "/api/period-notes"),
  createPeriodNote: (data: Omit<PeriodNote, "id" | "createdAt">) =>
    request<PeriodNote>("POST", "/api/period-notes", data),
};

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
  return new URLSearchParams(entries).toString();
}
