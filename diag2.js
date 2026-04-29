const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw\workspace\rpa-scenarios\index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Binary search - stop on ANY syntax error
let lastGood = 0;
let firstBad = script.length;

for (let i = 1; i <= script.length; i++) {
    try {
        new Function(script.substring(0, i));
        lastGood = i;
    } catch(e) {
        // Any syntax error
        firstBad = i;
        break;
    }
}

console.log('Last good char:', lastGood, '/', script.length);
console.log('First bad char:', firstBad);
console.log('Error context:', JSON.stringify(script.substring(Math.max(0,firstBad-20), firstBad+30)));

// Try with lastGood + 1
console.log('\nTrying just after lastGood...');
try {
    new Function(script.substring(0, lastGood + 1));
    console.log('OK at', lastGood + 1);
} catch(e) {
    console.log('ERROR at', lastGood + 1, ':', e.message);
    console.log('Context:', JSON.stringify(script.substring(lastGood - 5, lastGood + 20)));
}

// Try specific check for ";"
try {
    new Function(script.substring(0, firstBad));
} catch(e) {
    console.log('\nExact error:', e.message, 'at:', firstBad);
    const snippet = script.substring(firstBad - 10, firstBad + 30);
    console.log('Snippet:', JSON.stringify(snippet));
    const before = script.substring(0, firstBad);
    const lines = before.split('\n');
    console.log('Line number:', lines.length, 'Column:', lines[lines.length-1].length + 1);
    console.log('Last line:', JSON.stringify(lines[lines.length-1]));
}
