const fs = require('fs');

// The current file has a broken structure with duplicate arrays.
// Strategy: read the CURRENT file, find ALL 216 scenario objects,
// then rebuild a clean file.

// Read current broken file
const h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = h.substring(h.indexOf('<script>') + 8, h.indexOf('</script>'));

// Find all '// State' occurrences
let positions = [];
let pos = 0;
while (true) {
    const idx = script.indexOf('// State', pos);
    if (idx === -1) break;
    positions.push(idx);
    pos = idx + 1;
}
console.log('// State positions:', positions);

// Second // State (real divider) is at positions[1] if positions.length > 1
const realState = positions[1] !== undefined ? positions[1] : positions[0];
console.log('Real state divider at:', realState);

// Extract the full SCENARIOS from the SECOND occurrence of 'const SCENARIOS='
// (which has the complete 216-object data)
const allScenStarts = [];
pos = 0;
while (true) {
    const idx = script.indexOf('const SCENARIOS=', pos);
    if (idx === -1) break;
    allScenStarts.push(idx);
    pos = idx + 1;
}
console.log('SCENARIOS positions:', allScenStarts);
console.log('Lengths of SCENARIOS sections:');
allScenStarts.forEach((start, i) => {
    const end = i < allScenStarts.length - 1 ? allScenStarts[i+1] : realState;
    console.log('  #' + (i+1) + ': pos ' + start + ' to ' + end + ' = ' + (end - start) + ' chars');
});

// The second SCENARIOS (allScenStarts[1]) should have the full 216 objects
const fullScenStart = allScenStarts[1];
const fullScenEnd = allScenStarts[2] !== undefined ? allScenStarts[2] : realState;
console.log('\nFull SCENARIOS from', fullScenStart, 'to', fullScenEnd);

// Extract SCENARIOS content - find its [ and ]
let d = 0, inStr = false;
let arrStart = -1, arrEnd = -1;
for (let i = fullScenStart + 'const SCENARIOS='.length; i < fullScenEnd; i++) {
    const c = script[i];
    if (c === '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') { d++; if (arrStart === -1) arrStart = i; continue; }
    if (c === ']') { d--; if (d === 0) { arrEnd = i; break; } }
}
console.log('Full SCENARIOS [ at', arrStart, '] at', arrEnd);
const fullScenContent = script.substring(arrStart + 1, arrEnd);
console.log('Full SCENARIOS content length:', fullScenContent.length);
console.log('First 200 chars:', JSON.stringify(fullScenContent.substring(0, 200)));

// Count objects
const objCount = (fullScenContent.match(/{/g) || []).length;
console.log('Object count:', objCount);

// Extract DEPTS and PLATFORMS and MODELS from FIRST occurrence
const dIdx = script.indexOf('const DEPTS=');
const pIdx = script.indexOf('const PLATFORMS=');
const mIdx = script.indexOf('const MODELS=');

// DEPTS: from dIdx to before PLATFORMS (which starts with [
const deptContent = script.substring(dIdx, pIdx);
console.log('\nDEPTS content len:', deptContent.length);

// PLATFORMS: from pIdx to before MODELS
const platContent = script.substring(pIdx, mIdx);
console.log('PLATFORMS content len:', platContent.length);

// MODELS: from mIdx to before SCENARIOS
const modelContent = script.substring(mIdx, fullScenStart);
console.log('MODELS content len:', modelContent.length);

// State code: from realState to end
const stateCode = script.substring(realState);
console.log('State code len:', stateCode.length);

// Build new clean script
const newScript = '\n\n' + deptContent + platContent + modelContent + 'const SCENARIOS=[' + fullScenContent + '];\n\n' + stateCode;

console.log('\nNew script len:', newScript.length);
console.log('Old script len:', script.length);

// Verify object count
const newObjCount = (fullScenContent.match(/{/g) || []).length;
console.log('Object count in new script:', newObjCount);

// Build new HTML
const htmlStart = h.substring(0, h.indexOf('<script>') + 8);
const htmlEnd = h.substring(h.indexOf('</script>'));
const newHtml = htmlStart + newScript + htmlEnd;

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('Written. Total len:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>')+8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.log('Near position:', pos, JSON.stringify(verifyScript.substring(Math.max(0,pos-20), pos+40)));
    }
}
