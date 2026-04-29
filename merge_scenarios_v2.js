const fs = require('fs');
const path = require('path');

// 读取数据
const scenarios = require(path.join(__dirname, 'scenarios_cleaned.json'));

console.log('原始场景数:', scenarios.length);

// 按场景名称整合（去掉平台前缀）
const integratedMap = {};

scenarios.forEach(s => {
  // 提取场景名称（去掉平台前缀）
  const scenarioName = s.name.replace(/^\[.*?\]\s*/, '');
  const key = `${s.dept}-${scenarioName}`;

  if (!integratedMap[key]) {
    integratedMap[key] = {
      name: scenarioName,
      desc: s.desc,
      dept: s.dept,
      model: s.model,
      type: s.type,
      sop: s.sop,
      platforms: []
    };
  }

  // 合并平台
  if (s.platforms && s.platforms.length > 0) {
    s.platforms.forEach(p => {
      if (!integratedMap[key].platforms.includes(p)) {
        integratedMap[key].platforms.push(p);
      }
    });
  } else if (s.platform && s.platform !== '通用') {
    if (!integratedMap[key].platforms.includes(s.platform)) {
      integratedMap[key].platforms.push(s.platform);
    }
  }
});

// 转换为数组并排序
const integrated = Object.values(integratedMap);
integrated.sort((a, b) => {
  // 先按部门排序
  const deptOrder = ['运营', '财务', '供应链', '客服', '人事', '技术', '合规', '管理'];
  const deptA = deptOrder.indexOf(a.dept);
  const deptB = deptOrder.indexOf(b.dept);
  if (deptA !== deptB) return deptA - deptB;
  // 再按平台数量降序
  return b.platforms.length - a.platforms.length;
});

console.log('整合后场景数:', integrated.length);

// 统计
const deptCount = {};
integrated.forEach(s => {
  deptCount[s.dept] = (deptCount[s.dept] || 0) + 1;
});
console.log('部门分布:', deptCount);

const multiPlatformCount = integrated.filter(s => s.platforms.length >= 3).length;
console.log('覆盖3+平台的场景:', multiPlatformCount);

const fourPlatformCount = integrated.filter(s => s.platforms.length >= 4).length;
console.log('覆盖4+平台的场景:', fourPlatformCount);

// 保存
fs.writeFileSync(
  path.join(__dirname, 'scenarios_integrated_v2.json'),
  JSON.stringify(integrated, null, 2),
  'utf8'
);

console.log('\n已保存到 scenarios_integrated_v2.json');
