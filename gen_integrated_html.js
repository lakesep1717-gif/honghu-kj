const fs = require('fs');

const scenarios = JSON.parse(fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/scenarios_integrated.json', 'utf8'));

// 收集所有平台和部门
const allPlatforms = new Set();
const allDepts = new Set();
scenarios.forEach(s => {
  s.platforms.forEach(p => allPlatforms.add(p));
  allDepts.add(s.dept);
});

const platforms = Array.from(allPlatforms).sort();
const depts = Array.from(allDepts).sort();

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>跨境电商RPA场景库 - 整合版</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .header .stats {
      font-size: 1.1rem;
      opacity: 0.95;
    }
    .search-box {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .search-box input {
      width: 100%;
      padding: 12px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    .search-box input:focus {
      border-color: #667eea;
    }
    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-group {
      flex: 1;
      min-width: 200px;
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .filter-group label {
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      display: block;
    }
    .filter-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .scenario-card {
      background: rgba(255,255,255,0.95);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .scenario-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }
    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }
    .scenario-name {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      flex: 1;
    }
    .scenario-type {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .scenario-type.hot { background: #fee2e2; color: #dc2626; }
    .scenario-type.fast { background: #fef3c7; color: #d97706; }
    .scenario-type.potential { background: #dbeafe; color: #2563eb; }
    .scenario-desc {
      color: #666;
      font-size: 14px;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .scenario-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .meta-tag {
      padding: 4px 10px;
      background: #f3f4f6;
      border-radius: 6px;
      font-size: 12px;
      color: #555;
    }
    .meta-tag.dept { background: #ede9fe; color: #7c3aed; }
    .meta-tag.model { background: #fce7f3; color: #db2777; }
    .platforms {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .platform-tag {
      padding: 4px 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 6px;
      font-size: 12px;
    }
    .sop-toggle {
      color: #667eea;
      font-size: 14px;
      cursor: pointer;
      margin-bottom: 10px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .sop-toggle:hover { text-decoration: underline; }
    .sop-content {
      display: none;
      background: #f9fafb;
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
    }
    .sop-content.show { display: block; }
    .sop-step {
      padding: 8px 12px;
      margin: 6px 0;
      background: white;
      border-left: 3px solid #667eea;
      border-radius: 4px;
      font-size: 13px;
      color: #374151;
    }
    .count-badge {
      background: rgba(255,255,255,0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎒 跨境电商RPA场景库</h1>
      <div class="stats">
        <span id="totalCount">${scenarios.length}个场景</span> |
        覆盖${platforms.length}个平台 · ${depts.length}个部门
      </div>
    </div>
    
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索场景名称（如：培训计划管理）">
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>部门筛选</label>
        <select id="deptFilter">
          <option value="">全部部门 (${depts.length})</option>
          ${depts.map(d => `<option value="${d}">${d}</option>`).join('\n')}
        </select>
      </div>
      <div class="filter-group">
        <label>平台筛选</label>
        <select id="platformFilter">
          <option value="">全部平台 (${platforms.length})</option>
          ${platforms.map(p => `<option value="${p}">${p}</option>`).join('\n')}
        </select>
      </div>
      <div class="filter-group">
        <label>类型筛选</label>
        <select id="typeFilter">
          <option value="">全部类型</option>
          <option value="hot">🔥 热门场景</option>
          <option value="fast">⚡ 快速见效</option>
          <option value="potential">💡 潜力场景</option>
        </select>
      </div>
    </div>
    
    <div class="count-badge" id="showingCount">显示 ${scenarios.length} 个场景</div>
    
    <div class="scenarios-grid" id="scenariosGrid">
      ${scenarios.map((s, i) => `
      <div class="scenario-card" data-dept="${s.dept}" data-type="${s.type}" data-platforms="${s.platforms.join(',')}">
        <div class="scenario-header">
          <div class="scenario-name">${s.name}</div>
          <span class="scenario-type ${s.type}">${s.type === 'hot' ? '🔥' : s.type === 'fast' ? '⚡' : '💡'} ${s.type}</span>
        </div>
        <div class="scenario-desc">${s.desc}</div>
        <div class="scenario-meta">
          <span class="meta-tag dept">${s.dept}</span>
          <span class="meta-tag model">${s.model}</span>
        </div>
        <div class="platforms">
          ${s.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
        </div>
        <div class="sop-toggle" onclick="toggleSop('sop-${i}')">展开SOP (${s.sop.length}步) ▼</div>
        <div class="sop-content" id="sop-${i}">
          ${s.sop.map((step, j) => `<div class="sop-step"><b>${j+1}.</b> ${step}</div>`).join('\n')}
        </div>
      </div>
      `).join('\n')}
    </div>
  </div>
  
  <script>
    function toggleSop(id) {
      const el = document.getElementById(id);
      el.classList.toggle('show');
    }
    
    function filter() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const dept = document.getElementById('deptFilter').value;
      const platform = document.getElementById('platformFilter').value;
      const type = document.getElementById('typeFilter').value;
      
      const cards = document.querySelectorAll('.scenario-card');
      let visible = 0;
      
      cards.forEach(card => {
        const name = card.querySelector('.scenario-name').textContent.toLowerCase();
        const cardDept = card.dataset.dept;
        const cardType = card.dataset.type;
        const cardPlatforms = card.dataset.platforms.split(',');
        
        const matchSearch = !search || name.includes(search);
        const matchDept = !dept || cardDept === dept;
        const matchType = !type || cardType === type;
        const matchPlatform = !platform || cardPlatforms.includes(platform);
        
        if (matchSearch && matchDept && matchType && matchPlatform) {
          card.style.display = 'block';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });
      
      document.getElementById('showingCount').textContent = '显示 ' + visible + ' 个场景';
    }
    
    document.getElementById('searchInput').addEventListener('input', filter);
    document.getElementById('deptFilter').addEventListener('change', filter);
    document.getElementById('platformFilter').addEventListener('change', filter);
    document.getElementById('typeFilter').addEventListener('change', filter);
  </script>
</body>
</html>`;

fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index_integrated.html', html, 'utf8');
console.log('HTML已生成: index_integrated.html');
console.log(`文件大小: ${(html.length/1024).toFixed(1)} KB`);