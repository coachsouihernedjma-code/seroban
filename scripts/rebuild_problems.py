import pypdf
import re
import json

file_mapping = {
    'prep': 'pdf/تحضيري.pdf',
    'l1-1': 'pdf/م1ف1.pdf',
    'l1-2': 'pdf/م1ف2.pdf',
    'l1-3': 'pdf/م1ف3.pdf',
    'l1-4': 'pdf/م1ف4.pdf',
    'l2-1': 'pdf/م2ف1.pdf',
    'l2-2': 'pdf/م2ف2.pdf',
    'l3-1': 'pdf/م3ف1.pdf',
    'l3-2': 'pdf/م3ف2.pdf',
}

def parse_pdf_operations(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages])
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    
    problems_by_id = {}
    ordered_ids = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        ids = re.findall(r'([A-Z]\d+)', line)
        if len(ids) >= 5 and any(ids[0].startswith(x) for x in ['A', 'B', 'C']):
            block_ids = ids
            col_count = len(block_ids)
            i += 1
            row_data = []
            while i < len(lines):
                row_line = lines[i]
                if row_line.startswith('=') or 'بالتوفيق' in row_line or len(re.findall(r'([A-Z]\d+)', row_line)) >= 5:
                    break
                
                tokens = row_line.split()
                if len(tokens) == col_count + 1 and tokens[0].isdigit():
                    numbers = [int(x) for x in tokens[1:]]
                    row_data.append(numbers)
                elif len(tokens) == col_count:
                    numbers = [int(x) for x in tokens]
                    row_data.append(numbers)
                i += 1
            
            for col_idx, pid in enumerate(block_ids):
                col_nums = []
                for r in row_data:
                    val = r[col_idx]
                    sign = 1 if val >= 0 else -1
                    col_nums.append({"val": abs(val), "sign": sign})
                correctAnswer = sum(r[col_idx] for r in row_data)
                
                # Determine stage: units, tens, hundreds
                p_type = pid[0]
                stage = 'units' if p_type == 'A' else ('tens' if p_type == 'B' else 'hundreds')
                stage_label = 'آحاد (وحدات)' if p_type == 'A' else ('عشرات' if p_type == 'B' else 'مئات')
                
                problems_by_id[pid] = {
                    "id": pid,
                    "stage": stage,
                    "stageLabel": stage_label,
                    "numbers": col_nums,
                    "correctAnswer": correctAnswer,
                    "isMultiplication": False
                }
                ordered_ids.append(pid)
        else:
            i += 1
            
    # Return strictly in order: Table A (units), then Table B (tens), then Table C (hundreds)
    a_probs = [problems_by_id[pid] for pid in ordered_ids if pid.startswith('A')]
    b_probs = [problems_by_id[pid] for pid in ordered_ids if pid.startswith('B')]
    c_probs = [problems_by_id[pid] for pid in ordered_ids if pid.startswith('C')]
    
    return a_probs + b_probs + c_probs

# Load existing json to preserve l4-1 and l4-2
with open('src/data/pdfProblems.json', 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

new_data = {}
for cat, pdf_path in file_mapping.items():
    new_data[cat] = parse_pdf_operations(pdf_path)

# Keep l4-1 and l4-2 from existing data
if 'l4-1' in existing_data:
    new_data['l4-1'] = existing_data['l4-1']
if 'l4-2' in existing_data:
    new_data['l4-2'] = existing_data['l4-2']

# Save JSON
with open('src/data/pdfProblems.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

# Generate JS file
lines = ['// Auto-generated from PDF files — DO NOT EDIT MANUALLY']
lines.append('// Each key corresponds to a category ID (e.g. prep, l1-1, l2-1, etc.)')
lines.append('')
lines.append('export const pdfProblems = {')

for key, problems in new_data.items():
    lines.append(f'  "{key}": [')
    for p in problems:
        p_str = json.dumps(p, ensure_ascii=False, separators=(',', ':'))
        lines.append(f'    {p_str},')
    lines.append('  ],')

lines.append('};')
lines.append('')

with open('src/data/pdfProblems.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Successfully regenerated pdfProblems.json and pdfProblems.js!")
for k, v in new_data.items():
    stages = {}
    for item in v:
        s = item.get('stage') or ('mul' if item.get('isMultiplication') else item['id'][0])
        stages[s] = stages.get(s, 0) + 1
    print(f"  {k}: {len(v)} problems -> {stages}")
