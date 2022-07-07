import { Router } from "express";
import authRouter from "./auth.js";
import cardsRouter from "./cards.js";
import paymentsRouter from "./payments.js";
import rechargesRouter from "./recharges.js";

const router = Router();
router.use('/', authRouter);
router.use('/cards', cardsRouter);
router.use('/payments', paymentsRouter);
router.use('/recharges', rechargesRouter);

export default router;