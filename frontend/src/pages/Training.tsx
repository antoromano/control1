import { useEffect, useState } from "react";
import { api, type Exercise, type ExerciseHistory, type ExerciseLog, type ExerciseMuscle } from "../lib/api";
import { Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { MUSCLE_GROUPS } from "../lib/muscleGroups";
import { formatDate, todayISO } from "../lib/date";

const emptyMuscleRow: ExerciseMuscle = { muscleGroup: MUSCLE_GROUPS[0], factor: 1 };

export default function Training() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [todayLogs, setTodayLogs] = useState<ExerciseLog[]>([]);

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseParent, setNewExerciseParent] = useState("");
  const [muscleRows, setMuscleRows] = useState<ExerciseMuscle[]>([emptyMuscleRow]);

  const [logForm, setLogForm] = useState({
    date: todayISO(),
    reps: "",
    weight: "0",
    rir: "",
    restSeconds: "",
    notes: "",
  });

  const loadExercises = () => {
    api.exercises().then(setExercises);
  };
  const loadTodayLogs = () => {
    api.exerciseLogsByDate(todayISO()).then(setTodayLogs);
  };

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

  const topLevel = exercises.filter((e) => !e.parentId);
  const variantsOf = (parentId: string) => exercises.filter((e) => e.parentId === parentId);
  const selectedExercise = exercises.find((e) => e.id === selectedId);

  function updateMuscleRow(index: number, patch: Partial<ExerciseMuscle>) {
    setMuscleRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleCreateExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    const exercise = await api.createExercise({
      name: newExerciseName.trim(),
      parentId: newExerciseParent || null,
      muscles: muscleRows.filter((r) => r.muscleGroup),
    });
    setNewExerciseName("");
    setNewExerciseParent("");
    setMuscleRows([emptyMuscleRow]);
    await loadExercises();
    setSelectedId(exercise.id);
  }

  async function handleLogSet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !logForm.reps) return;
    await api.createExerciseLog(selectedId, {
      date: logForm.date,
      reps: Number(logForm.reps),
      weight: logForm.weight ? Number(logForm.weight) : 0,
      rir: logForm.rir ? Number(logForm.rir) : undefined,
      restSeconds: logForm.restSeconds ? Number(logForm.restSeconds) : undefined,
      notes: logForm.notes.trim() || undefined,
    });
    setLogForm({ ...logForm, reps: "", rir: "", restSeconds: "", notes: "" });
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
              {topLevel.map((ex) => (
                <optgroup key={ex.id} label={ex.name}>
                  <option value={ex.id}>{ex.name}</option>
                  {variantsOf(ex.id).map((v) => (
                    <option key={v.id} value={v.id}>
                      {"— " + v.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          {selectedExercise && selectedExercise.muscles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedExercise.muscles.map((m) => (
                <span
                  key={m.muscleGroup}
                  className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                >
                  {m.muscleGroup} × {m.factor}
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleCreateExercise} className="flex flex-col gap-3 border-t border-neutral-800 pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Nuovo esercizio o variante">
                <Input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="es. Push up profondo"
                />
              </Field>
              <Field label="Variante di (opzionale)">
                <select
                  value={newExerciseParent}
                  onChange={(e) => setNewExerciseParent(e.target.value)}
                  className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
                >
                  <option value="">Nessuna (esercizio base)</option>
                  {topLevel.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-neutral-300">Gruppi muscolari coinvolti</span>
              {muscleRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={row.muscleGroup}
                    onChange={(e) => updateMuscleRow(i, { muscleGroup: e.target.value })}
                    className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
                  >
                    {MUSCLE_GROUPS.map((mg) => (
                      <option key={mg} value={mg}>
                        {mg}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={1}
                    value={row.factor}
                    onChange={(e) => updateMuscleRow(i, { factor: Number(e.target.value) })}
                    className="w-20"
                    title="Fattore di coinvolgimento (1 = primario, 0.5 = secondario)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMuscleRows((rows) => rows.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMuscleRows((rows) => [...rows, { ...emptyMuscleRow }])}
                >
                  + Aggiungi gruppo muscolare
                </Button>
              </div>
            </div>

            <div>
              <Button type="submit" variant="ghost">
                Salva esercizio
              </Button>
            </div>
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
                    <li key={l.id} className="border-t border-neutral-800 pt-1">
                      <div className="flex justify-between">
                        <span>{formatDate(l.date)}</span>
                        <span className="text-neutral-100">
                          {l.weight}kg × {l.reps} {l.rir !== null ? `RIR${l.rir}` : ""}
                        </span>
                      </div>
                      {l.notes && <p className="text-xs text-neutral-500">{l.notes}</p>}
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
                <Field label="Ripetizioni">
                  <Input
                    type="number"
                    value={logForm.reps}
                    onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
                  />
                </Field>
                <Field label="Peso (kg, 0 = corpo libero)">
                  <Input
                    type="number"
                    step="0.5"
                    value={logForm.weight}
                    onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                  />
                </Field>
                <Field label="RIR (opzionale)">
                  <Input
                    type="number"
                    value={logForm.rir}
                    onChange={(e) => setLogForm({ ...logForm, rir: e.target.value })}
                  />
                </Field>
                <Field label="Recupero sec (opzionale)">
                  <Input
                    type="number"
                    value={logForm.restSeconds}
                    onChange={(e) => setLogForm({ ...logForm, restSeconds: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Note (opzionale)">
                <Input
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="es. esecuzione lenta, ginocchio fastidioso..."
                />
              </Field>
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
                        {l.notes ? ` — ${l.notes}` : ""}
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
