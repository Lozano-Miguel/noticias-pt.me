"use client";

import { useEffect, useRef, useState } from "react";

export default function NewsletterSignup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [hasMounted, setHasMounted] = useState(false);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  const timersRef = useRef({ show: null, close: null });
  const triggeredRef = useRef(false);

  function setCooldown24h() {
    try {
      localStorage.setItem(
        "newsletter_cooldown",
        String(Date.now() + 24 * 60 * 60 * 1000)
      );
    } catch {
      // ignore
    }
  }

  function triggerVisible() {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setIsVisible(true);
  }

  function cleanupTriggers() {
    if (timersRef.current.show) {
      clearTimeout(timersRef.current.show);
      timersRef.current.show = null;
    }
    window.removeEventListener("scroll", onScroll, { passive: true });
  }

  function onScroll() {
    const threshold = document.body.scrollHeight * 0.3;
    if (window.scrollY > threshold) {
      cleanupTriggers();
      triggerVisible();
    }
  }

  useEffect(() => {
    setHasMounted(true);

    try {
      const raw = localStorage.getItem("newsletter_cooldown");
      const until = raw ? Number(raw) : 0;
      if (Number.isFinite(until) && until > Date.now()) {
        setIsCooldownActive(true);
        return;
      }
    } catch {
      // ignore
    }

    timersRef.current.show = setTimeout(() => {
      cleanupTriggers();
      triggerVisible();
    }, 7000);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cleanupTriggers();
      if (timersRef.current.close) {
        clearTimeout(timersRef.current.close);
        timersRef.current.close = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasMounted || isCooldownActive) {
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setStatus("success");
        setCooldown24h();

        if (timersRef.current.close) {
          clearTimeout(timersRef.current.close);
        }
        timersRef.current.close = setTimeout(() => {
          setIsVisible(false);
        }, 3000);

        setStatus("success");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  function dismiss() {
    setCooldown24h();
    setIsVisible(false);
  }

  return (
    <div
      className={[
        "fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6",
        "w-[calc(100%-2rem)] md:w-96",
        "transition-all duration-500 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        isVisible ? "" : "pointer-events-none",
      ].join(" ")}
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Resumo do Dia
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Receba as principais notícias de Portugal todas as manhãs no seu email.
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="O teu email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="bg-zinc-100 dark:bg-zinc-800 text-sm w-full rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "..." : "Subscrever"}
          </button>
        </form>

        {status === "success" ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Subscrito com sucesso!
          </p>
        ) : status === "error" ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Erro ao subscrever. Tenta novamente.
          </p>
        ) : null}
      </div>
    </div>
  );
}
