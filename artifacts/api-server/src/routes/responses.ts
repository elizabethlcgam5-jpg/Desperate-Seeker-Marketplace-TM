import { Router, type IRouter } from "express";
import {
  db,
  requestsTable,
  responsesTable,
  threadsTable,
  usersTable,
} from "@workspace/db";
import { desc, eq, and, ne, sql } from "drizzle-orm";
import {
  ListResponsesForRequestParams,
  ListResponsesForRequestResponse,
  CreateResponseParams,
  CreateResponseBody,
  GetResponseParams,
  GetResponseResponse,
  UpdateResponseStatusParams,
  UpdateResponseStatusBody,
  UpdateResponseStatusResponse,
} from "@workspace/api-zod";
import {
  withCurrentUser,
  requireCurrentUser,
  readCurrentUserId,
} from "../lib/session";
import { serializeUser } from "../lib/serializers";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

router.get("/requests/:requestId/responses", async (req, res) => {
  const params = ListResponsesForRequestParams.parse(req.params);
  const viewerId = readCurrentUserId(req);

  // Bump view counts for any offers the viewer didn't post themselves.
  if (viewerId) {
    await db
      .update(responsesTable)
      .set({ viewCount: sql`${responsesTable.viewCount} + 1` })
      .where(
        and(
          eq(responsesTable.requestId, params.requestId),
          ne(responsesTable.sellerId, viewerId),
        ),
      );
  }

  const rows = await db
    .select({ r: responsesTable, u: usersTable })
    .from(responsesTable)
    .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
    .where(eq(responsesTable.requestId, params.requestId))
    .orderBy(desc(responsesTable.createdAt));
  res.json(
    ListResponsesForRequestResponse.parse(
      rows.map(({ r, u }) => ({
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
    ),
  );
});

router.post(
  "/requests/:requestId/responses",
  // Fail closed: a seller response must be attributed to a genuinely
  // authenticated user. `withCurrentUser` would silently fall back to the
  // first seeded user when the auth cookie is missing, which previously caused
  // a seller's response to show under the wrong name.
  requireCurrentUser,
  async (req, res) => {
    const params = CreateResponseParams.parse(req.params);
    const body = CreateResponseBody.parse(req.body);

    const [reqRow] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, params.requestId))
      .limit(1);
    if (!reqRow) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // Responding to buyer requests is always free and unlimited for all sellers.
    // Create the conversation thread eagerly so the buyer and this seller can
    // message each other inline from the request page before any acceptance.
    const id = randomUUID();
    const threadId = randomUUID();
    await db.insert(responsesTable).values({
      id,
      requestId: params.requestId,
      sellerId: req.currentUserId!,
      responseType: body.responseType,
      price: body.price != null ? body.price.toString() : null,
      condition: body.responseType === "have" ? body.condition ?? null : null,
      message: body.message,
      photos: body.photos,
      status: "pending",
      threadId,
    });
    await db.insert(threadsTable).values({
      id: threadId,
      requestId: params.requestId,
      responseId: id,
    });

    const [row] = await db
      .select({ r: responsesTable, u: usersTable })
      .from(responsesTable)
      .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
      .where(eq(responsesTable.id, id))
      .limit(1);

    res.status(201).json({
      id: row.r.id,
      requestId: row.r.requestId,
      seller: serializeUser(row.u),
      responseType: row.r.responseType,
      price: row.r.price == null ? null : Number(row.r.price),
      condition: row.r.condition,
      message: row.r.message,
      photos: row.r.photos,
      status: row.r.status,
      threadId: row.r.threadId,
      viewCount: row.r.viewCount,
      createdAt: row.r.createdAt.toISOString(),
    });
  },
);

router.get("/responses/:responseId", async (req, res) => {
  const params = GetResponseParams.parse(req.params);
  const [row] = await db
    .select({ r: responsesTable, u: usersTable })
    .from(responsesTable)
    .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
    .where(eq(responsesTable.id, params.responseId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Response not found" });
    return;
  }
  res.json(
    GetResponseResponse.parse({
      id: row.r.id,
      requestId: row.r.requestId,
      seller: serializeUser(row.u),
      responseType: row.r.responseType,
      price: row.r.price == null ? null : Number(row.r.price),
      condition: row.r.condition,
      message: row.r.message,
      photos: row.r.photos,
      status: row.r.status,
      threadId: row.r.threadId,
      viewCount: row.r.viewCount,
      createdAt: row.r.createdAt.toISOString(),
    }),
  );
});

router.patch(
  "/responses/:responseId",
  withCurrentUser,
  async (req, res) => {
    const params = UpdateResponseStatusParams.parse(req.params);
    const body = UpdateResponseStatusBody.parse(req.body);

    const [existing] = await db
      .select({ r: responsesTable })
      .from(responsesTable)
      .where(eq(responsesTable.id, params.responseId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Response not found" });
      return;
    }
    const [reqRow] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, existing.r.requestId))
      .limit(1);
    if (!reqRow) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    if (reqRow.buyerId !== req.currentUserId) {
      res
        .status(403)
        .json({ error: "Only the buyer can update response status" });
      return;
    }

    // Threads are created eagerly when a response is posted, but keep this
    // fallback for any legacy responses that predate that behavior.
    let threadId: string | null = existing.r.threadId;
    if (body.status === "accepted") {
      if (!threadId) {
        threadId = randomUUID();
        await db.insert(threadsTable).values({
          id: threadId,
          requestId: existing.r.requestId,
          responseId: existing.r.id,
        });
      }
      await db
        .update(requestsTable)
        .set({ status: "fulfilled" })
        .where(eq(requestsTable.id, existing.r.requestId));
    }

    await db
      .update(responsesTable)
      .set({ status: body.status, threadId })
      .where(eq(responsesTable.id, params.responseId));

    const [row] = await db
      .select({ r: responsesTable, u: usersTable })
      .from(responsesTable)
      .innerJoin(usersTable, eq(usersTable.id, responsesTable.sellerId))
      .where(eq(responsesTable.id, params.responseId))
      .limit(1);

    res.json(
      UpdateResponseStatusResponse.parse({
        id: row.r.id,
        requestId: row.r.requestId,
        seller: serializeUser(row.u),
        responseType: row.r.responseType,
        price: row.r.price == null ? null : Number(row.r.price),
        condition: row.r.condition,
        message: row.r.message,
        photos: row.r.photos,
        status: row.r.status,
        threadId: row.r.threadId,
        viewCount: row.r.viewCount,
        createdAt: row.r.createdAt.toISOString(),
      }),
    );
  },
);

export default router;
