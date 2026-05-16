import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { TestCase } from '../types';

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 600, height: 400 });
    img.src = dataUrl;
  });
}

function setCellPreservingStyle(cell: ExcelJS.Cell, value: ExcelJS.CellValue) {
  const style = JSON.parse(JSON.stringify(cell.style));
  cell.value = value;
  cell.style = style;
}

function copyRowStyle(sourceRow: ExcelJS.Row, targetRow: ExcelJS.Row) {
  for (let col = 1; col <= 7; col++) {
    targetRow.getCell(col).style = JSON.parse(JSON.stringify(sourceRow.getCell(col).style));
  }
}

function applyStatusColor(cell: ExcelJS.Cell, status: string) {
  if (status === 'Aprovado') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    cell.font = { ...cell.font, color: { argb: 'FF276221' }, bold: true };
  } else if (status === 'Reprovado') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
    cell.font = { ...cell.font, color: { argb: 'FF9C0006' }, bold: true };
  }
}

export const exportToExcel = async (testCases: TestCase[]) => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}template.xlsx`);
    if (!response.ok) {
      alert("Template template.xlsx não encontrado na pasta public. Verifique se o arquivo existe.");
      return;
    }
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets.find(w => w.name.includes('Evidênc') || w.name.includes('Evidenc'));

    if (!worksheet) {
      alert("Não foi possível encontrar a aba 'Evidências' no template.");
      return;
    }

    let currentRow = 2;
    let testConditionNumber = 1;

    const imagesToDraw: Array<{ label: string, dataUrl: string, caption?: string }> = [];

    const templateRow = worksheet.getRow(2);

    for (const tc of testCases) {
      let allImages: any[] = [];
      for (const step of tc.steps) {
        if (step.images) allImages.push(...step.images);
      }

      let evidenceStr = "";
      if (allImages.length > 0) {
        const evRefs = [];
        for (let i = 0; i < allImages.length; i++) {
          const evLabel = testConditionNumber + "." + i;
          evRefs.push(evLabel);
          imagesToDraw.push({ label: evLabel, dataUrl: allImages[i].dataUrl, caption: allImages[i].caption });
        }
        evidenceStr = evRefs.join(' / ');
      }

      const desc = tc.title + (tc.steps.length > 1 ? ' - Vários passos' : (' - ' + tc.steps[0].description));
      const expected = tc.steps.map(s => s.expectedResult).join('\n');

      let status = tc.steps[0]?.status || 'Aprovado';
      const isReprovado = tc.steps.some(s => s.status === 'Reprovado');
      if (isReprovado) status = 'Reprovado';
      const actual = tc.steps.map(s => s.actualResult).filter(Boolean).join('\n');

      const row = worksheet.getRow(currentRow);
      if (currentRow > 2) copyRowStyle(templateRow, row);
      setCellPreservingStyle(row.getCell(1), testConditionNumber);
      setCellPreservingStyle(row.getCell(2), desc);
      setCellPreservingStyle(row.getCell(3), tc.inputData || '');
      setCellPreservingStyle(row.getCell(4), expected);
      setCellPreservingStyle(row.getCell(5), status);
      applyStatusColor(row.getCell(5), status);
      setCellPreservingStyle(row.getCell(6), evidenceStr);
      setCellPreservingStyle(row.getCell(7), actual);

      const maxLines = Math.max(
        expected.split('\n').length,
        (actual || '').split('\n').length,
        1
      );
      row.height = Math.max(templateRow.height || 30, maxLines * 18);

      row.commit();

      testConditionNumber++;
      currentRow++;
    }

    currentRow += 1;
    try { worksheet.mergeCells(currentRow, 1, currentRow, 6); } catch {}
    const headerCell = worksheet.getRow(currentRow).getCell(1);
    headerCell.value = "Evidências das condições de teste";
    headerCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000CC' } };
    headerCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(currentRow).height = 22;
    currentRow += 2;

    for (const imgData of imagesToDraw) {
      worksheet.getRow(currentRow).getCell(1).value = imgData.label;
      worksheet.getRow(currentRow).getCell(1).font = { bold: true };
      currentRow++;

      if (imgData.caption) {
        worksheet.getRow(currentRow).getCell(1).value = imgData.caption;
        currentRow++;
      }

      try {
        const base64Data = imgData.dataUrl.split(';base64,').pop();
        if (base64Data) {
          const imageId = workbook.addImage({
            base64: base64Data,
            extension: imgData.dataUrl.includes('png') ? 'png' : 'jpeg',
          });

          const maxWidth = 600;
          const dims = await getImageDimensions(imgData.dataUrl);
          const height = Math.round(maxWidth * (dims.height / dims.width));

          worksheet.addImage(imageId, {
            tl: { col: 0, row: currentRow - 1 },
            ext: { width: maxWidth, height }
          });

          currentRow += Math.ceil(height / 20) + 2;
        }
      } catch (e) {
        console.error('Error adding image to excel:', e);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, "Relatorio_Testes_" + new Date().getTime() + ".xlsx");
  } catch (error) {
    console.error(error);
    alert("Erro ao exportar o Excel. Verifique o console.");
  }
};
