var fs = require('fs');
var dir = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios';

var raw = fs.readFileSync(dir + '/_scenarios_data.js', 'utf8');
console.log('First 200 chars:');
console.log(JSON.stringify(raw.slice(0, 200)));
console.log('---');
// Find 'SCENARIOS'
var idx = raw.indexOf('SCENARIOS');
console.log('SCENARIOS index:', idx);
if (idx > -1) {
  console.log('Around SCENARIOS:', JSON.stringify(raw.slice(idx, idx+50)));
}
