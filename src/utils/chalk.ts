import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';


const types = {
    middleware: chalk.bold.magenta('[Middleware]'),
    controller: chalk.bold.green('[Controller]'),
    service: chalk.bold.magenta('[Service]'),
    db: chalk.bold.blue('[db]'),
    api: chalk.bold.blue('[API]'),
    log: chalk.bold.green('[Log]'),
    route: chalk.bold.blueBright('[Route]'),
    server: chalk.bold.yellow('[Server]'),
    error: chalk.bold.red('[ERROR]')
};


function log (type: string, message: string) {
    console.log(`${types[type]} ${message}`);
}


function logMiddleware (type: string, message: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        log(type, message);
        next();
    };
}

export const chalklogger = {
    log, logMiddleware
}