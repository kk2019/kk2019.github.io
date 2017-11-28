gbx.define("comm/ui/bitmap_number", ["gbx/render/display/sprite", "gbx/render/loader", "gbx/render/texture"], function(Sprite, loader, texture) {
	var BitmapNumber = Sprite.extend({
		init: function(number, textureSrc, chars) {
			this._super();
			this._chars = chars;
			this.changeTexture(textureSrc);
			this._number = number;
			this._align = 0;
			if (chars == undefined) {
				chars = "0123456789";
			}
			this._drawNumber();
		},
		set text(v) {
			if (this._number != v) {
				this._number = v;
				this._drawNumber();
			}
		},
		get text() {
			return this._number;
		},
		pivotToLeft: function() {
			this._align = 0;
			this.pivot(0, this.height / 2);
		},
		pivotToCenter: function() {
			this._align = 1;
			this._super();
		},
		pivotToRight: function() {
			this._align = 2;
			this.pivot(this.width, this.height / 2);
		},
		changeTexture: function(textureSrc) {
			if (texture.usingTexturePack) {
				this._texture = texture.getFromPackedTexture(textureSrc);
				this._frameWidth = this._texture.sw / this._chars.length;
				this._frameHeight = this._texture.sh;
				this._texture = this._texture.tex;
			} else {
				this._texture = loader.get(textureSrc);
				this._frameWidth = this._texture.sourceWidth / this._chars.length;
				this._frameHeight = this._texture.sourceHeight;
			}
		},
		_drawNumber: function() {
			this.graphics.clear();
			var t = "" + this._number,
				width = this._frameWidth,
				height = this._frameHeight;
			for (var i = 0; i < t.length; i++) {
				var n = this._chars.indexOf(t[i]);
				if (n > -1) {
					var x = texture.createFromTexture(this._texture, n * width, 0, width, height);
					this.graphics.drawTexture(x, i * width, 0, width, height);
				}
			}
			this.size(t.length * width, height);
			if (this._align === 1) {
				this.pivotToCenter();
			} else if (this._align === 2) {
				this.pivotToRight();
			} else {
				this.pivotToLeft();
			}
		}
	});
	return BitmapNumber;
});
gbx.define("comm/ui/connect_loading", ["gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/display/animation", "gbx/render/stage"], function(Sprite, Text, Animation, stage) {
	var loading;
	var Loading = Sprite.extend({
		init: function() {
			this._super();
			this.size(stage.designWidth, stage.designHeight);
			this.on(this.EVENT.MOUSE_DOWN, this);
			var masker = new Sprite;
			masker.size(stage.designWidth, stage.designHeight);
			masker.graphics.drawRect(0, 0, stage.designWidth, stage.designHeight, "#000000");
			masker.alpha = .5;
			this.addChild(masker);
			var backrect = new Sprite;
			backrect.setImage("assets/main/common/loading/loadingbg.png");
			backrect.size(242, 242);
			backrect.pivotToCenter();
			backrect.name = "rect";
			backrect.pos(stage.designWidth / 2, stage.designHeight / 2);
			this.addChild(backrect);
			var icon = new Animation;
			icon.setFrames("assets/main/common/loading/clouddownload.png", 1, 16);
			icon.size(85, 85);
			icon.pivotToCenter();
			icon.name = "icon";
			icon.loop = true;
			icon.interval = 66;
			icon.pos(backrect.width / 2, backrect.height / 3);
			backrect.addChild(icon);
		},
		addToStage: function(zOrder) {
			this._super(zOrder);
			this.getChildByName("rect", "icon").play(0, true);
		},
		removeFromStage: function() {
			this.getChildByName("rect", "icon").stop();
			this._super();
		}
	});
	var tid, wms = 500;
	var isLoading = false;
	return {
		show: function() {
			if (isLoading) return;
			isLoading = true;
			if (!loading) {
				loading = new Loading;
			}
			clearTimeout(tid);
			tid = setTimeout(function() {
				loading.addToStage(10);
			}, wms);
		},
		hide: function() {
			if (!isLoading) return;
			isLoading = false;
			if (tid > 0) {
				loading.removeFromStage();
			}
			clearTimeout(tid);
			tid = 0;
		}
	};
});
gbx.define("comm/ui/custom_tab", ["comm/ui/sound_button", "gbx/render/ui/group"], function(Button, Group) {
	var MultiButtonTab = Group.extend({
		init: function() {
			this._super();
			this.initItems();
		},
		addTab: function(skin) {
			var tabItem = new Button;
			tabItem.setSkinImage(skin);
			this.addItem(tabItem);
		}
	});
	return MultiButtonTab;
});
gbx.define("comm/ui/marquee", ["gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "comm/helper/trumpet_mgr"], function(Sprite, Text, Button, trumpetMgr) {
	var Marquee = Sprite.extend({
		init: function(showPostButton, autoHide, autoPlay) {
			this._super();
			var bg = new Sprite;
			bg.setImage("assets/main/common/marquee/message_bg.png");
			bg.scaleX = .55;
			bg.scaleY = .8;
			bg.pos(0, 10);
			this.addChild(bg);
			this._playing = false;
			this._queue = [];
			this._isAuto = false;
			this._isAutoHide = !!autoHide;
			if (showPostButton === undefined) {
				showPostButton = true;
			}
			if (autoPlay === undefined) {
				autoPlay = true;
			}
			var marqueeTextMasker = new Sprite;
			marqueeTextMasker.size(440, 30);
			marqueeTextMasker.graphics.drawRect(0, 0, marqueeTextMasker.width, marqueeTextMasker.height, "#000000");
			var marqueeTextContainer = new Sprite;
			marqueeTextContainer.size(450, 30);
			marqueeTextContainer.pos(30, 8);
			marqueeTextContainer.mask = marqueeTextMasker;
			marqueeTextContainer.name = "container";
			this.addChild(marqueeTextContainer);
			var messageText = new Text;
			messageText.color = "#E0F0EF";
			messageText.fontSize = 19;
			messageText.align = "left";
			messageText.name = "text";
			marqueeTextContainer.addChild(messageText);
			var messageBtn = new Button;
			messageBtn.setSkinImage("assets/main/common/marquee/button_speaker.png");
			messageBtn.stateNum = 1;
			messageBtn.pos(-50, -17);
			messageBtn.setClickHandler(this, this.openTrumpet);
			messageBtn.visible = showPostButton;
			this.addChild(messageBtn);
			this.visible = false;
			if (autoPlay) {
				this._autoPlay();
			}
		},
		_play: function() {
			this._playing = true;
			if (!this.visible) {
				this.visible = true;
			}
			if (this._queue.length) {
				var txt = this._queue.shift(),
					messageText = this.getChildByName("container", "text");
				messageText.pos(450, 5);
				messageText.text = txt;
				var w = messageText.textWidth + 20,
					t = (w + 450) / .08;
				messageText.tweenTo({
					x: -w
				}, t, "linearInOut", this, this._play);
			} else {
				this._playing = false;
				if (this._isAutoHide) {
					this.visible = false;
				}
				if (this._isAuto) {
					this._isAuto = false;
					this._timeoutID = setTimeout(this._autoPlay.bind(this), 18e4);
				}
				this.visible = false;
			}
		},
		setText: function(txt) {
			this._queue.push(txt);
			if (!this._playing) {
				this._play();
			}
		},
		openTrumpet: function() {},
		clear: function() {
			if (this._isAuto) {
				this._queue = [];
				this._isAuto = false;
				clearTimeout(this._timeoutID);
			}
		},
		_autoPlay: function() {
			this._isAuto = true;
			var history = trumpetMgr.getTrumpetHistory();
			for (var i = 0; i < history.length; i++) {
				this.setText(history[i]);
			}
		},
		end: function() {
			clearTimeout(this._timeoutID);
			this._super();
		}
	});
	return Marquee;
});
gbx.define("comm/ui/net_error", ["gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "comm/base/command_ui", "gbx/render/stage"], function(Sprite, Text, Button, BaseUI, stage) {
	var NetErrorAlert = BaseUI.extend({
		init: function(msg, yesContext, yesCallback) {
			this._super();
			this.size(stage.designWidth, stage.designHeight);
			this._yesFn = null;
			var masker = new Sprite;
			masker.size(stage.designWidth, stage.designHeight);
			masker.graphics.drawRect(0, 0, stage.designWidth, stage.designHeight, "#000000");
			masker.alpha = .4;
			this.addChild(masker);
			var box = new Sprite;
			box.setImage("assets/main/common/error/panel_mini.png");
			box.pos((this.width - box.width) / 2, (this.height - box.height) / 2);
			box.name = "box";
			this.addChild(box);
			var title = new Sprite;
			title.setImage("assets/main/common/error/icon_link_error.png");
			title.pivotToCenter();
			title.pos(box.width / 2, 130);
			title.name = "icon";
			box.addChild(title);
			var content = new Text;
			content.fontSize = 24;
			content.color = "#ffffff";
			content.pos(10, 240);
			content.align = "center";
			content.leading = 5;
			content.width = box.width - 20;
			content.name = "content";
			box.addChild(content);
			var yesBtn = new Button;
			yesBtn.setSkinImage("assets/main/public/button_8.png");
			yesBtn.stateNum = 2;
			yesBtn.pos(150, 280);
			yesBtn.name = "btn";
			var sp = new Sprite;
			sp.setImage("assets/main/public/sureBtn.png");
			sp.pos(62, 16);
			yesBtn.addChild(sp);
			yesBtn.setClickHandler(this, this.yes);
			box.addChild(yesBtn);
			content.text = msg;
			this._setCallback(yesContext, yesCallback);
			this.show();
		},
		yes: function() {
			var fn;
			if (typeof this._yesFn == "function") {
				fn = this._yesFn;
			}
			this._close();
			fn && fn();
		},
		_close: function() {
			this._yesFn = null;
			this.destroy();
		},
		_setCallback: function(yesContext, yesCallback) {
			if (yesCallback) {
				this._yesFn = yesCallback.bind(yesContext);
			}
		},
		show: function() {
			this.addToStage(5);
		},
		end: function() {
			this._yesFn = null;
			this._super();
		}
	});
	return NetErrorAlert;
});
gbx.define("comm/ui/popup", ["gbx/render/display/sprite", "comm/base/command_ui", "comm/ui/sound_button", "gbx/render/stage"], function(Sprite, BaseUI, Button, stage) {
	var typeSkin = ["assets/main/common/popup/panel_base.png", "assets/main/common/popup/panel_base_big.png"],
		typeSize = [{
			width: 1015,
			height: 710
		}, {
			width: 1219,
			height: 710
		}],
		padding = [{
			top: 101,
			right: 46,
			bottom: 47,
			left: 46
		}, {
			top: 101,
			right: 46,
			bottom: 47,
			left: 46
		}];
	var PopupDialog = BaseUI.extend({
		init: function(type, once) {
			this._super();
			this.size(stage.designWidth, stage.designHeight);
			this._closeFn = null;
			this._once = false;
			var masker = new Sprite;
			masker.size(stage.designWidth, stage.designHeight);
			masker.graphics.drawRect(0, 0, stage.designWidth, stage.designHeight, "#000000");
			masker.alpha = .4;
			this.addChild(masker);
			if (type == undefined) {
				type = 0;
			}
			if (once === true) {
				this._once = true;
			}
			var box = new Sprite;
			box.setImage(typeSkin[type]);
			box.size(typeSize[type].width, typeSize[type].height);
			box.pos((stage.designWidth - box.width) / 2, (stage.designHeight - box.height) / 2);
			box.name = "box";
			this.addChild(box);
			var closeBtn = new Button;
			closeBtn.setSkinImage("assets/main/common/popup/button_closepanel.png");
			closeBtn.stateNum = 1;
			closeBtn.pos(typeSize[type].width - 95, 17);
			closeBtn.setClickHandler(this, this._closePopupDialog);
			box.addChild(closeBtn);
			var content = new Sprite;
			content.size(typeSize[type].width - padding[type].left - padding[type].right, typeSize[type].height - padding[type].top - padding[type].bottom);
			content.pos(padding[type].left, padding[type].top);
			content.name = "content";
			box.addChild(content);
			var title = new Sprite;
			title.pos(typeSize[type].width / 2, 35);
			title.name = "title";
			box.addChild(title);
		},
		_closePopupDialog: function() {
			if (this._once) {
				this._closeFn && this._closeFn();
				this.destroy();
			} else {
				this.removeFromStage();
				this._closeFn && this._closeFn();
			}
		},
		get content() {
			return this.getChildByName("box").getChildByName("content");
		},
		get title() {
			return this.getChildByName("box").getChildByName("title");
		},
		show: function() {
			this.addToStage(5);
		},
		hide: function() {
			this._closePopupDialog();
		},
		setCloseCallback: function(fn, context) {
			if (typeof fn == "function") {
				this._closeFn = fn.bind(context);
			}
		},
		end: function() {
			this._closeFn = null;
			this._super();
		}
	});
	return PopupDialog;
});
gbx.define("comm/ui/scalable_sprite", ["gbx/render/display/sprite", "gbx/render/loader", "gbx/render/texture"], function(Sprite, loader, texture) {
	var ScalableSprite = Sprite.extend({
		init: function(textureSrc, gridTop, gridRight, gridBottom, gridLeft) {
			this._super();
			this._gridInfo = [gridTop || 0, gridRight || 0, gridBottom || 0, gridLeft || 0];
			this._gridSize = [];
			this._setTexture(textureSrc);
		},
		size: function(width, height) {
			this._super(width, height);
			this._calcGridSize();
			this.callLater(this._paint);
		},
		changeTexture: function(textureSrc) {
			this._setTexture(textureSrc);
			this.callLater(this._paint);
		},
		_paint: function() {
			for (var i = 0; i < this._gridSize.length; i++) {
				var texInfo = this._texSize[i],
					gridInfo = this._gridSize[i],
					x = texture.createFromTexture(this._texture, texInfo.x, texInfo.y, texInfo.w, texInfo.h);
				this.graphics.drawTexture(x, gridInfo.x, gridInfo.y, gridInfo.w, gridInfo.h);
			}
		},
		_calcGridSize: function(idx) {
			var gridTop = this._gridInfo[0],
				gridRight = this._gridInfo[1],
				gridBottom = this._gridInfo[2],
				gridLeft = this._gridInfo[3],
				width = this.width,
				height = this.height;
			this._gridSize = [{
				x: 0,
				y: 0,
				w: gridLeft,
				h: gridTop
			}, {
				x: gridLeft,
				y: 0,
				w: width - gridLeft - gridRight,
				h: gridTop
			}, {
				x: width - gridRight,
				y: 0,
				w: gridRight,
				h: gridTop
			}, {
				x: 0,
				y: gridTop,
				w: gridLeft,
				h: height - gridTop - gridBottom
			}, {
				x: gridLeft,
				y: gridTop,
				w: width - gridLeft - gridRight,
				h: height - gridTop - gridBottom
			}, {
				x: width - gridRight,
				y: gridTop,
				w: gridRight,
				h: height - gridTop - gridBottom
			}, {
				x: 0,
				y: height - gridBottom,
				w: gridLeft,
				h: gridBottom
			}, {
				x: gridLeft,
				y: height - gridBottom,
				w: width - gridLeft - gridRight,
				h: gridBottom
			}, {
				x: width - gridRight,
				y: height - gridBottom,
				w: gridRight,
				h: gridBottom
			}];
		},
		_setTexture: function(textureSrc) {
			this._texture = loader.get(textureSrc);
			var width = this._texture.sourceWidth,
				height = this._texture.sourceHeight,
				gridTop = this._gridInfo[0],
				gridRight = this._gridInfo[1],
				gridBottom = this._gridInfo[2],
				gridLeft = this._gridInfo[3];
			this._texSize = [{
				x: 0,
				y: 0,
				w: gridLeft,
				h: gridTop
			}, {
				x: gridLeft,
				y: 0,
				w: width - gridLeft - gridRight,
				h: gridTop
			}, {
				x: width - gridRight,
				y: 0,
				w: gridRight,
				h: gridTop
			}, {
				x: 0,
				y: gridTop,
				w: gridLeft,
				h: height - gridTop - gridBottom
			}, {
				x: gridLeft,
				y: gridTop,
				w: width - gridLeft - gridRight,
				h: height - gridTop - gridBottom
			}, {
				x: width - gridRight,
				y: gridTop,
				w: gridRight,
				h: height - gridTop - gridBottom
			}, {
				x: 0,
				y: height - gridBottom,
				w: gridLeft,
				h: gridBottom
			}, {
				x: gridLeft,
				y: height - gridBottom,
				w: width - gridLeft - gridRight,
				h: gridBottom
			}, {
				x: width - gridRight,
				y: height - gridBottom,
				w: gridRight,
				h: gridBottom
			}];
		}
	});
	return ScalableSprite;
});
gbx.define("comm/ui/scene_loading", ["gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/display/animation", "gbx/render/stage"], function(Sprite, Text, Animation, stage) {
	var loading, Loading = Sprite.extend({
		init: function() {
			this._super();
			this.size(stage.designWidth, stage.designHeight);
			this.on(this.EVENT.MOUSE_DOWN, this);
			var masker = new Sprite;
			masker.size(stage.designWidth, stage.designHeight);
			masker.graphics.drawRect(0, 0, stage.designWidth, stage.designHeight, "#000000");
			masker.alpha = .5;
			this.addChild(masker);
			var backrect = new Sprite;
			backrect.setImage("assets/main/common/loading/loadingbg.png");
			backrect.size(242, 242);
			backrect.pivotToCenter();
			backrect.name = "rect";
			backrect.pos(stage.designWidth / 2, stage.designHeight / 2);
			this.addChild(backrect);
			var icon = new Animation;
			icon.setFrames("assets/main/common/loading/clouddownload.png", 1, 16);
			icon.size(85, 85);
			icon.pivotToCenter();
			icon.name = "icon";
			icon.loop = true;
			icon.interval = 66;
			icon.pos(backrect.width / 2, backrect.height / 3);
			backrect.addChild(icon);
			var txt = new Text;
			txt.text = "加载中...";
			txt.color = "#ffffff";
			txt.fontSize = 24;
			txt.width = backrect.width;
			txt.align = "center";
			txt.pos(0, backrect.height / 3 * 2);
			txt.name = "text";
			backrect.addChild(txt);
		},
		reset: function() {
			this.getChildByName("rect", "text").text = "加载中...";
			return this;
		},
		progressTo: function(percent) {
			this.getChildByName("rect", "text").text = "加载中 " + Math.round(percent * 100) + "%";
		},
		addToStage: function(zOrder) {
			this._super(zOrder);
			this.getChildByName("rect", "icon").play(0, true);
		},
		removeFromStage: function() {
			this.getChildByName("rect", "icon").stop();
			this._super();
		}
	});
	return {
		show: function() {
			if (!loading) {
				loading = new Loading;
			}
			loading.alpha = 1;
			loading.reset().addToStage(10);
		},
		progress: function(percent) {
			loading && loading.progressTo(percent);
		},
		hide: function() {
			loading && loading.tweenTo({
				alpha: 0
			}, 400, "cubicOut", loading, loading.removeFromStage);
		}
	};
});
gbx.define("comm/ui/sound_button", ["gbx/render/ui/button", "comm/helper/sound_mgr"], function(Button, soundMgr) {
	var SeButton = Button.extend({
		init: function() {
			this._super();
			this._seUrl = "assets/main/se/button.mp3";
			this.on(this.EVENT.MOUSE_DOWN, this, this._playSoundEffect);
		},
		_playSoundEffect: function() {
			soundMgr.playSE(this._seUrl);
		},
		setSeUrl: function(url) {
			this._seUrl = url;
		},
		end: function() {
			this.off(this.EVENT.MOUSE_DOWN, this, this._playSoundEffect);
			this._super();
		}
	});
	return SeButton;
});
gbx.define("comm/ui/top_confirm", ["gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/stage", "comm/ui/sound_button", "conf/ui_locallization", "comm/ui/ui_utils"], function(Sprite, Text, stage, Button, uiLocallization, uiUtils) {
	var topConfirmBar, ConfirmBar = Sprite.extend({
		init: function() {
			this._super();
			this.maskBtn = uiUtils.createMask(null, true);
			this.maskBtn.pos(-1500, -1500);
			this.addChild(this.maskBtn);
			this.setImage("assets/main/public/background.png");
			this.pivotToCenter();
			this.pos(stage.designWidth / 2, -this.height / 2);
			this.scaleX = .8;
			this.scaleY = .8;
			var txt = new Text;
			txt.text = "";
			txt.color = "#ffffff";
			txt.fontSize = 27;
			txt.width = 430;
			txt.wordWrap = true;
			txt.multiline = true;
			txt.align = "center";
			txt.name = "text";
			txt.y = 4;
			txt.pos(40, 80);
			this.addChild(txt);
			var btn = new Button;
			btn.setSkinImage("assets/main/public/button_8.png");
			btn.stateNum = 2;
			btn.pos(50, 200);
			btn.name = "button";
			var wordSure = uiUtils.createSprite("assets/main/public/sureBtnG.png");
			wordSure.pos(50, 12);
			btn.addChild(wordSure);
			btn.setClickHandler(this, this._success);
			this.addChild(btn);
			var btn2 = new Button;
			btn2.setSkinImage("assets/main/public/button_8.png");
			btn2.stateNum = 2;
			btn2.pos(300, 200);
			var word_cancel = uiUtils.createSprite("assets/main/public/cancelG.png");
			word_cancel.pos(50, 12);
			btn2.addChild(word_cancel);
			btn2.name = "button";
			btn2.setClickHandler(this, this._abort);
			this.addChild(btn2);
		},
		_success: function() {
			var context = this._caller,
				callback = this._successCallback;
			this.hide();
			callback && callback.call(context);
		},
		_abort: function() {
			var context = this._caller,
				callback = this._failCallback;
			this.hide();
			callback && callback.call(context);
		},
		show: function(text, context, callback, failcallback) {
			this.getChildByName("text").text = text;
			this._caller = context;
			this._successCallback = callback;
			if (failcallback) this._failCallback = failcallback;
			this.pos(stage.designWidth / 2, 500);
			this.visible = true;
			this.maskBtn.visible = true;
		},
		hide: function(context, callback) {
			delete this._caller;
			delete this._successCallback;
			if (callback) delete this._failCallback;
			this.visible = false;
			this.maskBtn.visible = false;
		}
	});
	return {
		ask: function(text, context, callback, failcallback) {
			if (!topConfirmBar) {
				topConfirmBar = new ConfirmBar;
				topConfirmBar.addToStage(6);
			}
			topConfirmBar.show(text, context, callback, failcallback);
		},
		hide: function() {
			topConfirmBar.hide();
		}
	};
});
gbx.define("comm/ui/top_message", ["gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/stage", "gbx/net/errorcode_des"], function(Sprite, Text, stage, ERROR_CODE_DES) {
	var topMessageBar;
	var messages = [];
	var isShowing = false;
	var posX = 320;
	var width = 640;
	var MessageBar = Sprite.extend({
		init: function() {
			this._super();
			this.pivotToCenter();
			this.container = null;
			this.alpha = 0;
			this.pos(stage.designWidth / 2, 290);
			this.container = new Sprite;
			this.container.setImage("assets/main/common/topmessage/alpha_h2.png");
			this.container.pivotToCenter();
			this.container.pos(posX, 0);
			this.container.name = "container";
			this.addChild(this.container);
			var content = new Text;
			content.text = "";
			content.color = "#ffffff";
			content.fontSize = 22;
			content.width = width;
			content.align = "center";
			content.name = "text";
			content.pos(0, 4);
			this.container.addChild(content);
		},
		checkCurrentScene: function() {
			if (window.currentSceneName == "baccarat_table") {
				this.getChildByName("container").pos(posX, 300);
			} else {
				this.getChildByName("container").pos(posX, 120);
				this.getChildByName("container").scale(1);
			}
		},
		show: function(text, showTime, callback) {
			this.alpha = 1;
			this.getChildByName("container", "text").text = text;
			this.checkCurrentScene();
			this.timerOnce(showTime, this, function() {
				this.tweenTo({
					alpha: 0
				}, 250, "sineIn", this, function() {
					callback && callback();
				});
			});
		},
		hide: function() {
			this.alpha = 0;
		}
	});
	var checkList = function() {
		if (messages.length > 0) {
			var msg = messages.shift();
			topMessageBar.show(msg, 2e3, checkList);
		} else {
			isShowing = false;
		}
	};
	return {
		post: function(msg) {
			if (!topMessageBar) {
				topMessageBar = new MessageBar;
				topMessageBar.addToStage(6);
			}
			topMessageBar.show(msg, 2e3);
		},
		postErrorCode: function(errorCode) {
			var msg = ERROR_CODE_DES[errorCode];
			this.post(msg);
		},
		hide: function() {
			if (topMessageBar) topMessageBar.hide();
		}
	};
});
gbx.define("comm/ui/ui_utils", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/textinput", "gbx/render/ui/panel", "comm/ui/top_message", "conf/sound_paths", "comm/helper/sound_mgr", "conf/ui_locallization"], function(Sprite, Button, Text, List, TextInput, Panel, topMessage, soundPaths, soundMgr, uiLocallization) {
	var uiUtils = {
		createButton: function(path, stateNum, btnName) {
			var btn = new Button;
			if (path) btn.setSkinImage(path);
			btn.stateNum = stateNum;
			btn.pos(0, 0);
			btn.name = btnName;
			return btn;
		},
		createSprite: function(path, name) {
			var sp = new Sprite;
			sp.setImage(path);
			sp.pos(0, 0);
			sp.name = name;
			return sp;
		},
		createNormalList: function(repeatXY, x, y, Hori_Vert, width, height, cellX, cellY) {
			var list = new List;
			if (Hori_Vert == "v" || Hori_Vert == "V") list.repeatX = repeatXY;
			else list.repeatY = repeatXY;
			list.width = width;
			list.height = height;
			list.x = x;
			list.y = y;
			list.direction = List.DIRECTION.HORIZONTAL;
			if (Hori_Vert == "v" || Hori_Vert == "V") list.direction = List.DIRECTION.VERTICAL;
			list.setCellSize(cellX, cellY);
			list.cacheContent = true;
			return list;
		},
		createSimpleText: function(content, name) {
			var ret = new Text;
			ret.align = "left";
			ret.color = "#ffffff";
			ret.fontSize = 17;
			ret.name = name;
			ret.text = content;
			ret.width = 200;
			return ret;
		},
		createTextInput: function(name, promot) {
			var input = new TextInput;
			if (promot != undefined) input.prompt = promot;
			input.size(100, 50);
			input.fontSize = 22;
			input.color = "#ffffff";
			input.name = name;
			return input;
		},
		createPanel: function(sizeX, sizeY, name) {
			var panel = new Panel;
			panel.pos(5, 5);
			panel.name = name;
			panel.size(sizeX, sizeY);
			panel.vScrollBarSkin = "";
			return panel;
		},
		createMask: function(caller, noImage, path) {
			var backBtn = new Button;
			if (noImage == undefined || noImage == null) backBtn.setSkinImage("assets/main/public/mask.png");
			if (path) backBtn.setSkinImage(path);
			backBtn.width = 3e3;
			backBtn.height = 3e3;
			backBtn.pos(-1500, -1500);
			if (caller != null) {
				backBtn.size(3e3, 3e3);
				backBtn.setClickHandler(caller, function() {
					if (window.lobbyisLock) return;
					caller.visible = false;
				});
			}
			return backBtn;
		},
		createBackgroundCrash: function(caller, background) {
			background.size(background.width, background.height);
			background.on(caller.EVENT.MOUSE_UP, caller, null);
		},
		showMesage: function(msg) {
			topMessage.post(msg);
		},
		playSound: function(name, volum, callback) {
			var path = soundPaths[name];
			if (path) {
				var v = 1;
				if (volum) v = volum;
				soundMgr.playSE(path, v, callback);
			} else topMessage.post(name + uiLocallization.find_no_music);
		},
		getFloatByPower: function(number, n) {
			//number = Math.floor(number * Math.pow(10, n)) / Math.pow(10, n);
			return number;
		}
	};
	return uiUtils;
});