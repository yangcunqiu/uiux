/* 接缝对照演示（依据讨论结论重构） */
(function () {
  'use strict';

  /* ---------- 1. 时序接缝：生成 → 拖动 ---------- */
  var stage1 = document.getElementById('stage1');
  var card1 = document.getElementById('card1');
  var play1 = document.getElementById('play1');
  var seamAligned = document.getElementById('seam-aligned');
  var seamGap = document.getElementById('seam-gap');
  var mode1 = 'aligned'; // aligned | gap
  var x1 = 20, y1 = 60;
  var dragging1 = false, grabX = 0, grabY = 0;
  var dragEnabled = false, genBusy = false;

  function setPos1() {
    card1.style.transform = 'translate(' + x1 + 'px, ' + y1 + 'px)';
  }
  function clamp1() {
    var w = stage1.clientWidth - card1.offsetWidth;
    var h = stage1.clientHeight - card1.offsetHeight;
    x1 = Math.max(0, Math.min(w, x1));
    y1 = Math.max(0, Math.min(h, y1));
  }
  function playGen1() {
    if (genBusy) return;
    genBusy = true;
    dragEnabled = false;
    card1.style.transition = 'none';
    x1 = 20; y1 = 130; setPos1(); // 起点：舞台左下（略沉出下边界）
    void stage1.offsetWidth;
    card1.style.transition = 'transform .7s cubic-bezier(.2,.7,.3,1)';
    x1 = 120; y1 = 40; setPos1(); // 终点：舞台中上
    setTimeout(function () {
      card1.style.transition = 'none';
      if (mode1 === 'gap') { x1 += 28; setPos1(); } // 交接点错位：可见的一跳
      dragEnabled = true;
      genBusy = false;
    }, 720);
  }
  function onDown1(e) {
    if (!dragEnabled) return;
    dragging1 = true;
    grabX = e.clientX - x1;
    grabY = e.clientY - y1;
    card1.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onMove1(e) {
    if (!dragging1) return;
    x1 = e.clientX - grabX;
    y1 = e.clientY - grabY;
    clamp1();
    setPos1();
  }
  function onUp1() {
    dragging1 = false;
  }
  card1.addEventListener('pointerdown', onDown1);
  card1.addEventListener('pointermove', onMove1);
  card1.addEventListener('pointerup', onUp1);
  card1.addEventListener('pointercancel', onUp1);

  function setMode1(m) {
    mode1 = m;
    seamAligned.setAttribute('aria-pressed', m === 'aligned' ? 'true' : 'false');
    seamGap.setAttribute('aria-pressed', m === 'gap' ? 'true' : 'false');
  }
  seamAligned.addEventListener('click', function () { setMode1('aligned'); });
  seamGap.addEventListener('click', function () { setMode1('gap'); });
  play1.addEventListener('click', playGen1);

  stage1.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!dragEnabled) return;
    e.preventDefault();
    x1 += (e.key === 'ArrowLeft' ? -24 : 24);
    clamp1();
    card1.style.transition = 'transform .16s ease-out';
    setPos1();
    setTimeout(function () { card1.style.transition = 'none'; }, 180);
  });

  x1 = 20; y1 = 60;
  setPos1();

  /* ---------- 2. 看不见的接缝：出画传送 ---------- */
  var stage2 = document.getElementById('stage2');
  var card2 = document.getElementById('card2');
  var play2 = document.getElementById('play2');
  var modeIn = document.getElementById('mode-in');
  var modeOut = document.getElementById('mode-out');
  var mode2 = 'in'; // in | out
  var busy2 = false;

  function setMode2(m) {
    mode2 = m;
    modeIn.setAttribute('aria-pressed', m === 'in' ? 'true' : 'false');
    modeOut.setAttribute('aria-pressed', m === 'out' ? 'true' : 'false');
  }
  modeIn.addEventListener('click', function () { setMode2('in'); });
  modeOut.addEventListener('click', function () { setMode2('out'); });

  card2.style.transform = 'translate(40px, 50px)';

  function playCross() {
    if (busy2) return;
    busy2 = true;
    var w = stage2.clientWidth;
    var cw = card2.offsetWidth;
    var startX = 40;
    var restX = w - cw - 40;
    var exitX = (mode2 === 'in') ? -60 : (-cw - 30); // 画内：还留一截可见；出画：完全离场
    card2.style.transition = 'none';
    card2.style.transform = 'translate(' + startX + 'px, 50px)';
    void stage2.offsetWidth;
    card2.style.transition = 'transform .6s ease-in';
    card2.style.transform = 'translate(' + exitX + 'px, 50px)';
    setTimeout(function () {
      // 传送（瞬间）：发生的位置由模式决定
      card2.style.transition = 'none';
      card2.style.transform = 'translate(' + (w + 20) + 'px, 50px)';
      void stage2.offsetWidth;
      card2.style.transition = 'transform .6s ease-out';
      card2.style.transform = 'translate(' + restX + 'px, 50px)';
      setTimeout(function () { busy2 = false; }, 640);
    }, 640);
  }
  play2.addEventListener('click', playCross);
})();
