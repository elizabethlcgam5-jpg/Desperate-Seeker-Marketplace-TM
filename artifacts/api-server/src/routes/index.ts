import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import requestsRouter from "./requests";
import responsesRouter from "./responses";
import messagesRouter from "./messages";
import statsRouter from "./stats";
import analyticsRouter from "./analytics";
import inventoryRouter from "./inventory";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(requestsRouter);
router.use(responsesRouter);
router.use(messagesRouter);
router.use(statsRouter);
router.use(analyticsRouter);
router.use(inventoryRouter);
router.use(feedbackRouter);

export default router;
