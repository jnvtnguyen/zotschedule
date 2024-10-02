"use server";

import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import dotenv from "dotenv";
import pg from "pg";

import { DB } from "./generated-types";
dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const database = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});
