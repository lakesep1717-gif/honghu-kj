var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Find all occurrences of ];
var positions = [];
for (var i = 0; i < sc.length - 1; i++) {
    if (sc[i] === ']' && sc[i+1] === ';') positions.push(i);
}
console.log('All ]; positions:', positions.map(p => p + ' (depth=' + getDepthAt(sc, p) + ')'));

// Get depth at each ]; 
function getDepthAt(str, pos) {
    var depth = 0;
    for (var i = 0; i <= pos; i++) {
        var c = str[i];
        if (c === '{' || c === '[') depth++;
        else if (c === '}' || c === ']') depth--;
    }
    return depth;
}

console.log('\nKey positions:');
// First SCENARIOS starts
var s1 = sc.indexOf('const SCENARIOS=');
console.log('First SCENARIOS at:', s1);
// Second SCENARIOS starts  
var s2 = sc.indexOf('const SCENARIOS=', s1 + 1);
console.log('Second SCENARIOS at:', s2);
// Second DEPTS starts
var d2 = sc.indexOf('const DEPTS=', sc.indexOf('const DEPTS=') + 1);
console.log('Second DEPTS at:', d2);

// What's between second SCENARIOS start and second DEPTS start?
console.log('\nBetween SCENARIOS#2 start (' + s2 + ') and DEPTS#2 start (' + d2 + '):');
console.log('Length:', d2 - s2, 'chars');
// Look at what ends right before DEPTS#2
console.log('Before DEPTS#2:', JSON.stringify(sc.substring(d2 - 100, d2)));
