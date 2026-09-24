import { safetyCheck } from "@/lib/safety";
import {
  SERVICES,
  SERVICE_NAMES,
  fallbackInterpret,
  safetyInterpretation,
  type Interpretation,
  type ServiceName,
} from "@/lib/services";

// Server-side only. LLM access goes through AgentRouter (OpenAI-compatible gateway).
// Configure in .env.local — never exposed to the browser (no NEXT_PUBLIC_ prefix).
const LLM_BASE_URL = process.env.LLM_BASE_URL ?? "https://agentrouter.org/v1";
const LLM_MODEL = process.env.LLM_MODEL ?? "deepseek-v4-flash";
const LLM_API_KEY = process.env.LLM_API_KEY;

const SYSTEM_PROMPT = `You are a student-support triage assistant for a university. A student has voluntarily replied to a gentle check-in message.

Your job: understand what the student says they need, in their own words, and suggest ONE appropriate primary support service.
"Right support" is not always counselling. It may be academic help, financial help, career or opportunity guidance (hackathons, projects, clubs, mentors), housing, or wellbeing. A student replying positively about opportunities is not in trouble.

Rules:
- Do NOT diagnose. Never mention or infer mental-health conditions unless the student explicitly asks for emotional support.
- Focus on the underlying practical need the student describes (e.g. money, housing, workload), not surface phrases like "I'm fine".
- Do not mention monitoring, tracking, attendance data, or anything the student did not tell you.
- Be warm, brief, non-judgemental. Use "you may want to explore" language: suggest, never instruct.
- Not being able to afford rent, bills or fees is a FINANCIAL need → "Student Hardship Support". Use "Accommodation Services" only for tenancy problems (landlord disputes, eviction, finding a place).
- route_to MUST be exactly one of: ${SERVICE_NAMES.map((s) => `"${s}"`).join(", ")}.

Return ONLY a JSON object, no markdown, with this shape:
{
  "need": one of "financial" | "academic" | "career" | "wellbeing" | "housing" | "general",
  "urgency": "low" | "medium" | "high",
  "route_to": string,
  "reply": string (2 sentences max, addressed to the student, warm, mentions the suggested support),
  "staff_summary": string (1–2 factual sentences describing what the student said, no speculation, no diagnosis)
}`;

function extractJson(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model output");
  return JSON.parse(content.slice(start, end + 1));
}

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  const input = (text ?? "").trim().slice(0, 2000);
  if (!input) return Response.json({ error: "Empty response" }, { status: 400 });

  // 1. Deterministic safety guardrail runs BEFORE any LLM call.
  if (safetyCheck(input)) return Response.json(safetyInterpretation(input));

  // 2. LLM interpretation, with a deterministic fallback so the demo never breaks.
  if (!LLM_API_KEY) {
    console.warn("[interpret] LLM_API_KEY not set, using fallback");
    return Response.json(fallbackInterpret(input));
  }

  try {
    const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_API_KEY}` },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0.2,
        max_tokens: 1200,
        reasoning_effort: "low", // Groq gpt-oss models reason before answering; keep it short
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Student's reply:\n"""${input}"""` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const parsed = extractJson(String(data.choices?.[0]?.message?.content ?? ""));

    const route = (SERVICE_NAMES.includes(parsed.route_to) ? parsed.route_to : "Student Support Team") as ServiceName;
    const result: Interpretation = {
      need: SERVICES[route].need,
      need_label: SERVICES[route].needLabel,
      urgency: ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : "medium",
      route_to: route,
      reply: String(parsed.reply ?? "").trim(),
      staff_summary: String(parsed.staff_summary ?? "").trim(),
      source: "ai",
    };
    if (!result.reply || !result.staff_summary) throw new Error("Incomplete AI response");
    return Response.json(result);
  } catch (err) {
    console.error("[interpret] falling back:", err);
    return Response.json(fallbackInterpret(input));
  }
}
