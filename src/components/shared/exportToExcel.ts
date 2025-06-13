import * as XLSX from 'xlsx';

export function exportToExcel({
  data,
  fileName = 'reporte.xlsx',
  sheetName = 'Sheet1',
  headers = []
}: {
  data: any[],
  fileName?: string,
  sheetName?: string,
  headers?: string[]
}) {
  const wsData = headers.length > 0 ? [headers, ...data] : data;
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
