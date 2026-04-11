const block = "bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse";

export default function ArticleSkeleton({ type }) {
  if (type === "compact") {
    return (
      <div className="border-b border-zinc-100 py-3 dark:border-zinc-800">
        <div className={`${block} h-3 w-16`} />
        <div className={`${block} mt-1 h-4 w-full`} />
        <div className={`${block} mt-1 h-4 w-3/4`} />
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className={`${block} h-32 w-full`} />
        <div className="p-3">
          <div className={`${block} h-2.5 w-14`} />
          <div className={`${block} mt-2 h-4 w-full`} />
          <div className={`${block} mt-1 h-4 w-3/4`} />
          <div className={`${block} mt-2 h-2.5 w-full`} />
          <div className={`${block} mt-1 h-2.5 w-2/3`} />
          <div className={`${block} mt-2 h-2.5 w-20`} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className={`${block} h-48 w-full`} />
      <div className="p-3">
        <div className={`${block} h-3 w-16`} />
        <div className={`${block} mt-2 h-5 w-full`} />
        <div className={`${block} mt-1 h-5 w-3/4`} />
        <div className={`${block} mt-3 h-3 w-full`} />
        <div className={`${block} mt-1 h-3 w-2/3`} />
        <div className={`${block} mt-3 h-3 w-24`} />
      </div>
    </div>
  );
}
