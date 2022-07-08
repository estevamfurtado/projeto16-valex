import express, { json, Request, Response } from "express";
import cors from "cors";
import errorHandlingMiddleware from "./utils/errorHandlerMiddleware.js";
import router from "./routers/index.js";
import { AppError } from "./utils/errors/AppError.js";

const app = express();
app.use(cors());
app.use(json());

app.use(router);
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Valex' });
});

app.use(errorHandlingMiddleware);

export default app;