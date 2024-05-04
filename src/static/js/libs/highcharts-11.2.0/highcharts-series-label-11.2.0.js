/**
 * Highcharts JS v11.2.0 (2023-10-30)
 *
 * (c) 2009-2021 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */ !(function (t) {
  "object" == typeof module && module.exports
    ? ((t.default = t), (module.exports = t))
    : "function" == typeof define && define.amd
    ? define("highcharts/modules/series-label", ["highcharts"], function (e) {
        return t(e), (t.Highcharts = e), t;
      })
    : t("undefined" != typeof Highcharts ? Highcharts : void 0);
})(function (t) {
  "use strict";
  var e = t ? t._modules : {};
  function o(t, e, o, r) {
    t.hasOwnProperty(e) ||
      ((t[e] = r.apply(null, o)),
      "function" == typeof CustomEvent &&
        window.dispatchEvent(
          new CustomEvent("HighchartsModuleLoaded", {
            detail: { path: e, module: t[e] },
          })
        ));
  }
  o(e, "Extensions/SeriesLabel/SeriesLabelDefaults.js", [], function () {
    return {
      enabled: !0,
      connectorAllowed: !1,
      connectorNeighbourDistance: 24,
      format: void 0,
      formatter: void 0,
      minFontSize: null,
      maxFontSize: null,
      onArea: null,
      style: { fontSize: "0.8em", fontWeight: "bold" },
      useHTML: !1,
      boxesToAvoid: [],
    };
  }),
    o(e, "Extensions/SeriesLabel/SeriesLabelUtilities.js", [], function () {
      function t(t, e, o, r, i, a) {
        let n = (a - e) * (o - t) - (r - e) * (i - t);
        return n > 0 || !(n < 0);
      }
      function e(e, o, r, i, a, n, s, h) {
        return (
          t(e, o, a, n, s, h) !== t(r, i, a, n, s, h) &&
          t(e, o, r, i, a, n) !== t(e, o, r, i, s, h)
        );
      }
      return {
        boxIntersectLine: function (t, o, r, i, a, n, s, h) {
          return (
            e(t, o, t + r, o, a, n, s, h) ||
            e(t + r, o, t + r, o + i, a, n, s, h) ||
            e(t, o + i, t + r, o + i, a, n, s, h) ||
            e(t, o, t, o + i, a, n, s, h)
          );
        },
        intersectRect: function (t, e) {
          return !(
            e.left > t.right ||
            e.right < t.left ||
            e.top > t.bottom ||
            e.bottom < t.top
          );
        },
      };
    }),
    o(
      e,
      "Extensions/SeriesLabel/SeriesLabel.js",
      [
        e["Core/Animation/AnimationUtilities.js"],
        e["Core/Chart/Chart.js"],
        e["Core/Templating.js"],
        e["Core/Defaults.js"],
        e["Extensions/SeriesLabel/SeriesLabelDefaults.js"],
        e["Extensions/SeriesLabel/SeriesLabelUtilities.js"],
        e["Core/Utilities.js"],
      ],
      function (t, e, o, r, i, a, n) {
        let { animObject: s } = t,
          { format: h } = o,
          { setOptions: l } = r,
          { boxIntersectLine: c, intersectRect: p } = a,
          {
            addEvent: u,
            extend: d,
            fireEvent: f,
            isNumber: x,
            pick: b,
            syncTimeout: m,
          } = n,
          g = [];
        function y(t, e, o, r, i) {
          let a = t.chart,
            n = t.options.label || {},
            s = b(n.onArea, !!t.area),
            h = s || n.connectorAllowed,
            l = a.boxesToAvoid,
            u = Number.MAX_VALUE,
            d = Number.MAX_VALUE,
            f,
            x,
            m,
            g,
            y,
            X,
            M;
          for (X = 0; l && X < l.length; X += 1)
            if (
              p(l[X], {
                left: e,
                right: e + r.width,
                top: o,
                bottom: o + r.height,
              })
            )
              return !1;
          for (X = 0; X < a.series.length; X += 1) {
            let l = a.series[X],
              p = l.interpolatedPoints && [...l.interpolatedPoints];
            if (l.visible && p) {
              let b = a.plotHeight / 10;
              for (let t = a.plotTop; t <= a.plotTop + a.plotHeight; t += b)
                p.unshift({ chartX: a.plotLeft, chartY: t }),
                  p.push({ chartX: a.plotLeft + a.plotWidth, chartY: t });
              for (M = 1; M < p.length; M += 1) {
                if (
                  p[M].chartX >= e - 16 &&
                  p[M - 1].chartX <= e + r.width + 16
                ) {
                  if (
                    c(
                      e,
                      o,
                      r.width,
                      r.height,
                      p[M - 1].chartX,
                      p[M - 1].chartY,
                      p[M].chartX,
                      p[M].chartY
                    )
                  )
                    return !1;
                  t === l &&
                    !m &&
                    i &&
                    (m = c(
                      e - 16,
                      o - 16,
                      r.width + 32,
                      r.height + 32,
                      p[M - 1].chartX,
                      p[M - 1].chartY,
                      p[M].chartX,
                      p[M].chartY
                    ));
                }
                (h || m) &&
                  (t !== l || s) &&
                  (u = Math.min(
                    u,
                    (g = e + r.width / 2 - p[M].chartX) * g +
                      (y = o + r.height / 2 - p[M].chartY) * y
                  ));
              }
              if (
                !s &&
                h &&
                t === l &&
                ((i && !m) ||
                  u < Math.pow(n.connectorNeighbourDistance || 1, 2))
              ) {
                for (M = 1; M < p.length; M += 1)
                  (f = Math.min(
                    Math.pow(e + r.width / 2 - p[M].chartX, 2) +
                      Math.pow(o + r.height / 2 - p[M].chartY, 2),
                    Math.pow(e - p[M].chartX, 2) + Math.pow(o - p[M].chartY, 2),
                    Math.pow(e + r.width - p[M].chartX, 2) +
                      Math.pow(o - p[M].chartY, 2),
                    Math.pow(e + r.width - p[M].chartX, 2) +
                      Math.pow(o + r.height - p[M].chartY, 2),
                    Math.pow(e - p[M].chartX, 2) +
                      Math.pow(o + r.height - p[M].chartY, 2)
                  )) < d && ((d = f), (x = p[M]));
                m = !0;
              }
            }
          }
          return (
            (!i || !!m) && {
              x: e,
              y: o,
              weight: u - (x ? d : 0),
              connectorPoint: x,
            }
          );
        }
        function X(t) {
          if (this.renderer) {
            let e = this,
              o = s(e.renderer.globalAnimation).duration;
            (e.labelSeries = []),
              (e.labelSeriesMaxSum = 0),
              e.seriesLabelTimer && n.clearTimeout(e.seriesLabelTimer),
              e.series.forEach(function (r) {
                let i = r.options.label || {},
                  a = r.labelBySeries,
                  n = a && a.closest;
                i.enabled &&
                  r.visible &&
                  (r.graph || r.area) &&
                  !r.boosted &&
                  e.labelSeries &&
                  (e.labelSeries.push(r),
                  i.minFontSize &&
                    i.maxFontSize &&
                    r.yData &&
                    ((r.sum = r.yData.reduce((t, e) => (t || 0) + (e || 0), 0)),
                    (e.labelSeriesMaxSum = Math.max(
                      e.labelSeriesMaxSum || 0,
                      r.sum || 0
                    ))),
                  "load" === t.type &&
                    (o = Math.max(o, s(r.options.animation).duration)),
                  n &&
                    (void 0 !== n[0].plotX
                      ? a.animate({
                          x: n[0].plotX + n[1],
                          y: n[0].plotY + n[2],
                        })
                      : a.attr({ opacity: 0 })));
              }),
              (e.seriesLabelTimer = m(
                function () {
                  e.series &&
                    e.labelSeries &&
                    (function (t) {
                      t.boxesToAvoid = [];
                      let e = t.labelSeries || [],
                        o = t.boxesToAvoid;
                      t.series.forEach((t) =>
                        (t.points || []).forEach((e) =>
                          (e.dataLabels || []).forEach((e) => {
                            let { width: r, height: i } = e.getBBox(),
                              a =
                                (e.translateX || 0) +
                                (t.xAxis ? t.xAxis.pos : t.chart.plotLeft),
                              n =
                                (e.translateY || 0) +
                                (t.yAxis ? t.yAxis.pos : t.chart.plotTop);
                            o.push({
                              left: a,
                              top: n,
                              right: a + r,
                              bottom: n + i,
                            });
                          })
                        )
                      ),
                        e.forEach(function (t) {
                          let e = t.options.label || {};
                          (t.interpolatedPoints = (function (t) {
                            let e, o, r, i, a;
                            if (!t.xAxis && !t.yAxis) return;
                            let n = t.points,
                              s = [],
                              h = t.graph || t.area,
                              l = h && h.element,
                              c = t.chart.inverted,
                              p = t.xAxis,
                              u = t.yAxis,
                              d = c ? u.pos : p.pos,
                              f = c ? p.pos : u.pos,
                              m = t.options.label || {},
                              g = b(m.onArea, !!t.area),
                              y = u.getThreshold(t.options.threshold),
                              X = {};
                            function M(t) {
                              let e =
                                Math.round((t.plotX || 0) / 8) +
                                "," +
                                Math.round((t.plotY || 0) / 8);
                              X[e] || ((X[e] = 1), s.push(t));
                            }
                            if (
                              t.getPointSpline &&
                              l &&
                              l.getPointAtLength &&
                              !g &&
                              n.length < (t.chart.plotSizeX || 0) / 16
                            ) {
                              let t = h.toD && h.attr("d");
                              for (
                                h.toD && h.attr({ d: h.toD }),
                                  r = l.getTotalLength(),
                                  e = 0;
                                e < r;
                                e += 16
                              ) {
                                let t = l.getPointAtLength(e);
                                M({
                                  chartX: d + t.x,
                                  chartY: f + t.y,
                                  plotX: t.x,
                                  plotY: t.y,
                                });
                              }
                              t && h.attr({ d: t });
                              let o = n[n.length - 1];
                              M({
                                chartX: d + (o.plotX || 0),
                                chartY: f + (o.plotY || 0),
                              });
                            } else {
                              let t;
                              for (e = 0, r = n.length; e < r; e += 1) {
                                let r = n[e],
                                  { plotX: s, plotY: h, plotHigh: l } = r;
                                if (x(s) && x(h)) {
                                  let e = {
                                    plotX: s,
                                    plotY: h,
                                    chartX: d + s,
                                    chartY: f + h,
                                  };
                                  if (
                                    (g &&
                                      (l && ((e.plotY = l), (e.chartY = f + l)),
                                      (e.chartCenterY =
                                        f + ((l || h) + b(r.yBottom, y)) / 2)),
                                    t &&
                                      (o = Math.max(
                                        Math.abs(e.chartX - t.chartX),
                                        Math.abs(e.chartY - t.chartY)
                                      )) > 16)
                                  )
                                    for (
                                      a = 1, i = Math.ceil(o / 16);
                                      a < i;
                                      a += 1
                                    )
                                      M({
                                        chartX:
                                          t.chartX +
                                          (e.chartX - t.chartX) * (a / i),
                                        chartY:
                                          t.chartY +
                                          (e.chartY - t.chartY) * (a / i),
                                        chartCenterY:
                                          (t.chartCenterY || 0) +
                                          ((e.chartCenterY || 0) -
                                            (t.chartCenterY || 0)) *
                                            (a / i),
                                        plotX:
                                          (t.plotX || 0) +
                                          (s - (t.plotX || 0)) * (a / i),
                                        plotY:
                                          (t.plotY || 0) +
                                          (h - (t.plotY || 0)) * (a / i),
                                      });
                                  M(e), (t = e);
                                }
                              }
                            }
                            return s;
                          })(t)),
                            o.push(...(e.boxesToAvoid || []));
                        }),
                        t.series.forEach(function (e) {
                          let o = e.options.label;
                          if (!o || (!e.xAxis && !e.yAxis)) return;
                          let r = "highcharts-color-" + b(e.colorIndex, "none"),
                            i = !e.labelBySeries,
                            a = o.minFontSize,
                            n = o.maxFontSize,
                            l = t.inverted,
                            c = l ? e.yAxis.pos : e.xAxis.pos,
                            p = l ? e.xAxis.pos : e.yAxis.pos,
                            u = t.inverted ? e.yAxis.len : e.xAxis.len,
                            f = t.inverted ? e.xAxis.len : e.yAxis.len,
                            x = e.interpolatedPoints,
                            m = b(o.onArea, !!e.area),
                            g = [],
                            X = e.xData || [],
                            M,
                            S,
                            Y,
                            w,
                            A,
                            L,
                            v = e.labelBySeries,
                            E,
                            C,
                            T;
                          function P(t, e, o) {
                            let r = Math.max(c, b(C, -1 / 0)),
                              i = Math.min(c + u, b(T, 1 / 0));
                            return (
                              t > r &&
                              t <= i - o.width &&
                              e >= p &&
                              e <= p + f - o.height
                            );
                          }
                          function j() {
                            v && (e.labelBySeries = v.destroy());
                          }
                          if (
                            (m &&
                              !l &&
                              ((E = [
                                e.xAxis.toPixels(X[0]),
                                e.xAxis.toPixels(X[X.length - 1]),
                              ]),
                              (C = Math.min.apply(Math, E)),
                              (T = Math.max.apply(Math, E))),
                            e.visible && !e.boosted && x)
                          ) {
                            if (!v) {
                              let i = e.name;
                              if (
                                ("string" == typeof o.format
                                  ? (i = h(o.format, e, t))
                                  : o.formatter && (i = o.formatter.call(e)),
                                (e.labelBySeries = v =
                                  t.renderer
                                    .label(
                                      i,
                                      0,
                                      0,
                                      "connector",
                                      0,
                                      0,
                                      o.useHTML
                                    )
                                    .addClass(
                                      "highcharts-series-label highcharts-series-label-" +
                                        e.index +
                                        " " +
                                        (e.options.className || "") +
                                        " " +
                                        r
                                    )),
                                !t.renderer.styledMode)
                              ) {
                                let r =
                                  "string" == typeof e.color
                                    ? e.color
                                    : "#666666";
                                v.css(
                                  d(
                                    {
                                      color: m ? t.renderer.getContrast(r) : r,
                                    },
                                    o.style || {}
                                  )
                                ),
                                  v.attr({
                                    opacity: t.renderer.forExport ? 1 : 0,
                                    stroke: e.color,
                                    "stroke-width": 1,
                                  });
                              }
                              a &&
                                n &&
                                v.css({
                                  fontSize:
                                    a +
                                    ((e.sum || 0) /
                                      (e.chart.labelSeriesMaxSum || 0)) *
                                      (n - a) +
                                    "px",
                                }),
                                v.attr({ padding: 0, zIndex: 3 }).add();
                            }
                            for (
                              (M = v.getBBox()).width = Math.round(M.width),
                                A = x.length - 1;
                              A > 0;
                              A -= 1
                            )
                              m
                                ? P(
                                    (S = x[A].chartX - M.width / 2),
                                    (Y =
                                      (x[A].chartCenterY || 0) - M.height / 2),
                                    M
                                  ) && (L = y(e, S, Y, M))
                                : (P(
                                    (S = x[A].chartX + 3),
                                    (Y = x[A].chartY - M.height - 3),
                                    M
                                  ) && (L = y(e, S, Y, M, !0)),
                                  L && g.push(L),
                                  P(
                                    (S = x[A].chartX + 3),
                                    (Y = x[A].chartY + 3),
                                    M
                                  ) && (L = y(e, S, Y, M, !0)),
                                  L && g.push(L),
                                  P(
                                    (S = x[A].chartX - M.width - 3),
                                    (Y = x[A].chartY + 3),
                                    M
                                  ) && (L = y(e, S, Y, M, !0)),
                                  L && g.push(L),
                                  P(
                                    (S = x[A].chartX - M.width - 3),
                                    (Y = x[A].chartY - M.height - 3),
                                    M
                                  ) && (L = y(e, S, Y, M, !0))),
                                L && g.push(L);
                            if (o.connectorAllowed && !g.length && !m)
                              for (S = c + u - M.width; S >= c; S -= 16)
                                for (Y = p; Y < p + f - M.height; Y += 16)
                                  (w = y(e, S, Y, M, !0)) && g.push(w);
                            if (g.length) {
                              g.sort((t, e) => e.weight - t.weight),
                                (L = g[0]),
                                (t.boxesToAvoid || []).push({
                                  left: L.x,
                                  right: L.x + M.width,
                                  top: L.y,
                                  bottom: L.y + M.height,
                                });
                              let o = Math.sqrt(
                                Math.pow(Math.abs(L.x - (v.x || 0)), 2) +
                                  Math.pow(Math.abs(L.y - (v.y || 0)), 2)
                              );
                              if (o && e.labelBySeries) {
                                let r,
                                  a = {
                                    opacity: t.renderer.forExport ? 1 : 0,
                                    x: L.x,
                                    y: L.y,
                                  },
                                  n = { opacity: 1 };
                                o <= 10 && ((n = { x: a.x, y: a.y }), (a = {})),
                                  i &&
                                    ((r = s(e.options.animation)),
                                    (r.duration *= 0.2)),
                                  e.labelBySeries
                                    .attr(
                                      d(a, {
                                        anchorX:
                                          L.connectorPoint &&
                                          (L.connectorPoint.plotX || 0) + c,
                                        anchorY:
                                          L.connectorPoint &&
                                          (L.connectorPoint.plotY || 0) + p,
                                      })
                                    )
                                    .animate(n, r),
                                  (e.options.kdNow = !0),
                                  e.buildKDTree();
                                let h = e.searchPoint(
                                  { chartX: L.x, chartY: L.y },
                                  !0
                                );
                                h &&
                                  (v.closest = [
                                    h,
                                    L.x - (h.plotX || 0),
                                    L.y - (h.plotY || 0),
                                  ]);
                              }
                            } else j();
                          } else j();
                        }),
                        f(t, "afterDrawSeriesLabels");
                    })(e);
                },
                e.renderer.forExport || !o ? 0 : o
              ));
          }
        }
        function M(t, e, o, r, i) {
          let a = i && i.anchorX,
            n = i && i.anchorY,
            s,
            h,
            l = o / 2;
          return (
            x(a) &&
              x(n) &&
              ((s = [["M", a, n]]),
              (h = e - n) < 0 && (h = -r - h),
              h < o && (l = a < t + o / 2 ? h : o - h),
              n > e + r
                ? s.push(["L", t + l, e + r])
                : n < e
                ? s.push(["L", t + l, e])
                : a < t
                ? s.push(["L", t, e + r / 2])
                : a > t + o && s.push(["L", t + o, e + r / 2])),
            s || []
          );
        }
        return {
          compose: function (t, o) {
            n.pushUnique(g, t) && (u(e, "load", X), u(e, "redraw", X)),
              n.pushUnique(g, o) && (o.prototype.symbols.connector = M),
              n.pushUnique(g, l) &&
                l({ plotOptions: { series: { label: i } } });
          },
        };
      }
    ),
    o(
      e,
      "masters/modules/series-label.src.js",
      [e["Core/Globals.js"], e["Extensions/SeriesLabel/SeriesLabel.js"]],
      function (t, e) {
        e.compose(t.Chart, t.SVGRenderer);
      }
    );
}); //# sourceMappingURL=series-label.js.map
