import { Router } from "express";
import cardsRouter from "./cards.js";

const router = Router();
router.use('/cards', cardsRouter);

export default router;