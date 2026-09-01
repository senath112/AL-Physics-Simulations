import { useState, lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';

// Lazy-loaded simulation components
const ProjectileSimulation = lazy(() =>
  import('./components/simulations/mechanics/ProjectileSimulation').then(m => ({ default: m.ProjectileSimulation }))
);
const NewtonsLawsSimulation = lazy(() =>
  import('./components/simulations/mechanics/NewtonsLawsSimulation').then(m => ({ default: m.NewtonsLawsSimulation }))
);
const InclinedPlaneSimulation = lazy(() =>
  import('./components/simulations/mechanics/InclinedPlaneSimulation').then(m => ({ default: m.InclinedPlaneSimulation }))
);
const ConnectedParticlesSimulation = lazy(() =>
  import('./components/simulations/mechanics/ConnectedParticlesSimulation').then(m => ({ default: m.ConnectedParticlesSimulation }))
);
const PulleySystemsSimulation = lazy(() =>
  import('./components/simulations/mechanics/PulleySystemsSimulation').then(m => ({ default: m.PulleySystemsSimulation }))
);
const MomentumCollisionsSimulation = lazy(() =>
  import('./components/simulations/mechanics/MomentumCollisionsSimulation').then(m => ({ default: m.MomentumCollisionsSimulation }))
);
const CircularMotionSimulation = lazy(() =>
  import('./components/simulations/mechanics/CircularMotionSimulation').then(m => ({ default: m.CircularMotionSimulation }))
);
const WorkEnergySimulation = lazy(() =>
  import('./components/simulations/mechanics/WorkEnergySimulation').then(m => ({ default: m.WorkEnergySimulation }))
);
const CentreOfMassSimulation = lazy(() =>
  import('./components/simulations/mechanics/CentreOfMassSimulation').then(m => ({ default: m.CentreOfMassSimulation }))
);
const GravityOrbitsSimulation = lazy(() =>
  import('./components/simulations/mechanics/GravityOrbitsSimulation').then(m => ({ default: m.GravityOrbitsSimulation }))
);
const HydrostaticsSimulation = lazy(() =>
  import('./components/simulations/mechanics/HydrostaticsSimulation').then(m => ({ default: m.HydrostaticsSimulation }))
);
const GeometricalOpticsSimulation = lazy(() =>
  import('./components/simulations/optics/GeometricalOpticsSimulation').then(m => ({ default: m.GeometricalOpticsSimulation }))
);
const SimpleHarmonicMotionSimulation = lazy(() =>
  import('./components/simulations/mechanics/SimpleHarmonicMotionSimulation').then(m => ({ default: m.SimpleHarmonicMotionSimulation }))
);
const PhotoelectricEffectSimulation = lazy(() =>
  import('./components/simulations/modern/PhotoelectricEffectSimulation').then(m => ({ default: m.PhotoelectricEffectSimulation }))
);
const GasLawsSimulation = lazy(() =>
  import('./components/simulations/thermal/GasLawsSimulation').then(m => ({ default: m.GasLawsSimulation }))
);
const LenzsLawSimulation = lazy(() =>
  import('./components/simulations/magnetism/LenzsLawSimulation').then(m => ({ default: m.LenzsLawSimulation }))
);
const MagneticFieldWireSimulation = lazy(() =>
  import('./components/simulations/magnetism/MagneticFieldWireSimulation').then(m => ({ default: m.MagneticFieldWireSimulation }))
);
const ParallelCurrentsSimulation = lazy(() =>
  import('./components/simulations/magnetism/ParallelCurrentsSimulation').then(m => ({ default: m.ParallelCurrentsSimulation }))
);
const ChargedParticleMagneticSimulation = lazy(() =>
  import('./components/simulations/magnetism/ChargedParticleMagneticSimulation').then(m => ({ default: m.ChargedParticleMagneticSimulation }))
);
const SolenoidSimulation = lazy(() =>
  import('./components/simulations/magnetism/SolenoidSimulation').then(m => ({ default: m.SolenoidSimulation }))
);
const ElectromagneticInductionSimulation = lazy(() =>
  import('./components/simulations/magnetism/ElectromagneticInductionSimulation').then(m => ({ default: m.ElectromagneticInductionSimulation }))
);
const DCOhmsLawSimulation = lazy(() =>
  import('./components/simulations/electricity/DCOhmsLawSimulation').then(m => ({ default: m.DCOhmsLawSimulation }))
);
const DopplerEffectSimulation = lazy(() =>
  import('./components/simulations/waves/DopplerEffectSimulation').then(m => ({ default: m.DopplerEffectSimulation }))
);
const GravitationSimulation = lazy(() =>
  import('./components/simulations/mechanics/GravitationSimulation').then(m => ({ default: m.GravitationSimulation }))
);
const RollingMotionSimulation = lazy(() =>
  import('./components/simulations/mechanics/RollingMotionSimulation').then(m => ({ default: m.RollingMotionSimulation }))
);
const ACGeneratorSimulation = lazy(() =>
  import('./components/simulations/magnetism/ACGeneratorSimulation').then(m => ({ default: m.ACGeneratorSimulation }))
);
const DCMotorSimulation = lazy(() =>
  import('./components/simulations/magnetism/DCMotorSimulation').then(m => ({ default: m.DCMotorSimulation }))
);
const TransformerSimulation = lazy(() =>
  import('./components/simulations/electricity/TransformerSimulation').then(m => ({ default: m.TransformerSimulation }))
);
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
  ArrowRight,
  FlaskConical
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LaboratoryProvider } from './context/LaboratoryContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';
import { LaboratoryDashboard } from './components/laboratory/LaboratoryDashboard';
import { ENABLE_LABORATORY_UI, ENABLE_AUTH_UI } from './config/features';

type PageType = 'home' | 'sims' | 'projectile_sim' | 'newtons_sim' | 'inclined_sim' | 'optics_sim' | 'shm_sim' | 'photoelectric_sim' | 'gas_sim' | 'lenz_sim' | 'magnetic_field_wire' | 'parallel_currents' | 'charged_particle_magnetic_sim' | 'solenoid_sim' | 'induction_sim' | 'ohms_sim' | 'doppler_sim' | 'connected_particles_sim' | 'pulleys_sim' | 'collisions_sim' | 'circular_motion_sim' | 'energy_sim' | 'centre_mass_sim' | 'orbits_sim' | 'hydrostatics_sim' | 'gravitation_sim' | 'rolling_motion_sim' | 'ac_generator_sim' | 'dc_motor_sim' | 'transformer_sim' | 'laboratory' | 'terms' | 'privacy';
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

const PATH_MAP: Record<PageType, string> = {
  home: '/',
  sims: '/simulations',
  projectile_sim: '/projectile-motion',
  newtons_sim: '/newtons-second-law',
  inclined_sim: '/inclined-plane',
  optics_sim: '/geometrical-optics',
  shm_sim: '/simple-harmonic-motion',
  photoelectric_sim: '/photoelectric-effect',
  gas_sim: '/gas-laws',
  lenz_sim: '/lenzs-law',
  magnetic_field_wire: '/magnetic-field-wire',
  parallel_currents: '/parallel-currents',
  charged_particle_magnetic_sim: '/charged-particle-magnetic',
  solenoid_sim: '/solenoid',
  induction_sim: '/electromagnetic-induction',
  ohms_sim: '/ohms-law',
  doppler_sim: '/doppler-effect',
  connected_particles_sim: '/connected-particles',
  pulleys_sim: '/pulley-systems',
  collisions_sim: '/collisions',
  circular_motion_sim: '/circular-motion',
  energy_sim: '/work-energy-power',
  centre_mass_sim: '/centre-of-mass',
  orbits_sim: '/orbits',
  hydrostatics_sim: '/hydrostatics',
  gravitation_sim: '/newtons-gravitation',
  rolling_motion_sim: '/rolling-motion',
  ac_generator_sim: '/ac-generator',
  dc_motor_sim: '/dc-motor',
  transformer_sim: '/transformer',
  laboratory: '/laboratory',
  terms: '/terms',
  privacy: '/privacy'
};

const getPageFromPath = (path: string): PageType => {
  // Support both hash routing fallback (e.g. /#/projectile-motion) and clean paths (e.g. /projectile-motion)
  let cleanPath = path;
  if (path.includes('#')) {
    cleanPath = path.substring(path.indexOf('#') + 1);
  }
  
  // Ensure we match with prefix slash and handle trailing slash
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  if (cleanPath.endsWith('/') && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const entry = Object.entries(PATH_MAP).find(([_, p]) => p === cleanPath);
  return entry ? (entry[0] as PageType) : 'home';
};

const siteTranslations = {
  en: {
    navSims: 'Simulations',
    heroBadge: 'A Visual Lab • Advanced Level',
    heroLine1: 'Simulations by developers,',
    heroLine2: 'for students.',
    heroDescription: 'Explore physics by changing variables, watching real-time animations, tracking Plotly graphing vectors, and downloading printable PDF laboratory notes configured for G.C.E. Advanced Level syllabus specs.',
    browseSims: 'Browse simulations',
    activeLabs: 'Active Labs',
    syllabusUnits: 'Syllabus Units',
    visualized: 'Visualized',
    unitsExplorer: 'Syllabus Units Explorer:',
    studySmarterTag: '— STUDY SMARTER, INTERACT MORE',
    featuresTitle: 'Everything you need, built to help you understand the physics.',
    feature1Title: 'Change variables',
    feature1Desc: 'Adjust starting heights, mass parameters, force components, launch angles, and friction limits on the fly.',
    feature2Title: 'Real-time graphs',
    feature2Desc: 'Examine dynamic plots for positions, velocity, acceleration, friction forces, and trajectory vectors.',
    feature3Title: 'Syllabus Equations',
    feature3Desc: 'Connect simulated outcomes with official KaTeX derivations, variable definitions, and SI units.',
    feature4Title: 'PDF Reports',
    feature4Desc: 'Log experimental data trials, write observation notes, and export formal laboratory reports as PDFs.',
    feature5Title: 'MCQ Challenges',
    feature5Desc: 'Practice syllabus MCQ questions with detailed, step-by-step visual proofs and numerical solutions.',
    feature6Title: 'Built by community',
    feature6Desc: 'Developed by Physics by Senath to support G.C.E. Advanced Level students throughout Sri Lanka.',
    simsDirectoryTitle: 'Simulations Directory',
    simsDirectorySub: 'Select an active laboratory simulation to start experimenting.',
    searchPlaceholder: 'Search simulations...',
    allUnits: 'All Units',
    resetFilter: 'Reset Filter',
    launchSim: 'Launch Simulator',
    comingSoon: 'Coming Soon',
    noSimsFound: 'No simulations match search criteria.',
    termsTitle: 'Terms & Conditions',
    privacyTitle: 'Privacy Policy',
    footerCopyright: `© ${new Date().getFullYear()} A/L Physics Simulations. Developed by Physics by Senath. All Rights Reserved.`,
    footerSub: 'This educational software is developed for Advanced Level physics students in Sri Lanka.',
  },
  si: {
    navSims: 'අනුකරණ',
    heroBadge: 'දෘශ්‍ය පරීක්ෂණාගාරය • උසස් පෙළ',
    heroLine1: 'සිසුන් උදෙසා නිර්මාණය කළ,',
    heroLine2: 'භෞතික විද්‍යා අනුකරණ.',
    heroDescription: 'විචල්‍යයන් වෙනස් කරමින්, තාත්වික කාල සජීවීකරණ නරඹමින්, Plotly ප්‍රස්ථාර දත්ත පරීක්ෂා කරමින් සහ උසස් පෙළ විෂය නිර්දේශයට අනුව සැකසූ පරීක්ෂණාගාර සටහන් ලබාගනිමින් භෞතික විද්‍යාව අධ්‍යයනය කරන්න.',
    browseSims: 'සියලුම අනුකරණ නරඹන්න',
    activeLabs: 'සක්‍රීය අනුකරණ',
    syllabusUnits: 'විෂය නිර්දේශ ඒකක',
    visualized: 'දෘශ්‍යමාන කළ',
    unitsExplorer: 'විෂය නිර්දේශ ඒකක ගවේෂකය:',
    studySmarterTag: '— වඩාත් බුද්ධිමත්ව ඉගෙන ගන්න',
    featuresTitle: 'භෞතික විද්‍යාව පහසුවෙන් තේරුම් ගැනීමට අවශ්‍ය සියල්ල එකම තැනකින්.',
    feature1Title: 'විචල්‍යයන් වෙනස් කරන්න',
    feature1Desc: 'ආරම්භක උස, ස්කන්ධය, බල සංරචක, ප්‍රක්ෂේපණ කෝණ සහ ගර්ෂණ සීමා ක්ෂණිකව වෙනස් කරන්න.',
    feature2Title: 'තාත්වික කාල ප්‍රස්ථාර',
    feature2Desc: 'ස්ථානය, ප්‍රවේගය, ත්වරණය, ගර්ෂණ බල සහ චලිත පථ සඳහා සජීවී ප්‍රස්ථාර පරීක්ෂා කරන්න.',
    feature3Title: 'විෂය නිර්දේශ සමීකරණ',
    feature3Desc: 'නිල KaTeX සමීකරණ, විචල්‍ය අර්ථකථන සහ SI ඒකක සමඟ අනුකරණ ප්‍රතිඵල සසඳන්න.',
    feature4Title: 'PDF වාර්තා',
    feature4Desc: 'පරීක්ෂණාත්මක දත්ත සටහන් කරගනිමින් මුද්‍රණය කළ හැකි PDF වාර්තා ලබාගන්න.',
    feature5Title: 'බහුවරණ ප්‍රශ්න අභියෝග',
    feature5Desc: 'පියවරෙන් පියවර විස්තරාත්මක විසඳුම් සහිත විෂය නිර්දේශ බහුවරණ ප්‍රශ්න පුහුණු වන්න.',
    feature6Title: 'ශ්‍රී ලාංකික සිසුන් වෙනුවෙන්',
    feature6Desc: 'උසස් පෙළ භෞතික විද්‍යා සිසුන්ට උපකාර කිරීම සඳහා Physics by Senath මගින් නිර්මාණය කර ඇත.',
    simsDirectoryTitle: 'අනුකරණ නාමාවලිය',
    simsDirectorySub: 'පරීක්ෂණ ආරම්භ කිරීමට සක්‍රීය අනුකරණයක් තෝරාගන්න.',
    searchPlaceholder: 'අනුකරණ සොයන්න...',
    allUnits: 'සියලුම ඒකක',
    resetFilter: 'පෙරහන ඉවත් කරන්න',
    launchSim: 'අනුකරණය ආරම්භ කරන්න',
    comingSoon: 'ළඟදීම',
    noSimsFound: 'ඔබගේ සෙවීමට ගැලපෙන අනුකරණ හමු නොවීය.',
    termsTitle: 'කොන්දේසි සහ රෙගුලාසි',
    privacyTitle: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
    footerCopyright: `© ${new Date().getFullYear()} A/L Physics Simulations. Physics by Senath මගින් සංවර්ධනය කරන ලදී.`,
    footerSub: 'මෙම අධ්‍යාපනික මෘදුකාංගය ශ්‍රී ලංකාවේ උසස් පෙළ භෞතික විද්‍යා සිසුන් සඳහා සංවර්ධනය කර ඇත.',
  },
  ta: {
    navSims: 'உருவகப்படுத்துதல்கள்',
    heroBadge: 'காட்சி ஆய்வகம் • உயர் தரம்',
    heroLine1: 'மாணவர்களுக்காக உருவாக்கப்பட்ட,',
    heroLine2: 'இயற்பியல் உருவகப்படுத்துதல்கள்.',
    heroDescription: 'மாறிகளை மாற்றுதல், நிகழ்நேர அசைவூட்டங்களைப் பார்த்தல், வரைபடத் தரவை பகுப்பாய்வு செய்தல் மற்றும் உயர்தர பாடத்திட்டத்திற்கான அச்சிடத்தக்க ஆய்வகக் குறிப்புகளைப் பதிவிறக்குதல் மூலம் இயற்பியலைக் கற்றுக்கொள்ளுங்கள்.',
    browseSims: 'உருவகப்படுத்துதல்களைப் பார்க்கவும்',
    activeLabs: 'செயலில் உள்ள ஆய்வகங்கள்',
    syllabusUnits: 'பாடத்திட்ட ክፍல்கள்',
    visualized: 'காட்சிப்படுத்தப்பட்டது',
    unitsExplorer: 'பாடத்திட்ட அலகு உலாவி:',
    studySmarterTag: '— திறம்பட கற்றுக்கொள்ளுங்கள்',
    featuresTitle: 'இயற்பியலைப் புரிந்துகொள்ள உங்களுக்குத் தேவையான அனைத்தும் ஒரே இடத்தில்.',
    feature1Title: 'மாறிகளை மாற்றவும்',
    feature1Desc: 'ஆரம்ப உயரம், நிறை, விசை கூறுகள், ஏவுதல் கோணங்கள் மற்றும் உராய்வு வரம்புகளை உடனுக்குடன் மாற்றவும்.',
    feature2Title: 'நிகழ்நேர வரைபடங்கள்',
    feature2Desc: 'நிலை, திசைவேகம், முடுக்கம், உராய்வு விசைகள் மற்றும் பாதைக்கான நேரடி வரைபடங்களை ஆராயுங்கள்.',
    feature3Title: 'பாடத்திட்ட சமன்பாடுகள்',
    feature3Desc: 'அதிகாரப்பூர்வ KaTeX சமன்பாடுகள், மாறிகளின் விளக்கங்கள் மற்றும் SI அலகுகளுடன் முடிவுகளை ஒப்பிடுக.',
    feature4Title: 'PDF அறிக்கைகள்',
    feature4Desc: 'சோதனைத் தரவைப் பதிவுசெய்து அச்சிடத்தக்க PDF அறிக்கைகளாகப் பதிவிறக்குங்கள்.',
    feature5Title: 'பலவுள் தெரிவு வினாக்கள்',
    feature5Desc: 'படிப் படியான விளக்கங்களுடன் கூடிய பாடத்திட்ட பலவுள் தெரிவு வினாக்களைப் பயிற்சி செய்யுங்கள்.',
    feature6Title: 'இலங்கை மாணவர்களுக்காக',
    feature6Desc: 'உயர்தர இயற்பியல் மாணவர்களுக்கு உதவ Physics by Senath மூலம் உருவாக்கப்பட்டது.',
    simsDirectoryTitle: 'உருவகப்படுத்துதல் அடைவு',
    simsDirectorySub: 'சோதனையைத் தொடங்க செயலில் உள்ள உருவகப்படுத்துதலைத் தேர்ந்தெடுக்கவும்.',
    searchPlaceholder: 'தேடுங்கள்...',
    allUnits: 'அனைத்து பிரிவுகளும்',
    resetFilter: 'மீட்டமைக்கவும்',
    launchSim: 'தொடங்கவும்',
    comingSoon: 'விரைவில்',
    noSimsFound: 'உங்கள் தேடலுக்கு ஏற்ற உருவகப்படுத்துதல்கள் எதுவும் கிடைக்கவில்லை.',
    termsTitle: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    privacyTitle: 'தனியுரிமைக் கொள்கை',
    footerCopyright: `© ${new Date().getFullYear()} A/L Physics Simulations. Physics by Senath ஆல் உருவாக்கப்பட்டது.`,
    footerSub: 'இந்தக் கல்வி மென்பொருள் இலங்கையில் உள்ள உயர்தர இயற்பியல் மாணவர்களுக்காக உருவாக்கப்பட்டது.',
  }
};

function AppContent() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentPage, setCurrentPageState] = useState<PageType>(() => {
    return getPageFromPath(window.location.pathname || window.location.hash || '/');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<SyllabusUnit | 'all'>('all');
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const st = siteTranslations[lang] || siteTranslations.en;

  const setCurrentPage = (page: PageType) => {
    const targetPath = PATH_MAP[page] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setCurrentPageState(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const page = getPageFromPath(window.location.pathname || window.location.hash || '/');
      setCurrentPageState(page);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);


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
      id: 'connected_particles',
      title: 'Connected Particles',
      sinhalaTitle: "සම්බන්ධිත අංශු",
      tamilTitle: "இணைக்கப்பட்ட துகள்கள்",
      unit: 'mechanics',
      description: 'Analyze multi-body dynamics under tension, sliding surfaces, and friction bounds.',
      icon: Compass,
      status: 'active',
      pageLink: 'connected_particles_sim',
    },
    {
      id: 'pulleys',
      title: 'Pulley Systems',
      sinhalaTitle: "කප්පි පද්ධති",
      tamilTitle: "கப்ப்பி தொகுதிகள்",
      unit: 'mechanics',
      description: 'Study hanging weights acceleration and tension using an interactive Atwood machine.',
      icon: Compass,
      status: 'active',
      pageLink: 'pulleys_sim',
    },
    {
      id: 'collisions',
      title: 'Momentum & Collisions',
      sinhalaTitle: "ගම්‍යතාවය සහ ගැටුම්",
      tamilTitle: "உந்தம் & மோதல்",
      unit: 'mechanics',
      description: 'Study elastic and inelastic collisions between sliding carts with momentum conservation charts.',
      icon: Compass,
      status: 'active',
      pageLink: 'collisions_sim',
    },
    {
      id: 'circular_motion',
      title: 'Circular Motion',
      sinhalaTitle: "වෘත්ත චලිතය",
      tamilTitle: "வட்ட இயக்கம்",
      unit: 'mechanics',
      description: 'Study centripetal acceleration, force, and slack variables in horizontal and vertical loops.',
      icon: Compass,
      status: 'active',
      pageLink: 'circular_motion_sim',
    },
    {
      id: 'energy_work',
      title: 'Work, Energy & Power',
      sinhalaTitle: "කාර්යය, ශක්තිය සහ බලය",
      tamilTitle: "வேலை, ஆற்றல் & வலு",
      unit: 'mechanics',
      description: 'Verify the conservation of mechanical energy using block slides on rollercoaster hills.',
      icon: Compass,
      status: 'active',
      pageLink: 'energy_sim',
    },
    {
      id: 'centre_mass',
      title: 'Centre of Mass',
      sinhalaTitle: "ගුරුත්ව කේන්ද්‍රය",
      tamilTitle: "திணிவு மையம்",
      unit: 'mechanics',
      description: 'Locate joint center coordinates and balance lines for placed custom point masses.',
      icon: Compass,
      status: 'active',
      pageLink: 'centre_mass_sim',
    },
    {
      id: 'orbits',
      title: 'Gravitational Fields & Orbits',
      sinhalaTitle: "ගුරුත්වාකර්ෂණ ක්ෂේත්‍ර සහ කක්ෂ",
      tamilTitle: "ஈர்ப்புப்புலமும் சுற்றுப்பாதையும்",
      unit: 'mechanics',
      description: 'Simulate planetary Keplerian orbits, circular speeds, and gravitational vectors.',
      icon: Compass,
      status: 'active',
      pageLink: 'orbits_sim',
    },
    {
      id: 'hydrostatics',
      title: 'Hydrostatics & Buoyancy',
      sinhalaTitle: "ද්‍රවස්ථිති විද්‍යාව සහ උත්ප්ලාවකතාව",
      tamilTitle: "பாய்மநிலையியல் மற்றும் மிதத்தல்",
      unit: 'mechanics',
      description: "Perform Archimedes' principle buoyancy tests, fluid pressure vs depth measurements, and U-tube manometer density calculations.",
      icon: Compass,
      status: 'active',
      pageLink: 'hydrostatics_sim',
    },
    {
      id: 'gravitation',
      title: "Newton's Law of Gravitation",
      sinhalaTitle: "නිව්ටන්ගේ සර්වත්‍ර ගුරුත්වාකර්ෂණ නියමය",
      tamilTitle: "நியூட்டனின் அகில ஈர்ப்பு விதி",
      unit: 'mechanics',
      description: 'Vary masses and separation distance, measure mutual gravitational force vectors, and verify the inverse-square relationship.',
      icon: Compass,
      status: 'active',
      pageLink: 'gravitation_sim',
    },
    {
      id: 'rolling_motion',
      title: 'Rolling Motion & Moment of Inertia',
      sinhalaTitle: "පෙරළෙන චලිතය සහ අවස්ථිති ඝූර්ණය",
      tamilTitle: "உருளும் இயக்கம் & சடத்துவத்திருப்பம்",
      unit: 'mechanics',
      description: 'Race different geometric objects down an incline, analyze rotational vs translational kinetic energy, and investigate moment of inertia.',
      icon: Compass,
      status: 'active',
      pageLink: 'rolling_motion_sim',
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
      description: 'Manipulate DC voltage source and resistor parameters, visualize current flow/electron collisions, and plot Ohm\'s Law V-I curves.',
      icon: Zap,
      status: 'active',
      pageLink: 'ohms_sim',
    },

    {
      id: 'gas_laws',
      title: 'Thermal Physics & Gas Laws',
      sinhalaTitle: "තාප භෞතික විද්‍යාව සහ වායු නියම",
      tamilTitle: "வெப்பப் பௌதிகவியலும் வாயு விதிகளும்",
      unit: 'thermal',
      description: 'Explore kinetic theory molecular chambers, 1st law piston thermodynamics, PV diagrams, calorimetry mixes, and thermal expansion.',
      icon: Thermometer,
      status: 'active',
      pageLink: 'gas_sim',
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
    {
      id: 'lenzs_law',
      title: "Lenz's Law & Faraday Induction",
      sinhalaTitle: "ලෙන්ස්ගේ නියමය සහ විද්‍යුත් චුම්බක ප්‍රේරණය",
      tamilTitle: "லென்சின் விதியும் மின்காந்தத் தூண்டலும்",
      unit: 'magnetism',
      description: 'Drop a magnet through copper coils, measure induced EMF and currents, adjust resistances, and observe terminal electromagnetic braking forces.',
      icon: Zap,
      status: 'active',
      pageLink: 'lenz_sim',
    },
    {
      id: 'magnetic_field_wire',
      title: 'Magnetic Field Around a Wire',
      sinhalaTitle: "ධාරාවක් ගෙන යන සන්නායකයක් වටා චුම්බක ක්ෂේත්‍රය",
      tamilTitle: "மின்னோட்ட கடத்தியைச் சுற்றியுள்ள காந்தப்புலம்",
      unit: 'magnetism',
      description: 'Observe the concentric magnetic field loops surrounding a current-carrying wire in interactive 3D, trace fields using compasses, and verify the Right-Hand Grip Rule.',
      icon: Zap,
      status: 'active',
      pageLink: 'magnetic_field_wire',
    },
    {
      id: 'parallel_currents',
      title: 'Force Between Parallel Currents',
      sinhalaTitle: "සමාන්තර ධාරා සන්නායක අතර බලය",
      tamilTitle: "இணை கடத்திகளுக்கு இடையேயான விசை",
      unit: 'magnetism',
      description: 'Interact with two parallel current-carrying conductors in 3D, observe physical bendings for attractive and repulsive forces, and verify force metrics.',
      icon: Zap,
      status: 'active',
      pageLink: 'parallel_currents',
    },
    {
      id: 'charged_particle_magnetic',
      title: 'Charged Particle in a Magnetic Field',
      sinhalaTitle: "චුම්බක ක්ෂේත්‍රයක ආරෝපිත අංශුවක්",
      tamilTitle: "காந்தப்புலத்தில் மின்னூட்டம் பெற்ற துகள்",
      unit: 'magnetism',
      description: 'Simulate cyclotron circular motion, evaluate orbit radius, and observe velocity and force vectors.',
      icon: Zap,
      status: 'active',
      pageLink: 'charged_particle_magnetic_sim',
    },
    {
      id: 'solenoid',
      title: 'Magnetic Field of a Solenoid',
      sinhalaTitle: "සොලෙනොයිඩයක චුම්බක ක්ෂේත්‍රය",
      tamilTitle: "வரிச்சுருளின் காந்தப்புலம்",
      unit: 'magnetism',
      description: 'Visualize magnetic field lines inside and outside a solenoid coil, adjust turns and current polarity, and explore fields using an interactive draggable compass.',
      icon: Zap,
      status: 'active',
      pageLink: 'solenoid_sim',
    },
    {
      id: 'induction',
      title: 'Electromagnetic Induction',
      sinhalaTitle: "විද්‍යුත් චුම්බක ප්‍රේරණය",
      tamilTitle: "மின்காந்தத் தூண்டல்",
      unit: 'magnetism',
      description: 'Drag a bar magnet inside a coil of wire, visualize changes in magnetic flux, and measure the induced EMF on an interactive galvanometer.',
      icon: Zap,
      status: 'active',
      pageLink: 'induction_sim',
    },
    {
      id: 'ac_generator',
      title: 'AC Generator & Alternator',
      sinhalaTitle: "ප්‍රත්‍යාවර්ත ධාරා (AC) ජනකය",
      tamilTitle: "மாறுதிசை மின்னோட்ட (AC) பிறப்பாக்கி",
      unit: 'magnetism',
      description: 'Rotate an armature coil in a uniform magnetic field, observe continuous sinusoidal EMF and magnetic flux waveforms, and verify Faraday’s law.',
      icon: Zap,
      status: 'active',
      pageLink: 'ac_generator_sim',
    },
    {
      id: 'dc_motor',
      title: 'DC Motor & Split-Ring Commutator',
      sinhalaTitle: "සරල ධාරා (DC) මෝටරය සහ ද්විඛණ්ඩිත මුදු",
      tamilTitle: "நேரோட்ட (DC) மோட்டார் & மாற்றகம்",
      unit: 'magnetism',
      description: 'Analyze magnetic torque on a current-carrying loop, observe commutator current reversal for continuous rotation, and reverse magnetic/current polarity.',
      icon: Zap,
      status: 'active',
      pageLink: 'dc_motor_sim',
    },
    {
      id: 'transformer',
      title: 'AC Transformer & Mutual Induction',
      sinhalaTitle: "ප්‍රත්‍යාවර්ත (AC) පරිණාමකය",
      tamilTitle: "மாறுதிசை (AC) மின்மாற்றி",
      unit: 'electricity',
      description: 'Investigate mutual induction across laminated iron cores, verify step-up/step-down voltage and current ratios, and evaluate power transfer efficiency.',
      icon: Zap,
      status: 'active',
      pageLink: 'transformer_sim',
    },
    {
      id: 'doppler_effect',
      title: 'Doppler Effect & Sonic Boom',
      sinhalaTitle: "ඩොප්ලර් ආචරණය සහ සුපිරිධ්වනි කම්පනය",
      tamilTitle: "டாப்ளர் விளைவு மற்றும் ஒலி அதிர்வு",
      unit: 'waves',
      description: 'Observe wave crest compression and expansion from a moving source, calculate Doppler pitch shifts, toggle real-time synthesizer sound, and construct shockwave Mach cones.',
      icon: Waves,
      status: 'active',
      pageLink: 'doppler_sim',
    },
  ];

  const unitsList: { id: SyllabusUnit; name: string; sinhalaName: string; tamilName: string; icon: any; color: string }[] = [
    { id: 'mechanics', name: 'Mechanics & SHM', sinhalaName: 'යාන්ත්‍ර විද්‍යාව සහ සරල අනුවර්තී චලිතය', tamilName: 'இயந்திரவியல் மற்றும் எளிய இசை இயக்கம்', icon: Compass, color: 'text-blue-600 bg-blue-50' },
    { id: 'waves', name: 'Waves & Oscillations', sinhalaName: 'තරංග සහ දෝලන', tamilName: 'அலைகள் மற்றும் ஊசலாட்டங்கள்', icon: Waves, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'electricity', name: 'Electricity', sinhalaName: 'ධාරා විද්‍යුතය', tamilName: 'மின்னியல்', icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { id: 'magnetism', name: 'Electromagnetism', sinhalaName: 'විද්‍යුත් චුම්බකත්වය', tamilName: 'மின்காந்தவியல்', icon: Cpu, color: 'text-rose-600 bg-rose-50' },
    { id: 'thermal', name: 'Thermal Physics', sinhalaName: 'තාප භෞතික විද්‍යාව', tamilName: 'வெப்ப இயற்பியல்', icon: Thermometer, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'modern', name: 'Modern Physics', sinhalaName: 'නූතන භෞතික විද්‍යාව', tamilName: 'நவீன இயற்பியல்', icon: Atom, color: 'text-purple-600 bg-purple-50' },
  ];

  // Filtering simulations based on search and selected syllabus unit
  const filteredSims = simulations.filter(sim => {
    const matchesSearch = sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || sim.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased">
      
      {/* Floating Header Navigation Bar */}
      <header className="sticky top-4 z-50 shrink-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-2">
        <div className="bg-white/75 backdrop-blur-xl border border-white/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 sm:px-6 py-2 flex justify-between items-center h-14 transition-all">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              Physics <span className="text-blue-600 font-black">by Senath</span>
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulations Tab */}
            <button
              onClick={() => setCurrentPage('sims')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'sims'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{st.navSims}</span>
            </button>

            {/* Laboratory Workspace Button (Preserved for feature flag) */}
            {ENABLE_LABORATORY_UI && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('Access to the Laboratory Workspace requires signing in with your Google account.');
                  } else {
                    setCurrentPage('laboratory');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'laboratory'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200/60'
                }`}
                title={isAuthenticated ? "Laboratory Workspace" : "Sign in to access Laboratory"}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Laboratory</span>
                {!isAuthenticated && (
                  <span className="text-[9px] bg-purple-200/80 text-purple-800 px-1 rounded-sm font-semibold">
                    Auth
                  </span>
                )}
              </button>
            )}

            {/* Visual Segmented Pill Language Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-100/90 border border-slate-200 p-0.5 rounded-full shadow-inner">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                  lang === 'en' 
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                  lang === 'si' 
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="සිංහල භාෂාවට මාරු වන්න"
              >
                සිං
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                  lang === 'ta' 
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="தமிழ் மொழிக்கு மாறவும்"
              >
                தமிழ்
              </button>
            </div>

            {/* User Profile / Google Sign-In Menu (Preserved for feature flag) */}
            {ENABLE_AUTH_UI && <UserMenu onNavigateToLaboratory={() => setCurrentPage('laboratory')} />}
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
                    {st.heroBadge}
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    {st.heroLine1}<br />
                    <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent">{st.heroLine2}</span>
                  </h2>

                  <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
                    {st.heroDescription}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setCurrentPage('sims')}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:translate-x-0.5"
                    >
                      {st.browseSims}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats Counter & Syllabus Units Row */}
                  <div className="pt-8 border-t border-slate-200/60 space-y-5">
                    <div className="flex gap-8 select-none">
                      <div>
                        <div className="text-3xl font-black text-slate-900 font-mono">{simulations.filter(s => s.status === 'active').length}</div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{st.activeLabs}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-slate-900 font-mono">{unitsList.length}</div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{st.syllabusUnits}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-blue-600 font-mono">100%</div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{st.visualized}</div>
                      </div>
                    </div>

                    {/* Interactive Syllabus Units Explorer Pills */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{st.unitsExplorer}</span>
                      <div className="flex flex-wrap gap-2">
                        {unitsList.map((unit) => {
                          const count = simulations.filter(s => s.unit === unit.id).length;
                          const unitName = lang === 'si' ? unit.sinhalaName : lang === 'ta' ? unit.tamilName : unit.name;
                          return (
                            <button
                              key={unit.id}
                              onClick={() => {
                                setSelectedUnit(unit.id);
                                setCurrentPage('sims');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer group"
                            >
                              <div className={`p-1 rounded-md ${unit.color} group-hover:scale-110 transition-transform`}>
                                <unit.icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{unitName}</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-extrabold">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right stacked tilted widgets panel */}
                <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] select-none">
                  {/* Holographic Glowing Orbs & Tech Ring Backgrounds */}
                  <div className="absolute w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-pulse" />
                  <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse delay-1000" />
                  
                  <div className="absolute w-[380px] h-[380px] rounded-full border border-blue-500/10 pointer-events-none animate-[spin_60s_linear_infinite] flex items-center justify-center">
                    <div className="w-[300px] h-[300px] rounded-full border border-dashed border-emerald-500/10 flex items-center justify-center">
                      <div className="w-[220px] h-[220px] rounded-full border border-dotted border-blue-500/20" />
                    </div>
                  </div>
                  <div className="absolute w-[260px] h-[260px] rounded-full border border-double border-blue-600/10 pointer-events-none animate-[spin_30s_linear_infinite_reverse]" />
                  
                  <div className="tilted-container relative z-10">
                    
                    {/* Projectile Card */}
                    <div 
                      onClick={() => setCurrentPage('projectile_sim')}
                      className="tilted-card tilted-card-1 cursor-pointer border-emerald-100/60 bg-white/70 backdrop-blur-md hover:border-emerald-300 hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-50/80 text-emerald-600 p-2 rounded-lg text-xs">
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
                      className="tilted-card tilted-card-2 cursor-pointer border-blue-100/60 bg-white/70 backdrop-blur-md hover:border-blue-300 hover:shadow-[0_12px_40px_rgba(37,99,235,0.15)] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50/80 text-blue-600 p-2 rounded-lg text-xs">
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
                      className="tilted-card tilted-card-3 cursor-pointer border-purple-100/60 bg-white/70 backdrop-blur-md hover:border-purple-300 hover:shadow-[0_12px_40px_rgba(147,51,234,0.15)] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-50/80 text-purple-600 p-2 rounded-lg text-xs">
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
                    {st.studySmarterTag}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {st.featuresTitle}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature1Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature1Desc}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature2Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature2Desc}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature3Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature3Desc}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature4Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature4Desc}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature5Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature5Desc}
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
                      <h4 className="font-black text-slate-900 text-sm">{st.feature6Title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {st.feature6Desc}
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
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{st.simsDirectoryTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">{st.simsDirectorySub}</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={st.searchPlaceholder}
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
                <div className="flex items-center justify-between px-2 mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{st.syllabusUnits}</h3>
                  {selectedUnit !== 'all' && (
                    <button
                      onClick={() => setSelectedUnit('all')}
                      className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {st.resetFilter}
                    </button>
                  )}
                </div>
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0">
                  <button
                    onClick={() => setSelectedUnit('all')}
                    className={`flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer min-w-[140px] lg:min-w-0 ${
                      selectedUnit === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${selectedUnit === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <span>{st.allUnits}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                      selectedUnit === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {simulations.length}
                    </span>
                  </button>

                  {unitsList.map((unit) => {
                    const count = simulations.filter(s => s.unit === unit.id).length;
                    const isSelected = selectedUnit === unit.id;
                    const unitName = lang === 'si' ? unit.sinhalaName : lang === 'ta' ? unit.tamilName : unit.name;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit.id)}
                        className={`flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer min-w-[160px] lg:min-w-0 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : unit.color}`}>
                            <unit.icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{unitName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
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
                    const unitName = lang === 'si' ? unit.sinhalaName : lang === 'ta' ? unit.tamilName : unit.name;
                    return (
                      <div key={unit.id} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <div className={`p-1.5 rounded-lg ${unit.color}`}>
                            <unit.icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">{unitName}</h3>
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono text-[9px]">{unitSims.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unitSims.map((sim) => {
                            const isActive = sim.status === 'active';
                            const simTitle = lang === 'si' && sim.sinhalaTitle ? sim.sinhalaTitle : lang === 'ta' && sim.tamilTitle ? sim.tamilTitle : sim.title;
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
                                      {isActive ? st.launchSim : st.comingSoon}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-base">{simTitle}</h4>
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
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ProjectileSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
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
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <NewtonsLawsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE INCLINED PLANE SIMULATION */}
        {currentPage === 'inclined_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Friction on an Inclined Plane</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ඇල තලයක ඝර්ෂණය • சாய்வுத்தளத்தில் உராய்வு</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <InclinedPlaneSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE GEOMETRICAL OPTICS SIMULATION */}
        {currentPage === 'optics_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Geometrical Optics</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ජ්‍යාමිතික ප්‍රකාශ විද්‍යාව • வடிவியல் ஒளியியல்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <GeometricalOpticsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE SIMPLE HARMONIC MOTION SIMULATION */}
        {currentPage === 'shm_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Simple Harmonic Motion</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සරල අනුවර්තී චලිතය • எளிய இசை இயக்கம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <SimpleHarmonicMotionSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE PHOTOELECTRIC SIMULATION */}
        {currentPage === 'photoelectric_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Photoelectric Effect</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ප්‍රකාශ විද්‍යුත් ආචරණය • ஒளிமின் விளைவு</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <PhotoelectricEffectSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE GAS LAWS SIMULATION */}
        {currentPage === 'gas_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Gas Laws & Thermodynamics</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">තාප භෞතික විද්‍යාව සහ වායු නියම • வெப்பப் பௌதிகவியலும் வாயு விதிகளும்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <GasLawsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE LENZ'S LAW SIMULATION */}
        {currentPage === 'lenz_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Lenz's Law & Faraday Induction</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ලෙන්ස්ගේ නියමය සහ විද්‍යුත් චුම්බක ප්‍රේරණය • ලෙන්සින් විதியும் மின்காந்தத் தூண்டலும்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <LenzsLawSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE MAGNETIC FIELD WIRE 3D SIMULATION */}
        {currentPage === 'magnetic_field_wire' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">3D Magnetic Field Around a Straight Wire</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ධාරාවක් ගෙන යන සන්නායකයක් වටා චුම්බක ක්ෂේත්‍රය • மின்னோட்ட கடத்தியைச் சுற்றியுள்ள காந்தப்புலம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <MagneticFieldWireSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE PARALLEL CURRENTS 3D SIMULATION */}
        {currentPage === 'parallel_currents' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">3D Force Between Parallel Currents</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සමාන්තර ධාරා සන්නායක අතර බලය • இணை கடத்திகளுக்கு இடையேயான விசை</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ParallelCurrentsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE CHARGED PARTICLE IN A MAGNETIC FIELD SIMULATION */}
        {currentPage === 'charged_particle_magnetic_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Charged Particle in a Magnetic Field</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">චුම්බක ක්ෂේත්‍රයක ආරෝපිත අංශුවක් • காந்தப்புலத்தில் மின்னூட்டம் பெற்ற துகள்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ChargedParticleMagneticSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE SOLENOID SIMULATION */}
        {currentPage === 'solenoid_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Magnetic Field of a Solenoid</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සොලෙනොයිඩයක චුම්බක ක්ෂේත්‍රය • வரிச்சுருளின் காந்தப்புலம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <SolenoidSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE ELECTROMAGNETIC INDUCTION SIMULATION */}
        {currentPage === 'induction_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Electromagnetic Induction</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">විද්‍යුත් චුම්බක ප්‍රේරණය • மின்காந்தத் தூண்டல்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ElectromagneticInductionSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE DC CIRCUITS & OHM'S LAW SIMULATION */}
        {currentPage === 'ohms_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">DC Circuits & Ohm's Law</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සරල ධාරා පරිපථ සහ ඕම්ගේ නියමය • நேரடி மின்னோட்டச் சுற்றுகளும் ஓமின் விதியும்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <DCOhmsLawSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE DOPPLER EFFECT SIMULATION */}
        {currentPage === 'doppler_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Doppler Effect</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ඩොප්ලර් ආචරණය සහ සුපිරිධ්වනි කම්පනය • டாப்ளர் விளைவு மற்றும் ஒலி அதிர்வு</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <DopplerEffectSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE CONNECTED PARTICLES SIMULATION */}
        {currentPage === 'connected_particles_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Connected Particles</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සම්බන්ධිත අංශු • இணைக்கப்பட்ட துகள்கள்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ConnectedParticlesSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE PULLEY SYSTEMS SIMULATION */}
        {currentPage === 'pulleys_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Pulley Systems</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">කප්පි පද්ධති • கப்ப்பி தொகுதிகள்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <PulleySystemsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE COLLISIONS SIMULATION */}
        {currentPage === 'collisions_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Momentum & Collisions</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ගම්‍යතාවය සහ ගැටුම් • உந்தம் & மோதல்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <MomentumCollisionsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE CIRCULAR MOTION SIMULATION */}
        {currentPage === 'circular_motion_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Circular Motion</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">වෘත්ත චලිතය • வட்ட இயக்கம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <CircularMotionSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE WORK ENERGY SIMULATION */}
        {currentPage === 'energy_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Work, Energy & Power</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">කාර්යය, ශක්තිය සහ බලය • வேலை, ஆற்றல் & வலு</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <WorkEnergySimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE CENTRE OF MASS SIMULATION */}
        {currentPage === 'centre_mass_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Centre of Mass</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ගුරුත්ව කේන්ද්‍රය • திணிவு மையம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <CentreOfMassSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE GRAVITY ORBITS SIMULATION */}
        {currentPage === 'orbits_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Gravitational Fields & Orbits</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ගුරුත්වාකර්ෂණ ක්ෂේත්‍ර සහ කක්ෂ • ஈர்ப்புப்புலமும் சுற்றுப்பாதையும்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <GravityOrbitsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE HYDROSTATICS SIMULATION */}
        {currentPage === 'hydrostatics_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Hydrostatics & Buoyancy</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ද්‍රවස්ථිති විද්‍යාව සහ උත්ප්ලාවකතාව • பாய்மநிலையியல் மற்றும் மிதத்தல்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <HydrostaticsSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE GRAVITATION SIMULATION */}
        {currentPage === 'gravitation_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Newton's Law of Gravitation</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ගුරුත්වාකර්ෂණය • ஈர்ப்பு விதி</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <GravitationSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE ROLLING MOTION SIMULATION */}
        {currentPage === 'rolling_motion_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">Rolling Motion & Moment of Inertia</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">පෙරළෙන චලිතය • உருளும் இயக்கம்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <RollingMotionSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE AC GENERATOR SIMULATION */}
        {currentPage === 'ac_generator_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">AC Generator & Alternator</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ප්‍රත්‍යාවර්ත ධාරා (AC) ජනකය • AC பிறப்பாக்கி</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ACGeneratorSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE DC MOTOR SIMULATION */}
        {currentPage === 'dc_motor_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">DC Motor & Split-Ring Commutator</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">සරල ධාරා (DC) මෝටරය • DC மோட்டார்</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <DCMotorSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE TRANSFORMER SIMULATION */}
        {currentPage === 'transformer_sim' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span onClick={() => setCurrentPage('sims')} className="hover:text-blue-600 cursor-pointer">Simulations</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-semibold">AC Transformer & Mutual Induction</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">ප්‍රත්‍යාවර්ත (AC) පරිණාමකය • AC மின்மாற்றி</span>
            </div>
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <TransformerSimulation lang={lang} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ACTIVE LABORATORY WORKSPACE (PROTECTED & PRESERVED) */}
        {currentPage === 'laboratory' && (
          ENABLE_LABORATORY_UI ? (
            <LaboratoryDashboard 
              onBackToSimulations={() => setCurrentPage('sims')} 
              lang={lang} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Laboratory Workspace</h2>
              <p className="text-slate-500 text-sm max-w-md">
                The Laboratory Workspace features are currently undergoing maintenance and development.
              </p>
              <button
                onClick={() => setCurrentPage('sims')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Back to Simulations
              </button>
            </div>
          )
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
          <p>{st.footerCopyright}</p>
          <p>
            {st.footerSub}
            <span className="mx-2">•</span>
            <button onClick={() => setCurrentPage('terms')} className="text-blue-600 hover:underline cursor-pointer">{st.termsTitle}</button>
            <span className="mx-2">•</span>
            <button onClick={() => setCurrentPage('privacy')} className="text-blue-600 hover:underline cursor-pointer">{st.privacyTitle}</button>
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LaboratoryProvider>
        <AppContent />
        <AuthModal />
      </LaboratoryProvider>
    </AuthProvider>
  );
}

