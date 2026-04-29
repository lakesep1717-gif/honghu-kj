// fix_final.js - 从备份重新生成干净的 index.html
const fs = require('fs');
const path = require('path');

const backupPath = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html';
const outputPath = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html';

// 读取备份（二进制模式，然后转UTF-8）
const buf = fs.readFileSync(backupPath);
const html = buf.toString('utf8');

// 提取 script 内容
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('ERROR: 找不到 script 标签');
    process.exit(1);
}

const sc = scriptMatch[1];

// 找第一处 DEPTS/PLATFORMS/MODELS (在第一个 SCENARIOS 之前)
const scen1Pos = sc.indexOf('const SCENARIOS=');
const dept1Pos = sc.lastIndexOf('const DEPTS=', scen1Pos);
const plat1Pos = sc.lastIndexOf('const PLATFORMS=', scen1Pos);
const model1Pos = sc.lastIndexOf('const MODELS=', scen1Pos);

const deptSec = sc.substring(dept1Pos, plat1Pos).trimEnd() + '\n';
const platSec = sc.substring(plat1Pos, model1Pos).trimEnd() + '\n';
const modelSec = sc.substring(model1Pos, scen1Pos).trimEnd() + '\n';

console.log(`DEPTS: ${dept1Pos}, PLATFORMS: ${plat1Pos}, MODELS: ${model1Pos}`);

// 找第二处 SCENARIOS (完整数据)
const scen2Pos = sc.indexOf('const SCENARIOS=', scen1Pos + 1);
const scenBracketPos = sc.indexOf('[', scen2Pos);

// 找数组结束位置
function findArrayEnd(text, start) {
    let depth = 0;
    let inString = false;
    let escape = false;
    
    for (let i = start; i < text.length; i++) {
        const c = text[i];
        
        if (escape) {
            escape = false;
            continue;
        }
        
        if (c === '\\') {
            escape = true;
            continue;
        }
        
        if (c === '"' && !inString) {
            inString = true;
            continue;
        } else if (c === '"' && inString) {
            inString = false;
            continue;
        }
        
        if (inString) continue;
        
        if (c === '[') depth++;
        else if (c === ']') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

const scenEndPos = findArrayEnd(sc, scenBracketPos + 1);
if (scenEndPos === -1) {
    console.log('ERROR: 找不到 SCENARIOS 数组结尾');
    process.exit(1);
}

const scenContent = sc.substring(scenBracketPos, scenEndPos + 1);
console.log(`SCENARIOS: start=${scenBracketPos}, end=${scenEndPos}, len=${scenContent.length}`);

// 统计场景数量
const objCount = (scenContent.match(/"name"/g) || []).length;
console.log(`场景数量: ${objCount}`);

// 完全重写的代码（使用 Unicode 转义避免编码问题）
const code = `let activeDept="\u5168\u90e8", activePlatform="\u5168\u90e8", activeModel="\u5168\u90e8";
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
`;

// 组装 script
const scriptContent = deptSec + platSec + modelSec + '\nconst SCENARIOS=' + scenContent + ';\n\n' + code;

// 验证 JS 语法
try {
    new Function(scriptContent);
    console.log('JS 语法验证: ✅ 通过');
} catch(e) {
    console.log('JS 语法验证: ❌ 失败 - ' + e.message);
    process.exit(1);
}

// 组装完整 HTML
const htmlBefore = html.substring(0, html.indexOf('<script>'));
const htmlAfter = html.substring(html.indexOf('</script>') + 9);
const newHtml = htmlBefore + '<script>\n' + scriptContent + '\n</script>\n' + htmlAfter;

// 写入文件（UTF-8 无 BOM）
fs.writeFileSync(outputPath, newHtml, 'utf8');

console.log(`\n✅ 修复完成！`);
console.log(`文件大小: ${newHtml.length} 字节`);
console.log(`场景数量: ${objCount}`);
console.log(`输出路径: ${outputPath}`);
