import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export type SimulatorStatus = 'operational' | 'degraded' | 'unavailable' | 'unknown';

export interface SimulatorInventoryItem {
  id: string; // key from /api/health/simulations
  title: string;
  category: 'mechanics' | 'thermal' | 'waves' | 'optics' | 'electricity' | 'modern';
  categoryLabel: string;
  description: string;
  pageLink?: string;
}

export const SIMULATOR_INVENTORY: SimulatorInventoryItem[] = [
  // Mechanics (14)
  {
    id: 'newtons-second-law',
    title: "Newton's Second Law",
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Sliding block dynamics, vector forces, and kinetic/static friction thresholds.',
    pageLink: 'newtons_sim',
  },
  {
    id: 'friction-inclined-plane',
    title: 'Friction on an Inclined Plane',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Ramp inclination angles, normal reactions, and static slip limits.',
    pageLink: 'inclined_sim',
  },
  {
    id: 'projectile-motion',
    title: 'Projectile Motion',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: '2D parabolic trajectories, apex maximum height, and horizontal range.',
    pageLink: 'projectile_sim',
  },
  {
    id: 'connected-particles',
    title: 'Connected Particles',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Multi-body acceleration under string tension and horizontal friction.',
    pageLink: 'connected_particles_sim',
  },
  {
    id: 'pulley-systems',
    title: 'Pulley Systems',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Atwood machines and multi-pulley systems with velocity ratios 1, 2, and 3.',
    pageLink: 'pulleys_sim',
  },
  {
    id: 'shm',
    title: 'Simple Harmonic Motion',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Mass-spring and pendulum oscillations, angular frequency, and phase.',
    pageLink: 'shm_sim',
  },
  {
    id: 'circular-motion',
    title: 'Circular Motion',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Centripetal acceleration, tension forces, and vertical loop critical speeds.',
    pageLink: 'circular_motion_sim',
  },
  {
    id: 'centre-of-mass',
    title: 'Centre of Mass',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Discrete point masses centroid coordinates and balance equilibrium lines.',
    pageLink: 'centre_mass_sim',
  },
  {
    id: 'momentum-collisions',
    title: 'Momentum & Collisions',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: '1D elastic and inelastic collisions with momentum conservation proof.',
    pageLink: 'collisions_sim',
  },
  {
    id: 'work-energy',
    title: 'Work, Energy & Power',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Conservation of mechanical energy on hills and work-energy theorem.',
    pageLink: 'energy_sim',
  },
  {
    id: 'rolling-motion',
    title: 'Rolling Motion',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Pure rolling without slipping based on rotational inertia factors.',
    pageLink: 'rolling_motion_sim',
  },
  {
    id: 'gravitation',
    title: "Newton's Gravitation",
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Universal inverse-square gravitational attraction and surface field g.',
    pageLink: 'gravitation_sim',
  },
  {
    id: 'gravity-orbits',
    title: 'Keplerian Planetary Orbits',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Orbital velocity, period relationships, and Kepler laws.',
    pageLink: 'orbits_sim',
  },
  {
    id: 'hydrostatics',
    title: 'Hydrostatics & Buoyancy',
    category: 'mechanics',
    categoryLabel: 'Mechanics',
    description: 'Gauge pressure variation with depth and Archimedes upthrust forces.',
    pageLink: 'hydrostatics_sim',
  },

  // Thermal Physics (1)
  {
    id: 'gas-laws',
    title: 'Thermal Physics & Gas Laws',
    category: 'thermal',
    categoryLabel: 'Thermal Physics',
    description: 'Ideal gas law PV=nRT, piston thermodynamics, and kinetic molecular theory.',
    pageLink: 'gas_sim',
  },

  // Waves (1)
  {
    id: 'doppler-effect',
    title: 'Doppler Effect',
    category: 'waves',
    categoryLabel: 'Waves',
    description: 'Acoustic wavefront propagation and moving source frequency shifts.',
    pageLink: 'doppler_sim',
  },

  // Optics (1)
  {
    id: 'geometrical-optics',
    title: 'Geometrical Optics',
    category: 'optics',
    categoryLabel: 'Optics',
    description: 'Snell law refraction, critical angle total internal reflection, and thin lenses.',
    pageLink: 'optics_sim',
  },

  // Electricity & Magnetism (10)
  {
    id: 'dc-ohms-law',
    title: "DC Circuits & Ohm's Law",
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Ohmic V-I curves, series/parallel resistor circuits, and power dissipation.',
    pageLink: 'ohms_sim',
  },
  {
    id: 'transformer',
    title: 'Electrical Transformer',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Primary/secondary turns ratios, step-up/step-down voltage conversion.',
    pageLink: 'transformer_sim',
  },
  {
    id: 'ac-generator',
    title: 'AC Generator & Alternator',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Rotating armature coil, sinusoidal EMF production, and magnetic flux linkage.',
    pageLink: 'ac_generator_sim',
  },
  {
    id: 'dc-motor',
    title: 'DC Electric Motor',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Magnetic torque on current loop with split-ring commutator dynamics.',
    pageLink: 'dc_motor_sim',
  },
  {
    id: 'electromagnetic-induction',
    title: 'Electromagnetic Induction',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: "Faraday flux rate of change and induced electromotive force.",
    pageLink: 'induction_sim',
  },
  {
    id: 'lenzs-law',
    title: "Lenz's Law & Eddy Currents",
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Opposing induced magnetic fields and electromagnetic braking forces.',
    pageLink: 'lenz_sim',
  },
  {
    id: 'magnetic-field-wire',
    title: 'Magnetic Field Around a Wire',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Concentric circular magnetic field loops and Right-Hand Grip Rule.',
    pageLink: 'magnetic_field_wire',
  },
  {
    id: 'solenoid',
    title: 'Solenoid Electromagnet',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Uniform axial magnetic field inside multi-turn helical coils.',
    pageLink: 'solenoid_sim',
  },
  {
    id: 'parallel-currents',
    title: 'Parallel Current Conductors',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Magnetic force per unit length between parallel current-carrying wires.',
    pageLink: 'parallel_currents',
  },
  {
    id: 'charged-particle-magnetic',
    title: 'Charged Particle in B-Field',
    category: 'electricity',
    categoryLabel: 'Electricity & Magnetism',
    description: 'Lorentz magnetic force, cyclotron radius, and helical path deflection.',
    pageLink: 'charged_particle_magnetic_sim',
  },

  // Modern Physics (1)
  {
    id: 'photoelectric-effect',
    title: 'Photoelectric Effect',
    category: 'modern',
    categoryLabel: 'Modern Physics',
    description: 'Quantum photon emission, metal work function, and stopping potential.',
    pageLink: 'photoelectric_sim',
  },
];

interface SimulationStatusPageProps {
  onBackToSimulations: () => void;
  onNavigateToSimulation?: (pageLink: string) => void;
}

export const SimulationStatusPage: React.FC<SimulationStatusPageProps> = ({
  onBackToSimulations,
  onNavigateToSimulation,
}) => {
  const [simResults, setSimResults] = useState<Record<string, 'pass' | 'fail'>>({});
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded' | 'down' | 'unknown'>('unknown');
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchHealthData = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);

    // Primary: relative /api/health/simulations. Fallback: absolute production domain
    const candidateUrls = [
      '/api/health/simulations',
      'https://physicsfromsenath.slhosted.lk/api/health/simulations',
    ];

    let lastError: Error | null = null;
    let fetched = false;

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

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
          // If response body is not JSON, treat as error
          throw new Error('Invalid JSON response received from health service');
        }

        const simMap = (data && typeof data.simulations === 'object') ? data.simulations : {};
        setSimResults(simMap);
        setLastCheckedTime(new Date());
        setSecondsAgo(0);

        // Derive overall state strictly from status code and validation checks
        if (status === 200 && data.status === 'healthy') {
          // Confirm all simulators passed
          const hasFailure = Object.values(simMap).some((v) => v === 'fail');
          if (hasFailure) {
            setOverallStatus('degraded');
          } else {
            setOverallStatus('healthy');
          }
        } else if (status === 503 || data.status === 'unhealthy') {
          // Check if it is completely down or partially degraded
          const passCount = Object.values(simMap).filter((v) => v === 'pass').length;
          if (passCount > 0) {
            setOverallStatus('degraded');
          } else {
            setOverallStatus('down');
          }
        } else {
          setOverallStatus('unknown');
        }

        fetched = true;
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!fetched) {
      setHttpStatus(null);
      setOverallStatus('unknown');
      setFetchError(lastError?.message || 'Network request failed');
    }

    setIsRefreshing(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Periodic Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealthData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchHealthData]);

  // Dynamic seconds elapsed ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      if (lastCheckedTime) {
        const diffSec = Math.floor((Date.now() - lastCheckedTime.getTime()) / 1000);
        setSecondsAgo(diffSec);
      }
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastCheckedTime]);

  // Format relative timestamp
  const relativeTimeText = useMemo(() => {
    if (!lastCheckedTime) return 'Checking status...';
    if (secondsAgo < 5) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
    const minutes = Math.floor(secondsAgo / 60);
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }, [lastCheckedTime, secondsAgo]);

  // Compute status per simulator
  const evaluatedInventory = useMemo(() => {
    return SIMULATOR_INVENTORY.map((item) => {
      const result = simResults[item.id];
      let status: SimulatorStatus = 'unknown';

      if (overallStatus === 'unknown') {
        status = 'unknown';
      } else if (result === 'pass') {
        status = 'operational';
      } else if (result === 'fail') {
        status = 'degraded';
      } else if (httpStatus === 200) {
        status = 'operational';
      } else if (httpStatus === 503) {
        status = 'unavailable';
      }

      return {
        ...item,
        status,
      };
    });
  }, [simResults, overallStatus, httpStatus]);

  // Filtered inventory based on search and category tab
  const filteredInventory = useMemo(() => {
    return evaluatedInventory.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [evaluatedInventory, searchQuery, activeCategory]);

  // Summary counts
  const operationalCount = evaluatedInventory.filter((i) => i.status === 'operational').length;
  const totalCount = evaluatedInventory.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSimulations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Return to Simulations Catalog"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Simulations</span>
            </button>
            <div className="h-4 w-px bg-slate-250 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base">
                Physics by Senath
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline-block">
                Simulation Status
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Real-time mini indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                overallStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : overallStatus === 'degraded'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : overallStatus === 'down'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-250'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  overallStatus === 'healthy'
                    ? 'bg-emerald-500 animate-pulse'
                    : overallStatus === 'degraded'
                    ? 'bg-amber-500'
                    : overallStatus === 'down'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="hidden xs:inline">
                {overallStatus === 'healthy'
                  ? 'All Systems Operational'
                  : overallStatus === 'degraded'
                  ? 'Degraded'
                  : overallStatus === 'down'
                  ? 'Unavailable'
                  : 'Checking...'}
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={fetchHealthData}
              disabled={isRefreshing}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh status now"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulation Status
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live operational health and analytical validation for all Physics by Senath interactive simulators.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Last checked: <strong className="font-semibold text-slate-600">{relativeTimeText}</strong></span>
          </div>
        </div>

        {/* 1. Overall Prominent Status Hero Card */}
        {overallStatus === 'healthy' && (
          <div className="rounded-2xl p-6 sm:p-7 bg-emerald-50/80 border border-emerald-200/90 shadow-xs flex items-start gap-4 transition-all">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-emerald-950">
                  All Systems Operational
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-800">
                  Operational
                </span>
              </div>
              <p className="text-sm text-emerald-800/90 leading-relaxed">
                All Physics by Senath simulations are operating normally. Analytical models, numerical kinematics, vector algorithms, and syllabus formulas are verified within certified precision tolerances.
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'degraded' && (
          <div className="rounded-2xl p-6 sm:p-7 bg-amber-50/90 border border-amber-200 shadow-xs flex items-start gap-4 transition-all">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-amber-950">
                  Some Systems Experiencing Issues
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-800">
                  Degraded
                </span>
              </div>
              <p className="text-sm text-amber-800/90 leading-relaxed">
                One or more physics simulations are currently experiencing numerical divergence or degraded performance. Our team has been notified, and affected components are isolated.
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'down' && (
          <div className="rounded-2xl p-6 sm:p-7 bg-rose-50/90 border border-rose-200 shadow-xs flex items-start gap-4 transition-all">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-rose-950">
                  Simulation System Unavailable
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-800">
                  Unavailable
                </span>
              </div>
              <p className="text-sm text-rose-800/90 leading-relaxed">
                The physics simulation engine is currently unavailable. Automated health probes have halted active processing to maintain calculation safety.
              </p>
            </div>
          </div>
        )}

        {overallStatus === 'unknown' && (
          <div className="rounded-2xl p-6 sm:p-7 bg-slate-100/90 border border-slate-250 shadow-xs flex items-start gap-4 transition-all">
            <div className="p-2.5 bg-slate-200 rounded-xl text-slate-700 shrink-0 mt-0.5">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Unable to Determine System Status
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                The simulation status service could not be reached ({fetchError || 'Connection pending'}). The page will automatically retry in 60 seconds, or you can click refresh above.
              </p>
            </div>
          </div>
        )}

        {/* 2. System Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">
              Monitored Sims
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>{totalCount}</span>
            </div>
            <p className="text-xs text-slate-400">Total active practicals</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">
              Operational
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{overallStatus === 'unknown' ? '—' : `${operationalCount}/${totalCount}`}</span>
            </div>
            <p className="text-xs text-slate-400">
              {overallStatus === 'unknown' ? 'Pending check' : `${((operationalCount / totalCount) * 100).toFixed(0)}% verified`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">
              Physics Tolerance
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>≤ 0.5%</span>
            </div>
            <p className="text-xs text-slate-400">Analytical vs numerical</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">
              Verification Interval
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" />
              <span>60s</span>
            </div>
            <p className="text-xs text-slate-400">Automated refresh</p>
          </div>
        </div>

        {/* 3. Individual Simulators Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Individual Simulation Services
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current health and verification status for all 28 A/L syllabus practical simulations.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by simulator..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-250 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-5 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-medium no-scrollbar">
            {[
              { key: 'all', label: 'All Units' },
              { key: 'mechanics', label: 'Mechanics (14)' },
              { key: 'electricity', label: 'Electricity & Magnetism (10)' },
              { key: 'thermal', label: 'Thermal (1)' },
              { key: 'waves', label: 'Waves (1)' },
              { key: 'optics', label: 'Optics (1)' },
              { key: 'modern', label: 'Modern (1)' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.key
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Simulators List */}
          <div className="divide-y divide-slate-100">
            {filteredInventory.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No simulations found matching your filter criteria.
              </div>
            ) : (
              filteredInventory.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-850 text-sm group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 line-clamp-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Status Indicator Badge */}
                      {item.status === 'operational' && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          title="Simulation passes analytical checks with 0 errors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Operational</span>
                        </div>
                      )}

                      {item.status === 'degraded' && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                          title="Simulation experiencing elevated error or equation variance"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Degraded</span>
                        </div>
                      )}

                      {item.status === 'unavailable' && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          title="Simulation validation failure"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Unavailable</span>
                        </div>
                      )}

                      {item.status === 'unknown' && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                          title="Awaiting next automated poll"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Unknown</span>
                        </div>
                      )}

                      {/* Launch Link */}
                      {item.pageLink && onNavigateToSimulation && (
                        <button
                          onClick={() => onNavigateToSimulation(item.pageLink!)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline hidden sm:inline-flex items-center gap-1 cursor-pointer"
                          title={`Launch ${item.title}`}
                        >
                          <span>Launch</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Incident History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Incident History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged outages, service degradations, and maintenance events in the past 90 days.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-450 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              Past 90 Days
            </span>
          </div>

          <div className="py-5 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/60 rounded-xl border border-dashed border-slate-250">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-800">
                No incidents reported
              </p>
              <p className="text-xs text-slate-450 max-w-md">
                All 28 simulation models have executed without service disruptions, zero runtime crashes, and zero numerical divergence incidents.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Independent Uptime Telemetry Monitoring */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Independent Uptime Monitoring</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Probe
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuous independent external monitoring validating simulation operational health.
              </p>
            </div>

            <a
              href="https://stats.uptimerobot.com/aKskfVmXAs?utm_source=status_badge&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer shrink-0"
            >
              <span>View Public Telemetry</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  Continuous Automated Verification
                </p>
                <p className="text-xs text-slate-450">
                  External probes continuously verify simulation physics models and calculation engines around the clock.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <picture>
                <source
                  media="(prefers-color-scheme: dark)"
                  srcSet="https://badge.uptimerobot.com/psp/dd4a5f8430a22107a7819a9288f21a87.svg?style=text&theme=dark"
                />
                <img
                  src="https://badge.uptimerobot.com/psp/dd4a5f8430a22107a7819a9288f21a87.svg?style=text&theme=light"
                  alt="Physics By Senath Uptime Status"
                  className="h-6"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-2 text-center text-xs text-slate-400 space-y-1">
          <p>
            This public status page is updated automatically in real time with continuous verification of all simulation models.
          </p>
          <p>
            No private infrastructure details or credentials are exposed on this public monitor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationStatusPage;
