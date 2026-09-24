import type { Student } from "@/lib/students";

export const STEPS = ["Journey", "Advisor", "Check-in", "AI understanding", "Consent", "Human support"] as const;

export function StudentHeader({
  student,
  step,
  onStep,
}: {
  student: Student;
  step: number;
  onStep: (i: number) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
            {student.initials}
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-navy-900">
              {student.name} <span className="font-normal text-slate-500">— {student.year}</span>
            </div>
            <div className="text-xs text-slate-500">Example student journey · {student.course}</div>
          </div>
        </div>

        <nav className="flex items-center" aria-label="Journey steps">
          {STEPS.map((s, i) => {
            const state = i === step ? "current" : i < step ? "done" : "todo";
            return (
              <div key={s} className="flex items-center">
                {i > 0 && <span className={`h-px w-3 sm:w-5 ${i <= step ? "bg-teal-600" : "bg-slate-200"}`} />}
                <button
                  onClick={() => i <= step && onStep(i)}
                  disabled={i > step}
                  title={s}
                  className={`flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-medium ${
                    state === "current" ? "text-navy-900" : state === "done" ? "text-teal-700" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      state === "current"
                        ? "bg-teal-700 text-white"
                        : state === "done"
                          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span className={state === "current" ? "hidden sm:inline" : "hidden lg:inline"}>{s}</span>
                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
