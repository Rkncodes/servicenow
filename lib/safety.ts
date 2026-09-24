// Prototype safety guardrail — a deterministic phrase check that runs BEFORE any AI routing.
// This is NOT a clinically reliable crisis detector. In production this would follow
// institutional duty-of-care policy and be reviewed by qualified staff.

const PATTERNS = [
  /suicid/,
  /kill (my ?self|me)/,
  /end (my|it all|my life)/,
  /(want|wanna) to die/,
  /don'?t want to (be here|live|exist)/,
  /no (reason|point) (to|in) (live|living|going on)/,
  /self[- ]?harm/,
  /hurt(ing)? my ?self/,
  /cut(ting)? my ?self/,
  /overdose/,
  /not safe/,
  /better off (dead|without me)/,
];

export function safetyCheck(text: string): boolean {
  const t = text.toLowerCase().replace(/[’‘]/g, "'");
  return PATTERNS.some((p) => p.test(t));
}
