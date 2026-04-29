var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var sc = h.substring(si, ei);

// KNOWN STRUCTURE (confirmed from diagnostics):
// [428]       const SCENARIOS=[\n\n ...CORRUPTED FIRST COPY...
// [61098]     ];   (first copy end - CORRUPTED)
// [61103]     const DEPTS=[\n...second DEPTS...
// [61529]     const SCENARIOS=[\n\n{name:"商品详情批量采集"...PROPER 216 OBJECTS...\n备份"}\n\n]\n\n (CLOSE at 122198)
// [122199]    ];
// [122202]    // State (code section start)

// Strategy: use the PROPER third SCENARIOS (at 61529, 216 objects)
// and build clean script from scratch

// Extract clean SCENARIOS content (without 'const SCENARIOS=[' header)
var s2 = 61529;
var scenEnd = 122198;
var scenContent = sc.substring(s2 + 'const SCENARIOS='.length, scenEnd + 1);
console.log('SCENARIOS content length:', scenContent.length, '(expected ~60653)');

// Verify: 216 objects
console.log('Objects:', (scenContent.match(/{name:/g)||[]).length, '(expected 216)');

// Verify: bracket balance
var b = 0;
for (var i = 0; i < scenContent.length; i++) {
    if (scenContent[i] === '[') b++;
    else if (scenContent[i] === ']') b--;
}
console.log('Bracket balance:', b, '(should be 0)');

// Test syntax
try {
    new Function('const SCENARIOS=[' + scenContent + '];');
    console.log('SCENARIOS syntax: OK ✅');
} catch(e) {
    console.log('SCENARIOS ERROR:', e.message);
}

// Extract code section (from // State onwards)
var codeSec = sc.substring(122202);
console.log('Code section length:', codeSec.length);
console.log('Code first 50 chars:', JSON.stringify(codeSec.substring(0, 50)));

// Verify code syntax
try {
    new Function(codeSec);
    console.log('Code syntax: OK ✅');
} catch(e) {
    console.log('Code ERROR:', e.message);
}

// BUILD CLEAN SCRIPT from scratch
// 1. State variables
var stateVars = 'let activeDept="全部", activePlatform="全部", activeModel="全部";\nlet searchText="";\n';
// 2. DEPTS array (from first occurrence)
var d1 = sc.indexOf('const DEPTS=');
var p1 = sc.indexOf('const PLATFORMS=');
var m1 = sc.indexOf('const MODELS=');
var s1 = sc.indexOf('const SCENARIOS=');
var depSec = sc.substring(d1, p1).trimEnd();
var platSec = sc.substring(p1, m1).trimEnd();
var modelSec = sc.substring(m1, s1).trimEnd();

// 3. SCENARIOS (clean, properly formatted)
var scenSec = 'const SCENARIOS=[' + scenContent + '];';

// 4. Code (render functions)
var renderCode = codeSec;

// Combine
var clean = stateVars + '\n' + depSec + '\n\n' + platSec + '\n\n' + modelSec + '\n\n' + scenSec + '\n\n' + renderCode;

// Fix SOP display: s.sop.split(' → ') → String(s.sop).split('\n')
clean = clean.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");
// Fix SOP join: s.sop.join(' ') → String(s.sop).split('\n').join(' ')
clean = clean.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix toggleSop - find it and replace with safe version
var toggle = clean.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggle) {
    var safeToggle = 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"\\u25B2":"\\u25BC";a.previousSibling.textContent=show?"\\u6536\\u8D77 ":"\\u5C55\\u5F00 ";}';
    clean = clean.replace(toggle[0], safeToggle);
    console.log('Fixed toggleSop ✅');
}

console.log('\nClean script length:', clean.length);

// Test full syntax
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
}

// Write HTML
var newHtml = h.substring(0, si) + '\n' + clean + '\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten! HTML length:', newHtml.length, '✅');
console.log('请打开: file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
