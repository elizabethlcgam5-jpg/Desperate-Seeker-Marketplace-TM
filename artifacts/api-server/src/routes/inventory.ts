import { Router, type IRouter } from "express";
import {
  db,
  inventoryItemsTable,
  requestsTable,
  usersTable,
} from "@workspace/db";
import { desc, eq, and, ne } from "drizzle-orm";
import {
  ListInventoryItemsResponse,
  ListInventoryItemsResponseItem,
  CreateInventoryItemBody,
  DeleteInventoryItemParams,
  GetInventoryMatchesResponse,
} from "@workspace/api-zod";
import { withCurrentUser } from "../lib/session";
import { randomUUID } from "node:crypto";
import { serializeUser } from "../lib/serializers";
import { count } from "drizzle-orm";
import { responsesTable } from "@workspace/db";

const router: IRouter = Router();

function serializeItem(r: typeof inventoryItemsTable.$inferSelect) {
  return {
    id: r.id,
    sellerId: r.sellerId,
    title: r.title,
    category: r.category,
    style: r.style,
    description: r.description,
    priceMin: r.priceMin === null ? null : Number(r.priceMin),
    priceMax: r.priceMax === null ? null : Number(r.priceMax),
    lengthIn: r.lengthIn === null ? null : Number(r.lengthIn),
    widthIn: r.widthIn === null ? null : Number(r.widthIn),
    heightIn: r.heightIn === null ? null : Number(r.heightIn),
    condition: r.condition as "new" | "like_new" | "good" | "fair" | "used",
    photos: r.photos,
    isAvailable: r.isAvailable,
    createdAt: r.createdAt.toISOString(),
  };
}

function serializeRequestSummary(
  r: typeof requestsTable.$inferSelect,
  u: typeof usersTable.$inferSelect,
  responseCount: number,
) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    style: r.style ?? "",
    budgetMin: r.budgetMin === null ? null : Number(r.budgetMin),
    budgetMax: r.budgetMax === null ? null : Number(r.budgetMax),
    lengthIn: r.lengthIn === null ? null : Number(r.lengthIn),
    widthIn: r.widthIn === null ? null : Number(r.widthIn),
    heightIn: r.heightIn === null ? null : Number(r.heightIn),
    photos: r.photos ?? [],
    status: r.status as "open" | "fulfilled" | "closed",
    urgency: r.urgency as "low" | "normal" | "high",
    location: r.location,
    isPrivate: r.isPrivate,
    createdAt: r.createdAt.toISOString(),
    buyer: serializeUser(u),
    responseCount,
  };
}

/** Score an inventory item against a buyer request. Returns 0–100. */
function computeMatchScore(
  item: typeof inventoryItemsTable.$inferSelect,
  req: typeof requestsTable.$inferSelect,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Category match: 35 pts
  if (
    item.category.toLowerCase() === req.category.toLowerCase()
  ) {
    score += 35;
    reasons.push("Same category");
  }

  // Style match: 30 pts (keyword overlap)
  const itemStyle = item.style.toLowerCase();
  const reqStyle = req.style?.toLowerCase() ?? "";
  if (itemStyle && reqStyle) {
    const itemWords = new Set(itemStyle.split(/\W+/).filter(Boolean));
    const reqWords = reqStyle.split(/\W+/).filter(Boolean);
    const overlap = reqWords.filter((w) => itemWords.has(w));
    if (overlap.length > 0) {
      const styleScore = Math.min(30, Math.round((overlap.length / reqWords.length) * 30));
      score += styleScore;
      reasons.push(`Style match: ${overlap.join(", ")}`);
    }
  } else if (itemStyle && !reqStyle) {
    // Buyer didn't specify style — give partial
    score += 10;
  }

  // Price range overlap: 25 pts
  const itemMin = item.priceMin !== null ? Number(item.priceMin) : null;
  const itemMax = item.priceMax !== null ? Number(item.priceMax) : null;
  const reqMin = req.budgetMin !== null ? Number(req.budgetMin) : null;
  const reqMax = req.budgetMax !== null ? Number(req.budgetMax) : null;

  const effectiveItemMin = itemMin ?? 0;
  const effectiveItemMax = itemMax ?? itemMin ?? 9999999;
  const effectiveReqMin = reqMin ?? 0;
  const effectiveReqMax = reqMax ?? reqMin ?? 9999999;

  const priceOverlap =
    effectiveItemMin <= effectiveReqMax && effectiveItemMax >= effectiveReqMin;
  if (priceOverlap) {
    score += 25;
    reasons.push("Price fits buyer budget");
  }

  // Dimension hint: 10 pts bonus if item dimensions fit request
  const reqLen = req.lengthIn !== null ? Number(req.lengthIn) : null;
  const reqWid = req.widthIn !== null ? Number(req.widthIn) : null;
  const itemLen = item.lengthIn !== null ? Number(item.lengthIn) : null;
  const itemWid = item.widthIn !== null ? Number(item.widthIn) : null;

  if (reqLen && itemLen && reqWid && itemWid) {
    const fits =
      itemLen <= reqLen * 1.1 &&
      itemLen >= reqLen * 0.9 &&
      itemWid <= reqWid * 1.1 &&
      itemWid >= reqWid * 0.9;
    if (fits) {
      score += 10;
      reasons.push("Dimensions match");
    }
  }

  return { score: Math.min(100, score), reasons };
}

router.get("/me/inventory", withCurrentUser, async (req, res) => {
  const items = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.sellerId, req.currentUserId!))
    .orderBy(desc(inventoryItemsTable.createdAt));
  res.json(ListInventoryItemsResponse.parse(items.map(serializeItem)));
});

router.post("/me/inventory", withCurrentUser, async (req, res) => {
  const body = CreateInventoryItemBody.parse(req.body);
  const id = randomUUID();
  await db.insert(inventoryItemsTable).values({
    id,
    sellerId: req.currentUserId!,
    title: body.title,
    category: body.category,
    style: body.style ?? "",
    description: body.description ?? "",
    priceMin: body.priceMin !== undefined ? body.priceMin.toString() : null,
    priceMax: body.priceMax !== undefined ? body.priceMax.toString() : null,
    lengthIn: body.lengthIn !== undefined ? body.lengthIn.toString() : null,
    widthIn: body.widthIn !== undefined ? body.widthIn.toString() : null,
    heightIn: body.heightIn !== undefined ? body.heightIn.toString() : null,
    condition: body.condition ?? "good",
    photos: body.photos ?? [],
    isAvailable: true,
  });
  const [row] = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.id, id))
    .limit(1);
  res.status(201).json(ListInventoryItemsResponseItem.parse(serializeItem(row)));
});

router.delete("/me/inventory/:itemId", withCurrentUser, async (req, res) => {
  const params = DeleteInventoryItemParams.parse(req.params);
  await db
    .delete(inventoryItemsTable)
    .where(
      and(
        eq(inventoryItemsTable.id, params.itemId),
        eq(inventoryItemsTable.sellerId, req.currentUserId!),
      ),
    );
  res.status(204).end();
});

router.get("/me/matches", withCurrentUser, async (req, res) => {
  const sellerId = req.currentUserId!;

  const items = await db
    .select()
    .from(inventoryItemsTable)
    .where(
      and(
        eq(inventoryItemsTable.sellerId, sellerId),
        eq(inventoryItemsTable.isAvailable, true),
      ),
    );

  const openRequests = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(
      and(
        eq(requestsTable.status, "open"),
        ne(requestsTable.buyerId, sellerId),
      ),
    );

  const matches: {
    inventoryItem: ReturnType<typeof serializeItem>;
    request: ReturnType<typeof serializeRequestSummary>;
    score: number;
    matchReasons: string[];
  }[] = [];

  for (const item of items) {
    for (const { r, u } of openRequests) {
      const { score, reasons } = computeMatchScore(item, r);
      if (score >= 35) {
        const [rc] = await db
          .select({ c: count() })
          .from(responsesTable)
          .where(eq(responsesTable.requestId, r.id));
        matches.push({
          inventoryItem: serializeItem(item),
          request: serializeRequestSummary(r, u, rc.c),
          score,
          matchReasons: reasons,
        });
      }
    }
  }

  // Sort by score desc, take top 20
  matches.sort((a, b) => b.score - a.score);
  res.json(GetInventoryMatchesResponse.parse(matches.slice(0, 20)));
});

router.get("/me/prospecting", withCurrentUser, async (req, res) => {
  const rows = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(eq(requestsTable.status, "open"))
    .orderBy(desc(requestsTable.createdAt))
    .limit(20);

  const summaries = await Promise.all(
    rows.map(async ({ r, u }) => {
      const [rc] = await db
        .select({ c: count() })
        .from(responsesTable)
        .where(eq(responsesTable.requestId, r.id));
      return serializeRequestSummary(r, u, rc.c);
    }),
  );

  res.json(summaries);
});

export default router;
