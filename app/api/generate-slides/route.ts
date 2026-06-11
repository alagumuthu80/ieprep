import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { lessonPlan, grade, subject, disabilityTypes } = body;

  const disabilities = Array.isArray(disabilityTypes) ? disabilityTypes.join(", ") : disabilityTypes;

  const prompt = `You are creating Smart Board slides for a special education class (Grade ${grade} ${subject}, students with ${disabilities}).

Based on this lesson plan, generate a slide deck that matches how real special education teachers actually structure their class periods.

LESSON PLAN:
${lessonPlan}

Generate 10-14 slides as a JSON array. Use EXACTLY these slide types modeled on real classroom practice:

SLIDE TYPES AND WHEN TO USE:
- "title"      → Opening slide: lesson name + warm welcome
- "hook"       → Engagement opener: a fun "Would You Rather?" question or discussion prompt relevant to the lesson topic
- "target"     → "I Can..." learning target. points = 1-2 I-can statements, simple student-friendly language
- "agenda"     → Today's schedule. points = agenda items. Last point: "WICOR: W — [writing] | I — [inquiry] | C — [collaboration] | O — [organization] | R — [reading]"
- "direct"     → Teacher instruction. Big concept with 3-4 plain-language bullet points for the disability types listed
- "video"      → Media suggestion. points = ["Watch: [type of video to find]", "Discuss: [question to ask after]"]
- "practice"   → "Let's Practice Together!" — 2-3 guided examples or sentence frames
- "quiz"       → Multiple-choice question. title = the question. points = exactly 4 options: "A. ...", "B. ...", "C. ...", "D. ..." (mark correct with ✓)
- "activity"   → Hands-on or group activity. points = short numbered steps
- "review"     → Rules or key takeaways. points = 4-6 numbered items
- "exit"       → Exit ticket. points = 1-2 questions students answer before leaving

SLIDE FORMAT:
{
  "id": <number>,
  "type": "<type>",
  "title": "<short, student-friendly title>",
  "emoji": "<single relevant emoji>",
  "points": ["<point>", ...],
  "speakerNote": "<practical teacher instruction: what to say, do, or watch for>"
}

RULES:
- hook slide: title = "Would You Rather...?" or "Think About It:" with a fun question tied to the topic. points = two fun choices or discussion prompts
- Include 2-3 quiz slides distributed through the deck to check understanding
- Use vocabulary accessible to students reading 1-2 grades below level
- Age-appropriate for ${grade}th graders
- Every emoji should help students visually understand the content
- Speaker notes = practical teacher moves, not slide descriptions

Return ONLY a valid JSON array. No markdown fences, no explanation, no extra text.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content.find((b) => b.type === "text")?.text || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const jsonStart = cleaned.indexOf("[");
    const jsonEnd = cleaned.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      return Response.json({ error: "No JSON array found", raw }, { status: 500 });
    }

    const slides = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
    return Response.json({ slides });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
