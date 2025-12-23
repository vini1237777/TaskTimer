import { OPENAI_API_KEY, OPENAI_MODEL } from "$env/static/private";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

type Suggestion = { title: string; description: string };

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export async function suggestTaskWithAI(input: string): Promise<Suggestion> {
  const raw = input.trim();
  if (!raw) throw new Error("INVALID_INPUT");

  if (!OPENAI_API_KEY) {
    return {
      title: raw[0].toUpperCase() + raw.slice(1),
      description: `Work on: ${raw}`,
    };
  }

  const model = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });

  const system = new SystemMessage(
    `You convert short task notes into a clearer title + one-line actionable description.
Return ONLY valid JSON with keys: "title", "description".
No markdown, no extra text.`
  );

  const human = new HumanMessage(`Task note: "${raw}"`);

  const res = await model.invoke([system, human]);
  const content =
    typeof res.content === "string" ? res.content : JSON.stringify(res.content);

  const parsed = extractJson(content);
  if (parsed?.title && parsed?.description) {
    return {
      title: String(parsed.title).trim(),
      description: String(parsed.description).trim(),
    };
  }

  return {
    title: raw[0].toUpperCase() + raw.slice(1),
    description: `Work on: ${raw}`,
  };
}
