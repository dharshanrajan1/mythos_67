import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const imageFile = formData.get("image") as File | null
    const context = (formData.get("context") as string) ?? ""
    const caloriesLeft = (formData.get("caloriesLeft") as string) ?? null
    const proteinLeft = (formData.get("proteinLeft") as string) ?? null
    const goalType = (formData.get("goalType") as string) ?? "maintain"

    if (!imageFile) {
      return NextResponse.json({ error: "image required" }, { status: 400 })
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = imageFile.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    const macroContext = [
      caloriesLeft ? `~${caloriesLeft} calories remaining today` : null,
      proteinLeft ? `~${proteinLeft}g protein remaining` : null,
      `goal: ${goalType}`,
    ]
      .filter(Boolean)
      .join(", ")

    const systemPrompt = `You are a practical nutrition coach for someone who eats on the go. Analyze the image and give 3 specific, actionable meal suggestions. Be concise and direct — no generic advice. Format your response as JSON.`

    const userMessage = `${context ? `Context: ${context}\n` : ""}Remaining targets: ${macroContext || "not specified"}.

Analyze this image and return exactly 3 meal suggestions as JSON with this structure:
{
  "suggestions": [
    {
      "name": "Meal name",
      "description": "1-2 sentence description of what to make/order",
      "calories": 450,
      "proteinG": 35,
      "carbsG": 40,
      "fatG": 15
    }
  ],
  "imageDescription": "Brief description of what you see in the image"
}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userMessage },
              { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
            ],
          },
        ],
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    })

    const raw = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message: string }
    }

    if (!response.ok || raw.error) {
      return NextResponse.json(
        { error: raw.error?.message ?? "OpenAI error" },
        { status: 500 }
      )
    }

    const content = raw.choices?.[0]?.message?.content ?? "{}"
    const parsed = JSON.parse(content)

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
