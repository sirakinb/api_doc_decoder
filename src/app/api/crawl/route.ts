import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

export async function POST(request: NextRequest) {
  try {
    const { url, text } = await request.json();

    // If text is provided directly, use it
    if (text && text.trim()) {
      return NextResponse.json({ content: text.trim(), source: "direct" });
    }

    if (!url) {
      return NextResponse.json(
        { error: "URL or text content is required" },
        { status: 400 }
      );
    }

    // Check if Firecrawl API key is configured
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    if (firecrawlApiKey) {
      try {
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
        
        const scrapeResult = await firecrawl.scrape(url, {
          formats: ["markdown"],
        }) as any;

        if (scrapeResult.success === false) {
          throw new Error(scrapeResult.error || "Failed to scrape URL");
        }

        const content = scrapeResult.markdown || scrapeResult.data?.markdown || scrapeResult.content || "";
        
        if (content && content.length > 100) {
          return NextResponse.json({ 
            content: content.substring(0, 150000),
            source: "firecrawl",
            title: scrapeResult.metadata?.title || scrapeResult.data?.metadata?.title || ""
          });
        }
      } catch (firecrawlError: any) {
        console.error("Firecrawl error:", firecrawlError);
        // Check if it's a credits issue
        if (firecrawlError.message?.includes("credits") || firecrawlError.status === 402) {
          // Continue to fallback
        }
      }
    }

    // Fallback: Try basic fetch with multiple user agents
    const userAgents = [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "curl/8.0.0",
    ];

    for (const userAgent of userAgents) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });

        if (response.ok) {
          const html = await response.text();
          const textContent = extractTextFromHtml(html);
          
          if (textContent.length > 200) {
            return NextResponse.json({ content: textContent, source: "basic-fetch" });
          }
        }
      } catch {
        continue;
      }
    }

    // If all else fails
    return NextResponse.json(
      { 
        error: `Unable to fetch documentation from this URL. Please use "Paste Text" mode instead - copy the documentation content from the website and paste it directly.`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: "Failed to process request", message: error.message },
      { status: 500 }
    );
  }
}

function extractTextFromHtml(html: string): string {
  // Remove scripts, styles, and other non-content elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  
  // Convert common elements to readable format
  text = text
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n## $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");
  
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Clean up whitespace
  text = text
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+/gm, "")
    .trim();
  
  return text.substring(0, 100000);
}
