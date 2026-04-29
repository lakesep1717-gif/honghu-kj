const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Fix: use indexOf for the script boundaries to avoid regex issues
const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd = html.indexOf('</script>');
const script = html.substring(scriptStart, scriptEnd);

console.log('Script length:', script.length);
console.log('First 50 chars (raw):', JSON.stringify(script.substring(0, 50)));
console.log('First 50 chars (printable):', script.substring(0, 50));

// Check the actual bytes
const bytes = [...script.substring(0, 30)].map(c => c.charCodeAt(0));
console.log('First 30 char codes:', bytes);

// Test constants section
const stateIdx = script.indexOf('// State');
const constCode = script.substring(0, stateIdx);
console.log('\nConstants code length:', constCode.length);
console.log('Last 100 chars of constCode:', JSON.stringify(constCode.substring(constCode.length - 100)));

// Check if constCode ends cleanly
console.log('Last 50 chars:', JSON.stringify(constCode.substring(constCode.length - 50)));

// Check if there is an extra " somewhere
const doubleQuoteCount = (constCode.match(/"/g) || []).length;
console.log('Double quote count in constCode:', doubleQuoteCount);

// Show where DEPTS ends
const deptEndIdx = constCode.indexOf('];', 2);
console.log('First ]; after DEPTS at:', deptEndIdx);
console.log('Content:', JSON.stringify(constCode.substring(deptEndIdx - 20, deptEndIdx + 20)));
