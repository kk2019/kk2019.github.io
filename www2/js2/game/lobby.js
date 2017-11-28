gbx.define("game/lobby/lobbypop/account_safe", ["gbx/hubs", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "game/lobby/lobbypop/bind_phone", "game/lobby/lobbypop/change_name", "game/lobby/lobbypop/change_head", "game/lobby/lobbypop/change_pass", "game/lobby/lobbypop/bind_parent", "conf/ui_locallization", "gbx/net/connector", "gbx/net/messagecommand"], function (hubs, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, BindPhone, ChangeName, ChangeHead, ChangePass, BindParent, uiLocallization, server, CMD) {
	var AccountSafe = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtnB = uiUtils.createMask(this);
			maskBtnB.name = "maskBtnB";
			maskBtnB.pos(-1500, -1500);
			this.addChild(maskBtnB);
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.name = "maskBtn";
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background_big.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/syssetting/title_safe.png", "");
			title.pos(203.5, 8);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var head_text_tip = uiUtils.createSimpleText(uiLocallization.player_head, "");
			head_text_tip.pos(88, 82);
			head_text_tip.fontSize = 20;
			head_text_tip.color = "#E0F0EF";
			this.addChild(head_text_tip);
			var headIcon = uiUtils.createSprite("assets/main/head/userhead_" + playerDataMgr.getMyHead() + ".png", "player_head");
			headIcon.scale(.8);
			headIcon.pos(370, 62);
			this.addChild(headIcon);
			var shadeX = .73;
			var shadeY = .52;
			for (var i = 0; i < 5; i++) {
				if (i == 3 && !myGlobalData.isRelease) continue;
				var shadow = uiUtils.createSprite("assets/main/public/item_bg.png", "");
				shadow.scaleX = shadeX;
				shadow.scaleY = shadeY;
				shadow.pos(83.2, 134 + 58 * i);
				this.addChild(shadow);
			}
			var arrowX = 440;
			var arrow_0 = uiUtils.createSprite("assets/main/public/arrow_1.png", "");
			arrow_0.pos(arrowX, 80);
			this.addChild(arrow_0);
			var arrow_1 = uiUtils.createSprite("assets/main/public/arrow_1.png", "");
			arrow_1.pos(arrowX, 143);
			this.addChild(arrow_1);
			var arrow_2 = uiUtils.createSprite("assets/main/public/arrow_1.png", "");
			arrow_2.pos(arrowX, 260);
			this.addChild(arrow_2);
			if (myGlobalData.isRelease) {
				var arrow_3 = uiUtils.createSprite("assets/main/public/arrow_1.png", "");
				arrow_3.pos(arrowX, 317);
				this.addChild(arrow_3);
			}
			var arrow_4 = uiUtils.createSprite("assets/main/public/arrow_1.png", "");
			arrow_4.pos(arrowX, 375);
			this.addChild(arrow_4);
			var name_tip = uiUtils.createSimpleText(uiLocallization.player_name, "");
			name_tip.pos(88, 143);
			name_tip.fontSize = 20;
			name_tip.color = "#E0F0EF";
			this.addChild(name_tip);
			var PosX = 230;
			var player_name = new Text;
			player_name.align = "right";
			player_name.color = "#B9B549";
			player_name.fontSize = 19;
			player_name.pos(PosX, 143);
			player_name.name = "player_name";
			player_name.text = playerDataMgr.getMyNick();
			player_name.width = 200;
			this.addChild(player_name);
			var changeHead = new Button;
			changeHead.size(100, 80);
			changeHead.pos(355, 50);
			changeHead.name = "changeHead";
			changeHead.setClickHandler(this, this.OnClick);
			this.addChild(changeHead);
			var changeName = new Button;
			changeName.name = "changeName";
			changeName.pos(85, 130);
			changeName.size(380, 42);
			changeName.setClickHandler(this, this.OnClick);
			this.addChild(changeName);
			var userID_tip = uiUtils.createSimpleText(uiLocallization.userID, "");
			userID_tip.fontSize = 20;
			userID_tip.color = "#E0F0EF";
			userID_tip.pos(88, 203);
			this.addChild(userID_tip);
			var userID = new Text;
			userID.align = "right";
			userID.color = "#B9B549";
			userID.fontSize = 20;
			userID.pos(PosX, 203);
			userID.text = playerDataMgr.getMyUID();
			userID.width = 200;
			this.addChild(userID);
			var phone_code_tip = uiUtils.createSimpleText(uiLocallization.phone_code, "");
			phone_code_tip.pos(88, 260);
			phone_code_tip.fontSize = 20;
			phone_code_tip.color = "#E0F0EF";
			this.addChild(phone_code_tip);
			var phone_code = new Text;
			phone_code.align = "right";
			phone_code.color = "#B9B549";
			phone_code.fontSize = 20;
			phone_code.pos(PosX, 260);
			phone_code.text = accountMgr.getUserData().account;
			phone_code.name = "player_phone";
			phone_code.width = 200;
			this.addChild(phone_code);
			var changePhone = new Button;
			changePhone.size(380, 42);
			changePhone.name = "changePhone";
			changePhone.pos(85, 250);
			changePhone.setClickHandler(this, this.OnClick);
			this.addChild(changePhone);
			if (myGlobalData.isRelease) {
				var recommandMan_tip = uiUtils.createSimpleText(uiLocallization.recommandMan, "");
				recommandMan_tip.pos(88, 317);
				recommandMan_tip.fontSize = 20;
				recommandMan_tip.color = "#E0F0EF";
				this.addChild(recommandMan_tip);
				var parentId = "";
				if (playerDataMgr.getRebateParentId() == null || playerDataMgr.getRebateParentId() == "0" || playerDataMgr.getRebateParentId().length < 2) parentId = uiLocallization.tip_no_parent;
				else parentId = playerDataMgr.getRebateParentId();
				var recommandMan = new Text;
				recommandMan.align = "right";
				recommandMan.color = "#B9B549";
				recommandMan.fontSize = 20;
				recommandMan.pos(PosX, 317);
				recommandMan.text = parentId;
				recommandMan.name = "recommandMan";
				recommandMan.width = 200;
				this.addChild(recommandMan);
				var changeRecommand = new Button;
				changeRecommand.size(380, 42);
				changeRecommand.name = "changeRecommand";
				changeRecommand.pos(85, 310);
				changeRecommand.setClickHandler(this, this.OnClick);
				this.addChild(changeRecommand);
			}
			var resetpassword_tip = uiUtils.createSimpleText(uiLocallization.resetpassword, "");
			resetpassword_tip.fontSize = 20;
			resetpassword_tip.color = "#E0F0EF";
			resetpassword_tip.pos(88, 375);
			this.addChild(resetpassword_tip);
			var pass = new Text;
			pass.align = "right";
			pass.color = "#B9B549";
			pass.name = "player_pass";
			pass.pos(PosX, 375);
			pass.fontSize = 20;
			pass.text = uiLocallization.plz_reinput_new_pass;
			pass.width = 200;
			this.addChild(pass);
			var changePass = new Button;
			changePass.size(380, 42);
			changePass.name = "changePass";
			changePass.pos(85, 365);
			changePass.setClickHandler(this, this.OnClick);
			this.addChild(changePass);
			var changeHead = new ChangeHead;
			changeHead.pos(21.5, 50);
			changeHead.name = "changeHeadPanel";
			changeHead.visible = false;
			this.addChild(changeHead);
			var bindPhone = new BindPhone;
			bindPhone.pos(21.5, 50);
			bindPhone.name = "bindPhonePanel";
			bindPhone.visible = false;
			this.addChild(bindPhone);
			var changeName = new ChangeName;
			changeName.pos(21.5, 50);
			changeName.name = "changeNamePanel";
			changeName.visible = false;
			this.addChild(changeName);
			var changePass = new ChangePass;
			changePass.pos(21.5, 50);
			changePass.name = "changePassPanel";
			changePass.visible = false;
			this.addChild(changePass);
			var bindParent = new BindParent;
			bindParent.pos(21.5, 50);
			bindParent.name = "bindParentPanel";
			bindParent.visible = false;
			this.addChild(bindParent);
			this.subscribe("account_safe.update.setBindInfo", this, this.eventBindInfo);
			this.subscribe("lobby.lobbypop.changehead", this, this.eventChangeHead);
			this.subscribe("lobby.lobbypop.changename", this, this.eventChangeName);
		},
		showMask: function (showMask) {
			this.getChildByName("maskBtnB").visible = showMask;
			this.getChildByName("maskBtn").visible = !showMask;
		},
		eventChangeName: function (name) {
			var sendMsg = gtea.protobuf.encode("RequestModifyNickName", {
				NickName: name
			}, 1, 1);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.SetPlayerInfo, 1, 1, "ReplyModifyResult");
			server.requestToGame(CMD.SetPlayerInfo, sendMsg, this, function (errorcode, data) {
				//var retData = gtea.protobuf.decode("SetPlayerInfoResp", data);
				if (data.ErrorCode == 0) {
					playerDataMgr.setMyNick(name);
					this.getChildByName("player_name").text = name;
					hubs.publish("global.playerdata.update.userdata");
				}
			});
		},
		eventChangeHead: function (headidx) {
			var sendMsg = gtea.protobuf.encode("RequestModifyUserInfo", {
				FaceID: headidx,
				Gender: 1
			}, 1, 3);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.SetPlayerInfo, 1, 3, "ReplyModifyResult");
			server.requestToGame(CMD.SetPlayerInfo, sendMsg, this, function (errorcode, data) {
				//var retData = gtea.protobuf.decode("SetPlayerInfoResp", data);
				if (data.ErrorCode == 0) {
					playerDataMgr.setMyHead(headidx);
					this.getChildByName("player_head").setImage("assets/main/head/userhead_" + headidx + ".png");
					hubs.publish("global.playerdata.update.userdata");
				}
			});
		},
		eventBindInfo: function () {
			var parentId = "";
			if (playerDataMgr.getRebateParentId() == null || playerDataMgr.getRebateParentId() == "0" || playerDataMgr.getRebateParentId().length < 2) parentId = uiLocallization.tip_no_parent;
			else parentId = playerDataMgr.getRebateParentId();
			if (myGlobalData.isRelease) {
				this.getChildByName("recommandMan").text = parentId;
			}
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
			if (btn.name == "changeHead") {
				this.getChildByName("changeHeadPanel").visible = true;
				this.getChildByName("changeHeadPanel").toggleCustomPanel(false);
			} else if (btn.name == "changeName") {
				this.getChildByName("changeNamePanel").visible = true;
			} else if (btn.name == "changePhone") {
				if (accountMgr.getUserData().account == "" || accountMgr.getUserData().account.length == 0) this.getChildByName("bindPhonePanel").visible = true;
			} else if (btn.name == "changePass") {
				this.getChildByName("changePassPanel").visible = true;
			} else if (btn.name == "changeRecommand") {
				if (this.getChildByName("recommandMan").text == uiLocallization.tip_no_parent) this.getChildByName("bindParentPanel").visible = true;
			} else if (btn.name == "btn_sure") { }
		}
	});
	return AccountSafe;
});
gbx.define("game/lobby/lobbypop/addin_room", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/room_mgr"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization, roomMgr) {
	var AddInRoom = BaseUI.extend({
		init: function () {
			this._super();
			this._numBtnArr = [];
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = new Sprite;
			background.setImage("assets/main/public/background.png");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/vip/word_addin_room.png");
			title.scale(.8);
			title.pos(175, 0);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 5);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.scaleX = .7;
			shade_01.scaleY = 1.3;
			shade_01.pos(30, 110);
			shade_01.size(252, 80);
			this.addChild(shade_01);
			var input = uiUtils.createTextInput("input_room_num", uiLocallization.tip_input_room_number);
			input.size(240, 50);
			input.fontSize = 22;
			input.pos(30, 55);
			input.width = 260;
			input.height = 70;
			var textNum = uiUtils.createSimpleText(uiLocallization.tip_input_room_number, "textnum");
			textNum.fontSize = 22;
			textNum.pos(25, 130);
			textNum.width = 252;
			textNum.scaleX = .8;
			textNum.align = "center";
			this.addChild(textNum);
			var joinBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_join");
			var sp_joinBtn = uiUtils.createSprite("assets/main/lobby/sp/vip/join.png");
			sp_joinBtn.pos(55, 13);
			joinBtn.addChild(sp_joinBtn);
			joinBtn.scaleX = .7;
			joinBtn.pos(40, 200);
			joinBtn.setClickHandler(this, this.OnClick);
			this.addChild(joinBtn);
			var gridNumBtn = ["assets/main/lobby/sp/vip/1.png", "assets/main/lobby/sp/vip/2.png", "assets/main/lobby/sp/vip/3.png", "assets/main/lobby/sp/vip/4.png", "assets/main/lobby/sp/vip/5.png", "assets/main/lobby/sp/vip/6.png", "assets/main/lobby/sp/vip/7.png", "assets/main/lobby/sp/vip/8.png", "assets/main/lobby/sp/vip/9.png", "assets/main/lobby/sp/vip/9.png", "assets/main/lobby/sp/vip/0.png", "assets/main/lobby/sp/vip/9.png"];
			var gridNumBtNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "dele"];
			for (var index = 0; index < gridNumBtn.length; index++) {
				var btn = uiUtils.createButton("assets/main/lobby/sp/vip/num_background.png", 2, "");
				var w = 84,
					h = 66;
				btn.width = w;
				btn.height = h;
				btn.name = "btn_" + gridNumBtNames[index];
				var btnPsox, btnPsoy;
				var col = index % 3;
				var row = Math.floor(index / 3);
				btnPsox = w * col - 1 + 252;
				btnPsoy = 19 + row * h + 30;
				if (index == 9) {
					var textNum = uiUtils.createSimpleText(uiLocallization.clear_roomId, "textnumcl");
					textNum.fontSize = 22;
					textNum.pos(13, 18);
					textNum.width = 84;
					textNum.scaleX = .7;
					textNum.align = "center";
					btn.pos(btnPsox, btnPsoy);
					btn.addChild(textNum);
				} else if (index == 11) {
					var textNum = uiUtils.createSimpleText(uiLocallization.del_roomId, "textnumdele");
					textNum.fontSize = 22;
					textNum.pos(13, 18);
					textNum.width = 84;
					textNum.scaleX = .7;
					textNum.align = "center";
					btn.pos(btnPsox, btnPsoy);
					btn.addChild(textNum);
				} else {
					var imgnum = uiUtils.createSprite(gridNumBtn[index], "");
					imgnum.pos(30, 22);
					imgnum.scale(1);
					imgnum.name = "imgnum";
					imgnum.alpha = 1;
					btn.pos(btnPsox, btnPsoy);
					btn.addChild(imgnum);
				}
				this.addChild(btn);
				btn.setClickHandler(this, this.GridBtnsClick, btn.name);
				this._numBtnArr.push(btn);
			}
			var line_v = uiUtils.createSprite("assets/main/lobby/sp/vip/vline.png", "");
			line_v.pos(251, 49);
			this.addChild(line_v);
			var line_v_0 = uiUtils.createSprite("assets/main/lobby/sp/vip/hline.png", "");
			line_v_0.pos(334, 49);
			this.addChild(line_v_0);
			var line_v_1 = uiUtils.createSprite("assets/main/lobby/sp/vip/hline.png", "");
			line_v_1.pos(418, 49);
			this.addChild(line_v_1);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_join") {
				var roomId = this.getChildByName("textnum").text;
				roomMgr.joinVIPRoomByRoomId(roomId);
			}
		},
		initUI: function () {
			var el = this.getChildByName("textnum");
			el.text = uiLocallization.tip_input_room_number;
		},
		CheckComm: function (num) {
			var el = this.getChildByName("textnum");
			var pass = el.text;
			if (pass == uiLocallization.tip_input_room_number) {
				pass = "";
			}
			if (num == "clear") {
				pass = uiLocallization.tip_input_room_number;
			} else if (num == "dele") {
				pass = pass.substring(0, pass.length - 1);
				if (pass == "") pass = uiLocallization.tip_input_room_number;
			} else {
				if (pass.length < 6 && pass != uiLocallization.tip_input_room_number) {
					pass += num;
				}
			}
			el.text = pass;
		},
		GridBtnsClick: function (btn) {
			var _comm = btn.name.split("_").slice(1)[0];
			this.CheckComm(_comm);
		}
	});
	return AddInRoom;
});
gbx.define("game/lobby/lobbypop/bank_charge", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/bank_pass", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "comm/ui/top_message", "comm/helper/conf_mgr", "conf/ui_locallization", "platform/platform_manager", "conf/platform"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, BankPass, playerDataMgr, uiUtils, topMessage, confMgr, uiLocallization, platformManager, Platform) {
	var rechargeConfig = confMgr.read("main/dat/item/recharge.json");
	var BankCharge = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var sp = uiUtils.createSprite("assets/main/public/background_big.png");
			sp.pos(0, 0);
			this.addChild(sp);
			uiUtils.createBackgroundCrash(this, sp);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_encharge.png");
			sp_title.pos(240, 10);
			this.addChild(sp_title);
			var IconPoss = [{
				x: 73,
				y: 113
			}, {
				x: 236.4,
				y: 108
			}, {
				x: 409.6,
				y: 115
			}, {
				x: 60,
				y: 280
			}, {
				x: 230,
				y: 285
			}, {
				x: 395,
				y: 283
			}];
			var rootX = 22;
			var rootY = 85;
			var btnX = 55;
			var btnY = 200;
			for (var i = 0; i < rechargeConfig.length - 1; i++) {
				var Itembg = uiUtils.createSprite("assets/main/bank/bankCharge/shadow.png");
				Itembg.pos(rootX + i % 3 * 170, rootY + Math.floor(i / 3) * 171);
				Itembg.scale(.8);
				this.addChild(Itembg);
				var icon = uiUtils.createSprite("assets/main/bank/bankCharge/chip" + (i + 1) + ".png");
				icon.pos(IconPoss[i].x, IconPoss[i].y);
				icon.scale(.8);
				this.addChild(icon);
				var btn = uiUtils.createButton("assets/main/public/button_7.png", 2, i.toString());
				btn.pos(btnX + i % 3 * 170, btnY + Math.floor(i / 3) * 171);
				var txt = uiUtils.createSimpleText(rechargeConfig[i].name);
				txt.align = "center";
				txt.width = 100;
				txt.bold = true;
				txt.pos(0, 4);
				btn.addChild(txt);
				btn.size(100, 31);
				btn.setClickHandler(this, this.OnClick);
				this.addChild(btn);
			}
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else {
				var index = parseInt(btn.name);
				platformManager.tryRechargeOrder(rechargeConfig[index], playerDataMgr.getMyUID());
			}
		}
	});
	return BankCharge;
});
gbx.define("game/lobby/lobbypop/bank_charge_online", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/bank_pass", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "comm/ui/top_message", "conf/locallization", "conf/ui_locallization", "conf/platform_channels", "platform/platform_manager", "comm/helper/conf_mgr", "gbx/bridge", "comm/helper/account_mgr", "conf/platform"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, BankPass, playerDataMgr, uiUtils, topMessage, LocalLization, uiLocallization, platformChannels, platformManager, confMgr, bridge, accountMgr, Platform) {
	var topPayLimitQrcode = 500;
	var topPayLimit = 5e3;
	var rechargeConfig = confMgr.read("main/dat/item/recharge.json");
	var BankChargeOnline = BaseUI.extend({
		init: function () {
			this._super();
			this.selectWayList = [];
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			this._selectWay = 0;
			this._selectId = 0;
			this._selectIdDefault = 0;
			var sp = new Sprite;
			sp.setImage("assets/main/public/Full_screenBackGround.png");
			sp.pos(0, 0);
			this.addChild(sp);
			uiUtils.createBackgroundCrash(this, sp);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(277.5, 20);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(15, 15);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var tip = uiUtils.createSimpleText(uiLocallization.plz_input_charge_money, "");
			tip.pos(16, 115);
			tip.color = "#fff600";
			tip.fontSize = 25;
			this.addChild(tip);
			var tip = uiUtils.createSimpleText(uiLocallization.plz_choose_charge_way);
			tip.pos(16, 600);
			tip.fontSize = 25;
			tip.color = "#fff600";
			this.addChild(tip);
			var posX = 17.5;
			var posY = 170;
			var addX = 189;
			var addY = 174;
			var circle = uiUtils.createSprite("assets/main/bank/rechargeItem_Btn2.png");
			circle.name = "choosePoint";
			circle.zOrder = 2;
			this.addChild(circle);
			this._chargeArray = [10, 50, 100, 500, 1e3];
			var betPriceToIconList = confMgr.setting.betPriceToIcon;
			for (var i = 0; i < this._chargeArray.length; i++) {
				var a = i > 2 ? i - 3 : i;
				var x = posX + a * (addX + posX);
				var b = i > 2 ? 1 : 0;
				var y = posY + b * (addY + posX);
				var bg = uiUtils.createButton("assets/main/bank/rechargeItem_Btn1.png", 1, "");
				bg.pos(x, y);
				bg.zOrder = 1;
				bg.name = "stack_" + i;
				bg.mouseEnabled = false;
				this.addChild(bg);
				var url = "assets/main/bank/rechargeChip/chip" + (betPriceToIconList[this._chargeArray[i]] + 1) + ".png";
				var chip = uiUtils.createButton(url, 1, "");
				chip.pos(x + 22, y + 14);
				chip.zOrder = 3;
				chip.mouseEnabled = false;
				this.addChild(chip);
				var btn = new Button;
				btn.size(addX, addY);
				btn.pos(x, y);
				btn.setClickHandler(this, this.onChoose, i);
				this.addChild(btn);
				var top = platformManager.getRechargeMax();
				if (this._chargeArray[i] > top) {
					bg.gray = true;
					chip.gray = true;
					btn.gray = true;
				} else {
					circle.pos(x, y);
					this._selectId = i;
					this._selectIdDefault = i;
				}
			}
			var bg = uiUtils.createSprite("assets/main/bank/inputBox_1.png");
			bg.pos(posX + 2 * (addX + posX), posY + addY + posX);
			bg.zOrder = 1;
			this.addChild(bg);

			function onFous(e) {
				this.onChoose(null, 100);
			}

			function fixCardNumer() {
				var txt = this.getChildByName("self_define").text;
				if (isNaN(txt)) {
					this.getChildByName("self_define").text = "";
				}
				if (txt.indexOf(".") != -1) {
					this.getChildByName("self_define").text = txt.substring(0, txt.indexOf("."));
				}
				var number = parseInt(txt);
				var top = platformManager.getRechargeMax();
				if (number >= top) this.getChildByName("self_define").text = top;
			}
			var input = uiUtils.createTextInput("self_define");
			input.pos(posX + 15 + 2 * (addX + posX), posY + addY + posX);
			input.width = 170;
			input.height = 174;
			input.fontSize = 30;
			input.zOrder = 2;
			input.on("focus", this, onFous);
			input.on("input", this, fixCardNumer);
			this.addChild(input);
			var inputPromot = uiUtils.createSimpleText(uiLocallization.custom_money_tip, "inputPromot");
			inputPromot.pos(posX + 188 / 2 - 55 + 2 * (addX + posX), posY + addY + posX + 174 / 2 - 35);
			inputPromot.color = "#ffffff";
			inputPromot.fontSize = 30;
			this.addChild(inputPromot);
			var selectId = platformManager.getRechargeType();
			if (platformManager.getRechargeType() == 2 && bridge.getPlatform() === "iOS") selectId = 1;
			var array = platformChannels[selectId];
			if (array) {
				var posX = 43;
				var posY = 640;
				var addX = 74;
				var addY = 71;
				for (var i = 0; i < array.length; i++) {
					var x = posX + i * (addX + 80);
					if (array[i] == 2) x += 15;
					if (array[i] == 3) x += 10;
					var y = posY;
					if (array[i] == 1) y += 10;
					var choose = new Button;
					choose.size(addX, addX);
					choose.pos(x, y + 7);
					if (array[i] == 1) {
						choose.size(addX + 20, addX);
					}
					choose.setClickHandler(this, this.onChooseWay, array[i]);
					choose.zOrder = 4;
					this.addChild(choose);
					var icon = uiUtils.createSprite(this.getSpriteByKey(array[i]));
					icon.pos(x, y + 14);
					icon.zOrder = 3;
					this.addChild(icon);
					var selectIcon = uiUtils.createSprite(this.getSelectSpriteByKey(array[i]));
					selectIcon.pos(x - 6, y + 7);
					selectIcon.zOrder = 4;
					selectIcon.name = "choose_" + array[i];
					selectIcon.visible = false;
					var mark = uiUtils.createSprite("assets/main/bank/choose_mark.png");
					mark.pos(60, 40);
					if (array[i] == 1) mark.pos(70, 30);
					selectIcon.addChild(mark);
					this.addChild(selectIcon);
					this.selectWayList.push(selectIcon);
					if (i == 0) {
						selectIcon.visible = true;
						this._selectWay = array[i];
					}
					var lab = uiUtils.createSimpleText(this.getWayName(array[i]));
					lab.pos(x, y + addY + 25);
					if (array[i] == 1) lab.pos(x, y + addY + 15);
					else if (array[i] == 3 || array[i] == 4) lab.pos(x - 12.5, y + addY + 25);
					lab.fontSize = 25;
					lab.bold = true;
					lab.zOrder = 3;
					this.addChild(lab);
				}
			}
			var moreSureBtn = uiUtils.createButton("assets/main/public/button_12.png", 2, "moreSureBtn");
			var sp_02 = uiUtils.createSprite("assets/main/bank/word_encharge2.png");
			sp_02.pos(52, 15);
			moreSureBtn.addChild(sp_02);
			moreSureBtn.pos(223.5, 900);
			moreSureBtn.setClickHandler(this, this.OnClick);
			this.addChild(moreSureBtn);
		},
		getSelectSpriteByKey: function (idx) {
			var ret = "";
			switch (idx) {
				case 1:
					ret = "assets/main/bank/quick2.png";
					break;
				case 2:
				case 3:
					ret = "assets/main/bank/alipay2.png";
					break;
				case 4:
				case 5:
					ret = "assets/main/bank/wechat2.png";
					break;
			}
			return ret;
		},
		getSpriteByKey: function (idx) {
			var ret = "";
			switch (idx) {
				case 1:
					ret = "assets/main/bank/quick.png";
					break;
				case 2:
				case 3:
					ret = "assets/main/bank/alipay.png";
					break;
				case 4:
				case 5:
					ret = "assets/main/bank/wechat.png";
					break;
			}
			return ret;
		},
		getWayName: function (idx) {
			var ret = "";
			switch (idx) {
				case 1:
					ret = uiLocallization.quick;
					break;
				case 2:
					ret = uiLocallization.alipay;
					break;
				case 3:
					ret = uiLocallization.alipay_h5;
					break;
				case 4:
					ret = uiLocallization.wx_pay;
					break;
				case 5:
					ret = uiLocallization.wx_pay_h5;
					break;
			}
			return ret;
		},
		onChoose: function (btn, id) {
			var root = this.getChildByName("stack_" + id);
			this._selectId = id;
			if (id == 100) {
				this.getChildByName("choosePoint").alpha = 0;
				this.getChildByName("inputPromot").text = "";
			} else {
				this.getChildByName("self_define").text = "";
				this.getChildByName("inputPromot").text = uiLocallization.custom_money_tip;
				this.getChildByName("choosePoint").alpha = 1;
				this.getChildByName("choosePoint").pos(root.x, root.y);
			}
		},
		onChooseWay: function (btn, id) {
			this._selectWay = id;
			for (var i = 0; i < this.selectWayList.length; i++) {
				this.selectWayList[i].visible = false;
			}
			var select = this.getChildByName("choose_" + id);
			select.visible = true;
		},
		OnClick: function (btn) {
			if (window.lobbyisLock) return;
			if (btn.name == "btn_close") {
				this.visible = false;
				this.publish("game_baccarat.setting.updateMyDeposit");
			}
			if (btn.name == "moreSureBtn") {
				this.encharge();
			}
		},
		encharge: function () {
			var data = rechargeConfig[rechargeConfig.length - 1];
			var idx = this._selectId;
			var money = 0;
			if (this._selectId >= this._chargeArray.length) {
				money = this.getChildByName("self_define").text;
				var num = parseInt(money, 10);
				if (money == "" || num <= 0) {
					uiUtils.showMesage(uiLocallization.plz_input_r_charge_money);
					this.getChildByName("self_define").text = "";
					return;
				}
				if (num < 10) {
					var str = uiLocallization.self_define_limit;
					str = str.replace("A", this._chargeArray[0]);
					var top = platformManager.getRechargeMax();
					str = str.replace("B", top);
					uiUtils.showMesage(str);
					return;
				}
			} else money = this._chargeArray[idx];

			function success(backData) {
				var retData = eval("(" + backData + ")");
				if ("" + retData.result != ERROR_CODE.OK) {
					uiUtils.showMesage(uiLocallization.get_order_fail);
					return;
				}
				switch (platformManager.getRechargeType()) {
					case Platform.recharge_type1:
						{ }
						break;
					case Platform.recharge_type2:
						{
							bridge.pay(this._selectWay, retData.data.transdata, retData.data.sign);
						}
						break;
					case Platform.recharge_type3:
						{
							var qrCode = retData.data.qrCode;
							document.getElementById("qrcode").style.display = "block";
							document.getElementById("qrcode_bg").style.display = "block";
							document.getElementById("qrcode").style.left = (window.innerWidth - window.innerHeight / 4) / 2 + "px";
							document.getElementById("qrcode_bg").style.width = window.innerHeight / 2 + "px";
							document.getElementById("qrcode_bg").style.height = window.innerHeight / 1.8 + "px";
							document.getElementById("qrcode_bg").style.left = window.innerWidth / 2 - window.innerHeight / 4 + "px";
							document.getElementById("save_pic_lab").src = "assets/main/qrCode/savePic.png";
							if (this._selectWay == 2 || this._selectWay == 4) {
								document.getElementById("qrcode_icon").src = this.getSpriteByKey(this._selectWay);
								var src = "";
								var srcT = "";
								if (this._selectWay == 2) {
									src = "assets/main/qrCode/ali.png";
									srcT = "assets/main/qrCode/aliText.png";
								} else if (this._selectWay == 4) {
									src = "assets/main/qrCode/weixin.png";
									srcT = "assets/main/qrCode/weixinText.png";
								}
								document.getElementById("qrcode_help_pic").src = src;
								document.getElementById("qrcode_name").src = srcT;
							}
							if (bridge.getPlatform() === "web") {
								document.getElementById("qrcode_savebtn").style.display = "none";
								var src = "";
								if (this._selectWay == 2) src = "assets/main/qrCode/aliH5.png";
								else if (this._selectWay == 4) src = "assets/main/qrCode/weixinH5.png";
								document.getElementById("qrcode_help_pic").src = src;
							}
							var bSave = false;
							document.getElementById("qrcode_savebtn").onclick = function () {
								if (!bSave) {
									bSave = true;
									bridge.savePic();
									document.getElementById("save_pic_lab").src = "assets/main/qrCode/savePicOk.png";
								}
							};
							var root = document.getElementById("qrcode");
							var childList = root.childNodes;
							for (var i = childList.length - 1; i >= 0; i--) {
								var childNode = childList[0];
								root.removeChild(childNode);
							}
							new QRCode(document.getElementById("qrcode"), qrCode);
							window.lobbyisLock = true;
							this.timerOnce(10, this, function () {
								Laya.stage.renderingEnabled = false;
							});
						}
						break;
					case Platform.recharge_type4:
						{
							var httpStr = retData.data.aliPayURL;
							console.debug("httpStr:" + httpStr);
							bridge.openUrl(httpStr);
						}
						break;
				}
			}
			switch (platformManager.getRechargeType()) {
				case Platform.recharge_type1:
					{ }
					break;
				case Platform.recharge_type2:
					{
						platformManager.tryRechargeOrder_ZhenYun(playerDataMgr.getMyUID(), data.id, money, this, success);
					}
					break;
				case Platform.recharge_type3:
					{
						var account = accountMgr.getUserData().account;
						var channel = this.getChannel();
						platformManager.tryRechargeOrder_qrCode(account, playerDataMgr.getMyUID(), channel, money, this, success);
					}
					break;
				case Platform.recharge_type4:
					{
						if (bridge.getPlatform() == "iOS") {
							var account = accountMgr.getUserData().account;
							var channel = this.getChannel();
							var terminalType = "mobile";
							if (bridge.getPlatform() === "web") terminalType = "pc";
							var tradeIP = "112.64.5.130";
							platformManager.tryRechargeOrder_H5(terminalType, tradeIP, account, playerDataMgr.getMyUID(), channel, money, this, success);
						} else {
							platformManager.tryRechargeOrder_H5_New(money);
						}
					}
					break;
			}
		},
		getChannel: function () {
			switch (this._selectWay) {
				case 2:
					return "ali";
				case 4:
					return "weixin";
			}
		},
		refresh: function () {
			this.getChildByName("usable_limit").text = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1);
			this.getChildByName("deposit").text = uiUtils.getFloatByPower(parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100, 1);
		},
		setData: function () {
			this.onChoose(null, this._selectIdDefault);
		}
	});
	return BankChargeOnline;
});
gbx.define("game/lobby/lobbypop/bank_draw_encharge", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/bank_pass", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "comm/ui/top_message", "conf/locallization", "conf/ui_locallization"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, BankPass, playerDataMgr, uiUtils, topMessage, LocalLization, uiLocallization) {
	var BankDraw = BaseUI.extend({
		init: function () {
			this._super();
			this._number1 = 0;
			this._number2 = 0;
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = new Sprite;
			background.setImage("assets/main/public/background_big.png");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(240, 10);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var back_layer = uiUtils.createSprite("assets/main/public/item_bg_1.png", "");
			back_layer.pos(12, 102);
			this.addChild(back_layer);
			var splitLine0 = uiUtils.createSprite("assets/main/public/splitLine.png");
			splitLine0.pos(273, 101);
			this.addChild(splitLine0);
			var splitLine = uiUtils.createSprite("assets/main/public/splitLine_2.png");
			splitLine.pos(50, 101);
			this.addChild(splitLine);
			var splitLine1 = uiUtils.createSprite("assets/main/public/splitLine_2.png");
			splitLine1.pos(50, 228);
			this.addChild(splitLine1);
			var arrow_1 = uiUtils.createSprite("assets/main/bank/arrow.png", "");
			arrow_1.pivotToCenter();
			arrow_1.pos(275, 138);
			this.addChild(arrow_1);
			var arrow_2 = uiUtils.createSprite("assets/main/bank/arrow.png", "");
			arrow_2.pivotToCenter();
			arrow_2.rotation = 180;
			arrow_2.pos(270, 180);
			this.addChild(arrow_2);
			var text_1 = uiUtils.createSimpleText(uiLocallization.player_deposit, "useLimittip");
			text_1.color = "#E0F0EF";
			text_1.fontSize = 25;
			text_1.pos(83, 119);
			this.addChild(text_1);
			var deposit = parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100;
			deposit = uiUtils.getFloatByPower(deposit, 1);
			this._number1 = deposit;
			var text_num = uiUtils.createSimpleText(deposit, "deposit");
			text_num.fontSize = 20;
			text_num.color = "#E0F0EF";
			text_num.align = "center";
			text_num.pos(30, 157);
			this.addChild(text_num);
			var text_2 = uiUtils.createSimpleText(uiLocallization.useLimit, "");
			text_2.color = "#E0F0EF";
			text_2.fontSize = 22;
			text_2.pos(360, 119);
			this.addChild(text_2);
			this._number2 = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1);
			var text_num_1 = uiUtils.createSimpleText(this._number2, "usable_limit");
			text_num_1.fontSize = 20;
			text_num_1.color = "#E0F0EF";
			text_num_1.align = "center";
			text_num_1.pos(300, 157);
			this.addChild(text_num_1);
			var tip = uiUtils.createSprite("assets/main/bank/tip_input_money.png", "");
			tip.pos(208, 235);
			this.addChild(tip);
			var inputBg = uiUtils.createSprite("assets/main/public/input_box_1.png", "");
			inputBg.pos(80, 266);
			inputBg.scaleX = .755;
			inputBg.scaleY = .6;
			this.addChild(inputBg);

			function fixCardNumer() {
				var txt = this.getChildByName("money").text;
				var text = txt;
				if (isNaN(txt)) {
					this.getChildByName("money").text = "";
				}
				if (txt.indexOf(".") != -1) {
					this.getChildByName("money").text = txt.substring(0, txt.indexOf("."));
					text = this.getChildByName("money").text;
				}
				var number = parseFloat(text);
				var top = this._number1 > this._number2 ? this._number1 : this._number2;
				if (number >= top) {
					this.getChildByName("money").text = top;
				}
			}
			var money = uiUtils.createTextInput("money", "");
			money.pos(100, 265);
			money.fontSize = 20;
			money.size(350, 50);
			money.focus = true;
			money.on("input", this, fixCardNumer);
			this.addChild(money);
			var detailBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_detail");
			var word_detail = uiUtils.createSprite("assets/main/bank/word_detail.png");
			word_detail.pos(48, 10);
			word_detail.scaleX = 1.2;
			word_detail.scaleY = 1.2;
			detailBtn.addChild(word_detail);
			detailBtn.pos(400, 58);
			detailBtn.scale(.7);
			detailBtn.setClickHandler(this, this.OnClick);
			this.addChild(detailBtn);
			var drawOutBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_draw_out");
			var word_out = uiUtils.createSprite("assets/main/bank/word_out.png");
			word_out.pos(52, 12);
			drawOutBtn.addChild(word_out);
			drawOutBtn.pos(78, 320);
			drawOutBtn.setClickHandler(this, this.OnClick);
			this.addChild(drawOutBtn);
			var enchargePutBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_encharge_put");
			var word_put = uiUtils.createSprite("assets/main/bank/word_put.png");
			word_put.pos(52, 12);
			enchargePutBtn.addChild(word_put);
			enchargePutBtn.pos(308, 320);
			enchargePutBtn.setClickHandler(this, this.OnClick);
			this.addChild(enchargePutBtn);
			var openCard = new Button;
			openCard.pos(351, 390);
			openCard.size(400, 30);
			openCard.name = "openCard";
			openCard.setClickHandler(this, this.OnClick);
			this.addChild(openCard);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
				this.publish("game_baccarat.setting.updateMyDeposit");
			}
			if (btn.name == "btn_encharge_put") {
				this.EnchargePut();
			}
			if (btn.name == "btn_draw_out") {
				this.DrawOut();
			}
			if (btn.name == "btn_detail") {
				this.publish("game_baccarat.setting.openBankDetail");
			}
			if (btn.name == "openCard") {
				this.publish("game_baccarat.setting.openBindCard");
			}
		},
		DrawOut: function () {
			var getout = this.getChildByName("money").text;
			if (getout == "") return;
			if (isNaN(getout)) {
				topMessage.post(uiLocallization.plz_input_number);
				return;
			}
			if (parseInt(getout) < 0) {
				topMessage.post(uiLocallization.input_number_illegle);
				return;
			}
			var num = parseInt(getout, 10);
			if (!num) {
				topMessage.post(uiLocallization.input_number_illegle);
				return;
			}
			var sendMsg = gtea.protobuf.encode("RequestInsureTakeScore", {
				Score: num * 100
			}, 1, 12);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BankTakeGold, 1, 12, "ReplyInsureTakeScore");
			server.requestToGame(CMD.BankTakeGold, sendMsg, this, function (errorcode, data) {
				this.getChildByName("money").text = "";
				if (data.ErrorCode == ERROR_CODE.OK) {
					//var retData = gtea.protobuf.decode("takeGoldResp", data);
					playerDataMgr.dealItemProto([{ DType: 4, count: parseInt(data.Score) / 100 },
					{ DType: 5, count: (parseInt(data.Score) + parseInt(data.InsureScore)) / 100 }]);
					this.refresh();
					this.publish("lobby.game.updateMyInfo");
					this.visible = false;
				} else gbx.log("外层消息已提示");
			});
		},
		EnchargePut: function () {
			var getout = this.getChildByName("money").text;
			if (getout == "") return;
			if (isNaN(getout)) {
				topMessage.post(uiLocallization.plz_input_number);
				return;
			}
			if (parseInt(getout) < 0) {
				topMessage.post(uiLocallization.input_number_illegle);
				return;
			}
			var num = parseInt(getout, 10);
			if (!num) {
				topMessage.post(uiLocallization.input_number_illegle);
				return;
			}
			var sendMsg = gtea.protobuf.encode("RequestInsureSaveScore", {
				Score: num * 100
			}, 1, 11);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BankSaveGold, 1, 11, "ReplyInsureSaveScore");
			server.requestToGame(CMD.BankSaveGold, sendMsg, this, function (errorcode, data) {
				this.getChildByName("money").text = "";
				if (data.ErrorCode == ERROR_CODE.OK) {
					//var retData = gtea.protobuf.decode("saveGoldResp", data);
					playerDataMgr.dealItemProto([{ DType: 4, count: parseInt(data.Score) / 100 },
					{ DType: 5, count: (parseInt(data.Score) + parseInt(data.InsureScore)) / 100 }]);
					this.refresh();
					this.publish("lobby.game.updateMyInfo");
					this.getChildByName("money").text = "";
					this.visible = false;
				} else gbx.log("外层消息已提示");
			});
		},
		refresh: function () {
			this.getChildByName("usable_limit").text = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1);
			this.getChildByName("deposit").text = uiUtils.getFloatByPower(parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100, 1);
			this._number1 = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1);
			this._number2 = uiUtils.getFloatByPower(parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100, 1);
		}
	});
	return BankDraw;
});
gbx.define("game/lobby/lobbypop/bank_pass", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization) {
	var BankPass = BaseUI.extend({
		init: function () {
			this._super();
			this._number = "";
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(200, 10);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var tip = uiUtils.createSimpleText(uiLocallization.tip_input_bankpass);
			tip.color = "#E0F0EF";
			tip.fontSize = 20;
			tip.pos(48, 102);
			this.addChild(tip);
			var inputBg = uiUtils.createSprite("assets/main/public/input_box.png", "");
			inputBg.pos(41, 145);
			inputBg.scaleX = .63;
			this.addChild(inputBg);
			var pass = uiUtils.createTextInput("pass", "");
			pass.type = "password";
			pass.fontSize = 22;
			pass.pos(45, 148);
			pass.size(145, 50);
			this.addChild(pass);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var word_sure = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			word_sure.pos(62, 16);
			surebtn.addChild(word_sure);
			surebtn.pos(41, 212);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
			var inputBoard = uiUtils.createSprite("assets/main/bank/tap_broad.png", "");
			inputBoard.pos(248, 54);
			this.addChild(inputBoard);
			var light = uiUtils.createSprite("assets/main/bank/tap_broad_light.png", "light");
			light.alpha = 0;
			this.addChild(light);
			var BtnNames = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "X"];
			var fixedX = 248;
			var fixedY = 54;
			for (var i = 0; i < BtnNames.length; i++) {
				var btn = uiUtils.createButton(null, 1, BtnNames[i]);
				btn.pos(fixedX + i % 3 * 85, fixedY + Math.floor(i / 3) * 64);
				if (i < BtnNames.length - 1) {
					var lab = uiUtils.createSimpleText(BtnNames[i], "");
					lab.pos(40, 27);
					if (BtnNames[i] != "C") {
						lab.color = "#D5CBC9";
					}
					btn.addChild(lab);
				} else {
					var back = uiUtils.createSprite("assets/main/bank/tapBack.png");
					back.pos(25, 27);
					btn.addChild(back);
				}
				btn.setClickHandler(this, this.OnClickNumber);
				btn.width = 86;
				btn.height = 65;
				this.addChild(btn);
			}
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_sure") {
				this._number = "";
				this.getChildByName("pass").text = this._number;
			}
		},
		OnClickNumber: function (btn) {
			var light = this.getChildByName("light");
			light.alpha = 1;
			light.pos(btn.x + 1, btn.y + 2);
			light.tweenTo({
				alpha: 0
			}, 200, function () {
				light.alpha = 0;
			});
			if (btn.name != "C" && btn.name != "X") {
				this._number += btn.name;
			} else if (btn.name == "C") {
				this._number = "";
			} else if (btn.name == "X") {
				if (this._number.length > 0) this._number = this._number.substring(0, this._number.length - 1);
			}
			this.getChildByName("pass").text = this._number;
		}
	});
	return BankPass;
});
gbx.define("game/lobby/lobbypop/bank_setting", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/net_tool", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "game/lobby/lobbypop/income_expend_detail", "game/lobby/lobbypop/bank_draw_encharge", "game/lobby/lobbypop/bank_charge", "game/lobby/lobbypop/draw_cash", "game/lobby/lobbypop/bind_bank_card", "game/lobby/lobbypop/unlock_bank_card", "comm/helper/playerdata_mgr", "conf/ui_locallization", "gbx/bridge", "comm/helper/bank_mgr"], function (server, CMD, ERROR_CODE, ERROR_CODE_DES, netTool, Sprite, Button, Text, Panel, BaseUI, uiUtils, InComExpDetail, DrawEncharge, BankCharge, DrawCash, BindCard, UnLockBank, playerDataMgr, uiLocallization, bridge, bankMgr) {
	var BankSetting = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			this.hasCard = false;
			if (playerDataMgr.getBankCardNumber() === null || playerDataMgr.getBankCardNumber() == "") {
				this._cardAccount = "";
			} else {
				this._cardAccount = playerDataMgr.getBankCardNumber();
				this.hasCard = true;
			}
			var bankData = bankMgr.getCardData(this._cardAccount);
			var sp = new Sprite;
			sp.setImage("assets/main/public/background_big.png");
			sp.pos(0, 0);
			this.addChild(sp);
			uiUtils.createBackgroundCrash(this, sp);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(240, 10);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var detailBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_detail");
			var sp_03 = uiUtils.createSprite("assets/main/bank/word_title_detail.png");
			sp_03.pos(22, 12);
			detailBtn.addChild(sp_03);
			detailBtn.pos(400, 58);
			detailBtn.scale(.7);
			detailBtn.setClickHandler(this, this.OnClick);
			this.addChild(detailBtn);
			var back_layer = uiUtils.createSprite("assets/main/public/item_bg_1.png", "");
			back_layer.pos(12, 102);
			this.addChild(back_layer);
			var splitLine0 = uiUtils.createSprite("assets/main/public/splitLine.png");
			splitLine0.pos(273, 101);
			this.addChild(splitLine0);
			var splitLine = uiUtils.createSprite("assets/main/public/splitLine_2.png");
			splitLine.pos(50, 101);
			this.addChild(splitLine);
			var splitLine1 = uiUtils.createSprite("assets/main/public/splitLine_2.png");
			splitLine1.pos(50, 228);
			this.addChild(splitLine1);
			var text_1 = uiUtils.createSimpleText(uiLocallization.useLimit, "");
			text_1.color = "#E0F0EF";
			text_1.fontSize = 22;
			text_1.pos(83, 110);
			this.addChild(text_1);
			var text_num = uiUtils.createSimpleText(uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1), "usable_limit");
			text_num.fontSize = 20;
			text_num.color = "#E0F0EF";
			text_num.align = "center";
			text_num.pos(30, 144);
			this.addChild(text_num);
			var text_2 = uiUtils.createSimpleText(uiLocallization.drawcashLimit, "");
			text_2.fontSize = 22;
			text_2.color = "#E0F0EF";
			text_2.pos(360, 110);
			this.addChild(text_2);
			var text_num_2 = uiUtils.createSimpleText(this.getHunderMulti(playerDataMgr.getMyCarryGold()), "usable_draw_limit");
			text_num_2.fontSize = 20;
			text_num_2.color = "#E0F0EF";
			text_num_2.align = "center";
			text_num_2.pos(310, 144);
			this.addChild(text_num_2);
			var enchargeBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_encharge");
			var sp_01 = uiUtils.createSprite("assets/main/bank/word_encharge.png");
			sp_01.pos(52, 12);
			enchargeBtn.addChild(sp_01);
			enchargeBtn.pos(43, 170);
			enchargeBtn.setClickHandler(this, this.OnClick);
			this.addChild(enchargeBtn);
			var drawBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_draw_cash");
			var sp_02 = uiUtils.createSprite("assets/main/bank/word_draw.png");
			sp_02.pos(52, 12);
			drawBtn.addChild(sp_02);
			drawBtn.pos(340, 170);
			drawBtn.setClickHandler(this, this.OnClick);
			this.addChild(drawBtn);
			var back_layer1 = uiUtils.createSprite("assets/main/public/item_bg_1.png", "");
			back_layer1.pos(15, 241);
			back_layer1.scaleY = .8;
			this.addChild(back_layer1);
			var splitLine = uiUtils.createSprite("assets/main/public/splitLine_2.png");
			splitLine.pos(50, 241);
			this.addChild(splitLine);
			var takeMoneyTip = uiUtils.createSimpleText(uiLocallization.player_deposit);
			takeMoneyTip.pos(43, 260);
			takeMoneyTip.fontSize = 22;
			takeMoneyTip.color = "#E0F0EF";
			this.addChild(takeMoneyTip);
			var tip_bank = uiUtils.createSimpleText(uiLocallization.player_deposit_tip);
			tip_bank.color = "#EBEE89";
			tip_bank.fontSize = 17;
			tip_bank.pos(43, 296);
			this.addChild(tip_bank);
			var deposit = parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100;
			deposit = uiUtils.getFloatByPower(deposit, 1);
			var myMoney = uiUtils.createSimpleText(deposit, "myMoney");
			myMoney.fontSize = 25;
			myMoney.bold = true;
			myMoney.pos(160, 260);
			myMoney.align = "left";
			myMoney.color = "#E0F0EF";
			this.addChild(myMoney);
			var btn_manage = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_manage");
			var sp_01 = uiUtils.createSprite("assets/main/bank/word_manage.png");
			sp_01.pos(54, 12);
			btn_manage.addChild(sp_01);
			btn_manage.pos(340, 265);
			btn_manage.setClickHandler(this, this.OnClick);
			this.addChild(btn_manage);
			var bg = uiUtils.createSprite("assets/main/public/input_box_1.png", "");
			bg.pos(15, 351);
			this.addChild(bg);
			var root = new Sprite;
			root.pos(15, 360);
			root.name = "root";
			this.addChild(root);
			var child1 = new Sprite;
			child1.name = "child1";
			root.addChild(child1);
			var tip = uiUtils.createSimpleText(uiLocallization.now_bind_bankcard);
			tip.pos(15, 14);
			tip.color = " #E0F0EF";
			tip.fontSize = 22;
			child1.addChild(tip);
			var tip_no = uiUtils.createSimpleText(uiLocallization.tip_no_bind_card);
			tip_no.pos(400, 14);
			tip_no.fontSize = 20;
			child1.addChild(tip_no);
			var btn = new Button;
			btn.pos(0, 0);
			btn.size(555, 40);
			btn.name = "btn_bind";
			btn.setClickHandler(this, this.OnClick);
			child1.addChild(btn);
			var child2 = new Sprite;
			child2.name = "child2";
			root.addChild(child2);
			var icon = new Sprite;
			icon.pos(2, 4);
			icon.scale(.45);
			icon.name = "cardIcon";
			child2.addChild(icon);
			var cardName = uiUtils.createSimpleText("", "cardName");
			cardName.pos(70, 2);
			cardName.fontSize = 17;
			cardName.color = "#E0F0EF";
			child2.addChild(cardName);
			if (this.hasCard) cardName.text = bankData.belong + "-" + bankData.cardName;
			var cardNumber = uiUtils.createSimpleText(this.getCardStr(), "cardNumber");
			cardNumber.pos(70, 28);
			cardNumber.fontSize = 17;
			cardNumber.color = "#E0F0EF";
			child2.addChild(cardNumber);
			var tip_yes = uiUtils.createSimpleText(uiLocallization.tip_binded_card);
			tip_yes.pos(400, 14);
			tip_yes.fontSize = 18;
			tip_yes.color = "#E0F0EF";
			child2.addChild(tip_yes);
			var btn = new Button;
			btn.pos(0, 0);
			btn.size(555, 40);
			btn.name = "btn_unlock";
			btn.setClickHandler(this, this.OnClick);
			child2.addChild(btn);
			if (this.hasCard) {
				child1.visible = false;
				child2.visible = true;
			} else {
				child1.visible = true;
				child2.visible = false;
			}
			var arrow = uiUtils.createSprite("assets/main/public/arrow_1.png");
			arrow.pos(480, 10);
			root.addChild(arrow);
			var drawEncharge = new DrawEncharge;
			drawEncharge.pos(0, 0);
			drawEncharge.name = "drawEncharge";
			drawEncharge.visible = false;
			this.addChild(drawEncharge);
			var incomExpDetail = new InComExpDetail;
			incomExpDetail.pos(0, -180);
			incomExpDetail.name = "incomExpDetailPanel";
			incomExpDetail.visible = false;
			this.addChild(incomExpDetail);
			var drawCash = new DrawCash;
			drawCash.pos(0, 0);
			drawCash.name = "drawCash";
			drawCash.visible = false;
			this.addChild(drawCash);
			var bindCard = new BindCard;
			bindCard.pos(21, 50);
			bindCard.name = "bindCard";
			bindCard.visible = false;
			this.addChild(bindCard);
			var unLockBank = new UnLockBank;
			unLockBank.pos(21, 50);
			unLockBank.visible = false;
			unLockBank.name = "unLockBank";
			this.addChild(unLockBank);
			this.subscribe("game_baccarat.setting.openBankDetail", this, this.eventOpenDetail);
			this.subscribe("game_baccarat.setting.updateMyDeposit", this, this.eventUpdateMyDeposit);
			this.subscribe("game_baccarat.setting.updateMyCardInfo", this, this.eventUpdateCardInfo);
			this.eventUpdateCardInfo();
		},
		getCardStr: function () {
			var str = this._cardAccount;
			str = str.replace(/\-/g, "");
			if (str) {
				var str1 = "";
				for (var i = 0; i < str.length - 4; i++) {
					if (i % 4 == 0) str1 += " *";
					else str1 += "*";
				}
				var str2 = str.substring(str.length - 4);
				return str1 + str2;
			}
			return "";
		},
		eventUpdateCardInfo: function () {
			var child1 = this.getChildByName("root", "child1");
			var child2 = this.getChildByName("root", "child2");
			this.hasCard = false;
			if (playerDataMgr.getBankCardNumber() === null || playerDataMgr.getBankCardNumber() == "") {
				this._cardAccount = "";
			} else {
				this._cardAccount = playerDataMgr.getBankCardNumber();
				this.hasCard = true;
			}
			if (!this.hasCard) {
				child1.visible = true;
				child2.visible = false;
				return;
			} else {
				child1.visible = false;
				child2.visible = true;
			}
			var data = bankMgr.getCardData(this._cardAccount);
			child2.getChildByName("cardName").text = data.belong + "-" + data.cardName;
			child2.getChildByName("cardNumber").text = this.getCardStr();
			var iconName = "quick.png";
			var basePath = "assets/main/bankIcon/" + iconName;
			child2.getChildByName("cardIcon").setImage(basePath);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_detail") {
				this.eventOpenDetail();
			} else if (btn.name == "btn_manage") {
				var view = this.getChildByName("drawEncharge");
				view.visible = true;
				view.refresh();
			} else if (btn.name == "btn_draw_cash") {
				if (this.hasCard) {
					this.getChildByName("drawCash").visible = true;
					this.getChildByName("drawCash").setData(this._cardAccount, this.getHunderMulti(playerDataMgr.getMyCarryGold()));
				} else uiUtils.showMesage(uiLocallization.draw_cash_tip);
			} else if (btn.name == "btn_encharge") {
				this.publish("lobby.lobbypop.bankcharge");
			} else if (btn.name == "btn_bind") {
				this.openBindCard();
			} else if (btn.name == "btn_unlock") {
				this.openunLockBank();
			}
		},
		openBindCard: function () {
			this.getChildByName("bindCard").visible = true;
		},
		openunLockBank: function () {
			this.getChildByName("unLockBank").visible = true;
		},
		eventUpdateMyDeposit: function () {
			var deposit = parseInt(playerDataMgr.getMyGold() * 100 - playerDataMgr.getMyCarryGold() * 100) / 100;
			this.getChildByName("myMoney").text = uiUtils.getFloatByPower(deposit, 1);
			this.getChildByName("usable_draw_limit").text = this.getHunderMulti(playerDataMgr.getMyCarryGold());
			this.getChildByName("usable_limit").text = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 1);
		},
		eventOpenDetail: function () {
			var sendMsg = gtea.protobuf.encode("QueryBankReq", {
				token: "Moxian009",
				playerId: playerDataMgr.getMyUID()
			});
			netTool.createHttpRequest(netTool.getPathByKey("queryBankUrl"), sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("QueryBankResp", data);
				if (msgData.result == ERROR_CODE.OK) {
					this.getChildByName("incomExpDetailPanel").visible = true;
					this.getChildByName("incomExpDetailPanel").setData(msgData.bankInfo);
				} else uiUtils.showMesage(ERROR_CODE_DES[msgData.result]);
			});
		},
		getHunderMulti: function (number) {
			var multi = Math.floor(number / 100);
			return multi * 100;
		}
	});
	return BankSetting;
});
gbx.define("game/lobby/lobbypop/bind_bank_card", ["gbx/hubs", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/bank_mgr"], function (hubs, server, CMD, ERROR_CODE, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization, bankMgr) {
	var BindBankCard = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(222, 10);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var tip = uiUtils.createSimpleText(uiLocallization.plz_identify_tip);
			tip.pos(89, 60);
			tip.fontSize = 15;
			tip.color = "#F4CD80";
			this.addChild(tip);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.pos(83, 80);
			shade_01.scaleX = 1.2;
			this.addChild(shade_01);
			var InputNameTip = uiUtils.createSimpleText(uiLocallization.cardholder);
			InputNameTip.pos(93, 93);
			InputNameTip.fontSize = 21;
			this.addChild(InputNameTip);
			var InputName = uiUtils.createTextInput("InputName", uiLocallization.plz_input_name);
			InputName.width = 220;
			InputName.pos(160, 80);
			InputName.height = 50;
			InputName.fontSize = 17;
			this.addChild(InputName);
			var shade_02 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_02.pos(83, 151);
			shade_02.scaleX = 1.2;
			this.addChild(shade_02);
			var InputCardTip = uiUtils.createSimpleText(uiLocallization.cardNumber);
			InputCardTip.pos(93, 165);
			InputCardTip.fontSize = 21;
			this.addChild(InputCardTip);
			var InputCard = uiUtils.createTextInput("InputCard", uiLocallization.plz_input_bank_number);
			InputCard.width = 220;
			InputCard.height = 50;
			InputCard.pos(160, 150);
			InputCard.fontSize = 17;
			InputCard.on("input", this, this.fixCardNumer);
			this.addChild(InputCard);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			sp.pos(62, 16);
			surebtn.addChild(sp);
			surebtn.pos(162, 228);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		bindCardNumber: function (number, playerName) {
			var data = bankMgr.getCardData(number);
			var bankName = "";
			if (data) {
				bankName = data.belong + "-" + data.cardName;
			}
			var sendData = gtea.protobuf.encode("BindCardNumberReq", {
				cardNum: number,
				cardName: playerName,
				bankName: bankName
			});
			var cardNumber = number;
			server.requestToGame(CMD.BindCardNumber, sendData, this, function (errorcode, retData) {
				if (errorcode == ERROR_CODE.OK) {
					var msgData = gtea.protobuf.decode("BindCardNumberResp", retData);
					playerDataMgr.setBankCardNumber(cardNumber);
					uiUtils.showMesage(uiLocallization.bind_card_ok);
					this.publish("game_baccarat.setting.updateMyCardInfo");
					this.visible = false;
				}
			});
		},
		fixCardNumer: function (e) {
			var str = this.getChildByName("InputCard").text;
			var v = str;
			v = bankMgr.trimLeft(v);
			if (v.length > 23) {
				v = v.substring(0, 23);
				this.getChildByName("InputCard").text = v;
			}
			if (/\S{5}/.test(v)) {
				this.getChildByName("InputCard").text = v.replace(/\s/g, "").replace(/(.{4})/g, "$1 ");
			}
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_sure") {
				var cardNumber = this.getChildByName("InputCard").text;
				var playerName = this.getChildByName("InputName").text;
				this.bindCard(cardNumber, playerName);
			}
		},
		bindCard: function (cardNumber, playerName) {
			if (playerName == "" || playerName == uiLocallization.plz_input_name) {
				uiUtils.showMesage(uiLocallization.name_can_not_void);
				return false;
			}
			var ret = bankMgr.luhmCheck(cardNumber);
			if (ret) {
				var needBankerNumber = bankMgr.getNeedBankNumber(cardNumber);
				this.bindCardNumber(needBankerNumber, playerName);
			}
		}
	});
	return BindBankCard;
});
gbx.define("game/lobby/lobbypop/bind_parent", ["gbx/net/messagecommand", "gbx/net/errorcode_des", "gbx/net/connector", "comm/helper/playerdata_mgr", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization"], function (CMD, ERROR_CODE_DES, server, playerDataMgr, Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization) {
	var BindParent = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/bindParent/title_bind_recommand.png", "");
			title.pos(190, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.scaleX = 1;
			shade_01.pos(122, 113);
			this.addChild(shade_01);
			var input = uiUtils.createTextInput("parent_id", uiLocallization.tip_input_Id);
			input.size(255, 50);
			input.fontSize = 20;
			input.pos(131, 112);
			this.addChild(input);
			var tip = uiUtils.createSimpleText(uiLocallization.bind_tip);
			tip.pos(190, 197);
			tip.fontSize = 15;
			tip.color = "#FFFFFF";
			tip.alpha = .8;
			this.addChild(tip);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var word_sure = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			word_sure.pos(62, 16);
			surebtn.addChild(word_sure);
			surebtn.pos(172, 224);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
			if (btn.name == "btn_sure") {
				var parentId = this.getChildByName("parent_id").text;
				if (parentId == "" || parentId == null || parentId == uiLocallization.tip_input_Id) return;
				if (playerDataMgr.getMyUID() == null) return;
				this.onbindParent(parentId);
			}
		},
		onbindParent: function (parentId) {
			var sendData = gtea.protobuf.encode("RebateCreateRSReq", {
				parentId: parentId,
				childId: "" + playerDataMgr.getMyUID()
			});
			var BindUi = this;
			server.requestToGame(CMD.RebateCreateRS, sendData, this, function (errorcode, data) {
				if (errorcode == 0) {
					var ret = gtea.protobuf.decode("RebateCreateRSResp", data);
					uiUtils.showMesage(uiLocallization.bind_OK);
					playerDataMgr.setRebateParentId(parentId);
					this.publish("account_safe.update.setBindInfo");
					BindUi.visible = false;
				} else gbx.log("外层消息已提示");
			});
		}
	});
	return BindParent;
});
gbx.define("game/lobby/lobbypop/bind_phone", ["gbx/net/messagecommand", "gbx/net/errorcode_des", "gbx/net/connector", "gbx/net/net_tool", "gbx/hubs", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (CMD, ERROR_CODE_DES, server, netTool, hubs, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization) {
	var BindPhone = BaseUI.extend({
		init: function () {
			this._super();
			this._timeleftCount = 0;
			this._state = 0;
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var title = uiUtils.createSprite("assets/main/lobby/sp/syssetting/word_bindPhone.png", "");
			title.pos(200, 10);
			this.addChild(title);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.scaleX = 1.5;
			shade_01.pos(55, 77);
			this.addChild(shade_01);
			var input = uiUtils.createTextInput("input_phone", uiLocallization.tip_input_phone_code);
			input.size(390, 50);
			input.fontSize = 20;
			input.pos(63, 73);
			this.addChild(input);
			var shade_02 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_02.scaleX = .7;
			shade_02.pos(55, 128);
			this.addChild(shade_02);
			var input_code = uiUtils.createTextInput("input_code", uiLocallization.tip_input_verify_code);
			input_code.size(160, 50);
			input_code.fontSize = 20;
			input_code.pos(63, 125);
			this.addChild(input_code);
			var getCode = uiUtils.createButton("assets/main/public/button_8.png", 2, "get_code");
			var code = uiUtils.createSprite("assets/main/lobby/sp/syssetting/word_getVerifyCode.png", "");
			code.pos(18, 15);
			getCode.addChild(code);
			var count = uiUtils.createSimpleText("", "count");
			count.pos(25, 10);
			count.fontSize = 25;
			getCode.addChild(count);
			getCode.pos(268, 120);
			getCode.setClickHandler(this, this.OnClick);
			this.addChild(getCode);
			var chip = uiUtils.createSprite("assets/main/lobby/sp/bindPhone/chip.png");
			chip.pos(220, 186);
			this.addChild(chip);
			var X10 = uiUtils.createSprite("assets/main/lobby/sp/bindPhone/X10.png");
			X10.pos(254, 191);
			this.addChild(X10);
			var bind_tip = uiUtils.createSimpleText(uiLocallization.bind_phone_reward_tip);
			bind_tip.align = "left";
			bind_tip.pos(200, 224);
			bind_tip.fontSize = 15;
			bind_tip.alpha = .8;
			this.addChild(bind_tip);
			var sureCode = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var word_bindPhone = uiUtils.createSprite("assets/main/lobby/sp/syssetting/word_bindPhone.png", "");
			word_bindPhone.pos(35, 12);
			sureCode.addChild(word_bindPhone);
			sureCode.pos(175, 250);
			sureCode.setClickHandler(this, this.OnClick);
			this.addChild(sureCode);
			this.timerLoop(1e3, this, function () {
				if (this._timeleftCount - 1 > 0) {
					this._timeleftCount = this._timeleftCount - 1;
					this.getChildByName("get_code").gray = true;
				} else {
					this._timeleftCount = 0;
					this.getChildByName("get_code").gray = false;
					if (this._state == 0) {
						this.getChildByName("get_code", "count").text = "";
					} else if (this._state == 1) {
						this.getChildByName("get_code", "word").alpha = 0;
					}
				}
			});
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
			if (btn.name == "get_code") {
				this.getVerifyCode();
			}
			if (btn.name == "btn_sure") { }
		},
		getVerifyCode: function () {
			if (this._timeleftCount > 0) {
				return;
			}
			var phone = this.getChildByName("input_phone").text;
			if (phone.length == 0) {
				uiUtils.showMesage(uiLocallization.phone_can_not_void);
				return;
			}
			if (phone.length < 11) {
				uiUtils.showMesage(uiLocallization.phone_length_less);
				return;
			}

			function getSuccess(ret) {
				this._timeleftCount = 90;
			}

			function getFail(param) {
				uiUtils.showMesage(param);
			}
			netTool.getVerifyCode("register", this, getSuccess, null, this, null, getFail);
		},
		reset: function () { }
	});
	return BindPhone;
});
gbx.define("game/lobby/lobbypop/change_head", ["gbx/hubs", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "comm/ui/top_message"], function (hubs, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization, topMessage) {
	var ChangeHead = BaseUI.extend({
		init: function () {
			this._super();
			this._headidx;
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "headsPanel");
			background.pos(0, 0);
			background.name = "background";
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var closeListBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_close_List");
			closeListBtn.pos(5, 5);
			closeListBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeListBtn);
			var head_background = uiUtils.createSprite("assets/main/public/backgroundmin.png", "");
			head_background.pos(33.5, 82);
			this.addChild(head_background);
			var changeHead = uiUtils.createButton("assets/main/public/Tab_1.png", 1, "btn_changeHead");
			var sp = uiUtils.createSprite("assets/main/lobby/sp/changeHead/choice_Head1.png", "choice_Head");
			sp.pos(58, 10);
			changeHead.addChild(sp);
			changeHead.pos(34, 44);
			changeHead.setClickHandler(this, this.OnClick);
			this.addChild(changeHead);
			var customHead = uiUtils.createButton("assets/main/public/Tab_2.png", 1, "btn_customHead");
			var sp = uiUtils.createSprite("assets/main/lobby/sp/changeHead/custom_Head2.png", "custom_Head");
			sp.pos(45, 10);
			customHead.addChild(sp);
			customHead.pos(251, 44);
			customHead.setClickHandler(this, this.OnClick);
			this.addChild(customHead);
			var sureChoiceBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "choiceBtn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtnG.png", "");
			sp.pos(50, 14);
			sureChoiceBtn.addChild(sp);
			sureChoiceBtn.pos(167.5, 250);
			sureChoiceBtn.setClickHandler(this, this.OnClick);
			this.addChild(sureChoiceBtn);
			var sureCustomBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "customBtn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtnG.png", "");
			sp.pos(50, 14);
			sureCustomBtn.addChild(sp);
			sureCustomBtn.pos(167.5, 250);
			sureCustomBtn.setClickHandler(this, this.OnClick);
			this.addChild(sureCustomBtn);
			var panelCustom = new Sprite;
			panelCustom.visible = false;
			panelCustom.pos(0, 0);
			panelCustom.name = "panelCustom";
			var headBG = uiUtils.createSprite("assets/main/lobby/sp/changeHead/addHead.png", "head");
			headBG.pos(50, 100);
			panelCustom.addChild(headBG);
			var captureBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "captureBtn");
			captureBtn.pos(280, 100);
			var word = uiUtils.createSprite("assets/main/lobby/sp/changeHead/from_Camera.png");
			word.pos(15, 15);
			captureBtn.addChild(word);
			captureBtn.setClickHandler(this, this.OnClick);
			panelCustom.addChild(captureBtn);
			var localSelectBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "localSelectBtn");
			localSelectBtn.pos(280, 170);
			var word1 = uiUtils.createSprite("assets/main/lobby/sp/changeHead/from_Album.png");
			word1.pos(15, 15);
			localSelectBtn.addChild(word1);
			localSelectBtn.setClickHandler(this, this.OnClick);
			panelCustom.addChild(localSelectBtn);
			this.addChild(panelCustom);
			var dataList = [];
			for (var i = 0; i < 46; i++) {
				var dataSpr = new Sprite;
				dataSpr.setImage("assets/main/head/userhead_" + i + ".png");
				dataSpr.scale(.8);
				var selectSp = uiUtils.createSprite("assets/main/lobby/sp/changeHead/select.png", "");
				selectSp.pos(-7, -7);
				selectSp.scale(1.2);
				selectSp.visible = false;
				dataSpr.addChild(selectSp);
				dataList[i] = [];
				dataList[i][0] = dataSpr;
				dataList[i][1] = i;
				dataList[i][2] = selectSp;
			}
			this._headList = uiUtils.createNormalList(5, 63, 92, "v", 400, 150, 80, 70);
			this._headList.name = "headList";
			this._headList.array = dataList;
			this.addChild(this._headList);
			this._headList.setRenderHandler(this, function (cell, idx) {
				if (idx >= this._headList.array.length) {
					return;
				}
				if (cell.getChildByName("head" + idx)) { } else {
					var spr = this._headList.array[idx][0];
					spr.name = "head" + idx;
					spr.pos(5, 5);
					cell.addChild(spr);
				}
			});
			this._headList.selectEnable = true;
			this._headList.setSelectHandler(this, function (idx) {
				this._changeHead(this._headList.array[idx][1]);
				for (var i = 0; i < this._headList.array.length; i++) {
					if (i == idx) {
						this._headList.array[i][2].visible = true;
					} else {
						this._headList.array[i][2].visible = false;
					}
				}
			});
		},
		_changeHead: function (headidx) {
			this._headidx = headidx;
		},
		OnClick: function (btn) {
			if (btn.name == "choiceBtn_sure") {
				if (this._headidx) this.publish("lobby.lobbypop.changehead", this._headidx);
				this.visible = false;
			} else if (btn.name == "customBtn_sure") { } else if (btn.name == "btn_close_List") {
				this.visible = false;
			} else if (btn.name == "btn_changeHead") {
				this.toggleCustomPanel(false);
			} else if (btn.name == "btn_customHead") {
				topMessage.post(uiLocallization.common_notopen_tip);
				return;
				this.toggleCustomPanel(true);
			} else if (btn.name == "captureBtn") { } else if (btn.name == "localSelectBtn") { }
		},
		toggleCustomPanel: function (v) {
			var btn1 = this.getChildByName("btn_changeHead");
			var btn2 = this.getChildByName("btn_customHead");
			if (v) {
				btn1.setSkinImage("assets/main/public/Tab_2.png");
				btn1.getChildByName("choice_Head").setImage("assets/main/lobby/sp/changeHead/choice_Head2.png");
				btn2.setSkinImage("assets/main/public/Tab_1.png");
				btn2.getChildByName("custom_Head").setImage("assets/main/lobby/sp/changeHead/custom_Head1.png");
			} else {
				btn1.setSkinImage("assets/main/public/Tab_1.png");
				btn1.getChildByName("choice_Head").setImage("assets/main/lobby/sp/changeHead/choice_Head1.png");
				btn2.setSkinImage("assets/main/public/Tab_2.png");
				btn2.getChildByName("custom_Head").setImage("assets/main/lobby/sp/changeHead/custom_Head2.png");
			}
			this.getChildByName("headList").visible = !v;
			this.getChildByName("choiceBtn_sure").visible = !v;
			this.getChildByName("customBtn_sure").visible = v;
			this.getChildByName("panelCustom").visible = v;
		}
	});
	return ChangeHead;
});
gbx.define("game/lobby/lobbypop/change_name", ["gbx/hubs", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "comm/ui/top_message"], function (hubs, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization, topMessage) {
	var ChangeName = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var title = uiUtils.createSprite("assets/main/lobby/sp/syssetting/word_changeName.png", "");
			title.pos(200, 10);
			this.addChild(title);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.scaleX = 1;
			shade_01.pos(124, 116);
			this.addChild(shade_01);
			var input = uiUtils.createTextInput("input_name", uiLocallization.tip_input_name);
			input.size(255, 50);
			input.fontSize = 20;
			input.pos(130, 115);
			this.addChild(input);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			sp.pos(62, 16);
			surebtn.addChild(sp);
			surebtn.pos(170, 227);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
			if (btn.name == "btn_sure") {
				var name = this.getChildByName("input_name").text;
				if (!accountMgr.checkSensitive(name)) {
					topMessage.post(uiLocallization.sensitive_set_name);
				} else if (name == uiLocallization.tip_input_name) {
					topMessage.post(uiLocallization.setting_no_name);
				} else {
					this.publish("lobby.lobbypop.changename", name);
					this.visible = false;
				}
			}
		}
	});
	return ChangeName;
});
gbx.define("game/lobby/lobbypop/change_pass", ["gbx/net/net_tool", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/hubs", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "conf/platform"], function (netTool, CMD, ERROR_CODE, ERROR_CODE_DES, hubs, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization, Platform) {
	var ChangePass = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var title = uiUtils.createSprite("assets/main/public/word_changePass.png", "");
			title.pos(200, 10);
			this.addChild(title);
			var word = uiUtils.createSimpleText(uiLocallization.login_account);
			word.pos(71, 58);
			word.fontSize = 22;
			word.color = "#FAD88E";
			word.stroke = 2;
			word.strokeColor = "#885712";
			this.addChild(word);
			var number = uiUtils.createSimpleText(accountMgr.getUserData().account);
			number.pos(175, 60);
			number.fontSize = 22;
			number.color = "#FAD88E";
			number.stroke = 2;
			number.strokeColor = "#885712";
			this.addChild(number);
			var inputTip = uiUtils.createSimpleText(uiLocallization.orign_pass);
			inputTip.pos(71, 110);
			inputTip.alpha = .8;
			this.addChild(inputTip);
			for (var i = 0; i < 3; i++) {
				var shade = uiUtils.createSprite("assets/main/public/input_box.png", "");
				shade.scaleX = 1;
				shade.pos(155, 90 + 55 * i);
				this.addChild(shade);
			}
			var input_orign = uiUtils.createTextInput("input_pass_orign", uiLocallization.tip_input_pass_orign);
			input_orign.size(255, 50);
			input_orign.fontSize = 20;
			input_orign.type = "password";
			input_orign.pos(162, 93);
			this.addChild(input_orign);
			var inputTipNew = uiUtils.createSimpleText(uiLocallization.new_pass);
			inputTipNew.pos(71, 162);
			inputTipNew.alpha = .8;
			this.addChild(inputTipNew);
			var input = uiUtils.createTextInput("input_pass", uiLocallization.tip_input_pass);
			input.size(255, 50);
			input.fontSize = 20;
			input.type = "password";
			input.pos(162, 148);
			this.addChild(input);
			var inputTipReNew = uiUtils.createSimpleText(uiLocallization.check_pass_ok);
			inputTipReNew.pos(71, 216);
			inputTipReNew.alpha = .8;
			this.addChild(inputTipReNew);
			var input_pass_repeat = uiUtils.createTextInput("input_pass_repeat", uiLocallization.tip_input_repeatpass);
			input_pass_repeat.size(255, 50);
			input_pass_repeat.fontSize = 20;
			input_pass_repeat.type = "password";
			input_pass_repeat.pos(162, 204);
			this.addChild(input_pass_repeat);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			sp.pos(62, 16);
			surebtn.addChild(sp);
			surebtn.pos(176, 255);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
			if (btn.name == "btn_sure") {
				this.getSalt();
			}
		},
		Check: function (old, newPass, repeatPass) {
			if (old == "" || old == null) {
				uiUtils.showMesage(uiLocallization.orgin_pass_no_void);
				return false;
			}
			if (newPass.length < 6) {
				uiUtils.showMesage(uiLocallization.pass_less_six);
				return false;
			}
			if (repeatPass.length == 0) {
				uiUtils.showMesage(uiLocallization.plz_input_pass);
				return false;
			}
			if (newPass != repeatPass) {
				uiUtils.showMesage(uiLocallization.pass_diffrent);
				return false;
			}
			return true;
		},
		getSalt: function () {
			var old = this.getChildByName("input_pass_orign").text;
			var newPass = this.getChildByName("input_pass").text;
			var repeatPass = this.getChildByName("input_pass_repeat").text;
			if (!this.Check(old, newPass, repeatPass)) return;
			netTool.getSalt(this, function (ret) {
				if (ret.result == ERROR_CODE.OK) {
					var hash = hex_md5(hex_md5(old + ret.staticSalt) + ret.randomSalt);
					this._ChangePass(hash, newPass);
				} else {
					uiUtils.showMesage(ERROR_CODE_DES[ret.result]);
				}
			}, null, this, null, function (param) {
				uiUtils.showMesage(param);
			});
		},
		_ChangePass: function (old, newPass) {
			var sendMsg = gtea.protobuf.encode("ResetPasswordReq", {
				account: accountMgr.getUserData().account,
				platformId: Platform.platformId,
				oldPassword: old,
				newPassword: newPass
			});
			var newPassword = newPass;
			netTool.createHttpRequest(netTool.getPathByKey("resetPasswordUrl"), sendMsg, this, function (data) {
				var retData = gtea.protobuf.decode("ResetPasswordResp", data);
				if (retData.result == ERROR_CODE.OK) {
					accountMgr.getUserData().password = newPassword;
					accountMgr.saveUserDataOnly();
					uiUtils.showMesage(uiLocallization.pass_reset_ok);
					this.reset();
					this.visible = false;
				} else {
					uiUtils.showMesage(ERROR_CODE_DES[retData.result]);
				}
			});
		},
		reset: function () {
			this.getChildByName("input_pass_orign").text = "";
			this.getChildByName("input_pass").text = "";
			this.getChildByName("input_pass_repeat").text = "";
		}
	});
	return ChangePass;
});
gbx.define("game/lobby/lobbypop/create_vip", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/playerdata_mgr", "gbx/render/ui/hslider", "comm/helper/conf_mgr", "comm/helper/room_mgr"], function (Sprite, Button, Text, uiUtils, uiLocallization, playerDataMgr, hSlider, confMgr, roomMgr) {
	var CreateVip = Sprite.extend({
		init: function () {
			this._super();
			this.boots = [];
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var sp = new Sprite;
			sp.setImage("assets/main/public/background_big.png");
			sp.pos(0, 0);
			this.addChild(sp);
			uiUtils.createBackgroundCrash(this, sp);
			var title = new Sprite;
			title.setImage("assets/main/lobby/sp/vip/word_create_room.png");
			title.pos(208, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
			shade_01.scaleX = 1;
			shade_01.pos(142, 66);
			this.addChild(shade_01);
			var input = uiUtils.createTextInput("input_room_name", playerDataMgr.getMyNick() + uiLocallization.create_vip_room_name);
			input.size(243, 50);
			input.fontSize = 22;
			input.pos(160, 65);
			input.on("input", this, fixRoomNameLen);
			this.addChild(input);

			function fixRoomNameLen() {
				var txt = this.getChildByName("input_room_name").text;
				if (txt.length > 10) {
					this.getChildByName("input_room_name").text = txt.substring(0, 10);
				}
			}
			var vipRoomLimitList = playerDataMgr.getVipRoomLimitList();
			this._type = vipRoomLimitList.length > 0 ? vipRoomLimitList[0].type : 0;
			var textMinNum = uiUtils.createSimpleText(uiLocallization.minbet, "minNum");
			var minT = vipRoomLimitList.length > 0 ? vipRoomLimitList[0].bankerFarmerBetMin : 0;
			textMinNum.text = uiLocallization.minbet + minT;
			textMinNum.pos(43, 126);
			textMinNum.fontSize = 22;
			textMinNum.align = "left";
			this.addChild(textMinNum);
			var textMaxNum = uiUtils.createSimpleText(uiLocallization.maxbet, "maxNum");
			var maxT = vipRoomLimitList.length > 0 ? vipRoomLimitList[0].allBankerFarmerBetMax : 0;
			textMaxNum.text = uiLocallization.maxbet + maxT;
			textMaxNum.pos(308, 126);
			textMaxNum.fontSize = 22;
			textMaxNum.align = "right";
			this.addChild(textMaxNum);
			var sliderBgfill = uiUtils.createSprite("assets/main/lobby/sp/vip/slider_change.png", "sliderBgfill");
			sliderBgfill.pos(35.5, 191);
			sliderBgfill.scaleX = 0;
			this.addChild(sliderBgfill);
			var slider = new hSlider;
			slider.name = "slider";
			slider.setSkinImage("assets/main/lobby/sp/vip/slider.png");
			slider.setSlider(0, 100, 0);
			slider.tick = 1;
			slider.pos(35.5, 190);
			slider.setChangeHandler(this, this.onChange);
			slider.showLabel = false;
			slider.sizeGrid = "10,10,10,10,1";
			this.addChild(slider);
			var downBack = uiUtils.createSprite("assets/main/lobby/sp/vip/card_boot_bg.png", "");
			downBack.pos(14.5, 230);
			this.addChild(downBack);
			var downBack_1 = uiUtils.createSprite("assets/main/lobby/sp/vip/card_boot.png", "");
			downBack_1.pos(38.5, 306);
			this.addChild(downBack_1);
			var begx = 33;
			for (var i = 0; i < 6; i++) {
				var p = uiUtils.createSimpleText(i + 1 + uiLocallization.brand_boots);
				p.pos(85 * i + begx, 266);
				p.name = "boot_" + i;
				this.addChild(p);
				var boot_btn = new Button;
				boot_btn.size(60, 60);
				boot_btn.pos(85 * i + 30, 270);
				boot_btn.name = i;
				boot_btn.setClickHandler(this, this.OnClick);
				this.addChild(boot_btn);
				this.boots.push(p);
			}
			var card = uiUtils.createSprite("assets/main/lobby/sp/vip/card.png", "card");
			card.pos(begx, 287);
			this.addChild(card);
			var num = 0;
			var nowHave = uiUtils.createSimpleText(uiLocallization.now_own + num);
			nowHave.pos(15, 365);
			nowHave.fontSize = 18;
			nowHave.name = "nowHave";
			this.addChild(nowHave);
			var servePee = uiUtils.createSimpleText(uiLocallization.room_service_pee);
			servePee.pos(15, 395);
			servePee.fontSize = 18;
			servePee.name = "servePee";
			this.addChild(servePee);
			var open = uiUtils.createButton("assets/main/public/button_8.png", 2, "open");
			var sp_03 = uiUtils.createSprite("assets/main/lobby/sp/vip/word_open.png");
			sp_03.pos(50, 15);
			open.addChild(sp_03);
			open.pos(189, 360);
			open.setClickHandler(this, this.OnClick);
			this.addChild(open);
			this._selectBoot = 0;
			this.setBooterPos(0);
		},
		setBooterPos: function (index) {
			var card = this.getChildByName("card");
			for (var i = 0; i < this.boots.length; i++) {
				if (i == index) {
					card.pos(33 + index * 85, 287);
					this.boots[i].pos(33 + 85 * i, 255);
					this.boots[i].color = "#EFC879";
				} else {
					this.boots[i].pos(33 + 85 * i, 266);
					this.boots[i].color = "#FFFFFF";
				}
			}
		},
		initUI: function () {
			this.getChildByName("slider").value = 0;
			var vipRoomLimitList = playerDataMgr.getVipRoomLimitList();
			this._type = vipRoomLimitList[0].type;
			this._pay = vipRoomLimitList[0].bankerFarmerBetMin;
			this._selectBoot = 0;
			this.setBooterPos(0);
			this.getChildByName("servePee").text = uiLocallization.room_service_pee + this._pay * (this._selectBoot + 1);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "open") {
				var roomName = this.getChildByName("input_room_name").text;
				var chips = this.getChildByName("minNum").text;
				var resetTimesMax = this._selectBoot + 1;
				roomMgr.createVIPRoom(roomName, parseInt(resetTimesMax), this._type, chips);
			} else {
				this._selectBoot = btn.name;
				this.setBooterPos(this._selectBoot);
				this.getChildByName("servePee").text = uiLocallization.room_service_pee + this._pay * (this._selectBoot + 1);
			}
		},
		onChange: function (value) {
			var vipRoomLimitList = playerDataMgr.getVipRoomLimitList();
			var len = vipRoomLimitList.length;
			var index = 0;
			for (var i = 0; i < len; i++) {
				var min = 100 / (len - 1);
				if (value == 0) index = 0;
				else if (i + 1 < len && value > i * min && value <= (i + 1) * min) index = i + 1;
			}
			if (index < len) {
				this._type = vipRoomLimitList[index].type;
				this._pay = vipRoomLimitList[index].bankerFarmerBetMin;
				var min = vipRoomLimitList[index].bankerFarmerBetMin;
				var max = vipRoomLimitList[index].allBankerFarmerBetMax;
				this.getChildByName("minNum").text = uiLocallization.minbet + (min + (max - min) * value / 100);
				this.getChildByName("maxNum").text = uiLocallization.maxbet + vipRoomLimitList[index].allBankerFarmerBetMax;
				this.getChildByName("servePee").text = uiLocallization.room_service_pee + this._pay * (this._selectBoot + 1);
			}
			var sliderBgfill = this.getChildByName("sliderBgfill");
			sliderBgfill.scaleX = value / 100;
		}
	});
	return CreateVip;
});
gbx.define("game/lobby/lobbypop/draw_cash", ["gbx/hubs", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/bank_mgr"], function (hubs, server, CMD, ERROR_CODE, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, uiLocallization, bankMgr) {
	var DrawCash = BaseUI.extend({
		init: function () {
			this._super();
			this._cardAccount = "";
			this._canDraw = 0;
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background_big.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_bank.png");
			sp_title.pos(240, 10);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var back_layer = uiUtils.createSprite("assets/main/public/item_bg.png", "");
			back_layer.pos(12, 66);
			back_layer.scaleY = 1.03;
			back_layer.scaleX = 1;
			this.addChild(back_layer);
			var icon = new Sprite;
			icon.pos(84, 87);
			icon.name = "bankIcon";
			icon.scale(.6);
			this.addChild(icon);
			var cardName = uiUtils.createSimpleText("", "cardName");
			cardName.pos(178, 87);
			cardName.color = "#E0F0EF";
			cardName.fontSize = 21;
			this.addChild(cardName);
			var cardEnd = uiUtils.createSimpleText("", "cardEnd");
			cardEnd.pos(178, 118);
			cardEnd.fontSize = 15;
			cardEnd.color = "#E0F0EF";
			this.addChild(cardEnd);
			var bankerFee = uiUtils.createSimpleText("", "bankerFee");
			bankerFee.pos(40, 318);
			this.addChild(bankerFee);
			var tip = uiUtils.createSimpleText(uiLocallization.plz_input_money_count);
			tip.width = 245;
			tip.pos(210, 180);
			tip.fontSize = 20;
			tip.color = "#E7E777";
			tip.height = 50;
			this.addChild(tip);
			var str = uiLocallization.can_draw_cash;
			var candrawCash = uiUtils.createSimpleText(str, "candrawCash");
			candrawCash.pos(210, 208);
			candrawCash.color = "#E0F0EF";
			this.addChild(candrawCash);
			var shade_01 = uiUtils.createSprite("assets/main/bank/inputBox.png", "");
			shade_01.pos(150, 235);
			shade_01.scaleX = 1;
			this.addChild(shade_01);

			function fixCardNumer() {
				var txt = this.getChildByName("inputMoney").text;
				var text = txt;
				if (isNaN(txt)) {
					this.getChildByName("inputMoney").text = "";
					this.getChildByName("bankerFee").text = "";
				}
				if (txt.indexOf(".") != -1) {
					this.getChildByName("inputMoney").text = txt.substring(0, txt.indexOf("."));
					text = this.getChildByName("inputMoney").text;
				}
				var number = parseInt(text);
				if (number >= this._canDraw) {
					this.getChildByName("inputMoney").text = this._canDraw;
				}
				var number1 = parseInt(this.getChildByName("inputMoney").text);
				if (number1) this.getChildByName("bankerFee").text = uiLocallization.bankerFee + number1 * .02;
				else this.getChildByName("bankerFee").text = "";
			}
			var money_count = uiUtils.createTextInput("inputMoney", uiLocallization.draw_cash_limit);
			money_count.pos(165, 230);
			money_count.fontSize = 20;
			money_count.width = 240;
			money_count.on("input", this, fixCardNumer);
			this.addChild(money_count);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var sp = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			sp.pos(62, 16);
			surebtn.addChild(sp);
			surebtn.pos(200, 285);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
			var tip1 = uiUtils.createSimpleText(uiLocallization.tip_1);
			tip1.fontSize = 15;
			tip1.pos(42, 350);
			tip1.color = "#C40C0F";
			this.addChild(tip1);
			var tip2 = uiUtils.createSimpleText(uiLocallization.tip_2);
			tip2.fontSize = 13;
			tip2.width = 450;
			tip2.align = "left";
			tip2.multiline = true;
			tip2.wordWrap = true;
			tip2.pos(42, 370);
			tip2.color = "#E0F0EF";
			this.addChild(tip2);
			var tip3 = uiUtils.createSimpleText(uiLocallization.tip_3);
			tip3.pos(42, 400);
			tip3.fontSize = 13;
			tip3.color = "#E0F0EF";
			this.addChild(tip3);
		},
		clear: function () {
			this.getChildByName("inputMoney").text = "";
			this.getChildByName("bankerFee").text = "";
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
				this.clear();
			}
			if (btn.name == "btn_sure") {
				this.check();
			}
		},
		check: function () {
			var txt = this.getChildByName("inputMoney").text;
			var num = /^\d*$/;
			if (!num.exec(txt)) {
				uiUtils.showMesage(uiLocallization.plz_input_number);
				return;
			}
			var number = parseInt(txt, 10);
			if (number < 100) {
				uiUtils.showMesage(uiLocallization.draw_cash_limit);
				return;
			}
			if (number > this._canDraw) {
				var str = uiLocallization.draw_cash_limit_down;
				str = str.replace("A", this._canDraw);
				uiUtils.showMesage(str);
				return;
			}
			if (number % 100 != 0) {
				uiUtils.showMesage(uiLocallization.draw_cash_hundred_limit);
				return;
			}
			this.drawCash(number);
		},
		drawCash: function (number) {
			var sendData = gtea.protobuf.encode("GetCashReq", {
				cash: parseFloat(number),
				platformId: "",
				phoneNumber: accountMgr.getUserData().account
			});
			server.requestToGame(CMD.GetCash, sendData, this, function (errorcode, retData) {
				if (errorcode == ERROR_CODE.OK) {
					var msgData = gtea.protobuf.decode("GetCashResp", retData);
					playerDataMgr.dealItemProto(msgData.itemProto);
					uiUtils.showMesage(uiLocallization.draw_cash_ok);
					this.publish("lobby.game.updateMyInfo");
					this.publish("game_baccarat.setting.updateMyDeposit");
					this.getChildByName("inputMoney").text = "";
					this.visible = false;
				}
			});
		},
		setData: function (cardNum, drawMoney) {
			this._cardAccount = cardNum;
			this._canDraw = drawMoney;
			this.refreshCardInfo();
		},
		refreshCardInfo: function () {
			var data = bankMgr.getCardData(this._cardAccount);
			this.getChildByName("cardName").text = data.belong + "-" + data.cardName;
			var iconName = "quick.png";
			var basePath = "assets/main/bankIcon/" + iconName;
			this.getChildByName("bankIcon").setImage(basePath);
			var str = this._cardAccount;
			str = str.replace(/\-/g, "");
			str = str.substring(str.length - 4);
			this.getChildByName("cardEnd").text = uiLocallization.card_suffix + str;
			var can_draw = uiLocallization.can_draw_cash;
			can_draw = can_draw.replace("A", this._canDraw);
			this.getChildByName("candrawCash").text = can_draw;
			this.clear();
		}
	});
	return DrawCash;
});
gbx.define("game/lobby/lobbypop/gambling_details", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/ui/ui_utils", "gbx/render/ui/panel", "conf/ui_locallization"], function (Sprite, Button, Text, uiUtils, Panel, uiLocallization) {
	var GamblingDetail = Sprite.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/gambledetail/title_gambling.png", "");
			title.pos(220, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var WordsTop = [uiLocallization.gamble_time, uiLocallization.gamble_betbefore, uiLocallization.gamble_betAction, uiLocallization.gamble_result, uiLocallization.gamble_caculate, uiLocallization.gamble_caculate_money];
			var posX = [26, 116, 211, 313, 395, 470];
			for (var index = 0; index < WordsTop.length; index++) {
				var lab = uiUtils.createSimpleText(WordsTop[index], "");
				lab.width = 80;
				lab.multiline = true;
				lab.wordWrap = true;
				lab.fontSize = 20;
				lab.color = "#E0F0EF";
				lab.pivotToCenter();
				lab.pos(posX[index] + 40, 80);
				this.addChild(lab);
			}
			var line = uiUtils.createSprite("assets/main/lobby/sp/gambledetail/splitLine.png");
			line.pos(0, 110);
			this.addChild(line);
			var panel = uiUtils.createPanel(730, 110 * 6 + 40, "rootpanel");
			panel.pos(15, 115);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 105 * index;
			var bg = uiUtils.createSprite("assets/main/public/back_booter_02.png", "");
			bg.pos(0, posY);
			bg.scaleY = 1.2;
			root.addChild(bg);
			var rdata = data;
			var newDate = new Date;
			newDate.setTime(rdata.date);
			var time = newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate() + "\n" + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
			var timelab = uiUtils.createSimpleText(time, "time");
			timelab.pos(12, 28 + posY);
			timelab.color = "#E9E0C3";
			timelab.align = "center";
			timelab.width = 10;
			timelab.multiline = true;
			root.addChild(timelab);
			var before = uiUtils.createSimpleText(uiUtils.getFloatByPower(rdata.moneyBefore, 1), "before");
			before.pos(35, 37 + posY);
			before.align = "center";
			before.fontSize = 18;
			before.color = "#E9E0C3";
			root.addChild(before);
			var i = 0;
			var result = "";
			result += uiLocallization.banker + ": " + rdata.bankerNum + uiLocallization.point + " \n" + uiLocallization.farmer + ": " + rdata.farmerNum + uiLocallization.point + " \n";
			if (rdata.farmerPair) {
				result += " " + uiLocallization.farmerPair + " \n";
				i++;
			}
			if (rdata.bankerPair) {
				result += " " + uiLocallization.bankerPair + " \n";
				i++;
			}
			if (rdata.winType == 1) {
				result += " " + uiLocallization.bankerWin + " \n";
				i++;
			} else if (rdata.winType == 2) {
				result += " " + uiLocallization.farmerWin + " \n";
				i++;
			} else if (rdata.winType == 3) {
				result += " " + uiLocallization.duece + " \n";
				i++;
			}
			var resultlab = uiUtils.createSimpleText(result, "result");
			resultlab.pos(280, 25 - i * 8 + posY);
			resultlab.fontSize = 18;
			resultlab.color = "#E9E0C3";
			resultlab.wordWrap = true;
			resultlab.align = "center";
			resultlab.width = 80;
			root.addChild(resultlab);
			var y = 45;
			var str = "";
			var j = 0;
			if (rdata.moneyBanker > 0) {
				str += uiLocallization.banker + ": " + rdata.moneyBanker + "\n";
				j++;
			}
			if (rdata.moneyFarmer > 0) {
				str += uiLocallization.farmer + ": " + rdata.moneyFarmer + "\n";
				j++;
			}
			if (rdata.moneyDeuce > 0) {
				str += uiLocallization.duece + ": " + rdata.moneyDeuce + "\n";
				j++;
			}
			if (rdata.moneyBankerPair > 0) {
				str += uiLocallization.bankerPair + ": " + rdata.moneyBankerPair + "\n";
				j++;
			}
			if (rdata.moneyBankerPair > 0) {
				str += uiLocallization.farmerPair + ": " + rdata.moneyFarmerPair + "\n";
				j++;
			}
			var mybet = uiUtils.createSimpleText(str, "mybet");
			mybet.pos(175, y - j * 9 + posY);
			mybet.align = "center";
			mybet.fontSize = 18;
			mybet.color = "#E9E0C3";
			mybet.width = 110;
			mybet.multiline = true;
			mybet.wordWrap = true;
			root.addChild(mybet);
			var delta = "0";
			if (rdata.moneyDelta > 0) delta = "+" + uiUtils.getFloatByPower(rdata.moneyDelta, 1);
			else delta = "" + uiUtils.getFloatByPower(rdata.moneyDelta, 1);
			var moneyDelta = uiUtils.createSimpleText(delta, "moneyDelta");
			moneyDelta.pos(295, 37 + posY);
			moneyDelta.align = "center";
			moneyDelta.fontSize = 18;
			moneyDelta.color = "#E9E0C3";
			root.addChild(moneyDelta);
			var after = uiUtils.createSimpleText(uiUtils.getFloatByPower(rdata.moneyAfter, 1), "after");
			after.pos(378, 37 + posY);
			after.align = "center";
			after.fontSize = 18;
			after.color = "#E9E0C3";
			root.addChild(after);
		},
		OnClick: function (btn) {
			this.visible = false;
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setGambleData: function (data) {
			this.putData(data);
		}
	});
	return GamblingDetail;
});
gbx.define("game/lobby/lobbypop/game_help", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils) {
	var GameHelp = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/syssetting/title_help.png", "");
			title.pos(220, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var panel = new Panel;
			panel.size(520, 760);
			panel.pos(11, 62);
			panel.vScrollBarSkin = "";
			this.addChild(panel);
			var help_content_0 = uiUtils.createSprite("assets/main/lobby/sp/help/help_1.jpg", "");
			panel.addChild(help_content_0);
			var help_content_1 = uiUtils.createSprite("assets/main/lobby/sp/help/help_2.jpg", "");
			help_content_1.pos(0, 819);
			panel.addChild(help_content_1);
			var help_content_2 = uiUtils.createSprite("assets/main/lobby/sp/help/help_3.jpg", "");
			help_content_2.pos(0, 1772);
			panel.addChild(help_content_2);
			var help_content_3 = uiUtils.createSprite("assets/main/lobby/sp/help/help_4.jpg", "");
			help_content_3.pos(0, 2874);
			panel.addChild(help_content_3);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		}
	});
	return GameHelp;
});
gbx.define("game/lobby/lobbypop/game_offline_user", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/render/ui/image"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, Image) {
	var QueryOfflineUser = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/offline_title.png", "");
			title.pos(210.5, 20);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var cc = new Image("assets/main/lobby/sp/game_spread/share_bg.png");
			cc.pos(0, 130);
			cc.width = 640;
			cc.height = 950;
			cc.sizeGrid = "10,10,10,10";
			this.addChild(cc);
			var userName = uiUtils.createSimpleText(uiLocallization.offline_user_name, "");
			userName.pos(-15, 90);
			userName.color = "#E0F0EF";
			userName.align = "center";
			userName.fontSize = 22;
			this.addChild(userName);
			var userId = uiUtils.createSimpleText(uiLocallization.offline_user_id, "");
			userId.pos(135, 90);
			userId.fontSize = 22;
			userId.color = "#E0F0EF";
			userId.align = "center";
			this.addChild(userId);
			var registerTime = uiUtils.createSimpleText(uiLocallization.offline_user_register_time, "");
			registerTime.pos(292, 90);
			registerTime.fontSize = 22;
			registerTime.color = "#E0F0EF";
			registerTime.align = "center";
			this.addChild(registerTime);
			var bindingTime = uiUtils.createSimpleText(uiLocallization.offline_user_binding_time, "");
			bindingTime.pos(460, 90);
			bindingTime.fontSize = 22;
			bindingTime.color = "#E0F0EF";
			bindingTime.align = "center";
			this.addChild(bindingTime);
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, 130);
			this.addChild(line);
			var panel = uiUtils.createPanel(640, 950, "rootpanel");
			panel.pos(0, 130);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 100 * index;
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 100);
			root.addChild(line);
			var rdata = data;
			var userName = uiUtils.createSimpleText(rdata.nickName, "userName");
			userName.pos(-15, 40 + posY);
			userName.align = "center";
			userName.fontSize = 20;
			userName.color = "#E9E0C3";
			root.addChild(userName);
			var userId = uiUtils.createSimpleText(rdata.playerId, "userId");
			userId.pos(135, 40 + posY);
			userId.align = "center";
			userId.fontSize = 20;
			userId.color = "#E9E0C3";
			root.addChild(userId);
			var newDate = new Date;
			newDate.setTime(rdata.createTime);
			var time = newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate();
			var timelab = uiUtils.createSimpleText(time, "time");
			timelab.pos(292, 40 + posY);
			timelab.color = "#E9E0C3";
			timelab.align = "center";
			timelab.fontSize = 20;
			root.addChild(timelab);
			var newDate2 = new Date;
			newDate2.setTime(rdata.bindTime);
			if (rdata.bindTime <= 0) newDate2.setTime(rdata.createTime);
			var time2 = newDate2.getFullYear() + "." + (newDate2.getMonth() + 1) + "." + newDate2.getDate();
			var timelab2 = uiUtils.createSimpleText(time2, "time2");
			timelab2.pos(460, 40 + posY);
			timelab2.color = "#E9E0C3";
			timelab2.align = "center";
			timelab2.fontSize = 20;
			root.addChild(timelab2);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data) {
			var root = this.getChildByName("rootpanel");
			root.scrollTo(0);
			this.putData(data);
		}
	});
	return QueryOfflineUser;
});
gbx.define("game/lobby/lobbypop/game_rebate_detail", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/render/ui/image"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, Image) {
	var RebateDetails = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/rebate_detail.png", "title");
			title.pos(247, 20);
			this.addChild(title);
			var cc = new Image("assets/main/lobby/sp/game_spread/share_bg.png");
			cc.pos(0, 130);
			cc.width = 640;
			cc.height = 950;
			cc.sizeGrid = "10,10,10,10";
			this.addChild(cc);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var posY = 90;
			var gamble_time = uiUtils.createSimpleText(uiLocallization.gamble_time, "");
			gamble_time.pos(-50, posY);
			gamble_time.color = "#E0F0EF";
			gamble_time.align = "center";
			gamble_time.fontSize = 22;
			this.addChild(gamble_time);
			var gamble_betAction = uiUtils.createSimpleText(uiLocallization.gamble_betAction, "");
			gamble_betAction.pos(135, posY - 13);
			gamble_betAction.fontSize = 22;
			gamble_betAction.color = "#E0F0EF";
			gamble_betAction.align = "center";
			gamble_betAction.width = 90;
			gamble_betAction.multiline = true;
			gamble_betAction.wordWrap = true;
			this.addChild(gamble_betAction);
			var gamble_result = uiUtils.createSimpleText(uiLocallization.gamble_result, "");
			gamble_result.pos(220, posY);
			gamble_result.fontSize = 22;
			gamble_result.color = "#E0F0EF";
			gamble_result.align = "center";
			this.addChild(gamble_result);
			var gamble_caculate = uiUtils.createSimpleText(uiLocallization.gamble_caculate, "");
			gamble_caculate.pos(350, posY);
			gamble_caculate.fontSize = 22;
			gamble_caculate.color = "#E0F0EF";
			gamble_caculate.align = "center";
			this.addChild(gamble_caculate);
			var rebate = uiUtils.createSimpleText(uiLocallization.rebate, "");
			rebate.pos(480, posY);
			rebate.fontSize = 22;
			rebate.color = "#E0F0EF";
			rebate.align = "center";
			this.addChild(rebate);
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 40);
			this.addChild(line);
			var panel = uiUtils.createPanel(640, 1136 - 56 - (posY + 40), "rootpanel");
			panel.pos(0, posY + 40);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 120 * index;
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 120);
			root.addChild(line);
			var rdata = data;
			var newDate = new Date;
			newDate.setTime(rdata.time);
			var time = newDate.getMonth() + 1 + "-" + newDate.getDate() + "\n" + newDate.getHours() + ":" + newDate.getMinutes();
			var timelab = uiUtils.createSimpleText(time, "time");
			timelab.pos(-50, 38 + posY);
			timelab.color = "#E9E0C3";
			timelab.align = "center";
			timelab.fontSize = 22;
			root.addChild(timelab);
			var y = 50;
			var str = "";
			var j = -1;
			if (rdata.moneyBanker > 0) {
				str += uiLocallization.banker + "/" + rdata.moneyBanker + "\n";
				j++;
			}
			if (rdata.moneyFarmer > 0) {
				str += uiLocallization.farmer + "/" + rdata.moneyFarmer + "\n";
				j++;
			}
			if (rdata.moneyDeuce > 0) {
				str += uiLocallization.duece + "/" + rdata.moneyDeuce + "\n";
				j++;
			}
			if (rdata.moneyBankerPair > 0) {
				str += uiLocallization.bankerPair + "/" + rdata.moneyBankerPair + "\n";
				j++;
			}
			if (rdata.moneyFarmerPair > 0) {
				str += uiLocallization.farmerPair + "/" + rdata.moneyFarmerPair + "\n";
				j++;
			}
			var betDetail = uiUtils.createSimpleText(str, "betDetail");
			betDetail.pos(80, y - j * 12 + posY);
			betDetail.align = "center";
			betDetail.fontSize = 22;
			betDetail.color = "#E9E0C3";
			root.addChild(betDetail);
			var i = -1;
			var result = "";
			result += uiLocallization.banker + ": " + rdata.bankerNum + uiLocallization.point + " \n";
			i++;
			result += uiLocallization.farmer + ": " + rdata.farmerNum + uiLocallization.point + " \n";
			i++;
			if (rdata.farmerPair) {
				result += " " + uiLocallization.farmerPair + " \n";
				i++;
			}
			if (rdata.bankerPair) {
				result += " " + uiLocallization.bankerPair + " \n";
				i++;
			}
			if (rdata.winType == 1) {
				result += " " + uiLocallization.bankerWin + " \n";
				i++;
			} else if (rdata.winType == 2) {
				result += " " + uiLocallization.farmerWin + " \n";
				i++;
			} else if (rdata.winType == 3) {
				result += " " + uiLocallization.duece + " \n";
				i++;
			}
			var resultText = uiUtils.createSimpleText(result, "resultText");
			resultText.pos(220, y - i * 12 + posY);
			resultText.align = "center";
			resultText.fontSize = 22;
			resultText.color = "#E9E0C3";
			root.addChild(resultText);
			var caculate = uiUtils.createSimpleText(uiUtils.getFloatByPower(rdata.moneyDelta, 2), "caculate");
			caculate.pos(350, 50 + posY);
			caculate.align = "center";
			caculate.fontSize = 22;
			caculate.color = "#E9E0C3";
			root.addChild(caculate);
			var rebate = uiUtils.createSimpleText(uiUtils.getFloatByPower(rdata.rebate, 2), "rebate");
			rebate.pos(480, 50 + posY);
			rebate.align = "center";
			rebate.fontSize = 22;
			rebate.color = "#E9E0C3";
			root.addChild(rebate);
		},
		_onClickDetail: function (btn, index) {
			gbx.log("index====" + index);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data) {
			var root = this.getChildByName("rootpanel");
			root.scrollTo(0);
			this.putData(data);
		}
	});
	return RebateDetails;
});
gbx.define("game/lobby/lobbypop/game_rebate_month", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/render/ui/image"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, Image) {
	var RebateMonth = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/month_rebate_detail.png", "title");
			title.pos(247, 20);
			this.addChild(title);
			var cc = new Image("assets/main/lobby/sp/game_spread/share_bg.png");
			cc.pos(0, 130);
			cc.width = 640;
			cc.height = 950;
			cc.sizeGrid = "10,10,10,10";
			this.addChild(cc);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var posY = 90;
			var userName = uiUtils.createSimpleText(uiLocallization.user_name, "user_name");
			userName.pos(30, posY);
			userName.color = "#E0F0EF";
			userName.fontSize = 24;
			this.addChild(userName);
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 40);
			this.addChild(line);
			var panel = uiUtils.createPanel(640, 1136 - 56 - (posY + 40), "rootpanel");
			panel.pos(0, posY + 40);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 120 * index;
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 120);
			root.addChild(line);
			var rdata = data;
			var newDate = new Date;
			newDate.setTime(rdata.date);
			var time = newDate.getMonth() + 1 + "." + newDate.getDate();
			var timelab = uiUtils.createSimpleText(uiLocallization.date + time, "time");
			timelab.pos(0, 50 + posY);
			timelab.color = "#E9E0C3";
			timelab.align = "center";
			timelab.fontSize = 22;
			root.addChild(timelab);
			var rebate = uiUtils.createSimpleText(uiLocallization.rebate + "：" + uiUtils.getFloatByPower(rdata.amount, 2), "rebate");
			rebate.pos(200, 50 + posY);
			rebate.align = "center";
			rebate.fontSize = 22;
			rebate.color = "#E9E0C3";
			root.addChild(rebate);
			var btn_detail = uiUtils.createButton("assets/main/public/button.png", 2, "btn_detail");
			btn_detail.pos(460, 20 + posY);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png");
			word.pos(55, 21.5);
			btn_detail.addChild(word);
			btn_detail.setClickHandler(this, this._onClickDetail, index);
			root.addChild(btn_detail);
		},
		_onClickDetail: function (btn, index) {
			if (index >= this._data.length) return;
			var myDate = new Date;
			myDate.setTime(this._data[index].date);
			var date = myDate.toLocaleDateString();
			date = date.replace(/\//g, "-");
			this.publish("lobby.rebate.openRebateDetails", this._userInfo.playerId, date);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (userInfo, data, index) {
			var root = this.getChildByName("rootpanel");
			root.scrollTo(0);
			this._data = data;
			this._userInfo = userInfo;
			this.putData(data);
			var user_name = this.getChildByName("user_name");
			if (userInfo == "") {
				user_name.text = "";
			} else {
				user_name.text = uiLocallization.user_name + userInfo.nickName + "        " + uiLocallization.user_id + userInfo.playerId + "        " + uiLocallization.rebate + "：" + uiUtils.getFloatByPower(userInfo.amount, 2);
			}
		}
	});
	return RebateMonth;
});
gbx.define("game/lobby/lobbypop/game_rebate_summary", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/render/ui/image", "game/lobby/lobbypop/game_rebate_month", "game/lobby/lobbypop/game_rebate_detail", "gbx/net/net_tool", "comm/ui/top_message", "gbx/net/errorcode_des", "comm/ui/connect_loading"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, Image, RebateMonth, RebateDetails, netTool, topMessage, ERROR_CODE_DES, loadingUI) {
	var RebateSummary = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/yesterday_rebate_title.png", "title");
			title.pos(247, 20);
			this.addChild(title);
			var rebateAll = uiUtils.createSprite("assets/main/lobby/sp/game_spread/yesterday_rebate_all.png", "rebateAll");
			rebateAll.pos(30, 100);
			this.addChild(rebateAll);
			var userName = uiUtils.createSimpleText("0", "allNum");
			userName.pos(245, 105);
			userName.color = "#FEC600";
			userName.fontSize = 25;
			this.addChild(userName);
			var cc = new Image("assets/main/lobby/sp/game_spread/share_bg.png");
			cc.pos(0, 160);
			cc.width = 640;
			cc.height = 920;
			cc.sizeGrid = "10,10,10,10";
			this.addChild(cc);
			var line = uiUtils.createSprite("assets/main/public/splitLine_1.png");
			line.pos(-50, 160);
			this.addChild(line);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var posY = 175;
			var userName = uiUtils.createSimpleText(uiLocallization.offline_user_name, "offline_user_name");
			userName.pos(-10, posY);
			userName.color = "#E0F0EF";
			userName.fontSize = 22;
			userName.align = "center";
			this.addChild(userName);
			var userId = uiUtils.createSimpleText(uiLocallization.offline_user_id, "offline_user_id");
			userId.pos(150, posY);
			userId.fontSize = 22;
			userId.align = "center";
			userId.color = "#E0F0EF";
			this.addChild(userId);
			var rebate = uiUtils.createSimpleText(uiLocallization.rebate, "rebate");
			rebate.pos(292, posY);
			rebate.fontSize = 22;
			rebate.align = "center";
			rebate.color = "#E0F0EF";
			this.addChild(rebate);
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 40);
			this.addChild(line);
			var panel = uiUtils.createPanel(640, 1136 - 56 - (posY + 40), "rootpanel");
			panel.pos(0, posY + 40);
			this.addChild(panel);
			var rebateMonth = new RebateMonth;
			rebateMonth.name = "rebateMonth";
			rebateMonth.pos(0, 0);
			rebateMonth.visible = false;
			this.addChild(rebateMonth);
			var rebateDetails = new RebateDetails;
			rebateDetails.name = "rebateDetails";
			rebateDetails.pos(0, 0);
			rebateDetails.visible = false;
			this.addChild(rebateDetails);
			this.subscribe("lobby.rebate.openRebateDetails", this, this._openRebateDetails);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 120 * index;
			var line = uiUtils.createSprite("assets/main/public/splitLine_3.png");
			line.pos(40, posY + 120);
			root.addChild(line);
			var rdata = data;
			var userName = uiUtils.createSimpleText(rdata.nickName, "userName");
			userName.pos(0, 50 + posY);
			userName.align = "center";
			userName.fontSize = 22;
			userName.color = "#E9E0C3";
			root.addChild(userName);
			var userId = uiUtils.createSimpleText(rdata.playerId, "userId");
			userId.pos(220, 50 + posY);
			userId.align = "center";
			userId.fontSize = 22;
			userId.color = "#E9E0C3";
			root.addChild(userId);
			var rebate = uiUtils.createSimpleText(uiUtils.getFloatByPower(rdata.amount, 2), "rebate");
			rebate.pos(440, 50 + posY);
			rebate.align = "center";
			rebate.fontSize = 22;
			rebate.color = "#E9E0C3";
			root.addChild(rebate);
			if (this._btnName != "btn_year") {
				var btn_detail = uiUtils.createButton("assets/main/public/button.png", 2, "btn_detail");
				btn_detail.pos(460, 20 + posY);
				var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png");
				word.pos(55, 21.5);
				btn_detail.addChild(word);
				btn_detail.setClickHandler(this, this._onClickDetail, index);
				root.addChild(btn_detail);
				userName.pos(-10, 50 + posY);
				userName.fontSize = 20;
				userId.pos(150, 50 + posY);
				userId.fontSize = 20;
				rebate.pos(292, 50 + posY);
				rebate.fontSize = 20;
			}
		},
		_onClickDetail: function (btn, index) {
			switch (this._btnName) {
				case "btn_last":
					{
						var myDate = new Date;
						myDate.setDate(myDate.getDate() - 1);
						var date = myDate.toLocaleDateString();
						date = date.replace(/\//g, "-");
						if (index >= this._data.length) return;
						var playerId = this._data[index].playerId;
						this._openRebateDetails(playerId, date);
					}
					break;
				case "btn_month":
					{
						this._openRebateMonth(index);
					}
					break;
			}
		},
		_openRebateMonth: function (index) {
			if (index >= this._data.length) return;
			var myDate = new Date;
			myDate.setDate(myDate.getDate() - 1);
			var date = myDate.toLocaleDateString();
			date = date.replace(/\//g, "-");
			var sendMsg = gtea.protobuf.encode("RBaccaratQueryReq", {
				playerId: this._data[index].playerId,
				date: date,
				token: "Moxian009",
				playerCurMonth: true
			});
			loadingUI.show();
			var url = netTool.getPathByKey("rBaccaratQueryUrl");
			netTool.createHttpRequest(url, sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryMonthResp", data);
				loadingUI.hide();
				if (msgData.result == ERROR_CODE.OK) {
					var userInfo = "";
					if (index < this._data.length) userInfo = this._data[index];
					this.getChildByName("rebateMonth").setData(userInfo, msgData.info);
					this.getChildByName("rebateMonth").visible = true;
				} else topMessage.post(ERROR_CODE_DES[msgData.result]);
			});
		},
		_openRebateDetails: function (playerId, date) {
			var sendMsg = gtea.protobuf.encode("RBaccaratQueryDetailReq", {
				token: "Moxian009",
				childId: playerId.toString(),
				date: date
			});
			loadingUI.show();
			var url = netTool.getPathByKey("rBaccaratQueryDetailUrl");
			netTool.createHttpRequest(url, sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryDetailResp", data);
				loadingUI.hide();
				if (msgData.result == ERROR_CODE.OK) {
					this.getChildByName("rebateDetails").setData(msgData.info);
					this.getChildByName("rebateDetails").visible = true;
				} else topMessage.post(ERROR_CODE_DES[msgData.result]);
			});
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		getAllNum: function (data) {
			var num = 0;
			for (var i = 0; i < data.length; i++) {
				num += data[i].amount;
			}
			return uiUtils.getFloatByPower(num, 2);
		},
		setData: function (btnName, data) {
			this._btnName = btnName;
			this._data = data;
			var root = this.getChildByName("rootpanel");
			root.scrollTo(0);
			this.putData(data);
			var title = this.getChildByName("title");
			var rebateAll = this.getChildByName("rebateAll");
			var allNum = this.getChildByName("allNum");
			var offline_user_name = this.getChildByName("offline_user_name");
			var offline_user_id = this.getChildByName("offline_user_id");
			var rebate = this.getChildByName("rebate");
			var imaget = "assets/main/lobby/sp/game_spread/yesterday_rebate_title.png";
			var imager = "assets/main/lobby/sp/game_spread/yesterday_rebate_all.png";
			var posX1 = -10;
			var posX2 = 150;
			var posX3 = 292;
			var posY = 175;
			switch (btnName) {
				case "btn_last":
					{
						imaget = "assets/main/lobby/sp/game_spread/yesterday_rebate_title.png";
						imager = "assets/main/lobby/sp/game_spread/yesterday_rebate_all.png";
					}
					break;
				case "btn_month":
					{
						imaget = "assets/main/lobby/sp/game_spread/month_rebate_title.png";
						imager = "assets/main/lobby/sp/game_spread/month_rebate_all.png";
					}
					break;
				case "btn_year":
					{
						imaget = "assets/main/lobby/sp/game_spread/year_rebate_title.png";
						imager = "assets/main/lobby/sp/game_spread/year_rebate_all.png";
						posX1 = 0;
						posX2 = 220;
						posX3 = 440;
					}
					break;
			}
			title.setImage(imaget);
			rebateAll.setImage(imager);
			allNum.text = this.getAllNum(data);
			offline_user_name.pos(posX1, posY);
			offline_user_id.pos(posX2, posY);
			rebate.pos(posX3, posY);
		}
	});
	return RebateSummary;
});
gbx.define("game/lobby/lobbypop/game_share_history", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/player_profit_detail", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/net/net_tool", "comm/helper/playerdata_mgr", "comm/ui/top_message", "gbx/net/errorcode", "gbx/net/errorcode_des"], function (Sprite, Button, Text, Panel, BaseUI, PlayerProfit, uiUtils, uiLocallization, netTool, playerDataMgr, topMessage, ERROR_CODE, ERROR_CODE_DES) {
	var GameShareHistory = BaseUI.extend({
		init: function () {
			this._super();
			this._cacheData = null;
			this._nowTime = 0;
			this._year = "";
			this._month = "";
			this._day = "";
			this._dateStr = "";
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/share.png", "");
			title.pos(210, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var share_date_tip = uiUtils.createSimpleText(uiLocallization.share_date);
			share_date_tip.fontSize = 20;
			share_date_tip.pos(210, 66);
			this.addChild(share_date_tip);
			var input_bg = uiUtils.createSprite("assets/main/public/input_box.png");
			input_bg.pos(345, 58);
			input_bg.scaleX = .56;
			input_bg.scaleY = .9;
			this.addChild(input_bg);
			var dayDate = uiUtils.createSimpleText(this.date, "choosedate");
			dayDate.pos(355, 70);
			dayDate.fontSize = 20;
			this.addChild(dayDate);
			var choose_date_btn = uiUtils.createButton("assets/main/public/arrow.png", 1, "choose_date_btn");
			choose_date_btn.pos(355, 70);
			choose_date_btn.__node.skin = "";
			choose_date_btn.width = 120;
			choose_date_btn.height = 35;
			choose_date_btn.setClickHandler(this, this.OnClick);
			this.addChild(choose_date_btn);
			var left_arrow = uiUtils.createSprite("assets/main/public/arrow.png");
			left_arrow.rotation = 180;
			left_arrow.pos(340, 105);
			this.addChild(left_arrow);
			var right_arrow = uiUtils.createSprite("assets/main/public/arrow.png");
			right_arrow.pos(502, 58);
			this.addChild(right_arrow);
			var leftArrow = new Button;
			leftArrow.name = "leftArrow";
			leftArrow.pos(300, 58);
			leftArrow.size(60, 50);
			leftArrow.setClickHandler(this, this.OnClick);
			this.addChild(leftArrow);
			var rightArrow = new Button;
			rightArrow.name = "rightArrow";
			rightArrow.size(60, 50);
			rightArrow.pos(492, 58);
			rightArrow.setClickHandler(this, this.OnClick);
			this.addChild(rightArrow);
			var share_bg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/share_bg.png", "");
			share_bg.scaleY = 2.15;
			share_bg.pos(9, 101);
			this.addChild(share_bg);
			var nowscore = 1e3;
			var nowdayscore = uiUtils.createSimpleText(uiLocallization.nowday_get_score + nowscore, "nowscore");
			nowdayscore.pos(39, 109);
			nowdayscore.color = "#01BE12";
			nowdayscore.fontSize = 20;
			this.addChild(nowdayscore);
			var panel = uiUtils.createPanel(737, 690, "rootpanel");
			panel.pos(18, 134);
			this.addChild(panel);
			var playerProfit = new PlayerProfit;
			playerProfit.name = "playerProfit";
			playerProfit.visible = false;
			this.addChild(playerProfit);
			this.getTime(0);
		},
		getTime: function (n) {
			this._nowTime += 60 * 60 * 24 * n * 1e3;
			var date = new Date(this._nowTime);
			this._year = date.getFullYear();
			if (date.getMonth() < 9) this._month = "0" + (date.getMonth() + 1);
			else this._month = "" + (date.getMonth() + 1);
			if (date.getDate() < 9) this._day = "0" + date.getDate();
			else this._day = date.getDate();
			this.getChildByName("choosedate").text = this._year + "-" + this._month + "-" + this._day;
			this._dateStr = this._year + "-" + this._month + "-" + this._day;
		},
		OnClick: function (btn, data) {
			if (btn.name == "btn_close") this.visible = false;
			if (btn.name == "leftArrow") {
				this.getTime(-1);
				this.getOneDay();
			} else if (btn.name == "rightArrow") {
				this.getTime(1);
				this.getOneDay();
			} else if (btn.name == "choose_date_btn") { } else if (btn.name == "btn_input_url") {
				this._queryOnePlayer(data);
			}
		},
		getOneDay: function (data) {
			var shareUI = this;
			var sendMsg = gtea.protobuf.encode("RBaccaratQueryReq", {
				playerId: playerDataMgr.getMyUID(),
				date: this._dateStr,
				token: "Moxian009"
			});
			netTool.createHttpRequest(netTool.getPathByKey("rBaccaratQueryUrl"), sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryResp", data);
				if (msgData.result == ERROR_CODE.OK) {
					shareUI.setData(msgData.info);
				} else topMessage.post("errorCode" + msgData.result + ERROR_CODE_DES[msgData.result]);
			});
		},
		_queryOnePlayer: function (data) {
			this.getChildByName("playerProfit").visible = true;
			var sendMsg = gtea.protobuf.encode("RBaccaratQueryDetailReq", {
				token: "Moxian009",
				childId: data.playerId,
				date: this._dateStr
			});
			netTool.createHttpRequest(netTool.getPathByKey("rBaccaratQueryDetailUrl"), sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryDetailResp", data);
				if (msgData.result == ERROR_CODE.OK) {
					this.getChildByName("playerProfit").setPlayer(msgData.info);
					this.getChildByName("playerProfit").visible = true;
				} else topMessage.post(ERROR_CODE_DES[msgData.result]);
			});
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 65 * index;
			var inputBg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/record_bg_1.png", "");
			inputBg.pos(0, 0 + posY);
			root.addChild(inputBg);
			var playerId = uiUtils.createSimpleText(uiLocallization.player_id + data.playerId, "player_id");
			playerId.pos(8, 16 + posY);
			playerId.color = "#EDD7A9";
			root.addChild(playerId);
			var provide_share = uiUtils.createSimpleText(uiLocallization.provide_share + uiUtils.getFloatByPower(data.amount, 3), "provide_share");
			provide_share.pos(195, 16 + posY);
			provide_share.color = "#EDD7A9";
			root.addChild(provide_share);
			var inputBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_input_url");
			inputBtn.pos(360, 5 + posY);
			inputBtn.scale(.9);
			var sp = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail.png");
			sp.pos(50, 10);
			sp.scale(1.2);
			inputBtn.addChild(sp);
			inputBtn.setClickHandler(this, this.OnClick, data);
			root.addChild(inputBtn);
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data, time) {
			this._cacheData = data;
			if (time) this._nowTime = time;
			this.getTime(0);
			this.putData(data);
			var getall = 0;
			for (var i = 0; i < data.length; i++) {
				getall += data[i].amount;
			}
			this.getChildByName("nowscore").text = uiLocallization.nowday_get_score + uiUtils.getFloatByPower(getall, 3);
		}
	});
	return GameShareHistory;
});
gbx.define("game/lobby/lobbypop/game_spread", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/game_share_history", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/net/net_tool", "gbx/bridge", "comm/ui/top_message", "gbx/net/errorcode_des", "game/lobby/lobbypop/game_svip", "game/lobby/lobbypop/game_svipapply", "game/lobby/lobbypop/game_svip_privilege", "gbx/render/ui/image", "game/lobby/lobbypop/game_offline_user", "game/lobby/lobbypop/game_rebate_summary", "comm/ui/connect_loading"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, ShareHisrory, confMgr, playerDataMgr, uiUtils, uiLocallization, netTool, bridge, topMessage, ERROR_CODE_DES, GameSVIP, GameSVIPApply, GameSVIPPrivilege, Image, QueryOfflineUser, RebateSummary, loadingUI) {
	var btnPX = 450;
	var GameSpread = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/spread_title.png", "");
			title.pos(264.5, 20);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var upbg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/bg_up.png");
			upbg.pos(13.5, 100);
			this.addChild(upbg);
			var word_get_share = uiUtils.createSprite("assets/main/lobby/sp/game_spread/receive.png");
			word_get_share.pos(32, 148);
			this.addChild(word_get_share);
			var getMoney = uiUtils.createSimpleText("1000", "money");
			getMoney.pos(180, 152);
			getMoney.fontSize = 25;
			getMoney.color = "#FEC600";
			this.addChild(getMoney);
			var btn_get = uiUtils.createButton("assets/main/public/button.png", 2, "btn_get");
			btn_get.pos(btnPX, 129);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_get.png");
			word.pos(50, 21.5);
			btn_get.addChild(word);
			btn_get.setClickHandler(this, this._onClick);
			this.addChild(btn_get);
			var cc = new Image("assets/main/lobby/sp/game_spread/record_bg.png");
			cc.pos(13.5, 260);
			cc.width = 612;
			cc.height = 435;
			cc.sizeGrid = "10,10,10,10";
			this.addChild(cc);
			var telling = uiUtils.createSimpleText(uiLocallization.input_spread_code_telling);
			telling.pos(32, 270);
			telling.wordWrap = true;
			telling.width = 576;
			telling.align = "left";
			telling.color = "#F3E5C2";
			telling.fontSize = 20;
			this.addChild(telling);
			var lastScoreTip = uiUtils.createSprite("assets/main/lobby/sp/game_spread/yesterday_rebate.png");
			lastScoreTip.pos(32, 370);
			this.addChild(lastScoreTip);
			var lastscore = "100";
			var lastdayShare = uiUtils.createSimpleText(lastscore, "lastdayShare");
			lastdayShare.pos(180, 377);
			lastdayShare.fontSize = 22;
			lastdayShare.color = "#FEC600";
			this.addChild(lastdayShare);
			var monthScoreTip = uiUtils.createSprite("assets/main/lobby/sp/game_spread/month_rebate.png");
			monthScoreTip.pos(32, 491);
			this.addChild(monthScoreTip);
			var score = "100";
			var monthShare = uiUtils.createSimpleText(score, "monthShare");
			monthShare.pos(322, 498);
			monthShare.fontSize = 22;
			monthShare.color = "#FEC600";
			this.addChild(monthShare);
			var yearScoreTip = uiUtils.createSprite("assets/main/lobby/sp/game_spread/year_rebate.png");
			yearScoreTip.pos(32, 612);
			this.addChild(yearScoreTip);
			var score = "100";
			var yearShare = uiUtils.createSimpleText(score, "yearShare");
			yearShare.pos(322, 619);
			yearShare.fontSize = 22;
			yearShare.color = "#FEC600";
			this.addChild(yearShare);
			var btn_last = uiUtils.createButton("assets/main/public/button.png", 2, "btn_last");
			btn_last.pos(btnPX, 350);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png");
			word.pos(55, 21.5);
			btn_last.addChild(word);
			btn_last.setClickHandler(this, this._onClick);
			this.addChild(btn_last);
			var btn_month = uiUtils.createButton("assets/main/public/button.png", 2, "btn_month");
			btn_month.pos(btnPX, 470);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png");
			word.pos(55, 21.5);
			btn_month.addChild(word);
			btn_month.setClickHandler(this, this._onClick);
			this.addChild(btn_month);
			var btn_year = uiUtils.createButton("assets/main/public/button.png", 2, "btn_year");
			btn_year.pos(btnPX, 590);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png");
			word.pos(55, 21.5);
			btn_year.addChild(word);
			btn_year.setClickHandler(this, this._onClick);
			this.addChild(btn_year);
			var tipUrl = uiUtils.createSimpleText(uiLocallization.game_spread_url, "");
			tipUrl.pos(32, 735);
			tipUrl.fontSize = 22;
			this.addChild(tipUrl);
			this.url = netTool.getPathByKey("rBaccaratExUrl") + "?token=" + playerDataMgr.getMyUID();
			var url = uiUtils.createSimpleText(this.url.substring(0, 30) + "...", "url");
			url.pos(32, 765);
			url.fontSize = 18;
			url.alpha = .8;
			this.addChild(url);
			//document.getElementById("myShareUrl").textContent = this.url;
			var btn_copy = uiUtils.createButton("assets/main/public/button.png", 2, "btn_copy");
			btn_copy.pos(btnPX, 721);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_copy.png");
			word.pos(55, 21.5);
			btn_copy.addChild(word);
			btn_copy.setClickHandler(this, this._onClick);
			this.addChild(btn_copy);
			var queryDesc = uiUtils.createSimpleText(uiLocallization.query_offline_user, "queryDesc");
			queryDesc.pos(32, 858.5);
			queryDesc.fontSize = 22;
			this.addChild(queryDesc);
			var btn_query = uiUtils.createButton("assets/main/public/button.png", 2, "btn_query");
			btn_query.pos(btnPX, 831);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/vip_query.png");
			word.pos(55, 21.5);
			btn_query.addChild(word);
			btn_query.setClickHandler(this, this._onClick);
			this.addChild(btn_query);
			var vipDesc = uiUtils.createSimpleText(uiLocallization.vip_agent, "vipDesc");
			vipDesc.pos(32, 968.5);
			vipDesc.fontSize = 22;
			this.addChild(vipDesc);
			var btn_vip = uiUtils.createButton("assets/main/public/button.png", 2, "btn_vip");
			btn_vip.pos(btnPX, 941);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_detail2.png", "btn_vip_world");
			word.pos(55, 21.5);
			btn_vip.addChild(word);
			btn_vip.setClickHandler(this, this._onClick);
			this.addChild(btn_vip);
			var shareHisrory = new ShareHisrory;
			shareHisrory.name = "shareHisrory";
			shareHisrory.pos(46.5, 100);
			shareHisrory.visible = false;
			this.addChild(shareHisrory);
			var gameSvip = new GameSVIP;
			gameSvip.name = "gameSvip";
			gameSvip.pos(0, 0);
			gameSvip.visible = false;
			this.addChild(gameSvip);
			var gameSvipApply = new GameSVIPApply;
			gameSvipApply.name = "gameSvipApply";
			gameSvipApply.pos(0, 0);
			gameSvipApply.visible = false;
			this.addChild(gameSvipApply);
			var gameSVIPPrivilege = new GameSVIPPrivilege;
			gameSVIPPrivilege.name = "gameSVIPPrivilege";
			gameSVIPPrivilege.pos(0, 0);
			gameSVIPPrivilege.visible = false;
			this.addChild(gameSVIPPrivilege);
			var queryOfflineUser = new QueryOfflineUser;
			queryOfflineUser.name = "queryOfflineUser";
			queryOfflineUser.pos(0, 0);
			queryOfflineUser.visible = false;
			this.addChild(queryOfflineUser);
			var rebateSummary = new RebateSummary;
			rebateSummary.name = "rebateSummary";
			rebateSummary.pos(0, 0);
			rebateSummary.visible = false;
			this.addChild(rebateSummary);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_copy") {
				if (bridge.getPlatform() === "iOS") {
					bridge.clipboardCopy(this.url);
					topMessage.post(uiLocallization.copyOK);
				} else {
					var item = document.getElementById("confirm_copy");
					item.style.display = "block";
					item.style.width = window.innerHeight / 2.5 + "px";
					item.style.left = (window.innerWidth - window.innerHeight / 2.5) / 2 + "px";
					window.lobbyisLock = true;
					this.timerOnce(10, this, function () {
						Laya.stage.renderingEnabled = false;
					});
				}
			} else if (btn.name == "btn_get") {
				this._getReward();
			} else if (btn.name == "btn_last") {
				this._openRebateSummary("btn_last");
			} else if (btn.name == "btn_month") {
				this._openRebateSummary("btn_month");
			} else if (btn.name == "btn_year") {
				this._openRebateSummary("btn_year");
			} else if (btn.name == "btn_query") {
				this._openOfflineUser();
			} else if (btn.name == "btn_vip") {
				var svipLv = this._spreadData.svipLevel;
				switch (svipLv) {
					case 0:
						{
							if (this._spreadData.svip1Check) {
								this.getChildByName("gameSvipApply").setData();
								this.getChildByName("gameSvipApply").visible = true;
							} else {
								this.getChildByName("gameSvip").setData(this._spreadData);
								this.getChildByName("gameSvip").visible = true;
							}
						}
						break;
					case 1:
					case 2:
						{
							var superAgent = svipLv == 2 ? true : false;
							this.getChildByName("gameSVIPPrivilege").setData(superAgent, this._spreadData);
							this.getChildByName("gameSVIPPrivilege").visible = true;
						}
						break;
				}
			}
		},
		_openRebateSummary: function (btnName) {
			var myDate = new Date;
			myDate.setDate(myDate.getDate() - 1);
			var date = myDate.toLocaleDateString();
			date = date.replace(/\//g, "-");
			var sendMsg = "";
			switch (btnName) {
				case "btn_last":
					{
						sendMsg = gtea.protobuf.encode("RBaccaratQueryReq", {
							playerId: playerDataMgr.getMyUID(),
							date: date,
							token: "Moxian009"
						});
					}
					break;
				case "btn_month":
					{
						sendMsg = gtea.protobuf.encode("RBaccaratQueryReq", {
							playerId: playerDataMgr.getMyUID(),
							date: date,
							token: "Moxian009",
							curMonth: true
						});
					}
					break;
				case "btn_year":
					{
						sendMsg = gtea.protobuf.encode("RBaccaratQueryReq", {
							playerId: playerDataMgr.getMyUID(),
							date: date,
							token: "Moxian009",
							curYear: true
						});
					}
					break;
			}
			loadingUI.show();
			var rebateSummary = this.getChildByName("rebateSummary");
			var url = netTool.getPathByKey("rBaccaratQueryUrl");
			netTool.createHttpRequest(url, sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryResp", data);
				loadingUI.hide();
				if (msgData.result == ERROR_CODE.OK) {
					rebateSummary.setData(btnName, msgData.info);
					rebateSummary.visible = true;
				} else topMessage.post(ERROR_CODE_DES[msgData.result]);
			});
		},
		_openOfflineUser: function () {
			var sendMsg = gtea.protobuf.encode("RBaccaratQueryRSChildrenReq", {
				playerId: playerDataMgr.getMyUID(),
				token: "Moxian009"
			});
			loadingUI.show();
			var url = netTool.getPathByKey("rBaccaratQueryRSChildrenUrl");
			netTool.createHttpRequest(url, sendMsg, this, function (data) {
				var msgData = gtea.protobuf.decode("RBaccaratQueryRSChildrenResp", data);
				loadingUI.hide();
				if (msgData.result == ERROR_CODE.OK) {
					this.getChildByName("queryOfflineUser").setData(msgData.children);
					this.getChildByName("queryOfflineUser").visible = true;
				} else topMessage.post(ERROR_CODE_DES[msgData.result]);
			});
		},
		setData: function (data) {
			this._spreadData = data;
			this.getChildByName("money").text = uiUtils.getFloatByPower(data.award, 2);
			this.getChildByName("lastdayShare").text = uiUtils.getFloatByPower(data.yesterdayAmount, 2);
			this.getChildByName("monthShare").text = uiUtils.getFloatByPower(data.monthAmount, 2);
			this.getChildByName("yearShare").text = uiUtils.getFloatByPower(data.yearAmount, 2);
			var svipLv = this._spreadData.svipLevel;
			var showAgent = svipLv == 3 ? false : true;
			this.getChildByName("vipDesc").visible = showAgent;
			this.getChildByName("btn_vip").visible = showAgent;
			var vipDesc = uiLocallization.vip_agent;
			if (svipLv == 1) vipDesc = uiLocallization.vip_agent_normal;
			if (svipLv == 2) vipDesc = uiLocallization.vip_agent_super;
			this.getChildByName("vipDesc").text = vipDesc;
			var imageResouse = svipLv == 0 ? "assets/main/lobby/sp/game_spread/word_detail2.png" : "assets/main/lobby/sp/game_spread/vip_give.png";
			this.getChildByName("btn_vip").getChildByName("btn_vip_world").setImage(imageResouse);
		},
		_getReward: function () {
			var num = this.getChildByName("money").text;
			var number = parseFloat(num);
			if (number < .1) {
				topMessage.post(ERROR_CODE_DES[1117]);
				return;
			}
			var sendMsg = gtea.protobuf.encode("RBaccaratGetAwardReq", {});
			server.requestToGame(CMD.RBaccaratGetAward, sendMsg, this, function (errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					var retData = gtea.protobuf.decode("RBaccaratGetAwardResp", data);
					playerDataMgr.dealItemProto(retData.award);
					if (retData.award.DType == confMgr.definition.D_TYPE.BACCARAT_GOLD) {
						this.getChildByName("money").text = "0";
						this.publish("lobby.game.updateMyInfo");
					}
				}
			});
		}
	});
	return GameSpread;
});
gbx.define("game/lobby/lobbypop/game_svip", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization) {
	var GameSVIP = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_title.png", "");
			title.pos(264.5, 20);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var agent1 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/nor_agent.png");
			agent1.pos(40, 100);
			this.addChild(agent1);
			var agentdesc1 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc1, "");
			agentdesc1.pos(40, 145);
			agentdesc1.color = "#F8DFA7";
			agentdesc1.fontSize = 22;
			this.addChild(agentdesc1);
			var agent2 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_welfare.png");
			agent2.pos(40, 250);
			this.addChild(agent2);
			var agentdesc21 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc21, "");
			agentdesc21.pos(40, 295);
			agentdesc21.color = "#F8DFA7";
			agentdesc21.fontSize = 22;
			this.addChild(agentdesc21);
			var agentdesc22 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc22, "");
			agentdesc22.pos(40, 330);
			agentdesc22.color = "#F8DFA7";
			agentdesc22.fontSize = 22;
			this.addChild(agentdesc22);
			var agent3 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/super_agent.png");
			agent3.pos(40, 430);
			this.addChild(agent3);
			var agentdesc3 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc3, "");
			agentdesc3.pos(40, 475);
			agentdesc3.color = "#F8DFA7";
			agentdesc3.fontSize = 22;
			this.addChild(agentdesc3);
			var agent4 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/super_agent_welfare.png");
			agent4.pos(40, 580);
			this.addChild(agent4);
			var agentdesc41 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc41, "");
			agentdesc41.pos(40, 625);
			agentdesc41.color = "#F8DFA7";
			agentdesc41.fontSize = 22;
			this.addChild(agentdesc41);
			var agentdesc42 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc42, "");
			agentdesc42.pos(40, 660);
			agentdesc42.color = "#F8DFA7";
			agentdesc42.fontSize = 22;
			this.addChild(agentdesc42);
			var agentdesc43 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc43, "");
			agentdesc43.pos(40, 695);
			agentdesc43.color = "#F8DFA7";
			agentdesc43.fontSize = 22;
			this.addChild(agentdesc43);
			var upbg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/bg_up.png");
			upbg.pos(13.5, 790);
			this.addChild(upbg);
			var rechargeNum = uiUtils.createSprite("assets/main/lobby/sp/game_spread/recharge_num.png");
			rechargeNum.pos(40, 815);
			this.addChild(rechargeNum);
			var rechargeNumText = uiUtils.createSimpleText(0, "rechargeNumText");
			rechargeNumText.pos(281, 820);
			rechargeNumText.color = "#FEC600";
			rechargeNumText.fontSize = 25;
			this.addChild(rechargeNumText);
			var offline = uiUtils.createSprite("assets/main/lobby/sp/game_spread/offline_num.png");
			offline.pos(40, 865);
			this.addChild(offline);
			var offlineNum = uiUtils.createSimpleText("0", "offlineNum");
			offlineNum.pos(225, 870);
			offlineNum.fontSize = 25;
			offlineNum.color = "#FEC600";
			this.addChild(offlineNum);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		setData: function (data) {
			this.getChildByName("rechargeNumText").text = uiUtils.getFloatByPower(data.rechargeSum, 3);
			this.getChildByName("offlineNum").text = data.childrenNum;
		}
	});
	return GameSVIP;
});
gbx.define("game/lobby/lobbypop/game_svipapply", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/account_mgr", "comm/ui/top_message", "gbx/net/errorcode_des", "game/lobby/parts/country_code"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, accountMgr, topMessage, ERROR_CODE_DES, countryCode) {
	var GameSVIPApply = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_title.png", "");
			title.pos(264.5, 20);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var desc = uiUtils.createSimpleText(uiLocallization.vip_agent_apply_desc, "");
			desc.pos(40, 130);
			desc.wordWrap = true;
			desc.width = 560;
			desc.align = "left";
			desc.color = "#F8DFA7";
			desc.fontSize = 25;
			this.addChild(desc);
			var agent2 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_welfare.png");
			agent2.pos(40, 250);
			this.addChild(agent2);
			var agentdesc21 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc21, "");
			agentdesc21.pos(40, 295);
			agentdesc21.color = "#F8DFA7";
			agentdesc21.fontSize = 22;
			this.addChild(agentdesc21);
			var agentdesc22 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc22, "");
			agentdesc22.pos(40, 330);
			agentdesc22.color = "#F8DFA7";
			agentdesc22.fontSize = 22;
			this.addChild(agentdesc22);
			var agent3 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/be_careful.png");
			agent3.pos(40, 430);
			this.addChild(agent3);
			var agentdesc3 = uiUtils.createSimpleText(uiLocallization.vip_agent_apply_desc2, "");
			agentdesc3.pos(40, 475);
			agentdesc3.wordWrap = true;
			agentdesc3.width = 560;
			agentdesc3.align = "left";
			agentdesc3.color = "#F8DFA7";
			agentdesc3.fontSize = 22;
			this.addChild(agentdesc3);
			var upbg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/record_bg_1.png");
			upbg.pos(13.5, 580);
			this.addChild(upbg);
			var apply = uiUtils.createButton("assets/main/public/button.png", 2, "btn_apply");
			apply.pos(450, 616.5);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/vip_apply.png");
			word.pos(23.5, 21.5);
			apply.addChild(word);
			apply.setClickHandler(this, this._onClick);
			this.addChild(apply);
			var bg = uiUtils.createSprite("assets/main/public/input_box.png");
			bg.pos(155, 605);
			this.addChild(bg);
			var tipCountry = uiUtils.createSimpleText(uiLocallization.country);
			tipCountry.pos(40, 620);
			tipCountry.color = "#DFF5F3";
			tipCountry.fontSize = 22;
			this.addChild(tipCountry);
			var countryLab = uiUtils.createSimpleText(uiLocallization.china, "country");
			countryLab.pos(170, 620);
			countryLab.color = "#DFF5F3";
			countryLab.fontSize = 21;
			this.addChild(countryLab);
			var arrow = uiUtils.createSprite("assets/main/public/arrow_2.png");
			arrow.pos(380, 620);
			this.addChild(arrow);
			var choose_country_btn = new Button;
			choose_country_btn.size(255, 50);
			choose_country_btn.pos(165, 605);
			choose_country_btn.name = "choose_country_btn";
			choose_country_btn.setClickHandler(this, this._onClick);
			this.addChild(choose_country_btn);
			var tipPhone = uiUtils.createSimpleText("+86", "tipPhone");
			tipPhone.color = "#DFF5F3";
			tipPhone.fontSize = 22;
			tipPhone.pos(60, 670);
			this.addChild(tipPhone);
			var bg = uiUtils.createSprite("assets/main/public/input_box.png");
			bg.pos(155, 660);
			this.addChild(bg);
			var input = uiUtils.createTextInput("input_phone", uiLocallization.vip_agent_apply_phone);
			input.size(255, 50);
			input.fontSize = 20;
			input.pos(165, 660);
			input.restrict = "0-9";
			this.addChild(input);
			var countryPanel = new Sprite;
			countryPanel.name = "countryPanel";
			countryPanel.pos(161, 653);
			countryPanel.visible = false;
			countryPanel.graphics.drawRect(0, 0, 262, 190, "#25221C", 1);
			this.addChild(countryPanel);
			var maskBtn_1 = uiUtils.createMask(this, true);
			maskBtn_1.pos(-1500, -1500);
			maskBtn_1.name = "maskBtn_1";
			maskBtn_1.setClickHandler(this, this._onClick);
			countryPanel.addChild(maskBtn_1);
			var listCountry = uiUtils.createNormalList(1, 10, 0, "v", 250, 190, 250, 45);
			listCountry.array = countryCode.getCountryCode();
			listCountry.name = "listCountry";
			listCountry.setRenderHandler(this, this._renderCountryCode);
			countryPanel.addChild(listCountry);
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_apply") {
				this._svipApply();
			} else if (btn.name == "choose_country_btn") {
				this.getChildByName("countryPanel").visible = true;
			} else if (btn.name == "maskBtn_1") {
				this.getChildByName("countryPanel").visible = false;
			}
		},
		_svipApply: function () {
			var phoneNum = this.getChildByName("input_phone").text;
			if (isNaN(phoneNum) || phoneNum == "") {
				topMessage.post(uiLocallization.vip_agent_apply_phone);
				return;
			}
			var tip = this.getChildByName("tipPhone").text;
			tip = tip.replace("+", "");
			var tipPhoneNum = tip + phoneNum;
			var sendMsg = gtea.protobuf.encode("BaccaratSVIPApplyReq", {
				account: accountMgr.getUserData().account,
				phoneNumber: tipPhoneNum
			});
			server.requestToGame(CMD.BaccaratSVIPApply, sendMsg, this, function (errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					topMessage.post(uiLocallization.vip_agent_apply_send);
				} else {
					topMessage.post(ERROR_CODE_DES[errorcode]);
				}
			});
		},
		_renderCountryCode: function (cell, idx) {
			var data = this.getChildByName("countryPanel", "listCountry").array;
			if (idx >= data.length) return;
			var root = cell.getChildByName("root");
			if (!root) {
				var root = new Sprite;
				root.name = "root";
				cell.addChild(root);
				var str = data[idx];
				var arr = str.split(",");
				var lab = uiUtils.createSimpleText(arr[0]);
				lab.pos(0, 10);
				lab.color = "#ffffff";
				lab.fontSize = 27;
				root.addChild(lab);

				function selectOne(btn, param) {
					this.getChildByName("tipPhone").text = "+" + param[1];
					this.getChildByName("countryPanel").visible = false;
					this.getChildByName("country").text = param[0];
				}
				var btn = new Button;
				btn.size(250, 45);
				btn.pos(0, 0);
				btn.setClickHandler(this, selectOne, arr);
				root.addChild(btn);
			}
		},
		setData: function () {
			this.getChildByName("tipPhone").text = "+" + 86;
			this.getChildByName("countryPanel").visible = false;
			this.getChildByName("country").text = uiLocallization.china;
			this.getChildByName("input_phone").text = "";
		}
	});
	return GameSVIPApply;
});
gbx.define("game/lobby/lobbypop/game_svip_privilege", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/render/ui/image", "comm/ui/top_message"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, confMgr, playerDataMgr, uiUtils, uiLocallization, Image, topMessage) {
	var GameSVIPPrivilege = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/Full_screenBackGround.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_title.png", "");
			title.pos(264.5, 20);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(18, 13);
			closeBtn.width = 65;
			closeBtn.height = 65;
			closeBtn.setClickHandler(this, this._onClick);
			this.addChild(closeBtn);
			var agent1 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_lv.png");
			agent1.pos(40, 100);
			this.addChild(agent1);
			var agentLv = uiUtils.createSimpleText(uiLocallization.vip_agent_normal, "agentLv");
			agentLv.pos(200, 105);
			agentLv.color = "#F8DFA7";
			agentLv.fontSize = 25;
			this.addChild(agentLv);
			var agent_require = uiUtils.createSimpleText(uiLocallization.vip_agent_super_require, "agent_require");
			agent_require.pos(40, 145);
			agent_require.color = "#F8DFA7";
			agent_require.fontSize = 22;
			this.addChild(agent_require);
			var agent2 = uiUtils.createSprite("assets/main/lobby/sp/game_spread/agent_welfare.png");
			agent2.pos(40, 230);
			agent2.name = "agent_welfare";
			this.addChild(agent2);
			var agentdesc21 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc21, "welfare_desc");
			agentdesc21.pos(40, 275);
			agentdesc21.color = "#F8DFA7";
			agentdesc21.fontSize = 22;
			this.addChild(agentdesc21);
			var agentdesc22 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc22, "");
			agentdesc22.pos(40, 310);
			agentdesc22.color = "#F8DFA7";
			agentdesc22.fontSize = 22;
			this.addChild(agentdesc22);
			var agentdesc23 = uiUtils.createSimpleText(uiLocallization.vip_agent_desc43, "welfare_super_desc");
			agentdesc23.pos(40, 345);
			agentdesc23.color = "#F8DFA7";
			agentdesc23.fontSize = 22;
			this.addChild(agentdesc23);
			var goldNum = uiUtils.createSimpleText(uiLocallization.carryOnGold, "goldNum");
			goldNum.pos(360, 410);
			goldNum.color = "#F8DFA7";
			goldNum.fontSize = 22;
			this.addChild(goldNum);
			var cc = new Image("assets/main/lobby/sp/game_spread/input.png");
			cc.pos(40, 450);
			cc.width = 240;
			cc.height = 80;
			cc.sizeGrid = "10,5,5,5";
			this.addChild(cc);
			var input = uiUtils.createTextInput("input_ID", uiLocallization.vip_agent_query);
			input.size(240, 80);
			input.fontSize = 22;
			input.pos(40, 450);
			input.restrict = "0-9";
			input.align = "center";
			this.addChild(input);
			var cc = new Image("assets/main/lobby/sp/game_spread/input.png");
			cc.pos(360, 450);
			cc.width = 240;
			cc.height = 80;
			cc.sizeGrid = "10,5,5,5";
			this.addChild(cc);
			var input = uiUtils.createTextInput("input_give", uiLocallization.vip_agent_give);
			input.size(240, 80);
			input.fontSize = 22;
			input.pos(360, 450);
			input.restrict = "0-9";
			input.align = "center";
			input.on("input", this, this.vipAgentFeeNum);
			this.addChild(input);
			var agentdesc3 = uiUtils.createSimpleText(uiLocallization.vip_agent_fee, "vipAgentFee");
			agentdesc3.pos(0, 530);
			agentdesc3.color = "#ff3030";
			agentdesc3.fontSize = 22;
			agentdesc3.width = 640;
			agentdesc3.wordWrap = true;
			agentdesc3.align = "center";
			this.addChild(agentdesc3);
			var btn_query = uiUtils.createButton("assets/main/public/button.png", 2, "btn_query");
			btn_query.pos(76, 560);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/vip_query.png");
			word.pos(55, 21.5);
			btn_query.addChild(word);
			btn_query.setClickHandler(this, this._onClick);
			this.addChild(btn_query);
			var btn_give = uiUtils.createButton("assets/main/public/button_3.png", 2, "btn_give");
			btn_give.pos(396, 560);
			var word = uiUtils.createSprite("assets/main/lobby/sp/game_spread/vip_give.png");
			word.pos(55, 21.5);
			btn_give.addChild(word);
			btn_give.setClickHandler(this, this._onClick);
			this.addChild(btn_give);
			var upbg = uiUtils.createSprite("assets/main/lobby/sp/game_spread/record_bg_1.png");
			upbg.pos(13.5, 660);
			this.addChild(upbg);
			var split = uiUtils.createSprite("assets/main/public/splitLine_1.png");
			split.pos(0, 735);
			this.addChild(split);
			var userID = uiUtils.createSprite("assets/main/lobby/sp/game_spread/user_id.png");
			userID.pos(40, 677.5);
			this.addChild(userID);
			var userID = uiUtils.createSimpleText("", "userID");
			userID.pos(320, 681);
			userID.color = "#F8DFA7";
			userID.fontSize = 25;
			this.addChild(userID);
			var offline = uiUtils.createSprite("assets/main/lobby/sp/game_spread/user_name.png");
			offline.pos(40, 752.5);
			this.addChild(offline);
			var userName = uiUtils.createSimpleText("", "userName");
			userName.pos(320, 756);
			userName.fontSize = 25;
			userName.color = "#F8DFA7";
			this.addChild(userName);
			var agentdesc3 = uiUtils.createSimpleText(uiLocallization.vip_agent_remarks, "vipAgentRemarks");
			agentdesc3.pos(40, 880);
			agentdesc3.wordWrap = true;
			agentdesc3.width = 560;
			agentdesc3.align = "left";
			agentdesc3.color = "#ff3030";
			agentdesc3.fontSize = 22;
			this.addChild(agentdesc3);
			this.setcurGold();
			this.subscribe("lobby.game.updateMyInfo", this, this.setcurGold);
		},
		vipAgentFeeNum: function () {
			var text = this.getChildByName("input_give").text;
			var vipAgentFee = this.getChildByName("vipAgentFee");
			var number = uiUtils.getFloatByPower(parseInt(text) * this._feeRate / 1e3, 2);
			if (text == null || text == "") vipAgentFee.visible = false;
			else vipAgentFee.visible = true;
			var fee = uiLocallization.vip_agent_fee;
			fee = fee.replace("X", text);
			fee = fee.replace("Y", number);
			fee = fee.replace("Z", parseInt(text) + number);
			vipAgentFee.text = fee;
		},
		fixCardNumer: function () {
			var text = this.getChildByName("input_give").text;
			var number = parseInt(text);
			if (number < 100) {
				this.getChildByName("input_give").text = 100;
			} else {
				if (number % 100 != 0) {
					this.getChildByName("input_give").text = number - number % 100;
				}
			}
			this.vipAgentFeeNum();
		},
		_onClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_query") {
				if (this.queryIdTip()) return;
				this._queryUser();
			} else if (btn.name == "btn_give") {
				if (this.queryIdTip()) return;
				if (this.giveChipTip()) {
					return;
				}
				this._giveUserChip();
			}
		},
		_giveUserChip: function () {
			var id = this.getChildByName("input_ID").text;
			var giveNum = this.getChildByName("input_give").text;
			var sendMsg = gtea.protobuf.encode("BaccaratPresentReq", {
				playerIdTo: id,
				amount: parseInt(giveNum)
			});
			server.requestToGame(CMD.BaccaratPresent, sendMsg, this, function (errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					topMessage.post(uiLocallization.vip_agent_give_success);
					this.getChildByName("input_give").text = "";
					this.vipAgentFeeNum();
				} else {
					topMessage.post(ERROR_CODE_DES[errorcode]);
				}
			});
		},
		_queryUser: function () {
			var id = this.getChildByName("input_ID").text;
			var sendMsg = gtea.protobuf.encode("QueryPlayerNameReq", {
				playerId: id
			});
			server.requestToGame(CMD.QueryPlayerName, sendMsg, this, function (errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					var ret = gtea.protobuf.decode("QueryPlayerNameResp", data);
					this.getChildByName("userID").text = id;
					this.getChildByName("userName").text = ret.nickName;
				} else {
					topMessage.post(ERROR_CODE_DES[errorcode]);
				}
			});
		},
		giveChipTip: function () {
			var giveNum = this.getChildByName("input_give").text;
			if (giveNum < 100 || giveNum % 100 != 0) {
				topMessage.post(uiLocallization.vip_agent_give_tip);
				return true;
			}
			if (giveNum > playerDataMgr.getMyCarryGold()) {
				topMessage.post(uiLocallization.chip_not_enough);
				return true;
			}
			return false;
		},
		queryIdTip: function () {
			var id = this.getChildByName("input_ID").text;
			if (isNaN(id) || id == "") {
				topMessage.post(uiLocallization.query_id_null);
				return true;
			}
			return false;
		},
		setcurGold: function () {
			var carryGold = playerDataMgr.getMyCarryGold();
			if (carryGold <= 0) carryGold = 0;
			carryGold = uiUtils.getFloatByPower(carryGold, 2);
			this.getChildByName("goldNum").text = uiLocallization.carryOnGold + carryGold;
		},
		setData: function (super_agent, data) {
			var agentLv = this.getChildByName("agentLv");
			var agent_require = this.getChildByName("agent_require");
			var agent_welfare = this.getChildByName("agent_welfare");
			var welfare_desc = this.getChildByName("welfare_desc");
			var welfare_super_desc = this.getChildByName("welfare_super_desc");
			if (super_agent) {
				agentLv.text = uiLocallization.vip_agent_super;
				agent_require.text = "";
				agent_welfare.setImage("assets/main/lobby/sp/game_spread/super_agent_welfare.png");
				welfare_desc.text = uiLocallization.vip_agent_desc41;
				welfare_super_desc.text = uiLocallization.vip_agent_desc43;
			} else {
				agentLv.text = uiLocallization.vip_agent_normal;
				var require = uiUtils.getFloatByPower(data.svip2RechargeSum - data.rechargeSum, 2);
				agent_require.text = uiLocallization.vip_agent_super_require + require;
				agent_welfare.setImage("assets/main/lobby/sp/game_spread/agent_welfare.png");
				welfare_desc.text = uiLocallization.vip_agent_desc21;
				welfare_super_desc.text = "";
			}
			this._feeRate = data.feeRate;
			var remarks = uiLocallization.vip_agent_remarks;
			remarks = remarks.replace("X", data.feeRate * 100 / 1e3);
			this.getChildByName("vipAgentRemarks").text = remarks;
			var userID = this.getChildByName("userID");
			userID.text = "";
			var userName = this.getChildByName("userName");
			userName.text = "";
			var id = this.getChildByName("input_ID");
			id.text = "";
			var giveNum = this.getChildByName("input_give");
			giveNum.text = "";
			this.vipAgentFeeNum();
		}
	});
	return GameSVIPPrivilege;
});
gbx.define("game/lobby/lobbypop/income_expend_detail", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization) {
	var IncomeExpend = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var sp_title = uiUtils.createSprite("assets/main/bank/word_title_detail.png");
			sp_title.pos(210, 15);
			this.addChild(sp_title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var Names = [uiLocallization.gamble_time, uiLocallization.gamble_operate, uiLocallization.gamble_money];
			for (var i = 0; i < Names.length; i++) {
				var text = uiUtils.createSimpleText(Names[i], "");
				text.pos(20 + 225 * i, 63);
				text.color = "#E0F0EF";
				text.fontSize = 22;
				this.addChild(text);
			}
			var panel = uiUtils.createPanel(613, 8 * 90, "rootpanel");
			panel.pos(12, 95);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 90 * index;
			var bg = uiUtils.createSprite("assets/main/public/back_booter_02.png", "");
			bg.pos(0, 0 + posY);
			root.addChild(bg);
			var rdata = data;
			var newDate = new Date;
			newDate.setTime(rdata.date);
			var time = newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate() + "\n" + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
			var timelab = uiUtils.createSimpleText(time, "time");
			timelab.pos(8, 25 + posY);
			timelab.color = "#F7E4B9";
			timelab.align = "center";
			timelab.stroke = 1;
			timelab.strokeColor = "#000000";
			timelab.width = 10;
			timelab.multiline = true;
			root.addChild(timelab);
			var str = "";
			var count = "";
			if (rdata.type === 1) {
				str = uiLocallization.encharge_cash;
				count = "+" + uiUtils.getFloatByPower(rdata.cash, 3);
			} else if (rdata.type === 2) {
				str = uiLocallization.draw_cash;
				count = "-" + uiUtils.getFloatByPower(rdata.cash, 3);
			} else if (rdata.type === 3) {
				str = uiLocallization.present_cash + rdata.otherInfo;
				count = "-" + uiUtils.getFloatByPower(rdata.cash, 3);
			} else if (rdata.type === 4) {
				str = rdata.otherInfo + uiLocallization.bepresented_cash;
				count = "+" + uiUtils.getFloatByPower(rdata.cash, 3);
			}
			var operate = uiUtils.createSimpleText(str, "operateType");
			operate.pos(153, 32 + posY);
			operate.color = "#F7E4B9";
			operate.align = "center";
			root.addChild(operate);
			var money = uiUtils.createSimpleText(count, "money");
			money.pos(375, 32 + posY);
			money.align = "center";
			money.color = "#F7E4B9";
			root.addChild(money);
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data) {
			this.putData(data);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		}
	});
	return IncomeExpend;
});
gbx.define("game/lobby/lobbypop/input_spread_code", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization) {
	var InputCode = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = new Sprite;
			background.setImage("assets/main/public/background.png");
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var tip = uiUtils.createSimpleText(uiLocallization.input_spread_code_tip);
			tip.pos(36, 60);
			this.addChild(tip);
			var input_box = uiUtils.createSprite("assets/main/public/input_box.png", "");
			input_box.scaleX = 1;
			input_box.pos(122, 161);
			this.addChild(input_box);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var code = uiUtils.createTextInput("inputCode", uiLocallization.input_spread_code);
			code.size(200, 50);
			code.pos(125, 162);
			this.addChild(code);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var wordSure = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			wordSure.pos(62, 16);
			surebtn.addChild(wordSure);
			surebtn.pos(167, 196);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_sure") {
				this.visible = false;
			}
		}
	});
	return InputCode;
});
gbx.define("game/lobby/lobbypop/mail_info", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/hubs", "comm/ui/top_message"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, playerDataMgr, uiUtils, uiLocallization, hubs, topMessage) {
	var MailPanel = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			this.Data = null;
			var background = uiUtils.createSprite("assets/main/public/background.png");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/mail/word_mail.png", "");
			title.pos(220, 8);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var bg = uiUtils.createSprite("assets/main/lobby/sp/panel1.png", "");
			bg.pos(38, 53);
			bg.scaleX = 7;
			bg.scaleY = 2.62;
			bg.alpha = .8;
			this.addChild(bg);
			var bg = uiUtils.createSprite("assets/main/lobby/sp/panel1.png", "");
			bg.pos(35, 53);
			bg.scaleX = 7;
			bg.scaleY = 2.62;
			bg.alpha = .8;
			this.addChild(bg);
			var bg_1 = uiUtils.createSprite("assets/main/lobby/sp/panel1.png", "");
			bg_1.pos(35, 224);
			bg_1.scaleX = 7;
			bg_1.scaleY = 1.3;
			bg_1.alpha = .8;
			this.addChild(bg_1);
			var sender = uiUtils.createSimpleText(uiLocallization.sender_player, "sender");
			sender.pos(47, 61);
			sender.color = "#D0E9E8";
			this.addChild(sender);
			var split = uiUtils.createSprite("assets/main/public/splitLine_1.png", "");
			split.pos(36, 91);
			split.scaleX = .5;
			this.addChild(split);
			var content = uiUtils.createSimpleText("     春晓   孟浩然 \n\n春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少？", "content");
			content.pos(81, 118);
			content.width = 250;
			content.color = "#F8DFAD";
			content.align = "left";
			content.multiline = true;
			content.wordWrap = true;
			this.addChild(content);
			var mailtime = uiUtils.createSimpleText("", "mailtime");
			mailtime.color = "#E7DDC0";
			mailtime.pos(300, 180);
			this.addChild(mailtime);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "receive_btn");
			var word = uiUtils.createSprite("assets/main/lobby/sp/mail/word_get_award.png");
			word.name = "receiveDelete";
			word.pos(25, 10);
			surebtn.addChild(word);
			surebtn.pos(335, 245);
			surebtn.scale(.7, .7);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
			var chip = uiUtils.createSprite("assets/main/lobby/sp/mark_gold.png", "chip");
			chip.pos(80, 250);
			this.addChild(chip);
			var chipNum = uiUtils.createSimpleText("1", "chipNum");
			chipNum.pos(120, 255);
			this.addChild(chipNum);
		},
		setData: function (data) {
			this.Data = data;
			this.getChildByName("sender").text = uiLocallization.sender_player + data.from;
			this.getChildByName("content").text = data.content;
			var newDate = new Date;
			newDate.setTime(data.time * 1e3);
			var times = newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate() + " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
			this.getChildByName("mailtime").text = times;
			var chip = this.getChildByName("chip");
			var chipNum = this.getChildByName("chipNum");
			if (this.Data.attachment.length <= 0) {
				var receiveDelete = this.getChildByName("receive_btn").getChildByName("receiveDelete");
				receiveDelete.setImage("assets/main/lobby/sp/mail/delete.png");
				receiveDelete.pos(50, 12);
				chip.visible = false;
				chipNum.visible = false;
			} else {
				chip.visible = true;
				chipNum.visible = true;
				chipNum.text = data.attachment[0].itemCount;
			}
			var sendMsg = gtea.protobuf.encode("OpenMailReq", {
				mailId: data.mailId
			});
			server.requestToGame(CMD.OpenMail, sendMsg, this, function (errorcode, data) {
				var retData = gtea.protobuf.decode("OpenMailResp", data);
				this.publish("mailsettiing.refresh.maillist");
			});
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "receive_btn") {
				if (this.Data.attachment.length > 0) this.receiveOne();
				else this.deleteOne(this.Data.mailId);
			}
		},
		receiveOne: function () {
			var sendMsg = gtea.protobuf.encode("GetMailAwardReq", {
				mailId: this.Data.mailId
			});
			server.requestToGame(CMD.GetMailAward, sendMsg, this, function (errorcode, data) {
				if (errorcode == 0) {
					var retData = gtea.protobuf.decode("GetMailAwardResp", data);
					topMessage.post(uiLocallization.get_mail_reward);
					this.publish("mailsettiing.refresh.maillist");
					this.visible = false;
				} else gbx.log("外部已提示");
			});
		},
		deleteOne: function (mailId) {
			var sendMsg = gtea.protobuf.encode("DelMailReq", {
				mailId: mailId
			});
			server.requestToGame(CMD.DelMail, sendMsg, this, function (errorcode, data) {
				var retData = gtea.protobuf.decode("DelMailResp", data);
				this.publish("mailsettiing.refresh.maillist");
				this.visible = false;
			});
		}
	});
	return MailPanel;
});
gbx.define("game/lobby/lobbypop/mail_panel", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "game/lobby/lobbypop/mail_info", "comm/ui/ui_utils", "conf/ui_locallization", "gbx/hubs", "comm/ui/top_message", "comm/helper/playerdata_mgr"], function (server, CMD, ERROR_CODE, Sprite, Button, Text, Panel, BaseUI, MailInfo, uiUtils, uiLocallization, hubs, topMessage, playerDataMgr) {
	var MailPanel = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background_big.png");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/mail/word_mailbox.png", "");
			title.pos(240, 8);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var panel = uiUtils.createPanel(618, 284, "rootpanel");
			panel.pos(15, 66);
			this.addChild(panel);
			var splitLine = uiUtils.createSprite("assets/main/public/splitLine_2.png", "");
			splitLine.pos(45, 348);
			this.addChild(splitLine);
			var receive_all = uiUtils.createButton("assets/main/public/button_8.png", 2, "receive_all");
			var word = uiUtils.createSprite("assets/main/lobby/sp/mail/word_get_all.png");
			word.pos(30, 13);
			receive_all.addChild(word);
			receive_all.pos(366, 364);
			receive_all.setClickHandler(this, this.OnClick);
			this.addChild(receive_all);
			var mailInfo = new MailInfo;
			mailInfo.name = "mailInfo";
			mailInfo.pos(21, 35);
			mailInfo.visible = false;
			this.addChild(mailInfo);
			this.subscribe("mailsettiing.refresh.maillist", this, this.refresh);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 92 * index;
			var bg = uiUtils.createSprite("assets/main/public/back_booter_02.png", "");
			bg.pos(0, 0 + posY);
			root.addChild(bg);
			var icon = uiUtils.createSprite("assets/main/lobby/sp/mail/mail_icon.png", "");
			icon.pos(5, 5 + posY);
			root.addChild(icon);
			var mailType = uiUtils.createSimpleText(uiLocallization.mail_type_0, "");
			mailType.pos(103, 10 + posY);
			mailType.fontSize = 22;
			mailType.color = "#D8F2F1";
			mailType.stroke = 2;
			mailType.strokeColors = "#000000";
			root.addChild(mailType);
			if (data.title !== "unknown") {
				mailType.text = data.title;
			} else {
				mailType.text = uiLocallization.mail_type_0;
			}
			if (data.attachment.length > 0) {
				var awd = uiUtils.createSprite("assets/main/lobby/sp/mail/award.png", "awardPic");
				awd.pos(230, 5 + posY);
				root.addChild(awd);
			}
			var str = data.content;
			if (str.length > 8) str = str.substring(0, 8) + "...";
			var content = uiUtils.createSimpleText(str);
			content.pos(103, 41 + posY);
			content.fontSize = 21;
			content.color = "#FAF559";
			root.addChild(content);
			var time = Math.ceil(data.remainTime / (60 * 60 * 24));
			var day = uiLocallization.left_day;
			day = day.replace("X", time);
			var left = uiUtils.createSimpleText(day, "time");
			left.pos(322, 35 + posY);
			left.fontSize = 16;
			left.color = "#F7E0AC";
			left.stroke = 2;
			left.strokeColors = "#000000";
			root.addChild(left);
			var wd = uiUtils.createSprite("assets/main/lobby/sp/mail/word_no.png", "wd");
			wd.pos(410, 30 + posY);
			root.addChild(wd);
			var mark = uiUtils.createSprite("assets/main/lobby/sp/mail/new_mark.png", "mark");
			mark.pos(-1, -1 + posY);
			root.addChild(mark);
			var gettype = data.readFlag;
			var img;
			if (gettype == 0) {
				mark.visible = true;
				if (data.attachment.length > 0) img = "assets/main/lobby/sp/mail/word_no.png";
				else img = "assets/main/lobby/sp/mail/look_no.png";
			} else {
				mark.visible = false;
				if (data.attachment.length > 0) img = "assets/main/lobby/sp/mail/word_no.png";
				else img = "assets/main/lobby/sp/mail/look.png";
			}
			wd.setImage(img);

			function openMail(btn, data) {
				this.getChildByName("mailInfo").visible = true;
				this.getChildByName("mailInfo").setData(data);
			}
			var btn = new Button;
			btn.pos(10, 10 + posY);
			btn.size(586, 85);
			btn.setClickHandler(this, openMail, data);
			root.addChild(btn);
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data) {
			this.putData(data);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "receive_all") {
				this.openReceive();
			}
		},
		openReceive: function () {
			var sendMsg = gtea.protobuf.encode("GetAllMailAwardReq", {});
			server.requestToGame(CMD.GetAllMailAward, sendMsg, this, function (errorcode, data) {
				var retData = gtea.protobuf.decode("GetAllMailAwardResp", data);
				if (retData.mailIds.length <= 0) {
					topMessage.post(uiLocallization.get_mail_reward_no);
					return;
				}
				this.refresh();
				playerDataMgr.dealItemProto(retData.attachment);
				hubs.publish("global.playerdata.update.userdata");
				topMessage.post(uiLocallization.get_mail_reward);
			});
		},
		deleteAll: function (mailId) {
			var sendMsg = gtea.protobuf.encode("DelMailReq", {
				mailId: mailId
			});
			server.requestToGame(CMD.DelMail, sendMsg, this, function (errorcode, data) {
				var retData = gtea.protobuf.decode("DelMailResp", data);
			});
		},
		refresh: function () {
			var sendMsg = gtea.protobuf.encode("GetMailListReq", {});
			server.requestToGame(CMD.GetMailList, sendMsg, this, function (errorcode, data) {
				var retData = gtea.protobuf.decode("GetMailListResp", data);
				this.setData(retData.mailData);
			});
		}
	});
	return MailPanel;
});
gbx.define("game/lobby/lobbypop/online_service", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization", "comm/helper/playerdata_mgr"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization, playerDataMgr) {
	var OnlineService = BaseUI.extend({
		init: function () {
			this._super();
			this._rootY = 0;
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var bg = uiUtils.createSprite("assets/main/public/background.png", "");
			bg.pos(0, 0);
			this.addChild(bg);
			uiUtils.createBackgroundCrash(this, bg);
			var title = uiUtils.createSprite("assets/main/lobby/sp/service/word_service_title.png", "");
			title.pos(195, 8);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(5, 5);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var serviceQQInfoList = playerDataMgr.getServiceQQInfoList();
			for (var i = 0; i < serviceQQInfoList.length; i++) {
				var y = 60 + i * 45;
				var icon = uiUtils.createSprite("assets/main/lobby/sp/service/service_icon.png", "");
				icon.pos(70, y);
				this.addChild(icon);
				var text = uiUtils.createSimpleText(uiLocallization.serviceQQ, "");
				text.pos(120, y + 5);
				text.fontSize = 20;
				text.color = "#ffffff";
				text.text = serviceQQInfoList[i].nickName + uiLocallization.serviceQQ + serviceQQInfoList[i].qq;
				this.addChild(text);
			}
			var text = uiUtils.createSimpleText(uiLocallization.servicedesc, "");
			text.pos(145, 240);
			text.color = "#FAD88E";
			text.stroke = 2;
			text.strokeColor = "#885712";
			text.fontSize = 22;
			this.addChild(text);
		},
		OnClick: function (btn) {
			this.visible = false;
		}
	});
	return OnlineService;
});
gbx.define("game/lobby/lobbypop/player_profit_detail", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "gbx/render/ui/panel", "comm/base/command_ui", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, Button, Text, Panel, BaseUI, uiUtils, uiLocallization) {
	var PlayerProfitDetail = BaseUI.extend({
		init: function () {
			this._super();
			this.playerData = null;
			var maskBtn = uiUtils.createMask(this, true);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/game_spread/word_share_detail.png", "");
			title.pos(210, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var WordsTop = [uiLocallization.gamble_time, uiLocallization.gamble_betAction, uiLocallization.gamble_share_money];
			var posX = [29, 209, 459];
			for (var index = 0; index < WordsTop.length; index++) {
				var lab = uiUtils.createSimpleText(WordsTop[index], "");
				lab.fontSize = 22;
				lab.color = "#E0F0EF";
				lab.pos(posX[index], 60);
				this.addChild(lab);
			}
			var panel = uiUtils.createPanel(750, 720, "rootpanel");
			panel.pos(10, 102);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 92 * index;
			var bg = uiUtils.createSprite("assets/main/public/back_booter_02.png", "");
			bg.pos(0, 0 + posY);
			root.addChild(bg);
			var newDate = new Date;
			newDate.setTime(data.time);
			var times = newDate.getFullYear() + "." + (newDate.getMonth() + 1) + "." + newDate.getDate() + "\n" + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
			var player_time = uiUtils.createSimpleText(times, "player_time");
			player_time.pos(8, 20 + posY);
			player_time.align = "center";
			player_time.color = "#E9E0C3";
			player_time.fontSize = 15;
			player_time.multiline = true;
			player_time.width = 20;
			root.addChild(player_time);
			var provide_betAmount = uiUtils.createSimpleText(data.betAmount, "provide_betAmount");
			provide_betAmount.pos(158, 26 + posY);
			provide_betAmount.align = "center";
			provide_betAmount.width = 200;
			root.addChild(provide_betAmount);
			var provide_rebate = uiUtils.createSimpleText(uiUtils.getFloatByPower(data.rebate, 3), "provide_rebate");
			provide_rebate.pos(370, 26 + posY);
			provide_rebate.align = "center";
			provide_rebate.width = 200;
			root.addChild(provide_rebate);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setPlayer: function (data) {
			this.playerData = data;
			this.putData(data);
		}
	});
	return PlayerProfitDetail;
});
gbx.define("game/lobby/lobbypop/rank_info", ["gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/ui/ui_utils"], function (Sprite, Button, Text, uiUtils) {
	var RankInfo = Sprite.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/backgroud_superbig.png", "");
			background.pos(0, 0);
			uiUtils.createBackgroundCrash(this, background);
			this.addChild(background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/rank/rank_title.png", "");
			title.pos(220, 10);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var panel = uiUtils.createPanel(620, 8 * 95, "rootpanel");
			panel.pos(13, 63);
			this.addChild(panel);
		},
		_putOne: function (data, index) {
			var root = this.getChildByName("rootpanel");
			var posY = 90 * index;
			var bg = uiUtils.createSprite("assets/main/public/item_bg.png", "num");
			bg.pos(0, posY);
			root.addChild(bg);
			if (index >= 0 && index < 3) {
				var sp = uiUtils.createSprite("assets/main/lobby/sp/rank/rank_00" + (index + 1) + ".png", "num");
				sp.pos(5, 5 + posY);
				root.addChild(sp);
			} else {
				var number = uiUtils.createSimpleText(index, "num");
				number.pos(35, 35 + posY);
				number.fontSize = 24;
				number.color = "#DFCAAB";
				root.addChild(number);
			}
			var head = uiUtils.createSprite("assets/main/head/userhead_" + data.playerIcon + ".png");
			head.pos(97, 10 + posY);
			head.scale(.86);
			root.addChild(head);
			var pName = data.playerName;
			var playerName = uiUtils.createSimpleText(pName, "playerName");
			playerName.color = "#E0F0EF";
			playerName.pos(174, 12 + posY);
			playerName.fontSize = 24;
			playerName.strokeColor = "#000000";
			root.addChild(playerName);
			var money = data.gold;
			var playerMoney = uiUtils.createSimpleText(money, "playerMoney");
			playerMoney.pos(174, 42 + posY);
			playerMoney.fontSize = 24;
			playerMoney.color = "#F9F846";
			playerMoney.strokeColor = "#000000";
			root.addChild(playerMoney);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			}
		},
		putData: function (data) {
			this.getChildByName("rootpanel").removeChildren();
			for (var i = 0; i < data.length; i++) {
				this._putOne(data[i], i);
			}
		},
		setData: function (data) {
			this.putData(data);
		}
	});
	return RankInfo;
});
gbx.define("game/lobby/lobbypop/system_setting", ["gbx/render/display/sprite", "comm/ui/sound_button", "comm/helper/playerdata_mgr", "gbx/net/messagecommand", "gbx/net/connector", "gbx/net/net_tool", "gbx/net/errorcode", "comm/ui/ui_utils", "comm/ui/top_message", "gbx/net/errorcode_des", "platform/platform_manager"], function (Sprite, Button, playerDataMgr, CMD, server, netTool, ERROR_CODE, uiUtils, topMessage, ERROR_CODE_DES, platformManager) {
	var SystemSetting = Sprite.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background_big.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/lobby/sp/syssetting/word_setting.png", "");
			title.pos(240, 8);
			this.addChild(title);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var paths = ["assets/main/public/account_safe_1.png", "assets/main/public/button_gambling_detail_1.png", "assets/main/public/button_help_1.png", "assets/main/public/button_rank.png", "assets/main/public/customer_service.png"];
			var btnNames = ["btn_safe", "btn_detail", "btn_help", "btn_rank", "btn_service"];
			if (platformManager.bExamine()) btnNames = ["btn_safe", "btn_detail", "btn_help"];
			for (var i = 0; i < btnNames.length; i++) {
				var x = 0;
				var y = 0;
				x = i % 4 * 130;
				y = Math.floor(i / 4) * 130;
				var btn = uiUtils.createButton(paths[i], 2, btnNames[i]);
				btn.stateNum = 2;
				btn.setClickHandler(this, this.OnClick);
				btn.pos(44 + x, 109 + y);
				this.addChild(btn);
			}
			this.playerData = playerDataMgr;
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_safe") {
				this.publish("lobby.setting.play.open_accoutSafe", false);
			} else if (btn.name == "btn_detail") {
				this._openDetail();
			} else if (btn.name == "btn_help") {
				this.publish("lobby.setting.play.open_gameHelp");
			} else if (btn.name == "btn_rank") {
				this.publish("lobby.setting.play.open_rank");
			} else if (btn.name == "btn_service") {
				this.publish("lobby.setting.play.open_service", false);
			}
		},
		_openDetail: function () {
			netTool.createHttpRequest("User/GetResultRecord", { uid: playerDataMgr.getMyUID(), token: playerDataMgr.origData.TokenId, page: 7, pagenum: 1 }, this, function () {

				/*required string playerId = 1;   
			    required bool isBanker = 2;
			    required float moneyBefore = 3;
			    required float moneyAfter = 4;
			    required float moneyDelta = 5;
			    required int32 moneyBanker = 6;
			    required int32 moneyFarmer = 7;
			    required int32 moneyDeuce = 8;
			    required int32 moneyBankerPair = 9;
			    required int32 moneyFarmerPair = 10;
			    required int32 winType = 11;
			    required bool bankerPair = 12;
			    required bool farmerPair = 13;
			    required int64 date = 14;
			    required int32 bankerNum = 15;
			    required int32 farmerNum = 16;*/

				this.publish("lobby.setting.play.open_gambling", retData.records);
			});
			//var sendData = gtea.protobuf.encode("BaccaratGetRoundRecordReq", {});
			//server.requestToGame(CMD.BaccaratGetRoundRecord, sendData, this, function(errorcode, data) {
			//	if (errorcode == ERROR_CODE.OK) {
			//		var retData = gtea.protobuf.decode("BaccaratGetRoundRecordResp", data);
			//		this.publish("lobby.setting.play.open_gambling", retData.records)
			//	} else {
			//		gbx.log("外部已提示")
			//	}
			//})
		}
	});
	return SystemSetting;
});
gbx.define("game/lobby/lobbypop/unlock_bank_card", ["gbx/hubs", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/net_tool", "gbx/render/display/sprite", "comm/ui/sound_button", "gbx/render/display/text", "comm/base/command_ui", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/ui/ui_utils", "conf/locallization", "conf/ui_locallization", "conf/platform"], function (hubs, server, CMD, ERROR_CODE, ERROR_CODE_DES, netTool, Sprite, Button, Text, BaseUI, playerDataMgr, accountMgr, uiUtils, Localization, uiLocallization, Platform) {
	var BindBankCard = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var closeBtn = uiUtils.createButton("assets/main/public/back_001.png", 2, "btn_close");
			closeBtn.pos(8, 8);
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var InputCardTip = uiUtils.createSimpleText(uiLocallization.system_tip);
			InputCardTip.pos(191, 5);
			InputCardTip.fontSize = 28;
			InputCardTip.color = "#E0F0EF";
			this.addChild(InputCardTip);
			var for_safe = uiUtils.createSimpleText(uiLocallization.for_safe);
			for_safe.pos(87, 95);
			for_safe.fontSize = 20;
			for_safe.color = "#E0F0EF";
			this.addChild(for_safe);
			var input_box_bg = uiUtils.createSprite("assets/main/public/input_box.png", "");
			input_box_bg.pos(83, 139);
			input_box_bg.scaleX = 1.2;
			this.addChild(input_box_bg);
			var InputCard = uiUtils.createTextInput("InputCard", uiLocallization.tip_input_pass_1);
			InputCard.width = 180;
			InputCard.height = 50;
			InputCard.pos(160, 140);
			InputCard.fontSize = 18;
			InputCard.type = "password";
			this.addChild(InputCard);
			var surebtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "btn_sure");
			var word = uiUtils.createSprite("assets/main/public/sureBtn.png", "");
			word.pos(62, 16);
			surebtn.addChild(word);
			surebtn.pos(162, 229);
			surebtn.setClickHandler(this, this.OnClick);
			this.addChild(surebtn);
		},
		OnClick: function (btn) {
			if (btn.name == "btn_close") {
				this.visible = false;
			} else if (btn.name == "btn_sure") {
				this.getSalt();
			}
		},
		getSalt: function () {
			var pass = this.getChildByName("InputCard").text;
			netTool.getSalt(this, function (ret) {
				if (ret.result == ERROR_CODE.OK) {
					var hashPass = hex_md5(hex_md5(pass + ret.staticSalt) + ret.randomSalt);
					this.unBindCard(hashPass);
				} else {
					uiUtils.showMesage(ERROR_CODE_DES[ret.result]);
				}
			}, null, this, null, function (param) {
				uiUtils.showMesage(param);
			});
		},
		unBindCard: function (hashPassword) {
			var account = accountMgr.getUserData().account;
			var hashPass = hashPassword;
			var sendData = gtea.protobuf.encode("UnbindCardNumberReq", {
				account: account,
				hashPassword: hashPass,
				platformId: Platform.platformId
			});
			server.requestToGame(CMD.UnbindCardNumber, sendData, this, function (errorcode, retData) {
				if (errorcode == ERROR_CODE.OK) {
					var msgData = gtea.protobuf.decode("UnbindCardNumberResp", retData);
					playerDataMgr.setBankCardNumber(null);
					uiUtils.showMesage(uiLocallization.unbind_card_ok);
					this.publish("game_baccarat.setting.updateMyCardInfo");
					this.visible = false;
				}
			});
		}
	});
	return BindBankCard;
});
gbx.define("game/lobby/net/msg_receiver", ["gbx/net/messagecommand", "gbx/net/errorcode"], function (CMD, ERROR_CODE) {
	var LobbyMsgReceiver = {};
	return LobbyMsgReceiver;
});
gbx.define("game/lobby/parts/country_code", [], function () {
	var CountryCode = {
		getCountryCode: function () {
			var array = ["中国,86", "阿尔巴尼亚,355", "阿尔及利亚,213", "阿富汗,93", "阿根廷,54", "阿拉伯联合酋长国,971", "阿曼,968", "阿塞拜疆,994", "阿森松,247", "埃及,20", "埃塞俄比亚,251", "爱尔兰,353", "爱沙尼亚,372", "安道尔共和国,376", "安哥拉,244", "安圭拉岛,1264", "安提瓜和巴布达,1268", "奥地利,43", "澳大利亚,61", "澳门,853", "巴巴多斯,1246", "巴布亚新几内亚,675", "巴哈马,1242", "巴基斯坦,92", "巴拉圭,595", "巴勒斯坦,970", "巴林,973", "巴拿马,507", "巴西,55", "白俄罗斯,375", "百慕大群岛,1441", "保加利亚,359", "贝宁,229", "比利时,32", "冰岛,354", "波多黎各,1787", "波兰,48", "玻利维亚,591", "伯利兹,501", "博茨瓦纳,267", "布基纳法索,226", "布隆迪,257", "朝鲜,850", "丹麦,45", "德国,49", "东萨摩亚(美),684", "多哥,228", "多米尼加共和国,1890", "俄罗斯,7", "厄瓜多尔,593", "法国,33", "法属玻利尼西亚,689", "法属圭亚那,594", "菲律宾,63", "斐济,679", "芬兰,358", "冈比亚,220", "刚果,242", "哥伦比亚,57", "哥斯达黎加,506", "格林纳达,1809", "格鲁吉亚,995", "古巴,53", "关岛,1671", "圭亚那,592", "哈萨克斯坦,327", "海地,509", "韩国,82", "荷兰,31", "荷属安的列斯,599", "洪都拉斯,504", "吉布提,253", "吉尔吉斯坦,331", "几内亚,224", "加拿大,1", "加纳,233", "加蓬,241", "柬埔寨,855", "捷克,420", "津巴布韦,263", "喀麦隆,237", "卡塔尔,974", "开曼群岛,1345", "科特迪瓦,225", "科特迪瓦共和国,225", "科威特,965", "肯尼亚,254", "库克群岛,682", "拉脱维亚,371", "莱索托,266", "老挝,856", "黎巴嫩,961", "立陶宛,370", "利比里亚,231", "利比亚,218", "列支敦士登,423", "留尼旺,262", "卢森堡,352", "罗马尼亚,40", "马达加斯加,261", "马尔代夫,960", "马耳他,356", "马拉维,265", "马来西亚,60", "马里,223", "马里亚那群岛,1670", "马提尼克,596", "毛里求斯,230", "美国,1", "蒙古,976", "蒙特塞拉特岛,1664", "孟加拉国,880", "秘鲁,51", "缅甸,95", "摩尔多瓦,373", "摩洛哥,212", "摩纳哥,377", "莫桑比克,258", "墨西哥,52", "纳米比亚,264", "南非,27", "南斯拉夫,381", "瑙鲁,674", "尼加拉瓜,505", "尼泊尔,977", "尼日尔,977", "尼日利亚,234", "挪威,47", "葡萄牙,351", "日本,81", "瑞典,46", "瑞士,41", "萨尔瓦多,503", "塞拉利昂,232", "塞内加尔,221", "塞浦路斯,357", "塞舌尔,248", "沙特阿拉伯,966", "圣多美和普林西比,239", "圣卢西亚,1758", "圣马力诺,378", "圣文森特岛,1784", "斯里兰卡,94", "斯洛伐克,421", "斯洛文尼亚,386", "斯威士兰,268", "苏丹,249", "苏里南,597", "所罗门群岛,677", "索马里,252", "塔吉克斯坦,992", "台湾省,886", "泰国,66", "坦桑尼亚,255", "汤加,676", "特立尼达和多巴哥,1809", "突尼斯,216", "土耳其,90", "土库曼斯坦,993", "危地马拉,502", "委内瑞拉,58", "文莱,673", "乌干达,256", "乌克兰,380", "乌拉圭,598", "乌兹别克斯坦,233", "希腊,30", "西班牙,34", "西萨摩亚,685", "香港特别行政区,852", "新加坡,65", "新西兰,64", "匈牙利,36", "叙利亚,963", "牙买加,1876", "亚美尼亚,374", "也门,967", "伊拉克,964", "伊朗,98", "以色列,972", "意大利,39", "印度,91", "印度尼西亚,62", "英国,44", "约旦,962", "越南,84", "赞比亚,260", "扎伊尔,243", "乍得,235", "直布罗陀,350", "智利,56", "中非共和国,236", "中国,86"];
			return array;
		}
	};
	return CountryCode;
});
gbx.define("game/lobby/parts/download", ["gbx/net/errorcode", "gbx/net/errorcode_des", "comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/list", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "conf/ui_locallization", "comm/ui/ui_utils", "gbx/net/net_tool"], function (ERROR_CODE, ERROR_CODE_DES, BaseUI, Sprite, Text, List, Button, confMgr, playerDataMgr, accountMgr, uiLocallization, uiUtils, netTool) {
	var DownloadForm = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, false, "assets/main/login/login_mask.png");
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/login/download.png", "title");
			title.pos(200, 12);
			this.addChild(title);
			var label = uiUtils.createSimpleText(uiLocallization.downloadDes);
			label.color = "#FAD88E";
			label.stroke = 2;
			label.strokeColor = "#885712";
			label.fontSize = 22;
			label.pos(75, 230);
			this.addChild(label);
			var downloadY = 150;
			var androidBtn = new Button;
			androidBtn.name = "androidBtn";
			androidBtn.stateNum = 2;
			androidBtn.setSkinImage("assets/main/login/android_btn.png");
			androidBtn.pivotToCenter();
			androidBtn.setClickHandler(this, this.onClickDownLoad);
			androidBtn.pos(138, downloadY);
			this.addChild(androidBtn);
			var iosBtn = new Button;
			iosBtn.name = "iosBtn";
			iosBtn.stateNum = 2;
			iosBtn.setSkinImage("assets/main/login/ios_btn.png");
			iosBtn.pivotToCenter();
			iosBtn.setClickHandler(this, this.onClickDownLoad);
			iosBtn.pos(368, downloadY);
			this.addChild(iosBtn);
		},
		onClickDownLoad: function (btn) {
			if (btn.name == "iosBtn") window.location.href = netTool.getPathByKey("iosDownloadUrl");
			else if (btn.name == "androidBtn") window.location.href = netTool.getPathByKey("androidDownloadUrl");
		}
	});
	return DownloadForm;
});
gbx.define("game/lobby/parts/find_password", ["gbx/net/errorcode", "gbx/net/errorcode_des", "comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/list", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "conf/ui_locallization", "comm/ui/ui_utils", "game/lobby/parts/country_code", "comm/ui/top_message", "gbx/net/net_tool", "conf/platform"], function (ERROR_CODE, ERROR_CODE_DES, BaseUI, Sprite, Text, List, Button, confMgr, playerDataMgr, accountMgr, uiLocallization, uiUtils, countryCode, topMessage, netTool, Platform) {
	var tipLeft = 78;
	var inputBoxX = 180;
	var inputX = 195;
	var FindPasswordForm = BaseUI.extend({
		init: function () {
			this._super();
			this._curView = "verifyCodeView";
			this._getVCLeftTime = 0;
			var maskBtn = uiUtils.createMask(this, false, "assets/main/login/login_mask.png");
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/login/regiser_bg.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/public/word_changePass.png", "title");
			title.pos(220, 12);
			this.addChild(title);
			var begin = 100;
			var height = 80;
			var deltaY = 45;
			var verifyCodeView = new Sprite;
			verifyCodeView.name = "verifyCodeView";
			this.addChild(verifyCodeView);
			for (var i = 0; i < 3; i++) {
				var shade_01 = uiUtils.createSprite("assets/main/public/input_box.png", "");
				shade_01.scaleY = .95;
				shade_01.scaleX = 1.05;
				shade_01.pos(inputBoxX, begin + i * height);
				verifyCodeView.addChild(shade_01);
			}
			var tipCountry = uiUtils.createSimpleText(uiLocallization.country);
			tipCountry.pos(tipLeft, begin + 0 * height + 10);
			tipCountry.color = "#DFF5F3";
			tipCountry.fontSize = 22;
			verifyCodeView.addChild(tipCountry);
			var countryLab = uiUtils.createSimpleText(uiLocallization.china, "country");
			countryLab.pos(inputX, begin + 0 * height + 15);
			countryLab.color = "#DFF5F3";
			countryLab.fontSize = 21;
			verifyCodeView.addChild(countryLab);
			var arrow = uiUtils.createSprite("assets/main/public/arrow_2.png");
			arrow.pos(420, begin + 0 * height + 15);
			verifyCodeView.addChild(arrow);
			var choose_country_btn = new Button;
			choose_country_btn.size(278, 60);
			choose_country_btn.pos(inputX, begin + 0 * height - 10);
			choose_country_btn.name = "choose_country_btn";
			choose_country_btn.setClickHandler(this, this.OnClick);
			verifyCodeView.addChild(choose_country_btn);
			var tipPhone = uiUtils.createSimpleText("+86", "tipPhone");
			tipPhone.color = "#DFF5F3";
			tipPhone.fontSize = 22;
			tipPhone.pos(tipLeft + 20, begin + 1 * height + 10);
			verifyCodeView.addChild(tipPhone);
			var phoneNumber = uiUtils.createTextInput("phoneNumber", uiLocallization.tip_input_phone_code);
			phoneNumber.pos(inputX, begin + 1 * height);
			phoneNumber.color = "#B5B435";
			phoneNumber.fontSize = 20;
			phoneNumber.size(250, 50);
			verifyCodeView.addChild(phoneNumber);
			var tipVerify = uiUtils.createSimpleText(uiLocallization.verify_code);
			tipVerify.color = "#DFF5F3";
			tipVerify.fontSize = 22;
			tipVerify.pos(tipLeft, begin + 2 * height + 10);
			verifyCodeView.addChild(tipVerify);
			var verifyCode = uiUtils.createTextInput("verifyCode", uiLocallization.tip_input_verify_code);
			verifyCode.color = "#B5B435";
			verifyCode.fontSize = 22;
			verifyCode.pos(inputX, begin + 2 * height);
			verifyCode.width = 200;
			verifyCode.height = 50;
			verifyCodeView.addChild(verifyCode);
			var getVerifyCodeBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "getVerifyCode");
			getVerifyCodeBtn.scale(.7);
			getVerifyCodeBtn.pos(345, begin + 2 * height + 4);
			getVerifyCodeBtn.setClickHandler(this, this.onClickGetVerifyCode);
			verifyCodeView.addChild(getVerifyCodeBtn);
			var word = uiUtils.createSprite("assets/main/login/get_verify_code.png");
			word.pos(20, 13);
			word.name = "word";
			getVerifyCodeBtn.addChild(word);
			var count = uiUtils.createSimpleText("", "count");
			count.pos(25, 10);
			count.fontSize = 25;
			getVerifyCodeBtn.addChild(count);
			var countryPanel = new Sprite;
			countryPanel.name = "countryPanel";
			countryPanel.pos(185, begin + 50);
			countryPanel.visible = false;
			countryPanel.graphics.drawRect(0, 0, 276, 190, "#25221C", 1);
			this.addChild(countryPanel);
			var maskBtn_1 = uiUtils.createMask(this, true);
			maskBtn_1.pos(-1500, -1500);
			maskBtn_1.name = "maskBtn_1";
			maskBtn_1.setClickHandler(this, this.OnClick);
			countryPanel.addChild(maskBtn_1);
			var listCountry = uiUtils.createNormalList(1, 10, 0, "v", 250, 190, 250, 45);
			listCountry.array = countryCode.getCountryCode();
			listCountry.name = "listCountry";
			listCountry.setRenderHandler(this, this._renderCountryCode);
			countryPanel.addChild(listCountry);
			var resetView = new Sprite;
			resetView.visible = false;
			resetView.name = "resetView";
			this.addChild(resetView);
			for (var i = 0; i < 2; i++) {
				var shade_02 = uiUtils.createSprite("assets/main/public/input_box.png", "");
				shade_02.scaleY = .95;
				shade_02.scaleX = 1.05;
				shade_02.pos(inputBoxX, begin + i * height + deltaY);
				resetView.addChild(shade_02);
			}
			var tipPass = uiUtils.createSimpleText(uiLocallization.pass);
			tipPass.color = "#DFF5F3";
			tipPass.fontSize = 22;
			tipPass.pos(tipLeft, begin + 0 * height + deltaY + 10);
			resetView.addChild(tipPass);
			var setPass = uiUtils.createTextInput("setPass", uiLocallization.setPass);
			setPass.type = "password";
			setPass.color = "#B5B435";
			setPass.fontSize = 22;
			setPass.pos(inputX, begin + 0 * height + deltaY);
			setPass.width = 250;
			setPass.height = 50;
			resetView.addChild(setPass);
			var tipNewPass = uiUtils.createSimpleText(uiLocallization.new_pass);
			tipNewPass.color = "#DFF5F3";
			tipNewPass.fontSize = 22;
			tipNewPass.pos(tipLeft, begin + 1 * height + deltaY + 10);
			resetView.addChild(tipNewPass);
			var newPass = uiUtils.createTextInput("repeatPass", uiLocallization.repeatInputPass);
			newPass.type = "password";
			newPass.color = "#B5B435";
			newPass.fontSize = 22;
			newPass.pos(inputX, begin + 1 * height + deltaY);
			newPass.size(250, 50);
			resetView.addChild(newPass);
			var sureBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "sure_btn");
			var word_sure = uiUtils.createSprite("assets/main/login/word_sure.png", "");
			word_sure.pos(55, 10);
			sureBtn.addChild(word_sure);
			sureBtn.pos(200, 350);
			sureBtn.scale(.9);
			sureBtn.setClickHandler(this, this.OnClick);
			this.addChild(sureBtn);
		},
		_renderCountryCode: function (cell, idx) {
			var data = this.getChildByName("countryPanel", "listCountry").array;
			if (idx >= data.length) return;
			var root = cell.getChildByName("root");
			if (!root) {
				var root = new Sprite;
				root.name = "root";
				cell.addChild(root);
				var str = data[idx];
				var arr = str.split(",");
				var lab = uiUtils.createSimpleText(arr[0]);
				lab.pos(0, 10);
				lab.color = "#DFF5F3";
				lab.fontSize = 20;
				root.addChild(lab);

				function selectOne(btn, param) {
					accountMgr.getUserData().country = param[1];
					this.getChildByName("verifyCodeView", "tipPhone").text = "+" + param[1];
					this.getChildByName("countryPanel").visible = false;
					this.getChildByName("verifyCodeView", "country").text = param[0];
				}
				var btn = new Button;
				btn.size(250, 45);
				btn.pos(0, 0);
				btn.setClickHandler(this, selectOne, arr);
				root.addChild(btn);
			}
		},
		_checkVerifyCode: function () {
			var phone = this.getChildByName("verifyCodeView", "phoneNumber").text;
			if (phone.length == 0) {
				topMessage.post(uiLocallization.phone_can_not_void);
				return false;
			}
			var verifyCode = this.getChildByName("verifyCodeView", "verifyCode").text;
			if (verifyCode.length == 0) {
				topMessage.post(uiLocallization.verify_code_can_not_void);
				return false;
			}
			return true;
		},
		_checkResetPassword: function () {
			var verifyCode = this.getChildByName("verifyCodeView", "verifyCode").text;
			if (verifyCode.length == 0) {
				topMessage.post(uiLocallization.verify_code_can_not_void);
				return false;
			}
			var pass = this.getChildByName("resetView", "setPass").text;
			if (pass.length == 0) {
				topMessage.post(uiLocallization.pass_can_not_void);
				return false;
			}
			if (pass.length < 6) {
				topMessage.post(uiLocallization.pass_less_six);
				return false;
			}
			var pass_1 = this.getChildByName("resetView", "repeatPass").text;
			if (pass_1.length == 0) {
				topMessage.post(uiLocallization.plz_input_pass);
				return false;
			}
			if (pass != pass_1) {
				topMessage.post(uiLocallization.pass_diffrent);
				return false;
			}
			if (this._getVCLeftTime <= 0) {
				topMessage.post(uiLocallization.time_no_use);
				return false;
			}
			return true;
		},
		reset: function () {
			this._getVCLeftTime = 0;
			this._toggleView("verifyCodeView");
			this.getChildByName("verifyCodeView", "phoneNumber").text = "";
			this.getChildByName("verifyCodeView", "tipPhone").text = "+86";
			this.getChildByName("verifyCodeView", "country").text = uiLocallization.china;
			this.getChildByName("resetView", "setPass").text = "";
			this.getChildByName("resetView", "setPass").text = "";
			this.getChildByName("resetView", "repeatPass").text = "";
			this.getChildByName("verifyCodeView", "verifyCode").text = "";
		},
		_getPhoneNumber: function () {
			var phone = this.getChildByName("verifyCodeView", "phoneNumber").text;
			return accountMgr.getUserData().country + phone;
		},
		_toggleView: function (viewName) {
			if (viewName === "verifyCodeView") {
				this.getChildByName("verifyCodeView").visible = true;
				this.getChildByName("resetView").visible = false;
				this._curView = viewName;
			} else if (viewName === "resetView") {
				this.getChildByName("verifyCodeView").visible = false;
				this.getChildByName("resetView").visible = true;
				this._curView = viewName;
			}
		},
		startVerifyCodeTick: function () {
			this._getVCLeftTime = 180;
			this.verifyCodeTick();
			this.timerLoop(1e3, this, this.verifyCodeTick);
		},
		stopVerifyCodeTick: function () {
			this._getVCLeftTime = 0;
			this.clearTimer(this, this.verifyCodeTick);
			var btn = this.getChildByName("verifyCodeView", "getVerifyCode");
			btn.gray = false;
			btn.getChildByName("word").visible = true;
			btn.getChildByName("count").text = "";
		},
		verifyCodeTick: function () {
			var btn = this.getChildByName("verifyCodeView", "getVerifyCode");
			if (this._getVCLeftTime > 0) {
				this._getVCLeftTime = this._getVCLeftTime - 1;
				btn.gray = true;
				btn.getChildByName("word").visible = false;
				btn.getChildByName("count").text = uiLocallization.time_count_down + this._getVCLeftTime;
			} else {
				this._getVCLeftTime = 0;
				btn.gray = false;
				btn.getChildByName("word").visible = false;
				btn.getChildByName("count").text = uiLocallization.resend;
			}
		},
		onClickGetVerifyCode: function () {
			if (this._getVCLeftTime > 0) return;
			var phone = this.getChildByName("verifyCodeView", "phoneNumber").text;
			if (phone.length == 0) {
				topMessage.post(uiLocallization.phone_can_not_void);
				return;
			}
			var phoneNumber = this._getPhoneNumber();

			function getSuccess(ret) {
				this.startVerifyCodeTick();
			}

			function getFail(status, error) {
				if (status != null) topMessage.post(Locallization.phoneVerifyError + " status " + status);
				else topMessage.post(ERROR_CODE_DES[error]);
			}
			netTool.getVerifyCode("register", this, getSuccess, getFail);
		},
		requestPassword: function () {
			var ret = this._checkResetPassword();
			if (!ret) return;
			this.stopVerifyCodeTick();
			var phoneNumber = this._getPhoneNumber();
			var verifyCode = this.getChildByName("verifyCodeView", "verifyCode").text;
			var pass = this.getChildByName("resetView", "setPass").text;
			var sendMsg = gtea.protobuf.encode("ResetPasswordByAuthCodeReq", {
				account: phoneNumber,
				platformId: Platform.platformId,
				smsAuthCode: verifyCode,
				newPassword: pass
			});
			netTool.createHttpRequest(netTool.getPathByKey("resetPasswordByAuthCodeUrl"), sendMsg, this, function (data) {
				var ret = gtea.protobuf.decode("ResetPasswordByAuthCodeResp", data);
				if (ret.result == ERROR_CODE.OK) {
					accountMgr.getUserData().password = pass;
					accountMgr.saveUserDataOnly();
					topMessage.post(uiLocallization.resetPassSuccess);
					this.reset();
					this.visible = false;
				} else {
					topMessage.post(ERROR_CODE_DES[ret.result]);
				}
			}, function (status) {
				topMessage.post(uiLocallization.resetPassFail + " status " + status);
			});
		},
		OnClick: function (btn) {
			if (btn.name == "sure_btn") {
				if (this._curView === "verifyCodeView") {
					var ret = this._checkVerifyCode();
					if (ret) this._toggleView("resetView");
				} else {
					this.requestPassword();
				}
			} else if (btn.name == "choose_country_btn") {
				this.getChildByName("countryPanel").visible = true;
			} else if (btn.name == "maskBtn_1") {
				this.getChildByName("countryPanel").visible = false;
			}
		}
	});
	return FindPasswordForm;
});
gbx.define("game/lobby/parts/password", ["gbx/net/errorcode", "gbx/net/errorcode_des", "comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/list", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "conf/ui_locallization", "comm/ui/ui_utils", "game/lobby/parts/country_code", "comm/ui/top_message"], function (ERROR_CODE, ERROR_CODE_DES, BaseUI, Sprite, Text, List, Button, confMgr, playerDataMgr, accountMgr, uiLocallization, uiUtils, countryCode, topMessage) {
	var tipLeft = 78;
	var inputBoxX = 180;
	var inputX = 195;
	var PasswordForm = BaseUI.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, false, "assets/main/login/login_mask.png");
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			var background = uiUtils.createSprite("assets/main/public/background.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/main/login/register.png", "title");
			title.pos(200, 12);
			this.addChild(title);
			var begin = 70;
			var height = 60;
			var deltaY = -10;
			for (var i = 0; i < 2; i++) {
				var shade = uiUtils.createSprite("assets/main/public/input_box.png", "");
				shade.scaleY = .95;
				shade.scaleX = 1.05;
				shade.pos(inputBoxX, begin + (i + 1) * height + deltaY);
				this.addChild(shade);
			}
			var label = uiUtils.createSimpleText(uiLocallization.login_account);
			label.color = "#FAD88E";
			label.stroke = 2;
			label.strokeColor = "#885712";
			label.fontSize = 22;
			label.pos(tipLeft, begin + 0 * height + deltaY + 10);
			this.addChild(label);
			var account = uiUtils.createSimpleText(uiLocallization.login_account);
			account.color = "#FAD88E";
			account.stroke = 2;
			account.strokeColor = "#885712";
			account.fontSize = 22;
			account.pos(inputX, begin + 0 * height + deltaY + 10);
			account.name = "account";
			this.addChild(account);
			label = uiUtils.createSimpleText(uiLocallization.pass);
			label.color = "#DFF5F3";
			label.fontSize = 22;
			label.pos(tipLeft, begin + 1 * height + deltaY + 10);
			this.addChild(label);
			var setPass = uiUtils.createTextInput("setPass", uiLocallization.setPass);
			setPass.type = "password";
			setPass.color = "#B5B435";
			setPass.fontSize = 22;
			setPass.pos(inputX, begin + 1 * height + deltaY);
			setPass.width = 250;
			setPass.height = 50;
			this.addChild(setPass);
			label = uiUtils.createSimpleText(uiLocallization.repeatPass);
			label.color = "#DFF5F3";
			label.fontSize = 22;
			label.pos(tipLeft, begin + 2 * height + deltaY + 10);
			this.addChild(label);
			var repeatPass = uiUtils.createTextInput("repeatPass", uiLocallization.repeatInputPass);
			repeatPass.type = "password";
			repeatPass.color = "#B5B435";
			repeatPass.fontSize = 22;
			repeatPass.pos(inputX, begin + 2 * height + deltaY);
			repeatPass.size(250, 50);
			this.addChild(repeatPass);
			var sureBtn = uiUtils.createButton("assets/main/public/button_8.png", 2, "sure_btn");
			var word_sure = uiUtils.createSprite("assets/main/login/word_sure.png", "");
			word_sure.pos(55, 10);
			sureBtn.addChild(word_sure);
			sureBtn.pos(180, 250);
			sureBtn.scale(.9);
			sureBtn.setClickHandler(this, this.onClickSure);
			this.addChild(sureBtn);
		},
		_checkPassword: function () {
			var pass = this.getChildByName("setPass").text;
			if (pass.length == 0) {
				topMessage.post(uiLocallization.pass_can_not_void);
				return false;
			}
			if (pass.length < 6) {
				topMessage.post(uiLocallization.pass_less_six);
				return false;
			}
			var pass_1 = this.getChildByName("repeatPass").text;
			if (pass_1.length == 0) {
				topMessage.post(uiLocallization.plz_input_pass);
				return false;
			}
			if (pass !== pass_1) {
				topMessage.post(uiLocallization.pass_diffrent);
				return false;
			}
			return true;
		},
		reset: function () {
			this.getChildByName("account").text = accountMgr.getUserData().account;
			this.getChildByName("setPass").text = "";
			this.getChildByName("repeatPass").text = "";
		},
		onClickSure: function () {
			var ret = this._checkPassword();
			if (!ret) return;
			var pass = this.getChildByName("setPass").text;
			this.parent.eventUserSign(pass);
		},
		registerCallback: function (success) {
			this.reset();
			if (success) this.visible = false;
		}
	});
	return PasswordForm;
});
gbx.define("game/lobby/parts/way_sheet", ["conf/system", "gbx/net/connector", "gbx/net/messagecommand", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "game/lobby/parts/way_sheet_body", "comm/helper/conf_mgr", "comm/helper/room_mgr", "conf/locallization", "conf/ui_locallization", "comm/helper/baccarat_algorithm", "comm/ui/ui_utils"], function (sys, server, CMD, Sprite, Text, Button, WaySheetBody, confMgr, roomMgr, Localization, uiLocallization, BaccaratAlgorithm, uiUtils) {
	var WaySheet = Sprite.extend({
		init: function (isVIPRoom) {
			this._super();
			this.size(277, 479);
			this._algorithm = new BaccaratAlgorithm;
			this._roomData;
			this._isVIPRoom = isVIPRoom;
			var waysheet_bg = new Sprite;
			waysheet_bg.setImage("assets/main/waysheet/ludan_l_1.png");
			waysheet_bg.pos(0, 0);
			waysheet_bg.zOrder = 3;
			this.addChild(waysheet_bg);
			var body = new WaySheetBody("lobby", this._algorithm);
			body.name = "waySheetBody";
			body.pos(0, 26);
			body.zOrder = 2;
			body.on(this.EVENT.MOUSE_UP, this, this.OnClick);
			this.addChild(body);
			var childX = 3;
			var scale = .8;
			var banker = uiUtils.createSimpleText(uiLocallization.banker, "banker");
			banker.fontSize = 16;
			banker.pos(615, 115 + 26);
			banker.color = "red";
			banker.bold = true;
			banker.zOrder = 4;
			this.addChild(banker);
			var bigEye = new Sprite;
			bigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
			bigEye.pos(childX, 24);
			bigEye.name = "bigEye";
			bigEye.scale(scale);
			banker.addChild(bigEye);
			var small = new Sprite;
			small.setImage("assets/main/waysheet/ludan_redCir2.png");
			small.pos(childX, 40);
			small.name = "small";
			small.scale(scale);
			banker.addChild(small);
			var yueU = new Sprite;
			yueU.setImage("assets/main/waysheet/ludan_redSqu.png");
			yueU.pos(childX, 56);
			yueU.name = "yueU";
			yueU.scale(scale);
			banker.addChild(yueU);
			var farmer = uiUtils.createSimpleText(uiLocallization.farmer, "farmer");
			farmer.fontSize = 16;
			farmer.pos(615, 185 + 26);
			farmer.color = "blue";
			farmer.bold = true;
			farmer.zOrder = 4;
			this.addChild(farmer);
			bigEye = new Sprite;
			bigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
			bigEye.pos(childX, 24);
			bigEye.name = "bigEye";
			bigEye.scale(scale);
			farmer.addChild(bigEye);
			small = new Sprite;
			small.setImage("assets/main/waysheet/ludan_blueCir2.png");
			small.pos(childX, 40);
			small.name = "small";
			small.scale(scale);
			farmer.addChild(small);
			yueU = new Sprite;
			yueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
			yueU.pos(childX, 56);
			yueU.name = "yueU";
			yueU.scale(scale);
			farmer.addChild(yueU);
			var lab_name = CreateUsualText("", "lab_Name");
			lab_name.pos(2, 3);
			lab_name.fontSize = 19;
			lab_name.zOrder = 4;
			lab_name.color = "#ffffff";
			this.addChild(lab_name);
			var lab_limit = CreateUsualText("", "lab_limit");
			lab_limit.color = "#ffffff";
			lab_limit.fontSize = 19;
			lab_limit.pos(425, 3);
			lab_limit.width = 200;
			lab_limit.align = "right";
			this.addChild(lab_limit);
			var l1 = createTotalCountText(0);
			l1.name = "";
			l1.text = uiLocallization.banker + ":";
			l1.color = "#ffffff";
			var l2 = createTotalCountText(1);
			l2.name = "";
			l2.text = uiLocallization.farmer + ":";
			l2.color = "#ffffff";
			var l3 = createTotalCountText(2);
			l3.name = "";
			l3.text = uiLocallization.duece + ":";
			l3.color = "#ffffff";
			var l4 = createTotalCountText(3);
			l4.name = "";
			l4.x += 90;
			l4.text = uiLocallization.on_play;
			l4.color = "#ffffff";
			var number1 = createTotalCountText(0);
			number1.text = "0";
			number1.x += 23;
			number1.color = "#a36f3e";
			var number2 = createTotalCountText(1);
			number2.text = "0";
			number2.x += 23;
			number2.color = "#a36f3e";
			var number3 = createTotalCountText(2);
			number3.text = "0";
			number3.x += 23;
			number3.color = "#a36f3e";
			var number4 = createTotalCountText(3);
			number4.name = "lab_all";
			number4.text = "0";
			number4.x += 130;
			number4.color = "#a36f3e";
			this.addChild(l1);
			this.addChild(l2);
			this.addChild(l3);
			this.addChild(l4);
			this.addChild(number1);
			this.addChild(number2);
			this.addChild(number3);
			this.addChild(number4);
			var button = new Button;
			button.setSkinImage("assets/main/public/button_13.png");
			var word = uiUtils.createSprite("assets/main/lobby/sp/word_in_room.png");
			word.pos(40, 10);
			button.addChild(word);
			button.pos(498, 279);
			button.stateNum = 1;
			button.zOrder = 4;
			button.name = "join";
			this.addChild(button);
			button.setClickHandler(this, this.OnClick);
			if (isVIPRoom) {
				var button_remove1 = new Button;
				button_remove1.setSkinImage("assets/main/waysheet/button_closeRoom_1.png");
				button_remove1.pos(590, 29);
				button_remove1.stateNum = 2;
				button_remove1.zOrder = 5;
				button_remove1.name = "remove1";
				button_remove1.visible = false;
				this.addChild(button_remove1);
				button_remove1.setClickHandler(this, this.OnClickRemove);
				var button_remove2 = new Button;
				button_remove2.setSkinImage("assets/main/waysheet/button_closeRoom_2.png");
				button_remove2.pos(524, 29);
				button_remove2.stateNum = 2;
				button_remove2.zOrder = 5;
				button_remove2.name = "remove2";
				button_remove2.visible = false;
				this.addChild(button_remove2);
				button_remove2.setClickHandler(this, this.OnClickRemove);
			}

			function createTotalCountText(idx) {
				var lbl = new Text;
				lbl.text = "0";
				lbl.width = 32;
				lbl.align = "center";
				lbl.color = "#B48B6C";
				lbl.fontSize = 20;
				lbl.pos(5 + idx * 68, 297);
				lbl.name = "total_" + idx;
				lbl.zOrder = 4;
				return lbl;
			}

			function CreateUsualText(content, name) {
				var lbl = new Text;
				lbl.text = content;
				lbl.name = name;
				lbl.fontSize = 17;
				lbl.align = "center";
				lbl.color = "#ffffff";
				lbl.strokeColor = "#000000";
				lbl.zOrder = 4;
				return lbl;
			}
		},
		setInfo: function (data) {
			this.getChildByName("total_0").text = data.banker;
			this.getChildByName("total_1").text = data.farmer;
			this.getChildByName("total_2").text = data.deuce;
		},
		setPredict: function (data, isClear) {
			var bankerBigEye = this.getChildByName("banker", "bigEye");
			var farmerBigEye = this.getChildByName("farmer", "bigEye");
			var bankerSmall = this.getChildByName("banker", "small");
			var farmerSmall = this.getChildByName("farmer", "small");
			var bankerYueU = this.getChildByName("banker", "yueU");
			var farmerYueU = this.getChildByName("farmer", "yueU");
			bankerBigEye.visible = false;
			farmerBigEye.visible = false;
			bankerSmall.visible = false;
			farmerSmall.visible = false;
			bankerYueU.visible = false;
			farmerYueU.visible = false;
			if (isClear) return;
			if (data.bigEyeRoad == 1) {
				bankerBigEye.visible = true;
				farmerBigEye.visible = true;
				bankerBigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
				farmerBigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
			} else if (data.bigEyeRoad == 0) {
				bankerBigEye.visible = true;
				farmerBigEye.visible = true;
				bankerBigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
				farmerBigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
			}
			if (data.smallRoad == 1) {
				bankerSmall.visible = true;
				farmerSmall.visible = true;
				bankerSmall.setImage("assets/main/waysheet/ludan_redCir2.png");
				farmerSmall.setImage("assets/main/waysheet/ludan_blueCir2.png");
			} else if (data.smallRoad == 0) {
				bankerSmall.visible = true;
				farmerSmall.visible = true;
				bankerSmall.setImage("assets/main/waysheet/ludan_blueCir2.png");
				farmerSmall.setImage("assets/main/waysheet/ludan_redCir2.png");
			}
			if (data.cockroach == 1) {
				bankerYueU.visible = true;
				farmerYueU.visible = true;
				bankerYueU.setImage("assets/main/waysheet/ludan_redSqu.png");
				farmerYueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
			} else if (data.cockroach == 0) {
				bankerYueU.visible = true;
				farmerYueU.visible = true;
				bankerYueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
				farmerYueU.setImage("assets/main/waysheet/ludan_redSqu.png");
			}
		},
		OnClick: function () {
			var ok = roomMgr.checkGetInTime();
			if (ok) {
				roomMgr.setChoose(this._roomData);
				roomMgr.joinRoom();
			}
		},
		OnClickRemove: function (btn) {
			if (btn.name === "remove1") {
				this.getChildByName("remove1").visible = false;
				this.getChildByName("remove2").visible = true;
			} else if (btn.name === "remove2") {
				var sendMsg = gtea.protobuf.encode("BaccaratDismissRoomReq", {
					roomId: this._roomData.roomId
				});
				server.requestToGame(CMD.BaccaratDismissRoom, sendMsg, this, function (errorcode, data) {
					if (errorcode == 0) {
						var retData = gtea.protobuf.decode("BaccaratDismissRoomResp", data);
						this.publish("lobby.lobbypop.refresh_vip_room", retData.roomId);
					}
				});
			}
		},
		setData: function (data) {
			if (data == undefined) return;
			this._roomData = data;
			if (data.playerNum != undefined) this.getChildByName("lab_all").text = data.playerNum;
			else this.getChildByName("lab_all").text = 0;
			var conf = data.roundResults;
			var array = this._algorithm.addAll(conf);
			this.getChildByName("waySheetBody").setWaySheet(array);
			this.setInfo(array[5]);
			this.setPredict(array[6], false);
			var roomName = "";
			var definition = confMgr.read("baccarat/dat/definition.json");
			switch (data.baccaratRoomType) {
				case definition.BaccaratRoomType.Dragon:
					roomName = Localization.BaccaratRoomType1;
					break;
				case definition.BaccaratRoomType.JingMi:
					roomName = Localization.BaccaratRoomType2;
					break;
			}
			this.getChildByName("lab_Name").text = roomName + data.roomId;
			this.getChildByName("lab_limit").text = Localization.LimitColor + data.bankerFarmerBetMin + "-" + data.allBankerFarmerBetMax;
		},
		updateVIPRemoveBtn: function () {
			if (this._isVIPRoom) {
				this.getChildByName("remove1").visible = true;
				this.getChildByName("remove2").visible = false;
			}
		}
	});
	return WaySheet;
});
gbx.define("game/lobby/parts/way_sheet_body", ["conf/system", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/room_mgr", "conf/locallization", "conf/ui_locallization", "comm/helper/baccarat_algorithm", "comm/ui/ui_utils"], function (sys, Sprite, Text, Button, confMgr, roomMgr, Localization, uiLocallization, BaccaratAlgorithm, uiUtils) {
	var WaySheetBody = Sprite.extend({
		init: function (comeFrom, algorithm) {
			this._super();
			this._comeFrom = comeFrom;
			this._algorithm = algorithm;
			this._colMaxPerBG = {
				bigRoad: 34,
				bigEyeRoad: 34,
				smallRoad: 34,
				yueURoad: 34,
				plateRoad: 13
			};
			var h = 0;
			this._wBigRoad = 646;
			this._hBigRoad = 115;
			var panelBigRoad = uiUtils.createPanel(640, this._hBigRoad, "bigRoad");
			panelBigRoad.pos(0, h);
			panelBigRoad.hScrollBarSkin = "";
			panelBigRoad.hScrollBar.isVertical = false;
			this.addChild(panelBigRoad);
			h += this._hBigRoad - 1;
			this._wPlateRoad = 338;
			this._hPlateRoad = 157;
			var panelPlateRoad = uiUtils.createPanel(319, this._hPlateRoad, "plateRoad");
			panelPlateRoad.pos(0, h);
			panelPlateRoad.hScrollBarSkin = "";
			panelPlateRoad.hScrollBar.isVertical = false;
			this.addChild(panelPlateRoad);
			this._wBigEye = 291;
			this._hBigEye = 53;
			var panelBigEye = uiUtils.createPanel(this._wBigEye, this._hBigEye, "bigEyeRoad");
			panelBigEye.pos(318, h);
			panelBigEye.hScrollBarSkin = "";
			panelBigEye.hScrollBar.isVertical = false;
			this.addChild(panelBigEye);
			h += this._hBigEye - 1;
			this._wSmallRoad = 291;
			this._hSmallRoad = 53;
			var panelSmallRoad = uiUtils.createPanel(this._wSmallRoad, this._hSmallRoad, "smallRoad");
			panelSmallRoad.pos(318, h);
			panelSmallRoad.hScrollBarSkin = "";
			panelSmallRoad.hScrollBar.isVertical = false;
			this.addChild(panelSmallRoad);
			h += this._hSmallRoad - 1;
			this._wYueYou = 291;
			this._hYueYou = 53;
			var panelYueYou = uiUtils.createPanel(this._wYueYou, this._hYueYou, "yueURoad");
			panelYueYou.pos(318, h);
			panelYueYou.hScrollBarSkin = "";
			panelYueYou.hScrollBar.isVertical = false;
			this.addChild(panelYueYou);
			this._addOneBgForAll();
		},
		_addBg: function (name, col, colMax) {
			if (col % colMax != 0) return;
			var index = col / colMax;
			var panel = this.getChildByName(name);
			if (panel != null && panel.getChildByName("bg" + index) != null) return;
			var bg = new Sprite;
			bg.name = "bg" + index;
			bg.zOrder = 1;
			switch (name) {
				case "bigRoad":
					bg.setImage("assets/main/waysheet/ludan_3.png");
					bg.pos(index * this._wBigRoad, 0);
					panel.addChild(bg);
					break;
				case "bigEyeRoad":
					bg.setImage("assets/main/waysheet/ludan_21.png");
					bg.pos(index * this._wBigEye, 0);
					panel.addChild(bg);
					break;
				case "smallRoad":
					bg.setImage("assets/main/waysheet/ludan_21.png");
					bg.pos(index * this._wSmallRoad, 0);
					panel.addChild(bg);
					break;
				case "yueURoad":
					bg.setImage("assets/main/waysheet/ludan_21.png");
					bg.pos(index * this._wYueYou, 0);
					panel.addChild(bg);
					break;
				case "plateRoad":
					bg.setImage("assets/main/waysheet/ludan_1.png");
					bg.pos(index * this._wPlateRoad, 0);
					panel.addChild(bg);
					break;
				default:
					break;
			}
		},
		_addOneBgForAll: function () {
			this._addBg("bigRoad", 0, 1);
			this._addBg("bigEyeRoad", 0, 1);
			this._addBg("smallRoad", 0, 1);
			this._addBg("yueURoad", 0, 1);
			this._addBg("plateRoad", 0, 1);
		},
		_putChild: function (parentName, path, col, row, cellSize, offset, scale) {
			var root = this.getChildByName(parentName);
			var cell = uiUtils.createSprite(path);
			root.addChild(cell);
			var offsetX = 0;
			var offsetY = 0;
			if (offset != null) {
				offsetX = offset[0];
				offsetY = offset[1];
			}
			if (scale > 0) cell.scale(scale);
			var x = col * cellSize + offsetX;
			var y = row * cellSize + offsetY;
			cell.pos(x, y);
			cell.zOrder = 2;
			return cell;
		},
		putBigRoad: function (alldata, isSingle) {
			var colMaxPerBG = this._colMaxPerBG.bigRoad;
			var cellSize = this._wBigRoad / colMaxPerBG;
			var elemArr = alldata;
			if (isSingle) {
				elemArr = [];
				elemArr.push(alldata);
			}
			for (var i = 0; i < elemArr.length; i++) {
				var rdata = elemArr[i];
				var path = "";
				if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_BANK) path = "assets/main/waysheet/ludan_small_6.png";
				else if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_FARM) path = "assets/main/waysheet/ludan_small_7.png";
				else if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) path = "assets/main/waysheet/ludan_small_5.png";
				var cell = this._putChild("bigRoad", path, rdata.showCol, rdata.showRow, cellSize, [1, 1], 0);
				if (rdata.baseElem.winType != confMgr.definition.WIN_STATE.WIN_DEUCE) {
					if (rdata.baseElem.bankerPair) {
						var p1 = new Sprite;
						p1.setImage("assets/main/waysheet/ludan_small_8.png");
						p1.pos(-2, -2);
						p1.name = "red";
						cell.addChild(p1);
					}
					if (rdata.baseElem.farmerPair) {
						var p2 = new Sprite;
						p2.setImage("assets/main/waysheet/ludan_small_9.png");
						p2.pos(8, 8);
						p2.name = "blue";
						cell.addChild(p2);
					}
				}
				this._addBg("bigRoad", rdata.showCol, colMaxPerBG);
			}
		},
		putBigEyeRoad: function (alldata, isSingle) {
			if (alldata == null) return;
			var colMaxPerBG = this._colMaxPerBG.bigEyeRoad;
			var cellSize = this._wBigEye / colMaxPerBG;
			var rdata = alldata;
			if (!isSingle) rdata = alldata[0];
			var path = "";
			if (rdata.isRed) path = "assets/main/waysheet/ludan_small_2.png";
			else path = "assets/main/waysheet/ludan_small_1.png";
			var offset = [1, 1];
			this._putChild("bigEyeRoad", path, rdata.showCol, rdata.showRow, cellSize, offset, 0);
			this._addBg("bigEyeRoad", rdata.showCol, colMaxPerBG);
		},
		putSmallRoad: function (alldata, isSingle) {
			if (alldata == null) return;
			var colMaxPerBG = this._colMaxPerBG.smallRoad;
			var cellSize = this._wSmallRoad / colMaxPerBG;
			var rdata = alldata;
			if (!isSingle) rdata = alldata[0];
			var path = "";
			if (rdata.isRed) path = "assets/main/waysheet/ludan_small_4.png";
			else path = "assets/main/waysheet/ludan_small_3.png";
			this._putChild("smallRoad", path, rdata.showCol, rdata.showRow, cellSize, [1, 1], 0);
			this._addBg("smallRoad", rdata.showCol, colMaxPerBG);
		},
		putYueURoad: function (alldata, isSingle) {
			if (alldata == null) return;
			var colMaxPerBG = this._colMaxPerBG.yueURoad;
			var cellSize = this._wYueYou / colMaxPerBG;
			var rdata = alldata;
			if (!isSingle) rdata = alldata[0];
			var path = "";
			if (rdata.isRed) path = "assets/main/waysheet/ludan_small_5_1.png";
			else path = "assets/main/waysheet/ludan_small_5_2.png";
			this._putChild("yueURoad", path, rdata.showCol, rdata.showRow, cellSize, [0, 0], 0);
			this._addBg("yueURoad", rdata.showCol, colMaxPerBG);
		},
		putPlateRoad: function (rdata, isSingle) {
			var colMaxPerBG = this._colMaxPerBG.plateRoad;
			var cellSize = this._wPlateRoad / colMaxPerBG;
			if (!isSingle) rdata = rdata[0];
			var path = "";
			if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_BANK) {
				path = "assets/main/waysheet/ludan_zhuang.png";
				if (myGlobalData.isLHD) {
					path = "assets/main/waysheet/ludan_zhuang_lhd.png";
				}
			}
			else if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_FARM) {
				path = "assets/main/waysheet/ludan_xian.png";
				if (myGlobalData.isLHD) {
					path = "assets/main/waysheet/ludan_xian_lhd.png";
				}
			}
			else if (rdata.baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) path = "assets/main/waysheet/ludan_he.png";
			var cell = this._putChild("plateRoad", path, rdata.showCol, rdata.showRow, cellSize, [1, 1], 0);
			if (rdata.baseElem.bankerPair) {
				var p1 = new Sprite;
				p1.setImage("assets/main/waysheet/ludan_small_8.png");
				p1.pos(-2, -2);
				cell.addChild(p1);
			}
			if (rdata.baseElem.farmerPair) {
				var p2 = new Sprite;
				p2.setImage("assets/main/waysheet/ludan_small_9.png");
				p2.pos(16, 16);
				cell.addChild(p2);
			}
			this._addBg("plateRoad", rdata.showCol, colMaxPerBG);
		},
		_scrollToOne: function (name, colMax) {
			var colMaxPerBG = this._colMaxPerBG[name];
			colMax -= colMaxPerBG;
			colMax += 5;
			var cellSize = 0;
			switch (name) {
				case "bigRoad":
					cellSize = this._wBigRoad / colMaxPerBG;
					break;
				case "bigEyeRoad":
					cellSize = this._wBigEye / colMaxPerBG;
					break;
				case "smallRoad":
					cellSize = this._wSmallRoad / colMaxPerBG;
					break;
				case "yueURoad":
					cellSize = this._wYueYou / colMaxPerBG;
					break;
				case "plateRoad":
					cellSize = this._wPlateRoad / colMaxPerBG;
					break;
				default:
					return;
			}
			var scrollX = cellSize * colMax;
			scrollX = scrollX < 0 ? 0 : scrollX;
			this.getChildByName(name).scrollTo(scrollX, 0);
		},
		_scrollTo: function () {
			var allColMax = this._algorithm.getAllColMax();
			this._scrollToOne("bigRoad", allColMax["bigRoad"]);
			this._scrollToOne("bigEyeRoad", allColMax["bigEyeRoad"]);
			this._scrollToOne("smallRoad", allColMax["smallRoad"]);
			this._scrollToOne("yueURoad", allColMax["yueURoad"]);
			this._scrollToOne("plateRoad", allColMax["plateRoad"]);
		},
		setWaySheet: function (array) {
			var tempArray;
			for (var i = 0; i < 5; i++) {
				tempArray = array[i];
				for (var col in tempArray) {
					var elemCol = tempArray[col];
					for (var row in elemCol) {
						var elemArr = elemCol[row];
						switch (i) {
							case 0:
								this.putPlateRoad(elemArr);
								break;
							case 1:
								this.putBigRoad(elemArr);
								break;
							case 2:
								this.putBigEyeRoad(elemArr);
								break;
							case 3:
								this.putSmallRoad(elemArr);
								break;
							case 4:
								this.putYueURoad(elemArr);
								break;
						}
					}
				}
			}
		},
		putOneData: function (array) {
			for (var i = 0; i < 5; i++) {
				switch (i) {
					case 0:
						this.putPlateRoad(array[i], true);
						break;
					case 1:
						this.putBigRoad(array[i], true);
						break;
					case 2:
						this.putBigEyeRoad(array[i], true);
						break;
					case 3:
						this.putSmallRoad(array[i], true);
						break;
					case 4:
						this.putYueURoad(array[i], true);
						break;
				}
			}
			this._scrollTo();
		},
		_showAllRoad: function (isShow) {
			this.getChildByName("bigRoad").visible = isShow;
			this.getChildByName("bigEyeRoad").visible = isShow;
			this.getChildByName("smallRoad").visible = isShow;
			this.getChildByName("yueURoad").visible = isShow;
			this.getChildByName("plateRoad").visible = isShow;
		},
		clear: function () {
			this.getChildByName("plateRoad").removeChildren();
			this.getChildByName("bigRoad").removeChildren();
			this.getChildByName("bigEyeRoad").removeChildren();
			this.getChildByName("yueURoad").removeChildren();
			this.getChildByName("smallRoad").removeChildren();
			this._addOneBgForAll();
		}
	});
	return WaySheetBody;
});
gbx.define("game/lobby/scene/lobby", ["gbx/hubs", "gbx/bridge", "comm/helper/playerdata_mgr", "comm/helper/sound_mgr", "comm/helper/scene_mgr", "game/lobby/ui/lobby"], function (hubs, bridge, playerDataMgr, soundMgr, sceneMgr, LobbyUI) {
	var lobbyUI;
	var showPlayerInfo = function () {
		lobbyUI.setUserName && lobbyUI.setUserName(playerDataMgr.getMyNick());
		lobbyUI.setUserVip && lobbyUI.setUserVip(playerDataMgr.getMyVIPLevel());
		lobbyUI.setUserGold && lobbyUI.setUserGold(playerDataMgr.getMyGold(), playerDataMgr.getMyCarryGold());
		lobbyUI.setUserHead && lobbyUI.setUserHead(playerDataMgr.getMyHead());
	};
	var responseBorderCast = function (context, callback) { };
	var goHome = function () {
		lobbyUI.gotoHome && lobbyUI.gotoHome();
	};
	var addListener = function () {
		hubs.subscribe("global.playerdata.update.itembag", showPlayerInfo);
		hubs.subscribe("global.playerdata.update.userdata", showPlayerInfo);
		hubs.subscribe("global.playerdata.update.bankdata", showPlayerInfo);
		hubs.subscribe("game_lobby.request.boardcast", responseBorderCast);
		hubs.subscribe("game_lobby.command.home", goHome);
	};
	var removeListener = function () {
		hubs.unsubscribe("global.playerdata.update.itembag", showPlayerInfo);
		hubs.unsubscribe("global.playerdata.update.userdata", showPlayerInfo);
		hubs.unsubscribe("global.playerdata.update.bankdata", showPlayerInfo);
		hubs.unsubscribe("game_lobby.request.boardcast", responseBorderCast);
		hubs.unsubscribe("game_lobby.command.home", goHome);
	};
	var checkGameBackAction = function () {
		if (lobbyUI.getCurrentPath().length === 1) {
			bridge.exitApp();
		} else {
			lobbyUI.gameListBack();
		}
	};
	return {
		show: function () {
			addListener();
			lobbyUI = new LobbyUI;
			showPlayerInfo();
			lobbyUI.addToStage();
			hubs.subscribe("global.app.back_action", checkGameBackAction);
		},
		end: function () {
			hubs.unsubscribe("global.app.back_action", checkGameBackAction);
			lobbyUI.destroy();
			removeListener();
		}
	};
});
gbx.define("game/lobby/scene/login", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/net_tool", "game/lobby/ui/login", "gbx/render/display/sprite", "comm/ui/connect_loading", "comm/helper/sound_mgr", "comm/helper/scene_mgr", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "comm/helper/room_mgr", "comm/ui/top_message", "gbx/hubs", "gbx/bridge", "conf/locallization", "conf/version", "gbx/util", "comm/net/msg_receiver", "comm/helper/conf_mgr", "platform/platform_manager", "conf/platform"], function (server, CMD, ERROR_CODE, ERROR_CODE_DES, netTool, LoginUI, Sprite, loadingUI, soundMgr, sceneMgr, playerDataMgr, accountMgr, roomMgr, topMessage, hubs, bridge, Localization, version, util, systemReceiver, confMgr, platformManager, Platform) {
	var loginUI;
	var regCaller;
	var successEvent;
	var failEvent;
	var loginType = gtea.net.LOGIN_TYPE_NORMAL;
	var loginToRoomTimes = 0;
	var stepConnectServer = function () {
		loginUI && loginUI.showInto();
		util.closeSpreadDiv();
		loadingUI.show();
		var result = server.connect();
		if (!result) {
			loadingUI.hide();
			showTips(Localization.loseConnect);
		}
	};
	var eventConnected = function () {
		loadingUI.hide();
		//whr 不再登录验证tokenid,直接取得用户数据
		//stepLoginVerify()
		stepGetUserData();
	};
	var eventDisconnected = function () {
		loadingUI.hide();
		showTips(Localization.loseConnect);
	};
	var stepLoginVerify = function () {
		var loginContent = {
			authToken: accountMgr.getToken()
		};
		var sendData = gtea.protobuf.encode("GameAuthReq", loginContent);
		server.requestToGame(CMD.LoginCommand, sendData, this, function (errorcode, retData) {
			if (errorcode == ERROR_CODE.OK) {
				var msgData = gtea.protobuf.decode("GameAuthResp", retData);
				if (msgData.result == ERROR_CODE.OK) {
					stepGetUserData();
					return;
				}
			}
			showTips(Localization.verifyUserFail);
		});
	};
	var stepGetUserData = function () {
		/*var sendData = gtea.protobuf.encode("GetUserAllDataReq", {
			deviceId: bridge.getDeviceId(),
			platformId: Platform.platformId,
			packageId: bridge.getPackageId()
		});
		server.requestToGame(CMD.GetUserInfoCommand, sendData, this, function(errorcode, retData) {
			if (errorcode == ERROR_CODE.OK) {
				var msgData = gtea.protobuf.decode("GetUserAllDataResp", retData);
				playerDataMgr.setUserData(msgData.userAllData);
				var rechargeType = msgData.userAllData.rechargeInfo.rechargeType;
				platformManager.setRechargeType(rechargeType);
				var rechargeMax = msgData.userAllData.rechargeInfo.rechargeMax;
				platformManager.setRechargeMax(rechargeMax);
				var rechargeNotice = msgData.userAllData.rechargeInfo.rechargeNotice;
				for (var k = 0; k < rechargeNotice.length; k++) {
					platformManager.tryRechargeItem(rechargeNotice[k])
				}
				stepGetRebateParentId()
			} else {
				showTips(Localization.getUserDataFail)
			}
		})*/
		if (myGlobalData.isSign) {
			myGlobalData.isSign = false;
			var userData = accountMgr.getUserData();
			var sendData = gtea.protobuf.encode("RequestPhoneRegister", {
				"SpreaderID": 0,	//推广ID
				"ThirdSpreaderID": 0,	//第三方推广ID
				"MobilePhone": userData.account,	//手机号
				"LoginPass": hex_md5(userData.password),	//登陆密码
				"VerifyCode": myGlobalData.authCode,	//验证码
				"MachineID": bridge.getDeviceId()	//机器码
			}, 0, 7);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.GetUserInfoCommand * 9, 0, 7, "ReplyPlayerDetailInfo");
			server.requestToGame(CMD.GetUserInfoCommand * 9, sendData, this, function (errorcode, mData) {
				if (mData.ErrorCode == ERROR_CODE.OK) {
					playerDataMgr.setUserData(mData);
					stepIntoLobby();
				} else {
					showTips(Localization.getUserDataFail);
				}
			});
		} else {
			var userData = accountMgr.getUserData();
			myGlobalData.md5PWD = hex_md5(userData.password);
			var sendData = gtea.protobuf.encode("RequestLoginByAccount", {
				MobilePhone: userData.account,
				LoginPass: hex_md5(userData.password)
			}, 0, 2);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.GetUserInfoCommand, 0, 2, "ReplyPlayerDetailInfo");
			server.requestToGame(CMD.GetUserInfoCommand, sendData, this, function (errorcode, retData) {
				var msgData = {};
				msgData.UserID = parseInt(Math.random() * 999999);	//玩家ID
				msgData.NickName = "玩家" + parseInt(Math.random() * 999999);	//昵称
				msgData.Level = 1;	//级别
				msgData.FaceID = 0;	//头像ID
				msgData.Gender = 0;	//性别
				msgData.VipLevel = 0;	//vip等级
				msgData.Experience = 0;	//检验
				msgData.MobilePhone = "0086+13900000000";	//手机号码
				msgData.Score = parseInt(Math.random() * 999999);	//分数
				msgData.Diamond = parseInt(Math.random() * 999999);	//钻石
				msgData.Lottery = parseInt(Math.random() * 999999);	//奖券
				msgData.ServerMask = 0;	//值:0-正常 1-隐藏 位:1-水浒传 2-百人牛牛 3-捕鱼 4-德州扑克
				msgData.ClientVersion = 15;	//客户端版本
				msgData.UpdateUrl = 16;	//更新地址
				msgData.GameSort = 17;	//游戏排序
				msgData.FaceUrl = 18;	//头像URL
				msgData.RoomId = 0;	//房间ID
				msgData.TypeMask = 20;	//0x01未实名
				msgData.IPAddr = 21;	//IP地址
				msgData.TokenId = 22;	//令牌
				msgData.ServerId = 23;	//服务器ID
				msgData.PlayerProp = 24;	//配置文件名
				playerDataMgr.setUserData(msgData);
				stepIntoLobby();
			});
		}
	};
	var stepGetRebateParentId = function () {
		//返利,查询上下线
		var sendData = gtea.protobuf.encode("RebateQueryRSReq", {
			level: 1
		});
		server.requestToGame(CMD.RebateQueryRS, sendData, this, function (errorcode, data) {
			if (errorcode == ERROR_CODE.OK) {
				var retData = gtea.protobuf.decode("RebateQueryRSResp", data);
				playerDataMgr.setRebateParentId(retData.parentId);
				stepGetAllRoomData();
			} else {
				showTips(Localization.getRebateParentIdFail);
			}
		});
	};
	var stepGetAllRoomData = function (typeID) {
		roomMgr.getAllRoomData(this, function (errorCode) {
			if (errorCode == ERROR_CODE.OK) {
				//暂时不加入房间
				//stepGetOldRoomId()
				stepIntoLobby();
			} else {
				showTips(Localization.getAllRoomDataFail);
			}
		}, typeID);
	};
	var stepGetOldRoomId = function () {
		roomMgr.getOldRoomId(this, function (oldRoomId) {
			if (oldRoomId != null) {
				if (loginType == gtea.net.LOGIN_TYPE_TOROOM) roomMgr.resetRoom(oldRoomId);
				else roomMgr.joinRoomByRoomId(oldRoomId);
			} else {
				stepIntoLobby();
			}
		});
	};
	var stepIntoLobby = function () {
		if (successEvent) successEvent.call(regCaller, null);
		sceneMgr.switchTo("lobby");
	};
	var afterGetServerInfo = function (info) {
		for (var i = 0; i < info.addressList.length; i++) {
			netTool.pushPath(info.addressList[i].key, info.addressList[i].address);
		}
		accountMgr.setGuestState(info.openGuest);
		hubs.publish("lobby.login.gueststate");
	};
	var getServerInfo = function () {
		var serverInfo = bridge.getServerInfo();
		if (serverInfo === "") {
			loadingUI.show();
			var postData = {
				gameVersion: bridge.getVersion(),
				gameType: "baccarat",
				os: bridge.getPlatform(),
				packageId: bridge.getPackageId()
			};
			var postTxt = JSON.stringify(postData);
			netTool.createHttpRequest(netTool.getPathByKey("getServerInfo"), postTxt, this, function (data) {
				//whr var ret = gtea.protobuf.decode("ServerInfoResult", data); 
				var ret = JSON.parse(data);
				afterGetServerInfo(ret);
				loadingUI.hide();
			}, function (status) {
				setTimeout(getServerInfo, 5e3);
			}, false);
		} else {
			var ret = JSON.parse(serverInfo);
			afterGetServerInfo(ret);
		}
	};
	var showTips = function (message) {
		gtea.net.NetMsgMgr.close();
		if (loginType == gtea.net.LOGIN_TYPE_TOROOM) {
			eventRestartLoginToRoom();
			return;
		}
		topMessage.post(message);
		loginUI && loginUI.unlock();
		if (failEvent) failEvent.call(regCaller, message);
	};
	var startLogin = function (phoneNumber, password, cbUsername, cbPassword) {
		gtea.net.NetMsgMgr.close();
		accountMgr.saveUserData(phoneNumber, password, cbUsername, cbPassword);
		getSalt();
	};
	var startLoginNormal = function (phoneNumber, password, cbUsername, cbPassword) {
		loginType = gtea.net.LOGIN_TYPE_NORMAL;
		startLogin(phoneNumber, password, cbUsername, cbPassword);
	};
	var startGuestlogin = function () {
		gtea.net.NetMsgMgr.close();
		guestLogin();
	};
	var startGuestloginNormal = function () {
		loginType = gtea.net.LOGIN_TYPE_NORMAL;
		startGuestlogin();
	};
	var restartLogin = function () {
		loginType = gtea.net.LOGIN_TYPE_RELOGIN;
		var userData = accountMgr.getUserData();
		if (userData.account == null || userData.account.length == 0) startGuestlogin();
		else startLogin(userData.account, userData.password, userData.checkAccount, userData.checkPassword);
	};
	var eventRestartLoginToRoom = function () {
		gbx.log("eventRestartLoginToRoom " + loginToRoomTimes);
		var tryLoginToRoom = false;
		if (loginToRoomTimes < 3) {
			tryLoginToRoom = true;
			loginToRoomTimes++;
		} else {
			tryLoginToRoom = false;
		}
		if (tryLoginToRoom) {
			topMessage.post(Localization.lost_connect_try);
			loginType = gtea.net.LOGIN_TYPE_TOROOM;
			var userData = accountMgr.getUserData();
			if (userData.account == null || userData.account.length == 0) startGuestlogin();
			else startLogin(userData.account, userData.password, userData.checkAccount, userData.checkPassword);
		} else {
			hubs.publish("global.net_connect.disconnected", gtea.net.DISCONNECT_REASON_TOROOM);
		}
	};
	var eventRestartLoginToRoomSuccess = function () {
		gbx.log("eventRestartLoginToRoomSuccess");
		loginType = gtea.net.LOGIN_TYPE_NORMAL;
		loginToRoomTimes = 0;
		topMessage.hide();
	};
	var getSalt = function () {
		//whr 跳过取得salt过程
		//netTool.getSalt(this, function(ret) {
		//	if (ret.result == ERROR_CODE.OK) {
		//		accountMgr.setSalt(ret.randomSalt, ret.staticSalt);
		//		phoneLogin()
		//	} else {
		//		showTips(ERROR_CODE_DES[ret.result])
		//	}
		//}, null, this, null, function(param) {
		//	showTips(param)
		//})
		//增加网络连接
		var addressArr = "172.16.10.147:7667".split(":");
		//var addressArr = "103.72.144.76:7667".split(":");
		//var addressArr = "ts.1314bjl.com:7667".split(":");
		server.setServer(addressArr[0], parseInt(addressArr[1]));
		stepConnectServer();
	};
	var phoneSignup = function (phoneNumber, password, authCode, caller, success, fail) {
		regCaller = caller;
		successEvent = success;
		failEvent = fail;
		myGlobalData.isSign = true;
		myGlobalData.authCode = parseInt(authCode);
		startLoginNormal(phoneNumber, password, true, true);
	};
	var guestLogin = function () {
		var guestPlatformId = accountMgr.getGuestPlatformId();
		var sendObj = {
			account: accountMgr.getGuestAccount(),
			OS: guestPlatformId,
			gameVersion: bridge.getVersion(),
			platformId: Platform.platformId,
			packageId: bridge.getPackageId()
		};
		var sendMsg = gtea.protobuf.encode("LoginReq", sendObj);
		netTool.createHttpRequest(netTool.getPathByKey("loginUrl"), sendMsg, this, function (data) {
			var ret = gtea.protobuf.decode("LoginResp", data);
			if (ret.result == ERROR_CODE.OK) {
				if (ret.gameServer == null) {
					showTips(Localization.serverAddressError);
					return;
				}
				accountMgr.setToken(ret.authToken);
				accountMgr.setGateServerAddress(ret.gameServer.address);
				accountMgr.setGameServerId(ret.gameServer.serverId);
				var addressArr = ret.gameServer.address.split(":");
				server.setServer(addressArr[0], parseInt(addressArr[1]));
				stepConnectServer();
			} else {
				accountMgr.setToken(null);
				showTips(ERROR_CODE_DES[ret.result]);
			}
		}, function (status) {
			showTips(Localization.loginError + " status " + status);
		});
	};
	var phoneLogin = function () {
		var userData = accountMgr.getUserData();
		var hashPassword = accountMgr.getHashPassword();
		var sendObj = {
			phoneNumber: userData.account,
			hashPassword: hashPassword,
			OS: bridge.getPlatform(),
			gameVersion: bridge.getVersion(),
			platformId: Platform.platformId,
			packageId: bridge.getPackageId()
		};
		var sendMsg = gtea.protobuf.encode("SMSLoginReq", sendObj);
		netTool.createHttpRequest(netTool.getPathByKey("smsLoginUrl"), sendMsg, this, function (data) {
			var ret = gtea.protobuf.decode("SMSLoginResp", data);
			if (ret.result == ERROR_CODE.OK) {
				if (ret.gameServer == null) {
					showTips(Localization.serverAddressError);
					return;
				}
				accountMgr.setToken(ret.authToken);
				accountMgr.setGateServerAddress(ret.gameServer.address);
				accountMgr.setGameServerId(ret.gameServer.serverId);
				var addressArr = ret.gameServer.address.split(":");
				server.setServer(addressArr[0], parseInt(addressArr[1]));
				stepConnectServer();
			} else {
				accountMgr.setToken(null);
				showTips(ERROR_CODE_DES[ret.result]);
			}
		}, function (status) {
			showTips(Localization.loginError + " status " + status);
		});
	};
	return {
		isAdded: false,
		show: function (isInit, reconnect) {
			confMgr.prepare();
			loginToRoomTimes = 0;
			if (!this.isAdded) {
				hubs.subscribe("global.net_connect.login_to_room", eventRestartLoginToRoom);
				hubs.subscribe("global.net_connect.login_to_room_success", eventRestartLoginToRoomSuccess);
				hubs.subscribe("global.net_connect.connected", eventConnected);
				this.isAdded = true;
			}
			hubs.subscribe("global.app.back_action", bridge.exitApp);
			hubs.subscribe("global.net_connect.disconnected", eventDisconnected);
			systemReceiver.removeListener();
			systemReceiver.addListenerOnce();
			var userData = accountMgr.getUserData();
			loginUI = new LoginUI(userData.account, userData.password, userData.country, true, true);
			loginUI.setCommand("sms_create", phoneSignup);
			loginUI.setCommand("sms_login", startLoginNormal);
			loginUI.setCommand("sms_guestlogin", startGuestloginNormal);
			loginUI.addToStage();
			soundMgr.playBGM("assets/main/bgm/back.mp3");
			soundMgr.playSE("assets/main/sound/system_welcome.mp3", 1);
			//getServerInfo();
			//util.closeInitDiv();
			bridge.sendGameReady();
			if (!isInit && reconnect) restartLogin();
		},
		end: function () {
			loginUI && loginUI.destroy();
			loginUI = null;
			hubs.unsubscribe("global.app.back_action", bridge.exitApp);
			hubs.unsubscribe("global.net_connect.disconnected", eventDisconnected);
			systemReceiver.addListener();
		}
	};
});
gbx.define("game/lobby/ui/lobby", ["comm/helper/conf_mgr", "comm/helper/room_mgr", "gbx/render/stage", "comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/schema", "comm/ui/sound_button", "comm/ui/marquee", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "comm/helper/trumpet_mgr", "gbx/bridge", "game/lobby/parts/way_sheet", "game/lobby/lobbypop/system_setting", "game/lobby/lobbypop/account_safe", "game/lobby/lobbypop/gambling_details", "game/lobby/lobbypop/game_help", "game/lobby/lobbypop/bank_setting", "game/lobby/lobbypop/rank_info", "game/lobby/lobbypop/create_vip", "game/lobby/lobbypop/addin_room", "game/lobby/lobbypop/online_service", "game/lobby/lobbypop/game_spread", "game/lobby/lobbypop/mail_panel", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "conf/platform", "game/lobby/lobbypop/bank_charge", "game/lobby/lobbypop/bank_charge_online", "platform/platform_manager", "game/lobby/parts/download", "gbx/net/net_tool", "comm/ui/top_message", "gbx/net/errorcode_des", "comm/ui/connect_loading", "comm/ui/scene_loading", "comm/helper/account_mgr", "comm/ui/top_confirm"], function (confMgr, roomMgr, stage, BaseUI, Sprite, Text, Schema, Button, Marquee, server, CMD, ERROR_CODE, trumpetMgr, bridge, Waysheet, SystemSetting, AccountSafe, GamblingDetail, GameHelp, BankSetting, RankInfo, CreateVip, AddInRoom, OnlineService, GameSpread, MailPanel, playerDataMgr, uiUtils, uiLocallization, platform, BankCharge, BankChargeOnline, platformManager, DownloadForm, netTool, topMessage, ERROR_CODE_DES, loadingUI, loading, accountMgr, topConfirm) {
	var superBigY = 120;
	var midPanelY = 300;
	var popZOrder = 3;
	var showDownloadForm = false;
	var downSize = 110;
	var LobbyUI = BaseUI.extend({
		init: function () {
			this._super();
			this.mainGameType = 1;
			this.setImage("assets/main/public/lobby_bg.jpg");
			var showCustomerServiceQQNumber = false;
			this.tabMainBtn = [];
			this.tabBtn = [];
			this.panel_dragonList;
			this.panel_jingmiList;
			this.setting = confMgr.read("main/dat/game/lobby.json");
			var bar = uiUtils.createSprite("assets/main/lobby/sp/panel_bar.png");
			bar.pos(0, 0);
			bar.zOrder = -3;
			this.addChild(bar);
			var bar1 = uiUtils.createSprite("assets/main/lobby/sp/panel_bar_botton.png");
			bar1.pos(0, 1000);
			bar1.zOrder = -1;
			this.addChild(bar1);
			var spUI = new Schema([{
				type: "Sprite",
				props: {
					pos: [4, 4],
					name: "top_bar",
					childs: [{
						type: "Button",
						props: {
							scale: [.99],
							stateNum: 1,
							pos: [10, 10],
							name: "player_head",
							setClickHandler: [this, this.onClickHead]
						}
					}, {
						type: "Text",
						props: {
							text: "",
							fontSize: 19,
							color: "#FFFFFD",
							align: "left",
							width: 200,
							strokeColor: "#000000",
							overflow: "hidden",
							pos: [115, 5],
							name: "player_name"
						}
					}, {
						type: "Text",
						props: {
							text: "",
							fontSize: 18,
							color: "#E9E79C",
							align: "left",
							width: 170,
							pos: [115, 39],
							name: "gold_carry"
						}
					}, {
						type: "Text",
						props: {
							text: "",
							fontSize: 18,
							color: "#E9E79C",
							align: "left",
							width: 170,
							pos: [115, 67],
							name: "gold_value"
						}
					}, {
						type: "Button",
						props: {
							setSkinImage: ["assets/main/lobby/sp/mark_add_gold.png"],
							stateNum: 1,
							pos: [266, 25],
							visible: myGlobalData.isRelease,
							setClickHandler: [this, this.addGold, "playerHead"]
						}
					}, {
						type: "Text",
						props: {
							text: "",
							fontSize: 32,
							color: "#ffffff",
							align: "center",
							width: 170,
							pos: [460, 18],
							visible: false,
							name: "vip_level"
						}
					}]
				}
			}, {
				type: "Button",
				props: {
					stateNum: 2,
					setSkinImage: ["assets/main/lobby/sp/lobby_play.png"],
					pivotToCenter: [],
					pos: [76, 1065],
					zOrder: 2,
					setClickHandler: [this, this.OnClick, "lobby_play"],
					name: "lobby_play"
				}
			}, {
				type: "Text",
				props: {
					text: "客服QQ:10000",
					fontSize: 20,
					color: "#adb5f1",
					align: "left",
					pos: [950, 580],
					visible: showCustomerServiceQQNumber
				}
			}]);
			spUI.appendTo(this);
			this.getChildByName("top_bar", "gold_value").visible = !platformManager.bExamine();
			var topRightPath = ["assets/main/lobby/sp/pic_bank.png", "assets/main/lobby/sp/pic_spread.png", "assets/main/lobby/sp/pic_mail.png", "assets/main/lobby/sp/pic_more.png", "assets/main/lobby/sp/pic_alms.png"];
			var posX = [150, 280, 400, 530, 150];
			var topRightBtnNames = ["bank", "spread", "mail", "more", "alms"];
			for (var index = 0; index < topRightPath.length; index++) {
				if (topRightBtnNames[index] == "bank" && !myGlobalData.isRelease) continue;
				if (topRightBtnNames[index] == "more" && !myGlobalData.isRelease) continue;
				if (topRightBtnNames[index] == "alms" && myGlobalData.isRelease) continue;
				var btn = uiUtils.createButton(topRightPath[index], 1, "btn_" + topRightBtnNames[index]);
				btn.pos(posX[index] - 5, 1040);
				if (platformManager.bExamine() && index == 1) { } else {
					btn.setClickHandler(this, this.topRightBtnsClick);
				}
				this.addChild(btn);
			}
			var background = uiUtils.createSprite("assets/main/lobby/sp/splitline.png", "");
			background.pos(0, 95 + downSize);
			background.zOrder = -1;
			this.addChild(background);
			var background1 = uiUtils.createSprite("assets/main/lobby/sp/splitline.png", "");
			background1.pos(0, 173 + downSize);
			background1.zOrder = -1;
			this.addChild(background1);
			var background2 = uiUtils.createSprite("assets/main/lobby/sp/panel1.png", "");
			background2.scale(13, 30);
			background2.pos(0, 105);
			background2.zOrder = -2;
			this.addChild(background2);
			var tabBtnNames = ["bjl", "lhd", "sb", "yxx"];
			var Names = ["assets/main/lobby/sp/tab_normal.png"];
			var Words = ["assets/main/lobby/sp/1-fs8.png", "assets/main/lobby/sp/3-fs8.png", "assets/main/lobby/sp/5-fs8.png", "assets/main/lobby/sp/7-fs8.png"];
			var length = 0;
			length = tabBtnNames.length;
			for (var index = 0; index < length; index++) {
				var btn = uiUtils.createButton(Names[0], 1, "lobbyMainTab_" + tabBtnNames[index]);
				btn.stateNum = 1;
				btn.pos(index * 160 - 1, 100);
				this.addChild(btn);
				btn.setClickHandler(this, this.onMainSelect, btn.name);
				btn.alpha = .7;
				var img = uiUtils.createSprite(Words[index], "");
				img.name = "img";
				img.alpha = 1;
				btn.addChild(img);
				this.addChild(btn);
				this.tabMainBtn.push(btn);
			}
			this.TabMainBtnStyle(this.tabMainBtn[0].name);
			tabBtnNames = ["julong", "jingmi", "Vip"];
			Names = ["assets/main/lobby/sp/tab_sub_normal.png"];
			var Words = ["至尊厅", "竞咪厅", "VIP厅"];
			length = 0;
			length = tabBtnNames.length;
			for (var index = 0; index < length; index++) {
				var btn = uiUtils.createButton(Names[0], 1, "lobbyTab_" + tabBtnNames[index]);
				btn.stateNum = 1;
				btn.pos(index * 216 - 1, 100 + downSize);
				this.addChild(btn);
				btn.setClickHandler(this, this.onSelect, btn.name);
				btn.labelBold = true;
				btn.label = Words[index];
				btn.labelSize = 30;

				this.addChild(btn);
				this.tabBtn.push(btn);
			}
			this.TabBtnStyle(this.tabBtn[0].name);
			var split = uiUtils.createSprite("assets/main/lobby/sp/main_split.png");
			split.pos(878, 107.4);
			split.scaleY = .968;
			this.addChild(split);
			var sp_lhd_tab1 = new Sprite;
			sp_lhd_tab1.pos(0, 178 + downSize);
			sp_lhd_tab1.zOrder = -1;
			sp_lhd_tab1.name = "panel_lhd_tab1";
			this.addChild(sp_lhd_tab1);
			this.panel_lhd_tab1_List = uiUtils.createNormalList(1, 0, 0, "v", 640, 860 - downSize, 640, 326);
			this.panel_lhd_tab1_List.name = "panel_dragon";
			this.panel_lhd_tab1_List.setRenderHandler(this, this._render_lhd_tab1);
			sp_lhd_tab1.addChild(this.panel_lhd_tab1_List);
			var sp_lhd_tab2 = new Sprite;
			sp_lhd_tab2.pos(0, 178 + downSize);
			sp_lhd_tab2.zOrder = -1;
			sp_lhd_tab2.name = "panel_lhd_tab2";
			this.addChild(sp_lhd_tab2);
			this.panel_lhd_tab2_List = uiUtils.createNormalList(1, 0, 0, "v", 640, 860 - downSize, 640, 326);
			this.panel_lhd_tab2_List.name = "panel_dragon";
			this.panel_lhd_tab2_List.setRenderHandler(this, this._render_lhd_tab2);
			sp_lhd_tab2.addChild(this.panel_lhd_tab2_List);
			var sp_dragon = new Sprite;
			sp_dragon.pos(0, 178 + downSize);
			sp_dragon.zOrder = -1;
			sp_dragon.name = "panel_dragon";
			this.addChild(sp_dragon);
			this.panel_dragonList = uiUtils.createNormalList(1, 0, 0, "v", 640, 860 - downSize, 640, 326);
			this.panel_dragonList.name = "panel_dragon";
			this.panel_dragonList.setRenderHandler(this, this._render_dragon);
			sp_dragon.addChild(this.panel_dragonList);
			var sp_jm = new Sprite;
			sp_jm.pos(0, 178 + downSize);
			sp_jm.zOrder = -1;
			sp_jm.name = "panel_jingmi";
			this.addChild(sp_jm);
			this.panel_jingmiList = uiUtils.createNormalList(1, 0, 0, "v", 640, 860 - downSize, 640, 326);
			this.panel_jingmiList.name = "panel_dragon";
			this.panel_jingmiList.setRenderHandler(this, this._render_jingmi);
			sp_jm.addChild(this.panel_jingmiList);
			sp_jm.visible = false;
			var sp_vip = uiUtils.createPanel(640, 860, "panel_vip");
			sp_vip.pos(0, 178 + downSize);
			this.addChild(sp_vip);
			sp_vip.visible = false;
			var x250 = 47;
			var sys = new SystemSetting;
			sys.name = "sysSetting";
			sys.pos(x250, midPanelY);
			sys.visible = false;
			sys.zOrder = popZOrder;
			this.addChild(sys);
			var gambling = new GamblingDetail;
			gambling.name = "gambling";
			gambling.pos(x250, superBigY);
			gambling.visible = false;
			gambling.zOrder = popZOrder;
			this.addChild(gambling);
			var accoutSafe = new AccountSafe;
			accoutSafe.name = "accoutSafe";
			accoutSafe.pos(x250, midPanelY);
			accoutSafe.visible = false;
			accoutSafe.zOrder = popZOrder;
			this.addChild(accoutSafe);
			var gameHelp = new GameHelp;
			gameHelp.name = "gameHelp";
			gameHelp.pos(x250, superBigY);
			gameHelp.visible = false;
			gameHelp.zOrder = popZOrder;
			this.addChild(gameHelp);
			var bankSetting = new BankSetting;
			bankSetting.name = "bankSetting";
			bankSetting.pos(x250, midPanelY);
			bankSetting.visible = false;
			bankSetting.zOrder = popZOrder;
			this.addChild(bankSetting);
			var bankCharge = new BankCharge;
			bankCharge.pos(x250, midPanelY);
			bankCharge.name = "bankCharge";
			bankCharge.visible = false;
			bankCharge.zOrder = popZOrder;
			this.addChild(bankCharge);
			var rankInfo = new RankInfo;
			rankInfo.name = "rankInfo";
			rankInfo.pos(x250, superBigY);
			rankInfo.visible = false;
			rankInfo.zOrder = popZOrder;
			this.addChild(rankInfo);
			var createVip = new CreateVip;
			createVip.name = "createVip";
			createVip.pos(x250, midPanelY);
			createVip.visible = false;
			createVip.zOrder = popZOrder;
			this.addChild(createVip);
			var addInRoom = new AddInRoom;
			addInRoom.name = "addInRoom";
			addInRoom.pos(68.5, midPanelY + 30);
			addInRoom.visible = false;
			addInRoom.zOrder = popZOrder;
			this.addChild(addInRoom);
			var onlineService = new OnlineService;
			onlineService.name = "onlineService";
			onlineService.pos(68.5, midPanelY + 55);
			onlineService.visible = false;
			onlineService.zOrder = popZOrder;
			this.addChild(onlineService);
			var gameSpread = new GameSpread;
			gameSpread.name = "gameSpread";
			gameSpread.pos(0, 0);
			gameSpread.visible = false;
			gameSpread.zOrder = popZOrder;
			this.addChild(gameSpread);
			var mailPanel = new MailPanel;
			mailPanel.name = "mailPanel";
			mailPanel.pos(x250, midPanelY);
			mailPanel.visible = false;
			mailPanel.zOrder = popZOrder;
			this.addChild(mailPanel);
			if (bridge.getPlatform() === "web") {
				if (!showDownloadForm) {
					var downloadForm = new DownloadForm;
					downloadForm.pos(68, 280);
					downloadForm.zOrder = 2;
					downloadForm.visible = true;
					downloadForm.name = "downloadForm";
					this.addChild(downloadForm);
					showDownloadForm = true;
				}
			}
			this.subscribe("lobby.setting.play.open_service", this, this.eventOpenService);
			this.subscribe("lobby.setting.play.open_gambling", this, this.eventOpenGambling);
			this.subscribe("lobby.setting.play.open_accoutSafe", this, this.eventOpenAccountSafe);
			this.subscribe("lobby.setting.play.open_gameHelp", this, this.eventOpenGameHelp);
			this.subscribe("lobby.setting.play.open_rank", this, this.eventOpenRank);
			this.subscribe("lobby.setting.play.open_mailPanel", this, this.eventOpenMailPanel);
			this.subscribe("lobby.lobbypop.bankcharge", this, this.eventOpenBankcharge);
			this.subscribe("lobby.lobbypop.refresh_vip_room", this, this.eventRefreshVIPRoom);
			this.messageBar = new Marquee;
			this.messageBar.pos(284, 47);
			this.addChild(this.messageBar);
			this.subscribe("global.trumpet.update", this, this.onBoardCastMessage);
			this.subscribe("lobby.game.updateMyInfo", this, this.updateMyInfo);

			if (playerDataMgr.getMyData().serverID > 0) {
				roomMgr.joinRoomReq(playerDataMgr.getMyData().serverID);
				playerDataMgr.getMyData().serverID = 0;
			} else {
				this.onMainSelect(null, this.tabMainBtn[0].name);

				this.publish("lobby.game.updateMyInfo");
				this.publish("game_baccarat.setting.updateMyDeposit");
			}

			//this._makeVIPPanel(sp_vip, false);
		},
		_checkOpenPanel: function () {
			var data = roomMgr.getRoomList()[0];
			if (data) {
				switch (data.baccaratRoomType) {
					case confMgr.definition.BaccaratRoomType.Dragon:
						this.onSelect(null, this.tabBtn[0].name);
						break;
					case confMgr.definition.BaccaratRoomType.JingMi:
						this.onSelect(null, this.tabBtn[1].name);
						break;
					case confMgr.definition.BaccaratRoomType.Vip:
						this.onSelect(null, this.tabBtn[2].name);
						break;
				}
			}
		},
		_refresh: function () {
			//this._checkOpenPanel()
			var roomList = roomMgr.getRoomList();
			if (roomList == undefined) return;
			var chooseData = roomMgr.getChoose();
			var curDragonIndex = 0;
			var dragonIndex = 0;
			var curJingmiIndex = 0;
			var jingmiIndex = 0;
			var curLHD1Index = 0;
			var LHD1Index = 0;
			var curLHD2Index = 0;
			var LHD2Index = 0;
			this.panel_dragonList.array = [];
			this.panel_jingmiList.array = [];
			this.panel_lhd_tab1_List.array = [];
			this.panel_lhd_tab2_List.array = [];
			for (var index = 0; index < roomList.length; index++) {
				var roomId = roomList[index].roomId;
				var findIndex = confMgr.setting.maskServerIds.indexOf(parseInt(roomId));
				if (findIndex != -1) continue;
				switch (roomList[index].baccaratRoomType) {
					case confMgr.definition.BaccaratRoomType.Dragon:
						this.panel_dragonList.array.push(roomList[index]);
						if (chooseData != null && chooseData.roomId === roomId) curDragonIndex = dragonIndex;
						dragonIndex++;
						break;
					case confMgr.definition.BaccaratRoomType.JingMi:
						this.panel_jingmiList.array.push(roomList[index]);
						if (chooseData != null && chooseData.roomId === roomId) curJingmiIndex = jingmiIndex;
						jingmiIndex++;
						break;
					case confMgr.definition.BaccaratRoomType.LHD1:
						this.panel_lhd_tab1_List.array.push(roomList[index]);
						if (chooseData != null && chooseData.roomId === roomId) curLHD1Index = LHD1Index;
						LHD1Index++;
						break;
					case confMgr.definition.BaccaratRoomType.LHD2:
						this.panel_lhd_tab2_List.array.push(roomList[index]);
						if (chooseData != null && chooseData.roomId === roomId) curLHD2Index = LHD2Index;
						LHD2Index++;
						break;
				}
			}
			this.panel_dragonList.refresh();
			this.panel_dragonList.scrollTo(curDragonIndex);
			this.panel_jingmiList.refresh();
			this.panel_jingmiList.scrollTo(curJingmiIndex);
			this.panel_lhd_tab1_List.refresh();
			this.panel_lhd_tab1_List.scrollTo(curLHD1Index);
			this.panel_lhd_tab2_List.refresh();
			this.panel_lhd_tab2_List.scrollTo(curLHD2Index);
		},
		_makeVIPPanel: function (vipPanel, isRefresh) {
			var roomList = roomMgr.getRoomListByType(confMgr.definition.BaccaratRoomType.Vip);
			var chooseData = roomMgr.getChoose();
			if (isRefresh) vipPanel.removeChildren(0, 20);
			var BtnName = ["btn_createRoom", "btn_getinRoom"];
			if (roomList.length == 0) BtnName.push("btn_none");
			var lastY = 0;
			for (var i = 1; i <= BtnName.length; i++) {
				var tempBtn = uiUtils.createButton("assets/main/lobby/sp/vip/btn_vip_" + i + ".png", 1, BtnName[i - 1]);
				lastY = (i - 1) * 285;
				tempBtn.pos(0, lastY);
				tempBtn.setClickHandler(this, this.OnClickVip);
				vipPanel.addChild(tempBtn);
			}
			var curY = 0;
			for (var i = 0; i < roomList.length; i++) {
				var sp = new Waysheet(true);
				sp.setData(roomList[i]);
				sp.name = roomList[i].roomId;
				sp.pos(0, lastY + 285 + 330 * i);
				vipPanel.addChild(sp);
				if (chooseData != null && chooseData.roomId === roomList[i].roomId) curY = lastY;
			}
		},
		_resetVIPPanel: function () {
			var vipPanel = this.getChildByName("panel_vip");
			this._makeVIPPanel(vipPanel, false);
			//var roomList = roomMgr.getRoomListByType(confMgr.definition.BaccaratRoomType.Vip);
			//for (var i = 0; i < roomList.length; i++) {
			//	var waySheet = vipPanel.getChildByName(roomList[i].roomId);
			//	waySheet.updateVIPRemoveBtn()
			//}
		},
		eventOpenBankcharge: function () {
			var account = accountMgr.getUserData().account;
			platformManager.tryRechargeOrder_qrCode(account, playerDataMgr.getMyUID(), "channel", 9);
		},
		eventOpenGambling: function (data) {
			this.getChildByName("gambling").visible = true;
			this.getChildByName("gambling").setGambleData(data);
		},
		eventOpenAccountSafe: function (showMask) {
			this.getChildByName("accoutSafe").visible = true;
			this.getChildByName("accoutSafe").eventBindInfo();
			this.getChildByName("accoutSafe").showMask(showMask);
		},
		eventOpenService: function () {
			//this.getChildByName("onlineService").visible = true
			var url = "https://chat56.live800.com/live800/chatClient/chatbox.jsp?companyID=809336&configID=115523&jid=2989563429&s=1&enterurl=";
			var param = "[用户ID:" + playerDataMgr.getMyUID() + "][手机号:" + accountMgr.getUserData().account + "][昵称:" + playerDataMgr.getMyNick() + "][机型:" + bridge.getPlatform() + "]";
			bridge.openUrl(url + encodeURI(param));
		},
		eventOpenGameHelp: function () {
			this.getChildByName("gameHelp").visible = true;
		},
		eventOpenGameSpread: function (data) {
			this.getChildByName("gameSpread").setData(data);
			this.getChildByName("gameSpread").visible = true;
		},
		eventOpenMailPanel: function (data) {
			this.publish("lobby.setting.play.open_gameHelp");
			//var sendMsg = gtea.protobuf.encode("GetMailListReq", {});
			//server.requestToGame(CMD.GetMailList, sendMsg, this, function(errorcode, data) {
			//	if (errorcode == ERROR_CODE.OK) {
			//		var retData = gtea.protobuf.decode("GetMailListResp", data);
			//		this.getChildByName("mailPanel").visible = true;
			//		this.getChildByName("mailPanel").setData(retData.mailData)
			//	}
			//})
		},
		eventRefreshVIPRoom: function (roomId) {
			var sp_vip = this.getChildByName("panel_vip");
			roomMgr.removeRoom(roomId);
			this._makeVIPPanel(sp_vip, true);
		},
		eventOpenRank: function () {
			var sendMsg = gtea.protobuf.encode("RequestRankListInfo", { RankID: 0 }, 7, 1);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.GetGoldRank, 7, 1, "ReplyRankListInfo");
			server.requestToGame(CMD.GetGoldRank, sendMsg, this, function (errorcode, data) {
				var retData = {};
				retData.rankInfo = [];
				for (var i = 0; i < data.Info.length; i++) {
					var pData = {};
					pData.playerId = data.Info[i].UserID;
					pData.playerName = data.Info[i].NickName;
					pData.playerIcon = data.Info[i].FaceID;
					pData.gold = parseInt(data.Info[i].Score) / 100;
					retData.rankInfo[i] = pData;
				}
				this.getChildByName("rankInfo").visible = true;
				this.getChildByName("rankInfo").setData(retData.rankInfo);
			});
		},
		_openSpread: function () {
			var url = "https://chat56.live800.com/live800/chatClient/chatbox.jsp?companyID=809336&configID=115523&jid=2989563429&s=1&enterurl=";
			var param = "[用户ID:" + playerDataMgr.getMyUID() + "][手机号:" + accountMgr.getUserData().account + "][昵称:" + playerDataMgr.getMyNick() + "][机型:" + bridge.getPlatform() + "]";
			bridge.openUrl(url + encodeURI(param));
		},
		topRightBtnsClick: function (btn) {
			if (btn.name == "btn_alms") {
				//领救济金了
				var sendData = gtea.protobuf.encode(null, null, 2, 4);
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.QuitRoom * 99, 2, 4, "ReplyCharityInfo");
				server.requestToGame(CMD.QuitRoom * 99, sendData, this, function (errorcode, retData) {
					if (retData.LeftCounts > 0) {
						//领钱
						sendData = gtea.protobuf.encode(null, null, 2, 5);
						gtea.net.ProtobufConverter.getInstance().setCallback(CMD.QuitRoom * 98, 2, 5, "ReplyGetCharity");
						server.requestToGame(CMD.QuitRoom * 98, sendData, this, function (errorcode, mData) {
							if (mData.ErrorCode == ERROR_CODE.OK) {
								playerDataMgr.setMyCarryGold(mData.CharityScore + playerDataMgr.getMyCarryGold());
							} else {
								if (mData.ErrorCode == 1) {
									topConfirm.ask("领取失败,无领取次数", this, null, null);
								} else if (mData.ErrorCode == 2) {
									topConfirm.ask("领取失败,分数不满足条件", this, null, null);
								} else if (mData.ErrorCode == 3) {
									topConfirm.ask("领取失败", this, null, null);
								}
							}
						});
					}
				});
			} else if (btn.name == "btn_bank") {
				this.addGold();
			} else if (btn.name == "btn_mail") {
				this.publish("lobby.setting.play.open_mailPanel");
			} else if (btn.name == "btn_spread") {
				this._openSpread();
			} else if (btn.name == "btn_more") {
				this.getChildByName("sysSetting").visible = true;
			}
		},
		_render_lhd_tab1: function (cell, idx) {
			var data = this.panel_lhd_tab1_List.array;
			if (idx > data.length) {
				return;
			}
			this._renderSameObject(cell, idx, this.panel_lhd_tab1_List);
		},
		_render_lhd_tab2: function (cell, idx) {
			var data = this.panel_lhd_tab2_List.array;
			if (idx > data.length) {
				return;
			}
			this._renderSameObject(cell, idx, this.panel_lhd_tab2_List);
		},
		_render_dragon: function (cell, idx) {
			var data = this.panel_dragonList.array;
			if (idx > data.length) {
				return;
			}
			this._renderSameObject(cell, idx, this.panel_dragonList);
		},
		_render_jingmi: function (cell, idx) {
			var data = this.panel_jingmiList.array;
			if (idx > data.length) {
				return;
			}
			this._renderSameObject(cell, idx, this.panel_jingmiList);
		},
		_renderSameObject: function (cell, idx, list) {
			var root = cell.getChildByName("root");
			if (!root) {
				root = new Sprite;
				root.pos(0, 0);
				root.name = "root";
				cell.addChild(root);
			}
			root.removeChildren();
			var sp = new Waysheet(false);
			sp.setData(list.array[idx]);
			sp.pos(0, 0);
			root.addChild(sp);
		},
		TabMainBtnStyle: function (name) {
			this.tabMainBtn.forEach(function (element) {
				if (element.name == name) {
					element.setSkinImage("assets/main/lobby/sp/tab_select.png");
					element.alpha = 1;
					var img = element.getChildByName("img");
					img.alpha = 1;
					if (element.name == "lobbyMainTab_bjl") {
						img.setImage("assets/main/lobby/sp/1-fs8.png");
					} else if (element.name == "lobbyMainTab_lhd") {
						img.setImage("assets/main/lobby/sp/3-fs8.png");
					} else if (element.name == "lobbyMainTab_sb") {
						img.setImage("assets/main/lobby/sp/5-fs8.png");
					} else if (element.name == "lobbyMainTab_yxx") {
						img.setImage("assets/main/lobby/sp/7-fs8.png");
					}
					img.pos(28, 15);
				} else {
					element.setSkinImage("assets/main/lobby/sp/tab_normal.png");
					element.alpha = .7;
					var img = element.getChildByName("img");
					img.alpha = 1;
					if (element.name == "lobbyMainTab_bjl") {
						img.setImage("assets/main/lobby/sp/2-fs8.png");
					} else if (element.name == "lobbyMainTab_lhd") {
						img.setImage("assets/main/lobby/sp/4-fs8.png");
					} else if (element.name == "lobbyMainTab_sb") {
						img.setImage("assets/main/lobby/sp/6-fs8.png");
					} else if (element.name == "lobbyMainTab_yxx") {
						img.setImage("assets/main/lobby/sp/8-fs8.png");
					}
					img.pos(47, 15);
				}
			}, this);
		},
		TabBtnStyle: function (name) {
			this.tabBtn.forEach(function (element) {
				if (element.name == name) {
					element.setSkinImage("assets/main/lobby/sp/tab_sub_select.png");
					element.labelColors = "#92dfba";
				} else {
					element.setSkinImage("assets/main/lobby/sp/tab_sub_normal.png");
					element.labelColors = "#87a2b3";
				}
			}, this);
		},
		onMainSelect: function (btn, name, callbackFunc) {
			myGlobalData.isLHD = false;
			if (name == "lobbyMainTab_bjl") {
				this.mainGameType = 1;
				for (var i = 0; i < this.tabBtn.length; i++) {
					this.tabBtn[i].width = 210;
					this.tabBtn[i].x = i * 216 - 1;
				}
				this.onSelect(null, this.tabBtn[0].name);
			} else if (name == "lobbyMainTab_lhd") {
				myGlobalData.isLHD = true;
				this.mainGameType = 2;
				for (var i = 0; i < this.tabBtn.length; i++) {
					if (i < 3) {
						this.tabBtn[i].width = 318;
						this.tabBtn[i].x = 320 * i;
					} else {
						this.tabBtn[i].visible = false;
					}
				}
				this.onSelect(null, this.tabBtn[0].name);
			} else if (name == "lobbyMainTab_sb") {
				topConfirm.ask("新功能暂未开放,敬请期待!", this, null, null);
				return;
			} else if (name == "lobbyMainTab_yxx") {
				topConfirm.ask("新功能暂未开放,敬请期待!", this, null, null);
				return;
			}
			this.TabMainBtnStyle(name);
		},
		onSelect: function (btn, name, callbackFunc) {
			if (name == "lobbyTab_Vip" && !myGlobalData.isRelease) {
				topConfirm.ask("新功能暂未开放,敬请期待!", this, null, null);
				return;
			}
			this.TabBtnStyle(name);
			this.getChildByName("panel_lhd_tab1").visible = false;
			this.getChildByName("panel_lhd_tab2").visible = false;
			this.getChildByName("panel_dragon").visible = false;
			this.getChildByName("panel_jingmi").visible = false;
			this.getChildByName("panel_vip").visible = false;
			loading.show();
			if (name == "lobbyTab_julong") {
				if (this.mainGameType == 1) {
					this.getChildByName("panel_dragon").visible = true;
					roomMgr.getAllRoomData(this, function (errorCode) {
						loading.hide();
						if (errorCode == ERROR_CODE.OK) {
							this._refresh();
							if (callbackFunc != null) {
								callbackFunc();
							}
						} else {
							showTips(Localization.getAllRoomDataFail);
						}
					}, 1);
				} else if (this.mainGameType == 2) {
					this.getChildByName("panel_lhd_tab1").visible = true;
					roomMgr.getAllRoomData(this, function (errorCode) {
						loading.hide();
						if (errorCode == ERROR_CODE.OK) {
							this._refresh();
							if (callbackFunc != null) {
								callbackFunc();
							}
						} else {
							showTips(Localization.getAllRoomDataFail);
						}
					}, 1008);
				}
			} else if (name == "lobbyTab_jingmi") {
				if (this.mainGameType == 1) {
					this.getChildByName("panel_jingmi").visible = true;
					roomMgr.getAllRoomData(this, function (errorCode) {
						loading.hide();
						if (errorCode == ERROR_CODE.OK) {
							this._refresh();
							if (callbackFunc != null) {
								callbackFunc();
							}
						} else {
							showTips(Localization.getAllRoomDataFail);
						}
					}, 2);
				} else if (this.mainGameType == 2) {
					this.getChildByName("panel_lhd_tab2").visible = true;
					roomMgr.getAllRoomData(this, function (errorCode) {
						loading.hide();
						if (errorCode == ERROR_CODE.OK) {
							this._refresh();
							if (callbackFunc != null) {
								callbackFunc();
							}
						} else {
							showTips(Localization.getAllRoomDataFail);
						}
					}, 1009);
				}
			} else if (name == "lobbyTab_Vip") {
				var sendMsg = gtea.protobuf.encode(null, null, 1, 13);
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratGetAllRoomData * 168, 1, 13, "ReplyVipRoomList");
				server.requestToGame(CMD.BaccaratGetAllRoomData * 168, sendMsg, this, function (errorcode, roomList) {
					loading.hide();
					roomMgr._roomData = roomList.List;
					var transData = [];
					for (var i = 0; i < roomMgr._roomData.length; i++) {
						var _data = roomMgr._roomData[i];
						var _trance = {};
						_trance.roomId = _data.RoomId;  //房间id
						//1002 1004 竞咪厅 1001 1003 其它
						_trance.baccaratRoomType = 3;  //百家乐房间类型    
						_trance.upToBanker = 1;  //是否可以上庄
						_trance.bankerMinMoney = 0; //上庄最小金额
						_trance.bankerFarmerBetMin = 0; //庄，闲区单人最小下注
						_trance.otherBetMin = 0; //和，庄对，闲对区单人最小下注
						_trance.allBankerFarmerBetMax = 0; //庄，闲区所有玩家下注之和最大值
						_trance.allDeuceBetMax = 0; //和区所有玩家下注之和最大值
						_trance.allFarmerPairBetMax = 0; //闲对区所有玩家下注之和最大值
						_trance.allBankerPairBetMax = 0; //庄对区所有玩家下注之和最大值
						_trance.playerNum = _data.PlayerCount;  //房间玩家数量
						_trance.roundResults = [], //回合结果记录
							_trance.seatMinMoney = _data.ChipsRange; //入座最小金币
						transData[i] = _trance;
					}
					roomMgr._roomData = transData;

					this.getChildByName("panel_vip").visible = true;
					this._resetVIPPanel();

					if (callbackFunc != null) {
						callbackFunc();
					}
				});
			}
		},
		OnClickVip: function (btn) {
			if (btn.name == "btn_createRoom") {
				this.getChildByName("createVip").visible = true;
				this.getChildByName("createVip").initUI();
			} else if (btn.name == "btn_getinRoom") {
				this.getChildByName("addInRoom").visible = true;
				this.getChildByName("addInRoom").initUI();
			}
		},
		setUserHead: function (headIdx) {
			this.getChildByName("top_bar", "player_head").setSkinImage("assets/main/head/userhead_" + headIdx + ".png");
		},
		setUserName: function (name) {
			this.getChildByName("top_bar", "player_name").text = name;
		},
		setUserGold: function (gold, bankGold) {
			var numGold = playerDataMgr.getMyGold();
			var carryGold = playerDataMgr.getMyCarryGold();
			var numGold = parseInt(numGold * 100 - carryGold * 100) / 100;
			if (numGold > 1e6) {
				numGold = Math.floor(numGold / 1e4) + uiLocallization.wan;
			} else {
				numGold = uiUtils.getFloatByPower(numGold, 2);
			}
			if (carryGold > 1e6) {
				carryGold = Math.floor(carryGold / 1e4) + uiLocallization.wan;
			} else {
				carryGold = uiUtils.getFloatByPower(carryGold, 2);
			}
			if (carryGold <= 0) carryGold = 0;
			this.getChildByName("top_bar", "gold_carry").text = uiLocallization.carryOnGold + carryGold;
			this.getChildByName("top_bar", "gold_value").text = uiLocallization.deposit + numGold;
		},
		setUserVip: function (vipLevel) {
			var labelText = "VIP" + vipLevel;
			if (vipLevel === 0) {
				labelText = "平民";
			}
			this.getChildByName("top_bar", "vip_level").text = labelText;
		},
		updateMyInfo: function () {
			this.setUserGold(playerDataMgr.getMyGold());
			this.setUserVip(playerDataMgr.getMyVIPLevel());
		},
		setUnreadMailCount: function (count) { },
		addGold: function () {
			if (platformManager.bExamine()) {
				this.getChildByName("bankCharge").visible = true;
			} else {
				this.getChildByName("bankSetting").visible = true;
				this.getChildByName("bankSetting").eventUpdateMyDeposit();
			}
		},
		onClickHead: function () {
			this.eventOpenAccountSafe(true);
		},
		OnClick: function (btn, name) {
			if (name == "lobby_play") {
				var roomList = roomMgr.getRoomList();
				if (roomList) {
					var index = Math.floor(Math.abs(Math.random()) * roomList.length);
					roomMgr.setChoose(roomList[index]);
				}
				roomMgr.joinRoom();
			}
		},
		jumpMenuButton: function (btn, path) {
			this.runCommand("jump_menu", path);
		},
		onBoardCastMessage: function (context) {
			this.messageBar.clear();
			this.messageBar.setText(context);
		},
		getCurrentPath: function () {
			var gameList = this.getChildByName("list");
			return gameList.path;
		},
		gameListBack: function () {
			var gameList = this.getChildByName("list");
			gameList.back();
		},
		end: function () {
			this._super();
			this.unsubscribe("global.trumpet.update", this, this.onBoardCastMessage);
		}
	});
	return LobbyUI;
});
gbx.define("game/lobby/ui/login", ["conf/system", "comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/button", "gbx/render/ui/textinput", "gbx/render/ui/checkbox", "gbx/bridge", "comm/ui/top_message", "conf/version", "conf/ui_locallization", "comm/helper/playerdata_mgr", "comm/helper/account_mgr", "game/lobby/parts/find_password", "game/lobby/parts/country_code", "conf/platform", "gbx/hubs", "comm/ui/ui_utils", "gbx/net/net_tool", "gbx/net/errorcode_des", "game/lobby/parts/password"], function (sys, BaseUI, Sprite, Animation, Text, Button, TextInput, Checkbox, bridge, topMessage, version, uiLocallization, playerDataMgr, accountMgr, FindPasswordForm, countryCode, Platform, hubs, uiUtils, netTool, ERROR_CODE_DES, PasswordForm) {
	var LoginUI = BaseUI.extend({
		init: function (account, pass, country, checkAccount, checkPassword) {
			this._super();
			this._type = "login";
			this._getVCLeftTime = 0;
			this._locked = false;
			if (!country) country = "86";
			accountMgr.getUserData().country = country;
			this.setImage("assets/main/login/login_bg.jpg");
			var sx = 198;
			var sy = 330;
			var myVer = new Text;
			myVer.text = "resource version: " + version.version;
			myVer.color = "#ffffff";
			myVer.pos(18, 45);
			this.addChild(myVer);
			var gameVer = new Text;
			gameVer.text = "game version: " + bridge.getVersion();
			gameVer.color = "#ffffff";
			gameVer.pos(18, 25);
			this.addChild(gameVer);
			var intoSp = new Sprite;
			intoSp.pos(332, 320);
			intoSp.name = "login_into";
			intoSp.visible = false;
			this.addChild(intoSp);
			var text = new Text;
			text.text = uiLocallization.now_get_in_game;
			text.color = "#ffffff";
			text.fontSize = 24;
			text.align = "center";
			text.width = 200;
			text.pos(-100, 250);
			intoSp.addChild(text);

			var userLoginBtn = new Button;
			userLoginBtn.label = "开始游戏";
			userLoginBtn.labelColors = "#ffffff,#ffffff,#ffffff";
			userLoginBtn.labelSize = 40;
			userLoginBtn.labelPadding = "-20,0,0,0";
			userLoginBtn.setSkinImage("assets/main/login/sss4-fs8.png");
			userLoginBtn.stateNum = 1;
			userLoginBtn.pivotToCenter();
			userLoginBtn.pos(330, 740);
			userLoginBtn.setClickHandler(this, this.onClickUserLogin);
			this.addChild(userLoginBtn);

			var passwordForm = new PasswordForm;
			passwordForm.pos(68, 280);
			passwordForm.zOrder = 2;
			passwordForm.visible = false;
			passwordForm.name = "password_form";
			this.addChild(passwordForm);
			var findPasswordForm = new FindPasswordForm;
			findPasswordForm.pos(47, 280);
			findPasswordForm.zOrder = 2;
			findPasswordForm.visible = false;
			findPasswordForm.name = "findPasswordForm";
			this.addChild(findPasswordForm);
			this.subscribe("lobby.login.gueststate", this, this.eventGuestState);
		},
		setSpriteNum: function (numStr) {
			var plus = this.getChildByName("register_form", "plus");
			plus.text = "+" + numStr;
		},
		_renderCountryCode: function (cell, idx) {
			var data = this.getChildByName("countryPanel", "listCountry").array;
			if (idx >= data.length) return;
			var root = cell.getChildByName("root");
			if (!root) {
				var root = new Sprite;
				root.name = "root";
				cell.addChild(root);
				var str = data[idx];
				var arr = str.split(",");
				var lab = uiUtils.createSimpleText(arr[0]);
				lab.pos(0, 10);
				lab.color = "#ffffff";
				lab.fontSize = 27;
				root.addChild(lab);

				function selectOne(btn, param) {
					accountMgr.getUserData().country = param[1];
					this.setSpriteNum(param[1]);
					this.getChildByName("country_form", "country").text = param[0];
					this.getChildByName("countryPanel").visible = false;
				}
				var btn = new Button;
				btn.size(250, 45);
				btn.pos(0, 0);
				btn.setClickHandler(this, selectOne, arr);
				root.addChild(btn);
			}
		},
		_getCountryByCode: function (code) {
			var array = countryCode.getCountryCode();
			for (var i = 0; i < array.length; i++) {
				var arr = array[i].split(",");
				if (arr[1] == code) return arr[0];
			}
			return null;
		},
		unlock: function () {
			this._locked = false;
			this.getChildByName("login_into").visible = false;
		},
		showInto: function () {
			this.getChildByName("login_into").visible = true;
		},
		eventGuestState: function () {
			var loginForm = this.getChildByName("login_form");
			var guestLogin = loginForm.getChildByName("guestLoginBtn");
			var txtUsername = loginForm.getChildByName("txt_username");
			if (accountMgr.getGuestState()) {
				guestLogin.visible = true;
				txtUsername.size(180, 50);
			} else {
				guestLogin.visible = false;
				txtUsername.size(250, 50);
			}
		},
		onClickCountry: function (btn) {
			if (btn.name == "choose_country_btn") this.getChildByName("countryPanel").visible = true;
			else if (btn.name == "maskBtn_1") this.getChildByName("countryPanel").visible = false;
		},
		onClickGuestLogin: function () {
			if (this._locked) return;
			this._locked = true;
			this.runCommand("sms_guestlogin");
		},
		onClickUserLogin: function () {
			if (this._locked) return;
			this._locked = true;
			this.runCommand("sms_login", "玩家" + parseInt(Math.random() * 999), "123456", "cbUsername", "cbPassword");
		},
		onClickFindPass: function () {
			this.getChildByName("findPasswordForm").reset();
			this.getChildByName("findPasswordForm").visible = true;
		},
		onClickTurnToSignup: function () {
			this.toggleForm("register");
		},
		onClickTurnToLogin: function () {
			this.toggleForm("login");
		},
		toggleForm: function (type) {
			if (type === "login") {
				this._type = type;
				this.getChildByName("login_form").visible = true;
				this.getChildByName("register_form").visible = false;
			} else if (type === "register") {
				this._type = type;
				this.getChildByName("login_form").visible = false;
				this.getChildByName("register_form").visible = true;
			}
		},
		startVerifyCodeTick: function () {
			this._getVCLeftTime = 90;
			this.verifyCodeTick();
			this.timerLoop(1e3, this, this.verifyCodeTick);
		},
		stopVerifyCodeTick: function () {
			this._getVCLeftTime = 0;
			this.clearTimer(this, this.verifyCodeTick);
			var btn = this.getChildByName("register_form", "getVerifyCode");
			btn.gray = false;
			btn.getChildByName("word").visible = true;
			btn.getChildByName("count").text = "";
		},
		verifyCodeTick: function () {
			var btn = this.getChildByName("register_form", "getVerifyCode");
			if (this._getVCLeftTime > 0) {
				this._getVCLeftTime = this._getVCLeftTime - 1;
				btn.gray = true;
				btn.getChildByName("word").visible = false;
				btn.getChildByName("count").text = uiLocallization.time_count_down + this._getVCLeftTime;
			} else {
				this._getVCLeftTime = 0;
				btn.gray = false;
				btn.getChildByName("word").visible = false;
				btn.getChildByName("count").text = uiLocallization.resend;
			}
		},
		onClickGetVerifyCode: function () {
			var phone = this.getChildByName("register_form", "txt_phone").text;
			if (phone.length == 0) {
				topMessage.post(uiLocallization.phone_can_not_void);
				return;
			}
			var cc = accountMgr.getUserData().country;
			var newCC = "";
			for (var i = 4; i > cc.length; i--) {
				newCC += "0";
			}
			newCC += cc;
			var phoneNumber = newCC + "-" + phone;

			function getSuccess(ret) {
				topMessage.post(JSON.parse(ret).desc);
				this.startVerifyCodeTick();
			}

			function getFail(status, error) {
				topMessage.post("获取验证码失败");
				this.unlock();
			}
			netTool.getVerifyCode("User/SendSMS", this, getSuccess, getFail, phoneNumber);
		},
		onClickTurnToPasswordForm: function () {
			var phone = this.getChildByName("register_form", "txt_phone").text;
			if (phone.length == 0) {
				topMessage.post(uiLocallization.phone_can_not_void);
				return;
			}
			var verifyCode = this.getChildByName("register_form", "txt_verifyCode").text;
			if (verifyCode.length == 0) {
				topMessage.post(uiLocallization.verify_code_can_not_void);
				return;
			}
			if (this._getVCLeftTime <= 0) {
				topMessage.post(uiLocallization.time_no_use);
				return;
			}
			this.stopVerifyCodeTick();
			this.getChildByName("password_form").reset();
			this.getChildByName("password_form").visible = true;
		},
		eventUserSign: function (pass) {
			var phone = this.getChildByName("register_form", "txt_phone").text;
			var cc = accountMgr.getUserData().country;
			var newCC = "";
			for (var i = 4; i > cc.length; i--) {
				newCC += "0";
			}
			newCC += cc;
			var phoneNumber = newCC + "-" + phone;
			var verifyCode = this.getChildByName("register_form", "txt_verifyCode").text;
			var success = function () {
				this.getChildByName("password_form").registerCallback(true);
			};
			var fail = function () {
				this.getChildByName("password_form").registerCallback(false);
			};
			this.runCommand("sms_create", phoneNumber, pass, verifyCode, this, success, fail);
		},
		favourit: function () {
			var title = document.title;
			var url = document.location.href;
			var controlKey = /Mac OS/.test(navigator.userAgent) ? "COMMAND" : "CTRL";
			if (window.sidebar && window.sidebar.addPanel) {
				window.sidebar.addPanel(title, url, "");
			} else if (window.external && window.external.AddFavorite) {
				window.external.AddFavorite(url, title);
			} else {
				topMessage.post("按下 " + controlKey + " + D 加入书签");
			}
		}
	});
	return LoginUI;
});