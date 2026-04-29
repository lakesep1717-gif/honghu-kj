var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Extract data arrays (first occurrence, before SCENARIOS#1)
var scen1 = sc.indexOf('const SCENARIOS=');
var dep1 = sc.lastIndexOf('const DEPTS=', scen1);
var plat1 = sc.lastIndexOf('const PLATFORMS=', scen1);
var mod1 = sc.lastIndexOf('const MODELS=', scen1);
var depSec = sc.substring(dep1, plat1).trimEnd();
var platSec = sc.substring(plat1, mod1).trimEnd();
var modSec = sc.substring(mod1, scen1).trimEnd();

// Extract SCENARIOS#2 data (properly closed array)
var scen2 = sc.indexOf('const SCENARIOS=', scen1 + 1);
var scenContent = sc.substring(scen2 + 'const SCENARIOS='.length, 122198 + 1);

// Clean code - rewrite from scratch with fixes
var code = `let activeDept="全部", activePlatform="全部", activeModel="全部";
let searchKeyword="";

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
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const sopHtml=steps.map((step,idx)=>\`<div class="sop-step"><div class="sop-step-num">\${idx+1}</div><div class="sop-step-text">\${esc(step)}</div></div>\`).join('');
  return \`<div class="scenario-card"><div class="scenario-header"><div class="scenario-title">\${esc(s.name)}</div><div class="scenario-tags"><span class="tag tag-platform">\${s.platform}</span><span class="tag tag-model">\${s.model}</span><span class="tag \${typeClass}">\${typeText}</span></div></div><div class="scenario-desc">\${esc(s.desc)}</div><div class="value-props">\${s.saveTime?\`<div class="value-item"><span class="value-icon">⏱️</span><span class="value-text">\${esc(s.saveTime)}</span></div>\`:''}\${s.saveCost?\`<div class="value-item"><span class="value-icon">💰</span><span class="value-highlight">\${esc(s.saveCost)}</span></div>\`:''}\${s.efficiency?\`<div class="value-item"><span class="value-icon">📈</span><span class="value-highlight">\${esc(s.efficiency)}</span></div>\`:''}</div><div class="sop-section"><div class="sop-header" onclick="toggleSop(\${i})"><div class="sop-title">📋 查看实现步骤 (SOP)</div><div class="sop-toggle">展开 <span id="arrow-\${i}">▼</span></div></div><div class="sop-content" id="sop-\${i}">\${sopHtml}</div></div></div>\`;
}

function toggleSop(i){
  var c=document.getElementById("sop-"+i);
  var a=document.getElementById("arrow-"+i);
  var show=c.classList.toggle("show");
  a.textContent=show?"▲":"▼";
  a.previousSibling.textContent=show?" 收起 ":"展开 ";
}

function renderSidebar(){
  const cnt={};
  DEPTS.forEach(d=>cnt[d.name]=0);
  SCENARIOS.forEach(s=>{if(cnt[s.dept]!==undefined)cnt[s.dept]++;});
  cnt["全部"]=SCENARIOS.length;
  document.getElementById('deptSidebar').innerHTML=DEPTS.map(d=>\`<div class="dept-item \${d.name===activeDept?'active':''}" onclick="setDept('\${d.name.replace(/'/g,"\\\\'")}')"><div class="dept-icon">\${d.icon}</div><div class="dept-info"><div class="dept-name">\${d.name}</div><div class="dept-count">\${cnt[d.name]} 个场景</div></div></div>\`).join('');
}

function renderFilters(){
  document.getElementById('platformFilters').innerHTML=PLATFORMS.map(p=>\`<button class="filter-btn \${p===activePlatform?'active':''}" onclick="setPlatform('\${p.replace(/'/g,"\\\\'")}')">\${p}</button>\`).join('');
  document.getElementById('modelFilters').innerHTML=MODELS.map(m=>\`<button class="filter-btn \${m===activeModel?'active':''}" onclick="setModel('\${m.replace(/'/g,"\\\\'")}')">\${m}</button>\`).join('');
}

function setDept(d){activeDept=d;renderSidebar();render();}
function setPlatform(p){activePlatform=p;renderFilters();render();}
function setModel(m){activeModel=m;renderFilters();render();}

document.getElementById('searchInput').addEventListener('input',function(e){searchKeyword=e.target.value.trim();render();});

document.getElementById('subtitle').textContent=SCENARIOS.length+'个自动化机会点 · '+new Set(SCENARIOS.map(s=>s.platform)).size+'个平台 · '+DEPTS.length+'大部门';

renderSidebar();renderFilters();render();`;

// Build full script
var cleanScript = depSec + '\n\n' + platSec + '\n\n' + modSec + '\n\n' +
    'const SCENARIOS=[' + scenContent + '];\n\n' + code;

// Verify
console.log('Full script length:', cleanScript.length);
try {
    new Function(cleanScript);
    console.log('Full script: OK ✅');
} catch(e) {
    console.log('Full script ERROR:', e.message);
}

// Write HTML
var si = h.indexOf('<script>');
var ei = h.indexOf('<\/script>');
var newHtml = h.substring(0, si) + '<script>\n' + cleanScript + '\n</script>\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('Written! HTML length:', newHtml.length, '✅');
console.log('请刷新: file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
