const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');

// Look for DEPTS and PLATFORMS declarations
const deptIdx = html.indexOf('const DEPTS=');
const platIdx = html.indexOf('const PLATFORMS=');
const modIdx = html.indexOf('const MODELS=');
const scenIdx = html.indexOf('const SCENARIOS=');
const renderIdx = html.indexOf('function render()');

console.log('DEPTS at:', deptIdx);
console.log('PLATFORMS at:', platIdx);
console.log('MODELS at:', modIdx);
console.log('SCENARIOS at:', scenIdx);
console.log('render() at:', renderIdx);

// Show DEPTS
if (deptIdx >= 0) {
  const end = html.indexOf(';', deptIdx);
  console.log('\nDEPTS:');
  console.log(html.substring(deptIdx, end+1));
}

// Show PLATFORMS
if (platIdx >= 0) {
  const end = html.indexOf(';', platIdx);
  console.log('\nPLATFORMS:');
  console.log(html.substring(platIdx, end+1));
}

// Show MODELS
if (modIdx >= 0) {
  const end = html.indexOf(';', modIdx);
  console.log('\nMODELS:');
  console.log(html.substring(modIdx, end+1));
}
