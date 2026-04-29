#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从备份文件重新生成干净的 index.html，确保UTF-8编码"""

import re

# 读取备份文件（已知好的数据源）
with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 提取 <script> 标签内容
script_match = re.search(r'<script>([\s\S]*?)</script>', html)
if not script_match:
    print("ERROR: 找不到 script 标签")
    exit(1)

sc = script_match.group(1)

# 找第一处 DEPTS/PLATFORMS/MODELS (在第一个 SCENARIOS 之前)
scen1_pos = sc.find('const SCENARIOS=')
dept1_pos = sc.rfind('const DEPTS=', 0, scen1_pos)
plat1_pos = sc.rfind('const PLATFORMS=', 0, scen1_pos)
model1_pos = sc.rfind('const MODELS=', 0, scen1_pos)

dept_sec = sc[dept1_pos:plat1_pos].rstrip('\n') + '\n'
plat_sec = sc[plat1_pos:model1_pos].rstrip('\n') + '\n'
model_sec = sc[model1_pos:scen1_pos].rstrip('\n') + '\n'

print(f"DEPTS at {dept1_pos}, PLATFORMS at {plat1_pos}, MODELS at {model1_pos}")
print(f"DEPTS len: {len(dept_sec)}, PLATFORMS len: {len(plat_sec)}, MODELS len: {len(model_sec)}")

# 找第二处 SCENARIOS (完整数据)
scen2_pos = sc.find('const SCENARIOS=', scen1_pos + 1)
print(f"SCENARIOS #2 at {scen2_pos}")

# 找 SCENARIOS 数组的正确结尾 - 需要匹配括号
def find_array_end(text, start):
    """找到数组的结束位置 (匹配方括号)"""
    depth = 0
    in_string = False
    escape = False
    i = start
    
    while i < len(text):
        c = text[i]
        
        if escape:
            escape = False
            i += 1
            continue
            
        if c == '\\':
            escape = True
            i += 1
            continue
            
        if c == '"' and not in_string:
            in_string = True
            i += 1
            continue
        elif c == '"' and in_string:
            in_string = False
            i += 1
            continue
            
        if in_string:
            i += 1
            continue
            
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                return i  # 返回 ] 的位置
                
        i += 1
    
    return -1

# SCENARIOS 数组从 '[' 开始
scen_start = sc.find('[', scen2_pos)
scen_end = find_array_end(sc, scen_start + 1)
print(f"SCENARIOS array: start={scen_start}, end={scen_end}")

if scen_end == -1:
    print("ERROR: 找不到 SCENARIOS 数组结尾")
    exit(1)

# 提取 SCENARIOS 数组（包含开头的 [ 和结尾的 ]）
scen_content = sc[scen_start:scen_end + 1]
print(f"SCENARIOS 长度: {len(scen_content)}")
print(f"SCENARIOS 前50字符: {scen_content[:50]}")
print(f"SCENARIOS 后50字符: {scen_content[-50:]}")

# 计算对象数量
obj_count = scen_content.count('"name"')
print(f"场景对象数量: {obj_count}")

# 现在找代码部分 - 在 SCENARIOS 结尾之后，找 "// State" 或 "let activeDept"
code_start_marker = '// State'
code_start = sc.find(code_start_marker, scen_end)
if code_start == -1:
    code_start_marker = 'let activeDept'
    code_start = sc.find(code_start_marker, scen_end)
    
print(f"代码起始标记: '{code_start_marker}' at {code_start}")

if code_start == -1:
    print("WARNING: 找不到代码起始位置，使用默认代码")
    code = """
let activeDept="全部", activePlatform="全部", activeModel="全部";
let searchKeyword="";

function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Render
function render(){
  let filtered=SCENARIOS.filter(s=>{
    if(activeDept!=="全部"&&s.dept!==activeDept)return false;
    if(activePlatform!=="全部"&&s.platform!==activePlatform)return false;
    if(activeModel!=="全部"&&s.model!==activeModel)return false;
    if(searchKeyword){
      const kw=searchKeyword.toLowerCase();
      const steps=(typeof s.sop==='string'?s.sop.split('\\n'):s.sop).join(' ');
      const hay=[s.name,s.desc,s.platform,s.model,s.dept,steps];
      if(!hay.some(h=>h.toLowerCase().includes(kw)))return false;
    }
    return true;
  });
  document.getElementById('statCount').textContent=filtered.length;
  document.getElementById('statPlat').textContent=new Set(filtered.map(s=>s.platform)).size;
  document.getElementById('contentCount').textContent=filtered.length;
  document.getElementById('contentTitle').textContent=activeDept==="全部"?"全部场景":activeDept+"场景";
  const listEl=document.getElementById('scenarioList');
  const emptyEl=document.getElementById('emptyState');
  if(filtered.length===0){listEl.innerHTML='';emptyEl.style.display='block';return;}
  emptyEl.style.display='none';
  listEl.innerHTML=filtered.map((s,i)=>renderCard(s,i)).join('');
}

function renderCard(s,i){
  const typeClass=s.type==='hot'?'tag-type-hot':s.type==='fast'?'tag-type-fast':'tag-type-potential';
  const typeText=s.type==='hot'?'🔥高频刚需':s.type==='fast'?'⚡提效显著':'🌱潜力场景';
  const steps=(typeof s.sop==='string'?s.sop.split('\\n'):s.sop);
  const sopId='sop-'+i;
  const display=steps.slice(0,3);
  const extra=steps.length>3?'...':'';
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
        '<span>📋 SOP 操作步骤</span>'+
        '<span class="sop-toggle" id="toggle-'+i+'">▶ 展开</span>'+
      '</div>'+
      '<div class="sop-steps" id="'+sopId+'" style="display:none">'+
        steps.map((st,j)=>'<div class="sop-step"><span class="step-num">'+(j+1)+'</span><span>'+esc(st)+'</span></div>').join('')+
      '</div>'+
    '</div>'+
    '<div class="card-stats">'+
      '<span>⏱️ 节省 '+s.saveTime+'</span>'+
      '<span>💰 节省 '+s.saveCost+'</span>'+
      '<span>📈 效率 '+s.efficiency+'</span>'+
    '</div>'+
  '</div>';
}

function toggleSop(id){
  const el=document.getElementById(id);
  const card=el.closest('.scenario-card');
  const toggle=card.querySelector('.sop-toggle');
  if(el.style.display==='none'){
    el.style.display='block';
    toggle.textContent='▼ 收起';
  }else{
    el.style.display='none';
    toggle.textContent='▶ 展开';
  }
}

function renderSidebar(){
  const cnt={};
  DEPTS.forEach(d=>cnt[d.name]=0);
  SCENARIOS.forEach(s=>{if(cnt[s.dept]!==undefined)cnt[s.dept]++;});
  cnt["全部"]=SCENARIOS.length;
  var html='';
  for(var i=0;i<DEPTS.length;i++){
    var d=DEPTS[i];
    var active=d.name===activeDept?' active':'';
    html+='<div class="dept-item'+active+'" onclick="setDept(\\''+d.name.replace(/'/g,"\\\\'")+'\\')">'+
      '<div class="dept-icon">'+d.icon+'</div>'+
      '<div class="dept-info">'+
        '<div class="dept-name">'+d.name+'</div>'+
        '<div class="dept-count">'+cnt[d.name]+' 个场景</div>'+
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

// ===== 初始化 =====
document.getElementById('subtitle').textContent=SCENARIOS.length+'个自动化场景 · '+Object.keys(SCENARIOS.reduce(function(acc,s){acc[s.platform]=true;return acc;},{})).length+'个平台 · '+(DEPTS.length-1)+'大部门';
renderSidebar();
renderFilters();
render();
"""
else:
    # 提取代码部分（从标记到文件末尾）
    code = sc[code_start:]
    print(f"提取代码长度: {len(code)}")
    print(f"代码前100字符: {code[:100]}")

# 组装完整的 script 内容
script_content = dept_sec + plat_sec + model_sec + '\nconst SCENARIOS=' + scen_content + ';\n\n' + code

# 验证 JS 语法
try:
    # 使用 Node.js 验证（通过写入临时文件）
    import subprocess
    with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_temp_validate.js', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    result = subprocess.run(['node', '-e', f'const fs=require("fs"); const c=fs.readFileSync("C:/Users/10540/.qclaw/workspace/rpa-scenarios/_temp_validate.js","utf8"); try{{new Function(c);console.log("JS_VALID");}}catch(e){{console.log("JS_ERROR:"+e.message);}}'], 
                          capture_output=True, text=True, timeout=5)
    print(f"JS验证: {result.stdout.strip()}")
    
    # 删除临时文件
    import os
    os.remove('C:/Users/10540/.qclaw/workspace/rpa-scenarios/_temp_validate.js')
    
    if 'JS_VALID' not in result.stdout:
        print("WARNING: JS语法验证失败")
except Exception as e:
    print(f"JS验证出错: {e}")

# 现在写回 index.html
# 先读取原来的 HTML 结构（head + body部分）
html_before_script = html[:html.find('<script>')]
html_after_script = html[html.find('</script>') + 9:]

# 组装新HTML
new_html = html_before_script + '<script>\n' + script_content + '\n</script>\n' + html_after_script

# 写入文件（确保UTF-8编码）
with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_html)

print(f"\n✅ 写入完成！")
print(f"文件大小: {len(new_html)} 字节")
print(f"场景数量: {obj_count}")
