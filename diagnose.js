const fs = require('fs');
const h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
const script = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));
console.log('Script len:', script.length);

// Find SCENARIOS
const sIdx = script.indexOf('const SCENARIOS=');
console.log('SCENARIOS at', sIdx);

// Find array end
function findArrayEnd(s, startIdx) {
    let depth = 0, inString = false, escaped = false;
    for (let i = startIdx; i < s.length; i++) {
        const c = s[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (c === '[') { depth++; continue; }
        if (c === ']') { depth--; if (depth === 0) return i; }
    }
    return -1;
}

const arrEnd = findArrayEnd(script, sIdx + 'const SCENARIOS='.length);
console.log('findArrayEnd returns:', arrEnd);
console.log('Chars at arrEnd:', JSON.stringify(script.substring(arrEnd - 3, arrEnd + 8)));

// Find // State by scanning
let realState = -1;
for (let i = sIdx + 1; i < script.length - 8; i++) {
    if (script[i] === '/' && script[i+1] === '/' && script.substring(i+2, i+8) === ' State') {
        realState = i;
        break;
    }
}
console.log('Real // State at:', realState);
if (realState !== -1) {
    console.log('Chars at realState:', JSON.stringify(script.substring(realState, realState + 30)));
}

// Check: what does the first script(0 to arrEnd) look like?
const beforeArr = script.substring(0, arrEnd + 1);
const afterArr = script.substring(arrEnd + 1, arrEnd + 20);
console.log('\nAfter array end (+1 to +20):', JSON.stringify(afterArr));

// Binary search for real error
let lo = 0, hi = script.length;
function ok(x) {
    try { new Function(script.substring(0, x)); return true; } catch(e) { return false; }
}
while (hi - lo > 1) {
    var m = Math.floor((lo + hi) / 2);
    if (ok(m)) lo = m; else hi = m;
}
console.log('\nBinary search result: first bad at', hi);
console.log('Context:', JSON.stringify(script.substring(hi - 5, hi + 30)));
