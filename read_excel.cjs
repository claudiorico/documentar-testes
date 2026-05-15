const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile('c:/Users/User/Projetos/Documentar Testes/template/UT_[ID-RICEFW_(NOME).xlsx').then(() => {
  console.log('Sheets:');
  workbook.worksheets.forEach(ws => console.log('-', ws.name));
  const ev = workbook.worksheets.find(w => w.name.toLowerCase().includes('evidencia') || w.name.toLowerCase().includes('evidência') || w.name.toLowerCase().includes('evidencia'));
  if (ev) {
    console.log('Found sheet:', ev.name);
    for(let i=1; i<=15; i++) {
       console.log('Row ' + i + ':', JSON.stringify(ev.getRow(i).values));
    }
  } else {
    console.log('No sheet with name like "evidencia" found.');
  }
}).catch(e => console.error(e));
