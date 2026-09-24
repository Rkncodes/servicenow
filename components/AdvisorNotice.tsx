"use client";

import type { Student } from "@/lib/students";
import { evaluateWeek, triggerWeek } from "@/lib/earlyWarning";
import { Button, Card, PageTitle, ServiceNowNote } from "./ui";

const ADVISOR_OPTIONS = [
  "Student Support Team",
  "Academic Advising",
  "Senior Student Mentor",
  "SRM Alumni Mentor",
  "Hackathon & Coding Community",
  "Student Hardship Support",
];

export function AdvisorNotice({
  student,
  suggestion,
  setSuggestion,
  note,
  setNote,
  onSend,
}: {
  student: Student;
  suggestion: string | null;
  setSuggestion: (s: string | null) => void;
  note: string;
  setNote: (n: string) => void;
  onSend: () => void;
}) {
  const wk = triggerWeek(student);
  if (wk === null) return null; // unreachable: the journey only continues here after the flow fires
  const changed = evaluateWeek(student, student.weeks[wk - 1]).signals.filter((s) => s.changed);

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="A human is brought in first"
        sub="The advisor adds context and can suggest support. They don't diagnose or decide."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-navy-900 px-5 py-3 text-sm text-white">
          <span className="font-semibold">{student.advisor.name}</span>
          <span className="text-xs text-slate-300">{student.advisor.role} · Workspace</span>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm font-semibold text-navy-900">
              Week {wk}: {student.triggerLabel.toLowerCase()} for {student.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {changed.map((s) => (
                <span key={s.key} className="rounded border border-amber-200 bg-white px-1.5 py-0.5 text-xs text-slate-600">
                  {s.label} {s.direction === "rise" ? "↑" : "↓"}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-navy-900">
              Suggest support <span className="font-normal text-slate-400">(optional)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ADVISOR_OPTIONS.map((o) => {
                const active = suggestion === o;
                return (
                  <button
                    key={o}
                    onClick={() => setSuggestion(active ? null : o)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                      active ? "border-sky-700 bg-sky-700 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="text-sm font-semibold text-navy-900">
              Note to {student.name} <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSend}>Send check-in to {student.name} →</Button>
          </div>
        </div>
      </Card>

      <ServiceNowNote>
        The early-warning flow creates a lightweight <strong>notification / task</strong> in the advisor&apos;s
        workspace, not a case. Their optional suggestion and note are passed into the check-in.
      </ServiceNowNote>
    </div>
  );
}
