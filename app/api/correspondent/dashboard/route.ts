import { NextResponse } from "next/server"

const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:3001"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")

  if (!phone) {
    return NextResponse.json({ error: "phone param required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${AGENT_URL}/dashboard/${encodeURIComponent(phone)}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: "Agent unreachable. Is the Sam agent running on port 3001?" },
      { status: 503 }
    )
  }
}
