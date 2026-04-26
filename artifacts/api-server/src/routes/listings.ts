import { Router, type IRouter } from "express";
import { db, listingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListListingsResponse,
  GetListingResponse,
  CreateListingBody,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

function serializeListing(row: typeof listingsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl,
    category: row.category,
    zipCode: row.zipCode,
    status: row.status as "active" | "sold",
    isAvailable: row.isAvailable,
    sellerId: row.sellerId ?? null,
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

  res.json(ListListingsResponse.parse(rows.map(serializeListing)));
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

router.post("/listings", async (req, res) => {
  const body = CreateListingBody.parse(req.body);

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
    })
    .returning();

  res.status(201).json(serializeListing(row));
});

export default router;
