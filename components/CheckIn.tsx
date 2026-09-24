"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SAFETY_RESPONSE, type Student } from "@/lib/students";
import { Button, Card, PageTitle, ServiceNowNote, SourceTag } from "./ui";

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
          ? "Microphone blocked. You can type instead."
          : "Voice input stopped. Try again or type instead.",
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
          <h2 className="text-xl font-semibold text-navy-900">No problem, {student.name}.</h2>
          <p className="mt-2 text-slate-600">Nothing has been shared and no one has been notified.</p>
          <Button variant="secondary" className="mt-6" onClick={() => setDeclined(false)}>
            ← Back (demo)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-6">
      <PageTitle title="A gentle check-in" sub={`What ${student.name} sees in the student app.`} />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-surface px-5 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-900 text-[10px] font-bold text-white">
            SS
          </div>
          <div className="text-sm font-semibold text-navy-900">Student Support Team</div>
        </div>

        <div className="space-y-4 p-5">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 text-[15px] leading-relaxed text-navy-900">
            {student.checkIn}
          </div>

          {(advisorNote.trim() || advisorSuggestion) && (
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                From {student.advisor.name}
                {advisorSuggestion && <SourceTag kind="advisor" />}
              </div>
              {advisorNote.trim() && <p className="mt-1">&ldquo;{advisorNote.trim()}&rdquo;</p>}
              {advisorSuggestion && (
                <p className="mt-1 text-xs text-slate-500">
                  Might be useful: <strong className="text-slate-700">{advisorSuggestion}</strong>. Your choice.
                </p>
              )}
            </div>
          )}

          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer font-medium text-teal-700">Why am I getting this?</summary>
            <p className="mt-1">
              We check in when a student&apos;s usual pattern changes, or when an advisor thinks something may interest
              you. It isn&apos;t a judgement or a label.
            </p>
          </details>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="reply" className="text-sm font-semibold text-navy-900">
                Your reply <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="inline-flex rounded-md border border-slate-200 p-0.5 text-xs font-medium">
                {(["type", "voice"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      if (m === "type") stopListening();
                      setMode(m);
                    }}
                    className={`rounded px-3 py-1 transition ${mode === m ? "bg-navy-900 text-white" : "text-slate-500"}`}
                  >
                    {m === "type" ? "Type" : "Speak"}
                  </button>
                ))}
              </div>
            </div>

            {mode === "voice" && (
              <div className="mb-3 flex items-center gap-3">
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={!voiceSupported}
                  aria-label={listening ? "Stop recording" : "Start recording"}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition disabled:bg-slate-300 ${
                    listening ? "mic-live bg-rose-700" : "bg-teal-700 hover:bg-teal-800"
                  }`}
                >
                  {listening ? (
                    <span className="h-3.5 w-3.5 rounded-sm bg-white" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                    </svg>
                  )}
                </button>
                <div className="text-xs text-slate-500">
                  {!voiceSupported
                    ? "Voice isn't available in this browser. Please type instead."
                    : listening
                      ? "Listening… tap to stop. You can edit the text below."
                      : "Tap to speak. The mic is only on while it's red."}
                  {voiceError && <div className="text-rose-700">{voiceError}</div>}
                </div>
              </div>
            )}

            <textarea
              id="reply"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Write as much or as little as you like…"
              className="w-full resize-none rounded-lg border border-slate-300 p-3 text-[15px] text-navy-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            {interim && <div className="mt-1 text-sm italic text-slate-400">{interim}…</div>}
            <p className="mt-2 text-xs text-slate-500">
              🔒 Only what you write or say is used. Nothing is shared without your consent.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setDeclined(true)}>
              Not right now
            </Button>
            <Button onClick={onSubmit} disabled={!text.trim() || loading || listening}>
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Reading your reply…
                </>
              ) : (
                "Send my reply →"
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>Demo:</span>
        <button onClick={() => setText(student.demoResponse)} className="underline-offset-2 hover:text-navy-800 hover:underline">
          fill {student.name}&apos;s reply
        </button>
        <button onClick={() => setText(DEMO_SAFETY_RESPONSE)} className="underline-offset-2 hover:text-navy-800 hover:underline">
          fill safety-test reply
        </button>
      </div>

      <ServiceNowNote>
        Delivered via <strong>Virtual Agent</strong> or a student <strong>Service Portal</strong>, using a fixed,
        reviewed template, so no figures or signals are ever shown to the student. Voice uses the browser&apos;s
        speech-to-text in this prototype.
      </ServiceNowNote>
    </div>
  );
}
