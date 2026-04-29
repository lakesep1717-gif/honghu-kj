const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');

const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Find all unmatched ] using proper bracket counting (string-aware)
let depth = 0, inStr = false, i = 0;
const events = [];
while (i < script.length) {
    const c = script[i];
    const prev = script[i-1];
    if (c === '\\' && prev !== '\\') { i += 2; continue; }
    if (c === '"') { inStr = !inStr; i++; continue; }
    if (inStr) { i++; continue; }
    if (c === '[') { depth++; events.push({i, c, depth}); i++; continue; }
    if (c === ']') {
        depth--;
        events.push({i, c, depth});
        if (depth < 0) { console.log('UNDERFLOW at pos', i, JSON.stringify(script.substring(i-10, i+30))); depth = 0; }
        i++;
        continue;
    }
    i++;
}

// Show events with depth
const depthEvents = events.filter(e => e.depth <= 1);
console.log('Bracket events (depth <= 1):', JSON.stringify(depthEvents.slice(-10)));

// Find the SCENARIOS opening [
const scenIdx = script.indexOf('const SCENARIOS=');
let arrayDepth = 0, arrayStart = -1, arrayEnd = -1;
inStr = false; i = scenIdx + 'const SCENARIOS='.length;
while (i < script.length) {
    const c = script[i];
    const prev = script[i-1];
    if (c === '\\' && prev !== '\\') { i += 2; continue; }
    if (c === '"') { inStr = !inStr; i++; continue; }
    if (inStr) { i++; continue; }
    if (c === '[') { arrayDepth++; if (arrayStart === -1) arrayStart = i; i++; continue; }
    if (c === ']') { arrayDepth--; if (arrayDepth === 0) { arrayEnd = i; break; } i++; continue; }
    i++;
}
console.log('\nSCENARIOS: [ at', arrayStart, '] at', arrayEnd);
console.log('Content preview:', JSON.stringify(script.substring(arrayStart, arrayStart + 60)));

// Extract and fix the array content
const rawContent = script.substring(arrayStart + 1, arrayEnd);
console.log('Raw content length:', rawContent.length);

// Count objects
const objCount = (rawContent.match(/{/g) || []).length;
console.log('Object count in array:', objCount);

// Fix newlines INSIDE strings
let fixed = [];
inStr = false;
for (let j = 0; j < rawContent.length; j++) {
    const c = rawContent[j];
    if (c === '\\') { fixed.push(c); j++; if (j < rawContent.length) fixed.push(rawContent[j]); continue; }
    if (c === '"') { inStr = !inStr; fixed.push(c); continue; }
    if (c === '\n' && inStr) { fixed.push('\\n'); continue; }
    fixed.push(c);
}
const fixedContent = fixed.join('');

// Reconstruct
const newScript = script.substring(0, arrayStart + 1) + fixedContent + ']' + script.substring(arrayEnd + 1);
const newHtml = html.substring(0, html.indexOf('<script>') + 8) + newScript + html.substring(html.indexOf('</script>'));

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('\nNew HTML length:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message, 'Line:', e.lineNumber);
    const lines = verifyScript.split('\n');
    if (e.lineNumber) console.log('Line', e.lineNumber, ':', JSON.stringify(lines[e.lineNumber-1]));
}
