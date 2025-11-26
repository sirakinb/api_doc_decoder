import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { message, docsContent, conversationHistory, apiName, openaiKey } = await request.json();

    // Use provided key or fall back to environment variable
    const apiKey = openaiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required. Please add your API key in settings." },
        { status: 401 }
      );
    }

    if (!message || !docsContent) {
      return NextResponse.json(
        { error: "Message and documentation content are required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an expert API assistant helping developers understand and use the ${apiName || "provided"} API. You have access to the complete API documentation and can provide:

1. Clear explanations of endpoints and features
2. Working code examples (prefer curl for simplicity)
3. Best practices and tips
4. Troubleshooting guidance

Here is the complete API documentation:

${docsContent.substring(0, 60000)}

---

Rules:
- Always provide practical, working code examples
- Be concise but thorough
- If something isn't in the docs, say so clearly
- Format code examples with proper syntax highlighting hints
- When giving code examples, make them complete and copy-paste ready
- Use markdown formatting for better readability`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    // Add the current message
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    return NextResponse.json({ response: content });
  } catch (error: any) {
    console.error("Chat error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 401 || error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your key in settings." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process chat message", message: error.message },
      { status: 500 }
    );
  }
}
