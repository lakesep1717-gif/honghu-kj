const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
try {
  new Function(script);
  console.log('JS SYNTAX: OK');
} catch(e) {
  console.log('JS ERROR:', e.message);
  const lines = script.split('\n');
  if (e.lineNumber) {
    console.log('Line:', e.lineNumber, 'Col:', e.columnNumber);
    console.log('Problem:', JSON.stringify(lines[e.lineNumber - 1]?.substring(Math.max(0, (e.columnNumber||1)-30), (e.columnNumber||1)+30)));
  } else {
    // Find position
    const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
    console.log('Near position:', pos, JSON.stringify(script.substring(Math.max(0,pos-20), pos+20)));
  }
}
