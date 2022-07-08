import { Request, Response } from "express";
import { cardsService } from "../services/cards";
import { chalkLogger } from "../utils/chalkLogger";
import { Company } from "../repositories/companyRepository";

async function sendCards(req: Request, res: Response) {
    const {employeeId, passwords} = res.locals;
    const data = await cardsService.getCardsByEmployeeId(employeeId, passwords);
    chalkLogger.log("controller", `Cards sent for employee ${employeeId}`);
    res.status(200).send(data);
}

async function createCard(req: Request, res: Response) {
    const {employee, type} = res.locals;
    await cardsService.createCard(employee, type);
    chalkLogger.log("controller", `Card created for employee ${employee.id}`);
    res.sendStatus(200);
}

async function activateCard(req: Request, res: Response) {
    const {card, password} = res.locals;
    await cardsService.activateCard(card, password);
    chalkLogger.log("controller", `Card ${card.id} activated`);
    res.sendStatus(200);
}

async function blockCard(req: Request, res: Response) {
    const {card} = res.locals;
    await cardsService.blockCard(card);
    chalkLogger.log("controller", `Card ${card.id} blocked`);
    res.sendStatus(200);
}

async function unblockCard(req: Request, res: Response) {
    const {card} = res.locals;
    await cardsService.unblockCard(card);
    chalkLogger.log("controller", `Card ${card.id} unblocked`);
    res.sendStatus(200);
}

async function sendCardBalance(req: Request, res: Response) {
    const {card} = res.locals;
    const data = await cardsService.getCardBalance(card);
    chalkLogger.log("controller", `Card ${card.id} balance sent`);
    res.status(200).send(data);
}

async function persistCardRecharge(req: Request, res: Response) {
    const {card, amount, company} = res.locals;
    await cardsService.newRecharge(company, card, amount);
    chalkLogger.log("controller", `Card ${card.id} recharged`);
    res.sendStatus(200);
}

async function persistCardPayment(req: Request, res: Response) {
    const {card, amount, business} = res.locals;
    await cardsService.newPayment(business, card, amount);
    chalkLogger.log("controller", `Card ${card.id} paid`);
    res.sendStatus(200);
}




export const controllers = {
    card: {sendCards, createCard, activateCard, blockCard, unblockCard},
    transactions: {sendCardBalance, persistCardPayment, persistCardRecharge},
}