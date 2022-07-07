import express, { json, Request, Response } from "express";
import cors from "cors";
import errorHandlingMiddleware from "./utils/errorHandlerMiddleware.js";
import { chalklogger } from "./utils/chalk.js";
import router from "./routers/index.js";

const app = express();
app.use(cors());
app.use(json());
app.use(errorHandlingMiddleware);
app.use(router);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Valex' });
});


export default app;