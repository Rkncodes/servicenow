"use client";

import { useState } from "react";
import { StudentHeader } from "@/components/StudentHeader";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { AdvisorNotice } from "@/components/AdvisorNotice";
import { CheckIn } from "@/components/CheckIn";
import { AIUnderstanding } from "@/components/AIUnderstanding";
import { Consent, StaffCase } from "@/components/Handoff";
import { fallbackInterpret, type Interpretation } from "@/lib/services";
import { DEFAULT_STUDENT, STUDENTS, type Student } from "@/lib/students";

export default function Home() {
  const [studentId, setStudentId] = useState<Student["id"]>(DEFAULT_STUDENT);
  const student = STUDENTS.find((s) => s.id === studentId)!;

  const [step, setStep] = useState(0);
  const [week, setWeek] = useState(1);
  const [advisorSuggestion, setAdvisorSuggestion] = useState<string | null>(student.advisorDefaultSuggestion);
  const [advisorNote, setAdvisorNote] = useState(student.advisorDefaultNote);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Interpretation | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const go = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function selectStudent(id: Student["id"]) {
    const s = STUDENTS.find((x) => x.id === id)!;
    setStudentId(id);
    setWeek(1);
    setAdvisorSuggestion(s.advisorDefaultSuggestion);
    setAdvisorNote(s.advisorDefaultNote);
    setText("");
    setResult(null);
    setSelected([]);
    go(0);
  }

  async function interpret() {
    setLoading(true);
    let r: Interpretation;
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(String(res.status));
      r = await res.json();
    } catch {
      r = fallbackInterpret(text);
    }
    setResult(r);
    setSelected([r.route_to]);
    setLoading(false);
    go(3);
  }

  return (
    <>
      <StudentHeader student={student} onSelect={selectStudent} step={step} onStep={go} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {step === 0 && (
          <JourneyTimeline student={student} onSelect={selectStudent} week={week} setWeek={setWeek} onCheckIn={() => go(1)} />
        )}
        {step === 1 && (
          <AdvisorNotice
            student={student}
            suggestion={advisorSuggestion}
            setSuggestion={setAdvisorSuggestion}
            note={advisorNote}
            setNote={setAdvisorNote}
            onSend={() => go(2)}
          />
        )}
        {step === 2 && (
          <CheckIn
            student={student}
            advisorSuggestion={advisorSuggestion}
            advisorNote={advisorNote}
            text={text}
            setText={setText}
            loading={loading}
            onSubmit={interpret}
          />
        )}
        {step === 3 && result && (
          <AIUnderstanding
            student={student}
            text={text}
            result={result}
            advisorSuggestion={advisorSuggestion}
            selected={selected}
            setSelected={setSelected}
            onEdit={() => go(2)}
            onNext={() => go(result.source === "safety" ? 5 : 4)}
          />
        )}
        {step === 4 && result && (
          <Consent student={student} text={text} result={result} selected={selected} onShare={() => go(5)} />
        )}
        {step === 5 && result && (
          <StaffCase
            student={student}
            text={text}
            result={result}
            selected={selected}
            onRestart={() => selectStudent(STUDENTS[(STUDENTS.indexOf(student) + 1) % STUDENTS.length].id)}
          />
        )}
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Prototype simulation for ServiceNow Co-Innovation Day · Track 2: Early Warning · Fictional students, illustrative
        data. Not a predictive or diagnostic tool.
      </footer>
    </>
  );
}
