var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var sc = h.substring(si, ei);

// Structure of backup file:
// [428]      First  const SCENARIOS=[ ... CORRUPTED ending: has "]]" then DEPTS again ]
// [61103]    Second const DEPTS= (duplicate DEPTS)
// [61529]    Third  const SCENARIOS= (properly formatted SCENARIOS with 216 objects)
// [122198]   ] (closes the third SCENARIOS)
// [122202]   // State (code section start)

// Find // State position (the real one, after SCENARIOS data)
var statePos = -1;
for (var i = 0; i < sc.length - 8; i++) {
    if (sc[i] === '/' && sc[i+1] === '/' && sc.substring(i+2, i+8) === ' State') {
        statePos = i;
        break;
    }
}
console.log('Real // State at', statePos, ':', JSON.stringify(sc.substring(statePos, statePos + 30)));

// Find the ] that closes SCENARIOS - just before // State
var lastClose = -1;
for (var i = statePos - 1; i >= 0; i--) {
    if (sc[i] === ']') { lastClose = i; break; }
}
console.log('Last ] before // State at', lastClose, ':', JSON.stringify(sc.substring(lastClose - 3, lastClose + 10)));

// Verify: is there a matching [ before lastClose?
// Count brackets from first const SCENARIOS=
var s1 = sc.indexOf('const SCENARIOS=');
var depth = 0, inStr = false, esc = false;
for (var i = s1 + 'const SCENARIOS='.length; i < lastClose; i++) {
    var c = sc[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') depth++;
    else if (c === ']') depth--;
}
console.log('Depth at last ] before // State:', depth, '(should be -1)');

// CORRECT STRATEGY:
// The FIRST SCENARIOS (s1) ends with CORRUPTED data
// It ends just before the second DEPTS array (which starts at dep2)
// We find where the first SCENARIOS actually closes by scanning [s1, dep2]

var dep2 = sc.indexOf('const DEPTS=', 10); // second DEPTS
console.log('\nSecond DEPTS at', dep2, ':', JSON.stringify(sc.substring(dep2 - 5, dep2 + 20)));

// Find the LAST ] before dep2
var lastCloseBeforeDep2 = -1;
for (var i = dep2 - 1; i >= 0; i--) {
    if (sc[i] === ']') { lastCloseBeforeDep2 = i; break; }
}
console.log('Last ] before second DEPTS at', lastCloseBeforeDep2, ':', JSON.stringify(sc.substring(lastCloseBeforeDep2 - 3, lastCloseBeforeDep2 + 10)));

// Count brackets from s1+17 to lastCloseBeforeDep2
depth = 0; inStr = false; esc = false;
var firstScenEnd = -1;
for (var i = s1 + 'const SCENARIOS='.length; i <= lastCloseBeforeDep2; i++) {
    var c = sc[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth < 0) { firstScenEnd = i; break; } }
}
console.log('First SCENARIOS ends at', firstScenEnd, ':', JSON.stringify(sc.substring(firstScenEnd - 3, firstScenEnd + 10)));

// Now verify: the first SCENARIOS content ends with "backup"}\n\n]\n\n (the ] is at firstScenEnd)
var scContent = sc.substring(s1, firstScenEnd + 1);
var scContentTrimmed = scContent.trimEnd();
console.log('\nFirst SCENARIOS section length:', scContent.length, '({name::', (scContent.match(/{name:/g)||[]).length);

// Extract all sections
var d1 = sc.indexOf('const DEPTS=');
var p1 = sc.indexOf('const PLATFORMS=');
var m1 = sc.indexOf('const MODELS=');

var depSec = sc.substring(d1, p1).trimEnd();
var platSec = sc.substring(p1, m1).trimEnd();
var modelSec = sc.substring(m1, s1).trimEnd();
var scenSec = scContentTrimmed; // The complete first SCENARIOS
var codeSec = sc.substring(statePos);

console.log('\n=== SECTION LENGTHS ===');
console.log('DEPTS:', depSec.length, '({name::', (depSec.match(/{name:/g)||[]).length);
console.log('PLATFORMS:', platSec.length);
console.log('MODELS:', modelSec.length);
console.log('SCENARIOS:', scenSec.length, '({name::', (scenSec.match(/{name:/g)||[]).length);
console.log('CODE:', codeSec.length);

// Verify data section
try {
    new Function(depSec + '\n\n' + platSec + '\n\n' + modelSec + '\n\n' + scenSec);
    console.log('Data section: OK ✅');
} catch(e) {
    console.log('Data ERROR:', e.message);
}

// Build clean script
var clean = depSec + '\n\n' + platSec + '\n\n' + modelSec + '\n\n' + scenSec + '\n\n' + codeSec;

// Fix SOP display: s.sop.split(' → ') -> String(s.sop).split('\n')
clean = clean.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");
// Fix SOP join: s.sop.join(' ') -> String(s.sop).split('\n').join(' ')
clean = clean.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix toggleSop
var toggle = clean.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggle) {
    clean = clean.replace(toggle[0], 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"▲":"▼";a.previousSibling.textContent=show?"收起 ":"展开 ";}');
    console.log('Fixed toggleSop ✅');
}

console.log('\nClean script length:', clean.length);

// Verify full script
try {
    new Function(clean);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('Context:', JSON.stringify(clean.substring(Math.max(0,pos-30), pos+50)));
    }
}

// Write HTML
var newHtml = h.substring(0, si) + '\n' + clean + '\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten! HTML length:', newHtml.length, '✅');
console.log('Please open file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
