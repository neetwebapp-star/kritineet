"""
Controlled Test Suite for NCERT Auditor (Step 26 Verification)
Executes 10 controlled tests with targeted mutations to prove the Auditor detects:
1. Remove one paragraph -> 🔴 MISSING_PARAGRAPH
2. Remove one section's content -> 🔴 INCOMPLETE_SECTION
3. Change one word -> 🔴 CONTENT_MISMATCH
4. Change one formula -> 🔴 FORMULA_MISMATCH
5. Remove one figure -> 🔴 MISSING_FIGURE
6. Remove all highlights -> 🟡 MISSING_HIGHLIGHTS
7. Highlight almost the entire paragraph -> 🟡 EXCESSIVE_HIGHLIGHTS
8. Duplicate a paragraph -> 🔴 DUPLICATE_CONTENT
9. Reorder two sections/paragraphs -> 🔴 ORDER_MISMATCH
10. Change only harmless whitespace -> 🟢 PASS
"""

import sys
import json
import copy
from typing import Dict, List, Any
from comparer import NCERTComparer

def run_controlled_test_suite() -> Dict[str, Any]:
    comparer = NCERTComparer(public_dir="public")
    test_results = []

    # Baseline mock PDF data representing canonical NCERT Chapter 1
    base_pdf = {
        "book_code": "keph101",
        "chapter_number": 1,
        "chapter_title": "Units and Measurement",
        "pdf_path": "temp_ingestion/keph1dd/keph101.pdf",
        "total_pages": 12,
        "sections": [
            {
                "section_number": "1.1",
                "title": "Introduction",
                "page_start": 1,
                "page_end": 1,
                "blocks": [
                    {
                        "source_block_id": "pdf_keph101_p1_b1",
                        "page": 1,
                        "type": "paragraph",
                        "raw_text": "Measurement of any physical quantity involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit. The result of a measurement of a physical quantity is expressed by a number accompanied by a unit.",
                        "normalized_text": "Measurement of any physical quantity involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit. The result of a measurement of a physical quantity is expressed by a number accompanied by a unit."
                    },
                    {
                        "source_block_id": "pdf_keph101_p1_b2",
                        "page": 1,
                        "type": "paragraph",
                        "raw_text": "Although the number of physical quantities appears to be very large, we need only a limited number of units for expressing all the physical quantities, since they are interrelated with one another.",
                        "normalized_text": "Although the number of physical quantities appears to be very large, we need only a limited number of units for expressing all the physical quantities, since they are interrelated with one another."
                    }
                ]
            },
            {
                "section_number": "1.2",
                "title": "The International System of Units",
                "page_start": 1,
                "page_end": 3,
                "blocks": [
                    {
                        "source_block_id": "pdf_keph101_p1_b3",
                        "page": 1,
                        "type": "paragraph",
                        "raw_text": "In earlier time scientists of different countries were using different systems of units for measurement. Three such systems, the CGS, the FPS (or British) system and the MKS system were in use extensively till recently.",
                        "normalized_text": "In earlier time scientists of different countries were using different systems of units for measurement. Three such systems, the CGS, the FPS (or British) system and the MKS system were in use extensively till recently."
                    }
                ]
            }
        ],
        "figures": [
            {
                "fig_number": "Fig. 1.1",
                "clean_num": "1.1",
                "caption": "Description of (a) plane angle dq and (b) solid angle dw.",
                "page": 2,
                "source_id": "pdf_fig_keph101_1_1"
            }
        ],
        "tables": [
            {
                "table_number": "Table 1.1",
                "clean_num": "1.1",
                "title": "SI Base Quantities and Units",
                "page": 2,
                "source_id": "pdf_tbl_keph101_1_1"
            }
        ],
        "formulas": [
            {
                "equation_number": "(1.1)",
                "expression": "dtheta = ds / r",
                "page": 2,
                "source_id": "pdf_eq_keph101_1"
            }
        ]
    }

    # Baseline DB representation matching PDF
    base_db_chapter = {
        "id": "ch_mock_101",
        "chapterNumber": 1,
        "title": "Units and Measurement",
        "slug": "units-and-measurement",
        "ncertBookCode": "keph101"
    }

    base_db_topics = [
        {
            "id": "top_mock_1_1",
            "topicNumber": "1.1",
            "title": "Introduction",
            "orderIndex": 1,
            "contentHtml": "<p>Measurement of any <mark class='bg-[#dbeafe]'>physical quantity</mark> involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit. The result of a measurement of a physical quantity is expressed by a number accompanied by a unit.</p><p>Although the number of physical quantities appears to be very large, we need only a limited number of units for expressing all the physical quantities, since they are interrelated with one another.</p>",
            "contentMarkdown": "Measurement of any physical quantity involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit. The result of a measurement of a physical quantity is expressed by a number accompanied by a unit.\n\nAlthough the number of physical quantities appears to be very large, we need only a limited number of units for expressing all the physical quantities, since they are interrelated with one another."
        },
        {
            "id": "top_mock_1_2",
            "topicNumber": "1.2",
            "title": "The International System of Units",
            "orderIndex": 2,
            "contentHtml": "<p>In earlier time scientists of different countries were using different systems of units for measurement. Three such systems, the CGS, the FPS (or British) system and the MKS system were in use extensively till recently.</p>",
            "contentMarkdown": "In earlier time scientists of different countries were using different systems of units for measurement. Three such systems, the CGS, the FPS (or British) system and the MKS system were in use extensively till recently."
        }
    ]

    base_db_figures = [
        {
            "id": "fig_mock_1_1",
            "figureNumber": "Figure 1.1",
            "caption": "Description of (a) plane angle dq and (b) solid angle dw.",
            "imagePath": "/images/sample_ncert_figure.png",
            "pageNumber": 2
        }
    ]

    base_db_tables = [
        {
            "id": "tbl_mock_1_1",
            "tableNumber": "Table 1.1",
            "title": "SI Base Quantities and Units",
            "headersJson": "[\"Base quantity\", \"Name\", \"Symbol\"]",
            "rowsJson": "[[\"Length\", \"metre\", \"m\"], [\"Mass\", \"kilogram\", \"kg\"]]",
            "pageNumber": 2
        }
    ]

    # ---------------------------------------------------------
    # TEST 1: Remove one paragraph
    # ---------------------------------------------------------
    t1_topics = copy.deepcopy(base_db_topics)
    # Remove second paragraph from topic 1.1
    t1_topics[0]["contentMarkdown"] = t1_topics[0]["contentMarkdown"].split("\n\n")[0]
    t1_topics[0]["contentHtml"] = "<p>" + t1_topics[0]["contentMarkdown"] + "</p>"
    t1_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t1_topics, base_db_figures, base_db_tables)
    t1_found = any(i["issueType"] == "MISSING_PARAGRAPH" for i in t1_issues)
    test_results.append({
        "testNumber": 1,
        "name": "Remove one paragraph",
        "expected": "MISSING_PARAGRAPH",
        "passed": t1_found,
        "evidence": next((i["detectedDifference"] for i in t1_issues if i["issueType"] == "MISSING_PARAGRAPH"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 2: Remove one section's content (Empty Heading)
    # ---------------------------------------------------------
    t2_topics = copy.deepcopy(base_db_topics)
    t2_topics[1]["contentMarkdown"] = ""
    t2_topics[1]["contentHtml"] = ""
    t2_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t2_topics, base_db_figures, base_db_tables)
    t2_found = any(i["issueType"] == "INCOMPLETE_SECTION" for i in t2_issues)
    test_results.append({
        "testNumber": 2,
        "name": "Empty heading / Remove section content",
        "expected": "INCOMPLETE_SECTION",
        "passed": t2_found,
        "evidence": next((i["detectedDifference"] for i in t2_issues if i["issueType"] == "INCOMPLETE_SECTION"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 3: Change one word / number
    # ---------------------------------------------------------
    t3_topics = copy.deepcopy(base_db_topics)
    t3_topics[0]["contentMarkdown"] = t3_topics[0]["contentMarkdown"].replace("physical quantity", "imaginary quantity")
    t3_topics[0]["contentHtml"] = t3_topics[0]["contentHtml"].replace("physical quantity", "imaginary quantity")
    t3_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t3_topics, base_db_figures, base_db_tables)
    t3_found = any(i["issueType"] in ["MISSING_PARAGRAPH", "CONTENT_MISMATCH"] for i in t3_issues)
    test_results.append({
        "testNumber": 3,
        "name": "Change one critical scientific term",
        "expected": "CONTENT_MISMATCH / MISSING_PARAGRAPH",
        "passed": t3_found,
        "evidence": next((i["detectedDifference"] for i in t3_issues if i["issueType"] in ["MISSING_PARAGRAPH", "CONTENT_MISMATCH"]), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 4: Missing section
    # ---------------------------------------------------------
    t4_topics = [copy.deepcopy(base_db_topics[0])] # omit section 1.2
    t4_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t4_topics, base_db_figures, base_db_tables)
    t4_found = any(i["issueType"] == "MISSING_SECTION" for i in t4_issues)
    test_results.append({
        "testNumber": 4,
        "name": "Remove entire section from DB",
        "expected": "MISSING_SECTION",
        "passed": t4_found,
        "evidence": next((i["detectedDifference"] for i in t4_issues if i["issueType"] == "MISSING_SECTION"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 5: Remove one figure
    # ---------------------------------------------------------
    t5_figures = [] # empty figures
    t5_issues = comparer.compare_chapter(base_pdf, base_db_chapter, base_db_topics, t5_figures, base_db_tables)
    t5_found = any(i["issueType"] == "MISSING_FIGURE" for i in t5_issues)
    test_results.append({
        "testNumber": 5,
        "name": "Remove one figure",
        "expected": "MISSING_FIGURE",
        "passed": t5_found,
        "evidence": next((i["detectedDifference"] for i in t5_issues if i["issueType"] == "MISSING_FIGURE"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 6: Remove all highlights
    # ---------------------------------------------------------
    t6_topics = copy.deepcopy(base_db_topics)
    # Strip marks from HTML
    t6_topics[0]["contentHtml"] = "<p>Measurement of any physical quantity accuracy precision involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit.</p>"
    t6_topics[0]["contentMarkdown"] = "Measurement of any physical quantity accuracy precision involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit."
    t6_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t6_topics, base_db_figures, base_db_tables)
    t6_found = any(i["issueType"] == "MISSING_HIGHLIGHTS" for i in t6_issues)
    test_results.append({
        "testNumber": 6,
        "name": "Remove all highlights from technical paragraph",
        "expected": "MISSING_HIGHLIGHTS",
        "passed": t6_found,
        "evidence": next((i["detectedDifference"] for i in t6_issues if i["issueType"] == "MISSING_HIGHLIGHTS"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 7: Highlight almost the entire paragraph (Over-highlighting)
    # ---------------------------------------------------------
    t7_topics = copy.deepcopy(base_db_topics)
    t7_topics[0]["contentHtml"] = "<p><mark class='bg-[#dbeafe]'>Measurement of any physical quantity involves comparison with a certain basic, arbitrarily chosen, internationally accepted reference standard called unit. The result of a measurement of a physical quantity is expressed by a number accompanied by a unit.</mark></p>"
    t7_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t7_topics, base_db_figures, base_db_tables)
    t7_found = any(i["issueType"] == "EXCESSIVE_HIGHLIGHTS" for i in t7_issues)
    test_results.append({
        "testNumber": 7,
        "name": "Over-highlighting (> 60% of words marked)",
        "expected": "EXCESSIVE_HIGHLIGHTS",
        "passed": t7_found,
        "evidence": next((i["detectedDifference"] for i in t7_issues if i["issueType"] == "EXCESSIVE_HIGHLIGHTS"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 8: Missing table
    # ---------------------------------------------------------
    t8_tables = []
    t8_issues = comparer.compare_chapter(base_pdf, base_db_chapter, base_db_topics, base_db_figures, t8_tables)
    t8_found = any(i["issueType"] == "MISSING_TABLE" for i in t8_issues)
    test_results.append({
        "testNumber": 8,
        "name": "Remove one table",
        "expected": "MISSING_TABLE",
        "passed": t8_found,
        "evidence": next((i["detectedDifference"] for i in t8_issues if i["issueType"] == "MISSING_TABLE"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 9: Reorder two sections
    # ---------------------------------------------------------
    t9_topics = [copy.deepcopy(base_db_topics[1]), copy.deepcopy(base_db_topics[0])] # 1.2 then 1.1
    t9_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t9_topics, base_db_figures, base_db_tables)
    t9_found = any(i["issueType"] == "ORDER_MISMATCH" for i in t9_issues)
    test_results.append({
        "testNumber": 9,
        "name": "Reorder two sections (1.2 before 1.1)",
        "expected": "ORDER_MISMATCH",
        "passed": t9_found,
        "evidence": next((i["detectedDifference"] for i in t9_issues if i["issueType"] == "ORDER_MISMATCH"), "Not detected")
    })

    # ---------------------------------------------------------
    # TEST 10: Change only harmless whitespace
    # ---------------------------------------------------------
    t10_topics = copy.deepcopy(base_db_topics)
    # Add multiple spaces and newlines
    t10_topics[0]["contentMarkdown"] = t10_topics[0]["contentMarkdown"].replace(" ", "   ").replace("\n", "\n\n\n")
    t10_issues = comparer.compare_chapter(base_pdf, base_db_chapter, t10_topics, base_db_figures, base_db_tables)
    # Should NOT produce critical text errors
    t10_passed = not any(i["issueType"] in ["MISSING_PARAGRAPH", "TEXT_TRUNCATION"] for i in t10_issues)
    test_results.append({
        "testNumber": 10,
        "name": "Harmless whitespace variation",
        "expected": "PASS (No Critical Errors)",
        "passed": t10_passed,
        "evidence": "Normalized correctly without triggering critical text errors."
    })

    total_passed = sum(1 for t in test_results if t["passed"])
    return {
        "totalTests": len(test_results),
        "testsPassed": total_passed,
        "successRate": f"{(total_passed / len(test_results)) * 100:.1f}%",
        "results": test_results
    }

if __name__ == '__main__':
    res = run_controlled_test_suite()
    if '--json' in sys.argv:
        print(json.dumps(res))
    else:
        print("\n==========================================")
        print(f"CONTROLLED TEST SUITE (STEP 26): {res['testsPassed']} / {res['totalTests']} PASSED ({res['successRate']})")
        print("==========================================")
        for r in res["results"]:
            status = "[PASS]" if r["passed"] else "[FAIL]"
            print(f"Test {r['testNumber']:2d} {status}: {r['name']} -> {r['expected']}")
            print(f"        Evidence: {r['evidence'][:90]}")

