import { ENABLE_THEORY_NOTEBOOKS } from '../../../config/features';
import { useState, useRef, useEffect } from 'react';
import { BlockMath } from '../../Math';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Info, 
  BookOpen,
  Maximize2,
  FileText,
  Lightbulb,
  
  Activity,
  Plus
} from 'lucide-react';
import { calculateSHMState, SHMParameters } from '../../../physics/shmPhysics';
import { useSimulationRecorder } from '../../../hooks/useSimulationRecorder';
import { ScientificGraphLab } from '../../graphing/ScientificGraphLab';
import { shmGraphs } from '../../graphing/presets';

const SHM_THEORY_NOTES = {
  en: {
    badge: 'Simple Harmonic Motion (SHM) • Full Interactive Notebook',
    notebookMode: 'Interactive Notebook',
    simOnlyMode: 'Sim Only Mode',
    tabTheory: 'Theory & Basic Laws',
    tabFormulas: 'Equations & Derivations',
    tabTips: 'Quick Comparison & Senath Rules',

    // Section 1 & 2
    sec1Title: '1. What is Simple Harmonic Motion?',
    sec1Body: 'Simple Harmonic Motion (SHM) is an oscillatory motion in which the acceleration of the object is directly proportional to its displacement from the equilibrium position, and always directed towards the equilibrium position.',
    sec1SignExpl: 'The negative sign is extremely important. It tells us that acceleration is always directed towards the equilibrium position.',
    
    sec2Title: '2. The Basic Idea & Restoring Force',
    sec2Body: 'Imagine a mass attached to a spring on a frictionless surface. Whenever displaced from equilibrium, a restoring force acts to pull/push it back towards equilibrium.',
    sec2Right: 'Displaced Right (x > 0): Restoring force acts to the left (F ←) towards equilibrium.',
    sec2Left: 'Displaced Left (x < 0): Restoring force acts to the right (F →) towards equilibrium.',

    // Section 3
    sec3Title: '3. Conditions for SHM',
    sec3Eq: 'At Equilibrium (x = 0): Acceleration a = 0, Speed v is MAXIMUM.',
    sec3Ext: 'At Maximum Displacement (x = ±A): Acceleration |a| = ω²A is MAXIMUM, Speed v = 0.',

    // Section 4
    sec4Title: '4. Important Quantities & Fundamental Relations',
    quantities: [
      { sym: 'x', name: 'Displacement', desc: 'Distance & direction from equilibrium position' },
      { sym: 'A', name: 'Amplitude', desc: 'Maximum displacement from equilibrium' },
      { sym: 'T', name: 'Period', desc: 'Time taken for one complete oscillation' },
      { sym: 'f', name: 'Frequency', desc: 'Number of complete oscillations per second' },
      { sym: 'ω', name: 'Angular Frequency', desc: 'Rate of change of phase angle (2πf)' }
    ],

    // Section 5, 6, 7
    sec5Title: '5. SHM Displacement Equations',
    sec5Body: 'The displacement of an object undergoing SHM varies sinusoidally with initial phase φ:',
    
    sec6Title: '6. Velocity in SHM & Maximum Speed',
    sec6Body: 'Differentiating x = A sin(ωt + φ) with respect to time yields velocity v = dx/dt = Aω cos(ωt + φ). Expressed in terms of position:',
    sec6Vmax: 'Maximum speed occurs at the equilibrium position (x = 0): v_max = ωA.',

    sec7Title: '7. Acceleration in SHM & Maximum Acceleration',
    sec7Body: 'Acceleration is proportional to negative displacement: a = -ω²x. Maximum acceleration occurs at extreme positions (x = ±A): a_max = ω²A.',

    // Section 8, 9, 10
    sec8Title: '8. Restoring Force in SHM',
    sec8Body: 'From Newton’s second law F = ma and a = -ω²x, we get F = -mω²x. Thus restoring force is proportional to displacement.',

    sec9Title: '9. Spring–Mass System',
    sec9Body: 'For Hooke’s Law F = -kx and F = -mω²x, we obtain mω² = k → ω = √(k/m). The oscillation period is T = 2π√(m/k). Increasing m increases T; increasing k decreases T.',

    sec10Title: '10. Simple Pendulum (Small Oscillations)',
    sec10Body: 'For small angular displacements (θ ≤ 10°), period T = 2π√(L/g). Period T ∝ √L and T ∝ 1/√g. For small oscillations, the period does NOT depend on the mass of the bob.',

    // Section 11 & 12
    sec11Title: '11. Energy in SHM & Energy Transformations',
    sec11Body: 'Total mechanical energy remains constant in ideal SHM: E = ½ k A² = ½ m ω² A². Energy continuously converts between Kinetic Energy (K) and Potential Energy (U).',
    sec12PE: 'Potential Energy: U = ½ k x²',
    sec12KE: 'Kinetic Energy: K = E - U = ½ k (A² - x²)',

    // Section 13 & 14
    sec13Title: '13. Phase Relationships & SHM Graphs',
    phaseList: [
      'x and a are 180° (π rad) out of phase (opposite directions).',
      'x and v are 90° (π/2 rad) out of phase.',
      'v and a are 90° (π/2 rad) out of phase.'
    ],

    sec14Title: '14. One Complete Oscillation',
    sec14Body: 'During one cycle (0 → +A → 0 → -A → 0), the object passes through equilibrium twice. Total distance travelled in one oscillation = 4A.',

    // Section 15 & 16
    sec15Title: '15. Quick Comparison Table across Positions',
    matrix: [
      { pos: '+A (Right Extreme)', disp: 'Maximum (+A)', speed: '0', accel: 'Maximum (-ω²A)', ke: '0', pe: 'Maximum (½kA²)' },
      { pos: '0 (Equilibrium)', disp: '0', speed: 'Maximum (ωA)', accel: '0', ke: 'Maximum (½kA²)', pe: 'Minimum (0)' },
      { pos: '-A (Left Extreme)', disp: 'Maximum (-A)', speed: '0', accel: 'Maximum (+ω²A)', ke: '0', pe: 'Maximum (½kA²)' }
    ],

    sec16Title: '16. Most Important Formulae Cheat-Sheet',

    // Senath Rules & Interactive Reflection
    senathHeader: '🧠 Physics by Senath — Remember This',
    rules: [
      { title: '1. Acceleration Rule', formula: 'a = -ω²x', desc: 'Acceleration ALWAYS points towards equilibrium.' },
      { title: '2. Maximum Speed Rule', formula: 'v_max = ωA', desc: 'Maximum speed ALWAYS occurs at equilibrium (x = 0).' },
      { title: '3. Maximum Acceleration Rule', formula: 'a_max = ω²A', desc: 'Maximum acceleration ALWAYS occurs at extreme displacement (x = ±A).' }
    ],
    senathSummary: 'Far from equilibrium → Acceleration is LARGE. At equilibrium → Velocity is LARGE.',
    
    reflectionTitle: '🧪 Interactive Simulation Reflection Question',
    reflectionQ: 'Why does the velocity become maximum when the acceleration becomes zero?',
    reflectionAns: 'Because acceleration is the rate of change of velocity (dv/dt = 0). When acceleration is zero at equilibrium, velocity reaches a local turning point (maximum value) before starting to decrease on the other side!',
    varGuideTitle: 'Variables & SI Units Reference Guide',
    vars: [
      { sym: 'x', name: 'Displacement', unit: 'm' },
      { sym: 'A', name: 'Amplitude', unit: 'm' },
      { sym: 'v', name: 'Velocity', unit: 'm/s' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' },
      { sym: 'T', name: 'Period', unit: 's' },
      { sym: 'f', name: 'Frequency', unit: 'Hz (s⁻¹)' },
      { sym: 'ω', name: 'Angular Frequency', unit: 'rad/s' },
      { sym: 'm', name: 'Mass', unit: 'kg' },
      { sym: 'k', name: 'Spring Constant', unit: 'N/m' },
      { sym: 'L', name: 'Pendulum Length', unit: 'm' },
      { sym: 'g', name: 'Gravitational Acceleration', unit: 'm/s²' },
      { sym: 'E', name: 'Total Energy', unit: 'J' },
      { sym: 'K', name: 'Kinetic Energy', unit: 'J' },
      { sym: 'U', name: 'Potential Energy', unit: 'J' }
    ],
  },
  si: {
    badge: 'සරල අනුවර්තී චලිතය (SHM) • පූර්ණ අන්තර්ක්‍රියාකාරී සටහන් පොත',
    notebookMode: 'අන්තර්ක්‍රියාකාරී සටහන් පොත',
    simOnlyMode: 'අනුකරණය පමණක්',
    tabTheory: 'සිද්ධාන්ත සහ මූලික නියම',
    tabFormulas: 'සමීකරණ සහ ගණනය කිරීම්',
    tabTips: 'සංසන්දනාත්මක සටහන් සහ සෙනත් නීති',

    sec1Title: '1. සරල අනුවර්තී චලිතය (SHM) යනු කුමක්ද?',
    sec1Body: 'වස්තුවක ත්වරණය (a), එහි සමතුලිත පිහිටීමේ සිට ඇති විස්ථාපනයට (x) ඍජුව සමානුපාතික වන අතර, එම ත්වරණය සැමවිටම සමතුලිත පිහිටීම දෙසට යොමුව පවතී නම් එය සරල අනුවර්තී චලිතයකි.',
    sec1SignExpl: 'ඍණ ලකුණ (-): ත්වරණය සැමවිටම විස්ථාපනයට ප්‍රතිවිරුද්ධව සමතුලිත ලක්ෂ්‍යය දෙසට යොමුව ඇති බව පෙන්වයි.',

    sec2Title: '2. මූලික සංකල්පය සහ ප්‍රත්‍යානයන බලය',
    sec2Body: 'ඝර්ෂණයක් නැති පෘෂ්ඨයක් මත ඇති දුනු-ස්කන්ධ පද්ධතියක් ගැන සිතන්න. වස්තුව සමතුලිතතාවයෙන් ඉවතට තල්ලු කළ විට ප්‍රත්‍යානයන බලයක් ක්‍රියා කරයි.',
    sec2Right: 'දකුණට විස්ථාපනය කළ විට (x > 0): ප්‍රත්‍යානයන බලය වමට ක්‍රියා කරයි (F ←).',
    sec2Left: 'වමට විස්ථාපනය කළ විට (x < 0): ප්‍රත්‍යානයන බලය දකුණට ක්‍රියා කරයි (F →).',

    sec3Title: '3. SHM සඳහා කොන්දේසි',
    sec3Eq: 'සමතුලිත පිහිටීමේදී (x = 0): ත්වරණය a = 0 වන අතර ප්‍රවේගය v උපරිම වේ.',
    sec3Ext: 'උපරිම විස්ථාපනයේදී (x = ±A): ත්වරණය |a| = ω²A උපරිම වන අතර ප්‍රවේගය v = 0 වේ.',

    sec4Title: '4. වැදගත් භෞතික රාශි',
    quantities: [
      { sym: 'x', name: 'විස්ථාපනය', desc: 'සමතුලිත පිහිටීමේ සිට ඇති දුර සහ දිශාව' },
      { sym: 'A', name: 'විස්තාරය', desc: 'සමතුලිත පිහිටීමේ සිට ඇති උපරිම විස්ථාපනය' },
      { sym: 'T', name: 'ආවර්ත කාලය', desc: 'එක් පූර්ණ දෝලනයක් සඳහා ගතවන කාලය' },
      { sym: 'f', name: 'සංඛ්‍යාතය', desc: 'තත්පරයකදී සිදුවන පූර්ණ දෝලන ගණන' },
      { sym: 'ω', name: 'කෝණික සංඛ්‍යාතය', desc: 'කලා කෝණය වෙනස්වීමේ ශීඝ්‍රතාව (2πf)' }
    ],

    sec5Title: '5. SHM විස්ථාපන සමීකරණ',
    sec5Body: 'ආරම්භක කලා කෝණය φ වන විට SHM දෝලනය වන වස්තුවක විස්ථාපනය සයින් හෝ කොසයින් ලෙස දැක්විය හැක:',

    sec6Title: '6. SHM හි ප්‍රවේගය සහ උපරිම ප්‍රවේගය',
    sec6Body: 'x = A sin(ωt + φ) කාලයෙන් අවකලනය කළ විට v = dx/dt = Aω cos(ωt + φ) ලැබේ. ස්ථානය අනුව ප්‍රවේගය:',
    sec6Vmax: 'උපරිම ප්‍රවේගය සමතුලිත පිහිටීමේදී (x = 0) සිදුවේ: v_max = ωA.',

    sec7Title: '7. SHM හි ත්වරණය සහ උපරිම ත්වරණය',
    sec7Body: 'ත්වරණය විස්ථාපනයට ප්‍රතිවිරුද්ධව සමානුපාතික වේ: a = -ω²x. උපරිම ත්වරණය කෙළවර ලක්ෂ්‍යවලදී (x = ±A) සිදුවේ: a_max = ω²A.',

    sec8Title: '8. ප්‍රත්‍යානයන බලය',
    sec8Body: 'නියුටන්ගේ දෙවන නියමයෙන් F = ma සහ a = -ω²x ආදේශ කළ විට F = -mω²x ලැබේ. එනම් බලය විස්ථාපනයට සමානුපාතික වේ.',

    sec9Title: '9. දුනු–ස්කන්ධ පද්ධතිය',
    sec9Body: 'හුක්ගේ නියමය F = -kx සහ F = -mω²x මගින් mω² = k → ω = √(k/m) ලැබේ. ආවර්ත කාලය T = 2π√(m/k) වේ. ස්කන්ධය m වැඩිවන විට T වැඩිවේ; k වැඩිවන විට T අඩුවේ.',

    sec10Title: '10. සරල ලෝලකය (කුඩා දෝලන)',
    sec10Body: 'කුඩා කෝණික විස්ථාපන සඳහා (θ ≤ 10°), ආවර්ත කාලය T = 2π√(L/g) වේ. T ∝ √L සහ T ∝ 1/√g වේ. කුඩා දෝලන සඳහා ආවර්ත කාලය ලෝලකයේ ස්කන්ධය මත රඳා නොපවතී.',

    sec11Title: '11. ශක්තිය සහ ශක්ති පරිවර්තනය',
    sec11Body: 'අවපාතනය නොවූ SHM හි මුළු යාන්ත්‍රික ශක්තිය E = ½ k A² නියතව පවතී. ගති ශක්තිය (K) සහ විභව ශක්තිය (U) අතර නිරන්තරයෙන් පරිවර්තනය වේ.',
    sec12PE: 'විභව ශක්තිය: U = ½ k x²',
    sec12KE: 'ගති ශක්තිය: K = E - U = ½ k (A² - x²)',

    sec13Title: '13. කලා සම්බන්ධතා සහ ප්‍රස්ථාර',
    phaseList: [
      'x සහ a එකිනෙකට 180° (π rad) ප්‍රති-කලා වේ (ප්‍රතිවිරුද්ධ දිශා).',
      'x සහ v එකිනෙකට 90° (π/2 rad) කලා වෙනසක් පවතී.',
      'v සහ a එකිනෙකට 90° (π/2 rad) කලා වෙනසක් පවතී.'
    ],

    sec14Title: '14. එක් පූර්ණ දෝලනයක්',
    sec14Body: 'එක් පූර්ණ චක්‍රයකදී (0 → +A → 0 → -A → 0), වස්තුව දෙවරක් සමතුලිතතාව හරහා යයි. පූර්ණ දෝලනයකදී ගමන් කරන මුළු දුර = 4A.',

    sec15Title: '15. පිහිටීම් අනුව සංසන්දනාත්මක වගුව',
    matrix: [
      { pos: '+A (දකුණු කෙළවර)', disp: 'උපරිම (+A)', speed: '0', accel: 'උපරිම (-ω²A)', ke: '0', pe: 'උපරිම (½kA²)' },
      { pos: '0 (සමතුලිතතාව)', disp: '0', speed: 'උපරිම (ωA)', accel: '0', ke: 'උපරිම (½kA²)', pe: 'අවම (0)' },
      { pos: '-A (වම් කෙළවර)', disp: 'උපරිම (-A)', speed: '0', accel: 'උපරිම (+ω²A)', ke: '0', pe: 'උපරිම (½kA²)' }
    ],

    sec16Title: '16. සියලුම ප්‍රධාන සමීකරණ එකතුව',

    senathHeader: '🧠 Physics by Senath — මතක තබා ගන්න',
    rules: [
      { title: '1. ත්වරණ නීතිය', formula: 'a = -ω²x', desc: 'ත්වරණය සැමවිටම සමතුලිත පිහිටීම දෙසට යොමුවේ.' },
      { title: '2. උපරිම ප්‍රවේග නීතිය', formula: 'v_max = ωA', desc: 'උපරිම ප්‍රවේගය සැමවිටම සමතුලිත පිහිටීමේදී (x = 0) සිදුවේ.' },
      { title: '3. උපරිම ත්වරණ නීතිය', formula: 'a_max = ω²A', desc: 'උපරිම ත්වරණය සැමවිටම උපරිම විස්ථාපනයේදී (x = ±A) සිදුවේ.' }
    ],
    senathSummary: 'සමතුලිතතාවයෙන් ඈතදී → ත්වරණය ඉහළයි. සමතුලිතතාවයේදී → ප්‍රවේගය ඉහළයි.',

    reflectionTitle: '🧪 අන්තර්ක්‍රියාකාරී සිමියුලේෂන් චින්තන ප්‍රශ්නය',
    reflectionQ: 'ත්වරණය ශූන්‍ය වන විට ප්‍රවේගය උපරිම වන්නේ ඇයි?',
    reflectionAns: 'මන්දයත් ත්වරණය යනු ප්‍රවේගයේ වෙනස්වීමේ ශීඝ්‍රතාවයි (dv/dt = 0). සමතුලිතතාවයේදී ත්වරණය ශූන්‍ය වන විට, ප්‍රවේගය එහි උපරිම අගයට ළඟා වේ!',
    varGuideTitle: 'පරාමිතීන් සහ SI ඒකක නාමාවලිය',
    vars: [
      { sym: 'x', name: 'විස්ථාපනය', unit: 'm' },
      { sym: 'A', name: 'විස්තාරය', unit: 'm' },
      { sym: 'v', name: 'ප්‍රවේගය', unit: 'm/s' },
      { sym: 'a', name: 'ත්වරණය', unit: 'm/s²' },
      { sym: 'T', name: 'ආවර්ත කාලය', unit: 's' },
      { sym: 'f', name: 'සංඛ්‍යාතය', unit: 'Hz (s⁻¹)' },
      { sym: 'ω', name: 'කෝණික සංඛ්‍යාතය', unit: 'rad/s' },
      { sym: 'm', name: 'ස්කන්ධය', unit: 'kg' },
      { sym: 'k', name: 'දුන්නෙහි නියතය', unit: 'N/m' },
      { sym: 'L', name: 'ලෝලකයේ දිග', unit: 'm' },
      { sym: 'g', name: 'ගුරුත්වජ ත්වරණය', unit: 'm/s²' },
      { sym: 'E', name: 'මුළු ශක්තිය', unit: 'J' },
      { sym: 'K', name: 'ගති ශක්තිය', unit: 'J' },
      { sym: 'U', name: 'විභව ශක්තිය', unit: 'J' }
    ],
  },
  ta: {
    badge: 'எளிய சீரிசை இயக்கம் (SHM) • முழுமையான குறிப்பேடு',
    notebookMode: 'செயல்திறன் குறிப்பேடு',
    simOnlyMode: 'உருவகப்படுத்துதல் மட்டும்',
    tabTheory: 'கோட்பாடு மற்றும் அடிப்படை விதிகள்',
    tabFormulas: 'சமன்பாடுகள் மற்றும் கணக்கீடுகள்',
    tabTips: 'ஒப்பீட்டு அட்டவணை & சேனாத் விதிகள்',

    sec1Title: '1. எளிய சீரிசை இயக்கம் (SHM) என்றால் என்ன?',
    sec1Body: 'ஒரு பொருளின் முடுக்கம் (a), சமநிலை நிலையிலிருந்து அதன் இடப்பெயர்ச்சிக்கு (x) நேர்விகிதசமமாகவும், எப்போதும் சமநிலை நிலையை நோக்கியதாகவும் அமைந்தால் அது எளிய சீரிசை இயக்கமாகும்.',
    sec1SignExpl: 'எதிர்மறை அடையாளம் (-): முடுக்கம் எப்போதும் இடப்பெயர்ச்சிக்கு எதிர்த்திசையில் சமநிலையை நோக்கியது என்பதை உணர்த்துகிறது.',

    sec2Title: '2. அடிப்படை யோசனை & மீட்பு விசை',
    sec2Body: 'ஒரு வில்லியுடன் இணைக்கப்பட்ட திணிவைக் கருதுங்கள். சமநிலையிலிருந்து நகர்த்தப்படும் போது மீட்பு விசை சமநிலையை நோக்கிச் செயல்படுகிறது.',
    sec2Right: 'வலப்புறம் நகர்த்தப்படும் போது (x > 0): மீட்பு விசை இடப்புறம் செயல்படுகிறது (F ←).',
    sec2Left: 'இடப்புறம் நகர்த்தப்படும் போது (x < 0): மீட்பு விசை வலப்புறம் செயல்படுகிறது (F →).',

    sec3Title: '3. SHM க்கான நிபந்தனைகள்',
    sec3Eq: 'சமநிலையில் (x = 0): முடுக்கம் a = 0, திசைவேகம் v அதிகபட்சம்.',
    sec3Ext: 'அதிகபட்ச இடப்பெயர்ச்சியில் (x = ±A): முடுக்கம் |a| = ω²A அதிகபட்சம், திசைவேகம் v = 0.',

    sec4Title: '4. முக்கிய அளவுகள்',
    quantities: [
      { sym: 'x', name: 'இடப்பெயர்ச்சி', desc: 'சமநிலையிலிருந்து தூரம் மற்றும் திசை' },
      { sym: 'A', name: 'வீச்சு', desc: 'சமநிலையிலிருந்து அதிகபட்ச இடப்பெயர்ச்சி' },
      { sym: 'T', name: 'அலைவுக் காலம்', desc: 'ஒரு முழு அலைவுக்கான நேரம்' },
      { sym: 'f', name: 'அதிர்வெண்', desc: 'ஒரு வினாடிக்கான முழு அலைவுகளின் எண்ணிக்கை' },
      { sym: 'ω', name: 'கோண அதிர்வெண்', desc: 'கட்டக் கோண மாறுபாட்டு வீதம் (2πf)' }
    ],

    sec5Title: '5. SHM இடப்பெயர்ச்சி சமன்பாடுகள்',
    sec5Body: 'தொடக்கக் கட்டக் கோணம் φ கொண்ட SHM இயக்கத்தின் இடப்பெயர்ச்சி:',

    sec6Title: '6. திசைவேகம் மற்றும் அதிகபட்ச திசைவேகம்',
    sec6Body: 'x = A sin(ωt + φ) ஐ நேரத்தால் வகைக்கெழு செய்யும் போது v = dx/dt = Aω cos(ωt + φ) கிடைக்கும்:',
    sec6Vmax: 'சமநிலையில் (x = 0) அதிகபட்ச திசைவேகம் நிகழும்: v_max = ωA.',

    sec7Title: '7. முடுக்கம் மற்றும் அதிகபட்ச முடுக்கம்',
    sec7Body: 'முடுக்கம் எதிர் இடப்பெயர்ச்சிக்கு நேர்விகிதசமம்: a = -ω²x. நுனிகளில் (x = ±A) அதிகபட்ச முடுக்கம் நிகழும்: a_max = ω²A.',

    sec8Title: '8. மீட்பு விசை',
    sec8Body: 'நியூட்டனின் இரண்டாம் விதி F = ma மற்றும் a = -ω²x என்பதால், F = -mω²x கிடைக்கும்.',

    sec9Title: '9. வில்-திணிவு அமைப்பு',
    sec9Body: 'ஹூக்கின் விதி F = -kx மற்றும் F = -mω²x மூலம், mω² = k → ω = √(k/m). அலைவுக் காலம் T = 2π√(m/k). m அதிகரிக்கும் போது T அதிகரிக்கும்; k அதிகரிக்கும் போது T குறையும்.',

    sec10Title: '10. தனி ஊசல் (சிறிய அலைவுகள்)',
    sec10Body: 'சிறிய கோண இடப்பெயர்ச்சிகளுக்கு (θ ≤ 10°), அலைவுக் காலம் T = 2π√(L/g). T ∝ √L மற்றும் T ∝ 1/√g. சிறிய அலைவுகளுக்கு அலைவுக் காலம் ஊசல்குண்டின் திணிவில் தங்கியிருக்காது.',

    sec11Title: '11. ஆற்றல் மற்றும் ஆற்றல் மாற்றங்கள்',
    sec11Body: 'மொத்த இயந்திர ஆற்றல் E = ½ k A² மாறிலியாகும். இயக்க ஆற்றலும் நிலை ஆற்றலும் தொடர்ந்து மாறுகின்றன.',
    sec12PE: 'நிலை ஆற்றல்: U = ½ k x²',
    sec12KE: 'இயக்க ஆற்றல்: K = E - U = ½ k (A² - x²)',

    sec13Title: '13. கட்டத் தொடர்புகள் மற்றும் வரைபடங்கள்',
    phaseList: [
      'x மற்றும் a 180° (π rad) எதிர்க்கட்டத்தில் உள்ளன.',
      'x மற்றும் v 90° (π/2 rad) கட்ட வேறுபாட்டில் உள்ளன.',
      'v மற்றும் a 90° (π/2 rad) கட்ட வேறுபாட்டில் உள்ளன.'
    ],

    sec14Title: '14. ஒரு முழு அலைவு',
    sec14Body: 'ஒரு சுழற்சியில் (0 → +A → 0 → -A → 0), பொருள் இருமுறை சமநிலையைக் கடக்கிறது. ஒரு முழு அலைவில் கடந்த மொத்தத் தூரம் = 4A.',

    sec15Title: '15. நிலைகள் பற்றிய ஒப்பீட்டு அட்டவணை',
    matrix: [
      { pos: '+A (வலது நுனி)', disp: 'அதிகபட்சம் (+A)', speed: '0', accel: 'அதிகபட்சம் (-ω²A)', ke: '0', pe: 'அதிகபட்சம் (½kA²)' },
      { pos: '0 (சமநிலை)', disp: '0', speed: 'அதிகபட்சம் (ωA)', accel: '0', ke: 'அதிகபட்சம் (½kA²)', pe: 'குறைந்தபட்சம் (0)' },
      { pos: '-A (இடது நுனி)', disp: 'அதிகபட்சம் (-A)', speed: '0', accel: 'அதிகபட்சம் (+ω²A)', ke: '0', pe: 'அதிகபட்சம் (½kA²)' }
    ],

    sec16Title: '16. முக்கிய சமன்பாடுகள்',

    senathHeader: '🧠 Physics by Senath — நினைவில் கொள்க',
    rules: [
      { title: '1. முடுக்க விதி', formula: 'a = -ω²x', desc: 'முடுக்கம் எப்போதும் சமநிலையை நோக்கியது.' },
      { title: '2. அதிகபட்ச திசைவேக விதி', formula: 'v_max = ωA', desc: 'அதிகபட்ச திசைவேகம் எப்போதும் சமநிலையில் (x = 0) நிகழும்.' },
      { title: '3. அதிகபட்ச முடுக்க விதி', formula: 'a_max = ω²A', desc: 'அதிகபட்ச முடுக்கம் எப்போதும் நுனிகளில் (x = ±A) நிகழும்.' }
    ],
    senathSummary: 'சமநிலையிலிருந்து தொலைவில் → முடுக்கம் அதிகம். சமநிலையில் → திசைவேகம் அதிகம்.',

    reflectionTitle: '🧪 சிந்தனை கேள்வி',
    reflectionQ: 'முடுக்கம் சுழியமாகும் போது திசைவேகம் ஏன் அதிகபட்சமாகிறது?',
    reflectionAns: 'முடுக்கம் என்பது திசைவேக மாறுபாட்டு வீதமாகும் (dv/dt = 0). சமநிலையில் முடுக்கம் சுழியமாகும் போது, திசைவேகம் தன் அதிகபட்ச நிலையை அடைகிறது!',
    varGuideTitle: 'மாறிகள் மற்றும் SI அலகுகள் வழிகாட்டி',
    vars: [
      { sym: 'x', name: 'இடப்பெயர்ச்சி', unit: 'm' },
      { sym: 'A', name: 'வீச்சு', unit: 'm' },
      { sym: 'v', name: 'திசைவேகம்', unit: 'm/s' },
      { sym: 'a', name: 'முடுக்கம்', unit: 'm/s²' },
      { sym: 'T', name: 'அலைவுக் காலம்', unit: 's' },
      { sym: 'f', name: 'அதிர்வெண்', unit: 'Hz (s⁻¹)' },
      { sym: 'ω', name: 'கோண அதிர்வெண்', unit: 'rad/s' },
      { sym: 'm', name: 'திணிவு', unit: 'kg' },
      { sym: 'k', name: 'வில் மாறிலி', unit: 'N/m' },
      { sym: 'L', name: 'ஊசல் நீளம்', unit: 'm' },
      { sym: 'g', name: 'புவியீர்ப்பு முடுக்கம்', unit: 'm/s²' },
      { sym: 'E', name: 'மொத்த ஆற்றல்', unit: 'J' },
      { sym: 'K', name: 'இயக்க ஆற்றல்', unit: 'J' },
      { sym: 'U', name: 'நிலை ஆற்றல்', unit: 'J' }
    ],
  }
};

export function SimpleHarmonicMotionSimulation({ lang = 'en' }: { lang?: 'en' | 'si' | 'ta' }) {
  const TRANSLATIONS = {
    en: {
      paramsTitle: 'Parameters',
      systemMode: 'Oscillator Type',
      mass: 'Mass (m)',
      springConst: 'Spring Constant (k)',
      pendulumLen: 'Pendulum Length (L)',
      damping: 'Damping Factor (b)',
      amplitude: 'Initial Amplitude (A)',
      showRef: 'Show Reference Circle',
      calculations: 'Oscillation Analysis',
      period: 'Period (T)',
      frequency: 'Frequency (f)',
      energy: 'Total Energy (E)',
      phase: 'Phase Angle (φ)',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      logData: 'Record Trial',
      downloadPDF: 'Export PDF Report',
      labNotes: 'Observation Journal',
      trialHistory: 'SHM Logged History',
      clearLogs: 'Clear Logs'
    },
    si: {
      paramsTitle: 'පරාමිතීන්',
      systemMode: 'දෝලක වර්ගය',
      mass: 'ස්කන්ධය (m)',
      springConst: 'දුන්නෙහි නියතය (k)',
      pendulumLen: 'ලෝලකයේ දිග (L)',
      damping: 'අවපාතන සාධකය (b)',
      amplitude: 'ආරම්භක විස්තාරය (A)',
      showRef: 'සන්සන්දන වෘත්තය පෙන්වන්න',
      calculations: 'දෝලන විශ්ලේෂණය',
      period: 'ආවර්ත කාලය (T)',
      frequency: 'සංඛ්‍යාතය (f)',
      energy: 'මුළු ශක්තිය (E)',
      phase: 'කලා කෝණය (φ)',
      play: 'ධාවනය කරන්න',
      pause: 'නවත්වා තබන්න',
      reset: 'නැවත මුලට',
      logData: 'දත්ත සටහන් කරන්න',
      downloadPDF: 'PDF ලබාගන්න',
      labNotes: 'ලැබ් නිරීක්ෂණ සටහන් පොත',
      trialHistory: 'වාර්තාගත දෝලන ඉතිහාසය',
      clearLogs: 'සියල්ල මකන්න'
    },
    ta: {
      paramsTitle: 'அளவுருக்கள்',
      systemMode: 'அலைவு வகை',
      mass: 'திணிவு (m)',
      springConst: 'வில் மாறிலி (k)',
      pendulumLen: 'ஊசல் நீளம் (L)',
      damping: 'தணிப்பு காரணி (b)',
      amplitude: 'ஆரம்ப வீச்சு (A)',
      showRef: 'குறிப்பு வட்டத்தைக் காட்டு',
      calculations: 'அலைவு பகுப்பாய்வு',
      period: 'அலைவுக் காலம் (T)',
      frequency: 'அதிர்வெண் (f)',
      energy: 'மொத்த ஆற்றல் (E)',
      phase: 'கட்டக் கோணம் (φ)',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
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

  const [mode, setMode] = useState<'spring' | 'pendulum'>('spring');
  const [explainMode] = useState<boolean>(true);
  const [showRefCircle, setShowRefCircle] = useState<boolean>(true);
  
  // Controls
  const [mass, setMass] = useState<number>(1.0);        // kg
  const [springK, setSpringK] = useState<number>(15);     // N/m
  const [length, setLength] = useState<number>(2.0);      // meters
  const [damping, setDamping] = useState<number>(0.0);    // b coefficient
  const [amplitude, setAmplitude] = useState<number>(1.2); // meters or radians initial displacement

  // Simulation Time state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const timeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas interaction
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef<boolean>(false);

  // Chart data history
  const [history, setHistory] = useState<{ 
    t: number[]; 
    x: (number | null)[]; 
    v: (number | null)[]; 
    a: (number | null)[]; 
    ek: (number | null)[]; 
    ep: (number | null)[]; 
    et: (number | null)[]; 
  }>({
    t: [],
    x: [],
    v: [],
    a: [],
    ek: [],
    ep: [],
    et: []
  });

  // Real-Time Integrity Monitor status
  const [healthStatus, setHealthStatus] = useState<{
    status: 'Optimal' | 'Jittery' | 'Stalled' | 'Lagging';
    fps: number;
    droppedFrames: number;
    jitter: number;
    integrity: string;
  }>({
    status: 'Optimal',
    fps: 60,
    droppedFrames: 0,
    jitter: 0.0,
    integrity: '100.0%'
  });

  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);
  const jitterAccumulatorRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  // DOM element refs for 60fps energy bar fluctuations
  const ekValRef = useRef<HTMLSpanElement>(null);
  const epValRef = useRef<HTMLSpanElement>(null);
  const eTotalValRef = useRef<HTMLSpanElement>(null);
  const ekBarRef = useRef<HTMLDivElement>(null);
  const epBarRef = useRef<HTMLDivElement>(null);

  // Derived variables
  const omega0 = mode === 'spring' ? Math.sqrt(springK / mass) : Math.sqrt(10 / length);
  const period = 2 * Math.PI / omega0;

  // Calculate current SHM physics state
  const currentParams: SHMParameters = {
    mode,
    mass,
    springK,
    length,
    gravity: 10,
    damping,
    amplitude: mode === 'pendulum' ? (amplitude * Math.PI) / 180 : amplitude
  };
  const shmState = calculateSHMState(timeRef.current, currentParams);



  // Handle Damping presets
  const applyPreset = (preset: 'none' | 'under' | 'critical' | 'over') => {
    if (preset === 'none') {
      setDamping(0.0);
    } else if (preset === 'under') {
      setDamping(mode === 'spring' ? 0.3 : 0.4);
    } else if (preset === 'critical') {
      // b_crit = 2 * sqrt(m * k)
      const bCrit = mode === 'spring' 
        ? 2 * Math.sqrt(mass * springK) 
        : 2 * (mass * length) * Math.sqrt(10 / length);
      setDamping(parseFloat(bCrit.toFixed(2)));
    } else if (preset === 'over') {
      const bCrit = mode === 'spring' 
        ? 2 * Math.sqrt(mass * springK) 
        : 2 * (mass * length) * Math.sqrt(10 / length);
      setDamping(parseFloat((bCrit * 1.8).toFixed(2)));
    }
  };

  // Reset simulation timer
  const handleReset = () => {
    timeRef.current = 0;
    accumulatorRef.current = 0;
    setHistory({ t: [], x: [], v: [], a: [], ek: [], ep: [], et: [] });
    // Force re-draw by checking current params
  };

  // Animation cycle
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const deltaSeconds = Math.min(0.25, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      // Track rendering integrity details
      const frameIntervalMs = deltaSeconds * 1000;
      frameCountRef.current++;
      
      // Calculate jitter (against target 16.67ms)
      const targetInterval = 1000 / 60;
      const currentJitter = Math.abs(frameIntervalMs - targetInterval);
      jitterAccumulatorRef.current = jitterAccumulatorRef.current * 0.9 + currentJitter * 0.1;

      // Detect frame drops and stalls
      if (frameIntervalMs > 32) {
        droppedFramesRef.current += Math.floor(frameIntervalMs / 16.67) - 1;
      }

      let currentStatus: 'Optimal' | 'Jittery' | 'Stalled' | 'Lagging' = 'Optimal';
      if (frameIntervalMs > 100) {
        currentStatus = 'Stalled';
      } else if (frameIntervalMs > 45) {
        currentStatus = 'Lagging';
      } else if (jitterAccumulatorRef.current > 4.5) {
        currentStatus = 'Jittery';
      }

      // Update Simulation Health stats every 500ms
      if (now - lastFpsUpdateRef.current > 500) {
        const computedFps = Math.round(frameCountRef.current / ((now - lastFpsUpdateRef.current) / 1000));
        const totalExpectedFrames = ((now - lastFpsUpdateRef.current) / 1000) * 60;
        const integrityPct = Math.max(0, 100 - (droppedFramesRef.current / Math.max(1, totalExpectedFrames)) * 100);
        
        setHealthStatus({
          status: currentStatus,
          fps: computedFps,
          droppedFrames: droppedFramesRef.current,
          jitter: parseFloat(jitterAccumulatorRef.current.toFixed(1)),
          integrity: `${integrityPct.toFixed(1)}%`
        });
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      if (isPlaying && !isDragging.current) {
        // Detect significant rendering gap (e.g. background tab or system stall)
        if (deltaSeconds > 0.08) {
          // Insert null break to prevent drawing artificial connecting line segments
          setHistory(prev => {
            const nextT = [...prev.t, timeRef.current + 0.001];
            const nextX = [...prev.x, null];
            const nextV = [...prev.v, null];
            const nextA = [...prev.a, null];
            const nextEk = [...prev.ek, null];
            const nextEp = [...prev.ep, null];
            const nextEt = [...prev.et, null];

            if (nextT.length > 150) {
              nextT.shift(); nextX.shift(); nextV.shift(); nextA.shift();
              nextEk.shift(); nextEp.shift(); nextEt.shift();
            }
            return { t: nextT, x: nextX, v: nextV, a: nextA, ek: nextEk, ep: nextEp, et: nextEt };
          });
        }

        // Fixed physics timestep accumulator
        const dt = 1 / 100; // 10ms fixed physics steps
        accumulatorRef.current += deltaSeconds;
        while (accumulatorRef.current >= dt) {
          timeRef.current += dt;
          accumulatorRef.current -= dt;
        }

        // Compute new state
        const state = calculateSHMState(timeRef.current, currentParams);

        // Update charts history trail
        setHistory(prev => {
          const nextT = [...prev.t, timeRef.current];
          const nextX = [...prev.x, state.displacement];
          const nextV = [...prev.v, state.velocity];
          const nextA = [...prev.a, state.acceleration];
          const nextEk = [...prev.ek, state.kineticEnergy];
          const nextEp = [...prev.ep, state.potentialEnergy];
          const nextEt = [...prev.et, state.totalEnergy];

          // Keep last 150 points for smooth scrolling
          if (nextT.length > 150) {
            nextT.shift();
            nextX.shift();
            nextV.shift();
            nextA.shift();
            nextEk.shift();
            nextEp.shift();
            nextEt.shift();
          }
          return { t: nextT, x: nextX, v: nextV, a: nextA, ek: nextEk, ep: nextEp, et: nextEt };
        });
      }

      // Compute latest state (even if paused!)
      const latestState = calculateSHMState(timeRef.current, currentParams);
      
      // Update DOM elements directly at 60fps
      if (ekValRef.current) ekValRef.current.innerText = `${latestState.kineticEnergy.toFixed(3)} J`;
      if (epValRef.current) epValRef.current.innerText = `${latestState.potentialEnergy.toFixed(3)} J`;
      if (eTotalValRef.current) eTotalValRef.current.innerText = `${latestState.totalEnergy.toFixed(3)} J`;
      
      const totalE = latestState.totalEnergy || 1;
      const ekPct = Math.min(100, (latestState.kineticEnergy / totalE) * 100);
      const epPct = Math.min(100, (latestState.potentialEnergy / totalE) * 100);
      
      if (ekBarRef.current) ekBarRef.current.style.width = `${ekPct}%`;
      if (epBarRef.current) epBarRef.current.style.width = `${epPct}%`;

      drawSimulation();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, mode, mass, springK, length, damping, amplitude, showRefCircle]);

  // Canvas Drawer
  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rectWidth = 720;
    const rectHeight = 540;

    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
    canvas.style.width = `${rectWidth}px`;
    canvas.style.height = `${rectHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw background grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < rectWidth; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rectHeight);
      ctx.stroke();
    }
    for (let y = 0; y < rectHeight; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rectWidth, y);
      ctx.stroke();
    }

    const state = calculateSHMState(timeRef.current, currentParams);
    const centerX = rectWidth / 2;
    const springX = mode === 'spring' && showRefCircle ? (centerX + 115) : centerX;

    if (mode === 'spring') {
      // 1. Draw Mass-Spring System
      const ceilingY = 40;
      const restLength = 200;
      const springScale = 75;
      
      // Calculate spring stretching scaling
      const extension = state.displacement * springScale; // Scale meters to pixels
      const currentLength = restLength + extension;

      // Draw Ceiling support
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(springX - 80, ceilingY - 10, 160, 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let x = springX - 75; x < springX + 80; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, ceilingY - 10);
        ctx.lineTo(x - 5, ceilingY);
        ctx.stroke();
      }

      // Draw spring (helical spring coil logic)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(springX, ceilingY);

      const coils = 18;
      const springWidth = 16;
      for (let i = 0; i <= coils; i++) {
        const fraction = i / coils;
        const currY = ceilingY + fraction * currentLength;
        let currX = springX;
        if (i > 0 && i < coils) {
          currX += (i % 2 === 0 ? 1 : -1) * springWidth;
        }
        ctx.lineTo(currX, currY);
      }
      ctx.stroke();

      // Draw Mass block
      const blockWidth = 50;
      const blockHeight = 40;
      const blockY = ceilingY + currentLength;

      ctx.fillStyle = '#3b82f6'; // Blue mass block
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(springX - blockWidth / 2, blockY, blockWidth, blockHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Label mass inside block
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)} kg`, springX, blockY + 24);

      // Draw equilibrium reference line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(springX - 120, ceilingY + restLength + blockHeight/2);
      ctx.lineTo(springX + 120, ceilingY + restLength + blockHeight/2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px font-sans';
      ctx.fillText('Equilibrium', springX + 155, ceilingY + restLength + blockHeight/2 + 3);

    } else {
      // 2. Draw Simple Pendulum System
      const pivotX = centerX;
      const pivotY = 50;

      // Draw pivot support
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(pivotX - 40, pivotY - 8, 80, 8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let x = pivotX - 35; x < pivotX + 40; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, pivotY - 8);
        ctx.lineTo(x - 4, pivotY);
        ctx.stroke();
      }

      // Angular displacement theta
      // We scale amplitude to visual swing radians
      const theta = state.displacement; 

      // Length scaling: 1 meter = 60 pixels (with ref circle) or 110 pixels (expanded)
      const visualL = length * (showRefCircle ? 60 : 110);
      const bobX = pivotX + visualL * Math.sin(theta);
      const bobY = pivotY + visualL * Math.cos(theta);

      // Draw pendulum rod
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw bob
      const bobRadius = 16 + mass * 3;
      ctx.fillStyle = '#ef4444'; // Red bob
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw equilibrium vertical normal (dashed)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + visualL + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label mass inside bob
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)}kg`, bobX, bobY + 3);
    }

      // Draw reference circle if requested
      if (showRefCircle) {
        const visualL = length * 60;
        // Radius of the circle equals the amplitude (scaled to pixels)
        const maxRadius = mode === 'spring' 
          ? Math.abs(amplitude * 75) 
          : Math.abs(visualL * Math.sin((amplitude * Math.PI) / 180));
        
        // Align center of the circle exactly on the equilibrium lines:
        // - Spring: shift to the left side (X = 180) and centered vertically at spring equilibrium Y = 260 (40 + 200 + 20)
        // - Pendulum: vertical equilibrium level (X = centerX) and positioned under the bob (Y = 350)
        const circleX = mode === 'spring' ? 180 : centerX;
        const circleY = mode === 'spring' ? 260 : 350;
        
        // Damping decay factor
        const beta = damping / (2 * (mode === 'spring' ? mass : mass * length));
        const decayFactor = Math.exp(-beta * timeRef.current);
        const currentRadius = maxRadius * decayFactor;

        // Draw axes
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(circleX - maxRadius - 10, circleY);
        ctx.lineTo(circleX + maxRadius + 10, circleY);
        ctx.moveTo(circleX, circleY - maxRadius - 10);
        ctx.lineTo(circleX, circleY + maxRadius + 10);
        ctx.stroke();

        // Draw main boundary auxiliary circle (represents initial amplitude)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(circleX, circleY, maxRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw current decaying orbit circle (dashed, represents damped amplitude)
        if (damping > 0 && currentRadius > 2) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.arc(circleX, circleY, currentRadius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Phasor rotation angle phi
        const phi = omega0 * timeRef.current;
        let px = 0;
        let py = 0;

        if (mode === 'spring') {
          // Vertical SHM: Y component is displacement, X component is velocity
          // Calculate py to exactly match the mass block's physical vertical displacement
          py = state.displacement * 75;
          const sign = Math.sin(phi) >= 0 ? 1 : -1;
          px = sign * Math.sqrt(Math.max(0, currentRadius * currentRadius - py * py));
        } else {
          // Horizontal SHM: X component is displacement, Y component is velocity
          // Calculate px to exactly match the bob's physical horizontal displacement
          px = visualL * Math.sin(state.displacement);
          const sign = state.velocity >= 0 ? 1 : -1;
          py = sign * Math.sqrt(Math.max(0, currentRadius * currentRadius - px * px));
        }

        // Draw Phasor line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(circleX, circleY);
        ctx.lineTo(circleX + px, circleY + py);
        ctx.stroke();

        // Draw Phasor head dot
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(circleX + px, circleY + py, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw projection line to the mass block or bob
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        if (mode === 'spring') {
          // Spring: project horizontally to mass block center of gravity Y coordinate
          const blockCenterY = 260 + state.displacement * 75;
          ctx.moveTo(circleX + px, blockCenterY);
          ctx.lineTo(springX, blockCenterY);
        } else {
          // Pendulum: project horizontally/vertically to bob coordinate
          const bobX = centerX + visualL * Math.sin(state.displacement);
          const bobY = 50 + visualL * Math.cos(state.displacement);
          ctx.moveTo(circleX + px, circleY + py);
          ctx.lineTo(bobX, bobY);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Label reference circle
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 8px font-sans';
        ctx.fillText('Reference Phasor', circleX - 38, circleY - maxRadius - 8);
      }

      // Overlay physics indicators
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px font-sans';
      ctx.textAlign = 'left';
      ctx.fillText(`Displacement (x): ${state.displacement.toFixed(2)} m`, 20, 30);
      ctx.fillText(`Velocity (v): ${state.velocity.toFixed(2)} m/s`, 20, 48);
      ctx.fillText(`Acceleration (a): ${state.acceleration.toFixed(2)} m/s²`, 20, 66);

      ctx.restore();
    };

  // Click & Drag event listeners for setting amplitude directly
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;

    if (mode === 'spring') {
      // Spring mode dragging block vertical displacement
      const springX = showRefCircle ? (centerX + 115) : centerX;
      const springScale = 75;
      const springEq = 240;
      const currentBlockY = springEq + shmState.displacement * springScale + 20;
      if (Math.abs(x - springX) < 40 && Math.abs(y - currentBlockY) < 40) {
        isDragging.current = true;
        setIsPlaying(false);
      }
    } else {
      // Pendulum bob dragging
      const visualL = length * (showRefCircle ? 60 : 110);
      const bobX = centerX + visualL * Math.sin(shmState.displacement);
      const bobY = 50 + visualL * Math.cos(shmState.displacement);

      const dx = x - bobX;
      const dy = y - bobY;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        isDragging.current = true;
        setIsPlaying(false);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;

    if (mode === 'spring') {
      // Map vertical coordinate offset relative to dynamic equilibrium Y
      const springScale = 75;
      const springEq = 240;
      const deltaY = y - springEq;
      const newAmp = Math.max(-2.0, Math.min(2.0, deltaY / springScale));
      setAmplitude(newAmp);
      timeRef.current = 0; // reset phase
      setHistory({ t: [], x: [], v: [], a: [], ek: [], ep: [], et: [] });
    } else {
      // Map angle relative to pivot (centerX, 50)
      const dx = x - centerX;
      const dy = y - 50;
      const angle = Math.atan2(dx, dy); // angle relative to vertical normal
      const newAmpDeg = angle * (180 / Math.PI);
      const clampedAmpDeg = Math.max(-75, Math.min(75, newAmpDeg));
      setAmplitude(clampedAmpDeg);
      timeRef.current = 0;
      setHistory({ t: [], x: [], v: [], a: [], ek: [], ep: [], et: [] });
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setIsPlaying(true);
    }
  };

  // Universal Simulation Data Recorder & Laboratory Transfer
  const recorder = useSimulationRecorder({
    simulationId: 'shm_sim',
    simulationTitle: 'Simple Harmonic Motion',
    category: 'waves',
    columns: [
      { key: 'trial', label: 'Trial #' },
      { key: 'mode', label: 'Oscillator Mode', unit: '' },
      { key: 'length_m', label: 'Pendulum Length (L)', unit: 'm' },
      { key: 'mass_kg', label: 'Mass (m)', unit: 'kg' },
      { key: 'springK_N_m', label: 'Spring Const (k)', unit: 'N/m' },
      { key: 'period_s', label: 'Period (T)', unit: 's' },
      { key: 'periodSq_s2', label: 'Period Squared (T²)', unit: 's²' },
      { key: 'amplitude', label: 'Amplitude (A)', unit: mode === 'spring' ? 'm' : '°' },
      { key: 'totalEnergy_J', label: 'Total Energy (E)', unit: 'J' },
    ],
    getCurrentRow: () => ({
      mode: mode === 'spring' ? 'Spring-Mass' : 'Simple Pendulum',
      length_m: length,
      mass_kg: mass,
      springK_N_m: springK,
      period_s: parseFloat(period.toFixed(3)),
      periodSq_s2: parseFloat((period * period).toFixed(3)),
      amplitude: parseFloat(amplitude.toFixed(2)),
      totalEnergy_J: parseFloat(shmState.totalEnergy.toFixed(3)),
    }),
    getSeriesData: () => {
      if (mode === 'pendulum') {
        const lengths = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
        return lengths.map((len, idx) => {
          const w = Math.sqrt(10 / len);
          const per = 2 * Math.PI / w;
          return {
            trial: idx + 1,
            mode: 'Simple Pendulum',
            length_m: len,
            mass_kg: mass,
            springK_N_m: springK,
            period_s: parseFloat(per.toFixed(3)),
            periodSq_s2: parseFloat((per * per).toFixed(3)),
            amplitude: parseFloat(amplitude.toFixed(2)),
            totalEnergy_J: parseFloat(shmState.totalEnergy.toFixed(3)),
          };
        });
      } else {
        const masses = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
        return masses.map((m, idx) => {
          const w = Math.sqrt(springK / m);
          const per = 2 * Math.PI / w;
          return {
            trial: idx + 1,
            mode: 'Spring-Mass',
            length_m: length,
            mass_kg: m,
            springK_N_m: springK,
            period_s: parseFloat(per.toFixed(3)),
            periodSq_s2: parseFloat((per * per).toFixed(3)),
            amplitude: parseFloat(amplitude.toFixed(2)),
            totalEnergy_J: parseFloat(shmState.totalEnergy.toFixed(3)),
          };
        });
      }
    },
    autoRunConfig: {
      steps: mode === 'pendulum' ? [
        { label: 'Pendulum Length L = 0.5 m', params: { length: 0.5 }, durationMs: 750 },
        { label: 'Pendulum Length L = 1.0 m', params: { length: 1.0 }, durationMs: 750 },
        { label: 'Pendulum Length L = 1.5 m', params: { length: 1.5 }, durationMs: 750 },
        { label: 'Pendulum Length L = 2.0 m', params: { length: 2.0 }, durationMs: 750 },
        { label: 'Pendulum Length L = 2.5 m', params: { length: 2.5 }, durationMs: 750 },
        { label: 'Pendulum Length L = 3.0 m', params: { length: 3.0 }, durationMs: 750 },
      ] : [
        { label: 'Mass m = 0.5 kg', params: { mass: 0.5 }, durationMs: 750 },
        { label: 'Mass m = 1.0 kg', params: { mass: 1.0 }, durationMs: 750 },
        { label: 'Mass m = 2.0 kg', params: { mass: 2.0 }, durationMs: 750 },
        { label: 'Mass m = 3.0 kg', params: { mass: 3.0 }, durationMs: 750 },
        { label: 'Mass m = 4.0 kg', params: { mass: 4.0 }, durationMs: 750 },
        { label: 'Mass m = 5.0 kg', params: { mass: 5.0 }, durationMs: 750 },
      ],
      applyParams: (p) => {
        if (p.length !== undefined) setLength(p.length);
        if (p.mass !== undefined) setMass(p.mass);
      },
    },
    defaultGraphConfig: {
      xAxis: mode === 'pendulum' ? 'length_m' : 'mass_kg',
      yAxis: 'periodSq_s2',
      title: mode === 'pendulum' ? 'T² vs Length L (Slope = 4π²/g)' : 'T² vs Mass m (Slope = 4π²/k)',
      showRegression: true,
    },
  });

  const tn = SHM_THEORY_NOTES[lang] || SHM_THEORY_NOTES.en;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            {tn.badge}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Simple Harmonic Motion (SHM)
          </h2>
        </div>

        {/* View Mode Toggle Pill Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('notebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'notebook'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
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
      {ENABLE_THEORY_NOTEBOOKS && viewMode === 'notebook' && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Notebook Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTheoryTab('theory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTheoryTab === 'theory'
                  ? 'bg-indigo-600 text-white shadow-xs'
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
                  ? 'bg-indigo-600 text-white shadow-xs'
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
                  ? 'bg-indigo-600 text-white shadow-xs'
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
              {/* Sec 1: What is SHM? */}
              <div className="bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-r-xl space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{tn.sec1Title}</h3>
                <p className="font-medium text-slate-700">{tn.sec1Body}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-150 text-center font-mono font-bold text-indigo-800 text-xs shadow-2xs">
                    <BlockMath math="a \propto -x \implies \boxed{a = -\omega^2 x}" />
                  </div>
                  <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-center">
                    {tn.sec1SignExpl}
                  </div>
                </div>
              </div>

              {/* Sec 2: Basic Idea & Spring Diagram */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {tn.sec2Title}
                </h4>
                <p>{tn.sec2Body}</p>
                
                {/* Visual Spring Restoring Force Box */}
                <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-3.5 rounded-xl space-y-2 overflow-x-auto shadow-inner">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Mass-Spring Restoring Force Diagram</div>
                  <div>
                    <span className="text-amber-400">Equilibrium (x = 0):</span> ───────●─────── (Restoring Force F = 0)
                  </div>
                  <div>
                    <span className="text-blue-400">Displaced Right (x &gt; 0):</span> ───────●───────→ x  |  <span className="text-rose-400 font-bold">← F</span> (Restoring force acts LEFT)
                  </div>
                  <div>
                    <span className="text-purple-400">Displaced Left (x &lt; 0):</span>  x ←───────●───────  |  <span className="text-emerald-400 font-bold">F →</span> (Restoring force acts RIGHT)
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium pt-1">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">{tn.sec2Right}</div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">{tn.sec2Left}</div>
                </div>
              </div>

              {/* Sec 3: Conditions for SHM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">At Equilibrium (x = 0)</h4>
                  <p className="text-emerald-800 font-medium">{tn.sec3Eq}</p>
                  <BlockMath math="x = 0 \implies a = 0, \quad v = v_{\max} = \omega A" />
                </div>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">At Maximum Displacement (x = ±A)</h4>
                  <p className="text-amber-800 font-medium">{tn.sec3Ext}</p>
                  <BlockMath math="x = \pm A \implies |a|_{\max} = \omega^2 A, \quad v = 0" />
                </div>
              </div>

              {/* Sec 8, 9, 10: Forces, Spring & Pendulum */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    {tn.sec8Title}
                  </h4>
                  <p>{tn.sec8Body}</p>
                  <BlockMath math="\boxed{F = ma = -m\omega^2 x}" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {tn.sec9Title}
                  </h4>
                  <p>{tn.sec9Body}</p>
                  <BlockMath math="\omega = \sqrt{\frac{k}{m}}, \quad \boxed{T = 2\pi\sqrt{\frac{m}{k}}}" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    {tn.sec10Title}
                  </h4>
                  <p>{tn.sec10Body}</p>
                  <BlockMath math="\boxed{T = 2\pi\sqrt{\frac{L}{g}}}, \quad T \propto \sqrt{L}" />
                </div>
              </div>

              {/* Sec 11 & 12: Energy in SHM */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">{tn.sec11Title}</h4>
                <p>{tn.sec11Body}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total Energy</div>
                    <BlockMath math="E = \frac{1}{2} k A^2" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Potential Energy</div>
                    <BlockMath math="U = \frac{1}{2} k x^2" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Kinetic Energy</div>
                    <BlockMath math="K = \frac{1}{2} k (A^2 - x^2)" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Equations & SI Units */}
          {activeTheoryTab === 'formulas' && (
            <div className="space-y-6">
              {/* Sec 4: Quantities Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.sec4Title}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3">Symbol</th>
                        <th className="py-2 px-3">Description & SI Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {tn.quantities.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{q.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-indigo-600">({q.sym})</td>
                          <td className="py-2 px-3">{q.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center font-bold text-indigo-700">
                    <BlockMath math="\boxed{f = \frac{1}{T}}" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center font-bold text-indigo-700">
                    <BlockMath math="\boxed{\omega = 2\pi f = \frac{2\pi}{T}}" />
                  </div>
                </div>
              </div>

              {/* Sec 5, 6, 7: Displacement, Velocity & Acceleration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sec 5: Displacement */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-indigo-700 text-xs">{tn.sec5Title}</h4>
                  <p className="text-[11px] text-slate-600">{tn.sec5Body}</p>
                  <BlockMath math="\boxed{x = A\sin(\omega t + \phi)}" />
                  <BlockMath math="\boxed{x = A\cos(\omega t + \phi)}" />
                </div>

                {/* Sec 6: Velocity */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-blue-700 text-xs">{tn.sec6Title}</h4>
                  <p className="text-[11px] text-slate-600">{tn.sec6Body}</p>
                  <BlockMath math="v = \frac{dx}{dt} = A\omega\cos(\omega t + \phi)" />
                  <BlockMath math="\boxed{v = \pm\omega\sqrt{A^2 - x^2}}" />
                  <p className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded border border-blue-150 font-medium">{tn.sec6Vmax}</p>
                </div>

                {/* Sec 7: Acceleration */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-purple-700 text-xs">{tn.sec7Title}</h4>
                  <p className="text-[11px] text-slate-600">{tn.sec7Body}</p>
                  <BlockMath math="\boxed{a = -\omega^2 x}" />
                  <BlockMath math="\boxed{a_{\max} = \omega^2 A}" />
                </div>
              </div>

              {/* Sec 13 & 14: Phase & Cycle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">{tn.sec13Title}</h4>
                  <div className="space-y-2 text-xs">
                    {tn.phaseList.map((p, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-medium text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">{tn.sec14Title}</h4>
                  <p className="text-xs text-slate-600">{tn.sec14Body}</p>
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-150 text-center font-mono font-bold text-indigo-900 text-xs">
                    Cycle Path: 0 → +A → 0 → -A → 0 (Total Distance = 4A)
                  </div>
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

          {/* Tab 3: Quick Comparison & Senath Rules */}
          {activeTheoryTab === 'tips' && (
            <div className="space-y-6">
              {/* Sec 15: Quick Comparison Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.sec15Title}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100 text-slate-800 font-bold">
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-3">Displacement (x)</th>
                        <th className="py-2.5 px-3">Speed (v)</th>
                        <th className="py-2.5 px-3">Acceleration (a)</th>
                        <th className="py-2.5 px-3">Kinetic Energy (K)</th>
                        <th className="py-2.5 px-3">Potential Energy (U)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                      {tn.matrix.map((row, idx) => (
                        <tr key={idx} className={idx === 1 ? 'bg-emerald-50/50 font-bold text-emerald-950' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{row.pos}</td>
                          <td className="py-2.5 px-3">{row.disp}</td>
                          <td className="py-2.5 px-3 font-semibold text-blue-700">{row.speed}</td>
                          <td className="py-2.5 px-3 font-semibold text-purple-700">{row.accel}</td>
                          <td className="py-2.5 px-3">{row.ke}</td>
                          <td className="py-2.5 px-3">{row.pe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Senath Golden Rules */}
              <div className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-2xl p-5 space-y-4 shadow-md">
                <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 text-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {tn.senathHeader}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {tn.rules.map((r, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-xl space-y-1.5">
                      <div className="font-bold text-amber-200 text-xs">{r.title}</div>
                      <div className="font-mono font-bold text-white text-sm bg-black/20 p-1.5 rounded text-center">{r.formula}</div>
                      <div className="text-[11px] text-amber-100 font-medium">{r.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-black/20 p-3 rounded-xl text-center font-bold text-xs text-amber-100 tracking-wide">
                  {tn.senathSummary}
                </div>
              </div>

              {/* Sec 16: Most Important Formulae Cheat Sheet */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tn.sec16Title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono font-bold text-indigo-800">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">a = -ω²x</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">x = A sin(ωt + φ)</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">v² = ω²(A² - x²)</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">v_max = ωA</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">a_max = ω²A</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">ω = 2πf = 2π/T</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">T = 2π√(m/k)</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">T = 2π√(L/g)</div>
                </div>
              </div>

              {/* Interactive Simulation Reflection Question */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-2.5">
                <h3 className="font-bold text-blue-900 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  {tn.reflectionTitle}
                </h3>
                <p className="font-bold text-blue-950 text-xs">{tn.reflectionQ}</p>
                <div className="bg-white p-3 rounded-lg border border-blue-150 text-xs text-blue-900 font-medium leading-relaxed">
                  {tn.reflectionAns}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters Column (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* System Mode Select */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Select SHM System</span>
              {recorder.isAutoRunning && (
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                  🔒 Auto-Running
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('spring'); setAmplitude(1.2); handleReset(); }}
                disabled={recorder.isAutoRunning}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'spring' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mass-Spring
              </button>
              <button
                onClick={() => { setMode('pendulum'); setAmplitude(45); handleReset(); }}
                disabled={recorder.isAutoRunning}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  mode === 'pendulum' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Simple Pendulum
              </button>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.paramsTitle}</h3>

            {/* Mass parameter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.mass}</span>
                <span className="text-slate-800 font-mono">{mass.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={mass}
                disabled={recorder.isAutoRunning}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Spring constant or Length depending on mode */}
            {mode === 'spring' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{t.springConst}</span>
                  <span className="text-slate-800 font-mono">{springK} N/m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={springK}
                  disabled={recorder.isAutoRunning}
                  onChange={(e) => setSpringK(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{t.pendulumLen}</span>
                  <span className="text-slate-800 font-mono">{length.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={length}
                  disabled={recorder.isAutoRunning}
                  onChange={(e) => setLength(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* Damping Coefficient */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{t.damping}</span>
                <span className="text-slate-800 font-mono">{damping.toFixed(2)} N s/m</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />

              {/* Damping Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                <button onClick={() => applyPreset('none')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Undamped</button>
                <button onClick={() => applyPreset('under')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Underdamped</button>
                <button onClick={() => applyPreset('critical')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Crit. Damped</button>
                <button onClick={() => applyPreset('over')} className="px-2 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200 rounded font-bold cursor-pointer transition-colors text-slate-700">Overdamped</button>
              </div>
            </div>

            {/* Amplitude / Initial Angle slider */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">
                  {mode === 'spring' ? 'Initial Displacement (x₀)' : 'Initial Angle (θ₀)'}
                </span>
                <span className="text-slate-800 font-mono">
                  {amplitude.toFixed(1)} {mode === 'spring' ? 'm' : '°'}
                </span>
              </div>
              <input
                type="range"
                min={mode === 'spring' ? '-2.0' : '-75'}
                max={mode === 'spring' ? '2.0' : '75'}
                step={mode === 'spring' ? '0.05' : '1'}
                value={amplitude}
                onChange={(e) => { setAmplitude(parseFloat(e.target.value)); handleReset(); }}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 font-medium block">Tip: Click & Drag the mass directly inside the viewport!</span>
            </div>

            {/* Simulated environment constraints */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              {/* Reference Circle checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showRefCircle"
                  checked={showRefCircle}
                  onChange={(e) => setShowRefCircle(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-350 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="showRefCircle" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Show SHM Reference Circle
                </label>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1">
                <span>Gravity Constant (g)</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">10 m/s²</span>
              </div>
            </div>
          </div>

          {/* Action trigger button */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <button
              onClick={recorder.recordTrial}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Trial Snapshot
            </button>
          </div>

        </div>

        {/* Right Side: Visual Viewport Column (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Visual Canvas Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Oscillator Viewport</h3>
              
              <div className="flex items-center gap-2">
                {/* Expandable Simulation Health Indicator */}
                <div className="relative group z-30">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      healthStatus.status === 'Optimal' ? 'bg-emerald-500 animate-ping' :
                      healthStatus.status === 'Jittery' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    Health: {healthStatus.fps} FPS
                  </div>

                  <div className="absolute right-0 top-full mt-1 bg-slate-900/95 text-white rounded-lg p-2.5 shadow-xl border border-slate-700/50 backdrop-blur-sm w-44 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-in-out text-[10px] space-y-1.5 leading-tight font-medium">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                      <span className="font-bold uppercase tracking-wider text-slate-400">Diag Monitor</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        healthStatus.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
                        healthStatus.status === 'Jittery' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {healthStatus.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dropped Frames:</span>
                      <span className="font-mono text-slate-200">{healthStatus.droppedFrames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timing Jitter:</span>
                      <span className="font-mono text-slate-200">{healthStatus.jitter} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Graph Integrity:</span>
                      <span className="font-mono text-slate-200">{healthStatus.integrity}</span>
                    </div>
                  </div>
                </div>

                {/* Play Pause Controls */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-700 transition-colors cursor-pointer"
                    title="Reset variables"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full min-h-[320px] overflow-x-auto flex items-center justify-center py-4 bg-slate-50/20 rounded-xl">
              <canvas
                ref={canvasRef}
                className="border border-slate-100 rounded-lg bg-white cursor-grab active:cursor-grabbing select-none shadow-sm"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Energy conversion bar chart */}
            <div className="w-full mt-4 space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time Energy Spectrum</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Kinetic Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                    <span>Kinetic Energy (Ek)</span>
                    <span ref={ekValRef} className="font-mono">{shmState.kineticEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      ref={ekBarRef}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, (shmState.kineticEnergy / (shmState.totalEnergy || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Potential Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-indigo-600">
                    <span>Potential Energy (Ep)</span>
                    <span ref={epValRef} className="font-mono">{shmState.potentialEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      ref={epBarRef}
                      className="h-full bg-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, (shmState.potentialEnergy / (shmState.totalEnergy || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Total Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-violet-600">
                    <span>Total Energy (E)</span>
                    <span ref={eTotalValRef} className="font-mono">{shmState.totalEnergy.toFixed(3)} J</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Explain Mode Real-time Card overlay */}
          {explainMode && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Info className="w-4 h-4" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Concept Explainer Overlay</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {damping === 0 ? (
                  `The oscillator displays simple harmonic motion with periodic oscillation of period T = ${period.toFixed(2)} seconds. The energy converts continuously between kinetic energy (maximum at equilibrium) and potential energy (maximum at maximum amplitude), conserving total mechanical energy.`
                ) : shmState.isOverdamped ? (
                  `The system is Overdamped. Since the damping coefficient exceeds the critical value, the oscillator returns to its equilibrium position slowly without crossing it.`
                ) : shmState.isCriticallyDamped ? (
                  `The system is Critically Damped. It returns to equilibrium in the fastest possible time without oscillating.`
                ) : (
                  `The system displays Damped Harmonic Motion. Air resistance gradually dissipates energy, showing an exponential decay envelope on amplitude.`
                )}
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/70 rounded-lg p-3 border border-indigo-200/50">
                <div className="text-xs font-bold text-slate-500 font-mono">Mathematical Formula:</div>
                <div className="text-xs font-bold text-slate-800">
                  {mode === 'spring' ? (
                    <BlockMath math={`T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{${mass.toFixed(1)}}{${springK}}} = ${period.toFixed(2)}s`} />
                  ) : (
                    <BlockMath math={`T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{${length.toFixed(1)}}{10}} = ${period.toFixed(2)}s`} />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Automatic Real-time Graph Section */}
      <div className="w-full">
        <ScientificGraphLab
          graphs={shmGraphs}
          trials={recorder.recordedRows}
          realtimePoints={history.t.map((tVal, i) => ({ t: tVal, x: history.x[i] ?? 0, y: history.v[i] ?? 0, displacement: history.x[i] ?? 0, velocity: history.v[i] ?? 0, acceleration: history.a[i] ?? 0 }))}
          simulationParams={{ mass, springK, length, amplitude, mode }}
          onRecordTrial={recorder.recordTrial}
          onClearTrials={recorder.clearTrials}
          columns={recorder.columns}
          height={320}
        />
      </div>

    </div>
  );
}
