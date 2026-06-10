import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subject, grade, sol, weeks, duration, disabilityType, accommodations, studentNeeds, studentGoals } = body;

  const goalContext = studentGoals?.length
    ? `\n\nCurrent IEP Goals & Progress:\n${studentGoals
        .map(
          (g: { area: string; goal: string; progress: string; lastScore: string }) =>
            `- ${g.area}: "${g.goal}" — Progress: ${g.progress} (last score: ${g.lastScore})`
        )
        .join("\n")}`
    : "";

  const prompt = `You are an expert special education teacher creating a differentiated lesson plan for a student with ${disabilityType}.

Student Profile:
- Subject: ${subject}
- Grade Level: ${grade}
- Virginia SOL: ${sol}
- Lesson Timeframe: ${weeks} week(s), ${duration} minutes per session
- Disability Type: ${disabilityType}
- Accommodations: ${accommodations.join(", ")}
- Student Needs/Notes: ${studentNeeds || "None specified"}${goalContext}

Create a detailed, differentiated lesson plan that:
1. Is aligned to Virginia SOL ${sol}
2. Specifically addresses the needs of a student with ${disabilityType}
3. Incorporates all listed accommodations naturally throughout
4. Adjusts pacing and complexity to meet the student where they are
5. Uses evidence-based strategies for this disability type
${studentGoals?.length ? "6. Includes specific activities that target and advance the listed IEP goals" : ""}

Format the lesson plan with these sections:
## Learning Objectives
(2-3 measurable objectives aligned to the SOL and student's level)

## Materials & Accommodations Setup
(specific materials needed, how accommodations are set up)

## Lesson Structure (${duration} min)
(Break into: Warm-Up, Direct Instruction, Guided Practice, Independent Practice, Closure — with time for each)

## Differentiation Strategies
(specific strategies for ${disabilityType})

## IEP Goal Integration
(how each activity supports IEP goals)

## Assessment
(how to check for understanding given the student's needs)

## Modifications If Student Struggles
(specific fallback strategies)

Be specific, practical, and teacher-ready. Avoid jargon. Write as if you are handing this to a first-year special education teacher.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 4000,
          thinking: { type: "adaptive" },
          stream: true,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
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
