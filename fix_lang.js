const fs = require('fs');
const path = require('path');

const typesPath = path.join('src', 'types', 'index.ts');
let typesStr = fs.readFileSync(typesPath, 'utf8');
typesStr = typesStr.replace(/export type TestStatus = .*?;/, "export type TestStatus = 'Pendente' | 'Aprovado' | 'Falhou' | 'Bloqueado' | 'Ignorado';");
fs.writeFileSync(typesPath, typesStr, 'utf8');

const storePath = path.join('src', 'store', 'useTestStore.ts');
let storeStr = fs.readFileSync(storePath, 'utf8');
storeStr = storeStr.replace(/'Pending'/g, "'Pendente'");
fs.writeFileSync(storePath, storeStr, 'utf8');

const dashPath = path.join('src', 'components', 'Dashboard.tsx');
let dashStr = fs.readFileSync(dashPath, 'utf8');
dashStr = dashStr.replace(/'Pending'/g, "'Pendente'");
dashStr = dashStr.replace(/EvidÃªnc/g, "Evidênc");
dashStr = dashStr.replace(/CondiÃ§Ã£o/g, "Condição");
dashStr = dashStr.replace(/DescriÃ§Ã£o/g, "Descrição");
dashStr = dashStr.replace(/Passo Ãšnico/g, "Passo Único");
dashStr = dashStr.replace(/TÃ­tulo/g, "Título");
fs.writeFileSync(dashPath, dashStr, 'utf8');

const runnerPath = path.join('src', 'components', 'TestCaseRunner.tsx');
let runnerStr = fs.readFileSync(runnerPath, 'utf8');
runnerStr = runnerStr.replace(/ObservaÃ§Ãµes/g, "Observações");
runnerStr = runnerStr.replace(/TÃ­tulo/g, "Título");
runnerStr = runnerStr.replace(/DescriÃ§Ã£o/g, "Descrição");
runnerStr = runnerStr.replace(/EvidÃªncia/g, "Evidência");
runnerStr = runnerStr.replace(/case 'Passed':/g, "case 'Aprovado':");
runnerStr = runnerStr.replace(/case 'Failed':/g, "case 'Falhou':");
runnerStr = runnerStr.replace(/case 'Blocked':/g, "case 'Bloqueado':");
runnerStr = runnerStr.replace(/case 'Skipped':/g, "case 'Ignorado':");
runnerStr = runnerStr.replace(/const statuses: TestStatus\[\] = \['Pending', 'Passed', 'Failed', 'Blocked', 'Skipped'\];/g, "const statuses: TestStatus[] = ['Pendente', 'Aprovado', 'Falhou', 'Bloqueado', 'Ignorado'];");
fs.writeFileSync(runnerPath, runnerStr, 'utf8');

const cssPath = path.join('src', 'index.css');
let cssStr = fs.readFileSync(cssPath, 'utf8');
cssStr = cssStr.replace(/\.status-Passed/g, ".status-Aprovado");
cssStr = cssStr.replace(/\.status-Failed/g, ".status-Falhou");
cssStr = cssStr.replace(/\.status-Blocked/g, ".status-Bloqueado");
cssStr = cssStr.replace(/\.status-Pending/g, ".status-Pendente");
cssStr = cssStr.replace(/\.status-Skipped/g, ".status-Ignorado");
fs.writeFileSync(cssPath, cssStr, 'utf8');

const excelPath = path.join('src', 'utils', 'excelGenerator.ts');
let excelStr = fs.readFileSync(excelPath, 'utf8');
excelStr = excelStr.replace(/EvidÃªnc/g, "Evidênc");
excelStr = excelStr.replace(/CondiÃ§Ãµes/g, "Condições");
excelStr = excelStr.replace(/EvidÃªncia/g, "Evidência");
fs.writeFileSync(excelPath, excelStr, 'utf8');

console.log('Language and encoding fixes applied!');
