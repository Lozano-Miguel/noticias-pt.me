import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100"
        >
          Notícias PT
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/sobre"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sobre
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
