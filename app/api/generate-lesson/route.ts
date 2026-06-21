import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { DISABILITY_GUIDANCE, ACCOMMODATION_GUIDANCE } from "@/lib/data";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    subject, grade, sols, weeks, duration,
    disabilityTypes, accommodations, studentNeeds,
    studentGoals, classStudents,
  } = body;

  const solList = Array.isArray(sols) ? sols : [sols];
  const disabilityList = Array.isArray(disabilityTypes) ? disabilityTypes : [disabilityTypes];

  const goalContext = studentGoals?.length
    ? `\n\nCurrent IEP Goals & Progress:\n${studentGoals
        .map((g: { area: string; goal: string; progress: string; lastScore: string }) =>
          `- ${g.area}: "${g.goal}" — Progress: ${g.progress} (last score: ${g.lastScore})`
        ).join("\n")}`
    : "";

  const classContext = classStudents?.length
    ? `\n\nClass Roster (${classStudents.length} students):\n${classStudents
        .map((s: { name: string; disabilityType: string; readingLevel: string; accommodations: string[]; goals?: { area: string; goal: string }[] }) => {
          const goalsLine = s.goals?.length
            ? `\n    IEP goals: ${s.goals.map((g) => `${g.area} — ${g.goal}`).join(" | ")}`
            : "";
          return `- ${s.name}: ${s.disabilityType}, reading at ${s.readingLevel}, needs: ${s.accommodations.join(", ")}${goalsLine}`;
        }).join("\n")}`
    : "";

  // Enrich bare labels with instructional guidance so the AI designs AROUND each
  // disability and accommodation instead of just naming them.
  const disabilityProfiles = disabilityList
    .map((d: string) => (DISABILITY_GUIDANCE[d] ? `- ${d}: ${DISABILITY_GUIDANCE[d]}` : null))
    .filter(Boolean)
    .join("\n");
  const disabilityProfileBlock = disabilityProfiles
    ? `\n\nDisability profiles — apply these instructional implications specifically in the activities; do not just name them:\n${disabilityProfiles}`
    : "";

  const accommodationDetails = (accommodations || [])
    .map((a: string) => (ACCOMMODATION_GUIDANCE[a] ? `- ${a}: ${ACCOMMODATION_GUIDANCE[a]}` : null))
    .filter(Boolean)
    .join("\n");
  const accommodationBlock = accommodationDetails
    ? `\n\nAccommodation implementation — build each of these INTO the activities (not a separate list at the end):\n${accommodationDetails}`
    : "";

  const isClass = !!classStudents?.length;
  const audienceDesc = isClass
    ? `a class of ${classStudents.length} students with diverse needs`
    : `a student with ${disabilityList.join(" and ")}`;

  // ~4 instructional sessions per week
  const numWeeks = Math.max(1, parseInt(weeks) || 1);
  const sessionsPerWeek = 4;
  const totalSessions = numWeeks * sessionsPerWeek;

  const prompt = `You are an expert special education teacher creating a differentiated lesson plan for ${audienceDesc}.

Lesson Configuration:
- Subject: ${subject}
- Grade Level: ${grade}
- Virginia SOLs: ${solList.join(", ")}
- Lesson Timeframe: ${weeks} week(s), ${duration} minutes per session
- Disability Types Represented: ${disabilityList.join(", ")}
- Accommodations in Use: ${accommodations.join(", ")}
- Additional Notes: ${studentNeeds || "None"}${disabilityProfileBlock}${accommodationBlock}${goalContext}${classContext}

This is a ${numWeeks}-week unit. Spiral the listed SOLs across the unit — introduce, practice, and revisit them so multiple standards are taught together (not one SOL per week in isolation). Break the unit into ${totalSessions} daily class sessions (about ${sessionsPerWeek} sessions per week), each ${duration} minutes long. Each day is ONE class period a teacher will present.

Create a detailed, differentiated lesson plan that:
1. Addresses ALL listed Virginia SOLs (${solList.join(", ")}), weaving several together within most sessions
2. Meets the needs of students with: ${disabilityList.join(", ")}
3. Applies each accommodation inside specific activities using its implementation note above — show HOW it is used in the moment, never just restate the accommodation's name
4. Uses the disability-profile guidance above to choose concrete, evidence-based strategies — tailor to the specific implications listed, not a generic version of the disability
5. Includes tiered activities so every student can access the content at their level
${studentGoals?.length ? "6. Embeds activities that directly advance the listed IEP goals" : ""}
${isClass ? "7. Differentiates by student need while keeping one cohesive class lesson" : ""}

Format the lesson plan EXACTLY with these sections and heading styles (this exact structure is parsed by software — keep the "### Day N" heading format precise):

## Unit Overview
(2-3 sentences: the arc of the unit and which SOLs are spiraled when)

## Learning Objectives
(one measurable "Students will be able to..." objective per SOL, at accessible level)

## Materials & Setup
(specific materials, how accommodations are physically arranged)

## Daily Lesson Sessions

### Day 1 (Week 1) — <short focus title>
**SOLs today:** <which of the listed SOLs this session targets>
**Warm-Up / Hook (5-10 min):** ...
**Direct Instruction (${Math.round(parseInt(duration)*0.25)} min):** ...
**Guided Practice (${Math.round(parseInt(duration)*0.30)} min):** ...
**Independent Practice (${Math.round(parseInt(duration)*0.25)} min):** ...
**Closure / Exit Ticket (5 min):** ...
**Differentiation today:** <brief, specific moves for the disability types present>

### Day 2 (Week 1) — <short focus title>
(...same internal structure...)

(Continue for all ${totalSessions} days, labeling each "### Day N (Week W) — title". Keep each day concise but complete.)

## Assessment Strategies
(how to check understanding across the unit given diverse learner needs)

## If Students Struggle
(specific fallback strategies and scaffolds)

Be specific, practical, and teacher-ready. Write as if handing this to a first-year special education teacher.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await anthropic.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          stream: true,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of aiStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
