import pymupdf
import json
import re
import os

PDF1_PATH = r"C:\Users\sagar\.gemini\antigravity\scratch\neet-cbt-platform\temp_ingestion\kebo1dd\kebo101.pdf"
PDF2_PATH = r"C:\Users\sagar\.gemini\antigravity\scratch\neet-cbt-platform\temp_ingestion\kebo1dd\kebo102.pdf"

def deduplicate_shadow_spans(text: str) -> str:
    """
    NCERT PDFs often print bold text using repeated lines/spans.
    This function collapses identical consecutive lines.
    """
    lines = text.split('\n')
    clean_lines = []
    prev = None
    for line in lines:
        stripped = line.strip()
        if stripped and stripped == prev:
            continue
        clean_lines.append(line)
        if stripped:
            prev = stripped
    return '\n'.join(clean_lines)

def parse_ncert_page_enhanced(page, page_num: int, chapter_title: str):
    raw_text = page.get_text()
    cleaned_text = deduplicate_shadow_spans(raw_text)
    
    # 1. Blocks inspection
    blocks = page.get_text("blocks")
    
    # 2. Extract Headings & Subheadings
    headings = []
    paragraphs = []
    rules = []
    definitions = []
    scientific_names = []
    authorities = []
    
    for b in blocks:
        b_text = b[4].strip()
        # Headings often start with section numbers e.g. "1.2", "2.1" or all-caps short titles
        if re.match(r'^(?:\d+\.\d+|\b[A-Z\s]{4,30}\b)', b_text) and len(b_text) < 60:
            headings.append(b_text)
        elif len(b_text) > 40:
            paragraphs.append(b_text)

    # 3. Detect Rules & Enumerations (e.g. Nomenclature rules 1, 2, 3, 4)
    rule_matches = re.findall(r'(\d+\.\s+[A-Z][^\n]+(?:\n[^\d\n][^\n]+)*)', cleaned_text)
    for r in rule_matches:
        if len(r.strip()) > 30 and not re.search(r'\([a-d]\)', r):
            rules.append(r.strip().replace('\n', ' '))
            
    # 4. Detect Definitions (is called, is known as, refers to, this system... is called)
    def_regex = r'([A-Z][^\.\n]{5,100}\s+(?:is called|is known as|refers to|is termed as)\s+[^.\n]+[.])'
    for dm in re.findall(def_regex, cleaned_text):
        definitions.append(dm.strip().replace('\n', ' '))
        
    # 5. Detect Scientific Names (Binomial: Genus + specific epithet)
    sci_regex = r'\b([A-Z][a-z]+)\s+([a-z]+)\b'
    stopwords = {"Figure", "Table", "Biological", "Chapter", "These", "Those", "When", "Where", "Which", "Their", "Earlier", "After", "Before", "Other", "Universal", "Under", "Plants", "Animals", "Kingdom", "System", "Class", "Order", "Family", "Genus", "Species"}
    for sm in re.finditer(sci_regex, cleaned_text):
        g, s = sm.group(1), sm.group(2)
        if g not in stopwords and len(g) > 3 and len(s) > 3:
            sci_name = f"{g} {s}"
            if sci_name not in scientific_names:
                scientific_names.append(sci_name)

    # 6. Detect Key Authorities & Years
    auth_regex = r'\b([A-Z]\.[A-Z]\.\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+|\bCarolus Linnaeus\b|\bR\.H\. Whittaker\b)\s*\(\d{4}\)'
    for am in re.findall(auth_regex, cleaned_text):
        if am not in authorities:
            authorities.append(am)

    # 7. Detect Tables
    tables_found = []
    if "TABLE" in cleaned_text.upper():
        t_match = re.search(r'(Table\s+\d+\.\d+[^.\n]*)', cleaned_text, re.IGNORECASE)
        table_title = t_match.group(1).strip() if t_match else "Table Detected"
        tables_found.append(table_title)

    # 8. Detect Figures / Diagrams
    figures_found = []
    images = page.get_images(full=True)
    fig_matches = re.findall(r'(Figure\s+\d+\.\d+[^.\n]*)', cleaned_text, re.IGNORECASE)
    for fm in fig_matches:
        figures_found.append(fm.strip())
        
    # 9. Real Questions vs Numbered lists distinction
    # A real MCQ question must have options (a), (b), (c), (d) or question mark with exercise context
    questions_found = []
    mcq_matches = re.findall(r'(\d+)\.\s+([\s\S]*?\([a-d]\)[\s\S]*?)(?=\n\s*\d+\.|$)', cleaned_text)
    for qm in mcq_matches:
        questions_found.append(f"Q{qm[0]}: {qm[1][:60]}...")

    return {
        "page_num": page_num,
        "chapter": chapter_title,
        "raw_text_length": len(raw_text),
        "headings": headings[:3],
        "paragraphs_count": len(paragraphs),
        "definitions": definitions,
        "rules": rules,
        "scientific_names": scientific_names,
        "authorities": authorities,
        "tables": tables_found,
        "figures": figures_found,
        "image_count": len(images),
        "mcq_questions": questions_found,
        "raw_sample": raw_text[:500],
        "clean_sample": cleaned_text[:500]
    }

if __name__ == "__main__":
    doc1 = pymupdf.open(PDF1_PATH)
    doc2 = pymupdf.open(PDF2_PATH)
    
    # Page 1: kebo101.pdf Page 4
    p1 = parse_ncert_page_enhanced(doc1[3], 4, "The Living World")
    
    # Page 2: kebo102.pdf Page 2
    p2 = parse_ncert_page_enhanced(doc2[1], 2, "Biological Classification")
    
    # Page 3: kebo102.pdf Page 11
    p3 = parse_ncert_page_enhanced(doc2[10], 11, "Biological Classification")
    
    doc1.close()
    doc2.close()
    
    print("PAGE 1 RESULT:")
    print(json.dumps(p1, indent=2))
    print("\nPAGE 2 RESULT:")
    print(json.dumps(p2, indent=2))
    print("\nPAGE 3 RESULT:")
    print(json.dumps(p3, indent=2))
