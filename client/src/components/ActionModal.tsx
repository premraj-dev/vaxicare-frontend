/** Verified Care Console: focused intervention confirmation modal for frontline worker actions. */

import { Phone, Send, Home, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import type { ChildRecord } from "@/types";
import { RiskBadge } from "@/components/Ui";

export type ActionType = "call" | "reminder" | "visit" | "followup";

const labels = {
  call: { title: "Call parent", icon: Phone, action: "Record call" },
  reminder: { title: "Record reminder", icon: Send, action: "Record reminder" },
  visit: { title: "Schedule home visit", icon: Home, action: "Mark visit scheduled" },
  followup: { title: "Schedule follow-up", icon: CalendarClock, action: "Schedule follow-up" },
};

export function ActionModal({ child, type, onClose, onSaved }: { child: ChildRecord; type: ActionType; onClose: () => void; onSaved?: () => void | Promise<void> }) {
  const actionDate = new Date().toISOString().slice(0, 10);
  const config = labels[type];
  const Icon = config.icon;
  const submit = () => {
    toast.success("Sample action recorded locally; it was not sent to the server.");
    void onSaved?.();
    onClose();
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
        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
          Demo mode · this action will be shown as a local interaction only and will not contact a family or update the server.
          {(type === "visit" || type === "followup") && ` Sample date: ${actionDate}.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="secondary-button">Cancel</button>
          <button onClick={submit} className="primary-button">
            {config.action}
          </button>
        </div>
      </section>
    </div>
  );
}
