var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
console.log('File size:', h.length);

// Check if esc function exists
var hasEsc = h.indexOf('function esc(') > -1;
console.log('Has esc:', hasEsc);

// Check if var activeDept exists (ES5 style)
var hasVarActive = h.indexOf('var activeDept=') > -1;
console.log('Has var activeDept:', hasVarActive);

// Find where the ES6 code starts
var es6Start = h.indexOf('let activeDept');
console.log('ES6 starts at:', es6Start);

// Find function render
var renderStart = h.indexOf('function render(){');
console.log('render starts at:', renderStart);

// Find end of render function (next 'function' or end of script)
var afterRender = h.indexOf('function toggleSop', renderStart);
console.log('After render, next func at:', afterRender);

// Strategy: Replace the ES6 section with ES5 equivalent
// Insert esc function before render
var escFn = 'function esc(s){if(!s)return"";return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}\n';

// Also replace let/const with var and => with function
// Simple approach: just add esc and fix the critical let/const in global scope

// Find position to insert esc - before 'function render'
var insertBefore = h.indexOf('function render(){');
console.log('Insert before render at:', insertBefore);

// Check if already inserted
if (hasEsc) {
  console.log('esc already exists - checking if it works...');
  // Maybe the issue is something else
} else {
  h = h.slice(0, insertBefore) + escFn + h.slice(insertBefore);
  console.log('Inserted esc function. New size:', h.length);
}

// Now fix 'let filtered' to 'var filtered' in render
// and '=>' to function
// More surgical: replace specific problematic patterns

// Fix: let filtered=SCENARIOS.filter(s=>{  ->  var filtered=[];for(var i=0;i<SCENARIOS.length...
// This is complex. Let's do a simpler approach:
// Replace the entire render function body with ES5 version

// Find the full render function
var renderStartPos = h.indexOf('function render(){');
var renderEndPos = h.indexOf('function toggleSop');
var renderFnOld = h.slice(renderStartPos, renderEndPos);
console.log('Old render fn length:', renderFnOld.length);
console.log('Old render start:', renderFnOld.slice(0, 100));

// New ES5 render function
var renderFnNew = [
  'function render(){',
  'var filtered=[];',
  'for(var i=0;i<SCENARIOS.length;i++){',
  'var s=SCENARIOS[i];',
  'var ok=true;',
  'if(activeDept!=="全部"&&s.dept!==activeDept)ok=false;',
  'if(activePlatform!=="全部"&&s.platform!==activePlatform)ok=false;',
  'if(activeModel!=="全部"&&s.model!==activeModel)ok=false;',
  'if(searchKeyword){',
  'var kw=searchKeyword.toLowerCase();',
  'var hay=(s.name||"")+" "+(s.desc||"")+" "+(s.platform||"")+" "+(s.model||"")+" "+(s.dept||"")+" "+(Array.isArray(s.sop)?s.sop.join(" "):String(s.sop||"")).toLowerCase();',
  'if(hay.indexOf(kw)===-1)ok=false;',
  '}',
  'if(ok)filtered.push(s);',
  '}',
  'document.getElementById("statCount").textContent=filtered.length;',
  'var ps={};',
  'for(var pi=0;pi<filtered.length;pi++)ps[filtered[pi].platform]=true;',
  'document.getElementById("statPlat").textContent=Object.keys(ps).length;',
  'document.getElementById("contentCount").textContent=filtered.length;',
  'document.getElementById("contentTitle").textContent=activeDept==="全部"?"全部场景":activeDept+"场景";',
  'var listEl=document.getElementById("scenarioList");',
  'var emptyEl=document.getElementById("emptyState");',
  'if(filtered.length===0){listEl.innerHTML="";emptyEl.style.display="block";return;}',
  'emptyEl.style.display="none";',
  'var html="";',
  'for(var ci=0;ci<filtered.length;ci++)html+=renderCard(filtered[ci],ci);',
  'listEl.innerHTML=html;',
  '}\n'
].join('');

// Replace
h = h.slice(0, renderStartPos) + renderFnNew + h.slice(renderEndPos);
console.log('Replaced render. New size:', h.length);

// Fix renderCard too
var rcStart = h.indexOf('function renderCard(');
var rcEnd = h.indexOf('function toggleSop');
if (rcStart > -1 && rcEnd > -1) {
  var rcOld = h.slice(rcStart, rcEnd);
  console.log('Old renderCard fn length:', rcOld.length);
  
  // New ES5 renderCard
  var rcNew = [
    'var _idx=0;',
    'function renderCard(s){',
    'var tc=s.type==="hot"?"tag-type-hot":s.type==="fast"?"tag-type-fast":"tag-type-potential";',
    'var tt=s.type==="hot"?"🔥高频刚需":s.type==="fast"?"⚡提效显著":"🌱潜力场景";',
    'var sopRaw=Array.isArray(s.sop)?s.sop:String(s.sop||"");',
    'var sopSteps=sopRaw.split("\\n").filter(function(x){return x.trim();});',
    'if(sopSteps.length===1&&sopSteps[0].indexOf("\\u8594")>-1){',
    'sopSteps=sopSteps[0].split("\\u8594").map(function(x){return x.trim();}).filter(function(x){return x;});',
    '}',
    'var sopHtml="";',
    'for(var si=0;si<sopSteps.length;si++){',
    'sopHtml+="<div class=sop-step><div class=sop-step-num>"+(si+1)+"</div><div class=sop-step-text>"+esc(sopSteps[si])+"</div></div>";',
    '}',
    'var valHtml="";',
    'if(s.saveTime)valHtml+="<div class=value-item><span class=value-icon>\u23F1\uFE0F</span><span class=value-text>"+esc(s.saveTime)+"</span></div>";',
    'if(s.saveCost)valHtml+="<div class=value-item><span class=value-icon>\uD83D\uDCB0</span><span class=value-highlight>"+esc(s.saveCost)+"</span></div>";',
    'if(s.efficiency)valHtml+="<div class=value-item><span class=value-icon>\uD83D\uDCC8</span><span class=value-highlight>"+esc(s.efficiency)+"</span></div>";',
    'var cardId="sop-"+_idx;',
    'var arrowId="arrow-"+_idx;',
    'var labelId="label-"+_idx;',
    '_idx++;',
    'var onclick="toggleSop(\\x27"+cardId+"\\x27,\\x27"+arrowId+"\\x27,\\x27"+labelId+"\\x27)";',
    'return"<div class=scenario-card><div class=scenario-header><div class=scenario-title>"+esc(s.name)+"</div><div class=scenario-tags><span class=tag-tag-platform>"+esc(s.platform)+"</span><span class=tag-tag-model>"+esc(s.model)+"</span><span class=\\"tag "+tc+"\\">"+tt+"</span></div></div><div class=scenario-desc>"+esc(s.desc)+"</div><div class=value-props>"+valHtml+"</div><div class=sop-section><div class=sop-header onclick="+onclick+"><div class=sop-title>\uD83D\uDCCB \u67E5\u770B\u5B9E\u73B0\u6B65\u9AA4 (SOP)</div><div class=sop-toggle><span id=\\x22"+labelId+"\\x22>\u5C55\u5F00</span> <span id=\\x22"+arrowId+"\\x22>\u25BC</span></div></div><div class=sop-content id=\\x22"+cardId+"\\x22>"+sopHtml+"</div></div></div>";',
    '}\n'
  ].join('');
  
  h = h.slice(0, rcStart) + rcNew + h.slice(rcEnd);
  console.log('Replaced renderCard. New size:', h.length);
}

// Fix global let/const vars
h = h.replace(/let activeDept/g, 'var activeDept');
h = h.replace(/let activePlatform/g, 'var activePlatform');
h = h.replace(/let activeModel/g, 'var activeModel');
h = h.replace(/let searchKeyword/g, 'var searchKeyword');
console.log('Fixed let->var. New size:', h.length);

// Fix renderSidebar - change let/const
var rsStart = h.indexOf('function renderSidebar(){');
if (rsStart > -1) {
  var rsEnd = h.indexOf('function renderFilters', rsStart);
  var rsOld = h.slice(rsStart, rsEnd);
  var rsNew = rsOld.replace(/let /g, 'var ').replace(/const /g, 'var ');
  h = h.slice(0, rsStart) + rsNew + h.slice(rsEnd);
  console.log('Fixed renderSidebar. New size:', h.length);
}

// Fix toggleSop - change let
var tsStart = h.indexOf('function toggleSop(');
if (tsStart > -1) {
  var tsEnd = h.indexOf('function renderSidebar', tsStart);
  if (tsEnd > -1) {
    var tsOld = h.slice(tsStart, tsEnd);
    var tsNew = tsOld.replace(/let /g, 'var ');
    h = h.slice(0, tsStart) + tsNew + h.slice(tsEnd);
    console.log('Fixed toggleSop. New size:', h.length);
  }
}

// Fix the subtitle (has ES6 Set)
h = h.replace('new Set(SCENARIOS.map(s=>s.platform)).size', 
  'Object.keys(SCENARIOS.reduce(function(acc,s){acc[s.platform]=true;return acc;},{})).length');

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', h, 'utf8');
console.log('Done! Final size:', h.length);

// Verify
var checks = [
  'function esc',
  'function render',
  'var activeDept',
  'var _idx',
  'function renderCard',
  'function renderSidebar'
];
checks.forEach(function(c) {
  console.log(c + ':', h.indexOf(c) > -1 ? 'YES' : 'MISSING');
});
