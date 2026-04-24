import { Router, type IRouter } from "express";
import {
  db,
  requestsTable,
  responsesTable,
  usersTable,
} from "@workspace/db";
import { and, desc, asc, eq, ilike, or, sql, count } from "drizzle-orm";
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
import { withCurrentUser } from "../lib/session";
import { serializeUser } from "../lib/serializers";
import { randomUUID } from "node:crypto";

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
    budgetMin: row.r.budgetMin === null ? null : Number(row.r.budgetMin),
    budgetMax: row.r.budgetMax === null ? null : Number(row.r.budgetMax),
    status: row.r.status,
    urgency: row.r.urgency,
    location: row.r.location,
    createdAt: row.r.createdAt.toISOString(),
    buyer: serializeUser(row.u),
    responseCount: rc.c,
  };
}

router.get("/requests", async (req, res) => {
  const params = ListRequestsQueryParams.parse(req.query);
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
        budgetMin: r.budgetMin === null ? null : Number(r.budgetMin),
        budgetMax: r.budgetMax === null ? null : Number(r.budgetMax),
        status: r.status,
        urgency: r.urgency,
        location: r.location,
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

router.post("/requests", withCurrentUser, async (req, res) => {
  const body = CreateRequestBody.parse(req.body);
  const id = randomUUID();
  await db.insert(requestsTable).values({
    id,
    buyerId: req.currentUserId!,
    title: body.title,
    description: body.description,
    category: body.category,
    budgetMin:
      body.budgetMin !== undefined ? body.budgetMin.toString() : null,
    budgetMax:
      body.budgetMax !== undefined ? body.budgetMax.toString() : null,
    location: body.location ?? "",
    urgency: body.urgency ?? "normal",
    tags: body.tags ?? [],
  });

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
        price: Number(r.price),
        condition: r.condition,
        message: r.message,
        photos: r.photos,
        status: r.status,
        threadId: r.threadId,
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
      ...(body.status !== undefined && { status: body.status }),
      ...(body.urgency !== undefined && { urgency: body.urgency }),
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
        price: Number(r.price),
        condition: r.condition,
        message: r.message,
        photos: r.photos,
        status: r.status,
        threadId: r.threadId,
        createdAt: r.createdAt.toISOString(),
      })),
    }),
  );
});

export default router;
