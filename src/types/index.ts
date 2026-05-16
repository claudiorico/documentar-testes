export type TestStatus = 'Aprovado' | 'Reprovado';

export interface TestImage {
  id: string;
  dataUrl: string;
  caption?: string;
  timestamp: number;
}

export interface TestStep {
  id: string;
  description: string;
  expectedResult: string;
  status: TestStatus;
  actualResult?: string;
  images: TestImage[];
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  inputData?: string;
  steps: TestStep[];
}

export interface ExcelTemplateConfig {
  file: File | null;
  startRow: number;
  idCol: string;
  titleCol: string;
  stepDescCol: string;
  stepExpectedCol: string;
  stepStatusCol: string;
  stepActualCol: string;
  imageCol: string;
}
