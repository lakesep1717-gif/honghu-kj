const fs = require('fs');

// 读取数据
const data = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_clean.json', 'utf8'));

// 基于名称去重（保留第一个）
const seen = new Set();
const unique = [];
const duplicates = [];

for (const s of data) {
  if (seen.has(s.name)) {
    duplicates.push(s);
  } else {
    seen.add(s.name);
    unique.push(s);
  }
}

// 统计
console.log('原始数据:', data.length);
console.log('去重后:', unique.length);
console.log('重复数:', duplicates.length);

// 按平台统计
const byPlat = {};
for (const s of unique) {
  byPlat[s.platform] = (byPlat[s.platform] || 0) + 1;
}
console.log('\n按平台分布:');
Object.entries(byPlat).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 按部门统计
const byDept = {};
for (const s of unique) {
  byDept[s.dept] = (byDept[s.dept] || 0) + 1;
}
console.log('\n按部门分布:');
Object.entries(byDept).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 保存去重后的数据
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_unique.json', JSON.stringify(unique, null, 2), 'utf8');
console.log('\n已保存到 scenarios_unique.json');
