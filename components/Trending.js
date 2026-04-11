"use client";

import { useEffect, useState } from "react";

export default function Trending({ onSearch }) {
  const [words, setWords] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trending");
      const data = await res.json();
      setWords(Array.isArray(data.trending) ? data.trending : []);
    }

    load();
  }, []);

  if (words.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-xs text-zinc-300 dark:text-zinc-600 font-medium tracking-widest uppercase shrink-0">
        Em alta
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {words.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => onSearch(word)}
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors lowercase"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
