const fs = require('fs');

// 读取331个场景
const all = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_final.json', 'utf8'));

// 按"部门 + 场景名称"聚合（去掉[平台]前缀）
const scenarioMap = {};

for (const s of all) {
  // 去掉[平台]前缀
  const baseName = s.name.replace(/^\[.*?\]\s*/, '');
  const key = `${s.dept}-${baseName}`;
  
  if (!scenarioMap[key]) {
    scenarioMap[key] = {
      name: baseName,
      desc: s.desc,
      dept: s.dept,
      model: s.model,
      type: s.type,
      sop: s.sop,
      platforms: new Set()
    };
  }
  scenarioMap[key].platforms.add(s.platform);
}

// 转换为数组
const merged = Object.values(scenarioMap).map(item => ({
  name: item.name,
  desc: item.desc,
  dept: item.dept,
  model: item.model,
  type: item.type,
  sop: item.sop,
  platforms: Array.from(item.platforms).filter(p => p !== '通用').sort(),
  platformCount: item.platforms.size
}));

// 按平台数降序排序
merged.sort((a, b) => b.platformCount - a.platformCount);

// 统计
const byDept = {};
const platCountDist = {};

for (const s of merged) {
  byDept[s.dept] = (byDept[s.dept] || 0) + 1;
  const pc = s.platformCount;
  platCountDist[pc] = (platCountDist[pc] || 0) + 1;
}

console.log('=== 按场景名称整合结果 ===');
console.log('原始场景:', all.length);
console.log('整合后:', merged.length);

console.log('\n=== 按覆盖平台数分布 ===');
Object.entries(platCountDist).sort((a,b) => b[0] - a[0]).forEach(([k,v]) => {
  console.log(`  ${k}个平台: ${v}个场景`);
});

console.log('\n=== 按部门分布 ===');
Object.entries(byDept).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

console.log('\n=== 人事部门场景（示例）===');
merged.filter(s => s.dept === '人事').forEach(s => {
  console.log(`  ${s.name} (${s.platformCount}平台: ${s.platforms.slice(0,5).join(', ')}${s.platforms.length > 5 ? '...' : ''})`);
});

console.log('\n=== 覆盖最多平台的TOP10场景 ===');
merged.slice(0, 10).forEach(s => {
  console.log(`  [${s.dept}] ${s.name} - ${s.platformCount}平台`);
  console.log(`    适用: ${s.platforms.join(', ')}`);
});

// 保存
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_integrated.json', JSON.stringify(merged, null, 2), 'utf8');
console.log('\n已保存到 scenarios_integrated.json');