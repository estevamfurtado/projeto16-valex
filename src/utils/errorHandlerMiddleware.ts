import {Request, Response, NextFunction, ErrorRequestHandler} from 'express';

function errorHandlingMiddleware(error, req: Request, res: Response, next: NextFunction) {
	return res.sendStatus(500);
}

export default errorHandlingMiddleware;
