import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  LaboratoryPractical, 
  LaboratoryContextType, 
  PracticalQuota, 
  DataColumn, 
  DataRow, 
  PracticalReportContent, 
  GraphConfig 
} from '../types/laboratory';

const MAX_PRACTICALS = 10;
const LaboratoryContext = createContext<LaboratoryContextType | null>(null);

export const LaboratoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [practicals, setPracticals] = useState<LaboratoryPractical[]>([]);
  const [activePractical, setActivePractical] = useState<LaboratoryPractical | null>(null);

  const storageKey = user ? `physics_practicals_${user.id}` : 'physics_practicals_guest';

  // Load practicals on auth change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPracticals(JSON.parse(stored));
      } else {
        setPracticals([]);
      }
    } catch (_e) {
      setPracticals([]);
    }
  }, [storageKey]);

  // Persist practicals helper
  const persistPracticals = useCallback((newPracticals: LaboratoryPractical[]) => {
    setPracticals(newPracticals);
    localStorage.setItem(storageKey, JSON.stringify(newPracticals));
  }, [storageKey]);

  // Quota calculation
  const quota: PracticalQuota = {
    used: practicals.length,
    max: MAX_PRACTICALS,
    available: Math.max(0, MAX_PRACTICALS - practicals.length),
    isFull: practicals.length >= MAX_PRACTICALS,
  };

  // Save new practical
  const savePractical = useCallback(async (params: {
    title: string;
    simulationId: string;
    simulationTitle: string;
    category?: 'mechanics' | 'waves' | 'electricity' | 'magnetism' | 'thermal' | 'modern';
    columns: DataColumn[];
    data: DataRow[];
    notes?: string;
    report?: Partial<PracticalReportContent>;
    graphConfig?: Partial<GraphConfig>;
  }): Promise<LaboratoryPractical> => {
    if (practicals.length >= MAX_PRACTICALS) {
      throw new Error(
        `Storage quota exceeded. Each account is limited to ${MAX_PRACTICALS} saved practicals. Please delete an older experiment to save a new one.`
      );
    }

    const now = new Date().toISOString();
    const newId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Default graph configuration if columns available
    const xCol = params.columns[0]?.key || 'trial';
    const yCol = params.columns[1]?.key || params.columns[0]?.key || 'value';

    const defaultReport: PracticalReportContent = {
      objective: `Investigate the relationship between experimental variables in ${params.simulationTitle}.`,
      theoryLatex: '',
      apparatus: [params.simulationTitle, 'Simulation Virtual Sensors', 'Data Recorder'],
      method: 'Adjusted independent variable across multiple trials and recorded corresponding response readings.',
      precautions: ['Ensure systematic calibration before measurement', 'Maintain constant environmental parameters'],
      conclusion: `Experimental data collected with ${params.data.length} recorded observations.`,
      ...params.report,
    };

    const newPractical: LaboratoryPractical = {
      id: newId,
      userId: user?.id || 'guest_user',
      title: params.title || `${params.simulationTitle} Practical Trial`,
      simulationId: params.simulationId,
      simulationTitle: params.simulationTitle,
      category: params.category || 'mechanics',
      createdAt: now,
      updatedAt: now,
      columns: params.columns,
      data: params.data,
      notes: params.notes || '',
      report: defaultReport,
      graphConfig: {
        xAxis: xCol,
        yAxis: yCol,
        title: `${params.title || params.simulationTitle} Graph Analysis`,
        showRegression: true,
        ...params.graphConfig,
      },
    };

    const updated = [newPractical, ...practicals];
    persistPracticals(updated);
    setActivePractical(newPractical);
    return newPractical;
  }, [practicals, user, persistPracticals]);

  // Update existing practical
  const updatePractical = useCallback(async (id: string, updates: Partial<LaboratoryPractical>) => {
    const updated = practicals.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    persistPracticals(updated);
    if (activePractical?.id === id) {
      setActivePractical(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  }, [practicals, activePractical, persistPracticals]);

  // Delete practical
  const deletePractical = useCallback(async (id: string) => {
    const practicalToDelete = practicals.find(p => p.id === id);
    
    // If practical had an R2 diagram, attempt cleanup
    if (practicalToDelete?.diagramKey && isAuthenticated) {
      try {
        await fetch('/api/r2/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key: practicalToDelete.diagramKey }),
        });
      } catch (_e) {
        // Non-blocking cleanup
      }
    }

    const updated = practicals.filter(p => p.id !== id);
    persistPracticals(updated);
    if (activePractical?.id === id) {
      setActivePractical(null);
    }
  }, [practicals, activePractical, isAuthenticated, persistPracticals]);

  // Get practical by ID
  const getPractical = useCallback((id: string) => {
    return practicals.find(p => p.id === id);
  }, [practicals]);

  // Cloudflare R2 Diagram Upload
  const uploadDiagramToR2 = useCallback(async (file: File, practicalId: string): Promise<{ url: string; key: string }> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to upload apparatus diagrams to Cloudflare R2 cloud storage.');
    }

    // 1. Request presigned PUT URL from backend
    const presignRes = await fetch('/api/r2/presign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        labId: practicalId,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
        category: 'diagrams',
      }),
    });

    if (!presignRes.ok) {
      const err = await presignRes.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to acquire presigned upload URL.');
    }

    const { uploadUrl, key } = await presignRes.json();

    // 2. Direct upload to Cloudflare R2
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to Cloudflare R2 storage.');
    }

    // 3. Request presigned GET URL for viewing
    const getRes = await fetch('/api/r2/presign-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ key, expiresInSeconds: 86400 }), // 24hr view token
    });

    let downloadUrl = uploadUrl.split('?')[0]; // fallback base URL
    if (getRes.ok) {
      const getData = await getRes.json();
      downloadUrl = getData.downloadUrl;
    }

    // Update practical with diagram metadata
    await updatePractical(practicalId, {
      diagramUrl: downloadUrl,
      diagramKey: key,
    });

    return { url: downloadUrl, key };
  }, [isAuthenticated, updatePractical]);

  const value: LaboratoryContextType = {
    practicals,
    activePractical,
    quota,
    savePractical,
    updatePractical,
    deletePractical,
    setActivePractical,
    getPractical,
    uploadDiagramToR2,
  };

  return <LaboratoryContext.Provider value={value}>{children}</LaboratoryContext.Provider>;
};

export const useLaboratory = (): LaboratoryContextType => {
  const context = useContext(LaboratoryContext);
  if (!context) {
    throw new Error('useLaboratory must be used within a LaboratoryProvider');
  }
  return context;
};
