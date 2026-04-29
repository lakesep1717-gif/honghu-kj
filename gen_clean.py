import json

# 读取场景数据
with open('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios.json', 'r', encoding='utf-8') as f:
    scenarios = json.load(f)

print(f"已读取 {len(scenarios)} 个场景")

# 平台、模式、部门定义
platforms = ["亚马逊", "Temu", "Shein", "沃尔玛", "TikTok Shop", "eBay", "速卖通", "Shopee", "Lazada", "Allegro", "OZON", "美客多", "独立站"]
models = ["品牌型", "精品型", "精铺型", "铺货型"]
depts = [
    {"name": "运营", "icon": "📊"},
    {"name": "财务", "icon": "💰"},
    {"name": "供应链", "icon": "🚚"},
    {"name": "客服", "icon": "🎬"},
    {"name": "人事", "icon": "👥"},
    {"name": "管理", "icon": "🏢"},
    {"name": "合规", "icon": "📋"},
    {"name": "技术", "icon": "💻"}
]

# 转为JS字符串
depts_js = json.dumps(depts, ensure_ascii=False, indent=2)
platforms_js = json.dumps(platforms, ensure_ascii=False, indent=2)
models_js = json.dumps(models, ensure_ascii=False, indent=2)
scenarios_js = json.dumps(scenarios, ensure_ascii=False, indent=2)

# JS代码（已修复所有错误）
js_code = '''
const DEPTS = ''' + depts_js + ''';
const PLATFORMS = ''' + platforms_js + ''';
const MODELS = ''' + models_js + ''';
const SCENARIOS = ''' + scenarios_js + ''';

let activeDept = "全部";
let activePlatform = "全部";
let activeModel = "全部";
let searchKeyword = "";

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render() {
  let filtered = SCENARIOS.filter(s => {
    if (activeDept !== "全部" && s.dept !== activeDept) return false;
    if (activePlatform !== "全部" && s.platform !== activePlatform) return false;
    if (activeModel !== "全部" && s.model !== activeModel) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      const steps = Array.isArray(s.sop) ? s.sop.join(' ') : s.sop;
      const hay = [s.name, s.desc, s.platform, s.model, s.dept, steps];
      if (!hay.some(h => h.toLowerCase().includes(kw))) return false;
    }
    return true;
  });
  
  document.getElementById('statCount').textContent = filtered.length;
  document.getElementById('statPlat').textContent = new Set(filtered.map(s => s.platform)).size;
  
  const listEl = document.getElementById('scenarioList');
  const emptyEl = document.getElementById('emptyState');
  
  if (filtered.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  listEl.innerHTML = filtered.map((s, i) => renderCard(s, i)).join('');
}

function renderCard(s, i) {
  const typeClass = s.type === 'hot' ? 'tag-type-hot' : s.type === 'fast' ? 'tag-type-fast' : 'tag-type-potential';
  const typeText = s.type === 'hot' ? '🔥高频刚需' : s.type === 'fast' ? '⚡提效显著' : '🌱潜力场景';
  const steps = Array.isArray(s.sop) ? s.sop : [s.sop];
  const sopId = 'sop-' + i;
  
  return '<div class="scenario-card" id="card-' + i + '">' +
    '<div class="card-header">' +
      '<div class="card-title">' +
        '<span class="tag-platform">' + esc(s.platform) + '</span>' +
        '<span class="tag-model">' + esc(s.model) + '</span>' +
        '<span class="' + typeClass + '">' + typeText + '</span>' +
        '<h3>' + esc(s.name) + '</h3>' +
      '</div>' +
      '<div class="card-badges">' +
        '<span class="badge-dept">' + esc(s.dept) + '</span>' +
      '</div>' +
    '</div>' +
    '<p class="card-desc">' + esc(s.desc) + '</p>' +
    '<div class="card-sop">' +
      '<div class="sop-title" onclick="toggleSop(\\'' + sopId + '\\')">' +
        '<span>📋 SOP 操作步骤</span>' +
        '<span class="sop-toggle" id="toggle-' + i + '">▶ 展开</span>' +
      '</div>' +
      '<div class="sop-steps" id="' + sopId + '" style="display:none">' +
        steps.map((st, j) => '<div class="sop-step"><span class="step-num">' + (j+1) + '</span><span>' + esc(st) + '</span></div>').join('') +
      '</div>' +
    '</div>' +
    '<div class="card-stats">' +
      '<span>⏱️ ' + esc(s.saveTime) + '</span>' +
      '<span>💰 ' + esc(s.saveCost) + '</span>' +
      '<span>📈 ' + esc(s.efficiency) + '</span>' +
    '</div>' +
  '</div>';
}

function toggleSop(id) {
  const el = document.getElementById(id);
  const card = el.closest('.scenario-card');
  const toggle = card.querySelector('.sop-toggle');
  if (el.style.display === 'none') {
    el.style.display = 'block';
    toggle.textContent = '▼ 收起';
  } else {
    el.style.display = 'none';
    toggle.textContent = '▶ 展开';
  }
}

function renderSidebar() {
  const cnt = {};
  DEPTS.forEach(d => cnt[d.name] = 0);
  SCENARIOS.forEach(s => { if (cnt[s.dept] !== undefined) cnt[s.dept]++; });
  cnt["全部"] = SCENARIOS.length;
  
  var html = '';
  for (var i = 0; i < DEPTS.length; i++) {
    var d = DEPTS[i];
    var active = d.name === activeDept ? ' active' : '';
    html += '<div class="dept-item' + active + '" onclick="setDept(\\'' + d.name.replace(/'/g, "\\'") + '\\')">' +
      '<div class="dept-icon">' + d.icon + '</div>' +
      '<div class="dept-info">' +
        '<div class="dept-name">' + d.name + '</div>' +
        '<div class="dept-count">' + cnt[d.name] + ' 个场景</div>' +
      '</div>' +
    '</div>';
  }
  document.getElementById('deptSidebar').innerHTML = html;
}

function renderFilters() {
  var pHtml = '<button class="filter-btn' + (activePlatform === "全部" ? " active" : "") + '" onclick="setPlatform(\\'\\u5168\\u90e8\\'")">全部</button>';
  for (var i = 0; i < PLATFORMS.length; i++) {
    var p = PLATFORMS[i];
    pHtml += '<button class="filter-btn' + (p === activePlatform ? " active" : "") + '" onclick="setPlatform(\\'' + p.replace(/'/g, "\\'") + '\\')">' + p + '</button>';
  }
  document.getElementById('platformFilters').innerHTML = pHtml;
  
  var mHtml = '<button class="filter-btn' + (activeModel === "全部" ? " active" : "") + '" onclick="setModel(\\'\\u5168\\u90e8\\'")">全部</button>';
  for (var i = 0; i < MODELS.length; i++) {
    var m = MODELS[i];
    mHtml += '<button class="filter-btn' + (m === activeModel ? " active" : "") + '" onclick="setModel(\\'' + m.replace(/'/g, "\\'") + '\\')">' + m + '</button>';
  }
  document.getElementById('modelFilters').innerHTML = mHtml;
}

function setDept(d) { activeDept = d; renderSidebar(); render(); }
function setPlatform(p) { activePlatform = p; renderFilters(); render(); }
function setModel(m) { activeModel = m; renderFilters(); render(); }

document.getElementById('searchInput').addEventListener('input', function(e) {
  searchKeyword = e.target.value.trim();
  render();
});

document.getElementById('subtitle').textContent = SCENARIOS.length + '个自动化场景 · ' + PLATFORMS.length + '个平台 · ' + (DEPTS.length - 1) + '大部门';

renderSidebar();
renderFilters();
render();
'''

# HTML模板
html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>跨境电商RPA场景库</title>
<style>
* { margin:0; padding:0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }

.header { background: rgba(255,255,255,0.95); padding: 20px 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.header h1 { color: #667eea; font-size: 28px; margin-bottom: 8px; }
.header .subtitle { color: #666; font-size: 14px; }

.stat-grid { display: flex; gap: 20px; padding: 20px 40px; background: rgba(255,255,255,0.9); }
.stat-card { background: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 150px; }
.stat-card .num { font-size: 32px; font-weight: bold; color: #667eea; }
.stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }

.main-container { display: flex; padding: 20px 40px; gap: 20px; }

.sidebar { width: 240px; background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; height: fit-content; position: sticky; top: 20px; }
.dept-item { display: flex; align-items: center; padding: 12px; margin-bottom: 8px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
.dept-item:hover { background: #f0f0f0; }
.dept-item.active { background: #667eea; color: white; }
.dept-icon { font-size: 24px; margin-right: 12px; }
.dept-name { font-size: 14px; font-weight: 500; }
.dept-count { font-size: 12px; opacity: 0.7; margin-top: 2px; }

.content { flex: 1; }
.filters { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.filter-group { margin-bottom: 15px; }
.filter-group:last-child { margin-bottom: 0; }
.filter-label { font-size: 13px; color: #666; margin-bottom: 8px; }
.filter-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-btn { padding: 6px 16px; border: 1px solid #ddd; background: white; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.3s; }
.filter-btn:hover { border-color: #667eea; color: #667eea; }
.filter-btn.active { background: #667eea; color: white; border-color: #667eea; }

.search-box { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 15px; }

.scenario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.scenario-card { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s; }
.scenario-card:hover { transform: translateY(-2px); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.card-title h3 { font-size: 16px; color: #333; margin-bottom: 8px; }
.tag-platform { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 6px; }
.tag-model { background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 6px; }
.tag-type-hot { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.tag-type-fast { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.tag-type-potential { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.badge-dept { background: #f5f5f5; color: #666; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
.card-desc { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 15px; }
.card-sop { background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
.sop-title { font-size: 13px; font-weight: 500; color: #333; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.sop-toggle { font-size: 12px; color: #667eea; }
.sop-steps { margin-top: 10px; display: none; }
.sop-step { display: flex; margin-bottom: 8px; font-size: 13px; color: #555; }
.step-num { background: #667eea; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 10px; flex-shrink: 0; }
.card-stats { display: flex; gap: 15px; font-size: 12px; color: #888; }
.empty-state { text-align: center; padding: 60px 20px; color: #999; background: rgba(255,255,255,0.95); border-radius: 12px; }
</style>
</head>
<body>

<div class="header">
  <h1>跨境电商RPA场景库</h1>
  <div class="subtitle" id="subtitle"></div>
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="num" id="statCount">0</div>
    <div class="label">当前展示场景</div>
  </div>
  <div class="stat-card">
    <div class="num" id="statPlat">0</div>
    <div class="label">平台数量</div>
  </div>
  <div class="stat-card">
    <div class="num">300+</div>
    <div class="label">总场景数</div>
  </div>
  <div class="stat-card">
    <div class="num">8</div>
    <div class="label">部门覆盖</div>
  </div>
</div>

<div class="main-container">
  <div class="sidebar" id="deptSidebar"></div>
  
  <div class="content">
    <div class="filters">
      <input type="text" class="search-box" id="searchInput" placeholder="搜索场景名称、平台、业务模式...">
      
      <div class="filter-group">
        <div class="filter-label">平台筛选</div>
        <div class="filter-btns" id="platformFilters"></div>
      </div>
      
      <div class="filter-group">
        <div class="filter-label">业务模式</div>
        <div class="filter-btns" id="modelFilters"></div>
      </div>
    </div>
    
    <div class="scenario-grid" id="scenarioList"></div>
    <div class="empty-state" id="emptyState" style="display:none;">
      <div style="font-size:48px;margin-bottom:20px;">🔍</div>
      <div style="font-size:16px;">未找到匹配的场景</div>
    </div>
  </div>
</div>

<script>
''' + js_code + '''
</script>

</body>
</html>'''

# 写入文件
output_path = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"✅ HTML已生成: {output_path}")
print(f"📏 文件大小: {len(html.encode('utf-8'))} 字节")

# 验证JS语法
try:
    import subprocess
    # 提取JS代码验证
    start = html.find('<script>') + len('<script>')
    end = html.find('</script>')
    js_to_check = html[start:end]
    # 写入临时文件验证
    with open('temp_js_check.js', 'w', encoding='utf-8') as f:
        f.write(js_to_check)
    result = subprocess.run(['node', 'temp_js_check.js'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ JS语法验证通过")
    else:
        print(f"❌ JS语法错误: {result.stderr}")
finally:
    import os
    if os.path.exists('temp_js_check.js'):
        os.remove('temp_js_check.js')
