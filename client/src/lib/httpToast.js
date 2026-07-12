import { toast } from "sonner";

const paletteByStatus = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) {
    return {
      border: "#bbf7d0",
      background: "#f0fdf4",
      text: "#166534",
    };
  }

  if (statusCode === 401 || statusCode === 403) {
    return {
      border: "#fecaca",
      background: "#fef2f2",
      text: "#991b1b",
    };
  }

  if (statusCode === 404) {
    return {
      border: "#bfdbfe",
      background: "#eff6ff",
      text: "#1d4ed8",
    };
  }

  if (statusCode === 423 || statusCode === 429) {
    return {
      border: "#fde68a",
      background: "#fffbeb",
      text: "#92400e",
    };
  }

  return {
    border: "#e2e8f0",
    background: "#f8fafc",
    text: "#334155",
  };
};

let lastToast = { message: "", timestamp: 0 };

export const showHttpToast = (statusCode, message) => {
  const now = Date.now();
  if (lastToast.message === message && now - lastToast.timestamp < 500) {
    return;
  }
  lastToast = { message, timestamp: now };

  const colors = paletteByStatus(statusCode);

  const notify = statusCode >= 200 && statusCode < 300 ? toast.success : toast.error;

  notify(message, {
    style: {
      background: colors.background,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    },
  });
};