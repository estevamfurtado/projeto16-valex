import { NextFunction, Request, Response } from "express";
import { repos } from "../../repositories/index";
import { chalkLogger } from "../../utils/chalkLogger";
import { AppError } from "../../utils/errors/AppError";


async function byApiKey (req: Request, res: Response, next: NextFunction) {
    const companyApiKey = res.locals["x-api-key"];
    const company = await repos.company.findByApiKey(companyApiKey);
    if (!company) {
        throw new AppError(401, "Invalid api key");
    }
    res.locals.company = company;
    chalkLogger.log("middleware", `Company ${company.name} found by api key`);
    next();
}

export const company = {
    byApiKey
}