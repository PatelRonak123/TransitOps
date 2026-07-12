import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "../config/env.js";
import * as schema from "../db/Schema/Index.js";

export const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error:", err);
  process.exit(1);
});

export async function connectDatabase() {
  try {
    const client = await pool.connect(); // real TCP connection
    await client.query("SELECT NOW()"); // test query
    console.log("✅ PostgreSQL connected at startup");
    client.release(); // release back to pool
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1); // crash app if DB fails
  }
}

export const db = drizzle(pool, { schema });
