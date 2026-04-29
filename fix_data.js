var fs = require('fs');
var dir = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios';

var raw = fs.readFileSync(dir + '/_scenarios_data.js', 'utf8');
console.log('Raw length:', raw.length);

var start = raw.indexOf('const SCENARIOS = [');
var end = raw.lastIndexOf('];') + 2;
console.log('Data start:', start, 'end:', end, 'len:', end - start);

var data = raw.slice(start, end);
// Count items
var cnt = 0;
for (var i = 0; i < data.length; i++) {
  if (data[i] === '{') cnt++;
}
console.log('Items:', cnt);

// Escape newlines in strings
var out = '';
var inStr = false;
var strChar = '';
for (var i = 0; i < data.length; i++) {
  var c = data[i];
  if (!inStr) {
    if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      out += c;
    } else {
      out += c;
    }
  } else {
    if (c === strChar && data[i-1] !== '\\') {
      inStr = false;
      out += c;
    } else if (c === '\n') {
      out += '\\n';
    } else if (c === '\r') {
      // skip
    } else {
      out += c;
    }
  }
}

console.log('Escaped length:', out.length);
console.log('Has \\\\n:', out.indexOf('\\n') > -1);
console.log('Sample:', out.slice(200, 400));

var safeData = out;
fs.writeFileSync(dir + '/_safe_data.js', safeData, 'utf8');
console.log('Written!');
