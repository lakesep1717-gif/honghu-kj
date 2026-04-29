var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
var sc = h.substring(h.indexOf('<script>') + 8, h.indexOf('<\/script>'));

// Check SCENARIOS
var s2 = sc.indexOf('const SCENARIOS=');
var end = sc.lastIndexOf('];');
var scen = sc.substring(s2, end + 2);
console.log('SCENARIOS section starts at:', s2);
console.log('SCENARIOS section length:', scen.length);

// Count objects
var objCount = (scen.match(/{name:/g) || []).length;
console.log('Objects in SCENARIOS:', objCount);

// Check first and last few objects
var firstObj = scen.indexOf('{name:');
var lastObj = scen.lastIndexOf('{name:');
console.log('First object starts at:', firstObj);
console.log('Last object starts at:', lastObj);
console.log('First 200 chars:', scen.substring(0, 200));
console.log('Last 200 chars:', scen.substring(scen.length - 200));

// Try to count in the FULL script
var allObjs = (sc.match(/{name:/g) || []).length;
console.log('\nTotal {name: in full script:', allObjs);

// Check the render function - specifically filtered.length
var renderIdx = sc.indexOf('function render()');
var renderEnd = sc.indexOf('function renderCard');
console.log('\nRender function snippet:');
console.log(sc.substring(renderIdx, renderIdx + 500));

// Check if there's a filter issue
var filterIdx = sc.indexOf('filtered=SCENARIOS.filter');
console.log('\nFilter line:', sc.substring(filterIdx, filterIdx + 200));

// Check what the HTML shows - count .scenario-card in file
var cardCount = (h.match(/class="scenario-card"/g) || []).length;
console.log('\nscenario-card elements in HTML:', cardCount);

// Check if SCENARIOS is in an array literal correctly
// Look for how SCENARIOS starts
var scStart = sc.indexOf('const SCENARIOS=[');
console.log('\nSCENARIOS starts:', sc.substring(scStart, scStart + 100));
