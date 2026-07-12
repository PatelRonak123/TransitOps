import { db } from "../config/dbConfig.js";
import { auditLogs } from "../db/Schema/schema.js";
import { parseUserAgent } from "./deviceDetector.js";

export const auditLogger = async ({
  userId,
  action,
  module,
  entityId,
  entityName,
  oldData,
  newData,
  description,
  request,
  status = "SUCCESS"
}) => {
  try {
    let finalUserId = userId || null;
    let ipAddress = "127.0.0.1";
    let browser = "Unknown";
    let operatingSystem = "Unknown";
    let deviceType = "Unknown";
    let requestMethod = request ? request.method : "GET";
    let requestUrl = request ? (request.originalUrl || request.url) : "";

    if (request) {
      if (!finalUserId && request.user) {
        finalUserId = request.user.id;
      }
      
      if (request.auditMetadata) {
        ipAddress = request.auditMetadata.ipAddress;
        browser = request.auditMetadata.browser;
        operatingSystem = request.auditMetadata.operatingSystem;
        deviceType = request.auditMetadata.deviceType;
        requestMethod = request.auditMetadata.requestMethod;
        requestUrl = request.auditMetadata.requestUrl;
      } else {
        const userAgentStr = request.headers["user-agent"];
        const parsed = parseUserAgent(userAgentStr);
        ipAddress = request.headers["x-forwarded-for"] || request.socket.remoteAddress || request.ip || "127.0.0.1";
        browser = parsed.browser;
        operatingSystem = parsed.operatingSystem;
        deviceType = parsed.deviceType;
        requestMethod = request.method;
        requestUrl = request.originalUrl || request.url;
      }
    }

    await db.insert(auditLogs).values({
      userId: finalUserId,
      action,
      module,
      entityId,
      entityName,
      oldData,
      newData,
      description,
      ipAddress,
      browser,
      operatingSystem,
      deviceType,
      requestMethod,
      requestUrl,
      status
    });
  } catch (error) {
    // Fail-safe: ignore the error and log it internally so the main request can complete
    console.error("❌ Fail-Safe: Audit log insertion failed internally:", error.message);
  }
};
