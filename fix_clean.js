var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var script = h.substring(si, ei);

console.log('Script length:', script.length);

// Verify: this should have duplicates
var dep2 = script.indexOf('const DEPTS=', 10);
console.log('First DEPTS at', script.indexOf('const DEPTS='), 'second at', dep2);
var objCount = (script.match(/{name:/g) || []).length;
console.log('Total objects with {name::', objCount, '(should be ~432 = 2x 216)');

// Find positions
var d1 = script.indexOf('const DEPTS=');
var p1 = script.indexOf('const PLATFORMS=');
var m1 = script.indexOf('const MODELS=');
var s1 = script.indexOf('const SCENARIOS=');
var s2 = script.indexOf('const SCENARIOS=', s1 + 1);
console.log('First SCENARIOS at', s1, 'Second at', s2);

// Find array end - KEY FIX: return when depth < 0 (not depth === 0)
// This correctly finds the OUTER array's ] even when strings contain ]
function findArrayEnd(s, startIdx) {
    var depth = 0, inString = false, escaped = false;
    for (var i = startIdx; i < s.length; i++) {
        var c = s[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (c === '[') { depth++; continue; }
        if (c === ']') { depth--; if (depth < 0) return i; }
    }
    return -1;
}

// CORRECT: depth < 0 to find outer ]
var firstScenEnd = findArrayEnd(script, s1 + 'const SCENARIOS='.length);
console.log('First SCENARIOS ends at', firstScenEnd);
console.log('Chars around firstScenEnd:', JSON.stringify(script.substring(firstScenEnd - 3, firstScenEnd + 10)));

// Find // State by character-by-character scan
var realState = -1;
for (var i = s1 + 1; i < script.length - 8; i++) {
    if (script[i] === '/' && script[i+1] === '/' && script.substring(i+2, i+8) === ' State') {
        realState = i;
        break;
    }
}
console.log('Real // State at', realState);
console.log('Context:', JSON.stringify(script.substring(realState, realState + 30)));

// Extract sections
var depSection = script.substring(d1, p1).trimEnd();
var platSection = script.substring(p1, m1).trimEnd();
var modelSection = script.substring(m1, s1).trimEnd();
var scenSection = script.substring(s1, firstScenEnd + 1).trimEnd();
var codeSection = script.substring(realState);

console.log('\nSection lengths:');
console.log('DEPTS:', depSection.length, '(objects with {name:):', (depSection.match(/{name:/g) || []).length);
console.log('PLATFORMS:', platSection.length);
console.log('MODELS:', modelSection.length);
console.log('SCENARIOS:', scenSection.length, '(objects with {name:):', (scenSection.match(/{name:/g) || []).length);
console.log('CODE:', codeSection.length);

// Verify SCENARIOS
try {
    new Function(depSection + '\n\n' + platSection + '\n\n' + modelSection + '\n\n' + scenSection);
    console.log('Data section: OK ✅');
} catch(e) {
    console.log('Data section ERROR:', e.message);
}

// Build clean script
var cleanScript = depSection + '\n\n' + platSection + '\n\n' + modelSection + '\n\n' + scenSection + '\n\n' + codeSection;

// Fix 1: s.sop.split(' → ') -> String(s.sop).split('\n')
cleanScript = cleanScript.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");

// Fix 2: s.sop.join(' ') -> String(s.sop).split('\n').join(' ')
cleanScript = cleanScript.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix 3: toggleSop innerHTML
var toggleMatch = cleanScript.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggleMatch) {
    var newToggle = 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"▲":"▼";a.previousSibling.textContent=show?"收起 ":"展开 ";}';
    cleanScript = cleanScript.replace(toggleMatch[0], newToggle);
    console.log('Fixed toggleSop ✅');
}

console.log('\nClean script length:', cleanScript.length);

// Verify full script
try {
    new Function(cleanScript);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('Context:', JSON.stringify(cleanScript.substring(pos - 50, pos + 80)));
    }
}

// Write
var newHtml = h.substring(0, si) + '\n' + cleanScript + '\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten. HTML length:', newHtml.length);
console.log('Done! ✅');
