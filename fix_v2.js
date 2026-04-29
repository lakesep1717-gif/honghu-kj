var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var si = h.indexOf('<script>') + 8;
var ei = h.indexOf('</script>');
var script = h.substring(si, ei);
console.log('Script length:', script.length);

// Verify structure
var dep2 = script.indexOf('const DEPTS=', 10);
var objCount = (script.match(/{name:/g) || []).length;
console.log('DEPTS second at', dep2, '(expected ~61103)');
console.log('Object count:', objCount, '(expected ~450)');

// Find SCENARIOS
var s1 = script.indexOf('const SCENARIOS=');
var s2 = script.indexOf('const SCENARIOS=', s1 + 1);
console.log('First SCENARIOS at', s1, 'Second at', s2, '(expected ~61529)');

// Strategy 1: Find array end by looking for '];\n' after the SCENARIOS declaration
// The SCENARIOS array ends with ];\n// State\n
// Strategy 2: Find the second DEPTS position - that's the start of the duplicate copy
// The first SCENARIOS ends right before the second DEPTS
var secondDep = dep2;
var firstScenEnd = secondDep - '\n\nconst DEPTS='.length; // Go back before second DEPTS
// But first verify what comes before second DEPTS
console.log('\nChars before second DEPTS:');
console.log(JSON.stringify(script.substring(secondDep - 20, secondDep + 30)));

// The second DEPTS starts with '\n\n' so we need to back up more
// Find the actual start of second DEPTS declaration
var depStart = secondDep - 2; // position of first \n
while (depStart > 0 && script[depStart] !== '\n') depStart--;
var depStart2 = depStart - 1;
while (depStart2 > 0 && script[depStart2] !== '\n') depStart2--;
// Skip back past newlines to find 'const'
var depStart3 = depStart2;
while (depStart3 > 10 && script.substring(depStart3 - 6, depStart3) !== '\n\nconst') depStart3--;
console.log('Second DEPTS starts at', secondDep, ', actual const at', secondDep - (depStart2 - depStart3));

// Better approach: scan for 'const DEPTS=' starting from dep2
var actualDep2 = dep2;
while (actualDep2 > 5 && script.substring(actualDep2 - 7, actualDep2) !== '\n\nconst ') actualDep2--;
console.log('Actual second DEPTS start:', actualDep2, JSON.stringify(script.substring(actualDep2, actualDep2 + 30)));

// The first SCENARIOS ends right before the second DEPTS (minus the \n\n)
var firstScenEndCorrect = actualDep2 - 2; // back up past \n\n
while (script[firstScenEndCorrect] === '\n' || script[firstScenEndCorrect] === '\r') firstScenEndCorrect--;
firstScenEndCorrect++; // include the last ]
console.log('\nFirst SCENARIOS ends at', firstScenEndCorrect);
console.log('Last 20 chars of first SCENARIOS:', JSON.stringify(script.substring(firstScenEndCorrect - 15, firstScenEndCorrect + 5)));

// Find // State
var realState = -1;
for (var i = s2 + 1; i < script.length - 8; i++) {
    if (script[i] === '/' && script[i+1] === '/' && script.substring(i+2, i+8) === ' State') {
        realState = i;
        break;
    }
}
console.log('Real // State at', realState);
console.log('State context:', JSON.stringify(script.substring(realState, realState + 30)));

// Extract sections
var d1 = script.indexOf('const DEPTS=');
var p1 = script.indexOf('const PLATFORMS=');
var m1 = script.indexOf('const MODELS=');

var depSection = script.substring(d1, p1).trimEnd();
var platSection = script.substring(p1, m1).trimEnd();
var modelSection = script.substring(m1, s1).trimEnd();
var scenSection = script.substring(s1, firstScenEndCorrect + 1).trimEnd();
var codeSection = script.substring(realState);

console.log('\nSection lengths:');
console.log('DEPTS:', depSection.length, '({name::', (depSection.match(/{name:/g) || []).length);
console.log('PLATFORMS:', platSection.length);
console.log('MODELS:', modelSection.length);
console.log('SCENARIOS:', scenSection.length, '({name::', (scenSection.match(/{name:/g) || []).length);
console.log('CODE:', codeSection.length);

// Verify data section
try {
    new Function(depSection + '\n\n' + platSection + '\n\n' + modelSection + '\n\n' + scenSection);
    console.log('Data section: OK ✅');
} catch(e) {
    console.log('Data section ERROR:', e.message);
}

// Build clean script
var cleanScript = depSection + '\n\n' + platSection + '\n\n' + modelSection + '\n\n' + scenSection + '\n\n' + codeSection;

// Fix 1: s.sop.split(' → ') -> String(s.sop).split('\n')
cleanScript = cleanScript.replace(/s\.sop\.split\(['"]\s*→\s*['"]\)/g, "String(s.sop).split('\\n')");

// Fix 2: s.sop.join(' ') -> String(s.sop).split('\n').join(' ')
cleanScript = cleanScript.replace(/s\.sop\.join\(['"]\s*['"]\)/g, "String(s.sop).split('\\n').join(' ')");

// Fix 3: toggleSop
var toggleMatch = cleanScript.match(/function toggleSop\(i\)\{[^}]+\}/);
if (toggleMatch) {
    var newToggle = 'function toggleSop(i){var c=document.getElementById("sop-"+i);var a=document.getElementById("arrow-"+i);var show=c.classList.toggle("show");a.textContent=show?"▲":"▼";a.previousSibling.textContent=show?"收起 ":"展开 ";}';
    cleanScript = cleanScript.replace(toggleMatch[0], newToggle);
    console.log('Fixed toggleSop ✅');
}

console.log('\nClean script length:', cleanScript.length);

// Verify
try {
    new Function(cleanScript);
    console.log('JS SYNTAX: OK ✅');
} catch(e) {
    console.log('JS ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('Context:', JSON.stringify(cleanScript.substring(pos - 50, pos + 80)));
    }
}

// Write
var newHtml = h.substring(0, si) + '\n' + cleanScript + '\n' + h.substring(ei);
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', newHtml, 'utf8');
console.log('\nWritten. HTML length:', newHtml.length);
console.log('Done! ✅');
