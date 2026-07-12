import { db } from "../config/dbConfig.js";
import { loginHistory } from "../db/Schema/schema.js";

export const loginHistoryService = {
  createLoginHistory: async (data) => {
    try {
      const result = await db
        .insert(loginHistory)
        .values({
          userId: data.userId || null,
          email: data.email,
          role: data.role || null,
          ipAddress: data.ipAddress || null,
          browser: data.browser || null,
          operatingSystem: data.operatingSystem || null,
          deviceType: data.deviceType || null,
          status: data.status,
        })
        .returning();
      return result[0];
    } catch (error) {
      // Do NOT interrupt login if logging fails.
      console.error("Failed to write to login_history:", error);
      return null;
    }
  }
};
