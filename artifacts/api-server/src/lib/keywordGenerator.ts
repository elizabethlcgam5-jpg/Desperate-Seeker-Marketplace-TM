import { openai } from "@workspace/integrations-openai-ai-server";
import { db, requestsTable, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Calls OpenAI to generate a concise keyword list from a buyer request,
 * then writes them back to the DB row. Fire-and-forget safe.
 */
export async function generateAndSaveKeywords(
  requestId: string,
  title: string,
  description: string,
  category: string,
): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You extract search keywords from a buyer's item request for a local marketplace.
Return ONLY a JSON array of 6–12 lowercase keywords (no phrases, no stop words, no punctuation).
Focus on: item type, brand names, materials, style, era, condition descriptors, and specific model names.
Example output: ["espresso","lever","machine","vintage","gaggia","1960s","chrome","brass"]`,
        },
        {
          role: "user",
          content: `Category: ${category}\nTitle: ${title}\nDescription: ${description}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return;

    const keywords: string[] = JSON.parse(match[0]);
    if (!Array.isArray(keywords) || keywords.length === 0) return;

    // Sanitise: lowercase strings only
    const clean = keywords
      .filter((k) => typeof k === "string" && k.length > 1)
      .map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""))
      .filter(Boolean)
      .slice(0, 15);

    await db
      .update(requestsTable)
      .set({ keywords: clean })
      .where(eq(requestsTable.id, requestId));
  } catch {
    // Non-critical — keyword gen failing should never block the request
  }
}

/**
 * Calls OpenAI to generate a concise keyword list from a seller listing,
 * then writes them back to the DB row. Fire-and-forget safe.
 */
export async function generateAndSaveListingKeywords(
  listingId: string,
  title: string,
  description: string,
  category: string,
): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You extract search keywords from a seller's item listing for a local marketplace.
Return ONLY a JSON array of 6–12 lowercase keywords (no phrases, no stop words, no punctuation).
Focus on: item type, brand names, materials, style, era, condition descriptors, and specific model names.
Example output: ["espresso","lever","machine","vintage","gaggia","1960s","chrome","brass"]`,
        },
        {
          role: "user",
          content: `Category: ${category}\nTitle: ${title}\nDescription: ${description}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return;

    const keywords: string[] = JSON.parse(match[0]);
    if (!Array.isArray(keywords) || keywords.length === 0) return;

    const clean = keywords
      .filter((k) => typeof k === "string" && k.length > 1)
      .map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""))
      .filter(Boolean)
      .slice(0, 15);

    await db
      .update(listingsTable)
      .set({ keywords: clean })
      .where(eq(listingsTable.id, listingId));
  } catch {
    // Non-critical
  }
}
