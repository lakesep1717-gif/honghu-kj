const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Find SCENARIOS boundaries exactly
const scenStart = html.indexOf('const SCENARIOS=[') + 'const SCENARIOS='.length;
const scenEnd = html.indexOf('];', scenStart);

// Extract the scenarios content
const scenContent = html.substring(scenStart, scenEnd);
console.log('Scenarios content length:', scenContent.length);
console.log('Scenarios starts with:', JSON.stringify(scenContent.substring(0, 60)));

// Fix: replace actual newlines INSIDE string literals
let fixed = [];
let in_string = false;
let i = 0;
while (i < scenContent.length) {
    const c = scenContent[i];
    if (c === '\\') {
        fixed.push(c);
        i++;
        if (i < scenContent.length) { fixed.push(scenContent[i]); i++; }
        continue;
    }
    if (c === '"') {
        in_string = !in_string;
        fixed.push(c);
        i++;
        continue;
    }
    if (c === '\n' && in_string) {
        fixed.push('\\n');
        i++;
        continue;
    }
    if (c === '\r' && in_string) { i++; continue; }
    fixed.push(c);
    i++;
}

const fixedContent = fixed.join('');

// Reconstruct HTML
const before = html.substring(0, scenStart);
const after = html.substring(scenEnd + 2); // +2 to skip '];'
const newHtml = before + fixedContent + '];' + after;

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('New HTML length:', newHtml.length);
console.log('Done!');
