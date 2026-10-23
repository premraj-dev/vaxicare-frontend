/** Verified Care Console: focused intervention confirmation modal for frontline worker actions. */

import { useState } from "react";
import { Phone, Send, Home, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import { createIntervention } from "@/lib/api";
import type { ChildRecord } from "@/types";
import { RiskBadge } from "@/components/Ui";
import { DatePicker } from "@/components/DatePicker";

export type ActionType = "call" | "reminder" | "visit" | "followup";

const labels = {
  call: { title: "Call parent", icon: Phone, action: "Record call" },
  reminder: { title: "Record reminder", icon: Send, action: "Record reminder" },
  visit: { title: "Schedule home visit", icon: Home, action: "Mark visit scheduled" },
  followup: { title: "Schedule follow-up", icon: CalendarClock, action: "Schedule follow-up" },
};

export function ActionModal({ child, type, onClose, onSaved }: { child: ChildRecord; type: ActionType; onClose: () => void; onSaved?: () => void | Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [actionDate, setActionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const config = labels[type];
  const Icon = config.icon;
  const submit = async () => {
    setSaving(true);
    try {
      const childId = child.id ?? child.childId;
      if (typeof childId !== "string" || !childId) {
        throw new Error("This child record has no database id.");
      }
      const actionNote = [note.trim(), type === "visit" || type === "followup" ? `Scheduled date: ${actionDate}` : ""]
        .filter(Boolean)
        .join(" · ");
      await createIntervention({
        child_id: childId,
        type: type === "visit" ? "home_visit" : type,
        note: actionNote,
      });
      toast.success("Action recorded in Supabase.");
      await onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record this action.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section role="dialog" aria-modal="true" aria-label={config.title} className="modal-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-extrabold text-ink">{config.title}</h3>
              <p className="text-sm text-slate-500">Action prepared for this child record.</p>
            </div>
          </div>
          <button aria-label="Close dialog" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X />
          </button>
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Child</span><br />
            <strong>{child.childName}</strong> · {child.childId}
          </p>
          <p>
            <span className="text-slate-500">Guardian phone</span><br />
            <strong>{child.guardianPhone || "Not provided"}</strong>
          </p>
          <p>
            <span className="text-slate-500">Next vaccine</span><br />
            <strong>{child.nextVaccine}</strong> · {child.nextDueDate || "No due date"}
          </p>
          <p>
            <span className="text-slate-500">Current risk</span><br />
            <RiskBadge risk={child.riskLevel} />
          </p>
        </div>
        {type === "visit" || type === "followup" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label mb-1">Date</label>
              <DatePicker value={actionDate} onChange={setActionDate} />
            </div>
            <label className="field-label">
              Notes
              <input value={note} onChange={(event) => setNote(event.target.value)} className="field-control" placeholder="Add visit or follow-up notes" />
            </label>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            This records the selected action in the intervention log. It does not send a phone call or message.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="secondary-button">Cancel</button>
          <button disabled={saving} onClick={submit} className="primary-button">
            {saving ? "Saving..." : config.action}
          </button>
        </div>
      </section>
    </div>
  );
}
