gbx.define("gbx/render/display/animation", ["gbx/render/display/sprite", "gbx/render/loader", "gbx/render/texture"], function(Sprite, loader, texture) {
	var Animation = Sprite.extend({
		ctor: function(url) {
			this.__node = new laya.display.Animation;
		},
		get count() {
			return this.__node.count;
		},
		get index() {
			return this.__node.index;
		},
		set index(v) {
			this.__node.index = v;
		},
		get interval() {
			return this.__node.interval;
		},
		set interval(v) {
			this.__node.interval = v;
		},
		get loop() {
			return this.__node.loop;
		},
		set loop(v) {
			this.__node.loop = v;
		},
		clear: function() {
			this.__node.clear();
		},
		loadAtlas: function(url) {
			this.__node.loadAtlas(url);
		},
		loadImages: function(urls, cacheName) {
			if (texture.usingTexturePack) {
				if (!this.__node._setFramesFromCache(cacheName)) {
					var arr = [];
					for (var i = 0; i < urls.length; i++) {
						var t = texture.getFromPackedTexture(urls[i]),
							g = new laya.display.Graphics;
						g.drawTexture(t.tex, t.sx, t.sy);
						arr.push(g);
					}
					this.__node.frames = arr;
					if (cacheName) {
						laya.display.Animation.framesMap[cacheName] = arr;
					}
				}
			} else {
				this.__node.loadImages(urls);
			}
		},
		play: function(start, loop, name) {
			this.__node.play(start, loop, name);
		},
		stop: function() {
			this.__node.stop();
		},
		onComplete: function(context, handler, args) {
			this.on("complete", context, handler, args);
		},
		setFrames: function(url, cols, rows, cacheName) {
			if (rows == undefined) {
				rows = 1;
			}
			var arr = [];
			if (texture.usingTexturePack) {
				var tex = texture.getFromPackedTexture(url),
					fw = tex.sw / cols,
					fh = tex.sh / rows,
					fx = tex.sx,
					fy = tex.sy;
				tex = tex.tex;
			} else {
				var tex = loader.get(url);
				if(tex==undefined)return;
				fw = tex.sourceWidth / cols;
				fh = tex.sourceHeight / rows;
				fx = 0;
				fy = 0;
			}
			for (var y = 0; y < rows; y++) {
				for (var x = 0; x < cols; x++) {
					var t = texture.createFromTexture(tex, x * fw, y * fh, fw, fh),
						g = new laya.display.Graphics;
					g.drawTexture(t, fx, fy);
					arr.push(g);
				}
			}
			this.__node.frames = arr;
			if (cacheName) {
				laya.display.Animation.framesMap[cacheName] = arr;
			}
		}
	});
	return Animation;
});
gbx.define("gbx/render/display/node", ["gbx/cclass"], function(Class) {
	var hookDestroy = laya.display.Node.prototype.destroy;
	laya.display.Node.prototype.destroy = function() {
		if ("__sealer" in this) {
			this.__sealer.end();
			delete this.__sealer.__node;
			delete this.__sealer;
		}
		hookDestroy.apply(this, Array.prototype.slice.call(arguments, 0));
	};
	var Node = Class.extend({
		ctor: function() {
			this.__node = new laya.display.Node;
		},
		init: function() {
			this.ctor.apply(this, Array.prototype.slice.call(arguments, 0));
			this.__node.__sealer = this;
			this._super();
		},
		get destroyed() {
			if (!this.__node) {
				return true;
			}
			return this.__node.destroyed;
		},
		get displayInStage() {
			return this.__node.displayInStage;
		},
		get name() {
			return this.__node.name;
		},
		set name(v) {
			this.__node.name = v;
		},
		get numChildren() {
			return this.__node.numChildren;
		},
		get parent() {
			var _p = this.__node.parent;
			if (_p) {
				return _p.__sealer;
			}
			return null;
		},
		get timer() {
			return this.__node.timer;
		},
		set timer(v) {
			this.__node.timer = v;
		},
		addChild: function(child) {
			this.__node.addChild(child.__node);
		},
		addChildAt: function(node, index) {
			return this.__node.addChildAt(node.__node, index).__sealer;
		},
		addChildren: function() {
			var relist = Array.prototype.slice.call(arguments, 0);
			this.addChildrenList(relist);
		},
		ask: function(type, value) {
			return this.__node.ask(type, value);
		},
		clearTimer: function(caller, method) {
			this.__node.clearTimer(caller, method);
		},
		contains: function(node) {
			return this.__node.contains(node.__node);
		},
		destroy: function(destroyChild) {
			this.__node.destroy(destroyChild);
		},
		destroyChildren: function() {
			this.__node.destroyChildren();
		},
		frameLoop: function(delay, caller, method, args, coverBefore) {
			this.__node.frameLoop(delay, caller, method, args, coverBefore);
		},
		frameOnce: function(delay, caller, method, args, coverBefore) {
			this.__node.frameOnce(delay, caller, method, args, coverBefore);
		},
		getChildAt: function(index) {
			return this.__node.getChildAt(index).__sealer;
		},
		getChildByName: function() {
			var names = Array.prototype.slice.call(arguments, 0);
			var c = this.__node.getChildByName(names.shift());
			if (c) {
				if (names.length) {
					return c.__sealer.getChildByName.apply(c.__sealer, names);
				}
				return c.__sealer;
			}
			return null;
		},
		getChildIndex: function(node) {
			return this.__node.getChildIndex(node.__node);
		},
		getPrivates: function() {
			return this.__node.getPrivates();
		},
		removeChild: function(node) {
			return this.__node.removeChild(node.__node).__sealer;
		},
		removeChildAt: function(index) {
			return this.__node.removeChildAt(index).__sealer;
		},
		removeChildByName: function(name) {
			return this.__node.removeChildByName(name).__sealer;
		},
		removeChildren: function(beginIndex, endIndex) {
			return this.__node.removeChildren(beginIndex, endIndex).__sealer;
		},
		removeSelf: function() {
			return this.__node.removeSelf().__sealer;
		},
		replaceChild: function(newNode, oldNode) {
			return this.__node.replaceChild(newNode, oldNode).__sealer;
		},
		setChildIndex: function(node, index) {
			return this.__node.setChildIndex(node, index).__sealer;
		},
		timerLoop: function(delay, caller, method, args, coverBefore) {
			if (document.gamePauseInGame != undefined && document.gamePauseInGame) return;
			this.__node.timerLoop(delay, caller, method, args, coverBefore);
		},
		timerOnce: function(delay, caller, method, args, coverBefore) {
			if (document.gamePauseInGame != undefined && document.gamePauseInGame) return;
			this.__node.timerOnce(delay, caller, method, args, coverBefore);
		},
		event: function(type, data) {
			return this.__node.event(type, data).__sealer;
		},
		hasListener: function(type) {
			return this.__node.hasListener(type);
		},
		isMouseEvent: function(type) {
			return this.__node.isMouseEvent(type);
		},
		off: function(type, caller, listener, onceOnly) {
			return this.__node.off(type, caller, listener, onceOnly).__sealer;
		},
		offAll: function(type) {
			return this.__node.offAll(type).__sealer;
		},
		on: function(type, caller, listener, args) {
			return this.__node.on(type, caller, listener, args).__sealer;
		},
		once: function(type, caller, listener, args) {
			return this.__node.once(type, caller, listener, args).__sealer;
		},
		get EVENT() {
			return laya.events.Event;
		},
		callLater: function(method, args) {
			Laya.timer.callLater(this, method, args);
		},
		addChildrenList: function(list) {
			for (var i = 0; i < list.length; i++) {
				this.addChild(list[i]);
			}
		},
		getAllChildren: function() {
			var max = this.__node.numChildren,
				list = [];
			for (var i = 0; i < max; i++) {
				var child = this.__node.getChildAt(i);
				if (child.__sealer) {
					list.push(child.__sealer);
				}
			}
			return list;
		},
		eachChildrenList: function(iterator, context) {
			var list = this.getAllChildren();
			context = context || this;
			for (var i = 0; i < list.length; i++) {
				iterator.call(context, list[i]);
			}
		},
		addToStage: function(zOrder) {
			if (this.__node != Laya.stage) {
				if (zOrder == undefined) {
					zOrder = 1;
				}
				Laya.stage.addChild(this.__node);
				this.__node.zOrder = zOrder;
			}
		},
		removeFromStage: function() {
			if (this.__node != Laya.stage) {
				Laya.stage.removeChild(this.__node);
			}
		}
	});
	return Node;
});
gbx.define("gbx/render/display/sprite", ["gbx/render/display/node", "gbx/render/tween", "gbx/render/texture"], function(Node, Tween, texture) {
	var Sprite = Node.extend({
		ctor: function(url) {
			this.__node = new laya.display.Sprite(url);
		},
		get alpha() {
			return this.__node.alpha;
		},
		set alpha(v) {
			this.__node.alpha = v;
		},
		get autoSize() {
			return this.__node.autoSize;
		},
		set autoSize(v) {
			this.__node.autoSize = v;
		},
		get blendMode() {
			return this.__node.blendMode;
		},
		set blendMode(v) {
			this.__node.blendMode = v;
		},
		get cacheAs() {
			return this.__node.cacheAs;
		},
		set cacheAs(v) {
			this.__node.cacheAs = v;
		},
		get cacheAsBitmap() {
			return this.__node.cacheAsBitmap;
		},
		set cacheAsBitmap(v) {
			this.__node.cacheAsBitmap = v;
		},
		get enableRenderMerge() {
			return this.__node.enableRenderMerge;
		},
		set enableRenderMerge(v) {
			this.__node.enableRenderMerge = v;
		},
		get graphics() {
			return this.__node.graphics;
		},
		set graphics(v) {
			this.__node.graphics = v;
		},
		get height() {
			return this.__node.height;
		},
		set height(v) {
			this.__node.height = v;
		},
		get hitArea() {
			return this.__node.hitArea;
		},
		set hitArea(v) {
			this.__node.hitArea = v;
		},
		get mask() {
			if (this.__node.mask) {
				return this.__node.mask.__sealer;
			}
			return null;
		},
		set mask(v) {
			this.__node.mask = v.__node;
		},
		get mouseEnabled() {
			return this.__node.mouseEnabled;
		},
		set mouseEnabled(v) {
			this.__node.mouseEnabled = v;
		},
		get mouseThrough() {
			return this.__node.mouseThrough;
		},
		set mouseThrough(v) {
			this.__node.mouseThrough = v;
		},
		get mouseX() {
			return this.__node.mouseX;
		},
		get mouseY() {
			return this.__node.mouseY;
		},
		get optimizeFloat() {
			return this.__node.optimizeFloat;
		},
		set optimizeFloat(v) {
			this.__node.optimizeFloat = v;
		},
		get pivotX() {
			return this.__node.pivotX;
		},
		set pivotX(v) {
			this.__node.pivotX = v;
		},
		get pivotY() {
			return this.__node.pivotY;
		},
		set pivotY(v) {
			this.__node.pivotY = v;
		},
		get rotation() {
			return this.__node.rotation;
		},
		set rotation(v) {
			this.__node.rotation = v;
		},
		get scaleX() {
			return this.__node.scaleX;
		},
		set scaleX(v) {
			this.__node.scaleX = v;
		},
		get scaleY() {
			return this.__node.scaleY;
		},
		set scaleY(v) {
			this.__node.scaleY = v;
		},
		get scrollRect() {
			return this.__node.scrollRect;
		},
		set scrollRect(v) {
			this.__node.scrollRect = v;
		},
		get skewX() {
			return this.__node.skewX;
		},
		set skewX(v) {
			this.__node.skewX = v;
		},
		get skewY() {
			return this.__node.skewY;
		},
		set skewY(v) {
			this.__node.skewY = v;
		},
		get stage() {
			return this.__node.stage;
		},
		get staticCache() {
			return this.__node.staticCache;
		},
		set staticCache(v) {
			this.__node.staticCache = v;
		},
		get transform() {
			return this.__node.transform;
		},
		set transform(v) {
			this.__node.transform = v;
		},
		get viewHeight() {
			return this.__node.viewHeight;
		},
		get viewWidth() {
			return this.__node.viewWidth;
		},
		get visible() {
			return this.__node.visible;
		},
		set visible(v) {
			this.__node.visible = v;
		},
		get width() {
			return this.__node.width;
		},
		set width(v) {
			this.__node.width = v;
		},
		get x() {
			return this.__node.x;
		},
		set x(v) {
			this.__node.x = v;
		},
		get y() {
			return this.__node.y;
		},
		set y(v) {
			this.__node.y = v;
		},
		get zOrder() {
			return this.__node.zOrder;
		},
		set zOrder(v) {
			this.__node.zOrder = v;
		},
		applyFilters: function() {
			this.__node.applyFilters();
		},
		ask: function(type, value) {
			return this.__node.ask(type, value);
		},
		boundPointsToParent: function(ifRotate) {
			return this.__node.boundPointsToParent(ifRotate);
		},
		childChanged: function(child) {
			this.__node.childChanged(child.__node);
		},
		customRender: function(context, x, y) {
			this.__node.customRender(context, x, y);
		},
		drawToCanvas: function(canvasWidth, canvasHeight, offsetX, offsetY) {
			return this.__node.drawToCanvas(canvasWidth, canvasHeight, offsetX, offsetY);
		},
		fromParentPoint: function(point) {
			return this.__node.fromParentPoint(point);
		},
		getBounds: function() {
			return this.__node.getBounds();
		},
		getGraphicBounds: function() {
			return this.__node.getGraphicBounds();
		},
		getMousePoint: function() {
			return this.__node.getMousePoint();
		},
		getSelfBounds: function() {
			return this.__node.getSelfBounds();
		},
		globalToLocal: function(point, createNewPoint) {
			return this.__node.globalToLocal(point, createNewPoint);
		},
		hitTestPoint: function(x, y) {
			return this.__node.hitTestPoint(x, y);
		},
		destroyChildren: function() {
			return this.__node.destroyChildren();
		},
		isRepaint: function() {
			return this.__node.isRepaint();
		},
		loadImage: function(url, x, y, width, height, complete) {
			this.__node.graphics.clear();
			this.__node.loadImage(url, x, y, width, height, complete);
			return this;
		},
		localToGlobal: function(point, createNewPoint) {
			return this.__node.localToGlobal(point, createNewPoint);
		},
		parentRepaint: function(child) {
			this.__node.parentRepaint(child.__node);
		},
		pivot: function(x, y) {
			this.__node.pivot(x, y);
			return this;
		},
		pos: function(x, y) {
			this.__node.pos(x, y);
			return this;
		},
		reCache: function() {
			this.__node.reCache();
		},
		render: function(context, x, y) {
			this.__node.render(context, x, y);
		},
		repaint: function() {
			this.__node.repaint();
		},
		scale: function(scaleX, scaleY) {
			if (scaleY == undefined) {
				scaleY = scaleX;
			}
			this.__node.scale(scaleX, scaleY);
			return this;
		},
		setBounds: function(bound) {
			this.__node.setBounds(bound);
		},
		setStyle: function(value) {
			this.__node.setStyle(value);
		},
		setValue: function(name, value) {
			this.__node.setValue(name, value);
		},
		size: function(width, height) {
			this.__node.size(width, height);
			return this;
		},
		skew: function(skewX, skewY) {
			this.__node.skew(skewX, skewY);
			return this;
		},
		startDrag: function(area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent) {
			this.__node.startDrag(area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent);
		},
		stopDrag: function() {
			this.__node.stopDrag();
		},
		toParentPoint: function(point) {
			return this.__node.toParentPoint(point);
		},
		updateOrder: function() {
			this.__node.updateOrder();
		},
		pivotToCenter: function() {
			this.pivotX = this.width / 2;
			this.pivotY = this.height / 2;
		},
		tweenTo: function(props, duration, timingFunction, context, complete, args, delay) {
			Tween.to(this, props, duration, timingFunction, context, complete, args, delay);
			return this;
		},
		tweenFrom: function(props, duration, timingFunction, context, complete, args, delay) {
			Tween.from(this, props, duration, timingFunction, context, complete, args, delay);
			return this;
		},
		tweenCancel: function() {
			Tween.clearAll(this);
			return this;
		},
		addFilter: function(filter) {
			var a = this.__node.filters,
				n = filter.__node;
			if (a instanceof Array) {
				for (var i = 0; i < a.length; i++) {
					if (a[0] == n) {
						return;
					}
				}
				a.push(n);
			} else {
				this.__node.filters = [n];
			}
		},
		removeFilter: function(filter) {
			var a = this.__node.filters,
				n = filter.__node;
			if (a instanceof Array) {
				for (var i = 0; i < a.length; i++) {
					if (a[0] == n) {
						a.splice(i, 1);
						return true;
					}
				}
			}
			return false;
		},
		setImage: function(image) {
			if (texture.usingTexturePack) {
				this.__node.graphics.clear();
				var g = texture.getFromPackedTexture(image);
				this.__node.graphics.drawTexture(g.tex, g.sx, g.sy);
				this.__node.size(g.sw, g.sh);
			} else {
				this.loadImage(image);
			}
		},
		end: function(destroyChild) {
			this.tweenCancel()._super(destroyChild);
		}
	});
	return Sprite;
});
gbx.define("gbx/render/display/text", ["gbx/render/display/sprite"], function(Sprite) {
	var Text = Sprite.extend({
		ctor: function() {
			this.__node = new laya.display.Text;
		},
		get align() {
			return this.__node.align;
		},
		set align(v) {
			this.__node.align = v;
		},
		get alpha() {
			return this.__node.alpha;
		},
		set alpha(v) {
			this.__node.alpha = v;
		},
		get type() {
			return this.__node.type;
		},
		set type(v) {
			this.__node.type = v;
		},
		get filters() {
			return this.__node.filters;
		},
		set filters(v) {
			return this.__node.filters = v;
		},
		get bgColor() {
			return this.__node.bgColor;
		},
		set bgColor(v) {
			this.__node.bgColor = v;
		},
		get bold() {
			return this.__node.bold;
		},
		set bold(v) {
			this.__node.bold = v;
		},
		get borderColor() {
			return this.__node.borderColor;
		},
		set borderColor(v) {
			this.__node.borderColor = v;
		},
		get color() {
			return this.__node.color;
		},
		set color(v) {
			this.__node.color = v;
		},
		get font() {
			return this.__node.font;
		},
		set font(v) {
			this.__node.font = v;
		},
		get fontSize() {
			return this.__node.fontSize;
		},
		set fontSize(v) {
			this.__node.fontSize = v;
		},
		get italic() {
			return this.__node.italic;
		},
		set italic(v) {
			this.__node.italic = v;
		},
		get leading() {
			return this.__node.leading;
		},
		set leading(v) {
			this.__node.leading = v;
		},
		get maxScrollX() {
			return this.__node.maxScrollX;
		},
		get maxScrollY() {
			return this.__node.maxScrollY;
		},
		get overflow() {
			return this.__node.overflow;
		},
		set overflow(v) {
			this.__node.overflow = v;
		},
		get scrollX() {
			return this.__node.scrollX;
		},
		set scrollX(v) {
			this.__node.scrollX = v;
		},
		get scrollY() {
			return this.__node.scrollY;
		},
		set scrollY(v) {
			this.__node.scrollY = v;
		},
		get padding() {
			return this.__node.padding;
		},
		set padding(v) {
			this.__node.padding = v;
		},
		get stroke() {
			return this.__node.stroke;
		},
		set stroke(v) {
			this.__node.stroke = v;
		},
		get strokeColor() {
			return this.__node.strokeColor;
		},
		set strokeColor(v) {
			this.__node.strokeColor = v;
		},
		get text() {
			return this.__node.text;
		},
		set text(v) {
			this.__node.text = v;
		},
		get textHeight() {
			return this.__node.textHeight;
		},
		get textWidth() {
			return this.__node.textWidth;
		},
		get valign() {
			return this.__node.valign;
		},
		set valign(v) {
			this.__node.valign = v;
		},
		get wordWrap() {
			return this.__node.wordWrap;
		},
		set wordWrap(v) {
			this.__node.wordWrap = v;
		},
		get width() {
			return this.__node.width;
		},
		set width(v) {
			this.__node.width = v;
		},
		get height() {
			return this.__node.height;
		},
		set height(v) {
			this.__node.height = v;
		},
		changeText: function(text) {
			this.__node.changeText(text);
		}
	});
	var overflowSettingList = {
		get HIDDEN() {
			return laya.display.Text.HIDDEN;
		},
		get SCROLL() {
			return laya.display.Text.SCROLL;
		},
		get VISIBLE() {
			return laya.display.Text.VISIBLE;
		}
	};
	Object.defineProperty(Text, "OVERFLOW", {
		get: function() {
			return overflowSettingList;
		}
	});
	return Text;
});
gbx.define("gbx/render/filter/color", ["gbx/render/filter/filter"], function(Filter) {
	var ColorFilter = Filter.extend({
		ctor: function(mat) {
			if (mat == undefined) {
				mat = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
			}
			this.__node = new laya.filters.ColorFilter(mat);
		},
		setColorRGB: function(r, g, b) {
			this.setMatrix([r / 255, 0, 0, 0, 0, g / 255, 0, 0, 0, 0, b / 255, 0, 0, 0, 0, 1]);
		},
		setColorHex: function(hex) {
			hex = hex.replace("#", "");
			if (hex.length === 6) {
				var r = parseInt(hex.slice(0, 2), 16),
					g = parseInt(hex.slice(2, 4), 16),
					b = parseInt(hex.slice(4, 6), 16);
				this.setColorRGB(r, g, b);
			}
		},
		setMatrix: function(mat) {
			var t = new Float32Array(16);
			for (var i = 0; i < t.length; i++) {
				t[i] = mat[i];
			}
			this.__node._mat = t;
		},
		getMatrix: function() {
			return this.__node._mat;
		},
		setAlpha: function(alpha) {
			var t = new Float32Array(4);
			for (var i = 0; i < t.length; i++) {
				t[i] = alpha[i];
			}
			this.__node._alpha = t;
		},
		getAlpha: function() {
			return this.__node._alpha;
		},
		resetMatrix: function() {
			this.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
			this.setAlpha([0, 0, 0, 0]);
		}
	});
	return ColorFilter;
});
gbx.define("gbx/render/filter/filter", ["gbx/class"], function(Class) {
	var Filter = Class.extend({
		ctor: function() {
			this.__node = new laya.filters.Filter;
		},
		init: function() {
			this.ctor.apply(this, Array.prototype.slice.call(arguments, 0));
			this.__node.__sealer = this;
		},
		end: function() {
			this.__node.__sealer = null;
			delete this.__node.__sealer;
			this.__node = null;
			delete this.__node;
		}
	});
	return Filter;
});
gbx.define("gbx/render/loader", function() {
	var loader = {
			add: function(url, type) {
				if (type) {
					assets.push({
						url: url,
						type: type
					});
				} else {
					var m = url.match(/\.(\w+)$/);
					if (m && m[1] in laya.net.Loader.typeMap) {
						type = laya.net.Loader.typeMap[m[1]];
						assets.push({
							url: url,
							type: type
						});
					} else {
						console.error("not supported resource type:", url);
					}
				}
			},
			remove: function(url) {
				Laya.loader.clearRes(url);
			},
			load: function(context, complete, progress, fail) {
				var timeoutCounter, timeoutSecond = 30;

				function timeoutHandler() {
					Laya.loader.clearUnLoaded();
					fail && fail.apply(context);
				}
				timeoutCounter = setTimeout(timeoutHandler, timeoutSecond * 1e3);
				Laya.loader.load(assets, Laya.Handler.create(this, function() {
					clearTimeout(timeoutCounter);
					this.clear();
					complete.apply(context);
				}, null, true), Laya.Handler.create(this, function(percent) {
					clearTimeout(timeoutCounter);
					timeoutCounter = setTimeout(timeoutHandler, timeoutSecond * 1e3);
					progress && progress.apply(context, [percent]);
				}, null, false));
			},
			loadOnce: function(url, context, complete) {
				Laya.loader.load(url, Laya.Handler.create(context, complete),null, laya.net.Loader.ATLAS);
			},
			clear: function() {
				assets.length = 0;
			},
			get: function(url) {
				return Laya.loader.getRes(url);
			},
			setFileHashTable: function(data) {
				if (!data) {
					return;
				}
				var h = {},
					p = location.protocol + "//" + location.host + location.pathname.replace("index.html", "");
				for (var key in data) {
					h[p + key] = data[key];
				}
				Laya.Loader.hashtable = h;
			}
		},
		assets = [];
	return loader;
});
gbx.define("gbx/render/media/sound_manager", ["gbx/class"], function(Class) {
	var soundManager = new laya.media.SoundManager;
	return soundManager;
});
gbx.define("gbx/render/schema", ["gbx/class", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/button"], function(Class, Sprite, Text, Button) {
	var registedTypeList = {};
	var Schema = Class.extend({
		init: function(map) {
			this._maps = [];
			this._nodes = [];
			if (map) {
				this.add(map);
			}
		},
		add: function(map) {
			if (map instanceof Array) {
				for (var i = 0; i < map.length; i++) {
					this.add(map[i]);
				}
			} else {
				this._maps.push(map);
			}
		},
		query: function(key, value, _elem) {
			if (!_elem) {
				_elem = this._maps;
			}
			for (var i = 0; i < _elem.length; i++) {
				if (_elem[i].props[key] === value) {
					return _elem[i];
				}
				if ("childs" in _elem[i].props) {
					var ret = this.query(key, value, _elem[i].props.childs);
					if (ret) {
						return ret;
					}
				}
			}
			return null;
		},
		construct: function() {
			this.clear();
			for (var i = 0; i < this._maps.length; i++) {
				var map = this._maps[i],
					node = createNode(map);
				if (node) {
					this._nodes.push(node);
				}
			}
		},
		appendTo: function(node) {
			if (!this._nodes.length) {
				this.construct();
			}
			node.addChildrenList(this._nodes);
			this._nodes = [];
		},
		clear: function() {
			for (var i = 0; i < this._nodes.length; i++) {
				this._nodes[i].destroy(true);
			}
			this._nodes = [];
		},
		destroy: function() {
			this.clear();
			this._maps = [];
		}
	});
	var createNode = function(map) {
		var type = map.type,
			props = map.props,
			exec = map.exec,
			ctor = map.ctor,
			expo = map.expo;
		var Class;
		if (typeof type === "string") {
			Class = registedTypeList[type.toLowerCase()];
		} else if (typeof type === "function") {
			Class = type;
		}
		if (Class) {
			if (ctor instanceof Array) {
				var node = new(Class.bind.apply(Class, [null].concat(ctor)));
			} else {
				var node = new Class;
			}
			for (var key in props) {
				if (key === "childs") {
					for (var i = 0; i < props.childs.length; i++) {
						var child = createNode(props.childs[i]);
						node.addChild(child);
					}
				} else if (key in node) {
					if (typeof node[key] === "function") {
						node[key].apply(node, props[key]);
					} else {
						node[key] = props[key];
					}
				} else {
					gbx.log(type + "'s prop " + key + " is not exist.");
				}
			}
			if (exec) {
				for (var i = 0; i < exec.length; i++) {
					var fn = exec[i][0],
						args = exec[i].slice(1);
					node[fn].apply(node, args);
				}
			}
			if (expo) {
				if (typeof expo === "string") {
					window[expo] = node;
				} else if ("mount" in expo && "name" in expo) {
					expo.mount[expo.name] = node;
				}
			}
			return node;
		}
		gbx.log("type " + type + " is not registed.");
	};
	var registerType = function(type, Class) {
		registedTypeList[type.toLowerCase()] = Class;
	};
	registerType("Sprite", Sprite);
	registerType("Text", Text);
	registerType("Button", Button);
	Schema.globalRegisterType = function(type, Class) {
		registerType(type, Class);
	};
	Schema.construct = function(map) {
		return createNode(map);
	};
	Schema.append = function(parent, childs) {
		var schema = new Schema(childs);
		schema.appendTo(parent);
	};
	return Schema;
});
gbx.define("gbx/render/stage", function() {
	var _futp = false,
		stage = {
			get SCALE_MODE() {
				return scaleMode;
			},
			get ORIENTATION() {
				return orientation;
			},
			get ALIGNMENT() {
				return alignment;
			},
			get VERTICAL_ALIGNMENT() {
				return verticalAlignment;
			},
			get FRAME_SPEED() {
				return frameSpeed;
			},
			set bgColor(v) {
				Laya.stage.bgColor = v;
			},
			get canvasRotation() {
				return Laya.stage.canvasRotation;
			},
			get clientScaleX() {
				return Laya.stage.clientScaleX;
			},
			get clientScaleY() {
				return Laya.stage.clientScaleY;
			},
			get designHeight() {
				return Laya.stage.desginHeight;
			},
			get designWidth() {
				return Laya.stage.desginWidth;
			},
			get now() {
				return Laya.stage.now;
			},
			get utp() {
				return _futp;
			},
			get mouseX() {
				return Laya.stage.mouseX;
			},
			get mouseY() {
				return Laya.stage.mouseY;
			},
			get offset() {
				return Laya.stage.offset;
			},
			get renderingEnabled() {
				return Laya.stage.renderingEnabled;
			},
			set renderingEnabled(v) {
				Laya.stage.renderingEnabled = v;
			},
			initStageWithSize: function(width, height) {
				Laya.init(width, height, laya.webgl.WebGL);
			},
			setScaleMode: function(scaleMode) {
				Laya.stage.scaleMode = scaleMode;
			},
			setOrientation: function(orientation) {
				Laya.stage.screenMode = orientation;
			},
			setAlignment: function(alignment) {
				Laya.stage.alignH = alignment;
			},
			setVerticalAligmnent: function(verticalAlignment) {
				Laya.stage.alignV = verticalAlignment;
			},
			setFrameSpeed: function(frameSpeed) {
				Laya.stage.frameRate = frameSpeed;
			},
			repaint: function() {
				Laya.stage.repaint();
			},
			parentRepaint: function(child) {
				Laya.stage.parentRepaint(child.__node);
			},
			setScreenSize: function(screenWidth, screenHeight) {
				Laya.stage.setScreenSize(screenWidth, screenHeight);
			},
			size: function(width, height) {
				Laya.stage.size(width, height);
			},
			getContext: function(context) {
				return Laya.Render.canvas.getContext(context);
			},
			useTexturePack: function() {
				_futp = true;
			},
			showCursor: function() {
				Laya.Render._mainCanvas.source.style.cursor = "auto";
			},
			hideCursor: function() {
				Laya.Render._mainCanvas.source.style.cursor = "none";
			},
			getChildByName: function(name) {
				return Laya.stage.getChildByName(name).__sealer;
			}
		},
		scaleMode = {
			get SHOW_ALL() {
				return laya.display.Stage.SCALE_SHOWALL;
			},
			get EXTRACT_FIT() {
				return laya.display.Stage.SCALE_EXACTFIT;
			},
			get NONE() {
				return laya.display.Stage.SCALE_NOSCALE;
			},
			get NO_BORDER() {
				return laya.display.Stage.SCALE_NOBORDER;
			},
			get FIXED_HEIGHT() {
				return laya.display.Stage.SCALE_FIXED_HEIGHT;
			},
			get FIXED_WIDTH() {
				return laya.display.Stage.SCALE_FIXED_WIDTH;
			},
			get FULL() {
				return laya.display.Stage.SCALE_FULL;
			}
		},
		orientation = {
			get LANDSCAPE() {
				return laya.display.Stage.SCREEN_HORIZONTAL;
			},
			get PORTRAIT() {
				return laya.display.Stage.SCREEN_VERTICAL;
			},
			get AUTO() {
				return laya.display.Stage.SCREEN_NONE;
			}
		},
		alignment = {
			get LEFT() {
				return laya.display.Stage.ALIGN_LEFT;
			},
			get CENTER() {
				return laya.display.Stage.ALIGN_CENTER;
			},
			get RIGHT() {
				return laya.display.Stage.ALIGN_RIGHT;
			}
		},
		verticalAlignment = {
			get TOP() {
				return laya.display.Stage.ALIGN_TOP;
			},
			get MIDDLE() {
				return laya.display.Stage.ALIGN_MIDDLE;
			},
			get BOTTOM() {
				return laya.display.Stage.ALIGN_BOTTOM;
			}
		},
		frameSpeed = {
			get FAST() {
				return laya.display.Stage.FRAME_FAST;
			},
			get AUTO() {
				return laya.display.Stage.FRAME_MOUSE;
			},
			get SLOW() {
				return laya.display.Stage.FRAME_SLOW;
			}
		};
	return stage;
});
gbx.define("gbx/render/texture", ["gbx/render/stage"], function(stage) {
	var packedData, texture = {
		get usingTexturePack() {
			return stage.utp;
		},
		setPackedDataFile: function(data) {
			packedData = data;
		},
		getPack: function(url) {
			if (url in packedData.sheets) {
				return packedData.sheets[url].src;
			}
		},
		getFromPackedTexture: function(url) {
			var inf = packedData.sheets[url];
			if (!inf) {
				throw url + " was not found on packed texture data.";
			}
			var pkg = Laya.loader.getRes(inf.src),
				tex = laya.resource.Texture.createFromTexture(pkg, inf.x, inf.y, inf.w, inf.h);
			if (!tex) {
				throw url + " defined in " + inf.src + " but not load on this scene.";
			}
			return {
				tex: tex,
				sw: inf.ow,
				sh: inf.oh,
				sx: inf.ox,
				sy: inf.oy,
				uri: url
			};
		},
		createFromURL: function(url) {
			var tex = Laya.loader.getRes(url);
			return tex;
		},
		createFromTexture: function(tex, sx, sy, sw, sh) {
			return laya.resource.Texture.createFromTexture(tex, sx, sy, sw, sh);
		}
	};
	return texture;
});
gbx.define("gbx/render/tween", ["gbx/class"], function(Class) {
	var Tween = Class.extend({
		init: function(tween) {
			if (tween && tween.__className && tween.__className == "laya.utils.Tween") {
				this.__node = tween;
			} else {
				this.__node = new laya.utils.Tween;
			}
			this.__node.__sealer = this;
		},
		get gid() {
			return this.__node.gid;
		},
		clear: function() {
			this.__node.clear();
		},
		complete: function() {
			this.__node.complete();
		},
		from: function(target, props, duration, timingFunction, context, complete, args, delay, coverBefore) {
			var ease = getLayaTimingFunctionByName(timingFunction);
			var handler = makeHandler(target, context, complete, args);
			return this.__node.from(target.__node, props, duration, ease, handler, delay, coverBefore).__sealer;
		},
		pause: function() {
			this.__node.pause();
		},
		recover: function() {
			this.__node.recover();
		},
		restart: function() {
			this.__node.restart();
		},
		resume: function() {
			this.__node.resume();
		},
		setStartTime: function(startTime) {
			this.__node.setStartTime(startTime);
		},
		to: function(target, props, duration, timingFunction, context, complete, args, delay, coverBefore) {
			var ease = getLayaTimingFunctionByName(timingFunction);
			var handler = makeHandler(target, context, complete, args);
			return this.__node.to(target.__node, props, duration, ease, handler, delay, coverBefore).__sealer;
		},
		updateEase: function(time) {
			this.__node.updateEase(time);
		}
	});
	Tween.clear = function(tween) {
		laya.utils.Tween.clear(tween.__node);
	};
	Tween.clearAll = function(target) {
		laya.utils.Tween.clearAll(target.__node);
	};
	Tween.from = function(target, props, duration, timingFunction, context, complete, args, delay, coverBefore, autoRecover) {
		if (document.gamePauseInGame != undefined && document.gamePauseInGame) return;
		var ease = getLayaTimingFunctionByName(timingFunction);
		var handler = makeHandler(target, context, complete, args);
		var _tween = laya.utils.Tween.from(target.__node, props, duration, ease, handler, delay, coverBefore, autoRecover);
		if (_tween.__sealer) {
			return _tween.__sealer;
		}
		return new Tween(_tween);
	};
	Tween.to = function(target, props, duration, timingFunction, context, complete, args, delay, coverBefore, autoRecover) {
		if (document.gamePauseInGame != undefined && document.gamePauseInGame) return;
		var ease = getLayaTimingFunctionByName(timingFunction);
		var handler = makeHandler(target, context, complete, args);
		var _tween = laya.utils.Tween.to(target.__node, props, duration, ease, handler, delay, coverBefore, autoRecover);
		if (_tween.__sealer) {
			return _tween.__sealer;
		}
		return new Tween(_tween);
	};
	var timingFunctionList = {
		get strongIn() {
			return "strongIn";
		},
		get strongOut() {
			return "strongOut";
		},
		get strongInOut() {
			return "strongInOut";
		},
		get sineIn() {
			return "sineIn";
		},
		get sineOut() {
			return "sineOut";
		},
		get sineInOut() {
			return "sineInOut";
		},
		get quintIn() {
			return "quintIn";
		},
		get quintOut() {
			return "quintOut";
		},
		get quintInOut() {
			return "quintInOut";
		},
		get quartIn() {
			return "quartIn";
		},
		get quartOut() {
			return "quartOut";
		},
		get quartInOut() {
			return "quartInOut";
		},
		get QuadIn() {
			return "quadIn";
		},
		get QuadOut() {
			return "quadOut";
		},
		get QuadInOut() {
			return "quadInOut";
		},
		get linearIn() {
			return "linearIn";
		},
		get linearOut() {
			return "linearOut";
		},
		get linearInOut() {
			return "linearInOut";
		},
		get expoIn() {
			return "expoIn";
		},
		get expoOut() {
			return "expoOut";
		},
		get expoInOut() {
			return "expoInOut";
		},
		get elasticIn() {
			return "elasticIn";
		},
		get elasticOut() {
			return "elasticOut";
		},
		get elasticInOut() {
			return "elasticInOut";
		},
		get cubicIn() {
			return "cubicIn";
		},
		get cubicOut() {
			return "cubicOut";
		},
		get cubicInOut() {
			return "cubicInOut";
		},
		get circIn() {
			return "circIn";
		},
		get circOut() {
			return "circOut";
		},
		get circInOut() {
			return "circInOut";
		},
		get bounceIn() {
			return "bounceIn";
		},
		get bounceOut() {
			return "bounceOut";
		},
		get bounceInOut() {
			return "bounceInOut";
		},
		get backIn() {
			return "backIn";
		},
		get backOut() {
			return "backOut";
		},
		get backInOut() {
			return "backInOut";
		},
		get linearNone() {
			return "linearNone";
		}
	};
	Object.defineProperty(Tween, "TimingFunction", {
		get: function() {
			return timingFunctionList;
		}
	});

	function makeHandler(target, context, complete, args) {
		if (typeof complete == "function") {
			if (context == null) {
				context = target;
			}
			var handler = new Laya.Handler(context, complete, args, true);
		} else {
			handler = null;
		}
		return handler;
	}

	function getLayaTimingFunctionByName(name) {
		if (name in timingFunctionList) {
			return Laya.Ease[name];
		}
		return laya.utils.Tween.easeNone;
	}
	return Tween;
});