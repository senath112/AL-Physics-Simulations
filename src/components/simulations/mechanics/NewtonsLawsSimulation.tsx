import { BlockMath } from '../../Math';
import { Sparkles, Info, BookOpen, Maximize2, FileText, Lightbulb, Activity } from 'lucide-react';
const NEWTONS_THEORY_NOTES = {
  en: {
    badge: 'Mechanics • Newton’s Laws Interactive Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Basic Laws',
    tabFormulas: 'Equations & Vector Method',
    tabTips: 'Key Ideas & Senath Rules',

    // Sec 1 & 2
    sec1Title: '1. The Basic Idea of Newton’s Second Law',
    sec1Body: 'Newton’s Second Law tells us how a resultant force changes the motion of an object. The acceleration produced is directly proportional to the net force and inversely proportional to mass.',
    sec2Title: '2. What Does “Net Force” Mean?',
    sec2Body: 'An object can experience multiple forces simultaneously. The net force is their vector sum: F_net = ∑F.',
    sec2Example: 'Example: A 5 kg box pushed with 20 N right against 5 N friction left has F_net = 20 - 5 = 15 N → a = 15/5 = 3 m/s² right.',

    // Sec 3, 4, 5
    sec3Title: '3. Vector Form of Newton’s Law',
    sec3Body: 'F_net = m a is fundamentally a vector equation. The direction of acceleration is ALWAYS identical to the direction of the net force.',

    sec4Title: '4. Force vs Acceleration Relationship',
    sec4Body: 'For constant mass m: F_net ∝ a. Doubling the net force doubles the acceleration (F → 2F ⟹ a → 2a).',

    sec5Title: '5. Mass vs Acceleration Relationship',
    sec5Body: 'For constant net force F: a ∝ 1/m. Increasing mass decreases acceleration (Heavier objects accelerate less under the same force).',

    // Sec 6, 7, 8
    sec6Title: '6. SI Unit of Force (The Newton)',
    sec6Body: 'From F = ma, the unit is kg·m·s⁻², defined as the Newton (N). 1 N is the force required to accelerate 1 kg by 1 m/s².',

    sec7Title: '7. Free-Body Diagrams (FBD)',
    sec7Body: 'A Free-Body Diagram isolates the object to show all external forces: Normal force N (up), Weight mg (down), Applied Force (right), and Friction (left).',

    sec8Title: '8. 5-Step Method for Applying Newton’s Second Law',
    steps: [
      'Step 1 — Draw the object: Identify the body being analysed.',
      'Step 2 — Draw all forces: Weight, Normal force, Tension, Friction, Applied forces.',
      'Step 3 — Choose positive directions: e.g. Right (+x), Left (-x).',
      'Step 4 — Find resultant force: ∑F_x = m a_x and ∑F_y = m a_y.',
      'Step 5 — Solve: Substitute knowns and solve for unknown acceleration or force.'
    ],

    // Sec 9 & 10
    sec9Title: '9. Equilibrium (Zero Net Force)',
    sec9Body: 'If F_net = 0, then a = 0. Zero acceleration does NOT mean zero velocity! An object can be stationary OR moving at constant velocity.',

    sec10Title: '10. Newton’s Second Law and Momentum',
    sec10Body: 'Momentum p = m v. The general law is F_net = dp/dt. For constant mass, F_net = d(mv)/dt = m a.',

    // Key Ideas & Senath Exploration
    keyIdeasHeader: '🧠 Key Ideas to Remember',
    keyIdeas: [
      { id: '①', title: 'Force Produces Acceleration', eq: 'F_net = m a', desc: 'Net force accelerates mass.' },
      { id: '②', title: 'Always Use NET Force', eq: 'F_net = ∑F', desc: 'Find vector sum of all forces first.' },
      { id: '③', title: 'Parallel Directions', eq: 'F_net ∥ a', desc: 'Acceleration points in the direction of F_net.' },
      { id: '④', title: 'Mass Resists Acceleration', eq: 'a ∝ 1/m', desc: 'More mass leads to less acceleration.' },
      { id: '⑤', title: 'Zero Net Force = Zero Accel', eq: 'F_net = 0 ⟹ a = 0', desc: 'Can still move at constant velocity!' }
    ],

    formulaBoxTitle: '📌 Essential Formula Box',

    exploreTitle: '🧪 Physics by Senath — Explore It',
    exploreBody: 'Change the mass and net force in the simulation below and observe acceleration live:',
    exploreQ1: '• Keep force constant and increase mass → Watch acceleration decrease.',
    exploreQ2: '• Keep mass constant and increase force → Watch acceleration increase.',
    exploreSummary: 'That is Newton’s Second Law in action.',

    varGuideTitle: 'Variables & SI Units Reference Guide',
    vars: [
      { sym: 'F_net', name: 'Resultant Net Force', unit: 'N (kg·m·s⁻²)' },
      { sym: 'm', name: 'Mass of Object', unit: 'kg' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' },
      { sym: 'F', name: 'Applied Horizontal Force', unit: 'N' },
      { sym: 'f', name: 'Friction Force (Static/Kinetic)', unit: 'N' },
      { sym: 'N, R', name: 'Normal Reaction Force', unit: 'N' },
      { sym: 'mg', name: 'Gravitational Weight Force', unit: 'N' },
      { sym: 'p', name: 'Linear Momentum (m·v)', unit: 'kg·m/s' },
      { sym: 'μs, μk', name: 'Friction Coefficients', unit: 'Dimensionless' }
    ]
  },
  si: {
    badge: 'යාන්ත්‍ර විද්‍යාව • නියුටන්ගේ දෙවන නියමය අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ මූලික නියම',
    tabFormulas: 'සමීකරණ සහ දෛශික ක්‍රමය',
    tabTips: 'ප්‍රධාන සංකල්ප සහ සෙනත් නීති',

    sec1Title: '1. නියුටන්ගේ දෙවන නියමයේ මූලික සංකල්පය',
    sec1Body: 'ප්‍රතිඵල බලයක් මගින් වස්තුවක චලිතය වෙනස් වන ආකාරය නියුටන්ගේ දෙවන නියමයෙන් පැහැදිලි කරයි. ඇතිවන ත්වරණය ප්‍රතිඵල බලයට ඍජුව සමානුපාතික වන අතර ස්කන්ධයට ප්‍රතිලෝමව සමානුපාතික වේ.',
    sec2Title: '2. "සම්ප්‍රයුක්ත බලය" යනු කුමක්ද?',
    sec2Body: 'වස්තුවක් මත බල කිහිපයක් එකවර ක්‍රියා කළ හැක. සම්ප්‍රයුක්ත බලය යනු එම බලවල දෛශික එකතුවයි: F_net = ∑F.',
    sec2Example: 'උදාහරණ: 5 kg පෙට්ටියක් 20 N බලයකින් දකුණට තල්ලු කරන විට 5 N ඝර්ෂණයක් වමට ක්‍රියා කරයි නම් F_net = 20 - 5 = 15 N → a = 15/5 = 3 m/s² දකුණට.',

    sec3Title: '3. නියුටන් නියමයේ දෛශික ස්වරූපය',
    sec3Body: 'F_net = m a යනු දෛශික සමීකරණයකි. ත්වරණයේ දිශාව සැමවිටම සම්ප්‍රයුක්ත බලයේ දිශාවට සමාන වේ.',

    sec4Title: '4. බලය සහ ත්වරණය අතර සම්බන්ධතාව',
    sec4Body: 'නියත ස්කන්ධයක් සඳහා: F_net ∝ a. බලය දෙගුණ කළ විට ත්වරණයද දෙගුණ වේ (F → 2F ⟹ a → 2a).',

    sec5Title: '5. ස්කන්ධය සහ ත්වරණය අතර සම්බන්ධතාව',
    sec5Body: 'නියත බලයක් සඳහා: a ∝ 1/m. ස්කන්ධය වැඩිවන විට ත්වරණය අඩුවේ (වඩා බර වස්තු එකම බලය යටතේ අඩුවෙන් ත්වරණය වේ).',

    sec6Title: '6. බලයේ SI ඒකකය (නියුටන්)',
    sec6Body: 'F = ma මගින් ඒකකය kg·m·s⁻² වන අතර එය නියුටන් (N) ලෙස හැඳින්වේ. 1 N යනු 1 kg ස්කන්ධයක 1 m/s² ත්වරණයක් ඇති කිරීමට අවශ්‍ය බලයයි.',

    sec7Title: '7. නිදහස් වස්තු රූප සටහන් (FBD)',
    sec7Body: 'නිදහස් වස්තු රූප සටහනක් මගින් වස්තුව මත ක්‍රියා කරන සියලුම බාහිර බලයන් පෙන්වයි: අභිලම්භ ප්‍රතික්‍රියාව N (ඉහළට), බර mg (පහළට), යෙදූ බලය (දකුණට), සහ ඝර්ෂණය (වමට).',

    sec8Title: '8. නියුටන්ගේ දෙවන නියමය යෙදීමේ පියවර 5',
    steps: [
      'පියවර 1 — වස්තුව ඇඳගන්න: විශ්ලේෂණය කරන වස්තුව හඳුනාගන්න.',
      'පියවර 2 — සියලුම බලයන් ලකුණු කරන්න: බර, අභිලම්භය, ඇදුම, ඝර්ෂණය, යෙදූ බල.',
      'පියවර 3 — ධන දිශාව තෝරාගන්න: උදා. දකුණට (+x), වමට (-x).',
      'පියවර 4 — සම්ප්‍රයුක්ත බලය සොයන්න: ∑F_x = m a_x සහ ∑F_y = m a_y.',
      'පියවර 5 — විසඳන්න: දන්නා අගයන් ආදේශ කර නොදන්නා ත්වරණය හෝ බලය ගණනය කරන්න.'
    ],

    sec9Title: '9. සමතුලිතතාව (ශූන්‍ය සම්ප්‍රයුක්ත බලය)',
    sec9Body: 'F_net = 0 නම්, a = 0 වේ. ශූන්‍ය ත්වරණය යනු ප්‍රවේගය ශූන්‍ය වීම නොවේ! වස්තුව නිශ්චලව තිබිය හැක නැතහොත් නියත ප්‍රවේගයෙන් ගමන් කළ හැක.',

    sec10Title: '10. නියුටන් දෙවන නියමය සහ සංවේගය',
    sec10Body: 'සංවේගය p = m v. සාධාරණ නියමය F_net = dp/dt වේ. නියත ස්කන්ධයක් සඳහා F_net = m a ලැබේ.',

    keyIdeasHeader: '🧠 මතක තබාගත යුතු ප්‍රධාන කරුණු',
    keyIdeas: [
      { id: '①', title: 'බලයෙන් ත්වරණයක් ඇතිවේ', eq: 'F_net = m a', desc: 'සම්ප්‍රයුක්ත බලය මගින් ස්කන්ධය ත්වරණය කරයි.' },
      { id: '②', title: 'සැමවිටම සම්ප්‍රයුක්ත බලය ගන්න', eq: 'F_net = ∑F', desc: 'පළමුව සියලු බලවල දෛශික එකතුව සොයන්න.' },
      { id: '③', title: 'සමාන්තර දිශා', eq: 'F_net ∥ a', desc: 'ත්වරණයේ දිශාව සම්ප්‍රයුක්ත බලයේ දිශාවමය.' },
      { id: '④', title: 'ස්කන්ධය ත්වරණයට බාධා කරයි', eq: 'a ∝ 1/m', desc: 'ස්කන්ධය වැඩිවන විට ත්වරණය අඩුවේ.' },
      { id: '⑤', title: 'ශූන්‍ය බලය = ශූන්‍ය ත්වරණය', eq: 'F_net = 0 ⟹ a = 0', desc: 'නමුත් නියත ප්‍රවේගයෙන් ගමන් කළ හැක!' }
    ],

    formulaBoxTitle: '📌 ප්‍රධාන සමීකරණ එකතුව',

    exploreTitle: '🧪 Physics by Senath — අත්හදා බලන්න',
    exploreBody: 'පහත සිමියුලේෂන් එකේ ස්කන්ධය සහ යොදන බලය වෙනස් කර ත්වරණය නිරීක්ෂණය කරන්න:',
    exploreQ1: '• බලය නියතව තබා ස්කන්ධය වැඩි කරන්න → ත්වරණය අඩුවන ආකාරය බලන්න.',
    exploreQ2: '• ස්කන්ධය නියතව තබා බලය වැඩි කරන්න → ත්වරණය වැඩිවන ආකාරය බලන්න.',
    exploreSummary: 'ඒ නියුටන්ගේ දෙවන නියමයයි.',

    varGuideTitle: 'පරාමිතීන් සහ SI ඒකක නාමාවලිය',
    vars: [
      { sym: 'F_net', name: 'සම්ප්‍රයුක්ත බලය', unit: 'N (kg·m·s⁻²)' },
      { sym: 'm', name: 'වස්තුවේ ස්කන්ධය', unit: 'kg' },
      { sym: 'a', name: 'ත්වරණය', unit: 'm/s²' },
      { sym: 'F', name: 'යොදනු ලබන බලය', unit: 'N' },
      { sym: 'f', name: 'ඝර්ෂණ බලය', unit: 'N' },
      { sym: 'N, R', name: 'අභිලම්භ ප්‍රතික්‍රියාව', unit: 'N' },
      { sym: 'mg', name: 'ගුරුත්වාකර්ෂණ බර', unit: 'N' },
      { sym: 'p', name: 'රේඛීය සංවේගය (m·v)', unit: 'kg·m/s' },
      { sym: 'μs, μk', name: 'ඝර්ෂණ සංගුණක', unit: 'ඒකක නැත' }
    ]
  },
  ta: {
    badge: 'இயக்கவியல் • நியூட்டனின் இரண்டாம் விதி குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் அடிப்படை விதிகள்',
    tabFormulas: 'சமன்பாடுகள் மற்றும் திசையன் முறை',
    tabTips: 'முக்கிய கருத்துக்கள் & சேனாத் விதிகள்',

    sec1Title: '1. நியூட்டனின் இரண்டாம் விதியின் அடிப்படை யோசனை',
    sec1Body: 'தொகுபயன் விசை ஒரு பொருளின் இயக்கத்தை எவ்வாறு மாற்றுகிறது என்பதை நியூட்டனின் இரண்டாம் விதி கூறுகிறது. உருவாகும் முடுக்கம் தொகுபயன் விசைக்கு ನೇர்விகிதசமமாகவும் திணிவுக்கு எதிர்விகிதசமமாகவும் இருக்கும்.',
    sec2Title: '2. "தொகுபயன் விசை" என்றால் என்ன?',
    sec2Body: 'ஒரு பொருளின் மீது பல விசைகள் ஒரே நேரத்தில் செயல்படலாம். தொகுபயன் விசை என்பது அவற்றின் திசையன் கூட்டுத்தொகையாகும்: F_net = ∑F.',
    sec2Example: 'எடுத்துக்காட்டு: 5 kg பெட்டி மீது 20 N வலப்புறமும் 5 N உராய்வு இடப்புறமும் செயல்பட்டால் F_net = 20 - 5 = 15 N → a = 15/5 = 3 m/s² வலப்புறம்.',

    sec3Title: '3. திசையன் வடிவம்',
    sec3Body: 'F_net = m a என்பது அடிப்படையில் ஒரு திசையன் சமன்பாடாகும். முடுக்கத்தின் திசை எப்போதும் தொகுபயன் விசையின் திசையிலேயே இருக்கும்.',

    sec4Title: '4. விசை மற்றும் முடுக்கம்',
    sec4Body: 'மாறாத் திணிவுக்கு: F_net ∝ a. விசையை இரட்டிப்பாக்கினால் முடுக்கமும் இரட்டிப்பாகும் (F → 2F ⟹ a → 2a).',

    sec5Title: '5. திணிவு மற்றும் முடுக்கம்',
    sec5Body: 'மாறாத் தொகுபயன் விசைக்கு: a ∝ 1/m. திணிவை அதிகரிக்கும் போது முடுக்கம் குறையும்.',

    sec6Title: '6. விசையின் SI அலகு (நியூட்டன்)',
    sec6Body: 'F = ma மூலம் அலகு kg·m·s⁻² ஆகும், இது நியூட்டன் (N) எனப்படும். 1 N என்பது 1 kg திணிவை 1 m/s² முடுக்கத்தில் நகர்த்தத் தேவையான விசையாகும்.',

    sec7Title: '7. தனிப்பொருள் விசைப் படங்கள் (FBD)',
    sec7Body: 'ஒரு தனிப்பொருள் விசைப்படம் பொருளின் மீது செயல்படும் அனைத்து வெளி விசைகளையும் காட்டுகிறது: செங்குத்து விசை N (மேலே), எடை mg (கீழே), செலுத்திய விசை (வலது), மற்றும் உராய்வு (இடது).',

    sec8Title: '8. நியூட்டனின் இரண்டாம் விதியை 적용ிக்கும் 5 படிகள்',
    steps: [
      'படி 1 — பொருளை வரையவும்: பகுப்பாய்வு செய்யப்படும் பொருளை அடையாளம் காணவும்.',
      'படி 2 — அனைத்து விசைகளையும் வரையவும்: எடை, செங்குத்து விசை, இழுவிசை, உராய்வு, செலுத்திய விசை.',
      'படி 3 — நேர் திசையைத் தேர்ந்தெடுக்கவும்: எ.கா. வலது (+x), இடது (-x).',
      'படி 4 — தொகுபயன் விசையைக் காணவும்: ∑F_x = m a_x மற்றும் ∑F_y = m a_y.',
      'படி 5 — தீர்க்கவும்: தெரிந்த மதிப்புகளைப் பிரதியிட்டு முடுக்கம் அல்லது விசையைக் கணக்கிடவும்.'
    ],

    sec9Title: '9. சமநிலை (சுழி தொகுபயன் விசை)',
    sec9Body: 'F_net = 0 எனில், a = 0. சுழி முடுக்கம் என்பது சுழி திசைவேகம் என்று அர்த்தமல்ல! பொருள் ஓய்வில் இருக்கலாம் அல்லது மாறா திசைவேகத்தில் இயங்கலாம்.',

    sec10Title: '10. நியூட்டனின் இரண்டாம் விதியும் உந்தமும்',
    sec10Body: 'உந்தம் p = m v. பொதுவான விதி F_net = dp/dt ஆகும். மாறாத் திணிவுக்கு F_net = m a கிடைக்கும்.',

    keyIdeasHeader: '🧠 நினைவில் கொள்ள வேண்டிய முக்கிய கருத்துக்கள்',
    keyIdeas: [
      { id: '①', title: 'விசை முடுக்கத்தை உருவாக்குகிறது', eq: 'F_net = m a', desc: 'தொகுபயன் விசை திணிவை முடுக்குகிறது.' },
      { id: '②', title: 'எப்போதும் தொகுபயன் விசையைப் பயன்படுத்தவும்', eq: 'F_net = ∑F', desc: 'முதலில் அனைத்து விசைகளின் கூட்டுத்தொகையைக் காணவும்.' },
      { id: '③', title: 'ஒரே திசை', eq: 'F_net ∥ a', desc: 'முடுக்கம் F_net இன் திசையிலேயே இருக்கும்.' },
      { id: '④', title: 'திணிவு முடுக்கத்தை எதிர்க்கிறது', eq: 'a ∝ 1/m', desc: 'அதிக திணிவு குறைந்த முடுக்கத்தைத் தரும்.' },
      { id: '⑤', title: 'சுழி விசை = சுழி முடுக்கம்', eq: 'F_net = 0 ⟹ a = 0', desc: 'ஆனால் மாறா திசைவேகத்தில் இயங்கலாம்!' }
    ],

    formulaBoxTitle: '📌 முக்கிய சமன்பாடுகள்',

    exploreTitle: '🧪 Physics by Senath — ஆராய்க',
    exploreBody: 'உருவகப்படுத்துதலில் திணிவு மற்றும் விசையை மாற்றி முடுக்கத்தைக் கவனியுங்கள்:',
    exploreQ1: '• விசையை மாறிலியாக வைத்து திணிவை அதிகரிக்கவும் → முடுக்கம் குறைவதைக் காணவும்.',
    exploreQ2: '• திணிவை மாறிலியாக வைத்து விசையை அதிகரிக்கவும் → முடுக்கம் அதிகரிப்பதைக் காணவும்.',
    exploreSummary: 'அதுவே நியூட்டனின் இரண்டாம் விதி.',

    varGuideTitle: 'மாறிகள் மற்றும் SI அலகுகள் வழிகாட்டி',
    vars: [
      { sym: 'F_net', name: 'தொகுபயன் விசை', unit: 'N (kg·m·s⁻²)' },
      { sym: 'm', name: 'திணிவு', unit: 'kg' },
      { sym: 'a', name: 'முடுக்கம்', unit: 'm/s²' },
      { sym: 'F', name: 'செலுத்தப்படும் விசை', unit: 'N' },
      { sym: 'f', name: 'உராய்வு விசை', unit: 'N' },
      { sym: 'N, R', name: 'செங்குத்து விசை', unit: 'N' },
      { sym: 'mg', name: 'ஈர்ப்பு எடை', unit: 'N' },
      { sym: 'p', name: 'நேரியல் உந்தம் (m·v)', unit: 'kg·m/s' },
      { sym: 'μs, μk', name: 'உராய்வு குணகங்கள்', unit: 'அலகற்றது' }
    ]
  }
};

import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../../hooks/useSimulation';
import {
  calculateForcesAndKinematics,
  stepNewtonsSimulation,
  NewtonsLawsParameters,
} from '../../../physics/newtonsLawsPhysics';
import { downloadReportAsPDF } from '../../../utils/pdfGenerator';
import { Play, Pause, RotateCcw, SkipForward,  ClipboardList } from 'lucide-react';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { newtonsSecondLawGraphs } from '../../graphing/presets';
import { SimulationLabBar } from '../../laboratory/SimulationLabBar';
import { ENABLE_OBSERVATION_NOTEBOOKS } from '../../../config/features';

export function NewtonsLawsSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      appliedForce: 'Applied Force (F)',
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
      appliedForce: 'යොදනු ලබන බලය (F)',
      mass: 'ස්කන්ධය (m)',
      staticFriction: 'ස්ථිතික ඝර්ෂණ සංගුණකය (μₛ)',
      kineticFriction: 'ගතික ඝර්ෂණ සංගුණකය (μₖ)',
      gravity: 'ගුරුත්වාකර්ෂණය (g)',
      vectors: 'බල දෛශික ඊතල පෙන්වන්න',
      theoryOutput: 'න්‍යායාත්මක චලිතය',
      acceleration: 'ත්වරණය (a)',
      fricForce: 'ඝර්ෂණ බලය (f)',
      normalForce: 'අභිලම්භ ප්‍රතික්‍රියාව (R)',
      staticThreshold: 'උපරිම සීමාකාරී ඝර්ෂණය',
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
      appliedForce: 'செலுத்தப்படும் விசை (F)',
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
  const tn = NEWTONS_THEORY_NOTES[lang] || NEWTONS_THEORY_NOTES.en;

  // 1. Parameters & State
  const [params, setParams] = useState<NewtonsLawsParameters>({
    force: 20,
    mass: 5,
    muStatic: 0.4,
    muKinetic: 0.25,
    g: 10,
  });

  const [dynamics, setDynamics] = useState<{ position: number; velocity: number }>({
    position: 10,
    velocity: 0,
  });

  const [showVectors, setShowVectors] = useState(true);
  const [isPushing, setIsPushing] = useState(false);

  const activeForce = isPushing ? params.force : 0;
  const activeParams = { ...params, force: activeForce };

  // Lab Notes State
  const [labNotes, setLabNotes] = useState('');

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'newtons_sim',
    simulationTitle: "Newton's Second Law of Motion",
    category: 'mechanics',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'force', label: 'Applied Force F', unit: 'N' },
      { key: 'mass', label: 'Mass m', unit: 'kg' },
      { key: 'acceleration', label: 'Acceleration a', unit: 'm/s²' },
      { key: 'friction', label: 'Friction Force f', unit: 'N' },
      { key: 'normalForce', label: 'Normal Force R', unit: 'N' },
    ],
    getCurrentRow: () => ({
      force: params.force,
      mass: params.mass,
      acceleration: parseFloat(currentDynamics.acceleration.toFixed(2)),
      friction: parseFloat(currentDynamics.frictionForce.toFixed(2)),
      normalForce: parseFloat(currentDynamics.normalForce.toFixed(2)),
    }),
    getSeriesData: () => {
      const forces = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
      return forces.map((f, idx) => {
        const dyn = calculateForcesAndKinematics({ position: 0, velocity: 1 }, { ...params, force: f });
        return {
          trial: idx + 1,
          force: f,
          mass: params.mass,
          acceleration: parseFloat(dyn.acceleration.toFixed(2)),
          friction: parseFloat(dyn.frictionForce.toFixed(2)),
          normalForce: parseFloat(dyn.normalForce.toFixed(2)),
        };
      });
    },
    autoRunConfig: {
      steps: [
        { label: 'Force F = 5 N', params: { force: 5 }, durationMs: 750 },
        { label: 'Force F = 10 N', params: { force: 10 }, durationMs: 750 },
        { label: 'Force F = 20 N', params: { force: 20 }, durationMs: 750 },
        { label: 'Force F = 30 N', params: { force: 30 }, durationMs: 750 },
        { label: 'Force F = 40 N', params: { force: 40 }, durationMs: 750 },
        { label: 'Force F = 50 N', params: { force: 50 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        setParams((prev) => ({ ...prev, ...p }));
      },
    },
    defaultGraphConfig: {
      xAxis: 'acceleration',
      yAxis: 'force',
      title: "Newton's Law: F vs a (F = ma, Slope = Mass M)",
      showRegression: true,
    },
    notes: labNotes,
  });

  const handleDownloadPDF = () => {
    const reportParams = {
      'Applied Force (F)': `${params.force} N`,
      'Block Mass (m)': `${params.mass} kg`,
      'Static Friction Coeff (μs)': `${params.muStatic}`,
      'Kinetic Friction Coeff (μk)': `${params.muKinetic}`,
      'Gravity (g)': `${params.g} m/s²`,
    };
    downloadReportAsPDF("Newton's Laws of Motion Laboratory", reportParams, recorder.recordedRows, labNotes);
  };

  // Simulation time-series tracking for graphs
  const [history, setHistory] = useState<{ t: number; pos: number; vel: number; acc: number; force: number; friction: number }[]>([]);

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
  const currentDynamics = calculateForcesAndKinematics(dynamics, activeParams);

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
        const next = stepNewtonsSimulation(prev, activeParams, dt);
        if (next.position <= 0 || next.position >= 50) {
          if (prev.position > 0 && prev.position < 50) {
            hitEnd = true;
          }
        }
        
        // Record history
        setHistory((h) => [
          ...h,
          {
            t: newTime,
            pos: next.position,
            vel: next.velocity,
            acc: next.acceleration,
            force: activeForce,
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
    setDynamics({ position: 10, velocity: 0 });
    setHistory([]);
  };

  // Canvas Dragging State & Handlers
  const [isDragging, setIsDragging] = useState(false);

  const getPosFromEvent = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const margin = { left: 45, right: 45 };
    const trackWidth = rect.width - margin.left - margin.right;
    const metersToPixels = trackWidth / 50;
    const clickX = clientX - rect.left;
    const meterX = (clickX - margin.left) / metersToPixels;
    return Math.max(0, Math.min(50, meterX));
  };

  const handleDragStart = (clientX: number) => {
    if (isPlaying) return; // Only drag when paused
    const meterX = getPosFromEvent(clientX);
    if (meterX === null) return;

    // Check if clicked close to block (dynamics.position +/- 3.5 meters)
    if (Math.abs(meterX - dynamics.position) <= 4.0) {
      setIsDragging(true);
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isPlaying) return;
    const meterX = getPosFromEvent(clientX);
    if (meterX === null) return;
    setDynamics({ position: meterX, velocity: 0 });
    setHistory([]);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  // 3. Canvas Rendering
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

    // Margins and Scaling (Track is 0m to 50m)
    const margin = { left: 45, right: 45, bottom: 40, top: 40 };
    const trackWidth = width - margin.left - margin.right;
    const trackY = height - margin.bottom - 20;

    const metersToPixels = trackWidth / 50;

    const toScreenX = (xMeters: number) => margin.left + xMeters * metersToPixels;

    ctx.clearRect(0, 0, width, height);

    // Draw grid track lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px font-mono, Courier';
    ctx.textAlign = 'center';
    for (let x = 0; x <= 50; x += 5) {
      const screenX = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(screenX, trackY - 5);
      ctx.lineTo(screenX, trackY + 5);
      ctx.stroke();
      ctx.fillText(`${x}m`, screenX, trackY + 18);
    }

    // Draw Track Surface
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(margin.left, trackY);
    ctx.lineTo(margin.left + trackWidth, trackY);
    ctx.stroke();

    // Draw Box Block
    const blockMetersWidth = 5;
    const blockMetersHeight = 3.5;
    const blockPxWidth = blockMetersWidth * metersToPixels;
    const blockPxHeight = blockMetersHeight * metersToPixels;

    const blockX = toScreenX(dynamics.position) - blockPxWidth / 2;
    const blockY = trackY - blockPxHeight;

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, blockPxWidth, blockPxHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Label Mass inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.mass} kg`, blockX + blockPxWidth / 2, blockY + blockPxHeight / 2 + 4);

    // Draw Force Vector Arrows (Centered on the block)
    if (showVectors) {
      const centerX = blockX + blockPxWidth / 2;
      const centerY = blockY + blockPxHeight / 2;

      // Scaling: 1 Newton = 1.2 pixels
      const forceScale = 1.5;

      // 1. Applied Force (Green Arrow)
      if (Math.abs(activeForce) > 0.1) {
        const forceEndX = centerX + activeForce * forceScale;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(forceEndX, centerY);
        ctx.stroke();

        // Arrowhead
        const dir = Math.sign(activeForce);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(forceEndX, centerY);
        ctx.lineTo(forceEndX - dir * 8, centerY - 5);
        ctx.lineTo(forceEndX - dir * 8, centerY + 5);
        ctx.fill();
      }


      // 2. Friction Force (Red Arrow)
      if (Math.abs(currentDynamics.frictionForce) > 0.1) {
        const frictionEndX = centerX + currentDynamics.frictionForce * forceScale;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(frictionEndX, centerY);
        ctx.stroke();

        // Arrowhead
        const dir = Math.sign(currentDynamics.frictionForce);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(frictionEndX, centerY);
        ctx.lineTo(frictionEndX - dir * 6, centerY - 4);
        ctx.lineTo(frictionEndX - dir * 6, centerY + 4);
        ctx.fill();
      }

      // 3. Normal Force (Blue Arrow pointing UP)
      const normalEndY = centerY - currentDynamics.normalForce * forceScale;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, normalEndY);
      ctx.stroke();
      
      // Arrowhead
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(centerX, normalEndY);
      ctx.lineTo(centerX - 4, normalEndY + 6);
      ctx.lineTo(centerX + 4, normalEndY + 6);
      ctx.fill();

      // 4. Gravitational Force (Orange arrow pointing DOWN)
      const gravityEndY = centerY + currentDynamics.normalForce * forceScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, gravityEndY);
      ctx.stroke();
      
      // Arrowhead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(centerX, gravityEndY);
      ctx.lineTo(centerX - 4, gravityEndY - 6);
      ctx.lineTo(centerX + 4, gravityEndY - 6);
      ctx.fill();
    }
  }, [dynamics, params, showVectors, currentDynamics]);



  // 6. Educational Data
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
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Newton’s Second Law of Motion</h2>
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

          {/* Tab 1: Theory & Basic Laws */}
          {activeTheoryTab === 'theory' && (
            <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
              {/* Sec 1: Basic Idea */}
              <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.sec1Title}</h3>
                <p>{tn.sec1Body}</p>
                <div className="pt-1 text-center font-bold text-blue-700">
                  <BlockMath math="F_{\text{net}} = m a" />
                </div>
              </div>

              {/* Sec 2 & 3: Net Force & Vector Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {tn.sec2Title}
                  </h4>
                  <p>{tn.sec2Body}</p>
                  <BlockMath math="\vec{F}_{\text{net}} = \sum \vec{F}" />
                  <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-150 text-[11px] text-blue-900 font-medium">
                    {tn.sec2Example}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    {tn.sec3Title}
                  </h4>
                  <p>{tn.sec3Body}</p>
                  <BlockMath math="\vec{F}_{\text{net}} = m \vec{a} \implies \vec{F}_{\text{net}} \parallel \vec{a}" />
                </div>
              </div>

              {/* Sec 7: Free-Body Diagram (FBD) Box */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3 shadow-inner">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">{tn.sec7Title}</h4>
                <p className="text-slate-300 text-xs">{tn.sec7Body}</p>
                
                {/* Visual FBD Diagram */}
                <div className="font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 text-center space-y-1">
                  <div className="text-blue-400 font-bold">N (Normal Reaction) ↑</div>
                  <div>← Friction (f) &nbsp;&nbsp; [ BOX m ] &nbsp;&nbsp; → Applied Force (F)</div>
                  <div className="text-amber-400 font-bold">↓ W = m·g (Weight)</div>
                  <div className="pt-2 text-indigo-300 font-bold">Resultant Vector: ∑F_x = F - f = m a</div>
                </div>
              </div>

              {/* Sec 9 & 10: Equilibrium & Momentum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs">{tn.sec9Title}</h4>
                  <p className="text-emerald-900">{tn.sec9Body}</p>
                  <BlockMath math="F_{\text{net}} = 0 \implies a = 0 \quad (v = \text{const or } 0)" />
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-indigo-950 text-xs">{tn.sec10Title}</h4>
                  <p className="text-indigo-900">{tn.sec10Body}</p>
                  <BlockMath math="\vec{p} = m \vec{v}, \quad \vec{F}_{\text{net}} = \frac{d\vec{p}}{dt}" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Equations & Vector Method */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.sec8Title}</h3>
              
              {/* 5-Step Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {tn.steps.map((step: string, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-blue-700">{step.split(':')[0]}</div>
                    <div className="text-slate-600 text-[11px]">{step.split(':')[1] || step}</div>
                  </div>
                ))}
              </div>

              {/* Sec 4, 5, 6: Relationships & SI Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-xs">{tn.sec4Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec4Body}</p>
                  <BlockMath math="F_{\text{net}} \propto a \implies \frac{F_1}{a_1} = \frac{F_2}{a_2}" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-purple-700 text-xs">{tn.sec5Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec5Body}</p>
                  <BlockMath math="a \propto \frac{1}{m} \implies m_1 a_1 = m_2 a_2" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-700 text-xs">{tn.sec6Title}</h4>
                  <p className="text-slate-600 text-xs">{tn.sec6Body}</p>
                  <BlockMath math="1\text{ N} = 1\text{ kg}\cdot\text{m}\cdot\text{s}^{-2}" />
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

          {/* Tab 3: Key Ideas & Senath Rules */}
          {activeTheoryTab === 'tips' && (
            <div className="space-y-5">
              {/* 5 Key Ideas */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {tn.keyIdeasHeader}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {tn.keyIdeas.map((idea: { id: string; title: string; eq: string; desc: string }, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                        <span className="text-amber-500 font-extrabold text-sm">{idea.id}</span>
                        <span>{idea.title}</span>
                      </div>
                      <div className="font-mono font-bold text-blue-700 text-xs bg-white p-1 rounded border border-slate-150 text-center">
                        {idea.eq}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{idea.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Formula Box */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">{tn.formulaBoxTitle}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono font-bold text-center">
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">F_net = m·a</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">F_net = dp/dt</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">p = m·v</div>
                  <div className="bg-slate-800 p-2.5 rounded border border-slate-700">1 N = 1 kg·m/s²</div>
                </div>
              </div>

              {/* Physics by Senath — Explore It */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 text-amber-200">
                  <Info className="w-5 h-5 text-amber-300" />
                  {tn.exploreTitle}
                </h3>
                <p className="text-xs text-blue-100 font-medium">{tn.exploreBody}</p>
                <div className="space-y-1 text-xs font-medium text-white bg-white/10 p-3 rounded-xl border border-white/20">
                  <div>{tn.exploreQ1}</div>
                  <div>{tn.exploreQ2}</div>
                </div>
                <div className="text-center font-bold text-xs text-amber-200 pt-1">
                  {tn.exploreSummary}
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

          {/* Applied Force */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">{t.appliedForce}</span>
              <span className="text-blue-600 font-mono">{params.force.toFixed(1)} N</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={params.force}
              disabled={recorder.isAutoRunning}
              onChange={(e) => setParams({ ...params, force: parseFloat(e.target.value) })}
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

          {/* Vector Visibility Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="newtons-vectors-toggle"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="newtons-vectors-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              {t.vectors}
            </label>
          </div>
        </div>


        {/* Lab Notebook Container (Rich Log notes feature) */}
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

        {/* Right Column: Viewport & Graphs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Simulation Canvas Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50 rounded-t-lg shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Newton's Second Law Viewport</span>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                Force (Applied)
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
              onMouseDown={(e) => handleDragStart(e.clientX)}
              onMouseMove={(e) => handleDragMove(e.clientX)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => e.touches[0] && handleDragMove(e.touches[0].clientX)}
              onTouchEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Live indicator overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 px-3 py-2 rounded text-[11px] font-mono space-y-1 border border-slate-800 pointer-events-none">
              <div>POSITION: <span className="text-white font-bold">{dynamics.position.toFixed(2)} m</span></div>
              <div>VELOCITY: <span className="text-blue-400 font-bold">{dynamics.velocity.toFixed(2)} m/s</span></div>
              <div>ACCEL: <span className="text-amber-400 font-bold">{currentDynamics.acceleration.toFixed(3)} m/s²</span></div>
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
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors mr-2"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onMouseDown={() => setIsPushing(true)}
                onMouseUp={() => setIsPushing(false)}
                onMouseLeave={() => setIsPushing(false)}
                onTouchStart={() => setIsPushing(true)}
                onTouchEnd={() => setIsPushing(false)}
                className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-semibold rounded transition-all select-none shadow-sm cursor-pointer ${
                  isPushing 
                    ? 'bg-emerald-600 border-emerald-600 text-white translate-y-0.5' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Hold down to push the block with the set Applied Force (F). Release to remove force."
              >
                Push Block
              </button>
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
            graphs={newtonsSecondLawGraphs}
            trials={recorder.recordedRows}
            realtimePoints={history.map(h => ({ t: h.t, x: h.acc, y: h.force, acceleration: h.acc, force: h.force, velocity: h.vel, position: h.pos }))}
            simulationParams={params}
            onRecordTrial={recorder.recordTrial}
            onClearTrials={recorder.clearTrials}
            columns={recorder.columns}
            height={260}
          />
        </div>

      </div>
    </div>
  </div>
  );
}