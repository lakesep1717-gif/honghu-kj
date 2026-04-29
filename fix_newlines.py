import re
import subprocess

with open(r'C:\Users\10540\.qclaw\workspace\rpa-scenarios\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

script_start = content.find('<script>') + 8
script_end = content.find('</script>')
before_script = content[:script_start]
after_script = content[script_end:]
script = content[script_start:script_end]

scen_start = script.find('const SCENARIOS=')
scen_end = script.find('];', scen_start) + 2

before_scenarios = script[:scen_start]
scenarios_code = script[scen_start:scen_end]
after_scenarios = script[scen_end:]

fixed = []
in_string = False
i = 0
while i < len(scenarios_code):
    c = scenarios_code[i]
    if c == '\\':
        fixed.append(c)
        i += 1
        if i < len(scenarios_code):
            fixed.append(scenarios_code[i])
        i += 1
        continue
    if c == '"':
        in_string = not in_string
        fixed.append(c)
        i += 1
        continue
    if c == '\n' and in_string:
        fixed.append('\\n')
        i += 1
        continue
    if c == '\r' and in_string:
        i += 1
        continue
    fixed.append(c)
    i += 1

fixed_scenarios = ''.join(fixed)
new_script = before_script + before_scenarios + fixed_scenarios + after_scenarios + after_script

with open(r'C:\Users\10540\.qclaw\workspace\rpa-scenarios\index.html', 'w', encoding='utf-8') as f:
    f.write(new_script)

print(f'Done. Original: {len(script)}, Fixed: {len(fixed_scenarios)}, Total: {len(new_script)}')
