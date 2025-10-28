const XLSX = require("xlsx");

function exportExcelFileClass(rows, keys) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Submited");
  XLSX.utils.sheet_add_aoa(worksheet, [keys], { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [["Lop 10/4"]], { origin: "A" + (rows.length + 2) });

  const colWidths = keys.map((key, index) => {
    if (key === "Ngày tháng năm sinh") return {};
    const maxLength = Math.max(
      key.length,
      ...rows.map((row) => {
        const rowKeys = Object.keys(row);
        return row[rowKeys[index]]?.toString().length || 0;
      })
    );
    return { wch: maxLength + 2 };
  });

  worksheet["!cols"] = colWidths;
  worksheet["!merges"] = [XLSX.utils.decode_range("A" + (rows.length + 2) + ":I" + (rows.length + 2)), XLSX.utils.decode_range("D1:F1")];

  // tra ve doi tuong buffer tu file
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = { exportExcelFileClass };
