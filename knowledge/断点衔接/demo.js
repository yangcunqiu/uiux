/* 断点的衔接演示 */
(function () {
  'use strict';

  var INNER = [
    '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>',
    '  body { margin:0; font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; background:#f6f6f8; color:#222; line-height:1.6; }',
    '  section { margin:16px; }',
    '  .label { font-size:12px; color:#999; letter-spacing:.5px; margin:14px 16px 0; }',
    '  .demo { background:#fff; border:1px solid #e2e2e8; border-radius:12px; margin-top:6px; }',
    '  .inner { overflow:hidden; }',
    '  .hero h1 { margin:6px 0 4px; font-weight:600; }',
    '  .hero .lead { margin:0; color:#777; }',
    '  .cards { display:flex; flex-wrap:wrap; margin-top:14px; }',
    '  .card { background:#f7f7fa; border:1px solid #e6e6ec; border-radius:10px; flex:1 1 160px; }',
    '  .card h4 { margin:0 0 2px; font-size:14px; }',
    '  .card p { margin:0; font-size:12px; color:#8a8a92; }',
    '  /* ① 步进版：桌面档＝1280 的校准值，从 960 用到底 */',
    '  .step .inner { padding:40px; }',
    '  .step .hero h1 { font-size:40px; }',
    '  .step .hero .lead { font-size:16px; }',
    '  .step .cards { gap:24px; }',
    '  .step .card { padding:18px; }',
    '  @media (max-width:959.5px) {',
    '    .step .inner { padding:20px; }',
    '    .step .hero h1 { font-size:24px; }',
    '    .step .hero .lead { font-size:14px; }',
    '    .step .cards { gap:12px; }',
    '    .step .card { padding:12px; flex:1 1 120px; }',
    '  }',
    '  /* ② 插值版：每个属性在 960 与 1280 的校准值之间线性流动 */',
    '  .fluid .inner { padding:clamp(24px, 5vw - 24px, 40px); }',
    '  .fluid .hero h1 { font-size:clamp(28px, 3.75vw - 8px, 40px); }',
    '  .fluid .hero .lead { font-size:clamp(15px, 0.3125vw + 12px, 16px); }',
    '  .fluid .cards { gap:clamp(16px, 2.5vw - 8px, 24px); }',
    '  .fluid .card { padding:clamp(14px, 1.25vw + 2px, 18px); }',
    '  @media (max-width:959.5px) {',
    '    .fluid .inner { padding:20px; }',
    '    .fluid .hero h1 { font-size:24px; }',
    '    .fluid .hero .lead { font-size:14px; }',
    '    .fluid .cards { gap:12px; }',
    '    .fluid .card { padding:12px; flex:1 1 120px; }',
    '  }',
    '  /* ③ 结构断点：列数跳变，与上面两版无关 */',
    '  .struct .inner { padding:20px; }',
    '  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }',
    '  .grid .card { flex:none; padding:12px; }',
    '  @media (min-width:1120px) { .grid { grid-template-columns:repeat(4,1fr); } }',
    '</style></head><body>',
    '<section class="step">',
    '  <p class="label">① 步进版 · 960 外一档到底（桌面档＝1280 的校准值）</p>',
    '  <div class="demo"><div class="inner">',
    '    <div class="hero"><h1>示例区块标题</h1><p class="lead">这一档的字号与间距按 1280px 校准，从 960px 起用到底。</p></div>',
    '    <div class="cards">',
    '      <div class="card"><h4>卡片一</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片二</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片三</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片四</h4><p>说明文字</p></div>',
    '    </div>',
    '  </div></div>',
    '</section>',
    '<section class="fluid">',
    '  <p class="label">② 插值版 · 960→1280 之间线性流动</p>',
    '  <div class="demo"><div class="inner">',
    '    <div class="hero"><h1>示例区块标题</h1><p class="lead">每个属性在两个校准点之间随宽度线性变化。</p></div>',
    '    <div class="cards">',
    '      <div class="card"><h4>卡片一</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片二</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片三</h4><p>说明文字</p></div>',
    '      <div class="card"><h4>卡片四</h4><p>说明文字</p></div>',
    '    </div>',
    '  </div></div>',
    '</section>',
    '<section class="struct">',
    '  <p class="label">③ 结构断点（独立区块，不属于①②）· 1120 处 3↔4 列</p>',
    '  <div class="demo"><div class="inner">',
    '    <div class="grid">',
    '      <div class="card"><h4>甲</h4><p>列数不能插值</p></div>',
    '      <div class="card"><h4>乙</h4><p>列数不能插值</p></div>',
    '      <div class="card"><h4>丙</h4><p>列数不能插值</p></div>',
    '      <div class="card"><h4>丁</h4><p>列数不能插值</p></div>',
    '      <div class="card"><h4>戊</h4><p>跳变是设计切换</p></div>',
    '      <div class="card"><h4>己</h4><p>跳变是设计切换</p></div>',
    '      <div class="card"><h4>庚</h4><p>跳变是设计切换</p></div>',
    '      <div class="card"><h4>辛</h4><p>跳变是设计切换</p></div>',
    '    </div>',
    '  </div></div>',
    '</section>',
    '</body></html>'
  ].join('');

  var frame = document.getElementById('frame');
  var wInput = document.getElementById('w');
  var wv = document.getElementById('wv');
  var rangeinfo = document.getElementById('rangeinfo');

  frame.srcdoc = INNER;

  function apply() {
    var w = parseInt(wInput.value, 10);
    frame.style.width = w + 'px';
    frame.style.height = '1000px';
    wv.textContent = w + 'px';
    if (w < 960) {
      rangeinfo.textContent = '低于 960：两个版都在手机档——断点之前它们相同。';
    } else if (w < 1280) {
      rangeinfo.textContent = '在 960 与 1280 之间：步进版显示 1280 的校准值；插值版显示按当前宽度内插的值。';
    } else {
      rangeinfo.textContent = '≥1280：两个版相同（都到满档校准值）——差异只在 960–1280 这个区间里。';
    }
  }
  wInput.addEventListener('input', apply);
  apply();
})();
