import { connection } from "../database";
import { chalkLogger } from "../utils/chalkLogger";

export interface Company {
  id: number;
  name: string;
  apiKey?: string;
}

export async function findByApiKey(apiKey: string) {
  chalkLogger.log("api", `Finding company by api key ${apiKey}`);
  const query = `SELECT * FROM companies WHERE "apiKey"='${apiKey}'`;
  const result = await connection.query<Company, [string]>(query);
  return result.rows[0] ?? null;
}


export const companyRepository = {
  findByApiKey,
};