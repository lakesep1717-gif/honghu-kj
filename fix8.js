const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '');

const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Find where the EXACT double ] is
const stateIdx = script.indexOf('// State');
let prevClose = -1;
const positions = [];
for (let i = 0; i < script.length; i++) {
    if (script[i] === ']') positions.push(i);
}
console.log('All ] positions:', positions.join(', '));
console.log('Total ] count:', positions.length);

// Find consecutive ] pairs
for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i+1] - positions[i] <= 3) {
        console.log('\nConsecutive pair at:', positions[i], 'and', positions[i+1]);
        console.log(JSON.stringify(script.substring(positions[i] - 30, positions[i+1] + 30)));
    }
}

// Let's count brackets properly - track depth including string state
function countDepth(s) {
    let depth = 0, inStr = false;
    const events = [];
    for (let i = 0; i < s.length; i++) {
        const c = s[i], p = s[i-1];
        if (c === '\\' && p !== '\\') { i++; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === '[') { depth++; events.push({i, c, depth}); }
        if (c === ']') { depth--; events.push({i, c, depth}); }
    }
    return events;
}

const events = countDepth(script);
const errors = events.filter(e => e.depth < 0);
console.log('\nUnderflow events (depth < 0):', JSON.stringify(errors.slice(0, 5)));
console.log('Total events:', events.length);
