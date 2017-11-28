gbx.define("comm/base/command_ui", ["gbx/render/display/sprite"], function(Sprite) {
	var BaseUI = Sprite.extend({
		init: function() {
			this._super();
			this._commandHandler = {};
		},
		setCommand: function(cmd, fn, ctx) {
			this._commandHandler[cmd] = [fn, ctx];
		},
		runCommand: function(cmd) {
			var args = Array.prototype.slice.call(arguments, 1);
			if (cmd in this._commandHandler) {
				var fn = this._commandHandler[cmd][0],
					ctx = this._commandHandler[cmd][1];
				if (!ctx) {
					ctx = this;
				}
				return fn.apply(ctx, args);
			} else {
				throw "command " + cmd + " not set yet";
			}
		},
		end: function() {
			this._commandHandler = null;
			this._super();
		}
	});
	return BaseUI;
});
gbx.define("comm/base/confirm", ["gbx/render/display/sprite", "comm/base/command_ui", "gbx/render/stage"], function(Sprite, BaseUI, stage) {
	var ConfirmDialog = BaseUI.extend({
		init: function(isDestroyAfterClose) {
			this._super();
			this.size(stage.designWidth, stage.designHeight);
			this._yesFn = null;
			this._noFn = null;
			this._destroyAfterClose = !!isDestroyAfterClose;
			var masker = new Sprite;
			masker.size(stage.designWidth, stage.designHeight);
			masker.graphics.drawRect(0, 0, stage.designWidth, stage.designHeight, "#000000");
			masker.alpha = .4;
			this.addChild(masker);
		},
		_doActionYes: function() {
			var fn;
			if (typeof this._yesFn == "function") {
				fn = this._yesFn;
			}
			this._close();
			fn && fn();
		},
		_doActionNo: function() {
			var fn;
			if (typeof this._noFn == "function") {
				fn = this._noFn;
			}
			this._close();
			fn && fn();
		},
		_close: function() {
			this._yesFn = null;
			this._noFn = null;
			if (this._destroyAfterClose) {
				this.destroy();
			} else {
				this.removeFromStage();
			}
		},
		_setCallback: function(yesContext, yesCallback, noContext, noCallback) {
			if (typeof yesContext == "function") {
				noCallback = noContext;
				noContext = yesCallback;
				yesCallback = yesContext;
				yesContext = null;
			}
			if (typeof noContext == "function") {
				noCallback = noContext;
				noContext = yesContext;
			}
			if (yesCallback) {
				this._yesFn = yesCallback.bind(yesContext);
			}
			if (noCallback) {
				this._noFn = noCallback.bind(noContext);
			}
		},
		show: function() {
			this.addToStage(5);
		},
		end: function() {
			this._yesFn = null;
			this._noFn = null;
			this._super();
		}
	});
	return ConfirmDialog;
});
gbx.define("comm/base/game_ui", ["comm/base/command_ui", "comm/ui/marquee"], function(CommandUI, Marquee) {
	var BaseUI = CommandUI.extend({
		init: function() {
			this._super();
			this.messageBar = new Marquee(false, true, false);
			this.messageBar.pos(640, 20);
			this.messageBar.zOrder = 10;
			this.addChild(this.messageBar);
			this.subscribe("global.trumpet.update", this, this.onBoardCastMessage);
		},
		onBoardCastMessage: function(context) {
			this.messageBar.clear();
			this.messageBar.setText(context);
		}
	});
	return BaseUI;
});
gbx.define("comm/base/poker_card", ["gbx/render/display/sprite", "gbx/render/tween", "comm/ui/ui_utils"], function(Sprite, Tween, uiUtils) {
	var Card = Sprite.extend({
		init: function() {
			this._super();
			this.size(213, 296);
			this.pivotToCenter();
			this._value = 0;
			this._point = 0;
			this._color = 0;
			this._scale = 1;
			this._backSp = new Sprite;
			this._backSp.setImage("assets/main/card/cardback.png");
			this.addChild(this._backSp);
			this._faceSp = new Sprite;
			this.addChild(this._faceSp);
			this.showBack();
		},
		showBlurry: function() {},
		show: function() {
			this.visible = true;
			this.alpha = 1;
		},
		hide: function() {
			this.visible = false;
		},
		showBack: function() {
			this._backSp.visible = true;
			this._faceSp.visible = false;
		},
		showFace: function() {
			this._backSp.visible = false;
			this._faceSp.visible = true;
		},
		get cardValue() {
			return this._value;
		},
		get isShowingFace() {
			return this._faceSp.visible;
		},
		setScale: function(value) {
			this._scale = value;
			this.scale(value);
		},
		_setCardValue: function(value, point, color) {
			if (point < 1 || point > 15 || point == 14 && color != 1 || point == 15 && color != 1 || point < 14 && color > 4 || color < 1) {
				console.log("错误的牌值:", {
					value: value,
					point: point,
					color: color
				});
				return;
			}
			var imgsrc = "assets/main/card/" + point + "_" + color + ".png";
			this._faceSp.setImage(imgsrc);
			this._value = value;
			this._point = point;
			this._color = color;
		},
		_flipTo: function(totalTime, side, context, endCallback) {
			if (side == 1) {
				this._backSp.visible = true;
				this._faceSp.visible = false;
			} else {
				this._backSp.visible = false;
				this._faceSp.visible = true;
			}
			this.horizonFlip(side, totalTime, context, endCallback);
		},
		horizonFlip: function(side, totalTime, context, endCallback) {
			this.tweenTo({
				scaleX: 0
			}, totalTime / 2, null, this, function() {
				if (side == 1) {
					this._backSp.visible = false;
					this._faceSp.visible = true;
				} else {
					this._backSp.visible = true;
					this._faceSp.visible = false;
				}
			});
			this.tweenTo({
				scaleX: this._scale
			}, totalTime / 2, null, context, endCallback, null, totalTime / 2);
		},
		verticalFlip: function(side, totalTime, context, endCallback) {
			this.tweenTo({
				scaleY: 0
			}, totalTime / 2, null, this, function() {
				if (side == 1) {
					this._backSp.visible = false;
					this._faceSp.visible = true;
				} else {
					this._backSp.visible = true;
					this._faceSp.visible = false;
				}
			});
			this.tweenTo({
				scaleY: this._scale
			}, totalTime / 2, null, context, endCallback, null, totalTime / 2);
		},
		flipToBack: function(context, endCallback) {
			this._flipTo(200, 0, context, endCallback);
		},
		flipToFace: function(context, endCallback) {
			this._flipTo(200, 1, context, endCallback);
		},
		flyTo: function(x, y, context, endCallback) {
			this.tweenTo({
				x: x,
				y: y
			}, 200, Tween.TimingFunction.sineIn, context, endCallback);
		},
		flyToAndScaleWithTime: function(x, y, scaleFrom, scaleTo, time, context, endCallback) {
			this.setScale(scaleFrom);
			this._scale = scaleTo;
			this.tweenTo({
				x: x,
				y: y,
				scaleX: scaleTo,
				scaleY: scaleTo
			}, time, Tween.TimingFunction.sineOut, context, endCallback);
		},
		end: function() {
			this._backSp = null;
			this._faceSp = null;
			this._super();
		}
	});
	return Card;
});