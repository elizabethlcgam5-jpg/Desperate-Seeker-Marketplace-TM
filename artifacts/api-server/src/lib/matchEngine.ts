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

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

function keywordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const matches = b.filter((w) => setA.has(w) || [...setA].some((k) => w.includes(k) || k.includes(w)));
  return Math.round((matches.length / Math.max(a.length, b.length)) * 100);
}

interface ListingRow {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  sellerId: string | null;
}

interface RequestRow {
  id: string;
  title: string;
  description: string;
  category: string;
  buyerId: string;
  tags: unknown;
}

function scoreListingVsRequest(listing: ListingRow, request: RequestRow): number {
  let score = 0;

  // Category match (35 pts)
  if (listing.category.toLowerCase() === request.category.toLowerCase()) {
    score += 35;
  } else if (
    listing.category.toLowerCase().includes(request.category.toLowerCase().split(" ")[0]) ||
    request.category.toLowerCase().includes(listing.category.toLowerCase().split(" ")[0])
  ) {
    score += 15;
  }

  // Keyword overlap across title + description (up to 45 pts)
  const listingKw = keywords(`${listing.title} ${listing.description}`);
  const requestKw = keywords(`${request.title} ${request.description}`);
  const overlap = keywordOverlap(listingKw, requestKw);
  score += Math.round((overlap / 100) * 45);

  // Tag match bonus (up to 20 pts)
  const tags: string[] = Array.isArray(request.tags) ? (request.tags as string[]) : [];
  if (tags.length > 0) {
    const listingWords = new Set(keywords(`${listing.title} ${listing.description}`));
    const tagHits = tags.filter((t) =>
      listingWords.has(t.toLowerCase()) ||
      [...listingWords].some((w) => w.includes(t.toLowerCase()) || t.toLowerCase().includes(w))
    );
    score += Math.round((tagHits.length / tags.length) * 20);
  }

  return Math.min(score, 100);
}

/**
 * Called when a new buyer request is posted.
 * Notifies InstantMatch sellers whose active listings match the request.
 */
export async function instantMatchOnRequest(
  requestId: string,
  requestTitle: string,
  requestDescription: string,
  requestCategory: string,
  buyerId: string,
): Promise<void> {
  try {
    // Only run if the buyer has InstantMatch on
    const [buyer] = await db
      .select({ instantMatch: usersTable.instantMatch })
      .from(usersTable)
      .where(eq(usersTable.id, buyerId))
      .limit(1);
    if (!buyer?.instantMatch) return;

    // Fetch all active listings from other sellers who have InstantMatch on
    const listings = await db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
        description: listingsTable.description,
        category: listingsTable.category,
        condition: listingsTable.condition,
        sellerId: listingsTable.sellerId,
        sellerInstantMatch: usersTable.instantMatch,
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

    const request: RequestRow = {
      id: requestId,
      title: requestTitle,
      description: requestDescription,
      category: requestCategory,
      buyerId,
      tags: [],
    };

    const seenSellers = new Set<string>();
    const notifications = [];

    for (const listing of listings) {
      if (!listing.sellerId || seenSellers.has(listing.sellerId)) continue;
      const score = scoreListingVsRequest(listing, request);
      if (score < THRESHOLD) continue;
      seenSellers.add(listing.sellerId);

      const matchType = score >= 70 ? "exact" : "similar";
      notifications.push({
        id: randomUUID(),
        userId: listing.sellerId,
        type: matchType,
        title: matchType === "exact" ? "⚡ InstantMatch — Buyer alert" : "InstantMatch — Possible buyer",
        message:
          matchType === "exact"
            ? `A buyer is actively looking for "${requestTitle}" — your listing "${listing.title}" is a strong match (score ${score}).`
            : `A buyer posted for "${requestTitle}" — your listing "${listing.title}" may be a fit (score ${score}).`,
        requestId,
        requestTitle,
        requestDescription: requestDescription.slice(0, 200),
        listingId: listing.id,
        read: false,
      });
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
 * Notifies InstantMatch buyers whose open requests match the listing.
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
    // Only run if the seller has InstantMatch on
    const [seller] = await db
      .select({ instantMatch: usersTable.instantMatch })
      .from(usersTable)
      .where(eq(usersTable.id, sellerId))
      .limit(1);
    if (!seller?.instantMatch) return;

    // Fetch all open requests from other buyers who have InstantMatch on
    const requests = await db
      .select({
        id: requestsTable.id,
        title: requestsTable.title,
        description: requestsTable.description,
        category: requestsTable.category,
        buyerId: requestsTable.buyerId,
        tags: requestsTable.tags,
        buyerInstantMatch: usersTable.instantMatch,
      })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
      .where(
        and(
          eq(requestsTable.status, "open"),
          ne(requestsTable.buyerId, sellerId),
          eq(usersTable.instantMatch, true),
        ),
      );

    const listing: ListingRow = {
      id: listingId,
      title: listingTitle,
      description: listingDescription,
      category: listingCategory,
      condition: listingCondition,
      sellerId,
    };

    const seenBuyers = new Set<string>();
    const notifications = [];

    for (const request of requests) {
      if (seenBuyers.has(request.buyerId)) continue;
      const score = scoreListingVsRequest(listing, request);
      if (score < THRESHOLD) continue;
      seenBuyers.add(request.buyerId);

      const matchType = score >= 70 ? "exact" : "similar";
      notifications.push({
        id: randomUUID(),
        userId: request.buyerId,
        type: matchType,
        title: matchType === "exact" ? "⚡ InstantMatch — Item found!" : "InstantMatch — Possible match",
        message:
          matchType === "exact"
            ? `A seller just listed "${listingTitle}" — it closely matches what you're looking for in "${request.title}".`
            : `A new listing "${listingTitle}" may match your request for "${request.title}".`,
        requestId: request.id,
        requestTitle: request.title,
        requestDescription: request.description.slice(0, 200),
        listingId,
        read: false,
      });
    }

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }
  } catch {
    // Non-critical
  }
}
