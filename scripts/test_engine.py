import sqlite3
import re

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT contentHtml, title FROM Topic WHERE id = 'TOPIC_KEPH101_1_3'")
row = c.fetchone()
raw = row[0]
title = row[1]

# NEET_DIFFICULT_WORDS_DICTIONARY keys for physics Ch 1
dict_words = {
  'measurement': {'term': 'Measurement', 'hindi': 'मापन (किसी भौतिक राशि की मानक मात्रक से तुलना)'},
  'accuracy': {'term': 'Accuracy', 'hindi': 'परिशुद्धता (मापे गए मान का वास्तविक मान के निकट होना)'},
  'precision': {'term': 'Precision', 'hindi': 'यथार्थता (समान राशि के विभिन्न मापों की परस्पर निकटता)'},
  'significant': {'term': 'Significant Figures', 'hindi': 'सार्थक अंक (विश्वसनीय अंक + पहला अनिश्चित अंक)'},
  'uncertainty': {'term': 'Uncertainty', 'hindi': 'अनिश्चितता (मापन में संभावित त्रुटि या विचलन की सीमा)'},
  'dimension': {'term': 'Dimension', 'hindi': 'विमा (मूल राशियों पर लगाई जाने वाली घातें)'},
  'homogeneity': {'term': 'Principle of Homogeneity', 'hindi': 'समांगता का सिद्धांत'},
  'fundamental': {'term': 'Fundamental Quantities', 'hindi': 'मूल राशियाँ'},
  'derived': {'term': 'Derived Quantities', 'hindi': 'व्युत्पन्न राशियाँ'},
  'system': {'term': 'System of Units', 'hindi': 'मात्रक प्रणाली'},
  'base': {'term': 'Base Units', 'hindi': 'मूल मात्रक'},
  'error': {'term': 'Error', 'hindi': 'त्रुटि'},
  'systematic': {'term': 'Systematic Error', 'hindi': 'क्रमबद्ध त्रुटि'},
  'random': {'term': 'Random Error', 'hindi': 'यादृच्छिक त्रुटि'},
  'least': {'term': 'Least Count', 'hindi': 'अल्पतमांक'},
  'relative': {'term': 'Relative Error', 'hindi': 'आपेक्षिक त्रुटि'},
  'percentage': {'term': 'Percentage Error', 'hindi': 'प्रतिशत त्रुटि'},
}

lower_text = raw.lower()
found_words = []
for key, obj in dict_words.items():
    if re.search(r'\b' + key + r'\b', lower_text):
        found_words.append(obj['term'])

print("Matched Difficult Words:", len(found_words), found_words)
conn.close()
