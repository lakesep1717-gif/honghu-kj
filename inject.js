var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');

// Insert renderCard and _idx before toggleSop
var tsPos = h.indexOf('function toggleSop(');
if (tsPos === -1) { console.log('toggleSop not found!'); return; }

var rcNew = 'var _idx=0;function renderCard(s){var tc=s.type==="hot"?"tag-type-hot":s.type==="fast"?"tag-type-fast":"tag-type-potential";var tt=s.type==="hot"?"\uD83C\uDF0A\u9AD8\u9891\u521D\u4E3B\u5FC5":s.type==="fast"?"\u26A1\u63D0\u6548\u663E\u8457":"\uD83C\uDF31\u6F5C\u529B\u573A\u666F";var sopRaw=Array.isArray(s.sop)?s.sop.join("\n"):String(s.sop||"");var sopSteps=sopRaw.split("\n").filter(function(x){return x.trim();});if(sopSteps.length===1&&sopSteps[0].indexOf("\u8594")>-1){sopSteps=sopSteps[0].split("\u8594").map(function(x){return x.trim();}).filter(function(x){return x;});}var sopHtml="";for(var si=0;si<sopSteps.length;si++){sopHtml+="<div class=sop-step><div class=sop-step-num>"+(si+1)+"</div><div class=sop-step-text>"+esc(sopSteps[si])+"</div></div>";}var valHtml="";if(s.saveTime)valHtml+="<div class=value-item><span class=value-icon>\u23F1\uFE0F</span><span class=value-text>"+esc(s.saveTime)+"</span></div>";if(s.saveCost)valHtml+="<div class=value-item><span class=value-icon>\uD83D\uDCB0</span><span class=value-highlight>"+esc(s.saveCost)+"</span></div>";if(s.efficiency)valHtml+="<div class=value-item><span class=value-icon>\uD83D\uDCC8</span><span class=value-highlight>"+esc(s.efficiency)+"</span></div>";var cardId="sop-"+_idx;var arrowId="arrow-"+_idx;var labelId="label-"+_idx;_idx++;var onclick="toggleSop(\\x27"+cardId+"\\x27,\\x27"+arrowId+"\\x27,\\x27"+labelId+"\\x27)";return"<div class=scenario-card><div class=scenario-header><div class=scenario-title>"+esc(s.name)+"</div><div class=scenario-tags><span class=tag-tag-platform>"+esc(s.platform)+"</span><span class=tag-tag-model>"+esc(s.model)+"</span><span class=\"tag "+tc+"\">"+tt+"</span></div></div><div class=scenario-desc>"+esc(s.desc)+"</div><div class=value-props>"+valHtml+"</div><div class=sop-section><div class=sop-header onclick="+onclick+"><div class=sop-title>\uD83D\uDCCB \u67E5\u770B\u5B9E\u73B0\u6B65\u9AA4 (SOP)</div><div class=sop-toggle><span id=\""+labelId+"\">\u5C55\u5F00</span> <span id=\""+arrowId+"\">\u25BC</span></div></div><div class=sop-content id=\""+cardId+"\">"+sopHtml+"</div></div></div>";}\n';

h = h.slice(0, tsPos) + rcNew + h.slice(tsPos);
console.log('Inserted renderCard. New size:', h.length);

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', h, 'utf8');
console.log('Written!');

// Quick verify
var checks = ['_idx', 'renderCard', 'toggleSop', 'renderSidebar'];
checks.forEach(function(c) {
  console.log(c + ':', h.indexOf(c) > -1 ? 'OK' : 'MISSING');
});
