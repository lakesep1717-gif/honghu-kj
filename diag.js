const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Binary search for exact error line
let lo = 0, hi = script.length;
let lastGood = 0;
for (let i = 1; i <= script.length; i++) {
    try {
        new Function(script.substring(0, i));
        lastGood = i;
    } catch(e) {
        if (e.message.includes('Unexpected token') || e.message.includes('Invalid')) {
            hi = i;
            break;
        }
    }
}

console.log('Error at char:', hi, 'of', script.length);
console.log('Context:', JSON.stringify(script.substring(Math.max(0,hi-30), hi+50)));

// Also check what // State looks like
const stateIdx = script.indexOf('// State');
console.log('\n// State at:', stateIdx);
console.log('Around // State:', JSON.stringify(script.substring(stateIdx-30, stateIdx+60)));

// Show if there are any obvious issues in the script - check for "]]" anywhere
const doubleBracket = script.indexOf(']]');
console.log('\nFirst ]] at:', doubleBracket);
if (doubleBracket !== -1) {
    console.log('Context:', JSON.stringify(script.substring(doubleBracket-20, doubleBracket+40)));
}
