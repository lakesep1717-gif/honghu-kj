const fs = require('fs');

// Read the original (corrupted) HTML
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Extract the <script> block
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.indexOf('</script>');
let script = html.substring(scriptStart, scriptEnd);

console.log('Script length:', script.length);

// Find first declarations
const d1 = script.indexOf('const DEPTS=');
const p1 = script.indexOf('const PLATFORMS=');
const m1 = script.indexOf('const MODELS=');
const s1 = script.indexOf('const SCENARIOS=');
const s2 = script.indexOf('const SCENARIOS=', s1 + 1);

console.log('First SCENARIOS at', s1, 'Second at', s2);

// Find where first SCENARIOS ends (track depth, respect strings)
function findArrayEnd(s, startIdx) {
    let depth = 0, inString = false, escaped = false;
    for (let i = startIdx; i < s.length; i++) {
        const c = s[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (c === '[') { depth++; continue; }
        if (c === ']') { depth--; if (depth === 0) return i; }
    }
    return -1;
}

const firstScenEnd = findArrayEnd(script, s1 + 'const SCENARIOS='.length);
const secondScenEnd = findArrayEnd(script, s2 + 'const SCENARIOS='.length);
console.log('First SCENARIOS ends at', firstScenEnd, 'Second at', secondScenEnd);

// Find real State divider (after second SCENARIOS)
const stateIdx = script.indexOf('// State', secondScenEnd);
console.log('Real State at', stateIdx);

// Extract clean sections
const depSection = script.substring(d1, p1).trimEnd();
const platSection = script.substring(p1, m1).trimEnd();
const modelSection = script.substring(m1, s1).trimEnd();
const scenSection = script.substring(s1, firstScenEnd + 1).trimEnd();
const codeSection = script.substring(stateIdx);

console.log('\nSection lengths:');
console.log('DEPTS:', depSection.length);
console.log('PLATFORMS:', platSection.length);
console.log('MODELS:', modelSection.length);
console.log('SCENARIOS:', scenSection.length);
console.log('CODE:', codeSection.length);

const objCount = (scenSection.match(/{/g) || []).length;
console.log('Object count in SCENARIOS:', objCount);

// Build clean script
let cleanScript = depSection + '\n\n' + platSection + '\n\n' + modelSection + '\n\n' + scenSection + '\n\n' + codeSection;

// Fix 1: s.sop.split(' → ') -> String(s.sop).split('\n')
// (SOP steps are separated by \n in the string, not by →)
cleanScript = cleanScript.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");

// Fix 2: s.sop.join(' ') -> String(s.sop).split('\n').join(' ')
// (for the search filter which joins all sop text)
cleanScript = cleanScript.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix 3: toggleSop uses innerHTML which destroys onclick — rewrite it
cleanScript = cleanScript.replace(
    /function toggleSop\(i\)\{[\s\S]*?\}/,
    `function toggleSop(i){var c=document.getElementById('sop-'+i);var a=document.getElementById('arrow-'+i);var show=c.classList.toggle('show');a.textContent=show?'▲':'▼';a.previousSibling.textContent=show?'收起 ':'展开 ';} `
);

console.log('\nClean script length:', cleanScript.length);

// Verify JS syntax
try {
    new Function(cleanScript);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS ERROR:', e.message);
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.log('Error at position', pos);
        console.log('Context:', JSON.stringify(cleanScript.substring(Math.max(0,pos-80), pos+100)));
    }
}

// Write new HTML
const newHtml = html.substring(0, scriptStart) + '\n' + cleanScript + '\n' + html.substring(scriptEnd);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf-8');
console.log('\nWritten. HTML length:', newHtml.length);
console.log('Done! ✅');
