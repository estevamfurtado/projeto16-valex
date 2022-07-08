import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/AppError";

async function throwAppError (req: Request, res: Response, next: NextFunction) {
    throw new AppError(500, "Test error in middleware");
}

export const help = {
    throwAppError
}