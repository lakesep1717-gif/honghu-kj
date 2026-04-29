const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');

const scriptTagStart = html.indexOf('<script>');
const scriptTagEnd = html.indexOf('</script>');
const secondScriptTagEnd = html.indexOf('</script>', scriptTagEnd + 1);
const script = html.substring(scriptTagStart + 8, scriptTagEnd);

console.log('First <script> at:', scriptTagStart);
console.log('First </script> at:', scriptTagEnd);
console.log('Second </script> at:', secondScriptTagEnd);
console.log('Total html length:', html.length);
console.log('Script length:', script.length);
console.log('\n=== SCRIPT START ===');
console.log(JSON.stringify(script.substring(0, 100)));
console.log('\n=== SCRIPT END ===');
console.log(JSON.stringify(script.substring(script.length - 100)));

// Check what's after </script>
console.log('\n=== AFTER FIRST </script> ===');
console.log(JSON.stringify(html.substring(scriptTagEnd, scriptTagEnd + 100)));

// Check if there's a second <script> tag in the script itself
const secondScript = html.indexOf('<script>', scriptTagStart + 8);
console.log('\nSecond <script> tag at:', secondScript, '(of', html.length, ')');

// Try parsing with a simple Node module approach - strip the script entirely and see
const htmlNoScript = html.substring(0, scriptTagStart) + '<script></script>' + html.substring(scriptTagEnd + 9);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_no_script.html', htmlNoScript, 'utf-8');
console.log('\nSaved HTML without script to index_no_script.html');

// Now let's extract just the SCENARIOS array and test it standalone
const scenIdx = script.indexOf('const SCENARIOS=');
let arrayDepth = 0, inStr = false, arrayStart = -1, arrayEnd = -1;
for (let i = scenIdx + 'const SCENARIOS='.length; i < script.length; i++) {
    const c = script[i], p = script[i-1];
    if (c === '\\' && p !== '\\') { i++; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[' && arrayStart === -1) { arrayStart = i; arrayDepth++; continue; }
    if (c === '[') { arrayDepth++; continue; }
    if (c === ']') { arrayDepth--; if (arrayDepth === 0) { arrayEnd = i; break; } }
}
const arrayContent = script.substring(arrayStart + 1, arrayEnd);
const arrayCode = 'const SCENARIOS=[' + arrayContent + '];';
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/test_scenarios.js', arrayCode, 'utf-8');
console.log('\nExtracted SCENARIOS to test_scenarios.js, length:', arrayCode.length);
try {
    new Function(arrayCode);
    console.log('SCENARIOS ONLY: OK, objects =', JSON.parse('[' + arrayContent + ']').length);
} catch(e) {
    console.log('SCENARIOS ONLY ERROR:', e.message);
}
