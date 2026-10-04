import re

html = '<p class="significant figures text-xs">Significant figures indicate the precision of measurement. Choice of units does not change significant figures.</p>'

pattern = r'\b(significant figures?|precision|measurement)\b'
safe_regex = re.compile(r'(<[^>]+>)|(' + pattern + ')', re.IGNORECASE)

def replace_fn(match):
    if match.group(1):
        return match.group(1) # Return HTML tag untouched
    return f'<mark class="bg-[#dbeafe]">{match.group(2)}</mark>'

highlighted = safe_regex.sub(replace_fn, html)
print("Original:", html)
print("Highlighted:", highlighted)
