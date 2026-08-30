import { useEffect, useState } from "react";
import { api, type MuscleVolume, type NutritionAvg, type PeriodNote, type PeriodType } from "../lib/api";
import { Bar, Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { AvgCard } from "./Nutrition";
import { daysAgoISO, formatDate, todayISO } from "../lib/date";

export default function Reports() {
  const [from, setFrom] = useState(daysAgoISO(7));
  const [to, setTo] = useState(todayISO());
  const [volume, setVolume] = useState<MuscleVolume[]>([]);
  const [avg, setAvg] = useState<NutritionAvg | null>(null);

  const [notes, setNotes] = useState<PeriodNote[]>([]);
  const [noteForm, setNoteForm] = useState({
    periodType: "WEEK" as PeriodType,
    periodStart: todayISO(),
    category: "",
    decision: "",
  });

  const refreshStats = () => {
    api.muscleVolume(from, to).then(setVolume);
    api.nutritionAvg(from, to).then(setAvg);
  };
  const refreshNotes = () => {
    api.periodNotes().then(setNotes);
  };

  useEffect(refreshStats, [from, to]);
  useEffect(refreshNotes, []);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteForm.category.trim() || !noteForm.decision.trim()) return;
    await api.createPeriodNote(noteForm);
    setNoteForm({ ...noteForm, category: "", decision: "" });
    refreshNotes();
  }

  const maxVolume = Math.max(1, ...volume.map((v) => v.volume));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Report periodico</SectionTitle>
        <Card>
          <div className="flex flex-wrap gap-3">
            <Field label="Da">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="A">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <div className="flex items-end gap-2">
              <Button variant="ghost" onClick={() => { setFrom(daysAgoISO(7)); setTo(todayISO()); }}>
                Ultimi 7gg
              </Button>
              <Button variant="ghost" onClick={() => { setFrom(daysAgoISO(30)); setTo(todayISO()); }}>
                Ultimi 30gg
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-medium text-neutral-300">Volume per gruppo muscolare</h3>
          <div className="flex flex-col gap-2">
            {volume.map((v) => (
              <Bar key={v.muscleGroup} label={v.muscleGroup} value={v.volume} max={maxVolume} />
            ))}
            {volume.length === 0 && <p className="text-sm text-neutral-500">Nessun allenamento nel periodo.</p>}
          </div>
        </Card>
        <AvgCard title="Media nutrizionale nel periodo" avg={avg} />
      </div>

      <div>
        <SectionTitle>Note di fine periodo</SectionTitle>
        <Card>
          <form onSubmit={handleAddNote} className="flex flex-wrap items-end gap-3">
            <Field label="Periodo">
              <select
                value={noteForm.periodType}
                onChange={(e) => setNoteForm({ ...noteForm, periodType: e.target.value as PeriodType })}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
              >
                <option value="WEEK">Settimana</option>
                <option value="MONTH">Mese</option>
              </select>
            </Field>
            <Field label="Data inizio">
              <Input
                type="date"
                value={noteForm.periodStart}
                onChange={(e) => setNoteForm({ ...noteForm, periodStart: e.target.value })}
              />
            </Field>
            <Field label="Categoria">
              <Input
                value={noteForm.category}
                onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                placeholder="es. gambe, kcal"
              />
            </Field>
            <Field label="Decisione">
              <Input
                value={noteForm.decision}
                onChange={(e) => setNoteForm({ ...noteForm, decision: e.target.value })}
                placeholder="es. aumenta volume"
              />
            </Field>
            <Button type="submit" variant="ghost">
              Salva nota
            </Button>
          </form>
        </Card>

        <div className="mt-3 flex flex-col gap-2">
          {notes.map((n) => (
            <Card key={n.id} className="text-sm">
              <span className="mr-2 rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                {n.periodType === "WEEK" ? "Settimana" : "Mese"} dal {formatDate(n.periodStart)}
              </span>
              <span className="font-medium">{n.category}</span>
              <span className="text-neutral-400"> — {n.decision}</span>
            </Card>
          ))}
          {notes.length === 0 && <p className="text-sm text-neutral-500">Nessuna nota ancora.</p>}
        </div>
      </div>
    </div>
  );
}
