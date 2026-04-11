"use client";

import { useEffect, useState } from "react";

export default function ResumoDoDia() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/summarize");
        const data = await res.json();
        if (!cancelled) {
          setSummary(data.summary);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-4 my-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div
        className={[
          "flex items-center justify-between px-4 py-3",
          collapsed ? "" : "border-b border-zinc-200 dark:border-zinc-800",
        ].join(" ")}
      >
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Resumo do Dia
          </div>
          <div className="text-xs text-zinc-400">{todayLabel}</div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-lg leading-none text-zinc-400"
        >
          {collapsed ? "+" : "−"}
        </button>
      </div>

      {!collapsed ? (
        <div className="px-4 py-4">
          {loading ? (
            <div className="text-sm text-zinc-400">A gerar resumo...</div>
          ) : summary ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {summary.content}
            </p>
          ) : null}

          <div className="mt-4 text-xs text-zinc-500">
            Gerado por IA — Apenas informativo
          </div>
        </div>
      ) : null}
    </div>
  );
}
