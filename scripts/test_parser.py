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
            # Collect row lines
            row_data = []
            while i < len(lines):
                row_line = lines[i]
                if row_line.startswith('=') or 'بالتوفيق' in row_line or len(re.findall(r'([A-Z]\d+)', row_line)) >= 5:
                    break
                
                # Filter tokens
                tokens = row_line.split()
                # If first token is row number (1, 2, 3...)
                if len(tokens) == col_count + 1 and tokens[0].isdigit():
                    numbers = [int(x) for x in tokens[1:]]
                    row_data.append(numbers)
                elif len(tokens) == col_count:
                    numbers = [int(x) for x in tokens]
                    row_data.append(numbers)
                else:
                    print(f"Warning in {pdf_path}: row tokens {len(tokens)} != col_count {col_count}: {row_line}")
                i += 1
            
            # Now build problem for each col
            for col_idx, pid in enumerate(block_ids):
                col_nums = []
                for r in row_data:
                    val = r[col_idx]
                    sign = 1 if val >= 0 else -1
                    col_nums.append({"val": abs(val), "sign": sign})
                correctAnswer = sum(r[col_idx] for r in row_data)
                problems_by_id[pid] = {
                    "id": pid,
                    "numbers": col_nums,
                    "correctAnswer": correctAnswer,
                    "isMultiplication": False
                }
                ordered_ids.append(pid)
        else:
            i += 1
            
    return [problems_by_id[pid] for pid in ordered_ids]

for cat, f in file_mapping.items():
    res = parse_pdf_operations(f)
    prefixes = {}
    for p in res:
        p_type = p['id'][0]
        prefixes[p_type] = prefixes.get(p_type, 0) + 1
    print(f"{cat} ({f}): total={len(res)}, breakdown={prefixes}")
