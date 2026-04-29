// 跨境电商RPA场景数据生成器
const fs = require('fs');

// 平台
const PLATFORMS = [
  "亚马逊", "Temu", "Shein", "沃尔玛", "TikTok Shop",
  "eBay", "速卖通", "Shopee", "Lazada", "Allegro",
  "OZON", "美客多", "独立站"
];

// 业务模式
const MODELS = ["品牌型", "精品型", "精铺型", "铺货型"];

// 部门
const DEPTS = [
  { name: "运营", icon: "\u{1F4CA}" },
  { name: "财务", icon: "\u{1F4B0}" },
  { name: "供应链", icon: "\u{1F69A}" },
  { name: "客服", icon: "\u{1F3AC}" },
  { name: "人事", icon: "\u{1F465}" },
  { name: "管理", icon: "\u{1F3E2}" },
  { name: "合规", icon: "\u{1F4CB}" },
  { name: "技术", icon: "\u{1F4BB}" }
];

// 场景模板
const TEMPLATES = {
  "运营": [
    { name: "竞品价格监控", desc: "自动抓取竞品价格变化并生成报告" },
    { name: "广告报表下载", desc: "定时下载广告报表并汇总分析" },
    { name: "库存预警", desc: "监控库存水位并自动发送预警通知" },
    { name: "关键词排名追踪", desc: "追踪关键词搜索排名变化" },
    { name: "评论自动回复", desc: "根据评论内容自动生成回复" },
    { name: "活动报名自动化", desc: "自动填写活动报名信息并提交" },
    { name: "商品信息同步", desc: "多平台商品信息自动同步更新" },
    { name: "销量数据汇总", desc: "自动汇总各平台销量数据" },
  ],
  "财务": [
    { name: "对账自动化", desc: "自动下载平台对账单并核对" },
    { name: "退税申报", desc: "自动整理退税资料并提交申报" },
    { name: "汇率监控", desc: "监控汇率变化并自动换汇" },
    { name: "发票自动开具", desc: "根据订单信息自动开具发票" },
    { name: "成本核算", desc: "自动计算商品成本和利润" },
    { name: "资金流水同步", desc: "同步各平台资金流水到财务系统" },
  ],
  "供应链": [
    { name: "采购单自动生成", desc: "根据库存和销售预测自动生成采购单" },
    { name: "物流跟踪", desc: "自动跟踪物流状态并更新系统" },
    { name: "供应商对账", desc: "自动核对供应商账单" },
    { name: "入库验收", desc: "自动记录入库信息并生成验收单" },
    { name: "质检报告生成", desc: "自动生成商品质检报告" },
  ],
  "客服": [
    { name: "退换货处理", desc: "自动处理退换货申请并生成工单" },
    { name: "邮件自动回复", desc: "根据邮件内容自动分类并回复" },
    { name: "售后工单同步", desc: "同步各平台售后工单到客服系统" },
    { name: "满意度调查", desc: "自动发送满意度调查并汇总结果" },
  ],
  "人事": [
    { name: "考勤统计", desc: "自动统计员工考勤数据" },
    { name: "薪资核算", desc: "自动核算薪资并生成工资条" },
    { name: "招聘信息同步", desc: "同步招聘网站简历到HR系统" },
    { name: "培训记录管理", desc: "自动记录员工培训情况" },
  ],
  "管理": [
    { name: "日报自动生成", desc: "自动汇总各部门数据生成日报" },
    { name: "KPI报表", desc: "自动计算KPI指标并生成报表" },
    { name: "经营分析", desc: "自动生成经营分析图表" },
    { name: "风险预警", desc: "监控经营风险并自动预警" },
  ],
  "合规": [
    { name: "税务申报", desc: "自动整理税务资料并提交申报" },
    { name: "知识产权监控", desc: "监控商标专利侵权风险" },
    { name: "合规检查", desc: "自动检查商品合规性" },
    { name: "证书管理", desc: "管理各类证书有效期并提醒" },
  ],
  "技术": [
    { name: "数据备份", desc: "自动备份关键业务数据" },
    { name: "系统监控", desc: "监控系统运行状态并告警" },
    { name: "API对接", desc: "自动对接第三方平台API" },
    { name: "脚本部署", desc: "自动部署RPA脚本到各终端" },
  ]
};

// SOP模板
const SOP_TEMPLATES = [
  [
    "登录平台卖家中心",
    "导航至目标数据页面",
    "设置筛选条件（时间/品类/状态）",
    "点击导出/下载按钮获取数据",
    "对原始数据进行清洗和格式转换",
    "将结构化数据写入Excel/数据库",
    "生成可视化报表并发送通知"
  ],
  [
    "读取待处理任务列表",
    "逐个打开任务详情页面",
    "提取关键信息（订单号/金额/状态）",
    "根据业务规则进行自动判断",
    "执行相应操作（审核/退款/标记）",
    "更新任务状态并记录日志",
    "生成处理结果汇总报告"
  ],
  [
    "配置数据采集参数",
    "启动浏览器自动化脚本",
    "遍历目标页面抓取数据",
    "对异常数据进行标记和处理",
    "将清洗后数据存入中间表",
    "触发下游系统同步接口",
    "校验数据一致性并发送完成通知"
  ]
];

// 生成场景
function generateScenarios(count) {
  const scenarios = [];
  
  for (let i = 0; i < count; i++) {
    // 轮流分配部门
    const deptIdx = i % DEPTS.length;
    const dept = DEPTS[deptIdx];
    
    // 随机选择平台、模式
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const model = MODELS[Math.floor(Math.random() * MODELS.length)];
    
    // 获取该部门的模板
    const templates = TEMPLATES[dept.name] || [];
    const templateIdx = Math.floor(i / DEPTS.length) % templates.length;
    const template = templates[templateIdx];
    
    // 生成变体名称
    const variant = Math.floor(i / DEPTS.length);
    const name = variant === 0 
      ? `[${platform}] ${template.name}`
      : `[${platform}] ${template.name} - 变体${variant}`;
    
    // 随机选择SOP
    const sop = SOP_TEMPLATES[Math.floor(Math.random() * SOP_TEMPLATES.length)];
    
    // 效率数据
    const saveTime = Math.floor(Math.random() * (180 - 15 + 1)) + 15;
    const saveCost = Math.floor(Math.random() * (5000 - 50 + 1)) + 50;
    const efficiency = Math.floor(Math.random() * (95 - 30 + 1)) + 30;
    
    // 场景类型
    const types = ["hot", "fast", "potential"];
    const weights = [0.3, 0.5, 0.2];
    const type = weightedRandom(types, weights);
    
    scenarios.push({
      name,
      desc: template.desc,
      platform,
      model,
      dept: dept.name,
      type,
      sop,
      saveTime: `${saveTime}分钟/天`,
      saveCost: `\u00A5${saveCost}/月`,
      efficiency: `提升${efficiency}%`
    });
  }
  
  return scenarios;
}

function weightedRandom(items, weights) {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (r <= sum) return items[i];
  }
  return items[items.length - 1];
}

// 生成300个场景
const scenarios = generateScenarios(300);

// 输出统计
console.log(`\u2705 已生成 ${scenarios.length} 个场景`);

const platforms = new Set(scenarios.map(s => s.platform));
const depts = new Set(scenarios.map(s => s.dept));
const models = new Set(scenarios.map(s => s.model));

console.log('\n📊 统计信息:');
console.log('   平台: ' + platforms.size + ' 个');
console.log('   部门: ' + depts.size + ' 个');
console.log('   业务模式: ' + models.size + ' 个');

// 按部门统计
console.log('\n📋 按部门分布:');
DEPTS.forEach(dept => {
  const count = scenarios.filter(s => s.dept === dept.name).length;
  console.log('   ' + dept.icon + ' ' + dept.name + ': ' + count + ' 个场景');
});

// 保存为JSON
const jsonPath = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios.json';
fs.writeFileSync(jsonPath, JSON.stringify(scenarios, null, 2), 'utf8');
console.log('\n📁 已保存到: ' + jsonPath);

// 生成JavaScript数组字符串（用于嵌入HTML）
const jsArray = JSON.stringify(scenarios, null, 2);
console.log('\n🔧 JS数组长度: ' + jsArray.length + ' 字符');
