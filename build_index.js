const fs = require('fs');

const dataJs = fs.readFileSync(__dirname + '/_scenarios_data.js', 'utf8');

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;color:#262626;font-size:14px}
.container{max-width:1400px;margin:0 auto;padding:24px}
.header{background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-radius:16px;padding:24px 32px;margin-bottom:24px;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
.header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.header-brand{display:flex;align-items:center;gap:16px}
.header-icon{width:56px;height:56px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px}
.header-title h1{font-size:24px;font-weight:700;color:#1a1a1a;margin-bottom:4px}
.header-title p{font-size:14px;color:#666}
.header-stats{display:flex;gap:32px}
.stat-card{text-align:center;padding:12px 24px;background:linear-gradient(135deg,#f5f7fa 0%,#fff 100%);border-radius:12px;min-width:100px}
.stat-value{font-size:32px;font-weight:700;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:13px;color:#666;margin-top:4px}
.filters{display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding-top:20px;border-top:1px solid #e8e8e8}
.filter-section{display:flex;flex-direction:column;gap:8px}
.filter-label{font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.5px}
.filter-options{display:flex;gap:8px;flex-wrap:wrap}
.filter-btn{padding:8px 16px;border:2px solid #e8e8e8;background:#fff;border-radius:8px;cursor:pointer;font-size:13px;color:#666;font-weight:500;transition:all 0.2s}
.filter-btn:hover{border-color:#667eea;color:#667eea}
.filter-btn.active{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(102,126,234,0.4)}
.search-box{margin-left:auto;position:relative}
.search-box input{width:280px;padding:12px 16px 12px 44px;border:2px solid #e8e8e8;border-radius:12px;font-size:14px;background:#fff;transition:all 0.2s}
.search-box input:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 4px rgba(102,126,234,0.1)}
.search-box::before{content:'';position:absolute;left:16px;top:50%;transform:translateY(-50%)}
.main{display:flex;gap:24px}
.sidebar{width:260px;flex-shrink:0}
.sidebar-card{background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-radius:16px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
.sidebar-title{font-size:14px;font-weight:600;color:#999;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px}
.dept-list{display:flex;flex-direction:column;gap:4px}
.dept-item{display:flex;align-items:center;padding:12px;border-radius:10px;cursor:pointer;transition:all 0.2s}
.dept-item:hover{background:#f5f7fa}
.dept-item.active{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.4)}
.dept-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;margin-right:12px;font-size:18px;background:rgba(0,0,0,0.05);border-radius:8px}
.dept-item.active .dept-icon{background:rgba(255,255,255,0.2)}
.dept-info{flex:1}
.dept-name{font-size:14px;font-weight:500}
.dept-count{font-size:12px;color:#999;margin-top:2px}
.dept-item.active .dept-count{color:rgba(255,255,255,0.8)}
.content{flex:1}
.content-card{background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-radius:16px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
.content-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.content-title{font-size:18px;font-weight:600}
.content-count{font-size:14px;color:#666}
.content-count span{color:#667eea;font-weight:600}
.scenario-list{display:flex;flex-direction:column;gap:16px}
.scenario-card{background:#fff;border:2px solid #f0f0f0;border-radius:12px;padding:20px;transition:all 0.2s}
.scenario-card:hover{border-color:#667eea;box-shadow:0 4px 20px rgba(102,126,234,0.15)}
.scenario-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.scenario-title{font-size:16px;font-weight:600;color:#1a1a1a;flex:1;min-width:200px}
.scenario-tags{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.tag{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
.tag-platform{background:#e6f7ff;color:#1890ff}
.tag-model{background:#f6ffed;color:#52c41a}
.tag-type-hot{background:linear-gradient(135deg,#ff4d4f 0%,#ff7875 100%);color:#fff}
.tag-type-fast{background:linear-gradient(135deg,#fa8c16 0%,#ffc53d 100%);color:#fff}
.tag-type-potential{background:linear-gradient(135deg,#722ed1 0%,#b37feb 100%);color:#fff}
.scenario-desc{color:#666;font-size:14px;line-height:1.6;margin-bottom:16px}
.value-props{display:flex;gap:20px;padding:16px;background:linear-gradient(135deg,#f5f7fa 0%,#fff 100%);border-radius:10px;margin-bottom:16px;flex-wrap:wrap}
.value-item{display:flex;align-items:center;gap:8px;font-size:13px}
.value-icon{font-size:18px}
.value-text{color:#666}
.value-highlight{background:linear-gradient(135deg,#52c41a 0%,#95de64 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:600}
.sop-section{border-top:1px solid #f0f0f0;padding-top:16px}
.sop-header{display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none}
.sop-title{font-size:13px;font-weight:600;color:#667eea;display:flex;align-items:center;gap:8px}
.sop-toggle{font-size:12px;color:#999;display:flex;align-items:center;gap:4px}
.sop-content{display:none;margin-top:16px;padding:20px;background:#fafafa;border-radius:10px}
.sop-content.show{display:block}
.sop-step{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
.sop-step:last-child{margin-bottom:0}
.sop-step-num{width:28px;height:28px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0}
.sop-step-text{flex:1;padding-top:4px;color:#666;font-size:13px;line-height:1.6}
.empty-state{text-align:center;padding:60px;color:#999}
.empty-state .icon{font-size:64px;margin-bottom:16px}
.empty-state h3{font-size:18px;margin-bottom:8px;color:#666}
.empty-state p{font-size:14px}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#d9d9d9;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#bfbfbf}`;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>跨境电商RPA场景库 - 216个自动化机会点</title>
<style>${css}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-top">
      <div class="header-brand">
        <div class="header-icon">🚀</div>
        <div class="header-title">
          <h1>跨境电商RPA场景库</h1>
          <p id="subtitle">加载中...</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-card"><div class="stat-value" id="statCount">--</div><div class="stat-label">场景总数</div></div>
        <div class="stat-card"><div class="stat-value" id="statPlat">--</div><div class="stat-label">覆盖平台</div></div>
        <div class="stat-card"><div class="stat-value">2-4h</div><div class="stat-label">日均节省</div></div>
      </div>
    </div>
    <div class="filters">
      <div class="filter-section">
        <div class="filter-label">平台筛选</div>
        <div class="filter-options" id="platformFilters"></div>
      </div>
      <div class="filter-section">
        <div class="filter-label">业务模式</div>
        <div class="filter-options" id="modelFilters"></div>
      </div>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="搜索场景名称、关键词..." autocomplete="off">
      </div>
    </div>
  </div>
  <div class="main">
    <div class="sidebar">
      <div class="sidebar-card">
        <div class="sidebar-title">部门导航</div>
        <div class="dept-list" id="deptSidebar"></div>
      </div>
    </div>
    <div class="content">
      <div class="content-card">
        <div class="content-header">
          <div class="content-title" id="contentTitle">全部场景</div>
          <div class="content-count">共 <span id="contentCount">--</span> 个场景</div>
        </div>
        <div class="scenario-list" id="scenarioList"></div>
        <div class="empty-state" id="emptyState" style="display:none">
          <div class="icon">🔎</div>
          <h3>没有找到匹配的场景</h3>
          <p>试试调整筛选条件或搜索关键词</p>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
// ===== 数据 =====
${dataJs}

// ===== 常量 =====
var DEPTS=[
  {name:"全部",icon:"🏢"},
  {name:"运营",icon:"📈"},
  {name:"财务",icon:"💰"},
  {name:"供应链",icon:"📦"},
  {name:"客服",icon:"💬"},
  {name:"人事",icon:"👥"},
  {name:"管理",icon:"⚙️"},
  {name:"合规",icon:"🛡️"},
  {name:"技术",icon:"🔧"}
];
var PLATFORMS=["全部","亚马逊","Temu","Shein","TikTok","沃尔玛","eBay","速卖通","Shopee","Lazada","美客多","Allegro","OZON","通用"];
var MODELS=["全部","品牌型","精品型","精铺型","铺货型","通用"];

// ===== 状态 =====
var activeDept="全部",activePlatform="全部",activeModel="全部",searchKeyword="";

// ===== 工具函数 =====
function esc(s){
  if(!s)return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== 渲染 =====
function render(){
  var filtered=SCENARIOS.filter(function(s){
    if(activeDept!=="全部"&&s.dept!==activeDept)return false;
    if(activePlatform!=="全部"&&s.platform!==activePlatform)return false;
    if(activeModel!=="全部"&&s.model!==activeModel)return false;
    if(searchKeyword){
      var kw=searchKeyword.toLowerCase();
      var hay=[
        s.name||'',
        s.desc||'',
        s.platform||'',
        s.model||'',
        s.dept||'',
        (Array.isArray(s.sop)?s.sop.join(' '):String(s.sop||'')).toLowerCase()
      ];
      var found=false;
      for(var i=0;i<hay.length;i++){
        if(hay[i].indexOf(kw)!==-1){found=true;break;}
      }
      if(!found)return false;
    }
    return true;
  });
  document.getElementById('statCount').textContent=filtered.length;
  document.getElementById('statPlat').textContent=Object.keys(filtered.reduce(function(acc,s){
    acc[s.platform]=true;return acc;
  },{})).length;
  document.getElementById('contentCount').textContent=filtered.length;
  document.getElementById('contentTitle').textContent=activeDept==="全部"?"全部场景":activeDept+"场景";
  var listEl=document.getElementById('scenarioList');
  var emptyEl=document.getElementById('emptyState');
  if(filtered.length===0){
    listEl.innerHTML='';
    emptyEl.style.display='block';
    return;
  }
  emptyEl.style.display='none';
  var html='';
  for(var i=0;i<filtered.length;i++){
    html+=renderCard(filtered[i],i);
  }
  listEl.innerHTML=html;
}

function renderCard(s){
  var typeClass=s.type==='hot'?'tag-type-hot':s.type==='fast'?'tag-type-fast':'tag-type-potential';
  var typeText=s.type==='hot'?'🔥高频刚需':s.type==='fast'?'⚡提效显著':'🌱潜力场景';
  var sopStr=Array.isArray(s.sop)?s.sop.join(' → '):String(s.sop||'');
  var sopSteps=sopStr.split('→').map(function(x){return x.trim();}).filter(function(x){return x;});
  var sopHtml='';
  for(var i=0;i<sopSteps.length;i++){
    sopHtml+='<div class="sop-step"><div class="sop-step-num">'+(i+1)+'</div><div class="sop-step-text">'+esc(sopSteps[i])+'</div></div>';
  }
  var valHtml='';
  if(s.saveTime) valHtml+='<div class="value-item"><span class="value-icon">⏱️</span><span class="value-text">'+esc(s.saveTime)+'</span></div>';
  if(s.saveCost) valHtml+='<div class="value-item"><span class="value-icon">💰</span><span class="value-highlight">'+esc(s.saveCost)+'</span></div>';
  if(s.efficiency) valHtml+='<div class="value-item"><span class="value-icon">📈</span><span class="value-highlight">'+esc(s.efficiency)+'</span></div>';

  var idx=renderCard._idx++;
  var cardId='sop-'+idx;
  var arrowId='arrow-'+idx;
  var labelId='label-'+idx;

  return '<div class="scenario-card">'+
    '<div class="scenario-header">'+
      '<div class="scenario-title">'+esc(s.name)+'</div>'+
      '<div class="scenario-tags">'+
        '<span class="tag tag-platform">'+esc(s.platform)+'</span>'+
        '<span class="tag tag-model">'+esc(s.model)+'</span>'+
        '<span class="tag '+typeClass+'">'+typeText+'</span>'+
      '</div>'+
    '</div>'+
    '<div class="scenario-desc">'+esc(s.desc)+'</div>'+
    '<div class="value-props">'+valHtml+'</div>'+
    '<div class="sop-section">'+
      '<div class="sop-header" onclick="toggleSop(\''+cardId+'\',\''+arrowId+'\',\''+labelId+'\')">'+
        '<div class="sop-title">📋 查看实现步骤 (SOP)</div>'+
        '<div class="sop-toggle"><span id="'+labelId+'">展开</span> <span id="'+arrowId+'">▼</span></div>'+
      '</div>'+
      '<div class="sop-content" id="'+cardId+'">'+sopHtml+'</div>'+
    '</div>'+
  '</div>';
}
renderCard._idx=0;

function toggleSop(cardId,arrowId,labelId){
  var c=document.getElementById(cardId);
  var a=document.getElementById(arrowId);
  var l=document.getElementById(labelId);
  var show=c.classList.toggle('show');
  a.textContent=show?'▲':'▼';
  l.textContent=show?'收起':'展开';
}

function renderSidebar(){
  var cnt={};
  for(var i=0;i<DEPTS.length;i++)cnt[DEPTS[i].name]=0;
  for(var i=0;i<SCENARIOS.length;i++){
    var d=SCENARIOS[i].dept;
    if(cnt[d]!==undefined)cnt[d]++;
  }
  cnt["全部"]=SCENARIOS.length;
  var html='';
  for(var i=0;i<DEPTS.length;i++){
    var d=DEPTS[i];
    var active=d.name===activeDept?' active':'';
    html+='<div class="dept-item'+active+'" onclick="setDept(\''+d.name+'\')">'+
      '<div class="dept-icon">'+d.icon+'</div>'+
      '<div class="dept-info">'+
        '<div class="dept-name">'+d.name+'</div>'+
        '<div class="dept-count">'+cnt[d.name]+' 个场景</div>'+
      '</div>'+
    '</div>';
  }
  document.getElementById('deptSidebar').innerHTML=html;
}

function renderFilters(){
  var pHtml='';
  for(var i=0;i<PLATFORMS.length;i++){
    var p=PLATFORMS[i];
    pHtml+='<button class="filter-btn'+(p===activePlatform?' active':'')+'" onclick="setPlatform(\''+p+'\')">'+p+'</button>';
  }
  document.getElementById('platformFilters').innerHTML=pHtml;

  var mHtml='';
  for(var i=0;i<MODELS.length;i++){
    var m=MODELS[i];
    mHtml+='<button class="filter-btn'+(m===activeModel?' active':'')+'" onclick="setModel(\''+m+'\')">'+m+'</button>';
  }
  document.getElementById('modelFilters').innerHTML=mHtml;
}

function setDept(d){activeDept=d;renderSidebar();render();}
function setPlatform(p){activePlatform=p;renderFilters();render();}
function setModel(m){activeModel=m;renderFilters();render();}

document.getElementById('searchInput').addEventListener('input',function(e){
  searchKeyword=e.target.value.trim();
  render();
});

// ===== 初始化 =====
document.getElementById('subtitle').textContent=SCENARIOS.length+'个自动化机会点 · '+
  Object.keys(SCENARIOS.reduce(function(acc,s){acc[s.platform]=true;return acc;},{})).length+'个平台 · '+(DEPTS.length-1)+'大部门';
renderSidebar();
renderFilters();
render();
<\/script>
</body>
</html>`;

fs.writeFileSync(__dirname + '/index.html', html, 'utf8');
console.log('Done! HTML size:', html.length, 'bytes');
console.log('SCENARIOS count:', JSON.parse(dataJs.replace('const SCENARIOS = ','').replace(/;$/,'')).length);
