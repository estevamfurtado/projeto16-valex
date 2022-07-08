import { NextFunction, Request, Response } from "express";
import { repos } from "../../repositories/index";
import { chalkLogger } from "../../utils/chalkLogger";
import { AppError } from "../../utils/errors/AppError";



async function byId (req: Request, res: Response, next: NextFunction) {

    const {businessId} = res.locals;
    const business = await repos.business.findById(businessId);
    if (!business) {
        console.log('business not found!!');
        throw new AppError(404, "Business not found");
    }
    res.locals.business = business;
    chalkLogger.log("middleware", `Business ${business.id} found`);
    next();
}

export const business = {
    byId,
}