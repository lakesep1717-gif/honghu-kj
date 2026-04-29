const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

// Look for \r or \n inside string literals
// Count lines
const lines = code.split('\n');
console.log('Total lines in script:', lines.length);
console.log('Line 1 (first 80 chars):', JSON.stringify(lines[0].substring(0, 80)));
console.log('Line 2 (first 80 chars):', JSON.stringify(lines[1].substring(0, 80)));
console.log('Line 3 (first 80 chars):', JSON.stringify(lines[2].substring(0, 80)));

// Check if DEPTS ends properly
const deptEnd = code.indexOf('];');
const afterDept = code.substring(deptEnd, deptEnd+20);
console.log('\nAfter DEPTS ]:', JSON.stringify(afterDept));

// Check SCENARIOS end
const scenStart = code.indexOf('const SCENARIOS=');
const afterScen = code.substring(scenStart, scenStart+100);
console.log('\nSCENARIOS start:', JSON.stringify(afterScen.substring(0, 100)));

// Try to find the exact error by binary searching
let lo = 0, hi = lines.length;
while (hi - lo > 1) {
  const mid = Math.floor((lo + hi) / 2);
  try {
    new Function(lines.slice(0, mid).join('\n'));
    lo = mid;
  } catch(e) {
    hi = mid;
  }
}
console.log('\nError between line', lo, 'and', hi);
console.log('Line', lo, ':', JSON.stringify(lines[lo-1].substring(0, 120)));
console.log('Line', hi, ':', JSON.stringify(lines[hi-1].substring(0, 120)));
