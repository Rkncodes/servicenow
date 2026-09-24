// Mock "Human Support Network" — optional support pathways by need.
// Role-level options, not individually assigned people. No real matching infrastructure.

export type PathwayKind = "university" | "faculty" | "peer" | "alumni" | "community";

export const PATHWAYS: Record<string, { kind: PathwayKind; blurb: string }> = {
  "Student Hardship Support": { kind: "university", blurb: "Emergency grants, rent/fee payment plans and budgeting advice." },
  "Academic Advising": { kind: "university", blurb: "Make a catch-up plan for modules, deadlines and attendance." },
  "Tutoring & Academic Support": { kind: "university", blurb: "Small-group or one-to-one help with specific subjects." },
  "Wellbeing & Counselling": { kind: "university", blurb: "Talk to a wellbeing advisor, drop-ins and self-help resources." },
  "Accommodation Services": { kind: "university", blurb: "Tenancy advice and emergency accommodation guidance." },
  "Careers & Opportunities": { kind: "university", blurb: "Hackathons, internships, projects and career guidance." },
  "Student Support Team": { kind: "university", blurb: "A friendly first point of contact who helps you find the right service." },
  "Faculty Mentor": { kind: "faculty", blurb: "A faculty member in your department who can guide you." },
  "Senior Student Mentor": { kind: "peer", blurb: "A senior student who volunteers to mentor." },
  "SRM Alumni Mentor": { kind: "alumni", blurb: "An SRM graduate working in your field who volunteers to mentor." },
  "Hackathon & Coding Community": { kind: "community", blurb: "Student clubs and teams that build projects and enter hackathons together." },
};

export const KIND_LABEL: Record<PathwayKind, string> = {
  university: "University service",
  faculty: "Faculty",
  peer: "Senior student",
  alumni: "Alumni",
  community: "Student community",
};

// Need → recommended pathways, each with a need-specific "why this might help".
export const NEED_NETWORK: Record<string, { label: string; why: string }[]> = {
  academic: [
    { label: "Academic Advising", why: "Help building a realistic catch-up plan." },
    { label: "Tutoring & Academic Support", why: "Targeted help with the module you're finding hard." },
    { label: "Senior Student Mentor", why: "A senior from your course who has already done these modules." },
    { label: "Faculty Mentor", why: "Guidance from someone in your department." },
  ],
  financial: [
    { label: "Student Hardship Support", why: "Can help with rent and short-term costs." },
    { label: "Student Support Team", why: "Can help you balance work hours and deadlines." },
    { label: "Senior Student Mentor", why: "A senior who has balanced part-time work with study." },
  ],
  career: [
    { label: "Senior Student Mentor", why: "A senior who has competed in hackathons and can help you find a team." },
    { label: "SRM Alumni Mentor", why: "An alum working in tech who can share how they got started." },
    { label: "Hackathon & Coding Community", why: "Clubs where students team up for projects and events." },
    { label: "Careers & Opportunities", why: "Where upcoming hackathons and internships are listed." },
    { label: "Faculty Mentor", why: "A faculty member who supervises student projects." },
  ],
  wellbeing: [
    { label: "Wellbeing & Counselling", why: "Someone to talk things through with." },
    { label: "Student Support Team", why: "A friendly first point of contact." },
    { label: "Senior Student Mentor", why: "Someone who has been through similar experiences." },
  ],
  housing: [
    { label: "Accommodation Services", why: "Advice on your housing situation." },
    { label: "Student Hardship Support", why: "If housing costs are part of the pressure." },
    { label: "Student Support Team", why: "A friendly first point of contact." },
  ],
  general: [
    { label: "Student Support Team", why: "Helps you find the right place to go." },
    { label: "Faculty Mentor", why: "Guidance from someone in your department." },
  ],
};

export function isMentorPathway(label: string) {
  const k = PATHWAYS[label]?.kind;
  return k === "peer" || k === "alumni" || k === "community";
}
