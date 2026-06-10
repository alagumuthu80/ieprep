import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { lessonPlan, grade, subject, disabilityType } = await req.json();

  const prompt = `Convert this special education lesson plan into a Smart Board slide presentation for ${grade}th grade ${subject} students with ${disabilityType}.

LESSON PLAN:
${lessonPlan}

Create a JSON array of slides. Each slide must follow this exact structure:
{
  "id": number,
  "type": "title" | "objective" | "materials" | "instruction" | "activity" | "check" | "closure",
  "title": "short slide title (max 6 words)",
  "emoji": "single relevant emoji",
  "points": ["bullet 1", "bullet 2", ...],
  "speakerNote": "brief teacher note for this slide"
}

Rules for age-appropriate Smart Board slides:
- MAX 4 bullet points per slide
- Each bullet: plain language, max 10 words, no jargon
- Use action words ("We will...", "Try this...", "Remember...")
- First slide is always the lesson title slide with objective
- Include a "Let's Try It!" activity slide with a concrete example
- Include a "Check for Understanding" slide with 2-3 quick questions
- Last slide is always a "Wrap Up" with key takeaways
- Total: 7-10 slides
- For SLD/reading disabilities: extra simple vocabulary
- For ADHD/OHI: shorter bullets, more visual cues via emoji

Respond with ONLY the raw JSON array, no markdown, no explanation.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    const slides = JSON.parse(clean);
    return Response.json({ slides });
  } catch {
    return Response.json({ error: "Failed to parse slides", raw: clean }, { status: 500 });
  }
}
