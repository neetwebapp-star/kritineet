"""
NCERT PDF Extraction Engine
Uses PyMuPDF (fitz) to extract structural sections, paragraphs, figures,
tables, formulas, and metadata from official NCERT rationalised PDFs.
"""

import pymupdf
import re
import os
from typing import Dict, List, Any, Optional

class NCERTPDFExtractor:
    def __init__(self, pdf_path: str, chapter_num: int):
        self.pdf_path = pdf_path
        self.chapter_num = chapter_num
        self.book_code = f"keph10{chapter_num}"
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        self.doc = pymupdf.open(pdf_path)
        self.total_pages = len(self.doc)

    def extract_all(self) -> Dict[str, Any]:
        """
        Extracts complete chapter structure:
        - sections & headings
        - paragraphs (with page, bbox, font, source_block_id)
        - figures (with caption, page, figureNumber)
        - tables (with caption, page, tableNumber, headers, rows)
        - formulas & equations (with equation numbers like (1.1))
        """
        chapter_title = self._extract_chapter_title()
        sections = self._extract_sections_and_blocks()
        figures = self._extract_figures()
        tables = self._extract_tables()
        formulas = self._extract_formulas()

        return {
            "book_code": self.book_code,
            "chapter_number": self.chapter_num,
            "chapter_title": chapter_title,
            "pdf_path": self.pdf_path,
            "total_pages": self.total_pages,
            "sections": sections,
            "figures": figures,
            "tables": tables,
            "formulas": formulas
        }

    def _extract_chapter_title(self) -> str:
        """Finds chapter title on first page"""
        p0 = self.doc[0]
        text = p0.get_text("text")
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        
        # Look for line after CHAPTER ONE / CHAPTER 1
        for i, line in enumerate(lines):
            if re.match(r'^CHAPTER\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|\d+)', line, re.IGNORECASE):
                if i + 1 < len(lines):
                    return lines[i + 1].title()
        return f"Chapter {self.chapter_num}"

    def _extract_sections_and_blocks(self) -> List[Dict[str, Any]]:
        """
        Parses pages into sequential sections, containing paragraphs.
        """
        sections: List[Dict[str, Any]] = []
        current_section: Optional[Dict[str, Any]] = None

        for page_idx in range(self.total_pages):
            page_num = page_idx + 1
            page = self.doc[page_idx]
            blocks = page.get_text("blocks")

            for b_idx, b in enumerate(blocks):
                # b: (x0, y0, x1, y1, text, block_no, block_type)
                if b[6] != 0:  # Skip image blocks here
                    continue

                raw_text = b[4].strip()
                if not raw_text:
                    continue

                # Filter out running headers/footers e.g. "PHYSICS", "2024-25", page numbers
                if re.match(r'^(PHYSICS|\d+|Reprint|Rationalised|\d{4}-\d{2})$', raw_text, re.IGNORECASE):
                    continue

                # Check if block is a chapter-end boundary (SUMMARY, POINTS TO PONDER, or EXERCISES)
                # In NCERT, these appear as standalone headings in the final pages of the chapter
                is_chapter_end = (
                    page_num >= 4 and 
                    re.match(r'^(SUMMARY|POINTS TO PONDER|EXERCISES|ADDITIONAL EXERCISES)\s*$', raw_text.strip(), re.IGNORECASE)
                )
                if is_chapter_end:
                    current_section = {
                        "section_number": f"{self.chapter_num}.exercises",
                        "title": raw_text.split('\n')[0].title(),
                        "page_start": page_num,
                        "page_end": page_num,
                        "blocks": []
                    }
                    sections.append(current_section)
                    continue

                # Normal section header check
                sec_match = re.match(rf'^{self.chapter_num}\.(\d+)\s+([A-Z][A-Z\s,\-–()]+)', raw_text)
                if sec_match and not raw_text.startswith(('TABLE', 'FIG')):
                    # Only treat as section if not in exercises and title is meaningful (> 3 letters)
                    sec_subnum = sec_match.group(1)
                    sec_num = f"{self.chapter_num}.{sec_subnum}"
                    sec_title = sec_match.group(2).strip().split('\n')[0]
                    
                    if len(sec_title) >= 3 and not (current_section and current_section["section_number"].endswith("exercises")):
                        # Check if section already exists (e.g. Page split header)
                        existing = next((s for s in sections if s["section_number"] == sec_num), None)
                        if existing:
                            current_section = existing
                            current_section["page_end"] = max(current_section["page_end"], page_num)
                        else:
                            current_section = {
                                "section_number": sec_num,
                                "title": sec_title.title(),
                                "page_start": page_num,
                                "page_end": page_num,
                                "blocks": []
                            }
                            sections.append(current_section)
                        
                        remaining = raw_text[sec_match.end():].strip()
                        if remaining and len(remaining) > 15:
                            current_section["blocks"].append({
                                "source_block_id": f"pdf_{self.book_code}_p{page_num}_b{b_idx}",
                                "page": page_num,
                                "type": "paragraph",
                                "raw_text": remaining,
                                "normalized_text": self._normalize_text(remaining)
                            })
                        continue

                # If we have an active section, add block as paragraph or note
                if current_section is not None:
                    current_section["page_end"] = max(current_section["page_end"], page_num)
                    
                    # Skip standalone figure captions and table headers from paragraph flow
                    if re.match(r'^Fig(?:ure)?\.?\s*\d+\.\d+', raw_text, re.IGNORECASE):
                        continue
                    if re.match(r'^Table\s*\d+\.\d+', raw_text, re.IGNORECASE):
                        continue

                    # Classify block type
                    block_type = "paragraph"
                    if raw_text.startswith("Example ") or "Example " in raw_text[:15]:
                        block_type = "example"
                    elif "definition" in raw_text.lower()[:30]:
                        block_type = "definition"

                    current_section["blocks"].append({
                        "source_block_id": f"pdf_{self.book_code}_p{page_num}_b{b_idx}",
                        "page": page_num,
                        "type": block_type,
                        "raw_text": raw_text,
                        "normalized_text": self._normalize_text(raw_text)
                    })
                else:
                    # Before first section heading (preamble/intro)
                    if len(raw_text) > 20 and not raw_text.startswith("CHAPTER"):
                        current_section = {
                            "section_number": f"{self.chapter_num}.1",
                            "title": "Introduction",
                            "page_start": page_num,
                            "page_end": page_num,
                            "blocks": [{
                                "source_block_id": f"pdf_{self.book_code}_p{page_num}_b{b_idx}",
                                "page": page_num,
                                "type": "paragraph",
                                "raw_text": raw_text,
                                "normalized_text": self._normalize_text(raw_text)
                            }]
                        }
                        sections.append(current_section)

        return sections

    def _extract_figures(self) -> List[Dict[str, Any]]:
        """Extracts figures with page and caption"""
        figures = []
        fig_pattern = re.compile(rf'Fig(?:ure)?\.?\s*({self.chapter_num}\.\d+)\s*[:\.]?\s*([^\n\r]+(?:\n[^\n\r]+)?)', re.IGNORECASE)

        for page_idx in range(self.total_pages):
            page_num = page_idx + 1
            text = self.doc[page_idx].get_text("text")

            for m in fig_pattern.finditer(text):
                fig_num = m.group(1)
                caption = m.group(2).strip().replace('\n', ' ')
                # Avoid duplicates on same page
                if not any(f["fig_number"] == fig_num and f["page"] == page_num for f in figures):
                    figures.append({
                        "fig_number": f"Fig. {fig_num}",
                        "clean_num": fig_num,
                        "caption": caption[:200],
                        "page": page_num,
                        "source_id": f"pdf_fig_{self.book_code}_{fig_num.replace('.', '_')}"
                    })
        return figures

    def _extract_tables(self) -> List[Dict[str, Any]]:
        """Extracts tables with page and title"""
        tables = []
        tbl_pattern = re.compile(rf'Table\s*({self.chapter_num}\.\d+)\s*[:\.]?\s*([^\n\r]+)', re.IGNORECASE)

        for page_idx in range(self.total_pages):
            page_num = page_idx + 1
            text = self.doc[page_idx].get_text("text")

            for m in tbl_pattern.finditer(text):
                tbl_num = m.group(1)
                title = m.group(2).strip()
                if not any(t["table_number"] == tbl_num and t["page"] == page_num for t in tables):
                    tables.append({
                        "table_number": f"Table {tbl_num}",
                        "clean_num": tbl_num,
                        "title": title[:200],
                        "page": page_num,
                        "source_id": f"pdf_tbl_{self.book_code}_{tbl_num.replace('.', '_')}"
                    })
        return tables

    def _extract_formulas(self) -> List[Dict[str, Any]]:
        """Extracts numbered formulas e.g. (1.1), (2.3)"""
        formulas = []
        eq_pattern = re.compile(rf'([^\n\r]{{3,80}}?)\s*\({self.chapter_num}\.(\d+[a-z]?)\)')

        for page_idx in range(self.total_pages):
            page_num = page_idx + 1
            text = self.doc[page_idx].get_text("text")

            for m in eq_pattern.finditer(text):
                eq_text = m.group(1).strip()
                eq_num = f"({self.chapter_num}.{m.group(2)})"
                if '=' in eq_text or '≈' in eq_text or '∝' in eq_text or len(eq_text) > 3:
                    formulas.append({
                        "equation_number": eq_num,
                        "expression": eq_text,
                        "page": page_num,
                        "source_id": f"pdf_eq_{self.book_code}_{m.group(2)}"
                    })
        return formulas

    @staticmethod
    def _normalize_text(text: str) -> str:
        """
        Harmless text normalization preserving scientific terminology, numbers, formulas:
        - merges hyphenated linebreaks (e.g. meas-\nurement -> measurement)
        - collapses multiple spaces and linebreaks
        - normalizes unicode dashes and quotes
        """
        if not text:
            return ""
        s = text
        # Hyphen at end of line followed by lowercase
        s = re.sub(r'(\w+)-\s*\n\s*([a-z]\w*)', r'\1\2', s)
        # Replace newlines with space
        s = s.replace('\n', ' ').replace('\r', ' ')
        # Collapse multiple spaces
        s = re.sub(r'\s+', ' ', s)
        # Unicode quote normalization
        s = s.replace('“', '"').replace('”', '"').replace('’', "'").replace('‘', "'")
        return s.strip()
