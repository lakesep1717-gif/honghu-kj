import re

file = r"C:\Users\10540\.qclaw\workspace\rpa-scenarios\index.html"

# Try utf-8 with replace errors
with open(file, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

print(f"File length: {len(content)}")

# Find SCENARIOS
idx = content.find('const SCENARIOS=')
if idx >= 0:
    print("Found SCENARIOS at:", idx)
    # Find the end
    end_match = re.search(r'\n\];', content[idx:])
    if end_match:
        print("Array ends at relative pos:", end_match.end())
        arr_content = content[idx+len('const SCENARIOS=['):idx+len('const SCENARIOS=[')+end_match.start()]
        print(f"Array content length: {len(arr_content)}")
        print("First 500 chars:")
        print(arr_content[:500])
