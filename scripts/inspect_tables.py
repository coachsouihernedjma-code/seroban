import pypdf
import re
import json

def parse_blocks(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() for p in reader.pages])
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i]
        ids = re.findall(r'([A-Z]\d+)', line)
        if len(ids) >= 5 and any(ids[0].startswith(x) for x in ['A', 'B', 'C']):
            block_ids = ids
            rows = []
            i += 1
            while i < len(lines):
                row_line = lines[i]
                if row_line.startswith('=') or 'بالتوفيق' in row_line or len(re.findall(r'([A-Z]\d+)', row_line)) >= 5:
                    break
                rows.append(row_line)
                i += 1
            blocks.append({'ids': block_ids, 'rows': rows})
        else:
            i += 1
    return blocks

for f in ['pdf/تحضيري.pdf', 'pdf/م1ف1.pdf', 'pdf/م1ف2.pdf', 'pdf/م1ف3.pdf', 'pdf/م1ف4.pdf', 'pdf/م2ف1.pdf', 'pdf/م2ف2.pdf', 'pdf/م3ف1.pdf', 'pdf/م3ف2.pdf']:
    blocks = parse_blocks(f)
    print('===', f, '===')
    for b in blocks:
        prefix = b['ids'][0][0]
        first_id = b['ids'][0]
        last_id = b['ids'][-1]
        num_cols = len(b['ids'])
        num_rows = len(b['rows'])
        print(f"  Table {prefix}: {first_id}..{last_id} ({num_cols} cols), {num_rows} rows")
        if num_rows > 0:
            print("    Sample row 0:", b['rows'][0])
