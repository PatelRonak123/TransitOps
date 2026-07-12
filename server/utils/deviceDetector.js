export const parseUserAgent = (userAgentString) => {
  if (!userAgentString) {
    return {
      browser: "Unknown",
      operatingSystem: "Unknown",
      deviceType: "Unknown",
    };
  }

  const ua = userAgentString.toLowerCase();

  // 1. Browser Detection
  let browser = "Unknown";
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("opr") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Safari";
  } else if (ua.includes("chromium")) {
    browser = "Chromium";
  } else if (ua.includes("msie") || ua.includes("trident")) {
    browser = "Internet Explorer";
  }

  // 2. OS Detection
  let operatingSystem = "Unknown";
  if (ua.includes("windows")) {
    operatingSystem = "Windows";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    operatingSystem = "macOS";
  } else if (ua.includes("android")) {
    operatingSystem = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    operatingSystem = "iOS";
  } else if (ua.includes("linux")) {
    operatingSystem = "Linux";
  }

  // 3. Device Type Detection
  let deviceType = "Desktop";
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
    deviceType = "Mobile";
  }
  if (ua.includes("ipad") || ua.includes("tablet")) {
    deviceType = "Tablet";
  }

  return { browser, operatingSystem, deviceType };
};
