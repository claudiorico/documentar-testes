import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import type { TestCase, TestStep, TestStatus, TestImage, ExcelTemplateConfig } from '../types';

const idbStorage: StateStorage = {
  getItem: async (name) => { return (await get(name)) || null; },
  setItem: async (name, value) => { await set(name, value); },
  removeItem: async (name) => { await del(name); },
};

interface TestStore {
  testCases: TestCase[];
  templateConfig: ExcelTemplateConfig | null;
  setTemplateConfig: (config: ExcelTemplateConfig | null) => void;
  addTestCase: (testCase: Omit<TestCase, 'id'>) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  addTestStep: (testCaseId: string, step: Omit<TestStep, 'id' | 'images' | 'status'>) => void;
  updateTestStep: (testCaseId: string, stepId: string, updates: Partial<TestStep>) => void;
  deleteTestStep: (testCaseId: string, stepId: string) => void;
  addStepImage: (testCaseId: string, stepId: string, dataUrl: string) => void;
  removeStepImage: (testCaseId: string, stepId: string, imageId: string) => void;
  importTestCases: (cases: TestCase[]) => void;
  clearAll: () => void;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      testCases: [],
      templateConfig: null,
      setTemplateConfig: (config) => set({ templateConfig: config }),
      addTestCase: (testCase) =>
        set((state) => ({ testCases: [...state.testCases, { ...testCase, id: uuidv4() }] })),
      updateTestCase: (id, updates) =>
        set((state) => ({ testCases: state.testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)) })),
      deleteTestCase: (id) =>
        set((state) => ({ testCases: state.testCases.filter((tc) => tc.id !== id) })),
      addTestStep: (testCaseId, step) =>
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id === testCaseId) return { ...tc, steps: [...tc.steps, { ...step, id: uuidv4(), images: [], status: 'Pendente' }] };
            return tc;
          })
        })),
      updateTestStep: (testCaseId, stepId, updates) =>
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id === testCaseId) return { ...tc, steps: tc.steps.map((s) => s.id === stepId ? { ...s, ...updates } : s) };
            return tc;
          })
        })),
      deleteTestStep: (testCaseId, stepId) =>
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id === testCaseId) return { ...tc, steps: tc.steps.filter((s) => s.id !== stepId) };
            return tc;
          })
        })),
      addStepImage: (testCaseId, stepId, dataUrl) =>
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id === testCaseId) return { ...tc, steps: tc.steps.map((s) => {
              if (s.id === stepId) return { ...s, images: [...s.images, { id: uuidv4(), dataUrl, timestamp: Date.now() }] };
              return s;
            }) };
            return tc;
          })
        })),
      removeStepImage: (testCaseId, stepId, imageId) =>
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id === testCaseId) return { ...tc, steps: tc.steps.map((s) => {
              if (s.id === stepId) return { ...s, images: s.images.filter((i) => i.id !== imageId) };
              return s;
            }) };
            return tc;
          })
        })),
      importTestCases: (cases) => set({ testCases: cases }),
      clearAll: () => set({ testCases: [] }),
    }),
    {
      name: 'test-doc-storage',
      storage: createJSONStorage(() => idbStorage)
    }
  )
);
