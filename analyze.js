var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
console.log('File size:', h.length);

// Find all function definitions
var funcs = ['function esc', 'function render', 'function renderCard', 'function toggleSop', 
             'function renderSidebar', 'function renderFilters', 'function setDept',
             'function setPlatform', 'function setModel', 'var _idx', 'var DEPTS'];
funcs.forEach(function(f) {
  var pos = h.indexOf(f);
  console.log(f + ':', pos, pos > 0 ? '->' + h.slice(pos, pos+50).replace(/\n/g,' ') : '');
});

// Check what's between render and toggleSop
var r = h.indexOf('function render');
var t = h.indexOf('function toggleSop');
if (r > 0 && t > 0) {
  var between = h.slice(r, t);
  console.log('\nBetween render and toggleSop (' + between.length + ' chars):');
  console.log(between.slice(0, 300));
  console.log('---');
  console.log(between.slice(-200));
}

// Check if _idx exists anywhere
console.log('\n_idx anywhere:', h.indexOf('_idx'));
console.log('renderCard anywhere:', h.indexOf('renderCard'));
