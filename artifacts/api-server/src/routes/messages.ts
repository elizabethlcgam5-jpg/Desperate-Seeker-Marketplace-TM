import { Router, type IRouter } from "express";
import {
  db,
  messagesTable,
  requestsTable,
  responsesTable,
  threadsTable,
  usersTable,
} from "@workspace/db";
import { and, desc, eq, or, asc, inArray, sql } from "drizzle-orm";
import {
  ListThreadsResponse,
  GetThreadParams,
  GetThreadResponse,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import { withCurrentUser } from "../lib/session";
import { serializeUser } from "../lib/serializers";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

router.get("/threads", withCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const rows = await db
    .select({
      t: threadsTable,
      r: requestsTable,
      resp: responsesTable,
      buyer: usersTable,
    })
    .from(threadsTable)
    .innerJoin(requestsTable, eq(requestsTable.id, threadsTable.requestId))
    .innerJoin(responsesTable, eq(responsesTable.id, threadsTable.responseId))
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(
      or(
        eq(requestsTable.buyerId, userId),
        eq(responsesTable.sellerId, userId),
      ),
    )
    .orderBy(desc(threadsTable.updatedAt));

  const threads = await Promise.all(
    rows.map(async (row) => {
      const otherUserId =
        row.r.buyerId === userId ? row.resp.sellerId : row.r.buyerId;
      const [otherUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, otherUserId))
        .limit(1);

      const [last] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.threadId, row.t.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      return {
        id: row.t.id,
        requestId: row.r.id,
        requestTitle: row.r.title,
        otherUser: serializeUser(otherUser),
        lastMessage: last?.body ?? "Conversation started",
        updatedAt: row.t.updatedAt.toISOString(),
        unread: 0,
      };
    }),
  );

  res.json(ListThreadsResponse.parse(threads));
});

router.get("/threads/:threadId", withCurrentUser, async (req, res) => {
  const params = GetThreadParams.parse(req.params);
  const [row] = await db
    .select({
      t: threadsTable,
      r: requestsTable,
      resp: responsesTable,
      buyer: usersTable,
    })
    .from(threadsTable)
    .innerJoin(requestsTable, eq(requestsTable.id, threadsTable.requestId))
    .innerJoin(responsesTable, eq(responsesTable.id, threadsTable.responseId))
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.buyerId))
    .where(eq(threadsTable.id, params.threadId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  const [seller] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, row.resp.sellerId))
    .limit(1);

  const messages = await db
    .select({ m: messagesTable, u: usersTable })
    .from(messagesTable)
    .innerJoin(usersTable, eq(usersTable.id, messagesTable.senderId))
    .where(eq(messagesTable.threadId, row.t.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(
    GetThreadResponse.parse({
      id: row.t.id,
      request: {
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
        buyer: serializeUser(row.buyer),
        responseCount: 1,
      },
      participants: [serializeUser(row.buyer), serializeUser(seller)],
      messages: messages.map(({ m, u }) => ({
        id: m.id,
        threadId: m.threadId,
        sender: serializeUser(u),
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    }),
  );
});

router.post(
  "/threads/:threadId/messages",
  withCurrentUser,
  async (req, res) => {
    const params = SendMessageParams.parse(req.params);
    const body = SendMessageBody.parse(req.body);
    const userId = req.currentUserId!;

    const [thread] = await db
      .select({ t: threadsTable, r: requestsTable, resp: responsesTable })
      .from(threadsTable)
      .innerJoin(requestsTable, eq(requestsTable.id, threadsTable.requestId))
      .innerJoin(responsesTable, eq(responsesTable.id, threadsTable.responseId))
      .where(eq(threadsTable.id, params.threadId))
      .limit(1);
    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    if (
      thread.r.buyerId !== userId &&
      thread.resp.sellerId !== userId
    ) {
      res.status(403).json({ error: "Not a participant in this thread" });
      return;
    }

    const id = randomUUID();
    await db.insert(messagesTable).values({
      id,
      threadId: params.threadId,
      senderId: userId,
      body: body.body,
    });
    await db
      .update(threadsTable)
      .set({ updatedAt: new Date() })
      .where(eq(threadsTable.id, params.threadId));

    const [row] = await db
      .select({ m: messagesTable, u: usersTable })
      .from(messagesTable)
      .innerJoin(usersTable, eq(usersTable.id, messagesTable.senderId))
      .where(eq(messagesTable.id, id))
      .limit(1);

    res.status(201).json({
      id: row.m.id,
      threadId: row.m.threadId,
      sender: serializeUser(row.u),
      body: row.m.body,
      createdAt: row.m.createdAt.toISOString(),
    });
  },
);

export default router;
