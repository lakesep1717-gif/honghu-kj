const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios_valid.json'), 'utf8'));

// 找出重复的SOP
const sopMap = new Map(); // sop -> [场景列表]
data.forEach(scenario => {
  const key = JSON.stringify(scenario.sop);
  if (!sopMap.has(key)) {
    sopMap.set(key, []);
  }
  sopMap.get(key).push(scenario);
});

console.log('总场景数:', data.length);
console.log('唯一SOP数:', sopMap.size);

// 找出重复超过2次的SOP
const duplicates = [];
sopMap.forEach((scenarios, sopKey) => {
  if (scenarios.length > 2) {
    duplicates.push({
      sop: JSON.parse(sopKey),
      count: scenarios.length,
      scenarios: scenarios.map(s => s.name)
    });
  }
});

console.log('\n重复超过2次的SOP数:', duplicates.length);
console.log('\n前10个重复最多的SOP:');
duplicates.sort((a, b) => b.count - a.count).slice(0, 10).forEach((d, i) => {
  console.log(`\n${i + 1}. 重复${d.count}次`);
  console.log('   SOP:', d.sop.slice(0, 3).join(' → ') + '...');
  console.log('   场景:', d.scenarios.slice(0, 3).join(', ') + (d.scenarios.length > 3 ? '...' : ''));
});
