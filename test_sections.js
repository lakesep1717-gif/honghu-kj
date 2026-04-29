const fs = require('fs');
const h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const s = h.substring(h.indexOf('<script>') + 8, h.indexOf('</script>'));

const stateIdx = s.indexOf('// State');
const beforeState = s.substring(0, stateIdx);
const afterState = s.substring(stateIdx);

console.log('beforeState length:', beforeState.length);
console.log('beforeState last 50:', JSON.stringify(beforeState.substring(beforeState.length - 50)));
console.log('afterState first 50:', JSON.stringify(afterState.substring(0, 50)));

// Test beforeState alone
try {
    new Function(beforeState);
    console.log('beforeState: OK');
} catch(e) {
    console.log('beforeState ERROR:', e.message);
}

// Test beforeState + '// State'
try {
    new Function(beforeState + '// State');
    console.log('beforeState+// State: OK');
} catch(e) {
    console.log('beforeState+// State ERROR:', e.message);
}

// Test just afterState starting from '// State\n\nlet activeDept'
try {
    new Function('// State\n\n' + afterState.substring(11));
    console.log('afterState: OK');
} catch(e) {
    console.log('afterState ERROR:', e.message);
}

// Test the full script
try {
    new Function(s);
    console.log('Full script: OK');
} catch(e) {
    console.log('Full script ERROR:', e.message);
}

// Try a simpler test - just the last 2000 chars
const last2k = s.substring(s.length - 2000);
console.log('\n=== Last 2000 chars test ===');
try {
    new Function(last2k);
    console.log('Last 2000: OK');
} catch(e) {
    console.log('Last 2000 ERROR:', e.message);
    console.log('Starts with:', JSON.stringify(last2k.substring(0, 80)));
}
