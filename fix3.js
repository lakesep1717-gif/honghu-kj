const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// The script tag content
const fullScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Remove \r to simplify
const clean = fullScript.replace(/\r/g, '');
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/debug_script.txt', clean, 'utf-8');
console.log('Clean script length:', clean.length);
console.log('File written for debug');

// Now try to parse with bracket counting
let depth = 0;
let inString = false;
let lastObjStart = -1;
let lastObjEnd = -1;
let objDepth = 0;

for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    const prev = clean[i - 1];
    
    if (c === '\\' && prev !== '\\') {
        // escape char - skip next
        i++;
        continue;
    }
    
    if (c === '"' && prev !== '\\') {
        inString = !inString;
        continue;
    }
    
    if (inString) continue;
    
    if (c === '{') {
        if (depth === 0) lastObjStart = i;
        depth++;
        objDepth = depth;
    }
    if (c === '}') {
        depth--;
        if (depth === 0) lastObjEnd = i;
    }
}

console.log('Last object: depth=' + objDepth + ', start=' + lastObjStart + ', end=' + lastObjEnd);
console.log('Last object preview:', clean.substring(lastObjStart, lastObjEnd + 1).substring(0, 100));

// Try using a JSON5-style parser to find the error
// Let's look for SCENARIOS
const scenIdx = clean.indexOf('const SCENARIOS=');
console.log('SCENARIOS at:', scenIdx);
// Find ] after it
const firstBrack = clean.indexOf('[', scenIdx);
console.log('First [ at:', firstBrack);

// Find matching ] by counting depth
let d = 0;
for (let i = firstBrack + 1; i < clean.length; i++) {
    if (clean[i] === '[') d++;
    if (clean[i] === ']') {
        if (d === 0) {
            console.log('Matching ] at:', i);
            console.log('Content after ]:', JSON.stringify(clean.substring(i, i+50)));
            break;
        }
        d--;
    }
}
