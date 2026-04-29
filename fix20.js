const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// The problem: extra ] between SCENARIOS and // State
// Fix: extract SCENARIOS content, rebuild properly

const scenIdx = script.indexOf('const SCENARIOS=');
const stateIdx = script.indexOf('// State');

// Extract before SCENARIOS
const before = script.substring(0, scenIdx); // up to "const SCENARIOS="

// Extract SCENARIOS - find its proper closing ] using bracket counting
let depth = 0, inStr = false;
let scenStart = -1, scenEnd = -1;
for (let i = scenIdx + 'const SCENARIOS='.length; i < script.length; i++) {
    const c = script[i], p = script[i-1];
    if (c === '\\' && p !== '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') { if (scenStart === -1) scenStart = i; depth++; continue; }
    if (c === ']') { depth--; if (depth === 0) { scenEnd = i; break; } }
}

console.log('SCENARIOS: from', scenStart, 'to', scenEnd);
const scenContent = script.substring(scenStart + 1, scenEnd); // just the array content
const afterScen = script.substring(scenEnd + 1); // from after ]
console.log('After SCENARIOS ]:', JSON.stringify(afterScen.substring(0, 50)));
console.log('Should start with: ];');

// Extract what comes AFTER SCENARIOS (after the ] of ];
// The section from after the ] to // State should be \n\n
const afterBracket = script.substring(scenEnd + 1, stateIdx);
console.log('Content between ] and // State:', JSON.stringify(afterBracket));

// Build proper SCENARIOS section
const properScen = 'const SCENARIOS=[' + scenContent + '];';

// Build new script
const newScript = before + properScen + '\n\n' + afterScen;

console.log('\nOld script length:', script.length);
console.log('New script length:', newScript.length);

// Rebuild HTML
const htmlStart = html.substring(0, html.indexOf('<script>') + 8);
const htmlEnd = html.substring(html.indexOf('</script>'));
const newHtml = htmlStart + newScript + htmlEnd;

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('File written, length:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK - objects:', JSON.parse('[' + scenContent + ']').length);
} catch(e) {
    console.log('JS ERROR:', e.message);
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.log('Near position:', pos, JSON.stringify(verifyScript.substring(pos-10, pos+30)));
    }
}
