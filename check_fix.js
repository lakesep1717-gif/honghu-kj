const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
// Show the first 500 chars
console.log(script.substring(0, 500));
// Find DEPTS array end
const deptEnd = script.indexOf('];');
console.log('\nAfter DEPTS ]:', JSON.stringify(script.substring(deptEnd, deptEnd+30)));
// Find PLATFORMS
const platStart = script.indexOf('const PLATFORMS=');
console.log('\nBefore PLATFORMS:', JSON.stringify(script.substring(platStart-30, platStart+30)));
// Find SCENARIOS end
const scenEnd = script.indexOf('];', script.indexOf('const SCENARIOS='));
console.log('\nAfter SCENARIOS ]:', JSON.stringify(script.substring(scenEnd, scenEnd+10)));
