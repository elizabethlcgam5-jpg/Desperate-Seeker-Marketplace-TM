import { randomUUID } from "node:crypto";
import {
  db,
  listingsTable,
  requestsTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import { and, eq, ne } from "drizzle-orm";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","up","about","into","through","during","is","are","was",
  "were","be","been","being","have","has","had","do","does","did","will",
  "would","could","should","may","might","shall","can","this","that",
  "these","those","i","me","my","we","our","you","your","he","his","she",
  "her","it","its","they","their","them","what","which","who","whom",
  "when","where","why","how","all","any","both","each","few","more",
  "most","other","some","such","no","not","only","own","same","so",
  "than","too","very","just","also","want","need","looking","get","got",
  "good","nice","great","like","make","made","use","used","come","came",
  "know","think","take","well","back","still","way","even","much","go",
  "new","old","one","two","three","see","now","then","here","there",
  "list","sell","buy","sale","sold","item","items","thing","things",
]);

const THRESHOLD = 40;

// --- Lightweight Porter-inspired stemmer ---

function hasSuffix(w: string, suffix: string): boolean {
  return w.endsWith(suffix) && w.length > suffix.length + 2;
}

function stem(word: string): string {
  let w = word;

  // Step 1a: plurals & past tense
  if (hasSuffix(w, "sses")) w = w.slice(0, -2);
  else if (hasSuffix(w, "ies")) w = w.slice(0, -2);
  else if (!hasSuffix(w, "ss") && w.endsWith("s") && w.length > 3) w = w.slice(0, -1);

  // Step 1b: -ed / -ing
  if (hasSuffix(w, "eed")) {
    w = w.slice(0, -1);
  } else if (hasSuffix(w, "ed") && /[aeiou]/.test(w.slice(0, -2))) {
    w = w.slice(0, -2);
    if (hasSuffix(w, "at") || hasSuffix(w, "bl") || hasSuffix(w, "iz")) w += "e";
    else if (/([^aeiou])\1$/.test(w) && !/(l|s|z)$/.test(w)) w = w.slice(0, -1);
  } else if (hasSuffix(w, "ing") && /[aeiou]/.test(w.slice(0, -3))) {
    w = w.slice(0, -3);
    if (hasSuffix(w, "at") || hasSuffix(w, "bl") || hasSuffix(w, "iz")) w += "e";
    else if (/([^aeiou])\1$/.test(w) && !/(l|s|z)$/.test(w)) w = w.slice(0, -1);
  }

  // Step 1c: -y → i
  if (w.endsWith("y") && w.length > 3 && !/[aeiou]/.test(w[w.length - 2])) {
    w = w.slice(0, -1) + "i";
  }

  // Step 2: common suffixes
  const step2: [string, string][] = [
    ["ational","ate"],["tional","tion"],["enci","ence"],["anci","ance"],
    ["izer","ize"],["ising","ise"],["izing","ize"],["iser","ise"],
    ["alism","al"],["aliti","al"],["ousli","ous"],["ousness","ous"],
    ["iveness","ive"],["fulness","ful"],["ation","ate"],["ator","ate"],
    ["alism","al"],["alness","al"],["entli","ent"],
  ];
  for (const [suffix, replacement] of step2) {
    if (hasSuffix(w, suffix)) { w = w.slice(0, -suffix.length) + replacement; break; }
  }

  // Step 3: remove final -e when stem is long enough
  if (w.endsWith("e") && w.length > 4) w = w.slice(0, -1);

  return w;
}

// ---

const TOP_K = 20;

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/[\s\-_,;:!?()\[\]{}"']+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  // Stem and count frequency
  const freq = new Map<string, number>();
  for (const w of words) {
    const s = stem(w);
    if (s.length >= 2) freq.set(s, (freq.get(s) ?? 0) + 1);
  }

  // Return top-K stems by frequency, ties broken by length (longer = more specific)
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, TOP_K)
    .map(([s]) => s);
}

function keywordOverlap(listingKw: string[], requestKw: string[]): number {
  if (listingKw.length === 0 || requestKw.length === 0) return 0;
  const setA = new Set(listingKw);
  const hits = requestKw.filter(
    (w) => setA.has(w) || [...setA].some((k) => w.includes(k) || k.includes(w))
  );
  return Math.round((hits.length / Math.max(listingKw.length, requestKw.length)) * 100);
}

interface ScoredRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  buyerId: string;
  tags: unknown;
  aiKeywords: string[];  // from DB keywords column
  condition: string;
  instantMatchOn: boolean;
}

interface ScoredListing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  sellerId: string | null;
  aiKeywords: string[];
  instantMatchOn: boolean;
}

function scoreListingVsRequest(listing: ScoredListing, request: ScoredRequest): number {
  let score = 0;

  // Category match (30 pts)
  if (listing.category.toLowerCase() === request.category.toLowerCase()) {
    score += 30;
  } else if (
    listing.category.toLowerCase().includes(request.category.toLowerCase().split(" ")[0]) ||
    request.category.toLowerCase().includes(listing.category.toLowerCase().split(" ")[0])
  ) {
    score += 12;
  }

  // AI-generated keyword match (up to 35 pts) — highest quality signal
  // Use listing's AI keywords (if available) or fall back to extracted text keywords
  const listingKw = listing.aiKeywords.length > 0
    ? listing.aiKeywords
    : extractKeywords(`${listing.title} ${listing.description}`);

  if (request.aiKeywords.length > 0) {
    const aiOverlap = keywordOverlap(listingKw, request.aiKeywords);
    score += Math.round((aiOverlap / 100) * 35);
  }

  // Text keyword overlap (up to 25 pts) — fallback / supplement
  const requestKw = extractKeywords(`${request.title} ${request.description}`);
  const textOverlap = keywordOverlap(listingKw, requestKw);
  score += Math.round((textOverlap / 100) * 25);

  // Tag match bonus (up to 10 pts)
  const tags: string[] = Array.isArray(request.tags) ? (request.tags as string[]) : [];
  if (tags.length > 0) {
    const listingSet = new Set(listingKw);
    const tagHits = tags.filter((t) =>
      listingSet.has(t.toLowerCase()) ||
      [...listingSet].some((w) => w.includes(t.toLowerCase()) || t.toLowerCase().includes(w))
    );
    score += Math.round((tagHits.length / tags.length) * 10);
  }

  // Condition match bonus (5 pts) — only if request specifies a condition
  if (
    request.condition &&
    listing.condition &&
    request.condition !== "" &&
    (listing.condition === request.condition ||
      (request.condition === "any"))
  ) {
    score += 5;
  }

  return Math.min(score, 100);
}

function buildNotification(
  userId: string,
  score: number,
  requestId: string,
  requestTitle: string,
  requestDescription: string,
  listingId: string,
  listingTitle: string,
  direction: "seller" | "buyer",
) {
  const matchType = score >= 70 ? "exact" : "similar";
  const title =
    direction === "seller"
      ? matchType === "exact" ? "⚡ InstantMatch — Buyer alert" : "InstantMatch — Possible buyer"
      : matchType === "exact" ? "⚡ InstantMatch — Item found!" : "InstantMatch — Possible match";
  const message =
    direction === "seller"
      ? matchType === "exact"
        ? `A buyer is actively looking for "${requestTitle}" — your listing "${listingTitle}" is a strong match.`
        : `A buyer posted for "${requestTitle}" — your listing "${listingTitle}" may be a fit.`
      : matchType === "exact"
        ? `A seller just listed "${listingTitle}" — it closely matches what you're looking for in "${requestTitle}".`
        : `A new listing "${listingTitle}" may match your request for "${requestTitle}".`;

  return {
    id: randomUUID(),
    userId,
    type: matchType,
    title,
    message,
    requestId,
    requestTitle,
    requestDescription: requestDescription.slice(0, 200),
    listingId,
    read: false,
  };
}

/**
 * Called when a new buyer request is posted.
 * Gate: request.instantMatchOn must be true.
 * For each active listing with instantMatchOn = true:
 *   score >= THRESHOLD → notify BOTH the seller and the buyer (bidirectional).
 */
export async function instantMatchOnRequest(
  requestId: string,
  buyerId: string,
): Promise<void> {
  try {
    const [req] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, requestId))
      .limit(1);
    if (!req?.instantMatchOn) return;

    const listings = await db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
        description: listingsTable.description,
        category: listingsTable.category,
        condition: listingsTable.condition,
        sellerId: listingsTable.sellerId,
        keywords: listingsTable.keywords,
        instantMatchOn: listingsTable.instantMatchOn,
      })
      .from(listingsTable)
      .where(
        and(
          eq(listingsTable.isAvailable, true),
          eq(listingsTable.status, "active"),
          ne(listingsTable.sellerId, buyerId),
          eq(listingsTable.instantMatchOn, true),
        ),
      );

    const request: ScoredRequest = {
      id: req.id,
      title: req.title,
      description: req.description,
      category: req.category,
      buyerId: req.buyerId,
      tags: req.tags,
      aiKeywords: (req.keywords as string[]) ?? [],
      condition: req.condition ?? "",
      instantMatchOn: req.instantMatchOn,
    };

    const seenSellers = new Set<string>();
    const notifications = [];

    for (const listing of listings) {
      if (!listing.sellerId || seenSellers.has(listing.sellerId)) continue;
      const scoredListing: ScoredListing = {
        ...listing,
        aiKeywords: (listing.keywords as string[]) ?? [],
        instantMatchOn: listing.instantMatchOn,
      };
      const score = scoreListingVsRequest(scoredListing, request);
      if (score < THRESHOLD) continue;
      seenSellers.add(listing.sellerId);

      // Seller alert: an active buyer request matches their listing
      notifications.push(
        buildNotification(listing.sellerId, score, req.id, req.title, req.description, listing.id, listing.title, "seller")
      );
      // Buyer alert: an existing listing matches their new request
      notifications.push(
        buildNotification(buyerId, score, req.id, req.title, req.description, listing.id, listing.title, "buyer")
      );
    }

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }
  } catch {
    // Non-critical
  }
}

/**
 * Called when a new listing is posted.
 * Gate: listing.instantMatchOn must be true.
 * For each active buyer request with instantMatchOn = true:
 *   score >= THRESHOLD → notify BOTH the buyer and the seller (bidirectional).
 */
export async function instantMatchOnListing(
  listingId: string,
  listingTitle: string,
  listingDescription: string,
  listingCategory: string,
  listingCondition: string,
  listingInstantMatchOn: boolean,
  listingAiKeywords: string[],
  sellerId: string,
): Promise<void> {
  try {
    if (!listingInstantMatchOn) return;

    const requests = await db
      .select({
        id: requestsTable.id,
        title: requestsTable.title,
        description: requestsTable.description,
        category: requestsTable.category,
        buyerId: requestsTable.buyerId,
        tags: requestsTable.tags,
        keywords: requestsTable.keywords,
        condition: requestsTable.condition,
        instantMatchOn: requestsTable.instantMatchOn,
      })
      .from(requestsTable)
      .where(
        and(
          eq(requestsTable.status, "open"),
          ne(requestsTable.buyerId, sellerId),
          eq(requestsTable.instantMatchOn, true),
        ),
      );

    const listing: ScoredListing = {
      id: listingId,
      title: listingTitle,
      description: listingDescription,
      category: listingCategory,
      condition: listingCondition,
      sellerId,
      aiKeywords: listingAiKeywords,
      instantMatchOn: listingInstantMatchOn,
    };

    const seenBuyers = new Set<string>();
    const notifications = [];

    for (const req of requests) {
      if (seenBuyers.has(req.buyerId)) continue;

      const request: ScoredRequest = {
        id: req.id,
        title: req.title,
        description: req.description,
        category: req.category,
        buyerId: req.buyerId,
        tags: req.tags,
        aiKeywords: (req.keywords as string[]) ?? [],
        condition: req.condition ?? "",
        instantMatchOn: req.instantMatchOn,
      };

      const score = scoreListingVsRequest(listing, request);
      if (score < THRESHOLD) continue;
      seenBuyers.add(req.buyerId);

      // Buyer alert: a new listing matches their request
      notifications.push(
        buildNotification(req.buyerId, score, req.id, req.title, req.description, listingId, listingTitle, "buyer")
      );
      // Seller alert: their listing matches an active buyer request
      notifications.push(
        buildNotification(sellerId, score, req.id, req.title, req.description, listingId, listingTitle, "seller")
      );
    }

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }
  } catch {
    // Non-critical
  }
}
