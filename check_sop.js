var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Extract the clean SCENARIOS content
var s2 = 61529;
var end = 122198;
var c = sc.substring(s2 + 'const SCENARIOS='.length, end + 1);

// Find the first sop field
var sopIdx = c.indexOf('sop:');
console.log('First sop at', sopIdx);
console.log('First sop value (first 300 chars):');
console.log(c.substring(sopIdx, sopIdx + 300));

// Count how many sop fields use \n vs →
var arrowCount = (c.match(/sop:"[^"]*→[^"]*"/g) || []).length;
var backslashNCount = (c.match(/sop:"[^"]*\\n[^"]*"/g) || []).length;
console.log('\nSOP fields with →:', arrowCount);
console.log('SOP fields with \\n:', backslashNCount);

// Check render code's sop usage
var fullCode = sc.substring(122210);
var renderStart = fullCode.indexOf('// Render');
var renderCode = fullCode.substring(renderStart);
console.log('\n=== RENDER CODE ===');
console.log(renderCode);
