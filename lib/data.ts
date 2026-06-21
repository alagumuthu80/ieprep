// Virginia SOLs for Math + ELA, grades 6-8
export const VA_SOLS = {
  Math: {
    "6": [
      { id: "6.1", desc: "Ratio and proportional reasoning" },
      { id: "6.2", desc: "Integer and rational number operations" },
      { id: "6.3", desc: "Fractions, decimals, and percent" },
      { id: "6.4", desc: "Order of operations and expressions" },
      { id: "6.5", desc: "One-variable equations and inequalities" },
      { id: "6.6", desc: "Graphing on coordinate plane" },
      { id: "6.7", desc: "Geometry: area, perimeter, volume" },
      { id: "6.8", desc: "Statistics: mean, median, mode" },
    ],
    "7": [
      { id: "7.1", desc: "Proportional relationships and unit rates" },
      { id: "7.2", desc: "Operations with rational numbers" },
      { id: "7.3", desc: "Simplifying expressions" },
      { id: "7.4", desc: "Solving multi-step equations" },
      { id: "7.5", desc: "Inequalities and their solutions" },
      { id: "7.6", desc: "Geometry: scale drawings and similar figures" },
      { id: "7.7", desc: "Geometry: area and circumference of circles" },
      { id: "7.8", desc: "Probability and statistics" },
    ],
    "8": [
      { id: "8.1", desc: "Real numbers and the number system" },
      { id: "8.2", desc: "Scientific notation" },
      { id: "8.3", desc: "Pythagorean theorem" },
      { id: "8.4", desc: "Linear functions and slope" },
      { id: "8.5", desc: "Systems of equations" },
      { id: "8.6", desc: "Geometry: transformations" },
      { id: "8.7", desc: "Surface area and volume of 3D figures" },
      { id: "8.8", desc: "Data analysis and scatter plots" },
    ],
  },
  ELA: {
    "6": [
      { id: "6.1", desc: "Reading: fiction and literary analysis" },
      { id: "6.2", desc: "Reading: nonfiction and informational text" },
      { id: "6.3", desc: "Writing: informational/explanatory text" },
      { id: "6.4", desc: "Writing: narrative composition" },
      { id: "6.5", desc: "Writing: opinion/argument" },
      { id: "6.6", desc: "Research: using sources" },
      { id: "6.7", desc: "Vocabulary: context clues and word study" },
      { id: "6.8", desc: "Grammar and language conventions" },
    ],
    "7": [
      { id: "7.1", desc: "Reading: theme and central idea" },
      { id: "7.2", desc: "Reading: text structure and author's purpose" },
      { id: "7.3", desc: "Writing: informational multi-paragraph essay" },
      { id: "7.4", desc: "Writing: narrative with craft techniques" },
      { id: "7.5", desc: "Writing: argument with evidence" },
      { id: "7.6", desc: "Research: credible sources and citation" },
      { id: "7.7", desc: "Vocabulary: figurative language" },
      { id: "7.8", desc: "Speaking and listening: discussion" },
    ],
    "8": [
      { id: "8.1", desc: "Reading: complex literary texts and analysis" },
      { id: "8.2", desc: "Reading: argument and evidence evaluation" },
      { id: "8.3", desc: "Writing: analytical essay" },
      { id: "8.4", desc: "Writing: research-based argument" },
      { id: "8.5", desc: "Writing: narrative voice and style" },
      { id: "8.6", desc: "Research: synthesizing multiple sources" },
      { id: "8.7", desc: "Vocabulary: academic and domain-specific" },
      { id: "8.8", desc: "Media literacy and digital communication" },
    ],
  },
};

export const DISABILITY_TYPES = [
  "SLD (Specific Learning Disability)",
  "EBD (Emotional Behavioral Disorder)",
  "ID (Intellectual Disability)",
  "ASD (Autism Spectrum Disorder)",
  "OHI/ADHD (Other Health Impairment)",
  "Speech/Language Impairment",
  "Developmental Delay",
];

export const ACCOMMODATIONS = [
  "Small group testing",
  "Audio/online read-aloud",
  "Word prediction software",
  "Visual supports and graphic organizers",
  "Manipulatives",
  "Extended time",
  "Frequent breaks",
  "Preferential seating",
];

// Instruction-focused guidance fed to the lesson generator so the AI designs
// AROUND each disability and accommodation instead of just naming the label.
// Keyed by the exact strings above. (Reviewed for plain-language accuracy; not clinical advice.)
export const DISABILITY_GUIDANCE: Record<string, string> = {
  "SLD (Specific Learning Disability)":
    "Processes academic content unevenly — often reads, writes, or computes well below grade level despite average reasoning. Break tasks into small steps, pre-teach vocabulary, give worked examples and models, and reduce reading/writing load while keeping the thinking at grade level.",
  "EBD (Emotional Behavioral Disorder)":
    "Emotional regulation and behavior can interrupt learning. Use predictable routines, clear expectations, frequent specific praise, choices, and low-stakes ways to participate. Plan calm-down options and refocus cues; avoid public correction.",
  "ID (Intellectual Disability)":
    "Learns more slowly and needs concepts made concrete and functional. Teach fewer objectives in smaller steps, use manipulatives and real-life examples, repeat and review often, and connect skills to daily living.",
  "ASD (Autism Spectrum Disorder)":
    "Benefits from predictability, explicit social/communication support, and sensory awareness. Use visual schedules, literal and concrete language, clearly signposted routines and transitions, and honor sensory needs. Make implicit expectations explicit.",
  "OHI/ADHD (Other Health Impairment)":
    "Attention, focus, and stamina vary through a lesson. Use short activity chunks, movement and brain breaks, timers, single-step directions, and a low-distraction setup. Check in frequently and allow extra processing time.",
  "Speech/Language Impairment":
    "Receptive and/or expressive language may lag. Simplify language, pair words with visuals, allow extra response time and alternative ways to show understanding, and pre-teach key vocabulary.",
  "Developmental Delay":
    "Skills across areas may be below age level. Scaffold heavily, use concrete multi-sensory activities, repeat and model frequently, and match pace and expectations to the child's current level.",
};

export const ACCOMMODATION_GUIDANCE: Record<string, string> = {
  "Small group testing":
    "Deliver checks for understanding and assessments in a small-group or 1:1 setting with fewer distractions.",
  "Audio/online read-aloud":
    "Provide text and directions as audio or read aloud so reading level isn't a barrier to accessing the content.",
  "Word prediction software":
    "Let the student compose with word-prediction or speech-to-text so writing mechanics don't block expressing ideas.",
  "Visual supports and graphic organizers":
    "Pair instruction with visuals, anchor charts, and graphic organizers; offer a partially-filled organizer to structure thinking.",
  "Manipulatives":
    "Use hands-on objects and models so abstract concepts can be built and seen before moving to symbols.",
  "Extended time":
    "Plan a lighter task load or allow more time so the student isn't rushed; build buffer into independent practice.",
  "Frequent breaks":
    "Chunk the work and schedule short movement or sensory breaks between segments to sustain attention.",
  "Preferential seating":
    "Seat near the teacher/board and away from distractions, positioned for easy check-ins and refocusing cues.",
};

// Demo student profiles
export const DEMO_STUDENTS = [
  {
    id: "11112",
    name: "Alex R.",
    grade: "8",
    readingLevel: "3rd grade",
    disabilityType: "SLD (Specific Learning Disability)",
    accommodations: ["Audio/online read-aloud", "Word prediction software", "Extended time"],
    goals: [
      {
        id: "g1",
        area: "Reading",
        goal: "Given grade-level text, Alex will identify the main idea and 2 supporting details with 80% accuracy across 3 consecutive trials.",
        targetDate: "2026-08-15",
        trials: [
          { date: "2026-05-01", score: "1/4", notes: "Struggled with inferential details" },
          { date: "2026-05-08", score: "2/4", notes: "Identified main idea, missed details" },
          { date: "2026-05-15", score: "2/4", notes: "Similar performance" },
          { date: "2026-05-22", score: "3/4", notes: "Good progress with visuals" },
          { date: "2026-06-01", score: "3/4", notes: "Consistent with supports" },
        ],
      },
      {
        id: "g2",
        area: "Math",
        goal: "Alex will solve one-step algebraic equations with 75% accuracy across 4 consecutive trials.",
        targetDate: "2026-07-01",
        trials: [
          { date: "2026-05-01", score: "1/4", notes: "Basic addition equations only" },
          { date: "2026-05-08", score: "2/4", notes: "Improving with visual steps" },
          { date: "2026-05-15", score: "2/4", notes: "Needs more practice" },
          { date: "2026-05-22", score: "3/4", notes: "Good day" },
        ],
      },
    ],
  },
  {
    id: "11113",
    name: "Jordan M.",
    grade: "8",
    readingLevel: "5th grade",
    disabilityType: "OHI/ADHD (Other Health Impairment)",
    accommodations: ["Small group testing", "Frequent breaks", "Preferential seating"],
    goals: [
      {
        id: "g3",
        area: "Writing",
        goal: "Jordan will write a 5-sentence paragraph with a topic sentence, 3 details, and a conclusion with 80% accuracy across 3 consecutive trials.",
        targetDate: "2026-06-30",
        trials: [
          { date: "2026-05-01", score: "2/4", notes: "Topic sentence good, details weak" },
          { date: "2026-05-08", score: "3/4", notes: "Improved structure" },
          { date: "2026-05-15", score: "3/4", notes: "Consistent" },
          { date: "2026-05-22", score: "4/4", notes: "Excellent! First 4/4" },
          { date: "2026-06-01", score: "4/4", notes: "Second consecutive 4/4" },
        ],
      },
      {
        id: "g4",
        area: "Attention/Organization",
        goal: "Jordan will complete class assignments within allotted time with fewer than 2 prompts on 4 out of 5 days.",
        targetDate: "2026-09-01",
        trials: [
          { date: "2026-05-01", score: "1/4", notes: "Needed 5+ prompts" },
          { date: "2026-05-08", score: "2/4", notes: "Getting better with timer" },
          { date: "2026-05-15", score: "2/4", notes: "Inconsistent" },
          { date: "2026-05-22", score: "3/4", notes: "Timer strategy helping" },
          { date: "2026-06-01", score: "3/4", notes: "Steady progress" },
        ],
      },
    ],
  },
];

export type TrialScore = "1/4" | "2/4" | "3/4" | "4/4";

export type Grade = "6" | "7" | "8";
export type Subject = "Math" | "ELA";

export type Trial = {
  date: string;
  score: TrialScore;
  notes?: string;
};

export type StudentGoal = {
  id: string;
  area: string;
  goal: string;
  targetDate?: string;
  trials: Trial[];
};

export const GOAL_AREAS = [
  "Reading",
  "Writing",
  "Math",
  "Communication",
  "Attention/Organization",
  "Behavior/Social",
  "Functional/Life Skills",
];

export type ClassStudentEntry = {
  id: string;
  name: string;
  grade: Grade;
  disabilityType: string;
  accommodations: string[];
  readingLevel: string;
  goals?: StudentGoal[];
};

export type SchoolClass = {
  id: string;
  name: string;
  period: string;
  subject: Subject;
  grade: Grade;
  students: ClassStudentEntry[];
};

export const DEMO_CLASSES: SchoolClass[] = [
  {
    id: "cls001",
    name: "Period 3 — 8th Grade ELA",
    period: "3",
    subject: "ELA",
    grade: "8",
    students: [
      { id: "11112", name: "Alex R.",    grade: "8", disabilityType: "SLD (Specific Learning Disability)",  accommodations: ["Audio/online read-aloud", "Word prediction software", "Extended time"], readingLevel: "3rd grade" },
      { id: "11113", name: "Jordan M.",  grade: "8", disabilityType: "OHI/ADHD (Other Health Impairment)", accommodations: ["Small group testing", "Frequent breaks", "Preferential seating"], readingLevel: "5th grade" },
      { id: "11114", name: "Mia T.",     grade: "8", disabilityType: "EBD (Emotional Behavioral Disorder)", accommodations: ["Preferential seating", "Frequent breaks"], readingLevel: "6th grade" },
      { id: "11115", name: "Carlos V.",  grade: "8", disabilityType: "ID (Intellectual Disability)",        accommodations: ["Visual supports and graphic organizers", "Manipulatives", "Extended time"], readingLevel: "4th grade" },
    ],
  },
];

export function getProgressLevel(trials: { score: string }[]): "emerging" | "developing" | "approaching" | "mastered" {
  if (!trials.length) return "emerging";
  const last = trials[trials.length - 1].score;
  const scoreMap: Record<string, number> = { "1/4": 1, "2/4": 2, "3/4": 3, "4/4": 4 };
  const score = scoreMap[last] || 1;

  // Check consecutive 4/4
  const consecutive4s = trials.slice(-3).filter((t) => t.score === "4/4").length;
  if (consecutive4s >= 3) return "mastered";
  if (score === 4) return "approaching";
  if (score === 3) return "approaching";
  if (score === 2) return "developing";
  return "emerging";
}

export function daysUntilDate(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
