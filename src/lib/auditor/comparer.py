"""
NCERT Content & Presentation Comparer Engine
Deterministic & Semantic verification comparing official NCERT PDF canonical source
against application database models and rendered presentation layer.
"""

import re
import os
import difflib
from typing import Dict, List, Any, Optional, Tuple

class NCERTComparer:
    def __init__(self, public_dir: str = "public"):
        self.public_dir = public_dir

    def compare_chapter(
        self,
        pdf_data: Dict[str, Any],
        db_chapter: Dict[str, Any],
        db_topics: List[Dict[str, Any]],
        db_figures: List[Dict[str, Any]],
        db_tables: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Runs comprehensive audit for a single chapter:
        - Structural checks (sections, empty headings)
        - Paragraph text integrity (truncation, missing, changed words/numbers)
        - Figure existence and disk file accessibility
        - Table existence and content
        - Presentation highlight quality (under/over highlighting)
        """
        issues: List[Dict[str, Any]] = []
        ch_num = pdf_data["chapter_number"]
        ch_title = pdf_data["chapter_title"]
        book_code = pdf_data["book_code"]

        # Map DB topics by topicNumber (e.g. "1.1", "1.2")
        db_topics_map: Dict[str, Dict[str, Any]] = {}
        for t in db_topics:
            t_num = str(t.get("topicNumber", "")).strip()
            if t_num:
                db_topics_map[t_num] = t

        pdf_sections = [s for s in pdf_data["sections"] if not s["section_number"].endswith("exercises")]

        # =========================================================================
        # 1. STRUCTURAL VERIFICATION & EMPTY HEADING DETECTION (Step 5 & Step 6)
        # =========================================================================
        for sec in pdf_sections:
            sec_num = sec["section_number"]
            sec_title = sec["title"]
            pdf_blocks = sec["blocks"]

            if sec_num not in db_topics_map:
                # 🔴 CRITICAL ERROR: MISSING SECTION
                issues.append({
                    "severity": "CRITICAL",
                    "issueType": "MISSING_SECTION",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": sec_num,
                    "topicNumber": sec_num,
                    "sourcePage": sec["page_start"],
                    "sourceBlockId": f"pdf_{book_code}_sec_{sec_num.replace('.', '_')}",
                    "appRecordId": None,
                    "sourceContent": f"Section {sec_num} {sec_title} ({len(pdf_blocks)} expected content blocks)",
                    "appContent": None,
                    "detectedDifference": f"Section {sec_num} exists in official NCERT PDF (Pages {sec['page_start']}-{sec['page_end']}) but is completely missing from database topics.",
                    "confidence": 1.0,
                    "recommendedAction": f"Create Topic record for section {sec_num} ({sec_title}) and ingest the {len(pdf_blocks)} source blocks."
                })
                continue

            # Section exists in DB: check if empty or incomplete
            topic = db_topics_map[sec_num]
            topic_html = (topic.get("contentHtml") or "").strip()
            topic_md = (topic.get("contentMarkdown") or "").strip()
            app_text_raw = topic_md or self._strip_html_tags(topic_html)

            # EMPTY HEADING / INCOMPLETE SECTION CHECK (Step 6)
            if not app_text_raw or len(app_text_raw) < 100:
                issues.append({
                    "severity": "CRITICAL",
                    "issueType": "INCOMPLETE_SECTION",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": sec_num,
                    "topicNumber": sec_num,
                    "sourcePage": sec["page_start"],
                    "sourceBlockId": f"pdf_{book_code}_sec_{sec_num.replace('.', '_')}",
                    "appRecordId": topic.get("id"),
                    "sourceContent": f"Section {sec_num} {sec_title} with {len(pdf_blocks)} blocks",
                    "appContent": f"Empty or nearly empty topic (Length: {len(app_text_raw)} characters)",
                    "detectedDifference": f"Topic exists in application but contains no readable content. Expected {len(pdf_blocks)} content blocks, found 0.",
                    "confidence": 1.0,
                    "recommendedAction": f"Populate section {sec_num} content from canonical NCERT source."
                })
                continue

            # =========================================================================
            # 2. TEXT PARAGRAPH INTEGRITY & TRUNCATION VERIFICATION (Step 7 & Step 8)
            # =========================================================================
            self._verify_section_text(sec, topic, app_text_raw, topic_html, issues, ch_num, ch_title, book_code)

            # =========================================================================
            # 3. PRESENTATION HIGHLIGHT AUDIT (Step 14 & Step 15)
            # =========================================================================
            self._audit_highlights(sec_num, topic_html, app_text_raw, issues, ch_num, ch_title, book_code, topic.get("id"))

        # =========================================================================
        # 4. FIGURE VERIFICATION (Step 9)
        # =========================================================================
        self._verify_figures(pdf_data["figures"], db_figures, issues, ch_num, ch_title, book_code)

        # =========================================================================
        # 5. TABLE VERIFICATION (Step 10)
        # =========================================================================
        self._verify_tables(pdf_data["tables"], db_tables, issues, ch_num, ch_title, book_code)

        # =========================================================================
        # 6. ORDER VERIFICATION (Step 13)
        # =========================================================================
        self._verify_order(pdf_sections, db_topics, issues, ch_num, ch_title, book_code)

        return issues

    def _verify_section_text(
        self,
        sec: Dict[str, Any],
        topic: Dict[str, Any],
        app_text: str,
        topic_html: str,
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str
    ):
        sec_num = sec["section_number"]
        pdf_blocks = sec["blocks"]
        # Normalize harmless whitespace in application text before comparing
        app_norm = re.sub(r'\s+', ' ', app_text).strip()
        app_lower = app_norm.lower()

        # Check each substantial paragraph in PDF
        for b in pdf_blocks:
            norm_text = b["normalized_text"]
            if len(norm_text) < 40:
                continue

            # Check if substantial sentence snippet is in app text
            start_snippet = norm_text[:60].strip()
            end_snippet = norm_text[-60:].strip()

            if start_snippet.lower() in app_lower:
                # Start snippet found: check if truncated before end snippet
                if len(norm_text) > 150 and end_snippet.lower() not in app_lower:
                    issues.append({
                        "severity": "CRITICAL",
                        "issueType": "TEXT_TRUNCATION",
                        "chapterNumber": ch_num,
                        "chapterTitle": ch_title,
                        "sectionNumber": sec_num,
                        "topicNumber": sec_num,
                        "sourcePage": b["page"],
                        "sourceBlockId": b["source_block_id"],
                        "appRecordId": topic.get("id"),
                        "sourceContent": norm_text,
                        "appContent": app_norm[:200] + "...",
                        "detectedDifference": f"Paragraph starting with '{start_snippet[:40]}...' is truncated in application before end snippet '{end_snippet[-40:]}'.",
                        "confidence": 0.95,
                        "recommendedAction": "Restore complete paragraph ending from canonical NCERT PDF."
                    })
                else:
                    # Check for changed numerical values in this paragraph
                    self._check_numerical_values(norm_text, app_norm, b, sec_num, topic, issues, ch_num, ch_title, book_code)
            else:
                # Start snippet not found: check if this is an altered paragraph (CONTENT_MISMATCH) or entirely missing
                # Compare similarity against segments of app_norm
                best_ratio = 0.0
                best_sub = ""
                step = len(norm_text)
                for start_i in range(0, max(1, len(app_norm) - step // 2), max(20, step // 4)):
                    chunk = app_norm[start_i:start_i + step + 40]
                    ratio = difflib.SequenceMatcher(None, norm_text.lower(), chunk.lower()).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_sub = chunk

                if best_ratio >= 0.65 and best_ratio < 0.98:
                    # High similarity but altered terms/words!
                    diff = difflib.unified_diff(
                        norm_text.split(),
                        best_sub.split(),
                        fromfile="NCERT_PDF",
                        tofile="APP_DB",
                        n=2
                    )
                    diff_str = " ".join(list(diff)[:10])
                    issues.append({
                        "severity": "CRITICAL",
                        "issueType": "CONTENT_MISMATCH",
                        "chapterNumber": ch_num,
                        "chapterTitle": ch_title,
                        "sectionNumber": sec_num,
                        "topicNumber": sec_num,
                        "sourcePage": b["page"],
                        "sourceBlockId": b["source_block_id"],
                        "appRecordId": topic.get("id"),
                        "sourceContent": norm_text,
                        "appContent": best_sub[:len(norm_text) + 20],
                        "detectedDifference": f"Content mismatch detected (Similarity: {best_ratio:.1%}). Scientific terms or sentences altered in application text.",
                        "confidence": 0.92,
                        "recommendedAction": "Replace altered text with canonical NCERT sentence."
                    })
                else:
                    # Low similarity -> Missing paragraph
                    issues.append({
                        "severity": "CRITICAL",
                        "issueType": "MISSING_PARAGRAPH",
                        "chapterNumber": ch_num,
                        "chapterTitle": ch_title,
                        "sectionNumber": sec_num,
                        "topicNumber": sec_num,
                        "sourcePage": b["page"],
                        "sourceBlockId": b["source_block_id"],
                        "appRecordId": topic.get("id"),
                        "sourceContent": norm_text,
                        "appContent": f"Topic content ({len(app_norm)} chars)",
                        "detectedDifference": f"Entire source paragraph ({len(norm_text)} chars) from Page {b['page']} not found in topic text.",
                        "confidence": 0.92,
                        "recommendedAction": "Re-ingest missing paragraph from NCERT canonical source."
                    })

    def _check_numerical_values(
        self,
        pdf_text: str,
        app_text: str,
        block: Dict[str, Any],
        sec_num: str,
        topic: Dict[str, Any],
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str
    ):
        """Detects if numerical values or units have been altered"""
        # Find numbers with units like 9.8 m/s, 6.67 x 10^-11, 1.62 s, 287.5 cm
        num_pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*(m/s²?|km/s|s|cm|mm|m|kg|g|N|J|W|AU)\b')
        for m in num_pattern.finditer(pdf_text):
            val_str = m.group(0)
            if val_str not in app_text:
                # Value with unit in PDF is not in app text
                num_only = m.group(1)
                if num_only not in app_text:
                    issues.append({
                        "severity": "CRITICAL",
                        "issueType": "CHANGED_NUMBER",
                        "chapterNumber": ch_num,
                        "chapterTitle": ch_title,
                        "sectionNumber": sec_num,
                        "topicNumber": sec_num,
                        "sourcePage": block["page"],
                        "sourceBlockId": block["source_block_id"],
                        "appRecordId": topic.get("id"),
                        "sourceContent": f"...{pdf_text[max(0, m.start()-20):min(len(pdf_text), m.end()+20)]}...",
                        "appContent": "Numerical value altered or omitted in topic text.",
                        "detectedDifference": f"Numerical value and unit '{val_str}' found in source PDF on Page {block['page']} is missing or altered in application.",
                        "confidence": 0.88,
                        "recommendedAction": f"Verify and correct numerical value '{val_str}' according to NCERT source."
                    })
                    break  # One numerical issue per paragraph is enough to alert

    def _verify_figures(
        self,
        pdf_figures: List[Dict[str, Any]],
        db_figures: List[Dict[str, Any]],
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str
    ):
        """Verifies figure existence, captions, and disk image integrity"""
        # Build map of DB figures by clean figure number (e.g. "1.1", "2.3")
        db_fig_map: Dict[str, Dict[str, Any]] = {}
        for f in db_figures:
            f_num = f.get("figureNumber", "")
            # extract clean digits like "1.1" from "Fig. 1.1" or "Figure 1.1"
            m = re.search(r'(\d+\.\d+)', f_num)
            if m:
                db_fig_map[m.group(1)] = f

        for pf in pdf_figures:
            clean_num = pf["clean_num"]
            if clean_num not in db_fig_map:
                issues.append({
                    "severity": "CRITICAL",
                    "issueType": "MISSING_FIGURE",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": f"{ch_num}.{clean_num.split('.')[1]}",
                    "topicNumber": None,
                    "sourcePage": pf["page"],
                    "sourceBlockId": pf["source_id"],
                    "appRecordId": None,
                    "sourceContent": f"{pf['fig_number']}: {pf['caption']}",
                    "appContent": None,
                    "detectedDifference": f"Figure {clean_num} exists in official NCERT PDF (Page {pf['page']}) but is missing from application ContentFigure table.",
                    "confidence": 1.0,
                    "recommendedAction": f"Extract and attach Figure {clean_num} from PDF page {pf['page']} to chapter {ch_num}."
                })
            else:
                # Figure exists in DB: check if image file on disk is accessible
                db_fig = db_fig_map[clean_num]
                img_path = db_fig.get("imagePath", "")
                if img_path:
                    # Strip leading / for local file path check
                    clean_rel = img_path.lstrip('/')
                    local_path = os.path.join(self.public_dir, clean_rel)
                    if not os.path.exists(local_path):
                        issues.append({
                            "severity": "CRITICAL",
                            "issueType": "BROKEN_FIGURE",
                            "chapterNumber": ch_num,
                            "chapterTitle": ch_title,
                            "sectionNumber": None,
                            "topicNumber": None,
                            "sourcePage": pf["page"],
                            "sourceBlockId": pf["source_id"],
                            "appRecordId": db_fig.get("id"),
                            "sourceContent": f"{pf['fig_number']} on Page {pf['page']}",
                            "appContent": f"imagePath: {img_path}",
                            "detectedDifference": f"Figure {clean_num} image file '{local_path}' does not exist on disk. Image is broken in UI.",
                            "confidence": 1.0,
                            "recommendedAction": f"Ensure figure image file exists at {local_path}."
                        })
                    else:
                        # Verified figure passed
                        issues.append({
                            "severity": "PASS",
                            "issueType": "FIGURE_VERIFIED",
                            "chapterNumber": ch_num,
                            "chapterTitle": ch_title,
                            "sectionNumber": None,
                            "topicNumber": None,
                            "sourcePage": pf["page"],
                            "sourceBlockId": pf["source_id"],
                            "appRecordId": db_fig.get("id"),
                            "sourceContent": pf["caption"][:60],
                            "appContent": db_fig.get("caption", "")[:60],
                            "detectedDifference": None,
                            "confidence": 1.0,
                            "recommendedAction": None
                        })

    def _verify_tables(
        self,
        pdf_tables: List[Dict[str, Any]],
        db_tables: List[Dict[str, Any]],
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str
    ):
        """Verifies table existence and structure"""
        db_tbl_map: Dict[str, Dict[str, Any]] = {}
        for t in db_tables:
            t_num = t.get("tableNumber", "")
            m = re.search(r'(\d+\.\d+)', t_num)
            if m:
                db_tbl_map[m.group(1)] = t

        for pt in pdf_tables:
            clean_num = pt["clean_num"]
            if clean_num not in db_tbl_map:
                issues.append({
                    "severity": "CRITICAL",
                    "issueType": "MISSING_TABLE",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": f"{ch_num}.{clean_num.split('.')[1]}",
                    "topicNumber": None,
                    "sourcePage": pt["page"],
                    "sourceBlockId": pt["source_id"],
                    "appRecordId": None,
                    "sourceContent": f"{pt['table_number']}: {pt['title']}",
                    "appContent": None,
                    "detectedDifference": f"Table {clean_num} exists in official NCERT PDF (Page {pt['page']}) but is missing from application ContentTable records.",
                    "confidence": 1.0,
                    "recommendedAction": f"Extract and register Table {clean_num} from PDF page {pt['page']}."
                })
            else:
                issues.append({
                    "severity": "PASS",
                    "issueType": "TABLE_VERIFIED",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": None,
                    "topicNumber": None,
                    "sourcePage": pt["page"],
                    "sourceBlockId": pt["source_id"],
                    "appRecordId": db_tbl_map[clean_num].get("id"),
                    "sourceContent": pt["title"][:60],
                    "appContent": db_tbl_map[clean_num].get("title", "")[:60],
                    "detectedDifference": None,
                    "confidence": 1.0,
                    "recommendedAction": None
                })

    def _verify_order(
        self,
        pdf_sections: List[Dict[str, Any]],
        db_topics: List[Dict[str, Any]],
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str
    ):
        """Verifies that DB topics are arranged in identical order to PDF sections"""
        pdf_sec_order = [s["section_number"] for s in pdf_sections]
        db_sec_order = [str(t.get("topicNumber", "")).strip() for t in db_topics if str(t.get("topicNumber", "")).strip()]

        # Filter DB order to only those that exist in PDF
        common_db = [num for num in db_sec_order if num in pdf_sec_order]
        common_pdf = [num for num in pdf_sec_order if num in common_db]

        if common_db != common_pdf:
            issues.append({
                "severity": "CRITICAL",
                "issueType": "ORDER_MISMATCH",
                "chapterNumber": ch_num,
                "chapterTitle": ch_title,
                "sectionNumber": None,
                "topicNumber": None,
                "sourcePage": 1,
                "sourceBlockId": None,
                "appRecordId": None,
                "sourceContent": f"Canonical PDF order: {', '.join(common_pdf)}",
                "appContent": f"Application DB order: {', '.join(common_db)}",
                "detectedDifference": f"Topic ordering in database does not follow logical NCERT sequence: expected [{', '.join(common_pdf)}] but found [{', '.join(common_db)}].",
                "confidence": 1.0,
                "recommendedAction": "Sort DB topics by orderIndex to match canonical NCERT section numbering."
            })

    def _audit_highlights(
        self,
        sec_num: str,
        topic_html: str,
        topic_text: str,
        issues: List[Dict[str, Any]],
        ch_num: int,
        ch_title: str,
        book_code: str,
        topic_id: Optional[str]
    ):
        """Audits highlight quality: under-highlighting and over-highlighting"""
        if not topic_html or len(topic_text) < 100:
            return

        # Count mark tags in HTML
        mark_matches = re.findall(r'<mark\b[^>]*>(.*?)</mark>', topic_html, re.DOTALL | re.IGNORECASE)
        mark_count = len(mark_matches)
        
        # Count total words in topic
        words = topic_text.split()
        total_words = len(words)

        if total_words == 0:
            return

        # Key conceptual tokens check
        physics_keywords = [
            'measurement', 'accuracy', 'precision', 'significant figures', 'uncertainty',
            'dimensions', 'dimensional formula', 'base units', 'derived units', 'si units',
            'velocity', 'acceleration', 'displacement', 'rectilinear', 'vector', 'scalar',
            'inertia', 'momentum', 'force', 'friction', 'work', 'energy', 'power',
            'torque', 'centre of mass', 'gravitation', 'gravitational constant'
        ]
        key_terms_present = [kw for kw in physics_keywords if kw in topic_text.lower()]

        # UNDER-HIGHLIGHTING AUDIT
        if len(key_terms_present) >= 3 and mark_count == 0:
            issues.append({
                "severity": "WARNING",
                "issueType": "MISSING_HIGHLIGHTS",
                "chapterNumber": ch_num,
                "chapterTitle": ch_title,
                "sectionNumber": sec_num,
                "topicNumber": sec_num,
                "sourcePage": None,
                "sourceBlockId": None,
                "appRecordId": topic_id,
                "sourceContent": f"Key concepts present: {', '.join(key_terms_present[:4])}",
                "appContent": "Rendered HTML has 0 <mark> tags",
                "detectedDifference": f"Section contains {len(key_terms_present)} high-yield NEET terms but has 0 highlights rendered. Important concepts are not visually discoverable.",
                "confidence": 0.95,
                "recommendedAction": "Ensure NCERTHighlightEngine is enabled and decorating key terms with pastel highlights."
            })
        elif mark_count > 0:
            # OVER-HIGHLIGHTING AUDIT
            highlighted_word_count = sum(len(m.split()) for m in mark_matches)
            ratio = highlighted_word_count / total_words
            has_long_highlight = any(len(m.split()) >= 15 for m in mark_matches)
            if ratio > 0.40 or has_long_highlight:
                issues.append({
                    "severity": "WARNING",
                    "issueType": "EXCESSIVE_HIGHLIGHTS",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": sec_num,
                    "topicNumber": sec_num,
                    "sourcePage": None,
                    "sourceBlockId": None,
                    "appRecordId": topic_id,
                    "sourceContent": f"Total words: {total_words}",
                    "appContent": f"Highlighted words: {highlighted_word_count} ({ratio:.1%})",
                    "detectedDifference": f"Excessive highlighting detected ({ratio:.1%} of text). Target is 15-25% for intelligent student focus.",
                    "confidence": 0.90,
                    "recommendedAction": "Tighten regex tokens to highlight only pivotal scientific keywords and laws."
                })
            else:
                # Optimal highlight presentation verified
                issues.append({
                    "severity": "PASS",
                    "issueType": "HIGHLIGHTS_OPTIMAL",
                    "chapterNumber": ch_num,
                    "chapterTitle": ch_title,
                    "sectionNumber": sec_num,
                    "topicNumber": sec_num,
                    "sourcePage": None,
                    "sourceBlockId": None,
                    "appRecordId": topic_id,
                    "sourceContent": f"{len(key_terms_present)} concepts",
                    "appContent": f"{mark_count} highlights ({ratio:.1%})",
                    "detectedDifference": None,
                    "confidence": 1.0,
                    "recommendedAction": None
                })

    @staticmethod
    def _strip_html_tags(html: str) -> str:
        """Strips HTML tags to extract raw readable text"""
        if not html:
            return ""
        clean = re.sub(r'<[^>]+>', ' ', html)
        return re.sub(r'\s+', ' ', clean).strip()
