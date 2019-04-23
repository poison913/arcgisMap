 
define("esri/renderers/HeatmapRenderer","require dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/dom-construct ../sniff ../kernel ../lang ../symbols/PictureMarkerSymbol ../Color ./Renderer".split(" "), function (n, m, a, l, h, g, f, r, e, c) {
    n = n([c], {
        declaredClass: "esri.renderer.HeatmapRenderer",
        colors: null,
        blurRadius: 10,
        maxPixelIntensity: 100,
        minPixelIntensity: 0,
        field: null,
        fieldOffset: null,
        colorStops: null,
        constructor: function (a) {
            (this._supportsCanvas = window.CanvasRenderingContext2D ? !0 : !1) ? ("string" == typeof a && (a = JSON.parse(a)),
            m.mixin(this, a),
            this._canvas = null,
            this.colors || this.colorStops || (this.colorStops = [{
                ratio: 0,
                color: "rgba(255, 140, 0, 0)"
            }, {
                ratio: .75,
                color: "rgba(255, 140, 0, 1)"
            }, {
                ratio: .9,
                color: "rgba(255, 0,   0, 1)"
            }]),
            this.gradient = this._generateGradient(this.colorStops || this.colors)) : console.log("The HeatmapRenderer requires a Canvas enabled Browser.  IE8 and less does not support Canvas.")
        },
        getSymbol: function (a) {
            if (!this._supportsCanvas)
                return !1;
            var b = a.attributes.imageData;
            a = a.attributes.size;
            if (!a)
                return null;
            var c = this._getContext(a[0], a[1])
              , e = c.getImageData(0, 0, a[0], a[1]);
            window.ArrayBuffer && b instanceof ArrayBuffer ? b = window.Uint8ClampedArray ? new Uint8ClampedArray(b) : new Uint8Array(b) : b.BYTES_PER_ELEMENT && 1 !== b.BYTES_PER_ELEMENT && (b = window.Uint8ClampedArray ? new Uint8ClampedArray(b.buffer) : new Uint8Array(b.buffer));
            if (window.CanvasPixelArray && e.data instanceof window.CanvasPixelArray)
                for (var f = e.data, g = f.length; g--;)
                    f[g] = b[g];
            else
                e.data.set(b);
            c.putImageData(e, 0, 0);
            return new r(c.canvas.toDataURL(), a[0], a[1])
        },
        setColors: function (a) {
            a && (a instanceof Array || a.colors) && (this.gradient = this._generateGradient(a.colors || a),
            this.colors = a);
            return this
        },
        setColorStops: function (a) {
            a && (a instanceof Array || a.colorStops) && (this.gradient = this._generateGradient(a.colorStops || a),
            this.colorStops = a);
            return this
        },
        setMaxPixelIntensity: function (a) {
            this.maxPixelIntensity = a;
            return this
        },
        setMinPixelIntensity: function (a) {
            this.minPixelIntensity = a;
            return this
        },
        setField: function (a) {
            this.field = a;
            return this
        },
        setFieldOffset: function (a) {
            this.fieldOffset = a;
            return this
        },
        setBlurRadius: function (a) {
            this.blurRadius = a;
            return this
        },
        getStats: function () { },
        getHistogramData: function () { },
        toJson: function () {
            var b = m.mixin(this.inherited(arguments), {
                type: "heatmap",
                blurRadius: this.blurRadius,
                colorStops: this._colorsToStops(this.colorStops || this.colors),
                maxPixelIntensity: this.maxPixelIntensity,
                minPixelIntensity: this.minPixelIntensity,
                field: this.field
            });
            null != this.fieldOffset && (b.fieldOffset = this.fieldOffset);
            a.forEach(b.colorStops, function (a) {
                a.color = e.toJsonColor(a.color)
            });
            return f.fixJson(b)
        },
        _getContext: function (a, c) {
            this._canvas ? (this._canvas.width = a,
            this._canvas.height = c) : this._canvas = this._initCanvas(a, c);
            return this._canvas.getContext("2d")
        },
        _initCanvas: function (a, c) {
            var b = l.create("canvas", {
                id: "hm_canvas-" + Math.floor(1E3 * Math.random()),
                style: "position: absolute; left: 0px; top: -10000px;"
            }, null);
            b.width = a;
            b.height = c;
            document.body.appendChild(b);
            return b
        },
        _generateGradient: function (a, c) {
            c || (c = 512);
            for (var b = this._colorsToStops(a), d = this._getContext(1, c || 512), e = d.createLinearGradient(0, 0, 0, c), f = 0, g; f < b.length; f++)
                g = b[f],
                e.addColorStop(g.ratio, g.color.toCss(!0));
            d.fillStyle = e;
            d.fillRect(0, 0, 1, c);
            return d.getImageData(0, 0, 1, c).data
        },
        _colorsToStops: function (b) {
            var c = [];
            if (!b[0])
                return c;
            if (null != b[0].ratio)
                c = a.map(b, function (a) {
                    return {
                        ratio: a.ratio,
                        color: this._toColor(a.color)
                    }
                }, this);
            else if (null != b[0].value) {
                var e = Infinity, c = -Infinity, f = 0, g;
                for (g = 0; g < b.length; g++) {
                    var h = b[g].value;
                    h < e && (e = h);
                    h > c && (c = h)
                }
                f = c - e;
                this.maxPixelIntensity = c;
                this.minPixelIntensity = e;
                c = a.map(b, function (a) {
                    var b = a.value;
                    a = this._toColor(a.color);
                    return {
                        value: b,
                        ratio: (b - e) / f,
                        color: a
                    }
                }, this)
            } else
                var l = b.length - 1
                  , c = a.map(b, function (a, b) {
                      return {
                          color: this._toColor(a),
                          ratio: b / l
                      }
                  }, this);
            return c
        },
        _toColor: function (a) {
            a.toRgba || a.declaredClass || (a = new e(a));
            return a
        }
    });
    h("extend-esri") && m.setObject("renderer.HeatmapRenderer", n, g);
    return n
} ) 