import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { instantMatchOnListing } from "../lib/matchEngine";
import { generateAndSaveListingKeywords } from "../lib/keywordGenerator";
import {
  ListListingsResponse,
  GetListingResponse,
  CreateListingBody,
  ListMyListingsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";
import { withCurrentUser } from "../lib/session";

const router: IRouter = Router();

const PREMIUM_TIERS = new Set(["seller_basic", "seller_pro", "seller_annual"]);

function serializeListing(row: typeof listingsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl,
    category: row.category,
    zipCode: row.zipCode,
    brandName: row.brandName ?? "",
    condition: row.condition ?? "good",
    availability: row.availability ?? "local_pickup",
    shippingPrice: row.shippingPrice != null ? Number(row.shippingPrice) : null,
    status: row.status as "active" | "sold",
    isAvailable: row.isAvailable,
    isFeatured: row.isFeatured,
    sellerId: row.sellerId ?? null,
    sellerName: row.sellerName ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/listings", async (req, res) => {
  const { zip, category } = req.query as {
    zip?: string;
    category?: string;
  };

  let rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.isAvailable, true))
    .orderBy(desc(listingsTable.createdAt));

  if (category) {
    rows = rows.filter(
      (r) => r.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (zip && zip.length >= 3) {
    const prefix = zip.slice(0, 3);
    const exact: typeof rows = [];
    const nearby: typeof rows = [];
    const rest: typeof rows = [];

    for (const r of rows) {
      if (r.zipCode === zip) {
        exact.push(r);
      } else if (r.zipCode.startsWith(prefix)) {
        nearby.push(r);
      } else {
        rest.push(r);
      }
    }

    rows = [...exact, ...nearby, ...rest];
  }

  // Featured listings always come first
  const featured = rows.filter((r) => r.isFeatured);
  const regular = rows.filter((r) => !r.isFeatured);
  rows = [...featured, ...regular];

  res.json(ListListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/me/listings", withCurrentUser, async (req, res) => {
  const rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.sellerId, req.currentUserId!))
    .orderBy(desc(listingsTable.createdAt));

  res.json(ListMyListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/listings/:listingId", async (req, res) => {
  const { listingId } = req.params;
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json(GetListingResponse.parse(serializeListing(row)));
});

router.delete("/listings/:listingId", withCurrentUser, async (req, res) => {
  const { listingId } = req.params;
  const sellerId = req.currentUserId!;

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (row.sellerId !== sellerId) {
    res.status(403).json({ error: "Not your listing" });
    return;
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, listingId));
  res.status(204).end();
});

router.post("/listings", withCurrentUser, async (req, res) => {
  const body = CreateListingBody.parse(req.body);

  // Check seller's tier to determine if listing should be featured
  let isFeatured = false;
  let sellerName = "";
  const sellerId = req.currentUserId!;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sellerId))
    .limit(1);

  if (user) {
    isFeatured = PREMIUM_TIERS.has(user.subscriptionTier ?? "");
    sellerName = user.name;
  }

  const instantMatchOn = typeof body.instantMatchOn === "boolean" ? body.instantMatchOn : false;

  const [row] = await db
    .insert(listingsTable)
    .values({
      id: randomUUID(),
      title: body.title,
      description: body.description,
      price: body.price.toString(),
      imageUrl: body.imageUrl,
      category: body.category,
      zipCode: body.zipCode,
      brandName: body.brandName ?? "",
      condition: body.condition ?? "good",
      availability: body.availability ?? "local_pickup",
      shippingPrice: body.shippingPrice != null ? body.shippingPrice.toString() : null,
      sellerId,
      sellerName,
      isFeatured,
      instantMatchOn,
    })
    .returning();

  if (instantMatchOn) {
    // Generate AI keywords (~4s), then run InstantMatch
    setTimeout(async () => {
      await generateAndSaveListingKeywords(row.id, row.title, row.description, row.category);
      const [updated] = await db
        .select({ keywords: listingsTable.keywords })
        .from(listingsTable)
        .where(eq(listingsTable.id, row.id))
        .limit(1);
      instantMatchOnListing(
        row.id,
        row.title,
        row.description,
        row.category,
        row.condition,
        true,
        (updated?.keywords as string[]) ?? [],
        sellerId,
      );
    }, 4000);
  } else {
    // Still fire InstantMatch immediately (no AI keywords yet), without delay
    instantMatchOnListing(
      row.id,
      row.title,
      row.description,
      row.category,
      row.condition,
      false,
      [],
      sellerId,
    );
    // Generate keywords in background for future match quality
    generateAndSaveListingKeywords(row.id, row.title, row.description, row.category);
  }

  res.status(201).json(serializeListing(row));
});

export default router;
