"use client";

import { useState } from "react";
import type { Student } from "@/lib/students";
import type { Interpretation } from "@/lib/services";
import { KIND_LABEL, PATHWAYS, isMentorPathway } from "@/lib/supportNetwork";
import { Button, Card, ServiceNowNote, SourceTag } from "./ui";

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
          <h2 className="text-xl font-semibold text-navy-900">That&apos;s fine, {student.name}. Nothing was shared.</h2>
          <p className="mt-2 text-sm text-slate-600">You can reach out yourself whenever you&apos;re ready:</p>
          <ul className="mt-3 space-y-1 text-sm">
            {selected.map((o) => (
              <li key={o}>
                <span className="font-medium text-navy-900">{o}</span>{" "}
                <span className="text-slate-500">· {PATHWAYS[o]?.blurb}</span>
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
        <div className="px-6 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">Your choice</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy-900">
            Share this with {joinNames(selected)}?
          </h1>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm">
          {services.length > 0 && (
            <div>
              <div className="font-medium text-navy-900">{joinNames(services)} will see:</div>
              <ul className="mt-2 space-y-1.5 rounded-lg bg-surface p-4 text-slate-700">
                <li>
                  <span className="text-slate-500">Name:</span> {student.name}, {student.year}
                </li>
                <li>
                  <span className="text-slate-500">Your message:</span> &ldquo;{text}&rdquo;
                </li>
                <li>
                  <span className="text-slate-500">Summary</span> <SourceTag kind="ai" />
                  <span className="text-slate-500">:</span> {result.staff_summary}
                </li>
              </ul>
            </div>
          )}
          {mentors.length > 0 && (
            <div>
              <div className="font-medium text-navy-900">{joinNames(mentors)}: introduction only</div>
              <ul className="mt-2 space-y-1.5 rounded-lg bg-surface p-4 text-slate-700">
                <li>
                  <span className="text-slate-500">Name &amp; course:</span> {student.name}, {student.course}
                </li>
                <li>
                  <span className="text-slate-500">Topic:</span> {result.need_label}
                </li>
                <li className="text-xs text-slate-500">Your message is not shared with mentors.</li>
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-500">No attendance or coursework records are attached. You can withdraw at any time.</p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeclined(true)}>
            Not now
          </Button>
          <Button onClick={onShare}>Share &amp; Get Support</Button>
        </div>
      </Card>

      <ServiceNowNote>
        Consent is recorded on the interaction. Only a <strong>Yes</strong> creates a <em>Student Case</em> for each
        chosen service&apos;s assignment group, plus a minimal mentor-introduction request for seniors and alumni.
      </ServiceNowNote>
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
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        {urgent ? "Human escalation" : `Human support, with ${student.name}'s consent`}
      </h1>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Student side */}
        <Card className="p-5 lg:col-span-2">
          <div className="text-xs font-medium text-slate-500">{student.name}&apos;s view</div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">
              ✓
            </div>
            <div>
              <div className="font-semibold text-navy-900">{urgent ? "Help is on the way" : "Shared. Thank you."}</div>
              <p className="mt-0.5 text-sm text-slate-600">
                {urgent ? "The wellbeing team will contact you today." : "You'll hear back within 2 working days (example)."}
              </p>
            </div>
          </div>
          {!urgent && (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {routes.map((r) => (
                <li key={r} className="flex items-center justify-between py-2">
                  <span className="text-navy-900">{r}</span>
                  <span className="text-xs text-slate-500">{isMentorPathway(r) ? "Intro requested" : "Request sent"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Staff side */}
        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between bg-navy-900 px-5 py-3 text-sm text-white">
            <span className="font-semibold">
              {student.name} · Support Case <span className="font-mono text-xs text-slate-300">{caseNo}</span>
            </span>
            <span className="text-xs text-slate-300">Staff workspace</span>
          </div>

          <div
            className={`px-5 py-2 text-xs font-medium ${urgent ? "bg-rose-50 text-rose-800" : "bg-surface text-slate-600"}`}
          >
            {urgent
              ? "Safety guardrail escalation: AI bypassed, contact today"
              : "Staff review required. The AI does not make the final decision."}
          </div>

          <dl className="grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
            <Field label="Status">
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                {urgent ? "Urgent: awaiting contact" : "Awaiting staff review"}
              </span>
            </Field>
            <Field label="Need">{result.need_label}</Field>
            <div className="sm:col-span-2">
              <Field label={urgent ? "Routed to" : "Chosen by student"}>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {routes.map((r) => (
                    <span key={r} className="rounded border border-slate-200 px-1.5 py-0.5 text-xs">
                      {r}
                      {PATHWAYS[r] && <span className="text-slate-400"> · {KIND_LABEL[PATHWAYS[r].kind]}</span>}
                    </span>
                  ))}
                </div>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={urgent ? "Guardrail note" : "Summary"}>
                {!urgent && (
                  <span className="mr-1.5">
                    <SourceTag kind="ai" />
                  </span>
                )}
                {result.staff_summary}
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Student's own words">
                <span className="italic text-slate-600">&ldquo;{text}&rdquo;</span>
              </Field>
            </div>
            <Field label={urgent ? "Basis" : "Consent"}>{urgent ? "Duty-of-care policy" : `Given · ${opened}`}</Field>
            <Field label="Advisor">{student.advisor.name}</Field>
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
            <Button className="!py-1.5 !text-xs">{urgent ? "Contact student now" : "Accept & contact"}</Button>
            <Button variant="secondary" className="!py-1.5 !text-xs">
              Reassign
            </Button>
            <Button variant="secondary" className="!py-1.5 !text-xs">
              Edit summary
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-surface px-5 py-4">
        <p className="text-sm text-slate-600">
          Change noticed → advisor → check-in → <strong className="text-navy-900">{student.name}&apos;s own words</strong> →
          AI suggestion → <strong className="text-navy-900">{student.name}&apos;s choice &amp; consent</strong> → human
          support
        </p>
        <Button variant="secondary" onClick={onRestart}>
          Try another student →
        </Button>
      </div>

      <ServiceNowNote>
        The case lands in the assignment group&apos;s <strong>Workspace</strong> queue with SLAs and work notes; mentor
        introductions go to a coordinator queue. Staff accept, reassign or correct. A person always decides.
      </ServiceNowNote>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-navy-900">{children}</dd>
    </div>
  );
}
