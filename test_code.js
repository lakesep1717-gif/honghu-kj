var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Extract clean SCENARIOS from third occurrence (properly formatted, 216 objects)
var s2 = 61529;
var scenEnd = 122198;
var scenContent = sc.substring(s2 + 'const SCENARIOS='.length, scenEnd + 1);
console.log('SCENARIOS content:', scenContent.length, 'chars,', (scenContent.match(/{name:/g)||[]).length, 'objects');

// Verify bracket balance
var b = 0;
for (var i = 0; i < scenContent.length; i++) {
    if (scenContent[i] === '[') b++;
    else if (scenContent[i] === ']') b--;
}
console.log('Bracket balance:', b);

// Verify syntax
try {
    new Function('const SCENARIOS=[' + scenContent + '];');
    console.log('SCENARIOS: OK ✅');
} catch(e) {
    console.log('SCENARIOS ERROR:', e.message);
    process.exit(1);
}

// Extract data arrays from FIRST occurrence (positions 2-427)
var d1 = 2;
var p1 = sc.indexOf('const PLATFORMS=');
var m1 = sc.indexOf('const MODELS=');
var s1 = 61529; // Third occurrence start

// First DEPTS from positions 2-p1
var depRaw = sc.substring(d1, p1).trimEnd();
// First PLATFORMS from p1-m1
var platRaw = sc.substring(p1, m1).trimEnd();
// MODELS from m1 to s1 (but s1 is third SCENARIOS, need first MODELS)
// Wait: first MODELS is at position 377 and ends before first SCENARIOS at 428
// So MODELS = sc.substring(m1, s1)
// But s1 = 61529... that's wrong. Let me find first SCENARIOS
var firstScen = 428;
var modRaw = sc.substring(m1, firstScen).trimEnd();

console.log('\nDEPTS:', depRaw.length, depRaw.substring(0, 80));
console.log('PLATFORMS:', platRaw.length, platRaw);
console.log('MODELS:', modRaw.length, modRaw);

// Verify data arrays syntax
try {
    new Function(depRaw + '\n' + platRaw + '\n' + modRaw);
    console.log('Data arrays: OK ✅');
} catch(e) {
    console.log('Data arrays ERROR:', e.message);
}

// Extract clean code from position 122210
var cleanCode = sc.substring(122210);
console.log('\nClean code:', cleanCode.length, 'chars');

// Split state variables from render functions
var stateEnd = cleanCode.indexOf('\n\n\n// Render');
var stateVars = cleanCode.substring(0, stateEnd);
var renderCode = cleanCode.substring(stateEnd);
console.log('State vars:', stateVars.length, 'chars');
console.log('Render code:', renderCode.length, 'chars');

try {
    new Function(stateVars + '\n\n' + renderCode);
    console.log('State+Render: OK ✅');
} catch(e) {
    console.log('State+Render ERROR:', e.message);
}

// BUILD CLEAN SCRIPT
var clean = stateVars + '\n\n' + depRaw + '\n\n' + platRaw + '\n\n' + modRaw + '\n\n' + 
    'const SCENARIOS=[' + scenContent + '];\n\n' + renderCode;

// Fix SOP display
clean = clean.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");
clean = clean.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix toggleSop
var toggle = clean.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggle) {
    clean = clean.replace(toggle[0], 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"\\u25B2":"\\u25BC";a.previousSibling.textContent=show?"\\u6536\\u8D77 ":"\\u5C55\\u5F00 ";}');
    console.log('Fixed toggleSop ✅');
}

console.log('\nFinal clean script:', clean.length, 'chars');

try {
    new Function(clean);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('Context:', JSON.stringify(clean.substring(Math.max(0,pos-50), pos+80)));
    }
    process.exit(1);
}

// Write HTML
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var newHtml = h.substring(0, si) + '\n' + clean + '\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten! HTML length:', newHtml.length, '✅');
console.log('请打开: file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
