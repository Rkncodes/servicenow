import { safetyCheck } from "@/lib/safety";
import {
  SERVICES,
  SERVICE_NAMES,
  fallbackInterpret,
  safetyInterpretation,
  type Interpretation,
  type ServiceName,
} from "@/lib/services";

const SYSTEM_PROMPT = `You are a student-support triage assistant for a university. A student has voluntarily replied to a gentle check-in message.

Your job: understand what the student says they need, in their own words, and suggest ONE appropriate primary support service.
"Right support" is not always counselling. It may be academic help, financial help, career or opportunity guidance (hackathons, projects, clubs, mentors), housing, or wellbeing. Students replying positively about opportunities are not in trouble; treat them as such.

Rules:
- Do NOT diagnose. Never mention or infer mental-health conditions unless the student explicitly asks for emotional support.
- Focus on the underlying practical need the student describes (e.g. money, housing, workload), not surface phrases like "I'm fine".
- Do not mention monitoring, tracking, attendance data, or anything the student did not tell you.
- Be warm, brief, non-judgemental. Use "you may want to explore" language — suggest, never instruct.
- route_to MUST be exactly one of: ${SERVICE_NAMES.map((s) => `"${s}"`).join(", ")}.

Return ONLY JSON with this shape:
{
  "need": one of "financial" | "academic" | "career" | "wellbeing" | "housing" | "general",
  "urgency": "low" | "medium" | "high",
  "route_to": string,
  "reply": string (2 sentences max, addressed to the student, warm, mentions the suggested service),
  "staff_summary": string (1–2 factual sentences describing what the student said, no speculation, no diagnosis)
}`;

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  const input = (text ?? "").trim().slice(0, 2000);
  if (!input) return Response.json({ error: "Empty response" }, { status: 400 });

  // 1. Deterministic safety guardrail runs BEFORE any AI routing.
  if (safetyCheck(input)) return Response.json(safetyInterpretation(input));

  // 2. LLM interpretation, with a deterministic fallback so the demo never breaks.
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json(fallbackInterpret(input));

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Student's reply:\n"""${input}"""` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const route = (SERVICE_NAMES.includes(parsed.route_to) ? parsed.route_to : "Student Support Team") as ServiceName;
    const result: Interpretation = {
      need: SERVICES[route].need,
      need_label: SERVICES[route].needLabel,
      urgency: ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : "medium",
      route_to: route,
      reply: String(parsed.reply ?? ""),
      staff_summary: String(parsed.staff_summary ?? ""),
      source: "ai",
    };
    if (!result.reply || !result.staff_summary) throw new Error("Incomplete AI response");
    return Response.json(result);
  } catch (err) {
    console.error("[interpret] falling back:", err);
    return Response.json(fallbackInterpret(input));
  }
}
