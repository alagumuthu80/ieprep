import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

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
        .map((s: { name: string; disabilityType: string; readingLevel: string; accommodations: string[] }) =>
          `- ${s.name}: ${s.disabilityType}, reading at ${s.readingLevel}, needs: ${s.accommodations.join(", ")}`
        ).join("\n")}`
    : "";

  const isClass = !!classStudents?.length;
  const audienceDesc = isClass
    ? `a class of ${classStudents.length} students with diverse needs`
    : `a student with ${disabilityList.join(" and ")}`;

  const prompt = `You are an expert special education teacher creating a differentiated lesson plan for ${audienceDesc}.

Lesson Configuration:
- Subject: ${subject}
- Grade Level: ${grade}
- Virginia SOLs: ${solList.join(", ")}
- Lesson Timeframe: ${weeks} week(s), ${duration} minutes per session
- Disability Types Represented: ${disabilityList.join(", ")}
- Accommodations in Use: ${accommodations.join(", ")}
- Additional Notes: ${studentNeeds || "None"}${goalContext}${classContext}

Create a detailed, differentiated lesson plan that:
1. Addresses ALL listed Virginia SOLs (${solList.join(", ")})
2. Meets the needs of students with: ${disabilityList.join(", ")}
3. Weaves all accommodations naturally throughout
4. Uses evidence-based strategies for each disability type represented
5. Includes tiered activities so every student can access the content at their level
${studentGoals?.length ? "6. Embeds activities that directly advance the listed IEP goals" : ""}
${isClass ? "6. Differentiates by student need while maintaining one cohesive class lesson" : ""}

Format the lesson plan with these clearly labeled sections:

## Learning Objectives
(2-3 measurable objectives tied to each SOL, written at accessible level)

## Materials & Setup
(specific materials, how accommodations are physically arranged)

## Lesson Structure (${duration} min)
**Warm-Up (5-10 min)**
**Direct Instruction (${Math.round(parseInt(duration)*0.25)} min)**
**Guided Practice (${Math.round(parseInt(duration)*0.30)} min)**
**Independent Practice (${Math.round(parseInt(duration)*0.25)} min)**
**Closure / Exit Ticket (5 min)**

## Differentiation by Disability Type
(specific strategies for each disability category in this lesson)

## IEP Goal Integration
(how each phase of the lesson builds toward IEP goals)

## Assessment Strategies
(how to check understanding given diverse learner needs)

## If Students Struggle
(specific fallback strategies and scaffolds)

Be specific, practical, and teacher-ready. Write as if handing this to a first-year special education teacher.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await anthropic.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 5000,
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
