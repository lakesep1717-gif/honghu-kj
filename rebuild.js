var fs = require('fs');
var dir = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios';

var raw = fs.readFileSync(dir + '/_scenarios_data.js', 'utf8');
console.log('Raw data length:', raw.length);
console.log('First 100:', raw.slice(0, 100));

var dataMatch = raw.match(/const SCENARIOS = (\[[\s\S]*?\]);/);
console.log('Match found:', !!dataMatch);
if (dataMatch) {
  console.log('Match length:', dataMatch[1].length);
  console.log('Match first 100:', dataMatch[1].slice(0, 100));
}
