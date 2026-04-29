var fs = require('fs');
var h = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf8');
console.log('File size:', h.length);

var checks = [
  ['const SCENARIOS', '数据'],
  ['function esc', '转义函数'],
  ['function render', '主渲染函数'],
  ['var _idx', '卡片计数器'],
  ['function renderCard', '卡片渲染'],
  ['function toggleSop', 'SOP展开'],
  ['function renderSidebar', '侧边栏'],
  ['function renderFilters', '筛选按钮'],
  ['var DEPTS', '部门数据'],
  ['var PLATFORMS', '平台数据'],
  ['var MODELS', '模式数据'],
  ['renderSidebar()', '初始化-侧边栏'],
  ['renderFilters()', '初始化-筛选'],
  ['render()', '初始化-主渲染'],
];

checks.forEach(function(c) {
  var pos = h.indexOf(c[0]);
  console.log((pos > -1 ? '[OK]' : '[MISSING]') + ' ' + c[1] + ' (' + c[0] + ')');
});

// Check SOP split logic
var sopIdx = h.indexOf('sopRaw.split');
console.log('\nSOP split logic at:', sopIdx);
if (sopIdx > -1) console.log(h.slice(sopIdx, sopIdx + 200));

// Check esc function
var escIdx = h.indexOf('function esc');
console.log('\nesc function:');
console.log(h.slice(escIdx, escIdx + 150));
