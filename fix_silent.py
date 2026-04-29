#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Silent fix for index.html encoding - rewrites from backup with UTF-8"""
import re
import json

# Read backup
with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract script content
script_match = re.search(r'<script>([\s\S]*?)</script>', html)
if not script_match:
    exit(1)

sc = script_match.group(1)

# Find positions
scen1 = sc.find('const SCENARIOS=')
dept1 = sc.rfind('const DEPTS=', 0, scen1)
plat1 = sc.rfind('const PLATFORMS=', 0, scen1)
model1 = sc.rfind('const MODELS=', 0, scen1)

# Extract data sections
dept_sec = sc[dept1:plat1].rstrip('\n') + '\n'
plat_sec = sc[plat1:model1].rstrip('\n') + '\n'
model_sec = sc[model1:scen1].rstrip('\n') + '\n'

# Find SCENARIOS #2 (the good data)
scen2 = sc.find('const SCENARIOS=', scen1 + 1)

# Find array end properly
def find_array_end(text, start):
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        c = text[i]
        if esc:
            esc = False
            continue
        if c == '\\':
            esc = True
            continue
        if c == '"' and not in_str:
            in_str = True
            continue
        elif c == '"' and in_str:
            in_str = False
            continue
        if in_str:
            continue
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                return i
    return -1

# Find the [ after const SCENARIOS=
bracket_pos = sc.find('[', scen2)
if bracket_pos == -1:
    exit(1)

scen_end = find_array_end(sc, bracket_pos + 1)
if scen_end == -1:
    exit(1)

scen_content = sc[bracket_pos:scen_end + 1]

# Count objects
obj_count = scen_content.count('"name"')

# Build clean code
code = '''let activeDept="\u5168\u90e8", activePlatform="\u5168\u90e8", activeModel="\u5168\u90e8";
let searchKeyword="";

function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render(){
  let filtered=SCENARIOS.filter(s=>{
    if(activeDept!=="\u5168\u90e8"&&s.dept!==activeDept)return false;
    if(activePlatform!=="\u5168\u90e8"&&s.platform!==activePlatform)return false;
    if(activeModel!=="\u5168\u90e8"&&s.model!==activeModel)return false;
    if(searchKeyword){
      const kw=searchKeyword.toLowerCase();
      const steps=(typeof s.sop==='string'?s.sop.split('\\\\n'):s.sop).join(' ');
      const hay=[s.name,s.desc,s.platform,s.model,s.dept,steps];
      if(!hay.some(h=>h.toLowerCase().includes(kw)))return false;
    }
    return true;
  });
  document.getElementById('statCount').textContent=filtered.length;
  document.getElementById('statPlat').textContent=new Set(filtered.map(s=>s.platform)).size;
  document.getElementById('contentCount').textContent=filtered.length;
  document.getElementById('contentTitle').textContent=activeDept==="\u5168\u90e8"?"\u5168\u90e8\u573a\u666f":activeDept+"\u573a\u666f";
  const listEl=document.getElementById('scenarioList');
  const emptyEl=document.getElementById('emptyState');
  if(filtered.length===0){listEl.innerHTML='';emptyEl.style.display='block';return;}
  emptyEl.style.display='none';
  listEl.innerHTML=filtered.map((s,i)=>renderCard(s,i)).join('');
}

function renderCard(s,i){
  const typeClass=s.type==='hot'?'tag-type-hot':s.type==='fast'?'tag-type-fast':'tag-type-potential';
  const typeText=s.type==='hot'?'\ud83d\udd25\u9ad8\u9891\u521a\u9700':s.type==='fast'?'\u26a1\u63d0\u6548\u663e\u8457':'\ud83c\udf31\u6f5c\u529b\u573a\u666f';
  const steps=(typeof s.sop==='string'?s.sop.split('\\\\n'):s.sop);
  const sopId='sop-'+i;
  return '<div class="scenario-card" id="card-'+i+'">'+
    '<div class="card-header">'+
      '<div class="card-title">'+
        '<span class="tag-platform">'+esc(s.platform)+'</span>'+
        '<span class="tag-model">'+esc(s.model)+'</span>'+
        '<span class="'+typeClass+'">'+typeText+'</span>'+
        '<h3>'+esc(s.name)+'</h3>'+
      '</div>'+
      '<div class="card-badges">'+
        '<span class="badge-dept">'+esc(s.dept)+'</span>'+
      '</div>'+
    '</div>'+
    '<p class="card-desc">'+esc(s.desc)+'</p>'+
    '<div class="card-sop">'+
      '<div class="sop-title" onclick="toggleSop(\\''+sopId+'\\')">'+
        '<span>\ud83d\udccb SOP \u64cd\u4f5c\u6b65\u9aa4</span>'+
        '<span class="sop-toggle" id="toggle-'+i+'">\u25b6 \u5c55\u5f00</span>'+
      '</div>'+
      '<div class="sop-steps" id="'+sopId+'" style="display:none">'+
        steps.map((st,j)=>'<div class="sop-step"><span class="step-num">'+(j+1)+'</span><span>'+esc(st)+'</span></div>').join('')+
      '</div>'+
    '</div>'+
    '<div class="card-stats">'+
      '<span>\u23f1\ufe0f \u8282\u7701 '+s.saveTime+'</span>'+
      '<span>\ud83d\udcb0 \u8282\u7701 '+s.saveCost+'</span>'+
      '<span>\ud83d\udcc8 \u6548\u7387 '+s.efficiency+'</span>'+
    '</div>'+
  '</div>';
}

function toggleSop(id){
  const el=document.getElementById(id);
  const card=el.closest('.scenario-card');
  const toggle=card.querySelector('.sop-toggle');
  if(el.style.display==='none'){
    el.style.display='block';
    toggle.textContent='\u25bc \u6536\u8d77';
  }else{
    el.style.display='none';
    toggle.textContent='\u25b6 \u5c55\u5f00';
  }
}

function renderSidebar(){
  const cnt={};
  DEPTS.forEach(d=>cnt[d.name]=0);
  SCENARIOS.forEach(s=>{if(cnt[s.dept]!==undefined)cnt[s.dept]++;});
  cnt["\u5168\u90e8"]=SCENARIOS.length;
  var html='';
  for(var i=0;i<DEPTS.length;i++){
    var d=DEPTS[i];
    var active=d.name===activeDept?' active':'';
    html+='<div class="dept-item'+active+'" onclick="setDept(\\''+d.name.replace(/'/g,"\\\\'")+'\\')">'+
      '<div class="dept-icon">'+d.icon+'</div>'+
      '<div class="dept-info">'+
        '<div class="dept-name">'+d.name+'</div>'+
        '<div class="dept-count">'+cnt[d.name]+' \u4e2a\u573a\u666f</div>'+
      '</div>'+
    '</div>';
  }
  document.getElementById('deptSidebar').innerHTML=html;
}

function renderFilters(){
  var pHtml='';
  for(var i=0;i<PLATFORMS.length;i++){
    var p=PLATFORMS[i];
    pHtml+='<button class="filter-btn'+(p===activePlatform?' active':'')+'" onclick="setPlatform(\\''+p.replace(/'/g,"\\\\'")+'\\')">'+p+'</button>';
  }
  document.getElementById('platformFilters').innerHTML=pHtml;
  var mHtml='';
  for(var i=0;i<MODELS.length;i++){
    var m=MODELS[i];
    mHtml+='<button class="filter-btn'+(m===activeModel?' active':'')+'" onclick="setModel(\\''+m.replace(/'/g,"\\\\'")+'\\')">'+m+'</button>';
  }
  document.getElementById('modelFilters').innerHTML=mHtml;
}

function setDept(d){activeDept=d;renderSidebar();render();}
function setPlatform(p){activePlatform=p;renderFilters();render();}
function setModel(m){activeModel=m;renderFilters();render();}
document.getElementById('searchInput').addEventListener('input',function(e){
  searchKeyword=e.target.value.trim();
  render();
});
document.getElementById('subtitle').textContent=SCENARIOS.length+'\u4e2a\u81ea\u52a8\u5316\u573a\u666f \u00b7 '+Object.keys(SCENARIOS.reduce(function(acc,s){acc[s.platform]=true;return acc;},{})).length+'\u4e2a\u5e73\u53f0 \u00b7 '+(DEPTS.length-1)+'\u5927\u90e8\u95e8';
renderSidebar();
renderFilters();
render();
'''

# Assemble
script_content = dept_sec + plat_sec + model_sec + '\nconst SCENARIOS=' + scen_content + ';\n\n' + code

# Validate with Node
import subprocess
import tempfile
import os

with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.js', delete=False) as f:
    f.write(script_content)
    tmp_path = f.name

try:
    result = subprocess.run(['node', '-e', f'const fs=require("fs"); const c=fs.readFileSync("{tmp_path}","utf8"); try{{new Function(c);process.stdout.write("VALID");}}catch(e){{process.stdout.write("INVALID:"+e.message);}}'], 
                          capture_output=True, text=True, timeout=5)
    valid = result.stdout.strip()
except:
    valid = "TIMEOUT"

os.unlink(tmp_path)

if valid != "VALID":
    with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_fix_log.txt', 'w', encoding='utf-8') as f:
        f.write(f"Validation: {valid}\n")
        f.write(f"Script length: {len(script_content)}\n")
    exit(1)

# Write final HTML
html_before = html[:html.find('<script>')]
html_after = html[html.find('</script>') + 9:]

new_html = html_before + '<script>\n' + script_content + '\n</script>\n' + html_after

with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_html)

with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_fix_log.txt', 'w', encoding='utf-8') as f:
    f.write(f"SUCCESS\n")
    f.write(f"File size: {len(new_html)} bytes\n")
    f.write(f"Scenarios: {obj_count}\n")
