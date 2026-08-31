import { BlockMath } from '../../Math';
import { Sparkles, BookOpen, Maximize2, FileText, Lightbulb, Activity, AlertTriangle } from 'lucide-react';
const INCLINED_THEORY_NOTES = {
  en: {
    badge: 'Mechanics • Friction on an Inclined Plane Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Force Resolution',
    tabFormulas: 'Equations & Motion Regimes',
    tabTips: 'Common Mistakes & Senath Core Rules',

    // Sec 1 & 2
    sec1Title: '1. The Situation & Forces on an Incline',
    sec1Body: 'Consider a block of mass m resting on a rough plane inclined at angle θ. The three primary forces acting on the block are:',
    sec1List: [
      'Weight (mg): Acts vertically downward towards Earth center.',
      'Normal Reaction (R): Acts perpendicular to the inclined surface.',
      'Friction (F): Acts parallel to the inclined surface.'
    ],

    sec2Title: '2. Why Do We Resolve the Weight?',
    sec2Body: 'The weight mg does not act along or perpendicular to the plane. Resolving it into two orthogonal components:',
    sec2Parallel: 'Parallel to plane: W_∥ = mg sin θ (pulls block down the slope).',
    sec2Perp: 'Perpendicular to plane: W_⊥ = mg cos θ (pushes block into the surface).',

    // Sec 3 & 4
    sec3Title: '3. Normal Reaction Equation',
    sec3Body: 'Since there is no acceleration perpendicular to the incline, forces balance vertically to the surface: R = mg cos θ. Friction depends directly on R.',

    sec4Title: '4. What Does Friction Really Do?',
    sec4Body: 'Friction opposes the TENDENCY of relative motion between surfaces (NOT simply direction of motion!).',
    sec4RuleDown: 'Block tending/moving down slope → Friction F acts UP the slope.',
    sec4RuleUp: 'Block pushed/moving up slope → Friction F acts DOWN the slope.',

    // Sec 5 & 6
    sec5Title: '5. Limiting Friction & Maximum Value',
    sec5Body: 'When slipping is imminent, static friction reaches its maximum: F_max = μ_s R = μ_s mg cos θ.',

    sec6Title: '6. Static Friction Behavior',
    sec6Body: 'Static friction is self-adjusting (F_s ≤ μ_s R). It takes whatever value is necessary to prevent slipping up to F_max.',

    // Sec 7 & 8
    sec7Title: '7. Block at Rest & Equilibrium Condition',
    sec7Body: 'For a block at rest tending to slide down: F = mg sin θ. Slipping occurs only when mg sin θ > μ_s mg cos θ ⟹ tan θ > μ_s. Thus for rest: tan θ ≤ μ_s.',

    sec8Title: '8. Angle of Friction / Angle of Repose (θ_r)',
    sec8Body: 'The maximum incline angle at which a block remains at rest is the Angle of Repose θ_r: μ_s = tan θ_r.',

    // Sec 9 & 10
    sec9Title: '9. Block Sliding Down the Plane',
    sec9Body: 'Along the plane: mg sin θ - F_k = m a. Since F_k = μ_k mg cos θ, acceleration is: a = g (sin θ - μ_k cos θ).',

    sec10Title: '10. Block Pushed Up the Plane',
    sec10Body: 'When an external force P pushes the block up: P - mg sin θ - F_k = m a ⟹ a = (P/m) - g sin θ - μ_k g cos θ.',

    // Sec 11 & 12
    sec11Title: '11. Useful Force Resolution Diagram',
    sec11Body: 'Decomposing weight mg along and perpendicular to the incline surface:',

    sec12Title: '12. Common Pitfalls & Mistakes ⚠️',
    mistakes: [
      '❌ Mistake 1: Using mg cos θ along the plane (Wrong! mg sin θ is parallel, mg cos θ is perpendicular).',
      '❌ Mistake 2: Always setting static friction equal to μ R (Wrong! Static friction F_s ≤ μ_s R is self-adjusting).',
      '❌ Mistake 3: Assuming friction always opposes velocity (Wrong! Friction opposes relative motion or its TENDENCY).',
      '❌ Mistake 4: Assuming Normal reaction R = mg on incline (Wrong! R = mg cos θ on an incline).'
    ],

    // Formula Box & Senath Core Rules
    formulaBoxTitle: '📌 Essential Inclined Plane Formula Box',

    senathHeader: '🧠 Physics by Senath — The Core Idea',
    senathCoreBox: 'When you see a rough inclined plane, immediately resolve weight: mg sin θ (down slope), mg cos θ (into plane).',
    senathSteps: [
      '1. Calculate Normal Reaction: R = mg cos θ',
      '2. Determine tendency of relative motion',
      '3. Assign direction of friction (opposite tendency)',
      '4. Select static (F_s ≤ μ_s R) or kinetic (F_k = μ_k R) equation',
      '5. Apply ∑F = m a along the slope'
    ],
    senathMotto: 'Don’t memorize friction direction. Determine it from the tendency of motion!',

    varGuideTitle: 'Variables & SI Units Reference Guide',
    vars: [
      { sym: 'm', name: 'Mass of Block', unit: 'kg' },
      { sym: 'θ', name: 'Incline Angle', unit: 'degrees (°)' },
      { sym: 'g', name: 'Gravitational Acceleration', unit: 'm/s²' },
      { sym: 'R, N', name: 'Normal Reaction Force', unit: 'N' },
      { sym: 'W_∥', name: 'Weight Parallel (mg sin θ)', unit: 'N' },
      { sym: 'W_⊥', name: 'Weight Perpendicular (mg cos θ)', unit: 'N' },
      { sym: 'F', name: 'Friction Force', unit: 'N' },
      { sym: 'μs', name: 'Static Friction Coefficient', unit: 'Dimensionless' },
      { sym: 'μk', name: 'Kinetic Friction Coefficient', unit: 'Dimensionless' },
      { sym: 'θ_r', name: 'Angle of Repose (tan θ_r = μs)', unit: 'degrees (°)' },
      { sym: 'a', name: 'Acceleration down/up slope', unit: 'm/s²' }
    ]
  },
  si: {
    badge: 'යාන්ත්‍ර විද්‍යාව • ආනත තලයක ඝර්ෂණය අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ බල බෙදීම',
    tabFormulas: 'සමීකරණ සහ චලිත අවස්ථා',
    tabTips: 'සාමාන්‍ය වැරදි සහ සෙනත් නීති',

    sec1Title: '1. ආනත තලයක ඇති වස්තුවක් මත ක්‍රියාකරන බල',
    sec1Body: 'θ කෝණයකින් ආනත රළු තලයක් මත ඇති m ස්කන්ධයක් සහිත වස්තුවක් සලකන්න. එහි ක්‍රියාකරන ප්‍රධාන බල 3කි:',
    sec1List: [
      'බර (mg): සිරස්ව පහළට පෘථිවි කේන්ද්‍රය දෙසට.',
      'අභිලම්භ ප්‍රතික්‍රියාව (R): ආනත තලයට ලම්බකව ඉහළට.',
      'ඝර්ෂණ බලය (F): ආනත තලයට සමාන්තරව.'
    ],

    sec2Title: '2. බර (mg) විභේදනය කරන්නේ ඇයි?',
    sec2Body: 'mg බර තලයට සමාන්තරව හෝ ලම්බකව ක්‍රියා නොකරයි. එම නිසා එය ලම්බක සංරචක දෙකකට බෙදනු ලැබේ:',
    sec2Parallel: 'තලයට සමාන්තරව: W_∥ = mg sin θ (වස්තුව තලය දිගේ පහළට අදියි).',
    sec2Perp: 'තලයට ලම්බකව: W_⊥ = mg cos θ (වස්තුව තලයට තද කරයි).',

    sec3Title: '3. අභිලම්භ ප්‍රතික්‍රියා සමීකරණය',
    sec3Body: 'තලයට ලම්බකව ත්වරණයක් නැති නිසා බල සමතුලිත වේ: R = mg cos θ. ඝර්ෂණය කෙළින්ම R මත රඳා පවතී.',

    sec4Title: '4. ඝර්ෂණ බලයේ සැබෑ කාර්යභාරය',
    sec4Body: 'ඝර්ෂණය සැමවිටම සාපේක්ෂ චලිත ප්‍රවණතාවට ප්‍රතිවිරුද්ධව ක්‍රියා කරයි (චලිතයේ දිශාවට පමණක් නොවේ!).',
    sec4RuleDown: 'වස්තුව පහළට ලිස්සා යාමට තත් කරන්නේ නම් → ඝර්ෂණය F ඉහළට ක්‍රියා කරයි.',
    sec4RuleUp: 'වස්තුව ඉහළට තල්ලු කරන්නේ/යන්නේ නම් → ඝර්ෂණය F පහළට ක්‍රියා කරයි.',

    sec5Title: '5. සීමාකාරී ඝර්ෂණය',
    sec5Body: 'වස්තුව ලිස්සා යාමට ආසන්න වන විට ස්ථිතික ඝර්ෂණය උපරිම වේ: F_max = μ_s R = μ_s mg cos θ.',

    sec6Title: '6. ස්ථිතික ඝර්ෂණයේ ස්වභාවය',
    sec6Body: 'ස්ථිතික ඝර්ෂණය ස්වයං-සංස්ථාපන බලයකි (F_s ≤ μ_s R). ලිස්සා යාම වැළැක්වීමට අවශ්‍ය ප්‍රමාණයට පමණක් සකස් වේ.',

    sec7Title: '7. තලය මත නිශ්චලව ඇති වස්තුවක සමතුලිතතාව',
    sec7Body: 'පහළට ලිස්සා යාමට තත් කරන නිශ්චල වස්තුවක් සඳහා: F = mg sin θ. ලිස්සා යාම සිදුවන්නේ mg sin θ > μ_s mg cos θ ⟹ tan θ > μ_s වන විටය. නිශ්චලතාව සඳහා: tan θ ≤ μ_s.',

    sec8Title: '8. ඝර්ෂණ කෝණය / ස්වාභාවික ආනති කෝණය (θ_r)',
    sec8Body: 'වස්තුවක් තලය මත නිශ්චලව තැබිය හැකි උපරිම කෝණය ස්වාභාවික ආනති කෝණය θ_r වේ: μ_s = tan θ_r.',

    sec9Title: '9. වස්තුව තලය දිගේ පහළට ලිස්සා යාම',
    sec9Body: 'තලය දිගේ: mg sin θ - F_k = m a. මෙහි F_k = μ_k mg cos θ නිසා ත්වරණය: a = g (sin θ - μ_k cos θ).',

    sec10Title: '10. වස්තුව තලය දිගේ ඉහළට තල්ලු කිරීම',
    sec10Body: 'බාහිර P බලයකින් ඉහළට තල්ලු කරන විට: P - mg sin θ - F_k = m a ⟹ a = (P/m) - g sin θ - μ_k g cos θ.',

    sec11Title: '11. බල විභේදන සටහන',
    sec11Body: 'mg බර තලයට සමාන්තරව සහ ලම්බකව විභේදනය කිරීම:',

    sec12Title: '12. සිසුන් අතින් සිදුවන සාමාන්‍ය වැරදි ⚠️',
    mistakes: [
      '❌ වැරදි 1: තලය දිගේ mg cos θ යෙදීම (වැරදියි! mg sin θ යනු තලයට සමාන්තර සංරචකයයි).',
      '❌ වැරදි 2: ස්ථිතික ඝර්ෂණය සැමවිටම μ R ලෙස ගැනීම (වැරදියි! ස්ථිතික ඝර්ෂණය F_s ≤ μ_s R වේ).',
      '❌ වැරදි 3: ඝර්ෂණය සැමවිටම ප්‍රවේගයට ප්‍රතිවිරුද්ධ බව සිතීම (වැරදියි! ඝර්ෂණය ප්‍රතිවිරුද්ධ වන්නේ සාපේක්ෂ චලිත ප්‍රවණතාවටයි).',
      '❌ වැරදි 4: ආනත තලයක අභිලම්භ ප්‍රතික්‍රියාව R = mg ලෙස ගැනීම (වැරදියි! ආනත තලයක R = mg cos θ වේ).'
    ],

    formulaBoxTitle: '📌 ප්‍රධාන සමීකරණ එකතුව',

    senathHeader: '🧠 Physics by Senath — මූලික නීතිය',
    senathCoreBox: 'ආනත තලයක් දුටු සැනින් mg බර විභේදනය කරන්න: mg sin θ (පහළට), mg cos θ (තලයට ලම්බකව).',
    senathSteps: [
      '1. අභිලම්භ ප්‍රතික්‍රියාව සොයන්න: R = mg cos θ',
      '2. සාපේක්ෂ චලිත ප්‍රවණතාව තීරණය කරන්න',
      '3. ඝර්ෂණයේ දිශාව ලකුණු කරන්න (ප්‍රවණතාවට ප්‍රතිවිරුද්ධව)',
      '4. ස්ථිතික (F_s ≤ μ_s R) හෝ ගතික (F_k = μ_k R) තෝරාගන්න',
      '5. තලය දිගේ ∑F = m a යොදන්න'
    ],
    senathMotto: 'ඝර්ෂණයේ දිශාව කටපාඩම් කරන්න එපා! චලිත ප්‍රවණතාවෙන් තීරණය කරන්න!',

    varGuideTitle: 'පරාමිතීන් සහ SI ඒකක නාමාවලිය',
    vars: [
      { sym: 'm', name: 'වස්තුවේ ස්කන්ධය', unit: 'kg' },
      { sym: 'θ', name: 'ආනති කෝණය', unit: 'අංශක (°)' },
      { sym: 'g', name: 'ගුරුත්වජ ත්වරණය', unit: 'm/s²' },
      { sym: 'R, N', name: 'අභිලම්භ ප්‍රතික්‍රියාව', unit: 'N' },
      { sym: 'W_∥', name: 'සමාන්තර බර සංරචකය (mg sin θ)', unit: 'N' },
      { sym: 'W_⊥', name: 'ලම්බක බර සංරචකය (mg cos θ)', unit: 'N' },
      { sym: 'F', name: 'ඝර්ෂණ බලය', unit: 'N' },
      { sym: 'μs', name: 'ස්ථිතික ඝර්ෂණ සංගුණකය', unit: 'ඒකක නැත' },
      { sym: 'μk', name: 'ගතික ඝර්ෂණ සංගුණකය', unit: 'ඒකක නැත' },
      { sym: 'θ_r', name: 'ස්වාභාවික ආනති කෝණය (tan θ_r = μs)', unit: 'අංශක (°)' },
      { sym: 'a', name: 'ත්වරණය', unit: 'm/s²' }
    ]
  },
  ta: {
    badge: 'இயக்கவியல் • சாய்வு தளத்தில் உராய்வு குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் விசை பகுப்பு',
    tabFormulas: 'சமன்பாடுகள் மற்றும் இயக்க நிலைகள்',
    tabTips: 'பொதுவான தவறுகள் & சேனாத் விதிகள்',

    sec1Title: '1. நிலைமை மற்றும் விசைகள்',
    sec1Body: 'θ கோணத்தில் சாய்ந்துள்ள கரடுமுரடான தளத்தில் உள்ள m திணிவுள்ள பொருளைக் கருதுக. அதன் மீது செயல்படும் 3 முக்கிய விசைகள்:',
    sec1List: [
      'எடை (mg): செங்குத்தாக கீழ்நோக்கி.',
      'செங்குத்து விசை (R): சாய்வு தளத்திற்கு செங்குத்தாக மேல்நோக்கி.',
      'உராய்வு விசை (F): சாய்வு தளத்திற்கு இணையாக.'
    ],

    sec2Title: '2. எடையை (mg) ஏன் பிரிக்கிறோம்?',
    sec2Body: 'எடை mg தளத்திற்கு இணையாகவோ செங்குத்தாகவோ செயல்படவில்லை. எனவே அது இரு கூறRenewகளாகப் பிரிக்கப்படுகிறது:',
    sec2Parallel: 'தளத்திற்கு இணையாக: W_∥ = mg sin θ (பொருளை கீழ்நோக்கி இழுக்கிறது).',
    sec2Perp: 'தளத்திற்கு செங்குத்தாக: W_⊥ = mg cos θ (பொருளை தளத்தின் மீது அழுத்துகிறது).',

    sec3Title: '3. செங்குத்து விசை சமன்பாடு',
    sec3Body: 'தளத்திற்கு செங்குத்தாக முடுக்கம் இல்லாததால்: R = mg cos θ. உராய்வு நேரடியாக R இல் தங்கியுள்ளது.',

    sec4Title: '4. உராய்வு விசை என்ன செய்கிறது?',
    sec4Body: 'உராய்வு எப்போதும் சார்பு இயக்கப் போக்கை எதிர்க்கிறது (இயக்க திசையை மட்டுமல்ல!).',
    sec4RuleDown: 'பொருள் கீழ்நோக்கி நகர முயன்றால் → உராய்வு F மேல்நோக்கி செயல்படும்.',
    sec4RuleUp: 'பொருள் மேல்நோக்கி தள்ளப்பட்டால் → உராய்வு F கீழ்நோக்கி செயல்படும்.',

    sec5Title: '5. எல்லை உராய்வு',
    sec5Body: 'பொருள் நகரத் தொடங்கும் தருணத்தில் static உராய்வு அதிகபட்சத்தை அடையும்: F_max = μ_s R = μ_s mg cos θ.',

    sec6Title: '6. நிலை உராய்வின் இயல்பு',
    sec6Body: 'நிலை உராய்வு ஒரு சுய-சரிகட்டும் விசையாகும் (F_s ≤ μ_s R).',

    sec7Title: '7. ஓய்வில் உள்ள பொருளின் சமநிலை',
    sec7Body: 'ஓய்வில் உள்ள பொருளுக்கு: F = mg sin θ. நகரத் தொடங்க: mg sin θ > μ_s mg cos θ ⟹ tan θ > μ_s. ஓய்வுக்கு: tan θ ≤ μ_s.',

    sec8Title: '8. ஓய்வுக் கோணம் (θ_r)',
    sec8Body: 'பொருள் ஓய்வில் இருக்கக்கூடிய அதிகபட்ச சாய்வுக் கோணம் ஓய்வுக் கோணம் θ_r ஆகும்: μ_s = tan θ_r.',

    sec9Title: '9. பொருள் கீழ்நோக்கி நழுவுதல்',
    sec9Body: 'தளத்தின் வழியே: mg sin θ - F_k = m a ⟹ a = g (sin θ - μ_k cos θ).',

    sec10Title: '10. பொருள் மேல்நோக்கி நகருதல்',
    sec10Body: 'வெளி விசை P மூலம் மேல்நோக்கி தள்ளப்படும் போது: P - mg sin θ - F_k = m a ⟹ a = (P/m) - g sin θ - μ_k g cos θ.',

    sec11Title: '11. விசை பகுப்பு படம்',
    sec11Body: 'எடை mg ஐ சாய்வு தளத்திற்கு இணையாகவும் செங்குத்தாகவும் பிரித்தல்:',

    sec12Title: '12. பொதுவான தவறுகள் ⚠️',
    mistakes: [
      '❌ தவறு 1: தளத்தின் வழியே mg cos θ ஐப் பயன்படுத்துதல் (தவறு! mg sin θ இணையானது).',
      '❌ தவறு 2: நிலை உராய்வை எப்போதும் μ R என எடுத்தல் (தவறு! F_s ≤ μ_s R).',
      '❌ தவறு 3: உராய்வு எப்போதும் திசைவேகத்திற்கு எதிரானது என நினைத்தல் (தவறு! சார்பு இயக்கப் போக்கிற்கு எதிரானது).',
      '❌ தவறு 4: சாய்வு தளத்தில் R = mg என எடுத்தல் (தவறு! R = mg cos θ).'
    ],

    formulaBoxTitle: '📌 முக்கிய சமன்பாடுகள்',

    senathHeader: '🧠 Physics by Senath — முக்கிய விதி',
    senathCoreBox: 'சாய்வு தளத்தைக் கண்டவுடன் எடையைப் பிரிக்கவும்: mg sin θ (கீழ்நோக்கி), mg cos θ (செங்குத்தாக).',
    senathSteps: [
      '1. செங்குத்து விசையைக் காணவும்: R = mg cos θ',
      '2. சார்பு இயக்கப் போக்கைக் கண்டறியவும்',
      '3. உராய்வு திசையைக் குறிக்கவும் (போக்கிற்கு எதிராக)',
      '4. நிலை (F_s ≤ μ_s R) அல்லது இயக்க (F_k = μ_k R) உராய்வைத் தேர்ந்தெடுக்கவும்',
      '5. தளத்தின் வழியே ∑F = m a ஐப் பயன்படுத்தவும்'
    ],
    senathMotto: 'உராய்வு திசையை மனனம் செய்யாதீர்கள்! இயக்கப் போக்கிலிருந்து தீர்மானியுங்கள்!',

    varGuideTitle: 'மாறிகள் மற்றும் SI அலகுகள் வழிகாட்டி',
    vars: [
      { sym: 'm', name: 'திணிவு', unit: 'kg' },
      { sym: 'θ', name: 'சாய்வுக் கோணம்', unit: 'பாகை (°)' },
      { sym: 'g', name: 'புவியீர்ப்பு முடுக்கம்', unit: 'm/s²' },
      { sym: 'R, N', name: 'செங்குத்து விசை', unit: 'N' },
      { sym: 'W_∥', name: 'இணை எடைக்கூறு (mg sin θ)', unit: 'N' },
      { sym: 'W_⊥', name: 'செங்குத்து எடைக்கூறு (mg cos θ)', unit: 'N' },
      { sym: 'F', name: 'உராய்வு விசை', unit: 'N' },
      { sym: 'μs', name: 'நிலை உராய்வு குணகம்', unit: 'அலகற்றது' },
      { sym: 'μk', name: 'இயக்க உராய்வு குணகம்', unit: 'அலகற்றது' },
      { sym: 'θ_r', name: 'ஓய்வுக் கோணம் (tan θ_r = μs)', unit: 'பாகை (°)' },
      { sym: 'a', name: 'முடுக்கம்', unit: 'm/s²' }
    ]
  }
};

import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import {
  calculateInclinedForces,
  stepInclinedSimulation,
  InclinedPlaneParameters,
} from '../../../physics/inclinedPlanePhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { Play, Pause, RotateCcw, SkipForward,  ClipboardList } from 'lucide-react';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { inclinedPlaneGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_OBSERVATION_NOTEBOOKS } from '../../../config/features';

export function InclinedPlaneSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      inclineAngle: 'Incline Angle (θ)',
      mass: 'Block Mass (m)',
      staticFriction: 'Static Friction (μₛ)',
      kineticFriction: 'Kinetic Friction (μₖ)',
      gravity: 'Gravity (g)',
      vectors: 'Show Vector Force Arrows',
      theoryOutput: 'Theoretical Kinematics',
      acceleration: 'Acceleration (a)',
      fricForce: 'Friction Force (f)',
      normalForce: 'Normal Force (R)',
      staticThreshold: 'Friction Threshold',
      play: 'Play',
      pause: 'Pause',
      step: 'Step Forward',
      reset: 'Reset',
      logData: 'Record Data Point',
      downloadPDF: 'Download PDF Report',
      labNotes: 'Observation Notebook',
      trialHistory: 'Logged Trials History',
      clearLogs: 'Clear Logs'
    },
    si: {
      paramsTitle: 'පරාමිතීන්',
      inclineAngle: 'ඇලවීම් කෝණය (θ)',
      mass: 'ස්කන්ධය (m)',
      staticFriction: 'ස්ථිතික ඝර්ෂණ සංගුණකය (μₛ)',
      kineticFriction: 'ගතික ඝර්ෂණ සංගුණකය (μₖ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'බල දෛශික ඊතල පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක චලිතය',
      acceleration: 'ත්වරණය (a)',
      fricForce: 'ඝර්ෂණ බලය (f)',
      normalForce: 'අභิලම්භ ප්‍රතික්‍රියාව (R)',
      staticThreshold: 'සීමාකාරී ඝර්ෂණය',
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
      inclineAngle: 'சாய்வுக் கோணம் (θ)',
      mass: 'நிறை (m)',
      staticFriction: 'நிலை உராய்வு குணகம் (μₛ)',
      kineticFriction: 'இயக்க உராய்வு குணகம் (μₖ)',
      gravity: 'ஈர்ப்பு முடுக்கம் (g)',
      vectors: 'விசை திசையன்களைக் காட்டு',
      theoryOutput: 'கோட்பாட்டு இயக்கவியல்',
      acceleration: 'முடுக்கம் (a)',
      fricForce: 'உராய்வு விசை (f)',
      normalForce: 'செங்குத்து விசை (R)',
      staticThreshold: 'உராய்வு வரம்பு',
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

  const [viewMode, setViewMode] = useState<'notebook' | 'sim_only'>('notebook');
  const [activeTheoryTab, setActiveTheoryTab] = useState<'theory' | 'formulas' | 'tips'>('theory');
  const tn = INCLINED_THEORY_NOTES[lang] || INCLINED_THEORY_NOTES.en;

  const maxTrackLength = 15; // meters

  // 1. Parameters & State
  const [params, setParams] = useState<InclinedPlaneParameters>({
    angle: 30,
    mass: 5,
    muStatic: 0.5,
    muKinetic: 0.35,
    g: 10,
  });

  const [dynamics, setDynamics] = useState<{ distance: number; velocity: number }>({
    distance: 7.5, // start in the middle (meters)
    velocity: 0,
  });

  const [showVectors, setShowVectors] = useState(true);

  // Lab Notes State
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'inclined_sim',
    simulationTitle: 'Inclined Plane Dynamics',
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'angle', label: 'Incline Angle θ', unit: '°' },
      { key: 'sinAngle', label: 'sin(θ)', unit: '' },
      { key: 'mass', label: 'Mass m', unit: 'kg' },
      { key: 'acceleration', label: 'Acceleration a', unit: 'm/s²' },
      { key: 'normalForce', label: 'Normal Force R', unit: 'N' },
      { key: 'frictionForce', label: 'Friction Force f', unit: 'N' },
    ],
    getCurrentRow: () => {
      const angleRad = (params.angle * Math.PI) / 180;
      return {
        angle: params.angle,
        sinAngle: parseFloat(Math.sin(angleRad).toFixed(3)),
        mass: params.mass,
        acceleration: parseFloat(currentDynamics.acceleration.toFixed(2)),
        normalForce: parseFloat(currentDynamics.normalForce.toFixed(2)),
        frictionForce: parseFloat(currentDynamics.frictionForce.toFixed(2)),
      };
    },
    getSeriesData: () => {
      const angles = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
      return angles.map((ang, idx) => {
        const rad = (ang * Math.PI) / 180;
        const gVal = params.g || 10;
        const netA = Math.max(0, gVal * (Math.sin(rad) - params.muKinetic * Math.cos(rad)));
        const rNorm = params.mass * gVal * Math.cos(rad);
        const fFric = params.muKinetic * rNorm;
        return {
          trial: idx + 1,
          angle: ang,
          sinAngle: parseFloat(Math.sin(rad).toFixed(3)),
          mass: params.mass,
          acceleration: parseFloat(netA.toFixed(2)),
          normalForce: parseFloat(rNorm.toFixed(2)),
          frictionForce: parseFloat(fFric.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Incline Angle θ = 15°', params: { angle: 15 }, durationMs: 750 },
        { label: 'Incline Angle θ = 25°', params: { angle: 25 }, durationMs: 750 },
        { label: 'Incline Angle θ = 35°', params: { angle: 35 }, durationMs: 750 },
        { label: 'Incline Angle θ = 45°', params: { angle: 45 }, durationMs: 750 },
        { label: 'Incline Angle θ = 55°', params: { angle: 55 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        setParams((prev) => ({ ...prev, ...p }));
      },
    },
    defaultGraphConfig: {
      xAxis: 'sinAngle',
      yAxis: 'acceleration',
      title: 'Acceleration vs sin(θ) (Slope = g)',
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Incline Angle (θ)': `${params.angle}°`,
      'Block Mass (m)': `${params.mass} kg`,
      'Static Friction (μs)': `${params.muStatic}`,
      'Kinetic Friction (μk)': `${params.muKinetic}`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF('Inclined Plane Laboratory', reportParams, recorder.recordedRows, labNotes);
  };

  // Simulation time-series tracking for graphs
  const [history, setHistory] = useState<{ t: number; pos: number; vel: number; acc: number; gravityParallel: number; friction: number }[]>([]);

  // Clamp kinetic friction to be <= static friction
  const handleStaticFrictionChange = (val: number) => {
    setParams((prev) => {
      const nextK = Math.min(prev.muKinetic, val);
      return { ...prev, muStatic: val, muKinetic: nextK };
    });
  };

  const handleKineticFrictionChange = (val: number) => {
    setParams((prev) => {
      const nextS = Math.max(prev.muStatic, val);
      return { ...prev, muKinetic: val, muStatic: nextS };
    });
  };

  // Compute current forces
  const currentDynamics = calculateInclinedForces(dynamics, params);

  // 2. Simulation Engine Hook
  const {
    setTime,
    isPlaying,
    setIsPlaying,
    togglePlay,
    reset: resetEngine,
    stepForward,
    timeScale,
    setTimeScale,
  } = useSimulation({
    initialTime: 0,
    onStep: (newTime, dt) => {
      let hitEnd = false;
      // Step physics model forward
      setDynamics((prev) => {
        const next = stepInclinedSimulation(prev, params, dt, maxTrackLength);
        if (next.distance <= 0 || next.distance >= maxTrackLength) {
          if (prev.distance > 0 && prev.distance < maxTrackLength) {
            hitEnd = true;
          }
        }
        
        // Record history
        setHistory((h) => [
          ...h,
          {
            t: newTime,
            pos: next.distance,
            vel: next.velocity,
            acc: next.acceleration,
            gravityParallel: next.gravityParallel,
            friction: next.frictionForce,
          },
        ]);

        return next;
      });

      if (hitEnd) {
        setIsPlaying(false);
      }
    },
  });

  const handleReset = () => {
    resetEngine();
    setTime(0);
    setDynamics({ distance: 15, velocity: 0 });
    setHistory([]);
  };

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getDistanceFromEvent = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const margin = { left: 50, right: 50, bottom: 50, top: 50 };
    const wWidth = width - margin.left - margin.right;
    const wHeight = height - margin.top - margin.bottom;

    const thetaRad = (params.angle * Math.PI) / 180;
    const maxHeightAvailable = wHeight - 60; // leave safety padding for vectors

    let drawnWedgeHeight = maxHeightAvailable;
    let drawnWedgeWidth = drawnWedgeHeight / Math.max(0.08, Math.tan(thetaRad));

    if (drawnWedgeWidth > wWidth) {
      drawnWedgeWidth = wWidth;
      drawnWedgeHeight = drawnWedgeWidth * Math.tan(thetaRad);
    }

    if (drawnWedgeWidth < 185) {
      drawnWedgeWidth = 185;
      drawnWedgeHeight = maxHeightAvailable;
    }

    const wedgeLeftX = margin.left + (wWidth - drawnWedgeWidth) / 2;
    const wedgeTopY = margin.top + wHeight - drawnWedgeHeight;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Calculate slope vector direction
    const dx = clickX - wedgeLeftX;
    const dy = clickY - wedgeTopY;

    const slopeAngle = Math.atan2(drawnWedgeHeight, drawnWedgeWidth);
    const pixelsPerMeter = Math.sqrt(Math.pow(drawnWedgeWidth, 2) + Math.pow(drawnWedgeHeight, 2)) / maxTrackLength;

    // Project click relative coordinates along the slope line
    const pxAlongSlope = dx * Math.cos(slopeAngle) + dy * Math.sin(slopeAngle);
    const distMeters = maxTrackLength - (pxAlongSlope / pixelsPerMeter);
    return Math.max(0, Math.min(maxTrackLength, distMeters));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isPlaying) return;
    const distanceVal = getDistanceFromEvent(clientX, clientY);
    if (distanceVal === null) return;

    // Check if clicked close to block (distanceVal +/- 4.0 meters)
    if (Math.abs(distanceVal - dynamics.distance) <= 4.0) {
      setIsDragging(true);
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isPlaying) return;
    const distanceVal = getDistanceFromEvent(clientX, clientY);
    if (distanceVal === null) return;
    setDynamics({ distance: distanceVal, velocity: 0 });
    setHistory([]);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  // 3. Canvas Rendering (Inclined Wedge)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Drawing margins
    const margin = { left: 50, right: 50, bottom: 50, top: 50 };
    const wWidth = width - margin.left - margin.right;
    const wHeight = height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, width, height);

    const thetaRad = (params.angle * Math.PI) / 180;
    const maxHeightAvailable = wHeight - 60;
    
    let drawnWedgeHeight = maxHeightAvailable;
    let drawnWedgeWidth = drawnWedgeHeight / Math.max(0.08, Math.tan(thetaRad));

    if (drawnWedgeWidth > wWidth) {
      drawnWedgeWidth = wWidth;
      drawnWedgeHeight = drawnWedgeWidth * Math.tan(thetaRad);
    }

    if (drawnWedgeWidth < 185) {
      drawnWedgeWidth = 185;
      drawnWedgeHeight = maxHeightAvailable;
    }

    // Coordinate points for the inclined wedge
    const wedgeLeftX = margin.left + (wWidth - drawnWedgeWidth) / 2;
    const wedgeRightX = wedgeLeftX + drawnWedgeWidth;
    const wedgeBottomY = margin.top + wHeight;
    const wedgeTopY = wedgeBottomY - drawnWedgeHeight;

    // Draw wedge triangle (light slate gray fill)
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wedgeLeftX, wedgeBottomY);
    ctx.lineTo(wedgeRightX, wedgeBottomY);
    ctx.lineTo(wedgeLeftX, wedgeTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scale of track length
    const totalPxLength = Math.sqrt(Math.pow(drawnWedgeWidth, 2) + Math.pow(drawnWedgeHeight, 2));
    const pixelsPerMeter = totalPxLength / maxTrackLength;

    // Angle of incline along which block slides
    const slopeAngle = Math.atan2(drawnWedgeHeight, drawnWedgeWidth);

    // Compute center position of block along the slope
    // Block moves from top-left (distance = maxTrackLength) to bottom-right (distance = 0)
    // Wait, let's make it standard: distance = 0 is bottom-left, distance = 30 is top-right?
    // In our wedge: Left-X is wedgeLeftX, Top-Y is wedgeTopY. Right-X is wedgeRightX, Bottom-Y is wedgeBottomY.
    // So the incline goes down from (LeftX, TopY) to (RightX, BottomY).
    // Let's define distance = 0 at the bottom-right (wedgeRightX, wedgeBottomY)
    // and distance = 30 at the top-left (wedgeLeftX, wedgeTopY).
    const blockDistPx = (maxTrackLength - dynamics.distance) * pixelsPerMeter;

    const blockCenterX = wedgeLeftX + blockDistPx * Math.cos(slopeAngle);
    const blockCenterY = wedgeTopY + blockDistPx * Math.sin(slopeAngle);

    // Draw block aligned with slope
    const blockWidthM = 3.0;
    const blockHeightM = 2.2;
    const blockW = blockWidthM * pixelsPerMeter;
    const blockH = blockHeightM * pixelsPerMeter;

    ctx.save();
    ctx.translate(blockCenterX, blockCenterY);
    ctx.rotate(slopeAngle);

    // Draw block body
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-blockW / 2, -blockH, blockW, blockH, 3);
    ctx.fill();
    ctx.stroke();

    // Label Mass inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.mass} kg`, 0, -blockH / 2 + 4);

    // Draw Force Vector Arrows relative to slope coordinates
    if (showVectors) {
      const vectorScale = 1.8;

      // 1. Normal Force (pointing UP perpendicular to slope: angle -PI/2)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -blockH / 2);
      ctx.lineTo(0, -blockH / 2 - currentDynamics.normalForce * vectorScale);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, -blockH / 2 - currentDynamics.normalForce * vectorScale);
      ctx.lineTo(-4, -blockH / 2 - currentDynamics.normalForce * vectorScale + 6);
      ctx.lineTo(4, -blockH / 2 - currentDynamics.normalForce * vectorScale + 6);
      ctx.fill();

      // 2. Parallel Gravity components pulling block down slope (towards +X in rotated frame)
      if (Math.abs(currentDynamics.gravityParallel) > 0.1) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -blockH / 2);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale, -blockH / 2);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(currentDynamics.gravityParallel * vectorScale, -blockH / 2);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale - 6, -blockH / 2 - 4);
        ctx.lineTo(currentDynamics.gravityParallel * vectorScale - 6, -blockH / 2 + 4);
        ctx.fill();
      }

      // 3. Friction opposing motion/forces (pointing towards -X in rotated frame)
      if (Math.abs(currentDynamics.frictionForce) > 0.1) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -blockH / 2);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale, -blockH / 2);
        ctx.stroke();
        // Arrowhead
        const dir = Math.sign(currentDynamics.frictionForce);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(currentDynamics.frictionForce * vectorScale, -blockH / 2);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale - dir * 6, -blockH / 2 - 4);
        ctx.lineTo(currentDynamics.frictionForce * vectorScale - dir * 6, -blockH / 2 + 4);
        ctx.fill();
      }
    }

    ctx.restore();

    // Draw straight downward Gravitational force Fg (Unrotated global coords)
    if (showVectors) {
      const vectorScale = 1.8;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(blockCenterX, blockCenterY - blockH / 2);
      ctx.lineTo(blockCenterX, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(blockCenterX, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale);
      ctx.lineTo(blockCenterX - 4, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale - 6);
      ctx.lineTo(blockCenterX + 4, blockCenterY - blockH / 2 + params.mass * params.g * vectorScale - 6);
      ctx.fill();
    }
  }, [dynamics, params, showVectors, currentDynamics]);



  // 6. Educational Notes
  return (
    <div className="space-y-6">

      {/* Top Header with Title and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">{tn.badge}</span>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Friction on an Inclined Plane</h2>
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

      {/* INTERACTIVE THEORY NOTEBOOK CARD (Visible in Notebook Mode) */}
      {viewMode === 'notebook' && (
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

          {/* Tab 1: Theory & Force Resolution */}
          {activeTheoryTab === 'theory' && (
            <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
              {/* Sec 1: Situation */}
              <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.sec1Title}</h3>
                <p>{tn.sec1Body}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-1">
                  {tn.sec1List.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Sec 2 & 3: Weight Resolution & Normal Reaction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {tn.sec2Title}
                  </h4>
                  <p>{tn.sec2Body}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-semibold">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-150 text-blue-900">
                      {tn.sec2Parallel}
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-150 text-indigo-900">
                      {tn.sec2Perp}
                    </div>
                  </div>
                  <BlockMath math="W_{\parallel} = mg\sin\theta, \quad W_{\perp} = mg\cos\theta" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    {tn.sec3Title}
                  </h4>
                  <p>{tn.sec3Body}</p>
                  <BlockMath math="R = mg\cos\theta" />
                  <p className="text-[11px] text-slate-500">Normal reaction opposes mg cos θ perpendicular to incline.</p>
                </div>
              </div>

              {/* Sec 11: Force Resolution Diagram Box */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3 shadow-inner">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">{tn.sec11Title}</h4>
                <p className="text-slate-300 text-xs">{tn.sec11Body}</p>
                
                {/* Visual Incline Resolution Box */}
                <div className="font-mono text-[11px] bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-slate-200 text-center space-y-1">
                  <div className="text-blue-400 font-bold">R = mg cos θ (Perpendicular Normal) ↑</div>
                  <div>← Friction (F) &nbsp;&nbsp; [ BLOCK m ] &nbsp;&nbsp; mg sin θ (Parallel Pull Down) ↓</div>
                  <div className="text-amber-400 font-bold">↓ mg (Vertical Weight)</div>
                </div>
              </div>

              {/* Sec 4: What Friction Does */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2 text-amber-950 font-medium">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">{tn.sec4Title}</h4>
                <p className="text-xs">{tn.sec4Body}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 font-bold text-amber-900">{tn.sec4RuleDown}</div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 font-bold text-amber-900">{tn.sec4RuleUp}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Equations & Motion Regimes */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-5">
              {/* Sec 5, 6, 7, 8: Static, Limiting & Repose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-indigo-700 text-xs">{tn.sec5Title} & {tn.sec6Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec5Body}</p>
                  <BlockMath math="F_{\max} = \mu_s R = \mu_s mg\cos\theta" />
                  <p className="text-slate-600 text-[11px]">{tn.sec6Body}</p>
                  <BlockMath math="F_s \leq \mu_s R" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-700 text-xs">{tn.sec7Title} & {tn.sec8Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec7Body}</p>
                  <BlockMath math="\tan\theta \leq \mu_s" />
                  <p className="text-slate-600 text-[11px]">{tn.sec8Body}</p>
                  <BlockMath math="\mu_s = \tan\theta_r" />
                </div>
              </div>

              {/* Sec 9 & 10: Sliding Down vs Moving Up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-xs">{tn.sec9Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec9Body}</p>
                  <BlockMath math="a = g(\sin\theta - \mu_k\cos\theta)" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-purple-700 text-xs">{tn.sec10Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec10Body}</p>
                  <BlockMath math="a = \frac{P}{m} - g\sin\theta - \mu_k g\cos\theta" />
                </div>
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

          {/* Tab 3: Common Mistakes & Senath Core Rules */}
          {activeTheoryTab === 'tips' && (
            <div className="space-y-5">
              {/* Sec 12: Common Pitfalls & Mistakes */}
              <div className="space-y-3">
                <h3 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {tn.sec12Title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tn.mistakes.map((m: string, idx: number) => (
                    <div key={idx} className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl text-xs text-rose-950 font-medium">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Formula Box */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">{tn.formulaBoxTitle}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono font-bold text-center">
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">W_∥ = mg sin θ</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">W_⊥ = mg cos θ</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">R = mg cos θ</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">F_max = μ_s R</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">F_k = μ_k R</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">μ_s = tan θ_r</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">a = g(sin θ - μ_k cos θ)</div>
                </div>
              </div>

              {/* Senath Core Rules */}
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

          {/* Incline Angle */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.inclineAngle}</span>
              <span className="text-blue-600 font-mono">{params.angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="0.5"
              value={params.angle}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Block Mass */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.mass}</span>
              <span className="text-blue-600 font-mono">{params.mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={params.mass}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, mass: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Static Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.staticFriction}</span>
              <span className="text-blue-600 font-mono">{params.muStatic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.02"
              value={params.muStatic}
              disabled={recorder.isAutoRunning}
              onChange={(e) => handleStaticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Kinetic Friction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.kineticFriction}</span>
              <span className="text-blue-600 font-mono">{params.muKinetic.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.02"
              value={params.muKinetic}
              disabled={recorder.isAutoRunning}
              onChange={(e) => handleKineticFrictionChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Vector Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="inclined-vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="inclined-vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>

        {/* Lab Notebook */}
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
      </div>

              </div>

        {/* Right Column: Viewport & Graphs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
{/* Interactive Simulation Viewport + Graphs (6/8 cols) */}
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inclined Plane Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                Fn (Normal)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
                Friction
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 relative bg-slate-50/20 canvas-grid-bg min-h-0">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />
            {/* Live indicators */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 px-3 py-2 rounded text-[11px] font-mono space-y-1 border border-slate-800 pointer-events-none">
              <div>DISTANCE (s): <span className="text-white font-bold">{dynamics.distance.toFixed(2)} m</span></div>
              <div>VELOCITY (v): <span className="text-blue-400 font-bold">{dynamics.velocity.toFixed(2)} m/s</span></div>
              <div>ACCEL (a): <span className="text-amber-400 font-bold">{currentDynamics.acceleration.toFixed(3)} m/s²</span></div>
              <div>
                STATE: {Math.abs(dynamics.velocity) < 1e-4 ? (
                  <span className="text-red-400 font-bold uppercase">Locked (Static)</span>
                ) : (
                  <span className="text-emerald-400 font-bold uppercase">Sliding (Kinetic)</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-lg shrink-0">
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
                disabled={isPlaying}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Step Forward (dt = 20ms)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed select */}
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
            graphs={inclinedPlaneGraphs}
            trials={recorder.recordedRows}
            realtimePoints={history.map(h => ({ t: h.t, x: h.pos, y: h.vel, position: h.pos, velocity: h.vel, acceleration: h.acc }))}
            simulationParams={params}
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