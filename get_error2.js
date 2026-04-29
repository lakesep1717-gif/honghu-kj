const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptTagStart = html.indexOf('<script>') + 8;
const scriptTagEnd = html.indexOf('</script>');
const code = html.substring(scriptTagStart, scriptTagEnd);

try {
  const script = new vm.Script(code, { filename: 'test.js' });
  console.log('vm.Script: OK');
} catch(e) {
  console.log('vm.Script ERROR:', e.message);
  // e.stack contains line info
  console.log('Stack:', e.stack ? e.stack.split('\n').slice(0, 5).join('\n') : 'no stack');
}

// Also try: parse the script by wrapping
try {
  const wrapped = `(function(){\n${code}\n})()`;
  new Function(wrapped);
  console.log('Wrapped: OK');
} catch(e) {
  console.log('Wrapped ERROR:', e.message);
  if (e.lineNumber) {
    console.log('Line:', e.lineNumber, 'Col:', e.columnNumber);
    const lines = code.split('\n');
    if (e.lineNumber) {
      console.log('Problem line:', JSON.stringify(lines[e.lineNumber - 1]?.substring(0, 100)));
    }
  }
}

// Search for the actual invalid character
console.log('\n--- Searching for invalid characters in first 1000 chars ---');
const first1000 = code.substring(0, 1000);
for (let i = 0; i < first1000.length; i++) {
  const c = first1000.charCodeAt(i);
  if (c < 32 && c !== 9 && c !== 10 && c !== 13) {
    console.log(`Invalid char at pos ${i}: code=${c}, char='${first1000[i]}'`);
  }
}
