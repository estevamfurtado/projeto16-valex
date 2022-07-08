import {Request, Response, NextFunction, ErrorRequestHandler} from 'express';
import { chalkLogger } from './chalkLogger.js';
import { AppError } from './errors/AppError.js';

function errorHandlingMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
	
	console.log({error});

	if (error instanceof AppError) {
		chalkLogger.log('error', error.message);
		return res.status(error.statusCode).send({ message: error.message, status: 'error' });
	}
	else {
		chalkLogger.logObject('error', error);
		return res.status(500).send({message: 'Internal server error', status: 'error'});
	}
}

export default errorHandlingMiddleware;
