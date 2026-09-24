"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SAFETY_RESPONSE, type Student } from "@/lib/students";
import { Button, Card, ServiceNowNote } from "./ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRec = any;

function getRecognition(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function CheckIn({
  student,
  advisorSuggestion,
  advisorNote,
  text,
  setText,
  loading,
  onSubmit,
}: {
  student: Student;
  advisorSuggestion: string | null;
  advisorNote: string;
  text: string;
  setText: (t: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  const [mode, setMode] = useState<"type" | "voice">("type");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [declined, setDeclined] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.abort?.();
  }, []);

  function startListening() {
    setVoiceError(null);
    const rec = getRecognition();
    if (!rec) {
      setVoiceSupported(false);
      return;
    }
    rec.lang = navigator.language || "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    baseTextRef.current = text.trim();
    let finalText = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else interimText += r[0].transcript;
      }
      setText([baseTextRef.current, finalText.trim()].filter(Boolean).join(" "));
      setInterim(interimText);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      setVoiceError(
        e.error === "not-allowed"
          ? "Microphone permission was blocked. You can type your reply instead."
          : "Voice input stopped. You can try again or type your reply.",
      );
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stopListening() {
    recRef.current?.stop();
    setListening(false);
  }

  if (declined) {
    return (
      <div className="fade-up mx-auto max-w-xl">
        <Card className="p-8 text-center">
          <div className="text-3xl">🌱</div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">No problem, {student.name}.</h2>
          <p className="mt-2 text-slate-600">
            Nothing has been shared and no one has been notified. Support is here whenever you want it. You can
            reply to this message any time.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => setDeclined(false)}>
            ← Back to the check-in (demo)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">A gentle check-in</h1>
        <p className="mt-1 text-slate-600">
          This is what {student.name} sees in the student app. Replying is optional, and {student.name} decides what to say.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          {/* app chrome */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              SS
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Student Support Team</div>
              <div className="text-[11px] text-slate-500">University student app · Messages</div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-indigo-50 px-4 py-3 text-[15px] leading-relaxed text-slate-800">
              {student.checkIn}
              <div className="mt-2 text-xs text-slate-500">
                Totally optional. Reply only if you&apos;d like to.
              </div>
            </div>

            {(advisorNote.trim() || advisorSuggestion) && (
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <div className="text-xs font-semibold text-slate-500">
                  A note from {student.advisor.name}, your {student.advisor.role.toLowerCase()}
                </div>
                {advisorNote.trim() && <p className="mt-1">&ldquo;{advisorNote.trim()}&rdquo;</p>}
                {advisorSuggestion && (
                  <p className="mt-2 text-xs text-slate-500">
                    They also mentioned <strong className="text-slate-700">{advisorSuggestion}</strong> might be
                    useful. Entirely your choice.
                  </p>
                )}
              </div>
            )}

            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-medium text-indigo-700">Why am I getting this?</summary>
              <p className="mt-1 leading-relaxed">
                We send check-ins when a student&apos;s usual pattern changes, for example around classes, coursework
                or activities you&apos;ve signed up for, or when your advisor thinks something might interest you.
                It isn&apos;t a judgement or a label, and nothing happens unless you choose to reply.
              </p>
            </details>

            {/* input mode */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="reply" className="text-sm font-semibold text-slate-800">
                  Your reply
                </label>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                  {(["type", "voice"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        if (m === "type") stopListening();
                        setMode(m);
                      }}
                      className={`rounded-md px-3 py-1 transition ${
                        mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {m === "type" ? "⌨️ Type" : "🎙️ Speak"}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "voice" && (
                <div className="mb-3 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <button
                    onClick={listening ? stopListening : startListening}
                    disabled={!voiceSupported}
                    aria-label={listening ? "Stop recording" : "Start recording"}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition disabled:bg-slate-300 ${
                      listening ? "mic-live bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {listening ? (
                      <span className="h-4 w-4 rounded-sm bg-white" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                      </svg>
                    )}
                  </button>
                  <div className="text-sm text-slate-600">
                    {!voiceSupported
                      ? "Voice input isn't available in this browser. Please type your reply below."
                      : listening
                        ? "Listening… tap to stop. Your words appear below so you can check and edit them."
                        : "Tap the mic and speak. The microphone is only on while it's red."}
                    {voiceError && <div className="mt-1 text-rose-600">{voiceError}</div>}
                  </div>
                </div>
              )}

              <textarea
                id="reply"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Write as much or as little as you like…"
                className="w-full resize-none rounded-xl border border-slate-300 p-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
              {interim && <div className="mt-1 text-sm italic text-slate-400">{interim}…</div>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setDeclined(true)}>
                Not right now
              </Button>
              <Button onClick={onSubmit} disabled={!text.trim() || loading || listening}>
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Understanding your reply…
                  </>
                ) : (
                  "Send my reply →"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Voluntary / privacy panel */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="text-emerald-600">🛡️</span> {student.name} is in control
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              {[
                ["Replying is optional", "Ignoring the message has no consequence and notifies nobody."],
                ["The student chooses what to say", "Only the words she types or speaks are used, nothing else."],
                ["Voice is optional", "The mic is only on when tapped, and speech becomes editable text first."],
                ["Nothing goes to staff yet", "Explicit consent is asked before anything is shared."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-700">
                    ✓
                  </span>
                  <span>
                    <span className="font-medium text-slate-800">{t}.</span> {d}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-dashed p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Presenter shortcuts</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setText(student.demoResponse)}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Fill {student.name}&apos;s reply
              </button>
              <button
                onClick={() => setText(DEMO_SAFETY_RESPONSE)}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Fill safety-test reply
              </button>
            </div>
          </Card>
        </div>
      </div>

      <ServiceNowNote>
        Delivered through <strong>Virtual Agent</strong> or a student-facing <strong>Service Portal</strong>.
        The wording is a fixed, reviewed template, so no signals or figures are ever shown to the student. Voice uses
        the browser&apos;s built-in speech-to-text in this prototype.
      </ServiceNowNote>
    </div>
  );
}
