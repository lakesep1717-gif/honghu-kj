const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Binary search: split script into 3 parts, find which part has the error
const total = script.length;
const third = Math.ceil(total / 3);

// Test each third
function testPartial(code, label) {
    try { new Function(code); return 'OK'; } catch(e) { return 'ERR: ' + e.message.substring(0, 50); }
}

const p1 = script.substring(0, third);
const p2 = script.substring(third, third*2);
const p3 = script.substring(third*2);

console.log('Part 1 (' + p1.length + ' chars):', testPartial(p1, 'P1'));
console.log('Part 2 (' + p2.length + ' chars):', testPartial(p2, 'P2'));
console.log('Part 3 (' + p3.length + ' chars):', testPartial(p3, 'P3'));
console.log('P1+P2:', testPartial(p1 + p2, 'P1+P2'));
console.log('P2+P3:', testPartial(p2 + p3, 'P2+P3'));
console.log('Full:', testPartial(script, 'Full'));

// Also test DEPTS and PLATFORMS and MODELS individually
const parts = script.split('\n\n');
console.log('\nLine-pair tests:');
for (let i = 0; i < parts.length - 1; i++) {
    const combined = parts.slice(0, i+1).join('\n\n');
    try { new Function(combined); } 
    catch(e) {
        if (!e.message.includes('is not defined') && !e.message.includes('not defined')) {
            console.log('First error at pair', i, ':', e.message.substring(0, 80));
            console.log('Part ' + i + ':', JSON.stringify(parts[i].substring(0, 60)));
            break;
        }
    }
}
