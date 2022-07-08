import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError } from "../utils/errors/AppError";

function validateMultipleJoi (commands: {local: string, joiSchema: Joi.AnySchema}[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const command of commands) {
            const { local, joiSchema } = command;
            if (!res.locals[local]) {
                throw new AppError(400, `${local} is missing`);
            }
            const value = res.locals[local];
            const result = joiSchema.validate(value);
            if (result.error) {
                throw new AppError(400, result.error.message);
            }
        }
        next();
    }
}

export const check = {validateMultipleJoi}