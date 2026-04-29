var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');

// Find SCENARIOS data
var sStart = h.indexOf('const SCENARIOS=');
var sEnd = h.indexOf('var DEPTS');
var data = h.slice(sStart, sEnd);
console.log('SCENARIOS data length:', data.length);
console.log('First 300 chars:', data.slice(0, 300));

// Count items in SCENARIOS array
var bracketCount = 0;
var inStr = false;
var strChar = '';
var itemCount = 0;
for (var i = 0; i < data.length; i++) {
  var c = data[i];
  if (!inStr) {
    if (c === '"' || c === "'") { inStr = true; strChar = c; }
    else if (c === '{') { bracketCount++; }
    else if (c === '}') { bracketCount--; if (bracketCount === 0) itemCount++; }
  } else {
    if (c === strChar && data[i-1] !== '\\') inStr = false;
  }
}
console.log('Estimated items in SCENARIOS:', itemCount);

// Check render function area
var rStart = h.indexOf('function render');
console.log('\n--- render function area ---');
console.log(h.slice(rStart, rStart + 200));

// Check renderCard
var rcStart = h.indexOf('function renderCard');
if (rcStart === -1) rcStart = h.indexOf('renderCard(');
console.log('\n--- renderCard area ---');
if (rcStart > -1) console.log(h.slice(rcStart, rcStart + 300));
else console.log('renderCard NOT FOUND');

// Check if esc function exists
var escStart = h.indexOf('function esc');
console.log('\n--- esc function ---');
console.log('esc position:', escStart);
if (escStart > -1) console.log(h.slice(escStart, escStart + 100));

// Check activeDept
var aStart = h.indexOf('let activeDept');
var vStart = h.indexOf('var activeDept');
console.log('\nactiveDept (let):', aStart);
console.log('activeDept (var):', vStart);

// Check what's between render and renderSidebar
var rPos = h.indexOf('function render');
var rsPos = h.indexOf('function renderSidebar');
var between = h.slice(rPos, rsPos);
console.log('\n--- Functions between render and renderSidebar ---');
console.log('Between render and renderSidebar:', between.length, 'chars');
var fnMatches = between.match(/function \w+/g);
console.log('Functions found:', fnMatches);
