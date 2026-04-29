import re

with open(r'C:\Users\10540\.qclaw\workspace\rpa-scenarios\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find </script> inside string literals in SCENARIOS
# The issue is </script> appearing in platform/desc/name fields
matches = list(re.finditer(r'</script>', content))
print(f"Found {len(matches)} occurrences of </script>")
for m in matches:
    print(f"At pos {m.start()}: context = {content[max(0,m.start()-30):m.end()+30]}")
