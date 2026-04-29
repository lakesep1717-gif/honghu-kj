var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));
var s2 = 61529;

// Show 200 chars before s2
console.log('Chars [61329-61559]:', JSON.stringify(sc.substring(61329, 61559)));

// Show last 100 chars before // State (122202)
console.log('\nChars [122100-122210]:', JSON.stringify(sc.substring(122100, 122210)));

// Find last ] in range [122000, 122200]
var last = -1;
for (var i = 122000; i < 122202; i++) {
    if (sc[i] === ']') last = i;
}
console.log('\nLast ] in [122000, 122202):', last);
console.log('Context:', JSON.stringify(sc.substring(last - 3, last + 15)));

// Now: find where the SCENARIOS array actually ends
// by doing bracket balance from s2+17
var depth = 0, inStr = false, esc = false;
var arrEnd = -1;
for (var i = s2 + 18; i < sc.length; i++) {
    var c = sc[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth < 0) { arrEnd = i; break; } }
}
console.log('\nfindArrayEnd from s2+18:', arrEnd);
if (arrEnd !== -1) {
    console.log('Context:', JSON.stringify(sc.substring(arrEnd - 5, arrEnd + 15)));
}

// Let's just use the FIRST '];' from s2+18
var semiClose = -1;
for (var i = s2 + 18; i < sc.length; i++) {
    if (sc[i] === ';' && sc[i-1] === ']') { semiClose = i; break; }
}
console.log('\nFirst ]; from s2+18:', semiClose);
if (semiClose !== -1) {
    console.log('Context:', JSON.stringify(sc.substring(semiClose - 5, semiClose + 15)));
}
