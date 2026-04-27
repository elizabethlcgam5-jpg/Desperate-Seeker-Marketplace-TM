import { Router, type IRouter } from "express";
import { db, requestsTable, listingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/openai/search", async (req, res) => {
  const { query } = req.body as { query?: string };

  if (!query || query.trim().length < 2) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  try {
    // Fetch recent requests and listings to search over
    const [requests, listings] = await Promise.all([
      db
        .select()
        .from(requestsTable)
        .where(eq(requestsTable.status, "open"))
        .orderBy(desc(requestsTable.createdAt))
        .limit(50),
      db
        .select()
        .from(listingsTable)
        .where(eq(listingsTable.isAvailable, true))
        .orderBy(desc(listingsTable.createdAt))
        .limit(50),
    ]);

    const systemPrompt = `You are a smart search assistant for "Desperately Seeking", a buyer-first local marketplace.

Given a user's search query, find the most relevant items from the data below and return a JSON response.

Return ONLY valid JSON in this exact format:
{
  "interpretation": "brief one-sentence description of what user is looking for",
  "suggestions": ["2-4 short search phrase suggestions the user might want to try"],
  "requests": [array of matching request IDs, most relevant first, max 5],
  "listings": [array of matching listing IDs, most relevant first, max 5]
}

BUYER REQUESTS (what buyers are looking for):
${JSON.stringify(requests.map(r => ({ id: r.id, title: r.title, description: r.description?.slice(0, 100), category: r.category, budget: r.maxBudget, zip: r.zipCode })))}

SELLER LISTINGS (items for sale):
${JSON.stringify(listings.map(l => ({ id: l.id, title: l.title, description: l.description?.slice(0, 100), category: l.category, price: l.price, zip: l.zipCode, featured: l.isFeatured })))}

Match semantically — "couch" should match "sofa", "vintage" should match "retro", etc.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Search query: "${query.trim()}"` },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";

    // Parse the AI response
    let parsed: {
      interpretation: string;
      suggestions: string[];
      requests: string[];
      listings: string[];
    };

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { interpretation: "", suggestions: [], requests: [], listings: [] };
    } catch {
      parsed = { interpretation: "", suggestions: [], requests: [], listings: [] };
    }

    // Hydrate with full data
    const matchedRequests = (parsed.requests ?? [])
      .map(id => requests.find(r => r.id === id))
      .filter(Boolean)
      .map(r => ({
        id: r!.id,
        title: r!.title,
        category: r!.category,
        zipCode: r!.zipCode,
        maxBudget: r!.maxBudget ? Number(r!.maxBudget) : null,
        type: "request" as const,
      }));

    const matchedListings = (parsed.listings ?? [])
      .map(id => listings.find(l => l.id === id))
      .filter(Boolean)
      .map(l => ({
        id: l!.id,
        title: l!.title,
        category: l!.category,
        zipCode: l!.zipCode,
        price: Number(l!.price),
        isFeatured: l!.isFeatured,
        type: "listing" as const,
      }));

    res.json({
      interpretation: parsed.interpretation ?? "",
      suggestions: parsed.suggestions ?? [],
      requests: matchedRequests,
      listings: matchedListings,
    });
  } catch (err: any) {
    console.error("AI search error:", err);
    res.status(500).json({ error: "AI search failed" });
  }
});

export default router;
