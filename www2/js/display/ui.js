gbx.define("gbx/render/ui/box", ["gbx/render/ui/component"], function(Component) {
	var Box = Component.extend({
		ctor: function() {
			this.__node = new laya.ui.Box;
		}
	});
	return Box;
});
gbx.define("gbx/render/ui/button", ["gbx/render/ui/component", "gbx/render/texture"], function(Component, texture) {
	var Button = Component.extend({
		ctor: function(skin, label) {
			this.__node = new laya.ui.Button(skin, label);
			this.context = null;
			this.handler = null;
		},
		get stateNum() {
			return this.__node.stateNum;
		},
		set stateNum(v) {
			this.__node.stateNum = v;
		},
		get label() {
			return this.__node.label;
		},
		set label(v) {
			this.__node.label = v;
		},
		get labelAlign() {
			return this.__node.labelAlign;
		},
		set labelAlign(v) {
			this.__node.labelAlign = v;
		},
		get labelPadding() {
			return this.__node.labelPadding;
		},
		set labelPadding(v) {
			this.__node.labelPadding = v;
		},
		get labelSize() {
			return this.__node.labelSize;
		},
		set labelSize(v) {
			this.__node.labelSize = v;
		},
		get labelColors() {
			return this.__node.labelColors;
		},
		set labelColors(v) {
			this.__node.labelColors = v;
		},
		get labelBold() {
			return this.__node.labelBold;
		},
		set labelBold(v) {
			this.__node.labelBold = v;
		},
		get labelStroke() {
			return this.__node.labelStroke;
		},
		set labelStroke(v) {
			this.__node.labelStroke = v;
		},
		get labelStrokeColor() {
			return this.__node.labelStrokeColor;
		},
		set labelStrokeColor(v) {
			this.__node.labelStrokeColor = v;
		},
		get toggle() {
			return this.__node.toggle;
		},
		set toggle(v) {
			this.__node.toggle = v;
		},
		get selected() {
			return this.__node.selected;
		},
		set selected(v) {
			this.__node.selected = v;
		},
		get gray() {
			return this.__node.gray;
		},
		set gray(v) {
			this.__node.gray = v;
			this.mouseEnabled = !v;
		},
		get mouseEnabled() {
			return this.__node.mouseEnabled;
		},
		set mouseEnabled(v) {
			this.__node.mouseEnabled = v;
		},
		setSkinImage: function(image) {
			if (texture.usingTexturePack) {
				var g = texture.getFromPackedTexture(image);
				this.__node._skin = g;
				this.__node.callLater(this.__node.changeClips);
				this.__node._setStateChanged();
			} else {
				this.__node.skin = image;
			}
		},
		setClickHandler: function(context, handler) {
			this.context = context;
			this.handler = handler;
			var args = Array.prototype.slice.call(arguments, 2);
			args.unshift(this);
			this.__node.clickHandler = laya.utils.Handler.create(context, handler, args, false);

			function maskDoubleClick(__node, context1, handler1, args1) {
				__node.mouseEnabled = false;
				setTimeout(function() {
					__node.mouseEnabled = true;
				}, 250);
			}
			this.on(this.EVENT.MOUSE_UP, context, maskDoubleClick, [this.__node, context, handler, args]);
		},
		clear: function() {}
	});
	return Button;
});
gbx.define("gbx/render/ui/checkbox", ["gbx/render/ui/button"], function(Button) {
	var Checkbox = Button.extend({
		ctor: function(skin, label) {
			this.__node = new laya.ui.CheckBox(skin, label);
		}
	});
	return Checkbox;
});
gbx.define("gbx/render/ui/component", ["gbx/render/display/sprite"], function(Sprite) {
	var Component = Sprite.extend({
		ctor: function() {
			this.__node = new laya.ui.Component;
		},
		init: function() {
			this._super.apply(this, Array.prototype.slice.call(arguments, 0));
			this.__nodeData = {};
		},
		get bottom() {
			return this.__node.bottom;
		},
		set bottom(v) {
			this.__node.bottom = v;
		},
		get centerX() {
			return this.__node.centerX;
		},
		set centerX(v) {
			this.__node.centerX = v;
		},
		get centerY() {
			return this.__node.centerY;
		},
		set centerY(v) {
			this.__node.centerY = v;
		},
		get disabled() {
			return this.__node.disabled;
		},
		set disabled(v) {
			this.__node.disabled = v;
		},
		get gray() {
			return this.__node.gray;
		},
		set gray(v) {
			this.__node.gray = v;
		},
		get displayHeight() {
			return this.__node.displayHeight;
		},
		get displayWidth() {
			return this.__node.displayWidth;
		},
		get left() {
			return this.__node.left;
		},
		set left(v) {
			this.__node.left = v;
		},
		get measureHeight() {
			return this.__node.measureHeight;
		},
		get measureWidth() {
			return this.__node.measureWidth;
		},
		get right() {
			return this.__node.right;
		},
		set right(v) {
			this.__node.right = v;
		},
		get scaleX() {
			return this.__node.scaleX;
		},
		get scaleY() {
			return this.__node.scaleY;
		},
		get top() {
			return this.__node.top;
		},
		set top(v) {
			this.__node.top = v;
		},
		setData: function(key, value) {
			this.__nodeData[key] = value;
		},
		getData: function(key) {
			return this.__nodeData[key];
		},
		destroy: function() {
			this.__nodeData = null;
			this._super();
		}
	});
	return Component;
});
gbx.define("gbx/render/ui/dialog", ["gbx/render/ui/view"], function(View) {
	var Dialog = View.extend({
		ctor: function() {
			this.__node = new laya.ui.Dialog;
		},
		get dragArea() {
			return this.__node.dragArea;
		},
		set dragArea(v) {
			this.__node.dragArea = v;
		},
		get isPopup() {
			return this.__node.isPopup;
		},
		get popupCenter() {
			return this.__node.popupCenter;
		},
		set popupCenter(v) {
			this.__node.popupCenter = v;
		},
		close: function(type) {
			this.__node.close(type);
		},
		closeAll: function() {
			this.__node.closeAll();
		},
		_initialize: function() {
			this.__node.initialize();
		},
		popup: function(closeOther) {
			this.__node.popup(closeOther);
		},
		show: function(closeOther) {
			this.__node.show(closeOther);
		},
		setCloseHandler: function(context, handler) {}
	});
	return Dialog;
});
gbx.define("gbx/render/ui/group", ["gbx/render/ui/box"], function(Box) {
	var Group = Box.extend({
		ctor: function(labels, skin) {
			this.__node = new laya.ui.Group(labels, skin);
		},
		get direction() {
			return this.__node.direction;
		},
		set direction(v) {
			this.__node.direction = v;
		},
		get items() {
			return this.__node.items;
		},
		get labelBold() {
			return this.__node.labelBold;
		},
		set labelBold(v) {
			this.__node.labelBold = v;
		},
		get labelColors() {
			return this.__node.labelColors;
		},
		set labelColors(v) {
			this.__node.labelColors = v;
		},
		get labelPadding() {
			return this.__node.labelPadding;
		},
		set labelPadding(v) {
			this.__node.labelPadding = v;
		},
		get labels() {
			return this.__node.labels;
		},
		set labels(v) {
			this.__node.labels = v;
		},
		get labelSize() {
			return this.__node.labelSize;
		},
		set labelSize(v) {
			this.__node.labelSize = v;
		},
		get labelStroke() {
			return this.__node.labelStroke;
		},
		set labelStroke(v) {
			this.__node.labelStroke = v;
		},
		get labelStrokeColor() {
			return this.__node.labelStrokeColor;
		},
		set labelStrokeColor(v) {
			this.__node.labelStrokeColor = v;
		},
		get selectedIndex() {
			return this.__node.selectedIndex;
		},
		set selectedIndex(v) {
			this.__node.selectedIndex = v;
		},
		get selection() {
			return this.__node.selection;
		},
		set selection(v) {
			this.__node.selection = v;
		},
		get skin() {
			return this.__node.skin;
		},
		set skin(v) {
			this.__node.skin = v;
		},
		get space() {
			return this.__node.space;
		},
		set space(v) {
			this.__node.space = v;
		},
		get stateNum() {
			return this.__node.stateNum;
		},
		set stateNum(v) {
			this.__node.stateNum = v;
		},
		get strokeColors() {
			return this.__node.strokeColors;
		},
		set strokeColors(v) {
			this.__node.strokeColors = v;
		},
		addItem: function(item, autoLayOut) {
			return this.__node.addItem(item.__node, autoLayOut);
		},
		_commitMeasure: function() {
			this.__node.commitMeasure();
		},
		delItem: function(item, autoLayOut) {
			this.__node.delItem(item.__node, autoLayOut);
		},
		initItems: function() {
			this.__node.initItems();
		},
		_preinitialize: function() {
			this.__node.preinitialize();
		},
		setSelectHandler: function(context, handler) {
			this.__node.selectHandler = laya.utils.Handler.create(context, handler, [], false);
		}
	});
	return Group;
});
gbx.define("gbx/render/ui/hslider", ["gbx/render/ui/slider"], function(Slider) {
	var HSlider = Slider.extend({
		ctor: function(skin) {
			this.__node = new laya.ui.HSlider(skin);
		}
	});
	return HSlider;
});
gbx.define("gbx/render/ui/image", ["gbx/render/ui/component", "gbx/render/texture"], function(Component, texture) {
	var Image = Component.extend({
		ctor: function(src) {
			this.__node = new laya.ui.Image(src);
		},
		get sizeGrid() {
			return this.__node.sizeGrid;
		},
		set sizeGrid(v) {
			this.__node.sizeGrid = v;
		}
	});
	return Image;
});
gbx.define("gbx/render/ui/label", ["gbx/render/ui/component"], function(Component) {
	var Label = Component.extend({
		ctor: function(text) {
			this.__node = new laya.ui.Label(text);
		},
		get align() {
			return this.__node.align;
		},
		set align(v) {
			this.__node.align = v;
		},
		get asPassword() {
			return this.__node.asPassword;
		},
		set asPassword(v) {
			this.__node.asPassword = v;
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
		get textField() {
			return this.__node.textField;
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
		}
	});
	return Label;
});
gbx.define("gbx/render/ui/list", ["gbx/render/ui/box"], function(Box) {
	var Item = Box.extend({
		ctor: function() {},
		init: function(box) {
			if ("__sealer" in box) {
				return box.__sealer;
			} else {
				this.__node = box;
				this._super();
			}
		}
	});
	var List = Box.extend({
		ctor: function() {
			this.__node = new laya.ui.List;
		},
		get array() {
			return this.__node.array;
		},
		set array(v) {
			this.__node.array = v;
		},
		get cacheContent() {
			return this.__node.cacheContent;
		},
		set cacheContent(v) {
			this.__node.cacheContent = v;
		},
		get cells() {
			return this.__node.cells.map(function(v) {
				return new Item(v);
			});
		},
		get content() {
			return this.__node.content;
		},
		get hScrollBarSkin() {
			return this.__node.hScrollBarSkin;
		},
		set hScrollBarSkin(v) {
			this.__node.hScrollBarSkin = v;
		},
		get length() {
			return this.__node.length;
		},
		get page() {
			return this.__node.page;
		},
		set page(v) {
			this.__node.page = v;
		},
		get repeatX() {
			return this.__node.repeatX;
		},
		set repeatX(v) {
			this.__node.repeatX = v;
		},
		get repeatY() {
			return this.__node.repeatY;
		},
		set repeatY(v) {
			this.__node.repeatY = v;
		},
		get scrollBar() {
			return this.__node.scrollBar;
		},
		set scrollBar(v) {
			this.__node.scrollBar = v;
		},
		get selectedIndex() {
			return this.__node.selectedIndex;
		},
		set selectedIndex(v) {
			this.__node.selectedIndex = v;
		},
		get selectedItem() {
			return this.__node.selectedItem;
		},
		set selectedItem(v) {
			this.__node.selectedItem;
		},
		get selectEnable() {
			return this.__node.selectEnable;
		},
		set selectEnable(v) {
			this.__node.selectEnable = v;
		},
		get selection() {
			return this.__node.selection;
		},
		set selection(v) {
			this.__node.selection = v;
		},
		get spaceX() {
			return this.__node.spaceX;
		},
		set spaceX(v) {
			this.__node.spaceX = v;
		},
		get spaceY() {
			return this.__node.spaceY;
		},
		set spaceY(v) {
			this.__node.spaceY = v;
		},
		get startIndex() {
			return this.__node.startIndex;
		},
		set startIndex(v) {
			this.__node.startIndex = v;
		},
		get totalPage() {
			return this.__node.totalPage;
		},
		set totalPage(v) {
			this.__node.totalPage = v;
		},
		get vScrollBarSkin() {
			return this.__node.vScrollBarSkin;
		},
		set vScrollBarSkin(v) {
			this.__node.vScrollBarSkin = v;
		},
		addItem: function(source) {
			this.__node.addItem(source);
		},
		addItemAt: function(source, index) {
			this.__node.addItemAt(source, index);
		},
		changeItem: function(index, source) {
			this.__node.changeItem(index, source);
		},
		_changeSize: function() {
			this.__node.changeSize();
		},
		_createChildren: function() {
			this.__node.createChildren();
		},
		_createItem: function() {
			return this.__node.createItem();
		},
		deleteItem: function(index) {
			this.__node.deleteItem(index);
		},
		deleteItemByName: function(name) {
			this.__node.removeChildByName(name);
		},
		getCell: function(index) {
			return this.__node.getCell(index);
		},
		getChildIndex: function(node) {
			return this.__node.getChildIndex(node);
		},
		getItem: function(index) {
			return this.__node.getItem(index);
		},
		initItems: function() {
			this.__node.initItems();
		},
		refresh: function() {
			this.__node.refresh();
		},
		_renderItem: function(cell, index) {
			this.__node.renderItem(cell, index);
		},
		scrollTo: function(index) {
			this.__node.scrollTo(index);
		},
		setContentSize: function(width, height) {
			this.__node.setContentSize(width, height);
		},
		setItem: function(index, source) {
			this.__node.setItem(index, source);
		},
		scrollTweenTo: function(index, time) {
			this.__node.tweenTo(index, time);
		},
		set direction(v) {
			if (v == List.DIRECTION.HORIZONTAL) {
				this.__node.hScrollBarSkin = "";
			} else if (v == List.DIRECTION.VERTICAL) {
				this.__node.vScrollBarSkin = "";
			}
		},
		setMouseHandler: function(context, handler) {
			this.__node.mouseHandler = laya.utils.Handler.create(context, handler, null, false);
		},
		setRenderHandler: function(context, handler) {
			this.__node.renderHandler = laya.utils.Handler.create(context, function(cell, idx) {
				handler.call(context, new Item(cell), idx);
			}, null, false);
		},
		setSelectHandler: function(context, handler) {
			this.__node.selectHandler = laya.utils.Handler.create(context, handler, null, false);
		},
		setCellSize: function(width, height) {
			function Item() {
				Item.__super.call(this);
				this.size(width, height);
			}
			Laya.class(Item, null, laya.ui.Box);
			this.__node.itemRender = Item;
		}
	});
	Object.defineProperty(List, "DIRECTION", {
		get: function() {
			return {
				HORIZONTAL: "horizontal",
				VERTICAL: "vertical"
			};
		}
	});
	return List;
});
gbx.define("gbx/render/ui/panel", ["gbx/render/ui/box"], function(Box) {
	var Panel = Box.extend({
		ctor: function() {
			this.__node = new laya.ui.Panel;
		},
		get content() {
			return this.__node.content;
		},
		get hScrollBar() {
			return this.__node.hScrollBar;
		},
		set hScrollBar(v) {
			this.__node.hScrollBar = v;
		},
		get hScrollBarSkin() {
			return this.__node.hScrollBarSkin;
		},
		set hScrollBarSkin(v) {
			this.__node.hScrollBarSkin = v;
		},
		get vScrollBar() {
			return this.__node.vScrollBar;
		},
		get vScrollBarSkin() {
			return this.__node.vScrollBarSkin;
		},
		set vScrollBarSkin(v) {
			this.__node.vScrollBarSkin = v;
		},
		refresh: function() {
			this.__node.refresh();
		},
		scrollTo: function(x, y) {
			this.__node.scrollTo(x, y);
		},
		_changeSize: function() {
			this.__node.changeSize();
		},
		_createChildren: function() {
			this.__node.createChildren();
		}
	});
	return Panel;
});
gbx.define("gbx/render/ui/slider", ["gbx/render/ui/component", "gbx/render/texture"], function(Component, texture) {
	var Slider = Component.extend({
		ctor: function(skin) {
			this.__node = new laya.ui.Slider(skin);
		},
		get allowClickBack() {
			return this.__node.allowClickBack;
		},
		set allowClickBack(v) {
			this.__node.allowClickBack = v;
		},
		get max() {
			return this.__node.max;
		},
		set max(v) {
			this.__node.max = v;
		},
		get min() {
			return this.__node.min;
		},
		set min(v) {
			this.__node.min = v;
		},
		get showLabel() {
			return this.__node.showLabel;
		},
		set showLabel(v) {
			this.__node.showLabel = v;
		},
		get tick() {
			return this.__node.tick;
		},
		set tick(v) {
			this.__node.tick = v;
		},
		get value() {
			return this.__node.value;
		},
		set value(v) {
			this.__node.value = v;
		},
		get bar() {
			return this.__node.bar;
		},
		setChangeHandler: function(context, handler) {
			this.__node.changeHandler = new Laya.Handler(context, handler);
		},
		setSkinImage: function(image) {
			if (texture.usingTexturePack) {
				if (this.__node._skin != image) {
					this.__node._skin = image;
					var g = texture.getFromPackedTexture(image),
						g2 = texture.getFromPackedTexture(image.replace(".png", "$bar.png"));
					this.__node._bg.skin = g;
					this.__node._bar.skin = g2;
					this.__node.setBarPoint();
				}
			} else {
				this.__node.skin = image;
			}
		},
		setSlider: function(min, max, value) {
			this.__node.setSlider(min, max, value);
		}
	});
	return Slider;
});
gbx.define("gbx/render/ui/tab", ["gbx/render/ui/group"], function(Group) {
	var Tab = Group.extend({
		ctor: function(labels, skin) {
			this.__node = new laya.ui.Tab(labels, skin);
		}
	});
	return Tab;
});
gbx.define("gbx/render/ui/textarea", ["gbx/render/ui/component"], function(Component) {
	var TextArea = Component.extend({
		ctor: function(text) {
			this.__node = new laya.ui.TextArea(text);
		},
		get height() {
			return this.__node.height;
		},
		set height(v) {
			this.__node.height = v;
		},
		get width() {
			return this.__node.width;
		},
		set width(v) {
			this.__node.width = v;
		},
		get hScrollBarSkin() {
			return this.__node.hScrollBarSkin;
		},
		set hScrollBarSkin(v) {
			this.__node.hScrollBarSkin = v;
		},
		get vScrollBarSkin() {
			return this.__node.vScrollBarSkin;
		},
		set vScrollBarSkin(v) {
			this.__node.vScrollBarSkin = v;
		},
		get maxScrollX() {
			return this.__node.maxScrollX;
		},
		set maxScrollX(v) {
			this.__node.maxScrollX = v;
		},
		get maxScrollY() {
			return this.__node.maxScrollY;
		},
		set maxScrollY(v) {
			this.__node.maxScrollY = v;
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
		}
	});
	return TextArea;
});
gbx.define("gbx/render/ui/textinput", ["gbx/render/ui/label", "gbx/render/texture"], function(Label, texture) {
	var TextInput = Label.extend({
		ctor: function(text) {
			this.__node = new laya.ui.TextInput(text);
		},
		get bg() {
			return this.__node.bg;
		},
		set bg(v) {
			this.__node.bg = v;
		},
		get clearOnFocus() {
			return this.__node.clearOnFocus;
		},
		set clearOnFocus(v) {
			this.__node.clearOnFocus = v;
		},
		get editable() {
			return this.__node.editable;
		},
		set editable(v) {
			this.__node.editable = v;
		},
		get inputElementXAdjuster() {
			return this.__node.inputElementXAdjuster;
		},
		set inputElementXAdjuster(v) {
			this.__node.inputElementXAdjuster = v;
		},
		get inputElementYAdjuster() {
			return this.__node.inputElementYAdjuster;
		},
		set inputElementYAdjuster(v) {
			this.__node.inputElementYAdjuster = v;
		},
		get maxChars() {
			return this.__node.maxChars;
		},
		set maxChars(v) {
			this.__node.maxChars = v;
		},
		get multiline() {
			return this.__node.multiline;
		},
		set multiline(v) {
			this.__node.multiline = v;
		},
		get restrict() {
			return this.__node.restrict;
		},
		set restrict(v) {
			this.__node.restrict = v;
		},
		get sizeGrid() {
			return this.__node.sizeGrid;
		},
		set sizeGrid(v) {
			this.__node.sizeGrid = v;
		},
		get skin() {
			return this.__node.skin;
		},
		set skin(v) {
			this.__node.skin = v;
		},
		get title() {
			return this.__node.title;
		},
		set title(v) {
			this.__node.title = v;
		},
		get prompt() {
			return this.__node.prompt;
		},
		set prompt(v) {
			this.__node.prompt = v;
		},
		set promptColor(v) {
			this.__node.promptColor = v;
		},
		get promptColor() {
			return this.__node.promptColor;
		},
		set type(v) {
			this.__node.type = v;
		},
		get type() {
			return this.__node.type;
		},
		select: function() {
			this.__node.select();
		},
		setSkinImage: function(image) {
			if (texture.usingTexturePack) {
				if (this.__node._skin != image) {
					this.__node._skin = image;
					this.__node._bg || (this.__node.graphics = this.__node._bg = new laya.ui.AutoBitmap);
					var value = texture.getFromPackedTexture(image);
					this.__node._bg.source = texture.createFromTexture(value.tex, -value.sx, -value.sy, value.sw, value.sh);
					this.__node._width && (this.__node._bg.width = this.__node._width);
					this.__node._height && (this.__node._bg.height = this.__node._height);
				}
			} else {
				this.__node.skin = image;
			}
		}
	});
	return TextInput;
});
gbx.define("gbx/render/ui/view", ["gbx/render/ui/box"], function(Box) {
	var View = Box.extend({
		ctor: function() {
			this.__node = new laya.ui.View;
		}
	});
	Object.defineProperties(View, {
		uiClassMap: {
			get: function() {
				return laya.ui.View.uiClassMap;
			}
		},
		uiMap: {
			get: function() {
				return laya.ui.View.uiMap;
			}
		}
	});
	View.createComp = laya.ui.View.createComp;
	View.regComponent = laya.ui.View.regComponent;
	View.regViewRuntime = laya.ui.View.regViewRuntime;
	return View;
});
gbx.define("gbx/render/ui/vslider", ["gbx/render/ui/slider"], function(Slider) {
	var VSlider = Slider.extend({
		ctor: function(skin) {
			this.__node = new laya.ui.VSlider(skin);
		}
	});
	return VSlider;
});