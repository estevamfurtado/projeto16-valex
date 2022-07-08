import { NextFunction, Request, Response } from "express";
import { repos } from "../repositories/index.js";
import { chalkLogger } from "../utils/chalkLogger.js";
import { AppError } from "../utils/errors/AppError.js";
import { cardsService } from "../services/cards.js";


function setLocalsFromRequestData (params: string[], body: string[], headers: string[], query: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const locals = {...res.locals};
        params.forEach(param => {
            if (!req.params[param]) {
                throw new AppError(400, `Missing ${param}`);
            }
            locals[param] = req.params[param];
        }
        );
        body.forEach(param => {
            if (!req.body[param]) {
                throw new AppError(400, `Missing ${param}`);
            }
            locals[param] = req.body[param];
        }
        );
        query.forEach(param => {
            if (!req.query[param]) {
                throw new AppError(400, `Missing ${param}`);
            }
            locals[param] = req.query[param];
        }
        );
        headers.forEach(param => {
            if (!req.headers[param]) {
                throw new AppError(400, `Missing ${param}`);
            }
            locals[param] = req.headers[param];
        }
        );
        res.locals = locals;
        chalkLogger.log("middleware", `Request data set to locals`);
        next();
    }
}


async function checkApiKey (req: Request, res: Response, next: NextFunction) {
    const companyApiKey = req.headers['x-api-key'] ?? null;

    if (!companyApiKey) {
        throw new AppError(401, 'No api key provided');
    }
    res.locals.companyApiKey = companyApiKey;
    chalkLogger.log("middleware", `Company api key ${companyApiKey} not empty`);
    next();
}

async function checkNewCardBody (req: Request, res: Response, next: NextFunction) {
    const {employeeId, type} = req.body;
    if (!employeeId || !type) {
        throw new AppError(400, 'Missing employeeId or type');
    }
    res.locals.employeeId = employeeId;
    res.locals.type = type;
    chalkLogger.log("middleware", `New card body validated`);
    next();
}


async function getCompanyByApiKey (req: Request, res: Response, next: NextFunction) {
    const companyApiKey = res.locals.companyApiKey;
    const company = await repos.company.findByApiKey(companyApiKey);
    if (!company) {
        throw new AppError(401, "Invalid api key");
    }
    res.locals.company = company;
    chalkLogger.log("middleware", `Company ${company.name} found by api key`);
    next();
}

async function getBusinessById (req: Request, res: Response, next: NextFunction) {
    const {businessId} = res.locals;
    const business = await repos.business.findById(businessId);
    if (!business) {
        throw new AppError(404, "Business not found");
    }
    res.locals.business = business;
    chalkLogger.log("middleware", `Business ${business.id} found`);
    next();
}

async function getCardById (req: Request, res: Response, next: NextFunction) {
    const {cardId} = res.locals;
    const card = await repos.card.findById(cardId);
    if (!card) {
        throw new AppError(404, "Card not found");
    }
    res.locals.card = card;
    chalkLogger.log("middleware", `Card ${card.id} found`);
    next()
}

async function getEmployeeById (req: Request, res: Response, next: NextFunction) {
    const {employeeId} = res.locals;
    const employee = await repos.employee.findById(employeeId);
    if (!employee) {
        throw new AppError(404, "Employee not found");
    }
    res.locals.employee = employee;
    chalkLogger.log("middleware", `Employee ${employee.id} found`);
    next();
}



async function validateCardPassword (req: Request, res: Response, next: NextFunction) {
    const {card, password} = res.locals; // password via bcrypt
    cardsService.validatePassword(card, password);
    chalkLogger.log("middleware", `Card ${card.id} password validated`);
    next();
}

async function validateCardCvv (req: Request, res: Response, next: NextFunction) {
    const {card, cvv} = res.locals;
    cardsService.validateCvv(cvv, card);
    chalkLogger.log("middleware", `Card ${card.id} cvv validated`);
    next();
}

async function checkCardHasNotExpired (req: Request, res: Response, next: NextFunction) {
    const {card} = res.locals;
    const hasExpired = cardsService.cardHasExpired(card);
    if (hasExpired) {
        throw new AppError(400, "Card has expired");
    }
    chalkLogger.log("middleware", `Card ${card.id} has not expired`);
    next();
}

async function checkCardIsActive (req: Request, res: Response, next: NextFunction) {
    const {card} = res.locals;
    if (!cardsService.cardIsActive(card)) {
        throw new AppError(400, "Card is not active");
    }
    chalkLogger.log("middleware", `Card ${card.id} is active`);
    next();
}

async function checkIfUserCardTypeAlreadyExists (req: Request, res: Response, next: NextFunction) {
    const {employeeId, type} = res.locals;
    const userCard = await repos.card.findByTypeAndEmployeeId(type, employeeId);
    if (userCard) {
        throw new AppError(409, "Card type already created for user");
    }
    chalkLogger.log("middleware", `Card type ${type} not created for user`);
    next();
}


export const validate = {
    setLocalsFromRequestData,
    checkApiKey,
    checkNewCardBody,
    getCompanyByApiKey,
    getBusinessById,
    getEmployeeById,
    getCardById,
    validateCardPassword,
    validateCardCvv,
    checkIfUserCardTypeAlreadyExists,
    checkCardHasNotExpired,
    checkCardIsActive
}