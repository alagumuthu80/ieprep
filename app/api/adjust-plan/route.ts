import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentName, disabilityType, goals } = body;

  const goalSummary = goals
    .map(
      (g: { area: string; goal: string; progress: string; trend: string; daysLeft: number }) =>
        `- ${g.area}: "${g.goal}"\n  Progress: ${g.progress} | Trend: ${g.trend} | Days until target: ${g.daysLeft}`
    )
    .join("\n");

  const prompt = `You are an expert special education instructional coach analyzing IEP goal progress data for a student.

Student: ${studentName}
Disability Type: ${disabilityType}

IEP Goals & Current Progress:
${goalSummary}

Based on this progress data, provide:

## Progress Analysis
(For each goal: is the student on track, ahead, or behind? What does the data tell you?)

## Instructional Adjustments Recommended
(Specific, concrete changes to lesson plans based on where the student is struggling or excelling)

## High-Priority Focus Areas
(What should the teacher double down on in the next 2 weeks?)

## Motivational & Engagement Strategies
(Given the disability type and current progress, what will keep this student engaged?)

## Communication Note to Parents
(A brief, positive 2-3 sentence update suitable for an IEP progress report)

Be direct and actionable. The teacher has limited planning time — give them clear next steps.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 2000,
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
