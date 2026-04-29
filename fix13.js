const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');

const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Show the last 500 chars
console.log('=== LAST 500 CHARS OF SCRIPT ===');
console.log(JSON.stringify(script.substring(script.length - 500)));

// Check around position 60518
console.log('\n=== AROUND 60518 ===');
console.log(JSON.stringify(script.substring(60500, 60540)));

// Check around position 60522
console.log('\n=== AROUND 60522 ===');
console.log(JSON.stringify(script.substring(60510, 60550)));

// Find all ] positions in last 1000 chars
const lastPart = script.substring(script.length - 1000);
console.log('\n=== ] POSITIONS IN LAST 1000 ===');
for (let i = 0; i < lastPart.length; i++) {
    if (lastPart[i] === ']') {
        const absPos = script.length - 1000 + i;
        console.log('] at', absPos, ':', JSON.stringify(script.substring(Math.max(0,absPos-10), absPos+20)));
    }
}

// Extract just SCENARIOS array and test
const scenIdx = script.indexOf('const SCENARIOS=');
let depth = 0, inStr = false, arrayStart = -1, arrayEnd = -1;
for (let i = scenIdx + 'const SCENARIOS='.length; i < script.length; i++) {
    const c = script[i], p = script[i-1];
    if (c === '\\' && p !== '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[' && arrayStart === -1) { arrayStart = i; depth++; continue; }
    if (c === '[') { depth++; continue; }
    if (c === ']') { depth--; if (depth === 0) { arrayEnd = i; break; } }
}
const rawContent = script.substring(arrayStart + 1, arrayEnd);

// Test if ARR=[...]; is valid
const testCode = 'const ARR=[' + rawContent + '];';
try {
    new Function(testCode);
    console.log('\nARR=[...]; is VALID');
} catch(e) {
    console.log('\nARR=[...]; ERROR:', e.message);
}

// Test if DEPTS is valid
const deptStart = script.indexOf('const DEPTS=');
const deptContent = script.substring(deptStart, deptStart + 200);
console.log('\nDEPTS start:', JSON.stringify(deptContent));
