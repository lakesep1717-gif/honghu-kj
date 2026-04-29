var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Find the double bracket
var doubleBracket = sc.indexOf('const SCENARIOS=[[');
console.log('Double bracket at:', doubleBracket);
console.log('Context:', sc.substring(doubleBracket, doubleBracket + 50));

// Fix: replace `[[` with `[`
var fixed = sc.replace('const SCENARIOS=[[', 'const SCENARIOS=[');
console.log('Fixed:', fixed.substring(doubleBracket, doubleBracket + 50));

// Verify
try {
    new Function(fixed);
    console.log('Fixed JS: OK ✅');
} catch(e) {
    console.log('Fixed JS ERROR:', e.message);
}

// Check SCENARIOS object count in fixed version
var objCount = (fixed.match(/{name:/g) || []).length;
console.log('SCENARIOS objects after fix:', objCount);

// Write HTML
var htmlStart = h.substring(0, h.indexOf('<script>') + 8);
var htmlEnd = h.substring(h.indexOf('<\/script>'));
var newHtml = htmlStart + '\n' + fixed + '\n' + htmlEnd;
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('Written! New HTML length:', newHtml.length);
console.log('请刷新: file:///C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html');
