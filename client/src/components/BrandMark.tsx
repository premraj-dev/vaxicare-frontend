/** Verified Care Console: compact brand mark used in auth and workspace navigation. */

import { assets } from "@/data/mockData";

export function BrandMark({ withName = true, dark = false }: { withName?: boolean; dark?: boolean }) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2.5">
      <img
        src="/favicon.svg"
        alt="VaxiCare"
        className="size-10 aspect-square flex-none rounded-xl object-contain shadow-sm"
      />
      {withName && (
        <div className="min-w-0 leading-none">
          <p className={`font-display text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}>VaxiCare</p>
          <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.16em] ${dark ? "text-white/60" : "text-slate-400"}`}>Child Immunisation</p>
        </div>
      )}
    </div>
  );
}
