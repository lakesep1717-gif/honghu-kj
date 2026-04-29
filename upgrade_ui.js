const fs = require('fs');

const scenarios = JSON.parse(fs.readFileSync('C:\\Users\\10540\\.qclaw\\workspace\\rpa-scenarios\\scenarios_final.json', 'utf-8'));

// 按场景名称整合
const scenarioMap = new Map();
scenarios.forEach(s => {
  const key = s.name.replace(/^\[[^\]]+\]\s*/, '');
  if (scenarioMap.has(key)) {
    const existing = scenarioMap.get(key);
    if (!existing.platforms) existing.platforms = [];
    if (s.platform && !existing.platforms.includes(s.platform)) {
      existing.platforms.push(s.platform);
    }
    if (s.platform !== '通用') existing.platformCount = (existing.platformCount || 0) + 1;
  } else {
    scenarioMap.set(key, {
      name: key,
      desc: s.desc,
      dept: s.dept,
      model: s.model,
      type: s.type,
      sop: s.sop,
      platforms: s.platforms || (s.platform ? [s.platform] : []),
      platformCount: s.platform === '通用' ? (s.platformCount || 1) : 1
    });
  }
});

const integrated = Array.from(scenarioMap.values());

const scenariosJson = JSON.stringify(integrated);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>影刀RPA 跨境场景</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      color: white;
      font-size: 2.8em;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #00d9ff, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: rgba(255,255,255,0.7);
      font-size: 1.1em;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .stat-item {
      text-align: center;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 20px 35px;
      transition: transform 0.3s;
    }
    .stat-item:hover {
      transform: translateY(-5px);
    }
    .stat-num {
      font-size: 2.5em;
      font-weight: bold;
      background: linear-gradient(135deg, #00d9ff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label {
      color: rgba(255,255,255,0.6);
      font-size: 0.9em;
      margin-top: 5px;
    }
    .filters {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 25px;
      padding: 25px 30px;
      margin-bottom: 30px;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
    }
    .filter-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .filter-group label {
      color: rgba(255,255,255,0.8);
      font-weight: 500;
      font-size: 0.95em;
    }
    select, input {
      padding: 10px 20px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 25px;
      background: rgba(255,255,255,0.1);
      color: white;
      font-size: 14px;
      outline: none;
      transition: all 0.3s;
    }
    select:hover, input:hover {
      border-color: rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.15);
    }
    select:focus, input:focus {
      border-color: #00d9ff;
      background: rgba(255,255,255,0.15);
    }
    select option {
      background: #1a1a2e;
      color: white;
    }
    input::placeholder {
      color: rgba(255,255,255,0.5);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 25px;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 25px;
      transition: all 0.3s;
    }
    .card:hover {
      transform: translateY(-8px);
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .card-title {
      font-size: 1.15em;
      font-weight: 600;
      color: white;
      flex: 1;
    }
    .card-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.75em;
      font-weight: 500;
    }
    .badge-dept { 
      background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
      color: white; 
    }
    .badge-model { 
      background: linear-gradient(135deg, #ec4899, #be185d); 
      color: white; 
    }
    .badge-type { 
      background: linear-gradient(135deg, #10b981, #047857); 
      color: white; 
    }
    .badge-platforms { 
      background: linear-gradient(135deg, #f59e0b, #d97706); 
      color: white; 
    }
    .card-desc {
      color: rgba(255,255,255,0.7);
      font-size: 0.9em;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    .sop-toggle {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 0.9em;
      width: 100%;
      transition: all 0.3s;
      font-weight: 500;
    }
    .sop-toggle:hover {
      transform: scale(1.02);
      box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
    }
    .sop-content {
      display: none;
      margin-top: 15px;
      padding: 15px;
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .sop-content.show {
      display: block;
    }
    .sop-step {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .sop-step:last-child {
      border-bottom: none;
    }
    .step-num {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #00d9ff, #a855f7);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75em;
      margin-right: 12px;
      flex-shrink: 0;
      font-weight: 600;
    }
    .step-text {
      color: rgba(255,255,255,0.85);
      font-size: 0.85em;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>影刀RPA 跨境场景</h1>
      <p class="subtitle">一站式跨境电商自动化解决方案库</p>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-num">${integrated.length}</div>
        <div class="stat-label">场景总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">8</div>
        <div class="stat-label">业务部门</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">15+</div>
        <div class="stat-label">跨境平台</div>
      </div>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>部门</label>
        <select id="deptFilter">
          <option value="">全部</option>
        </select>
      </div>
      <div class="filter-group">
        <label>平台</label>
        <select id="platformFilter">
          <option value="">全部</option>
        </select>
      </div>
      <div class="filter-group">
        <label>类型</label>
        <select id="typeFilter">
          <option value="">全部</option>
          <option value="hot">热门</option>
          <option value="fast">快速见效</option>
          <option value="potential">潜力场景</option>
        </select>
      </div>
      <div class="filter-group">
        <input type="text" id="searchInput" placeholder="搜索场景..." style="width: 180px;">
      </div>
    </div>
    
    <div class="grid" id="scenarioGrid"></div>
  </div>
  
  <script>
    const SCENARIOS = ${scenariosJson};
    
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
          <div class="card-badges" style="margin-bottom: 12px;">
            <span class="badge badge-dept">\${escapeHtml(s.dept)}</span>
            <span class="badge badge-model">\${escapeHtml(s.model)}</span>
            <span class="badge badge-type">\${getTypeLabel(s.type)}</span>
          </div>
          <div class="card-desc">\${escapeHtml(s.desc)}</div>
          <div class="card-badges" style="margin-bottom: 12px;">
            <span class="badge badge-platforms">\${s.platformCount}个平台</span>
          </div>
          <button class="sop-toggle" onclick="toggleSop(\${i})">查看SOP</button>
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
      const labels = { hot: '热门', fast: '快速见效', potential: '潜力场景' };
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

fs.writeFileSync('C:\\Users\\10540\\.qclaw\\workspace\\rpa-scenarios\\index.html', html, 'utf-8');
console.log('HTML已生成');
console.log(`文件大小: ${(html.length / 1024).toFixed(1)} KB`);
