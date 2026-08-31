import { BlockMath } from '../../Math';
import { Sparkles, BookOpen, Maximize2, FileText, Lightbulb, Activity, AlertTriangle } from 'lucide-react';
const PROJECTILE_THEORY_NOTES = {
  en: {
    badge: 'Mechanics • Projectile Motion Interactive Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Vector Resolution',
    tabFormulas: 'Equations & Derivations',
    tabTips: 'Common Mistakes & Senath Rules',

    sec1Title: '1. The Basic Idea of Projectile Motion',
    sec1Body: 'A projectile is an object moving in two dimensions under the single influence of gravity (ignoring air resistance). Motion is split into independent horizontal and vertical components:',
    sec1List: [
      'Horizontal Motion: Constant velocity u_x = u cos θ (no horizontal force, a_x = 0).',
      'Vertical Motion: Constant gravitational acceleration a_y = -g downwards.'
    ],

    sec2Title: '2. Resolving Initial Velocity',
    sec2Body: 'If a projectile is launched with velocity u at angle θ to the horizontal:',
    sec2Parallel: 'Horizontal component: u_x = u cos θ (remains unchanged throughout flight).',
    sec2Perp: 'Vertical component: u_y = u sin θ (decreases to 0 at peak, reverses downwards).',

    sec3Title: '3. Time of Flight (T)',
    sec3Body: 'The total time taken to return to the launching horizontal level (y = 0): T = 2 u sin θ / g.',

    sec4Title: '4. Maximum Height (H)',
    sec4Body: 'At the apex, vertical velocity becomes zero (v_y = 0). Maximum height reached: H = (u² sin² θ) / (2 g).',

    sec5Title: '5. Horizontal Range (R)',
    sec5Body: 'The horizontal distance travelled during time of flight T: R = u_x · T = (u² sin 2θ) / g.',

    sec6Title: '6. Maximum Range Angle & Complementary Angles',
    sec6Body: 'Max range occurs at launch angle θ = 45° (since sin 90° = 1). Complementary launch angles (θ and 90° - θ) yield the EXACT SAME horizontal range for the same speed!',

    sec7Title: '7. Trajectory Equation (Paraboloid Path)',
    sec7Body: 'Eliminating time t from x = (u cos θ)t and y = (u sin θ)t - ½ gt² gives the equation of a parabola: y = x tan θ - (g x²) / (2 u² cos² θ).',

    sec8Title: '8. Velocity & Direction at Any Time t',
    sec8Body: 'Horizontal: v_x = u cos θ. Vertical: v_y = u sin θ - g t. Total speed v = √(v_x² + v_y²) and angle α = arctan(v_y / v_x).',

    sec9Title: '9. Common Pitfalls & Mistakes ⚠️',
    mistakes: [
      '❌ Mistake 1: Assuming total velocity is zero at highest point (Wrong! Vertical v_y = 0, but horizontal v_x = u cos θ remains active!).',
      '❌ Mistake 2: Confusing sin² θ with sin 2θ (H uses sin² θ, whereas Range R uses sin 2θ).',
      '❌ Mistake 3: Forgetting horizontal acceleration is zero (Wrong! a_x = 0 when air resistance is ignored).',
      '❌ Mistake 4: Adding horizontal and vertical components directly without vector Pythagoras (Wrong! Speed v = √(v_x² + v_y²)).'
    ],

    formulaBoxTitle: '📌 Essential Projectile Motion Formula Box',

    senathHeader: '🧠 Physics by Senath — Golden Rules of Projectiles',
    senathCoreBox: 'Always resolve velocity into u_x = u cos θ and u_y = u sin θ. Treat X and Y motions 100% independently!',
    senathSteps: [
      '1. Resolve launch velocity: u_x = u cos θ, u_y = u sin θ',
      '2. Time to apex: t_top = u sin θ / g',
      '3. Total flight time: T = 2 t_top = (2 u sin θ) / g',
      '4. Maximum height: H = (u² sin² θ) / (2 g)',
      '5. Range: R = (u² sin 2θ) / g (Max at θ = 45°)'
    ],
    senathMotto: 'At the apex, speed is NOT zero! The projectile still moves horizontally at u cos θ.',

    varGuideTitle: 'Variables & SI Units Reference Guide',
    vars: [
      { sym: 'u', name: 'Initial Launch Speed', unit: 'm/s' },
      { sym: 'θ', name: 'Launch Angle', unit: 'degrees (°)' },
      { sym: 'u_x', name: 'Horizontal Velocity (u cos θ)', unit: 'm/s' },
      { sym: 'u_y', name: 'Initial Vertical Velocity (u sin θ)', unit: 'm/s' },
      { sym: 'g', name: 'Gravitational Acceleration', unit: 'm/s²' },
      { sym: 'T', name: 'Total Flight Time', unit: 's' },
      { sym: 'H', name: 'Maximum Height', unit: 'm' },
      { sym: 'R', name: 'Horizontal Range', unit: 'm' },
      { sym: 'v_y', name: 'Vertical Velocity at time t', unit: 'm/s' },
      { sym: 'v', name: 'Net Speed at time t', unit: 'm/s' },
      { sym: 'α', name: 'Flight Direction Angle at time t', unit: 'degrees (°)' }
    ]
  },
  si: {
    badge: 'යාන්ත්‍ර විද්‍යාව • ප්‍රක්ෂේපිත චලිතය අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ දෛශික විභේදනය',
    tabFormulas: 'සමීකරණ සහ ගණනය කිරීම්',
    tabTips: 'සාමාන්‍ය වැරදි සහ සෙනත් නීති',

    sec1Title: '1. ප්‍රක්ෂේපිත චලිතයේ මූලික සංකල්පය',
    sec1Body: 'ගුරුත්වාකර්ෂණ බලපෑම යටතේ පමණක් ද්විමානව සිදුවන චලිතය ප්‍රක්ෂේපිත චලිතය ලෙස හැඳින්වේ. මෙය ස්වාධීන සංරචක දෙකකට බෙදිය හැක:',
    sec1List: [
      'තිරස් චලිතය: නියත ප්‍රවේගය u_x = u cos θ (තිරස් ත්වරණයක් නැත, a_x = 0).',
      'සිරස් චලිතය: නියත ගුරුත්වජ ත්වරණය a_y = -g (පහළට).'
    ],

    sec2Title: '2. ආරම්භක ප්‍රවේගය විභේදනය කිරීම',
    sec2Body: 'u ප්‍රවේගයෙන් θ කෝණයකින් ප්‍රක්ෂේපණය කරන විට:',
    sec2Parallel: 'තිරස් සංරචකය: u_x = u cos θ (ගමන පුරා නොවනස්ව පවතී).',
    sec2Perp: 'සිරස් සංරචකය: u_y = u sin θ (මුදුනේදී 0 වී පහළට හැරේ).',

    sec3Title: '3. උඩුගං කාලය / ආවර්ත කාලය (T)',
    sec3Body: 'මුළු චලිත කාලය: T = (2 u sin θ) / g.',

    sec4Title: '4. උපරිම උස (H)',
    sec4Body: 'උපරිම උසේදී සිරස් ප්‍රවේගය ශූන්‍ය වේ (v_y = 0). උපරිම උස: H = (u² sin² θ) / (2 g).',

    sec5Title: '5. තිරස් පරාසය (R)',
    sec5Body: 'T කාලය තුළ ගමන් කරන තිරස් දුර: R = u_x · T = (u² sin 2θ) / g.',

    sec6Title: '6. උපරිම පරාස කෝණය සහ අනුපූරක කෝණ',
    sec6Body: 'උපරිම පරාසයක් ලැබෙන්නේ θ = 45° කෝණයේදීය. අනුපූරක කෝණ (θ සහ 90° - θ) සඳහා එකම තිරස් පරාසයක් ලැබේ!',

    sec7Title: '7. පථයේ සමීකරණය (පරාබලික පථය)',
    sec7Body: 'x සහ y සමීකරණවලින් t ඉවත් කළ විට ලැබෙන පරාබලික පථයේ සමීකරණය: y = x tan θ - (g x²) / (2 u² cos² θ).',

    sec8Title: '8. ඕනෑම t මොහොතක ප්‍රවේගය සහ දිශාව',
    sec8Body: 'තිරස්: v_x = u cos θ. සිරස්: v_y = u sin θ - g t. සම්ප්‍රයුක්ත ප්‍රවේගය v = √(v_x² + v_y²), tan α = v_y / v_x.',

    sec9Title: '9. සිසුන් අතින් සිදුවන සාමාන්‍ය වැරදි ⚠️',
    mistakes: [
      '❌ වැරදි 1: උපරිම උසේදී මුළු ප්‍රවේගයම ශූන්‍ය බව සිතීම (වැරදියි! v_y = 0 වුවද තිරස් v_x = u cos θ පවතී!).',
      '❌ වැරදි 2: sin² θ සහ sin 2θ පටලවා ගැනීම (H සඳහා sin² θ ද, පරාසය R සඳහා sin 2θ ද යොදාගනී).',
      '❌ වැරදි 3: තිරස් ත්වරණය ශූන්‍ය බව අමතක කිරීම (වැරදියි! වාත ප්‍රතිරෝධය නැති විට a_x = 0 වේ).',
      '❌ වැරදි 4: තිරස් සහ සිරස් ප්‍රවේග ඍජුව එකතු කිරීම (වැරදියි! v = √(v_x² + v_y²) දෛශික එකතුව යොදන්න).'
    ],

    formulaBoxTitle: '📌 ප්‍රධාන සමීකරණ එකතුව',

    senathHeader: '🧠 Physics by Senath — ප්‍රක්ෂේපිත චලිතයේ ස්වර්ණමය නීති',
    senathCoreBox: 'ආරම්භක ප්‍රවේගය u_x = u cos θ සහ u_y = u sin θ ලෙස විභේදනය කරන්න. තිරස් සහ සිරස් චලිත 100%ක් ස්වාධීනව සලකන්න!',
    senathSteps: [
      '1. ප්‍රවේගය විභේදනය කරන්න: u_x = u cos θ, u_y = u sin θ',
      '2. මුදුනට යාමට ගතවන කාලය: t_top = u sin θ / g',
      '3. මුළු ගමන් කාලය: T = 2 t_top = (2 u sin θ) / g',
      '4. උපරිම උස: H = (u² sin² θ) / (2 g)',
      '5. පරාසය: R = (u² sin 2θ) / g (උපරිම θ = 45°)'
    ],
    senathMotto: 'උපරිම උසේදී ප්‍රවේගය ශූන්‍ය නොවේ! තිරස්ව u cos θ ප්‍රවේගයෙන් චලනය වේ.',

    varGuideTitle: 'පරාමිතීන් සහ SI ඒකක නාමාවලිය',
    vars: [
      { sym: 'u', name: 'ආරම්භක ප්‍රක්ෂේපණ ප්‍රවේගය', unit: 'm/s' },
      { sym: 'θ', name: 'ප්‍රක්ෂේපණ කෝණය', unit: 'අංශක (°)' },
      { sym: 'u_x', name: 'තිරස් ප්‍රවේග සංරචකය (u cos θ)', unit: 'm/s' },
      { sym: 'u_y', name: 'ආරම්භක සිරස් ප්‍රවේගය (u sin θ)', unit: 'm/s' },
      { sym: 'g', name: 'ගුරුත්වජ ත්වරණය', unit: 'm/s²' },
      { sym: 'T', name: 'මුළු චලිත කාලය', unit: 's' },
      { sym: 'H', name: 'උපරිම උස', unit: 'm' },
      { sym: 'R', name: 'තිරස් පරාසය', unit: 'm' },
      { sym: 'v_y', name: 't මොහොතේ සිරස් ප්‍රවේගය', unit: 'm/s' },
      { sym: 'v', name: 't මොහොතේ සම්ප්‍රයුක්ත ප්‍රවේගය', unit: 'm/s' },
      { sym: 'α', name: 't මොහොතේ චලිත දිශා කෝණය', unit: 'අංශක (°)' }
    ]
  },
  ta: {
    badge: 'இயக்கவியல் • எறிபொருள் இயக்கம் குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் திசையன் பகுப்பு',
    tabFormulas: 'சமன்பாடுகள் மற்றும் கணக்கீடுகள்',
    tabTips: 'பொதுவான தவறுகள் & சேனாத் விதிகள்',

    sec1Title: '1. எறிபொருள் இயக்கத்தின் அடிப்படை யோசனை',
    sec1Body: 'ஈர்ப்பு விசையின் கீழ் இரு பரிமாணங்களில் நிகழும் இயக்கம் எறிபொருள் இயக்கமாகும்:',
    sec1List: [
      'கிடைத்தள இயக்கம்: மாறா திசைவேகம் u_x = u cos θ (கிடைத்தள முடுக்கம் இல்லை, a_x = 0).',
      'செங்குத்து இயக்கம்: மாறா ஈர்ப்பு முடுக்கம் a_y = -g (கீழ்நோக்கி).'
    ],

    sec2Title: '2. ஆரம்ப திசைவேகத்தைப் பிரித்தல்',
    sec2Body: 'u திசைவேகத்தில் θ கோணத்தில் எறியப்படும் போது:',
    sec2Parallel: 'கிடைத்தளக் கூறு: u_x = u cos θ (இயக்கம் முழுவதும் மாறாது).',
    sec2Perp: 'செங்குத்துக் கூறு: u_y = u sin θ (உச்சியில் 0 ஆகி கீழ்நோக்கி மாறும்).',

    sec3Title: '3. மொத்தப் பறப்பு நேரம் (T)',
    sec3Body: 'மொத்தப் பறப்பு நேரம்: T = (2 u sin θ) / g.',

    sec4Title: '4. அதிகபட்ச உயரம் (H)',
    sec4Body: 'உச்சியில் செங்குத்து திசைவேகம் சுழியாகும் (v_y = 0). அதிகபட்ச உயரம்: H = (u² sin² θ) / (2 g).',

    sec5Title: '5. கிடைவீச்சு (R)',
    sec5Body: 'T நேரத்தில் கடந்த கிடைத்தள தூரம்: R = u_x · T = (u² sin 2θ) / g.',

    sec6Title: '6. அதிகபட்ச வீச்சுக் கோணம் & நிரப்புக் கோணங்கள்',
    sec6Body: 'அதிகபட்ச வீச்சு θ = 45° இல் கிடைக்கும். நிரப்புக் கோணங்கள் (θ மற்றும் 90° - θ) ஒரே கிடைவீச்சைத் தரும்!',

    sec7Title: '7. இயக்கப் பாதை சமன்பாடு (பரவளையப் பாதை)',
    sec7Body: 'நேரம் t ஐ நீக்கக் கிடைக்கும் பரவளையப் பாதை சமன்பாடு: y = x tan θ - (g x²) / (2 u² cos² θ).',

    sec8Title: '8. t நேரத்தில் திசைவேகமும் திசையும்',
    sec8Body: 'கிடை: v_x = u cos θ. செங்குத்து: v_y = u sin θ - g t. மொத்த திசைவேகம் v = √(v_x² + v_y²).',

    sec9Title: '9. பொதுவான தவறுகள் ⚠️',
    mistakes: [
      '❌ தவறு 1: உச்சியில் மொத்த திசைவேகம் சுழி என நினைத்தல் (தவறு! v_y = 0 ஆனால் v_x = u cos θ உள்ளது!).',
      '❌ தவறு 2: sin² θ மற்றும் sin 2θ ஐக் குழப்புதல் (H க்கு sin² θ, R க்கு sin 2θ).',
      '❌ தவறு 3: கிடைத்தள முடுக்கம் சுழி என்பதை மறத்தல் (தவறு! a_x = 0).',
      '❌ தவறு 4: கிடைத்தள மற்றும் செங்குத்து திசைவேகங்களை நேரடியாகக் கூட்டுதல் (தவறு! v = √(v_x² + v_y²)).'
    ],

    formulaBoxTitle: '📌 முக்கிய சமன்பாடுகள்',

    senathHeader: '🧠 Physics by Senath — எறிபொருள் பொன்விதிகள்',
    senathCoreBox: 'எப்போதும் திசைவேகத்தை u_x = u cos θ மற்றும் u_y = u sin θ எனப் பிரிக்கவும். X மற்றும் Y இயக்கங்களை 100% தனித்தனியாகக் கருதுக!',
    senathSteps: [
      '1. திசைவேகத்தைப் பிரிக்கவும்: u_x = u cos θ, u_y = u sin θ',
      '2. உச்சியை அடைய நேரம்: t_top = u sin θ / g',
      '3. மொத்தப் பறப்பு நேரம்: T = 2 t_top = (2 u sin θ) / g',
      '4. அதிகபட்ச உயரம்: H = (u² sin² θ) / (2 g)',
      '5. வீச்சு: R = (u² sin 2θ) / g (θ = 45° இல் அதிகபட்சம்)'
    ],
    senathMotto: 'உச்சியில் திசைவேகம் சுழியல்ல! கிடைத்தளத்தில் u cos θ திசைவேகத்தில் இயங்கும்.',

    varGuideTitle: 'மாறிகள் மற்றும் SI அலகுகள் வழிகாட்டி',
    vars: [
      { sym: 'u', name: 'ஆரம்ப எறி திசைவேகம்', unit: 'm/s' },
      { sym: 'θ', name: 'எறிகோணம்', unit: 'பாகை (°)' },
      { sym: 'u_x', name: 'கிடைத்தள திசைவேகக் கூறு', unit: 'm/s' },
      { sym: 'u_y', name: 'ஆரம்ப செங்குத்து திசைவேகம்', unit: 'm/s' },
      { sym: 'g', name: 'புவியீர்ப்பு முடுக்கம்', unit: 'm/s²' },
      { sym: 'T', name: 'மொத்தப் பறப்பு நேரம்', unit: 's' },
      { sym: 'H', name: 'அதிகபட்ச உயரம்', unit: 'm' },
      { sym: 'R', name: 'கிடைவீச்சு', unit: 'm' },
      { sym: 'v_y', name: 't நேரத்தில் செங்குத்து திசைவேகம்', unit: 'm/s' },
      { sym: 'v', name: 't நேரத்தில் நிகர திசைவேகம்', unit: 'm/s' },
      { sym: 'α', name: 't நேரத்தில் இயக்க திசைக் கோணம்', unit: 'பாகை (°)' }
    ]
  }
};

import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import {
  calculateFlightTime,
  calculateMaxHeight,
  calculateRange,
  getProjectileStateAtTime,
  runValidationTests,
  ProjectileParameters,
} from '../../../physics/projectilePhysics';
import { Play, Pause, RotateCcw, SkipForward, Info,  ClipboardList } from 'lucide-react';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { projectileGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_OBSERVATION_NOTEBOOKS, ENABLE_THEORY_NOTEBOOKS } from '../../../config/features';

export function ProjectileSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      velocity: 'Velocity (v₀)',
      angle: 'Angle (θ)',
      height: 'Height (h₀)',
      gravity: 'Gravity (g)',
      vectors: 'Show Vector Arrows (v, vx, vy)',
      theoryOutput: 'Theoretical Output',
      flightTime: 'Flight Time',
      maxHeight: 'Max Height',
      range: 'Horizontal Range',
      play: 'Play',
      pause: 'Pause',
      step: 'Step Forward',
      reset: 'Reset',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Observation History Log',
      clearLogs: 'Clear Logs'
    },
    si: {
      paramsTitle: 'පරාමිතීන්',
      velocity: 'ප්‍රවේගය (v₀)',
      angle: 'කෝණය (θ)',
      height: 'උස (h₀)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'වේග දෛශික පෙන්වන්න (v, vx, vy)',
      theoryOutput: 'න්‍යායාත්මක අගයන්',
      flightTime: 'පියාසර කාලය',
      maxHeight: 'උපරිම උස',
      range: 'තිරස් පරාසය',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      step: 'ඉදිරියට පියවරක්',
      reset: 'නැවත මුලට',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත නිරීක්ෂණ ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      paramsTitle: 'அளவுருக்கள்',
      velocity: 'வேகம் (v₀)',
      angle: 'கோணம் (θ)',
      height: 'உயரம் (h₀)',
      gravity: 'ஈர்ப்பு (g)',
      vectors: 'திசையன் அம்புகளைக் காட்டு (v, vx, vy)',
      theoryOutput: 'கோட்பாட்டு கணிப்புகள்',
      flightTime: 'பறக்கும் நேரம்',
      maxHeight: 'அதிகபட்ச உயரம்',
      range: 'கிடை வீச்சு',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      step: 'முன்னோக்கிச் செல்',
      reset: 'மீட்டமை',
      logData: 'பதிவைச் சேமி',
      downloadPDF: 'PDF தரவிறக்கம்',
      labNotes: 'ஆய்வகக் குறிப்பேடு',
      trialHistory: 'சோதனைப் பதிவுகள்',
      clearLogs: 'அனைத்தையும் நீக்கு'
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [viewMode, setViewMode] = useState<'notebook' | 'sim_only'>(ENABLE_THEORY_NOTEBOOKS ? 'notebook' : 'sim_only');
  const [activeTheoryTab, setActiveTheoryTab] = useState<'theory' | 'formulas' | 'tips'>('theory');
  const tn = PROJECTILE_THEORY_NOTES[lang] || PROJECTILE_THEORY_NOTES.en;


  // 1. Simulation Parameters
  const [params, setParams] = useState<ProjectileParameters>({
    v0: 20,
    angle: 45,
    h0: 5,
    g: 10,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [validationMsg, setValidationMsg] = useState('');
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'projectile_sim',
    simulationTitle: 'Projectile Motion',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'angle', label: 'Launch Angle θ', unit: '°' },
      { key: 'velocity', label: 'Initial Velocity v₀', unit: 'm/s' },
      { key: 'range', label: 'Horizontal Range R', unit: 'm' },
      { key: 'maxHeight', label: 'Max Height H', unit: 'm' },
      { key: 'flightTime', label: 'Flight Time T', unit: 's' },
      { key: 'gravity', label: 'Gravity g', unit: 'm/s²' },
    ],
    getCurrentRow: () => ({
      angle: params.angle,
      velocity: params.v0,
      range: parseFloat(range.toFixed(2)),
      maxHeight: parseFloat(maxH.toFixed(2)),
      flightTime: parseFloat(tFlight.toFixed(2)),
      gravity: params.g,
    }),
    getSeriesData: () => {
      const angles = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
      return angles.map((ang, i) => {
        const p = { ...params, angle: ang };
        return {
          trial: i + 1,
          angle: ang,
          velocity: p.v0,
          range: parseFloat(calculateRange(p).toFixed(2)),
          maxHeight: parseFloat(calculateMaxHeight(p).toFixed(2)),
          flightTime: parseFloat(calculateFlightTime(p).toFixed(2)),
          gravity: p.g,
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Launch Angle θ = 15°', params: { angle: 15 }, durationMs: 800 },
        { label: 'Launch Angle θ = 30°', params: { angle: 30 }, durationMs: 800 },
        { label: 'Launch Angle θ = 45°', params: { angle: 45 }, durationMs: 800 },
        { label: 'Launch Angle θ = 60°', params: { angle: 60 }, durationMs: 800 },
        { label: 'Launch Angle θ = 75°', params: { angle: 75 }, durationMs: 800 },
      ],
      applyParams: (p) => {
        setParams((prev) => ({ ...prev, ...p }));
      },
    },
    defaultGraphConfig: {
      xAxis: 'angle',
      yAxis: 'range',
      title: 'Range vs Launch Angle (R vs θ)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Initial Velocity (v0)': `${params.v0} m/s`,
      'Launch Angle (theta)': `${params.angle}°`,
      'Initial Height (h0)': `${params.h0} m`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF("Projectile Motion Laboratory", reportParams, recorder.recordedRows, labNotes);
  };

  // Run validation tests on mount
  useEffect(() => {
    const testResult = runValidationTests();
    if (testResult.passed) {
      setValidationMsg(testResult.message);
    } else {
      console.error(testResult.message);
    }
  }, []);

  // Compute key derived values
  const tFlight = calculateFlightTime(params);
  const maxH = calculateMaxHeight(params);
  const range = calculateRange(params);

  // 2. Simulation Engine Hook
  const {
    time,
    isPlaying,
    togglePlay,
    reset,
    stepForward,
    timeScale,
    setTimeScale,
  } = useSimulation({
    initialTime: 0,
    maxTime: tFlight,
  });

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getH0FromEvent = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const margin = { left: 45, right: 45, bottom: 40, top: 40 };
    const plotHeight = rect.height - margin.top - margin.bottom;
    const yMax = Math.max(maxH * 1.25, params.h0 * 1.5, 10);
    const metersToPixelsY = plotHeight / yMax;

    const clickY = clientY - rect.top;
    const yMeters = yMax - (clickY - margin.top) / metersToPixelsY;
    return Math.max(0, Math.min(25, yMeters));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;

    // Stand is horizontally near x = 0 (left-most grid region)
    if (clickX >= 25 && clickX <= 75) {
      const yMeters = getH0FromEvent(clientY);
      if (yMeters === null) return;
      if (yMeters <= params.h0 + 2.5) {
        setIsDragging(true);
      }
    }
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging || isPlaying) return;
    const yMeters = getH0FromEvent(clientY);
    if (yMeters === null) return;
    setParams((prev) => ({ ...prev, h0: Math.round(yMeters * 10) / 10 }));
    reset(); // reset time to 0 to trace new projectile start height
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  const currentState = getProjectileStateAtTime(time, params);

  // 3. Canvas Rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and match device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Drawing margins
    const margin = { top: 40, right: 40, bottom: 50, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, width, height);

    // Auto-scaling based on max range and height
    const xMax = Math.max(range * 1.15, 20); // physical meters
    const yMax = Math.max(maxH * 1.25, params.h0 * 1.5, 10); // physical meters

    const metersToPixelsX = plotWidth / xMax;
    const metersToPixelsY = plotHeight / yMax;

    // Coordinate conversion functions
    const toScreenX = (xMeters: number) => margin.left + xMeters * metersToPixelsX;
    const toScreenY = (yMeters: number) => margin.top + plotHeight - yMeters * metersToPixelsY;

    // Draw Grid Lines (SI Units: every 5 or 10m depending on size)
    const gridSpacing = xMax > 100 ? 20 : (xMax > 50 ? 10 : 5);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px font-mono, Courier';
    ctx.textAlign = 'center';

    // X Grid
    for (let x = 0; x <= xMax; x += gridSpacing) {
      const screenX = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(screenX, margin.top);
      ctx.lineTo(screenX, margin.top + plotHeight);
      ctx.stroke();
      ctx.fillText(`${x}m`, screenX, margin.top + plotHeight + 15);
    }

    // Y Grid
    ctx.textAlign = 'right';
    for (let y = 0; y <= yMax; y += gridSpacing) {
      const screenY = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(margin.left, screenY);
      ctx.lineTo(margin.left + plotWidth, screenY);
      ctx.stroke();
      ctx.fillText(`${y}m`, margin.left - 8, screenY + 3);
    }

    // Draw Ground
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();

    // Draw Launch Stand (initial height)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(0), toScreenY(params.h0));
    ctx.stroke();

    // Draw entire trajectory curve (faded background line)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= tFlight; t += tFlight / 100) {
      const state = getProjectileStateAtTime(t, params);
      if (t === 0) {
        ctx.moveTo(toScreenX(state.x), toScreenY(state.y));
      } else {
        ctx.lineTo(toScreenX(state.x), toScreenY(state.y));
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw past path up to current time
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t <= time; t += Math.max(0.01, time / 100)) {
      const state = getProjectileStateAtTime(t, params);
      if (t === 0) {
        ctx.moveTo(toScreenX(state.x), toScreenY(state.y));
      } else {
        ctx.lineTo(toScreenX(state.x), toScreenY(state.y));
      }
    }
    // ensure it reaches current exact x, y
    ctx.lineTo(toScreenX(currentState.x), toScreenY(currentState.y));
    ctx.stroke();

    // Draw Projectile Ball
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toScreenX(currentState.x), toScreenY(currentState.y), 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw Vector Arrows (Velocity decomposition)
    if (showVectors && time < tFlight) {
      const startX = toScreenX(currentState.x);
      const startY = toScreenY(currentState.y);

      // Scale vectors so they look reasonable on screen
      const vectorScale = 1.5;

      // Net Velocity Vector (Blue)
      const endX = startX + currentState.vx * vectorScale;
      const endY = startY - currentState.vy * vectorScale; // Invert Y for canvas

      // Draw Net Velocity Vector
      ctx.strokeStyle = '#10b981'; // Emerald/Green for velocity
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Net velocity arrowhead
      const angleRad = Math.atan2(endY - startY, endX - startX);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 8 * Math.cos(angleRad - Math.PI / 6), endY - 8 * Math.sin(angleRad - Math.PI / 6));
      ctx.lineTo(endX - 8 * Math.cos(angleRad + Math.PI / 6), endY - 8 * Math.sin(angleRad + Math.PI / 6));
      ctx.fill();

      // vx component vector (Red)
      const vxEndX = startX + currentState.vx * vectorScale;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(vxEndX, startY);
      ctx.stroke();

      // vy component vector (Orange/Amber)
      const vyEndY = startY - currentState.vy * vectorScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, vyEndY);
      ctx.stroke();
    }
  }, [time, params, range, maxH, currentState, tFlight, showVectors]);

  // 4. Plotly Graphs Data Preparation
  // Generate data points for trajectory, x-t, y-t, v-t
  const steps = 100;
  const tVals: number[] = [];
  const xVals: number[] = [];
  const yVals: number[] = [];
  const vxVals: number[] = [];
  const vyVals: number[] = [];
  const vVals: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (tFlight * i) / steps;
    const st = getProjectileStateAtTime(t, params);
    tVals.push(t);
    xVals.push(st.x);
    yVals.push(st.y);
    vxVals.push(st.vx);
    vyVals.push(st.vy);
    vVals.push(st.speed);
  }



  // 5. Educational Data
  return (
    <div className="space-y-6">

      {ENABLE_THEORY_NOTEBOOKS && (/* Top Header with Title and Mode Toggle */
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">{tn.badge}</span>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Projectile Motion</h2>
          </div>
        </div>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('notebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'notebook'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{tn.notebookMode}</span>
          </button>
          <button
            onClick={() => setViewMode('sim_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'sim_only'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{tn.simOnlyMode}</span>
          </button>
        </div>
      </div>
      )} 

      {/* INTERACTIVE THEORY NOTEBOOK CARD (Visible in Notebook Mode) */}
      {ENABLE_THEORY_NOTEBOOKS && viewMode === 'notebook' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Notebook Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTheoryTab('theory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'theory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tn.tabTheory}</span>
            </button>
            <button
              onClick={() => setActiveTheoryTab('formulas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'formulas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{tn.tabFormulas}</span>
            </button>
            <button
              onClick={() => setActiveTheoryTab('tips')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'tips'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>{tn.tabTips}</span>
            </button>
          </div>

          {/* Tab 1: Theory & Vector Resolution */}
          {activeTheoryTab === 'theory' && (
            <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.sec1Title}</h3>
                <p>{tn.sec1Body}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-1">
                  {tn.sec1List.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {tn.sec2Title}
                  </h4>
                  <p>{tn.sec2Body}</p>
                  <div className="space-y-1 text-[11px] font-semibold pt-1">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-150 text-blue-900">{tn.sec2Parallel}</div>
                    <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-150 text-indigo-900">{tn.sec2Perp}</div>
                  </div>
                  <BlockMath math="u_x = u\cos\theta, \quad u_y = u\sin\theta" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    {tn.sec7Title}
                  </h4>
                  <p>{tn.sec7Body}</p>
                  <BlockMath math="y = x\tan\theta - \frac{g x^2}{2 u^2 \cos^2\theta}" />
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-2 font-mono text-xs">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">{tn.sec8Title}</h4>
                <p className="text-slate-300 font-sans text-xs">{tn.sec8Body}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center pt-2 text-indigo-300">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800"><BlockMath math="v_x = u\cos\theta, \quad v_y = u\sin\theta - g t" /></div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800"><BlockMath math="v = \sqrt{v_x^2 + v_y^2}, \quad \tan\alpha = \frac{v_y}{v_x}" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Equations & Derivations */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-xs">{tn.sec3Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec3Body}</p>
                  <BlockMath math="T = \frac{2 u \sin\theta}{g}" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-purple-700 text-xs">{tn.sec4Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec4Body}</p>
                  <BlockMath math="H = \frac{u^2 \sin^2\theta}{2 g}" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-700 text-xs">{tn.sec5Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec5Body}</p>
                  <BlockMath math="R = \frac{u^2 \sin 2\theta}{g}" />
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2 text-indigo-950">
                <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wide">{tn.sec6Title}</h4>
                <p className="text-xs">{tn.sec6Body}</p>
                <BlockMath math="R_{\max} = \frac{u^2}{g} \quad \text{at } \theta = 45^\circ" />
              </div>

              {/* Variables & SI Units Reference Card */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-blue-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {tn.varGuideTitle}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {tn.vars.map((v: { sym: string; name: string; unit: string }, idx: number) => (
                    <div key={idx} className="bg-white/80 border border-blue-100 p-2 rounded-lg space-y-0.5">
                      <div className="font-bold text-blue-700 font-mono text-[11px]">{v.sym}</div>
                      <div className="text-slate-800 font-medium text-[11px]">{v.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold">SI: {v.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Common Mistakes & Senath Rules */}
          {activeTheoryTab === 'tips' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {tn.sec9Title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tn.mistakes.map((m: string, idx: number) => (
                    <div key={idx} className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl text-xs text-rose-950 font-medium">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">{tn.formulaBoxTitle}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono font-bold text-center">
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">T = (2 u sin θ)/g</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">H = (u² sin² θ)/(2g)</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">R = (u² sin 2θ)/g</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">θ_max = 45°</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 text-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {tn.senathHeader}
                </h3>
                <p className="text-xs text-blue-100 font-semibold">{tn.senathCoreBox}</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-medium text-white">
                  {tn.senathSteps.map((step: string, idx: number) => (
                    <div key={idx} className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                      {step}
                    </div>
                  ))}
                </div>
                <div className="text-center font-extrabold text-xs text-amber-200 bg-black/20 p-2.5 rounded-xl">
                  {tn.senathMotto}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameters (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
{/* Controls Container */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4 shrink-0">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{t.paramsTitle}</span>
            {recorder.isAutoRunning && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                🔒 Auto-Running
              </span>
            )}
          </h3>

          {/* Initial Velocity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.velocity}</span>
              <span className="text-blue-600 font-mono">{params.v0.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={params.v0}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, v0: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Launch Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.angle}</span>
              <span className="text-blue-600 font-mono">{params.angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={params.angle}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Initial Height */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.height}</span>
              <span className="text-blue-600 font-mono">{params.h0.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={params.h0}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, h0: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Gravity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.gravity}</span>
              <span className="text-blue-600 font-mono">{params.g.toFixed(2)} m/s²</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="25.0"
              step="0.1"
              value={params.g}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, g: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Global analytical values / calculations */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 shrink-0">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            {t.theoryOutput}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.flightTime}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{tFlight.toFixed(3)} s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block">{t.maxHeight}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{maxH.toFixed(2)} m</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 col-span-2">
              <span className="text-slate-500 block">{t.range}</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{range.toFixed(2)} m</span>
            </div>
          </div>
        </div>

        {/* Live measurements at time t */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm text-slate-100 space-y-3 shrink-0">
          <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            Live Lab Indicators
          </h3>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">TIME (t)</span>
              <span className="font-bold text-blue-400">{time.toFixed(3)} s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SPEED (v)</span>
              <span className="font-bold text-emerald-400">{currentState.speed.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DISPLACEMENT (x)</span>
              <span className="font-bold text-slate-200">{currentState.x.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">HEIGHT (y)</span>
              <span className="font-bold text-slate-200">{currentState.y.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">vx (const)</span>
              <span className="font-bold text-red-400">{currentState.vx.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">vy (dynamic)</span>
              <span className="font-bold text-amber-400">{currentState.vy.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>

        {/* Lab Notebook Container */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 flex-1 flex flex-col">
          {ENABLE_OBSERVATION_NOTEBOOKS && (
            <>
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                {t.labNotes}
              </h3>

              <textarea
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                placeholder="Type your laboratory observations, findings, and notes here..."
                className="w-full flex-1 min-h-[120px] border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans"
              />
            </>
          )}

          <SimulationLabBar
            trialCount={recorder.trialCount}
            onRecordTrial={recorder.recordTrial}
            onRecordFullRun={recorder.recordFullRun}
            isAutoRecording={recorder.isAutoRecording}
            onToggleAutoRecord={recorder.toggleAutoRecord}
            isAutoRunning={recorder.isAutoRunning}
            autoRunProgress={recorder.autoRunProgress}
            onStartAutoRun={recorder.startAutoRun}
            onCancelAutoRun={recorder.cancelAutoRun}
            onSendToLaboratory={recorder.sendToLaboratory}
            onDownloadPDF={handleDownloadPDF}
            onClearTrials={recorder.clearTrials}
            isSaving={recorder.isSaving}
            statusMessage={recorder.statusMessage}
            quota={recorder.quota}
          />
        </div>

        {validationMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded p-2.5 flex items-start gap-1.5 leading-normal shrink-0">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{validationMsg}</span>
          </div>
        )}
      </div>


              </div>

        {/* Right Column: Viewport & Graphs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
{/* Interactive Simulation Viewport + Graphs (Dynamic columns based on Learn panel state) */}
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header indicator */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulation Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                v
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
                v<sub>x</sub>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                v<sub>y</sub>
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="w-full min-h-[420px] h-[420px] relative bg-slate-50/20 canvas-grid-bg rounded-xl overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Play/Pause/Time Control Bar */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-lg shrink-0">
            {/* Play/Pause controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={() => stepForward(0.02)}
                disabled={isPlaying || time >= tFlight}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Step Forward (dt = 20ms)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={reset}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Time Slider */}
            <div className="flex-1 min-w-[150px] flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">0s</span>
              <input
                type="range"
                min="0"
                max={tFlight}
                step={tFlight / 200 || 0.01}
                value={time}
                onChange={(e) => {
                  if (isPlaying) togglePlay();
                  const t = parseFloat(e.target.value);
                  // Manually step the time
                  stepForward(t - time);
                }}
                className="flex-1 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-500 font-mono">{tFlight.toFixed(2)}s</span>
            </div>

            {/* Simulation speed selection */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Speed:</span>
              <select
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="border border-slate-200 bg-white rounded p-1 text-slate-700 font-mono font-medium outline-none cursor-pointer text-xs"
              >
                <option value="0.1">0.1x</option>
                <option value="0.5">0.5x</option>
                <option value="1.0">1.0x (Real)</option>
                <option value="2.0">2.0x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scientific Graph Laboratory */}
        <div className="shrink-0 min-h-[300px]">
          <ScientificGraphLab
            graphs={projectileGraphs}
            trials={recorder.recordedRows}
            realtimePoints={tVals.map((tVal, i) => ({ t: tVal, x: xVals[i], y: yVals[i], xPos: xVals[i], yPos: yVals[i] }))}
            simulationParams={{ velocity: params.v0, angle: params.angle, gravity: params.g, initialHeight: params.h0 }}
            onRecordTrial={recorder.recordTrial}
            onClearTrials={recorder.clearTrials}
            columns={recorder.columns}
            height={260}
          />
        </div>

      </div>
    </div>
  );
}
