var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Find all ]; and their context
var count = 0;
for (var i = 0; i < sc.length - 1; i++) {
    if (sc[i] === ']' && sc[i+1] === ';') {
        count++;
        if (count <= 3 || count >= 7) {
            console.log('#' + count + ' at ' + i + ': ' + JSON.stringify(sc.substring(i-30, i+5)));
        }
        if (count === 3) console.log('---');
    }
}
console.log('Total ]; count:', count);

// Find SCENARIOS occurrences
var pos = 0, n = 1;
while (true) {
    var idx = sc.indexOf('const SCENARIOS=', pos);
    if (idx === -1) break;
    console.log('SCENARIOS #' + n + ' at ' + idx + ': ' + sc.substring(idx, idx + 30));
    pos = idx + 1; n++;
}

// Show what's between the 7th and 8th ]; (positions around 122198)
var seventh = null, eighth = null, c2 = 0;
for (var i = 0; i < sc.length - 1; i++) {
    if (sc[i] === ']' && sc[i+1] === ';') {
        c2++;
        if (c2 === 7) seventh = i;
        if (c2 === 8) { eighth = i; break; }
    }
}
console.log('\n7th ]; at', seventh, ':', JSON.stringify(sc.substring(seventh - 50, eighth + 5)));
console.log('8th ]; at', eighth);

// The key question: is there a DEPTS between 7th and 8th ];?
var hasDep = sc.indexOf('const DEPTS=', seventh + 1);
console.log('\nIs there a DEPTS after 7th ];?', hasDep, '(',
    (hasDep > seventh && hasDep < eighth) ? 'YES - between 7th and 8th' : 'no or outside', ')');
