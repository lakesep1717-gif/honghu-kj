const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios_final.json'), 'utf8'));

// 定义不合理的SOP模式（这些SOP明显与场景不匹配）
const badSOPPatterns = [
  // 这些是通用模板，不应该出现在具体业务场景中
  ['读取待处理任务列表', '逐个打开任务详情页面', '提取关键信息（订单号/金额/状态）', '根据业务规则进行自动判断', '执行相应操作（审核/退款/标记）'],
  ['登录平台卖家中心', '导航至目标数据页面', '设置筛选条件（时间/品类/状态）', '点击导出/下载按钮获取数据'],
  ['配置数据采集参数', '启动浏览器自动化脚本', '遍历目标页面抓取数据']
];

// 检查SOP是否是模板化的（不合理）
function isTemplateSOP(sop) {
  return badSOPPatterns.some(pattern => {
    return pattern.every((step, i) => sop[i] === step);
  });
}

// 过滤场景：保留SOP合理的场景
const validScenarios = data.filter(scenario => {
  return !isTemplateSOP(scenario.sop);
});

console.log('原始场景数:', data.length);
console.log('SOP合理的场景数:', validScenarios.length);
console.log('移除的场景数（SOP不合理）:', data.length - validScenarios.length);

// 统计移除的场景名称
const removed = data.filter(s => isTemplateSOP(s.sop));
const removedDepts = {};
removed.forEach(s => {
  removedDepts[s.dept] = (removedDepts[s.dept] || 0) + 1;
});
console.log('\n移除场景的部门分布:');
Object.entries(removedDepts).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
  console.log(`  ${dept}: ${count}个`);
});

// 保存
fs.writeFileSync(path.join(__dirname, 'scenarios_valid.json'), JSON.stringify(validScenarios, null, 2), 'utf8');
console.log('\n已保存到 scenarios_valid.json');

// 统计剩余场景的唯一SOP数量
const uniqueSOPs = new Set();
validScenarios.forEach(s => uniqueSOPs.add(JSON.stringify(s.sop)));
console.log('\n剩余场景的唯一SOP数:', uniqueSOPs.size);
