import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type SystemHealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface SimulationFailureDetails {
  simulator: string;
  test: string;
  expected: number | string;
  actual: number | string;
  error?: number;
  reason?: string;
}

export interface SimulationHealthContextType {
  isHealthLow: boolean;
  overallStatus: SystemHealthStatus;
  httpStatus: number | null;
  simResults: Record<string, 'pass' | 'fail'>;
  failure?: SimulationFailureDetails;
  lastChecked: Date | null;
  isUpdateNoteOpen: boolean;
  openUpdateNote: () => void;
  closeUpdateNote: () => void;
  recheckHealth: () => Promise<void>;
  testHealthOverride: 'auto' | 'low' | 'healthy';
  setTestHealthOverride: (override: 'auto' | 'low' | 'healthy') => void;
}

const SimulationHealthContext = createContext<SimulationHealthContextType | null>(null);

export const SimulationHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simResults, setSimResults] = useState<Record<string, 'pass' | 'fail'>>({});
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [overallStatus, setOverallStatus] = useState<SystemHealthStatus>('healthy');
  const [failure, setFailure] = useState<SimulationFailureDetails | undefined>(undefined);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isUpdateNoteOpen, setIsUpdateNoteOpen] = useState<boolean>(false);

  // Test override state (from localStorage or URL query)
  const [testHealthOverride, setTestHealthOverrideState] = useState<'auto' | 'low' | 'healthy'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('health') || params.get('sim_health');
      if (urlParam === 'low') return 'low';
      if (urlParam === 'healthy') return 'healthy';

      const stored = localStorage.getItem('physics_health_override');
      if (stored === 'low' || stored === 'healthy') return stored;
    }
    return 'auto';
  });

  const setTestHealthOverride = useCallback((override: 'auto' | 'low' | 'healthy') => {
    setTestHealthOverrideState(override);
    if (typeof window !== 'undefined') {
      if (override === 'auto') {
        localStorage.removeItem('physics_health_override');
      } else {
        localStorage.setItem('physics_health_override', override);
      }
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    const candidateUrls = [
      '/api/health/simulations',
      'https://physicsfromsenath.slhosted.lk/api/health/simulations',
    ];

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        const status = response.status;
        setHttpStatus(status);

        let data: any = null;
        try {
          data = await response.json();
        } catch {
          continue;
        }

        const simMap = data && typeof data.simulations === 'object' ? data.simulations : {};
        setSimResults(simMap);
        setFailure(data?.failure);
        setLastChecked(new Date());

        if (status === 200 && data.status === 'healthy') {
          const hasFailure = Object.values(simMap).some((v) => v === 'fail');
          setOverallStatus(hasFailure ? 'degraded' : 'healthy');
        } else if (status === 503 || data.status === 'unhealthy') {
          const passCount = Object.values(simMap).filter((v) => v === 'pass').length;
          setOverallStatus(passCount > 0 ? 'degraded' : 'down');
        } else {
          setOverallStatus('unknown');
        }
        return;
      } catch (_err) {
        // Fallback to next candidate URL
      }
    }
  }, []);

  // Periodic health check (every 60s)
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Compute effective low health condition
  const isHealthLow = useMemo(() => {
    if (testHealthOverride === 'low') return true;
    if (testHealthOverride === 'healthy') return false;

    // Check if any query param forces low health
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('health') === 'low' || params.get('low_health') === '1' || params.get('sim_health') === 'low') {
        return true;
      }
    }

    return (
      overallStatus === 'degraded' ||
      overallStatus === 'down' ||
      httpStatus === 503 ||
      Object.values(simResults).some((res) => res === 'fail')
    );
  }, [testHealthOverride, overallStatus, httpStatus, simResults]);

  // Auto-open update note on system home page on initial load (once per session) and whenever low health occurs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyDismissed = sessionStorage.getItem('physics_release_note_dismissed_v4') === 'true';
      if (!alreadyDismissed) {
        setIsUpdateNoteOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isHealthLow) {
      setIsUpdateNoteOpen(true);
    }
  }, [isHealthLow]);

  const openUpdateNote = useCallback(() => {
    setIsUpdateNoteOpen(true);
  }, []);

  const closeUpdateNote = useCallback(() => {
    setIsUpdateNoteOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('physics_release_note_dismissed_v4', 'true');
    }
  }, []);

  const value: SimulationHealthContextType = {
    isHealthLow,
    overallStatus,
    httpStatus,
    simResults,
    failure,
    lastChecked,
    isUpdateNoteOpen,
    openUpdateNote,
    closeUpdateNote,
    recheckHealth: fetchHealth,
    testHealthOverride,
    setTestHealthOverride,
  };

  return <SimulationHealthContext.Provider value={value}>{children}</SimulationHealthContext.Provider>;
};

export const useSimulationHealth = (): SimulationHealthContextType => {
  const context = useContext(SimulationHealthContext);
  if (!context) {
    return {
      isHealthLow: false,
      overallStatus: 'healthy',
      httpStatus: 200,
      simResults: {},
      lastChecked: null,
      isUpdateNoteOpen: false,
      openUpdateNote: () => {},
      closeUpdateNote: () => {},
      recheckHealth: async () => {},
      testHealthOverride: 'auto',
      setTestHealthOverride: () => {},
    };
  }
  return context;
};
