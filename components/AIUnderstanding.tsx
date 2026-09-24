"use client";

import type { Interpretation } from "@/lib/services";
import type { Student } from "@/lib/students";
import { KIND_LABEL, NEED_NETWORK, PATHWAYS } from "@/lib/supportNetwork";
import { Button, Card, PageTitle, ServiceNowNote, SourceTag } from "./ui";

export function recommendedPathways(result: Interpretation, advisorSuggestion: string | null) {
  const base = NEED_NETWORK[result.need] ?? NEED_NETWORK.general;
  const list = base.some((o) => o.label === result.route_to)
    ? [...base]
    : [{ label: result.route_to, why: "Suggested based on what you shared." }, ...base];
  if (advisorSuggestion && !list.some((o) => o.label === advisorSuggestion))
    list.push({ label: advisorSuggestion, why: "Suggested by your advisor." });
  return list;
}

export function AIUnderstanding({
  student,
  text,
  result,
  advisorSuggestion,
  selected,
  setSelected,
  onEdit,
  onNext,
}: {
  student: Student;
  text: string;
  result: Interpretation;
  advisorSuggestion: string | null;
  selected: string[];
  setSelected: (s: string[]) => void;
  onEdit: () => void;
  onNext: () => void;
}) {
  if (result.source === "safety") return <SafetyPath text={text} onNext={onNext} />;

  const options = recommendedPathways(result, advisorSuggestion);
  const toggle = (label: string) =>
    setSelected(selected.includes(label) ? selected.filter((s) => s !== label) : [...selected, label]);

  return (
    <div className="fade-up mx-auto max-w-3xl space-y-6">
      <PageTitle title="Here's what we understood" sub={`The AI suggests. ${student.name} chooses.`} />

      <Card className="p-5">
        <div className="text-xs font-medium text-slate-500">{student.name} said</div>
        <blockquote className="mt-1 text-[15px] italic leading-relaxed text-slate-700">&ldquo;{text}&rdquo;</blockquote>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SourceTag kind="ai" />
            <span className="text-[11px] text-slate-400">
              {result.source === "ai" ? "Live AI" : "Offline example (AI unavailable)"} · reads only this reply ·
              no diagnosis
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <div className="text-xs text-slate-500">Need</div>
              <div className="font-semibold text-navy-900">{result.need_label}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Suggested support</div>
              <div className="font-semibold text-navy-900">{result.route_to}</div>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-surface px-4 py-3 text-[15px] leading-relaxed text-navy-900">{result.reply}</p>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-navy-900">People who may be able to help</h2>
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <SourceTag kind="student" /> pick any, or none
          </span>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {options.map((o) => {
            const on = selected.includes(o.label);
            const kind = PATHWAYS[o.label]?.kind ?? "university";
            return (
              <label key={o.label} className="flex cursor-pointer items-start gap-3 py-2.5">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(o.label)}
                  className="mt-1 h-4 w-4 accent-teal-700"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium ${on ? "text-teal-800" : "text-navy-900"}`}>{o.label}</span>
                    <span className="text-[11px] text-slate-400">{KIND_LABEL[kind]}</span>
                    {o.label === result.route_to && <SourceTag kind="ai" />}
                    {o.label === advisorSuggestion && <SourceTag kind="advisor" />}
                  </div>
                  <div className="text-xs text-slate-500">{o.why}</div>
                </div>
              </label>
            );
          })}
        </div>
        <details className="mt-2 text-xs text-slate-500">
          <summary className="cursor-pointer font-medium text-teal-700">Why seniors &amp; alumni?</summary>
          <p className="mt-1">
            Design consideration: some students may find it easier to talk first to someone who has been through the
            same experience. It&apos;s optional, alongside university support.
          </p>
        </details>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onEdit}>
          ← Not quite right
        </Button>
        <Button onClick={onNext} disabled={selected.length === 0}>
          Continue with {selected.length || "my"} choice{selected.length === 1 ? "" : "s"} →
        </Button>
      </div>

      <ServiceNowNote>
        <strong>Now Assist</strong> / a generative AI skill returns structured output (need, route, reply,
        summary). The need looks up optional pathways from a support-network table. Nothing is sent to anyone yet.
      </ServiceNowNote>
    </div>
  );
}

function SafetyPath({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <div className="fade-up mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden border-rose-200">
        <div className="bg-rose-800 px-5 py-3 text-sm font-semibold text-white">You&apos;re not alone</div>
        <div className="space-y-4 p-5">
          <p className="text-[15px] leading-relaxed text-navy-900">
            Thank you for telling us. It sounds like things are really hard right now.{" "}
            <strong>A member of our wellbeing team will contact you today.</strong>
          </p>
          <blockquote className="border-l-2 border-rose-200 pl-3 text-sm italic text-slate-500">&ldquo;{text}&rdquo;</blockquote>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-rose-200 p-3">
              <div className="font-semibold text-navy-900">Immediate danger?</div>
              <div className="text-slate-600">Call your local emergency number.</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="font-semibold text-navy-900">24/7 support line</div>
              <div className="text-slate-600">Placeholder number for the demo.</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <span className="text-[11px] text-slate-400">Safety guardrail: AI skipped. Prototype phrase check, not clinical.</span>
          <Button onClick={onNext}>See the human escalation →</Button>
        </div>
      </Card>
    </div>
  );
}
