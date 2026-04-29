const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Remove \r to simplify
const clean = html.replace(/\r/g, '\n');

// Find the script
const scriptMatch = clean.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log('NO SCRIPT'); process.exit(1); }
let script = scriptMatch[1];

// Remove BOM or weird chars at start
script = script.replace(/^\uFEFF/, '');

// Find SCENARIOS start
const scenPrefix = 'const SCENARIOS=';
const scenStart = script.indexOf(scenPrefix);
if (scenStart === -1) { console.log('NO SCENARIOS'); process.exit(1); }
const arrayStart = scenStart + scenPrefix.length; // position of [

// Find matching ] using bracket counting
let depth = 0;
let inStr = false;
let arrayEnd = -1;
let i = arrayStart;
while (i < script.length) {
    const c = script[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '"') { inStr = !inStr; i++; continue; }
    if (inStr) { i++; continue; }
    if (c === '[') { depth++; i++; continue; }
    if (c === ']') {
        depth--;
        if (depth === 0) { arrayEnd = i; break; }
        i++;
        continue;
    }
    i++;
}

if (arrayEnd === -1) { console.log('Could not find matching ]'); process.exit(1); }

console.log('SCENARIOS: [ at ' + arrayStart + ' ] at ' + arrayEnd);
console.log('Before:  ', JSON.stringify(script.substring(arrayStart - 20, arrayStart + 20)));
console.log('After:   ', JSON.stringify(script.substring(arrayEnd - 10, arrayEnd + 30)));

// Extract array content (between [ and ] exclusive)
const rawContent = script.substring(arrayStart + 1, arrayEnd);
console.log('Raw content length:', rawContent.length);

// Fix newlines INSIDE strings
let fixed = [];
inStr = false;
for (let j = 0; j < rawContent.length; j++) {
    const c = rawContent[j];
    if (c === '\\') {
        // escaped char - copy both
        fixed.push(c);
        j++;
        if (j < rawContent.length) fixed.push(rawContent[j]);
        continue;
    }
    if (c === '"') { inStr = !inStr; fixed.push(c); continue; }
    if (c === '\n' && inStr) { fixed.push('\\n'); continue; }
    fixed.push(c);
}
const fixedContent = fixed.join('');

// Reconstruct
const before = script.substring(0, arrayStart + 1); // includes [
const after = script.substring(arrayEnd); // starts with ]
const newScript = before + fixedContent + after;
const newHtml = clean.replace(/<script>[\s\S]*?<\/script>/, '<script>' + newScript + '</script>');

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('New HTML length:', newHtml.length);

// Verify
const verifyScript = newHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message, 'Line:', e.lineNumber);
}
