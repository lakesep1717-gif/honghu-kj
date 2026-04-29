var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
console.log('File size:', h.length);
var pos = h.indexOf('const SCENARIOS');
console.log('SCENARIOS at:', pos);
var end = h.indexOf('];', pos);
console.log('SCENARIOS data end:', end);
var data = h.slice(pos, end+2);
// Check first 500 chars
console.log('First 500 of data:');
console.log(data.slice(0, 500));
console.log('---');
// Find esc function
var escPos = h.indexOf('function esc');
console.log('esc at:', escPos);
// Find render
var renPos = h.indexOf('function render');
console.log('render at:', renPos);
