"use client";

import { STUDENTS, type Student } from "@/lib/students";
import { evaluateWeek, triggerWeek } from "@/lib/earlyWarning";
import { Button, Card, ServiceNowNote, SimBadge } from "./ui";

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
  const reached = week >= TRIGGER_WEEK;

  return (
    <div className="fade-up space-y-6">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Every student has a different reason they may need support.
            </h1>
            <p className="mt-1 max-w-3xl text-slate-600">
              One system notices meaningful changes early and lets students say what they actually need. Then, with
              their consent, it connects them to the right <em>human</em> support. Pick an example student:
            </p>
          </div>
          <SimBadge>Example journeys · Prototype simulation</SimBadge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STUDENTS.map((s) => {
            const active = s.id === student.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  active ? "border-indigo-400 bg-white shadow-md ring-2 ring-indigo-100" : "border-slate-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${s.gradient}`}
                >
                  {s.initials}
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">{s.tab}</div>
                  <div className="font-semibold text-slate-900">
                    {s.name} <span className="text-xs font-normal text-slate-500">· {s.year}</span>
                  </div>
                  <div className="text-xs text-slate-500">{s.headline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        Meet {name}. <span className="font-normal text-slate-500">Ten weeks of the semester, one week at a time.</span>
      </h2>

      {/* Week slider */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-medium text-slate-500">Semester timeline</div>
          <div className="text-2xl font-bold text-indigo-700">Week {week}</div>
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
            return (
              <button key={w.week} onClick={() => setWeek(w.week)} className="flex flex-col items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    w.week === TRIGGER_WEEK
                      ? "bg-indigo-600 ring-4 ring-indigo-200"
                      : lvl === "checkin"
                        ? "bg-rose-300"
                        : lvl === "watching"
                          ? "bg-amber-300"
                          : "bg-slate-300"
                  }`}
                />
                <span className={w.week === week ? "font-bold text-slate-900" : ""}>W{w.week}</span>
                {w.week === TRIGGER_WEEK && (
                  <span className="whitespace-nowrap text-[10px] font-semibold text-indigo-700">Check-in point</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Priya's life */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">What {name} is living through</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Story context. The university <strong>cannot see this</strong>. Only {name} can tell us.
          </p>
          <ol className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
            {weeks.slice(0, week).map((w) => (
              <li key={w.week} className={`relative text-sm ${w.week === week ? "text-slate-900" : "text-slate-400"}`}>
                <span
                  className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    w.week === week ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                />
                <span className="font-semibold">Week {w.week}. </span>
                {w.life}
                {w.lifeTag && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {w.lifeTag}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Card>

        {/* Signals */}
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-semibold text-slate-900">What existing student-support records show</h2>
          <p className="mt-1 text-xs text-slate-500">
            Compared with {name}&apos;s <strong>own</strong> Weeks 1–2, not with other students.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {signals.map((s) => (
              <div
                key={s.key}
                className={`rounded-xl border p-3 transition ${
                  s.changed ? "border-amber-300 bg-amber-50/60" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{s.label}</div>
                    <div className="text-[11px] text-slate-500">{s.source}</div>
                  </div>
                  {s.changed && (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      {s.direction === "rise" ? "Increased" : "Changed"}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    {s.value}
                    <span className="text-xs font-medium text-slate-500">{s.unit}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    usual {Math.round(s.baseline)}
                    {s.unit === "/5" ? "/5" : ""}
                    {s.direction === "rise" ? " · watching for increase" : ""}
                  </span>
                </div>
                {/* mini history */}
                <div className="mt-2 flex h-8 items-end gap-0.5">
                  {weeks.map((w) => {
                    const v = w.values[s.key] ?? 0;
                    return (
                      <div
                        key={w.week}
                        className={`flex-1 rounded-sm ${
                          w.week > week ? "bg-slate-100" : w.week === week ? "bg-indigo-500" : "bg-indigo-200"
                        }`}
                        style={{ height: w.week > week ? "15%" : `${Math.max(8, (v / s.max) * 100)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Early-warning status */}
          <div
            className={`mt-4 rounded-xl border p-4 ${
              level === "checkin"
                ? "border-indigo-300 bg-indigo-50"
                : level === "watching"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  level === "checkin" ? "bg-indigo-600" : level === "watching" ? "bg-amber-400" : "bg-emerald-500"
                }`}
              />
              {level === "checkin"
                ? student.triggerLabel
                : level === "watching"
                  ? "Some change noticed: no action yet"
                  : `No change from ${name}'s usual pattern`}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {changedCount} of {signals.length} signals changed. Prototype rule: notify the advisor only when{" "}
              {student.required}+ signals change together. This is not a risk score or a diagnosis. It only means
              &ldquo;it may be worth asking how {name} is doing.&rdquo;
            </p>
          </div>
        </Card>
      </div>

      {/* Two paths */}
      <Card className="p-5">
        <h2 className="font-semibold text-slate-900">Two ways this semester could go</h2>
        <p className="mt-1 text-xs text-slate-500">Conceptual comparison, not a measured outcome.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <PathRow
            tone="slate"
            title="Without early support"
            steps={student.without}
          />
          <PathRow
            tone="indigo"
            title="With early support"
            steps={student.withSupport}
          />
        </div>
      </Card>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white sm:flex-row sm:justify-between">
        <div>
          <div className="font-semibold">
            {reached ? `Week ${TRIGGER_WEEK}: this is where we step in.` : `Move to Week ${TRIGGER_WEEK} to reach the check-in point.`}
          </div>
          <div className="text-sm text-indigo-100">
            Instead of waiting, a human advisor is notified and {name} gets a check-in. {name} decides what to share.
          </div>
        </div>
        {reached ? (
          <Button variant="secondary" onClick={onCheckIn} className="shrink-0 !border-white">
            Notify {name}&apos;s advisor →
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setWeek(TRIGGER_WEEK)} className="shrink-0 !border-white">
            Jump to Week {TRIGGER_WEEK}
          </Button>
        )}
      </div>

      <ServiceNowNote>
        Attendance, submissions and LMS activity arrive as records through <strong>IntegrationHub</strong> into a
        student-support data model. A scheduled <strong>Flow Designer</strong> flow evaluates the change rule per
        student and, when it fires, notifies the faculty advisor and starts a check-in flow. No case is created and no
        label is attached to the student.
      </ServiceNowNote>
    </div>
  );
}

function PathRow({ title, steps, tone }: { title: string; steps: string[]; tone: "slate" | "indigo" }) {
  const c =
    tone === "indigo"
      ? { box: "border-indigo-200 bg-indigo-50/50", chip: "bg-white border-indigo-200 text-indigo-900", title: "text-indigo-800", arrow: "text-indigo-300" }
      : { box: "border-slate-200 bg-slate-50", chip: "bg-white border-slate-200 text-slate-600", title: "text-slate-600", arrow: "text-slate-300" };
  return (
    <div className={`rounded-xl border p-4 ${c.box}`}>
      <div className={`text-sm font-semibold ${c.title}`}>{title}</div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`rounded-lg border px-2 py-1 text-xs ${c.chip}`}>{s}</span>
            {i < steps.length - 1 && <span className={c.arrow}>→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
