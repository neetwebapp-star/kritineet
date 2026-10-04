import os, re

def search_files(dir_path):
    results = []
    for root, dirs, files in os.walk(dir_path):
        for f in files:
            if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
                p = os.path.join(root, f)
                with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    # Check for chapter arrays or hardcoded lists
                    if re.search(r'chapters\s*=\s*\[', content, re.IGNORECASE) or \
                       re.search(r'CHAPTERS\s*:\s*\[', content) or \
                       re.search(r'export const .*CHAPTER', content) or \
                       re.search(r'chapterList', content, re.IGNORECASE):
                        results.append(p)
    return results

print('Files with chapter arrays:')
for r in search_files('src'):
    print(r)
