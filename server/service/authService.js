import { db } from "../config/dbConfig.js";
import { users, authLogs } from "../db/Schema/schema.js";
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

  updateUserLockout: async (userId, data) => {
    const result = await db
      .update(users)
      .set({
        failedLoginAttempts: data.failedLoginAttempts,
        accountLockedUntil: data.accountLockedUntil,
        lastFailedLogin: data.lastFailedLogin,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  },

  updateUserPassword: async (userId, hashedPassword) => {
    const result = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  },

  createAuthLog: async (logData) => {
    const result = await db
      .insert(authLogs)
      .values({
        userId: logData.userId || null,
        email: logData.email,
        ipAddress: logData.ipAddress || null,
        userAgent: logData.userAgent || null,
        status: logData.status,
      })
      .returning();
    return result[0];
  },
};
