import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import requestsRouter from "./requests";
import responsesRouter from "./responses";
import messagesRouter from "./messages";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(requestsRouter);
router.use(responsesRouter);
router.use(messagesRouter);
router.use(statsRouter);

export default router;
