const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8').replace(/\r/g, '\n');

const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Test with error message parsing
try {
    new Function(script);
    console.log('JS VALID: OK');
} catch(e) {
    console.log('JS ERROR:', e.message);
    // Try to parse line number
    const lineMatch = e.message.match(/at position (\d+)/);
    const lineColMatch = e.message.match(/line (\d+) column (\d+)/);
    const lineMatch2 = e.message.match(/line (\d+)/);
    
    if (lineColMatch) {
        console.log('Line:', lineColMatch[1], 'Col:', lineColMatch[2]);
    }
    
    // Binary search to find error line
    const lines = script.split('\n');
    console.log('Total lines:', lines.length);
    
    // Test from line 0 to line 100
    let lo = 0, hi = lines.length;
    let errLine = -1;
    
    for (let testLine = 1; testLine <= lines.length; testLine++) {
        const partial = lines.slice(0, testLine).join('\n');
        try { new Function(partial); } 
        catch(e2) { 
            if (e2.message !== e.message) {
                errLine = testLine;
                console.log('Error starts at line:', testLine);
                console.log('Line', testLine, ':', JSON.stringify(lines[testLine-1].substring(0, 80)));
                if (testLine > 1) console.log('Line', testLine-1, ':', JSON.stringify(lines[testLine-2].substring(0, 80)));
                break;
            }
        }
    }
    
    // Show where ] bracket issues are
    let depth = 0, inStr = false;
    for (let i = 0; i < script.length; i++) {
        const c = script[i], p = script[i-1];
        if (c === '\\' && p !== '\\') { i++; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === '[') depth++;
        if (c === ']') {
            depth--;
            if (depth < 0) {
                // Find line number
                const before = script.substring(0, i);
                const lineNo = (before.match(/\n/g) || []).length + 1;
                console.log('NEGATIVE depth at line', lineNo, 'pos', i, JSON.stringify(script.substring(i-20, i+40)));
                break;
            }
        }
    }
}
