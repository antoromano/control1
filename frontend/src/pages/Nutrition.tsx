import { useEffect, useMemo, useState } from "react";
import { api, type DailyLog, type NutritionAvg } from "../lib/api";
import { Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { daysAgoISO, formatDate, todayISO } from "../lib/date";

const emptyForm = { kcal: "", carbsG: "", proteinG: "", fatG: "", sleepHours: "" };

export default function Nutrition() {
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [avg7, setAvg7] = useState<NutritionAvg | null>(null);
  const [avg30, setAvg30] = useState<NutritionAvg | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    api.dailyLogs(daysAgoISO(60), todayISO()).then(setLogs);
    api.nutritionAvg(daysAgoISO(7), todayISO()).then(setAvg7);
    api.nutritionAvg(daysAgoISO(30), todayISO()).then(setAvg30);
  };

  useEffect(refresh, []);

  const existing = useMemo(() => logs.find((l) => l.date.slice(0, 10) === date), [logs, date]);

  useEffect(() => {
    if (existing) {
      setForm({
        kcal: existing.kcal?.toString() ?? "",
        carbsG: existing.carbsG?.toString() ?? "",
        proteinG: existing.proteinG?.toString() ?? "",
        fatG: existing.fatG?.toString() ?? "",
        sleepHours: existing.sleepHours?.toString() ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [existing, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.upsertDailyLog({
        date,
        kcal: form.kcal ? Number(form.kcal) : null,
        carbsG: form.carbsG ? Number(form.carbsG) : null,
        proteinG: form.proteinG ? Number(form.proteinG) : null,
        fatG: form.fatG ? Number(form.fatG) : null,
        sleepHours: form.sleepHours ? Number(form.sleepHours) : null,
      });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteDailyLog(id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Nutrizione e sonno</SectionTitle>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Data">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Field label="Kcal">
                <Input
                  type="number"
                  value={form.kcal}
                  onChange={(e) => setForm({ ...form, kcal: e.target.value })}
                />
              </Field>
              <Field label="Carbo (g)">
                <Input
                  type="number"
                  value={form.carbsG}
                  onChange={(e) => setForm({ ...form, carbsG: e.target.value })}
                />
              </Field>
              <Field label="Proteine (g)">
                <Input
                  type="number"
                  value={form.proteinG}
                  onChange={(e) => setForm({ ...form, proteinG: e.target.value })}
                />
              </Field>
              <Field label="Grassi (g)">
                <Input
                  type="number"
                  value={form.fatG}
                  onChange={(e) => setForm({ ...form, fatG: e.target.value })}
                />
              </Field>
              <Field label="Sonno (h)">
                <Input
                  type="number"
                  step="0.1"
                  value={form.sleepHours}
                  onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
                />
              </Field>
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {existing ? "Aggiorna giorno" : "Salva giorno"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AvgCard title="Media ultimi 7 giorni" avg={avg7} />
        <AvgCard title="Media ultimi 30 giorni" avg={avg30} />
      </div>

      <div>
        <SectionTitle>Storico</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="text-neutral-400">
              <tr>
                <th className="pb-2">Data</th>
                <th className="pb-2">Kcal</th>
                <th className="pb-2">Carbo</th>
                <th className="pb-2">Prot</th>
                <th className="pb-2">Grassi</th>
                <th className="pb-2">Sonno</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-neutral-800">
                  <td className="py-1.5">{formatDate(l.date)}</td>
                  <td className="py-1.5">{l.kcal ?? "-"}</td>
                  <td className="py-1.5">{l.carbsG ?? "-"}</td>
                  <td className="py-1.5">{l.proteinG ?? "-"}</td>
                  <td className="py-1.5">{l.fatG ?? "-"}</td>
                  <td className="py-1.5">{l.sleepHours ?? "-"}</td>
                  <td className="py-1.5 text-right">
                    <Button variant="danger" onClick={() => handleDelete(l.id)}>
                      Elimina
                    </Button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-neutral-500">
                    Nessun dato ancora
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export function AvgCard({ title, avg }: { title: string; avg: NutritionAvg | null }) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-neutral-300">{title}</h3>
      {avg ? (
        <div className="grid grid-cols-2 gap-y-1 text-sm text-neutral-400">
          <span>Kcal</span>
          <span className="text-neutral-100">{round(avg.kcal)}</span>
          <span>Carbo</span>
          <span className="text-neutral-100">{round(avg.carbsG)} g</span>
          <span>Proteine</span>
          <span className="text-neutral-100">{round(avg.proteinG)} g</span>
          <span>Grassi</span>
          <span className="text-neutral-100">{round(avg.fatG)} g</span>
          <span>Sonno</span>
          <span className="text-neutral-100">{round(avg.sleepHours)} h</span>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">-</p>
      )}
    </Card>
  );
}

function round(n: number | null): string {
  return n === null || n === undefined ? "-" : (Math.round(n * 10) / 10).toString();
}
