"use client";

import { useState } from "react";
import type { Student } from "@/lib/students";
import type { Interpretation } from "@/lib/services";
import { KIND_LABEL, PATHWAYS, isMentorPathway } from "@/lib/supportNetwork";
import { AIBadge, Button, Card, ServiceNowNote } from "./ui";

function joinNames(list: string[]) {
  return list.length <= 1 ? list.join("") : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

export function Consent({
  student,
  text,
  result,
  selected,
  onShare,
}: {
  student: Student;
  text: string;
  result: Interpretation;
  selected: string[];
  onShare: () => void;
}) {
  const [declined, setDeclined] = useState(false);
  const services = selected.filter((s) => !isMentorPathway(s));
  const mentors = selected.filter(isMentorPathway);

  if (declined) {
    return (
      <div className="fade-up mx-auto max-w-xl">
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-slate-900">That&apos;s completely fine, {student.name}.</h2>
          <p className="mt-2 text-slate-600">
            <strong>Nothing has been shared.</strong> Here&apos;s what you picked, in case you want to reach out
            yourself whenever you&apos;re ready.
          </p>
          <ul className="mt-4 space-y-2">
            {selected.map((o) => (
              <li key={o} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <div className="font-medium text-slate-800">{o}</div>
                <div className="text-xs text-slate-500">{PATHWAYS[o]?.blurb}</div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-6" onClick={() => setDeclined(false)}>
            ← Back (demo)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Your choice</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Would you like to share this with {joinNames(selected)}?
          </h1>
          <p className="mt-2 text-slate-600">
            If you say yes, they&apos;ll review it and get in touch. If you say no, nothing is shared.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {services.length > 0 && (
            <>
              <div className="text-sm font-semibold text-slate-800">
                Shared with {joinNames(services)}
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <Row label="Your name">
                  {student.name} ({student.year})
                </Row>
                <Row label="Your message">&ldquo;{text}&rdquo;</Row>
                <Row label="Summary">
                  <span className="mr-1.5">
                    <AIBadge />
                  </span>
                  {result.staff_summary}
                </Row>
              </div>
            </>
          )}
          {mentors.length > 0 && (
            <>
              <div className="text-sm font-semibold text-slate-800">Introduction request for {joinNames(mentors)}</div>
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm">
                <Row label="Your name">{student.name}</Row>
                <Row label="Course">
                  {student.course}, {student.year}
                </Row>
                <Row label="Topic">{result.need_label}</Row>
                <p className="text-xs text-emerald-800">
                  Mentors <strong>do not</strong> see your message. The Student Support Team coordinates the
                  introduction, and you decide how much to share when you talk.
                </p>
              </div>
            </>
          )}
          <p className="text-xs text-slate-500">
            Your attendance or coursework records are not attached. You can withdraw consent at any time.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeclined(true)}>
            Not now
          </Button>
          <Button onClick={onShare}>Share &amp; Get Support</Button>
        </div>
      </Card>

      <ServiceNowNote>
        Consent is recorded on the interaction. Only a <strong>Yes</strong> lets the flow create a{" "}
        <em>Student Case</em> for each chosen service&apos;s assignment group, plus a mentor-introduction request
        for seniors and alumni, which contains minimal details only.
      </ServiceNowNote>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[110px_1fr]">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}

export function StaffCase({
  student,
  text,
  result,
  selected,
  onRestart,
}: {
  student: Student;
  text: string;
  result: Interpretation;
  selected: string[];
  onRestart: () => void;
}) {
  const urgent = result.source === "safety";
  const routes = urgent ? [result.route_to] : selected;
  const [caseNo] = useState(() => `CS${String(Math.floor(1000000 + Math.random() * 8999999))}`);
  const [opened] = useState(() => new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }));

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {urgent ? "Human escalation" : `The right people, with ${student.name}'s consent`}
        </h1>
        <p className="mt-1 text-slate-600">
          {urgent
            ? "The guardrail bypassed AI routing and sent this straight to a person."
            : `What ${student.name} sees, and what the support team sees.`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Student side */}
        <Card className="p-5 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{student.name}&apos;s view</div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
            <div>
              <div className="font-semibold text-slate-900">
                {urgent ? "Help is on the way" : `Shared. Thank you, ${student.name}`}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {urgent
                  ? "Someone from the wellbeing team will contact you today. If you're in immediate danger, call your local emergency number."
                  : "You'll hear back, usually within 2 working days (example). You don't need to do anything else."}
              </p>
            </div>
          </div>
          {!urgent && (
            <ul className="mt-4 space-y-2">
              {routes.map((r) => (
                <li key={r} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{r}</span>
                  <span className="text-xs text-slate-500">
                    {isMentorPathway(r) ? "Introduction requested" : "Request sent"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Staff side */}
        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-800 px-5 py-3 text-white">
            <div className="text-sm font-semibold">
              {student.name} · Support Case <span className="font-mono text-xs text-slate-300">{caseNo}</span>
            </div>
            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Staff workspace
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium ${
              urgent ? "bg-rose-50 text-rose-800" : "bg-violet-50 text-violet-800"
            }`}
          >
            {urgent ? (
              "⚠ Safety guardrail escalation: AI routing bypassed, human follow-up required today"
            ) : (
              <>
                <AIBadge /> AI suggestion: staff review required. The AI does not make the final decision.
              </>
            )}
          </div>

          <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2">
            <Field label="Student">
              {student.name} · {student.year}
            </Field>
            <Field label="Status">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {urgent ? "Urgent: awaiting contact" : "Awaiting staff review"}
              </span>
            </Field>
            <Field label="Need">{result.need_label}</Field>
            <Field label="Urgency (suggested)">
              <span className="capitalize">{result.urgency}</span>
            </Field>
            <div className="sm:col-span-2">
              <Field label={urgent ? "Routed to" : "Pathways chosen by student"}>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {routes.map((r) => (
                    <span key={r} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">
                      {r}
                      {PATHWAYS[r] && <span className="text-slate-400"> · {KIND_LABEL[PATHWAYS[r].kind]}</span>}
                    </span>
                  ))}
                </div>
              </Field>
            </div>
            <Field label={urgent ? "Basis" : "Consent"}>
              {urgent ? "Duty-of-care escalation (policy)" : `Given by student · ${opened}`}
            </Field>
            <Field label="Advisor">{student.advisor.name} (notified at early-warning step)</Field>
            <div className="sm:col-span-2">
              <Field label={urgent ? "Guardrail note" : "AI summary"}>{result.staff_summary}</Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Student's own words">
                <span className="italic">&ldquo;{text}&rdquo;</span>
              </Field>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
            <Button className="!py-1.5 !text-xs">{urgent ? "Contact student now" : "Accept & contact student"}</Button>
            <Button variant="secondary" className="!py-1.5 !text-xs">
              Reassign
            </Button>
            <Button variant="secondary" className="!py-1.5 !text-xs">
              Edit summary
            </Button>
          </div>
        </Card>
      </div>

      <ServiceNowNote>
        The case lands in the assignment group&apos;s queue in the <strong>Workspace</strong>, with SLAs and work
        notes. Mentor introductions go to a coordinator queue. Staff accept, reassign or correct the AI suggestion. A
        person always makes the decision.
      </ServiceNowNote>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
        <p className="text-slate-700">
          Meaningful change noticed → advisor brought in → check-in → <strong>{student.name} says what they need</strong> →
          AI understands → {student.name} chooses support → <strong>with consent</strong>, the right humans are
          involved.
        </p>
        <Button variant="secondary" className="mt-4" onClick={onRestart}>
          ↺ Try another student
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  );
}
