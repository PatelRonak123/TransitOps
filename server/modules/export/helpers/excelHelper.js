import ExcelJS from "exceljs";

export const streamExcel = async (res, filename, reportTitle, headers, rows, totalKeys = []) => {
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportTitle.substring(0, 31)); // excel sheet title max length 31

  // 1. Add Report Title Row
  const titleRow = worksheet.addRow([reportTitle]);
  titleRow.font = { size: 16, bold: true, color: { argb: "FF1B365D" } };
  worksheet.addRow([]); // Blank spacing row

  // 2. Add Table Headers
  const headerLabels = headers.map(h => h.label);
  const headerRow = worksheet.addRow(headerLabels);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1B365D" }
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 3. Add Rows
  for (const row of rows) {
    const values = headers.map(h => {
      const val = row[h.key];
      if (val instanceof Date) {
        return val.toISOString().split("T")[0];
      }
      return val !== null && val !== undefined ? val : "";
    });
    worksheet.addRow(values);
  }

  // 4. Append Grand Totals Row
  if (totalKeys.length > 0) {
    const totalRowValues = headers.map((h, index) => {
      if (index === 0) return "Grand Total";
      if (totalKeys.includes(h.key)) {
        let sum = 0;
        for (const row of rows) {
          sum += Number(row[h.key] || 0);
        }
        return Number(sum.toFixed(2));
      }
      return "";
    });
    const totalRow = worksheet.addRow(totalRowValues);
    totalRow.font = { bold: true };
    totalRow.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "double" }
      };
    });
  }

  // 5. Auto adjust column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 12 ? 12 : maxLength + 3;
  });

  await workbook.xlsx.write(res);
  res.end();
};
