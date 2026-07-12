import { db } from "../config/dbConfig.js";
import { users } from "../db/Schema/schema.js";
import { eq } from "drizzle-orm";

export const authService = {

  findUserByEmail: async (email) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  },

  findUserById: async (id) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  },


  createUser: async (userData) => {
    const result = await db
      .insert(users)
      .values(userData)
      .returning();
    return result[0];
  },
};
