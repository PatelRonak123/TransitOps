import { format } from "fast-csv";

export const streamCSV = (res, filename, headers, rows) => {
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "text/csv");

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for (const row of rows) {
    const rowData = {};
    for (const h of headers) {
      rowData[h.label] = row[h.key] !== null && row[h.key] !== undefined ? row[h.key] : "";
    }
    csvStream.write(rowData);
  }

  csvStream.end();
};
