import { asyncHandler } from "../../utils/asyncHandler.js";
import { exportService } from "./exportService.js";

export const exportReport = asyncHandler(async (req, res) => {
  const { moduleName, format } = req.params;
  const validModules = ["vehicles", "drivers", "trips", "fuel", "maintenance", "expenses"];
  const validFormats = ["pdf", "excel", "csv"];

  if (!validModules.includes(moduleName.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Invalid module name" });
  }

  if (!validFormats.includes(format.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Unsupported export format" });
  }

  await exportService.exportReport(
    res,
    format.toLowerCase(),
    moduleName.toLowerCase(),
    req.query,
    req.user
  );
});
