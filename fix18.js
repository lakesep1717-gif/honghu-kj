const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd = html.indexOf('</script>');
const script = html.substring(scriptStart, scriptEnd);

// Find the double ] before // State
const stateIdx = script.indexOf('// State');
console.log('// State at:', stateIdx);

// Look for the double ] near the SCENARIOS end
// Find SCENARIOS closing ] - the LAST ] before // State
let lastCloseBeforeState = -1;
for (let i = stateIdx - 1; i >= 0; i--) {
    if (script[i] === ']') { lastCloseBeforeState = i; break; }
}
console.log('Last ] before // State at:', lastCloseBeforeState);
console.log('Context:', JSON.stringify(script.substring(lastCloseBeforeState - 20, lastCloseBeforeState + 60)));

// Also find the previous ]
let prevClose = -1;
for (let i = lastCloseBeforeState - 1; i >= 0; i--) {
    if (script[i] === ']') { prevClose = i; break; }
}
console.log('Second-to-last ] at:', prevClose);
console.log('Context:', JSON.stringify(script.substring(prevClose, lastCloseBeforeState + 30)));

// The extra ] should be one of them
// Strategy: remove ONE ] that appears within 10 chars before the first valid SCENARIOS ]
// OR: just remove the duplicate ] near the end

// Check: between prevClose and lastCloseBeforeState
const between = script.substring(prevClose, lastCloseBeforeState + 1);
console.log('\nBetween prev and last close:', JSON.stringify(between));

// The extra ] is at lastCloseBeforeState (the one that shouldn't be there)
// Wait, let me count brackets properly
const scenIdx = script.indexOf('const SCENARIOS=');
let depth = 0, inStr = false;
let realScenEnd = -1;
for (let i = scenIdx; i < script.length; i++) {
    const c = script[i], p = script[i-1];
    if (c === '\\' && p !== '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') depth++;
    if (c === ']') { depth--; if (depth === 0) { realScenEnd = i; break; } }
}
console.log('\nReal SCENARIOS ] at:', realScenEnd);
console.log('Context:', JSON.stringify(script.substring(realScenEnd - 5, realScenEnd + 30)));

// The fix: remove the extra ] that's between realScenEnd and stateIdx
// The section between realScenEnd+1 and stateIdx should be \n\n only
const betweenExtra = script.substring(realScenEnd + 1, stateIdx);
console.log('\nBetween real end and // State:', JSON.stringify(betweenExtra));

// Remove the extra ] (and any junk) between realScenEnd and stateIdx
// Keep only one \n between realScenEnd and // State
const cleanBetween = '\n\n// State';
const fixedScript = script.substring(0, realScenEnd + 1) + cleanBetween + script.substring(stateIdx + cleanBetween.length);

const newHtml = html.substring(0, scriptStart) + fixedScript + html.substring(scriptEnd);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('\nNew HTML length:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
}
