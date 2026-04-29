var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');

var checks = [
  ['const SCENARIOS', h.indexOf('const SCENARIOS')],
  ['let activeDept', h.indexOf('let activeDept')],
  ['var activeDept', h.indexOf('var activeDept')],
  ['DEPTS=[', h.indexOf('DEPTS=[')],
  ['var DEPTS', h.indexOf('var DEPTS')],
  ['function render', h.indexOf('function render')],
  ['renderSidebar', h.indexOf('renderSidebar()')],
  ['function esc', h.indexOf('function esc')],
  ['scenarioList', h.indexOf('scenarioList')],
  ['DEPTS.length', h.indexOf('DEPTS.length')],
];

checks.forEach(function(c) {
  console.log(c[0] + ': ' + c[1]);
});

var scriptEnd = h.lastIndexOf('<\/script>');
var lastScript = h.slice(Math.max(0, scriptEnd - 500), scriptEnd);
console.log('\nLast 500 chars before </script>:');
console.log(lastScript);
