// Prototype change-detection logic — simple deterministic rules, NOT a validated predictive model.
// Compares the selected week against THIS student's own early-weeks baseline, and notifies the
// advisor only when several signals have changed at the same time.

import type { SignalDef, Student, Week } from "./students";

const BASELINE_WEEKS = 2;

export type SignalStatus = SignalDef & {
  value: number | null;
  baseline: number;
  change: number;
  changed: boolean;
};

function baseline(student: Student, key: string): number {
  const vals = student.weeks.slice(0, BASELINE_WEEKS).map((wk) => wk.values[key] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function evaluateWeek(student: Student, wk: Week) {
  const signals: SignalStatus[] = student.signals.map((s) => {
    const base = baseline(student, s.key);
    const value = wk.values[s.key];
    const change = value == null ? 0 : value - base;
    const moved = s.direction === "drop" ? -change : change;
    return { ...s, value, baseline: base, change, changed: value != null && moved >= s.threshold };
  });
  const changedCount = signals.filter((s) => s.changed).length;
  const level: "none" | "watching" | "checkin" =
    changedCount >= student.required ? "checkin" : changedCount >= 1 ? "watching" : "none";
  return { signals, changedCount, level };
}

export function triggerWeek(student: Student): number {
  return student.weeks.find((wk) => evaluateWeek(student, wk).level === "checkin")?.week ?? 4;
}
