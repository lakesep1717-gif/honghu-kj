const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Find where the <script> tag content actually starts (after the >)
const scriptTagStart = html.indexOf('<script>');
console.log('<script> at:', scriptTagStart);
console.log('Content at scriptTagStart+8:', JSON.stringify(html.substring(scriptTagStart, scriptTagStart+20)));

// Find the closing </script>
const scriptTagEnd = html.indexOf('</script>');
console.log('</script> at:', scriptTagEnd);
console.log('Content before </script>:', JSON.stringify(html.substring(scriptTagEnd-20, scriptTagEnd+10)));

// The actual JS code
const code = html.substring(scriptTagStart + 8, scriptTagEnd);
console.log('\nScript code length:', code.length);
console.log('First 30 chars:', JSON.stringify(code.substring(0, 30)));

// Check for </script> INSIDE the code
const innerScript = code.indexOf('</script>');
console.log('\n</script> inside code at:', innerScript);

// Check what's actually there
if (innerScript >= 0) {
  console.log('Context:', JSON.stringify(code.substring(innerScript-30, innerScript+30)));
}

// Check for invalid tokens
try {
  new Function(code);
  console.log('\nJS syntax: OK');
} catch(e) {
  console.log('\nJS ERROR:', e.message);
  // Find which line
  const lines = code.split('\n');
  console.log('Total lines:', lines.length);
  // Try different splits
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    console.log(`Line ${i+1}: ${JSON.stringify(lines[i].substring(0, 60))}`);
  }
}
