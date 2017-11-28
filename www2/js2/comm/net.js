gbx.define("comm/net/heartbeat", ["gbx/hubs", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/connector", "comm/helper/playerdata_mgr"], function(hubs, CMD, ERROR_CODE, server, playerDataMgr) {
	var lastHeartBeatAckDate = null;
	var heartBeatTimer = null;
	return {
		startSendHeartbeat: function() {
			lastHeartBeatAckDate = new Date;
			//心跳不在此处理
			//heartBeatTimer = setInterval(this.heartbeatTick, 5e3)
		},
		stopSendHeartbeat: function() {
			if (heartBeatTimer != null) {
				clearInterval(heartBeatTimer);
				heartBeatTimer = null;
			}
		},
		heartbeatTick: function() {
			var curDate = new Date;
			var deltaTime = curDate - lastHeartBeatAckDate;
			if (deltaTime > gtea.net.TIME_OUT) {
				hubs.publish("global.net_connect.disconnected", gtea.net.DISCONNECT_REASON_HEARTBEAT);
				return;
			}
			var roomId = playerDataMgr.getRoomId();
			var proto;
			if (roomId != null) {
				proto = {
					playerId: playerDataMgr.getMyUID(),
					roomId: roomId
				};
			} else {
				proto = {
					playerId: playerDataMgr.getMyUID()
				};
			}
			var sendData = gtea.protobuf.encode("SyncHeartBeat", proto);
			server.sendToRoom(CMD.SyncHeartBeat, sendData);
		},
		onHeartbeat: function() {
			lastHeartBeatAckDate = new Date;
		}
	};
});
gbx.define("comm/net/msg_receiver", ["gbx/hubs", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/connector", "comm/helper/playerdata_mgr", "comm/helper/scene_mgr", "comm/ui/top_confirm", "conf/locallization", "comm/net/heartbeat", "platform/platform_manager", "comm/ui/connect_loading"], function(hubs, CMD, ERROR_CODE, server, playerDataMgr, sceneMgr, topConfirm, Locallization, heartbeat, platformManager, loading) {
	var eventDisconnected = function(reason) {
		gbx.log("%c[net] netWork disconnect reason " + reason, "color:blue");
		loading.hide();
		heartbeat.stopSendHeartbeat();

		function success() {
			sceneMgr.switchTo("login", false, true);
		}

		function failfun() {
			sceneMgr.switchTo("login", false, false);
		}
		if (sceneMgr.getCurrentScene() === "baccarat_table") {
			if (reason == gtea.net.DISCONNECT_REASON_TOROOM) 
				topConfirm.ask(Locallization.loseConnectReconnect, this, success, failfun);
			else 
				hubs.publish("global.net_connect.login_to_room");
		} else {
			topConfirm.ask(Locallization.loseConnectReconnect, this, success, failfun);
		}
	};
	var eventSceneChanged = function(sceneName) {
		if (sceneName === "baccarat_table") heartbeat.startSendHeartbeat();
		else heartbeat.stopSendHeartbeat();
	};
	var restartHeartbeat = function() {
		heartbeat.stopSendHeartbeat();
		heartbeat.startSendHeartbeat();
	};
	var msgReceiver = {
		isAdded: false,
		addListenerOnce: function() {
			if (!this.isAdded) {
				hubs.subscribe("global.scene.change", eventSceneChanged);
				hubs.subscribe("global.net_connect.restart_heartbeat", restartHeartbeat);
				this.isAdded = true;
			}
		},
		addListener: function() {
			hubs.subscribe("global.net_connect.disconnected", eventDisconnected);
		},
		removeListener: function() {
			hubs.unsubscribe("global.net_connect.disconnected", eventDisconnected);
		},
		onHeartbeat: function() {
			heartbeat.onHeartbeat();
		},
		onKicked: function(command, data) {
			gtea.net.NetMsgMgr.close();
			heartbeat.stopSendHeartbeat();
			var msgData = gtea.protobuf.decode("NetBeKickedInform", data);

			function callback() {
				sceneMgr.switchTo("login", false, false);
			}
			var tip = Locallization.kickedByGM;
			if (msgData.reason == 1) tip = Locallization.kickedByOther;
			topConfirm.ask(tip, this, callback, callback);
		},
		onPlayerInfoChange: function(command, data) {
			var msgData = gtea.protobuf.decode("PlayerInfoChangedProto", data);
			playerDataMgr.dealItemProto(msgData.itemProto);
			hubs.publish("lobby.game.updateMyInfo");
		},
		onPay: function(command, data) {
			var msgData = gtea.protobuf.decode("RechargeNoticeProto", data);
			if (msgData) {
				platformManager.tryRechargeItem(msgData);
			}
		}
	};
	return msgReceiver;
});