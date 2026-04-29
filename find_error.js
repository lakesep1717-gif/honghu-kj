const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log('No script'); process.exit(); }

const code = scriptMatch[1];
const lines = code.split('\n');

// Try to find the problematic line by parsing increasingly
for (let i = 1; i <= lines.length; i++) {
  const partial = lines.slice(0, i).join('\n');
  try {
    new Function(partial);
  } catch(e) {
    console.log('Error at line', i, ':', e.message);
    console.log('Line content:', JSON.stringify(lines[i-1].substring(0, 100)));
    // Show context
    if (i > 1) console.log('Prev line:', JSON.stringify(lines[i-2].substring(0, 100)));
    break;
  }
}
