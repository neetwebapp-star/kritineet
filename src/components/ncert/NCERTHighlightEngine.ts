/**
 * NCERT Intelligent Semantic Highlighting & Terminology Engine
 * Enhanced for Class 11 Physics (Book 1 / Part 1) and cross-subject compatibility.
 * Extracts key scientific concepts, provides bilingual quick meanings,
 * formulas, definitions, and highlights terms without altering original NCERT text by a single character.
 */

export interface WordMeaning {
  term: string;
  hindi: string;
  context?: string;
}

export interface HighlightRule {
  text: string;
  type: 'concept' | 'law' | 'unit' | 'formula' | 'distinction';
}

export interface PhysicsFormula {
  name: string;
  formula: string;
  description: string;
}

export interface NCERTDefinition {
  term: string;
  definition: string;
}

// Comprehensive bilingual glossary for NEET NCERT across Physics (Book 1 focus), Biology, and Chemistry
export const NEET_DIFFICULT_WORDS_DICTIONARY: Record<string, WordMeaning> = {
  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 1 - UNITS & MEASUREMENTS
  // ==========================================
  measurement: { term: 'Measurement', hindi: 'मापन (किसी भौतिक राशि की मानक मात्रक से तुलना)' },
  accuracy: { term: 'Accuracy', hindi: 'परिशुद्धता (मापे गए मान का वास्तविक मान के निकट होना)' },
  precision: { term: 'Precision', hindi: 'यथार्थता (समान राशि के विभिन्न मापों की परस्पर निकटता)' },
  significant: { term: 'Significant Figures', hindi: 'सार्थक अंक (विश्वसनीय अंक + पहला अनिश्चित अंक)' },
  uncertainty: { term: 'Uncertainty', hindi: 'अनिश्चितता (मापन में संभावित त्रुटि या विचलन की सीमा)' },
  dimension: { term: 'Dimension', hindi: 'विमा (मूल राशियों पर लगाई जाने वाली घातें)' },
  dimensional: { term: 'Dimensional Analysis', hindi: 'विमीय विश्लेषण (समीकरण की सत्यता व संबंध ज्ञात करने की विधि)' },
  homogeneity: { term: 'Principle of Homogeneity', hindi: 'समांगता का सिद्धांत (समीकरण के सभी पदों की विमाएँ समान होनी चाहिए)' },
  fundamental: { term: 'Fundamental Quantities', hindi: 'मूल राशियाँ (जो अन्य राशियों पर निर्भर नहीं करतीं, जैसे द्रव्यमान, लंबाई, समय)' },
  derived: { term: 'Derived Quantities', hindi: 'व्युत्पन्न राशियाँ (जो मूल राशियों के पदों में व्यक्त की जाती हैं)' },
  system: { term: 'System of Units', hindi: 'मात्रक प्रणाली (मूल व व्युत्पन्न मात्रकों का संपूर्ण समुच्चय, उदा. SI)' },
  base: { term: 'Base Units', hindi: 'मूल मात्रक (SI प्रणाली के सात मूलभूत मात्रक)' },
  supplementary: { term: 'Supplementary Units', hindi: 'पूरक मात्रक (समतल कोण हेतु रेडियन व ठोस कोण हेतु स्टेरेडियन)' },
  radian: { term: 'Radian', hindi: 'रेडियन (समतल कोण का SI मात्रक)' },
  steradian: { term: 'Steradian', hindi: 'स्टेरेडियन (ठोस कोण का SI मात्रक)' },
  astronomical: { term: 'Astronomical Unit (AU)', hindi: 'खगोलीय मात्रक (सूर्य और पृथ्वी के बीच की औसत दूरी)' },
  lightyear: { term: 'Light Year', hindi: 'प्रकाश वर्ष (प्रकाश द्वारा निर्वात में एक वर्ष में तय दूरी)' },
  parsec: { term: 'Parsec', hindi: 'पारसेक (दूरी का सबसे बड़ा खगोलीय मात्रक ~ 3.26 प्रकाश वर्ष)' },
  error: { term: 'Error', hindi: 'त्रुटि (वास्तविक मान और मापित मान का अंतर)' },
  systematic: { term: 'Systematic Error', hindi: 'क्रमबद्ध त्रुटि (एक ही दिशा में होने वाली नियमित त्रुटि)' },
  random: { term: 'Random Error', hindi: 'यादृच्छिक त्रुटि (अनियमित और अप्रत्याशित कारणों से होने वाली त्रुटि)' },
  least: { term: 'Least Count', hindi: 'अल्पतमांक (मापक यंत्र द्वारा मापा जा सकने वाला न्यूनतम मान)' },
  relative: { term: 'Relative Error', hindi: 'आपेक्षिक त्रुटि (परम त्रुटि और वास्तविक मान का अनुपात)' },
  percentage: { term: 'Percentage Error', hindi: 'प्रतिशत त्रुटि (आपेक्षिक त्रुटि को 100 से गुणा करने पर प्राप्त मान)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 2 - MOTION IN A STRAIGHT LINE
  // ==========================================
  kinematics: { term: 'Kinematics', hindi: 'शुद्ध गतिकी (गति के कारणों पर विचार किए बिना गति का अध्ययन)' },
  rectilinear: { term: 'Rectilinear Motion', hindi: 'सरल रेखीय गति (एक सीधी रेखा के अनुदिश होने वाली गति)' },
  displacement: { term: 'Displacement', hindi: 'विस्थापन (प्रारंभिक और अंतिम स्थिति के बीच का न्यूनतम सदिश अंतर)' },
  distance: { term: 'Path Length / Distance', hindi: 'तय की गई दूरी (पिंड द्वारा तय किए गए वास्तविक पथ की कुल लंबाई)' },
  instantaneous: { term: 'Instantaneous', hindi: 'तात्क्षणिक (समय के किसी विशिष्ट क्षण पर होने वाला मान, dt → 0)' },
  velocity: { term: 'Velocity', hindi: 'वेग (विस्थापन में परिवर्तन की समय दर — सदिश राशि)' },
  speed: { term: 'Speed', hindi: 'चाल (दूरी तय करने की दर — अदिश राशि)' },
  acceleration: { term: 'Acceleration', hindi: 'त्वरण (वेग में परिवर्तन की समय दर)' },
  uniform: { term: 'Uniform Motion', hindi: 'एकसमान गति (समान समयांतरालों में समान विस्थापन)' },
  retardation: { term: 'Retardation / Deceleration', hindi: 'मंदन (ऋणात्मक त्वरण, जिससे चाल घटती है)' },
  relative_velocity: { term: 'Relative Velocity', hindi: 'आपेक्षिक वेग (एक प्रेक्षक के सापेक्ष दूसरे पिंड का वेग)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 3 - MOTION IN A PLANE
  // ==========================================
  scalar: { term: 'Scalar', hindi: 'अदिश (ऐसी भौतिक राशि जिसमें केवल परिमाण होता है, दिशा नहीं)' },
  vector: { term: 'Vector', hindi: 'सदिश (ऐसी राशि जिसमें परिमाण और निश्चित दिशा दोनों होते हैं)' },
  magnitude: { term: 'Magnitude', hindi: 'परिमाण (किसी राशि का संख्यात्मक मान एवं मात्रक)' },
  resolution: { term: 'Resolution of Vectors', hindi: 'सदिशों का वियोजन (सदिश को दो या अधिक लंबवत घटकों में तोड़ना)' },
  component: { term: 'Component', hindi: 'घटक (किसी निश्चित दिशा में सदिश का प्रभावी मान)' },
  projectile: { term: 'Projectile', hindi: 'प्रक्षेप्य (गुरुत्वाकर्षण के प्रभाव में स्वतंत्र रूप से फेंका गया पिंड)' },
  trajectory: { term: 'Trajectory', hindi: 'प्रक्षेप्य पथ (हवा में गतिमान प्रक्षेप्य द्वारा तय किया गया परवलयाकार मार्ग)' },
  horizontal: { term: 'Horizontal Range', hindi: 'क्षैतिज परास (प्रक्षेप्य द्वारा क्षैतिज दिशा में तय की गई अधिकतम दूरी)' },
  centripetal: { term: 'Centripetal Acceleration', hindi: 'अभिकेंद्री त्वरण (वृत्ताकार पथ के केंद्र की ओर निर्देशित त्वरण)' },
  circular: { term: 'Circular Motion', hindi: 'वृत्तीय गति (किसी निश्चित बिंदु के परितः वृत्त में गति)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 4 - LAWS OF MOTION
  // ==========================================
  inertia: { term: 'Inertia', hindi: 'जड़त्व (वस्तु का वह आंतरिक गुण जो अवस्था परिवर्तन का विरोध करता है)' },
  momentum: { term: 'Linear Momentum', hindi: 'रैखिक संवेग (पिंड के द्रव्यमान और वेग का गुणनफल p = mv)' },
  impulse: { term: 'Impulse', hindi: 'आवेग (अति अल्प समय में लगने वाले बड़े बल और समय का गुणनफल)' },
  equilibrium: { term: 'Equilibrium', hindi: 'साम्यावस्था (पिंड पर कार्यरत सभी बलों का परिणामी शून्य होना)' },
  friction: { term: 'Friction', hindi: 'घर्षण (दो संपर्क सतहों के बीच आपेक्षिक गति का विरोध करने वाला बल)' },
  limiting: { term: 'Limiting Friction', hindi: 'सीमांत घर्षण (स्थैतिक घर्षण का अधिकतम संभव मान)' },
  normal: { term: 'Normal Reaction', hindi: 'अभिलंब प्रतिक्रिया (संपर्क तल के लंबवत लगने वाला प्रतिरोधी बल)' },
  banking: { term: 'Banking of Roads', hindi: 'सड़कों का बंकन (मोड़ों पर वाहन फिसलने से बचाने हेतु बाहरी किनारे को उठाना)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 5 - WORK, ENERGY & POWER
  // ==========================================
  work: { term: 'Work', hindi: 'कार्य (बल और बल की दिशा में विस्थापन का अदिश गुणनफल W = F·d)' },
  kinetic: { term: 'Kinetic Energy', hindi: 'गतिज ऊर्जा (पिंड की गति के कारण उसमें निहित ऊर्जा K = ½mv²)' },
  potential: { term: 'Potential Energy', hindi: 'स्थितिज ऊर्जा (स्थिति या विन्यास के कारण संचित ऊर्जा U = mgh)' },
  conservative: { term: 'Conservative Force', hindi: 'संरक्षी बल (जिसके द्वारा किया गया कार्य केवल प्रारंभिक व अंतिम स्थिति पर निर्भर करे)' },
  power: { term: 'Power', hindi: 'शक्ति (कार्य करने या ऊर्जा रूपांतरण की समय दर P = W/t)' },
  collision: { term: 'Collision', hindi: 'संघट्ट / टक्कर (अल्पकाल में पिंडों के बीच होने वाली तीव्र अंतःक्रिया)' },
  elastic: { term: 'Elastic Collision', hindi: 'प्रत्यास्थ संघट्ट (जिसमें संवेग और गतिज ऊर्जा दोनों संरक्षित रहें)' },
  inelastic: { term: 'Inelastic Collision', hindi: 'अप्रत्यास्थ संघट्ट (जिसमें संवेग संरक्षित रहे किंतु गतिज ऊर्जा की हानि हो)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 6 - ROTATIONAL MOTION
  // ==========================================
  centre_of_mass: { term: 'Centre of Mass', hindi: 'द्रव्यमान केंद्र (वह बिंदु जहाँ संपूर्ण द्रव्यमान केंद्रित माना जा सके)' },
  torque: { term: 'Torque (Moment of Force)', hindi: 'बल-आघूर्ण (पिंड को अक्ष के परितः घुमाने की प्रवृत्ति τ = r × F)' },
  angular_momentum: { term: 'Angular Momentum', hindi: 'कोणीय संवेग (रैखिक संवेग का घूर्णन प्रभाव L = r × p = Iω)' },
  moment_of_inertia: { term: 'Moment of Inertia', hindi: 'जड़त्व आघूर्ण (घूर्णन गति में जड़त्व का माप I = Σmr²)' },
  radius_of_gyration: { term: 'Radius of Gyration', hindi: 'परिभ्रमण त्रिज्या (घूर्णन अक्ष से वह दूरी जहाँ समस्त द्रव्यमान केंद्रित हो)' },
  rolling: { term: 'Rolling Motion', hindi: 'लोटनिक गति (स्थानांतरीय और घूर्णी गति का संयुक्त रूप)' },

  // ==========================================
  // PHYSICS BOOK 1: CHAPTER 7 - GRAVITATION
  // ==========================================
  gravitation: { term: 'Gravitation', hindi: 'गुरुत्वाकर्षण (ब्रह्मांड में किन्हीं दो द्रव्यमानों के बीच पारस्परिक आकर्षण बल)' },
  gravitational_constant: { term: 'Gravitational Constant (G)', hindi: 'सार्वत्रिक गुरुत्वाकर्षण नियतांक (6.67 × 10⁻¹¹ N·m²/kg²)' },
  acceleration_due_to_gravity: { term: 'Acceleration due to Gravity (g)', hindi: 'गुरुत्वीय त्वरण (पृथ्वी के खिंचाव के कारण मुक्त पतन में त्वरण ~ 9.8 m/s²)' },
  escape_speed: { term: 'Escape Speed', hindi: 'पलायन वेग (पृथ्वी से अंतरिक्ष में हमेशा के लिए जाने हेतु आवश्यक न्यूनतम वेग ~ 11.2 km/s)' },
  orbital_velocity: { term: 'Orbital Velocity', hindi: 'कक्षीय वेग (उपग्रह को निश्चित कक्षा में बनाए रखने के लिए आवश्यक क्षैतिज चाल)' },
  satellite: { term: 'Satellite', hindi: 'उपग्रह (ग्रह के गुरुत्वीय क्षेत्र में उसकी परिक्रमा करने वाला आकाशीय या कृत्रिम पिंड)' },
  geostationary: { term: 'Geostationary Satellite', hindi: 'भू-स्थिर उपग्रह (जिसका परिक्रमण काल पृथ्वी के घूर्णन काल 24 घंटे के बराबर हो)' },
  weightlessness: { term: 'Weightlessness', hindi: 'भारहीनता (मुक्त पतन की स्थिति में अभिलंब प्रतिक्रिया शून्य होना)' },

  // ==========================================
  // BIOLOGY & CHEMISTRY FOUNDATIONS (PRESERVED)
  // ==========================================
  biodiversity: { term: 'Biodiversity', hindi: 'जैव विविधता (पृथ्वी पर पाए जाने वाले जीवों की विविधता)' },
  nomenclature: { term: 'Nomenclature', hindi: 'नामकरण (जीवों का मानक वैज्ञानिक नाम तय करना)' },
  identification: { term: 'Identification', hindi: 'पहचान (जीव के लक्षणों को सटीक रूप से जानना)' },
  classification: { term: 'Classification', hindi: 'वर्गीकरण (जीवों को समूहों में बाँटना)' },
  taxonomy: { term: 'Taxonomy', hindi: 'वर्गिकी (वर्गीकरण के नियम और सिद्धांत)' },
  systematics: { term: 'Systematics', hindi: 'क्रमबद्धता (जीवों के विकासवादी संबंधों का अध्ययन)' },
  taxa: { term: 'Taxa', hindi: 'संवर्ग / वर्गीकरण स्तर' },
  taxon: { term: 'Taxon', hindi: 'वर्गीकरण की कोई एक श्रेणी' },
  binomial: { term: 'Binomial', hindi: 'द्विपद (दो शब्दों वाला नामकरण)' },
  habitat: { term: 'Habitat', hindi: 'प्राकृतिक वास स्थान जहाँ कोई जीव रहता है' },
  stoichiometry: { term: 'Stoichiometry', hindi: 'रससमीकरणमिति (रासायनिक गणनाएँ)' },
};

/**
 * Extracts difficult words present in a given text with strict relevance checking
 */
export function extractDifficultWords(text: string, subjectName?: string, topicTitle?: string): WordMeaning[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const lowerTitle = (topicTitle || '').toLowerCase();
  const found: WordMeaning[] = [];

  // Filter dictionary to avoid cross-subject pollution:
  // For Physics topics, prioritize physics terminology!
  const isPhysics = subjectName?.toLowerCase().includes('physic') || 
                    lowerTitle.includes('dimension') || 
                    lowerTitle.includes('significant') ||
                    lowerTitle.includes('velocity') ||
                    lowerTitle.includes('vector') ||
                    lowerTitle.includes('motion') ||
                    lowerTitle.includes('force') ||
                    lowerTitle.includes('gravitat') ||
                    lowerTitle.includes('work') ||
                    lowerTitle.includes('energy') ||
                    lowerTitle.includes('torque');

  for (const [key, wordObj] of Object.entries(NEET_DIFFICULT_WORDS_DICTIONARY)) {
    // If we are on Physics, skip purely biological terms (e.g. lichen, viroid, deciduous, herbarium)
    if (isPhysics && (key === 'deciduous' || key === 'herbarium' || key === 'lichen' || key === 'viroid' || key === 'prion' || key === 'gymnosperm' || key === 'angiosperm' || key === 'gametophyte' || key === 'sporophyte' || key === 'mycorrhiza' || key === 'oscillation' && !lowerTitle.includes('oscillat'))) {
      continue;
    }

    // Check if the term is genuinely present in the section text or title
    const termRegex = new RegExp(`\\b${key}\\b`, 'i');
    if (termRegex.test(lowerText) || termRegex.test(lowerTitle)) {
      if (!found.some(item => item.term.toLowerCase() === wordObj.term.toLowerCase())) {
        found.push(wordObj);
      }
    }
  }

  // If found is sparse for Physics, extract high-yield concept words related to the section
  if (found.length < 3 && isPhysics) {
    if (lowerTitle.includes('significant') || lowerText.includes('significant figure')) {
      if (!found.some(w => w.term.includes('Significant'))) found.unshift(NEET_DIFFICULT_WORDS_DICTIONARY.significant);
      if (!found.some(w => w.term.includes('Precision'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.precision);
      if (!found.some(w => w.term.includes('Accuracy'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.accuracy);
      if (!found.some(w => w.term.includes('Uncertainty'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.uncertainty);
    } else if (lowerTitle.includes('dimension')) {
      if (!found.some(w => w.term.includes('Dimension'))) found.unshift(NEET_DIFFICULT_WORDS_DICTIONARY.dimension);
      if (!found.some(w => w.term.includes('Homogeneity'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.homogeneity);
      if (!found.some(w => w.term.includes('Derived'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.derived);
    } else if (lowerTitle.includes('vector') || lowerTitle.includes('scalar')) {
      if (!found.some(w => w.term.includes('Vector'))) found.unshift(NEET_DIFFICULT_WORDS_DICTIONARY.vector);
      if (!found.some(w => w.term.includes('Scalar'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.scalar);
      if (!found.some(w => w.term.includes('Resolution'))) found.push(NEET_DIFFICULT_WORDS_DICTIONARY.resolution);
    }
  }

  // Cap at 8 most relevant terms per section
  return found.slice(0, 8);
}

/**
 * Comprehensive candidate terms list covering Physics Book 1, Biology, and Chemistry
 */
export const COMPREHENSIVE_CANDIDATE_TERMS = [
  // Physics: Chapter 1 Units & Dimensions
  'Physical quantity',
  'Measurement',
  'Accuracy',
  'Precision',
  'Significant figures',
  'Rounding off',
  'Uncertainty in measurement',
  'SI Units',
  'Base units',
  'Derived units',
  'Radian',
  'Steradian',
  'Dimensions',
  'Dimensional formula',
  'Dimensional equation',
  'Principle of homogeneity',
  'Astronomical unit',
  'Light year',
  'Parsec',
  'Least count',
  'Percentage error',

  // Physics: Chapter 2 Straight Line Motion
  'Kinematics',
  'Rectilinear motion',
  'Displacement',
  'Path length',
  'Instantaneous velocity',
  'Instantaneous speed',
  'Average velocity',
  'Average speed',
  'Uniform acceleration',
  'Kinematic equations',
  'Relative velocity',
  'Stopping distance',
  'Free fall',

  // Physics: Chapter 3 Motion in a Plane
  'Scalar quantity',
  'Vector quantity',
  'Position vector',
  'Displacement vector',
  'Equality of vectors',
  'Multiplication by scalar',
  'Triangle law of vector addition',
  'Parallelogram law',
  'Resolution of vectors',
  'Unit vector',
  'Rectangular components',
  'Scalar product',
  'Vector product',
  'Projectile motion',
  'Trajectory',
  'Time of flight',
  'Horizontal range',
  'Maximum height',
  'Centripetal acceleration',
  'Uniform circular motion',

  // Physics: Chapter 4 Laws of Motion
  'Inertia',
  'Newton’s First Law',
  'Newton’s Second Law',
  'Newton’s Third Law',
  'Linear momentum',
  'Impulse',
  'Conservation of momentum',
  'Equilibrium of a particle',
  'Concurrent forces',
  'Normal reaction',
  'Tension',
  'Static friction',
  'Limiting friction',
  'Kinetic friction',
  'Coefficient of friction',
  'Angle of friction',
  'Angle of repose',
  'Banking of roads',
  'Centripetal force',

  // Physics: Chapter 5 Work, Energy and Power
  'Work',
  'Scalar product (Dot product)',
  'Kinetic energy',
  'Work-energy theorem',
  'Work done by variable force',
  'Conservative force',
  'Non-conservative force',
  'Potential energy',
  'Conservation of mechanical energy',
  'Spring potential energy',
  'Hooke’s Law',
  'Power',
  'Elastic collision',
  'Inelastic collision',
  'Coefficient of restitution',

  // Physics: Chapter 6 Rotational Motion
  'Rigid body',
  'Centre of mass',
  'Motion of centre of mass',
  'Vector product (Cross product)',
  'Angular displacement',
  'Angular velocity',
  'Angular acceleration',
  'Torque',
  'Moment of a force',
  'Couple',
  'Angular momentum',
  'Conservation of angular momentum',
  'Rotational equilibrium',
  'Principle of moments',
  'Centre of gravity',
  'Moment of inertia',
  'Radius of gyration',
  'Rolling motion',

  // Physics: Chapter 7 Gravitation
  'Universal Law of Gravitation',
  'Gravitational constant (G)',
  'Kepler’s First Law (Law of Orbits)',
  'Kepler’s Second Law (Law of Areas)',
  'Kepler’s Third Law (Law of Periods)',
  'Acceleration due to gravity (g)',
  'Gravitational potential energy',
  'Gravitational potential',
  'Escape speed',
  'Orbital velocity',
  'Earth satellite',
  'Geostationary satellite',
  'Polar satellite',
  'Weightlessness',

  // Biology Terms (Preserved)
  'Living types',
  'Habitat',
  'Population',
  'Community',
  'Cell',
  'Life',
  'Non-living',
  'Purpose of life',
  'Biodiversity',
  'Nomenclature',
  'Identification',
  'Classification',
  'Taxonomy',
  'Systematics',
  'Binomial nomenclature',
  'Generic name',
  'Specific epithet',
  'Carolus Linnaeus',
  'ICBN',
  'ICZN',
  'Taxa',
  'Taxon',
];

/**
 * Extracts key conceptual terms from section text with high-yield physics relevance
 */
export function extractImportantTerms(text: string, title?: string): string[] {
  if (!text) return title ? [title] : [];

  const found: string[] = [];
  const lowerText = text.toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  for (const term of COMPREHENSIVE_CANDIDATE_TERMS) {
    if (lowerText.includes(term.toLowerCase()) || lowerTitle.includes(term.toLowerCase())) {
      if (!found.some(t => t.toLowerCase() === term.toLowerCase())) {
        found.push(term);
      }
    }
  }

  // Ensure topic title is included at top if not present
  if (title && !found.some((t) => t.toLowerCase() === title.toLowerCase())) {
    found.unshift(title);
  }

  return found.slice(0, 10);
}

/**
 * Returns NEET Lens points tailored to Physics Book 1, Biology, and Chemistry
 */
export function generateNeetLens(topicTitle: string, text: string, subjectName?: string): string[] {
  const t = topicTitle.toLowerCase();
  const content = text.toLowerCase();

  // ==========================================
  // PHYSICS BOOK 1 NEET LENS INSIGHTS
  // ==========================================
  if (t.includes('significant') || content.includes('significant figures')) {
    return [
      'In addition/subtraction, the result can have no more decimal places than the measurement with the fewest decimal places.',
      'In multiplication/division, the result must retain as many significant figures as the measurement with the fewest significant figures.',
      'Traps: Exact numbers (e.g. 2 in 2πr) have infinite significant figures; leading zeros (0.0025) are never significant, while trailing zeros with a decimal point (2.500) ARE significant.',
    ];
  }

  if (t.includes('dimension') || content.includes('dimensional analysis')) {
    return [
      'Principle of Homogeneity: Only physical quantities with the same dimensions can be added, subtracted, or equated.',
      'Important dimensionless quantities frequently tested: Reynolds number, strain, refractive index, solid angle, and trigonometric arguments.',
      'Limitation of dimensional analysis: It cannot determine dimensionless proportional constants (like ½ in ½at²) or distinguish between different quantities having identical dimensions (e.g. Work and Torque: [M L² T⁻²]).',
    ];
  }

  if (t.includes('unit') || content.includes('si units')) {
    return [
      'Remember the 7 SI base quantities and their exact units: Mass (kg), Length (m), Time (s), Electric Current (A), Thermodynamic Temperature (K), Amount of Substance (mol), and Luminous Intensity (cd).',
      'Plane angle (Radian) and Solid angle (Steradian) are dimensionless physical quantities that possess units.',
      'High-yield conversion factors: 1 eV = 1.6 × 10⁻¹⁹ J, 1 kWh = 3.6 × 10⁶ J, 1 Å = 10⁻¹⁰ m, 1 AU = 1.496 × 10¹¹ m.',
    ];
  }

  if (t.includes('straight line') || t.includes('velocity') || t.includes('acceleration') || content.includes('rectilinear')) {
    return [
      'Distance is always ≥ |Displacement|. Average speed is always ≥ |Average velocity|; equality holds strictly for unidirectional rectilinear motion.',
      'Kinematic equations (v = u + at, s = ut + ½at², v² = u² + 2as) apply STRICTLY when acceleration is constant. For variable acceleration, calculus (v = dx/dt, a = dv/dt) must be used.',
      'In displacement-time graphs, slope gives velocity; in velocity-time graphs, slope gives acceleration and area under the curve gives displacement.',
    ];
  }

  if (t.includes('vector') || t.includes('scalar') || t.includes('plane')) {
    return [
      'Scalar Product: A · B = AB cos θ (commutative, maximum at θ = 0°, zero at θ = 90°). Vector Product: A × B = AB sin θ n̂ (anti-commutative: A × B = - B × A).',
      'For projectile motion: Horizontal component of velocity (u cos θ) remains CONSTANT throughout motion because horizontal acceleration ax = 0.',
      'Range is identical for complementary angles of projection: θ and (90° - θ). Maximum range occurs at θ = 45° where R_max = u² / g.',
    ];
  }

  if (t.includes('law of motion') || t.includes('inertia') || t.includes('momentum') || t.includes('friction')) {
    return [
      'Newton’s Second Law in its most fundamental form is F_ext = dp/dt. Only when mass is constant does it simplify to F = ma.',
      'Static friction is a self-adjusting force: 0 ≤ f_s ≤ μ_s N. Kinetic friction f_k = μ_k N is virtually independent of the area of contact and speed.',
      'On a banked curved road without friction, optimum safe speed is v = √(rg tan θ). With friction, maximum safe speed is v_max = √[rg (μ + tan θ) / (1 - μ tan θ)].',
    ];
  }

  if (t.includes('work') || t.includes('energy') || t.includes('power') || t.includes('collision')) {
    return [
      'Work-Energy Theorem: Total work done by ALL forces (conservative, non-conservative, and external) equals the change in kinetic energy: W_net = ΔK.',
      'Potential energy is defined ONLY for conservative forces: F = - dU/dx. The work done by a conservative force along any closed path is strictly zero.',
      'In a 1D elastic collision between two equal masses (m1 = m2), the bodies simply exchange their velocities after collision.',
    ];
  }

  if (t.includes('rotational') || t.includes('centre of mass') || t.includes('torque') || t.includes('moment of inertia')) {
    return [
      'Centre of mass of a system depends only on the distribution of mass and relative positions of particles, NOT on the choice of origin.',
      'Relation between rotational and linear analogues: v = ω × r, a_t = α × r, Torque τ = r × F = Iα, Angular Momentum L = r × p = Iω.',
      'Conservation of Angular Momentum: If external torque τ_ext = 0, then L = Iω = constant. (Example: When a spinning diver curls arms, I decreases so ω increases).',
    ];
  }

  if (t.includes('gravitation') || t.includes('satellite') || t.includes('escape')) {
    return [
      'Acceleration due to gravity: g_h = g(1 - 2h/R) for h << R, and g_d = g(1 - d/R) at depth d. At the center of the Earth (d = R), g = 0.',
      'Escape speed from Earth’s surface is v_e = √(2gR) = √(2GM/R) ≈ 11.2 km/s. It is independent of the mass of the projectile and the projection angle.',
      'Total energy of an orbiting satellite is negative: E = - GMm / (2r) = - K = U/2. Negative total energy signifies that the satellite is bound to the Earth.',
    ];
  }

  // ==========================================
  // BIOLOGY & CHEMISTRY FALLBACK
  // ==========================================
  if (t.includes('diversity') || t.includes('living world')) {
    return [
      'This section introduces the concept of biodiversity and the wide variety of life forms on Earth.',
      'Important for understanding classification, species, and foundational taxonomy asked in Section A of NEET.',
      'Examples like cold mountains, forests, and oceans highlight biological adaptations and habitat diversity.',
    ];
  }

  return [
    'Crucial NEET UG concept: Pay close attention to exact NCERT terminology, definitions, and equations.',
    'Assertion-Reasoning and Statement-based questions are frequently constructed directly from these lines.',
    'Carefully review all numerical values, boundary conditions, and sign conventions stated in this paragraph.',
  ];
}

/**
 * Returns Key Takeaways tailored to the topic
 */
export function generateKeyTakeaways(topicTitle: string, text: string): string[] {
  const t = topicTitle.toLowerCase();
  const content = text.toLowerCase();

  // Physics Chapter 1: Units & Measurements
  if (t.includes('significant') || content.includes('significant figures')) {
    return [
      'Significant figures reflect the precision of the measuring instrument and include all reliable digits plus the first uncertain digit.',
      'All non-zero digits are significant; zeros between non-zero digits are always significant.',
      'In rounding off, if the digit to be dropped is 5 followed by zeros, the preceding digit is left unchanged if even, and increased by 1 if odd.',
      'Exponential notation (N × 10ⁿ) avoids ambiguity in determining significant figures.',
    ];
  }

  if (t.includes('dimension') || content.includes('dimensional')) {
    return [
      'The dimensions of a physical quantity are the powers to which base quantities are raised to represent that quantity.',
      'Dimensional analysis checks consistency of equations, derives relations among quantities, and converts units between systems.',
      'A dimensionally correct equation may not be physically correct, but a dimensionally incorrect equation is always wrong.',
      'Constants of proportionality that possess dimensions (like G, h) must be accounted for in dimensional formulas.',
    ];
  }

  if (t.includes('unit') || content.includes('international system')) {
    return [
      'The International System of Units (SI) is based on 7 base units and 2 supplementary units (radian and steradian).',
      'Base units are internationally defined with reproducibility and invariance over time.',
      'Standard prefixes (micro, nano, pico, kilo, mega, giga) denote decimal multiples and submultiples of units.',
      'Dimensional formulas of derived quantities can be directly built from base units.',
    ];
  }

  // Physics Chapter 2: Straight Line Motion
  if (t.includes('velocity') || t.includes('acceleration') || t.includes('kinematic')) {
    return [
      'Displacement is a vector quantity independent of the actual path taken; path length is a scalar.',
      'Instantaneous velocity is the derivative of position with respect to time: v = dx/dt.',
      'Kinematic equations under constant acceleration: v = u + at, s = ut + ½at², v² = u² + 2as.',
      'The area under an a-t graph gives the change in velocity; the area under a v-t graph gives displacement.',
    ];
  }

  // Physics Chapter 3: Motion in a Plane
  if (t.includes('vector') || t.includes('projectile') || t.includes('circular')) {
    return [
      'Vectors can be added geometrically using the triangle or parallelogram law, or algebraically by components.',
      'Projectile motion is a 2D motion with constant downward acceleration g and zero horizontal acceleration.',
      'In uniform circular motion, speed is constant while velocity continuously changes direction, giving centripetal acceleration a_c = v²/r.',
      'The scalar product yields a scalar quantity (W = F · d); the vector product yields an orthogonal vector (τ = r × F).',
    ];
  }

  // Physics Chapter 4: Laws of Motion
  if (t.includes('law of motion') || t.includes('inertia') || t.includes('friction')) {
    return [
      'First Law defines inertia; Second Law quantifies force as rate of change of momentum (F = dp/dt); Third Law states forces occur in pairs.',
      'In an isolated system (F_ext = 0), total linear momentum is conserved.',
      'Static friction adjusts to balance applied force until limiting value f_s(max) = μ_s N is reached.',
      'Free body diagrams isolate the body and show all external forces acting upon it.',
    ];
  }

  // Physics Chapter 5: Work, Energy and Power
  if (t.includes('work') || t.includes('energy') || t.includes('power') || t.includes('collision')) {
    return [
      'Work is done only when a force produces displacement along its line of action (W = F d cos θ).',
      'The Work-Energy Theorem states that the net work done on a body equals its change in kinetic energy.',
      'Total mechanical energy (K + U) is strictly conserved in the presence of conservative forces only.',
      'In all collisions momentum is conserved; kinetic energy is conserved strictly in elastic collisions.',
    ];
  }

  // Physics Chapter 6: Rotational Motion
  if (t.includes('rotational') || t.includes('centre of mass') || t.includes('torque') || t.includes('inertia')) {
    return [
      'The centre of mass moves as if all the mass of the system were concentrated there and all external forces were applied there.',
      'Torque is the rotational analogue of force (τ = r × F = Iα); angular momentum is the analogue of linear momentum (L = Iω).',
      'A rigid body is in complete mechanical equilibrium if both net force and net torque are zero.',
      'Moment of inertia depends on mass, axis of rotation, and distribution of mass around the axis.',
    ];
  }

  // Physics Chapter 7: Gravitation
  if (t.includes('gravitation') || t.includes('satellite') || t.includes('escape')) {
    return [
      'Newton’s Law of Gravitation: Every particle attracts every other particle with a force proportional to m₁m₂/r².',
      'Acceleration due to gravity g decreases both with height above the surface and with depth below the surface.',
      'Escape velocity from Earth is independent of the mass of the escaping body and equals √(2gR) ≈ 11.2 km/s.',
      'Kepler’s Third Law states that the square of the orbital period is proportional to the cube of the semi-major axis (T² ∝ a³).',
    ];
  }

  // Biology Fallback
  if (t.includes('diversity') || t.includes('living world')) {
    return [
      'Living organisms exhibit extraordinary diversity across wide habitats globally.',
      'Ecological conflict and cooperation exist both among members of a population and across communities.',
      "The question 'what is life?' encompasses both biological mechanisms and evolutionary significance.",
      'This foundational section establishes the base for classification and modern taxonomy.',
    ];
  }

  // Clean sentence extraction fallback
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 180 && !s.includes('<') && !s.includes('{'));

  if (sentences.length >= 3) {
    return sentences.slice(0, 4);
  }

  return [
    'Authoritative NCERT canonical text for high-yield NEET preparation.',
    'Provides the conceptual definitions, formulas, and laws tested by NTA.',
    'Forms core foundation for subsequent numerical and analytical problems.',
  ];
}

/**
 * Highlighting Palette Classes matching reference image:
 * - Blue pastel: Physical quantities, fundamental units, base quantities
 * - Amber pastel: Laws, principles, rules, conditions
 * - Mint pastel: Classifications, environments, states of motion
 * - Purple pastel: Formulas, mathematical equations, operations
 * - Underline: Critical distinctions, technical terms
 */
export const HIGHLIGHT_TOKENS: Array<{
  regex: RegExp;
  className: string;
}> = [
  // 1. Amber Pastel: Laws, Principles, Rules, Conditions
  {
    regex: /\b(principle of homogeneity|rules for significant figures|rounding off|newton'?s first law|newton'?s second law|newton'?s third law|law of conservation of linear momentum|work-energy theorem|conservation of mechanical energy|law of conservation of angular momentum|kepler'?s laws?|universal law of gravitation|hooke'?s law|law of inertia|extraordinary habitats|ecological conflict|cooperation|purpose of life)\b/gi,
    className: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]/70 px-1 py-0.5 rounded font-medium',
  },
  // 2. Mint / Emerald Pastel: Motion types, environments, states, systems
  {
    regex: /\b(rectilinear motion|uniform motion|uniformly accelerated motion|projectile motion|uniform circular motion|circular motion|elastic collision|inelastic collision|rotational motion|translational motion|rolling motion|geostationary satellite|polar satellite|cold mountains|deciduous forests|fresh water lakes|hot springs|dense forest|oceans|deserts)\b/gi,
    className: 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]/70 px-1 py-0.5 rounded font-medium',
  },
  // 3. Purple / Violet Pastel: Mathematical operations, equations, vectors
  {
    regex: /\b(dimensional formula|dimensional equation|dimensional analysis|vector addition|resolution of vectors|scalar product|vector product|cross product|dot product|kinematic equations|centripetal acceleration|escape speed|orbital velocity|galloping horse|migrating birds|valley of flowers|attacking shark|molecular traffic)\b/gi,
    className: 'bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]/70 px-1 py-0.5 rounded font-medium',
  },
  // 4. Blue Pastel: Fundamental physical quantities, SI base units, key biological units
  {
    regex: /\b(significant figures?|physical quantit(y|ies)|base units?|derived units?|si units?|radian|steradian|light year|astronomical unit|parsec|least count|percentage error|instantaneous velocity|instantaneous speed|average velocity|average speed|displacement|acceleration|linear momentum|impulse|normal reaction|limiting friction|kinetic energy|potential energy|torque|moment of inertia|centre of mass|centre of gravity|gravitational constant|acceleration due to gravity|living types|living organisms|organisms|population|populations|community|cell|species|biodiversity|nomenclature|identification|classification|taxonomy|systematics)\b/gi,
    className: 'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]/70 px-1 py-0.5 rounded font-medium',
  },
  // 5. Subtle underline: Critical distinctions & technical definitions
  {
    regex: /\b(precision|accuracy|conservative force|non-conservative force|inertial frame|non-inertial frame|static friction|kinetic friction|technical|philosophical|non-living|naked eye)\b/gi,
    className: 'underline decoration-[#8b5cf6] decoration-1.5 underline-offset-2 font-medium text-[#141b2b]',
  },
];

/**
 * Intelligently decorates plain text with pastel highlight tokens without modifying any text or HTML tags.
 */
export function applyPastelHighlights(htmlOrText: string): string {
  if (!htmlOrText) return '';

  let result = htmlOrText;

  for (const { regex, className } of HIGHLIGHT_TOKENS) {
    // Construct a safe regex that skips HTML tags (<...>) and only matches in text content
    const source = regex.source;
    const safeRegex = new RegExp(`(<[^>]+>)|(${source})`, 'gi');
    result = result.replace(safeRegex, (match, tag, word) => {
      if (tag) return tag; // leave HTML tags untouched
      return `<mark class="${className}">${word}</mark>`;
    });
  }

  return result;
}
