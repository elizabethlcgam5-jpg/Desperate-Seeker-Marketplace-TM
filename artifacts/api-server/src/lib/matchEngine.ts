import { randomUUID } from "node:crypto";
import {
  db,
  listingsTable,
  requestsTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import { and, eq, ne } from "drizzle-orm";

// Minimum number of signals that must align to fire a notification.
// Score is a raw integer: 1 per keyword intersection + 1 for category + 1 for condition.
const THRESHOLD = 2;

interface ScoredRequest {
  id: string;
  category: string;
  buyerId: string;
  keywords: string[];
  condition: string;
  instantMatchOn: boolean;
}

interface ScoredListing {
  id: string;
  category: string;
  condition: string;
  sellerId: string | null;
  keywords: string[];
  instantMatchOn: boolean;
}

function calculateMatchScore(listing: ScoredListing, request: ScoredRequest): number {
  let score = 0;

  // Keyword matches: +1 for each listing keyword that appears in request keywords
  const requestKwSet = new Set(request.keywords);
  for (const kw of listing.keywords) {
    if (requestKwSet.has(kw)) score += 1;
  }

  // Category match: +1
  if (listing.category.toLowerCase() === request.category.toLowerCase()) {
    score += 1;
  }

  // Condition match (optional): +1
  if (
    listing.condition &&
    request.condition &&
    listing.condition === request.condition
  ) {
    score += 1;
  }

  return score;
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
  // "exact" = 4+ signals (e.g. 3 keyword hits + category); "similar" = threshold met but fewer hits
  const matchType = score >= 4 ? "exact" : "similar";
  const title =
    direction === "seller"
      ? "Instant Match Found"
      : "New Match for Your Request";
  const message =
    direction === "seller"
      ? "Someone is looking for exactly what you posted. Tap to view the buyer's request."
      : "A seller just posted an item that matches what you're looking for. Tap to view the listing.";

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

function buildNearMissNotification(
  userId: string,
  requestId: string,
  requestTitle: string,
  requestDescription: string,
  listingId: string,
  listingTitle: string,
) {
  return {
    id: randomUUID(),
    userId,
    type: "similar",
    title: "Possible Match",
    message: "We found something similar to what you're looking for.",
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

    // Account-level gate: buyer must have InstantMatch enabled on their profile
    const [buyer] = await db
      .select({ instantMatch: usersTable.instantMatch })
      .from(usersTable)
      .where(eq(usersTable.id, buyerId))
      .limit(1);
    if (!buyer?.instantMatch) return;

    const listings = await db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
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
      category: req.category,
      buyerId: req.buyerId,
      keywords: (req.keywords as string[]) ?? [],
      condition: req.condition ?? "",
      instantMatchOn: req.instantMatchOn,
    };

    const seenSellers = new Set<string>();
    const nearMissSellers = new Set<string>();
    const notifications = [];

    for (const listing of listings) {
      if (!listing.sellerId || seenSellers.has(listing.sellerId)) continue;
      const scoredListing: ScoredListing = {
        id: listing.id,
        category: listing.category,
        condition: listing.condition,
        sellerId: listing.sellerId,
        keywords: (listing.keywords as string[]) ?? [],
        instantMatchOn: listing.instantMatchOn,
      };
      const score = calculateMatchScore(scoredListing, request);

      if (score >= THRESHOLD) {
        seenSellers.add(listing.sellerId);
        // Seller alert
        notifications.push(
          buildNotification(listing.sellerId, score, req.id, req.title, req.description, listing.id, listing.title, "seller")
        );
        // Buyer alert
        notifications.push(
          buildNotification(buyerId, score, req.id, req.title, req.description, listing.id, listing.title, "buyer")
        );
      } else if (score === THRESHOLD - 1 && !nearMissSellers.has(listing.sellerId)) {
        nearMissSellers.add(listing.sellerId);
        notifications.push(buildNearMissNotification(listing.sellerId, req.id, req.title, req.description, listing.id, listing.title));
        notifications.push(buildNearMissNotification(buyerId, req.id, req.title, req.description, listing.id, listing.title));
      }
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
  listingCategory: string,
  listingCondition: string,
  listingInstantMatchOn: boolean,
  sellerId: string,
): Promise<void> {
  try {
    if (!listingInstantMatchOn) return;

    // Fetch the listing's current keywords (may have been generated after posting)
    const [listingRow] = await db
      .select({ keywords: listingsTable.keywords })
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId))
      .limit(1);

    const listing: ScoredListing = {
      id: listingId,
      category: listingCategory,
      condition: listingCondition,
      sellerId,
      keywords: (listingRow?.keywords as string[]) ?? [],
      instantMatchOn: listingInstantMatchOn,
    };

    // Only include requests where BOTH the per-request flag AND the buyer's
    // account-level InstantMatch are enabled.
    const requests = await db
      .select({
        id: requestsTable.id,
        title: requestsTable.title,
        description: requestsTable.description,
        category: requestsTable.category,
        buyerId: requestsTable.buyerId,
        keywords: requestsTable.keywords,
        condition: requestsTable.condition,
        instantMatchOn: requestsTable.instantMatchOn,
      })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
      .where(
        and(
          eq(requestsTable.status, "open"),
          ne(requestsTable.buyerId, sellerId),
          eq(requestsTable.instantMatchOn, true),
          eq(usersTable.instantMatch, true),
        ),
      );

    const seenBuyers = new Set<string>();
    const nearMissBuyers = new Set<string>();
    const notifications = [];

    for (const req of requests) {
      if (seenBuyers.has(req.buyerId)) continue;

      const request: ScoredRequest = {
        id: req.id,
        category: req.category,
        buyerId: req.buyerId,
        keywords: (req.keywords as string[]) ?? [],
        condition: req.condition ?? "",
        instantMatchOn: req.instantMatchOn,
      };

      const score = calculateMatchScore(listing, request);

      if (score >= THRESHOLD) {
        seenBuyers.add(req.buyerId);
        // Buyer alert
        notifications.push(
          buildNotification(req.buyerId, score, req.id, req.title, req.description, listingId, listingTitle, "buyer")
        );
        // Seller alert
        notifications.push(
          buildNotification(sellerId, score, req.id, req.title, req.description, listingId, listingTitle, "seller")
        );
      } else if (score === THRESHOLD - 1 && !nearMissBuyers.has(req.buyerId)) {
        nearMissBuyers.add(req.buyerId);
        notifications.push(buildNearMissNotification(req.buyerId, req.id, req.title, req.description, listingId, listingTitle));
        notifications.push(buildNearMissNotification(sellerId, req.id, req.title, req.description, listingId, listingTitle));
      }
    }

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }
  } catch {
    // Non-critical
  }
}
