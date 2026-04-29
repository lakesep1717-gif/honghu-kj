const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Show the actual start and end of script
console.log('Script starts with:');
console.log(JSON.stringify(script.substring(0, 100)));
console.log('Script ends with:');
console.log(JSON.stringify(script.substring(script.length - 100)));

// What does "const DEPTS=" look like?
const deptIdx = script.indexOf('const DEPTS=');
console.log('\nconst DEPTS= at:', deptIdx, JSON.stringify(script.substring(deptIdx, deptIdx + 80)));

// What does "const PLATFORMS=" look like?
const platIdx = script.indexOf('const PLATFORMS=');
console.log('\nconst PLATFORMS= at:', platIdx, JSON.stringify(script.substring(platIdx, platIdx + 80)));

// What does "const SCENARIOS=" look like?
const scenIdx = script.indexOf('const SCENARIOS=');
console.log('\nconst SCENARIOS= at:', scenIdx, JSON.stringify(script.substring(scenIdx, scenIdx + 80)));

// Show all const declarations
const consts = [];
let searchFrom = 0;
while (true) {
    const idx = script.indexOf('const ', searchFrom);
    if (idx === -1) break;
    const endIdx = script.indexOf(';', idx);
    if (endIdx === -1) break;
    consts.push({idx, name: script.substring(idx, endIdx + 1).substring(0, 50)});
    searchFrom = endIdx + 1;
}
console.log('\nAll const declarations:');
consts.forEach(c => console.log('  pos', c.idx, ':', c.name));

// Test just the constants
const constCode = script.substring(0, script.indexOf('// State'));
try {
    new Function(constCode);
    console.log('\nConstants section: OK');
} catch(e) {
    console.log('\nConstants ERROR:', e.message);
    const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
    const lineNo = script.substring(0, pos).split('\n').length;
    console.log('Line:', lineNo, JSON.stringify(constCode.split('\n')[lineNo-1]));
}
