var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Get the full code section starting from let activeDept=
var fullCode = sc.substring(122210);
console.log('Full code (' + fullCode.length + ' chars):');
console.log(JSON.stringify(fullCode.substring(0, 500)));

// Binary search for exact error position
var lo = 0, hi = fullCode.length;
function ok(x) {
    try { new Function(fullCode.substring(0, x)); return true; }
    catch(e) { return false; }
}
while (hi - lo > 1) {
    var m = Math.floor((lo + hi) / 2);
    if (ok(m)) lo = m; else hi = m;
}
var firstBad = hi;
console.log('\nFirst bad position:', firstBad);
console.log('Context:', JSON.stringify(fullCode.substring(Math.max(0,firstBad-20), firstBad+80)));
console.log('Char code at firstBad:', fullCode.charCodeAt(firstBad));

// Also test: just the state vars section
var stateEnd = fullCode.indexOf('\n\n\n// Render');
var stateVars = fullCode.substring(0, stateEnd);
console.log('\nState vars (' + stateVars.length + ' chars):', JSON.stringify(stateVars));

// What if the state vars are valid, but the render section has issues?
// Test with a known good render stub
var testCode = stateVars + '\n\n\n// Render\n\nfunction render(){}\n';
try {
    new Function(testCode);
    console.log('State+stub render: OK');
} catch(e) {
    console.log('State+stub render ERROR:', e.message);
}

// Extract the actual render section
var renderCode = fullCode.substring(stateEnd);
console.log('\nRender code first 200 chars:', JSON.stringify(renderCode.substring(0, 200)));

// Test just render code
try {
    new Function(renderCode);
    console.log('Render code: OK');
} catch(e) {
    console.log('Render code ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('At position', pos, 'in render code:', JSON.stringify(renderCode.substring(Math.max(0,pos-30), pos+60)));
    }
}

// Binary search on render code alone
var rlo = 0, rhi = renderCode.length;
function rok(x) {
    try { new Function(renderCode.substring(0, x)); return true; }
    catch(e) { return false; }
}
while (rhi - rlo > 1) {
    var rm = Math.floor((rlo + rhi) / 2);
    if (ok(rm)) rlo = rm; else rhi = rm;
}
console.log('\nRender first bad at:', rhi, '(in renderCode context)');
console.log('Context:', JSON.stringify(renderCode.substring(Math.max(0,rhi-30), rhi+80)));
