const fs = require('fs');

// Read the raw file and check for encoding issues
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
console.log('File size (bytes):', html.length);

// Find <script> tag position in bytes
const scriptStart = html.indexOf(Buffer.from('<script>'));
const scriptEnd = html.indexOf(Buffer.from('</script>'));
console.log('<script> at byte:', scriptStart);
console.log('</script> at byte:', scriptEnd);

// Extract raw script bytes
const scriptBytes = html.subarray(scriptStart + 8, scriptEnd);
console.log('Script byte length:', scriptBytes.length);
console.log('First 10 bytes:', scriptBytes.subarray(0, 10));

// Try to decode
try {
  const decoded = scriptBytes.toString('utf-8');
  console.log('Decoded successfully, first 50 chars:', decoded.substring(0, 50));
  
  // Test in Function
  try {
    new Function(decoded);
    console.log('Function: OK');
  } catch(e) {
    console.log('Function error:', e.message);
  }
} catch(e) {
  console.log('Decode error:', e.message);
}

// Check for BOM
console.log('\nBOM check:');
console.log('First 3 bytes:', html.subarray(0, 3));

// Check for other encoding issues - look for any byte sequences that are invalid UTF-8
console.log('\nChecking for invalid UTF-8 sequences...');
const scriptContent = html.subarray(scriptStart + 8, scriptEnd);
for (let i = 0; i < Math.min(100, scriptContent.length); i++) {
  const byte = scriptContent[i];
  // Check for control chars that shouldn't appear in JS (except tab, newline, cr)
  if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
    console.log(`Suspicious byte at position ${i}: ${byte} (0x${byte.toString(16)})`);
  }
}
