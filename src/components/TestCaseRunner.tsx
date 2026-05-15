import React, { useState, useCallback, useEffect } from 'react';
import { useTestStore } from '../store/useTestStore';
import type { TestStep, TestStatus } from '../types';
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, Upload, X, Plus } from 'lucide-react';

export const TestCaseRunner: React.FC<{ testCaseId: string }> = ({ testCaseId }) => {
  const testCase = useTestStore((state) => 
    state.testCases.find((tc) => tc.id === testCaseId)
  );
  
  const { updateTestStep, addStepImage, updateStepImage, removeStepImage, addTestStep, updateTestCase } = useTestStore();

  if (!testCase) return null;

  const handlePaste = useCallback((e: globalThis.ClipboardEvent, stepId: string) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              addStepImage(testCase.id, stepId, event.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, [addStepImage, testCase.id]);

  useEffect(() => {
    const pasteHandler = (e: globalThis.ClipboardEvent) => {
      // Find the currently active step based on focus or hover, or just attach to the first step if nothing is selected.
      // For simplicity in this demo, if a user pastes while hovering over a paste area, we handle it there.
    };
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, []);

  const StatusIcon = ({ status }: { status: TestStatus }) => {
    switch (status) {
      case 'Aprovado': return <CheckCircle size={18} className="text-success" />;
      case 'Reprovado': return <XCircle size={18} className="text-danger" />;
      case 'Bloqueado': return <AlertTriangle size={18} className="text-warning" />;
      case 'Ignorado': return <MinusCircle size={18} className="text-muted" />;
      default: return <MinusCircle size={18} className="text-muted" />;
    }
  };

  const StatusSelector = ({ step }: { step: TestStep }) => {
    const statuses: TestStatus[] = ['Pendente', 'Aprovado', 'Reprovado', 'Bloqueado', 'Ignorado'];
    return (
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => updateTestStep(testCase.id, step.id, { status: s })}
            className={`status-badge status-${s}`}
            style={{ opacity: step.status === s ? 1 : 0.4, cursor: 'pointer', border: 'none' }}
          >
            {s}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel test-case-card">
      <input 
        type="text" 
        value={testCase.title} 
        onChange={(e) => updateTestCase(testCase.id, { title: e.target.value })}
        style={{ fontSize: '2rem', fontWeight: 600, background: 'transparent', border: 'none', borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem', padding: '0.5rem 0', width: '100%' }}
        placeholder="Título do Caso de Teste"
      />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-sm text-muted">Dados de Entrada</label>
        <textarea
          value={testCase.inputData || ''}
          onChange={(e) => updateTestCase(testCase.id, { inputData: e.target.value })}
          style={{ marginTop: '0.25rem', width: '100%', resize: 'vertical' }}
          rows={2}
          placeholder="Dados utilizados como entrada para este caso de teste..."
        />
      </div>

      {testCase.steps.map((step, index) => (
        <div key={step.id} className="step-card">
          <div className="flex justify-between items-center mb-4">
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <span className="text-muted" style={{ fontWeight: 600, marginRight: '0.5rem' }}>Passo {index + 1}:</span>
              <input 
                type="text"
                value={step.description}
                onChange={(e) => updateTestStep(testCase.id, step.id, { description: e.target.value })}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0', width: '80%' }}
                placeholder="Descrição do Passo"
              />
            </div>
            <StatusSelector step={step} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted">Resultado Esperado</label>
              <textarea 
                value={step.expectedResult}
                onChange={(e) => updateTestStep(testCase.id, step.id, { expectedResult: e.target.value })}
                style={{ marginTop: '0.25rem', width: '100%' }}
                rows={2}
                placeholder="O que deve acontecer..."
              />
            </div>
            <div>
              <label className="text-sm text-muted">Resultado Atual / Observações</label>
              <textarea
                value={step.actualResult || ''}
                onChange={(e) => updateTestStep(testCase.id, step.id, { actualResult: e.target.value })}
                placeholder="Descreva o que aconteceu..."
                rows={2}
                style={{ marginTop: '0.25rem' }}
              />
            </div>
          </div>

          <div 
            className="paste-area"
            onPaste={(e) => handlePaste(e as any, step.id)}
            tabIndex={0}
          >
            <Upload size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p>Clique aqui e pressione <strong>Ctrl+V</strong> para colar uma imagem</p>
            <p className="text-sm text-muted">Ou clique para fazer upload manual (em breve)</p>
          </div>

          {step.images.length > 0 && (
            <div className="image-preview-container">
              {step.images.map((img) => (
                <div key={img.id} className="image-preview">
                  <img src={img.dataUrl} alt="Evidência" />
                  <input
                    type="text"
                    value={img.caption || ''}
                    onChange={(e) => updateStepImage(testCase.id, step.id, img.id, { caption: e.target.value })}
                    placeholder="Descrição da evidência..."
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', width: '100%' }}
                  />
                  <button
                    className="delete-btn"
                    onClick={() => removeStepImage(testCase.id, step.id, img.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button 
        className="btn btn-outline mt-4"
        onClick={() => addTestStep(testCase.id, { description: 'Novo passo', expectedResult: 'Esperado' })}
      >
        <Plus size={18} /> Adicionar Passo
      </button>
    </div>
  );
};
