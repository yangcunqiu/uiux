/* 回弹的边界：350px 审计演示 */
(function () {
  'use strict';

  var rmMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var rmEl = document.getElementById('rm');
  if (rmEl && rmMq && rmMq.matches) rmEl.style.display = 'block';

  var PITCH = 90;
  var DIST_TH = 350;
  var SPEED_TH = 1080;

  var tabrow = document.getElementById('tabrow');
  var tabwrap = document.getElementById('tabwrap');
  var tabs = Array.prototype.slice.call(tabrow.querySelectorAll('.tab'));
  var ind = document.getElementById('ind');
  var readout = document.getElementById('readout');
  var durBtns = Array.prototype.slice.call(document.querySelectorAll('.durbtn'));
  var ruleBtns = Array.prototype.slice.call(document.querySelectorAll('.rulebtn'));

  var duration = 250;
  var rule = 'dist';
  var idx = 0;
  var busy = false;
  var last = null;

  var RULE_NAME = {
    never: '从不回弹',
    always: '总是回弹',
    dist: '距离>350px',
    speed: '速度>1080px/s'
  };

  function setPressed(list, btn) {
    list.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }
  durBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      duration = parseInt(b.getAttribute('data-d'), 10);
      setPressed(durBtns, b);
    });
  });
  ruleBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      rule = b.getAttribute('data-rule');
      setPressed(ruleBtns, b);
    });
  });

  function decide(dist, speed, r) {
    if (r === 'never') return false;
    if (r === 'always') return true;
    if (r === 'dist') return dist > DIST_TH;
    return speed > SPEED_TH;
  }

  function go(j) {
    if (busy || j === idx) return;
    busy = true;
    var dist = Math.abs(j - idx) * PITCH;
    var speed = dist / (duration / 1000);
    var bounce = decide(dist, speed, rule);
    ind.style.transitionDuration = duration + 'ms';
    ind.style.transitionTimingFunction = bounce ? 'var(--ease-bounce)' : 'var(--ease-out)';
    ind.style.transform = 'translateX(' + (j * PITCH) + 'px)';
    tabs.forEach(function (t, i) {
      t.classList.toggle('active', i === j);
      t.setAttribute('aria-selected', i === j ? 'true' : 'false');
    });
    last = { dist: dist, dur: duration, speed: speed, bounce: bounce, ruleName: RULE_NAME[rule] };
    idx = j;
    refreshReadout();
    setTimeout(function () { busy = false; }, duration + 80);
  }

  function refreshReadout() {
    if (!last) return;
    var distB = last.dist > DIST_TH;
    var speedB = last.speed > SPEED_TH;
    readout.textContent =
      '距离 ' + last.dist + 'px · 时长 ' + last.dur + 'ms · 速度 ' + Math.round(last.speed) + 'px/s' +
      ' ｜ 距离规则:' + (distB ? '回弹' : '不回弹') +
      ' 速度规则:' + (speedB ? '回弹' : '不回弹') +
      ' ｜ 本次按【' + last.ruleName + '】' + (last.bounce ? '回弹' : '不回弹');
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(i); });
  });

  tabwrap.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    var cur = tabs.indexOf(document.activeElement);
    var next = e.key === 'ArrowRight' ? cur + 1 : cur - 1;
    if (cur === -1) next = 0;
    if (next >= 0 && next < tabs.length) tabs[next].focus();
  });
})();
