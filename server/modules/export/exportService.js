import { reportService } from "../report/reportService.js";
import { streamCSV } from "./helpers/csvHelper.js";
import { streamExcel } from "./helpers/excelHelper.js";
import { generatePDFReport } from "./helpers/pdfHelper.js";
import { ApiError } from "../../utils/ApiError.js";

const getHeadersAndTotals = (moduleName) => {
  switch (moduleName) {
    case "vehicles":
      return {
        headers: [
          { label: "Registration Number", key: "registration_number" },
          { label: "Vehicle Name", key: "vehicle_name" },
          { label: "Model", key: "vehicle_model" },
          { label: "Type", key: "vehicle_type" },
          { label: "Odometer (km)", key: "odometer" },
          { label: "Status", key: "status" },
          { label: "Fuel Cost ($)", key: "fuel_cost" },
          { label: "Maintenance Cost ($)", key: "maintenance_cost" },
          { label: "Total Expense ($)", key: "total_expense" }
        ],
        totalKeys: ["odometer", "fuel_cost", "maintenance_cost", "total_expense"]
      };

    case "drivers":
      return {
        headers: [
          { label: "Full Name", key: "full_name" },
          { label: "License Number", key: "license_number" },
          { label: "Email", key: "email" },
          { label: "Contact Number", key: "contact_number" },
          { label: "Status", key: "status" },
          { label: "Safety Score", key: "safety_score" },
          { label: "Trip Count", key: "trip_count" },
          { label: "Total Distance (km)", key: "total_distance" },
          { label: "Fuel Consumption (L)", key: "fuel_consumption" }
        ],
        totalKeys: ["trip_count", "total_distance", "fuel_consumption"]
      };

    case "trips":
      return {
        headers: [
          { label: "Trip Number", key: "trip_number" },
          { label: "Vehicle", key: "vehicle_name" },
          { label: "Driver", key: "driver_name" },
          { label: "Source", key: "source" },
          { label: "Destination", key: "destination" },
          { label: "Actual Distance (km)", key: "actual_distance" },
          { label: "Fuel Consumed (L)", key: "fuel_consumed" },
          { label: "Status", key: "status" },
          { label: "Dispatch Date", key: "dispatch_date" },
          { label: "Completion Date", key: "completion_date" },
          { label: "Trip Cost ($)", key: "trip_cost" }
        ],
        totalKeys: ["actual_distance", "fuel_consumed", "trip_cost"]
      };

    case "fuel":
      return {
        headers: [
          { label: "Fuel Log Number", key: "fuel_log_number" },
          { label: "Fuel Station", key: "fuel_station" },
          { label: "Fuel Type", key: "fuel_type" },
          { label: "Liters", key: "liters" },
          { label: "Price/Liter ($)", key: "price_per_liter" },
          { label: "Total Cost ($)", key: "total_cost" },
          { label: "Efficiency (km/L)", key: "fuel_efficiency" },
          { label: "Fuel Date", key: "fuel_date" },
          { label: "Vehicle", key: "vehicle_number" },
          { label: "Trip Number", key: "trip_number" }
        ],
        totalKeys: ["liters", "total_cost", "fuel_efficiency"]
      };

    case "maintenance":
      return {
        headers: [
          { label: "Maintenance Number", key: "maintenance_number" },
          { label: "Maintenance Type", key: "maintenance_type" },
          { label: "Issue Title", key: "issue_title" },
          { label: "Actual Cost ($)", key: "actual_cost" },
          { label: "Status", key: "status" },
          { label: "Start Date", key: "start_date" },
          { label: "Completion Date", key: "completion_date" },
          { label: "Vehicle", key: "vehicle_number" }
        ],
        totalKeys: ["actual_cost"]
      };

    case "expenses":
      return {
        headers: [
          { label: "Expense Number", key: "expense_number" },
          { label: "Expense Type", key: "expense_type" },
          { label: "Title", key: "title" },
          { label: "Amount ($)", key: "amount" },
          { label: "Expense Date", key: "expense_date" },
          { label: "Payment Method", key: "payment_method" },
          { label: "Payment Status", key: "payment_status" },
          { label: "Vehicle", key: "vehicle_number" },
          { label: "Trip Number", key: "trip_number" }
        ],
        totalKeys: ["amount"]
      };

    default:
      throw new ApiError(400, "Invalid module name", "EXPORT_ERROR");
  }
};

const mapRowDetails = (moduleName, rows) => {
  return rows.map(row => {
    const flatRow = { ...row };
    if (moduleName === "trips") {
      flatRow.vehicle_name = row.vehicle?.vehicle_name || "";
      flatRow.driver_name = row.driver?.full_name || "";
    } else if (moduleName === "fuel") {
      flatRow.vehicle_number = row.vehicle?.registrationNumber || "";
      flatRow.trip_number = row.trip?.tripNumber || "";
    } else if (moduleName === "maintenance") {
      flatRow.vehicle_number = row.vehicle?.registrationNumber || "";
    } else if (moduleName === "expenses") {
      flatRow.vehicle_number = row.vehicle?.registrationNumber || "";
      flatRow.trip_number = row.trip?.tripNumber || "";
    }
    return flatRow;
  });
};

export const exportService = {
  exportReport: async (res, formatType, moduleName, query, user) => {
    let reportData;
    let title;

    switch (moduleName) {
      case "vehicles":
        reportData = await reportService.getVehicleReport(query);
        title = "Vehicles Report";
        break;
      case "drivers":
        reportData = await reportService.getDriverReport(query);
        title = "Drivers Report";
        break;
      case "trips":
        reportData = await reportService.getTripReport(query);
        title = "Trips Report";
        break;
      case "fuel":
        reportData = await reportService.getFuelReport(query);
        title = "Fuel Report";
        break;
      case "maintenance":
        reportData = await reportService.getMaintenanceReport(query);
        title = "Maintenance Report";
        break;
      case "expenses":
        reportData = await reportService.getExpenseReport(query);
        title = "Expenses Report";
        break;
      default:
        throw new ApiError(400, "Invalid module report name", "EXPORT_ERROR");
    }

    const { headers, totalKeys } = getHeadersAndTotals(moduleName);
    const flatRows = mapRowDetails(moduleName, reportData.data);

    // Format file name
    const timestamp = new Date().toISOString().split("T")[0];
    const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const filename = `${capitalizedModule}_Report_${timestamp}.${formatType}`;

    if (formatType === "csv") {
      streamCSV(res, filename, headers, flatRows);
    } else if (formatType === "excel") {
      await streamExcel(res, filename, title, headers, flatRows, totalKeys);
    } else if (formatType === "pdf") {
      const generatedBy = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "System Admin";
      generatePDFReport(res, filename, title, reportData.summary, headers, flatRows, totalKeys, generatedBy, query);
    } else {
      throw new ApiError(400, "Unsupported export format", "EXPORT_ERROR");
    }
  }
};
