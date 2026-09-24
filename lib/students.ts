// Prototype simulation — fictional students, illustrative data only.

export type SignalDef = {
  key: string;
  label: string;
  unit: string;
  source: string;
  threshold: number;
  direction: "drop" | "rise"; // which direction counts as a meaningful change
  max: number; // for mini charts
};

export type Week = {
  week: number;
  values: Record<string, number | null>; // what the support system can see
  life: string; // what the student is living through — NOT visible to the system
  lifeTag?: string;
};

export type Student = {
  id: "academic" | "financial" | "career";
  tab: string;
  name: string;
  initials: string;
  year: string;
  course: string;
  headline: string;
  gradient: string;
  advisor: { name: string; role: string };
  advisorDefaultSuggestion: string;
  advisorDefaultNote: string;
  signals: SignalDef[];
  required: number;
  triggerLabel: string;
  weeks: Week[];
  checkIn: string;
  demoResponse: string;
  without: string[];
  withSupport: string[];
};

const attendance: SignalDef = { key: "attendance", label: "Attendance", unit: "%", threshold: 15, direction: "drop", max: 100, source: "Attendance records" };
const submissions: SignalDef = { key: "submissions", label: "On-time coursework", unit: "%", threshold: 30, direction: "drop", max: 100, source: "Assessment submissions" };
const lms: SignalDef = { key: "lms", label: "Learning platform activity", unit: "% of usual", threshold: 30, direction: "drop", max: 100, source: "LMS activity" };
const pulse: SignalDef = { key: "pulse", label: "Optional wellbeing pulse", unit: "/5", threshold: 1, direction: "drop", max: 5, source: "Voluntary weekly pulse" };

const w = (week: number, vals: (number | null)[], keys: string[], life: string, lifeTag?: string): Week => ({
  week,
  values: Object.fromEntries(keys.map((k, i) => [k, vals[i]])),
  life,
  lifeTag,
});

// ── Student A — academic ─────────────────────────────────────────────
const aKeys = ["attendance", "submissions", "scores", "lms"];
const arjun: Student = {
  id: "academic",
  tab: "Academic",
  name: "Arjun",
  initials: "AK",
  year: "3rd Year Student",
  course: "B.Tech Mechanical Engineering",
  headline: "Falling behind in core modules",
  gradient: "from-sky-500 to-indigo-500",
  advisor: { name: "Prof. S. Kumar", role: "Faculty Advisor" },
  advisorDefaultSuggestion: "Senior Student Mentor",
  advisorDefaultNote: "Thermo II is a tough module for a lot of people. Happy to chat after class if it helps.",
  signals: [
    attendance,
    submissions,
    { key: "scores", label: "Internal assessment scores", unit: "%", threshold: 15, direction: "drop", max: 100, source: "Gradebook" },
    lms,
  ],
  required: 3,
  triggerLabel: "Meaningful change from Arjun's usual pattern: notify advisor",
  weeks: [
    w(1, [92, 100, 78, 100], aKeys, "Starts 3rd year with a heavier load of core modules."),
    w(2, [90, 100, 74, 96], aKeys, "Finds Thermodynamics II much harder than expected."),
    w(3, [85, 100, 60, 85], aKeys, "Gets a low score in the first internal quiz. Tells no one.", "Academic pressure"),
    w(4, [76, 67, 58, 64], aKeys, "Stops going to tutorials because he feels lost in them."),
    w(5, [70, 50, 52, 55], aKeys, "Assumes he'll catch up before the end-semester exams."),
    w(6, [64, 50, 48, 50], aKeys, "Too embarrassed to ask questions in class."),
    w(7, [58, 33, 45, 42], aKeys, "Misses a lab record deadline."),
    w(8, [52, 33, 40, 38], aKeys, "Hears his attendance may be below the minimum requirement."),
    w(9, [48, 0, 38, 30], aKeys, "Stops opening course material altogether."),
    w(10, [42, 0, 35, 25], aKeys, "Told he may not be allowed to sit end-semester exams. His GPA is at stake.", "Crisis point"),
  ],
  checkIn:
    "Hi Arjun 👋 We just wanted to check in. The middle of the semester can get busy. How are things going with your studies?",
  demoResponse:
    "I'm not really sure what's going on. I keep falling behind in Thermodynamics and even when I go to class I don't understand it, so I've kind of stopped going. My grades are dropping and I don't know who to ask.",
  without: ["Wk 3: small changes appear", "Nobody connects them", "Wk 7: missed deadlines", "Wk 10: exam eligibility at risk"],
  withSupport: ["Wk 3: small changes appear", "Wk 4: advisor notified", "Arjun gets a check-in", "He's connected to academic help and a senior mentor"],
};

// ── Student B — financial (the original Priya journey) ──────────────
const bKeys = ["attendance", "submissions", "lms", "pulse"];
const priya: Student = {
  id: "financial",
  tab: "Financial",
  name: "Priya",
  initials: "PS",
  year: "2nd Year Student",
  course: "B.Sc Biotechnology",
  headline: "Balancing rent, work and study",
  gradient: "from-indigo-500 to-violet-500",
  advisor: { name: "Prof. Anita Rao", role: "Faculty Advisor" },
  advisorDefaultSuggestion: "Student Support Team",
  advisorDefaultNote: "Just wanted you to know the support team is really approachable, whatever is going on.",
  signals: [attendance, submissions, lms, pulse],
  required: 3,
  triggerLabel: "Meaningful change from Priya's usual pattern: notify advisor",
  weeks: [
    w(1, [95, 100, 100, 4], bKeys, "Settled into second year. Working 12 hours a week at a café alongside classes."),
    w(2, [90, 100, 95, 4], bKeys, "Missed a lecture to cover a colleague's shift. Nothing unusual."),
    w(3, [82, 67, 78, 3], bKeys, "Landlord announces a rent increase. Priya quietly starts worrying about money.", "Financial pressure"),
    w(4, [72, 50, 60, 3], bKeys, "Picks up extra shifts to cover rent, now 20 hours a week. A lab report goes in late.", "More shifts"),
    w(5, [66, 50, 52, 2], bKeys, "Tired and behind. Answers the optional weekly pulse with a lower score than usual."),
    w(6, [58, 33, 45, 2], bKeys, "Working 26 hours a week. Skips a tutorial to make a shift."),
    w(7, [50, 33, 38, 2], bKeys, "Falling further behind. Doesn't know who to ask, or whether she's allowed to."),
    w(8, [44, 0, 30, 1], bKeys, "Misses a coursework deadline entirely. Feels embarrassed to reach out."),
    w(9, [38, 0, 25, 1], bKeys, "Rent arrears letter arrives. Starts thinking about pausing her studies."),
    w(10, [30, 0, 20, 1], bKeys, "Contacts the university for the first time, now facing possible withdrawal.", "Crisis point"),
  ],
  checkIn:
    "Hi Priya 👋 We've noticed things may have been a little difficult lately. We just wanted to check in. Would you like to tell us how things are going?",
  demoResponse:
    "Honestly I'm fine, just can't afford rent this month and I've been working extra shifts, so I'm struggling to keep up with classes.",
  without: ["Wk 3: small changes appear", "Nobody connects them", "Wk 8: missed deadline", "Wk 10: Priya reaches out at crisis point"],
  withSupport: ["Wk 3: small changes appear", "Wk 4: advisor notified", "Priya gets a check-in", "She says what she needs and is offered support earlier"],
};

// ── Student C — career / opportunity ─────────────────────────────────
const cKeys = ["attendance", "submissions", "workshops", "connected"];
const kavya: Student = {
  id: "career",
  tab: "Career & Tech",
  name: "Kavya",
  initials: "KN",
  year: "1st Year Student",
  course: "B.Tech Computer Science",
  headline: "Keen on hackathons, but unsure where to start",
  gradient: "from-emerald-500 to-teal-500",
  advisor: { name: "Prof. R. Iyer", role: "Faculty Advisor" },
  advisorDefaultSuggestion: "Hackathon & Coding Community",
  advisorDefaultNote: "Saw you at the Git workshop. There are some great student teams you might enjoy.",
  signals: [
    attendance,
    submissions,
    { key: "workshops", label: "Optional tech workshops joined", unit: " so far", threshold: 2.5, direction: "rise", max: 5, source: "Voluntary event sign-ups" },
    { key: "connected", label: "Pulse: \"I know who to ask about opportunities\"", unit: "/5", threshold: 1, direction: "drop", max: 5, source: "Voluntary weekly pulse" },
  ],
  required: 2,
  triggerLabel: "Opportunity moment: strong interest, no connection yet. Notify advisor",
  weeks: [
    w(1, [95, 100, 0, 3], cKeys, "First semester of CS. Enjoying programming more than she expected."),
    w(2, [96, 100, 1, 3], cKeys, "Goes to an 'Intro to Git' workshop and loves it."),
    w(3, [94, 100, 3, 3], cKeys, "Sees posters for a national hackathon. Doesn't have a team.", "Curiosity"),
    w(4, [95, 100, 4, 2], cKeys, "Joins another workshop but feels like everyone else already knows each other."),
    w(5, [94, 100, 4, 2], cKeys, "Hackathon registration closes. She didn't know how to find a team."),
    w(6, [93, 100, 4, 2], cKeys, "Starts to wonder if tech events are \"for people like her\"."),
    w(7, [92, 100, 4, 2], cKeys, "Watches project demos online but doesn't know how to start one."),
    w(8, [90, 100, 4, 1], cKeys, "Stops going to workshops."),
    w(9, [90, 100, 4, 1], cKeys, "Grades are fine. The spark is fading."),
    w(10, [90, 100, 4, 1], cKeys, "No team, no mentor, no project. Her interest quietly fades.", "Missed opportunity"),
  ],
  checkIn:
    "Hi Kavya 👋 Your faculty advisor thought you might be interested in some of the opportunities coming up. Would you like to tell us what you're hoping to get involved in?",
  demoResponse:
    "Things are good actually! I really want to get into hackathons and build projects, but I don't know how to find a team or where these events are posted. It'd be great to talk to someone who has done this before.",
  without: ["Wk 2: strong interest appears", "No one connects her to people", "Wk 5: misses the hackathon", "Wk 10: interest quietly fades"],
  withSupport: ["Wk 2: interest appears", "Wk 4: advisor notified", "Kavya gets a check-in", "She's connected to seniors, alumni and a club"],
};

export const STUDENTS: Student[] = [arjun, priya, kavya];
export const DEFAULT_STUDENT: Student["id"] = "financial";

export const DEMO_SAFETY_RESPONSE =
  "I can't keep going like this. Sometimes I feel like I don't want to be here anymore.";
