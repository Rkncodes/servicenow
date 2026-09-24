"use client";

import type { Student } from "@/lib/students";
import { evaluateWeek, triggerWeek } from "@/lib/earlyWarning";
import { KIND_LABEL, PATHWAYS } from "@/lib/supportNetwork";
import { Button, Card, ServiceNowNote } from "./ui";

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
  const { signals } = evaluateWeek(student, student.weeks[wk - 1]);
  const changed = signals.filter((s) => s.changed);

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">A human is brought in first</h1>
        <p className="mt-1 max-w-3xl text-slate-600">
          {student.name}&apos;s faculty advisor gets a quiet heads-up. They don&apos;t diagnose or label anyone. They
          can add context, and optionally suggest a kind of support.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-5 py-3 text-white">
            <div className="text-sm font-semibold">
              Advisor workspace · {student.advisor.name}
            </div>
            <span className="text-xs text-slate-300">{student.advisor.role}</span>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="text-sm font-semibold text-indigo-900">
                Week {wk}: a meaningful change from {student.name}&apos;s usual pattern
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {changed.map((s) => (
                  <li key={s.key} className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs text-slate-700">
                    {s.label}: {s.direction === "rise" ? "up" : "down"} from usual
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-600">
                Not a risk score or a diagnosis. Suggested action: send a friendly check-in.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-800">
                Suggest a support option <span className="font-normal text-slate-500">(optional)</span>
              </div>
              <p className="text-xs text-slate-500">
                {student.name} sees this as an option. It is not an assignment.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ADVISOR_OPTIONS.map((o) => {
                  const active = suggestion === o;
                  return (
                    <button
                      key={o}
                      onClick={() => setSuggestion(active ? null : o)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {o}
                      <span className={`ml-1 ${active ? "text-indigo-200" : "text-slate-400"}`}>
                        · {KIND_LABEL[PATHWAYS[o].kind]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="note" className="text-sm font-semibold text-slate-800">
                Personal note to {student.name} <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={onSend}>Send check-in to {student.name} →</Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 text-sm text-slate-600 lg:col-span-2">
          <div className="font-semibold text-slate-800">The advisor&apos;s role</div>
          <ul className="mt-3 space-y-2.5">
            {[
              ["Adds human context", "They may already know the student, the module or the department."],
              ["Can suggest, not decide", "Any suggestion is shown to the student as one option among others."],
              ["No diagnosis", "The advisor sees that something changed, not a label or a score."],
              ["Student stays in control", `${student.name} chooses whether to reply and what to share.`],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] text-indigo-700">
                  ✓
                </span>
                <span>
                  <span className="font-medium text-slate-800">{t}.</span> {d}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ServiceNowNote>
        The early-warning flow creates a lightweight <strong>notification / task</strong> for the advisor in their
        workspace, not a case. The advisor&apos;s optional suggestion and note are passed into the check-in flow.
      </ServiceNowNote>
    </div>
  );
}
