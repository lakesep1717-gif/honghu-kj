const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Find ALL script tags
const scriptRegex = /<script/g;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const endQuote = html.indexOf('>', match.index);
  const tag = html.substring(match.index, endQuote+1);
  console.log(`Script tag #${++count} at ${match.index}: ${tag}`);
}

// Also check for </script with different cases
const closeScripts = html.match(/<\/script>/gi);
if (closeScripts) console.log('\nClose scripts:', closeScripts.length, closeScripts.map(s => s));
