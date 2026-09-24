"use client";

import { STUDENTS, type Student } from "@/lib/students";
import { evaluateWeek, triggerWeek } from "@/lib/earlyWarning";
import { Button, Card, ServiceNowNote } from "./ui";

export function JourneyTimeline({
  student,
  onSelect,
  week,
  setWeek,
  onCheckIn,
}: {
  student: Student;
  onSelect: (id: Student["id"]) => void;
  week: number;
  setWeek: (w: number) => void;
  onCheckIn: () => void;
}) {
  const { weeks, name } = student;
  const TRIGGER_WEEK = triggerWeek(student);
  const current = weeks[week - 1];
  const { signals, changedCount, level } = evaluateWeek(student, current);
  // The advisor is only notified once the flow has actually fired at or before the viewed week.
  const reached = TRIGGER_WEEK !== null && week >= TRIGGER_WEEK;

  return (
    <div className="fade-up space-y-6">
      {/* 1. Student selector */}
      <div className="grid gap-2 sm:grid-cols-3" role="tablist">
        {STUDENTS.map((s) => {
          const active = s.id === student.id;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(s.id)}
              className={`rounded-lg border px-4 py-2.5 text-left transition ${
                active ? "border-teal-600 bg-white ring-1 ring-teal-600" : "border-slate-200 bg-surface hover:bg-white"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">{s.tab}</div>
              <div className="text-sm font-semibold text-navy-900">
                {s.name} <span className="font-normal text-slate-500">· {s.headline}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. One-line explanation */}
      <p className="text-[15px] text-slate-600">
        Notice meaningful change in <em>this</em> student&apos;s own pattern → bring in a human → let the student say
        what they need → connect them, with consent, to the right support.
      </p>

      {/* 3. Timeline */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-medium text-slate-500">{name}&apos;s semester</div>
          <div className="text-2xl font-semibold text-navy-900">Week {week}</div>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="week-slider mt-4 w-full cursor-pointer"
          aria-label="Week"
        />
        <div className="mt-2 grid grid-cols-10 text-center text-[11px] text-slate-500">
          {weeks.map((w) => {
            const lvl = evaluateWeek(student, w).level;
            const isTrigger = reached && w.week === TRIGGER_WEEK;
            return (
              <button key={w.week} onClick={() => setWeek(w.week)} className="flex flex-col items-center gap-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isTrigger
                      ? "bg-amber-500 ring-4 ring-amber-100"
                      : lvl === "checkin"
                        ? "bg-amber-400"
                        : lvl === "watching"
                          ? "bg-amber-200"
                          : "bg-slate-300"
                  }`}
                />
                <span className={w.week === week ? "font-semibold text-navy-900" : ""}>W{w.week}</span>
                {isTrigger && <span className="whitespace-nowrap text-[10px] font-semibold text-amber-700">Advisor notified</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4–5. Experience vs. records */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-navy-900">What {name} is experiencing</h2>
          <p className="text-xs text-slate-500">Not visible to the university. Only {name} can tell us.</p>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-900">
            {current.life}
            {current.lifeTag && (
              <span className="ml-2 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {current.lifeTag}
              </span>
            )}
          </p>
          {week > 1 && (
            <ol className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400">
              {weeks
                .slice(0, week - 1)
                .reverse()
                .map((w) => (
                  <li key={w.week}>
                    <span className="font-medium text-slate-500">W{w.week}</span> {w.life}
                  </li>
                ))}
            </ol>
          )}
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-navy-900">What existing records show</h2>
          <p className="text-xs text-slate-500">Compared with {name}&apos;s own Weeks 1–2, not with other students.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {signals.map((s) => (
              <div
                key={s.key}
                title={`Source: ${s.source}`}
                className={`rounded-lg border p-3 ${s.changed ? "border-amber-300 bg-amber-50/50" : "border-slate-200"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="truncate text-xs font-medium text-slate-600">{s.label}</div>
                  <div className="shrink-0 text-sm font-semibold text-navy-900">
                    {s.value}
                    <span className="text-[11px] font-normal text-slate-400">{s.unit}</span>
                  </div>
                </div>
                <div className="mt-2 flex h-10 items-end gap-0.5">
                  {weeks.map((w) => {
                    const v = w.values[s.key] ?? 0;
                    return (
                      <div
                        key={w.week}
                        className={`flex-1 rounded-sm ${
                          w.week > week
                            ? "bg-slate-100"
                            : w.week === week
                              ? s.changed
                                ? "bg-amber-500"
                                : "bg-teal-600"
                              : "bg-slate-300"
                        }`}
                        style={{ height: w.week > week ? "12%" : `${Math.max(8, (v / s.max) * 100)}%` }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  usual {Math.round(s.baseline * 10) / 10}
                  {s.changed && (
                    <span className="ml-1 font-medium text-amber-700">· {s.direction === "rise" ? "increased" : "changed"}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6–7. Change detected → Advisor notified + CTA */}
      <div
        className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          level === "checkin" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-surface"
        }`}
      >
        <div>
          <div className="font-semibold text-navy-900">
            {level === "checkin"
              ? `${student.triggerLabel} → ${student.advisor.name} notified`
              : level === "watching"
                ? "Small change: no action yet"
                : `No change from ${name}'s usual pattern`}
          </div>
          <div className="text-xs text-slate-500">
            {changedCount} of {signals.length} signals changed · rule: {student.required}+ together. Not a risk score
            or diagnosis.
          </div>
        </div>
        {reached ? (
          <Button onClick={onCheckIn} className="shrink-0">
            Continue: advisor view →
          </Button>
        ) : TRIGGER_WEEK !== null ? (
          <Button variant="secondary" onClick={() => setWeek(TRIGGER_WEEK)} className="shrink-0">
            Jump to Week {TRIGGER_WEEK}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-8">
        <details className="mt-8 text-xs text-slate-500">
          <summary className="cursor-pointer select-none font-medium hover:text-navy-800">Without early support ›</summary>
          <div className="mt-2 space-y-1">
            <div>
              <span className="font-medium text-slate-600">Without:</span> {student.without.join(" → ")}
            </div>
            <div>
              <span className="font-medium text-slate-600">With:</span> {student.withSupport.join(" → ")}
            </div>
            <div className="italic">Conceptual comparison, not a measured outcome.</div>
          </div>
        </details>
        <ServiceNowNote>
          Records arrive via <strong>IntegrationHub</strong>. A scheduled <strong>Flow Designer</strong> flow applies
          the change rule per student and, when it fires, notifies the advisor and starts a check-in. No case is
          created and no label is attached.
        </ServiceNowNote>
      </div>
    </div>
  );
}
