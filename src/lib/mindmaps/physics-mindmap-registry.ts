/**
 * PHYSICS MIND MAP CANONICAL REGISTRY
 * Maps all 28 high-resolution chapter mind maps to NEET Physics NCERT Chapters (Class 11 & Class 12)
 */

export interface PhysicsMindMapMeta {
  id: string;
  classLevel: 11 | 12;
  subject: 'Physics';
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  chapterId?: string;
  title: string;
  type: 'mind_map';
  assetUrl: string;
  originalFileName: string;
  downloadFileName: string;
  dimensions: { width: number; height: number };
  fileSizeBytes: number;
  status: 'ACTIVE' | 'MAPPED' | 'ADDITIONAL' | 'LEGACY';
  editionType: 'PRIMARY' | 'EXTENDED' | 'COMPANION' | 'LEGACY';
  description: string;
  keyTopics: string[];
}

export const PHYSICS_MIND_MAPS: PhysicsMindMapMeta[] = [
  // ==========================================
  // CLASS 11 PHYSICS (14 Mind Maps)
  // ==========================================
  {
    id: 'mm-p11-01',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 1,
    chapterTitle: 'Units and Measurements',
    chapterSlug: 'units-and-measurements',
    chapterId: 'cmunm1ffn000pevz0pub3c60r',
    title: 'Units and Measurements Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 11 Physics_ Units and Measurements Mind Map.png',
    originalFileName: 'Class 11 Physics_ Units and Measurements Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_01_Units_and_Measurements_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2684556,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Comprehensive NCERT visual revision sheet covering SI base units, dimensional formulas, dimensional analysis applications, error propagation, and significant figures.',
    keyTopics: ['SI Fundamental & Derived Units', 'Dimensional Analysis & Applications', 'Absolute, Relative & Percentage Errors', 'Combination of Errors', 'Significant Figures & Rounding Off Rules']
  },
  {
    id: 'mm-p11-02',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 2,
    chapterTitle: 'Motion in a Straight Line',
    chapterSlug: 'motion-in-a-straight-line',
    chapterId: 'CH_KEPH102',
    title: 'Motion in a Straight Line Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Motion in a Straight Line Cheat Sheet.png',
    originalFileName: 'Motion in a Straight Line Cheat Sheet.png',
    downloadFileName: 'Class_11_Physics_Chapter_02_Motion_in_a_Straight_Line_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2527200,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Complete 1D kinematics cheat sheet with kinematic equations for uniform acceleration, calculus relations (v = dx/dt, a = dv/dt), relative velocity, and graphs (x-t, v-t, a-t).',
    keyTopics: ['Position, Path Length & Displacement', 'Average & Instantaneous Velocity/Speed', 'Equations of Motion (Uniform Acceleration)', 'Motion under Gravity (Free Fall)', 'Relative Velocity in One Dimension', 'Kinematic Graphs & Slopes/Areas']
  },
  {
    id: 'mm-p11-03',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 3,
    chapterTitle: 'Motion in a Plane',
    chapterSlug: 'motion-in-a-plane',
    chapterId: 'CH_KEPH103',
    title: 'Motion in a Plane Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Motion in a Plane Physics Mind Map.png',
    originalFileName: 'Motion in a Plane Physics Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_03_Motion_in_a_Plane_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2434350,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: '2D kinematics and vector visual poster covering scalar/vector operations, dot and cross products, projectile motion trajectory equations, and uniform circular motion dynamics.',
    keyTopics: ['Vector Algebra (Triangle & Parallelogram Laws)', 'Resolution of Vectors & Unit Vectors', 'Scalar (Dot) & Vector (Cross) Products', 'Projectile Motion (Range, Max Height, Time of Flight)', 'Equation of Path (Trajectory)', 'Uniform Circular Motion & Centripetal Acceleration']
  },
  {
    id: 'mm-p11-04',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 4,
    chapterTitle: 'Laws of Motion',
    chapterSlug: 'laws-of-motion',
    chapterId: 'cmunm1ffw000revz06ebq7wm1',
    title: 'Laws of Motion Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Laws of Motion Physics Mind Map.png',
    originalFileName: 'Laws of Motion Physics Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_04_Laws_of_Motion_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2588707,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Newtonian dynamics mind map detailing Newton’s three laws, momentum conservation, impulse, Free Body Diagrams (FBD), static/kinetic friction laws, and banked circular tracks.',
    keyTopics: ['Newton’s First, Second & Third Laws', 'Linear Momentum & Impulse (J = Δp)', 'Conservation of Linear Momentum', 'Free Body Diagram (FBD) Methodology', 'Static & Kinetic Friction (Laws & Coefficients)', 'Motion on Level & Banked Curved Roads']
  },
  {
    id: 'mm-p11-05',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 5,
    chapterTitle: 'Work, Energy and Power',
    chapterSlug: 'work-energy-and-power',
    chapterId: 'CH_KEPH105',
    title: 'Work, Energy and Power Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Work, Energy and Power Cheat Sheet.png',
    originalFileName: 'Work, Energy and Power Cheat Sheet.png',
    downloadFileName: 'Class_11_Physics_Chapter_05_Work_Energy_and_Power_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2478553,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Complete energy dynamics revision map covering constant/variable force work, Work-Energy Theorem, conservative vs non-conservative forces, potential energy of a spring, and 1D/2D collisions.',
    keyTopics: ['Work Done by Constant & Variable Force (W = ∫F·dr)', 'Kinetic Energy & Work-Energy Theorem', 'Conservative & Non-Conservative Forces', 'Potential Energy (Gravitational & Spring)', 'Conservation of Mechanical Energy', 'Power (Instantaneous & Average)', 'Elastic & Inelastic Collisions in 1D & 2D']
  },
  {
    id: 'mm-p11-06-primary',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 6,
    chapterTitle: 'System of Particles and Rotational Motion',
    chapterSlug: 'system-of-particles-and-rotational-motion',
    chapterId: 'CH_KEPH106',
    title: 'Rotational Motion Revision Poster (Modern NCERT Ch 6)',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Rotational Motion Revision Poster.png',
    originalFileName: 'Rotational Motion Revision Poster.png',
    downloadFileName: 'Class_11_Physics_Chapter_06_Rotational_Motion_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2520755,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Canonical Class 11 Chapter 6 visual poster detailing Centre of Mass for continuous/discrete bodies, rotational kinematics equations, torque, moment of inertia tables, work-energy in rotation, and rolling motion without slipping.',
    keyTopics: ['Centre of Mass (Discrete & Continuous)', 'Rotational Kinematics Equations', 'Torque (τ = r × F) & Rotational Dynamics (τ = Iα)', 'Moment of Inertia of Standard Rigid Bodies', 'Work, Power & Kinetic Energy in Rotation', 'Angular Momentum & Conservation (L = Iω)', 'Rolling Motion (Pure Rolling Conditions v = Rω)']
  },
  {
    id: 'mm-p11-06-extended',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 6,
    chapterTitle: 'System of Particles and Rotational Motion',
    chapterSlug: 'system-of-particles-and-rotational-motion',
    chapterId: 'CH_KEPH106',
    title: 'Rotational Motion & Particle Systems (Deep-Dive Edition)',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 11 Rotational Motion Mind Map.png',
    originalFileName: 'Class 11 Rotational Motion Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_06_Rotational_Motion_Collisions_Theorems_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2392375,
    status: 'ACTIVE',
    editionType: 'EXTENDED',
    description: 'Comprehensive extended edition featuring 15 structured breakdown cards including Collisions (Elastic, Inelastic, Coefficient of Restitution e), Equilibrium of Rigid Bodies, Parallel & Perpendicular Axis Theorems, and Radius of Gyration.',
    keyTopics: ['System of Particles & COM Dynamics', 'Collisions & Coefficient of Restitution', 'Angular Variables & Linear Equivalences', 'Moment of Inertia Derivations & Integral Forms', 'Parallel Axis (I = Icm + Md²) & Perpendicular Axis Theorems', 'Rigid Body Equilibrium (ΣF = 0, Στ = 0)', 'NEET Exam High-Yield Checkpoint']
  },
  {
    id: 'mm-p11-07',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 7,
    chapterTitle: 'Gravitation',
    chapterSlug: 'gravitation',
    chapterId: 'CH_KEPH107',
    title: 'Gravitation Study Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Gravitation_ Class 11 Physics Study Map.png',
    originalFileName: 'Gravitation_ Class 11 Physics Study Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_07_Gravitation_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2412537,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Visual study map for Universal Gravitation, Kepler’s three planetary laws, acceleration due to gravity variation with altitude/depth/latitude, gravitational potential & energy, escape speed, and orbital satellites.',
    keyTopics: ['Newton’s Universal Law of Gravitation', 'Kepler’s Laws of Planetary Motion', 'Acceleration due to Gravity (g variation with h, d, and latitude)', 'Gravitational Field & Potential (V & U)', 'Escape Speed (ve = √(2gR))', 'Earth Satellites (Orbital Speed & Time Period)', 'Geostationary & Polar Satellites']
  },
  {
    id: 'mm-p11-08',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 8,
    chapterTitle: 'Mechanical Properties of Solids',
    chapterSlug: 'mechanical-properties-of-solids',
    chapterId: 'CH_KEPH201',
    title: 'Mechanical Properties of Solids Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Mechanical Properties of Solids Revision Map.png',
    originalFileName: 'Mechanical Properties of Solids Revision Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_08_Mechanical_Properties_of_Solids_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2435055,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Elasticity revision map detailing stress-strain curves, Hooke’s law, Young’s modulus, Shear modulus, Bulk modulus, Poisson’s ratio, and elastic potential energy stored in a stretched wire.',
    keyTopics: ['Stress & Strain Definitions & Types', 'Stress-Strain Curve & Proportionality Limit', 'Hooke’s Law & Modulus of Elasticity', 'Young’s Modulus (Y), Shear Modulus (G), Bulk Modulus (B)', 'Poisson’s Ratio (σ)', 'Elastic Potential Energy (U = 1/2 × Stress × Strain × Vol)']
  },
  {
    id: 'mm-p11-09',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 9,
    chapterTitle: 'Mechanical Properties of Fluids',
    chapterSlug: 'mechanical-properties-of-fluids',
    chapterId: 'CH_KEPH202',
    title: 'Fluid Mechanics Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Fluid Mechanics Class 11 Cheat Sheet.png',
    originalFileName: 'Fluid Mechanics Class 11 Cheat Sheet.png',
    downloadFileName: 'Class_11_Physics_Chapter_09_Mechanical_Properties_of_Fluids_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2468900,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Complete hydrostatics and hydrodynamics cheat sheet including Pascal’s Law, Archimedes Principle, Equation of Continuity, Bernoulli’s Theorem, Torricelli’s Law, Viscosity (Poiseuille, Stokes), and Surface Tension (Capillarity).',
    keyTopics: ['Fluid Pressure & Pascal’s Principle', 'Archimedes’ Principle & Buoyancy', 'Streamline vs Turbulent Flow & Reynolds Number', 'Equation of Continuity (A₁v₁ = A₂v₂)', 'Bernoulli’s Principle & Applications (Venturi meter, Torricelli)', 'Viscosity, Stokes’ Law & Terminal Velocity', 'Surface Tension, Excess Pressure & Capillary Rise']
  },
  {
    id: 'mm-p11-10',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 10,
    chapterTitle: 'Thermal Properties of Matter',
    chapterSlug: 'thermal-properties-of-matter',
    chapterId: 'CH_KEPH203',
    title: 'Thermal Properties of Matter Revision Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Thermal Properties of Matter Revision Map.png',
    originalFileName: 'Thermal Properties of Matter Revision Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_10_Thermal_Properties_of_Matter_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2435675,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Thermodynamics foundations visual map covering temperature scales, thermal expansion (linear, areal, volume), specific heat capacity, calorimetry, latent heat of phase transitions, and heat transfer (Conduction, Convection, Radiation, Wien’s, Stefan’s, Newton’s Law of Cooling).',
    keyTopics: ['Temperature & Heat Scales', 'Thermal Expansion (α, β, γ relations)', 'Specific Heat Capacity & Calorimetry', 'Latent Heat (Fusion & Vaporization)', 'Heat Conduction & Thermal Resistance', 'Radiation Laws (Stefan-Boltzmann, Wien’s Displacement Law)', 'Newton’s Law of Cooling']
  },
  {
    id: 'mm-p11-11',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 11,
    chapterTitle: 'Thermodynamics',
    chapterSlug: 'thermodynamics',
    chapterId: 'CH_KEPH204',
    title: 'Thermodynamics Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 11 Thermodynamics Revision Mind Map.png',
    originalFileName: 'Class 11 Thermodynamics Revision Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_11_Thermodynamics_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2365365,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Thermodynamic systems revision sheet covering Zeroth, First (ΔQ = ΔU + ΔW) and Second Laws, state variables, P-V diagrams, thermodynamic processes (Isothermal, Adiabatic, Isobaric, Isochoric), and Heat Engines (Carnot Cycle & Efficiency).',
    keyTopics: ['Zeroth Law & Concept of Temperature', 'First Law of Thermodynamics (ΔQ = ΔU + W)', 'Specific Heat Capacities of Gases (Cp - Cv = R)', 'Isothermal, Adiabatic (PV^γ = const), Isobaric & Isochoric Processes', 'Work Done in Thermodynamic Cycles', 'Second Law of Thermodynamics', 'Carnot Engine, Efficiency & Reversible Cycles']
  },
  {
    id: 'mm-p11-12',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 12,
    chapterTitle: 'Kinetic Theory',
    chapterSlug: 'kinetic-theory',
    chapterId: 'CH_KEPH205',
    title: 'Kinetic Theory of Gases Study Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Kinetic Theory of Gases Study Infographic.png',
    originalFileName: 'Kinetic Theory of Gases Study Infographic.png',
    downloadFileName: 'Class_11_Physics_Chapter_12_Kinetic_Theory_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2429453,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Kinetic Theory infographic covering ideal gas postulates, kinetic interpretation of temperature, RMS/average/most probable gas speeds, degrees of freedom, law of equipartition of energy, and mean free path derivation.',
    keyTopics: ['Ideal Gas Equation & Kinetic Postulates', 'Pressure of an Ideal Gas (P = 1/3 ρ vrms²)', 'Kinetic Interpretation of Temperature & Kinetic Energy', 'Gas Speeds: vrms, vavg, vmp', 'Degrees of Freedom (Mono, Di, Polyatomic)', 'Law of Equipartition of Energy & Specific Heats', 'Mean Free Path (λ = 1 / (√2 n π d²))']
  },
  {
    id: 'mm-p11-13',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 13,
    chapterTitle: 'Oscillations',
    chapterSlug: 'oscillations',
    chapterId: 'CH_KEPH206',
    title: 'Oscillations Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 11 Physics_ Oscillations Mind Map.png',
    originalFileName: 'Class 11 Physics_ Oscillations Mind Map.png',
    downloadFileName: 'Class_11_Physics_Chapter_13_Oscillations_Mind_Map.png',
    dimensions: { width: 1024, height: 935 },
    fileSizeBytes: 1513500,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Comprehensive NCERT visual cheat sheet covering Periodic vs Oscillatory motion, SHM differential equations, kinematic relations (x, v, a), energy conservation in SHM, spring-mass systems, simple pendulum, and damped/forced oscillations with resonance.',
    keyTopics: [
      'Periodic & Oscillatory Motion (Period T & Frequency f)',
      'Simple Harmonic Motion (SHM) Definition & Differential Equation',
      'Displacement, Velocity & Acceleration Equations and Graphs',
      'SHM as Projection of Uniform Circular Motion',
      'Spring-Mass System (Series, Parallel, Restoring Force)',
      'Simple Pendulum Time Period (T = 2π√(l/g))',
      'Kinetic, Potential & Total Mechanical Energy in SHM',
      'Damped & Forced Oscillations and Resonance Conditions',
      'Comparison of Mean vs Extreme Positions in SHM'
    ]
  },
  {
    id: 'mm-p11-14',
    classLevel: 11,
    subject: 'Physics',
    chapterNumber: 14,
    chapterTitle: 'Waves',
    chapterSlug: 'waves',
    chapterId: 'CH_KEPH207',
    title: 'Waves Revision Poster (Linked to Oscillations)',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 11 Physics Waves Revision Poster.png',
    originalFileName: 'Class 11 Physics Waves Revision Poster.png',
    downloadFileName: 'Class_11_Physics_Chapter_14_Waves_Mind_Map.png',
    dimensions: { width: 1254, height: 1254 },
    fileSizeBytes: 2429623,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'High-density 17-section revision poster covering transverse and longitudinal wave parameters, progressive wave equations, speed of sound in media, reflection, standing waves in strings and organ pipes, beats, and the Doppler effect.',
    keyTopics: ['Wave Parameters (Wavelength, Frequency, Phase)', 'Progressive Wave Equation (y = A sin(ωt - kx))', 'Speed of Waves in Strings & Fluid Media (Laplace Correction)', 'Superposition Principle & Stationary Waves', 'Standing Waves in Open & Closed Organ Pipes', 'Beats Frequency (fb = |f₁ - f₂|)', 'Doppler Effect in Sound Waves', 'NEET Common Pitfalls & Quick Checklist']
  },

  // ==========================================
  // CLASS 12 PHYSICS (14 Mind Maps)
  // ==========================================
  {
    id: 'mm-p12-01',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 1,
    chapterTitle: 'Electric Charges and Fields',
    chapterSlug: 'electric-charges-and-fields',
    chapterId: 'cmunm1fga000tevz0tbgf181n',
    title: 'Electric Charges and Fields Revision Sheet',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Electric Charges and Fields Revision Sheet.png',
    originalFileName: 'Electric Charges and Fields Revision Sheet.png',
    downloadFileName: 'Class_12_Physics_Chapter_01_Electric_Charges_and_Fields_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2127002,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Electrostatics Part 1 master infographic covering charge quantization, Coulomb’s Law in vector form, electric field lines, electric dipole field (axial & equatorial), Gauss’s Law, and field calculations for line, sheet, and spherical shells.',
    keyTopics: ['Properties of Electric Charges (Quantization & Conservation)', 'Coulomb’s Law in Vacuum & Dielectric Media', 'Electric Field, Superposition & Field Lines', 'Electric Dipole Moment, Torque & Axial/Equatorial Fields', 'Electric Flux (Φ = ∮ E · dA)', 'Gauss’s Law & Applications (Inf. Wire, Sheet, Spherical Shell)', 'Conductors & Insulators in Electrostatics']
  },
  {
    id: 'mm-p12-02',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 2,
    chapterTitle: 'Electrostatic Potential and Capacitance',
    chapterSlug: 'electrostatic-potential-and-capacitance',
    chapterId: 'CH_LEPH102',
    title: 'Electrostatic Potential and Capacitance Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Electrostatics Revision Infographic.png',
    originalFileName: 'Class 12 Electrostatics Revision Infographic.png',
    downloadFileName: 'Class_12_Physics_Chapter_02_Electrostatic_Potential_and_Capacitance_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2196460,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Electrostatics Part 2 revision infographic covering electrostatic potential, equipotential surfaces, dipole potential, conductors in equilibrium, parallel plate capacitor, dielectrics insertion, energy stored, and combinations of capacitors.',
    keyTopics: ['Electrostatic Potential & Potential Difference', 'Potential due to Point Charge, System & Dipole', 'Equipotential Surfaces & Field Gradient (E = -dV/dr)', 'Conductors in Electrostatic Equilibrium', 'Capacitance & Parallel Plate Capacitor (C = ε₀A/d)', 'Dielectrics & Polarization (Capacitor with Dielectric)', 'Series & Parallel Combinations of Capacitors', 'Energy Stored in Capacitor & Energy Density']
  },
  {
    id: 'mm-p12-03',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 3,
    chapterTitle: 'Current Electricity',
    chapterSlug: 'current-electricity',
    chapterId: 'cmunm1fgk000vevz0a5v51gji',
    title: 'Current Electricity Physics Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Current Electricity Physics Revision Mind Map.png',
    originalFileName: 'Current Electricity Physics Revision Mind Map.png',
    downloadFileName: 'Class_12_Physics_Chapter_03_Current_Electricity_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2263023,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Current electricity revision mind map covering electric current, drift velocity relation (I = n e A vd), Ohm’s Law, temperature dependence of resistivity, cell EMF and internal resistance, Kirchhoff’s Junction and Loop Rules, and Wheatstone bridge.',
    keyTopics: ['Drift Velocity & Mobility of Charge Carriers', 'Ohm’s Law & Resistance Temperature Coefficient', 'Colour Coding of Resistors (Carbon Resistors)', 'Combination of Resistors (Series & Parallel)', 'EMF, Terminal Potential & Internal Resistance of Cells', 'Cells in Series, Parallel & Mixed Combinations', 'Kirchhoff’s Current & Voltage Laws (KCL & KVL)', 'Wheatstone Bridge Balance Condition']
  },
  {
    id: 'mm-p12-04',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 4,
    chapterTitle: 'Moving Charges and Magnetism',
    chapterSlug: 'moving-charges-and-magnetism',
    chapterId: 'CH_LEPH104',
    title: 'Moving Charges and Magnetism Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Physics Magnetism Revision Poster.png',
    originalFileName: 'Class 12 Physics Magnetism Revision Poster.png',
    downloadFileName: 'Class_12_Physics_Chapter_04_Moving_Charges_and_Magnetism_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2149661,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Comprehensive visual chart covering magnetic effects of current, Biot-Savart law, Ampere circuital law, solenoids and toroids, force between parallel currents, magnetic dipole moments, moving coil galvanometer conversions, and torque on current loops.',
    keyTopics: ['Magnetic Field & Oersted Experiment', 'Biot-Savart Law & Circular Coil Field', 'Ampere’s Circuital Law & Solenoids', 'Force on Moving Charge & Lorentz Force', 'Force Between Two Parallel Current-Carrying Conductors (Definition of Ampere)', 'Torque on Current Loop & Magnetic Dipole Moment', 'Moving Coil Galvanometer Conversion to Ammeter and Voltmeter']
  },
  {
    id: 'mm-p12-05',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 5,
    chapterTitle: 'Magnetism and Matter',
    chapterSlug: 'magnetism-and-matter',
    chapterId: 'CH_LEPH105',
    title: 'Magnetism and Matter Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Physics Magnetism Revision Poster.png',
    originalFileName: 'Class 12 Physics Magnetism Revision Poster.png',
    downloadFileName: 'Class_12_Physics_Chapter_05_Magnetism_and_Matter_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2149661,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Magnetism master chart covering bar magnets as equivalent solenoids, magnetic dipole moments, torque and potential energy in external B field, moving coil galvanometer to ammeter/voltmeter conversion, magnetic properties of matter (Dia, Para, Ferro), hysteresis B-H curve, and Earth’s magnetic elements.',
    keyTopics: ['Bar Magnet as Equivalent Solenoid & Magnetic Field Lines', 'Magnetic Dipole Moment & Torque (τ = M × B)', 'Potential Energy of Magnetic Dipole (U = -M · B)', 'Moving Coil Galvanometer (Shunt & Series Resistor Calculations)', 'Magnetisation (M), Magnetic Intensity (H), Susceptibility (χ)', 'Dia, Para, and Ferromagnetic Materials & Curie’s Law', 'B-H Hysteresis Loop & Retentivity/Coercivity', 'Earth’s Magnetic Field Elements (Declination, Dip, Horizontal Component)']
  },
  {
    id: 'mm-p12-06',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 6,
    chapterTitle: 'Electromagnetic Induction',
    chapterSlug: 'electromagnetic-induction',
    chapterId: 'CH_LEPH106',
    title: 'Electromagnetic Induction Physics Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Electromagnetic Induction Physics Infographic.png',
    originalFileName: 'Electromagnetic Induction Physics Infographic.png',
    downloadFileName: 'Class_12_Physics_Chapter_06_Electromagnetic_Induction_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2115112,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Electromagnetic induction infographic covering magnetic flux, Faraday’s Law of induction, Lenz’s Law with energy conservation, motional electromotive force (e = Bvl), eddy currents, self and mutual inductance, and AC generator working principles.',
    keyTopics: ['Magnetic Flux (Φ = B · A)', 'Faraday’s Law of Induction & Lenz’s Law', 'Motional EMF (e = Bvl) & Induced Current', 'Eddy Currents & Damping Applications', 'Self-Inductance of a Solenoid (L = μ₀n²Al)', 'Mutual Inductance between Coaxial Solenoids', 'Magnetic Energy Stored in Inductor (U = 1/2 L I²)', 'AC Generator Operating Principle']
  },
  {
    id: 'mm-p12-07',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 7,
    chapterTitle: 'Alternating Current',
    chapterSlug: 'alternating-current',
    chapterId: 'CH_LEPH107',
    title: 'Alternating Current Physics Revision Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Alternating Current Physics Revision Infographic.png',
    originalFileName: 'Alternating Current Physics Revision Infographic.png',
    downloadFileName: 'Class_12_Physics_Chapter_07_Alternating_Current_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2084227,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'AC circuits revision infographic covering peak vs RMS voltage/current, phasor diagrams, pure R, L, and C circuits, Series LCR resonance conditions, impedance triangle, power factor (cos φ), wattless current, and transformer turns ratio.',
    keyTopics: ['Alternating Current & Voltage (RMS & Peak Values)', 'AC Applied to Resistor, Inductor, and Capacitor', 'Phasor Representation & Phase Angle', 'Series LCR Circuit & Impedance (Z = √(R² + (XL - XC)²))', 'Resonance Frequency (fr = 1 / (2π√(LC))) & Quality Factor (Q)', 'Power in AC Circuits & Power Factor (cos φ)', 'LC Oscillations & Energy Transfer', 'Transformers (Step-Up, Step-Down, Losses & Efficiency)']
  },
  {
    id: 'mm-p12-08',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 8,
    chapterTitle: 'Electromagnetic Waves',
    chapterSlug: 'electromagnetic-waves',
    chapterId: 'CH_LEPH108',
    title: 'Electromagnetic Waves Revision Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Electromagnetic Waves Revision Map.png',
    originalFileName: 'Class 12 Electromagnetic Waves Revision Map.png',
    downloadFileName: 'Class_12_Physics_Chapter_08_Electromagnetic_Waves_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2290791,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Electromagnetic waves revision map covering Maxwell’s displacement current, Maxwell’s 4 equations, transverse electromagnetic wave propagation characteristics (c = 1/√(μ₀ε₀)), Poynting vector, and the complete EM spectrum wavelengths and uses.',
    keyTopics: ['Displacement Current (Id = ε₀ dΦe/dt)', 'Maxwell’s Four Equations of Electromagnetism', 'Source & Transverse Nature of EM Waves', 'Velocity of EM Waves (c = E₀ / B₀ = 1/√(μ₀ε₀))', 'Energy Density & Momentum Carried by EM Waves', 'Complete EM Spectrum (Radio, Micro, IR, Visible, UV, X-rays, Gamma)', 'Wavelength & Frequency Ranges with Diagnostic/Technological Applications']
  },
  {
    id: 'mm-p12-09',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 9,
    chapterTitle: 'Ray Optics and Optical Instruments',
    chapterSlug: 'ray-optics-and-optical-instruments',
    chapterId: 'CH_LEPH201',
    title: 'Ray Optics Revision Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Ray Optics Revision Infographic.png',
    originalFileName: 'Class 12 Ray Optics Revision Infographic.png',
    downloadFileName: 'Class_12_Physics_Chapter_09_Ray_Optics_and_Optical_Instruments_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2152300,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Geometrical optics revision infographic covering spherical mirrors, Snell’s Law, Total Internal Reflection (TIR) & optical fibres, refraction at spherical surfaces, Lens Maker’s formula, thin lenses in contact, prism dispersion, and optical instruments (Microscopes & Telescopes).',
    keyTopics: ['Reflection by Spherical Mirrors (Mirror Formula & Magnification)', 'Refraction & Snell’s Law (Apparent Depth & Lateral Shift)', 'Total Internal Reflection & Critical Angle (Optical Fibres)', 'Refraction at Spherical Surfaces & Lens Maker’s Formula', 'Thin Lens Formula & Power of a Lens (P = 1/f)', 'Prism Refraction Formula & Angle of Minimum Deviation', 'Dispersion of Light & Chromatic Aberration', 'Compound Microscope & Astronomical/Terrestrial Telescope Magnifying Power']
  },
  {
    id: 'mm-p12-10',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 10,
    chapterTitle: 'Wave Optics',
    chapterSlug: 'wave-optics',
    chapterId: 'CH_LEPH202',
    title: 'Wave Optics Revision Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Wave Optics Revision Chart.png',
    originalFileName: 'Class 12 Wave Optics Revision Chart.png',
    downloadFileName: 'Class_12_Physics_Chapter_10_Wave_Optics_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2269377,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Physical optics revision chart covering Huygens’ principle of wavelets, proof of reflection/refraction, coherent sources, Young’s Double Slit Experiment (YDSE) fringe width formula (β = λD/d), single-slit diffraction pattern, and polarization of light.',
    keyTopics: ['Huygens’ Wavefront Principle & Wavefront Geometries', 'Reflection & Refraction Proof using Huygens’ Construction', 'Coherent Sources & Interference of Light', 'Young’s Double Slit Experiment (Constructive & Destructive Interference)', 'Fringe Width Derivation (β = λD/d) & Path Difference', 'Single Slit Diffraction Pattern & Central Maximum Width', 'Comparison between Interference and Diffraction', 'Polarisation of Light, Malus’s Law & Brewster’s Angle']
  },
  {
    id: 'mm-p12-11',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 11,
    chapterTitle: 'Dual Nature of Radiation and Matter',
    chapterSlug: 'dual-nature-of-radiation-and-matter',
    chapterId: 'CH_LEPH203',
    title: 'Dual Nature of Radiation and Matter Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Physics_ Dual Nature Infographic.png',
    originalFileName: 'Class 12 Physics_ Dual Nature Infographic.png',
    downloadFileName: 'Class_12_Physics_Chapter_11_Dual_Nature_of_Radiation_and_Matter_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2115149,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Quantum physics revision infographic detailing electron emission mechanisms, photoelectric effect experimental observations (Lenard-Hertz), Einstein’s Photoelectric Equation (Kmax = hν - Φ₀), threshold frequency, and de Broglie matter waves (λ = h/p).',
    keyTopics: ['Electron Emission (Thermionic, Field, Photoelectric)', 'Photoelectric Effect Experimental Setup & Graphs', 'Stopping Potential vs Frequency & Intensity Dependencies', 'Einstein’s Photoelectric Equation & Work Function (Φ₀ = hν₀)', 'Dual Nature of Light (Wave vs Particle Momentum p = h/λ)', 'De Broglie Wavelength of Matter Waves (λ = h / √(2mE))', 'De Broglie Wavelength of Accelerated Electron (λ = 1.227 / √V nm)', 'Davisson-Germer Experiment Significance']
  },
  {
    id: 'mm-p12-12',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 12,
    chapterTitle: 'Atoms',
    chapterSlug: 'atoms',
    chapterId: 'CH_LEPH204',
    title: 'Class 12 Physics Atoms Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Colourful Class 12 Physics Atoms Mind Map.png',
    originalFileName: 'Colourful Class 12 Physics Atoms Mind Map.png',
    downloadFileName: 'Class_12_Physics_Chapter_12_Atoms_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2208493,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Atomic structure visual revision sheet covering Rutherford’s alpha-particle scattering experiment, distance of closest approach, Bohr’s hydrogen postulates, orbital radius (rn ∝ n²), velocity, total energy (En = -13.6/n² eV), and hydrogen spectral series (Lyman, Balmer, Paschen, Brackett, Pfund).',
    keyTopics: ['Geiger-Marsden α-Particle Scattering Experiment', 'Rutherford’s Nuclear Model & Distance of Closest Approach', 'Bohr’s Model Postulates (Angular Momentum Quantization mvr = nh/2π)', 'Radius of nth Bohr Orbit (rn = 0.529 n²/Z Å)', 'Velocity & Energy of Electron in Bohr Orbit (En = -13.6 Z²/n² eV)', 'Kinetic & Potential Energy Relationships (K = -E, U = 2E)', 'Hydrogen Spectral Series (Lyman, Balmer, Paschen, Brackett, Pfund)', 'Rydberg Formula (1/λ = R [1/n₁² - 1/n₂²]) & Series Limits']
  },
  {
    id: 'mm-p12-13',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 13,
    chapterTitle: 'Nuclei',
    chapterSlug: 'nuclei',
    chapterId: 'CH_LEPH205',
    title: 'Class 12 Physics Nuclei Revision Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Physics Nuclei Revision Chart.png',
    originalFileName: 'Class 12 Physics Nuclei Revision Chart.png',
    downloadFileName: 'Class_12_Physics_Chapter_13_Nuclei_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2207060,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Nuclear physics revision chart detailing nuclear size radius (R = R₀ A^(1/3)), nuclear density constancy, mass defect, Einstein mass-energy equivalence (E = Δm c²), binding energy per nucleon curve, strong nuclear force properties, and nuclear fission/fusion energy releases.',
    keyTopics: ['Atomic Nucleus Composition & Size (R = R₀ A^(1/3))', 'Mass-Energy Equivalence (1 amu = 931.5 MeV)', 'Mass Defect (Δm) & Binding Energy', 'Binding Energy per Nucleon Curve & Nuclear Stability Regions', 'Strong Nuclear Force Characteristics (Charge Independent, Short Range, Saturation)', 'Radioactivity Concepts (Alpha, Beta, Gamma emission)', 'Nuclear Fission (U-235 chain reactions) & Nuclear Fusion (p-p cycle)']
  },
  {
    id: 'mm-p12-14',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 14,
    chapterTitle: 'Semiconductor Electronics: Materials, Devices and Simple Circuits',
    chapterSlug: 'semiconductor-electronics-materials-devices-and-simple-circuits',
    chapterId: 'CH_LEPH206',
    title: 'Semiconductor Electronics Revision Guide',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Semiconductor Electronics Revision Guide.png',
    originalFileName: 'Class 12 Semiconductor Electronics Revision Guide.png',
    downloadFileName: 'Class_12_Physics_Chapter_14_Semiconductor_Electronics_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2283416,
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Solid state electronics revision guide covering energy band gaps in conductors, semiconductors and insulators, intrinsic vs extrinsic semiconductors (p-type & n-type), p-n junction diode forward/reverse bias characteristics, half-wave and full-wave rectifiers, Zener diode regulation, and optoelectronic junction devices (Photodiode, LED, Solar Cell).',
    keyTopics: ['Energy Band Theory (Valence Band, Conduction Band & Forbidden Energy Gap Eg)', 'Intrinsic Semiconductors (ne = nh = ni)', 'Extrinsic Semiconductors (n-type donor doping, p-type acceptor doping)', 'p-n Junction Formation (Depletion Region & Barrier Potential)', 'Forward Bias & Reverse Bias V-I Characteristics', 'Semiconductor Diode as Half-Wave and Full-Wave Rectifier', 'Zener Diode as Voltage Regulator', 'Optoelectronic Devices (Photodiode, Light Emitting Diode LED, Solar Cell)']
  },

  // ==========================================
  // LEGACY / ADDITIONAL REVISION (1 Mind Map)
  // ==========================================
  {
    id: 'mm-p12-15-legacy',
    classLevel: 12,
    subject: 'Physics',
    chapterNumber: 15,
    chapterTitle: 'Communication Systems (Legacy NCERT)',
    chapterSlug: 'communication-systems',
    title: 'Communication Systems Infographic (Legacy NCERT Ch 15)',
    type: 'mind_map',
    assetUrl: '/mindmaps/physics/Class 12 Communication Systems Infographic.png',
    originalFileName: 'Class 12 Communication Systems Infographic.png',
    downloadFileName: 'Class_12_Physics_Legacy_Chapter_15_Communication_Systems_Mind_Map.png',
    dimensions: { width: 1312, height: 1199 },
    fileSizeBytes: 2358205,
    status: 'LEGACY',
    editionType: 'LEGACY',
    description: 'Complete visual summary of communication elements: Transmitter, channel, receiver, signals, bandwidth, ground/sky/space wave propagation, need for modulation, amplitude modulation (AM), and detection.',
    keyTopics: ['Elements of Communication System (Transmitter, Medium, Receiver)', 'Bandwidth of Signals & Transmission Media', 'EM Wave Propagation (Ground Wave, Sky Wave, Space Wave / LOS)', 'Need for Modulation in Long-Distance Transmission', 'Amplitude Modulation (AM) Equations, Modulation Index & Bandwidth (2fm)', 'Production & Envelope Detection of AM Waves']
  }
];

export function getMindMapByChapterSlug(slug: string): PhysicsMindMapMeta | undefined {
  return PHYSICS_MIND_MAPS.find((m) => m.chapterSlug === slug);
}

export function getAllMindMapsForClass(classLevel: 11 | 12): PhysicsMindMapMeta[] {
  return PHYSICS_MIND_MAPS.filter((m) => m.classLevel === classLevel);
}

export function getMindMapById(id: string): PhysicsMindMapMeta | undefined {
  return PHYSICS_MIND_MAPS.find((m) => m.id === id);
}

export function getMindMapForChapter(chapter: {
  id?: string;
  slug?: string;
  title?: string;
  chapterNumber?: number;
  classLevel?: number | string;
  subjectName?: string;
}): PhysicsMindMapMeta | undefined {
  if (!chapter) return undefined;

  // 1. Direct exact match by Chapter ID
  if (chapter.id) {
    const byId = PHYSICS_MIND_MAPS.find((m) => m.chapterId === chapter.id);
    if (byId) return byId;
  }

  // 2. Direct exact match by Slug
  if (chapter.slug) {
    const normSlug = chapter.slug.toLowerCase().trim();
    const bySlug = PHYSICS_MIND_MAPS.find((m) => m.chapterSlug.toLowerCase() === normSlug);
    if (bySlug) return bySlug;
  }

  // 3. Exact title match
  if (chapter.title) {
    const normTitle = chapter.title.toLowerCase().trim();
    const byExactTitle = PHYSICS_MIND_MAPS.find(
      (m) => m.chapterTitle.toLowerCase().trim() === normTitle
    );
    if (byExactTitle) return byExactTitle;
  }

  // 4. Match by Class Level + Chapter Number for Physics
  if (chapter.chapterNumber) {
    const isPhysics = !chapter.subjectName || chapter.subjectName.toLowerCase().includes('physics');
    if (isPhysics && chapter.classLevel) {
      const classNum =
        typeof chapter.classLevel === 'number'
          ? chapter.classLevel
          : chapter.classLevel.toString().includes('12')
          ? 12
          : 11;
      const byNum = PHYSICS_MIND_MAPS.find(
        (m) => m.classLevel === classNum && m.chapterNumber === chapter.chapterNumber
      );
      if (byNum) return byNum;
    }
  }

  return undefined;
}
