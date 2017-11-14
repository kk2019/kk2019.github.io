//version:33d651 date:20151202:1449049718241
var __extends = this && this.__extends ||
function(t, e) {
    function i() {
        this.constructor = t
    }
    for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
    t.prototype = null === e ? Object.create(e) : (i.prototype = e.prototype, new i)
},
meiriq; !
function(t) {
    var e = function() {
        function e() {}
        return Object.defineProperty(e.prototype, "width", {
            get: function() {
                return this._width
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "height", {
            get: function() {
                return this._height
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "shortEdge", {
            get: function() {
                return this._shortEdge
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "longEdge", {
            get: function() {
                return this._longEdge
            },
            enumerable: !0,
            configurable: !0
        }),
        e.prototype.init = function(t, e, n) {
            var s = this;
            void 0 === t && (t = 480),
            void 0 === e && (e = 800),
            void 0 === n && (n = {}),
            this._width = this._shortEdge = t,
            this._height = this._longEdge = e,
            this._maxwidth = n.maxwidth,
            this._maxheight = n.maxheight,
            this._orient_hoz = n.orient_hoz;
            var o = t / e;
            t > e && (this._shortEdge = e, this._longEdge = t, this._height = e, this._width = this._height / o),
            "undefined" != typeof window && (this._contentstrategy = new i(i.FIX_SIZE), egret.setTimeout(function() {
                window.onresize = function() {
                    s.onResize()
                }
            },
            this, 10), this.onResize())
        },
        e.prototype.onResize = function() {
            var e = egret.StageDelegate.getInstance();
            e._designWidth = this._orient_hoz ? this._longEdge: this._shortEdge,
            e._designHeight = this._orient_hoz ? this._shortEdge: this._longEdge;
            var i = new egret.EqualToFrame,
            n = new egret.ResolutionPolicy(i, this._contentstrategy);
            e._setResolutionPolicy(n),
            t.stage().dispatchEventWith(egret.Event.RESIZE),
            t.context().rendererContext.onResize(),
            egret.RenderFilter.getInstance()._defaultDrawAreaList = null,
            this._resizeTimer = null
        },
        Object.defineProperty(e, "instance", {
            get: function() {
                return null == this._instance && (this._instance = new e),
                this._instance
            },
            enumerable: !0,
            configurable: !0
        }),
        e
    } ();
    t.StageResizeP = e;
    var i = function(e) {
        function i(t) {
            void 0 === t && (t = i.FIX_HEIGHT),
            e.call(this),
            this.tmp = {},
            this.mode = t
        }
        return __extends(i, e),
        i.prototype._apply = function(e, n, s) {
            var o = t.domWidth(),
            h = t.domHeight(),
            r = o / h,
            a = n / s,
            c = o,
            g = h,
            d = g / s > c / n ? c / n: g / s,
            l = n,
            u = s;
            switch (this.mode) {
            default:
            case i.FIX_SIZE:
                r >= a ? l = u * r: u = l / r;
                break;
            case i.FIX_SCREEN:
                u = h,
                l = o;
                break;
            case i.FIX_HEIGHT:
                throw new Error("dont use this mode!")
            }
            var m = document.getElementById(egret.StageDelegate.canvas_name);
            m.parentElement.style.width = o + "px",
            m.parentElement.style.height = h + "px",
            m.parentElement.style.top = "0",
            m.parentElement.parentElement && (m.parentElement.parentElement.style.width = o + "px", m.parentElement.parentElement.style.height = h + "px", m.parentElement.parentElement.style.top = "0"),
            m.style.width = o + "px",
            m.style.height = h + "px",
            m.setAttribute("width", l),
            m.setAttribute("height", u);
            var c = l * d,
            g = u * d,
            p = 1;
            Math.floor((o - c) / 2);
            e._offSetY = Math.floor((h - g) / 2),
            this.setEgretSize(l, u),
            e._scaleX = d * p,
            e._scaleY = d * p
        },
        i.prototype.setEgretSize = function(t, e) {
            egret.StageDelegate.getInstance()._stageWidth = Math.round(t),
            egret.StageDelegate.getInstance()._stageHeight = Math.round(e),
            egret.MainContext.instance.stage._stageWidth = t,
            egret.MainContext.instance.stage._stageHeight = e
        },
        i.FIX_SCREEN = "FullScreenEx0",
        i.FIX_SIZE = "FullScreenEx1",
        i.FIX_WIDTH = "FullScreenEx2",
        i.FIX_HEIGHT = "FullScreenEx3",
        i
    } (egret.ContentStrategy)
} (meiriq || (meiriq = {}));
var meiriq; !
function(t) {
    var e = {
        LOADING_CONTENT: "resource/assets/common2015/mrq_icon_loading.png",
        LOADING_LOGO: "resource/assets/common2015/mrq_copyright_r.png"
    },
    i = {
        ORIENT_HOZ: "resource/assets/common2015/mrq_orient2hoz.png",
        ORIENT_VERT: "resource/assets/common2015/mrq_orient2vert.png",
        OVER_WIN: "resource/assets/common2015/over-win-shine.png",
        OVER_LOSE: "resource/assets/common2015/over-lose.png",
        OVER_BTN_RESTART: "resource/assets/common2015/over-btn-replay.png",
        OVER_BTN_MORE: "resource/assets/common2015/over-btn-more.png",
        OVER_BTN_SHARE: "resource/assets/common2015/over-btn-share.png",
        OVER_BTN_RANK: "resource/assets/common2015/over-btn-rank.png",
        SHARE_IMG: "resource/assets/common2015/share.png",
        LEVEL_WIN: "resource/assets/common2015/over-win-shine.png",
        LEVEL_BTN_NEXT: "resource/assets/common2015/over-btn-next.png"
    },
    n = {
        TYPE_IMAGE: "resource/assets/common2015/over_number.png",
        TYPE_FONT: "resource/assets/common2015/over_number.fnt"
    },
    s = {},
    o = null,
    h = "@config",
    r = function() {
        function t() {}
        return t.home = "home",
        t.pause = "pause",
        t.resume = "resume",
        t.orientStart = "orientStart",
        t.orientPause = "orientPause",
        t.orientResume = "orientResume",
        t
    } ();
    t.InterFace = r;
    var a = function() {
        function t() {}
        return t.start = "start",
        t.gameover = "gameover",
        t.levelwin = "levelwin",
        t.share = "share",
        t.more = "more",
        t.restart = "restart",
        t
    } ();
    t.Hook = a;
    var c = function() {
        function o() {
            var t = this;
            return this._opt = {
                check_orient: !1,
                orient_hoz: !1
            },
            this.onfinshload = function() {},
            this.startcb = {
                restart: function() {},
                levelnext: function() {}
            },
            this.exehook = {
                finishload: function() {
                    egret.setTimeout(function() {
                        t.common.loadpanel.view && t.common.removeChild(t.common.loadpanel.view),
                        t.onfinshload()
                    },
                    t, 100)
                },
                start: function() {},
                gameover: function(e, i, n) {
                    for (var s = [], o = 3; o < arguments.length; o++) s[o - 3] = arguments[o];
                    t.common.task(function() { (isNaN(e) || "number" != typeof e) && (e = 0),
                        t.common.addChild(t.common.overpanel.view),
                        t.common.overpanel.setHighScore(t.gameData.updateHighScore(e)),
                        t.common.overpanel.setScore(e),
                        "function" == typeof i && (t.startcb.restart = function() {
                            t.executedHook("restart"),
                            i.apply(n, s)
                        })
                    })
                },
                levelwin: function(e, i, n, s) {
                    for (var o = [], h = 4; h < arguments.length; h++) o[h - 4] = arguments[h];
                    t.common.task(function() { (isNaN(i) || "number" != typeof i) && (i = 0),
                        t.common.addChild(t.common.levelpanel.view),
                        t.gameData.updateHighLevel(e),
                        t.common.levelpanel.setLevel(e),
                        t.common.levelpanel.setScore(i),
                        "function" == typeof n && (t.startcb.levelnext = n.bind(s, o))
                    })
                },
                share: function() {
                },
                more: function() {},
                restart: function() {},
                onrestart: function() {
                    t.common.removeChildren(),
                    t.startcb.restart()
                },
                onlevelnext: function() {
                    t.common.removeChildren(),
                    t.startcb.levelnext()
                },
                onhome: function() {
                    t.common.removeChildren()
                }
            },
            this._gameData = {},
            o._instance ? void console.error("Meiriq CommonComponent has already initlized!") : void(this["@config"] = o._config)
        }
        return Object.defineProperty(o, "instance", {
            get: function() {
                return null == o._instance && (o._instance = new o),
                o._instance
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(o, "config", {
            set: function(t) {
                for (var e in t) switch (e) {
                case "hook":
                case "gameData":
                    for (var i in t[e]) this._config[e][i] = t[e][i];
                    break;
                case "skin":
                    for (var n in t[e]) for (var s in t[e][n]) this._config.skin[n] && (this._config.skin[n][s] = t[e][n][s]);
                    break;
                default:
                    this._config[e] = t[e]
                }
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(o.prototype, "interface", {
            get: function() {
                return this["@config"]["interface"]
            },
            enumerable: !0,
            configurable: !0
        }),
        o.prototype.init = function(e, i) {
            if (this["@config"] && !this._hasinit) {
                this._hasinit = !0;
                for (var n in i)"string" == typeof n && (this._opt[n] = i[n]);
                this._gameData.name || (this._gameData.name = e),
                this.getInitlizeGameData(),
                t.StageResizeP.instance.init(this._opt.width, this._opt.height, {
                    maxWidth: this._opt.maxWidth,
                    maxHeight: this._opt.maxHeight,
                    orient_hoz: this._opt.orient_hoz
                }),
                this.common = new g(this["@config"].skin),
                this.common.addChildAt(this.common.loadpanel.view, this.common.numChildren)
            }
        },
        o.prototype.load = function(e, i, n) {
            for (var s = this,
            o = [], h = 3; h < arguments.length; h++) o[h - 3] = arguments[h];
            this.loader = t.AssetsLoadP.instance,
            this.loader.resourceConfigReference = this.gameData.resourceCDN,
            this.loader.onallload = function() {
                s.executedHook("finishload")
            },
            this.loader.onpreload = function() {},
            this.loader.onprogress = function(t, e) {
                s.common.pretask(function() {
                    s.common.loadpanel.setLoadingBar(t, e)
                })
            },
            this.loader.loadAssets(n, o),
            this.onfinshload = function() {
                s.common.task(function() {
                    s.checkOrient(!0),
                    t.stage().addEventListener(egret.Event.RESIZE,
                    function() {
                        s.checkOrient(!1)
                    },
                    s),
                    e.apply(i)
                })
            }
        },
        o.prototype.customExeHook = function(t, e) {
            void 0 === e && (e = function() {}),
            this.exehook[t] = e
        },
        o.prototype.executedHook = function(t) {
            for (var e = this,
            i = [], n = 1; n < arguments.length; n++) i[n - 1] = arguments[n];
            if (!this._hasinit) return void console.warn("use meiriq.CommonComponent.instance.init(name,<option>) first!");
            var s = this["@config"].hook["cb_" + t];
            if ("function" == typeof s) {
                if ("gameover" === t) return void egret.setTimeout(function() {
                    var n = s.apply(window, [i[0], e.common.overpanel.getOverModalURL()]);
                    if (0 !== n) {
                        var o = e.exehook[t];
                        "function" == typeof o && o.apply(e, i)
                    }
                },
                this, 200);
                s.apply(window, [i[0]])
            }
            var o = this.exehook[t];
            "function" == typeof o && o.apply(this, i)
        },
        o.prototype.implementsInterFace = function(t, e, i) {
            var n = this;
            this["@config"]["interface"][t] = function() {
                for (var s = [], o = 0; o < arguments.length; o++) s[o - 0] = arguments[o];
                n.executedHook("on" + t),
                e.apply(i, s)
            }
        },
        Object.defineProperty(o.prototype, "gameData", {
            get: function() {
                var t = this,
                e = {};
                for (var i in this._gameData) e[i] = this._gameData[i];
                for (var i in this[h].gameData) null !== this[h].gameData[i] && (e[i] = this[h].gameData[i]);
                return e.updateHighScore = function(e) {
                    return e > t._gameData.highScore ? (t._gameData.highScore = e, egret.localStorage.setItem(t._gameData.name + "Score", e + ""), e) : t._gameData.highScore
                },
                e.updateHighLevel = function(e) {
                    return e > t._gameData.highLevel ? (egret.localStorage.setItem(t._gameData.name + "Level", e), e) : t._gameData.highLevel
                },
                e.overModal = function(e) {
                    e instanceof egret.Texture ? t.common.overpanel.setModal(e) : t.common.overpanel.setModal(s.over_win)
                },
                e
            },
            enumerable: !0,
            configurable: !0
        }),
        o.prototype.getInitlizeGameData = function() {
            this._gameData = this.gameData;
            var t, e;
            "undefined" != typeof egret && "undefined" != typeof egret.localStorage && (t = egret.localStorage.getItem(this._gameData.name + "Score") ? +egret.localStorage.getItem(this._gameData.name + "Score") : 0),
            "undefined" != typeof egret && "undefined" != typeof egret.localStorage && (e = egret.localStorage.getItem(this._gameData.name + "Level") ? +egret.localStorage.getItem(this._gameData.name + "Level") : 0),
            this._gameData.highScore = t,
            this._gameData.highLevel = e
        },
        o.prototype.config_common = function(t, e, i) {
            var n = this;
            void 0 === t && (t = {}),
            void 0 === e && (e = {}),
            void 0 === i && (i = {});
            var s = {};
            s["interface"] = this[h]["interface"];
            var o = this["@config"];
            for (var r in t) o.gameData || (o.gameData = {}),
            o.gameData[r] = t[r];
            for (var r in e) o.hook || (o.hook = {}),
            "function" == typeof e[r] && (o.hook[r] = e[r]);
            for (var r in i)"function" == typeof i[r] && (this.exehook[r] = i[r]);
            return this["@config"] = o,
            s["interface"].updatePermitStart = function(t) {
                n._gameData.permitStart = t
            },
            s["interface"]
        },
        o.prototype.checkOrient = function(e) {
            var i = this;
            if ("undefined" != typeof window && this._opt.check_orient) {
                if (e) {
                    var n = !0;
                    this.implementsInterFace(t.InterFace.orientStart,
                    function(t) {
                        n = t
                    },
                    this),
                    this.implementsInterFace(t.InterFace.orientPause,
                    function() {
                        egret.Ticker.getInstance().pause()
                    },
                    this),
                    this.implementsInterFace(t.InterFace.orientResume,
                    function() {
                        n ? egret.Ticker.getInstance().resume() : window.location.reload()
                    },
                    this)
                }
                var o = function() {
                    i.common.orienttips.init({
                        content: i._opt.orient_hoz ? s.orient_hoz: s.orient_vert
                    }),
                    t.stage().addChildAt(i.common.orienttips.view, t.stage().numChildren)
                };
                this._opt.orient_hoz ? t.stage().stageWidth < t.stage().stageHeight ? (egret.Ticker.getInstance().resume(), o(), e ? this["interface"].orientStart(!1) : egret.setTimeout(function() {
                    i["interface"].orientPause()
                },
                this, 100)) : e ? this["interface"].orientStart(!0) : (this["interface"].orientResume(), this.common.orienttips.view.parent && this.common.orienttips.view.parent.removeChild(this.common.orienttips.view)) : t.stage().stageWidth < t.stage().stageHeight ? e ? this["interface"].orientStart(!0) : (this["interface"].orientResume(t.stageWidth(), t.stageHeight()), this.common.orienttips.view.parent && this.common.orienttips.view.parent.removeChild(this.common.orienttips.view)) : (egret.Ticker.getInstance().resume(), o(), e ? this["interface"].orientStart(!1) : egret.setTimeout(function() {
                    i["interface"].orientPause()
                },
                this, 100))
            }
        },
        o._config = {
            gameData: {
                name: null,
                resourceCDN: "",
                permitStart: 1,
                buttonLayout: ["restart"]
            },
            hook: {
                cb_finishload: null,
                cb_start: null,
                cb_gameover: null,
                cb_share: null,
                cb_restart: null,
                cb_levelwin: null
            },
            "interface": {
                home: function() {},
                pause: function() {},
                resume: function() {},
                orientStart: function(t) {},
                orientPause: function() {},
                orientResume: function(t, e) {}
            },
            skin: {
                orientTips: {
                    background: 2460642,
                    orient_hoz: i.ORIENT_HOZ,
                    orient_vert: i.ORIENT_VERT
                },
                loadingConfig: {
                    content: e.LOADING_CONTENT,
                    logo: e.LOADING_LOGO,
                    background: 16777215,
                    loadingWord: 16777215,
                    loadingBar: 2460642,
                    loadingBarBackground: 15001571
                },
                designation: {
                    win: i.OVER_WIN,
                    lose: i.OVER_LOSE,
                    level_win: i.LEVEL_WIN
                },
                button: {
                    restart: i.OVER_BTN_RESTART,
                    share: i.OVER_BTN_SHARE,
                    more: i.OVER_BTN_MORE,
                    rank: i.OVER_BTN_RANK,
                    level_btn_next: i.LEVEL_BTN_NEXT
                },
                share_img: i.SHARE_IMG,
                font: {
                    font: n.TYPE_FONT,
                    sprite: n.TYPE_IMAGE
                }
            }
        },
        o
    } ();
    t.CommonComponent = c;
    var g = function(e) {
        function i(i, n) {
            e.call(this),
            this.preloadCompleteTask = [],
            this.loadCompleteTask = [],
            this.pre_res_URL = {},
            this.res_URL = {
                loading_content: "",
                loading_logo: "",
                level_win: "",
                level_btn_next: "",
                over_win: "",
                over_lose: "",
                over_btn_restart: "",
                over_btn_rank: "",
                over_btn_more: "",
                over_btn_share: "",
                share_img: ""
            },
            this.res_Font = {
                font: "",
                sprite: ""
            },
            this.loadpanel = new u,
            this.levelpanel = new m,
            this.overpanel = new d,
            this.sharecurtain = new l,
            this.orienttips = new p({
                background: i.orientTips.background
            }),
            this.isPreloadComplete = !1,
            this.readyRes(i),
            this.asyncPreLoad(this.preLoadComplete.bind(this)),
            this.asyncLoadRes(this.onLoadComplete.bind(this)),
            t.stage().addChildAt(this, t.stage().numChildren)
        }
        return __extends(i, e),
        i.prototype.readyRes = function(t) {
            this.res_URL.orient_hoz = t.orientTips.orient_hoz,
            this.res_URL.orient_vert = t.orientTips.orient_vert,
            this.pre_res_URL.loading_content = t.loadingConfig.content,
            this.pre_res_URL.loading_logo = t.loadingConfig.logo,
            this.res_URL.level_win = t.designation.level_win,
            this.res_URL.level_btn_next = t.button.level_btn_next,
            this.res_URL.over_win = t.designation.win,
            this.res_URL.over_lose = t.designation.lose,
            this.res_URL.over_btn_restart = t.button.restart,
            this.res_URL.over_btn_more = t.button.more,
            this.res_URL.over_btn_share = t.button.share,
            this.res_URL.over_btn_rank = t.button.rank,
            this.res_URL.share_img = t.share_img,
            this.res_Font.font = t.font.font,
            this.res_Font.sprite = t.font.sprite
        },
        i.prototype.asyncPreLoad = function(t) {
            var e, i = 0;
            for (var n in this.pre_res_URL) i++;
            for (var n in this.pre_res_URL) e = function(e, n) {
                i--,
                s[e] = n,
                0 === i && t()
            },
            RES.getResByUrl(this.pre_res_URL[n], e.bind(this, n), this, RES.ResourceItem.TYPE_IMAGE)
        },
        i.prototype.pretask = function(t, e) {
            return this.isPreloadComplete ? void t.apply(e) : void this.preloadCompleteTask.push(t.bind(e))
        },
        i.prototype.preLoadComplete = function() {
            this.isPreloadComplete = !0,
            this.loadpanel.init(),
            this.preloadCompleteTask.forEach(function(t) {
                "function" == typeof t && t()
            })
        },
        i.prototype.asyncLoadRes = function(t) {
            var e, i = 0,
            n = 0,
            h = !1;
            for (var r in this.res_URL) i++;
            for (var r in this.res_URL) e = function(e, o) {
                i--,
                s[e] = o,
                0 !== i || 0 !== n || h || (h = !0, t())
            },
            RES.getResByUrl(this.res_URL[r], e.bind(this, r), this, RES.ResourceItem.TYPE_IMAGE);
            for (var a in this.res_Font) n++,
            e = function(e, s) {
                n--,
                "font" === e && (o = s),
                0 !== i || 0 !== n || h || (h = !0, t())
            },
            RES.getResByUrl(this.res_Font[a], e.bind(this, a), this, RES.ResourceItem[a])
        },
        i.prototype.onLoadComplete = function() {
            this.levelpanel.init(),
            this.overpanel.init(),
            this.sharecurtain.init(),
            this.isLoadComplete = !0,
            this.loadCompleteTask.forEach(function(t) {
                "function" == typeof t && t()
            })
        },
        i.prototype.task = function(t, e) {
            return this.isLoadComplete ? void t.apply(e) : void this.loadCompleteTask.push(t.bind(e))
        },
        i
    } (egret.DisplayObjectContainer),
    d = function() {
        function e() {
            var e = this;
            this.view = new egret.DisplayObjectContainer,
            this.view.width = t.stage().stageWidth,
            this.view.height = t.stage().stageHeight;
            var i = 750 / 1334,
            n = this.view.width / this.view.height;
            i > n ? this.scale = this.view.width / 750 : this.scale = this.view.height / 1334,
            this.scale *= 1.2,
            t.stage().stageWidth > t.stage().stageHeight && (this.scale *= 1.2),
            this.view.y = -this.view.height,
            this.view.anchorX = .5,
            this.view.addEventListener(egret.Event.ADDED_TO_STAGE,
            function() {
                e.view.x = t.stageWidth(.5)
            },
            this)
        }
        return e.prototype.init = function() {
            this.background = new egret.Shape,
            this.background.y = 300 * this.scale,
            this.background.graphics.beginFill(16777215, 1);
            var t = {
                restart: s.over_btn_restart,
                share: s.over_btn_share,
                more: s.over_btn_more,
                rank: s.over_btn_rank
            },
            e = c.instance.gameData.buttonLayout;
            t[e[1]] || (e[1] = s.over_btn_restart);
            for (var i = 0,
            n = 0; n < e.length; n++) if (t[e[n]]) {
                var h = new egret.Bitmap(t[e[n]]);
                switch (h.width *= 1.2 * this.scale, h.height *= 1.2 * this.scale, h.touchEnabled = !0, h.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this), h.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this), h.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this), h.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this), h.name = e[n], i++, i) {
                case 1:
                    this.firstBtn = h;
                    break;
                case 2:
                    this.secondBtn = h;
                    break;
                case 3:
                    this.thirdBtn = h
                }
            }
            null != this.secondBtn && null != this.thirdBtn ? (this.firstBtn.x = (this.view.width - this.firstBtn.width) / 2, this.secondBtn.x = this.firstBtn.x, this.thirdBtn.x = this.firstBtn.x, this.firstBtn.x = (this.view.width - this.firstBtn.width) / 2, this.firstBtn.y = this.background.y + 260 * this.scale + this.firstBtn.height, this.secondBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2 + this.firstBtn.width, this.secondBtn.y = this.background.y + 260 * this.scale + this.firstBtn.height, this.thirdBtn.x = (this.view.width - this.firstBtn.width) / 2, this.thirdBtn.y = this.background.y + 260 * this.scale + 2 * this.firstBtn.height, this.background.width = 600 * this.scale, this.background.height = 300 * this.scale + 3 * this.firstBtn.height, this.background.graphics.drawRect((this.view.width - 600 * this.scale) / 2, 0, 600 * this.scale, 300 * this.scale + 3 * this.firstBtn.height)) : null != this.thirdBtn || null != this.secondBtn ? (this.firstBtn.y = this.background.y + 150 * this.scale + this.firstBtn.height * n, "restart" == e[0] ? (this.firstBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2, null != this.thirdBtn ? (this.thirdBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2 + this.firstBtn.width, this.thirdBtn.y = this.background.y + 150 * this.scale + this.firstBtn.height * n) : (this.secondBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2 + this.firstBtn.width, this.secondBtn.y = this.background.y + 150 * this.scale + this.firstBtn.height * n)) : (this.firstBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2 + this.firstBtn.width, null != this.thirdBtn ? (this.thirdBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2, this.thirdBtn.y = this.background.y + 150 * this.scale + this.firstBtn.height * n) : (this.secondBtn.x = (this.view.width - 2 * this.firstBtn.width) / 2, this.secondBtn.y = this.background.y + 150 * this.scale + this.firstBtn.height * n)), this.background.width = 600 * this.scale, this.background.height = 300 * this.scale + 2 * this.firstBtn.height, this.background.graphics.drawRect((this.view.width - 600 * this.scale) / 2, 0, 600 * this.scale, 300 * this.scale + 2 * this.firstBtn.height)) : null == this.thirdBtn && null == this.secondBtn && (this.firstBtn.x = (this.view.width - this.firstBtn.width) / 2, this.firstBtn.y = this.background.y + 250 * this.scale + this.firstBtn.height, this.background.width = 500 * this.scale, this.background.height = 400 * this.scale + this.firstBtn.height, this.background.graphics.drawRect((this.view.width - 500 * this.scale) / 2, 0, 500 * this.scale, 400 * this.scale + this.firstBtn.height)),
            this.background.graphics.endFill(),
            this.scoreText = new egret.BitmapText,
            this.scoreText.font = o,
            this.scoreText.spriteSheet = o,
            this.scoreText.scaleX *= this.scale,
            this.scoreText.scaleY *= this.scale,
            this.scoreText.y = 150 * this.scale,
            this.scoreText.anchorX = .5,
            this.scoreText.x = this.view.width / 2,
            this.statusLogo = new egret.Bitmap,
            this.setModal(s.over_win);
            var r = new egret.TextField;
            r.size = 28 * this.scale,
            r.textColor = 5592405,
            r.text = "",
            r.anchorX = .5,
            r.x = this.view.width / 2,
            r.y = 360 * this.scale,
            r.fontFamily = "Microsoft Yahei",
            this.highScoreText = r,
            this.view.addChild(this.background),
            this.view.addChild(this.statusLogo),
            this.view.addChild(this.scoreText),
            this.view.addChild(this.highScoreText),
            this.view.addChild(this.firstBtn),
            //this.secondBtn && this.view.addChild(this.secondBtn),
            //this.thirdBtn && this.view.addChild(this.thirdBtn),
            this.setCenter()
        },
        e.prototype.setCenter = function() {
            this.firstBtn.anchorOffsetX = this.firstBtn.width >> 1,
            this.firstBtn.anchorOffsetY = this.firstBtn.height >> 1,
            this.firstBtn.x += this.firstBtn.width >> 1,
            this.firstBtn.y += this.firstBtn.height >> 1,
            null != this.thirdBtn && (this.thirdBtn.anchorOffsetX = this.thirdBtn.width >> 1, this.thirdBtn.anchorOffsetY = this.thirdBtn.height >> 1, this.thirdBtn.x += this.thirdBtn.width >> 1, this.thirdBtn.y += this.thirdBtn.height >> 1),
            null != this.secondBtn && (this.secondBtn.anchorOffsetX = this.secondBtn.width >> 1, this.secondBtn.anchorOffsetY = this.secondBtn.height >> 1, this.secondBtn.x += this.secondBtn.width >> 1, this.secondBtn.y += this.secondBtn.height >> 1)
        },
        e.prototype.setScore = function(e) {
            var i = this,
            n = 0;
            t.stage().stageWidth > t.stage().stageHeight && (n = -120 * this.scale);
            var s = egret.Tween.get(this.view, null, null, !0);
            s.to({
                y: n
            },
            600, egret.Ease.backOut).call(function() {
                i.scoreText.text = "" + e;
                var t = 0,
                n = e / 10,
                s = function(e, n) {
                    t += n,
                    t >= e ? t = e: egret.setTimeout(function() {
                        s(e, n)
                    },
                    i, 50),
                    i.scoreText.text = "" + Math.floor(t)
                };
                e > 0 && s(e, n)
            },
            this)
        },
        e.prototype.setHighScore = function(t) {
            this.highScoreText.text = "最高:" + t
        },
        e.prototype.setModal = function(t) {
            this.statusLogo.texture = t,
            this.statusLogo.width = t.textureWidth * this.scale,
            this.statusLogo.height = t.textureHeight * this.scale;
            var e = t.textureWidth / t.textureHeight;
            this.statusLogo.width > .8 * this.background.width && (this.statusLogo.width = .8 * this.background.width, this.statusLogo.height = this.statusLogo.width / e),
            this.statusLogo.height > .9 * this.background.height && (this.statusLogo.height = .9 * this.background.height, this.statusLogo.width = this.statusLogo.height * e),
            this.statusLogo.x = (this.view.width - this.statusLogo.width) / 2,
            this.statusLogo.y = 520 * this.scale,
            this.statusLogo.anchorY = .5
        },
        e.prototype.getOverModalURL = function() {
            return this.statusLogo.texture._bitmapData.currentSrc
        },
        e.prototype.onTouchBegin = function(t) {
            var e = egret.Tween.get(t.target);
            e.to({
                scaleX: .8,
                scaleY: .8
            },
            100)
        },
        e.prototype.onTouchEnd = function(t) {
            t.stopImmediatePropagation();
            var e = egret.Tween.get(t.target);
            e.to({
                scaleX: 1,
                scaleY: 1
            },
            100)
        },
        e.prototype.onTouchTap = function(t) {
            if (t.target.name) {
                if ("restart" === t.target.name) {
                    var e = egret.Tween.get(this.view, null, null, !0);
                    return void e.to({
                        y: -this.view.height
                    },
                    290, egret.Ease.backIn).call(function() {
                        c.instance.executedHook("onrestart")
                    },
                    this)
                }
                c.instance.executedHook(t.target.name)
            }
        },
        e
    } (),
    l = function() {
        function e() {
            this.view = new egret.DisplayObjectContainer,
            this.view.width = t.stage().stageWidth,
            this.view.height = t.stage().stageHeight
        }
        return e.prototype.init = function() {
            var t = this;
            this.shareBackground = new egret.Shape,
            this.shareBackground.graphics.beginFill(0, 1),
            this.shareBackground.graphics.drawRect(0, 0, this.view.width, this.view.height),
            this.shareBackground.graphics.endFill(),
            this.shareBackground.touchEnabled = !0,
            this.shareBackground.alpha = .79,
            this.shareBackground.addEventListener(egret.TouchEvent.TOUCH_TAP,
            function(e) {
                t.view.parent.removeChild(t.view)
            },
            this),
            this.sharePicture = new egret.Bitmap(s.share_img);
            var e = this.view.width / this.view.height,
            i = this.sharePicture.width / this.sharePicture.height;
            e > i ? (this.sharePicture.height = this.view.height, this.sharePicture.width = this.sharePicture.height * i) : (this.sharePicture.width = this.view.width, this.sharePicture.height = this.sharePicture.width / i),
            this.sharePicture.x = this.view.width - this.sharePicture.width >> 1,
            this.sharePicture.y = this.view.height - this.sharePicture.height >> 1,
            this.view.addChild(this.shareBackground),
            this.view.addChild(this.sharePicture)
        },
        e
    } (),
    u = function() {
        function e() {
            this.loadingBarSize = {
                width: 0,
                height: 0
            },
            this.view = new egret.DisplayObjectContainer,
            this.view.width = t.stage().stageWidth,
            this.view.height = t.stage().stageHeight;
            var e = 750 / 1334,
            i = this.view.width / this.view.height;
            e > i ? this.scale = this.view.width / 750 : this.scale = this.view.height / 1334,
            this.loadingBarSize.width = .79 * t.stage().stageWidth / 1.5,
            this.loadingBarSize.height = 60 * this.scale,
            this.preinit()
        }
        return e.prototype.preinit = function() {
            var t = c.instance["@config"];
            this.background = new egret.Shape,
            this.background.graphics.beginFill(t.skin.loadingConfig.background, 1),
            this.background.graphics.drawRect(0, 0, this.view.width, this.view.height),
            this.background.graphics.endFill(),
            this.loadWord = new egret.TextField,
            this.loadWord.text = "加载中...",
            this.loadWord.bold = !0,
            this.loadWord.size = 39 * this.scale,
            this.loadWord.x = this.view.width - this.loadWord.width >> 1,
            this.loadWord.y = 800 * this.scale + 2.5,
            this.loadWord.fontFamily = "SimHei",
            this.loadWord.verticalAlign = egret.VerticalAlign.MIDDLE,
            this.loadWord.height = .8 * this.loadingBarSize.height,
            this.loadWord.textColor = t.skin.loadingConfig.loadingWord;
            var e = new egret.Shape;
            e.graphics.beginFill(t.skin.loadingConfig.loadingBarBackground),
            e.graphics.drawRoundRect(0, 0, this.loadingBarSize.width, this.loadingBarSize.height, 10),
            e.graphics.endFill(),
            this.loadBar = new egret.Shape,
            this.loadBar.graphics.beginFill(t.skin.loadingConfig.loadingBar),
            this.loadBar.graphics.drawRoundRect(0, 0, this.loadingBarSize.width, this.loadingBarSize.height, 10),
            this.loadBar.graphics.endFill(),
            this.loadBar.mask = new egret.Rectangle( - 1, -1, this.loadingBarSize.width + 1, this.loadingBarSize.height + 1),
            this.loadBar.mask.width = 0,
            this.loadBar.x = this.view.width - this.loadBar.width >> 1,
            this.loadBar.y = 800 * this.scale,
            e.x = this.loadBar.x,
            e.y = this.loadBar.y,
            this.view.addChild(this.background),
            this.view.addChild(e),
            this.view.addChild(this.loadBar),
            this.view.addChild(this.loadWord)
        },
        e.prototype.init = function() {
            this.content = new egret.Bitmap(s.loading_content);
            var e = this.content.width / this.content.height;
            750 / 1334 > e ? (this.content.height = 1334 / 1.3 * this.scale, this.content.width = this.content.height * e) : (this.content.width = 750 / 1.3 * this.scale, this.content.height = this.content.width / e),
            this.content.x = this.view.width - this.content.width >> 1,
            this.content.y = 90 * this.scale,
            this.logo = new egret.Bitmap(s.loading_logo),
            this.logo.width = s.loading_logo.textureWidth * this.scale,
            this.logo.height = s.loading_logo.textureHeight * this.scale,
            this.logo.x = this.view.width - this.logo.width >> 1,
            this.logo.anchorY = 1,
            this.logo.y = t.stage().stageHeight - 100 * this.scale,
            this.view.addChild(this.content),
            this.view.addChild(this.logo)
        },
        e.prototype.setLoadingBar = function(t, e) {
            this.loadBar.mask.width = (this.loadingBarSize.width + 2) * (t / e)
        },
        e
    } (),
    m = function() {
        function e() {
            this.view = new egret.DisplayObjectContainer,
            this.view.width = t.stage().stageWidth,
            this.view.height = t.stage().stageHeight;
            var e = 750 / 1334,
            i = this.view.width / this.view.height;
            e > i ? this.scale = this.view.width / 750 : this.scale = this.view.height / 1334,
            t.stage().stageWidth > t.stage().stageHeight && (this.scale *= 1.2),
            this.view.y -= this.view.height
        }
        return e.prototype.init = function() {
            this.background = new egret.Shape,
            this.background.y = 300 * this.scale,
            this.background.graphics.beginFill(16777215, 1),
            this.background.graphics.drawRect((this.view.width - 500 * this.scale) / 2, 0, 500 * this.scale, 600 * this.scale),
            this.background.graphics.endFill(),
            this.nextBtn = new egret.Bitmap(s.level_btn_next),
            this.nextBtn.width *= 1.2 * this.scale,
            this.nextBtn.height *= 1.2 * this.scale,
            this.nextBtn.touchEnabled = !0,
            this.nextBtn.x = (this.view.width - this.nextBtn.width) / 2,
            this.nextBtn.y = this.background.y + 300 * this.scale + this.nextBtn.height,
            this.nextBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this),
            this.nextBtn.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this),
            this.nextBtn.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this),
            this.nextBtn.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this),
            this.scoreText = new egret.BitmapText,
            this.scoreText.font = o,
            this.scoreText.scaleX *= this.scale,
            this.scoreText.scaleY *= this.scale,
            this.scoreText.y = 150 * this.scale,
            this.scoreText.anchorX = .5,
            this.scoreText.x = this.view.width / 2,
            this.statusLogo = new egret.Bitmap(s.level_win),
            this.statusLogo.width *= this.scale,
            this.statusLogo.height *= this.scale,
            this.statusLogo.x = (this.view.width - this.statusLogo.width) / 2,
            this.statusLogo.y = 400 * this.scale;
            var t = new egret.TextField;
            t.size = 28 * this.scale,
            t.textColor = 5592405,
            t.text = "",
            t.anchorX = .5,
            t.x = this.view.width / 2,
            t.y = 360 * this.scale,
            t.fontFamily = "Microsoft Yahei",
            this.level = t,
            this.view.addChild(this.background),
            this.view.addChild(this.statusLogo),
            this.view.addChild(this.scoreText),
            this.view.addChild(this.level),
            this.view.addChild(this.nextBtn),
            this.setCenter()
        },
        e.prototype.setLevel = function(t) {
            this.level.text = "第 " + t + "关"
        },
        e.prototype.setCenter = function() {
            this.nextBtn.anchorOffsetX = this.nextBtn.width >> 1,
            this.nextBtn.anchorOffsetY = this.nextBtn.height >> 1,
            this.nextBtn.x += this.nextBtn.width >> 1,
            this.nextBtn.y += this.nextBtn.height >> 1
        },
        e.prototype.setScore = function(e) {
            var i = 0;
            t.stage().stageWidth > t.stage().stageHeight && (i = -100);
            var n = egret.Tween.get(this.view);
            n.to({
                y: i
            },
            1e3).call(function() {
                var t = this;
                this.scoreText.text = "" + e;
                var i = 0,
                n = e / 10,
                s = function(e, n) {
                    i += n,
                    i >= e ? i = e: egret.setTimeout(function() {
                        s(e, n)
                    },
                    t, 50),
                    t.scoreText.text = "" + Math.floor(i)
                };
                s(e, n)
            },
            this)
        },
        e.prototype.onTouchBegin = function(t) {
            var e = egret.Tween.get(t.target);
            e.to({
                scaleX: .8,
                scaleY: .8
            },
            100)
        },
        e.prototype.onTouchEnd = function(t) {
            t.stopImmediatePropagation();
            var e = egret.Tween.get(t.target);
            e.to({
                scaleX: 1,
                scaleY: 1
            },
            100)
        },
        e.prototype.onTouchTap = function() {
            c.instance.executedHook("onlevelnext")
        },
        e
    } (),
    p = function() {
        function e(t) {
            this._opts = t,
            this.view = new egret.DisplayObjectContainer
        }
        return e.prototype.init = function(e) {
            this.view.removeChildren();
            var i = new egret.Sprite;
            i.graphics.beginFill(this._opts.background),
            i.graphics.drawRect(0, 0, t.stageWidth(), t.stageHeight()),
            i.graphics.endFill(),
            this.view.addChild(i),
            this._content = new egret.Bitmap(e.content),
            this._content.anchorX = this._content.anchorY = .5;
            var n = this._content.width / this._content.height;
            t.stageW2H() > n ? (this._content.height = .8 * t.stage().stageHeight, this._content.width = this._content.height * n) : (this._content.width = .8 * t.stage().stageWidth, this._content.height = this._content.width / n),
            this._content.x = t.stage().stageWidth >> 1,
            this._content.y = t.stage().stageHeight >> 1,
            this.view.addChild(this._content)
        },
        e
    } ()
} (meiriq || (meiriq = {}));
var meiriq; !
function(t) {
    var e = function(t) {
        function e() {
            t.apply(this, arguments),
            this.onpreload = function() {},
            this.onallload = function() {},
            this.onprogress = function(t, e) {}
        }
        return __extends(e, t),
        Object.defineProperty(e.prototype, "resourceConfig", {
            set: function(t) {
                this._resourceConfig = "string" == typeof t ? t: null
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "resourceConfigReference", {
            set: function(t) {
                this._resourceConfigReference = t
            },
            enumerable: !0,
            configurable: !0
        }),
        e.prototype.loadAssets = function(t, e) {
            void 0 === t && (t = null),
            void 0 === e && (e = []),
            this._loadcount = 0,
            this._assets_groups = e,
            t && e.length >= 1 ? (this._loadcount = -1, this._assets_groups[this._loadcount] = t) : t && (this._assets_groups = [t]),
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadcomplete, this),
            RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.loadprogress, this),
            RES.loadConfig(this._resourceConfig ? this._resourceConfig: "resource/resource.json", this._resourceConfigReference ? this._resourceConfigReference + "/resource/": "resource/"),
            RES.loadGroup(this._assets_groups[this._loadcount])
        },
        e.prototype.loadcomplete = function(t) {
            this._loadcount++,
            0 == this._loadcount ? (delete this._assets_groups[ - 1], RES.loadGroup(this._assets_groups[this._loadcount]), this.onpreload()) : this._loadcount < this._assets_groups.length ? RES.loadGroup(this._assets_groups[this._loadcount]) : (RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadcomplete, this), RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.loadprogress, this), this.onallload())
        },
        e.prototype.loadprogress = function(t) {
            if ("RES__CONFIG" != t.groupName) {
                t.itemsLoaded / t.itemsTotal;
                this.onprogress(t.itemsLoaded, t.itemsTotal)
            }
        },
        Object.defineProperty(e, "instance", {
            get: function() {
                return null == this._instance && (this._instance = new e),
                this._instance
            },
            enumerable: !0,
            configurable: !0
        }),
        e
    } (egret.EventDispatcher);
    t.AssetsLoadP = e
} (meiriq || (meiriq = {}));
var meiriq; !
function(t) {
    function e() {
        var t;
        return t = document.documentElement.clientWidth ? document.documentElement.clientWidth: window.innerWidth
    }
    function i() {
        var t;
        return t = document.documentElement.clientHeight ? document.documentElement.clientHeight: window.innerHeight
    }
    function n(t) {
        return void 0 === t && (t = 1),
        egret.MainContext.instance.stage.stageWidth * t
    }
    function s(t) {
        return void 0 === t && (t = 1),
        egret.MainContext.instance.stage.stageHeight * t
    }
    function o() {
        return t.StageResizeP.instance.width
    }
    function h() {
        return t.StageResizeP.instance.height
    }
    function r() {
        return t.StageResizeP.instance.longEdge
    }
    function a() {
        return t.StageResizeP.instance.shortEdge
    }
    function c() {
        return egret.MainContext.instance.stage
    }
    function g() {
        return c().stageWidth / c().stageHeight
    }
    function d() {
        return egret.MainContext.instance
    }
    t.domWidth = e,
    t.domHeight = i,
    t.stageWidth = n,
    t.stageHeight = s,
    t.stageDesignWidth = o,
    t.stageDesignHeight = h,
    t.stageLongEdge = r,
    t.stageShortEdge = a,
    t.stage = c,
    t.stageW2H = g,
    t.context = d
} (meiriq || (meiriq = {}));