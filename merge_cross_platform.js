const fs = require('fs');

// 读取331个场景
const all = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_final.json', 'utf8'));

// 按场景名称聚合
const nameMap = {};

for (const s of all) {
  // 去掉 [平台] 前缀获取场景名
  const baseName = s.name.replace(/^\[.*?\]\s*/, '');
  
  if (!nameMap[baseName]) {
    nameMap[baseName] = {
      name: baseName,
      desc: s.desc,
      dept: s.dept,
      model: s.model,
      type: s.type,
      sop: s.sop,
      platforms: new Set()
    };
  }
  nameMap[baseName].platforms.add(s.platform);
}

// 转换为数组
const merged = Object.values(nameMap).map(item => ({
  name: item.name,
  desc: item.desc,
  dept: item.dept,
  model: item.model,
  type: item.type,
  sop: item.sop,
  platforms: Array.from(item.platforms).sort(),
  platformCount: item.platforms.size,
  // 判断是通用还是特定
  platform: item.platforms.size >= 3 ? '通用' : Array.from(item.platforms)[0]
}));

// 统计
const byDept = {};
const byPlat = {};
const platCountDist = {};

for (const s of merged) {
  byDept[s.dept] = (byDept[s.dept] || 0) + 1;
  byPlat[s.platform] = (byPlat[s.platform] || 0) + 1;
  const pc = s.platformCount;
  platCountDist[pc] = (platCountDist[pc] || 0) + 1;
}

console.log('=== 跨平台场景合并结果 ===');
console.log('原始场景:', all.length);
console.log('合并后:', merged.length);

console.log('\n=== 按平台数分布 ===');
Object.entries(platCountDist).sort((a,b) => b[0] - a[0]).forEach(([k,v]) => {
  console.log(`  ${k}平台: ${v}个场景`);
});

console.log('\n=== 按部门分布 ===');
Object.entries(byDept).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

console.log('\n=== 通用场景TOP ===');
const common = merged.filter(s => s.platform === '通用').slice(0, 10);
common.forEach(s => console.log(`  ${s.name} (${s.platformCount}平台)`));

// 保存
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_merged_v2.json', JSON.stringify(merged, null, 2), 'utf8');
console.log('\n已保存到 scenarios_merged_v2.json');