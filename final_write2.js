var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Find ACTUAL first declarations (before SCENARIOS, not inside it)
var scen1 = sc.indexOf('const SCENARIOS=');
console.log('SCENARIOS#1 at:', scen1);

// Search BEFORE SCENARIOS for data arrays
var dep1 = sc.lastIndexOf('const DEPTS=', scen1);
var plat1 = sc.lastIndexOf('const PLATFORMS=', scen1);
var mod1 = sc.lastIndexOf('const MODELS=', scen1);

console.log('DEPTS#1 at:', dep1, 'before SCENARIOS#1 at', scen1);
console.log('PLATFORMS#1 at:', plat1);
console.log('MODELS#1 at:', mod1);

// Extract data arrays
var depSec = sc.substring(dep1, plat1).trimEnd();
var platSec = sc.substring(plat1, mod1).trimEnd();
var modSec = sc.substring(mod1, scen1).trimEnd();

console.log('\nDEPTS section length:', depSec.length);
console.log('PLATFORMS section length:', platSec.length);
console.log('MODELS section length:', modSec.length);
console.log('DEPTS ends:', JSON.stringify(depSec.substring(depSec.length - 30)));
console.log('PLATFORMS ends:', JSON.stringify(platSec.substring(platSec.length - 30)));
console.log('MODELS ends:', JSON.stringify(modSec.substring(modSec.length - 30)));

// Verify data arrays
try {
    new Function(depSec + '\n' + platSec + '\n' + modSec);
    console.log('Data arrays: OK ✅');
} catch(e) {
    console.log('Data arrays ERROR:', e.message);
}

// SCENARIOS#2 data
var scen2 = sc.indexOf('const SCENARIOS=', scen1 + 1);
var scenStart = scen2 + 'const SCENARIOS='.length;
var scenEnd = 122198;
var scenContent = sc.substring(scenStart, scenEnd + 1);
console.log('\nSCENARIOS#2 objects:', (scenContent.match(/{name:/g) || []).length);
console.log('SCENARIOS#2 content length:', scenContent.length);

// Code section
var code = sc.substring(122198 + 2);
console.log('\nCode starts:', JSON.stringify(code.substring(0, 80)));

// Check for duplicate declarations in code
if (code.indexOf('let searchKeyword') >= 0) {
    console.log('WARNING: searchKeyword declared again in code section!');
}

// Build and verify full script
var cleanScript = depSec + '\n\n' + platSec + '\n\n' + modSec + '\n\n' +
    'const SCENARIOS=[' + scenContent + '];\n\n' + code;

console.log('\nFull script length:', cleanScript.length);
try {
    new Function(cleanScript);
    console.log('Full script: OK ✅');
} catch(e) {
    console.log('Full script ERROR:', e.message);
    // Find where the error is
    var lines = cleanScript.split('\n');
    console.log('Error context (lines 1-5):');
    for (var i = 0; i < 5; i++) console.log(i+1 + ':', lines[i]);
    console.log('...');
    console.log('Code section first 5 lines:');
    var codeLines = code.split('\n');
    for (var i = 0; i < 10; i++) console.log(i+':', codeLines[i]);
}

// Write HTML
var si = h.indexOf('<script>');
var ei = h.indexOf('<\/script>');
var newHtml = h.substring(0, si) + '<script>\n' + cleanScript + '\n</script>\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten! HTML length:', newHtml.length, '✅');
