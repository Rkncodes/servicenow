import { STUDENTS, type Student } from "@/lib/students";

export const STEPS = ["Journey", "Advisor", "Check-in", "AI understanding", "Consent", "Human support"] as const;

export function StudentHeader({
  student,
  onSelect,
  step,
  onStep,
}: {
  student: Student;
  onSelect: (id: Student["id"]) => void;
  step: number;
  onStep: (i: number) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${student.gradient}`}
          >
            {student.initials}
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Example student journey</div>
            <div className="font-semibold text-slate-900">
              {student.name} <span className="font-normal text-slate-500">— {student.year}</span>
            </div>
            <div className="text-xs text-slate-500">{student.course}</div>
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium" role="tablist">
          {STUDENTS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === student.id}
              onClick={() => onSelect(s.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                s.id === student.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <nav className="flex flex-1 flex-wrap items-center justify-end gap-1" aria-label="Journey steps">
          {STEPS.map((s, i) => {
            const state = i === step ? "current" : i < step ? "done" : "todo";
            return (
              <button
                key={s}
                onClick={() => i <= step && onStep(i)}
                disabled={i > step}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  state === "current"
                    ? "bg-indigo-600 text-white"
                    : state === "done"
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "text-slate-400"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    state === "current" ? "bg-white/25" : state === "done" ? "bg-indigo-200" : "bg-slate-200"
                  }`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="hidden xl:inline">{s}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
