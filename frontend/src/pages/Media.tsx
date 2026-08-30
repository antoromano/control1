import { useEffect, useState } from "react";
import { api, type MediaLog, type MediaType } from "../lib/api";
import { Button, Card, Field, Input, SectionTitle } from "../components/ui";
import { formatDate, todayISO } from "../lib/date";

const typeLabels: Record<MediaType, string> = {
  BOOK: "Libro",
  MOVIE: "Film",
  SERIES: "Serie",
};

export default function Media() {
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [form, setForm] = useState({
    date: todayISO(),
    type: "MOVIE" as MediaType,
    title: "",
    rating: "",
    notes: "",
  });

  const refresh = () => {
    api.mediaLogs().then(setLogs);
  };
  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.createMediaLog({
      date: form.date,
      type: form.type,
      title: form.title.trim(),
      rating: form.rating ? Number(form.rating) : null,
      notes: form.notes.trim() || null,
    });
    setForm({ ...form, title: "", rating: "", notes: "" });
    refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteMediaLog(id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Aggiungi media</SectionTitle>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Data">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Tipo">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as MediaType })}
                  className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
                >
                  <option value="MOVIE">Film</option>
                  <option value="SERIES">Serie</option>
                  <option value="BOOK">Libro</option>
                </select>
              </Field>
              <Field label="Titolo">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Voto (1-5)">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Note">
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <div>
              <Button type="submit">Aggiungi</Button>
            </div>
          </form>
        </Card>
      </div>

      <div>
        <SectionTitle>Storico</SectionTitle>
        <div className="flex flex-col gap-2">
          {logs.map((m) => (
            <Card key={m.id} className="flex items-center justify-between">
              <div>
                <span className="mr-2 rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                  {typeLabels[m.type]}
                </span>
                <span className="font-medium">{m.title}</span>
                {m.rating && <span className="ml-2 text-neutral-400">{"★".repeat(m.rating)}</span>}
                <div className="text-xs text-neutral-500">
                  {formatDate(m.date)}
                  {m.notes ? ` — ${m.notes}` : ""}
                </div>
              </div>
              <Button variant="danger" onClick={() => handleDelete(m.id)}>
                Elimina
              </Button>
            </Card>
          ))}
          {logs.length === 0 && <p className="text-sm text-neutral-500">Ancora niente qui.</p>}
        </div>
      </div>
    </div>
  );
}
