"use client";

import type { Interpretation } from "@/lib/services";
import type { Student } from "@/lib/students";
import { KIND_LABEL, NEED_NETWORK, PATHWAYS } from "@/lib/supportNetwork";
import { AIBadge, Button, Card, ServiceNowNote } from "./ui";

const KIND_STYLE: Record<string, string> = {
  university: "bg-indigo-100 text-indigo-700",
  faculty: "bg-sky-100 text-sky-700",
  peer: "bg-emerald-100 text-emerald-700",
  alumni: "bg-amber-100 text-amber-800",
  community: "bg-teal-100 text-teal-700",
};

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
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Here&apos;s what we understood</h1>
        <p className="mt-1 text-slate-600">
          An AI assistant reads {student.name}&apos;s reply and suggests where support might help. {student.name} chooses
          what, if anything, to take up.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">In {student.name}&apos;s words</div>
            <blockquote className="mt-2 border-l-4 border-indigo-200 pl-3 text-[15px] italic leading-relaxed text-slate-700">
              &ldquo;{text}&rdquo;
            </blockquote>
          </Card>
          <Card className="p-5 text-sm text-slate-600">
            <div className="font-semibold text-slate-800">What the AI does not do</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>No diagnosis or labels</li>
              <li>No access to records, only this reply</li>
              <li>No decisions. It only makes a suggestion</li>
            </ul>
          </Card>
          <Card className="border-dashed p-5 text-sm text-slate-600">
            <div className="font-semibold text-slate-800">Why seniors &amp; alumni?</div>
            <p className="mt-1 leading-relaxed">
              Design consideration: some students may feel more comfortable talking first to someone who has been
              through the same experience, before approaching formal services. It&apos;s offered as an optional
              pathway alongside university support, not instead of it.
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-3">
            <AIBadge label="AI understanding" />
            <span className="text-[11px] text-slate-500">
              {result.source === "ai" ? "Live AI response" : "Offline example (AI unavailable)"}
            </span>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-medium text-slate-500">Need</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{result.need_label}</div>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <div className="text-xs font-medium text-indigo-600">Suggested support</div>
                <div className="mt-1 text-lg font-semibold text-indigo-900">{result.route_to}</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500">Message back to {student.name}</div>
              <div className="mt-2 rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-800">
                {result.reply}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-semibold text-slate-800">People who may be able to help</div>
                <div className="text-xs text-slate-500">{student.name} chooses any, or none</div>
              </div>
              <div className="mt-2 space-y-2">
                {options.map((o) => {
                  const on = selected.includes(o.label);
                  const kind = PATHWAYS[o.label]?.kind ?? "university";
                  return (
                    <label
                      key={o.label}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        on ? "border-indigo-400 bg-indigo-50/60" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(o.label)}
                        className="mt-1 h-4 w-4 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{o.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${KIND_STYLE[kind]}`}>
                            {KIND_LABEL[kind]}
                          </span>
                          {o.label === advisorSuggestion && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Suggested by {student.advisor.name}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{o.why}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={onEdit}>
                ← That&apos;s not quite right
              </Button>
              <Button onClick={onNext} disabled={selected.length === 0}>
                Next step → Explore support
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ServiceNowNote>
        <strong>Now Assist</strong> / a generative AI skill classifies the reply into a need and a primary route,
        returning structured output. The need then looks up optional pathways (university services, faculty,
        seniors, alumni, clubs) from a support-network table. Nothing is sent to anyone at this point.
      </ServiceNowNote>
    </div>
  );
}

function SafetyPath({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <div className="fade-up space-y-6">
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800">
        <strong>Safety guardrail triggered.</strong> Normal AI routing was skipped and a person was brought in. This
        prototype uses a simple phrase check. It is not a clinically reliable crisis detector.
      </div>

      <Card className="overflow-hidden">
        <div className="bg-rose-600 px-5 py-3 text-sm font-semibold text-white">Urgent support: you&apos;re not alone</div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <p className="text-[15px] leading-relaxed text-slate-800">
              Thank you for telling us. That took courage. It sounds like things are really hard right now, and you
              don&apos;t have to handle this alone. <strong>A member of our wellbeing team will contact you today.</strong>
            </p>
            <blockquote className="mt-4 border-l-4 border-rose-200 pl-3 text-sm italic text-slate-600">
              &ldquo;{text}&rdquo;
            </blockquote>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-rose-200 p-3 text-sm">
              <div className="font-semibold text-slate-900">If you are in immediate danger</div>
              <div className="text-slate-600">Call your local emergency number now.</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="font-semibold text-slate-900">24/7 support line</div>
              <div className="text-slate-600">Talk to someone any time (placeholder number for the demo).</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="font-semibold text-slate-900">Campus wellbeing duty team</div>
              <div className="text-slate-600">Same-day response during opening hours.</div>
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <Button onClick={onNext}>See the human escalation →</Button>
        </div>
      </Card>
    </div>
  );
}
