var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));
var code = sc.substring(122198 + 2);

console.log('Full code:');
console.log(code);
console.log('\n---\nChecking for declarations:');
console.log('let searchKeyword:', code.indexOf('let searchKeyword'));
console.log('var searchKeyword:', code.indexOf('var searchKeyword'));
console.log('activeDept:', code.indexOf('activeDept'));

// Check if there's a semicolon issue
var lines = code.split('\n');
console.log('\nAll non-empty lines:');
for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim()) console.log(i + ': ' + lines[i]);
}
