const fs = require('fs');

// 读取场景数据
const scenarios = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios.json', 'utf8'));

// 平台、模式、部门定义（使用Unicode转义）
const PLATFORMS = ["\u4e9a\u9a6c\u900a", "\u0074\u0065\u006d\u0075", "\u0053\u0068\u0065\u0069\u006e", "\u6c6a\u5c14\u739b", "\u0054\u0069\u006b\u0054\u006f\u006b\u0020\u0053\u0068\u006f\u0070", "\u0065\u0042\u0061\u0079", "\u901f\u5356\u901a", "\u0053\u0068\u006f\u0070\u0065\u0065", "\u004c\u0061\u007a\u0061\u0064\u0061", "\u0041\u006c\u006c\u0065\u0067\u0072\u006f", "\u004f\u005a\u004f\u004e", "\u7f8e\u5ba2\u591a", "\u72ec\u7acb\u7ad9"];

const MODELS = ["\u54c1\u724c\u578b", "\u7cbe\u54c1\u578b", "\u7cbe\u94fa\u578b", "\u94fa\u8d27\u578b"];

const DEPTS = [
  { name: "\u8fd0\u8425", icon: "\u{1F4CA}" },
  { name: "\u8d22\u52a1", icon: "\u{1F4B0}" },
  { name: "\u4f9b\u5e94\u94fe", icon: "\u{1F69A}" },
  { name: "\u5ba2\u670d", icon: "\u{1F3AC}" },
  { name: "\u4eba\u4e8b", icon: "\u{1F465}" },
  { name: "\u7ba1\u7406", icon: "\u{1F3E2}" },
  { name: "\u5408\u89c4", icon: "\u{1F4CB}" },
  { name: "\u6280\u672f", icon: "\u{1F4BB}" }
];

// 生成JavaScript数组字符串（使用Unicode转义）
function toJsString(str) {
  return JSON.stringify(str);
}

// 将场景数据转为JS数组
const scenStr = JSON.stringify(scenarios, null, 2);

// HTML模板
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>\u8de8\u5883\u7535\u5546RPA\u573a\u666f\u5e93</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
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
  <h1>\u8de8\u5883\u7535\u5546RPA\u573a\u666f\u5e93</h1>
  <div class="subtitle" id="subtitle"></div>
</div>

<div class="stat-grid">
  <div class="stat-card">
    <div class="num" id="statCount">0</div>
    <div class="label">\u5f53\u524d\u663e\u793a\u573a\u666f</div>
  </div>
  <div class="stat-card">
    <div class="num" id="statPlat">0</div>
    <div class="label">\u5e73\u53f0\u6570\u91cf</div>
  </div>
  <div class="stat-card">
    <div class="num">300+</div>
    <div class="label">\u603b\u573a\u666f\u6570</div>
  </div>
  <div class="stat-card">
    <div class="num">8</div>
    <div class="label">\u90e8\u95e8\u8986\u76d6</div>
  </div>
</div>

<div class="main-container">
  <div class="sidebar" id="deptSidebar"></div>
  
  <div class="content">
    <div class="filters">
      <input type="text" class="search-box" id="searchInput" placeholder="\u641c\u7d22\u573a\u666f\u540d\u79f0\u3001\u5e73\u53f0\u3001\u4e1a\u52a1\u6a21\u5f0f...">
      
      <div class="filter-group">
        <div class="filter-label">\u5e73\u53f0\u7b5b\u9009</div>
        <div class="filter-btns" id="platformFilters"></div>
      </div>
      
      <div class="filter-group">
        <div class="filter-label">\u4e1a\u52a1\u6a21\u5f0f</div>
        <div class="filter-btns" id="modelFilters"></div>
      </div>
    </div>
    
    <div class="scenario-grid" id="scenarioList"></div>
    <div class="empty-state" id="emptyState" style="display:none;">
      <div style="font-size:48px;margin-bottom:20px;">\ud83d\udd0d</div>
      <div style="font-size:16px;">\u672a\u627e\u5230\u5339\u914d\u7684\u573a\u666f</div>
    </div>
  </div>
</div>

<script>
const DEPTS = ${JSON.stringify(DEPTS, null, 2)};
const PLATFORMS = ${JSON.stringify(PLATFORMS, null, 2)};
const MODELS = ${JSON.stringify(MODELS, null, 2)};
const SCENARIOS = ${scenStr};

let activeDept = "\u5168\u90e8";
let activePlatform = "\u5168\u90e8";
let activeModel = "\u5168\u90e8";
let searchKeyword = "";

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render() {
  let filtered = SCENARIOS.filter(s => {
    if (activeDept !== "\u5168\u90e8" && s.dept !== activeDept) return false;
    if (activePlatform !== "\u5168\u90e8" && s.platform !== activePlatform) return false;
    if (activeModel !== "\u5168\u90e8" && s.model !== activeModel) return false;
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
  const typeText = s.type === 'hot' ? '\ud83d\udd25\u9ad8\u9891\u521a\u9700' : s.type === 'fast' ? '\u26a1\u63d0\u6548\u663e\u8457' : '\ud83c\udf31\u6f5c\u529b\u573a\u666f';
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
        '<span>\ud83d\udccb SOP \u64cd\u4f5c\u6b65\u9aa4</span>' +
        '<span class="sop-toggle" id="toggle-' + i + '">\u25b6 \u5c55\u5f00</span>' +
      '</div>' +
      '<div class="sop-steps" id="' + sopId + '" style="display:none">' +
        steps.map((st, j) => '<div class="sop-step"><span class="step-num">' + (j+1) + '</span><span>' + esc(st) + '</span></div>').join('') +
      '</div>' +
    '</div>' +
    '<div class="card-stats">' +
      '<span>\u23f1\ufe0f ' + esc(s.saveTime) + '</span>' +
      '<span>\ud83d\udcb0 ' + esc(s.saveCost) + '</span>' +
      '<span>\ud83d\udcc8 ' + esc(s.efficiency) + '</span>' +
    '</div>' +
  '</div>';
}

function toggleSop(id) {
  const el = document.getElementById(id);
  const card = el.closest('.scenario-card');
  const toggle = card.querySelector('.sop-toggle');
  if (el.style.display === 'none') {
    el.style.display = 'block';
    toggle.textContent = '\u25bc \u6536\u8d77';
  } else {
    el.style.display = 'none';
    toggle.textContent = '\u25b6 \u5c55\u5f00';
  }
}

function renderSidebar() {
  const cnt = {};
  DEPTS.forEach(d => cnt[d.name] = 0);
  SCENARIOS.forEach(s => { if (cnt[s.dept] !== undefined) cnt[s.dept]++; });
  cnt["\u5168\u90e8"] = SCENARIOS.length;
  
  var html = '';
  for (var i = 0; i < DEPTS.length; i++) {
    var d = DEPTS[i];
    var active = d.name === activeDept ? ' active' : '';
    html += '<div class="dept-item' + active + '" onclick="setDept(\\'' + d.name.replace(/'/g, "\\\\'") + '\\')">' +
      '<div class="dept-icon">' + d.icon + '</div>' +
      '<div class="dept-info">' +
        '<div class="dept-name">' + d.name + '</div>' +
        '<div class="dept-count">' + cnt[d.name] + ' \u4e2a\u573a\u666f</div>' +
      '</div>' +
    '</div>';
  }
  document.getElementById('deptSidebar').innerHTML = html;
}

function renderFilters() {
  var pHtml = '<button class="filter-btn' + (activePlatform === "\u5168\u90e8" ? " active" : "") + '" onclick="setPlatform(\\'\\u5168\\u90e8\\'\\')">\u5168\u90e8</button>';
  for (var i = 0; i < PLATFORMS.length; i++) {
    var p = PLATFORMS[i];
    pHtml += '<button class="filter-btn' + (p === activePlatform ? " active" : "") + '" onclick="setPlatform(\\'' + p.replace(/'/g, "\\\\'") + '\\')">' + p + '</button>';
  }
  document.getElementById('platformFilters').innerHTML = pHtml;
  
  var mHtml = '<button class="filter-btn' + (activeModel === "\\u5168\\u90e8" ? " active" : "") + '" onclick="setModel(\\'\\u5168\\u90e8\\'\\')">\u5168\u90e8</button>';
  for (var i = 0; i < MODELS.length; i++) {
    var m = MODELS[i];
    mHtml += '<button class="filter-btn' + (m === activeModel ? " active" : "") + '" onclick="setModel(\\'' + m.replace(/'/g, "\\\\'") + '\\')">' + m + '</button>';
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

document.getElementById('subtitle').textContent = SCENARIOS.length + '\u4e2a\u81ea\u52a8\u5316\u573a\u666f \u00b7 ' + PLATFORMS.length + '\u4e2a\u5e73\u53f0 \u00b7 ' + (DEPTS.length - 1) + '\u5927\u90e8\u95e8';

renderSidebar();
renderFilters();
render();
</script>

</body>
</html>`;

// 验证JS语法
try {
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    new Function(scriptMatch[1]);
    console.log('✅ JS语法验证通过');
  }
} catch(e) {
  console.log('❌ JS语法错误:', e.message);
  process.exit(1);
}

// 写入文件
const outputPath = 'C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html';
fs.writeFileSync(outputPath, html, 'utf8');
console.log('✅ HTML文件已生成');
console.log('📁 路径:', outputPath);
console.log('📏 文件大小:', html.length, '字节');
