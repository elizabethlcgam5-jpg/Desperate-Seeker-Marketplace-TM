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
  "with", "from", "this", "that", "have", "want", "need",
  "looking", "good", "like", "very", "some", "just", "also",
]);

const THRESHOLD = 40;

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
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
  const listingKw = extractKeywords(`${listing.title} ${listing.description}`);
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
 * Checks request.instantMatchOn (per-request opt-in).
 * Notifies matching sellers who have user-level instantMatch on.
 * Uses AI-generated keywords when available.
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
      })
      .from(listingsTable)
      .innerJoin(usersTable, eq(usersTable.id, listingsTable.sellerId))
      .where(
        and(
          eq(listingsTable.isAvailable, true),
          eq(listingsTable.status, "active"),
          ne(listingsTable.sellerId, buyerId),
          eq(usersTable.instantMatch, true),
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
      const score = scoreListingVsRequest(listing, request);
      if (score < THRESHOLD) continue;
      seenSellers.add(listing.sellerId);

      notifications.push(
        buildNotification(listing.sellerId, score, req.id, req.title, req.description, listing.id, listing.title, "seller")
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
 * Seller must have user-level instantMatch on.
 * Notifies buyers whose requests have instantMatchOn = true.
 * Uses AI-generated keywords from each request.
 */
export async function instantMatchOnListing(
  listingId: string,
  listingTitle: string,
  listingDescription: string,
  listingCategory: string,
  listingCondition: string,
  sellerId: string,
): Promise<void> {
  try {
    const [seller] = await db
      .select({ instantMatch: usersTable.instantMatch })
      .from(usersTable)
      .where(eq(usersTable.id, sellerId))
      .limit(1);
    if (!seller?.instantMatch) return;

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

      notifications.push(
        buildNotification(req.buyerId, score, req.id, req.title, req.description, listingId, listingTitle, "buyer")
      );
    }

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }
  } catch {
    // Non-critical
  }
}
