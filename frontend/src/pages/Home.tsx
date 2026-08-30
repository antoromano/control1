import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/ui";

const sections = [
  { to: "/nutrizione", title: "Nutrizione", description: "Calorie, macro e ore di sonno di oggi" },
  { to: "/allenamento", title: "Allenamento", description: "Log serie in tempo reale e storico esercizi" },
  { to: "/abitudini", title: "Abitudini", description: "Checklist giornaliera, buone e cattive" },
  { to: "/media", title: "Media", description: "Libri, film e serie" },
  { to: "/report", title: "Report", description: "Medie periodiche, volume muscolare, note" },
];

export default function Home() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    api
      .health()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Il tuo diario</h1>
        <span
          className={
            "rounded-full px-3 py-1 text-xs " +
            (status === "ok"
              ? "bg-green-900 text-green-300"
              : status === "error"
                ? "bg-red-900 text-red-300"
                : "bg-neutral-800 text-neutral-400")
          }
        >
          API: {status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.to} to={s.to}>
            <Card className="h-full transition-colors hover:border-neutral-600">
              <h2 className="mb-1 font-medium">{s.title}</h2>
              <p className="text-sm text-neutral-400">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
