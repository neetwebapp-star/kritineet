import os
import sys
import sqlite3
import hashlib
import json
import re
import time
from pathlib import Path
import pymupdf

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"C:\Users\sagar\.gemini\antigravity\scratch\neet-cbt-platform\prisma\dev.db"
DOWNLOADS = r"C:\Users\sagar\Downloads"
FIGURES_DIR = r"C:\Users\sagar\.gemini\antigravity\scratch\neet-cbt-platform\public\extracted_figures"

os.makedirs(FIGURES_DIR, exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def calculate_fingerprint(stem: str, options: list[dict]) -> str:
    clean_stem = re.sub(r'[^a-z0-9]', '', stem.lower()).strip()
    clean_opts = sorted([re.sub(r'[^a-z0-9]', '', o['text'].lower()).strip() for o in options])
    return hashlib.sha256(f"{clean_stem}:::{'|'.join(clean_opts)}".encode('utf-8')).hexdigest()

def evaluate_difficulty(stem: str, options: list[dict], q_type: str, explicit_diff: str = None) -> tuple[str, str, float]:
    if explicit_diff and explicit_diff.upper() in ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']:
        return explicit_diff.upper(), 'SOURCE', 0.95
        
    score = 0
    if len(stem) > 250: score += 20
    elif len(stem) > 120: score += 10
    else: score += 5
    
    if re.search(r'[0-9\.\^]+\s*[\+\-\*\/\=]|sin|cos|tan|log|ln|sqrt|Δ|λ|μ|Ω|π', stem, re.IGNORECASE):
        score += 25
        
    if q_type == 'ASSERTION_REASON': score += 30
    elif q_type == 'MATCHING': score += 25
    elif q_type == 'STATEMENT_BASED': score += 20
    elif q_type == 'NUMERICAL': score += 25
    elif q_type == 'DIAGRAM_BASED': score += 20
    
    if re.search(r'calculate|determine|find the ratio|proportion|respectively', stem, re.IGNORECASE):
        score += 15
        
    if score >= 65: return 'VERY_HARD', 'DERIVED', 0.88
    elif score >= 45: return 'HARD', 'DERIVED', 0.88
    elif score >= 25: return 'MEDIUM', 'DERIVED', 0.90
    return 'EASY', 'DERIVED', 0.92

def validate_answer(raw_answer: str, options: list[dict], explanation: str = "") -> tuple[str, str, list[str]]:
    warnings = []
    norm = (raw_answer or '').strip().toUpperCase() if hasattr(raw_answer, 'toUpperCase') else (raw_answer or '').strip().upper()
    
    # Map digit to letter (1->A, 2->B, 3->C, 4->D)
    m = re.search(r'\b([1-4])\b', norm)
    if m:
        norm = {'1':'A', '2':'B', '3':'C', '4':'D'}[m.group(1)]
    else:
        m2 = re.search(r'\b([A-D])\b', norm)
        if m2:
            norm = m2.group(1)
            
    if not options or len(options) < 2:
        warnings.append(f"Insufficient options: {len(options)}")
        return norm or 'A', 'NEEDS_REVIEW', warnings
        
    actual_labels = set(o['label'].upper() for o in options)
    if norm not in actual_labels:
        warnings.append(f"Answer key '{raw_answer}' ({norm}) not in options: {actual_labels}")
        return norm or 'A', 'CONFLICT', warnings
        
    return norm, 'VERIFIED', warnings

def link_to_ncert_concept(cur, chapter_id: str, stem: str, options: list[dict]) -> tuple[str, str, str, str]:
    full_text = (stem + " " + " ".join(o['text'] for o in options)).lower()
    
    cur.execute("SELECT id, name, definition, formula, laws FROM Concept WHERE chapterId = ?", (chapter_id,))
    concepts = cur.fetchall()
    
    if not concepts:
        # Fallback to any concept matching major keyword across DB
        cur.execute("SELECT id, name, chapterId FROM Concept WHERE ? LIKE '%' || LOWER(name) || '%' LIMIT 1", (full_text,))
        fb = cur.fetchone()
        if fb:
            return fb[0], fb[1], 'MEDIUM', 'KEYWORD'
        return None, None, 'LOW', 'KEYWORD'
        
    best_id = None
    best_name = None
    best_score = 0
    
    for cid, cname, cdef, cform, claws in concepts:
        score = 0
        name_words = [w for w in re.findall(r'[a-z]{4,}', cname.lower()) if w not in ['definition', 'rule', 'formula', 'concept']]
        for w in name_words:
            if w in full_text: score += 0.35
            
        if cdef:
            def_words = [w for w in re.findall(r'[a-z]{5,}', cdef.lower()) if w not in ['called', 'refers', 'known']]
            for w in def_words[:6]:
                if w in full_text: score += 0.15
                
        if cform and any(sym in full_text for sym in re.findall(r'[A-Za-z0-9_]{2,}', cform)):
            score += 0.4
            
        if score > best_score:
            best_score = score
            best_id = cid
            best_name = cname
            
    conf = 'HIGH' if best_score >= 0.6 else ('MEDIUM' if best_score >= 0.3 else 'LOW')
    method = 'EXACT_TERM' if best_score >= 0.7 else 'KEYWORD'
    return best_id or concepts[0][0], best_name or concepts[0][1], conf, method

def evaluate_quality_score(stem: str, options: list[dict], answer: str, explanation: str, ocr_conf: float, concept_id: str, exam_year: int = None) -> tuple[int, str]:
    pts = 0
    # Stem completeness (0-25)
    if len(stem.strip()) >= 50: pts += 25
    elif len(stem.strip()) >= 25: pts += 15
    else: pts += 5
    
    # Options completeness (0-25)
    if len(options) == 4 and all(len(o['text'].strip()) > 0 for o in options): pts += 25
    elif len(options) >= 2: pts += 15
    
    # Answer completeness (0-20)
    if answer in ['A', 'B', 'C', 'D']: pts += 20
    
    # Explanation completeness (0-15)
    if explanation and len(explanation.strip()) >= 30: pts += 15
    elif explanation and len(explanation.strip()) > 5: pts += 10
    
    # NCERT link & year (0-15)
    if concept_id: pts += 10
    if exam_year: pts += 5
    
    pts = min(100, max(0, pts))
    band = 'VERIFIED' if pts >= 95 else ('GOOD' if pts >= 85 else ('REVIEW_RECOMMENDED' if pts >= 70 else 'NEEDS_REVIEW'))
    return pts, band
