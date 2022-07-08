import { NextFunction, Request, Response } from "express";
import { repos } from "../../repositories/index";
import { chalkLogger } from "../../utils/chalkLogger";
import { AppError } from "../../utils/errors/AppError";
import { cardsService } from "../../services/cards";



async function passwordIsCorrect (req: Request, res: Response, next: NextFunction) {
    const {card, password} = res.locals; // password via bcrypt
    await cardsService.validatePassword(card, password);
    chalkLogger.log("middleware", `Card ${card.id} password validated`);
    next();
}

async function cvvIsCorrect (req: Request, res: Response, next: NextFunction) {
    const {card, cvv} = res.locals;
    cardsService.validateCvv(cvv, card);
    chalkLogger.log("middleware", `Card ${card.id} cvv validated`);
    next();
}

async function hasNotExpired (req: Request, res: Response, next: NextFunction) {
    const {card} = res.locals;
    const hasExpired = cardsService.cardHasExpired(card);
    if (hasExpired) {
        throw new AppError(400, "Card has expired");
    }
    chalkLogger.log("middleware", `Card ${card.id} has not expired`);
    next();
}

async function isActive (req: Request, res: Response, next: NextFunction) {
    const {card} = res.locals;
    if (!cardsService.cardIsActive(card)) {
        throw new AppError(400, "Card is not active");
    }
    chalkLogger.log("middleware", `Card ${card.id} is active`);
    next();
}

async function typeAlreadyExistsForUser (req: Request, res: Response, next: NextFunction) {
    const {employeeId, type} = res.locals;
    const userCard = await repos.card.findByTypeAndEmployeeId(type, employeeId);
    if (userCard) {
        throw new AppError(409, "Card type already created for user");
    }
    chalkLogger.log("middleware", `Card type ${type} not created for user`);
    next();
}

export const card = {
    passwordIsCorrect,
    cvvIsCorrect,
    typeAlreadyExistsForUser,
    hasNotExpired,
    isActive
}