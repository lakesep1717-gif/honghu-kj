#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从备份提取正确数据并重写 index.html - 静默版本"""
import re
import sys

# 禁用 stdout 编码错误（避免 Windows 控制台问题）
sys.stdout.reconfigure(encoding='utf-8', errors='ignore')
sys.stderr.reconfigure(encoding='utf-8', errors='ignore')

backup = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html'
output = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html'

# 以二进制读取，然后解码
with open(backup, 'rb') as f:
    raw = f.read()

html = raw.decode('utf-8', errors='replace')

# 提取 script 内容
m = re.search(rb'<script>([\s\S]*?)</script>', raw)
if not m:
    sys.exit(1)

sc_bytes = m.group(1)
sc = sc_bytes.decode('utf-8', errors='replace')

# 找 SCENARIOS 位置
scen1 = sc.find('const SCENARIOS=')
scen2 = sc.find('const SCENARIOS=', scen1 + 1)

if scen2 == -1:
    sys.exit(1)

# 找 scen2 中数组的 [ 位置
bracket_pos = sc.find('[', scen2)
if bracket_pos == -1:
    sys.exit(1)

# 找数组结束 - 匹配方括号
depth = 0
in_str = False
esc = False
end_pos = -1

for i in range(bracket_pos, len(sc)):
    c = sc[i]
    
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
            end_pos = i
            break

if end_pos == -1:
    sys.exit(1)

# 提取 SCENARIOS 数组（从 [ 到 ]）
scen_content = sc[bracket_pos:end_pos + 1]

# 统计对象数
obj_count = scen_content.count('"name"')

# 提取 DEPTS/PLATFORMS/MODELS (在第一个 SCENARIOS 之前)
dept1 = sc.rfind('const DEPTS=', 0, scen1)
plat1 = sc.rfind('const PLATFORMS=', 0, scen1)
model1 = sc.rfind('const MODELS=', 0, scen1)

dept_sec = sc[dept1:plat1].rstrip('\n') + '\n'
plat_sec = sc[plat1:model1].rstrip('\n') + '\n'
model_sec = sc[model1:scen1].rstrip('\n') + '\n'

# 代码部分 - 用 Unicode 转义
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

# 组装
script_content = dept_sec + plat_sec + model_sec + '\nconst SCENARIOS=' + scen_content + ';\n\n' + code

# 验证（用 Node.js，但静默执行）
import subprocess
import tempfile
import os

try:
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.js', delete=False) as f:
        f.write(script_content.encode('utf-8'))
        tmp = f.name
    
    r = subprocess.run(['node', '-e', f'const fs=require("fs"); const c=fs.readFileSync("{tmp}","utf8"); try{{new Function(c);process.stdout.write("OK");}}catch(e){{process.stdout.write("FAIL:"+e.message);}}'], 
                      capture_output=True, timeout=5)
    os.unlink(tmp)
    
    if b'OK' not in r.stdout:
        with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_err.txt', 'wb') as f:
            f.write(r.stdout)
            f.write(r.stderr)
        sys.exit(1)
except:
    sys.exit(1)

# 组装 HTML
html_before = html[:html.find('<script>')]
html_after = html[html.find('</script>') + 9:]

new_html = html_before + '<script>\n' + script_content + '\n</script>\n' + html_after

# 写入（UTF-8 无 BOM）
with open(output, 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_html)

# 写日志
with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_ok.txt', 'w', encoding='utf-8') as f:
    f.write(f"SUCCESS\n")
    f.write(f"Size: {len(new_html)} bytes\n")
    f.write(f"Scenarios: {obj_count}\n")
