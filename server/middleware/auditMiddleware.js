import { parseUserAgent } from "../utils/deviceDetector.js";

export const attachRequestMetadata = (req, res, next) => {
  const userAgentStr = req.headers["user-agent"];
  const parsed = parseUserAgent(userAgentStr);

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "127.0.0.1";

  req.auditMetadata = {
    ipAddress,
    browser: parsed.browser,
    operatingSystem: parsed.operatingSystem,
    deviceType: parsed.deviceType,
    requestMethod: req.method,
    requestUrl: req.originalUrl || req.url
  };

  next();
};
