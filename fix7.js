const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '');

// Find the two consecutive ] in the script
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.indexOf('</script>');
const script = html.substring(scriptStart, scriptEnd);

// Find first ] from State section
const stateIdx = script.indexOf('// State');
const firstCloseIdx = script.lastIndexOf(']', stateIdx);

// Find second ] right after first
const secondCloseIdx = script.indexOf(']', firstCloseIdx + 1);

console.log('Script length:', script.length);
console.log('// State at:', stateIdx);
console.log('First ] before State:', firstCloseIdx);
console.log('Second ]:', secondCloseIdx);

console.log('\nAround first ]:', JSON.stringify(script.substring(firstCloseIdx - 20, firstCloseIdx + 60)));
console.log('\nAround second ]:', JSON.stringify(script.substring(secondCloseIdx - 20, secondCloseIdx + 20)));

// Remove the extra ] 
const fixedScript = script.substring(0, secondCloseIdx) + script.substring(secondCloseIdx + 1);

const newHtml = html.substring(0, scriptStart) + fixedScript + html.substring(scriptEnd);

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('\nNew HTML length:', newHtml.length);

// Verify
const verifyScript = newHtml.substring(newHtml.indexOf('<script>') + 8, newHtml.indexOf('</script>'));
try {
    new Function(verifyScript);
    console.log('JS SYNTAX: OK');
} catch(e) {
    console.log('JS ERROR:', e.message, 'Line:', e.lineNumber);
    const lines = verifyScript.split('\n');
    if (e.lineNumber) {
        console.log('Line', e.lineNumber, ':', JSON.stringify(lines[e.lineNumber-1]));
    }
}
