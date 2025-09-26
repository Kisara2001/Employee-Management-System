import ExcelJS from 'exceljs';

export type ColumnDef = { header: string; key: string; width?: number };

export async function buildExcelBuffer(
  columns: ColumnDef[],
  rows: Record<string, any>[],
  sheetName = 'Report'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 20 }));
  rows.forEach((r) => sheet.addRow(r));

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' } as any;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF2F5' },
    } as any;
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    } as any;
  });

  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
  return Buffer.from(buffer);
}

export function sendExcel(res: import('express').Response, filename: string, buffer: Buffer) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}

