import { NextFunction, Request, Response } from "express";
import { repos } from "../../repositories/index";
import { chalkLogger } from "../../utils/chalkLogger";
import { AppError } from "../../utils/errors/AppError";



async function byId (req: Request, res: Response, next: NextFunction) {
    const {employeeId} = res.locals;
    const employee = await repos.employee.findById(employeeId);
    if (!employee) {
        throw new AppError(404, "Employee not found");
    }
    res.locals.employee = employee;
    chalkLogger.log("middleware", `Employee ${employee.id} found`);
    next();
}

export const employee = {
    byId
}