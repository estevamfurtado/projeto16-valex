import { NextFunction, Request, Response } from "express";
import { repos } from "../../repositories/index";
import { chalkLogger } from "../../utils/chalkLogger";
import { AppError } from "../../utils/errors/AppError";



async function byId (req: Request, res: Response, next: NextFunction) {
    const {cardId} = res.locals;
    const card = await repos.card.findById(cardId);
    if (!card) {
        throw new AppError(404, "Card not found");
    }
    res.locals.card = card;
    chalkLogger.log("middleware", `Card ${card.id} found`);
    next()
}

export const card = {
    byId
}