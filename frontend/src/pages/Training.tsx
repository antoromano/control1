import { useEffect, useState } from "react";
import { api, type Exercise, type ExerciseHistory, type ExerciseLog } from "../lib/api";
import { Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { formatDate, todayISO } from "../lib/date";

export default function Training() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [todayLogs, setTodayLogs] = useState<ExerciseLog[]>([]);

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscle, setNewExerciseMuscle] = useState("");

  const [logForm, setLogForm] = useState({
    date: todayISO(),
    reps: "",
    weight: "",
    rir: "",
    restSeconds: "",
  });

  const loadExercises = () => api.exercises().then(setExercises);
  const loadTodayLogs = () => api.exerciseLogsByDate(todayISO()).then(setTodayLogs);

  useEffect(() => {
    loadExercises();
    loadTodayLogs();
  }, []);

  useEffect(() => {
    if (selectedId) {
      api.exerciseHistory(selectedId).then(setHistory);
    } else {
      setHistory(null);
    }
  }, [selectedId]);

  async function handleCreateExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    const exercise = await api.createExercise({
      name: newExerciseName.trim(),
      muscleGroup: newExerciseMuscle.trim() || null,
    });
    setNewExerciseName("");
    setNewExerciseMuscle("");
    await loadExercises();
    setSelectedId(exercise.id);
  }

  async function handleLogSet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !logForm.reps || !logForm.weight) return;
    await api.createExerciseLog(selectedId, {
      date: logForm.date,
      reps: Number(logForm.reps),
      weight: Number(logForm.weight),
      rir: logForm.rir ? Number(logForm.rir) : undefined,
      restSeconds: logForm.restSeconds ? Number(logForm.restSeconds) : undefined,
    });
    setLogForm({ ...logForm, reps: "", weight: "", rir: "", restSeconds: "" });
    api.exerciseHistory(selectedId).then(setHistory);
    loadTodayLogs();
  }

  async function handleDeleteLog(id: string) {
    await api.deleteExerciseLog(id);
    if (selectedId) api.exerciseHistory(selectedId).then(setHistory);
    loadTodayLogs();
  }

  const todayByExercise = groupBy(todayLogs, (l) => l.exercise?.name ?? l.exerciseId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Allenamento</SectionTitle>
        <Card className="flex flex-col gap-4">
          <Field label="Esercizio">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
            >
              <option value="">Seleziona un esercizio...</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                  {ex.muscleGroup ? ` (${ex.muscleGroup})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <form onSubmit={handleCreateExercise} className="flex flex-wrap items-end gap-3">
            <Field label="Nuovo esercizio">
              <Input
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="es. Squat"
              />
            </Field>
            <Field label="Gruppo muscolare">
              <Input
                value={newExerciseMuscle}
                onChange={(e) => setNewExerciseMuscle(e.target.value)}
                placeholder="es. gambe"
              />
            </Field>
            <Button type="submit" variant="ghost">
              Aggiungi esercizio
            </Button>
          </form>
        </Card>
      </div>

      {selectedId && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-sm font-medium text-neutral-300">Quadro completo</h3>
            {history ? (
              <div className="text-sm text-neutral-400">
                {history.lastDate ? (
                  <p>
                    Ultima volta:{" "}
                    <span className="text-neutral-100">{formatDate(history.lastDate)}</span> (
                    {history.daysSinceLastTrained} giorni fa)
                  </p>
                ) : (
                  <p>Nessuno storico per questo esercizio.</p>
                )}
                <ul className="mt-3 flex flex-col gap-1">
                  {history.recentLogs.slice(0, 8).map((l) => (
                    <li key={l.id} className="flex justify-between border-t border-neutral-800 pt-1">
                      <span>{formatDate(l.date)}</span>
                      <span className="text-neutral-100">
                        {l.weight}kg × {l.reps} {l.rir !== null ? `RIR${l.rir}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Caricamento...</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-medium text-neutral-300">Registra serie</h3>
            <form onSubmit={handleLogSet} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Data">
                  <Input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  />
                </Field>
                <Field label="Peso (kg)">
                  <Input
                    type="number"
                    step="0.5"
                    value={logForm.weight}
                    onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                  />
                </Field>
                <Field label="Ripetizioni">
                  <Input
                    type="number"
                    value={logForm.reps}
                    onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
                  />
                </Field>
                <Field label="RIR">
                  <Input
                    type="number"
                    value={logForm.rir}
                    onChange={(e) => setLogForm({ ...logForm, rir: e.target.value })}
                  />
                </Field>
                <Field label="Recupero (sec)">
                  <Input
                    type="number"
                    value={logForm.restSeconds}
                    onChange={(e) => setLogForm({ ...logForm, restSeconds: e.target.value })}
                  />
                </Field>
              </div>
              <Button type="submit">Aggiungi serie</Button>
            </form>
          </Card>
        </div>
      )}

      <div>
        <SectionTitle>Sessione di oggi</SectionTitle>
        <Card>
          {Object.keys(todayByExercise).length === 0 && (
            <p className="text-sm text-neutral-500">Nessuna serie registrata oggi.</p>
          )}
          <div className="flex flex-col gap-4">
            {Object.entries(todayByExercise).map(([name, logs]) => (
              <div key={name}>
                <h4 className="mb-1 text-sm font-medium text-neutral-200">{name}</h4>
                <ul className="flex flex-col gap-1">
                  {logs.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-sm text-neutral-400">
                      <span>
                        {l.weight}kg × {l.reps}
                        {l.rir !== null ? ` — RIR ${l.rir}` : ""}
                        {l.restSeconds ? ` — rec. ${l.restSeconds}s` : ""}
                      </span>
                      <Button variant="danger" onClick={() => handleDeleteLog(l.id)}>
                        Elimina
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}
