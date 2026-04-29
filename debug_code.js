var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_backup_20260427_162804.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// The code section from // State onwards
var codeSec = sc.substring(122202);
console.log('Code section (' + codeSec.length + ' chars):');
console.log('First 300 chars:', JSON.stringify(codeSec.substring(0, 300)));
console.log('\nLast 200 chars:', JSON.stringify(codeSec.substring(codeSec.length - 200)));

// Find where the State variable declaration actually is
var letMatch = codeSec.match(/let activeDept/);
console.log('\n"let activeDept" found:', letMatch !== null);
if (letMatch) {
    console.log('Position in codeSec:', codeSec.indexOf('let activeDept'));
}

// Try to find "let " in the code
var allLets = [];
var idx = 0;
while (true) {
    idx = codeSec.indexOf('let ', idx);
    if (idx === -1) break;
    allLets.push(idx + ': ' + JSON.stringify(codeSec.substring(idx, idx + 60)));
    idx += 1;
}
console.log('\n"let " occurrences in codeSec:');
allLets.forEach(function(l) { console.log(' ', l); });

// Try to find 'var ' in the code
var allVars = [];
idx = 0;
while (true) {
    idx = codeSec.indexOf('var ', idx);
    if (idx === -1) break;
    allVars.push(idx + ': ' + JSON.stringify(codeSec.substring(idx, idx + 60)));
    idx += 1;
}
console.log('\n"var " occurrences in codeSec:');
allVars.forEach(function(v) { console.log(' ', v); });

// Check: is the State variable declaration actually AFTER the SCENARIOS data?
// Let's look at what comes right after the SCENARIOS ] (at 122198)
console.log('\nChars [122190-122220]:', JSON.stringify(sc.substring(122190, 122220)));

// What IS the // State in the backup?
console.log('\n// State in backup (122202):', JSON.stringify(sc.substring(122202, 122260)));

// Let's find where activeDept is declared in the original script
var activeDeptPos = sc.indexOf('let activeDept=');
console.log('\n"let activeDept=" in backup:', activeDeptPos);

// Let's find "function renderCards"
var renderPos = sc.indexOf('function renderCards');
console.log('"function renderCards" in backup:', renderPos);

// Now: in the CLEAN file (before corruption), where should the code be?
// The clean code should be after SCENARIOS data
// In the clean file, the code starts after the SCENARIOS ] at some position
// Let's find function renderCards in the full script
if (renderPos !== -1) {
    console.log('\nChars [renderCards-50, renderCards+50]:', JSON.stringify(sc.substring(renderPos - 50, renderPos + 50)));
}

// What about searching for 'renderCards' near where the clean code should be?
var nearEnd = sc.substring(61000, 61500);
console.log('\n[61000-61500] has renderCards:', nearEnd.indexOf('renderCards') !== -1);
