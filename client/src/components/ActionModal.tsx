/** Verified Care Console: focused intervention confirmation modal for frontline worker actions. */

import { useState } from "react";
import { Phone, Send, Home, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import { interventionService, reminderService } from "@/services/mockApi";
import type { ChildRecord } from "@/types";
import { RiskBadge } from "@/components/Ui";

export type ActionType = "call" | "reminder" | "visit" | "followup";

const labels = {
  call: { title: "Call parent", icon: Phone, action: "Start call" },
  reminder: { title: "Send reminder", icon: Send, action: "Send reminder" },
  visit: { title: "Schedule home visit", icon: Home, action: "Mark visit scheduled" },
  followup: { title: "Schedule follow-up", icon: CalendarClock, action: "Schedule follow-up" },
};

export function ActionModal({ child, type, onClose }: { child: ChildRecord; type: ActionType; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const config = labels[type];
  const Icon = config.icon;
  const submit = async () => { setSaving(true); if (type === "reminder") await reminderService.sendReminder(); else await interventionService.recordAction(); setSaving(false); toast.success(type === "reminder" ? "Reminder sent successfully." : `${config.title} recorded successfully.`); onClose(); };
  return <div className="modal-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-label={config.title} className="modal-card"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><Icon className="h-5 w-5" /></span><div><h3 className="font-display text-xl font-extrabold text-ink">{config.title}</h3><p className="text-sm text-slate-500">Action prepared for this child record.</p></div></div><button aria-label="Close dialog" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X /></button></div><div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Child</span><br /><strong>{child.childName}</strong> · {child.childId}</p><p><span className="text-slate-500">Parent phone</span><br /><strong>{child.parentPhone}</strong></p><p><span className="text-slate-500">Next vaccine</span><br /><strong>{child.nextVaccine}</strong> · {child.nextDueDate}</p><p><span className="text-slate-500">Current risk</span><br /><RiskBadge risk={child.riskLevel} /></p></div>{type === "visit" || type === "followup" ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="field-label">Date<input className="field-control" type="date" defaultValue="2026-08-25" /></label><label className="field-label">Notes<input className="field-control" placeholder="Add visit or follow-up notes" /></label></div> : <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">This is an API-ready UI simulation. A future backend will connect this action to calling, SMS, or field-visit services.</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="secondary-button">Cancel</button><button disabled={saving} onClick={submit} className="primary-button">{saving ? "Saving..." : config.action}</button></div></section></div>;
}
