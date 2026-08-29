import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  TableProperties, 
  Cloud, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  CheckCircle2, 
  HardDrive 
} from 'lucide-react';

interface LaboratoryDashboardProps {
  onBackToSimulations: () => void;
  lang?: 'en' | 'si' | 'ta';
}

export const LaboratoryDashboard: React.FC<LaboratoryDashboardProps> = ({ 
  onBackToSimulations, 
  lang = 'en' 
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const LAB_TRANSLATIONS = {
    en: {
      title: 'Physics by Senath Laboratory Workspace',
      subtitle: 'Your personal workspace for transforming simulation observations into formal lab reports and spreadsheet analytics.',
      authRequiredTitle: 'Authentication Required to Enter the Laboratory',
      authRequiredDesc: 'Guest users can explore all physics simulations freely. To create, edit, and save formal practical reports, please sign in with your Google account.',
      signInBtn: 'Sign In to Access Laboratory',
      quotaTitle: 'Laboratory Storage Quota',
      quotaDesc: 'Each account has a quota of up to 10 saved editable practical reports with Cloudflare R2 cloud sync.',
      quotaUsage: 'Saved Practicals',
      reportEditorTitle: 'Word-like Report Editor',
      reportEditorDesc: 'Write formal physics practical reports with KaTeX formulas, generated graphs, apparatus diagrams, and observation logs.',
      statusComingSoon: 'Integration in Progress (Cloudflare R2 Backend)',
      dataAnalyzerTitle: 'Excel-like Data Analyzer',
      dataAnalyzerDesc: 'Perform regression analysis, error calculations, gradient slopes, and live tabular evaluations directly from logged simulation trials.',
      cloudStorageTitle: 'Cloudflare R2 Cloud Sync',
      cloudStorageDesc: 'All reports and data tables will be linked to your unique user ID and backed up directly to high-speed cloud storage.'
    },
    si: {
      title: 'භෞතික විද්‍යා ප්‍රායෝගික පර්යේෂණාගාර වැඩබිම',
      subtitle: 'සිමියුලේෂන් නිරීක්ෂණ නිල වාර්තා සහ පැතුරුම්පත් විශ්ලේෂණ බවට පත් කරන ඔබගේ පුද්ගලික වැඩබිම.',
      authRequiredTitle: 'පර්යේෂණාගාරයට පිවිසීමට ගිණුමකට ඇතුළු වන්න',
      authRequiredDesc: 'සියලුම සිමියුලේෂන් ආගන්තුක පරිශීලකයින්ට නොමිලේ විවෘතව පවතී. ප්‍රායෝගික වාර්තා සකස් කර සුරැකීමට කරුණාකර ඔබගේ Google ගිණුමෙන් ඇතුළු වන්න.',
      signInBtn: 'ගිණුමට ඇතුළු වන්න',
      quotaTitle: 'ප්‍රායෝගික වාර්තා ධාරිතාව',
      quotaDesc: 'සෑම ගිණුමකටම Cloudflare R2 හරහා සුරැකිය හැකි සංස්කරණය කළ හැකි ප්‍රායෝගික වාර්තා 10 ක ඉඩ ප්‍රමාණයක් හිමිවේ.',
      quotaUsage: 'සුරකින ලද වාර්තා',
      reportEditorTitle: 'ප්‍රායෝගික වාර්තා සංස්කාරකය (Word ආකාරයේ)',
      reportEditorDesc: 'KaTeX සූත්‍ර, ප්‍රස්තාර, උපකරණ රූප සටහන් සහ නිරීක්ෂණ ඇතුළත් නිල භෞතික විද්‍යා වාර්තා සකස් කරන්න.',
      statusComingSoon: 'සංවර්ධනය වෙමින් පවතී (Cloudflare R2)',
      dataAnalyzerTitle: 'දත්ත විශ්ලේෂකය (Excel ආකාරයේ)',
      dataAnalyzerDesc: 'දත්ත ලඝු-සටහන් ඇසුරෙන් ප්‍රත්‍යයන විශ්ලේෂණය, දෝෂ ගණනය කිරීම් සහ අනුක්‍රමණ ගණනය කරන්න.',
      cloudStorageTitle: 'Cloudflare R2 ක්ලවුඩ් සමමුහුර්තකරණය',
      cloudStorageDesc: 'ඔබගේ සියලුම වාර්තා සහ දත්ත වගු ඔබගේ අභ්‍යන්තර ගිණුම් අංකයට ආරක්ෂිතව ක්ලවුඩ් මත සුරැකේ.'
    },
    ta: {
      title: 'இயற்பியல் ஆய்வகப் பணியிடம்',
      subtitle: 'உருவகப்படுத்துதல் அவதானிப்புகளை முறையான ஆய்வக அறிக்கைகள் மற்றும் விரிதாள் பகுப்பாய்வுகளாக மாற்றுவதற்கான உங்கள் தனிப்பயன் தளம்.',
      authRequiredTitle: 'ஆய்வகத்தை அணுக உள்நுழையவும்',
      authRequiredDesc: 'விருந்தினர்கள் அனைத்து இயற்பியல் உருவகப்படுத்துதல்களையும் பயன்படுத்தலாம். ஆய்வக அறிக்கைகளைத் திருத்த உங்கள் Google கணக்கில் உள்நுழையவும்.',
      signInBtn: 'உள்நுழையவும்',
      quotaTitle: 'ஆய்வக சேமிப்பக ஒதுக்கீடு',
      quotaDesc: 'ஒவ்வொரு கணக்கிற்கும் Cloudflare R2 மேகக்கணி வழியாக 10 திருத்தக்கூடிய ஆய்வக அறிக்கைகள் வரை சேமிக்கலாம்.',
      quotaUsage: 'சேமிக்கப்பட்ட அறிக்கைகள்',
      reportEditorTitle: 'அறிக்கை திருத்தி (Word போன்றது)',
      reportEditorDesc: 'KaTeX சூத்திரங்கள், வரைபடங்கள் மற்றும் அவதானிப்புக் குறிப்புகளுடன் முறையான ஆய்வக அறிக்கைகளை உருவாக்கவும்.',
      statusComingSoon: 'உருவாக்கத்தில் உள்ளது (Cloudflare R2)',
      dataAnalyzerTitle: 'தரவு பகுப்பாய்வி (Excel போன்றது)',
      dataAnalyzerDesc: 'சோதனைப் பதிவுகளிலிருந்து பிழை கணிப்புகள் மற்றும் சாய்வு மதிப்பீடுகளைச் செய்யவும்.',
      cloudStorageTitle: 'Cloudflare R2 மேகக்கணி ஒத்திசைவு',
      cloudStorageDesc: 'உங்கள் அறிக்கைகள் அனைத்தும் உங்கள் தனித்துவமான பயனர் ஐடியுடன் பாதுகாப்பாகச் சேமிக்கப்படும்.'
    }
  };

  const t = LAB_TRANSLATIONS[lang] || LAB_TRANSLATIONS.en;

  // 1. GUEST / UNAUTHENTICATED GATE
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full space-y-6">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t.authRequiredTitle}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.authRequiredDesc}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal('Access to the Laboratory Workspace requires an authenticated Google session.')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.signInBtn}</span>
            </button>
            <button
              onClick={onBackToSimulations}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Simulations</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED LABORATORY WORKSPACE
  const savedPracticalsCount = user.savedPracticalsCount || 0;
  const maxQuota = 10;
  const quotaPercent = Math.min(100, (savedPracticalsCount / maxQuota) * 100);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.picture}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-md"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h1>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  Student Account
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">{t.subtitle}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-blue-200 font-mono">
                <span>Account ID: {user.id}</span>
                <span>•</span>
                <span>Email: {user.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToSimulations}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Simulations Catalog</span>
          </button>
        </div>
      </div>

      {/* Quota Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.quotaTitle}</h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">{t.quotaDesc}</p>
        </div>

        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">{t.quotaUsage}</span>
            <span className="text-blue-600 font-mono">{savedPracticalsCount} / {maxQuota}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Laboratory Modules Grid (Placeholders for Upcoming Word/Excel/R2 Work) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Word-like Report Editor */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{t.reportEditorTitle}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.reportEditorDesc}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {t.statusComingSoon}
            </span>
          </div>
        </div>

        {/* Module 2: Excel-like Data Analyzer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{t.dataAnalyzerTitle}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.dataAnalyzerDesc}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {t.statusComingSoon}
            </span>
          </div>
        </div>

        {/* Module 3: Cloudflare R2 Sync */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-purple-300 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-inner">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{t.cloudStorageTitle}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.cloudStorageDesc}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ID Linked: {user.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
