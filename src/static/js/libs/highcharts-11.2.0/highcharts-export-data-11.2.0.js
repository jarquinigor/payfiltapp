/**
 * Highcharts JS v11.2.0 (2023-10-30)
 *
 * Exporting module
 *
 * (c) 2010-2021 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */ !(function (e) {
  "object" == typeof module && module.exports
    ? ((e.default = e), (module.exports = e))
    : "function" == typeof define && define.amd
    ? define(
        "highcharts/modules/export-data",
        ["highcharts", "highcharts/modules/exporting"],
        function (t) {
          return e(t), (e.Highcharts = t), e;
        }
      )
    : e("undefined" != typeof Highcharts ? Highcharts : void 0);
})(function (e) {
  "use strict";
  var t = e ? e._modules : {};
  function a(e, t, a, o) {
    e.hasOwnProperty(t) ||
      ((e[t] = o.apply(null, a)),
      "function" == typeof CustomEvent &&
        window.dispatchEvent(
          new CustomEvent("HighchartsModuleLoaded", {
            detail: { path: t, module: e[t] },
          })
        ));
  }
  a(t, "Extensions/DownloadURL.js", [t["Core/Globals.js"]], function (e) {
    let {
        isSafari: t,
        win: a,
        win: { document: o },
      } = e,
      n = a.URL || a.webkitURL || a;
    function i(e) {
      let t = e
        .replace(/filename=.*;/, "")
        .match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
      if (
        t &&
        t.length > 3 &&
        a.atob &&
        a.ArrayBuffer &&
        a.Uint8Array &&
        a.Blob &&
        n.createObjectURL
      ) {
        let e = a.atob(t[3]),
          o = new a.ArrayBuffer(e.length),
          i = new a.Uint8Array(o);
        for (let t = 0; t < i.length; ++t) i[t] = e.charCodeAt(t);
        return n.createObjectURL(new a.Blob([i], { type: t[1] }));
      }
    }
    return {
      dataURLtoBlob: i,
      downloadURL: function (e, n) {
        let r = a.navigator,
          s = o.createElement("a");
        if (
          "string" != typeof e &&
          !(e instanceof String) &&
          r.msSaveOrOpenBlob
        ) {
          r.msSaveOrOpenBlob(e, n);
          return;
        }
        e = "" + e;
        let l = /Edge\/\d+/.test(r.userAgent),
          h =
            t &&
            "string" == typeof e &&
            0 === e.indexOf("data:application/pdf");
        if ((h || l || e.length > 2e6) && !(e = i(e) || ""))
          throw Error("Failed to convert to blob");
        if (void 0 !== s.download)
          (s.href = e),
            (s.download = n),
            o.body.appendChild(s),
            s.click(),
            o.body.removeChild(s);
        else
          try {
            if (!a.open(e, "chart")) throw Error("Failed to open window");
          } catch {
            a.location.href = e;
          }
      },
    };
  }),
    a(t, "Extensions/ExportData/ExportDataDefaults.js", [], function () {
      return {
        exporting: {
          csv: {
            annotations: { itemDelimiter: "; ", join: !1 },
            columnHeaderFormatter: null,
            dateFormat: "%Y-%m-%d %H:%M:%S",
            decimalPoint: null,
            itemDelimiter: null,
            lineDelimiter: "\n",
          },
          showTable: !1,
          useMultiLevelHeaders: !0,
          useRowspanHeaders: !0,
        },
        lang: {
          downloadCSV: "Download CSV",
          downloadXLS: "Download XLS",
          exportData: {
            annotationHeader: "Annotations",
            categoryHeader: "Category",
            categoryDatetimeHeader: "DateTime",
          },
          viewData: "View data table",
          hideData: "Hide data table",
        },
      };
    }),
    a(
      t,
      "Extensions/ExportData/ExportData.js",
      [
        t["Core/Renderer/HTML/AST.js"],
        t["Extensions/ExportData/ExportDataDefaults.js"],
        t["Core/Globals.js"],
        t["Core/Defaults.js"],
        t["Extensions/DownloadURL.js"],
        t["Core/Series/SeriesRegistry.js"],
        t["Core/Utilities.js"],
      ],
      function (e, t, a, o, n, i, r) {
        let { doc: s, win: l } = a,
          { getOptions: h, setOptions: c } = o,
          { downloadURL: d } = n,
          {
            series: p,
            seriesTypes: {
              arearange: u,
              gantt: m,
              map: f,
              mapbubble: x,
              treemap: g,
              xrange: b,
            },
          } = i,
          {
            addEvent: y,
            defined: D,
            extend: w,
            find: T,
            fireEvent: v,
            isNumber: E,
            pick: S,
          } = r,
          C = [];
        function L() {
          let e = this.getCSV(!0);
          d(
            V(e, "text/csv") || "data:text/csv,\uFEFF" + encodeURIComponent(e),
            this.getFilename() + ".csv"
          );
        }
        function U() {
          let e =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ark1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";} .text{ mso-number-format:"@";}</style><meta name=ProgId content=Excel.Sheet><meta charset=UTF-8></head><body>' +
            this.getTable(!0) +
            "</body></html>";
          d(
            V(e, "application/vnd.ms-excel") ||
              "data:application/vnd.ms-excel;base64," +
                l.btoa(unescape(encodeURIComponent(e))),
            this.getFilename() + ".xls"
          );
        }
        function A(e) {
          let t = "",
            a = this.getDataRows(),
            o = this.options.exporting.csv,
            n = S(
              o.decimalPoint,
              "," !== o.itemDelimiter && e ? (1.1).toLocaleString()[1] : "."
            ),
            i = S(o.itemDelimiter, "," === n ? ";" : ","),
            r = o.lineDelimiter;
          return (
            a.forEach((e, o) => {
              let s = "",
                l = e.length;
              for (; l--; )
                "string" == typeof (s = e[l]) && (s = `"${s}"`),
                  "number" == typeof s &&
                    "." !== n &&
                    (s = s.toString().replace(".", n)),
                  (e[l] = s);
              (e.length = a.length ? a[0].length : 0),
                (t += e.join(i)),
                o < a.length - 1 && (t += r);
            }),
            t
          );
        }
        function R(e) {
          let t, a;
          let o = this.hasParallelCoordinates,
            n = this.time,
            i = (this.options.exporting && this.options.exporting.csv) || {},
            r = this.xAxis,
            s = {},
            l = [],
            h = [],
            c = [],
            d = this.options.lang,
            u = d.exportData,
            m = u.categoryHeader,
            f = u.categoryDatetimeHeader,
            x = function (t, a, o) {
              if (i.columnHeaderFormatter) {
                let e = i.columnHeaderFormatter(t, a, o);
                if (!1 !== e) return e;
              }
              return t
                ? t instanceof p
                  ? e
                    ? {
                        columnTitle: o > 1 ? a : t.name,
                        topLevelColumnTitle: t.name,
                      }
                    : t.name + (o > 1 ? " (" + a + ")" : "")
                  : (t.options.title && t.options.title.text) ||
                    (t.dateTime ? f : m)
                : m;
            },
            g = function (e, t, a) {
              let o = {},
                n = {};
              return (
                t.forEach(function (t) {
                  let i = ((e.keyToAxis && e.keyToAxis[t]) || t) + "Axis",
                    r = E(a) ? e.chart[i][a] : e[i];
                  (o[t] = (r && r.categories) || []), (n[t] = r && r.dateTime);
                }),
                { categoryMap: o, dateTimeValueAxisMap: n }
              );
            },
            b = function (e, t) {
              let a = e.pointArrayMap || ["y"],
                o = e.data.some((e) => void 0 !== e.y && e.name);
              return o && t && !t.categories && "name" !== e.exportKey
                ? ["x", ...a]
                : a;
            },
            y = [],
            w,
            C,
            L,
            U = 0,
            A,
            R;
          for (A in (this.series.forEach(function (t) {
            let a = t.options.keys,
              l = t.xAxis,
              d = a || b(t, l),
              p = d.length,
              u = !t.requireSorting && {},
              m = r.indexOf(l),
              f = g(t, d),
              D,
              w;
            if (
              !1 !== t.options.includeInDataExport &&
              !t.options.isInternal &&
              !1 !== t.visible
            ) {
              for (
                T(y, function (e) {
                  return e[0] === m;
                }) || y.push([m, U]),
                  w = 0;
                w < p;

              )
                (L = x(t, d[w], d.length)),
                  c.push(L.columnTitle || L),
                  e && h.push(L.topLevelColumnTitle || L),
                  w++;
              (D = {
                chart: t.chart,
                autoIncrement: t.autoIncrement,
                options: t.options,
                pointArrayMap: t.pointArrayMap,
                index: t.index,
              }).index,
                t.options.data.forEach(function (e, a) {
                  let r, h, c;
                  let x = { series: D };
                  o && (f = g(t, d, a)),
                    t.pointClass.prototype.applyOptions.apply(x, [e]);
                  let b = t.data[a] && t.data[a].name;
                  if (
                    ((r = (x.x ?? "") + "," + b),
                    (w = 0),
                    (!l ||
                      "name" === t.exportKey ||
                      (!o && l && l.hasNames && b)) &&
                      (r = b),
                    u && (u[r] && (r += "|" + a), (u[r] = !0)),
                    s[r])
                  ) {
                    let e = `${r},${s[r].pointers[t.index]}`,
                      a = r;
                    s[r].pointers[t.index] &&
                      (s[e] ||
                        ((s[e] = []),
                        (s[e].xValues = []),
                        (s[e].pointers = [])),
                      (r = e)),
                      (s[a].pointers[t.index] += 1);
                  } else {
                    (s[r] = []), (s[r].xValues = []);
                    let e = [];
                    for (let a = 0; a < t.chart.series.length; a++) e[a] = 0;
                    (s[r].pointers = e), (s[r].pointers[t.index] = 1);
                  }
                  for (
                    s[r].x = x.x, s[r].name = b, s[r].xValues[m] = x.x;
                    w < p;

                  )
                    (c = x[(h = d[w])]),
                      (s[r][U + w] = S(
                        f.categoryMap[h][c],
                        f.dateTimeValueAxisMap[h]
                          ? n.dateFormat(i.dateFormat, c)
                          : null,
                        c
                      )),
                      w++;
                }),
                (U += w);
            }
          }),
          s))
            Object.hasOwnProperty.call(s, A) && l.push(s[A]);
          for (C = e ? [h, c] : [c], U = y.length; U--; )
            (t = y[U][0]),
              (a = y[U][1]),
              (w = r[t]),
              l.sort(function (e, a) {
                return e.xValues[t] - a.xValues[t];
              }),
              (R = x(w)),
              C[0].splice(a, 0, R),
              e && C[1] && C[1].splice(a, 0, R),
              l.forEach(function (e) {
                let t = e.name;
                w &&
                  !D(t) &&
                  (w.dateTime
                    ? (e.x instanceof Date && (e.x = e.x.getTime()),
                      (t = n.dateFormat(i.dateFormat, e.x)))
                    : (t = w.categories
                        ? S(w.names[e.x], w.categories[e.x], e.x)
                        : e.x)),
                  e.splice(a, 0, t);
              });
          return v(this, "exportData", { dataRows: (C = C.concat(l)) }), C;
        }
        function k(e) {
          let t = (e) => {
              if (!e.tagName || "#text" === e.tagName)
                return e.textContent || "";
              let a = e.attributes,
                o = `<${e.tagName}`;
              return (
                a &&
                  Object.keys(a).forEach((e) => {
                    let t = a[e];
                    o += ` ${e}="${t}"`;
                  }),
                (o += ">" + (e.textContent || "")),
                (e.children || []).forEach((e) => {
                  o += t(e);
                }),
                (o += `</${e.tagName}>`)
              );
            },
            a = this.getTableAST(e);
          return t(a);
        }
        function H(e) {
          let t = 0,
            a = [],
            o = this.options,
            n = e ? (1.1).toLocaleString()[1] : ".",
            i = S(o.exporting.useMultiLevelHeaders, !0),
            r = this.getDataRows(i),
            s = i ? r.shift() : null,
            l = r.shift(),
            h = function (e, t) {
              let a = e.length;
              if (t.length !== a) return !1;
              for (; a--; ) if (e[a] !== t[a]) return !1;
              return !0;
            },
            c = function (e, t, a, o) {
              let i = S(o, ""),
                r = "highcharts-text" + (t ? " " + t : "");
              return (
                "number" == typeof i
                  ? ((i = i.toString()),
                    "," === n && (i = i.replace(".", n)),
                    (r = "highcharts-number"))
                  : o || (r = "highcharts-empty"),
                {
                  tagName: e,
                  attributes: (a = w({ class: r }, a)),
                  textContent: i,
                }
              );
            };
          !1 !== o.exporting.tableCaption &&
            a.push({
              tagName: "caption",
              attributes: { class: "highcharts-table-caption" },
              textContent: S(
                o.exporting.tableCaption,
                o.title.text ? o.title.text : "Chart"
              ),
            });
          for (let e = 0, a = r.length; e < a; ++e)
            r[e].length > t && (t = r[e].length);
          a.push(
            (function (e, t, a) {
              let n = [],
                r = 0,
                s = a || (t && t.length),
                l,
                d = 0,
                p;
              if (i && e && t && !h(e, t)) {
                let a = [];
                for (; r < s; ++r)
                  if ((l = e[r]) === e[r + 1]) ++d;
                  else if (d)
                    a.push(
                      c(
                        "th",
                        "highcharts-table-topheading",
                        { scope: "col", colspan: d + 1 },
                        l
                      )
                    ),
                      (d = 0);
                  else {
                    l === t[r]
                      ? o.exporting.useRowspanHeaders
                        ? ((p = 2), delete t[r])
                        : ((p = 1), (t[r] = ""))
                      : (p = 1);
                    let e = c(
                      "th",
                      "highcharts-table-topheading",
                      { scope: "col" },
                      l
                    );
                    p > 1 &&
                      e.attributes &&
                      ((e.attributes.valign = "top"),
                      (e.attributes.rowspan = p)),
                      a.push(e);
                  }
                n.push({ tagName: "tr", children: a });
              }
              if (t) {
                let e = [];
                for (r = 0, s = t.length; r < s; ++r)
                  void 0 !== t[r] &&
                    e.push(c("th", null, { scope: "col" }, t[r]));
                n.push({ tagName: "tr", children: e });
              }
              return { tagName: "thead", children: n };
            })(s, l, Math.max(t, l.length))
          );
          let d = [];
          r.forEach(function (e) {
            let a = [];
            for (let o = 0; o < t; o++)
              a.push(c(o ? "td" : "th", null, o ? {} : { scope: "row" }, e[o]));
            d.push({ tagName: "tr", children: a });
          }),
            a.push({ tagName: "tbody", children: d });
          let p = {
            tree: {
              tagName: "table",
              id: `highcharts-data-table-${this.index}`,
              children: a,
            },
          };
          return v(this, "aftergetTableAST", p), p.tree;
        }
        function O() {
          this.toggleDataTable(!1);
        }
        function j(t) {
          t = S(t, !this.isDataTableVisible);
          let a = t && !this.dataTableDiv;
          if (
            (a &&
              ((this.dataTableDiv = s.createElement("div")),
              (this.dataTableDiv.className = "highcharts-data-table"),
              this.renderTo.parentNode.insertBefore(
                this.dataTableDiv,
                this.renderTo.nextSibling
              )),
            this.dataTableDiv)
          ) {
            let o = this.dataTableDiv.style,
              n = o.display;
            if (((o.display = t ? "block" : "none"), t)) {
              this.dataTableDiv.innerHTML = e.emptyHTML;
              let t = new e([this.getTableAST()]);
              t.addToDOM(this.dataTableDiv),
                v(this, "afterViewData", {
                  element: this.dataTableDiv,
                  wasHidden: a || n !== o.display,
                });
            } else v(this, "afterHideData");
          }
          this.isDataTableVisible = t;
          let o = this.exportDivElements,
            n = this.options.exporting,
            i = n && n.buttons && n.buttons.contextButton.menuItems,
            r = this.options.lang;
          if (
            n &&
            n.menuItemDefinitions &&
            r &&
            r.viewData &&
            r.hideData &&
            i &&
            o
          ) {
            let t = o[i.indexOf("viewData")];
            t &&
              e.setElementHTML(
                t,
                this.isDataTableVisible ? r.hideData : r.viewData
              );
          }
        }
        function N() {
          this.toggleDataTable(!0);
        }
        function V(e, t) {
          let a = l.navigator,
            o = l.URL || l.webkitURL || l;
          try {
            if (a.msSaveOrOpenBlob && l.MSBlobBuilder) {
              let t = new l.MSBlobBuilder();
              return t.append(e), t.getBlob("image/svg+xml");
            }
            return o.createObjectURL(new l.Blob(["\uFEFF" + e], { type: t }));
          } catch (e) {}
        }
        function B() {
          let e = this,
            t = e.dataTableDiv,
            a = (e, t) => e.children[t].textContent,
            o = (e, t) => (o, n) => {
              var i, r;
              return (
                (i = a(t ? o : n, e)),
                (r = a(t ? n : o, e)),
                "" === i || "" === r || isNaN(i) || isNaN(r)
                  ? i.toString().localeCompare(r)
                  : i - r
              );
            };
          if (
            t &&
            e.options.exporting &&
            e.options.exporting.allowTableSorting
          ) {
            let a = t.querySelector("thead tr");
            a &&
              a.childNodes.forEach((a) => {
                let n = a.closest("table");
                a.addEventListener("click", function () {
                  let i = [...t.querySelectorAll("tr:not(thead tr)")],
                    r = [...a.parentNode.children];
                  i
                    .sort(
                      o(
                        r.indexOf(a),
                        (e.ascendingOrderInTable = !e.ascendingOrderInTable)
                      )
                    )
                    .forEach((e) => {
                      n.appendChild(e);
                    }),
                    r.forEach((e) => {
                      [
                        "highcharts-sort-ascending",
                        "highcharts-sort-descending",
                      ].forEach((t) => {
                        e.classList.contains(t) && e.classList.remove(t);
                      });
                    }),
                    a.classList.add(
                      e.ascendingOrderInTable
                        ? "highcharts-sort-ascending"
                        : "highcharts-sort-descending"
                    );
                });
              });
          }
        }
        function F() {
          this.options &&
            this.options.exporting &&
            this.options.exporting.showTable &&
            !this.options.chart.forExport &&
            this.viewData();
        }
        return {
          compose: function (e) {
            if (r.pushUnique(C, e)) {
              y(e, "afterViewData", B), y(e, "render", F);
              let t = e.prototype;
              (t.downloadCSV = L),
                (t.downloadXLS = U),
                (t.getCSV = A),
                (t.getDataRows = R),
                (t.getTable = k),
                (t.getTableAST = H),
                (t.hideData = O),
                (t.toggleDataTable = j),
                (t.viewData = N);
            }
            if (r.pushUnique(C, c)) {
              let e = h().exporting;
              e &&
                (w(e.menuItemDefinitions, {
                  downloadCSV: {
                    textKey: "downloadCSV",
                    onclick: function () {
                      this.downloadCSV();
                    },
                  },
                  downloadXLS: {
                    textKey: "downloadXLS",
                    onclick: function () {
                      this.downloadXLS();
                    },
                  },
                  viewData: {
                    textKey: "viewData",
                    onclick: function () {
                      this.toggleDataTable();
                    },
                  },
                }),
                e.buttons &&
                  e.buttons.contextButton.menuItems &&
                  e.buttons.contextButton.menuItems.push(
                    "separator",
                    "downloadCSV",
                    "downloadXLS",
                    "viewData"
                  )),
                c(t);
            }
            u &&
              r.pushUnique(C, u) &&
              (u.prototype.keyToAxis = { low: "y", high: "y" }),
              m &&
                r.pushUnique(C, m) &&
                ((m.prototype.exportKey = "name"),
                (m.prototype.keyToAxis = { start: "x", end: "x" })),
              b && r.pushUnique(C, b) && (b.prototype.keyToAxis = { x2: "x" }),
              f && r.pushUnique(C, f) && (f.prototype.exportKey = "name"),
              x && r.pushUnique(C, x) && (x.prototype.exportKey = "name"),
              g && r.pushUnique(C, g) && (g.prototype.exportKey = "name");
          },
        };
      }
    ),
    a(
      t,
      "masters/modules/export-data.src.js",
      [
        t["Core/Globals.js"],
        t["Extensions/DownloadURL.js"],
        t["Extensions/ExportData/ExportData.js"],
      ],
      function (e, t, a) {
        (e.dataURLtoBlob = t.dataURLtoBlob),
          (e.downloadURL = t.downloadURL),
          a.compose(e.Chart);
      }
    );
}); //# sourceMappingURL=export-data.js.map
