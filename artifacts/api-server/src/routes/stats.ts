import { Router, type IRouter } from "express";
import {
  db,
  requestsTable,
  responsesTable,
  usersTable,
} from "@workspace/db";
import { and, count, countDistinct, desc, eq, gte, sql } from "drizzle-orm";
import {
  ListCategoriesResponse,
  GetOverviewStatsResponse,
  GetRecentActivityResponse,
  GetTrendingRequestsResponse,
} from "@workspace/api-zod";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({ category: requestsTable.category, c: count() })
    .from(requestsTable)
    .groupBy(requestsTable.category)
    .orderBy(desc(count()));
  res.json(
    ListCategoriesResponse.parse(
      rows.map((r) => ({ category: r.category, count: r.c })),
    ),
  );
});

router.get("/stats/overview", async (_req, res) => {
  const [openRow] = await db
    .select({ c: count() })
    .from(requestsTable)
    .where(eq(requestsTable.status, "open"));
  const [respTotal] = await db.select({ c: count() }).from(responsesTable);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [fulfilledWeek] = await db
    .select({ c: count() })
    .from(requestsTable)
    .where(
      and(
        eq(requestsTable.status, "fulfilled"),
        gte(requestsTable.createdAt, weekAgo),
      ),
    );
  const [activeBuyers] = await db
    .select({ c: countDistinct(requestsTable.buyerId) })
    .from(requestsTable);
  const [activeSellers] = await db
    .select({ c: countDistinct(responsesTable.sellerId) })
    .from(responsesTable);

  res.json(
    GetOverviewStatsResponse.parse({
      openRequests: openRow.c,
      totalResponses: respTotal.c,
      fulfilledThisWeek: fulfilledWeek.c,
      activeBuyers: activeBuyers.c,
      activeSellers: activeSellers.c,
    }),
  );
});

router.get("/feed/recent-activity", async (_req, res) => {
  const reqRows = await db
    .select({ r: requestsTable, u: usersTable })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .orderBy(desc(requestsTable.createdAt))
    .limit(20);
  const respRows = await db
    .select({ r: responsesTable, u: usersTable, req: requestsTable })
    .from(responsesTable)
    .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
    .innerJoin(requestsTable, eq(requestsTable.id, responsesTable.requestId))
    .orderBy(desc(responsesTable.createdAt))
    .limit(20);

  type Ev = {
    id: string;
    kind: "request_created" | "response_created" | "response_accepted" | "request_fulfilled";
    createdAt: string;
    actor: ReturnType<typeof serializeUser>;
    summary: string;
    requestId: string | null;
  };
  const events: Ev[] = [];
  for (const { r, u } of reqRows) {
    events.push({
      id: `req-${r.id}`,
      kind: "request_created",
      createdAt: r.createdAt.toISOString(),
      actor: serializeUser(u),
      summary: `posted "${r.title}"`,
      requestId: r.id,
    });
    if (r.status === "fulfilled") {
      events.push({
        id: `fulfilled-${r.id}`,
        kind: "request_fulfilled",
        createdAt: r.createdAt.toISOString(),
        actor: serializeUser(u),
        summary: `marked "${r.title}" fulfilled`,
        requestId: r.id,
      });
    }
  }
  for (const { r, u, req } of respRows) {
    events.push({
      id: `resp-${r.id}`,
      kind: r.status === "accepted" ? "response_accepted" : "response_created",
      createdAt: r.createdAt.toISOString(),
      actor: serializeUser(u),
      summary:
        r.status === "accepted"
          ? `had a $${Number(r.price).toFixed(0)} offer accepted on "${req.title}"`
          : `offered $${Number(r.price).toFixed(0)} on "${req.title}"`,
      requestId: req.id,
    });
  }
  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(GetRecentActivityResponse.parse(events.slice(0, 25)));
});

router.get("/feed/trending", async (_req, res) => {
  const rows = await db
    .select({
      r: requestsTable,
      u: usersTable,
      c: sql<number>`(SELECT COUNT(*) FROM ${responsesTable} WHERE ${responsesTable.requestId} = ${requestsTable.id})`,
    })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .orderBy(
      desc(
        sql`(SELECT COUNT(*) FROM ${responsesTable} WHERE ${responsesTable.requestId} = ${requestsTable.id})`,
      ),
      desc(requestsTable.createdAt),
    )
    .limit(6);
  res.json(
    GetTrendingRequestsResponse.parse(
      rows.map(({ r, u, c }) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        style: r.style ?? undefined,
        budgetMin: r.budgetMin === null ? null : Number(r.budgetMin),
        budgetMax: r.budgetMax === null ? null : Number(r.budgetMax),
        lengthIn: r.lengthIn === null ? null : Number(r.lengthIn),
        widthIn: r.widthIn === null ? null : Number(r.widthIn),
        heightIn: r.heightIn === null ? null : Number(r.heightIn),
        photos: r.photos ?? [],
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        isPrivate: r.isPrivate ?? false,
        createdAt: r.createdAt.toISOString(),
        buyer: serializeUser(u),
        responseCount: Number(c),
      })),
    ),
  );
});

export default router;
