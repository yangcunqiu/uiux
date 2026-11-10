/*
 * 弹簧与指标计算。
 * 与页面分离，便于在 Node 里单独验证数值行为，也便于以后改参数模型。
 * 纯函数，无 DOM 依赖。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Motion = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * 用「跟随时间」和「阻尼比」描述弹簧，而不是直接暴露 stiffness / damping。
   * visualDuration 是自然周期（秒）：越小越硬、越跟手。
   * dampingRatio：1 为临界阻尼（不过冲），小于 1 会回弹。
   */
  function springParams(visualDuration, dampingRatio, mass) {
    var m = Number.isFinite(mass) && mass > 0 ? mass : 1;
    var period = Math.max(0.01, Number(visualDuration) || 0.12);
    var omega = (2 * Math.PI) / period;
    var stiffness = omega * omega * m;
    var damping = 2 * dampingRatio * Math.sqrt(stiffness * m);
    return { stiffness: stiffness, damping: damping, mass: m };
  }

  function createSpring(x) {
    return { x: Number.isFinite(x) ? x : 0, v: 0 };
  }

  /*
   * 半隐式欧拉 + 固定子步。dt 来自 rAF，可能抖动或过长，
   * 子步进保证刚度很大时也不会发散。
   */
  function advance(spring, target, p, dt, maxStep) {
    var step = Number.isFinite(maxStep) && maxStep > 0 ? maxStep : 1 / 240;
    var remain = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
    while (remain > 1e-6) {
      var h = Math.min(step, remain);
      var accel = (-p.stiffness * (spring.x - target) - p.damping * spring.v) / p.mass;
      spring.v += accel * h;
      spring.x += spring.v * h;
      remain -= h;
    }
    if (!Number.isFinite(spring.x) || !Number.isFinite(spring.v)) {
      spring.x = Number.isFinite(target) ? target : 0;
      spring.v = 0;
    }
    return spring;
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function mean(list) {
    if (!list.length) return 0;
    var sum = 0;
    for (var i = 0; i < list.length; i += 1) sum += list[i];
    return sum / list.length;
  }

  function stdDev(list) {
    if (list.length < 2) return 0;
    var m = mean(list);
    var sum = 0;
    for (var i = 0; i < list.length; i += 1) {
      var d = list[i] - m;
      sum += d * d;
    }
    return Math.sqrt(sum / list.length);
  }

  /*
   * 毛刺度：位置序列的二阶差分的均方根，单位是 px。
   * 匀速运动时接近 0；忽快忽慢、来回抖动时变大。
   * 它只看轨迹本身平不平，不看落点准不准，也不看快慢——那是另外两件事。
   * 注意：二阶差分对采样间隔敏感，这里假设每帧一个采样。
   */
  function roughness(list) {
    if (list.length < 3) return 0;
    var sum = 0;
    var n = 0;
    for (var i = 1; i < list.length - 1; i += 1) {
      var second = list[i] - (list[i - 1] + list[i + 1]) / 2;
      sum += second * second;
      n += 1;
    }
    return n ? Math.sqrt(sum / n) : 0;
  }

  return {
    springParams: springParams,
    createSpring: createSpring,
    advance: advance,
    clamp: clamp,
    mean: mean,
    stdDev: stdDev,
    roughness: roughness
  };
});
