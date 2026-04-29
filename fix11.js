const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');

const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));
const scenIdx = script.indexOf('const SCENARIOS=');

// Extract just the SCENARIOS array
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
const arrayCode = 'const ARR=[' + rawContent + '];';

// Test with JS Function
try {
    new Function(arrayCode);
    console.log('JS VALID: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
    // Show around error position
    const posMatch = e.message.match(/position (\d+)/);
    const pos = posMatch ? parseInt(posMatch[1]) : 0;
    console.log('Near position:', pos, JSON.stringify(arrayCode.substring(Math.max(0, pos-20), pos+30)));
    console.log('Chars at pos:', JSON.stringify(arrayCode.substring(pos-5, pos+5)));
}

// Now show first 200 chars of array
console.log('\nFirst 200 chars of SCENARIOS content:');
console.log(JSON.stringify(rawContent.substring(0, 200)));
console.log('\nChars 0-10:', JSON.stringify(rawContent.substring(0, 10)));
console.log('Byte codes:', [...rawContent.substring(0, 10)].map(c => c.charCodeAt(0)));

// Look for any special chars at start
for (let i = 0; i < 10; i++) {
    const c = rawContent[i];
    console.log('Char', i, ':', JSON.stringify(c), '=', c.charCodeAt(0), c === '\n' ? '(LF)' : c === ' ' ? '(space)' : c === '{' ? '(brace)' : '');
}
