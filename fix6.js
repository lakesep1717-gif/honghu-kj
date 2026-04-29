const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Remove \r to simplify
const clean = html.replace(/\r/g, '');

// Find the first <script> tag
const scriptTagStart = clean.indexOf('<script>');
const scriptTagEnd = clean.indexOf('</script>');
const script = clean.substring(scriptTagStart + 8, scriptTagEnd);

console.log('=== SCRIPT BOUNDARIES ===');
console.log('Script tag start:', scriptTagStart, 'Script tag end:', scriptTagEnd);
console.log('Script length:', script.length);

// Find SCENARIOS
const scenIdx = script.indexOf('const SCENARIOS=');
const bracketIdx = script.indexOf('[', scenIdx);
console.log('\n=== BRACKET COUNTING ===');
let depth = 0, inStr = false;
let bracketPositions = [];
for (let i = bracketIdx; i < script.length; i++) {
    if (script[i] === '\\') { i++; continue; }
    if (script[i] === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (script[i] === '[') { depth++; bracketPositions.push(i + '['); }
    if (script[i] === ']') {
        depth--;
        bracketPositions.push(i + ']');
        if (depth === 0) { console.log('Final ] at position', i, 'of script'); break; }
    }
}

// Print last 20 bracket positions
console.log('Last 20 bracket events:', bracketPositions.slice(-20));

// Find where ] is and show context
const finalBracket = bracketPositions[bracketPositions.length - 1];
const fbPos = parseInt(finalBracket);
console.log('\nContext around final ]:');
console.log(JSON.stringify(script.substring(fbPos - 5, fbPos + 30)));

// Now show what fix4.js was doing wrong
// fix4.js does: after = script.substring(arrayEnd);  // from ] onwards
// This would be everything from the ] including the next ]
// Let me check
const afterFix4Style = script.substring(fbPos);
console.log('\nfix4.js after (from final ]):');
console.log(JSON.stringify(afterFix4Style.substring(0, 50)));
console.log('\nThis includes the extra ] at the END of SCENARIOS!');

// What fix5.js does
const rawContent = script.substring(bracketIdx + 1, fbPos);
const fixedContent = rawContent.replace(/\n(?=")/g, '\\n');
const beforeFix5 = script.substring(0, bracketIdx + 1);
const afterFix5 = script.substring(fbPos + 1);
const newScript = beforeFix5 + fixedContent + ']' + afterFix5;
const newHtml = clean.substring(0, scriptTagStart) + '<script>' + newScript + '</script>' + clean.substring(scriptTagEnd + 9);
console.log('\n=== VERIFYING fix5.js RESULT ===');
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message, 'Line:', e.lineNumber);
    const lines = verifyScript.split('\n');
    if (e.lineNumber) {
        const ln = e.lineNumber;
        console.log('Line', ln, ':', JSON.stringify(lines[ln-1]));
        if (ln > 1) console.log('Line', ln-1, ':', JSON.stringify(lines[ln-2]));
    }
}

// Apply fix
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('\nFile written!');
