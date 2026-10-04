import json

# Target syllabus definitions given by user:
TARGET = {
    "Class 11": {
        "Chemistry": [
            "Some Basic Concepts of Chemistry",
            "Structure of Atom",
            "Classification of Elements",
            "Chemical Bonding & Molecular Structure",
            "Thermodynamics",
            "Equilibrium",
            "Redox Reactions",
            "Organic Chemistry: Basic Principles",
            "Hydrocarbons"
        ],
        "Physics": [
            "Units and Measurements",
            "Motion in a Straight Line",
            "Motion in a Plane",
            "Laws of Motion",
            "Work, Energy, and Power",
            "System of Particles & Rotational Motion",
            "Gravitation",
            "Properties of Bulk Matter",
            "Thermodynamics",
            "Oscillations and Waves"
        ],
        "Biology": [
            "Diversity in Living World",
            "Structural Organisation in Animals & Plants",
            "Cell: Structure and Function",
            "Plant Physiology",
            "Human Physiology"
        ]
    },
    "Class 12": {
        "Chemistry": [
            "Solutions",
            "Electrochemistry",
            "Chemical Kinetics",
            "p-Block Elements",
            "d- and f-Block Elements",
            "Coordination Compounds",
            "Haloalkanes and Haloarenes",
            "Alcohols, Phenols and Ethers",
            "Aldehydes, Ketones & Carboxylic Acids",
            "Amines",
            "Biomolecules"
        ],
        "Physics": [
            "Electrostatics",
            "Current Electricity",
            "Magnetic Effects of Current & Magnetism",
            "EMI and Alternating Current",
            "Electromagnetic Waves",
            "Optics",
            "Dual Nature of Radiation & Matter",
            "Atoms and Nuclei",
            "Electronic Devices"
        ],
        "Biology": [
            "Reproduction",
            "Genetics and Evolution",
            "Biology and Human Welfare",
            "Biotechnology and its Applications",
            "Ecology and Environment"
        ]
    }
}

with open('scratch/full_chapter_audit.json', 'r', encoding='utf-8') as f:
    chapters = json.load(f)

# Semantic mapping helper
def map_chapter(ch):
    cl = ch['class']
    subj_raw = ch['subject']
    subj = 'Biology' if 'Biology' in subj_raw else ('Chemistry' if 'Chemistry' in subj_raw else 'Physics')
    title = ch['title']
    unit = ch['unit'] or ''
    ch_num = ch['chNum']
    slug = ch['slug']

    # Filter out obvious test chapters
    if ch_num > 20 or 'test' in title.lower() or 'test' in slug.lower():
        return {
            'action': 'REMOVE',
            'reason': 'Test / anomalous chapter not present in target syllabus image',
            'target_match': None
        }

    targets = TARGET.get(cl, {}).get(subj, [])

    # Class 11 Chemistry
    if cl == 'Class 11' and subj == 'Chemistry':
        mapping = {
            1: "Some Basic Concepts of Chemistry",
            2: "Structure of Atom",
            3: "Classification of Elements",
            4: "Chemical Bonding & Molecular Structure",
            5: "Thermodynamics",
            6: "Equilibrium",
            7: "Redox Reactions",
            8: "Organic Chemistry: Basic Principles",
            9: "Hydrocarbons"
        }
        if ch_num in mapping:
            return {'action': 'KEEP', 'target_match': mapping[ch_num], 'reason': 'Target match'}

    # Class 12 Chemistry
    if cl == 'Class 12' and subj == 'Chemistry':
        mapping = {
            1: "Solutions",
            2: "Electrochemistry",
            3: "Chemical Kinetics",
            4: "d- and f-Block Elements",
            5: "Coordination Compounds",
            6: "Haloalkanes and Haloarenes",
            7: "Alcohols, Phenols and Ethers",
            8: "Aldehydes, Ketones & Carboxylic Acids",
            9: "Amines",
            10: "Biomolecules"
        }
        if ch_num in mapping:
            return {'action': 'KEEP', 'target_match': mapping[ch_num], 'reason': 'Target match'}

    # Class 11 Physics
    if cl == 'Class 11' and subj == 'Physics':
        mapping = {
            1: "Units and Measurements",
            2: "Motion in a Straight Line",
            3: "Motion in a Plane",
            4: "Laws of Motion",
            5: "Work, Energy, and Power",
            6: "System of Particles & Rotational Motion",
            7: "Gravitation",
            8: "Properties of Bulk Matter",
            9: "Properties of Bulk Matter",
            10: "Properties of Bulk Matter",
            11: "Thermodynamics",
            12: "Thermodynamics",
            13: "Oscillations and Waves",
            14: "Oscillations and Waves"
        }
        if ch_num in mapping:
            return {'action': 'KEEP', 'target_match': mapping[ch_num], 'reason': 'Target match'}

    # Class 12 Physics
    if cl == 'Class 12' and subj == 'Physics':
        mapping = {
            1: "Electrostatics",
            2: "Electrostatics",
            3: "Current Electricity",
            4: "Magnetic Effects of Current & Magnetism",
            5: "Magnetic Effects of Current & Magnetism",
            6: "EMI and Alternating Current",
            7: "EMI and Alternating Current",
            8: "Electromagnetic Waves",
            9: "Optics",
            10: "Optics",
            11: "Dual Nature of Radiation & Matter",
            12: "Atoms and Nuclei",
            13: "Atoms and Nuclei",
            14: "Electronic Devices"
        }
        if ch_num in mapping:
            return {'action': 'KEEP', 'target_match': mapping[ch_num], 'reason': 'Target match'}

    # Class 11 Biology
    if cl == 'Class 11' and subj == 'Biology':
        # Ch 1-4: Diversity in Living World
        # Ch 5-7: Structural Organisation in Animals & Plants
        # Ch 8-10: Cell: Structure and Function
        # Ch 11-13: Plant Physiology
        # Ch 14-19: Human Physiology
        if 1 <= ch_num <= 4:
            return {'action': 'KEEP', 'target_match': 'Diversity in Living World', 'reason': 'Target match'}
        elif 5 <= ch_num <= 7:
            return {'action': 'KEEP', 'target_match': 'Structural Organisation in Animals & Plants', 'reason': 'Target match'}
        elif 8 <= ch_num <= 10:
            return {'action': 'KEEP', 'target_match': 'Cell: Structure and Function', 'reason': 'Target match'}
        elif 11 <= ch_num <= 13:
            return {'action': 'KEEP', 'target_match': 'Plant Physiology', 'reason': 'Target match'}
        elif 14 <= ch_num <= 19:
            return {'action': 'KEEP', 'target_match': 'Human Physiology', 'reason': 'Target match'}

    # Class 12 Biology
    if cl == 'Class 12' and subj == 'Biology':
        # Ch 1-3: Reproduction
        # Ch 4-6: Genetics and Evolution
        # Ch 7-8: Biology and Human Welfare
        # Ch 9-10: Biotechnology and its Applications
        # Ch 11-13: Ecology and Environment
        if 1 <= ch_num <= 3:
            return {'action': 'KEEP', 'target_match': 'Reproduction', 'reason': 'Target match'}
        elif 4 <= ch_num <= 6:
            return {'action': 'KEEP', 'target_match': 'Genetics and Evolution', 'reason': 'Target match'}
        elif 7 <= ch_num <= 8:
            return {'action': 'KEEP', 'target_match': 'Biology and Human Welfare', 'reason': 'Target match'}
        elif 9 <= ch_num <= 10:
            return {'action': 'KEEP', 'target_match': 'Biotechnology and its Applications', 'reason': 'Target match'}
        elif 11 <= ch_num <= 13:
            return {'action': 'KEEP', 'target_match': 'Ecology and Environment', 'reason': 'Target match'}

    return {'action': 'REMOVE', 'target_match': None, 'reason': 'Not present in target syllabus image'}

results = []
summary = {
    'Class 11': {'Physics': {'KEEP': 0, 'REMOVE': 0}, 'Chemistry': {'KEEP': 0, 'REMOVE': 0}, 'Biology': {'KEEP': 0, 'REMOVE': 0}},
    'Class 12': {'Physics': {'KEEP': 0, 'REMOVE': 0}, 'Chemistry': {'KEEP': 0, 'REMOVE': 0}, 'Biology': {'KEEP': 0, 'REMOVE': 0}}
}

for ch in chapters:
    res = map_chapter(ch)
    item = {**ch, **res}
    results.append(item)
    cl = ch['class']
    subj_raw = ch['subject']
    subj = 'Biology' if 'Biology' in subj_raw else ('Chemistry' if 'Chemistry' in subj_raw else 'Physics')
    action = res['action']
    if cl in summary and subj in summary[cl]:
        summary[cl][subj][action] += 1

print("=== SUMMARY STATS ===")
print(json.dumps(summary, indent=2))

print("\n=== REMOVE LIST ===")
for r in results:
    if r['action'] == 'REMOVE':
        print(f"[{r['class']}] [{r['subject']}] Ch {r['chNum']}: '{r['title']}' (id: {r['id']}, slug: {r['slug']}) -> Reason: {r['reason']}")

with open('scratch/audit_mapping_results.json', 'w', encoding='utf-8') as f:
    json.dump({'summary': summary, 'results': results}, f, indent=2)
