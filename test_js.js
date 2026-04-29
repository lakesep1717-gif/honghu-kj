const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    console.log('JavaScript syntax: OK');
  } catch(e) {
    console.log('JS ERROR:', e.message);
  }
} else {
  console.log('No script found');
}
