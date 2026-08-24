import { useState } from 'react';
import { ProjectileSimulation } from './components/simulations/mechanics/ProjectileSimulation';
import { NewtonsLawsSimulation } from './components/simulations/mechanics/NewtonsLawsSimulation';
import { InclinedPlaneSimulation } from './components/simulations/mechanics/InclinedPlaneSimulation';
import { GeometricalOpticsSimulation } from './components/simulations/optics/GeometricalOpticsSimulation';
import { SimpleHarmonicMotionSimulation } from './components/simulations/mechanics/SimpleHarmonicMotionSimulation';
import { PhotoelectricEffectSimulation } from './components/simulations/modern/PhotoelectricEffectSimulation';
import { 
  Compass, 
  Activity, 
  Zap, 
  GraduationCap, 
  Atom, 
  Waves,
  Thermometer, 
  Cpu, 
  Search, 
  ArrowRight
} from 'lucide-react';

type PageType = 'home' | 'sims' | 'projectile_sim' | 'newtons_sim' | 'inclined_sim' | 'optics_sim' | 'shm_sim' | 'photoelectric_sim' | 'terms' | 'privacy';
type SyllabusUnit = 'mechanics' | 'waves' | 'electricity' | 'magnetism' | 'thermal' | 'modern';

interface SimulationMetadata {
  id: string;
  title: string;
  sinhalaTitle?: string;
  tamilTitle?: string;
  unit: SyllabusUnit;
  description: string;
  icon: any;
  status: 'active' | 'coming_soon';
  pageLink?: PageType;
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMinimized, setIsSearchMinimized] = useState<boolean>(false);


  // 1. Simulations Catalog Data
  const simulations: SimulationMetadata[] = [
    {
      id: 'newtons_laws',
      title: "Newton's Second Law",
      sinhalaTitle: "නිව්ටන්ගේ දෙවන නියමය",
      tamilTitle: "நியூட்டனின் இரண்டாம் விதி",
      unit: 'mechanics',
      description: 'Simulate sliding block dynamics, examine vector forces, and study static/kinetic friction limits with an integrated laboratory notebook.',
      icon: Compass,
      status: 'active',
      pageLink: 'newtons_sim',
    },
    {
      id: 'inclined_plane',
      title: 'Friction on an Inclined Plane',
      sinhalaTitle: "ඇල තලයක ඝර්ෂණය",
      tamilTitle: "சாய்வுத்தளத்தில் உராய்வு",
      unit: 'mechanics',
      description: 'Resolve gravity vectors on sloped surfaces, find critical angle thresholds, and observe kinetic friction sliding blocks.',
      icon: Compass,
      status: 'active',
      pageLink: 'inclined_sim',
    },

    {
      id: 'projectile',
      title: 'Projectile Motion',
      sinhalaTitle: "ප්‍රක්ෂේපිත චලිතය",
      tamilTitle: "எறியக் கணிய இயக்கம்",
      unit: 'mechanics',
      description: 'Analyze horizontal and vertical independent motions, trace parabolic trajectory vectors, and evaluate range metrics without air resistance.',
      icon: Compass,
      status: 'active',
      pageLink: 'projectile_sim',
    },
    {
      id: 'optics',
      title: 'Geometrical Optics Explainer',
      sinhalaTitle: "ජ්‍යාමිතික ප්‍රකාශ විද්‍යාව",
      tamilTitle: "வடிவியல் ஒளியியல்",
      unit: 'waves',
      description: 'Study Reflection, Refraction, Snell\'s Law, Total Internal Reflection critical angles, and Optical Fibre waveguidance parameters with real-time explain mode overlays.',
      icon: Atom,
      status: 'active',
      pageLink: 'optics_sim',
    },
    {
      id: 'shm',
      title: 'Simple Harmonic Motion',
      sinhalaTitle: "සරල අනුවර්තී චලිතය",
      tamilTitle: "எளிய இசை இயக்கம்",
      unit: 'mechanics',
      description: 'Explore dynamic displacement, velocity, acceleration phase vectors, and energy state relationships for spring-mass oscillators.',
      icon: Activity,
      status: 'active',
      pageLink: 'shm_sim',
    },
    {
      id: 'dc_circuits',
      title: 'DC Circuits & Ohm\'s Law',
      sinhalaTitle: "සරල ධාරා පරිපථ සහ ඕම්ගේ නියමය",
      tamilTitle: "நேரோட்ட மின்சுற்றுகளும் ஓமின் விதியும்",
      unit: 'electricity',
      description: 'Build simple series and parallel circuit configurations, manipulate resistor attributes, and plot live current/voltage loops.',
      icon: Zap,
      status: 'coming_soon',
    },
    {
      id: 'doppler',
      title: 'Doppler Effect',
      sinhalaTitle: "ඩොප්ලර් ආචරණය",
      tamilTitle: "டொப்ளர் விளைவு",
      unit: 'waves',
      description: 'Visualize progressive wavefront compressions and calculate frequency shifts for moving sound sources and observers.',
      icon: Waves,
      status: 'coming_soon',
    },
    {
      id: 'gas_laws',
      title: 'Kinetic Theory of Gases',
      sinhalaTitle: "වායුවල චාලක වාදය",
      tamilTitle: "வாயுக்களின் இயக்கவிசைக் கொள்கை",
      unit: 'thermal',
      description: 'Simulate thermodynamic gas molecule collisions in a chamber to visualize Boyles, Charles, and pressure laws.',
      icon: Thermometer,
      status: 'coming_soon',
    },
    {
      id: 'photoelectric',
      title: 'Photoelectric Effect',
      sinhalaTitle: "ප්‍රකාශ විද්‍යුත් ආචරණය",
      tamilTitle: "ஒளிமின் விளைவு",
      unit: 'modern',
      description: 'Vary incident light frequency and intensity to calculate threshold frequencies, work functions, and stopping potentials.',
      icon: Atom,
      status: 'active',
      pageLink: 'photoelectric_sim',
    },
  ];

  const unitsList: { id: SyllabusUnit; name: string; icon: any; color: string }[] = [
    { id: 'mechanics', name: 'Mechanics & SHM', icon: Compass, color: 'text-blue-600 bg-blue-50' },
    { id: 'waves', name: 'Waves & Oscillations', icon: Waves, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { id: 'magnetism', name: 'Electromagnetism', icon: Cpu, color: 'text-rose-600 bg-rose-50' },
    { id: 'thermal', name: 'Thermal Physics', icon: Thermometer, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'modern', name: 'Modern Physics', icon: Atom, color: 'text-purple-600 bg-purple-50' },
  ];

  // Filtering simulations based on search
  const filteredSims = simulations.filter(sim =>
    sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sim.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased">
      
      {/* Floating Header Navigation Bar */}
      <header className="sticky top-4 z-50 shrink-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-2">
        <div className="bg-white/45 backdrop-blur-2xl border border-white/55 rounded-full shadow-[0_12px_40px_rgba(31,38,135,0.06)] px-6 py-2 flex justify-between items-center h-14">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="bg-blue-600 text-white p-1.5 rounded-xl shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1">
              Physics <span className="text-blue-600 font-black">by Senath</span>
            </span>
          </div>



          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage('sims')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              Explore Sims
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a 
              href="https://senathsethmika.lk" 
              target="_blank" 
              rel="noreferrer"
              className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 block shrink-0"
              title="Physics by Senath Profile"
            >
              <img 
                src="https://github.com/senath112.png" 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80";
                }}
              />
            </a>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0">
        
        {/* HOMEPAGE VIEW */}
        {currentPage === 'home' && (
          <div className="flex-1 flex flex-col">
            
            {/* Hero Section Split Layout */}
            <section className="bg-slate-50 relative py-12 sm:py-20 border-b border-slate-200/60 overflow-hidden canvas-grid-bg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                
                {/* Left content panel */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/60 border border-slate-300/40 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-600 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                    A Visual Lab • Advanced Level
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Simulations by developers,<br />
                    <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent">for students.</span>
                  </h2>

                  <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
                    Explore physics by changing variables, watching real-time animations, tracking Plotly graphing vectors, and downloading printable PDF laboratory notes configured for G.C.E. Advanced Level syllabus specs.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setCurrentPage('sims')}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:translate-x-0.5"
                    >
                      Browse simulations
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage('projectile_sim')}
                      className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      🚀 Launch Launcher
                    </button>
                  </div>

                  {/* Stats Counter Row */}
                  <div className="pt-8 border-t border-slate-200/60 flex gap-8 select-none">
                    <div>
                      <div className="text-2xl font-black text-slate-900">4</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Active Labs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">100%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Visualized</div>
                    </div>
                  </div>
                </div>

                {/* Right stacked tilted widgets panel */}
                <div className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] select-none">
                  <div className="tilted-container">
                    
                    {/* Projectile Card */}
                    <div 
                      onClick={() => setCurrentPage('projectile_sim')}
                      className="tilted-card tilted-card-1 cursor-pointer border-emerald-100 hover:border-emerald-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                          🚀
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800">Projectile Motion</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Simulate trajectory vector heights, ranges and velocity angles...
                      </p>
                    </div>

                    {/* Newton Card */}
                    <div 
                      onClick={() => setCurrentPage('newtons_sim')}
                      className="tilted-card tilted-card-2 cursor-pointer border-blue-100 hover:border-blue-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                          ⚖️
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800">Newton's Laws</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Examine static friction limits, sliding kinetic friction, and mass acceleration...
                      </p>
                    </div>

                    {/* Inclined Plane Card */}
                    <div 
                      onClick={() => setCurrentPage('inclined_sim')}
                      className="tilted-card tilted-card-3 cursor-pointer border-purple-100 hover:border-purple-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                          📐
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800">Inclined Plane</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Resolve gravitational vectors down sloped planes and slide blocks...
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* Features section matching reference image style */}
            <section className="bg-white py-16 sm:py-24 border-b border-slate-200/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="space-y-2 text-left">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    — STUDY SMARTER, INTERACT MORE
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Everything you need, built to help you<br />understand the physics.
                  </h3>
                </div>

                {/* 6-Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        🎛️
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">Change variables</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Adjust starting heights, mass parameters, force components, launch angles, and friction limits on the fly.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        📈
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">Real-time graphs</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Examine dynamic plots for positions, velocity, acceleration, friction forces, and trajectory vectors.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-50 text-amber-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        📐
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">Syllabus Equations</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Connect simulated outcomes with official KaTeX derivations, variable definitions, and SI units.
                      </p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-purple-50 text-purple-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        📋
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">PDF Reports</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Log experimental data trials, write observation notes, and export formal laboratory reports as PDFs.
                      </p>
                    </div>
                  </div>

                  {/* Card 5 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-rose-50 text-rose-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        🎯
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">MCQ Challenges</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Practice syllabus MCQ questions with detailed, step-by-step visual proofs and numerical solutions.
                      </p>
                    </div>
                  </div>

                  {/* Card 6 */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between group glow-card relative">
                    <div className="absolute top-5 right-5 text-slate-300 group-hover:text-blue-500 transition-colors font-bold">
                      ↗
                    </div>
                    <div className="space-y-3">
                      <div className="bg-sky-50 text-sky-600 p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg select-none">
                        👤
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">Built by community</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Developed by Physics by Senath to support G.C.E. Advanced Level students throughout Sri Lanka.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}


        {/* SIMULATIONS LIST VIEW */}
        {currentPage === 'sims' && (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1 min-h-0">
            
            {/* Page Header and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Simulations Directory</h2>
                <p className="text-xs text-slate-500 mt-1">Select an active laboratory simulation to start experimenting.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search simulations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* List Layout grouped by Syllabus Unit */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
              
              {/* Category sidebar list */}
              <div className="space-y-2 lg:col-span-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">Syllabus Units</h3>
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0">
                  {unitsList.map((unit) => {
                    const count = simulations.filter(s => s.unit === unit.id).length;
                    return (
                      <div 
                        key={unit.id}
                        className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 min-w-[160px] lg:min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${unit.color}`}>
                            <unit.icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{unit.name}</span>
                        </div>
                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold font-mono text-[10px]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation cards grouped by unit */}
              <div className="lg:col-span-3 overflow-y-auto pr-1 custom-scrollbar space-y-8">
                {unitsList.some(unit => filteredSims.some(s => s.unit === unit.id)) ? (
                  unitsList.map((unit) => {
                    const unitSims = filteredSims.filter(s => s.unit === unit.id);
                    if (unitSims.length === 0) return null;
                    return (
                      <div key={unit.id} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <div className={`p-1.5 rounded-lg ${unit.color}`}>
                            <unit.icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">{unit.name}</h3>
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono text-[9px]">{unitSims.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unitSims.map((sim) => {
                            const isActive = sim.status === 'active';
                            return (
                              <div 
                                key={sim.id}
                                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all glow-card ${
                                  isActive 
                                    ? 'border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer' 
                                    : 'border-slate-100 opacity-70'
                                }`}
                                onClick={() => isActive && sim.pageLink && setCurrentPage(sim.pageLink)}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                      <sim.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      isActive 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {isActive ? 'Launch Simulator' : 'Coming Soon'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-base">{sim.title}</h4>
                                    {sim.sinhalaTitle && sim.tamilTitle && (
                                      <div className="text-[10px] font-semibold text-slate-400 space-x-1 mt-0.5 font-sans leading-none flex items-center gap-1">
                                        <span>{sim.sinhalaTitle}</span>
                                        <span className="text-[8px] text-slate-350">•</span>
                                        <span>{sim.tamilTitle}</span>
                                      </div>
                                    )}
                                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{sim.description}</p>
                                  </div>
                                </div>
                                
                                {isActive && (
                                  <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                    <span>Enter Laboratory</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-md mx-auto my-12">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">No simulations match search</h3>
                    <p className="text-slate-500 text-xs mt-1">Try searching for other topics like "motion" or "circuit".</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ACTIVE PROJECTILE SIMULATION */}
        {currentPage === 'projectile_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            {/* Top breadcrumb navigation bar */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Projectile Motion</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ප්‍රක්ෂේපිත චලිතය • எறியக் கணிய இயக்கம்</span>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0">
              <ProjectileSimulation />
            </div>
          </div>
        )}

        {/* ACTIVE NEWTONS LAWS SIMULATION */}
        {currentPage === 'newtons_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            {/* Top breadcrumb navigation bar */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Newton's Second Law</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">නිව්ටන්ගේ දෙවන නියමය • நியூட்டனின் இரண்டாம் விதி</span>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0">
              <NewtonsLawsSimulation />
            </div>
          </div>
        )}

        {/* ACTIVE INCLINED PLANE SIMULATION */}
        {currentPage === 'inclined_sim' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Simulation Nav Header */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setCurrentPage('sims')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Back to Directory
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">ඇල තලයක ඝර්ෂණය • சாய்வுத்தளத்தில் உராய்வு</span>
                <span className="text-slate-900 font-semibold text-sm">Friction on an Inclined Plane</span>
              </div>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0">
              <InclinedPlaneSimulation />
            </div>
          </div>
        )}

        {/* ACTIVE GEOMETRICAL OPTICS SIMULATION */}
        {currentPage === 'optics_sim' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Simulation Nav Header */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setCurrentPage('sims')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Back to Directory
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">ජ්‍යාමිතික ප්‍රකාශ විද්‍යාව • வடிவியல் ஒளியியல்</span>
                <span className="text-slate-900 font-semibold text-sm">Geometrical Optics Explainer</span>
              </div>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <GeometricalOpticsSimulation />
            </div>
          </div>
        )}

        {/* ACTIVE SIMPLE HARMONIC MOTION SIMULATION */}
        {currentPage === 'shm_sim' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Simulation Nav Header */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setCurrentPage('sims')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Back to Directory
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">සරල අනුවර්තී චලිතය • எளிய இசை இயக்கம்</span>
                <span className="text-slate-900 font-semibold text-sm">Simple Harmonic Motion Explainer</span>
              </div>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SimpleHarmonicMotionSimulation />
            </div>
          </div>
        )}

        {/* ACTIVE PHOTOELECTRIC SIMULATION */}
        {currentPage === 'photoelectric_sim' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Simulation Nav Header */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setCurrentPage('sims')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Back to Directory
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">ප්‍රකාශ විද්‍යුත් ආචරණය • ஒளிமின் விளைவு</span>
                <span className="text-slate-900 font-semibold text-sm">Photoelectric Effect Explainer</span>
              </div>
            </div>
            {/* Load Simulator component */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <PhotoelectricEffectSimulation />
            </div>
          </div>
        )}

        {/* TERMS AND CONDITIONS PAGE */}
        {currentPage === 'terms' && (
          <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-black text-slate-950">Terms and Conditions</h1>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                >
                  ← Return Home
                </button>
              </div>
              <p className="text-xs text-slate-450 font-bold">Last updated: 24 August 2026</p>
              
              <div className="text-slate-700 text-sm leading-relaxed space-y-4 font-medium">
                <p>Welcome to A/L Physics Simulations, an educational project created by Senath Sethmika and available at <a href="https://senathsethmika.lk/physics" target="_blank" rel="noreferrer" className="text-blue-650 hover:underline">senathsethmika.lk/physics</a>.</p>
                <p>By accessing or using the website, you agree to these Terms and Conditions. If you do not agree with these terms, please do not use the website.</p>
                
                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">1. Purpose of the Website</h2>
                <p>A/L Physics Simulations is an educational resource intended to help students explore and understand physics concepts through interactive simulations.</p>
                <p className="font-bold text-slate-800">The Project is not intended to replace:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
                  <li>A qualified teacher</li>
                  <li>School laboratory work</li>
                  <li>Official textbooks</li>
                  <li>Official examination materials</li>
                  <li>Professional scientific advice</li>
                </ul>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">2. Educational Information</h2>
                <p>We make reasonable efforts to ensure that equations, simulations, explanations, and calculated results are scientifically accurate. However, the simulations are educational models. Results may depend on assumptions, approximations, numerical methods, physical constants, and user-selected parameters.</p>
                <p>The Project does not guarantee that every simulation or educational explanation will always be completely free from errors. Students should verify important academic information against their teachers, textbooks, and official educational resources.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">3. Use of Simulations</h2>
                <p>You may use the simulations for personal educational purposes.</p>
                <p className="font-bold text-slate-800">You may:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
                  <li>Explore simulations</li>
                  <li>Conduct virtual experiments</li>
                  <li>Record your own observations</li>
                  <li>Create Lab Notes</li>
                  <li>Generate and download your own reports</li>
                  <li>Use the results for learning and personal study</li>
                </ul>
                <p className="font-bold text-slate-850 pt-1">You must not use the website to:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
                  <li>Attempt to damage or disrupt the service</li>
                  <li>Circumvent security measures</li>
                  <li>Introduce malicious code</li>
                  <li>Abuse automated systems</li>
                  <li>Interfere with other users</li>
                  <li>Misrepresent the Project as an official government, school, examination-board, or university service</li>
                </ul>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">4. Lab Notes</h2>
                <p>Lab Notes are intended to help users document their own virtual experiments and observations. Users are responsible for the accuracy and originality of information they enter into their Lab Notes.</p>
                <p>Generated reports should not be represented as official laboratory records unless they have been independently verified and accepted by the relevant educational institution or teacher.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">5. Generated Results</h2>
                <p>Simulation results are generated according to the mathematical and physical models implemented by the Project. Users should understand the assumptions used by each simulation.</p>
                <p>The Project is not responsible for academic, scientific, financial, professional, or other decisions made solely on the basis of simulation results.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">6. Intellectual Property</h2>
                <p>Unless otherwise stated, the website’s original software, interface design, graphics, text, educational content, branding, and original simulation implementations are owned by or licensed to the Project and may not be reproduced or redistributed without appropriate permission.</p>
                <p>Open-source libraries used by the Project remain subject to their respective licenses.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">7. Educational and Personal Use</h2>
                <p>You may use the Project for personal learning and educational activities. If you are a teacher or educational institution and would like to reproduce substantial portions of the Project’s content, please contact the Project owner first.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">8. Availability</h2>
                <p>We aim to keep the website available and functional, but we do not guarantee uninterrupted availability. The website may occasionally be unavailable because of maintenance, hosting problems, software updates, technical failures, network problems, security incidents, or other circumstances beyond our control.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">9. Changes to the Project</h2>
                <p>Features, simulations, educational content, technologies, and availability may change over time. We may add, modify, suspend, or remove features when necessary.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">10. Third-Party Services</h2>
                <p>The Project may use third-party services or open-source software. Those services may have their own terms, licenses, and privacy policies. The Project is not responsible for the independent operation or policies of third-party services.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">11. Disclaimer</h2>
                <p>The Project is provided for educational purposes on an “as available” basis. To the extent permitted by applicable law, we make no guarantee that the website will always be available, every simulation will be error-free, every result will be suitable for every educational purpose, or the website will operate correctly on every device or browser.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">12. Limitation of Liability</h2>
                <p>To the extent permitted by applicable law, the Project owner shall not be responsible for losses or damages arising from reliance on the website, its simulations, generated results, or educational materials.</p>
                <p>Nothing in these Terms is intended to exclude or limit rights that cannot legally be excluded or limited under applicable law.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">13. Changes to These Terms</h2>
                <p>These Terms may be updated as the Project develops. The current version will be published on this page with an updated “Last updated” date. Continued use of the website after changes are published constitutes acceptance of the updated Terms.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">14. Contact</h2>
                <p>For questions about these Terms or the A/L Physics Simulations project, contact:</p>
                <p className="font-bold text-slate-800">Senath Sethmika</p>
                <p>Website: <a href="https://senathsethmika.lk" target="_blank" rel="noreferrer" className="text-blue-650 hover:underline">senathsethmika.lk</a></p>

                <div className="border-t border-slate-100 pt-6 text-center space-y-1">
                  <p className="font-extrabold text-slate-800">A/L Physics Simulations</p>
                  <p className="text-xs text-slate-450 italic">Interactive physics for deeper understanding.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY PAGE */}
        {currentPage === 'privacy' && (
          <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-black text-slate-950">Privacy Policy</h1>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                >
                  ← Return Home
                </button>
              </div>
              <p className="text-xs text-slate-450 font-bold">Last updated: 24 August 2026</p>
              
              <div className="text-slate-700 text-sm leading-relaxed space-y-4 font-medium">
                <p>A/L Physics Simulations (“the Project”, “we”, “us”, or “our”) is an educational project created by Senath Sethmika and available at <a href="https://senathsethmika.lk/physics" target="_blank" rel="noreferrer" className="text-blue-650 hover:underline">senathsethmika.lk/physics</a>.</p>
                <p>We are committed to keeping the platform simple, transparent, and privacy-conscious.</p>
                
                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">1. Information We Collect</h2>
                <p>A/L Physics Simulations is designed to work primarily in your web browser. We aim to collect as little personal information as reasonably possible.</p>
                <p className="font-bold text-slate-800">Depending on the features available at a particular time, the website may process:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
                  <li>Simulation settings and parameters</li>
                  <li>Measurements generated during simulations</li>
                  <li>Lab Notes entered by the user</li>
                  <li>Locally generated graphs and reports</li>
                  <li>Technical information required for the website to function</li>
                </ul>
                <p>Unless a feature explicitly states otherwise, simulation data and Lab Notes are intended to remain on your device and are not transmitted to us.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">2. Lab Notes and PDF Reports</h2>
                <p>The Lab Notes feature may allow you to record experimental observations, measurements, calculations, and conclusions.</p>
                <p className="font-bold text-slate-800">Where technically implemented as a local feature:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
                  <li>Lab Notes remain in your browser or device.</li>
                  <li>We do not receive the contents of your Lab Notes.</li>
                  <li>PDF reports are generated on your device.</li>
                  <li>We do not receive a copy of generated PDF reports.</li>
                </ul>
                <p>Clearing browser data, using private browsing, changing devices, or certain browser settings may cause locally stored information to be lost. Users should save or download important reports themselves.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">3. Real-Time Performance Monitoring</h2>
                <p>The simulations may measure browser performance locally using browser timing mechanisms such as performance.now() and requestAnimationFrame(). This may be used to determine frame timing, rendering delays, dropped frames, simulation timing integrity, and graph sampling integrity.</p>
                <p>This functionality is intended to operate locally on your device. It is not intended to transmit your computer’s performance information to the project owner.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">4. Cookies and Local Storage</h2>
                <p>The website may use browser storage technologies such as Local Storage, Session Storage, IndexedDB, and Cookies, where necessary. These technologies may be used to remember settings, simulation preferences, Lab Notes, or other locally useful information.</p>
                <p>If third-party services are introduced in the future, their use of cookies or similar technologies may be governed by their own privacy policies.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">5. Analytics</h2>
                <p>If analytics services are introduced, we will aim to use privacy-conscious analytics and disclose their use in this Privacy Policy. We will not intentionally use analytics to collect unnecessary personal information.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">6. Third-Party Services</h2>
                <p>The website may use third-party technologies or services for functions such as website hosting, content delivery, fonts, libraries, security, and analytics. These services may process technical information necessary to provide their functionality. Their own privacy policies may also apply.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">7. Children’s Privacy</h2>
                <p>The Project is intended as an educational resource for students. We do not intentionally require students to provide sensitive personal information merely to use the core simulations. If an account-based feature is introduced in the future, additional privacy and age-appropriate safeguards may be implemented where appropriate.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">8. Personal Information</h2>
                <p>We do not ask users to submit sensitive personal information for the core simulation experience. Please do not enter passwords, identity-card numbers, financial information, medical information, or other highly sensitive personal information into Lab Notes or other free-text fields.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">9. Security</h2>
                <p>We take reasonable measures to protect the website and minimize unnecessary collection of information. However, no website or Internet transmission can be guaranteed to be completely secure.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">10. Changes to This Privacy Policy</h2>
                <p>This Privacy Policy may be updated when the Project’s features, technology, or data practices change. The latest version will be published on this page with an updated “Last updated” date.</p>

                <h2 className="text-base font-black text-slate-900 pt-2 border-t border-slate-50">11. Contact</h2>
                <p>For questions regarding this Privacy Policy or the A/L Physics Simulations project, contact:</p>
                <p className="font-bold text-slate-800">Senath Sethmika</p>
                <p>Website: <a href="https://senathsethmika.lk" target="_blank" rel="noreferrer" className="text-blue-650 hover:underline">senathsethmika.lk</a></p>

                <div className="border-t border-slate-100 pt-6 text-center space-y-1">
                  <p className="font-extrabold text-slate-800">A/L Physics Simulations</p>
                  <p className="text-xs text-slate-450 italic">Learn the equation. See the equation. Use the equation.</p>
                </div>
              </div>
            </div>
          </div>
        )}



      </main>

      {/* Global Footer (shown on all pages) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto shrink-0 w-full font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} A/L Physics Simulations. Developed by Physics by Senath. All Rights Reserved.</p>
          <p>
            This educational software is developed for Advanced Level physics students in Sri Lanka.
            <span className="mx-2">•</span>
            <button onClick={() => setCurrentPage('terms')} className="text-blue-600 hover:underline cursor-pointer">Terms & Conditions</button>
            <span className="mx-2">•</span>
            <button onClick={() => setCurrentPage('privacy')} className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</button>
          </p>
        </div>
      </footer>

      {/* Floating Bottom Search Bar */}
      {(currentPage === 'home' || currentPage === 'sims') && (
        <>
          {isSearchMinimized ? (
            <button 
              onClick={() => setIsSearchMinimized(false)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11 h-11 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
              title="Expand search bar"
            >
              <Search className="w-4 h-4 text-blue-600 animate-pulse" />
            </button>
          ) : (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)] px-5 py-2.5 flex items-center gap-3">
                <span className="text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                  Search
                </span>
                <span className="h-4 w-px bg-slate-200"></span>
                <div className="relative flex-1 flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Search simulations, units, equations..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (currentPage !== 'sims') setCurrentPage('sims');
                    }}
                    className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none pr-6 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-650 transition-colors shrink-0" onClick={() => { setCurrentPage('sims'); }} />
                  <span className="h-4 w-px bg-slate-200 shrink-0"></span>
                  <button 
                    onClick={() => setIsSearchMinimized(true)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer px-1.5 shrink-0"
                    title="Minimize search"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default App;
