/** Verified Care Console: compact brand mark used in auth and workspace navigation. */

import { assets } from "@/data/mockData";

export function BrandMark({ withName = true, dark = false }: { withName?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src={assets.logo} alt="VaxiCare" className="h-10 w-10 rounded-xl object-contain" />
      {withName && (
        <div className="leading-none">
          <p className={`font-display text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}>VaxiCare</p>
          <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.16em] ${dark ? "text-white/60" : "text-slate-400"}`}>Child Immunisation</p>
        </div>
      )}
    </div>
  );
}
