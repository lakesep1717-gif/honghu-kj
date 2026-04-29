const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptTagStart = html.indexOf('<script>') + 8;
const scriptTagEnd = html.indexOf('</script>');
const code = html.substring(scriptTagStart, scriptTagEnd);

// Test: remove leading \r and test
const trimmed = code.replace(/^\r\n/, '');
try {
  new Function(trimmed);
  console.log('Trimmed code: OK');
} catch(e) {
  console.log('Trimmed error:', e.message);
  const lines = trimmed.split('\n');
  console.log('First 5 lines:');
  for (let i = 0; i < 5; i++) {
    console.log(`[${i}]: ${JSON.stringify(lines[i].substring(0, 80))}`);
  }
}

// Test: remove ALL leading whitespace
const stripped = code.trimStart();
try {
  new Function(stripped);
  console.log('Stripped code: OK');
} catch(e) {
  console.log('Stripped error:', e.message);
}

// Check: does the script tag itself contain </script>?
const raw = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const rawIdx = raw.indexOf('<script>') + 8;
const rawEnd = raw.indexOf('</script>');
const rawCode = raw.substring(rawIdx, rawEnd);
console.log('\nRaw code bytes around start:');
const bytes = Buffer.from(rawCode.substring(0, 50));
console.log(bytes);
console.log('First 5 bytes:', bytes.subarray(0, 5));

// Check for BOM or other invisible chars
console.log('\nFirst char code:', rawCode.charCodeAt(0), rawCode.substring(0, 3));
