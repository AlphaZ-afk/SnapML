import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Please set it in your .env file." },
        { status: 500 }
      )
    }

    const { prompt, systemPrompt, messages: conversationHistory, stream } = await req.json()

    // Build messages array — support both single prompt and full conversation history
    const messages = conversationHistory 
      ? [
          { role: "system", content: systemPrompt || "You are SnapML's Grok AI ML Engineer. You help users build, train, evaluate, and deploy machine learning models. Be concise, technical, and helpful. Use markdown formatting." },
          ...conversationHistory
        ]
      : [
          { role: "system", content: systemPrompt || "You are SnapML's Grok AI ML Engineer. You help users build, train, evaluate, and deploy machine learning models. Be concise, technical, and helpful. Use markdown formatting." },
          { role: "user", content: prompt }
        ]

    // Streaming mode
    if (stream) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.3,
          max_tokens: 2048,
          stream: true
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        return NextResponse.json({ error: `Groq API Error: ${errText}` }, { status: response.status })
      }

      // Forward the SSE stream directly
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      })
    }

    // Non-streaming mode (backward compatible)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.2,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      // Return 502 Bad Gateway to signify upstream issue, not our server code crashing
      return NextResponse.json({ error: `Groq API Error: ${errText}` }, { status: 502 })
    }

    let data;
    try {
      data = await response.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Failed to parse JSON response from Groq API." }, { status: 502 })
    }

    const content = data?.choices?.[0]?.message?.content || "No response content generated."

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Grok API Route Error:", error);
    return NextResponse.json({ error: error.message || "Unknown API server error" }, { status: 500 })
  }
}
