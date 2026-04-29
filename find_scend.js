var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// The backup file structure:
// [428] const SCENARIOS=[ ...first copy... ];
// [~61103] const DEPTS= (second DEPTS - start of duplicate)
// [61529] const SCENARIOS= (second copy start)
// [~122198] ] (end of second copy)
// [122202] // State (code section)

// Strategy: find the ] that immediately precedes '// State' (at 122202)
// by scanning backward from 122202
var statePos = 122202;
var lastClose = -1;
for (var i = statePos - 1; i >= 0; i--) {
    if (sc[i] === ']') { lastClose = i; break; }
}
console.log('Last ] before // State at', lastClose, ':', JSON.stringify(sc.substring(lastClose - 3, lastClose + 10)));

// Now confirm: what's the first ] after the SCENARIOS #2 starts?
var s2 = 61529;
var nextClose = -1;
for (var i = s2 + 'const SCENARIOS='.length; i < sc.length; i++) {
    if (sc[i] === ']') { nextClose = i; break; }
}
console.log('First ] after SCENARIOS #2 starts at', nextClose, ':', JSON.stringify(sc.substring(nextClose - 3, nextClose + 5)));

// Count brackets from s2 to lastClose
var depth = 0;
for (var i = s2 + 'const SCENARIOS='.length; i <= lastClose; i++) {
    if (sc[i] === '[') depth++;
    else if (sc[i] === ']') depth--;
}
console.log('Depth at lastClose (should be -1):', depth);

// The first SCENARIOS (s1) closes at last ] before second DEPTS (d2)
// But find that last ] 
var d2 = 61103;
var lastBeforeDep2 = -1;
for (var i = d2 - 1; i >= s1; i--) {
    if (sc[i] === ']') { lastBeforeDep2 = i; break; }
}
console.log('\nLast ] before second DEPTS at', lastBeforeDep2, ':', JSON.stringify(sc.substring(lastBeforeDep2 - 3, lastBeforeDep2 + 10)));

// CORRECT first SCENARIOS end:
// Use findArrayEnd on range [s1, lastBeforeDep2]
var depth2 = 0, inStr2 = false, esc2 = false;
var s1End = s1 + 'const SCENARIOS='.length;
for (var i = s1End; i < lastBeforeDep2; i++) {
    var c = sc[i];
    if (esc2) { esc2 = false; continue; }
    if (c === '\\') { esc2 = true; continue; }
    if (c === '"') { inStr2 = !inStr2; continue; }
    if (inStr2) continue;
    if (c === '[') { depth2++; continue; }
    if (c === ']') { depth2--; if (depth2 < 0) { s1End = i; break; } }
}
console.log('\nFirst SCENARIOS ends at', s1End, ':', JSON.stringify(sc.substring(s1End - 3, s1End + 10)));

// Extract sections
var d1 = sc.indexOf('const DEPTS=');
var p1 = sc.indexOf('const PLATFORMS=');
var m1 = sc.indexOf('const MODELS=');

var depSec = sc.substring(d1, p1).trimEnd();
var platSec = sc.substring(p1, m1).trimEnd();
var modelSec = sc.substring(m1, s1).trimEnd();
var scenSec = sc.substring(s1, s1End + 1).trimEnd();
var codeSec = sc.substring(statePos);

console.log('\nSection lengths:');
console.log('DEPTS:', depSec.length, '({name::', (depSec.match(/{name:/g)||[]).length);
console.log('PLATFORMS:', platSec.length);
console.log('MODELS:', modelSec.length);
console.log('SCENARIOS:', scenSec.length, '({name::', (scenSec.match(/{name:/g)||[]).length);
console.log('CODE:', codeSec.length);

// Verify data
try { new Function(depSec+'\n\n'+platSec+'\n\n'+modelSec+'\n\n'+scenSec); console.log('Data: OK'); }
catch(e) { console.log('Data ERROR:', e.message); }

// Build clean script
var clean = depSec + '\n\n' + platSec + '\n\n' + modelSec + '\n\n' + scenSec + '\n\n' + codeSec;

// Fix SOP display
clean = clean.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");
clean = clean.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix toggleSop
var toggle = clean.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggle) {
    clean = clean.replace(toggle[0], 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"▲":"▼";a.previousSibling.textContent=show?"收起 ":"展开 ";}');
    console.log('Fixed toggleSop');
}

// Verify
try { new Function(clean); console.log('JS: OK ✅'); }
catch(e) { console.log('JS ERROR:', e.message); }

// Write HTML
var newHtml = h.substring(0, si + 8) + '\n' + clean + '\n' + h.substring(h.indexOf('<\/script>'));
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('Written. HTML len:', newHtml.length, '✅');
