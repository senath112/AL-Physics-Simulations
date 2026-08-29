export interface DataColumn {
  key: string;
  label: string;
  unit?: string;
}

export type DataRow = Record<string, number | string>;

export interface PracticalReportContent {
  objective: string;
  theoryLatex: string;
  apparatus: string[];
  method: string;
  precautions: string[];
  conclusion: string;
}

export interface GraphConfig {
  xAxis: string;
  yAxis: string;
  title: string;
  showRegression: boolean;
}

export type PracticalCategory = 'mechanics' | 'waves' | 'electricity' | 'magnetism' | 'thermal' | 'modern' | 'optics' | 'fields';

export interface LaboratoryPractical {
  id: string;
  userId: string;
  title: string;
  simulationId: string;
  simulationTitle: string;
  category: PracticalCategory;
  createdAt: string;
  updatedAt: string;
  columns: DataColumn[];
  data: DataRow[];
  notes: string;
  diagramUrl?: string;
  diagramKey?: string;
  report?: PracticalReportContent;
  graphConfig?: GraphConfig;
}

export interface PracticalQuota {
  used: number;
  max: number;
  available: number;
  isFull: boolean;
}

export interface LaboratoryContextType {
  practicals: LaboratoryPractical[];
  activePractical: LaboratoryPractical | null;
  quota: PracticalQuota;
  savePractical: (params: {
    title: string;
    simulationId: string;
    simulationTitle: string;
    category?: PracticalCategory;
    columns: DataColumn[];
    data: DataRow[];
    notes?: string;
    report?: Partial<PracticalReportContent>;
    graphConfig?: Partial<GraphConfig>;
  }) => Promise<LaboratoryPractical>;
  updatePractical: (id: string, updates: Partial<LaboratoryPractical>) => Promise<void>;
  deletePractical: (id: string) => Promise<void>;
  setActivePractical: (practical: LaboratoryPractical | null) => void;
  getPractical: (id: string) => LaboratoryPractical | undefined;
  uploadDiagramToR2: (file: File, practicalId: string) => Promise<{ url: string; key: string }>;
}
