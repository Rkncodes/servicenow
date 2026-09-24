// Primary support routes the AI may choose from. The Human Support Network (supportNetwork.ts)
// then expands a need into optional pathways, including seniors and alumni.
export const SERVICES = {
  "Student Hardship Support": { need: "financial", needLabel: "Financial support" },
  "Academic Advising": { need: "academic", needLabel: "Academic support" },
  "Careers & Opportunities": { need: "career", needLabel: "Career & opportunity guidance" },
  "Wellbeing & Counselling": { need: "wellbeing", needLabel: "Wellbeing support" },
  "Accommodation Services": { need: "housing", needLabel: "Housing support" },
  "Student Support Team": { need: "general", needLabel: "General support" },
} as const;

export type ServiceName = keyof typeof SERVICES;
export const SERVICE_NAMES = Object.keys(SERVICES) as ServiceName[];

export type Interpretation = {
  need: string;
  need_label: string;
  urgency: "low" | "medium" | "high";
  route_to: string;
  reply: string;
  staff_summary: string;
  source: "ai" | "fallback" | "safety";
};

// Used when the LLM is unavailable/slow so the demo never breaks.
export function fallbackInterpret(text: string): Interpretation {
  const t = text.toLowerCase();
  const pick = (route: ServiceName, reply: string, urgency: Interpretation["urgency"] = "medium"): Interpretation => ({
    need: SERVICES[route].need,
    need_label: SERVICES[route].needLabel,
    urgency,
    route_to: route,
    reply,
    staff_summary: `Student shared: "${text.trim().slice(0, 240)}". Suggested route based on student's own description.`,
    source: "fallback",
  });
  if (/\b(rent|afford|money|bills|debt|fees|broke|shifts)\b/.test(t))
    return pick(
      "Student Hardship Support",
      "Thank you for telling us. It sounds like financial pressure is making it harder to balance work and your studies. You may want to explore the Student Hardship Support options. They can help with things like rent and short-term costs.",
    );
  if (/\b(hackathons?|projects?|clubs?|internships?|careers?|team|coding|events?)\b/.test(t))
    return pick(
      "Careers & Opportunities",
      "That's great to hear! It sounds like you're keen to get into hackathons and projects and would like to find people to learn from. You may want to explore connecting with a senior mentor or a student tech community.",
      "low",
    );
  if (/\b(landlord|evict\w*|housing|flat|accommodation)\b/.test(t))
    return pick("Accommodation Services", "Thanks for sharing that. It sounds like your housing situation is causing some pressure. Accommodation Services may be able to help.");
  if (/\b(deadlines?|assignments?|exams?|behind|grades?|gpa|modules?|understand|classes)\b/.test(t))
    return pick(
      "Academic Advising",
      "Thanks for being honest about this. It sounds like a module has become hard to keep up with, and you're not sure who to ask. You may want to explore Academic Advising, or talk to a senior who has done the same course.",
    );
  if (/\b(stress\w*|anxious|lonely|sad|overwhelm\w*|sleep)\b/.test(t))
    return pick("Wellbeing & Counselling", "Thank you for sharing that. It sounds like things have felt heavy lately. The Wellbeing team is there if you'd like someone to talk to.");
  return pick("Student Support Team", "Thanks for getting back to us. The Student Support Team can help you find the right place to go, whenever you're ready.", "low");
}

export function safetyInterpretation(text: string): Interpretation {
  return {
    need: "urgent_wellbeing",
    need_label: "Urgent wellbeing support",
    urgency: "high",
    route_to: "Wellbeing Duty Team",
    reply:
      "Thank you for telling us. That took courage. It sounds like things are really hard right now, and you don't have to handle this alone. A member of our wellbeing team will reach out to you today.",
    staff_summary: `Safety guardrail matched concerning language. Student wrote: "${text.trim().slice(0, 240)}". Human follow-up required. AI routing was bypassed.`,
    source: "safety",
  };
}
