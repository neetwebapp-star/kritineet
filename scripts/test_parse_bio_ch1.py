import json
import re

def parse_bio_ch1():
    with open("temp_ingestion/bio_ch1_ocr.json", "r", encoding="utf-8") as f:
        pages = json.load(f)

    # Let's inspect the answer key on Page 38 (idx 37)
    ans_page = pages["37"]
    print("Answer page text snippet:")
    print(ans_page[ans_page.find("ANSWER KEY"):ans_page.find("ANSWER KEY") + 600])

    # Let's check how questions are formatted on Page 32 (idx 31)
    p31 = pages["31"]
    print("\nPage 32 snippet:")
    print(p31[:800])

if __name__ == '__main__':
    parse_bio_ch1()
