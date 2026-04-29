var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var sc = h.substring(si, ei);
console.log('Script length:', sc.length);

// Find the two SCENARIOS starts
var s1 = sc.indexOf('const SCENARIOS=');
var s2 = sc.indexOf('const SCENARIOS=', s1 + 1);
console.log('SCENARIOS #1 at', s1, ', #2 at', s2);

// Find DEPTS occurrences
var depPositions = [];
var p = 0;
while (true) {
    var idx = sc.indexOf('const DEPTS=', p);
    if (idx === -1) break;
    depPositions.push(idx);
    p = idx + 1;
}
console.log('DEPTS positions:', depPositions);

// Context around first DEPTS end (first one after SCENARIOS #1 starts)
var afterS1 = sc.substring(s1 + 20, s1 + 200);
console.log('\nContext after SCENARIOS #1 start (chars 20-200):');
console.log(JSON.stringify(afterS1));

// Find // State by char scan
var statePositions = [];
for (var i = 0; i < sc.length - 8; i++) {
    if (sc[i] === '/' && sc[i+1] === '/' && sc.substring(i+2, i+8) === ' State') {
        statePositions.push(i);
    }
}
console.log('\n// State positions:', statePositions);

// CORRECT APPROACH: find the closing bracket of SCENARIOS #2
// by scanning from #2's start and tracking depth
// We need to track: strings, and IGNORE 'const SCENARIOS=' if inside string

// The valid closing ] is followed by '\n\n//' or '\n\nconst'
// Let's find it by scanning from s2 to end, tracking depth
var depth = 0, inStr = false, esc = false;
var closePos = -1;
var i = s2 + 'const SCENARIOS='.length;
for (; i < sc.length; i++) {
    var c = sc[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') { depth++; continue; }
    if (c === ']') { depth--; if (depth < 0) { closePos = i; break; } }
}
console.log('\nSCENARIOS #2 ends at', closePos);
if (closePos !== -1) {
    console.log('Context after close:', JSON.stringify(sc.substring(closePos - 5, closePos + 30)));
    // Check char at closePos+1
    console.log('Char at closePos+1:', sc[closePos+1], 'code:', sc.charCodeAt(closePos+1));
    console.log('Char at closePos+2:', sc[closePos+2], 'code:', sc.charCodeAt(closePos+2));
    console.log('Char at closePos+3:', sc[closePos+3], 'code:', sc.charCodeAt(closePos+3));
}

// Verify: check bracket count
var cnt = 0;
for (var j = s2 + 'const SCENARIOS='.length; j < closePos; j++) {
    if (sc[j] === '[') cnt++;
    else if (sc[j] === ']') cnt--;
}
console.log('Balance from s2 start to closePos:', cnt, '(should be -1)');

// Also check: what's at position 61103 (second DEPTS)?
console.log('\nChar at 61102:', sc[61102], 'code:', sc.charCodeAt(61102));
console.log('Char at 61103:', sc[61103], 'code:', sc.charCodeAt(61103));
console.log('Context 61090-61120:', JSON.stringify(sc.substring(61090, 61120)));
