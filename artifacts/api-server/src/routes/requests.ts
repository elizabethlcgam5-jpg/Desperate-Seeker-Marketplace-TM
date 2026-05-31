import { Router, type IRouter } from "express";
import {
  db,
  requestsTable,
  responsesTable,
  usersTable,
  listingsTable,
  notificationsTable,
} from "@workspace/db";
import { and, desc, asc, eq, ilike, or, sql, count, ne } from "drizzle-orm";
import {
  ListRequestsQueryParams,
  ListRequestsResponse,
  CreateRequestBody,
  GetRequestParams,
  GetRequestResponse,
  UpdateRequestParams,
  UpdateRequestBody,
  UpdateRequestResponse,
} from "@workspace/api-zod";
import { withCurrentUser, readCurrentUserId } from "../lib/session";
import { serializeUser } from "../lib/serializers";
import { randomUUID } from "node:crypto";
import { instantMatchOnRequest } from "../lib/matchEngine";
import { generateAndSaveKeywords } from "../lib/keywordGenerator";

const router: IRouter = Router();

async function loadSummary(requestId: string) {
  const [row] = await db
    .select({
      r: requestsTable,
      u: usersTable,
    })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(eq(requestsTable.id, requestId))
    .limit(1);
  if (!row) return null;
  const [rc] = await db
    .select({ c: count() })
    .from(responsesTable)
    .where(eq(responsesTable.requestId, requestId));
  return {
    id: row.r.id,
    title: row.r.title,
    description: row.r.description,
    category: row.r.category,
    style: row.r.style ?? "",
    budgetMin: row.r.budgetMin === null ? null : Number(row.r.budgetMin),
    budgetMax: row.r.budgetMax === null ? null : Number(row.r.budgetMax),
    lengthIn: row.r.lengthIn === null ? null : Number(row.r.lengthIn),
    widthIn: row.r.widthIn === null ? null : Number(row.r.widthIn),
    heightIn: row.r.heightIn === null ? null : Number(row.r.heightIn),
    photos: row.r.photos ?? [],
    status: row.r.status,
    urgency: row.r.urgency,
    location: row.r.location,
    isPrivate: row.r.isPrivate,
    createdAt: row.r.createdAt.toISOString(),
    buyer: serializeUser(row.u),
    responseCount: rc.c,
  };
}

router.get("/requests", async (req, res) => {
  const params = ListRequestsQueryParams.parse(req.query);
  const viewerId = readCurrentUserId(req);

  // Determine if viewer is a subscribed seller (can see private listings)
  let viewerTier: string = "free";
  if (viewerId) {
    const [viewerRow] = await db
      .select({ t: usersTable.subscriptionTier })
      .from(usersTable)
      .where(eq(usersTable.id, viewerId))
      .limit(1);
    viewerTier = viewerRow?.t ?? "free";
  }
  const isSubscribedSeller = viewerTier !== "free";

  const conditions = [];
  if (params.search) {
    conditions.push(
      or(
        ilike(requestsTable.title, `%${params.search}%`),
        ilike(requestsTable.description, `%${params.search}%`),
      ),
    );
  }
  if (params.category) {
    conditions.push(eq(requestsTable.category, params.category));
  }
  if (params.status) {
    conditions.push(eq(requestsTable.status, params.status));
  }
  if (params.buyerId) {
    conditions.push(eq(requestsTable.buyerId, params.buyerId));
  }
  // Filter private listings: only show them to their owner or subscribed sellers
  if (!isSubscribedSeller) {
    if (viewerId) {
      conditions.push(
        or(eq(requestsTable.isPrivate, false), eq(requestsTable.buyerId, viewerId)),
      );
    } else {
      conditions.push(eq(requestsTable.isPrivate, false));
    }
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  let orderClause;
  switch (params.sort) {
    case "oldest":
      orderClause = asc(requestsTable.createdAt);
      break;
    case "urgent":
      orderClause = sql`CASE ${requestsTable.urgency} WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END, ${requestsTable.createdAt} DESC`;
      break;
    case "most_responses":
      orderClause = desc(requestsTable.createdAt);
      break;
    default:
      orderClause = desc(requestsTable.createdAt);
  }

  const rows = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(whereClause)
    .orderBy(orderClause);

  const summaries = await Promise.all(
    rows.map(async ({ r, u }) => {
      const [rc] = await db
        .select({ c: count() })
        .from(responsesTable)
        .where(eq(responsesTable.requestId, r.id));
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
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        isPrivate: r.isPrivate,
        createdAt: r.createdAt.toISOString(),
        buyer: serializeUser(u),
        responseCount: rc.c,
      };
    }),
  );

  let final = summaries;
  if (params.sort === "most_responses") {
    final = [...summaries].sort((a, b) => b.responseCount - a.responseCount);
  }

  res.json(ListRequestsResponse.parse(final));
});

async function notifyMatchingSellers(
  requestId: string,
  requestTitle: string,
  requestDescription: string,
  requestCategory: string,
  buyerId: string,
) {
  try {
    // Extract significant keywords (4+ chars, skip stop words)
    const stopWords = new Set(["with", "from", "this", "that", "have", "want", "need", "looking", "good", "like"]);
    const keywords = requestTitle
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    if (keywords.length === 0) return;

    // Find active listings matching by title keyword or category
    const keywordConditions = keywords.map((kw) =>
      ilike(listingsTable.title, `%${kw}%`),
    );

    const matches = await db
      .select()
      .from(listingsTable)
      .where(
        and(
          eq(listingsTable.isAvailable, true),
          eq(listingsTable.status, "active"),
          ne(listingsTable.sellerId, buyerId),
          or(
            ilike(listingsTable.category, `%${requestCategory.split(" ")[0]}%`),
            ...keywordConditions,
          ),
        ),
      )
      .limit(8);

    if (matches.length === 0) return;

    // Deduplicate by seller so one seller gets at most one notification per request
    const seenSellers = new Set<string>();
    const notifications = [];
    for (const listing of matches) {
      if (!listing.sellerId || seenSellers.has(listing.sellerId)) continue;
      seenSellers.add(listing.sellerId);

      // Determine match quality: exact = title shares 2+ keywords; similar = category match only
      const titleWords = listing.title.toLowerCase().split(/\s+/);
      const sharedKeywords = keywords.filter((kw) => titleWords.some((tw) => tw.includes(kw)));
      const matchType = sharedKeywords.length >= 2 ? "exact" : "similar";
      const matchLabel = matchType === "exact" ? "Exact match alert" : "Similar match";
      const message =
        matchType === "exact"
          ? `A buyer is looking for "${requestTitle}" — it closely matches your listing "${listing.title}".`
          : `A buyer posted for "${requestTitle}" — your listing "${listing.title}" may be a fit.`;

      notifications.push({
        id: randomUUID(),
        userId: listing.sellerId,
        type: matchType,
        title: matchLabel,
        message,
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
  } catch (err) {
    // Non-critical: don't fail the request creation if matching fails
  }
}

router.post("/requests", withCurrentUser, async (req, res) => {
  const body = CreateRequestBody.parse(req.body);
  // Pull new fields directly from body (not yet in generated Zod schema)
  const condition = typeof req.body.condition === "string" ? req.body.condition : "";
  const instantMatchOn = req.body.instantMatchOn === true;

  const id = randomUUID();
  await db.insert(requestsTable).values({
    id,
    buyerId: req.currentUserId!,
    title: body.title,
    description: body.description,
    category: body.category,
    style: body.style ?? "",
    budgetMin:
      body.budgetMin !== undefined ? body.budgetMin.toString() : null,
    budgetMax:
      body.budgetMax !== undefined ? body.budgetMax.toString() : null,
    lengthIn: body.lengthIn !== undefined ? body.lengthIn.toString() : null,
    widthIn: body.widthIn !== undefined ? body.widthIn.toString() : null,
    heightIn: body.heightIn !== undefined ? body.heightIn.toString() : null,
    photos: body.photos ?? [],
    location: body.location ?? "",
    urgency: body.urgency ?? "normal",
    tags: body.tags ?? [],
    isPrivate: body.isPrivate ?? false,
    condition,
    instantMatchOn,
  });

  // Fire-and-forget: AI keyword generation, legacy seller notify, InstantMatch
  generateAndSaveKeywords(id, body.title, body.description, body.category);
  notifyMatchingSellers(id, body.title, body.description, body.category, req.currentUserId!);
  // Delay InstantMatch slightly so keywords may be ready
  setTimeout(() => instantMatchOnRequest(id, req.currentUserId!), 4000);

  const summary = await loadSummary(id);
  res.status(201).json(
    GetRequestResponse.parse({
      ...summary,
      tags: body.tags ?? [],
      responses: [],
    }),
  );
});

router.get("/requests/:requestId", async (req, res) => {
  const params = GetRequestParams.parse(req.params);
  const [row] = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(eq(requestsTable.id, params.requestId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  const responseRows = await db
    .select({ r: responsesTable, u: usersTable })
    .from(responsesTable)
    .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
    .where(eq(responsesTable.requestId, row.r.id))
    .orderBy(desc(responsesTable.createdAt));

  res.json(
    GetRequestResponse.parse({
      id: row.r.id,
      title: row.r.title,
      description: row.r.description,
      category: row.r.category,
      style: row.r.style ?? undefined,
      budgetMin: row.r.budgetMin === null ? null : Number(row.r.budgetMin),
      budgetMax: row.r.budgetMax === null ? null : Number(row.r.budgetMax),
      lengthIn: row.r.lengthIn === null ? null : Number(row.r.lengthIn),
      widthIn: row.r.widthIn === null ? null : Number(row.r.widthIn),
      heightIn: row.r.heightIn === null ? null : Number(row.r.heightIn),
      photos: row.r.photos ?? [],
      isPrivate: row.r.isPrivate ?? false,
      status: row.r.status,
      urgency: row.r.urgency,
      location: row.r.location,
      createdAt: row.r.createdAt.toISOString(),
      buyer: serializeUser(row.u),
      responseCount: responseRows.length,
      tags: row.r.tags,
      responses: responseRows.map(({ r, u }) => ({
        id: r.id,
        requestId: r.requestId,
        seller: serializeUser(u),
        responseType: r.responseType,
        price: r.price == null ? null : Number(r.price),
        condition: r.condition,
        message: r.message,
        photos: r.photos,
        status: r.status,
        threadId: r.threadId,
        viewCount: r.viewCount,
        createdAt: r.createdAt.toISOString(),
      })),
    }),
  );
});

router.patch("/requests/:requestId", withCurrentUser, async (req, res) => {
  const params = UpdateRequestParams.parse(req.params);
  const body = UpdateRequestBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(requestsTable)
    .where(eq(requestsTable.id, params.requestId))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  if (existing.buyerId !== req.currentUserId) {
    res.status(403).json({ error: "Only the buyer can update this request" });
    return;
  }

  await db
    .update(requestsTable)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.style !== undefined && { style: body.style }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.urgency !== undefined && { urgency: body.urgency }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.budgetMin !== undefined && {
        budgetMin: body.budgetMin === null ? null : body.budgetMin.toString(),
      }),
      ...(body.budgetMax !== undefined && {
        budgetMax: body.budgetMax === null ? null : body.budgetMax.toString(),
      }),
      ...(body.tags !== undefined && { tags: body.tags }),
    })
    .where(eq(requestsTable.id, params.requestId));

  const [row] = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(eq(requestsTable.id, params.requestId))
    .limit(1);
  const responseRows = await db
    .select({ r: responsesTable, u: usersTable })
    .from(responsesTable)
    .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
    .where(eq(responsesTable.requestId, row.r.id))
    .orderBy(desc(responsesTable.createdAt));

  res.json(
    UpdateRequestResponse.parse({
      id: row.r.id,
      title: row.r.title,
      description: row.r.description,
      category: row.r.category,
      budgetMin: row.r.budgetMin === null ? null : Number(row.r.budgetMin),
      budgetMax: row.r.budgetMax === null ? null : Number(row.r.budgetMax),
      status: row.r.status,
      urgency: row.r.urgency,
      location: row.r.location,
      createdAt: row.r.createdAt.toISOString(),
      buyer: serializeUser(row.u),
      responseCount: responseRows.length,
      tags: row.r.tags,
      responses: responseRows.map(({ r, u }) => ({
        id: r.id,
        requestId: r.requestId,
        seller: serializeUser(u),
        responseType: r.responseType,
        price: r.price == null ? null : Number(r.price),
        condition: r.condition,
        message: r.message,
        photos: r.photos,
        status: r.status,
        threadId: r.threadId,
        viewCount: r.viewCount,
        createdAt: r.createdAt.toISOString(),
      })),
    }),
  );
});

router.post("/requests/:requestId/repost", withCurrentUser, async (req, res) => {
  const { requestId } = req.params;

  const [existing] = await db
    .select()
    .from(requestsTable)
    .where(eq(requestsTable.id, requestId))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  if (existing.buyerId !== req.currentUserId) {
    res.status(403).json({ error: "Only the buyer can repost this request" });
    return;
  }

  await db
    .update(requestsTable)
    .set({ status: "open", keywords: null })
    .where(eq(requestsTable.id, requestId));

  // Re-run keyword gen + InstantMatch
  generateAndSaveKeywords(requestId, existing.title, existing.description, existing.category);
  setTimeout(() => instantMatchOnRequest(requestId, req.currentUserId!), 4000);

  const summary = await loadSummary(requestId);
  res.json(summary);
});

router.delete("/requests/:requestId", withCurrentUser, async (req, res) => {
  const { requestId } = req.params;

  const [existing] = await db
    .select()
    .from(requestsTable)
    .where(eq(requestsTable.id, requestId))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  if (existing.buyerId !== req.currentUserId) {
    res.status(403).json({ error: "Only the buyer can delete this request" });
    return;
  }

  // Responses, threads and messages cascade-delete via FK constraints.
  await db.delete(requestsTable).where(eq(requestsTable.id, requestId));

  res.json({ success: true });
});

export default router;
