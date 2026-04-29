const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios_integrated_v2.json'), 'utf8'));

console.log('场景数:', data.length);

// 生成HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>影刀RPA 跨境场景</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #fff;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 40px 0; }
        .header h1 {
            font-size: 2.5em;
            background: linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .stat-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 15px 25px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .stat-number { font-size: 2em; font-weight: bold; color: #00d4ff; }
        .stat-label { font-size: 0.9em; color: #ccc; margin-top: 5px; }
        .filters {
            display: flex;
            gap: 15px;
            margin: 30px 0;
            flex-wrap: wrap;
            justify-content: center;
        }
        .filter-select {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            min-width: 150px;
        }
        .filter-select option { background: #1a1a2e; color: #fff; }
        .search-box {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            width: 300px;
        }
        .search-box::placeholder { color: #aaa; }
        .scenarios-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .scenario-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .scenario-card:hover {
            transform: translateY(-5px);
            border-color: rgba(124, 58, 237, 0.5);
            box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2);
        }
        .scenario-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .scenario-name { font-size: 1.1em; font-weight: 600; color: #fff; flex: 1; }
        .scenario-type {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .type-fast { background: linear-gradient(135deg, #10b981, #059669); }
        .type-potential { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .scenario-desc { color: #ccc; font-size: 0.9em; margin-bottom: 15px; line-height: 1.5; }
        .scenario-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }
        .meta-tag {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 10px;
            border-radius: 5px;
            font-size: 0.8em;
            color: #aaa;
        }
        .platforms {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }
        .platform-tag {
            background: rgba(124, 58, 237, 0.2);
            color: #a78bfa;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75em;
        }
        .platform-count {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: 600;
        }
        .sop-section { margin-top: 15px; }
        .sop-toggle {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            transition: all 0.2s;
        }
        .sop-toggle:hover { transform: scale(1.05); }
        .sop-content {
            display: none;
            margin-top: 15px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        .sop-content.active { display: block; }
        .sop-empty { color: #888; font-style: italic; font-size: 0.9em; }
        .sop-step {
            display: flex;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sop-step:last-child { border-bottom: none; }
        .step-number {
            background: #7c3aed;
            color: #fff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: 600;
            flex-shrink: 0;
        }
        .step-text { color: #ddd; font-size: 0.9em; line-height: 1.5; }
        .no-results { text-align: center; padding: 60px 20px; color: #888; }
        .no-results h3 { font-size: 1.5em; margin-bottom: 10px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>影刀RPA 跨境场景</h1>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${data.length}</div>
                    <div class="stat-label">总场景数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${[...new Set(data.flatMap(s => s.platforms))].length}</div>
                    <div class="stat-label">平台数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${[...new Set(data.map(s => s.dept))].length}</div>
                    <div class="stat-label">部门数</div>
                </div>
            </div>
        </div>
        <div class="filters">
            <select class="filter-select" id="platformFilter">
                <option value="">全部平台</option>
${[...new Set(data.flatMap(s => s.platforms))].sort().map(p => `                <option value="${p}">${p}</option>`).join('\n')}
            </select>
            <select class="filter-select" id="deptFilter">
                <option value="">全部部门</option>
${[...new Set(data.map(s => s.dept))].sort().map(d => `                <option value="${d}">${d}</option>`).join('\n')}
            </select>
            <select class="filter-select" id="typeFilter">
                <option value="">全部类型</option>
                <option value="fast">快速交付</option>
                <option value="potential">潜力型</option>
            </select>
            <input type="text" class="search-box" id="searchBox" placeholder="搜索场景名称或描述...">
        </div>
        <div class="scenarios-grid" id="scenariosGrid"></div>
        <div class="no-results" id="noResults" style="display: none;">
            <h3>未找到匹配的场景</h3>
            <p>请尝试调整筛选条件</p>
        </div>
    </div>
    <script>
        const SCENARIOS = ${JSON.stringify(data)};
        function renderScenarios(scenarios) {
            const grid = document.getElementById('scenariosGrid');
            const noResults = document.getElementById('noResults');
            if (scenarios.length === 0) {
                grid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }
            noResults.style.display = 'none';
            grid.innerHTML = scenarios.map((s, i) => '<div class="scenario-card"><div class="scenario-header"><div class="scenario-name">' + s.dept + ' - ' + s.name + '</div><span class="scenario-type type-' + s.type + '">' + (s.type === 'fast' ? '快速' : '潜力') + '</span></div><div class="scenario-desc">' + s.desc + '</div><div class="scenario-meta"><span class="meta-tag">' + s.model + '</span></div>' + (s.platforms && s.platforms.length > 0 ? '<div class="platforms"><span class="platform-count">' + s.platforms.length + '平台</span>' + s.platforms.map(p => '<span class="platform-tag">' + p + '</span>').join('') + '</div>' : '') + '<div class="sop-section">' + (s.sop && s.sop.length > 0 ? '<button class="sop-toggle" onclick="toggleSOP(\\'sop-' + i + '\\')">查看SOP</button><div class="sop-content" id="sop-' + i + '">' + s.sop.map((step, idx) => '<div class="sop-step"><div class="step-number">' + (idx + 1) + '</div><div class="step-text">' + step + '</div></div>').join('') + '</div>' : '<div class="sop-empty">SOP待补充</div>') + '</div></div>').join('');
        }
        function toggleSOP(id) {
            const el = document.getElementById(id);
            el.classList.toggle('active');
        }
        function filterScenarios() {
            const platform = document.getElementById('platformFilter').value;
            const dept = document.getElementById('deptFilter').value;
            const type = document.getElementById('typeFilter').value;
            const search = document.getElementById('searchBox').value.toLowerCase();
            const filtered = SCENARIOS.filter(s => {
                if (platform && !s.platforms.includes(platform)) return false;
                if (dept && s.dept !== dept) return false;
                if (type && s.type !== type) return false;
                if (search && !s.name.toLowerCase().includes(search) && !s.desc.toLowerCase().includes(search)) return false;
                return true;
            });
            renderScenarios(filtered);
        }
        document.getElementById('platformFilter').addEventListener('change', filterScenarios);
        document.getElementById('deptFilter').addEventListener('change', filterScenarios);
        document.getElementById('typeFilter').addEventListener('change', filterScenarios);
        document.getElementById('searchBox').addEventListener('input', filterScenarios);
        renderScenarios(SCENARIOS);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('已生成 index.html');
console.log('文件大小:', (fs.statSync(path.join(__dirname, 'index.html')).size / 1024).toFixed(1), 'KB');
