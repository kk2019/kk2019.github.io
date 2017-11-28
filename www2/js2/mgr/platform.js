gbx.define("platform/platform_manager", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/net_tool", "gbx/hubs", "conf/platform", "gbx/bridge", "comm/helper/playerdata_mgr", "conf/ui_locallization", "comm/ui/top_message", "comm/helper/conf_mgr", "comm/helper/account_mgr"], function(server, CMD, ERROR_CODE, ERROR_CODE_DES, netTool, hubs, Platform, bridge, playerDataMgr, uiLocallization, topMessage, confMgr, accountMgr) {
	var verification = function(receiptData) {
		platformManager.tryVerification(receiptData);
	};
	var addListen = function() {
		hubs.subscribe("platform.platform_manager", verification);
	};
	var platformManager = {
		init: function() {
			this._rechargeType = 2;
			this._rechargeMax = 1e3;
		},
		getRechargeType: function() {
			if (bridge.getPlatform() === "web" && this._rechargeType != Platform.recharge_type3) {
				return Platform.recharge_type3;
			}
			if (!this.bExamine() && this._rechargeType == Platform.recharge_type1) return Platform.recharge_type2;
			else return this._rechargeType;
		},
		bExamine: function() {
			return accountMgr.getGuestState();
		},
		setRechargeType: function(value) {
			this._rechargeType = value;
		},
		setRechargeMax: function(value) {
			this._rechargeMax = value;
		},
		getRechargeMax: function(value) {
			return this._rechargeMax;
		},
		tryRechargeOrder: function(shopData, UID) {
			this._rechargeConfig = shopData;
			this._UID = UID;
			this._rechargeIOSId;
			switch (Platform.myPlatformId) {
				case Platform.platformIdm:
					{
						this._rechargeIOSId = this._rechargeConfig.mIOSId;
					}
					break;
				case Platform.platformIdt:
					{
						this._rechargeIOSId = this._rechargeConfig.tIOSId;
					}
					break;
				case Platform.platformIdw:
					{
						this._rechargeIOSId = this._rechargeConfig.wIOSId;
					}
					break;
			}
			sendMsg = gtea.protobuf.encode("RechargeOrderPostData", {
				platformId: Platform.platformId,
				rechargeId: this._rechargeConfig.id
			});
			this.getOrderId(sendMsg, "iOS");
		},
		getOrderId: function(sendMsg, totalAmount) {
			var path = netTool.getPathByKey("rechargeOrderUrl");
			netTool.createHttpRequest(path, sendMsg, this, function(data) {
				var ret = gtea.protobuf.decode("RechargeOrderResult", data);
				if (ret.result == ERROR_CODE.OK) {
					var jsonPar = ret.jsonPar;
					var obj = JSON.parse(jsonPar);
					this._cpOerderId = obj.orderId;
					if (bridge.getPlatform() == "iOS" && totalAmount == "iOS") {
						bridge.payment(this._rechargeIOSId);
					} else {
						var userId = playerDataMgr.getMyUID();
						var subject = "充值" + totalAmount + "元";
						var callBack = netTool.getPathByKey("onRechargeBACCARATWebUrl");
						var remark = userId + "#" + this._cpOerderId + "#" + bridge.getPackageId();
						bridge.payH5(this._cpOerderId, totalAmount, subject, callBack, remark);
					}
				}
			}, function(status) {
				topMessage.post(" status " + status);
			});
		},
		tryRechargeItem: function(msgData) {
			gbx.log("msgData: " + JSON.stringify(msgData));
			var sendMsg = gtea.protobuf.encode("RechargeReq", {
				rechargeId: msgData.rechargeId,
				platformId: msgData.platformId,
				orderId: msgData.orderId,
				cpOrderId: msgData.cpOrderId
			});
			server.requestToGame(CMD.Recharge, sendMsg, this, function(errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					try {
						var retData = gtea.protobuf.decode("RechargeResp", data);
						var count = retData.itemProto[0].count;
						playerDataMgr.dealItemProto(retData.itemProto);
						hubs.publish("global.playerdata.update.userdata");
						topMessage.post(uiLocallization.pay_success_tip + count);
					} catch (err) {
						gbx.log("error " + err.name + " " + err.description);
					}
				} else {
					topMessage.post(ERROR_CODE_DES[data.result]);
				}
			});
		},
		tryVerification: function(receiptData) {
			var roomType = confMgr.definition.ChessRoomType.Baccarat;
			var JsonObject = {
				receipt: receiptData,
				rechargeId: this._rechargeConfig.id,
				amount: this._rechargeConfig.price,
				cpOrderId: this._cpOerderId,
				orderId: this._cpOerderId,
				userId: this._UID,
				roomType: roomType,
				flag: Platform.myPlatformId,
				packageId: bridge.getPackageId()
			};
			var str = JSON.stringify(JsonObject);
			gbx.log("JsonObject: " + str);
			var path = netTool.getPathByKey("rechargeBACCARATUrl");
			netTool.createHttpRequest(path, str, this, function(data) {}, function(status) {
				gbx.log("status: " + status);
				topMessage.post(" status " + status);
			});
		},
		tryRechargeOrder_ZhenYun: function(userId, rechargeId, price, caller, successFun) {
			var JsonObject = {
				userId: userId,
				rechargeId: rechargeId,
				price: price,
				packageId: bridge.getPackageId()
			};
			var str = JSON.stringify(JsonObject);
			var path = netTool.getPathByKey("transitBACCARATUrl");
			netTool.createJsonHttpRequest(path, str, this, function(data) {
				if (successFun) successFun.call(caller, data);
			}, function(status) {
				topMessage.post(" status " + status);
			});
		},
		tryRechargeOrder_qrCode: function(account, userId, channel, totalAmount, caller, successFun) {
			var JsonObject = {
				account: account,
				userId: userId,
				channel: channel,
				totalAmount: totalAmount,
				packageId: bridge.getPackageId()
			};
			//var str = JSON.stringify(JsonObject);
			//var path = netTool.getPathByKey("rechargeBACCARATQRUrl");
			//netTool.createJsonHttpRequest(path, str, this, function(data) {
			//	if (successFun) successFun.call(caller, data)
			//}, function(status) {
			//	topMessage.post(" status " + status)
			//})
			var url = "https://user.vipva.net/index.php/Pay/Index/?uid="+userId+"&phoneNumber="+account+"&spreadId="+channel;
			bridge.openUrl(url);
		},
		tryRechargeOrder_H5: function(terminalType, tradeIP, account, userId, channel, totalAmount, caller, successFun) {
			var JsonObject = {
				terminalType: terminalType,
				tradeIP: tradeIP,
				account: account,
				userId: userId,
				channel: channel,
				totalAmount: totalAmount,
				packageId: bridge.getPackageId()
			};
			var str = JSON.stringify(JsonObject);
			var path = netTool.getPathByKey("rechargeBACCARATWebUrl");
			netTool.createJsonHttpRequest(path, str, this, function(data) {
				if (successFun) successFun.call(caller, data);
			}, function(status) {
				topMessage.post(" status " + status);
			});
		},
		tryRechargeOrder_H5_New: function(totalAmount) {
			sendMsg = gtea.protobuf.encode("RechargeOrderPostData", {
				platformId: Platform.platformId,
				rechargeId: 110
			});
			this.getOrderId(sendMsg, totalAmount);
		}
	};
	addListen();
	return platformManager;
});