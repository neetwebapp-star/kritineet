"""
Canonical Topic Registry for MTG Fingertips NEET Platform
Covers all 79 in-syllabus NEET chapters across Biology, Chemistry, and Physics (Classes 11 & 12).
Defines authoritative NCERT/MTG topic numbers, titles, and proportional source weights.
"""

from typing import List, Tuple, Dict

CANONICAL_REGISTRY: Dict[str, List[Tuple[str, str, float]]] = {
    # =========================================================================
    # BIOLOGY CLASS 11 (19 Chapters)
    # =========================================================================
    "The Living World": [
        ("1.1", "Diversity in the Living World", 0.40),
        ("1.2", "Taxonomic Categories & Aids", 0.60),
    ],
    "Biological Classification": [
        ("2.1", "Kingdom Monera", 0.25),
        ("2.2", "Kingdom Protista", 0.20),
        ("2.3", "Kingdom Fungi", 0.25),
        ("2.4", "Kingdom Plantae & Animalia", 0.15),
        ("2.5", "Viruses, Viroids, Prions and Lichens", 0.15),
    ],
    "Plant Kingdom": [
        ("3.1", "Algae", 0.25),
        ("3.2", "Bryophytes", 0.20),
        ("3.3", "Pteridophytes", 0.20),
        ("3.4", "Gymnosperms", 0.20),
        ("3.5", "Angiosperms & Plant Life Cycles", 0.15),
    ],
    "Animal Kingdom": [
        ("4.1", "Basis of Classification", 0.25),
        ("4.2", "Classification of Animals (Non-Chordates & Chordates)", 0.75),
    ],
    "Morphology of Flowering Plants": [
        ("5.1", "The Root, Stem and Leaf", 0.35),
        ("5.2", "The Inflorescence and Flower", 0.35),
        ("5.3", "The Fruit and Seed", 0.15),
        ("5.4", "Semi-Technical Description & Solanaceae", 0.15),
    ],
    "Anatomy of Flowering Plants": [
        ("6.1", "The Tissue System", 0.45),
        ("6.2", "Anatomy of Dicotyledonous and Monocotyledonous Plants", 0.55),
    ],
    "Structural Organisation in Animals": [
        ("7.1", "Animal Tissues (Epithelial, Connective, Muscular, Neural)", 0.50),
        ("7.2", "Organ and Organ System: Frog Morphology & Anatomy", 0.50),
    ],
    "Cell: The Unit of Life": [
        ("8.1", "What is a Cell? & Cell Theory", 0.15),
        ("8.2", "An Overview of Cell & Prokaryotic Cells", 0.25),
        ("8.3", "Eukaryotic Cells (Endomembrane System, Mitochondria, Plastids)", 0.35),
        ("8.4", "Cytoskeleton, Cilia, Flagella, Nucleus & Chromosomes", 0.25),
    ],
    "Biomolecules": [
        ("9.1", "Chemical Composition & Primary/Secondary Metabolites", 0.20),
        ("9.2", "Biomacromolecules, Proteins & Polysaccharides", 0.30),
        ("9.3", "Nucleic Acids & Structure of Proteins", 0.25),
        ("9.4", "Enzymes: Classification, Factors & Mechanism", 0.25),
    ],
    "Cell Cycle and Cell Division": [
        ("10.1", "Cell Cycle", 0.25),
        ("10.2", "M Phase (Mitosis)", 0.40),
        ("10.3", "Meiosis & Significance", 0.35),
    ],
    "Photosynthesis in Higher Plants": [
        ("11.1", "Early Experiments, Site & Pigments Involved", 0.25),
        ("11.2", "Light Reaction, Electron Transport & Chemiosmosis", 0.35),
        ("11.3", "Calvin Cycle (C3) & Hatch-Slack Pathway (C4)", 0.25),
        ("11.4", "Photorespiration & Factors Affecting Photosynthesis", 0.15),
    ],
    "Respiration in Plants": [
        ("12.1", "Do Plants Breathe? & Glycolysis", 0.30),
        ("12.2", "Fermentation & Aerobic Respiration (TCA Cycle)", 0.40),
        ("12.3", "Electron Transport System, Oxidative Phosphorylation & Balance Sheet", 0.30),
    ],
    "Plant Growth and Development": [
        ("13.1", "Growth, Differentiation, Dedifferentiation & Development", 0.30),
        ("13.2", "Plant Growth Regulators (Auxins, Gibberellins, Cytokinins, Ethylene, ABA)", 0.50),
        ("13.3", "Photoperiodism, Vernalisation & Seed Dormancy", 0.20),
    ],
    "Breathing and Exchange of Gases": [
        ("14.1", "Respiratory Organs & Mechanism of Breathing", 0.35),
        ("14.2", "Exchange and Transport of Gases (O2 & CO2)", 0.45),
        ("14.3", "Regulation of Respiration & Disorders of Respiratory System", 0.20),
    ],
    "Body Fluids and Circulation": [
        ("15.1", "Blood, Lymph and Circulatory Pathways", 0.30),
        ("15.2", "Human Circulatory System, Cardiac Cycle & ECG", 0.45),
        ("15.3", "Double Circulation, Regulation & Disorders of Circulatory System", 0.25),
    ],
    "Excretory Products and their Elimination": [
        ("16.1", "Human Excretory System & Urine Formation", 0.40),
        ("16.2", "Function of Tubules & Mechanism of Concentration (Counter Current)", 0.35),
        ("16.3", "Regulation of Kidney Function, Micturition & Disorders", 0.25),
    ],
    "Locomotion and Movement": [
        ("17.1", "Types of Movement, Muscle Structure & Mechanism of Contraction", 0.50),
        ("17.2", "Skeletal System & Joints", 0.35),
        ("17.3", "Disorders of Muscular and Skeletal System", 0.15),
    ],
    "Neural Control and Coordination": [
        ("18.1", "Neural System & Conduction of Nerve Impulse", 0.35),
        ("18.2", "Central Neural System, Reflex Action & Reflex Arc", 0.40),
        ("18.3", "Sensory Reception and Processing (Eye & Ear)", 0.25),
    ],
    "Chemical Coordination and Integration": [
        ("19.1", "Endocrine Glands and Hormones", 0.25),
        ("19.2", "Human Endocrine System (Hypothalamus, Pituitary, Thyroid, Adrenal, Pancreas, Gonads)", 0.50),
        ("19.3", "Hormones of Heart, Kidney & GI Tract, Mechanism of Hormone Action", 0.25),
    ],

    # =========================================================================
    # CHEMISTRY CLASS 11 (9 Chapters)
    # =========================================================================
    "Some Basic Concepts of Chemistry": [
        ("1.1", "Importance of Chemistry & Nature of Matter", 0.15),
        ("1.2", "Laws of Chemical Combinations & Dalton's Atomic Theory", 0.20),
        ("1.3", "Atomic and Molecular Masses & Mole Concept", 0.25),
        ("1.4", "Percentage Composition & Empirical/Molecular Formula", 0.20),
        ("1.5", "Stoichiometry and Stoichiometric Calculations", 0.20),
    ],
    "Structure of Atom": [
        ("2.1", "Discovery of Sub-atomic Particles & Thomson/Rutherford Models", 0.25),
        ("2.2", "Developments Leading to Bohr's Model & Bohr's Model of Hydrogen", 0.30),
        ("2.3", "Towards Quantum Mechanics (de Broglie & Heisenberg Uncertainty)", 0.20),
        ("2.4", "Quantum Mechanical Model of Atom & Electronic Configuration", 0.25),
    ],
    "Classification of Elements and Periodicity in Properties": [
        ("3.1", "Genesis of Periodic Classification & Modern Periodic Law", 0.25),
        ("3.2", "Electronic Configurations of Elements and the Periodic Table", 0.30),
        ("3.3", "Periodic Trends in Properties of Elements (Atomic Radii, IE, EA, EN)", 0.45),
    ],
    "Chemical Bonding and Molecular Structure": [
        ("4.1", "Kössel-Lewis Approach, Ionic Bond & Bond Parameters", 0.25),
        ("4.2", "VSEPR Theory & Valence Bond Theory", 0.30),
        ("4.3", "Hybridisation", 0.25),
        ("4.4", "Molecular Orbital Theory & Hydrogen Bonding", 0.20),
    ],
    "Chemical Thermodynamics": [
        ("5.1", "Thermodynamic Terms, Applications & First Law", 0.30),
        ("5.2", "Enthalpy Change of Reactions & Hess's Law", 0.30),
        ("5.3", "Enthalpies for Different Types of Reactions", 0.20),
        ("5.4", "Spontaneity, Entropy, Gibbs Energy and Equilibrium", 0.20),
    ],
    "Equilibrium": [
        ("6.1", "Equilibrium in Physical and Chemical Processes", 0.20),
        ("6.2", "Law of Chemical Equilibrium and Equilibrium Constant", 0.25),
        ("6.3", "Factors Affecting Equilibria (Le Chatelier's Principle)", 0.20),
        ("6.4", "Ionic Equilibrium, Acids, Bases, Salts & pH", 0.20),
        ("6.5", "Buffer Solutions & Solubility Product", 0.15),
    ],
    "Redox Reactions": [
        ("7.1", "Classical & Electron Transfer Concepts of Redox", 0.25),
        ("7.2", "Oxidation Number & Balancing Redox Reactions", 0.50),
        ("7.3", "Redox Reactions and Electrode Processes", 0.25),
    ],
    "Organic Chemistry – Some Basic Principles and Techniques": [
        ("8.1", "Tetravalence of Carbon & Hybridisation", 0.15),
        ("8.2", "Classification and IUPAC Nomenclature of Organic Compounds", 0.30),
        ("8.3", "Isomerism (Structural and Stereoisomerism)", 0.20),
        ("8.4", "Fundamental Concepts in Organic Reaction Mechanisms", 0.20),
        ("8.5", "Purification & Qualitative/Quantitative Elemental Analysis", 0.15),
    ],
    "Hydrocarbons": [
        ("9.1", "Alkanes (Structure, Nomenclature, Preparation & Properties)", 0.30),
        ("9.2", "Alkenes and Alkynes (Preparation, Markovnikov's Rule & Properties)", 0.40),
        ("9.3", "Aromatic Hydrocarbons (Benzene, Aromaticity & Electrophilic Substitution)", 0.30),
    ],

    # =========================================================================
    # PHYSICS CLASS 11 (14 Chapters)
    # =========================================================================
    "Units and Measurements": [
        ("1.1", "The International System of Units", 0.20),
        ("1.2", "Measurement of Length, Mass and Time", 0.15),
        ("1.3", "Accuracy, Precision and Errors in Measurement", 0.25),
        ("1.4", "Significant Figures", 0.15),
        ("1.5", "Dimensions of Physical Quantities & Dimensional Analysis", 0.25),
    ],
    "Motion in a Straight Line": [
        ("2.1", "Position, Path Length and Displacement", 0.20),
        ("2.2", "Average Velocity and Average Speed", 0.25),
        ("2.3", "Instantaneous Velocity, Speed & Acceleration", 0.30),
        ("2.4", "Kinematic Equations for Uniformly Accelerated Motion & Relative Velocity", 0.25),
    ],
    "Motion in a Plane": [
        ("3.1", "Scalars and Vectors, Multiplication of Vectors", 0.20),
        ("3.2", "Addition and Subtraction of Vectors & Resolution", 0.25),
        ("3.3", "Motion in a Plane with Constant Acceleration", 0.20),
        ("3.4", "Projectile Motion & Uniform Circular Motion", 0.35),
    ],
    "Laws of Motion": [
        ("4.1", "Aristotle's Fallacy & Newton's First Law (Inertia)", 0.15),
        ("4.2", "Newton's Second Law & Momentum", 0.30),
        ("4.3", "Newton's Third Law & Conservation of Momentum", 0.25),
        ("4.4", "Equilibrium of a Particle & Friction", 0.30),
    ],
    "Work, Energy and Power": [
        ("5.1", "Notions of Work and Kinetic Energy: The Work-Energy Theorem", 0.25),
        ("5.2", "Work, Kinetic Energy & Work Done by a Variable Force", 0.20),
        ("5.3", "Potential Energy & Conservation of Mechanical Energy", 0.25),
        ("5.4", "Potential Energy of a Spring, Power & Collisions", 0.30),
    ],
    "System of Particles and Rotational Motion": [
        ("6.1", "Centre of Mass & Motion of Centre of Mass", 0.20),
        ("6.2", "Linear Momentum of a System & Vector Product", 0.15),
        ("6.3", "Angular Velocity, Torque and Angular Momentum", 0.25),
        ("6.4", "Equilibrium of a Rigid Body & Moment of Inertia", 0.25),
        ("6.5", "Kinematics of Rotational Motion & Rolling Motion", 0.15),
    ],
    "Gravitation": [
        ("7.1", "Kepler's Laws & Universal Law of Gravitation", 0.20),
        ("7.2", "The Gravitational Constant (G) & Acceleration due to Gravity (g)", 0.25),
        ("7.3", "Variation of g with Altitude, Depth and Latitude", 0.25),
        ("7.4", "Gravitational Potential Energy & Escape Speed", 0.15),
        ("7.5", "Earth Satellites, Energy of an Orbiting Satellite & Weightlessness", 0.15),
    ],
    "Mechanical Properties of Solids": [
        ("8.1", "Elastic Behaviour, Stress and Strain", 0.30),
        ("8.2", "Hooke's Law and Stress-Strain Curve", 0.30),
        ("8.3", "Elastic Moduli (Young's, Shear, Bulk) & Applications", 0.40),
    ],
    "Mechanical Properties of Fluids": [
        ("9.1", "Pressure, Pascal's Law & Variation with Depth", 0.25),
        ("9.2", "Streamline Flow, Equation of Continuity & Bernoulli's Principle", 0.30),
        ("9.3", "Viscosity, Stokes' Law, Terminal Velocity & Reynolds Number", 0.25),
        ("9.4", "Surface Tension, Surface Energy, Angle of Contact & Capillarity", 0.20),
    ],
    "Thermal Properties of Matter": [
        ("10.1", "Temperature, Heat & Measurement of Temperature", 0.20),
        ("10.2", "Thermal Expansion of Solids, Liquids and Gases", 0.25),
        ("10.3", "Specific Heat Capacity, Calorimetry & Change of State", 0.25),
        ("10.4", "Heat Transfer (Conduction, Convection, Radiation) & Newton's Law of Cooling", 0.30),
    ],
    "Thermodynamics": [
        ("11.1", "Thermal Equilibrium, Zeroth Law & First Law of Thermodynamics", 0.30),
        ("11.2", "Specific Heat Capacity & Thermodynamic State Variables", 0.20),
        ("11.3", "Thermodynamic Processes (Isothermal, Adiabatic, Isochoric, Isobaric)", 0.30),
        ("11.4", "Heat Engines, Refrigerators & Second Law of Thermodynamics", 0.20),
    ],
    "Kinetic Theory": [
        ("12.1", "Molecular Nature of Matter & Behaviour of Gases", 0.25),
        ("12.2", "Kinetic Theory of an Ideal Gas (Pressure, Kinetic Interpretation)", 0.30),
        ("12.3", "Law of Equipartition of Energy & Specific Heat Capacities", 0.25),
        ("12.4", "Mean Free Path", 0.20),
    ],
    "Oscillations": [
        ("13.1", "Periodic and Oscillatory Motions & Period and Frequency", 0.20),
        ("13.2", "Simple Harmonic Motion (SHM) and Simple Harmonic Oscillator", 0.30),
        ("13.3", "Velocity, Acceleration & Energy in Simple Harmonic Motion", 0.30),
        ("13.4", "Simple Pendulum, Systems Executing SHM & Damped/Forced Oscillations", 0.20),
    ],
    "Waves": [
        ("14.1", "Transverse and Longitudinal Waves", 0.20),
        ("14.2", "Displacement Relation in a Progressive Wave", 0.20),
        ("14.3", "The Speed of a Travelling Wave", 0.20),
        ("14.4", "The Principle of Superposition of Waves & Reflection of Waves", 0.20),
        ("14.5", "Beats and Doppler Effect", 0.20),
    ],

    # =========================================================================
    # BIOLOGY CLASS 12 (13 Chapters)
    # =========================================================================
    "Sexual Reproduction in Flowering Plants": [
        ("1.1", "Pre-fertilisation: Structures and Events (Microsporogenesis, Megasporogenesis)", 0.35),
        ("1.2", "Pollination, Agents & Outbreeding Devices", 0.30),
        ("1.3", "Double Fertilisation", 0.15),
        ("1.4", "Post-fertilisation Events (Endosperm, Embryo, Seed, Fruit) & Apomixis", 0.20),
    ],
    "Human Reproduction": [
        ("2.1", "The Male Reproductive System", 0.15),
        ("2.2", "The Female Reproductive System", 0.20),
        ("2.3", "Gametogenesis (Spermatogenesis & Oogenesis)", 0.25),
        ("2.4", "Menstrual Cycle", 0.20),
        ("2.5", "Fertilisation, Implantation, Pregnancy and Parturition", 0.20),
    ],
    "Reproductive Health": [
        ("3.1", "Reproductive Health: Problems and Strategies", 0.15),
        ("3.2", "Population Explosion and Birth Control (Contraceptive Methods)", 0.40),
        ("3.3", "Medical Termination of Pregnancy (MTP) & STIs", 0.25),
        ("3.4", "Infertility and Assisted Reproductive Technologies (ART)", 0.20),
    ],
    "Principles of Inheritance and Variation": [
        ("4.1", "Mendel's Laws of Inheritance & Monohybrid/Dihybrid Crosses", 0.25),
        ("4.2", "Incomplete Dominance, Co-dominance & Chromosomal Theory", 0.25),
        ("4.3", "Linkage and Recombination & Sex Determination", 0.25),
        ("4.4", "Mutation & Genetic Disorders (Mendelian and Chromosomal)", 0.25),
    ],
    "Molecular Basis of Inheritance": [
        ("5.1", "The DNA Structure & Packaging of DNA Helix", 0.20),
        ("5.2", "The Search for Genetic Material & RNA World", 0.15),
        ("5.3", "Replication & Transcription", 0.25),
        ("5.4", "Genetic Code & Translation", 0.20),
        ("5.5", "Regulation of Gene Expression (Lac Operon), HGP & DNA Fingerprinting", 0.20),
    ],
    "Evolution": [
        ("6.1", "Origin of Life & Evidences for Evolution", 0.25),
        ("6.2", "Adaptive Radiation, Biological Evolution & Mechanism", 0.25),
        ("6.3", "Hardy-Weinberg Principle & Natural Selection Types", 0.25),
        ("6.4", "Brief Account of Evolution & Origin and Evolution of Man", 0.25),
    ],
    "Human Health and Disease": [
        ("7.1", "Common Diseases in Humans (Bacterial, Viral, Protozoan, Helminthic)", 0.35),
        ("7.2", "Immunity (Innate, Acquired, Active, Passive, Vaccination & Allergies)", 0.35),
        ("7.3", "AIDS, Cancer & Drugs and Alcohol Abuse", 0.30),
    ],
    "Microbes in Human Welfare": [
        ("8.1", "Microbes in Household Products and Industrial Products", 0.35),
        ("8.2", "Microbes in Sewage Treatment and Biogas Production", 0.35),
        ("8.3", "Microbes as Biocontrol Agents and Biofertilisers", 0.30),
    ],
    "Biotechnology: Principles and Processes": [
        ("9.1", "Principles of Biotechnology (Genetic Engineering)", 0.25),
        ("9.2", "Tools of Recombinant DNA Technology (Enzymes, Vectors, Host)", 0.45),
        ("9.3", "Processes of Recombinant DNA Technology & Bioreactors", 0.30),
    ],
    "Biotechnology and its Applications": [
        ("10.1", "Biotechnological Applications in Agriculture (Bt Crops, RNAi)", 0.35),
        ("10.2", "Biotechnological Applications in Medicine (Insulin, Gene Therapy, PCR)", 0.35),
        ("10.3", "Transgenic Animals and Ethical Issues (Biopiracy)", 0.30),
    ],
    "Organisms and Populations": [
        ("11.1", "Organism and Its Environment (Abiotic Factors & Adaptations)", 0.40),
        ("11.2", "Populations (Attributes, Growth Models & Age Pyramids)", 0.30),
        ("11.3", "Population Interactions (Mutualism, Competition, Predation, Parasitism)", 0.30),
    ],
    "Ecosystem": [
        ("12.1", "Ecosystem: Structure and Function & Productivity", 0.30),
        ("12.2", "Decomposition & Energy Flow (Food Chains, Food Web)", 0.35),
        ("12.3", "Ecological Pyramids", 0.35),
    ],
    "Biodiversity and Conservation": [
        ("13.1", "Biodiversity: Patterns and Importance", 0.45),
        ("13.2", "Loss of Biodiversity (Evil Quartet) & Conservation Strategies", 0.55),
    ],

    # =========================================================================
    # CHEMISTRY CLASS 12 (10 Chapters)
    # =========================================================================
    "Solutions": [
        ("1.1", "Types of Solutions & Expressing Concentration of Solutions", 0.20),
        ("1.2", "Solubility & Henry's Law", 0.15),
        ("1.3", "Vapour Pressure of Liquid Solutions & Raoult's Law", 0.20),
        ("1.4", "Ideal and Non-ideal Solutions", 0.15),
        ("1.5", "Colligative Properties and Determination of Molar Mass", 0.20),
        ("1.6", "Abnormal Molar Masses & Van't Hoff Factor", 0.10),
    ],
    "Electrochemistry": [
        ("2.1", "Electrochemical Cells & Galvanic Cells", 0.20),
        ("2.2", "Nernst Equation & Gibbs Energy of Reaction", 0.25),
        ("2.3", "Conductance of Electrolytic Solutions & Kohlrausch's Law", 0.25),
        ("2.4", "Electrolytic Cells, Electrolysis (Faraday's Laws) & Batteries", 0.20),
        ("2.5", "Fuel Cells and Corrosion", 0.10),
    ],
    "Chemical Kinetics": [
        ("3.1", "Rate of a Chemical Reaction & Average/Instantaneous Rate", 0.20),
        ("3.2", "Factors Influencing Rate of a Reaction & Order/Molecularity", 0.25),
        ("3.3", "Integrated Rate Equations & Half-Life of a Reaction", 0.30),
        ("3.4", "Temperature Dependence of Rate & Collision Theory", 0.25),
    ],
    "The d- and f-Block Elements": [
        ("4.1", "Position in Periodic Table & Electronic Configurations", 0.20),
        ("4.2", "General Properties of Transition Elements (Atomic Radii, Oxidation States, Magnetism)", 0.35),
        ("4.3", "Some Important Compounds of Transition Elements (KMnO4, K2Cr2O7)", 0.20),
        ("4.4", "The Lanthanoids & Actinoids", 0.25),
    ],
    "Coordination Compounds": [
        ("5.1", "Werner's Theory & Terminology of Coordination Compounds", 0.20),
        ("5.2", "Nomenclature and Isomerism in Coordination Compounds", 0.30),
        ("5.3", "Bonding in Coordination Compounds (VBT and CFT)", 0.35),
        ("5.4", "Bonding in Metal Carbonyls, Stability & Applications", 0.15),
    ],
    "Haloalkanes and Haloarenes": [
        ("6.1", "Classification, Nomenclature & Nature of C-X Bond", 0.15),
        ("6.2", "Methods of Preparation of Haloalkanes and Haloarenes", 0.25),
        ("6.3", "Physical Properties & Chemical Reactions (SN1, SN2)", 0.35),
        ("6.4", "Reactions of Haloarenes & Polyhalogen Compounds", 0.25),
    ],
    "Alcohols, Phenols and Ethers": [
        ("7.1", "Classification, Nomenclature & Structures of Functional Groups", 0.15),
        ("7.2", "Preparation of Alcohols and Phenols", 0.25),
        ("7.3", "Physical and Chemical Properties of Alcohols and Phenols", 0.35),
        ("7.4", "Ethers: Preparation, Physical and Chemical Properties", 0.25),
    ],
    "Aldehydes, Ketones and Carboxylic Acids": [
        ("8.1", "Nomenclature & Structure of Carbonyl Group", 0.15),
        ("8.2", "Preparation of Aldehydes and Ketones", 0.25),
        ("8.3", "Physical and Chemical Properties of Aldehydes and Ketones", 0.35),
        ("8.4", "Carboxylic Acids: Structure, Preparation and Chemical Properties", 0.25),
    ],
    "Amines": [
        ("9.1", "Structure, Classification & Nomenclature of Amines", 0.20),
        ("9.2", "Preparation of Amines", 0.25),
        ("9.3", "Physical Properties and Chemical Reactions of Amines", 0.35),
        ("9.4", "Diazonium Salts: Preparation, Chemical Reactions & Importance", 0.20),
    ],
    "Biomolecules (Chemistry)": [
        ("10.1", "Carbohydrates (Classification, Monosaccharides, Disaccharides, Polysaccharides)", 0.40),
        ("10.2", "Proteins (Amino Acids, Peptide Bond, Denaturation)", 0.30),
        ("10.3", "Enzymes and Vitamins", 0.15),
        ("10.4", "Nucleic Acids & Hormones", 0.15),
    ],

    # =========================================================================
    # PHYSICS CLASS 12 (14 Chapters)
    # =========================================================================
    "Electric Charges and Fields": [
        ("1.1", "Electric Charge, Conductors, Insulators & Charging", 0.15),
        ("1.2", "Basic Properties of Electric Charge & Coulomb's Law", 0.25),
        ("1.3", "Electric Field, Field Lines & Electric Dipole", 0.25),
        ("1.4", "Electric Flux & Gauss's Law", 0.15),
        ("1.5", "Applications of Gauss's Law", 0.20),
    ],
    "Electrostatic Potential and Capacitance": [
        ("2.1", "Electrostatic Potential & Potential due to Point Charge/Dipole", 0.25),
        ("2.2", "Equipotential Surfaces & Potential Energy of a System", 0.20),
        ("2.3", "Electrostatics of Conductors, Dielectrics and Polarisation", 0.20),
        ("2.4", "Capacitors and Capacitance (Parallel Plate, Combination, Energy Stored)", 0.35),
    ],
    "Current Electricity": [
        ("3.1", "Electric Current & Drift of Electrons and Origin of Resistivity", 0.25),
        ("3.2", "Ohm's Law, Temperature Dependence & Electric Power", 0.25),
        ("3.3", "Cells, EMF, Internal Resistance & Cells in Series/Parallel", 0.25),
        ("3.4", "Kirchhoff's Rules and Wheatstone Bridge", 0.25),
    ],
    "Moving Charges and Magnetism": [
        ("4.1", "Magnetic Force & Motion in Combined Electric and Magnetic Fields", 0.25),
        ("4.2", "Biot-Savart Law & Magnetic Field of a Circular Current Loop", 0.25),
        ("4.3", "Ampere's Circuital Law & Solenoid", 0.20),
        ("4.4", "Force between Two Parallel Currents & Torque on Current Loop", 0.15),
        ("4.5", "The Moving Coil Galvanometer", 0.15),
    ],
    "Magnetism and Matter": [
        ("5.1", "The Bar Magnet & Magnetic Field Lines", 0.30),
        ("5.2", "Magnetism and Gauss's Law & Earth's Magnetism", 0.25),
        ("5.3", "Magnetisation and Magnetic Intensity", 0.25),
        ("5.4", "Magnetic Properties of Materials & Permanent Magnets", 0.20),
    ],
    "Electromagnetic Induction": [
        ("6.1", "Magnetic Flux & Faraday's Experiments and Law of Induction", 0.25),
        ("6.2", "Lenz's Law, Conservation of Energy & Motional EMF", 0.30),
        ("6.3", "Inductance (Mutual and Self Inductance)", 0.30),
        ("6.4", "AC Generator", 0.15),
    ],
    "Alternating Current": [
        ("7.1", "AC Voltage Applied to a Resistor, Inductor and Capacitor", 0.30),
        ("7.2", "Series LCR Circuit & Resonance", 0.35),
        ("7.3", "Power in AC Circuit & Power Factor", 0.20),
        ("7.4", "LC Oscillations & Transformers", 0.15),
    ],
    "Electromagnetic Waves": [
        ("8.1", "Displacement Current & Maxwell's Equations", 0.30),
        ("8.2", "Electromagnetic Waves (Sources and Characteristics)", 0.40),
        ("8.3", "Electromagnetic Spectrum", 0.30),
    ],
    "Ray Optics and Optical Instruments": [
        ("9.1", "Reflection of Light by Spherical Mirrors", 0.15),
        ("9.2", "Refraction & Total Internal Reflection", 0.25),
        ("9.3", "Refraction at Spherical Surfaces and by Lenses", 0.30),
        ("9.4", "Refraction through a Prism & Dispersion", 0.15),
        ("9.5", "Optical Instruments (Microscopes and Telescopes)", 0.15),
    ],
    "Wave Optics": [
        ("10.1", "Huygens Principle & Refraction/Reflection of Plane Waves", 0.25),
        ("10.2", "Coherent Sources & Interference of Light Waves (Young's Experiment)", 0.35),
        ("10.3", "Diffraction & Resolving Power of Optical Instruments", 0.25),
        ("10.4", "Polarisation", 0.15),
    ],
    "Dual Nature of Radiation and Matter": [
        ("11.1", "Photoelectric Effect (Experimental Study, Observations)", 0.35),
        ("11.2", "Einstein's Photoelectric Equation: Energy Quantum of Radiation", 0.30),
        ("11.3", "Particle Nature of Light & Wave Nature of Matter (de Broglie)", 0.35),
    ],
    "Atoms": [
        ("12.1", "Alpha-particle Scattering & Rutherford's Nuclear Model", 0.25),
        ("12.2", "Atomic Spectra & Bohr Model of the Hydrogen Atom", 0.40),
        ("12.3", "Line Spectra of Hydrogen Atom & de Broglie Explanation", 0.35),
    ],
    "Nuclei": [
        ("13.1", "Atomic Masses, Composition of Nucleus & Size of Nucleus", 0.25),
        ("13.2", "Mass-Energy Equivalence, Nuclear Binding Energy & Nuclear Force", 0.35),
        ("13.3", "Radioactivity (Alpha, Beta, Gamma Decay) & Half-Life", 0.25),
        ("13.4", "Nuclear Energy: Nuclear Fission and Fusion", 0.15),
    ],
    "Semiconductor Electronics: Materials, Devices and Simple Circuits": [
        ("14.1", "Classification of Metals, Conductors and Semiconductors", 0.15),
        ("14.2", "Intrinsic and Extrinsic Semiconductors", 0.25),
        ("14.3", "p-n Junction & Semiconductor Diode (Forward/Reverse Bias)", 0.25),
        ("14.4", "Application of Junction Diode as a Rectifier", 0.15),
        ("14.5", "Special Purpose Diodes (Zener, LED, Photodiode, Solar Cell)", 0.20),
    ]
}

def get_canonical_topics_for_chapter(ch_title: str, ch_class: str, total_source: int, topic_mcqs: int, scorer_mcqs: int) -> List[Tuple[str, str, int]]:
    """
    Returns the exact canonical topic list and expected counts for any chapter.
    Distributes topic_mcqs proportionally across the canonical topics, and assigns
    scorer_mcqs to the dedicated EXAM_SCORER topic.
    The sum of all topic expected counts equals EXACTLY total_source.
    """
    # Special disambiguation for Biomolecules (Bio Class 11 vs Chem Class 12)
    lookup_title = ch_title
    if "biomolecules" in ch_title.lower() and "12" in str(ch_class):
        lookup_title = "Biomolecules (Chemistry)"

    matched_key = None
    for k in CANONICAL_REGISTRY.keys():
        if k.lower() == lookup_title.lower() or k.lower() in lookup_title.lower() or lookup_title.lower() in k.lower():
            matched_key = k
            break

    if not matched_key:
        raise ValueError(f"Chapter '{ch_title}' (Class {ch_class}) not found in CANONICAL_REGISTRY!")

    topic_defs = CANONICAL_REGISTRY[matched_key]
    num_topics = len(topic_defs)
    
    # Calculate integer counts proportionally with exact sum matching topic_mcqs
    raw_counts = [int(round(weight * topic_mcqs)) for _, _, weight in topic_defs]
    diff = topic_mcqs - sum(raw_counts)
    if raw_counts:
        raw_counts[-1] += diff

    result = []
    for i, (t_num, t_name, _) in enumerate(topic_defs):
        result.append((t_num, t_name, raw_counts[i]))

    # Append the Exam Scorer chapter-level topic
    result.append(("EXAM_SCORER", "Exam Scorer (Exemplar, AR, Statement, Case, Archive)", scorer_mcqs))
    
    # Sanity check sum
    assert sum(c for _, _, c in result) == total_source, f"Sum mismatch for {ch_title}: expected {total_source}, got {sum(c for _, _, c in result)}"
    return result
