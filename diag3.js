const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

console.log('Script length:', script.length);
console.log('First 80 chars:', JSON.stringify(script.substring(0, 80)));

// Binary search for error
let lastGood = 0;
for (let i = 1; i <= script.length; i++) {
    try {
        new Function(script.substring(0, i));
        lastGood = i;
    } catch(e) {
        const msg = e.message;
        if (msg.includes('Unexpected') || msg.includes('Invalid') || msg.includes('Unterminated') || msg.includes('Missing')) {
            const pos = i;
            const snippet = script.substring(Math.max(0, pos-30), pos+30);
            const lines = script.substring(0, pos).split('\n');
            console.log('\nERROR at char', pos, 'of', script.length);
            console.log('Line:', lines.length, 'Col:', lines[lines.length-1].length + 1);
            console.log('Snippet:', JSON.stringify(snippet));
            console.log('Error:', msg);
            break;
        }
    }
}

console.log('Last good char:', lastGood);
