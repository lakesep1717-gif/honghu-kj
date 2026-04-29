import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

file = r"C:\Users\10540\.qclaw\workspace\rpa-scenarios\index.html"

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find SCENARIOS array boundaries
arr_start = content.find('const SCENARIOS=[') + len('const SCENARIOS=[')
arr_end_match = re.search(r'\n\];', content[arr_start:])
arr_end = arr_start + arr_end_match.start()

print(f"Array: {arr_start} to {arr_end}, length={arr_end-arr_start}")
arr_content = content[arr_start:arr_end]

# Parse all scenario objects
scenarios = []
# Match: {name:"...",desc:"...",platform:"...",model:"...",type:"...",dept:"...",sop:"..."}
pattern = re.compile(
    r'\{name:"([^"]*)",desc:"([^"]*)",platform:"([^"]*)",model:"([^"]*)",type:"([^"]*)",dept:"([^"]*)"(?:,saveTime:"([^"]*)")?(?:,saveCost:"([^"]*)")?(?:,efficiency:"([^"]*)")?,sop:"([^"]*)"\}',
    re.DOTALL
)

for m in pattern.finditer(arr_content):
    scenarios.append({
        'name': m.group(1),
        'desc': m.group(2),
        'platform': m.group(3),
        'model': m.group(4),
        'type': m.group(5),
        'dept': m.group(6),
        'saveTime': m.group(7) or '',
        'saveCost': m.group(8) or '',
        'efficiency': m.group(9) or '',
        'sop': m.group(10),
    })

print(f"Parsed {len(scenarios)} scenarios")

# SOP detail expansion mapping
# Key: (platform, name keywords) or generic patterns
SOP_TEMPLATES = {
    "亚马逊商品详情批量采集": "① 登录亚马逊卖家后台，进入「数据报告」→「库存和销售报告」→ 选择「销售报告」\n② 设置日期范围（建议近30天），导出ASIN销售明细CSV（约30-50列字段）\n③ 用Python/Pandas清洗数据，提取ASIN、销量、单价、退货量等核心字段\n④ 关联成本表，计算各ASIN毛利率 = (售价 - FBA费用 - 商品成本) / 售价\n⑤ 按毛利率排序，标注TOP20（主力款）和BOTTOM20（待优化款）\n⑥ 生成Excel透视表，自动附带柱状图（销量对比）+ 折线图（趋势变化）\n⑦ 邮件自动推送管理层，正文摘要TOP3变化点，附件附完整数据",
    
    "关键词排名监控": "① 登录亚马逊卖家后台「品牌分析」，导出核心关键词排名数据\n② 逐个关键词搜索，定位本品ASIN当前自然排名位置\n③ 记录排名变化（前一天 vs 今天），计算升降幅度\n④ 对比历史30天排名趋势，识别持续下滑关键词\n⑤ 标注竞品入侵关键词（竞品排名持续上升且超越本品）\n⑥ 生成排名监控日报，发送运营团队\n⑦ 异常关键词自动加入「待优化Listing」待办",
    
    "FBA库存预警": "① 登录亚马逊卖家后台，进入「库存」→「管理FBA库存」\n② 导出当前库存明细，含SKU、可用数量、在途数量、预留数量字段\n③ 设置安全库存阈值 = 7天平均日销量 × 备货周期（通常14-30天）\n④ 计算各SKU「可用天数」= 可用数量 / 日均销量\n⑤ 识别可用天数 < 安全阈值的SKU，标记为「紧急补货」\n⑥ 生成补货建议表，含建议补货量（= 安全库存 - 当前可用）\n⑦ 自动发送邮件通知采购和运营，附带补货建议表Excel",
    
    "评价监控": "① 登录各平台店铺后台，进入「评价管理」或「Feedback」页面\n② 实时抓取最新评价列表，提取评价星级、内容、时间、买家账号\n③ 识别差评（1-2星）：提取问题关键词，分类（物流/质量/服务）\n④ 自动匹配预设回复模板（如「物流问题道歉+补偿方案」）\n⑤ 未回复差评超过24小时自动标记升级\n⑥ 生成差评日报推送给客服主管\n⑦ 差评率超过阈值（如3%）触发预警",
    
    "广告数据日报": "① 登录亚马逊广告后台，进入「报告」→「所有广告活动」\n② 设置报表类型为「推广的商品」，导出昨日广告数据（ACOS/花费/订单/点击）\n③ 计算汇总指标：总花费、总订单数、平均ACOS、CTR、CPC\n④ 按SKU分组，计算各SKU广告贡献占比\n⑤ 对比前日数据，标注ACOS异常上升的Campaign\n⑥ 生成广告日报（数据透视表+图表），推送运营\n⑦ 高ACOS Campaign自动建议降低出价或暂停",
    
    "多店铺订单汇总处理": "① 登录各店铺后台，进入「订单管理」页面\n② 设置时间范围（昨日0:00-24:00），导出订单CSV\n③ 合并所有店铺订单表，按收件人信息去重\n④ 按仓库/物流方式分组，生成波次拣货单\n⑤ 推送拣货单到WMS系统，生成发货指令\n⑥ 批量打印面单（按物流渠道分组）\n⑦ 更新各平台订单状态为「已发货」，填写追踪号",
    
    "FBA费用计算": "① 收集商品基础数据：重量(kg)、体积(cm³)、商品成本、FBA配送费\n② 读取亚马逊FBA费用表（含月度仓储费、长期仓储费）\n③ 计算头程成本：按重量或体积重(cbm)计算物流费分摊\n④ 计算FBA总成本 = FBA配送费 + 头程分摊 + 仓储费 + 退货处理费（估算）\n⑤ 计算毛利率 = (售价 - FBA总成本 - 商品成本) / 售价\n⑥ 生成SKU利润分析表，含盈亏平衡售价\n⑦ 标注毛利率低于目标值的SKU",
    
    "多平台库存实时同步": "① 连接各平台API或登录后台，导出当前库存数据\n② 读取中央WMS库存作为主数据源（含可用数量、预留数量）\n③ 逐平台比对：中央库存 ≠ 平台库存 → 触发同步\n④ 计算各平台可售数量 = 中央可用 - 已出单未发货\n⑤ 调用各平台库存更新API，批量写入最新库存\n⑥ 记录同步日志：成功/失败/差异量\n⑦ 同步失败自动重试3次，仍失败发送告警",
    
    "商品批量上传": "① 读取商品主数据表（含SKU、标题、价格、库存、图片URL、属性）\n② 对图片进行预处理：压缩、添加水印、统一尺寸（800×800）\n③ 根据平台要求填写商品属性（变体/尺寸/颜色/材质等）\n④ 处理多语言翻译（中文→英语/日语/德语等）\n⑤ 生成符合平台格式的上传模板（CSV/Excel）\n⑥ 批量上传商品，等待平台处理完成\n⑦ 记录上传结果：成功/失败SKU，失败原因",
    
    "价格自动调整": "① 抓取竞品价格数据（同类ASIN历史价格）\n② 设置调价规则：低于竞品X%则涨价，高于Y%则降价\n③ 计算最优售价 = 竞品均价 × (1 ± 调价幅度)\n④ 确认新价格在利润容忍范围内（不低于成本+最低利润率）\n⑤ 批量更新各平台商品价格\n⑥ 记录调价历史，供后续分析\n⑦ 禁止频繁调价：同一SKU每天最多调价2次",
    
    "listing优化建议": "① 抓取竞品ASIN的标题、关键词、图片、Bullet Points、描述\n② 分析竞品标题结构（核心词+属性词+流量词组合方式）\n③ 检测本品Listing缺失的搜索热词（参考竞品高排名词）\n④ 对比图片质量（主图白底/场景图/信息图）\n⑤ 分析竞品A+内容布局和差评中的产品痛点\n⑥ 生成优化建议报告：优先级（高/中/低）+ 具体修改内容\n⑦ 输出可直接使用的优化文案",
    
    "Coupon效果分析": "① 导出Coupon使用数据（发放量、点击量、使用量、转化率）\n② 对比使用Coupon前后的订单量和销售额变化\n③ 按Coupon折扣力度分组（5%/10%/15%/20%）分析效果差异\n④ 计算各Coupon的ROI = (带来销售额 - Coupon让利) / Coupon成本\n⑤ 识别效果最好的Coupon类型（高转化+低让利）\n⑥ 生成效果分析报告，推荐下次Coupon策略\n⑦ 自动生成Coupon使用总结推送财务",
    
    "品牌商标监控": "① 设置品牌关键词监控列表（自有商标词+防御性商标）\n② 定期抓取亚马逊/各平台搜索结果\n③ 检测是否存在未经授权使用品牌词的商品\n④ 识别疑似侵权Listing：标题/描述/图片中的品牌元素\n⑤ 自动生成侵权举报材料（含截图+证据链）\n⑥ 提交平台举报或通过法律途径维权\n⑦ 记录维权进度和结果",
    
    "店铺健康监控": "① 实时抓取店铺健康度指标：订单缺陷率(ODR)、迟发率、有效追踪率\n② 对比平台要求阈值：ODR<1%、迟发率<4%、有效追踪率>95%\n③ 识别即将触发警告的指标（如ODR接近0.8%）\n④ 分析问题根源：差评/退货/未有效追踪的订单\n⑤ 生成健康度预警报告，推送运营\n⑥ 提供具体改善建议（如差评回访、选择更可靠物流）\n⑦ 每日监控直至指标恢复正常",
    
    "BSR排名监控": "① 选择目标小类目BSR榜单，设定监控ASIN列表\n② 每日固定时间抓取各ASIN的BSR排名\n③ 计算排名变化：今日排名 - 昨日排名\n④ 识别排名持续上升（竞品发力）或持续下滑（流量流失）的ASIN\n⑤ 结合广告数据，分析排名变化原因（广告位/自然位）\n⑥ 生成竞争态势报告，推送运营\n⑦ 重点关注TOP100→TOP50→TOP20的跃升信号",
    
    "Q&A自动采集": "① 输入目标ASIN列表，进入「Q&A」页面\n② 抓取所有Q&A内容，提取问题、答案、提问时间、投票数\n③ 分析高频问题（同一问题出现3次以上=痛点）\n④ 识别竞品差评中的共性问题，对应Q&A缺失\n⑤ 归类问题类型：功能咨询/物流/使用/对比\n⑥ 生成Q&A分析报告，供优化Listing参考\n⑦ 高频问题优先安排回答，提升页面活跃度",
    
    "广告关键词优化": "① 导出广告报告（含关键词/ACOS/花费/订单/点击/排名）\n② 识别高ACOS关键词（ACOS > 品类均值1.5倍）→ 建议降价或暂停\n③ 识别高花费低转化词（花费>100但转化=0）→ 立即暂停\n④ 识别低ACOS高ROAS词 → 建议提高出价抢更多流量\n⑤ 分析搜索词报告，挖掘长尾转化词加入自动广告\n⑥ 生成关键词优化建议表\n⑦ 自动执行低风险操作（降价/暂停），高风险操作需人工确认",
    
    "退货原因分析": "① 导出退货报告（订单号/SKU/退货原因/退货时间）\n② 分类汇总退货原因：质量/物流/描述不符/错发/无理由\n③ 计算各原因占比，识别TOP3退货原因\n④ 关联SKU分析：哪些SKU退货率高？\n⑤ 关联差评内容，验证退货原因一致性\n⑥ 生成改进建议：产品端/包装端/描述端的具体措施\n⑦ 每月对比退货率趋势，评估改进效果",
    
    "多店铺利润汇总": "① 连接各平台财务数据（或导出报表）\n② 汇总：销售收入 - 平台佣金 - FBA费用 - 广告费 - 退款 = 毛利润\n③ 按SKU计算净利润（含商品成本、头程、仓储、退货）\n④ 按店铺分组，识别盈利最高/最低店铺\n⑤ 生成利润汇总表（多维透视：平台×SKU×月份）\n⑥ 对比预算，标注差异超过±10%的项目\n⑦ 推送财务汇总邮件",
    
    "SKU库存周转分析": "① 导出各SKU库存数据和销售数据（近90天）\n② 计算周转天数 = 当前库存 / 日均销量\n③ 周转天数 < 安全库存天数 → 补货预警\n④ 周转天数 > 滞销阈值（如90天） → 滞销预警\n⑤ 按SKU分组计算平均周转天数\n⑥ 生成库存优化建议：加速周转/促销清滞/减少采购\n⑦ 推送采购和运营",
    
    "商品详情批量采集": "① 输入目标ASIN列表，批量打开竞品详情页\n② 抓取字段：标题、价格、评分、评价数、BSR排名、FBA标识\n③ 提取Bullet Points前5条、产品描述核心内容\n④ 计算竞品数量（搜索结果数）和广告竞价区间\n⑤ 生成竞品分析表，按评分/BSR/价格排序\n⑥ 标注本品差异化机会（价格/评分/功能对比）\n⑦ 推送运营团队参考",
    
    # ============== Temu 场景 ==============
    "Temu商品批量上传": "① 读取商品主表（含图片链接、属性、SKU、价格）\n② 批量下载商品图片，压缩至Temu要求大小（≤2MB/张）\n③ 填写Temu特有属性：商品类目、认证信息、质检报告编号\n④ 根据Temu定价规则自动计算含佣金价格\n⑤ 生成Temu格式上传模板\n⑥ 批量上传商品，监控处理状态\n⑦ 记录上传失败SKU及原因，推送运营处理",
    
    "Temu价格策略调整": "① 抓取同类商品在Temu的当前售价\n② 计算本品在Temu的成本结构（平台佣金约8-15%）\n③ 设定价格区间：最低价（保本）~ 最优价（目标利润率）\n④ 根据竞品价格动态调整，保持价格竞争力\n⑤ 价格调整后自动监控销量变化\n⑥ 生成调价日志，含调价前后价格和销量对比\n⑦ 避免频繁调价：设置调价间隔≥24小时",
    
    "Temu订单自动处理": "① 实时监控Temu订单入口（新订单提醒）\n② 自动将订单推送至仓库管理系统（WMS）\n③ 生成发货指令：SKU/数量/收件信息\n④ 打印Temu平台面单和拣货单\n⑤ 发货后自动回传追踪号到Temu\n⑥ 更新订单状态为「已发货」\n⑦ 未发货超时前2小时自动预警",
    
    "Temu库存预警": "① 读取Temu后台库存数据和历史日均销量\n② 计算安全库存 = 日均销量 × 备货周期 + 平台要求的最低库存\n③ 识别低于安全库存的SKU\n④ 自动生成补货建议表（含建议采购量）\n⑤ 推送补货通知给采购部门\n⑥ 补货到货后自动更新Temu库存\n⑦ 库存断货超过3天自动下架商品",
    
    # ============== 供应链场景 ==============
    "采购订单自动生成": "① 分析历史销售数据，预测未来7-30天销量\n② 计算安全库存：日均销量 × 备货周期 + 最低库存阈值\n③ 生成补货建议：补货量 = 安全库存 - 当前可用库存\n④ 按供应商分组，生成采购申请单\n⑤ 推送采购审批（金额>阈值需主管审批）\n⑥ 审批通过后自动发送给供应商\n⑦ 跟踪到货时间，更新库存",
    
    "供应商报价对比": "① 向多个供应商发送询价请求（含SKU/数量/交期）\n② 收集各供应商报价单（价格/交期/付款条件）\n③ 按SKU对比各供应商单价，计算价差\n④ 综合评分：价格(40%)+交期(30%)+质量(20%)+服务(10%)\n⑤ 生成供应商比价表，推荐最优方案\n⑥ 标注价格异常（高于市场均值20%）的供应商\n⑦ 存档历史比价数据，供审计用",
    
    "物流费用计算": "① 读取订单数据（重量/体积/目的地）\n② 查询各物流承运商报价表（含首重/续重费）\n③ 按重量计算各承运商运费：首重 + 续重×超出重量\n④ 对比各承运商价格，选择最优方案（考虑时效和价格平衡）\n⑤ 生成物流费用对比表\n⑥ 记录各订单物流费用到财务系统\n⑦ 汇总月物流成本，推送财务",
    
    "仓库数据核对": "① 从WMS导出实际库存数据\n② 从各电商平台后台导出账面库存数据\n③ 按SKU匹配，识别差异：WMS有但平台无 / 平台有但WMS无\n④ 分析差异原因：未入库/已出库未更新/系统延迟\n⑤ 生成盘点差异表，标注异常SKU\n⑥ 推送仓库和运营确认\n⑦ 差异确认后调整系统数据",
    
    "到货确认自动处理": "① 收到供应商发货通知（物流单号）\n② 实时跟踪物流轨迹，识别「到达目的仓库」状态\n③ 仓库扫码入库，自动更新WMS库存\n④ 比对实际到货数量与采购单数量\n⑤ 差异超过5%自动触发差异报告\n⑥ 到货确认后自动通知采购和财务\n⑦ 生成入库单推送财务做账",
    
    "supply供应链": "① 监控供应商交期，识别延迟风险\n② 提前30天检查各SKU在途库存和预期销量\n③ 供应商交期延迟时自动触发备选方案（其他供应商/空运）\n④ 计算延迟对销售的影响（断货天数×日均损失）\n⑤ 推送预警给采购和运营\n⑥ 延迟恢复后更新交期计划\n⑦ 记录延迟原因，归档供供应商评估用",
    
    # ============== 财务场景 ==============
    "多平台收款核对": "① 登录各平台卖家后台，导出收款流水\n② 连接银行账户，下载收款明细\n③ 按平台汇总收款金额（含平台币种）\n④ 使用实时汇率换算为统一本位币（人民币/美元）\n⑤ 比对平台收款总额与银行到账金额\n⑥ 识别差异：平台手续费/退款/未到账\n⑦ 生成收款核对表，差异项推送财务核查",
    
    "汇率自动获取": "① 接入银行或第三方汇率API（如XE.COM、Open Exchange Rates）\n② 每日固定时间获取主要结算货币汇率（USD/CNY/EUR等）\n③ 记录历史汇率，生成汇率走势图\n④ 汇率波动超过±2%时触发预警\n⑤ 计算汇率波动对利润的影响（美元贬值→人民币利润缩水）\n⑥ 生成汇率风险报告推送给财务\n⑦ 建议锁定远期结汇的时机",
    
    "广告费用计算": "① 导出各平台广告报表（花费/订单/点击/ACOS）\n② 汇总所有平台广告花费\n③ 按SKU分摊广告费用（按广告订单占比）\n④ 计算各SKU广告ROI = 广告带来利润 / 广告花费\n⑤ 对比广告花费前10名SKU，识别高花费低产出\n⑥ 生成广告费用分析表（透视：平台×SKU×时间）\n⑦ 推送财务和运营",
    
    "利润报表自动生成": "① 汇总各平台销售收入（订单金额-退款）\n② 扣除：平台佣金+FBA费用+广告费+仓储费+退款\n③ 扣除商品成本（采购成本+头程运费+包装）\n④ 计算各SKU/平台净利润和净利润率\n⑤ 生成多维度利润表（按平台/按SKU/按月份）\n⑥ 对比目标利润率，标注差异超过±15%的项目\n⑦ 自动发送月报给管理层",
    
    "税务申报数据准备": "① 汇总各平台全年销售收入（含退款）\n② 收集各国VAT/GST申报要求的数据字段\n③ 按国家/地区分类整理销售额、退税额、税额\n④ 生成符合各国税务局格式的申报数据\n⑤ 检查是否达到申报门槛（德国/年销10万欧元起征）\n⑥ 标注需补缴税款的SKU\n⑦ 生成税务申报数据包推送会计事务所",
    
    "发票开具批量处理": "① 从订单系统导出需开票客户信息\n② 合并同一客户的多次小额订单（满足开票金额）\n③ 生成符合税局格式的发票数据\n④ 调用开票软件API批量开具发票\n⑤ 打印发票并随货发出（或电子发票发送邮件）\n⑥ 记录发票号码和开票金额\n⑦ 月末汇总发票数据做税务抵扣",
    
    # ============== 客服场景 ==============
    "工单自动分配": "① 接收客户工单（邮件/平台/表单）\n② 提取工单类型（咨询/投诉/退款/技术问题）和语言\n③ 按规则自动分配：中文→客服A，英语→客服B，技术问题→技术组\n④ 优先级判定：高价值客户/差评→高优先级\n⑤ 发送分配通知给对应客服\n⑥ 记录分配日志，监控响应时效\n⑦ 超时未响应自动升级",
    
    "退货退款进度追踪": "① 监控各平台退货请求入口\n② 自动创建退货工单，记录退货原因和商品信息\n③ 跟踪退货物流：买家发出→平台签收→仓库质检\n④ 质检完成后自动处理退款/拒退\n⑤ 退款成功/失败自动发送通知给买家\n⑥ 生成退货分析报告：TOP退货原因\n⑦ 频繁退货客户自动标记",
    
    "客户满意度调查": "① 订单完成后自动发送满意度调查邮件/短信\n② 收集评分（1-5星）和文字反馈\n③ 自动统计NPS评分和满意度趋势\n④ 识别1-2星差评，自动触发客户关怀流程\n⑤ 生成满意度月报，推送客服主管\n⑥ 分析差评共性问题，协调运营/产品改进\n⑦ 优秀客服好评率排名",
    
    "多语言翻译": "① 接收客户消息（英语/日语/俄语/西班牙语等）\n② 自动检测语言类型\n③ 调用翻译API转换为中文（客服处理时）\n④ 或将中文回复翻译为目标语言\n⑤ 翻译后需客服审核关键信息（防止误解）\n⑥ 翻译记录存档\n⑦ 多语言FAQ自动回复（低风险问题）",
    
    "VIP客户标记管理": "① 分析客户历史消费数据（订单数/金额/复购率）\n② 按消费金额划分VIP等级（金/银/普通）\n③ 消费满额自动升级VIP等级\n④ VIP客户工单自动标记优先级\n⑤ VIP客户生日/重要节日自动触发关怀\n⑥ 生成VIP客户分析报告\n⑦ VIP客户专属优惠自动应用",
    
    # ============== 人事场景 ==============
    "招聘简报自动生成": "① 从各招聘渠道（BOSS直聘/智联/猎聘）导出简历数据\n② 统计各岗位投递量、面试通过率、入职率\n③ 计算各渠道转化漏斗：投递→初筛→面试→入职\n④ 识别高转化渠道和低转化渠道\n⑤ 生成招聘漏斗报告，按岗位分组\n⑥ 推荐优化招聘渠道配置\n⑦ 推送HR和部门负责人",
    
    "入转离流程自动化": "① 新员工入职：自动发送入职offer确认、准备工位和设备\n② 开通企业邮箱/钉钉/门禁账号\n③ 自动加入相关企业微信群和培训群\n④ 离职：回收邮箱权限、移除群聊、收回设备\n⑤ 推送离职交接清单给直属上级\n⑥ 更新HR系统状态\n⑦ 离职面谈记录存档",
    
    "员工考勤数据统计": "① 从钉钉/企业微信导出考勤打卡数据\n② 统计正常出勤、迟到、早退、请假、旷工天数\n③ 按部门汇总考勤异常情况\n④ 关联加班申请单，计算实际加班时长\n⑤ 生成考勤月报表，推送HR和部门负责人\n⑥ 异常考勤（如连续旷工）自动预警\n⑦ 考勤数据作为绩效评估依据之一",
    
    "KPI绩效数据收集": "① 收集各系统KPI数据（CRM/销售/客服/运营）\n② 按岗位KPI模板计算各项指标得分\n③ 计算综合绩效分数（加权平均）\n④ 对比目标值，标注未达标项\n⑤ 生成个人/团队绩效报告\n⑥ 推送绩效面谈准备材料\n⑦ 汇总绩效分布（正态分布/两极分化）",
    
    # ============== 管理场景 ==============
    "团队周报自动汇总": "① 向团队成员发送周报收集提醒\n② 汇总各成员提交的周报内容\n③ 提取关键数据：完成事项/下周计划/遇到的问题\n④ 按项目/部门分类整理\n⑤ 生成团队周报汇总文档\n⑥ 推送管理层\n⑦ 跟进未按时提交周报的成员",
    
    "OKR进度追踪": "① 收集各成员OKR填写/更新数据\n② 计算各O的完成进度（KR完成率加权）\n③ 对比时间节点，检查是否按计划推进\n④ 识别滞后OKR，触发延迟预警\n⑤ 生成OKR进度报告\n⑥ 推送管理层和OKR教练\n⑦ 准备OKR复盘会议议程",
    
    "会议纪要自动整理": "① 上传会议录音或文字记录\n② 语音转文字（如用飞书妙记）\n③ 提取关键议题、决策、待办事项和负责人\n④ 归类整理为结构化会议纪要\n⑤ 发送纪要给所有参会人确认\n⑥ 待办事项自动同步到任务管理系统\n⑦ 追踪待办完成情况",
    
    "项目里程碑追踪": "① 录入项目计划：各阶段里程碑和截止日期\n② 每日检查里程碑完成状态\n③ 识别即将到期（<7天）但未完成的项目\n④ 延迟超过3天自动升级通知项目经理\n⑤ 生成项目健康度报告\n⑥ 汇总各项目进度，推送管理层\n⑦ 项目结束自动归档项目文档",
    
    "竞争对手动态收集": "① 订阅竞品官网更新、社交媒体、新闻稿\n② 抓取竞品新品上架、价格变动、促销活动\n③ 分析竞品营销策略变化\n④ 生成竞争对手动态报告\n⑤ 标注对本公司有影响的变化\n⑥ 推送战略规划团队\n⑦ 建立竞品数据库长期跟踪",
    
    # ============== 合规场景 ==============
    "产品合规检查": "① 收集各国产品合规要求（CE/FCC/RoHS/REACH等）\n② 读取产品BOM表，检测是否含有害物质\n③ 检查产品认证证书有效期\n④ 标签合规性：产品标签/包装/说明书语言要求\n⑤ 生成合规检查清单\n⑥ 不合规项标注并建议整改方案\n⑦ 合规认证到期前自动续期提醒",
    
    "知识产权商标检测": "① 抓取Listing标题/描述/图片中的品牌词\n② 对比已注册商标数据库（自有+竞品）\n③ 检测疑似侵权词：未授权使用他人商标\n④ 生成侵权风险报告：高中低风险\n⑤ 高风险项立即下架处理\n⑥ 定期检测防止新Listing侵权\n⑦ 存档商标使用授权文件",
    
    "VAT税务合规": "① 读取各平台销售数据，按国家统计VAT申报销售额\n② 检查各国VAT注册状态和申报截止日期\n③ 确认税率适用是否正确（英国20%/德国19%/法国20%）\n④ 生成VAT申报数据表\n⑤ 标注需缴纳税额\n⑥ 推送会计事务所处理申报\n⑦ 逾期申报自动预警",
    
    "EPR合规检测": "① 识别需注册EPR的产品类别（包装/电子设备/玩具等）\n② 汇总各平台EPR类产品销量\n③ 检查EPR注册号有效性\n④ 确认年度申报数据是否提交\n⑤ 生成EPR合规状态报告\n⑥ 即将到期自动续期提醒\n⑦ 合规证书存档",
    
    "平台政策变更监控": "① 订阅各平台官方政策更新通知\n② 抓取最新政策变更内容\n③ 对比旧版政策，标注新增/修改/删除内容\n④ 评估政策变化对业务的影响程度\n⑤ 生成政策变更摘要，推送相关团队\n⑥ 制定应对策略\n⑦ 存档历史政策版本",
    
    # ============== 技术场景 ==============
    "系统运行状态监控": "① 部署监控脚本，定时检查各系统可用性\n② 检测：网站响应时间/API成功率/数据库连接/磁盘使用率\n③ 异常阈值：响应>3秒、API成功率<99%、磁盘>80%\n④ 发现异常立即发送告警（短信/邮件/钉钉）\n⑤ 记录告警日志和处理结果\n⑥ 生成系统可用性日报\n⑦ 定期优化告警规则减少误报",
    
    "数据库备份验证": "① 定时执行数据库备份任务\n② 备份完成后自动验证备份文件完整性\n③ 检查备份大小是否合理（过小可能失败）\n④ 测试从备份恢复（可选：定期演练）\n⑤ 备份成功/失败发送通知\n⑥ 记录备份日志和存储位置\n⑦ 超过保留期自动清理旧备份",
    
    "API接口监控": "① 定时调用各API接口，测量响应时间和返回码\n② 记录API成功率：200=成功，4xx/5xx=失败\n③ 异常：响应>5秒或成功率<99%触发告警\n④ 记录API调用日志供调试\n⑤ 生成API可用性报告\n⑥ 接口限流时自动降级非核心功能\n⑦ 分析API慢查询原因并优化",
    
    "网站可用性监控": "① 定时访问网站首页，检测HTTP状态码\n② 检测SSL证书到期时间（提前30天预警）\n③ 测量页面加载时间和核心指标（LCP/FID）\n④ 异常时立即发送告警\n⑤ 生成网站可用性日报/周报\n⑥ 分析故障根因\n⑦ 故障恢复后发送通知",
    
    "安全漏洞扫描": "① 定期运行漏洞扫描工具（OWASP ZAP/Nessus）\n② 检测：SQL注入/XSS/CSRF/敏感信息泄露\n③ 生成漏洞报告，按严重程度分级（高/中/低）\n④ 高危漏洞立即修复\n⑤ 中危漏洞排期修复\n⑥ 修复后重新扫描验证\n⑦ 存档漏洞报告",
    
    "SSL证书到期提醒": "① 读取各域名SSL证书信息（含到期日期）\n② 设置提前30天/7天/1天三级提醒\n③ 到期前自动提醒运维\n④ 自动续期或提醒联系CA机构\n⑤ 证书过期自动告警\n⑥ 记录证书更换历史\n⑦ 生成证书管理台账",
    
    "系统权限定期审计": "① 导出各系统用户权限列表\n② 检查离职员工账号是否已禁用\n③ 检查权限过大账号（如admin权限过多）\n④ 权限合规性检查：是否遵循最小权限原则\n⑤ 生成权限审计报告\n⑥ 异常权限立即回收\n⑦ 存档审计记录",
    
    "代码部署自动化": "① 接收Git代码提交触发\n② 自动构建：npm install → 编译 → 打包\n③ 运行单元测试和集成测试\n④ 测试通过后部署到测试环境\n⑤ 自动执行冒烟测试\n⑥ 测试环境验证通过后，通知审批\n⑦ 审批通过后部署到生产环境",
    
    "日志异常监控": "① 收集各系统日志（应用日志/访问日志/错误日志）\n② 设置异常关键词监控（如ERROR/FATAL/Exception）\n③ 检测异常模式：同错误重复出现N次/错误突增\n④ 发现异常立即告警\n⑤ 生成日志分析报告\n⑥ 分析错误根因\n⑦ 修复后持续监控",
    
    "域名/商标到期提醒": "① 读取域名注册信息和商标注册证到期日\n② 设置提前60天/30天/7天提醒\n③ 到期前自动通知负责人\n④ 提前准备续期材料\n⑤ 过期前自动提醒续费\n⑥ 过期后立即处理（域名被抢注风险）\n⑦ 存档域名和商标证书",
    
    # ============== 通用场景 ==============
    "多平台收款核对": "① 登录各平台卖家后台，导出收款流水\n② 连接银行账户，下载收款明细\n③ 按平台汇总收款金额（含平台币种）\n④ 使用实时汇率换算为统一本位币\n⑤ 比对平台收款总额与银行到账金额\n⑥ 识别差异：平台手续费/退款/未到账\n⑦ 生成收款核对表，差异项推送财务核查",
    
    "多平台店铺利润汇总": "① 连接各平台财务API（或导出报表）\n② 汇总：销售收入-平台佣金-配送费-广告费-退款\n③ 扣除商品成本（采购+头程+包装）\n④ 计算各平台净利润和净利润率\n⑤ 生成多平台利润汇总表（透视：平台×SKU×月）\n⑥ 对比目标利润率，标注异常\n⑦ 推送财务汇总邮件",
    
    "汇率自动获取与核算": "① 接入汇率API（XE/Open Exchange Rates）\n② 每日获取主要结算货币实时汇率\n③ 记录历史汇率曲线\n④ 汇率波动超过±2%触发告警\n⑤ 计算汇率风险敞口（未结汇金额）\n⑥ 生成汇率风险报告\n⑦ 建议锁定远期结汇时机",
    
    "批量发送站内站外邮件": "① 读取客户列表（按标签/行为/生命周期阶段筛选）\n② 匹配邮件模板（新品通知/促销活动/关怀邮件）\n③ 个性化变量替换（姓名/购买产品/专属优惠码）\n④ 批量发送邮件（或按队列分批发送防限流）\n⑤ 跟踪送达/打开/点击数据\n⑥ 生成邮件营销效果报告\n⑦ 打开率<10%自动优化邮件内容",
    
    "财务对账自动核对": "① 从各平台导出应收账款数据\n② 从银行导出实际到账数据\n③ 按时间+金额匹配对账\n④ 识别未到账款（平台已扣但银行未到）\n⑤ 识别差异账：金额不符/时间差异\n⑥ 生成对账差异表\n⑦ 推送财务跟进处理",
    
    "客服消息集中处理": "① 接入各平台客服消息入口\n② 统一汇总到客服工作台\n③ 自动分类：咨询/投诉/退款/技术\n④ 匹配FAQ知识库，自动回复标准问题\n⑤ 复杂问题转人工，附带历史记录\n⑥ 生成客服响应时效报告\n⑦ 重复投诉自动升级",
    
    "物流状态自动追踪": "① 读取已发货订单的物流单号\n② 调用物流API实时查询状态\n③ 识别异常状态：物流滞留/拒收/退回\n④ 异常时自动发送客户安抚邮件\n⑤ 生成物流异常日报\n⑥ 频繁异常物流商标记\n⑦ 物流商KPI定期评估",
    
    "竞品数据集中采集": "① 输入竞品ASIN列表\n② 逐个平台抓取：价格/评分/评价数/BSR/FBA标识\n③ 汇总各平台数据到同一表格\n④ 计算本品与竞品的价格差/评分差\n⑤ 生成竞品对比分析报告\n⑥ 标注差异化机会\n⑦ 定期更新竞品数据",
    
    "员工考勤数据统计": "① 从钉钉/企业微信导出月度考勤数据\n② 统计出勤/迟到/请假/旷工天数\n③ 按部门汇总异常考勤情况\n④ 关联加班申请，统计实际加班时长\n⑤ 生成考勤月报表\n⑥ 异常（如连续旷工）自动预警HR\n⑦ 考勤数据归档用于绩效考核",
    
    "提成自动计算": "① 读取销售数据（含订单/销售额/客户归属）\n② 按销售提成规则计算（底薪+提成比例）\n③ 不同产品线/客户类型适用不同提成比例\n④ 计算个人所得税（如适用）\n⑤ 生成工资条数据表\n⑥ 推送HR审核\n⑦ 存档提成计算记录",
    
    "团队周报自动汇总": "① 向团队成员发送周报填写提醒\n② 汇总各成员周报内容\n③ 提取关键指标：完成事项/进行中/下周计划\n④ 按项目/部门分类整理\n⑤ 生成汇总周报文档\n⑥ 推送管理层\n⑦ 跟进未按时提交人员",
    
    "广告投放效果分析": "① 导出各平台广告数据（花费/订单/ACOS/展示/点击）\n② 按广告活动/关键词汇总\n③ 计算关键指标：ACOS/ROAS/CPC/CTR/转化率\n④ 对比不同广告类型效果（SP/SB/SD）\n⑤ 识别高ACOS词→降价/暂停，低ACOS词→加投\n⑥ 生成广告优化建议表\n⑦ 推送运营参考",
    
    "库存周转分析": "① 读取各SKU库存数据和90天销售数据\n② 计算周转天数 = 当前库存 / 日均销量\n③ 周转天数<30天 → 补货预警；>90天 → 滞销预警\n④ 按SKU分组计算平均周转\n⑤ 生成滞销品清单（建议促销/清仓）\n⑥ 推送采购和运营\n⑦ 滞销品处理后重新评估",
    
    "采购建议自动生成": "① 分析各SKU历史销量和季节性趋势\n② 计算安全库存 = 日均销量 × 备货周期\n③ 建议补货量 = 安全库存 - (当前库存 + 在途库存)\n④ 按供应商分组生成采购申请\n⑤ 推送采购审批（金额>阈值需主管）\n⑥ 审批通过后自动发送给供应商\n⑦ 跟踪交期，到货后更新库存",
    
    "客户问题FAQ自动回复": "① 接收客户问题\n② 匹配知识库FAQ规则（关键词/意图识别）\n③ 自动生成回复内容（模板+个性化变量）\n④ 高置信度回复（>80%）自动发送\n⑤ 低置信度转人工，并附上推荐回复供参考\n⑥ 记录处理结果优化知识库\n⑦ 生成FAQ覆盖率和解决率报告",
    
    "平台资质合规监控": "① 读取各平台店铺资质证书（营业执照/品牌授权/产品认证）\n② 检查有效期（提前60天预警）\n③ 检查是否满足平台最新准入要求\n④ 资质即将到期自动提醒更新\n⑤ 资质缺失项标注并建议补充方案\n⑥ 更新后自动同步到各平台\n⑦ 资质管理台账存档",
    
    "竞争对手活动预警": "① 监控竞品价格变动、促销活动、新品上架\n② 识别：降价超过10%/大促开始/新品进入TOP100\n③ 评估对本公司产品的影响程度\n④ 生成竞品动态预警报告\n⑤ 推送运营和定价团队\n⑥ 制定应对策略（如跟价/差异化）\n⑦ 存档竞品动态记录",
    
    "员工入转离全流程": "① 入职：自动发送offer、开通邮箱/系统账号、加入群组\n② 转岗：更新部门归属和系统权限\n③ 离职：禁用账号、回收权限、移除群组\n④ 推送离职交接清单给直属上级\n⑤ 更新HR系统状态\n⑥ 生成离职面谈记录模板\n⑦ 存档员工全生命周期数据",
    
    "项目延期预警": "① 录入项目计划：各阶段里程碑截止日期\n② 每日检查里程碑完成状态\n③ 识别<7天到期但未完成的项目\n④ 延迟>3天自动升级通知\n⑤ 生成项目健康度报告\n⑥ 推送项目经理和管理层\n⑦ 项目结束后自动归档",
    
    "数据备份验证": "① 定时执行备份任务（数据库/文件）\n② 备份后自动验证文件完整性\n③ 检查备份大小是否正常\n④ 测试从备份恢复（定期演练）\n⑤ 备份成功/失败发送通知\n⑥ 记录备份日志\n⑦ 超过保留期自动清理旧备份",
    
    "API性能监控": "① 定时调用各API接口，测量响应时间\n② 记录成功/失败次数\n③ 异常：响应>5秒或成功率<99%触发告警\n④ 生成API可用性报告\n⑤ 分析慢接口原因\n⑥ 限流时自动降级非核心功能\n⑦ 记录日志供调试",
    
    "SSL证书到期提醒": "① 读取各域名SSL证书到期日\n② 设置提前30天/7天/1天三级提醒\n③ 到期前自动通知运维\n④ 自动续期或提醒联系CA机构\n⑤ 过期告警\n⑥ 记录更换历史\n⑦ 生成证书管理台账",
    
    "系统权限定期审计": "① 导出各系统用户权限列表\n② 检查离职员工账号状态\n③ 检查权限过大账号（admin权限过多）\n④ 合规性检查：最小权限原则\n⑤ 生成权限审计报告\n⑥ 异常权限立即回收\n⑦ 存档审计记录",
    
    "代码部署自动化流程": "① 接收Git提交触发\n② 自动构建（npm install/build）\n③ 运行测试\n④ 测试通过部署测试环境\n⑤ 冒烟测试\n⑥ 审批后部署生产\n⑦ 发送部署结果通知",
    
    "日志异常自动监控": "① 收集各系统日志\n② 设置异常关键词（ERROR/FATAL/Exception）\n③ 检测异常模式（同错误重复N次/突增）\n④ 发现异常告警\n⑤ 生成日志分析报告\n⑥ 分析根因\n⑦ 修复后持续监控",
    
    "域名到期管理": "① 读取域名到期列表\n② 设置提前60/30/7天提醒\n③ 到期前通知负责人\n④ 准备续期材料\n⑤ 过期前提醒续费\n⑥ 过期后立即处理（防抢注）\n⑦ 存档域名证书",
    
    "多币种对账单": "① 汇总多平台多币种收入\n② 获取实时汇率\n③ 换算为本位币（CNY）\n④ 计算各平台实际人民币收入\n⑤ 考虑汇兑损失/收益\n⑥ 生成多币种汇总表\n⑦ 推送财务对账",
    
    "广告预算自动调整": "① 分析各广告Campaign效果数据\n② ACOS低于目标值→建议增加预算（+20%）\n③ ACOS高于目标值→建议降低预算（-20%）\n④ 高转化词→自动提高出价\n⑤ 低效广告→自动暂停或降低出价\n⑥ 调整后监控3天效果\n⑦ 生成调整记录报告",
    
    "客户分层管理": "① 按消费金额划分客户层级（RFM模型）\n② 高价值客户（VIP）→专属优惠+优先客服\n③ 中价值客户→定期关怀\n④ 低价值/流失风险客户→唤醒促销\n⑤ 各层级自动打标\n⑥ 生成客户分层报告\n⑦ 针对性营销策略推送",
    
    "年度经营复盘": "① 汇总全年各平台销售数据\n② 分析各品类/平台/客户贡献\n③ 识别TOP10产品和滞销品\n④ 计算全年净利润和ROI\n⑤ 对比年度目标，标注达成率\n⑥ 生成多维复盘报告（含图表）\n⑦ 推送管理层制定下年策略",
    
    "新品上架准备清单": "① 输入新品信息（SKU/品类/平台）\n② 自动生成上架前检查清单：图片/认证/定价/库存\n③ 各环节完成状态追踪\n④ 未完成项预警\n⑤ 上架前最终确认\n⑥ 批量上传到各平台\n⑦ 上架后自动监控listing状态",
}

# Expanded SOP templates by keyword matching
def get_expanded_sop(scenario):
    name = scenario['name']
    platform = scenario['platform']
    dept = scenario['dept']
    original_sop = scenario['sop']
    
    # Direct match by name
    if name in SOP_TEMPLATES:
        return SOP_TEMPLATES[name]
    
    # Keyword matching
    name_lower = name.lower()
    
    # Platform-specific patterns
    if platform == '亚马逊':
        if '商品详情' in name or '竞品' in name:
            return SOP_TEMPLATES["商品详情批量采集"]
        if '关键词' in name:
            return SOP_TEMPLATES["关键词排名监控"]
        if 'FBA' in name and '库存' in name:
            return SOP_TEMPLATES["FBA库存预警"]
        if '评价' in name:
            return SOP_TEMPLATES["评价监控"]
        if '广告' in name:
            return SOP_TEMPLATES["广告数据日报"]
        if '订单' in name and '汇总' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '利润' in name:
            return SOP_TEMPLATES["多店铺利润汇总"]
        if '库存' in name and '同步' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '库存' in name and '周转' in name:
            return SOP_TEMPLATES["SKU库存周转分析"]
        if '商品' in name and '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if 'listing' in name_lower or '优化' in name:
            return SOP_TEMPLATES["listing优化建议"]
        if 'BSR' in name or '排名' in name:
            return SOP_TEMPLATES["BSR排名监控"]
        if 'Q&A' in name or '问答' in name:
            return SOP_TEMPLATES["Q&A自动采集"]
        if '退货' in name:
            return SOP_TEMPLATES["退货原因分析"]
        if '品牌' in name:
            return SOP_TEMPLATES["品牌商标监控"]
        if '店铺' in name and '健康' in name:
            return SOP_TEMPLATES["店铺健康监控"]
        if 'FBA' in name and '费用' in name:
            return SOP_TEMPLATES["FBA费用计算"]
    
    elif platform == 'Temu':
        if '上传' in name or '上传' in original_sop:
            return SOP_TEMPLATES["Temu商品批量上传"]
        if '价格' in name:
            return SOP_TEMPLATES["Temu价格策略调整"]
        if '订单' in name:
            return SOP_TEMPLATES["Temu订单自动处理"]
        if '库存' in name:
            return SOP_TEMPLATES["Temu库存预警"]
        if '商品详情' in name:
            return SOP_TEMPLATES["商品详情批量采集"]
    
    elif platform == 'Shein':
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
    
    elif '沃尔玛' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
    
    elif 'TikTok' in platform:
        if '达人' in name:
            return SOP_TEMPLATES["竞品数据集中采集"]
        if '直播' in name:
            return SOP_TEMPLATES["广告投放效果分析"]
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '商品详情' in name:
            return SOP_TEMPLATES["商品详情批量采集"]
    
    elif 'eBay' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '评价' in name:
            return SOP_TEMPLATES["评价监控"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if '议价' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if '物流' in name and '比价' in name:
            return SOP_TEMPLATES["物流费用计算"]
        if '退货' in name:
            return SOP_TEMPLATES["退货原因分析"]
    
    elif '速卖通' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '物流' in name:
            return SOP_TEMPLATES["物流状态自动追踪"]
        if '评价' in name:
            return SOP_TEMPLATES["评价监控"]
        if '铺货' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '直通车' in name:
            return SOP_TEMPLATES["广告投放效果分析"]
    
    elif 'Shopee' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if '评价' in name:
            return SOP_TEMPLATES["评价监控"]
        if '多站点' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if 'Flash' in name or '限时' in name:
            return SOP_TEMPLATES["广告预算自动调整"]
        if '聊天' in name:
            return SOP_TEMPLATES["客服消息集中处理"]
        if '直播' in name:
            return SOP_TEMPLATES["广告投放效果分析"]
        if '物流' in name:
            return SOP_TEMPLATES["物流状态自动追踪"]
    
    elif 'Lazada' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '促销' in name:
            return SOP_TEMPLATES["广告预算自动调整"]
        if '物流' in name:
            return SOP_TEMPLATES["物流状态自动追踪"]
        if '直播' in name:
            return SOP_TEMPLATES["广告投放效果分析"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
    
    elif '美客多' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '多语言' in name or '客服' in name:
            return SOP_TEMPLATES["多语言翻译"]
        if '市场' in name:
            return SOP_TEMPLATES["竞品数据集中采集"]
    
    elif 'Allegro' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if '市场' in name:
            return SOP_TEMPLATES["竞品数据集中采集"]
        if '促销' in name:
            return SOP_TEMPLATES["广告预算自动调整"]
        if 'VAT' in name:
            return SOP_TEMPLATES["VAT税务合规"]
    
    elif 'OZON' in platform:
        if '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["多平台库存实时同步"]
        if '市场' in name:
            return SOP_TEMPLATES["竞品数据集中采集"]
        if '俄语' in name or '客服' in name:
            return SOP_TEMPLATES["多语言翻译"]
        if 'VAT' in name or '税务' in name or '税' in name:
            return SOP_TEMPLATES["VAT税务合规"]
        if 'FBO' in name or '入仓' in name:
            return SOP_TEMPLATES["到货确认自动处理"]
        if '节庆' in name or '节日' in name:
            return SOP_TEMPLATES["广告预算自动调整"]
    
    # Dept-based matching
    if dept == '财务':
        if '收款' in name or '对账' in name:
            return SOP_TEMPLATES["多平台收款核对"]
        if '汇率' in name:
            return SOP_TEMPLATES["汇率自动获取与核算"]
        if '广告' in name and ('费' in name or 'ROI' in name):
            return SOP_TEMPLATES["广告费用计算"]
        if '利润' in name:
            return SOP_TEMPLATES["利润报表自动生成"]
        if '税务' in name or '税' in name:
            return SOP_TEMPLATES["税务申报数据准备"]
        if '发票' in name:
            return SOP_TEMPLATES["发票开具批量处理"]
        if '提成' in name:
            return SOP_TEMPLATES["提成自动计算"]
        if '资金' in name or '流水' in name:
            return SOP_TEMPLATES["多币种对账单"]
        if '月度' in name or '月报' in name:
            return SOP_TEMPLATES["利润报表自动生成"]
        if '多币种' in name:
            return SOP_TEMPLATES["多币种对账单"]
        if '报销' in name:
            return SOP_TEMPLATES["广告费用计算"]
    
    elif dept == '供应链':
        if '采购' in name:
            return SOP_TEMPLATES["采购建议自动生成"]
        if '供应商' in name:
            return SOP_TEMPLATES["供应商报价对比"]
        if '物流' in name:
            return SOP_TEMPLATES["物流费用计算"]
        if '仓库' in name or '库存' in name:
            return SOP_TEMPLATES["仓库数据核对"]
        if '到货' in name or '入库' in name:
            return SOP_TEMPLATES["到货确认自动处理"]
        if '库存' in name and ('同步' in name or '管理' in name):
            return SOP_TEMPLATES["多平台库存实时同步"]
        if 'SKU' in name and '成本' in name:
            return SOP_TEMPLATES["SKU库存周转分析"]
        if '备货' in name or '补货' in name:
            return SOP_TEMPLATES["采购建议自动生成"]
        if '供应商' in name and '到期' in name:
            return SOP_TEMPLATES["采购建议自动生成"]
        if '海关' in name:
            return SOP_TEMPLATES["仓库数据核对"]
        if '承运' in name:
            return SOP_TEMPLATES["物流费用计算"]
    
    elif dept == '运营':
        if '广告' in name:
            return SOP_TEMPLATES["广告投放效果分析"]
        if '商品' in name and '上传' in name:
            return SOP_TEMPLATES["商品批量上传"]
        if '订单' in name:
            return SOP_TEMPLATES["多店铺订单汇总处理"]
        if '库存' in name:
            return SOP_TEMPLATES["库存周转分析"]
        if '价格' in name:
            return SOP_TEMPLATES["价格自动调整"]
        if 'listing' in name_lower or '优化' in name:
            return SOP_TEMPLATES["listing优化建议"]
        if '竞品' in name or '竞争对手' in name:
            return SOP_TEMPLATES["竞品数据集中采集"]
        if 'BSR' in name or '排名' in name:
            return SOP_TEMPLATES["BSR排名监控"]
        if '新品' in name:
            return SOP_TEMPLATES["新品上架准备清单"]
        if '广告' in name and '预算' in name:
            return SOP_TEMPLATES["广告预算自动调整"]
    
    elif dept == '客服':
        if '工单' in name:
            return SOP_TEMPLATES["工单自动分配"]
        if '退货' in name or '退款' in name:
            return SOP_TEMPLATES["退货退款进度追踪"]
        if '满意' in name or 'NPS' in name or '评分' in name:
            return SOP_TEMPLATES["客户满意度调查"]
        if '多语言' in name or '翻译' in name:
            return SOP_TEMPLATES["多语言翻译"]
        if 'VIP' in name or '客户分层' in name:
            return SOP_TEMPLATES["客户分层管理"]
        if 'FAQ' in name or '回复' in name:
            return SOP_TEMPLATES["客户问题FAQ自动回复"]
        if '投诉' in name or '差评' in name:
            return SOP_TEMPLATES["退货退款进度追踪"]
        if '消息' in name or '聊天' in name:
            return SOP_TEMPLATES["客服消息集中处理"]
        if '评价' in name:
            return SOP_TEMPLATES["评价监控"]
    
    elif dept == '人事':
        if '招聘' in name or '简历' in name or '面试' in name:
            return SOP_TEMPLATES["招聘简报自动生成"]
        if '入职' in name or '入转离' in name:
            return SOP_TEMPLATES["员工入转离全流程"]
        if '考勤' in name or '打卡' in name:
            return SOP_TEMPLATES["员工考勤数据统计"]
        if '绩效' in name or 'KPI' in name:
            return SOP_TEMPLATES["KPI绩效数据收集"]
        if '离职' in name:
            return SOP_TEMPLATES["员工入转离全流程"]
        if '生日' in name or '节日' in name:
            return SOP_TEMPLATES["VIP客户标记管理"]  # reuse template
    
    elif dept == '管理':
        if '周报' in name:
            return SOP_TEMPLATES["团队周报自动汇总"]
        if 'OKR' in name or '进度' in name or '追踪' in name:
            return SOP_TEMPLATES["OKR进度追踪"]
        if '会议' in name:
            return SOP_TEMPLATES["会议纪要自动整理"]
        if '项目' in name:
            return SOP_TEMPLATES["项目延期预警"]
        if '竞品' in name or '竞争' in name:
            return SOP_TEMPLATES["竞争对手活动预警"]
        if '战略' in name or '经营' in name or '复盘' in name:
            return SOP_TEMPLATES["年度经营复盘"]
        if '公告' in name:
            return SOP_TEMPLATES["团队周报自动汇总"]
        if '部门' in name:
            return SOP_TEMPLATES["OKR进度追踪"]
    
    elif dept == '合规':
        if '合规' in name or '检测' in name:
            return SOP_TEMPLATES["产品合规检查"]
        if '商标' in name or '知识产权' in name:
            return SOP_TEMPLATES["知识产权商标检测"]
        if 'VAT' in name or '税务' in name:
            return SOP_TEMPLATES["VAT税务合规"]
        if 'EPR' in name:
            return SOP_TEMPLATES["EPR合规检测"]
        if '平台' in name and '政策' in name:
            return SOP_TEMPLATES["平台资质合规监控"]
        if '资质' in name:
            return SOP_TEMPLATES["平台资质合规监控"]
        if '标签' in name or '包装' in name:
            return SOP_TEMPLATES["产品合规检查"]
        if '到期' in name:
            return SOP_TEMPLATES["域名到期管理"]
    
    elif dept == '技术':
        if '监控' in name or '运行' in name:
            return SOP_TEMPLATES["系统运行状态监控"]
        if '备份' in name or '恢复' in name:
            return SOP_TEMPLATES["数据备份验证"]
        if 'API' in name:
            return SOP_TEMPLATES["API性能监控"]
        if '网站' in name or '可用' in name:
            return SOP_TEMPLATES["网站可用性监控"]
        if '安全' in name or '漏洞' in name:
            return SOP_TEMPLATES["安全漏洞扫描"]
        if 'SSL' in name or '证书' in name:
            return SOP_TEMPLATES["SSL证书到期提醒"]
        if '权限' in name:
            return SOP_TEMPLATES["系统权限定期审计"]
        if '部署' in name:
            return SOP_TEMPLATES["代码部署自动化流程"]
        if '日志' in name:
            return SOP_TEMPLATES["日志异常自动监控"]
        if '域名' in name or '商标' in name:
            return SOP_TEMPLATES["域名到期管理"]
        if '服务器' in name:
            return SOP_TEMPLATES["系统运行状态监控"]
    
    # Generic fallback
    return original_sop

# Expand all SOPs
expanded = 0
for s in scenarios:
    new_sop = get_expanded_sop(s)
    if new_sop != s['sop']:
        s['sop'] = new_sop
        expanded += 1

print(f"Expanded {expanded}/{len(scenarios)} SOPs")

# Rebuild the SCENARIOS array string
def rebuild_scenario(s):
    fields = [f'name:"{s["name"]}"', f'desc:"{s["desc"]}"', 
             f'platform:"{s["platform"]}"', f'model:"{s["model"]}"',
             f'type:"{s["type"]}"', f'dept:"{s["dept"]}"']
    if s['saveTime']:
        fields.append(f'saveTime:"{s["saveTime"]}"')
    if s['saveCost']:
        fields.append(f'saveCost:"{s["saveCost"]}"')
    if s['efficiency']:
        fields.append(f'efficiency:"{s["efficiency"]}"')
    fields.append(f'sop:"{s["sop"]}"')
    return '{' + ','.join(fields) + '}'

new_scenarios_str = ',\n'.join(rebuild_scenario(s) for s in scenarios)

# Replace in content
before = content[:arr_start]
after = content[arr_end:]
new_content = before + '\n' + new_scenarios_str + '\n];' + after

print(f"New content length: {len(new_content)}")
print(f"Old content length: {len(content)}")

with open(file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! File updated.")
print(f"\nSample expanded SOP for first scenario:")
print(scenarios[0]['sop'][:300])
