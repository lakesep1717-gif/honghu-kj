var fs = require('fs');

// Read current file
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Fix 1: Remove double bracket
var hasDouble = sc.indexOf('const SCENARIOS=[[');
console.log('Has double bracket:', hasDouble >= 0);

// Find the correct array end by depth-counting from the SCENARIOS=[ position
var arrStart = sc.indexOf('const SCENARIOS=[') + 'const SCENARIOS='.length;
console.log('Array starts at:', arrStart, 'char:', sc[arrStart]);

// Depth count from arrStart
var depth = 0;
var arrEnd = -1;
for (var i = arrStart; i < sc.length; i++) {
    var c = sc[i];
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
        depth--;
        if (depth === 0) { arrEnd = i; break; }
    }
}
console.log('Array ends at:', arrEnd, 'char:', sc[arrEnd], sc[arrEnd+1]);

// Check what's at arrEnd
console.log('Context around arrEnd:', JSON.stringify(sc.substring(arrEnd - 20, arrEnd + 5)));

// Count objects between arrStart and arrEnd
var inner = sc.substring(arrStart + 1, arrEnd);
var objCount = (inner.match(/{name:/g) || []).length;
console.log('Objects inside SCENARIOS:', objCount);

// Check if arrEnd+1 is `;`
console.log('Char at arrEnd+1:', JSON.stringify(sc[arrEnd+1]), 'arrEnd+2:', JSON.stringify(sc[arrEnd+2]));

// Build fixed script
var fixedSc;
if (hasDouble >= 0) {
    // Replace [[ with [
    fixedSc = sc.replace('const SCENARIOS=[[', 'const SCENARIOS=[');
    console.log('Replaced [[ with [');
} else {
    fixedSc = sc;
    console.log('No double bracket found, checking structure...');
}

// Verify fixed
try {
    new Function(fixedSc);
    console.log('Fixed JS: OK ✅');
} catch(e) {
    console.log('Fixed JS ERROR:', e.message);
}

// Write back
var htmlStart = h.substring(0, h.indexOf('<script>') + 8);
var htmlEnd = h.substring(h.indexOf('<\/script>'));
var newHtml = htmlStart + '\n' + fixedSc + '\n' + htmlEnd;
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('Written! Length:', newHtml.length);
