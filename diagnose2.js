var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var script = h.substring(si, ei);

console.log('Script length:', script.length);

// Find first SCENARIOS
var s1 = script.indexOf('const SCENARIOS=');
var s2 = script.indexOf('const SCENARIOS=', s1 + 1);
console.log('First SCENARIOS at', s1, 'Second at', s2);

// Robust array end finder:
// - Tracks depth while respecting strings
// - Also tracks whether we're INSIDE the string "const SCENARIOS="
//   and ignores that occurrence (it's just text in the string)
function findArrayEnd(s, startIdx) {
    var depth = 0, inString = false, escaped = false;
    for (var i = startIdx; i < s.length; i++) {
        var c = s[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { 
            // Check if this is the start of "const SCENARIOS="
            if (!inString && s.substring(i, i + 18) === '"const SCENARIOS=') {
                // Skip the entire string "const SCENARIOS=[...]"
                var endStr = s.indexOf('"', i + 18);
                if (endStr !== -1) { i = endStr; continue; }
            }
            inString = !inString; 
            continue; 
        }
        if (inString) continue;
        if (c === '[') { depth++; continue; }
        if (c === ']') { depth--; if (depth < 0) return i; }
    }
    return -1;
}

// Find array end for first SCENARIOS
var firstEnd = findArrayEnd(script, s1 + 'const SCENARIOS='.length);
console.log('First SCENARIOS ends at', firstEnd);
if (firstEnd !== -1) {
    console.log('First end context:', JSON.stringify(script.substring(firstEnd - 3, firstEnd + 10)));
}

// Find array end for second SCENARIOS
var secondEnd = findArrayEnd(script, s2 + 'const SCENARIOS='.length);
console.log('Second SCENARIOS ends at', secondEnd);
if (secondEnd !== -1) {
    console.log('Second end context:', JSON.stringify(script.substring(secondEnd - 3, secondEnd + 10)));
}

// Verify with char-by-char count
var realEnd = secondEnd;
if (realEnd !== -1) {
    var c = 0;
    for (var i = s2 + 18; i < realEnd; i++) {
        if (script[i] === '[') c++;
        else if (script[i] === ']') c--;
    }
    console.log('Bracket balance at secondEnd:', c, '(should be -1)');
}

// Find // State by char scan
var realState = -1;
for (var i = s2 + 1; i < script.length - 8; i++) {
    if (script[i] === '/' && script[i+1] === '/' && script.substring(i+2, i+8) === ' State') {
        realState = i;
        break;
    }
}
console.log('Real // State at', realState);
console.log('Context:', JSON.stringify(script.substring(realState, realState + 30)));

// Extract sections
var d1 = script.indexOf('const DEPTS=');
var p1 = script.indexOf('const PLATFORMS=');
var m1 = script.indexOf('const MODELS=');

var depSection = script.substring(d1, p1).trimEnd();
var platSection = script.substring(p1, m1).trimEnd();
var modelSection = script.substring(m1, s1).trimEnd();
var scenSection = script.substring(s1, firstEnd + 1).trimEnd();
var codeSection = script.substring(realState);

console.log('\nSection lengths:');
console.log('DEPTS:', depSection.length, '({name::', (depSection.match(/{name:/g) || []).length);
console.log('PLATFORMS:', platSection.length);
console.log('MODELS:', modelSection.length);
console.log('SCENARIOS:', scenSection.length, '({name::', (scenSection.match(/{name:/g) || []).length);
console.log('CODE:', codeSection.length);

// Verify data section
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

// Fix 3: toggleSop
var toggleMatch = cleanScript.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggleMatch) {
    var newToggle = 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"▲":"▼";a.previousSibling.textContent=show?"收起 ":"展开 ";}';
    cleanScript = cleanScript.replace(toggleMatch[0], newToggle);
    console.log('Fixed toggleSop ✅');
}

console.log('\nClean script length:', cleanScript.length);

// Verify
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
