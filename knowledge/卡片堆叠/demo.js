/* 卡片堆叠对照演示（依据原文文字描述的原则重构，不是复刻） */
(function () {
  'use strict';

  /* 减少动态效果偏好 */
  var rmMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var rmEl = document.getElementById('rm');
  if (rmEl && rmMq && rmMq.matches) rmEl.style.display = 'block';

  /* ---------- 第 1 部分：换位编排 ---------- */
  var s1 = document.getElementById('s1');
  var stage1 = document.getElementById('stage1');
  var cards1 = Array.prototype.slice.call(stage1.querySelectorAll('.card'));
  var note1 = document.getElementById('note1');
  var mode1 = 'nocho';
  var busy1 = false;
  var order1 = [0, 1, 2, 3]; // order1[k] = 处在第 k 槽位的卡片下标
  var slots1 = [
    { x: 0,   s: 1.00, z: 40, o: 1 },
    { x: 112, s: 0.90, z: 30, o: 1 },
    { x: 184, s: 0.81, z: 20, o: 0.9 },
    { x: 240, s: 0.72, z: 10, o: 0.75 }
  ];

  function place1(cardIdx, slot, keepZ, y) {
    var c = cards1[cardIdx];
    var sl = slots1[slot];
    if (!keepZ) c.style.zIndex = sl.z;
    c.style.opacity = sl.o;
    c.style.transform = 'translateX(' + sl.x + 'px) translateY(' + (y || 0) + 'px) scale(' + sl.s + ')';
  }
  function render1() {
    order1.forEach(function (cardIdx, slot) { place1(cardIdx, slot, false, 0); });
  }
  render1();

  function setTrans1(cardIdx, value) { cards1[cardIdx].style.transition = value; }
  function clearTrans1() { cards1.forEach(function (c) { c.style.transition = ''; }); }

  function advance1() {
    if (busy1) return;
    busy1 = true;
    var departing = order1[0];
    var staying = order1.slice(1);
    order1 = staying.concat([departing]);

    if (mode1 === 'nocho') {
      // 同时换位：所有卡一起动；深度关系整场冻结，落位后才改判
      cards1.forEach(function (c, i) {
        setTrans1(i, 'transform .5s cubic-bezier(.2,.7,.3,1), opacity .5s');
      });
      staying.forEach(function (ci, k) { place1(ci, k, true, 0); });
      place1(departing, 3, true, 0);
      setTimeout(function () { render1(); clearTrans1(); busy1 = false; }, 520);
    } else {
      // 先腾位（修正版）：
      // 1) 离场卡抬起——上方永远无人，抬起即离开共享平面
      // 2) 抬着越过队列，绕到队尾右侧的无人区
      // 3) 在无人区下降；z 不能过渡，但无人处换深度不可见
      // 4) 以最底层深度从右侧滑回，可见地插到最后一张卡后面
      // 期间其余卡在离场卡抬起后才开始补位（先腾位，再进驻）
      var d = cards1[departing];
      var CLEAR_X = 410; // 队尾右侧无人区（补位后最右占用卡右缘约 404）
      function setD(x, y, s) {
        d.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) scale(' + s + ')';
      }
      d.style.opacity = slots1[3].o;
      d.style.zIndex = 50;
      setTrans1(departing, 'transform .16s ease-out, opacity .3s');
      setD(0, -58, 1);
      setTimeout(function () {
        setTrans1(departing, 'transform .27s ease-in-out');
        setD(CLEAR_X, -58, 0.9);
        staying.forEach(function (ci, k) {
          setTrans1(ci, 'transform .32s cubic-bezier(.2,.7,.3,1) ' + (0.04 * k) + 's, opacity .32s');
          place1(ci, k, true, 0);
        });
      }, 170);
      setTimeout(function () {
        setTrans1(departing, 'transform .18s ease-out');
        setD(CLEAR_X, 0, 0.72);
      }, 440);
      setTimeout(function () {
        d.style.zIndex = 10; // 无人区：换深度不可见
        setTrans1(departing, 'transform .3s cubic-bezier(.2,.7,.3,1)');
        setD(slots1[3].x, 0, slots1[3].s);
      }, 630);
      setTimeout(function () { render1(); clearTrans1(); busy1 = false; }, 950);
    }
  }

  var mode1btns = s1.querySelectorAll('.mode1');
  Array.prototype.forEach.call(mode1btns, function (b) {
    b.addEventListener('click', function () {
      mode1 = b.getAttribute('data-mode');
      Array.prototype.forEach.call(mode1btns, function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      note1.textContent = (mode1 === 'nocho')
        ? '观察「缺编排」：离场卡与进场卡在中间地带同时在场、互不让路，深度关系整场不变——看它读不读得出「穿过」。'
        : '观察「先腾位（修正版）」：抬起 → 抬着绕过队尾 → 无人区下降并换到最底层 → 以底层深度从右侧插回队尾。深度改判只发生在无人区；穿过别人的路要么抬着（离开平面），要么用目标深度（去底层就从底下过）。代价是总时长更长。';
    });
  });
  document.getElementById('next1').addEventListener('click', advance1);
  document.getElementById('reset1').addEventListener('click', function () {
    if (busy1) return;
    order1 = [0, 1, 2, 3];
    clearTrans1();
    render1();
  });
  s1.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); advance1(); }
  });

  /* ---------- 第 2 部分：入场语义 ---------- */
  var stage2 = document.getElementById('stage2');
  var top2 = document.getElementById('top2');
  var cover2 = document.getElementById('cover2');
  var gen2 = document.getElementById('gen2');
  var note2 = document.getElementById('note2');
  var dotws = Array.prototype.slice.call(top2.querySelectorAll('.dotw'));
  var t2h = document.getElementById('t2h');
  var t2p = document.getElementById('t2p');
  var timer2 = null, interval2 = null, nudgeTimer2 = null;
  var activeTop = null;
  var ready2At = 0;

  var dotDepth = [0.9, 0.55, 0.3, 0.45, 0.7, 0.25];
  var dotRot = [-14, 22, -8, 30, -24, 10];
  dotws.forEach(function (w, k) {
    var d = w.querySelector('.dot');
    d.dataset.depth = String(dotDepth[k]);
    d.style.setProperty('--rot', dotRot[k] + 'deg');
  });

  function reset2() {
    clearTimeout(timer2);
    clearTimeout(nudgeTimer2);
    clearInterval(interval2);
    cover2.style.display = 'none';
    gen2.style.display = 'none';
    gen2.style.opacity = '1';
    gen2.textContent = '正在生成';
    top2.style.display = 'none';
    top2.style.opacity = '0';
    top2.style.transform = 'translateY(160px)';
    dotws.forEach(function (w) {
      w.style.transition = 'none';
      w.style.opacity = '0';
      var lf = parseFloat(w.style.left);
      var tp = parseFloat(w.style.top);
      // 收拢起点：舞台底部中心（舞台中心 x=230、底部 y≈205；卡左 120、卡顶 24）
      w.style.transform = 'translateX(' + (230 - (120 + lf + 6)) + 'px) translateY(' + (205 - (24 + tp + 6)) + 'px) scale(.4)';
    });
    t2h.style.transition = 'none';
    t2p.style.transition = 'none';
    t2h.style.opacity = '0';
    t2h.style.transform = 'translateY(10px)';
    t2p.style.opacity = '0';
    t2p.style.transform = 'translateY(10px)';
    void stage2.offsetWidth; // 提交初始状态，保证后续过渡从起点开始
  }

  function play2v1(withGen) {
    reset2();
    top2.style.display = 'none';
    cover2.style.display = 'flex';
    gen2.style.display = withGen ? 'inline' : 'none';
    cover2.style.transition = 'none';
    cover2.style.transform = 'translateX(-430px)';
    cover2.style.opacity = '1';
    void stage2.offsetWidth;
    cover2.style.transition = 'transform .62s cubic-bezier(.2,.75,.25,1)';
    cover2.style.transform = 'translateX(0)';
    activeTop = cover2;
    ready2At = Date.now() + 700;
    note2.textContent = withGen
      ? 'v2 · 封面 + 生成文字（被否）：多了一段「正在生成」的表演，落位后仍然没有任何东西宣告「可以揭开」——分成两步没有必要，反而让事情复杂。'
      : 'v1 · 封面飘入（被否）：封面不含信息，像一个单纯的视觉过渡，没有表达「这是一张等待被揭开的卡片」。';
    if (withGen) {
      var n = 0;
      interval2 = setInterval(function () {
        n = (n + 1) % 4;
        gen2.textContent = '正在生成' + '...'.slice(0, n);
      }, 300);
      timer2 = setTimeout(function () {
        clearInterval(interval2);
        gen2.style.transition = 'opacity .4s';
        gen2.style.opacity = '0';
      }, 1900);
    }
  }

  function play2v3() {
    reset2();
    cover2.style.display = 'none';
    top2.style.display = '';
    top2.style.transition = 'none';
    void stage2.offsetWidth;
    top2.style.transition = 'transform .5s cubic-bezier(.2,.8,.3,1) .05s, opacity .5s .05s';
    top2.style.transform = 'translateY(0)';
    top2.style.opacity = '1';
    dotws.forEach(function (w, k) {
      var dly = 0.12 + 0.07 * k;
      w.style.transition = 'transform .6s cubic-bezier(.16,.8,.3,1) ' + dly + 's, opacity .6s ' + dly + 's';
      w.style.opacity = '1';
      w.style.transform = 'translateX(0) translateY(0) scale(1)';
    });
    t2h.style.transition = 'opacity .4s .3s, transform .4s .3s';
    t2h.style.opacity = '1';
    t2h.style.transform = 'translateY(0)';
    t2p.style.transition = 'opacity .4s .45s, transform .4s .45s';
    t2p.style.opacity = '1';
    t2p.style.transform = 'translateY(0)';
    activeTop = top2;
    ready2At = Date.now() + 950;
    note2.textContent = 'v3 · 氛围散开 + 文字揭开（上线）：入场元素与之后响应交互的是同一批——落位后拖动顶层卡（或按 ←/→），氛围元素改为左右响应：入场姿态把它们和交互接在了一起。';
  }

  var dragX = 0;
  var dragging2 = false;
  var startPX = 0;

  function applyDrag2(v) {
    if (!activeTop) return;
    activeTop.style.transform = 'translateX(' + v + 'px)';
    if (activeTop === top2) {
      dotws.forEach(function (w) {
        var d = w.querySelector('.dot');
        d.style.setProperty('--px', (v * parseFloat(d.dataset.depth)) + 'px');
      });
    }
  }

  function bindDrag2(el) {
    el.addEventListener('pointerdown', function (e) {
      if (!activeTop || Date.now() < ready2At) return;
      dragging2 = true;
      startPX = e.clientX - dragX;
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging2) return;
      dragX = Math.max(-80, Math.min(80, e.clientX - startPX));
      applyDrag2(dragX);
    });
    function end() {
      if (!dragging2) return;
      dragging2 = false;
      dragX = 0;
      el.style.transition = 'transform .28s cubic-bezier(.2,.8,.3,1)';
      applyDrag2(0);
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
  bindDrag2(cover2);
  bindDrag2(top2);

  stage2.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!activeTop || Date.now() < ready2At) return;
    e.preventDefault();
    var v = e.key === 'ArrowLeft' ? -40 : 40;
    activeTop.style.transition = 'transform .16s ease-out';
    applyDrag2(v);
    clearTimeout(nudgeTimer2);
    nudgeTimer2 = setTimeout(function () {
      activeTop.style.transition = 'transform .28s cubic-bezier(.2,.8,.3,1)';
      applyDrag2(0);
    }, 220);
  });

  Array.prototype.forEach.call(document.querySelectorAll('.v2btn'), function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-v');
      if (v === '1') play2v1(false);
      else if (v === '2') play2v1(true);
      else play2v3();
    });
  });
  reset2();

  /* ---------- 第 3 部分：hover 展开 ---------- */
  var stage3 = document.getElementById('stage3');
  var fanwrap = document.getElementById('fanwrap');
  var picks = Array.prototype.slice.call(fanwrap.querySelectorAll('.pick'));
  var status3 = document.getElementById('status3');
  var distBtn = document.getElementById('dist3');
  var measure = document.getElementById('measure');
  var fixedDist = false;
  var expanded3 = false;
  var mode3 = 'a';

  var modeText = {
    a: '模式 A：把指针停在顶部卡片右边缘约 40px 以内，或停在被位移露出的卡上——看「指针下是谁」怎么变、稳不稳。键盘焦点不会被位移甩掉：←/→ 移焦点对比。',
    b: '模式 B（修正）：扇区随状态变化——收起时只有卡片足迹算悬停，张开后才是整扇区；空白不再触发，振荡不再出现（锚定顶卡，动的只有下三层）。剩下的是代价不是缺陷：指针一进入就展开，路过也算数；展开瞬间指针下的卡可能换人。',
    c: '模式 C（对照，拣选主任务里不推荐）：hover 只描边，点击或 Enter 才展开——把一步加在主路径上。保留它只为对照付款表的另一端：当叠放不是主任务、路过多或展开会遮挡邻居时，"点击后展开"才划算。展开后点一张完成选择，Esc 收起。'
  };

  function setMode3(m) {
    mode3 = m;
    expanded3 = false;
    stage3.classList.remove('expanded');
    picks.forEach(function (p) { p.style.setProperty('--fx', '0px'); });
    stage3.className = 'stage mode-' + m;
    Array.prototype.forEach.call(document.querySelectorAll('.mode3'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false');
    });
    status3.textContent = modeText[m];
  }
  Array.prototype.forEach.call(document.querySelectorAll('.mode3'), function (b) {
    b.addEventListener('click', function () { setMode3(b.getAttribute('data-mode')); });
  });

  function fanXs(fixed) {
    var xs = [0];
    for (var i = 0; i < picks.length - 1; i++) {
      var w;
      if (fixed) {
        w = 64;
      } else {
        measure.textContent = picks[i].querySelector('h4').textContent;
        w = Math.max(64, measure.offsetWidth + 26);
      }
      xs.push(xs[i] + w);
    }
    return xs;
  }

  function expand3() {
    var xs = fanXs(fixedDist);
    picks.forEach(function (p, i) { p.style.setProperty('--fx', xs[i] + 'px'); });
    stage3.classList.add('expanded');
    expanded3 = true;
    status3.textContent = '已展开（' + (fixedDist ? '固定 64px' : '内容决定距离') + '）。哪一张你能不点开就认出？点一张完成选择，Esc 收起。';
  }
  function collapse3() {
    if (!expanded3) return;
    expanded3 = false;
    stage3.classList.remove('expanded');
    picks.forEach(function (p) { p.style.setProperty('--fx', '0px'); });
    status3.textContent = modeText[mode3];
  }

  picks.forEach(function (p) {
    p.addEventListener('click', function (e) {
      e.stopPropagation();
      var title = p.querySelector('h4').textContent;
      if (mode3 === 'c') {
        if (!expanded3) { expand3(); return; }
        status3.textContent = '已选：' + title;
        collapse3();
        return;
      }
      status3.textContent = '已选：' + title + '（A/B 模式里，你点的是位移当时露在你面前的卡。）';
    });
  });

  distBtn.addEventListener('click', function () {
    fixedDist = !fixedDist;
    distBtn.textContent = fixedDist ? '展开距离：固定 64px' : '展开距离：由内容决定';
    distBtn.setAttribute('aria-pressed', fixedDist ? 'true' : 'false');
    if (expanded3) expand3();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') collapse3();
  });
  stage3.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    var idx = picks.indexOf(document.activeElement);
    if (idx === -1) { picks[0].focus(); return; }
    var next = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
    if (next >= 0 && next < picks.length) picks[next].focus();
  });

  setMode3('a');
})();
