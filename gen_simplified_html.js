const fs = require('fs');

// 读取精简后的场景数据
const scenarios = JSON.parse(fs.readFileSync('C:\\Users\\10540\\.qclaw\\workspace\\rpa-scenarios\\scenarios_simplified.json', 'utf-8'));

// 按场景名称整合（同一场景名合并，显示所有适用平台）
const scenarioMap = new Map();
scenarios.forEach(s => {
  const key = s.name.replace(/^\[[^\]]+\]\s*/, ''); // 去掉平台前缀
  if (scenarioMap.has(key)) {
    const existing = scenarioMap.get(key);
    existing.platforms.push(s.platform);
    if (s.platform !== '通用') existing.platformCount++;
  } else {
    scenarioMap.set(key, {
      name: key,
      desc: s.desc,
      dept: s.dept,
      model: s.model,
      type: s.type,
      sop: s.sop,
      platforms: [s.platform],
      platformCount: s.platform === '通用' ? s.platformCount : 1
    });
  }
});

const integrated = Array.from(scenarioMap.values());
console.log(`整合后场景数: ${integrated.length}`);

// 统计
const deptCount = {};
integrated.forEach(s => {
  deptCount[s.dept] = (deptCount[s.dept] || 0) + 1;
});
console.log('\n部门分布:');
Object.entries(deptCount).sort((a,b) => b[1]-a[1]).forEach(([dept, count]) => {
  console.log(`  ${dept}: ${count}个`);
});

// 生成HTML
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function unicodeEscape(str) {
  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    return code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : c;
  }).join('');
}

const scenariosJson = JSON.stringify(integrated.map(s => ({
  name: s.name,
  desc: s.desc,
  dept: s.dept,
  model: s.model,
  type: s.type,
  platforms: s.platforms,
  platformCount: s.platformCount,
  sop: s.sop
})));

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u5f71\u5200RPA \u8de8\u5883\u573a\u666f</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .stats {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 15px;
    }
    .stat-item {
      text-align: center;
      color: white;
    }
    .stat-num {
      font-size: 2em;
      font-weight: bold;
    }
    .stat-label {
      font-size: 0.9em;
      opacity: 0.9;
    }
    .filters {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }
    .filter-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .filter-group label {
      color: white;
      font-weight: 500;
    }
    select, input {
      padding: 8px 15px;
      border: none;
      border-radius: 20px;
      background: white;
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .card {
      background: rgba(255,255,255,0.95);
      border-radius: 15px;
      padding: 20px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 1.1em;
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    .card-badges {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 500;
    }
    .badge-dept { background: #e0e7ff; color: #4338ca; }
    .badge-model { background: #fce7f3; color: #be185d; }
    .badge-type { background: #d1fae5; color: #047857; }
    .badge-platforms { background: #fef3c7; color: #b45309; }
    .card-desc {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .sop-toggle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85em;
      width: 100%;
      transition: opacity 0.3s;
    }
    .sop-toggle:hover {
      opacity: 0.9;
    }
    .sop-content {
      display: none;
      margin-top: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .sop-content.show {
      display: block;
    }
    .sop-step {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .sop-step:last-child {
      border-bottom: none;
    }
    .step-num {
      width: 24px;
      height: 24px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8em;
      margin-right: 10px;
      flex-shrink: 0;
    }
    .step-text {
      color: #475569;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>\u5f71\u5200RPA \u8de8\u5883\u573a\u666f</h1>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-num" id="totalCount">${integrated.length}</div>
        <div class="stat-label">\u573a\u666f\u603b\u6570</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">8</div>
        <div class="stat-label">\u4e1a\u52a1\u90e8\u95e8</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">15+</div>
        <div class="stat-label">\u8de8\u5883\u5e73\u53f0</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">3\u6b65</div>
        <div class="stat-label">\u6807\u51c6SOP</div>
      </div>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>\u90e8\u95e8:</label>
        <select id="deptFilter">
          <option value="">\u5168\u90e8</option>
        </select>
      </div>
      <div class="filter-group">
        <label>\u5e73\u53f0:</label>
        <select id="platformFilter">
          <option value="">\u5168\u90e8</option>
        </select>
      </div>
      <div class="filter-group">
        <label>\u7c7b\u578b:</label>
        <select id="typeFilter">
          <option value="">\u5168\u90e8</option>
          <option value="hot">\u70ed\u95e8</option>
          <option value="fast">\u5feb\u901f\u89c1\u6548</option>
          <option value="potential">\u6f5c\u529b\u573a\u666f</option>
        </select>
      </div>
      <div class="filter-group">
        <input type="text" id="searchInput" placeholder="\u641c\u7d22\u573a\u666f..." style="width: 200px;">
      </div>
    </div>
    
    <div class="grid" id="scenarioGrid"></div>
  </div>
  
  <script>
    const SCENARIOS = ${scenariosJson};
    
    // 初始化筛选器
    const depts = [...new Set(SCENARIOS.map(s => s.dept))].sort();
    const platforms = [...new Set(SCENARIOS.flatMap(s => s.platforms))].sort();
    
    const deptSelect = document.getElementById('deptFilter');
    const platformSelect = document.getElementById('platformFilter');
    
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
    
    platforms.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      platformSelect.appendChild(opt);
    });
    
    function render() {
      const dept = deptSelect.value;
      const platform = platformSelect.value;
      const type = document.getElementById('typeFilter').value;
      const search = document.getElementById('searchInput').value.toLowerCase();
      
      const filtered = SCENARIOS.filter(s => {
        if (dept && s.dept !== dept) return false;
        if (platform && !s.platforms.includes(platform)) return false;
        if (type && s.type !== type) return false;
        if (search && !s.name.toLowerCase().includes(search) && !s.desc.toLowerCase().includes(search)) return false;
        return true;
      });
      
      const grid = document.getElementById('scenarioGrid');
      grid.innerHTML = filtered.map((s, i) => \`
        <div class="card">
          <div class="card-header">
            <div class="card-title">\${escapeHtml(s.name)}</div>
          </div>
          <div class="card-badges" style="margin-bottom: 10px;">
            <span class="badge badge-dept">\${escapeHtml(s.dept)}</span>
            <span class="badge badge-model">\${escapeHtml(s.model)}</span>
            <span class="badge badge-type">\${getTypeLabel(s.type)}</span>
          </div>
          <div class="card-desc">\${escapeHtml(s.desc)}</div>
          <div class="card-badges" style="margin-bottom: 10px;">
            <span class="badge badge-platforms">\${s.platformCount}\u4e2a\u5e73\u53f0</span>
          </div>
          <button class="sop-toggle" onclick="toggleSop(\${i})">\u67e5\u770bSOP (\${s.sop.length}\u6b65)</button>
          <div class="sop-content" id="sop\${i}">
            \${s.sop.map((step, j) => \`
              <div class="sop-step">
                <div class="step-num">\${j+1}</div>
                <div class="step-text">\${escapeHtml(step)}</div>
              </div>
            \`).join('')}
          </div>
        </div>
      \`).join('');
    }
    
    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    
    function getTypeLabel(type) {
      const labels = { hot: '\u70ed\u95e8', fast: '\u5feb\u901f\u89c1\u6548', potential: '\u6f5c\u529b\u573a\u666f' };
      return labels[type] || type;
    }
    
    function toggleSop(index) {
      const el = document.getElementById('sop' + index);
      el.classList.toggle('show');
    }
    
    deptSelect.addEventListener('change', render);
    platformSelect.addEventListener('change', render);
    document.getElementById('typeFilter').addEventListener('change', render);
    document.getElementById('searchInput').addEventListener('input', render);
    
    render();
  </script>
</body>
</html>`;

fs.writeFileSync('C:\\Users\\10540\\.qclaw\\workspace\\rpa-scenarios\\index_simplified.html', html, 'utf-8');
console.log('\nHTML已生成: index_simplified.html');
console.log(`文件大小: ${(html.length / 1024).toFixed(1)} KB`);
