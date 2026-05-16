import React, { useState, useRef } from 'react';
import { useTestStore } from '../store/useTestStore';
import { TestCaseRunner } from './TestCaseRunner';
import { Plus, Download, FolderOpen, Trash2, Upload } from 'lucide-react';
import { exportToExcel } from '../utils/excelGenerator';
import { v4 as uuidv4 } from 'uuid';
import ExcelJS from 'exceljs';

export const Dashboard: React.FC = () => {
  const { testCases, addTestCase, deleteTestCase, clearAll } = useTestStore();
  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTestCase = () => {
    addTestCase({
      title: 'Novo Caso de Teste',
      description: 'Descrição do caso de teste',
      steps: [
        {
          id: uuidv4(),
          description: 'Passo 1',
          expectedResult: 'Resultado Esperado',
          status: 'Aprovado',
          images: []
        }
      ]
    });
  };

  const handleExport = () => {
    exportToExcel(testCases);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets.find(w => w.name.includes('Evidênc') || w.name.includes('Evidenc'));
      if (!worksheet) {
        alert('Aba de Evidências não encontrada na planilha importada!');
        return;
      }

      if (confirm('Deseja limpar os testes atuais antes de importar?')) {
        clearAll();
        setActiveTestCaseId(null);
      }

      let currentRow = 2;

      while (currentRow < 500) {
        const row = worksheet.getRow(currentRow);
        const condition = row.getCell(2).value?.toString() || '';
        const inputData = row.getCell(3).value?.toString() || '';
        const expected = row.getCell(4).value?.toString() || '';

        if (!condition && !inputData && !expected) {
          let lookAheadEmpty = true;
          for(let i=1; i<=3; i++) {
            const nextRow = worksheet.getRow(currentRow + i);
            if (nextRow.getCell(2).value || nextRow.getCell(4).value) { lookAheadEmpty = false; break; }
          }
          if (lookAheadEmpty) break;
        } else if (condition || inputData || expected) {
          if (!condition.includes('Evidências das condições')) {
            addTestCase({
              title: condition || ('Teste Linha ' + currentRow),
              description: '',
              inputData: inputData || '',
              steps: [
                {
                  id: uuidv4(),
                  description: 'Passo Único',
                  expectedResult: expected || 'N/A',
                  status: 'Aprovado',
                  images: []
                }
              ]
            });
          }
        }
        currentRow++;
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao importar arquivo.');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Documentação de Testes</h1>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".xlsx" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Importar Excel
          </button>
          <button className="btn btn-primary" onClick={handleAddTestCase}>
            <Plus size={18} /> Novo Teste
          </button>
          <button className="btn btn-outline" onClick={handleExport} disabled={testCases.length === 0}>
            <Download size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <h2 className="text-xl mb-4" style={{ fontSize: '1.25rem' }}>Casos de Teste</h2>
          {testCases.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Nenhum teste cadastrado.</p>
            </div>
          ) : (
            <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
              {testCases.map((tc) => (
                <div 
                  key={tc.id} 
                  className="flex justify-between items-center"
                  style={{ 
                    background: activeTestCaseId === tc.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: activeTestCaseId === tc.id ? '1px solid var(--primary-hover)' : '1px solid transparent'
                  }}
                  onClick={() => setActiveTestCaseId(tc.id)}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }}>
                    <div style={{ fontWeight: 600 }}>{tc.title}</div>
                    <div className="text-sm" style={{ opacity: 0.8 }}>{tc.steps.length} passo(s)</div>
                  </div>
                  <button 
                    className="btn-icon" 
                    style={{ color: activeTestCaseId === tc.id ? 'rgba(255,255,255,0.8)' : '' }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      deleteTestCase(tc.id); 
                      if(activeTestCaseId === tc.id) setActiveTestCaseId(null); 
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {activeTestCaseId ? (
            <TestCaseRunner testCaseId={activeTestCaseId} />
          ) : (
            <div className="glass-panel empty-state">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Selecione ou crie um caso de teste</h3>
              <p>Os detalhes e a execução do teste aparecerão aqui.</p>
              <p className="text-sm text-muted mt-4">Dica: Selecione um passo e pressione Ctrl+V para colar evidências (prints) rapidamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
