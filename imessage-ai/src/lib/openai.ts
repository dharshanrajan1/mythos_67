import { env } from "./env.js";

type ContentPart =
  | {
      type: "input_text";
      text: string;
    }
  | {
      type: "input_image";
      image_url: string;
    };

type CreateJsonResponseInput = {
  instructions: string;
  content: ContentPart[];
  schemaName: string;
  schema: Record<string, unknown>;
};

export async function createJsonResponse<T>(input: CreateJsonResponseInput): Promise<T> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to use AI parsing");
  }

  const model = env.OPENAI_MODEL ?? "gpt-5-mini";
  const body: Record<string, unknown> = {
    model,
    instructions: input.instructions,
    input: [
      {
        role: "user",
        content: input.content,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: input.schemaName,
        schema: input.schema,
        strict: true,
      },
    },
  };

  if (model.startsWith("gpt-5")) {
    body.reasoning = {
      effort: "low",
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${JSON.stringify(raw)}`);
  }

  const outputText = extractOutputText(raw);

  if (!outputText) {
    throw new Error(`OpenAI response missing output text: ${JSON.stringify(raw)}`);
  }

  return JSON.parse(outputText) as T;
}

function extractOutputText(raw: Record<string, unknown>) {
  if (typeof raw.output_text === "string" && raw.output_text.length > 0) {
    return raw.output_text;
  }

  const output = Array.isArray(raw.output) ? raw.output : [];
  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown[] }).content)
      ? ((item as { content?: unknown[] }).content ?? [])
      : [];

    for (const entry of content) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const typedEntry = entry as { text?: unknown };

      if (typeof typedEntry.text === "string") {
        chunks.push(typedEntry.text);
      }
    }
  }

  return chunks.join("").trim();
}
