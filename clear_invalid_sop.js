const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios_final.json'), 'utf8'));

// 定义不合理的SOP模式
const badSOPPatterns = [
  ['读取待处理任务列表', '逐个打开任务详情页面', '提取关键信息（订单号/金额/状态）', '根据业务规则进行自动判断', '执行相应操作（审核/退款/标记）'],
  ['登录平台卖家中心', '导航至目标数据页面', '设置筛选条件（时间/品类/状态）', '点击导出/下载按钮获取数据'],
  ['配置数据采集参数', '启动浏览器自动化脚本', '遍历目标页面抓取数据']
];

function isTemplateSOP(sop) {
  return badSOPPatterns.some(pattern => {
    return pattern.every((step, i) => sop[i] === step);
  });
}

// 清空不合理的SOP
const cleaned = data.map(scenario => {
  if (isTemplateSOP(scenario.sop)) {
    return {
      ...scenario,
      sop: [] // 清空SOP
    };
  }
  return scenario;
});

// 统计
const emptyCount = cleaned.filter(s => s.sop.length === 0).length;
console.log('总场景数:', cleaned.length);
console.log('SOP清空的场景数:', emptyCount);
console.log('SOP保留的场景数:', cleaned.length - emptyCount);

// 保存
fs.writeFileSync(path.join(__dirname, 'scenarios_cleaned.json'), JSON.stringify(cleaned, null, 2), 'utf8');
console.log('\n已保存到 scenarios_cleaned.json');
