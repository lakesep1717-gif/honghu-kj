var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));
var objCount = (sc.match(/{name:/g) || []).length;
console.log('HTML length:', h.length);
console.log('Script length:', sc.length);
console.log('SCENARIOS objects:', objCount, '(expected 216)');
try {
    new Function(sc);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS SYNTAX ERROR ❌:', e.message);
}
