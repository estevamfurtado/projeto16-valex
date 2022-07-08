import dotenv from "dotenv";
import app from "./app.js";
import chalk from 'chalk';
import 'express-async-errors';


dotenv.config();
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(chalk.bold.green(`Servidor em pé na porta ${port}`)));