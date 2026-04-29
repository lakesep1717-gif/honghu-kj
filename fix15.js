const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Find strings with unescaped / (potential regex issue)
// Strategy: look for / that appears as unescaped inside a string

// First, let's test if the SCENARIOS array has the issue
const scenIdx = script.indexOf('const SCENARIOS=');
const rawContent = script.substring(scenIdx + 'const SCENARIOS='.length);

// Test the raw content for regex issues
// Count potential regex-like patterns inside strings
let depth = 0, inStr = false, inStrChar = null;
const issues = [];
for (let i = 0; i < rawContent.length; i++) {
    const c = rawContent[i], p = rawContent[i-1];
    if (c === '\\') { i++; continue; }
    if ((c === '"' || c === "'") && !inStr) { inStr = true; inStrChar = c; continue; }
    if (inStr && c === inStrChar) { inStr = false; inStrChar = null; continue; }
    if (inStr && c === '/' && p !== '\\' && p !== ':') {
        // Potential regex start - check if followed by valid pattern
        const after = rawContent.substring(i+1, i+30);
        if (/[a-zA-Z0-9_\s]/.test(after[0])) {
            issues.push({pos: i, context: rawContent.substring(Math.max(0,i-20), i+30)});
        }
    }
}
console.log('Potential regex issues found:', issues.length);
issues.slice(0, 5).forEach((iss, idx) => {
    console.log('Issue', idx+1, ':', JSON.stringify(iss.context));
});

// Check for \n being present (which we want to replace)
// Count \n in rawContent
const newlineCount = (rawContent.match(/\n/g) || []).length;
console.log('\nActual newlines in rawContent:', newlineCount);

// Now fix: replace actual \n inside strings with \\n
// Use a proper string-aware replacement
let fixed = [], inString = false;
for (let i = 0; i < rawContent.length; i++) {
    const c = rawContent[i];
    if (c === '\\') { fixed.push(c); i++; if (i < rawContent.length) fixed.push(rawContent[i]); continue; }
    if (c === '"' || c === "'") { inString = !inString; fixed.push(c); continue; }
    if (c === '\n' && inString) { fixed.push('\\n'); continue; }
    if (c === '/' && inString) {
        // Escape slashes in strings to prevent regex interpretation
        fixed.push('\\/');
        continue;
    }
    fixed.push(c);
}
const fixedContent = fixed.join('');

// Reconstruct
const newScript = script.substring(0, scenIdx + 'const SCENARIOS='.length) + fixedContent + script.substring(scenIdx + 'const SCENARIOS='.length + rawContent.length);
const newHtml = html.substring(0, html.indexOf('<script>') + 8) + newScript + html.substring(html.indexOf('</script>'));

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('New HTML written, length:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.log('Near position:', pos, JSON.stringify(verifyScript.substring(pos-10, pos+30)));
    }
}
