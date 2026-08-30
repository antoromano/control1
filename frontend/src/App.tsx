import { useEffect, useState } from "react";

type ApiStatus = "checking" | "ok" | "error";

function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    fetch("/health")
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, []);

  return status;
}

const sections = [
  { title: "Nutrizione", description: "Calorie e macro giornalieri" },
  { title: "Allenamento", description: "Serie, ripetizioni, RIR e storico esercizi" },
  { title: "Abitudini", description: "Abitudini buone e cattive, checkbox o conteggio" },
  { title: "Media", description: "Libri, film e serie" },
];

export default function App() {
  const apiStatus = useApiStatus();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Diario Intelligente</h1>
          <span
            className={
              "text-sm rounded-full px-3 py-1 " +
              (apiStatus === "ok"
                ? "bg-green-900 text-green-300"
                : apiStatus === "error"
                  ? "bg-red-900 text-red-300"
                  : "bg-neutral-800 text-neutral-400")
            }
          >
            API: {apiStatus}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div key={s.title} className="rounded-lg border border-neutral-800 p-4">
              <h2 className="font-medium mb-1">{s.title}</h2>
              <p className="text-sm text-neutral-400">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
