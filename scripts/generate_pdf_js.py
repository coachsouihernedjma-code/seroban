import sys, json
sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\youcef\project\src\data\pdfProblems.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Generate JS file
lines = ['// Auto-generated from PDF files — DO NOT EDIT MANUALLY']
lines.append('// Each key corresponds to a category ID (e.g. prep, l1-1, l2-1, etc.)')
lines.append('')
lines.append('export const pdfProblems = {')

for key, problems in data.items():
    lines.append(f'  "{key}": [')
    for p in problems:
        p_str = json.dumps(p, ensure_ascii=False, separators=(',', ':'))
        lines.append(f'    {p_str},')
    lines.append('  ],')

lines.append('};')
lines.append('')

js_content = '\n'.join(lines)

with open(r'd:\youcef\project\src\data\pdfProblems.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print('pdfProblems.js created!')
total = sum(len(v) for v in data.values())
print(f'Total problems: {total}')
for k, v in data.items():
    print(f'  {k}: {len(v)}')
