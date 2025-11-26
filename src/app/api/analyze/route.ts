import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { docsContent, userContext, apiName, openaiKey } = await request.json();

    // Use provided key or fall back to environment variable
    const apiKey = openaiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required. Please add your API key in settings." },
        { status: 401 }
      );
    }

    if (!docsContent) {
      return NextResponse.json(
        { error: "Documentation content is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an expert API documentation analyzer. Your job is to take raw API documentation and transform it into clear, actionable guidance.

Analyze the provided API documentation and return a JSON response with the following structure:
{
  "apiName": "Name of the API",
  "description": "Brief description of what the API does (2-3 sentences)",
  "gettingStarted": {
    "steps": [
      {
        "title": "Step title",
        "description": "Clear explanation",
        "code": "Code snippet if applicable"
      }
    ]
  },
  "authentication": {
    "method": "How to authenticate (e.g., Bearer Token, API Key)",
    "description": "How to set up authentication",
    "example": "Code example"
  },
  "commonUseCases": [
    {
      "title": "Use case title",
      "description": "What this accomplishes",
      "endpoints": ["List of relevant endpoints"],
      "codeExample": "Complete working code example",
      "tips": ["Helpful tips for this use case"]
    }
  ],
  "keyEndpoints": [
    {
      "method": "GET/POST/PUT/DELETE",
      "path": "/endpoint/path",
      "description": "What it does",
      "parameters": ["key parameters"],
      "example": "Code example"
    }
  ],
  "rateLimits": {
    "description": "Rate limiting info if available",
    "limits": ["List of limits by plan/tier if applicable"]
  },
  "quickTips": [
    "Helpful tips and gotchas"
  ]
}

Focus on practical, real-world use cases. Provide complete, working code examples that developers can copy and use immediately. Use curl examples for simplicity.`;

    const userPrompt = `Analyze this API documentation${userContext ? ` with the following context in mind: "${userContext}"` : ""}:

${docsContent.substring(0, 80000)}

${userContext ? `\nUser's specific needs: ${userContext}` : ""}

Provide a comprehensive analysis focusing on practical use cases and clear code examples. Return valid JSON only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const analysis = JSON.parse(content);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Analysis error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 401 || error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your key in settings." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to analyze documentation", message: error.message },
      { status: 500 }
    );
  }
}
