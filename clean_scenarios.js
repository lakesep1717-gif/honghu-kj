const fs = require('fs');

// 读取原始数据
const data = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios.json', 'utf8'));

// 清理场景名称，删除"变体XX"
const cleaned = data.map(s => ({
  name: s.name.replace(/\s*-?\s*变体\d+/g, '').trim(),
  desc: s.desc,
  platform: s.platform,
  model: s.model,
  dept: s.dept,
  type: s.type,
  sop: s.sop
}));

// 去重（按name+platform+dept组合）
const seen = new Set();
const unique = cleaned.filter(s => {
  const key = `${s.name}|${s.platform}|${s.dept}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.log('Original:', data.length, 'After clean:', cleaned.length, 'Unique:', unique.length);

// 保存清理后的数据
fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_clean.json', JSON.stringify(unique, null, 2), 'utf8');
console.log('Saved to scenarios_clean.json');

// 统计各平台场景数
const byPlatform = {};
unique.forEach(s => {
  byPlatform[s.platform] = (byPlatform[s.platform] || 0) + 1;
});
console.log('By platform:', byPlatform);
