import { useEffect, useState } from "react";
import { api, type Habit, type HabitLog } from "../lib/api";
import { Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { todayISO } from "../lib/date";

export default function Habits() {
  const [date, setDate] = useState(todayISO());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const [newHabit, setNewHabit] = useState({ name: "", type: "GOOD", trackingType: "CHECKBOX" });

  const loadHabits = () => {
    api.habits().then(setHabits);
  };
  const loadLogs = () => {
    api.habitLogsByDate(date).then(setLogs);
  };

  useEffect(loadHabits, []);
  useEffect(loadLogs, [date]);

  async function setValue(habitId: string, value: number) {
    await api.upsertHabitLog(habitId, date, value);
    loadLogs();
  }

  async function handleCreateHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabit.name.trim()) return;
    await api.createHabit({
      name: newHabit.name.trim(),
      type: newHabit.type as Habit["type"],
      trackingType: newHabit.trackingType as Habit["trackingType"],
    });
    setNewHabit({ name: "", type: "GOOD", trackingType: "CHECKBOX" });
    loadHabits();
  }

  const good = habits.filter((h) => h.type === "GOOD");
  const bad = habits.filter((h) => h.type === "BAD");

  const valueFor = (habitId: string) => logs.find((l) => l.habitId === habitId)?.value ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Abitudini</SectionTitle>
        <Card>
          <Field label="Data">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HabitGroup title="Buone abitudini" habits={good} valueFor={valueFor} onChange={setValue} />
        <HabitGroup
          title="Abitudini da correggere"
          habits={bad}
          valueFor={valueFor}
          onChange={setValue}
        />
      </div>

      <div>
        <SectionTitle>Nuova abitudine</SectionTitle>
        <Card>
          <form onSubmit={handleCreateHabit} className="flex flex-wrap items-end gap-3">
            <Field label="Nome">
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="es. Bere 2L di acqua"
              />
            </Field>
            <Field label="Tipo">
              <select
                value={newHabit.type}
                onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value })}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
              >
                <option value="GOOD">Buona</option>
                <option value="BAD">Da correggere</option>
              </select>
            </Field>
            <Field label="Tracciamento">
              <select
                value={newHabit.trackingType}
                onChange={(e) => setNewHabit({ ...newHabit, trackingType: e.target.value })}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
              >
                <option value="CHECKBOX">Sì/No</option>
                <option value="COUNT">Conteggio</option>
              </select>
            </Field>
            <Button type="submit" variant="ghost">
              Aggiungi
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function HabitGroup({
  title,
  habits,
  valueFor,
  onChange,
}: {
  title: string;
  habits: Habit[];
  valueFor: (id: string) => number;
  onChange: (habitId: string, value: number) => void;
}) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-neutral-300">{title}</h3>
      {habits.length === 0 && <p className="text-sm text-neutral-500">Nessuna abitudine qui.</p>}
      <ul className="flex flex-col gap-2">
        {habits.map((h) => {
          const value = valueFor(h.id);
          return (
            <li key={h.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-neutral-200">{h.name}</span>
              {h.trackingType === "CHECKBOX" ? (
                <input
                  type="checkbox"
                  checked={value > 0}
                  onChange={(e) => onChange(h.id, e.target.checked ? 1 : 0)}
                  className="h-5 w-5 accent-neutral-100"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => onChange(h.id, Math.max(0, value - 1))}>
                    -
                  </Button>
                  <span className="w-6 text-center text-sm">{value}</span>
                  <Button variant="ghost" onClick={() => onChange(h.id, value + 1)}>
                    +
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
