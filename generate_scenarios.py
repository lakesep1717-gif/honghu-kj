#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨境电商RPA场景库数据生成器
生成 300+ 个场景，输出为 JSON 格式
"""

import json
import random

# 平台定义
PLATFORMS = [
    "亚马逊", "Temu", "Shein", "沃尔玛", "TikTok Shop",
    "eBay", "速卖通", "Shopee", "Lazada", "Allegro",
    "OZON", "美客多", "独立站"
]

# 业务模式
MODELS = ["品牌型", "精品型", "精铺型", "铺货型"]

# 部门
DEPTS = [
    {"name": "运营", "icon": "📊"},
    {"name": "财务", "icon": "💰"},
    {"name": "供应链", "icon": "🚚"},
    {"name": "客服", "icon": "🎧"},
    {"name": "人事", "icon": "👥"},
    {"name": "管理", "icon": "🏢"},
    {"name": "合规", "icon": "📋"},
    {"name": "技术", "icon": "💻"}
]

# 场景模板（按部门分类）
SCENARIO_TEMPLATES = {
    "运营": [
        {"name": "竞品价格监控", "desc": "自动抓取竞品价格变化并生成报告"},
        {"name": "广告报表下载", "desc": "定时下载广告报表并汇总分析"},
        {"name": "库存预警", "desc": "监控库存水位并自动发送预警通知"},
        {"name": "关键词排名追踪", "desc": "追踪关键词搜索排名变化"},
        {"name": "评论自动回复", "desc": "根据评论内容自动生成回复"},
        {"name": "活动报名自动化", "desc": "自动填写活动报名信息并提交"},
        {"name": "商品信息同步", "desc": "多平台商品信息自动同步更新"},
        {"name": "销量数据汇总", "desc": "自动汇总各平台销量数据"},
    ],
    "财务": [
        {"name": "对账自动化", "desc": "自动下载平台对账单并核对"},
        {"name": "退税申报", "desc": "自动整理退税资料并提交申报"},
        {"name": "汇率监控", "desc": "监控汇率变化并自动换汇"},
        {"name": "发票自动开具", "desc": "根据订单信息自动开具发票"},
        {"name": "成本核算", "desc": "自动计算商品成本和利润"},
        {"name": "资金流水同步", "desc": "同步各平台资金流水到财务系统"},
    ],
    "供应链": [
        {"name": "采购单自动生成", "desc": "根据库存和销售预测自动生成采购单"},
        {"name": "物流跟踪", "desc": "自动跟踪物流状态并更新系统"},
        {"name": "供应商对账", "desc": "自动核对供应商账单"},
        {"name": "入库验收", "desc": "自动记录入库信息并生成验收单"},
        {"name": "质检报告生成", "desc": "自动生成商品质检报告"},
    ],
    "客服": [
        {"name": "退换货处理", "desc": "自动处理退换货申请并生成工单"},
        {"name": "邮件自动回复", "desc": "根据邮件内容自动分类并回复"},
        {"name": "售后工单同步", "desc": "同步各平台售后工单到客服系统"},
        {"name": "满意度调查", "desc": "自动发送满意度调查并汇总结果"},
    ],
    "人事": [
        {"name": "考勤统计", "desc": "自动统计员工考勤数据"},
        {"name": "薪资核算", "desc": "自动核算薪资并生成工资条"},
        {"name": "招聘信息同步", "desc": "同步招聘网站简历到HR系统"},
        {"name": "培训记录管理", "desc": "自动记录员工培训情况"},
    ],
    "管理": [
        {"name": "日报自动生成", "desc": "自动汇总各部门数据生成日报"},
        {"name": "KPI报表", "desc": "自动计算KPI指标并生成报表"},
        {"name": "经营分析", "desc": "自动生成经营分析图表"},
        {"name": "风险预警", "desc": "监控经营风险并自动预警"},
    ],
    "合规": [
        {"name": "税务申报", "desc": "自动整理税务资料并提交申报"},
        {"name": "知识产权监控", "desc": "监控商标专利侵权风险"},
        {"name": "合规检查", "desc": "自动检查商品合规性"},
        {"name": "证书管理", "desc": "管理各类证书有效期并提醒"},
    ],
    "技术": [
        {"name": "数据备份", "desc": "自动备份关键业务数据"},
        {"name": "系统监控", "desc": "监控系统运行状态并告警"},
        {"name": "API对接", "desc": "自动对接第三方平台API"},
        {"name": "脚本部署", "desc": "自动部署RPA脚本到各终端"},
    ]
}

# SOP 步骤模板
SOP_TEMPLATES = [
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
]

# 效率数据范围
EFFICIENCY_RANGES = {
    "saveTime": (15, 180),  # 分钟
    "saveCost": (50, 5000),  # 元
    "efficiency": (30, 95)   # 百分比
}

def generate_scenarios(target_count=300):
    """生成指定数量的场景"""
    scenarios = []
    scenario_id = 0
    
    # 计算每个部门应该生成的场景数
    dept_count = len(DEPTS)
    per_dept = target_count // dept_count
    remainder = target_count % dept_count
    
    for dept_idx, dept in enumerate(DEPTS):
        dept_name = dept["name"]
        templates = SCENARIO_TEMPLATES.get(dept_name, [])
        
        # 该部门要生成的场景数
        count = per_dept + (1 if dept_idx < remainder else 0)
        
        for i in range(count):
            # 选择平台和业务模式
            platform = random.choice(PLATFORMS)
            model = random.choice(MODELS)
            
            # 使用模板或生成新场景
            if i < len(templates):
                template = templates[i]
                name = f"[{platform}] {template['name']}"
                desc = template['desc']
            else:
                # 生成变体
                base_idx = i % len(templates)
                template = templates[base_idx]
                name = f"[{platform}] {template['name']} - 变体{i//len(templates)+1}"
                desc = template['desc'] + "（定制化版本）"
            
            # 选择SOP模板
            sop = random.choice(SOP_TEMPLATES)
            
            # 生成效率数据
            save_time = random.randint(*EFFICIENCY_RANGES["saveTime"])
            save_cost = random.randint(*EFFICIENCY_RANGES["saveCost"])
            efficiency = random.randint(*EFFICIENCY_RANGES["efficiency"])
            
            # 场景类型
            scene_type = random.choices(
                ["hot", "fast", "potential"],
                weights=[30, 50, 20],
                k=1
            )[0]
            
            scenario = {
                "id": scenario_id,
                "name": name,
                "desc": desc,
                "platform": platform,
                "model": model,
                "dept": dept_name,
                "type": scene_type,
                "sop": sop,
                "saveTime": f"{save_time}分钟/天",
                "saveCost": f"¥{save_cost}/月",
                "efficiency": f"提升{efficiency}%"
            }
            
            scenarios.append(scenario)
            scenario_id += 1
    
    return scenarios[:target_count]  # 确保不超过目标数量

def main():
    # 生成300个场景
    scenarios = generate_scenarios(300)
    
    # 保存为JSON
    output_path = "C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(scenarios, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已生成 {len(scenarios)} 个场景")
    print(f"📁 输出文件: {output_path}")
    
    # 统计信息
    platforms = set(s['platform'] for s in scenarios)
    depts = set(s['dept'] for s in scenarios)
    models = set(s['model'] for s in scenarios)
    
    print(f"\n📊 统计信息:")
    print(f"   平台: {len(platforms)} 个")
    print(f"   部门: {len(depts)} 个")
    print(f"   业务模式: {len(models)} 个")
    
    # 按部门统计
    print(f"\n📋 按部门分布:")
    for dept in DEPTS:
        count = sum(1 for s in scenarios if s['dept'] == dept['name'])
        print(f"   {dept['icon']} {dept['name']}: {count} 个场景")

if __name__ == "__main__":
    main()
