const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Fix: use indexOf instead of regex to find just the first <script>
const scriptTagStart = html.indexOf('<script>');
const scriptTagEnd = html.indexOf('</script>');
if (scriptTagStart === -1 || scriptTagEnd === -1) { console.log('NO SCRIPT TAG'); process.exit(1); }

const scriptStart = scriptTagStart + '<script>'.length;
const scriptEnd = scriptTagEnd;
const script = html.substring(scriptStart, scriptEnd);

console.log('Script length:', script.length);

// Remove \r
const clean = script.replace(/\r/g, '\n');

// Find SCENARIOS boundaries
const scenPrefix = 'const SCENARIOS=';
const scenStart = clean.indexOf(scenPrefix);
if (scenStart === -1) { console.log('NO SCENARIOS'); process.exit(1); }
const arrayStart = scenStart + scenPrefix.length;

// Find matching ] using bracket counting
let depth = 0;
let inStr = false;
let arrayEnd = -1;
for (let i = arrayStart; i < clean.length; i++) {
    const c = clean[i];
    if (c === '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') { depth++; continue; }
    if (c === ']') {
        depth--;
        if (depth === 0) { arrayEnd = i; break; }
    }
}

if (arrayEnd === -1) { console.log('NO MATCHING ]'); process.exit(1); }

console.log('Array [ at', arrayStart, '] at', arrayEnd);

// Extract array content (between [ and ] exclusive)
const rawContent = clean.substring(arrayStart + 1, arrayEnd);

// Fix newlines INSIDE strings only
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

// Build new script: before + [ + fixedContent + ]
const before = clean.substring(0, arrayStart + 1);
const after = clean.substring(arrayEnd);
const newScript = before + fixedContent + after;

// Build new HTML: replace only the first <script>...</script>
const beforeHtml = html.substring(0, scriptTagStart);
const afterHtml = html.substring(scriptTagEnd + '</script>'.length);
const newHtml = beforeHtml + '<script>' + newScript + '</script>' + afterHtml;

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('New HTML length:', newHtml.length);
console.log('Script length in new html:', newHtml.indexOf('</script>') - newHtml.indexOf('<script>') - 8);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
}
