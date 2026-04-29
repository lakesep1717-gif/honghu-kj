var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Get the full render code
var fullCode = sc.substring(122210);
console.log('Full code length:', fullCode.length);
console.log('=== FULL CODE ===');
console.log(fullCode);
console.log('=== END FULL CODE ===');

// Check for specific known bad patterns
console.log('\n=== CHECKING PATTERNS ===');
console.log('Has s.sop.join:', fullCode.indexOf('s.sop.join') !== -1);
console.log('Has s.sop.split:', fullCode.indexOf('s.sop.split') !== -1);

// Find each SOP usage
var matches = [];
var idx = 0;
while ((idx = fullCode.indexOf('s.sop', idx)) !== -1) {
    matches.push(idx + ': ' + JSON.stringify(fullCode.substring(idx, idx + 30)));
    idx++;
}
console.log('s.sop occurrences:', matches);

// Check for template literal or backtick issues
console.log('\nBacktick count:', (fullCode.match(/`/g) || []).length);

// Try to find exact bad string
// Test line by line
var lines = fullCode.split('\n');
var testSoFar = '';
for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    testSoFar += line + '\n';
    try {
        new Function(testSoFar);
    } catch(e) {
        console.log('Error on line', i + 1, ':', JSON.stringify(line));
        console.log('Error:', e.message);
        // Show the last few chars before the error
        var pos = parseInt(e.message.match(/position (\d+)/) || [0, 0])[1];
        console.log('At position in testSoFar:', pos);
        console.log('Context:', JSON.stringify(testSoFar.substring(Math.max(0, pos - 30), pos + 30)));
        break;
    }
}
