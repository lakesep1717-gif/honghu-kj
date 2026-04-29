var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Extract the THIRD SCENARIOS (clean)
var s2 = 61529;
var scenEnd = 122198; // from previous analysis

// Extract just the SCENARIOS content (without const SCENARIOS=)
var scenContent = sc.substring(s2 + 'const SCENARIOS='.length, scenEnd + 1);
console.log('SCENARIOS content length:', scenContent.length);
console.log('First 200 chars:', JSON.stringify(scenContent.substring(0, 200)));
console.log('Last 200 chars:', JSON.stringify(scenContent.substring(scenContent.length - 200)));

// Count objects
var objCount = (scenContent.match(/{/g) || []).length;
var closeCount = (scenContent.match(/}/g) || []).length;
console.log('Open {:', objCount, 'Close }:', closeCount, 'Diff:', objCount - closeCount);

// Test syntax
try {
    new Function('const SCENARIOS=[' + scenContent + '];');
    console.log('SCENARIOS SYNTAX: OK ✅');
} catch(e) {
    console.log('SCENARIOS SYNTAX ERROR:', e.message);
    var m = e.message.match(/position (\d+)/);
    if (m) {
        var pos = parseInt(m[1]);
        console.log('Error context:', JSON.stringify(('const SCENARIOS=[' + scenContent).substring(Math.max(0,pos-50), pos+80)));
    }
}

// Check for actual newlines in the content
var hasNewline = scenContent.indexOf('\n') !== -1;
var hasSlashN = scenContent.indexOf('\\n') !== -1;
console.log('\nHas actual newlines:', hasNewline);
console.log('Has \\n escape:', hasSlashN);

// Find first actual newline
if (hasNewline) {
    var firstNL = scenContent.indexOf('\n');
    console.log('First newline at', firstNL, ':', JSON.stringify(scenContent.substring(Math.max(0,firstNL-30), firstNL+30)));
}

// Count actual newlines vs \n escapes
var actualNL = (scenContent.match(/\n/g) || []).length;
var escapedNL = (scenContent.match(/\\n/g) || []).length;
console.log('Actual newlines:', actualNL);
console.log('Escaped \\n:', escapedNL);

// Show a sop field
var sopMatch = scenContent.match(/sop:"([^"]*)"/);
if (sopMatch) {
    console.log('\nFirst sop field (plain text):', JSON.stringify(sopMatch[1].substring(0, 100)));
}

// Show the SOP separator being used
var arrowMatch = scenContent.match(/→/g);
console.log('\nArrow separator count:', (arrowMatch || []).length);
var plainArrowMatch = scenContent.match(/→/g);
console.log('Unicode arrow count:', (plainArrowMatch || []).length);
