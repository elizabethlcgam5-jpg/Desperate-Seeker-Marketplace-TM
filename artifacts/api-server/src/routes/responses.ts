import { Router, type IRouter } from "express";
import {
  db,
  requestsTable,
  responsesTable,
  threadsTable,
  usersTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
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
import { withCurrentUser } from "../lib/session";
import { serializeUser } from "../lib/serializers";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

router.get("/requests/:requestId/responses", async (req, res) => {
  const params = ListResponsesForRequestParams.parse(req.params);
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
        price: Number(r.price),
        condition: r.condition,
        message: r.message,
        photos: r.photos,
        status: r.status,
        threadId: r.threadId,
        createdAt: r.createdAt.toISOString(),
      })),
    ),
  );
});

router.post(
  "/requests/:requestId/responses",
  withCurrentUser,
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

    const id = randomUUID();
    await db.insert(responsesTable).values({
      id,
      requestId: params.requestId,
      sellerId: req.currentUserId!,
      price: body.price.toString(),
      condition: body.condition,
      message: body.message,
      photos: body.photos,
      status: "pending",
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
      price: Number(row.r.price),
      condition: row.r.condition,
      message: row.r.message,
      photos: row.r.photos,
      status: row.r.status,
      threadId: row.r.threadId,
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
      price: Number(row.r.price),
      condition: row.r.condition,
      message: row.r.message,
      photos: row.r.photos,
      status: row.r.status,
      threadId: row.r.threadId,
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

    let threadId: string | null = existing.r.threadId;
    if (body.status === "accepted" && !threadId) {
      threadId = randomUUID();
      await db.insert(threadsTable).values({
        id: threadId,
        requestId: existing.r.requestId,
        responseId: existing.r.id,
      });
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
        price: Number(row.r.price),
        condition: row.r.condition,
        message: row.r.message,
        photos: row.r.photos,
        status: row.r.status,
        threadId: row.r.threadId,
        createdAt: row.r.createdAt.toISOString(),
      }),
    );
  },
);

export default router;
