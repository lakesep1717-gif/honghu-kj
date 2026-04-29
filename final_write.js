var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// SCENARIOS#2 from backup: starts at 61529, ends at 122198 (inclusive, ]; at 122198)
var scenStart = 61529 + 'const SCENARIOS='.length; // skip "const SCENARIOS="
var scenEnd = 122198;
var scenContent = sc.substring(scenStart, scenEnd + 1); // +1 to include the ]
console.log('SCENARIOS content length:', scenContent.length);
var objCount = (scenContent.match(/{name:/g) || []).length;
console.log('SCENARIOS objects:', objCount);

// JavaScript code from after SCENARIOS#2's ];
var codeStart = 122198 + 2; // skip "];"
var codeEnd = sc.length;
var code = sc.substring(codeStart);
console.log('Code length:', code.length);
console.log('Code starts:', code.substring(0, 100));

// Data arrays - extract from FIRST occurrence (clean)
var dep1 = sc.indexOf('const DEPTS=');
var plat1 = sc.indexOf('const PLATFORMS=');
var mod1 = sc.indexOf('const MODELS=');
var scen1 = sc.indexOf('const SCENARIOS=');

var depSec = sc.substring(dep1, plat1).trimEnd();
var platSec = sc.substring(plat1, mod1).trimEnd();
var modSec = sc.substring(mod1, scen1).trimEnd();
console.log('\nDEPTS section ends at:', dep1, '-', plat1, 'length:', plat1 - dep1);
console.log('DEPTS snippet:', depSec.substring(0, 50));

// Verify data arrays
try {
    new Function(depSec + '\n' + platSec + '\n' + modSec);
    console.log('Data arrays: OK ✅');
} catch(e) {
    console.log('Data arrays ERROR:', e.message);
}

// Build clean script
var cleanScript = 
    depSec + '\n\n' + 
    platSec + '\n\n' + 
    modSec + '\n\n' +
    'const SCENARIOS=[' + scenContent + '];\n\n' +
    code;

console.log('\nFull script length:', cleanScript.length);
try {
    new Function(cleanScript);
    console.log('Full script: OK ✅');
} catch(e) {
    console.log('Full script ERROR:', e.message);
}

// Write HTML
var si = h.indexOf('<script>');
var ei = h.indexOf('<\/script>');
var htmlStart = h.substring(0, si);
var htmlEnd = h.substring(ei);
var newHtml = htmlStart + '<script>\n' + cleanScript + '\n</script>\n' + htmlEnd;
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten! HTML length:', newHtml.length, '✅');
console.log('请刷新: file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
