const fs = require('fs');

// 读取数据
const data = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_unique.json', 'utf8'));

// 提取场景核心名称（去掉[平台]前缀）
function getCoreName(name) {
  const match = name.match(/^\[.*?\]\s*(.*)$/);
  return match ? match[1] : name;
}

// 按核心名称+部门分组
const groups = {};
for (const s of data) {
  const core = getCoreName(s.name);
  const key = `${core}|||${s.dept}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(s);
}

// 分类处理
const merged = [];      // 合并为通用（出现在5+平台）
const platformSpecific = []; // 保留平台特定（<5平台）

for (const [key, items] of Object.entries(groups)) {
  const [coreName, dept] = key.split('|||');
  const platforms = [...new Set(items.map(s => s.platform))];
  
  if (platforms.length >= 5) {
    // 5个及以上平台 → 合并为通用
    const models = [...new Set(items.map(s => s.model))];
    const types = [...new Set(items.map(s => s.type))];
    
    merged.push({
      name: `[通用] ${coreName}`,
      desc: items[0].desc,
      platform: '通用',
      model: models[0],
      dept: dept,
      type: types[0],
      sop: items[0].sop,
      platforms: platforms,
      platformCount: platforms.length
    });
  } else {
    // 保留平台特定
    for (const s of items) {
      platformSpecific.push(s);
    }
  }
}

// 合并结果
const final = [...merged, ...platformSpecific];

// 统计
const byDept = {};
for (const s of final) byDept[s.dept] = (byDept[s.dept] || 0) + 1;

const byPlat = {};
for (const s of final) byPlat[s.platform] = (byPlat[s.platform] || 0) + 1;

console.log('=== 场景整合结果 ===');
console.log('原始场景数:', data.length);
console.log('合并为通用:', merged.length);
console.log('平台特定保留:', platformSpecific.length);
console.log('最终总数:', final.length);

console.log('\n=== 通用场景（5+平台）===');
merged.forEach(s => {
  console.log(`  ${s.name} (${s.platformCount}平台: ${s.platforms.slice(0,3).join(', ')}${s.platformCount > 3 ? '...' : ''})`);
});

console.log('\n=== 按平台分布 ===');
Object.entries(byPlat).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

console.log('\n=== 按部门分布 ===');
Object.entries(byDept).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// 保存
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_merged.json', JSON.stringify(final, null, 2), 'utf8');
console.log('\n已保存到 scenarios_merged.json');
