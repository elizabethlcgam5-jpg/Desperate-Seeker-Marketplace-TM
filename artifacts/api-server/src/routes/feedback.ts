import { Router, type IRouter } from "express";
import { db, sellerFeedbackTable } from "@workspace/db";
import { SubmitSellerFeedbackBody } from "@workspace/api-zod";
import { withCurrentUser } from "../lib/session";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

router.post("/me/feedback", withCurrentUser, async (req, res) => {
  const body = SubmitSellerFeedbackBody.parse(req.body);
  const id = randomUUID();
  const [row] = await db
    .insert(sellerFeedbackTable)
    .values({
      id,
      sellerId: req.currentUserId!,
      rating: body.rating,
      comment: body.comment ?? "",
    })
    .returning();
  res.status(201).json({
    id: row.id,
    sellerId: row.sellerId,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
