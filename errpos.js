var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Get full code
var fullCode = sc.substring(122210);
console.log('Full code length:', fullCode.length);

// Binary search on fullCode alone
var lo = 0, hi = fullCode.length;
function ok(x) {
    try { new Function(fullCode.substring(0, x)); return true; }
    catch(e) { return false; }
}
while (hi - lo > 1) {
    var m = Math.floor((lo + hi) / 2);
    if (ok(m)) lo = m; else hi = m;
}
console.log('Binary search: first bad at', hi, 'char at hi:', JSON.stringify(fullCode[hi]), 'code:', fullCode.charCodeAt(hi));
console.log('Context:', JSON.stringify(fullCode.substring(Math.max(0,hi-10), hi+60)));

// Also binary search on render code alone
var stateEnd = fullCode.indexOf('\n\n\n// Render');
var renderCode = fullCode.substring(stateEnd);
var rlo = 0, rhi = renderCode.length;
function rok(x) {
    try { new Function(renderCode.substring(0, x)); return true; }
    catch(e) { return false; }
}
while (rhi - rlo > 1) {
    var rm = Math.floor((rlo + rhi) / 2);
    if (rok(rm)) rlo = rm; else rhi = rm;
}
console.log('\nRender code first bad at', rhi, '(absolute pos:', stateEnd + rhi, ')');
console.log('Render context:', JSON.stringify(renderCode.substring(Math.max(0,rhi-20), rhi+80)));
